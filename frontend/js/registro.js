document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("form-registro");
  const alertSuccess = document.getElementById("alert-success");
  const alertError = document.getElementById("alert-error");
  const btnSubmit = document.getElementById("btn-submit");
  const fileInput = document.getElementById("hoja_vida");
  const fileLabel = document.getElementById("file-label-text");

  // ── Combobox de carreras ──────────────────────────────────────────
  const searchInput = document.getElementById("carrera_search");
  const hiddenInput = document.getElementById("carrera_universitaria");
  const lista = document.getElementById("carrera-lista");
  let carreras = [];

  try {
    const res = await fetch("http://localhost:5000/api/carreras");
    carreras = await res.json();
  } catch {
    carreras = [];
  }

  function renderLista(filtro = "") {
    const q = filtro.toLowerCase().trim();
    const filtradas = q ? carreras.filter((c) => c.toLowerCase().includes(q)) : carreras;
    lista.innerHTML = "";
    if (!filtradas.length) {
      lista.innerHTML = `<li class="no-results">Sin resultados</li>`;
    } else {
      filtradas.forEach((carrera) => {
        const li = document.createElement("li");
        li.textContent = carrera;
        li.setAttribute("role", "option");
        li.addEventListener("mousedown", (e) => {
          e.preventDefault();
          seleccionarCarrera(carrera);
        });
        lista.appendChild(li);
      });
    }
  }

  function seleccionarCarrera(carrera) {
    hiddenInput.value = carrera;
    searchInput.value = carrera;
    searchInput.classList.remove("error");
    document.getElementById("err_carrera").classList.remove("visible");
    cerrarLista();
  }

  function abrirLista() {
    renderLista(searchInput.value);
    lista.classList.add("open");
  }

  function cerrarLista() {
    lista.classList.remove("open");
  }

  searchInput.addEventListener("focus", abrirLista);
  searchInput.addEventListener("input", () => {
    hiddenInput.value = ""; // invalida selección previa al escribir
    renderLista(searchInput.value);
    lista.classList.add("open");
  });
  searchInput.addEventListener("blur", () => setTimeout(cerrarLista, 150));

  // Navegación con teclado
  searchInput.addEventListener("keydown", (e) => {
    const items = [...lista.querySelectorAll("li:not(.no-results)")];
    const active = lista.querySelector("li.active");
    let idx = items.indexOf(active);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      active?.classList.remove("active");
      items[Math.min(idx + 1, items.length - 1)]?.classList.add("active");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      active?.classList.remove("active");
      items[Math.max(idx - 1, 0)]?.classList.add("active");
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = lista.querySelector("li.active");
      if (sel) seleccionarCarrera(sel.textContent);
    } else if (e.key === "Escape") {
      cerrarLista();
    }
  });

  // ── File input ────────────────────────────────────────────────────
  fileInput.addEventListener("change", () => {
    const archivo = fileInput.files[0];
    const label = document.querySelector(".file-label");
    if (archivo) {
      fileLabel.textContent = archivo.name;
      label?.classList.add("has-file");
    } else {
      fileLabel.textContent = "Seleccionar archivo PDF";
      label?.classList.remove("has-file");
    }
  });

  // ── Submit ────────────────────────────────────────────────────────
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarAlertas();
    if (!validarFormularioRegistro(form)) return;

    btnSubmit.disabled = true;
    btnSubmit.textContent = "Enviando...";

    try {
      const { ok, data } = await api.registrarPracticante(new FormData(form));
      if (ok) {
        mostrarAlerta(alertSuccess, "✓ Practicante registrado exitosamente.");
        form.reset();
        hiddenInput.value = "";
        fileLabel.textContent = "Seleccionar archivo PDF";
        document.querySelector(".file-label")?.classList.remove("has-file");
      } else {
        const msgs = data.errores ? data.errores.join(" | ") : (data.error || "Error al registrar.");
        mostrarAlerta(alertError, "✗ " + msgs);
      }
    } catch {
      mostrarAlerta(alertError, "✗ No se pudo conectar con el servidor. Verifica que Flask esté en ejecución.");
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Registrar Practicante";
    }
  });

  function mostrarAlerta(el, msg) {
    el.textContent = msg;
    el.classList.add("visible");
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function ocultarAlertas() {
    alertSuccess.classList.remove("visible");
    alertError.classList.remove("visible");
  }
});
