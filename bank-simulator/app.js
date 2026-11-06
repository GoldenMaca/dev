(() => {
  "use strict";

  const SAVE_KEY = "commonwealth-bank-simulator-v1";
  const locations = [
    { name: "Old Town", x: 23, y: 29, district: "Historic district" },
    { name: "Riverside", x: 64, y: 20, district: "North waterfront" },
    { name: "Market Square", x: 49, y: 48, district: "Central district" },
    { name: "Eastpoint", x: 81, y: 48, district: "East quarter" },
    { name: "Southbank", x: 30, y: 70, district: "South waterfront" },
    { name: "Westfield", x: 9, y: 51, district: "West quarter" },
    { name: "University", x: 67, y: 75, district: "University district" },
    { name: "Harbor Point", x: 90, y: 20, district: "Harbor district" }
  ];

  const starterState = () => ({
    day: 1,
    cash: 2200000,
    deposits: 4800000,
    loans: 3100000,
    customers: 1864,
    reputation: 72,
    depositApy: 2.4,
    loanApr: 8.5,
    minCreditScore: 620,
    vaultLevel: 1,
    vehicles: 1,
    securityLevel: 1,
    vaultCash: 350000,
    branches: [
      { id: 1, name: "Old Town", x: 23, y: 29, level: 1, staff: 8, security: 2, cash: 150000, location: "Historic district" },
      { id: 2, name: "Riverside", x: 64, y: 20, level: 1, staff: 7, security: 2, cash: 120000, location: "North waterfront" },
      { id: 3, name: "Market Square", x: 49, y: 48, level: 2, staff: 14, security: 3, cash: 180000, location: "Central district" }
    ],
    applications: [
      { id: 1, name: "Maya Chen", initials: "MC", purpose: "Small business", amount: 42000, score: 748, risk: "Low", status: "pending" },
      { id: 2, name: "Elliot Brooks", initials: "EB", purpose: "Auto loan", amount: 18500, score: 681, risk: "Moderate", status: "pending" },
      { id: 3, name: "Priya Patel", initials: "PP", purpose: "Home improvement", amount: 64000, score: 594, risk: "High", status: "pending" }
    ],
    history: [{ day: 1, cash: 2200000 }],
    log: [
      { day: 1, text: "Commonwealth Bank opened for business", type: "good" },
      { day: 1, text: "Three branches are welcoming customers", type: "good" },
      { day: 1, text: "Review your first loan applications", type: "warn" }
    ],
    nextId: 4,
    mapX: -88,
    mapY: -74,
    mapZoom: 1,
    selectedBranch: 1,
    nextApplicationDay: 4,
    inTransit: null,
    placeMode: false
  });

  const readSave = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (saved && saved.version === 1 && saved.state && Array.isArray(saved.state.branches)) {
        return { ...starterState(), ...saved.state };
      }
    } catch (error) {
      console.warn("Could not read the saved bank simulator game.", error);
    }
    return starterState();
  };

  let state = readSave();
  let activeTab = "dashboard";
  let toastTimer;
  let mapDrag = null;
  const screen = document.querySelector("#screen");
  const toastElement = document.querySelector("#toast");
  const cashFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const money = (value) => cashFormat.format(Math.round(value));
  const compact = (value) => value >= 1000000
    ? `$${(value / 1000000).toFixed(value >= 10000000 ? 1 : 2)}m`
    : value >= 1000 ? `$${(value / 1000).toFixed(value >= 100000 ? 0 : 1)}k` : money(value);
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  const pendingCount = () => state.applications.filter((application) => application.status === "pending").length;
  const equity = () => state.cash + state.loans - state.deposits;
  const reserveRatio = () => state.deposits ? state.cash / state.deposits * 100 : 100;
  const vaultCapacity = () => 500000 + (state.vaultLevel - 1) * 750000;
  const record = (text, type = "good") => {
    state.log.unshift({ day: state.day, text, type });
    state.log = state.log.slice(0, 8);
  };
  const save = () => localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, state }));
  const notify = (message) => {
    toastElement.textContent = message;
    toastElement.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastElement.classList.remove("show"), 2800);
  };
  const pageTitle = (title) => {
    document.querySelector("#page-title").textContent = title;
    document.querySelector("#day-label").textContent = `DAY ${String(state.day).padStart(2, "0")}`;
    document.querySelector("#branch-count").textContent = state.branches.length;
    document.querySelector("#application-count").textContent = pendingCount() || "";
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.tab === activeTab));
  };
  const header = (eyebrow, title, subtitle, action = "") => `
    <div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="subtitle">${subtitle}</p></div>${action}</div>`;
  const metric = (label, value, note, icon, positive = true) => `
    <div class="metric-card"><div class="metric-head"><span>${label}</span><span class="metric-icon">${icon}</span></div>
    <div class="metric-value">${value}</div><div class="metric-foot"><span class="${positive ? "positive" : "negative"}">${note}</span></div></div>`;
  const logMarkup = (limit = 4) => state.log.slice(0, limit).map((entry) => `
    <div class="activity-item"><span class="activity-bullet ${entry.type === "warn" ? "warn-dot" : ""}"></span>
    <p>${escapeHtml(entry.text)}<small>Day ${entry.day}</small></p></div>`).join("");
  const selected = () => state.branches.find((branch) => branch.id === state.selectedBranch) || state.branches[0];

  function render() {
    const renderers = { dashboard: renderDashboard, branches: renderBranches, lending: renderLending, treasury: renderTreasury, security: renderSecurity };
    const titles = { dashboard: "Overview", branches: "Branches", lending: "Lending", treasury: "Treasury", security: "Security & vault" };
    pageTitle(titles[activeTab]);
    screen.innerHTML = renderers[activeTab]();
    setupMap();
    save();
  }

  function mapMarkup() {
    const branchPins = state.branches.map((branch) => `
      <button class="map-pin ${branch.id === state.selectedBranch ? "selected" : ""}" data-action="select-branch" data-id="${branch.id}"
        style="left:${branch.x}%;top:${branch.y}%">
        <span class="pin-symbol">C</span><span><strong>${escapeHtml(branch.name)}</strong><small>Level ${branch.level} · Open</small></span>
      </button>`).join("");
    const pointLabels = locations.map((place) => `
      <span class="map-label" style="left:${place.x}%;top:${place.y + 5}%">${escapeHtml(place.district)}</span>`).join("");
    return `<div class="panel map-panel"><div class="panel-heading"><div><h2>Branch network</h2><p>Commonwealth metropolitan area</p></div>
      <div class="map-tools"><button class="map-tool" data-action="zoom-out" aria-label="Zoom out">−</button>
      <button class="map-tool" data-action="zoom-in" aria-label="Zoom in">+</button><button class="map-tool" data-action="recenter" aria-label="Recenter map">⌖</button></div></div>
      <div class="map-wrap ${state.placeMode ? "place-mode" : ""}" id="map-wrap" aria-label="Draggable branch map">
        <div class="map-world" id="map-world" style="transform:translate(${state.mapX}px,${state.mapY}px) scale(${state.mapZoom})">
          <svg viewBox="0 0 1060 710" preserveAspectRatio="none" aria-hidden="true">
            <path class="river" d="M-20 518 C150 455 220 525 350 448 S605 371 703 423 S908 557 1080 431"/>
            <path class="road" d="M-20 247 C180 198 307 287 486 235 S823 169 1080 209"/>
            <path class="road-line" d="M-20 247 C180 198 307 287 486 235 S823 169 1080 209"/>
            <path class="road" d="M161 -20 C214 120 253 253 305 377 S380 575 420 738"/>
            <path class="road-line" d="M161 -20 C214 120 253 253 305 377 S380 575 420 738"/>
            <path class="road" d="M710 -20 C658 153 747 256 734 373 S813 555 860 738"/>
            <path class="road-line" d="M710 -20 C658 153 747 256 734 373 S813 555 860 738"/>
            <path class="road" d="M-20 602 C172 555 367 610 529 574 S846 505 1080 551"/>
            <path class="road-line" d="M-20 602 C172 555 367 610 529 574 S846 505 1080 551"/>
          </svg>
          <span class="map-district" style="left:14%;top:13%">OLD TOWN</span>
          <span class="map-district" style="left:53%;top:7%">RIVERSIDE</span>
          <span class="map-district" style="left:40%;top:42%">DOWNTOWN</span>
          <span class="map-district" style="left:75%;top:41%">EASTPOINT</span>
          <span class="map-district" style="left:23%;top:78%">SOUTHBANK</span>
          <span class="map-district" style="left:62%;top:80%">UNIVERSITY</span>
          ${pointLabels}${branchPins}
        </div>
        <div class="map-legend"><span><i class="legend-dot"></i>Your branches</span><span>····· Main routes</span></div>
        <div class="map-hint">${state.placeMode ? "Click map to place your new branch · Esc to cancel" : "Drag to explore · scroll to zoom"}</div>
      </div></div>`;
  }

  function renderDashboard() {
    const netIncome = (state.loans * state.loanApr / 100 - state.deposits * state.depositApy / 100) / 365;
    const chosen = selected();
    const dayHeading = "DAY";
    const headingMarkup = header(dayHeading, "Good morning, Jordan", "Here's how your bank is performing today.",
      '<button class="button button-quiet" data-action="place-branch">＋ Expand network</button>');
    return `${headingMarkup}
      <div class="metrics">
        ${metric("TOTAL DEPOSITS", compact(state.deposits), `↑ ${state.customers.toLocaleString()} active customers`, "◈")}
        ${metric("LOAN PORTFOLIO", compact(state.loans), `${state.applications.filter((a) => a.status === "approved").length} approved this run`, "↗")}
        ${metric("AVAILABLE CASH", compact(state.cash), `${reserveRatio().toFixed(1)}% reserve ratio`, "▣", state.cash > 0)}
        ${metric("BANK EQUITY", compact(equity()), `${state.branches.length} branches · ${state.reputation} reputation`, "◉", equity() > 0)}
      </div>
      <div class="main-grid"><div>${mapMarkup()}<div class="panel" style="margin-top:14px">
        <div class="panel-heading"><div><h3>Banking activity</h3><p>Your latest business updates</p></div><span class="badge">LIVE</span></div>
        <div class="activity-list">${logMarkup(3)}</div></div></div>
        <div class="side-stack"><div class="panel"><div class="panel-heading"><div><h2>Daily snapshot</h2><p>Estimated earnings per day</p></div></div>
          <div class="finance-list">
            <div class="finance-row"><span>Loan interest income</span><strong class="positive">+${money(state.loans * state.loanApr / 100 / 365)}</strong></div>
            <div class="finance-row"><span>Deposit interest cost</span><strong class="negative">−${money(state.deposits * state.depositApy / 100 / 365)}</strong></div>
            <div class="finance-row"><span>Branch operating costs</span><strong class="negative">−${money(state.branches.length * 850)}</strong></div>
            <div class="finance-row"><span>Net interest margin</span><strong class="${netIncome > 0 ? "positive" : "negative"}">${money(netIncome)}</strong></div>
          </div></div>
          <div class="panel"><div class="panel-heading"><div><h2>Branch overview</h2><p>${chosen ? escapeHtml(chosen.name) : "No branches yet"} · selected branch</p></div></div>
            ${chosen ? `<div class="health-row"><span>Security rating</span><strong>${"★".repeat(chosen.security)}${"☆".repeat(5 - chosen.security)}</strong></div>
            <div class="health-row"><span>Cash on hand</span><b>${money(chosen.cash)}</b></div>
            <div class="health-row"><span>Customer capacity</span><b>${(chosen.level * 650).toLocaleString()}</b></div>
            <div class="health-meter"><span style="width:${Math.min(100, chosen.security * 20)}%"></span></div>
            <div class="quick-actions"><button class="button" data-action="transport">🚚 Send cash</button><button class="button" data-tab="branches">Manage branches</button></div>` : `<div class="empty-state">Open a branch to get started.</div>`}
          </div>
          <div class="panel"><div class="panel-heading"><div><h2>Needs your attention</h2><p>Keep your bank moving forward</p></div></div>
            <div class="quick-actions"><button class="button" data-tab="lending">Review ${pendingCount()} loan applications</button><button class="button" data-action="end-day">Close out the day</button></div></div>
        </div></div>`;
  }

  function renderBranches() {
    const cards = state.branches.map((branch) => `<article class="panel branch-card">
      <div class="branch-card-top"><div class="branch-card-title"><span class="branch-icon">⌂</span><span><strong>${escapeHtml(branch.name)}</strong><small>${escapeHtml(branch.location)} · Level ${branch.level}</small></span></div><span class="badge">OPEN</span></div>
      <div class="branch-card-body"><div class="branch-info"><span>Cash on hand</span><strong>${money(branch.cash)}</strong></div>
      <div class="branch-info"><span>Staff</span><strong>${branch.staff} employees</strong></div>
      <div class="branch-info"><span>Daily capacity</span><strong>${(branch.level * 650).toLocaleString()} customers</strong></div>
      <div class="branch-info"><span>Security</span><strong>${"★".repeat(branch.security)}${"☆".repeat(5 - branch.security)}</strong></div></div>
      <div class="branch-card-footer"><span class="badge badge-warn">Operating ${money(850)}/day</span><button class="button" data-action="upgrade-branch" data-id="${branch.id}">Upgrade · ${money(175000 + branch.level * 100000)}</button></div>
      </article>`).join("");
    return `${header("YOUR NETWORK", "Branches", "Build your footprint, upgrade locations, and serve more customers.",
      `<button class="button button-primary" data-action="place-branch">＋ Open a branch · ${money(250000)}</button>`)}
      <div class="stat-grid"><div class="stat-box"><span>Active locations</span><strong>${state.branches.length}</strong></div>
      <div class="stat-box"><span>Network capacity</span><strong>${state.branches.reduce((sum, branch) => sum + branch.level * 650, 0).toLocaleString()}</strong></div>
      <div class="stat-box"><span>Daily operating costs</span><strong>${money(state.branches.length * 850)}</strong></div></div>
      <div class="branch-cards">${cards || `<div class="panel empty-state"><strong>No branches open</strong>Open your first location to start serving customers.</div>`}</div>
      <div class="panel" style="margin-top:15px">${mapMarkup()}</div>`;
  }

  function renderLending() {
    const rows = state.applications.map((application) => {
      const scoreClass = application.score >= state.minCreditScore ? "badge" : "badge badge-risk";
      const status = application.status === "pending"
        ? `<div class="inline-actions"><button class="button button-primary" data-action="decide-loan" data-id="${application.id}" data-decision="approve">Approve</button><button class="button button-quiet" data-action="decide-loan" data-id="${application.id}" data-decision="deny">Deny</button></div>`
        : `<span class="badge ${application.status === "approved" ? "" : "badge-warn"}">${application.status.toUpperCase()}</span>`;
      return `<tr><td><div class="table-main"><span class="table-avatar">${escapeHtml(application.initials)}</span><span><strong>${escapeHtml(application.name)}</strong><small>${escapeHtml(application.purpose)}</small></span></div></td>
        <td><strong>${money(application.amount)}</strong></td><td><div class="loan-score"><span class="${scoreClass}">${application.score}</span><span class="score-track"><i style="width:${application.score / 8.5}%"></i></span></div></td>
        <td><span class="badge ${application.risk === "High" ? "badge-risk" : application.risk === "Moderate" ? "badge-warn" : ""}">${application.risk} risk</span></td><td>${status}</td></tr>`;
    }).join("");
    return `${header("CREDIT DESK", "Lending & credit", "Review applicants, set your underwriting policy, and grow a responsible loan book.")}
      <div class="metrics">
        ${metric("PENDING REVIEW", pendingCount(), "Applications awaiting your decision", "◷")}
        ${metric("LOAN BOOK", compact(state.loans), `${state.loanApr.toFixed(1)}% lending APR`, "↗")}
        ${metric("AVERAGE CREDIT SCORE", state.applications.length ? Math.round(state.applications.reduce((sum, a) => sum + a.score, 0) / state.applications.length) : "—", "300–850 scale", "◎")}
        ${metric("DELINQUENCY", `${Math.max(0, 8 - Math.floor(state.reputation / 15))}%`, "Estimated portfolio risk", "△", state.reputation > 45)}
      </div>
      <div class="content-grid"><div class="panel"><div class="panel-heading"><div><h2>Loan applications</h2><p>Check creditworthiness before committing bank capital</p></div><span class="badge">${pendingCount()} NEW</span></div>
        <div class="table-wrap"><table><thead><tr><th>Applicant</th><th>Requested</th><th>Credit score</th><th>Risk</th><th>Decision</th></tr></thead><tbody>${rows || `<tr><td colspan="5"><div class="empty-state"><strong>All caught up</strong>New applications arrive as the days pass.</div></td></tr>`}</tbody></table></div></div>
        <div class="panel"><div class="panel-heading"><div><h2>Credit policy</h2><p>Set the minimum score for approvals</p></div></div>
          <div class="rate-control"><div class="rate-label"><span>Minimum credit score</span><output id="score-output">${state.minCreditScore}</output></div>
            <input type="range" min="500" max="760" step="10" value="${state.minCreditScore}" data-setting="minCreditScore" id="score-range">
            <div class="range-hints"><span>500 flexible</span><span>760 conservative</span></div></div>
          <div style="padding:3px 17px 12px"><div class="loan-rule"><span>Score range</span><strong>300–850</strong></div><div class="loan-rule"><span>Typical low risk</span><strong>720+</strong></div>
          <div class="loan-rule"><span>Policy outcome</span><strong>${state.applications.filter((a) => a.status === "pending" && a.score >= state.minCreditScore).length} qualify now</strong></div>
          <p class="subtitle" style="line-height:1.55;margin-top:12px">Approvals increase interest income and credit exposure. Only approve loans you can fund while maintaining a healthy cash reserve.</p></div></div></div>`;
  }

  function renderTreasury() {
    return `${header("MONEY AT WORK", "Treasury & rates", "Balance customer growth, funding costs, and the yield on your loan portfolio.")}
      <div class="metrics">
        ${metric("AVAILABLE CASH", compact(state.cash), `${reserveRatio().toFixed(1)}% of deposits held in reserve`, "▣", state.cash / Math.max(1, state.deposits) > .1)}
        ${metric("BANK EQUITY", compact(equity()), "Assets minus customer deposits", "◉", equity() > 0)}
        ${metric("NET INTEREST MARGIN", `${(state.loanApr - state.depositApy).toFixed(2)}%`, "Lending APR less deposit APY", "↗", state.loanApr > state.depositApy)}
        ${metric("VAULT CASH", compact(state.vaultCash), `Capacity ${compact(vaultCapacity())}`, "⬡")}
      </div>
      <div class="content-grid"><div class="panel"><div class="panel-heading"><div><h2>Interest rate strategy</h2><p>Rates apply immediately and affect your daily earnings</p></div></div>
        <div class="rate-control"><div class="rate-label"><span>Customer deposit APY</span><output id="apy-output">${state.depositApy.toFixed(2)}%</output></div>
          <input type="range" min="0.5" max="7" step="0.1" value="${state.depositApy}" data-setting="depositApy" id="apy-range">
          <div class="range-hints"><span>0.5% low cost</span><span>7.0% attract savers</span></div></div>
        <div class="rate-control"><div class="rate-label"><span>Loan interest APR</span><output id="apr-output">${state.loanApr.toFixed(2)}%</output></div>
          <input type="range" min="3" max="24" step="0.1" value="${state.loanApr}" data-setting="loanApr" id="apr-range">
          <div class="range-hints"><span>3% borrower-friendly</span><span>24% higher yield</span></div></div>
        <div class="finance-list"><div class="finance-row"><span>Daily loan interest earned</span><strong class="positive">${money(state.loans * state.loanApr / 100 / 365)}</strong></div>
          <div class="finance-row"><span>Daily interest paid to depositors</span><strong class="negative">${money(state.deposits * state.depositApy / 100 / 365)}</strong></div>
          <div class="finance-row"><span>Estimated daily net interest</span><strong>${money((state.loans * state.loanApr - state.deposits * state.depositApy) / 36500)}</strong></div></div>
        </div>
        <div class="panel"><div class="panel-heading"><div><h2>Balance sheet</h2><p>Day ${state.day} · simplified bank position</p></div></div><div class="finance-list">
          <div class="finance-row"><span>Cash & reserves</span><strong>${money(state.cash)}</strong></div>
          <div class="finance-row"><span>Outstanding loans</span><strong>${money(state.loans)}</strong></div>
          <div class="finance-row"><span>Total assets</span><strong>${money(state.cash + state.loans)}</strong></div>
          <div class="finance-row"><span>Customer deposits</span><strong>${money(state.deposits)}</strong></div>
          <div class="finance-row"><span>Owner equity</span><strong class="${equity() >= 0 ? "positive" : "negative"}">${money(equity())}</strong></div>
          <div class="finance-row"><span>Reserve ratio</span><strong class="${reserveRatio() >= 10 ? "positive" : "negative"}">${reserveRatio().toFixed(1)}%</strong></div>
        </div><div style="padding:0 16px 14px"><p class="subtitle" style="line-height:1.55">A low reserve ratio can leave your bank unable to fund withdrawals and new loans. Keep at least 10% of deposits available as cash.</p></div></div></div>`;
  }

  function renderSecurity() {
    const upgrades = [
      { key: "vault", title: `Expand vault · Level ${state.vaultLevel}`, desc: `Increase secure cash capacity to ${compact(vaultCapacity() + 750000)}. Cost: ${money(180000 + state.vaultLevel * 120000)}.`, price: 180000 + state.vaultLevel * 120000, label: "Expand vault" },
      { key: "security", title: `Bank-wide security · Level ${state.securityLevel}`, desc: "Upgrade alarms, monitoring, and staff protection. Improves reputation and reduces robbery risk.", price: 95000 + state.securityLevel * 80000, label: "Improve security" },
      { key: "vehicle", title: `Armored fleet · ${state.vehicles} vehicle${state.vehicles === 1 ? "" : "s"}`, desc: "Purchase a vehicle to move cash between your vault and branches. One delivery arrives next day.", price: 140000, label: "Purchase vehicle" },
      { key: "branch-security", title: "Upgrade selected branch security", desc: `${selected() ? escapeHtml(selected().name) : "Select a branch"}: improve its local security rating by one star.`, price: selected() ? 75000 + selected().security * 45000 : 75000, label: "Harden branch" }
    ];
    const upgradeCards = upgrades.map((upgrade) => `<div class="panel upgrade-card"><div><h3>${upgrade.title}</h3><p>${upgrade.desc}</p></div>
      <div class="upgrade-price"><span class="badge badge-warn">${money(upgrade.price)}</span><button class="button" data-action="upgrade" data-upgrade="${upgrade.key}">${upgrade.label}</button></div></div>`).join("");
    return `${header("PROTECT WHAT YOU'VE BUILT", "Security & vault", "Protect customer deposits, secure your cash, and invest in safe operations.")}
      <div class="content-grid"><div><div class="panel" style="margin-bottom:14px"><div class="panel-heading"><div><h2>Vault status</h2><p>Main branch · physical cash reserve</p></div><span class="badge">SECURE</span></div>
        <div class="vault-visual"><div class="vault-door">✳</div><p>COMMONWEALTH · EST. DAY 01</p></div>
        <div class="finance-list"><div class="finance-row"><span>Cash stored in vault</span><strong>${money(state.vaultCash)}</strong></div><div class="finance-row"><span>Vault capacity</span><strong>${money(vaultCapacity())}</strong></div>
        <div class="finance-row"><span>Central security level</span><strong>${"★".repeat(Math.min(5, state.securityLevel))}${"☆".repeat(Math.max(0, 5 - state.securityLevel))}</strong></div></div></div>
        <div class="upgrade-list">${upgradeCards}</div></div>
        <div class="side-stack"><div class="panel"><div class="panel-heading"><div><h2>Armored transport</h2><p>${state.vehicles} vehicle${state.vehicles === 1 ? "" : "s"} in fleet</p></div></div>
          <div class="finance-list"><div class="finance-row"><span>Vehicle status</span><strong>${state.inTransit ? "On route" : state.vehicles ? "Ready" : "No vehicles"}</strong></div>
          ${state.inTransit ? `<div class="finance-row"><span>Current delivery</span><strong>${money(state.inTransit.amount)} ${state.inTransit.direction === "to-branch" ? `to ${escapeHtml(state.inTransit.branchName)}` : "to vault"}</strong></div>` : `<div class="finance-row"><span>Delivery time</span><strong>1 business day</strong></div>`}</div>
          <div class="quick-actions"><button class="button button-primary" data-action="transport" ${!state.vehicles || state.inTransit || !selected() ? "disabled" : ""}>🚚 Send cash to branch</button><button class="button" data-action="transport-return" ${!state.vehicles || state.inTransit || !selected() ? "disabled" : ""}>Return cash to vault</button></div>
        </div>
        <div class="panel"><div class="panel-heading"><div><h2>Safety checklist</h2><p>Operational risk indicators</p></div></div>
          <div class="finance-list"><div class="finance-row"><span>Branch coverage</span><strong>${state.branches.length} locations</strong></div>
          <div class="finance-row"><span>Fleet redundancy</span><strong>${state.vehicles > 1 ? "Good" : state.vehicles ? "Limited" : "None"}</strong></div>
          <div class="finance-row"><span>Bank reputation</span><strong>${state.reputation}/100</strong></div></div></div>
      </div>`;
  }

  function finishDay() {
    const dailyIncome = state.loans * state.loanApr / 100 / 365;
    const dailyDepositsCost = state.deposits * state.depositApy / 100 / 365;
    const branchCosts = state.branches.length * 850;
    const vehicleCosts = state.vehicles * 90;
    const serviceIncome = state.customers * 0.18;
    let net = dailyIncome - dailyDepositsCost - branchCosts - vehicleCosts + serviceIncome;
    state.day += 1;
    state.cash += net;
    const depositGrowth = Math.round(state.customers * (state.depositApy >= 4 ? 1.9 : 1.1));
    state.deposits += depositGrowth;
    state.cash += depositGrowth;
    state.customers += Math.floor(2 + Math.random() * 5);
    const cashShortfall = state.cash < state.deposits * 0.1;
    if (cashShortfall) {
      state.reputation = Math.max(0, state.reputation - 1);
      record("Cash reserves fell below the 10% safety guideline. Consider raising liquidity.", "warn");
    }

    if (state.inTransit) {
      const delivery = state.inTransit;
      const branch = state.branches.find((item) => item.id === delivery.branchId);
      if (branch) {
        const delivered = delivery.direction === "to-branch"
          ? Math.min(delivery.amount, state.vaultCash)
          : Math.min(delivery.amount, branch.cash, Math.max(0, vaultCapacity() - state.vaultCash));
        if (delivery.direction === "to-branch") {
          branch.cash += delivered;
          state.vaultCash -= delivered;
        } else {
          branch.cash -= delivered;
          state.vaultCash += delivered;
        }
        const destination = delivery.direction === "to-branch" ? branch.name : "the central vault";
        record(`${money(delivered)} armored cash delivery arrived at ${destination}.`);
        if (delivered < delivery.amount) record("Delivery was limited by available vault cash or capacity.", "warn");
      }
      state.inTransit = null;
    }

    for (const branch of state.branches) {
      const robberyChance = Math.max(0.005, 0.045 - (state.securityLevel - 1) * 0.008 - (branch.security - 1) * 0.003);
      if (branch.cash > 130000 && Math.random() < robberyChance) {
        const loss = Math.min(branch.cash, 18000 + Math.random() * 40000);
        branch.cash -= loss;
        state.cash -= loss;
        state.reputation = Math.max(0, state.reputation - 3);
        record(`A security incident at ${branch.name} cost ${money(loss)}. Upgrade branch protection.`, "warn");
      }
    }

    if (state.day >= state.nextApplicationDay) {
      const score = Math.floor(540 + Math.random() * 281);
      const names = [["Noah Williams", "NW"], ["Ava Thompson", "AT"], ["Leo Martinez", "LM"], ["Zoe Kim", "ZK"], ["Sam Rivera", "SR"], ["Iris Wilson", "IW"]];
      const [name, initials] = names[Math.floor(Math.random() * names.length)];
      const amount = Math.round((8000 + Math.random() * 52000) / 500) * 500;
      state.applications.unshift({ id: state.nextId++, name, initials, purpose: ["Small business", "Auto loan", "Home improvement"][Math.floor(Math.random() * 3)], amount, score, risk: score >= 720 ? "Low" : score >= 640 ? "Moderate" : "High", status: "pending" });
      state.applications = state.applications.slice(0, 30);
      state.nextApplicationDay = state.day + 2 + Math.floor(Math.random() * 3);
      record(`New ${money(amount)} loan application from ${name} is ready for review.`);
    }
    if (state.day % 7 === 0) {
      const event = Math.random();
      if (event < 0.35) {
        const bonus = 8000 + Math.floor(Math.random() * 12000);
        state.cash += bonus;
        state.reputation = Math.min(100, state.reputation + 2);
        record(`A strong customer week earned ${money(bonus)} in service fees. Reputation improved.`);
      } else if (event < 0.55) {
        const loss = Math.min(state.cash, 5000 + Math.floor(Math.random() * 15000));
        state.cash -= loss;
        record(`A market disruption cost the bank ${money(loss)}. Review your risk exposure.`, "warn");
      } else {
        record("Weekly portfolio review: your team reports normal operations.");
      }
    }
    state.history.push({ day: state.day, cash: Math.round(state.cash) });
    state.history = state.history.slice(-30);
    record(`Day ${state.day} closed. Net operating result: ${money(net)}.`);
    save();
    render();
    notify(`Day ${state.day} closed · net operations ${money(net)}`);
  }

  function newBranch(x, y) {
    const available = locations.find((place) => !state.branches.some((branch) => branch.name === place.name));
    if (!available) {
      notify("All city districts are already covered.");
      return;
    }
    if (state.cash < 250000) {
      notify("Not enough available cash. Opening a branch costs $250,000.");
      return;
    }
    const coords = x === undefined ? { x: available.x, y: available.y } : { x, y };
    state.cash -= 250000;
    const seedCash = Math.min(50000, state.vaultCash);
    const branch = { id: state.nextId++, name: available.name, x: coords.x, y: coords.y, level: 1, staff: 6, security: 2, cash: seedCash, location: available.district };
    state.branches.push(branch);
    state.vaultCash -= seedCash;
    state.selectedBranch = branch.id;
    state.placeMode = false;
    record(`New ${branch.name} branch opened for ${money(250000)}.`);
    render();
    notify(`${branch.name} branch is now open!`);
  }

  function upgradeBranch(id) {
    const branch = state.branches.find((item) => item.id === id);
    if (!branch) return;
    const cost = 175000 + branch.level * 100000;
    if (state.cash < cost) return notify(`You need ${money(cost)} available to upgrade ${branch.name}.`);
    state.cash -= cost;
    branch.level += 1;
    branch.staff += 3;
    state.reputation = Math.min(100, state.reputation + 1);
    record(`${branch.name} upgraded to level ${branch.level}.`);
    render();
    notify(`${branch.name} capacity expanded to ${(branch.level * 650).toLocaleString()} customers.`);
  }

  function applyUpgrade(key) {
    const branch = selected();
    if (key === "branch-security" && branch && branch.security >= 5) {
      return notify("Branch security is already at maximum.");
    }
    const upgrades = {
      vault: { cost: 180000 + state.vaultLevel * 120000, run: () => { state.vaultLevel += 1; } },
      security: { cost: 95000 + state.securityLevel * 80000, run: () => { state.securityLevel += 1; state.reputation = Math.min(100, state.reputation + 3); } },
      vehicle: { cost: 140000, run: () => { state.vehicles += 1; } },
      "branch-security": { cost: branch ? 75000 + branch.security * 45000 : 75000, run: () => { if (branch) branch.security += 1; } }
    };
    const upgrade = upgrades[key];
    if (!upgrade) return;
    if (key === "branch-security" && !branch) return notify("Open a branch before upgrading its security.");
    if (state.cash < upgrade.cost) return notify(`You need ${money(upgrade.cost)} available for this upgrade.`);
    upgrade.run();
    state.cash -= upgrade.cost;
    record(`Purchased ${key === "branch-security" ? `${branch.name} security` : key} upgrade for ${money(upgrade.cost)}.`);
    render();
    notify("Upgrade installed successfully.");
  }

  function transportCash(direction = "to-branch") {
    const branch = selected();
    if (!branch) return notify("Select a branch to dispatch cash.");
    if (!state.vehicles) return notify("Purchase an armored vehicle before dispatching cash.");
    if (state.inTransit) return notify("An armored vehicle is already on a delivery.");
    const available = direction === "to-branch"
      ? state.vaultCash
      : Math.min(branch.cash, Math.max(0, vaultCapacity() - state.vaultCash));
    const amount = Math.min(100000, available);
    if (!amount) return notify("No available cash for this delivery.");
    state.inTransit = { branchId: branch.id, branchName: branch.name, amount, direction };
    const destination = direction === "to-branch" ? branch.name : "the central vault";
    record(`Armored transport dispatched with ${money(amount)} for ${destination}.`);
    render();
    notify(`${money(amount)} dispatched to ${destination} · arrives after you end the day.`);
  }

  function decideLoan(id, decision) {
    const application = state.applications.find((item) => item.id === id);
    if (!application || application.status !== "pending") return;
    if (decision === "approve") {
      if (application.score < state.minCreditScore) {
        return notify(`Score ${application.score} is below your ${state.minCreditScore} minimum. Adjust policy or deny this application.`);
      }
      if (state.cash - application.amount < state.deposits * 0.1) {
        return notify("This loan would put cash reserves below 10% of deposits. Raise more capital before approving.");
      }
      application.status = "approved";
      state.cash -= application.amount;
      state.loans += application.amount;
      state.reputation = Math.min(100, state.reputation + (application.score >= 700 ? 1 : 0));
      record(`${application.name}'s ${money(application.amount)} loan was approved at ${state.loanApr.toFixed(1)}% APR.`);
      notify(`Loan approved · ${money(application.amount)} added to your portfolio.`);
    } else {
      application.status = "denied";
      record(`${application.name}'s ${money(application.amount)} application was declined.`);
      notify("Application declined.");
    }
    render();
  }

  function setupMap() {
    const wrap = document.querySelector("#map-wrap");
    const world = document.querySelector("#map-world");
    if (!wrap || !world) return;
    const applyTransform = () => { world.style.transform = `translate(${state.mapX}px,${state.mapY}px) scale(${state.mapZoom})`; };
    wrap.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".map-pin") || event.target.closest(".map-tool")) return;
      mapDrag = { x: event.clientX, y: event.clientY, mapX: state.mapX, mapY: state.mapY, moved: false };
      wrap.setPointerCapture(event.pointerId);
    });
    wrap.addEventListener("pointermove", (event) => {
      if (!mapDrag) return;
      const dx = event.clientX - mapDrag.x;
      const dy = event.clientY - mapDrag.y;
      if (Math.abs(dx) + Math.abs(dy) > 5) mapDrag.moved = true;
      state.mapX = mapDrag.mapX + dx;
      state.mapY = mapDrag.mapY + dy;
      applyTransform();
    });
    wrap.addEventListener("pointerup", (event) => {
      if (!mapDrag) return;
      const wasDrag = mapDrag.moved;
      mapDrag = null;
      if (state.placeMode && !wasDrag) {
        const rect = wrap.getBoundingClientRect();
        const x = Math.max(4, Math.min(94, ((event.clientX - rect.left - state.mapX) / state.mapZoom) / 1060 * 100));
        const y = Math.max(4, Math.min(94, ((event.clientY - rect.top - state.mapY) / state.mapZoom) / 710 * 100));
        newBranch(x, y);
      } else {
        save();
      }
    });
    wrap.addEventListener("wheel", (event) => {
      event.preventDefault();
      state.mapZoom = Math.max(.65, Math.min(1.7, state.mapZoom + (event.deltaY < 0 ? .08 : -.08)));
      applyTransform();
      save();
    }, { passive: false });
  }

  document.addEventListener("click", (event) => {
    const tabButton = event.target.closest("[data-tab]");
    if (tabButton) {
      event.preventDefault();
      activeTab = tabButton.dataset.tab;
      state.placeMode = false;
      render();
      return;
    }
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const { action, id } = actionButton.dataset;
    if (action === "end-day") finishDay();
    else if (action === "place-branch") {
      if (state.branches.length >= locations.length) return notify("All city districts are already covered.");
      if (state.cash < 250000) return notify("You need $250,000 to open a branch.");
      state.placeMode = true;
      activeTab = "dashboard";
      render();
      notify("Click anywhere on the map to choose your new branch location.");
    } else if (action === "select-branch") {
      state.selectedBranch = Number(id);
      render();
    } else if (action === "zoom-in") {
      state.mapZoom = Math.min(1.7, state.mapZoom + .12);
      render();
    } else if (action === "zoom-out") {
      state.mapZoom = Math.max(.65, state.mapZoom - .12);
      render();
    } else if (action === "recenter") {
      state.mapX = -88;
      state.mapY = -74;
      state.mapZoom = 1;
      render();
    } else if (action === "upgrade-branch") upgradeBranch(Number(id));
    else if (action === "upgrade") applyUpgrade(actionButton.dataset.upgrade);
    else if (action === "transport") transportCash("to-branch");
    else if (action === "transport-return") transportCash("to-vault");
    else if (action === "decide-loan") decideLoan(Number(id), actionButton.dataset.decision);
  });

  document.addEventListener("input", (event) => {
    const setting = event.target.dataset.setting;
    if (!setting) return;
    state[setting] = Number(event.target.value);
    const output = document.querySelector(`#${event.target.id.replace("range", "output")}`);
    if (output) output.value = setting === "minCreditScore" ? state[setting] : `${state[setting].toFixed(2)}%`;
    if (setting === "minCreditScore") output.textContent = state[setting];
    else output.textContent = `${state[setting].toFixed(2)}%`;
    save();
    if (setting === "minCreditScore") {
      const qualifies = document.querySelector(".loan-rule strong:last-child");
      if (qualifies) qualifies.textContent = `${state.applications.filter((a) => a.status === "pending" && a.score >= state.minCreditScore).length} qualify now`;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.placeMode) {
      state.placeMode = false;
      render();
      notify("Branch placement cancelled.");
    }
  });

  render();
})();
