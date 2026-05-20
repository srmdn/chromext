const enabledToggle = document.getElementById("enabledToggle");
const actionRadios = document.querySelectorAll('input[name="action"]');
const caughtCount = document.getElementById("caughtCount");

chrome.storage.sync.get({ enabled: true, action: "warn" }, (data) => {
  enabledToggle.checked = data.enabled;
  document.querySelector(`input[name="action"][value="${data.action}"]`).checked = true;
});

chrome.storage.local.get({ caught: 0 }, (data) => {
  caughtCount.textContent = data.caught;
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.caught) {
    caughtCount.textContent = changes.caught.newValue;
  }
});

enabledToggle.addEventListener("change", () => {
  chrome.storage.sync.set({ enabled: enabledToggle.checked });
});

actionRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    if (radio.checked) {
      chrome.storage.sync.set({ action: radio.value });
    }
  });
});
