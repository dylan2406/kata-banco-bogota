import io
from tests.conftest import pdf_fake


def datos_validos():
    return {
        "primer_nombre": "Ana",
        "segundo_nombre": "Lucia",
        "primer_apellido": "Torres",
        "segundo_apellido": "Gomez",
        "correo_electronico": "ana@test.com",
        "carrera_universitaria": "Ingeniería de Sistemas",
        "semestre_actual": "6",
    }


def registrar(client, datos=None, archivo=None):
    d = datos or datos_validos()
    f = archivo or pdf_fake()
    return client.post(
        "/api/practicantes",
        data={**d, "hoja_vida": f},
        content_type="multipart/form-data",
    )


# ── Auth ──────────────────────────────────────────────────────────────────────

def test_login_correcto(client):
    res = client.post("/api/auth/login", json={"username": "analista", "password": "Analista@123"})
    assert res.status_code == 200
    assert res.get_json()["usuario"]["rol"] == "analista"


def test_registro_analista(client):
    res = client.post("/api/auth/registro", json={
        "nombre": "Nuevo Analista",
        "username": "nuevo",
        "correo": "nuevo@banco.com",
        "password": "Clave@1234",
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["usuario"]["username"] == "nuevo"
    res2 = client.post("/api/auth/login", json={"username": "nuevo", "password": "Clave@1234"})
    assert res2.status_code == 200


def test_registro_analista_duplicado(client):
    client.post("/api/auth/registro", json={
        "nombre": "A", "username": "dup", "correo": "dup@banco.com", "password": "Clave@1234"
    })
    res = client.post("/api/auth/registro", json={
        "nombre": "B", "username": "dup", "correo": "otro@banco.com", "password": "Clave@1234"
    })
    assert res.status_code == 400


def test_registro_password_sin_mayuscula(client):
    res = client.post("/api/auth/registro", json={
        "nombre": "X", "username": "x1", "correo": "x1@banco.com", "password": "clave@1234"
    })
    assert res.status_code == 400


def test_registro_password_sin_numero(client):
    res = client.post("/api/auth/registro", json={
        "nombre": "X", "username": "x2", "correo": "x2@banco.com", "password": "Clave@abcd"
    })
    assert res.status_code == 400


def test_registro_password_sin_especial(client):
    res = client.post("/api/auth/registro", json={
        "nombre": "X", "username": "x3", "correo": "x3@banco.com", "password": "Clave1234"
    })
    assert res.status_code == 400


def test_registro_analista_password_corta(client):
    res = client.post("/api/auth/registro", json={
        "nombre": "C", "username": "corta", "correo": "c@banco.com", "password": "Ab@1"
    })
    assert res.status_code == 400


def test_login_credenciales_incorrectas(client):
    res = client.post("/api/auth/login", json={"username": "analista", "password": "mal"})
    assert res.status_code == 401


def test_acceso_sin_sesion_rechazado(client):
    res = client.get("/api/practicantes")
    assert res.status_code == 401


def test_logout(client_auth):
    res = client_auth.post("/api/auth/logout")
    assert res.status_code == 200
    # Después del logout el token revocado devuelve 401
    res2 = client_auth.get("/api/practicantes")
    assert res2.status_code == 401


# ── RF-02: Registro correcto (público) ───────────────────────────────────────

def test_registro_correcto(client):
    res = registrar(client)
    assert res.status_code == 201
    data = res.get_json()
    assert data["practicante"]["estado"] == "PENDIENTE"
    assert data["practicante"]["primer_nombre"] == "Ana"
    assert data["practicante"]["nombre_completo"] == "Ana Lucia Torres Gomez"


def test_campos_obligatorios(client):
    res = client.post(
        "/api/practicantes",
        data={"primer_nombre": "", "primer_apellido": "", "segundo_apellido": "", "correo_electronico": "", "carrera_universitaria": "", "semestre_actual": ""},
        content_type="multipart/form-data",
    )
    assert res.status_code == 400
    assert "errores" in res.get_json()


def test_nombre_con_numeros(client):
    d = datos_validos()
    d["primer_nombre"] = "Ana123"
    res = registrar(client, datos=d)
    assert res.status_code == 400


def test_correo_invalido(client):
    d = datos_validos()
    d["correo_electronico"] = "no-es-correo"
    res = registrar(client, datos=d)
    assert res.status_code == 400


def test_semestre_invalido(client):
    d = datos_validos()
    d["semestre_actual"] = "-3"
    res = registrar(client, datos=d)
    assert res.status_code == 400


def test_archivo_invalido(client):
    archivo = (io.BytesIO(b"not a pdf"), "documento.txt")
    res = registrar(client, archivo=archivo)
    assert res.status_code == 400


def test_carrera_invalida(client):
    d = datos_validos()
    d["carrera_universitaria"] = "Magia y Hechizería"
    res = registrar(client, datos=d)
    assert res.status_code == 400


# ── RF-03/04: Endpoints protegidos ───────────────────────────────────────────

def test_listar_practicantes(client_auth):
    registrar(client_auth)
    res = client_auth.get("/api/practicantes")
    assert res.status_code == 200
    assert len(res.get_json()) == 1


def test_consulta_por_id(client_auth):
    registrar(client_auth)
    res = client_auth.get("/api/practicantes/1")
    assert res.status_code == 200
    assert res.get_json()["id"] == 1


def test_id_inexistente(client_auth):
    res = client_auth.get("/api/practicantes/999")
    assert res.status_code == 404


# ── RF-05: Estados ────────────────────────────────────────────────────────────

def test_actualizar_viable(client_auth):
    registrar(client_auth)
    res = client_auth.patch("/api/practicantes/1/estado", json={"estado": "VIABLE"})
    assert res.status_code == 200
    assert res.get_json()["practicante"]["estado"] == "VIABLE"


def test_actualizar_no_viable(client_auth):
    registrar(client_auth)
    res = client_auth.patch("/api/practicantes/1/estado", json={"estado": "NO_VIABLE"})
    assert res.status_code == 200
    assert res.get_json()["practicante"]["estado"] == "NO_VIABLE"


def test_estado_invalido(client_auth):
    registrar(client_auth)
    res = client_auth.patch("/api/practicantes/1/estado", json={"estado": "RECHAZADO"})
    assert res.status_code == 400


def test_persistencia_estado(client_auth):
    registrar(client_auth)
    client_auth.patch("/api/practicantes/1/estado", json={"estado": "VIABLE"})
    res = client_auth.get("/api/practicantes/1")
    assert res.get_json()["estado"] == "VIABLE"


def test_correo_duplicado(client):
    registrar(client)
    res = registrar(client)
    assert res.status_code == 400
