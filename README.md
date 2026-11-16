# 天气应用：隐私政策与服务条款

GitHub Pages 静态页面，保留原有地址：

- [隐私政策](https://kiarimovv.github.io/screen-recorder-privacy/privacy-policy.html)
- [服务条款](https://kiarimovv.github.io/screen-recorder-privacy/terms-of-service.html)

两页保留原有 12 节隐私政策、18 节服务条款、服务说明和联系邮箱，
将应用名称及录屏相关内容调整为天气应用。首页跳转至隐私政策。

## 语言

完整覆盖 [语言列表](supported-languages.md) 中的 272 个不同语言代码
（原表中 `sr-me` 出现两次）。提供 60 套完整页面译文，地区变体共享同一语言的译文。
简繁体中文、塞尔维亚文的西里尔及拉丁文字、黑山地区变体、
葡萄牙及巴西葡萄牙语分别提供译文。阿拉伯语、波斯语、希伯来语和乌尔都语使用从右向左的排版。

选择顺序：

1. URL 中的 `lang` 参数，例如 `privacy-policy.html?lang=zh-CN`。
2. 用户通过语言菜单保存的选择。
3. 浏览器首选语言列表 `navigator.languages`，按顺序匹配。
4. 无匹配语言时显示英语。

“使用设备语言”按钮清除手动选择和 URL 语言参数。页面互相跳转时保留当前语言。
浏览器语言通常跟随系统；App/WebView 可以用 `lang` 参数明确指定应用语言。
禁止本地存储时语言切换仍然可用，关闭 JavaScript 时仍能阅读英文正文。
译文加载失败时保留当前可读正文并显示提示，允许重新选择重试。

## 文件与维护

- 两个根目录 HTML 文件：英文正文和页面结构。
- `assets/languages.js`：完整语言代码映射及语言名称。
- `assets/localization.js`：语言选择、切换和页面链接。
- `assets/language.css`：语言控件与双向排版。
- `locales/*.json`：完整的静态译文，包含正文、标题及控件文字。
- `scripts/`：提取正文、生成语言映射和生成译文的维护工具。

译文在维护时使用 Google、DeepL 和 AI 辅助翻译并校对，发布后由 GitHub Pages 直接提供；
读者访问时不会调用翻译服务。塞尔维亚拉丁文由西里尔文转写，
黑山地区译文使用拉丁字母及 Ijekavian 表达。译文未经过专业法律译审。
原文的联系邮箱按要求保留。

修改英文正文后，运行 `python3 scripts/extract.py` 更新文本键。
随后更新对应译文。在环境中设置 `DEEPL_AUTH_KEY` 后，运行
`python3 scripts/translate.py`，通过 DeepL 补齐缺失的文本键。
工具会检查支持语言和剩余配额，只发送需要翻译的英文公开页面文字；
已有译文默认复用，`scripts/translation_overrides.json` 中的校对文本优先。
密钥仅从环境读取，请勿写入代码或提交到仓库。Free 密钥自动使用 Free API 域名。
更新译文时同步修改 `assets/languages.js` 中的 `version`，避免浏览器使用旧缓存。

重新生成语言映射：

```sh
python3 scripts/create_catalog.py supported-languages.md
```

## 本地验证

需要 Python 3 和 Node.js，无需安装网站依赖：

```sh
node --test tests/localization.test.cjs
python3 -m http.server 8766 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8766/privacy-policy.html?lang=zh-CN` 查看中文页面。
测试覆盖清单中的所有语言代码、文字形式、语言选择顺序、译文完整性和保留的条款结构。

安装 Python Playwright 和 Chromium 后，可以运行浏览器验证：

```sh
python3 tests/browser_checks.py
```

浏览器测试覆盖两页的全部译文、设备语言、手动选择、跨页跳转、禁用存储、
无 JavaScript、加载失败重试及连续快速切换。可用 `WEATHER_BROWSER_PATH` 指定浏览器可执行文件。

提交静态文件到当前 GitHub Pages 发布分支即可部署，现有 App 内链接无需更换。