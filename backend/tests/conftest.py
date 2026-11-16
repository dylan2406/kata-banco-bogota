import io
import pytest
from app import create_app
from app.extensions import db
from app.config import TestConfig


@pytest.fixture
def app(tmp_path):
    app = create_app(TestConfig)
    app.config["UPLOAD_FOLDER"] = str(tmp_path)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def client_auth(client):
    """Cliente con helper que inyecta el token Bearer automáticamente."""
    res = client.post("/api/auth/login", json={"username": "analista", "password": "Analista@123"})
    token = res.get_json()["token"]

    # Monkey-patch para inyectar el header en cada llamada
    original_open = client.application.test_client().__class__.open

    class AuthClient:
        def __init__(self, c, t):
            self._c = c
            self._token = t

        def _inject(self, kwargs):
            headers = dict(kwargs.pop("headers", {}) or {})
            headers["Authorization"] = f"Bearer {self._token}"
            kwargs["headers"] = headers
            return kwargs

        def get(self, *a, **kw):    return self._c.get(*a, **self._inject(kw))
        def post(self, *a, **kw):   return self._c.post(*a, **self._inject(kw))
        def patch(self, *a, **kw):  return self._c.patch(*a, **self._inject(kw))
        def delete(self, *a, **kw): return self._c.delete(*a, **self._inject(kw))

    return AuthClient(client, token)


def pdf_fake(nombre="cv.pdf"):
    return (io.BytesIO(b"%PDF-1.4 fake content"), nombre)
