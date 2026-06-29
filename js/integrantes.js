requireAuth();

let integrantes = [];
let instrumentos = [];
let editandoId = null;

document.addEventListener("DOMContentLoaded", async () => {
    injectNavbar();
    await cargarInstrumentos();
    await cargarIntegrantes();

    const user = getUser();
    if (user?.type !== "ADMIN") {
        document.getElementById("btnNuevoIntegrante").style.display = "none";
    }

    document.getElementById("inpRol")?.addEventListener("change", cambiarRol);
    document.getElementById("btnNuevoIntegrante")?.addEventListener("click", () => abrirModal());
});

// ─── API ─────────────────────────────────────────────────────────────────────

async function cargarInstrumentos() {
    try {
        instrumentos = await apiFetch("/api/instrumentos") || [];
        const select = document.getElementById("inpInstrumento");
        select.innerHTML = `<option value="">Sin instrumento</option>`;
        instrumentos.forEach(inst => {
            select.innerHTML += `<option value="${inst.id}">${inst.name} (${inst.quantity})</option>`;
        });
    } catch (error) {
        console.error(error);
    }
}

async function cargarIntegrantes() {
    try {
        integrantes = await apiFetch("/api/integrantes") || [];
        renderTabla();
    } catch (error) {
        console.error(error);
        document.getElementById("integrantesBody").innerHTML =
            `<tr><td colspan="8">Error cargando datos</td></tr>`;
    }
}

// ─── TABLA ───────────────────────────────────────────────────────────────────

function aplicarBusqueda(lista) {
    const texto   = document.getElementById("buscarTexto").value.trim().toLowerCase();
    const tipo    = document.getElementById("filtroTipo").value;
    const seccion = document.getElementById("filtroSeccionI").value;

    let resultado = lista;

    if (texto) {
        resultado = resultado.filter(i =>
            i.name.toLowerCase().includes(texto) ||
            i.email.toLowerCase().includes(texto) ||
            i.id.toString() === texto
        );
    }
    if (tipo)    resultado = resultado.filter(i => i.type === tipo);
    if (seccion) resultado = resultado.filter(i => i.section === seccion);

    return resultado;
}

function renderTabla() {
    const body = document.getElementById("integrantesBody");
    const user = getUser();
    const lista = aplicarBusqueda(integrantes);

    if (lista.length === 0) {
        body.innerHTML = `<tr><td colspan="8">Sin resultados</td></tr>`;
        return;
    }

    body.innerHTML = lista.map(i => `
        <tr>
            <td>${i.id}</td>
            <td>${i.name}</td>
            <td>${i.email}</td>
            <td>${i.age}</td>
            <td>${i.type}</td>
            <td>${i.section}</td>
            <td>${i.instrument || "-"}</td>
            <td>
                ${user?.type === "ADMIN" ? `
                    <button class="btn-primary" onclick="editarIntegrante(${i.id})">Editar</button>
                    <button class="btn-danger"  onclick="eliminarIntegrante(${i.id})">Eliminar</button>
                ` : "-"}
            </td>
        </tr>
    `).join("");
}

// ─── MODAL ───────────────────────────────────────────────────────────────────

function abrirModal(integrante = null) {
    editandoId = null;

    // Rehabilitar campos por si quedaron deshabilitados
    document.getElementById("inpSeccionI").disabled    = false;
    document.getElementById("inpInstrumento").disabled = false;

    // Limpiar todos los campos
    document.getElementById("inpNombre").value      = "";
    document.getElementById("inpEmail").value       = "";
    document.getElementById("inpPass").value        = "";
    document.getElementById("inpEdad").value        = "";
    document.getElementById("inpRol").value         = "";
    document.getElementById("inpSeccionI").value    = "";
    document.getElementById("inpInstrumento").value = "";

    document.getElementById("intModalTitle").textContent  = "Nuevo Integrante";
    document.getElementById("pwdGroup").style.display     = "block";  // siempre visible en creación

    if (integrante) {
        editandoId = integrante.id;
        document.getElementById("intModalTitle").textContent = "Editar Integrante";
        document.getElementById("pwdGroup").style.display    = "none"; // oculto en edición

        document.getElementById("inpNombre").value      = integrante.name    || "";
        document.getElementById("inpEmail").value       = integrante.email   || "";
        document.getElementById("inpEdad").value        = integrante.age     || "";
        document.getElementById("inpRol").value         = integrante.type === "ADMIN" ? "Administrador" : "Integrante";
        document.getElementById("inpSeccionI").value    = integrante.section || "";
        document.getElementById("inpInstrumento").value = integrante.instrumentId || "";

        if (integrante.type === "ADMIN") aplicarReglaAdmin();
    }

    document.getElementById("intModal").classList.remove("hidden");
}

