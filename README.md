# Plataforma Básica de Selección de Practicantes

Aplicación web cliente-servidor para gestionar el proceso de selección de practicantes universitarios.

## Arquitectura

```
Frontend (HTML5 + CSS3 + Vanilla JS)  ←→  Backend (Python Flask)  ←→  SQLite
        HTTP :8080                          REST API :5000
```

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5, CSS3, JavaScript ES6+, Fetch API |
| Backend | Python 3.12+, Flask, Flask-SQLAlchemy, Flask-CORS |
| Base de datos | SQLite (local) |
| Pruebas | Pytest, pytest-flask |

## Estructura del proyecto

```
plataforma-seleccion-practicantes/
├── frontend/
│   ├── index.html              # Formulario de registro
│   ├── pages/
│   │   ├── analistas.html      # Panel de analistas
│   │   └── detalle.html        # Detalle del practicante
│   ├── css/
│   │   ├── styles.css          # Estilos globales
│   │   ├── registro.css
│   │   └── analistas.css
│   └── js/
│       ├── api.js              # Cliente HTTP
│       ├── validaciones.js     # Validaciones frontend
│       ├── registro.js
│       ├── analistas.js
│       └── detalle.js
└── backend/
    ├── app/
    │   ├── __init__.py         # Application Factory
    │   ├── config.py
    │   ├── extensions.py
    │   ├── models/practicante.py
    │   ├── routes/practicantes_routes.py
    │   ├── services/
    │   │   ├── practicantes_service.py
    │   │   └── archivos_service.py
    │   ├── validators/practicantes_validator.py
    │   └── errors/handlers.py
    ├── tests/
    │   ├── conftest.py
    │   ├── test_practicantes.py
    │   └── test_archivos.py
    ├── storage/cvs/            # PDFs almacenados
    ├── instance/               # practicantes.db
    ├── run.py
    └── requirements.txt
```

## Requisitos previos

- Python 3.12 o superior
- Cualquier servidor HTTP local (Python http.server, Live Server, etc.)

## Instalación y ejecución

### 1. Clonar / descomprimir el proyecto

```powershell
cd c:\Kata_banco_bogota
```

### 2. Crear entorno virtual e instalar dependencias

```powershell
cd backend
python -m venv venv
venv\Scripts\pip install -r requirements.txt
```

### 3. Configurar variables de entorno

```powershell
copy .env.example .env
# Editar .env si es necesario
```

### 4. Iniciar el backend Flask

```powershell
# Desde c:\Kata_banco_bogota\backend
venv\Scripts\python run.py
```

Flask quedará disponible en: `http://localhost:5000`

### 5. Iniciar el frontend (servidor HTTP local)

Abrir una **nueva terminal** y ejecutar:

```powershell
cd c:\Kata_banco_bogota\frontend
python -m http.server 8080
```

Abrir en el navegador: `http://localhost:8080`

## Endpoints REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/practicantes` | Registrar practicante + PDF |
| GET | `/api/practicantes` | Listar todos los practicantes |
| GET | `/api/practicantes/<id>` | Consultar practicante por ID |
| PATCH | `/api/practicantes/<id>/estado` | Actualizar estado |
| GET | `/api/practicantes/<id>/hoja-vida` | Descargar PDF |

### Ejemplo PATCH estado

```json
PATCH /api/practicantes/1/estado
{ "estado": "VIABLE" }
```

Estados válidos: `PENDIENTE`, `VIABLE`, `NO_VIABLE`
