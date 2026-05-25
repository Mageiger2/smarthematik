// ==========================================
// kugel.js — Kugel-Trainer (Volumen, Oberfläche, zusammengesetzte Körper, Umschmelzen)
// Wird inline mit shared.js zusammen kompiliert; nutzt die geteilten Komponenten
// (TrainerHeader, DifficultyMenu, StepCard, SubmitBtn, TipBox, SuccessBox,
// CalcButton, CelebrationOverlay) sowie useTrainerCore + useAdaptive.
// Theme-Farbe: indigo.
// ==========================================

// ==========================================
// 0. HELFER (lokal — fmt/parse mit deutscher Komma-Konvention)
// ==========================================
const fmtK = (num, decimals) => {
    if (num === null || num === undefined || num === '') return '';
    const n = parseFloat(num);
    if (isNaN(n)) return String(num);
    if (decimals === undefined) {
        // Auto: ganze Zahl ohne Nachkomma, sonst max. 2 Stellen
        return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100).replace('.', ',');
    }
    return n.toFixed(decimals).replace('.', ',');
};
const parseDe = (s) => {
    if (s === null || s === undefined) return NaN;
    return parseFloat(String(s).trim().replace(',', '.'));
};
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 1) => {
    const v = Math.random() * (max - min) + min;
    return parseFloat(v.toFixed(decimals));
};

// ==========================================
// 1. FORMEL-BAUSTEINE (reines JSX, kein KaTeX nötig — Math-Font kommt aus main.css)
// ==========================================
const Vrb = ({ children }) => <span className="font-math-italic">{children}</span>;
const VrbSub = ({ name, sub }) => (
    <span className="font-math-italic">{name}<sub className="text-[0.65em] font-math-italic align-sub">{sub}</sub></span>
);
const Pwr = ({ children }) => <sup className="text-[0.7em] -top-2 relative font-math">{children}</sup>;
const KBruch = ({ top, bot }) => (
    <span className="inline-flex flex-col items-center align-middle mx-1 text-[0.7em] leading-tight">
        <span className="border-b-2 border-current px-1.5 pb-0.5 text-center">{top}</span>
        <span className="px-1.5 pt-0.5 text-center">{bot}</span>
    </span>
);
const KWurz = ({ children, n }) => (
    <span className="inline-flex items-center align-middle mx-1">
        {n && <sup className="text-xs -mr-1 self-start mt-0.5">{n}</sup>}
        <span className="text-[1.6em] leading-none -mt-1">√</span>
        <span className="border-t-2 border-current pt-0.5 px-1">{children}</span>
    </span>
);
const FormZeile = ({ children, big = true }) => (
    <div className={`flex items-center justify-center flex-wrap gap-x-1 gap-y-2 my-3 ${big ? 'text-2xl sm:text-3xl' : 'text-xl'} font-math text-slate-800 bg-slate-50 border border-slate-200 rounded-xl py-4 px-3`}>
        {children}
    </div>
);

// Inline-Eingabefeld direkt in der Formel
const InlineInput = ({ value, status, onChange, onSubmit, disabled, theme = 'indigo', placeholder = '?', width = 'w-20' }) => {
    const stCls = status === 'correct'
        ? 'border-green-500 bg-green-50 text-green-900 font-bold'
        : status === 'incorrect'
        ? 'border-red-400 bg-red-50 text-red-900'
        : 'border-indigo-400 bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200';
    return (
        <input type="text"
               value={value || ''}
               disabled={disabled}
               onChange={e => onChange(e.target.value.replace('.', ','))}
               onKeyDown={enterToSubmit(onSubmit)}
               placeholder={placeholder}
               className={`${width} h-10 mx-1 text-center text-lg outline-none rounded-md border-2 transition-colors shadow-sm align-middle ${stCls}`} />
    );
};

// ==========================================
// 2. TECHNISCHE SVG-SKIZZEN (vereinfacht, schulbuchnah)
// ==========================================
const KugelSkizze = ({ type, data }) => {
    const stroke = '#1e293b';
    const helper = '#cbd5e1';
    const dim = '#4338ca'; // indigo-700
    const high = '#6366f1'; // indigo-500
    const fill = '#f8fafc';
    return (
        <div className="flex justify-center w-full bg-white p-3 border border-slate-200 rounded-xl shadow-inner mb-4">
            <svg viewBox="0 0 400 280" className="w-full max-w-[340px] aspect-[10/7]">
                {type === 'sphere' && (
                    <g>
                        <circle cx="200" cy="140" r="85" fill={fill} stroke={stroke} strokeWidth="2" />
                        <path d="M 115,140 A 85,24 0 0,0 285,140" fill="none" stroke={stroke} strokeWidth="1.5" />
                        <path d="M 285,140 A 85,24 0 0,0 115,140" fill="none" stroke={helper} strokeWidth="1.5" strokeDasharray="5,5" />
                        <circle cx="200" cy="140" r="3.5" fill={stroke} />
                        {/* Radius diagonal nach oben-rechts (30°), damit er nicht mit der Äquator-Ellipse zusammenfällt */}
                        <line x1="200" y1="140" x2="274" y2="98" stroke={stroke} strokeWidth="2" />
                        {/* r-Label klar OBERHALB der Diagonal-Linie (Linie bei x=255 ist auf y=108, Text-Baseline 100 → ~8px Luft) */}
                        <text x="255" y="100" fill={stroke} fontSize="16" fontStyle="italic" fontWeight="bold" textAnchor="middle">r</text>
                        {data?.label && <text x="200" y="262" fill={stroke} fontSize="13" textAnchor="middle" fontWeight="500">{data.label}</text>}
                    </g>
                )}
                {type === 'hemisphere' && (
                    <g>
                        <path d="M 105,130 A 95,95 0 0,0 295,130" fill={fill} stroke={stroke} strokeWidth="2" />
                        <ellipse cx="200" cy="130" rx="95" ry="26" fill="#e2e8f0" stroke={stroke} strokeWidth="2" />
                        <circle cx="200" cy="130" r="3.5" fill={stroke} />
                        {/* Radius diagonal nach unten-rechts (30°) in den Halbkugelbereich */}
                        <line x1="200" y1="130" x2="282" y2="177" stroke={stroke} strokeWidth="2" />
                        <text x="232" y="170" fill={stroke} fontSize="16" fontStyle="italic" fontWeight="bold" textAnchor="middle">r</text>
                        {data?.label && <text x="200" y="252" fill={stroke} fontSize="13" textAnchor="middle" fontWeight="500">{data.label}</text>}
                    </g>
                )}
                {type === 'hollow_sphere' && (
                    <g>
                        <circle cx="200" cy="140" r="95" fill="#f1f5f9" stroke={stroke} strokeWidth="2" />
                        <circle cx="200" cy="140" r="65" fill="#ffffff" stroke={stroke} strokeWidth="1.5" strokeDasharray="4,4" />
                        <path d="M 105,140 A 95,28 0 0,0 295,140" fill="none" stroke={stroke} strokeWidth="1" />
                        <path d="M 295,140 A 95,28 0 0,0 105,140" fill="none" stroke={helper} strokeWidth="1" strokeDasharray="5,5" />
                        <circle cx="200" cy="140" r="3" fill={stroke} />
                        <line x1="200" y1="140" x2="200" y2="75" stroke={high} strokeWidth="2" />
                        <text x="183" y="105" fill={high} fontSize="14" fontWeight="bold" textAnchor="end">r<tspan dy="3" fontSize="11">i</tspan></text>
                        <line x1="200" y1="140" x2="295" y2="140" stroke={stroke} strokeWidth="2" />
                        <text x="247" y="130" fill={stroke} fontSize="14" fontWeight="bold" textAnchor="middle">r<tspan dy="3" fontSize="11">a</tspan></text>
                        <path d="M 280,85 L 318,68" stroke={helper} strokeWidth="1.2" />
                        <circle cx="280" cy="85" r="3" fill={stroke} />
                        <text x="322" y="72" fill={stroke} fontSize="12" textAnchor="start" fontWeight="600">Wandstärke s</text>
                    </g>
                )}
                {type === 'cube_sphere' && (
                    <g>
                        <path d="M 150,80 L 150,200 M 150,200 L 270,200 M 150,200 L 110,240" stroke={helper} strokeWidth="1.2" strokeDasharray="4,4" fill="none" />
                        <circle cx="190" cy="160" r="60" fill="none" stroke={high} strokeWidth="2" />
                        <ellipse cx="190" cy="160" rx="60" ry="17" fill="none" stroke={helper} strokeWidth="1" strokeDasharray="3,3" />
                        <polygon points="110,120 230,120 230,240 110,240" fill="none" stroke={stroke} strokeWidth="2" />
                        <polygon points="230,120 270,80 270,200 230,240" fill="none" stroke={stroke} strokeWidth="2" />
                        <polygon points="110,120 150,80 270,80 230,120" fill="none" stroke={stroke} strokeWidth="2" />
                        <circle cx="190" cy="160" r="3" fill={high} />
                        <line x1="110" y1="242" x2="110" y2="265" stroke={helper} strokeWidth="1" />
                        <line x1="230" y1="242" x2="230" y2="265" stroke={helper} strokeWidth="1" />
                        <line x1="110" y1="258" x2="230" y2="258" stroke={dim} strokeWidth="1.5" />
                        <line x1="110" y1="254" x2="110" y2="262" stroke={dim} strokeWidth="1.5" />
                        <line x1="230" y1="254" x2="230" y2="262" stroke={dim} strokeWidth="1.5" />
                        <text x="170" y="275" fill={dim} fontSize="14" fontWeight="bold" fontStyle="italic" textAnchor="middle">a</text>
                    </g>
                )}
                {type === 'cone_hemisphere' && (
                    <g>
                        <path d="M 120,170 A 80,80 0 0,0 280,170" fill={fill} stroke={stroke} strokeWidth="2" />
                        <path d="M 120,170 A 80,22 0 0,0 280,170" fill="none" stroke={stroke} strokeWidth="2" />
                        <path d="M 280,170 A 80,22 0 0,0 120,170" fill="none" stroke={helper} strokeWidth="1.5" strokeDasharray="4,4" />
                        <polygon points="120,168 200,40 280,168" fill="rgba(99,102,241,0.05)" stroke={stroke} strokeWidth="2" />
                        <line x1="200" y1="40" x2="200" y2="170" stroke={helper} strokeWidth="1" strokeDasharray="4,4" />
                        <circle cx="200" cy="170" r="3" fill={stroke} />
                        {/* Radius diagonal nach unten-rechts (30°) in den Halbkugel-Innenraum */}
                        <line x1="200" y1="170" x2="269" y2="210" stroke={stroke} strokeWidth="2" />
                        <text x="228" y="204" fill={stroke} fontSize="14" fontWeight="bold" fontStyle="italic">r</text>
                        <line x1="198" y1="40" x2="70" y2="40" stroke={helper} strokeWidth="1" />
                        <line x1="198" y1="170" x2="70" y2="170" stroke={helper} strokeWidth="1" />
                        <line x1="80" y1="40" x2="80" y2="170" stroke={dim} strokeWidth="1.5" />
                        <line x1="76" y1="40" x2="84" y2="40" stroke={dim} strokeWidth="1.5" />
                        <line x1="76" y1="170" x2="84" y2="170" stroke={dim} strokeWidth="1.5" />
                        <text x="60" y="108" fill={dim} fontSize="14" fontWeight="bold" fontStyle="italic" textAnchor="middle">h</text>
                    </g>
                )}
                {type === 'cylinder_sphere' && (
                    <g>
                        <path d="M 130,210 A 70,18 0 0,0 270,210" fill="none" stroke={stroke} strokeWidth="2" />
                        <path d="M 270,210 A 70,18 0 0,0 130,210" fill="none" stroke={helper} strokeWidth="1.5" strokeDasharray="4,4" />
                        <circle cx="200" cy="140" r="70" fill="#f1f5f9" stroke={high} strokeWidth="2.5" strokeDasharray="2,2" />
                        {/* Innere Äquator-Ellipse entfernt — sie überlagerte den Radiusstrich */}
                        <line x1="130" y1="70" x2="130" y2="210" stroke={stroke} strokeWidth="2" />
                        <line x1="270" y1="70" x2="270" y2="210" stroke={stroke} strokeWidth="2" />
                        <ellipse cx="200" cy="70" rx="70" ry="18" fill="none" stroke={stroke} strokeWidth="2" />
                        <line x1="128" y1="70" x2="75" y2="70" stroke={helper} strokeWidth="1" />
                        <line x1="128" y1="210" x2="75" y2="210" stroke={helper} strokeWidth="1" />
                        <line x1="82" y1="70" x2="82" y2="210" stroke={dim} strokeWidth="1.5" />
                        <line x1="78" y1="70" x2="86" y2="70" stroke={dim} strokeWidth="1.5" />
                        <line x1="78" y1="210" x2="86" y2="210" stroke={dim} strokeWidth="1.5" />
                        <text x="60" y="143" fill={dim} fontSize="14" fontWeight="bold" fontStyle="italic" textAnchor="middle">h</text>
                        <circle cx="200" cy="140" r="3" fill={high} />
                        {/* Radius diagonal nach oben-rechts (30°) — keine Überlagerung mit den Cylinder-Ellipsen mehr */}
                        <line x1="200" y1="140" x2="261" y2="105" stroke={high} strokeWidth="2" />
                        <text x="220" y="119" fill={high} fontSize="14" fontWeight="bold" fontStyle="italic">r</text>
                    </g>
                )}
                {type === 'earth_latitude' && (
                    <g>
                        <circle cx="200" cy="140" r="85" fill="#eef2ff" stroke={stroke} strokeWidth="2" />
                        <ellipse cx="200" cy="140" rx="85" ry="22" fill="none" stroke={helper} strokeWidth="1.5" strokeDasharray="4,4" />
                        <ellipse cx="200" cy="80" rx="56" ry="14" fill="none" stroke={high} strokeWidth="2" />
                        <circle cx="200" cy="140" r="3" fill={stroke} />
                        <line x1="200" y1="140" x2="200" y2="80" stroke={stroke} strokeWidth="1.5" strokeDasharray="3,3" />
                        <line x1="200" y1="80" x2="256" y2="80" stroke={high} strokeWidth="2.5" />
                        <line x1="200" y1="140" x2="256" y2="80" stroke={stroke} strokeWidth="2.5" />
                        <path d="M 200,90 L 210,90 L 210,80" fill="none" stroke={stroke} strokeWidth="1" />
                        <text x="228" y="54" fill={high} fontSize="14" fontWeight="bold" textAnchor="middle">r '</text>
                        <text x="238" y="114" fill={stroke} fontSize="14" fontWeight="bold">R</text>
                        <path d="M 230,140 A 30,30 0 0,0 220,116" fill="none" stroke={stroke} strokeWidth="1.5" />
                        <text x="245" y="142" fill={stroke} fontSize="12" fontWeight="600">49°</text>
                    </g>
                )}
            </svg>
        </div>
    );
};

