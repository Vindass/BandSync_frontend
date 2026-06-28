const API_BASE =
"https://bandsync-gic7.onrender.com";

function getUser() {

    const raw =
        sessionStorage.getItem("user");

    if (!raw) {
        return null;
    }

    return JSON.parse(raw);
}

function requireAuth() {

    const user =
        sessionStorage.getItem("user");

    console.log("USER:", user);

    if (!user) {

        alert("No hay sesión");

        window.location.href =
            "../index.html";

        return;
    }
}

function logout() {

    sessionStorage.clear();

    window.location.href =
        "../index.html";
}

async function apiFetch(
    endpoint,
    options = {}
) {

    console.log("URL:", API_BASE + endpoint);

    const response =
        await fetch(
            API_BASE + endpoint,
            {
                credentials: "include",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                ...options
            }
        );

    if (!response.ok) {

        let error;

        try {

            error =
                await response.text();

        } catch {

            error =
                "Error desconocido";
        }

        throw new Error(error);
    }

    const text =
        await response.text();

    return text
        ? JSON.parse(text)
        : null;
}