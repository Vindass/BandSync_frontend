const API_BASE =
"https://bandsync-gic7.onrender.com";

function getUser() {

    const raw = sessionStorage.getItem("user");

    if (!raw) return null;

    return JSON.parse(raw);
}

function requireAuth() {

    const user = sessionStorage.getItem("user");

    console.log("USER:", user);

    if (!user) {

        alert("No hay sesión");

        window.location.href = "../index.html";

        return;
    }
}

function logout() {

    sessionStorage.clear();

    window.location.href = "../index.html";
}

/* =======================================================
   🔥 FIX IMPORTANTE: NO ROMPER CON TEXTO NO JSON
======================================================= */

async function apiFetch(endpoint, options = {}) {

    const response = await fetch(API_BASE + endpoint, {
        headers: {
            "Content-Type": "application/json"
        },
        ...options
    });

    const text = await response.text();

    // ❌ si falló la petición
    if (!response.ok) {
        throw new Error(text);
    }

    // ✅ si viene vacío
    if (!text) {
        return null;
    }

    // ✅ intenta parsear JSON, si no es JSON devuelve texto
    try {
        return JSON.parse(text);
    } catch (e) {
        return text;
    }
}