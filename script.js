const STORAGE_KEY = 'ledger:transactions:v1';
const CURRENCY_KEY = 'ledger:currency:v1';

const CATEGORIES = {
  expense: ['Housing', 'Groceries', 'Transport', 'Utilities', 'Software', 'Health', 'Dining', 'Leisure', 'Other'],
  income: ['Salary', 'Freelance', 'Interest', 'Gift', 'Other']
};

const balanceEl = document.getElementById('balance');
const balanceNote = document.getElementById('balanceNote');
const incomeEl = document.getElementById('income');
const incomeNote = document.getElementById('incomeNote');
const expensesEl = document.getElementById('expenses');
const expensesNote = document.getElementById('expensesNote');
const savingsEl = document.getElementById('savings');
const savingsNote = document.getElementById('savingsNote');
const txnSub = document.getElementById('txnSub');
const txnList = document.getElementById('txnList');
const empty = document.getElementById('empty');
const listCount = document.getElementById('listCount');
const monthInput = document.getElementById('month');
const typeFilters = document.getElementById('typeFilters');
const searchInput = document.getElementById('search');
const currencySelect = document.getElementById('currency');
const breakdown = document.getElementById('breakdown');
const breakdownSub = document.getElementById('breakdownSub');
const breakdownEmpty = document.getElementById('breakdownEmpty');
const cashflow = document.getElementById('cashflow');
const cashflowEmpty = document.getElementById('cashflowEmpty');
const form = document.getElementById('txnForm');
const typeToggle = document.getElementById('typeToggle');
const descInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const categorySelect = document.getElementById('category');
const descErr = document.getElementById('descErr');
const amountErr = document.getElementById('amountErr');
const submitBtn = document.getElementById('submitBtn');
const cancelEdit = document.getElementById('cancelEdit');
const formTitle = document.getElementById('formTitle');
const formSub = document.getElementById('formSub');
const formStamp = document.getElementById('formStamp');
const formMessage = document.getElementById('formMessage');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toastText');
const toastAction = document.getElementById('toastAction');
const resetSample = document.getElementById('resetSample');
const importFile = document.getElementById('importFile');

let transactions = loadTransactions();
let currency = loadCurrency();
let activeType = 'all';
let query = '';
let editingId = null;
let formType = 'expense';
let selectedMonth = currentMonth();
let toastTimer = null;
let messageTimer = null;
let lastDeleted = null;
let lastSnapshot = null;

function pad(value) {
  return String(value).padStart(2, '0');
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
}

function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function isoDate(year, monthIndex, day) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

function sampleDate(offset, day) {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const maxDay = offset === 0 ? now.getDate() : lastDay;
  return isoDate(base.getFullYear(), base.getMonth(), Math.min(day, maxDay));
}

function uid() {
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  return String(Date.now()) + Math.random().toString(16).slice(2);
}

