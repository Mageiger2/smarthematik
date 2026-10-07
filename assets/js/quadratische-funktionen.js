// ==========================================
// quadratische-funktionen.js — Trainer „Quadratische Funktionen“ (Parabeln)
// Wird inline mit shared.js und funktionen-kern.js zusammen kompiliert.
// Der Kern liefert Koordinatensystem, Schritt-Runner, Kachel-Übersicht,
// Themen-Trainer und Prüfungsmodus; hier stehen die Schritt-Bausteine für
// Normalparabeln, die Aufgaben-Generatoren, die Prüfungsaufgaben und die Themen.
// Schreibweise wie im MSA: Normalform y = x² + px + q (bzw. y = −x² + px + q),
// Scheitelpunktform y = (x − x_S)² + y_S, Nullstellen mit der pq-Formel.
// Streak/Adaptiv werden pro Thema gespeichert (smarth_*_quadratische_<thema>).
// Theme-Farbe: fuchsia.
// ==========================================

// Icon: Parabel im Koordinatenkreuz
function ParabelIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="12" y1="22" x2="12" y2="2" strokeWidth="1.2" />
            <line x1="2" y1="17" x2="22" y2="17" strokeWidth="1.2" />
            <path d="M 5 3 Q 12 25 19 3" strokeWidth="2.2" />
        </svg>
    );
}

// ==========================================
// 1. PARABEL-HELFER
// Parabel: { a, b, c, n } mit y = a·x² + b·x + c (a = 1 oder −1: Normalparabel)
// ==========================================
const Pb = (a, b, c, n) => ({ a, b, c, n });
const qfVertex = (P) => ({ x: lfR(-P.b / (2 * P.a)), y: lfR(P.c - (P.b * P.b) / (4 * P.a)) });
const qfFromVertex = (a, xs, ys, n) => ({ a, b: lfR(-2 * a * xs), c: lfR(a * xs * xs + ys), n });
const qfVal = (P, x) => lfR(P.a * x * x + P.b * x + P.c);
const qfOnGrid = (v) => lfSame(v * 2, Math.round(v * 2));

// Normalform als Text: "y = −x² + 4x − 1"
const qfNormS = (P) => 'y = ' + lfSideS([{ c: P.a, v: 'x²' }, { c: P.b, v: 'x' }, { c: P.c, v: '' }].filter((t, i) => i === 0 || lfR(t.c) !== 0));
// Scheitelpunktform als Text: "y = −(x − 2)² + 5"
const qfVertS = (P) => {
    const S = qfVertex(P);
    const sq = S.x === 0 ? 'x²' : `(x ${S.x > 0 ? '−' : '+'} ${lfS(Math.abs(S.x))})²`;
    const tail = S.y === 0 ? '' : ` ${S.y < 0 ? '−' : '+'} ${lfS(Math.abs(S.y))}`;
    return `y = ${P.a < 0 ? '−' : ''}${sq}${tail}`;
};
// Zahl mit Vorzeichen für Eingabefelder, in die das Vorzeichen mit eingetippt wird: "+4", "−2,5"
const qfSg = (v) => (lfR(v) < 0 ? '−' : '+') + lfS(Math.abs(v));
// Text „y = ...“ mit Namen
const qfName = (P, s) => (P.n ? `${P.n}: ${s}` : s);
// JSX-Varianten
const PN = ({ P }) => <span className="font-math whitespace-nowrap">{qfName(P, qfNormS(P))}</span>;
const PV = ({ P }) => <span className="font-math whitespace-nowrap">{qfName(P, qfVertS(P))}</span>;
const pn = (P) => <PN P={P} />;
const pv = (P) => <PV P={P} />;
const fq = (s) => <span className="font-math whitespace-nowrap">{s}</span>;
const qpt = (x, y, n) => ({ x, y, n });
const QF_SIGN_TIP = 'Tippe das Vorzeichen mit ins Feld, z. B. −4 oder +2,5.';

// Koordinatenbereich, der die Parabeln (Scheitel ± 3) und die gegebenen Punkte zeigt
const qfRangeFor = (curves, pts = []) => {
    let xmin = 0, xmax = 0, ymin = 0, ymax = 0;
    const add = (x, y) => { xmin = Math.min(xmin, x); xmax = Math.max(xmax, x); ymin = Math.min(ymin, y); ymax = Math.max(ymax, y); };
    curves.forEach(g => {
        if (g.a === undefined) return;
        const S = qfVertex(g);
        add(S.x, S.y);
        add(S.x - 2.5, qfVal(g, S.x - 2.5)); add(S.x + 2.5, qfVal(g, S.x + 2.5));
    });
    pts.forEach(p => add(p.x, p.y));
    const r = [Math.floor(xmin - 1), Math.ceil(xmax + 1), Math.floor(ymin - 1), Math.ceil(ymax + 1)];
    if (r[1] - r[0] > 20) { r[0] = Math.max(r[0], -12); r[1] = Math.min(r[1], 12); }
    if (r[3] - r[2] > 22) { r[2] = Math.max(r[2], -14); r[3] = Math.min(r[3], 14); }
    return r;
};

// ==========================================
// 2. SCHRITT-BAUSTEINE FÜR PARABELN
// ==========================================
const Q = {};

// Öffnung auswählen
Q.opening = (a, name = 'die Parabel') => S.select(`Wie ist ${name} geöffnet?`,
    [<span>nach oben (<span className="font-math"><V>y</V> = <V>x</V>² …</span>)</span>, <span>nach unten (<span className="font-math"><V>y</V> = −<V>x</V>² …</span>)</span>],
    a > 0 ? 0 : 1, 'Steht vor dem x² ein Minus, ist die Parabel nach unten geöffnet. Am Graphen: Der Scheitel ist der höchste Punkt → nach unten.', a > 0 ? 'nach oben' : 'nach unten', true);

// Scheitelpunkt eintragen
Q.vertexPt = (xs, ys, name = 'S', goal) => ({
    type: 'fill', goal: goal || `Gib den Scheitelpunkt ${name} an.`,
    inputs: [{ id: 'x', correct: xs }, { id: 'y', correct: ys }],
    render: (h) => <LfZeile>{name}( {h.input('x')} | {h.input('y')} )</LfZeile>,
    hint: 'In der Scheitelpunktform y = (x − x_S)² + y_S: Das Vorzeichen in der Klammer dreht sich um! (x + 2)² gehört zu x_S = −2.',
    solution: `${name}(${lfS(xs)} | ${lfS(ys)})`
});

// Scheitelpunktform eintragen: y = ±(x [d])² [e]
Q.vertForm = (a, xs, ys, name, goal) => ({
    type: 'fill', goal: goal || `Gib die Scheitelpunktform${name ? ' von ' + name : ''} an.`,
    inputs: [{ id: 'd', correct: lfR(-xs) }, { id: 'e', correct: ys }],
    render: (h) => <LfZeile>{name && <span className="mr-1">{name}:</span>}<V>y</V> = {a < 0 ? '−' : ''}(<V>x</V> {h.input('d', 'w-20', '±')})² {h.input('e', 'w-20', '±')}</LfZeile>,
    summary: (v) => `y = ${a < 0 ? '−' : ''}(x ${v.d})² ${v.e}`,
    hint: `Scheitelpunktform: y = ${a < 0 ? '−' : ''}(x − x_S)² + y_S. Beim Scheitel S(${lfS(xs)} | ${lfS(ys)}) steht in der Klammer „x ${qfSg(-xs)}“. ${QF_SIGN_TIP}`,
    solution: qfVertS(qfFromVertex(a, xs, ys))
});

// Normalform eintragen: y = ±x² [p]x [q]
Q.normForm = (P, goal, hint) => ({
    type: 'fill', goal: goal || `Gib die Normalform${P.n ? ' von ' + P.n : ''} an.`,
    inputs: [{ id: 'b', correct: P.b }, { id: 'c', correct: P.c }],
    render: (h) => <LfZeile>{P.n && <span className="mr-1">{P.n}:</span>}<V>y</V> = {P.a < 0 ? '−' : ''}<V>x</V>² {h.input('b', 'w-20', '±')}<V>x</V> {h.input('c', 'w-20', '±')}</LfZeile>,
    summary: (v) => `y = ${P.a < 0 ? '−' : ''}x² ${v.b}x ${v.c}`,
    hint: hint || `Fasse zusammen und schreibe die Normalform y = ${P.a < 0 ? '−' : ''}x² + px + q. Steht kein x-Term da, trägst du 0 ein. ${QF_SIGN_TIP}`,
    solution: qfNormS(P)
});

// Scheitelpunkt → Normalform (binomische Formel ausmultiplizieren)
Q.normFromVertex = (a, xs, ys, name, opts = {}) => {
    const P = qfFromVertex(a, xs, ys, name);
    const steps = [];
    if (!opts.given) steps.push(Q.vertForm(a, xs, ys, name, 'Setze den Scheitelpunkt in die Scheitelpunktform ein.'));
    steps.push({
        type: 'fill', goal: 'Multipliziere die Klammer mit der binomischen Formel aus.',
        inputs: [{ id: 'p', correct: lfR(-2 * xs) }, { id: 'q', correct: lfR(xs * xs) }],
        render: (h) => <LfZeile><V>y</V> = {a < 0 ? '−' : ''}(<V>x</V>² {h.input('p', 'w-20', '±')}<V>x</V> {h.input('q', 'w-20', '±')}){ys !== 0 && <> {ys < 0 ? '−' : '+'} {lfS(Math.abs(ys))}</>}</LfZeile>,
        summary: (v) => `y = ${a < 0 ? '−' : ''}(x² ${v.p}x ${v.q}) ${ys < 0 ? '−' : '+'} ${lfS(Math.abs(ys))}`,
        hint: `(x ${qfSg(-xs)})² = x² ${qfSg(-2 * xs)}x + ${lfS(xs * xs)} (1. bzw. 2. binomische Formel: 2 · x · ${lfS(Math.abs(xs))} und ${lfS(Math.abs(xs))}²).`,
        solution: `y = ${a < 0 ? '−' : ''}(x² ${qfSg(-2 * xs)}x + ${lfS(xs * xs)}) ${ys < 0 ? '−' : '+'} ${lfS(Math.abs(ys))}`
    });
    steps.push(Q.normForm(P, `Löse ${a < 0 ? 'die Klammer auf (Minus davor: Vorzeichen drehen!)' : 'die Klammer auf'} und fasse zusammen.`,
        a < 0 ? `Das Minus vor der Klammer dreht alle Vorzeichen in der Klammer. Dann die Zahlen zusammenfassen. ${QF_SIGN_TIP}` : `Klammer weglassen und die beiden Zahlen zusammenfassen. ${QF_SIGN_TIP}`));
    return steps;
};

// Normalform → Scheitelpunktform (quadratische Ergänzung)
Q.vertexFromNorm = (P, sName = 'S', opts = {}) => {
    const S0 = qfVertex(P);
    const steps = [];
    const bb = P.a > 0 ? P.b : lfR(-P.b);   // p in der Klammer
    if (P.a < 0) {
        steps.push({
            type: 'fill', goal: 'Klammere −1 bei den x-Termen aus.',
            inputs: [{ id: 'p', correct: bb }],
            render: (h) => <LfZeile><V>y</V> = −(<V>x</V>² {h.input('p', 'w-20', '±')}<V>x</V>){P.c !== 0 && <> {P.c < 0 ? '−' : '+'} {lfS(Math.abs(P.c))}</>}</LfZeile>,
            summary: (v) => `y = −(x² ${v.p}x) ${P.c < 0 ? '−' : '+'} ${lfS(Math.abs(P.c))}`,
            hint: 'Beim Ausklammern von −1 dreht sich das Vorzeichen des x-Terms um.',
            solution: `y = −(x² ${qfSg(bb)}x) ${P.c < 0 ? '−' : '+'} ${lfS(Math.abs(P.c))}`
        });
    }
    steps.push(S.calc('Berechne die quadratische Ergänzung (p : 2)².', <span className="font-math">(<V>p</V> : 2)²</span>, lfR((bb / 2) * (bb / 2)),
        `p = ${lfS(bb)}. Halbiere p (${lfS(bb / 2)}) und quadriere das Ergebnis.`, `(${lfS(bb)} : 2)² = ${lfS((bb / 2) * (bb / 2))}`));
    steps.push(Q.vertForm(P.a, S0.x, S0.y, P.n, 'Schreibe die Scheitelpunktform auf.'));
    const vf = steps[steps.length - 1];
    vf.hint = P.a > 0
        ? `y = x² ${qfSg(P.b)}x + ${lfS((bb / 2) ** 2)} − ${lfS((bb / 2) ** 2)} ${qfSg(P.c)} = (x ${qfSg(bb / 2)})² ${qfSg(P.c - (bb / 2) ** 2)}. ${QF_SIGN_TIP}`
        : `y = −(x² ${qfSg(bb)}x + ${lfS((bb / 2) ** 2)} − ${lfS((bb / 2) ** 2)}) ${qfSg(P.c)} = −(x ${qfSg(bb / 2)})² ${qfSg(P.c + (bb / 2) ** 2)}. Achtung: Die abgezogene Ergänzung wird durch das Minus vor der Klammer zu „+“. ${QF_SIGN_TIP}`;
    if (!opts.noPoint) steps.push(Q.vertexPt(S0.x, S0.y, sName));
    return steps;
};

// pq-Formel für x² + px + q = 0 (ab der Wurzel)
Q.pqCore = (p, q, xNames = ['x₁', 'x₂'], opts = {}) => {
    const D = lfR((p / 2) * (p / 2) - q);
    const steps = [];
    steps.push(S.calc('Berechne den Wert unter der Wurzel: (p : 2)² − q.', <span className="font-math">(<V>p</V> : 2)² − <V>q</V></span>, D,
        `pq-Formel: x = −p : 2 ± √((p : 2)² − q). Hier: (${lfS(p)} : 2)² − ${lfP(q)} = ${lfS((p / 2) ** 2)} − ${lfP(q)}.`, `(${lfS(p / 2)})² − ${lfP(q)} = ${lfS(D)}`));
    const cnt = D < -1e-9 ? 0 : Math.abs(D) < 1e-9 ? 1 : 2;
    steps.push(S.select(opts.countGoal || 'Wie viele Lösungen gibt es?', [<span>keine Lösung (Wert unter der Wurzel negativ)</span>, <span>genau eine Lösung (Wert unter der Wurzel = 0)</span>, <span>zwei Lösungen (Wert unter der Wurzel positiv)</span>],
        cnt, 'Ist der Wert unter der Wurzel negativ, gibt es keine Lösung. Ist er 0, gibt es genau eine. Ist er positiv, gibt es zwei.', ['keine Lösung', 'genau eine Lösung', 'zwei Lösungen'][cnt], true));
    if (cnt === 1) {
        steps.push(S.calc('Berechne die Lösung.', <V>x</V>, lfR(-p / 2), `x = −p : 2 = ${lfS(-p / 2)}`, `x = ${lfS(-p / 2)}`));
    } else if (cnt === 2) {
        const r = Math.sqrt(D), x1 = lfR(-p / 2 + r), x2 = lfR(-p / 2 - r);
        steps.push({
            type: 'fill', goal: 'Berechne die beiden Lösungen.',
            inputs: [{ id: 'x1', correct: x1 }, { id: 'x2', correct: x2 }],
            altSets: [{ x1: x2, x2: x1 }],
            render: (h) => <LfZeile>{xNames[0]} = {h.input('x1')} <span className="mx-3">und</span> {xNames[1]} = {h.input('x2')}</LfZeile>,
            hint: `x = ${lfS(-p / 2)} ± √${lfS(D)} = ${lfS(-p / 2)} ± ${lfS(r)}. Die Reihenfolge ist egal.`,
            solution: `${xNames[0]} = ${lfS(x1)}; ${xNames[1]} = ${lfS(x2)}`
        });
    }
    return steps;
};

// Gleichung x² + px + q = 0 aufstellen (ggf. nach Multiplikation mit −1)
Q.eqStep = (p, q, goal, hint) => ({
    type: 'fill', goal,
    inputs: [{ id: 'p', correct: p }, { id: 'q', correct: q }],
    render: (h) => <LfZeile>0 = <V>x</V>² {h.input('p', 'w-20', '±')}<V>x</V> {h.input('q', 'w-20', '±')}</LfZeile>,
    summary: (v) => `0 = x² ${v.p}x ${v.q}`,
    hint: `${hint} ${QF_SIGN_TIP}`,
    solution: `0 = x² ${qfSg(p)}x ${qfSg(q)}`
});

