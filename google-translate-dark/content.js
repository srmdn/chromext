function sendMsg(msg) {
  try { chrome.runtime.sendMessage(msg).catch(() => {}); } catch (_) {}
}

function getURL(path) {
  try { return chrome.runtime.getURL(path); } catch (_) { return ""; }
}

sendMsg({ text: "updateMode" });

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
    sendMsg({ text: "darkMode" });
    setTimeout(function () {
      btn.classList.remove("jello");
    }, 1000);
  });

  var header = document.querySelector("header > div:nth-child(2)");
  if (header) {
    header.prepend(btn);
  }
  sendMsg({ text: "updateBtnBackground" });
}

chrome.runtime.onMessage.addListener(function (msg) {
  if (msg.text === "updateBtnBackground") {
    var isDarkMode = msg.isDarkMode;
    var imageURL;
    if (isDarkMode) {
      imageURL = getURL("./icons/moon-solid.svg");
    } else {
      imageURL = getURL("./icons/sun-solid.svg");
    }
    if (btn && imageURL) {
      btn.style.backgroundImage = 'url("' + imageURL + '")';
    }
  }
});
