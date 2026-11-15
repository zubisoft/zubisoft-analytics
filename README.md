# Zubisoft Analytics: website

Source for [zubisoft-analytics.com](https://zubisoft-analytics.com). It's a static site with no framework and no build step for the pages themselves.

```
index.html          homepage (English)
es/index.html       homepage (Spanish)
styles.css          all styles (light and dark themes)
app.js              hero story chart, mix-vs-rate demo, theme toggle
assets/logo.svg     the logo (also used as the favicon)
assets/lang.js      picks EN/ES before the page renders
_articles/*.html    article bodies for the Insights series (English)
_articles/es/       Spanish article bodies + meta.json (titles, summaries, alt text)
build_insights.py   builds insights/*.html and the homepage teaser from _articles/
insights/           generated English article pages and chart images
es/insights/        generated Spanish article pages
CNAME               custom domain for GitHub Pages
```

## Preview locally

```
python3 -m http.server 8000
# open http://localhost:8000
```

## Edit an article

1. Edit `_articles/<slug>.html`. Titles, order, summaries and image alt text are in `ARTICLES` in `build_insights.py`.
2. Run `python3 build_insights.py`. It rewrites `insights/` and the homepage teaser between the `INSIGHTS:START/END` markers.
3. Commit and push. GitHub Pages republishes automatically.

## Languages

Every page exists in English and Spanish and lists its counterpart with `<link rel="alternate" hreflang>`.
`assets/lang.js` runs first and picks the language in this order:

1. An explicit choice: `?lang=en` or `?lang=es` in the URL, or the EN/ES switcher (remembered in localStorage).
2. The browser's preferred languages.
3. A Spanish-speaking time zone (Spain, Canaries, Latin America) when the browser prefers neither language.

Crawlers and link-preview bots are never redirected, so search engines index both versions.
When you change copy on the homepage, change it in both `index.html` and `es/index.html`. Chart and demo strings live in the `T` dictionary in `app.js`.

## Content rules

Case studies are anonymised: no client, merchant, provider or colleague names, and no business figures. The hero and demo charts use synthetic data and say so on the page.
