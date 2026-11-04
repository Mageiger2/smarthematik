#!/usr/bin/env python3
"""Setzt das Inline-Skript (<script type="text/babel">) jeder App-Seite aus den Dateien in assets/js/ neu zusammen.
Aufruf: python3 tools/sync_pages.py [seite ...]   (ohne Argument: alle Seiten)"""
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SIMPLE = ['binformeln', 'bruchgleichungen', 'halbwertszeit', 'kugel', 'potenzen', 'trigonometrie', 'wachstum', 'wahrscheinlichkeit']
PAGES = {s: ['shared', 'lernen-kern', 'lernen-trainer', s] for s in SIMPLE}
PAGES.update({
    'kopfrechnen': ['shared', 'kopfrechnen-gen', 'kopfrechnen'],
    'pruefung': ['shared', 'lernen-kern', 'kopfrechnen-gen', 'pruefung-katalog', 'pruefung'],
    'lehrer': ['shared', 'fehlerheft-map', 'lehrer'],
    'rechner': ['shared', 'rechner'],
    'lineare-funktionen': ['shared', 'funktionen-kern', 'lernen-kern', 'lernen-lineare', 'lineare-funktionen'],
    'quadratische-funktionen': ['shared', 'funktionen-kern', 'lernen-kern', 'lernen-quadratische', 'quadratische-funktionen'],
    'strahlensaetze': ['shared', 'funktionen-kern', 'lernen-kern', 'lernen-strahlen', 'strahlensaetze'],
})
RX = re.compile(r'(<script type="text/babel"[^>]*>\n)(.*?)(\n\s*</script>)', re.S)

def sync(name):
    page = ROOT / f'{name}.html'
    if not page.exists():
        print(f'{name}: Seite fehlt'); return
    parts = [(ROOT / 'assets' / 'js' / f'{p}.js') for p in PAGES[name]]
    if not all(p.exists() for p in parts):
        print(f'{name}: Teil fehlt ({[p.name for p in parts if not p.exists()]})'); return
    code = ''.join(p.read_text(encoding='utf-8') for p in parts).rstrip('\n')
    html = page.read_text(encoding='utf-8')
    m = RX.search(html)
    if not m:
        print(f'{name}: kein Babel-Skript gefunden'); return
    new = html[:m.start()] + m.group(1) + code + m.group(3) + html[m.end():]
    if new != html:
        page.write_text(new, encoding='utf-8'); print(f'{name}: aktualisiert')
    else:
        print(f'{name}: unverändert')

if __name__ == '__main__':
    for n in (sys.argv[1:] or PAGES):
        sync(n)
