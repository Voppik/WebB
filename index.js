console.log('Happy developing ✨')

// --- 1. ČÁST: Bezpečné přidání odkazů ---
function pridatOdkaz(idTlacitka, cilovaAdresa) {
    const tlacitko = document.getElementById(idTlacitka);
    if (!tlacitko) return;

    tlacitko.addEventListener("click", function() {
        if (idTlacitka === "btn-mobilmenu") {
            // Získání čistého názvu stránky (ošetření pro index)
            let page = window.location.pathname.split("/").pop().split(".")[0];
            if (page === "" || page === "index") page = "uvod"; // Sjednotíme index na "uvod"

            window.location.href = `mobilmenu.html?from=${page}`;
        } else {
            window.location.href = cilovaAdresa;
        }
    });
}

// Registrace odkazů
pridatOdkaz("btn-uvod", "index.html");
pridatOdkaz("btn-ukoly", "ukoly.html");
pridatOdkaz("btn-tabulka", "tabulka.html");
pridatOdkaz("btn-projekty", "projekty.html");
pridatOdkaz("btn-galerie", "galerie.html");
pridatOdkaz("btn-mobilmenu", "mobilmenu.html");


// --- 2. ČÁST: Zvýraznění aktivního tlačítka ---
function highlightActiveButton() {
    const params = new URLSearchParams(window.location.search);
    const fromPage = params.get('from');
    const path = window.location.pathname.toLowerCase();

    const buttons = document.querySelectorAll('.sidebar button, .fullscreen-sidebar button');

    buttons.forEach(button => {
        button.classList.remove("active");

        // A) Pokud jsme v mobilním menu (přes parametr ?from=)
        if (fromPage && button.id === `btn-${fromPage}`) {
            button.classList.add("active");
        }
        // B) Pokud jsme na klasické stránce (podle URL)
        else {
            // Ošetření pro index (pokud je cesta "/" nebo obsahuje "index")
            const isIndex = path.endsWith("/") || path.includes("index.html");

            if (isIndex && button.id === "btn-uvod") {
                button.classList.add("active");
            } else if (path.includes("tabulka") && button.id === "btn-tabulka") {
                button.classList.add("active");
            } else if (path.includes("ukoly") && button.id === "btn-ukoly") {
                button.classList.add("active");
            } else if (path.includes("projekty") && button.id === "btn-projekty") {
                button.classList.add("active");
            } else if (path.includes("galerie") && button.id === "btn-galerie") {
                button.classList.add("active");
            }
        }
    });
}

highlightActiveButton();
