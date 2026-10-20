# Ledger

A personal finance tool that records income and expenses, stores everything offline and exports clean CSV or JSON files.

## Features

- Four live summaries: balance, monthly income, monthly expenses and savings rate
- Add, edit and delete transactions with validation and a six second undo action
- Month picker, income and expense filters, and description or category search
- Expense breakdown by category with amounts and shares
- Six month cashflow chart built from live data
- Four currencies: USD, EUR, GBP and NGN
- CSV export and JSON backup, plus JSON import with an undo action
- Sample data on first run and a restore button
- Everything saved in localStorage, with no account and no network requests after load
- Responsive down to 390px and a reduced motion mode

## Running it

Open `index.html` in a browser. There is no build step and no dependencies to install.

## Files

```
index.html
styles.css
script.js
```

## Tech

Plain HTML, CSS and JavaScript.

## Storage

Transactions and the selected currency live under `ledger:transactions:v1` and `ledger:currency:v1` in localStorage.
