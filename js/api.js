const API = "https://bandsync-gic7.onrender.com";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = document.getElementById("loginBtn");
  const errDiv = document.getElementById("loginError");

  errDiv.classList.add("hidden");
  btn.textContent = "Ingresando...";
  btn.disabled = true;

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {

    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Credenciales inválidas");
    }

    const data = await res.json();

    sessionStorage.setItem(
      "user",
      JSON.stringify(data)
    );

    sessionStorage.setItem(
      "token",
      "authenticated"
    );

    window.location.href = "pages/calendario.html";

  } catch (err) {

    errDiv.textContent = err.message;
    errDiv.classList.remove("hidden");

    btn.textContent = "Ingresar";
    btn.disabled = false;
  }
});