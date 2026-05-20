// ==========================================
// wahrscheinlichkeit.js — WahrscheinlichkeitsTrainer
// (Wird inline mit shared.js zusammen pro App-Seite kompiliert.)
// ==========================================

const colorMap = { 'rot': '#ef4444', 'blau': '#3b82f6', 'grün': '#10b981', 'gelb': '#eab308', 'Andere': '#94a3b8', 'Rest': '#94a3b8' };

// Allgemeine Funktion, um das Baumdiagramm für jedes Level zu bauen.
// targetPaths-Parameter:
//   - Array (legacy): ['rot', 'rot']                 → ein einzelner Pfad
//   - Objekt mit zwei Pfaden: { A: ['rot','blau'], B: ['blau','rot'] } → für "beliebige Reihenfolge"
// Im Knoten wird inputLevel gesetzt zu:
//   - Number 1 oder 2 (single path)
//   - Objekt { level: 1|2, path: 'A'|'B' } (multi path) — wir markieren beide Pfade gleichzeitig
//
// Voraussetzung für multi path: die ersten Züge der beiden Pfade sind UNTERSCHIEDLICH
// (sonst landen beide Pfade auf demselben Ebene-1-Knoten und der renderTree-Code könnte
// nicht eindeutig unterscheiden). Bei "beliebiger Reihenfolge" ist das natürlich gegeben.
const buildProbabilityTree = (colors, isOhne, targetPaths, totalCount) => {
    const paths = Array.isArray(targetPaths) ? { A: targetPaths } : targetPaths;
    const isMulti = !!paths.B;
    const wrap = (level, path) => isMulti ? { level, path } : level;

    return {
        label: 'Start',
        children: colors.map(c => {
            // Welcher Pfad beginnt mit dieser Farbe? (Bei single path nur A relevant.)
            let firstPath = null;
            if (paths.A && c.id === paths.A[0]) firstPath = 'A';
            else if (paths.B && c.id === paths.B[0]) firstPath = 'B';
            const lvl1 = firstPath ? wrap(1, firstPath) : null;

            return {
                label: c.id,
                hex: c.hex,
                probText: `${c.count}/${totalCount}`,
                inputLevel: lvl1,
                children: colors.map(sc => {
                    let nextCount = sc.count;
                    if (isOhne && c.id === sc.id) nextCount--;
                    // Welcher Pfad ENDET hier? Nur prüfen, wenn auch der 1. Zug derselbe Pfad ist.
                    let secondPath = null;
                    if (firstPath === 'A' && sc.id === paths.A[1]) secondPath = 'A';
                    else if (firstPath === 'B' && sc.id === paths.B[1]) secondPath = 'B';
                    const lvl2 = secondPath ? wrap(2, secondPath) : null;

                    return {
                        label: sc.id,
                        hex: sc.hex,
                        probText: `${nextCount}/${totalCount - (isOhne ? 1 : 0)}`,
                        inputLevel: lvl2
                    };
                })
            };
        })
    };
};

// Helper: extrahiert die Ebene (1 oder 2) aus inputLevel, egal ob Number oder Objekt.
const _ilLevel = (il) => (typeof il === 'object' && il !== null) ? il.level : il;
// Helper: extrahiert den Pfad-Buchstaben ('A' oder 'B') — Default 'A' bei Number-Form.
const _ilPath = (il) => (typeof il === 'object' && il !== null) ? il.path : 'A';

// Hilfs: zufälliges Element aus Array.
const _pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ==========================================
// Hardcoded Prüfungsaufgaben (Bayern MSA Mathematik — Wahrscheinlichkeit)
// Aus dem Prüfungsarchiv des Bayerischen Staatsministeriums für Unterricht und Kultus.
// Nur Aufgaben, die in unsere 2-Zug-Pfad-Struktur passen — adaptierte Aufgaben sind
// im `label` als (adaptiert) gekennzeichnet.
// ==========================================
const wahrscheinlichkeitsExamTasks = [
    {
        sigKey: 'msa-2025-i-7b',
        label: 'MSA 2025 I/7b',
        text: 'Bei einer Faschingsveranstaltung werden 150 äußerlich nicht unterscheidbare Krapfen verkauft. Davon sind 75 mit Aprikosenmarmelade (A), 70 mit Erdbeermarmelade (E) und 5 mit Senf (S) gefüllt. Die ersten beiden Kunden kaufen nacheinander je einen Krapfen. Berechne die Wahrscheinlichkeit, dass die beiden zuerst verkauften Krapfen mit Aprikosenmarmelade gefüllt sind.',
        type: 'ohne',
        total: 150,
        treeColors: [
            { id: 'A', count: 75, hex: '#f59e0b' },
            { id: 'E', count: 70, hex: '#ef4444' },
            { id: 'S', count: 5, hex: '#94a3b8' }
        ],
        targetPath: ['A', 'A']
    },
    {
        sigKey: 'msa-2024-ii-5b',
        label: 'MSA 2024 II/5b',
        text: 'In einer Getränkekiste befinden sich 12 Flaschen mit gleicher Form: 3 Flaschen Wasser (W), 5 Flaschen Apfelschorle (A) und 4 Flaschen Holunderschorle (H). Yannis holt sich zweimal nacheinander je eine Flasche aus der Kiste, ohne zurückzulegen. Berechne die Wahrscheinlichkeit, dass Yannis beide Male eine Flasche mit Holunderschorle entnimmt.',
        type: 'ohne',
        total: 12,
        treeColors: [
            { id: 'W', count: 3, hex: '#3b82f6' },
            { id: 'A', count: 5, hex: '#10b981' },
            { id: 'H', count: 4, hex: '#a855f7' }
        ],
        targetPath: ['H', 'H']
    },
    {
        sigKey: 'msa-2024-i-9-adapt',
        label: 'MSA 2024 I/9',
        text: 'In einem Behälter befinden sich 20 Kugeln. Auf jede Kugel ist genau eine Zahl aufgedruckt: viermal die Zahl 1, sechsmal die Zahl 2 und zehnmal die Zahl 3. Nacheinander werden zwei Kugeln gezogen ohne Zurücklegen. Berechne die Wahrscheinlichkeit, dass beide Male die Zahl 3 gezogen wird.',
        type: 'ohne',
        total: 20,
        treeColors: [
            { id: '1', count: 4, hex: '#3b82f6' },
            { id: '2', count: 6, hex: '#f59e0b' },
            { id: '3', count: 10, hex: '#10b981' }
        ],
        targetPath: ['3', '3']
    },
    {
        sigKey: 'msa-2017-ii-10b-adapt',
        label: 'MSA 2017 II/10b',
        text: 'Bei einem Skirennen starten zwölf Läufer: 4 Deutsche, 5 Österreicher und 3 Schweizer. Die Startreihenfolge wird zufällig ausgelost. Wir unterscheiden nur zwischen "Schweizer" und "Andere" (Deutsche oder Österreicher). Berechne die Wahrscheinlichkeit, dass unter den ersten beiden Startern kein Schweizer ist.',
        type: 'ohne',
        total: 12,
        treeColors: [
            { id: 'CH', count: 3, hex: '#dc2626' },
            { id: 'Andere', count: 9, hex: '#3b82f6' }
        ],
        targetPath: ['Andere', 'Andere']
    },
    {
        sigKey: 'msa-2016-i-3b',
        label: 'MSA 2016 I/3b',
        text: 'In einer Tüte befinden sich 4 rote, 2 grüne und 1 weißes Gummibärchen. Christiane nimmt ein Gummibärchen heraus und isst es. Anschließend nimmt sie ein zweites und isst es ebenfalls. Berechne die Wahrscheinlichkeit, dass beide Gummibärchen rot sind.',
        type: 'ohne',
        total: 7,
        treeColors: [
            { id: 'rot', count: 4, hex: '#ef4444' },
            { id: 'grün', count: 2, hex: '#10b981' },
            { id: 'weiß', count: 1, hex: '#cbd5e1' }
        ],
        targetPath: ['rot', 'rot']
    },
    {
        sigKey: 'msa-2014-ii-8b',
        label: 'MSA 2014 II/8b',
        text: 'In einer Lostrommel auf dem Jahrmarkt befinden sich noch 1 Hauptgewinn (H), 9 Kleingewinne (K) und 40 Nieten (N). Moritz zieht zwei Lose aus der Trommel und öffnet sie nacheinander. Berechne die Wahrscheinlichkeit, dass Moritz zwei Nieten zieht.',
        type: 'ohne',
        total: 50,
        treeColors: [
            { id: 'H', count: 1, hex: '#f59e0b' },
            { id: 'K', count: 9, hex: '#10b981' },
            { id: 'N', count: 40, hex: '#94a3b8' }
        ],
        targetPath: ['N', 'N']
    },
    {
        sigKey: 'msa-2013-ii-3-adapt',
        label: 'MSA 2013 II/3',
        text: 'In einem Behälter befinden sich 60 Kugeln: 24 gelbe (G) und 36 blaue (B). Nacheinander werden zwei Kugeln ohne Zurücklegen gezogen. Berechne die Wahrscheinlichkeit, dass beide Kugeln gelb sind.',
        type: 'ohne',
        total: 60,
        treeColors: [
            { id: 'G', count: 24, hex: '#f59e0b' },
            { id: 'B', count: 36, hex: '#3b82f6' }
        ],
        targetPath: ['G', 'G']
    },
    // ----- Reihenfolge-Aufgaben (Phase 2): zwei Pfade müssen addiert werden -----
    {
        sigKey: 'msa-2025-i-7b-reihenfolge',
        label: 'MSA 2025 I/7b',
        text: 'Bei einer Faschingsveranstaltung werden 150 äußerlich nicht unterscheidbare Krapfen verkauft: 75 mit Aprikosenmarmelade (A), 70 mit Erdbeermarmelade (E) und 5 mit Senf (S). Die ersten beiden Kunden kaufen nacheinander je einen Krapfen. Berechne die Wahrscheinlichkeit, dass die ersten beiden Kunden einen Krapfen mit Aprikosenmarmelade UND einen Krapfen mit Erdbeermarmelade bekommen (Reihenfolge egal).',
        type: 'ohne',
        taskType: 'reihenfolge',
        total: 150,
        treeColors: [
            { id: 'A', count: 75, hex: '#f59e0b' },
            { id: 'E', count: 70, hex: '#ef4444' },
            { id: 'S', count: 5, hex: '#94a3b8' }
        ],
        targetPaths: { A: ['A', 'E'], B: ['E', 'A'] }
    },
    {
        sigKey: 'msa-2014-ii-8b-reihenfolge',
        label: 'MSA 2014 II/8b',
        text: 'In einer Lostrommel auf dem Jahrmarkt befinden sich 1 Hauptgewinn (H), 9 Kleingewinne (K) und 40 Nieten (N). Moritz zieht nacheinander zwei Lose und öffnet sie. Berechne die Wahrscheinlichkeit, dass Moritz einen Kleingewinn UND eine Niete zieht (Reihenfolge egal).',
        type: 'ohne',
        taskType: 'reihenfolge',
        total: 50,
        treeColors: [
            { id: 'H', count: 1, hex: '#f59e0b' },
            { id: 'K', count: 9, hex: '#10b981' },
            { id: 'N', count: 40, hex: '#94a3b8' }
        ],
        targetPaths: { A: ['K', 'N'], B: ['N', 'K'] }
    },
    {
        sigKey: 'msa-2016-i-3b-reihenfolge',
        label: 'MSA 2016 I/3b',
        text: 'In einer Tüte befinden sich 4 rote (r), 2 grüne (g) und 1 weißes (w) Gummibärchen. Christiane nimmt nacheinander zwei Gummibärchen heraus und isst sie. Berechne die Wahrscheinlichkeit, dass sie ein rotes UND ein grünes Gummibärchen isst (Reihenfolge egal).',
        type: 'ohne',
        taskType: 'reihenfolge',
        total: 7,
        treeColors: [
            { id: 'r', count: 4, hex: '#ef4444' },
            { id: 'g', count: 2, hex: '#10b981' },
            { id: 'w', count: 1, hex: '#cbd5e1' }
        ],
        targetPaths: { A: ['r', 'g'], B: ['g', 'r'] }
    }
];

