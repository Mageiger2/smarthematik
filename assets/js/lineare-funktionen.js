// ==========================================
// lineare-funktionen.js — Trainer „Lineare Funktionen“ mit Themen-Kacheln
// Wird inline mit shared.js und funktionen-kern.js zusammen kompiliert.
// Der Kern liefert Koordinatensystem, Schritt-Runner, Kachel-Übersicht,
// Themen-Trainer und Prüfungsmodus; hier stehen nur die Schritt-Bausteine
// für Geraden, die Aufgaben-Generatoren, die Prüfungsaufgaben und die Themen.
// Streak/Adaptiv werden pro Thema gespeichert (smarth_*_lineare_<thema>).
// Schreibweise wie in Bayern: y = mx + t.
// Theme-Farbe: blue.
// ==========================================

// Icon: Gerade im Koordinatenkreuz
function LinearIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="3" y1="21" x2="3" y2="3" strokeWidth="1.2" />
            <line x1="3" y1="21" x2="21" y2="21" strokeWidth="1.2" />
            <line x1="4" y1="18" x2="21" y2="4" strokeWidth="2.2" />
            <path d="M 9 13.9 L 14 13.9 L 14 9.8" strokeWidth="1.2" strokeDasharray="1.6 1.4" />
        </svg>
    );
}

// ==========================================
// 3. SCHRITT-BAUSTEINE
// Jeder Baustein liefert ein oder mehrere Schritt-Objekte:
//   select: { options, correctIdx, noShuffle }
//   fill:   { inputs:[{id, correct, tol}], render(h), altSets, summary(vals) }
//   calc:   { label, unit, correct, tol }
//   points: { count, check(p), graph }
// Alle mit goal (Titel), hint (Tipp) und solution (Lösung als Text).
// ==========================================

// Schrittweite fürs Steigungsdreieck als Text: "3 nach rechts, 2 nach oben"
const lfSlopeWalk = (m) => {
    const f = lfFrac(m) || { n: m, d: 1 };
    const d = f.d, n = f.n;
    return `${d} nach rechts, ${Math.abs(n)} nach ${n >= 0 ? 'oben' : 'unten'}`;
};

// ---- Normalform y = mx + t eingeben ----
S.final = (m, t, name) => ({
    type: 'fill',
    goal: name ? `Gib die Funktionsgleichung von ${name} an.` : 'Gib die Funktionsgleichung an.',
    inputs: [{ id: 'm', correct: m }, { id: 't', correct: t }],
    render: (h) => <LfZeile>{name && <span className="mr-1">{name}:</span>}<V>y</V> = {h.input('m')}<V>x</V> + {h.input('t')}</LfZeile>,
    hint: 'Setze m und t in die Normalform y = mx + t ein. Ist t negativ, trägst du eine negative Zahl ein (z. B. −3).',
    solution: (name ? name + ': ' : '') + lfGlS(m, t)
});

// ---- Ablesen am Graphen ----
S.readT = (t) => ({
    type: 'fill', goal: 'Lies den y-Achsenabschnitt t ab.',
    inputs: [{ id: 't', correct: t }],
    render: (h) => <LfZeile><V>t</V> = {h.input('t')}</LfZeile>,
    hint: 'Wo schneidet die Gerade die y-Achse? Der y-Wert dieses Punktes ist t.',
    solution: `t = ${lfS(t)}`
});
S.readM = (m) => ({
    type: 'fill', goal: 'Bestimme die Steigung m mit einem Steigungsdreieck.',
    inputs: [{ id: 'm', correct: m }],
    render: (h) => <LfZeile><V>m</V> = {h.input('m')}</LfZeile>,
    hint: `Suche zwei Gitterpunkte auf der Geraden. Zähle, wie weit du nach rechts gehst (Δx) und wie weit nach oben (+) oder unten (−) (Δy): m = Δy : Δx. Brüche kannst du als 2/3 eingeben.`,
    solution: `m = ${lfS(m)}  (${lfSlopeWalk(m)})`
});
S.readGraph = (m, t, name) => [S.readT(t), S.readM(m), S.final(m, t, name)];

// ---- In Normalform bringen ----
// eq: { A, B, C } mit A·y + B·x + C = 0; isolated: y steht schon allein.
S.normal = (eq, name) => {
    const { A, B, C } = eq;
    const m = lfR(-B / A), t = lfR(-C / A);
    const steps = [];
    if (!eq.isolated && A !== 1) {
        const yS = A === -1 ? '−y' : `${lfS(A)}y`;
        steps.push({
            type: 'fill', goal: 'Bringe alle Terme ohne y auf die rechte Seite.',
            inputs: [{ id: 'a', correct: A }, { id: 'b', correct: lfR(-B) }, { id: 'c', correct: lfR(-C) }],
            altSets: [{ a: lfR(-A), b: B, c: C }],
            render: (h) => <LfZeile>{h.input('a', 'w-16')}<V>y</V> = {h.input('b')}<V>x</V> + {h.input('c')}</LfZeile>,
            hint: 'Rechne mit der Gegenoperation: Ein „+ 2x“ auf der linken Seite wird rechts zu „− 2x“. Links bleibt nur der Term mit y stehen.',
            solution: `${yS} = ${lfSideS([{ c: -B, v: 'x' }, { c: -C, v: '' }].filter(q => q.c !== 0))}`
        });
        steps.push({
            ...S.final(m, t, name),
            goal: `Teile durch ${lfS(A)} und gib die Normalform an.`,
            hint: `Teile jeden Term auf beiden Seiten durch ${lfP(A)}. Achte auf die Vorzeichen!`
        });
    } else {
        steps.push({
            ...S.final(m, t, name),
            goal: 'Bringe die Gleichung in die Normalform y = mx + t.',
            hint: eq.isolated
                ? 'y steht schon allein. Sortiere nur um: zuerst der x-Term (m), dann die Zahl (t).'
                : 'Bringe alle Terme ohne y mit der Gegenoperation auf die andere Seite, bis y allein steht.'
        });
    }
    return steps;
};
S.normalStr = (str, name) => S.normal(lfParseEq(str), name);

// ---- Nullstelle / Achsenschnittpunkte ----
S.zeroCond = () => ({
    type: 'select', goal: 'Welche Bedingung gilt für den Schnittpunkt mit der x-Achse?',
    options: [<span className="font-math"><V>y</V> = 0</span>, <span className="font-math"><V>x</V> = 0</span>, <span className="font-math"><V>m</V> = 0</span>],
    correctIdx: 0,
    hint: 'Jeder Punkt auf der x-Achse hat die y-Koordinate 0.',
    solution: 'y = 0'
});
S.zero = (m, t, name = 'N', opts = {}) => {
    const x0 = lfR(-t / m);
    const steps = [];
    if (opts.cond) steps.push(S.zeroCond());
    steps.push({
        type: 'fill', goal: 'Setze y = 0 in die Funktionsgleichung ein.',
        inputs: [{ id: 'm', correct: m }, { id: 't', correct: t }],
        render: (h) => <LfZeile>0 = {h.input('m')}<V>x</V> + {h.input('t')}</LfZeile>,
        hint: 'Ersetze y durch 0. Der Rest der Gleichung bleibt gleich.',
        solution: `0 = ${lfS(m)}x ${t < 0 ? '−' : '+'} ${lfS(Math.abs(t))}`
    });
    steps.push({
        type: 'calc', goal: 'Löse die Gleichung nach x auf.',
        label: <V>x</V>, correct: x0,
        hint: `Rechne zuerst ${t < 0 ? '+ ' + lfS(-t) : '− ' + lfS(t)} auf beiden Seiten und teile dann durch ${lfP(m)}.`,
        solution: `x = ${lfS(-t)} : ${lfP(m)} = ${lfS(x0)}`
    });
    steps.push({
        type: 'fill', goal: `Gib den Schnittpunkt ${name} an.`,
        inputs: [{ id: 'x', correct: x0 }, { id: 'y', correct: 0 }],
        render: (h) => <LfZeile>{name}( {h.input('x')} | {h.input('y')} )</LfZeile>,
        hint: 'Der Punkt liegt auf der x-Achse: Die y-Koordinate ist 0.',
        solution: `${name}(${lfS(x0)} | 0)`
    });
    return steps;
};
S.yAxis = (t, name = 'Sᵧ') => ({
    type: 'fill', goal: `Gib den Schnittpunkt ${name} mit der y-Achse an.`,
    inputs: [{ id: 'x', correct: 0 }, { id: 'y', correct: t }],
    render: (h) => <LfZeile>{name}( {h.input('x')} | {h.input('y')} )</LfZeile>,
    hint: 'Auf der y-Achse ist x = 0. Setzt du x = 0 ein, bleibt nur t übrig.',
    solution: `${name}(0 | ${lfS(t)})`
});

// ---- Steigung aus zwei Punkten ----
S.slope = (A, B) => {
    const m = lfR((B.y - A.y) / (B.x - A.x));
    return [
        {
            type: 'fill', goal: 'Setze die Koordinaten in die Steigungsformel ein.',
            inputs: [{ id: 'y2', correct: B.y }, { id: 'y1', correct: A.y }, { id: 'x2', correct: B.x }, { id: 'x1', correct: A.x }],
            altSets: [{ y2: A.y, y1: B.y, x2: A.x, x1: B.x }],
            render: (h) => (
                <LfZeile>
                    <V>m</V> =
                    <span className="inline-flex flex-col items-center mx-1">
                        <span className="border-b-2 border-current pb-1 px-1 flex items-center">{h.input('y2', 'w-16')} − ({h.input('y1', 'w-16')})</span>
                        <span className="pt-1 px-1 flex items-center">{h.input('x2', 'w-16')} − ({h.input('x1', 'w-16')})</span>
                    </span>
                </LfZeile>
            ),
            summary: (v) => `m = (${v.y2} − (${v.y1})) : (${v.x2} − (${v.x1}))`,
            hint: <>Steigungsformel: <span className="font-math"><V>m</V> = (<V>y</V>₂ − <V>y</V>₁) : (<V>x</V>₂ − <V>x</V>₁)</span>. Nimm {B.n || 'den zweiten Punkt'} als Punkt 2 und {A.n || 'den ersten Punkt'} als Punkt 1 — oben die y-Werte, unten die x-Werte.</>,
            solution: `m = (${lfS(B.y)} − ${lfP(A.y)}) : (${lfS(B.x)} − ${lfP(A.x)})`
        },
        {
            type: 'calc', goal: 'Berechne die Steigung m.',
            label: <V>m</V>, correct: m,
            hint: `Zähler: ${lfS(B.y)} − ${lfP(A.y)} = ${lfS(B.y - A.y)}; Nenner: ${lfS(B.x)} − ${lfP(A.x)} = ${lfS(B.x - A.x)}. Brüche darfst du als 3/4 eingeben.`,
            solution: `m = ${lfS(B.y - A.y)} : ${lfP(B.x - A.x)} = ${lfS(m)}`
        }
    ];
};

// ---- t aus Punkt und Steigung ----
S.tFromPoint = (m, P) => {
    const t = lfR(P.y - m * P.x);
    return [
        {
            type: 'fill', goal: `Setze m und den Punkt ${P.n || 'P'} in y = mx + t ein.`,
            inputs: [{ id: 'y', correct: P.y }, { id: 'm', correct: m }, { id: 'x', correct: P.x }],
            render: (h) => <LfZeile>{h.input('y')} = {h.input('m')} · {h.input('x')} + <V>t</V></LfZeile>,
            hint: `Für x und y setzt du die Koordinaten von ${lfPt(P)} ein, für m die Steigung ${lfS(m)}.`,
            solution: `${lfS(P.y)} = ${lfS(m)} · ${lfP(P.x)} + t`
        },
        {
            type: 'calc', goal: 'Berechne den y-Achsenabschnitt t.',
            label: <V>t</V>, correct: t,
            hint: `${lfS(m)} · ${lfP(P.x)} = ${lfS(m * P.x)}. Bringe diese Zahl mit der Gegenoperation auf die linke Seite.`,
            solution: `t = ${lfS(P.y)} − ${lfP(m * P.x)} = ${lfS(t)}`
        }
    ];
};
S.linePM = (P, m, name) => [...S.tFromPoint(m, P), S.final(m, lfR(P.y - m * P.x), name)];
S.line2P = (A, B, name) => {
    const m = lfR((B.y - A.y) / (B.x - A.x));
    return [...S.slope(A, B), ...S.tFromPoint(m, A), S.final(m, lfR(A.y - m * A.x), name)];
};

// ---- Punktprobe ----
// Rechte Seite "m · □ + t" mit einem Eingabefeld für x
const lfRhs = (m, t, xInput) => (
    <>{lfR(m) === 1 ? null : lfR(m) === -1 ? '−' : <><Z v={m} /> · </>}{xInput}{lfR(t) !== 0 && <> {t < 0 ? '−' : '+'} <Z v={Math.abs(t)} /></>}</>
);
S.probe = (m, t, P, name = 'g') => {
    const rhs = lfR(m * P.x + t);
    const on = lfSame(rhs, P.y);
    return [
        {
            type: 'fill', goal: `Setze die Koordinaten von ${P.n || 'P'} in die Gleichung von ${name} ein.`,
            inputs: [{ id: 'y', correct: P.y }, { id: 'x', correct: P.x }],
            render: (h) => <LfZeile>{h.input('y')} = {lfRhs(m, t, h.input('x'))}</LfZeile>,
            hint: `Links steht die y-Koordinate (${lfS(P.y)}), rechts setzt du für x die x-Koordinate (${lfS(P.x)}) ein.`,
            solution: `${lfS(P.y)} = ${lfS(m)} · ${lfP(P.x)} ${t < 0 ? '−' : '+'} ${lfS(Math.abs(t))}`
        },
        {
            type: 'calc', goal: 'Berechne die rechte Seite.',
            label: <span>rechte Seite</span>, correct: rhs,
            hint: `Punkt vor Strich: zuerst ${lfS(m)} · ${lfP(P.x)} = ${lfS(m * P.x)}, dann t dazurechnen.`,
            solution: `${lfS(m)} · ${lfP(P.x)} ${t < 0 ? '−' : '+'} ${lfS(Math.abs(t))} = ${lfS(rhs)}`
        },
        {
            type: 'select', goal: `Liegt ${P.n || 'P'} auf ${name}?`, noShuffle: true,
            options: [<span>Ja — {P.n || 'P'} liegt auf {name}.</span>, <span>Nein — {P.n || 'P'} liegt nicht auf {name}.</span>],
            correctIdx: on ? 0 : 1,
            hint: 'Vergleiche: Ist die rechte Seite gleich der y-Koordinate, ergibt sich eine wahre Aussage.',
            solution: on ? `${lfS(P.y)} = ${lfS(rhs)} (wahr) → ${P.n || 'P'} liegt auf ${name}.` : `${lfS(P.y)} ≠ ${lfS(rhs)} (falsch) → ${P.n || 'P'} liegt nicht auf ${name}.`
        }
    ];
};
S.missingY = (m, t, x, pn = 'P') => {
    const y = lfR(m * x + t);
    return [
        {
            type: 'fill', goal: `Setze die x-Koordinate von ${pn} ein.`,
            inputs: [{ id: 'x', correct: x }],
            render: (h) => <LfZeile><V>y</V> = {lfRhs(m, t, h.input('x'))}</LfZeile>,
            hint: `Setze x = ${lfS(x)} in die Funktionsgleichung ein.`,
            solution: `y = ${lfS(m)} · ${lfP(x)} ${t < 0 ? '−' : '+'} ${lfS(Math.abs(t))}`
        },
        {
            type: 'calc', goal: 'Berechne die fehlende y-Koordinate.',
            label: <V>y</V>, correct: y,
            hint: `Punkt vor Strich: ${lfS(m)} · ${lfP(x)} = ${lfS(m * x)}.`,
            solution: `y = ${lfS(y)} → ${pn}(${lfS(x)} | ${lfS(y)})`
        }
    ];
};
S.missingX = (m, t, y, pn = 'P') => {
    const x = lfR((y - t) / m);
    return [
        {
            type: 'fill', goal: `Setze die y-Koordinate von ${pn} ein.`,
            inputs: [{ id: 'y', correct: y }],
            render: (h) => <LfZeile>{h.input('y')} = {lfRhs(m, t, <V>x</V>)}</LfZeile>,
            hint: `Diesmal ist y bekannt: Setze y = ${lfS(y)} ein.`,
            solution: `${lfS(y)} = ${lfS(m)}x ${t < 0 ? '−' : '+'} ${lfS(Math.abs(t))}`
        },
        {
            type: 'calc', goal: 'Löse nach x auf.',
            label: <V>x</V>, correct: x,
            hint: `Zuerst t auf die andere Seite bringen (${t < 0 ? '+ ' + lfS(-t) : '− ' + lfS(t)}), dann durch ${lfP(m)} teilen.`,
            solution: `x = (${lfS(y)} − ${lfP(t)}) : ${lfP(m)} = ${lfS(x)}`
        }
    ];
};
S.unknownM = (P, t, name = 'g') => {
    const m = lfR((P.y - t) / P.x);
    return [
        {
            type: 'fill', goal: `Setze die Koordinaten von ${P.n || 'P'} ein.`,
            inputs: [{ id: 'y', correct: P.y }, { id: 'x', correct: P.x }],
            render: (h) => <LfZeile>{h.input('y')} = <V>m</V> · {h.input('x')}{lfR(t) !== 0 && <> {t < 0 ? '−' : '+'} <Z v={Math.abs(t)} /></>}</LfZeile>,
            hint: `Links die y-Koordinate (${lfS(P.y)}), rechts für x die x-Koordinate (${lfS(P.x)}).`,
            solution: `${lfS(P.y)} = m · ${lfP(P.x)} ${t < 0 ? '−' : '+'} ${lfS(Math.abs(t))}`
        },
        {
            type: 'calc', goal: 'Löse nach m auf.',
            label: <V>m</V>, correct: m,
            hint: `Bringe t auf die linke Seite (${t < 0 ? '+ ' + lfS(-t) : '− ' + lfS(t)}) und teile durch ${lfP(P.x)}.`,
            solution: `m = (${lfS(P.y)} − ${lfP(t)}) : ${lfP(P.x)} = ${lfS(m)}`
        }
    ];
};

// ---- Parallel / senkrecht ----
S.relation = (kind) => ({
    type: 'select', goal: 'Welche Beziehung gilt für die Steigungen?',
    options: [
        <span className="font-math"><V>m</V>₂ = <V>m</V>₁</span>,
        <span className="font-math"><V>m</V>₁ · <V>m</V>₂ = −1</span>,
        <span className="font-math"><V>m</V>₂ = −<V>m</V>₁</span>
    ],
    correctIdx: kind === 'parallel' ? 0 : 1,
    hint: 'Parallele Geraden haben die gleiche Steigung. Bei senkrechten Geraden ergibt das Produkt der Steigungen −1.',
    solution: kind === 'parallel' ? 'm₂ = m₁' : 'm₁ · m₂ = −1'
});
S.m2 = (kind, m1) => {
    const m2 = kind === 'parallel' ? m1 : lfR(-1 / m1);
    return {
        type: 'calc', goal: kind === 'parallel' ? 'Gib die Steigung m₂ der Parallelen an.' : 'Berechne die Steigung m₂ der senkrechten Geraden.',
        label: <span className="font-math"><V>m</V>₂</span>, correct: m2,
        hint: kind === 'parallel'
            ? `Parallele Geraden haben die gleiche Steigung: m₂ = m₁ = ${lfS(m1)}.`
            : `m₂ = −1 : m₁ = −1 : ${lfP(m1)}. Merke: Kehrwert bilden und Vorzeichen umdrehen.`,
        solution: kind === 'parallel' ? `m₂ = ${lfS(m2)}` : `m₂ = −1 : ${lfP(m1)} = ${lfS(m2)}`
    };
};
S.perpLine = (kind, m1, P, name, opts = {}) => {
    const m2 = kind === 'parallel' ? m1 : lfR(-1 / m1);
    const steps = [];
    if (opts.rel) steps.push(S.relation(kind));
    steps.push(S.m2(kind, m1));
    steps.push(...S.linePM(P, m2, name));
    return steps;
};
S.horizontal = (P, name) => ({
    type: 'fill', goal: `Gib die Funktionsgleichung von ${name} an.`,
    inputs: [{ id: 't', correct: P.y }],
    render: (h) => <LfZeile>{name && <span className="mr-1">{name}:</span>}<V>y</V> = {h.input('t')}</LfZeile>,
    hint: `Eine Parallele zur x-Achse hat die Steigung 0. Alle Punkte haben dieselbe y-Koordinate wie ${P.n || 'der Punkt'}.`,
    solution: `${name}: y = ${lfS(P.y)}`
});
// Prüfen, ob zwei Geraden senkrecht stehen: m₁ · m₂ berechnen
S.checkPerp = (m1, m2, n1, n2) => {
    const prod = lfR(m1 * m2);
    const isPerp = lfSame(prod, -1);
    return [
        {
            type: 'calc', goal: `Berechne das Produkt der Steigungen von ${n1} und ${n2}.`,
            label: <span className="font-math"><V>m</V>₁ · <V>m</V>₂</span>, correct: prod,
            hint: `Die Steigungen sind m₁ = ${lfS(m1)} und m₂ = ${lfS(m2)}. Multipliziere sie.`,
            solution: `${lfS(m1)} · ${lfP(m2)} = ${lfS(prod)}`
        },
        {
            type: 'select', goal: `Stehen ${n1} und ${n2} senkrecht aufeinander?`, noShuffle: true,
            options: [<span>Ja, weil <span className="font-math"><V>m</V>₁ · <V>m</V>₂ = −1</span>.</span>, <span>Nein, weil <span className="font-math"><V>m</V>₁ · <V>m</V>₂ ≠ −1</span>.</span>],
            correctIdx: isPerp ? 0 : 1,
            hint: 'Zwei Geraden stehen senkrecht aufeinander, wenn das Produkt ihrer Steigungen −1 ergibt.',
            solution: isPerp ? 'Ja: m₁ · m₂ = −1' : `Nein: m₁ · m₂ = ${lfS(prod)} ≠ −1`
        }
    ];
};
// Lagebeziehung zweier Geraden auswählen
S.lage = (g1, g2) => {
    const same = lfSame(g1.m, g2.m) && lfSame(g1.t, g2.t);
    const par = lfSame(g1.m, g2.m) && !same;
    const perp = lfSame(g1.m * g2.m, -1);
    const idx = same ? 3 : par ? 0 : perp ? 1 : 2;
    return {
        type: 'select', goal: `Wie liegen ${g1.n} und ${g2.n} zueinander?`, noShuffle: true,
        options: [<span>parallel (gleiche Steigung, verschiedenes t)</span>, <span>senkrecht (m₁ · m₂ = −1)</span>, <span>weder parallel noch senkrecht</span>, <span>identisch (gleiche Gerade)</span>],
        correctIdx: idx,
        hint: `Vergleiche die Steigungen: m₁ = ${lfS(g1.m)}, m₂ = ${lfS(g2.m)}. Gleich → parallel (oder identisch). Produkt −1 → senkrecht.`,
        solution: ['parallel', 'senkrecht', 'weder parallel noch senkrecht', 'identisch'][idx]
    };
};

