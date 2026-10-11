// ==========================================
// lernen-kern.js — gemeinsamer Kern für den Modus „Lernen“
// Wird nach shared.js (und ggf. funktionen-kern.js) inline kompiliert.
// Enthält:
//   - Fortschrittsmodell im Browser (localStorage, Schlüssel smarth_progress)
//   - Lernkarten (LnCard), Quick-Checks, Schritt-Folgen, Regler, Merkkasten
//   - LnLearnView: spielt die Lernkarten eines Themas nacheinander ab
//   - LnModeTabs: Umschalter Lernen ↔ Üben & Prüfen
// Die Inhalte liefert pro Trainer eine eigene Datei (z. B. lernen-quadratische.js):
//   LERN[themaId] = { cards: [ { id, title, body, widget?, check?, merke? } ] }
//   check: { q, options: [JSX], correct: idx, hint } — Auswahlfrage zum Abschluss der Karte
//   widget: (props) => JSX — interaktives Element; mit props.onDone() kann es die Karte freigeben
// Trainer ohne Themenauswahl (Kugel, Potenzen, …) nutzen LnSimpleApp + LnSimpleTabs:
//   Hash #lernen zeigt die Lernkarten, sonst läuft der normale Trainer.
// ==========================================

// Einstellungen des aktiven Trainers ohne Funktionen-Kern (Theme für die Lernbausteine)
const LN = { theme: null };
// Speicher-Kennung: bei Trainern ohne Themen (Thema = Trainer) ohne Anhängsel
const lnStoreId = (trainer, topic) => (!topic || topic === trainer) ? trainer : `${trainer}_${topic}`;

// ==========================================
// 1. FORTSCHRITT (pro Trainer und Thema)
// Schema: { v: 1, t: { <trainer>: { <thema>: { cards: ['k1', ...], done: true, at: <ms> } } } }
// ==========================================
const LN_KEY = 'smarth_progress';
const lnLoad = () => { const d = getStorageJSON(LN_KEY, null); return d && d.t ? d : { v: 1, t: {} }; };
const lnSave = (d) => setStorageJSON(LN_KEY, d);
const lnTopic = (trainer, topic) => ((lnLoad().t[trainer] || {})[topic]) || { cards: [], done: false };
const lnMarkCard = (trainer, topic, cardId, total) => {
    const d = lnLoad();
    d.t[trainer] = d.t[trainer] || {};
    const tp = d.t[trainer][topic] || { cards: [], done: false };
    if (!tp.cards.includes(cardId)) tp.cards = [...tp.cards, cardId];
    tp.done = tp.cards.length >= total;
    tp.at = Date.now();
    d.t[trainer][topic] = tp;
    lnSave(d);
    return tp;
};
const lnResetTopic = (trainer, topic) => {
    const d = lnLoad();
    if (d.t[trainer]) { delete d.t[trainer][topic]; lnSave(d); }
};

// Gelöste Prüfungsteile pro Trainer: { '2025-I-a': <ms>, ... }
const lnExamsKey = (trainer) => `smarth_exams_${trainer}`;
const lnExamsSolved = (trainer) => getStorageJSON(lnExamsKey(trainer), {});
const lnMarkExam = (trainer, sig) => { const m = lnExamsSolved(trainer); m[sig] = Date.now(); setStorageJSON(lnExamsKey(trainer), m); };

// Status eines Themas aus allen Speichern: gelernt / geübt / gemeistert
//   gelernt     — alle Lernkarten abgeschlossen
//   geübt       — mindestens 5 Übungsaufgaben richtig (alle Stufen zusammen)
//   gemeistert  — eine Stufe 10× in Folge richtig oder 3 Prüfungsteile des Themas gelöst
const lnTopicStatus = (trainer, topic, learnTotal, examSigs = []) => {
    const lp = lnTopic(trainer, topic);
    const learned = learnTotal > 0 && lp.cards.length >= learnTotal;
    const adapt = getStorageJSON(`smarth_adaptive_${lnStoreId(trainer, topic)}`, null);
    const correct = adapt && adapt.perDifficulty ? Object.values(adapt.perDifficulty).reduce((a, d) => a + (d.correct || 0), 0) : 0;
    const mastered = adapt && adapt.mastered ? adapt.mastered.length : 0;
    const solvedMap = lnExamsSolved(trainer);
    const exams = examSigs.filter(s => solvedMap[s]).length;
    const need = Math.min(3, examSigs.length);
    return {
        learned, learnedCards: lp.cards.length, learnTotal,
        practiced: correct >= 5, correct,
        mastered: mastered > 0 || (need > 0 && exams >= need), masteredLevels: mastered,
        exams, examTotal: examSigs.length,
        streak: getStorage(`smarth_streak_${lnStoreId(trainer, topic)}`, 0)
    };
};

