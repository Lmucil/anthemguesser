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
    filteredPool: []
  };

  const normalize = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  /* ── Study Mode Data (Global Dataset) ── */
  const STUDY_DATA = {
    "Afghanistan": {
      "anthem": "Milli Surood", "native": "ملی سرود", "id": "af",
      "history": "Adopted in 2006, the lyrics were written by Abdul Bari Jahani. It reflects the diverse ethnic groups of the nation.",
      "funFact": "The anthem is required by law to be in Pashto and mention 'Allah is Greatest'."
    },
    "Albania": {
      "anthem": "Himni i Flamurit", "native": "Himni i Flamurit", "id": "al",
      "history": "The lyrics were written by the Albanian poet Aleksandër Stavre Drenova and first published in 1912.",
      "funFact": "It is the only national anthem in the world whose lyrics are considered more sacred than the music itself."
    },
    "Argentina": {
      "anthem": "Himno Nacional Argentino", "native": "Himno Nacional Argentino", "id": "ar",
      "history": "Adopted in 1813, it was originally an anti-Spanish revolutionary song during the Wars of Independence.",
      "funFact": "Its long orchestral introduction is iconic, and the full version can last up to 20 minutes."
    },
    "Armenia": {
      "anthem": "Mer Hayrenik", "native": "Մեր Հայրենիք", "id": "am",
      "history": "Adopted originally in 1918 and reinstated in 1991. The lyrics are based on 'The Song of an Italian Girl' by Mikayel Nalbandyan.",
      "funFact": "The title translates simply to 'Our Fatherland'."
    },
    "Australia": {
      "anthem": "Advance Australia Fair", "native": "Advance Australia Fair", "id": "au",
      "history": "Composed in 1878, it replaced 'God Save the Queen' as the official anthem in 1984.",
      "funFact": "In 2021, the lyrics were changed from 'young and free' to 'one and free' to acknowledge Indigenous history."
    },
    "Azerbaijan": {
      "anthem": "Azərbaycan marşı", "native": "Azərbaycan marşı", "id": "az",
      "history": "Originally composed in 1919 during the first republic and readopted after the fall of the USSR.",
      "funFact": "The music was composed by Uzeyir Hajibeyov, who also founded the first opera in the Muslim world."
    },
    "Bangladesh": {
      "anthem": "Amar Shonar Bangla", "native": "আমার সোনার বাংলা", "id": "bd",
      "history": "Written by Rabindranath Tagore in 1905, it was used as a protest song against the partition of Bengal.",
      "funFact": "Tagore is the only person to have written the national anthems of two different countries (India and Bangladesh)."
    },
    "Belarus": {
      "anthem": "My Belarusy", "native": "Мы, беларусы", "id": "by",
      "history": "The music was originally written for the Byelorussian SSR in 1955, with updated lyrics adopted in 2002.",
      "funFact": "The current version keeps the Soviet-era melody but removes references to Lenin and the Communist Party."
    },
    "Belgium": {
      "anthem": "The Brabançonne", "native": "La Brabançonne", "id": "be",
      "history": "Written during the Belgian Revolution of 1830. There are separate official versions in Dutch, French, and German.",
      "funFact": "The anthem was reportedly written in a café during the heat of the revolution."
    },
    "Bhutan": {
      "anthem": "Druk Tsendhen", "native": "འབྲུག་ཙན་དྷန།", "id": "bt",
      "history": "Adopted in 1953. The title translates to 'The Thunder Dragon Kingdom'.",
      "funFact": "The original melody was based on a folk song, and the choreography for the anthem was designed by the King himself."
    },
    "Bolivia": {
      "anthem": "Himno Nacional de Bolivia", "native": "Himno Nacional de Bolivia", "id": "bo",
      "history": "Adopted in 1845. The music was composed by Leopoldo Benedetto Vincenti, an Italian musician.",
      "funFact": "It was first performed on the 20th anniversary of the Battle of Ingavi."
    },
    "Bosnia Herzegovina": {
      "anthem": "Državna himna Bosne i Hercegovine", "native": "Državna himna Bosne i Hercegovine", "id": "ba",
      "history": "Adopted in 1999 to replace the previous anthem, which was considered too ethnically specific.",
      "funFact": "It is one of only four national anthems in the world (along with Spain, San Marino, and Kosovo) that has no official lyrics."
    },
    "Brazil": {
      "anthem": "Hino Nacional Brasileiro", "native": "Hino Nacional Brasileiro", "id": "br",
      "history": "Composed in 1831, it celebrates the independence and the beauty of the Brazilian landscape.",
      "funFact": "The lyrics are extremely formal and complex, containing many poetic inversions that even native speakers find difficult."
    },
    "Bulgaria": {
      "anthem": "Mila Rodino", "native": "Мила Родино", "id": "bg",
      "history": "Based on the song 'Gorda Stara Planina', written by Tsvetan Radoslavov as he left to fight in the Serbo-Bulgarian War.",
      "funFact": "The lyrics have been changed many times to reflect different political regimes, including monarchist and socialist periods."
    },
    "Brunei": {
      "anthem": "Allah Peliharakan Sultan", "native": "الله ڤليهاراكن سلطن", "id": "bn",
      "history": "Written in 1947 by a group of young people. It became the national anthem upon independence in 1984.",
      "funFact": "The title means 'God Bless the Sultan', reflecting the nation's absolute monarchy."
    },
    "Cambodia": {
      "anthem": "Nokor Reach", "native": "បទនគររာជ", "id": "kh",
      "history": "Based on a Cambodian folk tune, it was restored as the anthem in 1993 following the restoration of the monarchy.",
      "funFact": "The lyrics invoke the spirit of the ancient Angkor Empire."
    },
    "Canada": {
      "anthem": "O Canada", "native": "Ô Canada", "id": "ca",
      "history": "Originally commissioned in 1880 for Saint-Jean-Baptiste Day. It became the official anthem in 1980.",
      "funFact": "The anthem was originally written in French; the English version is not a direct translation of the French lyrics."
    },
    "Chad": {
      "anthem": "La Tchadienne", "native": "نشيد تشاد الوطني", "id": "td",
      "history": "Adopted in 1960 upon independence from France. The music is known for its upbeat, rhythmic style.",
      "funFact": "The lyrics celebrate the 'courageous and proud' people of the Sahel."
    },
    "Chile": {
      "anthem": "Himno Nacional de Chile", "native": "Himno Nacional de Chile", "id": "cl",
      "history": "The current music was composed by Ramón Carnicer in 1827. The lyrics emphasize the nation's geography.",
      "funFact": "A specific verse praising the military was controversial for years following the Pinochet dictatorship."
    },
    "China": {
      "anthem": "March of the Volunteers", "native": "义勇军进行曲", "id": "cn",
      "history": "Written in 1935 as a theme song for a film about the resistance against Japanese invasion.",
      "funFact": "During the Cultural Revolution, it was often played without lyrics because the lyricist had been imprisoned."
    },
    "Colombia": {
      "anthem": "Himno Nacional de la República de Colombia", "native": "Himno Nacional de la República de Colombia", "id": "co",
      "history": "The lyrics were written by President Rafael Núñez in 1887. The music was composed by an Italian opera singer.",
      "funFact": "By law, it must be broadcast on all public radio and TV stations at 6:00 AM and 6:00 PM every day."
    },
    "Croatia": {
      "anthem": "Lijepa naša domovino", "native": "Lijepa naša domovino", "id": "hr",
      "history": "The lyrics were first published in 1835. It was used as the official anthem even when Croatia was part of Yugoslavia.",
      "funFact": "The title translates to 'Our Beautiful Homeland'."
    },
    "Cuba": {
      "anthem": "El Himno de Bayamo", "native": "El Himno de Bayamo", "id": "cu",
      "history": "Written during the Battle of Bayamo in 1868. It is a fiery call to arms for the Cuban people.",
      "funFact": "The author wrote the lyrics while on horseback during the middle of the battle."
    },
    "Czech Republic": {
      "anthem": "Kde domov můj", "native": "Kde domov můj", "id": "cz",
      "history": "Originally written for a theatrical comedy in 1834. It became highly popular as a folk song.",
      "funFact": "The title means 'Where is my home?', referring to the beauty of the Czech landscape."
    },
    "Denmark": {
      "anthem": "Der er et yndigt land", "native": "Der er et yndigt land", "id": "dk",
      "history": "Adopted in 1844. Denmark is one of the few countries with two official national anthems (the other is the Royal Anthem).",
      "funFact": "The title means 'There is a lovely country'."
    },
    "Egypt": {
      "anthem": "Bilady, Bilady, Bilady", "native": "بلادي بلادي بلادي", "id": "eg",
      "history": "Written by Sayed Darwish in 1923. It is based on a famous speech by national leader Mustafa Kamil.",
      "funFact": "The chorus 'My country, my country, my country' is one of the most recognizable in the Arab world."
    },
    "Estonia": {
      "anthem": "Mu isamaa, mu õnn ja rõõm", "native": "Mu isamaa, mu õnn ja rõõm", "id": "ee",
      "history": "Adopted in 1920. It was banned during the Soviet era but remained a symbol of resistance.",
      "funFact": "It uses the exact same melody as the national anthem of Finland, though the lyrics are different."
    },
    "Ethiopia": {
      "anthem": "Wodefit Gesgeshi, Widd Innat Ityoppya", "native": "ወደፊት ገስግሺ ውድ এবংት ኢትዮጵያ", "id": "et",
      "history": "Adopted in 1992 after the fall of the Derg regime. Its lyrics emphasize unity and progress.",
      "funFact": "Ethiopia has changed its national anthem four times in the last century due to political shifts."
    },
    "Finland": {
      "anthem": "Maamme", "native": "Maamme / Vårt land", "id": "fi",
      "history": "First performed in 1848. The lyrics were written by Johan Ludvig Runeberg, the national poet of Finland.",
      "funFact": "The anthem was originally written in Swedish, not Finnish."
    },
    "France": {
      "anthem": "La Marseillaise", "native": "La Marseillaise", "id": "fr",
      "history": "Written in 1792 during the French Revolution as a marching song for volunteers.",
      "funFact": "It was the first 'people's anthem' and inspired revolutionary movements across the globe."
    },
    "Georgia": {
      "anthem": "Tavisupleba", "native": "თავისუფლება", "id": "ge",
      "history": "Adopted in 2004 following the Rose Revolution. The music is a medley of Georgian opera.",
      "funFact": "The title means 'Freedom', reflecting Georgia's long struggle for sovereignty."
    },
    "Germany": {
      "anthem": "Deutschlandlied", "native": "Das Lied der Deutschen", "id": "de",
      "history": "The melody was written by Joseph Haydn in 1797. Currently, only the third verse is sung.",
      "funFact": "The third verse emphasizes 'Unity and Justice and Freedom', which are the core values of modern Germany."
    },
    "Greece": {
      "anthem": "Hymn to Liberty", "native": "Ύμνος εις την Ελευθερίαν", "id": "gr",
      "history": "Based on a 158-stanza poem written in 1823. It celebrates the Greek War of Independence.",
      "funFact": "It is the longest national anthem in the world by number of stanzas, though only the first two are officially sung."
    },
    "Hungary": {
      "anthem": "Himnusz", "native": "Himnusz", "id": "hu",
      "history": "Written in 1823, it is unique among anthems because it is written as a prayer to God to bless the nation.",
      "funFact": "Because of its religious nature, it was often played without lyrics during the communist era."
    },
    "Iceland": {
      "anthem": "Lofsöngur", "native": "Lofsöngur", "id": "is",
      "history": "Written in 1874 to commemorate 1,000 years of settlement on the island.",
      "funFact": "It is notoriously difficult to sing because of its very wide vocal range."
    },
    "India": {
      "anthem": "Jana Gana Mana", "native": "जन गण मन", "id": "in",
      "history": "Written by Nobel laureate Rabindranath Tagore in 1911. It was adopted as the anthem in 1950.",
      "funFact": "A formal rendition of the anthem takes exactly 52 seconds by tradition."
    },
    "Indonesia": {
      "anthem": "Indonesia Raya", "native": "Indonesia Raya", "id": "id",
      "history": "Introduced in 1928 at the Youth Pledge. It was a rallying cry for the independence movement.",
      "funFact": "The original 1928 performance was purely instrumental (on a violin) to avoid arrest by Dutch colonial authorities."
    },
    "Iran": {
      "anthem": "Soroud-e Melli-ye Jomhouri-ye Eslami-ye Iran", "native": "سرود ملی جمهوری اسلامی ایران", "id": "ir",
      "history": "Adopted in 1990 to replace the previous anthem used after the 1979 Revolution.",
      "funFact": "It is one of the shortest national anthems in the world, lasting only about 58 seconds."
    },
    "Iraq": {
      "anthem": "Mawtini", "native": "موطني", "id": "iq",
      "history": "An old Palestinian poem that became popular across the Arab world. It was adopted by Iraq in 2004.",
      "funFact": "The title translates to 'My Homeland'. It replaced several previous anthems associated with the Ba'athist regime."
    },
    "Ireland": {
      "anthem": "Amhrán na bhFiann", "native": "Amhrán na bhFiann", "id": "ie",
      "history": "Written in 1907. The title means 'The Soldier's Song'.",
      "funFact": "While originally written in English, it is almost exclusively sung in the Irish language today."
    },
    "Israel": {
      "anthem": "Hatikvah", "native": "הַתִּקְוָה", "id": "il",
      "history": "Written in 1878 by a Jewish poet from Galicia. The title means 'The Hope'.",
      "funFact": "The melody is based on a 17th-century Italian song called 'La Mantovana', which is also the basis for 'The Moldau'."
    },
    "Italy": {
      "anthem": "Il Canto degli Italiani", "native": "Il Canto degli Italiani", "id": "it",
      "history": "Known as 'Fratelli d'Italia', it was written in 1847 tijdens the struggle for Italian unification.",
      "funFact": "The author, Goffredo Mameli, was a revolutionary who died in battle at the age of 21."
    },
    "Jamaica": {
      "anthem": "Jamaica, Land We Love", "native": "Jamaica, Land We Love", "id": "jm",
      "history": "Adopted in 1962 upon independence. The lyrics were chosen through a national competition.",
      "funFact": "It is also written as a prayer, asking for God's guidance for the new nation."
    },
    "Japan": {
      "anthem": "Kimigayo", "native": "君が代", "id": "jp",
      "history": "The lyrics are based on a 10th-century poem, making it one of the oldest anthems in the world.",
      "funFact": "With only 32 characters, it has arguably the shortest lyrics of any national anthem."
    },
    "Jordan": {
      "anthem": "As-Salam al-Malaki al-Urduni", "native": "السلام الملكي الأردني", "id": "jo",
      "history": "Adopted in 1946. It is dedicated to the King of Jordan.",
      "funFact": "There is a very short version used for military salutes that lasts only a few seconds."
    },
    "Kazakhstan": {
      "anthem": "Meniń Qazaqstanym", "native": "Менің Қазақстаным", "id": "kz",
      "history": "Adopted in 2006. The lyrics were co-written by former President Nursultan Nazarbayev.",
      "funFact": "The previous anthem was banned in 2006 and replaced because it sounded too much like the Soviet-era melody."
    },
    "Kenya": {
      "anthem": "Ee Mungu Nguvu Yetu", "native": "Ee Mungu Nguvu Yetu", "id": "ke",
      "history": "Adopted in 1963. It was based on a traditional Pokomo lullaby.",
      "funFact": "It was one of the first national anthems to be specifically commissioned from a local music committee."
    },
    "Kyrgyzstan": {
      "anthem": "Kyrgyz Respublikasynyn Mamlekettik Gimni", "native": "Кыргыз Республикасынын Мамлекеттик Гимни", "id": "kg",
      "history": "Adopted in 1992 following independence from the Soviet Union.",
      "funFact": "Until 2012, the anthem included a second verse that was removed because it was considered too difficult to translate correctly."
    },
    "Laos": {
      "anthem": "Pheng Xat Lao", "native": "ເພງຊາດລາວ", "id": "la",
      "history": "Adopted in 1947. The lyrics were changed in 1975 following the communist revolution.",
      "funFact": "The current version removes all references to the monarchy and emphasizes the people's power."
    },
    "Latvia": {
      "anthem": "Dievs, svētī Latviju!", "native": "Dievs, svētī Latviju!", "id": "lv",
      "history": "Written in 1873 by Baumaņu Kārlis. It was the first song to use the word 'Latvia'.",
      "funFact": "The title means 'God Bless Latvia!'."
    },
    "Lichtenstein": {
      "anthem": "Oben am jungen Rhein", "native": "Oben am jungen Rhein", "id": "li",
      "history": "Adopted in 1850. It uses the exact same melody as the UK's 'God Save the King'.",
      "funFact": "During international football matches against the UK, the same melody is played twice for both teams."
    },
    "Lithuania": {
      "anthem": "Tautiška giesmė", "native": "Tautiška giesmė", "id": "lt",
      "history": "Written in 1898. It was a symbol of the Lithuanian national revival against the Russian Empire.",
      "funFact": "Lithuanians around the world gather to sing the anthem together every year on July 6th."
    },
    "Luxembourg": {
      "anthem": "Ons Heemecht", "native": "Ons Heemecht", "id": "lu",
      "history": "Written in 1859. It focuses on the peaceful nature and small size of the country.",
      "funFact": "The Grand Ducal family has a separate anthem used specifically for ceremonial entries."
    },
    "Madagascar": {
      "anthem": "Ry Tanindrazanay malala ô!", "native": "Ry Tanindrazanay malala ô!", "id": "mg",
      "history": "Adopted in 1958. It is written in the Malagasy language and celebrates the island's beauty.",
      "funFact": "Madagascar's anthem is known for its European-style choral arrangement, reflecting colonial influence."
    },
    "Malaysia": {
      "anthem": "Negaraku", "native": "نڬاراكو", "id": "my",
      "history": "Adopted in 1957. The melody was originally used as the state anthem of Perak.",
      "funFact": "The tune was derived from a popular French melody called 'La Rosalie', which was a hit in the 19th century."
    },
    "Maldives": {
      "anthem": "Gaumii Salaam", "native": "ގައުމީ سަލާމް", "id": "mv",
      "history": "Written in 1948. The lyrics were originally written to the tune of 'Auld Lang Syne' before new music was composed.",
      "funFact": "The current music was composed by a Sri Lankan maestro in 1972."
    },
    "Malta": {
      "anthem": "L-Innu Malti", "native": "L-Innu Malti", "id": "mt",
      "history": "Written in 1922 in the form of a hymn. It was officially recognized as the anthem in 1964.",
      "funFact": "The lyrics are a prayer for Malta to be granted health, wisdom, and peace."
    },
    "Mexico": {
      "anthem": "Himno Nacional Mexicano", "native": "Himno Nacional Mexicano", "id": "mx",
      "history": "Adopted in 1854. The lyrics were written by a poet whose fiancée locked him in a room until he finished them.",
      "funFact": "Mexico has strict laws regulating the performance of the anthem; it must always be sung with extreme respect."
    },
    "Moldova": {
      "anthem": "Limba noastră", "native": "Limba noastră", "id": "md",
      "history": "Adopted in 1994. The title means 'Our Language', which is a major point of national identity.",
      "funFact": "Previously, Moldova used the same national anthem as Romania ('Deșteaptă-te, române!')."
    },
    "Mongolia": {
      "anthem": "Mongol Ulsyn töriin duulal", "native": "Монгол Уลсын төрийн дууላл", "id": "mn",
      "history": "Adopted in 1950. The lyrics were revised in 2006 to remove praise for communist leaders.",
      "funFact": "The anthem's lyrics celebrate the 'cradle of the sun' and the horses of the steppe."
    },
    "Morocco": {
      "anthem": "Hymne Chérifien", "native": "النشيد الشريف", "id": "ma",
      "history": "The music was composed during the French Protectorate; the lyrics weren't added until 1970.",
      "funFact": "The lyrics were written by Ali Squalli Houssaini, who also wrote the anthem of Oman."
    },
    "Myanmar": {
      "anthem": "Kaba Ma Kyei", "native": "ကမ္ဘာမကျေ", "id": "mm",
      "history": "Adopted in 1948. It is unusual because the first half is a traditional Burmese song and the second half is Western-style.",
      "funFact": "The title translates to 'Till the End of the World'."
    },
    "Nepal": {
      "anthem": "Sayaun Thunga Phool Ka", "native": "सयौँ თუंगा फूलका", "id": "np",
      "history": "Adopted in 2007 after the abolition of the monarchy. It celebrates the diversity of Nepal.",
      "funFact": "The lyrics list various floral and ethnic symbols representing the many groups in Nepal."
    },
    "Netherlands": {
      "anthem": "Wilhelmus", "native": "Wilhelmus", "id": "nl",
      "history": "Written between 1568 and 1572, it is considered the oldest national anthem in the world.",
      "funFact": "It is an acrostic: the first letters of the 15 stanzas spell out the name 'Willem van Nassov'."
    },
    "New Zealand": {
      "anthem": "God Defend New Zealand", "native": "Aotearoa / God Defend New Zealand", "id": "nz",
      "history": "Written in the 1870s. Since 1977, it has equal status with 'God Save the King'.",
      "funFact": "It is traditionally performed by singing the first verse in Māori and then the first verse in English."
    },
    "Nicaragua": {
      "anthem": "Salve a ti, Nicaragua", "native": "Salve a ti, Nicaragua", "id": "ni",
      "history": "Adopted in 1918. It is one of the few national anthems that does not mention war or fighting.",
      "funFact": "The music is based on an old Spanish liturgical chant."
    },
    "Nigeria": {
      "anthem": "Arise, O Compatriots", "native": "Arise, O Compatriots", "id": "ng",
      "history": "Adopted in 1978. The lyrics are a combination of several entries from a national competition.",
      "funFact": "In 2024, Nigeria readopted its original independence anthem, 'Nigeria, We Hail Thee'."
    },
    "North Korea": {
      "anthem": "Aegukka", "native": "애국가", "id": "kp",
      "history": "Written in 1947. The name means 'Patriotic Song', identical to the name of South Korea's anthem.",
      "funFact": "The anthem focuses on the natural beauty of the Korean peninsula and the 'three-thousand-ri' land."
    },
    "Norway": {
      "anthem": "Ja, vi elsker dette landet", "native": "Ja, vi elsker dette landet", "id": "no",
      "history": "Written by national poet Bjørnstjerne Bjørnson in 1859. It is a humble tribute to the land and its people.",
      "funFact": "Although used for 150 years, it was only officially made the de jure anthem in 2019."
    },
    "Pakistan": {
      "anthem": "Qaumi Taranah", "native": "قومی ترانہ", "id": "pk",
      "history": "Adopted in 1954. The lyrics are written in a highly Persianized form of Urdu.",
      "funFact": "The entire anthem contains only one common Urdu word ('ka'); the rest is shared with Persian vocabulary."
    },
    "Panama": {
      "anthem": "Himno Istmeño", "native": "Himno Istmeño", "id": "pa",
      "history": "Originally written in 1897 as a school song. It became the national anthem upon independence from Colombia.",
      "funFact": "The music was composed by a Spanish musician who was living in Panama."
    },
    "Paraguay": {
      "anthem": "Himno Nacional Paraguayo", "native": "Tetã purahéi Paraguáy", "id": "py",
      "history": "Written in 1846. It is known for its very long and elaborate introduction.",
      "funFact": "Like many Latin American anthems, it is a 'march-anthem' influenced by 19th-century Italian opera."
    },
    "Peru": {
      "anthem": "Himno Nacional del Perú", "native": "Himno Nacional del Perú", "id": "pe",
      "history": "Chosen in a competition held by General José de San Martín in 1821.",
      "funFact": "For decades, Peruvians sang a 'fake' extra verse that was actually a popular folk addition before it was removed."
    },
    "Philippines": {
      "anthem": "Lupang Hinirang", "native": "Lupang Hinirang", "id": "ph",
      "history": "Originally an instrumental march for the 1898 Declaration of Independence. Lyrics were added later.",
      "funFact": "The law requires the anthem to be performed in the Tagalog language; singing it in English is technically illegal."
    },
    "Poland": {
      "anthem": "Mazurek Dąbrowskiego", "native": "Mazurek Dąbrowskiego", "id": "pl",
      "history": "Written in 1797 for the Polish Legions in Italy. It is a song of hope during the partition era.",
      "funFact": "The lyrics 'Poland is not yet lost' inspired many other Slavic national anthems."
    },
    "Portugal": {
      "anthem": "A Portuguesa", "native": "A Portuguesa", "id": "pt",
      "history": "Originally a republican protest song. It was adopted as the national anthem in 1911.",
      "funFact": "One line was changed from 'Against the Britons' to 'Against the cannons' to avoid insulting their oldest ally."
    },
    "Qatar": {
      "anthem": "As-Salam al-Amiri", "native": "السلام الأميري", "id": "qa",
      "history": "Adopted in 1996 following the accession of Sheikh Hamad bin Khalifa Al Thani.",
      "funFact": "The music was composed by a Qatari musician who was a graduate of the Egyptian military music school."
    },
    "Romania": {
      "anthem": "Deșteaptă-te, romäne!", "native": "Deșteaptă-te, romäne!", "id": "ro",
      "history": "Written during the 1848 Revolution. The title translates to 'Awaken, Romanian!'.",
      "funFact": "It was used as the national anthem of Moldova for a short period after their independence."
    },
    "Russian Federation": {
      "anthem": "Gosudarstvenny Gimn Rossiyskoy Federatsii", "native": "Государственный гимн Российской Федерации", "id": "ru",
      "history": "Adopted in 2000, it uses the Soviet-era melody with completely new lyrics.",
      "funFact": "Sergey Mikhalkov wrote the lyrics for three different versions of the anthem (1944, 1977, and 2000)."
    },
    "Saudi Arabia": {
      "anthem": "As-Salam Al-Malaki", "native": "السلام الملكي", "id": "sa",
      "history": "The music was a gift from Egypt in 1947. Lyrics were not added until 1984.",
      "funFact": "The lyrics simply praise God and ask for long life for the King."
    },
    "Serbia": {
      "anthem": "Bože pravde", "native": "Боже правде", "id": "rs",
      "history": "The title means 'God of Justice'. It was originally used in a theatrical play in 1872.",
      "funFact": "The lyrics were changed from 'Serbian King' to 'Serbian lands' when Serbia became a republic."
    },
    "Slovakia": {
      "anthem": "Nad Tatrou sa blíska", "native": "Nad Tatrou sa blíska", "id": "sk",
      "history": "Written in 1844 by students protesting the arrest of their teacher. The title means 'Lightning over the Tatras'.",
      "funFact": "It was previously the second half of the national anthem of Czechoslovakia."
    },
    "Slovenia": {
      "anthem": "Zdravljica", "native": "Zdravljica", "id": "si",
      "history": "Based on a poem by France Prešeren. It is a rare 'toast' anthem that calls for international peace.",
      "funFact": "The poem is a 'carmina figurata'—each stanza is shaped like a wine chalice."
    },
    "South Africa": {
      "anthem": "National Anthem of South Africa", "native": "National Anthem of South Africa", "id": "za",
      "history": "A hybrid anthem formed in 1997 by combining two different songs in five rÃ³Å¼nych languages.",
      "funFact": "It is often cited as one of the most musically beautiful national anthems due to its complex harmonies."
    },
    "South Korea": {
      "anthem": "Aegukga", "native": "애국가", "id": "kr",
      "history": "Written in the late 19th century. The current music was composed in 1935 to replace a Scottish folk tune.",
      "funFact": "Before 1935, the anthem was often sung to the tune of 'Auld Lang Syne'."
    },
    "Spain": {
      "anthem": "Marcha Real", "native": "Marcha Real", "id": "es",
      "history": "One of the oldest anthems in the world, it was originally a military march for the Spanish Infantry.",
      "funFact": "It is one of only a few national anthems in the world that has no official lyrics."
    },
    "Sri Lanka": {
      "anthem": "Sri Lanka Matha", "native": "ශ්‍රී ලංකා මාතා / ශ්‍රී ලංකා මාතා", "id": "lk",
      "history": "Adopted in 1951. It was written in Sinhala, but a Tamil translation is also widely used.",
      "funFact": "The song is a tribute to the beauty and heritage of the 'Mother Sri Lanka'."
    },
    "Sweden": {
      "anthem": "Du gamla, du fria", "native": "Du gamla, du fria", "id": "se",
      "history": "Written in 1844. It is based on a traditional folk melody from the province of VÃ¤stmanland.",
      "funFact": "Like Norway and Denmark, it has no official legal status as an anthem but is used by long-standing tradition."
    },
    "Switzerland": {
      "anthem": "Swiss Psalm", "native": "Swiss Psalm", "id": "ch",
      "history": "Adopted in 1981, it had been used unofficially for over 100 years prior.",
      "funFact": "There are four official versions of the lyrics in German, French, Italian, and Romansh."
    },
    "Syria": {
      "anthem": "HumÄt ad-DiyÄr", "native": "حماة الديار", "id": "sy",
      "history": "Adopted in 1936. The title means 'Guardians of the Homeland'.",
      "funFact": "The music was composed by a famous Lebanese musician who also worked on many Egyptian patriotic songs."
    },
    "Tajikistan": {
      "anthem": "Surudi Milli", "native": "Суруди Миллӣ", "id": "tj",
      "history": "Adopted in 1991. The music is the same as the Tajik Soviet Socialist Republic anthem.",
      "funFact": "The lyrics celebrate the 'sun of our happiness' and the freedom of the Tajik people."
    },
    "Thailand": {
      "anthem": "Phleng Chat Thai", "native": "เพลงชาติไทย", "id": "th",
      "history": "Adopted in 1939. By decree, the anthem is played every day at 8:00 AM and 6:00 PM.",
      "funFact": "Thai law requires everyone in public spaces to stand up when the national anthem is played."
    },
    "Tonga": {
      "anthem": "Ko e fasi Ãʻo e tuʻi Ãʻo e Ã–tu Tonga", "native": "Ko e fasi ʻo e tuʻi ʻo e ʻOtu Tonga", "id": "to",
      "history": "Adopted in 1874. The music was composed by a German missionary.",
      "funFact": "The title translates to 'The Song of the King of the Tonga Islands'."
    },
    "Tunisia": {
      "anthem": "Humat al-Hima", "native": "حماة الحمى", "id": "tn",
      "history": "Written in the 1930s. It became the national anthem in 1987 after a regime change.",
      "funFact": "The final verses were written by the famous poet Aboul-Qacem Echebbi, a icon of Tunisian literature."
    },
    "Turkey": {
      "anthem": "İstiklâl Marşı", "native": "İستقلال مرشي", "id": "tr",
      "history": "Adopted in 1921. It is a tribute to the soldiers of the Turkish War of Independence.",
      "funFact": "The poet refused to take the prize money for writing the anthem, donating it to a women's charity instead."
    },
    "Turkmenistan": {
      "anthem": "GaraÅŸsyz, Bitarap TÃ¼rkmenistanyÅˆ DÃ¶wlet Gimni", "native": "Garaşsyz, Bitarap Türkmenistanyň Döwlet Gimni", "id": "tm",
      "history": "Adopted in 1996 and revised in 2008 to remove references to the former president-for-life.",
      "funFact": "The anthem is traditionally played at a very high tempo, giving it an energetic feel."
    },
    "Ukraine": {
      "anthem": "Shche ne vmerla Ukrainy i slava, i volia", "native": "Ще не вмерла України і слава, і воля", "id": "ua",
      "history": "Written in 1862. It served as the anthem of the short-lived republic in 1917 and was restored in 1992.",
      "funFact": "The lyrics have become a global symbol of resistance since the 2022 invasion."
    },
    "United Arab Emirates": {
      "anthem": "Ishy Biladi", "native": "عيشي بلادي", "id": "ae",
      "history": "Adopted in 1971. The lyrics were only added in 1986.",
      "funFact": "The title translates to 'Long Live My Country', and the song is often performed with traditional Emirati drumming."
    },
    "United Kingdom": {
      "anthem": "God Save the King", "native": "God Save the King", "id": "gb",
      "history": "First performed in 1745. It is the oldest 'God Save' style anthem in the world.",
      "funFact": "It is the only anthem in the world whose lyrics automatically change depending on the gender of the monarch."
    },
    "United States": {
      "anthem": "The Star-Spangled Banner", "native": "The Star-Spangled Banner", "id": "us",
      "history": "Written by Francis Scott Key in 1814 after witnessing the bombardment of Fort McHenry.",
      "funFact": "The melody is actually an old English drinking song called 'To Anacreon in Heaven'."
    },
    "Uruguay": {
      "anthem": "Himno Nacional de Uruguay", "native": "Himno Nacional de Uruguay", "id": "uy",
      "history": "Adopted in 1833. It is one of the longest national anthems in the world (with 11 verses).",
      "funFact": "The music was composed by a friend of the famous opera composer Gaetano Donizetti."
    },
    "Uzbekistan": {
      "anthem": "OÊ»zbekiston Respublikasining Davlat Madhiyasi", "native": "Ўзбекистон Республикасининг давлат мадҳияси", "id": "uz",
      "history": "Adopted in 1992. It retains the melody of the Uzbek Soviet Socialist Republic.",
      "funFact": "The lyrics celebrate the 'golden valley' and the spirit of the Central Asian landscape."
    },
    "Vietnam": {
      "anthem": "Tiáº¿n QuÃ¢n Ca", "native": "Tiến Quân Ca", "id": "vn",
      "history": "Written in 1944. It was adopted as the anthem of the North in 1945 and for the unified country in 1976.",
      "funFact": "The composer, Văn Cao, donated the rights to the song to the Vietnamese government for free."
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
  studyBackBtn.addEventListener('click', () => { studyScreen.classList.remove('active'); startScreen.classList.add('active'); });
  wikiBackBtn.addEventListener('click', () => { stopWikiAudio(); wikiScreen.classList.remove('active'); studyScreen.classList.add('active'); });
  studySearch.addEventListener('input', (e) => { renderCountryList(e.target.value); });
  
  roundBtns.forEach(btn => btn.addEventListener('click', () => { roundBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active'); gs.totalRounds = parseInt(btn.dataset.val); }));
  diffBtns.forEach(btn => btn.addEventListener('click', () => { diffBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active'); gs.difficulty = btn.dataset.val; }));
  regBtns.forEach(btn => btn.addEventListener('click', () => { regBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active'); gs.region = btn.dataset.val; }));

})();
