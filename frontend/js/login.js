document.addEventListener("DOMContentLoaded", async () => {
  // Si ya hay token local, verificar con el servidor y redirigir al panel
  if (auth.getToken()) {
    try {
      const { ok } = await api.me();
      if (ok) { location.replace("analistas.html"); return; }
    } catch { /* token inválido, continuar al login */ }
    auth.removeToken();
  }

  // Mostrar formulario de login
  document.body.style.visibility = "visible";

  const form = document.getElementById("form-login");
  const alertError = document.getElementById("alert-error");
  const btnLogin = document.getElementById("btn-login");
  const togglePass = document.getElementById("btn-toggle-pass");
  const passInput = document.getElementById("password");

  togglePass.addEventListener("click", () => {
    passInput.type = passInput.type === "password" ? "text" : "password";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    alertError.classList.remove("visible");

    const username = document.getElementById("username").value.trim();
    const password = passInput.value;

    // Validación básica frontend
    let valido = true;
    if (!username) {
      document.getElementById("err_username").textContent = "El usuario es obligatorio.";
      document.getElementById("err_username").classList.add("visible");
      document.getElementById("username").classList.add("error");
      valido = false;
    } else {
      document.getElementById("err_username").classList.remove("visible");
      document.getElementById("username").classList.remove("error");
    }
    if (!password) {
      document.getElementById("err_password").textContent = "La contraseña es obligatoria.";
      document.getElementById("err_password").classList.add("visible");
      passInput.classList.add("error");
      valido = false;
    } else {
      document.getElementById("err_password").classList.remove("visible");
      passInput.classList.remove("error");
    }
    if (!valido) return;

    btnLogin.disabled = true;
    btnLogin.textContent = "Verificando...";

    try {
      const { ok, data } = await api.login(username, password);
      if (ok) {
        location.href = "analistas.html";
      } else {
        alertError.textContent = "✗ " + (data.error || "Credenciales incorrectas.");
        alertError.classList.add("visible");
      }
    } catch {
      alertError.textContent = "✗ No se pudo conectar con el servidor.";
      alertError.classList.add("visible");
    } finally {
      btnLogin.disabled = false;
      btnLogin.textContent = "Iniciar sesión";
    }
  });
});