// ==========================================
// 2. BAUSTEINE
// ==========================================

// Mathe-Text in der Formelschrift
const M = ({ children }) => <span className="font-math whitespace-nowrap">{children}</span>;

// Eingeklappter Erklärtext: kleine Überschrift, Text erst nach Klick
const LnHint = ({ title = 'Wie funktioniert das?', children }) => {
    const [open, setOpen] = useState(false);
    const t = themeColors[FK_THEME()] || themeColors.emerald;
    return (
        <div className="text-sm">
            <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} className={`inline-flex items-center gap-1 ${t.activeTitle} hover:underline font-medium`}>
                <HelpCircle className="w-4 h-4" /> {title} <ChevronRight className={`w-4 h-4 transition-transform ${open ? 'rotate-90' : ''}`} />
            </button>
            {open && <div className="mt-2 text-slate-600 animate-fade-in">{children}</div>}
        </div>
    );
};

// Schieberegler mit Beschriftung (Theme-Farbe über accent-color)
const LnSlider = ({ label, value, min, max, step = 1, onChange, format = (v) => String(v).replace('.', ',').replace('-', '−') }) => {
    const col = { emerald: '#059669', rose: '#e11d48', amber: '#f59e0b', sky: '#0ea5e9', violet: '#7c3aed', teal: '#0d9488', cyan: '#0891b2', orange: '#ea580c', indigo: '#4f46e5', blue: '#2563eb', fuchsia: '#c026d3' }[FK_THEME()] || '#059669';
    return (
        <label className="flex items-center gap-3 text-sm sm:text-base">
            <span className="font-math w-20 shrink-0 text-right">{label} = <b>{format(value)}</b></span>
            <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))}
                   className="flex-grow h-2 cursor-pointer" style={{ accentColor: col }} />
        </label>
    );
};
// Theme des aktiven Trainers (FK.theme, falls der Funktionen-Kern geladen ist)
const FK_THEME = () => (typeof FK !== 'undefined' && FK.theme) || LN.theme || 'emerald';

// Merkkasten „Das musst du können“
const LnMerke = ({ title = 'Merke', children }) => {
    const t = themeColors[FK_THEME()] || themeColors.emerald;
    return (
        <div className={`${t.activeBg} border-l-4 ${t.activeBorder} p-4 rounded-r-xl shadow-sm mt-4`}>
            <p className={`font-bold ${t.activeTitle} mb-1 flex items-center gap-2`}><Target className="w-5 h-5" /> {title}</p>
            <div className="text-slate-700 text-sm sm:text-base leading-relaxed">{children}</div>
        </div>
    );
};

