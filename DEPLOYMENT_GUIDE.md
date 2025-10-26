# 🚀 Guía de Deployment - HackMTY AI Finance

## Opción 1: Vercel (RECOMENDADO)

### Preparación del código:
```bash
# 1. Crear repositorio en GitHub
# 2. Subir tu código
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/hackmty-ai-finance.git
git push -u origin main
```

### Deployment:
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu cuenta de GitHub
3. Importa tu repositorio
4. Configura las variables de entorno:
   - `GEMINI_API_KEY=tu_api_key_aqui`
   - `NODE_ENV=production`

### Configuración para Full-Stack:
- Frontend se despliega automáticamente
- Backend se puede desplegar como API Routes de Next.js

## Opción 2: Railway (Full-Stack)

### Ventajas:
- Backend y Frontend juntos
- Base de datos PostgreSQL gratuita
- Deployment automático desde GitHub

### Pasos:
1. Ve a [railway.app](https://railway.app)
2. Conecta GitHub
3. Selecciona tu repo
4. Configura variables de entorno
5. ¡Listo!

## Opción 3: Render

### Características:
- Plan gratuito disponible
- Soporte para Node.js
- SSL automático
- Custom domains

## 📋 Checklist antes del deployment:

- [ ] Código en GitHub
- [ ] Variables de entorno configuradas
- [ ] package.json con scripts de build
- [ ] Backend APIs funcionando
- [ ] Frontend compilando sin errores

## 🔧 Configuraciones necesarias:

### Para Vercel:
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "src/backend/app.js",
      "use": "@vercel/node"
    },
    {
      "src": "src/frontend/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/backend/app.js"
    },
    {
      "src": "/(.*)",
      "dest": "src/frontend/$1"
    }
  ]
}
```

### Variables de entorno requeridas:
- `GEMINI_API_KEY`
- `NODE_ENV=production`
- `PORT=4000` (para backend)

## 💡 Tips para un deployment exitoso:

1. **Prueba local primero**: Asegúrate que todo funcione
2. **Optimiza imágenes**: Reduce tamaño de archivos
3. **Configura CORS**: Para que frontend y backend se comuniquen
4. **SSL**: Usa HTTPS en producción
5. **Monitoreo**: Configura logs para debug

## 🌐 URLs finales:
- Tu app estará disponible en: `https://tu-app.vercel.app`
- O con dominio custom: `https://tu-dominio.com`