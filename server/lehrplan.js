// Lehrplan-Übersicht und Lernzusammenfassungen für das berufliche Gymnasium
// in Baden-Württemberg (Eingangsklasse 11, Jahrgangsstufe 1 = Klasse 12,
// Jahrgangsstufe 2 = Klasse 13). Orientiert an den Bildungsplänen des Landes;
// Reihenfolge und Schwerpunkte können je nach Schule und Profil abweichen.

export const KLASSEN = [11, 12, 13];

export const STUFEN = {
  11: 'Eingangsklasse (Klasse 11)',
  12: 'Jahrgangsstufe 1 (Klasse 12)',
  13: 'Jahrgangsstufe 2 (Klasse 13)',
};

const FAECHER = [
  {
    id: 'mathe',
    name: 'Mathematik',
    klassen: {
      11: [
        {
          titel: 'Lineare Funktionen und lineare Gleichungssysteme',
          inhalte: ['Steigung', 'Achsenabschnitt', 'Schnittpunkte', 'Gauß-Verfahren'],
          zusammenfassung: [
            'Lineare Funktion: f(x) = m·x + b; m ist die Steigung, b der y-Achsenabschnitt.',
            'Steigung aus zwei Punkten: m = (y₂ − y₁) / (x₂ − x₁).',
            'Nullstelle: f(x) = 0 setzen → x = −b/m.',
            'Parallel: gleiche Steigung. Orthogonal: m₁ · m₂ = −1.',
            'Schnittpunkt zweier Geraden: Funktionsterme gleichsetzen, x berechnen, in eine Gleichung einsetzen.',
            'LGS mit dem Gauß-Verfahren lösen: auf Stufenform bringen, dann rückwärts einsetzen. Keine Lösung ↔ Widerspruch (z. B. 0 = 3), unendlich viele Lösungen ↔ Nullzeile.',
          ],
        },
        {
          titel: 'Quadratische Funktionen',
          inhalte: ['Scheitelpunktform', 'Normalform', 'p-q-Formel', 'Mitternachtsformel'],
          zusammenfassung: [
            'Normalform: f(x) = ax² + bx + c. Scheitelpunktform: f(x) = a(x − d)² + e mit Scheitel S(d | e).',
            'a > 0: nach oben geöffnet, a < 0: nach unten; |a| > 1 gestreckt, |a| < 1 gestaucht.',
            'Nullstellen mit der abc-Formel: x = (−b ± √(b² − 4ac)) / (2a). Diskriminante D = b² − 4ac entscheidet: D > 0 zwei, D = 0 eine, D < 0 keine Nullstelle.',
            'p-q-Formel (für x² + px + q = 0): x = −p/2 ± √((p/2)² − q).',
            'Umwandlung in Scheitelpunktform durch quadratische Ergänzung.',
            'Faktorisierte Form: f(x) = a(x − x₁)(x − x₂) – Nullstellen direkt ablesbar.',
          ],
        },
        {
          titel: 'Ganzrationale Funktionen',
          inhalte: ['Grad', 'Symmetrie', 'Globalverlauf', 'Polynomdivision', 'Vielfachheit von Nullstellen'],
          zusammenfassung: [
            'f(x) = aₙxⁿ + … + a₁x + a₀, n ist der Grad.',
            'Verhalten für x → ±∞ bestimmt der Summand mit der höchsten Potenz (aₙ und n gerade/ungerade).',
            'Nur gerade Exponenten → achsensymmetrisch zur y-Achse (f(−x) = f(x)); nur ungerade → punktsymmetrisch zum Ursprung (f(−x) = −f(x)).',
            'Nullstellen: Ausklammern, Substitution (z = x² bei biquadratischen Gleichungen) oder Polynomdivision nach Raten einer Nullstelle.',
            'Einfache Nullstelle: Vorzeichenwechsel. Doppelte Nullstelle: Berührpunkt, kein Vorzeichenwechsel. Dreifache: Sattelpunkt-artiger Durchgang.',
          ],
        },
        {
          titel: 'Einführung in die Differentialrechnung',
          inhalte: ['Änderungsrate', 'Tangente', 'Ableitungsregeln'],
          zusammenfassung: [
            'Mittlere Änderungsrate (Sekantensteigung): (f(b) − f(a)) / (b − a).',
            'Momentane Änderungsrate = Ableitung f′(x₀) = Grenzwert des Differenzenquotienten = Tangentensteigung.',
            'Potenzregel: (xⁿ)′ = n·xⁿ⁻¹. Faktorregel: (c·f)′ = c·f′. Summenregel: (f + g)′ = f′ + g′. Konstanten fallen weg.',
            'Tangentengleichung in x₀: t(x) = f′(x₀)·(x − x₀) + f(x₀).',
            'f′(x) > 0 → f steigt; f′(x) < 0 → f fällt; f′(x₀) = 0 → waagrechte Tangente (mögliche Extremstelle).',
          ],
        },
        {
          titel: 'Exponential- und trigonometrische Funktionen (Grundlagen)',
          inhalte: ['Wachstum', 'e-Funktion', 'sin/cos', 'Amplitude', 'Periode'],
          zusammenfassung: [
            'Exponentialfunktion f(x) = a·bˣ: b > 1 Wachstum, 0 < b < 1 Zerfall. Asymptote y = 0.',
            'Natürliche Exponentialfunktion eˣ mit e ≈ 2,718; Umkehrung ist ln(x). eˣ = c ⇔ x = ln(c).',
            'f(x) = a·sin(b(x − c)) + d: Amplitude |a|, Periode p = 2π/b, Verschiebung c nach rechts, d nach oben.',
            'Wichtige Werte: sin(0) = 0, sin(π/2) = 1, cos(0) = 1, cos(π) = −1.',
          ],
        },
      ],
      12: [
        {
          titel: 'Kurvendiskussion',
          inhalte: ['Extrempunkte', 'Wendepunkte', 'Monotonie', 'Krümmung'],
          zusammenfassung: [
            'Notwendige Bedingung Extremstelle: f′(x) = 0. Hinreichend: f″(x) < 0 → Hochpunkt, f″(x) > 0 → Tiefpunkt (oder Vorzeichenwechsel von f′).',
            'Wendestelle: f″(x) = 0 und f‴(x) ≠ 0 (oder Vorzeichenwechsel von f″). Sattelpunkt: Wendepunkt mit f′(x) = 0.',
            'f″ > 0 → linksgekrümmt, f″ < 0 → rechtsgekrümmt.',
            'Vorgehen: Definitionsbereich, Symmetrie, Nullstellen, Ableitungen, Extrem- und Wendepunkte, Verhalten im Unendlichen, Skizze.',
            'Wendetangente: Tangente im Wendepunkt – oft gefragt als Stelle der größten/kleinsten Änderungsrate.',
          ],
        },
        {
          titel: 'Ableitungsregeln und Funktionen mit e und sin/cos',
          inhalte: ['Produktregel', 'Kettenregel', 'e-Funktion', 'Sinus/Kosinus'],
          zusammenfassung: [
            'Produktregel: (u·v)′ = u′v + uv′. Kettenregel: (u(v(x)))′ = u′(v(x))·v′(x).',
            '(eˣ)′ = eˣ, (e^(kx))′ = k·e^(kx). (sin x)′ = cos x, (cos x)′ = −sin x.',
            'eˣ ist immer > 0 → Nullstellen von f(x) = g(x)·eˣ nur dort, wo g(x) = 0 ist.',
            'Beschränktes Wachstum: f(t) = S − c·e^(−kt) mit Schranke S.',
            'Periodische Vorgänge (Tageslänge, Gezeiten) mit f(t) = a·sin(b(t − c)) + d modellieren.',
          ],
        },
        {
          titel: 'Extremwertprobleme und Rekonstruktion',
          inhalte: ['Optimierung', 'Nebenbedingung', 'Steckbriefaufgaben'],
          zusammenfassung: [
            'Extremwertaufgabe: Zielfunktion aufstellen, Nebenbedingung nutzen, um auf eine Variable zu reduzieren, Definitionsbereich festlegen, Ableitung = 0, Randwerte prüfen.',
            'Steckbriefaufgabe (Rekonstruktion): allgemeinen Funktionsterm ansetzen (Grad n → n + 1 Unbekannte), Eigenschaften in Gleichungen übersetzen, LGS lösen.',
            'Übersetzungen: „Punkt P(a|b)“ → f(a) = b; „Extremum bei a“ → f′(a) = 0; „Wendepunkt bei a“ → f″(a) = 0; „Steigung m bei a“ → f′(a) = m.',
            'Symmetrie spart Unbekannte: achsensymmetrisch → nur gerade Exponenten.',
          ],
        },
        {
          titel: 'Integralrechnung',
          inhalte: ['Stammfunktion', 'Hauptsatz', 'Flächenberechnung', 'Mittelwert'],
          zusammenfassung: [
            'F ist Stammfunktion von f, wenn F′ = f. Potenzregel rückwärts: ∫xⁿ dx = xⁿ⁺¹/(n + 1) + C.',
            'Hauptsatz: ∫ₐᵇ f(x) dx = F(b) − F(a).',
            'Flächen unterhalb der x-Achse zählen negativ → an Nullstellen aufteilen und Beträge addieren.',
            'Fläche zwischen zwei Graphen: ∫ₐᵇ |f(x) − g(x)| dx zwischen den Schnittstellen.',
            'Mittelwert einer Funktion auf [a; b]: 1/(b − a) · ∫ₐᵇ f(x) dx.',
            'Anwendung: Integral der Änderungsrate = Gesamtänderung (z. B. Zufluss → Wassermenge).',
          ],
        },
      ],
      13: [
        {
          titel: 'Vektorgeometrie: Geraden und Ebenen',
          inhalte: ['Vektoren', 'Geradengleichung', 'Ebenengleichung', 'Lagebeziehungen'],
          zusammenfassung: [
            'Vektor AB = B − A. Länge: |v| = √(v₁² + v₂² + v₃²).',
            'Skalarprodukt: a·b = a₁b₁ + a₂b₂ + a₃b₃; a·b = 0 ⇔ orthogonal. Winkel: cos α = (a·b)/(|a|·|b|).',
            'Gerade: x = p + t·u (Stützvektor p, Richtungsvektor u).',
            'Ebene: Parameterform x = p + r·u + s·v, Koordinatenform ax₁ + bx₂ + cx₃ = d, Normalenvektor n = (a, b, c). Kreuzprodukt u × v liefert n.',
            'Gerade–Gerade: identisch, parallel, schneidend oder windschief (Richtungsvektoren prüfen, dann gleichsetzen).',
            'Gerade–Ebene: Gerade in Koordinatenform einsetzen → eine Lösung (Schnittpunkt), keine (parallel), unendlich viele (liegt in der Ebene).',
          ],
        },
        {
          titel: 'Abstände und Winkel',
          inhalte: ['Hessesche Normalform', 'Lotfußpunkt', 'Schnittwinkel'],
          zusammenfassung: [
            'Abstand Punkt–Ebene mit HNF: d = |a·p₁ + b·p₂ + c·p₃ − d| / |n|.',
            'Abstand Punkt–Gerade: Lotfußpunkt F über (F − P)·u = 0 bestimmen, dann |PF|.',
            'Winkel Gerade–Ebene: sin α = |u·n| / (|u|·|n|). Winkel Ebene–Ebene: cos α = |n₁·n₂| / (|n₁|·|n₂|).',
            'Spiegelung eines Punktes an einer Ebene: Lotgerade durch P, Lotfußpunkt F, P′ = P + 2·(F − P).',
          ],
        },
        {
          titel: 'Matrizen und Wirtschaftsmathematik (v. a. WG-Profil)',
          inhalte: ['Matrizenrechnung', 'Materialverflechtung', 'Leontief-Modell', 'Inverse'],
          zusammenfassung: [
            'Matrizenmultiplikation A·B nur, wenn Spaltenzahl von A = Zeilenzahl von B; Zeile mal Spalte.',
            'Mehrstufige Produktion: Rohstoff-Endprodukt-Matrix = Rohstoff-Zwischenprodukt-Matrix · Zwischenprodukt-Endprodukt-Matrix.',
            'Inverse A⁻¹ mit A·A⁻¹ = E; berechnen mit dem Gauß-Jordan-Verfahren [A | E] → [E | A⁻¹].',
            'Leontief-Modell: x = A·x + y ⇒ (E − A)·x = y ⇒ x = (E − A)⁻¹·y (x: Produktion, y: Marktabgabe/Konsum).',
            'Übergangsmatrizen (Populationen, Marktanteile): Zustand nach n Schritten vₙ = Mⁿ·v₀; stationäre Verteilung: M·v = v.',
          ],
        },
        {
          titel: 'Stochastik',
          inhalte: ['Baumdiagramm', 'Bernoulli-Kette', 'Binomialverteilung', 'Erwartungswert'],
          zusammenfassung: [
            'Pfadregeln: Wahrscheinlichkeiten entlang eines Pfades multiplizieren, verschiedene Pfade addieren.',
            'Gegenereignis: P(Ā) = 1 − P(A) – ideal für „mindestens eins“.',
            'Bernoulli-Kette: n unabhängige Versuche mit Trefferwahrscheinlichkeit p. P(X = k) = (n über k)·pᵏ·(1 − p)ⁿ⁻ᵏ.',
            'Erwartungswert Binomialverteilung: μ = n·p, Standardabweichung σ = √(n·p·(1 − p)).',
            'Allgemein: E(X) = Σ xᵢ·P(X = xᵢ). Faires Spiel: Erwartungswert des Gewinns = 0.',
            'Kumulierte Wahrscheinlichkeiten P(X ≤ k) mit dem Taschenrechner (binomcdf) bestimmen.',
          ],
        },
      ],
    },
  },
  {
    id: 'deutsch',
    name: 'Deutsch',
    klassen: {
      11: [
        {
          titel: 'Erzähltexte analysieren',
          inhalte: ['Kurzgeschichte', 'Erzählperspektive', 'Figurencharakterisierung'],
          zusammenfassung: [
            'Einleitungssatz: Autor, Titel, Textsorte, Erscheinungsjahr, Thema.',
            'Erzählinstanz: Ich-Erzähler oder Er/Sie-Erzähler; Erzählverhalten auktorial, personal oder neutral.',
            'Zeitgestaltung: zeitdeckend, zeitraffend, zeitdehnend; Rückblenden und Vorausdeutungen.',
            'Kurzgeschichte: unvermittelter Einstieg, offenes Ende, Alltagssituation, Wendepunkt, alltägliche Sprache.',
            'Deutung immer am Text belegen (Zitat mit Zeilenangabe) und die Wirkung der sprachlichen Mittel erklären.',
          ],
        },
        {
          titel: 'Argumentieren und Erörtern',
          inhalte: ['Argumentaufbau', 'lineare und dialektische Erörterung', 'Sachtextanalyse'],
          zusammenfassung: [
            'Argument = These + Begründung + Beleg/Beispiel (+ Schlussfolgerung).',
            'Lineare Erörterung: eine Position, Argumente steigernd angeordnet (schwächstes zuerst).',
            'Dialektische Erörterung: Pro und Kontra gegenüberstellen, eigene Position im Schluss begründen.',
            'Sachtextanalyse: Thema, Intention, Argumentationsstruktur, sprachliche Mittel und ihre Wirkung.',
            'Überleitungen („Darüber hinaus“, „Dem steht entgegen“, „Folglich“) sorgen für roten Faden.',
          ],
        },
        {
          titel: 'Sprache und Kommunikation',
          inhalte: ['Watzlawick', 'Schulz von Thun', 'Kommunikationsstörungen'],
          zusammenfassung: [
            'Watzlawick: Man kann nicht nicht kommunizieren; jede Nachricht hat Inhalts- und Beziehungsaspekt; Kommunikation ist symmetrisch oder komplementär.',
            'Schulz von Thun – Vier-Seiten-Modell: Sachinhalt, Selbstkundgabe, Beziehung, Appell („vier Ohren“ beim Empfänger).',
            'Störungen entstehen, wenn Sender und Empfänger unterschiedliche Seiten betonen.',
            'Nonverbale (Mimik, Gestik) und paraverbale (Tonfall, Lautstärke) Signale prägen die Wirkung.',
          ],
        },
        {
          titel: 'Drama – Grundlagen',
          inhalte: ['Aufbau', 'geschlossenes/offenes Drama', 'Szenenanalyse'],
          zusammenfassung: [
            'Freytags Pyramide (5 Akte): Exposition, steigende Handlung, Höhepunkt/Peripetie, fallende Handlung/retardierendes Moment, Katastrophe/Lösung.',
            'Geschlossenes Drama: Einheit von Ort, Zeit und Handlung, strenger Aufbau. Offenes Drama: lose Szenenfolge, viele Orte.',
            'Szenenanalyse: Einordnung in den Gesamtzusammenhang, Gesprächsverlauf, Redeanteile, Figurenkonstellation, sprachliche Gestaltung.',
            'Monolog, Dialog, Beiseitesprechen, Regieanweisungen gezielt deuten.',
          ],
        },
      ],
      12: [
        {
          titel: 'Literaturepochen: Aufklärung bis Romantik',
          inhalte: ['Aufklärung', 'Sturm und Drang', 'Klassik', 'Romantik'],
          zusammenfassung: [
            'Aufklärung (ca. 1720–1800): Vernunft, Toleranz, Kant: „Habe Mut, dich deines eigenen Verstandes zu bedienen!“ – Lessing („Nathan der Weise“).',
            'Sturm und Drang (ca. 1767–1785): Gefühl, Genie, Rebellion gegen Regeln – junger Goethe („Werther“), Schiller („Die Räuber“).',
            'Weimarer Klassik (ca. 1786–1805): Harmonie, Humanität, Maß – Goethe („Iphigenie“, „Faust I“), Schiller.',
            'Romantik (ca. 1795–1840): Sehnsucht, Natur, Traum, Fantasie, Flucht aus dem Alltag – Eichendorff, Novalis, E.T.A. Hoffmann.',
            'Epochen immer mit dem Werk verknüpfen: typische Merkmale am Text nachweisen.',
          ],
        },
        {
          titel: 'Lyrik analysieren',
          inhalte: ['Metrum', 'Reimschema', 'rhetorische Mittel'],
          zusammenfassung: [
            'Formale Analyse: Strophen, Verse, Reimschema (Paarreim aabb, Kreuzreim abab, umarmender Reim abba), Metrum (Jambus, Trochäus, Daktylus, Anapäst), Kadenz.',
            'Lyrisches Ich ≠ Autor.',
            'Stilmittel: Metapher, Personifikation, Vergleich, Alliteration, Anapher, Enjambement, Antithese, Chiasmus, Synästhesie.',
            'Form und Inhalt verbinden: Wie unterstützt die Form die Aussage?',
            'Gedichtvergleich: gemeinsames Motiv, Gemeinsamkeiten und Unterschiede, epochentypische Bezüge.',
          ],
        },
        {
          titel: 'Pflichtlektüre und Werkinterpretation',
          inhalte: ['Figurenkonstellation', 'Motive', 'Interpretationsaufsatz'],
          zusammenfassung: [
            'Die Pflichtlektüren werden vom Kultusministerium für jeden Abiturjahrgang festgelegt – aktuelle Liste bei der Lehrkraft erfragen.',
            'Zu jedem Werk sichern: Inhalt pro Kapitel/Akt, Figurenkonstellation, zentrale Motive, Epoche, Schlüsselstellen mit Zitaten.',
            'Interpretationsaufsatz: Einleitung – Einordnung der Textstelle – Analyse von Inhalt, Sprache, Form – Deutung – Schluss mit Bezug zum Gesamtwerk.',
            'Werkvergleich: gemeinsamer Aspekt (z. B. Freiheit, Schuld, Identität) als Leitfrage.',
          ],
        },
        {
          titel: 'Textgebundene Erörterung',
          inhalte: ['Sachtext', 'Thesen prüfen', 'Stellungnahme'],
          zusammenfassung: [
            'Teil 1: Sachtext wiedergeben und Argumentation analysieren (Thesen, Argumente, Strategie, Sprache).',
            'Teil 2: Kernthese(n) kritisch prüfen – zustimmen, widersprechen oder differenzieren – mit eigenen Argumenten und Beispielen.',
            'Autor korrekt wiedergeben: Konjunktiv I für indirekte Rede („Der Autor behauptet, es sei …“).',
          ],
        },
      ],
      13: [
        {
          titel: 'Literaturepochen: Realismus bis Gegenwart',
          inhalte: ['Realismus', 'Naturalismus', 'Expressionismus', 'Nachkriegsliteratur'],
          zusammenfassung: [
            'Poetischer Realismus (ca. 1848–1890): Wirklichkeit „verklärt“ darstellen, Bürgertum – Fontane, Keller, Storm.',
            'Naturalismus (ca. 1880–1900): exakte Abbildung sozialer Missstände, Milieu und Vererbung – Hauptmann.',
            'Expressionismus (ca. 1910–1925): Großstadt, Weltkrieg, Ich-Zerfall, drastische Bilder – Heym, Trakl, van Hoddis.',
            'Neue Sachlichkeit / Exilliteratur / Nachkriegsliteratur (Trümmerliteratur, Borchert, Böll).',
            'Gegenwartsliteratur: Identität, Migration, Digitalisierung, Erinnerungskultur.',
          ],
        },
        {
          titel: 'Sprache, Medien und Gesellschaft',
          inhalte: ['Sprachwandel', 'Jugendsprache', 'Medienkritik'],
          zusammenfassung: [
            'Ursachen für Sprachwandel: Kontakt zu anderen Sprachen (Anglizismen), Technik, gesellschaftlicher Wandel, Sprachökonomie.',
            'Sprachvarietäten: Standardsprache, Dialekt, Soziolekt (z. B. Jugendsprache), Fachsprache.',
            'Gendergerechte Sprache: Argumente zu Sichtbarkeit versus Lesbarkeit sachlich abwägen.',
            'Medien: Filterblasen, Fake News, Einfluss sozialer Netzwerke auf Meinungsbildung.',
          ],
        },
        {
          titel: 'Abitur-Schreibformen',
          inhalte: ['Interpretation', 'Werkvergleich', 'Erörterung', 'materialgestütztes Schreiben'],
          zusammenfassung: [
            'Operatoren genau lesen: „analysieren“, „interpretieren“, „erörtern“, „vergleichen“, „beurteilen“ verlangen jeweils anderes.',
            'Gliederung vorab erstellen (ca. 15–20 min), Zeit für Korrekturlesen einplanen.',
            'Materialgestütztes Schreiben: Materialien auswerten, adressatengerecht einen eigenen Text (z. B. Kommentar, Essay) verfassen.',
            'Zitiertechnik: wörtliche Zitate mit Anführungszeichen und Zeilenangabe, Auslassungen mit […].',
          ],
        },
      ],
    },
  },
  {
    id: 'englisch',
    name: 'Englisch',
    klassen: {
      11: [
        {
          titel: 'Grammar review',
          inhalte: ['Tenses', 'Conditionals', 'Passive', 'Reported speech'],
          zusammenfassung: [
            'Simple present: Gewohnheiten/Fakten; present progressive: gerade jetzt. Simple past: abgeschlossen in der Vergangenheit (yesterday, ago); present perfect: Bezug zur Gegenwart (already, yet, since, for).',
            'If-clauses: Type 1 if + present → will; Type 2 if + past → would; Type 3 if + past perfect → would have + past participle.',
            'Passive: form of be + past participle („The report was written by …“).',
            'Reported speech: Zeiten eine Stufe zurück (is → was, will → would), Orts-/Zeitangaben anpassen (here → there, tomorrow → the next day).',
            'Gerund vs. infinitive: enjoy/avoid + -ing; want/decide + to.',
          ],
        },
        {
          titel: 'Text production: summary, comment, formal letter',
          inhalte: ['Summary', 'Comment', 'Formal letter/e-mail'],
          zusammenfassung: [
            'Summary: simple present, eigene Worte, keine Zitate, keine Meinung; Einleitungssatz mit Titel, Autor, Textsorte, Thema.',
            'Comment: introduction (thesis) – arguments with examples – conclusion (own opinion). Linking words: furthermore, however, therefore, on the one hand … on the other hand.',
            'Formal letter: Dear Sir or Madam … Yours faithfully / Dear Mr Smith … Yours sincerely. No contractions.',
          ],
        },
        {
          titel: 'Growing up and identity',
          inhalte: ['Teenage life', 'Social media', 'Relationships'],
          zusammenfassung: [
            'Useful vocabulary: peer pressure, self-esteem, to fit in, role model, generation gap, coming of age.',
            'Social media: connectivity vs. cyberbullying, FOMO, filter bubbles, screen time.',
            'Typische Aufgaben: Figuren in Kurzgeschichten charakterisieren (direct/indirect characterisation).',
          ],
        },
      ],
      12: [
        {
          titel: 'The USA – the American Dream',
          inhalte: ['American Dream', 'Political system', 'Diversity'],
          zusammenfassung: [
            'American Dream: success through hard work, freedom, equal opportunity – critique: inequality, racism, healthcare costs.',
            'Political system: separation of powers – President (executive), Congress = Senate + House of Representatives (legislative), Supreme Court (judicial); checks and balances.',
            'Melting pot vs. salad bowl; civil rights movement (Martin Luther King Jr.), Black Lives Matter.',
            'Key vocabulary: immigration, upward mobility, polarisation, swing state, gun control.',
          ],
        },
        {
          titel: 'Globalisation',
          inhalte: ['Economic globalisation', 'Global players', 'Working conditions'],
          zusammenfassung: [
            'Globalisation = increasing interconnection of economies, cultures and politics worldwide.',
            'Pros: cheaper goods, economic growth, cultural exchange. Cons: exploitation (sweatshops), outsourcing, environmental damage, loss of cultural diversity.',
            'Fair trade, corporate social responsibility and supply chain laws as responses.',
          ],
        },
        {
          titel: 'Analysing fiction and non-fiction',
          inhalte: ['Stylistic devices', 'Narrative perspective', 'Mediation'],
          zusammenfassung: [
            'Stylistic devices: metaphor, simile, alliteration, rhetorical question, enumeration, irony, hyperbole – always explain the effect.',
            'Narrative perspective: first-person narrator, third-person limited/omniscient narrator.',
            'Mediation: deutschen Text sinngemäß und adressatengerecht auf Englisch wiedergeben – nicht Wort für Wort übersetzen.',
          ],
        },
      ],
      13: [
        {
          titel: 'Science, technology and ethics',
          inhalte: ['Artificial intelligence', 'Genetic engineering', 'Digital society'],
          zusammenfassung: [
            'AI: chances (medicine, efficiency) vs. risks (job loss, bias, surveillance, deepfakes).',
            'Genetic engineering: designer babies, CRISPR, ethical boundaries.',
            'Vocabulary: to raise ethical concerns, privacy, data protection, automation, accountability.',
          ],
        },
        {
          titel: 'Environment and sustainability',
          inhalte: ['Climate change', 'Renewable energy', 'Activism'],
          zusammenfassung: [
            'Climate change: greenhouse effect, carbon footprint, extreme weather, rising sea levels.',
            'Solutions: renewable energy, sustainable consumption, Paris Agreement (1.5 °C goal).',
            'Activism: Fridays for Future, civil disobedience – arguments for and against.',
          ],
        },
        {
          titel: 'Abitur skills',
          inhalte: ['Listening', 'Reading', 'Writing', 'Oral exam'],
          zusammenfassung: [
            'Operators: outline/describe (sachlich wiedergeben), analyse/examine (untersuchen), comment/assess/discuss (bewerten).',
            'Write a clear structure: introduction – main part in paragraphs – conclusion; use topic sentences.',
            'Die Pflichtlektüre (vom Land festgelegt) gründlich vorbereiten: plot, characters, themes, key quotes.',
            'Communication test/oral exam: express opinions, react to partner, use phrases like „I see your point, but …“.',
          ],
        },
      ],
    },
  },
  {
    id: 'ggk',
    name: 'Geschichte mit Gemeinschaftskunde',
    klassen: {
      11: [
        {
          titel: 'Politisches System der Bundesrepublik',
          inhalte: ['Grundgesetz', 'Verfassungsorgane', 'Wahlen', 'Gewaltenteilung'],
          zusammenfassung: [
            'Grundgesetz (1949): Grundrechte (Art. 1–19), Art. 1 Menschenwürde; Art. 20: Demokratie, Rechtsstaat, Sozialstaat, Bundesstaat. Ewigkeitsklausel Art. 79 (3).',
            'Verfassungsorgane: Bundestag (Gesetzgebung, wählt Kanzler), Bundesrat (Länder), Bundesregierung, Bundespräsident, Bundesverfassungsgericht.',
            'Bundestagswahl: Erststimme (Wahlkreiskandidat), Zweitstimme (Partei, entscheidet Sitzverteilung); 5-%-Hürde.',
            'Gewaltenteilung: Legislative, Exekutive, Judikative; zusätzlich vertikale Gewaltenteilung (Bund, Länder, Kommunen).',
          ],
        },
        {
          titel: 'Französische Revolution und Entstehung der Demokratie',
          inhalte: ['Ursachen', 'Menschenrechte', 'Verlauf'],
          zusammenfassung: [
            'Ursachen: Ständegesellschaft, Staatsverschuldung, Ideen der Aufklärung (Montesquieu, Rousseau).',
            '1789: Generalstände → Nationalversammlung, Sturm auf die Bastille (14. Juli), Erklärung der Menschen- und Bürgerrechte.',
            'Radikalisierung: Schreckensherrschaft der Jakobiner (Robespierre), danach Direktorium und Napoleon (1799).',
            'Bedeutung: Freiheit, Gleichheit, Brüderlichkeit als Grundlagen moderner Demokratien.',
          ],
        },
        {
          titel: 'Industrialisierung und soziale Frage',
          inhalte: ['Industrielle Revolution', 'Arbeiterbewegung', 'Sozialgesetzgebung'],
          zusammenfassung: [
            'Beginn in England (Dampfmaschine), in Deutschland ab ca. 1835 (erste Eisenbahn Nürnberg–Fürth).',
            'Soziale Frage: Kinderarbeit, lange Arbeitszeiten, Wohnungselend, keine Absicherung.',
            'Lösungsansätze: Gewerkschaften, SPD, kirchliche Initiativen, Marx/Engels (Kommunistisches Manifest 1848).',
            'Bismarcks Sozialgesetze: Kranken- (1883), Unfall- (1884), Invaliditäts- und Altersversicherung (1889) – Grundlage des Sozialstaats.',
          ],
        },
      ],
      12: [
        {
          titel: 'Weimarer Republik',
          inhalte: ['Verfassung', 'Krisenjahre', 'Scheitern'],
          zusammenfassung: [
            'Novemberrevolution 1918, Ausrufung der Republik, Weimarer Verfassung 1919.',
            'Strukturelle Schwächen: Art. 48 (Notverordnungen), starker Reichspräsident, Verhältniswahl ohne Sperrklausel, Dolchstoßlegende.',
            'Krisen 1923: Ruhrbesetzung, Hyperinflation, Hitlerputsch. „Goldene Zwanziger“ 1924–1929 (Stresemann).',
            'Weltwirtschaftskrise ab 1929 → Massenarbeitslosigkeit, Präsidialkabinette, Aufstieg der NSDAP, 30.01.1933 Hitler Reichskanzler.',
          ],
        },
        {
          titel: 'Nationalsozialismus und Zweiter Weltkrieg',
          inhalte: ['Machtergreifung', 'Ideologie', 'Holocaust', 'Krieg'],
          zusammenfassung: [
            'Gleichschaltung: Reichstagsbrandverordnung, Ermächtigungsgesetz (März 1933), Parteienverbot, Führerstaat.',
            'Ideologie: Rassismus, Antisemitismus, „Volksgemeinschaft“, „Lebensraum im Osten“.',
            'Judenverfolgung: Nürnberger Gesetze 1935, Novemberpogrom 1938, Wannseekonferenz 1942, Holocaust mit ca. 6 Mio. ermordeten Juden.',
            'Zweiter Weltkrieg 1939–1945: Überfall auf Polen, Vernichtungskrieg gegen die Sowjetunion, bedingungslose Kapitulation am 8. Mai 1945.',
            'Widerstand: Weiße Rose, 20. Juli 1944 (Stauffenberg).',
          ],
        },
        {
          titel: 'Europäische Union',
          inhalte: ['Entstehung', 'Organe', 'Aktuelle Herausforderungen'],
          zusammenfassung: [
            'Von der Montanunion (1951) über die EWG (1957, Römische Verträge) zur EU (Vertrag von Maastricht 1992, Lissabon 2009).',
            'Organe: Europäisches Parlament, Rat der EU, Europäische Kommission, Europäischer Rat, EuGH, EZB.',
            'Gesetzgebung: Kommission schlägt vor, Parlament und Rat beschließen (ordentliches Gesetzgebungsverfahren).',
            'Herausforderungen: Brexit, Migration, Rechtsstaatlichkeit, Klimaschutz, Erweiterung.',
          ],
        },
      ],
      13: [
        {
          titel: 'Deutschland nach 1945 und der Kalte Krieg',
          inhalte: ['Besatzungszeit', 'Teilung', 'DDR', 'Wiedervereinigung'],
          zusammenfassung: [
            'Potsdamer Konferenz 1945: Entnazifizierung, Entmilitarisierung, Demokratisierung, Dezentralisierung; vier Besatzungszonen.',
            'Kalter Krieg: Truman-Doktrin, Marshallplan, Berlin-Blockade 1948/49 → Gründung von BRD und DDR 1949.',
            'DDR: SED-Diktatur, Stasi, 17. Juni 1953, Mauerbau 1961.',
            'Ostpolitik (Brandt, „Wandel durch Annäherung“), Friedliche Revolution 1989, Mauerfall 9.11.1989, Wiedervereinigung 3.10.1990.',
          ],
        },
        {
          titel: 'Internationale Politik und Friedenssicherung',
          inhalte: ['UNO', 'NATO', 'Konflikte'],
          zusammenfassung: [
            'UNO (1945): Generalversammlung, Sicherheitsrat mit 5 ständigen Mitgliedern mit Vetorecht (USA, Russland, China, Frankreich, Großbritannien).',
            'NATO (1949): Verteidigungsbündnis, Art. 5 Beistandspflicht.',
            'Konfliktanalyse: Akteure, Ursachen, Interessen, Lösungsansätze (Diplomatie, Sanktionen, Blauhelm-Einsätze).',
            'Erweiterter Sicherheitsbegriff: Terrorismus, Cyberangriffe, Klimawandel, Migration.',
          ],
        },
        {
          titel: 'Soziale Marktwirtschaft und Sozialstaat',
          inhalte: ['Wirtschaftsordnung', 'Sozialversicherungen', 'Gerechtigkeit'],
          zusammenfassung: [
            'Soziale Marktwirtschaft (Ludwig Erhard): freier Markt + sozialer Ausgleich + Wettbewerbsschutz.',
            'Fünf Säulen der Sozialversicherung: Kranken-, Renten-, Arbeitslosen-, Pflege-, Unfallversicherung.',
            'Prinzipien: Solidaritäts-, Subsidiaritäts-, Versicherungs-, Fürsorgeprinzip.',
            'Herausforderungen: demografischer Wandel, Generationengerechtigkeit, Fachkräftemangel.',
          ],
        },
      ],
    },
  },
  {
    id: 'vbl',
    name: 'Volks- und Betriebswirtschaftslehre (WG)',
    klassen: {
      11: [
        {
          titel: 'Wirtschaftliche Grundbegriffe',
          inhalte: ['Bedürfnisse', 'Güter', 'ökonomisches Prinzip', 'Wirtschaftskreislauf'],
          zusammenfassung: [
            'Bedürfnisse (Maslow-Pyramide) → Bedarf (mit Kaufkraft) → Nachfrage (am Markt wirksam).',
            'Ökonomisches Prinzip: Maximalprinzip (mit gegebenen Mitteln maximaler Erfolg) oder Minimalprinzip (Ziel mit minimalen Mitteln).',
            'Produktionsfaktoren VWL: Arbeit, Boden, Kapital (+ Wissen).',
            'Einfacher Wirtschaftskreislauf: Haushalte ↔ Unternehmen (Güterstrom und Geldstrom); erweitert um Staat, Banken, Ausland.',
          ],
        },
        {
          titel: 'Rechtliche Grundlagen',
          inhalte: ['Rechts- und Geschäftsfähigkeit', 'Kaufvertrag', 'Leistungsstörungen'],
          zusammenfassung: [
            'Geschäftsfähigkeit: unter 7 geschäftsunfähig, 7–17 beschränkt (Taschengeldparagraf § 110 BGB), ab 18 voll.',
            'Kaufvertrag: zwei übereinstimmende Willenserklärungen (Antrag + Annahme); Pflichten aus § 433 BGB.',
            'Mangelhafte Lieferung: Nacherfüllung vorrangig (Nachbesserung oder Neulieferung), dann Rücktritt, Minderung, Schadensersatz.',
            'Lieferungs- und Zahlungsverzug: Fälligkeit, Mahnung (sofern nötig), Verschulden.',
          ],
        },
        {
          titel: 'Unternehmensformen',
          inhalte: ['Einzelunternehmen', 'OHG/KG', 'GmbH', 'AG'],
          zusammenfassung: [
            'Einzelunternehmen: ein Inhaber, haftet unbeschränkt.',
            'OHG: alle Gesellschafter haften unbeschränkt, unmittelbar, solidarisch. KG: Komplementär (unbeschränkt) + Kommanditisten (nur mit Einlage).',
            'GmbH: Mindeststammkapital 25.000 €, Haftung nur mit Gesellschaftsvermögen; Organe: Geschäftsführung, Gesellschafterversammlung.',
            'AG: Grundkapital mind. 50.000 €, Organe: Vorstand, Aufsichtsrat, Hauptversammlung.',
          ],
        },
        {
          titel: 'Markt und Preisbildung',
          inhalte: ['Angebot und Nachfrage', 'Gleichgewichtspreis', 'Marktformen'],
          zusammenfassung: [
            'Nachfragekurve fällt, Angebotskurve steigt; Schnittpunkt = Gleichgewichtspreis und -menge.',
            'Preis über Gleichgewicht → Angebotsüberhang; darunter → Nachfrageüberhang.',
            'Verschiebung der Kurven z. B. durch Einkommen, Preise anderer Güter, Kosten, Technik.',
            'Marktformen: Polypol, Oligopol, Monopol. Konsumenten- und Produzentenrente.',
            'Staatliche Eingriffe: Höchstpreis (unter Gleichgewicht), Mindestpreis (darüber).',
          ],
        },
      ],
      12: [
        {
          titel: 'Kosten- und Leistungsrechnung',
          inhalte: ['Kostenarten', 'Break-even', 'Deckungsbeitrag'],
          zusammenfassung: [
            'Fixe Kosten (unabhängig von der Menge) und variable Kosten (steigen mit der Menge): K = Kf + kv·x.',
            'Deckungsbeitrag je Stück: db = p − kv. Gesamtdeckungsbeitrag DB = db·x; Gewinn = DB − Kf.',
            'Gewinnschwelle (Break-even): x = Kf / (p − kv).',
            'Kurzfristige Preisuntergrenze = kv; langfristige Preisuntergrenze = Stückkosten k = K/x.',
            'Zusatzauftrag annehmen, wenn db > 0 und Kapazität frei ist.',
          ],
        },
        {
          titel: 'Absatz und Marketing',
          inhalte: ['Marktforschung', 'Marketing-Mix', 'Produktlebenszyklus'],
          zusammenfassung: [
            'Marketing-Mix (4 P): Product, Price, Place, Promotion.',
            'Produktlebenszyklus: Einführung, Wachstum, Reife, Sättigung, Rückgang.',
            'Portfolio-Analyse (BCG-Matrix): Question Marks, Stars, Cash Cows, Poor Dogs.',
            'Preisstrategien: Hochpreis-, Niedrigpreis-, Penetrations-, Abschöpfungsstrategie.',
          ],
        },
        {
          titel: 'Investition und Finanzierung',
          inhalte: ['Investitionsrechnung', 'Eigen-/Fremdfinanzierung', 'Kredit'],
          zusammenfassung: [
            'Statische Verfahren: Kostenvergleich, Gewinnvergleich, Rentabilität (Gewinn / Ø Kapitaleinsatz), Amortisationsdauer.',
            'Innenfinanzierung (Gewinne, Abschreibungen) vs. Außenfinanzierung (Einlagen, Kredite).',
            'Kreditsicherheiten: Bürgschaft, Sicherungsübereignung, Grundschuld.',
            'Leasing vs. Kreditkauf: Liquidität, Kosten, Flexibilität vergleichen.',
          ],
        },
        {
          titel: 'Personal und Arbeitsrecht',
          inhalte: ['Arbeitsvertrag', 'Kündigung', 'Mitbestimmung'],
          zusammenfassung: [
            'Arbeitsvertrag: Pflichten von Arbeitgeber (Vergütung, Fürsorge) und Arbeitnehmer (Arbeitsleistung, Treue).',
            'Kündigungsfristen nach § 622 BGB; Kündigungsschutzgesetz ab 6 Monaten und mehr als 10 Beschäftigten.',
            'Betriebsrat: Mitbestimmungs-, Mitwirkungs- und Informationsrechte (Betriebsverfassungsgesetz).',
            'Tarifvertrag, Tarifautonomie, Streik und Aussperrung.',
          ],
        },
      ],
      13: [
        {
          titel: 'Konjunktur und Wirtschaftspolitik',
          inhalte: ['Konjunkturphasen', 'Magisches Viereck', 'Fiskalpolitik'],
          zusammenfassung: [
            'Konjunkturphasen: Aufschwung, Boom, Abschwung, Rezession/Depression.',
            'Magisches Viereck (Stabilitätsgesetz 1967): Preisniveaustabilität, hoher Beschäftigungsstand, außenwirtschaftliches Gleichgewicht, stetiges angemessenes Wachstum.',
            'Nachfrageorientiert (Keynes): antizyklische Fiskalpolitik, Staat erhöht Ausgaben in der Krise.',
            'Angebotsorientiert: Kostenentlastung der Unternehmen, Deregulierung, Steuersenkungen.',
            'BIP als Wachstumsmaß; Kritik: Umweltschäden, Hausarbeit und Verteilung nicht erfasst.',
          ],
        },
        {
          titel: 'Geld und Geldpolitik',
          inhalte: ['Inflation', 'EZB', 'Leitzins'],
          zusammenfassung: [
            'Inflation: anhaltender Anstieg des Preisniveaus, gemessen mit dem Verbraucherpreisindex (Warenkorb).',
            'Ursachen: Nachfragesog, Kostendruck (z. B. Energie), Geldmengenausweitung.',
            'EZB: vorrangiges Ziel Preisniveaustabilität (mittelfristig 2 % Inflation).',
            'Instrumente: Leitzinsen (Hauptrefinanzierungssatz), Offenmarktgeschäfte, Mindestreserve. Zinserhöhung dämpft Nachfrage und Inflation.',
          ],
        },
        {
          titel: 'Außenwirtschaft',
          inhalte: ['Zahlungsbilanz', 'Wechselkurse', 'Freihandel vs. Protektionismus'],
          zusammenfassung: [
            'Zahlungsbilanz: Leistungsbilanz (Handels-, Dienstleistungs-, Primär-, Sekundäreinkommen), Vermögensänderungsbilanz, Kapitalbilanz.',
            'Aufwertung des Euro: Importe billiger, Exporte teurer. Abwertung umgekehrt.',
            'Freihandel (Ricardo: komparative Kostenvorteile) vs. Protektionismus (Zölle, Quoten, Subventionen).',
            'WTO, EU-Binnenmarkt und Handelsabkommen als Rahmen.',
          ],
        },
        {
          titel: 'Jahresabschluss und Bilanzanalyse',
          inhalte: ['Bilanz', 'GuV', 'Kennzahlen'],
          zusammenfassung: [
            'Bilanz: Aktiva (Anlage- und Umlaufvermögen) = Passiva (Eigen- und Fremdkapital).',
            'GuV: Erträge − Aufwendungen = Jahresüberschuss/-fehlbetrag.',
            'Eigenkapitalquote = EK / Gesamtkapital · 100. Anlagendeckung I = EK / Anlagevermögen · 100.',
            'Liquidität 2. Grades = (flüssige Mittel + Forderungen) / kurzfristiges FK · 100 (Ziel ≥ 100 %).',
            'Eigenkapitalrentabilität = Gewinn / EK · 100.',
          ],
        },
      ],
    },
  },
  {
    id: 'informatik',
    name: 'Informatik / Informationstechnik (TG)',
    klassen: {
      11: [
        {
          titel: 'Zahlensysteme und Codierung',
          inhalte: ['Binär', 'Hexadezimal', 'Zeichencodierung'],
          zusammenfassung: [
            'Dezimal → Binär: fortlaufend durch 2 teilen, Reste von unten lesen. 13 = 1101₂.',
            'Hexadezimal: Ziffern 0–9, A–F; 4 Bit = 1 Hex-Ziffer (1111₂ = F₁₆).',
            '1 Byte = 8 Bit → 256 Werte (0–255). Zweierkomplement für negative Zahlen: invertieren + 1.',
            'Zeichencodierung: ASCII (7 Bit), Unicode/UTF-8 (variabel, 1–4 Byte).',
          ],
        },
        {
          titel: 'Algorithmen und Kontrollstrukturen',
          inhalte: ['Sequenz', 'Verzweigung', 'Schleife', 'Struktogramm'],
          zusammenfassung: [
            'Algorithmus: endliche, eindeutige Folge von Anweisungen zur Lösung eines Problems.',
            'Grundstrukturen: Sequenz, Verzweigung (if/else), Wiederholung (while, for).',
            'Darstellung als Struktogramm (Nassi-Shneiderman) oder Programmablaufplan.',
            'Variablen haben Datentypen: int, float, boolean, String.',
          ],
        },
        {
          titel: 'Programmieren – Grundlagen',
          inhalte: ['Funktionen', 'Arrays/Listen', 'Fehlersuche'],
          zusammenfassung: [
            'Funktionen/Methoden kapseln wiederverwendbaren Code, Parameter übergeben Werte, return gibt Ergebnis zurück.',
            'Arrays/Listen speichern mehrere Werte; Index beginnt bei 0.',
            'Typische Aufgaben: Summe, Mittelwert, Maximum, Suchen in einer Liste mit Schleifen.',
            'Fehlerarten: Syntaxfehler, Laufzeitfehler, logische Fehler – mit Schreibtischtest oder Debugger finden.',
          ],
        },
      ],
      12: [
        {
          titel: 'Objektorientierte Programmierung',
          inhalte: ['Klasse', 'Objekt', 'Kapselung', 'Vererbung', 'UML'],
          zusammenfassung: [
            'Klasse = Bauplan (Attribute + Methoden), Objekt = konkrete Instanz.',
            'Kapselung: Attribute private, Zugriff über Getter/Setter.',
            'Vererbung: Unterklasse übernimmt Attribute und Methoden der Oberklasse und kann sie überschreiben (Polymorphie).',
            'UML-Klassendiagramm: Name, Attribute (− private, + public), Methoden; Beziehungen: Assoziation, Aggregation, Komposition, Vererbung.',
          ],
        },
        {
          titel: 'Datenbanken und SQL',
          inhalte: ['ER-Modell', 'Relationenmodell', 'Normalisierung', 'SQL'],
          zusammenfassung: [
            'ER-Modell: Entitäten, Attribute, Beziehungen mit Kardinalitäten (1:1, 1:n, n:m).',
            'Umsetzung: Tabellen mit Primärschlüssel; Fremdschlüssel für Beziehungen, n:m über Zwischentabelle.',
            'Normalformen: 1. NF atomare Werte, 2. NF volle Abhängigkeit vom Schlüssel, 3. NF keine transitiven Abhängigkeiten.',
            'SQL: SELECT spalten FROM tabelle WHERE bedingung ORDER BY …; JOIN … ON …; GROUP BY mit COUNT/SUM/AVG; HAVING filtert Gruppen.',
          ],
        },
        {
          titel: 'Netzwerke',
          inhalte: ['OSI/TCP-IP', 'IP-Adressen', 'Protokolle'],
          zusammenfassung: [
            'TCP/IP-Modell: Anwendung (HTTP, DNS), Transport (TCP, UDP), Internet (IP), Netzzugang (Ethernet, WLAN).',
            'IPv4: 32 Bit, z. B. 192.168.1.10/24 → Netzanteil 24 Bit, 254 nutzbare Hosts.',
            'TCP: verbindungsorientiert, zuverlässig; UDP: verbindungslos, schnell (Streaming).',
            'DNS übersetzt Namen in IP-Adressen, DHCP vergibt Adressen automatisch.',
          ],
        },
      ],
      13: [
        {
          titel: 'Suchen und Sortieren',
          inhalte: ['Lineare/binäre Suche', 'Sortierverfahren', 'Laufzeit'],
          zusammenfassung: [
            'Lineare Suche O(n); binäre Suche O(log n), setzt sortierte Daten voraus.',
            'Bubble-, Selection-, Insertion-Sort: O(n²). Quick- und Mergesort: O(n log n) im Mittel.',
            'Rekursion: Funktion ruft sich selbst auf, braucht Abbruchbedingung.',
            'Laufzeit abschätzen: Wie wächst der Aufwand, wenn sich die Datenmenge verdoppelt?',
          ],
        },
        {
          titel: 'Softwareentwicklung und Projekte',
          inhalte: ['Vorgehensmodelle', 'Testen', 'Versionsverwaltung'],
          zusammenfassung: [
            'Wasserfallmodell (sequenziell) vs. agile Methoden (Scrum: Sprints, Product Backlog, Daily).',
            'Testen: Unit-Tests, Integrationstests, Black-Box vs. White-Box.',
            'Versionsverwaltung mit Git: commit, branch, merge.',
            'Pflichtenheft (Wie?) vs. Lastenheft (Was?).',
          ],
        },
        {
          titel: 'IT-Sicherheit, Kryptografie und Datenschutz',
          inhalte: ['Verschlüsselung', 'Hashing', 'DSGVO'],
          zusammenfassung: [
            'Symmetrisch (ein Schlüssel, z. B. AES) vs. asymmetrisch (öffentlicher + privater Schlüssel, z. B. RSA).',
            'Hashfunktionen (z. B. SHA-256) sind Einwegfunktionen; Passwörter werden gesalzen und gehasht gespeichert.',
            'Digitale Signatur: mit privatem Schlüssel signieren, mit öffentlichem prüfen.',
            'DSGVO: Datensparsamkeit, Zweckbindung, Auskunfts- und Löschrecht.',
          ],
        },
      ],
    },
  },
  {
    id: 'physik',
    name: 'Physik',
    klassen: {
      11: [
        {
          titel: 'Kinematik',
          inhalte: ['Geschwindigkeit', 'Beschleunigung', 'freier Fall'],
          zusammenfassung: [
            'Gleichförmige Bewegung: s = v·t.',
            'Gleichmäßig beschleunigt (aus Ruhe): v = a·t, s = ½·a·t², v² = 2·a·s.',
            'Freier Fall: a = g ≈ 9,81 m/s².',
            't-s- und t-v-Diagramme: Steigung im t-s-Diagramm = Geschwindigkeit, Fläche im t-v-Diagramm = Weg.',
          ],
        },
        {
          titel: 'Dynamik – Newtonsche Gesetze',
          inhalte: ['Trägheit', 'F = m·a', 'Actio = Reactio', 'Reibung'],
          zusammenfassung: [
            '1. Trägheitsgesetz: Ohne resultierende Kraft bleibt ein Körper in Ruhe oder gleichförmiger Bewegung.',
            '2. Grundgleichung: F = m·a (Einheit Newton: 1 N = 1 kg·m/s²).',
            '3. Wechselwirkung: actio = reactio.',
            'Gewichtskraft F_G = m·g; Reibungskraft F_R = μ·F_N.',
          ],
        },
        {
          titel: 'Energie, Arbeit und Leistung',
          inhalte: ['Energieerhaltung', 'Wirkungsgrad'],
          zusammenfassung: [
            'Arbeit W = F·s. Leistung P = W/t (Watt).',
            'Lageenergie E_pot = m·g·h, Bewegungsenergie E_kin = ½·m·v², Spannenergie E = ½·D·s².',
            'Energieerhaltung im abgeschlossenen System: Summe aller Energien bleibt konstant.',
            'Wirkungsgrad η = E_nutz / E_zu.',
          ],
        },
        {
          titel: 'Elektrizitätslehre – Grundlagen',
          inhalte: ['Stromkreis', 'Ohmsches Gesetz', 'Reihen-/Parallelschaltung'],
          zusammenfassung: [
            'Ohmsches Gesetz: U = R·I. Elektrische Leistung P = U·I.',
            'Reihenschaltung: I überall gleich, R_ges = R₁ + R₂, Spannungen addieren sich.',
            'Parallelschaltung: U überall gleich, 1/R_ges = 1/R₁ + 1/R₂, Ströme addieren sich.',
            'Elektrische Energie E = P·t (kWh).',
          ],
        },
      ],
      12: [
        {
          titel: 'Elektrisches Feld und Kondensator',
          inhalte: ['Feldstärke', 'Coulomb', 'Kapazität'],
          zusammenfassung: [
            'Elektrische Feldstärke E = F/q; im Plattenkondensator homogen: E = U/d.',
            'Coulomb-Gesetz: F = (1/(4πε₀))·q₁q₂/r².',
            'Kapazität C = Q/U; Plattenkondensator C = ε₀·ε_r·A/d. Energie W = ½·C·U².',
            'Auf- und Entladung: exponentieller Verlauf mit Zeitkonstante τ = R·C.',
          ],
        },
        {
          titel: 'Magnetisches Feld und Lorentzkraft',
          inhalte: ['Flussdichte', 'Lorentzkraft', 'Spule'],
          zusammenfassung: [
            'Lorentzkraft auf bewegte Ladung: F = q·v·B (senkrecht), Richtung mit Drei-Finger-Regel.',
            'Kraft auf stromdurchflossenen Leiter: F = I·l·B.',
            'Geladene Teilchen auf Kreisbahn: q·v·B = m·v²/r.',
            'Lange Spule: B = μ₀·μ_r·N·I/l.',
          ],
        },
        {
          titel: 'Elektromagnetische Induktion',
          inhalte: ['Induktionsgesetz', 'Lenzsche Regel', 'Generator', 'Transformator'],
          zusammenfassung: [
            'Induktion: Änderung des magnetischen Flusses Φ = B·A erzeugt Spannung: U_ind = −N·dΦ/dt.',
            'Lenzsche Regel: Der Induktionsstrom wirkt seiner Ursache entgegen (Minuszeichen).',
            'Generator: rotierende Spule → sinusförmige Wechselspannung.',
            'Idealer Transformator: U₁/U₂ = N₁/N₂, I₁/I₂ = N₂/N₁.',
          ],
        },
        {
          titel: 'Mechanische Schwingungen',
          inhalte: ['Federpendel', 'Fadenpendel', 'Resonanz'],
          zusammenfassung: [
            'Harmonische Schwingung: y(t) = ŷ·sin(ωt), ω = 2π/T = 2πf.',
            'Federpendel: T = 2π·√(m/D). Fadenpendel (kleine Auslenkung): T = 2π·√(l/g).',
            'Gedämpfte Schwingung: Amplitude nimmt exponentiell ab.',
            'Resonanz: Anregung mit Eigenfrequenz → maximale Amplitude.',
          ],
        },
      ],
      13: [
        {
          titel: 'Wellen und Interferenz',
          inhalte: ['Wellengleichung', 'Doppelspalt', 'Gitter'],
          zusammenfassung: [
            'c = λ·f. Transversal- und Longitudinalwellen.',
            'Interferenz: konstruktiv bei Gangunterschied Δs = k·λ, destruktiv bei Δs = (k + ½)·λ.',
            'Doppelspalt/Gitter: Maxima bei g·sin α = k·λ; für kleine Winkel sin α ≈ a/e.',
            'Stehende Wellen: Knoten und Bäuche, Abstand zweier Knoten λ/2.',
          ],
        },
        {
          titel: 'Quantenphysik',
          inhalte: ['Fotoeffekt', 'Photonen', 'Welle-Teilchen-Dualismus'],
          zusammenfassung: [
            'Photonenenergie E = h·f (h ≈ 6,626·10⁻³⁴ Js).',
            'Fotoeffekt: E_kin = h·f − W_A. Unterhalb der Grenzfrequenz keine Elektronen – unabhängig von der Intensität.',
            'De-Broglie-Wellenlänge: λ = h/p – auch Teilchen zeigen Interferenz (Elektronenbeugung).',
            'Heisenbergsche Unschärferelation: Δx·Δp ≥ h/(4π).',
          ],
        },
        {
          titel: 'Atom- und Kernphysik',
          inhalte: ['Energieniveaus', 'Radioaktivität', 'Halbwertszeit'],
          zusammenfassung: [
            'Atome haben diskrete Energieniveaus; Übergänge senden Photonen mit ΔE = h·f aus (Linienspektren).',
            'Strahlungsarten: α (Heliumkern), β⁻ (Elektron), γ (Photon).',
            'Zerfallsgesetz: N(t) = N₀·e^(−λt), Halbwertszeit T½ = ln 2 / λ.',
            'Kernspaltung und Kernfusion setzen Energie frei (Massendefekt, E = m·c²).',
          ],
        },
      ],
    },
  },
  {
    id: 'chemie',
    name: 'Chemie',
    klassen: {
      11: [
        {
          titel: 'Atombau und Periodensystem',
          inhalte: ['Protonen/Neutronen/Elektronen', 'Schalenmodell', 'PSE'],
          zusammenfassung: [
            'Kern aus Protonen (+) und Neutronen; Hülle aus Elektronen (−). Ordnungszahl = Protonenzahl.',
            'Isotope: gleiche Protonen-, unterschiedliche Neutronenzahl.',
            'Hauptgruppe = Zahl der Valenzelektronen; Periode = Zahl der Schalen.',
            'Edelgaskonfiguration (Oktettregel) erklärt Ionenbildung und Bindungen.',
          ],
        },
        {
          titel: 'Chemische Bindungen',
          inhalte: ['Ionenbindung', 'Elektronenpaarbindung', 'Metallbindung', 'zwischenmolekulare Kräfte'],
          zusammenfassung: [
            'Ionenbindung: Metall + Nichtmetall, große EN-Differenz (> 1,7), Ionengitter.',
            'Elektronenpaarbindung: Nichtmetalle; polar bei EN-Differenz ca. 0,4–1,7.',
            'Metallbindung: Atomrümpfe im Elektronengas → Leitfähigkeit.',
            'Zwischenmolekular: Van-der-Waals < Dipol-Dipol < Wasserstoffbrücken → bestimmen Siede- und Schmelztemperatur.',
          ],
        },
        {
          titel: 'Stöchiometrie',
          inhalte: ['Stoffmenge', 'molare Masse', 'Konzentration'],
          zusammenfassung: [
            'n = m/M (mol). M aus dem PSE ablesen.',
            'Molares Gasvolumen bei Normbedingungen ≈ 22,4 L/mol.',
            'Stoffmengenkonzentration c = n/V (mol/L).',
            'Rechnen mit Reaktionsgleichungen: Stoffmengenverhältnis aus den Koeffizienten.',
          ],
        },
        {
          titel: 'Redoxreaktionen',
          inhalte: ['Oxidation', 'Reduktion', 'Oxidationszahlen'],
          zusammenfassung: [
            'Oxidation = Elektronenabgabe (Oxidationszahl steigt), Reduktion = Elektronenaufnahme (Oxidationszahl sinkt).',
            'Redoxgleichungen: Teilgleichungen aufstellen, Elektronen ausgleichen, addieren.',
            'Redoxreihe der Metalle: unedle Metalle geben leichter Elektronen ab.',
          ],
        },
      ],
      12: [
        {
          titel: 'Organische Chemie – Stoffklassen',
          inhalte: ['Alkane', 'Alkohole', 'Aldehyde/Ketone', 'Carbonsäuren', 'Ester'],
          zusammenfassung: [
            'Alkane CₙH₂ₙ₊₂ (Einfachbindungen), Alkene mit C=C, Alkine mit C≡C.',
            'Funktionelle Gruppen: Hydroxy −OH (Alkohole), Carbonyl C=O (Aldehyde/Ketone), Carboxy −COOH (Carbonsäuren).',
            'Oxidation: primärer Alkohol → Aldehyd → Carbonsäure; sekundärer Alkohol → Keton.',
            'Veresterung: Alkohol + Carbonsäure ⇌ Ester + Wasser (Kondensation, säurekatalysiert).',
            'Nomenklatur: längste Kette, Nummerierung, Substituenten alphabetisch.',
          ],
        },
        {
          titel: 'Reaktionsgeschwindigkeit und chemisches Gleichgewicht',
          inhalte: ['Kinetik', 'Katalysator', 'MWG', 'Le Chatelier'],
          zusammenfassung: [
            'Reaktionsgeschwindigkeit steigt mit Temperatur, Konzentration, Zerteilungsgrad und Katalysator (senkt Aktivierungsenergie).',
            'Dynamisches Gleichgewicht: Hin- und Rückreaktion gleich schnell.',
            'Massenwirkungsgesetz für aA + bB ⇌ cC + dD: K = [C]ᶜ·[D]ᵈ / ([A]ᵃ·[B]ᵇ).',
            'Le Chatelier: Das Gleichgewicht weicht einem Zwang aus (Konzentration, Druck, Temperatur). Katalysatoren verschieben es nicht.',
          ],
        },
        {
          titel: 'Säuren und Basen',
          inhalte: ['Brønsted', 'pH-Wert', 'Titration', 'Puffer'],
          zusammenfassung: [
            'Brønsted: Säure = Protonendonator, Base = Protonenakzeptor; korrespondierende Säure-Base-Paare.',
            'pH = −log c(H₃O⁺); pH + pOH = 14 (bei 25 °C).',
            'Starke Säuren protolysieren vollständig; schwache: pH über pKs berechnen.',
            'Titration: Äquivalenzpunkt bestimmen, c(Probe) aus Verbrauch der Maßlösung.',
            'Puffer (schwache Säure + ihre korrespondierende Base) hält den pH-Wert stabil; Henderson-Hasselbalch: pH = pKs + log(c(A⁻)/c(HA)).',
          ],
        },
      ],
      13: [
        {
          titel: 'Elektrochemie',
          inhalte: ['Galvanische Zelle', 'Spannungsreihe', 'Elektrolyse', 'Akkus'],
          zusammenfassung: [
            'Galvanische Zelle: Anode (Oxidation, Minuspol), Kathode (Reduktion, Pluspol), Salzbrücke/Diaphragma.',
            'Zellspannung ΔE = E(Kathode) − E(Anode) aus der elektrochemischen Spannungsreihe (Standardpotenziale).',
            'Elektrolyse: erzwungene Redoxreaktion durch äußere Spannung; Anode ist hier Pluspol.',
            'Batterien, Akkus (z. B. Lithium-Ionen) und Brennstoffzellen als Anwendungen.',
          ],
        },
        {
          titel: 'Kunststoffe',
          inhalte: ['Polymerisation', 'Polykondensation', 'Thermoplaste/Duroplaste'],
          zusammenfassung: [
            'Polymerisation: Monomere mit C=C verbinden sich (z. B. Ethen → Polyethylen).',
            'Polykondensation: Monomere mit zwei funktionellen Gruppen, Abspaltung kleiner Moleküle (z. B. Polyester, Polyamide).',
            'Thermoplaste (verformbar, linear), Duroplaste (stark vernetzt, hart), Elastomere (weitmaschig vernetzt, elastisch).',
            'Recycling: werkstofflich, rohstofflich, energetisch; Mikroplastik als Umweltproblem.',
          ],
        },
        {
          titel: 'Naturstoffe',
          inhalte: ['Kohlenhydrate', 'Fette', 'Proteine'],
          zusammenfassung: [
            'Kohlenhydrate: Monosaccharide (Glucose), Disaccharide (Saccharose), Polysaccharide (Stärke, Cellulose).',
            'Fette: Ester aus Glycerin und drei Fettsäuren; ungesättigte Fettsäuren enthalten C=C.',
            'Proteine: Aminosäuren über Peptidbindungen verknüpft; Primär-, Sekundär-, Tertiär-, Quartärstruktur.',
            'Nachweise: Fehling/Tollens (reduzierende Zucker), Iod-Stärke-Reaktion, Biuret (Proteine).',
          ],
        },
      ],
    },
  },
  {
    id: 'biologie',
    name: 'Biologie',
    klassen: {
      11: [
        {
          titel: 'Zellbiologie',
          inhalte: ['Zellorganellen', 'Pro-/Eukaryoten', 'Mikroskopie'],
          zusammenfassung: [
            'Prokaryoten (Bakterien): kein Zellkern, Ringchromosom, Plasmide. Eukaryoten: Zellkern und Organellen.',
            'Organellen: Zellkern (Erbinformation), Mitochondrien (Zellatmung), Chloroplasten (Fotosynthese), ER und Golgi (Synthese, Transport), Ribosomen (Proteinbiosynthese).',
            'Pflanzenzelle zusätzlich: Zellwand, Vakuole, Chloroplasten.',
            'Endosymbiontentheorie: Mitochondrien und Chloroplasten stammen von Bakterien ab (eigene DNA, Doppelmembran).',
          ],
        },
        {
          titel: 'Biomembran und Stofftransport',
          inhalte: ['Flüssig-Mosaik-Modell', 'Diffusion', 'Osmose', 'aktiver Transport'],
          zusammenfassung: [
            'Flüssig-Mosaik-Modell: Phospholipid-Doppelschicht mit eingelagerten Proteinen.',
            'Passiv: Diffusion (entlang des Konzentrationsgefälles), erleichterte Diffusion über Kanäle/Carrier.',
            'Osmose: Wasser wandert durch eine semipermeable Membran zur höheren Teilchenkonzentration (Plasmolyse bei Pflanzenzellen).',
            'Aktiver Transport gegen das Gefälle unter ATP-Verbrauch (z. B. Natrium-Kalium-Pumpe). Endo- und Exocytose.',
          ],
        },
        {
          titel: 'Enzyme',
          inhalte: ['Schlüssel-Schloss-Prinzip', 'Einflussfaktoren', 'Hemmung'],
          zusammenfassung: [
            'Enzyme sind Biokatalysatoren (meist Proteine), senken die Aktivierungsenergie.',
            'Substrat- und Wirkungsspezifität; Schlüssel-Schloss- bzw. Induced-fit-Modell.',
            'Einflüsse: Temperatur (RGT-Regel, Denaturierung ab ca. 40–50 °C), pH-Wert, Substratkonzentration (Sättigung).',
            'Kompetitive Hemmung (Hemmstoff am aktiven Zentrum, durch viel Substrat aufhebbar) vs. allosterische Hemmung.',
          ],
        },
      ],
      12: [
        {
          titel: 'Stoffwechsel: Fotosynthese und Zellatmung',
          inhalte: ['Lichtreaktion', 'Calvin-Zyklus', 'Glykolyse', 'Atmungskette'],
          zusammenfassung: [
            'Fotosynthese: 6 CO₂ + 12 H₂O → C₆H₁₂O₆ + 6 O₂ + 6 H₂O (mit Lichtenergie).',
            'Lichtabhängige Reaktion (Thylakoide): ATP und NADPH, O₂ aus Wasserspaltung. Calvin-Zyklus (Stroma): CO₂-Fixierung zu Glucose.',
            'Zellatmung: C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O; bis zu ca. 32–38 ATP.',
            'Glykolyse (Cytoplasma) → oxidative Decarboxylierung → Citratzyklus (Mitochondrienmatrix) → Atmungskette (innere Membran, ATP-Synthase).',
            'Gärung ohne O₂: alkoholische Gärung (Hefe) oder Milchsäuregärung (Muskel), nur 2 ATP.',
          ],
        },
        {
          titel: 'Molekulargenetik',
          inhalte: ['DNA', 'Replikation', 'Proteinbiosynthese', 'Mutationen'],
          zusammenfassung: [
            'DNA: Doppelhelix aus Nukleotiden, Basenpaarung A–T, G–C.',
            'Replikation semikonservativ; DNA-Polymerase arbeitet 5′ → 3′ (Leit- und Folgestrang, Okazaki-Fragmente).',
            'Transkription (Zellkern): DNA → mRNA. Translation (Ribosom): mRNA → Aminosäurekette über tRNA; genetischer Code aus Basentripletts (Codons).',
            'Mutationen: Genmutationen (Punktmutation, Rasterschub), Chromosomen- und Genommutationen (z. B. Trisomie 21).',
            'Genregulation bei Prokaryoten: Operon-Modell (lac-Operon: Substratinduktion).',
          ],
        },
        {
          titel: 'Klassische Genetik und Stammbaumanalyse',
          inhalte: ['Mendelsche Regeln', 'Erbgänge', 'Meiose'],
          zusammenfassung: [
            'Mendel: Uniformitätsregel, Spaltungsregel (3:1 bzw. 1:2:1), Unabhängigkeitsregel.',
            'Meiose: Reduktion auf einfachen Chromosomensatz, Rekombination durch Crossing-over und zufällige Verteilung.',
            'Stammbaum: autosomal-dominant (tritt in jeder Generation auf), autosomal-rezessiv (kann Generationen überspringen), X-chromosomal-rezessiv (vor allem Männer betroffen).',
            'Genotypen immer begründet aus dem Stammbaum ableiten.',
          ],
        },
      ],
      13: [
        {
          titel: 'Neurobiologie',
          inhalte: ['Ruhepotenzial', 'Aktionspotenzial', 'Synapse'],
          zusammenfassung: [
            'Ruhepotenzial ca. −70 mV durch ungleiche Ionenverteilung (K⁺ innen, Na⁺ außen) und Na⁺/K⁺-Pumpe.',
            'Aktionspotenzial: Schwelle überschritten → Na⁺-Kanäle öffnen (Depolarisation), K⁺-Kanäle öffnen (Repolarisation), Hyperpolarisation, Refraktärzeit. Alles-oder-Nichts-Prinzip.',
            'Saltatorische Erregungsleitung an myelinisierten Axonen (Ranviersche Schnürringe) ist schneller.',
            'Chemische Synapse: Ca²⁺-Einstrom → Transmitterausschüttung (z. B. Acetylcholin) → Rezeptoren → postsynaptisches Potenzial. Gifte/Drogen wirken oft hier.',
          ],
        },
        {
          titel: 'Immunbiologie',
          inhalte: ['unspezifische Abwehr', 'humorale/zelluläre Immunantwort', 'Impfung'],
          zusammenfassung: [
            'Unspezifische Abwehr: Haut, Schleimhäute, Fresszellen (Makrophagen), Entzündung.',
            'Humorale Immunantwort: B-Zellen → Plasmazellen bilden Antikörper (Antigen-Antikörper-Reaktion).',
            'Zelluläre Immunantwort: T-Helferzellen aktivieren, zytotoxische T-Zellen töten infizierte Zellen.',
            'Gedächtniszellen → schnellere Sekundärreaktion. Aktive Impfung (Antigene) vs. passive Impfung (Antikörper).',
          ],
        },
        {
          titel: 'Evolution',
          inhalte: ['Evolutionsfaktoren', 'Artbildung', 'Belege'],
          zusammenfassung: [
            'Darwin: Variation, Überproduktion, Selektion („survival of the fittest“ = Fortpflanzungserfolg).',
            'Synthetische Evolutionstheorie: Mutation, Rekombination, Selektion, Gendrift, Isolation.',
            'Artbildung: allopatrisch (geografische Trennung), sympatrisch (z. B. ökologische oder zeitliche Isolation).',
            'Belege: Homologie vs. Analogie, Fossilien, molekularbiologische Vergleiche (DNA, Proteine).',
          ],
        },
        {
          titel: 'Gentechnik',
          inhalte: ['PCR', 'Gelelektrophorese', 'CRISPR/Cas9'],
          zusammenfassung: [
            'PCR vervielfältigt DNA: Denaturierung (ca. 94 °C), Primer-Anlagerung (ca. 55 °C), Elongation (ca. 72 °C).',
            'Gelelektrophorese trennt DNA-Fragmente nach Größe (kleine wandern weiter) – genetischer Fingerabdruck.',
            'Gentransfer mit Plasmiden, Restriktionsenzymen und Ligase (z. B. Insulinproduktion in Bakterien).',
            'CRISPR/Cas9: gezielte Genom-Editierung; ethische Bewertung (Keimbahneingriffe) ist Abiturthema.',
          ],
        },
      ],
    },
  },
];

function slug(s) {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// IDs einmalig vergeben: <fach>-<klasse>-<thema>
const PLAN = Object.fromEntries(
  KLASSEN.map((k) => [
    k,
    FAECHER.map((f) => ({
      id: f.id,
      name: f.name,
      themen: (f.klassen[k] || []).map((t) => ({ id: `${f.id}-${k}-${slug(t.titel)}`, ...t })),
    })).filter((f) => f.themen.length > 0),
  ]),
);

export function lehrplanFuer(k) {
  return { klasse: k, stufe: STUFEN[k], faecher: PLAN[k] };
}

export function topicExists(k, topicId) {
  return (PLAN[k] || []).some((f) => f.themen.some((t) => t.id === topicId));
}

export function fachNamen() {
  return FAECHER.map((f) => f.name);
}