function cerrarModal() {
    editandoId = null;

    // Rehabilitar por si quedaron deshabilitados al cerrar
    document.getElementById("inpSeccionI").disabled    = false;
    document.getElementById("inpInstrumento").disabled = false;

    document.getElementById("intModal").classList.add("hidden");
}

function cambiarRol() {
    const rol = document.getElementById("inpRol").value;
    if (rol === "Administrador") {
        aplicarReglaAdmin();
    } else {
        document.getElementById("inpSeccionI").disabled    = false;
        document.getElementById("inpInstrumento").disabled = false;
    }
}

function aplicarReglaAdmin() {
    document.getElementById("inpSeccionI").value       = "Administracion";
    document.getElementById("inpSeccionI").disabled    = true;

    document.getElementById("inpInstrumento").value    = "";
    document.getElementById("inpInstrumento").disabled = true;
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

async function guardarIntegrante() {

    // Rehabilitar antes de leer valores (disabled no se lee)
    document.getElementById("inpSeccionI").disabled    = false;
    document.getElementById("inpInstrumento").disabled = false;

    const nombre  = document.getElementById("inpNombre").value.trim();
    const email   = document.getElementById("inpEmail").value.trim();
    const edad    = document.getElementById("inpEdad").value;
    const rol     = document.getElementById("inpRol").value;
    const seccion = document.getElementById("inpSeccionI").value;

    if (!nombre || !email || !edad || !rol || !seccion) {
        alert("Por favor completá todos los campos obligatorios.");
        return;
    }

    const payload = {
        name:         nombre,
        email:        email,
        age:          Number(edad),
        type:         rol === "Administrador" ? "ADMIN" : "INTEGRANTE",
        section:      seccion,
        instrumentId: document.getElementById("inpInstrumento").value
                        ? Number(document.getElementById("inpInstrumento").value)
                        : null
    };

    if (!editandoId) {
        const pass = document.getElementById("inpPass").value;
        if (!pass) { alert("La contraseña es obligatoria."); return; }
        payload.password = pass;
    }

    try {
        if (editandoId) {
            await apiFetch(`/api/integrantes/${editandoId}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
        } else {
            await apiFetch("/api/integrantes", {
                method: "POST",
                body: JSON.stringify(payload)
            });
        }

        cerrarModal();
        await cargarIntegrantes();
    } catch (e) {
        console.error(e);
        alert("Error al guardar el integrante.");
    }
}

function editarIntegrante(id) {
    const integrante = integrantes.find(i => i.id === id);
    if (!integrante) return;
    abrirModal(integrante);
}

async function eliminarIntegrante(id) {
    if (!confirm("¿Eliminar este integrante?")) return;
    try {
        await apiFetch(`/api/integrantes/${id}`, { method: "DELETE" });
        await cargarIntegrantes();
    } catch (e) {
        console.error(e);
        alert("Error al eliminar el integrante.");
    }
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

window.cargarIntegrantes  = cargarIntegrantes;
window.guardarIntegrante  = guardarIntegrante;
window.editarIntegrante   = editarIntegrante;
window.eliminarIntegrante = eliminarIntegrante;
window.abrirModal         = abrirModal;
window.cerrarModal        = cerrarModal;
window.cambiarRol         = cambiarRol;