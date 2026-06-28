# BandSync BCO – Frontend

Frontend para el sistema de gestión de ensayos de la **Banda Comunal de Orotina**.

---

## Estructura de archivos

```
bandsync-frontend/
├── index.html                  ← Login (Persona A)
├── css/
│   └── styles.css              ← Estilos globales (Persona A)
├── js/
│   ├── api.js                  ← Funciones de fetch y auth (Persona A)
│   └── navbar.js               ← Navbar compartida (Persona A)
└── pages/
    ├── calendario.html         ← Calendario visual (Persona A)
    ├── ensayos.html            ← CRUD Ensayos (Persona A)
    ├── integrantes.html        ← CRUD Integrantes (Persona B)
    ├── instrumentos.html       ← CRUD Instrumentos (Persona B)
    └── presentaciones.html     ← CRUD Presentaciones (Persona B)
```

---

## División de trabajo

### 👤 Persona A
- `index.html` – Página de login con autenticación real al backend
- `css/styles.css` – Paleta BCO, componentes, responsive
- `js/api.js` – Helper de fetch, `requireAuth()`, `logout()`
- `js/navbar.js` – Barra de navegación compartida
- `pages/calendario.html` – Calendario mensual con puntos por sección
- `pages/ensayos.html` – Crear, editar, eliminar y filtrar ensayos

### 👤 Persona B
- `pages/integrantes.html` – Crear, editar, eliminar integrantes
- `pages/instrumentos.html` – Gestión de inventario de instrumentos
- `pages/presentaciones.html` – Registro de presentaciones y asistencia

> **Tip para trabajar separados:** Persona B solo necesita los archivos de `pages/` más `css/styles.css` y `js/api.js` ya generados. No modifica el login ni el calendario.

---

## Cómo correrlo

### 1. Tener el backend corriendo
El Spring Boot debe estar en `http://localhost:8080`.
Asegurate de que el `application.properties` tenga la conexión a la base de datos correcta.

### 2. Abrir el frontend
**Opción recomendada – Live Server (VS Code):**
1. Abrí la carpeta `bandsync-frontend` en VS Code
2. Instalá la extensión **Live Server** (ritwickdey.LiveServer)
3. Click derecho en `index.html` → "Open with Live Server"
4. Se abre en `http://127.0.0.1:5500`

**Opción alternativa – Python:**
```bash
cd bandsync-frontend
python3 -m http.server 5500
# Luego abrí http://localhost:5500
```

### 3. Iniciar sesión
- Correo: debe terminar en `@bco.or.cr` o `@int.bco.or.cr`
- Contraseña: la del usuario registrado en la base de datos

---

## Endpoints que usa el frontend

| Módulo | Endpoints usados |
|---|---|
| Login | `POST /api/integrantes/login` |
| Ensayos | `GET /api/ensayos/all`, `POST /api/ensayos/save`, `PUT /api/ensayos/{id}`, `DELETE /api/ensayos/{id}` |
| Integrantes | `GET /api/integrantes`, `POST /api/integrantes`, `PUT /api/integrantes/{id}`, `DELETE /api/integrantes/{id}` |
| Instrumentos | `GET /api/instrumentos`, `POST /api/instrumentos`, `PUT /api/instrumentos/{id}`, `DELETE /api/instrumentos/{id}/{qty}` |
| Presentaciones | `GET /api/presentaciones/all`, `POST /api/presentaciones/save`, `PUT /api/presentaciones/{id}`, `DELETE /api/presentaciones/{id}` |
