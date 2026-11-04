// ==========================================
// strahlensaetze.js — Trainer „Strahlensätze & zentrische Streckung“
// Nutzt den Funktionen-Kern (funktionen-kern.js): Themenkacheln, Schritt-Runner, Lernmodus, Prüfungsteile.
// Figuren werden als SVG aus Zentrum, zwei Strahlen und Parallelen gezeichnet (StrFig).
// ==========================================

function StrahlenIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="3" y1="12" x2="21" y2="4" /><line x1="3" y1="12" x2="21" y2="18" />
            <line x1="9" y1="9.3" x2="9" y2="14" /><line x1="16" y1="6.2" x2="16" y2="16.3" />
            <circle cx="3" cy="12" r="1.2" fill="currentColor" />
        </svg>
    );
}

// ==========================================
// 1. FIGUR: Zentrum Z, zwei Strahlen, Parallelen
//   pts: [{ t, a, b }] — t: Abstand von Z auf Strahl 1 (negativ = andere Seite, X-Figur), a/b: Punktnamen auf Strahl 1/2
//   k: Streckfaktor für Strahl 2 (Abstände auf Strahl 2 sind t·k)
//   seg1/seg2: Beschriftungen der Abschnitte auf den Strahlen (von Z aus, je Abschnitt zwischen zwei Punkten)
//   par: Beschriftungen der Parallelstrecken
//   tri: zusätzlich die Strecke Z–Punkt? (false) — fill: Dreiecke füllen (zentrische Streckung)
// ==========================================
const StrFig = ({ pts, k = 1, ang = [-16, 24], seg1 = [], seg2 = [], par = [], zName = 'Z', width = 380, fill = false, color = '#4d7c0f', extra = null, hl = [] }) => {
    const rad = (d) => d * Math.PI / 180;
    const u1 = [Math.cos(rad(ang[0])), Math.sin(rad(ang[0]))], u2 = [Math.cos(rad(ang[1])), Math.sin(rad(ang[1]))];
    const P1 = pts.map(p => [u1[0] * p.t, u1[1] * p.t]), P2 = pts.map(p => [u2[0] * p.t * k, u2[1] * p.t * k]);
    const ts = pts.map(p => p.t);
    const tmax = Math.max(0, ...ts) * 1.15, tmin = Math.min(0, ...ts) * 1.15;
    const ends = [[u1[0] * tmax, u1[1] * tmax], [u2[0] * tmax * k, u2[1] * tmax * k], [u1[0] * tmin, u1[1] * tmin], [u2[0] * tmin * k, u2[1] * tmin * k]];
    const all = [[0, 0], ...P1, ...P2, ...ends];
    const padPx = 34;
    const minX = Math.min(...all.map(p => p[0])), maxX = Math.max(...all.map(p => p[0]));
    const minY = Math.min(...all.map(p => p[1])), maxY = Math.max(...all.map(p => p[1]));
    const sc = (width - 2 * padPx) / (maxX - minX), H = (maxY - minY) * sc + 2 * padPx;
    const X = (p) => padPx + (p[0] - minX) * sc, Y = (p) => padPx + (maxY - p[1]) * sc;
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    // Text an Weltpunkt p, um px Pixel in Richtung des Einheitsvektors n (Weltkoordinaten) verschoben
    const txt = (p, n, px, s, bold = false, col = '#1e293b') => <text key={'t' + s + X(p).toFixed(0) + Y(p).toFixed(0)} x={X(p) + n[0] * px} y={Y(p) - n[1] * px + 5} fontSize={bold ? 16 : 15} fontWeight={bold ? 'bold' : '600'} fontStyle={bold ? 'normal' : 'italic'} fill={col} textAnchor="middle" fontFamily="Georgia, serif">{s}</text>;
    const Zp = [0, 0];
    // Außen-Normalen: n1 zeigt von Strahl 1 weg (unten), n2 von Strahl 2 weg (oben)
    const n1 = [u1[1], -u1[0]], n2 = [-u2[1], u2[0]];
    const els = [];
    if (fill) pts.forEach((p, i) => els.push(<polygon key={'f' + i} points={`${X(Zp)},${Y(Zp)} ${X(P1[i])},${Y(P1[i])} ${X(P2[i])},${Y(P2[i])}`} fill={i === 0 ? 'rgba(77,124,15,0.18)' : 'rgba(77,124,15,0.07)'} />));
    // Hervorhebungen: { ray: 1|2, i } = Abstand von Z bis Punkt i, { par: i } = Parallele i
    hl.forEach((h, j) => {
        const a = h.par !== undefined ? P1[h.par] : Zp, b = h.par !== undefined ? P2[h.par] : (h.ray === 2 ? P2[h.i] : P1[h.i]);
        els.push(<line key={'hl' + j} x1={X(a)} y1={Y(a)} x2={X(b)} y2={Y(b)} stroke="#facc15" strokeWidth="9" strokeOpacity="0.75" strokeLinecap="round" />);
    });
    els.push(<line key="r1" x1={X(ends[2])} y1={Y(ends[2])} x2={X(ends[0])} y2={Y(ends[0])} stroke="#1e293b" strokeWidth="1.8" />);
    els.push(<line key="r2" x1={X(ends[3])} y1={Y(ends[3])} x2={X(ends[1])} y2={Y(ends[1])} stroke="#1e293b" strokeWidth="1.8" />);
    // Parallelen mit Beschriftung (rechts neben der Strecke, auf der von Z abgewandten Seite)
    pts.forEach((p, i) => {
        els.push(<line key={'p' + i} x1={X(P1[i])} y1={Y(P1[i])} x2={X(P2[i])} y2={Y(P2[i])} stroke={color} strokeWidth="2.4" />);
        if (par[i]) { const m = mid(P1[i], P2[i]); const d = [P2[i][0] - P1[i][0], P2[i][1] - P1[i][1]]; const L = Math.hypot(d[0], d[1]) || 1; const nn = [d[1] / L * Math.sign(p.t || 1), -d[0] / L * Math.sign(p.t || 1)]; els.push(txt(m, nn, 16, par[i], false, color)); }
    });
    // Abschnitte auf den Strahlen (außen beschriftet), je Seite von Z nach außen sortiert
    const order = pts.map((p, i) => i).sort((i, j) => Math.abs(pts[i].t) - Math.abs(pts[j].t));
    const pos = order.filter(i => pts[i].t > 0), neg = order.filter(i => pts[i].t < 0);
    const labelSegs = (idx, off) => {
        let p1 = Zp, p2 = Zp;
        idx.forEach((i, j) => {
            const l1 = seg1[off + j], l2 = seg2[off + j];
            if (l1) els.push(txt(mid(p1, P1[i]), n1, 14, l1));
            if (l2) els.push(txt(mid(p2, P2[i]), n2, 14, l2));
            p1 = P1[i]; p2 = P2[i];
        });
    };
    labelSegs(pos, 0); labelSegs(neg, pos.length);
    // Punkte und Namen
    els.push(<circle key="z" cx={X(Zp)} cy={Y(Zp)} r="3.5" fill="#1e293b" />);
    const zn = neg.length ? [n1[0], n1[1]] : [-(u1[0] + u2[0]), -(u1[1] + u2[1])], zl = Math.hypot(zn[0], zn[1]) || 1;
    els.push(txt(Zp, [zn[0] / zl, zn[1] / zl], 16, zName, true));
    pts.forEach((p, i) => {
        const sg = Math.sign(p.t || 1);
        els.push(<circle key={'c1' + i} cx={X(P1[i])} cy={Y(P1[i])} r="3.5" fill="#1e293b" />);
        els.push(<circle key={'c2' + i} cx={X(P2[i])} cy={Y(P2[i])} r="3.5" fill="#1e293b" />);
        if (p.a) els.push(txt(P1[i], [n1[0] * sg, n1[1] * sg], 17, p.a, true));
        if (p.b) els.push(txt(P2[i], [n2[0] * sg, n2[1] * sg], 17, p.b, true));
    });
    return (
        <svg viewBox={`0 0 ${width} ${H}`} className="max-w-full" style={{ width }} aria-label="Strahlensatzfigur">
            <rect x="0" y="0" width={width} height={H} fill="#ffffff" rx="8" />
            {els}{extra}
        </svg>
    );
};
// Figur mit Punktnamen A, B(, C) auf Strahl 1 und D, E(, F) auf Strahl 2
const figABC = (n, k = 1.3, ts) => <StrFig k={k} pts={(ts || [3, 5.2, 7.2]).slice(0, n).map((t, i) => ({ t, a: 'ABC'[i], b: 'DEF'[i] }))} />;

