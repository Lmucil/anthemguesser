const map = document.querySelector("svg");
const countries = document.querySelectorAll("path");
const sidePanel = document.querySelector(".side-panel");
const container = document.querySelector(".side-panel .container");
countries.forEach(country => {
    country.addEventListener("mouseenter", function () {
        this.classList.forEach(className => {
            document.querySelectorAll(`.${className}`).forEach(el => el.style.fill = "#c99aff");
        });
    });

    country.addEventListener("mouseout", function () {
        this.classList.forEach(className => {
            document.querySelectorAll(`.${className}`).forEach(el => el.style.fill = "#443d4b");
        });
    });

    country.addEventListener("click", function (e) {
        container.classList.add("hide");
        if (loading) loading.classList.remove("hide");

        let clickedCountryName;
        if (e.target.hasAttribute("name")) {
            clickedCountryName = e.target.getAttribute("name");
        } else {
            clickedCountryName = e.target.classList.value;
        }

        sidePanel.classList.add("side-panel-open");

    });
});
