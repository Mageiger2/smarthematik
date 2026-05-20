// ==========================================
// trigonometrie.js — Trigonometrie & Satzgruppe Trainer
// (Wird inline mit shared.js zusammen pro App-Seite kompiliert.)
// ==========================================

// Kleiner Helfer — wir nutzen ansonsten formatNum aus shared.js.
const fmtT = (num) => {
    if (num === undefined || num === null) return "";
    return String(num).replace('.', ',');
};

// ==========================================
// 1. MATHEMATIK-ENGINE FÜR DIE ZUFALLSAUFGABEN
// ==========================================

// "Perfekte" Höhen-/Katheten-Dreiecke — basieren auf pythagoräischen Tripeln,
// damit p, q und h glatte Zahlen ergeben.
const getPerfectHoehenTriangle = () => {
    const bases = [ {a: 3, b: 4, c: 5}, {a: 5, b: 12, c: 13}, {a: 7, b: 24, c: 25}, {a: 8, b: 15, c: 17} ];
    const base = bases[getRandomInt(0, bases.length - 1)];
    const scales = [0.5, 0.8, 1, 1.2, 1.5, 2, 2.5, 3, 4];
    const k = scales[getRandomInt(0, scales.length - 1)];

    let a = base.a * k, b = base.b * k, c = base.c * k;
    if (Math.random() > 0.5) { const tmp = a; a = b; b = tmp; }

    const p = (a * a) / c;
    const q = (b * b) / c;
    const h = (a * b) / c;
    const alpha = Math.asin(a / c) * 180 / Math.PI;
    const beta  = Math.asin(b / c) * 180 / Math.PI;

    return {
        a: Number(a.toFixed(2)), b: Number(b.toFixed(2)), c: Number(c.toFixed(2)),
        p: Number(p.toFixed(2)), q: Number(q.toFixed(2)), h: Number(h.toFixed(2)),
        alpha: Number(alpha.toFixed(1)), beta: Number(beta.toFixed(1))
    };
};

// Zufälliges rechtwinkliges Dreieck mit ganzzahligen Katheten — für reine
// Sin-/Cos-/Tan-Aufgaben (Hypotenuse darf auch irrational sein).
const getPerfectTrigTriangle = () => {
    const a = getRandomInt(4, 25);
    const b = getRandomInt(4, 25);
    const c = Math.sqrt(a * a + b * b);
    const alpha = Math.atan2(a, b) * 180 / Math.PI;
    const beta  = 90 - alpha;
    return {
        a: Number(a.toFixed(1)), b: Number(b.toFixed(1)), c: Number(c.toFixed(1)),
        alpha: Number(alpha.toFixed(1)), beta: Number(beta.toFixed(1))
    };
};

// Berechnet Start/Ende eines Winkelbogens im SVG.
// Bei 'angle' (mit Label) wird das Label AUSSERHALB des Dreiecks (Anti-Bisektor) gesetzt,
// und ein Leader-Strich verbindet das Label durch den Vertex hindurch mit dem Bogen.
const getAngleData = (V, P1, P2, radius) => {
    let a1 = Math.atan2(P1.y - V.y, P1.x - V.x);
    let a2 = Math.atan2(P2.y - V.y, P2.x - V.x);
    if (a1 < 0) a1 += 2 * Math.PI;
    if (a2 < 0) a2 += 2 * Math.PI;

    let diff = a2 - a1;
    if (diff >  Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;

    const sweepSVG = diff > 0 ? 0 : 1;
    const bisector = a1 + diff / 2;
    const antiBis = bisector + Math.PI;

    // Anker für Leader-Linie: nahe am Bogen (auf Bisektor-Richtung bei 0.65 × Radius).
    // Etwas näher am Bogen-Außenrand als zuvor (0.5), damit der Leader-Strich nicht so
    // tief ins Bogen-Innere ragt.
    const arcMid = { x: V.x + Math.cos(bisector) * (radius * 0.65), y: V.y + Math.sin(bisector) * (radius * 0.65) };
    // Label sitzt AUSSERHALB des Dreiecks auf der Verlängerung der Bisektor-Linie.
    // Deutlich näher am Vertex als zuvor (2.4 → 1.4) — der Leader-Strich war zu lang
    // und ließ das Label „weglaufen", besonders bei flachen Winkeln.
    const labelDist = radius * 1.4;
    const labelPos = { x: V.x + Math.cos(antiBis) * labelDist, y: V.y + Math.sin(antiBis) * labelDist };

    return {
        start: { x: V.x + Math.cos(a1) * radius, y: V.y + Math.sin(a1) * radius },
        end:   { x: V.x + Math.cos(a2) * radius, y: V.y + Math.sin(a2) * radius },
        dot:   { x: V.x + Math.cos(bisector) * (radius * 0.45), y: V.y + Math.sin(bisector) * (radius * 0.45) },
        arcMid, labelPos,
        sweepSVG
    };
};

// ==========================================
// 2. SVG-VIEWER (auto-bounding, unverzerrt)
// ==========================================
const SvgViewer = ({ elements }) => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const updateBounds = (pt) => {
        if (pt.x < minX) minX = pt.x; if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y; if (pt.y > maxY) maxY = pt.y;
    };

    // PASS 1: Nur Geometrie (kein Text), um initiale Skala zu schätzen.
    elements.forEach(el => {
        if (el.type === 'text' || el.type === 'angle') return;
        if (el.points) el.points.forEach(updateBounds);
        if (el.p1) updateBounds(el.p1);
        if (el.p2) updateBounds(el.p2);
        if (el.v)  updateBounds(el.v);
        if (el.center) {
            updateBounds({ x: el.center.x - el.r, y: el.center.y - el.r });
            updateBounds({ x: el.center.x + el.r, y: el.center.y + el.r });
        }
    });

    // Initialer Span dient als Skalen-Anker. Text-Maße sind in user-Einheiten proportional dazu.
    const initSpanX = Math.max(maxX - minX, 0.001) || 10;
    const initSpanY = Math.max(maxY - minY, 0.001) || 10;
    // 1 SVG-Pixel ≈ initSpanX / svgW user-Einheiten. Bei svgW=600 und Schrift ≈ 9 px breit
    // ergibt sich Buchstaben-Breite in user-Einheiten als 9/600 · initSpanX = 0.015 · initSpanX.
    const charW = 0.015 * initSpanX;
    const charH = 0.040 * initSpanY;

    // PASS 2: Text-/Winkel-Bounds mit skalierter Schätzung.
    elements.forEach(el => {
        if (el.type === 'angle') {
            const ad = getAngleData(el.v, el.p1, el.p2, el.r);
            updateBounds(ad.labelPos);
            const tw = (el.label ? String(el.label).length : 2) * charW;
            const th = charH * 1.2;
            updateBounds({ x: ad.labelPos.x - tw / 2, y: ad.labelPos.y - th / 2 });
            updateBounds({ x: ad.labelPos.x + tw / 2, y: ad.labelPos.y + th / 2 });
        }
        if (el.type === 'text') {
            const tw = (el.text ? String(el.text).length : 1) * charW;
            const th = charH;
            const aw = el.anchor === 'end' ? 1 : (el.anchor === 'start' ? 0 : 0.5);
            const ab = el.baseline === 'hanging' ? 0 : (el.baseline === 'auto' ? 1 : 0.5);
            updateBounds({ x: el.x - aw * tw,        y: el.y - (1 - ab) * th });
            updateBounds({ x: el.x + (1 - aw) * tw,  y: el.y + ab * th });
        }
    });

    const spanX = (maxX - minX) || 10;
    const spanY = (maxY - minY) || 10;
    // Proportionales Innenpolster — links + rechts großzügig, damit Beschriftungen
    // mit anchor='start'/'end' niemals abgeschnitten werden.
    let finalMinX = minX - spanX * 0.08;
    let finalMaxX = maxX + spanX * 0.08;
    let finalMinY = minY - spanY * 0.05;
    let finalMaxY = maxY + spanY * 0.05;
    let pSpanX = finalMaxX - finalMinX;
    let pSpanY = finalMaxY - finalMinY;

    // Natürliches Aspect-Ratio nutzen — quadratische Diagramme (z.B. Viertelkreis
    // 2012 I/5) füllen so deutlich mehr Fläche. Clamping schützt vor Extremen.
    const naturalAR = pSpanX / pSpanY;
    const clampedAR = Math.max(0.85, Math.min(1.75, naturalAR));
    if (naturalAR > clampedAR) {
        const extra = pSpanX / clampedAR - pSpanY;
        finalMinY -= extra / 2; finalMaxY += extra / 2; pSpanY = finalMaxY - finalMinY;
    } else if (naturalAR < clampedAR) {
        const extra = pSpanY * clampedAR - pSpanX;
        finalMinX -= extra / 2; finalMaxX += extra / 2; pSpanX = finalMaxX - finalMinX;
    }

    const svgW = 600;
    const svgH = Math.round(svgW / clampedAR);

    const mapX = (x) => ((x - finalMinX) / pSpanX) * svgW;
    const mapY = (y) => (1 - (y - finalMinY) / pSpanY) * svgH;
    const scale = svgW / pSpanX;

    return (
        <div className="flex justify-center w-full bg-white p-4 border border-slate-200 rounded-xl shadow-inner">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet" className="w-full max-w-[640px] h-auto" style={{ aspectRatio: `${svgW} / ${svgH}` }}>
                {elements.map((el, i) => {
                    if (el.type === 'polygon') {
                        const pts = el.points.map(p => `${mapX(p.x)},${mapY(p.y)}`).join(' ');
                        return <polygon key={i} points={pts} fill={el.fill} />;
                    }
                    if (el.type === 'segment') {
                        // butt-Linecap (kein Überstand an Endpunkten) für dicke Linien;
                        // round nur für dünne Standard-Striche (≤ 3.5).
                        const w = el.width || 3.5;
                        return <line key={i} x1={mapX(el.p1.x)} y1={mapY(el.p1.y)} x2={mapX(el.p2.x)} y2={mapY(el.p2.y)} stroke={el.stroke || "#1e293b"} strokeWidth={w} strokeDasharray={el.dashed ? "8,8" : ""} strokeLinecap={w > 3.5 ? "butt" : "round"} />;
                    }
                    if (el.type === 'rightAngle') {
                        // Bogen + Punkt in der Mitte. Etwas kleiner als ursprünglich (0.75 × angefragter Radius),
                        // damit benachbarte rechte Winkel sich nicht überschneiden.
                        const eff = el.r * 0.75;
                        const ad = getAngleData(el.v, el.p1, el.p2, eff);
                        const rSvg = eff * scale;
                        return (
                            <g key={i}>
                                <path d={`M ${mapX(ad.start.x)} ${mapY(ad.start.y)} A ${rSvg} ${rSvg} 0 0 ${ad.sweepSVG} ${mapX(ad.end.x)} ${mapY(ad.end.y)}`} fill="none" stroke="#1e293b" strokeWidth="2" />
                                <circle cx={mapX(ad.dot.x)} cy={mapY(ad.dot.y)} r="2.5" fill="#1e293b" />
                            </g>
                        );
                    }
                    if (el.type === 'angle') {
                        const ad = getAngleData(el.v, el.p1, el.p2, el.r);
                        const rSvg = el.r * scale;
                        return (
                            <g key={i}>
                                <path d={`M ${mapX(ad.start.x)} ${mapY(ad.start.y)} A ${rSvg} ${rSvg} 0 0 ${ad.sweepSVG} ${mapX(ad.end.x)} ${mapY(ad.end.y)}`} fill="none" stroke="#1e293b" strokeWidth="2" />
                                {/* Leader-Strich von der Bogen-Mitte über den Vertex zum Label (kräftig, schwarz). */}
                                <line x1={mapX(ad.arcMid.x)} y1={mapY(ad.arcMid.y)} x2={mapX(ad.labelPos.x)} y2={mapY(ad.labelPos.y)} stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
                                {/* Label mit weißem Halo, damit Buchstabe gut lesbar bleibt. */}
                                <text x={mapX(ad.labelPos.x)} y={mapY(ad.labelPos.y)} fill="white" stroke="white" strokeWidth="6" fontSize={el.labelSize || 17} fontWeight="700" textAnchor="middle" dominantBaseline="middle" paintOrder="stroke" style={{ fontFamily: "'Cambria Math', 'Times New Roman', serif", fontStyle: 'italic' }}>{fmtT(el.label)}</text>
                                <text x={mapX(ad.labelPos.x)} y={mapY(ad.labelPos.y)} fill="#1e293b" fontSize={el.labelSize || 17} fontWeight="700" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: "'Cambria Math', 'Times New Roman', serif", fontStyle: 'italic' }}>{fmtT(el.label)}</text>
                            </g>
                        );
                    }
                    if (el.type === 'arc') {
                        const rSvg = el.r * scale;
                        return <path key={i} d={`M ${mapX(el.p1.x)} ${mapY(el.p1.y)} A ${rSvg} ${rSvg} 0 0 0 ${mapX(el.p2.x)} ${mapY(el.p2.y)}`} fill="none" stroke="#1e293b" strokeWidth="2.5" />;
                    }
                    if (el.type === 'text') {
                        return <text key={i} x={mapX(el.x)} y={mapY(el.y)} fill={el.color || "#1e293b"} fontSize={el.size || 18} fontWeight={el.weight || "700"} textAnchor={el.anchor || "middle"} dominantBaseline={el.baseline || "middle"} style={{ fontFamily: "'Cambria Math', 'Times New Roman', serif", fontStyle: el.italic === false ? 'normal' : 'italic' }}>{el.text}</text>;
                    }
                    return null;
                })}
            </svg>
        </div>
    );
};

// ==========================================
// 3. SVG-BAUKLÖTZE (Standard- vs Höhen-Layout)
// ==========================================
const buildSvgBase = (tri, fillCol, mode = "standard") => {
    let els = [];
    // Bewusst kleiner als zuvor (0.12 → 0.08), damit rechte Winkel und Winkelbögen
    // nicht in benachbarte Markierungen reinlaufen.
    const r = Math.max(tri.a, tri.b, tri.c) * 0.08;

    if (mode === "standard") {
        const A = { x: 0, y: 0 }, C = { x: tri.b, y: 0 }, B = { x: tri.b, y: tri.a };
        els = [
            { type: 'polygon', points: [A, C, B], fill: fillCol },
            { type: 'segment', p1: A, p2: C },
            { type: 'segment', p1: C, p2: B },
            { type: 'segment', p1: B, p2: A },
            { type: 'rightAngle', v: C, p1: A, p2: B, r }
        ];
    } else {
        // hypo_bottom: Hypotenuse liegt unten, Höhe steht senkrecht.
        const A = { x: 0, y: 0 }, B = { x: tri.c, y: 0 }, C = { x: tri.q, y: tri.h }, D = { x: tri.q, y: 0 };
        // Der rechte Winkel am Höhen-Fußpunkt D wird in das GRÖSSERE Teildreieck gelegt.
        // Hintergrund: bei einem schmalen Teildreieck (p oder q klein) würde der Marker
        // sonst an die schräge Kathete stoßen. p2 = A → linkes Teildreieck, p2 = B → rechtes.
        const rightAngleSecondPt = tri.p < tri.q ? A : B;
        els = [
            { type: 'polygon', points: [A, B, C], fill: fillCol },
            { type: 'segment', p1: A, p2: B },
            { type: 'segment', p1: B, p2: C },
            { type: 'segment', p1: C, p2: A },
            { type: 'segment', p1: C, p2: D, dashed: true },
            { type: 'rightAngle', v: C, p1: A, p2: B, r },
            { type: 'rightAngle', v: D, p1: C, p2: rightAngleSecondPt, r }
        ];
    }
    return els;
};

