// ==========================================
// kopfrechnen.js — KopfrechenTrainer (inkl. aller Generatoren)
// (Wird inline mit shared.js zusammen pro App-Seite kompiliert.)
// ==========================================

// ==========================================
// EXAM TASKS (MSA Teil A — Prüfungsaufgaben)
// ==========================================
// Jeder Eintrag ist eine Funktion, die beim Aufruf ein frisches Frage-Objekt
// liefert (mit zufällig angeordneten Antwortmöglichkeiten).
const makeExamTask = (sourceLabel, category, question, correctEl, wrongEls, explanation) => () => {
    const opts = shuffleArray([
        { el: correctEl, id: 'c' },
        ...wrongEls.map((el, i) => ({ el, id: `w${i}` }))
    ]);
    return {
        sourceLabel,
        category,
        question,
        options: opts.map(o => o.el),
        correctAnswer: opts.findIndex(o => o.id === 'c'),
        explanation
    };
};

const examTasks = [
    makeExamTask(
        "MSA 2025 A/1a",
        "Potenzgleichung",
        <span>Bestimme x: <span className="whitespace-nowrap">3<sup>x</sup> = <Frac top="1" bot="9" /></span></span>,
        'x = -2',
        ['x = 2', 'x = -3', 'x = -1/2'],
        <span><Frac top="1" bot="9" /> lässt sich schreiben als <span className="whitespace-nowrap"><Frac top="1" bot="3²" /> = 3<sup>-2</sup></span> (Kehrbruch ↔ negativer Exponent). Also x = -2.</span>
    ),
    makeExamTask(
        "MSA 2025 A/1b",
        "Potenzgleichung",
        <span>Bestimme x: <span className="whitespace-nowrap">5<sup>x</sup> : 5<sup>-2</sup> = 5<sup>3</sup></span></span>,
        'x = 1',
        ['x = 5', 'x = -1', 'x = 6'],
        'Beim Dividieren werden die Exponenten subtrahiert: x − (−2) = 3 → x + 2 = 3 → x = 1.'
    ),
    makeExamTask(
        "MSA 2025 A/2a",
        "Definitionsmenge",
        <span>Welche Definitionsmenge hat <span className="whitespace-nowrap"><Frac top="x − 4" bot="x + 2" /> = <Frac top="x − 2" bot="x + 5" /></span> ?</span>,
        'D = ℝ \\ {-2; -5}',
        ['D = ℝ \\ {2; 5}', 'D = ℝ \\ {-2; 5}', 'D = ℝ \\ {4; 2}'],
        'Beide Nenner dürfen nicht 0 werden: x + 2 = 0 → x = −2, und x + 5 = 0 → x = −5. Beide Werte ausschließen.'
    ),
    makeExamTask(
        "MSA 2025 A/2b",
        "Definitionsmenge",
        <span>Bei <span className="whitespace-nowrap">2 = <Frac top="1" bot="x² − 1" /></span> wurde <span className="whitespace-nowrap">D = ℝ \ {'{'}1{'}'}</span> angegeben. Was ist korrekt?</span>,
        'D = ℝ \\ {-1; 1}',
        ['D = ℝ \\ {1}', 'D = ℝ \\ {0; 1}', 'D = ℝ \\ {-1}'],
        'Der Nenner x² − 1 wird 0, wenn x² = 1 ist. Das gilt für x = 1 UND x = -1. Beide Werte müssen ausgeschlossen werden.'
    ),
    makeExamTask(
        "MSA 2025 A/4",
        "Lineare Funktionen",
        <span>Auf <span className="whitespace-nowrap">g: y = 0,5x + 3</span> liegen <span className="whitespace-nowrap">P(x | 9)</span> und <span className="whitespace-nowrap">Q(5 | y)</span>. Bestimme die fehlenden Koordinaten.</span>,
        'P(12 | 9) und Q(5 | 5,5)',
        ['P(6 | 9) und Q(5 | 13)', 'P(12 | 9) und Q(5 | 2,5)', 'P(3 | 9) und Q(5 | 5,5)'],
        'Für P: 9 = 0,5·x + 3 → x = 12. Für Q: y = 0,5·5 + 3 = 5,5.'
    ),
    makeExamTask(
        "MSA 2025 A/6c",
        "Quadratische Funktionen",
        <span>Welcher Punkt liegt auf der Parabel <span className="whitespace-nowrap">p: y = x² + 2</span> ?</span>,
        'R(-2 | 6)',
        ['P(-2 | 5)', 'Q(2 | -6)', 'S(-2 | -6)'],
        'Setze x = -2 in y = x² + 2 ein: (-2)² + 2 = 4 + 2 = 6. Also liegt R(-2 | 6) auf der Parabel.'
    ),
    makeExamTask(
        "MSA 2025 A/6d",
        "Sachsituation → Gleichung",
        <span>Ein E-Roller kostet 2,50 € Grundgebühr plus 0,20 € pro Minute. Welche Gleichung passt?</span>,
        'y = 2,5 + 0,2x',
        [<span className="whitespace-nowrap">y = 2,5 · x<sup>0,2</sup></span>, <span className="whitespace-nowrap">y = 0,2 · 2,5<sup>x</sup></span>, 'y = 2,5x + 0,2'],
        'Die Grundgebühr (2,50 €) ist der y-Achsenabschnitt. Pro Minute kommen 0,20 € dazu — das ist die Steigung. Also y = 2,5 + 0,2x.'
    ),
    makeExamTask(
        "MSA 2025 A/7a",
        "Wahrscheinlichkeit",
        <span>Ein Würfel hat das Netz mit den Zahlen 2, 2, 4, 4, 4, 5 (drei Vierer). Er wird zweimal geworfen. Wie hoch ist <span className="whitespace-nowrap">P("zweimal 4")</span> ?</span>,
        '25 %',
        ['33 %', '50 %', '12,5 %'],
        <span>Auf 6 Seiten steht 3-mal die 4, also <span className="whitespace-nowrap">P(4) = <Frac top="3" bot="6" /> = <Frac top="1" bot="2" /></span>. Bei zwei Würfen: <span className="whitespace-nowrap">(1/2)² = 1/4 = 25 %</span>.</span>
    ),
    makeExamTask(
        "MSA 2024 A/1",
        "Lineare Funktionen",
        <span>Stehen die Geraden <span className="whitespace-nowrap">g<sub>1</sub>: y = -0,5x + 0,5</span> und <span className="whitespace-nowrap">g<sub>2</sub>: y = 2x − 1</span> senkrecht aufeinander?</span>,
        'Ja, denn m₁ · m₂ = -1.',
        ['Nein, die Steigungen sind unterschiedlich.', 'Nein, die y-Achsenabschnitte sind unterschiedlich.', 'Ja, denn beide schneiden die x-Achse.'],
        'Zwei Geraden stehen senkrecht aufeinander, wenn das Produkt der Steigungen -1 ergibt: (-0,5) · 2 = -1. ✓'
    ),
    makeExamTask(
        "MSA 2024 A/2",
        "Geometrie",
        <span>Eine Kugel hat den gleichen Durchmesser wie die Kantenlänge eines Würfels. Der Würfel hat einen Oberflächeninhalt von 600 cm². Welcher Radius hat die Kugel?</span>,
        'r = 5 cm',
        ['r = 10 cm', 'r = 100 cm', 'r = 25 cm'],
        'Würfeloberfläche = 6·a². 600 = 6·a² → a² = 100 → a = 10 cm. Durchmesser = 10 cm, also Radius = 5 cm.'
    ),
    makeExamTask(
        "MSA 2024 A/3",
        "Potenzgesetze",
        <span>Vereinfache (x ≠ 0): <span className="whitespace-nowrap"><Frac top={<span>x<sup>n+1</sup></span>} bot={<span>x<sup>n</sup></span>} /></span></span>,
        'x',
        [<span className="whitespace-nowrap">x<sup>n</sup></span>, <span className="whitespace-nowrap">x<sup>2n+1</sup></span>, '1'],
        <span>Beim Dividieren werden Exponenten subtrahiert: <span className="whitespace-nowrap">(n + 1) − n = 1</span>. Also <span className="whitespace-nowrap">x<sup>1</sup> = x</span>.</span>
    ),
    makeExamTask(
        "MSA 2023 A/1",
        "Potenzgesetze",
        <span>Welche dieser Gleichungen ist FALSCH (alle Variablen &gt; 0)?</span>,
        <span className="whitespace-nowrap">s<sup>-2</sup> · t² = (s · t)²</span>,
        [<span className="whitespace-nowrap">(a²·b²)<sup>1/2</sup> = a · b</span>, <span className="whitespace-nowrap"><Frac top="x²" bot={<span>y<sup>-2</sup></span>} /> = (x · y)²</span>],
        <span><span className="whitespace-nowrap">s<sup>-2</sup>·t² = t²/s²</span>, das ist NICHT gleich (s·t)² = s²·t². Diese Gleichung stimmt also nicht.</span>
    ),
    makeExamTask(
        "MSA 2023 A/3",
        "Zentrische Streckung",
        <span>Im Dreieck ABC: α = 40°; a = 5 cm; b = 3 cm. Das Dreieck wird zentrisch gestreckt, neue Seite a′ = 10 cm. Wie groß sind b′ und α′?</span>,
        "b′ = 6 cm, α′ = 40°",
        ["b′ = 6 cm, α′ = 80°", "b′ = 1,5 cm, α′ = 40°", "b′ = 3 cm, α′ = 40°"],
        "Streckungsfaktor: k = a′/a = 10/5 = 2. b′ = k·b = 2·3 = 6 cm. Winkel bleiben bei zentrischer Streckung unverändert: α′ = α = 40°."
    ),
    makeExamTask(
        "MSA 2023 A/4",
        "Geometrie (Volumen)",
        <span>Der Radius einer Halbkugel wird vervierfacht. Um welchen Faktor wächst das Volumen?</span>,
        'Faktor 64',
        ['Faktor 16', 'Faktor 4', 'Faktor 8'],
        'Das Volumen wächst bei zentrischer Streckung mit k³. Hier ist k = 4, also 4³ = 4·4·4 = 64.'
    ),
    makeExamTask(
        "MSA Muster A/1",
        "Potenzgesetze",
        <span>Was ergibt <span className="whitespace-nowrap">(3x<sup>4</sup>)²</span> ?</span>,
        <span className="whitespace-nowrap">9x<sup>8</sup></span>,
        [<span className="whitespace-nowrap">3x<sup>8</sup></span>, <span className="whitespace-nowrap">6x<sup>8</sup></span>, <span className="whitespace-nowrap">9x<sup>6</sup></span>],
        <span>Sowohl 3 als auch x<sup>4</sup> werden quadriert: <span className="whitespace-nowrap">3² · (x<sup>4</sup>)² = 9 · x<sup>4·2</sup> = 9x<sup>8</sup></span>.</span>
    ),
    makeExamTask(
        "MSA Muster A/2a",
        "Sachsituation → Gleichung",
        <span>Leihwagen-Angebot B: 0,20 €/km plus 10 € Grundpreis. Welche Funktionsgleichung passt?</span>,
        'y = 0,2x + 10',
        ['y = 10x + 0,2', <span className="whitespace-nowrap">y = 0,2 · 10<sup>x</sup></span>, 'y = 0,2 + 10x'],
        'Grundpreis (10 €) ist der y-Achsenabschnitt; 0,20 € pro km ist die Steigung. → y = 0,2x + 10.'
    ),
    makeExamTask(
        "MSA Muster A/5",
        "Geometrie (Volumen)",
        <span>Der Durchmesser einer Kugel wird verdoppelt. Um welchen Faktor wächst das Volumen?</span>,
        'Faktor 8',
        ['Faktor 4', 'Faktor 2', 'Faktor 16'],
        'Verdoppelt sich der Durchmesser, verdoppelt sich auch der Radius (k = 2). Das Volumen wächst mit k³ = 2³ = 8.'
    )
];

