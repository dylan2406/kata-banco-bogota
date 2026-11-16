import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app


def guardar_pdf(archivo):
    nombre_original = secure_filename(archivo.filename)
    extension = os.path.splitext(nombre_original)[1]
    nombre_unico = f"{uuid.uuid4().hex}{extension}"
    carpeta = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(carpeta, exist_ok=True)
    ruta_completa = os.path.join(carpeta, nombre_unico)
    archivo.save(ruta_completa)
    return nombre_unico, nombre_original


def eliminar_pdf(nombre_unico):
    carpeta = current_app.config["UPLOAD_FOLDER"]
    ruta = os.path.join(carpeta, nombre_unico)
    if os.path.exists(ruta):
        os.remove(ruta)


def obtener_ruta_pdf(nombre_unico):
    carpeta = current_app.config["UPLOAD_FOLDER"]
    return os.path.join(carpeta, nombre_unico)