// Nullstellen einer Parabel
Q.zeros = (P, names = ['x₁', 'x₂']) => {
    const p = P.a > 0 ? P.b : lfR(-P.b), q = P.a > 0 ? P.c : lfR(-P.c);
    return [
        Q.eqStep(p, q, P.a > 0 ? 'Setze y = 0.' : 'Setze y = 0 und multipliziere mit (−1).',
            P.a > 0 ? 'An den Nullstellen ist y = 0. Die rechte Seite bleibt gleich.' : 'Für die pq-Formel muss vor x² eine 1 stehen: Multipliziere jede Zahl mit (−1).'),
        ...Q.pqCore(p, q, names, { countGoal: 'Wie viele Nullstellen gibt es?' })
    ];
};

// Punktprobe / fehlende Koordinaten
Q.valueAt = (P, x, goal) => S.calc(goal || `Setze x = ${lfS(x)} in ${P.n || 'die Gleichung'} ein.`, <V>y</V>, qfVal(P, x),
    `y = ${P.a < 0 ? '−' : ''}${lfP(x)}² ${qfSg(P.b)} · ${lfP(x)} ${qfSg(P.c)}. Achtung: ${lfP(x)}² = ${lfS(x * x)}${P.a < 0 ? `, mit dem Minus davor also −${lfS(x * x)}` : ''}.`,
    `y = ${lfS(qfVal(P, x))}`);
Q.probe = (P, Pt) => {
    const on = lfSame(qfVal(P, Pt.x), Pt.y);
    return [
        Q.valueAt(P, Pt.x, `Setze x = ${lfS(Pt.x)} in ${P.n || 'die Gleichung'} ein und berechne y.`),
        S.select(`Liegt ${Pt.n} auf ${P.n || 'der Parabel'}?`, [<span>Ja — der y-Wert stimmt überein.</span>, <span>Nein — der y-Wert ist ein anderer.</span>], on ? 0 : 1,
            `Vergleiche den berechneten y-Wert mit der y-Koordinate ${lfS(Pt.y)} von ${Pt.n}.`, on ? `${Pt.n} liegt auf ${P.n || 'der Parabel'}.` : `${Pt.n} liegt nicht auf ${P.n || 'der Parabel'} (y = ${lfS(qfVal(P, Pt.x))}).`, true)
    ];
};
Q.missingX = (P, y) => {
    const p = P.a > 0 ? P.b : lfR(-P.b), q = P.a > 0 ? lfR(P.c - y) : lfR(-(P.c - y));
    return [
        Q.eqStep(p, q, `Setze y = ${lfS(y)} ein und bringe alles auf eine Seite.`, `${lfS(y)} = ${qfNormS(P).slice(4)} | ${y < 0 ? '+ ' + lfS(-y) : '− ' + lfS(y)}${P.a < 0 ? ', danach · (−1)' : ''}.`),
        ...Q.pqCore(p, q)
    ];
};

// Parabel aus zwei Punkten (lineares Gleichungssystem für p und q)
Q.twoPoints = (a, A, B, name) => {
    const rA = lfR(A.y - a * A.x * A.x), rB = lfR(B.y - a * B.x * B.x);
    const p = lfR((rA - rB) / (A.x - B.x)), q = lfR(rA - p * A.x);
    const eq = (P, r, tag) => ({
        type: 'fill', goal: `Setze ${P.n} in y = ${a < 0 ? '−' : ''}x² + px + q ein und fasse zusammen (${tag}).`,
        inputs: [{ id: 'k', correct: P.x }, { id: 'r', correct: r }],
        render: (h) => <LfZeile>({tag}) {h.input('k', 'w-16')} · <V>p</V> + <V>q</V> = {h.input('r')}</LfZeile>,
        summary: (v) => `(${tag}) ${v.k}p + q = ${v.r}`,
        hint: `${lfS(P.y)} = ${a < 0 ? '−' : ''}(${lfS(P.x)})² + ${lfP(P.x)} · p + q. Bringe die Zahl ${a < 0 ? '−' : ''}${lfS(P.x * P.x)} auf die linke Seite.`,
        solution: `(${tag}) ${lfS(P.x)}p + q = ${lfS(r)}`
    });
    return [
        eq(A, rA, 'I'),
        eq(B, rB, 'II'),
        S.calc('Subtrahiere (I) − (II) und berechne p.', <V>p</V>, p, `(I) − (II): ${lfS(A.x - B.x)} · p = ${lfS(rA - rB)}. Das q fällt weg.`, `p = ${lfS(rA - rB)} : ${lfP(A.x - B.x)} = ${lfS(p)}`),
        S.calc('Setze p in (I) ein und berechne q.', <V>q</V>, q, `${lfP(A.x)} · ${lfP(p)} + q = ${lfS(rA)}.`, `q = ${lfS(q)}`),
        Q.normForm(Pb(a, p, q, name))
    ];
};

// y-Werte zu gegebenen x-Werten eintragen (Schnittpunkte)
Q.yValues = (P, xs, goal) => ({
    type: 'fill', goal: goal || 'Berechne die zugehörigen y-Werte.',
    inputs: xs.map((x, i) => ({ id: 'y' + i, correct: fkEval(P, x) })),
    render: (h) => <LfZeile><span className="flex flex-col gap-2 items-start">{xs.map((x, i) => <span key={i}>für <V>x</V> = {lfS(x)}: <V>y</V> = {h.input('y' + i)}</span>)}</span></LfZeile>,
    summary: (v) => xs.map((x, i) => `(${lfS(x)} | ${v['y' + i]})`).join(', '),
    hint: `Setze die x-Werte in ${P.n ? P.n : 'eine der Gleichungen'} ein${P.a === undefined ? '' : ' (am einfachsten in die Gerade)'}.`,
    solution: xs.map(x => `(${lfS(x)} | ${lfS(fkEval(P, x))})`).join('; ')
});

// Schnittpunkte Parabel–Parabel oder Parabel–Gerade
// P1: Parabel; G: Parabel { a, b, c } oder Gerade { m, t }
Q.intersect = (P1, G, opts = {}) => {
    const isLine = G.a === undefined;
    const A = lfR(P1.a - (isLine ? 0 : G.a)), B = lfR(P1.b - (isLine ? G.m : G.b)), C = lfR(P1.c - (isLine ? G.t : G.c));
    const steps = [{
        type: 'fill', goal: 'Setze die Terme gleich und bringe alles auf eine Seite.',
        inputs: [{ id: 'A', correct: A }, { id: 'B', correct: B }, { id: 'C', correct: C }],
        altSets: [{ A: lfR(-A), B: lfR(-B), C: lfR(-C) }],
        render: (h) => <LfZeile>0 = {h.input('A', 'w-16', '±')}<V>x</V>² {h.input('B', 'w-20', '±')}<V>x</V> {h.input('C', 'w-20', '±')}</LfZeile>,
        summary: (v) => `0 = ${v.A}x² ${v.B}x ${v.C}`,
        hint: `${qfNormS(P1).slice(4)} = ${isLine ? lfGlS(G.m, G.t).slice(4) : qfNormS(G).slice(4)}. Bringe alle Terme auf die linke Seite${A === 0 ? ' — die x² fallen dabei weg (0 eintragen)' : ''}. ${QF_SIGN_TIP}`,
        solution: `0 = ${lfS(A)}x² ${qfSg(B)}x ${qfSg(C)}`
    }];
    const ref = isLine ? G : P1;
    if (A === 0) {
        const x = lfR(-C / B);
        steps.push(S.calc('Löse die Gleichung nach x auf.', <V>x</V>, x, `${lfS(B)}x ${qfSg(C)} = 0 → x = ${lfS(-C)} : ${lfP(B)}.`, `x = ${lfS(x)}`));
        steps.push(Q.yValues(ref, [x]));
        return steps;
    }
    const p = lfR(B / A), q = lfR(C / A);
    if (A !== 1) {
        steps.push(Q.eqStep(p, q, A === -1 ? 'Multipliziere mit (−1).' : `Teile durch ${lfS(A)}.`, A === -1 ? 'Vor x² muss eine 1 stehen: Alle Vorzeichen drehen.' : `Teile jede Zahl durch ${lfS(A)}, damit vor x² eine 1 steht.`));
    }
    const D = lfR((p / 2) ** 2 - q);
    steps.push(...Q.pqCore(p, q, ['x₁', 'x₂'], { countGoal: 'Wie viele Schnittpunkte gibt es?' }));
    if (D > 1e-9) {
        const r = Math.sqrt(D);
        steps.push(Q.yValues(ref, [lfR(-p / 2 - r), lfR(-p / 2 + r)].sort((u, w) => u - w)));
    } else if (Math.abs(D) < 1e-9) {
        steps.push(Q.yValues(ref, [lfR(-p / 2)], 'Berechne den y-Wert des Berührpunkts.'));
    }
    return steps;
};

// Parabel zeichnen: Scheitel setzen, dann mit der Schablone zwei weitere Punkte
const qfOnCurve = (g) => (p) => lfSame(fkEval(g, p.x), p.y, 1e-4);
Q.draw = (P, range, prev = []) => {
    const S0 = qfVertex(P);
    const lbl = P.n || 'die Parabel';
    if (qfOnGrid(S0.x) && qfOnGrid(S0.y)) {
        return [
            {
                type: 'points', count: 1, check: (p) => lfSame(p.x, S0.x) && lfSame(p.y, S0.y),
                goal: `Zeichne ${lbl}: Markiere zuerst den Scheitelpunkt.`,
                graph: { range, lines: prev }, line: P,
                hint: `Aus der Scheitelpunktform ${qfVertS(P)} liest du S(${lfS(S0.x)} | ${lfS(S0.y)}) ab.`,
                solution: `S(${lfS(S0.x)} | ${lfS(S0.y)})`
            },
            {
                type: 'points', count: 2, check: (p) => qfOnCurve(P)(p) && !(lfSame(p.x, S0.x) && lfSame(p.y, S0.y)),
                goal: `Setze zwei weitere Punkte von ${lbl} (Schablone).`,
                graph: { range, lines: prev, points: [{ x: S0.x, y: S0.y, color: '#16a34a' }] }, line: P,
                hint: `Normalparabel-Schablone: Vom Scheitel 1 nach rechts und 1 nach ${P.a > 0 ? 'oben' : 'unten'}, 2 nach rechts und 4 nach ${P.a > 0 ? 'oben' : 'unten'} — nach links genauso.`,
                solution: `z. B. (${lfS(S0.x - 1)} | ${lfS(S0.y + P.a)}) und (${lfS(S0.x + 1)} | ${lfS(S0.y + P.a)})`
            }
        ];
    }
    // Scheitel liegt nicht auf dem Raster: drei Punkte der Parabel setzen
    return [{
        type: 'points', count: 3, check: qfOnCurve(P),
        goal: `Zeichne ${lbl}: Setze drei Punkte der Parabel.`,
        graph: { range, lines: prev }, line: P,
        hint: `Der Scheitel S(${lfS(S0.x)} | ${lfS(S0.y)}) liegt zwischen den Kästchen. Berechne mit einer Wertetabelle Punkte mit ganzzahligem x, z. B. x = ${lfS(Math.round(S0.x))}: y = ${lfS(qfVal(P, Math.round(S0.x)))}.`,
        solution: [Math.round(S0.x) - 1, Math.round(S0.x), Math.round(S0.x) + 1].map(x => `(${lfS(x)} | ${lfS(qfVal(P, x))})`).join(', ')
    }];
};
// Gerade zeichnen (zwei Punkte)
Q.drawLine = (g, range, prev = []) => ({
    type: 'points', count: 2, check: qfOnCurve(g),
    goal: `Zeichne ${g.n || 'die Gerade'}: Setze zwei Punkte der Geraden.`,
    graph: { range, lines: prev }, line: g,
    hint: `${lfGlS(g.m, g.t)}: Starte bei (0 | ${lfS(g.t)}) und gehe mit der Steigung ${lfS(g.m)} weiter (1 nach rechts, ${lfS(Math.abs(g.m))} nach ${g.m >= 0 ? 'oben' : 'unten'}).`,
    solution: `z. B. (0 | ${lfS(g.t)}) und (1 | ${lfS(g.m + g.t)})`
});
Q.drawAll = (curves, range) => {
    const steps = [];
    curves.forEach((g, i) => { steps.push(...(g.a === undefined ? [Q.drawLine(g, range, curves.slice(0, i))] : Q.draw(g, range, curves.slice(0, i)))); });
    return steps;
};

// Spiegeln an einer Achse → neuer Scheitel + Scheitelpunktform
Q.mirror = (P, axis, name) => {
    const S0 = qfVertex(P);
    const a2 = axis === 'x' ? -P.a : P.a;
    const S2 = axis === 'x' ? { x: S0.x, y: lfR(-S0.y) } : { x: lfR(-S0.x), y: S0.y };
    return [
        Q.vertexPt(S2.x, S2.y, `S'`, `Bestimme den Scheitelpunkt nach der Spiegelung an der ${axis}-Achse.`),
        Q.opening(a2, name || 'die gespiegelte Parabel'),
        Q.vertForm(a2, S2.x, S2.y, name)
    ].map((s, i) => i === 0 ? { ...s, hint: axis === 'x' ? `Spiegelung an der x-Achse: Die y-Koordinate wechselt das Vorzeichen, die Öffnung dreht sich. S(${lfS(S0.x)} | ${lfS(S0.y)}) → S'(${lfS(S2.x)} | ${lfS(S2.y)}).` : `Spiegelung an der y-Achse: Die x-Koordinate wechselt das Vorzeichen, die Öffnung bleibt. S(${lfS(S0.x)} | ${lfS(S0.y)}) → S'(${lfS(S2.x)} | ${lfS(S2.y)}).` } : s);
};

// Funktionsgleichung einer Normalparabel aus dem Graphen
Q.readGraph = (a, xs, ys, name, toNorm = true, sName = 'S') => [
    Q.vertexPt(xs, ys, sName, `Lies den Scheitelpunkt ${sName} ab.`),
    Q.opening(a, name),
    ...(toNorm ? Q.normFromVertex(a, xs, ys, name) : [Q.vertForm(a, xs, ys, name)])
].map((s, i) => i === 0 ? { ...s, hint: 'Der Scheitelpunkt ist der tiefste (nach oben geöffnet) bzw. höchste Punkt (nach unten geöffnet) der Parabel.' } : s);

// ==========================================
// 3. ZUFALLS-GENERATOREN PRO THEMA
// ==========================================
const QF_INT = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
const QF_HALF = [-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5];
const qfSign = () => (Math.random() < 0.5 ? 1 : -1);

// Zufällige Parabel über den Scheitelpunkt
const qfRandVertex = (a, xPool, yPool, n = 'p') => qfFromVertex(a, lfPick(xPool), lfPick(yPool), n);
// Parabel mit zwei „schönen“ Nullstellen
const qfFromRoots = (a, x1, x2, n = 'p') => ({ a, b: lfR(-a * (x1 + x2)), c: lfR(a * x1 * x2), n });

const QGEN = {};

// 1. Wertetabelle & Punktprobe
QGEN.wertetabelle = (level, forbidden) => {
    if (level === 'leicht') {
        const P = qfRandVertex(1, [-2, -1, 0, 1, 2], [-3, -2, -1, 0, 1, 2]);
        const S0 = qfVertex(P);
        const xs = [-2, -1, 0, 1, 2].map(k => S0.x + k);
        return {
            typeId: 1, title: 'Wertetabelle einer Parabel',
            desc: <>Fülle die Wertetabelle für die Parabel {pn(P)} aus.</>,
            steps: [{
                type: 'fill', goal: 'Berechne die fehlenden y-Werte.',
                inputs: xs.map((x, i) => ({ id: 'y' + i, correct: qfVal(P, x) })),
                render: (h) => <LfTabelle xs={xs.map(x => lfS(x))} ys={xs.map((x, i) => h.input('y' + i, 'w-16'))} />,
                summary: (v) => xs.map((x, i) => `(${lfS(x)} | ${v['y' + i] || '?'})`).join(', '),
                hint: `Setze jeden x-Wert ein. Beispiel x = ${lfS(xs[0])}: y = (${lfS(xs[0])})² ${qfSg(P.b)} · ${lfP(xs[0])} ${qfSg(P.c)} = ${lfS(qfVal(P, xs[0]))}.`,
                solution: xs.map(x => `(${lfS(x)} | ${lfS(qfVal(P, x))})`).join('; ')
            }],
            finalGraph: { range: qfRangeFor([P]), lines: [P], points: xs.map(x => ({ x, y: qfVal(P, x) })) }
        };
    }
    if (level === 'mittel') {
        const type = lfChooseType([2, 3], forbidden);
        const P = qfRandVertex(qfSign(), QF_INT, [-5, -3, -1, 2, 4, 6]);
        if (type === 3) {
            const x = lfPick([-7, -5, -4, 5, 6, 8, 10]);
            return { typeId: 3, title: 'Fehlende y-Koordinate', desc: <>Der Punkt C({lfS(x)} | <V>y</V>) liegt auf der Parabel {pn(P)}. Berechne die fehlende y-Koordinate.</>, steps: [Q.valueAt(P, x)] };
        }
        const x = lfPick([-4, -3, -2, 2, 3, 5]);
        const on = Math.random() < 0.5;
        const T = qpt(x, lfR(qfVal(P, x) + (on ? 0 : lfPick([-2, 2, 4, -6]))), 'A');
        return { typeId: 2, title: 'Punktprobe', desc: <>Überprüfe rechnerisch, ob der Punkt {lfPt(T)} auf der Parabel {pn(P)} liegt.</>, steps: Q.probe(P, T) };
    }
    // schwer: fehlende x-Koordinaten (quadratische Gleichung)
    const x1 = lfRand(-5, 1), x2 = x1 + lfRand(2, 6);
    const k = lfPick([3, 5, 6, 8, -2]);
    const P = Pb(1, lfR(-(x1 + x2)), lfR(x1 * x2 + k), 'p');
    return {
        typeId: 4, title: 'Fehlende x-Koordinaten',
        desc: <>Die Punkte B(<V>x</V><sub>B</sub> | {lfS(k)}) und C(<V>x</V><sub>C</sub> | {lfS(k)}) liegen auf der Parabel {pn(P)}. Berechne die fehlenden x-Koordinaten.</>,
        steps: Q.missingX(P, k),
        finalGraph: { range: qfRangeFor([P], [qpt(x1, k), qpt(x2, k)]), lines: [P], points: [qpt(x1, k, 'B'), qpt(x2, k, 'C')] }
    };
};