// ==========================================
// 3. STANDARD-FORMELN als JSX (Antwort-Optionen, Tipps, Lösungen)
// ==========================================
const FmlVKugel  = () => <span><Vrb>V</Vrb> = <KBruch top="4" bot="3" /> · π · <Vrb>r</Vrb><Pwr>3</Pwr></span>;
const FmlOKugel  = () => <span><Vrb>O</Vrb> = 4 · π · <Vrb>r</Vrb><Pwr>2</Pwr></span>;
const FmlVHalbk  = () => <span><Vrb>V</Vrb> = <KBruch top="2" bot="3" /> · π · <Vrb>r</Vrb><Pwr>3</Pwr></span>;
const FmlOHalbk  = () => <span><Vrb>O</Vrb> = 2 · π · <Vrb>r</Vrb><Pwr>2</Pwr></span>;
const FmlOHalbGes= () => <span><Vrb>O</Vrb><sub>ges</sub> = 3 · π · <Vrb>r</Vrb><Pwr>2</Pwr></span>;
const FmlVZyl    = () => <span><Vrb>V</Vrb> = π · <Vrb>r</Vrb><Pwr>2</Pwr> · <Vrb>h</Vrb></span>;
const FmlVKegel  = () => <span><Vrb>V</Vrb> = <KBruch top="1" bot="3" /> · π · <Vrb>r</Vrb><Pwr>2</Pwr> · <Vrb>h</Vrb></span>;
const FmlVWuerf  = () => <span><Vrb>V</Vrb> = <Vrb>a</Vrb><Pwr>3</Pwr></span>;
const FmlMasse   = () => <span><Vrb>m</Vrb> = <Vrb>V</Vrb> · ρ</span>;
const FmlROausV  = () => <span><Vrb>r</Vrb> = <KWurz n="3"><KBruch top={<>3 · <Vrb>V</Vrb></>} bot="4 · π" /></KWurz></span>;
const FmlROausO  = () => <span><Vrb>r</Vrb> = <KWurz><KBruch top={<><Vrb>O</Vrb></>} bot="4 · π" /></KWurz></span>;

// ==========================================
// 4. LEICHT — Generatoren (typeId 1..6)
// ==========================================
const buildLeichtTask = (forbiddenIds) => {
    const ids = [1,2,3,4,5,6].filter(i => !forbiddenIds.includes(i));
    const typeId = ids.length ? ids[randInt(0, ids.length-1)] : randInt(1, 6);
    const r = randFloat(4, 10, 1);
    const d = parseFloat((r * 2).toFixed(1));
    const V = (4/3) * Math.PI * r * r * r;
    const O = 4 * Math.PI * r * r;

    if (typeId === 1) {
        // Volumen aus r
        return {
            typeId, level: 'leicht',
            title: 'Kugelvolumen berechnen',
            sketch: 'sphere', sketchData: { label: `r = ${fmtK(r)} cm` },
            description: <>Berechne das Volumen <Vrb>V</Vrb> einer Kugel mit dem Radius <Vrb>r</Vrb> = {fmtK(r)} cm. Runde auf eine Nachkommastelle.</>,
            steps: [
                {
                    type: 'select',
                    goal: 'Wähle die passende Volumenformel.',
                    options: [<FmlVKugel/>, <FmlOKugel/>, <FmlVKegel/>],
                    correctIdx: 0,
                    hint: <>Volumen einer Kugel: <FmlVKugel/></>,
                    solution: <FmlVKugel/>
                },
                {
                    type: 'fill',
                    goal: 'Setze den Radius direkt in die Formel ein.',
                    inputs: [{ id: 'r', correct: r }],
                    render: (h) => <FormZeile><Vrb>V</Vrb> = <KBruch top="4" bot="3" /> · π · {h.input('r')}<Pwr>3</Pwr></FormZeile>,
                    hint: <>Setze <Vrb>r</Vrb> = {fmtK(r)} ein.</>,
                    solution: `r = ${fmtK(r)}`
                },
                {
                    type: 'calc',
                    goal: 'Berechne nun das Volumen V.',
                    label: <Vrb>V</Vrb>, unit: 'cm³',
                    correct: V, tolerance: 1.5, decimals: 1,
                    hint: <>Rechne: 4 ÷ 3 · π · {fmtK(r)}<Pwr>3</Pwr>. Achte auf die Klammern beim Taschenrechner.</>,
                    solution: `V ≈ ${fmtK(V, 1)} cm³`
                }
            ]
        };
    }
    if (typeId === 2) {
        return {
            typeId, level: 'leicht',
            title: 'Kugeloberfläche berechnen',
            sketch: 'sphere', sketchData: { label: `r = ${fmtK(r)} cm` },
            description: <>Berechne die Oberfläche <Vrb>O</Vrb> einer Kugel mit dem Radius <Vrb>r</Vrb> = {fmtK(r)} cm. Runde auf eine Nachkommastelle.</>,
            steps: [
                { type:'select', goal:'Wähle die passende Oberflächenformel.', options:[<FmlOKugel/>, <FmlVKugel/>, <span><Vrb>O</Vrb> = 2 · π · <Vrb>r</Vrb><Pwr>2</Pwr></span>], correctIdx:0,
                  hint:<>Die Kugeloberfläche ist das Vierfache der Kreisfläche: <FmlOKugel/></>, solution:<FmlOKugel/> },
                { type:'fill', goal:'Setze den Radius in die Formel ein.', inputs:[{id:'r', correct:r}],
                  render:(h)=> <FormZeile><Vrb>O</Vrb> = 4 · π · {h.input('r')}<Pwr>2</Pwr></FormZeile>,
                  hint:<>Setze <Vrb>r</Vrb> = {fmtK(r)} ein.</>, solution:`r = ${fmtK(r)}` },
                { type:'calc', goal:'Berechne die Oberfläche O.', label:<Vrb>O</Vrb>, unit:'cm²',
                  correct: O, tolerance:1.0, decimals:1,
                  hint:<>Rechne: 4 · π · {fmtK(r*r)}.</>, solution:`O ≈ ${fmtK(O,1)} cm²` }
            ]
        };
    }
    if (typeId === 3) {
        return {
            typeId, level: 'leicht',
            title: 'Volumen aus Durchmesser',
            sketch: 'sphere', sketchData: { label: `d = ${fmtK(d)} cm` },
            description: <>Eine Kugel hat den Durchmesser <Vrb>d</Vrb> = {fmtK(d)} cm. Berechne ihr Volumen <Vrb>V</Vrb>.</>,
            steps: [
                { type:'select', goal:'Wähle die Volumenformel.', options:[<FmlVKugel/>, <FmlVZyl/>, <FmlVKegel/>], correctIdx:0,
                  hint:<>Volumen der Kugel: <FmlVKugel/></>, solution:<FmlVKugel/> },
                { type:'fill', goal:'Halbiere den Durchmesser und setze den Radius in die Formel ein.',
                  inputs:[{id:'r', correct:r}],
                  render:(h)=> <FormZeile><Vrb>V</Vrb> = <KBruch top="4" bot="3" /> · π · {h.input('r')}<Pwr>3</Pwr></FormZeile>,
                  hint:<>Der Radius ist die Hälfte des Durchmessers: <Vrb>r</Vrb> = <Vrb>d</Vrb> ÷ 2 = {fmtK(d)} ÷ 2 = {fmtK(r)}.</>,
                  solution:`r = ${fmtK(r)}` },
                { type:'calc', goal:'Berechne nun das Volumen V.',
                  label:<Vrb>V</Vrb>, unit:'cm³', correct:V, tolerance:1.5, decimals:1,
                  hint:<>Rechne 4 ÷ 3 · π · {fmtK(r)}<Pwr>3</Pwr>.</>, solution:`V ≈ ${fmtK(V,1)} cm³` }
            ]
        };
    }
    if (typeId === 4) {
        const Oround = parseFloat(O.toFixed(1));
        return {
            typeId, level: 'leicht',
            title: 'Radius aus Oberfläche',
            sketch: 'sphere', sketchData: { label: `O = ${fmtK(Oround)} cm²` },
            description: <>Eine Kugel hat eine Oberfläche von <Vrb>O</Vrb> = {fmtK(Oround,1)} cm². Berechne den Radius <Vrb>r</Vrb>.</>,
            steps: [
                { type:'select', goal:'Schritt 1: Wähle die Oberflächenformel der Kugel.',
                  options:[<FmlOKugel/>, <FmlVKugel/>, <span><Vrb>O</Vrb> = 2 · π · <Vrb>r</Vrb><Pwr>2</Pwr></span>], correctIdx:0,
                  hint:<>Die Oberfläche der Kugel: <FmlOKugel/></>, solution:<FmlOKugel/> },
                { type:'select', goal:'Schritt 2: Welche Formel ist korrekt nach r umgestellt?',
                  options:[<FmlROausO/>, <span><Vrb>r</Vrb> = <KBruch top={<Vrb>O</Vrb>} bot="4 · π" /></span>, <span><Vrb>r</Vrb> = <KWurz><KBruch top="4 · π" bot={<Vrb>O</Vrb>} /></KWurz></span>], correctIdx:0,
                  hint:<>Teile zuerst durch 4·π und ziehe dann die Wurzel: <FmlROausO/></>, solution:<FmlROausO/> },
                { type:'fill', goal:'Schritt 3: Setze die Oberfläche in die umgestellte Formel ein.',
                  inputs:[{id:'O', correct:Oround}],
                  render:(h)=> <FormZeile><Vrb>r</Vrb> = <KWurz><KBruch top={h.input('O')} bot="4 · π" /></KWurz></FormZeile>,
                  hint:<>Setze <Vrb>O</Vrb> = {fmtK(Oround,1)} ein.</>, solution:`O = ${fmtK(Oround,1)}` },
                { type:'calc', goal:'Schritt 4: Berechne den Radius r.',
                  label:<Vrb>r</Vrb>, unit:'cm', correct:r, tolerance:0.2, decimals:1,
                  hint:<>Teile {fmtK(Oround,1)} durch (4·π) und ziehe die Quadratwurzel.</>,
                  solution:`r ≈ ${fmtK(r,1)} cm` }
            ]
        };
    }
    if (typeId === 5) {
        const Vr = parseFloat(V.toFixed(1));
        return {
            typeId, level: 'leicht',
            title: 'Radius aus Volumen',
            sketch: 'sphere', sketchData: { label: `V = ${fmtK(Vr,1)} cm³` },
            description: <>Eine Kugel hat das Volumen <Vrb>V</Vrb> = {fmtK(Vr,1)} cm³. Berechne den Radius <Vrb>r</Vrb>.</>,
            steps: [
                { type:'select', goal:'Schritt 1: Wähle die Volumenformel der Kugel.',
                  options:[<FmlVKugel/>, <FmlOKugel/>, <FmlVKegel/>], correctIdx:0,
                  hint:<>Volumen der Kugel: <FmlVKugel/></>, solution:<FmlVKugel/> },
                { type:'select', goal:'Schritt 2: Welche Formel ist korrekt nach r umgestellt?',
                  options:[<FmlROausV/>, <span><Vrb>r</Vrb> = <KWurz><KBruch top={<>3 · <Vrb>V</Vrb></>} bot="4 · π" /></KWurz></span>, <span><Vrb>r</Vrb> = <KBruch top={<>3 · <Vrb>V</Vrb></>} bot="4 · π" /></span>], correctIdx:0,
                  hint:<>Multipliziere mit 3, teile durch 4·π und ziehe die dritte Wurzel: <FmlROausV/></>, solution:<FmlROausV/> },
                { type:'fill', goal:'Schritt 3: Setze das Volumen in die umgestellte Formel ein.',
                  inputs:[{id:'V', correct:Vr, decimals:1}],
                  render:(h)=> <FormZeile><Vrb>r</Vrb> = <KWurz n="3"><KBruch top={<>3 · {h.input('V', 'w-24')}</>} bot="4 · π" /></KWurz></FormZeile>,
                  hint:<>Setze <Vrb>V</Vrb> = {fmtK(Vr,1)} ein.</>, solution:`V = ${fmtK(Vr,1)}` },
                { type:'calc', goal:'Schritt 4: Berechne den Radius r.',
                  label:<Vrb>r</Vrb>, unit:'cm', correct:r, tolerance:0.2, decimals:1,
                  hint:<>Rechne (3 · {fmtK(Vr,1)}) ÷ (4 · π) und ziehe daraus die dritte Wurzel.</>,
                  solution:`r ≈ ${fmtK(r,1)} cm` }
            ]
        };
    }
    // typeId === 6 — Oberfläche aus Durchmesser
    return {
        typeId, level: 'leicht',
        title: 'Oberfläche aus Durchmesser',
        sketch: 'sphere', sketchData: { label: `d = ${fmtK(d)} cm` },
        description: <>Eine Kugel hat den Durchmesser <Vrb>d</Vrb> = {fmtK(d)} cm. Berechne ihre Oberfläche <Vrb>O</Vrb>.</>,
        steps: [
            { type:'select', goal:'Wähle die Oberflächenformel.',
              options:[<FmlOKugel/>, <FmlVKugel/>, <span><Vrb>O</Vrb> = 2 · π · <Vrb>r</Vrb><Pwr>2</Pwr></span>], correctIdx:0,
              hint:<>Oberfläche der Kugel: <FmlOKugel/></>, solution:<FmlOKugel/> },
            { type:'fill', goal:'Halbiere den Durchmesser und setze den Radius in die Formel ein.',
              inputs:[{id:'r', correct:r}],
              render:(h)=> <FormZeile><Vrb>O</Vrb> = 4 · π · {h.input('r')}<Pwr>2</Pwr></FormZeile>,
              hint:<>Der Radius ist die Hälfte des Durchmessers: <Vrb>r</Vrb> = <Vrb>d</Vrb> ÷ 2 = {fmtK(d)} ÷ 2 = {fmtK(r)}.</>,
              solution:`r = ${fmtK(r)}` },
            { type:'calc', goal:'Berechne nun die Oberfläche O.',
              label:<Vrb>O</Vrb>, unit:'cm²', correct:O, tolerance:1.0, decimals:1,
              hint:<>Rechne 4 · π · {fmtK(r*r,1)}.</>, solution:`O ≈ ${fmtK(O,1)} cm²` }
        ]
    };
};

