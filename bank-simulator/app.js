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
  const investmentProducts = [
    { symbol: "GOV", name: "Government bonds", risk: "Low risk", color: "bond", volatility: .0018, yield: .0001 },
    { symbol: "MUNI", name: "Municipal bonds", risk: "Balanced", color: "muni", volatility: .0038, yield: .00012 },
    { symbol: "IDX", name: "Market index fund", risk: "Growth", color: "index", volatility: .009, yield: .00008 }
  ];
  const callScenarios = [
    { need: "A dependable place for a house deposit", product: "Home-buyer savings", amount: 68000, apy: 3.1, prompt: "I'm saving for a home, but I want to know what I'm getting into before I move my money.", priority: "Straightforward fees and clear terms", best: "clarity" },
    { need: "Better return on an emergency fund", product: "High-yield savings", amount: 42000, apy: 3.8, prompt: "My savings barely earn anything now. Can you offer a rate that makes switching worthwhile?", priority: "A competitive savings rate", best: "rate" },
    { need: "A low-hassle account for everyday use", product: "Rewards checking", amount: 28500, apy: 2.2, prompt: "I don't want surprise fees or a long list of conditions for a checking account.", priority: "Flexible access without gotcha fees", best: "flexibility" },
    { need: "A trusted bank for a growing business", product: "Business checking", amount: 92500, apy: 2.6, prompt: "My business is growing, and I need a bank that will actually pick up when I need help.", priority: "Reliable, personal support", best: "support" },
    { need: "A safe place for a future tuition bill", product: "Education savings", amount: 53000, apy: 3.4, prompt: "I'm putting money aside for school. I need steady terms I can plan around.", priority: "Predictable terms and no pressure", best: "clarity" },
    { need: "A simple account for a new side business", product: "Small-business checking", amount: 36500, apy: 2.9, prompt: "I'm just getting started. I need something easy, and I can't lock up all my cash.", priority: "Low commitment and easy access", best: "flexibility" }
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
    reserveTarget: 15,
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
    activeLoans: [
      { id: 1, clientId: 1, borrower: "Maya Chen", purpose: "Business expansion", principal: 690000, balance: 690000, apr: 7.4, remainingDays: 780, totalInterestPaid: 14200, collateralType: "Business assets", collateralValue: 890000, paymentStatus: "Ahead", missedDays: 0, repaymentReliability: .99, extraPaymentChance: .09, paymentHistory: [1, 2, 1, 1, 2, 1, 2], status: "active" },
      { id: 2, clientId: 2, borrower: "Ravi Shah", purpose: "Commercial property", principal: 980000, balance: 980000, apr: 8.1, remainingDays: 1190, totalInterestPaid: 28700, collateralType: "Commercial property", collateralValue: 1420000, paymentStatus: "On schedule", missedDays: 0, repaymentReliability: .97, extraPaymentChance: .05, paymentHistory: [1, 1, 1, 1, 1, 1, 1], status: "active" },
      { id: 3, clientId: 3, borrower: "Elise Morgan", purpose: "Equipment financing", principal: 760000, balance: 760000, apr: 9.2, remainingDays: 930, totalInterestPaid: 18100, collateralType: "Manufacturing equipment", collateralValue: 910000, paymentStatus: "Late · 2 days", missedDays: 2, repaymentReliability: .88, extraPaymentChance: .025, paymentHistory: [1, 0, 0, 1, 1, 0, 0], status: "active" },
      { id: 4, clientId: 4, borrower: "Daniel Park", purpose: "Auto loan", principal: 350000, balance: 350000, apr: 8.5, remainingDays: 720, totalInterestPaid: 0, collateralType: "Vehicle", collateralValue: 415000, paymentStatus: "On schedule", missedDays: 0, repaymentReliability: .94, extraPaymentChance: .04, paymentHistory: [1, 1, 1, 1, 1, 1, 1], status: "active" },
      { id: 5, clientId: 5, borrower: "Noah Williams", purpose: "Small business", principal: 320000, balance: 320000, apr: 7.8, remainingDays: 1080, totalInterestPaid: 0, collateralType: "Business equipment", collateralValue: 420000, paymentStatus: "Ahead", missedDays: 0, repaymentReliability: .99, extraPaymentChance: .1, paymentHistory: [1, 2, 2, 1, 2, 1, 2], status: "active" }
    ],
    accounts: [
      { id: 1, clientId: 1, type: "Business checking", balance: 420000, apy: 1.5, status: "active" },
      { id: 2, clientId: 2, type: "Personal savings", balance: 360000, apy: 2.4, status: "active" },
      { id: 3, clientId: 3, type: "Business savings", balance: 240000, apy: 2, status: "active" },
      { id: 4, clientId: 4, type: "Personal checking", balance: 180000, apy: 0.5, status: "active" }
    ],
    clients: [
      { id: 1, name: "Maya Chen", initials: "MC", score: 748, anger: 8, status: "active", sentiment: "Happy" },
      { id: 2, name: "Ravi Shah", initials: "RS", score: 721, anger: 16, status: "active", sentiment: "Calm" },
      { id: 3, name: "Elise Morgan", initials: "EM", score: 693, anger: 12, status: "active", sentiment: "Calm" },
      { id: 4, name: "Daniel Park", initials: "DP", score: 684, anger: 22, status: "active", sentiment: "Calm" },
      { id: 5, name: "Noah Williams", initials: "NW", score: 755, anger: 10, status: "active", sentiment: "Happy" },
      { id: 6, name: "Zoe Kim", initials: "ZK", score: 712, anger: 28, status: "active", sentiment: "Waiting" },
      { id: 7, name: "Leo Martinez", initials: "LM", score: 705, anger: 18, status: "active", sentiment: "Waiting" },
      { id: 8, name: "Amara Okafor", initials: "AO", score: 736, anger: 34, status: "active", sentiment: "Waiting" },
      { id: 9, name: "Sam Rivera", initials: "SR", score: 704, anger: 16, status: "active", sentiment: "Calm" },
      { id: 10, name: "Iris Wilson", initials: "IW", score: 768, anger: 11, status: "active", sentiment: "Happy" },
      { id: 11, name: "Omar Jones", initials: "OJ", score: 664, anger: 26, status: "active", sentiment: "Waiting" }
    ],
    requests: [
      { id: 6, clientId: 6, channel: "message", kind: "account-open", amount: 24000, product: "High-yield savings", age: 0, status: "pending" },
      { id: 7, clientId: 7, channel: "call", kind: "loan-open", amount: 28000, product: "Auto loan", age: 0, status: "pending" },
      { id: 8, clientId: 8, channel: "message", kind: "account-open", amount: 50000, product: "Business savings", age: 0, status: "pending" },
      { id: 9, clientId: 1, channel: "call", kind: "withdrawal", accountId: 1, amount: 120000, product: "Business checking", age: 0, status: "pending" },
      { id: 10, clientId: 2, channel: "message", kind: "withdrawal", accountId: 2, amount: 160000, product: "Personal savings", age: 0, status: "pending" },
      { id: 11, clientId: 4, channel: "call", kind: "withdrawal", accountId: 4, amount: 90000, product: "Personal checking", age: 0, status: "pending" }
    ],
    completedLoans: [],
    completedRequests: [],
    tutorialComplete: false,
    history: [{ day: 1, cash: 2200000 }],
    log: [
      { day: 1, text: "Commonwealth Bank opened for business", type: "good" },
      { day: 1, text: "Three branches are welcoming customers", type: "good" },
      { day: 1, text: "Review your first loan applications", type: "warn" }
    ],
    nextId: 14,
    mapX: -88,
    mapY: -74,
    mapZoom: 1,
    selectedBranch: 1,
    nextApplicationDay: 4,
    nextRequestDay: 2,
    secondsRemaining: 240,
    clockPaused: false,
    activityCountdown: 14,
    callCountdown: 36,
    marketCountdown: 18,
    lastActivityType: "",
    eventCountdown: 54,
    lastMailSubject: "",
    lastCallScenario: -1,
    investments: [],
    cashflowHistory: [],
    marketPrices: { GOV: 100, MUNI: 100, IDX: 100 },
    mail: [
      { id: 12, from: "Treasury analyst", subject: "Morning market brief", body: "Bond yields are steady and the market index is trading normally. Consider balancing safe income with growth.", kind: "brief", read: false, status: "new" },
      { id: 13, from: "City business council", subject: "Small-business banking opportunity", body: "A local business group is looking for a bank partner. Accept the introduction to earn a referral bonus and build your reputation.", kind: "referral", read: false, status: "new" }
    ],
    meetings: [],
    inTransit: null,
    placeMode: false
  });

  const readSave = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (saved && saved.version === 1 && saved.state && Array.isArray(saved.state.branches)) {
        const initial = starterState();
        const restored = { ...initial, ...saved.state };
        if (!Array.isArray(saved.state.activeLoans)) {
          const legacyLoans = saved.state.loans || initial.loans;
          restored.activeLoans = [{ id: 1, clientId: null, borrower: "Legacy loan portfolio", purpose: "Existing portfolio", principal: legacyLoans, balance: legacyLoans, apr: saved.state.loanApr || initial.loanApr, remainingDays: 1095, totalInterestPaid: 0, status: "active" }];
        }
        for (const key of ["accounts", "clients", "requests", "completedLoans", "completedRequests"]) {
          if (!Array.isArray(saved.state[key])) restored[key] = initial[key];
        }
        for (const key of ["investments", "cashflowHistory", "mail", "meetings"]) {
          if (!Array.isArray(saved.state[key])) restored[key] = initial[key];
        }
        restored.marketPrices = { ...initial.marketPrices, ...(saved.state.marketPrices || {}) };
        restored.secondsRemaining = Number.isFinite(restored.secondsRemaining) ? Math.min(240, Math.max(0, restored.secondsRemaining)) : 240;
        restored.clockPaused = Boolean(restored.clockPaused);
        restored.activityCountdown = Number.isFinite(restored.activityCountdown) ? Math.max(1, restored.activityCountdown) : 14;
        restored.callCountdown = Number.isFinite(restored.callCountdown) ? Math.max(1, restored.callCountdown) : 36;
        restored.marketCountdown = Number.isFinite(restored.marketCountdown) ? Math.max(1, restored.marketCountdown) : 18;
        restored.eventCountdown = Number.isFinite(restored.eventCountdown) ? Math.max(1, restored.eventCountdown) : 54;
        restored.lastActivityType = typeof restored.lastActivityType === "string" ? restored.lastActivityType : "";
        restored.lastMailSubject = typeof restored.lastMailSubject === "string" ? restored.lastMailSubject : "";
        restored.lastCallScenario = Number.isInteger(restored.lastCallScenario) ? restored.lastCallScenario : -1;
        restored.reserveTarget = Number.isFinite(restored.reserveTarget) ? Math.min(35, Math.max(10, restored.reserveTarget)) : initial.reserveTarget;
        restored.nextRequestDay = Number.isFinite(restored.nextRequestDay) ? restored.nextRequestDay : initial.nextRequestDay;
        for (const loan of restored.activeLoans) {
          loan.collateralType = loan.collateralType || "Unsecured";
          loan.collateralValue = Number.isFinite(loan.collateralValue) ? loan.collateralValue : 0;
          loan.paymentStatus = loan.paymentStatus || "On schedule";
          loan.missedDays = Number.isFinite(loan.missedDays) ? loan.missedDays : 0;
          loan.repaymentReliability = Number.isFinite(loan.repaymentReliability) ? loan.repaymentReliability : .97;
          loan.extraPaymentChance = Number.isFinite(loan.extraPaymentChance) ? loan.extraPaymentChance : .04;
          loan.paymentHistory = Array.isArray(loan.paymentHistory) ? loan.paymentHistory : [];
        }
        restored.meetings = restored.meetings.map((meeting, index) => {
          const fallback = callScenarios[index % callScenarios.length];
          return {
            ...fallback, ...meeting,
            need: meeting.need || fallback.need,
            priority: meeting.priority || fallback.priority,
            product: meeting.product || fallback.product,
            amount: Number.isFinite(meeting.amount) ? meeting.amount : fallback.amount,
            apy: Number.isFinite(meeting.apy) ? meeting.apy : fallback.apy,
            best: meeting.best || fallback.best,
            rapport: Number.isFinite(meeting.rapport) ? meeting.rapport : 0,
            turn: Number.isFinite(meeting.turn) ? meeting.turn : 0,
            transcript: Array.isArray(meeting.transcript) ? meeting.transcript : [{ from: "Customer", text: meeting.prompt || fallback.prompt }],
            incentive: Boolean(meeting.incentive),
            discovered: Boolean(meeting.discovered),
            pitched: Boolean(meeting.pitched)
          };
        });
        const ids = [
          ...restored.branches, ...restored.applications, ...restored.activeLoans,
          ...restored.accounts, ...restored.clients, ...restored.requests,
          ...restored.mail, ...restored.meetings
        ].map((item) => Number(item.id) || 0);
        restored.nextId = Math.max(Number(restored.nextId) || 1, ...ids.map((id) => id + 1));
        return restored;
      }
    } catch (error) {
      console.warn("Could not read the saved bank simulator game.", error);
    }
    return starterState();
  };

  let state = readSave();
  let activeTab = "dashboard";
  let tutorialStep = 0;
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
  const activeLoanList = () => state.activeLoans.filter((loan) => loan.status === "active" && loan.balance > 0);
  const accountList = () => state.accounts.filter((account) => account.status === "active");
  const clientById = (id) => state.clients.find((client) => client.id === id);
  const pendingRequestCount = () => state.requests.filter((request) => request.status === "pending" || request.status === "offered").length;
  const pendingWithdrawalAmount = () => state.requests
    .filter((request) => request.status === "pending" && (request.kind === "withdrawal" || request.kind === "account-close"))
    .reduce((sum, request) => {
      const account = state.accounts.find((item) => item.id === request.accountId);
      return sum + (account ? Math.min(request.amount, account.balance) : request.amount);
    }, 0);
  const committedLoanOffers = () => state.requests
    .filter((request) => request.status === "offered" && request.kind === "loan-open")
    .reduce((sum, request) => sum + request.amount, 0);
  const requiredReserve = () => state.deposits * state.reserveTarget / 100;
  const lendableCash = () => Math.max(0, Math.floor(state.cash - requiredReserve() - pendingWithdrawalAmount() - committedLoanOffers()));
  const investmentValue = () => state.investments.reduce((sum, holding) => sum + holding.units * (state.marketPrices[holding.symbol] || 100), 0);
  const dailyPayroll = () => state.branches.reduce((sum, branch) => sum + branch.staff * 35, 0);
  const dailyLoanInterest = () => activeLoanList().reduce((sum, loan) => sum + loan.balance * loan.apr / 36500, 0);
  const dailyInvestmentIncome = () => state.investments.reduce((sum, holding) => {
    const product = investmentProducts.find((item) => item.symbol === holding.symbol);
    return sum + holding.units * (state.marketPrices[holding.symbol] || 100) * (product ? product.yield : 0);
  }, 0);
  const dailyServiceIncome = () => state.customers * .18;
  const dailyBranchCosts = () => state.branches.length * 850;
  const dailyVehicleCosts = () => state.vehicles * 90;
  const projectedIncome = () => dailyLoanInterest() + dailyServiceIncome() + dailyInvestmentIncome();
  const projectedExpenses = () => dailyDepositInterest() + dailyBranchCosts() + dailyPayroll() + dailyVehicleCosts();
  const dailyDepositInterest = () => {
    const accounts = accountList();
    const managedBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    const legacyBalance = Math.max(0, state.deposits - managedBalance);
    return legacyBalance * state.depositApy / 36500
      + accounts.reduce((sum, account) => sum + account.balance * account.apy / 36500, 0);
  };
  const weightedDepositApy = () => state.deposits ? dailyDepositInterest() * 36500 / state.deposits : state.depositApy;
  const weightedLoanApr = () => {
    const loans = activeLoanList();
    const balance = loans.reduce((sum, loan) => sum + loan.balance, 0);
    return balance ? loans.reduce((sum, loan) => sum + loan.balance * loan.apr, 0) / balance : state.loanApr;
  };
  const collateralFor = (purpose, amount) => {
    const type = /auto|vehicle/i.test(purpose) ? "Vehicle"
      : /property|home/i.test(purpose) ? "Property"
        : /equipment/i.test(purpose) ? "Equipment" : /business/i.test(purpose) ? "Business assets" : "Unsecured";
    const multiplier = type === "Property" ? 1.4 : type === "Equipment" ? 1.2 : type === "Vehicle" ? 1.15 : type === "Business assets" ? 1.1 : 0;
    return { collateralType: type, collateralValue: Math.round(amount * multiplier) };
  };
  const equity = () => state.cash + state.loans + investmentValue() - state.deposits;
  const reserveRatio = () => state.deposits ? state.cash / state.deposits * 100 : 100;
  const vaultCapacity = () => 500000 + (state.vaultLevel - 1) * 750000;
  const record = (text, type = "good") => {
    state.log.unshift({ day: state.day, text, type });
    state.log = state.log.slice(0, 8);
  };
  function defaultLoan(loan) {
    const recovery = Math.min(loan.balance, Math.round(loan.collateralValue * .72));
    state.cash += recovery;
    loan.recoveredCollateral = recovery;
    loan.defaultLoss = loan.balance - recovery;
    loan.balance = 0;
    loan.status = "defaulted";
    loan.paymentStatus = "Defaulted";
    state.completedLoans.unshift({ ...loan, payoffDay: state.day + 1 });
    state.completedLoans = state.completedLoans.slice(0, 30);
    state.reputation = Math.max(0, state.reputation - 5);
    record(`${loan.borrower}'s loan defaulted. Collateral recovered ${money(recovery)}; loss ${money(loan.defaultLoss)}.`, "warn");
  }
  const save = () => localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, state }));
  const notify = (message) => {
    toastElement.textContent = message;
    toastElement.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastElement.classList.remove("show"), 2800);
  };
  function refreshLiquidity() {
    const lendable = lendableCash();
    const values = {
      "#lendable-cash": compact(lendable),
      "#cash-on-hand": compact(state.cash),
      "#reserve-amount": compact(requiredReserve()),
      "#withdrawal-reserve": compact(pendingWithdrawalAmount()),
      "#loan-commitments": compact(committedLoanOffers()),
      "#liquidity-status": lendable > 0 ? "Reserve & requests covered" : "No safe lending capacity"
    };
    for (const [selector, value] of Object.entries(values)) {
      const node = document.querySelector(selector);
      if (node) node.textContent = value;
    }
    const meter = document.querySelector("#liquidity-meter-fill");
    if (meter) meter.style.width = `${Math.max(0, Math.min(100, reserveRatio()))}%`;
  }
  const pageTitle = (title) => {
    document.querySelector("#page-title").textContent = title;
    document.querySelector("#day-label").textContent = `DAY ${String(state.day).padStart(2, "0")}`;
    document.querySelector("#branch-count").textContent = state.branches.length;
    document.querySelector("#application-count").textContent = pendingCount() || "";
    document.querySelector("#request-count").textContent = pendingRequestCount() || "";
    document.querySelector("#call-count").textContent = state.meetings.filter((meeting) => meeting.status === "waiting").length || "";
    document.querySelector("#mail-count").textContent = state.mail.filter((message) => !message.read && message.status === "new").length || "";
    document.querySelector("#customer-count").textContent = pendingRequestCount() + state.meetings.filter((meeting) => meeting.status === "waiting").length + state.mail.filter((message) => !message.read && message.status === "new").length || "";
    document.querySelector("#finance-count").textContent = pendingCount() || "";
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.tab === activeTab));
    refreshLiquidity();
  };
  const header = (eyebrow, title, subtitle, action = "") => `
    <div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="subtitle">${subtitle}</p></div>${action}</div>`;
  const metric = (label, value, note, icon, positive = true) => `
    <div class="metric-card" data-metric="${label}"><div class="metric-head"><span>${label}</span><span class="metric-icon">${icon}</span></div>
    <div class="metric-value">${value}</div><div class="metric-foot"><span class="${positive ? "positive" : "negative"}">${note}</span></div></div>`;
  const logMarkup = (limit = 4) => state.log.slice(0, limit).map((entry) => `
    <div class="activity-item"><span class="activity-bullet ${entry.type === "warn" ? "warn-dot" : ""}"></span>
    <p>${escapeHtml(entry.text)}<small>Day ${entry.day}</small></p></div>`).join("");
  const selected = () => state.branches.find((branch) => branch.id === state.selectedBranch) || state.branches[0];

  function render() {
    const renderers = {
      dashboard: renderDashboard, branches: renderBranches, lending: renderLending, loans: renderActiveLoans,
      clients: renderClients, calls: renderZoomCalls, mail: renderMail, investments: renderInvestments,
      cashflow: renderCashflow, staff: renderStaff, treasury: renderTreasury, security: renderSecurity
    };
    const titles = {
      dashboard: "Overview", branches: "Branches", lending: "Lending", loans: "Active loans",
      clients: "Client desk", calls: "Sales calls", mail: "Mail & email", investments: "Investments", cashflow: "Income & expenses",
      staff: "People & payroll", treasury: "Treasury", security: "Security & vault"
    };
    pageTitle(titles[activeTab]);
    screen.innerHTML = renderers[activeTab]();
    setupMap();
    renderTutorial();
    save();
  }

  function renderTutorial() {
    const layer = document.querySelector("#tutorial-layer");
    if (state.tutorialComplete) {
      layer.innerHTML = "";
      return;
    }
    const steps = [
      { title: "Welcome to Commonwealth", text: "You’re the owner. Grow a trusted city bank by expanding branches, managing money, and taking care of the people who bank with you.", icon: "✦", tab: "dashboard" },
      { title: "Explore your city", text: "Your map moves and zooms. Open new locations, upgrade branches, and send armored cash where your teams need it.", icon: "⌖", tab: "branches" },
      { title: "Make thoughtful loans", text: "Review credit scores and risk in Lending. Every approved loan appears in Active loans, where you can track its APR, daily payment, and payoff.", icon: "↗", tab: "lending" },
      { title: "Follow repayments", text: "Open Active loans to see each balance, APR, daily payment, and estimated payoff date. Principal pays down automatically every day.", icon: "▤", tab: "loans" },
      { title: "Set up fair offers", text: "Clients call and message about accounts and loans. Set an APY or APR, send your offer, and the customer decides when the live day closes.", icon: "✉", tab: "clients" },
      { title: "Take the live customer calls", text: "Customers join the call queue as your day runs. Ask what matters, pitch the best-fit account, then invite them to open it. A welcome bonus can help, but trust matters most.", icon: "▣", tab: "calls" },
      { title: "Read the inbox", text: "Mail arrives through the day. Read each note and accept or decline business opportunities and internal recommendations.", icon: "▧", tab: "mail" },
      { title: "Grow the bank", text: "Invest surplus cash in fictional bond or index assets, and hire or fire staff to balance service capacity against payroll.", icon: "◈", tab: "investments" },
      { title: "Work the four-minute day", text: "Each day runs for four real minutes. Pause any time. Serve clients, review loans, manage rates, and invest; daily payments, payroll, and interest settle when the clock reaches zero.", icon: "⏵", tab: "treasury" }
    ];
    const step = steps[tutorialStep] || steps[0];
    layer.innerHTML = `<div class="tutorial-backdrop"></div><section class="tutorial-card" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
      <div class="tutorial-art"><span>${step.icon}</span><div class="tutorial-art-orbit"></div><div class="tutorial-art-orbit second"></div></div>
      <div class="tutorial-copy"><div class="eyebrow">YOUR FIRST DAY · QUICK TOUR</div><div class="tutorial-progress">${steps.map((_, index) => `<i class="${index <= tutorialStep ? "current" : ""}"></i>`).join("")}</div>
        <h2 id="tutorial-title">${step.title}</h2><p>${step.text}</p>
        <div class="tutorial-current"><span class="tutorial-current-icon">${step.icon}</span> <span>Explore: <strong>${step.tab === "lending" ? "Lending & active loans" : step.tab === "clients" ? "Client requests & offers" : step.tab === "calls" ? "Live customer calls" : step.tab === "mail" ? "Mail & email decisions" : step.tab === "investments" ? "Investments & staffing" : step.tab === "treasury" ? "Daily finances & the timer" : step.tab === "branches" ? "Your branch network" : "Bank overview"}</strong></span></div>
        <div class="tutorial-footer"><button class="button button-quiet" data-action="tutorial-skip">Skip tour</button>
          <div><button class="button button-quiet" data-action="tutorial-back" ${tutorialStep === 0 ? "disabled" : ""}>Back</button>
          <button class="button button-primary" data-action="tutorial-next">${tutorialStep === steps.length - 1 ? "Start banking" : "Next"} <span>→</span></button></div></div></div>
      </section>`;
  }

  function advanceTutorial(direction = 1) {
    const lastStep = 8;
    if (direction === 0 || tutorialStep >= lastStep) {
      state.tutorialComplete = true;
      document.querySelector("#tutorial-layer").innerHTML = "";
      save();
      return;
    }
    tutorialStep = Math.max(0, Math.min(lastStep, tutorialStep + direction));
    const tabs = ["dashboard", "branches", "lending", "loans", "clients", "calls", "mail", "investments", "treasury"];
    activeTab = tabs[tutorialStep];
    render();
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
    const netIncome = dailyLoanInterest() - dailyDepositInterest();
    const chosen = selected();
    const dayHeading = `DAY ${String(state.day).padStart(2, "0")} · FOUNDER'S OFFICE`;
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
            <div class="finance-row"><span>Loan interest income</span><strong class="positive">+${money(dailyLoanInterest())}</strong></div>
            <div class="finance-row"><span>Deposit interest cost</span><strong class="negative">−${money(dailyDepositInterest())}</strong></div>
            <div class="finance-row"><span>Branch operating costs & payroll</span><strong class="negative">−${money(state.branches.length * 850 + dailyPayroll())}</strong></div>
            <div class="finance-row"><span>Net interest income</span><strong class="${netIncome > 0 ? "positive" : "negative"}">${money(dailyLoanInterest() - dailyDepositInterest())}</strong></div>
          </div></div>
          <div class="panel"><div class="panel-heading"><div><h2>Branch overview</h2><p>${chosen ? escapeHtml(chosen.name) : "No branches yet"} · selected branch</p></div></div>
            ${chosen ? `<div class="health-row"><span>Security rating</span><strong>${"★".repeat(chosen.security)}${"☆".repeat(5 - chosen.security)}</strong></div>
            <div class="health-row"><span>Cash on hand</span><b>${money(chosen.cash)}</b></div>
            <div class="health-row"><span>Customer capacity</span><b>${(chosen.level * 650 + chosen.staff * 40).toLocaleString()}</b></div>
            <div class="health-meter"><span style="width:${Math.min(100, chosen.security * 20)}%"></span></div>
            <div class="quick-actions"><button class="button" data-action="transport">🚚 Send cash</button><button class="button" data-tab="branches">Manage branches</button></div>` : `<div class="empty-state">Open a branch to get started.</div>`}
          </div>
          <div class="panel shift-panel"><div class="panel-heading"><div><h2>Your active shift</h2><p>There's always another way to grow the bank</p></div><span class="badge badge-blue" id="shift-countdown">${clockLabel()} LEFT</span></div>
            <div class="shift-actions"><button class="shift-action" data-tab="clients"><span>✉</span><strong>Serve clients</strong><small>${pendingRequestCount()} conversations</small></button>
              <button class="shift-action" data-tab="calls"><span>▣</span><strong>Join a call</strong><small>${state.meetings.filter((meeting) => meeting.status === "waiting").length} waiting</small></button>
              <button class="shift-action" data-tab="lending"><span>↗</span><strong>Review credit</strong><small>${pendingCount()} decisions</small></button>
              <button class="shift-action" data-tab="mail"><span>▧</span><strong>Read mail</strong><small>${state.mail.filter((message) => !message.read && message.status === "new").length} unread</small></button>
              <button class="shift-action" data-tab="investments"><span>◈</span><strong>Invest assets</strong><small>${compact(investmentValue())} invested</small></button>
              <button class="shift-action" data-tab="staff"><span>♙</span><strong>Manage team</strong><small>${state.branches.reduce((sum, branch) => sum + branch.staff, 0)} employees</small></button></div>
            <div class="quick-actions"><button class="button" data-tab="treasury">Adjust rates & reserves</button><button class="button" data-tab="branches">Grow the network</button></div></div>
        </div></div>
      ${cashflowPanel()}`;
  }

  function cashflowPanel() {
    const income = [
      ["Loan interest", dailyLoanInterest()],
      ["Service fees", dailyServiceIncome()],
      ["Investment yield", dailyInvestmentIncome()]
    ];
    const expenses = [
      ["Deposit interest", dailyDepositInterest()],
      ["Branch operations", dailyBranchCosts()],
      ["Payroll", dailyPayroll()],
      ["Armored fleet", dailyVehicleCosts()]
    ];
    const incomeTotal = income.reduce((sum, [, value]) => sum + value, 0);
    const expenseTotal = expenses.reduce((sum, [, value]) => sum + value, 0);
    const incomeRows = income.map(([label, amount]) => `<div class="cashflow-line"><span>${label}</span><strong>+${money(amount)}</strong></div>`).join("");
    const expenseRows = expenses.map(([label, amount]) => `<div class="cashflow-line"><span>${label}</span><strong>−${money(amount)}</strong></div>`).join("");
    return `<section class="cashflow-section"><div class="cashflow-heading"><div><div class="eyebrow">KEEP THE BANK IN THE BLACK</div><h2>Income & expenses</h2></div>
      <a class="cashflow-link" href="#" data-tab="cashflow">Open full report <span>→</span></a></div>
      <div class="cashflow-grid"><article class="panel cashflow-card income-card"><div class="cashflow-card-heading"><span>EXPECTED DAILY INCOME</span><strong>+${money(incomeTotal)}</strong></div>${incomeRows}</article>
        <article class="panel cashflow-card expense-card"><div class="cashflow-card-heading"><span>EXPECTED DAILY EXPENSES</span><strong>−${money(expenseTotal)}</strong></div>${expenseRows}</article>
        <div class="cashflow-net"><span>Operating outlook <small>before principal repayments and market events</small></span><strong class="${incomeTotal >= expenseTotal ? "positive" : "negative"}">${incomeTotal >= expenseTotal ? "+" : "−"}${money(Math.abs(incomeTotal - expenseTotal))} / day</strong></div>
      </div></section>`;
  }

  function renderCashflow() {
    const latest = state.cashflowHistory.slice(0, 7);
    const estimatedIncome = projectedIncome();
    const estimatedExpenses = projectedExpenses();
    const max = Math.max(1, ...latest.map((entry) => Math.max(entry.income, entry.expenses)), estimatedIncome, estimatedExpenses);
    const historyRows = latest.map((entry) => `<tr><td>Day ${entry.day}</td><td class="positive">+${money(entry.income)}</td><td class="negative">−${money(entry.expenses)}</td>
      <td class="${entry.operatingNet >= 0 ? "positive" : "negative"}">${entry.operatingNet >= 0 ? "+" : "−"}${money(Math.abs(entry.operatingNet))}</td>
      <td>${money(entry.principal)}</td><td class="${entry.cashChange >= 0 ? "positive" : "negative"}">${entry.cashChange >= 0 ? "+" : "−"}${money(Math.abs(entry.cashChange))}</td></tr>`).join("");
    const barRows = latest.slice(0, 5).reverse().map((entry) => `<div class="cashflow-bar-row"><span>DAY ${String(entry.day).padStart(2, "0")}</span><div class="cashflow-bars"><i class="cashflow-bar-income" style="width:${Math.max(2, entry.income / max * 100)}%" title="Income ${money(entry.income)}"></i><i class="cashflow-bar-expense" style="width:${Math.max(2, entry.expenses / max * 100)}%" title="Expenses ${money(entry.expenses)}"></i></div>
      <strong class="${entry.operatingNet >= 0 ? "positive" : "negative"}">${entry.operatingNet >= 0 ? "+" : "−"}${compact(Math.abs(entry.operatingNet))}</strong></div>`).join("");
    return `${header("THE BANK'S MONEY, AT A GLANCE", "Income & expenses", "See where money comes from, what it costs to operate, and how much cash borrowers are paying back.")}
      <div class="metrics">${metric("EXPECTED DAILY INCOME", compact(estimatedIncome), "Interest, services & investment yield", "↗")}
        ${metric("EXPECTED DAILY EXPENSES", compact(estimatedExpenses), "Depositor interest, payroll & overhead", "↘", false)}
        ${metric("OPERATING OUTLOOK", `${estimatedIncome >= estimatedExpenses ? "+" : "−"}${compact(Math.abs(estimatedIncome - estimatedExpenses))}`, "Income less expenses, before loan principal", "◎", estimatedIncome >= estimatedExpenses)}
        ${metric("LOAN PRINCIPAL DUE", compact(activeLoanList().reduce((sum, loan) => sum + loan.balance / Math.max(1, loan.remainingDays), 0)), "Cash collected as borrowers repay", "▤")}</div>
      <div class="cashflow-report-grid"><section class="panel"><div class="panel-heading"><div><h2>Today's daily estimate</h2><p>Figures recalculate when rates, staff, or investments change.</p></div><span class="badge badge-blue">LIVE ESTIMATE</span></div>
        <div class="cashflow-report-columns"><div class="cashflow-report-column"><h3>Income</h3>
          <div class="cashflow-line"><span>Loan interest</span><strong>+${money(dailyLoanInterest())}</strong></div>
          <div class="cashflow-line"><span>Service fees</span><strong>+${money(dailyServiceIncome())}</strong></div>
          <div class="cashflow-line"><span>Investment yield</span><strong>+${money(dailyInvestmentIncome())}</strong></div>
          <div class="cashflow-total"><span>Total expected income</span><strong>+${money(estimatedIncome)}</strong></div></div>
          <div class="cashflow-report-column"><h3>Expenses</h3>
          <div class="cashflow-line"><span>Deposit interest</span><strong>−${money(dailyDepositInterest())}</strong></div>
          <div class="cashflow-line"><span>Branch operations</span><strong>−${money(dailyBranchCosts())}</strong></div>
          <div class="cashflow-line"><span>Payroll</span><strong>−${money(dailyPayroll())}</strong></div>
          <div class="cashflow-line"><span>Armored fleet</span><strong>−${money(dailyVehicleCosts())}</strong></div>
          <div class="cashflow-total"><span>Total expected expenses</span><strong>−${money(estimatedExpenses)}</strong></div></div></div>
        <div class="cashflow-outlook"><span>Estimated operating result</span><strong class="${estimatedIncome >= estimatedExpenses ? "positive" : "negative"}">${estimatedIncome >= estimatedExpenses ? "+" : "−"}${money(Math.abs(estimatedIncome - estimatedExpenses))}</strong></div></section>
        <section class="panel"><div class="panel-heading"><div><h2>Recent daily trend</h2><p>Income vs expenses · operating result</p></div></div>
          <div class="cashflow-legend"><span><i class="cashflow-bar-income"></i>Income</span><span><i class="cashflow-bar-expense"></i>Expenses</span></div>
          <div class="cashflow-chart">${barRows || `<div class="empty-state"><strong>First day in business</strong>Your daily results will appear here after the first four-minute shift.</div>`}</div>
          <div class="cashflow-footnote">Bars scale against the largest day shown. Operating result excludes returned loan principal.</div></section></div>
      <section class="panel cashflow-history-panel"><div class="panel-heading"><div><h2>Day-close ledger</h2><p>Principal repayments are shown separately because they return cash but are not income.</p></div></div>
        <div class="table-wrap"><table class="spreadsheet"><thead><tr><th>Game day</th><th>Income</th><th>Expenses</th><th>Operating result</th><th>Principal collected</th><th>Net cash change</th></tr></thead>
          <tbody>${historyRows || `<tr><td colspan="6"><div class="empty-state"><strong>No closed days yet</strong>Today's live estimate is above. Let the four-minute timer complete to record the first daily result.</div></td></tr>`}</tbody></table></div></section>`;
  }

  function renderBranches() {
    const cards = state.branches.map((branch) => `<article class="panel branch-card">
      <div class="branch-card-top"><div class="branch-card-title"><span class="branch-icon">⌂</span><span><strong>${escapeHtml(branch.name)}</strong><small>${escapeHtml(branch.location)} · Level ${branch.level}</small></span></div><span class="badge">OPEN</span></div>
      <div class="branch-card-body"><div class="branch-info"><span>Cash on hand</span><strong>${money(branch.cash)}</strong></div>
      <div class="branch-info"><span>Staff</span><strong>${branch.staff} employees</strong></div>
      <div class="branch-info"><span>Daily capacity</span><strong>${(branch.level * 650 + branch.staff * 40).toLocaleString()} customers</strong></div>
      <div class="branch-info"><span>Security</span><strong>${"★".repeat(branch.security)}${"☆".repeat(5 - branch.security)}</strong></div></div>
      <div class="branch-card-footer"><span class="badge badge-warn">Operating ${money(850)}/day</span><button class="button" data-action="upgrade-branch" data-id="${branch.id}">Upgrade · ${money(175000 + branch.level * 100000)}</button></div>
      </article>`).join("");
    return `${header("YOUR NETWORK", "Branches", "Build your footprint, upgrade locations, and serve more customers.",
      `<button class="button button-primary" data-action="place-branch">＋ Open a branch · ${money(250000)}</button>`)}
      <div class="stat-grid"><div class="stat-box"><span>Active locations</span><strong>${state.branches.length}</strong></div>
      <div class="stat-box"><span>Network capacity</span><strong>${state.branches.reduce((sum, branch) => sum + branch.level * 650 + branch.staff * 40, 0).toLocaleString()}</strong></div>
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
        ${metric("SAFE TO LEND", compact(lendableCash()), `${money(pendingWithdrawalAmount())} reserved for queued withdrawals`, "▣", lendableCash() > 0)}
        ${metric("PENDING REVIEW", pendingCount(), "Applications awaiting your decision", "◷")}
        ${metric("LOAN BOOK", compact(state.loans), `${weightedLoanApr().toFixed(1)}% weighted APR`, "↗")}
        ${metric("AVERAGE CREDIT SCORE", state.applications.length ? Math.round(state.applications.reduce((sum, a) => sum + a.score, 0) / state.applications.length) : "—", "300–850 scale", "◎")}
        ${metric("DELINQUENCY", `${Math.max(0, 8 - Math.floor(state.reputation / 15))}%`, "Estimated portfolio risk", "△", state.reputation > 45)}
      </div>
      <div class="content-grid"><div class="panel"><div class="panel-heading"><div><h2>Loan applications</h2><p>Approvals are capped at cash above your reserve target and queued customer withdrawals.</p></div><span class="badge">${pendingCount()} NEW</span></div>
        <div class="table-wrap"><table><thead><tr><th>Applicant</th><th>Requested</th><th>Credit score</th><th>Risk</th><th>Decision</th></tr></thead><tbody>${rows || `<tr><td colspan="5"><div class="empty-state"><strong>All caught up</strong>New applications arrive as the days pass.</div></td></tr>`}</tbody></table></div></div>
        <div class="panel"><div class="panel-heading"><div><h2>Credit policy</h2><p>Set the minimum score for approvals</p></div></div>
          <div class="rate-control"><div class="rate-label"><span>Minimum credit score</span><output id="score-output">${state.minCreditScore}</output></div>
            <input type="range" min="500" max="760" step="10" value="${state.minCreditScore}" data-setting="minCreditScore" id="score-range">
            <div class="range-hints"><span>500 flexible</span><span>760 conservative</span></div></div>
          <div style="padding:3px 17px 12px"><div class="loan-rule"><span>Score range</span><strong>300–850</strong></div><div class="loan-rule"><span>Typical low risk</span><strong>720+</strong></div>
          <div class="loan-rule"><span>Policy outcome</span><strong>${state.applications.filter((a) => a.status === "pending" && a.score >= state.minCreditScore).length} qualify now</strong></div>
          <p class="subtitle" style="line-height:1.55;margin-top:12px">Approvals increase interest income and credit exposure. Only approve loans you can fund while maintaining a healthy cash reserve.</p></div></div></div>`;
  }

  function renderActiveLoans() {
    const loans = activeLoanList();
    const totalBalance = loans.reduce((sum, loan) => sum + loan.balance, 0);
    const rows = loans.map((loan) => {
          const progress = Math.max(0, Math.min(100, (1 - loan.balance / loan.principal) * 100));
          const dailyPrincipal = loan.balance / Math.max(1, loan.remainingDays);
          const dailyInterest = loan.balance * loan.apr / 36500;
          const payment = dailyPrincipal + dailyInterest;
          const late = loan.paymentStatus.startsWith("Late") || loan.paymentStatus === "Default watch";
          const statusBadge = loan.paymentStatus === "Ahead" || loan.paymentStatus === "Paid ahead" ? "badge-blue" : late ? "badge-risk" : "";
          const trend = (loan.paymentHistory.length ? loan.paymentHistory : [loan.paymentStatus === "Ahead" ? 1 : 0, 0, 1, 0, 1, 0, 1])
            .slice(-7).map((value) => `<i class="${value === 1 ? "paid" : value === 2 ? "extra" : value === 3 ? "partial" : "missed"}"></i>`).join("");
          return `<tr><td><div class="table-main"><span class="table-avatar loan-avatar">${escapeHtml(loan.borrower.slice(0, 2).toUpperCase())}</span>
            <span><strong>${escapeHtml(loan.borrower)}</strong><small>${escapeHtml(loan.purpose)}</small></span></div></td>
                <td><strong>${money(loan.balance)}</strong><small class="table-subline">of ${money(loan.principal)}</small><div class="payoff-track"><i style="width:${progress}%"></i></div></td>
                <td><span class="badge badge-blue">${loan.apr.toFixed(2)}% APR</span></td>
                <td><strong>${escapeHtml(loan.collateralType)}</strong><small class="table-subline">${loan.collateralValue ? money(loan.collateralValue) : "No pledged collateral"}</small></td>
                <td><span class="badge ${statusBadge}">${escapeHtml(loan.paymentStatus)}</span><div class="payment-sparkline" aria-label="Recent payments">${trend}</div></td>
                <td><strong>${money(payment)}</strong><small class="table-subline">${money(dailyPrincipal)} principal + ${money(dailyInterest)} interest / day</small></td>
                <td><strong>${money(loan.totalInterestPaid)}</strong><small class="table-subline">${Math.ceil(loan.remainingDays / 30)} mo · ${loan.remainingDays} days</small></td>
                <td><button class="button button-quiet" data-action="payoff-loan" data-id="${loan.id}">Pay off</button></td></tr>`;
    }).join("");
    const paidLoans = state.completedLoans.slice(-5).reverse().map((loan) => `
          <tr><td><strong>${escapeHtml(loan.borrower)}</strong></td><td>${escapeHtml(loan.purpose)}</td>
            <td>${money(loan.principal)}</td><td><span class="badge badge-blue">${loan.apr.toFixed(2)}% APR</span></td><td><span class="badge ${loan.status === "defaulted" ? "badge-risk" : ""}">${loan.status === "defaulted" ? "DEFAULTED" : "PAID OFF"}</span></td></tr>`).join("");
    const accounts = state.accounts.map((account) => {
      const owner = clientById(account.clientId);
      const accountStatus = account.status === "active" ? "OPEN" : "CLOSED";
      return `<tr><td><div class="table-main"><span class="table-avatar">${escapeHtml(owner ? owner.initials : "AC")}</span><span><strong>${escapeHtml(owner ? owner.name : "Former client")}</strong><small>${escapeHtml(account.type)}</small></span></div></td>
        <td><span class="badge badge-blue">${account.apy.toFixed(2)}% APY</span></td><td><strong>${money(account.balance)}</strong></td>
        <td><strong>${money(account.balance * account.apy / 36500)}</strong><small class="table-subline">interest / day</small></td>
        <td><span class="badge ${account.status === "active" ? "" : "badge-warn"}">${accountStatus}</span></td></tr>`;
    }).join("");
    const statusSummary = loans.reduce((counts, loan) => {
      const key = loan.paymentStatus.startsWith("Late") || loan.paymentStatus === "Default watch" ? "late"
        : loan.paymentStatus === "Ahead" || loan.paymentStatus === "Paid ahead" ? "ahead"
          : loan.paymentStatus === "Partial payment" ? "partial" : "onTime";
      counts[key] += 1;
      return counts;
    }, { ahead: 0, onTime: 0, partial: 0, late: 0 });
    return `${header("PORTFOLIO SERVICING", "Active loans", "A live spreadsheet of rates, balances, pledged collateral, and whether each borrower is keeping up.")}
          <div class="metrics">
            ${metric("OUTSTANDING PRINCIPAL", compact(totalBalance), `${loans.length} active loans`, "↗")}
            ${metric("WEIGHTED AVERAGE APR", `${weightedLoanApr().toFixed(2)}%`, "Interest earned on the active portfolio", "◎")}
            ${metric("INTEREST EARNED TODAY", money(dailyLoanInterest()), "Accrued from each loan's own APR", "✦")}
            ${metric("PAYMENT HEALTH", `${statusSummary.ahead} ahead · ${statusSummary.onTime} on time`, `${statusSummary.partial} partial · ${statusSummary.late} late`, "↓", statusSummary.late === 0)}
          </div>
          <div class="panel"><div class="panel-heading"><div><h2>Loan portfolio · live ledger</h2><p>Each day borrowers may pay on time, pay extra principal, fall behind, or default. Bars show recent payment history.</p></div><span class="badge badge-blue">${loans.length} SERVICING</span></div>
            <div class="table-wrap"><table class="spreadsheet"><thead><tr><th>Borrower / purpose</th><th>Loan balance</th><th>APR</th><th>Collateral</th><th>Payment behavior</th><th>Scheduled payment</th><th>Interest paid</th><th></th></tr></thead>
            <tbody>${rows || `<tr><td colspan="8"><div class="empty-state"><strong>No active loans</strong>Approved loans will appear here.</div></td></tr>`}</tbody></table></div></div>
          <div class="panel" style="margin-top:15px"><div class="panel-heading"><div><h2>Customer accounts · deposit ledger</h2><p>Account-specific APY and daily interest cost. Withdrawals reduce the balance when paid.</p></div><span class="badge">${accountList().length} OPEN</span></div>
            <div class="table-wrap"><table class="spreadsheet"><thead><tr><th>Account holder</th><th>APY offered</th><th>Current balance</th><th>Interest cost</th><th>Status</th></tr></thead>
              <tbody>${accounts || `<tr><td colspan="5"><div class="empty-state">No customer accounts yet.</div></td></tr>`}</tbody></table></div></div>
          <div class="panel" style="margin-top:15px"><div class="panel-heading"><div><h2>Recently paid off</h2><p>Completed contracts stay here for your records.</p></div></div>
            <div class="table-wrap"><table><thead><tr><th>Borrower</th><th>Loan purpose</th><th>Original amount</th><th>APR</th><th>Status</th></tr></thead>
            <tbody>${paidLoans || `<tr><td colspan="5"><div class="empty-state">No completed loans yet.</div></td></tr>`}</tbody></table></div></div>`;
  }

  function requestKindLabel(request) {
    return ({
          "account-open": "Open a new account",
          "account-close": "Close an account",
          withdrawal: "Customer withdrawal",
          "loan-open": "Apply for a loan",
          "loan-close": "Pay off a loan early"
    })[request.kind] || "Contact the bank";
  }

  function renderClients() {
    const requests = state.requests.filter((request) => request.status === "pending" || request.status === "offered")
          .sort((a, b) => b.age - a.age);
    const cards = requests.map((request) => {
          const client = clientById(request.clientId);
          if (!client || client.status !== "active") return "";
          const isLoan = request.kind.includes("loan");
          const waiting = request.status === "offered";
          const score = client.score;
          const suggestedCollateral = collateralFor(request.product, request.amount);
          const linkedAccount = state.accounts.find((account) => account.id === request.accountId);
          const queuedAmount = (request.kind === "account-close" || request.kind === "withdrawal") && linkedAccount
            ? Math.min(request.amount, linkedAccount.balance) : request.amount;
          const clientProducts = [
            ...accountList().filter((account) => account.clientId === client.id).map((account) => `${account.type} · ${account.apy.toFixed(2)}% APY · ${money(account.balance)}`),
            ...activeLoanList().filter((loan) => loan.clientId === client.id).map((loan) => `${loan.purpose} · ${loan.apr.toFixed(2)}% APR · ${money(loan.balance)} remaining`)
          ];
          return `<article class="panel request-card ${waiting ? "request-offered" : ""}" data-request-card="${request.id}">
            <div class="request-top"><div class="table-main"><span class="table-avatar ${request.channel === "call" ? "call-avatar" : "message-avatar"}">${escapeHtml(client.initials)}</span>
              <span><strong>${escapeHtml(client.name)}</strong><small>${request.channel === "call" ? "☎ Incoming call" : "✉ New message"} · Day ${state.day - request.age}</small></span></div>
              <span class="badge ${request.age >= 3 ? "badge-risk" : request.age ? "badge-warn" : "badge-blue"}">${request.age ? `WAITING ${request.age}D` : "NEW"}</span></div>
            <div class="request-content"><div class="request-title">${requestKindLabel(request)}</div>
              <p>“${escapeHtml(request.message || `I'd like to ${request.kind.endsWith("close") ? "close my" : "discuss a"} ${request.product || (isLoan ? "loan" : "account")}.`) }”</p>
              <div class="request-facts"><span>Request <strong>${money(queuedAmount)}</strong></span>
                <span>Credit <strong>${score}</strong></span><span>Client mood <strong class="${client.anger >= 65 ? "negative" : "positive"}">${client.anger}% anger</strong></span></div>
              ${clientProducts.length ? `<div class="client-products">Current relationship: ${clientProducts.map(escapeHtml).join(" · ")}</div>` : ""}
              ${waiting ? `<div class="offer-summary">Your offer: ${isLoan ? `${request.offeredApr.toFixed(2)}% APR · ${request.offeredTerm} months` : `${request.offeredApy.toFixed(2)}% APY`}.
                Client decision expected at day close · ${Math.round(request.acceptanceChance)}% estimated acceptance.</div>
                <button class="button button-quiet" data-action="withdraw-offer" data-id="${request.id}">Withdraw offer</button>` :
                request.kind === "account-open" ? `<div class="offer-editor"><label>Account APY <span><input type="number" min="0" max="9" step="0.1" value="${(1.5 + (client.score - 600) / 100).toFixed(1)}" data-offer-field="apy" data-id="${request.id}">%</span></label>
                  <span class="field-hint">Higher yield makes your offer more attractive (max 9%).</span></div>
                  <div class="request-actions"><button class="button button-primary" data-action="offer-terms" data-id="${request.id}">Set up account offer</button><button class="button button-quiet" data-action="decline-request" data-id="${request.id}">Decline request</button></div>` :
                request.kind === "loan-open" ? `<div class="offer-editor offer-editor-split">
                  <label>Loan APR <span><input type="number" min="3" max="24" step="0.1" value="${Math.max(4, Math.min(18, state.loanApr - Math.max(0, score - 650) / 100)).toFixed(1)}" data-offer-field="apr" data-id="${request.id}">%</span></label>
                          <label>Term <span><input type="number" min="6" max="60" step="6" value="36" data-offer-field="term" data-id="${request.id}"> months</span></label>
                          <label>Collateral <span><select data-offer-field="collateral" data-id="${request.id}">
                            ${["Unsecured", "Vehicle", "Equipment", "Property", "Business assets"].map((kind) => `<option ${kind === suggestedCollateral.collateralType ? "selected" : ""}>${kind}</option>`).join("")}</select></span></label>
                          <label>Collateral value <span>$<input type="number" min="0" max="5000000" step="1000" value="${suggestedCollateral.collateralValue}" data-offer-field="collateral-value" data-id="${request.id}"></span></label></div>
                          <div class="request-actions"><button class="button button-primary" data-action="offer-terms" data-id="${request.id}">Offer loan terms</button><button class="button button-quiet" data-action="decline-request" data-id="${request.id}">Decline request</button></div>` :
                request.kind === "withdrawal" ? `<div class="withdrawal-notice ${state.cash < queuedAmount ? "shortfall" : ""}">
                  ${state.cash >= queuedAmount ? `Cash is ready. This payout will leave ${money(Math.max(0, state.cash - queuedAmount))} on hand; ${money(requiredReserve())} is the target reserve.` : `Shortfall: ${money(queuedAmount - state.cash)}. The request stays queued until cash is available.`}
                  <div class="request-actions"><button class="button button-primary" data-action="honor-withdrawal" data-id="${request.id}" ${state.cash < queuedAmount ? "disabled" : ""}>Pay ${money(queuedAmount)} withdrawal</button>
                    <button class="button button-quiet" data-action="decline-request" data-id="${request.id}">Decline request</button></div></div>` :
                `<div class="request-actions"><button class="button button-primary" data-action="complete-request" data-id="${request.id}" ${request.kind === "account-close" && state.cash < queuedAmount ? "disabled" : ""}>Approve ${request.kind === "loan-close" ? "payoff" : "account closure"}</button>
                  <button class="button button-quiet" data-action="decline-request" data-id="${request.id}">Keep it open</button></div>`
              }
            </div></article>`;
    }).join("");
    const activeClients = state.clients.filter((client) => client.status === "active");
    const clientRows = activeClients.map((client) => {
          const angerLabel = client.anger >= 70 ? "At risk" : client.anger >= 40 ? "Frustrated" : client.anger >= 20 ? "Waiting" : "Happy";
          return `<div class="client-row"><div class="table-main"><span class="table-avatar">${escapeHtml(client.initials)}</span><span><strong>${escapeHtml(client.name)}</strong>
            <small>Credit score ${client.score} · ${client.status === "active" ? client.sentiment : "Departed"}</small></span></div>
            <div class="anger-cell"><div class="anger-label"><span>${angerLabel}</span><strong>${client.anger}%</strong></div><div class="anger-meter"><i class="${client.anger >= 70 ? "anger-high" : ""}" style="width:${client.anger}%"></i></div></div></div>`;
    }).join("");
    return `${header("RELATIONSHIPS & RETENTION", "Client desk", "Answer calls and messages, offer account and loan terms, and keep client frustration under control.",
          `<span class="badge badge-blue">${pendingRequestCount()} NEED ATTENTION</span>`)}
          <div class="metrics lending-metrics">
            ${metric("OPEN CONVERSATIONS", pendingRequestCount(), `${state.requests.filter((request) => request.status === "pending" && request.kind === "withdrawal").length} cash withdrawals waiting`, "✉", pendingRequestCount() === 0)}
            ${metric("ACTIVE CLIENTS", activeClients.length.toLocaleString(), `${state.customers.toLocaleString()} total bank customers`, "♙")}
            ${metric("ACCOUNTS UNDER MANAGEMENT", accountList().length, `${compact(accountList().reduce((sum, account) => sum + account.balance, 0))} customer balances`, "◈")}
            ${metric("AT-RISK RELATIONSHIPS", activeClients.filter((client) => client.anger >= 65).length, "Clients leave when anger reaches 100%", "♡", activeClients.every((client) => client.anger < 65))}
          </div>
          <div class="client-layout"><div><div class="section-title"><h2>Calls & messages</h2><span class="badge">${requests.length} OPEN</span></div>
            <div class="request-list">${cards || `<div class="panel empty-state"><strong>Inbox zero!</strong>Advance the day to receive new client calls and messages.</div>`}</div></div>
            <div class="panel client-roster"><div class="panel-heading"><div><h2>Client relationships</h2><p>Ignore a request and anger rises each day.</p></div></div>
              <div class="client-list">${clientRows}</div><div class="anger-key"><span><i class="anger-key-dot calm"></i>Happy</span><span><i class="anger-key-dot tense"></i>Frustrated</span><span><i class="anger-key-dot leave"></i>Leaves at 100%</span></div></div>
          </div>`;
  }

  function renderTreasury() {
    return `${header("MONEY AT WORK", "Treasury & rates", "Balance customer growth, funding costs, and the yield on your loan portfolio.")}
      <div class="metrics">
        ${metric("AVAILABLE CASH", compact(state.cash), `${reserveRatio().toFixed(1)}% of deposits held in reserve`, "▣", state.cash / Math.max(1, state.deposits) > .1)}
        ${metric("BANK EQUITY", compact(equity()), "Assets minus customer deposits", "◉", equity() > 0)}
        ${metric("NET INTEREST MARGIN", `${(weightedLoanApr() - weightedDepositApy()).toFixed(2)}%`, "Weighted loan APR less weighted deposit APY", "↗", weightedLoanApr() > weightedDepositApy())}
        ${metric("VAULT CASH", compact(state.vaultCash), `Capacity ${compact(vaultCapacity())}`, "⬡")}
      </div>
      <div class="content-grid"><div class="panel"><div class="panel-heading"><div><h2>Interest rate strategy</h2><p>Base rates affect legacy deposits and new bank-approved loans; client offers keep their agreed rates.</p></div></div>
        <div class="rate-control"><div class="rate-label"><span>Customer deposit APY</span><output id="apy-output">${state.depositApy.toFixed(2)}%</output></div>
          <input type="range" min="0.5" max="7" step="0.1" value="${state.depositApy}" data-setting="depositApy" id="apy-range">
          <div class="range-hints"><span>0.5% low cost</span><span>7.0% attract savers</span></div></div>
        <div class="rate-control"><div class="rate-label"><span>Loan interest APR</span><output id="apr-output">${state.loanApr.toFixed(2)}%</output></div>
          <input type="range" min="3" max="24" step="0.1" value="${state.loanApr}" data-setting="loanApr" id="apr-range">
          <div class="range-hints"><span>3% borrower-friendly</span><span>24% higher yield</span></div></div>
        <div class="rate-control"><div class="rate-label"><span>Minimum cash reserve</span><output id="reserveTarget-output">${state.reserveTarget}%</output></div>
          <input type="range" min="10" max="35" step="1" value="${state.reserveTarget}" data-setting="reserveTarget" id="reserveTarget-range">
          <div class="range-hints"><span>10% more aggressive</span><span>35% safer for withdrawals</span></div></div>
        <div class="finance-list"><div class="finance-row"><span>Daily loan interest earned</span><strong class="positive">${money(dailyLoanInterest())}</strong></div>
          <div class="finance-row"><span>Daily interest paid to depositors</span><strong class="negative">${money(dailyDepositInterest())}</strong></div>
          <div class="finance-row"><span>Estimated daily net interest</span><strong>${money(dailyLoanInterest() - dailyDepositInterest())}</strong></div></div>
        </div>
        <div class="panel"><div class="panel-heading"><div><h2>Balance sheet</h2><p>Day ${state.day} · simplified bank position</p></div></div><div class="finance-list">
          <div class="finance-row"><span>Cash & reserves</span><strong>${money(state.cash)}</strong></div>
          <div class="finance-row"><span>Outstanding loans</span><strong>${money(state.loans)}</strong></div>
          <div class="finance-row"><span>Investment portfolio</span><strong>${money(investmentValue())}</strong></div>
          <div class="finance-row"><span>Total assets</span><strong>${money(state.cash + state.loans + investmentValue())}</strong></div>
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

  function renderZoomCalls() {
    const waiting = state.meetings.filter((meeting) => meeting.status === "waiting");
    const cards = waiting.map((meeting) => {
      const client = clientById(meeting.clientId);
      return `<article class="panel zoom-card">
        <div class="zoom-screen"><div class="zoom-client"><span class="zoom-avatar">${escapeHtml(client ? client.initials : "CB")}</span><strong>${escapeHtml(client ? client.name : "Bank customer")}</strong><small>Commonwealth customer · ${client ? client.sentiment : "Waiting"}</small></div>
          <div class="zoom-status"><i></i> LIVE CALL · ${escapeHtml(meeting.channel || "VIDEO")}</div><div class="zoom-prompt">“${escapeHtml(meeting.prompt)}”</div></div>
        <div class="call-goal"><small>WHAT THEY'RE LOOKING FOR</small><strong>${escapeHtml(meeting.need || "A better banking experience")}</strong>
          <span>Customer priority: ${escapeHtml(meeting.priority || "Personal service")} · ${money(meeting.amount || 0)} to bring over</span></div>
        <div class="call-chat">${(meeting.transcript || []).map((line) => `<p class="call-line ${line.from === "You" ? "call-line-owner" : "call-line-customer"}"><b>${escapeHtml(line.from === "You" ? "You" : client ? client.name : "Customer")}</b>${escapeHtml(line.text)}</p>`).join("")}</div>
        <div class="call-rapport"><span>Rapport</span><div class="anger-meter"><i style="width:${Math.min(100, meeting.rapport * 25)}%"></i></div><b>${meeting.rapport}/4</b></div>
        <div class="zoom-actions">
          ${meeting.turn === 0 ? `<button class="button button-primary" data-action="call-pitch" data-choice="discover" data-id="${meeting.id}">Ask what matters most</button>` : ""}
          ${meeting.discovered && !meeting.pitched ? `<button class="button" data-action="call-pitch" data-choice="clarity" data-id="${meeting.id}">Explain the terms clearly</button>
            <button class="button" data-action="call-pitch" data-choice="rate" data-id="${meeting.id}">Make the rate worthwhile</button>
            <button class="button" data-action="call-pitch" data-choice="flexibility" data-id="${meeting.id}">Offer more flexibility</button>
            <button class="button" data-action="call-pitch" data-choice="support" data-id="${meeting.id}">Promise personal support</button>` : ""}
          <button class="button button-primary" data-action="call-pitch" data-choice="close" data-id="${meeting.id}" ${meeting.rapport < 2 ? "disabled" : ""} title="${meeting.rapport < 2 ? "Build rapport before closing" : "Ask the customer to open the account"}">Invite them to open · ${(meeting.apy || state.depositApy).toFixed(1)}% APY</button>
          ${!meeting.incentive ? `<button class="button button-quiet" data-action="call-pitch" data-choice="incentive" data-id="${meeting.id}">Add $500 welcome bonus</button>` : ""}
          <button class="button button-quiet" data-action="call-pitch" data-choice="end" data-id="${meeting.id}">End call politely</button></div>
      </article>`;
    }).join("");
    const finished = state.meetings.filter((meeting) => meeting.status === "completed" || meeting.status === "missed").slice(0, 6);
    return `${header("LIVE CUSTOMER SERVICE", "Video call center", "Jump into a simulated Zoom-style customer call. Your choices affect trust, retention, and growth.")}
      <div class="metrics">${metric("CALLS WAITING", waiting.length, "Learn needs, handle objections, then close", "▣", waiting.length === 0)}
        ${metric("CUSTOMER TRUST", `${state.reputation}/100`, "Your choices shape the bank's reputation", "♡")}
        ${metric("NEXT CALL", `<span id="call-countdown-value">${Math.max(0, state.callCountdown)}s</span>`, "New calls arrive throughout the day", "◷")}
        ${metric("CLIENTS AT RISK", state.clients.filter((client) => client.status === "active" && client.anger >= 65).length, "Check the Client desk too", "⚠")}</div>
      <div class="zoom-call-list">${cards || `<div class="panel empty-state"><strong>Call queue is clear—for now</strong>Try different pitches and read customer priorities when the next call comes in.</div>`}</div>
      <div class="panel" style="margin-top:15px"><div class="panel-heading"><div><h2>Call notes</h2><p>Recent conversations</p></div></div><div class="finance-list">
        ${finished.length ? finished.map((meeting) => `<div class="finance-row"><span>${escapeHtml(meeting.clientName)} · ${escapeHtml(meeting.outcome)}</span><strong>Day ${meeting.day}</strong></div>`).join("") : `<div class="empty-state">Your recent call notes will appear here.</div>`}</div></div>`;
  }

  function renderMail() {
    const messages = [...state.mail].sort((a, b) => Number(a.read) - Number(b.read) || b.id - a.id);
    const acceptLabels = {
      referral: "Accept referral", recognition: "Approve award", liquidity: "Raise reserves",
      event: "Sponsor the fair", community: "Sponsor the league", market: "Apply market note",
      volatility: "Trim index risk", recovery: "Issue service credit"
    };
    const cards = messages.map((message) => `<article class="panel mail-card ${message.read ? "mail-read" : ""}">
      <div class="mail-card-top"><div><span class="mail-sender">${escapeHtml(message.from)}</span><h3>${escapeHtml(message.subject)}</h3></div>
        <span class="badge ${message.read ? "badge-blue" : "badge-warn"}">${message.read ? (message.status === "new" ? "READ" : escapeHtml(message.status.toUpperCase())) : "UNREAD"}</span></div>
      ${message.read ? `<p>${escapeHtml(message.body)}</p>` : `<p class="mail-preview">Open this message to read the full details and see any decision it needs.</p>`}
      <div class="mail-actions">${!message.read ? `<button class="button button-primary" data-action="read-mail" data-id="${message.id}">Read email</button>` :
        message.status === "new" && message.kind !== "brief" ? `<button class="button button-primary" data-action="mail-decision" data-choice="accept" data-id="${message.id}">${acceptLabels[message.kind] || "Accept"}</button><button class="button button-quiet" data-action="mail-decision" data-choice="decline" data-id="${message.id}">${message.kind === "market" ? "Keep current strategy" : message.kind === "volatility" ? "Keep position" : "Decline"}</button>` :
          message.status === "new" ? `<button class="button" data-action="mail-decision" data-choice="archive" data-id="${message.id}">Acknowledge & archive</button>` : ""}</div>
    </article>`).join("");
    return `${header("INBOX · PRIORITIZE & RESPOND", "Mail & email", "Read your daily briefings, customer opportunities, and internal alerts. Some messages need a decision.")}
      <div class="metrics">${metric("UNREAD", state.mail.filter((message) => !message.read && message.status === "new").length, "New notes arrive through the day", "▧")}
        ${metric("NEEDS A DECISION", state.mail.filter((message) => message.read && message.status === "new" && message.kind !== "brief").length, "Accept or decline after reading", "✉")}
        ${metric("DAY", String(state.day).padStart(2, "0"), "Messages stay in your inbox", "◷")}</div>
      <div class="mail-list">${cards || `<div class="panel empty-state"><strong>Inbox clear</strong>New email will arrive during the day.</div>`}</div>`;
  }

  function renderInvestments() {
    const holdings = new Map(state.investments.map((holding) => [holding.symbol, holding]));
    const cards = investmentProducts.map((product) => {
      const price = state.marketPrices[product.symbol] || 100;
      const holding = holdings.get(product.symbol);
      const value = holding ? holding.units * price : 0;
      const change = holding ? value - holding.costBasis : 0;
      return `<article class="panel investment-card ${product.color}"><div class="investment-top"><span class="investment-symbol">${product.symbol}</span><span class="badge">${product.risk}</span></div>
        <h3>${product.name}</h3><div class="investment-price"><span data-market-price="${product.symbol}">$${price.toFixed(2)}</span> <small>market price</small></div>
        <div class="finance-list"><div class="finance-row"><span>Your position</span><strong data-position-value="${product.symbol}">${money(value)}</strong></div>
          <div class="finance-row"><span>Unrealized gain / loss</span><strong data-position-change="${product.symbol}" class="${change >= 0 ? "positive" : "negative"}">${change >= 0 ? "+" : ""}${money(change)}</strong></div>
          <div class="finance-row"><span>Indicative yield</span><strong>${(product.yield * 365 * 100).toFixed(1)}% / year</strong></div></div>
        <div class="investment-actions"><label>Buy amount <span><input type="number" min="1000" max="${Math.floor(lendableCash())}" step="1000" value="25000" data-invest-amount="${product.symbol}"></span></label>
          <button class="button button-primary" data-action="buy-investment" data-symbol="${product.symbol}" ${lendableCash() < 1000 ? "disabled" : ""}>Invest</button>
          <button class="button button-quiet" data-action="sell-investment" data-symbol="${product.symbol}" ${!holding ? "disabled" : ""}>Sell position</button></div></article>`;
    }).join("");
    return `${header("PUT IDLE CAPITAL TO WORK", "Investment desk", "Build a diversified bank portfolio. Market prices move while the day runs; investments use cash above your reserve and pending obligations.")}
      <div class="metrics">${metric("PORTFOLIO VALUE", compact(investmentValue()), "Marked to current market prices", "↗")}
        ${metric("SAFE TO INVEST", compact(lendableCash()), "After reserve and client commitments", "▣", lendableCash() > 0)}
        ${metric("BANK EQUITY", compact(equity()), "Includes your investment assets", "◉", equity() > 0)}
        ${metric("MARKET", "OPEN", "Live price changes during the day", "◷")}</div>
      <div class="investment-grid">${cards}</div><div class="panel investment-note"><strong>Risk reminder</strong><span>Bond funds tend to move less; the market index has higher potential return and higher short-term swings. Investments are fictional game assets.</span></div>`;
  }

  function renderStaff() {
    const totalStaff = state.branches.reduce((sum, branch) => sum + branch.staff, 0);
    const cards = state.branches.map((branch) => `<article class="panel staff-card">
      <div class="staff-card-heading"><span class="branch-icon">⌂</span><div><h3>${escapeHtml(branch.name)}</h3><small>${escapeHtml(branch.location)} · level ${branch.level}</small></div><span class="badge">${branch.staff} STAFF</span></div>
      <p>Each employee supports up to 40 additional customers and costs ${money(35)} per game day.</p>
      <div class="staff-controls"><button class="button" data-action="staff-change" data-change="fire" data-id="${branch.id}" ${branch.staff <= 2 ? "disabled" : ""}>− Fire</button>
        <strong>${branch.staff} employees</strong><button class="button button-primary" data-action="staff-change" data-change="hire" data-id="${branch.id}" ${state.cash < 2500 ? "disabled" : ""}>Hire · ${money(2500)}</button></div>
    </article>`).join("");
    return `${header("BUILD A BETTER TEAM", "People & payroll", "Hire to grow service capacity, or trim payroll when cash is tight. Keep at least two employees at every branch.")}
      <div class="metrics">${metric("TEAM MEMBERS", totalStaff, `${state.branches.length} staffed branches`, "♙")}
        ${metric("DAILY PAYROLL", money(dailyPayroll()), "Paid at day close", "▤", state.cash > dailyPayroll())}
        ${metric("SERVICE CAPACITY", state.branches.reduce((sum, branch) => sum + branch.level * 650 + branch.staff * 40, 0).toLocaleString(), "Customers supported across your network", "◎")}
        ${metric("CASH ON HAND", compact(state.cash), `Hiring costs ${money(2500)} upfront`, "▣")}</div>
      <div class="staff-grid">${cards || `<div class="panel empty-state"><strong>No branches to staff</strong>Open a branch to hire a team.</div>`}</div>`;
  }

  function generateMail(eventOnly = false) {
    const templates = [
      { from: "Treasury analyst", subject: "Market pulse: bond yields soften", body: "Bond prices have nudged up as yields cool. You can take a small gain now or keep your position for future income.", kind: "market" },
      { from: "City business council", subject: "Neighborhood business fair", body: "A local business fair is looking for a bank sponsor. Accept the invitation to pay the event cost and meet potential deposit customers.", kind: "event" },
      { from: "Operations team", subject: "Recognition for Riverside staff", body: "The Riverside team handled a busy rush. Approve a recognition award to improve customer trust, or save the cash.", kind: "recognition" },
      { from: "Risk office", subject: "Withdrawal forecast revised", body: "A busy withdrawal window is expected later today. Increase your reserve target to protect cash, or decline and keep lending more aggressively.", kind: "liquidity" },
      { from: "Business services", subject: "Merchant-services referral", body: "A growing local merchant wants a banking partner. Accept the referral to win a new business relationship and a modest cash bonus.", kind: "referral" },
      { from: "Community relations", subject: "Sponsor the youth league", body: "A neighborhood sports league needs help with uniforms. A small sponsorship could build goodwill and bring new faces into your branches.", kind: "community" },
      { from: "Risk office", subject: "Market volatility warning", body: "Analysts expect a volatile trading window. Reduce risk by trimming your market-index position, or keep it invested for potential recovery.", kind: "volatility" },
      { from: "Customer care", subject: "Service recovery request", body: "A long-time customer reported a poor experience. Approve a service credit to rebuild trust, or decline and risk damaging the relationship.", kind: "recovery" },
      { from: "Property desk", subject: "Branch lease opportunity", body: "A high-traffic storefront is available in a growing district. Review your cash before committing to another location.", kind: "brief" }
    ];
    const eventKinds = ["market", "event", "recognition", "liquidity", "community", "volatility", "recovery"];
    const choices = templates.filter((item) => item.subject !== state.lastMailSubject && (!eventOnly || eventKinds.includes(item.kind)));
    const template = choices[Math.floor(Math.random() * choices.length)];
    state.lastMailSubject = template.subject;
    const message = { ...template, id: state.nextId++, read: false, status: "new" };
    state.mail.unshift(message);
    state.mail = state.mail.slice(0, 40);
    record(`New email: “${message.subject}” from ${message.from}.`);
  }

  function generateLoanApplication() {
    const names = [["Ava Thompson", "AT"], ["Leo Martinez", "LM"], ["Sam Rivera", "SR"], ["Iris Wilson", "IW"], ["Caleb Wright", "CW"], ["Sofia Bennett", "SB"], ["Mateo Cruz", "MC"], ["Nina Patel", "NP"], ["Harper Lee", "HL"], ["Evan Foster", "EF"]];
    const availableNames = names.filter(([name]) => !state.applications.some((application) => application.name === name && application.status === "pending"));
    const [name, initials] = availableNames[Math.floor(Math.random() * availableNames.length)] || names[Math.floor(Math.random() * names.length)];
    const score = Math.floor(540 + Math.random() * 281);
    const amount = Math.round((8000 + Math.random() * 52000) / 500) * 500;
    const purpose = ["Small business", "Auto loan", "Home improvement", "Equipment financing", "Energy upgrade"][Math.floor(Math.random() * 5)];
    state.applications.unshift({ id: state.nextId++, name, initials, purpose, amount, score, risk: score >= 720 ? "Low" : score >= 640 ? "Moderate" : "High", status: "pending" });
    state.applications = state.applications.slice(0, 30);
    record(`New ${money(amount)} ${purpose.toLowerCase()} application from ${name} arrived for review.`);
  }

  function generateLiveActivity() {
    const types = ["client", "loan", "mail", "mail", "event"];
    const choices = types.filter((type) => type !== state.lastActivityType);
    const type = choices[Math.floor(Math.random() * choices.length)];
    state.lastActivityType = type;
    if (type === "client") generateClientRequest();
    else if (type === "loan") generateLoanApplication();
    else generateMail(type === "event");
    state.activityCountdown = 8 + Math.floor(Math.random() * 19);
    save();
    pageTitle(document.querySelector("#page-title").textContent);
    if (["dashboard", "clients", "lending", "mail", "cashflow"].includes(activeTab)) render();
    notify(type === "client" ? "New customer message · check the Client desk." : type === "loan" ? "New loan application · review the Credit desk." : "New bank email · open the Mail & email tab.");
  }

  function generateZoomCall() {
    const clients = state.clients.filter((client) => client.status === "active");
    if (!clients.length) {
      const [name, initials] = [["Tessa Green", "TG"], ["Victor Alvarez", "VA"], ["Sofia Bennett", "SB"]][Math.floor(Math.random() * 3)];
      const client = { id: state.nextId++, name, initials, score: 650, anger: 0, status: "active", sentiment: "New" };
      state.clients.push(client);
      state.customers += 1;
      clients.push(client);
    }
    const client = clients[Math.floor(Math.random() * clients.length)];
    const scenarioChoices = callScenarios.map((_, index) => index).filter((index) => index !== state.lastCallScenario);
    state.lastCallScenario = scenarioChoices[Math.floor(Math.random() * scenarioChoices.length)];
    const scenario = callScenarios[state.lastCallScenario];
    state.meetings.unshift({
      id: state.nextId++, clientId: client.id, clientName: client.name,
      ...scenario, channel: Math.random() < .5 ? "VIDEO" : "AUDIO", status: "waiting",
      day: state.day, rapport: 0, turn: 0, transcript: [
        { from: "Customer", text: scenario.prompt }
      ], incentive: false, discovered: false, pitched: false
    });
    state.meetings = state.meetings.slice(0, 100);
    client.sentiment = "On a call";
    record(`${client.name} is waiting in the video-call lobby. Join the Zoom call to help them.`);
    state.callCountdown = 24 + Math.floor(Math.random() * 48);
    save();
    pageTitle(document.querySelector("#page-title").textContent);
    if (["dashboard", "calls"].includes(activeTab)) render();
    notify(`Incoming customer call · ${client.name} is waiting.`);
  }

  function refreshMarket() {
    for (const product of investmentProducts) {
      const change = (Math.random() * 2 - 1) * product.volatility;
      state.marketPrices[product.symbol] = Math.max(15, (state.marketPrices[product.symbol] || 100) * (1 + change));
      const holding = state.investments.find((item) => item.symbol === product.symbol);
      const value = holding ? holding.units * state.marketPrices[product.symbol] : 0;
      const priceNode = document.querySelector(`[data-market-price="${product.symbol}"]`);
      const valueNode = document.querySelector(`[data-position-value="${product.symbol}"]`);
      const changeNode = document.querySelector(`[data-position-change="${product.symbol}"]`);
      if (priceNode) priceNode.textContent = `$${state.marketPrices[product.symbol].toFixed(2)}`;
      if (valueNode) valueNode.textContent = money(value);
      if (changeNode) {
        const changeAmount = value - (holding ? holding.costBasis : 0);
        changeNode.textContent = `${changeAmount >= 0 ? "+" : ""}${money(changeAmount)}`;
        changeNode.classList.toggle("positive", changeAmount >= 0);
        changeNode.classList.toggle("negative", changeAmount < 0);
      }
    }
    const totalNode = document.querySelector('[data-metric="PORTFOLIO VALUE"] .metric-value');
    const equityNode = document.querySelector('[data-metric="BANK EQUITY"] .metric-value');
    if (totalNode) totalNode.textContent = compact(investmentValue());
    if (equityNode) equityNode.textContent = compact(equity());
  }

  function clockLabel() {
    const minutes = Math.floor(state.secondsRemaining / 60).toString().padStart(2, "0");
    const seconds = Math.floor(state.secondsRemaining % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function refreshClock() {
    const clock = document.querySelector("#day-clock");
    if (clock) clock.textContent = !state.tutorialComplete ? "TOUR" : state.clockPaused ? "PAUSED" : clockLabel();
    const shiftClock = document.querySelector("#shift-countdown");
    if (shiftClock) shiftClock.textContent = `${state.clockPaused ? "PAUSED" : clockLabel()} LEFT`;
    const button = document.querySelector("#clock-toggle");
    if (button) button.innerHTML = state.clockPaused ? "<span>▶</span> Resume" : "<span>Ⅱ</span> Pause";
    const label = document.querySelector("#day-label");
    if (label) label.textContent = `DAY ${String(state.day).padStart(2, "0")}`;
    const callCountdown = document.querySelector("#call-countdown-value");
    if (callCountdown) callCountdown.textContent = `${Math.max(0, state.callCountdown)}s`;
  }

  function runClock() {
    if (state.clockPaused || !state.tutorialComplete) {
      refreshClock();
      return;
    }
    state.secondsRemaining = Math.max(0, state.secondsRemaining - 1);
    state.activityCountdown -= 1;
    state.callCountdown -= 1;
    state.marketCountdown -= 1;
    state.eventCountdown -= 1;
    if (state.activityCountdown <= 0) generateLiveActivity();
    if (state.callCountdown <= 0) generateZoomCall();
    if (state.marketCountdown <= 0) {
      refreshMarket();
      state.marketCountdown = 13 + Math.floor(Math.random() * 23);
    }
    if (state.eventCountdown <= 0) {
      generateMail(true);
      state.eventCountdown = 42 + Math.floor(Math.random() * 66);
      if (activeTab === "mail") render();
    }
    if (state.secondsRemaining === 0) {
      finishDay();
      return;
    }
    refreshClock();
    save();
  }

  function answerZoomCall(id, choice) {
    const meeting = state.meetings.find((item) => item.id === id && item.status === "waiting");
    if (!meeting) return;
    const client = clientById(meeting.clientId);
    if (choice === "end") {
      meeting.status = "completed";
      meeting.outcome = "Call ended politely";
      meeting.day = state.day;
      if (client) {
        client.sentiment = "Call completed";
        client.anger = Math.max(0, client.anger - 4);
      }
      meeting.transcript.push({ from: "You", text: "Thanks for speaking with us. We'd be happy to help whenever you're ready." });
      record(`You wrapped up the call with ${meeting.clientName} without pressure.`);
    } else if (choice === "discover") {
      if (meeting.discovered) return notify("You already asked what matters. Respond to their priority with a tailored pitch.");
      meeting.discovered = true;
      meeting.rapport = Math.min(4, meeting.rapport + 1);
      meeting.turn += 1;
      meeting.transcript.push({ from: "You", text: "Before I recommend anything, what matters most to you in a new account?" });
      meeting.transcript.push({ from: "Customer", text: `I need ${meeting.need.toLowerCase()}. Mostly, ${meeting.priority.toLowerCase()}.` });
      if (client) client.sentiment = "Sharing their priorities";
      record(`${client ? client.name : "A customer"} shared what matters to them: ${meeting.priority}.`);
    } else if (choice === "incentive") {
      if (meeting.incentive) return notify("You've already offered the welcome bonus. Let the customer consider it.");
      if (state.cash < 500) return notify("You need $500 on hand to offer the welcome bonus.");
      meeting.incentive = true;
      meeting.rapport = Math.min(4, meeting.rapport + 1);
      meeting.turn += 1;
      meeting.transcript.push({ from: "You", text: "I can include a $500 welcome bonus if you open today. Would that help?" });
      meeting.transcript.push({ from: "Customer", text: meeting.rapport >= 2 ? "That makes it more interesting. How does the account work?" : "That's nice, but I still want to know whether the account fits me." });
      if (client) client.sentiment = "Considering your offer";
    } else if (choice === "close") {
      if (meeting.rapport < 2) return notify("Learn what matters and answer their concern before asking them to open.");
      if (meeting.incentive && state.cash < 500) return notify("Keep $500 on hand to honor the welcome bonus you offered.");
      const acceptance = Math.min(96, 38 + meeting.rapport * 12 + Math.max(-8, (client ? client.score - 650 : 0) * .06) - (client ? client.anger * .16 : 0) + (meeting.incentive ? 12 : 0));
      const accepted = Math.random() * 100 < acceptance;
      if (accepted) {
        const deposit = meeting.amount;
        if (meeting.incentive) state.cash -= 500;
        state.cash += deposit;
        state.deposits += deposit;
        state.accounts.push({
          id: state.nextId++, clientId: meeting.clientId, type: meeting.product,
          balance: deposit, apy: meeting.apy || state.depositApy, status: "active"
        });
        if (client) {
          client.anger = Math.max(0, client.anger - 18);
          client.sentiment = "New account opened";
        }
        meeting.status = "completed";
        meeting.outcome = `${meeting.product} opened · ${money(deposit)} deposit`;
        meeting.transcript.push({ from: "You", text: `Would you like to open a ${meeting.product} at ${(meeting.apy || state.depositApy).toFixed(1)}% APY?` });
        meeting.transcript.push({ from: "Customer", text: "Yes, that sounds like a good fit. Let's open it." });
        record(`${client ? client.name : "A customer"} opened ${meeting.product} after your call pitch, bringing ${money(deposit)} in deposits.`);
        notify(`Sale closed · ${meeting.product} opened with ${money(deposit)} in new deposits.`);
      } else {
        meeting.rapport = Math.max(0, meeting.rapport - 1);
        meeting.pitched = false;
        meeting.turn += 1;
        meeting.transcript.push({ from: "You", text: `Would you like to open a ${meeting.product} at ${(meeting.apy || state.depositApy).toFixed(1)}% APY?` });
        meeting.transcript.push({ from: "Customer", text: "I'm not quite ready. Can you tell me a little more about the terms?" });
        if (client) client.sentiment = "Needs more information";
        record(`${client ? client.name : "A customer"} asked for more details before opening an account.`);
        notify(`Not closed yet · listen to ${client ? client.name : "the customer"} and adjust your pitch.`);
      }
    } else {
      const reply = {
        clarity: "Let me show you exactly what the rate and fees mean, with no surprises.",
        rate: `I can offer ${(meeting.apy || state.depositApy).toFixed(1)}% APY, so your balance earns a competitive return.`,
        flexibility: "You can access your money when you need it, and we can keep the account simple.",
        support: "You'll have a real local team to call, and I'll make sure you know who to reach."
      }[choice];
      if (!reply) return;
      if (meeting.pitched) return notify("They've heard your pitch. Invite them to open or give them room to think.");
      meeting.turn += 1;
      const matched = choice === meeting.best;
      if (matched) {
        meeting.pitched = true;
        meeting.rapport = Math.min(4, meeting.rapport + 2);
        meeting.transcript.push({ from: "You", text: reply });
        meeting.transcript.push({ from: "Customer", text: "That answers my main concern. I feel more comfortable moving forward." });
        if (client) {
          client.anger = Math.max(0, client.anger - 8);
          client.sentiment = "Interested in your offer";
        }
      } else {
        meeting.rapport = Math.max(0, meeting.rapport - 1);
        if (meeting.turn >= 5) {
          meeting.status = "completed";
          meeting.outcome = "Customer declined after repeated mismatched pitches";
          meeting.day = state.day;
          if (client) {
            client.anger = Math.min(100, client.anger + 10);
            client.sentiment = "Not interested";
          }
          meeting.transcript.push({ from: "You", text: reply });
          meeting.transcript.push({ from: "Customer", text: "I don't think this is the right fit. Thank you for your time." });
          record(`${client ? client.name : "A customer"} ended the call after repeated pitches that missed their priority.`);
          render();
          notify("Call ended · try opening with questions next time.");
          return;
        }
        meeting.transcript.push({ from: "You", text: reply });
        meeting.transcript.push({ from: "Customer", text: `That's useful, but I'm mainly concerned about ${meeting.priority.toLowerCase()}.` });
        if (client) client.sentiment = "Still weighing options";
      }
      record(`${client ? client.name : "A customer"} ${matched ? "responded well to" : "wasn't persuaded by"} your ${choice} pitch.`);
      notify(matched ? "Good read · the customer is more open to your offer." : "They still have a concern · try a different approach.");
    }
    render();
  }

  function decideMail(id, choice) {
    const message = state.mail.find((item) => item.id === id && item.status === "new");
    if (!message) return;
    if (choice === "read") {
      message.read = true;
      render();
      save();
      return;
    }
    if (choice === "accept") {
      if (message.kind === "referral") {
        state.cash += 9000;
        state.customers += 4;
        state.reputation = Math.min(100, state.reputation + 2);
        record("Accepted a merchant referral: $9,000 referral income, four new customer leads, and +2 reputation.");
      } else if (message.kind === "recognition") {
        if (state.cash < 2500) return notify("You need $2,500 on hand for the staff recognition award.");
        state.cash -= 2500;
        state.reputation = Math.min(100, state.reputation + 3);
        record("Approved a $2,500 staff recognition award; customer trust improved.");
      } else if (message.kind === "liquidity") {
        state.reserveTarget = Math.min(35, state.reserveTarget + 5);
        record(`Accepted the liquidity alert. Reserve target raised to ${state.reserveTarget}%.`);
      } else if (message.kind === "event") {
        if (state.cash < 6000) return notify("You need $6,000 available to sponsor the business fair.");
        state.cash -= 6000;
        state.customers += 8;
        state.reputation = Math.min(100, state.reputation + 3);
        record("Sponsored the neighborhood business fair for $6,000; eight new customers joined and reputation improved.");
      } else if (message.kind === "community") {
        if (state.cash < 4000) return notify("You need $4,000 available for the youth league sponsorship.");
        state.cash -= 4000;
        state.reputation = Math.min(100, state.reputation + 4);
        record("Sponsored the youth league for $4,000; community reputation improved.");
      } else if (message.kind === "market") {
        state.marketPrices.GOV *= 1.006;
        record("Applied the bond-market outlook; government bond prices rose modestly.");
      } else if (message.kind === "volatility") {
        const holding = state.investments.find((item) => item.symbol === "IDX");
        if (holding) {
          const unitsSold = holding.units * .25;
          const proceeds = unitsSold * state.marketPrices.IDX;
          holding.units -= unitsSold;
          holding.costBasis *= .75;
          state.cash += proceeds;
          if (holding.units < .0001) state.investments = state.investments.filter((item) => item !== holding);
          record(`Trimmed one quarter of your index-fund exposure and moved ${money(proceeds)} back to cash.`);
        } else {
          record("No index position to trim; kept the bank's cash liquid.");
        }
      } else if (message.kind === "recovery") {
        if (state.cash < 5000) return notify("You need $5,000 available to issue the service recovery credit.");
        state.cash -= 5000;
        state.reputation = Math.min(100, state.reputation + 5);
        record("Issued a $5,000 service recovery credit; the long-time customer relationship was saved.");
      }
    } else if (choice === "decline") {
      if (message.kind === "recovery") state.reputation = Math.max(0, state.reputation - 3);
      if (message.kind === "event" || message.kind === "community") {
        record(`Passed on the expense in “${message.subject}” and kept the cash available.`);
      } else {
        record(`Declined the email offer: “${message.subject}”.`, "warn");
      }
    } else if (choice === "archive") {
      record(`Acknowledged and archived “${message.subject}”.`);
    }
    message.status = choice === "accept" ? "accepted" : choice === "decline" ? "declined" : "archived";
    render();
    notify(`Email ${message.status}.`);
  }

  function tradeInvestment(symbol, action) {
    const product = investmentProducts.find((item) => item.symbol === symbol);
    if (!product) return;
    const price = state.marketPrices[symbol] || 100;
    const holding = state.investments.find((item) => item.symbol === symbol);
    if (action === "buy") {
      const field = document.querySelector(`[data-invest-amount="${symbol}"]`);
      const amount = Number(field ? field.value : 0);
      if (!Number.isFinite(amount) || amount < 1000) return notify("Enter an investment of at least $1,000.");
      if (amount > lendableCash()) return notify(`Only ${money(lendableCash())} is available after reserves and commitments.`);
      const units = amount / price;
      if (holding) {
        holding.costBasis += amount;
        holding.units += units;
      } else {
        state.investments.push({ symbol, units, costBasis: amount });
      }
      state.cash -= amount;
      record(`Invested ${money(amount)} in ${product.name}.`);
      notify(`${money(amount)} invested in ${product.name}.`);
    } else {
      if (!holding) return notify("There is no position to sell.");
      const proceeds = holding.units * price;
      state.cash += proceeds;
      state.investments = state.investments.filter((item) => item.symbol !== symbol);
      record(`Sold the ${product.name} position for ${money(proceeds)}.`);
      notify(`${money(proceeds)} returned to cash.`);
    }
    render();
  }

  function changeStaff(branchId, change) {
    const branch = state.branches.find((item) => item.id === branchId);
    if (!branch) return;
    if (change === "hire") {
      if (state.cash < 2500) return notify("You need $2,500 available for the hiring and training cost.");
      state.cash -= 2500;
      branch.staff += 1;
      record(`Hired a team member for ${branch.name}. Daily payroll increased by $35.`);
      notify(`New employee hired at ${branch.name}.`);
    } else {
      if (branch.staff <= 2) return notify("Every branch must keep at least two employees.");
      branch.staff -= 1;
      record(`A team member was let go from ${branch.name}. Daily payroll reduced by $35.`, "warn");
      notify(`Employee removed from ${branch.name}.`);
    }
    render();
  }

  function finishDay() {
    const openingCash = state.cash;
    const dailyDepositsCost = dailyDepositInterest();
    const branchCosts = state.branches.length * 850;
    const payrollCost = dailyPayroll();
    const vehicleCosts = dailyVehicleCosts();
    const serviceIncome = dailyServiceIncome();
    const investmentIncome = dailyInvestmentIncome();
    let principalReceipts = 0;
    let interestReceipts = 0;
    for (const loan of activeLoanList()) {
      const interest = loan.balance * loan.apr / 36500;
      const paymentRoll = Math.random();
      if (paymentRoll > loan.repaymentReliability) {
        loan.balance += interest;
        loan.missedDays += 1;
        loan.paymentStatus = loan.missedDays >= 15 ? "Default watch" : `Late · ${loan.missedDays}d`;
        loan.paymentHistory.push(0);
        loan.paymentHistory = loan.paymentHistory.slice(-7);
        if (loan.missedDays === 1 || loan.missedDays % 7 === 0) {
          record(`${loan.borrower} missed a loan payment (${loan.missedDays} day${loan.missedDays === 1 ? "" : "s"} late).`, "warn");
        }
        if (loan.missedDays >= 30) {
          defaultLoan(loan);
        }
        continue;
      }
      const scheduledPrincipal = loan.balance / Math.max(1, loan.remainingDays);
      if (paymentRoll > loan.repaymentReliability - .06) {
        const partialInterest = interest * .6;
        const unpaidInterest = interest - partialInterest;
        const partialPrincipal = Math.min(loan.balance, scheduledPrincipal * .4);
        loan.balance += unpaidInterest - partialPrincipal;
        loan.missedDays += 1;
        loan.paymentStatus = "Partial payment";
        loan.paymentHistory.push(3);
        loan.paymentHistory = loan.paymentHistory.slice(-7);
        loan.totalInterestPaid += partialInterest;
        principalReceipts += partialPrincipal;
        interestReceipts += partialInterest;
        if (loan.missedDays === 1 || loan.missedDays % 7 === 0) {
          record(`${loan.borrower} paid less than scheduled. Remaining interest is added to the balance.`, "warn");
        }
        if (loan.missedDays >= 30) defaultLoan(loan);
        continue;
      }
      const paidExtra = Math.random() < loan.extraPaymentChance;
      const principal = Math.min(loan.balance, scheduledPrincipal * (paidExtra ? 2.5 : 1));
      loan.balance -= principal;
      loan.remainingDays = Math.max(0, loan.remainingDays - 1);
      loan.missedDays = 0;
      loan.totalInterestPaid += interest;
      principalReceipts += principal;
      interestReceipts += interest;
      loan.paymentStatus = paidExtra ? "Paid ahead" : "On schedule";
      loan.paymentHistory.push(paidExtra ? 2 : 1);
      loan.paymentHistory = loan.paymentHistory.slice(-7);
      if (loan.balance <= 0.01 || loan.remainingDays === 0) {
        loan.balance = 0;
        loan.status = "paid-off";
        state.completedLoans.unshift({ ...loan, payoffDay: state.day + 1 });
        state.completedLoans = state.completedLoans.slice(0, 30);
        record(`${loan.borrower}'s ${loan.purpose} loan was fully repaid.`);
      }
    }
    state.loans = activeLoanList().reduce((sum, loan) => sum + loan.balance, 0);
    const net = interestReceipts - dailyDepositsCost - branchCosts - payrollCost - vehicleCosts + serviceIncome + investmentIncome + principalReceipts;
    const operatingIncome = interestReceipts + serviceIncome + investmentIncome;
    const operatingExpenses = dailyDepositsCost + branchCosts + payrollCost + vehicleCosts;
    const operatingResult = operatingIncome - operatingExpenses;
    state.day += 1;
    state.cash += net;
    const depositGrowth = Math.round(state.customers * (state.depositApy >= 4 ? 1.9 : 1.1));
    state.deposits += depositGrowth;
    state.cash += depositGrowth;
    processClientServiceDay();
    for (const meeting of state.meetings.filter((item) => item.status === "waiting")) {
      meeting.status = "missed";
      meeting.outcome = "Call missed";
      meeting.day = state.day;
      const client = clientById(meeting.clientId);
      if (client) {
        client.anger = Math.min(100, client.anger + 15);
        client.sentiment = "Missed call";
      }
      record(`${meeting.clientName}'s call went unanswered. Customer trust fell.`, "warn");
    }
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
    state.cashflowHistory.unshift({
      day: state.day - 1, income: operatingIncome, expenses: operatingExpenses,
      operatingNet: operatingIncome - operatingExpenses, principal: principalReceipts,
      cashChange: state.cash - openingCash
    });
    state.cashflowHistory = state.cashflowHistory.slice(0, 30);
    record(`Day ${state.day - 1} closed. Net operating result: ${money(operatingResult)}.`);
    state.secondsRemaining = 240;
    state.activityCountdown = 8 + Math.floor(Math.random() * 19);
    state.callCountdown = 24 + Math.floor(Math.random() * 48);
    state.marketCountdown = 13 + Math.floor(Math.random() * 23);
    state.eventCountdown = 42 + Math.floor(Math.random() * 66);
    save();
    render();
    refreshClock();
    notify(`Day ${state.day - 1} closed · operating result ${money(operatingResult)} · Day ${state.day} is open.`);
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

  function resolveClientRequest(request, status, message, calmClient = true) {
    const client = clientById(request.clientId);
    request.status = status;
    request.resolvedDay = state.day;
    if (client) {
      if (calmClient) client.anger = Math.max(0, client.anger - 22);
      client.sentiment = client.anger >= 50 ? "Frustrated" : "Happy";
    }
    state.completedRequests.unshift({
      id: request.id, clientId: request.clientId, name: client ? client.name : "Former client",
      kind: request.kind, product: request.product, status, day: state.day, message
    });
    state.completedRequests = state.completedRequests.slice(0, 30);
  }

  function activateClientOffer(request) {
    const client = clientById(request.clientId);
    if (!client || client.status !== "active") {
      resolveClientRequest(request, "declined", "Client is no longer active.");
      return;
    }
    if (request.kind === "account-open") {
      const startingBalance = request.amount;
      const newRelationship = !accountList().some((account) => account.clientId === client.id)
        && !activeLoanList().some((loan) => loan.clientId === client.id);
      state.accounts.push({
        id: state.nextId++, clientId: client.id, type: request.product,
        balance: startingBalance, apy: request.offeredApy, status: "active"
      });
      state.cash += startingBalance;
      state.deposits += startingBalance;
      if (newRelationship) state.customers += 1;
      resolveClientRequest(request, "accepted", `${request.offeredApy.toFixed(2)}% APY account opened.`);
      record(`${client.name} accepted a ${request.offeredApy.toFixed(2)}% APY ${request.product} offer and deposited ${money(startingBalance)}.`);
    } else {
      const otherCommitments = Math.max(0, committedLoanOffers() - request.amount);
      if (state.cash - request.amount < requiredReserve() + pendingWithdrawalAmount() + otherCommitments) {
        resolveClientRequest(request, "declined", "Bank did not have enough reserve liquidity.", false);
        client.anger = Math.min(99, client.anger + 14);
        client.sentiment = "Frustrated";
        record(`${client.name}'s loan offer could not be funded without breaching the reserve guideline.`, "warn");
        return;
      }
      const termDays = request.offeredTerm * 30;
      const loan = {
        id: state.nextId++, clientId: client.id, borrower: client.name, purpose: request.product,
        principal: request.amount, balance: request.amount, apr: request.offeredApr,
        remainingDays: termDays, totalInterestPaid: 0,
        collateralType: request.offeredCollateralType || "Unsecured",
        collateralValue: request.offeredCollateralValue || 0,
        repaymentReliability: Math.max(.65, Math.min(.995, .88 + (client.score - 600) / 1600)),
        extraPaymentChance: Math.max(.01, Math.min(.15, (client.score - 600) / 3000)),
        paymentStatus: "On schedule", missedDays: 0, paymentHistory: [], status: "active"
      };
      state.activeLoans.push(loan);
      state.cash -= request.amount;
      state.loans += request.amount;
      resolveClientRequest(request, "accepted", `${request.offeredApr.toFixed(2)}% APR · ${request.offeredTerm}-month loan funded.`);
      record(`${client.name} accepted a ${request.offeredApr.toFixed(2)}% APR ${request.product} for ${money(request.amount)}.`);
    }
  }

  function declineClientOffer(request) {
    const client = clientById(request.clientId);
    resolveClientRequest(request, "declined", "Client declined the offered terms.", false);
    if (client) {
      client.anger = Math.min(99, client.anger + 12);
      client.sentiment = "Frustrated";
    }
    record(`${client ? client.name : "A client"} declined the bank's offer and is disappointed.`, "warn");
  }

  function closeClientAccount(request) {
    const account = state.accounts.find((item) => item.id === request.accountId && item.status === "active");
    const client = clientById(request.clientId);
    if (!account || state.cash < account.balance) return;
    if (state.cash - account.balance < requiredReserve()) {
      record(`Closing ${account.type} will put the bank below its reserve target; withdrawal was still honored.`, "warn");
    }
    state.cash -= account.balance;
    state.deposits -= account.balance;
    account.status = "closed";
    resolveClientRequest(request, "completed", `${account.type} closed; ${money(account.balance)} returned.`);
    record(`${client ? client.name : "A client"} closed an account and withdrew ${money(account.balance)}.`);
  }

  function honorWithdrawal(id) {
    const request = state.requests.find((item) => item.id === id && item.status === "pending" && item.kind === "withdrawal");
    if (!request) return;
    const account = state.accounts.find((item) => item.id === request.accountId && item.status === "active");
    if (!account) return notify("That account is no longer open.");
    const amount = Math.min(request.amount, account.balance);
    if (state.cash < amount) return notify(`Not enough liquid cash yet. You need ${money(amount - state.cash)} more.`);
    const client = clientById(request.clientId);
    state.cash -= amount;
    state.deposits -= amount;
    account.balance -= amount;
    if (account.balance <= .01) {
      account.balance = 0;
      account.status = "closed";
    }
    resolveClientRequest(request, "completed", `${money(amount)} withdrawal paid from ${account.type}.`);
    record(`${client ? client.name : "A client"} withdrew ${money(amount)} from ${account.type}.`);
    if (state.cash < requiredReserve()) record("A customer withdrawal dipped into the bank's target reserve.", "warn");
    render();
    notify(`Withdrawal paid · ${money(amount)} delivered to the customer.`);
  }

  function closeClientLoan(request) {
    const loan = state.activeLoans.find((item) => item.id === request.loanId && item.status === "active");
    const client = clientById(request.clientId);
    if (!loan) {
      resolveClientRequest(request, "declined", "Requested loan was no longer active.");
      return;
    }
    const payoffAmount = loan.balance;
    state.cash += payoffAmount;
    state.loans -= payoffAmount;
    loan.balance = 0;
    loan.remainingDays = 0;
    loan.status = "paid-off";
    state.completedLoans.unshift({ ...loan, payoffDay: state.day });
    state.completedLoans = state.completedLoans.slice(0, 30);
    resolveClientRequest(request, "completed", `${money(payoffAmount)} early payoff processed.`);
    record(`${client ? client.name : "A client"} paid off ${money(payoffAmount)} of their loan early.`);
  }

  function payOffLoan(id) {
    const loan = activeLoanList().find((item) => item.id === id);
    if (!loan) return;
    const payoffAmount = loan.balance;
    state.cash += payoffAmount;
    state.loans -= payoffAmount;
    loan.balance = 0;
    loan.remainingDays = 0;
    loan.status = "paid-off";
    state.completedLoans.unshift({ ...loan, payoffDay: state.day });
    state.completedLoans = state.completedLoans.slice(0, 30);
    record(`${loan.borrower} paid off their ${loan.purpose} loan early for ${money(payoffAmount)}.`);
    render();
    notify(`Loan paid off · ${money(payoffAmount)} principal recovered.`);
  }

  function completeClientRequest(id) {
    const request = state.requests.find((item) => item.id === id && item.status === "pending");
    if (!request) return;
    if (request.kind === "account-close") {
      const account = state.accounts.find((item) => item.id === request.accountId && item.status === "active");
      if (!account) return notify("That account is no longer open.");
      if (state.cash < account.balance) return notify(`Withdrawal queued: ${money(account.balance - state.cash)} more cash is needed to close this account.`);
      closeClientAccount(request);
    } else if (request.kind === "loan-close") closeClientLoan(request);
    else return notify("Send an offer for this request so the client can review your terms.");
    render();
    notify("Client request completed.");
  }

  function offerClientTerms(id) {
    const request = state.requests.find((item) => item.id === id && item.status === "pending");
    if (!request) return;
    const client = clientById(request.clientId);
    if (!client || client.status !== "active") return notify("This client is no longer active.");
    const card = document.querySelector(`[data-request-card="${id}"]`);
    if (!card) return;
    if (request.kind === "account-open") {
      const apy = Number(card.querySelector('[data-offer-field="apy"]').value);
      if (!Number.isFinite(apy) || apy < 0 || apy > 9) return notify("Set an account APY between 0% and 9%.");
      request.offeredApy = apy;
      request.acceptanceChance = Math.max(12, Math.min(96, 42 + apy * 6 - client.anger * 0.25));
    } else {
      const apr = Number(card.querySelector('[data-offer-field="apr"]').value);
      const term = Number(card.querySelector('[data-offer-field="term"]').value);
      const collateralType = card.querySelector('[data-offer-field="collateral"]').value;
      const collateralValue = Number(card.querySelector('[data-offer-field="collateral-value"]').value);
      if (!Number.isFinite(apr) || apr < 3 || apr > 24) return notify("Set a loan APR between 3% and 24%.");
      if (!Number.isInteger(term) || term < 6 || term > 60) return notify("Choose a loan term from 6 to 60 months.");
      if (!Number.isFinite(collateralValue) || collateralValue < 0 || collateralValue > 5000000) return notify("Set collateral value between $0 and $5,000,000.");
      if (client.score < state.minCreditScore) return notify(`Credit score ${client.score} is below your ${state.minCreditScore} minimum.`);
      if (request.amount > lendableCash()) return notify(`Only ${money(lendableCash())} is safely lendable after reserves and pending withdrawals.`);
      request.offeredApr = apr;
      request.offeredTerm = term;
      request.offeredCollateralType = collateralType;
      request.offeredCollateralValue = collateralType === "Unsecured" ? 0 : collateralValue;
      request.acceptanceChance = Math.max(8, Math.min(96, 93 - apr * 2.8 + (client.score - 650) * 0.12 - client.anger * 0.22 + (collateralType === "Unsecured" ? -3 : 3)));
    }
    request.status = "offered";
    request.age = 0;
    request.offerDay = state.day;
    client.sentiment = "Considering offer";
    record(`Sent ${client.name} a ${request.kind === "loan-open" ? `${request.offeredApr.toFixed(2)}% APR loan` : `${request.offeredApy.toFixed(2)}% APY account`} offer.`);
    render();
    notify(`Offer sent. ${client.name} will decide when the live day closes.`);
  }

  function generateClientRequest() {
    let candidates = state.clients.filter((client) => client.status === "active" &&
      state.requests.filter((request) => request.clientId === client.id && (request.status === "pending" || request.status === "offered")).length < 2);
    if (!candidates.length) {
      const names = [["Tessa Green", "TG"], ["Victor Alvarez", "VA"], ["Nina Patel", "NP"], ["Caleb Wright", "CW"], ["Harper Lee", "HL"], ["Mateo Cruz", "MC"], ["Aaliyah Brooks", "AB"], ["Evan Foster", "EF"], ["Sofia Bennett", "SB"], ["Jayden Cole", "JC"]];
      const [name, initials] = names[Math.floor(Math.random() * names.length)];
      const score = Math.floor(570 + Math.random() * 261);
      const client = { id: state.nextId++, name, initials, score, anger: 0, status: "active", sentiment: "New" };
      state.clients.push(client);
      candidates = [client];
    }
    const client = candidates[Math.floor(Math.random() * candidates.length)];
    const accounts = accountList().filter((account) => account.clientId === client.id);
    const loans = activeLoanList().filter((loan) => loan.clientId === client.id);
    const choices = ["account-open", "loan-open"];
    if (accounts.length) choices.push("account-close");
    if (accounts.some((account) => account.balance > 1000)) choices.push("withdrawal", "withdrawal");
    if (loans.length) choices.push("loan-close");
    const kind = choices[Math.floor(Math.random() * choices.length)];
    let request;
    if (kind === "account-close") {
      const account = accounts[Math.floor(Math.random() * accounts.length)];
      request = { accountId: account.id, amount: account.balance, product: account.type };
    } else if (kind === "withdrawal") {
      const account = accounts.filter((item) => item.balance > 1000)[Math.floor(Math.random() * accounts.filter((item) => item.balance > 1000).length)];
      const amount = Math.min(account.balance, Math.round((account.balance * (.2 + Math.random() * .6)) / 500) * 500);
      request = { accountId: account.id, amount, product: account.type };
    } else if (kind === "loan-close") {
      const loan = loans[Math.floor(Math.random() * loans.length)];
      request = { loanId: loan.id, amount: loan.balance, product: loan.purpose };
    } else if (kind === "loan-open") {
      request = { amount: Math.round((10000 + Math.random() * 45000) / 500) * 500, product: ["Auto loan", "Home improvement", "Small business"][Math.floor(Math.random() * 3)] };
    } else {
      request = { amount: Math.round((8000 + Math.random() * 42000) / 500) * 500, product: ["Personal savings", "High-yield savings", "Business checking"][Math.floor(Math.random() * 3)] };
    }
    state.requests.unshift({
      id: state.nextId++, clientId: client.id, channel: Math.random() < 0.5 ? "call" : "message",
      kind, ...request, age: 0, status: "pending"
    });
    if (state.requests.length > 180) {
      const activeRequests = state.requests.filter((item) => item.status === "pending" || item.status === "offered");
      const resolvedRequests = state.requests.filter((item) => item.status !== "pending" && item.status !== "offered").slice(0, 80);
      state.requests = [...activeRequests, ...resolvedRequests];
    }
    client.anger = Math.min(client.anger, 85);
    client.sentiment = "Waiting";
    record(`New ${kind === "withdrawal" ? `${money(request.amount)} withdrawal` : kind.includes("loan") ? "loan" : "account"} ${kind.endsWith("close") ? "closure" : "service"} request from ${client.name}.`);
  }

  function processClientServiceDay() {
    for (const request of [...state.requests]) {
      if (request.status === "offered" && request.offerDay < state.day) {
        if (Math.random() * 100 < request.acceptanceChance) activateClientOffer(request);
        else declineClientOffer(request);
      } else if (request.status === "pending") {
        request.age += 1;
        const client = clientById(request.clientId);
        if (client) {
          client.anger = Math.min(100, client.anger + 14);
          client.sentiment = client.anger >= 65 ? "Frustrated" : "Waiting";
        }
      }
    }
    for (const client of state.clients) {
      if (client.status !== "active" || client.anger < 100) continue;
      client.status = "departed";
      client.sentiment = "Left the bank";
      for (const account of accountList().filter((item) => item.clientId === client.id)) {
        state.cash -= account.balance;
        state.deposits -= account.balance;
        account.status = "closed";
      }
      for (const request of state.requests) {
        if (request.clientId === client.id && (request.status === "pending" || request.status === "offered")) {
          request.status = "cancelled";
        }
      }
      state.customers = Math.max(0, state.customers - 1);
      state.reputation = Math.max(0, state.reputation - 3);
      record(`${client.name} left the bank after unanswered requests. Their deposits were withdrawn.`, "warn");
    }
    if (state.day >= state.nextRequestDay) {
      const newRequests = 1 + Math.floor(Math.random() * 3);
      for (let index = 0; index < newRequests; index += 1) generateClientRequest();
      state.nextRequestDay = state.day + 1;
    }
  }

  function decideLoan(id, decision) {
    const application = state.applications.find((item) => item.id === id);
    if (!application || application.status !== "pending") return;
    if (decision === "approve") {
      if (application.score < state.minCreditScore) {
        return notify(`Score ${application.score} is below your ${state.minCreditScore} minimum. Adjust policy or deny this application.`);
      }
      if (application.amount > lendableCash()) {
        return notify(`Only ${money(lendableCash())} is safely lendable after the reserve target and queued customer withdrawals.`);
      }
      application.status = "approved";
      state.cash -= application.amount;
      state.loans += application.amount;
      let client = state.clients.find((item) => item.name === application.name && item.status === "active");
      if (!client) {
        client = { id: state.nextId++, name: application.name, initials: application.initials, score: application.score, anger: 0, status: "active", sentiment: "Happy" };
        state.clients.push(client);
        state.customers += 1;
      }
      const collateral = collateralFor(application.purpose, application.amount);
      state.activeLoans.push({
        id: state.nextId++, clientId: client.id, borrower: application.name, purpose: application.purpose,
        principal: application.amount, balance: application.amount, apr: state.loanApr,
        remainingDays: 36 * 30, totalInterestPaid: 0, ...collateral,
        repaymentReliability: Math.max(.65, Math.min(.995, .88 + (application.score - 600) / 1600)),
        extraPaymentChance: Math.max(.01, Math.min(.15, (application.score - 600) / 3000)),
        paymentStatus: "On schedule", missedDays: 0, paymentHistory: [], status: "active"
      });
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
      const group = tabButton.closest(".nav-group");
      if (group) group.open = true;
      state.placeMode = false;
      render();
      return;
    }
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const { action, id } = actionButton.dataset;
    if (action === "toggle-clock") {
      state.clockPaused = !state.clockPaused;
      refreshClock();
      save();
      notify(state.clockPaused ? "Day paused. Take your time managing the bank." : "Day resumed. Your four-minute shift is running.");
    } else if (action === "tutorial-replay") {
      tutorialStep = 0;
      state.tutorialComplete = false;
      activeTab = "dashboard";
      render();
    } else if (action === "tutorial-next") advanceTutorial(1);
    else if (action === "tutorial-back") advanceTutorial(-1);
    else if (action === "tutorial-skip") advanceTutorial(0);
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
    else if (action === "payoff-loan") payOffLoan(Number(id));
    else if (action === "offer-terms") offerClientTerms(Number(id));
    else if (action === "complete-request") completeClientRequest(Number(id));
    else if (action === "honor-withdrawal") honorWithdrawal(Number(id));
    else if (action === "decline-request") {
      const request = state.requests.find((item) => item.id === Number(id) && item.status === "pending");
      if (request) {
        request.status = "declined";
        resolveClientRequest(request, "declined", "Bank declined the request.", false);
        const client = clientById(request.clientId);
        if (client) {
          client.anger = Math.min(99, client.anger + 22);
          client.sentiment = "Frustrated";
        }
        record(`${client ? client.name : "A client"} was disappointed by a declined service request.`, "warn");
        render();
      }
    } else if (action === "withdraw-offer") {
      const request = state.requests.find((item) => item.id === Number(id) && item.status === "offered");
      if (request) {
        request.status = "pending";
        delete request.offerDay;
        const client = clientById(request.clientId);
        if (client) client.sentiment = "Waiting";
        render();
        notify("Offer withdrawn. The request is back in your inbox.");
      }
    } else if (action === "answer-call" || action === "call-pitch") answerZoomCall(Number(id), actionButton.dataset.choice);
    else if (action === "read-mail") decideMail(Number(id), "read");
    else if (action === "mail-decision") decideMail(Number(id), actionButton.dataset.choice);
    else if (action === "buy-investment") tradeInvestment(actionButton.dataset.symbol, "buy");
    else if (action === "sell-investment") tradeInvestment(actionButton.dataset.symbol, "sell");
    else if (action === "staff-change") changeStaff(Number(id), actionButton.dataset.change);
  });

  document.addEventListener("input", (event) => {
    const setting = event.target.dataset.setting;
    if (!setting) return;
    state[setting] = Number(event.target.value);
    const output = document.querySelector(`#${event.target.id.replace("range", "output")}`);
    if (output) output.value = setting === "minCreditScore" ? state[setting] : `${state[setting].toFixed(setting === "reserveTarget" ? 0 : 2)}%`;
    if (output) output.textContent = setting === "minCreditScore" ? state[setting] : `${state[setting].toFixed(setting === "reserveTarget" ? 0 : 2)}%`;
    refreshLiquidity();
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
  refreshClock();
  setInterval(runClock, 1000);
})();
