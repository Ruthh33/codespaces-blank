import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { query } from '../config/database.js';
import { CrearUsuarioPayload } from '../types/index.js';

interface CredencialesGeneradas {
  nombreUsuario: string;
  contrasenaTemp: string;
  cambiarEnPrimerLogin: boolean;
}

class UsuarioService {
  private readonly SALT_ROUNDS = 12;
  private readonly LONGITUD_CONTRASENA = 16;

  async crearUsuario(
    payload: CrearUsuarioPayload
  ): Promise<{
    usuario: any;
    credenciales: CredencialesGeneradas;
  }> {
    // 1. Validar ficha
    const fichaValida = await this.validarFicha(payload.fichaId);
    if (!fichaValida) {
      throw new Error('Ficha no válida, no existe o está expirada');
    }

    // 2. Generar credenciales
    const credenciales = await this.generarCredenciales(
      payload.primerNombre,
      payload.apellido
    );

    // 3. Hash de contraseña
    const contraseniaHash = await bcrypt.hash(
      credenciales.contrasenaTemp,
      this.SALT_ROUNDS
    );

    // 4. Crear usuario en BD
    const usuarioResult = await query(
      `INSERT INTO usuarios (
        nombre_usuario,
        contrasena_hash,
        primer_nombre,
        apellido,
        cargo,
        fecha_ingreso,
        telefono_asignado,
        modelo_dispositivo,
        numero_dispositivo,
        numero_serie_1,
        numero_serie_2,
        rol_id,
        ficha_id,
        activo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        credenciales.nombreUsuario,
        contraseniaHash,
        payload.primerNombre,
        payload.apellido,
        payload.cargo,
        payload.fechaIngreso,
        payload.telefonoAsignado || null,
        payload.modeloDispositivo || null,
        payload.numeroDispositivo || null,
        payload.numeroSerie1 || null,
        payload.numeroSerie2 || null,
        payload.rolId,
        payload.fichaId,
        true,
      ]
    );

    // 5. Marcar ficha como utilizada
    await query(
      'UPDATE fichas SET estado = $1, activa = FALSE WHERE id = $2',
      ['utilizada', payload.fichaId]
    );

    // 6. Registrar en auditoría
    await query(
      `INSERT INTO auditoria_acceso (usuario_id, accion, recurso, resultado, detalles)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        payload.adminId,
        'CREAR_USUARIO',
        `usuario:${usuarioResult.rows[0].id}`,
        'EXITOSO',
        JSON.stringify({
          nuevoUsuarioId: usuarioResult.rows[0].id,
          fichaId: payload.fichaId,
        }),
      ]
    );

