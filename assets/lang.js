/* Pick the page language before anything renders.
 * Order: an explicit choice (?lang=en|es, or the EN/ES switcher, remembered in
 * localStorage) → the browser's preferred languages → a Spanish-speaking time zone.
 * Each page lists its counterparts as <link rel="alternate" hreflang data-local>,
 * so this works on the live site and when the files are opened locally.
 * Crawlers and link-preview bots are never redirected, so each language is indexed as published. */
(function () {
  var BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|telegram/i;
  var SPANISH_TZ = /^(Europe\/Madrid|Atlantic\/Canary|Africa\/Ceuta|Pacific\/(Galapagos|Easter)|America\/(Mexico_City|Cancun|Merida|Monterrey|Matamoros|Chihuahua|Ciudad_Juarez|Ojinaga|Hermosillo|Mazatlan|Bahia_Banderas|Tijuana|Bogota|Lima|Santiago|Punta_Arenas|Argentina\/.+|Buenos_Aires|Caracas|Montevideo|Asuncion|La_Paz|Guayaquil|Guatemala|Costa_Rica|Panama|El_Salvador|Tegucigalpa|Managua|Santo_Domingo|Havana|Puerto_Rico))$/;
  var page = (document.documentElement.lang || "en").slice(0, 2);
  var alt = {};
  var links = document.querySelectorAll('link[rel="alternate"][hreflang][data-local]');
  for (var i = 0; i < links.length; i++) alt[links[i].getAttribute("hreflang")] = links[i].getAttribute("data-local");

  if (BOT.test(navigator.userAgent || "")) return;

  var want = null;
  try {
    var q = new URLSearchParams(location.search).get("lang");
    if (q === "en" || q === "es") { localStorage.setItem("zs-lang", q); want = q; }
    else want = localStorage.getItem("zs-lang");
  } catch (e) { /* storage blocked: fall through to detection */ }

  if (want !== "en" && want !== "es") {
    var prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    for (var j = 0; j < prefs.length && !want; j++) {
      var code = String(prefs[j]).slice(0, 2).toLowerCase();
      if (code === "es" || code === "en") want = code;
    }
    if (!want) {
      try { if (SPANISH_TZ.test(Intl.DateTimeFormat().resolvedOptions().timeZone || "")) want = "es"; } catch (e) { /* no Intl */ }
    }
  }

  if (want && want !== page && alt[want]) location.replace(alt[want] + location.hash);
})();
