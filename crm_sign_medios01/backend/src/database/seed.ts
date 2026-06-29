import { query } from '../config/database.js';
import bcrypt from 'bcrypt';

async function seedDatabase() {
  try {
    console.log('Sembrando datos iniciales...');

    // 1. Insertar roles
    console.log('  Creando roles...');
    const rolResult = await query(`
      INSERT INTO roles (nombre, descripcion, nivel_acceso, activo)
      VALUES 
        ('Administrador', 'Acceso total al sistema', 10, TRUE),
        ('Supervisor', 'Acceso a supervisión y reportes', 5, TRUE),
        ('Agente', 'Acceso limitado a funcionalidades asignadas', 1, TRUE)
      ON CONFLICT (nombre) DO NOTHING
      RETURNING id, nombre
    `);

    const roles = await query('SELECT id, nombre FROM roles');
    const roleMap: Record<string, string> = {};
    roles.rows.forEach((r: any) => {
      roleMap[r.nombre] = r.id;
    });

    // 2. Insertar permisos
    console.log('  Creando permisos...');
    const permisos = [
      // Módulo de Usuarios
      { nombre: 'crear_usuario', descripcion: 'Crear nuevos usuarios', modulo: 'usuarios', accion: 'CREATE' },
      { nombre: 'editar_usuario', descripcion: 'Editar información de usuarios', modulo: 'usuarios', accion: 'UPDATE' },
      { nombre: 'eliminar_usuario', descripcion: 'Eliminar usuarios', modulo: 'usuarios', accion: 'DELETE' },
      { nombre: 'ver_usuarios', descripcion: 'Listar usuarios', modulo: 'usuarios', accion: 'READ' },

      // Módulo de Reportes
      { nombre: 'ver_reportes', descripcion: 'Acceder a reportes', modulo: 'reportes', accion: 'READ' },
      { nombre: 'crear_reportes', descripcion: 'Crear nuevos reportes', modulo: 'reportes', accion: 'CREATE' },
      { nombre: 'exportar_datos', descripcion: 'Exportar datos del sistema', modulo: 'reportes', accion: 'EXPORT' },

      // Módulo de Configuración
      { nombre: 'configurar_sistema', descripcion: 'Acceder a configuración', modulo: 'configuracion', accion: 'UPDATE' },
      { nombre: 'ver_auditoria', descripcion: 'Acceder a logs de auditoría', modulo: 'auditoria', accion: 'READ' },
    ];

    for (const permiso of permisos) {
      await query(
        `INSERT INTO permisos (nombre, descripcion, modulo, accion)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (nombre) DO NOTHING`,
        [permiso.nombre, permiso.descripcion, permiso.modulo, permiso.accion]
      );
    }

    const permisosResult = await query('SELECT id, nombre FROM permisos');
    const permisoMap: Record<string, string> = {};
    permisosResult.rows.forEach((p: any) => {
      permisoMap[p.nombre] = p.id;
    });

    // 3. Asignar permisos a roles
    console.log('  Asignando permisos a roles...');

    // Administrador: todos los permisos
    for (const permiso of permisos) {
      await query(
        `INSERT INTO rol_permisos (rol_id, permiso_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [roleMap['Administrador'], permisoMap[permiso.nombre]]
      );
    }

    // Supervisor: usuarios, reportes y auditoría
    const permisosSupervisor = [
      'ver_usuarios', 'editar_usuario', 'ver_reportes',
      'crear_reportes', 'exportar_datos', 'ver_auditoria'
    ];
    for (const permiso of permisosSupervisor) {
      await query(
        `INSERT INTO rol_permisos (rol_id, permiso_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [roleMap['Supervisor'], permisoMap[permiso]]
      );
    }

    // Agente: solo lectura
    const permisosAgente = ['ver_usuarios', 'ver_reportes'];
    for (const permiso of permisosAgente) {
      await query(
        `INSERT INTO rol_permisos (rol_id, permiso_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [roleMap['Agente'], permisoMap[permiso]]
      );
    }

    // 4. Crear fichas de prueba
    console.log('  Creando fichas...');
    const fichas = [
      { codigo: 'FICHA-001', tipo: 'Dispositivo Móvil' },
      { codigo: 'FICHA-002', tipo: 'Dispositivo Móvil' },
      { codigo: 'FICHA-003', tipo: 'Dispositivo Móvil' },
    ];

    for (const ficha of fichas) {
      await query(
        `INSERT INTO fichas (codigo_ficha, tipo_dispositivo, estado, fecha_emision, activa)
         VALUES ($1, $2, $3, CURRENT_DATE, TRUE)
         ON CONFLICT (codigo_ficha) DO NOTHING`,
        [ficha.codigo, ficha.tipo, 'activa']
      );
    }

    // 5. Crear usuarios de prueba
    console.log('  Creando usuarios...');
    const hashAdmin = await bcrypt.hash('Admin@2026', 12);
    const hashSupervisor = await bcrypt.hash('Supervisor@2026', 12);

    await query(
      `INSERT INTO usuarios 
       (nombre_usuario, contrasena_hash, primer_nombre, apellido, cargo, fecha_ingreso, rol_id, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
       ON CONFLICT (nombre_usuario) DO NOTHING`,
      [
        'admin',
        hashAdmin,
        'Administrador',
        'Sistema',
        'Admin',
        new Date('2024-01-01'),
        roleMap['Administrador'],
      ]
    );

    await query(
      `INSERT INTO usuarios 
       (nombre_usuario, contrasena_hash, primer_nombre, apellido, cargo, fecha_ingreso, rol_id, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
       ON CONFLICT (nombre_usuario) DO NOTHING`,
      [
        'supervisor',
        hashSupervisor,
        'Juan',
        'Supervisor',
        'Supervisor',
        new Date('2024-01-15'),
        roleMap['Supervisor'],
      ]
    );

    console.log('✓ Base de datos sembrada exitosamente');
  } catch (error) {
    console.error('✗ Error al sembrar base de datos:', error);
    process.exit(1);
  }
}

seedDatabase();