function seedTransactions() {
  return [
    { id: uid(), date: sampleDate(0, 1), desc: 'Monthly salary', amount: 4200, type: 'income', category: 'Salary' },
    { id: uid(), date: sampleDate(0, 4), desc: 'Apartment rent', amount: 1400, type: 'expense', category: 'Housing' },
    { id: uid(), date: sampleDate(0, 5), desc: 'Weekly groceries', amount: 212.4, type: 'expense', category: 'Groceries' },
    { id: uid(), date: sampleDate(0, 7), desc: 'Brand identity project', amount: 850, type: 'income', category: 'Freelance' },
    { id: uid(), date: sampleDate(0, 8), desc: 'Metro and rideshare', amount: 94.6, type: 'expense', category: 'Transport' },
    { id: uid(), date: sampleDate(0, 10), desc: 'Electricity and water', amount: 136.25, type: 'expense', category: 'Utilities' },
    { id: uid(), date: sampleDate(0, 11), desc: 'Design software renewal', amount: 35, type: 'expense', category: 'Software' },
    { id: uid(), date: sampleDate(0, 13), desc: 'Dinner with a client', amount: 78.5, type: 'expense', category: 'Dining' },
    { id: uid(), date: sampleDate(0, 15), desc: 'Pharmacy', amount: 42.1, type: 'expense', category: 'Health' },
    { id: uid(), date: sampleDate(-1, 1), desc: 'Monthly salary', amount: 4200, type: 'income', category: 'Salary' },
    { id: uid(), date: sampleDate(-1, 3), desc: 'Apartment rent', amount: 1400, type: 'expense', category: 'Housing' },
    { id: uid(), date: sampleDate(-1, 6), desc: 'Groceries and household', amount: 268.3, type: 'expense', category: 'Groceries' },
    { id: uid(), date: sampleDate(-1, 9), desc: 'Landing page build', amount: 400, type: 'income', category: 'Freelance' },
    { id: uid(), date: sampleDate(-1, 12), desc: 'Transport pass', amount: 110, type: 'expense', category: 'Transport' },
    { id: uid(), date: sampleDate(-1, 16), desc: 'Internet and power', amount: 124.8, type: 'expense', category: 'Utilities' },
    { id: uid(), date: sampleDate(-1, 19), desc: 'Cinema and lunch', amount: 92.4, type: 'expense', category: 'Leisure' },
    { id: uid(), date: sampleDate(-1, 22), desc: 'Cloud storage', amount: 35, type: 'expense', category: 'Software' },
    { id: uid(), date: sampleDate(-2, 1), desc: 'Monthly salary', amount: 4000, type: 'income', category: 'Salary' },
    { id: uid(), date: sampleDate(-2, 3), desc: 'Apartment rent', amount: 1400, type: 'expense', category: 'Housing' },
    { id: uid(), date: sampleDate(-2, 7), desc: 'Groceries', amount: 241.7, type: 'expense', category: 'Groceries' },
    { id: uid(), date: sampleDate(-2, 10), desc: 'Workshop tickets', amount: 120, type: 'expense', category: 'Leisure' },
    { id: uid(), date: sampleDate(-2, 14), desc: 'Savings interest', amount: 64, type: 'income', category: 'Interest' },
    { id: uid(), date: sampleDate(-2, 18), desc: 'Fuel and parking', amount: 101.5, type: 'expense', category: 'Transport' },
    { id: uid(), date: sampleDate(-2, 21), desc: 'Winter jacket', amount: 160, type: 'expense', category: 'Other' },
    { id: uid(), date: sampleDate(-2, 24), desc: 'Phone bill', amount: 48, type: 'expense', category: 'Utilities' }
  ];
}

function validTransaction(item) {
  return item && typeof item.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && typeof item.desc === 'string' && Number.isFinite(Number(item.amount)) && Number(item.amount) > 0 && (item.type === 'income' || item.type === 'expense');
}

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return seedTransactions();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedTransactions();
    return parsed.filter(validTransaction).map((item) => ({
      id: item.id || uid(),
      date: item.date,
      desc: item.desc,
      amount: Number(item.amount),
      type: item.type,
      category: typeof item.category === 'string' && item.category ? item.category : 'Other'
    }));
  } catch (error) {
    return seedTransactions();
  }
}

function loadCurrency() {
  try {
    const saved = localStorage.getItem(CURRENCY_KEY);
    return ['USD', 'EUR', 'GBP', 'NGN'].includes(saved) ? saved : 'USD';
  } catch (error) {
    return 'USD';
  }
}

function saveTransactions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    showFormMessage('Could not save to localStorage.');
  }
}

function saveCurrency() {
  try {
    localStorage.setItem(CURRENCY_KEY, currency);
  } catch (error) {
    return;
  }
}

function money(value) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value);
}

function monthLabel(month) {
  const [year, index] = month.split('-').map(Number);
  return new Date(year, index - 1, 1).toLocaleString('en', { month: 'long', year: 'numeric' });
}

function shortMonth(month) {
  const [year, index] = month.split('-').map(Number);
  return new Date(year, index - 1, 1).toLocaleString('en', { month: 'short' });
}

