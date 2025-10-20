
(function () {
  const svg = document.querySelector("#world");
  const countries = document.querySelectorAll("#world path");
  const nameEl = document.getElementById("country-name");
  const guessBtn = document.getElementById("guess-btn");
  const playBtn = document.getElementById("play-btn");
  const points = document.getElementById("points");

  const BASE_FILL = "#443d4b";
  const HOVER_FILL = "#c99aff";

  const anthemFiles = [
    "Afganistan.m4a",
    "Albania.m4a",
    "Argentina.m4a",
    "Armenia.m4a",
    "Australia.m4a",
    "Azerbaijan.m4a",
    "Bangladesh.m4a",
    "Belarus.m4a",
    "Belgium.m4a",
    "Bhutan.m4a",
    "Bolivia.m4a",
    "Bosnia Herzegovina.m4a",
    "Brazil.m4a",
    "Bulgaria.m4a",
    "Burnei.m4a",
    "Cambodia.m4a",
    "Canada.m4a",
    "Chad.m4a",
    "Chile.m4a",
    "China.m4a",
    "Colombia.m4a",
    "Croatia.m4a",
    "Cuba.m4a",
    "Czech Republic.m4a",
    "Denmark.m4a",
    "Egypt.m4a",
    "Estonia.m4a",
    "Ethiopia.m4a",
    "Finland.m4a",
    "France.m4a",
    "Georgia.m4a",
    "Germany.m4a",
    "Greece.m4a",
    "Hangary.m4a",
    "Iceland.m4a",
    "India.m4a",
    "Indonesia.m4a",
    "Iran.m4a",
    "Iraq.m4a",
    "Ireland.m4a",
    "Israel.m4a",
    "Italy.m4a",
    "Jamaica.m4a",
    "Japan.m4a",
    "Jordan.m4a",
    "Kazakhstan.m4a",
    "Kenya.m4a",
    "Kyrgystan.m4a",
    "Laos.m4a",
    "Latvia.m4a",
    "Lichtenstein.m4a",
    "Lithuania.m4a",
    "Luxembourg.m4a",
    "Madagascar.m4a",
    "Malaysia.m4a",
    "Maldives.m4a",
    "Malta.m4a",
    "Mexico.m4a",
    "Moldova.m4a",
    "Monaco.m4a",
    "Mongolia.m4a",
    "Morocco.m4a",
    "Myanmar.m4a",
    "Nepal.m4a",
    "Netherlands.m4a",
    "New Zealand.m4a",
    "Nicaragua.m4a",
    "Nigeria.m4a",
    "North Korea.m4a",
    "Norway.m4a",
    "Pakistan.m4a",
    "Panama.m4a",
    "Paraguay.m4a",
    "Peru.m4a",
    "Philippines.m4a",
    "Poland.m4a",
    "Portugal.m4a",
    "Qatar.m4a",
    "Romania.m4a",
    "Russian Federation.m4a",
    "Saudi Arabia.m4a",
    "Serbia.m4a",
    "Singapore.m4a",
    "Slovakia.m4a",
    "Slovenia.m4a",
    "South Africa.m4a",
    "South Korea.m4a",
    "Spain.m4a",
    "Sri Lanka.m4a",
    "Sweden.m4a",
    "Switzerland.m4a",
    "Syria.m4a",
    "Tajikistan.m4a",
    "Thailand.m4a",
    "Tonga.m4a",
    "Tunisia.m4a",
    "Turkey.m4a",
    "Turkmenistan.m4a",
    "Ukraine.m4a",
    "United Arab Emirates.m4a",
    "United Kingdom.m4a",
    "United States.m4a",
    "Urguay.m4a",
    "Uzbekistan.m4a",
    "Vietnam.m4a"
  ];

  playBtn.disabled = false;

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

    window.playedAnthems = window.playedAnthems || new Set();
    let remaining = anthemFiles.filter(f => !window.playedAnthems.has(f));

    if (remaining.length === 0) {
      window.playedAnthems.clear();
      remaining = [...anthemFiles];
    }

    const file = remaining[Math.floor(Math.random() * remaining.length)];
    window.playedAnthems.add(file);
    currentAnswer = file.replace(/\.m4a$/, "");
    anthemAudio = new Audio(`anthem_data/${file}`);
    anthemAudio.play();
    roundInProgress = true;
    guessBtn.disabled = false;
    playBtn.disabled = true;
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
        // not "class", "name" class, class is only for countries with several areas
      });
    });
  });

  let currentPoint = 0
  guessBtn.addEventListener("click", () => {
    if (!roundInProgress || !currentAnswer) return;

    const target = nameEl.textContent || "";

    if (target === currentAnswer) {
      alert("Correct! 🎉");
      currentPoint++ ;
      points.textContent = "Current points: " + currentPoint;
      
    } else {
      alert(`Wrong! The correct answer was ${currentAnswer}.`);
    }
    guessBtn.disabled = true;
    playBtn.disabled = false
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


// active on 