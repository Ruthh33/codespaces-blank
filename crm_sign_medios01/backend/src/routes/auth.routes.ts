import { Router, Response } from 'express';
import { AuthRequest, capturarIP } from '../middleware/auth.js';
import AuthService from '../services/AuthService.js';

const router = Router();

/**
 * POST /api/auth/login
 * Autenticar usuario y obtener JWT
 */
router.post('/login', capturarIP, async (req: AuthRequest, res: Response) => {
  try {
    const { nombreUsuario, contrasena } = req.body;

    if (!nombreUsuario || !contrasena) {
      return res.status(400).json({
        error: 'nombre_usuario y contrasena son requeridos',
      });
    }

    const ipOrigen = (req as any).ipOrigen || 'DESCONOCIDO';
    const resultado = await AuthService.login({
      nombreUsuario,
      contrasena,
      ipOrigen,
    });

    res.json(resultado);
  } catch (error: any) {
    console.error('Error en login:', error);
    res.status(401).json({ error: error.message || 'Error de autenticación' });
  }
});

/**
 * POST /api/auth/verificar
 * Verificar si un JWT es válido
 */
router.post('/verificar', async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    const payload = await AuthService.verificarToken(token);
    res.json({ valido: true, payload });
  } catch (error: any) {
    res.status(401).json({ valido: false, error: error.message });
  }
});

/**
 * GET /api/auth/me
 * Obtener información del usuario autenticado
 */
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    res.json({
      usuario: {
        id: req.usuario.usuarioId,
        nombreUsuario: req.usuario.nombreUsuario,
        rol: req.usuario.rol,
      },
      permisos: req.usuario.permisos,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
