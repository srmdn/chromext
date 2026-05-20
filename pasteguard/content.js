let protectionEnabled = true;
let actionMode = "warn";

try {
  chrome.storage.sync.get({ enabled: true, action: "warn" }, (data) => {
    try {
      protectionEnabled = data.enabled;
      actionMode = data.action;
      if (protectionEnabled) attachListeners();
    } catch (_) {}
  });
} catch (_) {}

chrome.storage.onChanged.addListener((changes) => {
  try {
    if (changes.enabled) {
      protectionEnabled = changes.enabled.newValue;
      if (protectionEnabled) {
        attachListeners();
      } else {
        detachListeners();
      }
    }
    if (changes.action) {
      actionMode = changes.action.newValue;
    }
  } catch (_) {}
});

let pasteHandler = null;

function attachListeners() {
  if (pasteHandler) return;
  pasteHandler = handlePaste;
  document.addEventListener("paste", pasteHandler, true);
}

function detachListeners() {
  if (!pasteHandler) return;
  document.removeEventListener("paste", pasteHandler, true);
  pasteHandler = null;
}

function handlePaste(event) {
  try {
    const target = event.target;
    if (!isEditable(target)) return;

    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const text = clipboardData.getData("text/plain");
    if (!text || text.length < 4) return;

    const findings = scanText(text);
    if (findings.length === 0) return;

    event.preventDefault();
    event.stopPropagation();

    if (actionMode === "block") {
      showBlockedOverlay(target, findings);
      return;
    }

    showWarningOverlay(target, text, findings);
  } catch (_) {}
}

function scanText(text) {
  const findings = [];

  for (const rule of PATTERNS) {
    const pattern = rule.pattern;
    pattern.lastIndex = 0;

    let match;
    while ((match = pattern.exec(text)) !== null) {
      const value = match[rule.maskGroup] || match[0];

      if (rule.condition && !rule.condition(match)) continue;

      let start = match.index;
      if (rule.maskGroup > 1) {
        const offset = match[0].indexOf(value);
        if (offset !== -1) start += offset;
      }

      if (findings.some((f) => f.start === start && f.value === value))
        continue;

      const displayValue =
        value.length > 40 ? value.substring(0, 20) + "..." + value.slice(-10) : value;

      findings.push({
        rule: rule.name,
        value: value,
        display: displayValue,
        start: start,
      });
    }
  }

  return findings;
}

function maskText(text, findings) {
  const ranges = findings
    .map((f) => ({ start: f.start, end: f.start + f.value.length }))
    .sort((a, b) => a.start - b.start);

  const merged = [];
  for (const r of ranges) {
    if (merged.length === 0) {
      merged.push(r);
      continue;
    }
    const last = merged[merged.length - 1];
    if (r.start <= last.end) {
      last.end = Math.max(last.end, r.end);
    } else {
      merged.push(r);
    }
  }

  let masked = text;
  for (const r of merged.reverse()) {
    masked = masked.substring(0, r.start) + "[REDACTED]" + masked.substring(r.end);
  }
  return masked;
}

function showWarningOverlay(target, originalText, findings) {
  removeExistingOverlay();

  const overlay = document.createElement("div");
  overlay.id = "pasteguard-overlay";
  overlay.innerHTML = `
    <div class="pg-backdrop"></div>
    <div class="pg-dialog">
      <div class="pg-icon">&#128737;</div>
      <h3 class="pg-title">PasteGuard: Secrets Detected</h3>
      <p class="pg-subtitle">Your paste contains ${findings.length} potential secret${findings.length > 1 ? "s" : ""}</p>
      <ul class="pg-findings">
        ${findings
          .map(
            (f) =>
              `<li><span class="pg-rule-badge">${f.rule}</span> <code class="pg-value">${f.display}</code></li>`
          )
          .join("")}
      </ul>
      <div class="pg-actions">
        <button class="pg-btn pg-btn-mask" id="pg-mask">Mask Secrets &amp; Paste</button>
        <button class="pg-btn pg-btn-raw" id="pg-raw">Paste Anyway</button>
        <button class="pg-btn pg-btn-cancel" id="pg-cancel">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector("#pg-mask").addEventListener("click", () => {
    removeExistingOverlay();
    incrementCaught(findings.length);
    pasteInto(target, maskText(originalText, findings));
  });

  overlay.querySelector("#pg-raw").addEventListener("click", () => {
    removeExistingOverlay();
    pasteInto(target, originalText);
  });

  overlay.querySelector("#pg-cancel").addEventListener("click", () => {
    removeExistingOverlay();
  });

  overlay.querySelector(".pg-backdrop").addEventListener("click", () => {
    removeExistingOverlay();
  });

  document.addEventListener("keydown", handleEscape);
}

function showBlockedOverlay(target, findings) {
  removeExistingOverlay();

  const overlay = document.createElement("div");
  overlay.id = "pasteguard-overlay";
  overlay.innerHTML = `
    <div class="pg-backdrop"></div>
    <div class="pg-dialog">
      <div class="pg-icon">&#128683;</div>
      <h3 class="pg-title">Paste Blocked</h3>
      <p class="pg-subtitle">${findings.length} secret${findings.length > 1 ? "s" : ""} detected. Paste was blocked.</p>
      <ul class="pg-findings">
        ${findings
          .map(
            (f) =>
              `<li><span class="pg-rule-badge">${f.rule}</span> <code class="pg-value">${f.display}</code></li>`
          )
          .join("")}
      </ul>
      <div class="pg-actions">
        <button class="pg-btn pg-btn-cancel" id="pg-dismiss">Dismiss</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  incrementCaught(findings.length);

  overlay.querySelector("#pg-dismiss").addEventListener("click", () => {
    removeExistingOverlay();
  });
  overlay.querySelector(".pg-backdrop").addEventListener("click", () => {
    removeExistingOverlay();
  });
  document.addEventListener("keydown", handleEscape);
}

function handleEscape(e) {
  if (e.key === "Escape") {
    removeExistingOverlay();
    document.removeEventListener("keydown", handleEscape);
  }
}

function removeExistingOverlay() {
  const existing = document.getElementById("pasteguard-overlay");
  if (existing) existing.remove();
  document.removeEventListener("keydown", handleEscape);
}

function pasteInto(target, text) {
  target.focus();
  const start = target.selectionStart ?? target.value?.length ?? 0;
  const end = target.selectionEnd ?? start;

  if (target.isContentEditable || target.getAttribute("contenteditable") === "true") {
    document.execCommand("insertText", false, text);
  } else if (target.value !== undefined) {
    target.setRangeText(text, start, end, "end");
    target.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

function isEditable(element) {
  if (!element) return false;
  const tag = element.tagName?.toLowerCase();
  if (tag === "textarea" || tag === "input") return true;
  if (element.isContentEditable) return true;
  if (element.getAttribute("contenteditable") === "true") return true;
  if (element.getAttribute("role") === "textbox") return true;
  return false;
}

function incrementCaught(count) {
  try {
    chrome.storage.local.get({ caught: 0 }, (data) => {
      chrome.storage.local.set({ caught: data.caught + count });
    });
  } catch (_) {}
}
