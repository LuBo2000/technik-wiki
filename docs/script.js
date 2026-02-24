// Daten laden aus mehreren Dateien und sichere Rendering-Logik
(() => {
    let wikiData = [];
    let selectedCategory = null;
    let selectedSubcategory = null;

    // Dynamische Basis-URL ermitteln (funktioniert lokal und auf GitHub Pages)
    const getBasePath = () => {
        const path = window.location.pathname;
        if (path.includes('.html')) {
            return path.substring(0, path.lastIndexOf('/')) + '/';
        }
        return path.endsWith('/') ? path : path + '/';
    };

    const basePath = getBasePath();

    const dataFiles = [
        'data/allgemein.json',
        'data/buehne.json',
        'data/strom.json',
        'data/ton.json',
        'data/licht.json',
        'data/video.json',
        'data/netzwerk.json'
    ];

    // Safe text normalizer
    const normalizeText = (text) => {
        if (!text) return '';
        return String(text).toLowerCase().replace(/[\s\-]/g, '');
    };

    // Fetch all data files (graceful per-file handling)
    const loadData = async () => {
        const promises = dataFiles.map(async (file) => {
            try {
                const resp = await fetch(basePath + file);
                if (!resp.ok) throw new Error(`Failed to load ${file}: ${resp.status}`);
                const json = await resp.json();
                return Array.isArray(json.terms) ? json.terms : [];
            } catch (err) {
                console.warn('Data file load failed:', file, err);
                return [];
            }
        });

        const results = await Promise.all(promises);
        wikiData = results.flat();
        wikiData.sort((a, b) => String(a.t).localeCompare(String(b.t)));
        renderWiki(wikiData);
    };

    // Get subcategories for a category
    const getSubcategoriesForCategory = (cat) => {
        const items = wikiData.filter(i => i.c === cat && i.s);
        const set = new Set(items.map(i => i.s));
        return Array.from(set).sort();
    };

    // Update subcategory buttons (creates DOM nodes)
    const updateSubcategoryButtons = (cat) => {
        const container = document.getElementById('subcategoryContainer');
        container.innerHTML = '';

        if (!cat || cat === 'All') return;

        const subcats = getSubcategoriesForCategory(cat);
        if (subcats.length === 0) return;

        const label = document.createElement('div');
        label.className = 'text-xs text-slate-400 font-bold mb-2';
        label.textContent = '📂 UNTERKATEGORIEN:';
        container.appendChild(label);

        const wrap = document.createElement('div');
        wrap.className = 'flex flex-wrap gap-2';

        const allBtn = document.createElement('button');
        allBtn.type = 'button';
        allBtn.className = 'tag-pill bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs font-bold';
        allBtn.textContent = 'Alle';
        allBtn.addEventListener('click', () => filterSubcategory(null, cat));
        wrap.appendChild(allBtn);

        subcats.forEach(s => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'tag-pill bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs font-bold';
            b.textContent = s;
            b.addEventListener('click', () => filterSubcategory(s, cat));
            wrap.appendChild(b);
        });

        container.appendChild(wrap);
    };

    // Render items safely using DOM APIs
    const renderWiki = (data) => {
        const grid = document.getElementById('wikiGrid');
        grid.innerHTML = '';

        if (!data || data.length === 0) {
            const p = document.createElement('p');
            p.className = 'text-slate-400 col-span-full text-center py-8';
            p.textContent = 'Keine Einträge gefunden. Versuchen Sie einen anderen Begriff oder Filter.';
            grid.appendChild(p);
            updateSearchInfo(0);
            return;
        }

        const categoryColors = {
            'Ton': 'var(--color-ton)',
            'Licht': 'var(--color-licht)',
            'Video': 'var(--color-video)',
            'Bühne': 'var(--color-buehne)',
            'Strom': 'var(--color-strom)',
            'Allgemein': 'var(--color-allgemein)',
            'Netzwerk': 'var(--color-netzwerk)'
        };

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'term-card bg-slate-800 p-4 rounded-lg shadow border-l-4';
            card.style.borderLeftColor = categoryColors[item.c] || 'var(--accent)';

            const top = document.createElement('div');
            top.className = 'mb-2';

            const header = document.createElement('div');
            header.className = 'flex justify-between items-start gap-2';

            const h3 = document.createElement('h3');
            h3.className = 'font-bold text-lg text-white flex-grow';
            h3.textContent = item.t || '';

            const catSpan = document.createElement('span');
            catSpan.className = 'text-xs font-mono bg-slate-700 px-2 py-1 rounded text-slate-300 whitespace-nowrap';
            catSpan.textContent = item.c || '';

            header.appendChild(h3);
            header.appendChild(catSpan);
            top.appendChild(header);

            if (item.s) {
                const subWrap = document.createElement('div');
                subWrap.className = 'mt-2';

                const subBtn = document.createElement('button');
                subBtn.type = 'button';
                subBtn.className = 'tag-badge text-xs bg-slate-600 px-2 py-0.5 rounded text-slate-200 cursor-pointer hover:bg-slate-500';
                subBtn.title = `Nach '${item.s}' filtern`;
                subBtn.textContent = item.s;
                subBtn.addEventListener('click', () => filterSubcategory(item.s, item.c));

                subWrap.appendChild(subBtn);
                top.appendChild(subWrap);
            }

            const desc = document.createElement('p');
            desc.className = 'text-slate-400 text-sm leading-relaxed';
            desc.textContent = item.d || '';

            card.appendChild(top);
            card.appendChild(desc);

            grid.appendChild(card);
        });

        updateSearchInfo(data.length);
    };

    const updateSearchInfo = (count) => {
        const searchInfo = document.getElementById('searchInfo');
        searchInfo.textContent = `${count} Eintrag${count !== 1 ? 'e' : ''} gefunden`;
    };

    // Search logic
    const onSearchInput = (e) => {
        const raw = e.target.value || '';
        const trimmed = raw.trim();
        const searchVal = normalizeText(raw);

        if (!trimmed) {
            if (selectedCategory) {
                const filtered = wikiData.filter(i => i.c === selectedCategory);
                renderWiki(filtered);
                updateSubcategoryButtons(selectedCategory);
                document.getElementById('searchInfo').textContent = `Gefiltert nach Kategorie: ${selectedCategory}`;
            } else {
                selectedCategory = null;
                selectedSubcategory = null;
                renderWiki(wikiData);
                document.getElementById('subcategoryContainer').innerHTML = '';
                document.getElementById('searchInfo').textContent = '';
            }
            return;
        }

        let filtered = wikiData.filter(i =>
            normalizeText(i.t).includes(searchVal) ||
            normalizeText(i.d).includes(searchVal) ||
            normalizeText(i.s).includes(searchVal) ||
            normalizeText(i.c).includes(searchVal)
        );

        if (selectedCategory) filtered = filtered.filter(i => i.c === selectedCategory);
        if (selectedSubcategory) filtered = filtered.filter(i => i.s === selectedSubcategory);

        renderWiki(filtered);

        if (selectedCategory) updateSubcategoryButtons(selectedCategory);
        else document.getElementById('subcategoryContainer').innerHTML = '';

        const parts = [];
        parts.push(`Suche: "${raw}"`);
        if (selectedCategory) parts.push(`in ${selectedCategory}`);
        if (selectedSubcategory) parts.push(`→ ${selectedSubcategory}`);
        parts.push(`(${filtered.length})`);
        document.getElementById('searchInfo').textContent = parts.join(' ');
    };

    // Exposed filter functions used by event listeners
    window.filterCategory = (cat) => {
        selectedCategory = cat === 'All' ? null : cat;
        selectedSubcategory = null;

        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';

        if (!selectedCategory) {
            renderWiki(wikiData);
            document.getElementById('subcategoryContainer').innerHTML = '';
            document.getElementById('searchInfo').textContent = '';
        } else {
            const filtered = wikiData.filter(i => i.c === selectedCategory);
            renderWiki(filtered);
            updateSubcategoryButtons(selectedCategory);
            document.getElementById('searchInfo').textContent = `Gefiltert nach Kategorie: ${selectedCategory} (${filtered.length})`;
        }
    };

    window.filterSubcategory = (subcat, cat) => {
        selectedSubcategory = subcat;

        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';

        let filtered;
        if (!subcat) {
            filtered = wikiData.filter(i => i.c === cat);
            document.getElementById('searchInfo').textContent = `Gefiltert nach Kategorie: ${cat}`;
        } else {
            filtered = wikiData.filter(i => i.c === cat && i.s === subcat);
            document.getElementById('searchInfo').textContent = `Gefiltert nach: ${cat} → ${subcat} (${filtered.length})`;
        }

        renderWiki(filtered);
    };

    // Initialize UI listeners after DOM is ready
    const initUI = () => {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.addEventListener('input', onSearchInput);

        // Attach category button listeners
        const catButtons = document.querySelectorAll('#filterContainer [data-category]');
        catButtons.forEach(btn => {
            const cat = btn.getAttribute('data-category');
            btn.addEventListener('click', () => window.filterCategory(cat));
        });

        // Feedback-Button öffnen (öffnet Google-Formular in neuem Tab)
        const feedbackBtn = document.getElementById('feedbackBtn');
        if (feedbackBtn) {
            feedbackBtn.addEventListener('click', () => {
                const formUrl = 'https://forms.gle/kAD8mf2vtPiYfGfB8'; // TODO: Ersetze durch deinen Google-Formular-Link
                try {
                    window.open(formUrl, '_blank', 'noopener');
                } catch (err) {
                    // Fallback: Navigation im selben Tab
                    window.location.href = formUrl;
                }
            });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { initUI(); loadData(); });
    } else {
        initUI(); loadData();
    }

})();
