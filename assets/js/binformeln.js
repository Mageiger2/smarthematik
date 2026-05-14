// ==========================================
// binformeln.js — BinformelnTrainer (Binomische Formeln)
// (Wird inline mit shared.js zusammen pro App-Seite kompiliert.)
// ==========================================

// Hilfsfunktion: Bildet einen Term wie "3a", "9a²", "1" usw. — mit korrekter Behandlung
// von Koeffizient 1 und leerer Variable.
const formatBinoTerm = (coef, letter, isSquared = false) => {
    if (coef === 0) return "0";
    const cStr = (coef === 1 && letter !== '') ? "" : String(coef);
    const lStr = isSquared && letter !== '' ? letter + '²' : letter;
    return cStr + lStr;
};

// Normalisiert User-Eingaben für den Vergleich mit der Soll-Lösung.
// Akzeptiert "x^2", "x²" und "x2" alle gleich. Entfernt Whitespace,
// ignoriert Groß/Kleinschreibung, behandelt "1x" wie "x".
const normalizeBino = (str) => {
    if (str === null || str === undefined) return "";
    return String(str)
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/,/g, '.')
        // ^N → Unicode-Hochzahl (kanonische Form)
        .replace(/\^2/g, '²')
        .replace(/\^3/g, '³')
        .replace(/\^4/g, '⁴')
        .replace(/\^5/g, '⁵')
        .replace(/\^6/g, '⁶')
        // Variable+Ziffer ohne ^ → kanonische Form (z.B. "x2" → "x²")
        .replace(/([a-z])2(?!\d)/g, '$1²')
        .replace(/([a-z])3(?!\d)/g, '$1³')
        .replace(/([a-z])4(?!\d)/g, '$1⁴')
        .replace(/([a-z])5(?!\d)/g, '$1⁵')
        .replace(/([a-z])6(?!\d)/g, '$1⁶')
        // Führende 1 vor Variable streichen ("1x" → "x")
        .replace(/^1([a-z])/i, '$1');
};

// Hardcoded Prüfungsaufgaben (Level 4). Markup: [input:antwort|alt-antwort|…]
// Templates orientieren sich am MSA-Aufgabenstil (Bayern, Aufgabengruppen I+II der
// Jahrgänge 2017–2025), sind aber angepasst (Zahlen leicht variiert, Aufgaben in
// einheitliches Lückentext-Format gebracht). Daher sourceLabel = "Angepasst".
const binoExamTemplates = [
    { sourceLabel: "Angepasst", template: "( 2a + [input:8b] ) · ( 2a − [input:8b] ) = [input:4a²] [input:-] 64b²" },
    { sourceLabel: "Angepasst", template: "( [input:6a] [input:-] 9d )² = 36a² [input:-] [input:108ad|108da] [input:+] 81d²" },
    { sourceLabel: "Angepasst", template: "( 4z + [input:5x] ) · ( 4z − [input:5x] ) = [input:16z²] [input:-] 25x²" },
    { sourceLabel: "Angepasst", template: "( 4x [input:-] [input:y|1y] )² = [input:16x²] [input:-] [input:8xy|8yx] + y²" },
    { sourceLabel: "Angepasst", template: "( [input:3a³|3a^3] − [input:4b] )² = 9a⁶ − 24a³b [input:+] [input:16b²|16b^2]" },
    { sourceLabel: "Angepasst", template: "( 7a³ + [input:10c] )² = [input:49a⁶|49a^6] [input:+] [input:140a³c|140c³a|140ac³|140ca³] + 100c²" },
    { sourceLabel: "Angepasst", template: "( [input:0,5x²y|0.5x²y|0,5yx²|0.5yx²] [input:-] 3z )² = 0,25x⁴y² − [input:3x²yz|3zx²y|3x²zy|3yx²z|3yzx²|3zyx²] [input:+] [input:9z²|9z^2]" },
    { sourceLabel: "Angepasst", template: "( 4ab² + [input:3c] )² = [input:16a²b⁴|16b⁴a²] [input:+] [input:24ab²c|24acb²|24b²ac|24b²ca|24cab²|24cb²a] + 9c²" },
    { sourceLabel: "Angepasst", template: "( w [input:-] 4z )² = [input:w²|w^2] [input:-] [input:8wz|8zw] [input:+] 16z²" },
    { sourceLabel: "Angepasst", template: "( [input:0,5z|0.5z] [input:+] [input:8] )² = 0,25z² + 8z [input:+] [input:64]" }
];

