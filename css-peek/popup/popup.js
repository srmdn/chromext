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

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    var tab = tabs[0];
    if (!tab?.id) return;

    btn.addEventListener("click", function () {
      if (running) {
        chrome.tabs.sendMessage(tab.id, { text: "destroy" }).catch(function () {});
        setState(false);
      } else {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"],
        }).then(function () {
          chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ["content.css"],
          }).catch(function () {});
          setState(true);
        }).catch(function () {
          label.textContent = "Reload page first";
        });
      }
    });
  });
})();
