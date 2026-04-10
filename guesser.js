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
  const sidePanel    = document.querySelector('.side-panel');
  const backdrop     = document.getElementById('side-panel-backdrop');
  
  const roundBtns    = document.querySelectorAll('.round-btn');
  const diffBtns     = document.querySelectorAll('.diff-btn');
  const regBtns      = document.querySelectorAll('.reg-btn');

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

  /* ── Inject HUD ── */
  mapContainer.insertAdjacentHTML('beforeend', `
    <div id="hud">
      <div class="hud-item"><span class="hud-label">Round</span><span class="hud-value" id="hud-round">—</span></div>
      <div class="hud-divider"></div>
      <div class="hud-item" id="hud-score-item"><span class="hud-label">Score</span><span class="hud-value" id="hud-score">0</span></div>
      <button id="mobile-toggle" title="Show Panel">☰</button>
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
    filteredPool: [],
    currentWikiLyrics: { native: '', english: '' }
  };

  const normalize = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  /* ── Study Mode Data (Global Dataset) ── */
  const STUDY_DATA = {
    "Afghanistan": {
      "anthem": "Milli Surood", "native": "ملی سرود", "id": "af",
      "history": "Adopted in 2006, the lyrics were written by Abdul Bari Jahani. It reflects the diverse ethnic groups of the nation.",
      "funFact": "The anthem is required by law to be in Pashto and mention 'Allah is Greatest'.",
      "lyrics": "دا وطن افغانستان دی\nدا عزت د هر افغان دی\nکور د سولې، کور د تورې\nهر بچی يې قهرمان دی",
      "translation": "This land is Afghanistan,\nIt is the pride of every Afghan.\nThe land of peace, the land of the sword,\nEach of its sons is brave."
    },
    "Albania": {
      "anthem": "Himni i Flamurit", "native": "Himni i Flamurit", "id": "al",
      "history": "The lyrics were written by the Albanian poet Aleksandër Stavre Drenova and first published in 1912.",
      "funFact": "It is the only national anthem in the world whose lyrics are considered more sacred than the music itself.",
      "lyrics": "Rreth flamurit të përbashkuar,\nMe një dëshir' e një qëllim,\nTë gjith' atje duke u betuar,\nTë lidhim besën për shpëtim.\n\nPrej lufte veç ai largohet,\nQë është lindur tradhëtar,\nKush është burrë nuk frikësohet,\nPo vdes, po vdes si një dëshmor!",
      "translation": "Around our flag we are united,\nWith one will and one desire,\nA sacred oath are now proclaiming,\nFor our salvation to aspire.\n\nMay only those avoid the struggle,\nThose who are traitors to our laws,\nUndaunted is a hero through and through,\nHe dies a martyr to the cause."
    },
    "Argentina": {
      "anthem": "Himno Nacional Argentino", "native": "Himno Nacional Argentino", "id": "ar",
      "history": "Adopted in 1813, it was originally an anti-Spanish revolutionary song during the Wars of Independence.",
      "funFact": "Its long orchestral introduction is iconic, and the full version can last up to 20 minutes.",
      "lyrics": "Oíd, mortales, el grito sagrado:\n¡Libertad! ¡Libertad! ¡Libertad!\nOíd el ruido de rotas cadenas\nved en trono a la noble igualdad.",
      "translation": "Hear, mortals, the sacred cry:\nLiberty! Liberty! Liberty!\nHear the sound of broken chains\nSee noble equality enthroned."
    },
    "Armenia": {
      "anthem": "Mer Hayrenik", "native": "Մեր Հայրենիք", "id": "am",
      "history": "Adopted originally in 1918 and reinstated in 1991. The lyrics are based on 'The Song of an Italian Girl' by Mikayel Nalbandyan.",
      "funFact": "The title translates simply to 'Our Fatherland'.",
      "lyrics": "Մեր Հայրենիք, ազատ անկախ,\nՈր ապրել է դարեդար\nՅուր որդիքը արդ կանչում է\nԱզատ, անկախ Հայաստան:",
      "translation": "Our Fatherland, free and independent,\nThat has lived from century to century\nIts sons are now calling\nFree, independent Armenia."
    },
    "Australia": {
      "anthem": "Advance Australia Fair", "native": "Advance Australia Fair", "id": "au",
      "history": "Composed in 1878, it replaced 'God Save the Queen' as the official anthem in 1984.",
      "funFact": "In 2021, the lyrics were changed from 'young and free' to 'one and free' to acknowledge Indigenous history.",
      "lyrics": "Australians all let us rejoice,\nFor we are one and free;\nWe've golden soil and wealth for toil;\nOur home is girt by sea.",
      "translation": "Australians all let us rejoice,\nFor we are one and free;\nWe've golden soil and wealth for toil;\nOur home is girt by sea."
    },
    "Azerbaijan": {
      "anthem": "Azərbaycan marşı", "native": "Azərbaycan marşı", "id": "az",
      "history": "Originally composed in 1919 during the first republic and readopted after the fall of the USSR.",
      "funFact": "The music was composed by Uzeyir Hajibeyov, who also founded the first opera in the Muslim world.",
      "lyrics": "Azərbaycan! Azərbaycan!\nEy qəhrəman övladın şanlı Vətəni!\nSəndən ötrü can verməyə cümlə hazırız!\nSəndən ötrü qan tökməyə cümlə qadiriz!",
      "translation": "Azerbaijan! Azerbaijan!\nO glorious Fatherland of the brave children!\nWe are all ready to give our lives for you!\nWe are all ready to shed our blood for you!"
    },
    "Bangladesh": {
      "anthem": "Amar Shonar Bangla", "native": "আমার সোনার বাংলা", "id": "bd",
      "history": "Written by Rabindranath Tagore in 1905, it was used as a protest song against the partition of Bengal.",
      "funFact": "Tagore is the only person to have written the national anthems of two different countries (India and Bangladesh).",
      "lyrics": "আমার সোনার বাংলা, আমি তোমায় ভালোবাসি।\nচিরদিন তোমার আকাশ, তোমার বাতাস, আমার প্রাণে বাজায় বাঁশি।",
      "translation": "My golden Bengal, I love you.\nForever your skies, your air, set my heart in tune as if it were a flute."
    },
    "Belarus": {
      "anthem": "My Belarusy", "native": "Мы, беларусы", "id": "by",
      "history": "The music was originally written for the Byelorussian SSR in 1955, with updated lyrics adopted in 2002.",
      "funFact": "The current version keeps the Soviet-era melody but removes references to Lenin and the Communist Party.",
      "lyrics": "Мы, беларусы — мірныя людзі,\nСэрцам адданыя роднай зямлі,\nШчыра сябруем, сілы гартуем\nМы ў працавітай, вольнай сям’і.",
      "translation": "We, Belarusians, are peaceful people,\nDevoted to our native land with our hearts,\nWe are sincere friends, gathering strength\nIn our hardworking, free family."
    },
    "Belgium": {
      "anthem": "The Brabançonne", "native": "La Brabançonne", "id": "be",
      "history": "Written during the Belgian Revolution of 1830. There are separate official versions in Dutch, French, and German.",
      "funFact": "The anthem was reportedly written in a café during the heat of the revolution.",
      "lyrics": "O Belgique, ô mère chérie,\nÀ toi nos cœurs, à toi nos bras,\nÀ toi notre sang, ô Patrie !\nNous le jurons tous, tu vivras !\n\nTu vivras toujours grande et belle.\nEt ton invincible unité\nAura pour devise immortelle :\nLe Roi, la Loi, la Liberté !",
      "translation": "O Belgium, o mother dear,\nTo thee our hearts, to thee our arms,\nTo thee our blood, o Fatherland!\nWe all swear, thou shalt live!\n\nThou shalt live always great and beautiful.\nAnd thy invincible unity\nShall have for immortal motto:\nThe King, the Law, the Liberty!"
    },
    "Bhutan": {
      "anthem": "Druk Tsendhen", "native": "འབྲུག་ཙན་དྷန།", "id": "bt",
      "history": "Adopted in 1953. The title translates to 'The Thunder Dragon Kingdom'.",
      "funFact": "The original melody was based on a folk song, and the choreography for the anthem was designed by the King himself.",
      "lyrics": "འབྲུག་ཙན་དྷན་བཀོད་པའི་རྒྱལ་ཁབ་ནང་\nདཔལ་ལུགས་གཉིས་བསྟན་སྲིད་སྐྱོང་བའི་མགོན་",
      "translation": "In the Kingdom of Bhutan adorned with cypress,\nThe protector who guards the teachings of the dual system."
    },
    "Bolivia": {
      "anthem": "Himno Nacional de Bolivia", "native": "Himno Nacional de Bolivia", "id": "bo",
      "history": "Adopted in 1845. The music was composed by Leopoldo Benedetto Vincenti, an Italian musician.",
      "funFact": "It was first performed on the 20th anniversary of the Battle of Ingavi.",
      "lyrics": "Bolivianos: el hado propicio\ncoronó nuestros votos y anhelo.\nEs ya libre, ya libre este suelo,\nya cesó su servil condición.\n\nDe la Patria, el alto nombre,\nen glorioso esplendor conservemos.\nY en sus aras de nuevo juremos:\n¡Morir antes que esclavos vivir!",
      "translation": "Bolivians, a propitious fate\nhas at long last crowned our vows and longings;\nThis land is free, free at last.\nIts servile state has now finally ceased.\n\nLet us keep the lofty name of our Fatherland\nin glorious splendor.\nAnd, on its altars, once more we must swear:\nTo die before we would live as slaves!"
    },
    "Bosnia Herzegovina": {
      "anthem": "Državna himna Bosne i Hercegovine", "native": "Državna himna Bosne i Hercegovine", "id": "ba",
      "history": "Adopted in 1999 to replace the previous anthem, which was considered too ethnically specific.",
      "funFact": "It is one of only four national anthems in the world (along with Spain, San Marino, and Kosovo) that has no official lyrics.",
      "lyrics": "Ti si svjetlost duše\nVječne vatre plam\nMajko naša zemljo Bosno\nTebe volim ja",
      "translation": "You are the light of the soul\nThe flame of the eternal fire\nOur mother, land of Bosnia\nI love you."
    },
    "Brazil": {
      "anthem": "Hino Nacional Brasileiro", "native": "Hino Nacional Brasileiro", "id": "br",
      "history": "Composed in 1831, it celebrates the independence and the beauty of the Brazilian landscape.",
      "funFact": "The lyrics are extremely formal and complex, containing many poetic inversions that even native speakers find difficult.",
      "lyrics": "Ouviram do Ipiranga as margens plácidas\nDe um povo heróico o brado retumbante,\nE o sol da Liberdade, em raios fúlgidos,\nBrilhou no céu da Pátria nesse instante.",
      "translation": "The placid banks of the Ipiranga heard\nThe resounding cry of a heroic people,\nAnd the sun of Liberty, in brilliant beams,\nShone in the sky of the homeland at that instant."
    },
    "Bulgaria": {
      "anthem": "Mila Rodino", "native": "Мила Родино", "id": "bg",
      "history": "Based on the song 'Gorda Stara Planina', written by Tsvetan Radoslavov as he left to fight in the Serbo-Bulgarian War.",
      "funFact": "The lyrics have been changed many times to reflect different political regimes, including monarchist and socialist periods.",
      "lyrics": "Горда Стара планина,\nдо нея Дунава синей,\nслънце Тракия огрява,\nнад Пирина пламеней.\n\nМила Родино,\nти си земен рай,\nтвойта хубост, твойта прелест,\nах, те нямат край.",
      "translation": "Proud Balkan Mountains,\nNext to them the Danube blue,\nThe sun shines over Thrace,\nAnd blazes over Pirin.\n\nDear Motherland,\nYou are a paradise on earth,\nYour beauty, your loveliness,\nAh, they have no end."
    },
    "Brunei": {
      "anthem": "Allah Peliharakan Sultan", "native": "الله ڤليهاراكن سلطن", "id": "bn",
      "history": "Written in 1947 by a group of young people. It became the national anthem upon independence in 1984.",
      "funFact": "The title means 'God Bless the Sultan', reflecting the nation's absolute monarchy.",
      "lyrics": "Ya Allah lanjutkanlah usia\nKebawah Duli Yang Maha Mulia\nAdil berdaulat menaungi nusa\nMemimpin rakyat kekal bahagia",
      "translation": "O Allah, bless His Majesty\nWith a long life\nJustly and sovereignly ruling the land\nLeading the people into eternal happiness"
    },
    "Cambodia": {
      "anthem": "Nokor Reach", "native": "បទនគររာជ", "id": "kh",
      "history": "Based on a Cambodian folk tune, it was restored as the anthem in 1993 following the restoration of the monarchy.",
      "funFact": "The lyrics invoke the spirit of the ancient Angkor Empire.",
      "lyrics": "សូមពួកទេវត្តា រក្សាមហាក្សត្រយើង\nអោយបានរុងរឿង ដោយជ័យមង្គលསิរីសួស្តី",
      "translation": "Heaven protects our King,\nAnd gives him happiness and glory."
    },
    "Canada": {
      "anthem": "O Canada", "native": "Ô Canada", "id": "ca",
      "history": "Originally commissioned in 1880 for Saint-Jean-Baptiste Day. It became the official anthem in 1980.",
      "funFact": "The anthem was originally written in French; the English version is not a direct translation of the French lyrics.",
      "lyrics": "O Canada! Our home and native land!\nTrue patriot love in all of us command.\nWith glowing hearts we see thee rise,\nThe True North strong and free!",
      "translation": "O Canada! Our home and native land!\nTrue patriot love in all of us command.\nWith glowing hearts we see thee rise,\nThe True North strong and free!"
    },
    "Chad": {
      "anthem": "La Tchadienne", "native": "نشيد تشاد الوطني", "id": "td",
      "history": "Adopted in 1960 upon independence from France. The music is known for its upbeat, rhythmic style.",
      "funFact": "The lyrics celebrate the 'courageous and proud' people of the Sahel.",
      "lyrics": "Peuple Tchadien, debout et à l'ouvrage!\nTu as conquis ta terre et tes droits;\nTa liberté naît de ton courage.\nLève les yeux, l'avenir est à toi.",
      "translation": "People of Chad, arise and to work!\nYou have conquered your land and your rights;\nYour freedom is born from your courage.\nRaise your eyes, the future is yours."
    },
    "Chile": {
      "anthem": "Himno Nacional de Chile", "native": "Himno Nacional de Chile", "id": "cl",
      "history": "The current music was composed by Ramón Carnicer in 1827. The lyrics emphasize the nation's geography.",
      "funFact": "A specific verse praising the military was controversial for years following the Pinochet dictatorship.",
      "lyrics": "Puro, Chile, es tu cielo azulado,\npuras brisas te cruzan también,\ny tu campo de flores bordado\nes la copia feliz del Edén.\n\nDulce Patria, recibe los votos\ncon que Chile en tus aras juró:\nque o la tumba serás de los libres\no el asilo contra la opresión.",
      "translation": "Pure, Chile, is your blue sky,\npure breezes also cross you,\nand your field, embroidered with flowers,\nis the happy copy of Eden.\n\nSweet Homeland, receive the vows\nwith which Chile swore on your altars:\nthat you will be either the tomb of the free\nor the refuge against oppression."
    },
    "China": {
      "anthem": "March of the Volunteers", "native": "义勇军进行曲", "id": "cn",
      "history": "Written in 1935 as a theme song for a film about the resistance against Japanese invasion.",
      "funFact": "During the Cultural Revolution, it was often played without lyrics because the lyricist had been imprisoned.",
      "lyrics": "起来！不愿做奴隶的人们！\n把我们的血肉，筑成我们新的长城！\n中华民族到了最危险的时候，\n每个人被迫着发出最后的吼声。",
      "translation": "Arise! All who refuse to be slaves!\nLet our flesh and blood become our new Great Wall!\nAs the Chinese nation faces its greatest peril,\nAll forcefully expend their last cries."
    },
    "Colombia": {
      "anthem": "Himno Nacional de la República de Colombia", "native": "Himno Nacional de la República de Colombia", "id": "co",
      "history": "The lyrics were written by President Rafael Núñez in 1887. The music was composed by an Italian opera singer.",
      "funFact": "By law, it must be broadcast on all public radio and TV stations at 6:00 AM and 6:00 PM every day.",
      "lyrics": "¡Oh gloria inmarcesible!\n¡Oh júbilo inmortal!\n¡En surcos de dolores\nel bien germina ya!\n\n¡Cesó la horrible noche!\nLa libertad sublime\nderrama las auroras\nde su invencible luz.",
      "translation": "Oh, unwithering glory!\nOh, immortal jubilance!\nIn furrows of pain,\ngoodness now germinates!\n\nThe horrible night has ceased!\nSublime liberty\nspills the auroras\nof her invincible light."
    },
    "Croatia": {
      "anthem": "Lijepa naša domovino", "native": "Lijepa naša domovino", "id": "hr",
      "history": "The lyrics were first published in 1835. It was used as the official anthem even when Croatia was part of Yugoslavia.",
      "funFact": "The title translates to 'Our Beautiful Homeland'.",
      "lyrics": "Lijepa naša domovino,\nOj junačka zemljo mila,\nStare slave djedovino,\nDa bi vazda sretna bila!\n\nMila, kano si nam slavna,\nMila si nam ti jedina,\nMila, kuda si nam ravna,\nMila, kuda si planina!",
      "translation": "Our beautiful homeland,\nOh so fearless and gracious,\nOur fathers' ancient glory,\nMay you be blessed forever.\n\nDear, you are our only glory,\nDear, you are our only one,\nDear, we love your plains,\nDear, we love your mountains."
    },
    "Cuba": {
      "anthem": "El Himno de Bayamo", "native": "El Himno de Bayamo", "id": "cu",
      "history": "Written during the Battle of Bayamo in 1868. It is a fiery call to arms for the Cuban people.",
      "funFact": "The author wrote the lyrics while on horseback during the middle of the battle.",
      "lyrics": "¡Al combate, corred, bayameses!,\nQue la patria os contempla orgullosa;\nNo temáis una muerte gloriosa,\nQue morir por la patria es vivir.\n\nEn cadenas vivir es vivir\nEn afrenta y oprobio sumidos.\nDel clarín escuchad el sonido:\n¡A las armas, valientes, corred!",
      "translation": "Run to battle, men of Bayamo!\nThe motherland looks proudly to you;\nDo not fear a glorious death,\nBecause to die for the motherland is to live.\n\nTo live in chains is to live\nMired in shame and disgrace.\nHear the sound of the bugle:\nTo arms, brave ones, run!"
    },
    "Czech Republic": {
      "anthem": "Kde domov můj", "native": "Kde domov můj", "id": "cz",
      "history": "Originally written for a theatrical comedy in 1834. It became highly popular as a folk song.",
      "funFact": "The title means 'Where is my home?', referring to the beauty of the Czech landscape.",
      "lyrics": "Kde domov můj, kde domov můj?\nVoda hučí po lučinách,\nbory šumí po skalinách,\nv sadě skví se jara květ,\nzemský ráj to na pohled!",
      "translation": "Where is my home, where is my home?\nWater roars through the meadows,\npine trees rustle among the rocks,\nthe orchard is shimmering with spring flowers,\nearthly paradise to behold!"
    },
    "Denmark": {
      "anthem": "Der er et yndigt land", "native": "Der er et yndigt land", "id": "dk",
      "history": "Adopted in 1844. Denmark is one of the few countries with two official national anthems (the other is the Royal Anthem).",
      "funFact": "The title means 'There is a lovely country'.",
      "lyrics": "Der er et yndigt land,\ndet står with broad beeches\nnær salten østerstrand;\nDet bugter sig i bakke, dal,\ndet hedder gamle Danmark,\nog det er Frejas sal.",
      "translation": "There is a lovely land,\nit stands with broad beeches\nnear the salty eastern shore;\nIt winds in hill and valley,\nit is called old Denmark,\nand it is Freya's hall."
    },
    "Egypt": {
      "anthem": "Bilady, Bilady, Bilady", "native": "بلادي بلادي بلادي", "id": "eg",
      "history": "Written by Sayed Darwish in 1923. It is based on a famous speech by national leader Mustafa Kamil.",
      "funFact": "The chorus 'My country, my country, my country' is one of the most recognizable in the Arab world.",
      "lyrics": "بلادي بلادي بلادي\nلكِ حبي وفؤادي\nبلادي بلادي بلادي\nلكِ حبي وفؤادي",
      "translation": "My country, my country, my country\nMy love and my heart are for thee.\nMy country, my country, my country\nMy love and my heart are for thee."
    },
    "Estonia": {
      "anthem": "Mu isamaa, mu õnn ja rõõm", "native": "Mu isamaa, mu õnn ja rõõm", "id": "ee",
      "history": "Adopted in 1920. It was banned during the Soviet era but remained a symbol of resistance.",
      "funFact": "It uses the exact same melody as the national anthem of Finland, though the lyrics are different.",
      "lyrics": "Mu isamaa, mu õnn ja rõõm,\nkui kaunis oled sa!\nEi leia mina iial teal,\nsee suure, laia ilma peal,\nmis mul nii armas oleks ka,\nkui sa, mu isamaa!",
      "translation": "My native land, my joy and delight,\nHow fair thou art — how bright!\nFor nowhere in the world around,\nCan ever such a place be found,\nSo well beloved, from sense profound,\nMy native country dear!"
    },
    "Ethiopia": {
      "anthem": "Wodefit Gesgeshi, Widd Innat Ityoppya", "native": "ወደፊት ገስግሺ ውድ እናት ኢትዮጵያ", "id": "et",
      "history": "Adopted in 1992 after the fall of the Derg regime. Its lyrics emphasize unity and progress.",
      "funFact": "Ethiopia has changed its national anthem four times in the last century due to political shifts.",
      "lyrics": "የዜግነት ክብር በኢትዮጵያችን ጸንቶ፣\nታየ ሕዝባዊነት ዳር እስከዳር በርቶ።\nለሰላም፣ ለፍትህ، ለሕዝቦች ነጻነት፣\nበእኩልነት በፍቅር ቆመናል ባንድነት።",
      "translation": "Respect for citizenship is strong in our Ethiopia;\nNational pride is seen, shining from one side to another.\nFor peace, for justice, for the freedom of peoples,\nIn equality and in love we stand united."
    },
    "Finland": {
      "anthem": "Maamme", "native": "Maamme / Vårt land", "id": "fi",
      "history": "First performed in 1848. The lyrics were written by Johan Ludvig Runeberg, the national poet of Finland.",
      "funFact": "The anthem was originally written in Swedish, not Finnish.",
      "lyrics": "Oi maamme, Suomi, synnyinmaa!\nSoi, sana kultainen!\nEi laaksoa, ei kukkulaa,\nEi vettä, rantaa rakkaampaa,\nKuin kotimaa tää pohjoinen,\nMaa kallis isien!",
      "translation": "Our land, our land, our fatherland,\nSound loud, O name of worth!\nNo mount that meets the heaven's band,\nNo hidden vale, no wave-washed strand,\nIs loved, as is our native North,\nOur own forefathers' earth."
    },
    "France": {
      "anthem": "La Marseillaise", "native": "La Marseillaise", "id": "fr",
      "history": "Written in 1792 during the French Revolution as a marching song for volunteers.",
      "funFact": "It was the first 'people's anthem' and inspired revolutionary movements across the globe.",
      "lyrics": "Allons enfants de la Patrie,\nLe jour de gloire est arrivé !\nContre nous de la tyrannie,\nL'étendard sanglant est levé",
      "translation": "Arise, children of the Fatherland,\nThe day of glory has arrived!\nAgainst us, tyranny's\nBloody flag is raised"
    },
    "Georgia": {
      "anthem": "Tavisupleba", "native": "თავისუფლება", "id": "ge",
      "history": "Adopted in 2004 following the Rose Revolution. The music is a medley of Georgian opera.",
      "funFact": "The title means 'Freedom', reflecting Georgia's long struggle for sovereignty.",
      "lyrics": "ჩემი ხატია სამშობლო,\nსახატე მთელი ქვეყანა,\nგანათებული მთა-ბარი,\nწილნაყარია ღმერთთანა.\nთავისუფლება დღეს ჩვენი\nმომავალს უმღერს დიდებას,\nცისკრის ვარსკვლავი ამოდის\nდა ორ ზღვას შუა ბრწყინდება",
      "translation": "My icon is my motherland,\nAnd the whole world is its icon-stand.\nBright mounts and valleys\nAre shared with God.\nToday our freedom\nSings to the glory of the future,\nThe dawn star rises up\nAnd shines out between two seas."
    },
    "Germany": {
      "anthem": "Deutschlandlied", "native": "Das Lied der Deutschen", "id": "de",
      "history": "The melody was written by Joseph Haydn in 1797. Currently, only the third verse is sung.",
      "funFact": "The third verse emphasizes 'Unity and Justice and Freedom', which are the core values of modern Germany.",
      "lyrics": "Einigkeit und Recht und Freiheit\nFür das deutsche Vaterland!\nDanach lasst uns alle streben\nBrüderlich mit Herz und Hand!",
      "translation": "Unity and justice and freedom\nFor the German fatherland!\nLet us all strive for this\nBrotherly with heart and hand!"
    },
    "Greece": {
      "anthem": "Hymn to Liberty", "native": "Ύμνος εις την Ελευθερίαν", "id": "gr",
      "history": "Based on a 158-stanza poem written in 1823. It celebrates the Greek War of Independence.",
      "funFact": "It is the longest national anthem in the world by number of stanzas, though only the first two are officially sung.",
      "lyrics": "Σε γνωρίζω από την κόψη\nτου σπαθιού την τρομερή,\nσε γνωρίζω από την όψη\nπου με βιά μετράει τη γη.",
      "translation": "I recognize you by the edge\nof the sword's terrible fire,\nI recognize you by the look\nthat with violence measures the earth."
    },
    "Hungary": {
      "anthem": "Himnusz", "native": "Himnusz", "id": "hu",
      "history": "Written in 1823, it is unique among anthems because it is written as a prayer to God to bless the nation.",
      "funFact": "Because of its religious nature, it was often played without lyrics during the communist era.",
      "lyrics": "Isten, áldd meg a magyart\nJó kedvvel, bőséggel,\nNyújts feléje védő kart,\nHa küzd ellenséggel;\nBal sors akit régen tép,\nHozz rá víg esztendőt,\nMegbűnhődte már e nép\nA múltat s jövendőt!",
      "translation": "O God, bless the nation of Hungary\nWith your grace and bounty.\nExtend over it your guarding arm\nDuring strife with its enemies.\nLong torn by ill fate,\nBring upon it a time of relief.\nThis nation has suffered for all sins\nOf the past and of the future!"
    },
    "Iceland": {
      "anthem": "Lofsongur", "native": "Lofsöngur", "id": "is",
      "history": "Written in 1874 to commemorate 1,000 years of settlement on the island.",
      "funFact": "It is notoriously difficult to sing because of its very wide vocal range.",
      "lyrics": "Ó, guð vors lands! Ó, lands vors guð!\nVér lofum þitt heilaga, heilaga nafn!\nÚr sólkerfum himnanna hnýta þér krans\nþínir herskarar, tímanna safn.",
      "translation": "Our country's God! Our country's God!\nWe worship Thy name in its wonder sublime.\nThe suns of the heavens are brought to Thy rod,\nBy Thy legions, the ages of time!"
    },
    "India": {
      "anthem": "Jana Gana Mana", "native": "जन गण मन", "id": "in",
      "history": "Written by Nobel laureate Rabindranath Tagore in 1911. It was adopted as the anthem in 1950.",
      "funFact": "A formal rendition of the anthem takes exactly 52 seconds by tradition.",
      "lyrics": "जन-गण-मन अधिनायक जय हे\nभारत भाग्य विधाता\nपंजाब-सिंधु-गुजरात-मराठा\nद्राविड़-उत्कल-बंग",
      "translation": "Thou art the ruler of the minds of all people,\nDispenser of India's destiny.\nThy name rouses the hearts of Punjab, Sindh, Gujarat and Maratha;\nOf Dravida, Orissa and Bengal."
    },
    "Indonesia": {
      "anthem": "Indonesia Raya", "native": "Indonesia Raya", "id": "id",
      "history": "Introduced in 1928 at the Youth Pledge. It was a rallying cry for the independence movement.",
      "funFact": "The original 1928 performance was purely instrumental (on a violin) to avoid arrest by Dutch colonial authorities.",
      "lyrics": "Indonesia, tanah airku,\nTanah tumpah darahku,\nDi sanalah aku berdiri,\nJadi pandu ibuku.\n\nIndonesia Raya, merdeka, merdeka!\nTanahku, negeriku yang kucinta.",
      "translation": "Indonesia, my native land,\nMy place of birth,\nWhere I stand guard,\nOver my motherland.\n\nGreat Indonesia, independent and sovereign!\nThe land, the country I love."
    },
    "Iran": {
      "anthem": "Soroud-e Melli-ye Jomhouri-ye Eslami-ye Iran", "native": "سرود ملی جمهوری اسلامی ایران", "id": "ir",
      "history": "Adopted in 1990 to replace the previous anthem used after the 1979 Revolution.",
      "funFact": "It is one of the shortest national anthems in the world, lasting only about 58 seconds.",
      "lyrics": "سر زد از افق مهر خاوران\nجلوه ی باور دین ما\nآن زمان که خون پاکان\nدر ره حق شد فدا",
      "translation": "Upwards on the horizon rises the Eastern Sun\nThe light in the eyes of the believers in justice\nBahman is the zenith of our faith\nYour message, O Imam, of independence, freedom."
    },
    "Iraq": {
      "anthem": "Mawtini", "native": "موطني", "id": "iq",
      "history": "An old Palestinian poem that became popular across the Arab world. It was adopted by Iraq in 2004.",
      "funFact": "The title translates to 'My Homeland'. It replaced several previous anthems associated with the Ba'athist regime.",
      "lyrics": "موطني موطني\nالجلال والجمال\nوالسناء والبهاء\nفي رباك في رباك",
      "translation": "My homeland, my homeland\nSplendor and beauty\nLoftiness and brilliance\nAre in your hills, are in your hills"
    },
    "Ireland": {
      "anthem": "Amhrán na bhFiann", "native": "Amhrán na bhFiann", "id": "ie",
      "history": "Written in 1907. The title means 'The Soldier's Song'.",
      "funFact": "While originally written in English, it is almost exclusively sung in the Irish language today.",
      "lyrics": "Sinne Fianna Fáil,\natá faoi gheall ag Éirinn,\nBuíon dár slua\nthar toinn do ráinig chugainn,\nFaoi mhóid bheith saor\nSeantír ár sinsear feasta,\nNí fhágfar faoin tíorán ná faoin tráill.",
      "translation": "Soldiers are we,\nwhose lives are pledged to Ireland,\nSome have come\nfrom a land beyond the wave,\nSworn to be free,\nno more our ancient sireland,\nShall shelter the despot or the slave."
    },
    "Israel": {
      "anthem": "Hatikvah", "native": "הַתִּקְוָה", "id": "il",
      "history": "Written in 1878 by a Jewish poet from Galicia. The title means 'The Hope'.",
      "funFact": "The melody is based on a 17th-century Italian song called 'La Mantovana', which is also the basis for 'The Moldau'.",
      "lyrics": "כל עוד בלבב פנימה\nנפש יהודי הומיה,\nולפאתי מזרח קדימה,\nעין לציון צופיה.",
      "translation": "As long as deep within the heart,\nThe Jewish soul yearns,\nAnd forward to the East,\nTo Zion, an eye looks."
    },
    "Italy": {
      "anthem": "Il Canto degli Italiani", "native": "Il Canto degli Italiani", "id": "it",
      "history": "Known as 'Fratelli d'Italia', it was written in 1847 tijdens the struggle for Italian unification.",
      "funFact": "The author, Goffredo Mameli, was a revolutionary who died in battle at the age of 21.",
      "lyrics": "Fratelli d'Italia,\nl'Italia s'è desta,\ndell'elmo di Scipio\ns'è cinta la testa.",
      "translation": "Brothers of Italy,\nItaly has awakened,\nwith Scipio's helmet\nshe has girded her head."
    },
    "Jamaica": {
      "anthem": "Jamaica, Land We Love", "native": "Jamaica, Land We Love", "id": "jm",
      "history": "Adopted in 1962 upon independence. The lyrics were chosen through a national competition.",
      "funFact": "It is also written as a prayer, asking for God's guidance for the new nation.",
      "lyrics": "Eternal Father bless our land,\nGuard us with Thy Mighty Hand,\nKeep us free from evil powers,\nBe our light through countless hours.",
      "translation": "Eternal Father bless our land,\nGuard us with Thy Mighty Hand,\nKeep us free from evil powers,\nBe our light through countless hours."
    },
    "Japan": {
      "anthem": "Kimigayo", "native": "君が代", "id": "jp",
      "history": "The lyrics are based on a 10th-century poem, making it one of the oldest anthems in the world.",
      "funFact": "With only 32 characters, it has arguably the shortest lyrics of any national anthem.",
      "lyrics": "君が代は\n千代に八千代に\nさざれ石の\nいわおとなりて\nこけのむすまで",
      "translation": "May your reign,\nContinue for a thousand, eight thousand generations,\nUntil the pebbles\nGrow into boulders\nLush with moss."
    },
    "Jordan": {
      "anthem": "As-Salam al-Malaki al-Urduni", "native": "السلام الملكي الأردني", "id": "jo",
      "history": "Adopted in 1946. It is dedicated to the King of Jordan.",
      "funFact": "There is a very short version used for military salutes that lasts only a few seconds.",
      "lyrics": "عاش المليك، عاش المليك\nسامياً مقامهُ، خافقاتٍ في المعالي أعلامه\nيا مليك العرب لك من خير نبي\nشرف في النسب حدثت عنه بطون الكتب",
      "translation": "Long live the King! Long live the King!\nHis position is sublime, His banners waving in glory supreme.\nO king of Arabs, From the best prophet you have.\nThe honour of dynasty, Talked about in the depths of books!"
    },
    "Kazakhstan": {
      "anthem": "Meniń Qazaqstanym", "native": "Менің Қазақстаным", "id": "kz",
      "history": "Adopted in 2006. The lyrics were co-written by former President Nursultan Nazarbayev.",
      "funFact": "The previous anthem was banned in 2006 and replaced because it sounded too much like the Soviet-era melody.",
      "lyrics": "Алтын күн аспаны,\nАлтын дән даласы,\nЕрліктің дастаны,\nЕліме қарашы!",
      "translation": "Gold sun in the sky,\nGold grain on the steppe,\nTale of courage,\nLook at my people!"
    },
    "Kenya": {
      "anthem": "Ee Mungu Nguvu Yetu", "native": "Ee Mungu Nguvu Yetu", "id": "ke",
      "history": "Adopted in 1963. It was based on a traditional Pokomo lullaby.",
      "funFact": "It was one of the first national anthems to be specifically commissioned from a local music committee.",
      "lyrics": "Ee Mungu nguvu yetu\nIlete baraka kwetu\nHaki iwe ngao na mlinzi\nTutuke na undugu",
      "translation": "O God of all creation\nBless this our land and nation\nJustice be our shield and defender\nMay we dwell in unity"
    },
    "Kyrgyzstan": {
      "anthem": "Kyrgyz Respublikasynyn Mamlekettik Gimni", "native": "Кыргыз Республикасынын Мамлекеттик Гимни", "id": "kg",
      "history": "Adopted in 1992 following independence from the Soviet Union.",
      "funFact": "Until 2012, the anthem included a second verse that was removed because it was considered too difficult to translate correctly.",
      "lyrics": "Ак мөнүлүү аска-зоолор, талаалар,\nЭлибиздин жаны менен барабар.\nСансыз кылым алкагында сакталып,\nБиздин элди эркиндикке алып бараар.",
      "translation": "White-capped rocky cliffs and steppes\nAre as equal as our people's soul.\nPreserved within the circle of countless centuries,\nThey lead our people to freedom."
    },
    "Laos": {
      "anthem": "Pheng Xat Lao", "native": "ເພງຊາດລາວ", "id": "la",
      "history": "Adopted in 1947. The lyrics were changed in 1975 following the communist revolution.",
      "funFact": "The current version removes all references to the monarchy and emphasizes the people's power.",
      "lyrics": "ຊາດລາວຕັ້ງແຕ່ໃດມາ ລາວທຸກທົ່ວໜ້າເຊີដຊູຮັກແພງ\nໂຮມແຮງຮ່ວມຈິດຮ່ວມໃຈ ສამັກຄີກັນເປັນກຳລັງດຽວ",
      "translation": "For all time the Lao people have glorified their Fatherland,\nUnited in heart, spirit and vigour as one."
    },
    "Latvia": {
      "anthem": "Dievs, svētī Latviju!", "native": "Dievs, svētī Latviju!", "id": "lv",
      "history": "Written in 1873 by Baumaņu Kārlis. It was the first song to use the word 'Latvia'.",
      "funFact": "The title means 'God Bless Latvia!'.",
      "lyrics": "Dievs, svētī Latviju,\nMūsu dārgo tēviju,\nSvētī jel Latviju,\nAk, svētī jel to!\n\nKur latvju meitas zied,\nKur latvju dēli dzied,\nLaid mūs tur laimē dejot,\nMūsu Latvijā!",
      "translation": "God bless Latvia,\nOur beloved fatherland,\nBless Latvia,\nOh, bless it!\n\nWhere Latvian daughters bloom,\nWhere Latvian sons sing,\nLet us dance there in happiness,\nIn our Latvia!"
    },
    "Lichtenstein": {
      "anthem": "Oben am jungen Rhein", "native": "Oben am jungen Rhein", "id": "li",
      "history": "Adopted in 1850. It uses the exact same melody as the UK's 'God Save the King'.",
      "funFact": "During international football matches against the UK, the same melody is played twice for both teams.",
      "lyrics": "Oben am jungen Rhein\nLehnet sich Liechtenstein\nAn Alpenhöh'n.\nDies liebe Heimatland,\nDas teure Vaterland,\nHat Gottes Hand\nFür uns erseh'n.",
      "translation": "High on the young Rhine\nLiechtenstein leans\nOn Alpine heights.\nThis dear homeland,\nThis precious fatherland,\nGod's hand has\nChosen for us."
    },
    "Lithuania": {
      "anthem": "Tautiška giesmė", "native": "Tautiška giesmė", "id": "lt",
      "history": "Written in 1898. It was a symbol of the Lithuanian national revival against the Russian Empire.",
      "funFact": "Lithuanians around the world gather to sing the anthem together every year on July 6th.",
      "lyrics": "Lietuva, Tėvyne mūsų,\nTu didvyrių žeme,\nIš praeities Tavo sūnūs\nTe stiprybę semia.\n\nTegul Tavo vaikai eina\nVien takais dorybės,\nTegul dirba Tavo naudai\nIr žmonių gėrybei.",
      "translation": "Lithuania, our homeland,\nLand of heroes,\nMay your sons draw strength\nFrom the past.\n\nMay your children walk\nOnly on the paths of virtue,\nMay they work for your benefit\nAnd for the good of the people."
    },
    "Luxembourg": {
      "anthem": "Ons Heemecht", "native": "Ons Heemecht", "id": "lu",
      "history": "Written in 1859. It focuses on the peaceful nature and small size of the country.",
      "funFact": "The Grand Ducal family has a separate anthem used specifically for ceremonial entries.",
      "lyrics": "Wou d'Uelzecht durech d'Wisen zéit,\nduerch d'Fielsen d'Sauer brécht,\nWou d'Rief laanscht d'Musel dofteg bléit,\nden Himmel Wäin ons mécht.\n\nOns Heemechtsland, dat mir sou déif\nan onsen Hierzer dron.",
      "translation": "Where the Alzette flows through the meadows,\nThe Sura breaks through the crags,\nWhere the vine blooms fragrantly along the Moselle,\nHeaven gifts us wine.\n\nOur homeland, which we carry so deeply\nIn our hearts."
    },
    "Madagascar": {
      "anthem": "Ry Tanindrazanay malala ô!", "native": "Ry Tanindrazanay malala ô!", "id": "mg",
      "history": "Adopted in 1958. It is written in the Malagasy language and celebrates the island's beauty.",
      "funFact": "Madagascar's anthem is known for its European-style choral arrangement, reflecting colonial influence.",
      "lyrics": "Ry Tanindrazanay malala ô!\nRy Madagasikara soa.\nNy fitiavanay anao tsy miova,\nFa ho anao, ho anao doria.",
      "translation": "O, our beloved fatherland!\nO, beautiful Madagascar.\nOur love for you remains unchanged,\nFor you, for you forever."
    },
    "Malaysia": {
      "anthem": "Negaraku", "native": "نڬاراكو", "id": "my",
      "history": "Adopted in 1957. The melody was originally used as the state anthem of Perak.",
      "funFact": "The tune was derived from a popular French melody called 'La Rosalie', which was a hit in the 19th century.",
      "lyrics": "Negaraku,\nTanah tumpah darahku,\nRakyat hidup,\nBersatu dan maju.",
      "translation": "My country,\nThe land where my blood is shed,\nThe people living\nUnited and progressive."
    },
    "Maldives": {
      "anthem": "Gaumii Salaam", "native": "ގައުމީ سަލާމް", "id": "mv",
      "history": "Written in 1948. The lyrics were originally written to the tune of 'Auld Lang Syne' before new music was composed.",
      "funFact": "The current music was composed by a Sri Lankan maestro in 1972.",
      "lyrics": "ގައުމީ ސަލާމް ކުރަމުން ތިބާ،\nގައުމީ އުންމީދު ކުރަމުން ތިބާ.",
      "translation": "We salute you in national greeting,\nWe salute you in national hope."
    },
    "Malta": {
      "anthem": "L-Innu Malti", "native": "L-Innu Malti", "id": "mt",
      "history": "Written in 1922 in the form of a hymn. It was officially recognized as the anthem in 1964.",
      "funFact": "The lyrics are a prayer for Malta to be granted health, wisdom, and peace.",
      "lyrics": "Lil din l-art ħelwa, l-Omm li tatna isimha,\nĦares, Mulej, kif dejjem Int ħarist:\nInselmulek, o l-art li aħna nħobbu,\nO l-art li aħna nħobbu, Malta tagħna!",
      "translation": "To this fair land, the Mother that gave us her name,\nWatch over her, O Lord, as You have always watched over her:\nWe salute you, O land that we love,\nO land that we love, our Malta!"
    },
    "Mexico": {
      "anthem": "Himno Nacional Mexicano", "native": "Himno Nacional Mexicano", "id": "mx",
      "history": "Adopted in 1854. The lyrics were written by a poet whose fiancée locked him in a room until he finished them.",
      "funFact": "Mexico has strict laws regulating the performance of the anthem; it must always be sung with extreme respect.",
      "lyrics": "Mexicanos, al grito de guerra\nel acero aprestad y el bridón.\nY retiemble en sus centros la tierra,\nal sonoro rugir del cañón.",
      "translation": "Mexicans, at the cry of war,\nmake ready the steel and the bridle,\nand may the earth tremble at its centers\nat the resounding roar of the cannon."
    },
    "Moldova": {
      "anthem": "Limba noastră", "native": "Limba noastră", "id": "md",
      "history": "Adopted in 1994. The title means 'Our Language', which is a major point of national identity.",
      "funFact": "Previously, Moldova used the same national anthem as Romania ('Deșteaptă-te, române!').",
      "lyrics": "Limba noastră-i o comoară\nÎn adâncuri înfundată\nUn şirag de piatră rară\nPe moşie revărsată.",
      "translation": "Our language is a treasure\nFrom the depths arising\nA string of rare stones\nScattered over our estate."
    },
    "Mongolia": {
      "anthem": "Mongol Ulsyn töriin duulal", "native": "Монгол Уลсын төрийн дууላл", "id": "mn",
      "history": "Adopted in 1950. The lyrics were revised in 2006 to remove praise for communist leaders.",
      "funFact": "The anthem's lyrics celebrate the 'cradle of the sun' and the horses of the steppe.",
      "lyrics": "Дархан манай тусгаар улс\nДаяар монголын ариун голомт\nДалай საնის дээдлэн шүтэж\nДандаа энхжин мөнхөժнө.",
      "translation": "Our sacred independent state\nIs the ancestral heart of all Mongols,\nAll world's good deeds,\nAlways celebrate, always continue."
    },
    "Morocco": {
      "anthem": "Hymne Chérifien", "native": "النشيد الشريف", "id": "ma",
      "history": "The music was composed during the French Protectorate; the lyrics weren't added until 1970.",
      "funFact": "The lyrics were written by Ali Squalli Houssaini, who also wrote the anthem of Oman.",
      "lyrics": "منبت الأحرار مشرق الأنوار\nمنتدى السؤدد وحماه\nدمت منتداه وحماه\nعشت في الأوطان للعلى عنوان",
      "translation": "Fountain of freedom, Source of light,\nWhere sovereignty and safety meet,\nSafety and sovereignty may you ever combine!\nYou have lived among nations With title sublime."
    },
    "Myanmar": {
      "anthem": "Kaba Ma Kyei", "native": "ကမ္ဘာမကျေ", "id": "mm",
      "history": "Adopted in 1948. It is unusual because the first half is a traditional Burmese song and the second half is Western-style.",
      "funFact": "The title translates to 'Till the End of the World'.",
      "lyrics": "ကမ္ဘာမကျေ မြန်မာပြည်\nတို့ဘိုးဘွား အမွေစစ်မို့\nချစ်မြတ်နိုးပေ",
      "translation": "Until the world ends, we love Myanmar,\nIt is the true heritage of our ancestors,\nWe love and cherish it."
    },
    "Nepal": {
      "anthem": "Sayaun Thunga Phool Ka", "native": "सयौँ थुँगा फूलका", "id": "np",
      "history": "Adopted in 2007 after the abolition of the monarchy. It celebrates the diversity of Nepal.",
      "funFact": "The lyrics list various floral and ethnic symbols representing the many groups in Nepal.",
      "lyrics": "सयौं थुँगा फूलका हामी, एउटै माला नेपाली,\nसार्वभौម भई फैलिएका, मेची-महाकाली।",
      "translation": "We are hundreds of flowers, the one garland – Nepali,\nSovereign, spread out from Mechi to Mahakali."
    },
    "Netherlands": {
      "anthem": "Wilhelmus", "native": "Wilhelmus", "id": "nl",
      "history": "Written between 1568 and 1572, it is considered the oldest national anthem in the world.",
      "funFact": "It is an acrostic: the first letters of the 15 stanzas spell out the name 'Willem van Nassov'.",
      "lyrics": "Wilhelmus van Nassouwe\nben ik, van Duitsen bloed,\nden vaderland getrouwe\nblijf ik tot in den dood.",
      "translation": "William of Nassau\nam I, of German blood,\nloyal to the fatherland\nI remain until death."
    },
    "New Zealand": {
      "anthem": "God Defend New Zealand", "native": "Aotearoa / God Defend New Zealand", "id": "nz",
      "history": "Written in the 1870s. Since 1977, it has equal status with 'God Save the King'.",
      "funFact": "It is traditionally performed by singing the first verse in Māori and then the first verse in English.",
      "lyrics": "E Ihowā Atua,\nO ngā iwi mātou rā\nĀta whakarangona;\nMe aroha noa.",
      "translation": "God of Nations at Thy feet,\nIn the bonds of love we meet,\nHear our voices, we entreat,\nGod defend our free land."
    },
    "Nicaragua": {
      "anthem": "Salve a ti, Nicaragua", "native": "Salve a ti, Nicaragua", "id": "ni",
      "history": "Adopted in 1918. It is one of the few national anthems that does not mention war or fighting.",
      "funFact": "The music is based on an old Spanish liturgical chant.",
      "lyrics": "¡Salve a ti, Nicaragua! En tu suelo\nya no ruge la voz del cañón,\nni se tiñe con sangre de hermanos\ntu glorioso pendón bicolor.",
      "translation": "Hail to thee, Nicaragua! On thy soil\nthe voice of the cannon no longer roars,\nnor is the blood of brothers staining\nthy glorious bicolor banner."
    },
    "Nigeria": {
      "anthem": "Arise, O Compatriots", "native": "Arise, O Compatriots", "id": "ng",
      "history": "Adopted in 1978. The lyrics are a combination of several entries from a national competition.",
      "funFact": "In 2024, Nigeria readopted its original independence anthem, 'Nigeria, We Hail Thee'.",
      "lyrics": "Arise, O compatriots,\nNigeria's call obey\nTo serve our fatherland\nWith love and strength and faith.",
      "translation": "Arise, O compatriots,\nNigeria's call obey\nTo serve our fatherland\nWith love and strength and faith."
    },
    "North Korea": {
      "anthem": "Aegukka", "native": "애국가", "id": "kp",
      "history": "Written in 1947. The name means 'Patriotic Song', identical to the name of South Korea's anthem.",
      "funFact": "The anthem focuses on the natural beauty of the Korean peninsula and the 'three-thousand-ri' land.",
      "lyrics": "아침은 빛나라 이 강산 은금에\n자원도 가득한 삼천리 아름다운 내 조국\n반만년 오랜 력사에 찬란한 문화로\n자라난 슬기론 인민의 이 영광",
      "translation": "Let morning shine on the silver and gold of this land,\nthree thousand leagues packed with natural wealth, My beautiful fatherland.\nThe glory of a wise people brought up in a culture brilliant with a history\nfive millennia long, this glory."
    },
    "Norway": {
      "anthem": "Ja, vi elsker dette landet", "native": "Ja, vi elsker dette landet", "id": "no",
      "history": "Written by national poet Bjørnstjerne Bjørnson in 1859. It is a humble tribute to the land and its people.",
      "funFact": "Although used for 150 years, it was only officially made the de jure anthem in 2019.",
      "lyrics": "Ja, vi elsker dette landet,\nsom det stiger frem,\nfuret, værbitt over vannet,\nmed de tusen hjem.\n\nElsker, elsker det og tenker\npå vår far og mor\nog den saganatt som senker\ndrømmer på vår jord.",
      "translation": "Yes, we love this country\nas it rises forth,\nrugged, weathered, over the water,\nwith the thousand homes.\n\nLove it, love it and think\nof our father and mother\nand the saga night that lays\ndreams upon our earth."
    },
    "Pakistan": {
      "anthem": "Qaumi Taranah", "native": "قومی ترانہ", "id": "pk",
      "history": "Adopted in 1954. The lyrics are written in a highly Persianized form of Urdu.",
      "funFact": "The entire anthem contains only one common Urdu word ('ka'); the rest is shared with Persian vocabulary.",
      "lyrics": "پاک سرزمین شاد باد\nکشور حسین شاد باد\nتو نشان عزم عالی شان\nارض پاکستان",
      "translation": "Blessed be the sacred land,\nHappy be the bounteous realm,\nSymbol of high resolve,\nLand of Pakistan!"
    },
    "Panama": {
      "anthem": "Himno Istmeño", "native": "Himno Istmeño", "id": "pa",
      "history": "Originally written in 1897 as a school song. It became the national anthem upon independence from Colombia.",
      "funFact": "The music was composed by a Spanish musician who was living in Panama.",
      "lyrics": "Alcanzamos por fin la victoria\nEn el campo feliz de la unión;\nCon ardientes fulgores de gloria\n¡Se ilumina la nueva nación!",
      "translation": "At last we reached victory\nIn the joyous field of the union;\nWith ardent fires of glory\nA new nation shines bright!"
    },
    "Paraguay": {
      "anthem": "Himno Nacional Paraguayo", "native": "Tetã purahéi Paraguáy", "id": "py",
      "history": "Written in 1846. It is known for its very long and elaborate introduction.",
      "funFact": "Like many Latin American anthems, it is a 'march-anthem' influenced by 19th-century Italian opera.",
      "lyrics": "Paraguayos, ¡República o Muerte!\nnuestro brío nos dio libertad;\nni opresores, ni siervos alientan\ndonde reina unión e igualdad.",
      "translation": "Paraguayans, Republic or Death!\nOur spirit gave us liberty;\nNeither oppressors nor servants breathe\nWhere union and equality reign."
    },
    "Peru": {
      "anthem": "Himno Nacional del Perú", "native": "Himno Nacional del Perú", "id": "pe",
      "history": "Chosen in a competition held by General José de San Martín in 1821.",
      "funFact": "For decades, Peruvians sang a 'fake' extra verse that was actually a popular folk addition before it was removed.",
      "lyrics": "Somos libres, seámoslo siempre,\ny antes niegue sus luces el sol,\nque faltemos al voto solemne\nque la patria al Eterno elevó.",
      "translation": "We are free, let us remain so forever,\nAnd let the sun rather deny its light\nThan that we should fail on the solemn vow\nWhich our fatherland raised to the Eternal."
    },
    "Philippines": {
      "anthem": "Lupang Hinirang", "native": "Lupang Hinirang", "id": "ph",
      "history": "Originally an instrumental march for the 1898 Declaration of Independence. Lyrics were added later.",
      "funFact": "The law requires the anthem to be performed in the Tagalog language; singing it in English is technically illegal.",
      "lyrics": "Bayang magiliw,\nPerlas ng Silanganan,\nAlab ng puso,\nSa dibdib mo'y buhay.\n\nLupang hinirang,\nDuyan ka ng magiting,\nSa manlulupig,\n'Di ka pasisiil.",
      "translation": "Chosen land,\nPearl of the Orient,\nFire of the heart,\nIs alive in your chest.\n\nLand that is chosen,\nYou are the cradle of the brave,\nTo the conquerors,\nYou shall never be surrendered."
    },
    "Poland": {
      "anthem": "Mazurek Dąbrowskiego", "native": "Mazurek Dąbrowskiego", "id": "pl",
      "history": "Written in 1797 for the Polish Legions in Italy. It is a song of hope during the partition era.",
      "funFact": "The lyrics 'Poland is not yet lost' inspired many other Slavic national anthems.",
      "lyrics": "Jeszcze Polska nie zginęła,\nKiedy my żyjemy.\nCo nam obca przemoc wzięła,\nSzablą odbierzemy.",
      "translation": "Poland has not yet perished,\nSo long as we still live.\nThat which foreign force has seized from us,\nWe shall retrieve with the saber."
    },
    "Portugal": {
      "anthem": "A Portuguesa", "native": "A Portuguesa", "id": "pt",
      "history": "Originally a republican protest song. It was adopted as the national anthem in 1911.",
      "funFact": "One line was changed from 'Against the Britons' to 'Against the cannons' to avoid insulting their oldest ally.",
      "lyrics": "Heróis do mar, nobre povo,\nNação valente, imortal,\nLevantai hoje de novo\nO esplendor de Portugal!",
      "translation": "Heroes of the sea, noble people,\nBrave and immortal nation,\nRaise today once more\nThe splendor of Portugal!"
    },
    "Qatar": {
      "anthem": "As-Salam al-Amiri", "native": "السلام الأميري", "id": "qa",
      "history": "Adopted in 1996 following the accession of Sheikh Hamad bin Khalifa Al Thani.",
      "funFact": "The music was composed by a Qatari musician who was a graduate of the Egyptian military music school.",
      "lyrics": "قسماً بمن رفع السماء\nقسماً بمن نشر الضياء\nقطر ستبقى حرة\nتسمو بروح الأوفياء",
      "translation": "I swear by God who raised the sky,\nI swear by God who spread the light,\nQatar will always be free,\nElevated by the spirits of the loyal."
    },
    "Romania": {
      "anthem": "Deșteaptă-te, romäne!", "native": "Deșteaptă-te, romäne!", "id": "ro",
      "history": "Written during the 1848 Revolution. The title translates to 'Awaken, Romanian!'.",
      "funFact": "It was used as the national anthem of Moldova for a short period after their independence.",
      "lyrics": "Deșteaptă-te, române, din somnul cel de moarte,\nÎn care te-adânciră barbarii de tirani!\nAcum ori niciodată croiește-ți altă soarte,\nLa care să se-nchine și cruzii tăi dușmani!",
      "translation": "Awaken, Romanian, from your sleep of death,\nInto which you have been sunk by the barbaric tyrants!\nNow, or never, make a new fate for yourself,\nTo which even your cruel enemies will bow!"
    },
    "Russian Federation": {
      "anthem": "Gosudarstvenny Gimn Rossiyskoy Federatsii", "native": "Государственный гимн Российской Федерации", "id": "ru",
      "history": "Adopted in 2000, it uses the Soviet-era melody with completely new lyrics.",
      "funFact": "Sergey Mikhalkov wrote the lyrics for three different versions of the anthem (1944, 1977, and 2000).",
      "lyrics": "Россия — священная наша держава,\nРоссия — любимая наша страна.\nМогучая воля, великая слава —\nТвоё достоянье на все времена!",
      "translation": "Russia is our sacred state,\nRussia is our beloved country.\nA mighty will, great glory —\nYour dignity for all time!"
    },
    "Saudi Arabia": {
      "anthem": "As-Salam Al-Malaki", "native": "السلام الملكي", "id": "sa",
      "history": "The music was a gift from Egypt in 1947. Lyrics were not added until 1984.",
      "funFact": "The lyrics simply praise God and ask for long life for the King.",
      "lyrics": "سارعي للمجد والعلياء\nمجدي لخالق السماء\nوارفعي الخفاق أخضر\nيحمل النور المسطر",
      "translation": "Hasten to glory and supremacy,\nGlorify the Creator of the heavens!\nAnd raise the green flag,\nCarrying the written light reflecting guidance."
    },
    "Serbia": {
      "anthem": "Bože pravde", "native": "Боже правде", "id": "rs",
      "history": "The title means 'God of Justice'. It was originally used in a theatrical play in 1872.",
      "funFact": "The lyrics were changed from 'Serbian King' to 'Serbian lands' when Serbia became a republic.",
      "lyrics": "Боже правде, ти што спасе\nод пропасти досад нас,\nчуј и од сад наше гласе\nи од сад нам буди спас.",
      "translation": "God of Justice; Thou who saved us\nFrom destruction until now,\nHear Thy Serbian children's voices,\nAnd be our help from now on."
    },
    "Slovakia": {
      "anthem": "Nad Tatrou sa blíska", "native": "Nad Tatrou sa blíska", "id": "sk",
      "history": "Written in 1844 by students protesting the arrest of their teacher. The title means 'Lightning over the Tatras'.",
      "funFact": "It was previously the second half of the national anthem of Czechoslovakia.",
      "lyrics": "Nad Tatrou sa blýska,\nhromy divo bijú.\nZastavme ich, bratia,\nveď sa ony stratia,\nSlováci ožijú.",
      "translation": "There is lightning over the Tatras,\nThunders loudly sound.\nLet us stop them, brothers,\nAfter all they will disappear,\nThe Slovaks will revive."
    },
    "Slovenia": {
      "anthem": "Zdravljica", "native": "Zdravljica", "id": "si",
      "history": "Based on a poem by France Prešeren. It is a rare 'toast' anthem that calls for international peace.",
      "funFact": "The poem is a 'carmina figurata'—each stanza is shaped like a wine chalice.",
      "lyrics": "Žive naj vsi naródi,\nki hrepené dočakat' dan,\nda koder sonce hodi,\nprepir iz svéta bo pregnan.",
      "translation": "God's blessing on all nations,\nWho long and work for that bright day,\nWhen o'er earth's habitations\nNo war, no strife shall hold its sway."
    },
    "South Africa": {
      "anthem": "National Anthem of South Africa", "native": "National Anthem of South Africa", "id": "za",
      "history": "A hybrid anthem formed in 1997 by combining two different songs in five rÃ³Å¼nych languages.",
      "funFact": "It is often cited as one of the most musically beautiful national anthems due to its complex harmonies.",
      "lyrics": "Nkosi Sikelel' iAfrika\nMaluphakanyisw' uphondo lwayo,\nYizwa imithandazo yethu,\nNkosi sikelela, thina lusapho lwayo.",
      "translation": "God bless Africa,\nMay her glory be lifted high,\nHear our petitions,\nGod bless us, Your children."
    },
    "South Korea": {
      "anthem": "Aegukga", "native": "애국가", "id": "kr",
      "history": "Written in the late 19th century. The current music was composed in 1935 to replace a Scottish folk tune.",
      "funFact": "Before 1935, the anthem was often sung to the tune of 'Auld Lang Syne'.",
      "lyrics": "동해 물과 백두산이 마르고 닳도록\n하느님이 보우하사 우리나라 만세.\n무궁화 삼천리 화려 강산\n대한 사람, 대한으로 길이 보전하세.",
      "translation": "Until that day when Mt. Baekdu is worn away and the East Sea's waters run dry,\nMay God protect and preserve our nation.\nHibiscus and three thousand li of splendid mountains and rivers;\nO people of Korea, stay true to the Korean way!"
    },
    "Spain": {
      "anthem": "Marcha Real", "native": "Marcha Real", "id": "es",
      "history": "One of the oldest anthems in the world, it was originally a military march for the Spanish Infantry.",
      "funFact": "It is one of only a few national anthems in the world that has no official lyrics.",
      "lyrics": "[Instrumental Only]",
      "translation": "Spain's national anthem, the 'Marcha Real', is one of the few national anthems in the world with no official lyrics. While various words have been written for it in the past, none are currently official."
    },
    "Sri Lanka": {
      "anthem": "Sri Lanka Matha", "native": "ශ්‍රී ලංකා මාතා / ශ්‍රී ලංකා මාතා", "id": "lk",
      "history": "Adopted in 1951. It was written in Sinhala, but a Tamil translation is also widely used.",
      "funFact": "The song is a tribute to the beauty and heritage of the 'Mother Sri Lanka'.",
      "lyrics": "ශ්‍රී ලංකා මාතා\nඅප ශ්‍රී ලංකා\nනමෝ නමෝ නමෝ නමෝ මාතා\nසුන්දර සිරිබරිණී",
      "translation": "Mother Sri Lanka\nOur Sri Lanka\nWe salute You Mother\nBeautiful with prosperity"
    },
    "Sweden": {
      "anthem": "Du gamla, du fria", "native": "Du gamla, du fria", "id": "se",
      "history": "Written in 1844. It is based on a traditional folk melody from the province of VÃ¤stmanland.",
      "funFact": "Like Norway and Denmark, it has no official legal status as an anthem but is used by long-standing tradition.",
      "lyrics": "Du gamla, Du fria, Du fjällhöga nord\nDu tysta, Du glädjerika sköna!\nJag hälsar Dig, vänaste land uppå jord,\nDin sol, Din himmel, Dina ängder gröna.",
      "translation": "Thou ancient, thou free, thou mountainous North,\nThou quiet, thou joyful and fair!\nI greet thee, most beautiful land upon earth,\nThy sun, thy sky, thy meadows green."
    },
    "Switzerland": {
      "anthem": "Swiss Psalm", "native": "Swiss Psalm", "id": "ch",
      "history": "Adopted in 1981, it had been used unofficially for over 100 years prior.",
      "funFact": "There are four official versions of the lyrics in German, French, Italian, and Romansh.",
      "lyrics": "Trittst im Morgenrot daher,\nSeh' ich dich im Strahlenmeer,\nDich, du Hocherhabener, Herrlicher!",
      "translation": "When the morning skies grow red,\nAnd o'er us their radiance shed,\nThou, O Lord, appeareth in their light."
    },
    "Syria": {
      "anthem": "HumÄt ad-DiyÄr", "native": "حماة الديار", "id": "sy",
      "history": "Adopted in 1936. The title means 'Guardians of the Homeland'.",
      "funFact": "The music was composed by a famous Lebanese musician who also worked on many Egyptian patriotic songs.",
      "lyrics": "حماة الديار عليكم سلام\nأبت أن تذل النفوس الكرام\nعرين العروبة بيت حرام\nوعرش الشموس حماه الحمام",
      "translation": "Guardians of the Homeland, upon you be peace\nOur proud spirits refuse to be dishonoured\nIn the den of Arabism, we build a sacred home\nThe throne of the suns, protected from death."
    },
    "Tajikistan": {
      "anthem": "Surudi Milli", "native": "Суруди Миллӣ", "id": "tj",
      "history": "Adopted in 1991. The music is the same as the Tajik Soviet Socialist Republic anthem.",
      "funFact": "The lyrics celebrate the 'sun of our happiness' and the freedom of the Tajik people.",
      "lyrics": "Суруди миллии мо\nАз хоки поки мо\nБа сӯи нури мо\nБадихи нури мо",
      "translation": "Our national anthem\nFrom our pure soil\nTowards our light\nDirects our light"
    },
    "Thailand": {
      "anthem": "Phleng Chat Thai", "native": "เพลงชาติไทย", "id": "th",
      "history": "Adopted in 1939. By decree, the anthem is played every day at 8:00 AM and 6:00 PM.",
      "funFact": "Thai law requires everyone in public spaces to stand up when the national anthem is played.",
      "lyrics": "ประเทศไทยรวมเลือดเนื้อชาติเชื้อไทย\nเป็นประชารัฐ ผไทของไทยทุกส่วน\nอยู่ดำรงคงไว้ได้ทั้งมวล",
      "translation": "Thailand unites the flesh and blood of Thais.\nThe land of Thailand belongs to the Thais.\nIt has long maintained its sovereignty."
    },
    "Tonga": {
      "anthem": "Ko e fasi Ãʻo e tuʻi Ãʻo e Ã–tu Tonga", "native": "Ko e fasi ʻo e tuʻi ʻo e ʻOtu Tonga", "id": "to",
      "history": "Adopted in 1874. The music was composed by a German missionary.",
      "funFact": "The title translates to 'The Song of the King of the Tonga Islands'.",
      "lyrics": "ʻE ʻotua māfimafi\nko homau ʻeiki koe\nko koe ko e falalaʻanga\nmo e ʻofa ki Tonga.",
      "translation": "Oh, almighty God!\nYou are our Lord,\nIt is You, the pillar\nAnd the love to Tonga."
    },
    "Tunisia": {
      "anthem": "Humat al-Hima", "native": "حماة الحمى", "id": "tn",
      "history": "Written in the 1930s. It became the national anthem in 1987 after a regime change.",
      "funFact": "The final verses were written by the famous poet Aboul-Qacem Echebbi, a icon of Tunisian literature.",
      "lyrics": "حماة الحمى يا حماة الحمى\nهلموا هلموا لمجد الزمن\nلقد صرخت في عروقنا الدماء\nنموت نموت ويحيا الوطن",
      "translation": "O defenders of the Homeland!\nRally around to the glory of our time!\nThe blood surges in our veins,\nWe die for the sake of our land."
    },
    "Turkey": {
      "anthem": "İstiklâl Marşı", "native": "İstiklâl Marşı", "id": "tr",
      "history": "Adopted in 1921. It is a tribute to the soldiers of the Turkish War of Independence.",
      "funFact": "The poet refused to take the prize money for writing the anthem, donating it to a women's charity instead.",
      "lyrics": "Korkma, sönmez bu şafaklarda yüzen al sancak;\nSönmeden yurdumun üstünde tüten en son ocak.\nO benim milletimin yıldızıdır, parlayacak;\nO benimdir, o benim milletimindir ancak.",
      "translation": "Fear not! For the crimson banner that proudly flies in this dawn shall never fade,\nBefore the last hearth that is ablaze within my nation is extinguished.\nFor it is the star of my nation, and it shall forever shine;\nIt is mine, and it belongs solely to my nation."
    },
    "Turkmenistan": {
      "anthem": "Garaşsyz, Bitarap Türkmenistanyň Döwlet Gimni", "native": "Garaşsyz, Bitarap Türkmenistanyň Döwlet Gimni", "id": "tm",
      "history": "Adopted in 1996 and revised in 2008 to remove references to the former president-for-life.",
      "funFact": "The anthem is traditionally played at a very high tempo, giving it an energetic feel.",
      "lyrics": "Janym gurban saňa, erkana ýurdum\nMert pederleň ruhy bardyr köňülde\nBitarap, Garaşsyz topragyň nurdur",
      "translation": "I am ready to give my life for you, my land.\nOur brave forefathers have a spirit in their heart,\nThat is the light of a neutral, independent land."
    },
    "Ukraine": {
      "anthem": "Shche ne vmerla Ukrainy i slava, i volia", "native": "Ще не вмерла України і слава, і воля", "id": "ua",
      "history": "Written in 1862. It served as the anthem of the short-lived republic in 1917 and was restored in 1992.",
      "funFact": "The lyrics have become a global symbol of resistance since the 2022 invasion.",
      "lyrics": "Ще не вмерла України ні слава, ні воля,\nЩе нам, браття молодії, усміхнеться доля.\nЗгинуть наші воріженьки, як роса на сонці.",
      "translation": "The glory and will of Ukraine has not yet perished,\nAnd yet still upon us, brothers, fate shall smile once more.\nOur enemies shall melt away, like the dew in the sun."
    },
    "United Arab Emirates": {
      "anthem": "Ishy Biladi", "native": "عيشي بلادي", "id": "ae",
      "history": "Adopted in 1971. The lyrics were only added in 1986.",
      "funFact": "The title translates to 'Long Live My Country', and the song is often performed with traditional Emirati drumming.",
      "lyrics": "عيشي بلادي عاش اتحاد إماراتنا\nعشت لشعب دينه الإسلام هديه القرآن\nحصنتك باسم الله يا وطن",
      "translation": "Long live my country, the unity of our Emirates lives.\nYou have lived for a nation whose religion is Islam and guide is the Quran.\nI made you stronger in God's name—oh, homeland!"
    },
    "United Kingdom": {
      "anthem": "God Save the King", "native": "God Save the King", "id": "gb",
      "history": "First performed in 1745. It is the oldest 'God Save' style anthem in the world.",
      "funFact": "It is the only anthem in the world whose lyrics automatically change depending on the gender of the monarch.",
      "lyrics": "God save our gracious King,\nLong live our noble King,\nGod save the King!",
      "translation": "God save our gracious King,\nLong live our noble King,\nGod save the King!"
    },
    "United States": {
      "anthem": "The Star-Spangled Banner", "native": "The Star-Spangled Banner", "id": "us",
      "history": "Written by Francis Scott Key in 1814 after witnessing the bombardment of Fort McHenry.",
      "funFact": "The melody is actually an old English drinking song called 'To Anacreon in Heaven'.",
      "lyrics": "O say, can you see, by the dawn's early light,\nWhat so proudly we hailed at the twilight's last gleaming?\nWhose broad stripes and bright stars through the perilous fight,\nO'er the ramparts we watched, were so gallantly streaming?",
      "translation": "O say, can you see, by the dawn's early light,\nWhat so proudly we hailed at the twilight's last gleaming?\nWhose broad stripes and bright stars through the perilous fight,\nO'er the ramparts we watched, were so gallantly streaming?"
    },
    "Uruguay": {
      "anthem": "Himno Nacional de Uruguay", "native": "Himno Nacional de Uruguay", "id": "uy",
      "history": "Adopted in 1833. It is one of the longest national anthems in the world (with 11 verses).",
      "funFact": "The music was composed by a friend of the famous opera composer Gaetano Donizetti.",
      "lyrics": "¡Orientales, la Patria o la tumba!\n¡Libertad o con gloria morir!\nEs el voto que el alma pronuncia,\ny que heroicos sabremos cumplir.",
      "translation": "Orientals, the Fatherland or the tomb!\nLiberty or with glory die!\nIt is the vow that the soul pronounces,\nAnd that heroically we shall know how to fulfill."
    },
    "Uzbekistan": {
      "anthem": "Oʻzbekiston Respublikasining Davlat Madhiyasi", "native": "Ўзбекистон Республикасининг давлат мадҳияси", "id": "uz",
      "history": "Adopted in 1992. It retains the melody of the Uzbek Soviet Socialist Republic.",
      "funFact": "The lyrics celebrate the 'golden valley' and the spirit of the Central Asian landscape.",
      "lyrics": "Serquyosh hur o'lkam, elga baxt, najot,\nSen o'zing do'stlarga yo'ldosh, mehribon!",
      "translation": "My sunny, free land, happiness and salvation to the people,\nYou are a companion and kind to friends!"
    },
    "Vietnam": {
      "anthem": "Tiến Quân Ca", "native": "Tiến Quân Ca", "id": "vn",
      "history": "Written in 1944. It was adopted as the anthem of the North in 1945 and for the unified country in 1976.",
      "funFact": "The composer, Văn Cao, donated the rights to the song to the Vietnamese government for free.",
      "lyrics": "Đoàn quân Việt Nam đi\nChung lòng cứu quốc\nBước chân dồn vang trên đường gập ghềnh xa",
      "translation": "Soldiers of Vietnam, march on\nUnited in saving the nation\nOur footsteps resound on the long, arduous road"
    }
  };

  const STUDY_MAP = {};
  Object.keys(STUDY_DATA).forEach(k => { STUDY_MAP[normalize(k)] = STUDY_DATA[k]; });

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
    paths.forEach(p => { p.style.fill = ''; p.classList.add('selected'); }); gs.selectedPaths = paths; gs.selectedCountry = name; countryNameEl.textContent = name; selectedHint.innerHTML = `<span class="dot"></span>${name} selected`; guessBtn.disabled = false;
  }

  function stopAudio() { if (gs.audio) { gs.audio.pause(); gs.audio.src = ''; gs.audio = null; } waveform.className = 'waveform idle'; audioStatus.textContent = 'Stopped'; }

  const AUDIO_FIX = { 'Brunei': 'Burnei', 'Uruguay': 'Urguay' };

  function playAudio(name) { 
    stopAudio(); 
    const fileName = AUDIO_FIX[name] || name;
    const audio = new Audio(`anthem_data/${fileName}.m4a`); 
    audio.volume = gs.volume; gs.audio = audio; audioStatus.textContent = 'Playing…'; waveform.className = 'waveform playing'; audio.play().catch(() => { audioStatus.textContent = 'Audio error'; }); audio.addEventListener('ended', () => { waveform.className = 'waveform idle'; audioStatus.textContent = 'Finished — make your pick!'; }); 
  }

  function updateHUD() { 
    const max = Math.min(gs.totalRounds, gs.filteredPool.length);
    hudRound.textContent = gs.round + '/' + max; 
    hudScore.textContent = gs.correct; statCorrect.textContent = gs.correct; statWrong.textContent = gs.wrong; progressBar.style.width = (gs.round / max * 100) + '%'; 
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
        const diffMatch = meta.d === gs.difficulty;
        return regionMatch && diffMatch;
      });
    }
    if (gs.filteredPool.length === 0) { alert("No countries found for this difficulty/region combo! Try a different setting."); return; }
    clearSelection(); overlay.classList.add('hidden'); setTimeout(startRound, 300);
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

  /* ── Study Mode Functions ── */
  function renderCountryList(filter = '') {
    countryList.innerHTML = '';
    const sorted = Object.keys(isoMap).sort();
    const nf = normalize(filter);
    sorted.forEach(name => {
      const info = STUDY_MAP[normalize(name)] || {};
      const anthem = info.anthem || '';
      const native = info.native || '';
      const iso = info.id || (isoMap[name] ? isoMap[name].toLowerCase() : 'un');
      if (filter && !normalize(name).includes(nf) && !normalize(anthem).includes(nf) && !normalize(native).includes(nf)) return;
      const item = document.createElement('div');
      item.className = 'country-item';
      item.innerHTML = `<img src="https://flagcdn.com/w80/${iso.toLowerCase()}.png" alt="flag"><div class="country-info"><span class="c-name">${name}</span>${anthem ? `<span class="c-anthem">${anthem}${native && native !== anthem ? ` (${native})` : ''}</span>` : ''}</div>`;
      item.onclick = () => showWikiPage(name);
      countryList.appendChild(item);
    });
  }

  function showWikiPage(name) {
    stopWikiAudio();
    const info = STUDY_MAP[normalize(name)] || {};
    const data = {
      anthem: info.anthem || 'Unknown', native: info.native || '',
      history: info.history || 'No history available for this anthem yet.',
      funFact: info.funFact || 'Did you know? Every anthem has a unique story.',
      id: info.id || (isoMap[name] ? isoMap[name].toLowerCase() : 'un')
    };
    wikiCountryTitle.textContent = name;
    wikiAnthemName.innerHTML = `${data.anthem}${data.native && data.native !== data.anthem ? `<br><small style="opacity:0.7">${data.native}</small>` : ''}`;
    wikiHistory.textContent = data.history; wikiFunFact.textContent = data.funFact;
    
    // Lyrics logic
    if (info.lyrics || info.translation) {
      wikiLyricsSection.style.display = 'block';
      gs.currentWikiLyrics = { native: info.lyrics || '', english: info.translation || '' };
      // Default to Native if available, else English
      const hasNative = !!gs.currentWikiLyrics.native;
      wikiLyrics.textContent = hasNative ? gs.currentWikiLyrics.native : gs.currentWikiLyrics.english;
      btnLyricNative.classList.toggle('active', hasNative);
      btnLyricEnglish.classList.toggle('active', !hasNative);
      btnLyricNative.style.display = hasNative ? 'inline-block' : 'none';
      btnLyricEnglish.style.display = gs.currentWikiLyrics.english ? 'inline-block' : 'none';
    } else {
      wikiLyricsSection.style.display = 'none';
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
    const name = wikiCountryTitle.textContent;
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
      alert(`Could not play anthem for ${name}. Please ensure "anthem_data/${fileName}.m4a" exists.`);
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
  studyModeBtn.addEventListener('click', () => { overlay.classList.remove('hidden'); [startScreen, endScreen, wikiScreen].forEach(s => s.classList.remove('active')); studyScreen.classList.add('active'); renderCountryList(); });
  studyBackBtn.addEventListener('click', () => { [studyScreen,wikiScreen].forEach(s=>s.classList.remove('active')); startScreen.classList.add('active'); overlay.classList.remove('hidden'); });
  wikiBackBtn.addEventListener('click', () => { [wikiScreen].forEach(s=>s.classList.remove('active')); studyScreen.classList.add('active'); stopWikiAudio(); });

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
  studySearch.addEventListener('input', (e) => { renderCountryList(e.target.value); });
  
  roundBtns.forEach(btn => btn.addEventListener('click', () => { roundBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active'); gs.totalRounds = parseInt(btn.dataset.val); }));
  diffBtns.forEach(btn => btn.addEventListener('click', () => { diffBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active'); gs.difficulty = btn.dataset.val; }));
  regBtns.forEach(btn => btn.addEventListener('click', () => { regBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active'); gs.region = btn.dataset.val; }));

})();
