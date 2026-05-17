// ==========================================
// bruchgleichungen.js — BruchgleichungsTrainer (inkl. Generators und hardcoded problems)
// (Wird inline mit shared.js zusammen pro App-Seite kompiliert.)
// ==========================================

// ==========================================
// GENERATORS & DATA
// ==========================================
const generateTemplate1 = () => { // Leicht
    while(true) {
        let x1 = getRandomInt(-6, 6) || 1; let x2 = getRandomInt(-6, 6) || 2;
        if (x1 === x2 || x1 + x2 === 0) continue;
        let p = -(x1 + x2); let q = x1 * x2;
        let C = getRandomInt(2, 4); let x_def = getRandomInt(1, 5);
        if (x1 === x_def || x2 === x_def || x_def === 0 || x1 === 0 || x2 === 0) continue;
        let D = -C * x_def; let A = D - C * p; let B = -C * q;
        if (A === 0) continue;
        let topStr = `${formatTerm(A, true, 'x')} ${formatTerm(B)}`.trim();
        let botStr = `${C}x ${formatTerm(D)}`; let multLeft = `${formatTerm(A, true, 'x')}${formatTerm(B)}`; if (multLeft.startsWith('+')) multLeft = multLeft.substring(1);
        return {
            id: Math.random(), diff: "Leicht", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top={topStr} bot={botStr} /><span className="mx-2">=</span><span>x</span></div>,
            steps: {
                def: { expected: [x_def.toString()], inputs: 1 }, hn: { expected: [`${C}x${formatTerm(D)}`, `${C}*(x-${x_def})`, `${C}(x-${x_def})`] }, multLeft: { expected: [multLeft] }, multRight: { expected: [`${C}x^2${formatTerm(D, false, 'x')}`, `x(${botStr})`] }, zusammen: { expected: [`x^2${formatTerm(p, false, 'x')}${formatTerm(q)}=0`, `0=x^2${formatTerm(p, false, 'x')}${formatTerm(q)}`] }, pq_p: { expected: [p.toString()] }, pq_q: { expected: [q.toString()] }, pq_x1x2: { expected: [x1.toString(), x2.toString()], inputs: 2 }, lm: { expected: [x1.toString(), x2.toString()], inputs: 2 }
            }
        };
    }
};

const generateTemplate2 = () => { // Mittel
    while(true) {
        let A = getRandomInt(-8, 8); let B = getRandomInt(-8, 8); let C = getRandomInt(1, 6);
        if (A===0 || B===0 || A+B+C===0) continue;
        let p = -(A+B+C); let q = A*C; let D_disc = p*p/4 - q;
        if (D_disc >= 0 && Number.isInteger(Math.sqrt(D_disc))) {
            let rootD = Math.sqrt(D_disc); let x1 = -p/2 + rootD; let x2 = -p/2 - rootD;
            if (Number.isInteger(x1) && Number.isInteger(x2) && x1 !== 0 && x2 !== 0 && x1 !== C && x2 !== C && x1 !== x2) {
                let bot2Str = `x ${formatTerm(-C)}`; let multLeft1 = `${A}(x${formatTerm(-C)})`; let multLeft2 = `${B > 0 ? '+' : ''}${B}x`;
                return {
                    id: Math.random(), diff: "Mittel", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top={A} bot="x" /><span className="mx-2">{B > 0 ? '+' : '-'}</span><Frac top={Math.abs(B)} bot={bot2Str} /><span className="mx-2">=</span><span>1</span></div>,
                    steps: {
                        def: { expected: ["0", C.toString()], inputs: 2 }, hn: { expected: [`x(x-${C})`, `x*(x-${C})`, `x^2-${C}x`] }, multLeft: { expected: [`${multLeft1}${multLeft2}`, `${A}x${formatTerm(-A*C)}${multLeft2}`, `${formatTerm(A+B, true, 'x')}${formatTerm(-A*C)}`] }, multRight: { expected: [`x^2${formatTerm(-C, false, 'x')}`, `x(x-${C})`] }, zusammen: { expected: [`x^2${formatTerm(p, false, 'x')}${formatTerm(q)}=0`, `0=x^2${formatTerm(p, false, 'x')}${formatTerm(q)}`] }, pq_p: { expected: [p.toString()] }, pq_q: { expected: [q.toString()] }, pq_x1x2: { expected: [x1.toString(), x2.toString()], inputs: 2 }, lm: { expected: [x1.toString(), x2.toString()], inputs: 2 }
                    }
                };
            }
        }
    }
};

const generateTemplate3 = () => { // Schwer
    while(true) {
        let A = getRandomInt(-6, 6); let B = getRandomInt(-6, 6); let C = getRandomInt(1, 5);
        if (A===0 || B===0 || A+B===0) continue;
        let p = -(A+B); let q = C * (A - B - C); let D_disc = p*p/4 - q;
        if (D_disc >= 0 && Number.isInteger(Math.sqrt(D_disc))) {
            let rootD = Math.sqrt(D_disc); let x1 = -p/2 + rootD; let x2 = -p/2 - rootD;
            if (Number.isInteger(x1) && Number.isInteger(x2) && x1 !== C && x2 !== C && x1 !== -C && x2 !== -C && x1 !== x2) {
                let term1 = `${A}(x${formatTerm(-C)})`; let term2 = `${B > 0 ? '+' : ''}${B}(x${formatTerm(C)})`;
                return {
                    id: Math.random(), diff: "Schwer", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top={A} bot={`x ${formatTerm(C)}`} /><span className="mx-2">{B > 0 ? '+' : '-'}</span><Frac top={Math.abs(B)} bot={`x ${formatTerm(-C)}`} /><span className="mx-2">=</span><span>1</span></div>,
                    steps: {
                        def: { expected: [(-C).toString(), C.toString()], inputs: 2 }, hn: { expected: [`(x+${C})(x-${C})`, `x^2-${C*C}`, `(x-${C})(x+${C})`] }, multLeft: { expected: [`${term1}${term2}`, `${A}x${formatTerm(-A*C)}${formatTerm(B, false, 'x')}${formatTerm(B*C)}`, `${formatTerm(A+B, true, 'x')}${formatTerm(-A*C + B*C)}`] }, multRight: { expected: [`x^2-${C*C}`, `(x+${C})(x-${C})`] }, zusammen: { expected: [`x^2${formatTerm(p, false, 'x')}${formatTerm(q)}=0`, `0=x^2${formatTerm(p, false, 'x')}${formatTerm(q)}`] }, pq_p: { expected: [p.toString()] }, pq_q: { expected: [q.toString()] }, pq_x1x2: { expected: [x1.toString(), x2.toString()], inputs: 2 }, lm: { expected: [x1.toString(), x2.toString()], inputs: 2 }
                    }
                };
            }
        }
    }
};

