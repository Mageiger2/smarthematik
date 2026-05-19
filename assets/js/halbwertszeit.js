// ==========================================
// halbwertszeit.js — ZerfallsTrainer (Halbwertszeit)
// (Wird inline mit shared.js zusammen pro App-Seite kompiliert.)
// ==========================================

// ==========================================
// Hardcoded Prüfungsaufgaben (Bayern MSA — Halbwertszeit / radioaktiver Zerfall)
// ==========================================
const halbwertszeitsExamTasks = [
    {
        sigKey: 'msa-2025-ii-3a', label: 'MSA 2025 II/3a',
        text: 'Der Wirkstoff eines Medikaments hat im menschlichen Körper eine Halbwertszeit von 3 Stunden. Um 07:00 Uhr morgens nimmt ein Patient 90 mg dieses Wirkstoffs ein. Berechne die Masse des um 13:00 Uhr noch im Körper vorhandenen Wirkstoffs in Milligramm.',
        type: 'Wn', w0: 90, wn: 22.5, t: 6, thalf: 3, unit: 'mg', timeUnit: 'Stunden'
    },
    {
        sigKey: 'msa-2025-ii-3b', label: 'MSA 2025 II/3b',
        text: 'Eine Patientin nimmt 90 mg eines Wirkstoffs ein, der eine Halbwertszeit von 3 Stunden hat. Berechne, nach wie vielen Stunden noch 5,7 mg davon im Körper vorhanden sind.',
        type: 't', w0: 90, wn: 5.7, t: 12, thalf: 3, unit: 'mg', timeUnit: 'Stunden'
    },
    {
        sigKey: 'msa-2025-ii-3c', label: 'MSA 2025 II/3c',
        text: 'Eine Person nimmt um 08:00 Uhr eine bestimmte Ausgangsmasse eines Wirkstoffs (Halbwertszeit 3 Stunden) ein. Um 17:00 Uhr sind noch 21,9 mg im Körper enthalten. Berechne die Ausgangsmasse in Milligramm.',
        type: 'W0', w0: 175.2, wn: 21.9, t: 9, thalf: 3, unit: 'mg', timeUnit: 'Stunden'
    },
    {
        sigKey: 'msa-2023-ii-3a', label: 'MSA 2023 II/3a',
        text: 'Die Halbwertszeit für das Kohlenstoffisotop C-14 beträgt 5730 Jahre. Berechne die Masse an C-14, die bei einer Ausgangsmasse von 10,5 g nach 28 650 Jahren noch vorhanden ist.',
        type: 'Wn', w0: 10.5, wn: 0.328, t: 28650, thalf: 5730, unit: 'g', timeUnit: 'Jahren'
    },
    {
        sigKey: 'msa-2020-i-2a', label: 'MSA 2020 I/2a',
        text: 'Das radioaktive Element Kobalt-60 hat eine Halbwertszeit von 5 Jahren. In einem Behälter befinden sich 3,675 kg Kobalt-60. Berechne, wie viele Kilogramm nach 13 Jahren noch vorhanden sind.',
        type: 'Wn', w0: 3.675, wn: 0.606, t: 13, thalf: 5, unit: 'kg', timeUnit: 'Jahren'
    },
    {
        sigKey: 'msa-2020-i-2b', label: 'MSA 2020 I/2b',
        text: 'Das radioaktive Element Kobalt-60 hat eine Halbwertszeit von 5 Jahren. Ermittle rechnerisch, nach wie vielen Jahren von 3,675 kg Kobalt-60 nur noch 0,1 kg vorhanden sind.',
        type: 't', w0: 3.675, wn: 0.1, t: 26, thalf: 5, unit: 'kg', timeUnit: 'Jahren'
    },
    {
        sigKey: 'msa-2017-ii-3a', label: 'MSA 2017 II/3a',
        text: 'Bei einer Schilddrüsenuntersuchung verwendet man ein Kontrastmittel mit Iod-123 (Halbwertszeit 13 Stunden). Eine 60 kg schwere Patientin erhält 0,5 g pro kg, also 30 g Iod-123. Berechne die Menge, die nach 65 Stunden noch nicht zerfallen ist.',
        type: 'Wn', w0: 30, wn: 0.9375, t: 65, thalf: 13, unit: 'g', timeUnit: 'Stunden'
    },
    {
        sigKey: 'msa-2016-i-4a', label: 'MSA 2016 I/4a',
        text: 'Die Halbwertszeit von Astat-210 beträgt 8 Stunden. Berechne die Masse, die nach 2 Tagen (= 48 Stunden) von ursprünglich 5 kg noch vorhanden ist.',
        type: 'Wn', w0: 5000, wn: 78.125, t: 48, thalf: 8, unit: 'g', timeUnit: 'Stunden'
    },
    {
        sigKey: 'msa-2016-i-4b', label: 'MSA 2016 I/4b',
        text: 'Die Halbwertszeit von Astat-210 beträgt 8 Stunden. Nach 40 Stunden sind von einer bestimmten Menge noch 16,25 g übrig. Berechne die Ausgangsmenge.',
        type: 'W0', w0: 520, wn: 16.25, t: 40, thalf: 8, unit: 'g', timeUnit: 'Stunden'
    },
    {
        sigKey: 'msa-2012-ii-3a', label: 'MSA 2012 II/3a',
        text: 'Cäsium-137 hat eine Halbwertszeit von 30 Jahren. Berechne, wie viel Gramm bei einer Ausgangsmenge von 2,5 kg nach 60 Jahren noch vorhanden sind.',
        type: 'Wn', w0: 2500, wn: 625, t: 60, thalf: 30, unit: 'g', timeUnit: 'Jahren'
    },
    {
        sigKey: 'msa-mp-ii-6b', label: 'MSA Muster II/6b',
        text: 'Plutonium-243 hat eine Halbwertszeit von 5 Stunden. Berechne die Masse des ursprünglich vorhandenen Plutoniums-243, wenn nach 20 Stunden noch 15 mg nachweisbar sind.',
        type: 'W0', w0: 240, wn: 15, t: 20, thalf: 5, unit: 'mg', timeUnit: 'Stunden'
    },
    {
        sigKey: 'msa-mp-ii-6c', label: 'MSA Muster II/6c',
        text: 'Plutonium-243 hat eine Halbwertszeit von 5 Stunden. Ermittle rechnerisch, nach wie vielen Stunden von ursprünglich 400 mg noch 12,5 mg vorhanden sind.',
        type: 't', w0: 400, wn: 12.5, t: 25, thalf: 5, unit: 'mg', timeUnit: 'Stunden'
    }
];

