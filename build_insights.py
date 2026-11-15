"""Build the Insights pages for the Zubisoft Analytics site, in English and Spanish.

Article bodies are plain HTML fragments:
  _articles/<slug>.html        English
  _articles/es/<slug>.html     Spanish (titles, summaries and alt text in _articles/es/meta.json)
Order and English metadata live in ARTICLES below. Running this script writes:
  insights/index.html, insights/<slug>.html          English pages
  es/insights/index.html, es/insights/<slug>.html    Spanish pages
  index.html, es/index.html                          refreshes the teaser between INSIGHTS markers

Run from anywhere:  python3 site/build_insights.py
No dependencies beyond the standard library.
"""
import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
SITE_URL = "https://zubisoft-analytics.com/"
AUTHOR = "Alvaro Zubizarreta"
DATE_ISO = "2026-11-15"

ARTICLES = [
    dict(slug="one-in-six",
         title="I read 1,006 of my own AI chats. One in six said “that’s wrong”.",
         short="One in six of my messages corrected the AI",
         dek="Everyone is talking about the plumbing of AI analytics. The failures that matter happen somewhere else: in the reasoning.",
         img="01_one_in_six_messages.jpg",
         alt="Bar chart of 1,006 messages typed to an AI analyst, by type: 572 follow-ups, 154 new requests, 62 other, 43 process pushback, 43 wrong finding, 41 wrong scope, 33 format or style, 30 domain teaching, 28 approvals. The four correction types total 160, or 16%."),
    dict(slug="outage-that-never-happened",
         title="The outage that never happened",
         short="The outage that never happened",
         dek="My AI agent declared a major merchant “completely broken”. Every payment had gone through. One column name was lying.",
         img="03_fake_outage.jpg",
         alt="Two bars for one merchant’s card success rate over a weekend. The AI reported 0% and called it completely broken. A second data source showed about 91%, a normal weekend."),
    dict(slug="confident-precise-wrong",
         title="Confident, precise… and wrong: five AI answers that didn’t survive one question",
         short="Five AI answers that didn’t survive one question",
         dek="Each one was specific, persuasive and ready to ship. Each one fell to a short question from someone who knew the domain.",
         img="02_claim_vs_reality.jpg",
         alt="Five paired bars, AI claim versus reality. Payments rescued by failover: typically 80 to 90% claimed, under 2% actual. Payments hit by a bug: 96 claimed, 1 actual. A merchant’s weekend success rate: 0% claimed, about 91% actual. Gap between two providers: 2.4 times claimed, 1 times actual. Conversion gap from a routing choice: 4.3 points claimed, 0.1 points like for like."),
    dict(slug="wrong-frame",
         title="The mistake is cheap. The wrong frame is expensive.",
         short="The wrong frame is the expensive part",
         dek="Some wrong answers died in one message. Others survived for thirteen messages, or two days. The difference was the question I asked.",
         img="05_messages_to_right_answer.jpg",
         alt="Horizontal bars of messages needed to reach the right answer, per episode: quarterly review blamed the wrong provider 13; payment delay blamed the merchant 9; card tokens wrong mental model 8; fraud-check totals didn’t add up 8; retries counted as approvals 6; network tokens made no difference 4; a reroute that would change nothing 3; merchant profiled from 4% of traffic 3; article draft 80 to 90% recovered 1; two card brands both below the total 1."),
    dict(slug="lessons-dont-stop-mistakes",
         title="I wrote my AI 65 lessons. The mistakes didn’t stop.",
         short="65 lessons later, the mistakes didn’t stop",
         dek="Usage grew 2.6× in five weeks. The share of messages correcting the AI didn’t fall. Here is why, and what works better.",
         img="04_lessons_vs_correction_rate.jpg",
         alt="Two stacked charts by week from 12 October to 9 November 2026. Messages per week rose from 109 to 141, 182, 280 and 284. The share of messages correcting the AI ran 14%, 11%, 14%, 19% and 18%, while the lessons files grew to about 65 rules."),
    dict(slug="what-ai-is-good-for",
         title="26 out of 85: what AI analytics is actually good for",
         short="What AI analytics is actually good for",
         dek="Only a third of my working sessions went right first time. I would still never go back. Here is the split of work that holds up.",
         img="06_corrections_per_session.jpg",
         alt="Bar chart of 85 working sessions by corrections needed: 26 needed none, 23 needed one, 15 needed two, 7 needed three, 3 needed four, 11 needed five or more."),
]