// ==========================================
// 2. SCHRITTE
// ==========================================
const stS = (v) => lfS(lfR(v, 2));
const stProp = (goal, right, wrongs, hint) => S.select(goal, [right, ...wrongs].map(o => <span className="font-math">{o}</span>), 0, hint, right);
const stCalc = (goal, label, v, hint, solution, unit = '') => S.calc(goal, <span className="font-math">{label}</span>, lfR(v, 2), hint, solution, unit, 0.011);
// Verhältnisgleichung „x : a = b : c“ nach x auflösen
const stSolve = (x, a, b, c, label, unit = '', cm = ' cm') => stCalc(`Löse nach ${label} auf: ${label} = ${stS(b)} · ${stS(a)} : ${stS(c)}.`, label, x, `Über Kreuz: ${label} = ${stS(b)} · ${stS(a)} : ${stS(c)}.`, `${label} = ${stS(b * a / c)}${cm}`, unit);

// ==========================================
// 3. GENERATOREN
// ==========================================
const GEN = {};
const ST_K = [2, 3, 1.5, 2.5, 0.5, 4];

// --- Zentrische Streckung ---
GEN.streckung = (level, forbidden) => {
    if (level === 'leicht') {
        const type = lfChooseType([1, 2], forbidden);
        const k = lfPick(type === 1 ? [2, 3, 1.5, 2.5] : [0.5, 1/3, 0.25, 0.4]);
        const a = lfPick(type === 1 ? [3, 4, 5, 6, 8] : [6, 8, 9, 12, 15]), b = lfPick(type === 1 ? [2, 3.5, 4.5, 7] : [4, 6, 10, 12]);
        const fig = <StrFig fill k={1.25} pts={[{ t: 3, a: 'A', b: 'B' }, { t: 3 * (type === 1 ? Math.min(k, 2.2) : 1.7), a: "A'", b: "B'" }]} ang={[-12, 30]} />;
        const text = type === 1
            ? <>Das Dreieck ZAB wird mit dem Zentrum Z und dem Streckungsfaktor k = {lfS(k)} auf das Dreieck ZA'B' abgebildet. Es gilt ZA = {lfS(a)} cm und AB = {lfS(b)} cm. Berechne ZA' und A'B'.</>
            : <>Das Dreieck ZA'B' entsteht aus ZAB durch zentrische Streckung mit k = {lfS(k, true)}. Es gilt ZA = {lfS(a)} cm und AB = {lfS(b)} cm. Berechne ZA' und A'B'.</>;
        return { typeId: type, title: type === 1 ? 'Vergrößern mit k' : 'Verkleinern mit k < 1', desc: text, figure: fig, steps: [
            S.select('Wie rechnest du eine Bildlänge aus?', ['Originallänge · k', 'Originallänge + k', 'Originallänge : k'], 0, 'Bei der zentrischen Streckung werden alle Längen mit k multipliziert.', "Bildlänge = Original · k"),
            stCalc(`Berechne ZA' = ZA · k.`, "ZA'", a * k, `${lfS(a)} · ${lfS(k, true)}`, `ZA' = ${stS(a * k)} cm`),
            stCalc(`Berechne A'B' = AB · k.`, "A'B'", b * k, `${lfS(b)} · ${lfS(k, true)}`, `A'B' = ${stS(b * k)} cm`)
        ] };
    }
    if (level === 'mittel') {
        const type = lfChooseType([3, 4], forbidden);
        if (type === 3) {
            const k = lfPick([2, 1.5, 2.5, 0.5, 0.75, 3]), a = lfPick([4, 6, 8, 10, 12]), c = lfPick([5, 7, 9]);
            return { typeId: 3, title: 'Streckungsfaktor bestimmen', desc: <>Das Dreieck ZAB wird auf ZA'B' abgebildet. Es gilt ZA = {lfS(a)} cm, ZA' = {lfS(a * k)} cm und AB = {lfS(c)} cm. Bestimme den Streckungsfaktor k und die Länge A'B'.</>,
                figure: <StrFig fill k={1.2} pts={[{ t: 3, a: 'A', b: 'B' }, { t: 3 * (k > 1 ? 1.9 : 1.6), a: "A'", b: "B'" }]} ang={[-12, 30]} />, steps: [
                S.select('Wie berechnest du k?', ['k = Bildlänge : Originallänge', 'k = Originallänge : Bildlänge', 'k = Bildlänge − Originallänge'], 0, 'k sagt, wie oft die Originallänge ins Bild passt.', "k = ZA' : ZA"),
                stCalc(`Berechne k = ZA' : ZA.`, 'k', k, `${lfS(a * k)} : ${lfS(a)}`, `k = ${lfS(k)}`),
                stCalc(`Berechne A'B' = AB · k.`, "A'B'", c * k, `${lfS(c)} · ${lfS(k)}`, `A'B' = ${stS(c * k)} cm`)
            ] };
        }
        const k = lfPick([2, 3, 1.5, 0.5, 2.5]), A = lfPick([6, 8, 10, 12, 20, 24]);
        return { typeId: 4, title: 'Flächeninhalt: mal k²', desc: <>Eine Figur mit dem Flächeninhalt A = {lfS(A)} cm² wird mit dem Streckungsfaktor k = {lfS(k)} zentrisch gestreckt. Berechne den Flächeninhalt A' der Bildfigur.</>,
            figure: <StrFig fill k={1.1} pts={[{ t: 3, a: 'A', b: 'B' }, { t: 3 * (k > 1 ? 2 : 1.6), a: "A'", b: "B'" }]} ang={[-14, 34]} />, steps: [
            S.select('Wie ändert sich der Flächeninhalt?', ['Er wird mit k² multipliziert', 'Er wird mit k multipliziert', 'Er wird mit 2k multipliziert'], 0, 'Länge und Breite werden beide mit k gestreckt: k · k = k².', "A' = A · k²"),
            stCalc(`Berechne k².`, 'k²', k * k, `${lfS(k)} · ${lfS(k)}`, `k² = ${lfS(k * k)}`),
            stCalc(`Berechne A' = A · k².`, "A'", A * k * k, `${lfS(A)} · ${lfS(k * k)}`, `A' = ${stS(A * k * k)} cm²`, '')
        ] };
    }
    const type = lfChooseType([5, 6, 7], forbidden);
    if (type === 5) {
        const k = lfPick([2, 3, 0.5, 1.5]), V = lfPick([8, 10, 16, 24, 40]);
        return { typeId: 5, title: 'Volumen: mal k³', desc: <>Ein Körper mit dem Volumen V = {lfS(V)} cm³ wird mit dem Streckungsfaktor k = {lfS(k)} zentrisch gestreckt. Berechne das Volumen V' des Bildkörpers.</>, steps: [
            S.select('Wie ändert sich das Volumen?', ['Es wird mit k³ multipliziert', 'Es wird mit k² multipliziert', 'Es wird mit k multipliziert'], 0, 'Länge, Breite und Höhe werden mit k gestreckt: k · k · k = k³.', "V' = V · k³"),
            stCalc(`Berechne V' = V · k³.`, "V'", V * k ** 3, `${lfS(k)}³ = ${lfS(k ** 3)}, dann mal ${lfS(V)}.`, `V' = ${stS(V * k ** 3)} cm³`)
        ] };
    }
    if (type === 6) {
        const k = lfPick([1.2, 1.5, 2, 0.8, 0.5, 3]), A = lfPick([5, 8, 10, 12, 20]);
        return { typeId: 6, title: 'k aus den Flächeninhalten', desc: <>Eine Figur mit dem Flächeninhalt A = {lfS(A)} cm² wird zentrisch gestreckt. Die Bildfigur hat den Flächeninhalt A' = {stS(A * k * k)} cm². Berechne den Streckungsfaktor k.</>, steps: [
            stCalc(`Berechne zuerst k² = A' : A.`, 'k²', k * k, `${stS(A * k * k)} : ${lfS(A)}`, `k² = ${stS(k * k)}`),
            stCalc(`Ziehe die Wurzel: k = √(k²).`, 'k', k, `√${stS(k * k)}`, `k = ${lfS(k)}`)
        ] };
    }
    const p = lfPick([70, 80, 120, 125, 150, 50]), a = lfPick([6, 8, 9, 12, 15]);
    return { typeId: 7, title: 'Kopierer: Prozent und k', desc: <>Ein Kopierer vergrößert oder verkleinert: Bei der Einstellung {p} % werden alle Längen mit dem Faktor k gestreckt. Ein Quadrat mit der Seite a = {lfS(a)} cm wird mit {p} % kopiert. Bestimme k und die Seite a' des Bildquadrats.</>, steps: [
        stCalc(`Welcher Streckungsfaktor k gehört zu ${p} %?`, 'k', p / 100, `${p} % = ${p} : 100`, `k = ${lfS(p / 100)}`),
        stCalc(`Berechne a' = a · k.`, "a'", a * p / 100, `${lfS(a)} · ${lfS(p / 100)}`, `a' = ${stS(a * p / 100)} cm`)
    ] };
};

