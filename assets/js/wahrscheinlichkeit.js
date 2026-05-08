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

// Hilfs: zufälliges Element aus Array.
const _pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ==========================================
// Hardcoded Prüfungsaufgaben (Bayern MSA Mathematik — Wahrscheinlichkeit)
// Aus dem Prüfungsarchiv des Bayerischen Staatsministeriums für Unterricht und Kultus.
// Nur Aufgaben, die in unsere 2-Zug-Pfad-Struktur passen — adaptierte Aufgaben sind
// im `label` als (adaptiert) gekennzeichnet.
// ==========================================
const wahrscheinlichkeitsExamTasks = [
    {
        sigKey: 'msa-2025-i-7b',
        label: 'MSA 2025 I — Aufgabe 7b',
        text: 'Bei einer Faschingsveranstaltung werden 150 äußerlich nicht unterscheidbare Krapfen verkauft. Davon sind 75 mit Aprikosenmarmelade (A), 70 mit Erdbeermarmelade (E) und 5 mit Senf (S) gefüllt. Die ersten beiden Kunden kaufen nacheinander je einen Krapfen. Berechne die Wahrscheinlichkeit, dass die beiden zuerst verkauften Krapfen mit Aprikosenmarmelade gefüllt sind.',
        type: 'ohne',
        total: 150,
        treeColors: [
            { id: 'A', count: 75, hex: '#f59e0b' },
            { id: 'E', count: 70, hex: '#ef4444' },
            { id: 'S', count: 5, hex: '#94a3b8' }
        ],
        targetPath: ['A', 'A']
    },
    {
        sigKey: 'msa-2024-ii-5b',
        label: 'MSA 2024 II — Aufgabe 5b',
        text: 'In einer Getränkekiste befinden sich 12 Flaschen mit gleicher Form: 3 Flaschen Wasser (W), 5 Flaschen Apfelschorle (A) und 4 Flaschen Holunderschorle (H). Yannis holt sich zweimal nacheinander je eine Flasche aus der Kiste, ohne zurückzulegen. Berechne die Wahrscheinlichkeit, dass Yannis beide Male eine Flasche mit Holunderschorle entnimmt.',
        type: 'ohne',
        total: 12,
        treeColors: [
            { id: 'W', count: 3, hex: '#3b82f6' },
            { id: 'A', count: 5, hex: '#10b981' },
            { id: 'H', count: 4, hex: '#a855f7' }
        ],
        targetPath: ['H', 'H']
    },
    {
        sigKey: 'msa-2024-i-9-adapt',
        label: 'MSA 2024 I — Aufgabe 9 (adaptiert für 2 Züge)',
        text: 'In einem Behälter befinden sich 20 Kugeln. Auf jede Kugel ist genau eine Zahl aufgedruckt: viermal die Zahl 1, sechsmal die Zahl 2 und zehnmal die Zahl 3. Nacheinander werden zwei Kugeln gezogen ohne Zurücklegen. Berechne die Wahrscheinlichkeit, dass beide Male die Zahl 3 gezogen wird.',
        type: 'ohne',
        total: 20,
        treeColors: [
            { id: '1', count: 4, hex: '#3b82f6' },
            { id: '2', count: 6, hex: '#f59e0b' },
            { id: '3', count: 10, hex: '#10b981' }
        ],
        targetPath: ['3', '3']
    },
    {
        sigKey: 'msa-2017-ii-10b-adapt',
        label: 'MSA 2017 II — Aufgabe 10b (adaptiert für 2 Kategorien)',
        text: 'Bei einem Skirennen starten zwölf Läufer: 4 Deutsche, 5 Österreicher und 3 Schweizer. Die Startreihenfolge wird zufällig ausgelost. Wir unterscheiden nur zwischen "Schweizer" und "Andere" (Deutsche oder Österreicher). Berechne die Wahrscheinlichkeit, dass unter den ersten beiden Startern kein Schweizer ist.',
        type: 'ohne',
        total: 12,
        treeColors: [
            { id: 'CH', count: 3, hex: '#dc2626' },
            { id: 'Andere', count: 9, hex: '#3b82f6' }
        ],
        targetPath: ['Andere', 'Andere']
    },
    {
        sigKey: 'msa-2016-i-3b',
        label: 'MSA 2016 I — Aufgabe 3b',
        text: 'In einer Tüte befinden sich 4 rote, 2 grüne und 1 weißes Gummibärchen. Christiane nimmt ein Gummibärchen heraus und isst es. Anschließend nimmt sie ein zweites und isst es ebenfalls. Berechne die Wahrscheinlichkeit, dass beide Gummibärchen rot sind.',
        type: 'ohne',
        total: 7,
        treeColors: [
            { id: 'rot', count: 4, hex: '#ef4444' },
            { id: 'grün', count: 2, hex: '#10b981' },
            { id: 'weiß', count: 1, hex: '#cbd5e1' }
        ],
        targetPath: ['rot', 'rot']
    },
    {
        sigKey: 'msa-2014-ii-8b',
        label: 'MSA 2014 II — Aufgabe 8b',
        text: 'In einer Lostrommel auf dem Jahrmarkt befinden sich noch 1 Hauptgewinn (H), 9 Kleingewinne (K) und 40 Nieten (N). Moritz zieht zwei Lose aus der Trommel und öffnet sie nacheinander. Berechne die Wahrscheinlichkeit, dass Moritz zwei Nieten zieht.',
        type: 'ohne',
        total: 50,
        treeColors: [
            { id: 'H', count: 1, hex: '#f59e0b' },
            { id: 'K', count: 9, hex: '#10b981' },
            { id: 'N', count: 40, hex: '#94a3b8' }
        ],
        targetPath: ['N', 'N']
    },
    {
        sigKey: 'msa-2013-ii-3-adapt',
        label: 'MSA 2013 II — Aufgabe 3 (adaptiert: beide gleich)',
        text: 'In einem Behälter befinden sich 60 Kugeln: 24 gelbe (G) und 36 blaue (B). Nacheinander werden zwei Kugeln ohne Zurücklegen gezogen. Berechne die Wahrscheinlichkeit, dass beide Kugeln gelb sind.',
        type: 'ohne',
        total: 60,
        treeColors: [
            { id: 'G', count: 24, hex: '#f59e0b' },
            { id: 'B', count: 36, hex: '#3b82f6' }
        ],
        targetPath: ['G', 'G']
    }
];