// ==========================================
// 4. GENERATOREN — LEICHT / MITTEL / SCHWER
// ==========================================
const FILL_ORANGE = "rgba(249, 115, 22, 0.10)"; // sehr dezent (Tailwind orange-500 @ 10%)

// lastTypes ist jetzt ein Array — die letzten 2 Typen werden blockiert, damit nicht
// zwei "fast identische" Aufgaben hintereinander erscheinen.
const generateLevel1 = (lastTypes = []) => {
    let type, attempts = 0;
    do { type = getRandomInt(1, 6); attempts++; } while (lastTypes.includes(type) && attempts < 30);

    const tT = getPerfectTrigTriangle();
    const tH = getPerfectHoehenTriangle();
    const id = "l1_" + Date.now();
    let title, desc, els, steps;

    if (type <= 4) {
        // r dient gleichzeitig als Winkelbogen-Radius UND als Label-Distanz.
        // Bewusst kleiner als zuvor (0.15 → 0.09), damit Beschriftungen näher an
        // den Linien sitzen und Winkelbögen nicht in andere Markierungen reinlaufen.
        const r = Math.max(tT.a, tT.b, tT.c) * 0.09;
        if (type === 1) {
            title = "Sinus anwenden";
            desc = `Gegeben ist die Hypotenuse c = ${fmtT(tT.c)} cm und der Winkel α = ${fmtT(tT.alpha)}°. Berechne die Gegenkathete a.`;
            els = buildSvgBase(tT, FILL_ORANGE, "standard");
            els.push({ type: 'angle', v: { x: 0, y: 0 }, p1: { x: tT.b, y: 0 }, p2: { x: tT.b, y: tT.a }, r, label: `${fmtT(tT.alpha)}°` });
            els.push({ type: 'text', x: tT.b / 2 - tT.a / tT.c * r * 1.2, y: tT.a / 2 + tT.b / tT.c * r * 1.2, text: `c = ${fmtT(tT.c)}` }, { type: 'text', x: tT.b + r, y: tT.a / 2, text: 'a = ?', anchor: 'start' });
            steps = [
                { id: 1, goal: "Wähle die passende Formel.", type: "formula_selection", options: ["sin(α) = GK / HYP", "cos(α) = AK / HYP", "tan(α) = GK / AK"], correctAnswer: "sin(α) = GK / HYP", feedback: "Du suchst die Gegenkathete und kennst die Hypotenuse." },
                { id: 2, goal: "Werte einsetzen.", type: "substitution", template: "sin([input1]°) = [input2] / [input3]", correctInputs: [tT.alpha.toString(), "a", tT.c.toString()], feedback: "Winkel, gesuchte Seite, Hypotenuse." },
                { id: 3, goal: "Berechne a.", type: "calculation", template: "a = [input] cm", correctAnswer: tT.a.toString(), tolerance: 0.2, feedback: `a = ${fmtT(tT.c)} · sin(${fmtT(tT.alpha)}°)` }
            ];
        } else if (type === 2) {
            title = "Cosinus anwenden";
            desc = `Gegeben ist die Hypotenuse c = ${fmtT(tT.c)} cm und der Winkel α = ${fmtT(tT.alpha)}°. Berechne die Ankathete b.`;
            els = buildSvgBase(tT, FILL_ORANGE, "standard");
            els.push({ type: 'angle', v: { x: 0, y: 0 }, p1: { x: tT.b, y: 0 }, p2: { x: tT.b, y: tT.a }, r, label: `${fmtT(tT.alpha)}°` });
            els.push({ type: 'text', x: tT.b / 2 - tT.a / tT.c * r * 1.2, y: tT.a / 2 + tT.b / tT.c * r * 1.2, text: `c = ${fmtT(tT.c)}` }, { type: 'text', x: tT.b / 2, y: -r, text: 'b = ?', baseline: 'hanging' });
            steps = [
                { id: 1, goal: "Wähle die passende Formel.", type: "formula_selection", options: ["sin(α) = GK / HYP", "cos(α) = AK / HYP", "tan(α) = GK / AK"], correctAnswer: "cos(α) = AK / HYP", feedback: "Du suchst die Ankathete und kennst die Hypotenuse." },
                { id: 2, goal: "Werte einsetzen.", type: "substitution", template: "cos([input1]°) = [input2] / [input3]", correctInputs: [tT.alpha.toString(), "b", tT.c.toString()], feedback: "Winkel, gesuchte Seite, Hypotenuse." },
                { id: 3, goal: "Berechne b.", type: "calculation", template: "b = [input] cm", correctAnswer: tT.b.toString(), tolerance: 0.2, feedback: `b = ${fmtT(tT.c)} · cos(${fmtT(tT.alpha)}°)` }
            ];
        } else if (type === 3) {
            title = "Tangens anwenden";
            desc = `Gegeben ist die Ankathete b = ${fmtT(tT.b)} cm und der Winkel α = ${fmtT(tT.alpha)}°. Berechne die Gegenkathete a.`;
            els = buildSvgBase(tT, FILL_ORANGE, "standard");
            els.push({ type: 'angle', v: { x: 0, y: 0 }, p1: { x: tT.b, y: 0 }, p2: { x: tT.b, y: tT.a }, r, label: `${fmtT(tT.alpha)}°` });
            els.push({ type: 'text', x: tT.b / 2, y: -r, text: `b = ${fmtT(tT.b)}` }, { type: 'text', x: tT.b + r, y: tT.a / 2, text: 'a = ?' });
            steps = [
                { id: 1, goal: "Wähle die passende Formel.", type: "formula_selection", options: ["sin(α) = GK / HYP", "cos(α) = AK / HYP", "tan(α) = GK / AK"], correctAnswer: "tan(α) = GK / AK", feedback: "Ankathete ist gegeben, Gegenkathete wird gesucht." },
                { id: 2, goal: "Werte einsetzen.", type: "substitution", template: "tan([input1]°) = [input2] / [input3]", correctInputs: [tT.alpha.toString(), "a", tT.b.toString()], feedback: "Winkel, Gegenkathete (a), Ankathete (b)." },
                { id: 3, goal: "Berechne a.", type: "calculation", template: "a = [input] cm", correctAnswer: tT.a.toString(), tolerance: 0.2, feedback: `a = ${fmtT(tT.b)} · tan(${fmtT(tT.alpha)}°)` }
            ];
        } else {
            title = "Winkel berechnen";
            desc = `Gegeben ist die Hypotenuse c = ${fmtT(tT.c)} cm und die Gegenkathete a = ${fmtT(tT.a)} cm. Berechne den Winkel α.`;
            els = buildSvgBase(tT, FILL_ORANGE, "standard");
            els.push({ type: 'angle', v: { x: 0, y: 0 }, p1: { x: tT.b, y: 0 }, p2: { x: tT.b, y: tT.a }, r, label: "α = ?" });
            els.push({ type: 'text', x: tT.b / 2 - tT.a / tT.c * r * 1.2, y: tT.a / 2 + tT.b / tT.c * r * 1.2, text: `c = ${fmtT(tT.c)}` }, { type: 'text', x: tT.b + r, y: tT.a / 2, text: `a = ${fmtT(tT.a)}`, anchor: 'start' });
            steps = [
                { id: 1, goal: "Wähle die passende Formel.", type: "formula_selection", options: ["sin(α) = GK / HYP", "cos(α) = AK / HYP", "tan(α) = GK / AK"], correctAnswer: "sin(α) = GK / HYP", feedback: "GK und HYP sind gegeben." },
                { id: 2, goal: "Werte einsetzen.", type: "substitution", template: "sin(α) = [input1] / [input2]", correctInputs: [tT.a.toString(), tT.c.toString()], feedback: "GK oben, HYP unten." },
                { id: 3, goal: "Berechne α.", type: "calculation", template: "α = [input] °", correctAnswer: tT.alpha.toString(), tolerance: 0.5, feedback: `Nutze sin⁻¹(${fmtT(tT.a)}/${fmtT(tT.c)}).` }
            ];
        }
    } else {
        const r = Math.max(tH.a, tH.b, tH.c) * 0.09;
        if (type === 5) {
            title = "Höhensatz";
            desc = `Die Höhe h teilt die Hypotenuse in p = ${fmtT(tH.p)} cm und q = ${fmtT(tH.q)} cm. Berechne die Höhe h.`;
            els = buildSvgBase(tH, FILL_ORANGE, "hypo_bottom");
            // h-Label auf der breiteren Seite — vermeidet Überlappung mit schräger Kathete.
            els.push({ type: 'text', x: tH.q / 2, y: -r, text: `q = ${fmtT(tH.q)}`, baseline: 'hanging' }, { type: 'text', x: tH.q + tH.p / 2, y: -r, text: `p = ${fmtT(tH.p)}`, baseline: 'hanging' }, { type: 'text', x: tH.q + (tH.q > tH.p ? -r * 0.6 : r * 0.6), y: tH.h * 0.32, text: 'h = ?', anchor: tH.q > tH.p ? 'end' : 'start' });
            steps = [
                { id: 1, goal: "Wähle die passende Formel.", type: "formula_selection", options: ["h² = p · q", "a² = c · p", "b² = c · q"], correctAnswer: "h² = p · q", feedback: "Wenn p und q gegeben sind, hilft der Höhensatz." },
                { id: 2, goal: "Werte einsetzen (Reihenfolge egal).", type: "substitution", template: "h² = [input1] · [input2]", correctInputs: [tH.q.toString(), tH.p.toString()], altInputs: [[tH.p.toString(), tH.q.toString()]], feedback: "Setze q und p ein." },
                { id: 3, goal: "Berechne h.", type: "calculation", template: "h = [input] cm", correctAnswer: tH.h.toString(), tolerance: 0.2, feedback: `Wurzel aus (${fmtT(tH.p)} · ${fmtT(tH.q)})` }
            ];
        } else {
            title = "Kathetensatz";
            desc = `Gegeben ist die Hypotenuse c = ${fmtT(tH.c)} cm und der Hypotenusenabschnitt p = ${fmtT(tH.p)} cm. Berechne die Kathete a.`;
            els = buildSvgBase(tH, FILL_ORANGE, "hypo_bottom");
            els.push({ type: 'text', x: tH.c / 2, y: -r * 1.6, text: `c = ${fmtT(tH.c)}`, baseline: 'hanging' }, { type: 'text', x: tH.q + tH.p / 2, y: -r * 0.5, text: `p = ${fmtT(tH.p)}`, baseline: 'hanging' }, { type: 'text', x: tH.q + tH.p / 2 + r * 0.8, y: tH.h / 2 + r * 0.8, text: 'a = ?', anchor: 'start' });
            steps = [
                { id: 1, goal: "Wähle die passende Formel.", type: "formula_selection", options: ["h² = p · q", "a² = c · p", "b² = c · q"], correctAnswer: "a² = c · p", feedback: "Kathete a, Hypotenuse c und Abschnitt p → Kathetensatz!" },
                { id: 2, goal: "Werte einsetzen (Reihenfolge egal).", type: "substitution", template: "a² = [input1] · [input2]", correctInputs: [tH.c.toString(), tH.p.toString()], altInputs: [[tH.p.toString(), tH.c.toString()]], feedback: "Setze c und p ein." },
                { id: 3, goal: "Berechne a.", type: "calculation", template: "a = [input] cm", correctAnswer: tH.a.toString(), tolerance: 0.2, feedback: `Wurzel aus (${fmtT(tH.c)} · ${fmtT(tH.p)})` }
            ];
        }
    }
    return { id, typeId: type, level: 1, title, description: desc, elements: els, steps };
};

