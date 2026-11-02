const MAX_ACTIVITY_ITEMS = 50;

async function recordActivity(message) {
  const { activity = [] } = await browser.storage.local.get("activity");
  const nextActivity = [
    { message, timestamp: new Date().toISOString() },
    ...activity
  ].slice(0, MAX_ACTIVITY_ITEMS);
  await browser.storage.local.set({ activity: nextActivity });
}

browser.runtime.onInstalled.addListener(() => {
  recordActivity("Extension initialized");
});

browser.runtime.onStartup.addListener(() => {
  recordActivity("Extension initialized");
});

browser.runtime.onMessage.addListener((message) => {
  if (message?.type === "ALEKS_PAGE_DETECTED") {
    return recordActivity("ALEKS webpage detected");
  }
});
