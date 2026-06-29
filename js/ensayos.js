requireAuth();

let ensayos = [];
let editandoId = null;

document.addEventListener("DOMContentLoaded", async () => {

    injectNavbar();

    await cargarEnsayos();

    const user = getUser();

    if(user?.type !== "ADMIN"){

        document
            .getElementById("btnNuevoEnsayo")
            .style.display = "none";
    }
});

async function cargarEnsayos(){

    try{

        ensayos =
            await apiFetch("/api/ensayos");

        const user = getUser();

        if(user?.type !== "ADMIN"){

            ensayos = ensayos.filter(
                e => e.integranteId === user.id
            );
        }

        renderTabla();

    }catch(error){

        console.error(error);

        document.getElementById("ensayosBody").innerHTML =
        `<tr><td colspan="6">Error cargando ensayos</td></tr>`;
    }
}

function renderTabla(){

    const user = getUser();
    const body = document.getElementById("ensayosBody");

    body.innerHTML = "";

    if(ensayos.length === 0){

        body.innerHTML =
        `<tr><td colspan="6">No hay ensayos</td></tr>`;
        return;
    }

    ensayos.forEach(e => {

        body.innerHTML += `
        <tr>

            <td>${e.id}</td>
            <td>${e.date}</td>
            <td>${e.section}</td>
            <td>${e.integrante}</td>

            <td>

                ${
                    user?.type === "ADMIN"
                    ?
                    `
                    <select class="form-select-sm"
                        onchange="cambiarAsistencia(${e.id}, this.value)">

                        <option value="PENDIENTE" ${e.assistance === "PENDIENTE" ? "selected" : ""}>
                            PENDIENTE
                        </option>

                        <option value="PRESENTE" ${e.assistance === "PRESENTE" ? "selected" : ""}>
                            PRESENTE
                        </option>

                        <option value="AUSENTE" ${e.assistance === "AUSENTE" ? "selected" : ""}>
                            AUSENTE
                        </option>

                    </select>
                    `
                    :
                    e.assistance
                }

            </td>

            <td>

                ${
                    user?.type === "ADMIN"
                    ?
                    `
                    <button class="btn-secondary btn-sm"
                        onclick="editarEnsayo(${e.id})">
                        Editar
                    </button>

                    <button class="btn-danger btn-sm"
                        onclick="eliminarEnsayo(${e.id})">
                        Eliminar
                    </button>
                    `
                    :
                    "-"
                }

            </td>

        </tr>
        `;
    });
}

async function cambiarAsistencia(id, asistencia){

    try{

        await apiFetch(
            `/api/ensayos/${id}/assistance/${asistencia}`,
            {
                method: "PUT"
            }
        );

        await cargarEnsayos();

    }catch(error){
        alert(error.message);
    }
}

function abrirModal(){

    editandoId = null;

    document.getElementById("ensayoModalTitle").textContent =
        "Nuevo Ensayo";

    document.getElementById("ensayoForm").reset();

    document.getElementById("ensayoModal").classList.remove("hidden");
}

function cerrarModal(){

    document.getElementById("ensayoModal").classList.add("hidden");
}

async function guardarEnsayo(){

    try{

        const body = {

            date: document.getElementById("inpFecha").value,
            section: document.getElementById("inpSection").value
        };

        if(editandoId){

            await apiFetch(`/api/ensayos/${editandoId}`, {
                method: "PUT",
                body: JSON.stringify(body)
            });

        }else{

            await apiFetch("/api/ensayos", {
                method: "POST",
                body: JSON.stringify(body)
            });
        }

        cerrarModal();
        await cargarEnsayos();

    }catch(error){
        alert(error.message);
    }
}

async function editarEnsayo(id){

    try{

        const ensayo =
            await apiFetch(`/api/ensayos/${id}`);

        editandoId = id;

        document.getElementById("ensayoModalTitle").textContent =
            "Editar Ensayo";

        document.getElementById("inpFecha").value =
            ensayo.date.substring(0,16);

        document.getElementById("inpSection").value =
            ensayo.section;

        document.getElementById("ensayoModal").classList.remove("hidden");

    }catch(error){
        alert(error.message);
    }
}

async function eliminarEnsayo(id){

    if(!confirm("¿Eliminar ensayo?")) return;

    try{

        await apiFetch(`/api/ensayos/${id}`, {
            method: "DELETE"
        });

        await cargarEnsayos();

    }catch(error){
        alert(error.message);
    }
}

async function buscarEnsayos(){

    const section =
        document.getElementById("buscarSeccion")?.value;

    const assistance =
        document.getElementById("buscarAsistencia")?.value;

    try{

        let url = "/api/ensayos";

        if(section){
            url = `/api/ensayos/section/${section}`;
        }

        if(assistance){
            url = `/api/ensayos/assistance/${assistance}`;
        }

        ensayos = await apiFetch(url);
        renderTabla();

    }catch(error){
        alert(error.message);
    }
}

window.cargarEnsayos = cargarEnsayos;
window.guardarEnsayo = guardarEnsayo;
window.editarEnsayo = editarEnsayo;
window.eliminarEnsayo = eliminarEnsayo;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.cambiarAsistencia = cambiarAsistencia;
window.buscarEnsayos = buscarEnsayos;