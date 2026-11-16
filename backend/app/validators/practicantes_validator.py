import re
import unicodedata
from app.data.carreras import CARRERAS

ESTADOS_VALIDOS = {"PENDIENTE", "VIABLE", "NO_VIABLE"}
_CARRERAS_SET = set(CARRERAS)


def _solo_letras(valor):
    """Rechaza si contiene dígitos."""
    return not re.search(r"\d", valor)


def normalizar_nombre(valor):
    """Title-case y colapsa espacios extra."""
    return " ".join(valor.strip().split()).title()


def validar_practicante(data, archivo):
    errores = []

    for campo, etiqueta, obligatorio in [
        ("primer_nombre", "El primer nombre", True),
        ("segundo_nombre", "El segundo nombre", False),
        ("primer_apellido", "El primer apellido", True),
        ("segundo_apellido", "El segundo apellido", True),
    ]:
        valor = data.get(campo, "").strip()
        if obligatorio and not valor:
            errores.append(f"{etiqueta} es obligatorio.")
        elif valor and not _solo_letras(valor):
            errores.append(f"{etiqueta} no puede contener números.")

    correo = data.get("correo_electronico", "").strip()
    if not correo:
        errores.append("El correo electrónico es obligatorio.")
    elif not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", correo):
        errores.append("El formato del correo electrónico no es válido.")

    carrera = data.get("carrera_universitaria", "").strip()
    if not carrera:
        errores.append("La carrera universitaria es obligatoria.")
    elif carrera not in _CARRERAS_SET:
        errores.append("Selecciona una carrera válida de la lista.")

    semestre = data.get("semestre_actual", "")
    try:
        semestre_int = int(semestre)
        if semestre_int <= 0:
            errores.append("El semestre debe ser un número positivo.")
    except (ValueError, TypeError):
        errores.append("El semestre debe ser un número entero positivo.")

    if archivo is None:
        errores.append("La hoja de vida en PDF es obligatoria.")
    elif not archivo.filename.lower().endswith(".pdf"):
        errores.append("Solo se permiten archivos PDF.")

    return errores


def validar_estado(estado):
    if estado not in ESTADOS_VALIDOS:
        return [f"Estado inválido. Valores permitidos: {', '.join(ESTADOS_VALIDOS)}"]
    return []