// ==========================================
// 5. MITTEL — Generatoren (Stufe 2, vermischte Aufgaben mit Anwendungsbezug)
// ==========================================
const buildMittelTask = (forbiddenIds) => {
    const ids = [1,2,3,4,5,6].filter(i => !forbiddenIds.includes(i));
    const typeId = ids.length ? ids[randInt(0, ids.length-1)] : randInt(1, 6);
    const r = randFloat(3, 8, 0.5);
    const V = (4/3) * Math.PI * r * r * r;
    const O = 4 * Math.PI * r * r;

    if (typeId === 1) {
        // Masse einer massiven Kugel
        const materials = [
            { name: 'Eisen', rho: 7.8 }, { name: 'Gold', rho: 19.3 },
            { name: 'Blei', rho: 11.3 }, { name: 'Kupfer', rho: 8.9 }
        ];
        const mat = materials[randInt(0, materials.length-1)];
        const m = V * mat.rho;
        return {
            typeId, level:'mittel', title:'Masse einer Metallkugel',
            sketch:'sphere', sketchData:{label:`r = ${fmtK(r)} cm, ρ = ${fmtK(mat.rho)} g/cm³`},
            description: <>Eine massive Kugel aus <strong>{mat.name}</strong> (Dichte ρ = {fmtK(mat.rho)} g/cm³) hat den Radius <Vrb>r</Vrb> = {fmtK(r)} cm. Berechne die Masse der Kugel in Gramm.</>,
            steps: [
                { type:'select', goal:'Schritt 1: Wähle die Kugelvolumenformel.',
                  options:[<FmlVKugel/>, <FmlOKugel/>, <FmlVZyl/>], correctIdx:0,
                  hint:<>Zuerst das Volumen berechnen: <FmlVKugel/></>, solution:<FmlVKugel/> },
                { type:'fill', goal:'Schritt 2: Setze den Radius in die Formel ein.',
                  inputs:[{id:'r', correct:r}],
                  render:(h)=> <FormZeile><Vrb>V</Vrb> = <KBruch top="4" bot="3" /> · π · {h.input('r')}<Pwr>3</Pwr></FormZeile>,
                  hint:<>Setze <Vrb>r</Vrb> = {fmtK(r)} ein.</>, solution:`r = ${fmtK(r)}` },
                { type:'calc', goal:'Schritt 3: Berechne das Volumen V.',
                  label:<Vrb>V</Vrb>, unit:'cm³', correct:V, tolerance:1.5, decimals:1,
                  hint:<>Rechne (4/3) · π · {fmtK(r)}<Pwr>3</Pwr>.</>, solution:`V ≈ ${fmtK(V,1)} cm³` },
                { type:'select', goal:'Schritt 4: Welcher Zusammenhang gilt für die Masse?',
                  options:[<FmlMasse/>, <span><Vrb>m</Vrb> = <Vrb>V</Vrb> ÷ ρ</span>, <span><Vrb>m</Vrb> = ρ ÷ <Vrb>V</Vrb></span>], correctIdx:0,
                  hint:<>Masse = Volumen · Dichte.</>, solution:<FmlMasse/> },
                { type:'fill', goal:'Schritt 5: Setze Volumen und Dichte ein.',
                  inputs:[{id:'V', correct:parseFloat(V.toFixed(1)), decimals:1}, {id:'rho', correct:mat.rho}],
                  render:(h)=> <FormZeile><Vrb>m</Vrb> = {h.input('V','w-24')} · {h.input('rho')}</FormZeile>,
                  hint:<>Verwende dein berechnetes Volumen ({fmtK(V,1)}) und die Dichte ({fmtK(mat.rho)}).</>,
                  solution:`V = ${fmtK(V,1)}, ρ = ${fmtK(mat.rho)}` },
                { type:'calc', goal:'Schritt 6: Berechne die Masse m in Gramm.',
                  label:<Vrb>m</Vrb>, unit:'g', correct:m, tolerance:5.0, decimals:0,
                  hint:<>Multipliziere Volumen mit Dichte.</>, solution:`m ≈ ${fmtK(Math.round(m))} g` }
            ]
        };
    }
    if (typeId === 2) {
        // Schüssel = Halbkugel in Liter
        const rcm = randInt(8, 14);
        const Vhk = (2/3) * Math.PI * rcm * rcm * rcm;
        const liter = Vhk / 1000;
        return {
            typeId, level:'mittel', title:'Halbkugelförmige Schüssel',
            sketch:'hemisphere', sketchData:{label:`Innenradius r = ${rcm} cm`},
            description: <>Eine Schüssel hat die Form einer Halbkugel mit dem Innenradius <Vrb>r</Vrb> = {rcm} cm. Berechne das maximale Fassungsvermögen in Litern (1 ℓ = 1 000 cm³).</>,
            steps: [
                { type:'select', goal:'Schritt 1: Wähle die Volumenformel für die Halbkugel.',
                  options:[<FmlVHalbk/>, <FmlVKugel/>, <FmlOHalbk/>], correctIdx:0,
                  hint:<>Halbkugelvolumen: <FmlVHalbk/></>, solution:<FmlVHalbk/> },
                { type:'fill', goal:'Schritt 2: Setze den Radius in die Formel ein.',
                  inputs:[{id:'r', correct:rcm}],
                  render:(h)=> <FormZeile><Vrb>V</Vrb> = <KBruch top="2" bot="3" /> · π · {h.input('r')}<Pwr>3</Pwr></FormZeile>,
                  hint:<>Setze <Vrb>r</Vrb> = {rcm} ein.</>, solution:`r = ${rcm}` },
                { type:'calc', goal:'Schritt 3: Berechne das Volumen in cm³.',
                  label:<Vrb>V</Vrb>, unit:'cm³', correct:Vhk, tolerance:2.0, decimals:1,
                  hint:<>(2 ÷ 3) · π · {rcm}<Pwr>3</Pwr>.</>, solution:`V ≈ ${fmtK(Vhk,1)} cm³` },
                { type:'calc', goal:'Schritt 4: Rechne den Wert in Liter um.',
                  label:<Vrb>V</Vrb>, unit:'ℓ', correct:liter, tolerance:0.05, decimals:2,
                  hint:<>Teile den cm³-Wert durch 1 000.</>, solution:`V ≈ ${fmtK(liter,2)} ℓ` }
            ]
        };
    }
    if (typeId === 3) {
        // Gesamtoberfläche massive Halbkugel
        const rh = randFloat(4, 9, 0.5);
        const Oges = 3 * Math.PI * rh * rh;
        return {
            typeId, level:'mittel', title:'Oberfläche einer massiven Halbkugel',
            sketch:'hemisphere', sketchData:{label:`r = ${fmtK(rh)} cm`},
            description: <>Eine massive, dekorative Halbkugel aus Holz hat den Radius <Vrb>r</Vrb> = {fmtK(rh)} cm. Berechne die gesamte Oberfläche (gewölbte Schale + flache Bodenfläche).</>,
            steps: [
                { type:'select', goal:'Schritt 1: Welche Formel beschreibt die Gesamtoberfläche?',
                  options:[<FmlOHalbGes/>, <FmlOHalbk/>, <FmlOKugel/>], correctIdx:0,
                  hint:<>Gewölbte Schale (2 · π · r²) + flache Kreisfläche (π · r²) = 3 · π · r².</>,
                  solution:<FmlOHalbGes/> },
                { type:'fill', goal:'Schritt 2: Setze den Radius ein.',
                  inputs:[{id:'r', correct:rh}],
                  render:(h)=> <FormZeile><Vrb>O</Vrb><sub>ges</sub> = 3 · π · {h.input('r')}<Pwr>2</Pwr></FormZeile>,
                  hint:<>Setze <Vrb>r</Vrb> = {fmtK(rh)} ein.</>, solution:`r = ${fmtK(rh)}` },
                { type:'calc', goal:'Schritt 3: Berechne die Gesamtoberfläche.',
                  label:<span><Vrb>O</Vrb><sub>ges</sub></span>, unit:'cm²', correct:Oges, tolerance:1.0, decimals:1,
                  hint:<>3 · π · {fmtK(rh*rh,2)}.</>, solution:`O ≈ ${fmtK(Oges,1)} cm²` }
            ]
        };
    }
    if (typeId === 4) {
        // Kugel im Zylinder — Restluftvolumen
        const rc = randFloat(3, 7, 0.5);
        const Vz = Math.PI * rc * rc * (2 * rc);
        const Vk = (4/3) * Math.PI * rc * rc * rc;
        const Vluft = Vz - Vk;
        return {
            typeId, level:'mittel', title:'Kugel im passgenauen Zylinder',
            sketch:'cylinder_sphere', sketchData:{label:`r = ${fmtK(rc)} cm, h = ${fmtK(2*rc)} cm`},
            description: <>Eine Kugel mit Radius <Vrb>r</Vrb> = {fmtK(rc)} cm liegt passgenau in einem Zylinder gleicher Höhe (<Vrb>h</Vrb> = {fmtK(2*rc)} cm) und gleichen Radius. Berechne das Volumen der verbleibenden Luft.</>,
            steps: [
                { type:'select', goal:'Schritt 1: Wähle die Volumenformel des Zylinders.',
                  options:[<FmlVZyl/>, <FmlVKegel/>, <FmlVKugel/>], correctIdx:0,
                  hint:<>Zylinder: Grundkreisfläche · Höhe.</>, solution:<FmlVZyl/> },
                { type:'fill', goal:'Schritt 2: Setze Radius und Höhe ein.',
                  inputs:[{id:'r', correct:rc}, {id:'h', correct:parseFloat((2*rc).toFixed(1))}],
                  render:(h)=> <FormZeile><Vrb>V</Vrb><sub>Zyl</sub> = π · {h.input('r')}<Pwr>2</Pwr> · {h.input('h')}</FormZeile>,
                  hint:<>r = {fmtK(rc)} und h = {fmtK(2*rc)}.</>, solution:`r = ${fmtK(rc)}, h = ${fmtK(2*rc)}` },
                { type:'calc', goal:'Schritt 3: Berechne das Zylindervolumen.',
                  label:<span><Vrb>V</Vrb><sub>Zyl</sub></span>, unit:'cm³', correct:Vz, tolerance:2.0, decimals:1,
                  hint:<>π · {fmtK(rc*rc,2)} · {fmtK(2*rc)}.</>, solution:`V_Zyl ≈ ${fmtK(Vz,1)} cm³` },
                { type:'calc', goal:'Schritt 4: Berechne das Kugelvolumen.',
                  label:<span><Vrb>V</Vrb><sub>Kugel</sub></span>, unit:'cm³', correct:Vk, tolerance:2.0, decimals:1,
                  hint:<>(4 ÷ 3) · π · {fmtK(rc)}<Pwr>3</Pwr>.</>, solution:`V_Kugel ≈ ${fmtK(Vk,1)} cm³` },
                { type:'calc', goal:'Schritt 5: Ziehe das Kugelvolumen vom Zylindervolumen ab.',
                  label:<span><Vrb>V</Vrb><sub>Luft</sub></span>, unit:'cm³', correct:Vluft, tolerance:2.0, decimals:1,
                  hint:<><Vrb>V</Vrb><sub>Luft</sub> = <Vrb>V</Vrb><sub>Zyl</sub> − <Vrb>V</Vrb><sub>Kugel</sub>.</>,
                  solution:`V_Luft ≈ ${fmtK(Vluft,1)} cm³` }
            ]
        };
    }
    if (typeId === 5) {
        // Eintauchversuch
        const rk = randFloat(2, 4.5, 0.5);
        const rz = randInt(6, 10);
        const Vk = (4/3) * Math.PI * rk * rk * rk;
        const dh = Vk / (Math.PI * rz * rz);
        return {
            typeId, level:'mittel', title:'Eintauchversuch im Standzylinder',
            sketch:'cylinder_sphere', sketchData:{label:`r_Zyl = ${rz} cm, r_K = ${fmtK(rk)} cm`},
            description: <>In einen Standzylinder mit Wasser (Radius <Vrb>r</Vrb><sub>Zyl</sub> = {rz} cm) wird eine massive Kugel (<Vrb>r</Vrb><sub>K</sub> = {fmtK(rk)} cm) eingetaucht, bis sie vollständig bedeckt ist. Um wie viele cm steigt der Wasserspiegel?</>,
            steps: [
                { type:'fill', goal:'Schritt 1: Setze den Kugelradius in die Volumenformel ein.',
                  inputs:[{id:'r', correct:rk}],
                  render:(h)=> <FormZeile><Vrb>V</Vrb><sub>K</sub> = <KBruch top="4" bot="3" /> · π · {h.input('r')}<Pwr>3</Pwr></FormZeile>,
                  hint:<>Setze den Kugelradius ein.</>, solution:`r = ${fmtK(rk)}` },
                { type:'calc', goal:'Schritt 2: Berechne das Kugelvolumen V_K.',
                  label:<span><Vrb>V</Vrb><sub>K</sub></span>, unit:'cm³', correct:Vk, tolerance:1.5, decimals:1,
                  hint:<>Das verdrängte Wasservolumen entspricht dem Kugelvolumen.</>,
                  solution:`V_K ≈ ${fmtK(Vk,1)} cm³` },
                { type:'fill', goal:'Schritt 3: Das verdrängte Wasser bildet einen Zylinder. Setze ein.',
                  inputs:[{id:'V', correct:parseFloat(Vk.toFixed(1)), decimals:1}, {id:'r', correct:rz}],
                  render:(h)=> <FormZeile>{h.input('V','w-24')} = π · {h.input('r')}<Pwr>2</Pwr> · Δ<Vrb>h</Vrb></FormZeile>,
                  hint:<>Links das Kugelvolumen ({fmtK(Vk,1)}), rechts der Zylinderradius ({rz}).</>,
                  solution:`V = ${fmtK(Vk,1)}, r = ${rz}` },
                { type:'calc', goal:'Schritt 4: Berechne den Wasserspiegel-Anstieg Δh.',
                  label:<span>Δ<Vrb>h</Vrb></span>, unit:'cm', correct:dh, tolerance:0.1, decimals:2,
                  hint:<>Δ<Vrb>h</Vrb> = <Vrb>V</Vrb><sub>K</sub> ÷ (π · <Vrb>r</Vrb><sub>Zyl</sub><Pwr>2</Pwr>).</>,
                  solution:`Δh ≈ ${fmtK(dh,2)} cm` }
            ]
        };
    }
    // typeId 6 — Volumen aus Oberfläche
    const Or = parseFloat(O.toFixed(1));
    return {
        typeId, level:'mittel', title:'Volumen aus gegebener Oberfläche',
        sketch:'sphere', sketchData:{label:`O = ${fmtK(Or,1)} cm²`},
        description: <>Eine Kugel hat die Oberfläche <Vrb>O</Vrb> = {fmtK(Or,1)} cm². Berechne ihr Volumen <Vrb>V</Vrb>.</>,
        steps: [
            { type:'select', goal:'Schritt 1: Welche Formel verbindet Oberfläche und Radius?',
              options:[<FmlOKugel/>, <FmlVKugel/>, <FmlOHalbk/>], correctIdx:0,
              hint:<>Über die Oberflächenformel den Radius bestimmen.</>, solution:<FmlOKugel/> },
            { type:'fill', goal:'Schritt 2: Setze die Oberfläche in die nach r umgestellte Formel ein.',
              inputs:[{id:'O', correct:Or, decimals:1}],
              render:(h)=> <FormZeile><Vrb>r</Vrb> = <KWurz><KBruch top={h.input('O','w-24')} bot="4 · π" /></KWurz></FormZeile>,
              hint:<>Setze <Vrb>O</Vrb> = {fmtK(Or,1)} ein.</>, solution:`O = ${fmtK(Or,1)}` },
            { type:'calc', goal:'Schritt 3: Berechne den Radius r.',
              label:<Vrb>r</Vrb>, unit:'cm', correct:r, tolerance:0.1, decimals:1,
              hint:<>√(O ÷ (4 · π)).</>, solution:`r ≈ ${fmtK(r,1)} cm` },
            { type:'fill', goal:'Schritt 4: Setze den Radius in die Volumenformel ein.',
              inputs:[{id:'r', correct:r}],
              render:(h)=> <FormZeile><Vrb>V</Vrb> = <KBruch top="4" bot="3" /> · π · {h.input('r')}<Pwr>3</Pwr></FormZeile>,
              hint:<>Setze deinen Radius ein.</>, solution:`r = ${fmtK(r)}` },
            { type:'calc', goal:'Schritt 5: Berechne das Volumen V.',
              label:<Vrb>V</Vrb>, unit:'cm³', correct:V, tolerance:2.0, decimals:1,
              hint:<>(4 ÷ 3) · π · r³.</>, solution:`V ≈ ${fmtK(V,1)} cm³` }
        ]
    };
};

