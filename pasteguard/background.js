chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["enabled", "action"], (data) => {
    if (data.enabled === undefined) {
      chrome.storage.sync.set({ enabled: true, action: "warn" });
    }
  });
  chrome.storage.local.get("caught", (data) => {
    if (data.caught === undefined) chrome.storage.local.set({ caught: 0 });
    updateBadge();
  });
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.caught) updateBadge();
});

function updateBadge() {
  chrome.storage.local.get({ caught: 0 }, (data) => {
    if (data.caught > 0) {
      chrome.action.setBadgeText({ text: String(data.caught) });
      chrome.action.setBadgeBackgroundColor({ color: "#8ab4f8" });
    } else {
      chrome.action.setBadgeText({ text: "" });
    }
  });
}
