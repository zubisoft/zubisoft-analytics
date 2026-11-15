"""Build the Insights pages for the Zubisoft Analytics site.

Article bodies live in _articles/<slug>.html (plain HTML fragments).
Metadata and order live in ARTICLES below. Running this script writes:
  insights/index.html          the series listing
  insights/<slug>.html         one page per article
  index.html                   refreshes the homepage teaser between INSIGHTS markers

Run from anywhere:  python3 site/build_insights.py
No dependencies beyond the standard library.
"""
import html
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "_articles"
OUT = ROOT / "insights"

SERIES = "Field notes: AI in analytics"
AUTHOR = "Alvaro Zubizarreta"
DATE = ("2026-11-15", "15 Nov 2026")

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

LOGO = ('<svg class="brand__mark" viewBox="24 22 392 424" aria-hidden="true"><defs><clipPath id="zc"><rect x="24" y="22" width="392" height="424"/></clipPath></defs>'
        '<g clip-path="url(#zc)"><rect class="z-a" x="24" y="22" width="392" height="54"/><polygon class="z-b" points="24,76 264.9,76 204.7,140 24,140"/>'
        '<rect class="z-b" x="24" y="382" width="392" height="64"/><polygon class="z-a" points="222.8,324 416,324 416,382 168.2,382"/>'
        '<polygon class="z-a" points="315.6,22 411.2,22 12.6,446 -82.9,446"/><polygon class="z-b" points="411.2,22 506.6,22 108.1,446 12.6,446"/></g></svg>')


def esc(s):
    return html.escape(s, quote=True)


def read_minutes(body):
    words = len(re.sub(r"<[^>]+>", " ", body).split())
    return max(3, round(words / 220))


def head(title, desc, prefix):
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(desc)}">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(desc)}">
  <meta name="theme-color" content="#20283B">
  <link rel="icon" type="image/svg+xml" href="{prefix}assets/logo.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{prefix}styles.css">
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="nav">
    <div class="wrap nav__inner">
      <a class="brand" href="{prefix}index.html" aria-label="Zubisoft Analytics home">
        {LOGO}
        <span class="brand__name">zubisoft<span class="brand__sub">analytics</span></span>
      </a>
      <nav class="nav__links" aria-label="Primary">
        <a href="{prefix}index.html#services">Services</a>
        <a href="{prefix}index.html#ai">AI on your data</a>
        <a href="{prefix}index.html#work">Work</a>
        <a href="{prefix}insights/index.html" aria-current="page">Insights</a>
        <a href="{prefix}index.html#about">About</a>
      </nav>
      <div class="nav__actions">
        <button class="theme-toggle" type="button" aria-label="Toggle dark mode" title="Toggle theme">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path class="sun" d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"/><path class="moon" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>
        </button>
        <a class="btn btn--sm" href="{prefix}index.html#contact">Get in touch</a>
      </div>
    </div>
  </header>
"""


def foot(prefix):
    return f"""
  <section class="contact">
    <div class="wrap contact__inner">
      <h2>Thinking about AI on your own data?</h2>
      <p>We'll show you the checks, defaults and review loop we run, and where your data needs fixing first.</p>
      <div class="hero__cta">
        <a class="btn btn--light" href="mailto:zubisoft@gmail.com?subject=AI%20analytics">zubisoft@gmail.com</a>
        <a class="btn btn--ghost-light" href="https://www.linkedin.com/in/zubisoft/" target="_blank" rel="noopener">Message on LinkedIn ↗</a>
      </div>
    </div>
  </section>
  <footer class="footer">
    <div class="wrap footer__inner">
      <span>© <span id="year">2026</span> Zubisoft Analytics</span>
      <span>Case details are anonymised. Numbers come from the author’s own AI-assisted work.</span>
    </div>
  </footer>
  <script src="{prefix}app.js"></script>
</body>
</html>
"""


def card(a, href, img_prefix, level="h3"):
    return f"""<a class="insight-card card" href="{href}">
  <span class="insight-card__img"><img src="{img_prefix}{a['img']}" alt="" loading="lazy" width="1800" height="1000"></span>
  <span class="insight-card__body">
    <span class="insight-card__meta">Part {a['n']} · {a['mins']} min read</span>
    <{level} class="insight-card__title">{esc(a['title'])}</{level}>
    <span class="insight-card__dek">{esc(a['dek'])}</span>
  </span>
