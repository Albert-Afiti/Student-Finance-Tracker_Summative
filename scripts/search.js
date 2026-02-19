// search.js — Regex search, highlight, filter, and vanilla HTML scraper for FinTrace
// No frameworks. Uses native DOMParser for the scraper section.

(function(App) {
    const compileRegex = (input, flags = '') => {
        try {
            return input ? new RegExp(input, flags) : null;
        } catch {
            return null;
        }
    };

    const highlight = (text, regex) => {
        if (!regex || typeof text !== 'string') return text;
        try {
            return text.replace(regex, match => `<mark>${match}</mark>`);
        } catch {
            return text;
        }
    };

    const filterRecords = (records, regex) => {
        if (!regex) return records;
        return records.filter(r => regex.test(r.description) || regex.test(r.category));
    };

    App.Search = { compileRegex, highlight, filterRecords };
})(window.App);


// ── Vanilla HTML Scraper (uses native DOMParser — no jQuery) ─────────────────

document.addEventListener('DOMContentLoaded', () => {
    const scrapeBtn = document.getElementById('scrapeBtn');
    const htmlInput = document.getElementById('htmlInput');
    const outputEl  = document.getElementById('output');

    if (!scrapeBtn || !htmlInput || !outputEl) return;

    // Clear output when textarea is emptied
    htmlInput.addEventListener('input', () => {
        if (!htmlInput.value.trim()) {
            outputEl.textContent = '// Output will appear here';
            outputEl.style.color = '';
        }
    });

    scrapeBtn.addEventListener('click', () => {
        const input = htmlInput.value.trim();

        if (!input) {
            outputEl.textContent = '// No input — paste an HTML snippet above.';
            outputEl.style.color = 'var(--red)';
            return;
        }

        // Parse HTML using the native DOMParser API (no framework required)
        const parser = new DOMParser();
        const doc = parser.parseFromString(input, 'text/html');

        const result = {
            headings:   [],
            links:      [],
            images:     [],
            tables:     [],
            formFields: []
        };

        // Headings
        doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
            const text = el.textContent.trim();
            if (text) result.headings.push(text);
        });

        // Links
        doc.querySelectorAll('a[href]').forEach(el => {
            result.links.push({
                text: el.textContent.trim(),
                href: el.getAttribute('href')
            });
        });

        // Images
        doc.querySelectorAll('img[src]').forEach(el => {
            result.images.push({
                src: el.getAttribute('src'),
                alt: el.getAttribute('alt') || ''
            });
        });

        // Tables
        doc.querySelectorAll('table').forEach(table => {
            const rows = [];
            table.querySelectorAll('tr').forEach(tr => {
                const cells = [];
                tr.querySelectorAll('th, td').forEach(cell => {
                    cells.push(cell.textContent.trim());
                });
                if (cells.length) rows.push(cells);
            });
            if (rows.length) result.tables.push(rows);
        });

        // Form fields
        doc.querySelectorAll('input, select, textarea').forEach(el => {
            result.formFields.push({
                tag:   el.tagName.toLowerCase(),
                name:  el.getAttribute('name') || '',
                type:  el.getAttribute('type') || '',
                value: el.value || ''
            });
        });

        outputEl.textContent = JSON.stringify(result, null, 2);
        outputEl.style.color = '';
    });
});