// ---- Steigungswinkel ----
S.angle = (m) => {
    const a = Math.abs(m);
    const alpha = lfR(Math.atan(a) * 180 / Math.PI, 2);
    return [
        {
            type: 'fill', goal: 'Stelle die Gleichung für den Steigungswinkel α auf.',
            inputs: [{ id: 'tan', correct: a }],
            render: (h) => <LfZeile>tan <span className="font-math-italic">α</span> = {h.input('tan')}</LfZeile>,
            hint: 'Im Steigungsdreieck gilt: tan α = Gegenkathete : Ankathete = Δy : Δx = m. Für den spitzen Winkel nimmst du den Betrag von m.',
            solution: `tan α = ${lfS(a)}`
        },
        {
            type: 'calc', goal: 'Berechne den Winkel α (auf zwei Nachkommastellen).',
            label: <span className="font-math-italic">α</span>, unit: '°', correct: alpha, tol: 0.06,
            hint: `Nutze die Umkehrfunktion am Rechner: α = tan⁻¹(${lfS(a)}).`,
            solution: `α = tan⁻¹(${lfS(a)}) ≈ ${lfS(alpha)}°`
        }
    ];
};

// ---- Schnittpunkt zweier Geraden ----
S.intersect = (g1, g2, name = 'S') => {
    const xs = lfR((g2.t - g1.t) / (g1.m - g2.m));
    const ys = lfR(g1.m * xs + g1.t);
    return [
        {
            type: 'fill', goal: `Setze die Funktionsterme von ${g1.n} und ${g2.n} gleich.`,
            inputs: [{ id: 'm1', correct: g1.m }, { id: 't1', correct: g1.t }, { id: 'm2', correct: g2.m }, { id: 't2', correct: g2.t }],
            altSets: [{ m1: g2.m, t1: g2.t, m2: g1.m, t2: g1.t }],
            render: (h) => <LfZeile>{h.input('m1', 'w-16')}<V>x</V> + {h.input('t1', 'w-16')} = {h.input('m2', 'w-16')}<V>x</V> + {h.input('t2', 'w-16')}</LfZeile>,
            hint: 'Im Schnittpunkt haben beide Geraden denselben y-Wert. Deshalb setzt du die rechten Seiten der Gleichungen gleich.',
            solution: `${lfS(g1.m)}x + ${lfP(g1.t)} = ${lfS(g2.m)}x + ${lfP(g2.t)}`
        },
        {
            type: 'calc', goal: 'Löse die Gleichung nach x auf.',
            label: <V>x</V>, correct: xs,
            hint: `Bringe alle x-Terme nach links und alle Zahlen nach rechts: ${lfS(g1.m - g2.m)}x = ${lfS(g2.t - g1.t)}.`,
            solution: `${lfS(g1.m - g2.m)}x = ${lfS(g2.t - g1.t)} → x = ${lfS(xs)}`
        },
        {
            type: 'calc', goal: `Setze x in eine der Gleichungen ein und berechne y.`,
            label: <V>y</V>, correct: ys,
            hint: `Zum Beispiel in ${g1.n}: y = ${lfS(g1.m)} · ${lfP(xs)} + ${lfP(g1.t)}.`,
            solution: `y = ${lfS(g1.m)} · ${lfP(xs)} + ${lfP(g1.t)} = ${lfS(ys)}`
        },
        {
            type: 'fill', goal: `Gib den Schnittpunkt ${name} an.`,
            inputs: [{ id: 'x', correct: xs }, { id: 'y', correct: ys }],
            render: (h) => <LfZeile>{name}( {h.input('x')} | {h.input('y')} )</LfZeile>,
            hint: 'Schreibe erst die x-Koordinate, dann die y-Koordinate.',
            solution: `${name}(${lfS(xs)} | ${lfS(ys)})`
        }
    ];
};

// ---- Zeichnen im Koordinatensystem ----
const lfOnLine = (g) => (p) => lfSame(g.m * p.x + g.t, p.y, 1e-4);
// Alle Rasterpunkte (0,5er-Raster) der Geraden im sichtbaren Bereich
const lfGridPoints = (g, range) => {
    const pts = [];
    for (let x = range[0]; x <= range[1] + 1e-9; x += 0.5) {
        const y = lfR(g.m * x + g.t);
        if (y >= range[2] && y <= range[3] && lfSame(y * 2, Math.round(y * 2))) pts.push({ x: lfR(x), y });
    }
    return pts;
};
S.draw = (g, range, prev = [], opts = {}) => ({
    type: 'points', count: 2, check: lfOnLine(g),
    goal: opts.goal || `Zeichne ${g.n || 'die Gerade'}: Setze zwei Punkte der Geraden.`,
    graph: { range, lines: prev },
    line: g,
    hint: `${lfGlS(g.m, g.t)}: Starte beim y-Achsenabschnitt (0 | ${lfS(g.t)}) und gehe mit dem Steigungsdreieck weiter: ${lfSlopeWalk(g.m)}. Liegt (0 | t) außerhalb, setze x-Werte ein und berechne y.`,
    solution: (() => {
        const pts = lfGridPoints(g, range);
        if (!pts.length) return lfGlS(g.m, g.t);
        const first = pts.find(p => p.x === 0) || pts[0];
        const d = (lfFrac(g.m) || { d: 1 }).d;
        const second = pts.find(p => lfSame(p.x, first.x + d)) || pts.find(p => lfSame(p.x, first.x - d)) || pts.find(p => p !== first);
        return `z. B. (${lfS(first.x)} | ${lfS(first.y)}) und (${lfS(second.x)} | ${lfS(second.y)})`;
    })()
});
// Leicht: erst den y-Achsenabschnitt, dann mit dem Steigungsdreieck einen zweiten Punkt
S.drawSplit = (g, range) => [
    {
        type: 'points', count: 1, check: (p) => lfSame(p.x, 0) && lfSame(p.y, g.t),
        goal: 'Markiere den y-Achsenabschnitt.',
        graph: { range, lines: [] },
        hint: `t = ${lfS(g.t)}: Der Punkt liegt auf der y-Achse (x = 0).`,
        solution: `(0 | ${lfS(g.t)})`
    },
    {
        type: 'points', count: 1, check: (p) => lfOnLine(g)(p) && !lfSame(p.x, 0),
        goal: 'Setze mit dem Steigungsdreieck einen zweiten Punkt.',
        graph: { range, lines: [], points: [{ x: 0, y: g.t, color: '#16a34a' }] },
        line: g,
        hint: `m = ${lfS(g.m)}: Gehe vom Punkt (0 | ${lfS(g.t)}) aus ${lfSlopeWalk(g.m)}.`,
        solution: `z. B. (${lfS((lfFrac(g.m) || { d: 1 }).d)} | ${lfS(g.m * (lfFrac(g.m) || { d: 1 }).d + g.t)})`
    }
];
S.drawLines = (lines, range) => lines.map((g, i) => S.draw(g, range, lines.slice(0, i)));

// Einfache Rechnung mit fertiger Beschriftung

// ==========================================
// 4. ZUFALLS-GENERATOREN PRO THEMA
// Jeder Generator liefert { typeId, title, desc, graph?, finalGraph?, steps }.
// ==========================================
const LF_M_LEICHT = [-3, -2, -1, 1, 2, 3];
const LF_M_BRUCH = [1/2, -1/2, 1/3, -1/3, 2/3, -2/3, 3/2, -3/2, 1/4, -1/4, 3/4, -3/4];
const LF_M_SCHWER = [0.4, -0.4, 1.25, -1.25, 2.5, -2.5, 0.75, -0.75, 1.5, -1.5, 0.2, -0.2, 4/3, -4/3];
const LF_HALVES = [-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5];
const LF_RANGE = [-6, 6, -6, 6];

// Koordinatenbereich, der die gegebenen Punkte sicher enthält
const lfRangeFor = (pts, min = 6) => {
    let r = min;
    pts.forEach(p => { r = Math.max(r, Math.ceil(Math.abs(p.x)) + 2, Math.ceil(Math.abs(p.y)) + 2); });
    r = Math.min(r, 12);
    return [-r, r, -r, r];
};
// Gerade mit „zeichenbarem“ zweiten Gitterpunkt im Bereich ±5
const lfGraphLine = (mPool, tPool) => {
    for (let i = 0; i < 50; i++) {
        const m = lfPick(mPool), t = lfPick(tPool);
        const d = (lfFrac(m) || { d: 1 }).d;
        const y2 = m * d + t;
        if (Math.abs(y2) <= 5 && d <= 4) return { m, t };
    }
    return { m: 1, t: 1 };
};
// Allgemeine Geradengleichung zu y = mx + t mit y-Koeffizient A in zufälliger Anordnung
const lfGenGeneral = (m, t, A, splitConst) => {
    for (let tries = 0; tries < 40; tries++) {
        const B = lfR(-A * m), C = lfR(-A * t);
        let L = [], R = [];
        [{ c: A, v: 'y' }, { c: B, v: 'x' }, { c: C, v: '' }].forEach(tm => {
            if (tm.c === 0) return;
            if (Math.random() < 0.5) L.push(tm); else R.push({ c: lfR(-tm.c), v: tm.v });
        });
        if (splitConst) {
            const k = lfPick([2, 3, 4, 5, 6, 7, 10, 14]);
            const addK = (side) => {
                const i = side.findIndex(q => q.v === '');
                if (i >= 0) side[i] = { c: lfR(side[i].c + k), v: '' }; else side.push({ c: k, v: '' });
                return side.filter(q => q.c !== 0);
            };
            L = addK(L); R = addK(R);
        }
        L = shuffleArray(L); R = shuffleArray(R);
        const iso = (side) => side.length === 1 && side[0].v === 'y' && side[0].c === 1;
        if (iso(L) || iso(R)) continue;
        if (!L.some(q => q.v === 'y') && !R.some(q => q.v === 'y')) continue;
        return { show: `${lfSideS(L)} = ${lfSideS(R)}`, A, B, C, isolated: false };
    }
    return { show: `${lfS(A)}y = ${lfSideS([{ c: lfR(A * m), v: 'x' }, { c: lfR(A * t), v: '' }])}`, A, B: lfR(-A * m), C: lfR(-A * t), isolated: false };
};
// y-Koeffizient A, sodass A·m und A·t höchstens zwei Nachkommastellen haben
const lfGeneralFor = (level) => {
    for (let i = 0; i < 200; i++) {
        let m, t, A;
        if (level === 'leicht') { m = lfPick(LF_M_LEICHT); t = lfRand(-6, 6); A = lfPick([1, 1, -1]); }
        else if (level === 'mittel') { m = lfPick([...LF_M_LEICHT, ...LF_M_BRUCH]); t = lfPick([-4, -3, -2, -1, 1, 2, 3, 4, -1.5, 1.5, 2.5, -2.5]); A = lfPick([2, 3, 4, -2, -3]); }
        else { m = lfPick([...LF_M_SCHWER, ...LF_M_BRUCH]); t = lfPick([-4.5, -3, -2.5, -2, -1.5, -0.5, 0.5, 1.5, 2, 2.5, 3.5, 5.4, 7]); A = lfPick([0.5, 2.5, -5, 4, -3, 1.5, -0.5, 5]); }
        const Am = lfR(A * m), At = lfR(A * t);
        if (level !== 'schwer' && (!Number.isInteger(Am) || !Number.isInteger(At))) continue;
        if (level === 'schwer' && (!lfIsShort(Am) || !lfIsShort(At))) continue;
        return { m, t, eq: lfGenGeneral(m, t, A, level === 'schwer' && Math.random() < 0.6) };
    }
    return { m: 2, t: -3, eq: lfGenGeneral(2, -3, 2, false) };
};

const GEN = {};

// 1. Wertetabelle
GEN.wertetabelle = (level, forbidden) => {
    const tableStep = (m, t, xs) => ({
        type: 'fill', goal: 'Berechne die fehlenden y-Werte.',
        inputs: xs.map((x, i) => ({ id: 'y' + i, correct: lfR(m * x + t) })),
        render: (h) => <LfTabelle xs={xs.map(x => lfS(x))} ys={xs.map((x, i) => h.input('y' + i, 'w-16'))} />,
        summary: (v) => xs.map((x, i) => `(${lfS(x)} | ${v['y' + i] || '?'})`).join(', '),
        hint: `Setze jeden x-Wert in ${lfGlS(m, t)} ein. Beispiel: x = ${lfS(xs[0])} → y = ${lfS(m)} · ${lfP(xs[0])} ${t < 0 ? '−' : '+'} ${lfS(Math.abs(t))} = ${lfS(m * xs[0] + t)}.`,
        solution: xs.map(x => `(${lfS(x)} | ${lfS(m * x + t)})`).join('; ')
    });
    if (level === 'leicht') {
        const m = lfPick(LF_M_LEICHT), t = lfRand(-4, 4);
        const xs = [-2, -1, 0, 1, 2];
        return { typeId: 1, title: 'Wertetabelle ausfüllen', desc: <>Fülle die Wertetabelle für die Gerade <Gl m={m} t={t} name="g" /> aus.</>, steps: [tableStep(m, t, xs)], finalGraph: { range: LF_RANGE, lines: [{ m, t, n: 'g' }], points: xs.filter(x => Math.abs(m * x + t) <= 6).map(x => ({ x, y: m * x + t })) } };
    }
    if (level === 'mittel') {
        const m = lfPick(LF_M_BRUCH), t = lfRand(-3, 3);
        const d = lfFrac(m).d;
        const xs = [-2, -1, 0, 1, 2].map(k => k * d);
        const x1 = d * lfPick([3, 4, -3, -4]);
        const y1 = lfR(m * x1 + t);
        return {
            typeId: 2, title: 'Wertetabelle mit Bruch-Steigung',
            desc: <>Gegeben ist die Gerade <Gl m={m} t={t} name="g" />. Fülle die Wertetabelle aus. Bestimme danach, für welches x der y-Wert {lfS(y1)} beträgt.</>,
            steps: [tableStep(m, t, xs), ...S.missingX(m, t, y1)]
        };
    }
    const type = lfChooseType([3, 4], forbidden);
    if (type === 3) {
        // Tabelle gegeben → Funktionsgleichung
        const m = lfPick([0.5, -0.5, 1.5, -1.5, 0.6, -0.6, 2.5, -2.5, 0.25, -0.75]), t = lfPick([-2.5, -1.5, -1, 0.5, 1, 2, 3.5, -3]);
        const d = (lfFrac(m) || { d: 1 }).d;
        const x0 = -d * lfRand(1, 2), k = d * lfRand(1, 2);
        const xs = [x0, x0 + k, x0 + 2 * k];
        const pts = xs.map((x, i) => ({ x, y: lfR(m * x + t), n: ['P', 'Q', 'R'][i] }));
        return {
            typeId: 3, title: 'Funktionsgleichung aus einer Wertetabelle',
            desc: <>Die Wertepaare in der Tabelle gehören zu einer Geraden g. Bestimme ihre Funktionsgleichung.<LfTabelle xs={xs.map(x => lfS(x))} ys={pts.map(p => lfS(p.y))} /></>,
            steps: S.line2P(pts[0], pts[1], 'g'),
            finalGraph: { range: lfRangeFor(pts), lines: [{ m, t, n: 'g' }], points: pts }
        };
    }
    // Typ 4: x gegeben → y, y gegeben → x (wie MSA 2021 II/1b)
    const m = lfPick([-0.5, 0.5, -1.5, 1.5, -2.5, 0.25, -0.25]), t = lfPick([3, -2, 4.5, -1.5, 1, 6]);
    const x1 = lfPick([5, 7, -6, 9, 11]);
    const y2 = lfR(m * lfPick([-36, 24, -16, 30, 18]) + t);
    return {
        typeId: 4, title: 'Fehlende Werte in der Tabelle',
        desc: <>Zur Geraden <Gl m={m} t={t} name="g" /> gehört diese Wertetabelle. Ergänze die fehlenden Werte.<LfTabelle xs={[lfS(x1), '?']} ys={['?', lfS(y2)]} /></>,
        steps: [...S.missingY(m, t, x1, 'P'), ...S.missingX(m, t, y2, 'Q')]
    };
};

// 2. Steigung & y-Achsenabschnitt ablesen / Normalform
GEN.ablesen = (level, forbidden) => {
    const types = level === 'leicht' ? [1, 2] : level === 'mittel' ? [3, 4] : [5, 6];
    const type = lfChooseType(types, forbidden);
    if (type === 1 || type === 3 || type === 5) {
        const pool = type === 1 ? LF_M_LEICHT : type === 3 ? LF_M_BRUCH : [1/3, -1/3, 2/3, -2/3, 1/4, -1/4, 3/4, -3/4, 1.5, -1.5, 2.5, -2.5];
        const tPool = type === 5 ? [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5] : [-4, -3, -2, -1, 1, 2, 3, 4];
        const { m, t } = lfGraphLine(pool, tPool);
        return {
            typeId: type, title: 'Funktionsgleichung ablesen',
            desc: <>Die Abbildung zeigt die Gerade g. Lies den y-Achsenabschnitt t und die Steigung m ab und gib die Funktionsgleichung in der Normalform <span className="font-math"><V>y</V> = <V>m</V><V>x</V> + <V>t</V></span> an.</>,
            graph: { range: LF_RANGE, lines: [{ m, t, n: 'g' }] },
            steps: S.readGraph(m, t, 'g')
        };
    }
    // Typ 2 / 4 / 6: allgemeine Gleichung → Normalform
    const { m, t, eq } = lfGeneralFor(level);
    return {
        typeId: type, title: 'In die Normalform bringen',
        desc: <>Die Gerade g ist durch die Gleichung <span className="font-math whitespace-nowrap">{eq.show}</span> gegeben. Bringe sie in die Normalform <span className="font-math"><V>y</V> = <V>m</V><V>x</V> + <V>t</V></span> und lies dann Steigung und y-Achsenabschnitt ab.</>,
        steps: [
            ...S.normal(eq, 'g'),
            {
                type: 'fill', goal: 'Lies Steigung und y-Achsenabschnitt ab.',
                inputs: [{ id: 'm', correct: m }, { id: 't', correct: t }],
                render: (h) => <LfZeile><V>m</V> = {h.input('m')} <span className="mx-3">und</span> <V>t</V> = {h.input('t')}</LfZeile>,
                hint: 'In y = mx + t ist m die Zahl vor dem x und t die Zahl ohne x (mit Vorzeichen).',
                solution: `m = ${lfS(m)}; t = ${lfS(t)}`
            }
        ],
        finalGraph: Math.abs(t) <= 6 ? { range: LF_RANGE, lines: [{ m, t, n: 'g' }] } : null
    };
};