// Wandelt einen Prüfungsaufgaben-Eintrag in das problem-Format um.
const buildExamProblem = (task) => {
    const isOhne = task.type === 'ohne';
    const tot = task.total;
    const colorByName = Object.fromEntries(task.treeColors.map(c => [c.id, c]));
    const t1Count = colorByName[task.targetPath[0]].count;
    const samePath = task.targetPath[0] === task.targetPath[1];
    const t2Count = (isOhne && samePath) ? colorByName[task.targetPath[1]].count - 1 : colorByName[task.targetPath[1]].count;
    const totalAfter = isOhne ? tot - 1 : tot;
    const expectedPerc = (t1Count / tot) * (t2Count / totalAfter) * 100;

    return {
        id: Math.random(), diff: 'pruefung',
        examLabel: task.label,
        text: task.text,
        type: task.type,
        draw1: { top: t1Count, bot: tot },
        draw2: { top: t2Count, bot: totalAfter },
        resultPerc: Math.round(expectedPerc * 100) / 100,
        explanation: `${task.label}\n\n1. Zug (${task.targetPath[0]}): ${t1Count}/${tot}\n2. Zug (${task.targetPath[1]}): ${t2Count}/${totalAfter}\nPfadregel: ${t1Count}/${tot} · ${t2Count}/${totalAfter} ≈ ${(Math.round(expectedPerc * 100) / 100).toString().replace('.',',')} %`,
        tree: buildProbabilityTree(task.treeColors, isOhne, task.targetPath, tot),
        sigKey: task.sigKey
    };
};