// Wandelt einen Prüfungsaufgaben-Template in tokens + inputs Map.
// Akzeptiert sowohl reinen Template-String als auch ein Objekt { template, sourceLabel }.
const parseExamTemplate = (entry) => {
    const template = typeof entry === 'string' ? entry : entry.template;
    const sourceLabel = typeof entry === 'string' ? null : entry.sourceLabel;
    const tokens = [];
    const inputs = {};
    let inputCounter = 0;
    let lastIdx = 0;
    const regex = /\[input:([^\]]+)\]/g;
    let match;
    while ((match = regex.exec(template)) !== null) {
        if (match.index > lastIdx) {
            tokens.push(template.substring(lastIdx, match.index));
        }
        const answers = match[1].split('|');
        const inputId = 'in_' + (inputCounter++);
        const isSign = answers[0] === '+' || answers[0] === '-';
        const longest = Math.max(...answers.map(a => a.length));
        const width = isSign ? 'w-12' : (longest > 5 ? 'w-28' : (longest > 2 ? 'w-20' : 'w-16'));
        inputs[inputId] = { answers, width, value: '', status: null };
        tokens.push({ type: 'input', inputId });
        lastIdx = regex.lastIndex;
    }
    if (lastIdx < template.length) {
        tokens.push(template.substring(lastIdx));
    }
    return { tokens, inputs, sourceLabel };
};

// Generator für Level 1–3: dynamische Aufgaben, alle drei binomischen Formeln.
const buildDynamicTask = (level) => {
    const vars = ['x', 'y', 'a', 'b'];
    let l1 = vars[Math.floor(Math.random() * vars.length)];
    let l2 = vars[Math.floor(Math.random() * vars.length)];
    while (l1 === l2) l2 = vars[Math.floor(Math.random() * vars.length)];

    const formel = Math.floor(Math.random() * 3) + 1;
    let c1 = 1, c2 = 1;

    if (level === 1) {
        l2 = '';
        c2 = Math.floor(Math.random() * 8) + 2;
    } else if (level === 2) {
        if (Math.random() > 0.5) l2 = '';
        c2 = Math.floor(Math.random() * 10) + 1;
    } else if (level === 3) {
        c1 = Math.floor(Math.random() * 4) + 2;
        c2 = Math.floor(Math.random() * 4) + 2;
    }

    const tA = formatBinoTerm(c1, l1);
    const tB = formatBinoTerm(c2, l2);
    const tA2 = formatBinoTerm(c1 * c1, l1, true);
    const tB2 = formatBinoTerm(c2 * c2, l2, true);

    // tMid kann zwei Reihenfolgen haben, wenn beide Variablen vorhanden sind.
    const tMidAlts = (l1 === '' || l2 === '')
        ? [formatBinoTerm(2 * c1 * c2, l1 + l2)]
        : [formatBinoTerm(2 * c1 * c2, l1 + l2), formatBinoTerm(2 * c1 * c2, l2 + l1)];

    let eq, hideIndices;
    if (formel === 1) {
        eq = ["(", tA, "+", tB, ")²", "=", tA2, "+", tMidAlts[0], "+", tB2];
        if (level === 1) hideIndices = [6, 8, 10];
        else if (level === 2) hideIndices = [1, 3];
        else hideIndices = [[1, 8], [3, 6], [1, 10], [6, 8, 10]][Math.floor(Math.random() * 4)];
    } else if (formel === 2) {
        eq = ["(", tA, "−", tB, ")²", "=", tA2, "−", tMidAlts[0], "+", tB2];
        if (level === 1) hideIndices = [6, 8, 10];
        else if (level === 2) hideIndices = [1, 3];
        else hideIndices = [[1, 8], [3, 6], [1, 10], [6, 8, 10]][Math.floor(Math.random() * 4)];
    } else {
        eq = ["(", tA, "+", tB, ")", "·", "(", tA, "−", tB, ")", "=", tA2, "−", tB2];
        if (level === 1) hideIndices = [12, 14];
        else if (level === 2) hideIndices = [1, 3, 7, 9];
        else hideIndices = [[3, 12], [1, 14], [1, 3, 12, 14]][Math.floor(Math.random() * 3)];
    }

    const inputs = {};
    let inputCounter = 0;
    const tokens = eq.map((token, idx) => {
        if (!hideIndices.includes(idx)) return token;
        const inputId = 'in_' + (inputCounter++);
        // Index 8 bei Formel 1 und 2 ist tMid → mehrere Antwortvarianten möglich.
        const answers = (idx === 8 && (formel === 1 || formel === 2)) ? tMidAlts : [token];
        const longest = Math.max(...answers.map(a => a.length));
        inputs[inputId] = {
            answers,
            width: longest > 3 ? 'w-24' : 'w-16',
            value: '',
            status: null
        };
        return { type: 'input', inputId };
    });

    return { tokens, inputs };
};