// Wandelt einen Prüfungsaufgaben-Eintrag in das problem-Format um. Unterstützt:
//  - "direkt": klassische 2-Zug-Aufgabe (single targetPath) — wie bisher.
//  - "reihenfolge": zwei Pfade A und B, deren Wahrscheinlichkeiten addiert werden
//    ("beliebige Reihenfolge"). task.targetPaths = { A: [...], B: [...] }.
const buildExamProblem = (task) => {
    const isOhne = task.type === 'ohne';
    const isMulti = task.taskType === 'reihenfolge';
    const tot = task.total;
    const colorByName = Object.fromEntries(task.treeColors.map(c => [c.id, c]));
    const totalAfter = isOhne ? tot - 1 : tot;

    // Helper: für einen gegebenen Pfad [first, second] die beiden Bruch-Zähler ausrechnen.
    const drawCounts = (path) => {
        const first = colorByName[path[0]].count;
        const second = (isOhne && path[0] === path[1]) ? first - 1 : colorByName[path[1]].count;
        return [first, second];
    };

    if (!isMulti) {
        const [t1Count, t2Count] = drawCounts(task.targetPath);
        const expectedPerc = (t1Count / tot) * (t2Count / totalAfter) * 100;
        return {
            id: Math.random(), diff: 'pruefung', taskType: 'direkt',
            examLabel: task.label,
            text: task.text,
            type: task.type,
            draw1: { top: t1Count, bot: tot },
            draw2: { top: t2Count, bot: totalAfter },
            resultPerc: _r2(expectedPerc),
            explanation: `${task.label}\n\n1. Zug (${task.targetPath[0]}): ${t1Count}/${tot}\n2. Zug (${task.targetPath[1]}): ${t2Count}/${totalAfter}\nPfadregel: ${t1Count}/${tot} · ${t2Count}/${totalAfter} ≈ ${_r2(expectedPerc).toString().replace('.',',')} %`,
            tree: buildProbabilityTree(task.treeColors, isOhne, task.targetPath, tot),
            sigKey: task.sigKey
        };
    }

    // reihenfolge: zwei Pfade addieren
    const [a1, a2] = drawCounts(task.targetPaths.A);
    const [b1, b2] = drawCounts(task.targetPaths.B);
    const pa = (a1 / tot) * (a2 / totalAfter);
    const pb = (b1 / tot) * (b2 / totalAfter);
    const expectedPerc = (pa + pb) * 100;
    return {
        id: Math.random(), diff: 'pruefung', taskType: 'reihenfolge',
        examLabel: task.label,
        text: task.text,
        type: task.type,
        draw1: { top: a1, bot: tot },
        draw2: { top: a2, bot: totalAfter },
        draw1B: { top: b1, bot: tot },
        draw2B: { top: b2, bot: totalAfter },
        resultPerc: _r2(expectedPerc),
        explanation: `${task.label}\n\nPfad A (${task.targetPaths.A[0]} → ${task.targetPaths.A[1]}): ${a1}/${tot} · ${a2}/${totalAfter}\nPfad B (${task.targetPaths.B[0]} → ${task.targetPaths.B[1]}): ${b1}/${tot} · ${b2}/${totalAfter}\nSumme · 100: ≈ ${_r2(expectedPerc).toString().replace('.',',')} %`,
        tree: buildProbabilityTree(task.treeColors, isOhne, task.targetPaths, tot),
        sigKey: task.sigKey
    };
};

// Helfer: rundet auf 2 Nachkommastellen für resultPerc.
const _r2 = (x) => Math.round(x * 100) / 100;
const _capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Generiert eine "Leicht"-Aufgabe (MIT Zurücklegen, 2 Farben + Rest).
// Sicherheit: rest ≥ 2, damit kein "1 haben"-Numerus-Problem entsteht.
const _genLeicht = () => {
    const scenarios = [
        { sc: 'gluecksrad', text: (t, c1, n1, c2, n2, r) => `Ein Glücksrad hat ${t} gleich große Felder. Davon sind ${n1} Felder ${c1}, ${n2} Felder ${c2} und ${r} Felder haben andere Farben. Das Rad wird zweimal gedreht. Wie groß ist die Wahrscheinlichkeit, erst ${c1} und dann ${c2} zu drehen?` },
        { sc: 'drehrad', text: (t, c1, n1, c2, n2, r) => `Auf einem Drehrad mit ${t} gleich großen Sektoren sind ${n1} Sektoren ${c1}, ${n2} Sektoren ${c2} und ${r} Sektoren in einer anderen Farbe. Das Rad wird zweimal gedreht. Wie groß ist die Wahrscheinlichkeit, dass die erste Drehung ${c1} und die zweite Drehung ${c2} zeigt?` },
        { sc: 'lostrommel-mit', text: (t, c1, n1, c2, n2, r) => `In einer Lostrommel liegen ${t} gleich aussehende Lose: ${n1} ${c1}e Lose, ${n2} ${c2}e Lose und ${r} Lose in anderen Farben. Nach jedem Zug wird das Los wieder zurückgelegt. Wie groß ist die Wahrscheinlichkeit, beim ersten Zug ein ${c1}es und beim zweiten Zug ein ${c2}es Los zu ziehen?` },
        { sc: 'farbwuerfel', text: (t, c1, n1, c2, n2, r) => `Ein Spielwürfel hat ${t} farbig gestaltete Seiten: ${n1} Seiten sind ${c1}, ${n2} Seiten sind ${c2} und ${r} Seiten haben andere Farben. Der Würfel wird zweimal geworfen. Wie groß ist die Wahrscheinlichkeit, dass beim ersten Wurf ${c1} und beim zweiten Wurf ${c2} oben liegt?` }
    ];
    const sc = _pick(scenarios);

    const colors = ['rot', 'blau', 'grün', 'gelb'];
    const c1 = _pick(colors);
    const c2 = _pick(colors.filter(c => c !== c1));
    const total = _pick([8, 10, 12, 15, 16, 20]);              // total ≥ 8, damit Rest ≥ 2 sicher möglich
    const count1 = Math.floor(Math.random() * 3) + 2;          // 2..4
    let count2 = Math.floor(Math.random() * 3) + 2;             // 2..4
    // Sicherstellen, dass rest ≥ 2 bleibt (für saubere Pluralform "X haben andere Farben").
    if (count1 + count2 > total - 2) count2 = Math.max(2, total - count1 - 2);
    const rest = total - count1 - count2;
    const expectedPerc = ((count1/total) * (count2/total)) * 100;
    const treeColors = [
        { id: c1, count: count1, hex: colorMap[c1] },
        { id: c2, count: count2, hex: colorMap[c2] },
        { id: 'Rest', count: rest, hex: colorMap['Rest'] }
    ];

    return {
        id: Math.random(), diff: 'leicht', text: sc.text(total, c1, count1, c2, count2, rest),
        type: 'mit',
        draw1: { top: count1, bot: total },
        draw2: { top: count2, bot: total },
        resultPerc: _r2(expectedPerc),
        explanation: `Mit Zurücklegen — der Nenner bleibt gleich.\n1. Zug (${c1}): ${count1}/${total}\n2. Zug (${c2}): ${count2}/${total}\nPfadregel: ${count1}/${total} · ${count2}/${total} = ${count1 * count2}/${total * total} ≈ ${_r2(expectedPerc).toString().replace('.',',')} %`,
        tree: buildProbabilityTree(treeColors, false, [c1, c2], total),
        scenarioKey: `leicht-${sc.sc}`,
        sigKey: `leicht-${sc.sc}-${total}-${c1}-${count1}-${c2}-${count2}`
    };
};

