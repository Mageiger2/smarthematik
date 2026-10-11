// ==========================================
// lernen-trainer.js — Lernkarten für die Trainer ohne Themenauswahl
// Wird nach shared.js und lernen-kern.js inline kompiliert.
// LN_CARDS[trainer] = [ { id, title, body, widget?, needsWidget?, check?, merke? } ]
// Die Karten werden über LnSimpleApp (lernen-kern.js) im Modus #lernen gezeigt.
// ==========================================

// Kleine Schreibhilfen
const LnV = ({ children }) => <span className="font-math-italic">{children}</span>;
const LnP = ({ b, e }) => <span className="font-math whitespace-nowrap">{b}<sup>{e}</sup></span>;
const LnF = ({ top, bot }) => <Frac top={top} bot={bot} />;
const lnDe = (v, d = 2) => fDe(Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).replace('-', '−');
const LnUl = ({ items }) => <ul className="list-disc pl-6 space-y-1">{items.map((it, i) => <li key={i}>{it}</li>)}</ul>;
const LnBox = ({ children }) => <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-3 text-center font-math text-xl sm:text-2xl">{children}</div>;

// ==========================================
// Interaktive Beispiele
// ==========================================

// Halbwertszeit: Schieberegler über die Anzahl der Halbwertszeiten
const LHalbLab = ({ onDone }) => {
    const [n, setN] = useState(0);
    const w0 = 800, T = 5;
    const w = w0 * Math.pow(0.5, n);
    useEffect(() => { if (n >= 3) onDone(); /* eslint-disable-next-line */ }, [n]);
    const bars = [0, 1, 2, 3, 4, 5, 6];
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-slate-600 mb-2">Ein Stoff hat die Halbwertszeit <b>T = 5 Jahre</b>. Am Anfang sind <b>800 g</b> da. Schiebe die Zeit nach rechts.</p>
            <LnSlider label="t" value={n * T} min={0} max={6 * T} step={T} onChange={v => setN(Math.round(v / T))} format={v => `${v} Jahre`} />
            <div className="flex items-end gap-2 h-28 mt-4 mb-2">
                {bars.map(i => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                        <div className={`w-full rounded-t ${i === n ? 'bg-rose-500' : i < n ? 'bg-rose-200' : 'bg-slate-200'}`} style={{ height: `${100 * Math.pow(0.5, i)}%` }} />
                        <span className="text-[10px] text-slate-500 mt-1">{i * T}</span>
                    </div>
                ))}
            </div>
            <p className="text-center font-math text-lg">nach {n} Halbwertszeit{n === 1 ? '' : 'en'} ({n * T} Jahre): <b>{lnDe(w, 2)} g</b></p>
            <p className="text-center text-sm text-slate-500 mt-1">800 · 0,5<sup>{n}</sup> = {lnDe(w, 2)}</p>
        </div>
    );
};

// Wachstum: Prozentsatz und Jahre einstellen, Faktor q und Endwert beobachten
const LWachstumLab = ({ onDone }) => {
    const [p, setP] = useState(3);
    const [n, setN] = useState(5);
    const [moved, setMoved] = useState(false);
    const w0 = 1000, q = 1 + p / 100, wn = w0 * Math.pow(q, n);
    useEffect(() => { if (moved) onDone(); /* eslint-disable-next-line */ }, [moved]);
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <p className="text-sm text-slate-600">Anfangswert <b>W₀ = 1000 €</b>. Stelle Prozentsatz und Jahre ein. Minus bedeutet Abnahme.</p>
            <LnSlider label="p" value={p} min={-20} max={20} step={0.5} onChange={v => { setP(v); setMoved(true); }} format={v => `${lnDe(v, 1)} %`} />
            <LnSlider label="n" value={n} min={0} max={20} step={1} onChange={v => { setN(v); setMoved(true); }} format={v => `${v} Jahre`} />
            <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white rounded-lg border border-slate-200 p-3">
                    <p className="text-xs text-slate-500 uppercase font-bold">Wachstumsfaktor</p>
                    <p className="font-math text-xl">q = 1 {p < 0 ? '−' : '+'} <LnF top={lnDe(Math.abs(p), 1)} bot="100" /> = <b>{lnDe(q, 3)}</b></p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-3">
                    <p className="text-xs text-slate-500 uppercase font-bold">nach {n} Jahren</p>
                    <p className="font-math text-xl">W<sub>n</sub> = 1000 · {lnDe(q, 3)}<sup>{n}</sup> ≈ <b>{lnDe(wn, 2)} €</b></p>
                </div>
            </div>
        </div>
    );
};

// Kugel: Radius verändern, Volumen und Oberfläche beobachten
const LKugelLab = ({ onDone }) => {
    const [r, setR] = useState(2);
    const [moved, setMoved] = useState(false);
    useEffect(() => { if (moved) onDone(); /* eslint-disable-next-line */ }, [moved]);
    const V = 4 / 3 * Math.PI * r ** 3, O = 4 * Math.PI * r ** 2;
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <p className="text-sm text-slate-600">Verdopple den Radius (z. B. von 2 auf 4) und schau, was mit Volumen und Oberfläche passiert.</p>
            <LnSlider label="r" value={r} min={1} max={10} step={1} onChange={v => { setR(v); setMoved(true); }} format={v => `${v} cm`} />
            <div className="flex items-center gap-4">
                <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0"><circle cx="60" cy="60" r={6 + r * 5} fill="#eef2ff" stroke="#4f46e5" strokeWidth="2" /><line x1="60" y1="60" x2={66 + r * 5} y2="60" stroke="#4f46e5" strokeWidth="2" /><text x={60 + (6 + r * 5) / 2} y="54" fontSize="12" fill="#4f46e5" fontStyle="italic" textAnchor="middle">r</text></svg>
                <div className="grid gap-2 flex-grow">
                    <div className="bg-white rounded-lg border border-slate-200 p-2 font-math">V = <LnF top="4" bot="3" /> · π · {r}³ ≈ <b>{lnDe(V, 1)} cm³</b></div>
                    <div className="bg-white rounded-lg border border-slate-200 p-2 font-math">O = 4 · π · {r}² ≈ <b>{lnDe(O, 1)} cm²</b></div>
                </div>
            </div>
        </div>
    );
};