# Interface text per language. `dir` is where that language's homepage lives, relative to ROOT.
UI = {
    "en": dict(
        dir="", src="_articles", date="15 Nov 2026",
        series="Field notes: AI in analytics",
        skip="Skip to content", home_aria="Zubisoft Analytics home", primary="Primary",
        nav=[("#services", "What we do"), ("#engage", "How we work"), ("#work", "Work"), ("#ai", "AI"), ("insights", "Insights"), ("#about", "About")],
        theme="Toggle dark mode", theme_title="Toggle theme", lang_group="Language", cta="Get in touch",
        contact_h="Thinking about AI on your own data?",
        contact_p="We'll show you the checks, defaults and review loop we run, and where your data needs fixing first.",
        mail_subject="AI%20analytics", linkedin="Message on LinkedIn ↗",
        footer="Case details are anonymised. Numbers come from the author’s own AI-assisted work.",
        part="Part {n} of {total}", mins="{m} min read", prev="← Previous", next="Next →", pager="More in this series",
        data_note="<strong>About the data.</strong> Based on 1,006 messages I typed across 124 sessions with an AI analytics agent (Claude Code connected to a payments data warehouse), 29 Sep – 13 Nov 2026. AI subagents classified every message and I spot-checked the labels. Corrections are a floor: only answers someone checked could be caught. Merchants, providers and business figures are anonymised.",
        index_title="Insights", index_eyebrow="Insights",
        index_desc="Field notes on using AI agents for real analytics work: what went wrong, what we learned, and what holds up.",
        index_lede="For two months I ran most of my analytics through an AI agent, then read every one of my 1,006 messages to it. These six notes cover what went wrong, what it was brilliant at, and the habits that keep the answers honest.",
        teaser_lede="I read 1,006 of my own conversations with an AI analyst. Here is what broke, what worked and what we now do differently.",
        all_notes="All {n} notes →",
    ),
    "es": dict(
        dir="es", src="_articles/es", date="15 nov 2026",
        series="Notas de campo: IA en analítica",
        skip="Saltar al contenido", home_aria="Inicio de Zubisoft Analytics", primary="Principal",
        nav=[("#services", "Qué hacemos"), ("#engage", "Cómo trabajamos"), ("#work", "Trabajo"), ("#ai", "IA"), ("insights", "Artículos"), ("#about", "Acerca de")],
        theme="Cambiar modo oscuro", theme_title="Cambiar tema", lang_group="Idioma", cta="Hablemos",
        contact_h="¿Piensas en usar IA sobre tus propios datos?",
        contact_p="Te enseñamos los controles, los valores por defecto y el circuito de revisión que usamos, y qué parte de tus datos conviene arreglar primero.",
        mail_subject="IA%20sobre%20mis%20datos", linkedin="Escríbenos por LinkedIn ↗",
        footer="Los casos están anonimizados. Las cifras proceden del propio trabajo del autor con IA.",
        part="Parte {n} de {total}", mins="{m} min de lectura", prev="← Anterior", next="Siguiente →", pager="Más de esta serie",
        data_note="<strong>Sobre los datos.</strong> Basado en 1.006 mensajes que escribí en 124 sesiones con un agente de analítica con IA (Claude Code conectado a un data warehouse de pagos), del 29 sep al 13 nov 2026. Subagentes de IA clasificaron cada mensaje y revisé una muestra de las etiquetas. Las correcciones son un mínimo: solo se pudieron detectar las respuestas que alguien comprobó. Comercios, proveedores y cifras de negocio están anonimizados.",
        index_title="Artículos", index_eyebrow="Artículos",
        index_desc="Notas de campo sobre el uso de agentes de IA en trabajo real de analítica: qué falló, qué aprendimos y qué funciona.",
        index_lede="Durante dos meses hice casi toda mi analítica con un agente de IA y después leí, uno a uno, los 1.006 mensajes que le escribí. Estas seis notas cuentan qué falló, en qué fue brillante y qué hábitos mantienen honestas las respuestas.",
        teaser_lede="Leí 1.006 de mis propias conversaciones con un analista de IA. Esto es lo que falló, lo que funcionó y lo que ahora hacemos distinto.",
        all_notes="Las {n} notas →",
    ),
}

