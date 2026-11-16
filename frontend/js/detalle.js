document.addEventListener("DOMContentLoaded", async () => {
  // Redirigir inmediatamente si no hay token guardado
  if (!auth.getToken()) { location.replace("login.html"); return; }

  // Verificar que el token sigue siendo válido en el servidor
  try {
    const { ok, data } = await api.me();
    if (!ok) { location.replace("login.html"); return; }
    document.getElementById("nav-usuario").textContent = `👤 ${data.nombre}`;
  } catch {
    location.replace("login.html");
    return;
  }

  // Sesión confirmada — mostrar página
  document.body.style.visibility = "visible";

  document.getElementById("btn-logout").addEventListener("click", async () => {
    await api.logout();
    location.href = "login.html";
  });

  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  if (!id) { location.href = "../pages/analistas.html"; return; }

  const alertMsg = document.getElementById("alert-msg");
  const btnViable = document.getElementById("btn-viable");
  const btnNoViable = document.getElementById("btn-no-viable");
  const btnDescargar = document.getElementById("btn-descargar");

  cargarDetalle();

  async function cargarDetalle() {
    try {
      const { ok, data } = await api.obtenerPracticante(id);
      if (!ok) throw new Error(data.error || "No encontrado");
      renderDetalle(data);
    } catch (err) {
      document.getElementById("detalle-content").innerHTML =
        `<div class="alert alert-error visible">✗ ${err.message}</div>`;
    }
  }

  function renderDetalle(p) {
    document.getElementById("det-primer-nombre").textContent = p.primer_nombre;
    document.getElementById("det-segundo-nombre").textContent = p.segundo_nombre || "—";
    document.getElementById("det-primer-apellido").textContent = p.primer_apellido;
    document.getElementById("det-segundo-apellido").textContent = p.segundo_apellido;
    document.getElementById("det-correo").textContent = p.correo_electronico;
    document.getElementById("det-carrera").textContent = p.carrera_universitaria;
    document.getElementById("det-semestre").textContent = `Semestre ${p.semestre_actual}`;
    document.getElementById("det-fecha").textContent = new Date(p.fecha_registro).toLocaleString("es-CO");
    document.getElementById("det-archivo").textContent = p.nombre_archivo_original;
    const badgeEl = document.getElementById("det-estado");
    badgeEl.textContent = labelEstado(p.estado);
    badgeEl.className = `badge ${badgeClass(p.estado)}`;
    document.getElementById("page-title").textContent = p.nombre_completo;
    btnDescargar && (btnDescargar.href = api.urlHojaVida(id));
    actualizarBotones(p.estado);
  }

  async function cambiarEstado(nuevoEstado) {
    btnViable.disabled = true;
    btnNoViable.disabled = true;
    try {
      const { ok, data } = await api.actualizarEstado(id, nuevoEstado);
      if (ok) {
        renderDetalle(data.practicante);
        mostrarAlerta("success", `✓ Estado actualizado a: ${labelEstado(nuevoEstado)}`);
      } else {
        mostrarAlerta("error", "✗ " + (data.errores?.join(" ") || data.error || "Error al actualizar."));
      }
    } catch {
      mostrarAlerta("error", "✗ No se pudo conectar con el servidor.");
    }
  }

  btnViable?.addEventListener("click", () => cambiarEstado("VIABLE"));
  btnNoViable?.addEventListener("click", () => cambiarEstado("NO_VIABLE"));

  function actualizarBotones(estado) {
    btnViable.disabled = estado === "VIABLE";
    btnNoViable.disabled = estado === "NO_VIABLE";
  }

  function mostrarAlerta(tipo, msg) {
    alertMsg.textContent = msg;
    alertMsg.className = `alert alert-${tipo} visible`;
    setTimeout(() => alertMsg.classList.remove("visible"), 4000);
  }

  function badgeClass(estado) {
    return { PENDIENTE: "badge-pendiente", VIABLE: "badge-viable", NO_VIABLE: "badge-no-viable" }[estado] || "";
  }

  function labelEstado(estado) {
    return { PENDIENTE: "Pendiente", VIABLE: "Viable", NO_VIABLE: "No Viable" }[estado] || estado;
  }
});
