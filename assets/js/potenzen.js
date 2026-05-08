// ==========================================
// potenzen.js — PotenzenTrainer
// (Wird inline mit shared.js zusammen pro App-Seite kompiliert.)
// ==========================================

// Verhindert das Ändern von Zahlenwerten durch Pfeiltasten in Number-Inputs.
const preventArrows = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
};

// ==========================================
// GENERATORS
// ==========================================
const generatePotenzenProblem = (diff) => {
    let problem = {};

    if (diff === 'leicht') {
        const c1 = getRandomInt(2, 5);
        const c2 = getRandomInt(2, 5);
        const c3 = getRandomInt(2, 4);
        const finalNumCoef = (c1 * c2) % c3 === 0 ? (c1 * c2) / c3 : c1 * c2;
        const adjC3 = (c1 * c2) % c3 === 0 ? c3 : 1;

        const e1 = getRandomInt(2, 5);
        const e2 = getRandomInt(2, 5);
        const e3 = getRandomInt(1, e1 + e2 - 1);

        problem = {
            diff, vars: ['x'],
            raw: {
                num: <span>{c1}<span className="font-math-italic">x</span><sup>{e1}</sup> · {c2}<span className="font-math-italic">x</span><sup>{e2}</sup></span>,
                denom: <span>{adjC3 > 1 ? adjC3 : ''}<span className="font-math-italic">x</span><sup>{e3}</sup></span>
            },
            s1: { num: c1 * c2, den: adjC3 },
            s2: { numExp: { x: e1 + e2 }, denExp: { x: e3 } },
            s3: { coefNum: finalNumCoef, coefDen: 1, exp: { x: (e1 + e2) - e3 } }
        };
    }
    else if (diff === 'mittel') {
        const c1 = getRandomInt(3, 6);
        const c2 = getRandomInt(2, 5);
        const adjC3 = (c1 * c2) % getRandomInt(2, 6) === 0 ? getRandomInt(2, 6) : 2;

        const e1x = getRandomInt(-3, 5); const e1y = getRandomInt(1, 4);
        const e2x = getRandomInt(1, 5);  const e2y = getRandomInt(-2, 3);
        const e3x = getRandomInt(-2, 3); const e3y = getRandomInt(-2, 3);

        problem = {
            diff, vars: ['x', 'y'],
            raw: {
                num: <span>{c1}<span className="font-math-italic">x</span><sup>{e1x}</sup><span className="font-math-italic">y</span><sup>{e1y}</sup> · {c2}<span className="font-math-italic">x</span><sup>{e2x}</sup><span className="font-math-italic">y</span><sup>{e2y}</sup></span>,
                denom: <span>{adjC3}<span className="font-math-italic">x</span><sup>{e3x}</sup><span className="font-math-italic">y</span><sup>{e3y}</sup></span>
            },
            s1: { num: c1 * c2, den: adjC3 },
            s2: { numExp: { x: e1x + e2x, y: e1y + e2y }, denExp: { x: e3x, y: e3y } },
            s3: { coefNum: (c1 * c2) / adjC3, coefDen: 1, exp: { x: (e1x + e2x) - e3x, y: (e1y + e2y) - e3y } }
        };
    }
    else if (diff === 'schwer') {
        const c1 = getRandomInt(4, 8); const c2 = getRandomInt(3, 7);
        const c3 = getRandomInt(2, 4); const c4 = getRandomInt(2, 5);
        const numTotal = c1 * c2; const denTotal = c3 * c4;

        const e1x = getRandomInt(-4, 4); const e1y = getRandomInt(-3, 3); const e1z = getRandomInt(1, 4);
        const e2x = getRandomInt(1, 5);  const e2y = getRandomInt(-2, 4); const e2z = getRandomInt(-3, 2);
        const e3x = getRandomInt(-2, 3); const e3y = getRandomInt(-4, 2); const e3z = getRandomInt(0, 3);
        const e4x = getRandomInt(1, 3);  const e4y = getRandomInt(1, 3);  const e4z = getRandomInt(-2, 1);

        problem = {
            diff, vars: ['x', 'y', 'z'],
            raw: {
                num: <span>{c1}<span className="font-math-italic">x</span><sup>{e1x}</sup><span className="font-math-italic">y</span><sup>{e1y}</sup><span className="font-math-italic">z</span><sup>{e1z}</sup> · {c2}<span className="font-math-italic">x</span><sup>{e2x}</sup><span className="font-math-italic">y</span><sup>{e2y}</sup><span className="font-math-italic">z</span><sup>{e2z}</sup></span>,
                denom: <span>{c3}<span className="font-math-italic">x</span><sup>{e3x}</sup><span className="font-math-italic">y</span><sup>{e3y}</sup><span className="font-math-italic">z</span><sup>{e3z}</sup> · {c4}<span className="font-math-italic">x</span><sup>{e4x}</sup><span className="font-math-italic">y</span><sup>{e4y}</sup><span className="font-math-italic">z</span><sup>{e4z}</sup></span>
            },
            s1: { num: numTotal, den: denTotal },
            s2: {
                numExp: { x: e1x + e2x, y: e1y + e2y, z: e1z + e2z },
                denExp: { x: e3x + e4x, y: e3y + e4y, z: e3z + e4z }
            },
            s3: { coefNum: numTotal, coefDen: denTotal, exp: { x: (e1x + e2x) - (e3x + e4x), y: (e1y + e2y) - (e3y + e4y), z: (e1z + e2z) - (e3z + e4z) } }
        };
    }
    else {
        // Prüfungsaufgaben (MSA Bayern)
        const prf = [
            {   // MSA 2025 I/6
                vars: ['x', 'y', 'z'],
                raw: {
                    num: <span>18<span className="font-math-italic">x</span><sup>6</sup><span className="font-math-italic">z</span><sup>2</sup> · 24<span className="font-math-italic">y</span><sup>3</sup> · 10<span className="font-math-italic">x</span><sup>3</sup> · <span className="font-math-italic">z</span></span>,
                    denom: <span>12<span className="font-math-italic">x</span><sup>4</sup> · 6<span className="font-math-italic">y</span><sup>3</sup><span className="font-math-italic">z</span> · 12<span className="font-math-italic">x</span></span>
                },
                s1: { num: 4320, den: 864 },
                s2: { numExp: { x: 9, y: 3, z: 3 }, denExp: { x: 5, y: 3, z: 1 } },
                s3: { coefNum: 5, coefDen: 1, exp: { x: 4, y: 0, z: 2 } }
            },
            {   // MSA 2024 I/3
                vars: ['x', 'y', 'z'],
                raw: {
                    num: <span>9<span className="font-math-italic">x</span><sup>-2</sup><span className="font-math-italic">y</span> · 4<span className="font-math-italic">y</span><sup>2</sup><span className="font-math-italic">z</span><sup>-3</sup> · 5<span className="font-math-italic">x</span><sup>7</sup></span>,
                    denom: <span><span className="font-math-italic">y</span><sup>-1</sup><span className="font-math-italic">z</span><sup>2</sup> · 3<span className="font-math-italic">x</span><sup>-2</sup><span className="font-math-italic">y</span><sup>-1</sup> · 2<span className="font-math-italic">x</span><sup>1</sup><span className="font-math-italic">z</span><sup>-2</sup></span>
                },
                s1: { num: 180, den: 6 },
                s2: { numExp: { x: 5, y: 3, z: -3 }, denExp: { x: -1, y: -2, z: 0 } },
                s3: { coefNum: 30, coefDen: 1, exp: { x: 6, y: 5, z: -3 } }
            },
            {   // MSA 2019 II/7a
                vars: ['a', 'b'],
                raw: {
                    num: <span>3<span className="font-math-italic">a</span><sup>3</sup> · 4<span className="font-math-italic">b</span><sup>-7</sup> · 3<span className="font-math-italic">a</span><sup>-1</sup> · 3<span className="font-math-italic">b</span><sup>8</sup></span>,
                    denom: <span>9<span className="font-math-italic">a</span><sup>-2</sup> · 15<span className="font-math-italic">b</span></span>
                },
                s1: { num: 108, den: 135 },
                s2: { numExp: { a: 2, b: 1 }, denExp: { a: -2, b: 1 } },
                s3: { coefNum: 4, coefDen: 5, exp: { a: 4, b: 0 } }
            }
        ];
        problem = prf[Math.floor(Math.random() * prf.length)];
        problem.diff = 'pruefung';
    }

    return problem;
};

