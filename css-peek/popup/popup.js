(function () {
  "use strict";

  var btn = document.getElementById("toggleBtn");
  var label = document.getElementById("toggleLabel");
  var running = false;
  var tabId = null;
  var scriptReady = false;

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

  function sendTabMessage(message) {
    return chrome.tabs.sendMessage(tabId, message);
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
      scriptReady = true;
      return sendTabMessage({ text: "start" });
    }).then(function () {
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
    tabId = tab.id;

    chrome.tabs.sendMessage(tab.id, { text: "ping" }, function (response) {
      if (!chrome.runtime.lastError && response?.installed) {
        scriptReady = true;
        setState(!!response.active);
      }
    });

    btn.addEventListener("click", function () {
      if (running) {
        sendTabMessage({ text: "destroy" }).catch(function () {
          scriptReady = false;
        });
        setState(false);
      } else if (scriptReady) {
        sendTabMessage({ text: "start" }).then(function () {
          setState(true);
        }).catch(function () {
          scriptReady = false;
          injectContent(tabId);
        });
      } else {
        injectContent(tabId);
      }
    });
  });
})();