// ==========================================
// KOPFRECHNEN GENERATORS
// ==========================================

const genProzent = (diff) => {
    if (diff === 'leicht') {
        const percent = [5, 10, 15, 20, 25, 30, 40, 50, 75][Math.floor(Math.random()*9)];
        const base = [20, 40, 50, 60, 80, 100, 120, 150, 200, 300, 400, 500][Math.floor(Math.random()*12)];
        const ans = (percent * base) / 100;
        let wrongsArr = [ans+10, ans-10, ans+5, ans-5, ans*2, ans/2, ans+20, ans+percent].filter(x => x > 0 && x !== ans && Number.isInteger(x));
        if (wrongsArr.length < 3) wrongsArr.push(ans+15, ans+25, ans+35);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const options = shuffleArray([ans, ...wrongs].map(n => fDe(n)));
        return { category: 'Prozentrechnung', question: `Berechne ${percent}% von ${base}.`, options, correctAnswer: options.indexOf(fDe(ans)), explanation: `${percent}% ist als Bruch ${percent}/100. Also rechnen wir: ${base} / 100 · ${percent} = ${fDe(ans)}.` };
    } else if (diff === 'mittel') {
        const percent = [2, 5, 12, 15, 35, 45, 75][Math.floor(Math.random()*7)];
        const base = [40, 60, 80, 120, 150, 200, 250, 300][Math.floor(Math.random()*8)];
        const ans = (percent * base) / 100;
        let wrongsArr = [ans+5, ans-5, ans+2, ans-2, ans*2, ans/2, ans+10].filter(x => x > 0 && x !== ans);
        if (wrongsArr.length < 3) wrongsArr.push(ans+15, ans+25, ans+35);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const options = shuffleArray([ans, ...wrongs].map(n => fDe(n)));
        return { category: 'Prozentrechnung', question: `Berechne ${percent}% von ${base}.`, options, correctAnswer: options.indexOf(fDe(ans)), explanation: `Zerlege den Prozentwert im Kopf (z.B. in 10% und 5%). Das Ergebnis ist ${fDe(ans)}.` };
    } else {
        const p = [2, 4, 5, 8, 10, 20, 25][Math.floor(Math.random()*7)];
        const k = [2, 3, 4, 5, 8, 12, 15][Math.floor(Math.random()*7)];
        const W = p * k; const G = 100 * k;
        let wrongsArr = [G/2, G*2, W*10, G+100, G-100, G+50].filter(x => x > 0 && x !== G);
        if (wrongsArr.length < 3) wrongsArr.push(G+200, G+300, G+400);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const options = shuffleArray([G, ...wrongs].map(fDe));
        return { category: 'Prozentrechnung', question: `${p}% einer Strecke sind ${W} km. Wie lang ist die gesamte Strecke (100%)?`, options, correctAnswer: options.indexOf(fDe(G)), explanation: `Wenn ${p}% = ${W} km sind, dann teile durch ${p}, um 1% zu erhalten (1% = ${fDe(W/p)} km). 100% sind also 100 · ${fDe(W/p)} = ${fDe(G)} km.` };
    }
};