// Trigonometrie: Winkel α im rechtwinkligen Dreieck verändern (Hypotenuse c = 10)
const LTrigLab = ({ onDone }) => {
    const [al, setAl] = useState(35);
    const [moved, setMoved] = useState(false);
    useEffect(() => { if (moved) onDone(); /* eslint-disable-next-line */ }, [moved]);
    const c = 10, rad = al * Math.PI / 180, a = c * Math.sin(rad), b = c * Math.cos(rad);
    const S = 22, x0 = 20, y0 = 150, bx = x0 + b * S, ay = y0 - a * S;
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <p className="text-sm text-slate-600">Die Hypotenuse bleibt <b>c = 10</b>. Verändere den Winkel α: Die Gegenkathete a und die Ankathete b ändern sich.</p>
            <LnSlider label="α" value={al} min={10} max={80} step={1} onChange={v => { setAl(v); setMoved(true); }} format={v => `${v}°`} />
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <svg viewBox="0 0 260 170" className="w-full max-w-xs">
                    <polygon points={`${x0},${y0} ${bx},${y0} ${bx},${ay}`} fill="#fff7ed" stroke="#ea580c" strokeWidth="2" />
                    <path d={`M ${bx - 12},${y0} L ${bx - 12},${y0 - 12} L ${bx},${y0 - 12}`} fill="none" stroke="#ea580c" strokeWidth="1.5" />
                    <path d={`M ${x0 + 28},${y0} A 28,28 0 0,0 ${x0 + 28 * Math.cos(rad)},${y0 - 28 * Math.sin(rad)}`} fill="none" stroke="#ea580c" strokeWidth="1.5" />
                    <text x={x0 + 36} y={y0 - 6} fontSize="13" fill="#9a3412">α</text>
                    <text x={(x0 + bx) / 2} y={y0 + 16} fontSize="13" fill="#334155" textAnchor="middle">b = {lnDe(b, 2)}</text>
                    <text x={bx + 6} y={(y0 + ay) / 2 + 4} fontSize="13" fill="#334155">a = {lnDe(a, 2)}</text>
                    <text x={(x0 + bx) / 2 - 14} y={(y0 + ay) / 2 - 8} fontSize="13" fill="#334155" textAnchor="end">c = 10</text>
                </svg>
                <div className="grid gap-2 text-sm sm:text-base font-math">
                    <div className="bg-white rounded-lg border border-slate-200 p-2">sin α = <LnF top="a" bot="c" /> = {lnDe(Math.sin(rad), 3)}</div>
                    <div className="bg-white rounded-lg border border-slate-200 p-2">cos α = <LnF top="b" bot="c" /> = {lnDe(Math.cos(rad), 3)}</div>
                    <div className="bg-white rounded-lg border border-slate-200 p-2">tan α = <LnF top="a" bot="b" /> = {lnDe(Math.tan(rad), 3)}</div>
                </div>
            </div>
        </div>
    );
};

// Wahrscheinlichkeit: mit oder ohne Zurücklegen umschalten (3 rote von 10 Kugeln)
const LZiehLab = ({ onDone }) => {
    const [mode, setMode] = useState(null);
    const [seen, setSeen] = useState([]);
    useEffect(() => { if (seen.length >= 2) onDone(); /* eslint-disable-next-line */ }, [seen.length]);
    const pick = (m) => { setMode(m); if (!seen.includes(m)) setSeen([...seen, m]); };
    const ohne = mode === 'ohne';
    const btn = (m, label) => (
        <button type="button" onClick={() => pick(m)} className={`px-4 py-2 rounded-lg font-bold text-sm border-2 ${mode === m ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-violet-700 border-violet-200 hover:bg-violet-50'}`}>{label}</button>
    );
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <p className="text-sm text-slate-600">In einer Urne liegen <b>10 Kugeln, 3 davon rot</b>. Zweimal ziehen. Wähle beide Varianten aus.</p>
            <div className="flex gap-2 flex-wrap">{btn('mit', 'Mit Zurücklegen')}{btn('ohne', 'Ohne Zurücklegen')}</div>
            {mode && (
                <div className="bg-white rounded-lg border border-slate-200 p-3 animate-fade-in">
                    <p className="text-sm text-slate-600 mb-2">{ohne ? 'Die erste rote Kugel bleibt draußen: nur noch 9 Kugeln, 2 davon rot.' : 'Die Kugel kommt zurück: wieder 10 Kugeln, 3 davon rot.'}</p>
                    <p className="font-math text-lg sm:text-xl text-center">P(rot, rot) = <LnF top="3" bot="10" /> · <LnF top={ohne ? '2' : '3'} bot={ohne ? '9' : '10'} /> = <LnF top={ohne ? '6' : '9'} bot={ohne ? '90' : '100'} /> {ohne ? <span>= <LnF top="1" bot="15" /> ≈ 6,7 %</span> : '= 9 %'}</p>
                </div>
            )}
        </div>
    );
};

// Kleines Baumdiagramm (2 Stufen, je 2 Ausgänge)
const LBaum = ({ p1, p2, l1 = 'rot', l2 = 'andere', mitText }) => {
    const node = (x, y, label, col) => <g><circle cx={x} cy={y} r="20" fill={col} stroke="#475569" strokeWidth="1" /><text x={x} y={y + 3.5} fontSize="9.5" textAnchor="middle" fill="#1e293b">{label}</text></g>;
    const edge = (x1, y1, x2, y2, t) => <g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748b" strokeWidth="1.5" /><text x={(x1 + x2) / 2 + (x2 > x1 ? 6 : -6)} y={(y1 + y2) / 2} fontSize="11" textAnchor={x2 > x1 ? 'start' : 'end'} fill="#7c3aed" fontWeight="bold">{t}</text></g>;
    const R = '#fecaca', G = '#e2e8f0';
    return (
        <svg viewBox="0 0 300 190" className="w-full max-w-sm mx-auto">
            {edge(150, 20, 75, 80, p1)}{edge(150, 20, 225, 80, p2)}
            {edge(75, 80, 35, 150, p1)}{edge(75, 80, 115, 150, p2)}
            {edge(225, 80, 185, 150, p1)}{edge(225, 80, 265, 150, p2)}
            {node(150, 20, 'Start', '#fff')}
            {node(75, 80, l1, R)}{node(225, 80, l2, G)}
            {node(35, 150, l1, R)}{node(115, 150, l2, G)}{node(185, 150, l1, R)}{node(265, 150, l2, G)}
            {mitText && <text x="150" y="184" fontSize="10" textAnchor="middle" fill="#64748b">{mitText}</text>}
        </svg>
    );
};

// ==========================================
// LERNKARTEN
// ==========================================
const LN_CARDS = {};

