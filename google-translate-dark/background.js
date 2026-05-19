chrome.runtime.onMessage.addListener((msg) => {
  if (msg.text === "darkMode") {
    getDarkModeValue().then((isDarkMode) => changeMode(isDarkMode));
  } else if (msg.text === "updateMode") {
    getDarkModeValue().then((isDarkMode) => changeMode(isDarkMode, false));
  } else if (msg.text === "updateBtnBackground") {
    getDarkModeValue().then((isDarkMode) => updateBtnBackground(isDarkMode));
  }
});

function changeMode(isDarkMode, alterIsDarkMode) {
  if (alterIsDarkMode === undefined) alterIsDarkMode = true;
  isDarkMode = parseInt(isDarkMode);

  if (alterIsDarkMode) {
    isDarkMode = (isDarkMode + 1) % 2;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (!tabId) return;

    if (!isDarkMode) {
      chrome.scripting.removeCSS({
        target: { tabId: tabId },
        files: ["./darkmode.css"],
      });
    } else {
      chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ["./darkmode.css"],
      });
    }

    chrome.storage.local.set({ isDarkMode: isDarkMode });
    updateBtnBackground(isDarkMode);
  });
}

function updateBtnBackground(isDarkMode) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (!tabId) return;
    chrome.tabs.sendMessage(tabId, {
      text: "updateBtnBackground",
      isDarkMode: isDarkMode,
    });
  });
}

function getDarkModeValue() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ isDarkMode: 0 }, (res) => {
      resolve(res.isDarkMode);
    });
  });
}

function getDomain(url) {
  if (!url) return null;
  const withoutProtocol = url.toString().replace(/^https?:\/\//i, "");
  if (withoutProtocol.charAt(0) === "/") return null;
  const match = withoutProtocol.match(/^[^/:]+/);
  if (!match) return null;
  const parts = match[0].split(".");
  const domain = parts.slice(0, 2).join(".");
  const tld = parts.slice(2).join(".");
  return { domain, tld };
}
