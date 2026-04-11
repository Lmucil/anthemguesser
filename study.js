(function () {
  const params = new URLSearchParams(window.location.search);
  const language = params.get('lang') === 'ja' ? 'ja' : 'en';

  const studyBackBtn = document.getElementById('study-back-btn');
  const studyTitle = document.getElementById('study-title');
  const studySearch = document.getElementById('study-search');
  const countryList = document.getElementById('country-list');

  const translations = {
    en: {
      back: '← Back',
      anthemLibrary: 'Anthem Library',
      searchPlaceholder: 'Search countries or anthems...'
    },
    ja: {
      back: '← 戻る',
      anthemLibrary: '国歌ライブラリ',
      searchPlaceholder: '国名や国歌名を検索...'
    }
  };

  const t = key => (translations[language] || translations.en)[key] || translations.en[key] || key;
  const searchNormalize = s => (s || '').toLowerCase().normalize('NFKC');
  const AUDIO_FIX = { Brunei: 'Burnei', Uruguay: 'Urguay' };

  function getStudyInfo(name) {
    return (window.STUDY_DATA || {})[name] || null;
  }

  function getDisplayCountryName(name, info) {
    if (language === 'ja' && info && info.ja_name) return info.ja_name;
    return name;
  }

  function hasAudioSource(name) {
    const fileName = AUDIO_FIX[name] || name;
    return !!(window.STUDY_AUDIO_FILES && window.STUDY_AUDIO_FILES[fileName]);
  }

  function buildWikiUrl(name) {
    return `wiki.html?country=${encodeURIComponent(name)}&lang=${encodeURIComponent(language)}`;
  }

  function renderCountryList(filter = '') {
    const data = window.STUDY_DATA || {};
    countryList.innerHTML = '';
    const sorted = Object.keys(data)
      .filter(name => hasAudioSource(name))
      .sort((a, b) => getDisplayCountryName(a, getStudyInfo(a)).localeCompare(getDisplayCountryName(b, getStudyInfo(b)), language === 'ja' ? 'ja' : 'en'));

    const nf = searchNormalize(filter);
    for (const name of sorted) {
      const info = getStudyInfo(name) || {};
      const displayName = getDisplayCountryName(name, info);
      const anthem = info.anthem || '';
      const native = info.native || '';
      const jaName = info.ja_name || '';
      if (filter && !searchNormalize(name).includes(nf) && !searchNormalize(displayName).includes(nf) && !searchNormalize(jaName).includes(nf) && !searchNormalize(anthem).includes(nf) && !searchNormalize(native).includes(nf)) continue;

      const iso = info.id || 'un';
      const item = document.createElement('div');
      item.className = 'country-item';
      item.innerHTML = `<img src="https://flagcdn.com/w80/${iso.toLowerCase()}.png" alt="flag"><div class="country-info"><span class="c-name">${displayName}</span>${anthem ? `<span class="c-anthem">${anthem}${native && native !== anthem ? ` (${native})` : ''}</span>` : ''}</div>`;
      item.onclick = () => { window.location.href = buildWikiUrl(name); };
      countryList.appendChild(item);
    }
  }

  studyBackBtn.addEventListener('click', () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = 'index.html';
  });
  studySearch.addEventListener('input', e => renderCountryList(e.target.value));

  studyBackBtn.textContent = t('back');
  studyTitle.textContent = t('anthemLibrary');
  studySearch.placeholder = t('searchPlaceholder');
  renderCountryList();
})();
