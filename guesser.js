(function () {
  const svg = document.querySelector("#world");
  const countries = document.querySelectorAll("#world path");
  const nameEl = document.getElementById("country-name");
  const guessBtn = document.getElementById("guess-btn");
  const playBtn = document.getElementById("play-btn");

  const BASE_FILL = "#443d4b";
  const HOVER_FILL = "#c99aff";

  function playAnthem(countryName) {
    new Audio(`anthem/${countryName}.mp3`).play();
  }

  function setFill(element, color) {
    element.style.fill = color;
  }

  countries.forEach(country => {
    country.addEventListener("mouseenter", () => {
      setFill(country, HOVER_FILL);
    });

    country.addEventListener("mouseleave", () => {
      setFill(country, BASE_FILL);
    });

    country.addEventListener("click", (e) => {
      const clickedName = e.target.getAttribute("name") || "Unknown";
      // "United States of America"
      nameEl.textContent = clickedName;
      guessBtn.disabled = false;

      countries.forEach(p => p.style.strokeWidth = 0.8);

      e.target.style.strokeWidth = 1.4;
    });
  });

  guessBtn.addEventListener("click", () => {
    const target = nameEl.textContent || "";
    if (!target || guessBtn.disabled) return;
    alert(`You guessed: ${target}`);
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
