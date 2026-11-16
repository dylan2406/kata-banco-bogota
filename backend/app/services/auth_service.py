import secrets
from functools import wraps
from flask import request, jsonify, current_app
from app.models.usuario import Usuario
from app.extensions import db

# Almacén en memoria: { token: usuario_id }
# Para producción se usaría Redis o JWT; para esta kata es suficiente.
_tokens: dict[str, int] = {}


def crear_token(usuario_id: int) -> str:
    token = secrets.token_hex(32)
    _tokens[token] = usuario_id
    return token


def revocar_token(token: str):
    _tokens.pop(token, None)


def usuario_desde_token(token: str):
    usuario_id = _tokens.get(token)
    if not usuario_id:
        return None
    return db.session.get(Usuario, usuario_id)


def _extraer_token() -> str | None:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    # Fallback para descarga de archivos via <a href>
    return request.args.get("token") or None


def requiere_analista(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = _extraer_token()
        if not token:
            return jsonify({"error": "No autenticado.", "code": "UNAUTHORIZED"}), 401
        usuario = usuario_desde_token(token)
        if not usuario:
            return jsonify({"error": "No autenticado.", "code": "UNAUTHORIZED"}), 401
        if usuario.rol != "analista":
            return jsonify({"error": "Acceso denegado.", "code": "FORBIDDEN"}), 403
        return f(*args, **kwargs)
    return decorated
