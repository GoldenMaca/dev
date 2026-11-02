const ALEKS_HOST = /(^|\.)aleks\.com$/i;
const MODULES_KEY = "aleksV2Modules";
const SEQUENCE_KEY = "aleksV2Sequence";

const elements = {
  scan: document.querySelector("#scan"),
  status: document.querySelector("#status"),
  modules: document.querySelector("#modules"),
  start: document.querySelector("#start"),
  next: document.querySelector("#next"),
  stop: document.querySelector("#stop")
};

function setStatus(message) {
  elements.status.textContent = message;
}

function isAleksUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALEKS_HOST.test(url.hostname);
  } catch {
    return false;
  }
}

async function getActiveAleksTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (typeof tab?.id !== "number" || !tab.url || !isAleksUrl(tab.url)) {
    throw new Error("Open an ALEKS page in the active tab first.");
  }
  return tab;
}

function renderModules(modules) {
  elements.modules.replaceChildren();

  if (!modules.length) {
    const empty = document.createElement("li");
    empty.textContent = "No module links were detected. Open the course module list and scan again.";
    elements.modules.append(empty);
    return;
  }

  modules.forEach((module, index) => {
    const item = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !module.completed;
    checkbox.dataset.index = String(index);

    const label = document.createElement("label");
    label.textContent = module.completed ? `${module.label} (marked complete)` : module.label;
    label.className = module.completed ? "completed" : "";
    label.prepend(checkbox);
    item.append(label);
    elements.modules.append(item);
  });
}

function selectedModules(modules) {
  const selected = new Set(
    [...elements.modules.querySelectorAll("input:checked")]
      .map((checkbox) => Number(checkbox.dataset.index))
  );
  return modules.filter((_, index) => selected.has(index));
}

function updateButtons(moduleCount, sequence) {
  elements.start.disabled = moduleCount === 0 || Boolean(sequence);
  elements.next.disabled = !sequence || sequence.index >= sequence.modules.length;
  elements.stop.disabled = !sequence;
}

async function scanPage() {
  elements.scan.disabled = true;
  try {
    const tab = await getActiveAleksTab();
    const response = await browser.tabs.sendMessage(tab.id, { type: "SCAN_ALEKS_MODULES" });
    const modules = response?.modules;
    if (!Array.isArray(modules)) {
      throw new Error("The ALEKS page returned an invalid module list. Reload the page and try again.");
    }

    await browser.storage.local.set({ [MODULES_KEY]: modules });
    renderModules(modules);
    const availableCount = modules.filter((module) => !module.completed).length;
    setStatus(
      `${modules.length} module link${modules.length === 1 ? "" : "s"} found; ${availableCount} not marked complete. Review the list before starting.`
    );
    const { [SEQUENCE_KEY]: sequence } = await browser.storage.local.get(SEQUENCE_KEY);
    updateButtons(modules.length, sequence);
  } catch (error) {
    setStatus(error.message);
  } finally {
    elements.scan.disabled = false;
  }
}

async function startSequence() {
  elements.start.disabled = true;
  try {
    const tab = await getActiveAleksTab();
    const { [MODULES_KEY]: modules = [] } = await browser.storage.local.get(MODULES_KEY);
    const selected = selectedModules(modules);
    if (!selected.length) {
      throw new Error("Select at least one module that you still need to complete.");
    }

    const sequence = { modules: selected, index: 0 };
    await browser.storage.local.set({ [SEQUENCE_KEY]: sequence });
    try {
      await browser.tabs.update(tab.id, { url: selected[0].url });
    } catch (error) {
      await browser.storage.local.remove(SEQUENCE_KEY);
      throw error;
    }
    setStatus(`Opened 1 of ${selected.length}: ${selected[0].label}`);
    updateButtons(modules.length, sequence);
  } catch (error) {
    setStatus(error.message);
    elements.start.disabled = false;
  }
}

async function openNextModule() {
  elements.next.disabled = true;
  try {
    const tab = await getActiveAleksTab();
    const { [SEQUENCE_KEY]: sequence } = await browser.storage.local.get(SEQUENCE_KEY);
    if (!sequence || sequence.index >= sequence.modules.length) {
      throw new Error("There are no more modules in this sequence.");
    }

    const nextIndex = sequence.index + 1;
    if (nextIndex >= sequence.modules.length) {
      await browser.storage.local.remove(SEQUENCE_KEY);
      setStatus("Sequence complete. All selected modules have been visited.");
      updateButtons(sequence.modules.length, null);
      return;
    }

    const nextSequence = { ...sequence, index: nextIndex };
    const nextModule = nextSequence.modules[nextIndex];
    if (!isAleksUrl(nextModule.url)) {
      throw new Error("The saved next-module link is not an ALEKS URL. Scan the module list again.");
    }

    await browser.storage.local.set({ [SEQUENCE_KEY]: nextSequence });
    try {
      await browser.tabs.update(tab.id, { url: nextModule.url });
    } catch (error) {
      await browser.storage.local.set({ [SEQUENCE_KEY]: sequence });
      throw error;
    }
    setStatus(`Opened ${nextIndex + 1} of ${nextSequence.modules.length}: ${nextModule.label}`);
    updateButtons(nextSequence.modules.length, nextSequence);
  } catch (error) {
    setStatus(error.message);
    elements.next.disabled = false;
  }
}

async function stopSequence() {
  await browser.storage.local.remove(SEQUENCE_KEY);
  const { [MODULES_KEY]: modules = [] } = await browser.storage.local.get(MODULES_KEY);
  setStatus("Sequence stopped. Scan the course module list to begin again.");
  updateButtons(modules.length, null);
}

async function initialize() {
  const { [MODULES_KEY]: modules = [], [SEQUENCE_KEY]: sequence } =
    await browser.storage.local.get([MODULES_KEY, SEQUENCE_KEY]);
  renderModules(modules);
  updateButtons(modules.length, sequence);
  if (sequence) {
    const current = sequence.modules[sequence.index];
    setStatus(
      current
        ? `Current module ${sequence.index + 1} of ${sequence.modules.length}: ${current.label}. Complete it, then choose “Module complete — open next”.`
        : "Sequence complete."
    );
  }
}

elements.scan.addEventListener("click", scanPage);
elements.start.addEventListener("click", startSequence);
elements.next.addEventListener("click", openNextModule);
elements.stop.addEventListener("click", stopSequence);
initialize().catch((error) => setStatus(`Could not load navigator: ${error.message}`));
