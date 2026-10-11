// ==========================================
// lernen-lineare.js — Lernkarten „Lineare Funktionen“
// Wird nach lernen-kern.js und vor lineare-funktionen.js inline kompiliert.
// LF_LEARN_BUILD() liefert die Karten je Thema (erst beim Rendern aufgerufen).
// ==========================================

// Geraden-Labor: m und t per Regler, Steigungsdreieck und Gleichung live.
// target: { m, t } — Aufgabe; sobald sie erreicht ist, wird onDone() gerufen.
const LLGeradeLab = ({ onDone, target, start = { m: 1, t: 1 }, showTriangle = true, done }) => {
    const [m, setM] = useState(start.m);
    const [tt, setT] = useState(start.t);
    const g = { m, t: tt, n: 'g' };
    const hit = !!target && lfSame(m, target.m) && lfSame(tt, target.t);
    useEffect(() => { if (onDone && (!target || hit)) onDone(); /* eslint-disable-next-line */ }, [hit]);
    const pts = showTriangle ? [{ x: 0, y: tt, n: 'P', color: '#16a34a' }, { x: 1, y: tt + m, n: 'Q', color: '#dc2626' }] : [];
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
            <div className="grid md:grid-cols-2 gap-4 items-center">
                <Koord range={[-6, 6, -6, 6]} lines={[g, ...(showTriangle ? [{ m: 0, t: tt, dash: true, color: '#94a3b8' }] : [])]} points={pts} />
                <div className="space-y-3">
                    <LnSlider label="m" value={m} min={-3} max={3} step={0.5} onChange={setM} />
                    <LnSlider label="t" value={tt} min={-5} max={5} step={1} onChange={setT} />
                    <div className="bg-white border border-slate-200 rounded-lg p-3 font-math text-base sm:text-lg space-y-1">
                        <div>g: {lfGlS(m, tt)}</div>
                        <div className="text-sm font-sans text-slate-600">Schnitt mit der y-Achse: (0 | {lfS(tt)}){showTriangle && <> · Steigungsdreieck: {lfSlopeWalk(m)}</>}</div>
                    </div>
                    {target && (
                        <div className={`text-sm sm:text-base font-bold ${hit || done ? 'text-green-700' : 'text-slate-700'}`}>
                            {hit || done ? '✓ Genau richtig!' : <>Aufgabe: Stelle die Gerade {lfGlS(target.m, target.t)} ein.</>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Wertetabelle zum Aufdecken für eine Gerade
const LLTabelleLab = ({ g, xs, onDone }) => {
    const [shown, setShown] = useState([]);
    const all = shown.length >= xs.length;
    useEffect(() => { if (all && onDone) onDone(); /* eslint-disable-next-line */ }, [all]);
    const t = themeColors[FK.theme];
    const val = (x) => lfR(g.m * x + g.t);
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
            <p className="text-sm text-slate-600 mb-2">Tippe auf ein Fragezeichen — die Rechnung erscheint darunter.</p>
            <div className="overflow-x-auto">
                <table className="mx-auto border-collapse font-math text-lg bg-white"><tbody>
                    <tr><th className={`border-2 border-slate-300 bg-${FK.theme}-50 px-3 py-2`}><V>x</V></th>{xs.map(x => <td key={x} className="border-2 border-slate-300 px-3 py-2 text-center min-w-[3.5rem]">{lfS(x)}</td>)}</tr>
                    <tr><th className={`border-2 border-slate-300 bg-${FK.theme}-50 px-3 py-2`}><V>y</V></th>{xs.map(x => (
                        <td key={x} className="border-2 border-slate-300 p-0 text-center min-w-[3.5rem]">
                            {shown.includes(x) ? <span className="block px-3 py-2 font-bold text-green-700 animate-fade-in">{lfS(val(x))}</span>
                                : <button onClick={() => setShown(s => [...s, x])} className={`w-full h-full px-3 py-2 ${t.activeBg} ${t.activeTitle} font-bold hover:opacity-80`}>?</button>}
                        </td>))}</tr>
                </tbody></table>
            </div>
            <div className="mt-3 space-y-1 font-math text-base sm:text-lg">
                {shown.map(x => <div key={x} className="animate-fade-in">x = {lfS(x)}: y = {lfS(g.m)} · {lfP(x)} {g.t < 0 ? '−' : '+'} {lfS(Math.abs(g.t))} = {lfS(val(x))}</div>)}
            </div>
            {all && <div className="mt-3"><Koord range={lfRangeFor(xs.map(x => ({ x, y: val(x) })))} lines={[{ ...g, n: 'g' }]} points={xs.map(x => ({ x, y: val(x) }))} /></div>}
        </div>
    );
};

// Steigung aus zwei Punkten: B verschieben, Formel live
const LLSteigungLab = ({ onDone }) => {
    const A = { x: -2, y: -1 };
    const [bx, setBx] = useState(2);
    const [by, setBy] = useState(3);
    const dx = bx - A.x, dy = by - A.y;
    const m = dx === 0 ? null : lfR(dy / dx);
    useEffect(() => { if (onDone) onDone(); /* eslint-disable-next-line */ }, []);
    const g = m === null ? null : { m, t: lfR(A.y - m * A.x), n: 'g' };
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
            <div className="grid md:grid-cols-2 gap-4 items-center">
                <Koord range={[-6, 6, -6, 6]} lines={g ? [g] : []} points={[{ x: A.x, y: A.y, n: 'A', color: '#16a34a' }, { x: bx, y: by, n: 'B', color: '#dc2626' }, ...(dx ? [{ x: bx, y: A.y, color: '#94a3b8' }] : [])]} />
                <div className="space-y-3">
                    <LnSlider label="x_B" value={bx} min={-5} max={5} onChange={setBx} />
                    <LnSlider label="y_B" value={by} min={-5} max={5} onChange={setBy} />
                    <div className="bg-white border border-slate-200 rounded-lg p-3 font-math text-base sm:text-lg space-y-1">
                        <div>A(−2 | −1), B({lfS(bx)} | {lfS(by)})</div>
                        <div>m = ({lfS(by)} − (−1)) : ({lfS(bx)} − (−2)) = {lfS(dy)} : {lfS(dx)}{m === null ? '' : ` = ${lfS(m)}`}</div>
                        {m === null && <div className="text-red-700 text-sm font-sans">Gleiche x-Koordinate: Das ist eine senkrechte Linie, keine Funktion.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Schnitt-Labor: g₂ gegen g₁ bewegen (Schnittpunkt, parallel, identisch)
const LLSchnittLab = ({ onDone }) => {
    const g1 = { m: 1, t: -1, n: 'g₁' };
    const [m, setM] = useState(-1);
    const [tt, setT] = useState(3);
    const g2 = { m, t: tt, n: 'g₂' };
    const par = m === g1.m, same = par && tt === g1.t;
    const x = par ? null : lfR((tt - g1.t) / (g1.m - m)), y = par ? null : lfR(g1.m * x + g1.t);
    const [seen, setSeen] = useState({});
    const state = same ? 'same' : par ? 'par' : 'cut';
    useEffect(() => { const s = { ...seen, [state]: true }; setSeen(s); if (onDone && s.cut && s.par) onDone(); /* eslint-disable-next-line */ }, [state]);
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
            <div className="grid md:grid-cols-2 gap-4 items-center">
                <Koord range={[-6, 6, -6, 6]} lines={[g1, g2]} points={x === null ? [] : [{ x, y, n: 'S', color: '#dc2626' }]} />
                <div className="space-y-3">
                    <LnSlider label="m₂" value={m} min={-3} max={3} step={0.5} onChange={setM} />
                    <LnSlider label="t₂" value={tt} min={-5} max={5} onChange={setT} />
                    <div className="bg-white border border-slate-200 rounded-lg p-3 font-math text-base sm:text-lg space-y-1">
                        <div>g₁: y = x − 1 · g₂: {lfGlS(m, tt)}</div>
                        <div className={`font-sans font-bold ${same ? 'text-amber-700' : par ? 'text-red-700' : 'text-green-700'}`}>
                            {same ? 'identisch: unendlich viele gemeinsame Punkte' : par ? 'parallel (gleiche Steigung): kein Schnittpunkt' : `Schnittpunkt S(${lfS(x)} | ${lfS(y)})`}
                        </div>
                    </div>
                    <p className="text-sm text-slate-600">Aufgabe: Finde einen Schnittpunkt und den Fall „parallel“.</p>
                </div>
            </div>
        </div>
    );
};

// Winkel-Labor: tan α = m
const LLWinkelLab = ({ onDone }) => {
    const [m, setM] = useState(1);
    const a = lfR(Math.atan(Math.abs(m)) * 180 / Math.PI, 2);
    useEffect(() => { if (onDone) onDone(); /* eslint-disable-next-line */ }, []);
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
            <div className="grid md:grid-cols-2 gap-4 items-center">
                <Koord range={[-5, 5, -5, 5]} lines={[{ m, t: 0, n: 'g' }]} points={[{ x: 2, y: 2 * m, color: '#dc2626' }, { x: 2, y: 0, color: '#94a3b8' }]} />
                <div className="space-y-3">
                    <LnSlider label="m" value={m} min={-3} max={3} step={0.5} onChange={setM} />
                    <div className="bg-white border border-slate-200 rounded-lg p-3 font-math text-base sm:text-lg space-y-1">
                        <div>tan α = |m| = {lfS(Math.abs(m))}</div>
                        <div>α = tan⁻¹({lfS(Math.abs(m))}) ≈ {lfS(a)}°</div>
                        <div className="text-sm font-sans text-slate-600">{m === 0 ? 'Waagrechte Gerade: α = 0°' : Math.abs(m) === 1 ? 'Bei m = ±1 ist der Winkel genau 45°.' : Math.abs(m) > 1 ? 'Steiler als 45°, weil |m| > 1.' : 'Flacher als 45°, weil |m| < 1.'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sach-Labor: Handytarif mit Grundgebühr und Minutenpreis
const LLTarifLab = ({ onDone }) => {
    const [min, setMin] = useState(50);
    const t = 9.9, m = 0.1;
    useEffect(() => { if (onDone) onDone(); /* eslint-disable-next-line */ }, []);
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 space-y-3">
            <LnSlider label="x" value={min} min={0} max={200} step={10} onChange={setMin} format={(v) => v + ' min'} />
            <div className="bg-white border border-slate-200 rounded-lg p-3 font-math text-base sm:text-lg space-y-1">
                <div>Kosten y = 0,10 · x + 9,90</div>
                <div>y = 0,10 · {min} + 9,90 = {lfEur(m * min + t)} €</div>
                <div className="text-sm font-sans text-slate-600">Grundgebühr t = 9,90 € (auch bei 0 Minuten) · pro Minute m = 0,10 €</div>
            </div>
        </div>
    );
};

// ==========================================
// LERNKARTEN
// ==========================================
const LF_LEARN_BUILD = () => {
    const opt = (...a) => a.map(s => <M>{s}</M>);
    const L = {};

    L.wertetabelle = { cards: [
        { id: 'k1', title: 'Was ist eine lineare Funktion?', needsWidget: true,
          body: <>
            <p>Eine lineare Funktion hat die Gleichung <M>y = mx + t</M>. Ihr Graph ist eine <b>Gerade</b>. Für jeden x-Wert bekommst du genau einen y-Wert, indem du x einsetzt.</p>
            <p>Beispiel <M>g: y = 2x − 1</M>. Decke die Tabelle auf.</p>
          </>,
          widget: (p) => <LLTabelleLab g={{ m: 2, t: -1 }} xs={[-2, -1, 0, 1, 2]} onDone={p.onDone} />,
          check: { q: 'Welcher y-Wert gehört bei y = 2x − 1 zu x = 3?', options: opt('5', '6', '4', '−5'), correct: 0, hint: '2 · 3 − 1 = 5.' } },
        { id: 'k2', title: 'Gleiche Schritte',
          body: <>
            <p>In der Tabelle siehst du das Besondere: Geht x um 1 weiter, ändert sich y <b>immer um denselben Wert</b> — nämlich um m. Bei <M>y = 2x − 1</M> steigt y jedes Mal um 2.</p>
            <p>Daran erkennst du auch, ob eine Tabelle zu einer linearen Funktion passt: Die Schritte müssen gleich sein.</p>
          </>,
          check: { q: 'x: 0, 1, 2, 3 und y: 5, 3, 1, −1. Was ist m?', options: opt('m = −2', 'm = 2', 'm = 5', 'm = −1'), correct: 0, hint: 'y wird bei jedem Schritt um 2 kleiner.' } },
        { id: 'k3', title: 'Aus der Tabelle zur Gleichung',
          body: <>
            <p>Zwei Dinge liest du ab: <b>t</b> ist der y-Wert bei x = 0. <b>m</b> ist die Änderung von y pro Schritt. Bei x: 0, 1, 2 und y: 5, 3, 1 gilt t = 5 und m = −2, also <M>y = −2x + 5</M>.</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: 't = 5', e: 'y-Wert bei x = 0' },
            { f: 'm = 3 − 5 = −2', e: 'Änderung pro Schritt' },
            { f: 'y = −2x + 5', e: 'Probe mit x = 2: −4 + 5 = 1 ✓' }]} />,
          check: { q: 'x: 0, 1, 2 und y: −3, 0, 3. Welche Gleichung passt?', options: opt('y = 3x − 3', 'y = −3x + 3', 'y = 3x + 3', 'y = x − 3'), correct: 0, hint: 't = −3 (bei x = 0), m = 0 − (−3) = 3.' } },
        { id: 'k4', title: 'Fehlender x-Wert',
          body: <>
            <p>Ist y gegeben, setzt du y ein und löst nach x auf. Bei <M>y = 2x − 1</M> und y = 7: <M>7 = 2x − 1</M> → <M>8 = 2x</M> → <M>x = 4</M>.</p>
          </>,
          merke: <>Lineare Funktion <M>y = mx + t</M>: t ist der y-Wert bei x = 0, m die Änderung pro Schritt. y gesucht: x einsetzen. x gesucht: y einsetzen und auflösen.</>,
          check: { q: 'y = 2x − 1 und y = −5. Was ist x?', options: opt('x = −2', 'x = −3', 'x = 2', 'x = −11'), correct: 0, hint: '−5 = 2x − 1 → −4 = 2x → x = −2.' } }
    ]};

    L.ablesen = { cards: [
        { id: 'k1', title: 'Der y-Achsenabschnitt t',
          body: <>
            <p><b>t</b> ist der y-Wert, bei dem die Gerade die <b>y-Achse</b> schneidet — der Punkt (0 | t). Du liest ihn direkt am Graphen ab. Schiebe t mit dem Regler.</p>
          </>,
          widget: (p) => <LLGeradeLab onDone={p.onDone} showTriangle={false} />,
          check: { q: 'Eine Gerade schneidet die y-Achse bei (0 | −3). Was ist t?', options: opt('t = −3', 't = 3', 't = 0'), correct: 0, hint: 't ist die y-Koordinate des Schnittpunkts mit der y-Achse.' } },
        { id: 'k2', title: 'Die Steigung m: Steigungsdreieck', needsWidget: true,
          body: <>
            <p>Vom Punkt auf der y-Achse gehst du <b>1 nach rechts</b>. Wie weit musst du dann nach oben (oder unten), um wieder auf der Geraden zu sein? Das ist <b>m</b>. Nach unten bedeutet negatives m.</p>
            <p>Stelle <M>y = −2x + 3</M> ein.</p>
          </>,
          widget: (p) => <LLGeradeLab onDone={p.onDone} done={p.done} target={{ m: -2, t: 3 }} />,
          check: { q: '1 nach rechts, 3 nach unten. Was ist m?', options: opt('m = −3', 'm = 3', 'm = −1/3', 'm = 1/3'), correct: 0, hint: 'Nach unten → negativ. 3 Einheiten → m = −3.' } },
        { id: 'k3', title: 'Steigung als Bruch',
          body: <>
            <p>Trifft die Gerade nach 1 Schritt keinen Gitterpunkt, nimmst du ein größeres Dreieck: 2 nach rechts und 1 nach oben heißt <M>m = 1/2</M>. Allgemein: <M>m = Höhe : Breite</M> des Steigungsdreiecks.</p>
          </>,
          check: { q: '3 nach rechts, 2 nach oben. Was ist m?', options: opt('m = 2/3', 'm = 3/2', 'm = 6', 'm = 1'), correct: 0, hint: 'm = Höhe : Breite = 2 : 3.' } },
        { id: 'k4', title: 'In die Normalform bringen',
          body: <>
            <p>Nur in der Form <M>y = mx + t</M> kannst du m und t ablesen. Steht die Gleichung anders da, stellst du nach y um: <M>2y − 4x = 6</M> → <M>2y = 4x + 6</M> → <M>y = 2x + 3</M>.</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: '2y − 4x = 6   | + 4x', e: 'x-Term auf die rechte Seite' },
            { f: '2y = 4x + 6   | : 2', e: 'durch die Zahl vor y teilen — jeden Term!' },
            { f: 'y = 2x + 3', e: 'm = 2, t = 3' }]} />,
          merke: <>Normalform <M>y = mx + t</M>: t am Schnitt mit der y-Achse, m mit dem Steigungsdreieck (1 nach rechts, m nach oben). Andere Formen zuerst nach y auflösen.</>,
          check: { q: 'Wie lautet 3y + 6x = 9 in der Normalform?', options: opt('y = −2x + 3', 'y = 2x + 3', 'y = −6x + 9', 'y = −2x + 9'), correct: 0, hint: '3y = −6x + 9, dann durch 3 teilen.' } }
    ]};

    L.zeichnen = { cards: [
        { id: 'k1', title: 'Zeichnen in zwei Schritten',
          body: <>
            <p><b>1.</b> Punkt (0 | t) auf der y-Achse markieren. <b>2.</b> Steigungsdreieck: 1 nach rechts, m nach oben (oder unten) → zweiter Punkt. Gerade durch beide Punkte ziehen, über die Punkte hinaus.</p>
          </>,
          widget: (p) => <LLGeradeLab onDone={p.onDone} start={{ m: 2, t: -1 }} />,
          check: { q: 'y = 2x − 1: Welche zwei Punkte benutzt du?', options: opt('(0 | −1) und (1 | 1)', '(0 | 2) und (1 | 1)', '(−1 | 0) und (1 | 2)'), correct: 0, hint: 'Start (0 | t) = (0 | −1), dann 1 nach rechts und 2 nach oben.' } },
        { id: 'k2', title: 'Negative und gebrochene Steigung', needsWidget: true,
          body: <>
            <p>Bei <M>m = −1/2</M> gehst du 2 nach rechts und 1 nach <b>unten</b>. Nimm immer den Nenner als Breite und den Zähler als Höhe. Stelle <M>y = −0,5x + 2</M> ein.</p>
          </>,
          widget: (p) => <LLGeradeLab onDone={p.onDone} done={p.done} target={{ m: -0.5, t: 2 }} start={{ m: 1, t: 0 }} />,
          check: { q: 'y = −1/2 x + 2: Wie läuft das Steigungsdreieck?', options: [<span>2 nach rechts, 1 nach unten</span>, <span>1 nach rechts, 2 nach unten</span>, <span>2 nach rechts, 1 nach oben</span>], correct: 0, hint: 'Nenner 2 = Breite, Zähler −1 = 1 nach unten.' } },
        { id: 'k3', title: 'Sonderfälle',
          body: <>
            <p><M>y = 3</M> (m = 0) ist eine <b>waagrechte</b> Gerade durch (0 | 3). <M>y = x</M> (m = 1, t = 0) geht durch den Ursprung. Eine senkrechte Gerade (z. B. x = 2) ist keine Funktion — dafür gibt es keine Gleichung y = mx + t.</p>
          </>,
          merke: <>Zeichnen: (0 | t) markieren, Steigungsdreieck 1 nach rechts und m nach oben/unten (bei Brüchen: Nenner nach rechts, Zähler nach oben), Gerade durchziehen.</>,
          check: { q: 'Wie sieht der Graph von y = −2 aus?', options: [<span>waagrechte Gerade durch (0 | −2)</span>, <span>senkrechte Gerade durch (−2 | 0)</span>, <span>Gerade durch den Ursprung mit m = −2</span>], correct: 0, hint: 'm = 0: keine Steigung, y ist immer −2.' } }
    ]};

    L.nullstelle = { cards: [
        { id: 'k1', title: 'Schnittpunkt mit der y-Achse',
          body: <>
            <p>Auf der y-Achse ist <M>x = 0</M>. Setze x = 0 ein: <M>y = m · 0 + t = t</M>. Der Schnittpunkt mit der y-Achse ist also immer <M>S<sub>y</sub>(0 | t)</M> — ohne Rechnung.</p>
          </>,
          check: { q: 'Wo schneidet y = 3x − 4 die y-Achse?', options: opt('(0 | −4)', '(−4 | 0)', '(0 | 3)'), correct: 0, hint: 'x = 0 einsetzen: y = −4.' } },
        { id: 'k2', title: 'Nullstelle: Schnittpunkt mit der x-Achse',
          body: <>
            <p>Auf der x-Achse ist <M>y = 0</M>. Setze y = 0 und löse nach x auf. Bei <M>y = 3x − 4</M>:</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: '0 = 3x − 4   | + 4', e: 'y = 0 setzen' },
            { f: '4 = 3x   | : 3', e: 'nach x auflösen' },
            { f: 'x = 4/3 ≈ 1,33', e: 'Nullstelle N(4/3 | 0)' }]} />,
          check: { q: 'Wo liegt die Nullstelle von y = 2x + 6?', options: opt('N(−3 | 0)', 'N(3 | 0)', 'N(0 | 6)', 'N(−6 | 0)'), correct: 0, hint: '0 = 2x + 6 → −6 = 2x → x = −3.' } },
        { id: 'k3', title: 'Nicht verwechseln',
          body: <>
            <p>Beide Schnittpunkte haben eine Null — aber an verschiedenen Stellen: y-Achse → <M>(0 | t)</M>, x-Achse → <M>(x<sub>N</sub> | 0)</M>. Schiebe die Gerade und beobachte beide Punkte.</p>
          </>,
          widget: (p) => <LLGeradeLab onDone={p.onDone} showTriangle={false} start={{ m: 1, t: 2 }} />,
          merke: <>y-Achse: x = 0 einsetzen → (0 | t). x-Achse (Nullstelle): y = 0 setzen, nach x auflösen → (x | 0).</>,
          check: { q: 'Welche Aussage stimmt für die Nullstelle?', options: [<span>Dort ist y = 0</span>, <span>Dort ist x = 0</span>, <span>Dort ist x = t</span>], correct: 0, hint: 'Nullstelle = Schnitt mit der x-Achse, dort ist die y-Koordinate 0.' } }
    ]};

    L.steigung = { cards: [
        { id: 'k1', title: 'Die Steigungsformel',
          body: <>
            <p>Kennst du zwei Punkte <M>A(x₁ | y₁)</M> und <M>B(x₂ | y₂)</M>, dann ist <M>m = (y₂ − y₁) : (x₂ − x₁)</M>: Höhenunterschied geteilt durch Breite. Verschiebe B und schau, wie sich m ändert.</p>
          </>,
          widget: (p) => <LLSteigungLab onDone={p.onDone} />,
          check: { q: 'A(1 | 2), B(3 | 8). Was ist m?', options: opt('m = 3', 'm = 1/3', 'm = 6', 'm = 2'), correct: 0, hint: '(8 − 2) : (3 − 1) = 6 : 2.' } },
        { id: 'k2', title: 'Vorsicht mit Minus',
          body: <>
            <p>Setze negative Koordinaten in <b>Klammern</b>: <M>A(−2 | 5), B(1 | −1)</M>: <M>m = (−1 − 5) : (1 − (−2)) = −6 : 3 = −2</M>. Die Reihenfolge ist egal, solange du oben und unten dieselbe nimmst.</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: 'm = (−1 − 5) : (1 − (−2))', e: 'y₂ − y₁ oben, x₂ − x₁ unten' },
            { f: 'm = −6 : 3', e: '1 − (−2) = 1 + 2 = 3' },
            { f: 'm = −2', e: 'Gerade fällt' }]} />,
          check: { q: 'A(−1 | 4), B(2 | −2). Was ist m?', options: opt('m = −2', 'm = 2', 'm = −1/2', 'm = −6'), correct: 0, hint: '(−2 − 4) : (2 − (−1)) = −6 : 3.' } },
        { id: 'k3', title: 'Der Steigungswinkel α',
          body: <>
            <p>Der Winkel zwischen Gerade und x-Achse hängt nur von m ab: <M>tan α = |m|</M>, also <M>α = tan⁻¹(|m|)</M>. Bei m = 1 ist α = 45°.</p>
          </>,
          widget: (p) => <LLWinkelLab onDone={p.onDone} />,
          merke: <>Steigung aus zwei Punkten: <M>m = (y₂ − y₁) : (x₂ − x₁)</M>, negative Zahlen in Klammern. Steigungswinkel: <M>tan α = |m|</M>.</>,
          check: { q: 'm = 2. Wie groß ist α etwa?', options: opt('α ≈ 63°', 'α ≈ 27°', 'α = 45°', 'α ≈ 2°'), correct: 0, hint: 'tan⁻¹(2) ≈ 63,4°. Steiler als 45°, weil m > 1.' } }
    ]};

    L.gleichung = { cards: [
        { id: 'k1', title: 'Aus Punkt und Steigung',
          body: <>
            <p>Ist m bekannt, fehlt nur t. Setze den Punkt in <M>y = mx + t</M> ein und löse nach t auf. Beispiel m = 2, <M>P(3 | 1)</M>:</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: '1 = 2 · 3 + t', e: 'x = 3, y = 1 einsetzen' },
            { f: '1 = 6 + t   | − 6', e: 'nach t auflösen' },
            { f: 't = −5  →  y = 2x − 5', e: 'fertig' }]} />,
          check: { q: 'm = −1, P(2 | 3). Wie lautet die Gleichung?', options: opt('y = −x + 5', 'y = −x + 1', 'y = −x + 3', 'y = x + 5'), correct: 0, hint: '3 = −2 + t → t = 5.' } },
        { id: 'k2', title: 'Aus zwei Punkten',
          body: <>
            <p>Erst m mit der Steigungsformel, dann einen Punkt einsetzen für t. <M>A(1 | 4), B(3 | 10)</M>:</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: 'm = (10 − 4) : (3 − 1) = 3', e: 'Steigungsformel' },
            { f: '4 = 3 · 1 + t  →  t = 1', e: 'A einsetzen' },
            { f: 'y = 3x + 1', e: 'Probe mit B: 9 + 1 = 10 ✓' }]} />,
          check: { q: 'A(0 | 2), B(2 | 6). Welche Gleichung?', options: opt('y = 2x + 2', 'y = 2x + 6', 'y = 4x + 2', 'y = x + 2'), correct: 0, hint: 'm = (6 − 2) : (2 − 0) = 2. A liegt auf der y-Achse → t = 2.' } },
        { id: 'k3', title: 'Probe',
          body: <>
            <p>Setze den zweiten Punkt in die fertige Gleichung ein. Stimmt y, ist alles richtig. Das rettet in der Prüfung oft den Punkt für die Gleichung.</p>
          </>,
          merke: <>Gleichung aufstellen: 1. m berechnen (oder gegeben). 2. Punkt einsetzen → t. 3. y = mx + t aufschreiben. 4. Probe mit dem anderen Punkt.</>,
          check: { q: 'y = 3x + 1. Liegt B(3 | 10) drauf?', options: [<span>Ja, 3 · 3 + 1 = 10</span>, <span>Nein, 3 · 3 + 1 = 9</span>], correct: 0, hint: '9 + 1 = 10 stimmt mit der y-Koordinate überein.' } }
    ]};

    L.punktprobe = { cards: [
        { id: 'k1', title: 'Punktprobe',
          body: <>
            <p>Liegt <M>P(2 | 5)</M> auf <M>g: y = 3x − 1</M>? Setze x = 2 ein: <M>y = 6 − 1 = 5</M>. Das passt → P liegt auf g. Bei <M>Q(1 | 3)</M>: <M>y = 2 ≠ 3</M> → Q liegt nicht auf g.</p>
          </>,
          check: { q: 'Liegt R(−1 | −4) auf y = 3x − 1?', options: [<span>Ja, 3 · (−1) − 1 = −4</span>, <span>Nein, es kommt 2 heraus</span>, <span>Nein, es kommt −2 heraus</span>], correct: 0, hint: '−3 − 1 = −4 passt zur y-Koordinate.' } },
        { id: 'k2', title: 'Fehlende Koordinate',
          body: <>
            <p>Fehlt y: x einsetzen. Fehlt x: y einsetzen und nach x auflösen. <M>P(x | 8)</M> auf <M>y = 3x − 1</M>: <M>8 = 3x − 1</M> → <M>9 = 3x</M> → <M>x = 3</M>.</p>
          </>,
          check: { q: 'P(x | −7) liegt auf y = 3x − 1. Was ist x?', options: opt('x = −2', 'x = 2', 'x = −8/3', 'x = −22'), correct: 0, hint: '−7 = 3x − 1 → −6 = 3x.' } },
        { id: 'k3', title: 'Steigung gesucht',
          body: <>
            <p>Manchmal fehlt m: „Die Gerade <M>y = mx + 2</M> geht durch <M>P(4 | 10)</M>.“ Punkt einsetzen: <M>10 = 4m + 2</M> → <M>8 = 4m</M> → <M>m = 2</M>.</p>
          </>,
          merke: <>Punktprobe: x einsetzen, mit y vergleichen. Fehlende Größe (x, y, m oder t): Bekanntes einsetzen, nach der Unbekannten auflösen.</>,
          check: { q: 'y = mx − 3 geht durch P(2 | 5). Was ist m?', options: opt('m = 4', 'm = 1', 'm = −4', 'm = 2'), correct: 0, hint: '5 = 2m − 3 → 8 = 2m.' } }
    ]};

    L.parallel = { cards: [
        { id: 'k1', title: 'Parallele Geraden',
          body: <>
            <p>Zwei Geraden sind <b>parallel</b>, wenn sie dieselbe Steigung haben: <M>m₂ = m₁</M>. Nur t ist anders. Für die Parallele zu <M>y = 2x + 1</M> durch <M>P(1 | 5)</M>: m = 2 übernehmen, P einsetzen: <M>5 = 2 + t</M> → t = 3 → <M>y = 2x + 3</M>.</p>
          </>,
          widget: (p) => <LLSchnittLab onDone={p.onDone} />,
          check: { q: 'Welche Gerade ist parallel zu y = −3x + 4?', options: opt('y = −3x − 2', 'y = 3x + 4', 'y = 1/3 x + 4', 'y = −4x + 3'), correct: 0, hint: 'Gleiche Steigung −3.' } },
        { id: 'k2', title: 'Senkrechte Geraden',
          body: <>
            <p>Zwei Geraden stehen <b>senkrecht</b> aufeinander, wenn <M>m₁ · m₂ = −1</M> gilt. Die zweite Steigung ist also der <b>negative Kehrwert</b>: Zu m₁ = 2 gehört m₂ = −1/2, zu m₁ = −3/4 gehört m₂ = 4/3.</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: 'm₁ = 2  →  m₂ = −1/2', e: 'Kehrwert bilden und Vorzeichen wechseln' },
            { f: 'Kontrolle: 2 · (−1/2) = −1 ✓', e: 'Produkt muss −1 sein' }]} />,
          check: { q: 'Welche Steigung hat eine Senkrechte zu y = 4x − 1?', options: opt('m = −1/4', 'm = 1/4', 'm = −4', 'm = 4'), correct: 0, hint: 'Negativer Kehrwert von 4 ist −1/4. Probe: 4 · (−1/4) = −1.' } },
        { id: 'k3', title: 'Lage prüfen',
          body: <>
            <p>„Wie liegen g und h zueinander?“ Vergleiche die Steigungen: gleich → parallel (oder identisch, falls auch t gleich ist). Produkt −1 → senkrecht. Sonst → sie schneiden sich schräg.</p>
          </>,
          merke: <>Parallel: <M>m₂ = m₁</M>. Senkrecht: <M>m₁ · m₂ = −1</M> (negativer Kehrwert). Dann den Punkt einsetzen, um t zu finden.</>,
          check: { q: 'g: y = 2/3 x + 1 und h: y = −3/2 x − 4. Lage?', options: opt('senkrecht', 'parallel', 'identisch', 'schneiden sich schräg'), correct: 0, hint: '2/3 · (−3/2) = −1.' } }
    ]};

    L.schnittpunkt = { cards: [
        { id: 'k1', title: 'Gleichsetzen',
          body: <>
            <p>Am Schnittpunkt haben beide Geraden denselben y-Wert. Setze die Terme gleich und löse nach x auf. <M>g: y = 2x − 1</M>, <M>h: y = −x + 5</M>:</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: '2x − 1 = −x + 5   | + x', e: 'gleichsetzen' },
            { f: '3x − 1 = 5   | + 1', e: 'x auf eine Seite' },
            { f: '3x = 6  →  x = 2', e: 'x-Koordinate' },
            { f: 'y = 2 · 2 − 1 = 3  →  S(2 | 3)', e: 'x in g einsetzen (Probe in h: −2 + 5 = 3 ✓)' }]} />,
          check: { q: 'g: y = x + 4 und h: y = 3x. Schnittpunkt?', options: opt('S(2 | 6)', 'S(2 | 2)', 'S(−2 | 2)', 'S(6 | 2)'), correct: 0, hint: 'x + 4 = 3x → 4 = 2x → x = 2, y = 6.' } },
        { id: 'k2', title: 'Parallel: kein Schnittpunkt', needsWidget: true,
          body: <>
            <p>Haben beide Geraden dieselbe Steigung, fällt beim Gleichsetzen x weg und es bleibt etwas Falsches wie <M>−1 = 5</M> übrig: kein Schnittpunkt. Probiere im Labor den Schnittpunkt und den Fall „parallel“ aus.</p>
          </>,
          widget: (p) => <LLSchnittLab onDone={p.onDone} />,
          check: { q: 'Beim Gleichsetzen bleibt 3 = 7 übrig. Was heißt das?', options: [<span>Die Geraden sind parallel, kein Schnittpunkt</span>, <span>Der Schnittpunkt ist S(3 | 7)</span>, <span>Rechenfehler, das kann nicht passieren</span>], correct: 0, hint: 'Eine falsche Aussage ohne x bedeutet: keine Lösung.' } },
        { id: 'k3', title: 'Als Gleichungssystem',
          body: <>
            <p>In Prüfungen steht das oft als <b>lineares Gleichungssystem</b>: (I) y = 2x − 1 und (II) y = −x + 5. Gleichsetzen ist dann das <b>Gleichsetzungsverfahren</b>. Steht y nicht allein, hilft das Einsetzungs- oder Additionsverfahren.</p>
          </>,
          merke: <>Schnittpunkt: Terme gleichsetzen, nach x auflösen, x in eine Gleichung einsetzen → y. Gleiche Steigung → parallel, kein Schnittpunkt.</>,
          check: { q: '(I) y = 2x + 1, (II) y = 4x − 3. Lösung?', options: opt('x = 2, y = 5', 'x = 1, y = 3', 'x = −2, y = −3', 'x = 2, y = 1'), correct: 0, hint: '2x + 1 = 4x − 3 → 4 = 2x → x = 2, y = 5.' } }
    ]};

    L.sachaufgaben = { cards: [
        { id: 'k1', title: 'Grundgebühr und Preis pro Einheit',
          body: <>
            <p>Viele Alltagssituationen sind linear: Ein Handytarif kostet 9,90 € Grundgebühr plus 0,10 € pro Minute. Die feste Zahl ist <b>t</b>, der Preis pro Einheit ist <b>m</b>: <M>y = 0,10x + 9,90</M>.</p>
          </>,
          widget: (p) => <LLTarifLab onDone={p.onDone} />,
          check: { q: 'Taxi: 3,50 € Grundpreis, 2 € pro km. Gleichung?', options: opt('y = 2x + 3,50', 'y = 3,50x + 2', 'y = 5,50x', 'y = 2x − 3,50'), correct: 0, hint: 'Pro Kilometer 2 € → m = 2. Fester Anteil 3,50 € → t.' } },
        { id: 'k2', title: 'Abnehmende Größen',
          body: <>
            <p>Eine Kerze ist 20 cm lang und brennt pro Stunde 2,5 cm ab: <M>y = −2,5x + 20</M>. Negatives m, weil die Länge kleiner wird. Wann ist sie abgebrannt? Nullstelle: <M>0 = −2,5x + 20</M> → <M>x = 8</M> Stunden.</p>
          </>,
          check: { q: 'Ein Tank hat 60 l, pro Stunde laufen 5 l ab. Nach wie vielen Stunden ist er leer?', options: opt('12 h', '6 h', '55 h', '300 h'), correct: 0, hint: '0 = −5x + 60 → x = 12.' } },
        { id: 'k3', title: 'Zwei Angebote vergleichen',
          body: <>
            <p>Tarif A: <M>y = 0,10x + 9,90</M>, Tarif B: <M>y = 0,20x + 4,90</M>. Ab wann ist A günstiger? Gleichsetzen: <M>0,10x + 9,90 = 0,20x + 4,90</M> → <M>5 = 0,10x</M> → <M>x = 50</M> Minuten. Darüber ist A billiger, darunter B.</p>
          </>,
          merke: <>Sachaufgabe → y = mx + t: fester Betrag = t, Betrag pro Einheit = m (negativ, wenn etwas abnimmt). Fragen nach „wann gleich?“ → gleichsetzen; „wann null?“ → Nullstelle.</>,
          check: { q: 'Was bedeutet der Schnittpunkt zweier Tarif-Geraden?', options: [<span>Bei dieser Menge kosten beide gleich viel</span>, <span>Dort ist ein Tarif kostenlos</span>, <span>Dort beginnt die Grundgebühr</span>], correct: 0, hint: 'Gleicher x-Wert, gleicher y-Wert: gleiche Minuten, gleiche Kosten.' } }
    ]};

    return L;
};
