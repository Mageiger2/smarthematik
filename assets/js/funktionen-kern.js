// ==========================================
// funktionen-kern.js — gemeinsamer Kern der Funktionen-Trainer
// (Lineare Funktionen, Quadratische Funktionen).
// Wird zwischen shared.js und dem jeweiligen Trainer-Skript inline kompiliert.
// Enthält: Zahl-Helfer (Komma, Brüche), Formel-Darstellung, Koordinatensystem
// (Geraden und Parabeln, optional interaktiv), Schritt-Runner sowie Kachel-
// Übersicht, Themen-Trainer und Prüfungsmodus. Die Trainer-Skripte liefern
// nur Themen, Aufgaben-Generatoren und Prüfungsaufgaben und rufen fkMount(cfg).
// ==========================================

// Theme-Farbe des aktuellen Trainers (Tailwind-Farbname, z. B. 'blue').
// Wird von fkMount(cfg) gesetzt, bevor gerendert wird.
const FK = { theme: 'blue' };
// Konfiguration des aktuellen Trainers (siehe fkMount).
let FKC = null;

// ==========================================
// 0. HELFER (Zahlen mit deutscher Komma-Konvention, Brüche)
// ==========================================
const lfRand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const lfPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const lfR = (v, d = 10) => { const f = Math.pow(10, d); return Math.round(v * f) / f; };
const lfSame = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;

// Eingabe → Zahl. Erlaubt Komma, Punkt, Minus-Varianten und Brüche wie "-2/3".
const lfParse = (s) => {
    if (s === null || s === undefined) return NaN;
    const str = String(s).replace(/\s+/g, '').replace(/[−–]/g, '-').replace(/,/g, '.');
    if (str === '') return NaN;
    const num = (x) => /^[+-]?(\d+\.?\d*|\.\d+)$/.test(x) ? parseFloat(x) : NaN;
    if (str.includes('/')) {
        const parts = str.split('/');
        if (parts.length !== 2) return NaN;
        const a = num(parts[0]), b = num(parts[1]);
        if (isNaN(a) || isNaN(b) || b === 0) return NaN;
        return a / b;
    }
    return num(str);
};

