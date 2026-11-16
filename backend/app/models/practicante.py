from datetime import datetime, timezone
from app.extensions import db


class Practicante(db.Model):
    __tablename__ = "practicantes"

    id = db.Column(db.Integer, primary_key=True)
    primer_nombre = db.Column(db.String(100), nullable=False)
    segundo_nombre = db.Column(db.String(100), nullable=True)
    primer_apellido = db.Column(db.String(100), nullable=False)
    segundo_apellido = db.Column(db.String(100), nullable=False)
    correo_electronico = db.Column(db.String(200), nullable=False, unique=True)
    carrera_universitaria = db.Column(db.String(200), nullable=False)
    semestre_actual = db.Column(db.Integer, nullable=False)
    estado = db.Column(db.String(20), nullable=False, default="PENDIENTE")
    nombre_archivo_original = db.Column(db.String(300), nullable=False)
    ruta_archivo = db.Column(db.String(500), nullable=False)
    fecha_registro = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    @property
    def nombre_completo(self):
        partes = [self.primer_nombre]
        if self.segundo_nombre:
            partes.append(self.segundo_nombre)
        partes += [self.primer_apellido, self.segundo_apellido]
        return " ".join(partes)

    def to_dict(self):
        return {
            "id": self.id,
            "primer_nombre": self.primer_nombre,
            "segundo_nombre": self.segundo_nombre or "",
            "primer_apellido": self.primer_apellido,
            "segundo_apellido": self.segundo_apellido,
            "nombre_completo": self.nombre_completo,
            "correo_electronico": self.correo_electronico,
            "carrera_universitaria": self.carrera_universitaria,
            "semestre_actual": self.semestre_actual,
            "estado": self.estado,
            "nombre_archivo_original": self.nombre_archivo_original,
            "fecha_registro": self.fecha_registro.isoformat() if self.fecha_registro else None,
        }