// Schritt-Folge: Rechenweg Zeile für Zeile aufdecken
const LnSteps = ({ lines, onDone }) => {
    const [n, setN] = useState(1);
    const t = themeColors[FK_THEME()] || themeColors.emerald;
    const all = n >= lines.length;
    useEffect(() => { if (all && onDone) onDone(); /* eslint-disable-next-line */ }, [all]);
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-3">
            <div className="space-y-2">
                {lines.slice(0, n).map((l, i) => (
                    <div key={i} className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 animate-fade-in ${i === n - 1 ? 'font-bold' : ''}`}>
                        <span className="font-math text-lg sm:text-xl text-slate-800 whitespace-nowrap">{l.f}</span>
                        {l.e && <span className="text-sm text-slate-500">{l.e}</span>}
                    </div>
                ))}
            </div>
            {!all && (
                <button onClick={() => setN(n + 1)} className={`mt-3 ${t.btnBg} ${t.btnHover} text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm inline-flex items-center gap-2`}>
                    Nächster Schritt <ArrowRight className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

// Quick-Check: eine Auswahlfrage. Nach einem Fehler erscheint der Tipp.
const LnCheck = ({ check, onCorrect }) => {
    const [sel, setSel] = useState(null);
    const [status, setStatus] = useState(null);
    const [wrong, setWrong] = useState(0);
    const t = themeColors[FK_THEME()] || themeColors.emerald;
    const order = React.useRef(shuffleArray(check.options.map((_, i) => i))).current;
    const submit = () => {
        if (sel === null) return;
        if (order[sel] === check.correct) { setStatus('correct'); setTimeout(onCorrect, 400); }
        else { setStatus('incorrect'); setWrong(w => w + 1); }
    };
    return (
        <div className="mt-5 border-t border-slate-200 pt-4">
            <p className="font-bold text-slate-800 mb-3 flex items-center gap-2"><HelpCircle className={`w-5 h-5 ${t.activeTitle}`} /> Kurz prüfen: {check.q}</p>
            <div className="flex flex-col gap-2">
                {order.map((oi, i) => (
                    <button key={i} onClick={() => { if (status !== 'correct') { setSel(i); setStatus(null); } }}
                            className={`text-left p-3 rounded-xl border-2 bg-white transition-all flex justify-between items-center ${
                                sel === i ? (status === 'correct' ? 'border-green-500 bg-green-50' : status === 'incorrect' ? 'border-red-400 bg-red-50' : `${t.activeBorder} ${t.activeBg} font-bold`) : `border-slate-200 hover:${t.activeBorder}`}`}>
                        <span className="text-base">{check.options[oi]}</span>
                        {sel === i && status === 'correct' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {sel === i && status === 'incorrect' && <XCircle className="w-5 h-5 text-red-500" />}
                    </button>
                ))}
            </div>
            {wrong > 0 && status !== 'correct' && check.hint && (
                <div className="mt-3 bg-amber-50 border-l-4 border-amber-500 p-3 rounded shadow-sm text-amber-900 text-sm flex animate-fade-in">
                    <HelpCircle className="w-5 h-5 mr-2 shrink-0 text-amber-600" /><div><strong>Tipp:</strong> {check.hint}</div>
                </div>
            )}
            <div className="mt-3 flex justify-end"><SubmitBtn onClick={submit} theme={FK_THEME()} disabled={sel === null || status === 'correct'} /></div>
        </div>
    );
};

// Lernkarte: gleiche Optik wie StepCard, abgeschlossene Karten lassen sich wieder aufklappen
const LnCard = ({ card, idx, state, onDone, onReopen }) => {
    // state: 'active' | 'done' | 'locked'
    const t = themeColors[FK_THEME()] || themeColors.emerald;
    const [open, setOpen] = useState(false);
    const [widgetDone, setWidgetDone] = useState(!card.needsWidget);
    const isActive = state === 'active', isDone = state === 'done';
    const show = isActive || (isDone && open);
    const Widget = card.widget;
    return (
        <div className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all duration-300 ${isActive ? `${t.activeBorder} ${t.shadow}` : isDone ? 'border-green-200' : 'border-slate-200 opacity-50'}`}>
            <button type="button" disabled={!isDone} onClick={() => setOpen(o => !o)}
                    className={`w-full text-left px-5 py-3 border-b flex items-center gap-x-2 ${isActive ? `${t.activeBg} border-opacity-50` : isDone ? 'bg-green-50 border-green-100 cursor-pointer hover:bg-green-100' : 'bg-slate-50 border-slate-200'}`}>
                {isDone ? <CheckCircle className="text-green-500 mr-3 w-6 h-6 shrink-0" /> : <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 shrink-0 ${isActive ? `${t.badgeBg} text-white` : 'bg-slate-300 text-slate-500'}`}>{idx + 1}</div>}
                <h3 className={`font-bold text-lg flex-grow ${isActive ? t.activeTitle : isDone ? 'text-green-900' : 'text-slate-500'}`}>{card.title}</h3>
                {isDone && <ChevronRight className={`w-5 h-5 text-green-700 transition-transform ${open ? 'rotate-90' : ''}`} />}
            </button>
            {show && (
                <div className="p-5 animate-fade-in">
                    <div className="text-slate-700 text-base sm:text-lg leading-relaxed space-y-3 ln-prose">{card.body}</div>
                    {Widget && <div className="mt-4"><Widget onDone={() => setWidgetDone(true)} done={isDone} /></div>}
                    {card.merke && <LnMerke>{card.merke}</LnMerke>}
                    {isActive && card.check && widgetDone && <LnCheck check={card.check} onCorrect={onDone} />}
                    {isActive && !card.check && (
                        <div className="mt-5 flex justify-end">
                            <button onClick={onDone} disabled={!widgetDone} className={`${widgetDone ? `${t.btnBg} ${t.btnHover}` : 'bg-slate-300 cursor-not-allowed'} text-white px-5 py-2.5 rounded-lg font-bold shadow-sm inline-flex items-center gap-2`}>
                                {widgetDone ? 'Verstanden, weiter' : 'Probiere es zuerst aus'} <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    {isActive && card.check && !widgetDone && <p className="mt-4 text-sm text-slate-500 text-right">Probiere zuerst das interaktive Beispiel aus — dann kommt die Kontrollfrage.</p>}
                </div>
            )}
        </div>
    );
};

// Umschalter Lernen ↔ Üben & Prüfen (unter dem Trainer-Header)
const LnModeTabs = ({ topicId, mode, hasLearn, simple = false }) => {
    const t = themeColors[FK_THEME()] || themeColors.emerald;
    if (!hasLearn) return null;
    const learnHref = simple ? '#lernen' : `#${topicId}/lernen`, practiceHref = simple ? '#ueben' : `#${topicId}`;
    const tab = (id, href, Icon, label) => (
        <a href={href} className={`px-4 sm:px-6 py-2 rounded-lg font-bold text-sm sm:text-base inline-flex items-center gap-2 transition-colors no-underline ${mode === id ? `${t.btnBg} text-white shadow-sm` : 'text-slate-600 hover:bg-slate-100'}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" /> {label}
        </a>
    );
    return (
        <div className="flex justify-center mb-6">
            <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm gap-1">
                {tab('lernen', learnHref, BookOpen, 'Lernen')}
                {tab('ueben', practiceHref, Target, 'Üben & Prüfen')}
            </div>
        </div>
    );
};

// ==========================================
// 3. LERN-ANSICHT EINES THEMAS
// ==========================================
const LnLearnView = ({ trainer, topic, cards, Icon, backLink, onPractice, simple = false, focusId = null }) => {
    const [doneIds, setDoneIds] = useState(() => lnTopic(trainer, topic.id).cards);
    // focusId: Karte aus dem Fehlerheft — wird zusätzlich geöffnet, auch wenn sie noch nicht an der Reihe ist
    const focusIdx = focusId ? cards.findIndex(c => c.id === focusId) : -1;
    useEffect(() => { if (focusIdx >= 0) { const el = document.getElementById(`ln-card-${focusIdx}`); if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300); } /* eslint-disable-next-line */ }, []);
    const [runKey, setRunKey] = useState(0);
    const streak = getStorage(topic.streakKey || `smarth_streak_${lnStoreId(trainer, topic.id)}`, 0);
    const t = themeColors[FK_THEME()] || themeColors.emerald;
    const firstOpen = cards.findIndex(c => !doneIds.includes(c.id));
    const allDone = firstOpen < 0;
    const markDone = (id) => { const tp = lnMarkCard(trainer, topic.id, id, cards.length); setDoneIds(tp.cards); };
    const restart = () => { lnResetTopic(trainer, topic.id); setDoneIds([]); setRunKey(k => k + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    useEffect(() => {
        // Zur aktiven Karte scrollen, wenn eine abgeschlossen wurde
        if (firstOpen > 0 && !allDone) { const el = document.getElementById(`ln-card-${firstOpen}`); if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150); }
        /* eslint-disable-next-line */
    }, [doneIds.length]);
    return (
        <div className="page-transition max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {backLink}
            <TrainerHeader theme={FK_THEME()} icon={Icon} title={topic.title} streakIcon={Icon} streak={streak} />
            <LnModeTabs topicId={topic.id} mode="lernen" hasLearn={true} simple={simple} />
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-slate-700 font-bold">{doneIds.length} von {cards.length} Lernkarten</p>
                    <LnHint title="So geht's">Lies die Karte, probiere das Beispiel aus und beantworte die Kontrollfrage. Dann öffnet sich die nächste Karte. Fertige Karten kannst du jederzeit wieder aufklappen.</LnHint>
                </div>
                <div className="flex gap-1.5">
                    {cards.map((c, i) => <span key={c.id} className={`w-6 h-2 rounded-full ${doneIds.includes(c.id) ? 'bg-green-500' : i === firstOpen ? t.badgeBg : 'bg-slate-200'}`} />)}
                </div>
            </div>
            <div className="space-y-4" key={runKey}>
                {cards.map((c, i) => (
                    <div key={c.id} id={`ln-card-${i}`} className="scroll-mt-24">
                        <LnCard card={c} idx={i} state={doneIds.includes(c.id) ? 'done' : (i === firstOpen || i === focusIdx) ? 'active' : 'locked'} onDone={() => markDone(c.id)} />
                    </div>
                ))}
            </div>
            {allDone && (
                <div className="bg-green-50 border-2 border-green-500 p-8 rounded-xl shadow-sm text-center animate-fade-in mt-6">
                    <h3 className="text-3xl font-bold text-green-800 mb-3">Thema gelernt! 🎉</h3>
                    <p className="text-green-700 mb-6 text-lg">Jetzt kannst du dein Wissen in den Übungsaufgaben anwenden — Leicht, Mittel, Schwer und echte Prüfungsaufgaben.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={restart} className="text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium shadow-sm"><RefreshCw className="w-4 h-4" /> Nochmal durchgehen</button>
                        <button onClick={onPractice} className={`${t.btnBg} ${t.btnHover} text-white px-8 py-3 rounded-lg font-bold shadow-md flex items-center justify-center gap-2`}><Target className="w-5 h-5" /> Jetzt üben</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Status-Chips für eine Themen-Kachel: Lernen · Üben · Prüfen
const LnStatusChips = ({ st, hasLearn }) => {
    const chip = (ok, label, title) => (
        <span title={title} className={`text-xs font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${ok ? 'bg-green-50 text-green-800 border-green-300' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
            {ok ? '✓' : '○'} {label}
        </span>
    );
    return (
        <div className="flex gap-1.5 flex-wrap">
            {hasLearn && chip(st.learned, 'Gelernt', `${st.learnedCards} von ${st.learnTotal} Lernkarten`)}
            {chip(st.practiced, 'Geübt', `${st.correct} Übungsaufgaben richtig gelöst`)}
            {chip(st.mastered, 'Gemeistert', st.examTotal ? `${st.exams} von ${st.examTotal} Prüfungsteilen gelöst` : 'Eine Stufe 10× in Folge richtig')}
        </div>
    );
};

// ==========================================
// 4. TRAINER OHNE THEMENAUSWAHL: Lernen ↔ Üben über den Hash (#lernen)
// ==========================================
const lnSimpleMode = () => (window.location.hash.indexOf('#lernen') === 0 ? 'lernen' : 'ueben');
const lnSimpleFocus = () => (window.location.hash.split('/')[1] || null);

// Umschalter + Status-Chips für einen Trainer ohne Themen (steht unter dem Trainer-Header)
const LnSimpleTabs = ({ trainer, cards, streakKey }) => {
    if (!cards || !cards.length) return null;
    const st = lnTopicStatus(trainer, trainer, cards.length);
    if (streakKey) st.streak = getStorage(streakKey, 0);
    return (
        <div className="mb-6">
            <LnModeTabs topicId={trainer} mode="ueben" hasLearn={true} simple={true} />
            <div className="-mt-3 flex flex-col items-center gap-2">
                <LnStatusChips st={st} hasLearn={true} />
                <LnHint title="Wie zählt das?">Gelernt: alle Lernkarten durchgearbeitet. Geübt: 5 Aufgaben richtig gelöst. Gemeistert: eine Stufe 10-mal in Folge richtig.</LnHint>
            </div>
        </div>
    );
};

// Hülle um den Trainer: zeigt bei #lernen die Lernkarten, sonst den Trainer (children)
const LnSimpleApp = ({ trainer, title, Icon, theme, cards, streakKey, children }) => {
    LN.theme = theme;
    const [mode, setMode] = useState(lnSimpleMode);
    useEffect(() => {
        const onHash = () => { setMode(lnSimpleMode()); window.scrollTo({ top: 0, behavior: 'smooth' }); };
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, []);
    if (mode === 'lernen' && cards && cards.length) {
        return <LnLearnView key={'lernen/' + (lnSimpleFocus() || '')} trainer={trainer} topic={{ id: trainer, title, streakKey }} cards={cards} Icon={Icon}
                            onPractice={() => { window.location.hash = 'ueben'; }} simple={true} focusId={lnSimpleFocus()} />;
    }
    return children;
};
