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
    "Afghanistan.m4a",
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
    "Brunei.m4a",
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
    "Hungary.m4a",
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
    "Kyrgyzstan.m4a",
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
    "Uruguay.m4a",
    "Uzbekistan.m4a",
    "Vietnam.m4a"
  ];

  playBtn.disabled = false;

  let currentAnswer = null;
  let anthemAudio = null;
  let roundInProgress = false;
  let currentPoints = 0;

  // Drag/pan state
  let isPanning = false;
  let startClient = { x: 0, y: 0 };  // screen coords at drag start
  let startView = {};                  // viewBox snapshot at drag start
  let svgPixelToSvgUnit = 1;          // px-per-SVG-unit at drag start (constant during drag)
  let viewBox;
  let rafPending = false;
  let lastClient = { x: 0, y: 0 };   // latest screen coords during drag

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

  // Track whether the last mousedown turned into a drag, so clicks after panning are ignored.
  let wasDragging = false;
  svg.addEventListener("mousedown", e => {
    if (e.button !== 0) return;
    const ox = e.clientX, oy = e.clientY;
    const onUp = ev => {
      wasDragging = Math.abs(ev.clientX - ox) > 5 || Math.abs(ev.clientY - oy) > 5;
      document.removeEventListener("mouseup", onUp, true);
    };
    document.addEventListener("mouseup", onUp, { capture: true, once: true });
  });

  countries.forEach(country => {
    const groupKey = getFullClass(country);
    country.addEventListener("mouseenter", () => !isPanning && setGroupFill(groupKey, HOVER_FILL));
    country.addEventListener("mouseleave", () => setGroupFill(groupKey, BASE_FILL));

    country.addEventListener("click", e => {
      if (wasDragging) return;   // ignore click that ended a pan gesture
      const clickedName = e.target.getAttribute("name") || getFullClass(e.target) || "Unknown";
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
      currentPoints++;
      points.textContent = "Current points: " + currentPoints;
    } else {
      alert(`Wrong... The correct answer was ${currentAnswer}. Please train more.`);
    }
    guessBtn.disabled = true;
    playBtn.disabled = false;
    roundInProgress = false;
    currentAnswer = null;
    if (anthemAudio) {
      anthemAudio.pause();
      anthemAudio.currentTime = 0;
    }
  });

  ensureViewBox(svg);
  viewBox = parseViewBox(svg);
  const initialViewBox = { ...viewBox };
  const MAX_ZOOM_OUT_MULTIPLIER = 2;
  const MIN_ZOOM_IN_MULTIPLIER = 0.1;

  svg.style.cursor = "grab";
  svg.style.touchAction = "none";

  // Drag/pan: use screen-space deltas to avoid drift from re-projecting through a moving viewBox.
  function initDragHandlers() {
    if (svg._dragInitialized) return;
    svg._dragInitialized = true;

    function scheduleUpdate() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        // Convert screen delta to SVG units using the scale captured at drag-start.
        // svgPixelToSvgUnit is stable for the whole drag, so there's no feedback loop.
        const dxScreen = lastClient.x - startClient.x;
        const dyScreen = lastClient.y - startClient.y;
        viewBox.minX = startView.minX - dxScreen * svgPixelToSvgUnit;
        viewBox.minY = startView.minY - dyScreen * svgPixelToSvgUnit;
        applyViewBox(svg, viewBox);
      });
    }

    // Mouse handlers
    function onMouseDown(e) {
      if (e.button !== 0) return;
      isPanning = true;
      startView = { ...viewBox };
      startClient = { x: e.clientX, y: e.clientY };
      lastClient  = { x: e.clientX, y: e.clientY };
      // Capture scale once at drag-start: SVG units per screen pixel
      const rect = svg.getBoundingClientRect();
      svgPixelToSvgUnit = viewBox.width / rect.width;
      svg.style.cursor = "grabbing";
      svg.classList.add("panning");
      document.addEventListener("mousemove", onMouseMove, { passive: true });
      document.addEventListener("mouseup",   onMouseUp,   { once: true });
    }

    function onMouseMove(e) {
      if (!isPanning) return;
      lastClient.x = e.clientX;
      lastClient.y = e.clientY;
      scheduleUpdate();
    }

    function onMouseUp() {
      if (!isPanning) return;
      isPanning = false;
      svg.style.cursor = "grab";
      svg.classList.remove("panning");
      document.removeEventListener("mousemove", onMouseMove);
    }

    svg.addEventListener("mousedown", onMouseDown);

    // Touch handlers (single-touch pan)
    function onTouchStart(e) {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      isPanning = true;
      startView  = { ...viewBox };
      startClient = { x: t.clientX, y: t.clientY };
      lastClient  = { x: t.clientX, y: t.clientY };
      const rect = svg.getBoundingClientRect();
      svgPixelToSvgUnit = viewBox.width / rect.width;
      e.preventDefault();
    }

    function onTouchMove(e) {
      if (!isPanning || e.touches.length !== 1) return;
      const t = e.touches[0];
      lastClient.x = t.clientX;
      lastClient.y = t.clientY;
      scheduleUpdate();
      e.preventDefault();
    }

    function onTouchEnd() {
      isPanning = false;
    }

    svg.addEventListener("touchstart",  onTouchStart,  { passive: false });
    svg.addEventListener("touchmove",   onTouchMove,   { passive: false });
    svg.addEventListener("touchend",    onTouchEnd);
    svg.addEventListener("touchcancel", onTouchEnd);
  }

  initDragHandlers();

  svg.addEventListener("wheel", e => {
    e.preventDefault();
    const rawScale = e.deltaY < 0 ? 0.9 : 1.1;
    const mouse = clientToSvg(svg, e.clientX, e.clientY);
    const maxWidth = initialViewBox.width * MAX_ZOOM_OUT_MULTIPLIER;
    const minWidth = initialViewBox.width * MIN_ZOOM_IN_MULTIPLIER;
    let desiredWidth = viewBox.width * rawScale;
    let safeScale = rawScale;
    if (desiredWidth > maxWidth) safeScale = maxWidth / viewBox.width;
    else if (desiredWidth < minWidth) safeScale = minWidth / viewBox.width;
    viewBox.minX = mouse.x - (mouse.x - viewBox.minX) * safeScale;
    viewBox.minY = mouse.y - (mouse.y - viewBox.minY) * safeScale;
    viewBox.width *= safeScale;
    viewBox.height *= safeScale;
    applyViewBox(svg, viewBox);
  }, { passive: false });

  function ensureViewBox(svgEl) {
    if (!svgEl.hasAttribute("viewBox")) {
      const b = svgEl.getBBox();
      svgEl.setAttribute("viewBox", `${b.x} ${b.y} ${b.width} ${b.height}`);
    }
  }

  function parseViewBox(svgEl) {
    const [minX, minY, width, height] = svgEl.getAttribute("viewBox").split(/\s+|,/).map(Number);
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
