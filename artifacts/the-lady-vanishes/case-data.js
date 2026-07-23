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
      version: "0.5-handwriting",
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

    documents: [
      { id: "doc01", title: "Registrering av hussalget", date: "1997-04-25", dateLabel: "25. april 1997", facsimile: "assets/facsimiles-v05/doc01-house-sale-record.png", alt: "Registrering av salget av huset i Southport.", transcript: ["Eiendom: Merinda Court, Southport.", "Registrert selger: Marion Barter.", "Salgsdato: 25. april 1997.", "Registrert salgssum: A$165 000; oppgitt prisantydning: A$175 000."], sourceIds: ["src-coroner-2024", "src-timeline-compiled"] },
      { id: "doc15", title: "Første oppsigelsesbrev til The Southport School", date: "1997-04-13", dateLabel: "13. april 1997", facsimile: "assets/facsimiles-v05/doc15-first-resignation-letter.png", alt: "Marions første oppsigelsesbrev til The Southport School.", transcript: ["Datert 13. april 1997 og adressert til skolens ledelse.", "Marion skriver at hun sier opp med stor sorg og profesjonell motvilje, med virkning fra 14. juli 1997.", "Hun ønsker å diskutere de medvirkende årsakene og nevner planer om å reise til England."], sourceIds: ["src-coroner-2024", "src-timeline-compiled"] },
      { id: "doc02", title: "Andre oppsigelsesbrev til The Southport School", date: "1997-06-16", dateLabel: "16. juni 1997", facsimile: "assets/facsimiles-v05/doc02-school-resignation-letter.png", alt: "Marions andre oppsigelsesbrev til The Southport School.", transcript: ["Datert 16. juni 1997 og adressert «Dear Sir / Madam».", "Marion skriver at hun vil reise utenlands på ubestemt tid og håper å undervise i England og Europa.", "Hun ber om fornyelse av lærerregistreringen for 1998 og bruker Lesley Lovedays adresse.", "Oppsigelsen skulle gjelde fra 20. juni 1997."], sourceIds: ["src-coroner-2024", "src-timeline-compiled"] },
      { id: "doc03", title: "Utreisekort og flyregistrering", date: "1997-06-22", dateLabel: "22. juni 1997", facsimile: "assets/facsimiles-v05/doc03-departure-card.png", alt: "Australsk utreisekort utfylt for Florabella Remakel.", transcript: ["Navn: Florabella Remakel.", "Avreise: Brisbane, 22. juni 1997 kl. 21.38.", "Flyselskap: Korean Airlines.", "Synlige felt: «Europe», «Luxembourg» og «S/Korea»."], sourceIds: ["src-coroner-2024", "src-evidence-compiled", "src-analysis-compiled"] },
      { id: "doc04", title: "Brevet til Sally", date: "1997-06-30", dateLabel: "mottatt 30. juni 1997", facsimile: "assets/facsimiles-v05/doc04-narita-stationery-letter.png", alt: "Marions brev til Sally på Hotel Nikko Narita-brevpapir.", transcript: ["Adressert til Sally og signert «Marion».", "Marion skriver at hun endelig har kommet til England etter et interessant besøk i øst, men at for mye bagasje gjorde reisen vanskeligere.", "Hun planlegger å bli i Tunbridge Wells noen dager før hun tar fatt på Europa.", "Konvolutten var poststemplet i Tunbridge Wells og brevet ble mottatt 30. juni 1997."], sourceIds: ["src-coroner-2024", "src-evidence-compiled", "src-parallel-compiled"] },
      { id: "doc05", title: "Postkortene fra England", date: "1997-07", dateLabel: "sommeren 1997", facsimile: "assets/facsimiles-v05/doc05-sussex-postcards.png", alt: "Postkort fra Tunbridge Wells, Rye og Hastings.", transcript: ["Postkort sendt til familie og venner i Australia; de enkelte mottakerne er ikke fullt identifisert.", "Kortene er knyttet til Tunbridge Wells, Rye og Hastings.", "Alle er skrevet med samme hånd og signert «Marion»."], sourceIds: ["src-coroner-2024", "src-timeline-compiled"] },
      { id: "doc06", title: "Innreisekortet", date: "1997-08-02", dateLabel: "2. august 1997", facsimile: "assets/facsimiles-v05/doc06-arrival-card.png", alt: "Innreisekort utfylt for Florabella Remakel.", transcript: ["Navn: Florabella Remakel.", "Ankomst: Brisbane, 2. august 1997 kl. 10.11; Cathay Pacific.", "Oppgitt sivilstatus: gift; bostedsland: Luxembourg; yrke: home duties.", "Planlagt opphold: 8 dager; adresse i Australia: Novotel, Brisbane."], sourceIds: ["src-coroner-2024", "src-evidence-compiled", "src-analysis-compiled"] },
      { id: "doc08", title: "Notatbokinnførselen ved Byron Bay Police", date: "1997-10-22", dateLabel: "22. oktober 1997", facsimile: "assets/facsimiles-v05/doc08-police-notebook.png", alt: "Notatbokinnførsel fra Byron Bay Police.", transcript: ["Byron Bay, 22. oktober 1997.", "Sally og Chris møtte angående Marion Barter.", "Familien rapporterte retur til Australia 2. august og bankaktivitet i Byron Bay/Burleigh Heads.", "En større bevegelse omkring A$80 000 ble rapportert 15. oktober."], sourceIds: ["src-coroner-2024", "src-timeline-compiled"] },
      { id: "doc10", title: "Transaksjonsoversikten", date: "1997-08/10", dateLabel: "august–oktober 1997", facsimile: "assets/facsimiles-v05/doc10-bank-transaction-sheet.png", alt: "Oversikt over banktransaksjoner fra august til oktober 1997.", transcript: ["18. august: to uttak på A$500 i Byron Bay.", "21.–22. august: ett uttak på A$500 per dag i Burleigh Heads.", "23.–28. august: ett uttak på A$500 per dag i Byron Bay.", "15. oktober: omkring A$80 000, beskrevet som filialuttak eller mulig telegrafisk overføring.", "Destinasjonskontoen er ikke fastslått."], sourceIds: ["src-coroner-2024", "src-evidence-compiled"] },
      { id: "doc11", title: "Queensland-notatet", date: "1997-12-01", dateLabel: "1. desember 1997", facsimile: "assets/facsimiles-v05/doc11-queensland-safe-and-well-note.png", alt: "Queensland-notat om Marion Barter.", transcript: ["Queensland Missing Persons Bureau; filnotat datert 1. desember 1997; emne Marion Barter.", "Synlig konklusjon: «Missing person located safe and well, whereabouts not to be disclosed.»", "De foregående arbeidsnotatene er redigert og var ikke tilgjengelige i det senere offentlige materialet."], sourceIds: ["src-coroner-2024", "src-witnesses-compiled"] },
      { id: "doc12", title: "Salvation Army-brevet", date: "1998-03-18", dateLabel: "18. mars 1998 · senere materiale", facsimile: "assets/facsimiles-v05/doc12-salvation-army-letter.png", alt: "Brev fra The Salvation Army til familien.", transcript: ["The Salvation Army, Family Tracing correspondence; 18. mars 1998; adressert til Mr Wilson.", "Brevet sier at Marion hadde tatt ut de resterende pengene og ville begynne et nytt liv.", "En senere coroner-gjennomgang stilte spørsmål ved den rapporterte henvisningen til en bankansatt innen sikkerhet."], sourceIds: ["src-coroner-2024", "src-witnesses-compiled"] },
      { id: "doc14", title: "Coronerens funn", date: "2024-02-29", dateLabel: "29. februar 2024 · senere materiale", facsimile: "assets/facsimiles-v05/doc14-coroner-findings-extract.png", alt: "Utdrag fra coronerens formelle funn.", transcript: ["State Coroner's Court, New South Wales; funn datert 29. februar 2024.", "Marion Barter er død og døde trolig en gang etter 15. oktober 1997.", "Levningene er ikke funnet.", "Sted, årsak og dødsmåte kunne ikke fastslås.", "Funnene fastslo ikke at en identifisert person forårsaket døden."], sourceIds: ["src-coroner-2024"] }
    ],

    episode: {
      id: "ep1",
      title: "Mor tar ikke telefonen",
      period: "juni–desember 1997",
      referenceLeadIds: ["sp03", "sp05", "sp07", "gc02", "gc03", "gc06", "ns01", "ns02", "ns08", "ns11", "ns13", "xr01", "xr02", "xr10", "xr11", "xr12"],
      brief: [
        "Det er oktober 1997. Marion dro fra Southport på en lang reise fire måneder tidligere. Familien har mottatt brev og postkort, men den siste telefonsamtalen ble brutt — og nå svarer hun ikke.",
        "Sally har oppdaget bankaktivitet hun ikke forstår. Du får et åpent register, et kart og de dokumentene familien allerede har. Det finnes ingen handlingsgrense; hvert oppslag registreres bare slik at du kan sammenligne etterforskningsstrategier.",
        "Registeret er ikke kuratert for deg. De fleste oppslag gir lite eller ingenting, mens enkelte sidehistorier først får betydning i sluttoppgjøret. Referansestien bruker 16 oppslag; hvert ekstra oppslag trekker ett av ti effektivitetspoeng, men låser deg aldri ute. Avslutt når du mener du kan forklare hva som er dokumentert — og hva som fortsatt bare er en antakelse."
      ],
      initialDocumentIds: ["doc04", "doc05"],
      debriefDocumentIds: ["doc12", "doc14"],
      questions: [
        {
          id: "main-1", group: "main",
          prompt: "Rekonstruer den sikreste dokumenterte reiserammen fra avreisen 22. juni til den registrerte returen 2. august 1997. Hva vet vi — og hva beviser reisedokumentene ikke?",
          modelAnswer: [
            "En passasjer under navnet Florabella Remakel forlot Brisbane med Korean Airlines 22. juni og en passasjer under samme navn ble registrert inn i Brisbane med Cathay Pacific 2. august. Brev og postkort dokumenterer kontakt fra England i mellomperioden.",
            "Kortene og registreringene støtter en reiseramme, men fastslår ikke alene hvem som fylte ut hvert felt, at alle oppgitte personopplysninger var sanne, hvem Marion eventuelt reiste med, eller hele ruten mellom Australia og England."
          ],
          rubric: ["Begge nøkkeldatoene og aliaset.", "Skillet mellom registrert reise og sikker identifikasjon/livshistorie.", "Minst én tydelig begrensning i dokumentkjeden."],
          sourceIds: ["src-coroner-2024", "src-timeline-compiled", "src-evidence-compiled"]
        },
        {
          id: "main-2", group: "main",
          prompt: "Hvordan bør Narita-brevpapiret, Sussex-postkortene og den siste telefonsamtalen settes sammen uten å overtolke dem?",
          modelAnswer: [
            "Materialet viser at Sally mottok et brev på Hotel Nikko Narita-papir som ble postlagt fra England, samt postkort knyttet til steder i Kent og East Sussex. Den siste samtalen ble avbrutt og kan ikke plasseres sikkert geografisk.",
            "Dette støtter kontakt og engelske poststeder, men brevpapiret beviser ikke at Marion bodde på hotellet eller var i Japan. Dokumentene gir heller ikke en komplett reiserute eller identifiserer eventuelt reisefølge."
          ],
          rubric: ["Narita-papir og engelsk postgang holdes fra hverandre.", "Postkort/samtale brukes som kontaktspor, ikke full bevegelseslogg.", "Overtolkning av Japan, sted eller reisefølge avvises."],
          sourceIds: ["src-coroner-2024", "src-evidence-compiled", "src-witnesses-compiled"]
        },
        {
          id: "main-3", group: "main",
          prompt: "Hva viser banksporet fra august til oktober 1997, og hvilke avgjørende spørsmål lar transaksjonene stå åpne?",
          modelAnswer: [
            "Det offentlige materialet beskriver gjentatte uttak i Byron Bay og Burleigh Heads i august og en langt større transaksjon omkring 15. oktober. Mønsteret viser aktivitet på kontoen etter den registrerte returen.",
            "Transaksjonene identifiserer ikke alene hvem som utførte dem, om Marion handlet frivillig, hvorfor pengene ble flyttet eller hvor den store summen til slutt endte."
          ],
          rubric: ["August-uttakene og den store oktobertransaksjonen.", "Koblingen til aktivitet etter retur.", "Bruker, motiv og endelig destinasjon behandles som åpne spørsmål."],
          sourceIds: ["src-coroner-2024", "src-evidence-compiled", "src-parallel-compiled"]
        },
        {
          id: "main-4", group: "main",
          prompt: "Forklar hvordan politiets behandling i oktober–desember svekket etterforskningen. Hvilke to administrative spor er viktigst?",
          modelAnswer: [
            "Henvendelsen ved Byron Bay 22. oktober ble registrert som en occurrence i stedet for en aktiv savnetsak. Senere sa et Queensland-notat at Marion var funnet trygg og at oppholdsstedet ikke skulle oppgis.",
            "Arbeidsarkene som kunne vist grunnlaget for «safe and well», manglet ved senere kontroll. Kombinasjonen av feil klassifisering og en utilstrekkelig etterprøvbar avslutning bidro til at tid og mulig dokumentasjon gikk tapt."
          ],
          rubric: ["Occurrence i stedet for aktiv savnetsak.", "Queenslands safe-and-well-notat og manglende underlag.", "Konsekvensen for tid, arkiver eller etterprøvbarhet."],
          sourceIds: ["src-coroner-2024", "src-timeline-compiled", "src-witnesses-compiled", "src-case-hub"]
        },
        {
          id: "main-5", group: "main",
          prompt: "Hva er den mest forsvarlige samlede konklusjonen ved slutten av den historiske etterforskningen — og hvilke skyld- eller dødsårsaksutsagn kan bevisene ikke bære?",
          modelAnswer: [
            "Ved utgangen av 1997 kunne familien dokumentere brutt kontakt, en registrert retur under Florabella Remakel, senere bankaktivitet og en politibehandling med alvorlige svakheter. Dette ga god grunn til fortsatt etterforskning.",
            "Materialet fastslo ikke hvor Marion befant seg, om hun fortsatt levde, hvem som sto bak alle handlingene eller om en navngitt person hadde forårsaket skade. Ved dette historiske sluttpunktet er den forsvarlige konklusjonen at forsvinningen krevde videre etterforskning — ikke at dødsfall, dødsårsak eller skyld var bevist."
          ],
          rubric: ["En nøktern syntese av kontakt, retur, bank og politisvikt.", "Ingen navngitt person gjøres skyldig uten bevis.", "Dødsfall, dødsårsak og gjerningsperson holdes åpne ved det historiske sluttpunktet."],
          sourceIds: ["src-coroner-2024", "src-case-hub", "src-analysis-compiled"]
        },
        {
          id: "bonus-1", group: "bonus",
          prompt: "Hvem var Ilona Kinczel i Ric Blums livshistorie, og hvorfor må dødsfallet hennes omtales med særlig varsomhet?",
          modelAnswer: [
            "Ilona Kinczel var Blums tredje kone og mor til datteren Evelyn. Hun døde ung i Melbourne i 1977.",
            "Arkivet fastslår ikke at dødsfallet skyldtes en forbrytelse eller at Blum medvirket."
          ],
          rubric: ["Tredje kone og dødsåret.", "Ingen foul play presenteres som fakta.", "Fravær av offentlig bevis brukes til å avgrense, ikke insinuere."],
          sourceIds: ["src-ilona-compiled", "src-blum-alias-compiled"]
        },
        {
          id: "bonus-2", group: "bonus",
          prompt: "Hva forteller The Southport School-sporet om Marion rett før reisen, og hvilken motsigelse gjør sporet interessant?",
          modelAnswer: [
            "Marion var en anerkjent lærer ved The Southport School og hadde mottatt en Queensland Teaching Excellence Award i 1996. Det første oppsigelsesbrevet 13. april satte fratreden til 14. juli; det andre 16. juni flyttet den frem til 20. juni.",
            "I det andre brevet ba hun samtidig om fornyelse av lærerregistreringen for 1998 og brukte Lesley Lovedays adresse. Det passer dårlig med en enkel fortelling om et fullstendig og permanent brudd med yrkeslivet, men forklarer ikke alene hensikten hennes."
          ],
          rubric: ["Begge oppsigelsesbrevene og endringen fra 14. juli til 20. juni.", "Fornyelsen for 1998 eller den profesjonelle anerkjennelsen.", "Motsigelsen beskrives uten å dikte motiv."],
          sourceIds: ["src-coroner-2024", "src-timeline-compiled", "src-marion-person-compiled"]
        },
        {
          id: "bonus-3", group: "bonus",
          prompt: "Hvem var den virkelige Fernand Remakel, hvordan kom navnet inn i nettverket, og hva må sies om hans rolle i Marion-saken?",
          modelAnswer: [
            "Fernand Remakel var en virkelig mann fra Luxembourg og Monique Cornelius' tidligere ektefelle. Offentlige funn og senere undersøkelser knytter Ric Blums kjennskap til navnet til forholdet med Cornelius; Blum brukte senere Remakel-identiteten.",
            "Den virkelige Remakel er en uskyldig tredjepart og er ikke knyttet til Marions forsvinning. Enkelte biografiske detaljer om ham er ikke like godt dokumentert som selve identitetsforbindelsen."
          ],
          rubric: ["Virkelig luxembourgsk person, ikke Blum.", "Monique Cornelius som identitetsbro.", "Uskyldig tredjepart og kildeforbehold."],
          sourceIds: ["src-coroner-2024", "src-remakel-compiled", "src-blum-alias-compiled"]
        },
        {
          id: "bonus-4", group: "bonus",
          prompt: "Hva var Ballina Coin Investments, og hvordan koblet selskapet kontaktannonsen til et større identitets- og pengespor?",
          modelAnswer: [
            "Ballina Coin Investments ble registrert i 1994 med Frederick og Diane De Hedervary som direktører. Telefonen ble koblet til kort tid etter og frakoblet i februar 1995; coronerens materiale beskriver ingen inntekt og vurderte selskapet som et middel til å skjule kontaktannonsens forbindelse til familien.",
            "Myntvirksomhet og senere auksjonsspor gir et dokumenterbart nettverk av navn og økonomiske kontaktpunkter. De viser ikke hvor Marions penger endte, og senere mynttransaksjoner beviser ikke hva som skjedde i 1997."
          ],
          rubric: ["1994-selskapet og De Hedervary-navnet.", "Kontaktannonse/telefonkoblingen.", "Myntsporet skilles fra bevis om Marions penger eller skjebne."],
          sourceIds: ["src-coroner-2024", "src-blum-finance-compiled", "src-blum-alias-compiled"]
        },
        {
          id: "bonus-5", group: "bonus",
          prompt: "Hvilket gjentakende mønster viser arkivsporene rundt andre kvinner, aliaser og mynter — og hvorfor er et mønster fortsatt ikke en løsning på Marion-saken?",
          modelAnswer: [
            "Kildene beskriver gjentatt bruk av aliaser og kontaktannonser, relasjoner bygget rundt en kultivert europeisk identitet, økonomiske løfter eller tap, og mynter eller samlerobjekter som kontakt- og pengespor.",
            "Et slikt mønster kan prioritere dokumenter, vitner og økonomiske undersøkelser. Det kan ikke alene bevise at samme hendelsesforløp rammet Marion, at en bestemt person utførte en bestemt transaksjon, eller at noen forårsaket hennes død."
          ],
          rubric: ["Minst tre dokumenterte mønsterelementer.", "Mønsteret brukes som etterforskningsverktøy.", "Mønster likestilles ikke med skyld eller årsak."],
          sourceIds: ["src-coroner-2024", "src-blum-alias-compiled", "src-blum-finance-compiled"]
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
      entry("ns11", "NS-11", "Australian Securities & Investments Commission – Ballina", "Ballina, New South Wales", "loc-ballina", [
        "Selskaps- og coroneropplysninger viser at Ballina Coin Investments ble registrert 2. september 1994 med Frederick og Diane De Hedervary som direktører.",
        "Telefonen ble koblet til kort tid etter og frakoblet 14. februar 1995. Materialet beskriver ingen inntekt og knytter selskapet til skjermingen av en kontaktannonse. Det sier ikke hvor Marions penger endte."
      ], [], ["src-coroner-2024", "src-blum-finance-compiled"], { era: "later" }),
      quiet("ns12", "NS-12", "Bankfilialene i Ballina", "Ballina, New South Wales", "loc-ballina"),
      entry("ns13", "NS-13", "Telefon- og annonsearkivet – Northern Rivers", "Ballina / Wollongbar, New South Wales", "loc-lismore", [
        "En kontaktannonse fra 1994 brukte Remakel-navnet og kunne spores via telefonopplysninger til Ballina Coin Investments-nettverket.",
        "Sporet kobler et alias, en kontaktmåte og et selskapsnavn. Det beviser ikke i seg selv når eller hvordan Marion møtte noen."
      ], [], ["src-coroner-2024", "src-blum-alias-compiled", "src-blum-finance-compiled"], { era: "later" }),
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
      entry("xr10", "XR-10", "Public Record Office Victoria – personregister", "Melbourne, Victoria", "loc-overseas", [
        "Arkivoversikten identifiserer Ilona Kinczel som Ric Blums tredje kone. Hun døde ung i Melbourne i 1977.",
        "Ingen offentlig kilde i materialet fastslår at dødsfallet skyldtes en forbrytelse eller at Blum medvirket. Arkivet fastslår ikke at dødsfallet skyldtes en forbrytelse eller at Blum medvirket."
      ], [], ["src-ilona-compiled", "src-blum-alias-compiled"], { era: "later" }),
      entry("xr11", "XR-11", "Luxembourg – folkeregister og lokalarkiv", "Luxembourg", "loc-overseas", [
        "Fernand Remakel var en virkelig person fra Luxembourg og Monique Cornelius' tidligere ektefelle. Senere materiale beskriver Cornelius som forbindelsen som ga Blum kjennskap til navnet.",
        "Den virkelige Remakel er en uskyldig tredjepart og er ikke knyttet til Marions forsvinning. Enkelte detaljer om hans biografi har begrenset åpen primærkildestøtte."
      ], [], ["src-coroner-2024", "src-remakel-compiled", "src-blum-alias-compiled"], { era: "later" }),
      entry("xr12", "XR-12", "Internasjonalt vitne- og selskapsarkiv", "Australia / Europa", "loc-overseas", [
        "Senere vitne- og arkivmateriale beskriver gjentatt bruk av aliaser, kontaktannonser, økonomiske løfter og mynter eller samlerobjekter i flere relasjoner.",
        "Mønsteret kan peke mot dokumenter og vitner som bør undersøkes. Det beviser ikke at samme hendelsesforløp rammet Marion eller at en navngitt person forårsaket hennes død."
      ], [], ["src-coroner-2024", "src-blum-alias-compiled", "src-blum-finance-compiled"], { era: "later" })
    ]
  };
})();
