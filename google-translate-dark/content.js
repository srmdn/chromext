function applyAccentColor() {
  chrome.storage.sync.get({ accentColor: "#62a6f3" }, function (data) {
    document.documentElement.style.setProperty("--gt-accent-color", data.accentColor);
  });
}

applyAccentColor();

chrome.storage.onChanged.addListener(function (changes, area) {
  if (area === "sync" && changes.accentColor) {
    document.documentElement.style.setProperty("--gt-accent-color", changes.accentColor.newValue);
  }
});

chrome.runtime.sendMessage({ text: "updateMode" }).catch(() => {});

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", afterWindowLoaded);
} else {
  afterWindowLoaded();
}

var btn;

function afterWindowLoaded() {
  btn = document.createElement("div");
  btn.id = "darkModeToggleBtn";
  btn.title = "Toggle Dark Mode";

  btn.addEventListener("click", function () {
    btn.classList.add("jello");
    chrome.runtime.sendMessage({ text: "darkMode" }).catch(() => {}).finally(() => {
      setTimeout(function () {
        btn.classList.remove("jello");
      }, 1000);
    });
  });

  var header = document.querySelector("header > div:nth-child(2)");
  if (header) {
    header.prepend(btn);
  }
  chrome.runtime.sendMessage({ text: "updateBtnBackground" }).catch(() => {});
}

chrome.runtime.onMessage.addListener(function (msg) {
  if (msg.text === "updateBtnBackground") {
    var isDarkMode = msg.isDarkMode;
    var imageURL;
    if (isDarkMode) {
      imageURL = chrome.runtime.getURL("./icons/moon-solid.svg");
    } else {
      imageURL = chrome.runtime.getURL("./icons/sun-solid.svg");
    }
    if (btn) {
      btn.style.backgroundImage = 'url("' + imageURL + '")';
    }
  }
});
