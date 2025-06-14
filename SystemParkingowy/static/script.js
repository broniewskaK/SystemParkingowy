// Logowanie użytkownika
function login(event) {
    event.preventDefault();
    const login = document.getElementById("loginField").value;
    const password = document.getElementById("passwordField").value;

    fetch("/api/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({login, password})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            sessionStorage.setItem("currentRole", data.role);
            window.location.reload(); // Przeładuj do panelu (sesja!)
        } else {
            alert("Nieprawidłowy login lub hasło!");
        }
    });
}

// Funkcja obsługi kliknięcia w LED w SVG
function setupLedListeners() {
    const svgObject = document.getElementById("parkingMap");
    if (!svgObject) return;

    svgObject.addEventListener("load", function() {
        const svgDoc = svgObject.contentDocument;
        if (!svgDoc) return;

        // Każdy led z mapy
        ["led1", "led2", "led3"].forEach(ledId => {
            const led = svgDoc.getElementById(ledId);
            if (led) {
                led.style.cursor = "pointer";
                led.addEventListener("click", () => showLedMessage(ledId));
            }
        });
    });
}

// Pokazuje wyskakujące okienko z komunikatem LED
function showLedMessage(ledId) {
    const container = document.getElementById("ledMessageContainer");
    let messageArray = [];

    // dane ledów
    if (ledId === "led1") {
        messageArray = [
            { direction: "↑", count: 7 },
            { direction: "→", count: 5 }
        ];
    } else if (ledId === "led2") {
        messageArray = [
            { direction: "↑", count: 3 },
            { direction: "→", count: 0 },
            { direction: "←", count: 2 }
        ];
    } else if (ledId === "led3") {
        messageArray = [
            { direction: "→", count: 3 }
        ];
    }

    const messageHTML = `
        <div class="led-popup">
            <button class="close-btn" onclick="closeLedMessage()">X</button>
            ${messageArray.map(item => `
                <div class="led-line">
                    <span class="led-arrow ${item.count === 0 ? "red" : "green"}">${item.direction}</span>
                    <span class="led-count ${item.count === 0 ? "red" : "green"}">${item.count}</span>
                </div>
            `).join("")}
        </div>
    `;

    container.innerHTML = messageHTML;
    container.style.display = "block";
}

function closeLedMessage() {
    const container = document.getElementById("ledMessageContainer");
    if (container) container.style.display = "none";
}

// Wylogowanie – przycisk z klasą .btn-logout
function setupLogout() {
    document.querySelectorAll(".btn-logout").forEach(btn => {
        btn.addEventListener("click", () => {
            fetch("/logout").then(() => window.location = "/");
        });
    });
}

// Zmiana hasła – przekierowanie
function setupChangePassword() {
    const btn = document.getElementById("btnChangePass");
    if (btn) {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            window.location.href = "/change-password";
        });
    }
}

// Inicjalizacja po załadowaniu strony
window.addEventListener("DOMContentLoaded", function() {
    // Obsługa logowania
    const loginForm = document.getElementById("loginForm");
    if (loginForm) loginForm.addEventListener("submit", login);

    // Obsługa LEDÓW na mapie SVG
    setupLedListeners();

    // Obsługa wylogowania i zmiany hasła
    setupLogout();
    setupChangePassword();
});
