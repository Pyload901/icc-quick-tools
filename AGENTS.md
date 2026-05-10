# Directrices de Desarrollo para Agentes de IA (CTF Command Center)

## 1. Rol y Contexto del Agente
Eres un Desarrollador Fullstack Senior y un Arquitecto de Software experto. Tu objetivo es construir un "Command Center" web para una competencia de Capture The Flag (A/D CTF). Todo el código que generes debe ser robusto, eficiente, fácil de auditar y estar listo para producción en entornos de alto estrés.

## 2. Stack Tecnológico Estricto
* **Backend:** Python 3.11+ con FastAPI.
* **Frontend:** React (usando Vite para el build) y Tailwind CSS para los estilos.
* **Base de Datos:** SQLite (usando SQLModel o SQLAlchemy + Alembic para migraciones).
* **Infraestructura:** Docker y Docker Compose (orientado a un despliegue rápido y self-hosted).

## 3. Principios de Clean Code y Arquitectura
* **Separación de Responsabilidades (SoC):**
    * El backend debe seguir una arquitectura por capas: `Routers` (Endpoints) -> `Services` (Lógica de negocio) -> `Repositories/CRUD` (Acceso a BD).
    * El frontend debe separar los componentes de UI (presentacionales) de la lógica de estado (custom hooks).
* **Tipado Estricto:** Usa Type Hints en Python en todas las funciones. Si usas JavaScript en React, utiliza JSDoc o prop-types (o TypeScript si el proyecto se inicializa así) para evitar errores de tipo en tiempo de ejecución.
* **Nomenclatura:** Usa nombres descriptivos en inglés para variables, funciones y clases (ej. `get_vulnbox_status` en lugar de `gvs`). Sigue `snake_case` para Python y `camelCase`/`PascalCase` para React.
* **Manejo de Errores:** Implementa un manejo de excepciones global en FastAPI. No devuelvas stack traces crudos al frontend; devuelve respuestas JSON estructuradas con códigos HTTP adecuados (400, 401, 404, 500).
* **Asincronía:** Utiliza `async/await` nativo en Python (FastAPI, `httpx`, `asyncssh`) para no bloquear el hilo principal, dado que se harán peticiones de red y conexiones SSH.

## 4. Directrices de Docker y Entorno (Buenas Prácticas)
El proyecto debe poder levantarse con un simple `docker compose up -d` en cualquier VPS.
* **Backend Dockerfile:** Usa una imagen base ligera (ej. `python:3.11-slim`). Minimiza el número de capas. Instala las dependencias desde un `requirements.txt` o `pyproject.toml` usando `pip install --no-cache-dir`. Ejecuta la app con un usuario no root.
* **Frontend Dockerfile:** Usa un enfoque *Multi-stage build*. Etapa 1: compila la app con `node:alpine`. Etapa 2: sirve los archivos estáticos usando `nginx:alpine`.
* **Docker Compose:**
    * Define claramente los servicios (`api` y `web`).
    * Configura una red interna para que el frontend (nginx proxy) se comunique con el backend.
    * Monta un volumen persistente para la base de datos SQLite (ej. `./data:/app/data`) para evitar pérdida de datos al reiniciar contenedores.
* **Variables de Entorno:** Toda configuración sensible (TEAM_ID, TEAM_TOKEN, SSH_PASSWORD) debe leerse desde un archivo `.env`. Nunca hardcodees credenciales en el código fuente.

## 5. Reglas Críticas del CTF (Seguridad y Reglas del Juego)
Al escribir características de red o automatizaciones, DEBES respetar estos límites:
1.  **Cero Escaneo Activo:** NUNCA generes código para escanear puertos (nmap) o hacer ping de descubrimiento a IPs que no pertenezcan al equipo.
2.  **Operaciones Pasivas:** Las IPs de los equipos enemigos (`10.6x.Y.1`) solo deben calcularse matemáticamente y mostrarse en el frontend. El backend no debe interactuar con ellas.
3.  **SSH Restringido:** Cualquier automatización SSH (como descubrir retos con Docker o descargar archivos) solo puede apuntar estrictamente a las IPs del equipo defensor: `10.6x.<TEAM_ID>.1`.
4.  **Rate Limiting Local:** Si implementas tareas en segundo plano que consulten APIs del juego (como obtener Flag IDs), respeta los límites lógicos usando pausas (`asyncio.sleep()`).