// Mathematischer Parser: prüft, ob die User-Eingabe term-äquivalent zur erwarteten
// Lösung ist. Wir setzen zwei verschiedene Zahlenpaare ein und vergleichen die Werte.
const testEquivalence = (userStr, prob) => {
    if (!userStr || userStr.trim() === '') return false;
    try {
        let s = userStr.toLowerCase().replace(/\s+/g, '').replace(/,/g, '.').replace(/·/g, '*').replace(/:/g, '/');
        // Hochgestellte Unicode-Zahlen → ^N
        s = s.replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4').replace(/⁵/g, '^5').replace(/⁶/g, '^6');
        // "x2" oder "x-3" → "x^2" / "x^-3"
        s = s.replace(/([a-z])(-?\d+)/gi, '$1^$2');
        // Implizite Multiplikation: "2x" → "2*x", "(2)(3)" → "(2)*(3)" usw.
        s = s.replace(/(\d)([a-z\(])/gi, '$1*$2');
        s = s.replace(/([a-z\)])([a-z\(])/gi, '$1*$2');
        s = s.replace(/(\))(\d)/gi, '$1*$2');
        s = s.replace(/\^/g, '**');

        const testVals1 = { a: 2.5, b: 3.1, c: 1.8, x: 2.5, y: 3.1, z: 5.2 };
        const testVals2 = { a: 1.7, b: 4.2, c: 2.9, x: 1.7, y: 4.2, z: 0.8 };

        let expected1 = prob.s3.coefNum / prob.s3.coefDen;
        let expected2 = prob.s3.coefNum / prob.s3.coefDen;

        prob.vars.forEach(v => {
            expected1 *= Math.pow(testVals1[v], prob.s3.exp[v]);
            expected2 *= Math.pow(testVals2[v], prob.s3.exp[v]);
        });

        const argNames = Object.keys(testVals1);
        const fn = new Function(...argNames, `return ${s};`);
        const userVal1 = fn(...Object.values(testVals1));
        const userVal2 = fn(...Object.values(testVals2));
        if (isNaN(userVal1) || isNaN(userVal2)) return false;
        return Math.abs(expected1 - userVal1) < 0.001 && Math.abs(expected2 - userVal2) < 0.001;
    } catch (e) {
        return false;
    }
};

