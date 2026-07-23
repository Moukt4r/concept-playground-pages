(() => {
  "use strict";

  const NO_PUBLIC_LINK = "Gjennomgangen gir ingen ny, offentlig kildeført opplysning som knytter denne oppføringen til Marion i perioden. Oppslaget avsluttes uten resultat.";
  const RECORDS_GONE = "Det finnes ingen bevart offentlig dokumentkjede som kan besvare henvendelsen sikkert. Fraværet er ikke bevis for at noe bestemt skjedde.";
  const quiet = (id, code, name, address, locationId, extra = {}) => ({
    id, code, name, address, locationId, cost: 1,
    result: [extra.result || NO_PUBLIC_LINK],
    documentIds: extra.documentIds || [],
    sourceIds: extra.sourceIds || ["src-method"],
    illustration: extra.illustration || null
  });
  const entry = (id, code, name, address, locationId, result, documentIds, sourceIds, extra = {}) => ({
    id, code, name, address, locationId, cost: 1, result, documentIds, sourceIds,
    illustration: extra.illustration || null
  });

  window.CASE_DATA = {
    meta: {
      title: "The Case Files: The Lady Vanishes",
      version: "0.3-historical-deduction",
      actionDisclaimer: "Alle oppslag presenteres som spillrekonstruksjoner. Historiske detaljer er kildeførte; selve henvendelsen hevdes ikke å ha skjedd akkurat slik.",
      currentStatus: [
        "NSW-coroneren fant 29. februar 2024 at Marion Barter er død og trolig døde en gang etter 15. oktober 1997.",
        "Levningene er ikke funnet. Sted, årsak og dødsmåte kunne ikke fastslås.",
        "Flere av opplysningene som er tilgjengelige i denne debriefen ble funnet eller vurdert lenge etter 1997. De var derfor holdt tilbake mens du etterforsket i historisk modus."
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
      { id: "src-method", title: "V0.3 metode: nøytrale kataloghenvendelser", kind: "spillmetode", date: "2026-07-23", note: "En oppføring uten kildeført resultat er en nøytral spillrekonstruksjon, ikke en påstand om at en historisk henvendelse fant sted." }
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

    documents: [
      { id: "doc01", title: "Registrering av hussalget", date: "1997-04-25", dateLabel: "25. april 1997", facsimile: "assets/facsimiles-v03/doc01-house-sale-record.png", alt: "Rekonstruert registerutskrift for salget av huset i Southport.", accuracyNote: "Registrerte verdier er hentet fra offentlige funn. Full registerordlyd er utelatt.", sourceIds: ["src-coroner-2024", "src-timeline-compiled"] },
      { id: "doc02", title: "Oppsigelsesbrev til The Southport School", date: "1997-06-20", dateLabel: "20. juni 1997", facsimile: "assets/facsimiles-v03/doc02-school-resignation-letter.png", alt: "Rekonstruert oppsigelsesbrev med ukjent ordlyd redigert.", accuracyNote: "Bare handlinger beskrevet i offentlige funn er satt med lesbar tekst. Ukjent ordlyd og signatur er redigert.", sourceIds: ["src-coroner-2024", "src-timeline-compiled"] },
      { id: "doc03", title: "Utreisekort og flyregistrering", date: "1997-06-22", dateLabel: "22. juni 1997", facsimile: "assets/facsimiles-v03/doc03-departure-card.png", alt: "Rekonstruert australsk utreisekort med offentlig rapporterte felt.", accuracyNote: "Bare felt som er beskrevet i offentlige funn er fylt ut.", sourceIds: ["src-coroner-2024", "src-evidence-compiled", "src-analysis-compiled"] },
      { id: "doc04", title: "Brevet på Hotel Nikko Narita-papir", date: "1997-06-30", dateLabel: "mottatt 30. juni 1997", facsimile: "assets/facsimiles-v03/doc04-narita-stationery-letter.png", alt: "Rekonstruert brev på Hotel Nikko Narita-brevpapir med brevteksten redigert.", accuracyNote: "Brevpapir og postopplysninger er rekonstruert. Full brevtekst er ikke offentlig gjengitt og er derfor redigert.", sourceIds: ["src-coroner-2024", "src-evidence-compiled", "src-parallel-compiled"] },
      { id: "doc05", title: "Postkortene fra Sussex", date: "1997-07", dateLabel: "sommeren 1997", facsimile: "assets/facsimiles-v03/doc05-sussex-postcards.png", alt: "Rekonstruert postkortmappe for Tunbridge Wells, Rye og Hastings.", accuracyNote: "Bare de tre offentlig rapporterte stedene er vist. Meldinger, adresser og stempler er redigert.", sourceIds: ["src-coroner-2024", "src-timeline-compiled"] },
      { id: "doc06", title: "Innreisekortet", date: "1997-08-02", dateLabel: "2. august 1997", facsimile: "assets/facsimiles-v03/doc06-arrival-card.png", alt: "Rekonstruert innreisekort med offentlig rapporterte felt.", accuracyNote: "Bare rapporterte felt er fylt ut. Ukjente felt og signatur er utelatt.", sourceIds: ["src-coroner-2024", "src-evidence-compiled", "src-analysis-compiled"] },
      { id: "doc08", title: "Notatbokinnførselen ved Byron Bay Police", date: "1997-10-22", dateLabel: "22. oktober 1997", facsimile: "assets/facsimiles-v03/doc08-police-notebook.png", alt: "Rekonstruert politinotat basert på opplysninger gjengitt i senere funn.", accuracyNote: "Dette er en parafrase av offentlig gjengitte opplysninger, ikke ordrett politiordlyd.", sourceIds: ["src-coroner-2024", "src-timeline-compiled"] },
      { id: "doc10", title: "Transaksjonsoversikten", date: "1997-08/10", dateLabel: "august–oktober 1997", facsimile: "assets/facsimiles-v03/doc10-bank-transaction-sheet.png", alt: "Rekonstruert kronologi over rapporterte banktransaksjoner.", accuracyNote: "Kronologien er rekonstruert og er ikke en kontoutskrift. Usikkerheten rundt oktobertransaksjonen er beholdt.", sourceIds: ["src-coroner-2024", "src-evidence-compiled"] },
      { id: "doc11", title: "Queensland-notatet", date: "1997-12-01", dateLabel: "1. desember 1997", facsimile: "assets/facsimiles-v03/doc11-queensland-safe-and-well-note.png", alt: "Rekonstruert Queensland-notat med den offentlig rapporterte safe-and-well-setningen.", accuracyNote: "Den rapporterte setningen er vist. Arbeidsnotatene som skulle forklare grunnlaget, er redigert fordi de ikke foreligger.", sourceIds: ["src-coroner-2024", "src-witnesses-compiled"] },
      { id: "doc12", title: "Salvation Army-brevet", date: "1998-03-18", dateLabel: "18. mars 1998 · senere materiale", facsimile: "assets/facsimiles-v03/doc12-salvation-army-letter.png", alt: "Rekonstruert Salvation Army-brev med full ordlyd redigert.", accuracyNote: "Bare substans som er beskrevet i senere offentlige funn er satt med lesbar tekst.", sourceIds: ["src-coroner-2024", "src-witnesses-compiled"] },
      { id: "doc14", title: "Coronerens funn", date: "2024-02-29", dateLabel: "29. februar 2024 · senere materiale", facsimile: "assets/facsimiles-v03/doc14-coroner-findings-extract.png", alt: "Kondensert rekonstruksjon av coronerens formelle funn.", accuracyNote: "Kondensert, kildefast utdrag; ikke en kopi av den innleverte PDF-en.", sourceIds: ["src-coroner-2024"] }
    ],

    episode: {
      id: "ep1",
      title: "Mor tar ikke telefonen",
      period: "juni–desember 1997",
      actionBudget: 14,
      brief: [
        "Det er oktober 1997. Marion dro fra Southport på en lang reise fire måneder tidligere. Familien har mottatt brev og postkort, men den siste telefonsamtalen ble brutt — og nå svarer hun ikke.",
        "Sally har oppdaget bankaktivitet hun ikke forstår. Du får et åpent register, et kart, de dokumentene familien allerede har, og fjorten veiledende handlinger.",
        "Registeret er ikke kuratert for deg. De fleste oppslag gir lite eller ingenting. Avslutt når du mener du kan forklare hva som faktisk er dokumentert — og hva som fortsatt bare er en antakelse."
      ],
      initialDocumentIds: ["doc04", "doc05"],
      debriefDocumentIds: ["doc12", "doc14"],
      questions: [
        {
          id: "q1", prompt: "Hva viser innreisekortet mest direkte?", correct: "recorded-arrival",
          options: [
            { value: "marriage", label: "At Marion faktisk var gift og bodde i Luxembourg." },
            { value: "recorded-arrival", label: "At en reisende registrert som Florabella Remakel ankom Brisbane 2. august 1997." },
            { value: "hotel", label: "At Marion bodde åtte dager på Novotel." },
            { value: "witness", label: "At et uavhengig vitne så Marion på flyplassen." }
          ],
          explanation: "Kortet dokumenterer den registrerte ankomsten og de oppgitte feltene. Det beviser ikke at livshistorien på kortet var sann, at hotelloppholdet skjedde, eller at et vitne så henne.",
          sourceIds: ["src-coroner-2024", "src-evidence-compiled"]
        },
        {
          id: "q2", prompt: "Hva kan Narita-brevet alene fastslå?", correct: "stationery-post",
          options: [
            { value: "japan-presence", label: "At Marion personlig bodde på hotellet i Narita." },
            { value: "companion", label: "Hvem Marion reiste sammen med." },
            { value: "stationery-post", label: "At Sally mottok et brev på Narita-hotellpapir som var postlagt fra England." },
            { value: "return", label: "At Marion allerede planla å returnere til Australia." }
          ],
          explanation: "Brevpapiret og den engelske postgangen er dokumentert. Brevet alene identifiserer ikke hvem som hentet papiret, hvem som eventuelt var i Japan, eller hva den senere reisen ble.",
          sourceIds: ["src-coroner-2024", "src-evidence-compiled"]
        },
        {
          id: "q3", prompt: "Hva var den største umiddelbare svakheten ved politiets behandling 22. oktober?", correct: "occurrence",
          options: [
            { value: "no-bank", label: "Familien hadde ikke fortalt politiet om bankaktiviteten." },
            { value: "occurrence", label: "Henvendelsen ble registrert som en occurrence, ikke som en aktiv savnetsak." },
            { value: "wrong-date", label: "Politiet registrerte savnetmeldingen på feil år." },
            { value: "no-family", label: "Ingen familiemedlemmer møtte ved politistasjonen." }
          ],
          explanation: "Sally og Chris møtte opp og formidlet alvorlige opplysninger, men saken ble ikke åpnet som en aktiv savnetetterforskning.",
          sourceIds: ["src-coroner-2024", "src-timeline-compiled", "src-case-hub"]
        },
        {
          id: "q4", prompt: "Hvorfor er Queensland-notatet ikke en full verifikasjon alene?", correct: "missing-basis",
          options: [
            { value: "unsigned", label: "Fordi alle usignerte dokumenter automatisk er falske." },
            { value: "missing-basis", label: "Fordi detaljarkene som kunne vist grunnlaget for «safe and well», ikke var tilgjengelige i senere kontroll." },
            { value: "wrong-state", label: "Fordi Queensland aldri kunne undersøke en person fra New South Wales." },
            { value: "family-rejected", label: "Fordi familien umiddelbart beviste at notatet var feil." }
          ],
          explanation: "Notatet eksisterte og fikk stor praktisk virkning, men den underliggende dokumentkjeden som skulle forklare hva som faktisk var kontrollert, manglet.",
          sourceIds: ["src-coroner-2024", "src-witnesses-compiled"]
        },
        {
          id: "q5", prompt: "Hva er den mest presise konklusjonen om bankmønsteret?", correct: "activity-not-user",
          options: [
            { value: "activity-not-user", label: "Det dokumenterer aktivitet på kontoen, men identifiserer ikke alene hvem som utførte alle transaksjonene eller hvorfor." },
            { value: "forced", label: "Det beviser at alle uttak ble gjort under tvang." },
            { value: "voluntary", label: "Det beviser at Marion frivillig forlot familien." },
            { value: "overseas", label: "Det beviser at pengene endte på en bestemt utenlandsk konto." }
          ],
          explanation: "Datoer, steder og beløp kan dokumenteres. Bruker, motiv og endelig destinasjon krever andre kilder og kan ikke leses direkte ut av mønsteret.",
          sourceIds: ["src-coroner-2024", "src-evidence-compiled"]
        }
      ]
    },

    directory: [
      entry("sp01", "SP-01", "Queensland Titles Office – Southport", "Merinda Court, Southport", "loc-merinda", [
        "Registeropplysningene viser at Marions hus ble solgt 25. april 1997 for A$165 000. Prisantydningen var A$175 000.",
        "Oppslaget sier ingenting om hvorfor prisen ble akseptert eller hva pengene senere ble brukt til."
      ], ["doc01"], ["src-coroner-2024", "src-timeline-compiled"], { illustration: { file: "assets/illustrations-flux2/southport-house-1997.webp", alt: "Illustrasjon – ikke fotografi: et hus i Southport våren 1997." } }),
      quiet("sp02", "SP-02", "Gold Coast eiendomsmeglerforening", "Southport, Queensland", "loc-southport"),
      entry("sp03", "SP-03", "Lesley Loveday", "Southport, Queensland", "loc-southport", [
        "Lesley forklarer at hun kjørte Marion til busstasjonen i Southport 22. juni 1997.",
        "Dette er den siste ukontroversielle observasjonen før utenlandsreisen. Lesley beskriver også en plan om lang ferie og mulig undervisningsarbeid i England eller Europa."
      ], [], ["src-coroner-2024", "src-witnesses-compiled"], { illustration: { file: "assets/illustrations-flux2/southport-bus-station-1997.webp", alt: "Illustrasjon – ikke fotografi: Southport busstasjon 22. juni 1997." } }),
      quiet("sp04", "SP-04", "Southport busstasjon", "Southport, Queensland", "loc-southport", { result: "Ingen bevart billett-, bagasje- eller vitnelogg fra busstasjonen gir et nytt sikkert spor. Lesley Lovedays forklaring står fortsatt alene." }),
      entry("sp05", "SP-05", "The Southport School – administrasjonen", "Winchester Street, Southport", "loc-tss", [
        "Skolematerialet viser at Marion avsluttet stillingen med virkning fra 20. juni 1997.",
        "Et bevart brev ber samtidig om fornyelse av lærerregistreringen for 1998 og bruker Lesley Lovedays adresse som kontaktpunkt."
      ], ["doc02"], ["src-coroner-2024", "src-timeline-compiled"]),
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
        "Kollegene kjente planen om en lengre utenlandsreise og mulig arbeid som lærer i England eller Europa.",
        "Ingen offentlig kildeført kollegaopplysning forklarer Narita-brevpapiret, bankaktiviteten eller stillheten senere på året."
      ], [], ["src-coroner-2024", "src-timeline-compiled"]),

      quiet("gc01", "GC-01", "Brisbane Airport – informasjon", "Brisbane Airport", "loc-brisbane", { illustration: { file: "assets/illustrations-flux2/brisbane-airport-1997.webp", alt: "Illustrasjon – ikke fotografi: Brisbane Airport i 1997." } }),
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
      quiet("gc08", "GC-08", "Department of Immigration – Brisbane", "Brisbane, Queensland", "loc-brisbane", { result: "Et oppslag på det kjente navnet Marion Barter gir ingen enkel forklaring. Eventuelle treff under andre navn må finnes gjennom konkrete reisedokumenter, ikke antas." }),
      quiet("gc09", "GC-09", "Department of Foreign Affairs and Trade", "Brisbane-kontoret", "loc-brisbane"),
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
      quiet("ns04", "NS-04", "Butikkene i Byron Bay", "Byron Bay, New South Wales", "loc-byron", { result: "Familien undersøkte lokalt, men det offentlige materialet bevarer ingen sikker butikkobservasjon av Marion." }),
      quiet("ns05", "NS-05", "Overnattingssteder i Byron Bay", "Byron Bay, New South Wales", "loc-byron"),
      quiet("ns06", "NS-06", "Byron District Hospital", "Byron Bay, New South Wales", "loc-byron"),
      quiet("ns07", "NS-07", "Australia Post – Byron Bay", "Byron Bay, New South Wales", "loc-byron"),
      entry("ns08", "NS-08", "Colonial State Bank – Burleigh Heads", "Burleigh Heads, Queensland", "loc-burleigh", [
        "Det rapporterte mønsteret inkluderer uttak i Burleigh Heads 21. og 22. august 1997.",
        "Oppslaget dokumenterer kontobevegelse, ikke sikkert fysisk opphold eller identiteten til personen ved automaten."
      ], ["doc10"], ["src-coroner-2024", "src-evidence-compiled"]),
      quiet("ns09", "NS-09", "Optikerregisteret – Grafton", "Grafton, New South Wales", "loc-grafton", { result: "Et senere registerspor peker mot bruk av et Medicare-kort i Grafton, men ingen bevart journal eller samtidig 1997-erindring kan identifisere pasienten sikkert. Oppslaget løser derfor ingenting i denne tidsrammen.", sourceIds: ["src-coroner-2024", "src-witnesses-compiled"] }),
      quiet("ns10", "NS-10", "Grafton Base Hospital", "Grafton, New South Wales", "loc-grafton"),
      quiet("ns11", "NS-11", "Ballina Police Station", "Ballina, New South Wales", "loc-ballina"),
      quiet("ns12", "NS-12", "Bankfilialene i Ballina", "Ballina, New South Wales", "loc-ballina"),
      quiet("ns13", "NS-13", "Wollongbar telefonkatalog", "Wollongbar, New South Wales", "loc-lismore"),
      quiet("ns14", "NS-14", "Lismore Police Station", "Lismore, New South Wales", "loc-lismore"),
      quiet("ns15", "NS-15", "Tweed Heads Hospital", "Tweed Heads, New South Wales", "loc-tweed"),
      entry("ns16", "NS-16", "NSW Missing Persons Unit", "New South Wales", "loc-nsw", [
        "Det finnes ingen aktiv savnetsak fra 22. oktober å hente her. Den opprinnelige henvendelsen ble liggende som en occurrence.",
        "Mangelen på aktiv sak er et administrativt resultat, ikke et tegn på at Marion var funnet."
      ], [], ["src-coroner-2024", "src-case-hub"]),
      quiet("ns17", "NS-17", "Bankenes sentrale arkivkontor", "New South Wales", "loc-nsw", { result: "Ingen komplett bankdokumentkjede blir sikret gjennom dette oppslaget. Senere tap av arkivmateriale gjør at flere spørsmål ikke kan kontrolleres fullt ut.", sourceIds: ["src-coroner-2024", "src-case-hub"] }),
      quiet("ns18", "NS-18", "Northern Star / lokale aviser", "Northern Rivers, New South Wales", "loc-nsw"),

      quiet("xr01", "XR-01", "Hotel Nikko Narita", "Narita, Japan", "loc-narita", { result: "Brevpapiret samsvarer med Hotel Nikko Narita, men ingen bevart offentlig gjesteliste i denne henvendelsen viser hvem som tok papiret eller når.", sourceIds: ["src-coroner-2024", "src-parallel-compiled"] }),
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
      quiet("xr07", "XR-07", "Flyplassarkivene i London", "London, England", "loc-london"),
      quiet("xr08", "XR-08", "Korean Air – internasjonalt arkiv", "Seoul / London", "loc-overseas", { result: "Utover den registrerte utreisen fra Brisbane gir oppslaget ingen bevart offentlig reiserute som forklarer alle mellomliggende stopp." }),
      quiet("xr09", "XR-09", "Japanske innreiseregistre", "Japan", "loc-narita", { result: RECORDS_GONE }),
      quiet("xr10", "XR-10", "Sykehusene i Sussex", "Kent og East Sussex", "loc-tunbridge"),
      quiet("xr11", "XR-11", "Lærervikarbyråene i Sør-England", "Kent og East Sussex", "loc-tunbridge"),
      quiet("xr12", "XR-12", "Europeiske skoleformidlinger", "Europa", "loc-overseas")
    ]
  };
})();