LOGO = ('<svg class="brand__mark" viewBox="24 22 392 424" aria-hidden="true"><defs><clipPath id="zc"><rect x="24" y="22" width="392" height="424"/></clipPath></defs>'
        '<g clip-path="url(#zc)"><rect class="z-a" x="24" y="22" width="392" height="54"/><polygon class="z-b" points="24,76 264.9,76 204.7,140 24,140"/>'
        '<rect class="z-b" x="24" y="382" width="392" height="64"/><polygon class="z-a" points="222.8,324 416,324 416,382 168.2,382"/>'
        '<polygon class="z-a" points="315.6,22 411.2,22 12.6,446 -82.9,446"/><polygon class="z-b" points="411.2,22 506.6,22 108.1,446 12.6,446"/></g></svg>')


def esc(s):
    return html.escape(s, quote=True)


def read_minutes(body):
    words = len(re.sub(r"<[^>]+>", " ", body).split())
    return max(3, round(words / 220))


def rel(from_dir, to_path):
    """Relative URL from a directory (relative to ROOT) to a file (relative to ROOT)."""
    depth = len([p for p in from_dir.split("/") if p])
    return "../" * depth + to_path


def alternates(page):
    """hreflang links for a page path relative to a language root, e.g. 'insights/x.html'."""
    out = []
    for lang, ui in UI.items():
        target = (ui["dir"] + "/" if ui["dir"] else "") + page
        absolute = SITE_URL + target.replace("index.html", "")
        out.append((lang, absolute, target))
    return out


def head(lang, title, desc, page):
    ui = UI[lang]
    here = "/".join(p for p in [ui["dir"], *page.split("/")[:-1]] if p)  # directory of this page
    root = rel(here, "")
    home = rel(here, (ui["dir"] + "/" if ui["dir"] else "") + "index.html")
    links = "\n".join(
        f'  <link rel="alternate" hreflang="{l}" href="{a}" data-local="{rel(here, t)}">' for l, a, t in alternates(page))
    x_default = SITE_URL + page.replace("index.html", "")
    other = "es" if lang == "en" else "en"
    other_local = next(rel(here, t) for l, a, t in alternates(page) if l == other)
    insights_url = home.replace("index.html", "") + "insights/index.html"
    nav_items = []
    for href, label in ui["nav"]:
        if href == "insights":
            nav_items.append(f'        <a href="{insights_url}" aria-current="page">{label}</a>')
        else:
            nav_items.append(f'        <a href="{home}{href}">{label}</a>')
    nav = "\n".join(nav_items)
    switch = (f'<span aria-current="true">{lang.upper()}</span><a href="{other_local}" hreflang="{other}" lang="{other}" data-set-lang="{other}">{other.upper()}</a>'
              if lang == "en" else
              f'<a href="{other_local}" hreflang="{other}" lang="{other}" data-set-lang="{other}">{other.upper()}</a><span aria-current="true">{lang.upper()}</span>')
    return f"""<!doctype html>
<html lang="{lang}" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(desc)}">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(desc)}">
  <meta name="theme-color" content="#20283B">
{links}
  <link rel="alternate" hreflang="x-default" href="{x_default}">
  <script src="{root}assets/lang.js"></script>
  <link rel="icon" type="image/svg+xml" href="{root}assets/logo.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{root}styles.css">
</head>
<body>
  <a class="skip" href="#main">{ui["skip"]}</a>
  <header class="nav">
    <div class="wrap nav__inner">
      <a class="brand" href="{home}" aria-label="{ui["home_aria"]}">
        {LOGO}
        <span class="brand__name">zubisoft<span class="brand__sub">analytics</span></span>
      </a>
      <nav class="nav__links" aria-label="{ui["primary"]}">
{nav}
      </nav>
      <div class="nav__actions">
        <div class="lang-switch" role="group" aria-label="{ui["lang_group"]}">{switch}</div>
        <button class="theme-toggle" type="button" aria-label="{ui["theme"]}" title="{ui["theme_title"]}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path class="sun" d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"/><path class="moon" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>
        </button>
        <a class="btn btn--sm" href="{home}#contact">{ui["cta"]}</a>
      </div>
    </div>
  </header>
""", root


