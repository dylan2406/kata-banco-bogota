from flask import Blueprint, request, jsonify, send_file
from app.services.practicantes_service import (
    crear_practicante,
    listar_practicantes,
    obtener_practicante,
    actualizar_estado,
)
from app.services.archivos_service import obtener_ruta_pdf
from app.services.auth_service import requiere_analista
from app.data.carreras import CARRERAS
import os

bp = Blueprint("practicantes", __name__, url_prefix="/api")


@bp.route("/carreras", methods=["GET"])
def listar_carreras():
    return jsonify(CARRERAS), 200


@bp.route("/practicantes", methods=["POST"])
def registrar():
    data = request.form.to_dict()
    archivo = request.files.get("hoja_vida")
    practicante, errores = crear_practicante(data, archivo)
    if errores:
        return jsonify({"errores": errores}), 400
    return jsonify({"mensaje": "Practicante registrado exitosamente.", "practicante": practicante.to_dict()}), 201


@bp.route("/practicantes", methods=["GET"])
@requiere_analista
def listar():
    practicantes = listar_practicantes()
    return jsonify([p.to_dict() for p in practicantes]), 200


@bp.route("/practicantes/<int:practicante_id>", methods=["GET"])
@requiere_analista
def detalle(practicante_id):
    practicante = obtener_practicante(practicante_id)
    if not practicante:
        return jsonify({"error": "Practicante no encontrado."}), 404
    return jsonify(practicante.to_dict()), 200


@bp.route("/practicantes/<int:practicante_id>/estado", methods=["PATCH"])
@requiere_analista
def cambiar_estado(practicante_id):
    body = request.get_json(silent=True) or {}
    nuevo_estado = body.get("estado", "").strip().upper()
    practicante, errores = actualizar_estado(practicante_id, nuevo_estado)
    if errores:
        status = 404 if "no encontrado" in errores[0].lower() else 400
        return jsonify({"errores": errores}), status
    return jsonify({"mensaje": "Estado actualizado.", "practicante": practicante.to_dict()}), 200


@bp.route("/practicantes/<int:practicante_id>/hoja-vida", methods=["GET"])
@requiere_analista
def descargar_hoja_vida(practicante_id):
    practicante = obtener_practicante(practicante_id)
    if not practicante:
        return jsonify({"error": "Practicante no encontrado."}), 404
    ruta = obtener_ruta_pdf(practicante.ruta_archivo)
    if not os.path.exists(ruta):
        return jsonify({"error": "Archivo no encontrado en el servidor."}), 404
    return send_file(ruta, as_attachment=True, download_name=practicante.nombre_archivo_original)