// 3. Graph zeichnen
GEN.zeichnen = (level, forbidden) => {
    if (level === 'leicht') {
        const { m, t } = lfGraphLine(LF_M_LEICHT, [-3, -2, -1, 0, 1, 2, 3]);
        return { typeId: 1, title: 'Gerade zeichnen', desc: <>Zeichne die Gerade <Gl m={m} t={t} name="g" /> in das Koordinatensystem.</>, steps: S.drawSplit({ m, t, n: 'g' }, LF_RANGE), finalGraph: { range: LF_RANGE, lines: [{ m, t, n: 'g' }] } };
    }
    if (level === 'mittel') {
        const { m, t } = lfGraphLine(LF_M_BRUCH, [-3, -2, -1, 1, 2, 3, -0.5, 1.5]);
        const g = { m, t, n: 'g' };
        return { typeId: 2, title: 'Gerade mit Bruch-Steigung zeichnen', desc: <>Zeichne die Gerade <Gl m={m} t={t} name="g" /> in das Koordinatensystem.</>, steps: [S.draw(g, LF_RANGE)], finalGraph: { range: LF_RANGE, lines: [g] } };
    }
    const type = lfChooseType([3, 4], forbidden);
    if (type === 3) {
        let pick;
        for (let i = 0; i < 100; i++) { pick = lfGeneralFor('mittel'); const d = (lfFrac(pick.m) || { d: 1 }).d; if (d <= 4 && Math.abs(pick.t) <= 4 && Math.abs(pick.m * d + pick.t) <= 5 && lfSame(pick.t * 2, Math.round(pick.t * 2))) break; }
        const g = { m: pick.m, t: pick.t, n: 'g' };
        return { typeId: 3, title: 'Erst umformen, dann zeichnen', desc: <>Die Gerade g hat die Gleichung <span className="font-math whitespace-nowrap">{pick.eq.show}</span>. Bringe sie in die Normalform und zeichne sie.</>, steps: [...S.normal(pick.eq, 'g'), S.draw(g, LF_RANGE)], finalGraph: { range: LF_RANGE, lines: [g] } };
    }
    // Typ 4: zwei Geraden zeichnen, Schnittpunkt ablesen
    let g1, g2, xs, ys;
    for (let i = 0; i < 200; i++) {
        xs = lfRand(-3, 3); ys = lfRand(-3, 3);
        const m1 = lfPick([...LF_M_LEICHT, 1/2, -1/2]), m2 = lfPick([...LF_M_LEICHT, 1/2, -1/2]);
        if (lfSame(m1, m2)) continue;
        const t1 = lfR(ys - m1 * xs), t2 = lfR(ys - m2 * xs);
        if (Math.abs(t1) > 5 || Math.abs(t2) > 5 || !lfSame(t1 * 2, Math.round(t1 * 2)) || !lfSame(t2 * 2, Math.round(t2 * 2))) continue;
        g1 = { m: m1, t: t1, n: 'g₁' }; g2 = { m: m2, t: t2, n: 'g₂' }; break;
    }
    return {
        typeId: 4, title: 'Zwei Geraden zeichnen',
        desc: <>Zeichne die Geraden <Gl m={g1.m} t={g1.t} name="g₁" /> und <Gl m={g2.m} t={g2.t} name="g₂" /> und lies ihren Schnittpunkt S ab.</>,
        steps: [...S.drawLines([g1, g2], LF_RANGE), {
            type: 'fill', goal: 'Lies den Schnittpunkt S ab.',
            inputs: [{ id: 'x', correct: xs }, { id: 'y', correct: ys }],
            render: (h) => <LfZeile>S( {h.input('x')} | {h.input('y')} )</LfZeile>,
            hint: 'Wo kreuzen sich die beiden Geraden? Lies x- und y-Koordinate dieses Punktes ab.',
            solution: `S(${xs} | ${ys})`
        }],
        finalGraph: { range: LF_RANGE, lines: [g1, g2], points: [{ x: xs, y: ys, n: 'S' }] }
    };
};

// 4. Nullstelle / Achsenschnittpunkte
GEN.nullstelle = (level, forbidden) => {
    if (level === 'leicht') {
        const type = lfChooseType([1, 2], forbidden);
        const m = lfPick([1, 2, -1, -2, 3, -3, 4, 0.5, -0.5]);
        const x0 = lfRand(-5, 5) || 2;
        const t = lfR(-m * x0);
        const g = { m, t, n: 'g' };
        const fg = Math.abs(t) <= 8 ? { range: lfRangeFor([{ x: x0, y: 0 }, { x: 0, y: t }]), lines: [g], points: [{ x: x0, y: 0, n: 'N' }, ...(type === 2 ? [{ x: 0, y: t, n: 'Sᵧ' }] : [])] } : null;
        if (type === 1) return { typeId: 1, title: 'Nullstelle berechnen', desc: <>Berechne den Schnittpunkt N der Geraden <Gl m={m} t={t} name="g" /> mit der x-Achse.</>, steps: S.zero(m, t, 'N', { cond: true }), finalGraph: fg };
        return { typeId: 2, title: 'Schnittpunkte mit den Achsen', desc: <>Bestimme die Schnittpunkte der Geraden <Gl m={m} t={t} name="g" /> mit der y-Achse (Sᵧ) und mit der x-Achse (N).</>, steps: [S.yAxis(t), ...S.zero(m, t, 'N')], finalGraph: fg };
    }
    if (level === 'mittel') {
        const m = lfPick([0.5, -0.5, 1.5, -1.5, 2.5, -2.5, 0.25, -0.25, 1/3, -1/3, 2/3, -2/3, 0.8, -0.8]);
        let x0, t;
        for (let i = 0; i < 100; i++) { x0 = lfPick([-6, -4.5, -3, -2.5, -1.5, 1.5, 2.5, 3, 3.75, 4.5, 6]); t = lfR(-m * x0); if (lfIsShort(t) && t !== 0) break; }
        return { typeId: 3, title: 'Nullstelle berechnen', desc: <>Berechne die Koordinaten des Schnittpunkts N der Geraden <Gl m={m} t={t} name="g" /> mit der x-Achse.</>, steps: S.zero(m, t, 'N'), finalGraph: { range: lfRangeFor([{ x: x0, y: 0 }, { x: 0, y: t }]), lines: [{ m, t, n: 'g' }], points: [{ x: x0, y: 0, n: 'N' }] } };
    }
    let pick;
    for (let i = 0; i < 100; i++) { pick = lfGeneralFor('schwer'); if (pick.m !== 0 && lfIsShort(-pick.t / pick.m) && Math.abs(pick.t / pick.m) <= 12) break; }
    const x0 = lfR(-pick.t / pick.m);
    return {
        typeId: 4, title: 'Nullstelle aus allgemeiner Form',
        desc: <>Die Gerade g ist durch <span className="font-math whitespace-nowrap">{pick.eq.show}</span> bestimmt. Bringe sie in die Normalform und berechne die Koordinaten ihres Schnittpunkts N mit der x-Achse.</>,
        steps: [...S.normal(pick.eq, 'g'), ...S.zero(pick.m, pick.t, 'N')],
        finalGraph: Math.abs(pick.t) <= 12 ? { range: lfRangeFor([{ x: x0, y: 0 }, { x: 0, y: pick.t }]), lines: [{ m: pick.m, t: pick.t, n: 'g' }], points: [{ x: x0, y: 0, n: 'N' }] } : null
    };
};

// Zwei Punkte für Steigungsaufgaben
const lfTwoPoints = (level) => {
    for (let i = 0; i < 200; i++) {
        let A, B;
        if (level === 'leicht') {
            const x1 = lfRand(-4, 2), y1 = lfRand(-4, 4), dx = lfRand(1, 3), m = lfPick(LF_M_LEICHT);
            A = { x: x1, y: y1, n: 'A' }; B = { x: x1 + dx, y: y1 + m * dx, n: 'B' };
        } else if (level === 'mittel') {
            const x1 = lfRand(-5, 2), y1 = lfRand(-5, 5), dx = lfRand(2, 6), dy = lfRand(-7, 7);
            if (dy === 0 || dy % dx === 0) continue;
            A = { x: x1, y: y1, n: 'A' }; B = { x: x1 + dx, y: y1 + dy, n: 'B' };
        } else {
            const x1 = lfPick([-4.5, -3, -2, -1.5, -1, -0.5, 1, 1.5, 2]), y1 = lfPick([-4.5, -3, -2, -1.5, 1.5, 2.5, 3, 4.5, 6]);
            const m = lfPick(LF_M_SCHWER), dx = lfPick([1.5, 2, 2.5, 3, 4, 4.5, 5, 6, 7.5]);
            const dy = lfR(m * dx);
            if (!lfIsShort(dy)) continue;
            A = { x: x1, y: y1, n: 'A' }; B = { x: lfR(x1 + dx), y: lfR(y1 + dy), n: 'B' };
        }
        if (Math.random() < 0.5) { const tmp = { ...A, n: 'B' }; A = { ...B, n: 'A' }; B = tmp; }
        const m = (B.y - A.y) / (B.x - A.x), t = A.y - m * A.x;
        if (level !== 'schwer' && Math.abs(t) > 10) continue;
        if (level === 'schwer' && !lfIsShort(t)) continue;
        return { A, B, m: lfR(m), t: lfR(t) };
    }
    return { A: { x: 1, y: 1, n: 'A' }, B: { x: 3, y: 5, n: 'B' }, m: 2, t: -1 };
};

// 5. Steigung aus zwei Punkten
GEN.steigung = (level, forbidden) => {
    if (level === 'schwer') {
        const type = lfChooseType([3, 4], forbidden);
        if (type === 4) {
            const m = lfPick([2, -2, 0.5, -0.5, 1.5, 2/3, -2/3, 1/3, 3, 0.75]), t = lfPick([-3, -2, 1, 2, 4]);
            return { typeId: 4, title: 'Steigungswinkel berechnen', desc: <>Berechne die Größe des spitzen Winkels α, den die Gerade <Gl m={m} t={t} name="g" /> mit der x-Achse einschließt.</>, steps: S.angle(m) };
        }
        const { A, B, m, t } = lfTwoPoints('schwer');
        return { typeId: 3, title: 'Steigung und Steigungswinkel', desc: <>Die Gerade g verläuft durch die Punkte {lfPt(A)} und {lfPt(B)}. Berechne ihre Steigung m und den spitzen Winkel α, den g mit der x-Achse einschließt.</>, steps: [...S.slope(A, B), ...S.angle(m)], finalGraph: { range: lfRangeFor([A, B]), lines: [{ m, t, n: 'g' }], points: [A, B] } };
    }
    const { A, B, m, t } = lfTwoPoints(level);
    return { typeId: level === 'leicht' ? 1 : 2, title: 'Steigung aus zwei Punkten', desc: <>Die Gerade g verläuft durch die Punkte {lfPt(A)} und {lfPt(B)}. Berechne ihre Steigung m.</>, steps: S.slope(A, B), finalGraph: { range: lfRangeFor([A, B]), lines: [{ m, t, n: 'g' }], points: [A, B] } };
};

// 6. Geradengleichung aufstellen
GEN.gleichung = (level, forbidden) => {
    if (level === 'leicht') {
        const m = lfPick(LF_M_LEICHT), P = { x: lfRand(-4, 4) || 1, y: lfRand(-5, 5), n: 'P' };
        const t = lfR(P.y - m * P.x);
        return { typeId: 1, title: 'Gleichung aus Punkt und Steigung', desc: <>Die Gerade g hat die Steigung m = {lfS(m)} und verläuft durch den Punkt {lfPt(P)}. Bestimme ihre Funktionsgleichung.</>, steps: S.linePM(P, m, 'g'), finalGraph: { range: lfRangeFor([P, { x: 0, y: t }]), lines: [{ m, t, n: 'g' }], points: [P] } };
    }
    const type = level === 'mittel' ? 2 : lfChooseType([3, 4], forbidden);
    if (type === 4) {
        const m = lfPick([3/4, -3/4, 2/3, -2/3, 1.5, -2.5, 0.25]);
        let P;
        for (let i = 0; i < 100; i++) { P = { x: lfPick([-6, -4, -2, 2, 4, 4.5, 6, 3]), y: lfPick([-2.5, -1, 1.5, 4.5, 3, -4]), n: 'P' }; if (lfIsShort(P.y - m * P.x)) break; }
        const t = lfR(P.y - m * P.x);
        return { typeId: 4, title: 'Gleichung aus Punkt und Steigung', desc: <>Die Gerade g verläuft durch den Punkt {lfPt(P)} und hat die Steigung m = {lfS(m, true)}. Bestimme rechnerisch ihre Funktionsgleichung.</>, steps: S.linePM(P, m, 'g'), finalGraph: { range: lfRangeFor([P, { x: 0, y: t }]), lines: [{ m, t, n: 'g' }], points: [P] } };
    }
    const { A, B, m, t } = lfTwoPoints(level === 'mittel' ? 'mittel' : 'schwer');
    return { typeId: type, title: 'Gleichung aus zwei Punkten', desc: <>Die Gerade g verläuft durch die Punkte {lfPt(A)} und {lfPt(B)}. Bestimme rechnerisch ihre Funktionsgleichung.</>, steps: S.line2P(A, B, 'g'), finalGraph: { range: lfRangeFor([A, B, { x: 0, y: t }]), lines: [{ m, t, n: 'g' }], points: [A, B] } };
};

// 7. Punktprobe
GEN.punktprobe = (level, forbidden) => {
    if (level === 'leicht') {
        const m = lfPick(LF_M_LEICHT), t = lfRand(-4, 4), x = lfRand(-4, 4);
        const on = Math.random() < 0.5;
        const P = { x, y: m * x + t + (on ? 0 : lfPick([-2, -1, 1, 2])), n: 'P' };
        return { typeId: 1, title: 'Punktprobe', desc: <>Überprüfe rechnerisch, ob der Punkt {lfPt(P)} auf der Geraden <Gl m={m} t={t} name="g" /> liegt.</>, steps: S.probe(m, t, P, 'g') };
    }
    if (level === 'mittel') {
        const type = lfChooseType([2, 3, 4], forbidden);
        const m = lfPick([0.5, -0.5, 1.5, -2.5, 0.25, -1.5, 2, -3]), t = lfPick([-3.5, -2, 1.5, 4, -1, 2.5]);
        if (type === 2) {
            const x = lfPick([-6, -4, -3, 3, 5, 8, 10]);
            const on = Math.random() < 0.5;
            const P = { x, y: lfR(m * x + t + (on ? 0 : lfPick([-1.5, -1, 0.5, 1]))), n: 'P' };
            return { typeId: 2, title: 'Punktprobe', desc: <>Überprüfe rechnerisch, ob der Punkt {lfPt(P)} auf der Geraden <Gl m={m} t={t} name="g" /> liegt.</>, steps: S.probe(m, t, P, 'g') };
        }
        if (type === 3) {
            const x = lfPick([-6, -4, 4, 7, 12, 16.5]);
            return { typeId: 3, title: 'Fehlende y-Koordinate', desc: <>Der Punkt P({lfS(x)} | <V>y</V>) liegt auf der Geraden <Gl m={m} t={t} name="g" />. Berechne die fehlende y-Koordinate.</>, steps: S.missingY(m, t, x, 'P') };
        }
        const xv = lfPick([-8, -5, -3, 3, 6, 9, 14]);
        const y = lfR(m * xv + t);
        return { typeId: 4, title: 'Fehlende x-Koordinate', desc: <>Der Punkt Q(<V>x</V> | {lfS(y)}) liegt auf der Geraden <Gl m={m} t={t} name="g" />. Berechne die fehlende x-Koordinate.</>, steps: S.missingX(m, t, y, 'Q') };
    }
    const type = lfChooseType([5, 6, 7], forbidden);
    if (type === 5) {
        const t = lfPick([-9, 4, -5, 6, -2.5]), m = lfPick([-4, -1.25, 2.5, 3, -0.5]), x = lfPick([-3, 4, 2, -2, 6]);
        const P = { x, y: lfR(m * x + t), n: 'D' };
        return { typeId: 5, title: 'Fehlende Steigung', desc: <>Der Punkt {lfPt(P)} liegt auf der Geraden g: <span className="font-math"><V>y</V> = <V>m</V> · <V>x</V> {t < 0 ? '−' : '+'} {lfS(Math.abs(t))}</span>. Bestimme die Steigung m rechnerisch.</>, steps: S.unknownM(P, t, 'g') };
    }
    if (type === 6) {
        // Drei Punkte auf einer Geraden?
        const { A, B, m, t } = lfTwoPoints('mittel');
        const on = Math.random() < 0.5;
        const cx = B.x + lfPick([2, 4, 6]);
        const C = { x: cx, y: lfR(m * cx + t + (on ? 0 : lfPick([-1, 1, 0.5]))), n: 'C' };
        return { typeId: 6, title: 'Liegen drei Punkte auf einer Geraden?', desc: <>Überprüfe rechnerisch, ob die Punkte {lfPt(A)}, {lfPt(B)} und {lfPt(C)} auf einer Geraden liegen. Bestimme dazu die Gerade durch A und B und mache mit C die Punktprobe.</>, steps: [...S.line2P(A, B, 'g'), ...S.probe(m, t, C, 'g')] };
    }
    const m = lfPick([-2, 3, -1.5, 2.5]), t = lfPick([4, -6, 2.5, -1]), x = lfPick([86, -48, 120, 64]);
    const on = Math.random() < 0.5;
    const P = { x, y: lfR(m * x + t + (on ? 0 : lfPick([-2, 2, 4]))), n: 'B' };
    return { typeId: 7, title: 'Punktprobe mit großen Zahlen', desc: <>Überprüfe rechnerisch, ob der Punkt {lfPt(P)} auf der Geraden <Gl m={m} t={t} name="g" /> liegt.</>, steps: S.probe(m, t, P, 'g') };
};

// Steigungen mit „schönem“ Kehrwert
const LF_M_PERP = [1, -1, 2, -2, 3, -3, 1/2, -1/2, 1/3, -1/3, 2/3, -2/3, 3/2, -3/2, 4, -4, 1/4, -1/4, 0.4, -0.4, 1.25, -1.25, 0.8, -0.8];

// 8. Parallele & senkrechte Geraden
GEN.parallel = (level, forbidden) => {
    if (level === 'leicht') {
        const type = lfChooseType([1, 2], forbidden);
        const m1 = lfPick(LF_M_PERP.slice(0, 16)), t1 = lfRand(-4, 4);
        if (type === 1) {
            const m2 = lfR(-1 / m1);
            return {
                typeId: 1, title: 'Steigung von Parallele und Senkrechter',
                desc: <>Gegeben ist die Gerade <Gl m={m1} t={t1} name="g" />. Gib die Steigung einer Parallelen p und einer Senkrechten s zu g an.</>,
                steps: [
                    { type: 'fill', goal: 'Steigung der Parallelen p', inputs: [{ id: 'm', correct: m1 }], render: (h) => <LfZeile><V>m</V><sub>p</sub> = {h.input('m')}</LfZeile>, hint: 'Parallele Geraden haben die gleiche Steigung.', solution: `mₚ = ${lfS(m1)}` },
                    { type: 'fill', goal: 'Steigung der Senkrechten s', inputs: [{ id: 'm', correct: m2 }], render: (h) => <LfZeile><V>m</V><sub>s</sub> = {h.input('m')}</LfZeile>, hint: `Bei senkrechten Geraden gilt m₁ · m₂ = −1. Also: Kehrwert von ${lfS(m1)} bilden und das Vorzeichen umdrehen.`, solution: `mₛ = −1 : ${lfP(m1)} = ${lfS(m2)}` }
                ],
                finalGraph: { range: LF_RANGE, lines: [{ m: m1, t: t1, n: 'g' }, { m: m1, t: t1 > 0 ? t1 - 3 : t1 + 3, n: 'p' }, { m: m2, t: 0, n: 's' }] }
            };
        }
        const kind = lfPick(['parallel', 'senkrecht']);
        const correct = kind === 'parallel' ? { m: m1, t: t1 > 0 ? t1 - 2 : t1 + 2 } : { m: lfR(-1 / m1), t: lfRand(-3, 3) };
        const wrong = [{ m: lfR(-m1), t: 1 }, { m: lfR(1 / m1), t: -2 }, kind === 'parallel' ? { m: lfR(-1 / m1), t: 2 } : { m: m1, t: -1 }];
        return {
            typeId: 2, title: kind === 'parallel' ? 'Parallele erkennen' : 'Senkrechte erkennen',
            desc: <>Gegeben ist die Gerade <Gl m={m1} t={t1} name="g" />. Welche der Geraden verläuft {kind === 'parallel' ? 'parallel' : 'senkrecht'} zu g?</>,
            steps: [S.select(`Welche Gerade ist ${kind} zu g?`, [<Gl m={correct.m} t={correct.t} />, ...wrong.map(w => <Gl m={w.m} t={w.t} />)], 0,
                kind === 'parallel' ? 'Parallele Geraden haben die gleiche Steigung m.' : 'Senkrechte Geraden: m₁ · m₂ = −1 (Kehrwert, Vorzeichen umdrehen).',
                lfGlS(correct.m, correct.t))]
        };
    }
    if (level === 'mittel') {
        const kind = lfPick(['parallel', 'senkrecht', 'senkrecht']);
        const m1 = lfPick(LF_M_PERP.slice(0, 16)), t1 = lfRand(-4, 4);
        const m2 = kind === 'parallel' ? m1 : lfR(-1 / m1);
        let P;
        for (let i = 0; i < 100; i++) { P = { x: lfRand(-4, 4), y: lfRand(-4, 4), n: 'P' }; const t2 = P.y - m2 * P.x; if (lfIsShort(t2) && Math.abs(t2) <= 8 && !lfSame(t2, t1)) break; }
        const t2 = lfR(P.y - m2 * P.x);
        return {
            typeId: kind === 'parallel' ? 3 : 4, title: kind === 'parallel' ? 'Parallele durch einen Punkt' : 'Senkrechte durch einen Punkt',
            desc: <>Die Gerade h verläuft durch den Punkt {lfPt(P)} und {kind === 'parallel' ? 'parallel zu' : 'senkrecht auf'} der Geraden <Gl m={m1} t={t1} name="g" />. Bestimme rechnerisch die Funktionsgleichung von h.</>,
            steps: S.perpLine(kind, m1, P, 'h', { rel: true }),
            finalGraph: { range: lfRangeFor([P, { x: 0, y: t1 }, { x: 0, y: t2 }]), lines: [{ m: m1, t: t1, n: 'g' }, { m: m2, t: t2, n: 'h' }], points: [P] }
        };
    }
    const type = lfChooseType([5, 6], forbidden);
    if (type === 5) {
        let pick;
        for (let i = 0; i < 200; i++) { pick = lfGeneralFor('schwer'); if (LF_M_PERP.some(x => lfSame(x, pick.m))) break; }
        const m2 = lfR(-1 / pick.m);
        let P;
        for (let i = 0; i < 100; i++) { P = { x: lfPick([-4, -3, -2.5, -1.5, 1.5, 2, 3, 4.5]), y: lfPick([-3, -2, -0.5, 1, 2.5, 4]), n: 'P' }; if (lfIsShort(P.y - m2 * P.x)) break; }
        return {
            typeId: 5, title: 'Senkrechte zu einer Geraden in allgemeiner Form',
            desc: <>Die Gerade g ist durch <span className="font-math whitespace-nowrap">{pick.eq.show}</span> bestimmt. Die Gerade h steht senkrecht auf g und verläuft durch {lfPt(P)}. Ermittle rechnerisch die Funktionsgleichung von h.</>,
            steps: [...S.normal(pick.eq, 'g'), ...S.perpLine('senkrecht', pick.m, P, 'h')]
        };
    }
    // Typ 6: Lage zweier Geraden prüfen
    const m1 = lfPick(LF_M_PERP.slice(0, 16));
    const rel = lfPick(['parallel', 'senkrecht', 'keins']);
    const m2 = rel === 'parallel' ? m1 : rel === 'senkrecht' ? lfR(-1 / m1) : lfR(2 * m1);
    const A2 = (lfFrac(m2) || { d: 1 }).d * lfPick([1, 2, -1, -2]);
    const t2 = lfPick([-3, -2, -1, 1, 2, 4]);
    const eq2 = lfGenGeneral(m2, t2, A2, false);
    const t1 = t2 + lfPick([1, 2, -2]);
    return {
        typeId: 6, title: 'Lage zweier Geraden prüfen',
        desc: <>Gegeben sind die Geraden <Gl m={m1} t={t1} name="g" /> und h: <span className="font-math whitespace-nowrap">{eq2.show}</span>. Überprüfe rechnerisch, ob die Geraden parallel oder senkrecht zueinander verlaufen.</>,
        steps: [...S.normal(eq2, 'h'), S.lage({ m: m1, t: t1, n: 'g' }, { m: m2, t: t2, n: 'h' })]
    };
};

