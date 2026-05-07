// ==========================================
// wahrscheinlichkeit.js — WahrscheinlichkeitsTrainer
// (Wird inline mit shared.js zusammen pro App-Seite kompiliert.)
// ==========================================

const colorMap = { 'rot': '#ef4444', 'blau': '#3b82f6', 'grün': '#10b981', 'gelb': '#eab308', 'Andere': '#94a3b8', 'Rest': '#94a3b8' };

// Allgemeine Funktion, um das Baumdiagramm für jedes Level zu bauen
const buildProbabilityTree = (colors, isOhne, targetPath, totalCount) => {
    return {
        label: 'Start',
        children: colors.map(c => {
            const isTarget1 = c.id === targetPath[0];
            return {
                label: c.id,
                hex: c.hex,
                probText: `${c.count}/${totalCount}`,
                inputLevel: isTarget1 ? 1 : null,
                children: colors.map(sc => {
                    let nextCount = sc.count;
                    if (isOhne && c.id === sc.id) nextCount--;
                    const isTarget2 = isTarget1 && sc.id === targetPath[1];
                    return {
                        label: sc.id,
                        hex: sc.hex,
                        probText: `${nextCount}/${totalCount - (isOhne ? 1 : 0)}`,
                        inputLevel: isTarget2 ? 2 : null
                    };
                })
            };
        })
    };
};