def foot(lang, root):
    ui = UI[lang]
    return f"""
  <section class="contact">
    <div class="wrap contact__inner">
      <h2>{ui["contact_h"]}</h2>
      <p>{ui["contact_p"]}</p>
      <div class="hero__cta">
        <a class="btn btn--light" href="mailto:zubisoft@gmail.com?subject={ui["mail_subject"]}">zubisoft@gmail.com</a>
        <a class="btn btn--ghost-light" href="https://www.linkedin.com/in/zubisoft/" target="_blank" rel="noopener">{ui["linkedin"]}</a>
      </div>
    </div>
  </section>
  <footer class="footer">
    <div class="wrap footer__inner">
      <span>© <span id="year">2026</span> Zubisoft Analytics</span>
      <span>{ui["footer"]}</span>
    </div>
  </footer>
  <script src="{root}app.js"></script>
</body>
</html>
"""


def card(lang, a, href, img_src, total, level="h3"):
    ui = UI[lang]
    meta = ui["part"].format(n=a["n"], total=total) + " · " + ui["mins"].format(m=a["mins"])
    return f"""<a class="insight-card card" href="{href}">
  <span class="insight-card__img"><img src="{img_src}" alt="" loading="lazy" width="1800" height="1000"></span>
  <span class="insight-card__body">
    <span class="insight-card__meta">{meta}</span>
    <{level} class="insight-card__title">{esc(a['title'])}</{level}>
    <span class="insight-card__dek">{esc(a['dek'])}</span>
  </span>
</a>"""


def article_page(lang, arts, i, body):
    ui, a = UI[lang], arts[i]
    prev = arts[i - 1] if i else None
    nxt = arts[i + 1] if i + 1 < len(arts) else None
    pager = [f'<a class="pager__item" href="{prev["slug"]}.html"><span>{ui["prev"]}</span>{esc(prev["short"])}</a>' if prev else "<span></span>"]
    if nxt:
        pager.append(f'<a class="pager__item pager__item--next" href="{nxt["slug"]}.html"><span>{ui["next"]}</span>{esc(nxt["short"])}</a>')
    top, root = head(lang, f"{a['title']} · Zubisoft Analytics", a["dek"], f"insights/{a['slug']}.html")
    return top + f"""
  <main id="main">
    <article class="article">
      <header class="article__head wrap">
        <p class="eyebrow"><a href="index.html">{ui["series"]}</a> · {ui["part"].format(n=a['n'], total=len(arts))}</p>
        <h1>{esc(a['title'])}</h1>
        <p class="article__dek">{esc(a['dek'])}</p>
        <p class="article__meta">{AUTHOR} · <time datetime="{DATE_ISO}">{ui["date"]}</time> · {ui["mins"].format(m=a['mins'])}</p>
      </header>
      <figure class="article__figure wrap">
        <div class="chart-frame"><img src="{root}insights/img/{a['img']}" alt="{esc(a['alt'])}" width="1800" height="1000"></div>
      </figure>
      <div class="article__body wrap">
{body}
        <aside class="data-note">
          {ui["data_note"]}
        </aside>
        <nav class="pager" aria-label="{ui["pager"]}">{''.join(pager)}</nav>
      </div>
    </article>
  </main>
""" + foot(lang, root)


