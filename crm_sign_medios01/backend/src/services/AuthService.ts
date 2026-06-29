import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { LoginPayload, TokenPayload } from '../types/index.js';

class AuthService {
  async login(payload: LoginPayload): Promise<{
    token: string;
    usuario: any;
    permisos: string[];
  }> {
    // 1. Validar existencia del usuario
    const usuarioResult = await query(
      'SELECT * FROM usuarios WHERE nombre_usuario = $1 AND activo = true',
      [payload.nombreUsuario]
    );

    if (!usuarioResult.rows.length) {
      // Registrar intento fallido
      await query(
        `INSERT INTO auditoria_acceso (accion, resultado, ip_origen, detalles)
         VALUES ($1, $2, $3, $4)`,
        [
          'LOGIN_FALLIDO',
          'USUARIO_NO_ENCONTRADO',
          payload.ipOrigen,
          JSON.stringify({ usuario: payload.nombreUsuario }),
        ]
      ).catch(console.error);

      throw new Error('Usuario o contraseña inválida');
    }

    const usuarioData = usuarioResult.rows[0];

    // 2. Validar contraseña
    const contrasenaValida = await bcrypt.compare(
      payload.contrasena,
      usuarioData.contrasena_hash
    );

    if (!contrasenaValida) {
      await query(
        `INSERT INTO auditoria_acceso (usuario_id, accion, resultado, ip_origen)
         VALUES ($1, $2, $3, $4)`,
        [usuarioData.id, 'LOGIN_FALLIDO', 'CONTRASENA_INCORRECTA', payload.ipOrigen]
      ).catch(console.error);

      throw new Error('Usuario o contraseña inválida');
    }

    // 3. Obtener rol y permisos
    const permisos = await this.obtenerPermisosUsuario(usuarioData.rol_id);

    // 4. Generar JWT
    const tokenPayload: TokenPayload = {
      usuarioId: usuarioData.id,
      nombreUsuario: usuarioData.nombre_usuario,
      rol: usuarioData.rol_id,
      permisos: permisos.map((p) => p.nombre),
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRY || '24h',
    });

    // 5. Registrar login exitoso
    await query(
      `INSERT INTO auditoria_acceso (usuario_id, accion, resultado, ip_origen)
       VALUES ($1, $2, $3, $4)`,
      [usuarioData.id, 'LOGIN_EXITOSO', 'AUTORIZADO', payload.ipOrigen]
    ).catch(console.error);

    return {
      token,
      usuario: {
        id: usuarioData.id,
        nombreUsuario: usuarioData.nombre_usuario,
        nombre: `${usuarioData.primer_nombre} ${usuarioData.apellido}`,
        rol: usuarioData.rol_id,
      },
      permisos: permisos.map((p) => p.nombre),
    };
  }

  async verificarToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  private async obtenerPermisosUsuario(rolId: string): Promise<any[]> {
    const result = await query(
      `SELECT p.* FROM permisos p
       INNER JOIN rol_permisos rp ON rp.permiso_id = p.id
       WHERE rp.rol_id = $1`,
      [rolId]
    );
    return result.rows;
  }
}

export default new AuthService();
