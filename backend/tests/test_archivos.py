import io
import os
from tests.conftest import pdf_fake


def test_almacenamiento_pdf(client_auth, app):
    archivo = pdf_fake("mi_cv.pdf")
    res = client_auth.post(
        "/api/practicantes",
        data={
            "primer_nombre": "Luis",
            "primer_apellido": "Pérez",
            "segundo_apellido": "Mora",
            "correo_electronico": "luis@test.com",
            "carrera_universitaria": "Contaduría Pública",
            "semestre_actual": "4",
            "hoja_vida": archivo,
        },
        content_type="multipart/form-data",
    )
    assert res.status_code == 201
    data = res.get_json()
    nombre_original = data["practicante"]["nombre_archivo_original"]
    assert nombre_original == "mi_cv.pdf"
    # Verificar que el archivo existe en disco
    carpeta = app.config["UPLOAD_FOLDER"]
    archivos = os.listdir(carpeta)
    assert len(archivos) == 1
    assert archivos[0].endswith(".pdf")


def test_descarga_hoja_vida(client_auth):
    archivo = pdf_fake("hv_test.pdf")
    client_auth.post(
        "/api/practicantes",
        data={
            "primer_nombre": "Carla",
            "primer_apellido": "Ruiz",
            "segundo_apellido": "Vega",
            "correo_electronico": "carla@test.com",
            "carrera_universitaria": "Derecho",
            "semestre_actual": "8",
            "hoja_vida": archivo,
        },
        content_type="multipart/form-data",
    )
    res = client_auth.get("/api/practicantes/1/hoja-vida")
    assert res.status_code == 200
    assert res.content_type == "application/pdf"
