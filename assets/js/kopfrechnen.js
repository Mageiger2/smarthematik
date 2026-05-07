// ==========================================
// kopfrechnen.js — KopfrechenTrainer (inkl. aller Generatoren)
// (Wird inline mit shared.js zusammen pro App-Seite kompiliert.)
// ==========================================

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
        const k = [2, 3, 4, 5, 10][Math.floor(Math.random()*5)]; const k3 = k*k*k;
        let wrongsArr = [k*2, k*k, k, k3+k, k3-k, k*4].filter(n => n !== k3);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const options = shuffleArray([k3, ...wrongs].map(n => `Faktor ${n}`));
        return { category: 'Geometrie (Volumen)', question: `Der Radius einer Kugel wird mit dem Faktor k = ${k} vergrößert. Mit welchem Faktor wächst das Volumen?`, options, correctAnswer: options.indexOf(`Faktor ${k3}`), explanation: `Im Dreidimensionalen ändert sich das Volumen mit dem Faktor k³. Hier ist k = ${k}. Also rechnen wir: ${k}³ = ${k} · ${k} · ${k} = ${k3}.` };
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
        const d = Math.floor(Math.random()*5)+1; const signD = Math.random()>0.5 ? 1 : -1;
        const e = Math.floor(Math.random()*5)+1; const signE = Math.random()>0.5 ? 1 : -1;
        const correct = `S(${signD * d} | ${signE * e})`;
        let wrongsArr = [`S(${-signD * d} | ${signE * e})`, `S(${signD * d} | ${-signE * e})`, `S(${-signD * d} | ${-signE * e})`, `S(${signE * e} | ${signD * d})`].filter(s => s !== correct);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const options = shuffleArray([correct, ...wrongs]);
        return { category: 'Quadratische Funktionen', question: <span>Lies den Scheitelpunkt ab: <span className="whitespace-nowrap">y = (x {signD < 0 ? '+ ' + d : '- ' + d})<sup>2</sup> {signE > 0 ? '+ ' + e : '- ' + e}</span></span>, options, correctAnswer: options.indexOf(correct), explanation: `Aus der Scheitelpunktform y = (x - d)² + e liest man den Scheitel S(d | e) ab. Achte auf das umgedrehte Vorzeichen in der Klammer!` };
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
        const a = Math.floor(Math.random()*4)+2; const b = Math.floor(Math.random()*4)+2;
        const correct = a*b;
        let wrongsArr = [a+b, Math.pow(a,b), 2*(a*b), a*b+1, a*b-1].filter(n => n !== correct && n > 0);
        if(wrongsArr.length < 3) wrongsArr.push(correct+2, correct+3, correct+4);
        const wrongs = Array.from(new Set(wrongsArr)).slice(0, 3);
        const options = shuffleArray([{ el: wrapPotenz("x", correct), id: 'c' }, ...wrongs.map((w,i)=>({ el: wrapPotenz("x", w), id: `w${i}` }))]);
        return { category: 'Potenzgesetze', question: <span>Fasse zusammen: <span className="whitespace-nowrap">(x<sup>{a}</sup>)<sup>{b}</sup></span></span>, options: options.map(o=>o.el), correctAnswer: options.findIndex(o=>o.id==='c'), explanation: <span>Wird eine Potenz potenziert, werden die Exponenten multipliziert: {a} · {b} = {correct}. Also <span className="whitespace-nowrap">x<sup>{correct}</sup></span>.</span> };
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

const generators = [
    { id: 'prozent', fn: genProzent }, { id: 'linear', fn: genLinear }, { id: 'bruch', fn: genBruch }, { id: 'geo', fn: genGeo },
    { id: 'prob', fn: genProb }, { id: 'quad', fn: genQuad }, { id: 'potenz', fn: genPotenz }, { id: 'def', fn: genDef }
];

