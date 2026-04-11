(function () {
  const params = new URLSearchParams(window.location.search);
  const country = params.get('country') || '';
  const language = params.get('lang') === 'ja' ? 'ja' : 'en';

  const wikiBackBtn = document.getElementById('wiki-back-btn');
  const wikiFlag = document.getElementById('wiki-flag');
  const wikiCountryTitle = document.getElementById('wiki-country-title');
  const wikiAnthemLabel = document.getElementById('wiki-anthem-label');
  const wikiAnthemName = document.getElementById('wiki-anthem-name');
  const wikiHistoryLabel = document.getElementById('wiki-history-label');
  const wikiHistory = document.getElementById('wiki-history');
  const wikiFunFactLabel = document.getElementById('wiki-fun-fact-label');
  const wikiFunFact = document.getElementById('wiki-fun-fact');
  const wikiLyricsSection = document.getElementById('wiki-lyrics-section');
  const wikiLyricsLabel = document.getElementById('wiki-lyrics-label');
  const wikiLyricsNativeBlock = document.getElementById('wiki-lyrics-native-block');
  const wikiLyricsNativeLabel = document.getElementById('wiki-lyrics-native-label');
  const wikiLyricsNative = document.getElementById('wiki-lyrics-native');
  const wikiLyricsTranslationBlock = document.getElementById('wiki-lyrics-translation-block');
  const wikiLyricsTranslationLabel = document.getElementById('wiki-lyrics-translation-label');
  const wikiLyricsTranslation = document.getElementById('wiki-lyrics-translation');
  const wikiPlayBtn = document.getElementById('wiki-play-btn');
  const wikiProgress = document.getElementById('wiki-progress');
  const wikiTimeCurr = document.getElementById('wiki-time-current');
  const wikiTimeTotal = document.getElementById('wiki-time-total');

  const translations = {
    en: {
      back: '← Back',
      countryDetails: 'Country Details',
      anthem: 'Anthem',
      historyOrigin: 'History & Origin',
      historyFallback: 'No history available for this anthem yet.',
      funFact: 'Fun Fact',
      funFactFallback: 'Did you know? Every anthem has a unique story.',
      lyrics: 'National Lyrics',
      native: 'Native',
      translationLabel: 'English',
      lyricsPlaceholder: 'Lyrics will appear here...',
      unknown: 'Unknown',
      couldNotPlay: 'Could not play anthem for {country}. Please ensure "anthem_data/{file}.m4a" exists.'
    },
    ja: {
      back: '← 戻る',
      countryDetails: '国の詳細',
      anthem: '国歌',
      historyOrigin: '歴史と由来',
      historyFallback: 'この国歌の歴史情報はまだありません。',
      funFact: '豆知識',
      funFactFallback: '知っていましたか？ どの国歌にもそれぞれの物語があります。',
      lyrics: '歌詞',
      native: '原語',
      translationLabel: '日本語訳',
      lyricsPlaceholder: 'ここに歌詞が表示されます...',
      unknown: '不明',
      couldNotPlay: '{country} の国歌を再生できませんでした。"anthem_data/{file}.m4a" が存在するか確認してください。'
    }
  };

  const AUDIO_FIX = { Brunei: 'Burnei', Uruguay: 'Urguay' };
  const t = (key, vars = {}) => {
    const dict = translations[language] || translations.en;
    const template = dict[key] ?? translations.en[key] ?? key;
    return String(template).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  };
  const formatTime = s => {
    if (isNaN(s) || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const rs = Math.floor(s % 60);
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  function getStudyInfo(name) {
    return (window.STUDY_DATA || {})[name] || null;
  }

  function getDisplayCountryName(name, info) {
    if (language === 'ja' && info && info.ja_name) return info.ja_name;
    return name || t('countryDetails');
  }

  function getLocalizedText(info, key, fallbackKey) {
    if (!info) return t(fallbackKey);
    if (language === 'ja' && info[`${key}_ja`]) return info[`${key}_ja`];
    return info[key] || t(fallbackKey);
  }

  function getLocalizedTranslation(info) {
    if (!info) return '';
    if (language === 'ja' && info.translation_ja) return info.translation_ja;
    return info.translation || '';
  }

  function applyStaticText() {
    document.title = `${getDisplayCountryName(country, getStudyInfo(country))} - Anthem Details`;
    wikiBackBtn.textContent = t('back');
    wikiAnthemLabel.textContent = t('anthem');
    wikiHistoryLabel.textContent = t('historyOrigin');
    wikiFunFactLabel.textContent = t('funFact');
    wikiLyricsLabel.textContent = t('lyrics');
    wikiLyricsNativeLabel.textContent = t('native');
    wikiLyricsTranslationLabel.textContent = t('translationLabel');
  }

  let wikiAudio = null;
  let progressFrame = null;
  function syncProgress() {
    if (!wikiAudio) return;
    const p = (wikiAudio.currentTime / wikiAudio.duration) * 100;
    wikiProgress.value = isNaN(p) ? 0 : p;
    wikiTimeCurr.textContent = formatTime(wikiAudio.currentTime);
  }
  function tickProgress() {
    if (!wikiAudio) return;
    syncProgress();
    if (!wikiAudio.paused && !wikiAudio.ended) {
      progressFrame = window.requestAnimationFrame(tickProgress);
    } else {
      progressFrame = null;
    }
  }
  function stopProgressLoop() {
    if (progressFrame == null) return;
    window.cancelAnimationFrame(progressFrame);
    progressFrame = null;
  }
  function startProgressLoop() {
    stopProgressLoop();
    progressFrame = window.requestAnimationFrame(tickProgress);
  }
  function stopWikiAudio() {
    if (!wikiAudio) return;
    stopProgressLoop();
    wikiAudio.pause();
    wikiAudio = null;
    wikiPlayBtn.classList.remove('playing');
    wikiPlayBtn.textContent = '▶';
  }

  function startWikiAudio(info) {
    const name = country;
    if (!name) return;
    if (wikiAudio) stopWikiAudio();
    const fileName = AUDIO_FIX[name] || name;
    wikiAudio = new Audio(`anthem_data/${fileName}.m4a`);

    wikiAudio.onloadedmetadata = () => {
      wikiTimeTotal.textContent = formatTime(wikiAudio.duration);
      syncProgress();
    };
    wikiAudio.ontimeupdate = () => {
      syncProgress();
    };
    wikiAudio.onended = () => {
      stopProgressLoop();
      wikiPlayBtn.classList.remove('playing');
      wikiPlayBtn.textContent = '▶';
      wikiProgress.value = 0;
      wikiTimeCurr.textContent = '0:00';
    };
    wikiAudio.play().then(() => {
      wikiPlayBtn.classList.add('playing');
      wikiPlayBtn.textContent = '⏸';
      startProgressLoop();
      syncProgress();
    }).catch(() => {
      stopProgressLoop();
      alert(t('couldNotPlay', { country: getDisplayCountryName(name, info), file: fileName }));
    });
  }

  function render() {
    const info = getStudyInfo(country);
    applyStaticText();

    if (!country || !info) {
      wikiCountryTitle.textContent = t('countryDetails');
      wikiAnthemName.textContent = t('unknown');
      wikiHistory.textContent = t('historyFallback');
      wikiFunFact.textContent = t('funFactFallback');
      wikiLyricsSection.style.display = 'none';
      return;
    }

    const displayName = getDisplayCountryName(country, info);
    const anthem = info.anthem || t('unknown');
    const native = info.native || '';
    const history = getLocalizedText(info, 'history', 'historyFallback');
    const funFact = getLocalizedText(info, 'funFact', 'funFactFallback');
    const translation = getLocalizedTranslation(info);
    const lyrics = info.lyrics || '';
    const flagId = info.id || 'un';

    wikiCountryTitle.textContent = displayName;
    wikiAnthemName.innerHTML = `${anthem}${native && native !== anthem ? `<br><small style="opacity:0.7">${native}</small>` : ''}`;
    wikiHistory.textContent = history;
    wikiFunFact.textContent = funFact;
    wikiFlag.src = `https://flagcdn.com/w160/${flagId}.png`;

    if (lyrics || translation) {
      wikiLyricsSection.style.display = 'block';
      wikiLyricsNativeBlock.style.display = lyrics ? 'flex' : 'none';
      wikiLyricsTranslationBlock.style.display = translation ? 'flex' : 'none';
      wikiLyricsNative.textContent = lyrics || t('lyricsPlaceholder');
      wikiLyricsTranslation.textContent = translation || t('lyricsPlaceholder');
    } else {
      wikiLyricsSection.style.display = 'none';
    }

    wikiPlayBtn.addEventListener('click', () => {
      if (wikiAudio) stopWikiAudio();
      else startWikiAudio(info);
    });
  }

  wikiBackBtn.addEventListener('click', () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = 'index.html';
  });

  window.addEventListener('beforeunload', stopWikiAudio);
  render();
})();
