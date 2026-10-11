// ==========================================
// lehrer.js — Klassenübersicht für Lehrkräfte
// Wird inline mit shared.js und fehlerheft-map.js kompiliert.
//   Schüler kopieren ihren Fortschritts-Code (Startseite → „Dein Fortschritt“) und schicken ihn der Lehrkraft.
//   Diese Seite liest beliebig viele Codes ein und zeigt je Schüler und Thema: gelernt, geübt, gemeistert,
//   gelöste Prüfungsteile, Prüfungssimulationen und die häufigsten Fehler. Alles bleibt im Browser der Lehrkraft
//   (localStorage smarth_lehrer_klasse), es wird nichts übertragen.
// ==========================================
const LE_KEY = 'smarth_lehrer_klasse';
const LE_T = themeColors.indigo;
const LE_CARDS_N = { trigonometrie: 9, wahrscheinlichkeit: 8 }; // Lernkarten je Trainer ohne Themenauswahl (sonst 5)
const leCards = (key) => LE_CARDS_N[key] || 5;
const LE_TRAINERS = [
    { key: 'kopfrechnen', title: 'Kopfrechnen', short: 'Kopf', streak: 'kopf', learn: false },
    { key: 'binformeln', title: 'Binomische Formeln', short: 'Binom', streak: 'binformeln' },
    { key: 'bruchgleichungen', title: 'Bruchgleichungen', short: 'Bruchgl.', streak: 'brueche' },
    { key: 'halbwertszeit', title: 'Halbwertszeit', short: 'Halbw.', streak: 'zerfall' },
    { key: 'kugel', title: 'Die Kugel', short: 'Kugel', streak: 'kugel' },
    { key: 'lineare', title: 'Lineare Funktionen', short: 'Lin. Fkt.', fk: true },
    { key: 'potenzen', title: 'Potenzen', short: 'Potenzen', streak: 'potenzen' },
    { key: 'quadratische', title: 'Quadratische Funktionen', short: 'Quad. Fkt.', fk: true },
    { key: 'trigonometrie', title: 'Trigonometrie', short: 'Trigo', streak: 'trigonometrie' },
    { key: 'wachstum', title: 'Wachstum & Zerfall', short: 'Wachstum', streak: 'wachstum' },
    { key: 'wahrscheinlichkeit', title: 'Wahrscheinlichkeit', short: 'Wahrsch.', streak: 'wahrscheinlichkeit' }
];
const LE_STATUS = {
    gemeistert: { l: 'M', title: 'gemeistert', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
    geuebt: { l: 'Ü', title: 'geübt', cls: 'bg-green-100 text-green-800 border-green-300' },
    gelernt: { l: 'L', title: 'gelernt', cls: 'bg-sky-100 text-sky-800 border-sky-300' },
    begonnen: { l: '·', title: 'begonnen', cls: 'bg-slate-100 text-slate-500 border-slate-200' }
};

// ---------- Fortschritts-Code lesen (gleiches Format wie auf der Startseite) ----------
const leB64ToBytes = (b64) => { const s = atob(b64), a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; };
const leInflate = (bytes) => { const ds = new DecompressionStream('deflate'); const w = ds.writable.getWriter(); w.write(bytes).catch(() => {}); w.close().catch(() => {}); return new Response(ds.readable).arrayBuffer().then(b => new Uint8Array(b)); };
const leReadCode = async (code) => {
    code = (code || '').replace(/\s+/g, '');
    const m = code.match(/^SMARTH([01])\.([A-Za-z0-9+\/=]+)$/);
    if (!m) throw new Error('kein gültiger Fortschritts-Code');
    const bytes = leB64ToBytes(m[2]);
    const raw = m[1] === '1' ? await leInflate(bytes) : bytes;
    const obj = JSON.parse(new TextDecoder().decode(raw));
    if (!obj || !obj.data) throw new Error('Code unvollständig');
    return obj;
};
// Eingabe: eine Zeile je Schüler, „Name: CODE“, „Name; CODE“ oder nur der Code
const leParseLines = (text) => text.split(/\n/).map(l => l.trim()).filter(Boolean).map(l => {
    const m = l.match(/^(.*?)[:;,\t]\s*(SMARTH[01]\.[A-Za-z0-9+\/=]+)\s*$/);
    if (m) return { name: m[1].trim(), code: m[2] };
    const c = l.match(/SMARTH[01]\.[A-Za-z0-9+\/=]+/);
    return { name: '', code: c ? c[0] : l };
});

// ---------- Auswertung eines Codes ----------
const leJSON = (data, k, def) => { try { const v = data[k]; return v ? JSON.parse(v) : def; } catch (e) { return def; } };
const leInt = (data, k) => parseInt(data[k]) || 0;
const leEval = (data) => {
    const progress = leJSON(data, 'smarth_progress', { t: {} });
    const trainers = {};
    LE_TRAINERS.forEach(tr => {
        let correct = 0, masteredLevels = 0;
        Object.keys(data).forEach(k => {
            if (k === `smarth_adaptive_${tr.key}` || k.indexOf(`smarth_adaptive_${tr.key}_`) === 0) {
                const a = leJSON(data, k, null); if (!a) return;
                if (a.perDifficulty) Object.values(a.perDifficulty).forEach(d => { correct += d.correct || 0; });
                if (a.mastered && a.mastered.length) masteredLevels += a.mastered.length;
            }
        });
        const exams = Object.keys(leJSON(data, `smarth_exams_${tr.key}`, {})).length;
        const errors = Object.entries(leJSON(data, `smarth_errors_${tr.key}`, {})).sort((a, b) => b[1] - a[1]);
        let learned = 0, learnTotal = 0, cards = 0, masteredTopics = 0;
        if (tr.fk) {
            const sm = leJSON(data, `smarth_summary_${tr.key}`, null);
            if (sm) { learned = sm.learned || 0; learnTotal = sm.topics || 0; masteredTopics = sm.mastered || 0; }
            const pt = (progress.t || {})[tr.key] || {};
            cards = Object.values(pt).reduce((a, t) => a + ((t.cards || []).length), 0);
        } else if (tr.learn !== false) {
            const lp = ((progress.t || {})[tr.key] || {})[tr.key];
            learnTotal = 1; cards = lp ? (lp.cards || []).length : 0; learned = lp && lp.done ? 1 : 0;
        }
        const best = tr.streak ? leInt(data, `smarth_best_${tr.streak}`) : 0;
        const status = (masteredLevels > 0 || masteredTopics > 0 || exams >= 3) ? 'gemeistert' : correct >= 5 ? 'geuebt' : (learned > 0 && learned >= learnTotal) ? 'gelernt' : (correct > 0 || cards > 0) ? 'begonnen' : null;
        trainers[tr.key] = { status, correct, masteredLevels, masteredTopics, exams, errors, learned, learnTotal, cards, best };
    });
    const sims = leJSON(data, 'smarth_exam_results', []);
    const lastA = sims.find(r => r.kind === 'A'), lastB = sims.find(r => r.kind === 'B');
    const totalCorrect = Object.values(trainers).reduce((a, t) => a + t.correct, 0);
    const totalExams = Object.values(trainers).reduce((a, t) => a + t.exams, 0);
    return { trainers, lastA, lastB, totalCorrect, totalExams };
};
// Beschriftung einer Fehlerart (aus fehlerheft-map.js)
const leErrLabel = (trainer, kind) => {
    const cfg = FH_MAP[trainer]; if (!cfg) return kind;
    if (cfg.kinds) return (cfg.kinds[kind] || [kind])[0];
    if (cfg.topics) { const [tp, st] = kind.split(':'); return (cfg.topics[tp] || tp) + (FH_STEP[st] ? ': ' + FH_STEP[st] : ''); }
    return kind;
};
const leDate = (ms) => ms ? new Date(ms).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

// ---------- Bausteine ----------
const LeChip = ({ status, title }) => {
    const st = LE_STATUS[status];
    if (!st) return <span className="inline-block w-7 h-7 rounded-md border border-dashed border-slate-200" title={title || 'noch nichts'} />;
    return <span title={title} className={`inline-flex items-center justify-center w-7 h-7 rounded-md border text-sm font-bold ${st.cls}`}>{st.l}</span>;
};
const LeBtn = ({ onClick, children, primary = false, small = false }) => (
    <button type="button" onClick={onClick} className={`${primary ? `${LE_T.btnBg} ${LE_T.btnHover} text-white` : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'} ${small ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} rounded-lg font-bold shadow-sm inline-flex items-center gap-2`}>{children}</button>
);

// Eingabe: Codes einfügen oder Dateien wählen
const LeImport = ({ onAdd }) => {
    const [text, setText] = useState('');
    const [msg, setMsg] = useState(null);
    const [busy, setBusy] = useState(false);
    const addAll = async (entries) => {
        setBusy(true);
        let ok = 0, bad = 0;
        const out = [];
        for (const e of entries) {
            try { const obj = await leReadCode(e.code); out.push({ name: e.name, at: obj.at || Date.now(), data: obj.data }); ok++; }
            catch (err) { bad++; }
        }
        onAdd(out); setBusy(false); setText('');
        setMsg({ ok: bad === 0, text: `${ok} Code${ok === 1 ? '' : 's'} eingelesen${bad ? `, ${bad} ungültig` : ''}.` });
    };
    const onFiles = async (e) => {
        const files = Array.from(e.target.files || []); if (!files.length) return;
        const entries = await Promise.all(files.map(f => new Promise(res => { const r = new FileReader(); r.onload = () => res({ name: f.name.replace(/\.txt$/i, '').replace(/^smarthematik-fortschritt-?/i, ''), code: String(r.result || '').trim() }); r.readAsText(f); })));
        addAll(entries); e.target.value = '';
    };
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
            <p className="font-bold text-slate-800 mb-1">Codes einlesen</p>
            <p className="text-sm text-slate-600 mb-3">Eine Zeile je Schülerin oder Schüler, am besten als <span className="font-mono">Name: SMARTH1.…</span>. Ohne Namen wird durchnummeriert. Oder die gespeicherten Dateien auswählen (mehrere auf einmal möglich).</p>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder={'Anna: SMARTH1.eJy…\nBen: SMARTH1.eJy…'} className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono" />
            <div className="mt-2 flex flex-wrap items-center gap-3">
                <LeBtn primary onClick={() => addAll(leParseLines(text))}>{busy ? 'Lese…' : 'Hinzufügen'}</LeBtn>
                <label className="text-sm text-slate-700 inline-flex items-center gap-2 cursor-pointer"><span className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium hover:bg-slate-50">Dateien wählen</span><input type="file" accept=".txt" multiple onChange={onFiles} className="hidden" /></label>
                {msg && <span className={`text-sm font-medium ${msg.ok ? 'text-green-700' : 'text-red-700'}`}>{msg.text}</span>}
            </div>
        </div>
    );
};

