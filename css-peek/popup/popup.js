(function () {
  "use strict";

  var btn = document.getElementById("toggleBtn");
  var label = document.getElementById("toggleLabel");
  var running = false;

  function setState(state) {
    running = state;
    if (running) {
      btn.classList.add("active");
      label.textContent = "Inspecting...";
    } else {
      btn.classList.remove("active");
      label.textContent = "Start Inspecting";
    }
  }

  function injectContent(tabId) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["content.js"],
    }).then(function () {
      chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ["content.css"],
      }).catch(function () {});
      setState(true);
    }).catch(function (err) {
      if (err.message && err.message.includes("chrome")) {
        label.textContent = "Can\u2019t inspect this page";
      } else {
        label.textContent = "Reload page first";
      }
    });
  }

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    var tab = tabs[0];
    if (!tab?.id) return;

    chrome.tabs.sendMessage(tab.id, { text: "ping" }, function (response) {
      if (!chrome.runtime.lastError && response === "pong") {
        setState(true);
      }
    });

    btn.addEventListener("click", function () {
      if (running) {
        chrome.tabs.sendMessage(tab.id, { text: "destroy" }).catch(function () {});
        setState(false);
      } else {
        injectContent(tab.id);
      }
    });
  });
})();
