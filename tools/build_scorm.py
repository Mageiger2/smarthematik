#!/usr/bin/env python3
"""Baut sMArTHEMATIK als Lernpaket (SCORM 1.2, ohne Speicherung) für die ByCS-Lernplattform.

Aufruf (im Repo-Hauptordner):  python3 tools/build_scorm.py
Ergebnis:                      build/smarthematik-lernpaket.zip  (+ entpackt in build/pkg/)
Benötigt:                      Python 3 und Node.js (für die JSX-Übersetzung mit dem mitgelieferten Babel)

Die Live-Seite wird nicht verändert. Für das Paket werden die Seiten angepasst:
  - JSX wird vorab übersetzt (assets/app/<seite>.js), Babel entfällt
  - Besucherzähler (hits.sh), Impressum/Datenschutz-Links und Online-Metadaten entfernt
  - Versions-Parameter (?v=…) an Skripten/Styles entfernt
  - imsmanifest.xml nach Vorlage (genau ein SCO, Startseite index.html)
"""
import pathlib
import re
import shutil
import subprocess
import sys
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
BUILD = ROOT / 'build'
PKG = BUILD / 'pkg'
ZIP = BUILD / 'smarthematik-lernpaket.zip'

PAGES = ['index', 'rechner', 'kopfrechnen', 'binformeln', 'bruchgleichungen', 'halbwertszeit', 'kugel',
         'lineare-funktionen', 'potenzen', 'quadratische-funktionen', 'trigonometrie', 'wachstum',
         'wahrscheinlichkeit']
ASSETS = ['assets/vendor/react.production.min.js', 'assets/vendor/react-dom.production.min.js',
          'assets/vendor/tailwindcss.js', 'assets/css/main.css',
          'Logo-sMArTH.png', 'LogoMSsued2.jpg', 'cropped-BdB_Logo-1.png']

BABEL_RE = re.compile(r'<script type="text/babel"[^>]*>\n?(.*?)\n?\s*</script>', re.S)


def fail(msg):
    sys.exit(f'FEHLER: {msg}')


def compile_jsx(code):
    res = subprocess.run(['node', str(ROOT / 'tools' / 'jsx_compile.js')], input=code,
                         capture_output=True, text=True)
    if res.returncode != 0:
        fail('JSX-Übersetzung fehlgeschlagen:\n' + res.stderr[-2000:])
    return res.stdout


def transform(name, html):
    # 1. Babel-Skript → vorübersetzte Datei
    m = BABEL_RE.search(html)
    if m:
        js = compile_jsx(m.group(1))
        (PKG / 'assets' / 'app').mkdir(parents=True, exist_ok=True)
        (PKG / 'assets' / 'app' / f'{name}.js').write_text(js, encoding='utf-8')
        html = html[:m.start()] + f'<script src="assets/app/{name}.js"></script>' + html[m.end():]
    html = re.sub(r'\s*<script src="assets/vendor/babel\.min\.js[^"]*"></script>', '', html)
    # 2. Online-Metadaten
    html = re.sub(r'\s*<link rel="canonical"[^>]*>', '', html)
    html = re.sub(r'\s*<meta property="og:[^"]*"[^>]*>', '', html)
    # 3. Besucherzähler (externes Bild)
    html = re.sub(r'\s*<div class="mt-4 flex items-center gap-2 opacity-50[^"]*">\s*<img src="https://hits\.sh/[^>]*>\s*</div>', '', html)
    # 4. Impressum/Datenschutz: Menü-Einträge (mit Trennlinie) und Fußzeilen-Links
    html = re.sub(r'<div class="border-t border-slate-200 my-2"></div><a href="impressum\.html"[^>]*>Impressum</a><a href="datenschutz\.html"[^>]*>Datenschutz</a>', '', html)
    html = re.sub(r'\s*<div class="flex items-center gap-4">\s*<a href="impressum\.html"[^>]*>Impressum</a>\s*<span[^>]*>\|</span>\s*<a href="datenschutz\.html"[^>]*>Datenschutz</a>\s*</div>', '', html)
    # 5. Versions-Parameter
    html = re.sub(r'((?:src|href)="[^"?#]+)\?v=[^"]*"', r'\1"', html)
    # 6. Kontrollen
    if 'hits.sh' in html or 'impressum.html' in html or 'datenschutz.html' in html or 'text/babel' in html:
        fail(f'{name}.html: Entfernen unvollständig')
    for m2 in re.finditer(r'\s(?:src)="(https?:)?//', html):
        fail(f'{name}.html: externe Ressource gefunden: {m2.group(0)}')
    return html


def check_links(name, html):
    for ref in re.findall(r'(?:src|href)="([^"]+)"', html):
        if ref.startswith(('http://', 'https://', 'mailto:', '#')):
            continue
        target = ref.split('#')[0]
        if target and not (PKG / target).exists():
            fail(f'{name}.html verweist auf fehlende Datei: {ref}')


def manifest(files):
    items = '\n'.join(f'      <file href="{f}"/>' for f in files)
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="smarthematik-lernpaket" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="org1">
    <organization identifier="org1">
      <title>sMArTHEMATIK – Mathe-Training für den MSA</title>
      <item identifier="item1" identifierref="res1" isvisible="true">
        <title>sMArTHEMATIK – Mathe-Training für den MSA</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res1" type="webcontent" adlcp:scormtype="sco" href="index.html">
{items}
    </resource>
  </resources>
</manifest>
'''


def main():
    if shutil.which('node') is None:
        fail('Node.js wird für die JSX-Übersetzung benötigt.')
    if BUILD.exists():
        shutil.rmtree(BUILD)
    PKG.mkdir(parents=True)
    for a in ASSETS:
        dst = PKG / a
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / a, dst)
    pages = {}
    for name in PAGES:
        html = (ROOT / f'{name}.html').read_text(encoding='utf-8')
        pages[name] = transform(name, html)
        (PKG / f'{name}.html').write_text(pages[name], encoding='utf-8')
        print(f'  {name}.html')
    for name, html in pages.items():
        check_links(name, html)
    files = sorted(p.relative_to(PKG).as_posix() for p in PKG.rglob('*') if p.is_file())
    for f in files:
        if not re.fullmatch(r'[a-z0-9_./-]+', f, re.I):
            fail(f'ungültiger Dateiname: {f}')
    (PKG / 'imsmanifest.xml').write_text(manifest(files), encoding='utf-8')
    with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for p in sorted(PKG.rglob('*')):
            if p.is_file():
                z.write(p, p.relative_to(PKG).as_posix())
    print(f'Fertig: {ZIP.relative_to(ROOT)} ({ZIP.stat().st_size / 1024:.0f} KB, {len(files) + 1} Dateien)')


if __name__ == '__main__':
    main()
