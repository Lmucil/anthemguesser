(function () {
  /* ── DOM ── */
  const mapContainer = document.querySelector('.world-map');
  const svg          = document.querySelector('#world');
  const allPaths     = document.querySelectorAll('#world path');
  const countryNameEl= document.getElementById('country-name');
  const selectedHint = document.getElementById('selected-hint');
  const playBtn      = document.getElementById('play-btn');
  const guessBtn     = document.getElementById('guess-btn');
  const audioStatus  = document.getElementById('audio-status');
  const waveform     = document.getElementById('waveform');
  const volSlider    = document.getElementById('vol-slider');
  const volPct       = document.getElementById('vol-pct');
  const volIcon      = document.getElementById('vol-icon');
  const statCorrect  = document.getElementById('stat-correct');
  const statWrong    = document.getElementById('stat-wrong');

  /* overlay / screens */
  const overlay      = document.getElementById('game-overlay');
  const startScreen  = document.getElementById('start-screen');
  const endScreen    = document.getElementById('end-screen');
  const startBtn     = document.getElementById('start-game-btn');
  const menuBtn      = document.getElementById('menu-btn');
  const againBtn     = document.getElementById('again-btn');
  
  const roundBtns    = document.querySelectorAll('.round-btn');
  const diffBtns     = document.querySelectorAll('.diff-btn');
  const regBtns      = document.querySelectorAll('.reg-btn');

  const scoreRing    = document.getElementById('score-ring');
  const finalBig     = document.getElementById('final-score-big');
  const finalTotal   = document.getElementById('final-total');
  const finalMsg     = document.getElementById('final-msg');
  const finalSub     = document.getElementById('final-sub');
  const reviewList   = document.getElementById('review-list');

  /* ── Inject HUD + feedback + progress + hint into map ── */
  mapContainer.insertAdjacentHTML('beforeend', `
    <div id="hud">
      <div class="hud-item"><span class="hud-label">Round</span><span class="hud-value" id="hud-round">—</span></div>
      <div class="hud-divider"></div>
      <div class="hud-item" id="hud-score-item"><span class="hud-label">Score</span><span class="hud-value" id="hud-score">0</span></div>
    </div>
    <div id="feedback-banner"></div>
    <div id="round-progress"><div id="round-progress-bar" style="width:0%"></div></div>
    <div id="click-hint">🖱 Drag to pan · Scroll to zoom · Click country to select</div>
  `);
  const hudRound   = document.getElementById('hud-round');
  const hudScore   = document.getElementById('hud-score');
  const feedback   = document.getElementById('feedback-banner');
  const progressBar= document.getElementById('round-progress-bar');

  /* ── Metadata ── */
  const countryMeta = {
    'Afghanistan': { r: 'south-asia', d: 'difficult' },
    'Albania': { r: 'europe', d: 'difficult' },
    'Argentina': { r: 'americas', d: 'intermediate' },
    'Armenia': { r: 'central-asia', d: 'difficult' },
    'Australia': { r: 'pacific', d: 'easy' },
    'Azerbaijan': { r: 'central-asia', d: 'difficult' },
    'Bangladesh': { r: 'south-asia', d: 'intermediate' },
    'Belarus': { r: 'europe', d: 'difficult' },
    'Belgium': { r: 'europe', d: 'intermediate' },
    'Bhutan': { r: 'south-asia', d: 'hell' },
    'Bolivia': { r: 'americas', d: 'difficult' },
    'Bosnia Herzegovina': { r: 'europe', d: 'difficult' },
    'Brazil': { r: 'americas', d: 'easy' },
    'Bulgaria': { r: 'europe', d: 'difficult' },
    'Brunei': { r: 'southeast-asia', d: 'hell' },
    'Cambodia': { r: 'southeast-asia', d: 'difficult' },
    'Canada': { r: 'americas', d: 'easy' },
    'Chad': { r: 'africa', d: 'hell' },
    'Chile': { r: 'americas', d: 'intermediate' },
    'China': { r: 'east-asia', d: 'easy' },
    'Colombia': { r: 'americas', d: 'intermediate' },
    'Croatia': { r: 'europe', d: 'intermediate' },
    'Cuba': { r: 'americas', d: 'intermediate' },
    'Czech Republic': { r: 'europe', d: 'intermediate' },
    'Denmark': { r: 'europe', d: 'intermediate' },
    'Egypt': { r: 'africa', d: 'easy' },
    'Estonia': { r: 'europe', d: 'difficult' },
    'Ethiopia': { r: 'africa', d: 'difficult' },
    'Finland': { r: 'europe', d: 'intermediate' },
    'France': { r: 'europe', d: 'easy' },
    'Georgia': { r: 'central-asia', d: 'difficult' },
    'Germany': { r: 'europe', d: 'easy' },
    'Greece': { r: 'europe', d: 'easy' },
    'Hungary': { r: 'europe', d: 'intermediate' },
    'Iceland': { r: 'europe', d: 'difficult' },
    'India': { r: 'south-asia', d: 'easy' },
    'Indonesia': { r: 'southeast-asia', d: 'easy' },
    'Iran': { r: 'middle-east', d: 'easy' },
    'Iraq': { r: 'middle-east', d: 'intermediate' },
    'Ireland': { r: 'europe', d: 'easy' },
    'Israel': { r: 'middle-east', d: 'easy' },
    'Italy': { r: 'europe', d: 'easy' },
    'Jamaica': { r: 'americas', d: 'easy' },
    'Japan': { r: 'east-asia', d: 'easy' },
    'Jordan': { r: 'middle-east', d: 'difficult' },
    'Kazakhstan': { r: 'central-asia', d: 'intermediate' },
    'Kenya': { r: 'africa', d: 'difficult' },
    'Kyrgyzstan': { r: 'central-asia', d: 'difficult' },
    'Laos': { r: 'southeast-asia', d: 'difficult' },
    'Latvia': { r: 'europe', d: 'difficult' },
    'Lichtenstein': { r: 'europe', d: 'hell' },
    'Lithuania': { r: 'europe', d: 'difficult' },
    'Luxembourg': { r: 'europe', d: 'difficult' },
    'Madagascar': { r: 'africa', d: 'difficult' },
    'Malaysia': { r: 'southeast-asia', d: 'intermediate' },
    'Maldives': { r: 'south-asia', d: 'hell' },
    'Malta': { r: 'europe', d: 'difficult' },
    'Mexico': { r: 'americas', d: 'easy' },
    'Moldova': { r: 'europe', d: 'difficult' },
    'Mongolia': { r: 'east-asia', d: 'difficult' },
    'Morocco': { r: 'africa', d: 'intermediate' },
    'Myanmar': { r: 'southeast-asia', d: 'difficult' },
    'Nepal': { r: 'south-asia', d: 'difficult' },
    'Netherlands': { r: 'europe', d: 'easy' },
    'New Zealand': { r: 'pacific', d: 'easy' },
    'Nicaragua': { r: 'americas', d: 'difficult' },
    'Nigeria': { r: 'africa', d: 'intermediate' },
    'North Korea': { r: 'east-asia', d: 'easy' },
    'Norway': { r: 'europe', d: 'intermediate' },
    'Pakistan': { r: 'south-asia', d: 'intermediate' },
    'Panama': { r: 'americas', d: 'intermediate' },
    'Paraguay': { r: 'americas', d: 'difficult' },
    'Peru': { r: 'americas', d: 'intermediate' },
    'Philippines': { r: 'southeast-asia', d: 'intermediate' },
    'Poland': { r: 'europe', d: 'intermediate' },
    'Portugal': { r: 'europe', d: 'easy' },
    'Qatar': { r: 'middle-east', d: 'intermediate' },
    'Romania': { r: 'europe', d: 'intermediate' },
    'Russian Federation': { r: 'europe', d: 'easy' },
    'Saudi Arabia': { r: 'middle-east', d: 'easy' },
    'Serbia': { r: 'europe', d: 'intermediate' },
    'Slovakia': { r: 'europe', d: 'difficult' },
    'Slovenia': { r: 'europe', d: 'difficult' },
    'South Africa': { r: 'africa', d: 'easy' },
    'South Korea': { r: 'east-asia', d: 'easy' },
    'Spain': { r: 'europe', d: 'easy' },
    'Sri Lanka': { r: 'south-asia', d: 'intermediate' },
    'Sweden': { r: 'europe', d: 'intermediate' },
    'Switzerland': { r: 'europe', d: 'easy' },
    'Syria': { r: 'middle-east', d: 'difficult' },
    'Tajikistan': { r: 'central-asia', d: 'difficult' },
    'Thailand': { r: 'southeast-asia', d: 'easy' },
    'Tonga': { r: 'pacific', d: 'hell' },
    'Tunisia': { r: 'africa', d: 'difficult' },
    'Turkey': { r: 'europe', d: 'easy' },
    'Turkmenistan': { r: 'central-asia', d: 'difficult' },
    'Ukraine': { r: 'europe', d: 'easy' },
    'United Arab Emirates': { r: 'middle-east', d: 'intermediate' },
    'United Kingdom': { r: 'europe', d: 'easy' },
    'United States': { r: 'americas', d: 'easy' },
    'Uruguay': { r: 'americas', d: 'intermediate' },
    'Uzbekistan': { r: 'central-asia', d: 'difficult' },
    'Vietnam': { r: 'southeast-asia', d: 'intermediate' }
  };

  const anthems = Object.keys(countryMeta);

  /* ── Game state ── */
  let gs = {
    state: 'menu',
    totalRounds: 10,
    difficulty: 'easy',
    region: 'world',
    round: 0,
    correct: 0,
    wrong: 0,
    history: [],
    currentAnswer: null,
    selectedCountry: null,
    selectedPaths: [],
    audio: null,
    volume: 0.6,
    played: new Set(),
    filteredPool: []
  };

  /* ── Selection Logic ── */
  function setupSelectors(buttons, field, dataAttr) {
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const val = btn.getAttribute(`data-${dataAttr}`);
        gs[field] = val;
        
        // Special case for rounds which is a number
        if (field === 'rounds') gs.totalRounds = parseInt(val);
      });
    });
  }
  setupSelectors(roundBtns, 'rounds',     'rounds');
  setupSelectors(diffBtns,  'difficulty', 'diff');
  setupSelectors(regBtns,   'region',     'region');

  /* ── CSS-transform pan/zoom ── */
  const layer = document.createElement('div');
  layer.id = 'map-layer';
  Object.assign(layer.style, { position:'absolute', top:'0', left:'0', transformOrigin:'0 0', cursor:'grab' });
  mapContainer.style.position = 'relative'; mapContainer.style.overflow = 'hidden';
  svg.parentNode.insertBefore(layer, svg); layer.appendChild(svg);
  svg.style.display = 'block';

  let tx = 0, ty = 0, scale = 1;
  function applyTransform() { layer.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`; }
  function fitMap() {
    const sw = +svg.getAttribute('width') || 2000; const sh = +svg.getAttribute('height') || 1000;
    scale = Math.min(mapContainer.clientWidth / sw, mapContainer.clientHeight / sh);
    tx = (mapContainer.clientWidth - sw * scale) / 2; ty = (mapContainer.clientHeight - sh * scale) / 2;
    applyTransform();
  }
  fitMap(); window.addEventListener('resize', fitMap);

  let isPanning = false, dragMoved = false, sx = 0, sy = 0, stx = 0, sty = 0, lx = 0, ly = 0, rafPend = false;
  function schedPan() {
    if (rafPend) return; rafPend = true;
    requestAnimationFrame(() => { rafPend = false; tx = stx + (lx-sx); ty = sty + (ly-sy); applyTransform(); });
  }
  const onWinMove = e => { if (!isPanning) return; lx = e.clientX; ly = e.clientY; if (Math.abs(lx-sx) > 3 || Math.abs(ly-sy) > 3) dragMoved = true; schedPan(); };
  const onWinUp = () => { if (!isPanning) return; isPanning = false; layer.style.cursor = 'grab'; window.removeEventListener('pointermove', onWinMove); window.removeEventListener('pointerup', onWinUp); };
  layer.addEventListener('pointerdown', e => { if (e.button !== 0) return; isPanning = true; dragMoved = false; sx = e.clientX; sy = e.clientY; stx = tx; sty = ty; lx = sx; ly = sy; layer.style.cursor = 'grabbing'; window.addEventListener('pointermove', onWinMove); window.addEventListener('pointerup', onWinUp); });

  mapContainer.addEventListener('wheel', e => { e.preventDefault(); const f = e.deltaY < 0 ? 1.12 : 1/1.12; const ns = Math.max(0.25, Math.min(10, scale * f)); if (ns === scale) return; const rect = mapContainer.getBoundingClientRect(); const mx = e.clientX - rect.left, my = e.clientY - rect.top; tx = mx - (mx - tx) * (ns / scale); ty = my - (my - ty) * (ns / scale); scale = ns; applyTransform(); }, { passive: false });

  /* ── Game Logic ── */
  const pathMap = {}; allPaths.forEach(p => { const key = p.getAttribute('name') || (p.getAttribute('class') || '').trim(); if (key) (pathMap[key] = pathMap[key] || []).push(p); });

  function setVolume(v) { gs.volume = v / 100; if (gs.audio) gs.audio.volume = gs.volume; volPct.textContent = v + '%'; volIcon.textContent = v === 0 ? '🔇' : v < 40 ? '🔉' : '🔊'; }
  setVolume(parseInt(volSlider.value)); volSlider.addEventListener('input', () => setVolume(parseInt(volSlider.value)));

  function clearSelection() { gs.selectedPaths.forEach(p => { p.classList.remove('selected'); p.style.fill = ''; }); gs.selectedPaths = []; gs.selectedCountry = null; }
  function selectCountry(el) {
    if (gs.state !== 'playing') return; clearSelection();
    const name = el.getAttribute('name') || (el.getAttribute('class')||'').trim(); if (!name) return;
    const paths = (el.getAttribute('class')||'').trim() ? [...svg.querySelectorAll(`[class="${CSS.escape(el.getAttribute('class').trim())}"]`)] : [el];
    paths.forEach(p => { p.style.fill = ''; p.classList.add('selected'); }); gs.selectedPaths = paths; gs.selectedCountry = name; countryNameEl.textContent = name; selectedHint.innerHTML = `<span class="dot"></span>${name} selected`; guessBtn.disabled = false;
  }

  function stopAudio() { if (gs.audio) { gs.audio.pause(); gs.audio.src = ''; gs.audio = null; } waveform.className = 'waveform idle'; audioStatus.textContent = 'Stopped'; }
  function playAudio(name) { stopAudio(); const audio = new Audio(`anthem_data/${name}.m4a`); audio.volume = gs.volume; gs.audio = audio; audioStatus.textContent = 'Playing…'; waveform.className = 'waveform playing'; audio.play().catch(() => { audioStatus.textContent = 'Audio error'; }); audio.addEventListener('ended', () => { waveform.className = 'waveform idle'; audioStatus.textContent = 'Finished — make your pick!'; }); }

  function updateHUD() { hudRound.textContent = gs.round + '/' + Math.min(gs.totalRounds, gs.filteredPool.length); hudScore.textContent = gs.correct; statCorrect.textContent = gs.correct; statWrong.textContent = gs.wrong; progressBar.style.width = (gs.round / Math.min(gs.totalRounds, gs.filteredPool.length) * 100) + '%'; }
  function showFeedback(text, type) { feedback.textContent = text; feedback.className = 'show ' + type; setTimeout(() => { feedback.className = ''; }, 2200); }

  function startGame() {
    gs.round = 0; gs.correct = 0; gs.wrong = 0; gs.history = []; gs.played = new Set();
    
    // Filter pool
    if (gs.region === 'news') {
      gs.filteredPool = ['Ukraine', 'Russian Federation', 'United States', 'Iran', 'Israel'];
    } else {
      gs.filteredPool = anthems.filter(name => {
        const meta = countryMeta[name];
        const regionMatch = gs.region === 'world' || meta.r === gs.region;
        const diffMatch = meta.d === gs.difficulty;
        return regionMatch && diffMatch;
      });
    }

    if (gs.filteredPool.length === 0) {
      alert("No countries found for this difficulty/region combo! Try a different setting.");
      return;
    }

    clearSelection(); hideOverlay(); setTimeout(startRound, 300);
  }

  function startRound() {
    if (gs.round >= gs.totalRounds || gs.round >= gs.filteredPool.length) { endGame(); return; }
    gs.round++; gs.state = 'playing'; gs.selectedCountry = null; gs.selectedPaths = [];
    allPaths.forEach(p => { p.classList.remove('path-correct', 'path-wrong'); p.style.fill = ''; });
    countryNameEl.textContent = 'Click a country on the map'; selectedHint.innerHTML = '<span class="dot"></span>No country selected';
    guessBtn.disabled = true; playBtn.disabled = false; updateHUD();

    const remaining = gs.filteredPool.filter(a => !gs.played.has(a));
    const name = remaining[Math.floor(Math.random() * remaining.length)];
    gs.played.add(name); gs.currentAnswer = name;
    audioStatus.textContent = 'Loading…'; playAudio(name);
  }

  function submitGuess() {
    if (gs.state !== 'playing' || !gs.selectedCountry) return;
    gs.state = 'revealing'; guessBtn.disabled = true; playBtn.disabled = true; layer.style.pointerEvents = 'none';
    const isCorrect = gs.selectedCountry === gs.currentAnswer;
    gs.history.push({ anthem: gs.currentAnswer, guess: gs.selectedCountry, wasCorrect: isCorrect });
    gs.selectedPaths.forEach(p => p.classList.remove('selected'));
    const highlight = (n, c) => (pathMap[n]||[]).forEach(p => { p.classList.add(c); });
    highlight(gs.currentAnswer, 'path-correct');
    if (!isCorrect && gs.selectedCountry) highlight(gs.selectedCountry, 'path-wrong');
    if (isCorrect) { gs.correct++; showFeedback('✓ Correct! ' + gs.currentAnswer, 'correct'); } 
    else { gs.wrong++; showFeedback('✗ Wrong — it was ' + gs.currentAnswer, 'wrong'); }
    updateHUD(); stopAudio();
    setTimeout(() => { layer.style.pointerEvents = ''; startRound(); }, 2400);
  }

  function endGame() {
    gs.state = 'ended'; stopAudio();
    const max = Math.min(gs.totalRounds, gs.filteredPool.length);
    const pct = Math.round((gs.correct / max) * 100);
    finalBig.textContent = gs.correct; finalTotal.textContent = max; scoreRing.style.setProperty('--pct', pct);
    const msgs = ['Keep practicing!','Not bad!','Well done!','Excellent!','Perfect!'];
    finalMsg.textContent = msgs[Math.floor(pct/21)];
    reviewList.innerHTML = gs.history.map(h => `<div class="review-item ${h.wasCorrect?'ok':'bad'}"><span class="rname">${h.anthem}</span>${!h.wasCorrect?` → ${h.guess}`:''}</div>`).join('');
    [startScreen, endScreen].forEach(s => s.classList.remove('active')); endScreen.classList.add('active'); overlay.classList.remove('hidden');
  }

  function hideOverlay() { overlay.classList.add('hidden'); }
  const getGroupKey = el => (el.getAttribute('class') || '').trim();

  layer.addEventListener('mouseover', e => { if (gs.state!=='playing'||isPanning) return; const path = e.target.closest('path'); if(!path) return; const key = getGroupKey(path); if(key) svg.querySelectorAll(`[class="${CSS.escape(key)}"]`).forEach(p => { if(!p.classList.contains('selected')) p.style.fill = 'var(--country-hover)'; }); else if(!path.classList.contains('selected')) path.style.fill='var(--country-hover)'; });
  layer.addEventListener('mouseout', e => { const path = e.target.closest('path'); if(!path) return; const key=getGroupKey(path); if(key) svg.querySelectorAll(`[class="${CSS.escape(key)}"]`).forEach(p => { if(!p.classList.contains('selected')) p.style.fill=''; }); else if(!path.classList.contains('selected')) path.style.fill=''; });
  layer.addEventListener('click', e => { if(dragMoved) return; const path=e.target.closest('path'); if(path) selectCountry(path); });

  playBtn.addEventListener('click', () => { if(gs.currentAnswer) playAudio(gs.currentAnswer); });
  guessBtn.addEventListener('click', submitGuess);
  startBtn.addEventListener('click', startGame);
  againBtn.addEventListener('click', startGame);
  menuBtn.addEventListener('click', () => { stopAudio(); gs.state='menu'; [startScreen, endScreen].forEach(s=>s.classList.remove('active')); startScreen.classList.add('active'); overlay.classList.remove('hidden'); });
})();
