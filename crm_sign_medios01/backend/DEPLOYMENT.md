# Guía de Deployment

## 🚀 Preparar para Producción

### 1. Variables de Entorno Producción

Crear `.env.production`:

```env
# Database
DATABASE_URL=postgresql://usuario:contraseña_segura@db.ejemplo.com:5432/crm_prod
DB_HOST=db.ejemplo.com
DB_PORT=5432
DB_USER=crm_user
DB_PASSWORD=contraseña_muy_segura_aqui
DB_NAME=crm_prod

# JWT
JWT_SECRET=usa_una_clave_segura_de_al_menos_32_caracteres_aqui_xyz123abc456
JWT_EXPIRY=24h

# Server
PORT=3001
NODE_ENV=production

# CORS
FRONTEND_URL=https://tudominio.com

# Logging
LOG_LEVEL=info
```

### 2. Compilar TypeScript

```bash
npm run build
```

Esto generará la carpeta `dist/` con el código compilado.

### 3. Opciones de Deployment

#### A) Heroku

```bash
# 1. Crear Procfile
echo "web: npm start" > Procfile

# 2. Git push
git push heroku main

# 3. Variables de entorno
heroku config:set JWT_SECRET="tu_secreto"
heroku config:set DATABASE_URL="postgresql://..."
```

#### B) Railway

```bash
# 1. Conectar repositorio
railway link

# 2. Crear base de datos PostgreSQL
railway add

# 3. Deploy
railway up
```

#### C) DigitalOcean App Platform

```bash
# 1. Crear app.yaml
cat > app.yaml << EOF
name: crm-backend
services:
  - name: api
    github:
      branch: main
      repo: usuario/repo
    build_command: npm run build
    run_command: npm start
    envs:
      - key: DATABASE_URL
        scope: RUN_AND_BUILD_TIME
        value: postgresql://...
      - key: JWT_SECRET
        scope: RUN_AND_BUILD_TIME
        value: ${JWT_SECRET}
EOF

# 2. Deploy
doctl apps create --spec app.yaml
```

#### D) Docker + Self-hosted

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

ENV NODE_ENV=production

EXPOSE 3001

CMD ["npm", "start"]
```

```bash
# Build image
docker build -t crm-backend:latest .

# Run container
docker run -d \
  --name crm-backend \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  crm-backend:latest
```

### 4. Seguridad en Producción

#### SSL/HTTPS
```typescript
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem'),
};

https.createServer(options, app).listen(PORT);
```

#### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: 'Demasiadas solicitudes desde esta IP',
});

app.use('/api/', limiter);
```

#### Security Headers
```typescript
import helmet from 'helmet';

app.use(helmet());
```

#### CORS Restrictivo
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 5. Monitoreo y Logging

#### Winston Logger
```bash
npm install winston
```

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'crm-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

### 6. Backup de Base de Datos

```bash
# Backup diario con cron
0 2 * * * pg_dump $DATABASE_URL > /backups/crm_$(date +\%Y\%m\%d).sql

# Restore
psql $DATABASE_URL < /backups/crm_backup.sql
```

### 7. CI/CD con GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run build
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Production
        uses: railway-app/cli-action@v1
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        with:
          service: crm-backend
```

### 8. Checklist de Deployment

- [ ] Compilar código TypeScript (`npm run build`)
- [ ] Configurar variables de entorno en producción
- [ ] Crear backup de base de datos existente
- [ ] Validar certificados SSL
- [ ] Configurar rate limiting
- [ ] Habilitar HTTPS
- [ ] Configurar monitoreo y logging
- [ ] Pruebas de endpoints principales
- [ ] Verificar CORS configurado correctamente
- [ ] Documentar credenciales de acceso
- [ ] Configurar alertas de error
- [ ] Plan de disaster recovery

### 9. Monitoreo en Tiempo Real

```bash
# Ver logs en tiempo real
npm run logs

# Health check
curl https://tudominio.com/health

# Verificar endpoints
curl -H "Authorization: Bearer {token}" https://tudominio.com/api/usuarios
```

### 10. Rollback en caso de emergencia

```bash
# Volver a versión anterior
git revert {commit_hash}
git push production main

# O mantener versiones etiquetadas
git tag v1.0.0
git push --tags
```
