import { Router, Response } from 'express';
import { autenticar, autorizar, validarRol, AuthRequest } from '../middleware/auth.js';
import UsuarioService from '../services/UsuarioService.js';

const router = Router();

/**
 * POST /api/usuarios
 * Crear nuevo usuario (solo Administrador)
 */
router.post(
  '/',
  autenticar,
  validarRol(['Administrador']),
  autorizar(['crear_usuario']),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.usuario) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const {
        fichaId,
        primerNombre,
        apellido,
        cargo,
        fechaIngreso,
        telefonoAsignado,
        modeloDispositivo,
        numeroDispositivo,
        numeroSerie1,
        numeroSerie2,
        rolId,
      } = req.body;

      if (!fichaId || !primerNombre || !apellido || !cargo || !fechaIngreso || !rolId) {
        return res.status(400).json({
          error: 'Campos requeridos: fichaId, primerNombre, apellido, cargo, fechaIngreso, rolId',
        });
      }

      const { usuario, credenciales } = await UsuarioService.crearUsuario({
        fichaId,
        primerNombre,
        apellido,
        cargo,
        fechaIngreso,
        telefonoAsignado,
        modeloDispositivo,
        numeroDispositivo,
        numeroSerie1,
        numeroSerie2,
        rolId,
        adminId: req.usuario.usuarioId,
      });

      res.status(201).json({
        mensaje: 'Usuario creado exitosamente',
        usuario: {
          id: usuario.id,
          nombre_usuario: usuario.nombre_usuario,
          nombre: `${usuario.primer_nombre} ${usuario.apellido}`,
          cargo: usuario.cargo,
          rol_id: usuario.rol_id,
        },
        credenciales: {
          nombreUsuario: credenciales.nombreUsuario,
          contrasenaTemp: credenciales.contrasenaTemp,
          advertencia: 'GUARDA ESTAS CREDENCIALES - Solo se muestran una vez',
        },
      });
    } catch (error: any) {
      console.error('Error creando usuario:', error);
      res.status(400).json({ error: error.message || 'Error al crear usuario' });
    }
  }
);

/**
 * GET /api/usuarios
 * Listar usuarios
 */
router.get(
  '/',
  autenticar,
  autorizar(['ver_usuarios']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { filtro } = req.query;
      const usuarios = await UsuarioService.obtenerUsuarios(
        filtro ? String(filtro) : undefined
      );
      res.json(usuarios);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/usuarios/:id
 * Obtener un usuario específico
 */
router.get(
  '/:id',
  autenticar,
  autorizar(['ver_usuarios']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = await UsuarioService.obtenerUsuarioPorId(id);
      res.json(usuario);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
);

/**
 * PUT /api/usuarios/:id
 * Editar usuario
 */
router.put(
  '/:id',
  autenticar,
  autorizar(['editar_usuario']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = await UsuarioService.editarUsuario(id, req.body);
      res.json({
        mensaje: 'Usuario actualizado exitosamente',
        usuario: {
          id: usuario.id,
          nombre_usuario: usuario.nombre_usuario,
          nombre: `${usuario.primer_nombre} ${usuario.apellido}`,
          cargo: usuario.cargo,
          rol_id: usuario.rol_id,
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * DELETE /api/usuarios/:id
 * Desactivar usuario (soft delete)
 */
router.delete(
  '/:id',
  autenticar,
  validarRol(['Administrador']),
  autorizar(['eliminar_usuario']),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.usuario) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { id } = req.params;
      await UsuarioService.desactivarUsuario(id, req.usuario.usuarioId);

      res.json({ mensaje: 'Usuario desactivado exitosamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;