const genWahrscheinlichkeitProblem = (diff) => {
    if (diff === 'leicht') {
        const colors = ['rot', 'blau', 'grün', 'gelb'];
        const c1 = colors[Math.floor(Math.random() * colors.length)];
        let remaining = colors.filter(c => c !== c1);
        const c2 = remaining[Math.floor(Math.random() * remaining.length)];

        const total = Math.floor(Math.random() * 4) * 2 + 6; // 6, 8, 10, 12
        const count1 = Math.floor(Math.random() * 3) + 2;
        const count2 = Math.floor(Math.random() * 3) + 2;
        const rest = total - count1 - count2;

        const questionText = `Ein Glücksrad hat ${total} gleich große Felder. Davon sind ${count1} ${c1}, ${count2} ${c2} und der Rest hat andere Farben. Das Rad wird zweimal gedreht. Wie groß ist die Wahrscheinlichkeit, dass erst ${c1} und dann ${c2} gedreht wird?`;
        const expectedPerc = ((count1/total) * (count2/total)) * 100;

        const treeColors = [
            { id: c1, count: count1, hex: colorMap[c1] },
            { id: c2, count: count2, hex: colorMap[c2] },
            { id: 'Rest', count: rest, hex: colorMap['Rest'] }
        ];

        return {
            id: Math.random(), diff, text: questionText,
            type: 'mit', // Mit Zurücklegen
            draw1: { top: count1, bot: total },
            draw2: { top: count2, bot: total },
            resultPerc: Math.round(expectedPerc * 100) / 100,
            explanation: `Das Glücksrad "vergisst" den vorherigen Dreh (Ziehen mit Zurücklegen). \n1. Zug (${c1}): ${count1}/${total}\n2. Zug (${c2}): ${count2}/${total}\nPfadregel: ${count1}/${total} · ${count2}/${total} = ${count1 * count2}/${total * total} ≈ ${(Math.round(expectedPerc * 100) / 100).toString().replace('.',',')} %`,
            tree: buildProbabilityTree(treeColors, false, [c1, c2], total)
        };
    } else if (diff === 'mittel') {
        const c1 = "rote";
        const total = Math.floor(Math.random() * 5) + 6; // 6 bis 10
        const count1 = Math.floor(Math.random() * 2) + 3; // 3 bis 4

        const questionText = `In einer Tüte befinden sich ${count1} ${c1} und ${total - count1} andersfarbige Gummibärchen (insgesamt ${total}). Christiane nimmt ein Gummibärchen blind heraus und isst es auf. Anschließend nimmt sie noch ein zweites. Wie groß ist die Wahrscheinlichkeit, dass beide Gummibärchen ${c1} sind?`;
        const expectedPerc = ((count1/total) * ((count1-1)/(total-1))) * 100;

        const treeColors = [
            { id: 'rote', count: count1, hex: colorMap['rot'] },
            { id: 'Andere', count: total - count1, hex: colorMap['Andere'] }
        ];

        return {
            id: Math.random(), diff, text: questionText,
            type: 'ohne', // Ohne Zurücklegen
            draw1: { top: count1, bot: total },
            draw2: { top: count1 - 1, bot: total - 1 },
            resultPerc: Math.round(expectedPerc * 100) / 100,
            explanation: `Da Christiane das Gummibärchen isst, ist es ein Versuch "ohne Zurücklegen". \n1. Zug (${c1}): ${count1}/${total}\n2. Zug (${c1}): Es ist ein rotes und ein Bärchen insgesamt weniger! Also ${count1-1}/${total-1}\nPfadregel: ${count1}/${total} · ${count1-1}/${total-1} ≈ ${(Math.round(expectedPerc * 100) / 100).toString().replace('.',',')} %`,
            tree: buildProbabilityTree(treeColors, true, ['rote', 'rote'], total)
        };
    } else {
        const total = Math.floor(Math.random() * 6) + 12; // 12 bis 17
        const countR = Math.floor(Math.random() * 4) + 4; // 4 bis 7 (Rot)
        const countB = Math.floor(Math.random() * 3) + 3; // 3 bis 5 (Blau)
        const countG = total - countR - countB; // Rest (Grün)

        const questionText = `In einer Urne liegen ${total} Kugeln. Davon sind ${countR} rote, ${countB} blaue und ${countG} grüne Kugeln. Du ziehst zwei Kugeln nacheinander OHNE Zurücklegen. Wie groß ist die Wahrscheinlichkeit, dass du erst eine rote und dann eine blaue Kugel ziehst?`;

        const expectedPerc = ((countR/total) * (countB/(total-1))) * 100;

        const treeColors = [
            { id: 'Rot', count: countR, hex: colorMap['rot'] },
            { id: 'Blau', count: countB, hex: colorMap['blau'] },
            { id: 'Grün', count: countG, hex: colorMap['grün'] }
        ];

        return {
            id: Math.random(), diff, text: questionText,
            type: 'ohne', // Ohne Zurücklegen
            draw1: { top: countR, bot: total },
            draw2: { top: countB, bot: total - 1 },
            resultPerc: Math.round(expectedPerc * 100) / 100,
            explanation: `Ohne Zurücklegen.\n1. Zug (Rot): ${countR}/${total}\n2. Zug (Blau): ${countB}/${total-1}\nPfadregel: ${countR}/${total} · ${countB}/${total-1} ≈ ${(Math.round(expectedPerc * 100) / 100).toString().replace('.',',')} %`,
            tree: buildProbabilityTree(treeColors, true, ['Rot', 'Blau'], total)
        };
    }
};