// ==========================================
// TRAINER
// ==========================================
const KopfrechenTrainer = () => {
    const [difficulty, setDifficulty] = useState('mittel');
    const [recentCategories, setRecentCategories] = useState([]);

    const generateNextQuestion = (diff, recentList) => {
        let available = generators.filter(g => !recentList.includes(g.id));
        if (available.length === 0) available = generators;
        const selected = available[Math.floor(Math.random() * available.length)];
        return { ...selected.fn(diff), categoryId: selected.id };
    };

    const [currentQuestion, setCurrentQuestion] = useState(() => generateNextQuestion('mittel', []));
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [tipRevealed, setTipRevealed] = useState(false);

    const [streak, setStreak] = useState(() => getStorage('smarth_streak_kopf', 0));
    const [showAnim, setShowAnim] = useState(false);

    useEffect(() => { setStorage('smarth_streak_kopf', streak); }, [streak]);

    const handleDifficultyChange = (newDiff) => {
        setDifficulty(newDiff);
        const newQ = generateNextQuestion(newDiff, recentCategories);
        setCurrentQuestion(newQ);
        setRecentCategories(prev => {
            const next = [...prev, newQ.categoryId];
            return next.length > 4 ? next.slice(next.length - 4) : next;
        });
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
        } else setStreak(0);
    };

    const loadNextQuestion = () => {
        const newQ = generateNextQuestion(difficulty, recentCategories);
        setCurrentQuestion(newQ);
        setRecentCategories(prev => {
            const next = [...prev, newQ.categoryId];
            return next.length > 4 ? next.slice(next.length - 4) : next;
        });
        setSelectedOption(null); setIsAnswerChecked(false); setTipRevealed(false);
    };

    const handleSkip = () => { setStreak(0); loadNextQuestion(); };
    const handleShowTip = () => { setTipRevealed(true); setStreak(0); };

    const getOptionStyles = (index) => {
        if (!isAnswerChecked) return selectedOption === index ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-200' : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50';
        if (index === currentQuestion.correctAnswer) return 'border-green-500 bg-green-50 text-green-800 ring-2 ring-green-200';
        if (index === selectedOption && index !== currentQuestion.correctAnswer) return 'border-red-500 bg-red-50 text-red-800 ring-2 ring-red-200';
        return 'border-slate-200 opacity-50';
    };

    return (
        <div className="page-transition max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {showAnim && <CelebrationOverlay />}
            <header className="bg-sky-500 text-sky-950 shadow-md p-6 rounded-xl mb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 text-white">
                        <CalculatorOff className="w-8 h-8" />
                        <div><h1 className="text-2xl font-bold tracking-tight flex items-center">Kopfrechnen <span className="hidden sm:inline text-sky-200 text-lg font-normal border-l-2 border-sky-400 pl-2 ml-2">MSA Training</span></h1></div>
                    </div>
                    <div className="bg-sky-600 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm flex items-center text-white">
                        <Target className="w-4 h-4 mr-2 text-sky-200" /> Streak: {streak}
                    </div>
                </div>
            </header>

            <DifficultyMenu theme="sky" active={difficulty} onChange={handleDifficultyChange} options={[{id: 'leicht', label: 'Leicht'}, {id: 'mittel', label: 'Mittel'}, {id: 'schwer', label: 'Schwer'}]} />

            <main className="space-y-6 relative">
                <div className="bg-white rounded-3xl shadow-md overflow-hidden border border-slate-200">
                    <div className="bg-sky-50 px-6 py-4 border-b border-sky-200 flex justify-between items-center relative overflow-hidden">
                        <div className="relative z-10 flex items-center text-sky-900 font-bold text-lg"><BookOpen className="w-5 h-5 mr-2 text-sky-600" /> {currentQuestion.category}</div>
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

                        <div className="flex justify-between items-center border-t border-slate-100 pt-6 mt-4">
                            {!isAnswerChecked ? (
                                <>
                                    <button onClick={handleSkip} className="flex items-center gap-2 py-3 px-5 rounded-xl font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all">
                                        <FastForward className="w-5 h-5" /> <span className="hidden sm:inline">Überspringen</span>
                                    </button>
                                    <button onClick={handleCheckAnswer} disabled={selectedOption === null} className={`py-3 px-8 rounded-xl font-semibold transition-all flex items-center ${selectedOption !== null ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-md transform hover:-translate-y-0.5' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                                        Antwort prüfen <ArrowRight className="w-5 h-5 ml-2" />
                                    </button>
                                </>
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
