const validaciones = {
  requerido(valor) {
    return valor !== null && valor !== undefined && String(valor).trim() !== "";
  },
  soloLetras(valor) {
    return !/\d/.test(valor);
  },
  correo(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  },
  semestrePositivo(valor) {
    const n = Number(valor);
    return Number.isInteger(n) && n > 0;
  },
  esPDF(archivo) {
    return archivo && archivo.type === "application/pdf";
  },
  tamanoMaximo(archivo, maxBytes = 5 * 1024 * 1024) {
    return archivo && archivo.size <= maxBytes;
  },
};

function mostrarError(inputEl, mensajeEl, mensaje) {
  inputEl.classList.add("error");
  mensajeEl.textContent = mensaje;
  mensajeEl.classList.add("visible");
}

function limpiarError(inputEl, mensajeEl) {
  inputEl.classList.remove("error");
  mensajeEl.classList.remove("visible");
}

function validarFormularioRegistro(form) {
  let valido = true;

  // Campos de nombre — obligatorios excepto segundo_nombre
  const camposNombre = [
    { id: "primer_nombre",    errorId: "err_primer_nombre",    obligatorio: true,  etiqueta: "El primer nombre" },
    { id: "segundo_nombre",   errorId: "err_segundo_nombre",   obligatorio: false, etiqueta: "El segundo nombre" },
    { id: "primer_apellido",  errorId: "err_primer_apellido",  obligatorio: true,  etiqueta: "El primer apellido" },
    { id: "segundo_apellido", errorId: "err_segundo_apellido", obligatorio: true,  etiqueta: "El segundo apellido" },
  ];

  camposNombre.forEach(({ id, errorId, obligatorio, etiqueta }) => {
    const input = form.querySelector(`#${id}`);
    const errorEl = form.querySelector(`#${errorId}`);
    const valor = input.value.trim();
    if (obligatorio && !valor) {
      mostrarError(input, errorEl, `${etiqueta} es obligatorio.`);
      valido = false;
    } else if (valor && !validaciones.soloLetras(valor)) {
      mostrarError(input, errorEl, `${etiqueta} no puede contener números.`);
      valido = false;
    } else {
      limpiarError(input, errorEl);
    }
  });

  // Correo
  const correoInput = form.querySelector("#correo_electronico");
  const correoError = form.querySelector("#err_correo");
  if (!validaciones.requerido(correoInput.value) || !validaciones.correo(correoInput.value)) {
    mostrarError(correoInput, correoError, "Ingresa un correo electrónico válido.");
    valido = false;
  } else {
    limpiarError(correoInput, correoError);
  }

  // Semestre
  const semInput = form.querySelector("#semestre_actual");
  const semError = form.querySelector("#err_semestre");
  if (!validaciones.requerido(semInput.value) || !validaciones.semestrePositivo(semInput.value)) {
    mostrarError(semInput, semError, "El semestre debe ser un número entero positivo.");
    valido = false;
  } else {
    limpiarError(semInput, semError);
  }

  // Carrera — debe estar seleccionada del combo (hidden tiene valor)
  const carreraHidden = form.querySelector("#carrera_universitaria");
  const carreraSearch = form.querySelector("#carrera_search");
  const carreraError = form.querySelector("#err_carrera");
  if (!carreraHidden.value) {
    mostrarError(carreraSearch, carreraError, "Selecciona una carrera de la lista.");
    valido = false;
  } else {
    limpiarError(carreraSearch, carreraError);
  }

  // PDF
  const fileInput = form.querySelector("#hoja_vida");
  const fileError = form.querySelector("#err_hoja_vida");
  const archivo = fileInput.files[0];
  if (!archivo) {
    mostrarError(fileInput, fileError, "Debes seleccionar un archivo PDF.");
    valido = false;
  } else if (!validaciones.esPDF(archivo)) {
    mostrarError(fileInput, fileError, "Solo se permiten archivos PDF.");
    valido = false;
  } else if (!validaciones.tamanoMaximo(archivo)) {
    mostrarError(fileInput, fileError, "El archivo no puede superar 5 MB.");
    valido = false;
  } else {
    limpiarError(fileInput, fileError);
  }

  return valido;
}
