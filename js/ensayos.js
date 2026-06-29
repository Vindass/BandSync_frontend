requireAuth();

let ensayos = [];
let editandoId = null;

document.addEventListener("DOMContentLoaded", async () => {
    injectNavbar();
    await cargarEnsayos();

    const user = getUser();
    if (user?.type !== "ADMIN") {
        document.getElementById("btnNuevoEnsayo").style.display = "none";
    }
});

// ─── API ─────────────────────────────────────────────────────────────────────

async function cargarEnsayos() {
    try {
        ensayos = await apiFetch("/api/ensayos") || [];
        renderTabla();
    } catch (e) {
        console.error(e);
        document.getElementById("ensayosBody").innerHTML =
            `<tr><td colspan="6">Error cargando ensayos</td></tr>`;
    }
}

// ─── TABLA ───────────────────────────────────────────────────────────────────

function renderTabla() {
    const body = document.getElementById("ensayosBody");
    const user = getUser();

    let lista = [...ensayos];

    if (user?.type !== "ADMIN") {
        lista = lista.filter(e => e.integranteId === user.id);
    }

    const texto = document.getElementById("buscarTexto")?.value?.toLowerCase();
    const fecha  = document.getElementById("buscarFecha")?.value;

    if (texto) {
        lista = lista.filter(e =>
            String(e.id).includes(texto) ||
            e.section?.toLowerCase().includes(texto) ||
            e.integrante?.toLowerCase().includes(texto)
        );
    }

    if (fecha) {
        lista = lista.filter(e => e.date?.startsWith(fecha));
    }

    if (lista.length === 0) {
        body.innerHTML = `<tr><td colspan="6">No hay ensayos</td></tr>`;
        return;
    }

    body.innerHTML = lista.map(e => {
        const asistencia = e.assistance || "PENDIENTE";
        return `
        <tr>
            <td>${e.id}</td>
            <td>${e.date}</td>
            <td>${e.section}</td>
            <td>${e.integrante || "Sin nombre"}</td>
            <td>
                ${user?.type === "ADMIN" ? `
                    <select onchange="cambiarAsistencia(${e.id}, this.value)">
                        <option value="PENDIENTE" ${asistencia === "PENDIENTE" ? "selected" : ""}>PENDIENTE</option>
                        <option value="PRESENTE"  ${asistencia === "PRESENTE"  ? "selected" : ""}>PRESENTE</option>
                        <option value="AUSENTE"   ${asistencia === "AUSENTE"   ? "selected" : ""}>AUSENTE</option>
                    </select>
                ` : asistencia}
            </td>
            <td>
                ${user?.type === "ADMIN" ? `
                    <button class="btn-primary" onclick="editarEnsayo(${e.id})">Editar</button>
                    <button class="btn-danger"  onclick="eliminarEnsayo(${e.id})">Eliminar</button>
                ` : "-"}
            </td>
        </tr>`;
    }).join("");
}

function buscarEnsayos() {
    renderTabla();
}

// ─── MODAL ───────────────────────────────────────────────────────────────────

function abrirModal() {
    editandoId = null;
    document.getElementById("inpFecha").value   = "";
    document.getElementById("inpSection").value = "GENERAL";
    document.getElementById("ensayoModalTitle").textContent = "Nuevo Ensayo";
    document.getElementById("ensayoModal").classList.remove("hidden");
}

function cerrarModal() {
    editandoId = null;
    document.getElementById("ensayoModal").classList.add("hidden");
}

function editarEnsayo(id) {
    const ensayo = ensayos.find(e => e.id === id);
    if (!ensayo) return;

    editandoId = id;
    document.getElementById("ensayoModalTitle").textContent = "Editar Ensayo";
    document.getElementById("inpFecha").value   = ensayo.date?.substring(0, 16) || "";
    document.getElementById("inpSection").value = ensayo.section || "GENERAL";
    document.getElementById("ensayoModal").classList.remove("hidden");
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

async function guardarEnsayo() {
    const fecha   = document.getElementById("inpFecha").value;
    const section = document.getElementById("inpSection").value;

    if (!fecha || !section) {
        alert("Por favor completá todos los campos.");
        return;
    }

    const payload = { date: fecha, section };

    try {
        if (editandoId) {
            await apiFetch(`/api/ensayos/${editandoId}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
        } else {
            await apiFetch("/api/ensayos", {
                method: "POST",
                body: JSON.stringify(payload)
            });
        }

        cerrarModal();
        await cargarEnsayos();
    } catch (e) {
        console.error(e);
        alert("Error al guardar el ensayo.");
    }
}

async function eliminarEnsayo(id) {
    if (!confirm("¿Eliminar ensayo?")) return;
    try {
        await apiFetch(`/api/ensayos/${id}`, { method: "DELETE" });
        await cargarEnsayos();
    } catch (e) {
        console.error(e);
        alert("Error al eliminar el ensayo.");
    }
}

async function cambiarAsistencia(id, value) {
    // Guardamos el valor anterior por si falla
    const ensayoAnterior = ensayos.find(e => e.id === id);
    const valorAnterior  = ensayoAnterior?.assistance || "PENDIENTE";

    try {
        await apiFetch(`/api/ensayos/${id}/assistance/${value}`, { method: "PUT" });
        await cargarEnsayos(); // refresca con el nuevo valor
    } catch (e) {
        console.error(e);
        alert("Error al cambiar la asistencia. No se aplicó el cambio.");
        // Revierte el select visualmente sin recargar
        renderTabla();
    }
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

window.cargarEnsayos     = cargarEnsayos;
window.buscarEnsayos     = buscarEnsayos;
window.abrirModal        = abrirModal;
window.cerrarModal       = cerrarModal;
window.guardarEnsayo     = guardarEnsayo;
window.editarEnsayo      = editarEnsayo;
window.eliminarEnsayo    = eliminarEnsayo;
window.cambiarAsistencia = cambiarAsistencia;