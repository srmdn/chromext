(function () {
  "use strict";

  var STORAGE_KEY = "midnightTranslateSettings";
  var DEFAULTS = {
    enabled: true,
    accentColor: "#7cc0ff"
  };
  var THEME_STYLE_ID = "mt-theme-style";
  var TOGGLE_ID = "mt-floating-toggle";
  var SELECTED_CLASS = "mt-selected";
  var themeCssText = "";
  var currentSettings = DEFAULTS;
  var toggleButton;
  var bootstrapped = false;
  var refreshScheduled = false;

  init();

  function init() {
    loadThemeCss().then(function () {
      chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULTS }, function (data) {
        currentSettings = normalizeSettings(data[STORAGE_KEY]);
        applySettings(currentSettings);
        scheduleRefresh();
        bindStorageListener();
        bindDomWatcher();
      });
    });
  }

  function bindStorageListener() {
    if (bootstrapped) return;
    bootstrapped = true;

    chrome.storage.onChanged.addListener(function (changes, area) {
      if (area !== "sync" || !changes[STORAGE_KEY]) return;
      currentSettings = normalizeSettings(changes[STORAGE_KEY].newValue);
      applySettings(currentSettings);
      scheduleRefresh();
    });
  }

  function bindDomWatcher() {
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i += 1) {
        if (mutations[i].type === "childList") {
          scheduleRefresh();
          return;
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    scheduleRefresh();
  }

  function loadThemeCss() {
    return fetch(chrome.runtime.getURL("darkmode.css"))
      .then(function (response) {
        if (!response.ok) {
          throw new Error("theme-css-unavailable");
        }
        return response.text();
      })
      .then(function (text) { themeCssText = text; })
      .catch(function () { themeCssText = ""; });
  }

  function normalizeSettings(settings) {
    return {
      enabled: typeof settings?.enabled === "boolean" ? settings.enabled : DEFAULTS.enabled,
      accentColor: typeof settings?.accentColor === "string" ? settings.accentColor : DEFAULTS.accentColor
    };
  }

  function applySettings(settings) {
    document.documentElement.style.setProperty("--mt-accent", settings.accentColor);

    if (settings.enabled && themeCssText) {
      ensureThemeStyle();
      document.documentElement.dataset.midnightTranslate = "on";
      scheduleRefresh();
    } else {
      removeThemeStyle();
      document.documentElement.removeAttribute("data-midnight-translate");
      clearSelectedText();
    }

    updateToggleUi();
  }

  function scheduleRefresh() {
    if (refreshScheduled) return;
    refreshScheduled = true;

    var schedule = window.requestAnimationFrame || function (callback) {
      return window.setTimeout(callback, 16);
    };

    schedule(function () {
      refreshScheduled = false;
      ensureToggle();
      ensureSearchWithGoogleGlyph();
      if (currentSettings.enabled) {
        markSelectedText();
      }
    });
  }

  function ensureThemeStyle() {
    var style = document.getElementById(THEME_STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = THEME_STYLE_ID;
      document.documentElement.appendChild(style);
    }
    if (style.textContent !== themeCssText) {
      style.textContent = themeCssText;
    }
  }

  function removeThemeStyle() {
    var style = document.getElementById(THEME_STYLE_ID);
    if (style) style.remove();
  }

  function ensureToggle() {
    if (!document.body) return;
    if (toggleButton && document.body.contains(toggleButton)) {
      updateToggleUi();
      return;
    }

    toggleButton = document.createElement("button");
    toggleButton.id = TOGGLE_ID;
    toggleButton.type = "button";
    toggleButton.className = "mt-toggle";
    toggleButton.setAttribute("aria-label", "Toggle Midnight Translate");

    toggleButton.innerHTML =
      '<span class="mt-toggle-mark" aria-hidden="true">' +
        '<svg class="mt-toggle-icon" viewBox="0 0 24 24" width="24" height="24" focusable="false">' +
          '<defs>' +
            '<linearGradient id="mtToggleBg" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">' +
              '<stop offset="0" stop-color="#5867ff"></stop>' +
              '<stop offset="1" stop-color="#2633a8"></stop>' +
            '</linearGradient>' +
          '</defs>' +
          '<rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="url(#mtToggleBg)"></rect>' +
          '<rect x="5.5" y="9" width="6.5" height="4.5" rx="1.8" fill="#ffffff" opacity="0.22"></rect>' +
          '<path d="M8 13.5 L8.8 15.3 L10.6 13.5 Z" fill="#ffffff" opacity="0.22"></path>' +
          '<rect x="12.5" y="7.5" width="7" height="5" rx="1.9" fill="#ffffff"></rect>' +
          '<path d="M14.7 12.6 L15.4 10.9 L17.2 12.6 Z" fill="#ffffff"></path>' +
          '<path d="M10.8 8.8 C12.3 6.5 15.4 6.4 17.4 8" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"></path>' +
          '<path d="M16.7 4.8 L18.5 7.4 L16.8 7.8" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>' +
        "</svg>" +
      "</span>" +
      '<span class="mt-toggle-label">Midnight</span>';

    toggleButton.addEventListener("click", function () {
      persistSettings({
        enabled: !currentSettings.enabled
      });
    });

    document.body.appendChild(toggleButton);
    updateToggleUi();
    ensureSearchWithGoogleGlyph();
  }

  function updateToggleUi() {
    if (!toggleButton) return;

    var isEnabled = !!currentSettings.enabled;
    toggleButton.dataset.state = isEnabled ? "on" : "off";
    toggleButton.setAttribute("aria-pressed", isEnabled ? "true" : "false");
    toggleButton.title = isEnabled ? "Turn Midnight Translate off" : "Turn Midnight Translate on";

    var label = toggleButton.querySelector(".mt-toggle-label");
    if (label) {
      label.textContent = isEnabled ? "Midnight" : "Day";
    }
  }

  function persistSettings(partial) {
    currentSettings = normalizeSettings({
      enabled: partial.enabled !== undefined ? partial.enabled : currentSettings.enabled,
      accentColor: partial.accentColor || currentSettings.accentColor
    });

    chrome.storage.sync.set({
      [STORAGE_KEY]: currentSettings
    });
  }

  function markSelectedText() {
    var selected = document.querySelectorAll("." + SELECTED_CLASS);
    selected.forEach(function (node) {
      node.classList.remove(SELECTED_CLASS);
    });

    if (!currentSettings.enabled) return;

    [
      ".lRu31",
      ".J0lOec",
      ".ryNqvb",
      ".Q4iAWc"
    ].forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (node) {
        node.classList.add(SELECTED_CLASS);
      });
    });
  }

  function clearSelectedText() {
    document.querySelectorAll("." + SELECTED_CLASS).forEach(function (node) {
      node.classList.remove(SELECTED_CLASS);
    });
  }

  function ensureSearchWithGoogleGlyph() {
    var button = document.querySelector('button[aria-label="Search with Google"]');
    if (!button) return;
    if (button.querySelector(".mt-google-glyph")) return;

    var iconHost = button.querySelector(".notranslate");
    if (!iconHost) return;

    iconHost.innerHTML =
      '<svg class="mt-google-glyph" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">' +
        '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.43 0 9.28-3.82 9.28-9.21 0-.62-.06-1.2-.16-1.73H12v3.3h5.23c-.23 1.5-1.55 4.41-5.23 4.41-3.15 0-5.72-2.61-5.72-5.77S8.85 7.23 12 7.23c1.8 0 3.01.77 3.7 1.43l2.53-2.45C16.67 4.72 14.58 3.7 12 3.7z"></path>' +
      "</svg>";
  }
})();