// ---------- Binomische Formeln ----------
LN_CARDS.binformeln = [
    {
        id: 'k1', title: 'Die drei binomischen Formeln',
        body: <>
            <p>Ein Binom ist eine Klammer mit zwei Gliedern, z. B. <M>(a + b)</M>. Für das Quadrat und für das Produkt „plus mal minus“ gibt es drei Formeln, die du auswendig kennen musst:</p>
            <LnBox>
                <div className="space-y-1">
                    <div>1. <M>(a + b)² = a² + 2ab + b²</M></div>
                    <div>2. <M>(a − b)² = a² − 2ab + b²</M></div>
                    <div>3. <M>(a + b)(a − b) = a² − b²</M></div>
                </div>
            </LnBox>
            <p>Das mittlere Glied <M>2ab</M> wird oft vergessen. <M>(a + b)²</M> ist <b>nicht</b> <M>a² + b²</M>.</p>
        </>,
        check: { q: 'Welche Formel passt zu (x − 5)²?', options: ['2. binomische Formel', '1. binomische Formel', '3. binomische Formel'], correct: 0, hint: 'In der Klammer steht ein Minus, und die Klammer wird quadriert.' }
    },
    {
        id: 'k2', title: 'Warum gilt die Formel?',
        body: <>
            <p>Die Formel ist nichts Neues, sondern nur Klammer mal Klammer. Jedes Glied wird mit jedem multipliziert:</p>
            <LnSteps lines={[
                { f: '(a + b)² = (a + b) · (a + b)', e: 'Quadrat heißt: zweimal die Klammer' },
                { f: '= a·a + a·b + b·a + b·b', e: 'jedes mit jedem' },
                { f: '= a² + 2ab + b²', e: 'a·b und b·a sind gleich, also 2ab' }
            ]} />
            <p>Beispiel: <M>(x + 4)² = x² + 2·x·4 + 4² = x² + 8x + 16</M>.</p>
        </>,
        check: { q: 'Was ist das mittlere Glied bei (x + 4)²?', options: [<M>8x</M>, <M>4x</M>, <M>16x</M>], correct: 0, hint: 'Mittleres Glied: 2 · a · b = 2 · x · 4.' }
    },
    {
        id: 'k3', title: 'Zahl vor der Variablen',
        body: <>
            <p>Steht eine Zahl vor der Variablen, dann ist das ganze Stück <M>3x</M> das „a“. Es wird komplett quadriert:</p>
            <LnSteps lines={[
                { f: '(3x + 2)² = (3x)² + 2 · 3x · 2 + 2²', e: 'a = 3x, b = 2' },
                { f: '= 9x² + 12x + 4', e: '(3x)² = 9x², nicht 3x²' }
            ]} />
            <p>Bei der 2. Formel genauso, nur das mittlere Glied bekommt ein Minus: <M>(2x − 3)² = 4x² − 12x + 9</M>.</p>
        </>,
        check: { q: 'Was ergibt (5y − 1)²?', options: [<M>25y² − 10y + 1</M>, <M>25y² − 5y + 1</M>, <M>5y² − 10y + 1</M>], correct: 0, hint: '(5y)² = 25y² und 2 · 5y · 1 = 10y.' }
    },
    {
        id: 'k4', title: 'Plus mal Minus: die 3. Formel',
        body: <>
            <p>Bei <M>(a + b)(a − b)</M> heben sich die mittleren Glieder auf. Übrig bleibt nur die Differenz der Quadrate:</p>
            <LnSteps lines={[
                { f: '(x + 5)(x − 5) = x² − 5x + 5x − 25', e: 'jedes mit jedem' },
                { f: '= x² − 25', e: '−5x und +5x fallen weg' }
            ]} />
            <p>Mit zwei Variablen: <M>(3a + 2b)(3a − 2b) = 9a² − 4b²</M>.</p>
        </>,
        check: { q: 'Was ergibt (y + 7)(y − 7)?', options: [<M>y² − 49</M>, <M>y² − 14y + 49</M>, <M>y² + 49</M>], correct: 0, hint: '3. Formel: a² − b², kein mittleres Glied.' }
    },
    {
        id: 'k5', title: 'Rückwärts: Term in eine Klammer verwandeln',
        body: <>
            <p>In der Prüfung sind oft Lücken zu füllen oder ein Term ist als Klammer zu schreiben. So findest du die Klammer:</p>
            <LnSteps lines={[
                { f: 'x² + 10x + 25', e: 'drei Glieder, letztes positiv: 1. oder 2. Formel' },
                { f: 'a = √x² = x,  b = √25 = 5', e: 'Wurzel aus dem ersten und letzten Glied' },
                { f: 'Probe: 2 · x · 5 = 10x ✓', e: 'mittleres Glied passt' },
                { f: 'x² + 10x + 25 = (x + 5)²', e: 'Plus, weil 10x positiv ist' }
            ]} />
            <p>Nur zwei Glieder mit Minus dazwischen, z. B. <M>x² − 16</M>? Dann ist es die 3. Formel: <M>(x + 4)(x − 4)</M>.</p>
        </>,
        check: { q: 'Welche Klammer gehört zu x² − 16?', options: [<M>(x + 4)(x − 4)</M>, <M>(x − 4)²</M>, <M>(x − 8)(x + 2)</M>], correct: 0, hint: 'Nur zwei Glieder und ein Minus: Differenz der Quadrate.' },
        merke: <>Erst die Formel erkennen (Plus, Minus oder Plus mal Minus), dann <M>a</M> und <M>b</M> bestimmen. Mittleres Glied immer mit <M>2 · a · b</M> prüfen.</>
    }
];

