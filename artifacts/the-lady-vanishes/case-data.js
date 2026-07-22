window.CASE_DATA = {
  meta: {
    title: "The Case Files: The Lady Vanishes",
    caseKey: "the-lady-vanishes",
    version: "0.2-public-canonical",
    language: "nb-NO",
    publicOnly: true,
    generatedOn: "2026-07-22",
    summary: "Offentlig kanonisk innholdspakke om Marion Barter-saken, bygget på coronerfunnene fra 2024 og offentlige, kildeførte sammendrag.",
    scope: "Kun offentlig kjent saksinformasjon. Ingen private Second Brain-notater eller personlige opplysninger utenfor offentlig saksmateriale.",
    currentFrame: "Coroneren fant 29.02.2024 at Marion Barter er død og trolig døde en gang etter 15.10.1997. Levningene er ikke funnet. Sted, årsak og dødsmåte er ikke fastslått.",
    caution: "Ric Blum omtales kun som person av interesse. Han er ikke tiltalt i saken, og coroneren fant ikke at han forårsaket Marions død.",
    futureEpisodes: [
      { id: "ep2", title: "Florabella", period: "mai-august 1997", status: "placeholder" },
      { id: "ep3", title: "Pengene", period: "august-oktober 1997", status: "placeholder" },
      { id: "ep4", title: "Ric Blum", period: "2021-2023", status: "placeholder" },
      { id: "ep5", title: "Systemsvikten", period: "1997-2019", status: "placeholder" },
      { id: "ep6", title: "Inquest", period: "2021-2024", status: "placeholder" },
      { id: "ep7", title: "Det som fortsatt mangler", period: "2024-", status: "placeholder" }
    ]
  },
  sources: [
    {
      id: "src-coroner-2024",
      title: "NSW State Coroner findings: Inquest into the disappearance and suspected death of Florabella Natalia Marion Remakel, formerly known as Marion Barter",
      kind: "primary",
      date: "2024-02-29",
      note: "Primærkilden. Offentlige funn fra coroneren som går foran senere mediesammendrag når detaljer spriker."
    },
    {
      id: "src-timeline-compiled",
      title: "Marion Barter – tidslinje",
      kind: "compiled",
      date: "2026-07-20",
      note: "Offentlig, kildeført tidslinje bygget på coronerfunnene."
    },
    {
      id: "src-evidence-compiled",
      title: "Marion Barter – bevisregister",
      kind: "compiled",
      date: "2026-07-20",
      note: "Offentlig register over nøkkelbevis og hva de viser."
    },
    {
      id: "src-witnesses-compiled",
      title: "Marion Barter – vitner og observasjoner",
      kind: "compiled",
      date: "2026-07-20",
      note: "Offentlig oversikt over vitner, observasjoner og åpne hull."
    },
    {
      id: "src-analysis-compiled",
      title: "Marion Barter – analyse",
      kind: "compiled",
      date: "2026-07-20",
      note: "Offentlig analyse som skiller fakta, slutninger og teorier."
    },
    {
      id: "src-parallel-compiled",
      title: "Marion Barter – parallell tidslinje",
      kind: "compiled",
      date: "2026-07-20",
      note: "Offentlig dobbel tidslinje brukt for å plassere samtidige hendelser ved siden av hverandre."
    },
    {
      id: "src-archives-compiled",
      title: "Marion Barter – primærkilder og arkiv",
      kind: "compiled",
      date: "2026-07-20",
      note: "Offentlig katalog over orderbare arkivposter og dokumenthull."
    },
    {
      id: "src-case-hub",
      title: "Marion Barter-saken – hub",
      kind: "compiled",
      date: "2026-07-20",
      note: "Offentlig oversiktsartikkel som samler status, advarsler og kart over saken."
    }
  ],
  locations: [
    {
      id: "loc-southport",
      name: "Southport",
      type: "suburb",
      region: "Queensland",
      country: "Australia",
      lat: -27.9673,
      lng: 153.3970,
      note: "Familiens og avreisens utgangspunkt på Gold Coast.",
      sourceIds: ["src-timeline-compiled", "src-coroner-2024"]
    },
    {
      id: "loc-merinda-court",
      name: "Merinda Court, Southport",
      type: "residence",
      region: "Queensland",
      country: "Australia",
      lat: -27.9750,
      lng: 153.4040,
      note: "Marions hus i Southport ble solgt våren 1997.",
      sourceIds: ["src-coroner-2024", "src-timeline-compiled"]
    },
    {
      id: "loc-ashmore",
      name: "Ashmore",
      type: "suburb",
      region: "Queensland",
      country: "Australia",
      lat: -27.9894,
      lng: 153.3725,
      note: "Kolonial State Banks Ashmore-gren og nærområde rundt tidligere bolig.",
      sourceIds: ["src-coroner-2024"]
    },
    {
      id: "loc-tss",
      name: "The Southport School",
      type: "school",
      region: "Queensland",
      country: "Australia",
      lat: -27.9607,
      lng: 153.4007,
      note: "Marions arbeidsplass før reisen.",
      sourceIds: ["src-coroner-2024", "src-timeline-compiled"]
    },
    {
      id: "loc-brisbane-airport",
      name: "Brisbane Airport",
      type: "airport",
      region: "Queensland",
      country: "Australia",
      lat: -27.3842,
      lng: 153.1175,
      note: "Registrert utreise 22.06.1997 og registrert innreise 02.08.1997.",
      sourceIds: ["src-coroner-2024", "src-evidence-compiled"]
    },
    {
      id: "loc-byron-bay",
      name: "Byron Bay",
      type: "town",
      region: "New South Wales",
      country: "Australia",
      lat: -28.6474,
      lng: 153.6020,
      note: "Klynge for augustuttak, bankspor og savnetmelding.",
      sourceIds: ["src-coroner-2024", "src-evidence-compiled"]
    },
    {
      id: "loc-burleigh-heads",
      name: "Burleigh Heads",
      type: "suburb",
      region: "Queensland",
      country: "Australia",
      lat: -28.0977,
      lng: 153.4532,
      note: "To av de registrerte uttakene i august 1997 skjedde her.",
      sourceIds: ["src-coroner-2024", "src-timeline-compiled"]
    },
    {
      id: "loc-grafton",
      name: "Grafton",
      type: "town",
      region: "New South Wales",
      country: "Australia",
      lat: -29.6903,
      lng: 152.9333,
      note: "Medicare-registrert optikerkonsultasjon 13.08.1997.",
      sourceIds: ["src-coroner-2024", "src-witnesses-compiled"]
    },
    {
      id: "loc-ballina",
      name: "Ballina",
      type: "town",
      region: "New South Wales",
      country: "Australia",
      lat: -28.8667,
      lng: 153.5667,
      note: "Senere relevant for safe-custody-sporet 14.10.1997.",
      sourceIds: ["src-coroner-2024", "src-parallel-compiled"]
    },
    {
      id: "loc-wollongbar",
      name: "Wollongbar",
      type: "town",
      region: "New South Wales",
      country: "Australia",
      lat: -28.8167,
      lng: 153.4167,
      note: "Senere relevant som Ric Blums base i perioden.",
      sourceIds: ["src-analysis-compiled", "src-parallel-compiled"]
    },
    {
      id: "loc-narita",
      name: "Narita",
      type: "city",
      region: "Chiba",
      country: "Japan",
      lat: 35.7765,
      lng: 140.3189,
      note: "Hotel Nikko Narita-brevpapiret knytter et tidlig reisespor hit.",
      sourceIds: ["src-coroner-2024", "src-parallel-compiled"]
    },
    {
      id: "loc-tunbridge-wells",
      name: "Tunbridge Wells",
      type: "town",
      region: "Kent",
      country: "United Kingdom",
      lat: 51.1324,
      lng: 0.2637,
      note: "Et av stedene som postkortene plasserer Marion i sommeren 1997.",
      sourceIds: ["src-coroner-2024", "src-timeline-compiled"]
    },
    {
      id: "loc-rye",
      name: "Rye",
      type: "town",
      region: "East Sussex",
      country: "United Kingdom",
      lat: 50.9511,
      lng: 0.7338,
      note: "Postkortsted sommeren 1997.",
      sourceIds: ["src-coroner-2024", "src-timeline-compiled"]
    },
    {
      id: "loc-hastings",
      name: "Hastings",
      type: "town",
      region: "East Sussex",
      country: "United Kingdom",
      lat: 50.8552,
      lng: 0.5729,
      note: "Postkortsted sommeren 1997.",
      sourceIds: ["src-coroner-2024", "src-timeline-compiled"]
    }
  ],
  claims: {
    c01: {
      id: "c01",
      title: "Huset ble solgt billig og raskt",
      text: "Marion solgte huset i Southport 25. april 1997 for A$165 000, etter å ha lagt det ut for A$175 000.",
      tag: "fact",
      confidence: "high",
      knownFrom: "Våren 1997",
      sourceIds: ["src-coroner-2024", "src-timeline-compiled"]
    },
    c02: {
      id: "c02",
      title: "Hun snakket om lang ferie og mulig arbeid i England",
      text: "Før avreisen fortalte Marion venner og familie at hun planla en lengre utenlandstur og håpet å undervise i England eller Europa før hun kom tilbake.",
      tag: "fact",
      confidence: "high",
      knownFrom: "Våren 1997",
      sourceIds: ["src-coroner-2024", "src-timeline-compiled"]
    },
    c03: {
      id: "c03",
      title: "Oppsigelsesbrevet pekte også mot retur",
      text: "I oppsigelsesbrevet til The Southport School ba Marion samtidig om fornyelse av lærerregistreringen for 1998, noe coroneren leste som forenlig med en plan om å komme tilbake.",
      tag: "fact",
      confidence: "high",
      knownFrom: "Dokument kjent senere",
      sourceIds: ["src-coroner-2024", "src-timeline-compiled"]
    },
    c04: {
      id: "c04",
      title: "Lesley Loveday var siste ubestridte avreisvitne",
      text: "Lesley Loveday kjørte Marion til busstasjonen i Southport 22. juni 1997 og er den siste ukontroversielle personen som så henne før utenlandsreisen.",
      tag: "fact",
      confidence: "high",
      knownFrom: "22.06.1997",
      sourceIds: ["src-coroner-2024", "src-witnesses-compiled"]
    },
    c05: {
      id: "c05",
      title: "Registrert utreise fra Brisbane",
      text: "Flyregistrene viser at Marion forlot Brisbane 22. juni 1997 kl. 21:38 på Korean Airlines under navnet Florabella Remakel.",
      tag: "fact",
      confidence: "high",
      knownFrom: "Offisielle reisedata kjent senere",
      sourceIds: ["src-coroner-2024", "src-evidence-compiled"]
    },
    c06: {
      id: "c06",
      title: "Tre ord på utreisekortet skal ha vært skrevet av en annen hånd",
      text: "Coroneren aksepterte at ordene " + '"Europe", "Luxembourg" og "S/Korea"' + " på utreisekortet ikke var skrevet av Marion, men av en ukjent person.",
      tag: "inferred",
      confidence: "medium",
      knownFrom: "Inquest-materiale kjent senere",
      sourceIds: ["src-coroner-2024", "src-analysis-compiled"]
    },
    c07: {
      id: "c07",
      title: "Brevet fra England kom på Narita-brevpapir",
      text: "Sally mottok 30. juni 1997 et brev fra Marion skrevet på Hotel Nikko Narita-brevpapir og postlagt fra England.",
      tag: "fact",
      confidence: "high",
      knownFrom: "30.06.1997",
      sourceIds: ["src-coroner-2024", "src-evidence-compiled"]
    },
    c08: {
      id: "c08",
      title: "Postkort plasserte henne i Sussex-området",
      text: "Sommeren 1997 kom det postkort fra Tunbridge Wells, Rye og Hastings.",
      tag: "fact",
      confidence: "high",
      knownFrom: "Juli-august 1997",
      sourceIds: ["src-coroner-2024", "src-timeline-compiled"]
    },
    c09: {
      id: "c09",
      title: "Siste samtale: te med gamle damer",
      text: "Den siste telefonsamtalen med Sally kom rundt 30. juli eller 1. august 1997. Marion ringte fra betalingstelefon, linjen falt ut, og hun sa at hun hadde te med noen gamle damer.",
      tag: "fact",
      confidence: "high",
      knownFrom: "Slutten av juli / starten av august 1997",
      sourceIds: ["src-coroner-2024", "src-witnesses-compiled"]
    },
    c10: {
      id: "c10",
      title: "Registrert retur 2. august",
      text: "Home Affairs-flydata viser at Florabella Remakel ankom Brisbane 2. august 1997 kl. 10:11 på Cathay Pacific.",
      tag: "fact",
      confidence: "high",
      knownFrom: "Offisielle reisedata kjent senere",
      sourceIds: ["src-coroner-2024", "src-evidence-compiled"]
    },
    c11: {
      id: "c11",
      title: "Innreisekortet beskrev en gift besøksreisende fra Luxembourg",
      text: "Innreisekortet 2. august 1997 oppga status som gift, bostedsland Luxembourg, yrke hjemmeværende og planlagt opphold på åtte dager ved Novotel i Brisbane.",
      tag: "fact",
      confidence: "high",
      knownFrom: "Dokument kjent senere",
      sourceIds: ["src-coroner-2024", "src-evidence-compiled"]
    },
    c12: {
      id: "c12",
      title: "Coroneren fant at Marion selv trolig returnerte",
      text: "Coroneren fant at Marion selv, under navnet Florabella, returnerte til Australia 2. august 1997.",
      tag: "fact",
      confidence: "high",
      knownFrom: "29.02.2024",
      sourceIds: ["src-coroner-2024", "src-analysis-compiled"]
    },
    c13: {
      id: "c13",
      title: "Medicare-spor i Grafton",
      text: "Marions Medicare-kort ble brukt 13. august 1997 ved en førstegangskonsultasjon hos optiker Dean Evans i Grafton, men det kan ikke fastslås sikkert hvem som møtte opp.",
      tag: "fact",
      confidence: "medium",
      knownFrom: "Senere registerfunn",
      sourceIds: ["src-coroner-2024", "src-witnesses-compiled"]
    },
    c14: {
      id: "c14",
      title: "Augustuttakene var sannsynligvis på $500, ikke $5000",
      text: "Coroneren konkluderte med at uttakene i august 1997 mest sannsynlig var på $500 per gang, ikke $5000, fordi det samsvarer med datidens minibankgrense og mønsteret i memoet fra John Wilson.",
      tag: "fact",
      confidence: "high",
      knownFrom: "29.02.2024",
      sourceIds: ["src-coroner-2024", "src-evidence-compiled"]
    },
    c15: {
      id: "c15",
      title: "Uttaksmønsteret i august er detaljert",
      text: "Mønsteret som er gjengitt i materialet er to uttak à $500 i Byron Bay 18. august, ett i Burleigh Heads 21. august, ett i Burleigh Heads 22. august og deretter ett à $500 hver dag i Byron Bay 23.-28. august.",
      tag: "fact",
      confidence: "high",
      knownFrom: "Opplysninger samlet høsten 1997, tolket senere",
      sourceIds: ["src-coroner-2024", "src-evidence-compiled"]
    },
    c16: {
      id: "c16",
      title: "$80 000 flyttet 15. oktober",
      text: "Den 15. oktober 1997 ble omtrent $80 000 enten tatt ut eller overført fra Marions konto. Samtidige notater beskrev det som en telegrafisk overføring, muligvis til en utenlandsk konto.",
      tag: "fact",
      confidence: "high",
      knownFrom: "22.10.1997",
      sourceIds: ["src-coroner-2024", "src-evidence-compiled"]
    },
    c17: {
      id: "c17",
      title: "Joan Hazlett var 9 av 10 sikker",
      text: "Banklederen Joan Hazlett vitnet om at hun var ni av ti sikker på at kvinnen hun bistod ved den store transaksjonen var Marion.",
      tag: "fact",
      confidence: "medium",
      knownFrom: "Vitnemål 2022",
      sourceIds: ["src-coroner-2024", "src-witnesses-compiled"]
    },
    c18: {
      id: "c18",
      title: "Coroneren fant at Marion selv gjorde 15. oktober-transaksjonen",
      text: "Coroneren fant at Marion selv møtte i bank 15. oktober 1997, ba om transaksjonen og sa at hun ikke ønsket at oppholdsstedet hennes skulle oppgis.",
      tag: "fact",
      confidence: "high",
      knownFrom: "29.02.2024",
      sourceIds: ["src-coroner-2024", "src-analysis-compiled"]
    },
    c19: {
      id: "c19",
      title: "Savnetmeldingen kom 22. oktober",
      text: "Sally og Chris møtte opp ved Byron Bay politistasjon 22. oktober 1997 og meldte Marion savnet etter å ha oppdaget kontobevegelser og returinformasjon de ikke forsto.",
      tag: "fact",
      confidence: "high",
      knownFrom: "22.10.1997",
      sourceIds: ["src-coroner-2024", "src-timeline-compiled"]
    },
    c20: {
      id: "c20",
      title: "Politiet behandlet det som 'occurrence only'",
      text: "NSW Police registrerte hendelsen som " + '"occurrence only"' + " i stedet for å opprette en aktiv savnetetterforskning.",
      tag: "fact",
      confidence: "high",
      knownFrom: "22.10.1997 / funn 2024",
      sourceIds: ["src-coroner-2024", "src-case-hub"]
    },
    c21: {
      id: "c21",
      title: "Queensland-notat: 'located safe and well'",
      text: "Et notat i Queensland Missing Persons Bureau datert 1. desember 1997 sa " + '"Missing person located safe and well, whereabouts not to be disclosed"' + ".",
      tag: "fact",
      confidence: "high",
      knownFrom: "01.12.1997",
      sourceIds: ["src-coroner-2024", "src-witnesses-compiled"]
    },
    c22: {
      id: "c22",
      title: "Frelsesarmeen videreformidlet en feilaktig trygghet",
      text: "Et brev fra Salvation Army Family Tracing Service 18. mars 1998 videreformidlet at Marion var funnet og hadde snakket om å starte et nytt liv, men den konkrete henvisningen til en bank-'security officer' lot seg ikke underbygge.",
      tag: "fact",
      confidence: "high",
      knownFrom: "18.03.1998",
      sourceIds: ["src-coroner-2024", "src-witnesses-compiled"]
    },
    c23: {
      id: "c23",
      title: "Ingen verifisert kontakt etter 15. oktober",
      text: "Etter 15. oktober 1997 finnes det ingen verifisert kontakt fra Marion og ingen bekreftet livsobservasjon.",
      tag: "fact",
      confidence: "high",
      knownFrom: "Etterspill og coronerfunn",
      sourceIds: ["src-coroner-2024", "src-witnesses-compiled"]
    },
    c24: {
      id: "c24",
      title: "Avgjørende bankdata gikk tapt",
      text: "Coronermaterialet viser at bankregistre fra 1997 sannsynligvis fortsatt kunne vært hentet i 2004, men senere gikk tapt, inkludert spor som kunne ha vist hvor $80 000 tok veien.",
      tag: "fact",
      confidence: "high",
      knownFrom: "Funn 2024 om etterforskningen",
      sourceIds: ["src-coroner-2024", "src-case-hub"]
    },
    c25: {
      id: "c25",
      title: "2011-omklassifiseringen var feil",
      text: "Coroneren fant at det var feil å omklassifisere Marion som " + '"located"' + " i 2011, og at dette bidro til ytterligere fem år uten aktiv fremdrift.",
      tag: "fact",
      confidence: "high",
      knownFrom: "29.02.2024",
      sourceIds: ["src-coroner-2024", "src-timeline-compiled"]
    },
    c26: {
      id: "c26",
      title: "Marion ble erklært død",
      text: "Coroneren fant på sannsynlighetsovervekt at Marion er død.",
      tag: "fact",
      confidence: "high",
      knownFrom: "29.02.2024",
      sourceIds: ["src-coroner-2024", "src-case-hub"]
    },
    c27: {
      id: "c27",
      title: "Døden ble plassert etter 15. oktober 1997",
      text: "Coroneren fant at Marion sannsynligvis døde på et ukjent tidspunkt etter 15. oktober 1997.",
      tag: "fact",
      confidence: "high",
      knownFrom: "29.02.2024",
      sourceIds: ["src-coroner-2024", "src-case-hub"]
    },
    c28: {
      id: "c28",
      title: "Sted, årsak og dødsmåte er ukjent",
      text: "Coroneren fant ingen tilstrekkelige bevis til å fastslå dødssted, dødsårsak eller dødsmåte, og levningene er ikke funnet.",
      tag: "fact",
      confidence: "high",
      knownFrom: "29.02.2024",
      sourceIds: ["src-coroner-2024", "src-analysis-compiled"]
    },
    c29: {
      id: "c29",
      title: "Navnebytte til Florabella Natalia Marion Remakel",
      text: "Marion endret navn ved deed poll 13. mai 1997 til Florabella Natalia Marion Remakel uten å fortelle det til familie eller venner.",
      tag: "fact",
      confidence: "high",
      knownFrom: "Dokument kjent senere",
      sourceIds: ["src-coroner-2024", "src-evidence-compiled"]
    },
    c30: {
      id: "c30",
      title: "Nytt pass i nytt navn",
      text: "Et nytt pass i navnet Florabella Natalia Marion Remakel ble utstedt 20. mai 1997.",
      tag: "fact",
      confidence: "high",
      knownFrom: "Dokument kjent senere",
      sourceIds: ["src-coroner-2024", "src-evidence-compiled"]
    },
    c31: {
      id: "c31",
      title: "Coroneren fant en skjult 1997-relasjon til Ric Blum",
      text: "I de senere inquest-rundene fant coroneren at Marion og Ric Blum hadde en romantisk relasjon i 1997.",
      tag: "fact",
      confidence: "high",
      knownFrom: "Inquest 2022 / funn 2024",
      sourceIds: ["src-coroner-2024", "src-analysis-compiled"]
    },
    c32: {
      id: "c32",
      title: "Ingen uavhengig tredjepart så dem sammen",
      text: "Samtidig fant coroneren at det ikke finnes noen uavhengig tredjepartsobservasjon av Marion og Ric Blum sammen.",
      tag: "fact",
      confidence: "high",
      knownFrom: "29.02.2024",
      sourceIds: ["src-coroner-2024", "src-witnesses-compiled"]
    },
    c33: {
      id: "c33",
      title: "Narita-brevpapiret fikk en senere Ric-kobling",
      text: "Det samme hotellet i Narita som ga navn til brevpapiret var et sted coroneren senere plasserte Ric Blum 17. juni 1997.",
      tag: "fact",
      confidence: "high",
      knownFrom: "Senere arkivsammenstilling",
      sourceIds: ["src-coroner-2024", "src-parallel-compiled"]
    },
    c34: {
      id: "c34",
      title: "Coroneren pekte på sammenfall rundt Ric Blum, men ikke på dødsårsak",
      text: "Coroneren beskrev flere slående sammenfall rundt Ric Blum og fant at han holdt tilbake relevant kunnskap, men fant ikke bevis for å avgjøre at han forårsaket Marions død.",
      tag: "fact",
      confidence: "high",
      knownFrom: "29.02.2024",
      sourceIds: ["src-coroner-2024", "src-analysis-compiled", "src-case-hub"]
    },
    c35: {
      id: "c35",
      title: "Safe-custody-spor dagen før $80 000",
      text: "Et senere dokumentspor viser at Ric Blum åpnet en safe-custody-konvolutt i Ballina 14. oktober 1997, dagen før $80 000 ble flyttet fra Marions konto.",
      tag: "fact",
      confidence: "high",
      knownFrom: "Senere arkivfunn",
      sourceIds: ["src-coroner-2024", "src-parallel-compiled"]
    }
  },
  documents: [
    {
      id: "doc01",
      title: "Salget av huset i Southport",
      kind: "record",
      date: "1997-04-25",
      eyebrow: "Før avreisen",
      body: [
        "Eiendomssalget er et av de tidligste harde tegnene på at livet hennes ble pakket ned raskt våren 1997.",
        "Beløpet var A$165 000, lavere enn prisantydning. I senere tolkninger ble dette lest som et økonomisk sårbart startpunkt for resten av historien."
      ],
      claimIds: ["c01"],
      sourceIds: ["src-coroner-2024", "src-timeline-compiled"],
      knownFrom: "1997"
    },
    {
      id: "doc02",
      title: "Oppsigelsesbrev til The Southport School",
      kind: "letter",
      date: "1997-06-20",
      eyebrow: "Arbeidsliv",
      body: [
        "Marion sa opp stillingen ved The Southport School med virkning fra 20. juni 1997.",
        "Brevet ba også om fornyelse av lærerregistreringen for 1998 og ga Lesley Lovedays adresse som kontaktpunkt. Det kompliserer ideen om at hun entydig planla å forsvinne for godt."
      ],
      claimIds: ["c02", "c03"],
      sourceIds: ["src-coroner-2024", "src-timeline-compiled"],
      knownFrom: "Dokumentet ble kjent senere"
    },
    {
      id: "doc03",
      title: "Utreisekort og flyregistrering",
      kind: "travel-record",
      date: "1997-06-22",
      eyebrow: "Offisiell reise",
      body: [
        "Flyregistrene viser avreise fra Brisbane 22. juni 1997 kl. 21:38 på Korean Airlines under navnet Florabella Remakel.",
        "På utreisekortet mente coroneren senere at tre ord var skrevet av en annen hånd enn Marions: Europe, Luxembourg og S/Korea."
      ],
      claimIds: ["c05", "c06"],
      sourceIds: ["src-coroner-2024", "src-evidence-compiled", "src-analysis-compiled"],
      knownFrom: "Kjent gjennom senere saksdokumenter",
      lockedUntil: "Arkivspor"
    },
    {
      id: "doc04",
      title: "Hotel Nikko Narita-brevet",
      kind: "letter",
      date: "1997-06-30",
      eyebrow: "Fra England",
      body: [
        "Sally mottok et brev fra Marion på Hotel Nikko Narita-brevpapir, postlagt fra England 30. juni 1997.",
        "Brevpapiret ble senere et sentralt spor fordi det kom fra et hotell som ikke lå åpent i den enkle familiehistorien om en soloreise til England."
      ],
      claimIds: ["c07", "c33"],
      sourceIds: ["src-coroner-2024", "src-evidence-compiled", "src-parallel-compiled"],
      knownFrom: "30.06.1997"
    },
    {
      id: "doc05",
      title: "Postkortene fra Sussex-området",
      kind: "postcard",
      date: "1997-07",
      eyebrow: "Reisespor",
      body: [
        "Postkort fra Tunbridge Wells, Rye og Hastings holdt fortellingen om en levende og reisende Marion i gang gjennom sommeren 1997.",
        "Men de sa lite om hvem hun var sammen med, hvordan hun reiste eller hvorfor ingen visste at hun senere skulle være tilbake i Australia på papiret."
      ],
      claimIds: ["c08"],
      sourceIds: ["src-coroner-2024", "src-timeline-compiled"],
      knownFrom: "Sommeren 1997"
    },
    {
      id: "doc06",
      title: "Innreisekortet 2. august 1997",
      kind: "travel-record",
      date: "1997-08-02",
      eyebrow: "Retur på papiret",
      body: [
        "Innreisekortet plasserer Florabella Remakel i Brisbane kl. 10:11 den 2. august 1997 på Cathay Pacific.",
        "Kortet beskrev en gift besøksreisende fra Luxembourg med planlagt opphold ved Novotel i Brisbane. Ingen fysisk observasjon på flyplassen følger med kortet."
      ],
      claimIds: ["c10", "c11", "c12"],
      sourceIds: ["src-coroner-2024", "src-evidence-compiled", "src-analysis-compiled"],
      knownFrom: "Kjent gjennom senere saksdokumenter",
      lockedUntil: "Arkivspor"
    },
    {
      id: "doc07",
      title: "Medicare-spor hos optiker i Grafton",
      kind: "medical-record",
      date: "1997-08-13",
      eyebrow: "Usikkert livstegn",
      body: [
        "Et Medicare-oppgjør viser bruk av Marions kort hos optiker Dean Evans i Grafton 13. august 1997.",
        "Problemet er at optikeren ikke husket konsultasjonen og at journalene var borte da saken senere ble gransket."
      ],
      claimIds: ["c13"],
      sourceIds: ["src-coroner-2024", "src-witnesses-compiled"],
      knownFrom: "Senere registerfunn",
      lockedUntil: "Arkivspor"
    },
    {
      id: "doc08",
      title: "Graham Childs' notatbokinnførsel",
      kind: "police-note",
      date: "1997-10-22",
      eyebrow: "Savnetmelding",
      body: [
        "Notatet fra Byron Bay politistasjon oppsummerte at Marion hadde returnert 2. august, hatt siste transaksjon i Byron og flyttet $80 000 den 15. oktober.",
        "Det er et nøkkeldokument fordi det viser at politiet hadde alvorlige opplysninger samme dag som saken likevel ble parkert som en lavere hendelse."
      ],
      claimIds: ["c16", "c19", "c20"],
      sourceIds: ["src-coroner-2024", "src-timeline-compiled"],
      knownFrom: "22.10.1997"
    },
    {
      id: "doc09",
      title: "COPS-innførselen fra 22. oktober 1997",
      kind: "police-record",
      date: "1997-10-22",
      eyebrow: "Første vurdering",
      body: [
        "Den datastøttede politiloggen beskrev et scenario der Marion kunne ha returnert med en ledsager og overført penger til England, og sa at det ikke var planlagt å registrere henne som savnet.",
        "Dette dokumentet er viktig fordi det viser hvordan en hypotese om frivillig handling tidlig ble byråkratisk virkelighet."
      ],
      claimIds: ["c19", "c20"],
      sourceIds: ["src-coroner-2024", "src-case-hub"],
      knownFrom: "22.10.1997",
      lockedUntil: "Etterinnsyn"
    },
    {
      id: "doc10",
      title: "John Wilsons memo om forsvinningen",
      kind: "memo",
      date: "1998-01",
      eyebrow: "Familiens eget saksark",
      body: [
        "Marions far skrev et memo med de uttakene familien hadde fått opplyst: Byron Bay, Burleigh Heads og til slutt omtrent $80 000 15. oktober.",
        "Memoet ble senere viktig fordi det støttet $500-versjonen av uttakene og viste hva familien faktisk prøvde å få klarhet i tidlig."
      ],
      claimIds: ["c14", "c15", "c16"],
      sourceIds: ["src-coroner-2024", "src-evidence-compiled"],
      knownFrom: "Tidlig 1998"
    },
    {
      id: "doc11",
      title: "Queensland Missing Persons Bureau-notatene",
      kind: "police-note",
      date: "1997-12-01",
      eyebrow: "'Safe and well'",
      body: [
        "Notatene fra Queensland viser først immigrasjons- og bankhenvendelser, og ender så med setningen om at Marion var funnet, trygg og ikke ønsket oppholdsstedet avslørt.",
        "Samtidig mangler de mer detaljerte arbeidsarkene som kunne vist nøyaktig hva politiet faktisk fikk bekreftet."
      ],
      claimIds: ["c21"],
      sourceIds: ["src-coroner-2024", "src-witnesses-compiled"],
      knownFrom: "Kjent gjennom senere saksdokumenter",
      lockedUntil: "Arkivspor"
    },
    {
      id: "doc12",
      title: "Salvation Army-brevet til John Wilson",
      kind: "letter",
      date: "1998-03-18",
      eyebrow: "Beroligende, men ustøtt",
      body: [
        "Brevet til familien sa at Marion definitivt var den som tok ut resten av pengene og at hun snakket om å starte et nytt liv.",
        "Senere viste coronergranskingen at detaljen om en bank-'security officer' ikke passet med hvordan filialen faktisk fungerte."
      ],
      claimIds: ["c22"],
      sourceIds: ["src-coroner-2024", "src-witnesses-compiled"],
      knownFrom: "18.03.1998"
    },
    {
      id: "doc13",
      title: "Deed poll: Florabella Natalia Marion Remakel",
      kind: "court-record",
      date: "1997-05-13",
      eyebrow: "Skjult identitet",
      body: [
        "Det offentlige navnebyttet til Florabella Natalia Marion Remakel skjedde over en måned før avreisen, uten at Marion fortalte det til de nærmeste.",
        "Dette dokumentet endret senere hele rammen for saken fordi det viste at hemmeligholdet startet før noen savnetmelding."
      ],
      claimIds: ["c29"],
      sourceIds: ["src-coroner-2024", "src-evidence-compiled"],
      knownFrom: "Kjent langt senere",
      lockedUntil: "Arkivspor"
    },
    {
      id: "doc14",
      title: "Coronerens formelle funn",
      kind: "finding",
      date: "2024-02-29",
      eyebrow: "Nåtidig ramme",
      body: [
        "Coroneren fant at Marion er død, trolig etter 15. oktober 1997.",
        "Samtidig ble det understreket at verken dødssted, dødsårsak eller dødsmåte kunne fastslås, og at det ikke forelå grunnlag for å finne hvem som eventuelt forårsaket døden."
      ],
      claimIds: ["c26", "c27", "c28", "c34"],
      sourceIds: ["src-coroner-2024", "src-case-hub"],
      knownFrom: "29.02.2024",
      lockedUntil: "Etterspill"
    }
  ],
  episodes: [
    {
      id: "ep1",
      title: "Sallys leting i 1997",
      period: "juni 1997 - mars 1998",
      premise: "Du rekonstruerer hva Sally faktisk kunne vite, tro og misforstå mens moren forsvinner mellom brev, bankspor og systemsvikt.",
      intro: "Episode 1 begynner ikke med en løst konstruert true crime-teori. Den begynner med en datter som vet at moren dro til England, fikk noen brev og postkort, og så plutselig ser bankkontoene tømmes mens institusjonene rundt henne antyder at alt kanskje er frivillig. Spillrommet er derfor bevisst skjevt: noen spor føles sterke fordi de er ferske, andre er sterke fordi de senere ble dokumentert, og flere tidlige spor viser seg å være ærlige blindveier.",
      initialClaimIds: ["c01", "c02", "c04", "c07", "c08", "c09", "c19"],
      leadBudget: 14,
      leads: [
        {
          id: "lead01",
          code: "E1-L01",
          title: "Farvel ved busstoppet",
          category: "vitne",
          locationId: "loc-southport",
          cost: 1,
          summary: "Start med det siste helt ukontroversielle synet av Marion.",
          body: [
            "Lesley Loveday kjørte Marion til busstasjonen i Southport 22. juni 1997. Det er den siste observasjonen alle er enige om uten forbehold.",
            "At denne observasjonen er så ren gjør den viktig: alt etterpå blir indirekte, registrert eller senere erindret."
          ],
          claimIds: ["c04"],
          documentIds: [],
          sourceIds: ["src-coroner-2024", "src-witnesses-compiled"],
          availabilityNote: "Tilgjengelig fra start."
        },
        {
          id: "lead02",
          code: "E1-L02",
          title: "Hastesalget i Southport",
          category: "bakgrunn",
          locationId: "loc-merinda-court",
          cost: 1,
          summary: "Huset ble solgt før reisen, og ikke på topp pris.",
          body: [
            "Salget 25. april 1997 for A$165 000 gjorde reisen økonomisk mulig, men skapte også et nytt sårbarhetsvindu: hun satt med likvider og færre faste holdepunkter.",
            "Det er ikke i seg selv mistenkelig å selge før en lang reise. Men sammen med resten av våren viser det et liv i rask ompakking."
          ],
          claimIds: ["c01"],
          documentIds: ["doc01"],
          sourceIds: ["src-coroner-2024", "src-timeline-compiled"],
          availabilityNote: "Tilgjengelig fra start."
        },
        {
          id: "lead03",
          code: "E1-L03",
          title: "Planla hun egentlig å komme tilbake?",
          category: "dokument",
          locationId: "loc-tss",
          cost: 1,
          summary: "Oppsigelsesbrevet ser både endelig og midlertidig ut på samme tid.",
          body: [
            "Marion sa opp ved The Southport School, men dokumentasjonen peker også mot at hun ville holde lærerregistreringen i live for 1998.",
            "Det gjør dette til et godt kalibreringsspor: ikke alt som ser dramatisk ut, peker mot permanent forsvinning."
          ],
          claimIds: ["c02", "c03"],
          documentIds: ["doc02"],
          sourceIds: ["src-coroner-2024", "src-timeline-compiled"],
          availabilityNote: "Bakgrunn som blir tydeligere med dokumentinnsyn."
        },
        {
          id: "lead04",
          code: "E1-L04",
          title: "Brevet på Narita-papir",
          category: "brev",
          locationId: "loc-narita",
          cost: 2,
          summary: "Et ekte brev fra England bærer et uventet japansk hotellnavn.",
          body: [
            "Sally mottok brevet i sanntid. Det var håndfast bevis på at Marion levde og skrev, men samtidig et spor som ikke passet den enkle fortellingen om en tur bare til England.",
            "Senere ble dette et langt viktigere dokument enn det kunne se ut som i juni 1997. Akkurat da var det bare merkelig."
          ],
          claimIds: ["c07", "c33"],
          documentIds: ["doc04"],
          sourceIds: ["src-coroner-2024", "src-evidence-compiled", "src-parallel-compiled"],
          availabilityNote: "Tilgjengelig fra start, men får større betydning senere."
        },
        {
          id: "lead05",
          code: "E1-L05",
          title: "Postkortene som holdt håpet oppe",
          category: "brev",
          locationId: "loc-tunbridge-wells",
          cost: 1,
          summary: "Flere postkort bekreftet reise, men ikke trygghet.",
          body: [
            "Postkortene fra Tunbridge Wells, Rye og Hastings gjorde at familien lenge tenkte i ferie- og reisebaner, ikke i akutt fare.",
            "De virker enkle, men de er et lærestykke i bevislære: et postkort kan bekrefte kontakt, ikke nødvendigvis frihet, selskap eller plan."
          ],
          claimIds: ["c08"],
          documentIds: ["doc05"],
          sourceIds: ["src-coroner-2024", "src-timeline-compiled"],
          availabilityNote: "Tilgjengelig fra start."
        },
        {
          id: "lead06",
          code: "E1-L06",
          title: "Den siste telefonsamtalen",
          category: "vitne",
          locationId: "loc-brisbane-airport",
          cost: 2,
          summary: "Sally husket innholdet, men ikke stedet.",
          body: [
            "Samtalen om Thredbo-skredet og " + '"te med noen gamle damer"' + " er siste direkte kontakt. Coronerens senere vurdering var at den kan ha skjedd rett før hjemreise eller rett etter retur til Australia.",
            "Det gjør samtalen både verdifull og frustrerende: den er ekte, men geografisk glir den akkurat ut av hånden."
          ],
          claimIds: ["c09"],
          documentIds: [],
          sourceIds: ["src-coroner-2024", "src-witnesses-compiled"],
          availabilityNote: "Tilgjengelig fra start."
        },
        {
          id: "lead07",
          code: "E1-L07",
          title: "Retur på papiret 2. august",
          category: "reise",
          locationId: "loc-brisbane-airport",
          cost: 2,
          summary: "Flydata sier ja; et øyenvitne på flyplassen finnes ikke.",
          body: [
            "Den registrerte returen 2. august 1997 er en av sakens viktigste søyler. Den endrer hele geografien fra England til Australia.",
            "Samtidig er det viktig å holde språket stramt: dokumentet beviser en registrert retur, og coroneren fant senere at det var Marion selv, men 1997-familien hadde ikke denne sikkerheten."
          ],
          claimIds: ["c10", "c11", "c12"],
          documentIds: ["doc06"],
          sourceIds: ["src-coroner-2024", "src-analysis-compiled"],
          availabilityNote: "Først kjent gjennom myndighetsopplysninger og senere arkivinnsyn."
        },
        {
          id: "lead08",
          code: "E1-L08",
          title: "Hva betyr egentlig Luxembourg?",
          category: "reise",
          locationId: "loc-brisbane-airport",
          cost: 1,
          summary: "På kortene dukker Luxembourg opp som identitetsmarkør, ikke som forklart reisemål.",
          body: [
            "Innreisekortet beskrev Florabella som gift og bosatt i Luxembourg. For en 1997-etterforsker er det mer et spørsmål enn et svar.",
            "Det trygge er å lese dette som dokumentert egenopplysning på kortet, ikke som bevis for faktisk ekteskap eller bosetting."
          ],
          claimIds: ["c11"],
          documentIds: ["doc06"],
          sourceIds: ["src-coroner-2024", "src-evidence-compiled"],
          availabilityNote: "Krever innsyn i reisedokumentene."
        },
        {
          id: "lead09",
          code: "E1-L09",
          title: "De nakne banksporene i august",
          category: "finans",
          locationId: "loc-byron-bay",
          cost: 1,
          summary: "Før store teorier: les selve mønsteret.",
          body: [
            "Mønsteret i august handler om små, gjentatte uttak i Byron Bay og Burleigh Heads, ikke om ett dramatisk over-counter-besøk om dagen.",
            "Det er et godt eksempel på hvorfor samtidige familieerindringer og senere dokumentkontroll må holdes litt fra hverandre."
          ],
          claimIds: ["c14", "c15"],
          documentIds: ["doc10"],
          sourceIds: ["src-coroner-2024", "src-evidence-compiled"],
          availabilityNote: "Tilgjengelig etter hvert som familien samler bankopplysninger."
        },
        {
          id: "lead10",
          code: "E1-L10",
          title: "Burleigh-avstikkeren",
          category: "finans",
          locationId: "loc-burleigh-heads",
          cost: 1,
          summary: "To av uttakene ligger utenfor Byron Bay-klyngen.",
          body: [
            "Burleigh Heads 21. og 22. august viser at kontoen ikke bare ble tappet i én by. Det gjør den enkle forestillingen om et fast oppholdssted svakere.",
            "Likevel er dette ikke et dramatisk gjennombrudd. Det er et moderat spor som utvider bevegelseskartet litt."
          ],
          claimIds: ["c15"],
          documentIds: ["doc10"],
          sourceIds: ["src-coroner-2024", "src-timeline-compiled"],
          availabilityNote: "Tilgjengelig etter bankhenvendelser."
        },
        {
          id: "lead11",
          code: "E1-L11",
          title: "Grafton-optikeren",
          category: "dead-end",
          locationId: "loc-grafton",
          cost: 2,
          summary: "Et mulig livstegn som ikke vil la seg stadfeste.",
          body: [
            "Medicare-sporet i Grafton ser lovende ut fordi det er konkret og datert. Problemet er at optikeren ikke husket konsultasjonen, og at journalene ikke overlevde lenge nok til senere kontroll.",
            "Dette er en ærlig blindvei: viktig nok til å undersøke, men utilstrekkelig til å bære mer enn en forsiktig hypotese."
          ],
          claimIds: ["c13"],
          documentIds: ["doc07"],
          sourceIds: ["src-coroner-2024", "src-witnesses-compiled"],
          availabilityNote: "Synlig som senere registerspor; begrenset verdi på grunn av tapt dokumentasjon."
        },
        {
          id: "lead12",
          code: "E1-L12",
          title: "$80 000-dagen",
          category: "finans",
          locationId: "loc-byron-bay",
          cost: 3,
          summary: "Den mest konsentrerte enkelttransaksjonen i hele 1997-sporet.",
          body: [
            "Notater 22. oktober 1997 beskrev siste store bevegelse som en telegrafisk overføring på omtrent $80 000 15. oktober, muligvis til en utenlandsk konto.",
            "Nesten alt stort i saken senere sirkler tilbake hit: hvem gjorde det, hvor gikk pengene, og hvorfor ble akkurat denne tråden aldri sikkert sporet?"
          ],
          claimIds: ["c16"],
          documentIds: ["doc08", "doc10"],
          sourceIds: ["src-coroner-2024", "src-evidence-compiled"],
          availabilityNote: "Tilgjengelig i 1997-materialet."
        },
        {
          id: "lead13",
          code: "E1-L13",
          title: "Joan Hazletts hukommelse",
          category: "vitne",
          locationId: "loc-byron-bay",
          cost: 2,
          summary: "Et sent vitne med høy selvtillit og reelle begrensninger.",
          body: [
            "Hazlett sa senere at hun var ni av ti sikker på at kvinnen hun hjalp ved den store transaksjonen var Marion. Coronerens funn ga henne betydelig vekt.",
            "Men dette er også et skoleeksempel i kildekritikk: hukommelsen ble aktivert langt senere, og detaljene rundt beløp og årstall var ikke perfekte."
          ],
          claimIds: ["c17", "c18"],
          documentIds: [],
          sourceIds: ["src-coroner-2024", "src-witnesses-compiled"],
          availabilityNote: "Vitnemålet kom langt senere, men er sentralt for å forstå 15. oktober."
        },
        {
          id: "lead14",
          code: "E1-L14",
          title: "Savnetmeldingen 22. oktober",
          category: "institusjon",
          locationId: "loc-byron-bay",
          cost: 1,
          summary: "Datoen betyr noe: ikke 21., men 22. oktober 1997.",
          body: [
            "Sally og Chris dro til Byron Bay, undersøkte banker og butikker, og meldte så Marion savnet samme ettermiddag 22. oktober 1997.",
            "Tidslinjen er viktig fordi den viser at familien handlet raskt etter å ha skjønt at bankaktiviteten ikke passet med det de trodde de visste."
          ],
          claimIds: ["c19"],
          documentIds: ["doc08", "doc09"],
          sourceIds: ["src-coroner-2024", "src-timeline-compiled"],
          availabilityNote: "Tilgjengelig fra start."
        },
        {
          id: "lead15",
          code: "E1-L15",
          title: "'Occurrence only'",
          category: "institusjon",
          locationId: "loc-byron-bay",
          cost: 2,
          summary: "Den første systemfeilen er administrativ, men konsekvensene er enorme.",
          body: [
            "I stedet for å opprette en aktiv savnetsak ble hendelsen lagt inn som occurrence only. Det høres teknisk ut, men avgjorde i praksis hvor fort saken mistet trykk.",
            "Dette er en av episodens viktigste lærdommer: noen saker blir ikke bare uløste fordi bevis mangler, men fordi systemet feilklassifiserer hva det ser på."
          ],
          claimIds: ["c20"],
          documentIds: ["doc08", "doc09"],
          sourceIds: ["src-coroner-2024", "src-case-hub"],
          availabilityNote: "Blir tydelig ved senere dokumentinnsyn."
        },
        {
          id: "lead16",
          code: "E1-L16",
          title: "Queensland-notatet som beroliget alle",
          category: "institusjon",
          locationId: "loc-ashmore",
          cost: 2,
          summary: "'Safe and well' ble stående som sannhet uten full dokumentkjede.",
          body: [
            "Notatet fra Queensland Missing Persons Bureau ga et kraftig signal til familien: hun var funnet, trygg og ønsket privatliv.",
            "Problemet er ikke bare at dette kan ha vært feil. Problemet er også at de mer detaljerte arbeidsarkene som kunne forklart grunnlaget, er borte."
          ],
          claimIds: ["c21"],
          documentIds: ["doc11"],
          sourceIds: ["src-coroner-2024", "src-witnesses-compiled"],
          availabilityNote: "Kjent senere i dokumentene, men avgjørende for å forstå 1997-98."
        },
        {
          id: "lead17",
          code: "E1-L17",
          title: "Frelsesarmeens trygghetsbrev",
          category: "dead-end",
          locationId: "loc-ashmore",
          cost: 1,
          summary: "Et brev som roer, men samtidig forvirrer.",
          body: [
            "Beskjeden familien mottok i mars 1998 passet altfor godt med ønsket om at Marion frivillig hadde startet et nytt liv.",
            "Senere viste coronergranskingen at den påståtte bank-'security officer'-delen ikke stemte. Brevet er derfor både et spor og et eksempel på hvordan usikker informasjon kan fossiliseres."
          ],
          claimIds: ["c22"],
          documentIds: ["doc12"],
          sourceIds: ["src-coroner-2024", "src-witnesses-compiled"],
          availabilityNote: "Tilgjengelig i 1998-delen av rekonstruksjonen."
        },
        {
          id: "lead18",
          code: "E1-L18",
          title: "'Bank security' som ikke fantes",
          category: "dead-end",
          locationId: "loc-ashmore",
          cost: 1,
          summary: "En konkret detalj kollapser under kontroll.",
          body: [
            "Da filialmiljøet ble undersøkt senere, forklarte David Martin at Ashmore-branch ikke hadde noen sikkerhetsoffiser slik brevet beskrev.",
            "Det betyr ikke at hele kjernen i historien er falsk, men det viser at overleverte institusjonsfortellinger må demonteres del for del."
          ],
          claimIds: ["c22"],
          documentIds: ["doc12"],
          sourceIds: ["src-coroner-2024", "src-witnesses-compiled"],
          availabilityNote: "Vises best som etterkontroll av et tidlig spor."
        },
        {
          id: "lead19",
          code: "E1-L19",
          title: "Ingen verifisert kontakt etter 15. oktober",
          category: "status",
          locationId: "loc-byron-bay",
          cost: 1,
          summary: "Et hardt stoppunkt i materialet.",
          body: [
            "Etter 15. oktober 1997 finnes det ingen verifisert kontakt og ingen sikkert bekreftet livsobservasjon av Marion.",
            "Dette er hvorfor 15. oktober blir siste faste terskel i nesten alle seriøse rekonstruksjoner."
          ],
          claimIds: ["c23", "c27"],
          documentIds: ["doc14"],
          sourceIds: ["src-coroner-2024", "src-case-hub"],
          availabilityNote: "Blir sikkert først i etterspillet."
        },
        {
          id: "lead20",
          code: "E1-L20",
          title: "Arkivtapet i 2004",
          category: "institusjon",
          locationId: "loc-byron-bay",
          cost: 2,
          summary: "Det viktigste fraværet er et dokumentfravær.",
          body: [
            "Coronergranskingen peker på at bankopplysninger fra 1997 sannsynligvis fortsatt kunne vært hentet i 2004. Senere var de borte.",
            "Det gjør dette til en av de mest smertefulle ikke-ledene i saken: man vet ganske presist hva som burde vært ettergått, men ikke lenger hvordan."
          ],
          claimIds: ["c24"],
          documentIds: [],
          sourceIds: ["src-coroner-2024", "src-case-hub"],
          availabilityNote: "Et rent etterspillsspor, men essensielt for å forstå hvorfor saken stivnet."
        },
        {
          id: "lead21",
          code: "E1-L21",
          title: "Den låste identiteten Florabella",
          category: "arkiv",
          locationId: "loc-southport",
          cost: 2,
          summary: "Et navnebytte familien ikke visste om i 1997.",
          body: [
            "Deed poll-dokumentet fra 13. mai 1997 viser at hemmeligholdet startet før avreisen. Det forandrer hvordan hele våren leses.",
            "Men det er viktig at dette er etterpåklokskap i Episode 1. Sally hadde ikke dette kortet på hånden da hun begynte å lete."
          ],
          claimIds: ["c29"],
          documentIds: ["doc13"],
          sourceIds: ["src-coroner-2024", "src-evidence-compiled"],
          availabilityNote: "Bonusarkiv: senere kjent, ikke del av startkunnskapen."
        },
        {
          id: "lead22",
          code: "E1-L22",
          title: "Passet i nytt navn",
          category: "arkiv",
          locationId: "loc-brisbane-airport",
          cost: 1,
          summary: "Navnebyttet ble operativt nesten umiddelbart.",
          body: [
            "Det nye passet ble utstedt 20. mai 1997, bare en uke etter deed poll. Det betyr at det skjulte navnet ikke var symbolsk, men brukt aktivt i reiseplanen.",
            "I en 1997-rekonstruksjon må dette derfor behandles som senere oppdaget struktur, ikke som noe familien kunne reagere på i sanntid."
          ],
          claimIds: ["c30"],
          documentIds: [],
          sourceIds: ["src-coroner-2024", "src-evidence-compiled"],
          availabilityNote: "Bonusarkiv."
        },
        {
          id: "lead23",
          code: "E1-L23",
          title: "Utreisekortets ukjente hånd",
          category: "arkiv",
          locationId: "loc-brisbane-airport",
          cost: 2,
          summary: "Tre ord åpner et helt eget spørsmål om påvirkning.",
          body: [
            "At 'Europe', 'Luxembourg' og 'S/Korea' skal være skrevet av en annen hånd enn Marions, er et senere analysemoment med stor fortellingseffekt.",
            "Men det er fortsatt ikke et bevis på hvem den andre hånden tilhørte. Det er et spor om mekanikk, ikke en ferdig identifikasjon."
          ],
          claimIds: ["c06"],
          documentIds: ["doc03"],
          sourceIds: ["src-coroner-2024", "src-analysis-compiled"],
          availabilityNote: "Bonusarkiv: kjent senere."
        },
        {
          id: "lead24",
          code: "E1-L24",
          title: "Luxembourg som rolle, ikke bevis",
          category: "arkiv",
          locationId: "loc-brisbane-airport",
          cost: 1,
          summary: "Innreisekortets ordlyd må ikke overselges.",
          body: [
            "Kortet sier gift, bosatt i Luxembourg og på besøk. Det er fristende å lese det som et ferdig scenario, men kortet er fortsatt bare et kort.",
            "Det beviser hva som ble oppgitt til myndighetene, ikke at livsfortellingen bak opplysningene var sann."
          ],
          claimIds: ["c11"],
          documentIds: ["doc06"],
          sourceIds: ["src-coroner-2024", "src-evidence-compiled"],
          availabilityNote: "Bonusarkiv."
        },
        {
          id: "lead25",
          code: "E1-L25",
          title: "Narita-papiret får en senere Ric-kobling",
          category: "poi",
          locationId: "loc-narita",
          cost: 3,
          summary: "Det merkelige juni-brevet ble enda mer belastet i senere arkivarbeid.",
          body: [
            "Senere coronerfunn plasserte Ric Blum ved Hotel Nikko Narita 17. juni 1997. Dermed fikk et allerede merkelig brevpapir en ny betydning i saken.",
            "Dette er fortsatt en kobling, ikke et bevis på vold eller drap. Men det er en av de skarpeste senere forklaringene på hvorfor brevet føltes 'feil' fra starten."
          ],
          claimIds: ["c33", "c34"],
          documentIds: ["doc04"],
          sourceIds: ["src-coroner-2024", "src-parallel-compiled", "src-analysis-compiled"],
          availabilityNote: "Bonusarkiv: senere kunnskap.",
          poiCaution: "Ric Blum er omtalt som person av interesse. Han er ikke tiltalt, og coroneren fant ikke at han forårsaket Marions død."
        },
        {
          id: "lead26",
          code: "E1-L26",
          title: "Ingen så dem sammen",
          category: "poi",
          locationId: "loc-wollongbar",
          cost: 1,
          summary: "Et viktig negativt faktum.",
          body: [
            "Selv om coroneren senere fant at Marion og Ric Blum hadde en relasjon i 1997, finnes det ingen uavhengig tredjepart som har sett dem sammen.",
            "Denne mangelen forklarer både hvorfor saken er så vanskelig å bevise, og hvorfor språkføringen må holdes forsiktig."
          ],
          claimIds: ["c31", "c32", "c34"],
          documentIds: ["doc14"],
          sourceIds: ["src-coroner-2024", "src-witnesses-compiled", "src-analysis-compiled"],
          availabilityNote: "Bonusarkiv: senere kunnskap.",
          poiCaution: "Ric Blum er omtalt som person av interesse. Han er ikke tiltalt, og coroneren fant ikke at han forårsaket Marions død."
        },
        {
          id: "lead27",
          code: "E1-L27",
          title: "Safe-custody dagen før",
          category: "poi",
          locationId: "loc-ballina",
          cost: 2,
          summary: "Et sammenfall som er dokumentert, men ikke forklarende i seg selv.",
          body: [
            "Et senere spor viste at Ric Blum åpnet en safe-custody-konvolutt i Ballina 14. oktober 1997, én dag før $80 000 forlot Marions konto.",
            "Det er legitimt å merke seg dette som et slående sammenfall. Det er ikke legitimt å late som sammenfallet alene beviser kontroll over pengene eller døden hennes."
          ],
          claimIds: ["c16", "c35", "c34"],
          documentIds: [],
          sourceIds: ["src-coroner-2024", "src-parallel-compiled", "src-analysis-compiled"],
          availabilityNote: "Bonusarkiv: senere kunnskap.",
          poiCaution: "Ric Blum er omtalt som person av interesse. Han er ikke tiltalt, og coroneren fant ikke at han forårsaket Marions død."
        },
        {
          id: "lead28",
          code: "E1-L28",
          title: "Feilklassifisert som 'located' i 2011",
          category: "institusjon",
          locationId: "loc-byron-bay",
          cost: 2,
          summary: "Systemfeilen kom tilbake fjorten år senere.",
          body: [
            "I 2011 ble Marion feilaktig omklassifisert som 'located'. Coroneren fant senere at dette ikke burde ha skjedd.",
            "For Episode 1 fungerer dette som et etterspillsspeil: den opprinnelige feilforståelsen i 1997 ble ikke korrigert; den ble gjentatt i en ny form."
          ],
          claimIds: ["c25"],
          documentIds: [],
          sourceIds: ["src-coroner-2024", "src-timeline-compiled"],
          availabilityNote: "Etterspillsspor."
        },
        {
          id: "lead29",
          code: "E1-L29",
          title: "Den høye mannen i bilen",
          category: "vitne",
          locationId: "loc-southport",
          cost: 1,
          summary: "Et tidlig varseltegn, men ikke en identifisert person.",
          body: [
            "Sally og Chris så Marion med en høy mannlig passasjer før avreisen. Observasjonen peker mot hemmelighold, men identifiserer ikke mannen sikkert.",
            "Det er et viktig spor nettopp fordi det ofte blir oversolgt. Den riktige konklusjonen er at Marion skjulte noe eller noen, ikke at vitnet løser saken alene."
          ],
          claimIds: ["c02"],
          documentIds: [],
          sourceIds: ["src-coroner-2024", "src-witnesses-compiled"],
          availabilityNote: "Tilgjengelig i familiefortellingen, men uten sikker identifikasjon."
        },
        {
          id: "lead30",
          code: "E1-L30",
          title: "Ingen friske utenlandsregistre igjen",
          category: "dead-end",
          locationId: "loc-narita",
          cost: 2,
          summary: "Noen svar forsvant med oppbevaringsfristene.",
          body: [
            "Senere undersøkelser mot Japan, Korea, Storbritannia og Luxembourg støtte flere ganger på dataretensjon og manglende overlevende registre.",
            "Det er en viktig, men ærlig dødende: ikke alt som en gang var loggført, finnes fremdeles for kontroll."
          ],
          claimIds: ["c24"],
          documentIds: [],
          sourceIds: ["src-coroner-2024", "src-parallel-compiled"],
          availabilityNote: "Etterspillsspor som forklarer hvorfor noen tidlige spørsmål fortsatt er åpne."
        }
      ],
      questions: [
        {
          id: "q1",
          prompt: "Hvilke av episodens sentrale opplysninger er førstehånds observasjoner, og hvilke bygger på institusjonelle notater eller senere erindringer?",
          claimIds: ["c04", "c09", "c17", "c20", "c21", "c22"]
        },
        {
          id: "q2",
          prompt: "Hva kan bankaktiviteten i august faktisk bevise, og hva kan den ikke bevise, om Marions frivillighet eller bevegelsesmønster?",
          claimIds: ["c14", "c15", "c16"]
        },
        {
          id: "q3",
          prompt: "Hvorfor var 'occurrence only' en så alvorlig systemfeil, selv før noen visste noe om Florabella, Ric eller senere inquest-materiale?",
          claimIds: ["c19", "c20", "c24", "c25"]
        },
        {
          id: "q4",
          prompt: "Hvilke spor i Episode 1 er ærlige blindveier, og hvorfor er det viktig å beholde dem i en rekonstruksjon i stedet for å redigere dem bort?",
          claimIds: ["c13", "c21", "c22", "c24"]
        },
        {
          id: "q5",
          prompt: "Hvorfor er et presist spørsmål som 'hva visste Sally, når visste hun det, og hva gjorde systemet med den kunnskapen?' bedre enn å hoppe rett til en drapsteori?",
          claimIds: ["c09", "c16", "c19", "c20", "c28", "c34"]
        }
      ]
    }
  ]
};
