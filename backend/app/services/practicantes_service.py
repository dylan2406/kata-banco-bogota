from app.extensions import db
from app.models.practicante import Practicante
from app.services.archivos_service import guardar_pdf
from app.validators.practicantes_validator import validar_practicante, validar_estado, normalizar_nombre


def crear_practicante(data, archivo):
    errores = validar_practicante(data, archivo)
    if errores:
        return None, errores

    existente = Practicante.query.filter_by(
        correo_electronico=data["correo_electronico"].strip().lower()
    ).first()
    if existente:
        return None, ["Ya existe un practicante registrado con ese correo electrónico."]

    nombre_unico, nombre_original = guardar_pdf(archivo)

    segundo = data.get("segundo_nombre", "").strip()
    practicante = Practicante(
        primer_nombre=normalizar_nombre(data["primer_nombre"]),
        segundo_nombre=normalizar_nombre(segundo) if segundo else None,
        primer_apellido=normalizar_nombre(data["primer_apellido"]),
        segundo_apellido=normalizar_nombre(data["segundo_apellido"]),
        correo_electronico=data["correo_electronico"].strip().lower(),
        carrera_universitaria=data["carrera_universitaria"].strip(),
        semestre_actual=int(data["semestre_actual"]),
        nombre_archivo_original=nombre_original,
        ruta_archivo=nombre_unico,
    )
    db.session.add(practicante)
    db.session.commit()
    return practicante, []


def listar_practicantes():
    return Practicante.query.order_by(Practicante.fecha_registro.desc()).all()


def obtener_practicante(practicante_id):
    return db.session.get(Practicante, practicante_id)


def actualizar_estado(practicante_id, nuevo_estado):
    errores = validar_estado(nuevo_estado)
    if errores:
        return None, errores

    practicante = db.session.get(Practicante, practicante_id)
    if not practicante:
        return None, ["Practicante no encontrado."]

    practicante.estado = nuevo_estado
    db.session.commit()
    return practicante, []