// 9. Schnittpunkt zweier Geraden
GEN.schnittpunkt = (level, forbidden) => {
    for (let i = 0; i < 400; i++) {
        let xs, ys, m1, m2;
        if (level === 'leicht') { xs = lfRand(-4, 4); ys = lfRand(-4, 4); m1 = lfPick(LF_M_LEICHT); m2 = lfPick(LF_M_LEICHT); }
        else { xs = lfPick([...LF_HALVES, -2, 2, 3, -3, 1.5, 4.5, 6.25]); ys = lfPick([-3.5, -2.75, -1, 0.5, 1, 2.5, 3.8, 4.5]); m1 = lfPick([...LF_M_SCHWER, 2, -2, 0.5, -0.5]); m2 = lfPick([...LF_M_SCHWER, 1, -1, 3, 0.5, -0.5]); }
        if (lfSame(m1, m2)) continue;
        const t1 = lfR(ys - m1 * xs), t2 = lfR(ys - m2 * xs);
        if (!lfIsShort(t1) || !lfIsShort(t2) || Math.abs(t1) > 10 || Math.abs(t2) > 10) continue;
        const g1 = { m: m1, t: t1, n: 'g₁' }, g2 = { m: m2, t: t2, n: 'g₂' };
        const fg = { range: lfRangeFor([{ x: xs, y: ys }]), lines: [g1, g2], points: [{ x: xs, y: ys, n: 'S' }] };
        if (level === 'schwer') {
            const A = lfPick([2, -2, 3, 4, 0.5, 2.5, -5]);
            if (!lfIsShort(A * m2) || !lfIsShort(A * t2)) continue;
            const eq = lfGenGeneral(m2, t2, A, Math.random() < 0.5);
            return { typeId: 3, title: 'Schnittpunkt (mit Umformen)', desc: <>Die Geraden <Gl m={m1} t={t1} name="g₁" /> und g₂: <span className="font-math whitespace-nowrap">{eq.show}</span> schneiden sich im Punkt S. Berechne die Koordinaten von S.</>, steps: [...S.normal(eq, 'g₂'), ...S.intersect(g1, g2, 'S')], finalGraph: fg };
        }
        return { typeId: level === 'leicht' ? 1 : 2, title: 'Schnittpunkt zweier Geraden', desc: <>Die Geraden <Gl m={m1} t={t1} name="g₁" /> und <Gl m={m2} t={t2} name="g₂" /> schneiden sich im Punkt S. Berechne die Koordinaten von S.</>, steps: S.intersect(g1, g2, 'S'), finalGraph: fg };
    }
    return GEN.schnittpunkt('leicht', forbidden);
};

// 10. Sachaufgaben
const lfEur = (v) => lfS(lfR(v, 2)).replace(/,(\d)$/, ',$10');
GEN.sachaufgaben = (level, forbidden) => {
    const ctx = lfChooseType(level === 'schwer' ? ['vergleich', 'zweiPunkte', 'kerze'] : ['handy', 'taxi', 'kerze', 'tank'], forbidden);
    const eqStep = (m, t, xName, yName, hint) => ({
        type: 'fill', goal: 'Stelle die Funktionsgleichung auf.',
        inputs: [{ id: 'm', correct: m }, { id: 't', correct: t }],
        render: (h) => <LfZeile><V>y</V> = {h.input('m')}<V>x</V> + {h.input('t')}</LfZeile>,
        hint, solution: `${lfGlS(m, t)}  (x: ${xName}, y: ${yName})`
    });
    if (ctx === 'handy' || ctx === 'taxi') {
        const isTaxi = ctx === 'taxi';
        const G = isTaxi ? lfPick([3.5, 4, 4.2, 3.9]) : lfPick([5, 7.95, 9.99, 12, 4.5]);
        const p = isTaxi ? lfPick([1.8, 2.1, 2.4, 1.95]) : lfPick([0.09, 0.12, 0.15, 0.08]);
        const x1 = isTaxi ? lfPick([6, 8, 12, 15]) : lfPick([60, 90, 120, 150]);
        const x2 = isTaxi ? lfPick([10, 14, 20, 25]) : lfPick([80, 100, 200, 250]);
        const y2 = lfR(p * x2 + G, 2);
        const unit = isTaxi ? 'km' : 'Minuten';
        const text = isTaxi
            ? <>Ein Taxiunternehmen verlangt einen Grundpreis von {lfEur(G)} € und {lfEur(p)} € pro gefahrenem Kilometer. x steht für die gefahrenen Kilometer, y für den Fahrpreis in €.</>
            : <>Ein Handytarif kostet monatlich {lfEur(G)} € Grundgebühr. Jede Gesprächsminute kostet zusätzlich {lfEur(p)} €. x steht für die Minuten, y für die Monatskosten in €.</>;
        const steps = [
            eqStep(p, G, unit, 'Kosten in €', `Der feste Betrag (${isTaxi ? 'Grundpreis' : 'Grundgebühr'}) ist t. Der Preis pro ${isTaxi ? 'Kilometer' : 'Minute'} ist die Steigung m.`),
            S.calc(`Berechne die Kosten für ${x1} ${unit}.`, <V>y</V>, lfR(p * x1 + G, 2), `Setze x = ${x1} ein: y = ${lfEur(p)} · ${x1} + ${lfEur(G)}.`, `y = ${lfEur(p * x1 + G)} €`, '€', 0.011)
        ];
        if (level !== 'leicht') steps.push(S.calc(`Die Rechnung beträgt ${lfEur(y2)} €. Wie viele ${unit} waren es?`, <V>x</V>, x2, `Setze y = ${lfEur(y2)} ein und löse nach x auf: zuerst − ${lfEur(G)}, dann : ${lfEur(p)}.`, `x = (${lfEur(y2)} − ${lfEur(G)}) : ${lfEur(p)} = ${x2}`, unit, 0.011));
        return { typeId: ctx, title: isTaxi ? 'Taxifahrt' : 'Handytarif', desc: text, steps };
    }
    if (ctx === 'kerze') {
        const h0 = lfPick([18, 24, 30]), k = lfPick([1.5, 2, 2.5, 1.2]);
        const x1 = lfPick([2, 3, 4, 5]);
        const dur = lfR(h0 / k, 2);
        if (level === 'schwer') {
            const a = lfPick([2, 3]), b = a + lfPick([2, 3, 4]);
            const P = { x: a, y: lfR(h0 - k * a), n: 'P' }, Q = { x: b, y: lfR(h0 - k * b), n: 'Q' };
            return {
                typeId: ctx, title: 'Brennende Kerze',
                desc: <>Eine Kerze brennt gleichmäßig ab. Nach {a} Stunden ist sie noch {lfS(P.y)} cm hoch, nach {b} Stunden noch {lfS(Q.y)} cm. x steht für die Zeit in Stunden, y für die Höhe in cm.</>,
                steps: [...S.line2P(P, Q, 'h'), S.calc('Wie hoch war die Kerze zu Beginn?', <span>Anfangshöhe</span>, h0, 'Die Anfangshöhe ist der y-Achsenabschnitt t (x = 0).', `${h0} cm`, 'cm'), S.calc('Nach wie vielen Stunden ist die Kerze abgebrannt?', <V>x</V>, dur, 'Abgebrannt heißt: Höhe y = 0. Berechne die Nullstelle.', `0 = −${lfS(k)}x + ${h0} → x = ${lfS(dur)} h`, 'h', 0.011)]
            };
        }
        const steps = [
            eqStep(-k, h0, 'Zeit in Stunden', 'Höhe in cm', 'Die Anfangshöhe ist t. Die Kerze wird kleiner, deshalb ist die Steigung negativ: m = −(Abbrand pro Stunde).'),
            S.calc(`Wie hoch ist die Kerze nach ${x1} Stunden?`, <V>y</V>, lfR(h0 - k * x1), `y = −${lfS(k)} · ${x1} + ${h0}`, `y = ${lfS(h0 - k * x1)} cm`, 'cm')
        ];
        if (level !== 'leicht') steps.push(S.calc('Nach wie vielen Stunden ist die Kerze ganz abgebrannt?', <V>x</V>, dur, 'Abgebrannt heißt: y = 0. Löse 0 = −' + lfS(k) + 'x + ' + h0 + ' nach x auf.', `x = ${h0} : ${lfS(k)} = ${lfS(dur)} h`, 'h', 0.011));
        return { typeId: ctx, title: 'Brennende Kerze', desc: <>Eine {h0} cm hohe Kerze brennt pro Stunde gleichmäßig um {lfS(k)} cm ab. x steht für die Zeit in Stunden, y für die Höhe der Kerze in cm.</>, steps };
    }
    if (ctx === 'tank') {
        const V0 = lfPick([200, 350, 500, 800]), r = lfPick([15, 20, 25, 40]), Vmax = V0 + r * lfPick([20, 30, 40]);
        const x1 = lfPick([5, 10, 12, 15]);
        const steps = [
            eqStep(r, V0, 'Zeit in Minuten', 'Wassermenge in Liter', 'Die Wassermenge zu Beginn ist t, der Zufluss pro Minute ist die Steigung m.'),
            S.calc(`Wie viel Liter sind nach ${x1} Minuten im Becken?`, <V>y</V>, r * x1 + V0, `y = ${r} · ${x1} + ${V0}`, `y = ${r * x1 + V0} Liter`, 'l')
        ];
        if (level !== 'leicht') steps.push(S.calc(`Das Becken fasst ${Vmax} Liter. Nach wie vielen Minuten ist es voll?`, <V>x</V>, (Vmax - V0) / r, `Setze y = ${Vmax} ein: ${Vmax} = ${r}x + ${V0}.`, `x = (${Vmax} − ${V0}) : ${r} = ${(Vmax - V0) / r} min`, 'min'));
        return { typeId: ctx, title: 'Wasserbecken füllen', desc: <>In einem Becken sind bereits {V0} Liter Wasser. Pro Minute fließen {r} Liter dazu. x steht für die Zeit in Minuten, y für die Wassermenge in Liter.</>, steps };
    }
    if (ctx === 'zweiPunkte') {
        const G = lfPick([2.5, 3, 4, 5]), p = lfPick([0.5, 0.75, 1.2, 1.5]);
        const a = lfPick([4, 6, 10]), b = a + lfPick([4, 6, 10]);
        const P = { x: a, y: lfR(G + p * a, 2), n: 'P' }, Q = { x: b, y: lfR(G + p * b, 2), n: 'Q' };
        return {
            typeId: ctx, title: 'Parkhaus-Gebühren',
            desc: <>In einem Parkhaus zahlt man eine feste Einfahrtsgebühr und einen festen Betrag pro angefangener Stunde. Für {a} Stunden zahlt Frau Keller {lfEur(P.y)} €, für {b} Stunden zahlt Herr Kurz {lfEur(Q.y)} €. x steht für die Stunden, y für den Preis in €.</>,
            steps: [...S.line2P(P, Q), S.calc('Wie hoch ist die Einfahrtsgebühr?', <span>Gebühr</span>, G, 'Die Einfahrtsgebühr ist der y-Achsenabschnitt t.', `${lfEur(G)} €`, '€', 0.011)]
        };
    }
    // Tarifvergleich
    const G1 = lfPick([0, 2, 4]), p1 = lfPick([0.15, 0.2, 0.25]);
    const p2 = lfR(p1 - lfPick([0.05, 0.1]), 2), xS = lfPick([40, 60, 80, 100]);
    const G2 = lfR(G1 + (p1 - p2) * xS, 2);
    const g1 = { m: p1, t: G1, n: 'A' }, g2 = { m: p2, t: G2, n: 'B' };
    return {
        typeId: ctx, title: 'Tarifvergleich',
        desc: <>Tarif A kostet {lfEur(G1)} € Grundgebühr und {lfEur(p1)} € pro Minute. Tarif B kostet {lfEur(G2)} € Grundgebühr und {lfEur(p2)} € pro Minute. Ab wie vielen Minuten ist Tarif B günstiger?</>,
        steps: [
            { ...eqStep(p1, G1, 'Minuten', 'Kosten in €', 'Grundgebühr = t, Preis pro Minute = m.'), goal: 'Stelle die Gleichung für Tarif A auf.' },
            { ...eqStep(p2, G2, 'Minuten', 'Kosten in €', 'Grundgebühr = t, Preis pro Minute = m.'), goal: 'Stelle die Gleichung für Tarif B auf.' },
            S.calc('Setze gleich: Bei wie vielen Minuten kosten beide gleich viel?', <V>x</V>, xS, `${lfEur(p1)}x + ${lfEur(G1)} = ${lfEur(p2)}x + ${lfEur(G2)}. Bringe die x-Terme nach links.`, `x = ${xS} Minuten`, 'min', 0.011),
            S.select('Wann ist Tarif B günstiger?', [<span>bei mehr als {xS} Minuten</span>, <span>bei weniger als {xS} Minuten</span>, <span>nie</span>], 0, 'Tarif B hat die höhere Grundgebühr, aber den kleineren Minutenpreis. Er holt also erst später auf.', `ab ${xS} Minuten`, true)
        ]
    };
};

// ==========================================
// 5. PRÜFUNGSAUFGABEN (angelehnt an MSA Bayern 2010–2025)
// Aus dem Prüfungsarchiv des Bayerischen Staatsministeriums. Aufgaben mit reinen
// Begründungen oder unsicheren Werten sind nicht enthalten.
// part: { l, topic, text, graph?, steps: () => [...], fg? (finalGraph) }
// ==========================================
const Ln = (m, t, n) => ({ m, t, n });
const Pt = (x, y, n) => ({ x, y, n });
const gl = (m, t, n) => <Gl m={m} t={t} name={n} />;
const fm = (s) => <span className="font-math whitespace-nowrap">{s}</span>;
const drawFg = (lines, range) => ({ range, lines });