const genLinear = (diff) => {
    if (diff === 'leicht') {
        const x = Math.floor(Math.random()*15)+2;
        const a = Math.floor(Math.random()*6)+2;
        const b = Math.floor(Math.random()*15)+1;
        const c = a*x + b;
        let wrongsArr = [x+1, x-1, x+2, x-2, x*2, x+3, Math.floor(x/2)].filter(n => n > 0 && n !== x);
        if (wrongsArr.length < 3) wrongsArr.push(x+4, x+5, x+6);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const options = shuffleArray([x, ...wrongs].map(n => `x = ${n}`));
        return { category: 'Lineare Gleichungen', question: `Löse im Kopf nach x auf: ${a}x + ${b} = ${c}`, options, correctAnswer: options.indexOf(`x = ${x}`), explanation: `1. Subtrahiere ${b} auf beiden Seiten: ${a}x = ${c-b}. 2. Teile durch ${a}: x = ${x}.` };
    } else if (diff === 'mittel') {
        const a = Math.floor(Math.random()*7)+3;
        const b = Math.floor(Math.random()*20)+5;
        const x = Math.floor(Math.random()*12)+2;
        const c = a*x - b;
        let wrongsArr = [x+1, x-1, x+2, x-2, x*2, x+3, Math.floor(x/2)].filter(n => n > 0 && n !== x);
        if (wrongsArr.length < 3) wrongsArr.push(x+4, x+5, x+6);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const options = shuffleArray([x, ...wrongs].map(n => `x = ${n}`));
        return { category: 'Lineare Gleichungen', question: `Löse im Kopf nach x auf: ${a}x - ${b} = ${c}`, options, correctAnswer: options.indexOf(`x = ${x}`), explanation: `1. Addiere ${b}: ${a}x = ${c+b}. 2. Teile durch ${a}: x = ${x}.` };
    } else {
        const a = Math.floor(Math.random()*6)+4;
        const c = Math.floor(Math.random()*3)+1;
        const x = Math.floor(Math.random()*8)+2;
        const b = Math.floor(Math.random()*10)+1;
        const d = a*x + b - c*x;
        let wrongsArr = [x+1, x-1, x+2, x-2, x*2, x+3, Math.floor(x/2)].filter(n => n > 0 && n !== x);
        if (wrongsArr.length < 3) wrongsArr.push(x+4, x+5, x+6);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const options = shuffleArray([x, ...wrongs].map(n => `x = ${n}`));
        return { category: 'Lineare Gleichungen', question: `Löse auf: ${a}x + ${b} = ${c === 1 ? '' : c}x + ${d}`, options, correctAnswer: options.indexOf(`x = ${x}`), explanation: `1. Subtrahiere ${c === 1 ? 'x' : c+'x'}: ${(a-c) === 1 ? 'x' : (a-c)+'x'} + ${b} = ${d}. 2. Subtrahiere ${b}: ${(a-c) === 1 ? 'x' : (a-c)+'x'} = ${d-b}. 3. Teile durch ${a-c}: x = ${x}.` };
    }
};