// ---------- Bruchgleichungen ----------
LN_CARDS.bruchgleichungen = [
    {
        id: 'k1', title: 'Was ist eine Bruchgleichung?',
        body: <>
            <p>Eine Bruchgleichung ist eine Gleichung, bei der die Variable <M>x</M> <b>im Nenner</b> steht:</p>
            <LnBox><LnF top="6" bot="x" /> = 3 &nbsp;&nbsp;&nbsp; oder &nbsp;&nbsp;&nbsp; <LnF top="4" bot="x − 2" /> + 1 = <LnF top="x" bot="3" /></LnBox>
            <p>Steht <M>x</M> nur im Zähler, wie bei <M><LnF top="x" bot="2" /> = 3</M>, ist es eine normale Gleichung.</p>
        </>,
        check: { q: 'Welche Gleichung ist eine Bruchgleichung?', options: [<M><LnF top="6" bot="x" /> = 3</M>, <M><LnF top="x" bot="2" /> = 3</M>, <M>2x + 1 = 7</M>], correct: 0, hint: 'x muss unter dem Bruchstrich stehen.' }
    },
    {
        id: 'k2', title: 'Definitionsmenge: Nenner darf nicht 0 werden',
        body: <>
            <p>Durch 0 kann man nicht teilen. Deshalb schließt du zuerst alle Zahlen aus, bei denen ein Nenner 0 wird:</p>
            <LnSteps lines={[
                { f: 'Nenner: x − 2', e: 'jeden Nenner einzeln anschauen' },
                { f: 'x − 2 = 0  →  x = 2', e: 'Nenner gleich 0 setzen' },
                { f: 'D = ℚ \\ {2}', e: 'alle Zahlen außer 2' }
            ]} />
            <p>Mehrere Nenner, mehrere verbotene Zahlen: Bei <M><LnF top="5" bot="x + 3" /> + <LnF top="1" bot="x" /></M> ist <M>D = ℚ \ {'{'}−3; 0{'}'}</M>.</p>
        </>,
        check: { q: 'Definitionsmenge von 7/(x + 4) = 2?', options: [<M>D = ℚ \ {'{'}−4{'}'}</M>, <M>D = ℚ \ {'{'}4{'}'}</M>, <M>D = ℚ \ {'{'}0{'}'}</M>], correct: 0, hint: 'x + 4 = 0 ergibt x = −4.' }
    },
    {
        id: 'k3', title: 'Hauptnenner finden',
        body: <>
            <p>Der Hauptnenner (HN) ist der kleinste Term, in dem alle Nenner stecken. Haben die Nenner nichts gemeinsam, multiplizierst du sie einfach:</p>
            <LnUl items={[
                <>Nenner <M>x</M> und <M>x − 1</M>: HN = <M>x · (x − 1)</M></>,
                <>Nenner <M>2</M> und <M>x − 4</M>: HN = <M>2 · (x − 4)</M></>,
                <>Nenner <M>x</M> und <M>4x</M>: HN = <M>4x</M> (steckt schon in beiden)</>
            ]} />
            <p>Manchmal hilft eine binomische Formel: <M>x² − 9 = (x + 3)(x − 3)</M>. Dann ist <M>x² − 9</M> der Hauptnenner von <M>x + 3</M> und <M>x − 3</M>.</p>
        </>,
        check: { q: 'Hauptnenner von 2/(x + 4) und 5/x?', options: [<M>x · (x + 4)</M>, <M>x + 4</M>, <M>2x + 4</M>], correct: 0, hint: 'Die Nenner x und x + 4 haben nichts gemeinsam, also multiplizieren.' }
    },
    {
        id: 'k4', title: 'Mit dem Hauptnenner multiplizieren',
        body: <>
            <p>Multiplizierst du die ganze Gleichung mit dem Hauptnenner, verschwinden die Brüche. Dann löst du wie gewohnt:</p>
            <LnSteps lines={[
                { f: '6/x = 3        | · x', e: 'D = ℚ \\ {0}, HN = x' },
                { f: '6 = 3x', e: 'links kürzt sich x weg' },
                { f: 'x = 2', e: 'durch 3 teilen' },
                { f: '2 ∈ D  →  L = {2}', e: 'Probe mit der Definitionsmenge' }
            ]} />
            <p>Wichtig: <b>Jeder</b> Summand wird mit dem Hauptnenner multipliziert, auch die Zahlen ohne Bruch.</p>
        </>,
        check: { q: 'Löse 10/(x − 1) = 5. Was ist x?', options: [<M>x = 3</M>, <M>x = 2</M>, <M>x = 5</M>], correct: 0, hint: 'Mal (x − 1): 10 = 5x − 5, also 5x = 15.' }
    },
    {
        id: 'k5', title: 'Wenn x² auftaucht',
        body: <>
            <p>Oft bleibt nach dem Multiplizieren eine quadratische Gleichung übrig. Dann bringst du alles auf eine Seite und nutzt die Lösungsformel:</p>
            <LnSteps lines={[
                { f: 'x + 6/x = 5        | · x', e: 'D = ℚ \\ {0}' },
                { f: 'x² + 6 = 5x', e: 'Brüche weg' },
                { f: 'x² − 5x + 6 = 0', e: 'alles auf eine Seite' },
                { f: 'x₁ = 2,  x₂ = 3', e: 'Lösungsformel oder pq-Formel' },
                { f: 'L = {2; 3}', e: 'beide liegen in D' }
            ]} />
            <p>Liegt eine Lösung <b>nicht</b> in D, streichst du sie. Sie gehört nicht zur Lösungsmenge.</p>
        </>,
        check: { q: 'Was prüfst du ganz am Ende?', options: ['Ob jede Lösung in der Definitionsmenge liegt', 'Ob die Lösung positiv ist', 'Ob die Lösung eine ganze Zahl ist'], correct: 0, hint: 'Eine Lösung, die einen Nenner 0 macht, fällt weg.' },
        merke: <>Reihenfolge: 1. Definitionsmenge, 2. Hauptnenner, 3. alles mit dem HN multiplizieren, 4. Gleichung lösen, 5. Lösungen mit D vergleichen.</>
    }
];

// ---------- Halbwertszeit ----------
LN_CARDS.halbwertszeit = [
    {
        id: 'k1', title: 'Was heißt Halbwertszeit?',
        body: <>
            <p>Die Halbwertszeit <M>T</M> ist die Zeit, nach der von einem Stoff nur noch die <b>Hälfte</b> übrig ist. Nach der nächsten Halbwertszeit halbiert es sich wieder.</p>
        </>,
        widget: LHalbLab, needsWidget: true,
        check: { q: 'Nach 2 Halbwertszeiten ist noch übrig …', options: ['ein Viertel', 'die Hälfte', 'nichts mehr'], correct: 0, hint: 'Halbieren und noch einmal halbieren: 1/2 · 1/2.' }
    },
    {
        id: 'k2', title: 'Die Formel',
        body: <>
            <LnBox>W(t) = W₀ · 0,5<sup>t / T</sup></LnBox>
            <p><M>W₀</M> ist die Anfangsmenge, <M>t</M> die vergangene Zeit und <M>T</M> die Halbwertszeit. Der Exponent <M>t / T</M> zählt, wie viele Halbwertszeiten vergangen sind.</p>
            <LnSteps lines={[
                { f: 'W₀ = 90 mg,  T = 3 h,  t = 6 h', e: 'Werte herauslesen' },
                { f: 'W = 90 · 0,5^(6/3) = 90 · 0,5²', e: '6 : 3 = 2 Halbwertszeiten' },
                { f: 'W = 90 · 0,25 = 22,5 mg', e: 'Ergebnis' }
            ]} />
        </>,
        check: { q: 't = 12 h und T = 3 h. Welcher Exponent steht an der 0,5?', options: ['4', '36', '3'], correct: 0, hint: 'Exponent = t / T = 12 : 3.' }
    },
    {
        id: 'k3', title: 'Wenn es nicht aufgeht',
        body: <>
            <p>Meist ist <M>t / T</M> keine ganze Zahl. Das ist kein Problem, der Taschenrechner rechnet auch mit <M>0,5<sup>2,6</sup></M>:</p>
            <LnSteps lines={[
                { f: 'W₀ = 3,675 kg,  T = 5 Jahre,  t = 13 Jahre', e: 'Kobalt-60' },
                { f: 'W = 3,675 · 0,5^(13/5)', e: '13 : 5 = 2,6' },
                { f: 'W = 3,675 · 0,5^2,6 ≈ 0,606 kg', e: 'Taschenrechner: 0,5 ^ (13 ÷ 5)' }
            ]} />
            <p>Tipp: Setze beim Eintippen <b>Klammern um den Exponenten</b>: 0,5 ^ (13 ÷ 5).</p>
        </>,
        check: { q: 'Wie tippst du 0,5 hoch 13/5 richtig ein?', options: ['0,5 ^ (13 ÷ 5)', '0,5 ^ 13 ÷ 5', '(0,5 ^ 13) ÷ 5'], correct: 0, hint: 'Ohne Klammer rechnet der Taschenrechner erst 0,5 hoch 13.' }
    },
    {
        id: 'k4', title: 'Anfangsmenge gesucht',
        body: <>
            <p>Ist die Restmenge bekannt und die Anfangsmenge gesucht, stellst du die Formel um: durch <M>0,5<sup>t/T</sup></M> teilen.</p>
            <LnSteps lines={[
                { f: 'W = 16,25 g,  T = 8 h,  t = 40 h', e: 'W₀ ist gesucht' },
                { f: '16,25 = W₀ · 0,5^(40/8)', e: 'einsetzen' },
                { f: 'W₀ = 16,25 : 0,5^5 = 16,25 : 0,03125', e: 'durch die Potenz teilen' },
                { f: 'W₀ = 520 g', e: 'Ergebnis' }
            ]} />
        </>,
        check: { q: 'Wie berechnest du W₀?', options: [<M>W₀ = W : 0,5<sup>t/T</sup></M>, <M>W₀ = W · 0,5<sup>t/T</sup></M>, <M>W₀ = W − 0,5<sup>t/T</sup></M>], correct: 0, hint: 'Die Potenz steht als Faktor bei W₀. Ein Faktor wird durch Teilen entfernt.' }
    },
    {
        id: 'k5', title: 'Zeit gesucht: der Logarithmus',
        body: <>
            <p>Ist die Zeit <M>t</M> gesucht, steht die Unbekannte im Exponenten. Da hilft der Logarithmus (Taste <b>log</b>):</p>
            <LnSteps lines={[
                { f: 'W₀ = 90 mg,  W = 5,7 mg,  T = 3 h', e: 't ist gesucht' },
                { f: '5,7 = 90 · 0,5^(t/3)        | : 90', e: 'einsetzen' },
                { f: '0,5^(t/3) = 0,0633…', e: '5,7 : 90' },
                { f: 't/3 = log(0,0633…) : log(0,5) ≈ 3,98', e: 'Logarithmus holt den Exponenten herunter' },
                { f: 't ≈ 3,98 · 3 ≈ 12 h', e: 'mal T' }
            ]} />
        </>,
        check: { q: 'Welche Rechenart holt t aus dem Exponenten?', options: ['Logarithmus', 'Wurzel', 'Quadrieren'], correct: 0, hint: 'Wurzel hilft, wenn die Basis gesucht ist. Für den Exponenten brauchst du log.' },
        merke: <>Immer dieselbe Formel <M>W = W₀ · 0,5<sup>t/T</sup></M>. Gesucht <M>W</M>: einsetzen. Gesucht <M>W₀</M>: teilen. Gesucht <M>t</M>: log(W : W₀) : log(0,5) · T.</>
    }
];