const generateLevel2 = (lastTypes = []) => {
    let type, attempts = 0;
    do { type = getRandomInt(1, 5); attempts++; } while (lastTypes.includes(type) && attempts < 30);

    const tH = getPerfectHoehenTriangle();
    const tT = getPerfectTrigTriangle();
    const id = "l2_" + Date.now();
    let title, desc, els, steps;

    if (type === 1) {
        const r = Math.max(tH.a, tH.b, tH.c) * 0.09;
        title = "Höhe und Kathete";
        desc = `Gegeben sind die Hypotenusenabschnitte p = ${fmtT(tH.p)} cm und q = ${fmtT(tH.q)} cm. Berechne zuerst die Höhe h und danach die Kathete a.`;
        els = buildSvgBase(tH, FILL_ORANGE, "hypo_bottom");
        els.push({ type: 'text', x: tH.q / 2, y: -r, text: `q = ${fmtT(tH.q)}`, baseline: 'hanging' }, { type: 'text', x: tH.q + tH.p / 2, y: -r, text: `p = ${fmtT(tH.p)}`, baseline: 'hanging' }, { type: 'text', x: tH.q + (tH.q > tH.p ? -r * 0.6 : r * 0.6), y: tH.h * 0.32, text: 'h = ?', anchor: tH.q > tH.p ? 'end' : 'start' }, { type: 'text', x: tH.q + tH.p / 2 + r * 0.8, y: tH.h / 2 + r * 0.8, text: 'a = ?', anchor: 'start' });
        steps = [
            { id: 1, goal: "Schritt 1: Wähle die Formel für die Höhe h.", type: "formula_selection", options: ["h² = p · q", "a² = c · p"], correctAnswer: "h² = p · q", feedback: "Nutze den Höhensatz!" },
            { id: 2, goal: "Werte für den Höhensatz einsetzen.", type: "substitution", template: "h² = [input1] · [input2]", correctInputs: [tH.p.toString(), tH.q.toString()], altInputs: [[tH.q.toString(), tH.p.toString()]], feedback: "Setze p und q ein." },
            { id: 3, goal: "Berechne h.", type: "calculation", template: "h = [input] cm", correctAnswer: tH.h.toString(), tolerance: 0.2, feedback: "Ziehe die Wurzel." },
            { id: 4, goal: "Schritt 2: Wähle die Formel für die Kathete a.", type: "formula_selection", options: ["a² = c · p", "h² = p · q"], correctAnswer: "a² = c · p", feedback: "Nutze den Kathetensatz für a!" },
            { id: 5, goal: "Werte einsetzen (Hinweis: c = p + q).", type: "substitution", template: "a² = [input1] · [input2]", correctInputs: [tH.c.toString(), tH.p.toString()], altInputs: [[tH.p.toString(), tH.c.toString()]], feedback: "Setze c und p ein." },
            { id: 6, goal: "Berechne a.", type: "calculation", template: "a = [input] cm", correctAnswer: tH.a.toString(), tolerance: 0.2, feedback: "Wurzel ziehen!" }
        ];
    } else if (type === 2) {
        const r = Math.max(tH.a, tH.b, tH.c) * 0.09;
        title = "Kathetensatz rückwärts";
        desc = `Gegeben ist die Hypotenuse c = ${fmtT(tH.c)} cm und die Kathete b = ${fmtT(tH.b)} cm. Berechne zuerst den Abschnitt q und danach die Höhe h.`;
        els = buildSvgBase(tH, FILL_ORANGE, "hypo_bottom");
        els.push({ type: 'text', x: tH.c / 2, y: -r * 1.6, text: `c = ${fmtT(tH.c)}`, baseline: 'hanging' }, { type: 'text', x: tH.q / 2 - r * 0.8, y: tH.h / 2 + r * 0.8, text: `b = ${fmtT(tH.b)}`, anchor: 'end' }, { type: 'text', x: tH.q / 2, y: -r * 0.5, text: 'q = ?', baseline: 'hanging' }, { type: 'text', x: tH.q + (tH.q > tH.p ? -r * 0.6 : r * 0.6), y: tH.h * 0.32, text: 'h = ?', anchor: tH.q > tH.p ? 'end' : 'start' });
        steps = [
            { id: 1, goal: "Schritt 1: Wähle die Formel, um q zu berechnen.", type: "formula_selection", options: ["b² = c · q", "h² = p · q"], correctAnswer: "b² = c · q", feedback: "Kathetensatz für b!" },
            { id: 2, goal: "Werte in den Kathetensatz einsetzen.", type: "substitution", template: "[input1]² = [input2] · q", correctInputs: [tH.b.toString(), tH.c.toString()], feedback: "b und c einsetzen." },
            { id: 3, goal: "Berechne q.", type: "calculation", template: "q = [input] cm", correctAnswer: tH.q.toString(), tolerance: 0.2, feedback: "q = b² / c" },
            { id: 4, goal: "Schritt 2: Berechne den fehlenden Abschnitt p.", type: "calculation", template: "p = [input] cm", correctAnswer: tH.p.toString(), tolerance: 0.2, feedback: `p = c − q = ${fmtT(tH.c)} − ${fmtT(tH.q)}` },
            { id: 5, goal: "Setze nun p und q in den Höhensatz ein.", type: "substitution", template: "h² = [input1] · [input2]", correctInputs: [tH.p.toString(), tH.q.toString()], altInputs: [[tH.q.toString(), tH.p.toString()]], feedback: "Setze p und q ein." },
            { id: 6, goal: "Berechne die Höhe h.", type: "calculation", template: "h = [input] cm", correctAnswer: tH.h.toString(), tolerance: 0.2, feedback: "Wurzel ziehen." }
        ];
    } else if (type === 3) {
        const r = Math.max(tT.a, tT.b, tT.c) * 0.09;
        title = "Trigonometrie-Mix";
        desc = `Gegeben ist die Hypotenuse c = ${fmtT(tT.c)} cm und die Kathete a = ${fmtT(tT.a)} cm. Berechne zuerst den Winkel α und danach den Winkel β.`;
        els = buildSvgBase(tT, FILL_ORANGE, "standard");
        els.push({ type: 'angle', v: { x: 0, y: 0 }, p1: { x: tT.b, y: 0 }, p2: { x: tT.b, y: tT.a }, r, label: "α = ?" });
        els.push({ type: 'angle', v: { x: tT.b, y: tT.a }, p1: { x: 0, y: 0 }, p2: { x: tT.b, y: 0 }, r, label: "β = ?" });
        els.push({ type: 'text', x: tT.b / 2 - tT.a / tT.c * r * 1.2, y: tT.a / 2 + tT.b / tT.c * r * 1.2, text: `c = ${fmtT(tT.c)}` }, { type: 'text', x: tT.b + r, y: tT.a / 2, text: `a = ${fmtT(tT.a)}`, anchor: 'start' });
        steps = [
            { id: 1, goal: "Schritt 1: Wähle die Formel für den Winkel α.", type: "formula_selection", options: ["sin(α) = a / c", "cos(α) = a / c"], correctAnswer: "sin(α) = a / c", feedback: "Gegenkathete durch Hypotenuse ist Sinus." },
            { id: 2, goal: "Werte in die Formel einsetzen.", type: "substitution", template: "sin(α) = [input1] / [input2]", correctInputs: [tT.a.toString(), tT.c.toString()], feedback: "Gegenkathete oben, Hypotenuse unten." },
            { id: 3, goal: "Berechne α.", type: "calculation", template: "α = [input] °", correctAnswer: tT.alpha.toString(), tolerance: 0.5, feedback: `Nutze sin⁻¹(${fmtT(tT.a)}/${fmtT(tT.c)}).` },
            { id: 4, goal: "Schritt 2: Berechne β über die Winkelsumme im Dreieck (180°).", type: "calculation", template: "β = [input] °", correctAnswer: tT.beta.toString(), tolerance: 0.5, feedback: `180° − 90° − ${fmtT(tT.alpha)}°` }
        ];
    } else if (type === 4) {
        // NEU: Höhensatz rückwärts — h und q sind gegeben, gesucht p und c.
        const r = Math.max(tH.a, tH.b, tH.c) * 0.09;
        title = "Höhensatz rückwärts";
        desc = `Gegeben sind die Höhe h = ${fmtT(tH.h)} cm und der Hypotenusenabschnitt q = ${fmtT(tH.q)} cm. Berechne zuerst den fehlenden Abschnitt p und dann die gesamte Hypotenuse c.`;
        els = buildSvgBase(tH, FILL_ORANGE, "hypo_bottom");
        els.push(
            { type: 'text', x: tH.q / 2, y: -r, text: `q = ${fmtT(tH.q)}`, baseline: 'hanging' },
            { type: 'text', x: tH.q + tH.p / 2, y: -r, text: 'p = ?', baseline: 'hanging' },
            { type: 'text', x: tH.q + (tH.q > tH.p ? -r * 0.6 : r * 0.6), y: tH.h * 0.32, text: `h = ${fmtT(tH.h)}`, anchor: tH.q > tH.p ? 'end' : 'start' }
        );
        steps = [
            { id: 1, goal: "Schritt 1: Wähle die Formel, um p zu berechnen.", type: "formula_selection", options: ["h² = p · q", "a² = c · p"], correctAnswer: "h² = p · q", feedback: "Stelle den Höhensatz nach p um: p = h² / q." },
            { id: 2, goal: "Werte einsetzen.", type: "substitution", template: "[input1]² = [input2] · q", correctInputs: [tH.h.toString(), "p"], altInputs: [[tH.h.toString(), "P"]], feedback: "Setze h links und p · q rechts ein." },
            { id: 3, goal: "Berechne p.", type: "calculation", template: "p = [input] cm", correctAnswer: tH.p.toString(), tolerance: 0.2, feedback: `p = h² / q = ${fmtT(tH.h)}² / ${fmtT(tH.q)}` },
            { id: 4, goal: "Schritt 2: Berechne die gesamte Hypotenuse c.", type: "calculation", template: "c = [input] cm", correctAnswer: tH.c.toString(), tolerance: 0.2, feedback: "c = p + q" }
        ];
    } else {
        // NEU: Hypotenuse + Winkel → beide Katheten (sin und cos kombiniert).
        const r = Math.max(tT.a, tT.b, tT.c) * 0.09;
        title = "Hypotenuse und Winkel";
        desc = `Gegeben sind die Hypotenuse c = ${fmtT(tT.c)} cm und der Winkel α = ${fmtT(tT.alpha)}°. Berechne nacheinander die Gegenkathete a und die Ankathete b.`;
        els = buildSvgBase(tT, FILL_ORANGE, "standard");
        els.push({ type: 'angle', v: { x: 0, y: 0 }, p1: { x: tT.b, y: 0 }, p2: { x: tT.b, y: tT.a }, r, label: `${fmtT(tT.alpha)}°` });
        els.push(
            { type: 'text', x: tT.b / 2 - tT.a / tT.c * r * 1.2, y: tT.a / 2 + tT.b / tT.c * r * 1.2, text: `c = ${fmtT(tT.c)}` },
            { type: 'text', x: tT.b + r, y: tT.a / 2, text: 'a = ?', anchor: 'start' },
            { type: 'text', x: tT.b / 2, y: -r, text: 'b = ?', baseline: 'hanging' }
        );
        steps = [
            { id: 1, goal: "Schritt 1: Wähle die Formel für die Gegenkathete a.", type: "formula_selection", options: ["sin(α) = a / c", "cos(α) = b / c", "tan(α) = a / b"], correctAnswer: "sin(α) = a / c", feedback: "Gegenkathete und Hypotenuse → Sinus." },
            { id: 2, goal: "Werte einsetzen.", type: "substitution", template: "sin([input1]°) = [input2] / [input3]", correctInputs: [tT.alpha.toString(), "a", tT.c.toString()], feedback: "Winkel, a, c." },
            { id: 3, goal: "Berechne a.", type: "calculation", template: "a = [input] cm", correctAnswer: tT.a.toString(), tolerance: 0.2, feedback: `a = ${fmtT(tT.c)} · sin(${fmtT(tT.alpha)}°)` },
            { id: 4, goal: "Schritt 2: Wähle die Formel für die Ankathete b.", type: "formula_selection", options: ["cos(α) = b / c", "sin(α) = b / c", "tan(α) = b / a"], correctAnswer: "cos(α) = b / c", feedback: "Ankathete und Hypotenuse → Cosinus." },
            { id: 5, goal: "Werte einsetzen.", type: "substitution", template: "cos([input1]°) = [input2] / [input3]", correctInputs: [tT.alpha.toString(), "b", tT.c.toString()], feedback: "Winkel, b, c." },
            { id: 6, goal: "Berechne b.", type: "calculation", template: "b = [input] cm", correctAnswer: tT.b.toString(), tolerance: 0.2, feedback: `b = ${fmtT(tT.c)} · cos(${fmtT(tT.alpha)}°)` }
        ];
    }
    return { id, typeId: type, level: 2, title, description: desc, elements: els, steps };
};

