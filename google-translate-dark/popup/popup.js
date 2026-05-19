(function () {
  "use strict";

  const colors = [
    { name: "Blue", hex: "#58a6ff" },
    { name: "Teal", hex: "#3fb950" },
    { name: "Purple", hex: "#bc8cff" },
    { name: "Amber", hex: "#d29922" },
    { name: "Rose", hex: "#f778ba" },
    { name: "Cyan", hex: "#39d2c0" },
    { name: "Orange", hex: "#f0883e" },
    { name: "Pink", hex: "#db61a2" },
  ];

  const grid = document.getElementById("colorGrid");

  chrome.storage.sync.get({ accentColor: "#58a6ff" }, (data) => {
    const current = data.accentColor;

    colors.forEach((color) => {
      const swatch = document.createElement("button");
      swatch.className = "color-swatch";
      swatch.style.setProperty("--swatch-color", color.hex);
      swatch.title = color.name;
      swatch.setAttribute("aria-label", color.name);

      if (color.hex === current) {
        swatch.classList.add("active");
      }

      swatch.addEventListener("click", () => {
        const newColor = color.hex;
        chrome.storage.sync.set({ accentColor: newColor });
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
          const tabId = tabs?.[0]?.id;
          if (tabId) {
            chrome.runtime.sendMessage({ text: "accentChanged", color: newColor, tabId });
          }
        });

        document
          .querySelectorAll(".color-swatch")
          .forEach((s) => s.classList.remove("active"));
        swatch.classList.add("active");

        updatePreview(color.hex);
      });

      grid.appendChild(swatch);
    });

    updatePreview(current);
  });

  function updatePreview(accentColor) {
    document.querySelectorAll(".preview-input").forEach((el) => {
      el.style.borderColor = accentColor;
    });
    document.querySelectorAll(".preview-label").forEach((el) => {
      el.style.color = accentColor;
    });
  }
})();