// Generiert eine "Mittel"-Aufgabe — Mix aus MIT (40%) und OHNE Zurücklegen (60%).
// Target-Pfad variiert: mal a-a (zweimal dieselbe Farbe), mal a-b (verschiedene).
// Sätze immer mit konkretem Subjekt, damit kein "klebt einen ein"-Geschwurbel entsteht.
const _genMittel = () => {
    const useMit = Math.random() < 0.4;

    if (useMit) {
        // MIT Zurücklegen — 2 Hauptfarben + Rest. Rest ≥ 2 für saubere Pluralform.
        const scenarios = [
            { sc: 'gluecksrad-m', text: (t, c1, n1, c2, n2, r) => `An einem Glücksrad sind ${t} gleich große Felder: ${n1} ${c1}e Felder, ${n2} ${c2}e Felder und ${r} Felder in anderen Farben. Das Rad wird zweimal gedreht. Wie groß ist die Wahrscheinlichkeit, dass beide Drehungen ein ${c1}es Feld zeigen?`, sameColor: true },
            { sc: 'drehrad-m', text: (t, c1, n1, c2, n2, r) => `Ein Drehrad hat ${t} gleich große Sektoren: ${n1} ${c1}e Sektoren, ${n2} ${c2}e Sektoren und ${r} Sektoren in anderen Farben. Du drehst zweimal nacheinander. Wie groß ist die Wahrscheinlichkeit, beim ersten Mal ${c1} und beim zweiten Mal ${c2} zu treffen?`, sameColor: false },
            { sc: 'farbwuerfel-m', text: (t, c1, n1, c2, n2, r) => `Ein Würfel hat ${t} Seiten in verschiedenen Farben: ${n1} Seiten sind ${c1}, ${n2} Seiten sind ${c2} und ${r} Seiten haben andere Farben. Der Würfel wird zweimal geworfen. Wie groß ist die Wahrscheinlichkeit, zweimal ${c1} zu werfen?`, sameColor: true },
            { sc: 'lostrommel-m', text: (t, c1, n1, c2, n2, r) => `In einer Lostrommel liegen ${t} Lose: ${n1} ${c1}e Lose, ${n2} ${c2}e Lose und ${r} Lose in anderen Farben. Nach jedem Zug wird das Los wieder zurückgelegt. Wie groß ist die Wahrscheinlichkeit, beim ersten Zug ein ${c1}es und beim zweiten Zug ein ${c2}es Los zu ziehen?`, sameColor: false }
        ];
        const sc = _pick(scenarios);

        const colors = ['rot', 'blau', 'grün', 'gelb'];
        const c1 = _pick(colors);
        const c2 = _pick(colors.filter(c => c !== c1));
        const total = _pick([8, 10, 12, 15, 16, 20]);
        const count1 = Math.floor(Math.random() * 3) + 3;       // 3..5
        let count2 = Math.floor(Math.random() * 3) + 2;         // 2..4
        if (count1 + count2 > total - 2) count2 = Math.max(2, total - count1 - 2);
        const rest = total - count1 - count2;

        const targetIs2nd = sc.sameColor ? c1 : c2;
        const targetCount2 = sc.sameColor ? count1 : count2;
        const expectedPerc = ((count1/total) * (targetCount2/total)) * 100;
        const treeColors = [
            { id: c1, count: count1, hex: colorMap[c1] },
            { id: c2, count: count2, hex: colorMap[c2] },
            { id: 'Rest', count: rest, hex: colorMap['Rest'] }
        ];

        return {
            id: Math.random(), diff: 'mittel', text: sc.text(total, c1, count1, c2, count2, rest),
            type: 'mit',
            draw1: { top: count1, bot: total },
            draw2: { top: targetCount2, bot: total },
            resultPerc: _r2(expectedPerc),
            explanation: `Mit Zurücklegen — der Nenner bleibt gleich.\n1. Zug (${c1}): ${count1}/${total}\n2. Zug (${targetIs2nd}): ${targetCount2}/${total}\nPfadregel: ${count1}/${total} · ${targetCount2}/${total} ≈ ${_r2(expectedPerc).toString().replace('.',',')} %`,
            tree: buildProbabilityTree(treeColors, false, [c1, targetIs2nd], total),
            scenarioKey: `mittel-${sc.sc}`,
            sigKey: `mittel-${sc.sc}-${total}-${count1}-${count2}`
        };
    } else {
        // OHNE Zurücklegen — 2 Sorten, 60% zweimal-gleich, 40% verschieden.
        // Jedes Szenario bringt konkretes Subjekt (Personenname) und passendes Verb mit,
        // damit der Aufgabentext grammatikalisch sauber wird.
        const scenarios = [
            { sc: 'gummibaerchen', name: 'Gummibärchen', container: 'einer Tüte', subject: 'Lena', action: 'nimmt nacheinander zwei Gummibärchen heraus und isst sie', adj1: 'rote', adj2: 'gelbe', col1: 'rot', col2: 'gelb' },
            { sc: 'bonbons', name: 'Bonbons', container: 'einer Schale', subject: 'Max', action: 'nimmt nacheinander zwei Bonbons heraus und lutscht sie', adj1: 'blaue', adj2: 'grüne', col1: 'blau', col2: 'grün' },
            { sc: 'karten', name: 'Karten', container: 'einem Stapel', subject: 'Tim', action: 'zieht nacheinander zwei Karten und legt sie zur Seite', adj1: 'rote', adj2: 'schwarze', col1: 'rot', col2: 'Andere' },
            { sc: 'kugeln', name: 'Kugeln', container: 'einer Urne', subject: 'Anna', action: 'nimmt nacheinander zwei Kugeln aus der Urne, ohne sie zurückzulegen', adj1: 'grüne', adj2: 'blaue', col1: 'grün', col2: 'blau' },
            { sc: 'lose', name: 'Lose', container: 'einer Lostrommel', subject: 'Paul', action: 'zieht nacheinander zwei Lose und behält sie', adj1: 'gelbe', adj2: 'rote', col1: 'gelb', col2: 'rot' },
            { sc: 'plaettchen', name: 'Plättchen', container: 'einem Beutel', subject: 'Mia', action: 'nimmt nacheinander zwei Plättchen aus dem Beutel, ohne sie zurückzulegen', adj1: 'blaue', adj2: 'gelbe', col1: 'blau', col2: 'gelb' },
            { sc: 'murmeln', name: 'Murmeln', container: 'einem Säckchen', subject: 'Jonas', action: 'nimmt nacheinander zwei Murmeln aus dem Säckchen, ohne sie zurückzulegen', adj1: 'rote', adj2: 'grüne', col1: 'rot', col2: 'grün' },
            { sc: 'aufkleber', name: 'Aufkleber', container: 'einer Tüte', subject: 'Hanna', action: 'zieht nacheinander zwei Aufkleber und klebt sie ein', adj1: 'gelbe', adj2: 'blaue', col1: 'gelb', col2: 'blau' }
        ];
        const s = _pick(scenarios);
        const total = Math.floor(Math.random() * 8) + 6;            // 6..13
        const count1 = Math.floor(Math.random() * 4) + 2;           // 2..5

        const twoSame = Math.random() < 0.6;
        // Prädikatives Adjektiv ohne Endung: "rote" → "rot" (für "dass beide rot sind").
        const pred1 = s.adj1.replace(/e$/, '');
        const pred2 = s.adj2.replace(/e$/, '');

        let questionText, draw2, targetPath, expectedPerc;
        if (twoSame) {
            if (count1 < 2) return _genMittel();
            questionText = `In ${s.container} sind ${count1} ${s.adj1} und ${total - count1} ${s.adj2} ${s.name} (insgesamt ${total}). ${s.subject} ${s.action}. Wie groß ist die Wahrscheinlichkeit, dass beide ${pred1} sind?`;
            draw2 = { top: count1 - 1, bot: total - 1 };
            targetPath = [s.adj1, s.adj1];
            expectedPerc = ((count1/total) * ((count1-1)/(total-1))) * 100;
        } else {
            const count2 = total - count1;
            if (count2 < 1) return _genMittel();
            questionText = `In ${s.container} sind ${count1} ${s.adj1} und ${count2} ${s.adj2} ${s.name} (insgesamt ${total}). ${s.subject} ${s.action}. Wie groß ist die Wahrscheinlichkeit, dass das erste ${pred1} und das zweite ${pred2} ist?`;
            draw2 = { top: count2, bot: total - 1 };
            targetPath = [s.adj1, s.adj2];
            expectedPerc = ((count1/total) * (count2/(total-1))) * 100;
        }

        const treeColors = [
            { id: s.adj1, count: count1, hex: colorMap[s.col1] || colorMap['rot'] },
            { id: s.adj2, count: total - count1, hex: colorMap[s.col2] || colorMap['Andere'] }
        ];

        return {
            id: Math.random(), diff: 'mittel', text: questionText,
            type: 'ohne',
            draw1: { top: count1, bot: total },
            draw2,
            resultPerc: _r2(expectedPerc),
            explanation: `Ohne Zurücklegen — der Nenner wird um 1 kleiner.\n1. Zug: ${count1}/${total}\n2. Zug: ${draw2.top}/${draw2.bot}\nPfadregel: ${count1}/${total} · ${draw2.top}/${draw2.bot} ≈ ${_r2(expectedPerc).toString().replace('.',',')} %`,
            tree: buildProbabilityTree(treeColors, true, targetPath, total),
            scenarioKey: `mittel-${s.sc}-${twoSame ? 'aa' : 'ab'}`,
            sigKey: `mittel-${s.sc}-${total}-${count1}-${twoSame ? 'aa' : 'ab'}`
        };
    }
};

// "Schwer"-Aufgaben — 25% MIT, 75% OHNE Zurücklegen. Sechs sehr unterschiedliche
// Sachkontexte mit eigener Sprache (Skirennen, Lostrommel, Krapfen, Reagenzgläser,
// Schulkantine, Kartenstapel), damit sich die Aufgaben nicht mehr "alle gleich" anhören.
// Generiert eine "Schwer"-Aufgabe vom Typ "reihenfolge" (beliebige Reihenfolge).
// Schüler:in muss zwei Pfade A → B und B → A markieren und ihre Wahrscheinlichkeiten
// addieren. Sachkontexte: Krapfen, Lostrommel, Reagenzgläser etc.
const _genSchwer_reihenfolge = () => {
    const scenarios = [
        {
            sc: 'krapfen-r', build: () => {
                const total = _pick([20, 24, 30]);
                const a = Math.floor(Math.random() * 4) + 6;   // 6..9
                const b = Math.floor(Math.random() * 4) + 6;   // 6..9
                const c = total - a - b;
                if (c < 2 || c > 8) return null;
                const text = `Bei einer Faschingsveranstaltung werden ${total} Krapfen verkauft: ${a} mit Aprikose (A), ${b} mit Erdbeere (E) und ${c} mit Senf (S). Zwei Kunden kaufen nacheinander je einen Krapfen. Wie groß ist die Wahrscheinlichkeit, dass einer einen Aprikose- und der andere einen Erdbeer-Krapfen bekommt (Reihenfolge egal)?`;
                return { total, a, b, c, text,
                    treeColors: [{ id: 'A', count: a, hex: '#f59e0b' }, { id: 'E', count: b, hex: '#ef4444' }, { id: 'S', count: c, hex: '#94a3b8' }],
                    targetPaths: { A: ['A', 'E'], B: ['E', 'A'] },
                    pathLabels: ['Aprikose', 'Erdbeere']
                };
            }
        },
        {
            sc: 'lose-r', build: () => {
                const total = _pick([20, 25, 30]);
                const h = _pick([2, 3]);                       // Hauptgewinne
                const k = _pick([5, 6, 7, 8]);                  // Kleingewinne
                const n = total - h - k;                        // Nieten
                if (n < 8) return null;
                const text = `In einer Lostrommel sind ${total} Lose: ${h} Hauptgewinne (H), ${k} Kleingewinne (K) und ${n} Nieten (N). Zwei Lose werden nacheinander gezogen, ohne sie zurückzulegen. Wie groß ist die Wahrscheinlichkeit, dass genau ein Kleingewinn und eine Niete gezogen werden (Reihenfolge egal)?`;
                return { total, text,
                    treeColors: [{ id: 'H', count: h, hex: '#f59e0b' }, { id: 'K', count: k, hex: '#10b981' }, { id: 'N', count: n, hex: '#94a3b8' }],
                    targetPaths: { A: ['K', 'N'], B: ['N', 'K'] },
                    pathLabels: ['Kleingewinn', 'Niete']
                };
            }
        },
        {
            sc: 'reagenzglas-r', build: () => {
                const total = _pick([12, 15, 18]);
                const r = Math.floor(Math.random() * 3) + 4;    // 4..6
                const b = Math.floor(Math.random() * 3) + 4;    // 4..6
                const g = total - r - b;
                if (g < 2) return null;
                const text = `Im Chemielabor stehen ${total} Reagenzgläser mit verschiedenen Flüssigkeiten: ${r} rote (R), ${b} blaue (B) und ${g} grüne (G). Zwei Reagenzgläser werden nacheinander zufällig herausgenommen. Wie groß ist die Wahrscheinlichkeit, dass eines mit roter und eines mit blauer Flüssigkeit herausgenommen wird (Reihenfolge egal)?`;
                return { total, text,
                    treeColors: [{ id: 'R', count: r, hex: '#ef4444' }, { id: 'B', count: b, hex: '#3b82f6' }, { id: 'G', count: g, hex: '#10b981' }],
                    targetPaths: { A: ['R', 'B'], B: ['B', 'R'] },
                    pathLabels: ['rot', 'blau']
                };
            }
        }
    ];
    const sc = _pick(scenarios);
    const built = sc.build();
    if (!built) return _genSchwer_reihenfolge();

    const { total, text, treeColors, targetPaths, pathLabels } = built;
    const colorByName = Object.fromEntries(treeColors.map(c => [c.id, c]));
    // Pfad A: P_A = a1/total · a2/(total-1); Pfad B: P_B analog
    const a1 = colorByName[targetPaths.A[0]].count;
    const a2 = colorByName[targetPaths.A[1]].count;       // verschiedene Sorten → keine Verminderung
    const b1 = colorByName[targetPaths.B[0]].count;
    const b2 = colorByName[targetPaths.B[1]].count;
    const expectedPerc = ((a1 / total) * (a2 / (total - 1)) + (b1 / total) * (b2 / (total - 1))) * 100;

    return {
        id: Math.random(), diff: 'schwer', taskType: 'reihenfolge', text,
        type: 'ohne',
        draw1: { top: a1, bot: total },
        draw2: { top: a2, bot: total - 1 },
        draw1B: { top: b1, bot: total },
        draw2B: { top: b2, bot: total - 1 },
        resultPerc: _r2(expectedPerc),
        explanation: `Ohne Zurücklegen — zwei Pfade addieren.\nPfad A (${pathLabels[0]} → ${pathLabels[1]}): ${a1}/${total} · ${a2}/${total - 1}\nPfad B (${pathLabels[1]} → ${pathLabels[0]}): ${b1}/${total} · ${b2}/${total - 1}\nSumme · 100 ≈ ${_r2(expectedPerc).toString().replace('.',',')} %`,
        tree: buildProbabilityTree(treeColors, true, targetPaths, total),
        scenarioKey: `schwer-${sc.sc}`,
        sigKey: `schwer-${sc.sc}-${total}-${a1}-${b1}`
    };
};