const generateLevel3 = (lastTypes = []) => {
    let type, attempts = 0;
    do { type = getRandomInt(1, 5); attempts++; } while (lastTypes.includes(type) && attempts < 30);

    const tH = getPerfectHoehenTriangle();
    const id = "l3_" + Date.now();
    const r = Math.max(tH.a, tH.b, tH.c) * 0.09;
    let title, desc, els, steps;

    if (type === 1) {
        title = "Höhen- und Kathetensatz kombiniert";
        desc = `Im rechtwinkligen Dreieck ABC kennst du die Höhe h = ${fmtT(tH.h)} cm und den Abschnitt p = ${fmtT(tH.p)} cm. Berechne schrittweise q, die Hypotenuse c und schließlich die Kathete b.`;
        els = buildSvgBase(tH, FILL_ORANGE, "hypo_bottom");
        els.push(
            { type: 'text', x: tH.q + tH.p / 2, y: -r, text: `p = ${fmtT(tH.p)}`, baseline: 'hanging' },
            { type: 'text', x: tH.q + (tH.q > tH.p ? -r * 0.6 : r * 0.6), y: tH.h * 0.32, text: `h = ${fmtT(tH.h)}`, anchor: tH.q > tH.p ? 'end' : 'start' },
            { type: 'text', x: tH.q / 2, y: -r, text: 'q = ?', baseline: 'hanging' },
            { type: 'text', x: tH.q / 2 - r * 0.8, y: tH.h / 2 + r * 0.8, text: 'b = ?', anchor: 'end' }
        );
        steps = [
            { id: 1, goal: "Schritt 1: Wähle die Formel, um q zu berechnen.", type: "formula_selection", options: ["h² = p · q", "b² = c · q"], correctAnswer: "h² = p · q", feedback: "Nutze den Höhensatz und stelle ihn nach q um." },
            { id: 2, goal: "Werte einsetzen.", type: "substitution", template: "[input1]² = [input2] · q", correctInputs: [tH.h.toString(), tH.p.toString()], feedback: "Setze h und p ein." },
            { id: 3, goal: "Berechne q.", type: "calculation", template: "q = [input] cm", correctAnswer: tH.q.toString(), tolerance: 0.2, feedback: "q = h² / p" },
            { id: 4, goal: "Schritt 2: Berechne die gesamte Hypotenuse c.", type: "calculation", template: "c = [input] cm", correctAnswer: tH.c.toString(), tolerance: 0.2, feedback: "c = p + q" },
            { id: 5, goal: "Schritt 3: Wähle die Formel, um b zu berechnen.", type: "formula_selection", options: ["b² = c · q", "a² = c · p"], correctAnswer: "b² = c · q", feedback: "Kathetensatz für Seite b!" },
            { id: 6, goal: "Werte in die Formel einsetzen.", type: "substitution", template: "b² = [input1] · [input2]", correctInputs: [tH.c.toString(), tH.q.toString()], altInputs: [[tH.q.toString(), tH.c.toString()]], feedback: "Setze c und q ein." },
            { id: 7, goal: "Berechne b.", type: "calculation", template: "b = [input] cm", correctAnswer: tH.b.toString(), tolerance: 0.2, feedback: "Wurzel ziehen." }
        ];
    } else if (type === 2) {
        title = "Trigonometrie-Kombi A";
        desc = `Gegeben sind die Abschnitte p = ${fmtT(tH.p)} cm und q = ${fmtT(tH.q)} cm. Berechne die Hypotenuse c, dann die Kathete a und schließlich den Winkel α.`;
        els = buildSvgBase(tH, FILL_ORANGE, "hypo_bottom");
        els.push({ type: 'text', x: tH.q + tH.p / 2, y: -r, text: `p = ${fmtT(tH.p)}` }, { type: 'text', x: tH.q / 2, y: -r, text: `q = ${fmtT(tH.q)}` }, { type: 'text', x: tH.q + tH.p / 2 + r, y: tH.h / 2 + r, text: 'a = ?' });
        els.push({ type: 'angle', v: { x: 0, y: 0 }, p1: { x: tH.c, y: 0 }, p2: { x: tH.q, y: tH.h }, r: r * 0.85, label: 'α' });
        steps = [
            { id: 1, goal: "Schritt 1: Berechne die gesamte Hypotenuse c.", type: "calculation", template: "c = [input] cm", correctAnswer: tH.c.toString(), tolerance: 0.2, feedback: "c = p + q" },
            { id: 2, goal: "Schritt 2: Wähle die Formel, um a zu berechnen.", type: "formula_selection", options: ["b² = c · q", "a² = c · p"], correctAnswer: "a² = c · p", feedback: "Kathetensatz für a!" },
            { id: 3, goal: "Werte in die Formel einsetzen.", type: "substitution", template: "a² = [input1] · [input2]", correctInputs: [tH.c.toString(), tH.p.toString()], altInputs: [[tH.p.toString(), tH.c.toString()]], feedback: "Setze c und p ein." },
            { id: 4, goal: "Berechne a.", type: "calculation", template: "a = [input] cm", correctAnswer: tH.a.toString(), tolerance: 0.2, feedback: "Wurzel aus c · p" },
            { id: 5, goal: "Schritt 3: Wähle die Formel für den Winkel α (im großen Dreieck).", type: "formula_selection", options: ["sin(α) = a / c", "cos(α) = b / c"], correctAnswer: "sin(α) = a / c", feedback: "Gegenkathete / Hypotenuse." },
            { id: 6, goal: "Werte in die Formel einsetzen.", type: "substitution", template: "sin(α) = [input1] / [input2]", correctInputs: [tH.a.toString(), tH.c.toString()], feedback: "a / c." },
            { id: 7, goal: "Berechne den Winkel α.", type: "calculation", template: "α = [input] °", correctAnswer: tH.alpha.toString(), tolerance: 0.5, feedback: "sin⁻¹(a/c)" }
        ];
    } else if (type === 3) {
        title = "Trigonometrie-Kombi B";
        desc = `Gegeben sind die Hypotenuse c = ${fmtT(tH.c)} cm und der Abschnitt p = ${fmtT(tH.p)} cm. Berechne q, dann die Höhe h und damit den Winkel β (im rechten Teildreieck).`;
        els = buildSvgBase(tH, FILL_ORANGE, "hypo_bottom");
        els.push({ type: 'text', x: tH.c / 2, y: -r * 1.6, text: `c = ${fmtT(tH.c)}`, baseline: 'hanging' }, { type: 'text', x: tH.q + tH.p / 2, y: -r * 0.5, text: `p = ${fmtT(tH.p)}`, baseline: 'hanging' }, { type: 'text', x: tH.q + (tH.q > tH.p ? -r * 0.6 : r * 0.6), y: tH.h * 0.32, text: 'h = ?', anchor: tH.q > tH.p ? 'end' : 'start' });
        els.push({ type: 'angle', v: { x: tH.c, y: 0 }, p1: { x: tH.q, y: tH.h }, p2: { x: 0, y: 0 }, r: r * 0.85, label: 'β' });
        steps = [
            { id: 1, goal: "Schritt 1: Berechne den fehlenden Abschnitt q.", type: "calculation", template: "q = [input] cm", correctAnswer: tH.q.toString(), tolerance: 0.2, feedback: "q = c − p" },
            { id: 2, goal: "Schritt 2: Wähle die Formel, um die Höhe h zu berechnen.", type: "formula_selection", options: ["h² = p · q", "b² = c · q"], correctAnswer: "h² = p · q", feedback: "Nutze den Höhensatz." },
            { id: 3, goal: "Werte einsetzen.", type: "substitution", template: "h² = [input1] · [input2]", correctInputs: [tH.p.toString(), tH.q.toString()], altInputs: [[tH.q.toString(), tH.p.toString()]], feedback: "p und q einsetzen." },
            { id: 4, goal: "Berechne die Höhe h.", type: "calculation", template: "h = [input] cm", correctAnswer: tH.h.toString(), tolerance: 0.2, feedback: "Wurzel aus p · q" },
            { id: 5, goal: "Schritt 3: Wähle die Winkelfunktion für β (im rechten Teildreieck mit h und p).", type: "formula_selection", options: ["tan(β) = h / p", "sin(β) = h / p"], correctAnswer: "tan(β) = h / p", feedback: "Gegenkathete (h) durch Ankathete (p)." },
            { id: 6, goal: "Werte in die Formel einsetzen.", type: "substitution", template: "tan(β) = [input1] / [input2]", correctInputs: [tH.h.toString(), tH.p.toString()], feedback: "h oben, p unten." },
            { id: 7, goal: "Berechne den Winkel β.", type: "calculation", template: "β = [input] °", correctAnswer: tH.beta.toString(), tolerance: 0.5, feedback: "tan⁻¹(h/p)" }
        ];
    } else if (type === 4) {
        // NEU: Pythagoras + Trigonometrie — zwei Katheten gegeben, c, α und β gesucht.
        const tTri = getPerfectTrigTriangle();
        const rT = Math.max(tTri.a, tTri.b, tTri.c) * 0.09;
        title = "Pythagoras + Trigonometrie";
        desc = `Im rechtwinkligen Dreieck ABC sind die beiden Katheten a = ${fmtT(tTri.a)} cm und b = ${fmtT(tTri.b)} cm gegeben. Berechne nacheinander die Hypotenuse c, den Winkel α und den Winkel β.`;
        els = buildSvgBase(tTri, FILL_ORANGE, "standard");
        els.push({ type: 'angle', v: { x: 0, y: 0 }, p1: { x: tTri.b, y: 0 }, p2: { x: tTri.b, y: tTri.a }, r: rT, label: 'α = ?' });
        els.push({ type: 'angle', v: { x: tTri.b, y: tTri.a }, p1: { x: 0, y: 0 }, p2: { x: tTri.b, y: 0 }, r: rT, label: 'β = ?' });
        els.push(
            { type: 'text', x: tTri.b / 2, y: -rT, text: `b = ${fmtT(tTri.b)}`, baseline: 'hanging' },
            { type: 'text', x: tTri.b + rT, y: tTri.a / 2, text: `a = ${fmtT(tTri.a)}`, anchor: 'start' },
            { type: 'text', x: tTri.b / 2 - tTri.a / tTri.c * rT * 1.2, y: tTri.a / 2 + tTri.b / tTri.c * rT * 1.2, text: 'c = ?' }
        );
        steps = [
            { id: 1, goal: "Schritt 1: Wähle die Formel für die Hypotenuse c.", type: "formula_selection", options: ["a² + b² = c² (Pythagoras)", "h² = p · q (Höhensatz)"], correctAnswer: "a² + b² = c² (Pythagoras)", feedback: "Beide Katheten sind bekannt → Pythagoras." },
            { id: 2, goal: "Werte einsetzen (Reihenfolge egal).", type: "substitution", template: "[input1]² + [input2]² = c²", correctInputs: [tTri.a.toString(), tTri.b.toString()], altInputs: [[tTri.b.toString(), tTri.a.toString()]], feedback: "a und b in den Satz des Pythagoras einsetzen." },
            { id: 3, goal: "Berechne c.", type: "calculation", template: "c = [input] cm", correctAnswer: tTri.c.toString(), tolerance: 0.3, feedback: `Wurzel aus (${fmtT(tTri.a)}² + ${fmtT(tTri.b)}²)` },
            { id: 4, goal: "Schritt 2: Wähle die Formel für den Winkel α.", type: "formula_selection", options: ["tan(α) = a / b", "sin(α) = b / c", "cos(α) = a / c"], correctAnswer: "tan(α) = a / b", feedback: "Gegenkathete (a) und Ankathete (b) sind beide bekannt → Tangens." },
            { id: 5, goal: "Werte einsetzen.", type: "substitution", template: "tan(α) = [input1] / [input2]", correctInputs: [tTri.a.toString(), tTri.b.toString()], feedback: "Gegenkathete oben, Ankathete unten." },
            { id: 6, goal: "Berechne α.", type: "calculation", template: "α = [input] °", correctAnswer: tTri.alpha.toString(), tolerance: 0.5, feedback: `tan⁻¹(${fmtT(tTri.a)} / ${fmtT(tTri.b)})` },
            { id: 7, goal: "Schritt 3: Berechne β über die Winkelsumme im Dreieck (180°).", type: "calculation", template: "β = [input] °", correctAnswer: tTri.beta.toString(), tolerance: 0.5, feedback: `180° − 90° − ${fmtT(tTri.alpha)}°` }
        ];
    } else {
        // NEU: Kathete + Hypotenuse → Winkel α (sin⁻¹), β (Winkelsumme), zweite Kathete (Pythagoras).
        title = "Winkel und zweite Kathete";
        desc = `Im rechtwinkligen Dreieck ABC sind die Kathete a = ${fmtT(tH.a)} cm und die Hypotenuse c = ${fmtT(tH.c)} cm gegeben. Berechne den Winkel α, danach den Winkel β und schließlich die zweite Kathete b.`;
        els = buildSvgBase(tH, FILL_ORANGE, "standard");
        els.push({ type: 'angle', v: { x: 0, y: 0 }, p1: { x: tH.b, y: 0 }, p2: { x: tH.b, y: tH.a }, r, label: 'α = ?' });
        els.push(
            { type: 'text', x: tH.b / 2 - tH.a / tH.c * r * 1.2, y: tH.a / 2 + tH.b / tH.c * r * 1.2, text: `c = ${fmtT(tH.c)}` },
            { type: 'text', x: tH.b + r, y: tH.a / 2, text: `a = ${fmtT(tH.a)}`, anchor: 'start' },
            { type: 'text', x: tH.b / 2, y: -r, text: 'b = ?', baseline: 'hanging' }
        );
        steps = [
            { id: 1, goal: "Schritt 1: Wähle die Formel für den Winkel α.", type: "formula_selection", options: ["sin(α) = a / c", "cos(α) = a / c", "tan(α) = a / c"], correctAnswer: "sin(α) = a / c", feedback: "Gegenkathete durch Hypotenuse → Sinus." },
            { id: 2, goal: "Werte einsetzen.", type: "substitution", template: "sin(α) = [input1] / [input2]", correctInputs: [tH.a.toString(), tH.c.toString()], feedback: "Gegenkathete oben, Hypotenuse unten." },
            { id: 3, goal: "Berechne α.", type: "calculation", template: "α = [input] °", correctAnswer: tH.alpha.toString(), tolerance: 0.5, feedback: `sin⁻¹(${fmtT(tH.a)} / ${fmtT(tH.c)})` },
            { id: 4, goal: "Schritt 2: Berechne β über die Winkelsumme im Dreieck (180°).", type: "calculation", template: "β = [input] °", correctAnswer: tH.beta.toString(), tolerance: 0.5, feedback: `180° − 90° − ${fmtT(tH.alpha)}°` },
            { id: 5, goal: "Schritt 3: Wähle die Formel für die Kathete b.", type: "formula_selection", options: ["a² + b² = c² (Pythagoras)", "sin(β) = b / c", "h² = p · q"], correctAnswer: "a² + b² = c² (Pythagoras)", feedback: "a und c sind bekannt → Pythagoras nach b auflösen." },
            { id: 6, goal: "Werte einsetzen.", type: "substitution", template: "[input1]² + b² = [input2]²", correctInputs: [tH.a.toString(), tH.c.toString()], feedback: "a und c einsetzen." },
            { id: 7, goal: "Berechne b.", type: "calculation", template: "b = [input] cm", correctAnswer: tH.b.toString(), tolerance: 0.3, feedback: `Wurzel aus (${fmtT(tH.c)}² − ${fmtT(tH.a)}²)` }
        ];
    }
    return { id, typeId: type, level: 3, title, description: desc, elements: els, steps };
};