// ==========================================
// 6. SCHWER — Hohlkugel, Umschmelzen, zusammengesetzte Körper, Wandstärke
// ==========================================
const buildSchwerTask = (forbiddenIds) => {
    const ids = [1,2,3,4,5,6].filter(i => !forbiddenIds.includes(i));
    const typeId = ids.length ? ids[randInt(0, ids.length-1)] : randInt(1, 6);

    if (typeId === 1) {
        // Reine Hohlkugel
        const ra = randInt(6, 10);
        const s = 2;
        const ri = ra - s;
        const Va = (4/3) * Math.PI * ra**3;
        const Vi = (4/3) * Math.PI * ri**3;
        const Vh = Va - Vi;
        return {
            typeId, level:'schwer', title:'Materialvolumen einer Hohlkugel',
            sketch:'hollow_sphere', sketchData:{label:`r_a = ${ra} cm, s = ${s} cm`},
            description: <>Eine Hohlkugel hat den Außenradius <Vrb>r</Vrb><sub>a</sub> = {ra} cm und die Wandstärke <Vrb>s</Vrb> = {s} cm. Berechne das reine Materialvolumen.</>,
            steps: [
                { type:'calc', goal:'Schritt 1: Berechne zuerst den Innenradius r_i.',
                  label:<span><Vrb>r</Vrb><sub>i</sub></span>, unit:'cm', correct:ri, tolerance:0.1, decimals:1,
                  hint:<><Vrb>r</Vrb><sub>i</sub> = <Vrb>r</Vrb><sub>a</sub> − <Vrb>s</Vrb>.</>,
                  solution:`r_i = ${ri} cm` },
                { type:'calc', goal:'Schritt 2: Berechne das Außenvolumen V_a.',
                  label:<span><Vrb>V</Vrb><sub>a</sub></span>, unit:'cm³', correct:Va, tolerance:2.0, decimals:1,
                  hint:<>(4 ÷ 3) · π · {ra}<Pwr>3</Pwr>.</>, solution:`V_a ≈ ${fmtK(Va,1)} cm³` },
                { type:'calc', goal:'Schritt 3: Berechne das Innenvolumen V_i.',
                  label:<span><Vrb>V</Vrb><sub>i</sub></span>, unit:'cm³', correct:Vi, tolerance:2.0, decimals:1,
                  hint:<>(4 ÷ 3) · π · {ri}<Pwr>3</Pwr>.</>, solution:`V_i ≈ ${fmtK(Vi,1)} cm³` },
                { type:'calc', goal:'Schritt 4: Berechne das Materialvolumen (V_a − V_i).',
                  label:<Vrb>V</Vrb>, unit:'cm³', correct:Vh, tolerance:2.0, decimals:1,
                  hint:<>Subtrahiere V_i von V_a.</>, solution:`V ≈ ${fmtK(Vh,1)} cm³` }
            ]
        };
    }
    if (typeId === 2) {
        // Würfel → Kugel umschmelzen
        const a = randInt(5, 10);
        const Vw = a**3;
        const rNew = Math.cbrt(3 * Vw / (4 * Math.PI));
        return {
            typeId, level:'schwer', title:'Würfel zu Kugel umschmelzen',
            sketch:'cube_sphere', sketchData:{label:`a = ${a} cm`},
            description: <>Ein massiver Eisenwürfel mit der Kantenlänge <Vrb>a</Vrb> = {a} cm wird eingeschmolzen und zu einer Kugel gegossen. Berechne den Radius <Vrb>r</Vrb> der neuen Kugel.</>,
            steps: [
                { type:'calc', goal:'Schritt 1: Berechne das Würfelvolumen V_W.',
                  label:<span><Vrb>V</Vrb><sub>W</sub></span>, unit:'cm³', correct:Vw, tolerance:0.1, decimals:0,
                  hint:<><Vrb>V</Vrb> = <Vrb>a</Vrb><Pwr>3</Pwr>.</>, solution:`V_W = ${Vw} cm³` },
                { type:'select', goal:'Schritt 2: Welches Prinzip gilt beim Umschmelzen?',
                  options:[<span><Vrb>V</Vrb><sub>Kugel</sub> = <Vrb>V</Vrb><sub>Würfel</sub></span>, <span><Vrb>O</Vrb><sub>Kugel</sub> = <Vrb>O</Vrb><sub>Würfel</sub></span>, <span><Vrb>d</Vrb><sub>Kugel</sub> = <Vrb>a</Vrb></span>], correctIdx:0,
                  hint:<>Beim Schmelzen geht kein Material verloren — das Volumen bleibt gleich.</>,
                  solution:<span>V_Kugel = V_Würfel</span> },
                { type:'fill', goal:'Schritt 3: Setze das Würfelvolumen in die nach r umgestellte Kugelformel ein.',
                  inputs:[{id:'V', correct:Vw, decimals:0}],
                  render:(h)=> <FormZeile><Vrb>r</Vrb> = <KWurz n="3"><KBruch top={<>3 · {h.input('V','w-24')}</>} bot="4 · π" /></KWurz></FormZeile>,
                  hint:<>Setze <Vrb>V</Vrb> = {Vw} ein.</>, solution:`V = ${Vw}` },
                { type:'calc', goal:'Schritt 4: Berechne den Radius r der Kugel.',
                  label:<Vrb>r</Vrb>, unit:'cm', correct:rNew, tolerance:0.1, decimals:2,
                  hint:<>(3 · {Vw}) ÷ (4 · π) und davon die dritte Wurzel.</>,
                  solution:`r ≈ ${fmtK(rNew,2)} cm` }
            ]
        };
    }
    if (typeId === 3) {
        // Halbkugel + Kegel (Pokal)
        const r = randInt(4, 7);
        const h = randInt(8, 12);
        const Vhk = (2/3) * Math.PI * r**3;
        const Vk = (1/3) * Math.PI * r * r * h;
        const Vges = Vhk + Vk;
        return {
            typeId, level:'schwer', title:'Zusammengesetzter Körper (Pokal)',
            sketch:'cone_hemisphere', sketchData:{label:`r = ${r} cm, h = ${h} cm`},
            description: <>Ein Körper besteht aus einer Halbkugel (<Vrb>r</Vrb> = {r} cm) und einem aufgesetzten Kegel mit gleichem Grundkreis und der Höhe <Vrb>h</Vrb> = {h} cm. Berechne das Gesamtvolumen.</>,
            steps: [
                { type:'calc', goal:'Schritt 1: Berechne das Volumen der Halbkugel.',
                  label:<span><Vrb>V</Vrb><sub>H</sub></span>, unit:'cm³', correct:Vhk, tolerance:2.0, decimals:1,
                  hint:<>(2 ÷ 3) · π · {r}<Pwr>3</Pwr>.</>, solution:`V_H ≈ ${fmtK(Vhk,1)} cm³` },
                { type:'calc', goal:'Schritt 2: Berechne das Volumen des Kegels.',
                  label:<span><Vrb>V</Vrb><sub>K</sub></span>, unit:'cm³', correct:Vk, tolerance:2.0, decimals:1,
                  hint:<>(1 ÷ 3) · π · {r}<Pwr>2</Pwr> · {h}.</>, solution:`V_K ≈ ${fmtK(Vk,1)} cm³` },
                { type:'calc', goal:'Schritt 3: Berechne das Gesamtvolumen.',
                  label:<span><Vrb>V</Vrb><sub>ges</sub></span>, unit:'cm³', correct:Vges, tolerance:2.5, decimals:1,
                  hint:<>Addiere beide Teilvolumina.</>, solution:`V_ges ≈ ${fmtK(Vges,1)} cm³` }
            ]
        };
    }
    if (typeId === 4) {
        // Kugel → Zylinder umschmelzen
        const rs = randInt(4, 7);
        const Vs = (4/3) * Math.PI * rs**3;
        const rz = randInt(3, 5);
        const hz = Vs / (Math.PI * rz * rz);
        return {
            typeId, level:'schwer', title:'Kugel zu Zylinder umschmelzen',
            sketch:'cylinder_sphere', sketchData:{label:`r_K = ${rs} cm → r_Z = ${rz} cm`},
            description: <>Eine massive Kupferkugel (<Vrb>r</Vrb><sub>K</sub> = {rs} cm) wird geschmolzen und zu einem Zylinder mit Radius <Vrb>r</Vrb><sub>Z</sub> = {rz} cm geformt. Berechne die Höhe <Vrb>h</Vrb> des Zylinders.</>,
            steps: [
                { type:'calc', goal:'Schritt 1: Berechne das Volumen der Ausgangskugel.',
                  label:<Vrb>V</Vrb>, unit:'cm³', correct:Vs, tolerance:2.0, decimals:1,
                  hint:<>(4 ÷ 3) · π · {rs}<Pwr>3</Pwr>.</>, solution:`V ≈ ${fmtK(Vs,1)} cm³` },
                { type:'fill', goal:'Schritt 2: Setze in die Zylinderformel ein.',
                  inputs:[{id:'V', correct:parseFloat(Vs.toFixed(1)), decimals:1}, {id:'r', correct:rz}],
                  render:(h)=> <FormZeile>{h.input('V','w-24')} = π · {h.input('r')}<Pwr>2</Pwr> · <Vrb>h</Vrb></FormZeile>,
                  hint:<>Links: Kugelvolumen. Rechts: Zylinderradius {rz}.</>,
                  solution:`V = ${fmtK(Vs,1)}, r = ${rz}` },
                { type:'calc', goal:'Schritt 3: Berechne die Zylinderhöhe h.',
                  label:<Vrb>h</Vrb>, unit:'cm', correct:hz, tolerance:0.2, decimals:1,
                  hint:<><Vrb>h</Vrb> = <Vrb>V</Vrb> ÷ (π · <Vrb>r</Vrb><Pwr>2</Pwr>).</>,
                  solution:`h ≈ ${fmtK(hz,1)} cm` }
            ]
        };
    }
    if (typeId === 5) {
        // Halbkugel → Kegel umschmelzen
        const rh = randFloat(5, 8, 0.5);
        const Vhk = (2/3) * Math.PI * rh**3;
        const hKegel = 2 * rh;
        return {
            typeId, level:'schwer', title:'Halbkugel zu Kegel umschmelzen',
            sketch:'cone_hemisphere', sketchData:{label:`r = ${fmtK(rh)} cm`},
            description: <>Eine massive Halbkugel aus Zinn (<Vrb>r</Vrb> = {fmtK(rh)} cm) wird geschmolzen. Daraus wird ein Kegel gegossen, dessen Grundkreis denselben Radius hat. Berechne die Höhe <Vrb>h</Vrb> des Kegels.</>,
            steps: [
                { type:'calc', goal:'Schritt 1: Berechne das Volumen der Halbkugel.',
                  label:<span><Vrb>V</Vrb><sub>hk</sub></span>, unit:'cm³', correct:Vhk, tolerance:1.5, decimals:1,
                  hint:<>(2 ÷ 3) · π · {fmtK(rh)}<Pwr>3</Pwr>.</>,
                  solution:`V_hk ≈ ${fmtK(Vhk,1)} cm³` },
                { type:'select', goal:'Schritt 2: Welche Beziehung gilt beim Umschmelzen?',
                  options:[<span><Vrb>V</Vrb><sub>Kegel</sub> = <Vrb>V</Vrb><sub>hk</sub></span>, <span><Vrb>O</Vrb><sub>Kegel</sub> = <Vrb>O</Vrb><sub>hk</sub></span>, <span><Vrb>h</Vrb> = <Vrb>r</Vrb></span>], correctIdx:0,
                  hint:<>Volumen bleibt erhalten.</>,
                  solution:<span>V_Kegel = V_hk</span> },
                { type:'calc', goal:'Schritt 3: Berechne mithilfe der Kegelformel die Höhe h.',
                  label:<Vrb>h</Vrb>, unit:'cm', correct:hKegel, tolerance:0.2, decimals:1,
                  hint:<>Setze (1 ÷ 3) · π · r² · h = V_hk und löse nach h auf — es folgt h = 2 · r.</>,
                  solution:`h ≈ ${fmtK(hKegel,1)} cm` }
            ]
        };
    }
    // typeId 6 — Wandstärke aus Materialvolumen
    const raux = randInt(8, 12);
    const wThick = 1.5;
    const rIn = raux - wThick;
    const Vmat = (4/3) * Math.PI * (raux**3 - rIn**3);
    const Vinside = (4/3) * Math.PI * rIn**3;
    return {
        typeId, level:'schwer', title:'Wandstärke aus Materialvolumen',
        sketch:'hollow_sphere', sketchData:{label:`r_a = ${raux} cm`},
        description: <>Eine Hohlkugel hat den Außenradius <Vrb>r</Vrb><sub>a</sub> = {raux} cm. Das reine Materialvolumen beträgt <Vrb>V</Vrb><sub>Mat</sub> = {fmtK(Vmat,1)} cm³. Berechne die Wandstärke <Vrb>s</Vrb>.</>,
        steps: [
            { type:'calc', goal:'Schritt 1: Berechne das Außenvolumen V_a.',
              label:<span><Vrb>V</Vrb><sub>a</sub></span>, unit:'cm³', correct:(4/3)*Math.PI*raux**3, tolerance:2.0, decimals:1,
              hint:<>(4 ÷ 3) · π · {raux}<Pwr>3</Pwr>.</>,
              solution:`V_a ≈ ${fmtK((4/3)*Math.PI*raux**3,1)} cm³` },
            { type:'calc', goal:'Schritt 2: Berechne das Innenvolumen V_i (V_a − V_Mat).',
              label:<span><Vrb>V</Vrb><sub>i</sub></span>, unit:'cm³', correct:Vinside, tolerance:2.0, decimals:1,
              hint:<>Subtrahiere das Materialvolumen vom Außenvolumen.</>,
              solution:`V_i ≈ ${fmtK(Vinside,1)} cm³` },
            { type:'calc', goal:'Schritt 3: Berechne den Innenradius r_i.',
              label:<span><Vrb>r</Vrb><sub>i</sub></span>, unit:'cm', correct:rIn, tolerance:0.2, decimals:1,
              hint:<>Stelle V_i = (4 ÷ 3) · π · r_i³ nach r_i um (dritte Wurzel).</>,
              solution:`r_i = ${fmtK(rIn)} cm` },
            { type:'calc', goal:'Schritt 4: Berechne die Wandstärke s.',
              label:<Vrb>s</Vrb>, unit:'cm', correct:wThick, tolerance:0.1, decimals:1,
              hint:<><Vrb>s</Vrb> = <Vrb>r</Vrb><sub>a</sub> − <Vrb>r</Vrb><sub>i</sub>.</>,
              solution:`s = ${fmtK(wThick)} cm` }
        ]
    };
};

