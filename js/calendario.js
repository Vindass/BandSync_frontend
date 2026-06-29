requireAuth();

document.addEventListener("DOMContentLoaded", async () => {

    injectNavbar();

    await cargarEventos();

    renderizarCalendario();
});

let fechaActual = new Date();

let ensayos = [];
let presentaciones = [];

/* =========================
   CARGAR DATOS
========================= */
async function cargarEventos() {

    try {
        ensayos = await apiFetch("/api/ensayos") || [];
    } catch {
        ensayos = [];
    }

    try {
        presentaciones = await apiFetch("/api/presentaciones") || [];
    } catch {
        presentaciones = [];
    }
}

/* =========================
   NAVEGACIÓN
========================= */
document.addEventListener("click", e => {

    if (e.target.id === "btnPrev") {
        fechaActual.setMonth(fechaActual.getMonth() - 1);
        renderizarCalendario();
    }

    if (e.target.id === "btnNext") {
        fechaActual.setMonth(fechaActual.getMonth() + 1);
        renderizarCalendario();
    }

    if (e.target.id === "btnCerrarModal") {
        document.getElementById("dayModal").classList.add("hidden");
    }
});

/* =========================
   CALENDARIO
========================= */
function renderizarCalendario() {

    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();

    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);

    document.getElementById("calendarTitle").textContent =
        primerDia.toLocaleDateString("es-CR", {
            month: "long",
            year: "numeric"
        });

    const grid = document.getElementById("calendarGrid");
    grid.innerHTML = "";

    for (let i = 0; i < primerDia.getDay(); i++) {
        const empty = document.createElement("div");
        empty.className = "calendar-day";
        grid.appendChild(empty);
    }

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {

        const fecha = `${año}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

        const eventos = obtenerEventos(fecha);

        const cell = document.createElement("div");
        cell.className = "calendar-day";

        let html = `<div class="day-number">${dia}</div>`;

        eventos.forEach(ev => {

            html += `
                <div class="${ev.clase}">
                    <strong>${ev.tipo}</strong><br>
                    🕒 ${ev.hora || "N/A"}<br>

                    ${ev.tipo.includes("Ensayo")
                        ? `🧭 ${ev.section || "Sin sección"}`
                        : `📍 ${ev.location || "Sin ubicación"}`
                    }
                </div>
            `;
        });

        cell.innerHTML = html;

        if (eventos.length > 0) {
            cell.addEventListener("click", () =>
                abrirModal(fecha, eventos)
            );
        }

        grid.appendChild(cell);
    }
}


function obtenerEventos(fecha) {

    let lista = [];

    /* ================= ENSAYOS ================= */
    const ensayosDelDia = ensayos.filter(e =>
        e.date?.startsWith(fecha)
    );

    if (ensayosDelDia.length > 0) {

        const e = ensayosDelDia[0];

        lista.push({
            tipo: `🎵 Ensayo (${ensayosDelDia.length})`,
            clase: "evento-ensayo",
            hora: e.date?.substring(11, 16),
            section: e.section
        });
    }

    /* ================= PRESENTACIONES ================= */
    const presentacionesDelDia = presentaciones.filter(p =>
        p.date?.startsWith(fecha)
    );

    if (presentacionesDelDia.length > 0) {

        const p = presentacionesDelDia[0];

        lista.push({
            tipo: `🎪 Presentación (${presentacionesDelDia.length})`,
            clase: "evento-presentacion",
            hora: p.date?.substring(11, 16),
            location: p.location
        });
    }

    return lista;
}

/* =========================
   MODAL
========================= */
function abrirModal(fecha, eventos) {

    document.getElementById("modalDate").textContent = fecha;

    let html = "";

    eventos.forEach(ev => {

        html += `
            <div class="card">
                <h4>${ev.tipo}</h4>
                🕒 ${ev.hora || "N/A"} <br>

                ${ev.tipo.includes("Ensayo")
                    ? `🧭 ${ev.section || ""}`
                    : `📍 ${ev.location || ""}`
                }
            </div>
        `;
    });

    document.getElementById("modalContent").innerHTML = html;
    document.getElementById("dayModal").classList.remove("hidden");
}