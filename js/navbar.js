const API_BASE = "https://bandsync-gic7.onrender.com";

// ── Auth guard ─────────────────────────────────────
function requireAuth() {

  const user = sessionStorage.getItem("user");

  if (!user) {
    window.location.href = "../index.html";
    return null;
  }

  return JSON.parse(user);
}

function getUser() {

  const raw = sessionStorage.getItem("user");

  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function logout() {

  sessionStorage.clear();
  window.location.href = "../index.html";
}

// ── Fetch helper ───────────────────────────────────
async function apiFetch(endpoint, options = {}) {

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const res = await fetch(
    `${API_BASE}${endpoint}`,
    {
      ...options,
      headers
    }
  );

  if (res.status === 401) {
    logout();
    return;
  }

  if (!res.ok) {

    const msg = await res.text().catch(
      () => "Error del servidor"
    );

    throw new Error(msg);
  }

  const text = await res.text();

  return text ? JSON.parse(text) : null;
}

// ── Nav setup ──────────────────────────────────────
function setupNav(activePage) {

  const user = getUser();

  const navUser = document.getElementById("navUser");

  if (navUser && user) {

    const initial =
      (user.name || user.email || "U")[0].toUpperCase();

    navUser.innerHTML = `
      <div class="nav-avatar">${initial}</div>
      <span>${user.name || user.email || "Usuario"}</span>
      <button class="btn-logout" onclick="logout()">Salir</button>
    `;
  }

  document.querySelectorAll(".nav-link").forEach(link => {

    if (link.dataset.page === activePage) {
      link.classList.add("active");
    }
  });
}

// ── Helpers de sección ─────────────────────────────
function badgeSec(section) {

  const map = {
    bronces: "badge-bronces",
    maderas: "badge-maderas",
    percusion: "badge-percusion",
    percusión: "badge-percusion"
  };

  const key = (section || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const cls =
    Object.entries(map)
      .find(([k]) => key.includes(k))
      ?. [1] || "badge-bronces";

  return `<span class="badge ${cls}">${section}</span>`;
}

function badgeAsist(asist) {

  const a = (asist || "").toLowerCase();

  if (a.includes("pres")) {
    return `<span class="badge badge-presente">✓ Presente</span>`;
  }

  if (a.includes("tard")) {
    return `<span class="badge badge-tardanza">⏱ Tardanza</span>`;
  }

  return `<span class="badge badge-ausente">✗ Ausente</span>`;
}