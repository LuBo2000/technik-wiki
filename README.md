# Veranstaltungstechnik Wiki

Ein umfassendes, durchsuchbares Wiki für Begriffe und Konzepte der Veranstaltungstechnik - kategorisiert nach Ton, Licht, Video, Bühne, Strom und Netzwerk.

🌐 **Live auf GitHub Pages:** https://lubo2000.github.io/technik-wiki/

## Features

- 🔍 **Echtzeit-Suche** - Begriffe und Beschreibungen durchsuchen
- 📂 **Kategorie-Filter** - Nach verschiedenen Fachgebieten filtern
- 🎨 **Dunkles Design** - Augenschonend mit Tailwind CSS
- 📱 **Responsive** - Funktioniert auf allen Geräten
- ⚡ **Modulare Datenstruktur** - Separate JSON-Dateien pro Kategorie

## Kategorien

- **Allgemein** - Grundkonzepte der Veranstaltungstechnik
- **Bühne** - Bühnentechnik und Rigging
- **Strom** - Stromversorgung und Stecker
- **Ton** - Audioproduktion, Mikrofone, Mischpulte
- **Licht** - Lichttechnik, Moving Heads, grandMA3
- **Video** - Beamer, LED-Wände, Streaming
- **Netzwerk** - Netzwerk-Grundlagen und Protokolle

## Verwendung auf GitHub Pages

Das Wiki ist vollständig optimiert für GitHub Pages Hosting. Öffne einfach die URL:
```
https://LuBo2000.github.io/technik-wiki/
```

Fertig! Kein kompliziertes Setup nötig - es funktioniert direkt.

## Lokale Entwicklung

Um lokal zu entwickeln, öffne einfach `wiki.html` im Browser oder nutze einen lokalen Server:

```bash
# Mit Python 3
python -m http.server 8000

# Mit Node.js (wenn http-server installiert)
npx http-server
```

Dann öffne `http://localhost:8000/wiki.html`

## Dateistruktur

```
technik-wiki/
├── wiki.html              # Hauptdatei
├── style.css              # Styling
├── script.js              # JavaScript & Datenladefunktion
├── data/                  # Datenkategorien
│   ├── allgemein.json
│   ├── buehne.json
│   ├── strom.json
│   ├── ton.json
│   ├── licht.json
│   ├── video.json
│   └── netzwerk.json
└── README.md
```

## Neue Begriffe hinzufügen

1. Bearbeite die entsprechende JSON-Datei im `data/`-Ordner
2. Füge einen neuen Begriff hinzu:
```json
{ "t": "Begriffname", "c": "Kategorie", "d": "Beschreibung..." }
```
3. Commit & Push
4. GitHub Pages aktualisiert automatisch ✨

## Beispiel-Eintrag

```json
{
  "t": "XLR-Stecker",
  "c": "Ton",
  "d": "3-poliger symmetrischer Audiokonnektor, Standard in der Professionaltechnik."
}
```

**Felder:**
- `t` = **Title** (Begriffname)
- `c` = **Category** (Kategorie)
- `d` = **Description** (Beschreibung)

## Technologie

- **HTML5** - Struktur
- **Tailwind CSS** - Responsive Styling via CDN
- **Vanilla JavaScript** - Dynamische Funktionen, keine Dependencies
- **JSON** - Modulare Datenspeicherung

## Fehlerbehandlung

Das Wiki hat eingebaute Fehlerbehandlung für:
- ❌ Fehlende JSON-Dateien
- ❌ Netzwerkfehler
- ❌ CORS-Probleme

Bei Problemen wird eine aussagekräftige Fehlermeldung angezeigt.

---

**Gaffa hält die Welt zusammen, dieses Wiki den Rest.** ⚡🎬🎵