function shiftMonth(month, delta) {
  const [year, index] = month.split('-').map(Number);
  const date = new Date(year, index - 1 + delta, 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function monthTransactions(month) {
  return transactions.filter((item) => item.date.slice(0, 7) === month);
}

function totals(list) {
  return list.reduce((result, item) => {
    if (item.type === 'income') result.income += item.amount;
    else result.expense += item.amount;
    return result;
  }, { income: 0, expense: 0 });
}

function renderSummary() {
  const all = totals(transactions);
  const month = totals(monthTransactions(selectedMonth));
  const balance = all.income - all.expense;
  const rate = month.income > 0 ? ((month.income - month.expense) / month.income) * 100 : 0;

  balanceEl.textContent = money(balance);
  balanceNote.textContent = `All time · ${transactions.length} entries`;
  incomeEl.textContent = money(month.income);
  expensesEl.textContent = money(month.expense);
  incomeNote.textContent = monthLabel(selectedMonth);
  expensesNote.textContent = monthLabel(selectedMonth);
  savingsEl.textContent = `${rate > 0 ? '+' : ''}${rate.toFixed(0)}%`;
  savingsEl.style.color = rate >= 0 ? 'var(--green)' : 'var(--orange)';

  if (month.income <= 0 && month.expense <= 0) {
    savingsNote.textContent = 'Nothing recorded';
  } else if (rate >= 20) {
    savingsNote.textContent = `${rate.toFixed(0)}% of income kept`;
  } else if (rate >= 0) {
    savingsNote.textContent = 'Below a 20% target';
  } else {
    savingsNote.textContent = 'Spending above income';
  }
}

function visibleTransactions() {
  const monthList = monthTransactions(selectedMonth);
  return monthList.filter((item) => {
    const typeMatch = activeType === 'all' || item.type === activeType;
    const queryMatch = !query || `${item.desc} ${item.category}`.toLowerCase().includes(query);
    return typeMatch && queryMatch;
  }).sort((a, b) => (a.date === b.date ? String(b.id).localeCompare(String(a.id)) : a.date < b.date ? 1 : -1));
}

function renderTransactions() {
  const monthList = monthTransactions(selectedMonth);
  const visible = visibleTransactions();
  const entries = `${monthList.length} ${monthList.length === 1 ? 'entry' : 'entries'} · ${monthLabel(selectedMonth)}`;
  txnSub.textContent = entries;
  listCount.textContent = `${visible.length} of ${monthList.length} shown`;
  empty.hidden = visible.length !== 0;

  txnList.innerHTML = visible.map((item) => {
    const date = new Date(`${item.date}T00:00:00`);
    const day = pad(date.getDate());
    const month = date.toLocaleString('en', { month: 'short' }).toUpperCase();
    const selected = item.id === editingId ? ' is-editing' : '';
    return `<li class="txn${selected}" data-id="${item.id}">
      <span class="txn-date">${day}<br>${month}</span>
      <div class="txn-main">
        <p class="txn-desc">${escapeHtml(item.desc)}</p>
        <p class="txn-meta">${escapeHtml(item.category)} · ${item.type}</p>
      </div>
      <span class="txn-amount ${item.type}">${item.type === 'income' ? '+' : '−'}${money(item.amount)}</span>
      <div class="txn-actions">
        <button class="icon-btn" type="button" data-action="edit" aria-label="Edit ${escapeHtml(item.desc)}">Edit</button>
        <button class="icon-btn danger" type="button" data-action="delete" aria-label="Delete ${escapeHtml(item.desc)}">Del</button>
      </div>
    </li>`;
  }).join('');
}

function renderBreakdown() {
  const expenses = monthTransactions(selectedMonth).filter((item) => item.type === 'expense');
  breakdownSub.textContent = `Expenses · ${monthLabel(selectedMonth)}`;
  breakdownEmpty.hidden = expenses.length !== 0;
  if (!expenses.length) {
    breakdown.innerHTML = '';
    return;
  }
  const groups = new Map();
  expenses.forEach((item) => {
    groups.set(item.category, (groups.get(item.category) || 0) + item.amount);
  });
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const rows = [...groups.entries()].sort((a, b) => b[1] - a[1]);
  const peak = rows[0][1];
  breakdown.innerHTML = rows.map(([category, value]) => {
    const percent = total > 0 ? (value / total) * 100 : 0;
    return `<li><span class="cat">${escapeHtml(category)}</span><span class="val">${money(value)} · ${percent.toFixed(0)}%</span><span class="bar"><i style="width:${(value / peak) * 100}%"></i></span></li>`;
  }).join('');
}

function renderCashflow() {
  const months = [];
  for (let offset = -5; offset <= 0; offset += 1) {
    months.push(shiftMonth(selectedMonth, offset));
  }
  const rows = months.map((month) => {
    const values = totals(monthTransactions(month));
    return { month, income: values.income, expense: values.expense };
  });
  const peak = Math.max(1, ...rows.map((row) => Math.max(row.income, row.expense)));
  const hasData = rows.some((row) => row.income > 0 || row.expense > 0);
  cashflowEmpty.hidden = hasData;
  cashflow.hidden = !hasData;

  cashflow.setAttribute('aria-label', `Cashflow from ${monthLabel(months[0])} to ${monthLabel(selectedMonth)}`);
  cashflow.innerHTML = rows.map((row) => {
    const incomeHeight = row.income > 0 ? Math.max(2, (row.income / peak) * 100) : 0;
    const expenseHeight = row.expense > 0 ? Math.max(2, (row.expense / peak) * 100) : 0;
    return `<div class="month-group">
      <div class="bars">
        <span class="bar-income" style="height:${incomeHeight}%" title="${shortMonth(row.month)} income ${money(row.income)}"></span>
        <span class="bar-expense" style="height:${expenseHeight}%" title="${shortMonth(row.month)} expenses ${money(row.expense)}"></span>
      </div>
      <span class="month-label">${shortMonth(row.month)}</span>
    </div>`;
  }).join('');
}

function renderAll() {
  renderSummary();
  renderTransactions();
  renderBreakdown();
  renderCashflow();
}

function populateCategories(type, selected) {
  const list = CATEGORIES[type];
  categorySelect.innerHTML = list.map((category) => `<option value="${category}">${category}</option>`).join('');
  categorySelect.value = list.includes(selected) ? selected : list[0];
}

function setFormType(type) {
  formType = type;
  typeToggle.querySelectorAll('button').forEach((button) => {
    const active = button.dataset.type === type;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  populateCategories(type, categorySelect.value);
  if (!editingId) {
    submitBtn.textContent = type === 'income' ? 'Add income' : 'Add expense';
    formTitle.textContent = type === 'income' ? 'Add income' : 'Add transaction';
  }
}

function setFieldError(input, message) {
  const field = input.closest('.field');
  const slot = input === descInput ? descErr : amountErr;
  field.classList.toggle('has-error', Boolean(message));
  if (slot) slot.textContent = message || '';
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function resetForm() {
  editingId = null;
  formType = 'expense';
  descInput.value = '';
  amountInput.value = '';
  dateInput.value = todayIso();
  setFieldError(descInput, '');
  setFieldError(amountInput, '');
  setFormType('expense');
  formTitle.textContent = 'Add transaction';
  formSub.textContent = 'Record money in or out';
  formStamp.textContent = 'New';
  submitBtn.textContent = 'Add expense';
  cancelEdit.hidden = true;
  formMessage.hidden = true;
  descInput.focus();
}

function startEdit(item) {
  editingId = item.id;
  formType = item.type;
  descInput.value = item.desc;
  amountInput.value = String(item.amount);
  dateInput.value = item.date;
  setFormType(item.type);
  categorySelect.value = item.category;
  formTitle.textContent = 'Edit transaction';
  formSub.textContent = 'Update the entry and save';
  formStamp.textContent = 'Editing';
  submitBtn.textContent = 'Save changes';
  cancelEdit.hidden = false;
  setFieldError(descInput, '');
  setFieldError(amountInput, '');
  renderTransactions();
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  descInput.focus();
}

function showFormMessage(message) {
  formMessage.textContent = message;
  formMessage.hidden = false;
  window.clearTimeout(messageTimer);
  messageTimer = window.setTimeout(() => {
    formMessage.hidden = true;
  }, 3500);
}

function showToast(message, actionLabel, action) {
  toastText.textContent = message;
  toastAction.hidden = !actionLabel;
  toastAction.textContent = actionLabel || '';
  toastAction.onclick = action || null;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 6000);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[character];
  });
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportCsv() {
  const header = ['Date', 'Description', 'Type', 'Category', 'Amount'];
  const rows = transactions.slice().sort((a, b) => (a.date < b.date ? -1 : 1)).map((item) => [item.date, item.desc, item.type, item.category, item.amount.toFixed(2)]);
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  download(`ledger-${selectedMonth}.csv`, csv, 'text/csv;charset=utf-8');
  showToast('CSV exported.');
}

function exportJson() {
  const payload = { version: 1, currency, exportedAt: new Date().toISOString(), transactions };
  download(`ledger-backup-${todayIso()}.json`, JSON.stringify(payload, null, 2), 'application/json');
  showToast('Backup downloaded.');
}

function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const list = Array.isArray(data) ? data : data.transactions;
      if (!Array.isArray(list)) throw new Error('No transactions array');
      const cleaned = list.filter(validTransaction).map((item) => ({
        id: item.id || uid(),
        date: item.date,
        desc: String(item.desc).slice(0, 80),
        amount: Number(item.amount),
        type: item.type,
        category: typeof item.category === 'string' && item.category ? item.category : 'Other'
      }));
      if (!cleaned.length) throw new Error('No valid transactions');
      lastSnapshot = transactions.slice();
      transactions = cleaned;
      if (!Array.isArray(data) && ['USD', 'EUR', 'GBP', 'NGN'].includes(data.currency)) {
        currency = data.currency;
        currencySelect.value = currency;
        saveCurrency();
      }
      saveTransactions();
      renderAll();
      showToast(`Imported ${cleaned.length} transactions.`, 'Undo', () => {
        transactions = lastSnapshot;
        saveTransactions();
        renderAll();
        toast.hidden = true;
      });
    } catch (error) {
      showToast('That file is not a valid Ledger backup.');
    }
  };
  reader.readAsText(file);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const desc = descInput.value.trim();
  const amount = Number(amountInput.value);
  const date = dateInput.value;
  let valid = true;

  if (desc.length < 2) {
    setFieldError(descInput, 'Add a short description.');
    valid = false;
  } else {
    setFieldError(descInput, '');
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    setFieldError(amountInput, 'Enter an amount above zero.');
    valid = false;
  } else {
    setFieldError(amountInput, '');
  }

  if (!date) {
    showFormMessage('Choose a date.');
    valid = false;
  }

  if (!valid) return;

  if (editingId) {
    const index = transactions.findIndex((item) => item.id === editingId);
    if (index >= 0) {
      transactions[index] = { id: editingId, date, desc, amount, type: formType, category: categorySelect.value };
    }
    selectedMonth = date.slice(0, 7);
    monthInput.value = selectedMonth;
    activeType = 'all';
    query = '';
    searchInput.value = '';
    typeFilters.querySelectorAll('.chip').forEach((chip) => chip.classList.toggle('is-active', chip.dataset.type === 'all'));
    saveTransactions();
    resetForm();
    renderAll();
    showFormMessage('Changes saved.');
    return;
  }

  const savedType = formType;
  transactions.unshift({ id: uid(), date, desc, amount, type: formType, category: categorySelect.value });
  selectedMonth = date.slice(0, 7);
  monthInput.value = selectedMonth;
  activeType = 'all';
  query = '';
  searchInput.value = '';
  typeFilters.querySelectorAll('.chip').forEach((chip) => chip.classList.toggle('is-active', chip.dataset.type === 'all'));
  saveTransactions();
  resetForm();
  renderAll();
  showFormMessage(savedType === 'income' ? 'Income added.' : 'Expense added.');
});