// ==========================================
// 5. PRÜFUNGSAUFGABEN-POOL (MSA BAYERN, ggf. angepasst)
// ==========================================
const msaTasks = [
    {
        id: "msa_muster_i9", sourceLabel: "MSA Muster I/9", title: "Musterprüfung — Höhensatz & Kathetensatz",
        description: "Gegeben ist folgende Figur mit den Längen p = 2 m und q = 8 m. Berechne die Strecken x, y und h sowie die Größen der Winkel α und β.",
        elements: (() => {
            const c = 10, p = 2, q = 8, h = 4, x = Math.sqrt(c * q), y = Math.sqrt(c * p);
            const r = c * 0.06;
            return [
                { type: 'polygon', points: [{ x: 0, y: 0 }, { x: c, y: 0 }, { x: q, y: h }], fill: FILL_ORANGE },
                { type: 'segment', p1: { x: 0, y: 0 }, p2: { x: c, y: 0 } },
                { type: 'segment', p1: { x: c, y: 0 }, p2: { x: q, y: h } },
                { type: 'segment', p1: { x: q, y: h }, p2: { x: 0, y: 0 } },
                { type: 'segment', p1: { x: q, y: h }, p2: { x: q, y: 0 }, dashed: true },
                { type: 'rightAngle', v: { x: q, y: h }, p1: { x: 0, y: 0 }, p2: { x: c, y: 0 }, r },
                // q=8, p=2 → rechtes Teildreieck kleiner, Marker ins linke (p2=A statt B).
                { type: 'rightAngle', v: { x: q, y: 0 }, p1: { x: q, y: h }, p2: { x: 0, y: 0 }, r },
                { type: 'angle', v: { x: 0, y: 0 }, p1: { x: c, y: 0 }, p2: { x: q, y: h }, r: r * 2.2, label: 'α' },
                { type: 'angle', v: { x: c, y: 0 }, p1: { x: q, y: h }, p2: { x: 0, y: 0 }, r: r * 2.2, label: 'β' },
                { type: 'text', x: q / 2, y: -r, text: 'q = 8' },
                { type: 'text', x: q + 1, y: -r, text: 'p = 2' },
                { type: 'text', x: q - r * 1.4, y: h * 0.3, text: 'h', anchor: 'end' },
                { type: 'text', x: q / 2 - r, y: h / 2 + r * 0.5, text: 'y' },
                { type: 'text', x: q + 1 + r, y: h / 2 + r * 0.5, text: 'x' }
            ];
        })(),
        steps: [
            { id: 1, goal: "Schritt 1: Wie lang ist die gesamte Hypotenuse c (= AB)?", type: "calculation", template: "c = [input] m", correctAnswer: "10", tolerance: 0.1, feedback: "c = p + q = 2 + 8" },
            { id: 2, goal: "Schritt 2: Wähle die Formel für die Höhe h.", type: "formula_selection", options: ["h² = p · q", "a² = c · p"], correctAnswer: "h² = p · q", feedback: "Höhensatz!" },
            { id: 3, goal: "Werte einsetzen.", type: "substitution", template: "h² = [input1] · [input2]", correctInputs: ["2", "8"], altInputs: [["8", "2"]], feedback: "p und q einsetzen." },
            { id: 4, goal: "Berechne h.", type: "calculation", template: "h = [input] m", correctAnswer: "4", tolerance: 0.1, feedback: "Wurzel aus 16" },
            { id: 5, goal: "Schritt 3: Berechne x (= rechte Kathete, gegenüber von α) mit dem Kathetensatz.", type: "calculation", template: "x = [input] m", correctAnswer: "4.5", tolerance: 0.3, feedback: "x² = c · p = 10 · 2 = 20 → x ≈ 4,47" },
            { id: 6, goal: "Schritt 4: Berechne y (= linke Kathete, gegenüber von β) mit dem Kathetensatz.", type: "calculation", template: "y = [input] m", correctAnswer: "8.9", tolerance: 0.3, feedback: "y² = c · q = 10 · 8 = 80 → y ≈ 8,94" },
            { id: 7, goal: "Schritt 5: Berechne den Winkel α (Gegenkathete x, Hypotenuse c).", type: "calculation", template: "α = [input] °", correctAnswer: "26.6", tolerance: 0.6, feedback: "sin(α) = x / c → sin⁻¹(4,47 / 10)" },
            { id: 8, goal: "Schritt 6: Berechne den Winkel β über die Winkelsumme (180°).", type: "calculation", template: "β = [input] °", correctAnswer: "63.4", tolerance: 0.6, feedback: "180° − 90° − α" }
        ]
    },
    {
        id: "msa_2025_ii9", sourceLabel: "MSA 2025 II/9", title: "MSA 2025 — Thaleskreis",
        description: "M ist der Mittelpunkt des Thaleskreises über der Strecke AB (Hypotenuse c). Der Flächeninhalt des Kreises beträgt A = 113,04 cm². Es gilt MD : DB = 1 : 2. Berechne die Höhe h und die Kathete a.",
        elements: [
            { type: 'polygon', points: [{ x: 0, y: 0 }, { x: 12, y: 0 }, { x: 8, y: 5.66 }], fill: FILL_ORANGE },
            { type: 'arc', center: { x: 6, y: 0 }, p1: { x: 12, y: 0 }, p2: { x: 0, y: 0 }, r: 6 },
            { type: 'segment', p1: { x: 0, y: 0 }, p2: { x: 12, y: 0 } },
            { type: 'segment', p1: { x: 12, y: 0 }, p2: { x: 8, y: 5.66 } },
            { type: 'segment', p1: { x: 8, y: 5.66 }, p2: { x: 0, y: 0 } },
            { type: 'segment', p1: { x: 8, y: 5.66 }, p2: { x: 8, y: 0 }, dashed: true },
            { type: 'rightAngle', v: { x: 8, y: 5.66 }, p1: { x: 0, y: 0 }, p2: { x: 12, y: 0 }, r: 0.7 },
            // q=8, p=4 → rechtes Teildreieck kleiner, Marker ins linke (p2=A).
            { type: 'rightAngle', v: { x: 8, y: 0 }, p1: { x: 8, y: 5.66 }, p2: { x: 0, y: 0 }, r: 0.7 },
            // Ecken A, B, C, M, D als Kleinbuchstaben-Marker
            { type: 'text', x: -0.3, y: -0.5, text: 'A', anchor: 'end', baseline: 'hanging' },
            { type: 'text', x: 12.3, y: -0.5, text: 'B', anchor: 'start', baseline: 'hanging' },
            { type: 'text', x: 8, y: 6.1, text: 'C', anchor: 'middle' },
            { type: 'text', x: 6, y: -0.5, text: 'M', anchor: 'middle', baseline: 'hanging' },
            { type: 'text', x: 8.3, y: -0.5, text: 'D', anchor: 'start', baseline: 'hanging' },
            // h und a näher an den Linien, nicht ins Innere
            { type: 'text', x: 7.5, y: 1.8, text: 'h = ?', anchor: 'end' },
            { type: 'text', x: 10.5, y: 2.5, text: 'a', anchor: 'middle' }
        ],
        steps: [
            { id: 1, goal: "Schritt 1: Berechne den Radius r aus dem Flächeninhalt (A = π · r²). Rechne mit π = 3,14.", type: "calculation", template: "r = [input] cm", correctAnswer: "6", tolerance: 0.1, feedback: "113,04 / 3,14 = 36. Wurzel aus 36 ist 6." },
            { id: 2, goal: "Wie lang ist die gesamte Hypotenuse c (= AB)?", type: "calculation", template: "c = [input] cm", correctAnswer: "12", tolerance: 0.1, feedback: "Die Hypotenuse entspricht dem Durchmesser (2 · r)." },
            { id: 3, goal: "Schritt 2: M ist die Mitte (MB = 6). Teile MB im Verhältnis 1:2 auf — wie lang ist p (= DB)?", type: "calculation", template: "p = [input] cm", correctAnswer: "4", tolerance: 0.1, feedback: "6 / 3 = 2. MD = 2, DB = 4." },
            { id: 4, goal: "Wie lang ist q (= AD)?", type: "calculation", template: "q = [input] cm", correctAnswer: "8", tolerance: 0.1, feedback: "q = c − p = 12 − 4." },
            { id: 5, goal: "Schritt 3: Berechne die Höhe h mit dem Höhensatz.", type: "calculation", template: "h = [input] cm", correctAnswer: "5.7", tolerance: 0.2, feedback: "h² = p · q = 4 · 8 = 32. Wurzel!" },
            { id: 6, goal: "Schritt 4: Berechne die Kathete a mit dem Kathetensatz.", type: "calculation", template: "a = [input] cm", correctAnswer: "6.9", tolerance: 0.2, feedback: "a² = c · p = 12 · 4 = 48. Wurzel!" }
        ]
    },
    {
        id: "msa_2012_i5", sourceLabel: "MSA 2012 I/5", title: "MSA 2012 — Viertelkreis & rechtwinkliges Dreieck",
        description: "Die Seite b im rechtwinkligen Dreieck ABC ist 4 cm lang. Der Flächeninhalt des Viertelkreises mit Radius AB beträgt A = 19,625 cm² (Skizze). Berechne die Höhe h und den Winkel α. Rechne mit π = 3,14.",
        elements: (() => {
            // Viertelkreis um A mit Radius c=5 (aus A=π·c²/4 = 19,625 → c²=25 → c=5).
            // Dreieck: rechter Winkel bei C (oben), b=4, a=3, c=5. q=AD=b²/c=3,2; p=DB=a²/c=1,8; h=2,4.
            const c = 5, b = 4, a = 3, q = 3.2, p = 1.8, hH = 2.4;
            return [
                // Viertelkreis von A nach oben — symbolisch.
                { type: 'arc', center: { x: 0, y: 0 }, p1: { x: c, y: 0 }, p2: { x: 0, y: c }, r: c },
                { type: 'segment', p1: { x: 0, y: 0 }, p2: { x: 0, y: c } },
                { type: 'polygon', points: [{ x: 0, y: 0 }, { x: c, y: 0 }, { x: q, y: hH }], fill: FILL_ORANGE },
                { type: 'segment', p1: { x: 0, y: 0 }, p2: { x: c, y: 0 } },
                { type: 'segment', p1: { x: c, y: 0 }, p2: { x: q, y: hH } },
                { type: 'segment', p1: { x: q, y: hH }, p2: { x: 0, y: 0 } },
                { type: 'segment', p1: { x: q, y: hH }, p2: { x: q, y: 0 }, dashed: true },
                { type: 'rightAngle', v: { x: q, y: hH }, p1: { x: 0, y: 0 }, p2: { x: c, y: 0 }, r: 0.3 },
                // q=3,2, p=1,8 → rechtes Teildreieck kleiner, Marker ins linke (p2=A).
                { type: 'rightAngle', v: { x: q, y: 0 }, p1: { x: q, y: hH }, p2: { x: 0, y: 0 }, r: 0.3 },
                { type: 'angle', v: { x: 0, y: 0 }, p1: { x: c, y: 0 }, p2: { x: q, y: hH }, r: 0.6, label: 'α' },
                // Eckenmarker
                { type: 'text', x: -0.15, y: -0.25, text: 'A', anchor: 'end', baseline: 'hanging' },
                { type: 'text', x: c + 0.15, y: -0.25, text: 'B', anchor: 'start', baseline: 'hanging' },
                { type: 'text', x: q + 0.15, y: hH + 0.15, text: 'C', anchor: 'start' },
                { type: 'text', x: q, y: -0.25, text: 'D', anchor: 'middle', baseline: 'hanging' },
                // Seitenbeschriftungen — nah an die jeweilige Linie, mit passendem Anker
                { type: 'text', x: c / 2, y: -0.35, text: 'c', anchor: 'middle', baseline: 'hanging' },
                { type: 'text', x: q / 2 - 0.5, y: hH / 2 + 0.25, text: 'b = 4', anchor: 'end' },
                { type: 'text', x: q - 0.25, y: hH * 0.32, text: 'h = ?', anchor: 'end' },
                { type: 'text', x: 0, y: c + 0.25, text: 'Radius = c', anchor: 'start', size: 14 }
            ];
        })(),
        steps: [
            { id: 1, goal: "Schritt 1: Aus A = π · r² / 4 folgt r². Berechne zuerst r² (mit π = 3,14).", type: "calculation", template: "r² = [input] cm²", correctAnswer: "25", tolerance: 0.2, feedback: "r² = 4 · 19,625 / 3,14 = 25" },
            { id: 2, goal: "Wie lang ist also c (= AB = Radius)?", type: "calculation", template: "c = [input] cm", correctAnswer: "5", tolerance: 0.1, feedback: "Wurzel aus 25." },
            { id: 3, goal: "Schritt 2: Wähle die Formel, um den Hypotenusenabschnitt q (= AD) zu berechnen.", type: "formula_selection", options: ["b² = c · q", "h² = p · q"], correctAnswer: "b² = c · q", feedback: "Kathetensatz für b — q liegt unter b." },
            { id: 4, goal: "Werte einsetzen.", type: "substitution", template: "[input1]² = [input2] · q", correctInputs: ["4", "5"], feedback: "b = 4, c = 5." },
            { id: 5, goal: "Berechne q.", type: "calculation", template: "q = [input] cm", correctAnswer: "3.2", tolerance: 0.1, feedback: "q = 16 / 5 = 3,2" },
            { id: 6, goal: "Berechne p (= c − q).", type: "calculation", template: "p = [input] cm", correctAnswer: "1.8", tolerance: 0.1, feedback: "p = 5 − 3,2 = 1,8" },
            { id: 7, goal: "Schritt 3: Berechne die Höhe h mit dem Höhensatz.", type: "calculation", template: "h = [input] cm", correctAnswer: "2.4", tolerance: 0.1, feedback: "h² = p · q = 1,8 · 3,2 = 5,76 → h = 2,4" },
            { id: 8, goal: "Schritt 4: Berechne den Winkel α (Gegenkathete a = c² − b² → a = 3 cm bzw. cos(α) = b/c).", type: "calculation", template: "α = [input] °", correctAnswer: "36.9", tolerance: 0.6, feedback: "cos(α) = b/c = 4/5 → cos⁻¹(0,8) ≈ 36,9°" }
        ]
    },
    {
        id: "msa_2010_i2", sourceLabel: "MSA 2010 I/2", title: "MSA 2010 — Verhältnis & Höhensatz",
        description: "Im rechtwinkligen Dreieck ABC teilt die Höhe h_c = 10 cm die Hypotenuse im Verhältnis AD : DB = 4 : 1. Berechne die Längen der Hypotenuse AB sowie der Kathete BC und den Winkel α.",
        elements: [
            { type: 'polygon', points: [{ x: 0, y: 0 }, { x: 25, y: 0 }, { x: 20, y: 10 }], fill: FILL_ORANGE },
            { type: 'segment', p1: { x: 0, y: 0 }, p2: { x: 25, y: 0 } },
            { type: 'segment', p1: { x: 25, y: 0 }, p2: { x: 20, y: 10 } },
            { type: 'segment', p1: { x: 20, y: 10 }, p2: { x: 0, y: 0 } },
            { type: 'segment', p1: { x: 20, y: 10 }, p2: { x: 20, y: 0 }, dashed: true },
            { type: 'rightAngle', v: { x: 20, y: 10 }, p1: { x: 0, y: 0 }, p2: { x: 25, y: 0 }, r: 2 },
            // AD=20, DB=5 → rechtes Teildreieck deutlich kleiner, Marker ins linke (p2=A).
            { type: 'rightAngle', v: { x: 20, y: 0 }, p1: { x: 20, y: 10 }, p2: { x: 0, y: 0 }, r: 2 },
            { type: 'angle', v: { x: 0, y: 0 }, p1: { x: 25, y: 0 }, p2: { x: 20, y: 10 }, r: 3, label: 'α' },
            { type: 'text', x: 19.4, y: 3.5, text: 'h = 10', anchor: 'end' },
            { type: 'text', x: 10, y: -2, text: 'AD (q) = 4x' },
            { type: 'text', x: 22.5, y: -2, text: 'DB (p) = 1x' },
            { type: 'text', x: 24, y: 6, text: 'a = ?' }
        ],
        steps: [
            { id: 1, goal: "Teil 1: Setze h = 10 sowie die Ausdrücke p = 1x und q = 4x in den Höhensatz (h² = p · q) ein.", type: "substitution", template: "10² = ([input1]x) · ([input2]x)", correctInputs: ["4", "1"], altInputs: [["1", "4"]], feedback: "q ist 4x, p ist 1x." },
            { id: 2, goal: "Berechne x.", type: "calculation", template: "x = [input]", correctAnswer: "5", tolerance: 0.1, feedback: "100 = 4x². Teile durch 4, ziehe dann die Wurzel." },
            { id: 3, goal: "Wie lang ist die gesamte Strecke AB (Hypotenuse c)?", type: "calculation", template: "c = [input] cm", correctAnswer: "25", tolerance: 0.1, feedback: "x = 5, also p = 5 und q = 20. c = p + q." },
            { id: 4, goal: "Teil 2: Wähle die Formel zur Berechnung der Kathete a.", type: "formula_selection", options: ["a² = c · p", "a² = c · q"], correctAnswer: "a² = c · p", feedback: "Kathetensatz für a — p liegt unter a." },
            { id: 5, goal: "Werte einsetzen.", type: "substitution", template: "a² = [input1] · [input2]", correctInputs: ["25", "5"], altInputs: [["5", "25"]], feedback: "Setze c = 25 und p = 5 ein." },
            { id: 6, goal: "Berechne die Kathete a (= BC).", type: "calculation", template: "a = [input] cm", correctAnswer: "11.2", tolerance: 0.3, feedback: "Wurzel aus 125." },
            { id: 7, goal: "Teil 3: Wähle die Formel für den Winkel α im großen Dreieck.", type: "formula_selection", options: ["sin(α) = a / c", "cos(α) = a / c"], correctAnswer: "sin(α) = a / c", feedback: "Gegenkathete / Hypotenuse." },
            { id: 8, goal: "Werte einsetzen.", type: "substitution", template: "sin(α) = [input1] / [input2]", correctInputs: ["11.2", "25"], altInputs: [["11,2", "25"], ["11.18", "25"], ["11,18", "25"]], feedback: "Setze a und c ein." },
            { id: 9, goal: "Berechne den Winkel α.", type: "calculation", template: "α = [input] °", correctAnswer: "26.6", tolerance: 0.6, feedback: "sin⁻¹(11,18 / 25)" }
        ]
    },
    {
        id: "msa_2011_ii8", sourceLabel: "MSA 2011 II/8", title: "MSA 2011 — Verhältnis BD : DC = 2 : 3",
        description: "Im rechtwinkligen Dreieck ABC (rechter Winkel bei A) stehen die Hypotenusenabschnitte BD und DC im Verhältnis 2 : 3. Berechne die Größe des Winkels α.",
        elements: [
            { type: 'polygon', points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 4, y: 4.899 }], fill: FILL_ORANGE },
            { type: 'segment', p1: { x: 0, y: 0 }, p2: { x: 10, y: 0 } },
            { type: 'segment', p1: { x: 10, y: 0 }, p2: { x: 4, y: 4.899 } },
            { type: 'segment', p1: { x: 4, y: 4.899 }, p2: { x: 0, y: 0 } },
            { type: 'segment', p1: { x: 4, y: 4.899 }, p2: { x: 4, y: 0 }, dashed: true },
            { type: 'rightAngle', v: { x: 4, y: 4.899 }, p1: { x: 10, y: 0 }, p2: { x: 0, y: 0 }, r: 0.8 },
            { type: 'rightAngle', v: { x: 4, y: 0 }, p1: { x: 10, y: 0 }, p2: { x: 4, y: 4.899 }, r: 0.8 },
            { type: 'angle', v: { x: 0, y: 0 }, p1: { x: 10, y: 0 }, p2: { x: 4, y: 4.899 }, r: 1.2, label: 'α = ?' },
            { type: 'text', x: 2, y: -1, text: 'BD (p) = 2x' },
            { type: 'text', x: 7, y: -1, text: 'DC (q) = 3x' }
        ],
        steps: [
            { id: 1, goal: "Schritt 1: Da nur ein Winkel gesucht ist, können wir x = 1 setzen. Welchen Wert nehmen wir für BD (= p) an?", type: "calculation", template: "p = [input]", correctAnswer: "2", tolerance: 0.1, feedback: "p entspricht dem 2er-Anteil." },
            { id: 2, goal: "Schritt 2: Und für DC (= q)?", type: "calculation", template: "q = [input]", correctAnswer: "3", tolerance: 0.1, feedback: "q entspricht dem 3er-Anteil." },
            { id: 3, goal: "Schritt 3: Berechne die Höhe h (= AD) mit dem Höhensatz.", type: "calculation", template: "h = [input]", correctAnswer: "2.45", tolerance: 0.15, feedback: "h = √(2 · 3) = √6" },
            { id: 4, goal: "Schritt 4: Betrachte das linke Teildreieck ABD. Welche Formel hilft, den Winkel α zu finden?", type: "formula_selection", options: ["tan(α) = h / p", "sin(α) = h / c", "cos(α) = p / h"], correctAnswer: "tan(α) = h / p", feedback: "GK (h) und AK (p) im linken Teildreieck sind bekannt." },
            { id: 5, goal: "Berechne den Winkel α.", type: "calculation", template: "α = [input] °", correctAnswer: "50.8", tolerance: 0.8, feedback: "tan⁻¹(2,45 / 2)" }
        ]
    },
    {
        id: "msa_2010_ii4", sourceLabel: "MSA 2010 II/4", title: "MSA 2010 — Länge x bei α = 15°",
        description: "Berechne die Länge der Strecke x (Gegenkathete). Der Winkel α beträgt 15° und die Hypotenuse ist 10 cm lang.",
        elements: [
            { type: 'polygon', points: [{ x: 0, y: 0 }, { x: 9.66, y: 0 }, { x: 9.66, y: 2.59 }], fill: FILL_ORANGE },
            { type: 'segment', p1: { x: 0, y: 0 }, p2: { x: 9.66, y: 0 } },
            { type: 'segment', p1: { x: 9.66, y: 0 }, p2: { x: 9.66, y: 2.59 } },
            { type: 'segment', p1: { x: 9.66, y: 2.59 }, p2: { x: 0, y: 0 } },
            { type: 'rightAngle', v: { x: 9.66, y: 0 }, p1: { x: 9.66, y: 2.59 }, p2: { x: 0, y: 0 }, r: 0.8 },
            { type: 'angle', v: { x: 0, y: 0 }, p1: { x: 9.66, y: 0 }, p2: { x: 9.66, y: 2.59 }, r: 2, label: '15°' },
            { type: 'text', x: 4.5, y: 1.8, text: '10 cm' },
            { type: 'text', x: 10.5, y: 1.3, text: 'x = ?', anchor: 'start' }
        ],
        steps: [
            { id: 1, goal: "Schritt 1: Welche Formel verbindet Winkel, Gegenkathete (x) und Hypotenuse (10)?", type: "formula_selection", options: ["sin(15°) = GK / HYP", "cos(15°) = AK / HYP", "tan(15°) = GK / AK"], correctAnswer: "sin(15°) = GK / HYP", feedback: "Du suchst die Gegenkathete zur Hypotenuse." },
            { id: 2, goal: "Werte einsetzen.", type: "substitution", template: "sin(15°) = [input1] / [input2]", correctInputs: ["x", "10"], feedback: "GK = x, HYP = 10." },
            { id: 3, goal: "Berechne x.", type: "calculation", template: "x = [input] cm", correctAnswer: "2.6", tolerance: 0.2, feedback: "x = 10 · sin(15°)" }
        ]
    },
    {
        id: "msa_2019_flaeche", sourceLabel: "Angepasst", title: "Flächeninhalt aus p und q",
        description: "In einem rechtwinkligen Dreieck teilt die Höhe h die Hypotenuse in die Abschnitte p = 3,6 cm und q = 6,4 cm. Berechne den Flächeninhalt des gesamten Dreiecks.",
        elements: [
            { type: 'polygon', points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 6.4, y: 4.8 }], fill: FILL_ORANGE },
            { type: 'segment', p1: { x: 0, y: 0 }, p2: { x: 10, y: 0 } },
            { type: 'segment', p1: { x: 10, y: 0 }, p2: { x: 6.4, y: 4.8 } },
            { type: 'segment', p1: { x: 6.4, y: 4.8 }, p2: { x: 0, y: 0 } },
            { type: 'segment', p1: { x: 6.4, y: 4.8 }, p2: { x: 6.4, y: 0 }, dashed: true },
            { type: 'rightAngle', v: { x: 6.4, y: 4.8 }, p1: { x: 0, y: 0 }, p2: { x: 10, y: 0 }, r: 0.8 },
            // q=6,4, p=3,6 → rechtes Teildreieck kleiner, Marker ins linke (p2=A).
            { type: 'rightAngle', v: { x: 6.4, y: 0 }, p1: { x: 6.4, y: 4.8 }, p2: { x: 0, y: 0 }, r: 0.8 },
            { type: 'text', x: 3.2, y: -0.4, text: 'q = 6,4', baseline: 'hanging' },
            { type: 'text', x: 8.2, y: -0.4, text: 'p = 3,6', baseline: 'hanging' },
            { type: 'text', x: 5.9, y: 1.5, text: 'h = ?', anchor: 'end' }
        ],
        steps: [
            { id: 1, goal: "Schritt 1: Berechne die gesamte Hypotenuse c (Grundlinie).", type: "calculation", template: "c = [input] cm", correctAnswer: "10", tolerance: 0.1, feedback: "c = p + q" },
            { id: 2, goal: "Schritt 2: Wähle die Formel zur Berechnung der Höhe h.", type: "formula_selection", options: ["h² = p · q", "a² = c · p"], correctAnswer: "h² = p · q", feedback: "Höhensatz!" },
            { id: 3, goal: "Werte in den Höhensatz einsetzen.", type: "substitution", template: "h² = [input1] · [input2]", correctInputs: ["6.4", "3.6"], altInputs: [["3.6", "6.4"], ["6,4", "3,6"], ["3,6", "6,4"]], feedback: "Setze q und p ein." },
            { id: 4, goal: "Berechne die Höhe h.", type: "calculation", template: "h = [input] cm", correctAnswer: "4.8", tolerance: 0.1, feedback: "Wurzel aus (3,6 · 6,4)" },
            { id: 5, goal: "Schritt 3: Wähle die Formel für den Flächeninhalt eines Dreiecks.", type: "formula_selection", options: ["A = c · h", "A = 0,5 · c · h", "A = a² + b²"], correctAnswer: "A = 0,5 · c · h", feedback: "Grundlinie · Höhe / 2." },
            { id: 6, goal: "Werte einsetzen.", type: "substitution", template: "A = 0,5 · [input1] · [input2]", correctInputs: ["10", "4.8"], altInputs: [["4.8", "10"], ["10", "4,8"], ["4,8", "10"]], feedback: "Setze c = 10 und h = 4,8 ein." },
            { id: 7, goal: "Berechne den Flächeninhalt A.", type: "calculation", template: "A = [input] cm²", correctAnswer: "24", tolerance: 0.3, feedback: "A = 0,5 · 10 · 4,8" }
        ]
    },
    {
        id: "msa_typ_leiter", sourceLabel: "Angepasst", title: "Sachaufgabe: Leiter an der Hauswand",
        description: "Eine 6,0 m lange Leiter lehnt an einer senkrechten Hauswand. Sie reicht genau 5,5 m hoch. Berechne den Neigungswinkel α der Leiter zum Boden.",
        elements: [
            { type: 'polygon', points: [{ x: -2, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 6.5 }, { x: -2, y: 6.5 }], fill: 'rgba(148, 163, 184, 0.45)' },
            { type: 'segment', p1: { x: 0, y: 0 }, p2: { x: 2.4, y: 0 }, stroke: '#15803d', width: 5 },
            { type: 'segment', p1: { x: 0, y: 0 }, p2: { x: 0, y: 5.5 } },
            { type: 'segment', p1: { x: 2.4, y: 0 }, p2: { x: 0, y: 5.5 }, stroke: '#d97706', width: 6 },
            { type: 'rightAngle', v: { x: 0, y: 0 }, p1: { x: 2.4, y: 0 }, p2: { x: 0, y: 5.5 }, r: 0.5 },
            { type: 'angle', v: { x: 2.4, y: 0 }, p1: { x: 0, y: 5.5 }, p2: { x: 0, y: 0 }, r: 0.7, label: 'α' },
            // 5,5 m an der Wand-Innenseite (Wand-Polygon links davon)
            { type: 'text', x: -0.2, y: 2.75, text: '5,5 m', anchor: 'end' },
            // Leiter-Beschriftung außerhalb des Polygons, oberhalb der Leiter
            { type: 'text', x: 2.5, y: 4.0, text: 'Leiter: 6,0 m', anchor: 'start' }
        ],
        steps: [
            { id: 1, goal: "Schritt 1: Die Leiter liegt dem rechten Winkel gegenüber. Wie heißt diese Seite?", type: "formula_selection", options: ["Gegenkathete", "Ankathete", "Hypotenuse"], correctAnswer: "Hypotenuse", feedback: "Die längste Seite gegenüber des rechten Winkels heißt Hypotenuse." },
            { id: 2, goal: "Schritt 2: Wähle die Formel, um den Winkel α am Boden zu berechnen.", type: "formula_selection", options: ["sin(α) = GK / HYP", "cos(α) = AK / HYP", "tan(α) = GK / AK"], correctAnswer: "sin(α) = GK / HYP", feedback: "Die Höhe der Wand (5,5 m) ist die Gegenkathete; die Leiter ist die Hypotenuse." },
            { id: 3, goal: "Schritt 3: Setze die Werte ein.", type: "substitution", template: "sin(α) = [input1] / [input2]", correctInputs: ["5.5", "6"], altInputs: [["5,5", "6"], ["5.5", "6.0"], ["5,5", "6,0"]], feedback: "GK oben, HYP unten." },
            { id: 4, goal: "Schritt 4: Berechne den Neigungswinkel α.", type: "calculation", template: "α = [input] °", correctAnswer: "66.4", tolerance: 0.6, feedback: "Nutze sin⁻¹(5,5 / 6)." }
        ]
    },
    {
        id: "msa_typ_isosceles", sourceLabel: "Angepasst", title: "Gleichschenkliges Dreieck",
        description: "Ein gleichschenkliges Dreieck hat die Basis c = 12 cm und zwei gleich lange Schenkel a = b = 10 cm. Die Höhe h teilt das Dreieck. Berechne die Höhe h und den Basiswinkel α.",
        elements: [
            { type: 'polygon', points: [{ x: 0, y: 0 }, { x: 12, y: 0 }, { x: 6, y: 8 }], fill: FILL_ORANGE },
            { type: 'segment', p1: { x: 0, y: 0 }, p2: { x: 12, y: 0 } },
            { type: 'segment', p1: { x: 12, y: 0 }, p2: { x: 6, y: 8 } },
            { type: 'segment', p1: { x: 6, y: 8 }, p2: { x: 0, y: 0 } },
            { type: 'segment', p1: { x: 6, y: 8 }, p2: { x: 6, y: 0 }, dashed: true },
            { type: 'rightAngle', v: { x: 6, y: 0 }, p1: { x: 6, y: 8 }, p2: { x: 12, y: 0 }, r: 0.8 },
            { type: 'angle', v: { x: 0, y: 0 }, p1: { x: 12, y: 0 }, p2: { x: 6, y: 8 }, r: 1.2, label: 'α' },
            { type: 'text', x: 6, y: -0.4, text: 'c = 12', baseline: 'hanging' },
            { type: 'text', x: 2.6, y: 4.5, text: 'b = 10', anchor: 'end' },
            { type: 'text', x: 9.4, y: 4.5, text: 'a = 10', anchor: 'start' },
            { type: 'text', x: 5.5, y: 2.8, text: 'h = ?', anchor: 'end' }
        ],
        steps: [
            { id: 1, goal: "Schritt 1: Die Höhe teilt die Basis c. Wie lang ist die halbe Basis (= Ankathete zu α)?", type: "calculation", template: "Strecke = [input] cm", correctAnswer: "6", tolerance: 0.1, feedback: "12 / 2 = 6" },
            { id: 2, goal: "Schritt 2: Betrachte das linke Teildreieck. Welche Formel hilft dir, die Höhe h zu berechnen?", type: "formula_selection", options: ["a² + b² = c² (Pythagoras)", "h² = p · q (Höhensatz)", "sin(α) = GK / HYP"], correctAnswer: "a² + b² = c² (Pythagoras)", feedback: "Hypotenuse (10) und Ankathete (6) sind bekannt." },
            { id: 3, goal: "Berechne die Höhe h.", type: "calculation", template: "h = [input] cm", correctAnswer: "8", tolerance: 0.1, feedback: "h² = 10² − 6² = 100 − 36 = 64. Wurzel ziehen!" },
            { id: 4, goal: "Schritt 3: Wähle die Formel für den Basiswinkel α.", type: "formula_selection", options: ["cos(α) = AK / HYP", "tan(α) = GK / HYP"], correctAnswer: "cos(α) = AK / HYP", feedback: "Halbe Basis (AK = 6) und Schenkel (HYP = 10)." },
            { id: 5, goal: "Berechne α.", type: "calculation", template: "α = [input] °", correctAnswer: "53.1", tolerance: 0.6, feedback: "cos⁻¹(6 / 10)" }
        ]
    },
    {
        id: "msa_typ_antenne", sourceLabel: "Angepasst", title: "Sachaufgabe: Antennenmast",
        description: "Ein Antennenmast (CD) ist 15 m hoch. Nach links wird er mit einem 18 m langen Seil abgespannt; nach rechts beträgt der Abspannwinkel 50°. Berechne die gesamte Bodenstrecke AB.",
        elements: [
            { type: 'polygon', points: [{ x: -10, y: 0 }, { x: 12.6, y: 0 }, { x: 0, y: 15 }], fill: FILL_ORANGE },
            { type: 'segment', p1: { x: -10, y: 0 }, p2: { x: 12.6, y: 0 } },
            { type: 'segment', p1: { x: 12.6, y: 0 }, p2: { x: 0, y: 15 } },
            { type: 'segment', p1: { x: 0, y: 15 }, p2: { x: -10, y: 0 } },
            // Mast schmaler und ohne überstehende Rundungen
            { type: 'segment', p1: { x: 0, y: 15 }, p2: { x: 0, y: 0 }, stroke: '#1f2937', width: 3.5 },
            // Kleinere rechte Winkel, damit sie nicht ineinanderlaufen
            { type: 'rightAngle', v: { x: 0, y: 0 }, p1: { x: 0, y: 15 }, p2: { x: 12.6, y: 0 }, r: 0.9 },
            { type: 'rightAngle', v: { x: 0, y: 0 }, p1: { x: -10, y: 0 }, p2: { x: 0, y: 15 }, r: 0.9 },
            { type: 'angle', v: { x: 12.6, y: 0 }, p1: { x: 0, y: 15 }, p2: { x: 0, y: 0 }, r: 1.6, label: '50°' },
            // Eckenbeschriftungen A, B, C, D (entsprechend der Aufgabenstellung)
            { type: 'text', x: -10.5, y: -0.7, text: 'A', anchor: 'end', baseline: 'hanging' },
            { type: 'text', x: 13, y: -0.7, text: 'B', anchor: 'start', baseline: 'hanging' },
            { type: 'text', x: 0, y: 15.7, text: 'C', anchor: 'middle' },
            { type: 'text', x: 0.5, y: -0.7, text: 'D', anchor: 'start', baseline: 'hanging' },
            // Längen-Beschriftungen: 15 m rechts vom Mast, 18 m mit etwas Abstand zum linken Seil
            { type: 'text', x: 0.6, y: 7.5, text: '15 m', anchor: 'start' },
            { type: 'text', x: -7, y: 8.6, text: '18 m', anchor: 'end' }
        ],
        steps: [
            { id: 1, goal: "Schritt 1: Betrachte das linke Teildreieck. Berechne die linke Bodenstrecke AD mit Pythagoras.", type: "calculation", template: "AD = [input] m", correctAnswer: "10.0", tolerance: 0.3, feedback: "Wurzel aus (18² − 15²)" },
            { id: 2, goal: "Schritt 2: Wähle die Formel für die rechte Bodenstrecke DB.", type: "formula_selection", options: ["tan(50°) = GK / AK", "sin(50°) = GK / HYP"], correctAnswer: "tan(50°) = GK / AK", feedback: "Gegenkathete = 15, Ankathete = DB (gesucht)." },
            { id: 3, goal: "Werte einsetzen.", type: "substitution", template: "tan(50°) = [input1] / [input2]", correctInputs: ["15", "DB"], altInputs: [["15", "x"]], feedback: "GK (15) oben, DB unten." },
            { id: 4, goal: "Berechne DB (Tipp: DB = 15 / tan(50°)).", type: "calculation", template: "DB = [input] m", correctAnswer: "12.6", tolerance: 0.3, feedback: "15 / tan(50°)" },
            { id: 5, goal: "Schritt 3: Berechne die gesamte Bodenstrecke AB.", type: "calculation", template: "AB = [input] m", correctAnswer: "22.6", tolerance: 0.4, feedback: "AB = AD + DB ≈ 9,95 + 12,59" }
        ]
    },
    {
        id: "msa_typ_seilbahn", sourceLabel: "Angepasst", title: "Sachaufgabe: Seilbahn",
        description: "Eine Seilbahn überwindet einen Höhenunterschied von 150 m. Das Tragseil ist genau 530 m lang. Berechne die horizontale Entfernung und den Steigungswinkel α.",
        elements: [
            { type: 'polygon', points: [{ x: 0, y: 0 }, { x: 508, y: 0 }, { x: 508, y: 150 }], fill: FILL_ORANGE },
            { type: 'segment', p1: { x: 0, y: 0 }, p2: { x: 508, y: 0 } },
            { type: 'segment', p1: { x: 508, y: 0 }, p2: { x: 508, y: 150 } },
            { type: 'segment', p1: { x: 0, y: 0 }, p2: { x: 508, y: 150 }, stroke: '#dc2626', width: 5 },
            { type: 'rightAngle', v: { x: 508, y: 0 }, p1: { x: 508, y: 150 }, p2: { x: 0, y: 0 }, r: 25 },
            { type: 'angle', v: { x: 0, y: 0 }, p1: { x: 508, y: 0 }, p2: { x: 508, y: 150 }, r: 55, label: 'α' },
            // Seil-Label deutlich oberhalb des Seils (im polygonfreien oberen Bereich)
            { type: 'text', x: 200, y: 110, text: 'Seil = 530 m' },
            // 150 m weiter rechts mit clear-anchor=start
            { type: 'text', x: 545, y: 75, text: '150 m', anchor: 'start' },
            // Untere Beschriftung deutlich tiefer
            { type: 'text', x: 250, y: -22, text: 'horizontale Entfernung = ?', baseline: 'hanging' }
        ],
        steps: [
            { id: 1, goal: "Schritt 1: Das Seil ist die Hypotenuse. Wähle die Formel zur Berechnung der horizontalen Entfernung.", type: "formula_selection", options: ["a² + b² = c² (Pythagoras)", "h² = p · q"], correctAnswer: "a² + b² = c² (Pythagoras)", feedback: "Zwei Seiten sind bekannt (530 und 150)." },
            { id: 2, goal: "Berechne die horizontale Entfernung.", type: "calculation", template: "Entf. = [input] m", correctAnswer: "508.3", tolerance: 1, feedback: "Wurzel aus (530² − 150²)" },
            { id: 3, goal: "Schritt 2: Wähle die Formel für den Steigungswinkel α.", type: "formula_selection", options: ["sin(α) = GK / HYP", "cos(α) = AK / HYP"], correctAnswer: "sin(α) = GK / HYP", feedback: "Höhe = Gegenkathete, Seil = Hypotenuse." },
            { id: 4, goal: "Werte einsetzen.", type: "substitution", template: "sin(α) = [input1] / [input2]", correctInputs: ["150", "530"], feedback: "150 / 530" },
            { id: 5, goal: "Berechne den Steigungswinkel α.", type: "calculation", template: "α = [input] °", correctAnswer: "16.4", tolerance: 0.6, feedback: "sin⁻¹(150 / 530)" }
        ]
    },
    {
        id: "msa_typ_schatten", sourceLabel: "Angepasst 2012 I/9", title: "Sachaufgabe: Schattenwurf",
        description: "Ein 25 m hoher Turm wirft auf dem flachen Boden einen Schatten von 15 m Länge. Berechne den Winkel α, unter dem die Sonnenstrahlen auf den Boden treffen.",
        elements: [
            { type: 'polygon', points: [{ x: 0, y: 0 }, { x: 15, y: 0 }, { x: 0, y: 25 }], fill: 'rgba(249, 115, 22, 0.10)' },
            { type: 'segment', p1: { x: 0, y: 0 }, p2: { x: 15, y: 0 }, stroke: '#4b5563', width: 5 },
            { type: 'segment', p1: { x: 0, y: 0 }, p2: { x: 0, y: 25 }, stroke: '#1e3a8a', width: 7 },
            { type: 'segment', p1: { x: 15, y: 0 }, p2: { x: 0, y: 25 }, stroke: '#f59e0b', width: 3, dashed: true },
            { type: 'rightAngle', v: { x: 0, y: 0 }, p1: { x: 15, y: 0 }, p2: { x: 0, y: 25 }, r: 1.3 },
            { type: 'angle', v: { x: 15, y: 0 }, p1: { x: 0, y: 25 }, p2: { x: 0, y: 0 }, r: 2.3, label: 'α' },
            { type: 'text', x: -1.5, y: 12.5, text: '25 m' },
            { type: 'text', x: 7.5, y: -2, text: 'Schatten = 15 m' }
        ],
        steps: [
            { id: 1, goal: "Schritt 1: Der Sonnenstrahl ist die Hypotenuse. Die Turmhöhe ist welche Kathete zum Winkel α?", type: "formula_selection", options: ["Gegenkathete", "Ankathete"], correctAnswer: "Gegenkathete", feedback: "Der Turm liegt dem Winkel gegenüber." },
            { id: 2, goal: "Schritt 2: Welche Winkelfunktion nutzt du (GK = 25, AK = 15)?", type: "formula_selection", options: ["sin(α)", "tan(α)"], correctAnswer: "tan(α)", feedback: "Tangens = Gegenkathete / Ankathete." },
            { id: 3, goal: "Werte einsetzen.", type: "substitution", template: "tan(α) = [input1] / [input2]", correctInputs: ["25", "15"], feedback: "25 (GK) oben, 15 (AK) unten." },
            { id: 4, goal: "Berechne den Sonnenwinkel α.", type: "calculation", template: "α = [input] °", correctAnswer: "59.0", tolerance: 0.6, feedback: "tan⁻¹(25 / 15)" }
        ]
    }
];

