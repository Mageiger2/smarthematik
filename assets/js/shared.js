// ==========================================
// shared.js — Helpers, Theme, Shared UI Components, Icons
// Wird auf jeder App-Seite via <script type="text/babel" src="..."> geladen.
// Exponiert window.SH für App-spezifische Skripte.
// ==========================================

const { useState, useEffect } = React;

// ==========================================
// 1. HELPERS & UTILS
// ==========================================
const getStorage = (key, def) => { try { return parseInt(localStorage.getItem(key)) || def; } catch(e) { return def; } };
const setStorage = (key, val) => { try { localStorage.setItem(key, val); } catch(e) {} };

const triggerCelebration = (setShowAnim) => {
    setShowAnim(true);
    setTimeout(() => setShowAnim(false), 3500);
};

const formatNum = (num) => { if (num === null || num === undefined) return ""; return num.toString().replace('.', ','); };
const fDe = (n) => String(n).replace('.', ',');
// Normalisiert mathematische Eingaben für den Vergleich. Akzeptiert insbesondere
// hochgestellte Unicode-Zahlen (² ³ ⁴ ⁵ ⁶), die Schüler mit AltGr+2 etc. tippen.
const normalizeString = (str) => {
    if (!str) return "";
    return str.toString()
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/,/g, '.')
        // Hochgestellte Unicode-Ziffern → ^N (vor weiteren Ersetzungen!)
        .replace(/²/g, '^2')
        .replace(/³/g, '^3')
        .replace(/⁴/g, '^4')
        .replace(/⁵/g, '^5')
        .replace(/⁶/g, '^6')
        // Variable+Ziffer ohne ^ → mit ^ (z.B. "x2" → "x^2")
        .replace(/([a-z])2(?!\d)/g, '$1^2')
        .replace(/([a-z])3(?!\d)/g, '$1^3')
        .replace(/([a-z])4(?!\d)/g, '$1^4')
        // Führende 1 vor Variable streichen ("1x" → "x")
        .replace(/(^|[\+\-\=\(])1([a-z])/g, '$1$2');
};
const formatDe = (numStr) => numStr.toString().replace(/\./g, ',');
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [newArr[i], newArr[j]] = [newArr[j], newArr[i]]; }
    return newArr;
};

// Hilfsfunktion: fragt, ob zwei normalisierte Strings numerisch gleich sind.
// Erlaubt z.B. "6.5" ~ "6.50", oder "1/2" ~ "0.5" (jedoch nicht "1/2" ~ "0,5", weil normalizeString Brüche nicht aufrechnet).
const isNumericMatch = (a, b) => {
    const na = parseFloat(a), nb = parseFloat(b);
    return !isNaN(na) && !isNaN(nb) && Math.abs(na - nb) < 1e-6;
};

// Vergleicht eine Eingabe mit einer Sollstring (string-strict ODER numerisch tolerant).
const checkValue = (input, expected) => {
    const ni = normalizeString(input), ne = normalizeString(expected);
    return ni === ne || isNumericMatch(ni, ne);
};

const checkMultiInput = (inputs, expectedArr) => {
    const normInputs = inputs.map(normalizeString).filter(s => s !== "");
    const normExpected = expectedArr.map(normalizeString);
    if (normInputs.length !== normExpected.length) return false;
    const remaining = [...normExpected];
    for (let val of normInputs) {
        let idx = remaining.indexOf(val);
        if (idx === -1) {
            // Numerischer Fallback (z.B. "6.5" vs "6.50", oder "0,5" vs "0.5" nach normalizeString).
            idx = remaining.findIndex(r => isNumericMatch(val, r));
        }
        if (idx === -1) return false;
        remaining.splice(idx, 1);
    }
    return true;
};

const formatTerm = (coef, isFirst=false, variable="") => {
    if (coef === 0) return "";
    let abs = Math.abs(coef); let sign = coef > 0 ? (isFirst ? "" : "+") : "-"; let val = (abs === 1 && variable !== "") ? variable : abs + variable;
    return sign + val;
};

// Continued-Fraction-Approximation: Dezimal -> [Zähler, Nenner]. Liefert null, wenn nicht sinnvoll darstellbar.
const decToFraction = (decimal, maxDenominator = 10000) => {
    if (decimal === null || decimal === undefined) return null;
    if (Number.isNaN(decimal) || !Number.isFinite(decimal)) return null;
    if (Number.isInteger(decimal)) return [decimal, 1];
    const tolerance = Math.max(Math.abs(decimal) * 1e-10, 1e-12);
    const sign = decimal < 0 ? -1 : 1;
    let x = Math.abs(decimal);
    let h0 = 0, h1 = 1, k0 = 1, k1 = 0;
    for (let i = 0; i < 50; i++) {
        const a = Math.floor(x);
        const h2 = a * h1 + h0;
        const k2 = a * k1 + k0;
        if (k2 > maxDenominator) break;
        h0 = h1; h1 = h2;
        k0 = k1; k1 = k2;
        if (Math.abs(decimal - sign * h1 / k1) < tolerance) break;
        const frac = x - a;
        if (frac === 0) break;
        x = 1 / frac;
        if (!Number.isFinite(x)) break;
    }
    return [sign * h1, k1];
};

