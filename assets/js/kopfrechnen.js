// ==========================================
// kopfrechnen.js — KopfrechenTrainer (Generatoren: kopfrechnen-gen.js)
// (Wird inline mit shared.js und kopfrechnen-gen.js pro App-Seite kompiliert.)
// ==========================================

// ==========================================
// TRAINER
// ==========================================
const KopfrechenTrainer = () => {
    const [difficulty, setDifficulty] = useState('leicht');
    const [recentCategories, setRecentCategories] = useState([]);
    // Prüfungsaufgaben-Pool (gemischte Indizes für Anti-Wiederholung)
    const [examPool, setExamPool] = useState(() => shuffleArray(Array.from({length: examTasks.length}, (_, i) => i)));
    const examIdxRef = React.useRef(0);

    const drawExamTask = () => {
        let pool = examPool;
        let idx = examIdxRef.current;
        if (idx >= pool.length) {
            pool = shuffleArray(Array.from({length: examTasks.length}, (_, i) => i));
            setExamPool(pool);
            idx = 0;
        }
        const taskFn = examTasks[pool[idx]];
        examIdxRef.current = idx + 1;
        return { ...taskFn(), categoryId: 'pruefung' };
    };

    const drawRandomQuestion = (diff, recentList) => {
        let available = generators.filter(g => !recentList.includes(g.id));
        if (available.length === 0) available = generators;
        const selected = available[Math.floor(Math.random() * available.length)];
        return { ...selected.fn(diff), categoryId: selected.id };
    };

    const generateNextQuestion = (diff, recentList) => {
        if (diff === 'pruefung') return drawExamTask();
        return drawRandomQuestion(diff, recentList);
    };

    const [currentQuestion, setCurrentQuestion] = useState(() => generateNextQuestion('leicht', []));
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [tipRevealed, setTipRevealed] = useState(false);

    const [streak, setStreak] = useState(() => getStorage('smarth_streak_kopf', 0));
    const [showAnim, setShowAnim] = useState(false);
    // Adaptive Schwierigkeit + Lernzielkontrolle.
    const adaptive = useAdaptive('kopfrechnen', difficulty);

    useEffect(() => { setStorage('smarth_streak_kopf', streak); }, [streak]);

    const handleDifficultyChange = (newDiff) => {
        setDifficulty(newDiff);
        if (newDiff === 'pruefung') {
            // Pool frisch mischen beim Wechsel auf Prüfungsmodus
            const fresh = shuffleArray(Array.from({length: examTasks.length}, (_, i) => i));
            setExamPool(fresh);
            examIdxRef.current = 0;
        }
        const newQ = generateNextQuestion(newDiff, recentCategories);
        setCurrentQuestion(newQ);
        if (newDiff !== 'pruefung') {
            setRecentCategories(prev => {
                const next = [...prev, newQ.categoryId];
                return next.length > 7 ? next.slice(next.length - 7) : next;
            });
        }
        setSelectedOption(null); setIsAnswerChecked(false); setTipRevealed(false);
    };

    const handleOptionSelect = (index) => { if (!isAnswerChecked) setSelectedOption(index); };

    const handleCheckAnswer = () => {
        if (selectedOption === null) return;
        setIsAnswerChecked(true);
        const isCorrect = selectedOption === currentQuestion.correctAnswer;
        if (isCorrect && !tipRevealed) {
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > 0 && newStreak % 6 === 0) triggerCelebration(setShowAnim);
            adaptive.recordCorrect();
        } else { setStreak(0); adaptive.recordWrong(); if (!isCorrect) recordError('kopfrechnen', currentQuestion.category); }
    };

    const loadNextQuestion = () => {
        const newQ = generateNextQuestion(difficulty, recentCategories);
        setCurrentQuestion(newQ);
        if (difficulty !== 'pruefung') {
            setRecentCategories(prev => {
                const next = [...prev, newQ.categoryId];
                return next.length > 7 ? next.slice(next.length - 7) : next;
            });
        }
        setSelectedOption(null); setIsAnswerChecked(false); setTipRevealed(false);
    };

    const handleSkip = () => { setStreak(0); adaptive.recordWrong(); loadNextQuestion(); };
    const handleShowTip = () => { setTipRevealed(true); setStreak(0); adaptive.recordWrong(); };

    const getOptionStyles = (index) => {
        if (!isAnswerChecked) return selectedOption === index ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-200' : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50';
        if (index === currentQuestion.correctAnswer) return 'border-green-500 bg-green-50 text-green-800 ring-2 ring-green-200';
        if (index === selectedOption && index !== currentQuestion.correctAnswer) return 'border-red-500 bg-red-50 text-red-800 ring-2 ring-red-200';
        return 'border-slate-200 opacity-50';
    };

    return (
        <div className="page-transition max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {showAnim && <CelebrationOverlay />}
            <TrainerHeader theme="sky" icon={CalculatorOff} title="Kopfrechnen" streakIcon={Target} streak={streak} />

            <DifficultyMenu theme="sky" active={difficulty} onChange={handleDifficultyChange} options={[{id: 'leicht', label: 'Leicht'}, {id: 'mittel', label: 'Mittel'}, {id: 'schwer', label: 'Schwer'}, {id: 'pruefung', label: 'Prüfungsaufgaben'}]} />

            {/* Lernzielkontrolle + adaptive Schwierigkeits-Empfehlung */}
            {adaptive.stats.mastered.length > 0 && (
                <div className="mb-4 flex justify-center"><MasteryBadge mastered={adaptive.stats.mastered} theme="sky" /></div>
            )}
            <AdaptiveSuggestion suggestion={adaptive.suggestion} onAccept={(d) => handleDifficultyChange(d)} theme="sky" />

            <main className="space-y-6 relative">
                <div className="bg-white rounded-3xl shadow-md overflow-hidden border border-slate-200">
                    <div className="bg-sky-50 px-6 py-4 border-b border-sky-200 flex justify-between items-center relative overflow-hidden gap-3 flex-wrap">
                        <div className="relative z-10 flex items-center text-sky-900 font-bold text-lg"><BookOpen className="w-5 h-5 mr-2 text-sky-600" /> {currentQuestion.category}</div>
                        {currentQuestion.sourceLabel && (
                            <span className="relative z-10 bg-amber-200 text-amber-800 px-2 py-1 rounded text-xs font-bold shadow-sm uppercase tracking-wider">{formatExamLabel(currentQuestion.sourceLabel)}</span>
                        )}
                        <div className="absolute -right-4 -top-4 opacity-10"><CalculatorOff className="w-24 h-24" /></div>
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="mb-8 min-h-[60px] flex items-center">
                            <h2 className="text-xl md:text-2xl font-semibold text-slate-800 leading-snug">{fx(currentQuestion.question)}</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                            {currentQuestion.options.map((option, index) => (
                                <button key={index} onClick={() => handleOptionSelect(index)} disabled={isAnswerChecked} className={`text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${getOptionStyles(index)}`}>
                                    <span className="font-medium text-[16px] leading-relaxed break-words">{fx(option)}</span>
                                    {isAnswerChecked && index === currentQuestion.correctAnswer && <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 ml-3" />}
                                    {isAnswerChecked && index === selectedOption && index !== currentQuestion.correctAnswer && <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 ml-3" />}
                                </button>
                            ))}
                        </div>

                        {!isAnswerChecked && (
                            <div className="mb-6">
                                {!tipRevealed ? (
                                    <button onClick={handleShowTip} className="text-sky-600 bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-lg font-medium flex items-center transition-colors border border-sky-200">
                                        <HelpCircle className="w-5 h-5 mr-2" /> Lösungsweg anzeigen (Tipp)
                                    </button>
                                ) : (
                                    <div className="bg-sky-50 border-l-4 border-sky-500 p-4 rounded shadow-sm text-sky-900 text-sm animate-fade-in flex">
                                        <HelpCircle className="w-6 h-6 mr-3 shrink-0 text-sky-600" />
                                        <div><strong className="block mb-1 text-sky-800">Tipp / Lösungsweg:</strong> <div className="mt-1 leading-relaxed">{fx(currentQuestion.explanation)}</div></div>
                                    </div>
                                )}
                            </div>
                        )}

                        {isAnswerChecked && (
                            <div className="mb-8 p-5 bg-sky-50 border border-sky-100 rounded-xl animate-fade-in flex flex-col sm:flex-row gap-4">
                                <div className="shrink-0 pt-1"><HelpCircle className="w-6 h-6 text-sky-600" /></div>
                                <div>
                                    <h3 className="text-sm font-bold text-sky-800 uppercase tracking-wider mb-1">Erklärung</h3>
                                    <p className="text-sky-900 leading-relaxed font-medium">{fx(currentQuestion.explanation)}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end items-center border-t border-slate-100 pt-6 mt-4">
                            {!isAnswerChecked ? (
                                <SubmitBtn onClick={handleCheckAnswer} theme="sky" disabled={selectedOption === null} />
                            ) : (
                                <button onClick={loadNextQuestion} className="w-full flex justify-center items-center gap-2 py-4 px-8 rounded-xl font-bold bg-slate-800 hover:bg-slate-900 text-white transition-all shadow-md transform hover:-translate-y-0.5 text-lg animate-fade-in">
                                    Nächste Aufgabe <ChevronRight className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(<KopfrechenTrainer />);
