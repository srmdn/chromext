const loading = document.getElementById("loading");
const results = document.getElementById("results");
const error = document.getElementById("error");
const scoreValue = document.getElementById("scoreValue");
const scoreCircle = document.getElementById("scoreCircle");
const pageUrl = document.getElementById("pageUrl");
const checks = document.getElementById("checks");

scanPage();

document.getElementById("rescanBtn").addEventListener("click", scanPage);

function scanPage() {
  loading.hidden = false;
  results.hidden = true;
  error.hidden = true;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0] || !tabs[0].id) {
      showError();
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: runScanner,
      },
      (injectionResults) => {
        if (chrome.runtime.lastError || !injectionResults || !injectionResults[0]) {
          showError();
          return;
        }
        renderResults(injectionResults[0].result);
      }
    );
  });
}

function runScanner() {
  const doc = document;
  const results = [];

  function pass(name, detail, points) {
    results.push({ name, status: "pass", detail, points });
  }

  function warn(name, detail, points) {
    results.push({ name, status: "warn", detail, points });
  }

  function fail(name, detail, points) {
    results.push({ name, status: "fail", detail, points });
  }

  const title = doc.querySelector("title");
  const titleText = title?.textContent?.trim() || "";
  const titleLen = titleText.length;

  if (!titleText) {
    fail("Title tag", "Missing. Every page needs a <code>&lt;title&gt;</code> tag.", 0);
  } else if (titleLen < 30) {
    warn("Title tag", `Too short (${titleLen} chars). Aim for 50–60. Current: "${titleText}"`, 5);
  } else if (titleLen > 70) {
    warn("Title tag", `Too long (${titleLen} chars). Aim for 50–60. Current: "${titleText.substring(0, 60)}…"`, 5);
  } else {
    pass("Title tag", `${titleLen} chars — good length. "${titleText}"`, 10);
  }

  const metaDesc = doc.querySelector('meta[name="description"]');
  const descContent = metaDesc?.getAttribute("content")?.trim() || "";
  const descLen = descContent.length;

  if (!descContent) {
    warn("Meta description", "Missing. Add a <code>&lt;meta name=\"description\"&gt;</code> tag.", 5);
  } else if (descLen < 50) {
    warn("Meta description", `Too short (${descLen} chars). Aim for 120–160.`, 5);
  } else if (descLen > 160) {
    warn("Meta description", `Too long (${descLen} chars). Aim for 120–160.`, 8);
  } else {
    pass("Meta description", `${descLen} chars — good length.`, 10);
  }

  const h1s = doc.querySelectorAll("h1");
  if (h1s.length === 0) {
    fail("H1 heading", "Missing. Every page should have exactly one <code>&lt;h1&gt;</code>.", 0);
  } else if (h1s.length > 1) {
    warn("H1 heading", `Multiple H1s (${h1s.length} found). Use exactly one.`, 5);
  } else {
    pass("H1 heading", `One H1 found: "${h1s[0].textContent.trim().substring(0, 60)}"`, 10);
  }

  const h2s = doc.querySelectorAll("h2");
  const h3s = doc.querySelectorAll("h3");
  if (h1s.length > 0 && h2s.length === 0) {
    warn("Heading hierarchy", "No H2s found after H1. Use H2s for sections.", 3);
  } else if (h3s.length > 0 && h2s.length === 0) {
    fail("Heading hierarchy", "H3s found without H2s. Don't skip heading levels.", 0);
  } else if (h2s.length > 0) {
    pass("Heading hierarchy", `${h2s.length} H2(s), ${h3s.length} H3(s) — looks structured.`, 10);
  } else if (h1s.length === 0) {
    warn("Heading hierarchy", "No headings found at all.", 3);
  } else {
    pass("Heading hierarchy", "H1 present, no skipped levels detected.", 10);
  }

  const images = doc.querySelectorAll("img");
  const missingAlt = Array.from(images).filter((img) => !img.getAttribute("alt"));
  const altPercent = images.length > 0 ? Math.round(((images.length - missingAlt.length) / images.length) * 100) : 100;

  if (images.length === 0) {
    pass("Image alt text", "No images on page — nothing to check.", 10);
  } else if (altPercent === 100) {
    pass("Image alt text", `All ${images.length} images have alt text.`, 10);
  } else if (altPercent >= 80) {
    warn(
      "Image alt text",
      `${missingAlt.length}/${images.length} images missing alt text (${altPercent}% covered).`,
      7
    );
  } else {
    fail(
      "Image alt text",
      `${missingAlt.length}/${images.length} images missing alt text (only ${altPercent}% covered).`,
      0
    );
  }

  const ogTitle = doc.querySelector('meta[property="og:title"]');
  const ogDesc = doc.querySelector('meta[property="og:description"]');
  const ogImage = doc.querySelector('meta[property="og:image"]');
  const ogUrl = doc.querySelector('meta[property="og:url"]');
  const ogCount = [ogTitle, ogDesc, ogImage, ogUrl].filter(Boolean).length;

  if (ogCount === 4) {
    pass("Open Graph tags", "og:title, og:description, og:image, og:url all present.", 10);
  } else if (ogCount >= 2) {
    warn("Open Graph tags", `${ogCount}/4 core OG tags present. Missing: ${missingOgTags(ogTitle, ogDesc, ogImage, ogUrl)}`, 6);
  } else if (ogCount === 1) {
    warn("Open Graph tags", `Only 1/4 core OG tags present. Add og:title, description, image, and url.`, 3);
  } else {
    warn("Open Graph tags", "Missing. Add OG tags for better social sharing previews.", 3);
  }

  const twitterCard = doc.querySelector('meta[name="twitter:card"]');
  const twitterTitle = doc.querySelector('meta[name="twitter:title"]');
  const twitterDesc = doc.querySelector('meta[name="twitter:description"]');
  const twitterImage = doc.querySelector('meta[name="twitter:image"]');
  const twCount = [twitterCard, twitterTitle, twitterDesc, twitterImage].filter(Boolean).length;

  if (twCount >= 3) {
    pass("Twitter Card", `${twCount}/4 Twitter Card tags present.`, 10);
  } else if (twCount >= 1) {
    warn("Twitter Card", `Only ${twCount}/4 Twitter Card tags. Add card, title, description, and image.`, 5);
  } else {
    warn("Twitter Card", "No Twitter Card tags. Add for better Twitter link previews.", 3);
  }

  const canonical = doc.querySelector('link[rel="canonical"]');
  const canonicalHref = canonical?.getAttribute("href") || "";
  const currentUrl = doc.location.href;

  if (!canonicalHref) {
    warn("Canonical URL", "Missing. Add <code>&lt;link rel=\"canonical\"&gt;</code> to avoid duplicate content issues.", 5);
  } else if (canonicalHref === currentUrl || canonicalHref === currentUrl.replace(/\/$/, "")) {
    pass("Canonical URL", "Present and self-referencing — good.", 10);
  } else {
    pass("Canonical URL", `Present: <code>${canonicalHref.substring(0, 40)}…</code>`, 10);
  }

  const robots = doc.querySelector('meta[name="robots"]');
  const robotsContent = robots?.getAttribute("content") || "";
  if (!robotsContent) {
    pass("Robots meta", "No robots meta — defaults to index, follow. Fine.", 10);
  } else if (robotsContent.includes("noindex")) {
    warn("Robots meta", "Page is set to <code>noindex</code>. Search engines won't index it.", 5);
  } else {
    pass("Robots meta", `Set to: <code>${robotsContent}</code>`, 10);
  }

  const jsonLd = doc.querySelectorAll('script[type="application/ld+json"]');
  if (jsonLd.length === 0) {
    warn("Structured data", "No JSON-LD found. Add structured data for rich results.", 4);
  } else {
    let types = [];
    try {
      types = Array.from(jsonLd)
        .map((el) => JSON.parse(el.textContent))
        .map((d) => (d["@type"] || "Unknown"));
    } catch (_) {}
    pass(
      "Structured data",
      `${jsonLd.length} JSON-LD block(s) found${types.length ? ": " + types.join(", ") : ""}.`,
      10
    );
  }

  const viewport = doc.querySelector('meta[name="viewport"]');
  if (!viewport) {
    fail("Mobile viewport", "Missing <code>&lt;meta name=\"viewport\"&gt;</code>. Page may not be mobile-friendly.", 0);
  } else {
    const vpContent = viewport.getAttribute("content") || "";
    if (vpContent.includes("width=device-width")) {
      pass("Mobile viewport", "Present with width=device-width — mobile-friendly.", 10);
    } else {
      warn("Mobile viewport", `Found but missing width=device-width.`, 5);
    }
  }

  const htmlLang = doc.documentElement.getAttribute("lang");
  if (!htmlLang) {
    warn("Language", 'Missing <code>lang</code> attribute on <code>&lt;html&gt;</code>. Add for accessibility and SEO.', 5);
  } else {
    pass("Language", `Set to <code>${htmlLang}</code>.`, 10);
  }

  const totalPoints = results.reduce((sum, r) => sum + r.points, 0);
  const maxPoints = results.length * 10;
  const score = Math.round((totalPoints / maxPoints) * 100);

  return { score, url: doc.location.href, results };
}

function missingOgTags(title, desc, image, url) {
  const names = [];
  if (!title) names.push("og:title");
  if (!desc) names.push("og:description");
  if (!image) names.push("og:image");
  if (!url) names.push("og:url");
  return names.join(", ");
}

function renderResults(data) {
  loading.hidden = true;
  results.hidden = false;
  error.hidden = true;

  scoreValue.textContent = data.score;
  pageUrl.textContent = data.url;

  scoreCircle.classList.remove("good", "warn", "bad");
  if (data.score >= 80) scoreCircle.classList.add("good");
  else if (data.score >= 60) scoreCircle.classList.add("warn");
  else scoreCircle.classList.add("bad");

  checks.innerHTML = data.results
    .map(
      (r) => `
    <div class="check-item">
      <div class="check-header">
        <span class="check-name">${r.name}</span>
        <span class="check-status ${r.status}">${r.status === "pass" ? "✓ Pass" : r.status === "warn" ? "⚠ Warn" : "✗ Fail"}</span>
      </div>
      <div class="check-detail">${r.detail}</div>
    </div>`
    )
    .join("");
}

function showError() {
  loading.hidden = true;
  results.hidden = true;
  error.hidden = false;
}