const VarWn = () => <span>W<sub>n</sub></span>;
const VarW0 = () => <span>W<sub>0</sub></span>;
const VarQ = () => <span>q</span>;
const VarN = () => <span>n</span>;
const VarQpowN = () => <span>q<sup>n</sup></span>;

// ==========================================
// 2. THEME
// ==========================================
const themeColors = {
    emerald: { activeBorder: 'border-emerald-500', activeBg: 'bg-emerald-50', activeTitle: 'text-emerald-900', badgeBg: 'bg-emerald-600', shadow: 'shadow-emerald-100', btnBg: 'bg-emerald-600', btnHover: 'hover:bg-emerald-700' },
    rose: { activeBorder: 'border-rose-400', activeBg: 'bg-rose-50', activeTitle: 'text-rose-900', badgeBg: 'bg-rose-500', shadow: 'shadow-rose-100', btnBg: 'bg-rose-500', btnHover: 'hover:bg-rose-600' },
    amber: { activeBorder: 'border-amber-400', activeBg: 'bg-amber-50', activeTitle: 'text-amber-900', badgeBg: 'bg-amber-500', shadow: 'shadow-amber-100', btnBg: 'bg-amber-500', btnHover: 'hover:bg-amber-600' },
    sky: { activeBorder: 'border-sky-400', activeBg: 'bg-sky-50', activeTitle: 'text-sky-900', badgeBg: 'bg-sky-500', shadow: 'shadow-sky-100', btnBg: 'bg-sky-500', btnHover: 'hover:bg-sky-600' },
    violet: { activeBorder: 'border-violet-500', activeBg: 'bg-violet-50', activeTitle: 'text-violet-900', badgeBg: 'bg-violet-600', shadow: 'shadow-violet-100', btnBg: 'bg-violet-600', btnHover: 'hover:bg-violet-700' },
    teal: { activeBorder: 'border-teal-500', activeBg: 'bg-teal-50', activeTitle: 'text-teal-900', badgeBg: 'bg-teal-600', shadow: 'shadow-teal-100', btnBg: 'bg-teal-600', btnHover: 'hover:bg-teal-700' },
    cyan: { activeBorder: 'border-cyan-500', activeBg: 'bg-cyan-50', activeTitle: 'text-cyan-900', badgeBg: 'bg-cyan-600', shadow: 'shadow-cyan-100', btnBg: 'bg-cyan-600', btnHover: 'hover:bg-cyan-700' }
};

