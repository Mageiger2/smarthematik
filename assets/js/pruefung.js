// ==========================================
// pruefung.js — Prüfungssimulation (Teil A ohne Taschenrechner, Teil B aus allen Trainern)
// Wird inline mit shared.js, lernen-kern.js, kopfrechnen-gen.js und pruefung-katalog.js kompiliert.
//   Teil A: Auswahlaufgaben aus den echten Teil-A-Prüfungen und den Kopfrechen-Generatoren, Auswertung erst am Ende
//   Teil B: 8 Prüfungsteile aus dem Katalog; jede Aufgabe wird im jeweiligen Trainer gelöst (#pruefung/<key>),
//           der Trainer meldet das Lösen über lnMarkExam zurück (Zeitstempel ≥ Start der Simulation)
//   Speicher: smarth_exam_run (laufender Teil B), smarth_exam_results (letzte Ergebnisse)
// ==========================================
const PR_RESULTS_KEY = 'smarth_exam_results';
const PR_A = { n: 10, min: 15 };
const PR_B = { n: 8, min: 60 };
const PR_T = themeColors.indigo;
// Bewertung wie in der echten Prüfung: Teil A 8 Punkte, Teil B 40 Punkte, Summe 48.
// Notenstufen (Punkte): 1: 48–41 · 2: 40,5–33 · 3: 32,5–25 · 4: 24,5–16 · 5: 15,5–8 · 6: 7,5–0
const PR_PTS = { A: 8, B: 40 };
const PR_NOTEN = [[41, 1], [33, 2], [25, 3], [16, 4], [8, 5]];
const prNote = (pts48) => { const p = Math.round(pts48 * 2) / 2; const hit = PR_NOTEN.find(([min]) => p >= min); return hit ? hit[1] : 6; };
// Punkte eines Teils aus gelöstem Anteil (halbe Punkte wie in der Prüfung)
const prPunkte = (kind, ok, total) => Math.round(PR_PTS[kind] * ok / total * 2) / 2;
// Note für einen einzelnen Teil: gleicher Maßstab, auf 48 Punkte hochgerechnet
const prNoteTeil = (kind, ok, total) => prNote(prPunkte(kind, ok, total) / PR_PTS[kind] * 48);
const prPts = (v) => fDe(v);
const PrNotenschluessel = () => (
    <LnHint title="Notenschlüssel der Prüfung">
        <p>Wie in der echten Prüfung: Teil A 8 Punkte, Teil B 40 Punkte, zusammen 48. Hier werden deine gelösten Aufgaben darauf hochgerechnet.</p>
        <table className="mt-2 text-xs sm:text-sm border-collapse"><tbody>
            <tr>{['Note', 1, 2, 3, 4, 5, 6].map((n, i) => <td key={i} className="border border-slate-300 px-2 py-1 font-bold bg-slate-100">{n}</td>)}</tr>
            <tr>{['Punkte', '48–41', '40,5–33', '32,5–25', '24,5–16', '15,5–8', '7,5–0'].map((n, i) => <td key={i} className="border border-slate-300 px-2 py-1">{n}</td>)}</tr>
        </tbody></table>
    </LnHint>
);
const PrNoteBadge = ({ note }) => <span className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl text-3xl font-bold border-2 ${note <= 2 ? 'bg-green-100 text-green-800 border-green-400' : note <= 4 ? 'bg-amber-100 text-amber-800 border-amber-400' : 'bg-red-100 text-red-800 border-red-400'}`}>{note}</span>;

const prResults = () => getStorageJSON(PR_RESULTS_KEY, []);
const prSaveResult = (r) => setStorageJSON(PR_RESULTS_KEY, [r, ...prResults()].slice(0, 10));
const prClock = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const prDate = (ms) => new Date(ms).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const useNow = () => { const [now, setNow] = useState(Date.now()); useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []); return now; };

// ---------- Teil A: Fragen zusammenstellen ----------
const prBuildTeilA = (n) => {
    const real = shuffleArray(examTasks).slice(0, Math.ceil(n / 2)).map(fn => ({ ...fn(), src: 'msa' }));
    const gens = shuffleArray(generators).slice(0, n - real.length).map(g => ({ ...g.fn('mittel'), src: 'gen' }));
    return shuffleArray([...real, ...gens]).map((q, i) => ({ ...q, nr: i + 1 }));
};

// ---------- Teil B: Aufgaben aus dem Katalog ziehen ----------
const prBuildTeilB = (n) => {
    const tangens = !!(getStorageJSON('smarth_opts', {}).tangens);
    const slots = ['lineare', 'quadratische', 'kugel', 'trigonometrie', 'bruchgleichungen', 'wahrscheinlichkeit',
                   Math.random() < 0.5 ? 'wachstum' : 'halbwertszeit', Math.random() < 0.5 ? 'potenzen' : 'binformeln'];
    const rest = Object.keys(EXAM_CATALOG).filter(k => !slots.includes(k));
    const chosen = shuffleArray([...slots, ...shuffleArray(rest)].slice(0, n));
    return chosen.map((tr, i) => {
        const cat = EXAM_CATALOG[tr];
        const items = cat.items.filter(it => !it.tag || (it.tag === 'tangens' && tangens));
        const it = items[Math.floor(Math.random() * items.length)];
        return { nr: i + 1, trainer: tr, title: cat.title, href: cat.href, key: it.key, label: it.label, topic: it.topic || null };
    });
};
const prSolvedAt = (p) => lnExamsSolved(p.trainer)[p.key] || 0;
const prLearnHref = (p) => p.topic ? `${p.href}#${p.topic}/lernen` : `${p.href}#lernen`;

