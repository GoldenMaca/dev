# Commonwealth Bank Simulator

A self-contained bank management game. Open `index.html` in a modern browser;
no build step, server, or external dependencies are required. The game saves
automatically in the browser's local storage.

## Play

- **Overview:** review your balance sheet, daily income and costs, and drag the
  city map to explore your branch network. Use the map controls or mouse wheel
  to zoom. The active-shift board links to decisions across the bank.
- **Navigation:** use the collapsible Customers, Money & lending, and Bank
  operations groups to keep related screens together. The income report is
  pinned in the Overview and has a dedicated daily ledger.
- **Branches:** open locations on the map, upgrade their capacity, and keep an
  eye on cash and security at each site.
- **Lending:** assess applicants using their credit score and risk rating, set
  a minimum score policy, and approve or deny pending loans.
- **Active loans:** follow each loan's APR, declining balance, daily payment,
  expected payoff date, collateral, recent payment history, and completed
  payoffs. Payments may be late, partial, or ahead of schedule; prolonged
  delinquency can default a loan, with partial collateral recovery.
- **Liquidity:** the sidebar shows cash available to lend after the target
  reserve, queued withdrawals/account closures, and pending loan offers.
  Change the reserve target in Treasury. Clients may request partial
  withdrawals; pay them from the Client desk when funds are available. An
  account closure returns its full balance and waits if the bank lacks cash.
- **Client desk:** respond to calls and messages about opening or closing
  accounts and loans. Set an APY for account offers or an APR and term for loan
  offers. Clients decide on offered terms when the live day closes; ignored requests
  raise client anger, and a client leaves at 100%.
- **Sales calls:** learn a caller's goal, read their priority, and pitch a
  tailored savings or checking account. A clear, relevant response builds
  rapport and makes a close more likely; you may add a $500 welcome bonus.
  Pushy or mismatched pitches can lose the sale, and unanswered calls damage
  customer trust.
- **Mail & email:** open incoming market briefs, referrals, and operations
  messages. Read the details and accept or decline actionable opportunities.
- **Investments:** put safe-to-lend surplus cash into fictional government
  bonds, municipal bonds, or a market index fund. Prices change during the day;
  positions can gain or lose value and earn daily yield.
- **People & payroll:** hire or fire staff at each branch. Employees increase
  customer capacity but add daily payroll; each branch must retain at least
  two people.
- **Income & expenses:** see estimated daily income by source and expenses by
  category, then compare them with actual day-close results. Loan principal
  repayments are tracked separately from earned income.
- **Treasury:** set deposit APY and loan APR, and monitor your cash reserve,
  net interest income, and simplified balance sheet. The base deposit APY
  applies to legacy deposits; newly offered accounts have their own APY.
  The reserve target protects cash for customer withdrawals before lending.
- **Security & vault:** improve the central vault and bank security, harden
  individual branches, and purchase armored vehicles to send cash to branches.
- **Four-minute day:** each game day runs for four real minutes, with a visible
  countdown in the top bar. Pause or resume at any time. New client requests,
  credit applications, varied emails, sales calls, and market movements arrive
  at changing intervals; activity types avoid immediate repetition, and random
  events add extra surprises.
  At day close the bank settles interest, loan payments, investment yield,
  payroll, operating costs, deposit growth, and client decisions. The first-run
  tour pauses the clock and can be replayed with **? Tour**.

The simulator uses a simplified, fictional banking model. All financial
figures are in US dollars; game state stays in the current browser.