typeToggle.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  setFormType(button.dataset.type);
});

typeFilters.addEventListener('click', (event) => {
  const chip = event.target.closest('.chip');
  if (!chip) return;
  activeType = chip.dataset.type;
  typeFilters.querySelectorAll('.chip').forEach((item) => item.classList.toggle('is-active', item === chip));
  renderTransactions();
});

searchInput.addEventListener('input', () => {
  query = searchInput.value.trim().toLowerCase();
  renderTransactions();
});

monthInput.addEventListener('change', () => {
  if (monthInput.value) {
    selectedMonth = monthInput.value;
    renderAll();
  }
});

currencySelect.addEventListener('change', () => {
  currency = currencySelect.value;
  saveCurrency();
  renderAll();
});

txnList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const row = button.closest('.txn');
  const item = transactions.find((entry) => entry.id === row.dataset.id);
  if (!item) return;
  if (button.dataset.action === 'edit') {
    startEdit(item);
    return;
  }
  const index = transactions.indexOf(item);
  lastDeleted = { item, index };
  transactions.splice(index, 1);
  if (editingId === item.id) resetForm();
  saveTransactions();
  renderAll();
  showToast(`Deleted “${item.desc}”.`, 'Undo', () => {
    transactions.splice(lastDeleted.index, 0, lastDeleted.item);
    saveTransactions();
    renderAll();
    toast.hidden = true;
  });
});