// ---------- Wachstum & Zerfall ----------
LN_CARDS.wachstum = [
    {
        id: 'k1', title: 'Der Wachstumsfaktor q',
        body: <>
            <p>Wächst etwas jedes Jahr um <M>p %</M>, dann wird es jedes Jahr mit demselben Faktor <M>q</M> multipliziert:</p>
            <LnBox><div className="space-y-1"><div>Zunahme: <M>q = 1 + <LnF top="p" bot="100" /></M></div><div>Abnahme: <M>q = 1 − <LnF top="p" bot="100" /></M></div></div></LnBox>
            <p>3,5 % Zuwachs: <M>q = 1,035</M>. 12,7 % Wertverlust: <M>q = 0,873</M>.</p>
        </>,
        widget: LWachstumLab, needsWidget: true,
        check: { q: 'Ein Kapital wächst jährlich um 4,9 %. Wie groß ist q?', options: ['1,049', '1,49', '0,951'], correct: 0, hint: '4,9 % = 0,049, dazu die 1.' }
    },
    {
        id: 'k2', title: 'Die Formel: Endwert berechnen',
        body: <>
            <LnBox>W<sub>n</sub> = W₀ · q<sup>n</sup></LnBox>
            <p><M>W₀</M> Anfangswert, <M>n</M> Anzahl der Jahre, <M>W<sub>n</sub></M> Wert nach <M>n</M> Jahren.</p>
            <LnSteps lines={[
                { f: 'W₀ = 1000 €,  p = 4,9 %,  n = 4', e: 'q = 1,049' },
                { f: 'W₄ = 1000 · 1,049⁴', e: 'einsetzen' },
                { f: 'W₄ ≈ 1211,29 €', e: 'Taschenrechner: 1000 × 1,049 ^ 4' }
            ]} />
        </>,
        check: { q: 'Ein Auto verliert jährlich 12,7 % an Wert. Welcher Faktor q?', options: ['0,873', '1,127', '0,127'], correct: 0, hint: 'Abnahme: 1 − 0,127.' }
    },
    {
        id: 'k3', title: 'Anfangswert gesucht',
        body: <>
            <p>Ist der Endwert bekannt und der Anfangswert gesucht, teilst du durch <M>q<sup>n</sup></M>:</p>
            <LnSteps lines={[
                { f: 'W₅ = 1500 €,  p = 3 %,  n = 5', e: 'q = 1,03, W₀ gesucht' },
                { f: '1500 = W₀ · 1,03⁵', e: 'einsetzen' },
                { f: 'W₀ = 1500 : 1,03⁵ ≈ 1293,91 €', e: 'durch die Potenz teilen' }
            ]} />
        </>,
        check: { q: 'Wie berechnest du W₀?', options: [<M>W₀ = W<sub>n</sub> : q<sup>n</sup></M>, <M>W₀ = W<sub>n</sub> · q<sup>n</sup></M>, <M>W₀ = W<sub>n</sub> − q<sup>n</sup></M>], correct: 0, hint: 'q hoch n ist ein Faktor. Faktor weg heißt teilen.' }
    },
    {
        id: 'k4', title: 'Prozentsatz gesucht: die Wurzel',
        body: <>
            <p>Sind Anfangs- und Endwert bekannt und der jährliche Prozentsatz gesucht, brauchst du die <M>n</M>-te Wurzel:</p>
            <LnSteps lines={[
                { f: '88 Mio. → 101 Mio. in 9 Jahren', e: 'p gesucht' },
                { f: 'q⁹ = 101 : 88 = 1,1477…', e: 'Formel durch W₀ teilen' },
                { f: 'q = ⁹√1,1477… = 1,1477…^(1/9) ≈ 1,0154', e: 'Wurzel = hoch 1/n' },
                { f: 'p ≈ 1,5 % pro Jahr', e: 'q − 1, mal 100' }
            ]} />
            <p>Taschenrechner: <b>1,1477 ^ (1 ÷ 9)</b> oder die Wurzeltaste mit Index.</p>
        </>,
        check: { q: 'Woran erkennst du, dass p gesucht ist?', options: ['Es wird nach dem jährlichen Zuwachs „in Prozent“ gefragt', 'Es wird nach Jahren gefragt', 'Es wird nach dem Endwert gefragt'], correct: 0, hint: 'Jahre gesucht heißt Logarithmus, Prozent gesucht heißt Wurzel.' }
    },
    {
        id: 'k5', title: 'Zeit gesucht: der Logarithmus',
        body: <>
            <p>Ist die Anzahl der Jahre gesucht, steht <M>n</M> im Exponenten. Dafür gibt es den Logarithmus:</p>
            <LnSteps lines={[
                { f: '5000 hl → 10 000 hl bei 6 % pro Jahr', e: 'n gesucht, q = 1,06' },
                { f: '1,06ⁿ = 10 000 : 5000 = 2', e: 'durch W₀ teilen' },
                { f: 'n = log(2) : log(1,06) ≈ 11,9', e: 'log auf beide Seiten' },
                { f: 'nach 12 Jahren', e: 'auf volle Jahre aufrunden' }
            ]} />
            <p>„Verdoppeln“ heißt <M>W<sub>n</sub> : W₀ = 2</M>, „verdreifachen“ 3, „halbieren“ 0,5.</p>
        </>,
        check: { q: '„Nach wie vielen Jahren verdreifacht sich das Kapital?“ Welche Zahl steht dann für Wn : W0?', options: ['3', '0,3', '300'], correct: 0, hint: 'Dreimal so viel wie am Anfang.' },
        merke: <>Eine Formel, vier Fälle: <M>W<sub>n</sub></M> gesucht: einsetzen. <M>W₀</M> gesucht: teilen. <M>p</M> gesucht: Wurzel. <M>n</M> gesucht: Logarithmus.</>
    }
];

