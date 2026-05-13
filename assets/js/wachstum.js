// ==========================================
// wachstum.js — WachstumsTrainer
// (Wird inline mit shared.js zusammen pro App-Seite kompiliert.)
// ==========================================

// ==========================================
// Hardcoded Prüfungsaufgaben (Bayern MSA — Wachstum, Zerfall & Zinsen)
// Aus dem Prüfungsarchiv des Bayerischen Staatsministeriums.
// Nur Aufgaben mit konstantem Wachstumsfaktor (eine Gleichung Wn = W0 · q^n).
// ==========================================
const wachstumsExamTasks = [
    {
        sigKey: 'msa-2025-i-5b', label: 'MSA 2025 I — Aufgabe 5b',
        text: 'Ein Hauskäufer erhofft sich ab dem Kaufpreis von 170 000 € eine jährliche prozentuale Wertsteigerung von 3,1 %. Berechne, nach wie vielen Jahren das Haus auf diese Weise 525 000 € wert wäre.',
        type: 'n', isGrowth: true, w0: 170000, wn: 525000, rate: 3.1, n: 37, unit: '€', timeUnit: 'Jahren'
    },
    {
        sigKey: 'msa-2025-i-5c', label: 'MSA 2025 I — Aufgabe 5c',
        text: 'Nach dem Kauf für 170 000 € sinkt der Wert eines Hauses 11 Jahre lang um durchschnittlich 0,5 % pro Jahr. Ermittle den Wert des Hauses nach diesen 11 Jahren.',
        type: 'Wn', isGrowth: false, w0: 170000, wn: 160854, rate: 0.5, n: 11, unit: '€', timeUnit: 'Jahren'
    },
    {
        sigKey: 'msa-2024-i-5a', label: 'MSA 2024 I — Aufgabe 5a',
        text: 'In einer Urlaubsregion gab es 2010 insgesamt 88 Millionen Übernachtungen. In den folgenden neun Jahren ist die Zahl exponentiell auf 101 Millionen im Jahr 2019 gestiegen. Berechne den jährlichen Zuwachs in Prozent.',
        type: 'rate', isGrowth: true, w0: 88, wn: 101, rate: 1.55, n: 9, unit: 'Mio.', timeUnit: 'Jahren'
    },
    {
        sigKey: 'msa-2023-i-7a', label: 'MSA 2023 I — Aufgabe 7a',
        text: 'Frau Müller legt 1000 € an und erhält einen jährlichen Zinssatz von 4,9 %. Berechne die Höhe des Kapitals nach einem Anlagezeitraum von vier Jahren.',
        type: 'Wn', isGrowth: true, w0: 1000, wn: 1211.29, rate: 4.9, n: 4, unit: '€', timeUnit: 'Jahren'
    },
    {
        sigKey: 'msa-2023-i-7b', label: 'MSA 2023 I — Aufgabe 7b',
        text: 'Frau Müller legt 1000 € zu einem jährlichen Zinssatz von 4,9 % an. Ermittle rechnerisch, nach wie vielen Jahren sich das Kapital verdreifacht.',
        type: 'n', isGrowth: true, w0: 1000, wn: 3000, rate: 4.9, n: 23, unit: '€', timeUnit: 'Jahren'
    },
    {
        sigKey: 'msa-2022-i-2a', label: 'MSA 2022 I — Aufgabe 2a',
        text: 'Der Neupreis eines Autos beträgt 37 450 €. Berechne, in wie vielen Jahren sich der Wert auf 25 000 € verringert, wenn man von einem jährlich gleichbleibenden prozentualen Wertverlust von 12,7 % ausgeht.',
        type: 'n', isGrowth: false, w0: 37450, wn: 25000, rate: 12.7, n: 3, unit: '€', timeUnit: 'Jahren'
    },
    {
        sigKey: 'msa-2022-ii-9a', label: 'MSA 2022 II — Aufgabe 9a',
        text: 'Am 1. Januar 2010 wohnten in einer Stadt 460 725 Einwohner. Diese Einwohnerzahl stieg in neun Jahren um insgesamt 30 800 (also auf 491 525). Berechne das durchschnittliche jährliche Bevölkerungswachstum dieser Stadt in Prozent.',
        type: 'rate', isGrowth: true, w0: 460725, wn: 491525, rate: 0.72, n: 9, unit: 'Einwohner', timeUnit: 'Jahren'
    },
    {
        sigKey: 'msa-2021-i-2c', label: 'MSA 2021 I — Aufgabe 2c',
        text: 'Berechne, nach wie vielen Jahren sich die Bevölkerung einer Stadt verdoppeln würde, wenn man von einem durchschnittlichen jährlichen Zuwachs von 3,75 % ausgeht. Runde das Ergebnis auf volle Jahre.',
        type: 'n', isGrowth: true, w0: 100, wn: 200, rate: 3.75, n: 19, unit: 'Einwohner', timeUnit: 'Jahren'
    },
    {
        sigKey: 'msa-2019-i-8b', label: 'MSA 2019 I — Aufgabe 8b',
        text: 'Im Jahr 2006 waren 1931 Elektroautos zugelassen. In den folgenden 12 Jahren stieg die Zahl auf 34 022. Ermittle die durchschnittliche jährliche Zunahme in Prozent.',
        type: 'rate', isGrowth: true, w0: 1931, wn: 34022, rate: 26.78, n: 12, unit: 'Autos', timeUnit: 'Jahren'
    },
    {
        sigKey: 'msa-2019-ii-2b', label: 'MSA 2019 II — Aufgabe 2b',
        text: 'Ein Brauer produziert 5000 Hektoliter Bier pro Jahr und geht von einem durchschnittlichen jährlichen Anstieg von 6 % aus. Berechne, nach wie vielen Jahren er die Jahresmenge verdoppeln kann.',
        type: 'n', isGrowth: true, w0: 5000, wn: 10000, rate: 6, n: 12, unit: 'hl', timeUnit: 'Jahren'
    },
    {
        sigKey: 'msa-2018-i-8a', label: 'MSA 2018 I — Aufgabe 8a',
        text: 'Am 31. Dezember 2007 hatte eine Stadt 133 539 Einwohner. Am letzten Tag des Jahres 2016 waren es nur noch 124 698 Einwohner. Berechne den durchschnittlichen jährlichen Bevölkerungsrückgang in Prozent.',
        type: 'rate', isGrowth: false, w0: 133539, wn: 124698, rate: 0.76, n: 9, unit: 'Einwohner', timeUnit: 'Jahren'
    },
    {
        sigKey: 'msa-2014-ii-7a', label: 'MSA 2014 II — Aufgabe 7a',
        text: 'Alexandras Oma legt bei der Geburt 850 € zu einem jährlichen Zinssatz von 3,57 % an. Die Zinsen werden jedes Jahr dem Kapital gutgeschrieben. Ermittle den Betrag, auf den das Kapital bis zum 17. Geburtstag angewachsen ist.',
        type: 'Wn', isGrowth: true, w0: 850, wn: 1546.80, rate: 3.57, n: 17, unit: '€', timeUnit: 'Jahren'
    },
    {
        sigKey: 'msa-2013-ii-6a', label: 'MSA 2013 II — Aufgabe 6a',
        text: 'Herr Badenberg kaufte einen Neuwagen zum Preis von 27 500 €. Nach 3 Jahren verkaufte er den Wagen für 13 750 €. Berechne den durchschnittlichen jährlichen Wertverlust in Prozent.',
        type: 'rate', isGrowth: false, w0: 27500, wn: 13750, rate: 20.63, n: 3, unit: '€', timeUnit: 'Jahren'
    },
    {
        sigKey: 'msa-2012-i-3b', label: 'MSA 2012 I — Aufgabe 3b',
        text: 'Ein Auto kostete neu 48 000 €. Ermittle, nach wie vielen Jahren das Auto noch 10 000 € wert wäre, wenn der durchschnittliche jährliche Wertverlust gleichbleibend 18 % des jeweiligen Restwertes beträgt.',
        type: 'n', isGrowth: false, w0: 48000, wn: 10000, rate: 18, n: 8, unit: '€', timeUnit: 'Jahren'
    },
    {
        sigKey: 'msa-2010-i-1a', label: 'MSA 2010 I — Aufgabe 1a',
        text: 'Berechne, bei welchem festen Zinssatz sich ein Kapital in einem Zeitraum von 21 Jahren nur durch Zins und Zinseszins verdreifacht. Runde den Zinssatz auf eine Dezimalstelle.',
        type: 'rate', isGrowth: true, w0: 100, wn: 300, rate: 5.4, n: 21, unit: '€', timeUnit: 'Jahren'
    }
];

