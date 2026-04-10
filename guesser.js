(function () {
  /* ── DOM ── */
  const mapContainer = document.querySelector('.world-map');
  const svg          = document.querySelector('#world');
  const allPaths     = document.querySelectorAll('#world path');
  const pathMap      = {};
  const isoMap       = {
    'Russian Federation': 'RU', 'France': 'FR', 'United States': 'US', 
    'United Kingdom': 'GB', 'Norway': 'NO', 'China': 'CN', 'Japan': 'JP', 
    'Brazil': 'BR', 'Canada': 'CA', 'Australia': 'AU', 'India': 'IN',
    'Israel': 'IL', 'Iran': 'IR', 'Ukraine': 'UA', 'Italy': 'IT', 
    'Spain': 'ES', 'Germany': 'DE', 'Greece': 'GR', 'Turkey': 'TR'
  };
  
  allPaths.forEach(p => { 
    const name = p.getAttribute('name') || (p.getAttribute('class') || '').trim();
    const id = p.getAttribute('id');
    if (name) {
      (pathMap[name] = pathMap[name] || []).push(p);
      if (id && !isoMap[name]) isoMap[name] = id;
    }
  });
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
  const langBtns     = document.querySelectorAll('.lang-btn');

  const proceedBtn   = document.getElementById('proceed-btn');

  const scoreRing    = document.getElementById('score-ring');
  const finalBig     = document.getElementById('final-score-big');
  const finalTotal   = document.getElementById('final-total');
  const finalMsg     = document.getElementById('final-msg');
  const finalSub     = document.getElementById('final-sub');
  const reviewList   = document.getElementById('review-list');

  /* Study Mode Elements */
  const studyModeBtn = document.getElementById('study-mode-btn');
  const studyScreen  = document.getElementById('study-screen');
  const studyBackBtn = document.getElementById('study-back-btn');
  const studySearch  = document.getElementById('study-search');
  const countryList  = document.getElementById('country-list');

  const wikiScreen   = document.getElementById('wiki-screen');
  const wikiBackBtn  = document.getElementById('wiki-back-btn');
  const wikiFlag     = document.getElementById('wiki-flag');
  const wikiCountryTitle = document.getElementById('wiki-country-title');
  const wikiAnthemName   = document.getElementById('wiki-anthem-name');
  const wikiHistory  = document.getElementById('wiki-history');
  const wikiFunFact  = document.getElementById('wiki-fun-fact');
  const wikiPlayBtn  = document.getElementById('wiki-play-btn');
  const wikiProgress = document.getElementById('wiki-progress');
  const wikiTimeCurr = document.getElementById('wiki-time-current');
  const wikiTimeTotal= document.getElementById('wiki-time-total');
  const wikiLyrics     = document.getElementById('wiki-lyrics');
  const wikiLyricsSection = document.getElementById('wiki-lyrics-section');
  const btnLyricNative = document.getElementById('btn-lyric-native');
  const btnLyricEnglish = document.getElementById('btn-lyric-english');
  const uiRefs = {
    selectedCountryLabel: document.getElementById('selected-country-label'),
    anthemLabel: document.getElementById('anthem-label'),
    startTitle: document.getElementById('start-title'),
    startDescription: document.getElementById('start-description'),
    languageGroupLabel: document.getElementById('language-group-label'),
    roundsGroupLabel: document.getElementById('rounds-group-label'),
    difficultyGroupLabel: document.getElementById('difficulty-group-label'),
    regionGroupLabel: document.getElementById('region-group-label'),
    finalScoreSub: document.getElementById('final-score-sub'),
    studyTitle: document.getElementById('study-title'),
    wikiAnthemLabel: document.getElementById('wiki-anthem-label'),
    wikiHistoryLabel: document.getElementById('wiki-history-label'),
    wikiFunFactLabel: document.getElementById('wiki-fun-fact-label'),
    wikiLyricsLabel: document.getElementById('wiki-lyrics-label')
  };

  /* ── Inject HUD ── */
  mapContainer.insertAdjacentHTML('beforeend', `
    <div id="hud">
      <div class="hud-item"><span class="hud-label">Round</span><span class="hud-value" id="hud-round">—</span></div>
      <div class="hud-divider"></div>
      <div class="hud-item" id="hud-score-item"><span class="hud-label">Score</span><span class="hud-value" id="hud-score">0</span></div>
      <div class="hud-divider"></div>
      <div class="hud-item hud-correct-item"><span class="hud-label">✓</span><span class="hud-value hud-val-correct" id="hud-correct">0</span></div>
      <div class="hud-divider"></div>
      <div class="hud-item hud-wrong-item"><span class="hud-label">✗</span><span class="hud-value hud-val-wrong" id="hud-wrong">0</span></div>
    </div>
    <div id="feedback-banner"></div>
    <div id="round-progress"><div id="round-progress-bar" style="width:0%"></div></div>
    <div id="click-hint">🖱 Drag to pan · Scroll to zoom · Click country to select</div>
  `);
  const hudRound   = document.getElementById('hud-round');
  const hudScore   = document.getElementById('hud-score');
  const hudCorrect = document.getElementById('hud-correct');
  const hudWrong   = document.getElementById('hud-wrong');
  const feedback   = document.getElementById('feedback-banner');
  const progressBar= document.getElementById('round-progress-bar');
  uiRefs.hudLabels = document.querySelectorAll('#hud .hud-label');
  uiRefs.clickHint = document.getElementById('click-hint');

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
    'Bhutan': { r: 'south-asia', d: 'difficult' },
    'Bolivia': { r: 'americas', d: 'difficult' },
    'Bosnia Herzegovina': { r: 'europe', d: 'difficult' },
    'Brazil': { r: 'americas', d: 'easy' },
    'Bulgaria': { r: 'europe', d: 'difficult' },
    'Brunei': { r: 'southeast-asia', d: 'difficult' },
    'Cambodia': { r: 'southeast-asia', d: 'difficult' },
    'Canada': { r: 'americas', d: 'easy' },
    'Chad': { r: 'africa', d: 'difficult' },
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
    'Lithuania': { r: 'europe', d: 'difficult' },
    'Luxembourg': { r: 'europe', d: 'difficult' },
    'Madagascar': { r: 'africa', d: 'difficult' },
    'Malaysia': { r: 'southeast-asia', d: 'intermediate' },
    'Maldives': { r: 'south-asia', d: 'difficult' },
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
    'Tonga': { r: 'pacific', d: 'difficult' },
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
    language: 'en',
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
    audioStatusKey: 'waitingForGame',
    volume: 0.6,
    played: new Set(),
    filteredPool: [],
    currentWikiLyrics: { native: '', english: '' }
  };

  const normalize = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const searchNormalize = s => (s || '').toLowerCase().normalize('NFKC');
  const escapeHtml = s => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  const translations = {
    en: {
      selectedCountry: 'Selected Country',
      clickCountry: 'Click a country on the map',
      noCountrySelected: 'No country selected',
      selectedSuffix: 'selected',
      anthemLabel: 'National Anthem',
      replay: 'Replay',
      submit: 'Submit',
      proceed: 'Proceed',
      waitingForGame: 'Waiting for game…',
      stopped: 'Stopped',
      playing: 'Playing…',
      audioError: 'Audio error',
      finishedPick: 'Finished — make your pick!',
      loading: 'Loading…',
      startTitle: 'Anthem Guesser',
      startDescription: 'Challenge your ears! Guess national anthems based on difficulty, regional focus, or recent global news.',
      language: 'Language',
      rounds: '1. Rounds',
      difficulty: '2. Difficulty',
      region: '3. Region / Mode',
      roundLabel: 'Round',
      scoreLabel: 'Score',
      correctLabel: '✓',
      wrongLabel: '✗',
      clickHint: '🖱 Drag to pan · Scroll to zoom · Click country to select',
      easy: 'Easy',
      intermediate: 'Mid',
      difficult: 'Hard',
      all: 'All Level',
      world: 'World',
      eastAsia: 'East Asia',
      americas: 'Americas',
      europe: 'Europe',
      africa: 'Africa',
      pacific: 'Pacific',
      middleEast: 'Middle East',
      southeastAsia: 'SE Asia',
      southAsia: 'S Asia',
      centralAsia: 'C Asia',
      news: 'Recent News',
      studyMode: 'Study Mode',
      startGame: 'Start Game →',
      finalScoreSub: '/ {total} correct',
      finalScoreSuffix: 'correct',
      gameOver: 'Game Over!',
      menu: 'Menu',
      playAgain: 'Play Again →',
      back: '← Back',
      libraryBack: '← Library',
      anthemLibrary: 'Anthem Library',
      searchPlaceholder: 'Search countries or anthems...',
      countryDetails: 'Country Details',
      anthem: 'Anthem',
      historyOrigin: 'History & Origin',
      historyFallback: 'No history available for this anthem yet.',
      funFact: 'Fun Fact',
      funFactFallback: 'Did you know? Every anthem has a unique story.',
      lyrics: 'National Lyrics',
      native: 'Native',
      english: 'English',
      translationLabel: 'English',
      lyricsPlaceholder: 'Lyrics will appear here...',
      noCountriesFound: 'No countries found for this difficulty/region combo! Try a different setting.',
      feedbackCorrect: '✓ Correct! {country}',
      feedbackWrong: '✗ Wrong — it was {country}',
      reviewWrongArrow: ' → ',
      finalMsgs: ['Keep practicing!','Not bad!','Well done!','Excellent!','Perfect!'],
      finalSubs: {
        perfect: 'You nailed every anthem.',
        strong: 'A strong run across the playlist.',
        okay: 'Nice work. A few more rounds and you will know even more.',
        rough: 'You are learning fast. Try another round and keep listening.'
      },
      unknown: 'Unknown',
      couldNotPlay: 'Could not play anthem for {country}. Please ensure "anthem_data/{file}.m4a" exists.'
    },
    ja: {
      selectedCountry: '選択中の国',
      clickCountry: '地図上の国をクリックしてください',
      noCountrySelected: 'まだ国が選択されていません',
      selectedSuffix: 'を選択中',
      anthemLabel: '国歌',
      replay: 'もう一度再生',
      submit: '回答する',
      proceed: '次へ',
      waitingForGame: 'ゲーム開始を待っています…',
      stopped: '停止中',
      playing: '再生中…',
      audioError: '音声エラー',
      finishedPick: '再生終了 — 国を選んでください！',
      loading: '読み込み中…',
      startTitle: 'Anthem Guesser',
      startDescription: '耳で挑戦しよう。難易度や地域、最近の国際ニュースに合わせて国歌を当ててみましょう。',
      language: '言語',
      rounds: '1. ラウンド数',
      difficulty: '2. 難易度',
      region: '3. 地域 / モード',
      roundLabel: 'ラウンド',
      scoreLabel: 'スコア',
      correctLabel: '正解',
      wrongLabel: '不正解',
      clickHint: '🖱 ドラッグで移動・スクロールで拡大縮小・国をクリックして選択',
      easy: 'やさしい',
      intermediate: 'ふつう',
      difficult: 'むずかしい',
      all: 'すべて',
      world: '世界',
      eastAsia: '東アジア',
      americas: '南北アメリカ',
      europe: 'ヨーロッパ',
      africa: 'アフリカ',
      pacific: '太平洋',
      middleEast: '中東',
      southeastAsia: '東南アジア',
      southAsia: '南アジア',
      centralAsia: '中央アジア',
      news: '最近のニュース',
      studyMode: '学習モード',
      startGame: 'ゲーム開始 →',
      finalScoreSub: '/ {total} 問正解',
      finalScoreSuffix: '問正解',
      gameOver: 'ゲーム終了！',
      menu: 'メニュー',
      playAgain: 'もう一度遊ぶ →',
      back: '← 戻る',
      libraryBack: '← ライブラリ',
      anthemLibrary: '国歌ライブラリ',
      searchPlaceholder: '国名や国歌名を検索...',
      countryDetails: '国の詳細',
      anthem: '国歌',
      historyOrigin: '歴史と由来',
      historyFallback: 'この国歌の歴史情報はまだありません。',
      funFact: '豆知識',
      funFactFallback: '知っていましたか？ どの国歌にもそれぞれの物語があります。',
      lyrics: '歌詞',
      native: '原語',
      english: '英語',
      translationLabel: '日本語訳',
      lyricsPlaceholder: 'ここに歌詞が表示されます...',
      noCountriesFound: 'この難易度と地域の組み合わせに合う国が見つかりませんでした。別の設定を試してください。',
      feedbackCorrect: '✓ 正解！ {country}',
      feedbackWrong: '✗ 不正解 — 正しくは {country}',
      reviewWrongArrow: ' → ',
      finalMsgs: ['もっと練習しよう！','なかなか良いです！','よくできました！','すばらしい！','完璧！'],
      finalSubs: {
        perfect: 'すべての国歌を見事に当てました。',
        strong: 'とても良い結果でした。',
        okay: 'よくできました。あと数ラウンドでさらに覚えられます。',
        rough: '着実に上達しています。もう一度挑戦してみましょう。'
      },
      unknown: '不明',
      couldNotPlay: '{country} の国歌を再生できませんでした。"anthem_data/{file}.m4a" が存在するか確認してください。'
    }
  };
  const t = (key, params = {}) => {
    const dict = translations[gs.language] || translations.en;
    let value = dict[key];
    if (value == null) value = translations.en[key] ?? key;
    if (typeof value !== 'string') return value;
    return value.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? '');
  };
  function setSelectedHintText(text) { selectedHint.innerHTML = `<span class="dot"></span>${escapeHtml(text)}`; }
  function setCountryPrompt() { countryNameEl.textContent = t('clickCountry'); setSelectedHintText(t('noCountrySelected')); }
  function setAudioStatusText(key) { gs.audioStatusKey = key; audioStatus.textContent = t(key); }
  function setFinalScoreSubtitle() {
    uiRefs.finalScoreSub.innerHTML = '';
    uiRefs.finalScoreSub.append('/ ');
    uiRefs.finalScoreSub.appendChild(finalTotal);
    uiRefs.finalScoreSub.append(` ${t('finalScoreSuffix')}`);
  }
  function updateLanguageButtons() { langBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === gs.language)); }
  function updateStaticTranslations() {
    uiRefs.selectedCountryLabel.textContent = t('selectedCountry');
    uiRefs.anthemLabel.textContent = t('anthemLabel');
    playBtn.textContent = `🔄 ${t('replay')}`;
    guessBtn.textContent = `✓ ${t('submit')}`;
    proceedBtn.textContent = `▶ ${t('proceed')}`;
    uiRefs.startTitle.textContent = t('startTitle');
    uiRefs.startDescription.textContent = t('startDescription');
    uiRefs.languageGroupLabel.textContent = t('language');
    uiRefs.roundsGroupLabel.textContent = t('rounds');
    uiRefs.difficultyGroupLabel.textContent = t('difficulty');
    uiRefs.regionGroupLabel.textContent = t('region');
    if (uiRefs.hudLabels && uiRefs.hudLabels.length >= 4) {
      uiRefs.hudLabels[0].textContent = t('roundLabel');
      uiRefs.hudLabels[1].textContent = t('scoreLabel');
      uiRefs.hudLabels[2].textContent = t('correctLabel');
      uiRefs.hudLabels[3].textContent = t('wrongLabel');
    }
    uiRefs.clickHint.textContent = t('clickHint');
    diffBtns.forEach(btn => {
      const map = { easy: 'easy', intermediate: 'intermediate', difficult: 'difficult', all: 'all' };
      btn.textContent = t(map[btn.dataset.diff]);
    });
    regBtns.forEach(btn => {
      const map = {
        world: 'world', 'east-asia': 'eastAsia', americas: 'americas', europe: 'europe', africa: 'africa',
        pacific: 'pacific', 'middle-east': 'middleEast', 'southeast-asia': 'southeastAsia',
        'south-asia': 'southAsia', 'central-asia': 'centralAsia', news: 'news'
      };
      btn.textContent = t(map[btn.dataset.region]);
    });
    studyModeBtn.textContent = `📖 ${t('studyMode')}`;
    startBtn.textContent = t('startGame');
    setFinalScoreSubtitle();
    if (!endScreen.classList.contains('active')) finalMsg.textContent = t('gameOver');
    menuBtn.textContent = `☰ ${t('menu')}`;
    againBtn.textContent = t('playAgain');
    studyBackBtn.textContent = t('back');
    uiRefs.studyTitle.textContent = t('anthemLibrary');
    studySearch.placeholder = t('searchPlaceholder');
    wikiBackBtn.textContent = t('libraryBack');
    if (!wikiCountryTitle.dataset.countryName) wikiCountryTitle.textContent = t('countryDetails');
    uiRefs.wikiAnthemLabel.textContent = t('anthem');
    uiRefs.wikiHistoryLabel.textContent = t('historyOrigin');
    uiRefs.wikiFunFactLabel.textContent = t('funFact');
    uiRefs.wikiLyricsLabel.textContent = t('lyrics');
    btnLyricNative.textContent = t('native');
    btnLyricEnglish.textContent = t('translationLabel');
    if (!wikiLyrics.dataset.hasContent || wikiLyrics.dataset.hasContent === 'false') wikiLyrics.textContent = t('lyricsPlaceholder');
  }
  function refreshLanguageState() {
    updateLanguageButtons();
    updateStaticTranslations();
    if (!gs.selectedCountry) setCountryPrompt();
    else {
      countryNameEl.textContent = getDisplayCountryName(gs.selectedCountry);
      setSelectedHintText(`${getDisplayCountryName(gs.selectedCountry)} ${t('selectedSuffix')}`);
    }
    setAudioStatusText(gs.audioStatusKey || 'waitingForGame');
  }

  /* ?????? Study Mode Data (JSON) ?????? */
  let STUDY_MAP = {};
  let studyDataReady = null;

  async function loadStudyData() {
    let data = null;
    if (window.STUDY_DATA && Object.keys(window.STUDY_DATA).length) {
      data = window.STUDY_DATA;
    } else {
      const res = await fetch('study_data.json');
      if (!res.ok) throw new Error('Failed to load study_data.json');
      data = await res.json();
    }
    STUDY_MAP = {};
    Object.keys(data).forEach(k => { STUDY_MAP[normalize(k)] = data[k]; });
  }

  function ensureStudyDataLoaded() {
    if (!studyDataReady) {
      studyDataReady = loadStudyData().catch(err => {
        console.error('Study data load error:', err);
        STUDY_MAP = {};
      });
    }
    return studyDataReady;
  }

  function getStudyInfo(name) {
    return STUDY_MAP[normalize(name)] || null;
  }

  function getDisplayCountryName(name) {
    const info = getStudyInfo(name);
    if (gs.language === 'ja' && info && info.ja_name) return info.ja_name;
    return name;
  }

  function getLocalizedWikiText(info, key, fallbackKey) {
    if (!info) return t(fallbackKey);
    if (gs.language === 'ja' && info[key + '_ja']) return info[key + '_ja'];
    return info[key] || t(fallbackKey);
  }

  function getLocalizedTranslationText(info) {
    if (!info) return '';
    if (gs.language === 'ja' && info.translation_ja) return info.translation_ja;
    return info.translation || '';
  }


  /* ── Map Pan/Zoom Logic ── */
  let scale = 1, tx = 0, ty = 0, isPanning = false, dragMoved = false, sx, sy, stx, sty, lx, ly;
  const layer = svg.parentElement;
  
  // Ensure the SVG has correct origin and positioning for zooming math
  Object.assign(svg.style, { 
    position: 'absolute', 
    top: '0', 
    left: '0',
    transformOrigin: '0 0'
  });

  function applyTransform() { svg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`; }

  const onWinMove = e => { if (!isPanning) return; dragMoved = true; tx = stx + (e.clientX - sx); ty = sty + (e.clientY - sy); applyTransform(); };
  const onWinUp = () => { isPanning = false; layer.style.cursor = 'grab'; window.removeEventListener('pointermove', onWinMove); window.removeEventListener('pointerup', onWinUp); };

  layer.addEventListener('pointerdown', e => { if (e.button !== 0) return; isPanning = true; dragMoved = false; sx = e.clientX; sy = e.clientY; stx = tx; sty = ty; lx = sx; ly = sy; layer.style.cursor = 'grabbing'; window.addEventListener('pointermove', onWinMove); window.addEventListener('pointerup', onWinUp); });
  mapContainer.addEventListener('wheel', e => { e.preventDefault(); const f = e.deltaY < 0 ? 1.12 : 1/1.12; const ns = Math.max(0.25, Math.min(10, scale * f)); if (ns === scale) return; const rect = mapContainer.getBoundingClientRect(); const mx = e.clientX - rect.left, my = e.clientY - rect.top; tx = mx - (mx - tx) * (ns / scale); ty = my - (my - ty) * (ns / scale); scale = ns; applyTransform(); }, { passive: false });

  /* ── Game Logic ── */
  function setVolume(v) { gs.volume = v / 100; if (gs.audio) gs.audio.volume = gs.volume; volPct.textContent = v + '%'; volIcon.textContent = v === 0 ? '🔇' : v < 40 ? '🔉' : '🔊'; }
  setVolume(parseInt(volSlider.value)); volSlider.addEventListener('input', () => setVolume(parseInt(volSlider.value)));

  function clearSelection() { gs.selectedPaths.forEach(p => { p.classList.remove('selected'); p.style.fill = ''; }); gs.selectedPaths = []; gs.selectedCountry = null; }
  function selectCountry(el) {
    if (gs.state !== 'playing') return; clearSelection();
    const name = el.getAttribute('name') || (el.getAttribute('class')||'').trim(); if (!name) return;
    const paths = (el.getAttribute('class')||'').trim() ? [...svg.querySelectorAll(`[class="${CSS.escape(el.getAttribute('class').trim())}"]`)] : [el];
    const displayName = getDisplayCountryName(name);
    paths.forEach(p => { p.style.fill = ''; p.classList.add('selected'); }); gs.selectedPaths = paths; gs.selectedCountry = name; countryNameEl.textContent = displayName; setSelectedHintText(`${displayName} ${t('selectedSuffix')}`); guessBtn.disabled = false;
  }

  function stopAudio() { if (gs.audio) { gs.audio.pause(); gs.audio.src = ''; gs.audio = null; } waveform.className = 'waveform idle'; setAudioStatusText('stopped'); }

  const AUDIO_FIX = { 'Brunei': 'Burnei', 'Uruguay': 'Urguay' };
  function hasAudioSource(name) {
    const fileName = AUDIO_FIX[name] || name;
    return !!(window.STUDY_AUDIO_FILES && window.STUDY_AUDIO_FILES[fileName]);
  }

  function playAudio(name) { 
    stopAudio(); 
    const fileName = AUDIO_FIX[name] || name;
    const audio = new Audio(`anthem_data/${fileName}.m4a`); 
    audio.volume = gs.volume; gs.audio = audio; setAudioStatusText('playing'); waveform.className = 'waveform playing'; audio.play().catch(() => { setAudioStatusText('audioError'); }); audio.addEventListener('ended', () => { waveform.className = 'waveform idle'; setAudioStatusText('finishedPick'); }); 
  }

  function updateHUD() { 
    const max = Math.min(gs.totalRounds, gs.filteredPool.length);
    hudRound.textContent = gs.round + '/' + max; 
    hudScore.textContent = gs.correct;
    hudCorrect.textContent = gs.correct;
    hudWrong.textContent = gs.wrong;
    statCorrect.textContent = gs.correct;
    statWrong.textContent = gs.wrong;
    progressBar.style.width = (gs.round / max * 100) + '%'; 
  }
  function showFeedback(text, type) { feedback.textContent = text; feedback.className = 'show ' + type; setTimeout(() => { feedback.className = ''; }, 2200); }

  function startGame() {
    gs.round = 0; gs.correct = 0; gs.wrong = 0; gs.history = []; gs.played = new Set();
    if (gs.region === 'news') {
      gs.filteredPool = ['Ukraine', 'Russian Federation', 'United States', 'Iran', 'Israel'];
    } else {
      gs.filteredPool = anthems.filter(name => {
        const meta = countryMeta[name];
        const regionMatch = gs.region === 'world' || meta.r === gs.region;
        const diffMatch = gs.difficulty === 'all' || meta.d === gs.difficulty;
        return regionMatch && diffMatch;
      });
    }
    if (gs.filteredPool.length === 0) { alert(t('noCountriesFound')); return; }
    clearSelection(); overlay.classList.add('hidden'); setTimeout(startRound, 300);
  }

  function startRound() {
    if (gs.round >= gs.totalRounds || gs.round >= gs.filteredPool.length) { endGame(); return; }
    gs.round++; gs.state = 'playing'; gs.selectedCountry = null; gs.selectedPaths = [];
    allPaths.forEach(p => { p.classList.remove('path-correct', 'path-wrong'); p.style.fill = ''; });
    setCountryPrompt();
    guessBtn.disabled = true; playBtn.disabled = false; updateHUD();
    const remaining = gs.filteredPool.filter(a => !gs.played.has(a));
    const name = remaining[Math.floor(Math.random() * remaining.length)];
    gs.played.add(name); gs.currentAnswer = name;
    setAudioStatusText('loading'); playAudio(name);
    proceedBtn.classList.add('hidden');
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
    if (isCorrect) { gs.correct++; showFeedback(t('feedbackCorrect', { country: getDisplayCountryName(gs.currentAnswer) }), 'correct'); } 
    else { gs.wrong++; showFeedback(t('feedbackWrong', { country: getDisplayCountryName(gs.currentAnswer) }), 'wrong'); }
    updateHUD(); stopAudio();
    proceedBtn.classList.remove('hidden');
  }

  function endGame() {
    gs.state = 'ended'; stopAudio();
    const max = Math.min(gs.totalRounds, gs.filteredPool.length);
    const pct = Math.round((gs.correct / max) * 100);
    finalBig.textContent = gs.correct; finalTotal.textContent = max; scoreRing.style.setProperty('--pct', pct);
    const msgs = t('finalMsgs');
    finalMsg.textContent = msgs[Math.floor(pct/21)];
    finalSub.textContent = pct === 100 ? t('finalSubs').perfect : pct >= 70 ? t('finalSubs').strong : pct >= 40 ? t('finalSubs').okay : t('finalSubs').rough;
    reviewList.innerHTML = gs.history.map(h => `<div class="review-item ${h.wasCorrect?'ok':'bad'}"><span class="rname">${escapeHtml(getDisplayCountryName(h.anthem))}</span>${!h.wasCorrect?`${t('reviewWrongArrow')}${escapeHtml(getDisplayCountryName(h.guess))}`:''}</div>`).join('');
    [startScreen, endScreen].forEach(s => s.classList.remove('active')); endScreen.classList.add('active'); overlay.classList.remove('hidden');
  }

  /* ── Study Mode Functions ── */
  async function renderCountryList(filter = '') {
    await ensureStudyDataLoaded();
    countryList.innerHTML = '';
    const sorted = Object.keys(isoMap)
      .filter(name => hasAudioSource(name))
      .sort((a, b) => getDisplayCountryName(a).localeCompare(getDisplayCountryName(b), gs.language === 'ja' ? 'ja' : 'en'));
    const nf = searchNormalize(filter);
    sorted.forEach(name => {
      const info = getStudyInfo(name) || {};
      const displayName = getDisplayCountryName(name);
      const anthem = info.anthem || '';
      const native = info.native || '';
      const iso = info.id || (isoMap[name] ? isoMap[name].toLowerCase() : 'un');
      const jaName = info.ja_name || '';
      if (filter && !searchNormalize(name).includes(nf) && !searchNormalize(displayName).includes(nf) && !searchNormalize(jaName).includes(nf) && !searchNormalize(anthem).includes(nf) && !searchNormalize(native).includes(nf)) return;
      const item = document.createElement('div');
      item.className = 'country-item';
      item.innerHTML = `<img src="https://flagcdn.com/w80/${iso.toLowerCase()}.png" alt="flag"><div class="country-info"><span class="c-name">${escapeHtml(displayName)}</span>${anthem ? `<span class="c-anthem">${escapeHtml(anthem)}${native && native !== anthem ? ` (${escapeHtml(native)})` : ''}</span>` : ''}</div>`;
      item.onclick = () => showWikiPage(name);
      countryList.appendChild(item);
    });
  }

  async function showWikiPage(name) {
    await ensureStudyDataLoaded();
    if (!hasAudioSource(name)) return;
    stopWikiAudio();
    const info = getStudyInfo(name) || {};
    const data = {
      anthem: info.anthem || t('unknown'), native: info.native || '',
      history: getLocalizedWikiText(info, 'history', 'historyFallback'),
      funFact: getLocalizedWikiText(info, 'funFact', 'funFactFallback'),
      translation: getLocalizedTranslationText(info),
      id: info.id || (isoMap[name] ? isoMap[name].toLowerCase() : 'un')
    };
    wikiCountryTitle.dataset.countryName = name;
    wikiCountryTitle.textContent = getDisplayCountryName(name);
    wikiAnthemName.innerHTML = `${escapeHtml(data.anthem)}${data.native && data.native !== data.anthem ? `<br><small style="opacity:0.7">${escapeHtml(data.native)}</small>` : ''}`;
    wikiHistory.textContent = data.history; wikiFunFact.textContent = data.funFact;
    
    // Lyrics logic
    if (info.lyrics || data.translation) {
      wikiLyricsSection.style.display = 'block';
      gs.currentWikiLyrics = { native: info.lyrics || '', english: data.translation || '' };
      // Default to Native if available, else English
      const hasNative = !!gs.currentWikiLyrics.native;
      wikiLyrics.textContent = hasNative ? gs.currentWikiLyrics.native : gs.currentWikiLyrics.english;
      wikiLyrics.dataset.hasContent = 'true';
      btnLyricNative.classList.toggle('active', hasNative);
      btnLyricEnglish.classList.toggle('active', !hasNative);
      btnLyricNative.style.display = hasNative ? 'inline-block' : 'none';
      btnLyricEnglish.style.display = gs.currentWikiLyrics.english ? 'inline-block' : 'none';
    } else {
      wikiLyricsSection.style.display = 'none';
      wikiLyrics.dataset.hasContent = 'false';
      wikiLyrics.textContent = t('lyricsPlaceholder');
    }

    wikiFlag.src = `https://flagcdn.com/w160/${data.id}.png`;
    wikiPlayBtn.classList.remove('playing'); 
    wikiPlayBtn.textContent = '▶';
    wikiProgress.value = 0;
    wikiTimeCurr.textContent = '0:00'; wikiTimeTotal.textContent = '0:00';
    [studyScreen, wikiScreen].forEach(s => s.classList.remove('active')); wikiScreen.classList.add('active');
  }

  let wikiAudio = null;
  function startWikiAudio() {
    const name = wikiCountryTitle.dataset.countryName || wikiCountryTitle.textContent;
    if (wikiAudio) stopWikiAudio();
    stopAudio(); // Stop game audio if running

    const fileName = AUDIO_FIX[name] || name;
    wikiAudio = new Audio(`anthem_data/${fileName}.m4a`);
    wikiAudio.volume = gs.volume;

    wikiAudio.onloadedmetadata = () => {
      wikiTimeTotal.textContent = formatTime(wikiAudio.duration);
    };

    wikiAudio.play().then(() => { 
      wikiPlayBtn.classList.add('playing'); 
      wikiPlayBtn.textContent = '⏸';
    }).catch(e => {
      console.error("Wiki audio Error:", e);
      alert(t('couldNotPlay', { country: getDisplayCountryName(name), file: fileName }));
    });

    wikiAudio.ontimeupdate = () => { 
      if (!wikiAudio) return; 
      const p = (wikiAudio.currentTime / wikiAudio.duration) * 100; 
      wikiProgress.value = isNaN(p) ? 0 : p; 
      wikiTimeCurr.textContent = formatTime(wikiAudio.currentTime); 
    };

    wikiAudio.onended = () => { 
      wikiPlayBtn.classList.remove('playing'); 
      wikiPlayBtn.textContent = '▶';
      wikiProgress.value = 0; 
    };
  }

  function stopWikiAudio() { if (wikiAudio) { wikiAudio.pause(); wikiAudio = null; wikiPlayBtn.classList.remove('playing'); wikiPlayBtn.textContent = '▶'; } }
  function formatTime(s) { if (isNaN(s) || !isFinite(s)) return '0:00'; const m = Math.floor(s / 60); const rs = Math.floor(s % 60); return `${m}:${rs < 10 ? '0' : ''}${rs}`; }

  /* ── Event Listeners ── */
  layer.addEventListener('mouseover', e => { if (gs.state!=='playing'||isPanning) return; const path = e.target.closest('path'); if(!path) return; const key = (path.getAttribute('class')||'').trim(); if(key) svg.querySelectorAll(`[class="${CSS.escape(key)}"]`).forEach(p => { if(!p.classList.contains('selected')) p.style.fill = 'var(--country-hover)'; }); else if(!path.classList.contains('selected')) path.style.fill='var(--country-hover)'; });
  layer.addEventListener('mouseout', e => { const path = e.target.closest('path'); if(!path) return; const key=(path.getAttribute('class')||'').trim(); if(key) svg.querySelectorAll(`[class="${CSS.escape(key)}"]`).forEach(p => { if(!p.classList.contains('selected')) p.style.fill=''; }); else if(!path.classList.contains('selected')) path.style.fill=''; });
  layer.addEventListener('click', e => { if(dragMoved) return; const path=e.target.closest('path'); if(path) selectCountry(path); });

  playBtn.addEventListener('click', () => { if(gs.currentAnswer) playAudio(gs.currentAnswer); });
  guessBtn.addEventListener('click', submitGuess);
  startBtn.addEventListener('click', startGame);
  againBtn.addEventListener('click', startGame);
  menuBtn.addEventListener('click', () => { stopAudio(); gs.state='menu'; [startScreen, endScreen].forEach(s=>s.classList.remove('active')); startScreen.classList.add('active'); overlay.classList.remove('hidden'); });

  wikiPlayBtn.addEventListener('click', () => { if (wikiAudio) stopWikiAudio(); else startWikiAudio(); });
  studyModeBtn.addEventListener('click', async () => { overlay.classList.remove('hidden'); [startScreen, endScreen, wikiScreen].forEach(s => s.classList.remove('active')); studyScreen.classList.add('active'); await renderCountryList(); });
  studyBackBtn.addEventListener('click', () => { [studyScreen,wikiScreen].forEach(s=>s.classList.remove('active')); startScreen.classList.add('active'); overlay.classList.remove('hidden'); });
  wikiBackBtn.addEventListener('click', () => { [wikiScreen].forEach(s=>s.classList.remove('active')); studyScreen.classList.add('active'); stopWikiAudio(); });
  langBtns.forEach(btn => btn.addEventListener('click', () => {
    gs.language = btn.dataset.lang || 'en';
    refreshLanguageState();
    if (studyScreen.classList.contains('active')) renderCountryList(studySearch.value);
    if (wikiScreen.classList.contains('active') && wikiCountryTitle.dataset.countryName) showWikiPage(wikiCountryTitle.dataset.countryName);
    if (endScreen.classList.contains('active')) endGame();
  }));

  btnLyricNative.addEventListener('click', () => {
    if (!gs.currentWikiLyrics || !gs.currentWikiLyrics.native) return;
    wikiLyrics.textContent = gs.currentWikiLyrics.native;
    btnLyricNative.classList.add('active');
    btnLyricEnglish.classList.remove('active');
  });
  btnLyricEnglish.addEventListener('click', () => {
    if (!gs.currentWikiLyrics || !gs.currentWikiLyrics.english) return;
    wikiLyrics.textContent = gs.currentWikiLyrics.english;
    btnLyricEnglish.classList.add('active');
    btnLyricNative.classList.remove('active');
  });

  proceedBtn.addEventListener('click', () => {
    proceedBtn.classList.add('hidden');
    layer.style.pointerEvents = '';
    startRound();
  });

  studySearch.addEventListener('input', (e) => { renderCountryList(e.target.value); });
  
  roundBtns.forEach(btn => btn.addEventListener('click', () => { roundBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active'); gs.totalRounds = parseInt(btn.dataset.rounds); }));
  diffBtns.forEach(btn => btn.addEventListener('click', () => { diffBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active'); gs.difficulty = btn.dataset.diff; }));
  regBtns.forEach(btn => btn.addEventListener('click', () => { regBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active'); gs.region = btn.dataset.region; }));
  ensureStudyDataLoaded();
  refreshLanguageState();
  setCountryPrompt();
  setAudioStatusText('waitingForGame');

})();