// ==========================================
// 7. PRÜFUNGSAUFGABEN — Originale aus dem MSA-Archiv (angepasst-Variante)
// ==========================================
const kugelExamTasks = [
    {
        sigKey:'msa-2025-i-8', label:'MSA 2025 I/8', sketch:'hollow_sphere',
        description: <>Eine Hohlkugel aus Metall hat eine Oberfläche von <Vrb>O</Vrb> = 452,16 cm² und eine Wandstärke von <Vrb>s</Vrb> = 0,5 cm. Berechne die Masse in Gramm, wenn 1 cm³ Metall 7,8 g wiegt. Rechne mit π = 3,14.</>,
        sketchData:{label:'Wandstärke s = 0,5 cm'},
        steps: [
            { type:'calc', goal:'Schritt 1: Berechne den Außenradius r_a aus der Oberfläche.',
              label:<span><Vrb>r</Vrb><sub>a</sub></span>, unit:'cm', correct:6, tolerance:0.1, decimals:1,
              hint:<>r_a = √(O ÷ (4 · π)) = √(452,16 ÷ (4 · 3,14)) = √36.</>, solution:'r_a = 6 cm' },
            { type:'calc', goal:'Schritt 2: Berechne den Innenradius r_i.',
              label:<span><Vrb>r</Vrb><sub>i</sub></span>, unit:'cm', correct:5.5, tolerance:0.1, decimals:1,
              hint:<>r_i = r_a − s = 6 − 0,5.</>, solution:'r_i = 5,5 cm' },
            { type:'calc', goal:'Schritt 3: Berechne das Materialvolumen V (mit π = 3,14).',
              label:<Vrb>V</Vrb>, unit:'cm³', correct:207.76, tolerance:1.5, decimals:1,
              hint:<>(4 ÷ 3) · 3,14 · (6<Pwr>3</Pwr> − 5,5<Pwr>3</Pwr>).</>,
              solution:'V ≈ 207,8 cm³' },
            { type:'calc', goal:'Schritt 4: Berechne die Masse m in Gramm.',
              label:<Vrb>m</Vrb>, unit:'g', correct:1620.5, tolerance:3.0, decimals:0,
              hint:<>m = V · ρ = 207,76 · 7,8.</>, solution:'m ≈ 1 621 g' }
        ]
    },
    {
        sigKey:'msa-2025-ii-7', label:'MSA 2025 II/7', sketch:'cone_hemisphere',
        description: <>Ein Silberwürfel der Kantenlänge <Vrb>a</Vrb> = 3 cm wird eingeschmolzen. Daraus entsteht ein Körper aus Halbkugel + Kegel mit gleichem Durchmesser und gleichem Volumen. Berechne die Oberfläche der sichtbaren Halbkugel.</>,
        sketchData:{label:'gleiches V_Halbk = V_Kegel'},
        steps: [
            { type:'calc', goal:'Schritt 1: Berechne das Würfelvolumen V_W.',
              label:<span><Vrb>V</Vrb><sub>W</sub></span>, unit:'cm³', correct:27, tolerance:0.1, decimals:0,
              hint:<>V_W = a³ = 3³.</>, solution:'V_W = 27 cm³' },
            { type:'calc', goal:'Schritt 2: Wie groß ist das Volumen der Halbkugel allein?',
              label:<span><Vrb>V</Vrb><sub>Halbk</sub></span>, unit:'cm³', correct:13.5, tolerance:0.1, decimals:1,
              hint:<>Halbkugel und Kegel teilen sich das Volumen zu gleichen Teilen: 27 ÷ 2.</>,
              solution:'V_Halbk = 13,5 cm³' },
            { type:'calc', goal:'Schritt 3: Berechne den Radius r der Halbkugel.',
              label:<Vrb>r</Vrb>, unit:'cm', correct:1.86, tolerance:0.05, decimals:2,
              hint:<>V_Halbk = (2 ÷ 3) · π · r³. Stelle um: r = ³√(3 · 13,5 ÷ (2·π)).</>,
              solution:'r ≈ 1,86 cm' },
            { type:'calc', goal:'Schritt 4: Berechne die sichtbare Oberfläche der Halbkugel.',
              label:<Vrb>O</Vrb>, unit:'cm²', correct:21.73, tolerance:0.3, decimals:2,
              hint:<>Sichtbare Schale: O = 2 · π · r².</>,
              solution:'O ≈ 21,7 cm²' }
        ]
    },
    {
        sigKey:'msa-2024-i-7', label:'MSA 2024 I/7', sketch:'cube_sphere',
        description: <>Eine Messingkugel soll in einem würfelförmigen Behälter aufbewahrt werden. Der Würfel hat das Innenvolumen 1 000 cm³. Berechne das maximale Volumen der Kugel.</>,
        sketchData:{label:'V_Würfel = 1 000 cm³'},
        steps: [
            { type:'calc', goal:'Schritt 1: Berechne die Kantenlänge a des Würfels.',
              label:<Vrb>a</Vrb>, unit:'cm', correct:10, tolerance:0.1, decimals:0,
              hint:<>V = a³ = 1 000 → a = ³√1000.</>, solution:'a = 10 cm' },
            { type:'calc', goal:'Schritt 2: Bestimme den maximalen Kugelradius r.',
              label:<Vrb>r</Vrb>, unit:'cm', correct:5, tolerance:0.1, decimals:0,
              hint:<>Der Kugel-Durchmesser entspricht der Kantenlänge → r = a ÷ 2.</>,
              solution:'r = 5 cm' },
            { type:'calc', goal:'Schritt 3: Berechne das maximale Kugelvolumen.',
              label:<Vrb>V</Vrb>, unit:'cm³', correct:523.6, tolerance:2.0, decimals:1,
              hint:<>(4 ÷ 3) · π · 5<Pwr>3</Pwr>.</>, solution:'V ≈ 523,6 cm³' }
        ]
    },
    {
        sigKey:'msa-2023-i-7', label:'MSA 2023 I/7', sketch:'cylinder_sphere',
        description: <>Ein zylindrischer Holzkörper (<Vrb>r</Vrb> = 6 cm, <Vrb>h</Vrb> = 12 cm) wird zur größtmöglichen Kugel gedrechselt. Berechne den prozentualen Holzabfall.</>,
        sketchData:{label:'r_Zyl = 6 cm, h = 12 cm'},
        steps: [
            { type:'calc', goal:'Schritt 1: Berechne das Zylindervolumen V_Zyl.',
              label:<span><Vrb>V</Vrb><sub>Zyl</sub></span>, unit:'cm³', correct:1357.17, tolerance:3.0, decimals:1,
              hint:<>π · 6² · 12.</>, solution:'V_Zyl ≈ 1 357,2 cm³' },
            { type:'calc', goal:'Schritt 2: Wie groß ist der Radius der größtmöglichen Kugel?',
              label:<span><Vrb>r</Vrb><sub>K</sub></span>, unit:'cm', correct:6, tolerance:0.1, decimals:0,
              hint:<>Der Zylinder hat d = 12 cm — die größte Kugel hat r = 6 cm.</>, solution:'r_K = 6 cm' },
            { type:'calc', goal:'Schritt 3: Berechne das Kugelvolumen V_K.',
              label:<span><Vrb>V</Vrb><sub>K</sub></span>, unit:'cm³', correct:904.78, tolerance:2.0, decimals:1,
              hint:<>(4 ÷ 3) · π · 6<Pwr>3</Pwr>.</>, solution:'V_K ≈ 904,8 cm³' },
            { type:'calc', goal:'Schritt 4: Berechne den prozentualen Holzabfall.',
              label:<>Abfall</>, unit:'%', correct:33.33, tolerance:0.5, decimals:1,
              hint:<>(V_Zyl − V_K) ÷ V_Zyl · 100.</>, solution:'≈ 33,3 %' }
        ]
    },
    {
        sigKey:'msa-2022-ii-8', label:'MSA 2022 II/8', sketch:'sphere',
        description: <>Für ein Bällebad werden 5 000 Kunststoffkugeln mit Durchmesser <Vrb>d</Vrb> = 6 cm hergestellt. Wie viele Quadratmeter Folie werden insgesamt benötigt, wenn 8 % Verschnitt eingeplant werden? (π = 3,14)</>,
        sketchData:{label:'d = 6 cm, 5 000 Stück'},
        steps: [
            { type:'calc', goal:'Schritt 1: Berechne die Oberfläche O einer Kugel (r = 3 cm).',
              label:<Vrb>O</Vrb>, unit:'cm²', correct:113.04, tolerance:0.2, decimals:2,
              hint:<>4 · 3,14 · 3².</>, solution:'O = 113,04 cm²' },
            { type:'calc', goal:'Schritt 2: Berechne den Folienbedarf für 5 000 Kugeln.',
              label:<span><Vrb>F</Vrb><sub>netto</sub></span>, unit:'cm²', correct:565200, tolerance:50, decimals:0,
              hint:<>5 000 · 113,04.</>, solution:'F_netto = 565 200 cm²' },
            { type:'calc', goal:'Schritt 3: Rechne in m² um (1 m² = 10 000 cm²).',
              label:<span><Vrb>F</Vrb><sub>netto</sub></span>, unit:'m²', correct:56.52, tolerance:0.05, decimals:2,
              hint:<>Teile durch 10 000.</>, solution:'F_netto = 56,52 m²' },
            { type:'calc', goal:'Schritt 4: Berechne den Gesamtbedarf mit 8 % Verschnitt.',
              label:<span><Vrb>F</Vrb><sub>brutto</sub></span>, unit:'m²', correct:61.04, tolerance:0.2, decimals:2,
              hint:<>56,52 · 1,08.</>, solution:'F_brutto ≈ 61,04 m²' }
        ]
    },
    {
        sigKey:'msa-2019-i-8', label:'MSA 2019 I/8', sketch:'hemisphere',
        description: <>Eine massive Halbkugel aus Blei (<Vrb>r</Vrb> = 12 cm) wird eingeschmolzen. Daraus werden Kugeln mit <Vrb>d</Vrb> = 3 cm gegossen. Wie viele vollständige Kugeln können hergestellt werden?</>,
        sketchData:{label:'r_groß = 12 cm → d_klein = 3 cm'},
        steps: [
            { type:'calc', goal:'Schritt 1: Berechne das Volumen V_H der Halbkugel.',
              label:<span><Vrb>V</Vrb><sub>H</sub></span>, unit:'cm³', correct:3619.11, tolerance:5.0, decimals:1,
              hint:<>(2 ÷ 3) · π · 12<Pwr>3</Pwr>.</>, solution:'V_H ≈ 3 619,1 cm³' },
            { type:'calc', goal:'Schritt 2: Berechne den Radius r_klein einer kleinen Kugel.',
              label:<span><Vrb>r</Vrb><sub>klein</sub></span>, unit:'cm', correct:1.5, tolerance:0.05, decimals:1,
              hint:<>r = d ÷ 2 = 3 ÷ 2.</>, solution:'r_klein = 1,5 cm' },
            { type:'calc', goal:'Schritt 3: Berechne das Volumen V_klein einer kleinen Kugel.',
              label:<span><Vrb>V</Vrb><sub>klein</sub></span>, unit:'cm³', correct:14.14, tolerance:0.2, decimals:2,
              hint:<>(4 ÷ 3) · π · 1,5<Pwr>3</Pwr>.</>, solution:'V_klein ≈ 14,14 cm³' },
            { type:'calc', goal:'Schritt 4: Wie viele vollständige Kugeln entstehen? (abrunden!)',
              label:<>Anzahl</>, unit:'Kugeln', correct:256, tolerance:0.5, decimals:0,
              hint:<>V_H ÷ V_klein und auf die ganze Zahl abrunden.</>,
              solution:'256 Kugeln' }
        ]
    },
    {
        sigKey:'msa-2017-ii-7', label:'MSA 2017 II/7', sketch:'cylinder_sphere',
        description: <>Ein Glas-Kunstwerk besteht aus einer Kugel (<Vrb>r</Vrb><sub>K</sub> = 5 cm), die auf einem massiven Glaszylinder (<Vrb>r</Vrb><sub>Z</sub> = 3 cm, <Vrb>h</Vrb> = 10 cm) montiert ist. Berechne das Gesamtvolumen.</>,
        sketchData:{label:'Kugel + Sockelzylinder'},
        steps: [
            { type:'calc', goal:'Schritt 1: Berechne das Kugelvolumen V_K.',
              label:<span><Vrb>V</Vrb><sub>K</sub></span>, unit:'cm³', correct:523.6, tolerance:2.0, decimals:1,
              hint:<>(4 ÷ 3) · π · 5<Pwr>3</Pwr>.</>, solution:'V_K ≈ 523,6 cm³' },
            { type:'calc', goal:'Schritt 2: Berechne das Zylindervolumen V_Z.',
              label:<span><Vrb>V</Vrb><sub>Z</sub></span>, unit:'cm³', correct:282.74, tolerance:2.0, decimals:1,
              hint:<>π · 3² · 10.</>, solution:'V_Z ≈ 282,7 cm³' },
            { type:'calc', goal:'Schritt 3: Berechne das Gesamtvolumen.',
              label:<span><Vrb>V</Vrb><sub>ges</sub></span>, unit:'cm³', correct:806.34, tolerance:3.0, decimals:1,
              hint:<>V_K + V_Z.</>, solution:'V_ges ≈ 806,3 cm³' }
        ]
    },
    {
        sigKey:'msa-2010-ii-6', label:'MSA 2010 II/6', sketch:'earth_latitude',
        description: <>Die Stadt Regensburg liegt auf dem 49. nördlichen Breitengrad. Der Erdradius beträgt <Vrb>R</Vrb> = 6 370 km (Erde als Kugel). Berechne die Erdoberfläche und den Umfang des 49. Breitengrades. (π = 3,14, cos 49° ≈ 0,6561)</>,
        sketchData:{label:'R = 6 370 km'},
        steps: [
            { type:'calc', goal:'Schritt 1: Berechne die Erdoberfläche O.',
              label:<Vrb>O</Vrb>, unit:'km²', correct:509645864, tolerance:50000, decimals:0,
              hint:<>O = 4 · 3,14 · 6 370².</>, solution:'O ≈ 509 645 864 km²' },
            { type:'calc', goal:'Schritt 2: Berechne den Radius r\' des Breitengrades.',
              label:<>r '</>, unit:'km', correct:4179, tolerance:5, decimals:0,
              hint:<>r' = R · cos 49° = 6 370 · 0,6561.</>, solution:"r' ≈ 4 179 km" },
            { type:'calc', goal:'Schritt 3: Berechne den Umfang u des Breitengrades.',
              label:<Vrb>u</Vrb>, unit:'km', correct:26244, tolerance:50, decimals:0,
              hint:<>u = 2 · 3,14 · r'.</>, solution:'u ≈ 26 244 km' }
        ]
    },
    {
        sigKey:'msa-muster-i-5', label:'MSA Musterprüfung I/5', sketch:'sphere',
        description: <>Ein Würfel hat die Kantenlänge <Vrb>a</Vrb>. Sein Volumen ist genauso groß wie das Gesamtvolumen von 6 Kugeln mit <Vrb>r</Vrb> = 8 cm. Berechne die Kantenlänge a.</>,
        sketchData:{label:'6 Kugeln mit r = 8 cm'},
        steps: [
            { type:'calc', goal:'Schritt 1: Berechne das Volumen V einer einzelnen Kugel.',
              label:<Vrb>V</Vrb>, unit:'cm³', correct:2144.66, tolerance:5.0, decimals:1,
              hint:<>(4 ÷ 3) · π · 8<Pwr>3</Pwr>.</>, solution:'V ≈ 2 144,7 cm³' },
            { type:'calc', goal:'Schritt 2: Berechne das Gesamtvolumen aller 6 Kugeln.',
              label:<span><Vrb>V</Vrb><sub>ges</sub></span>, unit:'cm³', correct:12867.96, tolerance:20, decimals:0,
              hint:<>Multipliziere mit 6.</>, solution:'V_ges ≈ 12 868 cm³' },
            { type:'calc', goal:'Schritt 3: Berechne die Kantenlänge a.',
              label:<Vrb>a</Vrb>, unit:'cm', correct:23.4, tolerance:0.2, decimals:1,
              hint:<>a = ³√V_ges.</>, solution:'a ≈ 23,4 cm' }
        ]
    },
    {
        sigKey:'msa-muster-ii-5', label:'MSA Musterprüfung II/5', sketch:'hollow_sphere',
        description: <>Eine Hohlkugel aus Messing wiegt 4 352 g und hat den Außendurchmesser <Vrb>d</Vrb><sub>a</sub> = 15 cm. Berechne den Innenradius <Vrb>r</Vrb><sub>i</sub>, wenn 1 cm³ Messing 8,4 g wiegt. (π = 3,14)</>,
        sketchData:{label:'m = 4 352 g, ρ = 8,4 g/cm³'},
        steps: [
            { type:'calc', goal:'Schritt 1: Berechne das Materialvolumen V_Mat über Masse und Dichte.',
              label:<span><Vrb>V</Vrb><sub>Mat</sub></span>, unit:'cm³', correct:518.1, tolerance:1.0, decimals:1,
              hint:<>V = m ÷ ρ = 4 352 ÷ 8,4.</>, solution:'V_Mat ≈ 518,1 cm³' },
            { type:'calc', goal:'Schritt 2: Berechne den Außenradius r_a.',
              label:<span><Vrb>r</Vrb><sub>a</sub></span>, unit:'cm', correct:7.5, tolerance:0.1, decimals:1,
              hint:<>r_a = d_a ÷ 2.</>, solution:'r_a = 7,5 cm' },
            { type:'calc', goal:'Schritt 3: Berechne das Außenvolumen V_a (π = 3,14).',
              label:<span><Vrb>V</Vrb><sub>a</sub></span>, unit:'cm³', correct:1766.25, tolerance:2.0, decimals:1,
              hint:<>(4 ÷ 3) · 3,14 · 7,5<Pwr>3</Pwr>.</>, solution:'V_a ≈ 1 766,3 cm³' },
            { type:'calc', goal:'Schritt 4: Berechne das Innenvolumen V_i (V_a − V_Mat).',
              label:<span><Vrb>V</Vrb><sub>i</sub></span>, unit:'cm³', correct:1248.15, tolerance:3.0, decimals:1,
              hint:<>1 766,3 − 518,1.</>, solution:'V_i ≈ 1 248,2 cm³' },
            { type:'calc', goal:'Schritt 5: Berechne den Innenradius r_i.',
              label:<span><Vrb>r</Vrb><sub>i</sub></span>, unit:'cm', correct:6.68, tolerance:0.1, decimals:2,
              hint:<>r_i = ³√(3 · V_i ÷ (4 · π)).</>, solution:'r_i ≈ 6,68 cm' }
        ]
    }
];

// ==========================================
// 8. HAUPT-TRAINER-KOMPONENTE
// ==========================================
const KugelTrainer = () => {
    const [difficulty, setDifficulty] = useState('leicht');
    const [task, setTask] = useState(null);
    const [stepIdx, setStepIdx] = useState(0);
    const [stepInputs, setStepInputs] = useState({});      // { id: 'value' } für fill-Step
    const [stepStatus, setStepStatus] = useState({});      // { id: 'correct'|'incorrect' }
    const [calcInput, setCalcInput] = useState('');
    const [calcStatus, setCalcStatus] = useState(null);
    const [selectIdx, setSelectIdx] = useState(null);
    const [selectStatus, setSelectStatus] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [showSolutionWay, setShowSolutionWay] = useState(false);
    const [loading, setLoading] = useState(true);
    // Antworten pro Schritt — werden in den kollabierten StepCards als pastSummary
    // gezeigt, sodass die Schüler:innen ihre vorher berechneten Werte weiterverwenden
    // können (z. B. Volumen aus Schritt 2 → Dichteformel in Schritt 4).
    const [answers, setAnswers] = useState({});

    const tc = useTrainerCore({ storageKey: 'kugel' });
    const adaptive = useAdaptive('kugel', difficulty);

    // Anti-Wiederholung pro Schwierigkeit
    const lastTypeIdRef = React.useRef({ leicht: [], mittel: [], schwer: [] });
    const [examShuffled, setExamShuffled] = useState([]);
    const [examIdx, setExamIdx] = useState(0);
    const [lastExamSig, setLastExamSig] = useState(null);

    // Aktueller Schritt
    const currentStep = task ? task.steps[stepIdx] : null;

    const resetStepState = () => {
        setStepInputs({}); setStepStatus({});
        setCalcInput(''); setCalcStatus(null);
        setSelectIdx(null); setSelectStatus(null);
    };

    // Mischt die Antworten aller select-Steps neu durch. Speichert die richtige Antwort
    // per Referenz und mappt correctIdx auf die neue Position — dadurch ist die richtige
    // Antwort nicht mehr immer an Position 0.
    const shuffleSelectOptions = (task) => {
        const newSteps = task.steps.map(s => {
            if (s.type === 'select' && s.options && s.options.length > 1) {
                const correct = s.options[s.correctIdx];
                const shuffled = shuffleArray(s.options);
                return { ...s, options: shuffled, correctIdx: shuffled.indexOf(correct) };
            }
            return s;
        });
        return { ...task, steps: newSteps };
    };

    const newTask = () => {
        let t;
        if (difficulty === 'pruefung') {
            let pool = examShuffled, idx = examIdx;
            if (pool.length === 0 || idx >= pool.length) {
                pool = shuffleArray(kugelExamTasks);
                idx = 0;
                setExamShuffled(pool);
            }
            t = pool[idx];
            // einfache Anti-Wiederholung: falls direkt gleicher Sig, einen weiter
            if (t.sigKey === lastExamSig && pool.length > 1) {
                idx = (idx + 1) % pool.length;
                t = pool[idx];
            }
            setExamIdx(idx + 1);
            setLastExamSig(t.sigKey);
        } else {
            const builder = difficulty === 'leicht' ? buildLeichtTask : difficulty === 'mittel' ? buildMittelTask : buildSchwerTask;
            const forbidden = lastTypeIdRef.current[difficulty];
            t = builder(forbidden);
            lastTypeIdRef.current[difficulty] = [...forbidden, t.typeId].slice(-2);
        }
        t = shuffleSelectOptions(t);
        setTask(t);
        setStepIdx(0);
        setCompleted(false);
        setShowSolutionWay(false);
        setAnswers({});
        resetStepState();
        tc.setErrors(0); tc.setTipRevealed(false);
        setLoading(false);
    };

    useEffect(() => {
        // Bei Schwierigkeitswechsel Pool zurücksetzen, falls Prüfung
        if (difficulty === 'pruefung') { setExamShuffled([]); setExamIdx(0); }
        setLoading(true);
        // kleines Defer, damit der StepCard kurz fade-in zeigen kann
        const id = setTimeout(newTask, 0);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [difficulty]);

    const handleDifficultyChange = (d) => {
        if (d === difficulty) newTask();
        else setDifficulty(d);
    };

    const advanceWith = (answer) => {
        // Antwort des aktuellen Schritts persistieren, damit pastSummary die Lösung
        // im Karten-Titel zeigt (Schüler:innen brauchen das Ergebnis für Folgeschritte).
        setAnswers(prev => ({ ...prev, [stepIdx]: answer }));
        const nextIdx = stepIdx + 1;
        if (nextIdx >= task.steps.length) {
            setCompleted(true);
            tc.onSuccessfulSolve();
            adaptive.recordCorrect();
        } else {
            setStepIdx(nextIdx);
            resetStepState();
            tc.setErrors(0); tc.setTipRevealed(false);
        }
    };

    const onSolutionShown = () => {
        tc.onSolutionShown();
        adaptive.recordWrong();
    };

    // ===== Schritt-Validierungen =====
    const checkSelect = () => {
        if (selectIdx === null) return;
        if (selectIdx === currentStep.correctIdx) {
            setSelectStatus('correct');
            const answer = { type: 'select', selectedJsx: currentStep.options[selectIdx] };
            setTimeout(() => advanceWith(answer), 350);
        } else {
            setSelectStatus('incorrect');
            tc.triggerError();
            adaptive.recordWrong();
        }
    };

    const checkFill = () => {
        let allOK = true;
        const status = {};
        for (const inp of currentStep.inputs) {
            const val = parseDe(stepInputs[inp.id]);
            const expected = parseFloat(inp.correct);
            // Toleranz: integer = strikt, dezimal = ±0.05 oder relativ
            const tol = Number.isInteger(expected) && (inp.decimals === undefined || inp.decimals === 0)
                ? 0.01
                : Math.max(0.05, Math.abs(expected) * 0.005);
            if (isNaN(val) || Math.abs(val - expected) > tol) {
                status[inp.id] = 'incorrect';
                allOK = false;
            } else {
                status[inp.id] = 'correct';
            }
        }
        setStepStatus(status);
        if (allOK) {
            const values = currentStep.inputs.map(i => ({ id: i.id, value: stepInputs[i.id] }));
            setTimeout(() => advanceWith({ type: 'fill', values }), 350);
        } else {
            tc.triggerError();
            adaptive.recordWrong();
        }
    };

    const checkCalc = () => {
        const v = parseDe(calcInput);
        if (isNaN(v)) {
            setCalcStatus('incorrect');
            tc.triggerError(); adaptive.recordWrong();
            return;
        }
        const expected = parseFloat(currentStep.correct);
        const tol = currentStep.tolerance !== undefined ? currentStep.tolerance : Math.max(0.5, Math.abs(expected) * 0.01);
        if (Math.abs(v - expected) <= tol) {
            setCalcStatus('correct');
            const answer = { type: 'calc', value: calcInput, label: currentStep.label, unit: currentStep.unit };
            setTimeout(() => advanceWith(answer), 350);
        } else {
            setCalcStatus('incorrect');
            tc.triggerError();
            adaptive.recordWrong();
        }
    };

    // ===== Render-Helfer für fill-Schritte =====
    const fillHelpers = () => ({
        input: (id, width = 'w-20') => (
            <InlineInput
                value={stepInputs[id]}
                status={stepStatus[id]}
                onChange={(v) => {
                    setStepInputs(prev => ({ ...prev, [id]: v }));
                    setStepStatus(prev => ({ ...prev, [id]: null }));
                }}
                onSubmit={checkFill}
                disabled={false}
                width={width}
            />
        )
    });

    // ===== Lösungstext für die TipBox =====
    const getSolutionText = () => {
        if (!currentStep) return null;
        if (currentStep.solution !== undefined) return currentStep.solution;
        return null;
    };

    // Schöne Variablen-Anzeige für Input-IDs (rho → ρ, V_K → V_K kursiv, usw.).
    const labelForId = (id) => {
        if (id === 'rho') return 'ρ';
        return <Vrb>{id}</Vrb>;
    };

    // Past-Summary für eine bereits gelöste StepCard. Wird an StepCard.pastSummary
    // gereicht, sodass die Karte zu einer einzelnen Zeile zusammenfaltet und die
    // Antwort prominent neben der Aufgabenstellung steht.
    // Für fill-Steps mit render(h)-Funktion extrahieren wir die FormZeile-Kinder und
    // ersetzen jedes Input-Feld durch den eingegebenen Wert — so steht die KOMPLETTE
    // Formel mit eingesetztem r/V/… in der Titelzeile, nicht nur "r = 9,7".
    const buildPastSummary = (ans, step) => {
        if (!ans) return null;
        if (ans.type === 'select') {
            return <span className="font-math">{ans.selectedJsx}</span>;
        }
        if (ans.type === 'fill') {
            // Werte-Map aus den Antworten bauen
            const vMap = {};
            ans.values.forEach(v => { vMap[v.id] = v.value; });
            // Wenn die Step eine render(h)-Funktion hat, wir das selbe Formel-JSX nochmal
            // bauen, aber statt Eingabefeldern den Wert einsetzen. FormZeile-Wrapper
            // wird abgestreift (.props.children), damit die Formel inline in den Titel passt.
            if (step && step.render) {
                const displayHelpers = {
                    input: (id) => <span className="text-indigo-700 font-bold mx-0.5">{vMap[id] !== undefined ? vMap[id] : '?'}</span>
                };
                const formZeile = step.render(displayHelpers);
                if (formZeile && formZeile.props) {
                    return <span className="font-math">{formZeile.props.children}</span>;
                }
            }
            // Fallback: "id = value" pro Eingabe
            return (
                <span className="font-math">
                    {ans.values.map((v, i) => (
                        <React.Fragment key={i}>
                            {i > 0 && <span className="mx-1">,</span>}
                            {labelForId(v.id)} = {v.value}
                        </React.Fragment>
                    ))}
                </span>
            );
        }
        if (ans.type === 'calc') {
            return (
                <span className="font-math">
                    {ans.label} = {ans.value}{ans.unit ? ' ' + ans.unit : ''}
                </span>
            );
        }
        return null;
    };

    // ===== StepCard-Renderer =====
    const renderStep = (step, idx) => {
        const isActive = idx === stepIdx && !completed;
        const isPast = (idx < stepIdx) || completed;
        const pastSummary = isPast ? buildPastSummary(answers[idx], step) : null;
        // "Schritt N:"-Präfix entfernen, da der Stufenkreis links bereits "N" zeigt.
        const cleanGoal = (typeof step.goal === 'string')
            ? step.goal.replace(/^Schritt\s*\d+:\s*/i, '')
            : 'Schritt';

        return (
            <StepCard key={idx}
                      title={cleanGoal}
                      stepNum={idx + 1}
                      currentStep={stepIdx + 1}
                      activeCondition={isActive}
                      pastCondition={isPast}
                      pastSummary={pastSummary}
                      theme="indigo">
                {step.type === 'select' && (
                    <div className="flex flex-col gap-3">
                        {step.options.map((opt, oi) => (
                            <button key={oi}
                                    onClick={() => { if (isActive) { setSelectIdx(oi); setSelectStatus(null); } }}
                                    disabled={!isActive}
                                    className={`text-left p-4 rounded-xl border-2 bg-white transition-all flex justify-between items-center ${
                                        selectIdx === oi
                                            ? (selectStatus === 'correct' ? 'border-green-500 bg-green-50' :
                                               selectStatus === 'incorrect' ? 'border-red-400 bg-red-50' :
                                               'border-indigo-500 bg-indigo-50 font-bold')
                                            : 'border-slate-200 hover:border-indigo-400'
                                    }`}>
                                <span className="text-lg">{opt}</span>
                                {selectIdx === oi && selectStatus === 'correct' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                {selectIdx === oi && selectStatus === 'incorrect' && <XCircle className="w-5 h-5 text-red-500" />}
                            </button>
                        ))}
                        {isActive && (
                            <div className="mt-2 flex justify-between items-center">
                                <TipBox errors={tc.errors} revealed={tc.tipRevealed} setRevealed={tc.setTipRevealed}
                                        text={step.hint} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} />
                                <SubmitBtn onClick={checkSelect} theme="indigo" disabled={selectIdx === null} />
                            </div>
                        )}
                    </div>
                )}
                {step.type === 'fill' && (
                    <div className="flex flex-col gap-2">
                        {step.render(fillHelpers())}
                        {isActive && (
                            <div className="mt-2 flex justify-between items-center">
                                <TipBox errors={tc.errors} revealed={tc.tipRevealed} setRevealed={tc.setTipRevealed}
                                        text={step.hint} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} />
                                <SubmitBtn onClick={checkFill} theme="indigo"
                                           disabled={!step.inputs.some(i => (stepInputs[i.id] || '').toString().trim().length > 0)} />
                            </div>
                        )}
                    </div>
                )}
                {step.type === 'calc' && (
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-50 border border-slate-200 rounded-xl py-4 px-3">
                            <span className="text-2xl font-math text-slate-800">{step.label} =</span>
                            <InlineInput value={calcInput} status={calcStatus}
                                         onChange={setCalcInput} onSubmit={checkCalc}
                                         disabled={!isActive} width="w-32" placeholder="?" />
                            <span className="text-lg text-slate-500">{step.unit}</span>
                        </div>
                        {isActive && (
                            <>
                                <div className="flex justify-center">
                                    <CalcButton theme="indigo" />
                                </div>
                                <div className="mt-1 flex justify-between items-center">
                                    <TipBox errors={tc.errors} revealed={tc.tipRevealed} setRevealed={tc.setTipRevealed}
                                            text={step.hint} solutionText={getSolutionText()} onSolutionShown={onSolutionShown} />
                                    <SubmitBtn onClick={checkCalc} theme="indigo" disabled={!(calcInput || '').trim()} />
                                </div>
                            </>
                        )}
                    </div>
                )}
            </StepCard>
        );
    };

    // ===== Lösungsweg-Text (Toggle in SuccessBox) =====
    const buildSolutionWayText = () => {
        if (!task) return '';
        return task.steps.map((s, i) => {
            const sol = typeof s.solution === 'string' ? s.solution : '(siehe Erklärung)';
            return `Schritt ${i+1}: ${typeof s.goal === 'string' ? s.goal : ''}\n   → ${sol}`;
        }).join('\n\n');
    };

    return (
        <div className="page-transition max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {tc.showAnim && <CelebrationOverlay />}
            {/* BETA-Hinweis: dieser Trainer ist neu und noch im Feinschliff. */}
            <div className="mb-4 flex items-center gap-3 bg-amber-50 border-2 border-amber-300 text-amber-900 px-3 py-2 rounded-lg text-sm">
                <span className="bg-amber-500 text-white text-xs font-extrabold px-2 py-0.5 rounded shrink-0">BETA</span>
                <span>Dieser Trainer ist noch im Aufbau. Fehler oder Verbesserungsvorschläge gerne per E-Mail melden.</span>
            </div>
            <TrainerHeader theme="indigo" icon={Sphere} title="Die Kugel"
                           streakIcon={Sphere} streak={tc.streak} />

            <DifficultyMenu theme="indigo" active={difficulty} onChange={handleDifficultyChange}
                            options={[
                                { id: 'leicht',   label: 'Leicht' },
                                { id: 'mittel',   label: 'Mittel' },
                                { id: 'schwer',   label: 'Schwer' },
                                { id: 'pruefung', label: 'Prüfungsaufgaben' }
                            ]} />

            {adaptive.stats.mastered.length > 0 && (
                <div className="mb-4 flex justify-center">
                    <MasteryBadge mastered={adaptive.stats.mastered} theme="indigo" />
                </div>
            )}
            <AdaptiveSuggestion suggestion={adaptive.suggestion}
                                onAccept={(d) => handleDifficultyChange(d)} theme="indigo" />

            <main className="space-y-6 relative">
                {/* Aufgaben-Karte */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-200 flex justify-between items-center">
                        <h2 className="font-semibold text-indigo-900 flex items-center gap-2">
                            <BookOpen className="w-5 h-5" /> {task?.title || 'Sachaufgabe'}
                        </h2>
                        {task?.label && (
                            <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-amber-200 text-amber-800">
                                {formatExamLabel(task.label)}
                            </span>
                        )}
                    </div>
                    <div className="p-6 bg-white">
                        {loading || !task ? (
                            <div className="flex justify-center"><RefreshCw className="w-8 h-8 animate-spin text-indigo-500" /></div>
                        ) : (
                            <>
                                {task.sketch && <KugelSkizze type={task.sketch} data={task.sketchData} />}
                                <p className="text-base sm:text-lg leading-relaxed text-slate-700">{task.description}</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Schritte */}
                {task && !loading && (
                    <div className="space-y-4">
                        {task.steps.map((step, idx) => renderStep(step, idx))}
                    </div>
                )}

                {/* Erfolg */}
                {completed && (
                    <SuccessBox theme="indigo"
                                text="Klasse gemacht! 🎉"
                                subtitle="Du hast alle Schritte richtig gelöst — weiter so!"
                                showSolutionBtn={true}
                                showSolution={showSolutionWay}
                                onToggleSolution={() => setShowSolutionWay(s => !s)}
                                solutionText={buildSolutionWayText()}
                                onNext={newTask}
                                nextBtnText={difficulty === 'pruefung' ? 'Nächste Prüfung' : 'Nächste Aufgabe'} />
                )}
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(<KugelTrainer />);
