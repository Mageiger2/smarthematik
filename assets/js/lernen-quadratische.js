// ==========================================
// lernen-quadratische.js — Lernkarten „Quadratische Funktionen“
// Wird nach lernen-kern.js und vor quadratische-funktionen.js inline kompiliert.
// QF_LEARN_BUILD() liefert die Karten je Thema; die Funktion wird erst beim
// Rendern aufgerufen, damit die Helfer des Trainers (Pb, qfVertS, …) bereitstehen.
// ==========================================

// Mathe-Text in der Formelschrift
const M = ({ children }) => <span className="font-math whitespace-nowrap">{children}</span>;

// ==========================================
// 1. INTERAKTIVE BAUSTEINE
// ==========================================

// Parabel-Labor: Scheitel per Regler verschieben, Öffnung umschalten.
// target: { xs, ys, a? } — Aufgabe; sobald sie erreicht ist, wird onDone() gerufen.
const QLParabelLab = ({ onDone, target, allowOpen = true, showNorm = false, start = { a: 1, xs: 1, ys: -2 }, done }) => {
    const [a, setA] = useState(start.a);
    const [xs, setXs] = useState(start.xs);
    const [ys, setYs] = useState(start.ys);
    const P = qfFromVertex(a, xs, ys, 'p');
    const hit = !!target && lfSame(xs, target.xs) && lfSame(ys, target.ys) && (!target.a || a === target.a);
    useEffect(() => { if (onDone && (!target || hit)) onDone(); /* eslint-disable-next-line */ }, [hit]);
    const t = themeColors[FK.theme];
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
            <div className="grid md:grid-cols-2 gap-4 items-center">
                <Koord range={[-6, 6, -6, 6]} lines={[P]} points={[{ x: xs, y: ys, n: 'S', color: '#16a34a' }]} />
                <div className="space-y-3">
                    <LnSlider label="xₛ" value={xs} min={-4} max={4} onChange={setXs} />
                    <LnSlider label="yₛ" value={ys} min={-4} max={4} onChange={setYs} />
                    {allowOpen && (
                        <div className="flex gap-2 text-sm">
                            {[[1, 'nach oben'], [-1, 'nach unten']].map(([v, l]) => (
                                <button key={v} onClick={() => setA(v)} className={`px-3 py-1.5 rounded-lg border font-bold transition-colors ${a === v ? `${t.btnBg} text-white border-transparent` : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}>{l}</button>
                            ))}
                        </div>
                    )}
                    <div className="bg-white border border-slate-200 rounded-lg p-3 font-math text-base sm:text-lg space-y-1">
                        <div><span className="text-slate-500 text-sm font-sans">Scheitelpunktform:</span> {qfVertS(P)}</div>
                        {showNorm && <div><span className="text-slate-500 text-sm font-sans">Normalform:</span> {qfNormS(P)}</div>}
                        <div><span className="text-slate-500 text-sm font-sans">Scheitel:</span> S({lfS(xs)} | {lfS(ys)})</div>
                    </div>
                    {target && (
                        <div className={`text-sm sm:text-base font-bold ${hit || done ? 'text-green-700' : 'text-slate-700'}`}>
                            {hit || done ? '✓ Genau richtig!' : <>Aufgabe: Stelle die Regler so ein, dass der Scheitel bei S({lfS(target.xs)} | {lfS(target.ys)}) liegt{target.a ? (target.a > 0 ? ' und die Parabel nach oben geöffnet ist' : ' und die Parabel nach unten geöffnet ist') : ''}.</>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Wertetabelle zum Aufdecken: Klick auf ein Feld zeigt die Rechnung
const QLTabelleLab = ({ P, xs, onDone }) => {
    const [shown, setShown] = useState([]);
    const all = shown.length >= xs.length;
    useEffect(() => { if (all && onDone) onDone(); /* eslint-disable-next-line */ }, [all]);
    const t = themeColors[FK.theme];
    const calc = (x) => `${P.a < 0 ? '−' : ''}${lfP(x)}²${P.b ? ` ${qfSgSp(P.b)} · ${lfP(x)}` : ''}${P.c ? ` ${qfSgSp(P.c)}` : ''} = ${lfS(qfVal(P, x))}`;
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
            <p className="text-sm text-slate-600 mb-2">Tippe auf ein Fragezeichen — die Rechnung erscheint darunter.</p>
            <div className="overflow-x-auto">
                <table className="mx-auto border-collapse font-math text-lg bg-white">
                    <tbody>
                        <tr><th className={`border-2 border-slate-300 bg-${FK.theme}-50 px-3 py-2`}><V>x</V></th>{xs.map(x => <td key={x} className="border-2 border-slate-300 px-3 py-2 text-center min-w-[3.5rem]">{lfS(x)}</td>)}</tr>
                        <tr><th className={`border-2 border-slate-300 bg-${FK.theme}-50 px-3 py-2`}><V>y</V></th>{xs.map(x => (
                            <td key={x} className="border-2 border-slate-300 p-0 text-center min-w-[3.5rem]">
                                {shown.includes(x) ? <span className="block px-3 py-2 font-bold text-green-700 animate-fade-in">{lfS(qfVal(P, x))}</span>
                                    : <button onClick={() => setShown(s => [...s, x])} className={`w-full h-full px-3 py-2 ${t.activeBg} ${t.activeTitle} font-bold hover:opacity-80`}>?</button>}
                            </td>))}</tr>
                    </tbody>
                </table>
            </div>
            <div className="mt-3 space-y-1 font-math text-base sm:text-lg">
                {shown.map(x => <div key={x} className="animate-fade-in">x = {lfS(x)}: y = {calc(x)}</div>)}
            </div>
            {all && <div className="mt-3"><Koord range={qfRangeFor([P], xs.map(x => ({ x, y: qfVal(P, x) })))} lines={[P]} points={xs.map(x => ({ x, y: qfVal(P, x) }))} /></div>}
        </div>
    );
};

// Nullstellen-Labor: Parabel y = (x − 1)² + k hoch- und runterschieben
const QLNullLab = ({ onDone }) => {
    const [k, setK] = useState(-3);
    const P = qfFromVertex(1, 1, k, 'p');
    const D = lfR(-k);
    const cnt = D < 0 ? 0 : D === 0 ? 1 : 2;
    const pts = cnt === 2 ? [1 - Math.sqrt(D), 1 + Math.sqrt(D)].map(x => ({ x, y: 0, color: '#dc2626' })) : cnt === 1 ? [{ x: 1, y: 0, color: '#dc2626' }] : [];
    const [seen, setSeen] = useState({});
    useEffect(() => { const s = { ...seen, [cnt]: true }; setSeen(s); if (onDone && s[0] && s[1] && s[2]) onDone(); /* eslint-disable-next-line */ }, [cnt]);
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
            <div className="grid md:grid-cols-2 gap-4 items-center">
                <Koord range={[-4, 6, -5, 5]} lines={[P]} points={pts} />
                <div className="space-y-3">
                    <LnSlider label="yₛ" value={k} min={-4} max={4} onChange={setK} />
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1 text-base sm:text-lg">
                        <div className="font-math">{qfNormS(P)}</div>
                        <div className="font-math">p = −2, q = {lfS(P.c)} → (p : 2)² − q = 1 − {lfP(P.c)} = <b>{lfS(D)}</b></div>
                        <div className={`font-bold ${cnt === 0 ? 'text-red-700' : cnt === 1 ? 'text-amber-700' : 'text-green-700'}`}>
                            {cnt === 0 ? 'Wert unter der Wurzel negativ → keine Nullstelle' : cnt === 1 ? 'Wert unter der Wurzel = 0 → genau eine Nullstelle (Berührpunkt)' : `Wert unter der Wurzel positiv → zwei Nullstellen: x = ${lfS(pts[0].x)} und x = ${lfS(pts[1].x)}`}
                        </div>
                    </div>
                    <p className="text-sm text-slate-600">Aufgabe: Finde alle drei Fälle — keine, genau eine und zwei Nullstellen.</p>
                    <div className="flex gap-1.5">{[0, 1, 2].map(n => <span key={n} className={`text-xs font-bold px-2 py-0.5 rounded-full border ${seen[n] ? 'bg-green-50 text-green-800 border-green-300' : 'bg-white text-slate-400 border-slate-200'}`}>{['keine', 'eine', 'zwei'][n]}</span>)}</div>
                </div>
            </div>
        </div>
    );
};

// Schnitt-Labor: Gerade y = mx + t gegen die Parabel y = x² − 1 bewegen
const QLSchnittLab = ({ onDone }) => {
    const [m, setM] = useState(1);
    const [tt, setT] = useState(1);
    const P = Pb(1, 0, -1, 'p'), g = { m, t: tt, n: 'g' };
    const D = lfR((m / 2) ** 2 + 1 + tt);
    const cnt = D < 0 ? 0 : D === 0 ? 1 : 2;
    const xsol = cnt === 2 ? [m / 2 - Math.sqrt(D), m / 2 + Math.sqrt(D)] : cnt === 1 ? [m / 2] : [];
    const pts = xsol.map(x => ({ x, y: m * x + tt, color: '#dc2626' }));
    const [seen, setSeen] = useState({});
    useEffect(() => { const s = { ...seen, [cnt]: true }; setSeen(s); if (onDone && s[0] && s[1] && s[2]) onDone(); /* eslint-disable-next-line */ }, [cnt]);
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
            <div className="grid md:grid-cols-2 gap-4 items-center">
                <Koord range={[-5, 5, -5, 6]} lines={[P, g]} points={pts} />
                <div className="space-y-3">
                    <LnSlider label="m" value={m} min={-3} max={3} step={1} onChange={setM} />
                    <LnSlider label="t" value={tt} min={-5} max={5} step={0.25} onChange={setT} />
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1 text-base sm:text-lg">
                        <div className="font-math">g: {lfGlS(m, tt)}</div>
                        <div className={`font-bold ${cnt === 0 ? 'text-red-700' : cnt === 1 ? 'text-amber-700' : 'text-green-700'}`}>
                            {cnt === 0 ? 'kein gemeinsamer Punkt' : cnt === 1 ? 'genau ein gemeinsamer Punkt — g berührt p' : 'zwei Schnittpunkte'}
                        </div>
                    </div>
                    <p className="text-sm text-slate-600">Aufgabe: Finde alle drei Fälle — zwei Schnittpunkte, ein Berührpunkt, kein gemeinsamer Punkt.</p>
                    <div className="flex gap-1.5">{[2, 1, 0].map(n => <span key={n} className={`text-xs font-bold px-2 py-0.5 rounded-full border ${seen[n] ? 'bg-green-50 text-green-800 border-green-300' : 'bg-white text-slate-400 border-slate-200'}`}>{['keiner', 'Berührpunkt', 'zwei'][n]}</span>)}</div>
                </div>
            </div>
        </div>
    );
};

// Zwei-Parabeln-Labor: p₂ = −x² + c gegen p₁ = x² − 2 schieben
const QLParabelnLab = ({ onDone }) => {
    const [c, setC] = useState(2);
    const P1 = Pb(1, 0, -2, 'p₁'), P2 = Pb(-1, 0, c, 'p₂');
    const D = lfR((c + 2) / 2);   // 2x² = c + 2
    const cnt = D < 0 ? 0 : D === 0 ? 1 : 2;
    const xsol = cnt === 2 ? [-Math.sqrt(D), Math.sqrt(D)] : cnt === 1 ? [0] : [];
    const pts = xsol.map(x => ({ x, y: qfVal(P1, x), color: '#dc2626' }));
    const [seen, setSeen] = useState({});
    useEffect(() => { const s = { ...seen, [cnt]: true }; setSeen(s); if (onDone && s[0] && s[1] && s[2]) onDone(); /* eslint-disable-next-line */ }, [cnt]);
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
            <div className="grid md:grid-cols-2 gap-4 items-center">
                <Koord range={[-5, 5, -6, 6]} lines={[P1, P2]} points={pts} />
                <div className="space-y-3">
                    <LnSlider label="c" value={c} min={-5} max={5} onChange={setC} />
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1 text-base sm:text-lg">
                        <div className="font-math">p₂: {qfNormS(P2)}</div>
                        <div className="font-math">x² − 2 = −x² {qfSgSp(c)} → 2x² = {lfS(c + 2)}</div>
                        <div className={`font-bold ${cnt === 0 ? 'text-red-700' : cnt === 1 ? 'text-amber-700' : 'text-green-700'}`}>
                            {cnt === 0 ? 'kein gemeinsamer Punkt' : cnt === 1 ? 'genau ein gemeinsamer Punkt (Berührpunkt)' : 'zwei Schnittpunkte'}
                        </div>
                    </div>
                    <p className="text-sm text-slate-600">Aufgabe: Finde alle drei Fälle.</p>
                    <div className="flex gap-1.5">{[2, 1, 0].map(n => <span key={n} className={`text-xs font-bold px-2 py-0.5 rounded-full border ${seen[n] ? 'bg-green-50 text-green-800 border-green-300' : 'bg-white text-slate-400 border-slate-200'}`}>{['keiner', 'Berührpunkt', 'zwei'][n]}</span>)}</div>
                </div>
            </div>
        </div>
    );
};

// Spiegel-Labor: Parabel an der x- oder y-Achse spiegeln
const QLSpiegelLab = ({ onDone }) => {
    const P0 = Pb(1, -4, 1, 'p');   // y = (x − 2)² − 3
    const [mode, setMode] = useState(null);
    const S0 = qfVertex(P0);
    const P2 = mode === 'x' ? qfFromVertex(-1, S0.x, -S0.y, "p'") : mode === 'y' ? qfFromVertex(1, -S0.x, S0.y, "p'") : null;
    const [seen, setSeen] = useState({});
    useEffect(() => { if (!mode) return; const s = { ...seen, [mode]: true }; setSeen(s); if (onDone && s.x && s.y) onDone(); /* eslint-disable-next-line */ }, [mode]);
    const t = themeColors[FK.theme];
    const S2 = P2 && qfVertex(P2);
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
            <div className="grid md:grid-cols-2 gap-4 items-center">
                <Koord range={[-6, 6, -6, 6]} lines={P2 ? [{ ...P0, dash: true }, P2] : [P0]} points={[{ x: S0.x, y: S0.y, n: 'S' }, ...(S2 ? [{ x: S2.x, y: S2.y, n: "S'", color: '#dc2626' }] : [])]} />
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 text-sm">
                        {[['x', 'an der x-Achse spiegeln'], ['y', 'an der y-Achse spiegeln'], [null, 'zurücksetzen']].map(([v, l]) => (
                            <button key={String(v)} onClick={() => setMode(v)} className={`px-3 py-1.5 rounded-lg border font-bold transition-colors ${mode === v && v ? `${t.btnBg} text-white border-transparent` : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}>{l}</button>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1 text-base sm:text-lg font-math">
                        <div>p: {qfVertS(P0)}, S({lfS(S0.x)} | {lfS(S0.y)})</div>
                        {P2 && <div className="text-red-700 animate-fade-in">p': {qfVertS(P2)}, S'({lfS(S2.x)} | {lfS(S2.y)})</div>}
                    </div>
                    <p className="text-sm text-slate-600">{mode === 'x' ? 'An der x-Achse: Die y-Koordinate des Scheitels wechselt das Vorzeichen, die Öffnung dreht sich um.' : mode === 'y' ? 'An der y-Achse: Die x-Koordinate des Scheitels wechselt das Vorzeichen, die Öffnung bleibt.' : 'Aufgabe: Probiere beide Spiegelungen aus.'}</p>
                </div>
            </div>
        </div>
    );
};

// Schablone: Normalparabel mit den Schablonen-Punkten
const QLSchablone = ({ a = 1, xs = 0, ys = 0 }) => {
    const P = qfFromVertex(a, xs, ys, '');
    const pts = [-3, -2, -1, 1, 2, 3].map(d => ({ x: xs + d, y: ys + a * d * d, color: '#dc2626' }));
    return <Koord range={[xs - 4, xs + 4, Math.min(ys - 1, ys + a * 9 - 1), Math.max(ys + 1, ys + a * 9 + 1)]} lines={[P]} points={[{ x: xs, y: ys, n: 'S', color: '#16a34a' }, ...pts]} />;
};

// ==========================================
// 2. LERNKARTEN
// ==========================================
const QF_LEARN_BUILD = () => {
    const opt = (...a) => a.map(s => <M>{s}</M>);
    const L = {};

    L.wertetabelle = { cards: [
        { id: 'k1', title: 'Was ist eine Parabel?', needsWidget: true,
          body: <>
            <p>Die einfachste Parabel gehört zur Funktion <M>y = x²</M>: Jede Zahl wird mit sich selbst multipliziert. Trägt man die Punkte in ein Koordinatensystem ein, entsteht die <b>Normalparabel</b> — eine symmetrische Kurve mit dem tiefsten Punkt im Ursprung.</p>
            <p>Alle Parabeln in der 10. Klasse sind solche Normalparabeln, die nur verschoben oder nach unten gedreht sind. Darum lohnt es sich, die Quadratzahlen 1, 4, 9, 16 im Kopf zu haben.</p>
          </>,
          widget: (p) => <QLTabelleLab P={Pb(1, 0, 0)} xs={[-3, -2, -1, 0, 1, 2, 3]} onDone={p.onDone} />,
          check: { q: 'Welcher y-Wert gehört bei y = x² zu x = −4?', options: opt('16', '−16', '8', '−8'), correct: 0, hint: '(−4)² bedeutet (−4) · (−4). Minus mal Minus ergibt Plus.' } },
        { id: 'k2', title: 'y-Wert berechnen: Einsetzen',
          body: <>
            <p>Bei einer Parabel wie <M>p: y = x² + 2x − 3</M> bekommst du den y-Wert, indem du die Zahl für x <b>überall</b> einsetzt. Am besten schreibst du die Zahl in Klammern — dann vergisst du kein Vorzeichen.</p>
            <p>Beispiel für <M>x = 2</M>:</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: 'y = 2² + 2 · 2 − 3', e: 'x = 2 überall einsetzen' },
            { f: 'y = 4 + 4 − 3', e: 'erst Potenz, dann Mal, dann Plus und Minus' },
            { f: 'y = 5', e: 'Der Punkt (2 | 5) liegt auf p.' }]} />,
          check: { q: 'Welcher y-Wert gehört bei p: y = x² + 2x − 3 zu x = −1?', options: opt('−4', '0', '−6', '2'), correct: 0, hint: '(−1)² = 1, dann 2 · (−1) = −2: y = 1 − 2 − 3.' } },
        { id: 'k3', title: 'Achtung Minus!',
          body: <>
            <p>Der häufigste Fehler bei Parabeln: <M>(−3)²</M> ist <b>+9</b>, denn Minus mal Minus ergibt Plus. Aber <M>−3²</M> ist <b>−9</b>, weil hier nur die 3 quadriert wird und das Minus davor stehen bleibt.</p>
            <p>Bei einer nach unten geöffneten Parabel wie <M>y = −x² + 4</M> steht genau so ein Minus vor dem Quadrat. Für <M>x = 3</M> rechnest du: <M>y = −(3)² + 4 = −9 + 4 = −5</M>. Und für <M>x = −3</M>: <M>y = −(−3)² + 4 = −9 + 4 = −5</M>. Beide Male ist das Quadrat 9 und das Minus davor macht daraus −9.</p>
          </>,
          widget: (p) => <QLTabelleLab P={Pb(-1, 0, 4)} xs={[-2, -1, 0, 1, 2]} onDone={p.onDone} />, needsWidget: true,
          check: { q: 'Welcher y-Wert gehört bei y = −x² + 1 zu x = −2?', options: opt('−3', '5', '3', '−5'), correct: 0, hint: '(−2)² = 4, mit dem Minus davor −4. Dann −4 + 1.' } },
        { id: 'k4', title: 'Punktprobe: Liegt der Punkt auf der Parabel?',
          body: <>
            <p>Mit der <b>Punktprobe</b> prüfst du rechnerisch, ob ein Punkt auf der Parabel liegt: Setze die x-Koordinate ein und vergleiche das Ergebnis mit der y-Koordinate des Punkts. Stimmen beide überein, liegt der Punkt auf der Parabel.</p>
            <p>Beispiel: Liegt <M>A(2 | 5)</M> auf <M>p: y = x² + 2x − 3</M>? Und <M>B(1 | 1)</M>?</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: 'A: y = 2² + 2 · 2 − 3 = 5', e: 'Das passt zur y-Koordinate 5 → A liegt auf p. ✓' },
            { f: 'B: y = 1² + 2 · 1 − 3 = 0', e: 'Die y-Koordinate von B ist aber 1 → B liegt nicht auf p. ✗' }]} />,
          merke: <>In der Prüfung heißt das „Überprüfe rechnerisch, ob …“. Schreibe die Rechnung hin und dann einen Antwortsatz: „A liegt auf p, weil …“.</>,
          check: { q: 'Liegt C(−3 | 0) auf p: y = x² + 2x − 3?', options: [<span>Ja, denn (−3)² + 2 · (−3) − 3 = 0</span>, <span>Nein, denn es kommt 6 heraus</span>, <span>Nein, denn es kommt −12 heraus</span>], correct: 0, hint: '9 − 6 − 3 = 0, und 0 ist genau die y-Koordinate von C.' } },
        { id: 'k5', title: 'Fehlende x-Koordinate',
          body: <>
            <p>Manchmal ist der y-Wert gegeben und x gesucht, z. B. <M>B(x | 5)</M> auf <M>p: y = x² + 2x − 3</M>. Dann setzt du y = 5 ein und bekommst eine <b>quadratische Gleichung</b>:</p>
            <p><M>5 = x² + 2x − 3</M> → <M>0 = x² + 2x − 8</M></p>
            <p>Solche Gleichungen löst du mit der pq-Formel (Thema 6). Hier kommt <M>x = 2</M> oder <M>x = −4</M> heraus. Es gibt also <b>zwei Punkte</b> mit y = 5: <M>(2 | 5)</M> und <M>(−4 | 5)</M>. Das ist typisch: Wegen der Symmetrie hat eine Parabel zu einem y-Wert meist zwei x-Werte.</p>
          </>,
          merke: <>Punktprobe: x einsetzen, y vergleichen. Fehlendes y: x einsetzen und ausrechnen. Fehlendes x: y einsetzen, alles auf eine Seite bringen, pq-Formel.</>,
          check: { q: 'Wie viele Punkte mit demselben y-Wert kann eine Parabel höchstens haben?', options: [<span>höchstens zwei</span>, <span>genau einen</span>, <span>beliebig viele</span>], correct: 0, hint: 'Eine waagrechte Linie schneidet die Parabel höchstens zweimal — links und rechts vom Scheitel.' } }
    ]};

    L.scheitel = { cards: [
        { id: 'k1', title: 'Der Scheitelpunkt',
          body: <>
            <p>Der <b>Scheitelpunkt S</b> ist der wichtigste Punkt einer Parabel: Bei einer nach oben geöffneten Parabel ist er der <b>tiefste</b> Punkt, bei einer nach unten geöffneten der <b>höchste</b>. Durch den Scheitel läuft die Symmetrieachse — links und rechts sieht die Parabel gleich aus.</p>
            <p>Probiere es aus: Verschiebe den Scheitel mit den Reglern und schalte die Öffnung um. Beobachte, wie sich die Gleichung verändert.</p>
          </>,
          widget: (p) => <QLParabelLab onDone={p.onDone} />,
          check: { q: 'Bei einer nach unten geöffneten Parabel ist der Scheitelpunkt …', options: [<span>der höchste Punkt</span>, <span>der tiefste Punkt</span>, <span>der Schnittpunkt mit der y-Achse</span>], correct: 0, hint: 'Nach unten geöffnet heißt: Die Äste zeigen nach unten, der Scheitel ist oben.' } },
        { id: 'k2', title: 'Die Scheitelpunktform lesen', needsWidget: true,
          body: <>
            <p>In der <b>Scheitelpunktform</b> <M>y = (x − xₛ)² + yₛ</M> steht der Scheitel direkt drin — aber mit einer Falle: In der Klammer ist das Vorzeichen <b>umgedreht</b>.</p>
            <p><M>y = (x − 3)² + 1</M> hat den Scheitel <M>S(3 | 1)</M>. <M>y = (x + 2)² − 4</M> hat den Scheitel <M>S(−2 | −4)</M>: „x + 2“ bedeutet xₛ = −2, und die Zahl hinter der Klammer ist yₛ ohne Änderung.</p>
          </>,
          widget: (p) => <QLParabelLab onDone={p.onDone} done={p.done} allowOpen={false} target={{ xs: -2, ys: 3 }} />,
          check: { q: 'Welchen Scheitel hat y = (x + 4)² − 1?', options: opt('S(−4 | −1)', 'S(4 | −1)', 'S(−4 | 1)', 'S(4 | 1)'), correct: 0, hint: '„x + 4“ gehört zu xₛ = −4 (Vorzeichen umdrehen). Hinter der Klammer steht −1, also yₛ = −1.' } },
        { id: 'k3', title: 'Öffnung: oben oder unten?',
          body: <>
            <p>Steht vor dem Quadrat ein <b>Minus</b>, ist die Parabel <b>nach unten</b> geöffnet: <M>y = −(x − 1)² + 2</M>. Ohne Minus ist sie nach oben geöffnet. Am Scheitel ändert das Minus nichts: Er liegt bei <M>S(1 | 2)</M>, ist jetzt aber der höchste Punkt.</p>
            <p>Beides zusammen — Öffnung und Scheitel — beschreibt eine Normalparabel vollständig. In der Prüfung heißt es dann: „die nach unten geöffnete Normalparabel mit dem Scheitelpunkt S(1 | 2)“.</p>
          </>,
          check: { q: 'Was gilt für y = −(x − 1)² + 2?', options: [<span>nach unten geöffnet, S(1 | 2)</span>, <span>nach oben geöffnet, S(1 | 2)</span>, <span>nach unten geöffnet, S(−1 | 2)</span>, <span>nach unten geöffnet, S(1 | −2)</span>], correct: 0, hint: 'Minus vor der Klammer → nach unten. In der Klammer „x − 1“ → xₛ = 1. Dahinter + 2 → yₛ = 2.' } },
        { id: 'k4', title: 'Verschieben der Normalparabel',
          body: <>
            <p>Jede Scheitelpunktform beschreibt eine <b>verschobene</b> Normalparabel: <M>y = (x − 3)² + 1</M> entsteht aus <M>y = x²</M>, indem man die Parabel um 3 nach <b>rechts</b> und um 1 nach <b>oben</b> schiebt — der Scheitel wandert vom Ursprung nach S(3 | 1).</p>
            <p>Die Form bleibt dabei gleich. Darum passt die Parabelschablone immer, egal wo der Scheitel liegt.</p>
          </>,
          widget: (p) => <QLParabelLab onDone={p.onDone} done={p.done} allowOpen={false} start={{ a: 1, xs: 0, ys: 0 }} target={{ xs: 3, ys: -2 }} />, needsWidget: true,
          check: { q: 'Wie entsteht y = (x + 1)² − 4 aus der Normalparabel y = x²?', options: [<span>1 nach links und 4 nach unten</span>, <span>1 nach rechts und 4 nach unten</span>, <span>1 nach links und 4 nach oben</span>, <span>4 nach links und 1 nach unten</span>], correct: 0, hint: 'Der Scheitel liegt bei S(−1 | −4): x-Richtung −1 (links), y-Richtung −4 (unten).' } },
        { id: 'k5', title: 'Vom Graphen zur Gleichung',
          body: <>
            <p>Zeigt die Prüfung eine Abbildung, liest du zwei Dinge ab: die <b>Öffnung</b> (oben oder unten) und den <b>Scheitel</b>. Daraus schreibst du sofort die Scheitelpunktform. Wird die Normalform verlangt, multiplizierst du anschließend aus (Thema 4).</p>
            <p>Die Parabel in der Abbildung ist nach oben geöffnet und hat den Scheitel <M>S(2 | −1)</M>. Also: <M>y = (x − 2)² − 1</M>.</p>
            <Koord range={[-2, 6, -3, 5]} lines={[Pb(1, -4, 3, 'p')]} points={[{ x: 2, y: -1, n: 'S', color: '#16a34a' }]} />
          </>,
          merke: <>Scheitelpunktform <M>y = (x − xₛ)² + yₛ</M>: Vorzeichen in der Klammer umdrehen. Minus vor der Klammer → nach unten geöffnet.</>,
          check: { q: 'Welche Gleichung hat eine nach unten geöffnete Normalparabel mit S(−3 | 2)?', options: opt('y = −(x + 3)² + 2', 'y = −(x − 3)² + 2', 'y = (x + 3)² − 2', 'y = −(x + 3)² − 2'), correct: 0, hint: 'Nach unten → Minus vor der Klammer. xₛ = −3 → in der Klammer „x + 3“. yₛ = 2 → „+ 2“.' } }
    ]};

    L.zeichnen = { cards: [
        { id: 'k1', title: 'Die Parabelschablone',
          body: <>
            <p>Du musst Parabeln nie Punkt für Punkt berechnen. Die Normalparabel hat immer dieselbe Form: Vom Scheitel aus gehst du <b>1 nach rechts und 1 nach oben</b>, <b>2 nach rechts und 4 nach oben</b>, <b>3 nach rechts und 9 nach oben</b> — und nach links genauso. Das sind die Quadratzahlen.</p>
            <p>Genau diese Form hat deine Parabelschablone. Du musst nur wissen, wo der Scheitel liegt und wohin die Parabel geöffnet ist.</p>
            <QLSchablone />
          </>,
          check: { q: 'Du gehst vom Scheitel einer nach oben geöffneten Normalparabel 2 nach rechts. Wie viel musst du nach oben gehen?', options: opt('4', '2', '8', '1'), correct: 0, hint: '2² = 4. Die Schritte nach oben sind die Quadratzahlen 1, 4, 9.' } },
        { id: 'k2', title: 'Zeichnen in drei Schritten',
          body: <>
            <p><b>1. Scheitel einzeichnen.</b> Aus der Scheitelpunktform ablesen, z. B. <M>y = (x − 1)² − 2</M> → <M>S(1 | −2)</M>.</p>
            <p><b>2. Schablone anlegen.</b> Die Spitze der Schablone auf den Scheitel, die Mittellinie senkrecht — bei nach oben geöffneten Parabeln mit der Spitze nach unten.</p>
            <p><b>3. Kontrollpunkte prüfen.</b> 1 nach rechts, 1 nach oben: (2 | −1). 2 nach rechts, 4 nach oben: (3 | 2). Wenn das passt, stimmt die Lage.</p>
            <QLSchablone xs={1} ys={-2} />
          </>,
          check: { q: 'Welcher Punkt liegt auf y = (x + 1)² − 2, wenn du vom Scheitel 2 nach rechts gehst?', options: opt('(1 | 2)', '(1 | 0)', '(3 | 2)', '(−3 | −2)'), correct: 0, hint: 'Scheitel S(−1 | −2). 2 nach rechts → x = 1, 4 nach oben → y = 2.' } },
        { id: 'k3', title: 'Nach unten geöffnet',
          body: <>
            <p>Steht ein Minus vor der Klammer, drehst du die Schablone um: Spitze nach oben, der Scheitel ist der höchste Punkt. Die Kontrollpunkte gehen jetzt <b>nach unten</b>: 1 nach rechts und 1 nach unten, 2 nach rechts und 4 nach unten.</p>
            <p>Beispiel <M>y = −(x − 2)² + 3</M>: Scheitel <M>S(2 | 3)</M>, Kontrollpunkte (3 | 2) und (4 | −1).</p>
            <QLSchablone a={-1} xs={2} ys={3} />
          </>,
          check: { q: 'Welcher Punkt liegt auf y = −(x − 2)² + 3 direkt rechts neben dem Scheitel (1 nach rechts)?', options: opt('(3 | 2)', '(3 | 4)', '(1 | 4)', '(3 | 3)'), correct: 0, hint: 'Nach unten geöffnet: 1 nach rechts und 1 nach unten vom Scheitel S(2 | 3).' } },
        { id: 'k4', title: 'Wenn der Scheitel nicht auf dem Raster liegt',
          body: <>
            <p>In Prüfungen hat der Scheitel oft halbe Koordinaten, z. B. <M>p: y = x² − 3x + 1</M> mit <M>S(1,5 | −1,25)</M>. Dann hilft eine kleine <b>Wertetabelle</b> mit ganzen x-Werten rund um den Scheitel:</p>
            <LfTabelle xs={['0', '1', '2', '3']} ys={['1', '−1', '−1', '1']} />
            <p>Die Punkte (1 | −1) und (2 | −1) liegen symmetrisch zum Scheitel, genau wie (0 | 1) und (3 | 1). Mit diesen Punkten legst du die Schablone an — die Spitze bleibt dann ein Stück unter dem Raster.</p>
          </>,
          merke: <>Zeichnen: Scheitel ablesen oder berechnen, Schablone anlegen, mit den Schablonen-Punkten (1 | 1), (2 | 4) kontrollieren. Bei halben Scheitelkoordinaten eine Wertetabelle machen.</>,
          check: { q: 'Welcher Punkt liegt auf p: y = x² − 3x + 1?', options: opt('(0 | 1)', '(1 | 1)', '(2 | 3)', '(3 | −1)'), correct: 0, hint: 'x = 0 einsetzen: 0 − 0 + 1 = 1.' } }
    ]};

    L.normalform = { cards: [
        { id: 'k1', title: 'Zwei Schreibweisen, eine Parabel',
          body: <>
            <p>Dieselbe Parabel kann man auf zwei Arten schreiben: In der <b>Scheitelpunktform</b> <M>y = (x − 3)² + 2</M> siehst du den Scheitel S(3 | 2). In der <b>Normalform</b> <M>y = x² − 6x + 11</M> siehst du den y-Achsenabschnitt: Für x = 0 ist y = 11, die Parabel schneidet die y-Achse in (0 | 11).</p>
            <p>Beide Gleichungen beschreiben genau dieselbe Kurve. Die Prüfung verlangt oft: „Ermittle die Funktionsgleichung in der Normalform“ — dann musst du von der einen Form in die andere umrechnen.</p>
          </>,
          widget: (p) => <QLParabelLab onDone={p.onDone} showNorm={true} allowOpen={false} start={{ a: 1, xs: 3, ys: 2 }} />,
          check: { q: 'Was liest du an der Normalform y = x² + px + q direkt ab?', options: [<span>den Schnittpunkt mit der y-Achse (0 | q)</span>, <span>den Scheitelpunkt</span>, <span>die Nullstellen</span>], correct: 0, hint: 'Setze x = 0 ein: y = q. Mehr steht in der Normalform nicht direkt drin.' } },
        { id: 'k2', title: 'Das Werkzeug: binomische Formeln',
          body: <>
            <p>Um die Klammer aufzulösen, brauchst du die <b>binomischen Formeln</b>: <M>(x + b)² = x² + 2bx + b²</M> und <M>(x − b)² = x² − 2bx + b²</M>. Das mittlere Glied ist das <b>Doppelte</b> der Zahl, das letzte ihr <b>Quadrat</b> — und das ist immer positiv.</p>
            <p>Beispiel <M>(x − 3)²</M>:</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: '(x − 3)² = x² − 2 · 3 · x + 3²', e: '2. binomische Formel' },
            { f: '= x² − 6x + 9', e: 'Doppeltes von 3 ist 6, Quadrat von 3 ist 9' }]} />,
          check: { q: 'Was ergibt (x + 5)²?', options: opt('x² + 10x + 25', 'x² + 25', 'x² + 5x + 25', 'x² + 10x + 10'), correct: 0, hint: 'Mittleres Glied 2 · 5 · x = 10x, letztes Glied 5² = 25.' } },
        { id: 'k3', title: 'Schritt für Schritt zur Normalform',
          body: <>
            <p>Jetzt alles zusammen: Von <M>y = (x − 3)² + 2</M> zur Normalform. Erst die Klammer mit der binomischen Formel auflösen, dann die Zahlen zusammenfassen.</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: 'y = (x − 3)² + 2', e: 'Scheitelpunktform' },
            { f: 'y = x² − 6x + 9 + 2', e: 'Klammer mit der 2. binomischen Formel auflösen' },
            { f: 'y = x² − 6x + 11', e: 'Zahlen zusammenfassen: 9 + 2 = 11' }]} />,
          check: { q: 'Wie lautet die Normalform von y = (x + 1)² − 4?', options: opt('y = x² + 2x − 3', 'y = x² + 2x + 5', 'y = x² + x − 3', 'y = x² − 2x − 3'), correct: 0, hint: '(x + 1)² = x² + 2x + 1. Dann 1 − 4 = −3.' } },
        { id: 'k4', title: 'Mit Minus vor der Klammer',
          body: <>
            <p>Bei einer nach unten geöffneten Parabel steht ein Minus vor der Klammer: <M>y = −(x − 2)² + 5</M>. Löse zuerst die Klammer auf und lass das Minus davor stehen. Dann dreht das Minus <b>alle Vorzeichen</b> in der Klammer um.</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: 'y = −(x − 2)² + 5', e: 'Scheitelpunktform' },
            { f: 'y = −(x² − 4x + 4) + 5', e: 'binomische Formel in der Klammer' },
            { f: 'y = −x² + 4x − 4 + 5', e: 'Minus vor der Klammer: alle Vorzeichen drehen' },
            { f: 'y = −x² + 4x + 1', e: 'zusammenfassen: −4 + 5 = 1' }]} />,
          check: { q: 'Wie lautet die Normalform von y = −(x + 1)² + 3?', options: opt('y = −x² − 2x + 2', 'y = −x² + 2x + 2', 'y = −x² − 2x + 4', 'y = x² + 2x + 2'), correct: 0, hint: '(x + 1)² = x² + 2x + 1. Mit Minus: −x² − 2x − 1. Dann −1 + 3 = 2.' } },
        { id: 'k5', title: 'Halbe Zahlen',
          body: <>
            <p>Oft hat der Scheitel halbe Koordinaten, z. B. <M>S(2,5 | 2)</M>. Die binomische Formel funktioniert genauso: <M>(x − 2,5)² = x² − 5x + 6,25</M>. Das Doppelte von 2,5 ist 5, das Quadrat 6,25.</p>
            <p>Also: <M>y = (x − 2,5)² + 2 = x² − 5x + 6,25 + 2 = x² − 5x + 8,25</M>.</p>
          </>,
          merke: <>Scheitelpunktform → Normalform: 1. Klammer mit binomischer Formel auflösen. 2. Bei Minus vor der Klammer alle Vorzeichen drehen. 3. Zahlen zusammenfassen. Quadrate halber Zahlen: 0,5² = 0,25 · 1,5² = 2,25 · 2,5² = 6,25 · 3,5² = 12,25.</>,
          check: { q: 'Was ergibt (x − 1,5)²?', options: opt('x² − 3x + 2,25', 'x² − 3x + 1,5', 'x² − 1,5x + 2,25', 'x² + 3x + 2,25'), correct: 0, hint: 'Doppeltes von 1,5 ist 3, Quadrat von 1,5 ist 2,25.' } }
    ]};

    L.scheitelform = { cards: [
        { id: 'k1', title: 'Warum quadratische Ergänzung?',
          body: <>
            <p>Aus der Normalform <M>y = x² + 6x + 7</M> kannst du den Scheitel nicht direkt ablesen. Du brauchst die Scheitelpunktform — also wieder eine Klammer <M>(x + …)²</M>.</p>
            <p>Die Idee: <M>x² + 6x</M> ist fast eine binomische Formel. <M>(x + 3)² = x² + 6x + 9</M> — es fehlt nur die 9. Diese Zahl „ergänzt“ man, daher der Name <b>quadratische Ergänzung</b>. Sie ist immer <M>(p : 2)²</M>: die Hälfte des x-Koeffizienten, quadriert.</p>
          </>,
          check: { q: 'Welche Zahl macht aus x² − 8x + ? eine binomische Formel?', options: opt('16', '64', '4', '−16'), correct: 0, hint: '(−8 : 2)² = (−4)² = 16. Dann ist x² − 8x + 16 = (x − 4)².' } },
        { id: 'k2', title: 'Die quadratische Ergänzung Schritt für Schritt',
          body: <>
            <p>Du darfst die Ergänzung nicht einfach dazuaddieren — das würde die Parabel verändern. Deshalb addierst du sie und ziehst sie <b>sofort wieder ab</b>. So bleibt alles gleich, aber du kannst eine Klammer bilden.</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: 'y = x² + 6x + 7', e: 'p = 6, also (6 : 2)² = 9' },
            { f: 'y = x² + 6x + 9 − 9 + 7', e: '9 ergänzen und sofort wieder abziehen' },
            { f: 'y = (x + 3)² − 9 + 7', e: 'x² + 6x + 9 ist (x + 3)²' },
            { f: 'y = (x + 3)² − 2', e: 'zusammenfassen → S(−3 | −2)' }]} />,
          check: { q: 'Welchen Scheitel hat y = x² − 4x + 1?', options: opt('S(2 | −3)', 'S(−2 | −3)', 'S(2 | 5)', 'S(4 | 1)'), correct: 0, hint: '(−4 : 2)² = 4: y = x² − 4x + 4 − 4 + 1 = (x − 2)² − 3.' } },
        { id: 'k3', title: 'Die Abkürzung: xₛ = −p : 2',
          body: <>
            <p>Schau dir das Ergebnis an: Bei <M>y = x² + 6x + 7</M> ist <M>xₛ = −3</M>, also genau <M>−p : 2</M>. Das gilt immer! Die y-Koordinate bekommst du, indem du xₛ in die Gleichung einsetzt: <M>yₛ = (−3)² + 6 · (−3) + 7 = 9 − 18 + 7 = −2</M>.</p>
            <p>Diese Abkürzung ist gut zum Kontrollieren. In der Prüfung steht aber meist „Bestimme rechnerisch“ — dann wird die quadratische Ergänzung als Rechenweg erwartet.</p>
          </>,
          check: { q: 'Welchen Scheitel hat y = x² + 10x + 20?', options: opt('S(−5 | −5)', 'S(5 | −5)', 'S(−5 | 20)', 'S(−10 | 20)'), correct: 0, hint: 'xₛ = −10 : 2 = −5. yₛ = 25 − 50 + 20 = −5.' } },
        { id: 'k4', title: 'Mit Minus vor x²',
          body: <>
            <p>Bei <M>y = −x² + 4x − 1</M> klammerst du zuerst bei den x-Termen <M>−1</M> aus. Dadurch dreht sich das Vorzeichen des x-Terms um: <M>−x² + 4x = −(x² − 4x)</M>. Dann ergänzt du <b>innerhalb</b> der Klammer.</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: 'y = −x² + 4x − 1', e: 'Normalform' },
            { f: 'y = −(x² − 4x) − 1', e: '−1 ausklammern: Vorzeichen des x-Terms dreht sich' },
            { f: 'y = −(x² − 4x + 4 − 4) − 1', e: 'in der Klammer (−4 : 2)² = 4 ergänzen und abziehen' },
            { f: 'y = −((x − 2)² − 4) − 1', e: 'binomische Formel bilden' },
            { f: 'y = −(x − 2)² + 4 − 1', e: 'Minus vor der Klammer: aus −4 wird +4' },
            { f: 'y = −(x − 2)² + 3', e: 'S(2 | 3), nach unten geöffnet' }]} />,
          check: { q: 'Welchen Scheitel hat y = −x² − 6x − 5?', options: opt('S(−3 | 4)', 'S(3 | 4)', 'S(−3 | −4)', 'S(−3 | −14)'), correct: 0, hint: 'y = −(x² + 6x) − 5 = −(x + 3)² + 9 − 5 = −(x + 3)² + 4. Oder: xₛ = −(−6) : 2 … Vorsicht, bei Minus vor x² ist xₛ = −3; dann einsetzen: −9 + 18 − 5 = 4.' } },
        { id: 'k5', title: 'Was bringt die Scheitelpunktform?',
          body: <>
            <p>Mit dem Scheitel weißt du sofort, wo die Parabel liegt. Du kannst sie zeichnen, und du kannst Fragen beantworten wie: „Schneidet die Parabel die x-Achse?“ Eine nach oben geöffnete Parabel mit Scheitel <b>über</b> der x-Achse (yₛ &gt; 0) kommt nie bis zur x-Achse hinunter — sie hat keine Nullstellen.</p>
          </>,
          merke: <>Normalform → Scheitelpunktform: 1. Bei Minus vor x² zuerst −1 ausklammern. 2. (p : 2)² ergänzen und sofort abziehen. 3. Binomische Formel bilden, Zahlen zusammenfassen. Kontrolle: xₛ = −p : 2.</>,
          check: { q: 'Eine nach oben geöffnete Normalparabel hat den Scheitel S(1 | 2). Wie viele Nullstellen hat sie?', options: [<span>keine</span>, <span>genau eine</span>, <span>zwei</span>], correct: 0, hint: 'Der tiefste Punkt liegt bei y = 2, also über der x-Achse. Die Parabel erreicht die x-Achse nicht.' } }
    ]};

    L.nullstellen = { cards: [
        { id: 'k1', title: 'Was sind Nullstellen?', needsWidget: true,
          body: <>
            <p><b>Nullstellen</b> sind die x-Werte, an denen die Parabel die x-Achse schneidet oder berührt. Dort ist <M>y = 0</M>. Je nach Lage der Parabel gibt es zwei, eine oder keine Nullstelle.</p>
            <p>Schiebe die Parabel hoch und runter und beobachte, was mit den Nullstellen passiert — und mit dem Wert unter der Wurzel.</p>
          </>,
          widget: (p) => <QLNullLab onDone={p.onDone} />,
          check: { q: 'Was gilt an einer Nullstelle?', options: opt('y = 0', 'x = 0', 'x = y'), correct: 0, hint: 'Auf der x-Achse hat jeder Punkt die y-Koordinate 0.' } },
        { id: 'k2', title: 'Die pq-Formel',
          body: <>
            <p>Setzt du y = 0, entsteht eine Gleichung der Form <M>x² + px + q = 0</M>. Die löst die <b>pq-Formel</b> aus der Formelsammlung: <M>x₁,₂ = −p : 2 ± √((p : 2)² − q)</M>. Dabei ist p die Zahl vor dem x und q die Zahl ohne x — <b>mit Vorzeichen</b>!</p>
            <p>Beispiel <M>x² − 2x − 8 = 0</M>: p = −2, q = −8.</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: 'x₁,₂ = 1 ± √(1² − (−8))', e: '−p : 2 = 1, (p : 2)² = 1, q = −8 einsetzen' },
            { f: 'x₁,₂ = 1 ± √9 = 1 ± 3', e: 'Wert unter der Wurzel: 1 + 8 = 9' },
            { f: 'x₁ = 4 und x₂ = −2', e: 'einmal plus, einmal minus' }]} />,
          check: { q: 'Welche Werte haben p und q bei x² + 6x − 7 = 0?', options: opt('p = 6, q = −7', 'p = −6, q = 7', 'p = 6, q = 7', 'p = 3, q = −7'), correct: 0, hint: 'p steht vor dem x (hier +6), q ist die Zahl ohne x (hier −7). Vorzeichen mitnehmen!' } },
        { id: 'k3', title: 'Zwei, eine oder keine Lösung',
          body: <>
            <p>Entscheidend ist der <b>Wert unter der Wurzel</b> <M>(p : 2)² − q</M>:</p>
            <p>Ist er <b>positiv</b>, gibt es zwei Lösungen (plus und minus). Ist er <b>0</b>, gibt es genau eine Lösung, denn √0 = 0 — die Parabel berührt die x-Achse im Scheitel. Ist er <b>negativ</b>, gibt es keine Lösung, denn aus einer negativen Zahl kann man keine Wurzel ziehen — die Parabel kommt nicht bis zur x-Achse.</p>
            <p>Genau das verlangt die Prüfungsaufgabe „Zeige, dass die Parabel die x-Achse nicht schneidet“: Rechne den Wert unter der Wurzel aus und zeige, dass er negativ ist.</p>
          </>,
          check: { q: 'Wie viele Lösungen hat x² + 2x + 5 = 0?', options: [<span>keine, denn 1 − 5 = −4 ist negativ</span>, <span>genau eine, denn 1 − 5 ≠ 0</span>, <span>zwei, denn 1 + 5 = 6</span>], correct: 0, hint: '(p : 2)² − q = (2 : 2)² − 5 = 1 − 5 = −4.' } },
        { id: 'k4', title: 'Wenn vor x² ein Minus steht',
          body: <>
            <p>Die pq-Formel funktioniert nur, wenn vor <M>x²</M> eine 1 steht. Bei <M>−x² + 4x − 3 = 0</M> multiplizierst du deshalb zuerst die ganze Gleichung mit <M>(−1)</M>: Alle Vorzeichen drehen sich um.</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: '0 = −x² + 4x − 3   | · (−1)', e: 'y = 0 gesetzt' },
            { f: '0 = x² − 4x + 3', e: 'alle Vorzeichen gedreht: p = −4, q = 3' },
            { f: 'x₁,₂ = 2 ± √(4 − 3) = 2 ± 1', e: 'pq-Formel' },
            { f: 'x₁ = 3 und x₂ = 1', e: 'N₁(3 | 0), N₂(1 | 0)' }]} />,
          check: { q: 'Wie lautet −x² + 2x + 8 = 0 nach dem Multiplizieren mit (−1)?', options: opt('x² − 2x − 8 = 0', 'x² + 2x + 8 = 0', 'x² − 2x + 8 = 0', '−x² − 2x − 8 = 0'), correct: 0, hint: 'Jede Zahl wechselt das Vorzeichen, auch die 8.' } },
        { id: 'k5', title: 'Nullstellen und Scheitel',
          body: <>
            <p>Wegen der Symmetrie liegt der Scheitel immer <b>genau in der Mitte</b> zwischen den beiden Nullstellen. Bei den Nullstellen 1 und 3 ist <M>xₛ = 2</M>. Das ist eine gute Kontrolle: Passt die Mitte nicht zu <M>−p : 2</M>, hast du dich verrechnet.</p>
          </>,
          merke: <>Nullstellen: y = 0 setzen. Falls Minus vor x²: mit (−1) multiplizieren. pq-Formel: <M>x₁,₂ = −p : 2 ± √((p : 2)² − q)</M>. Wert unter der Wurzel positiv → zwei, null → eine, negativ → keine Nullstelle.</>,
          check: { q: 'Eine Parabel hat die Nullstellen 1 und 5. Wo liegt xₛ?', options: opt('xₛ = 3', 'xₛ = 2', 'xₛ = 4', 'xₛ = 6'), correct: 0, hint: 'Die Mitte von 1 und 5 ist (1 + 5) : 2 = 3.' } }
    ]};

    L.zweipunkte = { cards: [
        { id: 'k1', title: 'Was ist gesucht?',
          body: <>
            <p>Eine nach oben geöffnete Normalparabel hat die Gleichung <M>y = x² + px + q</M>. Darin sind <b>zwei Zahlen unbekannt</b>: p und q. Um zwei Unbekannte zu bestimmen, brauchst du zwei Gleichungen — und die bekommst du aus <b>zwei Punkten</b>, die auf der Parabel liegen.</p>
            <p>Bei einer nach unten geöffneten Parabel ist es genauso, nur mit <M>y = −x² + px + q</M>.</p>
          </>,
          check: { q: 'Wie viele Punkte braucht man, um eine Normalparabel y = x² + px + q zu bestimmen?', options: [<span>zwei, weil p und q unbekannt sind</span>, <span>einen, weil die Form feststeht</span>, <span>drei, weil es drei Terme gibt</span>], correct: 0, hint: 'Zwei Unbekannte → zwei Gleichungen → zwei Punkte.' } },
        { id: 'k2', title: 'Punkte einsetzen',
          body: <>
            <p>Die Parabel <M>y = x² + px + q</M> geht durch <M>A(1 | 2)</M> und <M>B(−2 | −1)</M>. Setze jeden Punkt ein (x und y!) und bringe die Zahl von x² auf die linke Seite. So entstehen zwei Gleichungen mit p und q.</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: 'A: 2 = 1² + 1 · p + q', e: 'x = 1 und y = 2 eingesetzt' },
            { f: '(I)  p + q = 1', e: '1 auf die linke Seite: 2 − 1 = 1' },
            { f: 'B: −1 = (−2)² + (−2) · p + q', e: 'x = −2 und y = −1 eingesetzt' },
            { f: '(II)  −2p + q = −5', e: '(−2)² = 4 auf die linke Seite: −1 − 4 = −5' }]} />,
          check: { q: 'Welche Gleichung entsteht, wenn du C(3 | 4) in y = x² + px + q einsetzt?', options: opt('3p + q = −5', '3p + q = 4', '9p + q = 4', '3p + q = 13'), correct: 0, hint: '4 = 9 + 3p + q. Die 9 auf die linke Seite: 4 − 9 = −5.' } },
        { id: 'k3', title: 'Das Gleichungssystem lösen',
          body: <>
            <p>Jetzt hast du ein lineares Gleichungssystem. Da in beiden Gleichungen „+ q“ steht, ist das <b>Subtraktionsverfahren</b> am schnellsten: (I) − (II) lässt q verschwinden.</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: '(I) − (II):  p − (−2p) = 1 − (−5)', e: 'q − q fällt weg' },
            { f: '3p = 6  →  p = 2', e: 'durch 3 teilen' },
            { f: 'in (I):  2 + q = 1  →  q = −1', e: 'p einsetzen' },
            { f: 'p: y = x² + 2x − 1', e: 'Probe mit A: 1 + 2 − 1 = 2 ✓' }]} />,
          check: { q: 'Aus (I) p + q = 1 und (II) −2p + q = −5 folgt …', options: opt('p = 2, q = −1', 'p = −2, q = 3', 'p = 1, q = 0', 'p = 3, q = −2'), correct: 0, hint: '(I) − (II): 3p = 6, also p = 2. Dann q = 1 − 2 = −1.' } },
        { id: 'k4', title: 'Nach unten geöffnet',
          body: <>
            <p>Bei <M>y = −x² + px + q</M> musst du beim Einsetzen an das Minus denken: Für <M>A(1 | 3)</M> gilt <M>3 = −1² + p + q = −1 + p + q</M>, also <M>p + q = 4</M>. Die Zahl, die auf die andere Seite wandert, ist jetzt <b>−1</b>, und aus 3 − (−1) wird 4.</p>
          </>,
          check: { q: 'B(2 | −1) liegt auf y = −x² + px + q. Welche Gleichung entsteht?', options: opt('2p + q = 3', '2p + q = −5', '2p + q = −1', '4p + q = 3'), correct: 0, hint: '−1 = −4 + 2p + q. Die −4 auf die linke Seite: −1 + 4 = 3.' } },
        { id: 'k5', title: 'Probe nicht vergessen',
          body: <>
            <p>Zum Schluss setzt du beide Punkte in deine fertige Gleichung ein. Stimmen beide y-Werte, ist alles richtig. Das dauert eine Minute und rettet in der Prüfung Punkte, weil Vorzeichenfehler beim Einsetzen häufig sind.</p>
          </>,
          merke: <>Parabel durch zwei Punkte: 1. Beide Punkte in y = ±x² + px + q einsetzen. 2. Zahl von ±x² auf die linke Seite. 3. (I) − (II) → p. 4. p einsetzen → q. 5. Probe.</>,
          check: { q: 'Wozu dient die Probe am Ende?', options: [<span>Beide Punkte müssen die fertige Gleichung erfüllen — sonst steckt ein Fehler drin</span>, <span>Sie ersetzt das Gleichungssystem</span>, <span>Sie bestimmt die Öffnung der Parabel</span>], correct: 0, hint: 'Einsetzen und vergleichen, wie bei der Punktprobe.' } }
    ]};

    L.spiegeln = { cards: [
        { id: 'k1', title: 'Verschieben', needsWidget: true,
          body: <>
            <p>Wird eine Parabel verschoben, wandert nur der <b>Scheitel</b> mit — Form und Öffnung bleiben gleich. „2 nach links und 3 nach oben“ heißt: <M>xₛ − 2</M> und <M>yₛ + 3</M>. Danach schreibst du einfach die neue Scheitelpunktform auf.</p>
            <p>Beispiel: <M>y = (x − 1)² + 2</M> mit S(1 | 2), verschoben um 2 nach links und 3 nach unten → S'(−1 | −1) → <M>y = (x + 1)² − 1</M>.</p>
          </>,
          widget: (p) => <QLParabelLab onDone={p.onDone} done={p.done} allowOpen={false} start={{ a: 1, xs: 1, ys: 2 }} target={{ xs: -1, ys: -1 }} />,
          check: { q: 'y = (x − 1)² + 2 wird um 3 nach rechts und 1 nach unten verschoben. Neue Gleichung?', options: opt('y = (x − 4)² + 1', 'y = (x + 2)² + 1', 'y = (x − 4)² + 3', 'y = (x − 2)² + 1'), correct: 0, hint: 'S(1 | 2) → S\'(1 + 3 | 2 − 1) = S\'(4 | 1). In der Klammer „x − 4“.' } },
        { id: 'k2', title: 'Spiegeln an der x-Achse', needsWidget: true,
          body: <>
            <p>Beim Spiegeln an der <b>x-Achse</b> klappt die Parabel nach unten (oder nach oben): Die <b>Öffnung dreht sich um</b>, und die <b>y-Koordinate des Scheitels</b> wechselt das Vorzeichen. Die x-Koordinate bleibt.</p>
            <p>Probiere beide Spiegelungen im Labor aus.</p>
          </>,
          widget: (p) => <QLSpiegelLab onDone={p.onDone} />,
          check: { q: 'y = (x − 2)² − 3 wird an der x-Achse gespiegelt. Neue Gleichung?', options: opt('y = −(x − 2)² + 3', 'y = (x + 2)² − 3', 'y = −(x − 2)² − 3', 'y = (x − 2)² + 3'), correct: 0, hint: 'S(2 | −3) → S\'(2 | 3), und ein Minus kommt vor die Klammer.' } },
        { id: 'k3', title: 'Spiegeln an der y-Achse',
          body: <>
            <p>Beim Spiegeln an der <b>y-Achse</b> springt die Parabel von links nach rechts: Die <b>x-Koordinate des Scheitels</b> wechselt das Vorzeichen. Die Öffnung und die y-Koordinate bleiben gleich.</p>
            <p>Beispiel: <M>y = (x − 2)² − 3</M> mit S(2 | −3) → S'(−2 | −3) → <M>y = (x + 2)² − 3</M>. In der Klammer dreht sich das Vorzeichen — wie immer bei der Scheitelpunktform.</p>
          </>,
          check: { q: 'y = −(x + 1)² + 4 wird an der y-Achse gespiegelt. Neue Gleichung?', options: opt('y = −(x − 1)² + 4', 'y = (x + 1)² − 4', 'y = −(x + 1)² − 4', 'y = (x − 1)² + 4'), correct: 0, hint: 'S(−1 | 4) → S\'(1 | 4). Die Öffnung bleibt nach unten, also bleibt das Minus.' } },
        { id: 'k4', title: 'Doppelt spiegeln',
          body: <>
            <p>Spiegelt man erst an der einen und dann an der anderen Achse, wechseln <b>beide</b> Scheitelkoordinaten das Vorzeichen und die Öffnung dreht sich einmal um. Die Reihenfolge ist egal. Für die Prüfung schreibst du am besten jeden Zwischenscheitel auf: S → S₁ → S'.</p>
          </>,
          merke: <>x-Achse: yₛ wechselt das Vorzeichen, Öffnung dreht sich. y-Achse: xₛ wechselt das Vorzeichen, Öffnung bleibt. Verschieben: Scheitel wandert, sonst ändert sich nichts.</>,
          check: { q: 'Eine nach unten geöffnete Parabel mit S(−1 | 4) wird an der y-Achse und dann an der x-Achse gespiegelt. Ergebnis?', options: [<span>S'(1 | −4), nach oben geöffnet</span>, <span>S'(1 | 4), nach unten geöffnet</span>, <span>S'(−1 | −4), nach unten geöffnet</span>, <span>S'(1 | −4), nach unten geöffnet</span>], correct: 0, hint: 'y-Achse: S₁(1 | 4), noch nach unten. x-Achse: S\'(1 | −4), jetzt nach oben.' } }
    ]};

    L.gerade = { cards: [
        { id: 'k1', title: 'Gemeinsame Punkte', needsWidget: true,
          body: <>
            <p>Eine Gerade kann eine Parabel <b>zweimal schneiden</b>, sie <b>einmal berühren</b> oder <b>ganz verfehlen</b>. Bewege die Gerade mit den Reglern für m und t und finde alle drei Fälle.</p>
          </>,
          widget: (p) => <QLSchnittLab onDone={p.onDone} />,
          check: { q: 'Wie viele gemeinsame Punkte können eine Gerade und eine Parabel höchstens haben?', options: opt('zwei', 'einen', 'drei'), correct: 0, hint: 'Beim Gleichsetzen entsteht eine quadratische Gleichung — und die hat höchstens zwei Lösungen.' } },
        { id: 'k2', title: 'Gleichsetzen',
          body: <>
            <p>An einem gemeinsamen Punkt haben Parabel und Gerade denselben y-Wert. Deshalb setzt du die beiden Terme <b>gleich</b> und bringst alles auf eine Seite, bis <M>0 = x² + px + q</M> dasteht.</p>
            <p>Beispiel <M>p: y = x² − 1</M> und <M>g: y = x + 1</M>:</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: 'x² − 1 = x + 1', e: 'Terme gleichsetzen' },
            { f: 'x² − 1 − x − 1 = 0', e: 'x + 1 auf die linke Seite (Vorzeichen drehen)' },
            { f: 'x² − x − 2 = 0', e: 'zusammenfassen: p = −1, q = −2' }]} />,
          check: { q: 'p: y = x² + 2x und g: y = 3x + 2. Welche Gleichung entsteht beim Gleichsetzen?', options: opt('x² − x − 2 = 0', 'x² + 5x + 2 = 0', 'x² − x + 2 = 0', 'x² + x − 2 = 0'), correct: 0, hint: 'x² + 2x − 3x − 2 = 0.' } },
        { id: 'k3', title: 'Lösen und y-Werte berechnen',
          body: <>
            <p>Die Gleichung löst du mit der pq-Formel. Die Lösungen sind die <b>x-Koordinaten</b> der Schnittpunkte. Die y-Koordinaten bekommst du durch Einsetzen — am einfachsten in die <b>Geradengleichung</b>.</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: 'x₁,₂ = 0,5 ± √(0,25 + 2) = 0,5 ± 1,5', e: 'pq-Formel mit p = −1, q = −2' },
            { f: 'x₁ = 2 und x₂ = −1', e: 'zwei Lösungen' },
            { f: 'g: y = 2 + 1 = 3  und  y = −1 + 1 = 0', e: 'x in die Gerade einsetzen' },
            { f: 'S₁(2 | 3), S₂(−1 | 0)', e: 'Kontrolle in p: 4 − 1 = 3 ✓, 1 − 1 = 0 ✓' }]} />,
          check: { q: 'Warum setzt man die x-Werte meist in die Geradengleichung ein?', options: [<span>Weil die Rechnung einfacher ist — beide Gleichungen liefern denselben y-Wert</span>, <span>Weil die Parabel falsche y-Werte liefert</span>, <span>Weil nur die Gerade durch den Schnittpunkt geht</span>], correct: 0, hint: 'Am Schnittpunkt liegen beide Graphen — der y-Wert ist in beiden gleich.' } },
        { id: 'k4', title: 'Berühren oder verfehlen',
          body: <>
            <p>Der Wert unter der Wurzel entscheidet wieder: Ist er <b>0</b>, gibt es genau eine Lösung — die Gerade <b>berührt</b> die Parabel in einem Punkt (Berührpunkt). Ist er <b>negativ</b>, gibt es keine Lösung — Gerade und Parabel haben <b>keinen gemeinsamen Punkt</b>.</p>
            <p>Prüfungsaufgaben wie „Zeige rechnerisch, dass g keinen gemeinsamen Punkt mit p hat“ löst du also so: gleichsetzen, pq-Formel ansetzen, negativen Wert unter der Wurzel zeigen.</p>
          </>,
          check: { q: 'Beim Gleichsetzen kommt unter der Wurzel 0 heraus. Was bedeutet das?', options: [<span>Die Gerade berührt die Parabel in genau einem Punkt</span>, <span>Es gibt zwei Schnittpunkte</span>, <span>Es gibt keinen gemeinsamen Punkt</span>], correct: 0, hint: '√0 = 0, also gibt es nur eine Lösung: x = −p : 2.' } },
        { id: 'k5', title: 'Gerade erst umformen',
          body: <>
            <p>Manchmal ist die Gerade nicht in der Form y = mx + t gegeben, z. B. <M>g: 2y + 4x = 6</M>. Dann stellst du zuerst nach y um: <M>2y = −4x + 6</M>, dann durch 2 teilen: <M>y = −2x + 3</M>. Erst danach kannst du gleichsetzen.</p>
          </>,
          merke: <>Parabel und Gerade: 1. Gerade in die Form y = mx + t bringen. 2. Terme gleichsetzen, alles auf eine Seite. 3. pq-Formel → x-Werte. 4. x in die Gerade einsetzen → y-Werte. Wurzelwert 0 → Berührpunkt, negativ → kein gemeinsamer Punkt.</>,
          check: { q: 'Wie lautet g: 3y − 6x = 9 in der Form y = mx + t?', options: opt('y = 2x + 3', 'y = −2x + 3', 'y = 6x + 9', 'y = 2x − 3'), correct: 0, hint: '3y = 6x + 9, dann durch 3 teilen.' } }
    ]};

    L.parabeln = { cards: [
        { id: 'k1', title: 'Zwei Parabeln', needsWidget: true,
          body: <>
            <p>Auch zwei Parabeln können sich zweimal schneiden, einmal berühren oder gar nicht treffen. Schiebe p₂ mit dem Regler und finde alle drei Fälle.</p>
          </>,
          widget: (p) => <QLParabelnLab onDone={p.onDone} />,
          check: { q: 'Zwei nach oben geöffnete Normalparabeln (beide beginnen mit x²) haben höchstens …', options: [<span>einen gemeinsamen Punkt, denn beim Gleichsetzen fällt x² weg</span>, <span>zwei gemeinsame Punkte wie immer</span>, <span>keinen gemeinsamen Punkt</span>], correct: 0, hint: 'x² + … = x² + … → die x² heben sich auf, übrig bleibt eine lineare Gleichung mit höchstens einer Lösung.' } },
        { id: 'k2', title: 'Gleichsetzen: x² fällt weg',
          body: <>
            <p>Sind beide Parabeln gleich geöffnet, heben sich die <M>x²</M> beim Gleichsetzen auf. Übrig bleibt eine <b>lineare</b> Gleichung — keine pq-Formel nötig.</p>
            <p>Beispiel <M>p₁: y = x² + 2x − 3</M> und <M>p₂: y = x² − x + 3</M>:</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: 'x² + 2x − 3 = x² − x + 3', e: 'gleichsetzen' },
            { f: '2x − 3 = −x + 3', e: 'x² auf beiden Seiten abziehen' },
            { f: '3x = 6  →  x = 2', e: 'nach x auflösen' },
            { f: 'y = 2² + 2 · 2 − 3 = 5  →  T(2 | 5)', e: 'x in p₁ einsetzen' }]} />,
          check: { q: 'x² + 4x + 1 = x² − 2x + 7. Was ist x?', options: opt('x = 1', 'x = −1', 'x = 6', 'x = 3'), correct: 0, hint: '4x + 1 = −2x + 7 → 6x = 6.' } },
        { id: 'k3', title: 'Eine nach oben, eine nach unten',
          body: <>
            <p>Ist eine Parabel nach oben und die andere nach unten geöffnet, bleibt beim Gleichsetzen <M>2x²</M> übrig. Dann musst du vor der pq-Formel die ganze Gleichung <b>durch 2 teilen</b>.</p>
            <p>Beispiel <M>p₁: y = x² − 2x − 3</M> und <M>p₂: y = −x² + 2x + 3</M>:</p>
          </>,
          widget: (p) => <LnSteps onDone={p.onDone} lines={[
            { f: 'x² − 2x − 3 = −x² + 2x + 3', e: 'gleichsetzen' },
            { f: '2x² − 4x − 6 = 0', e: 'alles auf die linke Seite' },
            { f: 'x² − 2x − 3 = 0', e: 'durch 2 teilen → p = −2, q = −3' },
            { f: 'x₁,₂ = 1 ± √(1 + 3) = 1 ± 2', e: 'pq-Formel' },
            { f: 'x₁ = 3, x₂ = −1  →  y = 0 und y = 0', e: 'in p₁ einsetzen: (3 | 0) und (−1 | 0)' }]} />,
          check: { q: 'Beim Gleichsetzen entsteht 0 = 2x² + 6x − 8. Was machst du vor der pq-Formel?', options: opt('durch 2 teilen: x² + 3x − 4 = 0', 'mit (−1) multiplizieren', 'die 2 weglassen: x² + 6x − 8 = 0'), correct: 0, hint: 'Vor x² muss eine 1 stehen. Teile jede Zahl durch 2.' } },
        { id: 'k4', title: 'Berühren und verfehlen',
          body: <>
            <p>Wie bei der Geraden gilt: Wurzelwert 0 → ein Berührpunkt, negativ → kein gemeinsamer Punkt. In der Prüfung lautet die Aufgabe dann „Zeige mit einer Rechnung, dass sich p₁ und p₂ nicht schneiden“ — gleichsetzen, durch 2 teilen, Wert unter der Wurzel berechnen, negativ.</p>
            <p>Ein Spezialfall ohne Rechnung: Eine nach oben geöffnete Parabel, deren Scheitel <b>über</b> dem Scheitel einer nach unten geöffneten liegt, kann diese nie treffen.</p>
          </>,
          merke: <>Zwei Parabeln: gleichsetzen, alles auf eine Seite. Fällt x² weg → lineare Gleichung. Bleibt 2x² → durch 2 teilen, dann pq-Formel. y-Werte durch Einsetzen in eine der Parabeln.</>,
          check: { q: 'Beim Gleichsetzen zweier Parabeln kommt unter der Wurzel −3 heraus. Was bedeutet das?', options: [<span>Die Parabeln haben keinen gemeinsamen Punkt</span>, <span>Die Parabeln berühren sich</span>, <span>Es gibt zwei Schnittpunkte mit negativem x</span>], correct: 0, hint: 'Aus einer negativen Zahl kann man keine Wurzel ziehen → keine Lösung.' } }
    ]};

    return L;
};