// ==========================================
// 3. ICONS
// ==========================================
function IconBase({ path, className }) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{path}</svg>; }
function Calculator({ className }) { return <IconBase className={className} path={<><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></>} />; }
function CalculatorOff({ className }) { return <IconBase className={className} path={<><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/><line x1="2" y1="2" x2="22" y2="22"/></>} />; }
function CheckCircle({ className }) { return <IconBase className={className} path={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>} />; }
function XCircle({ className }) { return <IconBase className={className} path={<><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></>} />; }
function RefreshCw({ className }) { return <IconBase className={className} path={<><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></>} />; }
function BookOpen({ className }) { return <IconBase className={className} path={<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>} />; }
function TrendingUp({ className }) {
    // Exponentiell steigende Kurve in einem angedeuteten Koordinatensystem.
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="3" y1="3" x2="3" y2="21" />
            <line x1="3" y1="21" x2="22" y2="21" />
            <path d="M 4 19 C 10 19, 15 16, 21 4" strokeWidth="2.2" />
        </svg>
    );
}
function TrendingDown({ className }) {
    // Exponentiell fallende Kurve in einem angedeuteten Koordinatensystem.
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="3" y1="3" x2="3" y2="21" />
            <line x1="3" y1="21" x2="22" y2="21" />
            <path d="M 4 4 C 8 17, 14 20, 21 20" strokeWidth="2.2" />
        </svg>
    );
}
function ArrowRight({ className }) { return <IconBase className={className} path={<><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></>} />; }
function ChevronRight({ className }) { return <IconBase className={className} path={<><polyline points="9 18 15 12 9 6"/></>} />; }
function HomeIcon({ className }) { return <IconBase className={className} path={<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>} />; }
function MenuIcon({ className }) { return <IconBase className={className} path={<><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></>} />; }
function Shield({ className }) { return <IconBase className={className} path={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>} />; }
function FileText({ className }) { return <IconBase className={className} path={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></>} />; }
function DeleteIcon({ className }) { return <IconBase className={className} path={<><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></>} />; }
function HelpCircle({ className }) { return <IconBase className={className} path={<><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>} />; }
function FastForward({ className }) { return <IconBase className={className} path={<><polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/></>} />; }
function Target({ className }) { return <IconBase className={className} path={<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>} />; }
function DicesIcon({ className }) { return <IconBase className={className} path={<><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="M17.92 14H20a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v2"/><circle cx="6" cy="14" r="1"/><circle cx="10" cy="18" r="1"/><circle cx="16" cy="8" r="1"/></>} />; }
function Hash({ className }) { return <IconBase className={className} path={<><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></>} />; }
function SuperscriptIcon({ className }) {
    // x mit hochgestellter 2 — eigenes SVG, weil IconBase kein <text> kann.
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={className}>
            <text x="4" y="18" fontFamily="'Times New Roman', serif" fontStyle="italic" fontSize="18" fill="currentColor">x</text>
            <text x="13" y="10" fontFamily="sans-serif" fontWeight="bold" fontSize="13" fill="currentColor">2</text>
        </svg>
    );
}
function BracketsIcon({ className }) {
    // Runde Klammern + hochgestellte 2 oben rechts (für "Binomische Formeln").
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M7 19s-3-2.5-3-7 3-7 3-7"/>
            <path d="M13 5s3 2.5 3 7-3 7-3 7"/>
            <text x="20.5" y="8" fill="currentColor" stroke="none" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">2</text>
        </svg>
    );
}
function FractionIcon({ className }) {
    // Bruch 1 / (x − 1) — passend zu Bruchgleichungen.
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
            <line x1="3" x2="21" y1="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <text x="12" y="9" textAnchor="middle" fontFamily="serif" fontStyle="italic" fontSize="9" fontWeight="600" fill="currentColor">1</text>
            <text x="12" y="22" textAnchor="middle" fontFamily="serif" fontStyle="italic" fontSize="9" fontWeight="600" fill="currentColor">x−1</text>
        </svg>
    );
}

// ==========================================
// 4. SHARED UI COMPONENTS
// ==========================================
const CelebrationOverlay = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
        <img src="Logo-sMArTH.png" className="w-[80vw] max-w-md drop-shadow-2xl animate-fly-logo bg-white/80 p-4 rounded-3xl backdrop-blur-sm" alt="Logo"
             onError={(e)=>{e.target.style.display='none'}} />
    </div>
);

const Frac = ({ top, bot }) => <span className="inline-flex flex-col items-center align-middle mx-1 px-1"><span className="border-b-[1.5px] border-current px-1 pb-0.5 w-full text-center leading-none">{top}</span><span className="px-1 pt-0.5 text-center leading-none">{bot}</span></span>;

