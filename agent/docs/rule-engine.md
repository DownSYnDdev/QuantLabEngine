# QuantLab Rule Engine
Version: 1.0.0
Scope: Defines the logic, parameters, and enforcement mechanisms for all trading rules applied to prop-firm accounts.

The Rule Engine is responsible for validating every trade and account state update against the active configuration.

## 1. Daily Loss Limit
**Logic**: Prevents a trader from losing more than a specific amount in a single trading day.
- **Calculation**: `Current Daily Loss = Initial Equity at Start of Day - Current Equity`
- **Trigger**: If `Current Daily Loss > config.dailyLossLimit`
- **Action**: 
    1. Close all open positions immediately.
    2. Disable trading for the rest of the day (or permanently, depending on config).
    3. Emit `rule.violation.daily_loss`.

## 2. Max Total Loss (Max Drawdown)
**Logic**: Prevents the account equity from ever falling below a fixed threshold.
- **Calculation**: `Equity < (Initial Balance - config.maxLossLimit)`
- **Trigger**: If `Equity < Hard Breach Level`
- **Action**:
    1. Liquidate Account.
    2. Mark Account as `breached`.
    3. Emit `rule.violation.max_loss`.

## 3. Max Trailing Drawdown
**Logic**: A dynamic drawdown limit that trails the account's high-water mark (HWM) up to a certain point (usually the initial balance).
- **Calculation**: `HWM = max(HWM, Current Equity)`. `Drawdown Limit = HWM - config.trailingDrawdownAmount`.
- **Trigger**: If `Equity < Drawdown Limit`
- **Action**:
    1. Liquidate Account.
    2. Mark Account as `breached`.
    3. Emit `rule.violation.drawdown`.

## 4. Minimum Trading Days
**Logic**: Requires the trader to trade on a minimum number of unique days to be eligible for a payout or phase completion.
- **Calculation**: Count of unique days where at least one trade was opened.
- **Trigger**: Checked during `Payout Request` or `Phase Promotion`.
- **Action**: Deny request if `Actual Days < config.minTradingDays`. Emit `rule.violation.min_days` (soft violation).

## 5. Consistency Rules
**Logic**: Prevents "gambler" behavior by ensuring no single day accounts for too much of the total profit, or requiring consistent trade volume.
- **Profit Consistency**: `Max Profit Day / Total Profit < config.maxProfitDayPercent` (e.g., 30%).
- **Lot Size Consistency**: Average lot size must be within a range.
- **Trigger**: Checked during `Phase Promotion`.
- **Action**: Deny promotion. Emit `rule.violation.consistency`.

## 6. Allowed Instruments
**Logic**: Restricts trading to a specific whitelist of symbols (e.g., EURUSD, BTCUSD).
- **Trigger**: Checked on `Order Placement` (Pre-trade).
- **Action**: Reject Order. Emit `rule.violation.instrument`.

## 7. Trading Hours (Weekend/Holiday)
**Logic**: Forces positions to be closed before market close on Fridays or holidays.
- **Trigger**: `Time > Market Close - config.closeBufferMinutes`
- **Action**: 
    1. Force close open positions.
    2. Reject new orders.
    3. Emit `rule.violation.trading_hours` (if attempted).

## 8. News Filters (Optional)
**Logic**: Restricts trading during high-impact news events.
- **Trigger**: `Time within +/- config.newsBufferMinutes` of a High Impact Event.
- **Action**: 
    1. Reject new orders.
    2. (Optional) Close specific positions.
    3. Emit `rule.violation.news_event`.
