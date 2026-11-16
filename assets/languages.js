/* Region variants share a translation in the same language. */
(function (root) {
    const catalog = {
  "version": "20261116",
  "locales": {
    "ar": {
      "name": "العربية",
      "tag": "ar",
      "dir": "rtl"
    },
    "az": {
      "name": "Azərbaycanca",
      "tag": "az",
      "dir": "ltr"
    },
    "bn": {
      "name": "বাংলা",
      "tag": "bn",
      "dir": "ltr"
    },
    "bs": {
      "name": "Bosanski",
      "tag": "bs",
      "dir": "ltr"
    },
    "bg": {
      "name": "Български",
      "tag": "bg",
      "dir": "ltr"
    },
    "ca": {
      "name": "Català",
      "tag": "ca",
      "dir": "ltr"
    },
    "zh-hans": {
      "name": "简体中文",
      "tag": "zh-Hans",
      "dir": "ltr"
    },
    "zh-hant": {
      "name": "繁體中文",
      "tag": "zh-Hant",
      "dir": "ltr"
    },
    "hr": {
      "name": "Hrvatski",
      "tag": "hr",
      "dir": "ltr"
    },
    "cs": {
      "name": "Čeština",
      "tag": "cs",
      "dir": "ltr"
    },
    "da": {
      "name": "Dansk",
      "tag": "da",
      "dir": "ltr"
    },
    "nl": {
      "name": "Nederlands",
      "tag": "nl",
      "dir": "ltr"
    },
    "en": {
      "name": "English",
      "tag": "en",
      "dir": "ltr"
    },
    "et": {
      "name": "Eesti",
      "tag": "et",
      "dir": "ltr"
    },
    "fa": {
      "name": "فارسی",
      "tag": "fa",
      "dir": "rtl"
    },
    "fil": {
      "name": "Filipino",
      "tag": "fil",
      "dir": "ltr"
    },
    "fi": {
      "name": "Suomi",
      "tag": "fi",
      "dir": "ltr"
    },
    "fr": {
      "name": "Français",
      "tag": "fr",
      "dir": "ltr"
    },
    "de": {
      "name": "Deutsch",
      "tag": "de",
      "dir": "ltr"
    },
    "el": {
      "name": "Ελληνικά",
      "tag": "el",
      "dir": "ltr"
    },
    "gu": {
      "name": "ગુજરાતી",
      "tag": "gu",
      "dir": "ltr"
    },
    "he": {
      "name": "עברית",
      "tag": "he",
      "dir": "rtl"
    },
    "hi": {
      "name": "हिन्दी",
      "tag": "hi",
      "dir": "ltr"
    },
    "hu": {
      "name": "Magyar",
      "tag": "hu",
      "dir": "ltr"
    },
    "is": {
      "name": "Íslenska",
      "tag": "is",
      "dir": "ltr"
    },
    "id": {
      "name": "Bahasa Indonesia",
      "tag": "id",
      "dir": "ltr"
    },
    "it": {
      "name": "Italiano",
      "tag": "it",
      "dir": "ltr"
    },
    "ja": {
      "name": "日本語",
      "tag": "ja",
      "dir": "ltr"
    },
    "kn": {
      "name": "ಕನ್ನಡ",
      "tag": "kn",
      "dir": "ltr"
    },
    "kk": {
      "name": "Қазақша",
      "tag": "kk",
      "dir": "ltr"
    },
    "ko": {
      "name": "한국어",
      "tag": "ko",
      "dir": "ltr"
    },
    "lv": {
      "name": "Latviešu",
      "tag": "lv",
      "dir": "ltr"
    },
    "lt": {
      "name": "Lietuvių",
      "tag": "lt",
      "dir": "ltr"
    },
    "mk": {
      "name": "Македонски",
      "tag": "mk",
      "dir": "ltr"
    },
    "ms": {
      "name": "Bahasa Melayu",
      "tag": "ms",
      "dir": "ltr"
    },
    "mr": {
      "name": "मराठी",
      "tag": "mr",
      "dir": "ltr"
    },
    "sr": {
      "name": "Српски (ћирилица)",
      "tag": "sr-Cyrl",
      "dir": "ltr"
    },
    "sr-latn": {
      "name": "Srpski (latinica)",
      "tag": "sr-Latn",
      "dir": "ltr"
    },
    "sr-me": {
      "name": "Crnogorski",
      "tag": "sr-Latn-ME",
      "dir": "ltr"
    },
    "nb": {
      "name": "Norsk bokmål",
      "tag": "nb",
      "dir": "ltr"
    },
    "pl": {
      "name": "Polski",
      "tag": "pl",
      "dir": "ltr"
    },
    "pt": {
      "name": "Português (Portugal)",
      "tag": "pt-PT",
      "dir": "ltr"
    },
    "pt-br": {
      "name": "Português (Brasil)",
      "tag": "pt-BR",
      "dir": "ltr"
    },
    "pa": {
      "name": "ਪੰਜਾਬੀ",
      "tag": "pa",
      "dir": "ltr"
    },
    "ro": {
      "name": "Română",
      "tag": "ro",
      "dir": "ltr"
    },
    "ru": {
      "name": "Русский",
      "tag": "ru",
      "dir": "ltr"
    },
    "sk": {
      "name": "Slovenčina",
      "tag": "sk",
      "dir": "ltr"
    },
    "sl": {
      "name": "Slovenščina",
      "tag": "sl",
      "dir": "ltr"
    },
    "es": {
      "name": "Español",
      "tag": "es",
      "dir": "ltr"
    },
    "sw": {
      "name": "Kiswahili",
      "tag": "sw",
      "dir": "ltr"
    },
    "sv": {
      "name": "Svenska",
      "tag": "sv",
      "dir": "ltr"
    },
    "tl": {
      "name": "Tagalog",
      "tag": "tl",
      "dir": "ltr"
    },
    "ta": {
      "name": "தமிழ்",
      "tag": "ta",
      "dir": "ltr"
    },
    "te": {
      "name": "తెలుగు",
      "tag": "te",
      "dir": "ltr"
    },
    "th": {
      "name": "ไทย",
      "tag": "th",
      "dir": "ltr"
    },
    "tr": {
      "name": "Türkçe",
      "tag": "tr",
      "dir": "ltr"
    },
    "uk": {
      "name": "Українська",
      "tag": "uk",
      "dir": "ltr"
    },
    "ur": {
      "name": "اردو",
      "tag": "ur",
      "dir": "rtl"
    },
    "uz": {
      "name": "Oʻzbekcha",
      "tag": "uz",
      "dir": "ltr"
    },
    "vi": {
      "name": "Tiếng Việt",
      "tag": "vi",
      "dir": "ltr"
    }
  },
  "aliases": {
    "ar": "ar",
    "ar-dz": "ar",
    "ar-bh": "ar",
    "ar-eg": "ar",
    "ar-iq": "ar",
    "ar-jo": "ar",
    "ar-kw": "ar",
    "ar-lb": "ar",
    "ar-ly": "ar",
    "ar-ma": "ar",
    "ar-om": "ar",
    "ar-qa": "ar",
    "ar-sa": "ar",
    "ar-sd": "ar",
    "ar-sy": "ar",
    "ar-tn": "ar",
    "ar-ae": "ar",
    "ar-ye": "ar",
    "az": "az",
    "az-latn": "az",
    "az-latn-az": "az",
    "bn": "bn",
    "bn-bd": "bn",
    "bn-in": "bn",
    "bs": "bs",
    "bs-ba": "bs",
    "bg": "bg",
    "bg-bg": "bg",
    "ca": "ca",
    "ca-es": "ca",
    "zh": "zh-hans",
    "zh-hk": "zh-hant",
    "zh-mo": "zh-hant",
    "zh-cn": "zh-hans",
    "zh-hans": "zh-hans",
    "zh-hans-cn": "zh-hans",
    "zh-hans-hk": "zh-hans",
    "zh-hans-mo": "zh-hans",
    "zh-hans-sg": "zh-hans",
    "zh-sg": "zh-hans",
    "zh-tw": "zh-hant",
    "zh-hant": "zh-hant",
    "zh-hant-hk": "zh-hant",
    "zh-hant-mo": "zh-hant",
    "zh-hant-tw": "zh-hant",
    "hr": "hr",
    "hr-hr": "hr",
    "cs": "cs",
    "cs-cz": "cs",
    "da": "da",
    "da-dk": "da",
    "nl": "nl",
    "nl-aw": "nl",
    "nl-be": "nl",
    "nl-cw": "nl",
    "nl-nl": "nl",
    "nl-sx": "nl",
    "en": "en",
    "en-as": "en",
    "en-au": "en",
    "en-bb": "en",
    "en-be": "en",
    "en-bz": "en",
    "en-bm": "en",
    "en-bw": "en",
    "en-cm": "en",
    "en-ca": "en",
    "en-gh": "en",
    "en-gu": "en",
    "en-gy": "en",
    "en-hk": "en",
    "en-in": "en",
    "en-ie": "en",
    "en-jm": "en",
    "en-ke": "en",
    "en-mw": "en",
    "en-my": "en",
    "en-mt": "en",
    "en-mh": "en",
    "en-mu": "en",
    "en-na": "en",
    "en-nz": "en",
    "en-ng": "en",
    "en-mp": "en",
    "en-pk": "en",
    "en-ph": "en",
    "en-rw": "en",
    "en-sg": "en",
    "en-za": "en",
    "en-tz": "en",
    "en-th": "en",
    "en-tt": "en",
    "en-um": "en",
    "en-vi": "en",
    "en-ug": "en",
    "en-gb": "en",
    "en-us": "en",
    "en-zm": "en",
    "en-zw": "en",
    "et": "et",
    "et-ee": "et",
    "fa": "fa",
    "fa-af": "fa",
    "fa-ir": "fa",
    "fil": "fil",
    "fil-ph": "fil",
    "fi": "fi",
    "fi-fi": "fi",
    "fr": "fr",
    "fr-dz": "fr",
    "fr-be": "fr",
    "fr-bj": "fr",
    "fr-bf": "fr",
    "fr-bi": "fr",
    "fr-cm": "fr",
    "fr-ca": "fr",
    "fr-cf": "fr",
    "fr-td": "fr",
    "fr-km": "fr",
    "fr-cg": "fr",
    "fr-cd": "fr",
    "fr-ci": "fr",
    "fr-dj": "fr",
    "fr-gq": "fr",
    "fr-fr": "fr",
    "fr-gf": "fr",
    "fr-ga": "fr",
    "fr-gp": "fr",
    "fr-gn": "fr",
    "fr-lu": "fr",
    "fr-mg": "fr",
    "fr-ml": "fr",
    "fr-mq": "fr",
    "fr-mu": "fr",
    "fr-yt": "fr",
    "fr-mc": "fr",
    "fr-ma": "fr",
    "fr-ne": "fr",
    "fr-re": "fr",
    "fr-rw": "fr",
    "fr-bl": "fr",
    "fr-mf": "fr",
    "fr-sn": "fr",
    "fr-sc": "fr",
    "fr-ch": "fr",
    "fr-tg": "fr",
    "fr-tn": "fr",
    "de": "de",
    "de-at": "de",
    "de-be": "de",
    "de-de": "de",
    "de-li": "de",
    "de-lu": "de",
    "de-ch": "de",
    "el": "el",
    "el-cy": "el",
    "el-gr": "el",
    "gu": "gu",
    "he": "he",
    "he-il": "he",
    "hi": "hi",
    "hi-in": "hi",
    "hu": "hu",
    "hu-hu": "hu",
    "is": "is",
    "is-is": "is",
    "id": "id",
    "id-id": "id",
    "it": "it",
    "it-it": "it",
    "it-ch": "it",
    "ja": "ja",
    "ja-jp": "ja",
    "kn": "kn",
    "kk": "kk",
    "kk-kz": "kk",
    "ko": "ko",
    "ko-kr": "ko",
    "lv": "lv",
    "lv-lv": "lv",
    "lt": "lt",
    "lt-lt": "lt",
    "mk": "mk",
    "mk-mk": "mk",
    "ms": "ms",
    "ms-bn": "ms",
    "ms-my": "ms",
    "mr": "mr",
    "sr-me": "sr-me",
    "nb": "nb",
    "pl": "pl",
    "pl-pl": "pl",
    "pt": "pt",
    "pt-ao": "pt",
    "pt-br": "pt-br",
    "pt-cv": "pt",
    "pt-gw": "pt",
    "pt-mz": "pt",
    "pt-pt": "pt",
    "pt-st": "pt",
    "pa": "pa",
    "pa-in": "pa",
    "ro": "ro",
    "ro-md": "ro",
    "ro-mo": "ro",
    "ro-ro": "ro",
    "ru": "ru",
    "ru-md": "ru",
    "ru-mo": "ru",
    "ru-ru": "ru",
    "ru-ua": "ru",
    "sr": "sr",
    "sr-latn": "sr-latn",
    "sr-latn-ba": "sr-latn",
    "sr-rs": "sr",
    "sk": "sk",
    "sk-sk": "sk",
    "sl": "sl",
    "sl-sl": "sl",
    "es": "es",
    "es-ar": "es",
    "es-bo": "es",
    "es-cl": "es",
    "es-co": "es",
    "es-cr": "es",
    "es-do": "es",
    "es-ec": "es",
    "es-sv": "es",
    "es-gq": "es",
    "es-gt": "es",
    "es-hn": "es",
    "es-419": "es",
    "es-mx": "es",
    "es-ni": "es",
    "es-pa": "es",
    "es-py": "es",
    "es-pe": "es",
    "es-pr": "es",
    "es-es": "es",
    "es-us": "es",
    "es-uy": "es",
    "es-ve": "es",
    "sw": "sw",
    "sw-cd": "sw",
    "sw-ke": "sw",
    "sw-tz": "sw",
    "sw-ug": "sw",
    "sv": "sv",
    "sv-fi": "sv",
    "sv-se": "sv",
    "tl": "tl",
    "ta": "ta",
    "ta-in": "ta",
    "ta-lk": "ta",
    "te": "te",
    "te-in": "te",
    "th": "th",
    "th-th": "th",
    "tr": "tr",
    "tr-tr": "tr",
    "uk": "uk",
    "uk-ua": "uk",
    "ur": "ur",
    "ur-bd": "ur",
    "ur-in": "ur",
    "ur-np": "ur",
    "ur-pk": "ur",
    "uz": "uz",
    "uz-latn": "uz",
    "uz-latn-uz": "uz",
    "vi": "vi",
    "vi-vn": "vi"
  }
};
    if (typeof module === "object" && module.exports) module.exports = catalog;
    if (root) root.WeatherLanguages = catalog;
})(typeof window === "undefined" ? null : window);
