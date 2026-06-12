(function () {
  "use strict";

  var STORAGE_KEY = "midnightTranslateSettings";
  var DEFAULTS = {
    enabled: true,
    accentColor: "#7cc0ff"
  };
  var COLORS = [
    { name: "Sky", hex: "#7cc0ff" },
    { name: "Mint", hex: "#75d7b0" },
    { name: "Peach", hex: "#ffb27a" },
    { name: "Lilac", hex: "#c0a6ff" },
    { name: "Rose", hex: "#ff8faf" },
    { name: "Gold", hex: "#f1c46b" },
    { name: "Cyan", hex: "#69d8ff" },
    { name: "Coral", hex: "#ff9671" }
  ];

  var modeButton = document.getElementById("modeButton");
  var modeHint = document.getElementById("modeHint");
  var grid = document.getElementById("colorGrid");
  var previewCard = document.getElementById("previewCard");
  var currentSettings = DEFAULTS;

  chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULTS }, function (data) {
    currentSettings = normalizeSettings(data[STORAGE_KEY]);
    render();
  });

  modeButton.addEventListener("click", function () {
    persist({
      enabled: !currentSettings.enabled
    });
  });

  function normalizeSettings(settings) {
    return {
      enabled: typeof settings?.enabled === "boolean" ? settings.enabled : DEFAULTS.enabled,
      accentColor: typeof settings?.accentColor === "string" ? settings.accentColor : DEFAULTS.accentColor
    };
  }

  function persist(partial) {
    currentSettings = normalizeSettings({
      enabled: partial.enabled !== undefined ? partial.enabled : currentSettings.enabled,
      accentColor: partial.accentColor || currentSettings.accentColor
    });

    chrome.storage.sync.set({
      [STORAGE_KEY]: currentSettings
    }, render);
  }

  function render() {
    renderMode();
    renderSwatches();
    renderPreview();
  }

  function renderMode() {
    modeButton.dataset.state = currentSettings.enabled ? "on" : "off";
    modeButton.textContent = currentSettings.enabled ? "Midnight mode on" : "Midnight mode off";
    modeHint.textContent = currentSettings.enabled
      ? "Theme and accent apply automatically on open Translate tabs."
      : "Google Translate stays in its default look until you turn night mode back on.";
  }

  function renderSwatches() {
    grid.innerHTML = "";

    COLORS.forEach(function (color) {
      var swatch = document.createElement("button");
      swatch.type = "button";
      swatch.className = "color-swatch";
      swatch.title = color.name;
      swatch.setAttribute("aria-label", color.name);
      swatch.style.setProperty("--swatch-color", color.hex);

      if (color.hex === currentSettings.accentColor) {
        swatch.classList.add("active");
      }

      swatch.addEventListener("click", function () {
        persist({ accentColor: color.hex });
      });

      grid.appendChild(swatch);
    });
  }

  function renderPreview() {
    previewCard.style.setProperty("--preview-accent", currentSettings.accentColor);
    previewCard.dataset.state = currentSettings.enabled ? "on" : "off";
  }
})();
