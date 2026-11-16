import os
from flask import Flask
from app.extensions import db, cors
from app.config import Config
from app.errors.handlers import register_error_handlers
from app.routes.practicantes_routes import bp as practicantes_bp
from app.routes.auth_routes import bp_auth


def create_app(config_class=Config):
    app = Flask(__name__, instance_relative_config=False)
    app.config.from_object(config_class)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    db.init_app(app)
    cors.init_app(app, resources={r"/api/*": {
        "origins": app.config["FRONTEND_ORIGIN"],
        "supports_credentials": True,
    }})

    app.register_blueprint(practicantes_bp)
    app.register_blueprint(bp_auth)
    register_error_handlers(app)

    with app.app_context():
        db.create_all()
        _seed_analista()

    return app


def _seed_analista():
    from app.models.usuario import Usuario
    if not Usuario.query.filter_by(username="analista").first():
        u = Usuario(username="analista", nombre="Analista Principal", rol="analista")
        u.set_password("Analista@123")
        db.session.add(u)
        db.session.commit()