const LF_EXAMS = [
    { id: '2025-I', label: 'MSA 2025 I', nr: '2', parts: [
        { l: 'a', topic: 'ablesen', text: <>Gib mithilfe der Abbildung die Funktionsgleichung der Geraden g₁ an.</>, graph: { range: [-7, 5, -1, 7], lines: [Ln(-1/3, 2, 'g₁')] }, steps: () => S.readGraph(-1/3, 2, 'g₁') },
        { l: 'b', topic: 'parallel', text: <>Die Gerade g₂ verläuft durch den Punkt A(−2 | 3) und steht senkrecht auf der Geraden {gl(-2, -1, 'g₃')}. Ermittle rechnerisch die Funktionsgleichung von g₂.</>, steps: () => S.perpLine('senkrecht', -2, Pt(-2, 3, 'A'), 'g₂', { rel: true }) },
        { l: 'c', topic: 'nullstelle', text: <>Berechne die x-Koordinate des Schnittpunkts N von {gl(-2, -1, 'g₃')} mit der x-Achse und gib N an.</>, steps: () => S.zero(-2, -1, 'N') },
        { l: 'd', topic: 'gleichung', text: <>Die Gerade g₄ verläuft durch die Punkte B(−1 | 3) und C(−2 | 2). Bestimme rechnerisch die Funktionsgleichung von g₄.</>, steps: () => S.line2P(Pt(-1, 3, 'B'), Pt(-2, 2, 'C'), 'g₄') },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne die Geraden {gl(-2, -1, 'g₃')} und {gl(1, 4, 'g₄')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(-2, -1, 'g₃'), Ln(1, 4, 'g₄')], LF_RANGE), fg: drawFg([Ln(-2, -1, 'g₃'), Ln(1, 4, 'g₄')], LF_RANGE) },
        { l: 'g', topic: 'parallel', text: <>Die Gerade g₅ schneidet die x-Achse nicht. Welche Gleichung kann zu g₅ gehören?</>, steps: () => [S.select('Welche Gerade schneidet die x-Achse nicht?', [fm('y = 3'), fm('y = 3x'), fm('y = −x + 3'), fm('y = 0,5x')], 0, 'Eine Gerade schneidet die x-Achse nur dann nicht, wenn sie parallel zur x-Achse verläuft (m = 0) und nicht auf ihr liegt.', 'y = 3 (Parallele zur x-Achse)')] }
    ]},
    { id: '2025-II', label: 'MSA 2025 II', nr: '1', parts: [
        { l: 'a', topic: 'gleichung', text: <>Die Gerade g₁ verläuft durch die Punkte P(0 | −2) und Q(7 | 1,5). Bestimme rechnerisch die Funktionsgleichung von g₁.</>, steps: () => S.line2P(Pt(0, -2, 'P'), Pt(7, 1.5, 'Q'), 'g₁') },
        { l: 'b', topic: 'punktprobe', text: <>Gegeben ist die Gerade {gl(0.25, -5.5, 'g₂')}. Überprüfe rechnerisch, ob der Punkt R(−2 | −5,5) auf g₂ liegt.</>, steps: () => S.probe(0.25, -5.5, Pt(-2, -5.5, 'R'), 'g₂') },
        { l: 'c', topic: 'parallel', text: <>Die Geraden {gl(-4, 3, 'g₃')} und {gl(0.25, -5.5, 'g₂')} schneiden sich im rechten Winkel. Begründe diese Aussage rechnerisch.</>, steps: () => S.checkPerp(0.25, -4, 'g₂', 'g₃') },
        { l: 'd', topic: 'schnittpunkt', text: <>Zeige rechnerisch, dass S(2 | −5) der Schnittpunkt der Geraden {gl(0.25, -5.5, 'g₂')} und {gl(-4, 3, 'g₃')} ist.</>, steps: () => S.intersect(Ln(0.25, -5.5, 'g₂'), Ln(-4, 3, 'g₃'), 'S'), fg: { range: [-6, 6, -8, 4], lines: [Ln(0.25, -5.5, 'g₂'), Ln(-4, 3, 'g₃')], points: [Pt(2, -5, 'S')] } },
        { l: 'e', topic: 'nullstelle', text: <>Die Gerade g₄ hat die Gleichung {fm('y − 1 = ⅓x')} und schneidet die x-Achse im Punkt N. Berechne die x-Koordinate von N.</>, steps: () => [...S.normalStr('y-1=1/3x', 'g₄'), ...S.zero(1/3, 1, 'N')] },
        { l: 'f', topic: 'parallel', text: <>Die Gerade g₅ hat keinen Punkt mit der Geraden {gl(-4, 3, 'g₃')} gemeinsam. Welche Gleichung ist eine mögliche Normalform von g₅?</>, steps: () => [S.select('Welche Gerade hat keinen gemeinsamen Punkt mit g₃?', [fm('y = −4x − 2'), fm('y = 4x + 3'), fm('y = ¼x + 3'), fm('y = −4x + 3')], 0, 'Keine gemeinsamen Punkte → parallel: gleiche Steigung m = −4, aber ein anderes t.', 'y = −4x − 2 (gleiche Steigung, anderes t)')] },
        { l: 'g', topic: 'zeichnen', text: <>Zeichne die Geraden {gl(0.5, -2, 'g₁')} und {gl(-4, 3, 'g₃')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(0.5, -2, 'g₁'), Ln(-4, 3, 'g₃')], LF_RANGE), fg: drawFg([Ln(0.5, -2, 'g₁'), Ln(-4, 3, 'g₃')], LF_RANGE) }
    ]},
    { id: '2024-I', label: 'MSA 2024 I', nr: '1', parts: [
        { l: 'a', topic: 'gleichung', text: <>Die Gerade g₁ verläuft durch die Punkte A(1 | −3) und B(3 | −5). Ermittle rechnerisch die Funktionsgleichung von g₁.</>, steps: () => S.line2P(Pt(1, -3, 'A'), Pt(3, -5, 'B'), 'g₁') },
        { l: 'b', topic: 'punktprobe', text: <>Gegeben ist die Gerade {gl(3, -3, 'g₂')}. Überprüfe rechnerisch, ob der Punkt C(1,5 | 1,5) auf g₂ liegt.</>, steps: () => S.probe(3, -3, Pt(1.5, 1.5, 'C'), 'g₂') },
        { l: 'c', topic: 'parallel', text: <>Die Gerade g₃ verläuft durch den Punkt D(3 | −2) und steht senkrecht auf {gl(3, -3, 'g₂')}. Ermittle die Funktionsgleichung von g₃.</>, steps: () => S.perpLine('senkrecht', 3, Pt(3, -2, 'D'), 'g₃', { rel: true }) },
        { l: 'd', topic: 'nullstelle', text: <>Berechne die x-Koordinate des Schnittpunkts N₄ der Geraden {gl(-1, -1, 'g₄')} mit der x-Achse.</>, steps: () => S.zero(-1, -1, 'N₄') },
        { l: 'e', topic: 'schnittpunkt', text: <>Ermittle rechnerisch die Koordinaten des Schnittpunkts S der Geraden {gl(3, -3, 'g₂')} und {gl(-1, -1, 'g₄')}.</>, steps: () => S.intersect(Ln(3, -3, 'g₂'), Ln(-1, -1, 'g₄'), 'S'), fg: { range: LF_RANGE, lines: [Ln(3, -3, 'g₂'), Ln(-1, -1, 'g₄')], points: [Pt(0.5, -1.5, 'S')] } },
        { l: 'f', topic: 'parallel', text: <>Die Geraden {fm('g₅: y = 3/7 x − 3')} und {fm('g₆: y = 3/7 x + 7')} haben keinen gemeinsamen Punkt. Welche Veränderung genau einer Zahl sorgt dafür, dass die Geraden mindestens einen Punkt gemeinsam haben?</>, steps: () => [S.select('Welche Änderung führt zu einem gemeinsamen Punkt?', [<span>In g₅ wird 3/7 durch 2/7 ersetzt.</span>, <span>In g₅ wird −3 durch 5 ersetzt.</span>, <span>In g₆ wird 7 durch −7 ersetzt.</span>], 0, 'Parallele Geraden (gleiches m, verschiedenes t) haben keinen gemeinsamen Punkt. Ändert man eine Steigung, schneiden sie sich.', 'Steigung ändern, z. B. 3/7 → 2/7')] },
        { l: 'g', topic: 'zeichnen', text: <>Zeichne die Geraden {gl(3, -3, 'g₂')} und {gl(-1, -1, 'g₄')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(3, -3, 'g₂'), Ln(-1, -1, 'g₄')], LF_RANGE), fg: drawFg([Ln(3, -3, 'g₂'), Ln(-1, -1, 'g₄')], LF_RANGE) }
    ]},
    { id: '2024-II', label: 'MSA 2024 II', nr: '1', intro: <>Gegeben sind die Punkte A(−2 | 2) und C(6 | 4). Die Gerade g₁ verläuft parallel zur x-Achse durch A. Die Gerade g₂ verläuft durch A und C.</>, parts: [
        { l: 'a', topic: 'zeichnen', text: <>Zeichne die Geraden {gl(0, 2, 'g₁')} und {gl(0.25, 2.5, 'g₂')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(0, 2, 'g₁'), Ln(0.25, 2.5, 'g₂')], [-4, 8, -3, 6]), fg: drawFg([Ln(0, 2, 'g₁'), Ln(0.25, 2.5, 'g₂')], [-4, 8, -3, 6]) },
        { l: 'c', topic: 'parallel', text: <>Gib die Funktionsgleichung der Geraden g₁ an.</>, steps: () => [S.horizontal(Pt(-2, 2, 'A'), 'g₁')] },
        { l: 'd', topic: 'gleichung', text: <>Bestimme rechnerisch die Funktionsgleichung der Geraden g₂.</>, steps: () => S.line2P(Pt(-2, 2, 'A'), Pt(6, 4, 'C'), 'g₂') },
        { l: 'e', topic: 'schnittpunkt', text: <>Die Gerade g₄: {fm('½y + 1 − 3x = 0')} schneidet die Gerade {gl(-0.5, 4.5, 'g₅')} im Punkt D. Ermittle rechnerisch die Koordinaten von D.</>, steps: () => [...S.normalStr('0.5y+1-3x=0', 'g₄'), ...S.intersect(Ln(6, -2, 'g₄'), Ln(-0.5, 4.5, 'g₅'), 'D')], fg: { range: LF_RANGE, lines: [Ln(6, -2, 'g₄'), Ln(-0.5, 4.5, 'g₅')], points: [Pt(1, 4, 'D')] } }
    ]},
    { id: '2023-I', label: 'MSA 2023 I', nr: '3', parts: [
        { l: 'a', topic: 'gleichung', text: <>Bestimme rechnerisch die Funktionsgleichung der Geraden g₁, die durch die Punkte A(−1 | −4,5) und B(4 | 3) verläuft.</>, steps: () => S.line2P(Pt(-1, -4.5, 'A'), Pt(4, 3, 'B'), 'g₁') },
        { l: 'b', topic: 'parallel', text: <>Die Gerade g₃: {fm('0,5y = 2,5 + x')} steht senkrecht auf der Geraden g₂. Bestimme die Steigung m₂ einer möglichen Geraden g₂.</>, steps: () => [...S.normalStr('0.5y=2.5+x', 'g₃'), S.relation('senkrecht'), S.m2('senkrecht', 2)] },
        { l: 'c', topic: 'nullstelle', text: <>Gegeben ist {gl(2, 4, 'g₄')}. N₄ ist der Schnittpunkt von g₄ mit der x-Achse. Bestimme rechnerisch N₄.</>, steps: () => S.zero(2, 4, 'N₄') },
        { l: 'd', topic: 'zeichnen', text: <>Zeichne die Geraden {gl(1.5, -3, 'g₁')} und {gl(2, 4, 'g₄')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(1.5, -3, 'g₁'), Ln(2, 4, 'g₄')], LF_RANGE), fg: drawFg([Ln(1.5, -3, 'g₁'), Ln(2, 4, 'g₄')], LF_RANGE) },
        { l: 'e', topic: 'steigung', text: <>Berechne den spitzen Winkel, den die Gerade {gl(1.5, -3, 'g₁')} mit der x-Achse einschließt.</>, steps: () => S.angle(1.5) }
    ]},
    { id: '2023-II', label: 'MSA 2023 II', nr: '1', intro: <>Die Abbildung zeigt den Graphen der Geraden g₁.</>, graph: { range: [-2, 9, -4, 4], lines: [Ln(2/3, -2, 'g₁')] }, parts: [
        { l: 'a', topic: 'ablesen', text: <>Gib die Funktionsgleichung der Geraden g₁ an.</>, steps: () => S.readGraph(2/3, -2, 'g₁') },
        { l: 'b', topic: 'steigung', text: <>Berechne den Winkel α, den die Gerade g₁ mit der x-Achse einschließt.</>, steps: () => S.angle(2/3) },
        { l: 'c', topic: 'gleichung', text: <>Die Gerade g₂ verläuft durch die Punkte A(−4 | 5) und B(1 | −2,5). Bestimme rechnerisch die Funktionsgleichung von g₂.</>, steps: () => S.line2P(Pt(-4, 5, 'A'), Pt(1, -2.5, 'B'), 'g₂') },
        { l: 'd', topic: 'parallel', text: <>Die Gerade {fm('g₃: y = −⅘x + 2')} steht senkrecht auf der Geraden g₄, die durch den Ursprung verläuft. Bestimme die Funktionsgleichung von g₄.</>, steps: () => S.perpLine('senkrecht', -0.8, Pt(0, 0, 'O'), 'g₄', { rel: true }) },
        { l: 'e', topic: 'nullstelle', text: <>N₃ ist der Schnittpunkt der Geraden {fm('g₃: y = −⅘x + 2')} mit der x-Achse. Ermittle rechnerisch N₃.</>, steps: () => S.zero(-0.8, 2, 'N₃') },
        { l: 'f', topic: 'schnittpunkt', text: <>Die Gerade g₅ hat die Gleichung {fm('y = 1,2x − 3')}. Zeige rechnerisch, dass der Schnittpunkt von g₅ mit {fm('g₃: y = −0,8x + 2')} auf der x-Achse liegt.</>, steps: () => S.intersect(Ln(1.2, -3, 'g₅'), Ln(-0.8, 2, 'g₃'), 'S'), fg: { range: LF_RANGE, lines: [Ln(1.2, -3, 'g₅'), Ln(-0.8, 2, 'g₃')], points: [Pt(2.5, 0, 'S')] } },
        { l: 'g', topic: 'zeichnen', text: <>Zeichne die Geraden {gl(-1.5, -1, 'g₂')} und {gl(-0.8, 2, 'g₃')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(-1.5, -1, 'g₂'), Ln(-0.8, 2, 'g₃')], LF_RANGE), fg: drawFg([Ln(-1.5, -1, 'g₂'), Ln(-0.8, 2, 'g₃')], LF_RANGE) }
    ]},
    { id: '2022-I', label: 'MSA 2022 I', nr: '5', parts: [
        { l: 'a', topic: 'gleichung', text: <>Die Gerade g₁ verläuft durch den Punkt A(4 | 4,5) und hat die Steigung m₁ = ¾. Bestimme rechnerisch die Funktionsgleichung von g₁.</>, steps: () => S.linePM(Pt(4, 4.5, 'A'), 0.75, 'g₁') },
        { l: 'b', topic: 'nullstelle', text: <>Berechne die x-Koordinate der Nullstelle N der Geraden {gl(-2.5, -7.5, 'g₂')}.</>, steps: () => S.zero(-2.5, -7.5, 'N') },
        { l: 'c', topic: 'punktprobe', text: <>Der Punkt P(−4 | <V>y</V>) liegt auf {gl(-2.5, -7.5, 'g₂')}. Berechne die fehlende y-Koordinate.</>, steps: () => S.missingY(-2.5, -7.5, -4, 'P') },
        { l: 'd', topic: 'parallel', text: <>Die Gerade g₄ durch C(4,5 | −2) steht senkrecht auf {gl(0.25, 4, 'g₃')}. Ermittle rechnerisch die Funktionsgleichung von g₄.</>, steps: () => S.perpLine('senkrecht', 0.25, Pt(4.5, -2, 'C'), 'g₄', { rel: true }) },
        { l: 'e', topic: 'schnittpunkt', text: <>Die Gerade g₅: {fm('14 − 3y = 3,75x − 7')} schneidet {gl(0.25, 4, 'g₃')} im Punkt D. Bestimme rechnerisch die Koordinaten von D.</>, steps: () => [...S.normalStr('14-3y=3.75x-7', 'g₅'), ...S.intersect(Ln(0.25, 4, 'g₃'), Ln(-1.25, 7, 'g₅'), 'D')], fg: { range: [-4, 8, -3, 9], lines: [Ln(0.25, 4, 'g₃'), Ln(-1.25, 7, 'g₅')], points: [Pt(2, 4.5, 'D')] } },
        { l: 'f', topic: 'gleichung', text: <>Ermittle rechnerisch die Funktionsgleichung der Geraden g₆, auf der die Punkte E(4,5 | −2) und F(−1,5 | 6) liegen.</>, steps: () => S.line2P(Pt(4.5, -2, 'E'), Pt(-1.5, 6, 'F'), 'g₆') },
        { l: 'g', topic: 'zeichnen', text: <>Zeichne die Geraden {gl(-2.5, -7.5, 'g₂')}, {gl(0.25, 4, 'g₃')} und {fm('g₆: y = −4/3x + 4')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(-2.5, -7.5, 'g₂'), Ln(0.25, 4, 'g₃'), Ln(-4/3, 4, 'g₆')], LF_RANGE), fg: drawFg([Ln(-2.5, -7.5, 'g₂'), Ln(0.25, 4, 'g₃'), Ln(-4/3, 4, 'g₆')], LF_RANGE) }
    ]},
    { id: '2022-II', label: 'MSA 2022 II', nr: '1', parts: [
        { l: 'a', topic: 'nullstelle', text: <>Die Gerade g₁ ist durch {gl(-1, 3.5, 'g₁')} bestimmt. Berechne den Schnittpunkt N von g₁ mit der x-Achse.</>, steps: () => S.zero(-1, 3.5, 'N') },
        { l: 'b', topic: 'wertetabelle', text: <>Die Wertepaare (−3 | −4), (2 | 3,5) und (4 | 6,5) sind Punkte der Geraden g₂. Ermittle die Funktionsgleichung von g₂.</>, steps: () => S.line2P(Pt(-3, -4, 'P'), Pt(2, 3.5, 'Q'), 'g₂') },
        { l: 'c', topic: 'schnittpunkt', text: <>Die Gerade {gl(-0.2, -1.5, 'g₃')} schneidet {gl(-1, 3.5, 'g₁')} im Punkt T. Berechne die Koordinaten von T.</>, steps: () => S.intersect(Ln(-1, 3.5, 'g₁'), Ln(-0.2, -1.5, 'g₃'), 'T'), fg: { range: [-3, 9, -6, 6], lines: [Ln(-1, 3.5, 'g₁'), Ln(-0.2, -1.5, 'g₃')], points: [Pt(6.25, -2.75, 'T')] } },
        { l: 'e', topic: 'parallel', text: <>Die Gerade g₅ hat die Gleichung {fm('y = ⅓x + 4')}. Die Gerade g₆ steht senkrecht auf g₅ und verläuft durch P(−1 | 5). Bestimme rechnerisch die Funktionsgleichung von g₆.</>, steps: () => S.perpLine('senkrecht', 1/3, Pt(-1, 5, 'P'), 'g₆', { rel: true }) },
        { l: 'f', topic: 'zeichnen', text: <>Zeichne die Geraden {gl(-1, 3.5, 'g₁')}, {fm('g₅: y = ⅓x + 4')} und {gl(-3, 2, 'g₆')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(-1, 3.5, 'g₁'), Ln(1/3, 4, 'g₅'), Ln(-3, 2, 'g₆')], LF_RANGE), fg: drawFg([Ln(-1, 3.5, 'g₁'), Ln(1/3, 4, 'g₅'), Ln(-3, 2, 'g₆')], LF_RANGE) }
    ]},
    { id: '2021-I', label: 'MSA 2021 I', nr: '5', parts: [
        { l: 'a', topic: 'gleichung', text: <>Bestimme rechnerisch die Funktionsgleichung der Geraden g₁ durch A(4 | −1) und B(6 | 1).</>, steps: () => S.line2P(Pt(4, -1, 'A'), Pt(6, 1, 'B'), 'g₁') },
        { l: 'b', topic: 'parallel', text: <>Die Gerade g₂ verläuft durch C(2 | 4) und steht senkrecht auf g₃: {fm('y/x = 1')} (also {fm('y = x')}). Ermittle rechnerisch die Funktionsgleichung von g₂.</>, steps: () => S.perpLine('senkrecht', 1, Pt(2, 4, 'C'), 'g₂', { rel: true }) },
        { l: 'c', topic: 'zeichnen', text: <>Zeichne die Geraden {gl(1, -5, 'g₁')} und {gl(-1, 6, 'g₂')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(1, -5, 'g₁'), Ln(-1, 6, 'g₂')], [-2, 8, -6, 6]), fg: drawFg([Ln(1, -5, 'g₁'), Ln(-1, 6, 'g₂')], [-2, 8, -6, 6]) },
        { l: 'd', topic: 'parallel', text: <>Welche Gleichung beschreibt eine Gerade g₄, die parallel zur x-Achse verläuft?</>, steps: () => [S.select('Welche Gerade verläuft parallel zur x-Achse?', [fm('y = 4'), fm('y = 4x'), fm('y = x + 4'), fm('x = 4')], 0, 'Eine Parallele zur x-Achse hat die Steigung 0: y = t.', 'y = 4')] },
        { l: 'e', topic: 'punktprobe', text: <>Der Punkt D(−3 | 3) liegt auf der Geraden g₅: {fm('y = m₅ · x − 9')}. Bestimme die Steigung m₅ rechnerisch.</>, steps: () => S.unknownM(Pt(-3, 3, 'D'), -9, 'g₅') },
        { l: 'f', topic: 'schnittpunkt', text: <>Die Geraden {gl(2, -7, 'g₆')} und {gl(-0.5, 3, 'g₇')} schneiden sich im Punkt S. Ermittle rechnerisch die Koordinaten von S.</>, steps: () => S.intersect(Ln(2, -7, 'g₆'), Ln(-0.5, 3, 'g₇'), 'S'), fg: { range: LF_RANGE, lines: [Ln(2, -7, 'g₆'), Ln(-0.5, 3, 'g₇')], points: [Pt(4, 1, 'S')] } },
        { l: 'g', topic: 'nullstelle', text: <>Berechne die Koordinaten des Schnittpunkts N der Geraden {gl(-0.5, 3, 'g₇')} mit der x-Achse.</>, steps: () => S.zero(-0.5, 3, 'N') }
    ]},
    { id: '2021-II', label: 'MSA 2021 II', nr: '1', intro: <>Die Gerade g₁ hat die Funktionsgleichung {gl(-0.5, 3, 'g₁')}.</>, parts: [
        { l: 'a', topic: 'nullstelle', text: <>Berechne die Koordinaten des Schnittpunkts N von g₁ mit der x-Achse.</>, steps: () => S.zero(-0.5, 3, 'N') },
        { l: 'b', topic: 'wertetabelle', text: <>Ergänze die fehlenden Werte der Wertetabelle zu g₁.<LfTabelle xs={['5', '?']} ys={['?', '21']} /></>, steps: () => [...S.missingY(-0.5, 3, 5, 'P'), ...S.missingX(-0.5, 3, 21, 'Q')] },
        { l: 'c', topic: 'parallel', text: <>Die Gerade g₂ verläuft durch B(−2,5 | 0) und steht senkrecht auf g₁. Bestimme rechnerisch die Funktionsgleichung von g₂.</>, steps: () => S.perpLine('senkrecht', -0.5, Pt(-2.5, 0, 'B'), 'g₂', { rel: true }) },
        { l: 'd', topic: 'zeichnen', text: <>Zeichne die Geraden {gl(-0.5, 3, 'g₁')} und {gl(2, 5, 'g₂')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(-0.5, 3, 'g₁'), Ln(2, 5, 'g₂')], LF_RANGE), fg: drawFg([Ln(-0.5, 3, 'g₁'), Ln(2, 5, 'g₂')], LF_RANGE) },
        { l: 'e', topic: 'gleichung', text: <>Die Gerade g₃ verläuft durch C(−1 | −1) und D(4 | 1). Ermittle ihre Funktionsgleichung rechnerisch.</>, steps: () => S.line2P(Pt(-1, -1, 'C'), Pt(4, 1, 'D'), 'g₃') },
        { l: 'f', topic: 'schnittpunkt', text: <>Die Gerade g₄: {fm('−0,5x = −5 − y')} schneidet g₁ im Punkt T. Bestimme durch Rechnung die Koordinaten von T.</>, steps: () => [...S.normalStr('-0.5x=-5-y', 'g₄'), ...S.intersect(Ln(-0.5, 3, 'g₁'), Ln(0.5, -5, 'g₄'), 'T')], fg: { range: [-2, 10, -6, 6], lines: [Ln(-0.5, 3, 'g₁'), Ln(0.5, -5, 'g₄')], points: [Pt(8, -1, 'T')] } },
        { l: 'g', topic: 'ablesen', text: <>Gegeben ist der Graph der Geraden g₅. Gib ihre Funktionsgleichung an.</>, graph: { range: [-6, 6, -2, 4], lines: [Ln(0.25, 1, 'g₅')] }, steps: () => S.readGraph(0.25, 1, 'g₅') }
    ]},
    { id: '2020-I', label: 'MSA 2020 I', nr: '5', parts: [
        { l: 'a', topic: 'gleichung', text: <>Bestimme rechnerisch die Funktionsgleichung der Geraden g₁ durch C(6 | 2) und D(−3 | −1).</>, steps: () => S.line2P(Pt(6, 2, 'C'), Pt(-3, -1, 'D'), 'g₁') },
        { l: 'b', topic: 'parallel', text: <>Die Gerade g₃ verläuft durch B(1 | −2) und steht senkrecht auf {fm('g₂: y = x')}. Bestimme rechnerisch die Funktionsgleichung von g₃.</>, steps: () => S.perpLine('senkrecht', 1, Pt(1, -2, 'B'), 'g₃', { rel: true }) },
        { l: 'c', topic: 'parallel', text: <>Welche Gerade g₄ verläuft parallel zu {fm('g₂: y = x')} und liegt nicht auf g₂?</>, steps: () => [S.select('Welche Gerade passt?', [fm('y = x + 2'), fm('y = −x'), fm('y = 2x'), fm('y = x')], 0, 'Parallel: gleiche Steigung m = 1. „Liegt nicht auf g₂“: ein anderes t.', 'y = x + 2')] },
        { l: 'd', topic: 'punktprobe', text: <>Der Punkt A(4 | −1) liegt auf g₅: {fm('y = m₅ · x + 4')}. Bestimme die Steigung m₅ rechnerisch.</>, steps: () => S.unknownM(Pt(4, -1, 'A'), 4, 'g₅') },
        { l: 'e', topic: 'schnittpunkt', text: <>Die Gerade {gl(1, -2.5, 'g₆')} und die Gerade g₇: {fm('2x + 3,5 = y')} schneiden sich im Punkt S. Ermittle rechnerisch die Koordinaten von S.</>, steps: () => S.intersect(Ln(1, -2.5, 'g₆'), Ln(2, 3.5, 'g₇'), 'S'), fg: { range: [-10, 4, -12, 4], lines: [Ln(1, -2.5, 'g₆'), Ln(2, 3.5, 'g₇')], points: [Pt(-6, -8.5, 'S')] } },
        { l: 'f', topic: 'nullstelle', text: <>Berechne die Koordinaten des Schnittpunkts N der Geraden g₇: {fm('y = 2x + 3,5')} mit der x-Achse.</>, steps: () => S.zero(2, 3.5, 'N') },
        { l: 'g', topic: 'zeichnen', text: <>Zeichne die Geraden {gl(-1.25, 4, 'g₅')} und {gl(1, -2.5, 'g₆')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(-1.25, 4, 'g₅'), Ln(1, -2.5, 'g₆')], LF_RANGE), fg: drawFg([Ln(-1.25, 4, 'g₅'), Ln(1, -2.5, 'g₆')], LF_RANGE) }
    ]},
    { id: '2020-II', label: 'MSA 2020 II', nr: '1', intro: <>Gegeben ist der Graph der Geraden g₁.</>, graph: { range: [-3, 7, -2, 5], lines: [Ln(-2/3, 3, 'g₁')] }, parts: [
        { l: 'a', topic: 'ablesen', text: <>Gib die Funktionsgleichung der Geraden g₁ an.</>, steps: () => S.readGraph(-2/3, 3, 'g₁') },
        { l: 'b', topic: 'gleichung', text: <>Die Gerade g₂ verläuft durch A(6 | 3) und B(−2 | 5). Bestimme ihre Funktionsgleichung rechnerisch.</>, steps: () => S.line2P(Pt(6, 3, 'A'), Pt(-2, 5, 'B'), 'g₂') },
        { l: 'c', topic: 'schnittpunkt', text: <>Die Gerade {gl(-2, 6, 'g₃')} schneidet {gl(0.5, -1.5, 'g₄')} im Punkt T. Bestimme die Koordinaten von T rechnerisch.</>, steps: () => S.intersect(Ln(-2, 6, 'g₃'), Ln(0.5, -1.5, 'g₄'), 'T'), fg: { range: LF_RANGE, lines: [Ln(-2, 6, 'g₃'), Ln(0.5, -1.5, 'g₄')], points: [Pt(3, 0, 'T')] } },
        { l: 'd', topic: 'punktprobe', text: <>Überprüfe rechnerisch, ob der Punkt P(7,25 | 11,75) auf {gl(-2, 6, 'g₃')} liegt.</>, steps: () => S.probe(-2, 6, Pt(7.25, 11.75, 'P'), 'g₃') },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne die Geraden {gl(-2, 6, 'g₃')} und {gl(0.5, -1.5, 'g₄')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(-2, 6, 'g₃'), Ln(0.5, -1.5, 'g₄')], LF_RANGE), fg: drawFg([Ln(-2, 6, 'g₃'), Ln(0.5, -1.5, 'g₄')], LF_RANGE) },
        { l: 'f', topic: 'nullstelle', text: <>Bestimme rechnerisch den Schnittpunkt N der Geraden g₅: {fm('0 = −y − 4x + 0,5')} mit der x-Achse.</>, steps: () => [...S.normalStr('0=-y-4x+0.5', 'g₅'), ...S.zero(-4, 0.5, 'N')] },
        { l: 'h', topic: 'steigung', text: <>Berechne den Winkel α, den g₁ mit der x-Achse einschließt.</>, steps: () => S.angle(-2/3) }
    ]},
    { id: '2019-I', label: 'MSA 2019 I', nr: '4', intro: <>Die Gerade g₁ mit der Steigung m₁ = 2 verläuft durch den Punkt A(5 | 3).</>, parts: [
        { l: 'a', topic: 'gleichung', text: <>Bestimme die Funktionsgleichung von g₁ rechnerisch.</>, steps: () => S.linePM(Pt(5, 3, 'A'), 2, 'g₁') },
        { l: 'b', topic: 'parallel', text: <>Die Gerade g₂ verläuft durch den Ursprung und schneidet g₁ senkrecht. Ermittle rechnerisch die Funktionsgleichung von g₂.</>, steps: () => S.perpLine('senkrecht', 2, Pt(0, 0, 'O'), 'g₂', { rel: true }) },
        { l: 'c', topic: 'zeichnen', text: <>Zeichne die Geraden {gl(2, -7, 'g₁')} und {gl(-0.5, 0, 'g₂')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(2, -7, 'g₁'), Ln(-0.5, 0, 'g₂')], [-3, 8, -6, 6]), fg: drawFg([Ln(2, -7, 'g₁'), Ln(-0.5, 0, 'g₂')], [-3, 8, -6, 6]) },
        { l: 'd', topic: 'steigung', text: <>Berechne die Größe des spitzen Winkels α, den g₁ mit der x-Achse einschließt.</>, steps: () => S.angle(2) },
        { l: 'e', topic: 'parallel', text: <>Überprüfe, ob die Geraden g₃: {fm('4x + 2y = 8x + 3')} und g₄: {fm('−y/2 = x + 1')} parallel zu {gl(2, -7, 'g₁')} sind.</>, steps: () => [...S.normalStr('4x+2y=8x+3', 'g₃'), S.lage(Ln(2, -7, 'g₁'), Ln(2, 1.5, 'g₃')), ...S.normalStr('-0.5y=x+1', 'g₄'), S.lage(Ln(2, -7, 'g₁'), Ln(-2, -2, 'g₄'))] },
        { l: 'f', topic: 'gleichung', text: <>Auf der Geraden g₅ liegen E(−2 | 4) und F(2 | −2). Bestimme ihre Funktionsgleichung rechnerisch.</>, steps: () => S.line2P(Pt(-2, 4, 'E'), Pt(2, -2, 'F'), 'g₅') }
    ]},
    { id: '2019-II', label: 'MSA 2019 II', nr: '1', parts: [
        { l: 'a', topic: 'gleichung', text: <>Die Punkte A(1 | 2,5) und B(3 | −2,5) liegen auf g₁. Bestimme die Funktionsgleichung von g₁ rechnerisch.</>, steps: () => S.line2P(Pt(1, 2.5, 'A'), Pt(3, -2.5, 'B'), 'g₁') },
        { l: 'b', topic: 'nullstelle', text: <>Bestimme den Schnittpunkt N von {gl(0.5, 1, 'g₂')} mit der x-Achse.</>, steps: () => S.zero(0.5, 1, 'N') },
        { l: 'c', topic: 'schnittpunkt', text: <>Die Gerade g₃: {fm('2y + 4 = 4x')} schneidet {gl(0.5, 1, 'g₂')} im Punkt T. Berechne die Koordinaten von T.</>, steps: () => [...S.normalStr('2y+4=4x', 'g₃'), ...S.intersect(Ln(0.5, 1, 'g₂'), Ln(2, -2, 'g₃'), 'T')], fg: { range: LF_RANGE, lines: [Ln(0.5, 1, 'g₂'), Ln(2, -2, 'g₃')], points: [Pt(2, 2, 'T')] } },
        { l: 'd', topic: 'punktprobe', text: <>Überprüfe mithilfe einer Rechnung, ob der Punkt C(1 | −1) auf {gl(2, -2, 'g₃')} liegt.</>, steps: () => S.probe(2, -2, Pt(1, -1, 'C'), 'g₃') },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne die Graphen von {gl(0.5, 1, 'g₂')} und {gl(2, -2, 'g₃')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(0.5, 1, 'g₂'), Ln(2, -2, 'g₃')], LF_RANGE), fg: drawFg([Ln(0.5, 1, 'g₂'), Ln(2, -2, 'g₃')], LF_RANGE) },
        { l: 'f', topic: 'steigung', text: <>Ermittle rechnerisch den spitzen Winkel α, den {gl(0.5, 1, 'g₂')} mit der x-Achse einschließt.</>, steps: () => S.angle(0.5) }
    ]},
    { id: '2018-I', label: 'MSA 2018 I', nr: '4', intro: <>Die Wertepaare (−10 | −4), (−5 | −1), (0 | 2) und (2,5 | 3,5) sind Punkte der Geraden g₁.</>, parts: [
        { l: 'a', topic: 'wertetabelle', text: <>Bestimme die Funktionsgleichung von g₁ rechnerisch.</>, steps: () => S.line2P(Pt(-5, -1, 'P'), Pt(0, 2, 'Q'), 'g₁') },
        { l: 'b', topic: 'parallel', text: <>Die Gerade g₂ ist durch {fm('−x + 5y = 20')} bestimmt. Die Gerade g₃ steht senkrecht auf g₂ und verläuft durch A(−3 | 0). Ermittle rechnerisch die Funktionsgleichung von g₃.</>, steps: () => [...S.normalStr('-x+5y=20', 'g₂'), ...S.perpLine('senkrecht', 0.2, Pt(-3, 0, 'A'), 'g₃')] },
        { l: 'c', topic: 'punktprobe', text: <>Überprüfe rechnerisch, ob der Punkt B(5 | 5) auf der Geraden {gl(-5, -5, 'g₄')} liegt (und damit ein gemeinsamer Punkt mit g₂ sein könnte).</>, steps: () => S.probe(-5, -5, Pt(5, 5, 'B'), 'g₄') },
        { l: 'd', topic: 'parallel', text: <>(I) Verläuft {gl(-5, -5, 'g₄')} parallel zu g₅: {fm('−5x + y = −3')}? (II) Steht g₄ senkrecht auf {gl(0.2, 0, 'g₆')}?</>, steps: () => [...S.normalStr('-5x+y=-3', 'g₅'), S.lage(Ln(-5, -5, 'g₄'), Ln(5, -3, 'g₅')), ...S.checkPerp(-5, 0.2, 'g₄', 'g₆')] },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne die Graphen von {gl(0.6, 2, 'g₁')} und {gl(0.2, 0, 'g₆')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(0.6, 2, 'g₁'), Ln(0.2, 0, 'g₆')], [-6, 8, -4, 6]), fg: drawFg([Ln(0.6, 2, 'g₁'), Ln(0.2, 0, 'g₆')], [-6, 8, -4, 6]) }
    ]},
    { id: '2018-II', label: 'MSA 2018 II', nr: '1', intro: <>Gegeben ist der Graph der linearen Funktion g₁.</>, graph: { range: [-2, 7, -1, 4], lines: [Ln(-0.25, 2.5, 'g₁')] }, parts: [
        { l: 'a', topic: 'ablesen', text: <>Bestimme die Funktionsgleichung von g₁.</>, steps: () => S.readGraph(-0.25, 2.5, 'g₁') },
        { l: 'b', topic: 'parallel', text: <>Die Gerade g₃ verläuft parallel zu {gl(-2, -3, 'g₂')} und durch C(1 | 2). Ermittle die Funktionsgleichung von g₃ rechnerisch.</>, steps: () => S.perpLine('parallel', -2, Pt(1, 2, 'C'), 'g₃', { rel: true }) },
        { l: 'c', topic: 'nullstelle', text: <>Bestimme den Schnittpunkt N von {gl(-2, -3, 'g₂')} mit der x-Achse.</>, steps: () => S.zero(-2, -3, 'N') },
        { l: 'e', topic: 'punktprobe', text: <>Der Punkt D(16,5 | <V>y</V>) liegt auf {gl(-2, -3, 'g₂')}. Berechne die fehlende Koordinate.</>, steps: () => S.missingY(-2, -3, 16.5, 'D') },
        { l: 'f', topic: 'zeichnen', text: <>Zeichne die Graphen von {gl(-2, -3, 'g₂')} und {gl(-2, 4, 'g₃')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(-2, -3, 'g₂'), Ln(-2, 4, 'g₃')], LF_RANGE), fg: drawFg([Ln(-2, -3, 'g₂'), Ln(-2, 4, 'g₃')], LF_RANGE) }
    ]},
    { id: '2017-I', label: 'MSA 2017 I', nr: '1', intro: <>Die Abbildung zeigt den Graphen der Geraden g₁.</>, graph: { range: [-6, 4, -1, 7], lines: [Ln(0.25, 5, 'g₁')] }, parts: [
        { l: 'a', topic: 'ablesen', text: <>Gib die Funktionsgleichung von g₁ an.</>, steps: () => S.readGraph(0.25, 5, 'g₁') },
        { l: 'b', topic: 'parallel', text: <>Die Gerade g₂ durch den Ursprung ist parallel zu g₁. Gib die Funktionsgleichung von g₂ an.</>, steps: () => S.perpLine('parallel', 0.25, Pt(0, 0, 'O'), 'g₂', { rel: true }) },
        { l: 'c', topic: 'parallel', text: <>Die Gerade g₄ verläuft durch D(4 | 1) und ist parallel zu {gl(0.5, -3, 'g₃')}. Bestimme rechnerisch die Funktionsgleichung von g₄.</>, steps: () => S.perpLine('parallel', 0.5, Pt(4, 1, 'D'), 'g₄') },
        { l: 'd', topic: 'zeichnen', text: <>Zeichne die Geraden {gl(0.5, -3, 'g₃')} und {gl(0.5, -1, 'g₄')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(0.5, -3, 'g₃'), Ln(0.5, -1, 'g₄')], LF_RANGE), fg: drawFg([Ln(0.5, -3, 'g₃'), Ln(0.5, -1, 'g₄')], LF_RANGE) }
    ]},
    { id: '2017-II', label: 'MSA 2017 II', nr: '1', intro: <>Gegeben ist die Gerade g₁: {fm('y = ⅓x + 2')}.</>, parts: [
        { l: 'a', topic: 'nullstelle', text: <>Berechne den Schnittpunkt N von g₁ mit der x-Achse.</>, steps: () => S.zero(1/3, 2, 'N') },
        { l: 'b', topic: 'parallel', text: <>Die Gerade g₂ schneidet die y-Achse in P(0 | 7) und steht senkrecht auf g₁. Ermittle die Funktionsgleichung von g₂ rechnerisch.</>, steps: () => S.perpLine('senkrecht', 1/3, Pt(0, 7, 'P'), 'g₂', { rel: true }) },
        { l: 'c', topic: 'gleichung', text: <>Die Gerade g₃ verläuft durch Q(−3 | 2) und R(6 | −1). Bestimme ihre Funktionsgleichung rechnerisch.</>, steps: () => S.line2P(Pt(-3, 2, 'Q'), Pt(6, -1, 'R'), 'g₃') },
        { l: 'd', topic: 'zeichnen', text: <>Zeichne die Geraden {fm('g₁: y = ⅓x + 2')} und {gl(-3, 7, 'g₂')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(1/3, 2, 'g₁'), Ln(-3, 7, 'g₂')], [-6, 6, -2, 8]), fg: drawFg([Ln(1/3, 2, 'g₁'), Ln(-3, 7, 'g₂')], [-6, 6, -2, 8]) },
        { l: 'e', topic: 'schnittpunkt', text: <>Die Gerade g₄: {fm('2x − y = 7')} schneidet g₁ im Punkt S. Ermittle rechnerisch die Koordinaten von S.</>, steps: () => [...S.normalStr('2x-y=7', 'g₄'), ...S.intersect(Ln(1/3, 2, 'g₁'), Ln(2, -7, 'g₄'), 'S')], fg: { range: [-2, 8, -4, 6], lines: [Ln(1/3, 2, 'g₁'), Ln(2, -7, 'g₄')], points: [Pt(5.4, 3.8, 'S')] } },
        { l: 'f', topic: 'steigung', text: <>Berechne den spitzen Winkel α, den g₁ mit der x-Achse einschließt.</>, steps: () => S.angle(1/3) },
        { l: 'g', topic: 'parallel', text: <>Die Gerade g₅ durch T(15 | 25) verläuft parallel zur x-Achse. Gib ihre Funktionsgleichung an.</>, steps: () => [S.horizontal(Pt(15, 25, 'T'), 'g₅')] }
    ]},
    { id: '2016-I', label: 'MSA 2016 I', nr: '1', parts: [
        { l: 'a', topic: 'gleichung', text: <>Die Gerade g₁ verläuft durch A(4 | 1,5) und B(−3 | −2). Bestimme ihre Funktionsgleichung rechnerisch.</>, steps: () => S.line2P(Pt(4, 1.5, 'A'), Pt(-3, -2, 'B'), 'g₁') },
        { l: 'b', topic: 'punktprobe', text: <>Überprüfe mithilfe einer Rechnung, ob C(−13 | −44,5) auf {gl(4, 6.5, 'g₂')} liegt.</>, steps: () => S.probe(4, 6.5, Pt(-13, -44.5, 'C'), 'g₂') },
        { l: 'c', topic: 'nullstelle', text: <>Gegeben ist g₃: {fm('y = 2 − 0,5x')}. Berechne den Schnittpunkt N von g₃ mit der x-Achse.</>, steps: () => S.zero(-0.5, 2, 'N') },
        { l: 'd', topic: 'schnittpunkt', text: <>Die Gerade g₃: {fm('y = 2 − 0,5x')} schneidet {gl(4, 6.5, 'g₂')} im Punkt T. Ermittle rechnerisch die Koordinaten von T.</>, steps: () => S.intersect(Ln(4, 6.5, 'g₂'), Ln(-0.5, 2, 'g₃'), 'T'), fg: { range: LF_RANGE, lines: [Ln(4, 6.5, 'g₂'), Ln(-0.5, 2, 'g₃')], points: [Pt(-1, 2.5, 'T')] } },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne die Geraden {gl(0.5, -0.5, 'g₁')} und {gl(-0.5, 2, 'g₃')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(0.5, -0.5, 'g₁'), Ln(-0.5, 2, 'g₃')], LF_RANGE), fg: drawFg([Ln(0.5, -0.5, 'g₁'), Ln(-0.5, 2, 'g₃')], LF_RANGE) },
        { l: 'f', topic: 'steigung', text: <>Berechne den spitzen Winkel α, den {gl(0.5, -0.5, 'g₁')} mit der x-Achse einschließt.</>, steps: () => S.angle(0.5) }
    ]},
    { id: '2016-II', label: 'MSA 2016 II', nr: '1', parts: [
        { l: 'a', topic: 'gleichung', text: <>Die Gerade g₁ verläuft durch A(−2 | 6) und B(4 | 3). Bestimme ihre Funktionsgleichung rechnerisch.</>, steps: () => S.line2P(Pt(-2, 6, 'A'), Pt(4, 3, 'B'), 'g₁') },
        { l: 'b', topic: 'nullstelle', text: <>Berechne den Schnittpunkt N von {gl(1.5, 3, 'g₂')} mit der x-Achse.</>, steps: () => S.zero(1.5, 3, 'N') },
        { l: 'c', topic: 'parallel', text: <>Die Gerade g₃ steht senkrecht auf {gl(1.5, 3, 'g₂')} und verläuft durch den Ursprung. Ermittle ihre Funktionsgleichung rechnerisch.</>, steps: () => S.perpLine('senkrecht', 1.5, Pt(0, 0, 'O'), 'g₃', { rel: true }) },
        { l: 'd', topic: 'schnittpunkt', text: <>Die Gerade {gl(10, -14, 'g₄')} schneidet {gl(1.5, 3, 'g₂')} im Punkt T. Berechne die Koordinaten von T.</>, steps: () => S.intersect(Ln(10, -14, 'g₄'), Ln(1.5, 3, 'g₂'), 'T'), fg: { range: [-4, 6, -2, 9], lines: [Ln(10, -14, 'g₄'), Ln(1.5, 3, 'g₂')], points: [Pt(2, 6, 'T')] } },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne die Geraden {gl(1.5, 3, 'g₂')} und {fm('g₃: y = −2/3x')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(1.5, 3, 'g₂'), Ln(-2/3, 0, 'g₃')], LF_RANGE), fg: drawFg([Ln(1.5, 3, 'g₂'), Ln(-2/3, 0, 'g₃')], LF_RANGE) }
    ]},
    { id: '2014-I', label: 'MSA 2014 I', nr: '1', intro: <>Die Gerade g₁ wird durch die Gleichung {fm('−5y + 2x − 10 = 0')} beschrieben. Sie schneidet die x-Achse im Punkt C.</>, parts: [
        { l: 'a', topic: 'nullstelle', text: <>Ermittle die Koordinaten von C rechnerisch.</>, steps: () => [...S.normalStr('-5y+2x-10=0', 'g₁'), ...S.zero(0.4, -2, 'C')] },
        { l: 'b', topic: 'gleichung', text: <>Die Gerade g₂ verläuft durch A(−0,5 | 5) und B(3,5 | −3). Bestimme ihre Funktionsgleichung rechnerisch.</>, steps: () => S.line2P(Pt(-0.5, 5, 'A'), Pt(3.5, -3, 'B'), 'g₂') },
        { l: 'c', topic: 'schnittpunkt', text: <>Die Geraden {gl(0.4, -2, 'g₁')} und {gl(-2, 4, 'g₂')} schneiden sich im Punkt D. Berechne die Koordinaten von D.</>, steps: () => S.intersect(Ln(0.4, -2, 'g₁'), Ln(-2, 4, 'g₂'), 'D'), fg: { range: LF_RANGE, lines: [Ln(0.4, -2, 'g₁'), Ln(-2, 4, 'g₂')], points: [Pt(2.5, -1, 'D')] } },
        { l: 'd', topic: 'parallel', text: <>Die Gerade g₃ steht senkrecht auf {gl(-2, 4, 'g₂')} und verläuft durch E(−4 | 0). Ermittle ihre Funktionsgleichung rechnerisch.</>, steps: () => S.perpLine('senkrecht', -2, Pt(-4, 0, 'E'), 'g₃', { rel: true }) },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne die Geraden {gl(0.4, -2, 'g₁')}, {gl(-2, 4, 'g₂')} und {gl(0.5, 2, 'g₃')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(0.4, -2, 'g₁'), Ln(-2, 4, 'g₂'), Ln(0.5, 2, 'g₃')], LF_RANGE), fg: drawFg([Ln(0.4, -2, 'g₁'), Ln(-2, 4, 'g₂'), Ln(0.5, 2, 'g₃')], LF_RANGE) },
        { l: 'f', topic: 'steigung', text: <>Berechne den spitzen Winkel α, den {gl(-2, 4, 'g₂')} mit der x-Achse einschließt.</>, steps: () => S.angle(-2) }
    ]},
    { id: '2014-II', label: 'MSA 2014 II', nr: '1', parts: [
        { l: 'a', topic: 'gleichung', text: <>Die Gerade g₁ verläuft durch A(−4,5 | 6) und B(3 | 1). Ermittle rechnerisch ihre Funktionsgleichung.</>, steps: () => S.line2P(Pt(-4.5, 6, 'A'), Pt(3, 1, 'B'), 'g₁') },
        { l: 'b', topic: 'schnittpunkt', text: <>Die Gerade {gl(0, 2, 'g₂')} schneidet {fm('g₁: y = −2/3x + 3')} im Punkt T. Berechne die Koordinaten von T.</>, steps: () => S.intersect(Ln(-2/3, 3, 'g₁'), Ln(0, 2, 'g₂'), 'T'), fg: { range: LF_RANGE, lines: [Ln(-2/3, 3, 'g₁'), Ln(0, 2, 'g₂')], points: [Pt(1.5, 2, 'T')] } },
        { l: 'c', topic: 'nullstelle', text: <>Berechne den Schnittpunkt N von {fm('g₁: y = −2/3x + 3')} mit der x-Achse.</>, steps: () => S.zero(-2/3, 3, 'N') },
        { l: 'd', topic: 'punktprobe', text: <>Überprüfe durch Rechnung, ob P(−1,5 | 4) auf {fm('g₁: y = −2/3x + 3')} liegt.</>, steps: () => S.probe(-2/3, 3, Pt(-1.5, 4, 'P'), 'g₁') },
        { l: 'e', topic: 'parallel', text: <>Die Gerade g₃ steht senkrecht auf {fm('g₁: y = −2/3x + 3')} und geht durch Q(2 | 4). Ermittle rechnerisch ihre Funktionsgleichung.</>, steps: () => S.perpLine('senkrecht', -2/3, Pt(2, 4, 'Q'), 'g₃', { rel: true }) },
        { l: 'f', topic: 'zeichnen', text: <>Zeichne {fm('g₁: y = −2/3x + 3')}, {gl(0, 2, 'g₂')} und {gl(1.5, 1, 'g₃')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(-2/3, 3, 'g₁'), Ln(0, 2, 'g₂'), Ln(1.5, 1, 'g₃')], LF_RANGE), fg: drawFg([Ln(-2/3, 3, 'g₁'), Ln(0, 2, 'g₂'), Ln(1.5, 1, 'g₃')], LF_RANGE) }
    ]},
    { id: '2013-I', label: 'MSA 2013 I', nr: '1', parts: [
        { l: 'a', topic: 'gleichung', text: <>Die Gerade g₁ verläuft durch A(1,5 | 3) und B(−2 | 10). Ermittle rechnerisch ihre Funktionsgleichung.</>, steps: () => S.line2P(Pt(1.5, 3, 'A'), Pt(-2, 10, 'B'), 'g₁') },
        { l: 'b', topic: 'parallel', text: <>Die Gerade g₂ schneidet {gl(-2, 6, 'g₁')} senkrecht im Punkt A(1,5 | 3). Bestimme die Funktionsgleichung von g₂ rechnerisch.</>, steps: () => S.perpLine('senkrecht', -2, Pt(1.5, 3, 'A'), 'g₂', { rel: true }) },
        { l: 'c', topic: 'nullstelle', text: <>Berechne den Schnittpunkt N von {gl(-2, 6, 'g₁')} mit der x-Achse.</>, steps: () => S.zero(-2, 6, 'N') },
        { l: 'd', topic: 'schnittpunkt', text: <>Die Gerade g₃: {fm('3 = −x − y')} schneidet {gl(-2, 6, 'g₁')} im Punkt Q. Berechne die Koordinaten von Q.</>, steps: () => [...S.normalStr('3=-x-y', 'g₃'), ...S.intersect(Ln(-2, 6, 'g₁'), Ln(-1, -3, 'g₃'), 'Q')], fg: { range: [-12, 12, -12, 12], lines: [Ln(-2, 6, 'g₁'), Ln(-1, -3, 'g₃')], points: [Pt(9, -12, 'Q')] } },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne {gl(-2, 6, 'g₁')}, {gl(0.5, 2.25, 'g₂')} und {gl(-1, -3, 'g₃')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(-2, 6, 'g₁'), Ln(0.5, 2.25, 'g₂'), Ln(-1, -3, 'g₃')], LF_RANGE), fg: drawFg([Ln(-2, 6, 'g₁'), Ln(0.5, 2.25, 'g₂'), Ln(-1, -3, 'g₃')], LF_RANGE) },
        { l: 'f', topic: 'steigung', text: <>Berechne den spitzen Winkel γ, in dem {gl(-2, 6, 'g₁')} die x-Achse schneidet.</>, steps: () => S.angle(-2) }
    ]},
    { id: '2013-II', label: 'MSA 2013 II', nr: '1', parts: [
        { l: 'a', topic: 'gleichung', text: <>Die Gerade g₁ verläuft durch A(2 | 1) und B(4 | 0,5). Ermittle rechnerisch ihre Funktionsgleichung.</>, steps: () => S.line2P(Pt(2, 1, 'A'), Pt(4, 0.5, 'B'), 'g₁') },
        { l: 'b', topic: 'parallel', text: <>Die Gerade g₂ steht senkrecht auf {gl(-0.25, 1.5, 'g₁')} und verläuft durch C(−1,5 | 4). Bestimme ihre Funktionsgleichung rechnerisch.</>, steps: () => S.perpLine('senkrecht', -0.25, Pt(-1.5, 4, 'C'), 'g₂', { rel: true }) },
        { l: 'c', topic: 'schnittpunkt', text: <>Berechne den Schnittpunkt Q von {gl(-0.25, 1.5, 'g₁')} und {gl(4, 10, 'g₂')}.</>, steps: () => S.intersect(Ln(-0.25, 1.5, 'g₁'), Ln(4, 10, 'g₂'), 'Q'), fg: { range: LF_RANGE, lines: [Ln(-0.25, 1.5, 'g₁'), Ln(4, 10, 'g₂')], points: [Pt(-2, 2, 'Q')] } },
        { l: 'd', topic: 'nullstelle', text: <>Berechne den Schnittpunkt N von {gl(4, 10, 'g₂')} mit der x-Achse.</>, steps: () => S.zero(4, 10, 'N') },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne {gl(-0.25, 1.5, 'g₁')} und {gl(4, 10, 'g₂')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(-0.25, 1.5, 'g₁'), Ln(4, 10, 'g₂')], LF_RANGE), fg: drawFg([Ln(-0.25, 1.5, 'g₁'), Ln(4, 10, 'g₂')], LF_RANGE) }
    ]},
    { id: '2012-I', label: 'MSA 2012 I', nr: '1', intro: <>Die Punkte B(3 | 0) und D(5 | −1) liegen auf der Geraden g₁. Die Gerade g₂ ist durch {fm('2,5y = 3,75x − 6,25')} bestimmt.</>, parts: [
        { l: 'a', topic: 'gleichung', text: <>Ermittle rechnerisch die Funktionsgleichung von g₁.</>, steps: () => S.line2P(Pt(3, 0, 'B'), Pt(5, -1, 'D'), 'g₁') },
        { l: 'b', topic: 'schnittpunkt', text: <>Berechne den Schnittpunkt E von {gl(-0.5, 1.5, 'g₁')} mit g₂.</>, steps: () => [...S.normalStr('2.5y=3.75x-6.25', 'g₂'), ...S.intersect(Ln(-0.5, 1.5, 'g₁'), Ln(1.5, -2.5, 'g₂'), 'E')], fg: { range: LF_RANGE, lines: [Ln(-0.5, 1.5, 'g₁'), Ln(1.5, -2.5, 'g₂')], points: [Pt(2, 0.5, 'E')] } },
        { l: 'c', topic: 'parallel', text: <>Die Gerade g₃ steht senkrecht auf {gl(-0.5, 1.5, 'g₁')} und verläuft durch C(1 | 1). Ermittle ihre Funktionsgleichung.</>, steps: () => S.perpLine('senkrecht', -0.5, Pt(1, 1, 'C'), 'g₃', { rel: true }) },
        { l: 'd', topic: 'nullstelle', text: <>Die Gerade {gl(2, -1, 'g₃')} schneidet die x-Achse im Punkt A. Ermittle die Koordinaten von A.</>, steps: () => S.zero(2, -1, 'A') },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne {gl(-0.5, 1.5, 'g₁')}, {gl(1.5, -2.5, 'g₂')} und {gl(2, -1, 'g₃')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(-0.5, 1.5, 'g₁'), Ln(1.5, -2.5, 'g₂'), Ln(2, -1, 'g₃')], LF_RANGE), fg: drawFg([Ln(-0.5, 1.5, 'g₁'), Ln(1.5, -2.5, 'g₂'), Ln(2, -1, 'g₃')], LF_RANGE) }
    ]},
    { id: '2012-II', label: 'MSA 2012 II', nr: '1', parts: [
        { l: 'a', topic: 'gleichung', text: <>Die Gerade g₁ verläuft durch A(−1 | 7,5) und B(5 | −1,5). Ermittle rechnerisch ihre Funktionsgleichung.</>, steps: () => S.line2P(Pt(-1, 7.5, 'A'), Pt(5, -1.5, 'B'), 'g₁') },
        { l: 'b', topic: 'nullstelle', text: <>Berechne die Nullstelle N von {gl(-1.5, 6, 'g₁')}.</>, steps: () => S.zero(-1.5, 6, 'N') },
        { l: 'c', topic: 'parallel', text: <>Die Gerade g₂ verläuft durch C(4,5 | 2,5) und steht senkrecht auf {gl(-1.5, 6, 'g₁')}. Bestimme ihre Funktionsgleichung rechnerisch.</>, steps: () => S.perpLine('senkrecht', -1.5, Pt(4.5, 2.5, 'C'), 'g₂', { rel: true }) },
        { l: 'd', topic: 'schnittpunkt', text: <>Berechne den Schnittpunkt P von {gl(-1.5, 6, 'g₁')} und {fm('g₂: y = ⅔x − 0,5')}.</>, steps: () => S.intersect(Ln(-1.5, 6, 'g₁'), Ln(2/3, -0.5, 'g₂'), 'P'), fg: { range: LF_RANGE, lines: [Ln(-1.5, 6, 'g₁'), Ln(2/3, -0.5, 'g₂')], points: [Pt(3, 1.5, 'P')] } },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne {gl(-1.5, 6, 'g₁')} und {fm('g₂: y = ⅔x − 0,5')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(-1.5, 6, 'g₁'), Ln(2/3, -0.5, 'g₂')], LF_RANGE), fg: drawFg([Ln(-1.5, 6, 'g₁'), Ln(2/3, -0.5, 'g₂')], LF_RANGE) }
    ]},
    { id: '2011-I', label: 'MSA 2011 I', nr: '1', intro: <>Gegeben sind die Punkte A(5 | −1), B(−5 | 7), C(2 | 0) und D(20 | 24) sowie die Gerade g₂: {fm('4y + 3x + 8 = 0')}.</>, parts: [
        { l: 'a', topic: 'gleichung', text: <>Ermittle rechnerisch die Funktionsgleichung der Geraden g₁ durch A und B.</>, steps: () => S.line2P(Pt(5, -1, 'A'), Pt(-5, 7, 'B'), 'g₁') },
        { l: 'b', topic: 'nullstelle', text: <>Berechne den Schnittpunkt N von {gl(-0.8, 3, 'g₁')} mit der x-Achse.</>, steps: () => S.zero(-0.8, 3, 'N') },
        { l: 'c', topic: 'parallel', text: <>Überprüfe rechnerisch, ob {gl(-0.8, 3, 'g₁')} und g₂ parallel verlaufen.</>, steps: () => [...S.normalStr('4y+3x+8=0', 'g₂'), S.lage(Ln(-0.8, 3, 'g₁'), Ln(-0.75, -2, 'g₂'))] },
        { l: 'd', topic: 'parallel', text: <>Die Gerade g₃ steht senkrecht auf {gl(-0.8, 3, 'g₁')} und verläuft durch C. Ermittle ihre Funktionsgleichung.</>, steps: () => S.perpLine('senkrecht', -0.8, Pt(2, 0, 'C'), 'g₃', { rel: true }) },
        { l: 'e', topic: 'punktprobe', text: <>Überprüfe durch Rechnung, ob D auf {gl(1.25, -2.5, 'g₃')} liegt.</>, steps: () => S.probe(1.25, -2.5, Pt(20, 24, 'D'), 'g₃') },
        { l: 'f', topic: 'zeichnen', text: <>Zeichne {gl(-0.8, 3, 'g₁')}, {gl(-0.75, -2, 'g₂')} und {gl(1.25, -2.5, 'g₃')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(-0.8, 3, 'g₁'), Ln(-0.75, -2, 'g₂'), Ln(1.25, -2.5, 'g₃')], LF_RANGE), fg: drawFg([Ln(-0.8, 3, 'g₁'), Ln(-0.75, -2, 'g₂'), Ln(1.25, -2.5, 'g₃')], LF_RANGE) }
    ]},
    { id: '2011-II', label: 'MSA 2011 II', nr: '1', intro: <>Gegeben ist die Gerade {gl(2, -3, 'g₁')}.</>, parts: [
        { l: 'b', topic: 'nullstelle', text: <>Berechne den Schnittpunkt N von g₁ mit der x-Achse.</>, steps: () => S.zero(2, -3, 'N') },
        { l: 'c', topic: 'parallel', text: <>Die Gerade g₂ steht senkrecht auf g₁ und schneidet die x-Achse im Punkt Q(8 | 0). Bestimme ihre Funktionsgleichung.</>, steps: () => S.perpLine('senkrecht', 2, Pt(8, 0, 'Q'), 'g₂', { rel: true }) },
        { l: 'd', topic: 'punktprobe', text: <>Überprüfe rechnerisch, ob A(1 | 3,5) auf {gl(-0.5, 4, 'g₂')} liegt.</>, steps: () => S.probe(-0.5, 4, Pt(1, 3.5, 'A'), 'g₂') },
        { l: 'e', topic: 'schnittpunkt', text: <>Berechne den Schnittpunkt P₃ von g₁ und {gl(-0.5, 4, 'g₂')}.</>, steps: () => S.intersect(Ln(2, -3, 'g₁'), Ln(-0.5, 4, 'g₂'), 'P₃'), fg: { range: LF_RANGE, lines: [Ln(2, -3, 'g₁'), Ln(-0.5, 4, 'g₂')], points: [Pt(2.8, 2.6, 'P₃')] } },
        { l: 'f', topic: 'zeichnen', text: <>Zeichne {gl(2, -3, 'g₁')} und {gl(-0.5, 4, 'g₂')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(2, -3, 'g₁'), Ln(-0.5, 4, 'g₂')], [-2, 9, -5, 6]), fg: drawFg([Ln(2, -3, 'g₁'), Ln(-0.5, 4, 'g₂')], [-2, 9, -5, 6]) }
    ]},
    { id: '2010-I', label: 'MSA 2010 I', nr: '4', parts: [
        { l: 'a', topic: 'punktprobe', text: <>Überprüfe rechnerisch, ob die Punkte A(4 | 6,5), B(−4 | 0,5) und C(6 | 8) auf einer Geraden liegen.</>, steps: () => [...S.line2P(Pt(4, 6.5, 'A'), Pt(-4, 0.5, 'B'), 'g'), ...S.probe(0.75, 3.5, Pt(6, 8, 'C'), 'g')] },
        { l: 'b', topic: 'schnittpunkt', text: <>Die Geraden g₁: {fm('3x + 15y − 81 = 0')} und {gl(0.75, 3.5, 'g₂')} schneiden sich im Punkt D. Berechne die Koordinaten von D.</>, steps: () => [...S.normalStr('3x+15y-81=0', 'g₁'), ...S.intersect(Ln(-0.2, 5.4, 'g₁'), Ln(0.75, 3.5, 'g₂'), 'D')], fg: { range: LF_RANGE, lines: [Ln(-0.2, 5.4, 'g₁'), Ln(0.75, 3.5, 'g₂')], points: [Pt(2, 5, 'D')] } },
        { l: 'c', topic: 'parallel', text: <>Die Gerade g₃ verläuft durch E(3 | 1) und steht senkrecht auf {gl(0.75, 3.5, 'g₂')}. Ermittle ihre Funktionsgleichung rechnerisch.</>, steps: () => S.perpLine('senkrecht', 0.75, Pt(3, 1, 'E'), 'g₃', { rel: true }) },
        { l: 'd', topic: 'zeichnen', text: <>Zeichne {gl(-0.2, 5.4, 'g₁')}, {gl(0.75, 3.5, 'g₂')} und {fm('g₃: y = −4/3x + 5')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(-0.2, 5.4, 'g₁'), Ln(0.75, 3.5, 'g₂'), Ln(-4/3, 5, 'g₃')], [-6, 8, -4, 8]), fg: drawFg([Ln(-0.2, 5.4, 'g₁'), Ln(0.75, 3.5, 'g₂'), Ln(-4/3, 5, 'g₃')], [-6, 8, -4, 8]) }
    ]},
    { id: '2010-II', label: 'MSA 2010 II', nr: '5', intro: <>Die Punkte A(0 | 4) und B(5 | 0) bestimmen die Gerade g₁.</>, parts: [
        { l: 'a', topic: 'gleichung', text: <>Ermittle rechnerisch die Funktionsgleichung von g₁.</>, steps: () => S.line2P(Pt(0, 4, 'A'), Pt(5, 0, 'B'), 'g₁') },
        { l: 'b', topic: 'parallel', text: <>Die Gerade g₂ steht senkrecht auf {gl(-0.8, 4, 'g₁')} und verläuft durch C(2 | −1,5). Bestimme ihre Funktionsgleichung.</>, steps: () => S.perpLine('senkrecht', -0.8, Pt(2, -1.5, 'C'), 'g₂', { rel: true }) },
        { l: 'c', topic: 'zeichnen', text: <>Zeichne {gl(-0.8, 4, 'g₁')} und {gl(1.25, -4, 'g₂')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(-0.8, 4, 'g₁'), Ln(1.25, -4, 'g₂')], LF_RANGE), fg: drawFg([Ln(-0.8, 4, 'g₁'), Ln(1.25, -4, 'g₂')], LF_RANGE) }
    ]},
    { id: 'Muster-I', label: 'MSA Musterprüfung I', nr: '3', parts: [
        { l: 'a', topic: 'gleichung', text: <>Bestimme rechnerisch die Funktionsgleichung der Geraden g₁ durch P(−1 | 5) und Q(2 | −4).</>, steps: () => S.line2P(Pt(-1, 5, 'P'), Pt(2, -4, 'Q'), 'g₁') },
        { l: 'b', topic: 'parallel', text: <>Die Gerade g₂ hat keinen Punkt mit g₃: {fm('2y = −x + 10')} gemeinsam. Gib eine mögliche Funktionsgleichung von g₂ in Normalform an.</>, steps: () => [...S.normalStr('2y=-x+10', 'g₃'), S.select('Welche Gerade kann g₂ sein?', [fm('y = −0,5x + 1'), fm('y = 2x + 5'), fm('y = −0,5x + 5'), fm('y = 0,5x + 1')], 0, 'Keine gemeinsamen Punkte: gleiche Steigung (m = −0,5), aber anderes t. y = −0,5x + 5 wäre g₃ selbst.', 'z. B. y = −0,5x + 1')] },
        { l: 'c', topic: 'nullstelle', text: <>Berechne den Schnittpunkt N von {gl(-0.5, 5, 'g₃')} mit der x-Achse.</>, steps: () => S.zero(-0.5, 5, 'N') },
        { l: 'd', topic: 'schnittpunkt', text: <>Zeige, dass S(3 | 3,5) der Schnittpunkt von {gl(-0.5, 5, 'g₃')} und {gl(2.5, -4, 'g₄')} ist.</>, steps: () => S.intersect(Ln(-0.5, 5, 'g₃'), Ln(2.5, -4, 'g₄'), 'S'), fg: { range: LF_RANGE, lines: [Ln(-0.5, 5, 'g₃'), Ln(2.5, -4, 'g₄')], points: [Pt(3, 3.5, 'S')] } },
        { l: 'e', topic: 'zeichnen', text: <>Zeichne {gl(-3, 2, 'g₁')} und {gl(2.5, -4, 'g₄')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(-3, 2, 'g₁'), Ln(2.5, -4, 'g₄')], LF_RANGE), fg: drawFg([Ln(-3, 2, 'g₁'), Ln(2.5, -4, 'g₄')], LF_RANGE) }
    ]},
    { id: 'Muster-II', label: 'MSA Musterprüfung II', nr: '3', intro: <>Gegeben ist die Gerade {gl(-2, 4, 'g₁')}.</>, parts: [
        { l: 'a', topic: 'ablesen', text: <>Welche Aussagen sind richtig? (1) g₁ verläuft durch den Nullpunkt. (2) g₁ schneidet die x-Achse in (2 | 0). (3) g₁ verläuft nicht im 3. Quadranten. (4) g₁ schneidet die y-Achse in (0 | −4).</>, steps: () => [S.select('Welche Aussagen sind richtig?', [<span>(2) und (3)</span>, <span>(1) und (2)</span>, <span>(2) und (4)</span>, <span>(3) und (4)</span>], 0, 'Prüfe jede Aussage: t = 4 → Schnitt mit der y-Achse bei (0 | 4). Nullstelle: 0 = −2x + 4 → x = 2. Mit m < 0 und t > 0 verläuft die Gerade durch den 2., 1. und 4. Quadranten.', '(2) und (3)', true)] },
        { l: 'b', topic: 'punktprobe', text: <>Überprüfe rechnerisch, ob B(86 | −168) auf g₁ liegt.</>, steps: () => S.probe(-2, 4, Pt(86, -168, 'B'), 'g₁') },
        { l: 'd', topic: 'parallel', text: <>Begründe, dass g₃: {fm('0 = 3y + 6x − 12')} mindestens zwei gemeinsame Punkte mit g₁ hat.</>, steps: () => [...S.normalStr('0=3y+6x-12', 'g₃'), S.lage(Ln(-2, 4, 'g₁'), Ln(-2, 4, 'g₃'))] },
        { l: 'e', topic: 'parallel', text: <>Die Gerade g₄: {fm('y = 1 + 0,5x')} schneidet g₁. Zeige rechnerisch, dass g₁ senkrecht auf g₄ steht.</>, steps: () => S.checkPerp(-2, 0.5, 'g₁', 'g₄') },
        { l: 'f', topic: 'nullstelle', text: <>Berechne den Schnittpunkt N von {gl(-0.5, 3, 'g₅')} mit der x-Achse.</>, steps: () => S.zero(-0.5, 3, 'N') },
        { l: 'g', topic: 'zeichnen', text: <>Zeichne {gl(-2, 4, 'g₁')} und {gl(0.5, 1, 'g₄')} in ein Koordinatensystem.</>, steps: () => S.drawLines([Ln(-2, 4, 'g₁'), Ln(0.5, 1, 'g₄')], LF_RANGE), fg: drawFg([Ln(-2, 4, 'g₁'), Ln(0.5, 1, 'g₄')], LF_RANGE) }
    ]},
    // ---- Lineare Gleichungssysteme (Querverweise aus „Sonstiges“) ----
    { id: 'LGS-2010-I', label: 'MSA 2010 I', nr: '3', lgs: true, parts: [
        { l: '', topic: 'sachaufgaben', text: <>Bei einer Probearbeit mit 24 Schülerinnen und Schülern ergab sich der Notendurchschnitt 3,75. Notenverteilung: Note 1: 1, Note 2: <V>x</V>, Note 3: 6, Note 4: 7, Note 5: <V>y</V>, Note 6: 2. Welche zwei Gleichungen bilden ein passendes Gleichungssystem? (a) 2x + 5y = 24 · 3,75 (b) 2x + 5y = 30 (c) 2x − 5y = 90 (d) 2x + 5y + 59 = 24 · 3,75 (e) x + y = 8 (f) 24 + x + y = 16</>, steps: () => [S.select('Welche Gleichungen passen?', [<span>(d) und (e)</span>, <span>(a) und (e)</span>, <span>(b) und (e)</span>, <span>(a) und (f)</span>], 0, 'Anzahl: 1 + x + 6 + 7 + y + 2 = 24 → x + y = 8. Notensumme: 1·1 + 2x + 3·6 + 4·7 + 5y + 6·2 = 24 · 3,75 → 2x + 5y + 59 = 90.', '(d) und (e)', true)] }
    ]},
    { id: 'LGS-2010-II', label: 'MSA 2010 II', nr: '8', lgs: true, parts: [
        { l: '', topic: 'sachaufgaben', text: <>Eine echte Münze wiegt 8 g, eine falsche nur 7 g. Ein Kassier nimmt 115 Münzen entgegen, die zusammen 892 g wiegen. Berechne die Anzahl der echten (x) und falschen (y) Münzen.</>, steps: () => [
            { type: 'fill', goal: 'Stelle das Gleichungssystem auf.', inputs: [{ id: 'n', correct: 115 }, { id: 'a', correct: 8 }, { id: 'b', correct: 7 }, { id: 'g', correct: 892 }], render: (h) => <LfZeile><span className="flex flex-col gap-2 items-start"><span>(I) <V>x</V> + <V>y</V> = {h.input('n')}</span><span>(II) {h.input('a', 'w-14')}<V>x</V> + {h.input('b', 'w-14')}<V>y</V> = {h.input('g')}</span></span></LfZeile>, summary: () => '(I) x + y = 115; (II) 8x + 7y = 892', hint: '(I) zählt die Münzen, (II) das Gewicht in Gramm.', solution: '(I) x + y = 115; (II) 8x + 7y = 892' },
            S.calc('Berechne die Anzahl x der echten Münzen.', <V>x</V>, 87, 'Einsetzungsverfahren: y = 115 − x in (II): 8x + 7(115 − x) = 892.', 'x = 87', 'Stück'),
            S.calc('Berechne die Anzahl y der falschen Münzen.', <V>y</V>, 28, 'y = 115 − x', 'y = 28', 'Stück')
        ] }
    ]},
    { id: 'LGS-2011-I', label: 'MSA 2011 I', nr: '2', lgs: true, parts: [
        { l: '', topic: 'sachaufgaben', text: <>Eine Firma bezieht 46 T-Shirts und 23 Poloshirts für insgesamt 1 311 €. Beim Verkauf erzielt sie je T-Shirt 40 % und je Poloshirt 25 % Gewinn, insgesamt 445,05 €. Berechne die Einkaufspreise eines T-Shirts (t) und eines Poloshirts (p).</>, steps: () => [
            { type: 'fill', goal: 'Stelle die Gleichung für den Einkaufspreis auf.', inputs: [{ id: 'a', correct: 46 }, { id: 'b', correct: 23 }, { id: 'c', correct: 1311 }], render: (h) => <LfZeile>(I) {h.input('a', 'w-16')}<V>t</V> + {h.input('b', 'w-16')}<V>p</V> = {h.input('c')}</LfZeile>, hint: 'Anzahl · Preis für beide Sorten zusammen ergibt den Gesamtpreis.', solution: '46t + 23p = 1311' },
            { type: 'fill', goal: 'Stelle die Gleichung für den Gewinn auf.', inputs: [{ id: 'a', correct: 18.4 }, { id: 'b', correct: 5.75 }, { id: 'c', correct: 445.05 }], render: (h) => <LfZeile>(II) {h.input('a', 'w-16')}<V>t</V> + {h.input('b', 'w-16')}<V>p</V> = {h.input('c')}</LfZeile>, hint: '40 % von 46t sind 0,4 · 46t = 18,4t. 25 % von 23p sind 0,25 · 23p.', solution: '18,4t + 5,75p = 445,05' },
            S.calc('Berechne den Einkaufspreis t eines T-Shirts.', <V>t</V>, 17, 'Aus (I): p = 57 − 2t. In (II) einsetzen: 18,4t + 5,75(57 − 2t) = 445,05.', 't = 17 €', '€', 0.011),
            S.calc('Berechne den Einkaufspreis p eines Poloshirts.', <V>p</V>, 23, 'p = 57 − 2t', 'p = 23 €', '€', 0.011)
        ] }
    ]},
    { id: 'LGS-2012-I', label: 'MSA 2012 I', nr: '4', lgs: true, parts: [
        { l: '', topic: 'schnittpunkt', text: <>Löse das Gleichungssystem rechnerisch: (I) 3x = 12 &nbsp; (II) 2x + 2y + z = 25 &nbsp; (III) 5x − 4y + 2z = −2</>, steps: () => [
            S.calc('Löse Gleichung (I) nach x auf.', <V>x</V>, 4, '3x = 12 | : 3', 'x = 4'),
            S.calc('Setze x = 4 in (II) und (III) ein und berechne y.', <V>y</V>, 7, '(II): 2y + z = 17, (III): −4y + 2z = −22 → −2y + z = −11. Subtrahiere: 4y = 28.', 'y = 7'),
            S.calc('Berechne z.', <V>z</V>, 3, 'z = 17 − 2y', 'z = 3')
        ] }
    ]},
    { id: 'LGS-2012-II', label: 'MSA 2012 II', nr: '6', lgs: true, parts: [
        { l: '', topic: 'sachaufgaben', text: <>Ein Wohnmobil kostet eine Grundgebühr g pro Tag und einen Betrag k pro Kilometer. Herr Huber zahlt für 6 Tage und 1 380 km 970,80 €. Herr Kern erhält 30 % Nachlass auf die Grundgebühr und zahlt für 9 Tage und 1 825 km 1 154,70 €. Berechne g und k.</>, steps: () => [
            { type: 'fill', goal: 'Stelle Gleichung (I) für Herrn Huber auf.', inputs: [{ id: 'a', correct: 6 }, { id: 'b', correct: 1380 }, { id: 'c', correct: 970.8 }], render: (h) => <LfZeile>(I) {h.input('a', 'w-16')}<V>g</V> + {h.input('b')}<V>k</V> = {h.input('c')}</LfZeile>, hint: 'Tage · Grundgebühr + Kilometer · Kilometerpreis = Gesamtpreis', solution: '6g + 1380k = 970,80' },
            { type: 'fill', goal: 'Stelle Gleichung (II) für Herrn Kern auf.', inputs: [{ id: 'a', correct: 6.3 }, { id: 'b', correct: 1825 }, { id: 'c', correct: 1154.7 }], render: (h) => <LfZeile>(II) {h.input('a', 'w-16')}<V>g</V> + {h.input('b')}<V>k</V> = {h.input('c')}</LfZeile>, hint: '30 % Nachlass: Er zahlt nur 70 % der Grundgebühr, also 9 · 0,7g = 6,3g.', solution: '6,3g + 1825k = 1154,70' },
            S.calc('Berechne den Kilometerpreis k.', <V>k</V>, 0.36, 'Aus (I): g = 161,8 − 230k. In (II): 6,3(161,8 − 230k) + 1825k = 1154,7.', 'k = 0,36 €', '€', 0.006),
            S.calc('Berechne die Grundgebühr g pro Tag.', <V>g</V>, 79, 'g = 161,8 − 230 · 0,36', 'g = 79 €', '€', 0.011)
        ] }
    ]},
    { id: 'LGS-2013-I', label: 'MSA 2013 I', nr: '3', lgs: true, parts: [
        { l: '', topic: 'sachaufgaben', text: <>Eine Mischung aus 29,4 kg Roggen- und 12,6 kg Weizenmehl kostet 43,89 €. Je ein Kilogramm Roggen- und Weizenmehl kosten zusammen 1,75 €. Berechne die Kilopreise r (Roggen) und w (Weizen).</>, steps: () => [
            { type: 'fill', goal: 'Stelle das Gleichungssystem auf.', inputs: [{ id: 's', correct: 1.75 }, { id: 'a', correct: 29.4 }, { id: 'b', correct: 12.6 }, { id: 'g', correct: 43.89 }], render: (h) => <LfZeile><span className="flex flex-col gap-2 items-start"><span>(I) <V>r</V> + <V>w</V> = {h.input('s')}</span><span>(II) {h.input('a', 'w-16')}<V>r</V> + {h.input('b', 'w-16')}<V>w</V> = {h.input('g')}</span></span></LfZeile>, summary: () => '(I) r + w = 1,75; (II) 29,4r + 12,6w = 43,89', hint: '(I): Preis für je 1 kg. (II): Menge · Kilopreis ergibt den Gesamtpreis.', solution: '(I) r + w = 1,75; (II) 29,4r + 12,6w = 43,89' },
            S.calc('Berechne den Kilopreis r für Roggenmehl.', <V>r</V>, 1.3, 'w = 1,75 − r in (II): 29,4r + 12,6(1,75 − r) = 43,89.', 'r = 1,30 €', '€', 0.006),
            S.calc('Berechne den Kilopreis w für Weizenmehl.', <V>w</V>, 0.45, 'w = 1,75 − r', 'w = 0,45 €', '€', 0.006)
        ] }
    ]},
    { id: 'LGS-2013-II', label: 'MSA 2013 II', nr: '8', lgs: true, parts: [
        { l: '', topic: 'sachaufgaben', text: <>Eine Klasse bestellt 33 Teile: doppelt so viele Pizzasemmeln wie Butterbrezen, einige Nussecken und acht Käsesemmeln. Alles kostet 38,70 €. Preise: Pizzasemmel 1,20 €, Butterbreze 0,95 €, Käsesemmel 1,10 €, Nussecke 1,40 €. Wie viele Butterbrezen (b), Pizzasemmeln und Nussecken (n) wurden gekauft?</>, steps: () => [
            { type: 'fill', goal: 'Stelle die Gleichung für die Anzahl auf.', inputs: [{ id: 'a', correct: 3 }, { id: 'c', correct: 25 }], render: (h) => <LfZeile>(I) {h.input('a', 'w-16')}<V>b</V> + <V>n</V> = {h.input('c')}</LfZeile>, hint: 'Pizzasemmeln = 2b. Also 2b + b + n + 8 = 33.', solution: '3b + n = 25' },
            { type: 'fill', goal: 'Stelle die Gleichung für den Preis auf.', inputs: [{ id: 'a', correct: 3.35 }, { id: 'b', correct: 1.4 }, { id: 'c', correct: 29.9 }], render: (h) => <LfZeile>(II) {h.input('a', 'w-16')}<V>b</V> + {h.input('b', 'w-16')}<V>n</V> = {h.input('c')}</LfZeile>, hint: '1,20 · 2b + 0,95b + 1,40n + 1,10 · 8 = 38,70. Fasse zusammen.', solution: '3,35b + 1,4n = 29,9' },
            S.calc('Berechne die Anzahl b der Butterbrezen.', <V>b</V>, 6, 'n = 25 − 3b in (II): 3,35b + 1,4(25 − 3b) = 29,9.', 'b = 6', 'Stück'),
            { type: 'fill', goal: 'Gib die Anzahl der Pizzasemmeln und Nussecken an.', inputs: [{ id: 'p', correct: 12 }, { id: 'n', correct: 7 }], render: (h) => <LfZeile>Pizzasemmeln: {h.input('p', 'w-16')} <span className="mx-3">Nussecken:</span> {h.input('n', 'w-16')}</LfZeile>, hint: 'Pizzasemmeln = 2b, Nussecken n = 25 − 3b.', solution: '12 Pizzasemmeln, 7 Nussecken' }
        ] }
    ]},
    { id: 'LGS-2018-I', label: 'MSA 2018 I', nr: '10', lgs: true, parts: [
        { l: 'a', topic: 'sachaufgaben', text: <>Lena und Patrick gehen mit ihren Eltern ins Theater und zahlen zusammen 64 €. Herr Stur zahlt mit seinen drei Kindern 60 €. Welches Gleichungssystem beschreibt den Sachverhalt (x: Preis Erwachsener, y: Preis Kind)?</>, steps: () => [S.select('Welches Gleichungssystem ist richtig?', [<span>(I) x + y = 32; (II) x + 3y = 60</span>, <span>(I) 2x + 2y = 64; (II) 3x + y = 64</span>, <span>(I) 2x + 2y = 4; (II) 3x + y = 4</span>, <span>(I) x + y = 32; (II) x + 3y = 30</span>], 0, 'Familie: 2 Erwachsene + 2 Kinder = 64 → x + y = 32. Herr Stur: 1 Erwachsener + 3 Kinder = 60.', '(I) x + y = 32; (II) x + 3y = 60')] },
        { l: 'b', topic: 'sachaufgaben', text: <>Ermittle mit (I) x + y = 32 und (II) x + 3y = 60 rechnerisch die Eintrittspreise.</>, steps: () => [
            S.calc('Berechne den Preis y für ein Kind.', <V>y</V>, 14, 'Subtrahiere (I) von (II): 2y = 28.', 'y = 14 €', '€'),
            S.calc('Berechne den Preis x für einen Erwachsenen.', <V>x</V>, 18, 'x = 32 − y', 'x = 18 €', '€')
        ] }
    ]}
];

