(function (root, factory) {
    "use strict";
    const api = factory();
    if (typeof module === "object" && module.exports) module.exports = api;
    if (root) {
        root.WeatherLegal = api;
        api.start(root, root.WeatherLanguages);
    }
})(typeof window === "undefined" ? null : window, function () {
    "use strict";
    const STORAGE_KEY = "weather-legal-language";
    const LOAD_ERROR = "This language could not be loaded. Please check your connection and try again.";

    function matchLanguage(value, catalog) {
        if (typeof value !== "string") return null;
        const code = value.trim().replace(/_/g, "-").toLowerCase();
        if (Object.prototype.hasOwnProperty.call(catalog.aliases, code)) return catalog.aliases[code];
        if (Object.prototype.hasOwnProperty.call(catalog.locales, code)) return code;
        const parts = code.split("-");
        let base = parts[0];
        if (base === "zh") {
            if (parts.includes("hans")) return "zh-hans";
            if (parts.includes("hant") || parts.some(part => ["tw", "hk", "mo"].includes(part))) return "zh-hant";
            return "zh-hans";
        }
        if (base === "sr") {
            if (parts.includes("latn")) return parts.includes("me") ? "sr-me" : "sr-latn";
            if (parts.includes("cyrl")) return "sr";
            return parts.includes("me") ? "sr-me" : "sr";
        }
        if (base === "pt" && parts.includes("br")) return "pt-br";
        base = ({ iw: "he", in: "id", no: "nb" })[base] || base;
        return Object.prototype.hasOwnProperty.call(catalog.locales, base) ? base : null;
    }

    function resolveLanguage(languages, catalog) {
        for (const language of languages || []) {
            const match = matchLanguage(language, catalog);
            if (match) return match;
        }
        return "en";
    }

    function chooseLanguage(preferences, catalog) {
        return matchLanguage(preferences.query, catalog)
            || matchLanguage(preferences.saved, catalog)
            || resolveLanguage(preferences.languages, catalog);
    }

    function start(win, catalog) {
        if (!catalog) return;
        const doc = win.document;
        const select = doc.getElementById("language-select");
        if (!select) return;
        const controls = doc.querySelector(".language-controls");
        const status = doc.getElementById("language-status");
        const nodes = Array.from(doc.querySelectorAll("[data-i18n]"));
        const english = { loadError: LOAD_ERROR };
        nodes.forEach(node => { english[node.dataset.i18n] = node.textContent; });
        const cache = { en: english };
        let active = "en";
        let requestNumber = 0;
        let queryPreference = new URL(win.location.href).searchParams.get("lang");

        function savedPreference() {
            try { return win.localStorage.getItem(STORAGE_KEY); } catch (_) { return null; }
        }

        function savePreference(value) {
            try {
                if (value) win.localStorage.setItem(STORAGE_KEY, value);
                else win.localStorage.removeItem(STORAGE_KEY);
            } catch (_) { /* Language selection also works when storage is unavailable. */ }
        }

        function deviceLanguages() {
            return win.navigator.languages && win.navigator.languages.length
                ? win.navigator.languages : [win.navigator.language];
        }

        function setQuery(value) {
            queryPreference = value;
            const url = new URL(win.location.href);
            if (value) url.searchParams.set("lang", value);
            else url.searchParams.delete("lang");
            try { win.history.replaceState(null, "", url.href); } catch (_) { /* Some WebViews restrict history. */ }
        }

        function updateLinks(locale) {
            doc.querySelectorAll("a[href]").forEach(link => {
                const url = new URL(link.getAttribute("href"), win.location.href);
                if (url.origin === win.location.origin && /\/(privacy-policy|terms-of-service)\.html$/.test(url.pathname)) {
                    url.searchParams.set("lang", locale);
                    link.href = url.href;
                }
            });
        }

        async function showLanguage(locale, manual) {
            const request = ++requestNumber;
            status.hidden = true;
            select.value = locale;
            try {
                let messages = cache[locale];
                if (!messages) {
                    const response = await win.fetch("locales/" + locale + ".json?v=" + catalog.version);
                    if (!response.ok) throw new Error("Translation unavailable");
                    messages = await response.json();
                    if (!messages || !nodes.every(node =>
                        Object.prototype.hasOwnProperty.call(messages, node.dataset.i18n)
                        && typeof messages[node.dataset.i18n] === "string"
                        && messages[node.dataset.i18n].trim()
                    ) || typeof messages.loadError !== "string") {
                        throw new Error("Incomplete translation");
                    }
                    cache[locale] = messages;
                }
                if (request !== requestNumber) return;
                nodes.forEach(node => { node.textContent = messages[node.dataset.i18n]; });
                active = locale;
                doc.documentElement.lang = catalog.locales[locale].tag;
                doc.documentElement.dir = catalog.locales[locale].dir;
                doc.documentElement.dataset.locale = locale;
                select.value = locale;
                updateLinks(locale);
                if (manual) {
                    savePreference(locale);
                    setQuery(locale);
                }
                doc.dispatchEvent(new win.CustomEvent("legal:languagechange", { detail: { locale } }));
            } catch (_) {
                if (request !== requestNumber) return;
                select.value = active;
                doc.documentElement.dataset.locale = active;
                status.textContent = cache[active].loadError || LOAD_ERROR;
                status.hidden = false;
            }
        }

        Object.entries(catalog.locales).forEach(([code, language]) => {
            const option = doc.createElement("option");
            option.value = code;
            option.lang = language.tag;
            option.dir = language.dir;
            option.textContent = language.name;
            select.appendChild(option);
        });
        controls.hidden = false;
        select.addEventListener("change", () => showLanguage(select.value, true));
        doc.getElementById("language-auto").addEventListener("click", () => {
            savePreference(null);
            setQuery(null);
            showLanguage(resolveLanguage(deviceLanguages(), catalog), false);
        });
        win.addEventListener("languagechange", () => {
            if (!matchLanguage(queryPreference, catalog) && !matchLanguage(savedPreference(), catalog)) {
                showLanguage(resolveLanguage(deviceLanguages(), catalog), false);
            }
        });
        showLanguage(chooseLanguage({
            query: queryPreference, saved: savedPreference(), languages: deviceLanguages()
        }, catalog), false);
    }

    return { matchLanguage, resolveLanguage, chooseLanguage, start };
});
