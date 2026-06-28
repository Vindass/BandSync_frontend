document.addEventListener("DOMContentLoaded", async () => {

    requireAuth();

    injectNavbar();

    await cargarEventos();

    renderizarCalendario();
});

let fechaActual = new Date();

let ensayos = [];

let presentaciones = [];

async function cargarEventos() {

    try {

        ensayos =
            await apiFetch("/api/ensayos/all") || [];

    } catch {

        ensayos = [];
    }

    try {

        presentaciones =
            await apiFetch("/api/presentaciones/all") || [];

    } catch {

        presentaciones = [];
    }
}

document.addEventListener("click", e => {

    if(e.target.id === "btnPrev"){

        fechaActual.setMonth(
            fechaActual.getMonth() - 1
        );

        renderizarCalendario();
    }

    if(e.target.id === "btnNext"){

        fechaActual.setMonth(
            fechaActual.getMonth() + 1
        );

        renderizarCalendario();
    }

    if(e.target.id === "btnCerrarModal"){

        document
            .getElementById("dayModal")
            .classList.add("hidden");
    }
});

function renderizarCalendario(){

    const año =
        fechaActual.getFullYear();

    const mes =
        fechaActual.getMonth();

    const primerDia =
        new Date(año, mes, 1);

    const ultimoDia =
        new Date(año, mes + 1, 0);

    document
        .getElementById("calendarTitle")
        .textContent =
        primerDia.toLocaleDateString(
            "es-CR",
            {
                month:"long",
                year:"numeric"
            }
        );

    const grid =
        document.getElementById("calendarGrid");

    grid.innerHTML = "";

    for(let i=0; i<primerDia.getDay(); i++){

        const empty =
            document.createElement("div");

        empty.className =
            "calendar-day";

        grid.appendChild(empty);
    }

    for(let dia=1; dia<=ultimoDia.getDate(); dia++){

        const fecha =
            `${año}-${String(mes+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;

        const eventos =
            obtenerEventos(fecha);

        const cell =
            document.createElement("div");

        cell.className =
            "calendar-day";

        let html =
            `<div class="day-number">${dia}</div>`;

        eventos.forEach(evento => {

            html += `
                <div class="${evento.clase}">
                    ${evento.nombre}
                </div>
            `;
        });

        cell.innerHTML = html;

        if(eventos.length > 0){

            cell.addEventListener(
                "click",
                () => abrirModal(
                    fecha,
                    eventos
                )
            );
        }

        grid.appendChild(cell);
    }
}

function obtenerEventos(fecha){

    let lista = [];

    ensayos.forEach(e => {

        if(e.date === fecha){

            lista.push({
                nombre: "🎵 Ensayo",
                clase: "evento-ensayo",
                datos: e
            });
        }
    });

    presentaciones.forEach(p => {

        if(p.date === fecha){

            lista.push({
                nombre: "🎪 Presentación",
                clase: "evento-presentacion",
                datos: p
            });
        }
    });

    return lista;
}

function abrirModal(fecha,eventos){

    document
        .getElementById("modalDate")
        .textContent = fecha;

    let html = "";

    eventos.forEach(evento => {

        html += `
            <div class="card">
                <h4>${evento.nombre}</h4>
            </div>
        `;
    });

    document
        .getElementById("modalContent")
        .innerHTML = html;

    document
        .getElementById("dayModal")
        .classList.remove("hidden");
}