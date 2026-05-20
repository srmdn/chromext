(function () {
  "use strict";

  var tooltip, active = true;

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

  function px(val) {
    return typeof val === "number" ? Math.round(val) + "px" : val;
  }

  function shortHex(color) {
    if (!color || color === "rgba(0, 0, 0, 0)" || color === "transparent") return "\u2014";
    return color;
  }

  function updateTooltip(el, e) {
    if (!el || !tooltip) return;
    var style = getComputedStyle(el);
    var tag = el.tagName.toLowerCase();
    var cls = el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "";
    var id = el.id ? "#" + el.id : "";

    var sel = buildCSSSelector(el);

    tooltip.innerHTML =
      '<div class="cp-header">' +
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
      '<div class="cp-footer">Click to copy selector</div>';

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
    updateTooltip(el, e);
  }

  function onClick(e) {
    if (!active) return;
    e.preventDefault();
    e.stopPropagation();
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === tooltip || (tooltip && tooltip.contains(el))) return;
    var sel = buildCSSSelector(el);
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