// --- Figur und Verhältnisse (Auswahl) ---
GEN.figur = (level, forbidden) => {
    if (level === 'leicht') {
        const type = lfChooseType([1, 2], forbidden), k = lfPick([1.2, 1.4, 1.6]);
        const fig = figABC(2, k);
        if (type === 1) return { typeId: 1, title: '1. Strahlensatz: Abschnitte auf den Strahlen', desc: <>In der Figur gilt AD ∥ BE. Welche Gleichung ist richtig?</>, figure: fig, steps: [
            stProp('Welche Verhältnisgleichung stimmt?', 'ZA : ZB = ZD : ZE', ['ZA : ZB = ZE : ZD', 'ZA : ZD = ZB : AD'], 'Verhältnis auf Strahl 1 (kurz : lang) = Verhältnis auf Strahl 2 (kurz : lang). A gehört zu D, B gehört zu E.')
        ] };
        return { typeId: 2, title: '2. Strahlensatz: die Parallelen', desc: <>In der Figur gilt AD ∥ BE. Welche Gleichung ist richtig?</>, figure: fig, steps: [
            stProp('Welche Verhältnisgleichung stimmt?', 'AD : BE = ZA : ZB', ['AD : BE = ZB : ZA', 'AD : BE = AB : ZB'], 'Parallelstrecke zu Parallelstrecke wie Abstand von Z zu Abstand von Z (immer von Z aus messen!).')
        ] };
    }
    if (level === 'mittel') {
        const type = lfChooseType([3, 4], forbidden);
        if (type === 3) {
            const fig = <StrFig k={1.3} pts={[{ t: -2.6, a: 'D', b: 'E' }, { t: 3.4, a: 'A', b: 'B' }]} />;
            return { typeId: 3, title: 'X-Figur', desc: <>Die Parallelen AB und DE liegen auf verschiedenen Seiten von Z (AB ∥ DE). Welche Gleichung ist richtig?</>, figure: fig, steps: [
                stProp('Welche Verhältnisgleichung stimmt?', 'ZA : ZD = ZB : ZE', ['ZA : ZD = ZE : ZB', 'ZA : ZB = DE : AB'], 'Auch über Kreuz gilt: A gehört zu D (gleicher Strahl), B gehört zu E.'),
                stProp('Und für die Parallelen?', 'AB : DE = ZA : ZD', ['AB : DE = ZD : ZA', 'AB : DE = ZB : ZD'], 'Parallelstrecken verhalten sich wie die Abstände von Z auf demselben Strahl.')
            ] };
        }
        const fig = <StrFig k={1.25} pts={[{ t: 2.4, a: 'A', b: 'D' }, { t: 4.4, a: 'B', b: 'E' }]} seg1={['a', 'b']} seg2={['c', 'd']} par={['e', 'f']} />;
        return { typeId: 4, title: 'Mit Abschnitten: a + b', desc: <>Die Strecken sind mit a bis f bezeichnet, es gilt e ∥ f. Welche Gleichung ist richtig?</>, figure: fig, steps: [
            stProp('Welche Gleichung stimmt?', 'a : (a + b) = c : (c + d)', ['a : b = c : (c + d)', 'a : (a + b) = d : c'], 'Vom Zentrum aus messen: a ist der kurze Abschnitt, a + b der lange. Auf dem anderen Strahl genauso: c und c + d.'),
            stProp('Welche Gleichung für die Parallelen stimmt?', 'e : f = a : (a + b)', ['e : f = a : b', 'e : f = b : a'], 'e gehört zum Abstand a, f zum Abstand a + b (von Z aus).')
        ] };
    }
    const type = lfChooseType([5, 6], forbidden);
    if (type === 5) {
        const fig = figABC(3, 1.3);
        return { typeId: 5, title: 'Drei Parallelen', desc: <>Es gilt AD ∥ BE ∥ CF. Zwei der Aussagen sind richtig, eine ist falsch.</>, figure: fig, steps: [
            S.select('Welche Aussage ist falsch?', [<span className="font-math">ZB : ZE = ZC : CF</span>, <span className="font-math">ZA : ZC = ZD : ZF</span>, <span className="font-math">BE : CF = ZB : ZC</span>], 0, 'Links steht ein Verhältnis auf Strahl 1, rechts eines auf Strahl 2. CF ist aber eine Parallelstrecke, kein Abstand von Z.', 'Falsch: ZB : ZE = ZC : CF'),
            stProp('Wie lautet die richtige Gleichung für AB und DE?', 'AB : DE = ZA : ZD', ['AB : DE = ZD : ZA', 'AB : DE = AD : BE'], 'Teilabschnitte zwischen zwei Parallelen verhalten sich wie die Abstände von Z (1. Strahlensatz).')
        ] };
    }
    const fig = <StrFig k={1.25} pts={[{ t: 2.2, a: 'A', b: 'D' }, { t: 3.8, a: 'B', b: 'E' }, { t: 5.6, a: 'C', b: 'F' }]} seg1={['a', 'b', 'c']} seg2={['d', 'e', 'f']} par={['g', 'h', 'i']} />;
    return { typeId: 6, title: 'Platzhalter ergänzen', desc: <>Es gilt g ∥ h ∥ i. Ergänze die Platzhalter □ so, dass die Gleichungen richtig sind.</>, figure: fig, steps: [
        stProp('(a + b + c) : □ = a : g', '□ = i', ['□ = h', '□ = c'], 'Links: ganzer Strahl bis i. Dann rechts die zugehörige Parallele.'),
        stProp('c : f = □ : e', '□ = b', ['□ = a', '□ = h'], 'c gehört zu f (dritter Abschnitt auf beiden Strahlen), b gehört zu e.'),
        stProp('□ : h = d : g', '□ = d + e', ['□ = e', '□ = a + b'], 'd : g ist Abstand bis zur ersten Parallele. Zu h gehört der Abstand bis zur zweiten Parallele: d + e.')
    ] };
};

