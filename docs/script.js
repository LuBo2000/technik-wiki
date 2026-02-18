// Daten laden aus multiple Dateien
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

Promise.all(
    dataFiles.map(file => 
        fetch(basePath + file)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load ${file}`);
                return response.json();
            })
            .then(data => data.terms)
    )
)
.then(results => {
    wikiData = results.flat();
    renderWiki(wikiData.sort((a, b) => a.t.localeCompare(b.t)));
})
.catch(error => {
    console.error('Error loading data:', error);
    document.getElementById('wikiGrid').innerHTML = '<p style="color: red;">Fehler beim Laden der Daten. Bitte aktualisieren Sie die Seite.</p>';
});

// Funktion zum Abrufen aller Subkategorien einer Kategorie
function getSubcategoriesForCategory(cat) {
    const items = wikiData.filter(i => i.c === cat && i.s);
    const subcats = new Set(items.map(i => i.s));
    return Array.from(subcats).sort();
}

// Subkategorien-Buttons aktualisieren
function updateSubcategoryButtons(cat) {
    const subcategoryContainer = document.getElementById('subcategoryContainer');
    
    if (!cat || cat === 'All') {
        subcategoryContainer.innerHTML = '';
        return;
    }
    
    const subcats = getSubcategoriesForCategory(cat);
    
    if (subcats.length === 0) {
        subcategoryContainer.innerHTML = '';
        return;
    }
    
    let html = '<div class="text-xs text-slate-400 font-bold mb-2">📂 UNTERKATEGORIEN:</div>';
    html += '<div class="flex flex-wrap gap-2">';
    html += '<span class="tag-pill bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs font-bold cursor-pointer" onclick="filterSubcategory(null, \'' + cat + '\')">Alle</span>';
    
    subcats.forEach(s => {
        html += `<span class="tag-pill bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs font-bold cursor-pointer" onclick="filterSubcategory('${s}', '${cat}')">${s}</span>`;
    });
    
    html += '</div>';
    subcategoryContainer.innerHTML = html;
}

// Funktion zum Rendern
function renderWiki(data) {
    const grid = document.getElementById('wikiGrid');
    grid.innerHTML = '';
    
    if (data.length === 0) {
        grid.innerHTML = '<p class="text-slate-400 col-span-full text-center py-8">Keine Einträge gefunden. Versuchen Sie einen anderen Begriff oder Filter.</p>';
        return;
    }
    
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'term-card bg-slate-800 p-4 rounded-lg shadow border-l-4';
        
        // Farbe basierend auf Kategorie
        const categoryColors = {
            'Ton': '#ef4444',
            'Licht': '#eab308',
            'Video': '#a855f7',
            'Bühne': '#ea580c',
            'Strom': '#06b6d4',
            'Allgemein': '#10b981',
            'Netzwerk': '#6366f1'
        };
        
        card.style.borderLeftColor = categoryColors[item.c] || '#3b82f6';
        
        // Subkategorie Badge
        let subcatBadge = '';
        if (item.s) {
            subcatBadge = `<span class="tag-badge text-xs bg-slate-600 px-2 py-0.5 rounded text-slate-200 cursor-pointer hover:bg-slate-500" onclick="filterSubcategory('${item.s}', '${item.c}')" title="Nach '${item.s}' filtern">${item.s}</span>`;
        }
        
        card.innerHTML = `
            <div class="mb-2">
                <div class="flex justify-between items-start gap-2">
                    <h3 class="font-bold text-lg text-white flex-grow">${item.t}</h3>
                    <span class="text-xs font-mono bg-slate-700 px-2 py-1 rounded text-slate-300 whitespace-nowrap">${item.c}</span>
                </div>
                ${subcatBadge ? `<div class="mt-2">${subcatBadge}</div>` : ''}
            </div>
            <p class="text-slate-400 text-sm leading-relaxed">${item.d}</p>
        `;
        grid.appendChild(card);
    });
    
    // Ergebnis-Info aktualisieren
    const searchInfo = document.getElementById('searchInfo');
    searchInfo.textContent = `${data.length} Eintrag${data.length !== 1 ? 'e' : ''} gefunden`;
}

// Suche-Logik (durchsucht Titel, Beschreibung und Subkategorie)
document.getElementById('searchInput').addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase().trim();
    
    if (!val) {
        // Wenn Suchfeld leer ist, Filter zurücksetzen
        selectedCategory = null;
        selectedSubcategory = null;
        renderWiki(wikiData.sort((a, b) => a.t.localeCompare(b.t)));
        document.getElementById('subcategoryContainer').innerHTML = '';
        document.getElementById('searchInfo').textContent = '';
        return;
    }
    
    const filtered = wikiData.filter(i => 
        i.t.toLowerCase().includes(val) || 
        i.d.toLowerCase().includes(val) ||
        (i.s && i.s.toLowerCase().includes(val)) ||
        i.c.toLowerCase().includes(val)
    );
    
    renderWiki(filtered);
    document.getElementById('subcategoryContainer').innerHTML = '';
});

// Filter-Logik für Hauptkategorien
function filterCategory(cat) {
    selectedCategory = cat === 'All' ? null : cat;
    selectedSubcategory = null;
    
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    
    if (!selectedCategory) {
        renderWiki(wikiData.sort((a, b) => a.t.localeCompare(b.t)));
        document.getElementById('subcategoryContainer').innerHTML = '';
        document.getElementById('searchInfo').textContent = '';
    } else {
        const filtered = wikiData.filter(i => i.c === selectedCategory);
        renderWiki(filtered.sort((a, b) => a.t.localeCompare(b.t)));
        updateSubcategoryButtons(selectedCategory);
        document.getElementById('searchInfo').textContent = `Gefiltert nach Kategorie: ${selectedCategory} (${filtered.length})`;
    }
}

// Filter-Logik für Subkategorien
function filterSubcategory(subcat, cat) {
    selectedSubcategory = subcat;
    
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    
    let filtered;
    if (!subcat) {
        filtered = wikiData.filter(i => i.c === cat);
        document.getElementById('searchInfo').textContent = `Gefiltert nach Kategorie: ${cat}`;
    } else {
        filtered = wikiData.filter(i => i.c === cat && i.s === subcat);
        document.getElementById('searchInfo').textContent = `Gefiltert nach: ${cat} → ${subcat} (${filtered.length})`;
    }
    
    renderWiki(filtered.sort((a, b) => a.t.localeCompare(b.t)));
}
