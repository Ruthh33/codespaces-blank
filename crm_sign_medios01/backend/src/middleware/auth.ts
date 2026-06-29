import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenPayload, AuthRequest } from '../types/index.js';
import { query } from '../config/database.js';

export const autenticar = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    req.usuario = decoded;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export const autorizar = (permisosRequeridos: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const tienePermiso = permisosRequeridos.some((permiso) =>
      req.usuario?.permisos.includes(permiso)
    );

    if (!tienePermiso) {
      console.warn(
        `Acceso denegado: Usuario ${req.usuario.usuarioId} intentó acceder sin permisos: ${permisosRequeridos.join(', ')}`
      );

      // Registrar intento fallido
      query(
        `INSERT INTO auditoria_acceso (usuario_id, accion, resultado, detalles)
         VALUES ($1, $2, $3, $4)`,
        [
          req.usuario.usuarioId,
          'ACCESO_DENEGADO',
          'NO_AUTORIZADO',
          JSON.stringify({
            permisosRequeridos,
            permisosDisponibles: req.usuario.permisos,
          }),
        ]
      ).catch((err) => console.error('Error registrando acceso denegado:', err));

      return res.status(403).json({ 
        error: 'No tienes permisos para acceder a este recurso',
        permisosRequeridos,
      });
    }

    next();
  };
};

export const validarRol = (rolesPermitidos: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      console.warn(
        `Rol inválido: Usuario ${req.usuario.usuarioId} con rol ${req.usuario.rol} intentó acceder`
      );

      return res.status(403).json({ 
        error: 'Tu rol no tiene acceso a este recurso',
        rolesPermitidos,
        rolActual: req.usuario.rol,
      });
    }

    next();
  };
};

export const capturarIP = (req: AuthRequest, res: Response, next: NextFunction) => {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress ||
    'DESCONOCIDO';
  (req as any).ipOrigen = ip;
  next();
};
