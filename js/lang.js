function setLanguage(lang) {
  alert("Language switched to: " + lang);
  // In a real-world app, you'd update content dynamically or reload with locale.
}
  const languages = {
    en: "English",
    fr: "Français",
    es: "Español",
    de: "Deutsch",
    zh: "中文 (Chinese)",
    ja: "日本語 (Japanese)",
    ru: "Русский (Russian)",
    ar: "العربية (Arabic)",
    hi: "हिन्दी (Hindi)",
    pt: "Português",
    it: "Italiano",
    ko: "한국어 (Korean)",
    tr: "Türkçe",
    vi: "Tiếng Việt",
    pl: "Polski",
    nl: "Nederlands",
    sv: "Svenska",
    tl: "Tagalog",
    fa: "فارسی (Farsi)",
    ur: "اردو (Urdu)",
    id: "Bahasa Indonesia",
    he: "עברית (Hebrew)",
    th: "ไทย (Thai)",
    ro: "Română",
    el: "Ελληνικά (Greek)",
    uk: "Українська (Ukrainian)",
    hu: "Magyar (Hungarian)",
    cs: "Čeština (Czech)",
    da: "Dansk (Danish)",
    fi: "Suomi (Finnish)",
    no: "Norsk",
    ms: "Bahasa Melayu",
    bn: "বাংলা (Bengali)",
    sr: "Српски (Serbian)",
    sk: "Slovenčina",
    hr: "Hrvatski",
    sw: "Kiswahili"
  };

  const langMenu = document.getElementById("languageMenu");

  Object.entries(languages).forEach(([code, name]) => {
    const li = document.createElement("li");
    li.innerHTML = `<a class="dropdown-item" href="#" onclick="setLanguage('${code}')">${name}</a>`;
    langMenu.appendChild(li);
  });

