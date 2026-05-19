const loading = document.getElementById("loading");
const results = document.getElementById("results");
const error = document.getElementById("error");
const scoreValue = document.getElementById("scoreValue");
const scoreCircle = document.getElementById("scoreCircle");
const pageUrl = document.getElementById("pageUrl");
const checks = document.getElementById("checks");

let scanTimeout = null;

scanPage();

document.getElementById("rescanBtn").addEventListener("click", () => {
  clearTimeout(scanTimeout);
  scanPage();
});

function scanPage() {
  resetUI();

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError || !tabs[0] || !tabs[0].id) {
      showError("Cannot access this tab. Try refreshing the page.");
      return;
    }

    const tabId = tabs[0].id;

    scanTimeout = setTimeout(() => {
      showError("Scan timed out. The page may be loading or blocking scripts. Try refreshing.");
    }, 8000);

    chrome.scripting.executeScript(
      {
        target: { tabId },
        func: runScanner,
      },
      (injectionResults) => {
        clearTimeout(scanTimeout);

        if (chrome.runtime.lastError) {
          showError(
            "Cannot scan this page. It may be a Chrome system page or restricted URL."
          );
          return;
        }

        if (!injectionResults || !injectionResults[0] || !injectionResults[0].result) {
          showError("Scanner returned no data. The page may not be fully loaded.");
          return;
        }

        renderResults(injectionResults[0].result);
      }
    );
  });
}

function resetUI() {
  loading.hidden = false;
  results.hidden = true;
  error.hidden = true;
  scoreValue.textContent = "—";
  pageUrl.textContent = "";
  checks.innerHTML = "";
}