const genBruch = (diff) => {
    const wrapFrac = (el) => <span className="whitespace-nowrap">{el}</span>;
    if (diff === 'leicht') {
        const v = Math.random();
        if (v > 0.5) {
            const options = shuffleArray([{el: wrapFrac(<Frac top="3" bot="4" />), id: 'c'}, {el: wrapFrac(<Frac top="2" bot="6" />), id:'w1'}, {el: wrapFrac(<Frac top="1" bot="4" />), id:'w2'}, {el: wrapFrac(<Frac top="2" bot="4" />), id:'w3'}]);
            return { category: 'Bruchrechnen', question: <span>Was ergibt <span className="whitespace-nowrap"><Frac top="1" bot="2" /> + <Frac top="1" bot="4" /></span> ?</span>, options: options.map(o => o.el), correctAnswer: options.findIndex(o => o.id === 'c'), explanation: <span>Erweitere <Frac top="1" bot="2" /> auf Viertel: <Frac top="2" bot="4" />. Dann: <span className="whitespace-nowrap"><Frac top="2" bot="4" /> + <Frac top="1" bot="4" /> = <Frac top="3" bot="4" /></span>.</span> };
        } else {
            const options = shuffleArray([{el: wrapFrac(<Frac top="1" bot="2" />), id: 'c'}, {el: wrapFrac(<Frac top="1" bot="4" />), id:'w1'}, {el: wrapFrac(<Frac top="3" bot="4" />), id:'w2'}, {el: wrapFrac(<Frac top="1" bot="8" />), id:'w3'}]);
            return { category: 'Bruchrechnen', question: <span>Was ergibt <span className="whitespace-nowrap"><Frac top="3" bot="4" /> - <Frac top="1" bot="4" /></span> (gekürzt)?</span>, options: options.map(o => o.el), correctAnswer: options.findIndex(o => o.id === 'c'), explanation: <span><span className="whitespace-nowrap"><Frac top="3" bot="4" /> - <Frac top="1" bot="4" /> = <Frac top="2" bot="4" /></span>. Gekürzt mit 2 ergibt das <Frac top="1" bot="2" />.</span> };
        }
    } else if (diff === 'mittel') {
        const a = [2, 3][Math.floor(Math.random()*2)]; const b = [4, 5][Math.floor(Math.random()*2)];
        const top = a+b; const bot = a*b;
        const options = shuffleArray([{el: wrapFrac(<Frac top={top} bot={bot}/>), id: 'c'}, {el: wrapFrac(<Frac top="2" bot={a+b}/>), id:'w1'}, {el: wrapFrac(<Frac top={top+1} bot={bot}/>), id:'w2'}, {el: wrapFrac(<Frac top={top} bot={a+b}/>), id:'w3'}]);
        return { category: 'Bruchrechnen', question: <span>Addiere: <span className="whitespace-nowrap"><Frac top="1" bot={a} /> + <Frac top="1" bot={b} /></span></span>, options: options.map(o => o.el), correctAnswer: options.findIndex(o => o.id === 'c'), explanation: <span>Bringe beide auf den Hauptnenner {bot}. <span className="whitespace-nowrap"><Frac top={b} bot={bot} /> + <Frac top={a} bot={bot} /> = <Frac top={top} bot={bot} /></span>.</span> };
    } else {
        const a = 2; const b = 3; const c = 3; const d = 4;
        const options = shuffleArray([{el: wrapFrac(<Frac top="1" bot="2" />), id: 'c'}, {el: wrapFrac(<Frac top="5" bot="7" />), id:'w1'}, {el: wrapFrac(<Frac top="6" bot="12" />), id:'w2'}, {el: wrapFrac(<Frac top="8" bot="9" />), id:'w3'}]);
        return { category: 'Bruchrechnen', question: <span>Multipliziere und kürze: <span className="whitespace-nowrap"><Frac top={a} bot={b} /> · <Frac top={c} bot={d} /></span></span>, options: options.map(o => o.el), correctAnswer: options.findIndex(o => o.id === 'c'), explanation: <span>Zähler mal Zähler, Nenner mal Nenner: <Frac top={a*c} bot={b*d} />. Gekürzt mit 6 ergibt das <Frac top="1" bot="2" />.</span> };
    }
};

const genGeo = (diff) => {
    if (diff === 'leicht') {
        const k = [2, 3, 4, 5, 6][Math.floor(Math.random()*5)]; const k2 = k*k;
        let wrongsArr = [k*2, k, k*k*k, k2+2, k2-2, k*3].filter(n => n !== k2);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const options = shuffleArray([k2, ...wrongs].map(n => `Faktor ${n}`));
        return { category: 'Geometrie (Fläche)', question: `Die Seitenlänge eines Quadrats wird mit k = ${k} vergrößert. Mit welchem Faktor wächst der Flächeninhalt?`, options, correctAnswer: options.indexOf(`Faktor ${k2}`), explanation: `Bei Flächen ändert sich der Inhalt quadratisch (k²). Also rechnen wir: ${k}² = ${k2}.` };
    } else if (diff === 'mittel') {
        const subtype = Math.floor(Math.random()*3);
        const k = [2, 3, 4, 5, 10][Math.floor(Math.random()*5)]; const k3 = k*k*k;
        let questionText, expl;
        if (subtype === 0) {
            questionText = `Der Radius einer Kugel wird mit dem Faktor k = ${k} vergrößert. Mit welchem Faktor wächst das Volumen?`;
            expl = `Im Dreidimensionalen ändert sich das Volumen mit dem Faktor k³. Hier ist k = ${k}. Also: ${k}³ = ${k} · ${k} · ${k} = ${k3}.`;
        } else if (subtype === 1) {
            questionText = `Der Radius einer Halbkugel wird ver-${k}-facht. Um welchen Faktor wächst das Volumen?`;
            expl = `Auch eine Halbkugel ist ein 3D-Körper — das Volumen wächst mit k³. Mit k = ${k}: ${k}³ = ${k3}.`;
        } else {
            questionText = `Der Durchmesser einer Kugel wird mit dem Faktor ${k} vergrößert. Mit welchem Faktor wächst das Volumen?`;
            expl = `Wenn der Durchmesser ver-${k}-facht wird, ver-${k}-facht sich auch der Radius (k = ${k}). Das Volumen wächst mit k³ = ${k}³ = ${k3}.`;
        }
        let wrongsArr = [k*2, k*k, k, k3+k, k3-k, k*4].filter(n => n !== k3);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const options = shuffleArray([k3, ...wrongs].map(n => `Faktor ${n}`));
        return { category: 'Geometrie (Volumen)', question: questionText, options, correctAnswer: options.indexOf(`Faktor ${k3}`), explanation: expl };
    } else {
        const k = [2, 3, 4, 5][Math.floor(Math.random()*4)]; const k3 = k*k*k;
        let wrongsArr = [k3, k*k, Math.floor(k3/3), k+1, k-1, k*2].filter(n => n > 0 && n !== k);
        if (wrongsArr.length < 3) wrongsArr.push(k+2, k+3, k+4);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const options = shuffleArray([k, ...wrongs].map(n => `k = ${n}`));
        return { category: 'Geometrie (Streckung)', question: `Das Volumen eines Würfels hat sich um den Faktor ${k3} vergrößert. Welcher Streckungsfaktor k wurde für die Kantenlänge verwendet?`, options, correctAnswer: options.indexOf(`k = ${k}`), explanation: `Das Volumen wächst mit k³. Wir suchen also die Zahl, die dreimal mit sich selbst multipliziert ${k3} ergibt (die 3. Wurzel). Das ist ${k}.` };
    }
};

