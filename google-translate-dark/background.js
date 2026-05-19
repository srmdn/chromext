chrome.runtime.onMessage.addListener((msg) => {
  if (msg.text === "darkMode") {
    getDarkModeValue().then((isDarkMode) => changeMode(isDarkMode));
  } else if (msg.text === "updateMode") {
    getDarkModeValue().then((isDarkMode) => changeMode(isDarkMode, false));
  } else if (msg.text === "updateBtnBackground") {
    getDarkModeValue().then((isDarkMode) => updateBtnBackground(isDarkMode));
  } else if (msg.text === "accentChanged") {
    if (msg.tabId) injectAccentCSS(msg.tabId, msg.color);
  }
});

function changeMode(isDarkMode, alterIsDarkMode) {
  if (alterIsDarkMode === undefined) alterIsDarkMode = true;
  isDarkMode = parseInt(isDarkMode);

  if (alterIsDarkMode) {
    isDarkMode = (isDarkMode + 1) % 2;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.id) return;

    if (tab.url && tab.url.startsWith("chrome://")) return;

    if (!isDarkMode) {
      chrome.scripting.removeCSS({
        target: { tabId: tab.id },
        files: ["./darkmode.css"],
      }).catch(() => {});
      chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ["./lightmode.css"],
      }).catch(() => {});
    } else {
      chrome.scripting.removeCSS({
        target: { tabId: tab.id },
        files: ["./lightmode.css"],
      }).catch(() => {});
      chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ["./darkmode.css"],
      }).catch(() => {});
    }

    injectAccentCSS(tab.id);

    chrome.storage.local.set({ isDarkMode: isDarkMode });
    updateBtnBackground(isDarkMode);
  });
}

function updateBtnBackground(isDarkMode) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.id) return;
    if (tab.url && tab.url.startsWith("chrome://")) return;
    chrome.tabs.sendMessage(tab.id, {
      text: "updateBtnBackground",
      isDarkMode: isDarkMode,
    }).catch(() => {});
  });
}

function getDarkModeValue() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ isDarkMode: 1 }, (res) => {
      resolve(res.isDarkMode);
    });
  });
}

function injectAccentCSS(tabId, newColor) {
  const colorToUse = newColor;
  const inject = (color) => {
    chrome.scripting.insertCSS({
      target: { tabId },
      css: `:root{--gt-accent-color:${color}}`,
    }).catch(() => {});
  };

  if (colorToUse) {
    inject(colorToUse);
  } else {
    chrome.storage.sync.get({ accentColor: "#58a6ff" }, (data) => {
      inject(data.accentColor);
    });
  }
}


