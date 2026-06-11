let protectionEnabled = true;
let actionMode = "warn";
const COMPOSER_INCLUDE_HINTS = [
  "prompt",
  "composer",
  "message",
  "chat",
  "assistant",
  "ask",
  "input",
  "textbox",
  "reply",
  "question",
];
const COMPOSER_EXCLUDE_HINTS = [
  "search",
  "filter",
  "find",
  "topic",
  "subject",
  "title",
  "rename",
];

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
    if (!isEditable(target) || !looksLikeChatComposer(target)) return;

    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const text = clipboardData.getData("text/plain");
    if (!text || text.length < 4) return;

    const findings = scanText(text);
    if (findings.length === 0) return;
    const targetState = captureTargetState(target);

    event.preventDefault();
    event.stopPropagation();

    if (actionMode === "block") {
      showBlockedOverlay(findings);
      return;
    }

    showWarningOverlay(target, targetState, text, findings);
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

function showWarningOverlay(target, targetState, originalText, findings) {
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
    pasteInto(target, maskText(originalText, findings), targetState);
    incrementCaught(findings.length);
  });

  overlay.querySelector("#pg-raw").addEventListener("click", () => {
    removeExistingOverlay();
    pasteInto(target, originalText, targetState);
  });

  overlay.querySelector("#pg-cancel").addEventListener("click", () => {
    removeExistingOverlay();
  });

  overlay.querySelector(".pg-backdrop").addEventListener("click", () => {
    removeExistingOverlay();
  });

  document.addEventListener("keydown", handleEscape);
}

function showBlockedOverlay(findings) {
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

function pasteInto(target, text, targetState) {
  target.focus();

  if (isRichTextEditable(target)) {
    if (!restoreSelection(target, targetState)) return;

    let inserted = false;
    try {
      inserted = document.execCommand("insertText", false, text);
    } catch (_) {}

    if (!inserted) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    target.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }

  if (target.value !== undefined) {
    const start = targetState?.selectionStart ?? target.selectionStart ?? target.value.length ?? 0;
    const end = targetState?.selectionEnd ?? target.selectionEnd ?? start;
    try {
      target.setSelectionRange(start, end);
    } catch (_) {}
    target.setRangeText(text, start, end, "end");
    target.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

function isEditable(element) {
  if (!element) return false;
  const tag = element.tagName?.toLowerCase();
  if (tag === "textarea") return true;
  if (tag === "input") {
    const type = (element.getAttribute("type") || "text").toLowerCase();
    return ["", "text", "search", "url"].includes(type);
  }
  if (isRichTextEditable(element)) return true;
  return false;
}

function looksLikeChatComposer(element) {
  const context = collectElementContext(element);
  const hasIncludeHint = COMPOSER_INCLUDE_HINTS.some((hint) => context.includes(hint));
  const hasExcludeHint = COMPOSER_EXCLUDE_HINTS.some((hint) => context.includes(hint));
  const rect = typeof element.getBoundingClientRect === "function" ? element.getBoundingClientRect() : null;
  const isLargeField = !!rect && rect.width >= 220 && rect.height >= 36;
  const hasNearbySendButton = hasComposerActionNearby(element);
  const tag = element.tagName?.toLowerCase();

  if (tag === "input") {
    if (hasExcludeHint && !hasIncludeHint) return false;
    return hasIncludeHint || hasNearbySendButton;
  }

  if (isRichTextEditable(element)) {
    return hasIncludeHint || hasNearbySendButton || isLargeField;
  }

  return hasIncludeHint || hasNearbySendButton || isLargeField;
}

function collectElementContext(element) {
  const parts = [];
  let current = element;
  let depth = 0;

  while (current && depth < 4) {
    parts.push(
      current.getAttribute?.("aria-label") || "",
      current.getAttribute?.("placeholder") || "",
      current.getAttribute?.("data-testid") || "",
      current.getAttribute?.("name") || "",
      current.getAttribute?.("role") || "",
      current.id || "",
      typeof current.className === "string" ? current.className : ""
    );
    current = current.parentElement;
    depth += 1;
  }

  return parts.join(" ").toLowerCase();
}

function hasComposerActionNearby(element) {
  const root =
    element.closest("form") ||
    element.closest("main") ||
    element.closest('[role="main"]') ||
    element.parentElement;

  if (!root || typeof root.querySelectorAll !== "function") return false;

  const actionHints = ["send", "submit", "chat", "message", "prompt", "ask", "reply"];
  const buttons = root.querySelectorAll("button, [role='button']");

  return Array.from(buttons).some((button) => {
    const text = [
      button.textContent || "",
      button.getAttribute("aria-label") || "",
      button.getAttribute("title") || "",
      button.getAttribute("data-testid") || "",
      button.className || "",
    ]
      .join(" ")
      .toLowerCase();

    return actionHints.some((hint) => text.includes(hint));
  });
}

function captureTargetState(target) {
  if (!target) return null;

  if (isRichTextEditable(target)) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    if (!target.contains(range.commonAncestorContainer)) return null;

    return { range: range.cloneRange() };
  }

  return {
    selectionStart: target.selectionStart ?? target.value?.length ?? 0,
    selectionEnd: target.selectionEnd ?? target.selectionStart ?? 0,
  };
}

function restoreSelection(target, targetState) {
  if (!targetState?.range) return false;

  const selection = window.getSelection();
  if (!selection) return false;

  const range = targetState.range.cloneRange();
  if (!target.contains(range.commonAncestorContainer)) return false;

  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}

function isRichTextEditable(element) {
  if (!element) return false;
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