</a>"""


def article_page(a, prev, nxt, body):
    pager = []
    if prev:
        pager.append(f'<a class="pager__item" href="{prev["slug"]}.html"><span>← Previous</span>{esc(prev["short"])}</a>')
    else:
        pager.append('<span></span>')
    if nxt:
        pager.append(f'<a class="pager__item pager__item--next" href="{nxt["slug"]}.html"><span>Next →</span>{esc(nxt["short"])}</a>')
    return head(f"{a['title']} · Zubisoft Analytics", a["dek"], "../") + f"""
  <main id="main">
    <article class="article">
      <header class="article__head wrap">
        <p class="eyebrow"><a href="index.html">{SERIES}</a> · Part {a['n']} of {len(ARTICLES)}</p>
        <h1>{esc(a['title'])}</h1>
        <p class="article__dek">{esc(a['dek'])}</p>
        <p class="article__meta">{AUTHOR} · <time datetime="{DATE[0]}">{DATE[1]}</time> · {a['mins']} min read</p>
      </header>
      <figure class="article__figure wrap">
        <div class="chart-frame"><img src="img/{a['img']}" alt="{esc(a['alt'])}" width="1800" height="1000"></div>
      </figure>
      <div class="article__body wrap">
{body}
        <aside class="data-note">
          <strong>About the data.</strong> Based on 1,006 messages I typed across 124 sessions with an AI analytics agent (Claude Code connected to a payments data warehouse), 29 Sep – 13 Nov 2026. AI subagents classified every message and I spot-checked the labels. Corrections are a floor: only answers someone checked could be caught. Merchants, providers and business figures are anonymised.
        </aside>
        <nav class="pager" aria-label="More in this series">{''.join(pager)}</nav>
      </div>
    </article>
  </main>
""" + foot("../")


def index_page(arts):
    cards = "\n".join(card(a, f"{a['slug']}.html", "img/", "h2") for a in arts)
    return head(f"Insights · Zubisoft Analytics", "Field notes on using AI agents for real analytics work: what went wrong, what we learned, and what holds up.", "../") + f"""
  <main id="main">
    <section class="section insights-hero">
      <div class="wrap">
        <header class="section__head">
          <p class="eyebrow">Insights</p>
          <h1>{SERIES}</h1>
          <p class="section__lede">For two months I ran most of my analytics through an AI agent, then read every one of my 1,006 messages to it. These six notes cover what went wrong, what it was brilliant at, and the habits that keep the answers honest.</p>
        </header>
        <div class="insights-grid">
{cards}
        </div>
      </div>
    </section>
  </main>
""" + foot("../")


def teaser(arts):
    feat = [arts[0], arts[1], arts[2]]
    cards = "\n".join(card(a, f"insights/{a['slug']}.html", "insights/img/") for a in feat)
    return f"""<!-- INSIGHTS:START (generated by build_insights.py) -->
    <section class="section section--alt" id="insights">
      <div class="wrap">
        <header class="section__head section__head--row">
          <div>
            <p class="eyebrow">Insights</p>
            <h2>{SERIES}</h2>
            <p class="section__lede">I read 1,006 of my own conversations with an AI analyst. Here is what broke, what worked and what we now do differently.</p>
          </div>
          <a class="btn btn--ghost" href="insights/index.html">All {len(arts)} notes →</a>
        </header>
        <div class="insights-grid">
{cards}
        </div>
      </div>
    </section>
    <!-- INSIGHTS:END -->"""


def main():
    OUT.mkdir(exist_ok=True)
    bodies = {}
    for i, a in enumerate(ARTICLES, 1):
        body = (SRC / f"{a['slug']}.html").read_text(encoding="utf-8")
        a["n"], a["mins"] = i, read_minutes(body)
        bodies[a["slug"]] = body
    for i, a in enumerate(ARTICLES):
        prev = ARTICLES[i - 1] if i else None
        nxt = ARTICLES[i + 1] if i + 1 < len(ARTICLES) else None
        path = OUT / f"{a['slug']}.html"
        path.write_text(article_page(a, prev, nxt, bodies[a["slug"]]), encoding="utf-8")
        print("wrote", path.relative_to(ROOT))
    (OUT / "index.html").write_text(index_page(ARTICLES), encoding="utf-8")
    print("wrote insights/index.html")

    home = ROOT / "index.html"
    text = home.read_text(encoding="utf-8")
    pattern = re.compile(r"<!-- INSIGHTS:START.*?<!-- INSIGHTS:END -->", re.S)
    if not pattern.search(text):
        raise SystemExit("index.html is missing the INSIGHTS:START / INSIGHTS:END markers")
    home.write_text(pattern.sub(lambda _: teaser(ARTICLES), text), encoding="utf-8")
    print("refreshed homepage teaser")


if __name__ == "__main__":
    main()