// 2. Scheitelpunkt & Öffnung
QGEN.scheitel = (level, forbidden) => {
    if (level === 'leicht') {
        const a = qfSign();
        const P = qfRandVertex(a, QF_INT, QF_INT, 'p');
        const S0 = qfVertex(P);
        return { typeId: 1, title: 'Scheitelpunkt ablesen', desc: <>Gegeben ist die Parabel {pv(P)}. Gib ihre Öffnung und ihren Scheitelpunkt an.</>, steps: [Q.opening(a, 'p'), Q.vertexPt(S0.x, S0.y)] };
    }
    const a = qfSign();
    const xs = lfPick([-3, -2, -1, 1, 2, 3]), ys = lfPick([-4, -3, -2, -1, 1, 2, 3, 4]);
    const P = qfFromVertex(a, xs, ys, 'p');
    return {
        typeId: level === 'mittel' ? 2 : 3, title: level === 'mittel' ? 'Scheitelpunktform aus dem Graphen' : 'Normalform aus dem Graphen',
        desc: <>Die Abbildung zeigt die Normalparabel p. Bestimme {level === 'mittel' ? 'ihre Scheitelpunktform' : 'ihre Funktionsgleichung in der Normalform'}.</>,
        graph: { range: qfRangeFor([P]), lines: [P] },
        steps: Q.readGraph(a, xs, ys, 'p', level !== 'mittel')
    };
};

// 3. Parabel zeichnen
QGEN.zeichnen = (level, forbidden) => {
    const a = level === 'leicht' ? 1 : qfSign();
    const P = qfRandVertex(a, level === 'leicht' ? [-2, -1, 0, 1, 2] : QF_INT, level === 'leicht' ? [-3, -2, -1, 0, 1, 2] : [-3, -2, -1, 1, 2, 3], 'p');
    const range = qfRangeFor([P]);
    if (level === 'schwer') {
        return { typeId: 3, title: 'Erst Scheitel berechnen, dann zeichnen', desc: <>Zeichne die Parabel {pn(P)}. Bestimme dazu zuerst den Scheitelpunkt.</>, steps: [...Q.vertexFromNorm(P), ...Q.draw(P, range)], finalGraph: { range, lines: [P] } };
    }
    return { typeId: level === 'leicht' ? 1 : 2, title: 'Parabel zeichnen', desc: <>Zeichne die Parabel {pv(P)} in das Koordinatensystem.</>, steps: Q.draw(P, range), finalGraph: { range, lines: [P] } };
};

// 4. Scheitelpunktform → Normalform
QGEN.normalform = (level, forbidden) => {
    const a = level === 'leicht' ? 1 : qfSign();
    const xs = level === 'schwer' ? lfPick(QF_HALF) : lfPick([-4, -3, -2, -1, 1, 2, 3, 4]);
    const ys = level === 'schwer' ? lfPick([-3, -2.5, -1, 0.5, 2, 4.25, 6]) : lfPick([-5, -3, -2, -1, 1, 2, 4]);
    const P = qfFromVertex(a, xs, ys, 'p');
    return {
        typeId: level, title: 'Normalform aus dem Scheitelpunkt',
        desc: <>Die nach {a > 0 ? 'oben' : 'unten'} geöffnete Normalparabel p hat den Scheitelpunkt S({lfS(xs)} | {lfS(ys)}). Ermittle rechnerisch ihre Funktionsgleichung in der Normalform.</>,
        steps: Q.normFromVertex(a, xs, ys, 'p'),
        finalGraph: { range: qfRangeFor([P]), lines: [P], points: [qpt(xs, ys, 'S')] }
    };
};

// 5. Normalform → Scheitelpunktform
QGEN.scheitelform = (level, forbidden) => {
    const a = level === 'schwer' ? -1 : 1;
    const xs = level === 'leicht' ? lfPick([-4, -3, -2, -1, 1, 2, 3, 4]) : lfPick(QF_HALF);
    const ys = level === 'leicht' ? lfPick([-5, -3, -2, -1, 1, 2, 4]) : lfPick([-4, -2.25, -1, 2, 3, 6.25]);
    const P = qfFromVertex(a, xs, ys, 'p');
    return {
        typeId: level, title: 'Scheitelpunktform bestimmen',
        desc: <>Gegeben ist die Parabel {pn(P)}. Bestimme rechnerisch ihre Scheitelpunktform und gib den Scheitelpunkt S an.</>,
        steps: Q.vertexFromNorm(P),
        finalGraph: { range: qfRangeFor([P]), lines: [P], points: [qpt(xs, ys, 'S')] }
    };
};

// 6. Quadratische Gleichungen & Nullstellen
QGEN.nullstellen = (level, forbidden) => {
    if (level === 'leicht') {
        const x1 = lfRand(-6, 3), x2 = x1 + lfRand(1, 7);
        const P = qfFromRoots(1, x1, x2);
        return { typeId: 1, title: 'Quadratische Gleichung lösen', desc: <>Löse die Gleichung {fq(`${qfNormS(P).slice(4)} = 0`)} mit der pq-Formel.</>, steps: Q.pqCore(P.b, P.c) };
    }
    const type = level === 'mittel' ? lfChooseType([2, 3], forbidden) : lfChooseType([4, 5], forbidden);
    if (type === 2 || type === 4) {
        const a = type === 2 ? 1 : -1;
        const x1 = lfPick([-5.5, -3, -2.5, -1, 0.5, 1.5, 2]), x2 = x1 + lfPick([1, 2, 3, 4, 5]);
        const P = qfFromRoots(a, x1, x2, 'p');
        return { typeId: type, title: 'Nullstellen berechnen', desc: <>Die Parabel {pn(P)} schneidet die x-Achse in den Punkten N₁ und N₂. Berechne die x-Koordinaten dieser Nullstellen.</>, steps: Q.zeros(P), finalGraph: { range: qfRangeFor([P], [qpt(x1, 0), qpt(x2, 0)]), lines: [P], points: [qpt(x1, 0, 'N₁'), qpt(x2, 0, 'N₂')] } };
    }
    // keine oder genau eine Nullstelle
    const a = type === 3 ? 1 : qfSign();
    const xs = lfPick([-3, -2, -1.5, 1, 2.5, 3]);
    const ys = a > 0 ? lfPick([0, 0.5, 1, 2, 3]) : lfPick([0, -0.5, -1, -2, -3]);
    const P = qfFromVertex(a, xs, ys, 'p');
    return { typeId: type, title: 'Hat die Parabel Nullstellen?', desc: <>Untersuche rechnerisch, ob die Parabel {pn(P)} die x-Achse schneidet, und berechne gegebenenfalls die Nullstelle.</>, steps: Q.zeros(P), finalGraph: { range: qfRangeFor([P]), lines: [P] } };
};

// 7. Parabel durch zwei Punkte
QGEN.zweipunkte = (level, forbidden) => {
    for (let i = 0; i < 100; i++) {
        const a = level === 'schwer' ? -1 : 1;
        const P = level === 'schwer' ? qfFromVertex(a, lfPick([...QF_INT, ...QF_HALF]), lfPick([-2, 1, 2.25, 4, 6.25]), 'p') : qfRandVertex(a, QF_INT, [-4, -3, -2, 1, 2, 3], 'p');
        const xA = level === 'leicht' ? 0 : lfPick([-4, -3, -2, -1, 1]);
        const xB = xA + lfPick([2, 3, 4, 5]);
        const A = qpt(xA, qfVal(P, xA), 'A'), B = qpt(xB, qfVal(P, xB), 'B');
        if (!lfIsShort(P.b) || !lfIsShort(P.c)) continue;
        return {
            typeId: level, title: 'Parabel durch zwei Punkte',
            desc: <>Die Punkte {lfPt(A)} und {lfPt(B)} liegen auf der nach {a > 0 ? 'oben' : 'unten'} geöffneten Normalparabel p. Ermittle rechnerisch die Funktionsgleichung von p in der Normalform.</>,
            steps: Q.twoPoints(a, A, B, 'p'),
            finalGraph: { range: qfRangeFor([P], [A, B]), lines: [P], points: [A, B] }
        };
    }
};