cancelEdit.addEventListener('click', resetForm);

resetSample.addEventListener('click', () => {
  lastSnapshot = transactions.slice();
  transactions = seedTransactions();
  selectedMonth = currentMonth();
  monthInput.value = selectedMonth;
  activeType = 'all';
  query = '';
  searchInput.value = '';
  typeFilters.querySelectorAll('.chip').forEach((chip) => chip.classList.toggle('is-active', chip.dataset.type === 'all'));
  saveTransactions();
  resetForm();
  renderAll();
  showToast('Sample data restored.', 'Undo', () => {
    transactions = lastSnapshot;
    saveTransactions();
    renderAll();
    toast.hidden = true;
  });
});

document.getElementById('exportCsv').addEventListener('click', exportCsv);
document.getElementById('exportJson').addEventListener('click', exportJson);
importFile.addEventListener('change', () => {
  if (importFile.files && importFile.files[0]) {
    importJson(importFile.files[0]);
    importFile.value = '';
  }
});

descInput.addEventListener('input', () => {
  if (descInput.closest('.field').classList.contains('has-error')) setFieldError(descInput, '');
});

amountInput.addEventListener('input', () => {
  if (amountInput.closest('.field').classList.contains('has-error')) setFieldError(amountInput, '');
});

monthInput.value = selectedMonth;
currencySelect.value = currency;
dateInput.value = todayIso();
populateCategories('expense');
setFormType('expense');
saveTransactions();
renderAll();