// ---------- Bausteine ----------
const PrCountdown = ({ end, now, label = 'Restzeit' }) => {
    if (!end) return <span className="text-slate-500 text-sm">ohne Zeitlimit</span>;
    const left = end - now;
    return <span className={`font-mono text-lg font-bold ${left <= 0 ? 'text-red-600' : left < 5 * 60000 ? 'text-amber-600' : 'text-slate-800'}`}>{left > 0 ? `${label} ${prClock(left)}` : 'Zeit abgelaufen'}</span>;
};
const PrBtn = ({ onClick, children, primary = true, disabled = false, href }) => {
    const cls = `${primary ? `${PR_T.btnBg} ${PR_T.btnHover} text-white` : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} px-5 py-2.5 rounded-lg font-bold shadow-sm inline-flex items-center justify-center gap-2 no-underline`;
    return href ? <a href={href} className={cls}>{children}</a> : <button type="button" onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
};

// ---------- Startseite der Simulation ----------
const PrHome = ({ onStart }) => {
    const [timed, setTimed] = useState(true);
    const results = prResults();
    const card = (title, sub, lines, Icon, kind) => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
            <div className="flex items-center gap-3 mb-2"><div className={`w-10 h-10 rounded-xl ${PR_T.activeBg} ${PR_T.activeTitle} flex items-center justify-center`}><Icon className="w-6 h-6" /></div><div><p className="font-bold text-slate-800 text-lg leading-tight">{title}</p><p className="text-xs text-slate-500">{sub}</p></div></div>
            <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1 mb-4 flex-grow">{lines.map((l, i) => <li key={i}>{l}</li>)}</ul>
            <PrBtn onClick={() => onStart(kind, timed)}>Starten <ArrowRight className="w-4 h-4" /></PrBtn>
        </div>
    );
    return (
        <>
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
                <p className="text-slate-700">Übe den Ablauf der Abschlussprüfung: erst Teil A ohne Taschenrechner, dann Teil B mit Aufgaben aus allen Themen. Die Auswertung kommt wie in der Prüfung erst am Ende.</p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer"><input type="checkbox" checked={timed} onChange={e => setTimed(e.target.checked)} className="w-4 h-4" /> Mit Zeitlimit (Teil A {PR_A.min} Minuten, Teil B {PR_B.min} Minuten)</label>
                    <LnHint title="Wie läuft das ab?">
                        <p><b>Teil A:</b> {PR_A.n} Aufgaben zum Ankreuzen, ohne Taschenrechner. Es gibt erst am Ende die Lösungen. Falsche Aufgaben landen im Fehlerheft.</p>
                        <p className="mt-1"><b>Teil B:</b> {PR_B.n} Prüfungsteile aus verschiedenen Trainern. Du öffnest jede Aufgabe im Trainer, löst sie dort mit allen Schritten und kommst zurück. Gelöste Teile werden hier abgehakt. Oben auf jeder Seite siehst du die Restzeit.</p>
                    </LnHint>
                </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {card('Teil A', 'ohne Taschenrechner', [`${PR_A.n} Aufgaben zum Ankreuzen`, `${PR_A.min} Minuten`, `zählt wie in der Prüfung ${PR_PTS.A} Punkte`], CalculatorOff, 'A')}
                {card('Teil B', 'mit Taschenrechner', [`${PR_B.n} Prüfungsteile aus allen Trainern`, `${PR_B.min} Minuten`, `zählt wie in der Prüfung ${PR_PTS.B} Punkte`], Calculator, 'B')}
                {card('Komplett', 'Teil A, dann Teil B', ['Beides hintereinander', `${PR_A.min + PR_B.min} Minuten`, 'Note aus 48 Punkten wie in der Prüfung'], FileText, 'AB')}
            </div>
            <a href="https://archiv.bycs.de/edu-sharing/components/search?filters=%7B%22ccm:examination_context%22:%5B%22MS%22%5D,%22ccm:examination_type%22:%5B%22MSA%22%5D,%22ccm:examination_discipline%22:%5B%22M%22%5D%7D" target="_blank" rel="noopener noreferrer" className="block rounded-xl border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 p-4 sm:p-5 mb-6 no-underline transition-colors">
                <p className="font-bold text-amber-900 text-lg sm:text-xl flex items-center gap-2"><FileText className="w-6 h-6 shrink-0" /> Übe mit den echten Prüfungen der letzten Jahre! ↗</p>
                <p className="text-amber-900/80 text-sm mt-1">Im ByCS-Prüfungsarchiv liegen alle bisherigen Abschlussprüfungen mit Lösungen. Wer die durchgerechnet hat, kennt die Prüfung schon.</p>
            </a>
            {results.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
                    <p className="font-bold text-slate-800 mb-2">Deine letzten Ergebnisse</p>
                    <table className="w-full text-sm">
                        <thead><tr className="text-left text-slate-500 border-b border-slate-200"><th className="py-1 pr-2">Datum</th><th className="py-1 pr-2">Teil</th><th className="py-1 pr-2">Ergebnis</th><th className="py-1">Zeit</th></tr></thead>
                        <tbody>{results.map((r, i) => (
                            <tr key={i} className="border-b border-slate-100 last:border-0">
                                <td className="py-1.5 pr-2">{prDate(r.at)}</td><td className="py-1.5 pr-2">Teil {r.kind}</td>
                                <td className="py-1.5 pr-2"><span className={`font-bold ${r.ok / r.total >= 0.5 ? 'text-green-700' : 'text-red-700'}`}>{r.ok} von {r.total}</span> <span className="text-slate-500">({r.gesamt !== undefined ? `${prPts(r.gesamt)} von 48 Punkten` : r.pts !== undefined ? `${prPts(r.pts)} von ${PR_PTS[r.kind]} Punkten` : `${Math.round(100 * r.ok / r.total)} %`})</span>{r.note && <span className="ml-2 font-bold text-slate-800">Note {r.note}</span>}</td>
                                <td className="py-1.5">{r.timeUp ? 'Zeit abgelaufen' : prClock(r.used)}</td>
                            </tr>))}</tbody>
                    </table>
                </div>
            )}
        </>
    );
};