// Wandelt einen Eintrag in das problem-Format des Trainers um.
const buildHalbwertszeitsExamProblem = (task) => {
    const w0_f = formatNum(task.w0), wn_f = formatNum(task.wn);
    const solution = task.type === 't' ? task.t : (task.type === 'W0' ? task.w0 : task.wn);
    let explanation = `${task.label}\n\nGegeben:\n${task.type !== 'W0' ? `W0 = ${w0_f} ${task.unit}\n` : ''}${task.type !== 'Wn' ? `Wn = ${wn_f} ${task.unit}\n` : ''}${task.type !== 't' ? `t = ${task.t} ${task.timeUnit}\n` : ''}Halbwertszeit T₁/₂ = ${task.thalf} ${task.timeUnit}  =>  q = 0,5\n\nRechnung:\n`;
    if (task.type === 'Wn') explanation += `Wn = ${w0_f} · 0,5^(${task.t}/${task.thalf}) = ${wn_f}`;
    if (task.type === 'W0') explanation += `W0 = ${wn_f} / 0,5^(${task.t}/${task.thalf}) = ${w0_f}`;
    if (task.type === 't') explanation += `t = ( log(${wn_f}/${w0_f}) / log(0,5) ) · ${task.thalf} = ${task.t}`;
    return {
        type: task.type, scenario: 'pruefung', text: task.text + ' Was musst du berechnen?',
        w0: task.w0, wn: task.wn, q: 0.5, t: task.t, thalf: task.thalf, unit: task.unit,
        solution, explanation, examLabel: task.label, sigKey: task.sigKey
    };
};