const genProb = (diff) => {
    const wrapFrac = (el) => <span className="whitespace-nowrap">{el}</span>;
    if (diff === 'leicht') {
        const tot = 10; const red = Math.floor(Math.random()*5)+2;
        const options = shuffleArray([{el: wrapFrac(<Frac top={red} bot={tot}/>), id: 'c'}, {el: wrapFrac(<Frac top={red-1} bot={tot}/>), id: 'w1'}, {el: wrapFrac(<Frac top={tot} bot={red}/>), id: 'w2'}, {el: wrapFrac(<Frac top={red+1} bot={tot}/>), id: 'w3'}]);
        return { category: 'Wahrscheinlichkeit', question: `In einer Urne liegen ${tot} Kugeln, davon sind ${red} rot. Wie groß ist die Wahrscheinlichkeit, eine rote zu ziehen?`, options: options.map(o=>o.el), correctAnswer: options.findIndex(o=>o.id==='c'), explanation: <span>Die Formel lautet: (Günstige Ergebnisse) / (Alle Ergebnisse) = <Frac top={red} bot={tot}/>.</span> };
    } else if (diff === 'mittel') {
        const total = [20, 40, 50, 60, 100][Math.floor(Math.random() * 5)];
        const fracs = [{ t: 1, b: 4, v: 0.25 }, { t: 1, b: 5, v: 0.2 }, { t: 1, b: 10, v: 0.1 }];
        const f = fracs[Math.floor(Math.random() * 3)];
        const black = total * f.v;
        if (!Number.isInteger(black)) return genProb(diff);
        let wrongsArr = [black+2, black-2, black+5, black*2, total-black, black/2].filter(n => n > 0 && n !== black && Number.isInteger(n));
        if (wrongsArr.length < 3) wrongsArr.push(black+1, black+3, black+4);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const options = shuffleArray([black, ...wrongs].map(n => `${n} Kugeln`));
        return { category: 'Wahrscheinlichkeit', question: <span>In einer Urne sind {total} Kugeln. Die Wahrscheinlichkeit für "Schwarz" beträgt <span className="whitespace-nowrap"><Frac top={f.t} bot={f.b} /></span>. Wie viele schwarze Kugeln gibt es?</span>, options, correctAnswer: options.indexOf(`${black} Kugeln`), explanation: <span>Ein Anteil von <span className="whitespace-nowrap"><Frac top={f.t} bot={f.b} /></span> von {total} Kugeln entspricht genau {total} / {f.b} = {black} Kugeln.</span> };
    } else {
        const red = 3; const blue = 2; const tot = red+blue;
        const options = shuffleArray([{el: wrapFrac(<Frac top="3" bot="10"/>), id: 'c'}, {el: wrapFrac(<Frac top="9" bot="25"/>), id: 'w1'}, {el: wrapFrac(<Frac top="6" bot="25"/>), id: 'w2'}, {el: wrapFrac(<Frac top="2" bot="5"/>), id: 'w3'}]);
        return { category: 'Wahrscheinlichkeit', question: `In einer Urne sind ${red} rote und ${blue} blaue Kugeln. Du ziehst 2 Kugeln OHNE Zurücklegen. Wahrscheinlichkeit für "rot und dann nochmal rot"?`, options: options.map(o=>o.el), correctAnswer: options.findIndex(o=>o.id==='c'), explanation: <span>Erster Zug: <Frac top="3" bot="5"/>. Beim zweiten Zug ist eine rote weniger da: <Frac top="2" bot="4"/>. Multipliziert: <span className="whitespace-nowrap"><Frac top="3" bot="5"/> · <Frac top="2" bot="4"/> = <Frac top="6" bot="20"/></span>, gekürzt <Frac top="3" bot="10"/>.</span> };
    }
};

