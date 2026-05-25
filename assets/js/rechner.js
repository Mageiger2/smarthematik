// ==========================================
// rechner.js — Eigenständige Taschenrechner-Seite
// Zeigt ausschließlich den ScientificCalculator aus shared.js, ohne
// Trainer-Header oder Difficulty-Menü. Mobile-first: passt sich der
// Seitenbreite an (max-w-sm auf Tablet/Desktop, voll auf Handy).
// ==========================================

const RechnerApp = () => {
    return (
        <div className="page-transition px-3 sm:px-6 py-6 sm:py-10 flex flex-col items-center">
            <h1 className="text-lg sm:text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-700" />
                M10 Taschenrechner
            </h1>
            <div className="w-full max-w-sm">
                <ScientificCalculator theme="indigo" />
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(<RechnerApp />);