// ---------- Teil A ----------
const PrTeilA = ({ timed, onFinish }) => {
    const [qs] = useState(() => prBuildTeilA(PR_A.n));
    const [idx, setIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [sel, setSel] = useState(null);
    const [start] = useState(() => Date.now());
    const end = timed ? start + PR_A.min * 60000 : null;
    const now = useNow();
    const finish = (timeUp) => {
        const res = qs.map(q => ({ q, given: answers[q.nr], ok: answers[q.nr] === q.correctAnswer }));
        res.filter(r => !r.ok).forEach(r => recordError('kopfrechnen', r.q.category));
        const ok = res.filter(r => r.ok).length;
        prSaveResult({ at: Date.now(), kind: 'A', ok, total: qs.length, pts: prPunkte('A', ok, qs.length), note: prNoteTeil('A', ok, qs.length), used: Date.now() - start, timeUp: !!timeUp });
        onFinish({ res, ok, used: Date.now() - start, timeUp: !!timeUp });
    };
    useEffect(() => { if (end && now >= end) finish(true); /* eslint-disable-next-line */ }, [now]);
    const q = qs[idx];
    const next = (skip) => {
        const a = skip ? answers : { ...answers, [q.nr]: sel };
        setAnswers(a);
        if (idx + 1 >= qs.length) {
            const res = qs.map(x => ({ q: x, given: a[x.nr], ok: a[x.nr] === x.correctAnswer }));
            res.filter(r => !r.ok).forEach(r => recordError('kopfrechnen', r.q.category));
            const ok = res.filter(r => r.ok).length;
            prSaveResult({ at: Date.now(), kind: 'A', ok, total: qs.length, pts: prPunkte('A', ok, qs.length), note: prNoteTeil('A', ok, qs.length), used: Date.now() - start, timeUp: false });
            onFinish({ res, ok, used: Date.now() - start, timeUp: false });
        } else { setIdx(idx + 1); setSel(null); }
    };
    return (
        <>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-700"><CalculatorOff className="w-5 h-5" /> <b>Teil A</b> · Aufgabe {idx + 1} von {qs.length} · ohne Taschenrechner</div>
                <PrCountdown end={end} now={now} />
            </div>
            <div className="flex gap-1.5 mb-4">{qs.map((x, i) => <span key={x.nr} className={`h-2 flex-1 rounded-full ${i === idx ? PR_T.badgeBg : answers[x.nr] !== undefined ? 'bg-green-400' : i < idx ? 'bg-slate-300' : 'bg-slate-200'}`} />)}</div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className={`${PR_T.activeBg} px-5 py-3 border-b flex justify-between items-center`}>
                    <h2 className={`font-semibold ${PR_T.activeTitle}`}>{q.category}</h2>
                    {q.sourceLabel && <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-amber-200 text-amber-800">{q.sourceLabel}</span>}
                </div>
                <div className="p-5 sm:p-8">
                    <div className="text-xl sm:text-2xl text-slate-800 font-math mb-6 leading-relaxed">{fx(q.question)}</div>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {q.options.map((o, i) => (
                            <button key={i} type="button" onClick={() => setSel(i)} className={`text-left p-4 rounded-xl border-2 bg-white transition-all font-math text-lg ${sel === i ? `${PR_T.activeBorder} ${PR_T.activeBg} font-bold` : 'border-slate-200 hover:border-slate-400'}`}>{fx(o)}</button>
                        ))}
                    </div>
                    <div className="mt-6 flex flex-wrap justify-between gap-3">
                        <PrBtn primary={false} onClick={() => next(true)}>Überspringen</PrBtn>
                        <PrBtn onClick={() => next(false)} disabled={sel === null}>{idx + 1 >= qs.length ? 'Abgeben' : 'Weiter'} <ArrowRight className="w-4 h-4" /></PrBtn>
                    </div>
                </div>
            </div>
        </>
    );
};

const PrErgebnisA = ({ r, onHome, onNext }) => {
    const pts = prPunkte('A', r.ok, r.res.length), note = prNoteTeil('A', r.ok, r.res.length);
    return (
        <>
            <div className={`rounded-xl border-2 p-6 text-center mb-6 ${note <= 4 ? 'bg-green-50 border-green-500' : 'bg-amber-50 border-amber-400'}`}>
                <p className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-1">Teil A · Ergebnis</p>
                <div className="flex items-center justify-center gap-5">
                    <div><p className="text-4xl font-bold text-slate-800">{r.ok} von {r.res.length} richtig</p><p className="text-slate-600 mt-1">{prPts(pts)} von {PR_PTS.A} Punkten · {r.timeUp ? 'Zeit abgelaufen' : `Zeit: ${prClock(r.used)}`}</p></div>
                    <PrNoteBadge note={note} />
                </div>
                <div className="mt-3 flex justify-center"><PrNotenschluessel /></div>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                    {onNext ? <PrBtn onClick={onNext}>Weiter zu Teil B <ArrowRight className="w-4 h-4" /></PrBtn> : <PrBtn onClick={onHome}>Zur Übersicht</PrBtn>}
                    {onNext && <PrBtn primary={false} onClick={onHome}>Abbrechen</PrBtn>}
                </div>
            </div>
            <div className="space-y-3">
                {r.res.map(({ q, given, ok }) => (
                    <div key={q.nr} className={`bg-white rounded-xl border-2 p-4 ${ok ? 'border-green-200' : 'border-red-200'}`}>
                        <div className="flex items-start gap-3">
                            {ok ? <CheckCircle className="w-6 h-6 text-green-600 shrink-0" /> : <XCircle className="w-6 h-6 text-red-500 shrink-0" />}
                            <div className="flex-grow">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{q.nr}. {q.category}{q.sourceLabel ? ` · ${q.sourceLabel}` : ''}</p>
                                <div className="font-math text-lg text-slate-800">{fx(q.question)}</div>
                                <p className="text-sm mt-1">{given === undefined ? <span className="text-slate-500">Nicht beantwortet.</span> : !ok && <span className="text-red-700">Deine Antwort: <span className="font-math">{fx(q.options[given])}</span></span>} {!ok && <span className="text-green-700 ml-2">Richtig: <span className="font-math">{fx(q.options[q.correctAnswer])}</span></span>}</p>
                                {!ok && q.explanation && <div className="mt-2"><LnHint title="Erklärung">{q.explanation}</LnHint></div>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

// ---------- Teil B ----------
const PrTeilB = ({ run, onFinish, onCancel }) => {
    const now = useNow();
    const [, bump] = useState(0);
    useEffect(() => {
        const re = () => bump(x => x + 1);
        window.addEventListener('storage', re); window.addEventListener('focus', re); document.addEventListener('visibilitychange', re);
        return () => { window.removeEventListener('storage', re); window.removeEventListener('focus', re); document.removeEventListener('visibilitychange', re); };
    }, []);
    const parts = run.parts.map(p => ({ ...p, solved: prSolvedAt(p) >= run.start }));
    const solved = parts.filter(p => p.solved).length;
    const timeUp = run.end && now >= run.end;
    const finish = () => {
        if (solved < parts.length && !timeUp && !window.confirm(`Es sind noch ${parts.length - solved} Teile offen. Trotzdem abgeben?`)) return;
        const ptsB = prPunkte('B', solved, parts.length);
        const gesamt = run.a ? Math.round((prPunkte('A', run.a.ok, run.a.total) + ptsB) * 2) / 2 : undefined;
        prSaveResult({ at: Date.now(), kind: run.a ? 'A+B' : 'B', ok: solved, total: parts.length, pts: ptsB, note: gesamt !== undefined ? prNote(gesamt) : prNoteTeil('B', solved, parts.length), gesamt, used: Date.now() - run.start, timeUp: !!timeUp });
        onFinish({ parts, ok: solved, used: Date.now() - run.start, timeUp: !!timeUp, a: run.a || null });
    };
    return (
        <>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-700"><Calculator className="w-5 h-5" /> <b>Teil B</b> · {solved} von {parts.length} Teilen gelöst · Taschenrechner erlaubt</div>
                <PrCountdown end={run.end} now={now} />
            </div>
            {timeUp && <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mb-4 text-red-800 text-sm font-medium">Die Zeit ist um. Gib jetzt ab, um dein Ergebnis zu sehen.</div>}
            <p className="text-sm text-slate-600 mb-3">Öffne jede Aufgabe, löse sie im Trainer bis zum Ende und komm hierher zurück. Gelöste Teile werden automatisch abgehakt.</p>
            <ol className="space-y-2 mb-6">
                {parts.map(p => (
                    <li key={p.key} className={`bg-white rounded-xl border-2 p-3 sm:p-4 flex flex-wrap items-center gap-3 ${p.solved ? 'border-green-300' : 'border-slate-200'}`}>
                        {p.solved ? <CheckCircle className="w-6 h-6 text-green-600 shrink-0" /> : <span className={`w-6 h-6 rounded-full ${PR_T.badgeBg} text-white text-sm font-bold flex items-center justify-center shrink-0`}>{p.nr}</span>}
                        <div className="flex-grow min-w-0"><p className="font-bold text-slate-800">{p.title}</p><p className="text-xs text-slate-500">{p.label}</p></div>
                        <PrBtn primary={!p.solved} href={`${p.href}#pruefung/${encodeURIComponent(p.key)}`}>{p.solved ? 'Nochmal ansehen' : 'Aufgabe öffnen'} <ArrowRight className="w-4 h-4" /></PrBtn>
                    </li>
                ))}
            </ol>
            <div className="flex flex-wrap justify-between gap-3">
                <PrBtn primary={false} onClick={() => { if (window.confirm('Simulation abbrechen? Der Stand geht verloren.')) onCancel(); }}>Abbrechen</PrBtn>
                <PrBtn onClick={finish}>Prüfung abgeben <ArrowRight className="w-4 h-4" /></PrBtn>
            </div>
        </>
    );
};

const PrErgebnisB = ({ r, onHome }) => {
    const ptsB = prPunkte('B', r.ok, r.parts.length);
    const ptsA = r.a ? prPunkte('A', r.a.ok, r.a.total) : null;
    const gesamt = ptsA !== null ? ptsA + ptsB : null;
    const note = gesamt !== null ? prNote(gesamt) : prNoteTeil('B', r.ok, r.parts.length);
    return (
        <>
            <div className={`rounded-xl border-2 p-6 text-center mb-6 ${note <= 4 ? 'bg-green-50 border-green-500' : 'bg-amber-50 border-amber-400'}`}>
                <p className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-1">{gesamt !== null ? 'Gesamtergebnis · Teil A und B' : 'Teil B · Ergebnis'}</p>
                <div className="flex items-center justify-center gap-5">
                    <div>
                        <p className="text-4xl font-bold text-slate-800">{r.ok} von {r.parts.length} Teilen gelöst</p>
                        <p className="text-slate-600 mt-1">Teil B: {prPts(ptsB)} von {PR_PTS.B} Punkten · {r.timeUp ? 'Zeit abgelaufen' : `Zeit: ${prClock(r.used)}`}</p>
                        {gesamt !== null && <p className="text-slate-800 font-bold mt-1">Teil A {prPts(ptsA)} + Teil B {prPts(ptsB)} = {prPts(gesamt)} von 48 Punkten</p>}
                    </div>
                    <PrNoteBadge note={note} />
                </div>
                <div className="mt-3 flex justify-center"><PrNotenschluessel /></div>
                <div className="mt-4"><PrBtn onClick={onHome}>Zur Übersicht</PrBtn></div>
            </div>
            <div className="space-y-2">
                {r.parts.map(p => (
                    <div key={p.key} className={`bg-white rounded-xl border-2 p-3 sm:p-4 flex flex-wrap items-center gap-3 ${p.solved ? 'border-green-200' : 'border-red-200'}`}>
                        {p.solved ? <CheckCircle className="w-6 h-6 text-green-600 shrink-0" /> : <XCircle className="w-6 h-6 text-red-500 shrink-0" />}
                        <div className="flex-grow"><p className="font-bold text-slate-800">{p.title}</p><p className="text-xs text-slate-500">{p.label}</p></div>
                        {!p.solved && <a href={prLearnHref(p)} className={`text-sm font-bold ${PR_T.activeTitle} hover:underline inline-flex items-center gap-1 no-underline`}><BookOpen className="w-4 h-4" /> Thema lernen</a>}
                    </div>
                ))}
            </div>
        </>
    );
};

// ---------- App ----------
const PruefungApp = () => {
    const [view, setView] = useState(() => (examRun() ? 'B' : 'home'));
    const [timed, setTimed] = useState(true);
    const [thenB, setThenB] = useState(false);
    const [result, setResult] = useState(null);
    const run = examRun();
    const startB = (withTime, a = null) => {
        // a: Ergebnis von Teil A bei „Komplett“ (im Lauf gespeichert, damit es den Seitenwechsel in die Trainer übersteht)
        const start = Date.now();
        setStorageJSON(EXAM_RUN_KEY, { kind: 'B', start, end: withTime ? start + PR_B.min * 60000 : null, parts: prBuildTeilB(PR_B.n), a });
        setView('B');
    };
    const start = (kind, withTime) => {
        setTimed(withTime); setThenB(kind === 'AB');
        if (kind === 'B') startB(withTime); else setView('A');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const home = () => { setView('home'); setResult(null); setThenB(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const clearRun = () => { try { localStorage.removeItem(EXAM_RUN_KEY); } catch (e) {} };
    return (
        <div className="page-transition max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <TrainerHeader theme="indigo" icon={FileText} title="Prüfungssimulation" streak={null} />
            {view === 'home' && <PrHome onStart={start} />}
            {view === 'A' && <PrTeilA timed={timed} onFinish={(r) => { setResult(r); setView('resA'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
            {view === 'resA' && <PrErgebnisA r={result} onHome={home} onNext={thenB ? () => startB(timed, { ok: result.ok, total: result.res.length }) : null} />}
            {view === 'B' && (run ? <PrTeilB run={run} onFinish={(r) => { clearRun(); setResult(r); setView('resB'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onCancel={() => { clearRun(); home(); }} /> : <PrHome onStart={start} />)}
            {view === 'resB' && <PrErgebnisB r={result} onHome={home} />}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(<PruefungApp />);
