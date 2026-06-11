(function () {
  "use strict";

  var tooltip, active = false, currentEl, currentSelectorInfo, lastHighlighted, lastOutline, lastOutlineOffset;
  var SELECTOR_QUALITY = {
    stable: "Stable",
    decent: "Decent",
    fragile: "Fragile"
  };
  var SELECTOR_REASON = {
    id: "Unique id",
    data: "Unique test attribute",
    class: "Unique class selector",
    anchored: "Anchored to stable parent",
    fallback: "DOM path fallback"
  };

  function escapeSelectorPart(value) {
    if (window.CSS && typeof window.CSS.escape === "function") {
      return window.CSS.escape(value);
    }
    return String(value).replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");
  }

  function isUniqueSelector(selector) {
    try {
      return !!selector && document.querySelectorAll(selector).length === 1;
    } catch (_) {
      return false;
    }
  }

  function escapeAttributeValue(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  function buildFullCSSSelector(el) {
    if (!el || el === document.body || el === document.documentElement) return el?.tagName?.toLowerCase() || "";
    var path = [];
    var current = el;
    while (current && current !== document.body && current !== document.documentElement) {
      var tag = current.tagName.toLowerCase();
      var segment = tag;
      if (current.id) {
        segment += "#" + escapeSelectorPart(current.id);
        path.unshift(segment);
        return path.join(" > ");
      }

      var siblings = Array.from(current.parentNode?.children || []).filter(
        function (c) { return c.tagName === current.tagName; }
      );
      if (siblings.length > 1) {
        var idx = siblings.indexOf(current) + 1;
        segment += ":nth-of-type(" + idx + ")";
      }
      path.unshift(segment);
      if (isUniqueSelector(path.join(" > "))) {
        return path.join(" > ");
      }

      if (path.length >= 6) break;
      current = current.parentNode;
    }
    return path.join(" > ");
  }

  function getMeaningfulClasses(el) {
    return Array.from(el.classList || []).filter(function (cls) {
      if (!cls || cls.startsWith("cp-")) return false;
      if (!/^[A-Za-z0-9_-]+$/.test(cls)) return false;
      if (cls.length < 2) return false;
      return true;
    }).sort(function (a, b) {
      return scoreClassName(b) - scoreClassName(a);
    });
  }

  function scoreClassName(cls) {
    var score = 0;
    if (/[A-Za-z]/.test(cls)) score += 2;
    if (!/\d{3,}/.test(cls)) score += 2;
    if (cls.indexOf("-") !== -1 || cls.indexOf("_") !== -1) score += 1;
    if (/^(btn|card|nav|menu|modal|input|header|footer|title|content|hero|sidebar|panel|item|link|image|icon|form|field)/i.test(cls)) {
      score += 2;
    }
    if (/^(css-|jsx-|sc-|tw-|w-|h-|mt-|mb-|ml-|mr-|px-|py-|text-|bg-|border-|flex|grid)/.test(cls)) {
      score -= 2;
    }
    if (/(?:^|[-_])\d{4,}(?:$|[-_])/.test(cls) || /[A-Za-z_-]\d{4,}$/.test(cls)) {
      score -= 4;
    }
    if (/^(gb-|wp-|post-|page-|block-)/.test(cls) && /\d{4,}/.test(cls)) {
      score -= 2;
    }
    return score;
  }

  function getReusableClasses(el, minScore) {
    return getMeaningfulClasses(el).filter(function (cls) {
      return scoreClassName(cls) >= minScore;
    });
  }

  function getStableAnchorSelector(el) {
    if (!el) return null;
    var tag = el.tagName.toLowerCase();

    if (el.id) {
      var idSelector = "#" + escapeSelectorPart(el.id);
      if (isUniqueSelector(idSelector)) {
        return { selector: idSelector, quality: "stable", reason: "id" };
      }
    }

    var attrNames = ["data-testid", "data-test", "data-qa", "aria-label", "name"];
    for (var i = 0; i < attrNames.length; i += 1) {
      var attrName = attrNames[i];
      var attrValue = el.getAttribute(attrName);
      if (!attrValue || attrValue.length > 60) continue;
      var attrSelector = tag + "[" + attrName + '="' + escapeAttributeValue(attrValue) + '"]';
      if (isUniqueSelector(attrSelector)) {
        return { selector: attrSelector, quality: attrName.indexOf("data-") === 0 ? "stable" : "decent", reason: "data" };
      }
    }

    var classes = getReusableClasses(el, 3).slice(0, 3);
    for (var j = 0; j < classes.length; j += 1) {
      var classSelector = "." + escapeSelectorPart(classes[j]);
      if (isUniqueSelector(classSelector)) {
        return { selector: classSelector, quality: "decent", reason: "class" };
      }
      var typedClassSelector = tag + classSelector;
      if (isUniqueSelector(typedClassSelector)) {
        return { selector: typedClassSelector, quality: "decent", reason: "class" };
      }
    }

    if (classes.length >= 2) {
      var comboSelector = tag + "." + escapeSelectorPart(classes[0]) + "." + escapeSelectorPart(classes[1]);
      if (isUniqueSelector(comboSelector)) {
        return { selector: comboSelector, quality: "decent", reason: "class" };
      }
    }

    return null;
  }

  function buildAnchoredSelector(anchorSelector, el) {
    var tag = el.tagName.toLowerCase();
    var classes = getReusableClasses(el, 2).slice(0, 2);
    var candidates = [];

    if (classes[0] && classes[1]) {
      candidates.push(anchorSelector + " " + tag + "." + escapeSelectorPart(classes[0]) + "." + escapeSelectorPart(classes[1]));
    }
    if (classes[0]) {
      candidates.push(anchorSelector + " " + tag + "." + escapeSelectorPart(classes[0]));
    }
    candidates.push(anchorSelector + " " + tag);

    for (var i = 0; i < candidates.length; i += 1) {
      if (isUniqueSelector(candidates[i])) {
        return candidates[i];
      }
    }

    return null;
  }

  function buildSelectorInfo(el) {
    var fullSelector = buildFullCSSSelector(el);
    var direct = getStableAnchorSelector(el);
    var current = el.parentElement;
    var anchoredSelector = null;

    while (current && current !== document.body && current !== document.documentElement) {
      var anchor = getStableAnchorSelector(current);
      if (anchor) {
        anchoredSelector = buildAnchoredSelector(anchor.selector, el);
        if (anchoredSelector) {
          break;
        }
      }
      current = current.parentElement;
    }

    if (direct && !(direct.reason === "class" && anchoredSelector)) {
      return {
        bestSelector: direct.selector,
        fullSelector: fullSelector,
        quality: direct.quality,
        reason: direct.reason
      };
    }

    if (anchoredSelector) {
      return {
        bestSelector: anchoredSelector,
        fullSelector: fullSelector,
        quality: "decent",
        reason: "anchored"
      };
    }

    if (direct) {
      return {
        bestSelector: direct.selector,
        fullSelector: fullSelector,
        quality: direct.quality,
        reason: direct.reason
      };
    }

    return {
      bestSelector: fullSelector,
      fullSelector: fullSelector,
      quality: "fragile",
      reason: "fallback"
    };
  }

  function buildBreadcrumb(el) {
    var parts = [];
    var current = el;
    while (current && current !== document.body && current !== document.documentElement) {
      var tag = current.tagName.toLowerCase();
      if (current.id) {
        parts.unshift("#" + current.id);
        break;
      }
      if (current.className && typeof current.className === "string") {
        var cls = current.className.trim().split(/\s+/)[0];
        if (cls && !cls.startsWith("cp-")) parts.unshift("." + cls);
        else parts.unshift(tag);
      } else {
        parts.unshift(tag);
      }
      current = current.parentNode;
    }
    return parts.join(" > ");
  }

  function px(val) {
    return typeof val === "number" ? Math.round(val) + "px" : val;
  }

  function shortHex(color) {
    if (!color || color === "rgba(0, 0, 0, 0)" || color === "transparent") return "\u2014";
    return color;
  }

  function highlight(el) {
    if (lastHighlighted === el) return;
    clearHighlight();
    lastHighlighted = el;
    lastOutline = el.style.outline;
    lastOutlineOffset = el.style.outlineOffset;
    el.style.outline = "2px solid #7c4dff";
    el.style.outlineOffset = "-1px";
  }

  function clearHighlight() {
    if (lastHighlighted) {
      lastHighlighted.style.outline = lastOutline;
      lastHighlighted.style.outlineOffset = lastOutlineOffset;
      lastHighlighted = null;
      lastOutline = "";
      lastOutlineOffset = "";
    }
  }

  function updateTooltipContent(el) {
    if (!el || !tooltip) return;
    var style = getComputedStyle(el);
    var tag = el.tagName.toLowerCase();
    var cls = el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "";
    var id = el.id ? "#" + el.id : "";
    currentSelectorInfo = buildSelectorInfo(el);
    var qualityLabel = SELECTOR_QUALITY[currentSelectorInfo.quality] || SELECTOR_QUALITY.fragile;
    var reasonLabel = SELECTOR_REASON[currentSelectorInfo.reason] || SELECTOR_REASON.fallback;

    tooltip.innerHTML =
      '<div class="cp-header">' +
        '<span class="cp-breadcrumb">' + buildBreadcrumb(el) + '</span>' +
        '<span class="cp-tag">' + tag + id + '</span>' +
        '<span class="cp-classes">' + cls + '</span>' +
      '</div>' +
      '<div class="cp-selector-block">' +
        '<div class="cp-selector-meta">' +
          '<span class="cp-selector-label">Best selector</span>' +
          '<span class="cp-quality cp-quality-' + currentSelectorInfo.quality + '">' + qualityLabel + '</span>' +
        '</div>' +
        '<code class="cp-selector-code">' + currentSelectorInfo.bestSelector + '</code>' +
        '<div class="cp-selector-reason">' + reasonLabel + '</div>' +
      '</div>' +
      '<div class="cp-section">' +
        '<div class="cp-row"><span>Display</span><span>' + style.display + '</span></div>' +
        '<div class="cp-row"><span>Size</span><span>' + el.offsetWidth + ' \u00d7 ' + el.offsetHeight + '</span></div>' +
        '<div class="cp-row"><span>Position</span><span>' + style.position + '</span></div>' +
      '</div>' +
      '<div class="cp-section cp-box">' +
        '<div class="cp-box-label">Box Model</div>' +
        '<div class="cp-box-row"><span>M</span><span>' + px(style.marginTop) + ' ' + px(style.marginRight) + ' ' + px(style.marginBottom) + ' ' + px(style.marginLeft) + '</span></div>' +
        '<div class="cp-box-row"><span>B</span><span>' + px(style.borderTopWidth) + ' ' + px(style.borderRightWidth) + ' ' + px(style.borderBottomWidth) + ' ' + px(style.borderLeftWidth) + '</span></div>' +
        '<div class="cp-box-row"><span>P</span><span>' + px(style.paddingTop) + ' ' + px(style.paddingRight) + ' ' + px(style.paddingBottom) + ' ' + px(style.paddingLeft) + '</span></div>' +
      '</div>' +
      '<div class="cp-section">' +
        '<div class="cp-row"><span>Font</span><span>' + style.fontFamily.split(",")[0].replace(/['"]/g, "") + ' ' + style.fontSize + '/' + style.lineHeight + '</span></div>' +
        '<div class="cp-row"><span>Weight</span><span>' + style.fontWeight + '</span></div>' +
        '<div class="cp-row"><span>Color</span><span><span class="cp-swatch" style="background:' + style.color + '"></span>' + shortHex(style.color) + '</span></div>' +
        '<div class="cp-row"><span>BG</span><span><span class="cp-swatch" style="background:' + style.backgroundColor + '"></span>' + shortHex(style.backgroundColor) + '</span></div>' +
      '</div>' +
      '<div class="cp-footer">\u2191\u2193\u2190\u2192 nav  \u2022  click copy best  \u2022  shift+click full  \u2022  esc stop</div>';
  }

  function positionTooltipToElement(el) {
    if (!tooltip || !el) return;
    var rect = el.getBoundingClientRect();
    var x = rect.right + 8;
    var y = rect.top;
    var tw = tooltip.offsetWidth;
    var th = tooltip.offsetHeight;
    if (x + tw > window.innerWidth) x = rect.left - tw - 8;
    if (y + th > window.innerHeight) y = window.innerHeight - th - 8;
    if (x < 0) x = 8;
    if (y < 0) y = 8;
    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
    tooltip.style.display = "block";
  }

  function positionTooltipAtMouse(e) {
    var x = e.clientX + 16;
    var y = e.clientY + 16;
    var tw = tooltip.offsetWidth;
    var th = tooltip.offsetHeight;
    if (x + tw > window.innerWidth) x = e.clientX - tw - 16;
    if (y + th > window.innerHeight) y = e.clientY - th - 16;
    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
    tooltip.style.display = "block";
  }

  function hideTooltip() {
    if (tooltip) tooltip.style.display = "none";
  }

  function onMouseMove(e) {
    if (!active) return;
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === tooltip || (tooltip && tooltip.contains(el))) return;
    if (currentEl === el) {
      positionTooltipAtMouse(e);
      return;
    }
    currentEl = el;
    highlight(currentEl);
    updateTooltipContent(currentEl);
    positionTooltipAtMouse(e);
  }

  function onClick(e) {
    if (!active) return;
    if (tooltip && (e.target === tooltip || tooltip.contains(e.target))) return;
    if (!currentEl) return;
    e.preventDefault();
    e.stopPropagation();
    var selectorInfo = currentSelectorInfo || buildSelectorInfo(currentEl);
    var sel = e.shiftKey ? selectorInfo.fullSelector : selectorInfo.bestSelector;
    var modeLabel = e.shiftKey ? "Full path copied!" : "Best selector copied!";
    navigator.clipboard.writeText(sel).then(function () {
      if (!tooltip) return;
      tooltip.innerHTML = '<div class="cp-section" style="text-align:center;padding:12px">' + modeLabel + '<br><span style="font-size:11px;color:#9aa0a6">' + sel + '</span></div>';
      var t = tooltip;
      setTimeout(function () { t.style.display = "none"; }, 1500);
    }).catch(function () {
      if (!tooltip) return;
      tooltip.innerHTML = '<div class="cp-section" style="text-align:center;padding:12px">Copy failed<br><span style="font-size:11px;color:#9aa0a6">Clipboard access was blocked</span></div>';
      var t = tooltip;
      setTimeout(function () { t.style.display = "none"; }, 1500);
    });
  }

  function onKeyDown(e) {
    if (!active) return;
    if (e.key === "Escape") {
      destroy();
      return;
    }
    if (!currentEl) return;

    var next = null;
    switch (e.key) {
      case "ArrowUp":    next = currentEl.parentElement; break;
      case "ArrowDown":  next = currentEl.firstElementChild; break;
      case "ArrowLeft":  next = currentEl.previousElementSibling; break;
      case "ArrowRight": next = currentEl.nextElementSibling; break;
      default: return;
    }

    if (next && next !== document.body && next !== document.documentElement && next !== tooltip) {
      e.preventDefault();
      e.stopPropagation();
      currentEl = next;
      highlight(currentEl);
      updateTooltipContent(currentEl);
      positionTooltipToElement(currentEl);
    }
  }

  function start() {
    if (active) return;
    var existing = document.getElementById("css-peek-tooltip");
    if (existing) existing.remove();
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.id = "css-peek-tooltip";
      document.body.appendChild(tooltip);
    }
    active = true;
    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeyDown, true);
  }

  function destroy() {
    active = false;
    clearHighlight();
    currentEl = null;
    currentSelectorInfo = null;
    hideTooltip();
    document.removeEventListener("mousemove", onMouseMove, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKeyDown, true);
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
    }
  }

  function onMessage(msg, sender, sendResponse) {
    if (msg.text === "start") {
      start();
      sendResponse({ installed: true, active: true });
    } else if (msg.text === "destroy") {
      destroy();
      sendResponse({ installed: true, active: false });
    } else if (msg.text === "ping") {
      sendResponse({ installed: true, active: active });
    }
  }

  chrome.runtime.onMessage.addListener(onMessage);
})();