const hardcodedProblems = [
    { id: 1, diff: "MSA 2018 I/8", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top="8x + 39" bot="4x - 12" /><span className="mx-2">=</span><span>x</span></div>, steps: { def: { expected: ["3"], inputs: 1 }, hn: { expected: ["4x-12", "4(x-3)", "4*(x-3)", "(4x-12)"] }, multLeft: { expected: ["8x+39"] }, multRight: { expected: ["4x^2-12x", "x(4x-12)", "x*(4x-12)"] }, zusammen: { expected: ["x^2-5x-9.75=0", "x^2-5x-39/4=0", "0=x^2-5x-9.75"] }, pq_p: { expected: ["-5"] }, pq_q: { expected: ["-9.75", "-39/4"] }, pq_x1x2: { expected: ["6.5", "-1.5"], inputs: 2 }, lm: { expected: ["6.5", "-1.5"], inputs: 2 } } },
    { id: 2, diff: "MSA 2018 II/8", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top="x" bot="2" /><span className="mx-2">+</span><Frac top="x" bot="x - 3" /><span className="mx-2">=</span><Frac top="3" bot="x - 3" /><span className="mx-2">- 2</span></div>, steps: { def: { expected: ["3"], inputs: 1 }, hn: { expected: ["2(x-3)", "2*(x-3)", "2x-6"] }, multLeft: { expected: ["x^2-x", "x(x-3)+2x", "x^2-3x+2x"] }, multRight: { expected: ["18-4x", "6-4(x-3)", "6-4x+12"] }, zusammen: { expected: ["x^2+3x-18=0", "0=x^2+3x-18"] }, pq_p: { expected: ["3"] }, pq_q: { expected: ["-18"] }, pq_x1x2: { expected: ["3", "-6"], inputs: 2 }, lm: { expected: ["-6"], inputs: 1 } } },
    { id: 3, diff: "MSA 2017 I/8", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top="x - 4" bot="6" /><span className="mx-2">+</span><Frac top="4(x - 11)" bot="x - 6" /><span className="mx-2">=</span><Frac top="16 - x" bot="2" /></div>, steps: { def: { expected: ["6"], inputs: 1 }, hn: { expected: ["6(x-6)", "6*(x-6)", "6x-36"] }, multLeft: { expected: ["x^2+14x-240", "(x-4)(x-6)+24(x-11)"] }, multRight: { expected: ["-3x^2+66x-288", "3(x-6)(16-x)"] }, zusammen: { expected: ["x^2-13x+12=0", "0=x^2-13x+12", "4x^2-52x+48=0"] }, pq_p: { expected: ["-13"] }, pq_q: { expected: ["12"] }, pq_x1x2: { expected: ["12", "1"], inputs: 2 }, lm: { expected: ["12", "1"], inputs: 2 } } },
    { id: 4, diff: "MSA 2016 I/8", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top="2(x + 2)" bot="x" /><span className="mx-2">=</span><span className="mx-2">2 -</span><Frac top="2 - x" bot="x - 2" /></div>, steps: { def: { expected: ["0", "2"], inputs: 2 }, hn: { expected: ["x(x-2)", "x*(x-2)", "x^2-2x"] }, multLeft: { expected: ["2x^2-8", "2(x+2)(x-2)", "(2x+4)(x-2)"] }, multRight: { expected: ["3x^2-6x", "2x(x-2)-x(2-x)", "2x^2-4x-2x+x^2"] }, zusammen: { expected: ["x^2-6x+8=0", "0=x^2-6x+8"] }, pq_p: { expected: ["-6"] }, pq_q: { expected: ["8"] }, pq_x1x2: { expected: ["4", "2"], inputs: 2 }, lm: { expected: ["4"], inputs: 1 } } },
    { id: 5, diff: "MSA 2025 I/8", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top="1" bot="x - 10" /><span className="mx-2">=</span><Frac top="2x" bot="4x" /><span className="mx-2">+</span><Frac top="40" bot="4x(x - 10)" /></div>, steps: { def: { expected: ["0", "10"], inputs: 2 }, hn: { expected: ["4x(x-10)", "4x*(x-10)"] }, multLeft: { expected: ["4x"] }, multRight: { expected: ["2x(x-10)+40", "2x^2-20x+40", "2x*(x-10)+40"] }, zusammen: { expected: ["x^2-12x+20=0", "0=x^2-12x+20", "2x^2-24x+40=0", "0=2x^2-24x+40"] }, pq_p: { expected: ["-12"] }, pq_q: { expected: ["20"] }, pq_x1x2: { expected: ["10", "2"], inputs: 2 }, lm: { expected: ["2"], inputs: 1 } } },
    { id: 6, diff: "MSA 2025 II/8", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top="x + 4" bot="2" /><span className="mx-2">+</span><Frac top="3x - 12" bot="x - 4" /><span className="mx-2">=</span><span>4,5</span></div>, steps: { def: { expected: ["4"], inputs: 1 }, hn: { expected: ["2(x-4)", "2*(x-4)", "2x-8"] }, multLeft: { expected: ["x^2+6x-40", "(x+4)(x-4)+2(3x-12)", "(x+4)(x-4)+6x-24"] }, multRight: { expected: ["9(x-4)", "9x-36", "9*(x-4)"] }, zusammen: { expected: ["x^2-3x-4=0", "0=x^2-3x-4"] }, pq_p: { expected: ["-3"] }, pq_q: { expected: ["-4"] }, pq_x1x2: { expected: ["4", "-1"], inputs: 2 }, lm: { expected: ["-1"], inputs: 1 } } },
    { id: 7, diff: "MSA 2024 II/8", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top="28x - 12" bot="8" /><span className="mx-2">=</span><Frac top="(x + 3)²" bot="x - 1" /></div>, steps: { def: { expected: ["1"], inputs: 1 }, hn: { expected: ["8(x-1)", "8*(x-1)", "8x-8"] }, multLeft: { expected: ["28x^2-40x+12", "(28x-12)(x-1)"] }, multRight: { expected: ["8(x+3)^2", "8x^2+48x+72"] }, zusammen: { expected: ["x^2-4.4x-3=0", "0=x^2-4.4x-3", "5x^2-22x-15=0", "0=5x^2-22x-15", "20x^2-88x-60=0", "0=20x^2-88x-60"] }, pq_p: { expected: ["-4.4", "-22/5"] }, pq_q: { expected: ["-3"] }, pq_x1x2: { expected: ["5", "-0.6"], inputs: 2 }, lm: { expected: ["5", "-0.6"], inputs: 2 } } },
    { id: 8, diff: "MSA 2023 I/8", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top="x" bot="2" /><span className="mx-2">+</span><Frac top="x + 7" bot="2x - 4" /><span className="mx-2">=</span><Frac top="6(x - 2)" bot="16" /></div>, steps: { def: { expected: ["2"], inputs: 1 }, hn: { expected: ["16(x-2)", "16*(x-2)", "16x-32"] }, multLeft: { expected: ["8x^2-8x+56", "8x(x-2)+8(x+7)"] }, multRight: { expected: ["6(x-2)^2", "6x^2-24x+24"] }, zusammen: { expected: ["x^2+8x+16=0", "0=x^2+8x+16", "2x^2+16x+32=0", "0=2x^2+16x+32"] }, pq_p: { expected: ["8"] }, pq_q: { expected: ["16"] }, pq_x1x2: { expected: ["-4"], inputs: 1 }, lm: { expected: ["-4"], inputs: 1 } } },
    { id: 9, diff: "MSA 2023 II/8", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top="x" bot="5 + x" /><span className="mx-2">=</span><Frac top="4" bot="x + 1" /><span className="mx-2">-</span><Frac top="4x" bot="(5 + x)(x + 1)" /></div>, steps: { def: { expected: ["-5", "-1"], inputs: 2 }, hn: { expected: ["(5+x)(x+1)", "(x+5)(x+1)", "(x+1)(5+x)", "(x+1)(x+5)"] }, multLeft: { expected: ["x^2+x", "x(x+1)", "x*(x+1)"] }, multRight: { expected: ["20", "4(5+x)-4x", "4x+20-4x", "4(x+5)-4x"] }, zusammen: { expected: ["x^2+x-20=0", "0=x^2+x-20"] }, pq_p: { expected: ["1"] }, pq_q: { expected: ["-20"] }, pq_x1x2: { expected: ["4", "-5"], inputs: 2 }, lm: { expected: ["4"], inputs: 1 } } },
    { id: 10, diff: "MSA 2022 I/8", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top="1,5x + 6" bot="x + 6,5" /><span className="mx-2">=</span><Frac top="x - 3" bot="2x - 3" /></div>, steps: { def: { expected: ["-6.5", "1.5"], inputs: 2 }, hn: { expected: ["(x+6.5)(2x-3)", "(2x-3)(x+6.5)"] }, multLeft: { expected: ["3x^2+7.5x-18", "(1.5x+6)(2x-3)"] }, multRight: { expected: ["x^2+3.5x-19.5", "(x-3)(x+6.5)"] }, zusammen: { expected: ["x^2+2x+0.75=0", "0=x^2+2x+0.75", "x^2+2x+3/4=0", "2x^2+4x+1.5=0", "0=2x^2+4x+1.5"] }, pq_p: { expected: ["2"] }, pq_q: { expected: ["0.75", "3/4"] }, pq_x1x2: { expected: ["-0.5", "-1.5"], inputs: 2 }, lm: { expected: ["-0.5", "-1.5"], inputs: 2 } } },
    { id: 11, diff: "MSA 2021 I/8", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top="4" bot="x" /><span className="mx-2">+</span><Frac top="1" bot="3 + x" /><span className="mx-2">=</span><Frac top="7" bot="x - 2" /></div>, steps: { def: { expected: ["-3", "0", "2"], inputs: 3 }, hn: { expected: ["x(3+x)(x-2)", "x(x+3)(x-2)", "x(x-2)(x+3)", "x(x-2)(3+x)"] }, multLeft: { expected: ["5x^2+2x-24", "4(3+x)(x-2)+x(x-2)"] }, multRight: { expected: ["7x^2+21x", "7x(3+x)", "7x(x+3)"] }, zusammen: { expected: ["x^2+9.5x+12=0", "0=x^2+9.5x+12", "2x^2+19x+24=0", "0=2x^2+19x+24"] }, pq_p: { expected: ["9.5", "19/2"] }, pq_q: { expected: ["12"] }, pq_x1x2: { expected: ["-1.5", "-8"], inputs: 2 }, lm: { expected: ["-1.5", "-8"], inputs: 2 } } },
    { id: 12, diff: "MSA 2021 II/8", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top="60" bot="x" /><span className="mx-2">-</span><Frac top="32" bot="x + 1" /><span className="mx-2">=</span><Frac top="26" bot="x - 2" /></div>, steps: { def: { expected: ["-1", "0", "2"], inputs: 3 }, hn: { expected: ["x(x+1)(x-2)", "x(x-2)(x+1)"] }, multLeft: { expected: ["28x^2+4x-120", "60(x+1)(x-2)-32x(x-2)"] }, multRight: { expected: ["26x^2+26x", "26x(x+1)"] }, zusammen: { expected: ["x^2-11x-60=0", "0=x^2-11x-60", "2x^2-22x-120=0", "0=2x^2-22x-120"] }, pq_p: { expected: ["-11"] }, pq_q: { expected: ["-60"] }, pq_x1x2: { expected: ["15", "-4"], inputs: 2 }, lm: { expected: ["15", "-4"], inputs: 2 } } },
    { id: 13, diff: "MSA 2020 I/8", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top="-x" bot="x + 3" /><span className="mx-2">+ 2 =</span><span className="mx-2">1 -</span><Frac top="3x" bot="4(x - 2)" /></div>, steps: { def: { expected: ["-3", "2"], inputs: 2 }, hn: { expected: ["4(x+3)(x-2)", "4(x-2)(x+3)"] }, multLeft: { expected: ["4x^2+16x-48", "-4x(x-2)+8(x+3)(x-2)"] }, multRight: { expected: ["x^2-5x-24", "4(x+3)(x-2)-3x(x+3)"] }, zusammen: { expected: ["x^2+7x-8=0", "0=x^2+7x-8", "3x^2+21x-24=0", "0=3x^2+21x-24"] }, pq_p: { expected: ["7"] }, pq_q: { expected: ["-8"] }, pq_x1x2: { expected: ["1", "-8"], inputs: 2 }, lm: { expected: ["1", "-8"], inputs: 2 } } },
    { id: 14, diff: "MSA 2020 II/8", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top="8x + 7" bot="(x + 1)(x + 2)" /><span className="mx-2">=</span><Frac top="9" bot="x + 2" /><span className="mx-2">-</span><Frac top="2x" bot="x + 1" /></div>, steps: { def: { expected: ["-2", "-1"], inputs: 2 }, hn: { expected: ["(x+1)(x+2)", "(x+2)(x+1)"] }, multLeft: { expected: ["8x+7"] }, multRight: { expected: ["-2x^2+5x+9", "9(x+1)-2x(x+2)"] }, zusammen: { expected: ["x^2+1.5x-1=0", "0=x^2+1.5x-1", "2x^2+3x-2=0", "0=2x^2+3x-2", "x^2+3/2x-1=0"] }, pq_p: { expected: ["1.5", "3/2"] }, pq_q: { expected: ["-1"] }, pq_x1x2: { expected: ["0.5", "-2"], inputs: 2 }, lm: { expected: ["0.5"], inputs: 1 } } },
    { id: 15, diff: "MSA 2019 I/8", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top="x" bot="2x - 2" /><span className="mx-2">- 0,25 =</span><Frac top="2" bot="4x - 8" /></div>, steps: { def: { expected: ["1", "2"], inputs: 2 }, hn: { expected: ["4(x-1)(x-2)", "4(x-2)(x-1)"] }, multLeft: { expected: ["x^2-x-2", "2x(x-2)-(x-1)(x-2)"] }, multRight: { expected: ["2x-2", "2(x-1)"] }, zusammen: { expected: ["x^2-3x=0", "0=x^2-3x"] }, pq_p: { expected: ["-3"] }, pq_q: { expected: ["0"] }, pq_x1x2: { expected: ["3", "0"], inputs: 2 }, lm: { expected: ["3", "0"], inputs: 2 } } },
    { id: 16, diff: "MSA 2019 II/8", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top="2(2 + x)" bot="6 - x" /><span className="mx-2">+ 2 =</span><Frac top="6 + x" bot="x" /></div>, steps: { def: { expected: ["0", "6"], inputs: 2 }, hn: { expected: ["x(6-x)", "(6-x)x", "x*(6-x)"] }, multLeft: { expected: ["16x", "2x(2+x)+2x(6-x)"] }, multRight: { expected: ["36-x^2", "(6+x)(6-x)"] }, zusammen: { expected: ["x^2+16x-36=0", "0=x^2+16x-36"] }, pq_p: { expected: ["16"] }, pq_q: { expected: ["-36"] }, pq_x1x2: { expected: ["2", "-18"], inputs: 2 }, lm: { expected: ["2", "-18"], inputs: 2 } } },
    { id: 17, diff: "MSA 2017 II/8", renderEquation: () => <div className="flex items-center text-xl font-math"><Frac top="10" bot="x + 3" /><span className="mx-2">+</span><Frac top="9(x - 4)" bot="x + 1" /><span className="mx-2">=</span><Frac top="5x" bot="x + 3" /><span className="mx-2">- 6</span></div>, steps: { def: { expected: ["-3", "-1"], inputs: 2 }, hn: { expected: ["(x+3)(x+1)", "(x+1)(x+3)"] }, multLeft: { expected: ["9x^2+x-98", "10(x+1)+9(x-4)(x+3)"] }, multRight: { expected: ["-x^2-19x-18", "5x(x+1)-6(x+3)(x+1)"] }, zusammen: { expected: ["x^2+2x-8=0", "0=x^2+2x-8", "10x^2+20x-80=0", "0=10x^2+20x-80"] }, pq_p: { expected: ["2"] }, pq_q: { expected: ["-8"] }, pq_x1x2: { expected: ["2", "-4"], inputs: 2 }, lm: { expected: ["2", "-4"], inputs: 2 } } }
];

