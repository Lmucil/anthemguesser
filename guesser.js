
(function () {
  const svg = document.querySelector("#world");
  const countries = document.querySelectorAll("#world path");
  const nameEl = document.getElementById("country-name");
  const guessBtn = document.getElementById("guess-btn");
  const playBtn = document.getElementById("play-btn");

  const BASE_FILL = "#443d4b";
  const HOVER_FILL = "#c99aff";

  const anthemFiles = [
        "Afghanistan.Mp3",
    "Albania.Mp3",
    "Algeria.Mp3",
    "Angola.Mp3",
    "Argentina.Mp3",
    "Armenia.Mp3",
    "Australia.Mp3",
    "Austria.Mp3",
    "Azerbaijan.Mp3",
    "Bahamas.Mp3",
    "Bahrain.Mp3",
    "Bangladesh.Mp3",
    "Barbados.Mp3",
    "Belarus.Mp3",
    "Belgium.Mp3",
    "Belize.Mp3",
    "Benin.Mp3",
    "Bolivia.Mp3",
    "Bosnia Herzegovina.Mp3",
    "Botswana.Mp3",
    "Brazil.Mp3",
    "Brunei.Mp3",
    "Bulgaria.Mp3",
    "Burkina Faso.Mp3",
    "Cambodia.Mp3",
    "Cameroon.Mp3",
    "Canada.Mp3",
    "Cape Verde.Mp3",
    "Chad.Mp3",
    "Chile.Mp3",
    "China.Mp3",
    "Colombia.Mp3",
    "Comoros.Mp3",
    "Congo.Mp3",
    "Costa Rica.Mp3",
    "Cote Divoire.Mp3",
    "Croatia.Mp3",
    "Cuba.Mp3",
    "Czech Republic.Mp3",
    "Denmark.Mp3",
    "Djibouti.Mp3",
    "Dominica.Mp3",
    "Dominican Republic.Mp3",
    "East Timor.Mp3",
    "Ecuador.Mp3",
    "Egypt.Mp3",
    "El Salvador.Mp3",
    "Eritrea.Mp3",
    "Estonia.Mp3",
    "Ethiopia.Mp3",
    "Fiji.Mp3",
    "Finland.Mp3",
    "France.Mp3",
    "Gabon.Mp3",
    "Gambia.Mp3",
    "Georgia.Mp3",
    "Germany.Mp3",
    "Ghana.Mp3",
    "Greece.Mp3",
    "Guatemala.Mp3",
    "Guinea Bissau.Mp3",
    "Guinea.Mp3",
    "Guyana.Mp3",
    "Haiti.Mp3",
    "Honduras.Mp3",
    "Hungary.Mp3",
    "Iceland.Mp3",
    "India.Mp3",
    "Indonesia.Mp3",
    "Iraq.Mp3",
    "Ireland.Mp3",
    "Israel.Mp3",
    "Italy.Mp3",
    "Jamaica.Mp3",
    "Japan.Mp3",
    "Jordan.Mp3",
    "Kazakhstan.Mp3",
    "Kenya.Mp3",
    "Korea-South.Mp3",
    "Kosovo.Mp3",
    "Kuwait.Mp3",
    "Kyrgyzstan.Mp3",
    "Laos.Mp3",
    "Latvia.Mp3",
    "Lebanon.Mp3",
    "Lesotho.Mp3",
    "Liberia.Mp3",
    "Libya.Mp3",
    "Liechtenstein.Mp3",
    "Lithuania.Mp3",
    "Luxembourg.Mp3",
    "Macedonia.Mp3",
    "Madagascar.Mp3",
    "Malawi.Mp3",
    "Malaysia.Mp3",
    "Maldives.Mp3",
    "Mali.Mp3",
    "Malta.Mp3",
    "Mauritania.Mp3",
    "Mauritius.Mp3",
    "Mexico.Mp3",
    "Moldova.Mp3",
    "Monaco.Mp3",
    "Montenegro.Mp3",
    "Morocco.Mp3",
    "Mozambique.Mp3",
    "Myanmar.Mp3",
    "Namibia.Mp3",
    "Nepal.Mp3",
    "Netherlands.Mp3",
    "New Zealand.Mp3",
    "Nicaragua.Mp3",
    "Nigeria.Mp3",
    "Norway.Mp3",
    "Oman.Mp3",
    "Pakistan.Mp3",
    "Palau-Belau.Mp3",
    "Panama.Mp3",
    "Papua New Guinea.Mp3",
    "Peru.Mp3",
    "Philippines.Mp3",
    "Poland.Mp3",
    "Portugal.Mp3",
    "Puerto-Rico.Mp3",
    "Qatar.Mp3",
    "Romania.Mp3",
    "Russia.Mp3",
    "Rwanda.Mp3",
    "Senegal.Mp3",
    "Serbia.Mp3",
    "Seychelles.Mp3",
    "Sierra Leone.Mp3",
    "Singapore.Mp3",
    "Slovakia.Mp3",
    "Slovenia.Mp3",
    "Somalia.Mp3",
    "South Africa.Mp3",
    "South Sudan.Mp3",
    "Spain .Mp3",
    "Sri-Lanka.Mp3",
    "Sudan.Mp3",
    "Swaziland.Mp3",
    "Sweden.Mp3",
    "Switzerland.Mp3",
    "Tajikistan.Mp3",
    "Tanzania.Mp3",
    "Togo.Mp3",
    "Tunisia.Mp3",
    "Turkey.Mp3",
    "Turkmenistan.Mp3",
    "Uganda.Mp3",
    "Ukraine.Mp3",
    "United Arab-Emirates.Mp3",
    "United Kingdom.Mp3",
    "United States.Mp3",
    "Uruguay.Mp3",
    "Uzbekistan.Mp3",
    "Vanuatu.Mp3",
    "Venezuela.Mp3",
    "Vietnam.Mp3",
    "Yemen.Mp3"
  ];

  let currentAnswer = null;
  let anthemAudio = null;
  let roundInProgress = false;

  function getFullClass(el) {
    return (el.getAttribute("class") || "").trim();
  }

  function setGroupFill(fullClass, color) {
    if (!fullClass) return;
    svg.querySelectorAll(`[class="${CSS.escape(fullClass)}"]`).forEach(p => {
      p.style.fill = color;
    });
  }

  playBtn.addEventListener("click", () => {
    if (roundInProgress) return;

    const file = anthemFiles[Math.floor(Math.random() * anthemFiles.length)];
    currentAnswer = file.replace(/\.Mp3$/, "");
    anthemAudio = new Audio(`anthem_data/${file}`);
    anthemAudio.play();
    roundInProgress = true;
    guessBtn.disabled = false;
    nameEl.textContent = "Guess the country!";
  });

  countries.forEach(country => {
    const groupKey = getFullClass(country);

    country.addEventListener("mouseenter", () => {
      setGroupFill(groupKey, HOVER_FILL);
    });

    country.addEventListener("mouseleave", () => {
      setGroupFill(groupKey, BASE_FILL);
    });

    country.addEventListener("click", (e) => {
      const clickedName =
        e.target.getAttribute("name") ||
        getFullClass(e.target) ||
        "Unknown";

      nameEl.textContent = clickedName;

      svg.querySelectorAll(`[name="${CSS.escape(getFullClass(e.target))}"]`).forEach(p => {
        p.style.strokeWidth = 1.4;
      });
    });
  });

  guessBtn.addEventListener("click", () => {
    if (!roundInProgress || !currentAnswer) return;

    const target = nameEl.textContent || "";

    if (target === currentAnswer) {
      alert("Correct! 🎉");
    } else {
      alert(`Wrong! The correct answer was ${currentAnswer}.`);
    }

    roundInProgress = false;
    currentAnswer = null;
    if (anthemAudio) {
      anthemAudio.pause();
      anthemAudio.currentTime = 0;
    }
  });

  ensureViewBox(svg);

  let viewBox = parseViewBox(svg);
  let isPanning = false;
  let startPt = { x: 0, y: 0 };
  let startView = { ...viewBox };

  svg.addEventListener("mousedown", (e) => {
    isPanning = true;
    startPt = clientToSvg(svg, e.clientX, e.clientY);
    startView = { ...viewBox };
  });

  window.addEventListener("mousemove", (e) => {
    if (!isPanning) return;
    const pt = clientToSvg(svg, e.clientX, e.clientY);
    const dx = pt.x - startPt.x;
    const dy = pt.y - startPt.y;
    viewBox.minX = startView.minX - dx;
    viewBox.minY = startView.minY - dy;
    applyViewBox(svg, viewBox);
  });

  window.addEventListener("mouseup", () => {
    isPanning = false;
  });

  svg.addEventListener("wheel", (e) => {
    e.preventDefault();
    const scaleFactor = (e.deltaY < 0) ? 0.9 : 1.1;
    const mouse = clientToSvg(svg, e.clientX, e.clientY);

    viewBox.minX = mouse.x - (mouse.x - viewBox.minX) * scaleFactor;
    viewBox.minY = mouse.y - (mouse.y - viewBox.minY) * scaleFactor;
    viewBox.width *= scaleFactor;
    viewBox.height *= scaleFactor;

    applyViewBox(svg, viewBox);
  }, { passive: false });

  function ensureViewBox(svgEl) {
    if (!svgEl.hasAttribute("viewBox")) {
      const b = svgEl.getBBox();
      svgEl.setAttribute("viewBox", `${b.x} ${b.y} ${b.width} ${b.height}`);
    }
  }

  function parseViewBox(svgEl) {
    const [minX, minY, width, height] = svgEl
      .getAttribute("viewBox")
      .split(/\s+|,/)
      .map(Number);
    return { minX, minY, width, height };
  }

  function applyViewBox(svgEl, vb) {
    svgEl.setAttribute("viewBox", `${vb.minX} ${vb.minY} ${vb.width} ${vb.height}`);
  }

  function clientToSvg(svgEl, clientX, clientY) {
    const pt = svgEl.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svgEl.getScreenCTM();
    const inv = ctm.inverse();
    const svgPt = pt.matrixTransform(inv);
    return { x: svgPt.x, y: svgPt.y };
  }
})();
