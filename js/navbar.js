
document.addEventListener("DOMContentLoaded", () => {

    injectNavbar();

});

function injectNavbar() {

    const user = JSON.parse(
        sessionStorage.getItem("user")
    );

    const isAdmin =
        user?.type === "ADMIN";

    const nav =
        document.createElement("nav");

    nav.className = "navbar";

    nav.innerHTML = `

    <a href="calendario.html" class="nav-brand">
        🎺 BandSync
    </a>

    <div class="nav-links">

        <a href="calendario.html" class="nav-link">
            Inicio
        </a>

        <a href="integrantes.html" class="nav-link">
            Integrantes
        </a>

        <a href="instrumentos.html" class="nav-link">
            Instrumentos
        </a>

        <a href="ensayos.html" class="nav-link">
            Ensayos
        </a>

        <a href="presentaciones.html" class="nav-link">
            Presentaciones
        </a>

    </div>

    <div class="nav-user">

        <span>
            ${user?.name || "Usuario"}
        </span>

        <span class="badge-role">
            ${isAdmin ? "ADMIN" : "INTEGRANTE"}
        </span>

        <button onclick="logout()" class="btn-logout">
            Salir
        </button>

    </div>

    `;

    document.body.prepend(nav);

}