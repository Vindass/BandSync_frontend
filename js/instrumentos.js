const API_INSTRUMENTOS =
    "http://localhost:8080/api/instrumentos";

async function cargarInstrumentos() {

    try {

        const response =
            await fetch(API_INSTRUMENTOS);

        const data =
            await response.json();

        console.log(data);

    } catch (error) {

        console.error(
            "Error al cargar instrumentos:",
            error
        );
    }
}

cargarInstrumentos();