    return {
      usuario: usuarioResult.rows[0],
      credenciales,
    };
  }

  async obtenerUsuarios(filtro?: string): Promise<any[]> {
    let sql = `
      SELECT 
        u.id, u.nombre_usuario, u.primer_nombre, u.apellido, 
        u.cargo, u.rol_id, u.telefono_asignado, u.modelo_dispositivo,
        u.numero_dispositivo, u.numero_serie_1, u.numero_serie_2,
        u.fecha_ingreso, u.activo, r.nombre as rol_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
      WHERE u.activo = true
    `;

    if (filtro) {
      sql += ` AND (
        LOWER(u.nombre_usuario) LIKE LOWER($1) OR
        LOWER(u.primer_nombre) LIKE LOWER($1) OR
        LOWER(u.apellido) LIKE LOWER($1) OR
        LOWER(u.cargo) LIKE LOWER($1)
      )`;
      const result = await query(sql, [`%${filtro}%`]);
      return result.rows;
    }

    const result = await query(sql);
    return result.rows;
  }

  async obtenerUsuarioPorId(usuarioId: string): Promise<any> {
    const result = await query(
      `SELECT u.*, r.nombre as rol_nombre FROM usuarios u
       LEFT JOIN roles r ON u.rol_id = r.id
       WHERE u.id = $1`,
      [usuarioId]
    );

    if (!result.rows.length) {
      throw new Error('Usuario no encontrado');
    }

    return result.rows[0];
  }

  async editarUsuario(usuarioId: string, datos: Partial<any>): Promise<any> {
    const actualizaciones: string[] = [];
    const valores: any[] = [];
    let paramIndex = 1;

    const camposPermitidos = [
      'primer_nombre',
      'apellido',
      'cargo',
      'telefono_asignado',
      'modelo_dispositivo',
      'numero_dispositivo',
      'numero_serie_1',
      'numero_serie_2',
      'rol_id',
    ];

    for (const [clave, valor] of Object.entries(datos)) {
      if (camposPermitidos.includes(clave) && valor !== undefined) {
        actualizaciones.push(`${clave} = $${paramIndex}`);
        valores.push(valor);
        paramIndex++;
      }
    }

    if (actualizaciones.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    actualizaciones.push(`fecha_modificacion = CURRENT_TIMESTAMP`);
    valores.push(usuarioId);

    const sql = `
      UPDATE usuarios
      SET ${actualizaciones.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, valores);

    if (!result.rows.length) {
      throw new Error('Usuario no encontrado');
    }

    return result.rows[0];
  }

  async desactivarUsuario(usuarioId: string, adminId: string): Promise<void> {
    const result = await query('UPDATE usuarios SET activo = false WHERE id = $1 RETURNING id', [
      usuarioId,
    ]);

    if (!result.rows.length) {
      throw new Error('Usuario no encontrado');
    }

    await query(
      `INSERT INTO auditoria_acceso (usuario_id, accion, recurso, resultado)
       VALUES ($1, $2, $3, $4)`,
      [adminId, 'DESACTIVAR_USUARIO', `usuario:${usuarioId}`, 'EXITOSO']
    );
  }

  private async generarCredenciales(
    primerNombre: string,
    apellido: string
  ): Promise<CredencialesGeneradas> {
    let baseUsuario = `${primerNombre.charAt(0)}${apellido}`.toLowerCase();
    baseUsuario = baseUsuario.replace(/[^a-z0-9]/g, '');

    let nombreUsuario = baseUsuario;
    let contador = 1;
    while (await this.usuarioExiste(nombreUsuario)) {
      nombreUsuario = `${baseUsuario}${contador}`;
      contador++;
    }

    const contrasenaTemp = this.generarContrasenaCompleja();

    return {
      nombreUsuario,
      contrasenaTemp,
      cambiarEnPrimerLogin: true,
    };
  }

  private generarContrasenaCompleja(): string {
    const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const minusculas = 'abcdefghijklmnopqrstuvwxyz';
    const numeros = '0123456789';
    const especiales = '!@#$%^&*_+-=';

    const todosLosCaracteres = mayusculas + minusculas + numeros + especiales;

    let contrasena = '';
    contrasena += mayusculas.charAt(Math.floor(Math.random() * mayusculas.length));
    contrasena += minusculas.charAt(Math.floor(Math.random() * minusculas.length));
    contrasena += numeros.charAt(Math.floor(Math.random() * numeros.length));
    contrasena += especiales.charAt(Math.floor(Math.random() * especiales.length));

    for (let i = 4; i < this.LONGITUD_CONTRASENA; i++) {
      contrasena += todosLosCaracteres.charAt(
        Math.floor(Math.random() * todosLosCaracteres.length)
      );
    }

    return contrasena
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  private async validarFicha(fichaId: string): Promise<boolean> {
    const result = await query(
      `SELECT * FROM fichas 
       WHERE id = $1 AND activa = true AND estado = 'activa'
       AND (fecha_vencimiento IS NULL OR fecha_vencimiento > CURRENT_DATE)`,
      [fichaId]
    );
    return result.rows.length > 0;
  }

  private async usuarioExiste(nombreUsuario: string): Promise<boolean> {
    const result = await query(
      'SELECT id FROM usuarios WHERE nombre_usuario = $1',
      [nombreUsuario]
    );
    return result.rows.length > 0;
  }
}

export default new UsuarioService();
