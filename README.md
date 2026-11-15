# Zubisoft Analytics: website

Source for [zubisoft-analytics.com](https://zubisoft-analytics.com). It's a static site with no framework and no build step for the pages themselves.

```
index.html          homepage
styles.css          all styles (light and dark themes)
app.js              hero story chart, mix-vs-rate demo, theme toggle
assets/logo.svg     the logo (also used as the favicon)
_articles/*.html    article bodies for the Insights series
build_insights.py   builds insights/*.html and the homepage teaser from _articles/
insights/           generated article pages and chart images
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

## Content rules

Case studies are anonymised: no client, merchant, provider or colleague names, and no business figures. The hero and demo charts use synthetic data and say so on the page.