// ==========================================
// TRAINER
// ==========================================
const BinformelnTrainer = () => {
    const [difficulty, setDifficulty] = useState('leicht');
    const [problem, setProblem] = useState(() => buildDynamicTask(1));
    const [examShuffled, setExamShuffled] = useState([]);
    const [examIdx, setExamIdx] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");
    const [solved, setSolved] = useState(false);
    const [solutionRevealed, setSolutionRevealed] = useState(false);
    const [activeInputId, setActiveInputId] = useState(null);
    const [streak, setStreak] = useState(() => getStorage('smarth_streak_binformeln', 0));
    const [showAnim, setShowAnim] = useState(false);
    // taskKey wird nur bei wirklichem Aufgabenwechsel hochgezählt — verhindert,
    // dass der Auto-Focus bei jedem Tastendruck zur ersten Lücke springt.
    const [taskKey, setTaskKey] = useState(0);
    const firstInputRef = React.useRef(null);

    useEffect(() => { setStorage('smarth_streak_binformeln', streak); }, [streak]);

    // Auto-Focus auf die erste Eingabe-Box, sobald eine neue Aufgabe geladen wird.
    useEffect(() => {
        if (firstInputRef.current) firstInputRef.current.focus();
    }, [taskKey]);

    const generateNew = (diffOverride) => {
        const diff = diffOverride || difficulty;
        setErrorMsg(""); setSolved(false); setSolutionRevealed(false); setActiveInputId(null);
        if (diff === 'pruefung') {
            let pool = examShuffled;
            let idx = examIdx;
            if (pool.length === 0 || idx >= pool.length) {
                pool = shuffleArray(binoExamTemplates);
                idx = 0;
                setExamShuffled(pool);
            }
            setProblem(parseExamTemplate(pool[idx]));
            setExamIdx(idx + 1);
        } else {
            const lvlMap = { leicht: 1, mittel: 2, schwer: 3 };
            setProblem(buildDynamicTask(lvlMap[diff]));
        }
        setTaskKey(k => k + 1);
    };

    const handleDifficultyChange = (newDiff) => {
        if (newDiff === difficulty) {
            generateNew(newDiff);
        } else {
            setDifficulty(newDiff);
            // Bei Wechsel zu Prüfungsaufgaben den Pool zurücksetzen.
            if (newDiff === 'pruefung') {
                const pool = shuffleArray(binoExamTemplates);
                setExamShuffled(pool);
                setExamIdx(1);
                setProblem(parseExamTemplate(pool[0]));
            } else {
                const lvlMap = { leicht: 1, mittel: 2, schwer: 3 };
                setProblem(buildDynamicTask(lvlMap[newDiff]));
            }
            setErrorMsg(""); setSolved(false); setSolutionRevealed(false); setActiveInputId(null);
            setTaskKey(k => k + 1);
        }
    };

    const handleInputChange = (inputId, value) => {
        setProblem(prev => ({
            ...prev,
            inputs: {
                ...prev.inputs,
                [inputId]: { ...prev.inputs[inputId], value, status: null }
            }
        }));
        setErrorMsg("");
    };

    const insertChar = (char) => {
        const targetId = activeInputId || Object.keys(problem.inputs)[0];
        if (!targetId) return;
        const cur = problem.inputs[targetId];
        if (!cur || cur.status === 'correct' || cur.status === 'solved') return;
        handleInputChange(targetId, (cur.value || '') + char);
    };

    const checkAnswers = () => {
        let allCorrect = true;
        const newInputs = {};
        Object.entries(problem.inputs).forEach(([id, inp]) => {
            const userNorm = normalizeBino(inp.value);
            const validNorm = inp.answers.map(normalizeBino);
            if (userNorm !== '' && validNorm.includes(userNorm)) {
                newInputs[id] = { ...inp, status: 'correct' };
            } else {
                newInputs[id] = { ...inp, status: 'incorrect' };
                allCorrect = false;
            }
        });
        setProblem(prev => ({ ...prev, inputs: newInputs }));

        if (allCorrect) {
            setErrorMsg("");
            setSolved(true);
            // Wenn die Lösung sichtbar war, zählt es nicht für den Streak.
            if (!solutionRevealed) {
                const newStreak = streak + 1;
                setStreak(newStreak);
                if (newStreak > 0 && newStreak % 3 === 0) triggerCelebration(setShowAnim);
            }
        } else {
            setErrorMsg("Noch nicht ganz richtig. Streak zurückgesetzt.");
            setStreak(0);
        }
    };

    // Lösung NUR anzeigen (kein Autofill — der Schüler muss noch selbst tippen).
    // Streak wird auf 0 gesetzt; "solved" bleibt false, damit weiter eingegeben werden kann.
    const showSolution = () => {
        setSolutionRevealed(true);
        setErrorMsg("");
        setStreak(0);
    };

    const inputClass = (status) => {
        const base = 'text-center border-b-4 mx-1 md:mx-2 outline-none rounded-t-md transition-all py-1 font-math';
        if (status === 'correct') return `${base} border-green-500 bg-green-100 text-green-800`;
        if (status === 'incorrect') return `${base} border-red-500 bg-red-50 text-red-800 focus:bg-white`;
        if (status === 'solved') return `${base} border-amber-500 bg-amber-100 text-amber-800`;
        return `${base} border-slate-300 bg-teal-50 text-teal-900 focus:border-teal-600 focus:bg-white`;
    };

    const renderToken = (token, idx) => {
        if (typeof token === 'string') {
            return <span key={idx} className="font-math">{token}</span>;
        }
        if (token.type === 'input') {
            const inp = problem.inputs[token.inputId];
            const isFirst = token.inputId === 'in_0';
            const isLocked = inp.status === 'correct' || inp.status === 'solved' || solved;
            return (
                <input
                    key={idx}
                    ref={isFirst ? firstInputRef : null}
                    type="text"
                    value={inp.value}
                    onChange={e => handleInputChange(token.inputId, e.target.value)}
                    onFocus={() => setActiveInputId(token.inputId)}
                    onKeyDown={e => { if (e.key === 'Enter' && !solved) checkAnswers(); }}
                    disabled={isLocked}
                    autoComplete="off" autoCorrect="off" spellCheck="false"
                    className={`${inp.width} ${inputClass(inp.status)}`}
                />
            );
        }
        return null;
    };

    // Für ²/³/⁴ rendern wir <sup>n</sup> in einheitlicher Größe — Unicode-Hochzahlen
    // werden je nach Schriftart unterschiedlich groß dargestellt.
    const helperKeys = [
        { char: '²', display: <sup className="text-lg font-bold leading-none">2</sup> },
        { char: '³', display: <sup className="text-lg font-bold leading-none">3</sup> },
        { char: '⁴', display: <sup className="text-lg font-bold leading-none">4</sup> },
        { char: 'x', display: 'x' }, { char: 'y', display: 'y' },
        { char: 'a', display: 'a' }, { char: 'b', display: 'b' },
        { char: 'c', display: 'c' }, { char: 'd', display: 'd' },
        { char: 'z', display: 'z' },
        { char: '+', display: '+' }, { char: '-', display: '−' }
    ];

    return (
        <div className="page-transition max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {showAnim && <CelebrationOverlay />}
            <header className="bg-teal-600 text-teal-50 shadow-md p-6 rounded-xl mb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <BracketsIcon className="w-8 h-8" />
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">Binomische Formeln <span className="hidden sm:inline text-teal-200 text-lg font-normal border-l-2 border-teal-400 pl-2 ml-2">10. Klasse</span></h1>
                        </div>
                    </div>
                    <div className="bg-teal-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm flex items-center">
                        <Target className="w-4 h-4 mr-2 text-teal-300" /> Streak: {streak}
                    </div>
                </div>
            </header>

            <DifficultyMenu theme="teal" active={difficulty} onChange={handleDifficultyChange}
                options={[
                    { id: 'leicht', label: 'Leicht' },
                    { id: 'mittel', label: 'Mittel' },
                    { id: 'schwer', label: 'Schwer' },
                    { id: 'pruefung', label: 'Prüfungsaufgaben' }
                ]} />

            <main className="space-y-6 relative">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-teal-50 px-6 py-3 border-b border-teal-200 flex justify-between items-center">
                        <h2 className="font-semibold text-teal-900 flex items-center"><BookOpen size={18} className="mr-2" /> Lückenfüller</h2>
                        {difficulty === 'pruefung' && problem?.sourceLabel
                            ? <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-amber-200 text-amber-800">{problem.sourceLabel}</span>
                            : <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-teal-200 text-teal-800">Achte auf die Variablen!</span>
                        }
                    </div>

                    <div className="p-6 md:p-10">
                        <div className="text-2xl md:text-3xl text-slate-800 leading-relaxed flex flex-wrap justify-center items-center gap-x-2 sm:gap-x-3 gap-y-4 font-math min-h-[120px]">
                            {problem.tokens.map(renderToken)}
                        </div>

                        {/* Hilfs-Tastatur */}
                        <div className="mt-10 bg-slate-50 p-3 rounded-xl border border-slate-200 max-w-md mx-auto">
                            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-bold text-center">Hilfs-Tastatur</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {helperKeys.map(k => (
                                    <button
                                        key={k.char}
                                        type="button"
                                        onClick={() => insertChar(k.char)}
                                        disabled={solved}
                                        className="bg-white border border-slate-300 hover:bg-teal-50 hover:border-teal-400 text-slate-700 w-12 h-12 rounded shadow-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed font-math text-xl flex items-center justify-end pr-2"
                                    >{k.display}</button>
                                ))}
                            </div>
                        </div>

                        {errorMsg && !solved && (
                            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-3 rounded shadow-sm text-red-700 font-medium flex items-center animate-fade-in">
                                <XCircle className="w-5 h-5 mr-2 shrink-0" />{errorMsg}
                            </div>
                        )}

                        {/* Lösungs-Anzeige als Text — Schüler muss selbst eintippen */}
                        {solutionRevealed && !solved && (
                            <div className="mt-4 bg-rose-50 border-l-4 border-rose-500 p-4 rounded shadow-sm text-rose-900 animate-fade-in">
                                <div className="flex items-start gap-3">
                                    <BookOpen className="w-6 h-6 shrink-0 text-rose-600 mt-0.5" />
                                    <div>
                                        <strong className="block mb-1 text-rose-800">Lösung (in Reihenfolge der Lücken):</strong>
                                        <div className="font-math text-lg flex flex-wrap gap-x-3 gap-y-1">
                                            {Object.values(problem.inputs).map((inp, idx) => (
                                                <span key={idx} className="bg-white/60 px-2 py-0.5 rounded border border-rose-200">{inp.answers[0]}</span>
                                            ))}
                                        </div>
                                        <p className="text-xs mt-2 text-rose-700">Tippe sie nun selbst in die Felder ein.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!solved && (
                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                <button onClick={checkAnswers} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-colors flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" /> Prüfen
                                </button>
                                {!solutionRevealed && (
                                    <button onClick={showSolution} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 border border-slate-200">
                                        <BookOpen className="w-5 h-5" /> Lösung anzeigen
                                    </button>
                                )}
                            </div>
                        )}

                        {solved && (
                            <SuccessBox
                                text="Klasse gemacht! 🎉"
                                subtitle={solutionRevealed ? "Geschafft — Streak bleibt 0 weil Lösung sichtbar war." : "Alle Lücken sind richtig ausgefüllt."}
                                onNext={() => generateNew()}
                                nextBtnText={difficulty === 'pruefung' ? 'Nächste Prüfung' : 'Nächste Aufgabe'}
                                theme="teal"
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(<BinformelnTrainer />);