const StepCard = ({ title, stepNum, currentStep, activeCondition, pastCondition, theme = 'amber', children }) => {
    const isActive = activeCondition !== undefined ? activeCondition : currentStep === stepNum;
    const isPast = pastCondition !== undefined ? pastCondition : currentStep > stepNum;
    const t = themeColors[theme];

    return (
        <div className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all duration-300 ${isActive ? `${t.activeBorder} ${t.shadow}` : isPast ? 'border-green-200' : 'border-slate-200 opacity-50'}`}>
            <div className={`px-5 py-3 border-b flex items-center ${isActive ? `${t.activeBg} border-opacity-50` : isPast ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-200'}`}>
                {isPast ? <CheckCircle className="text-green-500 mr-3 w-6 h-6 shrink-0" /> : <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 shrink-0 ${isActive ? `${t.badgeBg} text-white` : 'bg-slate-300 text-slate-500'}`}>{stepNum}</div>}
                <h3 className={`font-bold text-lg ${isActive ? t.activeTitle : isPast ? 'text-green-900' : 'text-slate-500'}`}>{title}</h3>
            </div>
            <div className={`p-5 ${!isActive && !isPast ? 'hidden' : ''}`}>{children}</div>
        </div>
    );
};

const SubmitBtn = ({ onClick, theme = 'amber', disabled = false }) => {
    const t = themeColors[theme];
    return <button onClick={onClick} disabled={disabled} className={`${disabled ? 'bg-slate-300 cursor-not-allowed' : `${t.btnBg} ${t.btnHover}`} text-white p-2.5 rounded shadow flex items-center transition-colors`} title="Überprüfen"><ArrowRight className="w-5 h-5" /></button>;
};

const SuccessMark = ({ text, className = "mt-4" }) => (
    <div className={`${className} text-green-700 font-medium flex items-center bg-green-50 px-3 py-2 rounded-lg border border-green-100 inline-flex`}><CheckCircle className="w-5 h-5 mr-2 text-green-600 shrink-0" /> {text}</div>
);

// Erscheint nach 3 Fehleingaben. Bietet einen Tipp-Button und (wenn solutionText
// gegeben) zusätzlich einen "Lösung anzeigen"-Button. Der Lösungs-Button füllt
// nichts automatisch aus, sondern blendet die Lösung als Text ein — der Schüler
// muss sie selbst eintippen. onSolutionShown wird genau einmal beim ersten Klick
// aufgerufen (z.B. zum Zurücksetzen des Streaks).
const TipBox = ({ errors, revealed, setRevealed, text, solutionText, onSolutionShown }) => {
    const [solRevealed, setSolRevealed] = useState(false);
    // Bei Schritt-Wechsel (errors === 0) zurücksetzen — Lösung gehört zur aktuellen Eingabe.
    useEffect(() => { if (errors === 0) setSolRevealed(false); }, [errors]);

    if (errors < 3) return null;

    const handleShowSolution = () => {
        setSolRevealed(true);
        if (onSolutionShown) onSolutionShown();
    };

    const solBtn = (solutionText && !solRevealed) ? (
        <button onClick={handleShowSolution} className="text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-lg font-medium flex items-center transition-colors border border-rose-200">
            <BookOpen className="w-5 h-5 mr-2" /> Lösung anzeigen
        </button>
    ) : null;

    const solBox = (solRevealed && solutionText) ? (
        <div className="mt-3 bg-rose-50 border-l-4 border-rose-500 p-4 rounded shadow-sm text-rose-900 text-sm animate-fade-in flex">
            <BookOpen className="w-6 h-6 mr-3 shrink-0 text-rose-600" />
            <div><strong className="block mb-1 text-rose-800">Lösung:</strong> <span className="break-words">{solutionText}</span></div>
        </div>
    ) : null;

    if (!revealed) {
        return (
            <div className="mt-4 animate-fade-in">
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setRevealed(true)} className="text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-lg font-medium flex items-center transition-colors border border-amber-200">
                        <HelpCircle className="w-5 h-5 mr-2" /> Hier gibt es einen Tipp
                    </button>
                    {solBtn}
                </div>
                {solBox}
            </div>
        );
    }
    return (
        <div className="mt-4 animate-fade-in">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded shadow-sm text-amber-900 text-sm flex">
                <HelpCircle className="w-6 h-6 mr-3 shrink-0 text-amber-600" />
                <div><strong className="block mb-1 text-amber-800">Tipp:</strong> {text}</div>
            </div>
            {solBtn && <div className="mt-2">{solBtn}</div>}
            {solBox}
        </div>
    );
};

const FormulaInput = ({ id, label, value, isUnknown, status, disabled, onChange, theme = "emerald" }) => {
    const isRose = theme === 'rose'; const isEmerald = theme === 'emerald';
    return (
        <div className="flex flex-col items-center">
            <div className="mb-1 text-slate-500 font-serif italic text-lg">{label}</div>
            {isUnknown ? (
                <div className={`w-20 md:w-24 h-12 rounded-lg border-2 flex items-center justify-center font-bold select-none shadow-sm ${isRose ? 'border-rose-300 bg-rose-50 text-rose-400' : isEmerald ? 'border-emerald-300 bg-emerald-50 text-emerald-400' : 'border-amber-300 bg-amber-50 text-amber-400'}`}>?</div>
            ) : (
                <div className="relative">
                    <input type="text" value={value} disabled={disabled} onChange={(e) => onChange(id, e.target.value)} className={`w-20 md:w-24 h-12 text-center rounded-lg border-2 text-lg outline-none transition-colors shadow-sm ${status === 'correct' ? 'border-green-500 bg-green-50 text-green-900 font-bold' : status === 'incorrect' ? 'border-red-400 bg-red-50' : `border-slate-300 focus:border-${theme}-500 focus:ring-2 focus:ring-${theme}-200`}`} placeholder="..." />
                    {status === 'correct' && <CheckCircle className="w-5 h-5 text-green-600 absolute -top-2 -right-2 bg-white rounded-full shadow-sm" />}
                </div>
            )}
        </div>
    );
};

const MiniFormulaInput = ({ id, value, isUnknown, status, disabled, onChange }) => {
    if (isUnknown) return <div className="w-12 h-8 rounded border-2 flex items-center justify-center font-bold select-none border-rose-300 bg-rose-50 text-rose-400 text-sm">?</div>;
    return (
        <div className="relative">
            <input type="text" value={value} disabled={disabled} onChange={(e) => onChange(id, e.target.value)} className={`w-12 h-8 text-center rounded border-2 text-sm outline-none transition-colors shadow-sm ${status === 'correct' ? 'border-green-500 bg-green-50 text-green-900 font-bold' : status === 'incorrect' ? 'border-red-400 bg-red-50' : `border-slate-300 focus:border-rose-500`}`} placeholder="..." />
            {status === 'correct' && <CheckCircle className="w-3 h-3 text-green-600 absolute -top-1 -right-1 bg-white rounded-full" />}
        </div>
    );
};

const FractionInputInteraktiv = ({ idTop, idBot, valTop, valBot, onChange, disabled, statusTop, statusBot, theme }) => {
    const getBorderClass = (status) => {
        if (status === 'correct') return 'border-green-500 bg-green-50 text-green-900 font-bold';
        if (status === 'incorrect') return 'border-red-400 bg-red-50 text-red-900';
        return `border-slate-300 focus:border-${theme}-500 focus:ring-1 focus:ring-${theme}-200`;
    };
    return (
        <div className="flex flex-col items-center justify-center w-16 relative">
            <input type="text" className={`w-14 h-10 text-center text-lg transition-colors border-2 rounded-t outline-none ${getBorderClass(statusTop)}`} value={valTop} onChange={e => onChange(idTop, e.target.value)} disabled={disabled} />
            <div className="w-16 h-0.5 bg-slate-800 my-1"></div>
            <input type="text" className={`w-14 h-10 text-center text-lg transition-colors border-2 rounded-b outline-none ${getBorderClass(statusBot)}`} value={valBot} onChange={e => onChange(idBot, e.target.value)} disabled={disabled} />
            {statusTop === 'correct' && statusBot === 'correct' && <CheckCircle className="w-5 h-5 text-green-600 absolute -right-6 top-1/2 -translate-y-1/2" />}
        </div>
    );
};

// Kompakte Variante für das interaktive Baumdiagramm (Wahrscheinlichkeits-Trainer).
const MiniFractionInput = ({ idTop, idBot, valTop, valBot, onChange, disabled, statusTop, statusBot, theme }) => {
    const getBorderClass = (status) => {
        if (status === 'correct') return 'border-green-500 bg-green-50 text-green-900 font-bold';
        if (status === 'incorrect') return 'border-red-400 bg-red-50 text-red-900';
        return `border-slate-300 focus:border-${theme}-500 focus:ring-1 focus:ring-${theme}-200`;
    };
    return (
        <div className="flex flex-col items-center justify-center w-12 relative bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-1 border border-slate-200">
            <input type="text" className={`w-10 h-7 text-center text-sm transition-colors border-2 rounded-t outline-none ${getBorderClass(statusTop)}`} value={valTop} onChange={e => onChange(idTop, e.target.value)} disabled={disabled} />
            <div className="w-10 h-0.5 bg-slate-800 my-0.5"></div>
            <input type="text" className={`w-10 h-7 text-center text-sm transition-colors border-2 rounded-b outline-none ${getBorderClass(statusBot)}`} value={valBot} onChange={e => onChange(idBot, e.target.value)} disabled={disabled} />
            {statusTop === 'correct' && statusBot === 'correct' && <CheckCircle className="w-4 h-4 text-green-600 absolute -right-3 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-sm z-10" />}
        </div>
    );
};

const DifficultyMenu = ({ options, active, onChange, theme = 'emerald' }) => {
    const t = themeColors[theme] || themeColors.emerald;
    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
            <span className="font-bold text-slate-700">Neue Aufgabe generieren:</span>
            <div className="flex gap-2 flex-wrap justify-center">
                {options.map(opt => (
                    <button key={opt.id} onClick={() => onChange(opt.id)}
                        className={`px-4 py-2 font-bold rounded-lg shadow-sm transition-colors ${active === opt.id ? `${t.btnBg} text-white` : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

// ==========================================
// 4b. WISSENSCHAFTLICHER TASCHENRECHNER
// ==========================================

// Rendert ein berechnetes Ergebnis: Standard als Dezimal mit deutscher Komma-Notation,
// optional als Bruch (Continued-Fraction-Approximation) wenn der Toggle aktiv ist.
const CalcResult = ({ value, asFraction }) => {
    if (value === null || value === undefined) return <span>{' '}</span>;
    if (asFraction) {
        const f = decToFraction(value);
        if (f && f[1] > 1 && Math.abs(f[0]) < 1e10) {
            return <Frac top={f[0]} bot={f[1]} />;
        }
    }
    let s;
    if (Math.abs(value) >= 1e15 || (Math.abs(value) < 1e-6 && value !== 0)) {
        s = value.toExponential(6);
    } else {
        s = String(Math.round(value * 1e10) / 1e10);
    }
    return <span>{s.replace('.', ',')}</span>;
};

const ScientificCalculator = ({ onClose, theme = 'sky' }) => {
    const [expr, setExpr] = useState('');
    const [cursorPos, setCursorPos] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    // Winkelmodus immer DEG — Schüler tippen Werte in Grad ein, kein Toggle nötig.
    const angleMode = 'DEG';
    const [showAsFraction, setShowAsFraction] = useState(false);
    const [ans, setAns] = useState(null);

    const t = themeColors[theme] || themeColors.sky;

    // Fügt eine Zeichenkette an der Cursor-Position ein und rückt den Cursor entsprechend nach.
    // Optionaler `cursorOffset`: setzt den Cursor relativ zum Einfügungs-Beginn (statt ans Ende).
    // Z.B. append('^()', 2) → fügt '^()' ein, Cursor zwischen den Klammern.
    const append = (s, cursorOffset) => {
        setExpr(prev => prev.slice(0, cursorPos) + s + prev.slice(cursorPos));
        if (cursorOffset !== undefined) {
            setCursorPos(p => p + cursorOffset);
        } else {
            setCursorPos(p => p + s.length);
        }
        setError(null);
    };
    // Löscht das Zeichen LINKS vom Cursor.
    const backspace = () => {
        if (cursorPos === 0) return;
        setExpr(prev => prev.slice(0, cursorPos - 1) + prev.slice(cursorPos));
        setCursorPos(p => Math.max(0, p - 1));
        setError(null);
    };
    const clearAll = () => { setExpr(''); setCursorPos(0); setResult(null); setError(null); };
    const useAns = () => { if (ans !== null) append(`(${ans})`); };
    const moveLeft = () => setCursorPos(p => Math.max(0, p - 1));
    const moveRight = () => setCursorPos(p => Math.min(expr.length, p + 1));
    const moveStart = () => setCursorPos(0);
    const moveEnd = () => setCursorPos(expr.length);

    const calc = () => {
        if (!expr.trim()) return;
        try {
            // Reihenfolge ist wichtig: längere Muster zuerst.
            let s = expr
                .replace(/π/g, '(Math.PI)')
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-')
                // Inverse Trigonometrie ZUERST, sonst matcht sin( auch sin⁻¹(.
                .replace(/sin⁻¹\(/g, '_AS(')
                .replace(/cos⁻¹\(/g, '_AC(')
                .replace(/tan⁻¹\(/g, '_AT(')
                .replace(/sin\(/g, '_S(')
                .replace(/cos\(/g, '_C(')
                .replace(/tan\(/g, '_T(')
                // log(b, x) -> log_b(x). Muss vor dem '),' Komma->Punkt-Schritt passieren.
                .replace(/log\(([^,()]+),\s*([^()]+)\)/g, '(Math.log($2)/Math.log($1))')
                // n. Wurzel: nrt(n, x) → x^(1/n). `**` statt Math.pow, sonst sprengt
                // der spätere ,→. Ersatz die Math.pow-Argumente.
                .replace(/nrt\(([^,()]+),\s*([^()]+)\)/g, '(($2)**(1/($1)))')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/√\(/g, 'Math.sqrt(')
                .replace(/\^/g, '**')
                // Verbliebene Kommas sind Dezimaltrenner aus deutscher Eingabe.
                .replace(/,/g, '.');

            // Trig-Helper basierend auf Winkelmodus.
            const helpers = angleMode === 'DEG'
                ? `var _S=function(x){return Math.sin(x*Math.PI/180);};var _C=function(x){return Math.cos(x*Math.PI/180);};var _T=function(x){return Math.tan(x*Math.PI/180);};var _AS=function(x){return Math.asin(x)*180/Math.PI;};var _AC=function(x){return Math.acos(x)*180/Math.PI;};var _AT=function(x){return Math.atan(x)*180/Math.PI;};`
                : `var _S=Math.sin;var _C=Math.cos;var _T=Math.tan;var _AS=Math.asin;var _AC=Math.acos;var _AT=Math.atan;`;

            // Whitelist-Schutz: nach allen Substitutionen darf nur noch eine eng begrenzte
            // Menge an Zeichen / Tokens vorkommen. Schützt vor durchgeschleuster Code-Injection.
            const allowed = s.replace(/Math\.(PI|sqrt|log|sin|cos|tan|asin|acos|atan)/g, '')
                             .replace(/_(S|C|T|AS|AC|AT)/g, '');
            if (!/^[\d\s\.\+\-\*\/\(\)]*$/.test(allowed.replace(/\*\*/g, ''))) {
                setError('Ungültige Eingabe');
                setResult(null);
                return;
            }

            const r = Function(`"use strict";${helpers}return(${s});`)();
            if (typeof r !== 'number' || !Number.isFinite(r)) {
                setError('Mathe-Fehler');
                setResult(null);
                return;
            }
            setResult(r);
            setAns(r);
        } catch (e) {
            setError('Fehler im Ausdruck');
            setResult(null);
        }
    };

    const Btn = ({ label, onClick, variant = 'normal' }) => {
        const base = 'h-9 sm:h-11 rounded-lg font-bold text-xs sm:text-sm transition-colors flex items-center justify-center select-none';
        const variants = {
            normal: 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700',
            number: 'bg-slate-100 hover:bg-slate-200 text-slate-900',
            op: 'bg-slate-200 hover:bg-slate-300 text-slate-900',
            primary: `${t.btnBg} ${t.btnHover} text-white`,
            danger: 'bg-red-100 hover:bg-red-200 text-red-700',
            func: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200'
        };
        return <button type="button" onClick={onClick} className={`${base} ${variants[variant]}`}>{label}</button>;
    };

    return (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 max-w-md w-full overflow-hidden">
            <div className={`${t.btnBg} text-white px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center`}>
                <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    <span className="font-bold text-sm sm:text-base">Wissenschaftlicher Rechner</span>
                </div>
                <div className="flex items-center gap-2">
                    {onClose && (
                        <button type="button" onClick={onClose} className="hover:bg-white/20 rounded-lg p-1.5 transition-colors" aria-label="Rechner schließen" title="Rechner schließen">
                            <XCircle className="w-7 h-7" />
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-slate-800 text-white px-3 sm:px-4 py-3 font-mono">
                <div className="text-sm opacity-80 min-h-[20px] break-all flex justify-end items-center">
                    {expr.length === 0
                        ? <span className="inline-block w-px h-4 bg-amber-300 animate-pulse"></span>
                        : (
                            <span className="inline-flex items-center text-right flex-wrap justify-end">
                                <span>{expr.slice(0, cursorPos)}</span>
                                <span className="inline-block w-px h-4 bg-amber-300 animate-pulse mx-px"></span>
                                <span>{expr.slice(cursorPos)}</span>
                            </span>
                        )}
                </div>
                <div className="text-xl sm:text-2xl font-bold min-h-[36px] flex items-center justify-end">
                    {error
                        ? <span className="text-red-400 text-base">{error}</span>
                        : result !== null
                            ? <CalcResult value={result} asFraction={showAsFraction} />
                            : <span>{' '}</span>}
                </div>
            </div>

            {/* Edit-Toolbar: Cursor-Steuerung — funktioniert auch nach "=" weiter, sodass der Ausdruck editierbar bleibt. */}
            <div className="bg-slate-100 px-2 sm:px-3 py-1.5 grid grid-cols-4 gap-1 sm:gap-1.5 border-y border-slate-200">
                <button type="button" onClick={moveStart} className="h-8 rounded font-bold text-xs bg-white hover:bg-slate-200 text-slate-700 border border-slate-200" title="Cursor an den Anfang">⏮</button>
                <button type="button" onClick={moveLeft} className="h-8 rounded font-bold text-xs bg-white hover:bg-slate-200 text-slate-700 border border-slate-200" title="Cursor nach links">◀</button>
                <button type="button" onClick={moveRight} className="h-8 rounded font-bold text-xs bg-white hover:bg-slate-200 text-slate-700 border border-slate-200" title="Cursor nach rechts">▶</button>
                <button type="button" onClick={moveEnd} className="h-8 rounded font-bold text-xs bg-white hover:bg-slate-200 text-slate-700 border border-slate-200" title="Cursor ans Ende">⏭</button>
            </div>

            <div className="bg-slate-50 px-2 sm:px-3 py-1.5 text-[10px] sm:text-[11px] text-slate-600 border-b border-slate-200 flex flex-wrap justify-center gap-x-3 gap-y-1">
                <span>log<sub>b</sub>(x) = <strong>log(b,x)</strong></span>
                <span><sup>3</sup>√27 = <strong>nrt(3,27)</strong></span>
            </div>

            <div className="p-2 sm:p-3 grid grid-cols-5 gap-1 sm:gap-1.5">
                <Btn variant="func" label="sin" onClick={() => append('sin(')} />
                <Btn variant="func" label="cos" onClick={() => append('cos(')} />
                <Btn variant="func" label="tan" onClick={() => append('tan(')} />
                {/* log öffnet "log(,)" mit Cursor zwischen "(" und "," — wie nrt. */}
                <Btn variant="func" label="log" onClick={() => append('log(,)', 4)} />
                <Btn variant="op" label="⌫" onClick={backspace} />

                <Btn variant="func" label={<span>sin<sup>−1</sup></span>} onClick={() => append('sin⁻¹(')} />
                <Btn variant="func" label={<span>cos<sup>−1</sup></span>} onClick={() => append('cos⁻¹(')} />
                <Btn variant="func" label={<span>tan<sup>−1</sup></span>} onClick={() => append('tan⁻¹(')} />
                <Btn variant="func" label="ln" onClick={() => append('ln(')} />
                <Btn variant="danger" label="AC" onClick={clearAll} />

                <Btn variant="op" label="(" onClick={() => append('(')} />
                <Btn variant="op" label=")" onClick={() => append(')')} />
                {/* x^y öffnet "^()" mit Cursor zwischen den Klammern → erlaubt Bruch-Exponent. */}
                <Btn variant="op" label={<span>x<sup>y</sup></span>} onClick={() => append('^()', 2)} />
                <Btn variant="op" label="√" onClick={() => append('√()', 2)} />
                {/* n. Wurzel: nrt(n, x) → x^(1/n). Cursor landet zwischen "nrt(" und ",". */}
                <Btn variant="op" label={<span><sup className="text-xs">n</sup>√</span>} onClick={() => append('nrt(,)', 4)} />

                <Btn variant="number" label="7" onClick={() => append('7')} />
                <Btn variant="number" label="8" onClick={() => append('8')} />
                <Btn variant="number" label="9" onClick={() => append('9')} />
                <Btn variant="op" label="÷" onClick={() => append('÷')} />
                <Btn variant="op" label="π" onClick={() => append('π')} />

                <Btn variant="number" label="4" onClick={() => append('4')} />
                <Btn variant="number" label="5" onClick={() => append('5')} />
                <Btn variant="number" label="6" onClick={() => append('6')} />
                <Btn variant="op" label="×" onClick={() => append('×')} />
                <Btn variant="func" label="a/b" onClick={() => append('/')} />

                <Btn variant="number" label="1" onClick={() => append('1')} />
                <Btn variant="number" label="2" onClick={() => append('2')} />
                <Btn variant="number" label="3" onClick={() => append('3')} />
                <Btn variant="op" label="−" onClick={() => append('−')} />
                <Btn variant="func" label="S↔D" onClick={() => setShowAsFraction(f => !f)} />

                <Btn variant="number" label="0" onClick={() => append('0')} />
                <Btn variant="number" label="," onClick={() => append(',')} />
                <Btn variant="number" label="." onClick={() => append('.')} />
                <Btn variant="op" label="+" onClick={() => append('+')} />
                <Btn variant="primary" label="=" onClick={calc} />
            </div>
        </div>
    );
};

// Wiederverwendbarer Trigger-Button: rendert den Rechner inline (aufklappbar)
// statt als Modal-Overlay — verdeckt nichts auf der Seite.
const CalcButton = ({ theme = 'sky', label = 'Rechner' }) => {
    const [open, setOpen] = useState(false);
    const t = themeColors[theme] || themeColors.sky;
    return (
        <div className="w-full">
            <button type="button" onClick={() => setOpen(o => !o)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 font-medium text-sm transition-colors bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                    aria-expanded={open}
                    title={open ? 'Rechner einklappen' : 'Wissenschaftlichen Rechner einblenden'}>
                <Calculator className={`w-4 h-4 ${t.activeTitle}`} />
                <span>{open ? `${label} schließen` : label}</span>
            </button>
            {open && (
                <div className="mt-3 animate-fade-in flex justify-center">
                    <ScientificCalculator theme={theme} onClose={() => setOpen(false)} />
                </div>
            )}
        </div>
    );
};

const SuccessBox = ({ text = "Klasse gemacht! 🎉", subtitle, showSolutionBtn, showSolution, onToggleSolution, onNext, nextBtnText = "Nächste Aufgabe", extraBtn, solutionText, theme = 'emerald' }) => {
    const t = themeColors[theme] || themeColors.emerald;
    return (
        <div className="bg-green-50 border-2 border-green-500 p-8 rounded-xl shadow-sm text-center animate-fade-in mt-6">
            <h3 className="text-3xl font-bold text-green-800 mb-3">{text}</h3>
            {subtitle && <p className="text-green-700 mb-6 text-lg">{subtitle}</p>}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                {extraBtn}
                {showSolutionBtn && (
                    <button onClick={onToggleSolution} className="text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium shadow-sm"><BookOpen className="w-4 h-4"/> Lösungsweg</button>
                )}
                <button onClick={onNext} className={`${t.btnBg} ${t.btnHover} text-white px-8 py-3 rounded-lg font-bold shadow-md flex items-center justify-center gap-2`}><RefreshCw className="w-5 h-5" /> {nextBtnText}</button>
            </div>
            {showSolution && solutionText && <div className="w-full bg-white p-6 rounded-xl border border-green-200 mt-6 text-sm font-mono whitespace-pre-line text-slate-700 text-left shadow-inner">{solutionText}</div>}
        </div>
    );
};

// (Kein Export — diese Datei wird inline pro App-Seite zusammen mit dem
//  Trainer-Code kompiliert, sodass alle obigen Konstanten im selben Scope sind.)
