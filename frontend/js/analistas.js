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

  const tbody = document.getElementById("tabla-body");
  const stateLoading = document.getElementById("state-loading");
  const stateEmpty = document.getElementById("state-empty");
  const stateError = document.getElementById("state-error");
  const searchInput = document.getElementById("search");
  const statTotal = document.getElementById("stat-total");
  const statPendiente = document.getElementById("stat-pendiente");
  const statViable = document.getElementById("stat-viable");
  const statNoViable = document.getElementById("stat-no-viable");

  let practicantes = [];

  cargarPracticantes();

  async function cargarPracticantes() {
    mostrarEstado("loading");
    try {
      const { ok, status, data } = await api.listarPracticantes();
      if (status === 401 || status === 403) { location.href = "login.html"; return; }
      if (!ok) throw new Error();
      practicantes = data;
      actualizarStats();
      renderTabla(practicantes);
    } catch {
      mostrarEstado("error");
    }
  }

  function renderTabla(lista) {
    tbody.innerHTML = "";
    if (lista.length === 0) { mostrarEstado("empty"); return; }
    mostrarEstado("none");
    lista.forEach((p) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${escHtml(p.nombre_completo)}</td>
        <td>${escHtml(p.correo_electronico)}</td>
        <td>${escHtml(p.carrera_universitaria)}</td>
        <td>${p.semestre_actual}</td>
        <td><span class="badge ${badgeClass(p.estado)}">${labelEstado(p.estado)}</span></td>
        <td><a href="detalle.html?id=${p.id}" class="btn btn-sm btn-primary">Ver</a></td>`;
      tbody.appendChild(tr);
    });
  }

  function actualizarStats() {
    statTotal.textContent = practicantes.length;
    statPendiente.textContent = practicantes.filter((p) => p.estado === "PENDIENTE").length;
    statViable.textContent = practicantes.filter((p) => p.estado === "VIABLE").length;
    statNoViable.textContent = practicantes.filter((p) => p.estado === "NO_VIABLE").length;
  }

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    renderTabla(practicantes.filter((p) =>
      p.nombre_completo.toLowerCase().includes(q) ||
      p.correo_electronico.toLowerCase().includes(q) ||
      p.carrera_universitaria.toLowerCase().includes(q)
    ));
  });

  document.getElementById("btn-refresh").addEventListener("click", cargarPracticantes);

  function mostrarEstado(estado) {
    stateLoading.style.display = estado === "loading" ? "block" : "none";
    stateEmpty.style.display = estado === "empty" ? "block" : "none";
    stateError.style.display = estado === "error" ? "block" : "none";
    tbody.style.display = estado === "none" ? "" : "none";
  }

  function badgeClass(e) {
    return { PENDIENTE: "badge-pendiente", VIABLE: "badge-viable", NO_VIABLE: "badge-no-viable" }[e] || "badge-pendiente";
  }

  function labelEstado(e) {
    return { PENDIENTE: "Pendiente", VIABLE: "Viable", NO_VIABLE: "No Viable" }[e] || e;
  }

  function escHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
});