// 8. Verschieben & Spiegeln
QGEN.spiegeln = (level, forbidden) => {
    const a = qfSign();
    const P = qfRandVertex(a, [-3, -2, -1, 1, 2, 3], [-3, -2, -1, 1, 2, 3], 'p');
    if (level === 'schwer') {
        const type = lfChooseType([3, 4], forbidden);
        if (type === 4) {
            const S0 = qfVertex(P);
            const S2 = { x: -S0.x, y: -S0.y };
            return {
                typeId: 4, title: 'Doppelt spiegeln',
                desc: <>Die Parabel {pv(P)} wird zuerst an der y-Achse und dann an der x-Achse gespiegelt. Gib die Scheitelpunktform der entstandenen Parabel p' an.</>,
                steps: [
                    Q.vertexPt(-S0.x, S0.y, 'S₁', 'Scheitelpunkt nach der Spiegelung an der y-Achse'),
                    Q.vertexPt(S2.x, S2.y, "S'", 'Scheitelpunkt nach der Spiegelung an der x-Achse'),
                    Q.opening(-a, "p'"),
                    Q.vertForm(-a, S2.x, S2.y, "p'")
                ],
                finalGraph: { range: qfRangeFor([P, qfFromVertex(-a, S2.x, S2.y)]), lines: [P, qfFromVertex(-a, S2.x, S2.y, "p'")] }
            };
        }
        const axis = lfPick(['x', 'y']);
        const S0 = qfVertex(P), a2 = axis === 'x' ? -a : a;
        const P2 = qfFromVertex(a2, axis === 'y' ? -S0.x : S0.x, axis === 'x' ? -S0.y : S0.y, "p'");
        return { typeId: 3, title: 'Spiegeln und Normalform', desc: <>Die Parabel {pn(P)} wird an der {axis}-Achse gespiegelt. Bestimme die Normalform der gespiegelten Parabel p'.</>, steps: [...Q.vertexFromNorm(P), ...Q.mirror(P, axis, "p'"), Q.normForm(P2)], finalGraph: { range: qfRangeFor([P, P2]), lines: [P, P2] } };
    }
    const axis = level === 'leicht' ? 'x' : 'y';
    const S0 = qfVertex(P), a2 = axis === 'x' ? -a : a;
    const P2 = qfFromVertex(a2, axis === 'y' ? -S0.x : S0.x, axis === 'x' ? -S0.y : S0.y, "p'");
    return { typeId: level, title: `Spiegeln an der ${axis}-Achse`, desc: <>Die Parabel {pv(P)} wird an der {axis}-Achse gespiegelt. Gib die Scheitelpunktform der gespiegelten Parabel p' an.</>, steps: Q.mirror(P, axis, "p'"), finalGraph: { range: qfRangeFor([P, P2]), lines: [P, P2] } };
};

// 9. Parabel und Gerade
QGEN.gerade = (level, forbidden) => {
    for (let i = 0; i < 200; i++) {
        const a = level === 'leicht' ? 1 : qfSign();
        const P = qfRandVertex(a, [-2, -1, 0, 1, 2], [-4, -3, -2, -1, 1, 2], 'p');
        let x1 = lfRand(-4, 2), x2 = x1 + lfRand(1, 5);
        const kind = level === 'mittel' && Math.random() < 0.35 ? 'touch' : level === 'schwer' && Math.random() < 0.35 ? 'none' : 'two';
        let m, t;
        if (kind === 'two') { m = lfR((qfVal(P, x2) - qfVal(P, x1)) / (x2 - x1)); t = lfR(qfVal(P, x1) - m * x1); }
        else if (kind === 'touch') { m = lfR(2 * P.a * x1 + P.b); t = lfR(qfVal(P, x1) - m * x1); }
        else { m = lfPick([-2, -1, 1, 2]); t = lfR(qfVal(P, 0) - a * lfPick([6, 8, 10])); const d = Pb(P.a, P.b - m, P.c - t); if ((d.b / d.a / 2) ** 2 - d.c / d.a >= 0) continue; }
        if (Math.abs(m) > 6 || Math.abs(t) > 12 || !lfIsShort(m) || !lfIsShort(t)) continue;
        const g = { m, t, n: 'g' };
        const pts = kind === 'two' ? [qpt(x1, qfVal(P, x1)), qpt(x2, qfVal(P, x2))] : kind === 'touch' ? [qpt(x1, qfVal(P, x1))] : [];
        const fg = { range: qfRangeFor([P], pts), lines: [P, g], points: pts.map((p, j) => ({ ...p, n: pts.length > 1 ? `S${j === 0 ? '₁' : '₂'}` : 'B' })) };
        if (level === 'schwer' && Math.random() < 0.6) {
            const A = lfPick([2, 3, -2]);
            const show = `${lfSideS([{ c: A, v: 'y' }, { c: lfR(-A * m), v: 'x' }])} = ${lfS(A * t)}`;
            return {
                typeId: 3, title: 'Parabel und Gerade (Gerade umformen)',
                desc: <>Gegeben sind die Parabel {pn(P)} und die Gerade g: {fq(show)}. Berechne die Koordinaten aller gemeinsamen Punkte.</>,
                steps: [{ type: 'fill', goal: 'Bringe die Geradengleichung in die Form y = mx + t.', inputs: [{ id: 'm', correct: m }, { id: 't', correct: t }], render: (h) => <LfZeile>g: <V>y</V> = {h.input('m')}<V>x</V> + {h.input('t')}</LfZeile>, hint: `Bringe den x-Term auf die rechte Seite und teile durch ${lfS(A)}.`, solution: lfGlS(m, t) }, ...Q.intersect(P, g)],
                finalGraph: fg
            };
        }
        return { typeId: level, title: 'Schnittpunkte von Parabel und Gerade', desc: <>Die Gerade {fq(`g: ${lfGlS(m, t)}`)} und die Parabel {pn(P)} werden geschnitten. Berechne die Koordinaten der gemeinsamen Punkte.</>, steps: Q.intersect(P, g), finalGraph: fg };
    }
};

// 10. Schnittpunkte zweier Parabeln
QGEN.parabeln = (level, forbidden) => {
    for (let i = 0; i < 200; i++) {
        const P1 = qfRandVertex(1, [-2, -1, 0, 1, 2], [-4, -3, -2, -1, 0, 1], 'p₁');
        let P2, pts = [];
        if (level === 'leicht') {
            const x0 = lfRand(-3, 3), k = lfPick([-3, -2, -1, 1, 2, 3]);
            P2 = Pb(1, lfR(P1.b + k), lfR(P1.c - k * x0), 'p₂');
            pts = [qpt(x0, qfVal(P1, x0))];
        } else {
            const x1 = level === 'mittel' ? lfRand(-4, 1) : lfPick([-3.5, -2.5, -1, 0.5, 1]);
            const x2 = x1 + (level === 'mittel' ? lfRand(1, 5) : lfPick([1, 2, 3, 4]));
            const kind = level === 'schwer' ? lfPick(['two', 'touch', 'none']) : 'two';
            // p₂ = p₁ − 2·(x − x₁)(x − x₂): schneidet p₁ genau bei x₁ und x₂
            if (kind === 'two') { P2 = Pb(-1, lfR(P1.b + 2 * (x1 + x2)), lfR(P1.c - 2 * x1 * x2), 'p₂'); pts = [qpt(x1, qfVal(P1, x1)), qpt(x2, qfVal(P1, x2))]; }
            else if (kind === 'touch') { P2 = Pb(-1, lfR(P1.b + 4 * x1), lfR(P1.c - 2 * x1 * x1), 'p₂'); pts = [qpt(x1, qfVal(P1, x1))]; }
            else { const S1 = qfVertex(P1); P2 = qfFromVertex(-1, lfR(S1.x + lfPick([-1, 0, 1])), lfR(S1.y - lfPick([2, 3, 4])), 'p₂'); }
        }
        if (!lfIsShort(P2.b) || !lfIsShort(P2.c) || Math.abs(P2.c) > 20) continue;
        return {
            typeId: level, title: 'Schnittpunkte zweier Parabeln',
            desc: <>Die Parabeln {pn(P1)} und {pn(P2)} {level === 'schwer' ? 'werden auf gemeinsame Punkte untersucht. Berechne die Koordinaten aller Schnittpunkte (falls vorhanden).' : 'schneiden sich. Berechne die Koordinaten der Schnittpunkte.'}</>,
            steps: Q.intersect(P1, P2),
            finalGraph: { range: qfRangeFor([P1, P2], pts), lines: [P1, P2], points: pts }
        };
    }
};

// ==========================================
// 4. PRÜFUNGSAUFGABEN (angelehnt an MSA Bayern 2010–2025)
// Aus dem Prüfungsarchiv des Bayerischen Staatsministeriums. Reine Begründungen
// sind als Auswahlaufgaben umgesetzt oder weggelassen.
// ==========================================
const dq = (curves, range) => ({ steps: () => Q.drawAll(curves, range || qfRangeFor(curves)), fg: { range: range || qfRangeFor(curves), lines: curves } });
const withFg = (steps, curves, pts, range) => ({ steps, fg: { range: range || qfRangeFor(curves, pts), lines: curves, points: pts } });

const QF_EXAMS = [
    { id: '2025-I', label: 'MSA 2025 I', nr: '3', parts: [
        { l: 'a', topic: 'normalform', text: <>Die nach oben geöffnete Normalparabel p₁ hat den Scheitelpunkt S₁(−2 | −2). Ermittle rechnerisch ihre Funktionsgleichung in der Normalform.</>, steps: () => Q.normFromVertex(1, -2, -2, 'p₁') },
        { l: 'b', topic: 'spiegeln', text: <>Die Parabel p₂ entsteht durch Spiegelung von {pv(Pb(1, 4, 2, 'p₁'))} an der y-Achse. Bestimme p₂ und zeichne p₁ und p₂.</>, steps: () => [...Q.mirror(Pb(1, 4, 2, 'p₁'), 'y', 'p₂'), ...Q.drawAll([Pb(1, 4, 2, 'p₁'), Pb(1, -4, 2, 'p₂')], [-5, 5, -3, 6])], fg: { range: [-5, 5, -3, 6], lines: [Pb(1, 4, 2, 'p₁'), Pb(1, -4, 2, 'p₂')] } },
        { l: 'c', topic: 'zweipunkte', text: <>Die nach unten geöffnete Normalparabel p₄ verläuft durch B(2 | −2). Sie schneidet {pn(Pb(1, 3.5, 2, 'p₃'))} im Punkt A(0 | <V>y</V>). Ermittle rechnerisch die Funktionsgleichung von p₄.</>, steps: () => [Q.valueAt(Pb(1, 3.5, 2, 'p₃'), 0, 'Berechne die y-Koordinate von A mit p₃.'), ...Q.twoPoints(-1, qpt(0, 2, 'A'), qpt(2, -2, 'B'), 'p₄')] },
        { l: 'd', topic: 'wertetabelle', text: <>Überprüfe rechnerisch, ob der Punkt C(2 | 8,5) auf {pn(Pb(1, 1, 2.25, 'p₅'))} liegt.</>, steps: () => Q.probe(Pb(1, 1, 2.25, 'p₅'), qpt(2, 8.5, 'C')) },
        { l: 'e', topic: 'nullstellen', text: <>Zeige, dass die Parabel {pn(Pb(1, 1, 2.25, 'p₅'))} die x-Achse nicht schneidet.</>, steps: () => Q.zeros(Pb(1, 1, 2.25, 'p₅')) },
        { l: 'f', topic: 'scheitel', text: <>Beschreibe die Lage der Parabel {pn(Pb(-1, 0, -5, 'p₆'))} im Koordinatensystem.</>, steps: () => [S.select('Welche Beschreibung stimmt?', [<span>nach unten geöffnet, Scheitel S(0 | −5) auf der y-Achse</span>, <span>nach oben geöffnet, Scheitel S(0 | −5)</span>, <span>nach unten geöffnet, Scheitel S(−5 | 0)</span>, <span>nach unten geöffnet, Scheitel S(0 | 5)</span>], 0, 'y = −x² − 5 ist die nach unten geöffnete Normalparabel, um 5 nach unten verschoben.', 'nach unten geöffnet, S(0 | −5)')] }
    ]},
    { id: '2025-II', label: 'MSA 2025 II', nr: '5', parts: [
        { l: 'a', topic: 'scheitelform', text: <>Die Parabel {pn(Pb(1, -6, 7, 'p₁'))} hat den Scheitelpunkt S₁. Bestimme rechnerisch S₁.</>, steps: () => Q.vertexFromNorm(Pb(1, -6, 7, 'p₁'), 'S₁') },
        { l: 'b', topic: 'zweipunkte', text: <>Die Punkte A(3 | 2) und B(−1 | −6) liegen auf der nach unten geöffneten Normalparabel p₂. Ermittle rechnerisch ihre Normalform.</>, steps: () => Q.twoPoints(-1, qpt(3, 2, 'A'), qpt(-1, -6, 'B'), 'p₂') },
        { l: 'c', topic: 'normalform', text: <>Die nach oben geöffnete Normalparabel p₃ hat den Scheitelpunkt S₃(2,5 | 2). Bestimme ihre Funktionsgleichung in der Normalform.</>, steps: () => Q.normFromVertex(1, 2.5, 2, 'p₃') },
        { l: 'd', topic: 'parabeln', text: <>Die Parabel {pn(Pb(-1, 8, -13, 'p₄'))} schneidet {pn(Pb(1, -6, 7, 'p₁'))} in T₁ und T₂. Berechne die Koordinaten von T₁ und T₂.</>, ...withFg(() => Q.intersect(Pb(1, -6, 7, 'p₁'), Pb(-1, 8, -13, 'p₄')), [Pb(1, -6, 7, 'p₁'), Pb(-1, 8, -13, 'p₄')], [qpt(2, -1, 'T₁'), qpt(5, 2, 'T₂')]) },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne {pn(Pb(-1, 4, -1, 'p₂'))} und {pn(Pb(1, -5, 8.25, 'p₃'))} in ein Koordinatensystem.</>, ...dq([Pb(-1, 4, -1, 'p₂'), Pb(1, -5, 8.25, 'p₃')], [-2, 7, -4, 7]) },
        { l: 'f', topic: 'gerade', text: <>Die Parabel p₅ hat die Gleichung {fq('y = (x − 4)² − 3')}. Welche Gerade g schneidet p₅ nicht?</>, steps: () => [S.select('Welche Gerade hat keinen gemeinsamen Punkt mit p₅?', [fq('y = −4'), fq('y = −3'), fq('y = 0'), fq('y = x')], 0, 'p₅ ist nach oben geöffnet mit dem tiefsten Punkt S(4 | −3). Eine waagrechte Gerade unterhalb von y = −3 trifft die Parabel nicht; y = −3 berührt sie im Scheitel.', 'z. B. y = −4')] }
    ]},
    { id: '2024-I', label: 'MSA 2024 I', nr: '4', parts: [
        { l: 'a', topic: 'scheitel', text: <>Die Abbildung zeigt die Parabel p₁. Ermittle rechnerisch ihre Funktionsgleichung in der Normalform.</>, graph: { range: [-3, 7, -6, 6], lines: [Pb(-1, 4, 1, 'p₁')] }, steps: () => Q.readGraph(-1, 2, 5, 'p₁') },
        { l: 'b', topic: 'spiegeln', text: <>Die Parabel {pv(Pb(-1, 4, 1, 'p₁'))} wird an der x-Achse gespiegelt. Gib die Scheitelpunktform der gespiegelten Parabel p₂ an.</>, steps: () => Q.mirror(Pb(-1, 4, 1, 'p₁'), 'x', 'p₂') },
        { l: 'c', topic: 'nullstellen', text: <>Die Parabel {pn(Pb(1, -8, 7, 'p₃'))} schneidet die x-Achse in N₁ und N₂. Berechne ihre x-Koordinaten.</>, steps: () => Q.zeros(Pb(1, -8, 7, 'p₃')) },
        { l: 'd', topic: 'wertetabelle', text: <>Überprüfe rechnerisch, ob die Punkte A(4 | −8) und B(10 | 27) auf {pn(Pb(1, -8, 7, 'p₃'))} liegen.</>, steps: () => [...Q.probe(Pb(1, -8, 7, 'p₃'), qpt(4, -8, 'A')), ...Q.probe(Pb(1, -8, 7, 'p₃'), qpt(10, 27, 'B'))] },
        { l: 'e', topic: 'gerade', text: <>Die Gerade {fq('g: y = x − 9')} schneidet {pn(Pb(-1, 3, -6, 'p₄'))} in C und D. Berechne die Koordinaten von C und D.</>, ...withFg(() => Q.intersect(Pb(-1, 3, -6, 'p₄'), { m: 1, t: -9, n: 'g' }), [Pb(-1, 3, -6, 'p₄'), { m: 1, t: -9, n: 'g' }], [qpt(-1, -10, 'D'), qpt(3, -6, 'C')], [-4, 7, -12, 2]) },
        { l: 'f', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, -8, 7, 'p₃'))} und {pn(Pb(-1, 3, -6, 'p₄'))} in ein Koordinatensystem.</>, ...dq([Pb(1, -8, 7, 'p₃'), Pb(-1, 3, -6, 'p₄')], [-2, 8, -10, 3]) }
    ]},
    { id: '2024-II', label: 'MSA 2024 II', nr: '4', parts: [
        { l: 'a', topic: 'zweipunkte', text: <>Die nach oben geöffnete Normalparabel p₁ verläuft durch A(−2 | −3) und B(0 | −3). Berechne ihre Funktionsgleichung in der Normalform.</>, steps: () => Q.twoPoints(1, qpt(-2, -3, 'A'), qpt(0, -3, 'B'), 'p₁') },
        { l: 'b', topic: 'normalform', text: <>Die nach unten geöffnete Normalparabel p₂ hat den Scheitelpunkt S₂(2 | 1). Ermittle rechnerisch ihre Normalform.</>, steps: () => Q.normFromVertex(-1, 2, 1, 'p₂') },
        { l: 'c', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, 2, -3, 'p₁'))} und {pn(Pb(-1, 4, -3, 'p₂'))} in ein Koordinatensystem.</>, ...dq([Pb(1, 2, -3, 'p₁'), Pb(-1, 4, -3, 'p₂')], [-5, 5, -5, 4]) },
        { l: 'd', topic: 'scheitelform', text: <>Bestimme rechnerisch den Scheitelpunkt S₃ von {pn(Pb(1, -14, 37, 'p₃'))}.</>, steps: () => Q.vertexFromNorm(Pb(1, -14, 37, 'p₃'), 'S₃') },
        { l: 'e', topic: 'wertetabelle', text: <>Der Punkt C(−4 | <V>y</V>) liegt auf {pn(Pb(1, -14, 37, 'p₃'))}. Berechne die y-Koordinate von C.</>, steps: () => [Q.valueAt(Pb(1, -14, 37, 'p₃'), -4)] },
        { l: 'f', topic: 'nullstellen', text: <>Die Abbildung zeigt die Normalparabel p₄ mit S(4 | −9). Lies die Nullstellen ab und überprüfe sie rechnerisch.</>, graph: { range: [-1, 8, -10, 2], lines: [Pb(1, -8, 7, 'p₄')] }, steps: () => [{ type: 'fill', goal: 'Lies die Nullstellen am Graphen ab.', inputs: [{ id: 'a', correct: 1 }, { id: 'b', correct: 7 }], altSets: [{ a: 7, b: 1 }], render: (h) => <LfZeile>x₁ = {h.input('a')} <span className="mx-3">und</span> x₂ = {h.input('b')}</LfZeile>, hint: 'Wo schneidet die Parabel die x-Achse?', solution: 'x₁ = 1; x₂ = 7' }, Q.normForm(Pb(1, -8, 7, 'p₄'), 'Stelle die Normalform von p₄ auf (Scheitel S(4 | −9)).', 'y = (x − 4)² − 9 ausmultiplizieren: x² − 8x + 16 − 9.'), ...Q.zeros(Pb(1, -8, 7, 'p₄'))] },
        { l: 'g', topic: 'scheitel', text: <>In der Aufgabe „Gegeben ist die Parabel {fq('p₅: y = x² − 6x − 3')}. Berechne die Koordinaten der zwei Schnittpunkte von p₅ mit der y-Achse.“ steckt ein Fehler. Welcher?</>, steps: () => [S.select('Worin liegt der Fehler?', [<span>Eine Parabel schneidet die y-Achse höchstens einmal.</span>, <span>p₅ hat keinen Scheitelpunkt.</span>, <span>p₅ ist nach unten geöffnet.</span>], 0, 'Jede Parabel schneidet die y-Achse genau einmal (bei x = 0). Richtig wäre z. B.: „… Schnittpunkte mit der x-Achse“.', 'Es gibt nur einen Schnittpunkt mit der y-Achse; gemeint sind die Schnittpunkte mit der x-Achse.')] }
    ]},
    { id: '2023-I', label: 'MSA 2023 I', nr: '1', parts: [
        { l: 'a', topic: 'normalform', text: <>Berechne die Normalform der Parabel {fq('p₁: y = (x + 5,5)² + 1')}.</>, steps: () => Q.normFromVertex(1, -5.5, 1, 'p₁', { given: true }) },
        { l: 'b', topic: 'wertetabelle', text: <>Überprüfe rechnerisch, ob P(−3 | 4) und Q(0,5 | 37) auf {pn(Pb(1, 11, 31.25, 'p₁'))} liegen.</>, steps: () => [...Q.probe(Pb(1, 11, 31.25, 'p₁'), qpt(-3, 4, 'P')), ...Q.probe(Pb(1, 11, 31.25, 'p₁'), qpt(0.5, 37, 'Q'))] },
        { l: 'c', topic: 'scheitelform', text: <>Bestimme die Scheitelpunktform von {pn(Pb(-1, -9, -14.25, 'p₂'))} und gib S₂ an.</>, steps: () => Q.vertexFromNorm(Pb(-1, -9, -14.25, 'p₂'), 'S₂') },
        { l: 'd', topic: 'parabeln', text: <>Ermittle rechnerisch die Schnittpunkte A und B von {pn(Pb(1, 11, 31.25, 'p₁'))} und {pn(Pb(-1, -9, -14.25, 'p₂'))}.</>, ...withFg(() => Q.intersect(Pb(1, 11, 31.25, 'p₁'), Pb(-1, -9, -14.25, 'p₂')), [Pb(1, 11, 31.25, 'p₁'), Pb(-1, -9, -14.25, 'p₂')], [qpt(-6.5, 2, 'B'), qpt(-3.5, 5, 'A')], [-10, 1, -2, 8]) },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne {pv(Pb(1, 11, 31.25, 'p₁'))} und {pv(Pb(-1, -9, -14.25, 'p₂'))} in ein Koordinatensystem.</>, ...dq([Pb(1, 11, 31.25, 'p₁'), Pb(-1, -9, -14.25, 'p₂')], [-10, 1, -2, 8]) },
        { l: 'f', topic: 'spiegeln', text: <>Der Scheitel einer nach unten geöffneten Parabel p₃ liegt im 3. Quadranten. Sie wird erst an der x-Achse und dann an der y-Achse gespiegelt. Wo liegt der Scheitel der entstandenen Parabel p₄, und wie ist sie geöffnet?</>, steps: () => [S.select('Welche Aussage stimmt für p₄?', [<span>Scheitel im 1. Quadranten, nach oben geöffnet</span>, <span>Scheitel im 2. Quadranten, nach oben geöffnet</span>, <span>Scheitel im 1. Quadranten, nach unten geöffnet</span>, <span>Scheitel im 4. Quadranten, nach unten geöffnet</span>], 0, 'Spiegeln an der x-Achse: y-Koordinate wechselt das Vorzeichen, die Öffnung dreht sich (3. → 2. Quadrant, nach oben). Spiegeln an der y-Achse: x-Koordinate wechselt das Vorzeichen (2. → 1. Quadrant), Öffnung bleibt.', '1. Quadrant, nach oben geöffnet')] }
    ]},
    { id: '2023-II', label: 'MSA 2023 II', nr: '7', parts: [
        { l: 'a', topic: 'zweipunkte', text: <>Die nach oben geöffnete Normalparabel p₁ schneidet die x-Achse in A(1,5 | 0) und B(6 | 0). Ermittle rechnerisch ihre Normalform.</>, steps: () => Q.twoPoints(1, qpt(1.5, 0, 'A'), qpt(6, 0, 'B'), 'p₁') },
        { l: 'b', topic: 'scheitelform', text: <>Die Parabel {pn(Pb(-1, -10, -22, 'p₂'))} hat den Scheitelpunkt S₂. Bestimme rechnerisch S₂.</>, steps: () => Q.vertexFromNorm(Pb(-1, -10, -22, 'p₂'), 'S₂') },
        { l: 'c', topic: 'spiegeln', text: <>Die Parabel {fq('p₃: y = −(x + 4)² + 9')} wird an der x-Achse gespiegelt. Ermittle rechnerisch die Normalform der entstandenen Parabel p₄.</>, steps: () => [...Q.mirror(Pb(-1, -8, -7, 'p₃'), 'x', 'p₄'), ...Q.normFromVertex(1, -4, -9, 'p₄', { given: true })] },
        { l: 'd', topic: 'nullstellen', text: <>Bestimme rechnerisch die Schnittpunkte N₁ und N₂ von {fq('p₃: y = −(x + 4)² + 9')} mit der x-Achse.</>, steps: () => [...Q.normFromVertex(-1, -4, 9, 'p₃', { given: true }), ...Q.zeros(Pb(-1, -8, -7, 'p₃'))] },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, -7.5, 9, 'p₁'))} und {fq('p₃: y = −(x + 4)² + 9')} in ein Koordinatensystem.</>, ...dq([Pb(1, -7.5, 9, 'p₁'), Pb(-1, -8, -7, 'p₃')], [-8, 8, -6, 10]) },
        { l: 'f', topic: 'parabeln', text: <>Zeige rechnerisch, dass {fq('p₅: y = x²')} und {fq('p₆: y = −(x − 2)² − 3')} keinen Schnittpunkt haben.</>, steps: () => Q.intersect(Pb(1, 0, 0, 'p₅'), Pb(-1, 4, -7, 'p₆')) }
    ]},
    { id: '2022-I', label: 'MSA 2022 I', nr: '1', parts: [
        { l: 'a', topic: 'normalform', text: <>Ermittle rechnerisch die Normalform der nach oben geöffneten Normalparabel p₁ mit dem Scheitelpunkt S₁(−4 | 1).</>, steps: () => Q.normFromVertex(1, -4, 1, 'p₁') },
        { l: 'b', topic: 'zweipunkte', text: <>Die nach unten geöffnete Normalparabel p₂ geht durch A(−4 | 1) und B(0 | 1). Ermittle ihre Scheitelpunktform und gib S₂ an.</>, steps: () => [...Q.twoPoints(-1, qpt(-4, 1, 'A'), qpt(0, 1, 'B'), 'p₂'), ...Q.vertexFromNorm(Pb(-1, -4, 1, 'p₂'), 'S₂')] },
        { l: 'c', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, 8, 17, 'p₁'))} und {pn(Pb(-1, -4, 1, 'p₂'))} und bestimme zeichnerisch ihre Schnittpunkte Q und R.</>, steps: () => [...Q.drawAll([Pb(1, 8, 17, 'p₁'), Pb(-1, -4, 1, 'p₂')], [-8, 2, -2, 8]), { type: 'fill', goal: 'Lies die Schnittpunkte Q und R ab.', inputs: [{ id: 'x1', correct: -4 }, { id: 'y1', correct: 1 }, { id: 'x2', correct: -2 }, { id: 'y2', correct: 5 }], altSets: [{ x1: -2, y1: 5, x2: -4, y2: 1 }], render: (h) => <LfZeile><span className="flex flex-col gap-2 items-start"><span>Q( {h.input('x1', 'w-16')} | {h.input('y1', 'w-16')} )</span><span>R( {h.input('x2', 'w-16')} | {h.input('y2', 'w-16')} )</span></span></LfZeile>, summary: (v) => `Q(${v.x1} | ${v.y1}), R(${v.x2} | ${v.y2})`, hint: 'Wo kreuzen sich die beiden Parabeln?', solution: 'Q(−4 | 1), R(−2 | 5)' }], fg: { range: [-8, 2, -2, 8], lines: [Pb(1, 8, 17, 'p₁'), Pb(-1, -4, 1, 'p₂')], points: [qpt(-4, 1, 'Q'), qpt(-2, 5, 'R')] } },
        { l: 'd', topic: 'parabeln', text: <>Die Normalparabeln {pn(Pb(1, 2, -2, 'p₃'))} und {pn(Pb(-1, -2, 4, 'p₄'))} schneiden sich in M und N. Berechne ihre Koordinaten.</>, ...withFg(() => Q.intersect(Pb(1, 2, -2, 'p₃'), Pb(-1, -2, 4, 'p₄')), [Pb(1, 2, -2, 'p₃'), Pb(-1, -2, 4, 'p₄')], [qpt(-3, 1, 'N'), qpt(1, 1, 'M')]) }
    ]},
    { id: '2022-II', label: 'MSA 2022 II', nr: '5', parts: [
        { l: 'a', topic: 'zweipunkte', text: <>Die nach oben geöffnete Normalparabel p₁ verläuft durch A(−3 | 1) und B(2 | 6). Gib ihre Normalform an.</>, steps: () => Q.twoPoints(1, qpt(-3, 1, 'A'), qpt(2, 6, 'B'), 'p₁') },
        { l: 'b', topic: 'normalform', text: <>Die Normalparabel p₂ ist nach unten geöffnet und hat den Scheitelpunkt S₂(3 | 4). Gib ihre Normalform an.</>, steps: () => Q.normFromVertex(-1, 3, 4, 'p₂') },
        { l: 'c', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, 2, -2, 'p₁'))} und {pn(Pb(-1, 6, -5, 'p₂'))} in ein Koordinatensystem.</>, ...dq([Pb(1, 2, -2, 'p₁'), Pb(-1, 6, -5, 'p₂')], [-5, 7, -5, 6]) },
        { l: 'd', topic: 'wertetabelle', text: <>Der Punkt C(7 | <V>y</V>) liegt auf {pn(Pb(-1, 7, 14, 'p₃'))}. Berechne die fehlende y-Koordinate.</>, steps: () => [Q.valueAt(Pb(-1, 7, 14, 'p₃'), 7)] },
        { l: 'e', topic: 'wertetabelle', text: <>Überprüfe rechnerisch, ob D(−3 | 16) auf {pn(Pb(-1, 7, 14, 'p₃'))} liegt.</>, steps: () => Q.probe(Pb(-1, 7, 14, 'p₃'), qpt(-3, 16, 'D')) },
        { l: 'f', topic: 'scheitelform', text: <>Bestimme durch Rechnung den Scheitelpunkt S₃ von {pn(Pb(-1, 7, 14, 'p₃'))}.</>, steps: () => Q.vertexFromNorm(Pb(-1, 7, 14, 'p₃'), 'S₃') },
        { l: 'g', topic: 'nullstellen', text: <>Die Parabel {pn(Pb(1, -20, 96, 'p₄'))} schneidet die x-Achse in N₁ und N₂. Ermittle die x-Koordinaten rechnerisch.</>, steps: () => Q.zeros(Pb(1, -20, 96, 'p₄')) },
        { l: 'h', topic: 'gerade', text: <>Zeige rechnerisch, dass die Gerade g: {fq('2y + 6x = 38')} keinen gemeinsamen Punkt mit {pn(Pb(1, -20, 96, 'p₄'))} hat.</>, steps: () => [{ type: 'fill', goal: 'Bringe g in die Form y = mx + t.', inputs: [{ id: 'm', correct: -3 }, { id: 't', correct: 19 }], render: (h) => <LfZeile>g: <V>y</V> = {h.input('m')}<V>x</V> + {h.input('t')}</LfZeile>, hint: '2y = −6x + 38, dann durch 2 teilen.', solution: 'y = −3x + 19' }, ...Q.intersect(Pb(1, -20, 96, 'p₄'), { m: -3, t: 19, n: 'g' })] }
    ]},
    { id: '2021-I', label: 'MSA 2021 I', nr: '1', parts: [
        { l: 'a', topic: 'scheitelform', text: <>Forme {pn(Pb(1, 2, -3, 'p₁'))} in die Scheitelpunktform um und gib S₁ an.</>, steps: () => Q.vertexFromNorm(Pb(1, 2, -3, 'p₁'), 'S₁') },
        { l: 'b', topic: 'wertetabelle', text: <>Überprüfe durch Rechnung, ob A(−2 | −3) und B(2 | 5) auf {pn(Pb(1, 2, -3, 'p₁'))} liegen.</>, steps: () => [...Q.probe(Pb(1, 2, -3, 'p₁'), qpt(-2, -3, 'A')), ...Q.probe(Pb(1, 2, -3, 'p₁'), qpt(2, 5, 'B'))] },
        { l: 'c', topic: 'nullstellen', text: <>Die Normalparabel {pn(Pb(1, 2, -3, 'p₁'))} schneidet die x-Achse in P und Q. Ermittle die x-Koordinaten von P und Q.</>, steps: () => Q.zeros(Pb(1, 2, -3, 'p₁')) },
        { l: 'd', topic: 'zweipunkte', text: <>Die nach unten geöffnete Normalparabel p₂ verläuft durch C(1 | −6) und D(−4 | −1). Bestimme rechnerisch ihre Normalform.</>, steps: () => Q.twoPoints(-1, qpt(1, -6, 'C'), qpt(-4, -1, 'D'), 'p₂') },
        { l: 'f', topic: 'gerade', text: <>Berechne die Schnittpunkte T und U von {pn(Pb(1, -2, 1, 'p₄'))} mit der Geraden {fq('g: y = 2x − 2')}.</>, ...withFg(() => Q.intersect(Pb(1, -2, 1, 'p₄'), { m: 2, t: -2, n: 'g' }), [Pb(1, -2, 1, 'p₄'), { m: 2, t: -2, n: 'g' }], [qpt(1, 0, 'T'), qpt(3, 4, 'U')]) },
        { l: 'g', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, 2, -3, 'p₁'))} und {pn(Pb(-1, -4, -1, 'p₂'))} in ein Koordinatensystem.</>, ...dq([Pb(1, 2, -3, 'p₁'), Pb(-1, -4, -1, 'p₂')], [-6, 3, -5, 4]) }
    ]},
    { id: '2021-II', label: 'MSA 2021 II', nr: '5', parts: [
        { l: 'a', topic: 'zweipunkte', text: <>Die nach oben geöffnete Normalparabel p₁ verläuft durch A(−2 | −3) und B(2 | 5). Ermittle rechnerisch ihre Normalform.</>, steps: () => Q.twoPoints(1, qpt(-2, -3, 'A'), qpt(2, 5, 'B'), 'p₁') },
        { l: 'b', topic: 'scheitelform', text: <>Bestimme die Scheitelpunktform von {pn(Pb(1, -5, 2.25, 'p₂'))} und gib S₂ an.</>, steps: () => Q.vertexFromNorm(Pb(1, -5, 2.25, 'p₂'), 'S₂') },
        { l: 'c', topic: 'nullstellen', text: <>Die Normalparabel {pn(Pb(1, -5, 2.25, 'p₂'))} schneidet die x-Achse in N₁ und N₂. Berechne die x-Koordinaten.</>, steps: () => Q.zeros(Pb(1, -5, 2.25, 'p₂')) },
        { l: 'd', topic: 'normalform', text: <>Die nach unten geöffnete Normalparabel p₃ hat den Scheitelpunkt S₃(3 | 4). Ermittle rechnerisch ihre Normalform.</>, steps: () => Q.normFromVertex(-1, 3, 4, 'p₃') },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, 2, -3, 'p₁'))} und {pn(Pb(-1, 6, -5, 'p₃'))} in ein Koordinatensystem.</>, ...dq([Pb(1, 2, -3, 'p₁'), Pb(-1, 6, -5, 'p₃')], [-5, 7, -5, 6]) },
        { l: 'f', topic: 'gerade', text: <>Stimmt die Aussage: „D(0 | 1) ist ein gemeinsamer Punkt von {fq('p₄: y = (x − 2)² − 3')} und {fq('g: y = x − 3')}“?</>, steps: () => [...Q.probe(Pb(1, -4, 1, 'p₄'), qpt(0, 1, 'D')), S.calc('Setze x = 0 in g ein.', <V>y</V>, -3, 'y = 0 − 3', 'y = −3'), S.select('Ist die Aussage richtig?', [<span>Nein — D liegt auf p₄, aber nicht auf g.</span>, <span>Ja — D liegt auf beiden.</span>, <span>Nein — D liegt auf keinem der beiden Graphen.</span>], 0, 'Ein gemeinsamer Punkt muss auf beiden Graphen liegen.', 'falsch: D liegt nur auf p₄', true)] },
        { l: 'g', topic: 'spiegeln', text: <>Die Normalparabel {fq('p₄: y = (x − 2)² − 3')} wird an der x-Achse gespiegelt. Gib die Scheitelpunktform von p₅ an.</>, steps: () => Q.mirror(Pb(1, -4, 1, 'p₄'), 'x', 'p₅') }
    ]},
    { id: '2020-I', label: 'MSA 2020 I', nr: '1', parts: [
        { l: 'a', topic: 'scheitel', text: <>Die Abbildung zeigt die Normalparabel p₁. Ermittle rechnerisch ihre Normalform.</>, graph: { range: [-6, 3, -4, 4], lines: [Pb(-1, -4, -1, 'p₁')] }, steps: () => Q.readGraph(-1, -2, 3, 'p₁') },
        { l: 'b', topic: 'wertetabelle', text: <>Überprüfe durch Rechnung, ob A(−1 | 2) und B(−3 | −1,5) auf {pn(Pb(1, 4, 1.5, 'p₂'))} liegen.</>, steps: () => [...Q.probe(Pb(1, 4, 1.5, 'p₂'), qpt(-1, 2, 'A')), ...Q.probe(Pb(1, 4, 1.5, 'p₂'), qpt(-3, -1.5, 'B'))] },
        { l: 'c', topic: 'scheitelform', text: <>Ermittle rechnerisch den Scheitelpunkt S₂ von {pn(Pb(1, 4, 1.5, 'p₂'))}.</>, steps: () => Q.vertexFromNorm(Pb(1, 4, 1.5, 'p₂'), 'S₂') },
        { l: 'd', topic: 'gerade', text: <>Die Gerade {fq('g: y = 2x + 0,5')} hat mit {pn(Pb(1, 4, 1.5, 'p₂'))} den Punkt R gemeinsam. Berechne die Koordinaten von R.</>, ...withFg(() => Q.intersect(Pb(1, 4, 1.5, 'p₂'), { m: 2, t: 0.5, n: 'g' }), [Pb(1, 4, 1.5, 'p₂'), { m: 2, t: 0.5, n: 'g' }], [qpt(-1, -1.5, 'R')]) },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, 4, 1.5, 'p₂'))} und {fq('g: y = 2x + 0,5')} in ein Koordinatensystem.</>, ...dq([Pb(1, 4, 1.5, 'p₂'), { m: 2, t: 0.5, n: 'g' }], [-6, 3, -4, 5]) },
        { l: 'f', topic: 'spiegeln', text: <>Die nach unten geöffnete Normalparabel p₃ hat S₃(−0,5 | 4). Spiegelung an der y-Achse ergibt p₄, eine weitere Spiegelung an der x-Achse ergibt p₅. Gib die Scheitelpunktform von p₅ an.</>, steps: () => [Q.vertexPt(0.5, 4, 'S₄', 'Scheitelpunkt von p₄ (Spiegelung an der y-Achse)'), Q.vertexPt(0.5, -4, 'S₅', 'Scheitelpunkt von p₅ (Spiegelung an der x-Achse)'), Q.opening(1, 'p₅'), Q.vertForm(1, 0.5, -4, 'p₅')] }
    ]},
    { id: '2020-II', label: 'MSA 2020 II', nr: '5', parts: [
        { l: 'a', topic: 'normalform', text: <>Die nach oben geöffnete Normalparabel p₁ hat S₁(−1 | −6). Ermittle ihre Normalform.</>, steps: () => Q.normFromVertex(1, -1, -6, 'p₁') },
        { l: 'b', topic: 'nullstellen', text: <>Die Normalparabel {pn(Pb(-1, -6, -5, 'p₂'))} schneidet die x-Achse in N₁ und N₂. Berechne die x-Koordinaten.</>, steps: () => Q.zeros(Pb(-1, -6, -5, 'p₂')) },
        { l: 'c', topic: 'scheitelform', text: <>Bestimme rechnerisch den Scheitelpunkt S₂ von {pn(Pb(-1, -6, -5, 'p₂'))}.</>, steps: () => Q.vertexFromNorm(Pb(-1, -6, -5, 'p₂'), 'S₂') },
        { l: 'd', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, 2, -5, 'p₁'))} und {pn(Pb(-1, -6, -5, 'p₂'))} in ein Koordinatensystem.</>, ...dq([Pb(1, 2, -5, 'p₁'), Pb(-1, -6, -5, 'p₂')], [-7, 3, -7, 5]) },
        { l: 'e', topic: 'zweipunkte', text: <>Die nach oben geöffnete Normalparabel p₃ verläuft durch D(−1 | 2) und E(6 | −5). Ermittle rechnerisch ihre Normalform.</>, steps: () => Q.twoPoints(1, qpt(-1, 2, 'D'), qpt(6, -5, 'E'), 'p₃') },
        { l: 'f', topic: 'scheitel', text: <>Begründe mit einer Rechnung, dass die Parabel {fq('p₄: 3y + 2x² = −(−36x + 24 + x²)')} nach unten geöffnet ist.</>, steps: () => [{ type: 'fill', goal: 'Löse nach y auf.', inputs: [{ id: 'a', correct: -1 }, { id: 'b', correct: 12 }, { id: 'c', correct: -8 }], render: (h) => <LfZeile><V>y</V> = {h.input('a', 'w-16', '±')}<V>x</V>² {h.input('b', 'w-20', '±')}<V>x</V> {h.input('c', 'w-20', '±')}</LfZeile>, summary: (v) => `y = ${v.a}x² ${v.b}x ${v.c}`, hint: 'Rechte Seite: 36x − 24 − x². Dann − 2x² auf beiden Seiten: 3y = −3x² + 36x − 24, zuletzt durch 3 teilen.', solution: 'y = −x² + 12x − 8' }, Q.opening(-1, 'p₄')] }
    ]},
    { id: '2019-I', label: 'MSA 2019 I', nr: '1', parts: [
        { l: 'a', topic: 'scheitel', text: <>Welche Aussagen sind richtig? (1) Der Graph jeder quadratischen Funktion schneidet die y-Achse. (2) … schneidet die x-Achse. (3) … besitzt einen Scheitelpunkt. (4) An jeder Funktionsgleichung kann man den y-Achsenabschnitt ohne Rechnung ablesen.</>, steps: () => [S.select('Welche Aussagen sind richtig?', [<span>(1) und (3)</span>, <span>(1), (2) und (3)</span>, <span>(1), (3) und (4)</span>, <span>(2) und (4)</span>], 0, 'Jede Parabel hat einen Scheitel und schneidet die y-Achse (bei x = 0). Nicht jede schneidet die x-Achse. In der Scheitelpunktform kann man den y-Achsenabschnitt nicht direkt ablesen.', '(1) und (3)', true)] },
        { l: 'b', topic: 'scheitelform', text: <>Ermittle rechnerisch den Scheitelpunkt S₁ von {pn(Pb(1, -7, 10, 'p₁'))}.</>, steps: () => Q.vertexFromNorm(Pb(1, -7, 10, 'p₁'), 'S₁') },
        { l: 'c', topic: 'nullstellen', text: <>Berechne alle Schnittpunkte von {pn(Pb(1, -7, 10, 'p₁'))} mit der x-Achse und der y-Achse.</>, steps: () => [...Q.zeros(Pb(1, -7, 10, 'p₁')), { type: 'fill', goal: 'Gib den Schnittpunkt mit der y-Achse an.', inputs: [{ id: 'x', correct: 0 }, { id: 'y', correct: 10 }], render: (h) => <LfZeile>Sᵧ( {h.input('x')} | {h.input('y')} )</LfZeile>, hint: 'Auf der y-Achse ist x = 0. Setze x = 0 ein.', solution: 'Sᵧ(0 | 10)' }] },
        { l: 'd', topic: 'parabeln', text: <>Die Normalparabel {pn(Pb(1, 3, 0, 'p₂'))} schneidet {pn(Pb(1, -7, 10, 'p₁'))} im Punkt T. Bestimme T rechnerisch.</>, ...withFg(() => Q.intersect(Pb(1, -7, 10, 'p₁'), Pb(1, 3, 0, 'p₂')), [Pb(1, -7, 10, 'p₁'), Pb(1, 3, 0, 'p₂')], [qpt(1, 4, 'T')]) },
        { l: 'e', topic: 'parabeln', text: <>Die nach unten geöffnete Normalparabel p₃ hat den Scheitel S₃(−2 | 1). Welche Parabel p₄ hat keinen gemeinsamen Punkt mit p₃?</>, steps: () => [S.select('Welche Parabel passt?', [fq('y = (x + 2)² + 3'), fq('y = (x + 2)²'), fq('y = −x² + 1')], 0, 'p₃ hat ihren höchsten Punkt bei y = 1. Eine nach oben geöffnete Parabel, deren tiefster Punkt über y = 1 an der gleichen Stelle liegt, trifft p₃ nicht.', 'z. B. y = (x + 2)² + 3')] },
        { l: 'f', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, -7, 10, 'p₁'))} und {pn(Pb(1, 3, 0, 'p₂'))} in ein Koordinatensystem.</>, ...dq([Pb(1, -7, 10, 'p₁'), Pb(1, 3, 0, 'p₂')], [-5, 7, -3, 8]) }
    ]},
    { id: '2019-II', label: 'MSA 2019 II', nr: '6', parts: [
        { l: 'a', topic: 'scheitel', text: <>Bestimme die Normalform der Parabel p₁ (siehe Abbildung: S(3 | −2), Q(1 | 2), P(4 | −1)).</>, graph: { range: [-3, 6, -3, 5], lines: [Pb(1, -6, 7, 'p₁'), { m: 0, t: -2, n: 'f' }], points: [qpt(3, -2, 'S'), qpt(1, 2, 'Q'), qpt(4, -1, 'P')] }, steps: () => Q.readGraph(1, 3, -2, 'p₁') },
        { l: 'b', topic: 'nullstellen', text: <>Bestimme rechnerisch die x-Koordinaten der Schnittpunkte von {pn(Pb(1, -5, 2.25, 'p₂'))} mit der x-Achse.</>, steps: () => Q.zeros(Pb(1, -5, 2.25, 'p₂')) },
        { l: 'c', topic: 'parabeln', text: <>Die Parabel {pn(Pb(-1, 5, -8.25, 'p₃'))} schneidet {pn(Pb(1, -5, 2.25, 'p₂'))} in R und T. Ermittle die Koordinaten.</>, ...withFg(() => Q.intersect(Pb(1, -5, 2.25, 'p₂'), Pb(-1, 5, -8.25, 'p₃')), [Pb(1, -5, 2.25, 'p₂'), Pb(-1, 5, -8.25, 'p₃')], [qpt(1.5, -3, 'R'), qpt(3.5, -3, 'T')]) },
        { l: 'd', topic: 'wertetabelle', text: <>Der Punkt W(−22,5 | <V>y</V><sub>W</sub>) liegt auf {pn(Pb(-1, 5, -8.25, 'p₃'))}. Ermittle y<sub>W</sub>.</>, steps: () => [Q.valueAt(Pb(-1, 5, -8.25, 'p₃'), -22.5)] },
        { l: 'e', topic: 'normalform', text: <>Die nach unten geöffnete Normalparabel p₄ hat S₄(−1 | 2). Ermittle rechnerisch ihre Normalform.</>, steps: () => Q.normFromVertex(-1, -1, 2, 'p₄') },
        { l: 'f', topic: 'scheitel', text: <>Gib die Funktionsgleichung der Geraden f an (siehe Abbildung: f verläuft waagrecht durch den Scheitel S(3 | −2)).</>, graph: { range: [-3, 6, -3, 5], lines: [Pb(1, -6, 7, 'p₁'), { m: 0, t: -2, n: 'f' }] }, steps: () => [{ type: 'fill', goal: 'Gib die Gleichung von f an.', inputs: [{ id: 't', correct: -2 }], render: (h) => <LfZeile>f: <V>y</V> = {h.input('t')}</LfZeile>, hint: 'f ist parallel zur x-Achse: Alle Punkte haben dieselbe y-Koordinate wie der Scheitel.', solution: 'f: y = −2' }] }
    ]},
    { id: '2018-I', label: 'MSA 2018 I', nr: '1', parts: [
        { l: 'a', topic: 'zweipunkte', text: <>Die nach oben geöffnete Normalparabel p₁ verläuft durch D(1 | 6) und B(4 | 3). Berechne ihre Normalform.</>, steps: () => Q.twoPoints(1, qpt(1, 6, 'D'), qpt(4, 3, 'B'), 'p₁') },
        { l: 'b', topic: 'scheitelform', text: <>Gib die Scheitelpunktform von {pn(Pb(-1, 1, 3.75, 'p₂'))} an.</>, steps: () => Q.vertexFromNorm(Pb(-1, 1, 3.75, 'p₂'), 'S₂') },
        { l: 'c', topic: 'nullstellen', text: <>Bestimme rechnerisch die Schnittpunkte N₁ und N₂ von {pn(Pb(-1, 1, 3.75, 'p₂'))} mit der x-Achse.</>, steps: () => Q.zeros(Pb(-1, 1, 3.75, 'p₂')) },
        { l: 'd', topic: 'normalform', text: <>Die nach unten geöffnete Normalparabel p₃ hat S₃(4 | 7). Ermittle rechnerisch ihre Normalform.</>, steps: () => Q.normFromVertex(-1, 4, 7, 'p₃') },
        { l: 'e', topic: 'scheitel', text: <>Gib den Scheitelpunkt S₄ von {fq('p₄: y = −(x − 2)² + 3')} an.</>, steps: () => [Q.vertexPt(2, 3, 'S₄')] },
        { l: 'f', topic: 'wertetabelle', text: <>Gib zwei Punkte G und H an, die auf {fq('p₄: y = −(x − 2)² + 3')} liegen — z. B. mit x = 0 und x = 4.</>, steps: () => [Q.valueAt(Pb(-1, 4, -1, 'p₄'), 0, 'Berechne y für x = 0 (Punkt G).'), Q.valueAt(Pb(-1, 4, -1, 'p₄'), 4, 'Berechne y für x = 4 (Punkt H).')] },
        { l: 'g', topic: 'zeichnen', text: <>Zeichne {pn(Pb(-1, 8, -9, 'p₃'))} und {fq('p₄: y = −(x − 2)² + 3')} (x von −2 bis 8, y von −1 bis 10).</>, ...dq([Pb(-1, 8, -9, 'p₃'), Pb(-1, 4, -1, 'p₄')], [-2, 8, -1, 10]) }
    ]},
    { id: '2018-II', label: 'MSA 2018 II', nr: '3', parts: [
        { l: 'a', topic: 'normalform', text: <>Die nach oben geöffnete Normalparabel p₁ hat S₁(2 | 4). Berechne ihre Normalform.</>, steps: () => Q.normFromVertex(1, 2, 4, 'p₁') },
        { l: 'b', topic: 'zweipunkte', text: <>Die Punkte A(4 | 5) und B(−1 | 2) liegen auf der nach unten geöffneten Normalparabel p₂. Ermittle rechnerisch ihre Gleichung.</>, steps: () => Q.twoPoints(-1, qpt(4, 5, 'A'), qpt(-1, 2, 'B'), 'p₂') },
        { l: 'c', topic: 'scheitelform', text: <>Berechne den Scheitelpunkt S₃ von {pn(Pb(1, -6, 5, 'p₃'))}.</>, steps: () => Q.vertexFromNorm(Pb(1, -6, 5, 'p₃'), 'S₃') },
        { l: 'd', topic: 'nullstellen', text: <>Ermittle rechnerisch die Nullstellen von {pn(Pb(1, -6, 5, 'p₃'))}.</>, steps: () => Q.zeros(Pb(1, -6, 5, 'p₃')) },
        { l: 'e', topic: 'parabeln', text: <>Begründe mit einer Rechnung, dass sich {pn(Pb(1, -6, 5, 'p₃'))} und {pn(Pb(-1, 4, -9, 'p₄'))} nicht schneiden.</>, steps: () => Q.intersect(Pb(1, -6, 5, 'p₃'), Pb(-1, 4, -9, 'p₄')) },
        { l: 'f', topic: 'spiegeln', text: <>Durch Spiegelung von {pv(Pb(1, -4, 8, 'p₁'))} an der y-Achse entsteht p₅. Bestimme p₅ und zeichne p₁ und p₅ (x von −6 bis 6, y von −5 bis 6).</>, steps: () => [...Q.mirror(Pb(1, -4, 8, 'p₁'), 'y', 'p₅'), ...Q.drawAll([Pb(1, -4, 8, 'p₁'), Pb(1, 4, 8, 'p₅')], [-6, 6, -5, 6])], fg: { range: [-6, 6, -5, 6], lines: [Pb(1, -4, 8, 'p₁'), Pb(1, 4, 8, 'p₅')] } }
    ]},
    { id: '2017-I', label: 'MSA 2017 I', nr: '3', parts: [
        { l: 'a', topic: 'zweipunkte', text: <>Die nach oben geöffnete Normalparabel p₁ verläuft durch A(−4 | 6) und B(−2 | 2). Gib ihre Normalform an.</>, steps: () => Q.twoPoints(1, qpt(-4, 6, 'A'), qpt(-2, 2, 'B'), 'p₁') },
        { l: 'b', topic: 'normalform', text: <>Die nach unten geöffnete Normalparabel p₂ hat S₂(−1 | 2). Ermittle rechnerisch ihre Normalform.</>, steps: () => Q.normFromVertex(-1, -1, 2, 'p₂') },
        { l: 'c', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, 4, 6, 'p₁'))} und {pn(Pb(-1, -2, 1, 'p₂'))} (x von −5 bis 3, y von −4 bis 7).</>, ...dq([Pb(1, 4, 6, 'p₁'), Pb(-1, -2, 1, 'p₂')], [-5, 3, -4, 7]) }
    ]},
    { id: '2017-II', label: 'MSA 2017 II', nr: '5', parts: [
        { l: 'a', topic: 'zweipunkte', text: <>Die nach oben geöffnete Normalparabel p₁ verläuft durch A(−2 | 3) und B(1 | −6). Berechne ihre Normalform.</>, steps: () => Q.twoPoints(1, qpt(-2, 3, 'A'), qpt(1, -6, 'B'), 'p₁') },
        { l: 'b', topic: 'scheitelform', text: <>Berechne die Scheitelpunktform von {pn(Pb(-1, 2, 3, 'p₂'))} und gib S an.</>, steps: () => Q.vertexFromNorm(Pb(-1, 2, 3, 'p₂'), 'S') },
        { l: 'c', topic: 'nullstellen', text: <>Die Parabel {pn(Pb(-1, 2, 3, 'p₂'))} schneidet die x-Achse in N₁ und N₂. Berechne die x-Koordinaten.</>, steps: () => Q.zeros(Pb(-1, 2, 3, 'p₂')) },
        { l: 'd', topic: 'parabeln', text: <>Die Parabel {pn(Pb(1, 0, -1, 'p₃'))} schneidet {pn(Pb(-1, 2, 3, 'p₂'))} in C und D. Ermittle die Koordinaten.</>, ...withFg(() => Q.intersect(Pb(-1, 2, 3, 'p₂'), Pb(1, 0, -1, 'p₃')), [Pb(-1, 2, 3, 'p₂'), Pb(1, 0, -1, 'p₃')], [qpt(-1, 0, 'D'), qpt(2, 3, 'C')], [-3, 4, -3, 5]) },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne {pn(Pb(-1, 2, 3, 'p₂'))} und {pn(Pb(1, 0, -1, 'p₃'))} (x von −3 bis 4, y von −3 bis 5).</>, ...dq([Pb(-1, 2, 3, 'p₂'), Pb(1, 0, -1, 'p₃')], [-3, 4, -3, 5]) },
        { l: 'f', topic: 'parabeln', text: <>Wie viele Schnittpunkte hat {fq('p₅: y = −x² + 1')} mit {pn(Pb(1, 0, -1, 'p₃'))}?</>, steps: () => Q.intersect(Pb(1, 0, -1, 'p₃'), Pb(-1, 0, 1, 'p₅')) }
    ]},
    { id: '2016-I', label: 'MSA 2016 I', nr: '8', intro: <>Die nach oben geöffnete Normalparabel p₁ hat den Scheitelpunkt S₁(4 | −3).</>, parts: [
        { l: 'a', topic: 'normalform', text: <>Berechne die Normalform von p₁.</>, steps: () => Q.normFromVertex(1, 4, -3, 'p₁') },
        { l: 'b', topic: 'scheitelform', text: <>Ermittle rechnerisch den Scheitelpunkt S₂ von {pn(Pb(-1, 8, -15, 'p₂'))}.</>, steps: () => Q.vertexFromNorm(Pb(-1, 8, -15, 'p₂'), 'S₂') },
        { l: 'c', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, -8, 13, 'p₁'))} und {pn(Pb(-1, 8, -15, 'p₂'))} in ein Koordinatensystem.</>, ...dq([Pb(1, -8, 13, 'p₁'), Pb(-1, 8, -15, 'p₂')], [-1, 9, -4, 5]) },
        { l: 'd', topic: 'wertetabelle', text: <>Der Punkt D(−7 | <V>y</V><sub>D</sub>) liegt auf {pn(Pb(-1, 8, -15, 'p₂'))}. Berechne y<sub>D</sub>.</>, steps: () => [Q.valueAt(Pb(-1, 8, -15, 'p₂'), -7)] },
        { l: 'e', topic: 'parabeln', text: <>Die Parabel {pn(Pb(1, -6, 5, 'p₃'))} schneidet {pn(Pb(-1, 8, -15, 'p₂'))} in P und Q. Berechne die Koordinaten.</>, ...withFg(() => Q.intersect(Pb(1, -6, 5, 'p₃'), Pb(-1, 8, -15, 'p₂')), [Pb(1, -6, 5, 'p₃'), Pb(-1, 8, -15, 'p₂')], [qpt(2, -3, 'P'), qpt(5, 0, 'Q')]) },
        { l: 'f', topic: 'zweipunkte', text: <>A(1 | 3) und B(−7 | 19) liegen auf der nach oben geöffneten Normalparabel p₄. Berechne ihre Normalform.</>, steps: () => Q.twoPoints(1, qpt(1, 3, 'A'), qpt(-7, 19, 'B'), 'p₄') }
    ]},
    { id: '2016-II', label: 'MSA 2016 II', nr: '4', parts: [
        { l: 'a', topic: 'zweipunkte', text: <>Die nach oben geöffnete Normalparabel p₁ verläuft durch A(1 | 11) und B(−3 | −5). Berechne ihre Normalform.</>, steps: () => Q.twoPoints(1, qpt(1, 11, 'A'), qpt(-3, -5, 'B'), 'p₁') },
        { l: 'b', topic: 'scheitelform', text: <>Berechne die Scheitelpunktform von {pn(Pb(1, 3, 4.25, 'p₂'))}.</>, steps: () => Q.vertexFromNorm(Pb(1, 3, 4.25, 'p₂'), 'S₂') },
        { l: 'c', topic: 'spiegeln', text: <>Durch Spiegelung von {pv(Pb(1, 3, 4.25, 'p₂'))} an der y-Achse entsteht p₃. Ermittle die Funktionsgleichung von p₃.</>, steps: () => Q.mirror(Pb(1, 3, 4.25, 'p₂'), 'y', 'p₃') },
        { l: 'd', topic: 'parabeln', text: <>Die Parabel {pn(Pb(-1, 0, 4.25, 'p₄'))} schneidet {pn(Pb(1, 3, 4.25, 'p₂'))} in C und D. Berechne die Koordinaten.</>, ...withFg(() => Q.intersect(Pb(1, 3, 4.25, 'p₂'), Pb(-1, 0, 4.25, 'p₄')), [Pb(1, 3, 4.25, 'p₂'), Pb(-1, 0, 4.25, 'p₄')], [qpt(-1.5, 2, 'D'), qpt(0, 4.25, 'C')]) },
        { l: 'e', topic: 'gerade', text: <>Die Abbildung zeigt die Normalparabel p₅ und die Gerade g. Bestimme die Gleichung von g (g verläuft durch P(−4 | 3) und Q(−5 | 5)).</>, graph: { range: [-7, 1, -1, 6], lines: [Pb(-1, -6, -5, 'p₅'), { m: -2, t: -5, n: 'g' }], points: [qpt(-4, 3, 'P'), qpt(-3, 4, 'S₅')] }, steps: () => [S.calc('Berechne die Steigung m von g.', <V>m</V>, -2, 'm = (5 − 3) : (−5 − (−4)) = 2 : (−1)', 'm = −2'), S.calc('Berechne den y-Achsenabschnitt t.', <V>t</V>, -5, '3 = −2 · (−4) + t', 't = −5')] },
        { l: 'f', topic: 'gerade', text: <>Berechne den spitzen Winkel α, den {fq('g: y = −2x − 5')} mit der x-Achse einschließt.</>, steps: () => [S.calc('Berechne α (auf zwei Nachkommastellen).', <span className="font-math-italic">α</span>, 63.43, 'tan α = |m| = 2 → α = tan⁻¹(2).', 'α ≈ 63,43°', '°', 0.06)] },
        { l: 'g', topic: 'scheitel', text: <>Ermittle rechnerisch die Normalform der Parabel p₅ (siehe Abbildung, Scheitel S₅(−3 | 4), nach unten geöffnet).</>, graph: { range: [-7, 1, -1, 6], lines: [Pb(-1, -6, -5, 'p₅')] }, steps: () => Q.readGraph(-1, -3, 4, 'p₅', true, 'S₅') }
    ]},
    { id: '2014-I', label: 'MSA 2014 I', nr: '5', intro: <>Auf der nach oben geöffneten Normalparabel p₁ liegen A(−1 | 19) und B(5 | 7).</>, parts: [
        { l: 'a', topic: 'zweipunkte', text: <>Berechne die Normalform von p₁.</>, steps: () => Q.twoPoints(1, qpt(-1, 19, 'A'), qpt(5, 7, 'B'), 'p₁') },
        { l: 'b', topic: 'scheitelform', text: <>Bestimme den Scheitelpunkt S₁ von {pn(Pb(1, -6, 12, 'p₁'))}.</>, steps: () => Q.vertexFromNorm(Pb(1, -6, 12, 'p₁'), 'S₁') },
        { l: 'c', topic: 'normalform', text: <>Die nach unten geöffnete Normalparabel p₂ hat S₂(1 | 5). Ermittle rechnerisch ihre Normalform.</>, steps: () => Q.normFromVertex(-1, 1, 5, 'p₂') },
        { l: 'd', topic: 'parabeln', text: <>Die Parabeln {pn(Pb(1, -6, 12, 'p₁'))} und {pn(Pb(-1, 2, 4, 'p₂'))} berühren sich im Punkt Q. Berechne Q.</>, ...withFg(() => Q.intersect(Pb(1, -6, 12, 'p₁'), Pb(-1, 2, 4, 'p₂')), [Pb(1, -6, 12, 'p₁'), Pb(-1, 2, 4, 'p₂')], [qpt(2, 4, 'Q')]) },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, -6, 12, 'p₁'))} und {pn(Pb(-1, 2, 4, 'p₂'))} in ein Koordinatensystem.</>, ...dq([Pb(1, -6, 12, 'p₁'), Pb(-1, 2, 4, 'p₂')], [-2, 6, -1, 7]) }
    ]},
    { id: '2014-II', label: 'MSA 2014 II', nr: '4', intro: <>A(−4,5 | 3) und B(−1,5 | 0) liegen auf der nach oben geöffneten Normalparabel p₁.</>, parts: [
        { l: 'a', topic: 'zweipunkte', text: <>Bestimme rechnerisch die Normalform von p₁.</>, steps: () => Q.twoPoints(1, qpt(-4.5, 3, 'A'), qpt(-1.5, 0, 'B'), 'p₁') },
        { l: 'b', topic: 'scheitelform', text: <>Berechne den Scheitelpunkt S₁ von {pn(Pb(1, 5, 5.25, 'p₁'))}.</>, steps: () => Q.vertexFromNorm(Pb(1, 5, 5.25, 'p₁'), 'S₁') },
        { l: 'c', topic: 'normalform', text: <>Die nach unten geöffnete Normalparabel p₂ hat S₂(−1,5 | 4). Berechne ihre Normalform.</>, steps: () => Q.normFromVertex(-1, -1.5, 4, 'p₂') },
        { l: 'd', topic: 'parabeln', text: <>Bestimme rechnerisch die Schnittpunkte Q₁ und Q₂ von {pn(Pb(1, 5, 5.25, 'p₁'))} und {pn(Pb(-1, -3, 1.75, 'p₂'))}.</>, ...withFg(() => Q.intersect(Pb(1, 5, 5.25, 'p₁'), Pb(-1, -3, 1.75, 'p₂')), [Pb(1, 5, 5.25, 'p₁'), Pb(-1, -3, 1.75, 'p₂')], [qpt(-3.5, 0, 'Q₁'), qpt(-0.5, 3, 'Q₂')]) },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, 5, 5.25, 'p₁'))} und {pn(Pb(-1, -3, 1.75, 'p₂'))} in ein Koordinatensystem.</>, ...dq([Pb(1, 5, 5.25, 'p₁'), Pb(-1, -3, 1.75, 'p₂')], [-6, 2, -2, 5]) }
    ]},
    { id: '2013-I', label: 'MSA 2013 I', nr: '4', intro: <>Die nach unten geöffnete Normalparabel p₁ hat den Scheitelpunkt S₁(2 | 1).</>, parts: [
        { l: 'a', topic: 'normalform', text: <>Ermittle rechnerisch die Normalform von p₁.</>, steps: () => Q.normFromVertex(-1, 2, 1, 'p₁') },
        { l: 'b', topic: 'nullstellen', text: <>Berechne die Schnittpunkte N₁ und N₂ von {pn(Pb(-1, 4, -3, 'p₁'))} mit der x-Achse.</>, steps: () => Q.zeros(Pb(-1, 4, -3, 'p₁')) },
        { l: 'c', topic: 'zweipunkte', text: <>Die nach oben geöffnete Normalparabel p₂ wird durch A(0 | −3) und B(4 | 5) bestimmt. Ermittle ihre Normalform.</>, steps: () => Q.twoPoints(1, qpt(0, -3, 'A'), qpt(4, 5, 'B'), 'p₂') },
        { l: 'd', topic: 'scheitelform', text: <>Berechne den Scheitelpunkt S₂ von {pn(Pb(1, -2, -3, 'p₂'))}.</>, steps: () => Q.vertexFromNorm(Pb(1, -2, -3, 'p₂'), 'S₂') },
        { l: 'e', topic: 'parabeln', text: <>Bestimme rechnerisch die Schnittpunkte Q₁ und Q₂ von {pn(Pb(-1, 4, -3, 'p₁'))} und {pn(Pb(1, -2, -3, 'p₂'))}.</>, ...withFg(() => Q.intersect(Pb(-1, 4, -3, 'p₁'), Pb(1, -2, -3, 'p₂')), [Pb(-1, 4, -3, 'p₁'), Pb(1, -2, -3, 'p₂')], [qpt(0, -3, 'Q₁'), qpt(3, 0, 'Q₂')]) },
        { l: 'f', topic: 'zeichnen', text: <>Zeichne {pn(Pb(-1, 4, -3, 'p₁'))} und {pn(Pb(1, -2, -3, 'p₂'))} in ein Koordinatensystem.</>, ...dq([Pb(-1, 4, -3, 'p₁'), Pb(1, -2, -3, 'p₂')], [-2, 5, -5, 3]) }
    ]},
    { id: '2013-II', label: 'MSA 2013 II', nr: '4', intro: <>A(−7 | 7) und B(−2 | 2) liegen auf der nach oben geöffneten Normalparabel p₁.</>, parts: [
        { l: 'a', topic: 'zweipunkte', text: <>Bestimme rechnerisch die Normalform von p₁.</>, steps: () => Q.twoPoints(1, qpt(-7, 7, 'A'), qpt(-2, 2, 'B'), 'p₁') },
        { l: 'b', topic: 'scheitelform', text: <>Berechne den Scheitelpunkt S₁ von {pn(Pb(1, 8, 14, 'p₁'))}.</>, steps: () => Q.vertexFromNorm(Pb(1, 8, 14, 'p₁'), 'S₁') },
        { l: 'c', topic: 'normalform', text: <>Die nach unten geöffnete Normalparabel p₂ hat S₂(−4 | 6). Berechne ihre Normalform.</>, steps: () => Q.normFromVertex(-1, -4, 6, 'p₂') },
        { l: 'd', topic: 'parabeln', text: <>Ermittle rechnerisch die Schnittpunkte Q₁ und Q₂ von {pn(Pb(1, 8, 14, 'p₁'))} und {pn(Pb(-1, -8, -10, 'p₂'))}.</>, ...withFg(() => Q.intersect(Pb(1, 8, 14, 'p₁'), Pb(-1, -8, -10, 'p₂')), [Pb(1, 8, 14, 'p₁'), Pb(-1, -8, -10, 'p₂')], [qpt(-6, 2, 'Q₁'), qpt(-2, 2, 'Q₂')]) },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, 8, 14, 'p₁'))} und {pn(Pb(-1, -8, -10, 'p₂'))} in ein Koordinatensystem.</>, ...dq([Pb(1, 8, 14, 'p₁'), Pb(-1, -8, -10, 'p₂')], [-8, 0, -3, 7]) }
    ]},
    { id: '2012-I', label: 'MSA 2012 I', nr: '8', intro: <>Alle Punkte dieser Wertetabelle liegen auf der nach oben geöffneten Normalparabel p₁.<LfTabelle xs={['−4', '−3', '−2', '−1', '0', '1', '2', '3', '4']} ys={['17', '10', '5', '2', '1', '2', '5', '10', '17']} /></>, parts: [
        { l: 'a', topic: 'scheitel', text: <>Gib den Scheitelpunkt S₁ an und ermittle die Normalform von p₁.</>, steps: () => [Q.vertexPt(0, 1, 'S₁'), Q.normForm(Pb(1, 0, 1, 'p₁'))] },
        { l: 'b', topic: 'scheitelform', text: <>Bestimme rechnerisch den Scheitelpunkt S₂ von {pn(Pb(-1, 8, -12, 'p₂'))}.</>, steps: () => Q.vertexFromNorm(Pb(-1, 8, -12, 'p₂'), 'S₂') },
        { l: 'c', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, 0, 1, 'p₁'))} und {pn(Pb(-1, 8, -12, 'p₂'))} in ein Koordinatensystem.</>, ...dq([Pb(1, 0, 1, 'p₁'), Pb(-1, 8, -12, 'p₂')], [-3, 8, -2, 6]) },
        { l: 'd', topic: 'nullstellen', text: <>Ermittle rechnerisch die Nullstellen von {pn(Pb(-1, 8, -12, 'p₂'))}.</>, steps: () => Q.zeros(Pb(-1, 8, -12, 'p₂')) },
        { l: 'e', topic: 'parabeln', text: <>Zeige mit einer Rechnung, dass sich {pn(Pb(1, 0, 1, 'p₁'))} und {pn(Pb(-1, 8, -12, 'p₂'))} nicht schneiden.</>, steps: () => Q.intersect(Pb(1, 0, 1, 'p₁'), Pb(-1, 8, -12, 'p₂')) },
        { l: 'f', topic: 'spiegeln', text: <>Durch Spiegelung von {pv(Pb(-1, 8, -12, 'p₂'))} an der x-Achse entsteht p₃. Gib die Normalform von p₃ an.</>, steps: () => [...Q.mirror(Pb(-1, 8, -12, 'p₂'), 'x', 'p₃'), ...Q.normFromVertex(1, 4, -4, 'p₃', { given: true })] }
    ]},
    { id: '2012-II', label: 'MSA 2012 II', nr: '7', intro: <>A(2 | 4) und B(6 | 0) liegen auf der nach oben geöffneten Normalparabel p₁.</>, parts: [
        { l: 'a', topic: 'zweipunkte', text: <>Ermittle rechnerisch die Normalform von p₁.</>, steps: () => Q.twoPoints(1, qpt(2, 4, 'A'), qpt(6, 0, 'B'), 'p₁') },
        { l: 'b', topic: 'scheitelform', text: <>Bestimme den Scheitelpunkt S₁ von {pn(Pb(1, -9, 18, 'p₁'))}.</>, steps: () => Q.vertexFromNorm(Pb(1, -9, 18, 'p₁'), 'S₁') },
        { l: 'c', topic: 'normalform', text: <>Die nach unten geöffnete Normalparabel p₂ hat S₂(3,5 | 6,25). Berechne ihre Normalform.</>, steps: () => Q.normFromVertex(-1, 3.5, 6.25, 'p₂') },
        { l: 'd', topic: 'parabeln', text: <>Bestimme rechnerisch die Schnittpunkte Q₁ und Q₂ von {pn(Pb(1, -9, 18, 'p₁'))} und {pn(Pb(-1, 7, -6, 'p₂'))}.</>, ...withFg(() => Q.intersect(Pb(1, -9, 18, 'p₁'), Pb(-1, 7, -6, 'p₂')), [Pb(1, -9, 18, 'p₁'), Pb(-1, 7, -6, 'p₂')], [qpt(2, 4, 'Q₁'), qpt(6, 0, 'Q₂')]) },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, -9, 18, 'p₁'))} und {pn(Pb(-1, 7, -6, 'p₂'))} in ein Koordinatensystem.</>, ...dq([Pb(1, -9, 18, 'p₁'), Pb(-1, 7, -6, 'p₂')], [-1, 8, -3, 7]) }
    ]},
    { id: '2011-I', label: 'MSA 2011 I', nr: '4', intro: <>A(−0,5 | 6) und B(5 | −2,25) liegen auf einer nach oben geöffneten Normalparabel p₁.</>, parts: [
        { l: 'a', topic: 'zweipunkte', text: <>Ermittle rechnerisch die Normalform von p₁.</>, steps: () => Q.twoPoints(1, qpt(-0.5, 6, 'A'), qpt(5, -2.25, 'B'), 'p₁') },
        { l: 'b', topic: 'scheitelform', text: <>Berechne den Scheitelpunkt S₁ von {pn(Pb(1, -6, 2.75, 'p₁'))}.</>, steps: () => Q.vertexFromNorm(Pb(1, -6, 2.75, 'p₁'), 'S₁') },
        { l: 'c', topic: 'nullstellen', text: <>Bestimme rechnerisch die Schnittpunkte von {pn(Pb(1, -6, 2.75, 'p₁'))} mit der x-Achse.</>, steps: () => Q.zeros(Pb(1, -6, 2.75, 'p₁')) },
        { l: 'd', topic: 'scheitelform', text: <>Berechne den Scheitelpunkt S₂ von {pn(Pb(-1, 11, -30.25, 'p₂'))}.</>, steps: () => Q.vertexFromNorm(Pb(-1, 11, -30.25, 'p₂'), 'S₂') },
        { l: 'e', topic: 'parabeln', text: <>Die Normalparabeln {pn(Pb(1, -6, 2.75, 'p₁'))} und {pn(Pb(-1, 11, -30.25, 'p₂'))} schneiden sich in P und Q. Berechne die Koordinaten.</>, ...withFg(() => Q.intersect(Pb(1, -6, 2.75, 'p₁'), Pb(-1, 11, -30.25, 'p₂')), [Pb(1, -6, 2.75, 'p₁'), Pb(-1, 11, -30.25, 'p₂')], [qpt(3, -6.25, 'P'), qpt(5.5, 0, 'Q')]) },
        { l: 'f', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, -6, 2.75, 'p₁'))} und {pn(Pb(-1, 11, -30.25, 'p₂'))} in ein Koordinatensystem.</>, ...dq([Pb(1, -6, 2.75, 'p₁'), Pb(-1, 11, -30.25, 'p₂')], [-1, 9, -7, 3]) }
    ]},
    { id: '2011-II', label: 'MSA 2011 II', nr: '5', intro: <>Die nach oben geöffnete Normalparabel p₁ hat den Scheitelpunkt S₁(−4 | −4). (Werte an die Hinweis-Gleichungen der Originalaufgabe angepasst.)</>, parts: [
        { l: 'a', topic: 'normalform', text: <>Ermittle die Normalform von p₁.</>, steps: () => Q.normFromVertex(1, -4, -4, 'p₁') },
        { l: 'b', topic: 'nullstellen', text: <>Berechne die Schnittpunkte von {pn(Pb(1, 8, 12, 'p₁'))} mit der x-Achse.</>, steps: () => Q.zeros(Pb(1, 8, 12, 'p₁')) },
        { l: 'c', topic: 'zweipunkte', text: <>P(−1 | −3) und Q(−4 | 0) liegen auf der nach unten geöffneten Normalparabel p₂. Ermittle rechnerisch ihre Normalform.</>, steps: () => Q.twoPoints(-1, qpt(-1, -3, 'P'), qpt(-4, 0, 'Q'), 'p₂') },
        { l: 'd', topic: 'scheitelform', text: <>Berechne den Scheitelpunkt S₂ von {pn(Pb(-1, -6, -8, 'p₂'))}.</>, steps: () => Q.vertexFromNorm(Pb(-1, -6, -8, 'p₂'), 'S₂') },
        { l: 'e', topic: 'parabeln', text: <>Berechne die Schnittpunkte T₁ und T₂ von {pn(Pb(1, 8, 12, 'p₁'))} und {pn(Pb(-1, -6, -8, 'p₂'))}.</>, ...withFg(() => Q.intersect(Pb(1, 8, 12, 'p₁'), Pb(-1, -6, -8, 'p₂')), [Pb(1, 8, 12, 'p₁'), Pb(-1, -6, -8, 'p₂')], [qpt(-5, -3, 'T₁'), qpt(-2, 0, 'T₂')]) },
        { l: 'f', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, 8, 12, 'p₁'))} und {pn(Pb(-1, -6, -8, 'p₂'))} in ein Koordinatensystem.</>, ...dq([Pb(1, 8, 12, 'p₁'), Pb(-1, -6, -8, 'p₂')], [-8, 1, -5, 3]) }
    ]},
    { id: '2010-I', label: 'MSA 2010 I', nr: '9', intro: <>A(5 | 8) und B(−2 | 15) liegen auf einer nach oben geöffneten Normalparabel p₁.</>, parts: [
        { l: 'a', topic: 'zweipunkte', text: <>Berechne die Normalform von p₁.</>, steps: () => Q.twoPoints(1, qpt(5, 8, 'A'), qpt(-2, 15, 'B'), 'p₁') },
        { l: 'b', topic: 'scheitelform', text: <>Berechne den Scheitelpunkt S₁ von {pn(Pb(1, -4, 3, 'p₁'))}.</>, steps: () => Q.vertexFromNorm(Pb(1, -4, 3, 'p₁'), 'S₁') },
        { l: 'c', topic: 'nullstellen', text: <>Ermittle rechnerisch die Schnittpunkte von {pn(Pb(1, -4, 3, 'p₁'))} mit der x-Achse.</>, steps: () => Q.zeros(Pb(1, -4, 3, 'p₁')) },
        { l: 'd', topic: 'scheitelform', text: <>Berechne den Scheitelpunkt S₂ von {pn(Pb(-1, 8, -13, 'p₂'))}.</>, steps: () => Q.vertexFromNorm(Pb(-1, 8, -13, 'p₂'), 'S₂') },
        { l: 'e', topic: 'parabeln', text: <>Die Normalparabeln {pn(Pb(1, -4, 3, 'p₁'))} und {pn(Pb(-1, 8, -13, 'p₂'))} schneiden sich in P und Q. Berechne die Koordinaten.</>, ...withFg(() => Q.intersect(Pb(1, -4, 3, 'p₁'), Pb(-1, 8, -13, 'p₂')), [Pb(1, -4, 3, 'p₁'), Pb(-1, 8, -13, 'p₂')], [qpt(2, -1, 'P'), qpt(4, 3, 'Q')]) },
        { l: 'f', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, -4, 3, 'p₁'))} und {pn(Pb(-1, 8, -13, 'p₂'))} in ein Koordinatensystem.</>, ...dq([Pb(1, -4, 3, 'p₁'), Pb(-1, 8, -13, 'p₂')], [-1, 7, -3, 5]) }
    ]},
    { id: '2010-II', label: 'MSA 2010 II', nr: '7', intro: <>Die Zeichnung zeigt die nach unten geöffnete Normalparabel p₁ mit dem Scheitelpunkt S₁(0,5 | 4).</>, graph: { range: [-3, 4, -3, 5], lines: [Pb(-1, 1, 3.75, 'p₁')], points: [qpt(0.5, 4, 'S₁')] }, parts: [
        { l: 'a', topic: 'scheitel', text: <>Ermittle rechnerisch die Normalform von p₁.</>, steps: () => Q.normFromVertex(-1, 0.5, 4, 'p₁') },
        { l: 'b', topic: 'spiegeln', text: <>Durch Spiegelung von p₁ an der x-Achse entsteht p₂. Berechne die Normalform von p₂.</>, steps: () => [...Q.mirror(Pb(-1, 1, 3.75, 'p₁'), 'x', 'p₂'), ...Q.normFromVertex(1, 0.5, -4, 'p₂', { given: true })] },
        { l: 'c', topic: 'nullstellen', text: <>Berechne die Schnittpunkte von {pn(Pb(1, -1, -3.75, 'p₂'))} mit der x-Achse.</>, steps: () => Q.zeros(Pb(1, -1, -3.75, 'p₂')) },
        { l: 'd', topic: 'gerade', text: <>Die Gerade {fq('g: y = −2x − 3')} schneidet {pn(Pb(1, -1, -3.75, 'p₂'))} in A und B. Ermittle die Koordinaten.</>, ...withFg(() => Q.intersect(Pb(1, -1, -3.75, 'p₂'), { m: -2, t: -3, n: 'g' }), [Pb(1, -1, -3.75, 'p₂'), { m: -2, t: -3, n: 'g' }], [qpt(-1.5, 0, 'B'), qpt(0.5, -4, 'A')]) },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, -1, -3.75, 'p₂'))} und {fq('g: y = −2x − 3')} in ein neues Koordinatensystem.</>, graph: null, ...dq([Pb(1, -1, -3.75, 'p₂'), { m: -2, t: -3, n: 'g' }], [-4, 4, -5, 4]) }
    ]},
    { id: 'Muster-I', label: 'MSA Musterprüfung I', nr: '1', parts: [
        { l: 'a', topic: 'wertetabelle', text: <>Auf {pn(Pb(1, 2, 5, 'p₁'))} liegen A(−3 | <V>y</V><sub>A</sub>), B(<V>x</V><sub>B</sub> | 13) und C(<V>x</V><sub>C</sub> | 13). Berechne die fehlenden Koordinaten.</>, steps: () => [Q.valueAt(Pb(1, 2, 5, 'p₁'), -3, 'Berechne y_A.'), ...Q.missingX(Pb(1, 2, 5, 'p₁'), 13)] },
        { l: 'b', topic: 'scheitelform', text: <>Bestimme die Scheitelpunktform von {pn(Pb(1, 2, 5, 'p₁'))} und gib S₁ an.</>, steps: () => Q.vertexFromNorm(Pb(1, 2, 5, 'p₁'), 'S₁') },
        { l: 'c', topic: 'zweipunkte', text: <>D(−1 | −12) und E(2 | −9) liegen auf der nach unten geöffneten Normalparabel p₂. Ermittle rechnerisch ihre Normalform.</>, steps: () => Q.twoPoints(-1, qpt(-1, -12, 'D'), qpt(2, -9, 'E'), 'p₂') },
        { l: 'd', topic: 'normalform', text: <>Die nach oben geöffnete Normalparabel p₃ hat S₃(2,5 | −3). Bestimme ihre Normalform.</>, steps: () => Q.normFromVertex(1, 2.5, -3, 'p₃') },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, 2, 5, 'p₁'))} und {pn(Pb(1, -5, 3.25, 'p₃'))} in ein Koordinatensystem.</>, ...dq([Pb(1, 2, 5, 'p₁'), Pb(1, -5, 3.25, 'p₃')], [-4, 6, -4, 9]) },
        { l: 'f', topic: 'spiegeln', text: <>Eine nach oben geöffnete Parabel p₄ wird an der y-Achse gespiegelt; die entstandene Parabel p₅ hat dieselbe Gleichung. Wo liegt der Scheitel S₄?</>, steps: () => [S.select('Wo liegt S₄?', [<span>auf der y-Achse</span>, <span>auf der x-Achse</span>, <span>im 1. Quadranten</span>, <span>im Ursprung — nur dort</span>], 0, 'Bei der Spiegelung an der y-Achse wechselt die x-Koordinate des Scheitels ihr Vorzeichen. Bleibt die Parabel gleich, muss x_S = 0 sein.', 'S₄ liegt auf der y-Achse (x_S = 0).')] }
    ]},
    { id: 'Muster-II', label: 'MSA Musterprüfung II', nr: '1', parts: [
        { l: 'a', topic: 'nullstellen', text: <>Die Parabel {pn(Pb(-1, 7, -10, 'p₁'))} schneidet die x-Achse in N₁ und N₂. Berechne die x-Koordinaten.</>, steps: () => Q.zeros(Pb(-1, 7, -10, 'p₁')) },
        { l: 'b', topic: 'wertetabelle', text: <>Überprüfe, ob Q(3 | −2) und P(7 | −10) auf {pn(Pb(-1, 7, -10, 'p₁'))} liegen.</>, steps: () => [...Q.probe(Pb(-1, 7, -10, 'p₁'), qpt(3, -2, 'Q')), ...Q.probe(Pb(-1, 7, -10, 'p₁'), qpt(7, -10, 'P'))] },
        { l: 'c', topic: 'normalform', text: <>Die nach oben geöffnete Normalparabel p₂ hat S₂(5 | −4). Ermittle rechnerisch ihre Normalform.</>, steps: () => Q.normFromVertex(1, 5, -4, 'p₂') },
        { l: 'd', topic: 'gerade', text: <>Die Gerade {fq('g: y = 3x − 4')} schneidet {fq('p₃: y = (x − 2)² + 2')} in R und T. Berechne die Koordinaten.</>, ...withFg(() => [...Q.normFromVertex(1, 2, 2, 'p₃', { given: true }), ...Q.intersect(Pb(1, -4, 6, 'p₃'), { m: 3, t: -4, n: 'g' })], [Pb(1, -4, 6, 'p₃'), { m: 3, t: -4, n: 'g' }], [qpt(2, 2, 'R'), qpt(5, 11, 'T')]) },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne {pn(Pb(1, -10, 21, 'p₂'))} und {fq('p₃: y = (x − 2)² + 2')} in ein Koordinatensystem.</>, ...dq([Pb(1, -10, 21, 'p₂'), Pb(1, -4, 6, 'p₃')], [-1, 8, -5, 7]) },
        { l: 'f', topic: 'parabeln', text: <>Welche Parabel p₅ hat genau einen gemeinsamen Punkt mit {fq('p₄: y = (x − 1)² + 3')}?</>, steps: () => [S.select('Welche Parabel passt?', [fq('y = −(x − 1)² + 3'), fq('y = (x − 1)² + 1'), fq('y = −(x − 1)² + 5')], 0, 'Eine nach unten geöffnete Parabel mit demselben Scheitel berührt p₄ genau im Scheitelpunkt.', 'z. B. y = −(x − 1)² + 3')] }
    ]}
];