const ZerfallsTrainer = () => {
    const [difficulty, setDifficulty] = useState('mittel');
    const [problem, setProblem] = useState(null);
    const [step, setStep] = useState(1);
    const [selectedIdentification, setSelectedIdentification] = useState(null);
    const [inputs, setInputs] = useState({ wn: '', w0: '', t: '', thalf: '' });
    const [inputFeedback, setInputFeedback] = useState({});
    const [options, setOptions] = useState([]);
    const [selectedOptionId, setSelectedOptionId] = useState(null);
    const [finalAnswer, setFinalAnswer] = useState('');
    const [finalFeedback, setFinalFeedback] = useState(null);
    const [showSolution, setShowSolution] = useState(false);
    const [streak, setStreak] = useState(() => getStorage('smarth_streak_zerfall', 0));
    const [loading, setLoading] = useState(true);
    const [sequenceIndex, setSequenceIndex] = useState(0);

    const [errors, setErrors] = useState(0);
    const [tipRevealed, setTipRevealed] = useState(false);
    const [showAnim, setShowAnim] = useState(false);
    // Anti-Wiederholung + Prüfungsaufgaben-Pool.
    const [lastSigKey, setLastSigKey] = useState(null);
    const [examShuffled, setExamShuffled] = useState([]);
    const [examIdx, setExamIdx] = useState(0);
    // Adaptive Schwierigkeit + Lernzielkontrolle.
    const adaptive = useAdaptive('halbwertszeit', difficulty);

    useEffect(() => { setStorage('smarth_streak_zerfall', streak); }, [streak]);
    const advance = (nextStep) => { setStep(nextStep); setErrors(0); setTipRevealed(false); };
    const triggerError = () => { setErrors(e => e + 1); setStreak(0); adaptive.recordWrong(); };
    const round = (num, decimals = 2) => Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    const handleInputChange = (id, val) => { setInputs(prev => ({ ...prev, [id]: val.replace('.', ',') })); setInputFeedback(prev => ({ ...prev, [id]: null })); };

    // Options für Schritt 3 bauen + loading false. Wird sowohl im Random- als auch
    // im Prüfungsmodus aufgerufen.
    const buildOptionsAndFinish = (prob) => {
        let opts = [];
        switch (prob.type) {
            case 'Wn': opts = [{ id: '1', label: 'Formel ist bereits aufgelöst. Einfach ausrechnen.', isCorrect: true }, { id: '2', label: <span>Teile durch <VarW0/></span>, isCorrect: false }, { id: '3', label: <span>Wende den Logarithmus an</span>, isCorrect: false }]; break;
            case 'W0': opts = [{ id: '1', label: <span>Teile durch 0,5<sup>t/T<sub>1/2</sub></sup></span>, isCorrect: true }, { id: '2', label: <span>Multipliziere mit 0,5<sup>t/T<sub>1/2</sub></sup></span>, isCorrect: false }, { id: '3', label: <span>Teile durch t</span>, isCorrect: false }]; break;
            case 't': opts = [{ id: '1', label: <span>1. Teile durch <VarW0/> <br/> 2. Logarithmus anwenden<br/> 3. Mit T<sub>1/2</sub> multiplizieren</span>, isCorrect: true }, { id: '2', label: <span>1. Teile durch 0,5 <br/> 2. Logarithmus anwenden</span>, isCorrect: false }, { id: '3', label: <span>1. Teile durch <VarW0/> <br/> 2. Ziehe die Wurzel</span>, isCorrect: false }]; break;
        }
        setOptions(opts.sort(() => Math.random() - 0.5));
        setLoading(false);
    };

    const generateProblem = () => {
        setLoading(true); setStep(1); setSelectedIdentification(null); setInputs({ wn: '', w0: '', t: '', thalf: '' }); setInputFeedback({});
        setOptions([]); setSelectedOptionId(null); setFinalAnswer(''); setFinalFeedback(null); setShowSolution(false); setErrors(0); setTipRevealed(false);

        // ===== Prüfungsaufgaben =====
        if (difficulty === 'pruefung') {
            let pool = examShuffled;
            let idx = examIdx;
            if (pool.length === 0 || idx >= pool.length) {
                pool = shuffleArray(halbwertszeitsExamTasks);
                idx = 0;
                setExamShuffled(pool);
            }
            const task = pool[idx];
            const examProb = buildHalbwertszeitsExamProblem(task);
            setProblem(examProb);
            setExamIdx(idx + 1);
            setLastSigKey(examProb.sigKey);
            buildOptionsAndFinish(examProb);
            return;
        }

        // ===== Generierte Aufgaben mit Anti-Wiederholung =====
        const scenarios = ['radioactivity', 'medicine'];
        // Im "leicht"-Modus immer nur Wn-gesucht.
        const sequenceOrder = (difficulty === 'leicht') ? ['Wn'] : ['Wn', 'W0', 't'];

        let scenario, type, w0, t, thalf, wn, unit, timeUnit;
        const q = 0.5;
        let sigKey = '';
        let attempts = 0;
        do {
            scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
            type = sequenceOrder[sequenceIndex % sequenceOrder.length];
            // Reset für nächste Runde damit Generierung gemischt wird.
            switch (scenario) {
                case 'radioactivity': unit = "mg"; timeUnit = "Tagen"; w0 = Math.floor(Math.random() * 100) * 10 + 500; thalf = Math.floor(Math.random() * 8) + 2; t = thalf * (Math.floor(Math.random() * 5) + 2); break;
                case 'medicine': unit = "mg"; timeUnit = "Stunden"; w0 = Math.floor(Math.random() * 40) * 10 + 200; thalf = Math.floor(Math.random() * 6) + 2; t = thalf * (Math.floor(Math.random() * 4) + 2); break;
            }
            if (difficulty === 'leicht') {
                // Glatte Werte: t = ganzzahliges Vielfaches von thalf.
                w0 = (Math.floor(Math.random()*9)+2) * 100;
                thalf = Math.floor(Math.random()*5)+2;
                t = thalf * (Math.floor(Math.random()*4)+1);
            } else if (difficulty === 'schwer') {
                t = Math.floor(Math.random() * 12) + 5;
                thalf = Math.floor(Math.random() * 5) + 2;
            }
            wn = round(w0 * Math.pow(q, t / thalf), 2);
            sigKey = `${difficulty}-${scenario}-${type}-${w0}-${t}-${thalf}`;
            attempts++;
        } while (sigKey === lastSigKey && attempts < 8);
        setLastSigKey(sigKey);
        setSequenceIndex(prev => prev + 1);

        const w0_f = formatNum(w0), wn_f = formatNum(wn);
        const valWord = (scenario === 'medicine' ? 'Wirkstoffmenge' : 'Masse');

        let questionText = "";
        if (difficulty === 'schwer') {
            questionText = `Ein Labor untersucht eine Probe. Die Halbwertszeit beträgt ${thalf} ${timeUnit}. `;
            switch (type) {
                case 'Wn': questionText += `Zu Beginn lag der Wert bei ${w0_f} ${unit}. Wie viel ist nach ${t} ${timeUnit} noch messbar?`; break;
                case 'W0': questionText += `Nach genau ${t} ${timeUnit} können noch ${wn_f} ${unit} nachgewiesen werden. Wie hoch war die Ausgangsmenge?`; break;
                case 't': questionText += `Der Startwert betrug ${w0_f} ${unit}. Jetzt sind es nur noch ${wn_f} ${unit}. Wie viele ${timeUnit} sind vergangen?`; break;
            }
        } else {
            switch (type) {
                case 'Wn': questionText = `Eine ${valWord} von ${w0_f} ${unit} hat eine Halbwertszeit von ${thalf} ${timeUnit}. Zeitraum: ${t} ${timeUnit}.`; break;
                case 'W0': questionText = `Nach ${t} ${timeUnit} ist die ${valWord} auf ${wn_f} ${unit} gesunken. Die Halbwertszeit beträgt ${thalf} ${timeUnit}.`; break;
                case 't': questionText = `Startwert: ${w0_f} ${unit}. Endwert: ${wn_f} ${unit}. Die Halbwertszeit beträgt ${thalf} ${timeUnit}.`; break;
            }
        }
        questionText += " Was musst du berechnen?";

        let explanation = `Gegeben:\n${type !== 'W0' ? `W0 = ${w0_f} ${unit}\n` : ''}${type !== 'Wn' ? `Wn = ${wn_f} ${unit}\n` : ''}${type !== 't' ? `t = ${t} ${timeUnit}\n` : ''}Halbwertszeit T₁/₂ = ${thalf} ${timeUnit}  => q = 0,5\n\nRechnung:\n`;
        if (type === 'Wn') explanation += `Wn = ${w0_f} · 0,5^(${t}/${thalf}) = ${wn_f}`;
        if (type === 'W0') explanation += `W0 = ${wn_f} / 0,5^(${t}/${thalf}) = ${w0_f}`;
        if (type === 't') explanation += `t = ( log(${wn_f}/${w0_f}) / log(0,5) ) · ${thalf} = ${t}`;

        const newProb = { type, scenario, text: questionText, w0, wn, q, t, thalf, unit, solution: type === 't' ? t : (type === 'W0' ? w0 : wn), explanation };
        setProblem(newProb);
        buildOptionsAndFinish(newProb);
    };

    useEffect(() => { generateProblem(); }, [difficulty]);

    const handleDifficultyChange = (newDiff) => {
        if (newDiff === 'pruefung' && difficulty !== 'pruefung') {
            setExamShuffled([]);
            setExamIdx(0);
        }
        if (difficulty === newDiff) generateProblem();
        else setDifficulty(newDiff);
    };

    // Step 1: Auswahl nur markieren, Bestätigung über SubmitBtn (siehe wachstum.js).
    const handleIdentify = (selected) => {
        if (step > 1 || !problem) return;
        setSelectedIdentification(selected);
    };
    const confirmIdentify = () => {
        if (step > 1 || !problem || !selectedIdentification) return;
        if (selectedIdentification === problem.type) { advance(2); } else { triggerError(); }
    };

    const checkFormulaInputs = () => {
        if (!problem) return;
        let allCorrect = true, feedback = {};
        const checkVal = (input, target) => { const val = parseFloat(input.replace(',', '.')); if (isNaN(val)) return false; return Math.abs(val - target) < (Math.max(target * 0.01, 0.005)); };
        if (problem.type !== 'Wn' && !checkVal(inputs.wn, problem.wn)) { feedback.wn = 'incorrect'; allCorrect = false; } else feedback.wn = 'correct';
        if (problem.type !== 'W0' && !checkVal(inputs.w0, problem.w0)) { feedback.w0 = 'incorrect'; allCorrect = false; } else feedback.w0 = 'correct';
        if (problem.type !== 't' && !checkVal(inputs.t, problem.t)) { feedback.t = 'incorrect'; allCorrect = false; } else feedback.t = 'correct';
        if (!checkVal(inputs.thalf, problem.thalf)) { feedback.thalf = 'incorrect'; allCorrect = false; } else feedback.thalf = 'correct';
        setInputFeedback(feedback);
        if (allCorrect) advance(3); else triggerError();
    };

    // Step 3: Auswahl nur markieren — Bestätigung über SubmitBtn.
    const handleOptionSelect = (opt) => {
        if (step > 3) return;
        setSelectedOptionId(opt.id);
    };
    const confirmOptionSelect = () => {
        if (step > 3 || !selectedOptionId) return;
        const opt = options.find(o => o.id === selectedOptionId);
        if (!opt) return;
        if (opt.isCorrect) { advance(4); } else { triggerError(); }
    };

    const checkFinalResult = () => {
        if (!problem) return;
        const val = parseFloat(finalAnswer.replace(',', '.')); if (isNaN(val)) return;
        const tolerance = problem.type === 't' ? 0.5 : Math.max(0.5, Math.abs(problem.solution) * 0.01);
        if (Math.abs(val - problem.solution) <= tolerance || (problem.type === 't' && Math.round(val) === problem.solution)) {
            setFinalFeedback('correct');
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > 0 && newStreak % 3 === 0) triggerCelebration(setShowAnim);
            adaptive.recordCorrect();
            setShowSolution(true); advance(5);
        } else { setFinalFeedback('incorrect'); triggerError(); }
    };

    // Liefert den Lösungstext für den aktuellen Schritt — TipBox zeigt ihn an,
    // füllt aber nichts automatisch aus.
    const getSolutionText = () => {
        if (!problem) return null;
        const labelMap = { Wn: 'Wn', W0: 'W0', t: 't (Dauer)' };
        if (step === 1) return `Du suchst ${labelMap[problem.type]}.`;
        if (step === 2) {
            const parts = [];
            if (problem.type !== 'Wn') parts.push(`Wn = ${formatNum(problem.wn)}`);
            if (problem.type !== 'W0') parts.push(`W0 = ${formatNum(problem.w0)}`);
            if (problem.type !== 't') parts.push(`t = ${problem.t}`);
            parts.push(`T₁/₂ = ${problem.thalf}`);
            return parts.join(';   ');
        }
        if (step === 3) {
            const correct = options.find(o => o.isCorrect);
            return correct ? <span>{correct.label}</span> : null;
        }
        if (step === 4) {
            const u = problem.type === 't' ? '' : (problem.unit || '');
            return `${formatNum(problem.solution)} ${u}`.trim();
        }
        return null;
    };
    const onSolutionShown = () => setStreak(0);

    return (
        <div className="page-transition max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {showAnim && <CelebrationOverlay />}
            <TrainerHeader theme="rose" icon={TrendingDown} title="Halbwertszeit" streakIcon={TrendingDown} streak={streak} />

            <DifficultyMenu theme="rose" active={difficulty} onChange={handleDifficultyChange} options={[
                {id: 'leicht', label: 'Leicht'},
                {id: 'mittel', label: 'Mittel'},
                {id: 'schwer', label: 'Schwer'},
                {id: 'pruefung', label: 'Prüfungsaufgaben'}
            ]} />

            {/* Lernzielkontrolle + adaptive Schwierigkeits-Empfehlung */}
            {adaptive.stats.mastered.length > 0 && (
                <div className="mb-4 flex justify-center"><MasteryBadge mastered={adaptive.stats.mastered} theme="rose" /></div>
            )}
            <AdaptiveSuggestion suggestion={adaptive.suggestion} onAccept={(d) => handleDifficultyChange(d)} theme="rose" />

            <main className="space-y-6 relative">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-rose-50 px-6 py-3 border-b border-rose-200 flex justify-between items-center">
                        <h2 className="font-semibold text-rose-900 flex items-center"><BookOpen size={18} className="mr-2"/> Sachaufgabe</h2>
                        {problem?.examLabel
                            ? <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-amber-200 text-amber-800">{formatExamLabel(problem.examLabel)}</span>
                            : <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-rose-200 text-rose-800">Halbwertszeit</span>
                        }
                    </div>
                    <div className="p-6 bg-white min-h-[100px] flex items-center justify-center text-center">
                        {loading ? <RefreshCw className="w-8 h-8 animate-spin text-rose-400"/> : <p className="text-xl font-medium leading-relaxed">{problem?.text}</p>}
                    </div>
                </div>

                <div className="space-y-4">
                    <StepCard title="1. Was ist gesucht?" stepNum={1} currentStep={step} theme="rose">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[{ type: 'Wn', label: <VarWn/>, desc: "Endwert" }, { type: 'W0', label: <VarW0/>, desc: "Anfangswert" }, { type: 't', label: <span className="font-serif italic text-xl">t</span>, desc: "Dauer / Zeit" }].map((item) => (
                                <button key={item.type} onClick={() => handleIdentify(item.type)} disabled={step > 1} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${selectedIdentification === item.type ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold' : 'border-slate-200 hover:border-rose-300 bg-white'}`}>
                                    <span className="text-xl font-serif font-bold">{item.label}</span><span className="text-[10px] sm:text-xs uppercase font-semibold text-slate-500">{item.desc}</span>
                                </button>
                            ))}
                        </div>
                        {step === 1 && <div className="mt-4 flex justify-between items-center"><TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text="Achte darauf, ob der Startwert, der Endwert oder die Dauer gefragt ist. q ist bei Halbwertszeit immer 0,5." /><SubmitBtn onClick={confirmIdentify} theme="rose" disabled={!selectedIdentification} /></div>}
                        {step > 1 && <SuccessMark text={`Richtig! Du suchst ${problem?.type === 'Wn' ? "Wn" : problem?.type === 'W0' ? "W0" : "t (Dauer)"}.`} />}
                    </StepCard>

                    {step >= 2 && (
                        <StepCard title="2. Werte einsetzen (Halbwertszeit)" stepNum={2} currentStep={step} theme="rose">
                            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 bg-slate-50 p-4 sm:p-6 rounded-xl border border-dashed border-slate-300">
                                <FormulaInput id="wn" label={<VarWn/>} value={inputs.wn} theme="rose" isUnknown={problem.type === 'Wn'} status={inputFeedback.wn} disabled={step > 2 || inputFeedback.wn === 'correct'} onChange={handleInputChange} onSubmit={checkFormulaInputs} />
                                <span className="text-2xl text-slate-400 font-bold mt-6">=</span>
                                <FormulaInput id="w0" label={<VarW0/>} value={inputs.w0} theme="rose" isUnknown={problem.type === 'W0'} status={inputFeedback.w0} disabled={step > 2 || inputFeedback.w0 === 'correct'} onChange={handleInputChange} onSubmit={checkFormulaInputs} />
                                <span className="text-2xl text-slate-400 font-bold mt-6">·</span>

                                <div className="flex items-start mt-6">
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-12 flex items-center justify-center font-bold text-xl text-rose-800 bg-rose-100 border-2 border-rose-300 rounded-lg">0,5</div>
                                    </div>
                                    <div className="flex flex-col items-center ml-1" style={{marginTop: '-24px'}}>
                                        <div className="flex items-center gap-1">
                                            <span className="text-slate-500 italic text-sm">t</span>
                                            <MiniFormulaInput id="t" value={inputs.t} isUnknown={problem.type === 't'} status={inputFeedback.t} disabled={step > 2 || inputFeedback.t === 'correct'} onChange={handleInputChange} onSubmit={checkFormulaInputs} />
                                        </div>
                                        <div className="w-full border-b-2 border-slate-400 my-1"></div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-slate-500 italic text-sm">T<sub>1/2</sub></span>
                                            <MiniFormulaInput id="thalf" value={inputs.thalf} isUnknown={false} status={inputFeedback.thalf} disabled={step > 2 || inputFeedback.thalf === 'correct'} onChange={handleInputChange} onSubmit={checkFormulaInputs} />
                                        </div>
                                    </div>
                                </div>

                            </div>
                            {step === 2 && <div className="mt-4 flex justify-between items-center"><TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text="Der Exponent ist ein Bruch: Oben die gesamte Dauer (t), unten die Halbwertszeit (T1/2)." /><SubmitBtn onClick={checkFormulaInputs} theme="rose" disabled={!(inputs.wn || inputs.w0 || inputs.t || inputs.thalf)} /></div>}
                            {step > 2 && <SuccessMark text="Alle Werte richtig eingesetzt!" />}
                        </StepCard>
                    )}

                    {step >= 3 && (
                        <StepCard title="3. Gleichung umformen" stepNum={3} currentStep={step} theme="rose">
                            <div className="flex justify-center items-center gap-2 text-xl md:text-2xl font-mono bg-slate-100 py-4 px-2 rounded-lg mb-6 text-slate-700">
                                <span>{problem.type === 'Wn' ? <span className="text-rose-600 font-bold">Wn</span> : formatNum(problem.wn)} = {problem.type === 'W0' ? <span className="text-rose-600 font-bold">W0</span> : formatNum(problem.w0)} · 0,5<sup className="ml-1"><span className="inline-flex flex-col items-center align-middle text-[0.6em]"><span className="border-b border-slate-700 pb-0.5 px-1">{problem.type === 't' ? <span className="text-rose-600 font-bold">t</span> : problem.t}</span><span className="pt-0.5 px-1">{problem.thalf}</span></span></sup></span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {options.map((opt) => (
                                    <button key={opt.id} onClick={() => handleOptionSelect(opt)} disabled={step > 3} className={`p-4 rounded-xl border-2 text-sm md:text-base font-medium flex flex-col items-center justify-center gap-2 ${selectedOptionId === opt.id ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold' : 'border-slate-200 hover:border-rose-300'}`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            {step === 3 && <div className="mt-4 flex justify-between items-center"><TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text="Um W0 zu erhalten, musst du durch die Potenz 0,5^(t/T1/2) teilen. Für t brauchst du den Logarithmus." /><SubmitBtn onClick={confirmOptionSelect} theme="rose" disabled={!selectedOptionId} /></div>}
                            {step > 3 && <SuccessMark text="Richtig umgeformt!" />}
                        </StepCard>
                    )}

                    {step >= 4 && (
                        <StepCard title="4. Ergebnis berechnen" stepNum={4} currentStep={step} theme="rose">
                            <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
                                <div className="relative flex-grow max-w-sm w-full">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif text-slate-400 italic">{problem.type === 'Wn' ? <VarWn/> : problem.type === 'W0' ? <VarW0/> : <span className="font-serif italic text-xl">t</span>} =</span>
                                    <input type="text" value={finalAnswer} onChange={(e) => setFinalAnswer(e.target.value.replace('.', ','))} onKeyDown={enterToSubmit(checkFinalResult)} disabled={step === 5} placeholder="Rechner nutzen..." className={`pl-16 pr-12 py-3 w-full rounded-lg border-2 text-lg outline-none transition-colors shadow-sm ${finalFeedback === 'correct' ? 'border-green-500 bg-green-50 text-green-900 font-bold' : finalFeedback === 'incorrect' ? 'border-red-400 bg-red-50' : 'border-slate-300 focus:border-rose-500'}`} />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">{problem.type === 't' ? '' : problem.unit}</span>
                                </div>
                                {step === 4 && <SubmitBtn onClick={checkFinalResult} theme="rose" disabled={!(finalAnswer || '').trim()} />}
                            </div>
                            {step === 4 && <div className="mt-3"><CalcButton theme="rose" /></div>}
                            {step === 4 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text="Nutze den Rechner! Wenn t gesucht ist: log(Endwert / Startwert) geteilt durch log(0.5), dann mal die Halbwertszeit!" />}
                            {step > 4 && <SuccessMark text="Perfekt gerechnet!" />}
                        </StepCard>
                    )}

                    {step === 5 && (
                        <SuccessBox showSolutionBtn={true} showSolution={showSolution} onToggleSolution={() => setShowSolution(!showSolution)} onNext={generateProblem} solutionText={problem.explanation} theme="rose" nextBtnText={difficulty === 'pruefung' ? 'Nächste Prüfung' : 'Nächste Aufgabe'} />
                    )}
                </div>
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(<ZerfallsTrainer />);