// ==========================================
// TRAINER
// ==========================================
const PotenzenTrainer = () => {
    const [difficulty, setDifficulty] = useState('mittel');
    const [problem, setProblem] = useState(null);
    const [step, setStep] = useState(1);

    const [inputs, setInputs] = useState({});
    const [feedback, setFeedback] = useState({});
    const [streak, setStreak] = useState(() => getStorage('smarth_streak_potenzen', 0));
    const [loading, setLoading] = useState(true);

    const [errors, setErrors] = useState(0);
    const [tipRevealed, setTipRevealed] = useState(false);
    const [step4HintMsg, setStep4HintMsg] = useState(null);
    const [showAnim, setShowAnim] = useState(false);

    const isHard = difficulty === 'schwer' || difficulty === 'pruefung';

    useEffect(() => { setStorage('smarth_streak_potenzen', streak); }, [streak]);

    const advance = (nextStep) => {
        setStep(nextStep);
        setErrors(0); setTipRevealed(false);
        setStep4HintMsg(null);
        setFeedback({});
    };
    const triggerError = (fBack) => { setErrors(e => e + 1); setStreak(0); setFeedback(fBack); };

    const handleInp = (key, val) => {
        setInputs(prev => ({ ...prev, [key]: val }));
        setFeedback(prev => ({ ...prev, [key]: null }));
    };

    const generateProblem = () => {
        setLoading(true); setStep(1);
        setInputs({}); setFeedback({});
        setErrors(0); setTipRevealed(false);
        setStep4HintMsg(null);
        const newProb = generatePotenzenProblem(difficulty);
        setProblem(newProb);
        setLoading(false);
    };

    useEffect(() => { generateProblem(); }, [difficulty]);

    // Liefert den Lösungstext für den aktuellen Schritt — TipBox blendet ihn nach
    // 3 Fehleingaben + Klick auf "Lösung anzeigen" als Text ein. Kein Autofill.
    const getSolutionText = () => {
        if (!problem) return null;
        if (step === 1) {
            return `Zähler-Produkt = ${problem.s1.num},   Nenner-Produkt = ${problem.s1.den}`;
        }
        if (step === 2) {
            const top = problem.vars.map(v => `${v}^${problem.s2.numExp[v]}`).join(' · ');
            const bot = problem.vars.map(v => `${v}^${problem.s2.denExp[v]}`).join(' · ');
            return `Zähler: ${top}     |     Nenner: ${bot}`;
        }
        if (step === 3) {
            const bruch = problem.s3.coefDen === 1
                ? `${problem.s3.coefNum} (Nenner = 1, Feld leer lassen)`
                : `${problem.s3.coefNum} / ${problem.s3.coefDen}`;
            const exps = problem.vars.map(v => `${v}^${problem.s3.exp[v]}`).join(' · ');
            return `Bruch: ${bruch};   Exponenten: ${exps}`;
        }
        if (step === 4) {
            // Endergebnis sauber zusammensetzen — ohne ^0 und ^1.
            const cn = problem.s3.coefNum, cd = problem.s3.coefDen;
            let coefStr = '';
            if (cd === 1) {
                if (cn === 1) coefStr = '';
                else if (cn === -1) coefStr = '-';
                else coefStr = String(cn);
            } else {
                coefStr = `${cn}/${cd} · `;
            }
            const varStr = problem.vars
                .filter(v => problem.s3.exp[v] !== 0)
                .map(v => problem.s3.exp[v] === 1 ? v : `${v}^${problem.s3.exp[v]}`)
                .join(' · ');
            const result = (coefStr + (coefStr && varStr && !coefStr.endsWith('· ') ? '' : '') + varStr).trim() || '1';
            return `Endergebnis: ${result}`;
        }
        return null;
    };
    const onSolutionShown = () => setStreak(0);

    const checkStep1 = () => {
        let f = {}; let allOk = true;
        if (parseInt(inputs.s1n) === problem.s1.num) f.s1n = 'correct'; else { f.s1n = 'incorrect'; allOk = false; }
        if (parseInt(inputs.s1d) === problem.s1.den) f.s1d = 'correct'; else { f.s1d = 'incorrect'; allOk = false; }
        if (allOk) { setFeedback(f); setTimeout(() => advance(2), 500); }
        else triggerError(f);
    };

    const checkStep2 = () => {
        let f = {}; let allOk = true;
        problem.vars.forEach(v => {
            const inpN = parseInt(inputs['s2n'+v] || 0);
            const inpD = parseInt(inputs['s2d'+v] || 0);
            if (inpN === problem.s2.numExp[v]) f['s2n'+v] = 'correct'; else { f['s2n'+v] = 'incorrect'; allOk = false; }
            if (inpD === problem.s2.denExp[v]) f['s2d'+v] = 'correct'; else { f['s2d'+v] = 'incorrect'; allOk = false; }
        });
        if (allOk) { setFeedback(f); setTimeout(() => advance(3), 500); }
        else triggerError(f);
    };

    const checkStep3 = () => {
        let f = {}; let allOk = true;
        const inpCn = parseInt(inputs.s3cn);
        const inpCd = inputs.s3cd ? parseInt(inputs.s3cd) : 1;
        const userVal = inpCn / inpCd;
        const expectedVal = problem.s3.coefNum / problem.s3.coefDen;
        // Toleranz für Brucheingabe (akzeptiert gekürzte und ungekürzte Brüche)
        if (!isNaN(userVal) && Math.abs(userVal - expectedVal) < 0.0001) {
            f.s3cn = 'correct';
            if (inputs.s3cd) f.s3cd = 'correct';
        } else {
            f.s3cn = 'incorrect';
            if (inputs.s3cd) f.s3cd = 'incorrect';
            allOk = false;
        }
        problem.vars.forEach(v => {
            const inpE = parseInt(inputs['s3e'+v] || 0);
            if (inpE === problem.s3.exp[v]) f['s3e'+v] = 'correct'; else { f['s3e'+v] = 'incorrect'; allOk = false; }
        });
        if (allOk) { setFeedback(f); setTimeout(() => advance(4), 500); }
        else triggerError(f);
    };

    const checkStep4 = () => {
        const val = inputs.s4 || '';
        const isCorrect = testEquivalence(val, problem);
        if (isCorrect) {
            // Check auf Form: ^0 oder ^1 sollten weggekürzt werden.
            if (val.includes('^0') || val.match(/\^1(?!\d)/)) {
                setStep4HintMsg("Mathematisch korrekt — aber noch nicht maximal vereinfacht! 'hoch 0' ist immer 1 und kann weggelassen werden. Ein 'hoch 1' schreibt man normalerweise gar nicht (z.B. nur x statt x^1).");
                triggerError({ s4: 'incorrect' });
                return;
            }
            setStep4HintMsg(null);
            setFeedback({ s4: 'correct' });
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > 0 && newStreak % 3 === 0) triggerCelebration(setShowAnim);
            setTimeout(() => advance(5), 500);
        } else {
            setStep4HintMsg(null);
            triggerError({ s4: 'incorrect' });
        }
    };

    const getInputClass = (status) => {
        if (status === 'correct') return 'border-green-500 bg-green-50 text-green-900 font-bold';
        if (status === 'incorrect') return 'border-red-400 bg-red-50 text-red-900';
        return 'border-slate-300 focus:border-cyan-500';
    };

    const renderVarInput = (v, isNum, stepId) => {
        const key = `${stepId}${isNum ? 'n' : 'd'}${v}`;
        const val = inputs[key] !== undefined ? inputs[key] : '';
        return (
            <span key={key} className="inline-flex items-center font-math-italic mx-1">
                {v}<sup><input type="text" value={val} onChange={e => handleInp(key, e.target.value)} disabled={step > parseInt(stepId.charAt(1))} className={`w-8 h-6 text-center text-sm border-2 rounded outline-none ml-0.5 bg-white transition-colors ${getInputClass(feedback[key])}`} /></sup>
            </span>
        );
    };

    const renderFinalVarInput = (v) => {
        const key = `s3e${v}`;
        const val = inputs[key] !== undefined ? inputs[key] : '';
        return (
            <span key={key} className="inline-flex items-center font-math-italic mx-1">
                {v}<sup><input type="text" value={val} onChange={e => handleInp(key, e.target.value)} disabled={step > 3} className={`w-8 h-6 text-center text-sm border-2 rounded outline-none ml-0.5 bg-white transition-colors ${getInputClass(feedback[key])}`} /></sup>
            </span>
        );
    };

    return (
        <div className="page-transition max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {showAnim && <CelebrationOverlay />}
            <header className="bg-cyan-600 text-cyan-50 shadow-md p-6 rounded-xl mb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <SuperscriptIcon className="w-8 h-8" />
                        <div><h1 className="text-2xl font-bold tracking-tight text-white flex items-center">Potenzen <span className="hidden sm:inline text-cyan-200 text-lg font-normal border-l-2 border-cyan-400 pl-2 ml-2">10. Klasse</span></h1></div>
                    </div>
                    <div className="bg-cyan-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm flex items-center">
                        <Target className="w-4 h-4 mr-2 text-cyan-300" /> Streak: {streak}
                    </div>
                </div>
            </header>

            <DifficultyMenu theme="cyan" active={difficulty} onChange={setDifficulty}
                options={[
                    {id: 'leicht', label: 'Leicht'},
                    {id: 'mittel', label: 'Mittel'},
                    {id: 'schwer', label: 'Schwer'},
                    {id: 'pruefung', label: 'Prüfungsaufgaben'}
                ]} />

            <main className="space-y-6 relative">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-cyan-50 px-6 py-3 border-b border-cyan-200 flex justify-between items-center">
                        <h2 className="font-semibold text-cyan-900 flex items-center"><Hash className="mr-2 w-5 h-5"/> Ausgangsterm</h2>
                        {difficulty === 'pruefung' && <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-amber-200 text-amber-800">MSA Niveau</span>}
                    </div>
                    <div className="p-8 bg-white flex flex-col items-center justify-center text-center overflow-x-auto">
                        {loading || !problem ? <RefreshCw className="w-8 h-8 animate-spin text-cyan-400"/> :
                            <div className="text-2xl md:text-3xl tracking-wider text-slate-800 flex items-center">
                                <Frac top={problem.raw.num} bot={problem.raw.denom} />
                            </div>
                        }
                    </div>
                </div>

                <div className="space-y-4">
                    <StepCard title="Schritt 1: Zahlen verrechnen" stepNum={1} currentStep={step} theme="cyan">
                        <div className="flex flex-col items-center">
                            <p className="text-slate-600 mb-6 text-center max-w-lg">Multipliziere zuerst alle „normalen" Zahlen (Koeffizienten){!isHard && " im Zähler (oben) und im Nenner (unten) miteinander"}.</p>

                            <div className="flex items-center gap-6 flex-wrap justify-center">
                                <div className="text-2xl font-math text-slate-400">=</div>
                                <div className="flex flex-col items-center gap-2">
                                    <input type="number" onKeyDown={preventArrows} placeholder="Produkt Zähler" value={inputs.s1n || ''} onChange={e => handleInp('s1n', e.target.value)} disabled={step > 1} className={`w-36 text-center py-2 border-2 rounded-lg text-lg outline-none transition-colors ${getInputClass(feedback.s1n)}`} />
                                    <div className="w-full h-[2px] bg-slate-800"></div>
                                    <input type="number" onKeyDown={preventArrows} placeholder="Produkt Nenner" value={inputs.s1d || ''} onChange={e => handleInp('s1d', e.target.value)} disabled={step > 1} className={`w-36 text-center py-2 border-2 rounded-lg text-lg outline-none transition-colors ${getInputClass(feedback.s1d)}`} />
                                </div>
                                {step === 1 && <SubmitBtn onClick={checkStep1} theme="cyan" disabled={!inputs.s1n || !inputs.s1d} />}
                            </div>

                            {/* Taschenrechner direkt im ersten Schritt anbieten */}
                            {step === 1 && <div className="mt-4"><CalcButton theme="cyan" /></div>}
                        </div>
                        {step === 1 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} text="Schnapp dir den Rechner! Tippe alle Vorzahlen aus dem Zähler ein und multipliziere sie. Dasselbe machst du für den Nenner." solutionText={getSolutionText()} onSolutionShown={onSolutionShown} />}
                        {step > 1 && <SuccessMark text="Korrekt! Zahlen sind vereinfacht." />}
                    </StepCard>

                    {step >= 2 && (
                        <StepCard title="Schritt 2: Potenzen mit gleicher Basis zusammenfassen" stepNum={2} currentStep={step} theme="cyan">
                            {step === 2 && (
                                <div className="mb-6 bg-slate-50 p-3 rounded-lg flex flex-col items-center justify-center border border-slate-200 mx-auto max-w-sm">
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Merkhilfe: Ausgangsterm</span>
                                    <div className="text-lg text-slate-700">
                                        <Frac top={problem.raw.num} bot={problem.raw.denom} />
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col items-center">
                                <p className="text-slate-600 mb-6 text-center max-w-lg">Fasse die Potenzen mit <strong>gleicher Basis</strong> oben und unten zusammen{!isHard && " (Exponenten addieren!)"}.{!isHard && <><br/><span className="text-sm font-semibold text-cyan-700 mt-1 inline-block">Wichtig: Wenn eine Variable keinen Exponenten hat, ist dieser eine unsichtbare 1!</span></>}</p>

                                <div className="flex items-center gap-4 overflow-x-auto py-2 px-4 w-full justify-center">
                                    <div className="text-2xl font-math text-slate-400">=</div>
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="flex items-center text-xl">
                                            <span className="font-bold text-slate-700 mr-2">{problem.s1.num} ·</span>
                                            {problem.vars.map(v => renderVarInput(v, true, 's2'))}
                                        </div>
                                        <div className="w-full h-[2px] bg-slate-800"></div>
                                        <div className="flex items-center text-xl">
                                            <span className="font-bold text-slate-700 mr-2">{problem.s1.den} ·</span>
                                            {problem.vars.map(v => renderVarInput(v, false, 's2'))}
                                        </div>
                                    </div>
                                    {step === 2 && <SubmitBtn onClick={checkStep2} theme="cyan" />}
                                </div>
                            </div>
                            {step === 2 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} text="Sammle alle x: bei x² · x³ rechnest du 2+3 = 5. Trage also bei x oben die 5 ein. Dasselbe für jede Variable, oben und unten." solutionText={getSolutionText()} onSolutionShown={onSolutionShown} />}
                            {step > 2 && <SuccessMark text="Super! Der Term ist vorbereitet zum Kürzen." />}
                        </StepCard>
                    )}

                    {step >= 3 && (
                        <StepCard title="Schritt 3: Brüche kürzen" stepNum={3} currentStep={step} theme="cyan">
                            {step === 3 && (
                                <div className="mb-6 bg-slate-50 p-4 rounded-lg flex flex-col items-center justify-center border border-slate-200 mx-auto max-w-md">
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Merkhilfe: Schritt 2</span>
                                    <div className="text-xl text-slate-700 flex items-center">
                                        <Frac
                                            top={<span className="flex items-center">{problem.s1.num} · {problem.vars.map(v => <span key={'ref1'+v} className="font-math-italic mx-1">{v}<sup>{problem.s2.numExp[v]}</sup></span>)}</span>}
                                            bot={<span className="flex items-center">{problem.s1.den} · {problem.vars.map(v => <span key={'ref2'+v} className="font-math-italic mx-1">{v}<sup>{problem.s2.denExp[v]}</sup></span>)}</span>}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col items-center">
                                <p className="text-slate-600 mb-6 text-center max-w-lg">{!isHard ? "Kürze die Vorzahlen und bringe" : "Bringe"} alle Potenzen in den Zähler (Exponenten subtrahieren: oben − unten).</p>

                                <div className="flex items-center gap-4 w-full justify-center flex-wrap">
                                    <div className="text-2xl font-math text-slate-400">=</div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col items-center gap-1">
                                            <input type="number" onKeyDown={preventArrows} placeholder="Zähler" value={inputs.s3cn || ''} onChange={e => handleInp('s3cn', e.target.value)} disabled={step > 3} className={`w-20 text-center py-1 border-2 rounded text-lg outline-none transition-colors ${getInputClass(feedback.s3cn)}`} />
                                            <div className="w-full h-[2px] bg-slate-800"></div>
                                            <input type="number" onKeyDown={preventArrows} placeholder="Nenner" value={inputs.s3cd || ''} onChange={e => handleInp('s3cd', e.target.value)} disabled={step > 3} className={`w-20 text-center py-1 border-2 rounded text-lg outline-none transition-colors ${getInputClass(feedback.s3cd)}`} />
                                        </div>
                                        <div className="text-xl font-bold text-slate-700">·</div>
                                        <div className="flex items-center text-xl bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-inner">
                                            {problem.vars.map(v => renderFinalVarInput(v))}
                                        </div>
                                    </div>

                                    {step === 3 && <SubmitBtn onClick={checkStep3} theme="cyan" disabled={!inputs.s3cn} />}
                                </div>
                            </div>
                            {step === 3 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} text="1. Zahlen: Teile die obere durch die untere. Wenn's keine ganze Zahl wird, gib den gekürzten Bruch ein. 2. Variablen: Rechne 'Exponent oben − Exponent unten'. Negative Ergebnisse sind hier ganz normal!" solutionText={getSolutionText()} onSolutionShown={onSolutionShown} />}
                            {step > 3 && <SuccessMark text="Spitze! Du hast den Term berechnet." />}
                        </StepCard>
                    )}

                    {step >= 4 && (
                        <StepCard title="Schritt 4: Endergebnis" stepNum={4} currentStep={step} theme="cyan">
                            <div className="flex flex-col items-center">
                                <p className="text-slate-600 mb-6 text-center max-w-lg">Gib das Endergebnis so stark vereinfacht wie möglich an.{!isHard && <><br/><span className="text-sm font-semibold text-cyan-700 mt-1 inline-block">(Tipp: Nutze ^ für Exponenten und / für Brüche, z.B. 4/5x^3)</span></>}</p>
                                <div className="flex items-center gap-4 flex-wrap justify-center">
                                    <div className="text-2xl font-math text-slate-400">=</div>
                                    <input type="text" value={inputs.s4 || ''} onChange={e => handleInp('s4', e.target.value)} disabled={step > 4} className={`w-64 text-center py-3 border-2 rounded-lg text-xl outline-none transition-colors font-math shadow-sm ${getInputClass(feedback.s4)}`} placeholder="Endergebnis…" />
                                    {step === 4 && <SubmitBtn onClick={checkStep4} theme="cyan" disabled={!inputs.s4} />}
                                </div>
                            </div>
                            {/* Spezial-Hinweis "noch nicht maximal vereinfacht" */}
                            {step4HintMsg && step === 4 && (
                                <div className="mt-4 bg-amber-50 border-l-4 border-amber-500 p-4 rounded shadow-sm text-amber-900 text-sm animate-fade-in flex">
                                    <HelpCircle className="w-6 h-6 mr-3 shrink-0 text-amber-600" />
                                    <div><strong className="block mb-1 text-amber-800">Fast!</strong> {step4HintMsg}</div>
                                </div>
                            )}
                            {step === 4 && !step4HintMsg && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} text="Tippe deinen berechneten Term aus Schritt 3 sauber ab. Pass auf, dass keine 'hoch 0'- oder 'hoch 1'-Reste übrig bleiben." solutionText={getSolutionText()} onSolutionShown={onSolutionShown} />}
                        </StepCard>
                    )}

                    {step === 5 && (
                        <SuccessBox onNext={generateProblem} nextBtnText="Nächste Potenz-Aufgabe" theme="cyan" text={isHard ? "Prüfungsreif! 🚀" : "Stark! 🚀"} subtitle="Term erfolgreich vereinfacht." />
                    )}
                </div>
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(<PotenzenTrainer />);
