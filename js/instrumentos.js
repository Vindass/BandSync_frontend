requireAuth();

document.addEventListener("DOMContentLoaded", async () => {

    injectNavbar();

    await cargarInstrumentos();

    const user = getUser();

    if (user?.type !== "ADMIN") {
        document.getElementById("btnNuevoInstrumento").style.display = "none";
    }
});

let instrumentos = [];
let editandoId = null;


async function cargarInstrumentos() {

    try {

        instrumentos = await apiFetch("/api/instrumentos");

        renderTabla();

    } catch (error) {

        document.getElementById("instrumentosBody").innerHTML =
            `<tr><td colspan="4">Error cargando instrumentos</td></tr>`;
    }
}


async function buscarInstrumento() {

    const input = document
        .getElementById("buscarInstrumento")
        .value
        .trim();

    if (!input) {
        await cargarInstrumentos();
        return;
    }

    try {

        if (!isNaN(input)) {

            const instrumento =
                await apiFetch(`/api/instrumentos/${input}`);

            instrumentos = [instrumento];
            renderTabla();
            return;
        }

      
        const todos = await apiFetch("/api/instrumentos");

        const filtrados = todos.filter(i =>
            i.name.toLowerCase().includes(input.toLowerCase())
        );

        if (filtrados.length === 0) {
            alert("No existe instrumento con ese nombre");
            return;
        }

        instrumentos = filtrados;
        renderTabla();

    } catch (error) {
        alert(error.message);
    }
}

function renderTabla() {

    const body =
        document.getElementById("instrumentosBody");

    body.innerHTML = "";

    if (instrumentos.length === 0) {

        body.innerHTML =
            `<tr><td colspan="4">No hay instrumentos</td></tr>`;

        return;
    }

    const user = getUser();

    instrumentos.forEach(i => {

        body.innerHTML += `
        <tr>

            <td>${i.id}</td>
            <td>${i.name}</td>

            <td>
                ${i.quantity === 0 ? "❌ Agotado" : i.quantity}
            </td>

            <td>

                ${
                    user?.type === "ADMIN"
                    ? `
                        <button class="btn-primary"
                            onclick="editarInstrumento(${i.id})">
                            Editar
                        </button>

                        <button class="btn-danger"
                            onclick="eliminarInstrumento(${i.id})">
                            Retirar
                        </button>
                    `
                    : "-"
                }

            </td>

        </tr>`;
    });
}

function abrirModal() {

    editandoId = null;

    document.getElementById("instForm").reset();
    document.getElementById("instModalTitle").textContent = "Nuevo Instrumento";

    document.getElementById("instModal").classList.remove("hidden");
}

function cerrarModal() {
    document.getElementById("instModal").classList.add("hidden");
}


async function guardarInstrumento() {

    const cantidad = Number(
        document.getElementById("inpCantidad").value
    );

    if (cantidad < 0) {
        alert("No puede ser negativo");
        return;
    }

    const body = {
        name: document.getElementById("inpNombreInstrumento").value,
        quantity: cantidad
    };

    try {

        if (editandoId) {

            await apiFetch(`/api/instrumentos/${editandoId}`, {
                method: "PUT",
                body: JSON.stringify(body)
            });

        } else {

            await apiFetch("/api/instrumentos", {
                method: "POST",
                body: JSON.stringify(body)
            });
        }

        cerrarModal();
        await cargarInstrumentos();

    } catch (error) {
        alert(error.message);
    }
}


async function editarInstrumento(id) {

    try {

        const inst =
            await apiFetch(`/api/instrumentos/${id}`);

        editandoId = id;

        const nombre = document.getElementById("inpNombreInstrumento");
        const cantidad = document.getElementById("inpCantidad");
        const modal = document.getElementById("instModal");
        const title = document.getElementById("instModalTitle");

        if (!nombre || !cantidad || !modal || !title) {
            console.error("Faltan elementos del modal");
            return;
        }

        nombre.value = inst.name ?? "";
        cantidad.value = inst.quantity ?? 0;

        title.textContent = "Editar Instrumento";
        modal.classList.remove("hidden");

    } catch (error) {
        alert(error.message);
    }
}

async function eliminarInstrumento(id) {

    const inst = instrumentos.find(i => i.id === id);

    const cant = prompt(`¿Cuántos eliminar de ${inst.name}?`);

    if (!cant) return;

    try {

        await apiFetch(`/api/instrumentos/${id}/${cant}`, {
            method: "DELETE"
        });

        await cargarInstrumentos();

    } catch (error) {
        alert(error.message);
    }
}


window.cargarInstrumentos = cargarInstrumentos;
window.buscarInstrumento = buscarInstrumento;
window.guardarInstrumento = guardarInstrumento;
window.editarInstrumento = editarInstrumento;
window.eliminarInstrumento = eliminarInstrumento;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;