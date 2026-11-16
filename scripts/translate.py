"""Complete static legal-page translations with DeepL. Credentials stay in memory.

Set DEEPL_AUTH_KEY in the environment. Existing translations are reused, and
editorial overrides are applied without sending those messages to the service.
"""
import argparse
import concurrent.futures
import json
import os
from pathlib import Path
import re
import threading
import time
import urllib.error
import urllib.request

from create_catalog import LANGUAGES

ROOT = Path(__file__).resolve().parents[1]
DIRECTORY = ROOT / "locales"
ENGLISH = json.loads((DIRECTORY / "en.json").read_text(encoding="utf-8"))
OVERRIDES = json.loads((ROOT / "scripts/translation_overrides.json").read_text(encoding="utf-8"))
TARGETS = {"zh-hans": "ZH-HANS", "zh-hant": "ZH-HANT",
           "fil": "TL", "pt": "PT-PT", "pt-br": "PT-BR"}
DERIVED = {"sr-latn", "sr-me", "tl"}
DISCLAIMERS = {"s_8f762b89b9cf", "s_8100e7b5ee0e"}
CONTEXT = (
    "These are the complete Privacy Policy and Terms of Service for a mobile "
    "weather forecast application named Weather. Translate the app name as "
    "weather in the target language. Use formal, natural legal language. "
    "Local weather data means data stored locally on the device. "
    "Items after 'We do not guarantee that' describe things not guaranteed. "
    "Keep all clauses, qualifications, numbers, and negations."
)
TRANSLITERATION = dict(zip(
    "абвгдђежзијклљмнњопрстћуфхцчџш",
    ["a", "b", "v", "g", "d", "đ", "e", "ž", "z", "i", "j", "k", "l",
     "lj", "m", "n", "nj", "o", "p", "r", "s", "t", "ć", "u", "f", "h",
     "c", "č", "dž", "š"]
))


def latin(text):
    output = []
    for index, char in enumerate(text):
        replacement = TRANSLITERATION.get(char.lower())
        if replacement is None:
            output.append(char)
        elif char.isupper():
            next_char = text[index + 1:index + 2]
            previous_char = text[max(0, index - 1):index]
            all_caps = next_char.isupper() or (not next_char.isalpha() and previous_char.isupper())
            output.append(replacement.upper() if all_caps else replacement.title())
        else:
            output.append(replacement)
    return "".join(output)


def cyrillic(text):
    letters = {value: key for key, value in TRANSLITERATION.items()}
    def convert(match):
        word = match[0]
        if word in {"Android", "CCPA", "GDPR", "EEA", "EU"}:
            return word
        result = []
        index = 0
        while index < len(word):
            part = word[index:index + 2]
            if part.lower() not in {"lj", "nj", "dž"}:
                part = word[index]
            value = letters.get(part.lower(), part)
            result.append(value.upper() if part[0].isupper() else value)
            index += len(part)
        return "".join(result)
    return re.sub(r"[A-Za-zČĆĐŠŽčćđšž]+", convert, text)


def existing_messages(code):
    path = DIRECTORY / f"{code}.json"
    if not path.exists():
        return {}
    source = json.loads(path.read_text(encoding="utf-8"))
    return {key: value for key, value in source.items()
            if key in ENGLISH and isinstance(value, str) and value.strip()}


