"""Browser checks. Requires Playwright and a local server on port 8766."""
import json
import os
from pathlib import Path
import unittest

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get("WEATHER_TEST_URL", "http://127.0.0.1:8766/")


class BrowserChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(
            headless=True, executable_path=os.environ.get("WEATHER_BROWSER_PATH")
        )

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.context = self.browser.new_context(locale="en-US", viewport={"width": 390, "height": 844})
        self.page = self.context.new_page()
        self.page.set_default_timeout(5000)
        self.page.set_default_navigation_timeout(30000)

    def tearDown(self):
        self.context.close()

    def visit(self, filename="privacy-policy.html", locale="en"):
        self.page.goto(BASE + filename)
        self.wait_locale(locale)

    def wait_locale(self, locale):
        self.page.wait_for_function("(locale) => document.documentElement.dataset.locale === locale", arg=locale)

    def test_all_translations_on_both_pages(self):
        self.visit()
        codes = self.page.evaluate("Object.keys(WeatherLanguages.locales)")
        errors = []
        external = []
        self.page.on("pageerror", lambda error: errors.append(str(error)))
        self.page.on("request", lambda request: external.append(request.url) if not request.url.startswith(BASE) else None)
        for code in codes:
            messages = json.loads((ROOT / "locales" / f"{code}.json").read_text(encoding="utf-8"))
            for filename, sections in (("privacy-policy.html", 12), ("terms-of-service.html", 18)):
                with self.subTest(locale=code, page=filename):
                    self.visit(f"{filename}?lang={code}", code)
                    state = self.page.evaluate("""() => ({
                        strings: Array.from(document.querySelectorAll('[data-i18n]'),
                            node => [node.dataset.i18n, node.textContent]),
                        sections: document.querySelectorAll('h2').length,
                        direction: getComputedStyle(document.body).direction,
                        overflow: document.documentElement.scrollWidth > innerWidth,
                        statusHidden: document.getElementById('language-status').hidden,
                        mail: document.querySelector('a[href^="mailto:"]').getAttribute('href'),
                        borderLeft: getComputedStyle(document.querySelector('.highlight-box')).borderLeftWidth,
                        borderRight: getComputedStyle(document.querySelector('.highlight-box')).borderRightWidth
                    })""")
                    self.assertEqual(state["sections"], sections)
                    self.assertFalse(state["overflow"])
                    self.assertTrue(state["statusHidden"])
                    rtl = code in {"ar", "fa", "he", "ur"}
                    self.assertEqual(state["direction"], "rtl" if rtl else "ltr")
                    if rtl:
                        self.assertEqual(state["borderLeft"], "0px")
                        self.assertEqual(state["borderRight"], "4px")
                    expected_mail = "privacy@yourapp.com" if sections == 12 else "support@yourapp.com"
                    self.assertEqual(state["mail"], "mailto:" + expected_mail)
                    for key, value in state["strings"]:
                        self.assertEqual(value, messages[key], f"{code}/{key}")
        self.assertEqual(errors, [])
        self.assertEqual(external, [])
        print(f"Rendered all {len(codes)} translations on both pages.", flush=True)

    def test_device_languages_without_query(self):
        examples = [
            ("zh-CN", "zh-hans", "隐私政策"),
            ("zh-TW", "zh-hant", "隱私"),
            ("zh-Hans-HK", "zh-hans", "隐私政策"),
            ("ar-EG", "ar", "الخصوصية"),
            ("ja-JP", "ja", "プライバシー"),
            ("sr-Latn-BA", "sr-latn", "privatnosti"),
            ("sr-ME", "sr-me", "privatnosti"),
            ("pt-BR", "pt-br", "Privacidade"),
            ("xx-XX", "en", "Privacy Policy"),
        ]
        for device, expected, heading in examples:
            with self.subTest(device=device):
                context = self.browser.new_context(locale=device)
                try:
                    tab = context.new_page()
                    tab.goto(BASE + "privacy-policy.html")
                    tab.wait_for_function("(locale) => document.documentElement.dataset.locale === locale", arg=expected)
                    self.assertIn(heading.lower(), tab.locator("h1").inner_text().lower())
                finally:
                    context.close()

    def test_manual_choice_links_reload_and_automatic_mode(self):
        self.context.add_init_script("""
            Object.defineProperty(navigator, 'languages', {configurable:true, get:() => ['zh-CN', 'en-US']});
        """)
        self.visit(locale="zh-hans")
        self.page.select_option("#language-select", "ar")
        self.wait_locale("ar")
        self.assertEqual(self.page.evaluate("localStorage.getItem('weather-legal-language')"), "ar")
        self.assertIn("lang=ar", self.page.url)
        self.page.locator(".legal-navigation a").click()
        self.wait_locale("ar")
        self.assertEqual(self.page.locator("h2").count(), 18)
        self.page.reload()
        self.wait_locale("ar")
        self.visit("privacy-policy.html?lang=ja", "ja")
        self.page.locator("#language-auto").click()
        self.wait_locale("zh-hans")
        self.assertNotIn("lang=", self.page.url)
        self.assertIsNone(self.page.evaluate("localStorage.getItem('weather-legal-language')"))
        self.page.evaluate("""
            Object.defineProperty(navigator, 'languages', {configurable:true, get:() => ['he-IL']});
            dispatchEvent(new Event('languagechange'));
        """)
        self.wait_locale("he")
        self.page.select_option("#language-select", "en")
        self.wait_locale("en")
        self.page.evaluate("dispatchEvent(new Event('languagechange'))")
        self.assertEqual(self.page.locator("html").get_attribute("data-locale"), "en")

    def test_language_order_storage_and_query_priority(self):
        self.context.add_init_script("""
            Object.defineProperty(navigator, 'languages', {get:() => ['xx', 'ja-JP', 'zh-CN']});
            localStorage.setItem('weather-legal-language', 'fr');
        """)
        self.visit("privacy-policy.html", "fr")
        self.visit("privacy-policy.html?lang=zh-TW", "zh-hant")
        self.visit("privacy-policy.html?lang=invalid", "fr")
        self.page.locator("#language-auto").click()
        self.wait_locale("ja")

    def test_blocked_storage(self):
        self.context.add_init_script("""
            Object.defineProperty(window, 'localStorage', {get() {throw new DOMException('Blocked', 'SecurityError');}});
        """)
        self.visit("privacy-policy.html?lang=zh-CN", "zh-hans")
        self.page.select_option("#language-select", "ja")
        self.wait_locale("ja")
        self.page.locator(".legal-navigation a").click()
        self.wait_locale("ja")

    def test_load_failure_preserves_content_and_allows_retry(self):
        self.page.route("**/locales/de.json*", lambda route: route.abort())
        self.visit("privacy-policy.html?lang=de", "en")
        self.assertTrue(self.page.locator("#language-status").is_visible())
        self.assertEqual(self.page.locator("h2").count(), 12)
        self.page.select_option("#language-select", "fr")
        self.wait_locale("fr")
        self.page.select_option("#language-select", "de")
        self.page.wait_for_function("!document.getElementById('language-status').hidden")
        self.assertEqual(self.page.locator("html").get_attribute("data-locale"), "fr")
        self.assertEqual(self.page.locator("#language-select").input_value(), "fr")
        self.page.unroute("**/locales/de.json*")
        self.page.select_option("#language-select", "de")
        self.wait_locale("de")
        self.assertTrue(self.page.locator("#language-status").is_hidden())

    def test_incomplete_translation_does_not_partially_replace_content(self):
        self.page.route("**/locales/de.json*", lambda route: route.fulfill(
            status=200, content_type="application/json", body='{"s_506ff3946215":"Wrong partial title"}'))
        self.visit("privacy-policy.html?lang=de", "en")
        self.assertEqual(self.page.locator("h1").inner_text(), "Privacy Policy")
        self.assertTrue(self.page.locator("#language-status").is_visible())

    def test_latest_selection_wins_when_requests_overlap(self):
        self.visit()
        self.page.evaluate("""
            const originalFetch = window.fetch.bind(window);
            window.fetch = (...args) => {
                const result = originalFetch(...args);
                return String(args[0]).includes('/ar.json')
                    ? result.then(response => new Promise(resolve => {window.releaseArabic = () => resolve(response);}))
                    : result;
            };
        """)
        self.page.select_option("#language-select", "ar")
        self.page.wait_for_function("typeof window.releaseArabic === 'function'")
        self.page.select_option("#language-select", "ja")
        self.wait_locale("ja")
        self.page.evaluate("async () => { window.releaseArabic(); await new Promise(resolve => setTimeout(resolve, 0)); }")
        self.assertEqual(self.page.locator("html").get_attribute("data-locale"), "ja")
        self.assertEqual(self.page.evaluate("localStorage.getItem('weather-legal-language')"), "ja")

    def test_without_javascript(self):
        context = self.browser.new_context(java_script_enabled=False)
        try:
            tab = context.new_page()
            for filename, sections in (("privacy-policy.html", 12), ("terms-of-service.html", 18)):
                tab.goto(BASE + filename)
                self.assertEqual(tab.locator("h2").count(), sections)
                self.assertIn("Weather", tab.title())
                self.assertFalse(tab.locator(".language-controls").is_visible())
        finally:
            context.close()

    def test_homepage_redirect_and_mobile_screenshots(self):
        self.visit("?lang=zh-CN", "zh-hans")
        self.assertIn("privacy-policy.html?lang=zh-CN", self.page.url)
        output = ROOT / "test-results"
        output.mkdir(exist_ok=True)
        for locale in ("zh-hans", "zh-hant", "ar"):
            self.visit(f"privacy-policy.html?lang={locale}", locale)
            self.page.screenshot(path=str(output / f"{locale}.png"), full_page=False)


if __name__ == "__main__":
    unittest.main(verbosity=2)