const genQuad = (diff) => {
    if (diff === 'leicht') {
        let c = Math.floor(Math.random()*15)-7;
        if(c===0) c = 1;
        const correct = `S(0 | ${c})`;
        let wrongsArr = [`S(${c} | 0)`, `S(0 | ${-c})`, `S(${-c} | 0)`, `S(1 | ${c})`, `S(${c} | ${c})`].filter(s => s !== correct);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const options = shuffleArray([correct, ...wrongs]);
        return { category: 'Quadratische Funktionen', question: <span>Lies den Scheitelpunkt der Parabel ab: <span className="whitespace-nowrap">y = x<sup>2</sup> {c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}</span></span>, options, correctAnswer: options.indexOf(correct), explanation: `Die Parabel ist nur auf der y-Achse verschoben, nicht auf der x-Achse. Daher liegt der Scheitelpunkt bei x=0 und y=${c}.` };
    } else if (diff === 'mittel') {
        if (Math.random() > 0.5) {
            // Variante 1: Scheitelpunkt aus Scheitelpunktform ablesen
            const d = Math.floor(Math.random()*5)+1; const signD = Math.random()>0.5 ? 1 : -1;
            const e = Math.floor(Math.random()*5)+1; const signE = Math.random()>0.5 ? 1 : -1;
            const correct = `S(${signD * d} | ${signE * e})`;
            let wrongsArr = [`S(${-signD * d} | ${signE * e})`, `S(${signD * d} | ${-signE * e})`, `S(${-signD * d} | ${-signE * e})`, `S(${signE * e} | ${signD * d})`].filter(s => s !== correct);
            const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
            const options = shuffleArray([correct, ...wrongs]);
            return { category: 'Quadratische Funktionen', question: <span>Lies den Scheitelpunkt ab: <span className="whitespace-nowrap">y = (x {signD < 0 ? '+ ' + d : '- ' + d})<sup>2</sup> {signE > 0 ? '+ ' + e : '- ' + e}</span></span>, options, correctAnswer: options.indexOf(correct), explanation: `Aus der Scheitelpunktform y = (x - d)² + e liest man den Scheitel S(d | e) ab. Achte auf das umgedrehte Vorzeichen in der Klammer!` };
        } else {
            // Variante 2: Welcher Punkt liegt auf der Parabel y = x² + c?
            let c = Math.floor(Math.random()*11) - 5;
            if (c === 0) c = 2;
            const xVal = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random()*3) + 1);
            const yCorrect = xVal*xVal + c;
            const correct = `P(${xVal} | ${yCorrect})`;
            const wrongsArr = [`P(${xVal} | ${-yCorrect})`, `P(${-xVal} | ${-yCorrect})`, `P(${xVal*xVal} | ${yCorrect+c})`, `P(${xVal} | ${yCorrect+1})`].filter(s => s !== correct);
            const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
            const options = shuffleArray([correct, ...wrongs]);
            return { category: 'Quadratische Funktionen', question: <span>Welcher Punkt liegt auf der Parabel <span className="whitespace-nowrap">p: y = x²{c>=0?' + '+c:' − '+Math.abs(c)}</span> ?</span>, options, correctAnswer: options.indexOf(correct), explanation: `Setze x = ${xVal} in die Gleichung ein: (${xVal})²${c>=0?' + '+c:' − '+Math.abs(c)} = ${xVal*xVal}${c>=0?' + '+c:' − '+Math.abs(c)} = ${yCorrect}. Also liegt P(${xVal} | ${yCorrect}) auf der Parabel.` };
        }
    } else {
        const xs = Math.floor(Math.random() * 5) + 1; const ys = Math.floor(Math.random() * 5) + 1;
        const p = -2 * xs; const q = xs*xs + ys;
        const correct = `S(${xs} | ${ys})`;
        let wrongsArr = [`S(${-xs} | ${ys})`, `S(${xs} | ${-ys})`, `S(${-xs} | ${-ys})`, `S(${ys} | ${xs})`].filter(s => s !== correct);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const options = shuffleArray([correct, ...wrongs]);
        return { category: 'Quadratische Funktionen', question: <span>Wo liegt der Scheitelpunkt von <span className="whitespace-nowrap">y = x<sup>2</sup> {p >= 0 ? '+ ' + p : '- ' + Math.abs(p)}x {q >= 0 ? '+ ' + q : '- ' + Math.abs(q)}</span> ?</span>, options, correctAnswer: options.indexOf(correct), explanation: `Nutze die Formel für die x-Koordinate: xs = -p / 2 = ${-p} / 2 = ${xs}. Setzt man ${xs} in die Gleichung ein, erhält man ys = ${ys}. Also ${correct}.` };
    }
};

const genPotenz = (diff) => {
    const wrapPotenz = (base, exp) => <span className="whitespace-nowrap">{base}<sup>{exp}</sup></span>;
    if (diff === 'leicht') {
        const a = Math.floor(Math.random()*6)+2; const b = Math.floor(Math.random()*5)+2;
        const correct = a+b;
        let wrongsArr = [a*b, a-b, 2*(a+b), Math.pow(a,b)].filter(n => n !== correct && n > 0);
        if(wrongsArr.length < 3) wrongsArr.push(correct+1, correct+2, correct+3);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const options = shuffleArray([{ el: wrapPotenz("x", correct), id: 'c' }, ...wrongs.map((w,i)=>({ el: wrapPotenz("x", w), id: `w${i}` }))]);
        return { category: 'Potenzgesetze', question: <span>Fasse zusammen: <span className="whitespace-nowrap">x<sup>{a}</sup> · x<sup>{b}</sup></span></span>, options: options.map(o=>o.el), correctAnswer: options.findIndex(o=>o.id==='c'), explanation: <span>Bei Multiplikation mit gleicher Basis werden die Exponenten addiert: {a} + {b} = {correct}. Also <span className="whitespace-nowrap">x<sup>{correct}</sup></span>.</span> };
    } else if (diff === 'mittel') {
        if (Math.random() > 0.5) {
            // Variante 1: (x^a)^b
            const a = Math.floor(Math.random()*4)+2; const b = Math.floor(Math.random()*4)+2;
            const correct = a*b;
            let wrongsArr = [a+b, Math.pow(a,b), 2*(a*b), a*b+1, a*b-1].filter(n => n !== correct && n > 0);
            if(wrongsArr.length < 3) wrongsArr.push(correct+2, correct+3, correct+4);
            const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
            const options = shuffleArray([{ el: wrapPotenz("x", correct), id: 'c' }, ...wrongs.map((w,i)=>({ el: wrapPotenz("x", w), id: `w${i}` }))]);
            return { category: 'Potenzgesetze', question: <span>Fasse zusammen: <span className="whitespace-nowrap">(x<sup>{a}</sup>)<sup>{b}</sup></span></span>, options: options.map(o=>o.el), correctAnswer: options.findIndex(o=>o.id==='c'), explanation: <span>Wird eine Potenz potenziert, werden die Exponenten multipliziert: {a} · {b} = {correct}. Also <span className="whitespace-nowrap">x<sup>{correct}</sup></span>.</span> };
        } else {
            // Variante 2: Potenzgleichung b^x = ... (MSA-typisch)
            const base = [2, 3, 5][Math.floor(Math.random()*3)];
            const exp = [-3, -2, -1, 2, 3][Math.floor(Math.random()*5)];
            const result = Math.pow(base, Math.abs(exp));
            const isNeg = exp < 0;
            const rhs = isNeg
                ? <span className="whitespace-nowrap"><Frac top="1" bot={result} /></span>
                : <span>{result}</span>;
            const correct = `x = ${exp}`;
            const wrongsArr = [`x = ${-exp}`, `x = ${result}`, `x = ${exp + 1}`].filter(w => w !== correct);
            const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
            const opts = shuffleArray([correct, ...wrongs]);
            return {
                category: 'Potenzgleichung',
                question: <span>Bestimme x: <span className="whitespace-nowrap">{base}<sup>x</sup> = {rhs}</span></span>,
                options: opts,
                correctAnswer: opts.indexOf(correct),
                explanation: isNeg
                    ? <span><span className="whitespace-nowrap"><Frac top="1" bot={result} /> = <Frac top="1" bot={<span>{base}<sup>{Math.abs(exp)}</sup></span>} /> = {base}<sup>{exp}</sup></span>. Also x = {exp}.</span>
                    : <span>{result} = <span className="whitespace-nowrap">{base}<sup>{exp}</sup></span>. Also x = {exp}.</span>
            };
        }
    } else {
        const base = [2, 3][Math.floor(Math.random()*2)]; const e = -Math.floor(Math.random()*3)-2;
        const ans = Math.pow(base, Math.abs(e));
        const options = shuffleArray([{el: <span className="whitespace-nowrap"><Frac top="1" bot={ans}/></span>, id:'c'}, {el: `-${ans}`, id:'w1'}, {el: <span className="whitespace-nowrap"><Frac top="-1" bot={ans}/></span>, id:'w2'}, {el: String(ans), id:'w3'}]);
        return { category: 'Potenzgesetze', question: <span>Berechne im Kopf: <span className="whitespace-nowrap">{base}<sup>{e}</sup></span></span>, options: options.map(o=>o.el), correctAnswer: options.findIndex(o=>o.id==='c'), explanation: <span>Ein negativer Exponent bedeutet den Kehrbruch. <span className="whitespace-nowrap">{base}<sup>{e}</sup></span> ist also <span className="whitespace-nowrap">1 / {base}<sup>{Math.abs(e)}</sup></span>. Das ergibt <span className="whitespace-nowrap"><Frac top="1" bot={ans}/></span>.</span> };
    }
};