def save(code, messages):
    messages.update({key: value for key, value in OVERRIDES.get(code, {}).items() if key in ENGLISH})
    assert set(messages) == set(ENGLISH), code
    assert all(isinstance(value, str) and value.strip() for value in messages.values()), code
    path = DIRECTORY / f"{code}.json"
    temporary = path.with_suffix(".tmp")
    temporary.write_text(
        json.dumps({key: messages[key] for key in ENGLISH}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    temporary.replace(path)


class DeepL:
    def __init__(self):
        self.key = os.environ.get("DEEPL_AUTH_KEY", "")
        if not self.key:
            raise RuntimeError("Set DEEPL_AUTH_KEY in the environment.")
        self.base = "https://api-free.deepl.com/v2/" if self.key.endswith(":fx") else "https://api.deepl.com/v2/"
        self.stop = threading.Event()

    def request(self, endpoint, payload=None):
        for attempt in range(4):
            if self.stop.is_set():
                raise RuntimeError("Translation stopped after a service error.")
            headers = {"Authorization": "DeepL-Auth-Key " + self.key}
            if payload is not None:
                headers["Content-Type"] = "application/json"
            request = urllib.request.Request(
                self.base + endpoint,
                data=json.dumps(payload).encode() if payload is not None else None,
                headers=headers,
            )
            try:
                with urllib.request.urlopen(request, timeout=45) as response:
                    return json.load(response)
            except urllib.error.HTTPError as error:
                if error.code in {429, 500, 502, 503, 504} and attempt < 3:
                    retry_after = error.headers.get("Retry-After", "")
                    pause = min(int(retry_after), 30) if retry_after.isdigit() else 2 ** (attempt + 1)
                    time.sleep(pause)
                    continue
                self.stop.set()
                raise RuntimeError(f"DeepL returned HTTP {error.code}; no credentials logged.") from None
            except (urllib.error.URLError, TimeoutError):
                if attempt == 3:
                    self.stop.set()
                    raise RuntimeError("DeepL connection failed after retries.") from None
                time.sleep(2 ** (attempt + 1))


def pending_keys(code, refresh):
    current = existing_messages(code)
    overrides = OVERRIDES.get(code, {})
    return [
        key for key in ENGLISH
        if key not in overrides and (
            key not in current or key in refresh
            or (len(ENGLISH[key]) > 20 and current.get(key) == ENGLISH[key])
        )
    ]


def translate_language(service, code, refresh):
    messages = existing_messages(code)
    pending = pending_keys(code, refresh)
    for offset in range(0, len(pending), 50):
        keys = pending[offset:offset + 50]
        texts = [ENGLISH[key].capitalize() if key in DISCLAIMERS else ENGLISH[key] for key in keys]
        response = service.request("translate", {
            "source_lang": "EN",
            "target_lang": TARGETS.get(code, code.upper()),
            "model_type": "quality_optimized",
            "context": CONTEXT,
            "text": texts,
        })
        translations = response.get("translations", [])
        if len(translations) != len(keys):
            raise RuntimeError(f"Incomplete DeepL response for {code}")
        for key, item in zip(keys, translations):
            value = item.get("text", "").strip()
            if not value:
                raise RuntimeError(f"Empty translation for {code}/{key}")
            messages[key] = value
        print(f"TRANSLATE {code} {min(offset + 50, len(pending))}/{len(pending)}", flush=True)
    if code == "sr":
        messages = {key: cyrillic(value) for key, value in messages.items()}
    save(code, messages)
    print(f"DONE {code} ({len(pending)} translated, {len(ENGLISH)} total)", flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--refresh-disclaimers", action="store_true")
    args = parser.parse_args()
    refresh = DISCLAIMERS if args.refresh_disclaimers else set()
    service = DeepL()
    codes = [code for code, _, _ in LANGUAGES if code != "en" and code not in DERIVED]
    supported = {item["language"] for item in service.request("languages?type=target")}
    unsupported = [code for code in codes
                   if pending_keys(code, refresh) and TARGETS.get(code, code.upper()) not in supported]
    if unsupported:
        raise SystemExit(f"Unsupported translation targets: {unsupported}")
    usage = service.request("usage")
    required = sum(len(ENGLISH[key]) for code in codes for key in pending_keys(code, refresh))
    remaining = usage["character_limit"] - usage["character_count"]
    if required > remaining:
        raise SystemExit(f"Insufficient quota: {required} characters needed; {remaining} remaining.")
    print(f"Estimated characters: {required}; quota remaining: {remaining}", flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        futures = [pool.submit(translate_language, service, code, refresh) for code in codes]
        for future in concurrent.futures.as_completed(futures):
            try:
                future.result()
            except Exception:
                service.stop.set()
                for queued in futures:
                    queued.cancel()
                raise
    serbian = existing_messages("sr")
    save("sr-latn", {key: latin(value) for key, value in serbian.items()})
    montenegrin = existing_messages("bs")
    replacements = {"korišten": "korišćen", "Uvjet": "Uslov", "uvjet": "uslov",
                    "Opć": "Opšt", "opć": "opšt", "također": "takođe",
                    "osobni": "lični", "stječete": "stičete"}
    for key, value in montenegrin.items():
        for before, after in replacements.items():
            value = value.replace(before, after)
        montenegrin[key] = value
    save("sr-me", montenegrin)
    save("tl", existing_messages("fil"))
    final_usage = service.request("usage")
    print(f"COMPLETE {len(LANGUAGES)} locales; DeepL character usage: {final_usage['character_count']}", flush=True)


if __name__ == "__main__":
    main()