const _genSchwer = () => {
    // 15% reihenfolge-Aufgaben (zwei Pfade addieren), 20% mit-Zurücklegen, sonst ohne-direkt.
    const r = Math.random();
    if (r < 0.15) return _genSchwer_reihenfolge();
    const useMit = r < 0.15 + 0.20;  // 0.15..0.35 → mit Zurücklegen (also 20% effektiv)

    if (useMit) {
        // MIT Zurücklegen, versteckt im Sachkontext. Jedes Label-Set bringt seine eigenen
        // Hex-Farben mit, damit die Baumknoten passend gefärbt sind (statt grauem Fallback).
        const scMit = [
            { sc: 'gluecksrad-schwer', build: () => {
                const total = _pick([10, 12, 15, 16, 20]);
                const a = Math.floor(Math.random() * 4) + 3;   // 3..6
                const b = Math.floor(Math.random() * 4) + 3;   // 3..6
                const c = total - a - b;
                if (c < 2) return null;
                // Label-Sets mit eindeutigen Anfangsbuchstaben (für Baum-Anzeige).
                const labelSet = _pick([
                    { labels: ['Stern', 'Mond', 'Herz'], hexes: ['#f59e0b', '#6366f1', '#ef4444'] },
                    { labels: ['rotes Feld', 'blaues Feld', 'gelbes Feld'], hexes: ['#ef4444', '#3b82f6', '#eab308'] },
                    { labels: ['Apfel', 'Birne', 'Kirsche'], hexes: ['#10b981', '#fbbf24', '#ef4444'] }
                ]);
                const text = `Ein großes Glücksrad mit ${total} gleich großen Sektoren zeigt: ${a}× ${labelSet.labels[0]}, ${b}× ${labelSet.labels[1]} und ${c}× ${labelSet.labels[2]}. Es wird zweimal hintereinander gedreht. Wie groß ist die Wahrscheinlichkeit, dass erst ${labelSet.labels[0]} und dann ${labelSet.labels[1]} erscheint?`;
                return { total, a, b, c, text, labels: labelSet.labels, hexes: labelSet.hexes, draw1: {top: a, bot: total}, draw2: {top: b, bot: total}, target: [labelSet.labels[0], labelSet.labels[1]] };
            }},
            { sc: 'wuerfel-3farben', build: () => {
                const total = 12;  // Würfel mit 12 farbigen Flächen
                const a = _pick([3, 4, 5]);
                const b = _pick([3, 4, 5]);
                const c = total - a - b;
                if (c < 2) return null;
                const labels = ['rot', 'blau', 'grün'];
                const hexes = [colorMap.rot, colorMap.blau, colorMap.grün];
                const text = `Ein spezieller 12-seitiger Würfel hat seine Flächen in drei Farben gefärbt: ${a}× ${labels[0]}, ${b}× ${labels[1]} und ${c}× ${labels[2]}. Du würfelst zweimal nacheinander. Wie groß ist die Wahrscheinlichkeit, beim ersten Wurf ${labels[0]} und beim zweiten Wurf ${labels[1]} zu würfeln?`;
                return { total, a, b, c, text, labels, hexes, draw1: {top: a, bot: total}, draw2: {top: b, bot: total}, target: [_capitalize(labels[0]), _capitalize(labels[1])] };
            }}
        ];
        const sc = _pick(scMit);
        const built = sc.build();
        if (!built) return _genSchwer();
        const { total, a, b, c, text, hexes, draw1, draw2, target } = built;
        const expectedPerc = (a / total) * (b / total) * 100;
        const treeColors = [
            { id: target[0], count: a, hex: hexes[0] },
            { id: target[1], count: b, hex: hexes[1] },
            { id: built.labels[2], count: c, hex: hexes[2] }
        ];

        return {
            id: Math.random(), diff: 'schwer', text,
            type: 'mit',
            draw1, draw2,
            resultPerc: _r2(expectedPerc),
            explanation: `Mit Zurücklegen — Nenner bleibt gleich.\n1. Zug: ${draw1.top}/${draw1.bot}\n2. Zug: ${draw2.top}/${draw2.bot}\nPfadregel: ${draw1.top}/${draw1.bot} · ${draw2.top}/${draw2.bot} ≈ ${_r2(expectedPerc).toString().replace('.',',')} %`,
            tree: buildProbabilityTree(treeColors, false, [target[0], target[1]], total),
            scenarioKey: `schwer-${sc.sc}`,
            sigKey: `schwer-${sc.sc}-${total}-${a}-${b}`
        };
    }

    // OHNE Zurücklegen — sechs Sachkontexte mit eigener Sprache.
    const scOhne = [
        { sc: 'skirennen', build: () => {
            const total = _pick([10, 12, 14, 15]);
            const ch = _pick([2, 3, 4]);                       // Schweizer
            const de = _pick([3, 4, 5]);                       // Deutsche
            const at = total - ch - de;                         // Österreicher
            if (at < 2) return null;
            // Plural-Form (für "beide X") und Singular-Form (für "ein X und ein Y") sauber trennen.
            const nationen = [
                { plural: 'Schweizer', singular: 'Schweizer', count: ch },
                { plural: 'Deutsche', singular: 'Deutscher', count: de },
                { plural: 'Österreicher', singular: 'Österreicher', count: at }
            ];
            const names = nationen.map(n => n.plural);
            const counts = [ch, de, at];
            // Zufälliger Target-Pfad: gleich oder verschieden.
            const sameType = Math.random() < 0.5;
            let i1, i2;
            if (sameType) { i1 = Math.floor(Math.random() * 3); i2 = i1; }
            else { i1 = Math.floor(Math.random() * 3); do { i2 = Math.floor(Math.random() * 3); } while (i2 === i1); }
            if (counts[i1] < (sameType ? 2 : 1)) return null;
            const text = sameType
                ? `Bei einem Skirennen starten ${total} Läufer: ${ch} Schweizer (CH), ${de} Deutsche (DE) und ${at} Österreicher (AT). Die Startreihenfolge wird zufällig ausgelost. Wie groß ist die Wahrscheinlichkeit, dass die ersten beiden Starter beide ${nationen[i1].plural} sind?`
                : `Bei einem Skirennen starten ${total} Läufer: ${ch} Schweizer (CH), ${de} Deutsche (DE) und ${at} Österreicher (AT). Die Startreihenfolge wird zufällig ausgelost. Wie groß ist die Wahrscheinlichkeit, dass der erste Starter ein ${nationen[i1].singular} und der zweite Starter ein ${nationen[i2].singular} ist?`;
            return { total, counts, names, i1, i2, sameType, text, hexes: ['#dc2626', '#1e293b', '#ef4444'] };
        }},
        { sc: 'lostrommel-schwer', build: () => {
            const total = _pick([20, 25, 30, 50]);
            const haupt = _pick([1, 2, 3]);
            const klein = _pick([4, 5, 6, 7]);
            const niete = total - haupt - klein;
            if (niete < 5) return null;
            const types = [['Hauptgewinn', 'Hauptgewinne'], ['Kleingewinn', 'Kleingewinne'], ['Niete', 'Nieten']];
            const counts = [haupt, klein, niete];
            // In dieser Aufgabe meistens "zwei Nieten" oder "zwei Kleingewinne"
            const i = Math.random() < 0.7 ? 2 : 1;  // meistens Nieten (Pos 2)
            if (counts[i] < 2) return null;
            const text = `In einer Lostrommel sind ${total} Lose: ${haupt} ${types[0][haupt === 1 ? 0 : 1]} (H), ${klein} ${types[1][1]} (K) und ${niete} ${types[2][1]} (N). Es werden nacheinander zwei Lose gezogen, ohne ein gezogenes Los zurückzulegen. Wie groß ist die Wahrscheinlichkeit, dass beide Lose ${types[i][1]} sind?`;
            return { total, counts, names: ['Hauptgewinn', 'Kleingewinn', 'Niete'], i1: i, i2: i, sameType: true, text, hexes: ['#f59e0b', '#10b981', '#94a3b8'] };
        }},
        { sc: 'krapfen', build: () => {
            const total = _pick([15, 18, 20, 24]);
            const apri = Math.floor(Math.random() * 4) + 5;    // 5..8
            const erd = Math.floor(Math.random() * 4) + 5;     // 5..8
            const senf = total - apri - erd;
            if (senf < 2 || senf > 6) return null;
            const counts = [apri, erd, senf];
            const names = ['Aprikose', 'Erdbeere', 'Senf'];
            // Zufälliger Target-Pfad
            const r = Math.random();
            let i1, i2, sameType;
            if (r < 0.4) { i1 = 0; i2 = 0; sameType = true; }
            else if (r < 0.7) { i1 = 1; i2 = 1; sameType = true; }
            else { i1 = 0; i2 = 1; sameType = false; }
            if (counts[i1] < (sameType ? 2 : 1)) return null;
            const text = sameType
                ? `Bei einer Faschingsveranstaltung werden ${total} äußerlich nicht unterscheidbare Krapfen verkauft. Davon sind ${apri} mit Aprikosenmarmelade (A), ${erd} mit Erdbeermarmelade (E) und ${senf} mit Senf (S) gefüllt. Zwei Kunden kaufen nacheinander je einen Krapfen. Berechne die Wahrscheinlichkeit, dass beide einen Krapfen mit ${names[i1]} bekommen.`
                : `Bei einer Faschingsveranstaltung werden ${total} äußerlich nicht unterscheidbare Krapfen verkauft. Davon sind ${apri} mit Aprikosenmarmelade (A), ${erd} mit Erdbeermarmelade (E) und ${senf} mit Senf (S) gefüllt. Zwei Kunden kaufen nacheinander je einen Krapfen. Berechne die Wahrscheinlichkeit, dass der erste Kunde einen Krapfen mit ${names[i1]} und der zweite einen Krapfen mit ${names[i2]} bekommt.`;
            return { total, counts, names, i1, i2, sameType, text, hexes: ['#f59e0b', '#ef4444', '#94a3b8'] };
        }},
        { sc: 'reagenzglas', build: () => {
            const total = _pick([12, 15, 18, 20]);
            const a = Math.floor(Math.random() * 4) + 4;       // 4..7
            const b = Math.floor(Math.random() * 4) + 3;       // 3..6
            const c = total - a - b;
            if (c < 2) return null;
            // Labels mit eindeutigen Anfangsbuchstaben (für Baum-Anzeige).
            const labelSet = _pick([
                { names: ['rote', 'blaue', 'grüne'], cols: ['rot', 'blau', 'grün'] },
                { names: ['gelbe', 'lila', 'türkise'], cols: ['gelb', 'Andere', 'grün'] }
            ]);
            const counts = [a, b, c];
            const sameType = Math.random() < 0.5;
            let i1, i2;
            if (sameType) { i1 = Math.floor(Math.random() * 2); i2 = i1; }
            else { i1 = 0; i2 = 1; }
            if (counts[i1] < (sameType ? 2 : 1)) return null;
            const text = `In einem Schul-Chemielabor stehen ${total} äußerlich gleiche Reagenzgläser: ${a} enthalten eine ${labelSet.names[0]}, ${b} eine ${labelSet.names[1]} und ${c} eine ${labelSet.names[2]} Flüssigkeit. Zwei Reagenzgläser werden nacheinander zufällig herausgenommen. Wie groß ist die Wahrscheinlichkeit, ${sameType ? `dass beide ${labelSet.names[i1]} Flüssigkeit enthalten` : `dass das erste eine ${labelSet.names[i1]} und das zweite eine ${labelSet.names[i2]} enthält`}?`;
            return { total, counts, names: labelSet.names, i1, i2, sameType, text, hexes: labelSet.cols.map(c => colorMap[c] || colorMap['Andere']) };
        }},
        { sc: 'kantine', build: () => {
            const total = _pick([12, 15, 18, 20]);
            const a = Math.floor(Math.random() * 4) + 4;
            const b = Math.floor(Math.random() * 4) + 3;
            const c = total - a - b;
            if (c < 2) return null;
            const counts = [a, b, c];
            // Labels mit eindeutigen Anfangsbuchstaben (Nudeln N, Pizza P, Salat S).
            const names = ['Nudeln', 'Pizza', 'Salat'];
            const sameType = Math.random() < 0.6;
            let i1, i2;
            if (sameType) { i1 = _pick([0, 1]); i2 = i1; }
            else { i1 = 0; i2 = 2; }
            if (counts[i1] < (sameType ? 2 : 1)) return null;
            const text = sameType
                ? `In der Schulkantine sind heute noch ${total} Essensportionen übrig: ${a} mal Nudeln (N), ${b} mal Pizza (P) und ${c} mal Salat (S). Die nächsten zwei Schüler wählen zufällig (sie sehen nicht, was sie ziehen). Wie groß ist die Wahrscheinlichkeit, dass beide Schüler ${names[i1]} bekommen?`
                : `In der Schulkantine sind heute noch ${total} Essensportionen übrig: ${a} mal Nudeln (N), ${b} mal Pizza (P) und ${c} mal Salat (S). Die nächsten zwei Schüler wählen zufällig (sie sehen nicht, was sie ziehen). Wie groß ist die Wahrscheinlichkeit, dass der erste Schüler ${names[i1]} und der zweite ${names[i2]} bekommt?`;
            return { total, counts, names, i1, i2, sameType, text, hexes: ['#f59e0b', '#dc2626', '#10b981'] };
        }},
        { sc: 'kartenstapel', build: () => {
            const total = _pick([12, 15, 18, 20]);
            const a = Math.floor(Math.random() * 4) + 4;
            const b = Math.floor(Math.random() * 4) + 3;
            const c = total - a - b;
            if (c < 2) return null;
            const counts = [a, b, c];
            // Labels mit eindeutigen Anfangsbuchstaben (Stern S, Mond M, Herz H).
            const names = ['Stern', 'Mond', 'Herz'];
            const sameType = Math.random() < 0.4;
            let i1, i2;
            if (sameType) { i1 = 0; i2 = 0; }
            else { i1 = _pick([0, 1]); do { i2 = _pick([0, 1, 2]); } while (i2 === i1); }
            if (counts[i1] < (sameType ? 2 : 1)) return null;
            const text = sameType
                ? `Ein Stapel enthält ${total} Karten: ${a} mit einem Stern (S), ${b} mit einem Mond (M) und ${c} mit einem Herz (H). Du ziehst zwei Karten nacheinander ohne Zurücklegen. Wie groß ist die Wahrscheinlichkeit, dass du zweimal einen ${names[i1]} ziehst?`
                : `Ein Stapel enthält ${total} Karten: ${a} mit einem Stern (S), ${b} mit einem Mond (M) und ${c} mit einem Herz (H). Du ziehst zwei Karten nacheinander ohne Zurücklegen. Wie groß ist die Wahrscheinlichkeit, dass du erst einen ${names[i1]} und dann einen ${names[i2]} ziehst?`;
            return { total, counts, names, i1, i2, sameType, text, hexes: ['#f59e0b', '#3b82f6', '#dc2626'] };
        }}
    ];

    const sc = _pick(scOhne);
    const built = sc.build();
    if (!built) return _genSchwer();  // erneuter Versuch bei ungeeigneter Verteilung
    const { total, counts, names, i1, i2, sameType, text, hexes } = built;

    const count1 = counts[i1];
    const count2After = sameType ? count1 - 1 : counts[i2];
    const draw1 = { top: count1, bot: total };
    const draw2 = { top: count2After, bot: total - 1 };
    const expectedPerc = (count1 / total) * (count2After / (total - 1)) * 100;

    // Baum-Markierung: target labels MÜSSEN eindeutig sein, daher fügen wir bei
    // sameType einen Suffix für den 2. Knoten an (sonst markiert er beide Pfade).
    const baseLabel1 = names[i1];
    const baseLabel2 = sameType ? names[i1] : names[i2];
    const treeColors = [
        { id: names[0], count: counts[0], hex: hexes[0] },
        { id: names[1], count: counts[1], hex: hexes[1] },
        { id: names[2], count: counts[2], hex: hexes[2] }
    ];

    return {
        id: Math.random(), diff: 'schwer', text,
        type: 'ohne',
        draw1, draw2,
        resultPerc: _r2(expectedPerc),
        explanation: `Ohne Zurücklegen.\n1. Zug (${baseLabel1}): ${count1}/${total}\n2. Zug (${baseLabel2}): ${count2After}/${total - 1}\nPfadregel: ${count1}/${total} · ${count2After}/${total - 1} ≈ ${_r2(expectedPerc).toString().replace('.',',')} %`,
        tree: buildProbabilityTree(treeColors, true, [baseLabel1, baseLabel2], total),
        scenarioKey: `schwer-${sc.sc}-${sameType ? 'aa' : 'ab'}`,
        sigKey: `schwer-${sc.sc}-${total}-${i1}${i2}-${count1}`
    };
};

