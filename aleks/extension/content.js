browser.runtime.sendMessage({ type: "ALEKS_PAGE_DETECTED" });

browser.runtime.onMessage.addListener((message) => {
  if (message?.type === "PING") {
    return Promise.resolve({ detected: true });
  }
});
