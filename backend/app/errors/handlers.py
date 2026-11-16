from flask import jsonify


def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Solicitud incorrecta.", "detalle": str(e)}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Recurso no encontrado."}), 404

    @app.errorhandler(413)
    def too_large(e):
        return jsonify({"error": "El archivo supera el tamaño máximo permitido de 5 MB."}), 413

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Error interno del servidor."}), 500