// ---------- Kugel ----------
LN_CARDS.kugel = [
    {
        id: 'k1', title: 'Radius und Durchmesser',
        body: <>
            <p>Bei der Kugel gibt es nur eine wichtige Länge: den Radius <M>r</M>. Der Durchmesser <M>d</M> geht einmal durch die Mitte und ist doppelt so lang.</p>
            <LnBox>r = d : 2 &nbsp;&nbsp;&nbsp;&nbsp; d = 2 · r</LnBox>
            <p>Steht in der Aufgabe ein Durchmesser, rechne <b>zuerst</b> den Radius aus. Alle Formeln brauchen <M>r</M>.</p>
        </>,
        check: { q: 'Eine Kugel hat den Durchmesser 12 cm. Wie groß ist r?', options: ['6 cm', '24 cm', '12 cm'], correct: 0, hint: 'Radius ist die Hälfte des Durchmessers.' }
    },
    {
        id: 'k2', title: 'Volumen der Kugel',
        body: <>
            <LnBox>V = <LnF top="4" bot="3" /> · π · r³</LnBox>
            <p>Das Volumen wird in cm³, dm³ oder Litern angegeben (1 dm³ = 1 Liter). Probiere aus, was passiert, wenn du den Radius verdoppelst.</p>
        </>,
        widget: LKugelLab, needsWidget: true,
        check: { q: 'Der Radius wird verdoppelt. Wie ändert sich das Volumen?', options: ['Es wird 8-mal so groß', 'Es wird doppelt so groß', 'Es wird 4-mal so groß'], correct: 0, hint: 'r³ mit doppeltem r: 2 · 2 · 2 = 8.' }
    },
    {
        id: 'k3', title: 'Oberfläche der Kugel',
        body: <>
            <LnBox>O = 4 · π · r²</LnBox>
            <p>Die Oberfläche ist eine Fläche, also cm² oder m². Sie ist genau viermal so groß wie der Kreis mit demselben Radius.</p>
            <LnSteps lines={[
                { f: 'r = 5 cm', e: 'gegeben' },
                { f: 'O = 4 · π · 5² = 4 · π · 25', e: 'erst quadrieren' },
                { f: 'O ≈ 314,2 cm²', e: 'auf eine Stelle gerundet' }
            ]} />
        </>,
        check: { q: 'Welche Einheit hat die Oberfläche einer Kugel mit r in cm?', options: ['cm²', 'cm³', 'cm'], correct: 0, hint: 'Fläche: hoch 2. Volumen: hoch 3.' }
    },
    {
        id: 'k4', title: 'Rückwärts: Radius aus V oder O',
        body: <>
            <p>Ist das Volumen oder die Oberfläche gegeben, stellst du die Formel nach <M>r</M> um:</p>
            <LnBox><div className="space-y-2"><div>r = ³√( 3 · V : (4 · π) )</div><div>r = √( O : (4 · π) )</div></div></LnBox>
            <LnSteps lines={[
                { f: 'V = 500 cm³', e: 'r gesucht' },
                { f: '3 · 500 : (4 · π) = 119,37…', e: 'erst die Klammer' },
                { f: 'r = ³√119,37… ≈ 4,92 cm', e: 'dritte Wurzel, weil r³' }
            ]} />
            <p>Bei der Oberfläche steht <M>r²</M>, deshalb die normale Wurzel.</p>
        </>,
        check: { q: 'Die Oberfläche ist 200 cm². Wie rechnest du r aus?', options: [<M>r = √(200 : (4 · π))</M>, <M>r = ³√(200 : (4 · π))</M>, <M>r = 200 : (4 · π)</M>], correct: 0, hint: 'In der Oberflächenformel steht r², also Quadratwurzel.' }
    },
    {
        id: 'k5', title: 'Halbkugel, Masse und Vergleiche',
        body: <>
            <p>Halbkugel: alles halbieren, nur die Oberfläche bekommt den Deckel dazu:</p>
            <LnUl items={[
                <>Volumen Halbkugel: <M>V = <LnF top="2" bot="3" /> · π · r³</M></>,
                <>Gewölbte Fläche: <M>2 · π · r²</M>, mit Deckel (Kreis): <M>3 · π · r²</M></>,
                <>Masse: <M>m = V · ρ</M> (Dichte ρ in g/cm³, dann V in cm³)</>
            ]} />
            <LnSteps lines={[
                { f: 'Stahlkugel r = 3 cm, ρ = 7,8 g/cm³', e: 'Masse gesucht' },
                { f: 'V = 4/3 · π · 3³ ≈ 113,1 cm³', e: 'erst das Volumen' },
                { f: 'm = 113,1 · 7,8 ≈ 882 g', e: 'Volumen mal Dichte' }
            ]} />
            <p>Kugel in Zylinder oder Würfel: Rechne beide Volumen aus und vergleiche (Differenz oder Anteil in Prozent).</p>
        </>,
        check: { q: 'Wie berechnest du die Masse einer Kugel?', options: [<M>m = V · ρ</M>, <M>m = O · ρ</M>, <M>m = V : ρ</M>], correct: 0, hint: 'Dichte sagt: Gramm pro cm³. Also Volumen mal Dichte.' },
        merke: <>Immer zuerst <M>r</M> klären. <M>V = <LnF top="4" bot="3" />πr³</M>, <M>O = 4πr²</M>. Rückwärts: dritte Wurzel bei V, Quadratwurzel bei O.</>
    }
];