// ==========================================
// 6. SCHRITT-KOMPONENTEN (SH-Stil, orange)
// ==========================================

// Hilfsfunktion: prüft, ob der Calculator zu diesem Schritt eingeblendet werden soll.
// Calculator NUR bei type === 'calculation' (also nicht bei Formelauswahl oder reinem Einsetzen).
const needsCalculator = (step) => step && step.type === 'calculation';

const FormulaSelection = ({ step, onCorrect, onTipShown }) => {
    const [error, setError] = useState("");
    const [errors, setErrors] = useState(0);
    const [tipRevealed, setTipRevealed] = useState(false);
    // Auswahl nur markieren (kein Auto-Confirm) — Bestätigung über SubmitBtn-Pfeil.
    const [selected, setSelected] = useState(null);
    const confirmSelection = () => {
        if (!selected) return;
        if (selected === step.correctAnswer) { setError(""); onCorrect(step.id, selected); }
        else { setError(step.feedback); setErrors(e => e + 1); }
    };

    return (
        <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border-2 border-orange-300 mb-4 animate-fade-in">
            <div className="flex items-center mb-4">
                <Target className="w-5 h-5 text-orange-600 mr-2 shrink-0" />
                <h3 className="font-bold text-lg text-slate-800">{step.goal}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {step.options.map((opt, idx) => (
                    <button key={idx} onClick={() => setSelected(opt)} className={`py-3 px-4 border rounded-lg font-medium transition-colors text-lg shadow-sm text-slate-800 ${selected === opt ? 'bg-orange-500 border-orange-600 text-white font-bold' : 'bg-orange-50 hover:bg-orange-100 border-orange-200'}`}>{opt}</button>
                ))}
            </div>
            {/* flex-1-Wrapper hält das Layout stabil: TipBox returnt null bei errors < 2,
                aber der SubmitBtn bleibt immer rechts ausgerichtet (statt nach links zu rutschen). */}
            <div className="flex items-center gap-3 mt-2">
                <div className="flex-1">
                    <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} text={step.feedback || step.tip || 'Überlege, welche Seiten zum Winkel gehören.'} solutionText={step.correctAnswer} onSolutionShown={onTipShown} />
                </div>
                <SubmitBtn onClick={confirmSelection} theme="orange" disabled={!selected} />
            </div>
            {error && <div className="text-rose-600 text-sm font-medium inline-flex items-center mt-2"><XCircle className="w-4 h-4 mr-1" /> Noch nicht richtig — schau dir die Optionen noch einmal an.</div>}
        </div>
    );
};

