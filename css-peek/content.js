(function () {
  "use strict";

  var tooltip, active = true, currentEl, lastHighlighted, lastOutline;

  function buildCSSSelector(el) {
    if (!el || el === document.body || el === document.documentElement) return el?.tagName?.toLowerCase() || "";
    var path = [];
    var current = el;
    while (current && current !== document.body && current !== document.documentElement) {
      var tag = current.tagName.toLowerCase();
      if (current.id) {
        path.unshift(tag + "#" + current.id);
        break;
      }
      if (path.length >= 5) break;
      var siblings = Array.from(current.parentNode?.children || []).filter(
        function (c) { return c.tagName === current.tagName; }
      );
      if (siblings.length > 1) {
        var idx = siblings.indexOf(current) + 1;
        tag += ":nth-of-type(" + idx + ")";
      }
      path.unshift(tag);
      current = current.parentNode;
    }
    return path.join(" > ");
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
    el.style.outline = "2px solid #7c4dff";
    el.style.outlineOffset = "-1px";
  }

  function clearHighlight() {
    if (lastHighlighted) {
      lastHighlighted.style.outline = lastOutline;
      lastHighlighted = null;
      lastOutline = "";
    }
  }

  function updateTooltipContent(el) {
    if (!el || !tooltip) return;
    var style = getComputedStyle(el);
    var tag = el.tagName.toLowerCase();
    var cls = el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "";
    var id = el.id ? "#" + el.id : "";

    tooltip.innerHTML =
      '<div class="cp-header">' +
        '<span class="cp-breadcrumb">' + buildBreadcrumb(el) + '</span>' +
        '<span class="cp-tag">' + tag + id + '</span>' +
        '<span class="cp-classes">' + cls + '</span>' +
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
      '<div class="cp-footer">\u2191\u2193\u2190\u2192 nav  \u2022  click copy  \u2022  esc stop</div>';
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
    currentEl = el;
    highlight(currentEl);
    updateTooltipContent(currentEl);
    positionTooltipAtMouse(e);
  }

  function onClick(e) {
    if (!active) return;
    if (tooltip && (e.target === tooltip || tooltip.contains(e.target))) return;
    e.preventDefault();
    e.stopPropagation();
    if (!currentEl) return;
    var sel = buildCSSSelector(currentEl);
    navigator.clipboard.writeText(sel).catch(function () {});
    if (tooltip) {
      tooltip.innerHTML = '<div class="cp-section" style="text-align:center;padding:12px">Copied!<br><span style="font-size:11px;color:#9aa0a6">' + sel + '</span></div>';
      var t = tooltip;
      setTimeout(function () { t.style.display = "none"; }, 1500);
    }
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
    if (tooltip) return;
    var existing = document.getElementById("css-peek-tooltip");
    if (existing) existing.remove();
    tooltip = document.createElement("div");
    tooltip.id = "css-peek-tooltip";
    document.body.appendChild(tooltip);
    active = true;
    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeyDown, true);
  }

  function destroy() {
    active = false;
    clearHighlight();
    currentEl = null;
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
    if (msg.text === "start") start();
    else if (msg.text === "destroy") destroy();
    else if (msg.text === "ping" && tooltip && active) sendResponse("pong");
  }

  chrome.runtime.onMessage.addListener(onMessage);
  start();
})();
