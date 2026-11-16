"""Build a complete locale catalog from the supplied language list."""
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
LANGUAGES = [
    ("ar", "العربية", "ar"), ("az", "Azərbaycanca", "az"),
    ("bn", "বাংলা", "bn"), ("bs", "Bosanski", "bs"),
    ("bg", "Български", "bg"), ("ca", "Català", "ca"),
    ("zh-hans", "简体中文", "zh-Hans"), ("zh-hant", "繁體中文", "zh-Hant"),
    ("hr", "Hrvatski", "hr"), ("cs", "Čeština", "cs"),
    ("da", "Dansk", "da"), ("nl", "Nederlands", "nl"),
    ("en", "English", "en"), ("et", "Eesti", "et"),
    ("fa", "فارسی", "fa"), ("fil", "Filipino", "fil"),
    ("fi", "Suomi", "fi"), ("fr", "Français", "fr"),
    ("de", "Deutsch", "de"), ("el", "Ελληνικά", "el"),
    ("gu", "ગુજરાતી", "gu"), ("he", "עברית", "he"),
    ("hi", "हिन्दी", "hi"), ("hu", "Magyar", "hu"),
    ("is", "Íslenska", "is"), ("id", "Bahasa Indonesia", "id"),
    ("it", "Italiano", "it"), ("ja", "日本語", "ja"),
    ("kn", "ಕನ್ನಡ", "kn"), ("kk", "Қазақша", "kk"),
    ("ko", "한국어", "ko"), ("lv", "Latviešu", "lv"),
    ("lt", "Lietuvių", "lt"), ("mk", "Македонски", "mk"),
    ("ms", "Bahasa Melayu", "ms"), ("mr", "मराठी", "mr"),
    ("sr", "Српски (ћирилица)", "sr-Cyrl"),
    ("sr-latn", "Srpski (latinica)", "sr-Latn"),
    ("sr-me", "Crnogorski", "sr-Latn-ME"),
    ("nb", "Norsk bokmål", "nb"), ("pl", "Polski", "pl"),
    ("pt", "Português (Portugal)", "pt-PT"),
    ("pt-br", "Português (Brasil)", "pt-BR"),
    ("pa", "ਪੰਜਾਬੀ", "pa"), ("ro", "Română", "ro"),
    ("ru", "Русский", "ru"), ("sk", "Slovenčina", "sk"),
    ("sl", "Slovenščina", "sl"), ("es", "Español", "es"),
    ("sw", "Kiswahili", "sw"), ("sv", "Svenska", "sv"),
    ("tl", "Tagalog", "tl"), ("ta", "தமிழ்", "ta"),
    ("te", "తెలుగు", "te"), ("th", "ไทย", "th"),
    ("tr", "Türkçe", "tr"), ("uk", "Українська", "uk"),
    ("ur", "اردو", "ur"), ("uz", "Oʻzbekcha", "uz"),
    ("vi", "Tiếng Việt", "vi"),
]


def target(code):
    parts = code.split("-")
    base = parts[0]
    if base == "zh":
        if "hans" in parts:
            return "zh-hans"
        if "hant" in parts or any(region in parts for region in ("hk", "mo", "tw")):
            return "zh-hant"
        return "zh-hans"
    if base == "sr":
        if "latn" in parts:
            return "sr-latn"
        return "sr-me" if "me" in parts else "sr"
    if code == "pt-br":
        return "pt-br"
    return base


def main():
    source = Path(sys.argv[1]).read_text(encoding="utf-8")
    codes = list(dict.fromkeys(re.findall(r"^\|[^|]+\|\s*([a-z][a-z0-9-]*)\s*\|$", source, re.M)))
    locales = {
        code: {"name": name, "tag": tag, "dir": "rtl" if code in {"ar", "fa", "he", "ur"} else "ltr"}
        for code, name, tag in LANGUAGES
    }
    aliases = {code: target(code) for code in codes}
    assert codes and all(value in locales for value in aliases.values())
    catalog = {"version": "20261116", "locales": locales, "aliases": aliases}
    output = (
        "/* Region variants share a translation in the same language. */\n"
        "(function (root) {\n"
        "    const catalog = " + json.dumps(catalog, ensure_ascii=False, indent=2) + ";\n"
        '    if (typeof module === "object" && module.exports) module.exports = catalog;\n'
        "    if (root) root.WeatherLanguages = catalog;\n"
        '})(typeof window === "undefined" ? null : window);\n'
    )
    (ROOT / "assets" / "languages.js").write_text(output, encoding="utf-8")
    (ROOT / "supported-languages.md").write_text(source, encoding="utf-8")
    print(f"{len(codes)} language codes mapped to {len(locales)} complete translations.")


if __name__ == "__main__":
    main()
