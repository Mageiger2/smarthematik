#!/usr/bin/env python3
"""Erzeugt assets/js/pruefung-katalog.js: Liste aller Prüfungsaufgaben je Trainer (Schlüssel + Beschriftung).
Wird von pruefung.html (Prüfungssimulation, Teil B) benutzt. Nach Änderungen an den Prüfungsaufgaben neu ausführen:
    python3 tools/exam_catalog.py
"""
import json, re
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
JS = ROOT / 'assets' / 'js'

def rd(name): return (JS / name).read_text(encoding='utf-8')

def pairs(src, key_re, label_re):
    out = []
    for m in re.finditer(key_re, src):
        lab = re.search(label_re, src[m.end():m.end() + 300])
        if lab: out.append({'key': m.group(1), 'label': lab.group(1)})
    return out

def simple(name, key_re, label_re, array_name):
    src = rd(name + '.js')
    start = src.index(array_name)
    depth, i = 0, src.index('[', start)
    for j in range(i, len(src)):
        if src[j] == '[': depth += 1
        elif src[j] == ']':
            depth -= 1
            if depth == 0: break
    return pairs(src[i:j], key_re, label_re)

def funktionen(name, exams_name):
    src = rd(name + '.js')
    start = src.index(f'const {exams_name} = [')
    end = src.index('\n];', start)
    items, ex = [], None
    for line in src[start:end].split('\n'):
        m = re.match(r"\s*\{ id: '([^']+)', label: '([^']+)', nr: '([^']+)'", line)
        if m: ex = m.groups(); continue
        p = re.match(r"\s*\{ l: '([a-z])', (?:tag: '[a-z]+', )?topic: '([a-z]+)'", line)
        if p and ex:
            items.append({'key': f'{ex[0]}-{p.group(1)}', 'label': f'{ex[1]}/{ex[2]}{p.group(1)}', 'topic': p.group(2), 'tag': 'tangens' if "tag: 'tangens'" in line else None})
    return items

cat = {
    'lineare':            {'title': 'Lineare Funktionen',      'href': 'lineare-funktionen.html',    'items': funktionen('lineare-funktionen', 'LF_EXAMS')},
    'quadratische':       {'title': 'Quadratische Funktionen', 'href': 'quadratische-funktionen.html','items': funktionen('quadratische-funktionen', 'QF_EXAMS')},
    'kugel':              {'title': 'Die Kugel',               'href': 'kugel.html',              'items': simple('kugel', r"sigKey:\s*'([^']+)'", r"label:\s*'([^']+)'", 'const kugelExamTasks')},
    'trigonometrie':      {'title': 'Trigonometrie',           'href': 'trigonometrie.html',      'items': simple('trigonometrie', r'id: "([^"]+)"', r'sourceLabel: "([^"]+)"', 'const msaTasks')},
    'wachstum':           {'title': 'Wachstum & Zerfall',      'href': 'wachstum.html',           'items': simple('wachstum', r"sigKey: '([^']+)'", r"label: '([^']+)'", 'const wachstumsExamTasks')},
    'halbwertszeit':      {'title': 'Halbwertszeit',           'href': 'halbwertszeit.html',      'items': simple('halbwertszeit', r"sigKey: '([^']+)'", r"label: '([^']+)'", 'const halbwertszeitsExamTasks')},
    'bruchgleichungen':   {'title': 'Bruchgleichungen',        'href': 'bruchgleichungen.html',   'items': simple('bruchgleichungen', r'sigKey: "([^"]+)"', r'diff: "([^"]+)"', 'const hardcodedProblems')},
    'potenzen':           {'title': 'Potenzen',                'href': 'potenzen.html',           'items': simple('potenzen', r'sigKey: "([^"]+)"', r'sourceLabel: "([^"]+)"', 'const potenzenExamTasks')},
    'binformeln':         {'title': 'Binomische Formeln',      'href': 'binformeln.html',         'items': simple('binformeln', r'sigKey: "([^"]+)"', r'sourceLabel: "([^"]+)"', 'const binoExamTemplates')},
    'wahrscheinlichkeit': {'title': 'Wahrscheinlichkeit',      'href': 'wahrscheinlichkeit.html', 'items': simple('wahrscheinlichkeit', r"sigKey: '([^']+)'", r"label: '([^']+)'", 'const wahrscheinlichkeitsExamTasks')},
}
# Potenzen/Binformeln: sigKey steht NACH sourceLabel → Beschriftung aus dem Schlüssel rekonstruieren
for k in ('potenzen', 'binformeln'):
    src = rd(k + '.js')
    cat[k]['items'] = [{'key': m.group(2), 'label': m.group(1)} for m in re.finditer(r'sourceLabel: "([^"]+)",\s*sigKey: "([^"]+)"', src)]
# Trigonometrie: sprechender Titel statt „Angepasst“
src = rd('trigonometrie.js')
cat['trigonometrie']['items'] = [{'key': m.group(1), 'label': (m.group(2) if m.group(2).startswith('MSA') else 'Übungsaufgabe') + ' · ' + m.group(3)} for m in re.finditer(r'id: "([^"]+)", sourceLabel: "([^"]+)", title: "([^"]+)"', src)]
for k, v in cat.items():
    assert v['items'], k
    keys = [i['key'] for i in v['items']]; assert len(keys) == len(set(keys)), (k, 'doppelte Schlüssel')
out = '// Automatisch erzeugt von tools/exam_catalog.py — nicht von Hand bearbeiten.\n// Prüfungsaufgaben aller Trainer für die Prüfungssimulation (Teil B).\nconst EXAM_CATALOG = ' + json.dumps(cat, ensure_ascii=False, indent=1) + ';\n'
(JS / 'pruefung-katalog.js').write_text(out, encoding='utf-8')
for k, v in cat.items(): print(f'{k:20s} {len(v["items"]):3d} Aufgaben')
