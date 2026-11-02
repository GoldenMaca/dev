const ALEKS_HOST = /(^|\.)aleks\.com$/i;
const MODULE_LABEL = /\b(module|lesson|topic|unit)\b/i;
const COMPLETED_LABEL = /\b(completed|mastered)\b/i;
const NOT_COMPLETED_LABEL = /\bnot\s+(completed|mastered)\b/i;

function isVisible(element) {
  return element.getClientRects().length > 0;
}

function scanModules() {
  const modules = [];
  const seenUrls = new Set();

  for (const link of document.querySelectorAll("a[href]")) {
    if (
      !isVisible(link) ||
      link.closest('[aria-disabled="true"], [disabled]')
    ) {
      continue;
    }

    const label = (link.innerText || link.getAttribute("aria-label") || link.title || "").trim();
    if (!label || !MODULE_LABEL.test(label)) {
      continue;
    }

    const url = new URL(link.href, location.href);
    if (url.protocol !== "https:" || !ALEKS_HOST.test(url.hostname) || seenUrls.has(url.href)) {
      continue;
    }

    seenUrls.add(url.href);
    const context = link.closest("li, [role='listitem'], article")?.innerText || label;
    modules.push({
      label: label.replace(/\s+/g, " "),
      url: url.href,
      completed: COMPLETED_LABEL.test(context) && !NOT_COMPLETED_LABEL.test(context)
    });
  }

  return modules;
}

browser.runtime.onMessage.addListener((message) => {
  if (message?.type === "SCAN_ALEKS_MODULES") {
    return Promise.resolve({ modules: scanModules() });
  }
});
