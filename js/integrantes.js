requireAuth();

document.addEventListener("DOMContentLoaded", async () => {

    injectNavbar();

    await cargarInstrumentos();

    await cargarIntegrantes();

    const user = getUser();

    if(user?.type !== "ADMIN"){

        document
            .getElementById("btnNuevoIntegrante")
            .style.display = "none";
    }

    document
        .getElementById("inpRol")
        .addEventListener(
            "change",
            cambiarRol
        );

    document
        .getElementById("btnNuevoIntegrante")
        ?.addEventListener(
            "click",
            abrirModal
        );
});

let integrantes = [];
let instrumentos = [];
let editandoId = null;

async function cargarInstrumentos(){

    try{

        instrumentos =
            await apiFetch(
                "/api/instrumentos"
            );

        const select =
            document.getElementById(
                "inpInstrumento"
            );

        select.innerHTML =
            '<option value="">Sin instrumento</option>';

        instrumentos.forEach(inst => {

            select.innerHTML += `
                <option value="${inst.id}">
                    ${inst.name}
                    (${inst.quantity})
                </option>
            `;
        });

    }catch(error){

        console.error(error);
    }
}

async function cargarIntegrantes(){

    try{

        integrantes =
            await apiFetch(
                "/api/integrantes"
            );

        renderTabla();

    }catch(error){

        console.error(error);

        document
            .getElementById(
                "integrantesBody"
            )
            .innerHTML =
            `
            <tr>
                <td colspan="8">
                    Error cargando integrantes
                </td>
            </tr>
            `;
    }
}

function renderTabla(){

    const body =
        document.getElementById(
            "integrantesBody"
        );

    const nombre =
        document
            .getElementById("buscarNombre")
            .value
            .toLowerCase();

    const tipo =
        document
            .getElementById("filtroTipo")
            .value;

    const seccion =
        document
            .getElementById("filtroSeccionI")
            .value;

    let lista = integrantes;

    if(nombre){

        lista =
            lista.filter(i =>
                i.name
                 .toLowerCase()
                 .includes(nombre)
            );
    }

    if(tipo){

        lista =
            lista.filter(i =>
                i.type === tipo
            );
    }

    if(seccion){

        lista =
            lista.filter(i =>
                i.section === seccion
            );
    }

    body.innerHTML = "";

    const user = getUser();

    lista.forEach(i => {

        body.innerHTML += `

        <tr>

            <td>${i.id}</td>

            <td>${i.name}</td>

            <td>${i.email}</td>

            <td>${i.age}</td>

            <td>${i.type}</td>

            <td>${i.section}</td>

            <td>${i.instrument}</td>

            <td>

                ${
                    user?.type === "ADMIN"
                    ?

                    `
                    <button
                    class="btn-primary"
                    onclick="editarIntegrante(${i.id})">

                    Editar

                    </button>

                    <button
                    class="btn-danger"
                    onclick="eliminarIntegrante(${i.id})">

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

function cambiarRol(){

    const rol =
        document
            .getElementById("inpRol")
            .value;

    const seccion =
        document
            .getElementById("inpSeccionI");

    const instrumento =
        document
            .getElementById("inpInstrumento");

    if(
        rol === "ADMIN" ||
        rol === "Administrador"
    ){

        seccion.value =
            "Administracion";

        seccion.disabled = true;

        instrumento.value = "";

        instrumento.disabled = true;

    }else{

        seccion.disabled = false;

        instrumento.disabled = false;
    }
}

function abrirModal(){

    editandoId = null;

    document
        .getElementById(
            "intModalTitle"
        )
        .textContent =
        "Nuevo Integrante";

    document
        .getElementById(
            "intForm"
        )
        .reset();

    document
        .getElementById(
            "pwdGroup"
        )
        .style.display =
        "block";

    document
        .getElementById(
            "intModal"
        )
        .classList.remove(
            "hidden"
        );
}

function cerrarModal(){

    document
        .getElementById(
            "intModal"
        )
        .classList.add(
            "hidden"
        );
}

async function guardarIntegrante(){

    try{

        const rol =
            document
                .getElementById(
                    "inpRol"
                )
                .value;

        const instrumentoId =
            document
                .getElementById(
                    "inpInstrumento"
                )
                .value;

        if(
            rol === "Integrante"
            &&
            !instrumentoId
        ){

            alert(
                "Debe seleccionar instrumento"
            );

            return;
        }

        const body = {

            name:
            document.getElementById("inpNombre").value,

            email:
            document.getElementById("inpEmail").value,

            password:
            document.getElementById("inpPass").value,

            age:
            Number(
                document.getElementById("inpEdad").value
            ),

            type:
            rol === "Administrador"
            ? "ADMIN"
            : "INTEGRANTE",

            section:
            document.getElementById("inpSeccionI").value,

            instrumentId:
            instrumentoId
            ? Number(instrumentoId)
            : null
        };

        if(editandoId){

            await apiFetch(

                `/api/integrantes/${editandoId}`,

                {
                    method:"PUT",
                    body:JSON.stringify(body)
                }
            );

        }else{

            await apiFetch(

                "/api/integrantes",

                {
                    method:"POST",
                    body:JSON.stringify(body)
                }
            );
        }

        cerrarModal();

        await cargarIntegrantes();

    }catch(error){

        alert(error.message);
    }
}

async function editarIntegrante(id){

    const integrante =
        integrantes.find(
            i => i.id === id
        );

    if(!integrante){
        return;
    }

    editandoId = id;

    document
        .getElementById(
            "intModalTitle"
        )
        .textContent =
        "Editar Integrante";

    document
        .getElementById("inpNombre")
        .value =
        integrante.name;

    document
        .getElementById("inpEmail")
        .value =
        integrante.email;

    document
        .getElementById("inpEdad")
        .value =
        integrante.age;

    document
        .getElementById("inpRol")
        .value =
        integrante.type === "ADMIN"
        ? "Administrador"
        : "Integrante";

    document
        .getElementById("inpSeccionI")
        .value =
        integrante.section;

    document
        .getElementById("inpInstrumento")
        .value =
        integrante.instrumentId || "";

    document
        .getElementById("pwdGroup")
        .style.display =
        "none";

    cambiarRol();

    document
        .getElementById("intModal")
        .classList.remove(
            "hidden"
        );
}

async function eliminarIntegrante(id){

    if(
        !confirm(
            "¿Eliminar integrante?"
        )
    ){
        return;
    }

    try{

        await apiFetch(

            `/api/integrantes/${id}`,

            {
                method:"DELETE"
            }
        );

        await cargarIntegrantes();

    }catch(error){

        alert(error.message);
    }
}

window.cargarIntegrantes =
    cargarIntegrantes;

window.guardarIntegrante =
    guardarIntegrante;

window.editarIntegrante =
    editarIntegrante;

window.eliminarIntegrante =
    eliminarIntegrante;

window.abrirModal =
    abrirModal;

window.cerrarModal =
    cerrarModal;