const round2 = (num, decimals = 2) => Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);

// Wandelt einen Prüfungsaufgaben-Eintrag in das problem-Format des Trainers um.
const buildWachstumsExamProblem = (task) => {
    const q = task.isGrowth ? round2(1 + task.rate / 100, 4) : round2(1 - task.rate / 100, 4);
    const solution = task.type === 'rate' ? task.rate
        : task.type === 'n' ? task.n
        : task.type === 'W0' ? task.w0
        : task.wn;
    const w0_f = formatNum(task.w0), wn_f = formatNum(task.wn), rate_f = formatNum(task.rate);
    let explanation = `${task.label}\n\nGegeben:\n${task.type !== 'W0' ? `W0 = ${w0_f} ${task.unit}\n` : ''}${task.type !== 'Wn' ? `Wn = ${wn_f} ${task.unit}\n` : ''}${task.type !== 'n' ? `n = ${task.n}\n` : ''}${task.type !== 'rate' ? `p = ${rate_f} %  =>  q = ${formatNum(q)}\n` : ''}\nRechnung:\n`;
    if (task.type === 'Wn') explanation += `Wn = ${w0_f} · ${formatNum(q)}^${task.n} = ${wn_f}`;
    if (task.type === 'W0') explanation += `W0 = ${wn_f} / ${formatNum(q)}^${task.n} = ${w0_f}`;
    if (task.type === 'rate') explanation += `q = (${wn_f}/${w0_f})^(1/${task.n}) = ${formatNum(q)} => p = ${rate_f} %`;
    if (task.type === 'n') explanation += `n = log(${wn_f}/${w0_f}) / log(${formatNum(q)}) = ${task.n}`;
    return {
        type: task.type, scenario: 'pruefung', text: task.text + ' Was musst du berechnen?',
        w0: task.w0, wn: task.wn, rate: task.rate, q, n: task.n, unit: task.unit,
        solution, explanation, examLabel: task.label, sigKey: task.sigKey
    };
};