// Klassen-Übersicht je Thema: wie viele stehen wo
const LeKlasse = ({ students }) => {
    if (!students.length) return null;
    const n = students.length;
    const rows = LE_TRAINERS.map(tr => {
        const c = { gemeistert: 0, geuebt: 0, gelernt: 0, begonnen: 0, nichts: 0 };
        students.forEach(s => { c[s.ev.trainers[tr.key].status || 'nichts']++; });
        return { tr, c };
    });
    const errAgg = {};
    students.forEach(s => LE_TRAINERS.forEach(tr => s.ev.trainers[tr.key].errors.forEach(([kind, cnt]) => { const k = tr.key + '|' + kind; errAgg[k] = errAgg[k] || { tr, kind, n: 0, who: 0 }; errAgg[k].n += cnt; errAgg[k].who++; })));
    const topErr = Object.values(errAgg).sort((a, b) => b.n - a.n).slice(0, 6);
    const seg = (w, cls) => w > 0 ? <div className={`${cls} h-full`} style={{ width: `${100 * w / n}%` }} /> : null;
    return (
        <div className="grid lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
                <p className="font-bold text-slate-800 mb-1">Stand der Klasse je Thema</p>
                <p className="text-xs text-slate-500 mb-3"><span className="inline-block w-3 h-3 rounded-sm bg-amber-400 align-middle mr-1" />gemeistert <span className="inline-block w-3 h-3 rounded-sm bg-green-500 align-middle ml-3 mr-1" />geübt <span className="inline-block w-3 h-3 rounded-sm bg-sky-400 align-middle ml-3 mr-1" />gelernt <span className="inline-block w-3 h-3 rounded-sm bg-slate-300 align-middle ml-3 mr-1" />begonnen</p>
                <div className="space-y-2">
                    {rows.map(({ tr, c }) => (
                        <div key={tr.key} className="flex items-center gap-3 text-sm">
                            <span className="w-28 sm:w-40 shrink-0 text-slate-700 truncate">{tr.title}</span>
                            <div className="flex-grow h-4 bg-slate-100 rounded overflow-hidden flex" title={`${c.gemeistert} gemeistert, ${c.geuebt} geübt, ${c.gelernt} gelernt, ${c.begonnen} begonnen, ${c.nichts} ohne Stand`}>
                                {seg(c.gemeistert, 'bg-amber-400')}{seg(c.geuebt, 'bg-green-500')}{seg(c.gelernt, 'bg-sky-400')}{seg(c.begonnen, 'bg-slate-300')}
                            </div>
                            <span className="w-14 text-right text-slate-500 text-xs">{n - c.nichts} von {n}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
                <p className="font-bold text-slate-800 mb-1">Häufigste Fehler der Klasse</p>
                {topErr.length === 0 ? <p className="text-sm text-slate-500">Noch keine Fehler erfasst.</p> : (
                    <ol className="text-sm space-y-1.5 mt-2">
                        {topErr.map(e => <li key={e.tr.key + e.kind} className="flex items-start gap-2"><span className="bg-red-50 text-red-700 border border-red-200 font-bold px-1.5 rounded-full text-xs shrink-0">{e.n}×</span><span><span className="text-slate-500">{e.tr.title}:</span> {leErrLabel(e.tr.key, e.kind)} <span className="text-slate-400 text-xs">({e.who} Schüler)</span></span></li>)}
                    </ol>
                )}
                <p className="text-xs text-slate-500 mt-3">Tipp: Diese Fehlerarten lohnen sich zum Wiederholen im Unterricht. Die passende Lernkarte steht bei jedem Schüler im Fehlerheft auf der Startseite.</p>
            </div>
        </div>
    );
};

// Detail eines Schülers
const LeDetail = ({ s, onClose }) => (
    <div className="bg-white rounded-xl border-2 border-indigo-300 shadow-sm p-4 sm:p-5 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <p className="font-bold text-slate-800 text-lg">{s.name} <span className="text-sm font-normal text-slate-500">· Code vom {leDate(s.at)} · {s.ev.totalCorrect} Aufgaben richtig · {s.ev.totalExams} Prüfungsteile</span></p>
            <LeBtn small onClick={onClose}>Schließen</LeBtn>
        </div>
        {(s.ev.lastA || s.ev.lastB) && <p className="text-sm text-slate-700 mb-3"><b>Prüfungssimulation:</b> {s.ev.lastA ? `Teil A ${s.ev.lastA.ok} von ${s.ev.lastA.total} (${leDate(s.ev.lastA.at)})` : ''}{s.ev.lastA && s.ev.lastB ? ' · ' : ''}{s.ev.lastB ? `Teil B ${s.ev.lastB.ok} von ${s.ev.lastB.total} (${leDate(s.ev.lastB.at)})` : ''}</p>}
        <div className="grid sm:grid-cols-2 gap-2">
            {LE_TRAINERS.map(tr => { const t = s.ev.trainers[tr.key]; return (
                <div key={tr.key} className={`rounded-lg border p-2.5 text-sm ${t.status ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
                    <div className="flex items-center gap-2 mb-1"><LeChip status={t.status} /><span className="font-bold text-slate-800">{tr.title}</span></div>
                    <p className="text-xs text-slate-600">
                        {t.correct} richtig{tr.learn !== false && (tr.fk ? ` · ${t.learned} von ${t.learnTotal} Themen gelernt` : ` · ${t.cards} von ${leCards(tr.key)} Lernkarten`)}{t.exams ? ` · ${t.exams} Prüfungsteile` : ''}{t.masteredLevels ? ` · ${t.masteredLevels} Stufe${t.masteredLevels > 1 ? 'n' : ''} 10× in Folge` : ''}{t.best ? ` · bester Streak ${t.best}` : ''}
                    </p>
                    {t.errors.length > 0 && <p className="text-xs text-red-700 mt-1">Fehler: {t.errors.slice(0, 3).map(([k, c]) => `${leErrLabel(tr.key, k)} (${c}×)`).join(', ')}</p>}
                </div>
            ); })}
        </div>
    </div>
);

// CSV für Excel/LibreOffice
const leCSV = (students) => {
    const head = ['Name', 'Code vom', ...LE_TRAINERS.map(t => t.title), 'Aufgaben richtig', 'Prüfungsteile', 'Simulation Teil A', 'Simulation Teil B'];
    const rows = students.map(s => [s.name, leDate(s.at), ...LE_TRAINERS.map(t => { const st = s.ev.trainers[t.key].status; return st ? LE_STATUS[st].title : ''; }), s.ev.totalCorrect, s.ev.totalExams, s.ev.lastA ? `${s.ev.lastA.ok}/${s.ev.lastA.total}` : '', s.ev.lastB ? `${s.ev.lastB.ok}/${s.ev.lastB.total}` : '']);
    const esc = v => `"${String(v).replace(/"/g, '""')}"`;
    return '﻿' + [head, ...rows].map(r => r.map(esc).join(';')).join('\r\n');
};

// ---------- App ----------
const LehrerApp = () => {
    const [list, setList] = useState(() => getStorageJSON(LE_KEY, []));
    const [open, setOpen] = useState(null);
    const students = React.useMemo(() => list.map(s => ({ ...s, ev: leEval(s.data) })).sort((a, b) => a.name.localeCompare(b.name, "de")), [list]);
    const save = (l) => { setList(l); setStorageJSON(LE_KEY, l); };
    const add = (entries) => {
        let l = [...list];
        entries.forEach((e, i) => {
            const name = e.name || `Schüler ${l.length + 1}`;
            const idx = l.findIndex(x => x.name === name);
            const rec = { id: idx >= 0 ? l[idx].id : Date.now() + i, name, at: e.at, data: e.data };
            if (idx >= 0) l[idx] = rec; else l.push(rec);   // gleicher Name = neuer Stand ersetzt den alten
        });
        save(l);
    };
    const remove = (id) => save(list.filter(s => s.id !== id));
    const clearAll = () => { if (window.confirm('Alle Schülerdaten aus diesem Browser löschen?')) { save([]); setOpen(null); } };
    const rename = (id) => { const s = list.find(x => x.id === id); const n = window.prompt('Name:', s.name); if (n && n.trim()) save(list.map(x => x.id === id ? { ...x, name: n.trim() } : x)); };
    const exportCSV = () => { const blob = new Blob([leCSV(students)], { type: 'text/csv;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'smarthematik-klasse.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a); };
    const sel = students.find(s => s.id === open);
    return (
        <div className="page-transition max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
            <TrainerHeader theme="indigo" icon={Shield} title="Klassenübersicht" streak={null} />
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200">
                <p className="text-slate-700">Für Lehrkräfte: Die Schüler kopieren auf der Startseite unter „Dein Fortschritt“ ihren Fortschritts-Code und schicken ihn dir. Hier siehst du für die ganze Klasse, wer welches Thema gelernt, geübt oder gemeistert hat, und welche Fehler sich häufen.</p>
                <p className="text-xs text-slate-500 mt-2">Datenschutz: Die Codes bleiben in diesem Browser auf diesem Gerät. Es wird nichts an einen Server geschickt. Lösche die Liste, wenn du sie nicht mehr brauchst.</p>
            </div>
            <LeImport onAdd={add} />
            {students.length > 0 && (
                <>
                    <LeKlasse students={students} />
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <p className="font-bold text-slate-800">{students.length} Schüler · <span className="font-normal text-slate-500 text-sm">M gemeistert, Ü geübt (5 richtig), L gelernt (alle Lernkarten), · begonnen. Zeile anklicken für Details.</span></p>
                            <div className="flex gap-2"><LeBtn small onClick={exportCSV}>Als CSV speichern</LeBtn><LeBtn small onClick={clearAll}>Liste löschen</LeBtn></div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="text-left text-slate-500 border-b border-slate-200">
                                    <th className="py-2 pr-2 sticky left-0 bg-white">Name</th>
                                    {LE_TRAINERS.map(t => <th key={t.key} className="py-2 px-1 text-center font-medium text-xs" title={t.title}>{t.short}</th>)}
                                    <th className="py-2 px-2 text-center text-xs">Richtig</th><th className="py-2 px-2 text-center text-xs">Prüf.-teile</th><th className="py-2 px-2 text-center text-xs">Simulation</th><th className="py-2 pl-2 text-xs">Häufigster Fehler</th><th></th>
                                </tr></thead>
                                <tbody>
                                    {students.map(s => {
                                        const allErr = LE_TRAINERS.flatMap(t => s.ev.trainers[t.key].errors.map(([k, c]) => ({ t, k, c }))).sort((a, b) => b.c - a.c)[0];
                                        return (
                                            <tr key={s.id} onClick={() => setOpen(open === s.id ? null : s.id)} className={`border-b border-slate-100 cursor-pointer hover:bg-slate-50 ${open === s.id ? 'bg-indigo-50' : ''}`}>
                                                <td className="py-1.5 pr-2 font-bold text-slate-800 whitespace-nowrap sticky left-0 bg-inherit">{s.name}</td>
                                                {LE_TRAINERS.map(t => { const x = s.ev.trainers[t.key]; return <td key={t.key} className="py-1.5 px-1 text-center"><LeChip status={x.status} title={`${t.title}: ${x.status ? LE_STATUS[x.status].title : 'noch nichts'} · ${x.correct} richtig · ${x.exams} Prüfungsteile`} /></td>; })}
                                                <td className="py-1.5 px-2 text-center">{s.ev.totalCorrect}</td>
                                                <td className="py-1.5 px-2 text-center">{s.ev.totalExams}</td>
                                                <td className="py-1.5 px-2 text-center whitespace-nowrap text-xs">{s.ev.lastA ? `A ${s.ev.lastA.ok}/${s.ev.lastA.total}` : ''}{s.ev.lastA && s.ev.lastB ? ' · ' : ''}{s.ev.lastB ? `B ${s.ev.lastB.ok}/${s.ev.lastB.total}` : ''}</td>
                                                <td className="py-1.5 pl-2 text-xs text-slate-600 max-w-[16rem] truncate">{allErr ? `${leErrLabel(allErr.t.key, allErr.k)} (${allErr.c}×)` : ''}</td>
                                                <td className="py-1.5 pl-2 whitespace-nowrap"><button type="button" title="Umbenennen" onClick={(e) => { e.stopPropagation(); rename(s.id); }} className="text-sm text-slate-400 hover:text-indigo-700 mr-2">✎</button><button type="button" title="Entfernen" onClick={(e) => { e.stopPropagation(); remove(s.id); }} className="text-sm text-slate-400 hover:text-red-700">✕</button></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {sel && <LeDetail s={sel} onClose={() => setOpen(null)} />}
                </>
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(<LehrerApp />);
