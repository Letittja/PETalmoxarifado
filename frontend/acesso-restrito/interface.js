// Garante que o JS só rode depois que o HTML carregar
document.addEventListener("DOMContentLoaded", () => {
    
    // === EFEITO DE MENU ATIVO ===
    const list = document.querySelectorAll(".navigation li");

    function activeLink() {
        list.forEach((item) => {
            item.classList.remove("hovered");
        });
        this.classList.add("hovered");
    }

    // Mudei de 'mouseover' para 'click'. 
    // Assim a cor fica fixa na aba que você realmente selecionou.
    list.forEach((item) => item.addEventListener("click", activeLink));


    // === MENU RETRÁTIL (Toggle) ===
    const toggle = document.querySelector(".toggle");
    const navigation = document.querySelector(".navigation");
    const main = document.querySelector(".main");

    // Verificação de segurança (evita erro se a tela não tiver esses elementos)
    if (toggle && navigation && main) {
        toggle.onclick = function () {
            navigation.classList.toggle("active");
            main.classList.toggle("active");
        };
    }
});