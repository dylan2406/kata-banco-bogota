const API_BASE = "http://localhost:5000/api";

const auth = {
  getToken: () => localStorage.getItem("token"),
  setToken: (t) => localStorage.setItem("token", t),
  removeToken: () => localStorage.removeItem("token"),
  headers() {
    const t = this.getToken();
    return t ? { "Authorization": `Bearer ${t}` } : {};
  },
};

const api = {
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) auth.setToken(data.token);
    return { ok: res.ok, status: res.status, data };
  },

  async logout() {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: auth.headers(),
    });
    auth.removeToken();
  },

  async me() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: auth.headers(),
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  },

  async registrarAnalista(datos) {
    const res = await fetch(`${API_BASE}/auth/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  },

  async registrarPracticante(formData) {
    const res = await fetch(`${API_BASE}/practicantes`, {
      method: "POST",
      body: formData,
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  },

  async listarPracticantes() {
    const res = await fetch(`${API_BASE}/practicantes`, {
      headers: auth.headers(),
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  },

  async obtenerPracticante(id) {
    const res = await fetch(`${API_BASE}/practicantes/${id}`, {
      headers: auth.headers(),
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  },

  async actualizarEstado(id, estado) {
    const res = await fetch(`${API_BASE}/practicantes/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...auth.headers() },
      body: JSON.stringify({ estado }),
    });
    return { ok: res.ok, data: await res.json() };
  },

  urlHojaVida(id) {
    const token = auth.getToken();
    return `${API_BASE}/practicantes/${id}/hoja-vida?token=${token}`;
  },
};