const genDef = (diff) => {
    const wrapFrac = (el) => <span className="whitespace-nowrap">{el}</span>;
    if (diff === 'leicht') {
        const a = Math.floor(Math.random() * 15) - 7; if(a===0) return genDef('leicht');
        const sign = a > 0 ? `+ ${a}` : `- ${Math.abs(a)}`; const val = -a;
        const correctD = `D = ℝ \\ {${val}}`;
        let wrongsArr = [`D = ℝ \\ {${-val}}`, `D = ℝ \\ {0}`, `D = ℝ`, `D = ℝ \\ {1}`].filter(s => s !== correctD);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const opts = shuffleArray([correctD, ...wrongs]);
        return { category: 'Definitionsmenge', question: <span>Welche Definitionsmenge hat der Term: {wrapFrac(<Frac top="1" bot={`x ${sign}`}/>)} ?</span>, options: opts, correctAnswer: opts.indexOf(correctD), explanation: `Der Nenner darf nicht 0 werden. Die Gleichung x ${sign} = 0 liefert x = ${val}. Dieser Wert muss ausgeschlossen werden.` };
    } else if (diff === 'mittel') {
        const a = Math.floor(Math.random()*6)+1; const b = a + Math.floor(Math.random()*5)+1;
        const correctD = `D = ℝ \\ {${a}; ${b}}`;
        let wrongsArr = [`D = ℝ \\ {${-a}; ${-b}}`, `D = ℝ \\ {${a}}`, `D = ℝ \\ {0; ${a}}`, `D = ℝ \\ {${b}}`].filter(s => s !== correctD);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const opts = shuffleArray([correctD, ...wrongs]);
        return { category: 'Definitionsmenge', question: <span>Finde D für: {wrapFrac(<Frac top="5" bot={`(x - ${a})(x - ${b})`}/>)}</span>, options: opts, correctAnswer: opts.indexOf(correctD), explanation: `Ein Produkt ist 0, wenn einer der Faktoren 0 ist. Das passiert hier bei x = ${a} und x = ${b}. Beide müssen aus ℝ ausgeschlossen werden.` };
    } else {
        const a = Math.floor(Math.random()*6)+2; const a2 = a*a;
        const correctD = `D = ℝ \\ {${-a}; ${a}}`;
        let wrongsArr = [`D = ℝ \\ {${a2}}`, `D = ℝ \\ {${a}}`, `D = ℝ \\ {0; ${a}}`, `D = ℝ \\ {${-a2}; ${a2}}`].filter(s => s !== correctD);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const opts = shuffleArray([correctD, ...wrongs]);
        return { category: 'Definitionsmenge', question: <span>Bestimme D: {wrapFrac(<Frac top="2" bot={`x² - ${a2}`}/>)}</span>, options: opts, correctAnswer: opts.indexOf(correctD), explanation: `Der Nenner x² - ${a2} wird 0, wenn x² = ${a2} ist. Dies gilt für x = ${a} UND x = ${-a}. Beide Werte müssen ausgeschlossen werden.` };
    }
};