// --- Strecken berechnen ---
GEN.rechnen = (level, forbidden) => {
    if (level === 'leicht') {
        const type = lfChooseType([1, 2], forbidden);
        const za = lfPick([2, 3, 4, 5, 6]), ab = lfPick([2, 3, 4, 6]), zd = lfPick([3, 4.5, 6, 7.5]);
        const zb = za + ab, ze = zd * zb / za;
        if (!lfIsShort(ze)) return GEN.rechnen(level, forbidden);
        const fig = <StrFig k={zd / za} pts={[{ t: za, a: 'A', b: 'D' }, { t: zb, a: 'B', b: 'E' }]} seg1={[`${lfS(za)} cm`, type === 1 ? `${lfS(ab)} cm` : '']} seg2={[`${lfS(zd)} cm`, '?']} />;
        if (type === 1) return { typeId: 1, title: '1. Strahlensatz anwenden', desc: <>Es gilt AD ∥ BE, ZA = {lfS(za)} cm, AB = {lfS(ab)} cm und ZD = {lfS(zd)} cm. Berechne die Länge von DE.</>, figure: fig, steps: [
            stCalc('Berechne zuerst ZB = ZA + AB.', 'ZB', zb, `${lfS(za)} + ${lfS(ab)}`, `ZB = ${lfS(zb)} cm`),
            stProp('Welche Gleichung passt für ZE?', 'ZE : ZD = ZB : ZA', ['ZE : ZD = ZA : ZB', 'ZE : ZB = ZA : ZD'], 'Lang zu kurz auf Strahl 2 wie lang zu kurz auf Strahl 1.'),
            stSolve(ze, zd, zb, za, 'ZE'),
            stCalc('Berechne DE = ZE − ZD.', 'DE', ze - zd, `${stS(ze)} − ${lfS(zd)}`, `DE = ${stS(ze - zd)} cm`)
        ] };
        const zb2 = zb;
        return { typeId: 2, title: '1. Strahlensatz: ZB gesucht', desc: <>Es gilt AD ∥ BE, ZA = {lfS(za)} cm, ZD = {lfS(zd)} cm und ZE = {stS(ze)} cm. Berechne die Länge von ZB.</>,
            figure: <StrFig k={zd / za} pts={[{ t: za, a: 'A', b: 'D' }, { t: zb, a: 'B', b: 'E' }]} seg1={[`${lfS(za)} cm`, '?']} seg2={[`${lfS(zd)} cm`, `${stS(ze - zd)} cm`]} />, steps: [
            stProp('Welche Gleichung passt für ZB?', 'ZB : ZA = ZE : ZD', ['ZB : ZA = ZD : ZE', 'ZB : ZE = ZD : ZA'], 'ZB und ZA liegen auf Strahl 1, ZE und ZD auf Strahl 2, jeweils lang zu kurz.'),
            stSolve(zb2, za, ze, zd, 'ZB')
        ] };
    }
    if (level === 'mittel') {
        const type = lfChooseType([3, 4], forbidden);
        const za = lfPick([3, 4, 5, 6]), zb = za + lfPick([2, 3, 4, 6]), ad = lfPick([2, 3, 4.5, 6]);
        const be = ad * zb / za;
        if (!lfIsShort(be)) return GEN.rechnen(level, forbidden);
        if (type === 3) return { typeId: 3, title: '2. Strahlensatz: Parallele berechnen', desc: <>Es gilt AD ∥ BE, ZA = {lfS(za)} cm, ZB = {lfS(zb)} cm und AD = {lfS(ad)} cm. Berechne die Länge von BE.</>,
            figure: <StrFig k={1.3} pts={[{ t: za, a: 'A', b: 'D' }, { t: zb, a: 'B', b: 'E' }]} seg1={[`${lfS(za)} cm`, `${lfS(zb - za)} cm`]} par={[`${lfS(ad)} cm`, '?']} />, steps: [
            stProp('Welche Gleichung passt für BE?', 'BE : AD = ZB : ZA', ['BE : AD = ZA : ZB', 'BE : AD = AB : ZA'], 'Parallelstrecken wie die Abstände von Z: BE gehört zu ZB, AD zu ZA.'),
            stSolve(be, ad, zb, za, 'BE')
        ] };
        return { typeId: 4, title: '2. Strahlensatz: Abstand von Z gesucht', desc: <>Es gilt AD ∥ BE, ZA = {lfS(za)} cm, AD = {lfS(ad)} cm und BE = {stS(be)} cm. Berechne ZB und AB.</>,
            figure: <StrFig k={1.3} pts={[{ t: za, a: 'A', b: 'D' }, { t: zb, a: 'B', b: 'E' }]} seg1={[`${lfS(za)} cm`, '?']} par={[`${lfS(ad)} cm`, `${stS(be)} cm`]} />, steps: [
            stProp('Welche Gleichung passt für ZB?', 'ZB : ZA = BE : AD', ['ZB : ZA = AD : BE', 'ZB : AD = ZA : BE'], 'Abstände von Z wie die Parallelstrecken.'),
            stSolve(zb, za, be, ad, 'ZB'),
            stCalc('Berechne AB = ZB − ZA.', 'AB', zb - za, `${lfS(zb)} − ${lfS(za)}`, `AB = ${lfS(zb - za)} cm`)
        ] };
    }
    const type = lfChooseType([5, 6], forbidden);
    if (type === 5) {
        // Drei Parallelen: zwei Unbekannte
        const za = lfPick([3, 4, 6]), ab = lfPick([2, 3, 6]), bc = lfPick([2, 4, 6]), k = lfPick([1.5, 2, 2.5, 0.5]);
        const zd = za * k, de = ab * k, ef = bc * k, ad = lfPick([2, 3, 4]), cf = ad * (za + ab + bc) / za;
        if (!lfIsShort(cf)) return GEN.rechnen(level, forbidden);
        return { typeId: 5, title: 'Drei Parallelen: zwei Strecken berechnen', desc: <>Es gilt AD ∥ BE ∥ CF, ZA = {lfS(za)} cm, AB = {lfS(ab)} cm, BC = {lfS(bc)} cm, ZD = {lfS(zd)} cm und AD = {lfS(ad)} cm. Berechne DE und CF.</>,
            figure: <StrFig k={Math.min(k, 1.6)} pts={[{ t: za, a: 'A', b: 'D' }, { t: za + ab, a: 'B', b: 'E' }, { t: za + ab + bc, a: 'C', b: 'F' }]} seg1={[`${lfS(za)}`, `${lfS(ab)}`, `${lfS(bc)}`]} seg2={[`${lfS(zd)}`, '?', '']} par={[`${lfS(ad)}`, '', '?']} />, steps: [
            stProp('Welche Gleichung passt für DE?', 'DE : AB = ZD : ZA', ['DE : AB = ZA : ZD', 'DE : ZD = AB : BC'], 'Teilabschnitte zwischen denselben Parallelen verhalten sich wie die Abstände von Z.'),
            stSolve(de, ab, zd, za, 'DE'),
            stCalc('Berechne ZC = ZA + AB + BC.', 'ZC', za + ab + bc, `${lfS(za)} + ${lfS(ab)} + ${lfS(bc)}`, `ZC = ${lfS(za + ab + bc)} cm`),
            stSolve(cf, ad, za + ab + bc, za, 'CF')
        ] };
    }
    // Sachaufgabe: Schatten / Baum (Strahlensatz)
    const s1 = lfPick([1.5, 2, 2.5]), h1 = lfPick([1.6, 1.8, 2]), s2 = lfPick([9, 12, 15, 18]);
    const h2 = h1 * s2 / s1;
    if (!lfIsShort(h2)) return GEN.rechnen(level, forbidden);
    return { typeId: 6, title: 'Sachaufgabe: Schatten', desc: <>Ein {lfS(h1)} m hoher Pfosten wirft einen {lfS(s1)} m langen Schatten. Zur gleichen Zeit ist der Schatten eines Baumes {lfS(s2)} m lang. Die Sonnenstrahlen sind parallel, Pfosten und Baum stehen senkrecht. Berechne die Höhe des Baumes.</>,
        figure: <StrFig k={1.0} ang={[0, 30]} pts={[{ t: 3.2 }, { t: 9 }]} seg1={[`${lfS(s1)} m`, `${lfS(s2 - s1)} m`]} par={[`${lfS(h1)} m`, '?']} zName="S" />, steps: [
        S.select('Welche Figur steckt in der Aufgabe?', ['Strahlensatzfigur: Sonnenstrahl als Strahl, Pfosten und Baum als Parallelen', 'Rechtwinkliges Dreieck mit Pythagoras', 'Zentrische Streckung mit k = 2'], 0, 'Die Schatten liegen auf einem Strahl vom Schattenende aus, Pfosten und Baum stehen parallel senkrecht.', 'Strahlensatzfigur'),
        stProp('Welche Gleichung passt?', `Baum : ${lfS(h1)} = ${lfS(s2)} : ${lfS(s1)}`, [`Baum : ${lfS(h1)} = ${lfS(s1)} : ${lfS(s2)}`, `Baum : ${lfS(s2)} = ${lfS(s1)} : ${lfS(h1)}`], 'Höhe zu Höhe wie Schatten zu Schatten.'),
        stCalc('Berechne die Höhe des Baumes.', 'Baum', h2, `${lfS(h1)} · ${lfS(s2)} : ${lfS(s1)}`, `Baum = ${stS(h2)} m`, '')
    ] };
};

