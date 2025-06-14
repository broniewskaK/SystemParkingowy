document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("changePassForm");
    if (!form) return;
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        const new1 = document.getElementById("newPassword").value;
        const new2 = document.getElementById("repeatPassword").value;
        const msg = document.getElementById("changePassMsg");

        if (new1 !== new2) {
            msg.textContent = "Hasła są różne!";
            msg.style.color = "red";
            return;
        }
        fetch("/api/change-password", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({newPassword: new1})
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                msg.textContent = "Hasło zostało zmienione!";
                msg.style.color = "green";
            } else {
                msg.textContent = "Błąd podczas zmiany hasła.";
                msg.style.color = "red";
            }
        });
    });
    document.getElementById("btnBackMenu").addEventListener("click", function(e){
        e.preventDefault();
        window.location.href = "/";
    });
});
