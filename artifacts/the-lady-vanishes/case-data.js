(() => {
  "use strict";

  const NO_PUBLIC_LINK = "Gjennomgangen gir ingen ny, offentlig kildeført opplysning som knytter denne oppføringen til Marion i perioden. Oppslaget avsluttes uten resultat.";
  const RECORDS_GONE = "Det finnes ingen bevart offentlig dokumentkjede som kan besvare henvendelsen sikkert. Fraværet er ikke bevis for at noe bestemt skjedde.";
  const quiet = (id, code, name, address, locationId, extra = {}) => ({
    id, code, name, address, locationId, cost: 1,
    result: [extra.result || NO_PUBLIC_LINK],
    documentIds: extra.documentIds || [],
    sourceIds: extra.sourceIds || [],
    illustration: extra.illustration || null,
    era: extra.era || "historical"
  });
  const entry = (id, code, name, address, locationId, result, documentIds, sourceIds, extra = {}) => ({
    id, code, name, address, locationId, cost: 1, result, documentIds, sourceIds,
    illustration: extra.illustration || null,
    era: extra.era || "historical"
  });

  window.CASE_DATA = {
    meta: {
      title: "The Case Files: The Lady Vanishes",
      version: "0.6-alias-deduction",
      actionDisclaimer: "",
      currentStatus: [
        "NSW-coroneren fant 29. februar 2024 at Marion Barter er død og trolig døde en gang etter 15. oktober 1997.",
        "Levningene er ikke funnet. Sted, årsak og dødsmåte kunne ikke fastslås.",
        "Dagens formelle saksstatus og løsningsheftets vurderinger ble holdt tilbake til sluttoppgjøret. Enkelte senere sidehistorier kunne likevel finnes som nøytrale arkivspor under etterforskningen."
      ],
      poiCaution: "Ric Blum omtales i senere offentlig materiale som person av interesse. Han er ikke tiltalt i saken, og coroneren fant ikke at han forårsaket Marions død."
    },

    sources: [
      { id: "src-coroner-2024", title: "NSW State Coroner: Inquest into the disappearance and suspected death of Florabella Natalia Marion Remakel, formerly known as Marion Barter", kind: "primærkilde", date: "2024-02-29", note: "Offentlige formelle funn. Går foran senere sammendrag når detaljer spriker." },
      { id: "src-timeline-compiled", title: "Marion Barter – tidslinje", kind: "kildeført oversikt", date: "2026-07-20", note: "Offentlig tidslinje kompilert fra coronerfunnene." },
      { id: "src-evidence-compiled", title: "Marion Barter – bevisregister", kind: "kildeført oversikt", date: "2026-07-20", note: "Offentlig register over dokumenterte bevis og begrensninger." },
      { id: "src-witnesses-compiled", title: "Marion Barter – vitner og observasjoner", kind: "kildeført oversikt", date: "2026-07-20", note: "Offentlig oversikt over vitneopplysninger og usikkerhet." },
      { id: "src-analysis-compiled", title: "Marion Barter – analyse", kind: "kildeført oversikt", date: "2026-07-20", note: "Skiller fakta, slutninger, teorier og åpne spørsmål." },
      { id: "src-parallel-compiled", title: "Marion Barter – parallell tidslinje", kind: "kildeført oversikt", date: "2026-07-20", note: "Sammenstiller samtidige hendelser uten å gjøre sammenfall til bevis." },
      { id: "src-case-hub", title: "Marion Barter-saken – offentlig sakshub", kind: "kildeført oversikt", date: "2026-07-20", note: "Samler status, forsiktighetsregler og kildelenker." },
      { id: "src-ilona-compiled", title: "Ilona Kinczel – kildeført personoversikt", kind: "kildeført oversikt", date: "2026-07-20", note: "Skiller dokumentert livsløp og dødsfall fra senere spekulasjon; ingen offentlig dokumentasjon fastslår kriminell medvirkning." },
      { id: "src-remakel-compiled", title: "Fernand Remakel – identitetsoversikt", kind: "kildeført oversikt", date: "2026-07-20", note: "Den virkelige Fernand Remakel behandles som en uskyldig tredjepart. Enkelte biografiske detaljer har begrenset åpen primærkildestøtte." },
      { id: "src-blum-finance-compiled", title: "Ric Blum – pengespor og myntnettverk", kind: "kildeført oversikt", date: "2026-07-20", note: "Sammenstiller selskaps-, auksjons- og coroneropplysninger. Mønsteropplysninger er kontekst, ikke bevis for hva som skjedde med Marion." },
      { id: "src-blum-alias-compiled", title: "Ric Blum – skjemaer, aliaser og relasjoner", kind: "kildeført oversikt", date: "2026-07-20", note: "Skiller dokumenterte alias- og kontaktmønstre fra slutninger og ubekreftede teorier." },
      { id: "src-marion-person-compiled", title: "Marion Barter – person- og yrkesoversikt", kind: "kildeført oversikt", date: "2026-07-20", note: "Bakgrunn om Marions familie, lærerkarriere og offentlige anerkjennelse." }
    ],

    locations: [
      { id: "loc-southport", name: "Southport", region: "Queensland", map: { x: 470, y: 145 } },
      { id: "loc-merinda", name: "Merinda Court", region: "Queensland", map: { x: 505, y: 155 } },
      { id: "loc-tss", name: "The Southport School", region: "Queensland", map: { x: 445, y: 125 } },
      { id: "loc-brisbane", name: "Brisbane", region: "Queensland", map: { x: 405, y: 110 } },
      { id: "loc-ashmore", name: "Ashmore", region: "Queensland", map: { x: 520, y: 180 } },
      { id: "loc-burleigh", name: "Burleigh Heads", region: "Queensland", map: { x: 540, y: 205 } },
      { id: "loc-byron", name: "Byron Bay", region: "New South Wales", map: { x: 650, y: 350 } },
      { id: "loc-ballina", name: "Ballina", region: "New South Wales", map: { x: 600, y: 420 } },
      { id: "loc-lismore", name: "Lismore / Wollongbar", region: "New South Wales", map: { x: 530, y: 420 } },
      { id: "loc-grafton", name: "Grafton", region: "New South Wales", map: { x: 520, y: 515 } },
      { id: "loc-tweed", name: "Tweed Heads", region: "New South Wales", map: { x: 720, y: 315 } },
      { id: "loc-nsw", name: "Northern NSW", region: "New South Wales", map: { x: 800, y: 430 } },
      { id: "loc-tunbridge", name: "Tunbridge Wells", region: "Kent", map: { x: 145, y: 130 } },
      { id: "loc-rye", name: "Rye", region: "East Sussex", map: { x: 205, y: 195 } },
      { id: "loc-hastings", name: "Hastings", region: "East Sussex", map: { x: 120, y: 220 } },
      { id: "loc-london", name: "London", region: "United Kingdom", map: { x: 245, y: 115 } },
      { id: "loc-narita", name: "Narita", region: "Japan", map: { x: 775, y: 135 } },
      { id: "loc-overseas", name: "Utenlandske registre", region: "Internasjonalt", map: { x: 865, y: 155 } }
    ],

    identities: [
      { id: "mf-remakel", label: "M.F. Remakel", documentIds: ["doc16"] },
      { id: "de-hedervary", label: "Frederick De Hedervary", documentIds: ["doc17", "doc19", "doc20", "doc22"] },
      { id: "westbury", label: "Richard Lloyd Westbury", documentIds: ["doc18", "doc20"] },
      { id: "wouters", label: "Willy Wouters", documentIds: ["doc19", "doc21"] },
      { id: "coppenolle", label: "Willy Coppenolle", documentIds: ["doc21"] },
      { id: "real-remakel", label: "Fernand Remakel (Luxembourg)", documentIds: ["doc22"] }
    ],

    documents: [
      { id: "doc01", title: "Registrering av hussalget", date: "1997-04-25", dateLabel: "25. april 1997", facsimile: "assets/facsimiles-v05/doc01-house-sale-record.png", alt: "Registrering av salget av huset i Southport.", transcript: ["Eiendom: Merinda Court, Southport.", "Registrert selger: Marion Barter.", "Salgsdato: 25. april 1997.", "Registrert salgssum: A$165 000; oppgitt prisantydning: A$175 000."], sourceIds: ["src-coroner-2024", "src-timeline-compiled"] },
      { id: "doc15", title: "Første oppsigelsesbrev til The Southport School", date: "1997-04-13", dateLabel: "13. april 1997", facsimile: "assets/facsimiles-v05/doc15-first-resignation-letter.png", alt: "Marions første oppsigelsesbrev til The Southport School.", transcript: ["Datert 13. april 1997 og adressert til skolens ledelse.", "Marion skriver at hun sier opp med stor sorg og profesjonell motvilje, med virkning fra 14. juli 1997.", "Hun ønsker å diskutere de medvirkende årsakene og nevner planer om å reise til England."], sourceIds: ["src-coroner-2024", "src-timeline-compiled"] },
      { id: "doc02", title: "Andre oppsigelsesbrev til The Southport School", date: "1997-06-16", dateLabel: "16. juni 1997", facsimile: "assets/facsimiles-v05/doc02-school-resignation-letter.png", alt: "Marions andre oppsigelsesbrev til The Southport School.", transcript: ["Datert 16. juni 1997 og adressert «Dear Sir / Madam».", "Marion skriver at hun vil reise utenlands på ubestemt tid og håper å undervise i England og Europa.", "Hun ber om fornyelse av lærerregistreringen for 1998 og bruker Lesley Lovedays adresse.", "Oppsigelsen skulle gjelde fra 20. juni 1997."], sourceIds: ["src-coroner-2024", "src-timeline-compiled"] },
      { id: "doc03", title: "Utreisekort og flyregistrering", date: "1997-06-22", dateLabel: "22. juni 1997", facsimile: "assets/facsimiles-v05/doc03-departure-card.png", alt: "Australsk utreisekort utfylt for Florabella Remakel.", transcript: ["Navn: Florabella Remakel.", "Avreise: Brisbane, 22. juni 1997 kl. 21.38.", "Flyselskap: Korean Airlines.", "Synlige felt: «Europe», «Luxembourg» og «S/Korea»."], sourceIds: ["src-coroner-2024", "src-evidence-compiled", "src-analysis-compiled"] },
      { id: "doc04", title: "Brevet til Sally", date: "1997-06-30", dateLabel: "mottatt 30. juni 1997", facsimile: "assets/facsimiles-v05/doc04-narita-stationery-letter.png", alt: "Marions brev til Sally på Hotel Nikko Narita-brevpapir.", transcript: ["Adressert til Sally og signert «Marion».", "Marion skriver at hun endelig har kommet til England etter et interessant besøk i øst, men at for mye bagasje gjorde reisen vanskeligere.", "Hun planlegger å bli i Tunbridge Wells noen dager før hun tar fatt på Europa.", "Konvolutten var poststemplet i Tunbridge Wells og brevet ble mottatt 30. juni 1997."], sourceIds: ["src-coroner-2024", "src-evidence-compiled", "src-parallel-compiled"] },
      { id: "doc05", title: "Postkortene fra England", date: "1997-07", dateLabel: "sommeren 1997", facsimile: "assets/facsimiles-v05/doc05-sussex-postcards.png", alt: "Postkort fra Tunbridge Wells, Rye og Hastings.", transcript: ["Postkort sendt til familie og venner i Australia; de enkelte mottakerne er ikke fullt identifisert.", "Kortene er knyttet til Tunbridge Wells, Rye og Hastings.", "Alle er skrevet med samme hånd og signert «Marion».", "Ett kort som senere ble funnet hadde britisk poststempel 7. august 1997 — fem dager etter den registrerte returen til Australia."], sourceIds: ["src-coroner-2024", "src-timeline-compiled", "src-witnesses-compiled"] },
      { id: "doc06", title: "Innreisekortet", date: "1997-08-02", dateLabel: "2. august 1997", facsimile: "assets/facsimiles-v05/doc06-arrival-card.png", alt: "Innreisekort utfylt for Florabella Remakel.", transcript: ["Navn: Florabella Remakel.", "Ankomst: Brisbane, 2. august 1997 kl. 10.11; Cathay Pacific.", "Oppgitt sivilstatus: gift; bostedsland: Luxembourg; yrke: home duties.", "Planlagt opphold: 8 dager; adresse i Australia: Novotel, Brisbane."], sourceIds: ["src-coroner-2024", "src-evidence-compiled", "src-analysis-compiled"] },
      { id: "doc08", title: "Notatbokinnførselen ved Byron Bay Police", date: "1997-10-22", dateLabel: "22. oktober 1997", facsimile: "assets/facsimiles-v05/doc08-police-notebook.png", alt: "Notatbokinnførsel fra Byron Bay Police.", transcript: ["Byron Bay, 22. oktober 1997.", "Sally og Chris møtte angående Marion Barter.", "Familien rapporterte retur til Australia 2. august og bankaktivitet i Byron Bay/Burleigh Heads.", "En større bevegelse omkring A$80 000 ble rapportert 15. oktober."], sourceIds: ["src-coroner-2024", "src-timeline-compiled"] },
      { id: "doc10", title: "Transaksjonsoversikten", date: "1997-08/10", dateLabel: "august–oktober 1997", facsimile: "assets/facsimiles-v05/doc10-bank-transaction-sheet.png", alt: "Oversikt over banktransaksjoner fra august til oktober 1997.", transcript: ["18. august: to uttak på A$500 i Byron Bay.", "21.–22. august: ett uttak på A$500 per dag i Burleigh Heads.", "23.–28. august: ett uttak på A$500 per dag i Byron Bay.", "15. oktober: omkring A$80 000, beskrevet som filialuttak eller mulig telegrafisk overføring.", "Destinasjonskontoen er ikke fastslått."], sourceIds: ["src-coroner-2024", "src-evidence-compiled"] },
      { id: "doc11", title: "Queensland-notatet", date: "1997-12-01", dateLabel: "1. desember 1997", facsimile: "assets/facsimiles-v05/doc11-queensland-safe-and-well-note.png", alt: "Queensland-notat om Marion Barter.", transcript: ["Queensland Missing Persons Bureau; filnotat datert 1. desember 1997; emne Marion Barter.", "Synlig konklusjon: «Missing person located safe and well, whereabouts not to be disclosed.»", "De foregående arbeidsnotatene er redigert og var ikke tilgjengelige i det senere offentlige materialet."], sourceIds: ["src-coroner-2024", "src-witnesses-compiled"] },
      { id: "doc12", title: "Salvation Army-brevet", date: "1998-03-18", dateLabel: "18. mars 1998 · senere materiale", facsimile: "assets/facsimiles-v05/doc12-salvation-army-letter.png", alt: "Brev fra The Salvation Army til familien.", transcript: ["The Salvation Army, Family Tracing correspondence; 18. mars 1998; adressert til Mr Wilson.", "Brevet sier at Marion hadde tatt ut de resterende pengene og ville begynne et nytt liv.", "En senere coroner-gjennomgang stilte spørsmål ved den rapporterte henvisningen til en bankansatt innen sikkerhet."], sourceIds: ["src-coroner-2024", "src-witnesses-compiled"] },
      { id: "doc14", title: "Coronerens funn", date: "2024-02-29", dateLabel: "29. februar 2024 · senere materiale", facsimile: "assets/facsimiles-v05/doc14-coroner-findings-extract.png", alt: "Utdrag fra coronerens formelle funn.", transcript: ["State Coroner's Court, New South Wales; funn datert 29. februar 2024.", "Marion Barter er død og døde trolig en gang etter 15. oktober 1997.", "Levningene er ikke funnet.", "Sted, årsak og dødsmåte kunne ikke fastslås.", "Funnene fastslo ikke at en identifisert person forårsaket døden."], sourceIds: ["src-coroner-2024"] }
      ,{ id: "doc16", title: "Kontaktannonsen", date: "1994-12-10", dateLabel: "10. desember 1994", facsimile: "assets/alias-v06/doc16-contact-ad.png", alt: "Kontaktannonse under navnet M.F. Remakel.", transcript: ["M.F. Remakel, 47 år og ugift, søker et varig forhold eller ekteskap.", "Kontakt: Box L51, Lennox Head og telefon (066) 864 788."], sourceIds: ["src-coroner-2024", "src-blum-alias-compiled"] },
      { id: "doc17", title: "Selskapsutskrift – Ballina Coin Investments", date: "1994-09-02", dateLabel: "2. september 1994", facsimile: "assets/alias-v06/doc17-company-extract.png", alt: "Selskapsutskrift for Ballina Coin Investments.", transcript: ["Direktører: Frederick David De Hedervary og Diane De Hedervary.", "Adresse: Suite 9, 48 Tamar Street, Ballina.", "Telefon: (066) 864 788; postadresse PO Box 624, Ballina."], sourceIds: ["src-coroner-2024", "src-blum-finance-compiled"] },
      { id: "doc18", title: "Internasjonalt reiseregister", date: "1997-06/07", dateLabel: "17. juni–31. juli 1997", facsimile: "assets/alias-v06/doc18-movement-record.png", alt: "Reiseregister for Richard Lloyd Westbury.", transcript: ["Richard Lloyd Westbury forlot Australia 17. juni 1997 med Japan som første destinasjon.", "Han returnerte til Australia 31. juli 1997.", "Reisedokumentet var utstedt i Westbury-navnet."], sourceIds: ["src-coroner-2024", "src-parallel-compiled"] },
      { id: "doc19", title: "Immigrasjons- og statsborgerskapsfil", date: "1969/1976", dateLabel: "1969–1976", facsimile: "assets/alias-v06/doc19-migration-name-file.png", alt: "Immigrasjons- og statsborgerskapsfil med navnene Willy Wouters og Frederick De Hedervary.", transcript: ["Willy Wouters ankom Australia med Ilona Kinczel 24. mai 1969.", "Australsk statsborgerskap ble innvilget i 1976.", "Diane forklarte at mannen hun kjente som Willy Wouters senere brukte navnet Frederick De Hedervary."], sourceIds: ["src-coroner-2024", "src-blum-alias-compiled"] },
      { id: "doc20", title: "Passkryssregister", date: "1997", dateLabel: "1997", facsimile: "assets/alias-v06/doc20-passport-cross-index.png", alt: "Passkryssregister som kobler De Hedervary- og Westbury-navnene.", transcript: ["Frederick David De Hedervary og Richard Lloyd Westbury er indeksert til samme reisendefil.", "Westbury-navnet ble brukt på passet under reisen 17. juni–31. juli 1997."], sourceIds: ["src-coroner-2024", "src-parallel-compiled"] },
      { id: "doc21", title: "Intervju om fødsels- og familienavn", date: "2022", dateLabel: "forklaring under inquest", facsimile: "assets/alias-v06/doc21-birth-interview.png", alt: "Intervjuutdrag med navnene Willy Coppenolle og Willy Wouters.", transcript: ["Intervjupersonen sa at fødselsregisteret oppførte Willy Coppenolle.", "Han forklarte at moren senere giftet seg med Abel Florent Wouters, og at han brukte navnet Willy Wouters."], sourceIds: ["src-coroner-2024", "src-blum-alias-compiled"] },
      { id: "doc22", title: "Luxembourg – vitnefil", date: "circa 1980", dateLabel: "omkring 1980", facsimile: "assets/alias-v06/doc22-luxembourg-witness-note.png", alt: "Vitnefil om Monique Cornelius, Fernand Remakel og Frederick De Hedervary.", transcript: ["Monique Cornelius var tidligere gift med Fernand Remakel.", "Hun korresponderte omkring 1980 med en mann som brukte navnet Frederick De Hedervary.", "Den virkelige Fernand Remakel er en separat person."], sourceIds: ["src-coroner-2024", "src-remakel-compiled"] }
    ],

    episode: {
      id: "ep1",
      title: "Mor tar ikke telefonen",
      period: "juni–desember 1997",
      referenceLeadIds: ["sp05", "gc02", "gc03", "gc06", "gc08", "gc09", "ns01", "ns02", "ns04", "ns11", "ns13", "xr01", "xr07", "xr10", "xr11", "xr12"],
      brief: [
        "Det er oktober 1997. Marion dro fra Southport på en lang reise fire måneder tidligere. Familien har mottatt brev og postkort, men den siste telefonsamtalen ble brutt — og nå svarer hun ikke.",
        "Sally har oppdaget bankaktivitet hun ikke forstår. Du får et åpent register, et kart og de dokumentene familien allerede har. Det finnes ingen handlingsgrense; hvert oppslag registreres bare slik at du kan sammenligne etterforskningsstrategier.",
        "Registeret er ikke kuratert for deg. De fleste oppslag gir lite eller ingenting, mens enkelte sidehistorier først får betydning i sluttoppgjøret. Referansestien bruker 16 oppslag; hvert ekstra oppslag trekker 5 poeng, men låser deg aldri ute. Avslutt når du mener du kan forklare hva som er dokumentert — og hva som fortsatt bare er en antakelse."
      ],
      initialDocumentIds: ["doc04", "doc05"],
      debriefDocumentIds: ["doc12", "doc14"],
      questions: [
        {
          id: "main-1", group: "main", points: 25,
          prompt: "Hvilke navn i arkivene viser til samme mann? Nevn dokumentene som binder identitetene sammen.",
          modelAnswer: [
            "M.F. Remakel, Frederick De Hedervary, Richard Lloyd Westbury, Willy Wouters og Willy Coppenolle peker mot samme person, senere offentlig kjent som Ric Blum.",
            "Kjeden bygges av telefonnummeret i annonsen og selskapsregisteret, immigrasjonsfilen Wouters–De Hedervary, passkryssregisteret De Hedervary–Westbury og intervjuet Coppenolle–Wouters. Den virkelige Fernand Remakel er en separat person."
          ],
          criteria: [
            { points: 5, text: "Kobler M.F. Remakel til De Hedervary gjennom telefonnummeret og Ballina Coin Investments." },
            { points: 5, text: "Kobler Willy Wouters til Frederick De Hedervary gjennom immigrasjons-/familiefilen." },
            { points: 5, text: "Kobler De Hedervary til Richard Lloyd Westbury gjennom passkryssregisteret." },
            { points: 5, text: "Kobler Willy Wouters og Willy Coppenolle, med forbehold om at fødselsnavnet bygger på personens egen forklaring." },
            { points: 5, text: "Holder den virkelige Fernand Remakel utenfor identitetskjeden." }
          ],
          sourceIds: ["src-coroner-2024", "src-blum-alias-compiled", "src-blum-finance-compiled", "src-remakel-compiled"]
        },
        {
          id: "main-2", group: "main", points: 15,
          prompt: "Hvilke felt på passasjerkortene skiller seg fra resten av håndskriften?",
          modelAnswer: [
            "På utreisekortet skiller Europe, Luxembourg og S/Korea seg fra resten. På innreisekortet skiller passnummeret seg ut.",
            "Forskjellen viser at minst to hender fylte ut kortene, men identifiserer ikke den andre skriveren."
          ],
          criteria: [
            { points: 5, text: "Finner Europe, Luxembourg og S/Korea på utreisekortet." },
            { points: 5, text: "Finner passnummeret på innreisekortet." },
            { points: 5, text: "Konkluderer med to hender uten å identifisere den andre skriveren." }
          ],
          sourceIds: ["src-coroner-2024", "src-evidence-compiled", "src-analysis-compiled"]
        },
        {
          id: "main-3", group: "main", points: 20,
          prompt: "Hvordan kom Hotel Nikko Narita-brevpapiret til Marion i England, og hva viser forbindelsen?",
          modelAnswer: [
            "Richard Lloyd Westbury reiste via Japan 17. juni og oppga senere at transitthotellet sannsynligvis var Hotel Nikko Narita. Marion skrev fra England på papir fra samme hotell før brevet ble mottatt 30. juni.",
            "Den mest sannsynlige forklaringen er at Westbury tok med papiret til England og ga det til Marion. Det knytter reisene sammen, men beviser ikke hva som senere skjedde med henne."
          ],
          criteria: [
            { points: 5, text: "Identifiserer Hotel Nikko Narita-papiret." },
            { points: 5, text: "Plasserer Westbury i Japan 17. juni." },
            { points: 5, text: "Plasserer Marions brev i England før 30. juni." },
            { points: 5, text: "Forklarer papirforbindelsen uten å gjøre den til bevis for senere skyld." }
          ],
          sourceIds: ["src-coroner-2024", "src-evidence-compiled", "src-parallel-compiled"]
        },
        {
          id: "main-4", group: "main", points: 20,
          prompt: "Hva skjedde med Marions penger fra 18. august til 15. oktober, og hva er det siste sikre livstegnet?",
          modelAnswer: [
            "Kontoen ble belastet med gjentatte A$500-uttak i Byron Bay og Burleigh Heads i august. Omkring A$80 000 ble flyttet 15. oktober; destinasjonen er ukjent.",
            "Joan Hazlett identifiserte Marion som kunden ved Colonial State Bank i Byron Bay 15. oktober. Coroneren aksepterte dette som den siste sikre observasjonen."
          ],
          criteria: [
            { points: 5, text: "Finner de gjentatte uttakene i Byron Bay/Burleigh Heads." },
            { points: 5, text: "Finner transaksjonen på omtrent A$80 000 den 15. oktober." },
            { points: 5, text: "Identifiserer Joan Hazlett og Byron Bay-banken som siste sikre observasjon." },
            { points: 5, text: "Fastslår at pengenes endelige destinasjon er ukjent." }
          ],
          sourceIds: ["src-coroner-2024", "src-evidence-compiled", "src-witnesses-compiled"]
        },
        {
          id: "main-5", group: "main", points: 20,
          prompt: "Hvilke to administrative avgjørelser førte til at etterforskningen stoppet opp?",
          modelAnswer: [
            "Byron Bay registrerte familiens henvendelse som en occurrence i stedet for en aktiv savnetsak. Deretter sa Queensland-notatet at Marion var funnet safe and well og at oppholdsstedet ikke skulle oppgis.",
            "Arbeidsarkene som skulle forklare grunnlaget for safe-and-well-konklusjonen manglet senere."
          ],
          criteria: [
            { points: 5, text: "Nevner familiens henvendelse 22. oktober." },
            { points: 5, text: "Identifiserer occurrence-klassifiseringen." },
            { points: 5, text: "Identifiserer Queensland-notatet safe and well." },
            { points: 5, text: "Finner at underlaget/arbeidsarkene manglet." }
          ],
          sourceIds: ["src-coroner-2024", "src-timeline-compiled", "src-witnesses-compiled", "src-case-hub"]
        },
        {
          id: "bonus-1", group: "bonus", points: 10,
          prompt: "Hva endret Marion mellom de to oppsigelsesbrevene til The Southport School?",
          modelAnswer: [
            "Det første brevet 13. april satte fratreden til 14. juli. Det andre 16. juni flyttet den frem til 20. juni, samtidig som Marion ba om lærerregistrering for 1998 og oppga Lesley Lovedays adresse."
          ],
          criteria: [
            { points: 5, text: "Finner endringen fra 14. juli til 20. juni." },
            { points: 5, text: "Finner fornyelsen for 1998 eller Lesley Lovedays adresse." }
          ],
          sourceIds: ["src-coroner-2024", "src-timeline-compiled", "src-marion-person-compiled"]
        },
        {
          id: "bonus-2", group: "bonus", points: 10,
          prompt: "Hvem var den virkelige Fernand Remakel, og hvorfor skal han holdes utenfor aliasgruppen?",
          modelAnswer: [
            "Fernand Remakel var en virkelig person fra Luxembourg og Monique Cornelius' tidligere ektefelle. Han er personen navnet ble hentet fra, ikke mannen bak M.F. Remakel-annonsen og de andre identitetene."
          ],
          criteria: [
            { points: 5, text: "Identifiserer den virkelige Fernand og forbindelsen til Monique Cornelius." },
            { points: 5, text: "Holder ham utenfor aliasgruppen og Marion-saken." }
          ],
          sourceIds: ["src-coroner-2024", "src-remakel-compiled"]
        },
        {
          id: "bonus-3", group: "bonus", points: 10,
          prompt: "Hvem var Ilona Kinczel, og hva fastslår arkivet om dødsfallet hennes?",
          modelAnswer: [
            "Ilona Kinczel ankom Australia med Willy Wouters i 1969 og var hans tredje kone. Hun døde i Melbourne i 1977. Arkivet fastslår ikke at dødsfallet skyldtes en forbrytelse eller at en annen person medvirket."
          ],
          criteria: [
            { points: 5, text: "Kobler Ilona til Willy Wouters og 1969-ankomsten." },
            { points: 5, text: "Oppgir 1977-dødsfallet uten å hevde forbrytelse eller medvirkning." }
          ],
          sourceIds: ["src-ilona-compiled", "src-blum-alias-compiled"]
        },
        {
          id: "bonus-4", group: "bonus", points: 10,
          prompt: "Hva var Ballina Coin Investments, og hvorfor var telefonnummeret viktig?",
          modelAnswer: [
            "Selskapet var registrert med Frederick og Diane De Hedervary som direktører og hadde ingen registrert driftsinntekt. Telefonnummeret (066) 864 788 ble også brukt i M.F. Remakel-annonsen og binder de to navnene sammen."
          ],
          criteria: [
            { points: 5, text: "Identifiserer direktørene eller den manglende driftsinntekten." },
            { points: 5, text: "Kobler telefonnummeret til M.F. Remakel-annonsen." }
          ],
          sourceIds: ["src-coroner-2024", "src-blum-finance-compiled", "src-blum-alias-compiled"]
        },
        {
          id: "bonus-5", group: "bonus", points: 10,
          prompt: "Hva er uvanlig med postkortet som ble poststemplet i Storbritannia 7. august 1997?",
          modelAnswer: [
            "Poststempelet er fem dager senere enn den registrerte returen til Australia 2. august. Det kan skyldes postforsinkelse eller at en annen postla kortet; det beviser ikke i seg selv at Marion fortsatt var i Storbritannia."
          ],
          criteria: [
            { points: 5, text: "Sammenholder 7. august med returen 2. august." },
            { points: 5, text: "Gir en mulig forklaring uten å behandle poststempelet som sikkert oppholdssted." }
          ],
          sourceIds: ["src-witnesses-compiled", "src-timeline-compiled"]
        }
      ]
    },

    directory: [
      entry("sp01", "SP-01", "Queensland Titles Office – Southport", "Merinda Court, Southport", "loc-merinda", [
        "Registeropplysningene viser at Marions hus ble solgt 25. april 1997 for A$165 000. Prisantydningen var A$175 000.",
        "Oppslaget sier ingenting om hvorfor prisen ble akseptert eller hva pengene senere ble brukt til."
      ], ["doc01"], ["src-coroner-2024", "src-timeline-compiled"], { illustration: { file: "assets/illustrations-flux2/southport-house-1997.webp", alt: "Et hus i Southport våren 1997." } }),
      quiet("sp02", "SP-02", "Gold Coast eiendomsmeglerforening", "Southport, Queensland", "loc-southport"),
      entry("sp03", "SP-03", "Lesley Loveday", "Southport, Queensland", "loc-southport", [
        "Lesley forklarer at hun kjørte Marion til busstasjonen i Southport 22. juni 1997.",
        "Dette er den siste ukontroversielle observasjonen før utenlandsreisen. Lesley beskriver også en plan om lang ferie og mulig undervisningsarbeid i England eller Europa."
      ], [], ["src-coroner-2024", "src-witnesses-compiled"], { illustration: { file: "assets/illustrations-flux2/southport-bus-station-1997.webp", alt: "Southport busstasjon 22. juni 1997." } }),
      quiet("sp04", "SP-04", "Southport busstasjon", "Southport, Queensland", "loc-southport", { result: "Ingen bevart billett-, bagasje- eller vitnelogg fra busstasjonen gir et nytt sikkert spor. Lesley Lovedays forklaring står fortsatt alene." }),
      entry("sp05", "SP-05", "The Southport School – administrasjonen", "Winchester Street, Southport", "loc-tss", [
        "Marion leverte et første oppsigelsesbrev 13. april med fratreden 14. juli, og et nytt brev 16. juni som flyttet fratredelsen frem til 20. juni.",
        "Det andre brevet sier at hun vil reise på ubestemt tid, håper å undervise i England eller Europa, ber om lærerregistrering for 1998 og bruker Lesley Lovedays adresse."
      ], ["doc15", "doc02"], ["src-coroner-2024", "src-timeline-compiled"]),
      quiet("sp06", "SP-06", "Queensland Teacher Registration Board", "Queensland", "loc-southport", { result: "Oppslaget gir ingen ytterligere offentlig bevart 1997-korrespondanse utover opplysningen som allerede finnes i skolebrevet." }),
      entry("sp07", "SP-07", "Sally Leydon", "Familiens adresseoppføring", "loc-southport", [
        "Den siste direkte telefonsamtalen kom rundt 30. juli eller 1. august. Linjen falt ut.",
        "Marion nevnte Thredbo-skredet og sa at hun hadde drukket te med noen gamle damer. Notatet inneholder ingen sikker geografisk plassering av samtalen."
      ], [], ["src-coroner-2024", "src-witnesses-compiled"]),
      entry("sp08", "SP-08", "Chris Leydon", "Southport, Queensland", "loc-southport", [
        "Før avreisen så Sally og Chris Marion i en bil med en høy mannlig passasjer.",
        "Observasjonen identifiserer ikke mannen. Den sier bare at det fantes en ukjent person i bilen."
      ], [], ["src-coroner-2024", "src-witnesses-compiled"]),
      quiet("sp09", "SP-09", "Australia Post – Southport", "Southport, Queensland", "loc-southport"),
      quiet("sp10", "SP-10", "Gold Coast Hospital", "Southport, Queensland", "loc-southport"),
      quiet("sp11", "SP-11", "Pindara Private Hospital", "Benowa, Queensland", "loc-southport"),
      quiet("sp12", "SP-12", "Southport Police Station", "Southport, Queensland", "loc-southport"),
      quiet("sp13", "SP-13", "Gold Coast tannlegeregister", "Southport, Queensland", "loc-southport"),
      quiet("sp14", "SP-14", "Valgmanntallet – Southport", "Queensland", "loc-southport"),
      quiet("sp15", "SP-15", "Gold Coast Taxi Cooperative", "Southport, Queensland", "loc-southport"),
      entry("sp16", "SP-16", "Tidligere skolekolleger", "The Southport School", "loc-tss", [
        "Kollegene kjente planen om en lengre utenlandsreise og mulig arbeid som lærer i England eller Europa. Marion hadde mottatt en Queensland Teaching Excellence Award i 1996.",
        "Anerkjennelsen og ønsket om fornyet lærerregistrering for 1998 viser en fortsatt profesjonell tilknytning, men forklarer ikke Narita-brevpapiret, bankaktiviteten eller stillheten senere på året."
      ], [], ["src-coroner-2024", "src-timeline-compiled"]),

      quiet("gc01", "GC-01", "Brisbane Airport – informasjon", "Brisbane Airport", "loc-brisbane", { illustration: { file: "assets/illustrations-flux2/brisbane-airport-1997.webp", alt: "Brisbane Airport i 1997." } }),
      entry("gc02", "GC-02", "Korean Airlines – passasjerarkiv", "Brisbane Airport", "loc-brisbane", [
        "Flyregistreringen viser en avreise fra Brisbane 22. juni 1997 kl. 21:38 på Korean Airlines under navnet Florabella Remakel.",
        "Utreisekortet inneholder tre felt som senere ble vurdert som skrevet av en annen hånd. Dokumentet identifiserer ikke den andre personen."
      ], ["doc03"], ["src-coroner-2024", "src-evidence-compiled", "src-analysis-compiled"]),
      entry("gc03", "GC-03", "Cathay Pacific – passasjerarkiv", "Brisbane Airport", "loc-brisbane", [
        "En passasjer registrert som Florabella Remakel ankom Brisbane 2. august 1997 kl. 10:11 på Cathay Pacific.",
        "Kortet oppgir flere personopplysninger. Det finnes ingen uavhengig flyplassobservasjon i dette oppslaget."
      ], ["doc06"], ["src-coroner-2024", "src-evidence-compiled"]),
      quiet("gc04", "GC-04", "Novotel Brisbane", "Brisbane, Queensland", "loc-brisbane", { result: "Det offentlige materialet gir ingen bevart hotellregistrering som bekrefter et åtte dagers opphold. En oppgitt hotelladresse er ikke det samme som dokumentert innsjekking." }),
      quiet("gc05", "GC-05", "Colonial State Bank – Ashmore", "Ashmore, Queensland", "loc-ashmore", { result: "Ingen bevart 1997-bankjournal fra denne henvendelsen kan alene forklare hvem som foretok senere transaksjoner eller hvorfor." }),
      entry("gc06", "GC-06", "Queensland Missing Persons Bureau", "Brisbane, Queensland", "loc-brisbane", [
        "Et notat datert 1. desember 1997 sier at Marion var funnet, trygg og at oppholdsstedet ikke skulle oppgis.",
        "De mer detaljerte arbeidsarkene som skulle vise grunnlaget for setningen, finnes ikke i den senere dokumentkjeden."
      ], ["doc11"], ["src-coroner-2024", "src-witnesses-compiled"]),
      quiet("gc07", "GC-07", "Queensland Police – samband", "Brisbane, Queensland", "loc-brisbane", { result: RECORDS_GONE }),
      entry("gc08", "GC-08", "Department of Immigration – historiske personfiler", "Brisbane, Queensland", "loc-brisbane", [
        "En person ankom Australia som Willy Wouters i 1969. Etter statsborgerskap og ekteskap brukte den samme personen navnet Frederick De Hedervary.",
        "Filen forklarer ikke andre navn som kan ha vært brukt senere."
      ], ["doc19"], ["src-coroner-2024", "src-blum-alias-compiled"]),
      entry("gc09", "GC-09", "Australian Passport Office – kryssregister", "Brisbane, Queensland", "loc-brisbane", [
        "Et passkryssregister indekserer Frederick David De Hedervary og Richard Lloyd Westbury til samme reisendefil.",
        "Westbury-navnet ble brukt under reisen 17. juni–31. juli 1997."
      ], ["doc20"], ["src-coroner-2024", "src-parallel-compiled"]),
      quiet("gc10", "GC-10", "Australian Passport Office", "Brisbane, Queensland", "loc-brisbane", { result: "Det offentlige spillmaterialet gir ingen 1997-utskrift her. Et manglende treff på ett navn utelukker ikke bruk av et annet lovlig navn." }),
      quiet("gc11", "GC-11", "Republikken Koreas konsulat", "Brisbane, Queensland", "loc-brisbane"),
      quiet("gc12", "GC-12", "Japans konsulat", "Brisbane, Queensland", "loc-brisbane", { result: "Hotel Nikko Narita-brevpapiret er et dokumentert objekt, men denne henvendelsen gir ingen bevart hotell- eller innreiseregisterkobling." }),
      quiet("gc13", "GC-13", "Gold Coast reisebyråregister", "Queensland", "loc-southport"),
      quiet("gc14", "GC-14", "Telecom Australia – samtalelogger", "Queensland", "loc-brisbane", { result: "Den siste samtalen er kjent gjennom Sallys erindring. Ingen offentlig bevart samtalelogg plasserer betalingstelefonen geografisk." }),

      entry("ns01", "NS-01", "Colonial State Bank – Byron Bay", "Byron Bay, New South Wales", "loc-byron", [
        "Familie- og politimaterialet beskriver gjentatte uttak i Byron Bay og Burleigh Heads i august, og en langt større transaksjon omkring 15. oktober.",
        "Oversikten dokumenterer datoer, steder og rapporterte beløp. Den identifiserer ikke alene brukeren eller formålet."
      ], ["doc10"], ["src-coroner-2024", "src-evidence-compiled"]),
      entry("ns02", "NS-02", "Byron Bay Police Station", "Byron Bay, New South Wales", "loc-byron", [
        "Sally og Chris møtte opp 22. oktober 1997 med opplysninger om bankaktivitet og manglende kontakt.",
        "Henvendelsen ble registrert som en occurrence, ikke som en aktiv savnetetterforskning."
      ], ["doc08"], ["src-coroner-2024", "src-timeline-compiled", "src-case-hub"]),
      entry("ns03", "NS-03", "Senior Constable Graham Childs", "Byron Bay Police Station", "loc-byron", [
        "Notatet gjengir familiens opplysninger om retur, bankaktivitet og omtrent A$80 000 den 15. oktober.",
        "Dokumentet er en samtidig nedtegnelse av hva politiet ble fortalt; det er ikke i seg selv verifikasjon av alle detaljene."
      ], ["doc08"], ["src-coroner-2024", "src-timeline-compiled"]),
      entry("ns04", "NS-04", "Colonial State Bank – avdelingsleder", "Byron Bay, New South Wales", "loc-byron", [
        "Avdelingsleder Joan Hazlett identifiserte Marion som kunden hun betjente 15. oktober 1997.",
        "Dette er den siste observasjonen coroneren aksepterte som sikker."
      ], [], ["src-coroner-2024", "src-witnesses-compiled"]),
      quiet("ns05", "NS-05", "Overnattingssteder i Byron Bay", "Byron Bay, New South Wales", "loc-byron"),
      quiet("ns06", "NS-06", "Byron District Hospital", "Byron Bay, New South Wales", "loc-byron"),
      quiet("ns07", "NS-07", "Australia Post – Byron Bay", "Byron Bay, New South Wales", "loc-byron"),
      entry("ns08", "NS-08", "Colonial State Bank – Burleigh Heads", "Burleigh Heads, Queensland", "loc-burleigh", [
        "Det rapporterte mønsteret inkluderer uttak i Burleigh Heads 21. og 22. august 1997.",
        "Oppslaget dokumenterer kontobevegelse, ikke sikkert fysisk opphold eller identiteten til personen ved automaten."
      ], ["doc10"], ["src-coroner-2024", "src-evidence-compiled"]),
      quiet("ns09", "NS-09", "Optikerregisteret – Grafton", "Grafton, New South Wales", "loc-grafton", { result: "Et senere registerspor peker mot bruk av et Medicare-kort i Grafton, men ingen bevart journal eller samtidig 1997-erindring kan identifisere pasienten sikkert. Oppslaget løser derfor ingenting i denne tidsrammen.", sourceIds: ["src-coroner-2024", "src-witnesses-compiled"] }),
      quiet("ns10", "NS-10", "Grafton Base Hospital", "Grafton, New South Wales", "loc-grafton"),
      entry("ns11", "NS-11", "Australian Securities & Investments Commission – Ballina", "Ballina, New South Wales", "loc-ballina", [
        "Ballina Coin Investments ble registrert 2. september 1994 med Frederick og Diane De Hedervary som direktører.",
        "Selskapet brukte telefon (066) 864 788 og lokaler i Tamar Street, men har ingen registrert driftsinntekt."
      ], ["doc17"], ["src-coroner-2024", "src-blum-finance-compiled"], { era: "later" }),
      quiet("ns12", "NS-12", "Bankfilialene i Ballina", "Ballina, New South Wales", "loc-ballina"),
      entry("ns13", "NS-13", "Telefon- og annonsearkivet – Northern Rivers", "Ballina / Wollongbar, New South Wales", "loc-lismore", [
        "En franskspråklig kontaktannonse fra 1994 sto under navnet M.F. Remakel.",
        "Annonsen brukte telefon (066) 864 788 og Box L51 i Lennox Head."
      ], ["doc16"], ["src-coroner-2024", "src-blum-alias-compiled", "src-blum-finance-compiled"], { era: "later" }),
      quiet("ns14", "NS-14", "Lismore Police Station", "Lismore, New South Wales", "loc-lismore"),
      quiet("ns15", "NS-15", "Tweed Heads Hospital", "Tweed Heads, New South Wales", "loc-tweed"),
      entry("ns16", "NS-16", "NSW Missing Persons Unit", "New South Wales", "loc-nsw", [
        "Det finnes ingen aktiv savnetsak fra 22. oktober å hente her. Den opprinnelige henvendelsen ble liggende som en occurrence.",
        "Mangelen på aktiv sak er et administrativt resultat, ikke et tegn på at Marion var funnet."
      ], [], ["src-coroner-2024", "src-case-hub"]),
      quiet("ns17", "NS-17", "Bankenes sentrale arkivkontor", "New South Wales", "loc-nsw", { result: "Ingen komplett bankdokumentkjede blir sikret gjennom dette oppslaget. Senere tap av arkivmateriale gjør at flere spørsmål ikke kan kontrolleres fullt ut.", sourceIds: ["src-coroner-2024", "src-case-hub"] }),
      quiet("ns18", "NS-18", "Northern Star / lokale aviser", "Northern Rivers, New South Wales", "loc-nsw"),

      quiet("xr01", "XR-01", "Hotel Nikko Narita", "Narita, Japan", "loc-narita", { result: "Richard Lloyd Westbury reiste via Japan 17. juni 1997 og forklarte senere at transitthotellet sannsynligvis var Hotel Nikko Narita. Ingen gjesteliste er bevart. Brevpapir fra samme hotell dukker opp i Marions brev fra England.", sourceIds: ["src-coroner-2024", "src-parallel-compiled"] }),
      entry("xr02", "XR-02", "Royal Tunbridge Wells Post Office", "Kent, England", "loc-tunbridge", [
        "Familien mottok et postkort fra Tunbridge Wells sommeren 1997.",
        "Kortet dokumenterer kontakt og et poststed, men sier ikke hvem Marion var sammen med eller hvor lenge hun oppholdt seg der."
      ], ["doc05"], ["src-coroner-2024", "src-timeline-compiled"]),
      entry("xr03", "XR-03", "Rye Post Office", "East Sussex, England", "loc-rye", [
        "Et av postkortene familien mottok var knyttet til Rye.",
        "Poststedet er dokumentert; reiserute, selskap og varighet er ikke."
      ], ["doc05"], ["src-coroner-2024", "src-timeline-compiled"]),
      entry("xr04", "XR-04", "Hastings Post Office", "East Sussex, England", "loc-hastings", [
        "Et av postkortene familien mottok var knyttet til Hastings.",
        "Kortet gir et kontaktpunkt, ikke en full bevegelseslogg."
      ], ["doc05"], ["src-coroner-2024", "src-timeline-compiled"]),
      quiet("xr05", "XR-05", "Sussex Police – internasjonalt samband", "Sussex, England", "loc-london"),
      quiet("xr06", "XR-06", "Australian High Commission", "London, England", "loc-london"),
      entry("xr07", "XR-07", "Home Affairs – internasjonale bevegelser", "Australia / Europa", "loc-overseas", [
        "Richard Lloyd Westbury forlot Australia 17. juni 1997 med Japan som første destinasjon og returnerte 31. juli.",
        "Reisedatoene ligger fem dager før Marions avreise og to dager før hennes registrerte retur."
      ], ["doc18"], ["src-coroner-2024", "src-parallel-compiled"]),
      quiet("xr08", "XR-08", "Korean Air – internasjonalt arkiv", "Seoul / London", "loc-overseas", { result: "Utover den registrerte utreisen fra Brisbane gir oppslaget ingen bevart offentlig reiserute som forklarer alle mellomliggende stopp." }),
      quiet("xr09", "XR-09", "Japanske innreiseregistre", "Japan", "loc-narita", { result: RECORDS_GONE }),
      entry("xr10", "XR-10", "Public Record Office Victoria – personregister", "Melbourne, Victoria", "loc-overseas", [
        "Ilona Kinczel ankom Australia i 1969 sammen med en mann registrert som Willy Wouters. Hun døde i Melbourne i 1977.",
        "Arkivet fastslår ikke at dødsfallet skyldtes en forbrytelse eller at en annen person medvirket."
      ], [], ["src-ilona-compiled", "src-blum-alias-compiled"], { era: "later" }),
      entry("xr11", "XR-11", "Luxembourg – folkeregister og vitnearkiv", "Luxembourg", "loc-overseas", [
        "Monique Cornelius var tidligere gift med den virkelige Fernand Remakel.",
        "Omkring 1980 korresponderte hun med en annen mann som brukte navnet Frederick De Hedervary. Fernand Remakel er en separat person."
      ], ["doc22"], ["src-coroner-2024", "src-remakel-compiled", "src-blum-alias-compiled"], { era: "later" }),
      entry("xr12", "XR-12", "Europeisk identitetsarkiv", "Belgia / Luxembourg", "loc-overseas", [
        "Et intervju knytter navnene Willy Coppenolle og Willy Wouters til samme livshistorie, men fødselsnavnet bygger på personens egen forklaring.",
        "Arkivet skiller mellom dokumenterte navn og påstander om hvilket navn som var det opprinnelige."
      ], ["doc21"], ["src-coroner-2024", "src-blum-alias-compiled"], { era: "later" })
    ]
  };
})();
