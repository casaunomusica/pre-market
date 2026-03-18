# Armá tu pedido (pre-market)

App sencilla React + Vite + TypeScript con Tailwind CSS. Sin APIs externas ni API keys: catálogo, carrito y enlace a WhatsApp. Opcional: “mercado secreto” (mezcla personalizada) protegido con contraseña vía API propia.

## Requisitos

- Node.js (recomendado v18+)

## Desarrollo local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Arrancar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   La app estará en `http://localhost:3000`.  
   Si usás el mercado secreto con contraseña, creá `.env.local` a partir de `.env.example` y ejecutá `vercel dev` para que funcione la API de validación.

---

## Paso a paso: GitHub + Vercel (con mercado secreto y sin riesgos de seguridad)

Seguí este orden para tener la app en línea con todas las funcionalidades (incluido el mercado secreto con contraseña). Ningún secreto se sube a Git ni se expone en el navegador.

---

### Parte 1 — Subir a GitHub

Abrí la terminal en la carpeta del proyecto y ejecutá **en este orden**:

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "Initial commit"
```

```bash
git branch -M main
```

Ahora creá el repositorio en GitHub:

1. Entrá en [github.com/new](https://github.com/new).
2. **Repository name:** por ejemplo `arma-tu-pedido` (o el nombre que quieras).
3. Dejalo **vacío**: no marques “Add a README”, ni .gitignore, ni licencia.
4. Clic en **Create repository**.

En la misma terminal, vinculá y subí (reemplazá `TU_USUARIO` y `NOMBRE_REPO` por tu usuario y el nombre del repo):

```bash
git remote add origin https://github.com/TU_USUARIO/NOMBRE_REPO.git
```

```bash
git push -u origin main
```

Ejemplo si tu usuario es `charlie` y el repo `arma-tu-pedido`:

```bash
git remote add origin https://github.com/charlie/arma-tu-pedido.git
git push -u origin main
```

---

### Parte 2 — Deploy en Vercel y activar mercado secreto

1. Entrá en [vercel.com](https://vercel.com) e **iniciá sesión** (idealmente con la misma cuenta de GitHub).

2. Clic en **Add New…** → **Project**.

3. **Import Git Repository** → elegí el repo que acabás de subir (`TU_USUARIO/NOMBRE_REPO`) → **Import**.

4. En la pantalla de configuración, **no cambies** nada de Build:
   - **Framework Preset:** Vite (lo detecta solo).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. Antes de hacer el primer deploy, configurá las variables para el **mercado secreto**:
   - Clic en **Environment Variables** (o “Expand” al lado).
   - Añadí estas dos variables (reemplazá los valores por los tuyos):

   | Name | Value | Entorno |
   |------|--------|--------|
   | `SECRET_MARKET_PASSWORD` | La contraseña que quieras (ej. la que usabas antes) | Production, Preview, Development |
   | `APP_URL` | Escribí por ahora `https://tu-proyecto.vercel.app` (lo reemplazás en el paso 8 por la URL real). | Production, Preview, Development |

   Para cada una: **Add** → valor → marcá los tres entornos (Production, Preview, Development) → Add.

6. Clic en **Deploy**. Esperá a que termine el build.

7. Cuando termine, Vercel te muestra la URL del proyecto (ej. `https://arma-tu-pedido.vercel.app`). **Copiá esa URL**.

8. Configurá `APP_URL` con esa URL:
   - En el proyecto de Vercel: **Settings** → **Environment Variables**.
   - Editá `APP_URL` y poné exactamente la URL de tu app (ej. `https://arma-tu-pedido.vercel.app`), **sin** barra al final.
   - Guardá.

9. Para que el cambio de `APP_URL` aplique, hacé un **redeploy**:
   - **Deployments** → los tres puntos del último deployment → **Redeploy** → **Redeploy**.

Listo: la app está en línea con catálogo, carrito, WhatsApp y **mercado secreto protegido por contraseña**. La contraseña solo se valida en el servidor (API en `api/auth/secret-market.ts`); nunca va en el código ni en el navegador.

---

### Resumen de seguridad

- La contraseña del mercado secreto **no** está en el código ni en GitHub.
- Solo existe en Vercel como variable de entorno `SECRET_MARKET_PASSWORD`.
- La validación se hace en el servidor (Vercel serverless); el cliente solo recibe “ok” o “no”.
- `APP_URL` restringe las llamadas a la API a tu dominio y a localhost.
