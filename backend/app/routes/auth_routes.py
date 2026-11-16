import re
from flask import Blueprint, request, jsonify
from app.models.usuario import Usuario
from app.extensions import db
from app.services.auth_service import crear_token, revocar_token, usuario_desde_token, _extraer_token

bp_auth = Blueprint("auth", __name__, url_prefix="/api/auth")


def _validar_password(password: str) -> list[str]:
    errores = []
    if len(password) < 8:
        errores.append("La contraseña debe tener al menos 8 caracteres.")
    if not re.search(r"[A-Z]", password):
        errores.append("Debe incluir al menos una letra mayúscula.")
    if not re.search(r"[a-z]", password):
        errores.append("Debe incluir al menos una letra minúscula.")
    if not re.search(r"\d", password):
        errores.append("Debe incluir al menos un número.")
    if not re.search(r"[!@#$%^&*()\-_=+\[\]{};:',.<>?/|`~]", password):
        errores.append("Debe incluir al menos un carácter especial (!@#$%^&*...).")
    return errores


@bp_auth.route("/registro", methods=["POST"])
def registro():
    body = request.get_json(silent=True) or {}
    nombre = body.get("nombre", "").strip()
    username = body.get("username", "").strip()
    correo = body.get("correo", "").strip().lower()
    password = body.get("password", "")

    errores = []
    if not nombre: errores.append("El nombre es obligatorio.")
    if not username: errores.append("El usuario es obligatorio.")
    if not correo or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", correo):
        errores.append("El correo no es válido.")
    errores_pwd = _validar_password(password)
    errores.extend(errores_pwd)
    if errores:
        return jsonify({"error": " ".join(errores)}), 400

    if Usuario.query.filter_by(username=username).first():
        return jsonify({"error": "El nombre de usuario ya está en uso."}), 400
    if Usuario.query.filter_by(correo=correo).first():
        return jsonify({"error": "El correo ya está registrado."}), 400

    u = Usuario(username=username, nombre=nombre, correo=correo, rol="analista")
    u.set_password(password)
    db.session.add(u)
    db.session.commit()
    return jsonify({"mensaje": "Analista registrado exitosamente.", "usuario": u.to_dict()}), 201


@bp_auth.route("/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}
    username = body.get("username", "").strip()
    password = body.get("password", "")

    if not username or not password:
        return jsonify({"error": "Usuario y contraseña son obligatorios."}), 400

    usuario = Usuario.query.filter_by(username=username).first()
    if not usuario or not usuario.check_password(password):
        return jsonify({"error": "Credenciales incorrectas."}), 401

    if usuario.rol != "analista":
        return jsonify({"error": "No tienes permisos para acceder al panel."}), 403

    token = crear_token(usuario.id)
    return jsonify({"token": token, "usuario": usuario.to_dict()}), 200


@bp_auth.route("/logout", methods=["POST"])
def logout():
    token = _extraer_token()
    if token:
        revocar_token(token)
    return jsonify({"mensaje": "Sesión cerrada."}), 200


@bp_auth.route("/me", methods=["GET"])
def me():
    token = _extraer_token()
    if not token:
        return jsonify({"error": "No autenticado.", "code": "UNAUTHORIZED"}), 401
    usuario = usuario_desde_token(token)
    if not usuario:
        return jsonify({"error": "No autenticado.", "code": "UNAUTHORIZED"}), 401
    return jsonify(usuario.to_dict()), 200
