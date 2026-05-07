// ==========================================
// wachstum.js — WachstumsTrainer
// (Wird inline mit shared.js zusammen pro App-Seite kompiliert.)
// ==========================================

const WachstumsTrainer = () => {
    const [difficulty, setDifficulty] = useState('normal');
    const [problem, setProblem] = useState(null);
    const [step, setStep] = useState(1);
    const [selectedIdentification, setSelectedIdentification] = useState(null);
    const [inputs, setInputs] = useState({ wn: '', w0: '', q: '', n: '' });
    const [inputFeedback, setInputFeedback] = useState({});
    const [options, setOptions] = useState([]);
    const [selectedOptionId, setSelectedOptionId] = useState(null);
    const [finalAnswer, setFinalAnswer] = useState('');
    const [finalFeedback, setFinalFeedback] = useState(null);
    const [showSolution, setShowSolution] = useState(false);
    const [streak, setStreak] = useState(() => getStorage('smarth_streak_wachstum', 0));
    const [loading, setLoading] = useState(true);
    const [sequenceIndex, setSequenceIndex] = useState(0);

    const [errors, setErrors] = useState(0);
    const [tipRevealed, setTipRevealed] = useState(false);
    const [showAnim, setShowAnim] = useState(false);

    useEffect(() => { setStorage('smarth_streak_wachstum', streak); }, [streak]);
    const advance = (nextStep) => { setStep(nextStep); setErrors(0); setTipRevealed(false); };
    const triggerError = () => { setErrors(e => e + 1); setStreak(0); };
    const round = (num, decimals = 2) => Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    const handleInputChange = (id, val) => { setInputs(prev => ({ ...prev, [id]: val.replace('.', ',') })); setInputFeedback(prev => ({ ...prev, [id]: null })); };

    const generateProblem = () => {
        setLoading(true); setStep(1); setSelectedIdentification(null); setInputs({ wn: '', w0: '', q: '', n: '' }); setInputFeedback({});
        setOptions([]); setSelectedOptionId(null); setFinalAnswer(''); setFinalFeedback(null); setShowSolution(false); setErrors(0); setTipRevealed(false);

        const scenarios = ['money', 'population', 'depreciation', 'cooling'];
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        const sequenceOrder = ['Wn', 'rate', 'W0', 'n'];
        const type = sequenceOrder[sequenceIndex % sequenceOrder.length];
        setSequenceIndex(prev => prev + 1);

        let w0, rate, n, q, wn, unit;
        let isGrowth = (scenario === 'money' || scenario === 'population');

        switch (scenario) {
            case 'money': unit = "€"; w0 = Math.floor(Math.random() * 50) * 100 + 500; rate = round(Math.random() * 4 + 0.5, 1); n = Math.floor(Math.random() * 10) + 2; break;
            case 'population': unit = "Einwohner"; w0 = Math.floor(Math.random() * 50) * 1000 + 10000; rate = round(Math.random() * 2 + 0.5, 1); n = Math.floor(Math.random() * 15) + 5; break;
            case 'depreciation': unit = "€"; w0 = Math.floor(Math.random() * 20) * 1000 + 15000; rate = Math.floor(Math.random() * 10) + 8; n = Math.floor(Math.random() * 6) + 3; break;
            case 'cooling': unit = "°C"; w0 = Math.floor(Math.random() * 60) + 40; rate = Math.floor(Math.random() * 15) + 5; n = Math.floor(Math.random() * 10) + 2; break;
        }

        q = isGrowth ? round(1 + rate / 100, 4) : round(1 - rate / 100, 4);
        wn = round(w0 * Math.pow(q, n), 2);
        if (unit === 'Einwohner') wn = Math.round(wn);

        const w0_f = formatNum(w0); const wn_f = formatNum(wn); const rate_f = formatNum(rate);
        let questionText = "";
        const timeUnit = (scenario === 'cooling') ? 'Minuten' : 'Jahren';
        const timeAdverb = (scenario === 'cooling') ? 'minütlich' : 'jährlich';
        const actionWord = isGrowth ? 'wächst/steigt' : 'sinkt/fällt';
        const valWord = (scenario === 'money' || scenario === 'depreciation') ? 'Wert/Kapital' : (scenario === 'cooling' ? 'Temperatur' : 'Bestand');

        if (difficulty === 'schwer' && timeUnit === 'Jahren') {
            let y1 = 2010 + Math.floor(Math.random()*8); let y2 = y1 + n;
            switch (type) {
                case 'Wn': questionText = `Im Jahr ${y1} lag der ${valWord} bei ${w0_f} ${unit}. Er ${actionWord} ${timeAdverb} um ${rate_f} %. Wie hoch ist er im Jahr ${y2}?`; break;
                case 'W0': questionText = `Im Jahr ${y2} liegt der ${valWord} bei ${wn_f} ${unit}, nachdem er seit ${y1} ${timeAdverb} um ${rate_f} % ${actionWord === 'wächst/steigt' ? 'gestiegen' : 'gesunken'} ist. Wie hoch war er ${y1}?`; break;
                case 'rate': questionText = `Der ${valWord} hat sich von ${y1} (${w0_f} ${unit}) bis ${y2} (${wn_f} ${unit}) verändert. Wie hoch war die jährliche prozentuale Veränderung?`; break;
                case 'n': questionText = `Startwert: ${w0_f} ${unit}. Er ${actionWord} um ${rate_f} % pro Jahr. Nach wie vielen Jahren wird ${wn_f} ${unit} erreicht?`; break;
            }
        } else {
            switch (type) {
                case 'Wn': questionText = `Ein ${valWord} von ${w0_f} ${unit} ${actionWord} ${timeAdverb} um ${rate_f} %. Zeitraum: ${n} ${timeUnit}.`; break;
                case 'W0': questionText = `Nach ${n} ${timeUnit} ist ein ${valWord} auf ${wn_f} ${unit} ${actionWord === 'wächst/steigt' ? 'gestiegen' : 'gesunken'}. Die Veränderung betrug ${rate_f} %.`; break;
                case 'rate': questionText = `Ein ${valWord} hat sich in ${n} ${timeUnit} von ${w0_f} ${unit} auf ${wn_f} ${unit} verändert.`; break;
                case 'n': questionText = `Startwert: ${w0_f} ${unit}. Endwert: ${wn_f} ${unit}. Veränderung: ${rate_f} % pro ${timeUnit === 'Minuten' ? 'Minute' : 'Jahr'}.`; break;
            }
        }
        questionText += " Was musst du berechnen?";

        let explanation = `Gegeben:\n${type !== 'W0' ? `W0 = ${formatNum(w0)} ${unit}\n` : ''}${type !== 'Wn' ? `Wn = ${formatNum(wn)} ${unit}\n` : ''}${type !== 'n' ? `n = ${n}\n` : ''}${type !== 'rate' ? `p = ${formatNum(rate)}%  =>  q = ${formatNum(q)}\n` : ''}\nRechnung:\n`;
        if (type === 'Wn') explanation += `Wn = ${w0_f} · ${formatNum(q)}^${n} = ${wn_f}`;
        if (type === 'W0') explanation += `W0 = ${wn_f} / ${formatNum(q)}^${n} = ${w0_f}`;
        if (type === 'rate') explanation += `q = (${wn_f}/${w0_f})^(1/${n}) = ${formatNum(q)} => p=${rate_f}%`;
        if (type === 'n') explanation += `n = log(${wn_f}/${w0_f}) / log(${formatNum(q)}) = ${n}`;

        setProblem({ type, scenario, text: questionText, w0, wn, rate, q, n, unit, solution: type === 'rate' ? rate : (type === 'n' ? n : (type === 'W0' ? w0 : wn)), explanation });

        let opts = [];
        switch (type) {
            case 'Wn': opts = [{ id: '1', label: 'Formel ist bereits aufgelöst. Einfach ausrechnen.', isCorrect: true }, { id: '2', label: <span>Teile durch <VarW0/></span>, isCorrect: false }, { id: '3', label: <span>Ziehe die {n}-te Wurzel</span>, isCorrect: false }]; break;
            case 'W0': opts = [{ id: '1', label: <span>Teile durch <VarQpowN/></span>, isCorrect: true }, { id: '2', label: <span>Multipliziere mit <VarQpowN/></span>, isCorrect: false }, { id: '3', label: <span>Subtrahiere <VarQpowN/></span>, isCorrect: false }]; break;
            case 'rate': opts = [{ id: '1', label: <span>1. Teile durch <VarW0/> <br/> 2. Ziehe die {n}-te Wurzel</span>, isCorrect: true }, { id: '2', label: <span>1. Teile durch <VarW0/> <br/> 2. Teile durch {n}</span>, isCorrect: false }, { id: '3', label: <span>1. Teile durch {n} <br/> 2. Ziehe die Wurzel</span>, isCorrect: false }]; break;
            case 'n': opts = [{ id: '1', label: <span>1. Teile durch <VarW0/> <br/> 2. Wende den Logarithmus an</span>, isCorrect: true }, { id: '2', label: <span>1. Teile durch <VarQ/> <br/> 2. Wende den Logarithmus an</span>, isCorrect: false }, { id: '3', label: <span>1. Teile durch <VarW0/> <br/> 2. Ziehe die {n}-te Wurzel</span>, isCorrect: false }]; break;
        }
        setOptions(opts.sort(() => Math.random() - 0.5)); setLoading(false);
    };

    useEffect(() => { generateProblem(); }, [difficulty]);

    const handleDifficultyChange = (newDiff) => { if (difficulty === newDiff) generateProblem(); else setDifficulty(newDiff); };

    const handleIdentify = (selected) => {
        if (step > 1 || !problem) return;
        setSelectedIdentification(selected);
        if (selected === problem.type) { setTimeout(() => advance(2), 600); } else { triggerError(); }
    };

    const checkFormulaInputs = () => {
        if (!problem) return;
        let allCorrect = true, feedback = {};
        const checkVal = (input, target) => { const val = parseFloat(input.replace(',', '.')); if (isNaN(val)) return false; return Math.abs(val - target) < (Math.max(target * 0.01, 0.005)); };
        if (problem.type !== 'Wn' && !checkVal(inputs.wn, problem.wn)) { feedback.wn = 'incorrect'; allCorrect = false; } else feedback.wn = 'correct';
        if (problem.type !== 'W0' && !checkVal(inputs.w0, problem.w0)) { feedback.w0 = 'incorrect'; allCorrect = false; } else feedback.w0 = 'correct';
        if (problem.type !== 'rate' && !checkVal(inputs.q, problem.q)) { feedback.q = 'incorrect'; allCorrect = false; } else feedback.q = 'correct';
        if (problem.type !== 'n' && !checkVal(inputs.n, problem.n)) { feedback.n = 'incorrect'; allCorrect = false; } else feedback.n = 'correct';
        setInputFeedback(feedback);
        if (allCorrect) advance(3); else triggerError();
    };

    const handleOptionSelect = (opt) => {
        if (step > 3) return;
        setSelectedOptionId(opt.id);
        if (opt.isCorrect) { setTimeout(() => advance(4), 600); } else { triggerError(); }
    };

    const checkFinalResult = () => {
        if (!problem) return;
        const val = parseFloat(finalAnswer.replace(',', '.')); if (isNaN(val)) return;
        const tolerance = problem.type === 'n' ? 0.5 : (problem.solution * 0.01);
        if (Math.abs(val - problem.solution) <= tolerance || (problem.type === 'n' && Math.round(val) === problem.solution)) {
            setFinalFeedback('correct');
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > 0 && newStreak % 3 === 0) triggerCelebration(setShowAnim);
            setShowSolution(true); advance(5);
        } else { setFinalFeedback('incorrect'); triggerError(); }
    };

    return (
        <div className="page-transition max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {showAnim && <CelebrationOverlay />}
            <header className="bg-emerald-700 text-emerald-50 shadow-md p-6 rounded-xl mb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <TrendingUp size={32} />
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">Wachstum & Zerfall <span className="hidden sm:inline text-emerald-200 text-lg font-normal border-l-2 border-emerald-400 pl-2 ml-2">10. Klasse</span></h1>
                        </div>
                    </div>
                    <div className="bg-emerald-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-emerald-300" /> Streak: {streak}
                    </div>
                </div>
            </header>

            <DifficultyMenu theme="emerald" active={difficulty} onChange={handleDifficultyChange} options={[{id: 'normal', label: 'Normal'}, {id: 'schwer', label: 'Schwer'}]} />

            <main className="space-y-6 relative">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-200 flex justify-between items-center">
                        <h2 className="font-semibold text-emerald-900 flex items-center"><BookOpen size={18} className="mr-2"/> Sachaufgabe</h2>
                    </div>
                    <div className="p-6 bg-white min-h-[100px] flex items-center justify-center text-center">
                        {loading ? <RefreshCw className="w-8 h-8 animate-spin text-emerald-500"/> : <p className="text-xl font-medium leading-relaxed">{problem?.text}</p>}
                    </div>
                </div>

                <div className="space-y-4">
                    <StepCard title="1. Was ist gesucht?" stepNum={1} currentStep={step} theme="emerald">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[{ type: 'Wn', label: <VarWn/>, desc: "Endwert" }, { type: 'W0', label: <VarW0/>, desc: "Anfangswert" }, { type: 'rate', label: <VarQ/>, desc: "Faktor" }, { type: 'n', label: <VarN/>, desc: "Laufzeit" }].map((item) => (
                                <button key={item.type} onClick={() => handleIdentify(item.type)} disabled={step > 1} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${selectedIdentification === item.type ? (item.type === problem?.type ? 'border-green-500 bg-green-50 text-green-900 font-bold' : 'border-red-400 bg-red-50 text-red-900') : 'border-slate-200 hover:border-emerald-400 bg-white'}`}>
                                    <span className="text-xl font-serif font-bold">{item.label}</span><span className="text-[10px] sm:text-xs uppercase font-semibold text-slate-500">{item.desc}</span>
                                </button>
                            ))}
                        </div>
                        {step === 1 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} text="Lies genau: Frag nach dem Start (W0), dem Ende (Wn) oder der Dauer (n)?" />}
                        {step > 1 && <SuccessMark text="Richtig identifiziert!" />}
                    </StepCard>

                    {step >= 2 && (
                        <StepCard title="2. Werte in die Formel einsetzen" stepNum={2} currentStep={step} theme="emerald">
                            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 bg-slate-50 p-4 sm:p-6 rounded-xl border border-dashed border-slate-300">
                                <FormulaInput id="wn" label={<VarWn/>} value={inputs.wn} theme="emerald" isUnknown={problem.type === 'Wn'} status={inputFeedback.wn} disabled={step > 2 || inputFeedback.wn === 'correct'} onChange={handleInputChange} />
                                <span className="text-2xl text-slate-400 font-bold mt-6">=</span>
                                <FormulaInput id="w0" label={<VarW0/>} value={inputs.w0} theme="emerald" isUnknown={problem.type === 'W0'} status={inputFeedback.w0} disabled={step > 2 || inputFeedback.w0 === 'correct'} onChange={handleInputChange} />
                                <span className="text-2xl text-slate-400 font-bold mt-6">·</span>
                                <FormulaInput id="q" label={<VarQ/>} value={inputs.q} theme="emerald" isUnknown={problem.type === 'rate'} status={inputFeedback.q} disabled={step > 2 || inputFeedback.q === 'correct'} onChange={handleInputChange} />
                                <div className="relative -top-6"><FormulaInput id="n" label={<span className="text-sm"><VarN/></span>} value={inputs.n} theme="emerald" isUnknown={problem.type === 'n'} status={inputFeedback.n} disabled={step > 2 || inputFeedback.n === 'correct'} onChange={handleInputChange} /></div>
                            </div>
                            {step === 2 && <div className="mt-4 flex justify-between items-center"><TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} text={difficulty==='schwer'?"n ist die Differenz der Jahre. Bei Abnahme ist q < 1 (z.B. 1 - 0.05).":"q ist (1 + p/100) bei Zunahme und (1 - p/100) bei Abnahme."} /><SubmitBtn onClick={checkFormulaInputs} theme="emerald" /></div>}
                            {step > 2 && <SuccessMark text="Alle Werte richtig eingesetzt!" />}
                        </StepCard>
                    )}

                    {step >= 3 && (
                        <StepCard title="3. Gleichung umformen" stepNum={3} currentStep={step} theme="emerald">
                            <div className="flex justify-center items-center gap-2 text-xl md:text-2xl font-mono bg-slate-100 py-4 px-2 rounded-lg mb-6 text-slate-700">
                                <span>{problem.type === 'Wn' ? <span className="text-emerald-700 font-bold">Wn</span> : formatNum(problem.wn)} = {problem.type === 'W0' ? <span className="text-emerald-700 font-bold">W0</span> : formatNum(problem.w0)} · {problem.type === 'rate' ? <span className="text-emerald-700 font-bold">q</span> : formatNum(problem.q)}<sup>{problem.type === 'n' ? <span className="text-emerald-700 font-bold">n</span> : problem.n}</sup></span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {options.map((opt) => (
                                    <button key={opt.id} onClick={() => handleOptionSelect(opt)} disabled={step > 3} className={`p-4 rounded-xl border-2 text-sm md:text-base font-medium flex flex-col items-center justify-center gap-2 ${selectedOptionId === opt.id ? (opt.isCorrect ? 'border-green-500 bg-green-50 text-green-900 font-bold' : 'border-red-400 bg-red-50 text-red-900') : 'border-slate-200 hover:border-emerald-400'}`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            {step === 3 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} text="Um W0 freizustellen: teile durch q^n. Für n: teile durch W0 und nutze den Logarithmus." />}
                            {step > 3 && <SuccessMark text="Richtig umgeformt!" />}
                        </StepCard>
                    )}

                    {step >= 4 && (
                        <StepCard title="4. Ergebnis berechnen" stepNum={4} currentStep={step} theme="emerald">
                            <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
                                <div className="relative flex-grow max-w-sm w-full">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif text-slate-400 italic">{problem.type === 'Wn' ? <VarWn/> : problem.type === 'W0' ? <VarW0/> : problem.type === 'rate' ? 'p' : <VarN/>} =</span>
                                    <input type="text" value={finalAnswer} onChange={(e) => setFinalAnswer(e.target.value.replace('.', ','))} disabled={step === 5} placeholder="Rechner nutzen..." className={`pl-16 pr-12 py-3 w-full rounded-lg border-2 text-lg outline-none transition-colors shadow-sm ${finalFeedback === 'correct' ? 'border-green-500 bg-green-50 text-green-900 font-bold' : finalFeedback === 'incorrect' ? 'border-red-400 bg-red-50' : 'border-slate-300 focus:border-emerald-500'}`} />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">{problem.type === 'rate' ? '%' : problem.unit}</span>
                                </div>
                                {step === 4 && <SubmitBtn onClick={checkFinalResult} theme="emerald" />}
                            </div>
                            {step === 4 && <div className="mt-3"><CalcButton theme="emerald" /></div>}
                            {step === 4 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} text="Achte beim Taschenrechner auf Kommas und Klammern (z.B. log(Endwert/Startwert))." />}
                            {step > 4 && <SuccessMark text="Perfekt gerechnet!" />}
                        </StepCard>
                    )}

                    {step === 5 && (
                        <SuccessBox showSolutionBtn={true} showSolution={showSolution} onToggleSolution={() => setShowSolution(!showSolution)} onNext={generateProblem} solutionText={problem.explanation} theme="emerald" />
                    )}
                </div>
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(<WachstumsTrainer />);
