"""Extract English text and annotate the two HTML pages, using only Python's stdlib."""
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = ("privacy-policy.html", "terms-of-service.html")
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "param", "source", "track", "wbr"}


class Localizer(HTMLParser):
    def __init__(self, messages):
        super().__init__(convert_charrefs=True)
        self.messages = messages
        self.parts = []
        self.stack = []

    def handle_decl(self, decl):
        self.parts.append(f"<!{decl}>")

    def handle_comment(self, data):
        self.parts.append(f"<!--{data}-->")

    def handle_starttag(self, tag, attrs):
        self.parts.append(self.get_starttag_text())
        if tag not in VOID:
            self.stack.append((tag, dict(attrs), len(self.parts) - 1))

    def handle_startendtag(self, tag, attrs):
        self.parts.append(self.get_starttag_text())

    def handle_endtag(self, tag):
        self.parts.append(f"</{tag}>")
        if self.stack and self.stack[-1][0] == tag:
            self.stack.pop()

    def handle_data(self, data):
        text = data.strip()
        if not text or not self.stack:
            self.parts.append(data)
            return
        tag, attrs, start = self.stack[-1]
        if tag in {"style", "script"}:
            self.parts.append(data)
            return
        if tag == "a" and attrs.get("href", "").startswith("mailto:"):
            self.parts.append(html.escape(data, quote=False))
            return
        key = "s_" + hashlib.sha256(text.encode()).hexdigest()[:12]
        self.messages[key] = text
        escaped = html.escape(text, quote=False)
        if tag == "title" or "data-i18n" in attrs:
            attrs["data-i18n"] = key
            attributes = "".join(
                f' {name}="{html.escape(value, quote=True)}"'
                for name, value in attrs.items()
            )
            self.parts[start] = f"<{tag}{attributes}>"
            self.parts.append(data[:len(data) - len(data.lstrip())] + escaped + data[len(data.rstrip()):])
        else:
            leading = data[:len(data) - len(data.lstrip())]
            trailing = data[len(data.rstrip()):]
            self.parts.append(f'{leading}<span data-i18n="{key}">{escaped}</span>{trailing}')


def main():
    messages = {}
    for filename in PAGES:
        path = ROOT / filename
        parser = Localizer(messages)
        parser.feed(path.read_text(encoding="utf-8"))
        parser.close()
        path.write_text("".join(parser.parts), encoding="utf-8")
    messages["loadError"] = "This language could not be loaded. Please check your connection and try again."
    directory = ROOT / "locales"
    directory.mkdir(exist_ok=True)
    (directory / "en.json").write_text(
        json.dumps(messages, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Extracted {len(messages)} English messages from {len(PAGES)} pages.")


if __name__ == "__main__":
    main()