const WachstumsTrainer = () => {
    const [difficulty, setDifficulty] = useState('mittel');
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
    // Anti-Wiederholung + Prüfungsaufgaben-Pool.
    const [lastSigKey, setLastSigKey] = useState(null);
    const [examShuffled, setExamShuffled] = useState([]);
    const [examIdx, setExamIdx] = useState(0);

    useEffect(() => { setStorage('smarth_streak_wachstum', streak); }, [streak]);
    const advance = (nextStep) => { setStep(nextStep); setErrors(0); setTipRevealed(false); };
    const triggerError = () => { setErrors(e => e + 1); setStreak(0); };
    const round = (num, decimals = 2) => Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    const handleInputChange = (id, val) => { setInputs(prev => ({ ...prev, [id]: val.replace('.', ',') })); setInputFeedback(prev => ({ ...prev, [id]: null })); };

    // Erzeugt EINE zufällige Aufgabe (ohne State-Setting). Wird bis zu 8× wiederholt
    // bis sich der sigKey vom letzten unterscheidet — Anti-Wiederholung.
    const buildRandomTask = () => {
        const scenarios = ['money', 'population', 'depreciation', 'cooling'];
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        // Im "leicht"-Modus immer nur Wn-gesucht; ansonsten alle 4 Varianten in Sequenz.
        const sequenceOrder = (difficulty === 'leicht') ? ['Wn'] : ['Wn', 'rate', 'W0', 'n'];
        const type = sequenceOrder[sequenceIndex % sequenceOrder.length];

        let w0, rate, n, q, wn, unit;
        const isGrowth = (scenario === 'money' || scenario === 'population');

        if (difficulty === 'leicht') {
            // Kleine, glatte Zahlen — Schüler-freundlich.
            switch (scenario) {
                case 'money':       unit = '€';         w0 = (Math.floor(Math.random()*8)+2)*100; rate = (Math.floor(Math.random()*4)+1); n = Math.floor(Math.random()*4)+2; break;
                case 'population':  unit = 'Einwohner'; w0 = (Math.floor(Math.random()*9)+1)*1000; rate = (Math.floor(Math.random()*3)+1); n = Math.floor(Math.random()*4)+3; break;
                case 'depreciation':unit = '€';         w0 = (Math.floor(Math.random()*5)+5)*1000; rate = (Math.floor(Math.random()*5)+5); n = Math.floor(Math.random()*3)+2; break;
                case 'cooling':     unit = '°C';        w0 = Math.floor(Math.random()*40)+40;     rate = Math.floor(Math.random()*8)+3;   n = Math.floor(Math.random()*4)+2; break;
            }
        } else {
            switch (scenario) {
                case 'money': unit = "€"; w0 = Math.floor(Math.random() * 50) * 100 + 500; rate = round(Math.random() * 4 + 0.5, 1); n = Math.floor(Math.random() * 10) + 2; break;
                case 'population': unit = "Einwohner"; w0 = Math.floor(Math.random() * 50) * 1000 + 10000; rate = round(Math.random() * 2 + 0.5, 1); n = Math.floor(Math.random() * 15) + 5; break;
                case 'depreciation': unit = "€"; w0 = Math.floor(Math.random() * 20) * 1000 + 15000; rate = Math.floor(Math.random() * 10) + 8; n = Math.floor(Math.random() * 6) + 3; break;
                case 'cooling': unit = "°C"; w0 = Math.floor(Math.random() * 60) + 40; rate = Math.floor(Math.random() * 15) + 5; n = Math.floor(Math.random() * 10) + 2; break;
            }
        }

        q = isGrowth ? round(1 + rate / 100, 4) : round(1 - rate / 100, 4);
        wn = round(w0 * Math.pow(q, n), 2);
        if (unit === 'Einwohner') wn = Math.round(wn);
        const sigKey = `${difficulty}-${scenario}-${type}-${w0}-${rate}-${n}`;
        return { type, scenario, w0, rate, n, q, wn, unit, isGrowth, sigKey };
    };

    const generateProblem = () => {
        setLoading(true); setStep(1); setSelectedIdentification(null); setInputs({ wn: '', w0: '', q: '', n: '' }); setInputFeedback({});
        setOptions([]); setSelectedOptionId(null); setFinalAnswer(''); setFinalFeedback(null); setShowSolution(false); setErrors(0); setTipRevealed(false);

        // ===== Prüfungsaufgaben: gemischter Pool, jede Aufgabe einmal durchlaufen =====
        if (difficulty === 'pruefung') {
            let pool = examShuffled;
            let idx = examIdx;
            if (pool.length === 0 || idx >= pool.length) {
                pool = shuffleArray(wachstumsExamTasks);
                idx = 0;
                setExamShuffled(pool);
            }
            const task = pool[idx];
            const examProb = buildWachstumsExamProblem(task);
            setProblem(examProb);
            setExamIdx(idx + 1);
            setLastSigKey(examProb.sigKey);
            // Optionen für Schritt 3 (Umform-Auswahl) bauen wir wie unten.
            buildOptionsAndFinish(examProb);
            return;
        }

        // ===== Generierte Aufgaben mit Anti-Wiederholung =====
        let task;
        let attempts = 0;
        do {
            task = buildRandomTask();
            attempts++;
        } while (task.sigKey === lastSigKey && attempts < 8);
        setLastSigKey(task.sigKey);
        setSequenceIndex(prev => prev + 1);

        const { type, scenario, w0, rate, n, q, wn, unit, isGrowth } = task;

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
        buildOptionsAndFinish({ type, n });
    };

    // Options für Schritt 3 (Umform-Auswahl) bauen + loading false. Wird sowohl im
    // Random- als auch im Prüfungsmodus aufgerufen.
    const buildOptionsAndFinish = (prob) => {
        const t = prob.type, nv = prob.n;
        let opts = [];
        switch (t) {
            case 'Wn': opts = [{ id: '1', label: 'Formel ist bereits aufgelöst. Einfach ausrechnen.', isCorrect: true }, { id: '2', label: <span>Teile durch <VarW0/></span>, isCorrect: false }, { id: '3', label: <span>Ziehe die {nv}-te Wurzel</span>, isCorrect: false }]; break;
            case 'W0': opts = [{ id: '1', label: <span>Teile durch <VarQpowN/></span>, isCorrect: true }, { id: '2', label: <span>Multipliziere mit <VarQpowN/></span>, isCorrect: false }, { id: '3', label: <span>Subtrahiere <VarQpowN/></span>, isCorrect: false }]; break;
            case 'rate': opts = [{ id: '1', label: <span>1. Teile durch <VarW0/> <br/> 2. Ziehe die {nv}-te Wurzel</span>, isCorrect: true }, { id: '2', label: <span>1. Teile durch <VarW0/> <br/> 2. Teile durch {nv}</span>, isCorrect: false }, { id: '3', label: <span>1. Teile durch {nv} <br/> 2. Ziehe die Wurzel</span>, isCorrect: false }]; break;
            case 'n': opts = [{ id: '1', label: <span>1. Teile durch <VarW0/> <br/> 2. Wende den Logarithmus an</span>, isCorrect: true }, { id: '2', label: <span>1. Teile durch <VarQ/> <br/> 2. Wende den Logarithmus an</span>, isCorrect: false }, { id: '3', label: <span>1. Teile durch <VarW0/> <br/> 2. Ziehe die {nv}-te Wurzel</span>, isCorrect: false }]; break;
        }
        setOptions(opts.sort(() => Math.random() - 0.5));
        setLoading(false);
    };

    useEffect(() => { generateProblem(); }, [difficulty]);

    const handleDifficultyChange = (newDiff) => {
        // Bei Wechsel ZU Prüfungsaufgaben den Pool zurücksetzen, damit jedes Mal neu gemischt wird.
        if (newDiff === 'pruefung' && difficulty !== 'pruefung') {
            setExamShuffled([]);
            setExamIdx(0);
        }
        if (difficulty === newDiff) generateProblem();
        else setDifficulty(newDiff);
    };

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
        // Großzügige Toleranz: ±1% bei großen Werten, mindestens ±0,5 bei n und rate (Logarithmus-Rundung)
        const tolerance = (problem.type === 'n' || problem.type === 'rate')
            ? 0.5
            : Math.max(0.5, Math.abs(problem.solution) * 0.01);
        if (Math.abs(val - problem.solution) <= tolerance || (problem.type === 'n' && Math.round(val) === problem.solution)) {
            setFinalFeedback('correct');
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > 0 && newStreak % 3 === 0) triggerCelebration(setShowAnim);
            setShowSolution(true); advance(5);
        } else { setFinalFeedback('incorrect'); triggerError(); }
    };

    // Liefert den Lösungstext für den aktuellen Schritt — wird in TipBox angezeigt,
    // füllt aber NICHTS automatisch aus (Schüler muss selbst tippen).
    const getSolutionText = () => {
        if (!problem) return null;
        const labelMap = { Wn: 'Wn', W0: 'W0', rate: 'p (Rate)', n: 'n' };
        if (step === 1) return `Du suchst ${labelMap[problem.type]}.`;
        if (step === 2) {
            const parts = [];
            if (problem.type !== 'Wn') parts.push(`Wn = ${formatNum(problem.wn)}`);
            if (problem.type !== 'W0') parts.push(`W0 = ${formatNum(problem.w0)}`);
            if (problem.type !== 'rate') parts.push(`q = ${formatNum(problem.q)}`);
            if (problem.type !== 'n') parts.push(`n = ${problem.n}`);
            return parts.join(';   ');
        }
        if (step === 3) {
            const correct = options.find(o => o.isCorrect);
            return correct ? <span>{correct.label}</span> : null;
        }
        if (step === 4) {
            const u = problem.type === 'rate' ? '%' : (problem.unit || '');
            return `${formatNum(problem.solution)} ${u}`.trim();
        }
        return null;
    };
    const onSolutionShown = () => setStreak(0);

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

            <DifficultyMenu theme="emerald" active={difficulty} onChange={handleDifficultyChange} options={[
                {id: 'leicht', label: 'Leicht'},
                {id: 'mittel', label: 'Mittel'},
                {id: 'schwer', label: 'Schwer'},
                {id: 'pruefung', label: 'Prüfungsaufgaben'}
            ]} />

            <main className="space-y-6 relative">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-200 flex justify-between items-center">
                        <h2 className="font-semibold text-emerald-900 flex items-center"><BookOpen size={18} className="mr-2"/> Sachaufgabe</h2>
                        {problem?.examLabel && <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-amber-200 text-amber-800">{problem.examLabel}</span>}
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
                        {step === 1 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text="Lies genau: Frag nach dem Start (W0), dem Ende (Wn) oder der Dauer (n)?" />}
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
                            {step === 2 && <div className="mt-4 flex justify-between items-center"><TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text={difficulty==='schwer'?"n ist die Differenz der Jahre. Bei Abnahme ist q < 1 (z.B. 1 - 0.05).":"q ist (1 + p/100) bei Zunahme und (1 - p/100) bei Abnahme."} /><SubmitBtn onClick={checkFormulaInputs} theme="emerald" /></div>}
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
                            {step === 3 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text="Um W0 freizustellen: teile durch q^n. Für n: teile durch W0 und nutze den Logarithmus." />}
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
                            {step === 4 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text="Achte beim Taschenrechner auf Kommas und Klammern (z.B. log(Endwert/Startwert))." />}
                            {step > 4 && <SuccessMark text="Perfekt gerechnet!" />}
                        </StepCard>
                    )}

                    {step === 5 && (
                        <SuccessBox showSolutionBtn={true} showSolution={showSolution} onToggleSolution={() => setShowSolution(!showSolution)} onNext={generateProblem} solutionText={problem.explanation} theme="emerald" nextBtnText={difficulty === 'pruefung' ? 'Nächste Prüfung' : 'Nächste Aufgabe'} />
                    )}
                </div>
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(<WachstumsTrainer />);
