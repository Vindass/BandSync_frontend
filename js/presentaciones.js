requireAuth();

let presentaciones = [];
let editandoId = null;

document.addEventListener("DOMContentLoaded", async () => {
    injectNavbar();
    await cargarPresentaciones();

    const user = getUser();
    if (user?.type !== "ADMIN") {
        document.getElementById("btnNuevaPresentacion").style.display = "none";
    }
});

async function cargarPresentaciones() {
    try {
        presentaciones = await apiFetch("/api/presentaciones") || [];
        renderTabla();
    } catch (e) {
        console.error(e);
    }
}

function renderTabla(lista = null) {
    const body = document.getElementById("presentacionesBody");
    const user = getUser();

    let items = lista ?? [...presentaciones];

    if (user?.type !== "ADMIN") {
        items = items.filter(p => p.integranteId === user.id);
    }

    if (items.length === 0) {
        body.innerHTML = `<tr><td colspan="6">No hay presentaciones</td></tr>`;
        return;
    }

    body.innerHTML = items.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.date}</td>
            <td>${p.location}</td>
            <td>${p.integrante || "Sin nombre"}</td>
            <td>
                ${user?.type === "ADMIN" ? `
                    <select onchange="cambiarAsistencia(${p.id}, this.value)">
                        <option value="PENDIENTE" ${p.assistance === "PENDIENTE" ? "selected" : ""}>PENDIENTE</option>
                        <option value="PRESENTE"  ${p.assistance === "PRESENTE"  ? "selected" : ""}>PRESENTE</option>
                        <option value="AUSENTE"   ${p.assistance === "AUSENTE"   ? "selected" : ""}>AUSENTE</option>
                    </select>
                ` : (p.assistance || "PENDIENTE")}
            </td>
            <td>
                ${user?.type === "ADMIN" ? `
                    <button class="btn-primary" onclick="editarPresentacion(${p.id})">Editar</button>
                    <button class="btn-danger"  onclick="eliminarPresentacion(${p.id})">Eliminar</button>
                ` : "-"}
            </td>
        </tr>
    `).join("");
}

function buscarPresentaciones() {
    const texto = document.getElementById("buscarTexto").value.toLowerCase();
    const fecha  = document.getElementById("buscarFecha").value;

    let lista = [...presentaciones];

    if (texto) {
        lista = lista.filter(p =>
            String(p.id).includes(texto) ||
            p.location?.toLowerCase().includes(texto) ||
            p.integrante?.toLowerCase().includes(texto)
        );
    }

    if (fecha) {
        lista = lista.filter(p => p.date?.startsWith(fecha));
    }

    renderTabla(lista);
}

function abrirModal(presentacion = null) {
    editandoId = null;
    document.getElementById("inpFecha").value     = "";
    document.getElementById("inpUbicacion").value = "";

    if (presentacion) {
        editandoId = presentacion.id;
        document.getElementById("inpFecha").value     = presentacion.date?.substring(0, 16) || "";
        document.getElementById("inpUbicacion").value = presentacion.location || "";
    }

    document.getElementById("presModal").classList.remove("hidden");
}

function cerrarModal() {
    editandoId = null;
    document.getElementById("presModal").classList.add("hidden");
}

async function guardarPresentacion() {
    const fecha     = document.getElementById("inpFecha").value;
    const ubicacion = document.getElementById("inpUbicacion").value;

    if (!fecha || !ubicacion) {
        alert("Por favor completá todos los campos.");
        return;
    }

    const payload = { date: fecha, location: ubicacion };

    try {
        if (editandoId) {
            await apiFetch(`/api/presentaciones/${editandoId}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
        } else {
            await apiFetch("/api/presentaciones", {
                method: "POST",
                body: JSON.stringify(payload)
            });
        }

        cerrarModal();
        await cargarPresentaciones();
    } catch (e) {
        console.error(e);
        alert("Error al guardar la presentación.");
    }
}

function editarPresentacion(id) {
    const p = presentaciones.find(x => x.id === id);
    if (!p) return;
    abrirModal(p);
}

async function eliminarPresentacion(id) {
    if (!confirm("¿Eliminar?")) return;
    try {
        await apiFetch(`/api/presentaciones/${id}`, { method: "DELETE" });
        await cargarPresentaciones();
    } catch (e) {
        console.error(e);
        alert("Error al eliminar la presentación.");
    }
}

async function cambiarAsistencia(id, value) {
    try {
        await apiFetch(`/api/presentaciones/${id}/assistance/${value}`, { method: "PUT" });
        await cargarPresentaciones();
    } catch (e) {
        console.error(e);
        alert("Error al cambiar la asistencia.");
        renderTabla();
    }
}

window.cargarPresentaciones  = cargarPresentaciones;
window.buscarPresentaciones  = buscarPresentaciones;
window.guardarPresentacion   = guardarPresentacion;
window.editarPresentacion    = editarPresentacion;
window.eliminarPresentacion  = eliminarPresentacion;
window.cambiarAsistencia     = cambiarAsistencia;
window.abrirModal            = abrirModal;
window.cerrarModal           = cerrarModal;