const BACKEND_HEALTH_URL = "http://127.0.0.1:8765/health";
const ALEKS_HOST = /(^|\.)aleks\.com$/i;

const elements = {
  connectionIndicator: document.querySelector("#connection-indicator"),
  connectionStatus: document.querySelector("#connection-status"),
  pageDetail: document.querySelector("#page-detail"),
  backendStatus: document.querySelector("#backend-status"),
  backendDetail: document.querySelector("#backend-detail"),
  detectionStatus: document.querySelector("#detection-status"),
  activityList: document.querySelector("#activity-list"),
  refresh: document.querySelector("#refresh")
};

function setBadge(element, label, state) {
  element.textContent = label;
  element.className = `badge ${state}`;
}

function setConnection(label, detail, state) {
  elements.connectionStatus.textContent = label;
  elements.pageDetail.textContent = detail;
  elements.connectionIndicator.className = `indicator ${state}`;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderActivity(activity) {
  elements.activityList.replaceChildren();

  if (!activity.length) {
    const empty = document.createElement("li");
    empty.className = "empty-activity";
    empty.textContent = "No activity yet.";
    elements.activityList.append(empty);
    return;
  }

  for (const entry of activity) {
    const item = document.createElement("li");
    const time = document.createElement("time");
    time.dateTime = entry.timestamp;
    time.textContent = formatTime(entry.timestamp);
    const message = document.createElement("span");
    message.textContent = entry.message;
    item.append(time, message);
    elements.activityList.append(item);
  }
}

async function checkPage() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url || typeof tab.id !== "number") {
    setConnection("Not connected", "No active webpage is available", "neutral");
    setBadge(elements.detectionStatus, "Unavailable", "neutral");
    return;
  }

  let hostname;
  try {
    hostname = new URL(tab.url).hostname;
  } catch {
    setConnection("Unsupported webpage", "This page cannot be inspected", "neutral");
    setBadge(elements.detectionStatus, "Idle", "neutral");
    return;
  }

  if (!ALEKS_HOST.test(hostname)) {
    setConnection("Unsupported webpage", hostname, "neutral");
    setBadge(elements.detectionStatus, "Idle", "neutral");
    return;
  }

  try {
    const response = await browser.tabs.sendMessage(tab.id, { type: "PING" });
    if (response?.detected) {
      setConnection("Connected to ALEKS", hostname, "ready");
      setBadge(elements.detectionStatus, "Working", "ready");
    } else {
      setConnection("Connection error", "ALEKS page bridge returned an invalid response", "error");
      setBadge(elements.detectionStatus, "Error", "error");
    }
  } catch (error) {
    setConnection("Not connected", "Reload the ALEKS tab and try again", "warning");
    setBadge(elements.detectionStatus, "Waiting for page", "warning");
  }
}

async function checkBackend() {
  try {
    const response = await fetch(BACKEND_HEALTH_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Health endpoint returned HTTP ${response.status}`);
    }
    const health = await response.json();
    if (health.status !== "ok" || health.service !== "aleks-math-assistant") {
      throw new Error("Health endpoint returned an unexpected response");
    }
    setBadge(elements.backendStatus, "Ready", "ready");
    elements.backendDetail.textContent = "Backend health check passed";
  } catch (error) {
    setBadge(elements.backendStatus, "Error", "error");
    elements.backendDetail.textContent = `Backend unavailable: ${error.message}`;
  }
}

async function loadActivity() {
  const { activity = [] } = await browser.storage.local.get("activity");
  renderActivity(activity);
}

async function refreshDashboard() {
  elements.refresh.disabled = true;
  await Promise.all([checkPage(), checkBackend(), loadActivity()]);
  elements.refresh.disabled = false;
}

elements.refresh.addEventListener("click", refreshDashboard);
refreshDashboard();
