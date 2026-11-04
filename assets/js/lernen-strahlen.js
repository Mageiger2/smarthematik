// ==========================================
// lernen-strahlen.js — Lernkarten „Strahlensätze & zentrische Streckung“
// Wird nach lernen-kern.js und vor strahlensaetze.js inline kompiliert.
// ST_LEARN_BUILD() liefert die Karten je Thema (erst beim Rendern aufgerufen).
// ==========================================

// Streck-Labor: k per Regler, Original- und Bilddreieck live (Figur aus strahlensaetze.js wird erst beim Rendern gebraucht).
const LSStreckLab = ({ onDone, target = 2, done }) => {
    const [k, setK] = useState(1);
    const hit = lfSame(k, target);
    useEffect(() => { if (onDone && hit) onDone(); /* eslint-disable-next-line */ }, [hit]);
    const za = 3, ab = 2;
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
            <div className="grid md:grid-cols-2 gap-4 items-center">
                <div className="flex justify-center"><StrFig fill k={1.2} pts={[{ t: 2, a: 'A', b: 'B' }, ...(k !== 1 ? [{ t: 2 * k, a: "A'", b: "B'" }] : [])]} ang={[-12, 30]} width={300} /></div>
                <div className="space-y-3">
                    <LnSlider label="k" value={k} min={0.5} max={3} step={0.5} onChange={setK} />
                    <div className="bg-white border border-slate-200 rounded-lg p-3 font-math text-base sm:text-lg space-y-1">
                        <div>ZA = {lfS(za)} cm → ZA' = {lfS(za)} · {lfS(k)} = {lfS(za * k)} cm</div>
                        <div>AB = {lfS(ab)} cm → A'B' = {lfS(ab)} · {lfS(k)} = {lfS(ab * k)} cm</div>
                    </div>
                    <div className={`text-sm sm:text-base font-bold ${hit || done ? 'text-green-700' : 'text-slate-700'}`}>
                        {hit || done ? '✓ Genau richtig!' : <>Aufgabe: Stelle k = {lfS(target)} ein.</>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Figur-Labor: Tippe auf eine Strecke, der Partner auf dem anderen Strahl leuchtet mit.
const LSFigurLab = ({ onDone, done }) => {
    const [sel, setSel] = useState(null);
    const [seen, setSeen] = useState([]);
    const pairs = { ZA: ['ZA', 'ZD', 'Abstand von Z bis zur ersten Parallele'], ZB: ['ZB', 'ZE', 'Abstand von Z bis zur zweiten Parallele'], AD: ['AD', 'BE', 'die beiden Parallelen'] };
    const all = seen.length >= 3;
    useEffect(() => { if (all && onDone) onDone(); /* eslint-disable-next-line */ }, [all]);
    const t = themeColors[FK.theme];
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
            <p className="text-sm text-slate-600 mb-2">Tippe auf eine Strecke. Die Strecke, die auf dem anderen Strahl dazugehört, wird mitgezeigt.</p>
            <div className="flex flex-wrap justify-center gap-2 mb-3">
                {Object.keys(pairs).map(key => <button key={key} onClick={() => { setSel(key); if (!seen.includes(key)) setSeen(s => [...s, key]); }} className={`px-4 py-2 rounded-lg font-math font-bold border-2 ${sel === key ? `${t.badgeBg} text-white border-transparent` : `bg-white ${t.activeBorder} ${t.activeTitle}`}`}>{key}</button>)}
            </div>
            <div className="flex justify-center"><StrFig k={1.3} pts={[{ t: 2.4, a: 'A', b: 'D' }, { t: 4.4, a: 'B', b: 'E' }]} width={320}
                hl={sel === 'ZA' ? [{ ray: 1, i: 0 }, { ray: 2, i: 0 }] : sel === 'ZB' ? [{ ray: 1, i: 1 }, { ray: 2, i: 1 }] : sel === 'AD' ? [{ par: 0 }, { par: 1 }] : []} /></div>
            {sel && <div className="mt-2 text-center font-math text-lg animate-fade-in"><b>{pairs[sel][0]}</b> gehört zu <b>{pairs[sel][1]}</b> <span className="font-sans text-sm text-slate-600">({pairs[sel][2]})</span></div>}
        </div>
    );
};

const ST_LEARN_BUILD = () => {
    const opt = (...a) => a.map(s => <M>{s}</M>);
    const L = {};

    L.streckung = { cards: [
        { id: 'k1', title: 'Zentrum und Faktor', needsWidget: true,
          body: <>
            <p>Bei der <b>zentrischen Streckung</b> gibt es ein <b>Zentrum Z</b> und einen <b>Streckungsfaktor k</b>. Von Z aus wird jeder Punkt „nach außen geschoben“: Der Bildpunkt A' liegt auf dem Strahl von Z durch A, und es gilt <M>ZA' = k · ZA</M>.</p>
            <p>Probiere es aus: Stelle k = 2 ein.</p>
          </>,
          widget: (p) => <LSStreckLab onDone={p.onDone} done={p.done} target={2} />,
          check: { q: 'ZA = 4 cm und k = 3. Wie lang ist ZA\'?', options: opt('12 cm', '7 cm', '1,33 cm', '9 cm'), correct: 0, hint: 'ZA\' = k · ZA = 3 · 4.' } },
        { id: 'k2', title: 'Alle Längen mal k',
          body: <>
            <p>Nicht nur die Abstände von Z, <b>jede Länge</b> der Figur wird mit k multipliziert: Seiten, Umfang, Höhen. Die Form bleibt gleich, die <b>Winkel ändern sich nicht</b>.</p>
            <LnSteps lines={[
                { f: 'Dreieck ZAB: ZA = 3 cm, AB = 2 cm, k = 2', e: 'gegeben' },
                { f: "ZA' = 3 · 2 = 6 cm", e: 'Länge mal k' },
                { f: "A'B' = 2 · 2 = 4 cm", e: 'auch die Seite AB mal k' },
                { f: "α' = α", e: 'Winkel bleiben gleich' }]} />
          </>,
          merke: <>Bildlänge = Originallänge · k. Winkel bleiben gleich.</>,
          check: { q: 'Ein Dreieck hat den Umfang 10 cm. Mit k = 1,5 gestreckt: Umfang des Bildes?', options: opt('15 cm', '11,5 cm', '22,5 cm', '10 cm'), correct: 0, hint: 'Auch der Umfang wird mal k gerechnet: 10 · 1,5.' } },
        { id: 'k3', title: 'Verkleinern: k kleiner als 1',
          body: <>
            <p>Ist k kleiner als 1, wird die Figur <b>kleiner</b>. Beispiel k = 0,5: Alle Längen werden halbiert. k = 1/3: Alle Längen werden gedrittelt.</p>
            <LnSteps lines={[
                { f: 'AB = 12 cm, k = 0,5', e: 'gegeben' },
                { f: "A'B' = 12 · 0,5 = 6 cm", e: 'mal 0,5 ist halbieren' },
                { f: 'AB = 12 cm, k = 1/3', e: 'anderer Faktor' },
                { f: "A'B' = 12 · 1/3 = 4 cm", e: 'mal 1/3 ist durch 3 teilen' }]} />
          </>,
          check: { q: 'ZA = 9 cm, k = 1/3. Wie lang ist ZA\'?', options: opt('3 cm', '27 cm', '6 cm', '12 cm'), correct: 0, hint: '9 · 1/3 = 9 : 3.' } },
        { id: 'k4', title: 'Fläche mal k², Volumen mal k³',
          body: <>
            <p>Ein Rechteck 2 cm × 3 cm hat 6 cm². Mit k = 2 wird es 4 cm × 6 cm = 24 cm². Das ist <b>viermal</b> so viel, nicht doppelt! Länge und Breite werden beide mal k gerechnet: <M>k · k = k²</M>.</p>
            <p>Bei Körpern kommt noch die Höhe dazu: Volumen mal <M>k³</M>.</p>
            <LnSteps lines={[
                { f: 'A = 6 cm², k = 2', e: 'Fläche' },
                { f: "A' = 6 · 2² = 6 · 4 = 24 cm²", e: 'mal k²' },
                { f: 'V = 5 cm³, k = 2', e: 'Volumen' },
                { f: "V' = 5 · 2³ = 5 · 8 = 40 cm³", e: 'mal k³' }]} />
          </>,
          merke: <>Länge · k, Fläche · k², Volumen · k³.</>,
          check: { q: 'A = 10 cm², k = 3. Flächeninhalt des Bildes?', options: opt('90 cm²', '30 cm²', '13 cm²', '270 cm²'), correct: 0, hint: 'k² = 9, dann 10 · 9.' } },
        { id: 'k5', title: 'k berechnen',
          body: <>
            <p>Oft ist k gesucht. Dann teilst du <b>Bild durch Original</b>: <M>k = ZA' : ZA</M>. Bei Flächen bekommst du erst k² und musst die Wurzel ziehen.</p>
            <LnSteps lines={[
                { f: "ZA = 4 cm, ZA' = 10 cm", e: 'Längen' },
                { f: 'k = 10 : 4 = 2,5', e: 'Bild : Original' },
                { f: "A = 12 cm², A' = 108 cm²", e: 'Flächen' },
                { f: 'k² = 108 : 12 = 9  →  k = √9 = 3', e: 'erst k², dann Wurzel' }]} />
          </>,
          merke: <>k = Bild : Original. Aus Flächen: k = √(A' : A).</>,
          check: { q: 'A = 8 cm², A\' = 32 cm². Welcher Faktor k?', options: opt('2', '4', '24', '0,25'), correct: 0, hint: 'k² = 32 : 8 = 4, Wurzel daraus.' } }
    ]};

    L.figur = { cards: [
        { id: 'k1', title: 'Die Figur: Z, zwei Strahlen, Parallelen', needsWidget: true,
          body: <>
            <p>Von Z gehen <b>zwei Strahlen</b> aus. Zwei <b>parallele</b> Strecken (AD und BE) schneiden die Strahlen. Dadurch entstehen ein kleines Dreieck ZAD und ein großes Dreieck ZBE. Das große ist eine zentrische Streckung des kleinen!</p>
            <p>Jede Strecke hat einen Partner: Was auf dem ersten Strahl liegt, gehört zum Gleichen auf dem zweiten Strahl.</p>
          </>,
          widget: (p) => <LSFigurLab onDone={p.onDone} done={p.done} />,
          check: { q: 'Welche Strecke gehört zu ZB?', options: opt('ZE', 'ZD', 'BE', 'AD'), correct: 0, hint: 'ZB geht von Z bis zur zweiten Parallele. Auf dem anderen Strahl ist das ZE.' } },
        { id: 'k2', title: '1. Strahlensatz: Abschnitte auf den Strahlen',
          body: <>
            <p>Die Abschnitte auf dem einen Strahl verhalten sich wie die Abschnitte auf dem anderen Strahl. Immer <b>von Z aus</b> messen:</p>
            <LnSteps lines={[
                { f: 'ZA : ZB = ZD : ZE', e: 'kurz : lang = kurz : lang' },
                { f: 'ZA : AB = ZD : DE', e: 'geht auch mit den Teilstücken' },
                { f: 'Beispiel: ZA = 2, ZB = 6, ZD = 3', e: 'gegeben' },
                { f: '2 : 6 = 3 : ZE  →  ZE = 9', e: 'ZE ist dreimal so lang wie ZD, wie ZB zu ZA' }]} />
          </>,
          merke: <>1. Strahlensatz: Strahl 1 zu Strahl 1 wie Strahl 2 zu Strahl 2 (von Z aus).</>,
          check: { q: 'Welche Gleichung ist richtig?', options: opt('ZA : ZB = ZD : ZE', 'ZA : ZB = ZE : ZD', 'ZA : ZD = AD : BE', 'ZA : ZE = ZB : ZD'), correct: 0, hint: 'Links Strahl 1 (kurz : lang), rechts Strahl 2 (kurz : lang).' } },
        { id: 'k3', title: '2. Strahlensatz: die Parallelen',
          body: <>
            <p>Die Parallelen verhalten sich wie die <b>Abstände von Z</b>. Achtung: Hier musst du immer von Z aus messen, Teilstücke wie AB gehen hier nicht!</p>
            <LnSteps lines={[
                { f: 'AD : BE = ZA : ZB', e: 'kleine Parallele : große Parallele = kurzer Abstand : langer Abstand' },
                { f: 'AD : BE = ZD : ZE', e: 'geht auch mit dem anderen Strahl' },
                { f: 'Beispiel: AD = 3, ZA = 2, ZB = 6', e: 'gegeben' },
                { f: '3 : BE = 2 : 6  →  BE = 9', e: 'BE ist dreimal so lang wie AD' }]} />
          </>,
          merke: <>2. Strahlensatz: Parallele zu Parallele wie Abstand von Z zu Abstand von Z. Nie mit AB oder DE!</>,
          check: { q: 'Welche Gleichung ist falsch?', options: opt('AD : BE = AB : ZB', 'AD : BE = ZA : ZB', 'AD : BE = ZD : ZE', 'BE : AD = ZB : ZA'), correct: 0, hint: 'AB ist ein Teilstück, kein Abstand von Z. Das geht bei den Parallelen nicht.' } },
        { id: 'k4', title: 'Die X-Figur',
          body: <>
            <p>Die Parallelen können auch auf <b>verschiedenen Seiten</b> von Z liegen. Dann sieht die Figur aus wie ein X. Die Regeln bleiben gleich: Partner ist, was auf demselben Strahl liegt.</p>
            <div className="flex justify-center"><StrFig k={1.3} pts={[{ t: -2.4, a: 'D', b: 'E' }, { t: 3.2, a: 'A', b: 'B' }]} width={320} /></div>
            <LnSteps lines={[
                { f: 'ZA : ZD = ZB : ZE', e: 'A und D liegen auf Strahl 1, B und E auf Strahl 2' },
                { f: 'AB : DE = ZA : ZD', e: 'Parallelen wie Abstände von Z' }]} />
          </>,
          check: { q: 'X-Figur: ZA = 6, ZD = 3, AB = 8. Wie lang ist DE?', options: opt('4', '16', '5', '11'), correct: 0, hint: 'DE : AB = ZD : ZA = 3 : 6, also DE halb so lang wie AB.' } },
        { id: 'k5', title: 'Wenn Teilstücke gegeben sind: addieren',
          body: <>
            <p>In der Prüfung sind die Strecken oft mit a, b, c … bezeichnet. Wichtig: Für den Abstand von Z musst du die Teilstücke <b>zusammenzählen</b>.</p>
            <div className="flex justify-center"><StrFig k={1.25} pts={[{ t: 2.4 }, { t: 4.4 }]} seg1={['a', 'b']} seg2={['c', 'd']} par={['e', 'f']} width={320} /></div>
            <LnSteps lines={[
                { f: 'a : (a + b) = c : (c + d)', e: '1. Strahlensatz: kurzer Abstand : ganzer Abstand' },
                { f: 'a : b = c : d', e: 'auch die Teilstücke' },
                { f: 'e : f = a : (a + b)', e: '2. Strahlensatz: zu f gehört der ganze Abstand a + b' }]} />
          </>,
          merke: <>Abstand von Z = alle Teilstücke davor addieren.</>,
          check: { q: 'Welche Gleichung ist richtig?', options: opt('e : f = a : (a + b)', 'e : f = a : b', 'e : f = b : a', 'e : f = (a + b) : a'), correct: 0, hint: 'Die große Parallele f gehört zum ganzen Abstand a + b.' } }
    ]};

    L.rechnen = { cards: [
        { id: 'k1', title: 'Verhältnisgleichung über Kreuz lösen',
          body: <>
            <p>Eine Gleichung wie <M>x : 4 = 9 : 6</M> löst du <b>über Kreuz</b>: Das Gesuchte x steht allein, wenn du mit 4 multiplizierst.</p>
            <LnSteps lines={[
                { f: 'x : 4 = 9 : 6', e: 'x links allein stellen' },
                { f: 'x = 9 · 4 : 6', e: 'mal 4 (die Zahl neben x)' },
                { f: 'x = 36 : 6 = 6', e: 'ausrechnen' }]} />
          </>,
          merke: <>Schreibe die Gleichung so, dass das Gesuchte vorne steht: x : a = b : c → x = b · a : c.</>,
          check: { q: 'x : 5 = 12 : 4. Wie groß ist x?', options: opt('15', '9,6', '2,4', '60'), correct: 0, hint: 'x = 12 · 5 : 4.' } },
        { id: 'k2', title: 'Erst die ganze Strecke',
          body: <>
            <p>Gegeben: ZA = 3 cm, AB = 6 cm, ZD = 2 cm. Gesucht: DE. Der Trick: Erst <b>ZB = 3 + 6 = 9 cm</b> bilden, dann ZE berechnen, dann DE = ZE − ZD.</p>
            <LnSteps lines={[
                { f: 'ZB = 3 + 6 = 9 cm', e: 'Abstand von Z' },
                { f: 'ZE : ZD = ZB : ZA', e: '1. Strahlensatz, Gesuchtes vorne' },
                { f: 'ZE = 9 · 2 : 3 = 6 cm', e: 'über Kreuz' },
                { f: 'DE = 6 − 2 = 4 cm', e: 'Teilstück = ganz minus Anfang' }]} />
          </>,
          check: { q: 'ZA = 4, AB = 4, ZD = 3. Wie lang ist ZE?', options: opt('6', '3', '8', '12'), correct: 0, hint: 'ZB = 8. ZE = 8 · 3 : 4.' } },
        { id: 'k3', title: 'Prüfungsbeispiel (MSA 2020)',
          body: <>
            <p>„Es gilt BE ∥ CF. Berechne FC, wenn ZC = 21 cm, BC = 7 cm und EB = 8 cm.“</p>
            <div className="flex justify-center"><StrFig k={1.2} pts={[{ t: 4, a: 'B', b: 'E' }, { t: 6, a: 'C', b: 'F' }]} seg1={['14', '7']} par={['8', '?']} width={320} /></div>
            <LnSteps lines={[
                { f: 'ZB = 21 − 7 = 14 cm', e: 'Abstand von Z zur ersten Parallele' },
                { f: 'FC : EB = ZC : ZB', e: '2. Strahlensatz: Parallele zu Parallele wie Abstand zu Abstand' },
                { f: 'FC = 8 · 21 : 14 = 12 cm', e: 'über Kreuz' }]} />
          </>,
          merke: <>Erst die Abstände von Z aufschreiben, dann die Gleichung mit dem Gesuchten vorne, dann über Kreuz.</>,
          check: { q: 'Warum darf man nicht FC : EB = BC : ZB rechnen?', options: [<span>BC ist kein Abstand von Z</span>, <span>BC ist zu kurz</span>, <span>Man darf, es kommt dasselbe heraus</span>], correct: 0, hint: 'Beim 2. Strahlensatz gehören zu den Parallelen immer die ganzen Abstände von Z.' } },
        { id: 'k4', title: 'Sachaufgabe: Schatten',
          body: <>
            <p>Ein Pfosten (2 m) wirft einen Schatten von 1,5 m. Der Schatten eines Baums ist 12 m lang. Die Sonnenstrahlen sind parallel, also ist das eine Strahlensatzfigur: Schattenende = Z, Pfosten und Baum sind die Parallelen.</p>
            <LnSteps lines={[
                { f: 'Baum : 2 = 12 : 1,5', e: 'Höhe : Höhe = Schatten : Schatten' },
                { f: 'Baum = 2 · 12 : 1,5 = 16 m', e: 'über Kreuz' }]} />
          </>,
          check: { q: 'Stab 1 m, Schatten 0,5 m. Turm-Schatten 20 m. Wie hoch ist der Turm?', options: opt('40 m', '10 m', '20 m', '21 m'), correct: 0, hint: 'Turm : 1 = 20 : 0,5.' } }
    ]};

    return L;
};