const SubstitutionInput = ({ step, onCorrect, onTipShown }) => {
    const [inputs, setInputs] = useState(Array(step.correctInputs.length).fill(""));
    const [error, setError] = useState("");
    const [errors, setErrors] = useState(0);
    const [tipRevealed, setTipRevealed] = useState(false);

    const isMatch = (expected, actual) => {
        const a = normalizeString(actual);
        const e = normalizeString(expected);
        if (a === e) return true;
        const aN = parseFloat(a), eN = parseFloat(e);
        if (!isNaN(aN) && !isNaN(eN) && (Math.abs(aN - eN) <= 0.6 || Math.round(aN) === Math.round(eN))) return true;
        return false;
    };

    const checkAnswer = () => {
        let matched = inputs.every((val, idx) => isMatch(step.correctInputs[idx], val));
        if (!matched && step.altInputs) {
            for (const alt of step.altInputs) {
                if (inputs.every((val, idx) => isMatch(alt[idx], val))) { matched = true; break; }
            }
        }
        if (matched) { setError(""); onCorrect(step.id, inputs); }
        else { setError(step.feedback); setErrors(e => e + 1); }
    };

    const renderTemplate = () => {
        let inputIdx = 0;
        return step.template.split(/(\[input\d*\])/).map((part, i) => {
            if (part.startsWith("[input")) {
                const idx = inputIdx++;
                return <input key={i} type="text" value={inputs[idx]} onChange={(e) => { const n = [...inputs]; n[idx] = e.target.value; setInputs(n); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); checkAnswer(); } }} className="w-16 border-b-2 border-orange-500 bg-white mx-2 text-center font-bold text-xl outline-none focus:bg-orange-50 transition shadow-inner text-slate-900" />;
            }
            return <span key={i} className="text-xl text-slate-800" style={{ fontFamily: "'Cambria Math', 'Times New Roman', serif", fontStyle: 'italic' }}>{part}</span>;
        });
    };

    return (
        <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border-2 border-orange-300 mb-4 animate-fade-in">
            <div className="flex items-center mb-4">
                <ArrowRight className="w-5 h-5 text-orange-600 mr-2 shrink-0" />
                <h3 className="font-bold text-lg text-slate-800">{step.goal}</h3>
            </div>
            <div className="mb-5 py-6 bg-white rounded-lg flex flex-wrap items-center justify-center border border-slate-200 shadow-inner">{renderTemplate()}</div>
            {/* Einheitlicher SubmitBtn (Pfeil rechts in Trainer-Farbe) — wie in den anderen Trainern.
                Enter im Eingabefeld löst die gleiche Prüfung aus. */}
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} text={step.feedback || step.tip || 'Schau dir an, welche Zahl Gegenkathete (gegenüber dem Winkel) und welche Ankathete (am Winkel) ist.'} solutionText={(step.correctInputs || []).join('   ;   ')} onSolutionShown={onTipShown} />
                </div>
                <SubmitBtn onClick={checkAnswer} theme="orange" disabled={!inputs.some(v => (v || '').trim().length > 0)} />
            </div>
            {error && <div className="mt-3 text-rose-600 text-sm font-medium inline-flex items-center"><XCircle className="w-4 h-4 mr-1" /> Da stimmt noch was nicht — schau dir die Zuordnung der Seiten genau an.</div>}
        </div>
    );
};

