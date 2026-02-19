// ui.js — DOM manipulation and event handling for Student Finance Tracker

(function(App) {
    const { settings, sortState, addRecord, editRecord, deleteRecord, updateSetting, getCurrencyDisplay } = App.State;
    const { validateField, getErrorMessage, rules, validateRecordStructure } = App.Validators;
    const { compileRegex, highlight, filterRecords } = App.Search;

    let currentRegex = null;

    function getRecords() {
        return App.State.records;
    }

    // ── Section Navigation ──────────────────────────────
    function showSection(id) {
        document.querySelectorAll('main section').forEach(section => {
            section.classList.add('hidden');
        });

        const target = document.getElementById(id);
        if (target) {
            target.classList.remove('hidden');
            target.setAttribute('tabindex', '-1');
            target.focus();
            target.removeAttribute('tabindex');
        }

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-target') === id);
        });
    }

    // ── Render Records ──────────────────────────────────
    function renderRecords() {
        const records = getRecords();

        const sorted = [...records].sort((a, b) => {
            const { key, dir } = sortState;
            let cmp = 0;
            if (key === 'description') cmp = a.description.localeCompare(b.description);
            else if (key === 'amount')  cmp = a.amount - b.amount;
            else if (key === 'date')    cmp = new Date(a.date) - new Date(b.date);
            return dir === 'asc' ? cmp : -cmp;
        });

        const visible = filterRecords(sorted, currentRegex);
        const container = document.getElementById('recordsContainer');
        container.innerHTML = '';

        if (visible.length === 0) {
            container.innerHTML = '<p style="color:#888; padding:1rem 0;">No records found.</p>';
            return;
        }

        visible.forEach(record => {
            const card = document.createElement('div');
            card.className = 'record-card';
            card.innerHTML = `
                <p class="record-category">${record.category}</p>
                <p class="record-description">${highlight(record.description, currentRegex)}</p>
                <p class="record-amount">${getCurrencyDisplay(record.amount)}</p>
                <p class="record-date">Date: ${record.date}</p>
                <p class="record-updated">Updated: ${new Date(record.updatedAt).toLocaleDateString()}</p>
                <div class="record-actions">
                    <button class="edit-btn" data-id="${record.id}" aria-label="Edit: ${record.description}">Edit</button>
                    <button class="delete-btn" data-id="${record.id}" aria-label="Delete: ${record.description}">Delete</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // ── Render Dashboard ────────────────────────────────
    function renderDashboard() {
        const records = getRecords();
        const total = records.reduce((s, r) => s + r.amount, 0);

        const catCount = {};
        records.forEach(r => { catCount[r.category] = (catCount[r.category] || 0) + 1; });
        const topCategory = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

        document.getElementById('totalRecords').textContent = records.length;
        document.getElementById('totalAmount').textContent = getCurrencyDisplay(total);
        document.getElementById('topCategory').textContent = topCategory;

        // Budget status
        const cap = settings.budget;
        const remaining = cap - total;
        const msg = document.getElementById('capMessage');

        msg.style.cssText = '';
        if (remaining < 0) {
            msg.setAttribute('aria-live', 'assertive');
            msg.textContent = `Over budget! You are ${getCurrencyDisplay(Math.abs(remaining))} over your cap of ${getCurrencyDisplay(cap, 'USD')}.`;
            msg.style.color = '#c0152a';
            msg.style.borderColor = '#e5c8ce';
            msg.style.backgroundColor = '#fdf0f2';
        } else if (remaining < cap * 0.2) {
            msg.setAttribute('aria-live', 'polite');
            msg.textContent = `Low budget: ${getCurrencyDisplay(remaining)} remaining of ${getCurrencyDisplay(cap, 'USD')}.`;
            msg.style.color = '#6b1a2f';
            msg.style.borderColor = '#f5c518';
            msg.style.backgroundColor = '#fff8e6';
        } else {
            msg.setAttribute('aria-live', 'polite');
            msg.textContent = `On track: ${getCurrencyDisplay(remaining)} remaining of ${getCurrencyDisplay(cap, 'USD')}.`;
            msg.style.color = '#1a4fa0';
            msg.style.borderColor = '#a8c0e0';
            msg.style.backgroundColor = '#eef3fc';
        }

        renderTrendChart(records);
    }

    // ── Render Chart ────────────────────────────────────
    function renderTrendChart(records) {
        const chart = document.getElementById('trendChart');
        chart.innerHTML = '';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyTotals = Array(7).fill(0);
        records.forEach(r => {
            const d = new Date(r.date);
            d.setHours(0, 0, 0, 0);
            const diff = Math.floor((today - d) / 86400000);
            if (diff >= 0 && diff < 7) dailyTotals[6 - diff] += r.amount;
        });

        const maxAmt = Math.max(...dailyTotals, 1);

        dailyTotals.forEach((amount, i) => {
            const bar = document.createElement('div');
            const pct = amount > 0 ? Math.max((amount / maxAmt) * 100, 5) : 0;
            bar.className = 'chart-bar';
            bar.style.height = `${pct}%`;
            bar.title = `Day ${i + 1}: ${amount.toFixed(2)} ${settings.displayCurrency}`;
            bar.setAttribute('aria-label', `Day ${i + 1}: ${amount.toFixed(2)} ${settings.displayCurrency}`);
            chart.appendChild(bar);
        });
    }

    // ── Form Submit ─────────────────────────────────────
    function handleFormSubmit(e) {
        e.preventDefault();

        const data = {
            description: document.getElementById('desc').value,
            amount:      document.getElementById('amount').value,
            category:    document.getElementById('category').value,
            date:        document.getElementById('date').value,
        };

        let valid = true;

        ['description', 'amount', 'date'].forEach(field => {
            const errEl = document.getElementById(`${field}Error`);
            errEl.textContent = '';
            if (!validateField(field, data[field])) {
                errEl.textContent = getErrorMessage(field);
                valid = false;
            }
        });

        // Category validation
        const catErr = document.getElementById('categoryError');
        catErr.textContent = '';
        if (!data.category) {
            catErr.textContent = 'Please select a category.';
            valid = false;
        }

        // Advanced: duplicate-word check
        if (rules.advanced.test(data.description)) {
            document.getElementById('descriptionError').textContent = getErrorMessage('advanced');
            valid = false;
        }

        if (!valid) return;

        const recordId = document.getElementById('recordId').value;
        if (recordId) {
            editRecord(recordId, data);
        } else {
            addRecord(data);
        }

        e.target.reset();
        document.getElementById('recordId').value = '';
        document.getElementById('cancelEditBtn').style.display = 'none';

        renderRecords();
        renderDashboard();
        showSection('records');
    }

    // ── Setup All Listeners ─────────────────────────────
    function setupListeners() {
        // Navigation
        document.querySelectorAll('[data-target]').forEach(btn => {
            btn.addEventListener('click', () => showSection(btn.getAttribute('data-target')));
        });

        showSection('dashboard');

        // Form submit
        document.getElementById('recordForm').addEventListener('submit', handleFormSubmit);

        // Cancel edit
        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            document.getElementById('recordForm').reset();
            document.getElementById('recordId').value = '';
            document.getElementById('cancelEditBtn').style.display = 'none';
            showSection('records');
        });

        // Edit / Delete (event delegation on container)
        document.getElementById('recordsContainer').addEventListener('click', e => {
            const target = e.target;
            const id = target.getAttribute('data-id');

            if (target.classList.contains('edit-btn')) {
                const rec = getRecords().find(r => r.id === id);
                if (!rec) return;
                document.getElementById('recordId').value = rec.id;
                document.getElementById('desc').value = rec.description;
                document.getElementById('amount').value = rec.amount;
                document.getElementById('date').value = rec.date;
                document.getElementById('category').value = rec.category;
                document.getElementById('cancelEditBtn').style.display = 'inline-block';
                showSection('forms');
            }

            if (target.classList.contains('delete-btn')) {
                document.getElementById('confirmDeleteBtn').setAttribute('data-record-id', id);
                document.getElementById('deleteModal').style.display = 'flex';
            }
        });

        // Delete modal
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
            document.getElementById('deleteModal').style.display = 'none';
        });

        document.getElementById('confirmDeleteBtn').addEventListener('click', e => {
            deleteRecord(e.target.getAttribute('data-record-id'));
            renderRecords();
            renderDashboard();
            document.getElementById('deleteModal').style.display = 'none';
        });

        document.getElementById('deleteModal').addEventListener('click', e => {
            if (e.target === document.getElementById('deleteModal')) {
                document.getElementById('deleteModal').style.display = 'none';
            }
        });

        // Sorting
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.id.replace('sort', '').toLowerCase();
                const prevDir = btn.getAttribute('data-dir') || 'asc';
                const newDir = (sortState.key === key && prevDir === 'asc') ? 'desc' : 'asc';

                sortState.key = key;
                sortState.dir = newDir;

                document.querySelectorAll('.sort-btn').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('data-dir', 'asc');
                    b.querySelector('.sort-arrow').textContent = '↑';
                });

                btn.classList.add('active');
                btn.setAttribute('data-dir', newDir);
                btn.querySelector('.sort-arrow').textContent = newDir === 'desc' ? '↓' : '↑';

                renderRecords();
            });
        });

        // Search
        const searchInput = document.getElementById('searchInput');
        const caseToggle  = document.getElementById('caseToggle');
        const statusEl    = document.getElementById('regexStatus');

        function handleSearch() {
            const pattern = searchInput.value.trim();
            const flags   = caseToggle.checked ? 'i' : '';
            statusEl.textContent = '';
            statusEl.style.color = '';

            if (!pattern) {
                currentRegex = null;
                renderRecords();
                return;
            }

            const regex = compileRegex(pattern, flags);
            currentRegex = regex;

            if (!regex) {
                statusEl.textContent = 'Invalid regex pattern.';
                statusEl.style.color = '#c0152a';
            } else {
                const count = getRecords().filter(r =>
                    regex.test(r.description) || regex.test(r.category)
                ).length;
                statusEl.textContent = `✓ ${count} match${count !== 1 ? 'es' : ''} found`;
                statusEl.style.color = '#1a4fa0';
            }

            renderRecords();
        }

        searchInput.addEventListener('input', handleSearch);
        caseToggle.addEventListener('change', handleSearch);

        // Settings
        document.getElementById('currencySelect').value = settings.displayCurrency;
        document.getElementById('budget').value = settings.budget;

        document.getElementById('currencySelect').addEventListener('change', e => {
            updateSetting('currency', e.target.value);
            renderDashboard();
            renderRecords();
        });

        document.getElementById('budget').addEventListener('input', e => {
            updateSetting('cap', parseFloat(e.target.value) || 0);
            renderDashboard();
        });

        // Import
        document.getElementById('importBtn').addEventListener('click', () => {
            const fileInput = document.getElementById('importFile');
            const statusEl  = document.getElementById('importStatus');
            const file      = fileInput.files[0];

            statusEl.textContent = '';
            statusEl.style.color = '';

            if (!file) {
                statusEl.textContent = 'Please select a JSON file first.';
                statusEl.style.color = '#c0152a';
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const imported = JSON.parse(reader.result);
                    if (!Array.isArray(imported)) {
                        statusEl.textContent = 'File must contain a JSON array.';
                        statusEl.style.color = '#c0152a';
                        return;
                    }
                    if (!imported.every(validateRecordStructure)) {
                        statusEl.textContent = 'One or more records have an invalid structure.';
                        statusEl.style.color = '#c0152a';
                        return;
                    }
                    const records = getRecords();
                    imported.forEach(rec => {
                        rec.id        = App.State.generateId();
                        rec.createdAt = new Date().toISOString();
                        rec.updatedAt = new Date().toISOString();
                        records.push(rec);
                    });
                    App.Storage.save(records);
                    renderRecords();
                    renderDashboard();
                    statusEl.textContent = ` Imported ${imported.length} record(s) successfully.`;
                    statusEl.style.color = '#1a4fa0';
                    fileInput.value = '';
                } catch {
                    statusEl.textContent = 'Invalid JSON format.';
                    statusEl.style.color = '#c0152a';
                }
            };
            reader.readAsText(file);
        });

        // Export
        document.getElementById('exportBtn').addEventListener('click', () => {
            const blob = new Blob([JSON.stringify(getRecords(), null, 2)], { type: 'application/json' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `finance_tracker_export_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // ── Dark Mode ───────────────────────────────────────
    function setupDarkMode() {
        const btn  = document.getElementById('darkModeToggle');
        const icon = document.getElementById('themeIcon');
        if (!btn) return;

        const saved = localStorage.getItem('app:theme') || 'light';
        document.body.setAttribute('data-theme', saved);
        icon.textContent = saved === 'dark' ? '☀️' : '🌙';

        btn.addEventListener('click', () => {
            const next = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', next);
            localStorage.setItem('app:theme', next);
            icon.textContent = next === 'dark' ? '☀️' : '🌙';
        });
    }

    // ── Public API ───────────────────────────────────────
    App.UI = { renderDashboard, renderRecords, setupListeners };

    document.addEventListener('DOMContentLoaded', () => {
        setupDarkMode();
        setupListeners();
        renderRecords();
        renderDashboard();
    });

})(window.App);