// ---------- Potenzen ----------
LN_CARDS.potenzen = [
    {
        id: 'k1', title: 'Was eine Potenz bedeutet',
        body: <>
            <p>Eine Potenz ist eine abgekürzte Multiplikation: <M>x³ = x · x · x</M>. Die kleine Zahl heißt Exponent, die große Basis.</p>
            <LnUl items={[
                <><M>x¹ = x</M></>,
                <><M>x⁰ = 1</M> (jede Zahl hoch 0 ist 1)</>,
                <><M>3x²</M> heißt <M>3 · x · x</M>, die 3 wird nicht quadriert</>
            ]} />
        </>,
        check: { q: 'Was ist y⁰?', options: ['1', '0', 'y'], correct: 0, hint: 'Hoch 0 ergibt immer 1.' }
    },
    {
        id: 'k2', title: 'Malnehmen: Exponenten addieren',
        body: <>
            <p>Gleiche Basis mal gleiche Basis: Die Exponenten werden <b>addiert</b>, die Zahlen davor ganz normal multipliziert.</p>
            <LnSteps lines={[
                { f: 'x³ · x² = (x·x·x) · (x·x) = x⁵', e: '3 + 2 = 5' },
                { f: '3x² · 4x⁵ = 12x⁷', e: '3 · 4 = 12 und 2 + 5 = 7' },
                { f: '2x³y · 5xy⁴ = 10x⁴y⁵', e: 'jede Variable einzeln (x: 3+1, y: 1+4)' }
            ]} />
        </>,
        check: { q: 'Was ergibt 2a³ · 5a⁴?', options: [<M>10a⁷</M>, <M>10a¹²</M>, <M>7a⁷</M>], correct: 0, hint: 'Zahlen malnehmen, Exponenten addieren.' }
    },
    {
        id: 'k3', title: 'Teilen: Exponenten subtrahieren',
        body: <>
            <p>Beim Teilen (Bruchstrich) werden die Exponenten <b>subtrahiert</b>: oben minus unten.</p>
            <LnSteps lines={[
                { f: 'x⁵ : x² = x³', e: '5 − 2 = 3, drei x kürzen sich weg' },
                { f: '12x⁷ : 4x³ = 3x⁴', e: '12 : 4 = 3 und 7 − 3 = 4' },
                { f: '15x⁴y² : 5xy² = 3x³', e: 'y² : y² = y⁰ = 1, fällt weg' }
            ]} />
        </>,
        check: { q: 'Was ergibt y⁶ : y²?', options: [<M>y⁴</M>, <M>y³</M>, <M>y⁸</M>], correct: 0, hint: 'Teilen: 6 − 2.' }
    },
    {
        id: 'k4', title: 'Negative Exponenten',
        body: <>
            <p>Ist der untere Exponent größer, wird das Ergebnis negativ. Ein negativer Exponent heißt „1 durch“:</p>
            <LnSteps lines={[
                { f: 'x² : x⁵ = x^(2−5) = x⁻³', e: 'Exponenten subtrahieren' },
                { f: 'x⁻³ = 1 / x³', e: 'negativer Exponent = Bruch' },
                { f: '4x⁻² · 3x⁵ = 12x³', e: '−2 + 5 = 3, auch mit Minus addieren' }
            ]} />
            <p>Minus minus macht plus: <M>x³ : x⁻² = x^(3−(−2)) = x⁵</M>.</p>
        </>,
        check: { q: 'Was ergibt x³ : x⁵?', options: [<M>x⁻²</M>, <M>x²</M>, <M>x⁻⁸</M>], correct: 0, hint: '3 − 5 = −2.' }
    },
    {
        id: 'k5', title: 'Großer Bruchterm in drei Schritten',
        body: <>
            <p>In der Prüfung steht ein Bruch mit mehreren Faktoren oben und unten. So geht es sicher:</p>
            <LnSteps lines={[
                { f: '(6x³y · 2x²y⁴) : (4xy²)', e: 'Aufgabe' },
                { f: 'Zahlen: oben 6 · 2 = 12, unten 4', e: '1. Zahlen zusammenfassen' },
                { f: 'oben: x⁵y⁵, unten: x¹y²', e: '2. Exponenten oben und unten addieren' },
                { f: '12x⁵y⁵ : 4xy² = 3x⁴y³', e: '3. Zahlen kürzen, Exponenten subtrahieren' }
            ]} />
        </>,
        check: { q: 'In welcher Reihenfolge gehst du vor?', options: ['Zahlen zusammenfassen, Exponenten addieren, dann oben minus unten', 'Erst alle Exponenten subtrahieren, dann Zahlen', 'Alle Exponenten addieren, Zahlen weglassen'], correct: 0, hint: 'Erst Zähler und Nenner einzeln ordnen, dann kürzen.' },
        merke: <>Mal: Exponenten <b>plus</b>. Geteilt: Exponenten <b>minus</b>. Zahlen davor rechnest du ganz normal. <M>x⁰ = 1</M>, <M>x⁻ⁿ = 1 : xⁿ</M>.</>
    }
];

// ---------- Trigonometrie ----------
LN_CARDS.trigonometrie = [
    {
        id: 'k1', title: 'Seiten im rechtwinkligen Dreieck',
        body: <>
            <p>Alle Formeln hier gelten nur im <b>rechtwinkligen</b> Dreieck. Die Seiten haben feste Namen, bezogen auf den Winkel α:</p>
            <LnUl items={[
                <><b>Hypotenuse</b>: die längste Seite, gegenüber dem rechten Winkel</>,
                <><b>Gegenkathete</b>: liegt dem Winkel α gegenüber</>,
                <><b>Ankathete</b>: liegt am Winkel α an (und ist nicht die Hypotenuse)</>
            ]} />
        </>,
        widget: LTrigLab, needsWidget: true,
        check: { q: 'Wie heißt die längste Seite im rechtwinkligen Dreieck?', options: ['Hypotenuse', 'Ankathete', 'Gegenkathete'], correct: 0, hint: 'Sie liegt gegenüber dem rechten Winkel.' }
    },
    {
        id: 'k2', title: 'Sinus, Kosinus, Tangens',
        body: <>
            <LnBox>
                <div className="space-y-2">
                    <div>sin α = <LnF top="Gegenkathete" bot="Hypotenuse" /></div>
                    <div>cos α = <LnF top="Ankathete" bot="Hypotenuse" /></div>
                    <div>tan α = <LnF top="Gegenkathete" bot="Ankathete" /></div>
                </div>
            </LnBox>
            <p>Merkhilfe: <b>GAGA HühnerHof AG</b>: sin = G/H, cos = A/H, tan = G/A.</p>
            <p>Welche Formel? Schau, welche zwei Seiten in der Aufgabe vorkommen (gegeben und gesucht).</p>
        </>,
        check: { q: 'Gegeben sind Hypotenuse und Ankathete. Welche Formel passt?', options: ['Kosinus', 'Sinus', 'Tangens'], correct: 0, hint: 'cos = Ankathete durch Hypotenuse.' }
    },
    {
        id: 'k3', title: 'Eine Seite berechnen',
        body: <>
            <LnSteps lines={[
                { f: 'c = 10 cm, α = 35°, gesucht: a (Gegenkathete)', e: 'Gegenkathete und Hypotenuse: Sinus' },
                { f: 'sin 35° = a / 10', e: 'Formel aufschreiben' },
                { f: 'a = 10 · sin 35° ≈ 5,74 cm', e: 'mal 10 auf beiden Seiten' }
            ]} />
            <p>Ist die Hypotenuse gesucht, steht sie unten: <M>sin α = a / c</M>, also <M>c = a : sin α</M>.</p>
            <p>Taschenrechner auf <b>DEG</b> (Grad) stellen!</p>
        </>,
        check: { q: 'Gegeben α und c. Wie berechnest du die Ankathete b?', options: [<M>b = c · cos α</M>, <M>b = c · sin α</M>, <M>b = c : cos α</M>], correct: 0, hint: 'cos α = b / c, dann mal c.' }
    },
    {
        id: 'k4', title: 'Einen Winkel berechnen',
        body: <>
            <p>Sind zwei Seiten bekannt, bekommst du erst den Wert von sin, cos oder tan. Den Winkel liefert die Umkehrtaste (<b>sin⁻¹</b>, <b>cos⁻¹</b>, <b>tan⁻¹</b>, meist über SHIFT):</p>
            <LnSteps lines={[
                { f: 'a = 4 cm, c = 7 cm, gesucht: α', e: 'Gegenkathete und Hypotenuse: Sinus' },
                { f: 'sin α = 4 / 7 = 0,5714…', e: 'Bruch ausrechnen' },
                { f: 'α = sin⁻¹(0,5714…) ≈ 34,8°', e: 'Umkehrtaste' }
            ]} />
            <p>Zwei Katheten bekannt? Dann Tangens: <M>tan α = a / b</M>.</p>
        </>,
        check: { q: 'Welche Taste macht aus 0,5714 den Winkel?', options: ['sin⁻¹ (SHIFT + sin)', 'sin', '1 ÷ sin'], correct: 0, hint: 'Umkehrfunktion, nicht Kehrwert.' }
    },
    {
        id: 'k5', title: 'Höhensatz und Kathetensatz',
        body: <>
            <p>Die Höhe <M>h</M> teilt die Hypotenuse <M>c</M> in die Abschnitte <M>p</M> (unter <M>a</M>) und <M>q</M> (unter <M>b</M>). Dann gilt:</p>
            <LnBox><div className="space-y-2"><div>Höhensatz: h² = p · q</div><div>Kathetensatz: a² = c · p &nbsp;&nbsp; b² = c · q</div></div></LnBox>
            <LnSteps lines={[
                { f: 'p = 4 cm, q = 9 cm', e: 'gesucht h und a' },
                { f: 'h² = 4 · 9 = 36  →  h = 6 cm', e: 'Höhensatz, dann Wurzel' },
                { f: 'c = 4 + 9 = 13;  a² = 13 · 4 = 52  →  a ≈ 7,21 cm', e: 'Kathetensatz' }
            ]} />
        </>,
        check: { q: 'Was gilt nach dem Kathetensatz für a²?', options: [<M>a² = c · p</M>, <M>a² = p · q</M>, <M>a² = c · q</M>], correct: 0, hint: 'Kathete hoch 2 = Hypotenuse mal Abschnitt auf derselben Seite.' },
        merke: <>Seite gesucht: Formel wählen (GAGA HühnerHof AG), einsetzen, umstellen. Winkel gesucht: Bruch ausrechnen, dann Umkehrtaste. Mit h, p, q: Höhensatz <M>h² = p·q</M>, Kathetensatz <M>a² = c·p</M>.</>
    }
];