const CalculationInput = ({ step, onCorrect, onTipShown }) => {
    const [val, setVal] = useState("");
    const [error, setError] = useState("");
    const [errors, setErrors] = useState(0);
    const [tipRevealed, setTipRevealed] = useState(false);

    const checkAnswer = () => {
        const userVal = parseFloat(val.replace(',', '.'));
        const correct = parseFloat(step.correctAnswer.replace(',', '.'));
        if (isNaN(userVal)) { setError(step.feedback); setErrors(e => e + 1); return; }
        const tol = step.tolerance || 0.6;
        const isStrict = Math.abs(userVal - correct) <= tol;
        const isRounded = Math.round(userVal) === Math.round(correct);
        const isOneDecimal = userVal.toFixed(1) === correct.toFixed(1);
        if (isStrict || isRounded || isOneDecimal) { setError(""); onCorrect(step.id, val); }
        else { setError(step.feedback); setErrors(e => e + 1); }
    };

    return (
        <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border-2 border-orange-300 mb-4 animate-fade-in">
            <div className="flex items-center mb-4">
                <CheckCircle className="w-5 h-5 text-orange-600 mr-2 shrink-0" />
                <h3 className="font-bold text-lg text-slate-800">{step.goal}</h3>
            </div>
            <div className="mb-5 py-6 bg-white rounded-lg border border-slate-200 shadow-inner flex items-center justify-center text-2xl text-slate-800" style={{ fontFamily: "'Cambria Math', 'Times New Roman', serif", fontStyle: 'italic' }}>
                {step.template.split("[input]")[0]}
                <input type="text" value={val} onChange={(e) => setVal(e.target.value)} placeholder="…" className="w-24 border-2 border-orange-500 rounded-lg mx-3 text-center font-bold outline-none focus:bg-orange-50 p-2 shadow-inner text-slate-900" style={{ fontStyle: 'normal' }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); checkAnswer(); } }} />
                {step.template.split("[input]")[1]}
            </div>
            {/* Einheitlicher SubmitBtn (Pfeil rechts in Trainer-Farbe). Enter im Eingabefeld löst dieselbe Prüfung aus. */}
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <TipBox errors={errors} revealed={tipRevealed} setRevealed={setTipRevealed} text={step.feedback || step.tip || 'Tippe den Ausdruck genau so in den Rechner — Achtung beim Modus DEG.'} solutionText={`${step.correctAnswer}`} onSolutionShown={onTipShown} />
                </div>
                <SubmitBtn onClick={checkAnswer} theme="orange" disabled={!(val || '').trim()} />
            </div>
            {error && <div className="mt-3 text-rose-600 text-sm font-medium inline-flex items-center"><XCircle className="w-4 h-4 mr-1" /> Nicht ganz — nutze den Rechner unten und prüfe noch einmal.</div>}
            <div className="mt-4 pt-4 border-t border-slate-100">
                <CalcButton theme="orange" />
            </div>
        </div>
    );
};

// ==========================================
// 7. HAUPTKOMPONENTE
// ==========================================
const TrigonometrieTrainer = () => {
    const [difficulty, setDifficulty] = useState('leicht');
    const [currentTask, setCurrentTask] = useState(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [streak, setStreak] = useState(() => getStorage('smarth_streak_trigonometrie', 0));
    const [showAnim, setShowAnim] = useState(false);
    const [taskKey, setTaskKey] = useState(0);
    // Adaptive Schwierigkeit + Lernzielkontrolle.
    const adaptive = useAdaptive('trigonometrie', difficulty);

    // Tracking für maximale Abwechslung pro Level + Anti-Repeat-Pool für MSA.
    // historyRef hält pro Level die letzten 2 Typen — beide werden bei der nächsten
    // Generation blockiert, damit der Schüler nicht zwei sehr ähnliche Aufgaben hintereinander sieht.
    const historyRef = React.useRef({ l1: [], l2: [], l3: [] });
    const [examPool, setExamPool] = useState(() => shuffleArray(Array.from({ length: msaTasks.length }, (_, i) => i)));
    const examIdxRef = React.useRef(0);
    // Alternierende Dreieck-Farben: orange → grün → blau → … sehr dezent.
    const colorCycle = ['rgba(249, 115, 22, 0.10)', 'rgba(74, 222, 128, 0.12)', 'rgba(59, 130, 246, 0.10)'];
    const colorIdxRef = React.useRef(0);

    useEffect(() => { setStorage('smarth_streak_trigonometrie', streak); }, [streak]);

    const loadTaskForDiff = (diff) => {
        let newTask;
        // Helper: hängt den neuen Typ vorn an die History und schneidet auf max. 2 Einträge.
        const pushHistory = (key, typeId) => {
            historyRef.current[key] = [typeId, ...historyRef.current[key]].slice(0, 2);
        };
        if (diff === 'leicht') {
            newTask = generateLevel1(historyRef.current.l1);
            pushHistory('l1', newTask.typeId);
        } else if (diff === 'mittel') {
            newTask = generateLevel2(historyRef.current.l2);
            pushHistory('l2', newTask.typeId);
        } else if (diff === 'schwer') {
            newTask = generateLevel3(historyRef.current.l3);
            pushHistory('l3', newTask.typeId);
        } else { // pruefung
            let pool = examPool;
            let idx = examIdxRef.current;
            if (idx >= pool.length) {
                pool = shuffleArray(Array.from({ length: msaTasks.length }, (_, i) => i));
                setExamPool(pool);
                idx = 0;
            }
            newTask = { ...msaTasks[pool[idx]], level: 4 };
            examIdxRef.current = idx + 1;
        }
        // Dreieck-Polygone alternierend einfärben (orange/grün/blau).
        const cIdx = colorIdxRef.current % colorCycle.length;
        colorIdxRef.current++;
        const triCol = colorCycle[cIdx];
        newTask = {
            ...newTask,
            elements: newTask.elements.map(el =>
                (el.type === 'polygon' && typeof el.fill === 'string' && el.fill.startsWith('rgba(249, 115, 22')) ? { ...el, fill: triCol } : el
            )
        };
        setCurrentTask(newTask);
        setCurrentStepIndex(0);
        setIsCompleted(false);
        setUserAnswers({});
        setTaskKey(k => k + 1);
    };

    useEffect(() => { loadTaskForDiff(difficulty); /* eslint-disable-next-line */ }, [difficulty]);

    const skipTask = () => loadTaskForDiff(difficulty);

    // Klick im DifficultyMenu: bei gleichem Schwierigkeitsgrad neue Aufgabe ziehen,
    // sonst regulär die Schwierigkeit wechseln (useEffect lädt dann eine neue Aufgabe).
    const handleDifficultyChange = (newDiff) => {
        if (newDiff === difficulty) loadTaskForDiff(newDiff);
        else setDifficulty(newDiff);
    };

    // Wenn der Schüler einen Tipp oder die Lösung sieht, zählt der Schritt nicht
    // mehr für den Streak — wir setzen ihn proaktiv auf 0 (analog zu den anderen
    // Trainern, die TipBox.onSolutionShown verwenden) und vermerken einen Fehler
    // in der adaptiven Statistik.
    const handleTipShown = () => { setStreak(0); adaptive.recordWrong(); };

    const handleStepCorrect = (stepId, answer) => {
        setUserAnswers(prev => ({ ...prev, [stepId]: answer }));
        if (currentStepIndex < currentTask.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            setIsCompleted(true);
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > 0 && newStreak % 3 === 0) triggerCelebration(setShowAnim);
            adaptive.recordCorrect();
        }
    };
    const handleStepSkip = () => {
        // Skip zählt nicht als richtig (Streak wird zurückgesetzt).
        setStreak(0);
        adaptive.recordWrong();
        const cur = currentTask.steps[currentStepIndex];
        setUserAnswers(prev => ({ ...prev, [cur.id]: "(übersprungen)" }));
        if (currentStepIndex < currentTask.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            setIsCompleted(true);
        }
    };

    // Render der bereits erledigten Schritte als kompakter Lösungsweg.
    // Gilt für alle Schwierigkeitsstufen. Format pro Schritt:
    //   ✓  #1 Wähle die passende Formel: sin(α) = GK / HYP
    // alles in derselben Schriftgröße (text-lg, wie bei den aktiven Step-Überschriften),
    // damit es wie eine fortlaufende Aussage gelesen werden kann.
    const renderCompletedStep = (step, idx) => {
        const answer = userAnswers[step.id];
        let content = null, italic = true, contentColor = 'text-slate-800';
        if (step.type === 'formula_selection') {
            content = answer;
            italic = false;
            contentColor = 'text-orange-800';
        } else if (step.type === 'substitution') {
            let text = step.template;
            if (Array.isArray(answer)) {
                answer.forEach(v => { text = text.replace(/\[input\d*\]/, fmtT(v)); });
            } else {
                step.correctInputs.forEach(v => { text = text.replace(/\[input\d*\]/, fmtT(v)); });
            }
            content = text;
            contentColor = 'text-orange-800';
        } else if (step.type === 'calculation') {
            content = step.template.replace('[input]', fmtT(answer));
            contentColor = 'text-green-800';
        }
        // "Schritt N: ..." Prefix entfernen und Satzzeichen am Ende ("." oder "?") strippen.
        const shortGoal = step.goal.replace(/^Schritt \d+:\s*/, '').replace(/[.?]$/, '');
        return (
            <div key={step.id} className="flex items-start gap-2 py-2 px-3 bg-white border-l-4 border-green-300 mb-1.5 rounded shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-1" />
                <div className="flex-1 min-w-0 text-lg font-bold leading-snug">
                    <span className="text-slate-500 mr-1.5">#{idx + 1}</span>
                    <span className="text-slate-700">{shortGoal}:</span>
                    <span className={`ml-2 ${contentColor}`} style={{ fontFamily: "'Cambria Math', 'Times New Roman', serif", fontStyle: italic ? 'italic' : 'normal' }}>{content}</span>
                </div>
            </div>
        );
    };

    const isExam = difficulty === 'pruefung';

    return (
        <div className="page-transition max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {showAnim && <CelebrationOverlay />}

            <TrainerHeader theme="orange" icon={({className}) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <polygon points="3 20 21 20 21 5" />
                    <polyline points="18 20 18 17 21 17" />
                    <path d="M 9 20 A 6 6 0 0 0 7.4 16.0" />
                </svg>
            )} title="Trigonometrie & Satzgruppe" streakIcon={Target} streak={streak} />

            <DifficultyMenu theme="orange" active={difficulty} onChange={handleDifficultyChange}
                options={[
                    { id: 'leicht', label: 'Leicht' },
                    { id: 'mittel', label: 'Mittel' },
                    { id: 'schwer', label: 'Schwer' },
                    { id: 'pruefung', label: 'Prüfungsaufgaben' }
                ]} />

            {/* Lernzielkontrolle + adaptive Schwierigkeits-Empfehlung */}
            {adaptive.stats.mastered.length > 0 && (
                <div className="mb-4 flex justify-center"><MasteryBadge mastered={adaptive.stats.mastered} theme="orange" /></div>
            )}
            <AdaptiveSuggestion suggestion={adaptive.suggestion} onAccept={(d) => handleDifficultyChange(d)} theme="orange" />

            <main className="space-y-6 relative">
                {currentTask && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="bg-orange-50 px-6 py-3 border-b border-orange-200 flex justify-between items-center gap-2">
                                    <h2 className="font-semibold text-orange-900 flex items-center min-w-0">
                                        <Target className="mr-2 w-5 h-5 shrink-0" />
                                        <span className="truncate">{currentTask.title}</span>
                                    </h2>
                                    {isExam && currentTask.sourceLabel && (
                                        <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-amber-200 text-amber-800 shrink-0">{formatExamLabel(currentTask.sourceLabel)}</span>
                                    )}
                                </div>
                                <div className="p-5">
                                    <p className="text-slate-700 leading-relaxed text-base md:text-lg">{currentTask.description}</p>
                                </div>
                            </div>

                            <SvgViewer key={currentTask.id + '_' + taskKey} elements={currentTask.elements} />
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 mb-4 flex justify-between items-center">
                                <span className="font-bold text-slate-600">Dein Lösungsweg:</span>
                                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold">Schritt {Math.min(currentStepIndex + 1, currentTask.steps.length)} / {currentTask.steps.length}</span>
                            </div>

                            <div className="flex flex-col">
                                {currentTask.steps.slice(0, currentStepIndex).map((s, idx) => renderCompletedStep(s, idx))}
                            </div>

                            {!isCompleted ? (
                                <div key={currentTask.steps[currentStepIndex].id}>
                                    {currentTask.steps[currentStepIndex].type === "formula_selection" && <FormulaSelection step={currentTask.steps[currentStepIndex]} onCorrect={handleStepCorrect} onTipShown={handleTipShown} />}
                                    {currentTask.steps[currentStepIndex].type === "substitution" && <SubstitutionInput step={currentTask.steps[currentStepIndex]} onCorrect={handleStepCorrect} onTipShown={handleTipShown} />}
                                    {currentTask.steps[currentStepIndex].type === "calculation" && <CalculationInput step={currentTask.steps[currentStepIndex]} onCorrect={handleStepCorrect} onTipShown={handleTipShown} />}
                                </div>
                            ) : (
                                <SuccessBox theme="orange" onNext={skipTask} nextBtnText="Nächste Aufgabe" text={isExam ? "Prüfungsreif! 🚀" : "Stark gemacht! 🎉"} subtitle="Du hast die Aufgabe erfolgreich abgeschlossen." />
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(<TrigonometrieTrainer />);