const genWahrscheinlichkeitProblem = (diff) => {
    if (diff === 'leicht') return _genLeicht();
    if (diff === 'mittel') return _genMittel();
    if (diff === 'schwer') return _genSchwer();
    // Prüfungsaufgaben-Fallback (sollte nicht erreicht werden — Trainer ruft buildExamProblem direkt).
    return buildExamProblem(_pick(wahrscheinlichkeitsExamTasks));
};

// ==========================================
// TRAINER
// ==========================================
const WahrscheinlichkeitsTrainer = () => {
    const [difficulty, setDifficulty] = useState('mittel');
    const [problem, setProblem] = useState(null);
    const [step, setStep] = useState(1);
    const [selectedIdentification, setSelectedIdentification] = useState(null);

    // Inputs für bis zu 4 Brüche: Pfad A (t1/b1 + t2/b2) und für reihenfolge-Aufgaben
    // zusätzlich Pfad B (t1B/b1B + t2B/b2B). Bei "direkt"-Aufgaben werden t1B..b2B nicht genutzt.
    const [inputs, setInputs] = useState({ t1: '', b1: '', t2: '', b2: '', t1B: '', b1B: '', t2B: '', b2B: '', perc: '' });
    const [inputFeedback, setInputFeedback] = useState({});
    const [finalFeedback, setFinalFeedback] = useState(null);
    const [showSolution, setShowSolution] = useState(false);
    const [streak, setStreak] = useState(() => getStorage('smarth_streak_wahrscheinlichkeit', 0));
    const [loading, setLoading] = useState(true);

    const [errors, setErrors] = useState(0);
    const [tipRevealed, setTipRevealed] = useState(false);
    const [showAnim, setShowAnim] = useState(false);
    // Letzte 2 Szenario-Keys — verhindert, dass zwei "fast identische" Aufgaben hintereinander
    // kommen. Ein scenarioKey ist eine grobe Kategorisierung wie "schwer-skirennen-aa" oder
    // "mittel-bonbons-ab", die NICHT die konkreten Zahlen enthält. So gilt z.B. "Bonbons mit
    // 9 roten" und "Bonbons mit 7 roten" als äquivalent und wird blockiert.
    const [lastScenarios, setLastScenarios] = useState([]);
    // Prüfungsaufgaben-Pool (durchgemischt) und aktueller Index — verhalten sich wie
    // bei Bruchgleichungen: Pool wird einmal gemischt, jede Aufgabe einmal durchlaufen.
    const [examShuffled, setExamShuffled] = useState([]);
    const [examIdx, setExamIdx] = useState(0);
    // Adaptive Schwierigkeit + Lernzielkontrolle.
    const adaptive = useAdaptive('wahrscheinlichkeit', difficulty);

    useEffect(() => { setStorage('smarth_streak_wahrscheinlichkeit', streak); }, [streak]);
    const advance = (nextStep) => { setStep(nextStep); setErrors(0); setTipRevealed(false); };
    const triggerError = () => { setErrors(e => e + 1); setStreak(0); adaptive.recordWrong(); };
    const handleInputChange = (id, val) => { setInputs(prev => ({ ...prev, [id]: val.replace('.', ',') })); setInputFeedback(prev => ({ ...prev, [id]: null })); };

    const generateProblem = () => {
        setLoading(true); setStep(1); setSelectedIdentification(null);
        setInputs({ t1: '', b1: '', t2: '', b2: '', t1B: '', b1B: '', t2B: '', b2B: '', perc: '' }); setInputFeedback({});
        setFinalFeedback(null); setShowSolution(false); setErrors(0); setTipRevealed(false);

        let newProb;

        if (difficulty === 'pruefung') {
            // Prüfungsaufgaben: gemischter Pool, jede Aufgabe einmal durchlaufen.
            let pool = examShuffled;
            let idx = examIdx;
            if (pool.length === 0 || idx >= pool.length) {
                pool = shuffleArray(wahrscheinlichkeitsExamTasks);
                idx = 0;
                setExamShuffled(pool);
            }
            newProb = buildExamProblem(pool[idx]);
            setExamIdx(idx + 1);
        } else {
            // Generierte Aufgaben: Anti-Wiederholung über scenarioKey (grobe Kategorie,
            // ohne konkrete Zahlen). So kommen nicht zwei "fast identische" Aufgaben
            // hintereinander, auch wenn die Zahlen leicht variieren.
            let attempts = 0;
            do {
                newProb = genWahrscheinlichkeitProblem(difficulty);
                attempts++;
            } while (lastScenarios.includes(newProb.scenarioKey) && attempts < 12);
        }

        // Letzte 2 Szenarien merken (außer bei Prüfungsaufgaben, wo der Pool die Vielfalt regelt).
        if (difficulty !== 'pruefung' && newProb.scenarioKey) {
            setLastScenarios(prev => [newProb.scenarioKey, ...prev].slice(0, 2));
        }
        setProblem(newProb);
        setLoading(false);
    };

    useEffect(() => { generateProblem(); }, [difficulty]);

    const handleDifficultyChange = (newDiff) => {
        // Bei Wechsel ZU Prüfungsaufgaben den Pool zurücksetzen, damit die Reihenfolge
        // jedes Mal neu gemischt wird.
        if (newDiff === 'pruefung' && difficulty !== 'pruefung') {
            setExamShuffled([]);
            setExamIdx(0);
        }
        if (difficulty === newDiff) generateProblem();
        else setDifficulty(newDiff);
    };

    // Step 1: Auswahl nur markieren, Bestätigung über SubmitBtn (Vereinheitlichung).
    const handleIdentify = (selected) => {
        if (step > 1 || !problem) return;
        setSelectedIdentification(selected);
    };
    const confirmIdentify = () => {
        if (step > 1 || !problem || !selectedIdentification) return;
        if (selectedIdentification === problem.type) { advance(2); } else { triggerError(); }
    };

    // Step-Konstanten je nach taskType. Bei 'direkt' (Standard) hat der Trainer 5 Schritte,
    // bei 'reihenfolge' (beliebige Reihenfolge — zwei Pfade addieren) sind es 7 Schritte.
    const isMulti = problem?.taskType === 'reihenfolge';
    const STEP = {
        identify: 1,
        zug1A: 2,
        zug2A: 3,
        zug1B: isMulti ? 4 : null,
        zug2B: isMulti ? 5 : null,
        result: isMulti ? 6 : 4,
        done: isMulti ? 7 : 5
    };

    // Prüft Bruch t/b gegen Sollbruch top/bot — akzeptiert alle äquivalenten Kürzungen
    // (4/12 ≡ 2/6 ≡ 1/3). Gibt 'correct' oder 'incorrect' pro Feld zurück; bei korrektem
    // Bruch werden BEIDE Felder als 'correct' markiert, damit der CheckCircle im
    // MiniFractionInput erscheint.
    const checkFracStep = (topKey, botKey, target, nextStep) => {
        const ok = isFractionEquivalent(inputs[topKey], inputs[botKey], target.top, target.bot);
        setInputFeedback({ ...inputFeedback, [topKey]: ok ? 'correct' : 'incorrect', [botKey]: ok ? 'correct' : 'incorrect' });
        if (ok) advance(nextStep); else triggerError();
    };

    // Pfad A:
    const checkZug1 = () => checkFracStep('t1', 'b1', problem.draw1, STEP.zug2A);
    const checkZug2 = () => checkFracStep('t2', 'b2', problem.draw2, isMulti ? STEP.zug1B : STEP.result);
    // Pfad B (nur bei reihenfolge-Aufgaben):
    const checkZug1B = () => checkFracStep('t1B', 'b1B', problem.draw1B, STEP.zug2B);
    const checkZug2B = () => checkFracStep('t2B', 'b2B', problem.draw2B, STEP.result);

    const checkFinalResult = () => {
        if (!problem) return;
        const val = parseFloat(inputs.perc.replace(',', '.')); if (isNaN(val)) return;

        // Akzeptiert die exakte (auf 2 Nachkommastellen gerundete) Lösung ODER die auf ganze Prozent gerundete Lösung
        const isExactMatch = Math.abs(val - problem.resultPerc) <= 0.05;
        const isRoundedMatch = Math.abs(val - Math.round(problem.resultPerc)) <= 0.05;

        if (isExactMatch || isRoundedMatch) {
            setFinalFeedback('correct');
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > 0 && newStreak % 3 === 0) triggerCelebration(setShowAnim);
            adaptive.recordCorrect();
            setShowSolution(true); advance(STEP.done);
        } else { setFinalFeedback('incorrect'); triggerError(); }
    };

    // Liefert Lösungstext für den aktuellen Schritt — TipBox zeigt ihn an,
    // füllt aber nichts automatisch aus.
    const getSolutionText = () => {
        if (!problem) return null;
        if (step === STEP.identify) return `Versuch ${problem.type === 'mit' ? 'mit' : 'ohne'} Zurücklegen.`;
        if (step === STEP.zug1A) return `1. Zug: ${problem.draw1.top} / ${problem.draw1.bot}`;
        if (step === STEP.zug2A) return `2. Zug: ${problem.draw2.top} / ${problem.draw2.bot}`;
        if (isMulti && step === STEP.zug1B) return `Pfad B, 1. Zug: ${problem.draw1B.top} / ${problem.draw1B.bot}`;
        if (isMulti && step === STEP.zug2B) return `Pfad B, 2. Zug: ${problem.draw2B.top} / ${problem.draw2B.bot}`;
        if (step === STEP.result) return `${formatNum(problem.resultPerc)} %`;
        return null;
    };
    const onSolutionShown = () => setStreak(0);

    // INTERAKTIVES SVG-BAUMDIAGRAMM MIT FOREIGN-OBJECT EINGABEN
    // mobileMode = true: Inputs im Baum sind deaktiviert (read-only). Ein Klick auf
    // einen Bruch im Baum springt stattdessen zum großen Mobile-Eingabefeld unten
    // (Fokus + scrollIntoView). So tippen Schüler:innen am Handy nur einmal — im
    // großen Feld — und sehen die Eingaben im Baum als Vorschau gespiegelt.
    const focusMobileInput = (inputKey) => {
        // Wir fokussieren das obere der beiden Felder (Zähler) und scrollen es ins Bild.
        const target = document.getElementById(`mobile-w-${inputKey}`);
        if (target) {
            target.focus();
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // Aktiver Eingabe-Schlüssel je nach aktuellem Step. Wenn der Schüler IRGENDWO
    // ins Baumdiagramm tippt, soll der Cursor in genau dieses Feld unten springen.
    const activeMobileInputKey = () => {
        if (step === STEP.zug1A) return 't1';
        if (step === STEP.zug2A) return 't2';
        if (isMulti && step === STEP.zug1B) return 't1B';
        if (isMulti && step === STEP.zug2B) return 't2B';
        return null;
    };
    const focusActiveMobileInput = () => {
        const key = activeMobileInputKey();
        if (key) focusMobileInput(key);
    };

    // Mapping zwischen Baum-Knoten (level 1|2, path 'A'|'B') und den entsprechenden
    // State-Keys / Check-Funktionen / Steps. Eine einzige Quelle der Wahrheit, statt
    // 4× ähnlichen Code zu kopieren.
    const fracBindings = {
        'A1': { topKey: 't1', botKey: 'b1', onSubmit: checkZug1, activeStep: STEP.zug1A },
        'A2': { topKey: 't2', botKey: 'b2', onSubmit: checkZug2, activeStep: STEP.zug2A },
        'B1': { topKey: 't1B', botKey: 'b1B', onSubmit: checkZug1B, activeStep: STEP.zug1B },
        'B2': { topKey: 't2B', botKey: 'b2B', onSubmit: checkZug2B, activeStep: STEP.zug2B }
    };
    const renderTree = (rootNode, rootX, rootY, rootWidth, rootLevel, mobileMode = false) => {
        if (!rootNode) return null;
        const nodeRadius = 16;
        // Kompakteres Layout: Pfade deutlich kürzer als zuvor (130/160 → 90/110),
        // damit das Baumdiagramm weniger Vertikalplatz beansprucht.
        const getVSpacing = (level) => level === 0 ? 90 : 110;

        // Zwei Layer: bg = Linien + Knoten-Circles + Knoten-Labels (Hintergrund),
        // fg = Brüche, "?"-Platzhalter und aktive Eingabefelder (Vordergrund).
        // Dadurch werden Brüche IMMER über allen Linien/Knoten gezeichnet — keine
        // Verdeckung mehr durch andere Pfade.
        const bg = [];
        const fg = [];

        // (Der frühere renderMobileTreeInput-Wrapper ist entfallen — der Mobile-Baum
        // rendert den Bruch jetzt als reines SVG, ohne foreignObject. Damit ist der
        // iOS-Safari-Positions-Bug umgangen, und die Klicks gehen direkt an den
        // Container-onClick weiter, der zum aktiven Eingabefeld unten springt.)

        const walk = (node, x, y, width, level) => {
            const isLeaf = !node.children || node.children.length === 0;
            if (!isLeaf) {
                const childCount = node.children.length;
                const childWidth = width / childCount;
                const startX = x - width / 2 + childWidth / 2;
                const verticalSpacing = getVSpacing(level);

                node.children.forEach((child, index) => {
                    const childX = startX + index * childWidth;
                    const childY = y + verticalSpacing;

                    bg.push(
                        <line key={`line-${level}-${index}-${x}`} x1={x} y1={y + nodeRadius} x2={childX} y2={childY - nodeRadius} stroke="#cbd5e1" strokeWidth="2" />
                    );

                    const midX = (x + childX) / 2;
                    const midY = (y + nodeRadius + childY - nodeRadius) / 2;

                    // Ist dieser Knoten ein Target? Wenn ja, welcher Pfad + Ebene?
                    const il = child.inputLevel;
                    const lvl = _ilLevel(il);
                    const pth = _ilPath(il);
                    if (lvl) {
                        // Eindeutiges Mapping zur richtigen State-Schlüssel + Check-Funktion.
                        const binding = fracBindings[`${pth}${lvl}`];
                        const { topKey, botKey, onSubmit, activeStep } = binding;
                        const valTop = inputs[topKey];
                        const valBot = inputs[botKey];
                        const stTop = inputFeedback[topKey];
                        const stBot = inputFeedback[botKey];

                        if (mobileMode) {
                            // Im Mobile-Modus rendern wir den Bruch als REINES SVG (kein
                            // foreignObject). Zwei Gründe:
                            //  1. iOS Safari hat einen Positions-Bug mit foreignObject auf
                            //     kleinen Viewports — Bruch landete dann am falschen Pfad.
                            //     Reines SVG umgeht das vollständig.
                            //  2. Auf Mobile ist der Bruch ohnehin nur ein visueller Anker;
                            //     die eigentliche Eingabe passiert in der großen Bruch-Box unten.
                            // Größe deutlich kleiner: 26 × 32 SVG-Einheiten (vorher 52 × 80).
                            const w = 26, h = 32;
                            const x0 = midX - w / 2;
                            const y0 = midY - h / 2;
                            const keyBase = `a-${pth}${lvl}-${index}`;
                            if (step < activeStep) {
                                // Noch nicht dran — graues Rechteck mit "?".
                                fg.push(<rect key={`${keyBase}-bg`} x={x0} y={y0} width={w} height={h} rx="3" fill="white" stroke="#cbd5e1" strokeWidth="1" />);
                                fg.push(<text key={`${keyBase}-q`} x={midX} y={midY + 4} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#cbd5e1">?</text>);
                            } else {
                                const isActive = step === activeStep;
                                const strokeCol = isActive ? '#fbbf24' : '#22c55e';    // aktiv: amber-pulsierend, fertig: grün
                                const fillCol = isActive ? 'white' : '#ecfdf5';
                                const txtCol = isActive ? '#475569' : '#15803d';
                                fg.push(<rect key={`${keyBase}-bg`} x={x0} y={y0} width={w} height={h} rx="3"
                                    fill={fillCol} stroke={strokeCol} strokeWidth="1.6"
                                    className={isActive ? 'svg-pulse-amber' : ''} />);
                                fg.push(<text key={`${keyBase}-t`} x={midX} y={midY - 5} textAnchor="middle" fontSize="11" fontWeight="bold" fill={txtCol}>{valTop || ''}</text>);
                                fg.push(<line key={`${keyBase}-l`} x1={midX - 9} y1={midY + 1} x2={midX + 9} y2={midY + 1} stroke={txtCol} strokeWidth="1" />);
                                fg.push(<text key={`${keyBase}-b`} x={midX} y={midY + 11} textAnchor="middle" fontSize="11" fontWeight="bold" fill={txtCol}>{valBot || ''}</text>);
                            }
                        } else if (step === activeStep) {
                            // Desktop, aktive Eingabe — leuchtender Glow.
                            fg.push(
                                <foreignObject key={`fo-${pth}${lvl}-${index}`} x={midX - 26} y={midY - 40} width="52" height="80">
                                    <div xmlns="http://www.w3.org/1999/xhtml" className="flex justify-center h-full items-center">
                                        <MiniFractionInput idTop={topKey} idBot={botKey} valTop={valTop} valBot={valBot} onChange={handleInputChange} onSubmit={onSubmit} disabled={false} statusTop={stTop} statusBot={stBot} theme="violet" active={true} />
                                    </div>
                                </foreignObject>
                            );
                        } else if (step > activeStep) {
                            // Desktop, bereits abgehakt — read-only, Häkchen.
                            fg.push(
                                <foreignObject key={`fo-${pth}${lvl}-${index}`} x={midX - 26} y={midY - 40} width="52" height="80">
                                    <div xmlns="http://www.w3.org/1999/xhtml" className="flex justify-center h-full items-center">
                                        <MiniFractionInput idTop={topKey} idBot={botKey} valTop={valTop} valBot={valBot} onChange={()=>{}} disabled={true} statusTop={'correct'} statusBot={'correct'} theme="violet" />
                                    </div>
                                </foreignObject>
                            );
                        } else {
                            // Desktop, noch nicht dran — Fragezeichen-Platzhalter.
                            fg.push(<rect key={`rect-q-${pth}${lvl}-${index}`} x={midX - 18} y={midY - 12} width="36" height="24" fill="white" rx="4" />);
                            fg.push(<text key={`prob-q-${pth}${lvl}-${index}`} x={midX} y={midY + 4} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#cbd5e1">?</text>);
                        }
                    }
                    // Hinweis: Auf den nicht-abgefragten Pfaden werden auch im "Leicht"-Modus
                    // keine Brüche mehr angezeigt — Schüler sollen das selbständig erschließen.

                    walk(child, childX, childY, childWidth, level + 1);
                });
            }

            const fillColor = node.hex || '#e2e8f0';
            const textColor = node.hex ? 'white' : '#1e293b';

            bg.push(
                <circle key={`circle-${level}-${x}-${y}`} cx={x} cy={y} r={nodeRadius} fill={fillColor} stroke="#94a3b8" strokeWidth="2" />
            );
            bg.push(
                <text key={`text-${level}-${x}-${y}`} x={x} y={y + 5} textAnchor="middle" fontSize="12" fontWeight="bold" fill={textColor}>
                    {node.label === 'Start' ? 'S' : node.label.charAt(0).toUpperCase()}
                </text>
            );
        };

        walk(rootNode, rootX, rootY, rootWidth, rootLevel);
        // bg zuerst (Linien, Kreise) → fg darüber (Brüche, Eingabefelder) — saubere Z-Order.
        return [...bg, ...fg];
    };

    return (
        <div className="page-transition max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {showAnim && <CelebrationOverlay />}
            <TrainerHeader theme="violet" icon={DicesIcon} title="Wahrscheinlichkeit" streakIcon={Target} streak={streak} />

            <DifficultyMenu theme="violet" active={difficulty} onChange={handleDifficultyChange} options={[
                {id: 'leicht', label: 'Leicht'},
                {id: 'mittel', label: 'Mittel'},
                {id: 'schwer', label: 'Schwer'},
                {id: 'pruefung', label: 'Prüfungsaufgaben'}
            ]} />

            {/* Lernzielkontrolle + adaptive Schwierigkeits-Empfehlung */}
            {adaptive.stats.mastered.length > 0 && (
                <div className="mb-4 flex justify-center"><MasteryBadge mastered={adaptive.stats.mastered} theme="violet" /></div>
            )}
            <AdaptiveSuggestion suggestion={adaptive.suggestion} onAccept={(d) => handleDifficultyChange(d)} theme="violet" />

            <main className="space-y-6 relative">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-violet-50 px-6 py-3 border-b border-violet-200 flex justify-between items-center">
                        <h2 className="font-semibold text-violet-900 flex items-center"><BookOpen size={18} className="mr-2"/> Sachaufgabe</h2>
                        {problem?.examLabel
                            ? <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-amber-200 text-amber-800">{formatExamLabel(problem.examLabel)}</span>
                            : <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-violet-200 text-violet-800">Baumdiagramm</span>
                        }
                    </div>

                    <div className="p-6 bg-white flex flex-col items-center justify-center text-center">
                        {loading ? <RefreshCw className="w-8 h-8 animate-spin text-violet-400"/> : <p className="text-xl font-medium leading-relaxed">{problem?.text}</p>}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Nach Bestätigung kollabiert die Karte auf eine einzige Titelzeile:
                        "1. Art des Experiments: mit Zurücklegen" — spart komplett den Inhaltsbereich. */}
                    <StepCard title="1. Art des Experiments" stepNum={1} activeCondition={step === 1} pastCondition={step > 1}
                              pastSummary={step > 1 ? `${problem?.type === 'mit' ? 'mit' : 'ohne'} Zurücklegen` : null}
                              currentStep={step} theme="violet">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                            {[{ type: 'mit', label: "Mit Zurücklegen" }, { type: 'ohne', label: "Ohne Zurücklegen" }].map((item) => (
                                <button key={item.type} onClick={() => handleIdentify(item.type)} disabled={step > 1} className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center ${selectedIdentification === item.type ? 'border-violet-500 bg-violet-50 text-violet-900 font-bold' : 'border-slate-200 hover:border-violet-400 bg-white'}`}>
                                    <span className="text-xl font-bold">{item.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                            <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text="Überlege: Verändert sich die Gesamtanzahl nach dem ersten Zug? Wenn jemand etwas aufisst oder 'nicht zurücklegt', ändert sich die Gesamtzahl." />
                            <SubmitBtn onClick={confirmIdentify} theme="violet" disabled={!selectedIdentification} />
                        </div>
                    </StepCard>

                    {step >= 2 && (
                        <StepCard title="2. Wahrscheinlichkeiten im Baumdiagramm" stepNum={2}
                                  activeCondition={step >= STEP.zug1A && step < STEP.result}
                                  pastCondition={step >= STEP.result}
                                  currentStep={step} theme="violet">
                            <div className="text-center text-slate-700 text-lg mb-4">
                                {step === STEP.zug1A && <span>Trage den Bruch für den <strong>ersten Zug</strong>{isMulti ? ' (Pfad A — links)' : ''} im Baumdiagramm ein!</span>}
                                {step === STEP.zug2A && <span>Klasse! Trage jetzt den Bruch für den <strong>zweiten Zug</strong>{isMulti ? ' (Pfad A)' : ''} ein.</span>}
                                {isMulti && step === STEP.zug1B && <span>Super — jetzt der zweite Pfad! Trage den Bruch für den <strong>ersten Zug von Pfad B</strong> ein.</span>}
                                {isMulti && step === STEP.zug2B && <span>Fast geschafft — trage den Bruch für den <strong>zweiten Zug von Pfad B</strong> ein.</span>}
                                {step >= STEP.result && <span>Das Baumdiagramm ist vollständig beschriftet!</span>}
                            </div>

                            {problem?.tree && !loading && (() => {
                                // Dynamische Baum-Breite: bei 2 Hauptknoten enger packen, bei 3
                                // entspannter — damit der ungenutzte Leerraum links/rechts
                                // bei wenigen Farben nicht so groß wird. Bei 3 Farben (Schwer +
                                // Prüfungsaufgaben) braucht der Baum spürbar mehr Breite, sonst
                                // klebt im 2. Zug der gelbe Bruch fast am Nachbarknoten.
                                const numKnoten = problem.tree.children?.length || 3;
                                const treeWidth = numKnoten === 2 ? 340 : 480;
                                const vbWidth = numKnoten === 2 ? 460 : 540;
                                const vbHeight = 250;
                                const treeCenter = vbWidth / 2;
                                const vb = `0 0 ${vbWidth} ${vbHeight}`;
                                return (
                                    <>
                                        {/* Desktop / Tablet (≥ sm): SVG-Baumdiagramm mit foreignObject-Eingaben.
                                            Bei 3 Farben (Schwer + Prüfung) max-w-2xl, sonst max-w-xl —
                                            damit der breitere Baum genug Platz zum Atmen hat.
                                            Explizite Klassennamen statt Template-Literals, damit Tailwind
                                            Play-CDN sie zuverlässig erkennt. */}
                                        <div className="hidden sm:block w-full bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto p-2 shadow-inner animate-fade-in mb-3">
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 text-center">Interaktives Baumdiagramm</h3>
                                            <svg viewBox={vb} className={numKnoten === 2
                                                ? "w-full h-auto min-w-[340px] max-w-xl mx-auto block overflow-visible"
                                                : "w-full h-auto min-w-[400px] max-w-2xl mx-auto block overflow-visible"}>
                                                {renderTree(problem.tree, treeCenter, 20, treeWidth, 0)}
                                            </svg>
                                        </div>

                                        {/* Mobile (< sm): vereinfachtes SVG zur Anzeige + große Bruch-Eingaben darunter.
                                            mobileMode=true: Inputs im Baum sind read-only. Klick IRGENDWO auf
                                            den Baum-Container springt zum aktiven Eingabefeld unten —
                                            besonders praktisch bei kleinen Screens, wo der Bruch im Baum schwer
                                            mit dem Finger zu treffen ist. */}
                                        <div className="sm:hidden w-full bg-slate-50 border border-slate-200 rounded-xl p-2 shadow-inner animate-fade-in mb-3 overflow-x-auto cursor-pointer"
                                             onClick={focusActiveMobileInput}
                                             role="button"
                                             title="Tippe, um zum aktiven Bruch-Eingabefeld zu springen">
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 text-center">Baumdiagramm (Übersicht)</h3>
                                            <svg viewBox={vb} className={numKnoten === 2
                                                ? "w-full h-auto min-w-[300px] block overflow-visible"
                                                : "w-full h-auto min-w-[360px] block overflow-visible"}>
                                                {renderTree(problem.tree, treeCenter, 20, treeWidth, 0, true)}
                                            </svg>
                                        </div>
                                    </>
                                );
                            })()}

                            {/* Mobile-Eingaben: pro Zug eine Box, jeweils nur sichtbar wenn schon
                                erreicht. Die gerade aktive Box bekommt den gelben Glow. */}
                            <div className="sm:hidden bg-violet-50 border border-violet-200 rounded-xl p-4 mb-3">
                                <h4 className="text-sm font-bold text-violet-800 mb-2">{isMulti ? 'Pfad A — 1. Zug' : '1. Zug — Bruch eintragen'}</h4>
                                <div className="flex justify-center">
                                    <FractionInputInteraktiv htmlIdPrefix="mobile-w" idTop="t1" idBot="b1" valTop={inputs.t1} valBot={inputs.b1} onChange={handleInputChange} onSubmit={checkZug1} disabled={step !== STEP.zug1A} statusTop={inputFeedback.t1} statusBot={inputFeedback.b1} theme="violet" active={step === STEP.zug1A} />
                                </div>
                            </div>
                            {step >= STEP.zug2A && (
                                <div className="sm:hidden bg-violet-50 border border-violet-200 rounded-xl p-4 mb-3">
                                    <h4 className="text-sm font-bold text-violet-800 mb-2">{isMulti ? 'Pfad A — 2. Zug' : '2. Zug — Bruch eintragen'}</h4>
                                    <div className="flex justify-center">
                                        <FractionInputInteraktiv htmlIdPrefix="mobile-w" idTop="t2" idBot="b2" valTop={inputs.t2} valBot={inputs.b2} onChange={handleInputChange} onSubmit={checkZug2} disabled={step !== STEP.zug2A} statusTop={inputFeedback.t2} statusBot={inputFeedback.b2} theme="violet" active={step === STEP.zug2A} />
                                    </div>
                                </div>
                            )}
                            {isMulti && step >= STEP.zug1B && (
                                <div className="sm:hidden bg-violet-50 border border-violet-200 rounded-xl p-4 mb-3">
                                    <h4 className="text-sm font-bold text-violet-800 mb-2">Pfad B — 1. Zug</h4>
                                    <div className="flex justify-center">
                                        <FractionInputInteraktiv htmlIdPrefix="mobile-w" idTop="t1B" idBot="b1B" valTop={inputs.t1B} valBot={inputs.b1B} onChange={handleInputChange} onSubmit={checkZug1B} disabled={step !== STEP.zug1B} statusTop={inputFeedback.t1B} statusBot={inputFeedback.b1B} theme="violet" active={step === STEP.zug1B} />
                                    </div>
                                </div>
                            )}
                            {isMulti && step >= STEP.zug2B && (
                                <div className="sm:hidden bg-violet-50 border border-violet-200 rounded-xl p-4 mb-3">
                                    <h4 className="text-sm font-bold text-violet-800 mb-2">Pfad B — 2. Zug</h4>
                                    <div className="flex justify-center">
                                        <FractionInputInteraktiv htmlIdPrefix="mobile-w" idTop="t2B" idBot="b2B" valTop={inputs.t2B} valBot={inputs.b2B} onChange={handleInputChange} onSubmit={checkZug2B} disabled={step !== STEP.zug2B} statusTop={inputFeedback.t2B} statusBot={inputFeedback.b2B} theme="violet" active={step === STEP.zug2B} />
                                    </div>
                                </div>
                            )}

                            {step === STEP.zug1A && <div className="mt-4 flex flex-wrap justify-between items-center gap-2"><TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text="Zähler (oben): Wie viele passende Stücke gibt es? Nenner (unten): Wie viele Stücke sind es insgesamt am Anfang?" /><SubmitBtn onClick={checkZug1} theme="violet" disabled={!inputs.t1 || !inputs.b1} /></div>}

                            {step === STEP.zug2A && <div className="mt-4 flex flex-wrap justify-between items-end gap-2"><TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text={problem.type === 'ohne' ? "Achtung: Es ist EIN Teil insgesamt weniger im Nenner! Und ist im Zähler auch eins weniger oder war es eine andere Farbe?" : "Da es 'mit Zurücklegen' ist, bleibt der Nenner gleich wie beim 1. Zug."} /><SubmitBtn onClick={checkZug2} theme="violet" disabled={!inputs.t2 || !inputs.b2} /></div>}

                            {isMulti && step === STEP.zug1B && <div className="mt-4 flex flex-wrap justify-between items-center gap-2"><TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text="Für den zweiten Pfad: erste Farbe ist jetzt anders. Zähler und Nenner für den 1. Zug von Pfad B." /><SubmitBtn onClick={checkZug1B} theme="violet" disabled={!inputs.t1B || !inputs.b1B} /></div>}

                            {isMulti && step === STEP.zug2B && <div className="mt-4 flex flex-wrap justify-between items-end gap-2"><TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text={problem.type === 'ohne' ? "Letzter Bruch: Pfad B, 2. Zug — wie ist der Nenner? Wie der Zähler?" : "Mit Zurücklegen: der Nenner bleibt der gleiche wie ganz am Anfang."} /><SubmitBtn onClick={checkZug2B} theme="violet" disabled={!inputs.t2B || !inputs.b2B} /></div>}

                            {step >= STEP.result && <SuccessMark text="Alle Brüche im Baumdiagramm sind korrekt eingetragen!" />}
                        </StepCard>
                    )}

                    {step >= STEP.result && (
                        <StepCard title="3. Pfadregel anwenden & Ergebnis" stepNum={3}
                                  activeCondition={step === STEP.result}
                                  pastCondition={step > STEP.result}
                                  currentStep={step} theme="violet">
                            {/* Layout: bei breitem Fenster (lg+) sitzen Eingabezeile und Taschenrechner
                                NEBEN­einander; bei schmal stehen sie UNTER­einander. CalcButton bekommt
                                dafür einen sideBySide-Prop (siehe shared.js). */}
                            <div className="flex flex-col lg:flex-row gap-4 lg:items-start w-full">
                                <div className="flex-1 w-full flex flex-col sm:flex-row gap-3 items-center justify-center">
                                    {/* Bei reihenfolge-Aufgaben: "P_A · P_A + P_B · P_B = …". Bei direkt: nur ein Pfad. */}
                                    <div className="flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-lg font-bold text-slate-700 text-lg flex-wrap justify-center">
                                        <Frac top={inputs.t1} bot={inputs.b1} />
                                        <span>·</span>
                                        <Frac top={inputs.t2} bot={inputs.b2} />
                                        {isMulti && (
                                            <>
                                                <span>+</span>
                                                <Frac top={inputs.t1B} bot={inputs.b1B} />
                                                <span>·</span>
                                                <Frac top={inputs.t2B} bot={inputs.b2B} />
                                            </>
                                        )}
                                        <span>=</span>
                                    </div>
                                    {/* Glow am %-Symbol als Hinweis "Antwort in Prozent eintippen":
                                        — bei Leicht/Mittel sofort sichtbar (Lernhilfe)
                                        — bei Schwer/Prüfung erst nach einem Fehlversuch (didaktischer Hinweis,
                                          dass die Einheit % wichtig sein könnte).
                                        Der Glow sitzt nur um das %-Zeichen herum, nicht um das ganze Eingabefeld. */}
                                    {(() => {
                                        const easyMode = difficulty === 'leicht' || difficulty === 'mittel';
                                        const percentGlow = step === STEP.result && finalFeedback !== 'correct'
                                            && (easyMode || finalFeedback === 'incorrect');
                                        return (
                                            <div className="relative flex-grow max-w-xs w-full">
                                                <input type="text" value={inputs.perc} onChange={(e) => handleInputChange('perc', e.target.value)} onKeyDown={enterToSubmit(checkFinalResult)} disabled={step === STEP.done} placeholder="Taschenrechner..." className={`pr-10 py-3 w-full text-center rounded-lg border-2 text-lg outline-none transition-colors shadow-sm ${finalFeedback === 'correct' ? 'border-green-500 bg-green-50 text-green-900 font-bold' : finalFeedback === 'incorrect' ? 'border-red-400 bg-red-50' : 'border-slate-300 focus:border-violet-500'}`} />
                                                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 font-bold inline-flex items-center justify-center px-1.5 py-0.5 rounded-md ${percentGlow ? 'animate-glow-amber-subtle' : ''}`}>%</span>
                                            </div>
                                        );
                                    })()}
                                    {step === STEP.result && <SubmitBtn onClick={checkFinalResult} theme="violet" disabled={!inputs.perc} />}
                                </div>
                                {step === STEP.result && (
                                    <div className="w-full lg:w-auto lg:flex-shrink-0 flex justify-center lg:justify-start">
                                        <CalcButton theme="violet" />
                                    </div>
                                )}
                            </div>
                            {step === STEP.result && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text={isMulti ? "Erst Pfad A ausrechnen (Zähler·Zähler, Nenner·Nenner), dann Pfad B genauso, anschließend BEIDE Ergebnisse addieren und × 100 für die Prozentzahl." : "Zähler mal Zähler, Nenner mal Nenner. Teile dann das obere Ergebnis durch das untere Ergebnis und multipliziere mit 100 für die Prozentzahl (Runde auf 2 Nachkommastellen oder auf ganze Prozent)."} />}
                            {step > STEP.result && <SuccessMark text="Wahrscheinlichkeit korrekt berechnet!" />}
                        </StepCard>
                    )}

                    {step === STEP.done && (
                        <SuccessBox showSolutionBtn={true} showSolution={showSolution} onToggleSolution={() => setShowSolution(!showSolution)} onNext={generateProblem} solutionText={problem.explanation} theme="violet" nextBtnText={difficulty === 'pruefung' ? 'Nächste Prüfung' : 'Nächste Aufgabe'} />
                    )}
                </div>
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(<WahrscheinlichkeitsTrainer />);