const genWahrscheinlichkeitProblem = (diff) => {
    if (diff === 'leicht') {
        // — MIT Zurücklegen — viele Szenarien.
        const scenarios = ['gluecksrad', 'spinner', 'lostrommel', 'wuerfelchen'];
        const sc = _pick(scenarios);

        const colors = ['rot', 'blau', 'grün', 'gelb'];
        const c1 = _pick(colors);
        const c2 = _pick(colors.filter(c => c !== c1));

        const total = _pick([6, 8, 10, 12, 15, 16, 20]);
        const count1 = Math.floor(Math.random() * 3) + 2;          // 2..4
        let count2 = Math.floor(Math.random() * 3) + 2;             // 2..4
        if (count1 + count2 >= total) count2 = total - count1 - 1;
        const rest = total - count1 - count2;

        const expectedPerc = ((count1/total) * (count2/total)) * 100;
        const treeColors = [
            { id: c1, count: count1, hex: colorMap[c1] },
            { id: c2, count: count2, hex: colorMap[c2] },
            { id: 'Rest', count: rest, hex: colorMap['Rest'] }
        ];

        let questionText;
        if (sc === 'gluecksrad') {
            questionText = `Ein Glücksrad hat ${total} gleich große Felder. Davon sind ${count1} ${c1}, ${count2} ${c2} und der Rest hat andere Farben. Das Rad wird zweimal gedreht. Wie groß ist die Wahrscheinlichkeit, dass erst ${c1} und dann ${c2} gedreht wird?`;
        } else if (sc === 'spinner') {
            questionText = `Ein Spielspinner zeigt ${total} gleichberechtigte Symbole: ${count1} ${c1}e Sterne, ${count2} ${c2}e Sterne und ${rest} Sterne in anderen Farben. Du drehst zweimal — wie groß ist die Wahrscheinlichkeit, erst ${c1} und dann ${c2} zu treffen?`;
        } else if (sc === 'lostrommel') {
            questionText = `In einer Lostrommel liegen ${total} gleich große Lose: ${count1} ${c1}e, ${count2} ${c2}e und ${rest} andere. Nach jedem Zug wird das Los wieder zurückgelegt. Wie groß ist die Wahrscheinlichkeit, erst ein ${c1}es und dann ein ${c2}es zu ziehen?`;
        } else {
            questionText = `Ein Spielwürfel ist auf jeder Seite mit einer Farbe markiert (insgesamt ${total} Seiten). ${count1} sind ${c1}, ${count2} sind ${c2} und ${rest} haben andere Farben. Du würfelst zweimal — wie groß ist die Wahrscheinlichkeit, erst ${c1} und dann ${c2} zu würfeln?`;
        }

        return {
            id: Math.random(), diff, text: questionText,
            type: 'mit',
            draw1: { top: count1, bot: total },
            draw2: { top: count2, bot: total },
            resultPerc: Math.round(expectedPerc * 100) / 100,
            explanation: `Mit Zurücklegen — der Nenner bleibt gleich.\n1. Zug (${c1}): ${count1}/${total}\n2. Zug (${c2}): ${count2}/${total}\nPfadregel: ${count1}/${total} · ${count2}/${total} = ${count1 * count2}/${total * total} ≈ ${(Math.round(expectedPerc * 100) / 100).toString().replace('.',',')} %`,
            tree: buildProbabilityTree(treeColors, false, [c1, c2], total),
            sigKey: `leicht-${sc}-${total}-${c1}-${count1}-${c2}-${count2}`
        };
    } else if (diff === 'mittel') {
        // — OHNE Zurücklegen, 2 Farben (gleicher Zug × 2).
        const scenarios = [
            { sc: 'gummibaerchen', name: 'Gummibärchen', cont: 'einer Tüte', verb: 'isst eines auf', adj: 'rote' },
            { sc: 'bonbons', name: 'Bonbons', cont: 'einer Schale', verb: 'isst eines auf', adj: 'blaue' },
            { sc: 'karten', name: 'Karten', cont: 'einem Stapel', verb: 'legt eine zur Seite', adj: 'rote' },
            { sc: 'kugeln', name: 'Kugeln', cont: 'einer Urne', verb: 'legt eine zur Seite', adj: 'grüne' },
            { sc: 'lose', name: 'Lose', cont: 'einer Lostrommel', verb: 'behält eines', adj: 'gelbe' },
            { sc: 'plaettchen', name: 'Plättchen', cont: 'einem Beutel', verb: 'legt eines zur Seite', adj: 'blaue' }
        ];
        const s = _pick(scenarios);
        const total = Math.floor(Math.random() * 8) + 6;            // 6..13
        const count1 = Math.floor(Math.random() * 4) + 2;           // 2..5
        const adjBase = s.adj.replace(/e$/, '');                    // "rote"→"rot" für colorMap

        const questionText = `In ${s.cont} sind ${count1} ${s.adj} und ${total - count1} andersfarbige ${s.name} (insgesamt ${total}). Es wird ein ${s.name.replace(/n$/, '').replace(/e$/, '')} blind herausgenommen — der Schüler ${s.verb}. Anschließend wird ein zweites entnommen. Wie groß ist die Wahrscheinlichkeit, dass beide ${s.adj} sind?`;
        const expectedPerc = ((count1/total) * ((count1-1)/(total-1))) * 100;
        const treeColors = [
            { id: s.adj, count: count1, hex: colorMap[adjBase] || colorMap['rot'] },
            { id: 'Andere', count: total - count1, hex: colorMap['Andere'] }
        ];

        return {
            id: Math.random(), diff, text: questionText,
            type: 'ohne',
            draw1: { top: count1, bot: total },
            draw2: { top: count1 - 1, bot: total - 1 },
            resultPerc: Math.round(expectedPerc * 100) / 100,
            explanation: `Ohne Zurücklegen — beim 2. Zug ist eines weniger insgesamt UND eines weniger der gefragten Farbe.\n1. Zug (${s.adj}): ${count1}/${total}\n2. Zug (${s.adj}): ${count1-1}/${total-1}\nPfadregel: ${count1}/${total} · ${count1-1}/${total-1} ≈ ${(Math.round(expectedPerc * 100) / 100).toString().replace('.',',')} %`,
            tree: buildProbabilityTree(treeColors, true, [s.adj, s.adj], total),
            sigKey: `mittel-${s.sc}-${total}-${count1}`
        };
    } else if (diff === 'schwer') {
        // — OHNE Zurücklegen, 3 Farben (verschiedene Zug × 2).
        const colorTriples = [
            { a: 'rot',  b: 'blau', c: 'grün' },
            { a: 'rot',  b: 'gelb', c: 'blau' },
            { a: 'blau', b: 'grün', c: 'gelb' },
            { a: 'gelb', b: 'rot',  c: 'grün' }
        ];
        const t = _pick(colorTriples);

        const containers = [
            'In einer Urne liegen',
            'In einem Sack befinden sich',
            'Im Beutel sind',
            'In der Lostrommel liegen'
        ];
        const cont = _pick(containers);

        const total = Math.floor(Math.random() * 8) + 12;           // 12..19
        const countA = Math.floor(Math.random() * 4) + 4;           // 4..7
        const countB = Math.floor(Math.random() * 4) + 3;           // 3..6
        const countC = total - countA - countB;
        if (countC < 2) {
            // ungeeignete Verteilung → einmal neu (Rekursion)
            return genWahrscheinlichkeitProblem('schwer');
        }

        const questionText = `${cont} ${total} Kugeln. Davon sind ${countA} ${t.a}e, ${countB} ${t.b}e und ${countC} ${t.c}e Kugeln. Du ziehst zwei Kugeln nacheinander OHNE Zurücklegen. Wie groß ist die Wahrscheinlichkeit, dass du erst eine ${t.a}e und dann eine ${t.b}e Kugel ziehst?`;
        const expectedPerc = ((countA/total) * (countB/(total-1))) * 100;
        const treeColors = [
            { id: t.a.charAt(0).toUpperCase()+t.a.slice(1), count: countA, hex: colorMap[t.a] },
            { id: t.b.charAt(0).toUpperCase()+t.b.slice(1), count: countB, hex: colorMap[t.b] },
            { id: t.c.charAt(0).toUpperCase()+t.c.slice(1), count: countC, hex: colorMap[t.c] }
        ];

        const aLabel = t.a.charAt(0).toUpperCase()+t.a.slice(1);
        const bLabel = t.b.charAt(0).toUpperCase()+t.b.slice(1);

        return {
            id: Math.random(), diff, text: questionText,
            type: 'ohne',
            draw1: { top: countA, bot: total },
            draw2: { top: countB, bot: total - 1 },
            resultPerc: Math.round(expectedPerc * 100) / 100,
            explanation: `Ohne Zurücklegen.\n1. Zug (${t.a}): ${countA}/${total}\n2. Zug (${t.b}): ${countB}/${total-1}\nPfadregel: ${countA}/${total} · ${countB}/${total-1} ≈ ${(Math.round(expectedPerc * 100) / 100).toString().replace('.',',')} %`,
            tree: buildProbabilityTree(treeColors, true, [aLabel, bLabel], total),
            sigKey: `schwer-${t.a}${t.b}${t.c}-${total}-${countA}-${countB}`
        };
    } else {
        // — Prüfungsaufgaben: Fallback (zufällige). Der Trainer-Code ruft normalerweise
        //   buildExamProblem direkt mit einem konkreten Index auf.
        const task = _pick(wahrscheinlichkeitsExamTasks);
        return buildExamProblem(task);
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
    // Letzte Aufgabe-Signatur — verhindert direkt aufeinanderfolgende identische Aufgaben.
    const [lastSigKey, setLastSigKey] = useState(null);
    // Prüfungsaufgaben-Pool (durchgemischt) und aktueller Index — verhalten sich wie
    // bei Bruchgleichungen: Pool wird einmal gemischt, jede Aufgabe einmal durchlaufen.
    const [examShuffled, setExamShuffled] = useState([]);
    const [examIdx, setExamIdx] = useState(0);

    useEffect(() => { setStorage('smarth_streak_wahrscheinlichkeit', streak); }, [streak]);
    const advance = (nextStep) => { setStep(nextStep); setErrors(0); setTipRevealed(false); };
    const triggerError = () => { setErrors(e => e + 1); setStreak(0); };
    const handleInputChange = (id, val) => { setInputs(prev => ({ ...prev, [id]: val.replace('.', ',') })); setInputFeedback(prev => ({ ...prev, [id]: null })); };

    const generateProblem = () => {
        setLoading(true); setStep(1); setSelectedIdentification(null);
        setInputs({ t1: '', b1: '', t2: '', b2: '', perc: '' }); setInputFeedback({});
        setFinalFeedback(null); setShowSolution(false); setErrors(0); setTipRevealed(false);

        let newProb;

        if (difficulty === 'pruefung') {
            // Prüfungsaufgaben: gemischter Pool, jede Aufgabe einmal durchlaufen.
            let pool = examShuffled;
            let idx = examIdx;
            if (pool.length === 0 || idx >= pool.length) {
                pool = shuffleArray(wahrscheinlichkeitsExamTasks);
                idx = 0;
                setExamShuffled(pool);
            }
            newProb = buildExamProblem(pool[idx]);
            setExamIdx(idx + 1);
        } else {
            // Generierte Aufgaben: Anti-Wiederholung über sigKey.
            let attempts = 0;
            do {
                newProb = genWahrscheinlichkeitProblem(difficulty);
                attempts++;
            } while (newProb.sigKey === lastSigKey && attempts < 8);
        }

        setLastSigKey(newProb.sigKey);
        setProblem(newProb);
        setLoading(false);
    };

    useEffect(() => { generateProblem(); }, [difficulty]);

    const handleDifficultyChange = (newDiff) => {
        // Bei Wechsel ZU Prüfungsaufgaben den Pool zurücksetzen, damit die Reihenfolge
        // jedes Mal neu gemischt wird.
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

    // Liefert Lösungstext für den aktuellen Schritt — TipBox zeigt ihn an,
    // füllt aber nichts automatisch aus.
    const getSolutionText = () => {
        if (!problem) return null;
        if (step === 1) return `Versuch ${problem.type === 'mit' ? 'mit' : 'ohne'} Zurücklegen.`;
        if (step === 2) return `1. Zug: ${problem.draw1.top} / ${problem.draw1.bot}`;
        if (step === 3) return `2. Zug: ${problem.draw2.top} / ${problem.draw2.bot}`;
        if (step === 4) return `${formatNum(problem.resultPerc)} %`;
        return null;
    };
    const onSolutionShown = () => setStreak(0);

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

            <DifficultyMenu theme="violet" active={difficulty} onChange={handleDifficultyChange} options={[
                {id: 'leicht', label: 'Leicht'},
                {id: 'mittel', label: 'Mittel'},
                {id: 'schwer', label: 'Schwer'},
                {id: 'pruefung', label: 'Prüfungsaufgaben'}
            ]} />

            <main className="space-y-6 relative">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-violet-50 px-6 py-3 border-b border-violet-200 flex justify-between items-center">
                        <h2 className="font-semibold text-violet-900 flex items-center"><BookOpen size={18} className="mr-2"/> Sachaufgabe</h2>
                        {problem?.examLabel
                            ? <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-amber-200 text-amber-800">{problem.examLabel}</span>
                            : <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-violet-200 text-violet-800">Baumdiagramm</span>
                        }
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
                        {step === 1 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text="Überlege: Verändert sich die Gesamtanzahl nach dem ersten Zug? Wenn jemand etwas aufisst oder 'nicht zurücklegt', ändert sich die Gesamtzahl." />}
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
                                <>
                                    {/* Desktop / Tablet (≥ sm): SVG-Baumdiagramm mit foreignObject-Eingaben */}
                                    <div className="hidden sm:block w-full bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto p-4 shadow-inner animate-fade-in mb-6">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Interaktives Baumdiagramm</h3>
                                        <svg viewBox="0 0 1000 420" className="w-full h-auto min-w-[800px] max-w-4xl mx-auto block overflow-visible">
                                            {renderTree(problem.tree, 500, 20, 900, 0)}
                                        </svg>
                                    </div>

                                    {/* Mobile (< sm): vereinfachtes SVG zur Anzeige + große Bruch-Eingaben darunter */}
                                    <div className="sm:hidden w-full bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-inner animate-fade-in mb-4 overflow-x-auto">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Baumdiagramm (Übersicht)</h3>
                                        <svg viewBox="0 0 1000 420" className="w-full h-auto min-w-[600px] block overflow-visible">
                                            {renderTree(problem.tree, 500, 20, 900, 0)}
                                        </svg>
                                    </div>
                                </>
                            )}

                            {/* Mobile-Eingabe: 1. Zug — gut bedienbar mit großen Feldern */}
                            <div className="sm:hidden bg-violet-50 border border-violet-200 rounded-xl p-4 mb-3">
                                <h4 className="text-sm font-bold text-violet-800 mb-2">1. Zug — Bruch eintragen</h4>
                                <div className="flex justify-center">
                                    <FractionInputInteraktiv idTop="t1" idBot="b1" valTop={inputs.t1} valBot={inputs.b1} onChange={handleInputChange} disabled={step !== 2} statusTop={inputFeedback.t1} statusBot={inputFeedback.b1} theme="violet" />
                                </div>
                            </div>
                            {step >= 3 && (
                                <div className="sm:hidden bg-violet-50 border border-violet-200 rounded-xl p-4 mb-3">
                                    <h4 className="text-sm font-bold text-violet-800 mb-2">2. Zug — Bruch eintragen</h4>
                                    <div className="flex justify-center">
                                        <FractionInputInteraktiv idTop="t2" idBot="b2" valTop={inputs.t2} valBot={inputs.b2} onChange={handleInputChange} disabled={step !== 3} statusTop={inputFeedback.t2} statusBot={inputFeedback.b2} theme="violet" />
                                    </div>
                                </div>
                            )}

                            {step === 2 && <div className="mt-4 flex flex-wrap justify-between items-center gap-2"><TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text="Zähler (oben): Wie viele passende Stücke gibt es? Nenner (unten): Wie viele Stücke sind es insgesamt am Anfang?" /><SubmitBtn onClick={checkZug1} theme="violet" disabled={!inputs.t1 || !inputs.b1} /></div>}

                            {step === 3 && <div className="mt-4 flex flex-wrap justify-between items-end gap-2"><TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text={problem.type === 'ohne' ? "Achtung: Es ist EIN Teil insgesamt weniger im Nenner! Und ist im Zähler auch eins weniger oder war es eine andere Farbe?" : "Da es 'mit Zurücklegen' ist, bleibt der Nenner gleich wie beim 1. Zug."} /><SubmitBtn onClick={checkZug2} theme="violet" disabled={!inputs.t2 || !inputs.b2} /></div>}

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
                            {step === 4 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text="Zähler mal Zähler, Nenner mal Nenner. Teile dann das obere Ergebnis durch das untere Ergebnis und multipliziere mit 100 für die Prozentzahl (Runde auf 2 Nachkommastellen oder auf ganze Prozent)." />}
                            {step > 4 && <SuccessMark text="Wahrscheinlichkeit korrekt berechnet!" />}
                        </StepCard>
                    )}

                    {step === 5 && (
                        <SuccessBox showSolutionBtn={true} showSolution={showSolution} onToggleSolution={() => setShowSolution(!showSolution)} onNext={generateProblem} solutionText={problem.explanation} theme="violet" nextBtnText={difficulty === 'pruefung' ? 'Nächste Prüfung' : 'Nächste Aufgabe'} />
                    )}
                </div>
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(<WahrscheinlichkeitsTrainer />);
