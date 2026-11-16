document.addEventListener("DOMContentLoaded", async () => {
  // Si ya hay sesión activa, ir directo al panel
  if (auth.getToken()) {
    try {
      const { ok } = await api.me();
      if (ok) { location.replace("analistas.html"); return; }
    } catch { /* token inválido */ }
    auth.removeToken();
  }

  document.body.style.visibility = "visible";

  // ── Tabs ──────────────────────────────────────────────────────────
  const tabs = document.querySelectorAll(".rg-tab");
  const panels = { login: document.getElementById("tab-login"), registro: document.getElementById("tab-registro") };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      Object.values(panels).forEach((p) => (p.style.display = "none"));
      panels[tab.dataset.tab].style.display = "block";
    });
  });

  // ── Toggle contraseña ─────────────────────────────────────────────
  document.querySelectorAll(".btn-eye").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      input.type = input.type === "password" ? "text" : "password";
    });
  });

  // ── Indicador de fortaleza de contraseña ──────────────────────────
  const REGLAS = [
    { id: "rule-len",     test: (p) => p.length >= 8,                label: "Mínimo 8 caracteres" },
    { id: "rule-upper",   test: (p) => /[A-Z]/.test(p),             label: "Al menos una mayúscula" },
    { id: "rule-lower",   test: (p) => /[a-z]/.test(p),             label: "Al menos una minúscula" },
    { id: "rule-num",     test: (p) => /\d/.test(p),                label: "Al menos un número" },
    { id: "rule-special", test: (p) => /[!@#$%^&*()\-_=+\[\]{};:',.<>?/|`~]/.test(p), label: "Al menos un carácter especial" },
  ];
  const NIVELES = [
    { clase: "pwd-strength-weak",   texto: "Débil",    color: "var(--danger)" },
    { clase: "pwd-strength-fair",   texto: "Regular",   color: "var(--warning)" },
    { clase: "pwd-strength-good",   texto: "Buena",     color: "#f0a500" },
    { clase: "pwd-strength-strong", texto: "Fuerte ✓",  color: "var(--success)" },
  ];

  const pwdInput = document.getElementById("reg-password");
  const strengthBox = document.getElementById("password-strength");
  const barFill = document.getElementById("pwd-bar-fill");
  const strengthLabel = document.getElementById("pwd-strength-label");

  pwdInput.addEventListener("input", () => {
    const val = pwdInput.value;
    if (!val) { strengthBox.style.display = "none"; return; }
    strengthBox.style.display = "block";

    let cumplidas = 0;
    REGLAS.forEach(({ id, test }) => {
      const li = document.getElementById(id);
      const ok = test(val);
      li.classList.toggle("ok", ok);
      li.textContent = (ok ? "✓ " : "✕ ") + li.textContent.slice(2);
      if (ok) cumplidas++;
    });

    const idx = Math.min(Math.floor((cumplidas - 1)), 3);
    const nivel = cumplidas === 0 ? null : NIVELES[idx];
    strengthBox.className = "pwd-strength" + (nivel ? " " + nivel.clase : "");
    strengthLabel.textContent = nivel ? nivel.texto : "";
    strengthLabel.style.color = nivel ? nivel.color : "";
  });

  // ── LOGIN ─────────────────────────────────────────────────────────
  const formLogin = document.getElementById("form-login");
  const alertLoginError = document.getElementById("alert-login-error");

  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    alertLoginError.classList.remove("visible");

    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    if (!validarCampo("login-username", "err-login-username", username, "El usuario es obligatorio.")) return;
    if (!validarCampo("login-password", "err-login-password", password, "La contraseña es obligatoria.")) return;

    const btn = document.getElementById("btn-login");
    btn.disabled = true; btn.textContent = "Verificando...";

    try {
      const { ok, data } = await api.login(username, password);
      if (ok) {
        location.replace("analistas.html");
      } else {
        mostrarAlerta(alertLoginError, data.error || "Credenciales incorrectas.");
      }
    } catch {
      mostrarAlerta(alertLoginError, "No se pudo conectar con el servidor.");
    } finally {
      btn.disabled = false; btn.textContent = "Iniciar sesión";
    }
  });

  // ── REGISTRO ANALISTA ─────────────────────────────────────────────
  const formReg = document.getElementById("form-registro-analista");
  const alertRegError = document.getElementById("alert-reg-error");
  const alertRegSuccess = document.getElementById("alert-reg-success");

  formReg.addEventListener("submit", async (e) => {
    e.preventDefault();
    alertRegError.classList.remove("visible");
    alertRegSuccess.classList.remove("visible");

    const nombre = document.getElementById("reg-nombre").value.trim();
    const username = document.getElementById("reg-username").value.trim();
    const correo = document.getElementById("reg-correo").value.trim();
    const password = document.getElementById("reg-password").value;
    const password2 = document.getElementById("reg-password2").value;

    let valido = true;
    if (!validarCampo("reg-nombre", "err-reg-nombre", nombre, "El nombre es obligatorio.")) valido = false;
    if (!validarCampo("reg-username", "err-reg-username", username, "El usuario es obligatorio.")) valido = false;
    if (!validarCampoCorreo("reg-correo", "err-reg-correo", correo)) valido = false;
    const incumplidas = REGLAS.filter(({ test }) => !test(password));
    if (incumplidas.length > 0) {
      setError("reg-password", "err-reg-password", "La contraseña no cumple los requisitos de seguridad.");
      valido = false;
    } else {
      clearError("reg-password", "err-reg-password");
    }
    if (password !== password2) {
      setError("reg-password2", "err-reg-password2", "Las contraseñas no coinciden.");
      valido = false;
    } else {
      clearError("reg-password2", "err-reg-password2");
    }
    if (!valido) return;

    const btn = document.getElementById("btn-registrar");
    btn.disabled = true; btn.textContent = "Creando cuenta...";

    try {
      const { ok, status, data } = await api.registrarAnalista({ nombre, username, correo, password });
      if (ok) {
        formReg.reset();
        mostrarAlerta(alertRegSuccess, `✓ Cuenta creada para ${nombre}. Ya puede iniciar sesión.`);
        setTimeout(() => {
          tabs[0].click();
          document.getElementById("login-username").value = username;
        }, 1500);
      } else {
        mostrarAlerta(alertRegError, data.error || data.errores?.join(" ") || `Error ${status} al crear la cuenta.`);
      }
    } catch (err) {
      mostrarAlerta(alertRegError, "No se pudo conectar con el servidor. Verifica que Flask esté en ejecución.");
    } finally {
      btn.disabled = false; btn.textContent = "Crear cuenta de analista";
    }
  });

  // ── Helpers ───────────────────────────────────────────────────────
  function validarCampo(inputId, errorId, valor, msg) {
    if (!valor) { setError(inputId, errorId, msg); return false; }
    clearError(inputId, errorId);
    return true;
  }

  function validarCampoCorreo(inputId, errorId, valor) {
    if (!valor || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      setError(inputId, errorId, "Ingresa un correo válido.");
      return false;
    }
    clearError(inputId, errorId);
    return true;
  }

  function setError(inputId, errorId, msg) {
    document.getElementById(inputId).classList.add("error");
    const el = document.getElementById(errorId);
    el.textContent = msg; el.classList.add("visible");
  }

  function clearError(inputId, errorId) {
    document.getElementById(inputId).classList.remove("error");
    document.getElementById(errorId).classList.remove("visible");
  }

  function mostrarAlerta(el, msg) {
    el.textContent = msg;
    el.classList.add("visible");
  }
});
