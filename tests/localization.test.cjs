const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const catalog = require("../assets/languages.js");
const { matchLanguage, resolveLanguage, chooseLanguage } = require("../assets/localization.js");
const root = path.resolve(__dirname, "..");

test("all language codes from the user's list map to their own language", () => {
    const source = fs.readFileSync(path.join(root, "supported-languages.md"), "utf8");
    const codes = [...new Set([...source.matchAll(/^\|[^|]+\|\s*([a-z][a-z0-9-]*)\s*\|$/gm)].map(match => match[1]))];
    assert.equal(codes.length, 272);
    assert.deepEqual(Object.keys(catalog.aliases).sort(), codes.sort());
    for (const code of codes) {
        const result = matchLanguage(code, catalog);
        assert.ok(catalog.locales[result], code);
        assert.equal(result.split("-")[0], code.split("-")[0], code);
        assert.equal(matchLanguage(code.toUpperCase().replaceAll("-", "_"), catalog), result, code);
    }
});

test("Chinese script takes precedence over region", () => {
    for (const code of ["zh", "zh-cn", "zh-sg", "zh-hans", "zh-hans-hk", "zh-hans-mo", "zh-Hans-TW"]) {
        assert.equal(matchLanguage(code, catalog), "zh-hans", code);
    }
    for (const code of ["zh-hk", "zh-mo", "zh-tw", "zh-hant", "zh-Hant-CN"]) {
        assert.equal(matchLanguage(code, catalog), "zh-hant", code);
    }
});

test("Serbian scripts, Montenegrin and Portuguese variants stay distinct", () => {
    assert.equal(matchLanguage("sr-rs", catalog), "sr");
    assert.equal(matchLanguage("sr-latn-ba", catalog), "sr-latn");
    assert.equal(matchLanguage("sr-me", catalog), "sr-me");
    assert.equal(matchLanguage("sr-Cyrl-ME", catalog), "sr");
    assert.equal(matchLanguage("sr-Latn-ME", catalog), "sr-me");
    assert.equal(matchLanguage("pt-br", catalog), "pt-br");
    assert.equal(matchLanguage("pt-pt", catalog), "pt");
});

test("selection honors query, saved choice, and device language order", () => {
    assert.equal(chooseLanguage({query: "zh-TW", saved: "ar", languages: ["ja-JP"]}, catalog), "zh-hant");
    assert.equal(chooseLanguage({query: "unknown", saved: "ar", languages: ["ja-JP"]}, catalog), "ar");
    assert.equal(chooseLanguage({languages: ["xx", "ja-JP", "en"]}, catalog), "ja");
    assert.equal(chooseLanguage({languages: ["en-US", "zh-CN"]}, catalog), "en");
    assert.equal(chooseLanguage({languages: ["zh-CN", "en-US"]}, catalog), "zh-hans");
    assert.equal(resolveLanguage(["xx"], catalog), "en");
    assert.equal(resolveLanguage([], catalog), "en");
    assert.equal(matchLanguage("../../private", catalog), null);
    assert.equal(matchLanguage("constructor", catalog), null);
    assert.equal(matchLanguage("__proto__", catalog), null);
    assert.equal(matchLanguage("iw-IL", catalog), "he");
    assert.equal(matchLanguage("in-ID", catalog), "id");
    assert.equal(matchLanguage("no-NO", catalog), "nb");
});

test("every locale has all translated paragraphs and interface strings", () => {
    const english = JSON.parse(fs.readFileSync(path.join(root, "locales/en.json"), "utf8"));
    const keys = Object.keys(english).sort();
    assert.equal(Object.keys(catalog.locales).length, 60);
    for (const locale of Object.keys(catalog.locales)) {
        const messages = JSON.parse(fs.readFileSync(path.join(root, "locales", `${locale}.json`), "utf8"));
        assert.deepEqual(Object.keys(messages).sort(), keys, locale);
        for (const [key, text] of Object.entries(messages)) {
            assert.equal(typeof text, "string", `${locale}/${key}`);
            assert.ok(text.trim(), `${locale}/${key}`);
            assert.ok(!/\[\[\d+\]\]|Screen Recorder|screen recordings?|\bundefined\b/.test(text), `${locale}/${key}`);
            if (locale !== "en" && english[key].length > 20) {
                assert.notEqual(text, english[key], `${locale}/${key} must not fall back to English`);
            }
        }
    }
});

test("pages keep their full structure, original contacts, and weather content", () => {
    const privacy = fs.readFileSync(path.join(root, "privacy-policy.html"), "utf8");
    const terms = fs.readFileSync(path.join(root, "terms-of-service.html"), "utf8");
    const english = JSON.parse(fs.readFileSync(path.join(root, "locales/en.json"), "utf8"));
    assert.equal((privacy.match(/<h2>/g) || []).length, 12);
    assert.equal((terms.match(/<h2>/g) || []).length, 18);
    assert.ok(privacy.includes('href="mailto:privacy@yourapp.com"'));
    assert.ok(terms.includes('href="mailto:support@yourapp.com"'));
    for (const page of [privacy, terms]) {
        assert.ok(page.includes("Weather"));
        assert.ok(!/screen record|screenshots|recorded content|recording/i.test(page));
        for (const match of page.matchAll(/data-i18n="([^"]+)"/g)) assert.ok(english[match[1]], match[1]);
    }
});

test("script-specific languages use the requested writing systems", () => {
    const load = locale => JSON.parse(fs.readFileSync(path.join(root, "locales", `${locale}.json`), "utf8"));
    assert.match(load("sr").s_506ff3946215, /[\u0400-\u04ff]/u);
    for (const locale of ["sr-latn", "sr-me", "az", "uz", "da"]) {
        assert.doesNotMatch(Object.values(load(locale)).join(" "), /[\u0400-\u04ff]/u, locale);
    }
    assert.match(load("pa").s_506ff3946215, /[\u0a00-\u0a7f]/u);
    assert.equal(load("zh-hans").s_8c3b26c8283e, "隐私政策 - 天气");
    assert.equal(load("zh-hant").s_8c3b26c8283e, "隱私權政策 - 天氣");
});