// ==========================================
// 5. THEMEN (Kacheln)
// ==========================================
const QF_TOPICS = [
    { id: 'wertetabelle', nr: 1, title: 'Wertetabelle & Punktprobe', desc: 'y-Werte berechnen, prüfen ob ein Punkt auf der Parabel liegt, fehlende Koordinaten bestimmen.' },
    { id: 'scheitel', nr: 2, title: 'Scheitelpunkt & Öffnung', desc: 'Scheitel und Öffnung ablesen — aus der Gleichung und aus dem Graphen.' },
    { id: 'zeichnen', nr: 3, title: 'Parabel zeichnen', desc: 'Scheitel setzen und mit der Schablone Normalparabeln zeichnen.' },
    { id: 'normalform', nr: 4, title: 'Scheitelpunktform → Normalform', desc: 'Aus dem Scheitelpunkt die Normalform y = x² + px + q berechnen (binomische Formel).' },
    { id: 'scheitelform', nr: 5, title: 'Normalform → Scheitelpunktform', desc: 'Mit der quadratischen Ergänzung den Scheitelpunkt berechnen.' },
    { id: 'nullstellen', nr: 6, title: 'Quadratische Gleichungen & Nullstellen', desc: 'Mit der pq-Formel lösen: zwei, eine oder keine Lösung?' },
    { id: 'zweipunkte', nr: 7, title: 'Parabel durch zwei Punkte', desc: 'Mit einem Gleichungssystem p und q bestimmen.' },
    { id: 'spiegeln', nr: 8, title: 'Spiegeln & Verschieben', desc: 'Parabeln an der x- oder y-Achse spiegeln und die neue Gleichung angeben.' },
    { id: 'gerade', nr: 9, title: 'Parabel und Gerade', desc: 'Schnittpunkte, Berührpunkte oder keine gemeinsamen Punkte berechnen.' },
    { id: 'parabeln', nr: 10, title: 'Schnittpunkte zweier Parabeln', desc: 'Gleichsetzen, vereinfachen und mit der pq-Formel lösen.' },
    { id: 'pruefung', nr: 11, title: 'MSA-Prüfungsaufgaben', desc: 'Komplette Prüfungsaufgaben 2010–2025 Teilaufgabe für Teilaufgabe durcharbeiten.' }
];

// ==========================================
// 6. START
// ==========================================
fkMount({
    key: 'quadratische',
    title: 'Quadratische Funktionen',
    icon: ParabelIcon,
    theme: 'fuchsia',
    beta: true,
    topics: QF_TOPICS,
    gen: QGEN,
    exams: QF_EXAMS
});