def index_page(lang, arts):
    ui = UI[lang]
    top, root = head(lang, f"{ui['index_title']} · Zubisoft Analytics", ui["index_desc"], "insights/index.html")
    cards = "\n".join(card(lang, a, f"{a['slug']}.html", f"{root}insights/img/{a['img']}", len(arts), "h2") for a in arts)
    return top + f"""
  <main id="main">
    <section class="section insights-hero">
      <div class="wrap">
        <header class="section__head">
          <p class="eyebrow">{ui["index_eyebrow"]}</p>
          <h1>{ui["series"]}</h1>
          <p class="section__lede">{ui["index_lede"]}</p>
        </header>
        <div class="insights-grid">
{cards}
        </div>
      </div>
    </section>
  </main>
""" + foot(lang, root)


def teaser(lang, arts):
    ui = UI[lang]
    root = rel(ui["dir"], "")
    cards = "\n".join(card(lang, a, f"insights/{a['slug']}.html", f"{root}insights/img/{a['img']}", len(arts)) for a in arts[:3])
    return f"""<!-- INSIGHTS:START (generated by build_insights.py) -->
    <section class="section section--alt" id="insights">
      <div class="wrap">
        <header class="section__head section__head--row">
          <div>
            <p class="eyebrow">{ui["index_eyebrow"]}</p>
            <h2>{ui["series"]}</h2>
            <p class="section__lede">{ui["teaser_lede"]}</p>
          </div>
          <a class="btn btn--ghost" href="insights/index.html">{ui["all_notes"].format(n=len(arts))}</a>
        </header>
        <div class="insights-grid">
{cards}
        </div>
      </div>
    </section>
    <!-- INSIGHTS:END -->"""


def articles_for(lang):
    """Article list for a language: English metadata, overridden by the translation's meta.json."""
    ui = UI[lang]
    meta = {}
    meta_path = ROOT / ui["src"] / "meta.json"
    if lang != "en":
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
    arts, bodies = [], {}
    for n, base in enumerate(ARTICLES, 1):
        a = dict(base, **meta.get(base["slug"], {}))
        body = (ROOT / ui["src"] / f"{a['slug']}.html").read_text(encoding="utf-8")
        a["n"], a["mins"] = n, read_minutes(body)
        arts.append(a)
        bodies[a["slug"]] = body
    return arts, bodies


def main():
    pattern = re.compile(r"<!-- INSIGHTS:START.*?<!-- INSIGHTS:END -->", re.S)
    for lang, ui in UI.items():
        arts, bodies = articles_for(lang)
        out = ROOT / ui["dir"] / "insights"
        out.mkdir(parents=True, exist_ok=True)
        for i, a in enumerate(arts):
            (out / f"{a['slug']}.html").write_text(article_page(lang, arts, i, bodies[a["slug"]]), encoding="utf-8")
        (out / "index.html").write_text(index_page(lang, arts), encoding="utf-8")
        print(f"[{lang}] wrote {len(arts)} articles + index in {out.relative_to(ROOT)}/")

        home = ROOT / ui["dir"] / "index.html"
        text = home.read_text(encoding="utf-8")
        if not pattern.search(text):
            raise SystemExit(f"{home.relative_to(ROOT)} is missing the INSIGHTS:START / INSIGHTS:END markers")
        home.write_text(pattern.sub(lambda _: teaser(lang, arts), text), encoding="utf-8")
        print(f"[{lang}] refreshed teaser in {home.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
