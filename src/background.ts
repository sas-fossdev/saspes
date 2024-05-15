import browser from "webextension-polyfill";

browser.runtime.onMessage.addListener(function (message) {
  switch (message.action) {
    case "openOptionsPage":
      openOptionsPage();
      break;
    default:
      break;
  }
});

function openOptionsPage() {
  browser.runtime.openOptionsPage();
}

browser.runtime.onInstalled.addListener(function (details) {
  if (details.reason == "install" && navigator.userAgent.toLowerCase().includes('firefox')) {

    browser.tabs.create({
      url: browser.runtime.getURL("/firefoxinstall.html")
    });
  }

  // if (details.reason == "update") {
  //   browser.tabs.create({
  //     url: "https://www.example.com/update.html"
  //   });
  // }
});