// ==========================================
// TRAINER
// ==========================================
const BruchgleichungsTrainer = () => {
    const [probList, setProbList] = useState([generateTemplate1()]);
    const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
    const [selectedDiff, setSelectedDiff] = useState('leicht');
    // Prüfungs-Pool: gemischte Reihenfolge, jede Aufgabe einmal durchlaufen,
    // dann frisch mischen.
    const [examShuffled, setExamShuffled] = useState([]);
    const [examIdx, setExamIdx] = useState(0);

    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");
    const [tipRevealed, setTipRevealed] = useState(false);
    const [showAnim, setShowAnim] = useState(false);
    const [streak, setStreak] = useState(() => getStorage('smarth_streak_brueche', 0));
    // Adaptive Schwierigkeit + Lernzielkontrolle.
    const adaptive = useAdaptive('bruchgleichungen', selectedDiff);

    const [defInputs, setDefInputs] = useState(["", "", ""]); const [hnInput, setHnInput] = useState(""); const [multLeft, setMultLeft] = useState(""); const [multRight, setMultRight] = useState(""); const [zusInput, setZusInput] = useState(""); const [pqP, setPqP] = useState(""); const [pqQ, setPqQ] = useState(""); const [einsetzenP1, setEinsetzenP1] = useState(""); const [einsetzenP2, setEinsetzenP2] = useState(""); const [einsetzenQ, setEinsetzenQ] = useState(""); const [pqX, setPqX] = useState(["", ""]); const [lmInputs, setLmInputs] = useState(["", ""]);

    useEffect(() => { setStorage('smarth_streak_brueche', streak); }, [streak]);
    const prob = probList[currentProblemIdx];

    const clearForm = () => {
        setCurrentStep(1); setErrors(0); setErrorMsg(""); setTipRevealed(false);
        setDefInputs(["", "", ""]); setHnInput(""); setMultLeft(""); setMultRight(""); setZusInput(""); setPqP(""); setPqQ(""); setEinsetzenP1(""); setEinsetzenP2(""); setEinsetzenQ(""); setPqX(["", ""]); setLmInputs(["", ""]);
    };

    // Holt die nächste Prüfungsaufgabe aus dem gemischten Pool. Reshuffle, wenn alle dran waren.
    const drawNextExam = () => {
        let pool = examShuffled;
        let idx = examIdx;
        if (pool.length === 0 || idx >= pool.length) {
            pool = shuffleArray(hardcodedProblems);
            setExamShuffled(pool);
            idx = 0;
        }
        setProbList([pool[idx]]);
        setCurrentProblemIdx(0);
        setExamIdx(idx + 1);
    };

    const changeDifficulty = (diff) => {
        setSelectedDiff(diff); clearForm();
        if (diff === 'leicht') setProbList([generateTemplate1()]);
        else if (diff === 'mittel') setProbList([generateTemplate2()]);
        else if (diff === 'schwer') setProbList([generateTemplate3()]);
        else if (diff === 'pruefung') {
            if (selectedDiff === 'pruefung') {
                drawNextExam();
                return;
            } else {
                // Beim Wechsel ZU Prüfungsaufgaben Pool zurücksetzen.
                const pool = shuffleArray(hardcodedProblems);
                setExamShuffled(pool); setExamIdx(1);
                setProbList([pool[0]]); setCurrentProblemIdx(0);
                return;
            }
        }
        if(diff !== 'pruefung') setCurrentProblemIdx(0);
    };

    const handleNextPruefung = () => { drawNextExam(); clearForm(); };
    const handleError = (msg) => { setErrorMsg(msg); setErrors(prev => prev + 1); setStreak(0); adaptive.recordWrong(); };
    const advanceStep = () => {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep); setErrors(0); setErrorMsg(""); setTipRevealed(false);
        if (nextStep > 8) { setStreak(s => s + 1); triggerCelebration(setShowAnim); adaptive.recordCorrect(); }
    };

    const validateStep1 = () => { const inputs = defInputs.slice(0, prob.steps.def.inputs); if (checkMultiInput(inputs, prob.steps.def.expected)) advanceStep(); else handleError("Die Definitionsmenge ist nicht ganz richtig."); };
    const validateStep2 = () => { if (prob.steps.hn.expected.map(normalizeString).includes(normalizeString(hnInput))) advanceStep(); else handleError("Der Hauptnenner stimmt nicht."); };
    const validateStep3 = () => { const leftOk = prob.steps.multLeft.expected.map(normalizeString).includes(normalizeString(multLeft)); const rightOk = prob.steps.multRight.expected.map(normalizeString).includes(normalizeString(multRight)); if (leftOk && rightOk) advanceStep(); else handleError("Beim Durchmultiplizieren ist ein Fehler passiert."); };
    const validateStep4 = () => { if (prob.steps.zusammen.expected.map(normalizeString).includes(normalizeString(zusInput))) advanceStep(); else handleError("Die Normalform ist nicht korrekt."); };
    const validateStep5 = () => { const pOk = normalizeString(pqP) === normalizeString(prob.steps.pq_p.expected[0]); const qOk = normalizeString(pqQ) === normalizeString(prob.steps.pq_q.expected[0]); if (pOk && qOk) advanceStep(); else handleError("p oder q ist falsch abgelesen."); };
    const validateStep6 = () => { const pExp = normalizeString(prob.steps.pq_p.expected[0]); const qExp = normalizeString(prob.steps.pq_q.expected[0]); if (normalizeString(einsetzenP1) === pExp && normalizeString(einsetzenP2) === pExp && normalizeString(einsetzenQ) === qExp) advanceStep(); else handleError("Nicht richtig eingesetzt (Vorzeichen beachten!)."); };
    const validateStep7 = () => { const inputs = pqX.slice(0, prob.steps.pq_x1x2.inputs); if (checkMultiInput(inputs, prob.steps.pq_x1x2.expected)) advanceStep(); else handleError("Das Ergebnis der pq-Formel stimmt nicht."); };
    const validateStep8 = () => { const inputs = lmInputs.slice(0, prob.steps.lm.inputs); if (checkMultiInput(inputs, prob.steps.lm.expected)) advanceStep(); else handleError("Vergleiche deine Ergebnisse aus Schritt 7 mit D aus Schritt 1."); };

    // Liefert den Lösungstext für den aktuellen Schritt — TipBox zeigt ihn an,
    // füllt aber nichts automatisch aus.
    const getSolutionText = () => {
        if (!prob) return null;
        const fmt = (s) => formatDe(s);
        if (currentStep === 1) return `D = ℝ \\ { ${prob.steps.def.expected.map(fmt).join('; ')} }`;
        if (currentStep === 2) return `HN = ${fmt(prob.steps.hn.expected[0])}`;
        if (currentStep === 3) return `${fmt(prob.steps.multLeft.expected[0])}  =  ${fmt(prob.steps.multRight.expected[0])}`;
        if (currentStep === 4) return fmt(prob.steps.zusammen.expected[0]);
        if (currentStep === 5) return `p = ${fmt(prob.steps.pq_p.expected[0])},   q = ${fmt(prob.steps.pq_q.expected[0])}`;
        if (currentStep === 6) {
            const p = fmt(prob.steps.pq_p.expected[0]);
            const q = fmt(prob.steps.pq_q.expected[0]);
            return `Setze p = ${p} (zweimal) und q = ${q} ein.`;
        }
        if (currentStep === 7) return `x = ${prob.steps.pq_x1x2.expected.map(fmt).join('   oder   x = ')}`;
        if (currentStep === 8) return `L = { ${prob.steps.lm.expected.map(fmt).join('; ')} }`;
        return null;
    };
    const onSolutionShown = () => setStreak(0);

    const inputStyle = (stepNum, wClass="w-16") => `border-2 rounded p-2 text-center focus:outline-none transition-colors ${wClass} ${currentStep > stepNum ? 'border-green-500 bg-green-50 text-green-900 font-bold shadow-sm' : 'border-slate-300 focus:border-amber-500 bg-white shadow-inner'}`;

    return (
        <div className="page-transition max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {showAnim && <CelebrationOverlay />}
            <TrainerHeader theme="amber" icon={FractionIcon} title="Bruchgleichungen" streakIcon={Target} streak={streak} />

            <DifficultyMenu theme="amber" active={selectedDiff} onChange={changeDifficulty}
                options={[
                    {id: 'leicht', label: 'Leicht'}, {id: 'mittel', label: 'Mittel'},
                    {id: 'schwer', label: 'Schwer'}, {id: 'pruefung', label: 'Prüfungsaufgaben'}
                ]}
            />

            {/* Lernzielkontrolle + adaptive Schwierigkeits-Empfehlung */}
            {adaptive.stats.mastered.length > 0 && (
                <div className="mb-4 flex justify-center"><MasteryBadge mastered={adaptive.stats.mastered} theme="amber" /></div>
            )}
            <AdaptiveSuggestion suggestion={adaptive.suggestion} onAccept={(d) => changeDifficulty(d)} theme="amber" />

            <main className="space-y-6 relative">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-amber-50 px-6 py-3 border-b border-amber-200 flex justify-between items-center">
                        <h2 className="font-semibold text-amber-900 flex items-center"><BookOpen size={18} className="mr-2"/> Gegebene Gleichung</h2>
                        {selectedDiff === 'pruefung' && <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-amber-200 text-amber-800">{prob.diff}</span>}
                    </div>
                    <div className="p-8 flex justify-center bg-white overflow-x-auto min-h-[120px] items-center">{prob.renderEquation()}</div>
                </div>

                <div className="space-y-4">
                    <StepCard title="1. Definitionsmenge bestimmen" stepNum={1} currentStep={currentStep} theme="amber">
                        <div className="flex items-center space-x-3 mb-2" onKeyDown={enterToSubmit(validateStep1)}>
                            <span className="font-semibold text-lg">D = ℝ \ {'{'}</span>
                            <input type="text" value={defInputs[0]} onChange={e => { const nd = [...defInputs]; nd[0] = e.target.value; setDefInputs(nd); }} className={inputStyle(1)} disabled={currentStep !== 1} />
                            {prob.steps.def.inputs >= 2 && (<><span className="font-semibold">;</span><input type="text" value={defInputs[1]} onChange={e => { const nd = [...defInputs]; nd[1] = e.target.value; setDefInputs(nd); }} className={inputStyle(1)} disabled={currentStep !== 1} /></>)}
                            {prob.steps.def.inputs >= 3 && (<><span className="font-semibold">;</span><input type="text" value={defInputs[2]} onChange={e => { const nd = [...defInputs]; nd[2] = e.target.value; setDefInputs(nd); }} className={inputStyle(1)} disabled={currentStep !== 1} /></>)}
                            <span className="font-semibold text-lg">{'}'}</span>
                            {currentStep === 1 && <SubmitBtn onClick={validateStep1} theme="amber" disabled={!defInputs.some(v => (v || '').trim().length > 0)} />}
                        </div>
                        {currentStep === 1 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text={`Setze die Nenner gleich 0. Lösung: ${prob.steps.def.expected.map(formatDe).join(' und ')}`} />}
                        {currentStep > 1 && <SuccessMark text={`D = ℝ \\ { ${prob.steps.def.expected.map(formatDe).join('; ')} }`} />}
                    </StepCard>

                    {currentStep >= 2 && (
                        <StepCard title="2. Hauptnenner (HN) finden" stepNum={2} currentStep={currentStep} theme="amber">
                            <div className="flex items-center space-x-3 mb-2" onKeyDown={enterToSubmit(validateStep2)}>
                                <span className="font-semibold">HN =</span>
                                <input type="text" value={hnInput} onChange={e => setHnInput(e.target.value)} placeholder="z.B. x(x-3)" className={inputStyle(2, "w-64")} disabled={currentStep !== 2} />
                                {currentStep === 2 && <SubmitBtn onClick={validateStep2} theme="amber" disabled={!(hnInput || '').trim()} />}
                            </div>
                            {currentStep === 2 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text={`Suche den kleinsten gemeinsamen Nenner. Lösung: ${formatDe(prob.steps.hn.expected[0])}`} />}
                            {currentStep > 2 && <SuccessMark text={`HN = ${formatDe(prob.steps.hn.expected[0])}`} />}
                        </StepCard>
                    )}

                    {currentStep >= 3 && (
                        <StepCard title="3. Mit dem Hauptnenner durchmultiplizieren" stepNum={3} currentStep={currentStep} theme="amber">
                            <div className="flex flex-wrap items-center gap-3 mb-2" onKeyDown={enterToSubmit(validateStep3)}>
                                <input type="text" value={multLeft} onChange={e => setMultLeft(e.target.value)} placeholder="Linke Seite" className={inputStyle(3, "w-64")} disabled={currentStep !== 3} />
                                <span className="font-bold text-xl">=</span>
                                <input type="text" value={multRight} onChange={e => setMultRight(e.target.value)} placeholder="Rechte Seite" className={inputStyle(3, "w-64")} disabled={currentStep !== 3} />
                                {currentStep === 3 && <SubmitBtn onClick={validateStep3} theme="amber" disabled={!(multLeft || '').trim() && !(multRight || '').trim()} />}
                            </div>
                            {currentStep === 3 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text={`Multipliziere jeden Bruch mit dem HN (Kürzen!). Lösung: ${formatDe(prob.steps.multLeft.expected[0])} = ${formatDe(prob.steps.multRight.expected[0])}`} />}
                            {currentStep > 3 && <SuccessMark text={`${formatDe(prob.steps.multLeft.expected[0])} = ${formatDe(prob.steps.multRight.expected[0])}`} />}
                        </StepCard>
                    )}

                    {currentStep >= 4 && (
                        <StepCard title="4. Zusammenfassen (Normalform)" stepNum={4} currentStep={currentStep} theme="amber">
                            <div className="flex items-center space-x-3 mb-2" onKeyDown={enterToSubmit(validateStep4)}>
                                <input type="text" value={zusInput} onChange={e => setZusInput(e.target.value)} placeholder="z.B. x^2+x-12=0" className={inputStyle(4, "w-64 font-mono")} disabled={currentStep !== 4} />
                                {currentStep === 4 && <SubmitBtn onClick={validateStep4} theme="amber" disabled={!(zusInput || '').trim()} />}
                            </div>
                            {currentStep === 4 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text={`Bringe alles auf eine Seite und teile, falls nötig, bis x² alleine steht. Lösung: ${formatDe(prob.steps.zusammen.expected[0])}`} />}
                            {currentStep > 4 && <SuccessMark text={formatDe(prob.steps.zusammen.expected[0])} />}
                        </StepCard>
                    )}

                    {currentStep >= 5 && (
                        <StepCard title="5. Werte für die pq-Formel ablesen" stepNum={5} currentStep={currentStep} theme="amber">
                            <div className="flex items-center space-x-6 mb-2" onKeyDown={enterToSubmit(validateStep5)}>
                                <div className="flex items-center space-x-2"><span className="font-semibold text-lg italic">p =</span><input type="text" value={pqP} onChange={e => setPqP(e.target.value)} className={inputStyle(5, "w-20")} disabled={currentStep !== 5} /></div>
                                <div className="flex items-center space-x-2"><span className="font-semibold text-lg italic">q =</span><input type="text" value={pqQ} onChange={e => setPqQ(e.target.value)} className={inputStyle(5, "w-20")} disabled={currentStep !== 5} /></div>
                                {currentStep === 5 && <SubmitBtn onClick={validateStep5} theme="amber" disabled={!(pqP || '').trim() && !(pqQ || '').trim()} />}
                            </div>
                            {currentStep === 5 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text={`p ist die Zahl vor dem x, q ist die Zahl ohne x. Vorzeichen mitnehmen! Lösung: p=${formatDe(prob.steps.pq_p.expected[0])}, q=${formatDe(prob.steps.pq_q.expected[0])}`} />}
                            {currentStep > 5 && <SuccessMark text={`p = ${formatDe(prob.steps.pq_p.expected[0])}, q = ${formatDe(prob.steps.pq_q.expected[0])}`} />}
                        </StepCard>
                    )}

                    {currentStep >= 6 && (
                        <StepCard title="6. Werte in die pq-Formel einsetzen" stepNum={6} currentStep={currentStep} theme="amber">
                            <div className="flex flex-wrap items-center space-x-2 text-xl font-math bg-slate-50 p-4 border border-slate-200 rounded-lg overflow-x-auto mb-2" onKeyDown={enterToSubmit(validateStep6)}>
                                <span>x₁,₂ = -</span>
                                <Frac top={<input type="text" value={einsetzenP1} onChange={e=>setEinsetzenP1(e.target.value)} className={inputStyle(6, "w-16")} disabled={currentStep !== 6} placeholder="p" />} bot="2" />
                                <span className="mx-2">±</span>
                                <span className="text-4xl text-slate-800">√</span>
                                <div className="border-t-2 border-slate-800 flex items-center pt-1 mt-3 space-x-2">
                                    <span>(</span>
                                    <Frac top={<input type="text" value={einsetzenP2} onChange={e=>setEinsetzenP2(e.target.value)} className={inputStyle(6, "w-16")} disabled={currentStep !== 6} placeholder="p" />} bot="2" />
                                    <span>)² - </span>
                                    <input type="text" value={einsetzenQ} onChange={e=>setEinsetzenQ(e.target.value)} className={inputStyle(6, "w-20")} disabled={currentStep !== 6} placeholder="q" />
                                </div>
                                {currentStep === 6 && <div className="ml-4"><SubmitBtn onClick={validateStep6} theme="amber" disabled={!(einsetzenP1 || '').trim() && !(einsetzenP2 || '').trim() && !(einsetzenQ || '').trim()} /></div>}
                            </div>
                            {currentStep === 6 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text="Setze p und q exakt so ein, wie du sie oben abgelesen hast (inklusive Minuszeichen!)." />}
                            {currentStep > 6 && <SuccessMark text="Richtig eingesetzt!" />}
                        </StepCard>
                    )}

                    {currentStep >= 7 && (
                        <StepCard title="7. pq-Formel auflösen" stepNum={7} currentStep={currentStep} theme="amber">
                            <div className="flex items-center space-x-6 mb-2" onKeyDown={enterToSubmit(validateStep7)}>
                                <div className="flex items-center space-x-2"><span className="font-semibold text-lg">x₁ =</span><input type="text" value={pqX[0]} onChange={e => setPqX([e.target.value, pqX[1]])} className={inputStyle(7, "w-20")} disabled={currentStep !== 7} /></div>
                                {prob.steps.pq_x1x2.inputs === 2 && (
                                    <div className="flex items-center space-x-2"><span className="font-semibold text-lg">x₂ =</span><input type="text" value={pqX[1]} onChange={e => setPqX([pqX[0], e.target.value])} className={inputStyle(7, "w-20")} disabled={currentStep !== 7} /></div>
                                )}
                                {currentStep === 7 && <SubmitBtn onClick={validateStep7} theme="amber" disabled={!(pqX[0] || '').trim() && !(pqX[1] || '').trim()} />}
                            </div>
                            {currentStep === 7 && <div className="mt-3"><CalcButton theme="amber" /></div>}
                            {currentStep === 7 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text={`Tippe es vorsichtig in den Rechner ein. Lösung: ${prob.steps.pq_x1x2.expected.map(formatDe).join(' und ')}`} />}
                            {currentStep > 7 && <SuccessMark text={`x = ${prob.steps.pq_x1x2.expected.map(formatDe).join(' oder x = ')}`} />}
                        </StepCard>
                    )}

                    {currentStep >= 8 && (
                        <StepCard title="8. Lösungsmenge angeben" stepNum={8} currentStep={currentStep} theme="amber">
                            {prob.steps.lm.inputs < prob.steps.pq_x1x2.inputs && <strong className="text-red-600 block mb-2">Achtung: Eine Lösung ist laut Definitionsmenge ungültig!</strong>}
                            <div className="flex items-center space-x-3 mb-2" onKeyDown={enterToSubmit(validateStep8)}>
                                <span className="font-semibold text-lg">L = {'{'}</span>
                                <input type="text" value={lmInputs[0]} onChange={e => setLmInputs([e.target.value, lmInputs[1]])} className={inputStyle(8, "w-16")} disabled={currentStep !== 8} />
                                {prob.steps.lm.inputs === 2 && (<><span className="font-semibold">;</span><input type="text" value={lmInputs[1]} onChange={e => setLmInputs([lmInputs[0], e.target.value])} className={inputStyle(8, "w-16")} disabled={currentStep !== 8} /></>)}
                                <span className="font-semibold text-lg">{'}'}</span>
                                {currentStep === 8 && <SubmitBtn onClick={validateStep8} theme="amber" disabled={!(lmInputs[0] || '').trim() && !(lmInputs[1] || '').trim()} />}
                            </div>
                            {currentStep === 8 && <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} text={`Lösung: L = { ${prob.steps.lm.expected.map(formatDe).join('; ')} }`} />}
                            {currentStep > 8 && <SuccessMark text={`L = { ${prob.steps.lm.expected.map(formatDe).join('; ')} }`} />}
                        </StepCard>
                    )}

                    {errorMsg && currentStep <= 8 && !tipRevealed && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded shadow-sm text-red-700 font-medium flex items-center animate-fade-in"><XCircle className="w-5 h-5 mr-2 shrink-0"/>{errorMsg}</div>
                    )}

                    {currentStep > 8 && (
                        <SuccessBox
                            subtitle="Du hast die Bruchgleichung vollständig und richtig gelöst."
                            onNext={() => changeDifficulty(selectedDiff)}
                            extraBtn={selectedDiff === 'pruefung' ? <button onClick={handleNextPruefung} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center"><BookOpen className="mr-2" size={18}/> Nächste Prüfung</button> : null}
                            theme="amber"
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(<BruchgleichungsTrainer />);