// ==========================================
// 4. PRÜFUNGSAUFGABEN (Texte wie in der Prüfung, Figuren nachgezeichnet; „Zahlen ergänzt“ = Längen aus der Skizze nicht bekannt)
// ==========================================
const ST_EXAMS = [
    { id: '2025-II', label: 'MSA 2025 II', nr: '2', parts: [
        { l: 'a', topic: 'streckung', text: <>Bei einer zentrischen Streckung wird das Dreieck ZAB mit k = 1,5 auf das Dreieck ZA'B' abgebildet. Es gilt ZA = 6 cm, AB = 7 cm und ZB = 8 cm (Zahlen ergänzt, die Skizze der Prüfung liegt nicht vor). Berechne den Umfang des Dreiecks ZA'B'.</>,
          figure: <StrFig fill k={1.25} pts={[{ t: 3, a: 'A', b: 'B' }, { t: 4.5, a: "A'", b: "B'" }]} ang={[-12, 30]} />,
          steps: () => [stCalc('Berechne den Umfang des Dreiecks ZAB.', 'u', 21, '6 + 7 + 8', 'u = 21 cm'), S.select('Wie bekommst du den Umfang des Bilddreiecks?', ['u · k', 'u · k²', 'u + k'], 0, 'Alle Seiten werden mit k multipliziert, also auch der Umfang.', "u' = u · 1,5"), stCalc("Berechne u' = u · k.", "u'", 31.5, '21 · 1,5', "u' = 31,5 cm")] },
        { l: 'b', topic: 'streckung', text: <>Das Dreieck ZA'B' hat einen Flächeninhalt von 155,88 cm². Bestimme rechnerisch den Flächeninhalt des Dreiecks ZAB (k = 1,5).</>,
          steps: () => [S.select('Wie hängen die Flächeninhalte zusammen?', ["A' = A · k²", "A' = A · k", "A' = A · k³"], 0, 'Flächen ändern sich mit k².', "A' = A · 2,25"), stCalc("Berechne A = A' : k².", 'A', 69.28, '155,88 : 2,25', 'A = 69,28 cm²')] }
    ]},
    { id: '2024-II', label: 'MSA 2024 II', nr: '8', parts: [
        { l: 'a', topic: 'streckung', text: <>Gegeben sind A(0 | 2), B(4 | 0) und das Zentrum Z(0 | 0). Die Strecke AB wird mit k₁ = 2,5 auf A'B' abgebildet. Gib die Koordinaten von A' und B' an.</>,
          graph: { range: [-1, 11, -1, 6], points: [{ x: 0, y: 2, n: 'A' }, { x: 4, y: 0, n: 'B' }], segments: [{ x1: 0, y1: 2, x2: 4, y2: 0 }] },
          steps: () => [{ type: 'fill', goal: "Multipliziere die Koordinaten mit k₁ = 2,5 (Zentrum ist der Ursprung).", inputs: [{ id: 'ax', correct: 0 }, { id: 'ay', correct: 5 }, { id: 'bx', correct: 10 }, { id: 'by', correct: 0 }], render: (h) => <LfZeile>A'( {h.input('ax')} | {h.input('ay')} ), B'( {h.input('bx')} | {h.input('by')} )</LfZeile>, hint: 'Z ist der Ursprung: Jede Koordinate wird mit 2,5 multipliziert.', solution: "A'(0 | 5), B'(10 | 0)" }] },
        { l: 'b', topic: 'streckung', text: <>Bei einer zweiten Streckung wird AB mit k₂ = 0,5 auf A''B'' abgebildet. Gib den Streckungsfaktor k₃ für die Streckung von A'B' auf A''B'' an.</>,
          steps: () => [stCalc('k₃ = k₂ : k₁', 'k₃', 0.2, '0,5 : 2,5', 'k₃ = 0,2')] }
    ]},
    { id: '2023-II', label: 'MSA 2023 II', nr: '9', parts: [
        { l: 'a', topic: 'figur', text: <>Das Dreieck ZAB wird von Z aus auf ZA'B' gestreckt, es gilt AB ∥ A'B'. Ergänze: (I) ZA : □ = □ : A'B'</>,
          figure: <StrFig fill k={1.2} pts={[{ t: 3, a: 'A', b: 'B' }, { t: 5, a: "A'", b: "B'" }]} ang={[-12, 30]} />,
          steps: () => [stProp('Welche Ergänzung ist richtig?', "ZA : ZA' = AB : A'B'", ["ZA : AA' = AB : A'B'", "ZA : ZB = AB : A'B'"], 'Abstand von Z zu Abstand von Z wie Parallelstrecke zu Parallelstrecke.')] },
        { l: 'b', topic: 'figur', text: <>Ergänze: (II) □ : AA' = ZB : □</>,
          steps: () => [stProp('Welche Ergänzung ist richtig?', "ZA : AA' = ZB : BB'", ["ZA' : AA' = ZB : ZB'", "AB : AA' = ZB : BB'"], 'Teilabschnitte zwischen Z und der ersten Parallele bzw. zwischen den Parallelen, auf beiden Strahlen gleich aufgeteilt.')] }
    ]},
    { id: '2022-II', label: 'MSA 2022 II', nr: '3', parts: [
        { l: 'a', topic: 'figur', text: <>Es gilt g ∥ h ∥ i (Bezeichnungen wie in der Figur). Ergänze: (I) (a + b + c) : □ = a : g, (II) c : f = □ : e, (III) □ : h = d : g.</>,
          figure: <StrFig k={1.25} pts={[{ t: 2.2 }, { t: 3.8 }, { t: 5.6 }]} seg1={['a', 'b', 'c']} seg2={['d', 'e', 'f']} par={['g', 'h', 'i']} />,
          steps: () => [stProp('(I) (a + b + c) : □ = a : g', '□ = i', ['□ = h', '□ = c'], 'Zum ganzen Strahl gehört die äußerste Parallele i.'), stProp('(II) c : f = □ : e', '□ = b', ['□ = a', '□ = h'], 'c und f sind die dritten Abschnitte, b und e die zweiten.'), stProp('(III) □ : h = d : g', '□ = d + e', ['□ = e', '□ = a + b'], 'd gehört zu g. Zu h gehört der Abstand d + e.')] },
        { l: 'b', topic: 'rechnen', text: <>Gegeben: a = 4 cm, b = 6 cm, g = 2 cm. Berechne die Länge der Strecke h.</>,
          steps: () => [stProp('Welche Gleichung passt?', 'h : g = (a + b) : a', ['h : g = a : (a + b)', 'h : g = b : a'], 'h gehört zum Abstand a + b, g zum Abstand a.'), stCalc('Berechne h.', 'h', 5, '2 · 10 : 4', 'h = 5 cm')] }
    ]},
    { id: '2020-I', label: 'MSA 2020 I', nr: '8', parts: [
        { l: 'b', topic: 'rechnen', text: <>Es gilt BE ∥ CF. Berechne die Länge der Strecke FC, wenn ZC = 21 cm, BC = 7 cm und EB = 8 cm.</>,
          figure: <StrFig k={1.2} pts={[{ t: 4, a: 'B', b: 'E' }, { t: 6, a: 'C', b: 'F' }]} seg1={['14', '7']} par={['8', '?']} />,
          steps: () => [stCalc('Berechne zuerst ZB = ZC − BC.', 'ZB', 14, '21 − 7', 'ZB = 14 cm'), stProp('Welche Gleichung passt für FC?', 'FC : EB = ZC : ZB', ['FC : EB = ZB : ZC', 'FC : ZC = ZB : EB'], 'Parallelstrecken wie die Abstände von Z.'), stCalc('Berechne FC.', 'FC', 12, '8 · 21 : 14', 'FC = 12 cm')] }
    ]},
    { id: '2019-I', label: 'MSA 2019 I', nr: '7', parts: [
        { l: 'a', topic: 'streckung', text: <>Das Volumen eines Würfels wird um das 27-fache verkleinert. Ermittle den Streckungsfaktor k.</>,
          steps: () => [S.select('Wie hängen Volumen und k zusammen?', ["V' = V · k³", "V' = V · k²", "V' = V · k"], 0, 'Drei Richtungen werden gestreckt.', "V' = V · k³"), stCalc('k³ = 1/27. Berechne k.', 'k', 1 / 3, '³√(1/27) = 1/3, Eingabe als 1/3 möglich', 'k = 1/3')] },
        { l: 'b', topic: 'streckung', text: <>Der Radius eines Kreises wird um 6 cm verlängert. Dadurch vervierfacht sich der Flächeninhalt. Berechne den ursprünglichen Radius r und den neuen Radius r'.</>,
          steps: () => [stCalc('Vierfacher Flächeninhalt: Welcher Streckungsfaktor k?', 'k', 2, 'k² = 4', 'k = 2'), stCalc("r' = 2r und r' = r + 6. Berechne r.", 'r', 6, '2r = r + 6', 'r = 6 cm'), stCalc("Berechne r'.", "r'", 12, '6 + 6', "r' = 12 cm")] }
    ]},
    { id: '2019-II', label: 'MSA 2019 II', nr: '10', parts: [
        { l: 'a', topic: 'streckung', text: <>Ein Kopiergerät: Bei 110 % werden alle Längen mit k = 1,1 gestreckt, bei 90 % mit k = 0,9. Ein Quadrat mit a = 9 cm wird mit 70 % kopiert. Berechne die Seitenlänge a' des Bildquadrats.</>,
          steps: () => [stCalc("a' = a · 0,7", "a'", 6.3, '9 · 0,7', "a' = 6,3 cm")] },
        { l: 'b', topic: 'streckung', text: <>Ein Dreieck mit A = 12 cm² wird auf A' = 17,28 cm² vergrößert. Bestimme rechnerisch, welcher Prozentsatz eingestellt wurde.</>,
          steps: () => [stCalc("Berechne k² = A' : A.", 'k²', 1.44, '17,28 : 12', 'k² = 1,44'), stCalc('Berechne k = √(k²).', 'k', 1.2, '√1,44', 'k = 1,2'), stCalc('Welcher Prozentsatz?', '%', 120, 'k · 100', '120 %')] },
        { l: 'c', topic: 'streckung', text: <>Ein Rechteck ABCD mit a = 6 cm und b = 3 cm wird mit k = 1/3 und dem Zentrum A auf A'B'C'D' abgebildet. Berechne die Seiten des Bildrechtecks.</>,
          steps: () => [stCalc("a' = a · k", "a'", 2, '6 · 1/3', "a' = 2 cm"), stCalc("b' = b · k", "b'", 1, '3 · 1/3', "b' = 1 cm")] }
    ]},
    { id: '2017-I', label: 'MSA 2017 I', nr: '9', parts: [
        { l: 'a', topic: 'streckung', text: <>Das Viereck ABCD wird mit k = 3 auf A'B'C'D' abgebildet. Entscheide: Wahr oder falsch? (1) Die Strecken des Vierecks ABCD sind dreimal so lang wie die des Bildvierecks. (2) Der Flächeninhalt des Bildvierecks ist neunmal so groß. (3) Der Winkel α ist dreimal so groß wie α'.</>,
          steps: () => [S.select('Aussage (1) ist …', ['falsch: Die Bildstrecken sind dreimal so lang wie die Originalstrecken', 'wahr'], 0, 'k = 3 vergrößert, das Bild ist größer.', 'falsch'), S.select('Aussage (2) ist …', ['wahr: Flächen mit k² = 9', 'falsch: Flächen mit k = 3'], 0, 'k² = 9.', 'wahr'), S.select('Aussage (3) ist …', ['falsch: Winkel bleiben gleich', 'wahr'], 0, 'Zentrische Streckung ändert keine Winkel.', 'falsch')] }
    ]},
    { id: '2017-II', label: 'MSA 2017 II', nr: '9', parts: [
        { l: 'b', topic: 'streckung', text: <>Die Strecke a = 3,5 m wird durch eine zentrische Streckung mit dem Zentrum S auf die Strecke c mit der Länge 875 cm abgebildet. Berechne den Streckungsfaktor k.</>,
          steps: () => [stCalc('Rechne 875 cm in Meter um.', 'c', 8.75, '875 : 100', 'c = 8,75 m'), stCalc('k = c : a', 'k', 2.5, '8,75 : 3,5', 'k = 2,5')] }
    ]},
    { id: '2016-I', label: 'MSA 2016 I', nr: '2', parts: [
        { l: 'a', topic: 'figur', text: <>Es gilt AD ∥ BE ∥ CF. Ergänze: □ : ZA = ZF : ZD</>, figure: figABC(3, 1.3),
          steps: () => [stProp('Welche Ergänzung ist richtig?', 'ZC : ZA = ZF : ZD', ['ZB : ZA = ZF : ZD', 'ZE : ZA = ZF : ZD'], 'F gehört zu C (dritte Parallele), D gehört zu A.')] },
        { l: 'b', topic: 'figur', text: <>Ergänze: BE : CF = □ : ZF</>,
          steps: () => [stProp('Welche Ergänzung ist richtig?', 'BE : CF = ZE : ZF', ['BE : CF = ZB : ZF', 'BE : CF = EF : ZF'], 'Parallelstrecken wie die Abstände von Z auf demselben Strahl (hier Strahl 2: ZE und ZF).')] },
        { l: 'c', topic: 'rechnen', text: <>Wenn ZA = 4 cm, ZC = 8 cm und AD = 3 cm, dann gilt CF = □ cm.</>,
          steps: () => [stProp('Welche Gleichung passt?', 'CF : AD = ZC : ZA', ['CF : AD = ZA : ZC', 'CF : ZC = ZA : AD'], 'Parallelstrecken wie die Abstände von Z.'), stCalc('Berechne CF.', 'CF', 6, '3 · 8 : 4', 'CF = 6 cm')] }
    ]},
    { id: '2016-II', label: 'MSA 2016 II', nr: '2', parts: [
        { l: 'a', topic: 'rechnen', text: <>Die Strecken g, h und i sind parallel. a, b, c sind die Abstände von Z auf dem ersten Strahl, d, e, f die Abstände von Z auf dem zweiten Strahl (Figur nachgezeichnet). Es gilt a = 4 cm, b = 5 cm, d = 6 cm, g = 3 cm, i = 6,75 cm. Berechne die Längen c, h und f.</>,
          figure: <StrFig k={1.5} pts={[{ t: 2.4 }, { t: 3 }, { t: 5.4 }]} seg1={['a', '', '']} seg2={['d', '', '']} par={['g', 'h', 'i']} />,
          steps: () => [stProp('Welche Gleichung passt für c?', 'c : a = i : g', ['c : a = g : i', 'c : i = g : b'], 'Abstand von Z wie Parallelstrecke: c gehört zu i, a zu g.'), stCalc('Berechne c.', 'c', 9, '4 · 6,75 : 3', 'c = 9 cm'), stCalc('Berechne h (h : g = b : a).', 'h', 3.75, '3 · 5 : 4', 'h = 3,75 cm'), stCalc('Berechne f (f : d = c : a).', 'f', 13.5, '6 · 9 : 4', 'f = 13,5 cm')] }
    ]},
    { id: '2016-IIb', label: 'MSA 2016 II', nr: '10', parts: [
        { l: 'a', topic: 'streckung', text: <>Mit k = 1/3 entsteht aus dem Parallelogramm ABCD das Bild A'B'C'D'. Zwei Aussagen sind falsch. Stelle sie richtig: (1) Die Strecke [A'B'] ist dreimal so lang wie [AB]. (2) Der Flächeninhalt der Originalfigur beträgt ein Drittel des Flächeninhalts der Bildfigur.</>,
          steps: () => [S.select('Richtig ist zu (1):', ["[A'B'] ist ein Drittel so lang wie [AB]", "[A'B'] ist dreimal so lang wie [AB]", "[A'B'] ist ein Neuntel so lang wie [AB]"], 0, 'k = 1/3 verkleinert alle Längen auf ein Drittel.', "[A'B'] = [AB] : 3"), S.select('Richtig ist zu (2):', ['Die Bildfigur hat ein Neuntel des Flächeninhalts der Originalfigur', 'Die Originalfigur hat ein Drittel des Flächeninhalts der Bildfigur', 'Die Bildfigur hat ein Drittel des Flächeninhalts der Originalfigur'], 0, 'Flächen mit k² = 1/9.', "A' = A : 9")] }
    ]},
    { id: '2014-I', label: 'MSA 2014 I', nr: '2', parts: [
        { l: 'a', topic: 'streckung', text: <>Ein kleiner Kegel K₂ entsteht aus dem großen Kegel K₁ durch zentrische Streckung von der Spitze Z aus, es gilt h₂ = 0,6 · h₁ (G = Grundfläche, r = Radius, V = Volumen, α = Winkel an der Spitze). Entscheide: richtig oder falsch?</>,
          steps: () => [
            S.select('(1) G₁ · 0,6 = G₂', ['falsch: Flächen mit 0,6² = 0,36', 'richtig'], 0, 'Flächen ändern sich mit k².', 'falsch'),
            S.select('(2) r₁ : r₂ = h₁ : h₂', ['richtig: Längen im gleichen Verhältnis', 'falsch'], 0, 'Alle Längen werden mit demselben k gestreckt.', 'richtig'),
            S.select('(4) r₂ : 0,6 = r₁', ['richtig: r₂ = 0,6 · r₁', 'falsch'], 0, 'r₂ = k · r₁ mit k = 0,6.', 'richtig'),
            S.select('(5) V₁ · 0,6³ = V₂', ['richtig: Volumen mit k³', 'falsch'], 0, 'Volumen ändern sich mit k³.', 'richtig'),
            S.select('(6) α₁ · 0,6 = α₂', ['falsch: Winkel bleiben gleich', 'richtig'], 0, 'Zentrische Streckung lässt Winkel unverändert.', 'falsch')] }
    ]},
    { id: '2014-II', label: 'MSA 2014 II', nr: '2', parts: [
        { l: 'a', topic: 'rechnen', text: <>Es gilt AD ∥ BE ∥ CF, ZA = 18 cm, ZD = 24 cm, DE = 20 cm, BE = 22 cm, CF = 30 cm. Berechne die Länge der Strecke [AD].</>,
          figure: <StrFig k={24 / 18} pts={[{ t: 18, a: 'A', b: 'D' }, { t: 33, a: 'B', b: 'E' }, { t: 45, a: 'C', b: 'F' }]} seg1={['18', '', '']} seg2={['24', '20', '']} par={['?', '22', '30']} width={420} />,
          steps: () => [stProp('Welche Gleichung passt für ZB?', 'ZB : ZA = ZE : ZD', ['ZB : ZA = ZD : ZE', 'ZB : ZE = ZA : DE'], 'ZE = 24 + 20 = 44. Abstände auf Strahl 1 wie Abstände auf Strahl 2.'), stCalc('Berechne ZB.', 'ZB', 33, '18 · 44 : 24', 'ZB = 33 cm'), stCalc('Berechne AD (AD : BE = ZA : ZB).', 'AD', 12, '22 · 18 : 33', 'AD = 12 cm')] },
        { l: 'b', topic: 'rechnen', text: <>Berechne die Längen der Strecken [AB] und [EF].</>,
          steps: () => [stCalc('AB = ZB − ZA', 'AB', 15, '33 − 18', 'AB = 15 cm'), stCalc('Berechne ZF (ZF : ZE = CF : BE).', 'ZF', 60, '44 · 30 : 22', 'ZF = 60 cm'), stCalc('EF = ZF − ZE', 'EF', 16, '60 − 44', 'EF = 16 cm')] }
    ]},
    { id: '2012-I', label: 'MSA 2012 I', nr: '2', parts: [
        { l: 'a', topic: 'streckung', text: <>Ein rechtwinkliges Dreieck ABC wird mit dem Zentrum Z auf A'B'C' abgebildet. Bekannt: AC = 45 m, BZ = 48 m, A'C' = 15 m. Ermittle den Streckungsfaktor k rechnerisch.</>,
          steps: () => [stCalc("k = A'C' : AC", 'k', 1 / 3, '15 : 45 = 1/3', 'k = 1/3')] },
        { l: 'b', topic: 'streckung', text: <>Berechne den Umfang der Dreiecke ABC und A'B'C' in m. Rechne mit BC = 36 m (rechter Winkel bei C).</>,
          steps: () => [stCalc('Berechne AB mit dem Satz des Pythagoras.', 'AB', 57.63, '√(45² + 36²)', 'AB ≈ 57,63 m'), stCalc('Umfang von ABC.', 'u', 138.63, '45 + 36 + 57,63', 'u ≈ 138,63 m'), stCalc("Umfang von A'B'C' = u · k.", "u'", 46.21, '138,63 : 3', "u' ≈ 46,21 m")] }
    ]},
    { id: '2011-II', label: 'MSA 2011 II', nr: '4', parts: [
        { l: 'a', topic: 'streckung', text: <>Die Dreiecke ABC und AB'C' sind ähnlich, k = 1,5. Es gilt AB = 10 cm, BC = 12 cm, CA = 15 cm (Zahlen ergänzt). Berechne den Umfang des Dreiecks AB'C'.</>,
          figure: <StrFig fill k={1.3} pts={[{ t: 3, a: 'B', b: 'C' }, { t: 4.5, a: "B'", b: "C'" }]} ang={[-12, 30]} zName="A" />,
          steps: () => [stCalc('Umfang von ABC.', 'u', 37, '10 + 12 + 15', 'u = 37 cm'), stCalc("u' = u · k", "u'", 55.5, '37 · 1,5', "u' = 55,5 cm")] },
        { l: 'b', topic: 'streckung', text: <>Das Originaldreieck ABC hat den Flächeninhalt 1 732 cm². Berechne den Flächeninhalt des Bilddreiecks AB'C'.</>,
          steps: () => [stCalc("A' = A · k²", "A'", 3897, '1732 · 2,25', "A' = 3 897 cm²")] }
    ]}
];

// ==========================================
// 5. THEMEN UND START
// ==========================================
const ST_TOPICS = [
    { id: 'streckung', nr: 1, title: 'Zentrische Streckung', desc: 'Zentrum Z und Faktor k: Längen mal k, Flächen mal k², Volumen mal k³.' },
    { id: 'figur', nr: 2, title: 'Strahlensätze: die Figur', desc: 'Zwei Strahlen, Parallelen, Verhältnisse: 1. und 2. Strahlensatz, X-Figur, Platzhalter ergänzen.' },
    { id: 'rechnen', nr: 3, title: 'Strecken berechnen', desc: 'Verhältnisgleichung aufstellen und über Kreuz lösen, auch mit drei Parallelen und Sachaufgaben.' },
    { id: 'pruefung', nr: 4, title: 'MSA-Prüfungsaufgaben', desc: 'Prüfungsaufgaben 2011–2025 zu Strahlensätzen und zentrischer Streckung.' }
];

fkMount({
    key: 'strahlen',
    title: 'Strahlensätze & Streckung',
    icon: StrahlenIcon,
    theme: 'lime',
    beta: false,
    topics: ST_TOPICS,
    gen: GEN,
    exams: ST_EXAMS,
    learn: ST_LEARN_BUILD
});