// ---------- Wahrscheinlichkeit ----------
LN_CARDS.wahrscheinlichkeit = [
    {
        id: 'k1', title: 'Wahrscheinlichkeit als Bruch',
        body: <>
            <LnBox>P = <LnF top="günstige Ergebnisse" bot="alle möglichen Ergebnisse" /></LnBox>
            <p>Glücksrad mit 10 gleich großen Feldern, 3 davon rot: <M>P(rot) = <LnF top="3" bot="10" /> = 0,3 = 30 %</M>.</p>
            <p>Die Wahrscheinlichkeit liegt immer zwischen 0 (unmöglich) und 1 (sicher). Als Prozent: Bruch mal 100.</p>
        </>,
        check: { q: 'Von 16 Losen sind 4 blau. Wie groß ist P(blau)?', options: [<M><LnF top="1" bot="4" /> = 25 %</M>, <M>4 %</M>, <M><LnF top="1" bot="16" /></M>], correct: 0, hint: '4 von 16, gekürzt 1 von 4.' }
    },
    {
        id: 'k2', title: 'Zweimal ziehen: das Baumdiagramm',
        body: <>
            <p>Wird zweimal gezogen oder gedreht, ist das ein zweistufiges Zufallsexperiment. Das Baumdiagramm zeigt alle Wege:</p>
            <LBaum p1="3/10" p2="7/10" mitText="Glücksrad: 3 von 10 Feldern rot, zweimal drehen" />
            <p>Jede Stufe ist ein Zug. An jedem Ast steht die Wahrscheinlichkeit. Die Äste von einem Punkt ergeben zusammen immer 1.</p>
        </>,
        check: { q: 'Wie viele Pfade hat ein Baum mit 2 Stufen und je 2 Ausgängen?', options: ['4', '2', '8'], correct: 0, hint: '2 · 2 Wege von oben nach unten.' }
    },
    {
        id: 'k3', title: 'Pfadregel: entlang des Pfades multiplizieren',
        body: <>
            <p>Die Wahrscheinlichkeit eines Pfades ist das Produkt der Wahrscheinlichkeiten an seinen Ästen:</p>
            <LnSteps lines={[
                { f: 'P(rot, rot) = 3/10 · 3/10', e: 'Pfad rot → rot' },
                { f: '= 9/100 = 9 %', e: 'Zähler mal Zähler, Nenner mal Nenner' },
                { f: 'P(rot, andere) = 3/10 · 7/10 = 21/100 = 21 %', e: 'anderer Pfad' }
            ]} />
        </>,
        check: { q: 'Was ergibt 1/2 · 1/3?', options: [<M><LnF top="1" bot="6" /></M>, <M><LnF top="2" bot="5" /></M>, <M><LnF top="5" bot="6" /></M>], correct: 0, hint: 'Brüche multiplizieren: Zähler mal Zähler, Nenner mal Nenner.' }
    },
    {
        id: 'k4', title: 'Mit oder ohne Zurücklegen?',
        body: <>
            <p>Beim Glücksrad bleibt alles gleich (mit Zurücklegen). Werden Kugeln, Lose oder Gummibärchen herausgenommen und <b>nicht</b> zurückgelegt, ändern sich die Brüche in der zweiten Stufe: Der Nenner wird um 1 kleiner und beim gleichen Ergebnis auch der Zähler.</p>
        </>,
        widget: LZiehLab, needsWidget: true,
        check: { q: '10 Kugeln, ohne Zurücklegen. Welcher Nenner steht in der 2. Stufe?', options: ['9', '10', '8'], correct: 0, hint: 'Eine Kugel ist schon draußen.' }
    },
    {
        id: 'k5', title: 'Mehrere Pfade: Summenregel',
        body: <>
            <p>Passen mehrere Pfade zur Frage, werden ihre Wahrscheinlichkeiten <b>addiert</b>. Beispiel: 10 Kugeln, 3 rot, ohne Zurücklegen. „Genau eine rote Kugel“:</p>
            <LnSteps lines={[
                { f: 'Pfad 1: rot, andere:  3/10 · 7/9 = 21/90', e: 'erst rot, dann andere' },
                { f: 'Pfad 2: andere, rot:  7/10 · 3/9 = 21/90', e: 'erst andere, dann rot' },
                { f: 'P = 21/90 + 21/90 = 42/90 = 7/15 ≈ 46,7 %', e: 'beide Pfade addieren' }
            ]} />
            <p>„Mindestens eine rote“ geht schneller über das Gegenteil: <M>1 − P(keine rote)</M>.</p>
        </>,
        check: { q: '„Beide Kugeln haben verschiedene Farben.“ Was tust du?', options: ['Die passenden Pfade addieren', 'Nur einen Pfad nehmen', 'Die Pfade multiplizieren'], correct: 0, hint: 'rot-andere und andere-rot passen beide.' },
        merke: <>Baum zeichnen, Brüche an die Äste (ohne Zurücklegen: Nenner −1). Entlang eines Pfades <b>mal</b>, mehrere Pfade <b>plus</b>.</>
    }
];