// ==========================================
// TRAINER
// ==========================================
const WahrscheinlichkeitsTrainer = () => {
    const [difficulty, setDifficulty] = useState('mittel');
    const [problem, setProblem] = useState(null);
    const [step, setStep] = useState(1);
    const [selectedIdentification, setSelectedIdentification] = useState(null);

    const [inputs, setInputs] = useState({ t1: '', b1: '', t2: '', b2: '', perc: '' });
    const [inputFeedback, setInputFeedback] = useState({});
    const [finalFeedback, setFinalFeedback] = useState(null);
    const [showSolution, setShowSolution] = useState(false);
    const [streak, setStreak] = useState(() => getStorage('smarth_streak_wahrscheinlichkeit', 0));
    const [loading, setLoading] = useState(true);

    const [errors, setErrors] = useState(0);
    const [tipRevealed, setTipRevealed] = useState(false);
    const [showAnim, setShowAnim] = useState(false);

    useEffect(() => { setStorage('smarth_streak_wahrscheinlichkeit', streak); }, [streak]);
    const advance = (nextStep) => { setStep(nextStep); setErrors(0); setTipRevealed(false); };
    const triggerError = () => { setErrors(e => e + 1); setStreak(0); };
    const handleInputChange = (id, val) => { setInputs(prev => ({ ...prev, [id]: val.replace('.', ',') })); setInputFeedback(prev => ({ ...prev, [id]: null })); };

    const generateProblem = () => {
        setLoading(true); setStep(1); setSelectedIdentification(null);
        setInputs({ t1: '', b1: '', t2: '', b2: '', perc: '' }); setInputFeedback({});
        setFinalFeedback(null); setShowSolution(false); setErrors(0); setTipRevealed(false);

        const newProb = genWahrscheinlichkeitProblem(difficulty);
        setProblem(newProb);
        setLoading(false);
    };

    useEffect(() => { generateProblem(); }, [difficulty]);

    const handleDifficultyChange = (newDiff) => { if (difficulty === newDiff) generateProblem(); else setDifficulty(newDiff); };

    const handleIdentify = (selected) => {
        if (step > 1 || !problem) return;
        setSelectedIdentification(selected);
        if (selected === problem.type) { setTimeout(() => advance(2), 600); } else { triggerError(); }
    };

    const checkZug1 = () => {
        let allCorrect = true, feedback = { ...inputFeedback };
        if (parseInt(inputs.t1) === problem.draw1.top) feedback.t1 = 'correct'; else { feedback.t1 = 'incorrect'; allCorrect = false; }
        if (parseInt(inputs.b1) === problem.draw1.bot) feedback.b1 = 'correct'; else { feedback.b1 = 'incorrect'; allCorrect = false; }
        setInputFeedback(feedback);
        if (allCorrect) advance(3); else triggerError();
    };

    const checkZug2 = () => {
        let allCorrect = true, feedback = { ...inputFeedback };
        if (parseInt(inputs.t2) === problem.draw2.top) feedback.t2 = 'correct'; else { feedback.t2 = 'incorrect'; allCorrect = false; }
        if (parseInt(inputs.b2) === problem.draw2.bot) feedback.b2 = 'correct'; else { feedback.b2 = 'incorrect'; allCorrect = false; }
        setInputFeedback(feedback);
        if (allCorrect) advance(4); else triggerError();
    };

    const checkFinalResult = () => {
        if (!problem) return;
        const val = parseFloat(inputs.perc.replace(',', '.')); if (isNaN(val)) return;

        // Akzeptiert die exakte (auf 2 Nachkommastellen gerundete) Lösung ODER die auf ganze Prozent gerundete Lösung
        const isExactMatch = Math.abs(val - problem.resultPerc) <= 0.05;
        const isRoundedMatch = Math.abs(val - Math.round(problem.resultPerc)) <= 0.05;

        if (isExactMatch || isRoundedMatch) {
            setFinalFeedback('correct');
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > 0 && newStreak % 3 === 0) triggerCelebration(setShowAnim);
            setShowSolution(true); advance(5);
        } else { setFinalFeedback('incorrect'); triggerError(); }
    };

    // INTERAKTIVES SVG-BAUMDIAGRAMM MIT FOREIGN-OBJECT EINGABEN
    const renderTree = (node, x, y, width, level) => {
        if (!node) return null;
        const isLeaf = !node.children || node.children.length === 0;
        const nodeRadius = 16;
        const verticalSpacing = level === 0 ? 130 : 160;

        let elements = [];

        if (!isLeaf) {
            const childCount = node.children.length;
            const childWidth = width / childCount;
            const startX = x - width / 2 + childWidth / 2;

            node.children.forEach((child, index) => {
                const childX = startX + index * childWidth;
                const childY = y + verticalSpacing;

                elements.push(
                    <line key={`line-${level}-${index}-${x}`} x1={x} y1={y + nodeRadius} x2={childX} y2={childY - nodeRadius} stroke="#cbd5e1" strokeWidth="2" />
                );

                const midX = (x + childX) / 2;
                const midY = (y + nodeRadius + childY - nodeRadius) / 2;

                const isTarget1 = child.inputLevel === 1;
                const isTarget2 = child.inputLevel === 2;

                if (isTarget1 && step === 2) {
                    elements.push(
                        <foreignObject key={`fo-1-${index}`} x={midX - 30} y={midY - 40} width="65" height="80">
                            <div xmlns="http://www.w3.org/1999/xhtml" className="flex justify-center h-full items-center">
                                <MiniFractionInput idTop="t1" idBot="b1" valTop={inputs.t1} valBot={inputs.b1} onChange={handleInputChange} disabled={false} statusTop={inputFeedback.t1} statusBot={inputFeedback.b1} theme="violet" />
                            </div>
                        </foreignObject>
                    );
                } else if (isTarget1 && step > 2) {
                    elements.push(
                        <foreignObject key={`fo-1-${index}`} x={midX - 30} y={midY - 40} width="65" height="80">
                            <div xmlns="http://www.w3.org/1999/xhtml" className="flex justify-center h-full items-center">
                                <MiniFractionInput idTop="t1" idBot="b1" valTop={inputs.t1} valBot={inputs.b1} onChange={()=>{}} disabled={true} statusTop={'correct'} statusBot={'correct'} theme="violet" />
                            </div>
                        </foreignObject>
                    );
                } else if (isTarget2 && step === 3) {
                    elements.push(
                        <foreignObject key={`fo-2-${index}`} x={midX - 30} y={midY - 40} width="65" height="80">
                            <div xmlns="http://www.w3.org/1999/xhtml" className="flex justify-center h-full items-center">
                                <MiniFractionInput idTop="t2" idBot="b2" valTop={inputs.t2} valBot={inputs.b2} onChange={handleInputChange} disabled={false} statusTop={inputFeedback.t2} statusBot={inputFeedback.b2} theme="violet" />
                            </div>
                        </foreignObject>
                    );
                } else if (isTarget2 && step > 3) {
                    elements.push(
                        <foreignObject key={`fo-2-${index}`} x={midX - 30} y={midY - 40} width="65" height="80">
                            <div xmlns="http://www.w3.org/1999/xhtml" className="flex justify-center h-full items-center">
                                <MiniFractionInput idTop="t2" idBot="b2" valTop={inputs.t2} valBot={inputs.b2} onChange={()=>{}} disabled={true} statusTop={'correct'} statusBot={'correct'} theme="violet" />
                            </div>
                        </foreignObject>
                    );
                } else if (isTarget2 && step < 3) {
                    elements.push(
                        <rect key={`rect-q-${level}-${index}-${x}`} x={midX - 18} y={midY - 12} width="36" height="24" fill="white" rx="4" />
                    );
                    elements.push(
                        <text key={`prob-q-${level}-${index}-${x}`} x={midX} y={midY + 4} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#cbd5e1">?</text>
                    );
                } else if (problem?.diff === 'leicht') {
                    // Im "Leicht"-Modus zeigen wir die Brüche der nicht-abgefragten Pfade als Hilfestellung.
                    // In "Mittel" und "Schwer" bleiben sie leer, damit der Schüler den Bruch selbst erschließen muss.
                    elements.push(
                        <rect key={`rect-${level}-${index}-${x}`} x={midX - 20} y={midY - 12} width="40" height="24" fill="white" rx="4" />
                    );
                    elements.push(
                        <text key={`prob-${level}-${index}-${x}`} x={midX} y={midY + 4} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#64748b">
                            {child.probText}
                        </text>
                    );
                }

                elements.push(...renderTree(child, childX, childY, childWidth, level + 1));
            });
        }

        let fillColor = node.hex || '#e2e8f0';
        let textColor = node.hex ? 'white' : '#1e293b';

        elements.push(
            <circle key={`circle-${level}-${x}-${y}`} cx={x} cy={y} r={nodeRadius} fill={fillColor} stroke="#94a3b8" strokeWidth="2" />
        );
        elements.push(
            <text key={`text-${level}-${x}-${y}`} x={x} y={y + 5} textAnchor="middle" fontSize="12" fontWeight="bold" fill={textColor}>
                {node.label === 'Start' ? 'S' : node.label.charAt(0).toUpperCase()}
            </text>
        );

        return elements;
    };

    return (
        <div className="page-transition max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {showAnim && <CelebrationOverlay />}
            <header className="bg-violet-600 text-violet-50 shadow-md p-6 rounded-xl mb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <DicesIcon className="w-8 h-8" />
                        <div><h1 className="text-2xl font-bold tracking-tight text-white flex items-center">Wahrscheinlichkeit <span className="hidden sm:inline text-violet-200 text-lg font-normal border-l-2 border-violet-400 pl-2 ml-2">10. Klasse</span></h1></div>
                    </div>
                    <div className="bg-violet-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm flex items-center">
                        <Target className="w-4 h-4 mr-2 text-violet-300" /> Streak: {streak}
                    </div>
                </div>
            </header>

            <DifficultyMenu theme="violet" active={difficulty} onChange={handleDifficultyChange} options={[{id: 'leicht', label: 'Leicht'}, {id: 'mittel', label: 'Mittel'}, {id: 'schwer', label: 'Schwer'}]} />

            <main className="space-y-6 relative">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-violet-50 px-6 py-3 border-b border-violet-200 flex justify-between items-center">
                        <h2 className="font-semibold text-violet-900 flex items-center"><BookOpen size={18} className="mr-2"/> Sachaufgabe</h2>
                        <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-violet-200 text-violet-800">Baumdiagramm</span>
                    </div>

                    <div className="p-6 bg-white flex flex-col items-center justify-center text-center">
                        {loading ? <RefreshCw className="w-8 h-8 animate-spin text-violet-400"/> : <p className="text-xl font-medium leading-relaxed">{problem?.text}</p>}
                    </div>
                </div>

                <div className="space-y-4">
                    <StepCard title="1. Art des Experiments" stepNum={1} activeCondition={step === 1} pastCondition={step > 1} currentStep={step} theme="violet">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                            {[{ type: 'mit', label: "Mit Zurücklegen", desc: "(Nenner bleibt gleich, z.B. Glücksrad)" }, { type: 'ohne', label: "Ohne Zurücklegen", desc: "(Nenner wird kleiner, z.B. Essen)" }].map((item) => (
                                <button key={item.type} onClick={() => handleIdentify(item.type)} disabled={step > 1} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selectedIdentification === item.type ? (item.type === problem?.type ? 'border-green-500 bg-green-50 text-green-900 font-bold' : 'border-red-400 bg-red-50 text-red-900') : 'border-slate-200 hover:border-violet-400 bg-white'}`}>
                                    <span className="text-xl font-bold">{item.label}</span>
                                    <span className="text-xs font-semibold text-slate-500 text-center">{item.desc}</span>
                                </button>
                            ))}
                        </div>
                        {step === 1 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} text="Überlege: Verändert sich die Gesamtanzahl nach dem ersten Zug? Wenn jemand etwas aufisst oder 'nicht zurücklegt', ändert sich die Gesamtzahl." />}
                        {step > 1 && <SuccessMark text={`Richtig! Es ist ein Versuch ${problem?.type === 'mit' ? "mit" : "ohne"} Zurücklegen.`} />}
                    </StepCard>

                    {step >= 2 && (
                        <StepCard title="2. Wahrscheinlichkeiten im Baumdiagramm" stepNum={2} activeCondition={step === 2 || step === 3} pastCondition={step > 3} currentStep={step} theme="violet">
                            <div className="text-center text-slate-700 text-lg mb-4">
                                {step === 2 && <span>Trage den Bruch für den <strong>ersten Zug</strong> direkt im Baumdiagramm ein!</span>}
                                {step === 3 && <span>Klasse! Verfolge nun den gesuchten Pfad weiter und trage den Bruch für den <strong>zweiten Zug</strong> ein.</span>}
                                {step > 3 && <span>Das Baumdiagramm ist vollständig beschriftet!</span>}
                            </div>

                            {problem?.tree && !loading && (
                                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto p-4 shadow-inner animate-fade-in mb-6">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Interaktives Baumdiagramm</h3>
                                    <svg viewBox="0 0 1000 420" className="w-full h-auto min-w-[800px] max-w-4xl mx-auto block overflow-visible">
                                        {renderTree(problem.tree, 500, 20, 900, 0)}
                                    </svg>
                                </div>
                            )}

                            {step === 2 && <div className="mt-4 flex justify-between items-center"><TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} text="Zähler (oben): Wie viele passende Stücke gibt es? Nenner (unten): Wie viele Stücke sind es insgesamt am Anfang?" /><SubmitBtn onClick={checkZug1} theme="violet" disabled={!inputs.t1 || !inputs.b1} /></div>}

                            {step === 3 && <div className="mt-4 flex justify-between items-end"><TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} text={problem.type === 'ohne' ? "Achtung: Es ist EIN Teil insgesamt weniger im Nenner! Und ist im Zähler auch eins weniger oder war es eine andere Farbe?" : "Da es 'mit Zurücklegen' ist, bleibt der Nenner gleich wie beim 1. Zug."} /><SubmitBtn onClick={checkZug2} theme="violet" disabled={!inputs.t2 || !inputs.b2} /></div>}

                            {step > 3 && <SuccessMark text="Alle Brüche im Baumdiagramm sind korrekt eingetragen!" />}
                        </StepCard>
                    )}

                    {step >= 4 && (
                        <StepCard title="3. Pfadregel anwenden & Ergebnis" stepNum={3} activeCondition={step === 4} pastCondition={step > 4} currentStep={step} theme="violet">
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
                                <div className="flex items-center gap-4 bg-slate-100 p-4 rounded-lg font-bold text-slate-500 mb-4 sm:mb-0">
                                    <span>{inputs.t1} / {inputs.b1}</span>
                                    <span>·</span>
                                    <span>{inputs.t2} / {inputs.b2}</span>
                                    <span>=</span>
                                </div>
                                <div className="relative flex-grow max-w-xs w-full">
                                    <input type="text" value={inputs.perc} onChange={(e) => handleInputChange('perc', e.target.value)} disabled={step === 5} placeholder="Taschenrechner..." className={`pr-10 py-3 w-full text-center rounded-lg border-2 text-lg outline-none transition-colors shadow-sm ${finalFeedback === 'correct' ? 'border-green-500 bg-green-50 text-green-900 font-bold' : finalFeedback === 'incorrect' ? 'border-red-400 bg-red-50' : 'border-slate-300 focus:border-violet-500'}`} />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
                                </div>
                                {step === 4 && <SubmitBtn onClick={checkFinalResult} theme="violet" disabled={!inputs.perc} />}
                            </div>
                            {step === 4 && <div className="mt-3 flex justify-center"><CalcButton theme="violet" /></div>}
                            {step === 4 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} text="Zähler mal Zähler, Nenner mal Nenner. Teile dann das obere Ergebnis durch das untere Ergebnis und multipliziere mit 100 für die Prozentzahl (Runde auf 2 Nachkommastellen oder auf ganze Prozent)." />}
                            {step > 4 && <SuccessMark text="Wahrscheinlichkeit korrekt berechnet!" />}
                        </StepCard>
                    )}

                    {step === 5 && (
                        <SuccessBox showSolutionBtn={true} showSolution={showSolution} onToggleSolution={() => setShowSolution(!showSolution)} onNext={generateProblem} solutionText={problem.explanation} theme="violet" />
                    )}
                </div>
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(<WahrscheinlichkeitsTrainer />);