// ==========================================
// 6. THEMEN (Kacheln)
// ==========================================
const LF_TOPICS = [
    { id: 'wertetabelle', nr: 1, title: 'Wertetabelle', desc: 'y-Werte berechnen, fehlende x-Werte finden und aus einer Tabelle die Gleichung bestimmen.' },
    { id: 'ablesen', nr: 2, title: 'Steigung & y-Achsenabschnitt', desc: 'm und t am Graphen ablesen und Gleichungen in die Normalform y = mx + t bringen.' },
    { id: 'zeichnen', nr: 3, title: 'Graph zeichnen', desc: 'Geraden mit y-Achsenabschnitt und Steigungsdreieck ins Koordinatensystem zeichnen.' },
    { id: 'nullstelle', nr: 4, title: 'Nullstelle & Achsenschnittpunkte', desc: 'Schnittpunkte mit der x-Achse und der y-Achse berechnen.' },
    { id: 'steigung', nr: 5, title: 'Steigung aus zwei Punkten', desc: 'm = (y₂ − y₁) : (x₂ − x₁) — und den Steigungswinkel α berechnen.' },
    { id: 'gleichung', nr: 6, title: 'Geradengleichung aufstellen', desc: 'Die Gleichung aus Punkt und Steigung oder aus zwei Punkten bestimmen.' },
    { id: 'punktprobe', nr: 7, title: 'Punktprobe', desc: 'Liegt der Punkt auf der Geraden? Fehlende Koordinaten und Steigungen berechnen.' },
    { id: 'parallel', nr: 8, title: 'Parallele & senkrechte Geraden', desc: 'm₂ = m₁ oder m₁ · m₂ = −1: Geraden durch einen Punkt bestimmen und Lage prüfen.' },
    { id: 'schnittpunkt', nr: 9, title: 'Schnittpunkt zweier Geraden', desc: 'Gleichsetzen, x und y berechnen — auch mit Gleichungssystemen.' },
    { id: 'sachaufgaben', nr: 10, title: 'Sachaufgaben', desc: 'Handytarif, Taxi, Kerze & Co. — lineare Zusammenhänge im Alltag.' },
    { id: 'pruefung', nr: 11, title: 'MSA-Prüfungsaufgaben', desc: 'Komplette Prüfungsaufgaben 2010–2025 Teilaufgabe für Teilaufgabe durcharbeiten.' }
];

// ==========================================
// 7. START
// ==========================================
fkMount({
    key: 'lineare',
    title: 'Lineare Funktionen',
    icon: LinearIcon,
    theme: 'blue',
    beta: true,
    topics: LF_TOPICS,
    gen: GEN,
    exams: LF_EXAMS,
    examGroups: [
        { title: 'Lineare Funktionen', filter: (e) => !e.lgs },
        { title: 'Lineare Gleichungssysteme', filter: (e) => e.lgs }
    ]
});
