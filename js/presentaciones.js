requireAuth();

document.addEventListener("DOMContentLoaded", async () => {

    injectNavbar();

    await cargarPresentaciones();

    const user = getUser();
    const isAdmin = user?.type === "ADMIN";

    const btn = document.getElementById("btnNuevaPresentacion");

    if (btn && !isAdmin) {
        btn.style.display = "none";
    }

    btn?.addEventListener("click", abrirModal);
});

/* =========================
   VARIABLES
========================= */

let presentaciones = [];
let editandoId = null;

/* =========================
   PERMISOS
========================= */

function esAdmin() {
    const user = getUser();
    return user?.type === "ADMIN";
}

function sinPermiso() {
    alert("❌ No tienes permisos para realizar esta acción");
}

/* =========================
   CARGAR
========================= */

async function cargarPresentaciones() {

    try {

        presentaciones =
            await apiFetch("/api/presentaciones");

        renderTabla();

    } catch (error) {

        console.error(error);

        document.getElementById("presentacionesBody").innerHTML =
            `<tr><td colspan="6">Error cargando datos</td></tr>`;
    }
}

/* =========================
   RENDER TABLA
========================= */

function renderTabla() {

    const body = document.getElementById("presentacionesBody");

    const filtro =
        document.getElementById("buscarUbicacion")?.value?.toLowerCase() || "";

    const user = getUser();
    const isAdmin = user?.type === "ADMIN";

    let lista = presentaciones;

    /* =========================
       🔥 FILTRO POR USUARIO
    ========================= */

    if (!isAdmin) {
        lista = lista.filter(p =>
            p.integranteId === user.id
        );
    }

    /* =========================
       FILTRO UBICACION
    ========================= */

    if (filtro) {
        lista = lista.filter(p =>
            p.location.toLowerCase().includes(filtro)
        );
    }

    body.innerHTML = "";

    lista.forEach(p => {

        body.innerHTML += `
        <tr>

            <td>${p.id}</td>
            <td>${p.date}</td>
            <td>${p.location}</td>
            <td>${p.integrante}</td>

            <!-- =========================
                 ASISTENCIA
            ========================= -->

            <td>

                ${
                    isAdmin
                    ? `
                        <select onchange="cambiarAsistencia(${p.id}, this.value)">

                            <option value="">${p.asisstance}</option>

                            <option value="PENDIENTE">PENDIENTE</option>
                            <option value="ASISTIO">ASISTIÓ</option>
                            <option value="TARDE">TARDE</option>
                            <option value="AUSENTE">AUSENTE</option>

                        </select>
                    `
                    : `<span>${p.asisstance}</span>`
                }

            </td>

            <!-- =========================
                 ACCIONES
            ========================= -->

            <td>

                ${
                    isAdmin
                    ? `
                        <button class="btn-primary"
                            onclick="editarPresentacion(${p.id})">
                            Editar
                        </button>

                        <button class="btn-danger"
                            onclick="eliminarPresentacion(${p.id})">
                            Eliminar
                        </button>
                    `
                    : `<span style="color:#999">Solo lectura</span>`
                }

            </td>

        </tr>
        `;
    });
}

/* =========================
   MODAL
========================= */

function abrirModal() {

    if (!esAdmin()) return sinPermiso();

    editandoId = null;

    document.getElementById("presForm").reset();

    document.getElementById("presModalTitle").textContent =
        "Nueva Presentación";

    document.getElementById("presModal").classList.remove("hidden");
}

function cerrarModal() {

    document.getElementById("presModal").classList.add("hidden");
}

/* =========================
   GUARDAR
========================= */

async function guardarPresentacion() {

    if (!esAdmin()) return sinPermiso();

    try {

        const body = {
            date: document.getElementById("inpFecha").value,
            location: document.getElementById("inpUbicacion").value
        };

        if (editandoId) {

            await apiFetch(
                `/api/presentaciones/${editandoId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(body)
                }
            );

        } else {

            await apiFetch(
                "/api/presentaciones",
                {
                    method: "POST",
                    body: JSON.stringify(body)
                }
            );
        }

        cerrarModal();
        await cargarPresentaciones();

    } catch (error) {

        alert(error.message);
    }
}

/* =========================
   EDITAR
========================= */

async function editarPresentacion(id) {

    if (!esAdmin()) return sinPermiso();

    const p = presentaciones.find(x => x.id === id);

    if (!p) return;

    editandoId = id;

    document.getElementById("inpFecha").value = p.date;
    document.getElementById("inpUbicacion").value = p.location;

    document.getElementById("presModalTitle").textContent =
        "Editar Presentación";

    document.getElementById("presModal").classList.remove("hidden");
}

/* =========================
   ELIMINAR
========================= */

async function eliminarPresentacion(id) {

    if (!esAdmin()) return sinPermiso();

    if (!confirm("¿Eliminar presentación?")) return;

    try {

        await apiFetch(
            `/api/presentaciones/${id}`,
            { method: "DELETE" }
        );

        await cargarPresentaciones();

    } catch (error) {

        alert(error.message);
    }
}

/* =========================
   ASISTENCIA (SOLO ADMIN)
========================= */

async function cambiarAsistencia(id, asistencia) {

    if (!esAdmin()) {
        sinPermiso();
        return;
    }

    if (!asistencia) return;

    try {

        await apiFetch(
            `/api/presentaciones/${id}/assistance/${asistencia}`,
            { method: "PUT" }
        );

        await cargarPresentaciones();

    } catch (error) {

        alert(error.message);
    }
}

/* =========================
   EXPORT
========================= */

window.cargarPresentaciones = cargarPresentaciones;
window.guardarPresentacion = guardarPresentacion;
window.editarPresentacion = editarPresentacion;
window.eliminarPresentacion = eliminarPresentacion;
window.cambiarAsistencia = cambiarAsistencia;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;