// Bruchdarstellung (Nenner bis 12), sonst null.
const lfFrac = (v, maxDen = 12) => {
    for (let d = 1; d <= maxDen; d++) {
        const n = v * d;
        if (Math.abs(n - Math.round(n)) < 1e-7) return { n: Math.round(n), d };
    }
    return null;
};
// Höchstens zwei Nachkommastellen → Dezimaldarstellung, sonst Bruch (z. B. 1/3).
const lfIsShort = (v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-7;
const lfUseFrac = (v, frac) => {
    const f = lfFrac(v);
    return f && f.d !== 1 && (frac === true || (frac !== false && !lfIsShort(v))) ? f : null;
};

// Zahl als Text: "−2/3", "0,25", "−1,5"
const lfS = (v, frac) => {
    v = lfR(v, 6);
    const sign = v < 0 ? '−' : '';
    const f = lfUseFrac(v, frac);
    if (f) return `${sign}${Math.abs(f.n)}/${f.d}`;
    return sign + String(lfR(Math.abs(v), 4)).replace('.', ',');
};
// Zahl in Klammern, falls negativ: "(−2)"
const lfP = (v, frac) => (lfR(v) < 0 ? `(${lfS(v, frac)})` : lfS(v, frac));
// Punkt als Text: "A(−2 | 3)"
const lfPt = (P) => `${P.n || ''}(${lfS(P.x)} | ${lfS(P.y)})`;

// Funktionsgleichung als Text: "y = −2/3x + 3"
const lfGlS = (m, t, frac) => {
    m = lfR(m); t = lfR(t);
    let s = 'y = ';
    if (m === 0) return s + lfS(t, frac);
    s += m === 1 ? 'x' : m === -1 ? '−x' : `${lfS(m, frac)}x`;
    if (t !== 0) s += ` ${t < 0 ? '−' : '+'} ${lfS(Math.abs(t), frac)}`;
    return s;
};

// Allgemeine Gleichung (Terme mit Koeffizient) als Text: "−5y + 2x − 10"
const lfSideS = (terms) => {
    if (!terms.length) return '0';
    return terms.map((tm, i) => {
        const c = lfR(tm.c);
        const abs = Math.abs(c);
        const num = tm.v && abs === 1 ? '' : lfS(abs);
        const sign = c < 0 ? (i === 0 ? '−' : ' − ') : (i === 0 ? '' : ' + ');
        return `${sign}${num}${tm.v}`;
    }).join('');
};

// Parser für Gleichungen wie "-5y+2x-10=0" oder "y-1=1/3x".
// Liefert A·y + B·x + C = 0 sowie m, t der Normalform und ob y schon allein steht.
const lfParseEq = (str) => {
    const [Ls, Rs] = str.split('=');
    const side = (s) => {
        const r = { x: 0, y: 0, c: 0 };
        const toks = s.replace(/\s+/g, '').replace(/[−–]/g, '-').replace(/,/g, '.').match(/[+-]?[^+-]+/g) || [];
        toks.forEach(tok => {
            let v = 'c', k = tok;
            const last = k[k.length - 1];
            if (last === 'x' || last === 'y') { v = last; k = k.slice(0, -1); }
            if (k === '' || k === '+') k = '1';
            if (k === '-') k = '-1';
            r[v] += lfParse(k);
        });
        return r;
    };
    const l = side(Ls), r = side(Rs);
    const A = lfR(l.y - r.y), B = lfR(l.x - r.x), C = lfR(l.c - r.c);
    const isolated = Ls.trim() === 'y' || Rs.trim() === 'y';
    return { A, B, C, m: lfR(-B / A), t: lfR(-C / A), isolated };
};

// ==========================================
// 1. DARSTELLUNG (reines JSX)
// ==========================================
const V = ({ children }) => <span className="font-math-italic">{children}</span>;

// Zahl (ggf. als Bruch gestapelt)
const Z = ({ v, frac }) => {
    v = lfR(v, 6);
    const f = lfUseFrac(v, frac);
    if (!f) return <span>{lfS(v, false)}</span>;
    return <span className="whitespace-nowrap">{v < 0 ? '−' : ''}<Frac top={Math.abs(f.n)} bot={f.d} /></span>;
};

// Funktionsgleichung y = mx + t als JSX
const Gl = ({ m, t, frac, name }) => {
    m = lfR(m); t = lfR(t);
    const mPart = m === 0 ? null : m === 1 ? <V>x</V> : m === -1 ? <>−<V>x</V></> : <><Z v={m} frac={frac} /><V>x</V></>;
    let tPart = null;
    if (m === 0) tPart = <Z v={t} frac={frac} />;
    else if (t !== 0) tPart = <> {t < 0 ? '−' : '+'} <Z v={Math.abs(t)} frac={frac} /></>;
    return <span className="font-math whitespace-nowrap">{name && <>{name}: </>}<V>y</V> = {mPart}{tPart}</span>;
};

// Formel-Zeile (wie im Kugel-Trainer)
const LfZeile = ({ children, big = true }) => (
    <div className={`flex items-center justify-center flex-wrap gap-x-1 gap-y-2 my-3 ${big ? 'text-xl sm:text-2xl' : 'text-lg'} font-math text-slate-800 bg-slate-50 border border-slate-200 rounded-xl py-4 px-3`}>
        {children}
    </div>
);

// Inline-Eingabefeld direkt in der Formel
const LfInput = ({ value, status, onChange, onSubmit, disabled, placeholder = '?', width = 'w-20' }) => {
    const stCls = status === 'correct'
        ? 'border-green-500 bg-green-50 text-green-900 font-bold'
        : status === 'incorrect'
        ? 'border-red-400 bg-red-50 text-red-900'
        : `border-${FK.theme}-400 bg-white focus:border-${FK.theme}-600 focus:ring-2 focus:ring-${FK.theme}-200`;
    return (
        <input type="text" inputMode="text"
               value={value || ''}
               disabled={disabled}
               onChange={e => onChange(e.target.value.replace('.', ','))}
               onKeyDown={enterToSubmit(onSubmit)}
               placeholder={placeholder}
               className={`${width} h-10 mx-1 text-center text-lg outline-none rounded-md border-2 transition-colors shadow-sm align-middle ${stCls}`} />
    );
};

// Wertetabelle (x-Zeile oben, y-Zeile unten)
const LfTabelle = ({ xs, ys }) => (
    <div className="overflow-x-auto my-3">
        <table className="mx-auto border-collapse font-math text-lg bg-white">
            <tbody>
                <tr>
                    <th className={`border-2 border-slate-300 bg-${FK.theme}-50 px-3 py-2`}><V>x</V></th>
                    {xs.map((x, i) => <td key={i} className="border-2 border-slate-300 px-3 py-2 text-center min-w-[3.5rem]">{x}</td>)}
                </tr>
                <tr>
                    <th className={`border-2 border-slate-300 bg-${FK.theme}-50 px-3 py-2`}><V>y</V></th>
                    {ys.map((y, i) => <td key={i} className="border-2 border-slate-300 px-1 py-2 text-center min-w-[3.5rem]">{y}</td>)}
                </tr>
            </tbody>
        </table>
    </div>
);

// ==========================================
// 2. KOORDINATENSYSTEM (SVG, optional interaktiv)
// ==========================================
const LF_LINE_COLORS = ['#2563eb', '#dc2626', '#059669', '#d97706'];

// Funktionswert einer Kurve: Gerade { m, t } oder Parabel { a, b, c } (y = ax² + bx + c)
const fkEval = (g, x) => (g.a !== undefined ? g.a * x * x + (g.b || 0) * x + (g.c || 0) : g.m * x + g.t);

// Stützpunkte einer Parabel für die Polyline (Werte außerhalb werden begrenzt, der Rest wird geclippt)
const fkCurvePoints = (g, xmin, xmax, ymin, ymax) => {
    const pts = [];
    for (let x = xmin - 0.5; x <= xmax + 0.5 + 1e-9; x += 0.05) {
        const y = Math.max(ymin - 3, Math.min(ymax + 3, fkEval(g, x)));
        pts.push({ x, y });
    }
    return pts;
};

const Koord = ({ range = [-6, 6, -6, 6], lines = [], points = [], interactive = null, snap = 0.5 }) => {
    const [xmin, xmax, ymin, ymax] = range;
    const U = 28, pad = 22;
    const W = (xmax - xmin) * U + 2 * pad, H = (ymax - ymin) * U + 2 * pad;
    const X = (x) => pad + (x - xmin) * U;
    const Y = (y) => pad + (ymax - y) * U;
    const clipId = React.useRef('lfclip' + Math.random().toString(36).slice(2)).current;
    const svgRef = React.useRef(null);
    const [hover, setHover] = useState(null);
    const lblStep = (xmax - xmin) > 16 || (ymax - ymin) > 16 ? 2 : 1;
    const active = interactive && !interactive.disabled;

    // Bildschirmkoordinaten → Koordinaten im System (auf das Raster eingerastet)
    const toCoord = (e) => {
        const svg = svgRef.current;
        if (!svg || !svg.getScreenCTM) return null;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        const p = pt.matrixTransform(svg.getScreenCTM().inverse());
        let x = xmin + (p.x - pad) / U, y = ymax - (p.y - pad) / U;
        x = Math.round(x / snap) * snap; y = Math.round(y / snap) * snap;
        if (x < xmin || x > xmax || y < ymin || y > ymax) return null;
        return { x: lfR(x), y: lfR(y) };
    };

    const grid = [];
    for (let g = xmin; g <= xmax + 1e-9; g += 0.5) {
        const major = Math.abs(g - Math.round(g)) < 1e-9;
        grid.push(<line key={'gx' + g} x1={X(g)} y1={Y(ymax)} x2={X(g)} y2={Y(ymin)} stroke={major ? '#cbd5e1' : '#e8edf3'} strokeWidth="1" />);
    }
    for (let g = ymin; g <= ymax + 1e-9; g += 0.5) {
        const major = Math.abs(g - Math.round(g)) < 1e-9;
        grid.push(<line key={'gy' + g} x1={X(xmin)} y1={Y(g)} x2={X(xmax)} y2={Y(g)} stroke={major ? '#cbd5e1' : '#e8edf3'} strokeWidth="1" />);
    }

    const labels = [];
    const hasX = ymin <= 0 && ymax >= 0, hasY = xmin <= 0 && xmax >= 0;
    const axisY = hasX ? Y(0) : Y(ymin), axisX = hasY ? X(0) : X(xmin);
    for (let i = Math.ceil(xmin); i <= Math.floor(xmax); i++) {
        if (i === 0 || i % lblStep !== 0 || i === xmax) continue;
        labels.push(<text key={'lx' + i} x={X(i)} y={axisY + 15} fontSize="11" textAnchor="middle" fill="#475569">{i < 0 ? '−' + Math.abs(i) : i}</text>);
        labels.push(<line key={'tx' + i} x1={X(i)} y1={axisY - 3} x2={X(i)} y2={axisY + 3} stroke="#1e293b" strokeWidth="1" />);
    }
    for (let i = Math.ceil(ymin); i <= Math.floor(ymax); i++) {
        if (i === 0 || i % lblStep !== 0 || i === ymax) continue;
        labels.push(<text key={'ly' + i} x={axisX - 6} y={Y(i) + 4} fontSize="11" textAnchor="end" fill="#475569">{i < 0 ? '−' + Math.abs(i) : i}</text>);
        labels.push(<line key={'ty' + i} x1={axisX - 3} y1={Y(i)} x2={axisX + 3} y2={Y(i)} stroke="#1e293b" strokeWidth="1" />);
    }
    if (hasX && hasY) labels.push(<text key="l0" x={X(0) - 6} y={Y(0) + 15} fontSize="11" textAnchor="end" fill="#475569">0</text>);

    // Geraden: auf den sichtbaren Bereich geclippt, Beschriftung am rechten Rand
    const lineEls = lines.map((g, i) => {
        const col = g.color || LF_LINE_COLORS[i % LF_LINE_COLORS.length];
        const x1 = xmin - 1, x2 = xmax + 1;
        let lbl = null;
        if (g.n) {
            for (let x = xmax - 0.6; x >= xmin + 0.4; x -= 0.2) {
                const y = fkEval(g, x);
                if (y > ymin + 0.6 && y < ymax - 0.6) { lbl = { x, y }; break; }
            }
        }
        return (
            <g key={'ln' + i}>
                {g.a === undefined
                    ? <line x1={X(x1)} y1={Y(g.m * x1 + g.t)} x2={X(x2)} y2={Y(g.m * x2 + g.t)} stroke={col} strokeWidth="2.4" clipPath={`url(#${clipId})`} strokeDasharray={g.dash ? '6 4' : undefined} />
                    : <polyline fill="none" points={fkCurvePoints(g, xmin, xmax, ymin, ymax).map(p => `${X(p.x)},${Y(p.y)}`).join(' ')} stroke={col} strokeWidth="2.4" clipPath={`url(#${clipId})`} strokeLinejoin="round" strokeDasharray={g.dash ? '6 4' : undefined} />}
                {lbl && <text x={X(lbl.x)} y={Y(lbl.y) - 8} fontSize="14" fontStyle="italic" fontWeight="bold" fill={col} textAnchor="end">{g.n}</text>}
            </g>
        );
    });

    const pointEls = points.map((p, i) => (
        <g key={'pt' + i}>
            <circle cx={X(p.x)} cy={Y(p.y)} r="4.5" fill={p.color || '#1e293b'} />
            {p.n && <text x={X(p.x) + 7} y={Y(p.y) - 7} fontSize="13" fontWeight="bold" fill={p.color || '#1e293b'}>{p.n}</text>}
        </g>
    ));

    const placedEls = (interactive?.placed || []).map((p, i) => {
        const col = p.ok === true ? '#16a34a' : p.ok === false ? '#dc2626' : '#2563eb';
        return (
            <g key={'pl' + i}>
                <circle cx={X(p.x)} cy={Y(p.y)} r="7" fill="white" stroke={col} strokeWidth="2.5" />
                <circle cx={X(p.x)} cy={Y(p.y)} r="2.5" fill={col} />
            </g>
        );
    });

    return (
        <div className="flex justify-center w-full bg-white p-2 sm:p-3 border border-slate-200 rounded-xl shadow-inner">
            <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
                 className={`w-full max-w-[440px] select-none ${active ? 'cursor-crosshair touch-manipulation' : ''}`}
                 onClick={(e) => { if (!active) return; const c = toCoord(e); if (c) interactive.onPlace(c.x, c.y); }}
                 onMouseMove={(e) => { if (active) setHover(toCoord(e)); }}
                 onMouseLeave={() => setHover(null)}>
                <defs><clipPath id={clipId}><rect x={X(xmin)} y={Y(ymax)} width={(xmax - xmin) * U} height={(ymax - ymin) * U} /></clipPath></defs>
                <rect x={X(xmin)} y={Y(ymax)} width={(xmax - xmin) * U} height={(ymax - ymin) * U} fill="#ffffff" />
                {grid}
                <line x1={X(xmin)} y1={axisY} x2={X(xmax) + 12} y2={axisY} stroke="#1e293b" strokeWidth="1.6" />
                <polygon points={`${X(xmax) + 16},${axisY} ${X(xmax) + 7},${axisY - 4} ${X(xmax) + 7},${axisY + 4}`} fill="#1e293b" />
                <text x={X(xmax) + 6} y={axisY - 8} fontSize="13" fontStyle="italic" fill="#1e293b">x</text>
                <line x1={axisX} y1={Y(ymin)} x2={axisX} y2={Y(ymax) - 12} stroke="#1e293b" strokeWidth="1.6" />
                <polygon points={`${axisX},${Y(ymax) - 16} ${axisX - 4},${Y(ymax) - 7} ${axisX + 4},${Y(ymax) - 7}`} fill="#1e293b" />
                <text x={axisX + 8} y={Y(ymax) - 6} fontSize="13" fontStyle="italic" fill="#1e293b">y</text>
                {labels}
                {lineEls}
                {pointEls}
                {active && hover && <circle cx={X(hover.x)} cy={Y(hover.y)} r="6" fill="#2563eb" fillOpacity="0.2" stroke="#2563eb" strokeOpacity="0.5" />}
                {placedEls}
            </svg>
        </div>
    );
};

// ==========================================
// Schritt-Bausteine (Grundgerüst). Die Trainer ergänzen eigene Bausteine.
// Schritt-Typen:
//   select: { options, correctIdx, noShuffle }
//   fill:   { inputs:[{id, correct, tol}], render(h), altSets, summary(vals) }
//   calc:   { label, unit, correct, tol }
//   points: { count, check(p), graph }
// Alle mit goal (Titel), hint (Tipp) und solution (Lösung als Text).
// ==========================================
const S = {};
S.calc = (goal, label, correct, hint, solution, unit, tol) => ({ type: 'calc', goal, label, correct, hint, solution, unit, tol });
S.select = (goal, options, correctIdx, hint, solution, noShuffle) => ({ type: 'select', goal, options, correctIdx, hint, solution, noShuffle });

// Typ-Auswahl mit Anti-Wiederholung
const lfChooseType = (types, forbidden) => {
    const free = types.filter(t => !forbidden.includes(t));
    return lfPick(free.length ? free : types);
};

// Auswahl-Optionen zufällig anordnen (außer noShuffle)
const lfShuffleSelects = (task) => ({
    ...task,
    steps: task.steps.map(s => {
        if (s.type === 'select' && !s.noShuffle && s.options.length > 1) {
            const order = shuffleArray(s.options.map((_, i) => i));
            return { ...s, options: order.map(i => s.options[i]), correctIdx: order.indexOf(s.correctIdx) };
        }
        return s;
    })
});

// Alle Teilaufgaben flach (für die Prüfungs-Stufe in den Themen-Kacheln)
const fkExamParts = (exams) => {
    const out = [];
    exams.forEach(ex => ex.parts.forEach(p => out.push({ ...p, exam: ex })));
    return out;
};

// Teilaufgabe → Task-Objekt für den StepRunner
const fkExamTask = (part) => {
    const ex = part.exam;
    const built = part.steps();
    return {
        title: `Aufgabe ${ex.nr}${part.l}`,
        label: `${ex.label}/${ex.nr}${part.l}`,
        sigKey: `${ex.id}-${part.l}`,
        desc: <>{ex.intro && <div className="mb-2 text-slate-600">{ex.intro}</div>}<div>{part.text}</div></>,
        graph: part.graph !== undefined ? part.graph : (ex.graph || null),
        steps: built,
        finalGraph: part.fg || null
    };
};

// ==========================================
// 7. SCHRITT-RUNNER (arbeitet task.steps nacheinander ab)
// ==========================================
const LfStepRunner = ({ task, tc, onWrong, onSolved, onSolutionShown, onNext, nextBtnText }) => {
    const [stepIdx, setStepIdx] = useState(0);
    const [inputs, setInputs] = useState({});
    const [status, setStatus] = useState({});
    const [calcInput, setCalcInput] = useState('');
    const [calcStatus, setCalcStatus] = useState(null);
    const [selectIdx, setSelectIdx] = useState(null);
    const [selectStatus, setSelectStatus] = useState(null);
    const [placed, setPlaced] = useState([]);
    const [completed, setCompleted] = useState(false);
    const [answers, setAnswers] = useState({});
    const [showWay, setShowWay] = useState(false);
    const step = task.steps[stepIdx];

    const resetStep = () => {
        setInputs({}); setStatus({});
        setCalcInput(''); setCalcStatus(null);
        setSelectIdx(null); setSelectStatus(null);
        setPlaced([]);
    };
    const advanceWith = (ans) => {
        setAnswers(prev => ({ ...prev, [stepIdx]: ans }));
        if (stepIdx + 1 >= task.steps.length) {
            setCompleted(true);
            onSolved();
        } else {
            setStepIdx(stepIdx + 1);
            resetStep();
            tc.setErrors(0); tc.setTipRevealed(false);
        }
    };

    const checkSelect = () => {
        if (selectIdx === null) return;
        if (selectIdx === step.correctIdx) {
            setSelectStatus('correct');
            setTimeout(() => advanceWith({ type: 'select', jsx: step.options[selectIdx] }), 350);
        } else { setSelectStatus('incorrect'); onWrong(); }
    };

    const checkFill = () => {
        const vals = {};
        step.inputs.forEach(i => { vals[i.id] = lfParse(inputs[i.id]); });
        const primary = {};
        step.inputs.forEach(i => { primary[i.id] = i.correct; });
        const sets = [primary, ...(step.altSets || [])];
        const fieldOk = (set, i) => !isNaN(vals[i.id]) && Math.abs(vals[i.id] - set[i.id]) <= (i.tol !== undefined ? i.tol : 0.011);
        const match = sets.find(set => step.inputs.every(i => fieldOk(set, i)));
        if (match) {
            const st = {}; step.inputs.forEach(i => { st[i.id] = 'correct'; });
            setStatus(st);
            const raw = {}; step.inputs.forEach(i => { raw[i.id] = inputs[i.id]; });
            setTimeout(() => advanceWith({ type: 'fill', values: raw }), 350);
        } else {
            // Markierung anhand der „nächstliegenden“ Lösung
            let best = sets[0], bestCount = -1;
            sets.forEach(set => { const c = step.inputs.filter(i => fieldOk(set, i)).length; if (c > bestCount) { best = set; bestCount = c; } });
            const st = {}; step.inputs.forEach(i => { st[i.id] = fieldOk(best, i) ? 'correct' : 'incorrect'; });
            setStatus(st);
            onWrong();
        }
    };

    const checkCalc = () => {
        const v = lfParse(calcInput);
        const tol = step.tol !== undefined ? step.tol : 0.011;
        if (!isNaN(v) && Math.abs(v - step.correct) <= tol) {
            setCalcStatus('correct');
            setTimeout(() => advanceWith({ type: 'calc', value: calcInput, label: step.label, unit: step.unit }), 350);
        } else { setCalcStatus('incorrect'); onWrong(); }
    };

    const checkPoints = () => {
        if (placed.length !== step.count) return;
        const res = placed.map((p, i) => {
            const dup = placed.slice(0, i).some(q => lfSame(q.x, p.x) && lfSame(q.y, p.y));
            return { ...p, ok: !dup && step.check(p) };
        });
        setPlaced(res);
        if (res.every(p => p.ok)) setTimeout(() => advanceWith({ type: 'points', pts: res }), 350);
        else onWrong();
    };

    const placePoint = (x, y) => {
        setPlaced(prev => {
            const clean = prev.map(p => ({ x: p.x, y: p.y }));
            const i = clean.findIndex(p => lfSame(p.x, x) && lfSame(p.y, y));
            if (i >= 0) return clean.filter((_, j) => j !== i);
            const next = [...clean, { x, y }];
            return next.length > step.count ? next.slice(next.length - step.count) : next;
        });
    };

    const fillHelpers = () => ({
        input: (id, width = 'w-20', placeholder) => (
            <LfInput value={inputs[id]} status={status[id]} width={width} placeholder={placeholder}
                     onChange={(v) => { setInputs(prev => ({ ...prev, [id]: v })); setStatus(prev => ({ ...prev, [id]: null })); }}
                     onSubmit={checkFill} />
        )
    });

    // Zusammenfassung eines gelösten Schritts für die eingeklappte StepCard
    const pastSummary = (ans, s) => {
        if (!ans) return null;
        if (ans.type === 'select') return <span>{ans.jsx}</span>;
        if (ans.type === 'calc') return <span className="font-math">{ans.label} = {ans.value}{ans.unit ? ' ' + ans.unit : ''}</span>;
        if (ans.type === 'points') return <span className="font-math">{ans.pts.map(p => `(${lfS(p.x)} | ${lfS(p.y)})`).join(', ')}</span>;
        if (ans.type === 'fill') {
            if (s.summary) return <span className="font-math">{s.summary(ans.values)}</span>;
            const el = s.render({ input: (id) => <span className={`text-${FK.theme}-700 font-bold mx-0.5`}>{ans.values[id]}</span> });
            if (el && el.props) return <span className="font-math">{el.props.children}</span>;
        }
        return null;
    };

    const tipRow = (s, onCheck, disabled) => (
        <div className="mt-2 flex justify-between items-center gap-2">
            <TipBox errors={tc.errors} revealed={tc.tipRevealed} setRevealed={tc.setTipRevealed}
                    text={s.hint} solutionText={s.solution} onSolutionShown={onSolutionShown} />
            <div className="ml-auto"><SubmitBtn onClick={onCheck} theme={FK.theme} disabled={disabled} /></div>
        </div>
    );

    const renderStep = (s, idx) => {
        const isActive = idx === stepIdx && !completed;
        const isPast = idx < stepIdx || completed;
        return (
            <StepCard key={idx} title={isPast ? s.goal.replace(/\.$/, '') : s.goal} stepNum={idx + 1} currentStep={stepIdx + 1}
                      activeCondition={isActive} pastCondition={isPast}
                      pastSummary={isPast ? pastSummary(answers[idx], s) : null} theme={FK.theme}>
                {s.type === 'select' && (
                    <div className="flex flex-col gap-3">
                        {s.options.map((opt, oi) => (
                            <button key={oi} disabled={!isActive}
                                    onClick={() => { if (isActive) { setSelectIdx(oi); setSelectStatus(null); } }}
                                    className={`text-left p-4 rounded-xl border-2 bg-white transition-all flex justify-between items-center ${
                                        selectIdx === oi
                                            ? (selectStatus === 'correct' ? 'border-green-500 bg-green-50' : selectStatus === 'incorrect' ? 'border-red-400 bg-red-50' : `border-${FK.theme}-500 bg-${FK.theme}-50 font-bold`)
                                            : `border-slate-200 hover:border-${FK.theme}-400`}`}>
                                <span className="text-lg">{opt}</span>
                                {selectIdx === oi && selectStatus === 'correct' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                {selectIdx === oi && selectStatus === 'incorrect' && <XCircle className="w-5 h-5 text-red-500" />}
                            </button>
                        ))}
                        {isActive && tipRow(s, checkSelect, selectIdx === null)}
                    </div>
                )}
                {s.type === 'fill' && (
                    <div className="flex flex-col gap-2">
                        {s.render(fillHelpers())}
                        {isActive && <p className="text-xs text-slate-500 text-center">Brüche kannst du als 2/3 eingeben, Dezimalzahlen mit Komma.</p>}
                        {isActive && tipRow(s, checkFill, !s.inputs.some(i => (inputs[i.id] || '').toString().trim().length > 0))}
                    </div>
                )}
                {s.type === 'calc' && (
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-50 border border-slate-200 rounded-xl py-4 px-3">
                            <span className="text-2xl font-math text-slate-800">{s.label} =</span>
                            <LfInput value={calcInput} status={calcStatus} onChange={setCalcInput} onSubmit={checkCalc} disabled={!isActive} width="w-32" />
                            {s.unit && <span className="text-lg text-slate-500">{s.unit}</span>}
                        </div>
                        {isActive && <div className="flex justify-center"><CalcButton theme={FK.theme} /></div>}
                        {isActive && tipRow(s, checkCalc, !(calcInput || '').trim())}
                    </div>
                )}
                {s.type === 'points' && (
                    <div className="flex flex-col gap-3">
                        <Koord range={s.graph.range} lines={s.graph.lines || []} points={s.graph.points || []}
                               interactive={{ placed, onPlace: placePoint, disabled: !isActive }} />
                        {isActive && (
                            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                                <span>
                                    Tippe auf einen Gitterpunkt, um einen Punkt zu setzen ({placed.length}/{s.count}).
                                    {placed.length > 0 && <span className="font-math ml-1 text-slate-800">{placed.map(p => `(${lfS(p.x)} | ${lfS(p.y)})`).join(', ')}</span>}
                                </span>
                                {placed.length > 0 && <button onClick={() => setPlaced([])} className="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600">Zurücksetzen</button>}
                            </div>
                        )}
                        {isActive && tipRow(s, checkPoints, placed.length !== s.count)}
                    </div>
                )}
            </StepCard>
        );
    };

    const solutionWay = () => task.steps.map((s, i) => {
        const sol = typeof s.solution === 'string' ? s.solution : '';
        return `Schritt ${i + 1}: ${s.goal}${sol ? `\n   → ${sol}` : ''}`;
    }).join('\n\n');

    return (
        <>
            <div className="space-y-4">{task.steps.map(renderStep)}</div>
            {completed && task.finalGraph && (
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                    <div className={`bg-${FK.theme}-50 px-6 py-3 border-b border-${FK.theme}-200 font-semibold text-${FK.theme}-900`}>So sieht es im Koordinatensystem aus</div>
                    <div className="p-4"><Koord {...task.finalGraph} /></div>
                </div>
            )}
            {completed && (
                <SuccessBox theme={FK.theme} text="Klasse gemacht! 🎉" subtitle="Du hast alle Schritte richtig gelöst — weiter so!"
                            showSolutionBtn={true} showSolution={showWay} onToggleSolution={() => setShowWay(v => !v)}
                            solutionText={solutionWay()} onNext={onNext} nextBtnText={nextBtnText} />
            )}
        </>
    );
};

// Aufgaben-Karte (Beschreibung + ggf. Abbildung)
const LfTaskCard = ({ task }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className={`bg-${FK.theme}-50 px-6 py-3 border-b border-${FK.theme}-200 flex justify-between items-center gap-2`}>
            <h2 className={`font-semibold text-${FK.theme}-900 flex items-center gap-2`}><BookOpen className="w-5 h-5 shrink-0" /> {task.title}</h2>
            {task.label && <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-amber-200 text-amber-800 text-right">{formatExamLabel(task.label)}</span>}
        </div>
        <div className="p-6 bg-white space-y-4">
            {task.graph && <Koord {...task.graph} />}
            <div className="text-base sm:text-lg leading-relaxed text-slate-700">{task.desc}</div>
        </div>
    </div>
);

// Zurück zur Übersicht
const LfBackLink = () => (
    <button onClick={() => { window.location.hash = ''; }}
            className={`mb-4 inline-flex items-center gap-1.5 text-${FK.theme}-700 hover:text-${FK.theme}-900 font-semibold text-sm`}>
        <span aria-hidden="true">←</span> Alle Themen
    </button>
);

// ==========================================
// 8. THEMEN-TRAINER (Stufen Leicht / Mittel / Schwer / Prüfung)
// ==========================================
const LfTopicTrainer = ({ topic }) => {
    const examParts = fkExamParts(FKC.exams).filter(p => p.topic === topic.id);
    const Icon = FKC.icon;
    const [difficulty, setDifficulty] = useState('leicht');
    const [task, setTask] = useState(null);
    const [taskKey, setTaskKey] = useState(0);
    const tc = useTrainerCore({ storageKey: `${FKC.key}_${topic.id}` });
    const adaptive = useAdaptive(`${FKC.key}_${topic.id}`, difficulty);
    const lastTypeRef = React.useRef({ leicht: [], mittel: [], schwer: [] });
    const examPoolRef = React.useRef({ pool: [], idx: 0, last: null });

    const newTask = (diff = difficulty) => {
        let t;
        if (diff === 'pruefung') {
            const ep = examPoolRef.current;
            if (!ep.pool.length || ep.idx >= ep.pool.length) { ep.pool = shuffleArray(examParts); ep.idx = 0; }
            let part = ep.pool[ep.idx];
            if (part && ep.pool.length > 1 && `${part.exam.id}-${part.l}` === ep.last) { ep.idx = (ep.idx + 1) % ep.pool.length; part = ep.pool[ep.idx]; }
            ep.idx += 1;
            ep.last = `${part.exam.id}-${part.l}`;
            t = fkExamTask(part);
        } else {
            const forbidden = lastTypeRef.current[diff];
            t = FKC.gen[topic.id](diff, forbidden);
            lastTypeRef.current[diff] = [...forbidden, t.typeId].slice(-1);
        }
        setTask(lfShuffleSelects(t));
        setTaskKey(k => k + 1);
        tc.setErrors(0); tc.setTipRevealed(false);
    };

    useEffect(() => { newTask(difficulty); /* eslint-disable-next-line */ }, [difficulty]);

    const handleDifficultyChange = (d) => { if (d === difficulty) newTask(d); else setDifficulty(d); };

    const options = [{ id: 'leicht', label: 'Leicht' }, { id: 'mittel', label: 'Mittel' }, { id: 'schwer', label: 'Schwer' }];
    if (examParts.length) options.push({ id: 'pruefung', label: 'Prüfungsaufgaben' });

    return (
        <div className="page-transition max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {tc.showAnim && <CelebrationOverlay />}
            <LfBackLink />
            <TrainerHeader theme={FK.theme} icon={Icon} title={topic.title} streakIcon={Icon} streak={tc.streak} />
            <DifficultyMenu theme={FK.theme} active={difficulty} onChange={handleDifficultyChange} options={options} />
            {adaptive.stats.mastered.length > 0 && (
                <div className="mb-4 flex justify-center"><MasteryBadge mastered={adaptive.stats.mastered} theme={FK.theme} /></div>
            )}
            <AdaptiveSuggestion suggestion={adaptive.suggestion} onAccept={(d) => handleDifficultyChange(d)} theme={FK.theme} />
            <main className="space-y-6 relative">
                {task && <LfTaskCard task={task} />}
                {task && (
                    <LfStepRunner key={taskKey} task={task} tc={tc}
                                  onWrong={() => { tc.triggerError(); adaptive.recordWrong(); }}
                                  onSolved={() => { tc.onSuccessfulSolve(); adaptive.recordCorrect(); }}
                                  onSolutionShown={() => { tc.onSolutionShown(); adaptive.recordWrong(); }}
                                  onNext={() => newTask()}
                                  nextBtnText={difficulty === 'pruefung' ? 'Nächste Prüfungsaufgabe' : 'Nächste Aufgabe'} />
                )}
            </main>
        </div>
    );
};

// ==========================================
// 9. MSA-PRÜFUNGEN (ganze Aufgaben Teil für Teil)
// ==========================================
const LfExamTrainer = ({ topic }) => {
    const [examId, setExamId] = useState(null);
    const [partIdx, setPartIdx] = useState(0);
    const [done, setDone] = useState({});
    const [task, setTask] = useState(null);
    const [taskKey, setTaskKey] = useState(0);
    const tc = useTrainerCore({ storageKey: `${FKC.key}_pruefung` });
    const exam = FKC.exams.find(e => e.id === examId);
    const Icon = FKC.icon;

    const openPart = (ex, i) => {
        setPartIdx(i);
        setTask(lfShuffleSelects(fkExamTask({ ...ex.parts[i], exam: ex })));
        setTaskKey(k => k + 1);
        tc.setErrors(0); tc.setTipRevealed(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const openExam = (ex) => { setExamId(ex.id); setDone({}); openPart(ex, 0); };
    const randomExam = () => openExam(lfPick(FKC.exams.filter(e => !e.lgs)));

    const groups = (FKC.examGroups || [{ title: FKC.title, filter: () => true }])
        .map(g => ({ title: g.title, items: FKC.exams.filter(g.filter) }))
        .filter(g => g.items.length);

    return (
        <div className="page-transition max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {tc.showAnim && <CelebrationOverlay />}
            <LfBackLink />
            <TrainerHeader theme={FK.theme} icon={Icon} title={topic.title} streakIcon={Icon} streak={tc.streak} />

            {!exam && (
                <div className="space-y-6">
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-slate-700 mb-4">Wähle eine Prüfung aus. Du bearbeitest die Teilaufgaben nacheinander — mit Tipps und Lösungen wie in den anderen Themen. Reine Begründungsaufgaben sind nicht enthalten.</p>
                        <button onClick={randomExam} className={`bg-${FK.theme}-600 hover:bg-${FK.theme}-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm inline-flex items-center gap-2`}>
                            <RefreshCw className="w-4 h-4" /> Zufällige Prüfung
                        </button>
                    </div>
                    {groups.map(g => (
                        <div key={g.title}>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">{g.title}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {g.items.map(ex => (
                                    <button key={ex.id} onClick={() => openExam(ex)}
                                            className={`bg-white border-2 border-slate-200 hover:border-${FK.theme}-400 hover:bg-${FK.theme}-50 rounded-xl p-3 text-left transition-colors shadow-sm`}>
                                        <span className="block font-bold text-slate-800">{ex.label.replace('MSA ', '')}</span>
                                        <span className="block text-xs text-slate-500">Aufgabe {ex.nr} · {ex.parts.length} Teil{ex.parts.length === 1 ? '' : 'e'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {exam && task && (
                <main className="space-y-6">
                    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-2">
                        <button onClick={() => { setExamId(null); setTask(null); }} className={`text-sm text-${FK.theme}-700 hover:text-${FK.theme}-900 font-semibold mr-2`}>← Prüfungen</button>
                        <span className="font-bold text-slate-800 mr-2">{exam.label}, Aufgabe {exam.nr}</span>
                        {exam.parts.length > 1 && exam.parts.map((p, i) => (
                            <button key={i} onClick={() => openPart(exam, i)}
                                    className={`w-9 h-9 rounded-lg font-bold text-sm border-2 transition-colors ${i === partIdx ? `bg-${FK.theme}-600 border-${FK.theme}-600 text-white` : done[i] ? 'bg-green-50 border-green-400 text-green-800' : `bg-white border-slate-200 text-slate-600 hover:border-${FK.theme}-400`}`}>
                                {p.l || i + 1}
                            </button>
                        ))}
                    </div>
                    <LfTaskCard task={task} />
                    <LfStepRunner key={taskKey} task={task} tc={tc}
                                  onWrong={() => tc.triggerError()}
                                  onSolved={() => { tc.onSuccessfulSolve(); setDone(d => ({ ...d, [partIdx]: true })); }}
                                  onSolutionShown={() => tc.onSolutionShown()}
                                  onNext={() => { if (partIdx + 1 < exam.parts.length) openPart(exam, partIdx + 1); else { setExamId(null); setTask(null); } }}
                                  nextBtnText={partIdx + 1 < exam.parts.length ? 'Nächste Teilaufgabe' : 'Zur Prüfungsübersicht'} />
                </main>
            )}
        </div>
    );
};

// ==========================================
// 10. KACHEL-ÜBERSICHT
// ==========================================
const LfOverview = () => {
    const tileStats = (id) => {
        const streak = getStorage(`smarth_streak_${FKC.key}_${id}`, 0);
        const adapt = getStorageJSON(`smarth_adaptive_${FKC.key}_${id}`, null);
        return { streak, mastered: adapt && adapt.mastered ? adapt.mastered.length : 0 };
    };
    const Icon = FKC.icon;
    return (
        <div className="page-transition max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {FKC.beta && (
                <div className="mb-4 flex items-center gap-3 bg-amber-50 border-2 border-amber-300 text-amber-900 px-3 py-2 rounded-lg text-sm">
                    <span className="bg-amber-500 text-white text-xs font-extrabold px-2 py-0.5 rounded shrink-0">BETA</span>
                    <span>Dieser Trainer ist noch im Aufbau. Fehler oder Verbesserungsvorschläge gerne per E-Mail melden.</span>
                </div>
            )}
            <header className={`bg-${FK.theme}-700 shadow-md p-3 sm:p-6 rounded-xl mb-6`}>
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 text-white" />
                    <h1 className="text-base sm:text-2xl font-bold tracking-tight text-white truncate">
                        {FKC.title}
                        <span className="hidden sm:inline text-white/70 text-lg font-normal border-l-2 border-white/30 pl-2 ml-2">10. Klasse</span>
                    </h1>
                </div>
            </header>
            <p className="text-slate-600 mb-8 text-center max-w-2xl mx-auto">
                Wähle ein Thema. Jedes Thema hat die Stufen Leicht, Mittel und Schwer sowie passende MSA-Prüfungsaufgaben. Dein Fortschritt wird pro Thema gespeichert.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {FKC.topics.map(tp => {
                    const st = tileStats(tp.id);
                    const isExam = tp.id === 'pruefung';
                    return (
                        <a key={tp.id} href={`#${tp.id}`}
                           className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col group no-underline">
                            <div className="flex items-start gap-4 mb-3">
                                <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-xl font-extrabold group-hover:scale-110 transition-transform ${isExam ? 'bg-amber-100 text-amber-700' : `bg-${FK.theme}-100 text-${FK.theme}-700`}`}>{tp.nr}</div>
                                <h4 className="text-lg font-bold text-slate-800 leading-snug pt-1">{tp.title}</h4>
                            </div>
                            <p className="text-slate-600 text-sm flex-grow mb-4">{tp.desc}</p>
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex gap-1.5 flex-wrap">
                                    {st.streak > 0 && <span className={`text-xs font-bold bg-${FK.theme}-50 text-${FK.theme}-700 border border-${FK.theme}-200 px-2 py-0.5 rounded-full`}>Streak {st.streak}</span>}
                                    {st.mastered > 0 && <span className="text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">★ {st.mastered}× gemeistert</span>}
                                </div>
                                <span className={`inline-flex items-center px-4 py-1.5 border font-medium rounded-lg text-sm shadow-sm transition-all ${isExam ? 'border-amber-200 text-amber-700 bg-amber-50 group-hover:bg-amber-500 group-hover:text-white' : `border-${FK.theme}-200 text-${FK.theme}-700 bg-${FK.theme}-50 group-hover:bg-${FK.theme}-600 group-hover:text-white`}`}>Üben</span>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

// ==========================================
// 11. APP (Hash-Routing: #thema → Themen-Trainer)
// ==========================================
const FkApp = () => {
    const readHash = () => (window.location.hash || '').replace('#', '');
    const [topicId, setTopicId] = useState(readHash());
    useEffect(() => {
        const onHash = () => { setTopicId(readHash()); window.scrollTo(0, 0); };
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, []);
    const topic = FKC.topics.find(t => t.id === topicId);
    if (!topic) return <LfOverview />;
    if (topic.id === 'pruefung') return <LfExamTrainer key={topic.id} topic={topic} />;
    return <LfTopicTrainer key={topic.id} topic={topic} />;
};

// Startet einen Funktionen-Trainer.
// cfg: { key, title, icon, theme, beta, topics, gen, exams, examGroups? }
//   key    — Präfix für die Speicherung (smarth_streak_<key>_<thema>)
//   gen    — { themaId: (stufe, gesperrteTypen) => task }
//   exams  — Prüfungsaufgaben: [{ id, label, nr, intro?, graph?, parts: [{ l, topic, text, steps(), graph?, fg? }] }]
const fkMount = (cfg) => {
    FKC = cfg;
    FK.theme = cfg.theme;
    const root = ReactDOM.createRoot(document.getElementById('app-root'));
    root.render(<FkApp />);
};