// Neuer Generator: Lineare Funktionen (häufigstes MSA-Teil-A-Thema)
const genGerade = (diff) => {
    const fmtM = (m) => m === 1 ? '' : m === -1 ? '-' : (Number.isInteger(m) ? m + '' : fDe(m));
    const fmtB = (b) => b >= 0 ? ' + ' + b : ' − ' + Math.abs(b);
    if (diff === 'leicht') {
        // Welcher Punkt liegt auf der Geraden?
        const m = [1, 2, 3, -1, -2][Math.floor(Math.random()*5)];
        const b = getRandomInt(-4, 4);
        const x = getRandomInt(-3, 3);
        const y = m*x + b;
        const correct = `P(${x} | ${y})`;
        const wrongsArr = [`P(${x} | ${y+1})`, `P(${x+1} | ${y})`, `P(${-x} | ${y})`, `P(${x} | ${y-2})`].filter(s => s !== correct);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const options = shuffleArray([correct, ...wrongs]);
        return {
            category: 'Lineare Funktionen',
            question: <span>Welcher Punkt liegt auf der Geraden <span className="whitespace-nowrap">g: y = {fmtM(m)}x{fmtB(b)}</span> ?</span>,
            options,
            correctAnswer: options.indexOf(correct),
            explanation: <span>Setze die x-Koordinate ein und prüfe den y-Wert: <span className="whitespace-nowrap">y = {fmtM(m)}·{x}{fmtB(b)} = {y}</span>. Also liegt {correct} auf g.</span>
        };
    } else if (diff === 'mittel') {
        // Fehlende Koordinate auf der Geraden
        const mChoices = [2, 3, -1, -2, 0.5, -0.5];
        const m = mChoices[Math.floor(Math.random()*mChoices.length)];
        const b = getRandomInt(-3, 5);
        let x = getRandomInt(-4, 4);
        if (m === 0.5 && x % 2 !== 0) x = x + (x > 0 ? 1 : -1);
        if (m === -0.5 && x % 2 !== 0) x = x + (x > 0 ? 1 : -1);
        if (x === 0) x = 2;
        const y = m*x + b;
        if (!Number.isInteger(y) && !Number.isInteger(y*2)) return genGerade(diff);
        const correct = `x = ${x}`;
        const wrongsArr = [`x = ${-x}`, `x = ${fDe(y)}`, `x = ${x+2}`, `x = ${x-2}`].filter(s => s !== correct);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const options = shuffleArray([correct, ...wrongs]);
        return {
            category: 'Lineare Funktionen',
            question: <span>Auf <span className="whitespace-nowrap">g: y = {fmtM(m)}x{fmtB(b)}</span> liegt <span className="whitespace-nowrap">P(x | {fDe(y)})</span>. Bestimme x.</span>,
            options,
            correctAnswer: options.indexOf(correct),
            explanation: `Setze y = ${fDe(y)} in die Gleichung ein und löse nach x auf: ${fDe(y)} = ${fmtM(m)}·x${fmtB(b)}. Das ergibt x = ${x}.`
        };
    } else {
        // Senkrechtheit prüfen — MSA-Klassiker
        const senkrecht = Math.random() > 0.5;
        const m1Choices = [2, -2, 3, -3, 0.5, -0.5, 4, -4, 1.5, -1.5];
        const m1 = m1Choices[Math.floor(Math.random()*m1Choices.length)];
        let m2;
        if (senkrecht) m2 = -1/m1;
        else { do { m2 = m1Choices[Math.floor(Math.random()*m1Choices.length)]; } while (Math.abs(m1*m2 + 1) < 1e-9 || m2 === m1); }
        const b1 = getRandomInt(-3, 3); const b2 = getRandomInt(-3, 3);
        const correct = senkrecht ? 'Ja, denn m₁ · m₂ = -1.' : 'Nein, denn m₁ · m₂ ≠ -1.';
        const allOpts = [
            'Ja, denn m₁ · m₂ = -1.',
            'Nein, denn m₁ · m₂ ≠ -1.',
            'Ja, denn die Steigungen sind verschieden.',
            'Nein, denn die y-Achsenabschnitte sind unterschiedlich.'
        ];
        const options = shuffleArray(allOpts);
        return {
            category: 'Lineare Funktionen',
            question: <span>Stehen die Geraden senkrecht aufeinander?<br/>
                <span className="whitespace-nowrap">g<sub>1</sub>: y = {fmtM(m1)}x{fmtB(b1)}</span>;{' '}
                <span className="whitespace-nowrap">g<sub>2</sub>: y = {fmtM(m2)}x{fmtB(b2)}</span></span>,
            options,
            correctAnswer: options.indexOf(correct),
            explanation: `Zwei Geraden stehen senkrecht aufeinander, wenn m₁ · m₂ = -1 gilt. Hier: ${fDe(m1)} · ${fDe(m2)} = ${fDe(Math.round(m1*m2*1000)/1000)}. ${senkrecht ? 'Das ergibt -1 — also stehen sie senkrecht aufeinander.' : 'Das ergibt NICHT -1 — also stehen sie nicht senkrecht aufeinander.'}`
        };
    }
};

const generators = [
    { id: 'prozent', fn: genProzent }, { id: 'linear', fn: genLinear }, { id: 'bruch', fn: genBruch }, { id: 'geo', fn: genGeo },
    { id: 'prob', fn: genProb }, { id: 'quad', fn: genQuad }, { id: 'potenz', fn: genPotenz }, { id: 'def', fn: genDef },
    { id: 'gerade', fn: genGerade }
];

// ==========================================
// TRAINER
// ==========================================
const KopfrechenTrainer = () => {
    const [difficulty, setDifficulty] = useState('mittel');
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

    const [currentQuestion, setCurrentQuestion] = useState(() => generateNextQuestion('mittel', []));
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
                return next.length > 4 ? next.slice(next.length - 4) : next;
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
        } else { setStreak(0); adaptive.recordWrong(); }
    };

    const loadNextQuestion = () => {
        const newQ = generateNextQuestion(difficulty, recentCategories);
        setCurrentQuestion(newQ);
        if (difficulty !== 'pruefung') {
            setRecentCategories(prev => {
                const next = [...prev, newQ.categoryId];
                return next.length > 4 ? next.slice(next.length - 4) : next;
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
                            <span className="relative z-10 bg-amber-200 text-amber-800 px-2 py-1 rounded text-xs font-bold shadow-sm uppercase tracking-wider">{currentQuestion.sourceLabel}</span>
                        )}
                        <div className="absolute -right-4 -top-4 opacity-10"><CalculatorOff className="w-24 h-24" /></div>
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="mb-8 min-h-[60px] flex items-center">
                            <h2 className="text-xl md:text-2xl font-semibold text-slate-800 leading-snug">{currentQuestion.question}</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                            {currentQuestion.options.map((option, index) => (
                                <button key={index} onClick={() => handleOptionSelect(index)} disabled={isAnswerChecked} className={`text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${getOptionStyles(index)}`}>
                                    <span className="font-medium text-[16px] leading-relaxed break-words">{option}</span>
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
                                        <div><strong className="block mb-1 text-sky-800">Tipp / Lösungsweg:</strong> <div className="mt-1 leading-relaxed">{currentQuestion.explanation}</div></div>
                                    </div>
                                )}
                            </div>
                        )}

                        {isAnswerChecked && (
                            <div className="mb-8 p-5 bg-sky-50 border border-sky-100 rounded-xl animate-fade-in flex flex-col sm:flex-row gap-4">
                                <div className="shrink-0 pt-1"><HelpCircle className="w-6 h-6 text-sky-600" /></div>
                                <div>
                                    <h3 className="text-sm font-bold text-sky-800 uppercase tracking-wider mb-1">Erklärung</h3>
                                    <p className="text-sky-900 leading-relaxed font-medium">{currentQuestion.explanation}</p>
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