function showError(message) {
  loading.hidden = true;
  results.hidden = true;
  error.hidden = false;
  error.querySelector("p:first-child").textContent = message;
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

  try {
    const title = doc.querySelector("title");
    const titleText = title?.textContent?.trim() || "";
    const titleLen = titleText.length;

    if (!titleText) {
      fail("Title tag", "Missing. Every page needs a <code>&lt;title&gt;</code> tag.", 0);
    } else if (titleLen < 30) {
      warn(
        "Title tag",
        `Too short (${titleLen} chars). Aim for 50–60. Current: "${titleText}"`,
        5
      );
    } else if (titleLen > 70) {
      warn(
        "Title tag",
        `Too long (${titleLen} chars). Aim for 50–60. Current: "${titleText.substring(0, 60)}…"`,
        5
      );
    } else {
      pass("Title tag", `${titleLen} chars — good length. "${titleText}"`, 10);
    }

    const metaDesc = doc.querySelector('meta[name="description"]');
    const descContent = metaDesc?.getAttribute("content")?.trim() || "";
    const descLen = descContent.length;

    if (!descContent) {
      warn(
        "Meta description",
        "Missing. Add a <code>&lt;meta name=\"description\"&gt;</code> tag.",
        5
      );
    } else if (descLen < 50) {
      warn("Meta description", `Too short (${descLen} chars). Aim for 120–160.`, 5);
    } else if (descLen > 160) {
      warn("Meta description", `Too long (${descLen} chars). Aim for 120–160.`, 8);
    } else {
      pass("Meta description", `${descLen} chars — good length.`, 10);
    }

    const h1s = doc.querySelectorAll("h1");
    if (h1s.length === 0) {
      fail(
        "H1 heading",
        "Missing. Every page should have exactly one <code>&lt;h1&gt;</code>.",
        0
      );
    } else if (h1s.length > 1) {
      warn("H1 heading", `Multiple H1s (${h1s.length} found). Use exactly one.`, 5);
    } else {
      pass(
        "H1 heading",
        `One H1 found: "${h1s[0].textContent.trim().substring(0, 60)}"`,
        10
      );
    }

    const h2s = doc.querySelectorAll("h2");
    const h3s = doc.querySelectorAll("h3");
    if (h1s.length > 0 && h2s.length === 0) {
      warn("Heading hierarchy", "No H2s found after H1. Use H2s for sections.", 3);
    } else if (h3s.length > 0 && h2s.length === 0) {
      fail("Heading hierarchy", "H3s found without H2s. Don't skip heading levels.", 0);
    } else if (h2s.length > 0) {
      pass(
        "Heading hierarchy",
        `${h2s.length} H2(s), ${h3s.length} H3(s) — looks structured.`,
        10
      );
    } else if (h1s.length === 0) {
      warn("Heading hierarchy", "No headings found at all.", 3);
    } else {
      pass("Heading hierarchy", "H1 present, no skipped levels detected.", 10);
    }

    const images = doc.querySelectorAll("img");
    const missingAlt = Array.from(images).filter((img) => !img.getAttribute("alt"));
    const altPercent =
      images.length > 0
        ? Math.round(((images.length - missingAlt.length) / images.length) * 100)
        : 100;

    if (images.length === 0) {
      pass("Image alt text", "No images on page — nothing to check.", 10);
    } else if (altPercent === 100) {
      pass("Image alt text", `All ${images.length} images have alt text.`, 10);
    } else if (altPercent >= 80) {
      warn(
        "Image alt text",
        `${missingAlt.length}/${images.length} images missing alt (${altPercent}% covered).`,
        7
      );
    } else {
      fail(
        "Image alt text",
        `${missingAlt.length}/${images.length} images missing alt (only ${altPercent}% covered).`,
        0
      );
    }

    function missingOgTags(ogTitle, ogDesc, ogImage, ogUrl) {
      const names = [];
      if (!ogTitle) names.push("og:title");
      if (!ogDesc) names.push("og:description");
      if (!ogImage) names.push("og:image");
      if (!ogUrl) names.push("og:url");
      return names.join(", ");
    }

    const ogTitle = doc.querySelector('meta[property="og:title"]');
    const ogDesc = doc.querySelector('meta[property="og:description"]');
    const ogImage = doc.querySelector('meta[property="og:image"]');
    const ogUrl = doc.querySelector('meta[property="og:url"]');
    const ogCount = [ogTitle, ogDesc, ogImage, ogUrl].filter(Boolean).length;

    if (ogCount === 4) {
      pass("Open Graph tags", "og:title, og:description, og:image, og:url all present.", 10);
    } else if (ogCount >= 2) {
      warn(
        "Open Graph tags",
        `${ogCount}/4 core OG tags present. Missing: ${missingOgTags(ogTitle, ogDesc, ogImage, ogUrl)}`,
        6
      );
    } else {
      warn(
        "Open Graph tags",
        "Missing or incomplete. Add OG tags for better social sharing previews.",
        3
      );
    }

    const twitterCard = doc.querySelector('meta[name="twitter:card"]');
    const twitterTitle = doc.querySelector('meta[name="twitter:title"]');
    const twitterDesc = doc.querySelector('meta[name="twitter:description"]');
    const twitterImage = doc.querySelector('meta[name="twitter:image"]');
    const twCount = [twitterCard, twitterTitle, twitterDesc, twitterImage].filter(Boolean).length;

    if (twCount >= 3) {
      pass("Twitter Card", `${twCount}/4 Twitter Card tags present.`, 10);
    } else if (twCount >= 1) {
      warn(
        "Twitter Card",
        `Only ${twCount}/4 Twitter Card tags. Add card, title, description, and image.`,
        5
      );
    } else {
      warn("Twitter Card", "No Twitter Card tags. Add for better Twitter link previews.", 3);
    }

    const canonical = doc.querySelector('link[rel="canonical"]');
    const canonicalHref = canonical?.getAttribute("href") || "";

    if (!canonicalHref) {
      warn(
        "Canonical URL",
        "Missing. Add <code>&lt;link rel=\"canonical\"&gt;</code> to avoid duplicate content.",
        5
      );
    } else {
      pass(
        "Canonical URL",
        `Present: <code>${canonicalHref.substring(0, 50)}</code>`,
        10
      );
    }

    const robots = doc.querySelector('meta[name="robots"]');
    const robotsContent = robots?.getAttribute("content") || "";
    if (!robotsContent) {
      pass("Robots meta", "No robots meta tag — defaults to index, follow.", 10);
    } else if (robotsContent.includes("noindex")) {
      warn(
        "Robots meta",
        "Page is set to <code>noindex</code>. Search engines won't index it.",
        5
      );
    } else {
      pass("Robots meta", `Set to: <code>${robotsContent}</code>`, 10);
    }

    const jsonLd = doc.querySelectorAll('script[type="application/ld+json"]');
    if (jsonLd.length === 0) {
      warn(
        "Structured data",
        "No JSON-LD found. Add structured data for rich results in search.",
        4
      );
    } else {
      let types = [];
      try {
        types = Array.from(jsonLd)
          .map((el) => JSON.parse(el.textContent))
          .filter(Boolean)
          .map((d) => d["@type"] || d["@graph"] ? "Graph" : "Unknown");
      } catch (_) {}
      pass(
        "Structured data",
        `${jsonLd.length} JSON-LD block(s) found${types.length ? ": " + types.slice(0, 3).join(", ") : ""}.`,
        10
      );
    }

    const viewport = doc.querySelector('meta[name="viewport"]');
    if (!viewport) {
      fail(
        "Mobile viewport",
        "Missing <code>&lt;meta name=\"viewport\"&gt;</code>. Page may not be mobile-friendly.",
        0
      );
    } else {
      const vpContent = viewport.getAttribute("content") || "";
      if (vpContent.includes("width=device-width")) {
        pass("Mobile viewport", "Present with width=device-width — mobile-friendly.", 10);
      } else {
        warn("Mobile viewport", "Found but missing width=device-width.", 5);
      }
    }

    const htmlLang = doc.documentElement.getAttribute("lang");
    if (!htmlLang) {
      warn(
        "Language",
        'Missing <code>lang</code> attribute on <code>&lt;html&gt;</code>. Add for accessibility and SEO.',
        5
      );
    } else {
      pass("Language", `Set to <code>${htmlLang}</code>.`, 10);
    }

    const totalPoints = results.reduce((sum, r) => sum + r.points, 0);
    const maxPoints = results.length * 10;
    const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

    return { score, url: doc.location.href, results };
  } catch (e) {
    return {
      score: 0,
      url: doc.location.href,
      results: [
        {
          name: "Scanner error",
          status: "fail",
          detail: `Could not complete scan: ${e.message}. The page may have restricted access to its DOM.`,
          points: 0,
        },
      ],
    };
  }
}

function renderResults(data) {
  loading.hidden = true;
  error.hidden = true;
  results.hidden = false;

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
