function injectNavbar(activePage) {
  const nav = document.createElement("nav");
  nav.className = "navbar";
  nav.innerHTML = `
    <a href="../pages/calendario.html" class="nav-brand">
      <span class="nav-icon">🎺</span>
      <span>BandSync BCO</span>
    </a>
    <div class="nav-links">
      <a class="nav-link" data-page="calendario" href="../pages/calendario.html">📅 Calendario</a>
      <a class="nav-link" data-page="ensayos"    href="../pages/ensayos.html">🎵 Ensayos</a>
      <a class="nav-link" data-page="integrantes" href="../pages/integrantes.html">👥 Integrantes</a>
      <a class="nav-link" data-page="instrumentos" href="../pages/instrumentos.html">🎸 Instrumentos</a>
      <a class="nav-link" data-page="presentaciones" href="../pages/presentaciones.html">🎪 Presentaciones</a>
    </div>
    <div class="nav-user" id="navUser"></div>
  `;
  document.body.insertBefore(nav, document.body.firstChild);
  setupNav(activePage);
}
