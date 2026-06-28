requireAuth();

document.addEventListener("DOMContentLoaded", async () => {

    injectNavbar();

    await cargarInstrumentos();

    const user = getUser();

    if (user?.type !== "ADMIN") {

        document
            .getElementById("btnNuevoInstrumento")
            .style.display = "none";
    }

    document
        .getElementById("btnNuevoInstrumento")
        ?.addEventListener(
            "click",
            abrirModal
        );
});

let instrumentos = [];

let editandoId = null;

async function cargarInstrumentos() {

    try {

        instrumentos =
            await apiFetch(
                "/api/instrumentos"
            );

        renderTabla();

    } catch (error) {

        console.error(error);

        document
            .getElementById("instrumentosBody")
            .innerHTML =
            `
            <tr>
                <td colspan="4">
                    Error cargando instrumentos
                </td>
            </tr>
            `;
    }
}

async function buscarInstrumentoPorId() {

    const id = prompt(
        "Ingrese el ID del instrumento"
    );

    if (!id) {
        return;
    }

    try {

        const instrumento =
            await apiFetch(
                `/api/instrumentos/${id}`
            );

        instrumentos = [instrumento];

        renderTabla();

    } catch (error) {

        alert(error.message);
    }
}

async function buscarInstrumentoPorNombre() {

    const nombre =
        document
            .getElementById("buscarInstrumento")
            .value
            .trim();

    if (!nombre) {

        await cargarInstrumentos();

        return;
    }

    try {

        instrumentos =
            await apiFetch(
                `/api/instrumentos/name/${nombre}`
            );

        renderTabla();

    } catch (error) {

        alert(error.message);
    }
}

function renderTabla() {

    const body =
        document.getElementById(
            "instrumentosBody"
        );

    body.innerHTML = "";

    if (instrumentos.length === 0) {

        body.innerHTML =
        `
        <tr>
            <td colspan="4">
                No hay instrumentos registrados
            </td>
        </tr>
        `;

        return;
    }

    const user = getUser();

instrumentos.forEach(i => {

    body.innerHTML +=
    `
    <tr>

        <td>${i.id}</td>

        <td>${i.name}</td>

        <td>
            ${
                i.quantity === 0
                ? "❌ Agotado"
                : i.quantity
            }
        </td>

        <td>

            ${
                user?.type === "ADMIN"
                ?
                `
                <button
                    class="btn-primary"
                    onclick="editarInstrumento(${i.id})">

                    Editar

                </button>

                <button
                    class="btn-danger"
                    onclick="eliminarInstrumento(${i.id})">

                    Retirar

                </button>
                `
                :
                "-"
            }

        </td>

    </tr>
    `;
});

function abrirModal() {

    editandoId = null;

    document
        .getElementById(
            "instModalTitle"
        )
        .textContent =
        "Nuevo Instrumento";

    document
        .getElementById(
            "instForm"
        )
        .reset();

    document
        .getElementById(
            "instModal"
        )
        .classList.remove(
            "hidden"
        );
}

function cerrarModal() {

    document
        .getElementById(
            "instModal"
        )
        .classList.add(
            "hidden"
        );
        async function guardarInstrumento() {

    try {

        const cantidad =
            Number(
                document
                    .getElementById(
                        "inpCantidad"
                    )
                    .value
            );

        if(cantidad < 0){

            alert(
                "La cantidad no puede ser negativa"
            );

            return;
        }

        const body = {

            name:
            document
                .getElementById(
                    "inpNombreInstrumento"
                )
                .value,

            quantity:
            cantidad
        };

        if (editandoId) {

            await apiFetch(

                `/api/instrumentos/${editandoId}`,

                {
                    method: "PUT",
                    body: JSON.stringify(body)
                }
            );

        } else {

            await apiFetch(

                "/api/instrumentos",

                {
                    method: "POST",
                    body: JSON.stringify(body)
                }
            );
        }

        cerrarModal();

        await cargarInstrumentos();

    } catch (error) {

        alert(error.message);
    }
}

async function editarInstrumento(id) {

    try {

        const instrumento =
            await apiFetch(
                `/api/instrumentos/${id}`
            );

        editandoId = id;

        document
            .getElementById(
                "instModalTitle"
            )
            .textContent =
            "Editar Instrumento";

        document
            .getElementById(
                "inpNombreInstrumento"
            )
            .value =
            instrumento.name;

        document
            .getElementById(
                "inpCantidad"
            )
            .value =
            instrumento.quantity;

        document
            .getElementById(
                "instModal"
            )
            .classList.remove(
                "hidden"
            );

    } catch (error) {

        alert(error.message);
    }
}

async function eliminarInstrumento(id) {

    const instrumento =
        instrumentos.find(
            i => i.id === id
        );

    if (!instrumento) {
        return;
    }

    const cantidad = prompt(
        `Instrumento: ${instrumento.name}

Disponibles: ${instrumento.quantity}

¿Cuántos desea eliminar?`
    );

    if (cantidad === null) {
        return;
    }

    const eliminar =
        Number(cantidad);

    if (
        isNaN(eliminar) ||
        eliminar <= 0
    ) {

        alert("Cantidad inválida");
        return;
    }

    if (
        eliminar > instrumento.quantity
    ) {

        alert(
            `Solo existen ${instrumento.quantity} disponibles`
        );

        return;
    }

    try {

        await apiFetch(

            `/api/instrumentos/${id}/${eliminar}`,

            {
                method: "DELETE"
            }
        );

        await cargarInstrumentos();

    } catch (error) {

        alert(error.message);
    }
}
window.cargarInstrumentos =
    cargarInstrumentos;

window.buscarInstrumentoPorId =
    buscarInstrumentoPorId;

window.buscarInstrumentoPorNombre =
    buscarInstrumentoPorNombre;

window.guardarInstrumento =
    guardarInstrumento;

window.editarInstrumento =
    editarInstrumento;

window.eliminarInstrumento =
    eliminarInstrumento;

window.abrirModal =
    abrirModal;

window.cerrarModal =
    cerrarModal;
}
}