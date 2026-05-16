# CAPITOLUL 5. EVALUAREA REZULTATELOR ÎN APLICAȚIE

Acest capitol prezintă rezultatele obținute în cadrul studiului de caz, structurate pe două axe complementare. Prima axă (secțiunea 5.1) descrie interfața aplicației dezvoltate, care orchestrează rularea benchmark-urilor și vizualizarea rezultatelor pentru ambele module — YCSB pentru evaluarea NoSQL (Redis, MongoDB) și modulul propriu pentru evaluarea SQL (PostgreSQL, MySQL). A doua axă (secțiunea 5.2) prezintă valorile concrete obținute experimental și oferă o interpretare tehnică a acestora, evidențiind care sistem oferă performanță superioară pentru fiecare scenariu și de ce, în raport cu particularitățile arhitecturale ale fiecărei baze de date evaluate.

## 5.1 Prezentarea interfeței aplicației

Aplicația dezvoltată oferă o interfață intuitivă pentru gestionarea și vizualizarea benchmark-urilor pe cele patru sisteme evaluate. Componenta de frontend a fost concepută cu scopul de a facilita atât controlul procesului de testare, cât și analiza rezultatelor, printr-o prezentare clară, structurată și unitară a informațiilor. Designul urmărește principiile de lizibilitate, permițând utilizatorului să interacționeze eficient cu sistemul fără a necesita cunoștințe avansate despre infrastructura subiacentă.

### 5.1.1 Ecranul principal („Home")

Ecranul principal reprezintă punctul central de operare și monitorizare al aplicației, oferind o imagine de ansamblu asupra stării sistemului și a disponibilității rezultatelor pentru ambele module. Acesta include următoarele componente funcționale (fig. 17):

**Cardul de status YCSB.** Furnizează informații privind starea curentă a benchmark-urilor YCSB și a infrastructurii de execuție. Se poate observa, indicat vizual prin coduri de culoare (verde/galben), existența sau absența rezultatelor disponibile pentru analiză. Sunt afișate de asemenea conexiunile către bazele de date Redis și MongoDB, semnalând dacă acestea sunt active („Running") sau inactive („Stopped"). Acțiunile disponibile sunt:

- **Start Benchmark** — declanșează execuția completă a suitei YCSB (workload-urile A–F, secvențial pe Redis și MongoDB);
- **View Dashboard** — navigare către pagina dedicată analizei detaliate, activată exclusiv în prezența rezultatelor;
- **Check DB Connection** — verificare manuală a conectivității și disponibilității bazelor de date NoSQL.

**Cardul de status SQL.** Această componentă a evoluat dincolo de stadiul de „extensie viitoare" și expune funcționalitatea completă a modulului SQL. Furnizează aceleași informații ca și cardul YCSB, dar pentru bazele de date PostgreSQL și MySQL: starea rezultatelor, starea containerelor și acțiuni similare de start, vizualizare și verificare conexiune. Această paralelism între cele două carduri reflectă caracterul modular și scalabil al arhitecturii frontend, precum și echivalența metodologică între cele două module.

**Panoul de progres al execuției.** O componentă afișată exclusiv pe durata rulării unui benchmark, care oferă feedback în timp real asupra stadiului procesului de testare:

- panoul este activat automat odată cu inițierea unui benchmark, indiferent de modulul rulat;
- afișează etapa curentă de execuție (de exemplu, „Inițializare container", „PHASE 1: PostgreSQL", „Running workload sql_w3");
- include o estimare procentuală a progresului (0–100%), contribuind la transparența și predictibilitatea procesului (fig. 18).

==introdu screenshot din ecranul principal actualizat, cu ambele carduri active (YCSB + SQL) și status pentru toate cele 4 baze de date ==

==introdu screenshot din panoul de progres în timpul unei rulări SQL active (de exemplu, faza PostgreSQL — Workload W3) ==

### 5.1.2 Dashboard YCSB

Ecranul „YCSB Dashboard" constituie componenta centrală de analiză și interpretare a rezultatelor experimentale pentru modulul NoSQL. Acesta integrează mecanisme de filtrare, vizualizare și agregare, permițând utilizatorului să analizeze comportamentul Redis și MongoDB în funcție de multiple criterii relevante pentru performanță.

**Configurarea și controlul vizualizării.** Dashboard-ul oferă utilizatorului un nivel ridicat de control asupra modului în care informațiile sunt afișate, prin următoarele mecanisme (fig. 19):

- **Selectarea metricii de performanță**, printr-un meniu dropdown care permite alegerea dintre throughput (operații/secundă), latența medie pentru fiecare tip de operație (read, update, insert, scan) și latențele percentile (p95, p99) — metrici critice pentru analiza tail latency.
- **Selectarea multiplă a workload-urilor** A–F, oferind flexibilitate pentru analize focalizate pe anumite scenarii de utilizare.
- **Alegerea tipului de reprezentare grafică** — bar chart pentru comparații side-by-side sau line chart pentru evidențierea tendințelor în funcție de workload.

**Vizualizarea și agregarea rezultatelor.** Datele filtrate sunt prezentate într-o formă intuitivă, facilitând analiza rapidă și identificarea diferențelor de performanță. Graficul principal este afișat dinamic în funcție de filtrele selectate și oferă o comparație vizuală directă între Redis și MongoDB pentru metrica și workload-urile alese (fig. 20). O secțiune dedicată agregării valorilor vizibile furnizează automat valoarea medie, minimul și maximul pentru metrica selectată; pe baza acestor agregări, aplicația determină automat baza de date cu performanțe superioare („Leader"), utilizând o logică adaptată naturii metricii analizate (valori mai mari sunt favorabile pentru throughput, în timp ce valori mai mici indică performanță mai bună în cazul latențelor).

**Secțiunea de informații și suport interpretativ.** Pentru a asigura o interpretare corectă a rezultatelor, dashboard-ul integrează o secțiune educativă extinsă, organizată în două file:

- **Workloads** — descrie în detaliu compoziția și scopul fiecărui workload standard YCSB: A (update heavy 50/50), B (read heavy 95/5), C (read only), D (read latest), E (scan heavy) și F (read-modify-write) (fig. 21);
- **Metrics** — oferă definiții tehnice riguroase și ghiduri de interpretare pentru fiecare metrică disponibilă, explicând diferențele dintre latența medie și latențele percentile, precum și implicațiile asupra evaluării experienței utilizatorului în scenarii extreme (fig. 22).

==introdu screenshot actualizat din YCSB Dashboard cu configuratorul de grafice și meniul lateral care arată ambele dashboard-uri (YCSB + SQL) ==

==introdu screenshot din graficul comparativ Redis vs MongoDB pe Workload A-F (throughput) ==

==introdu screenshot din fila Workloads cu cardurile A-F ==

==introdu screenshot din fila Metrics cu cardurile de metrici ==

### 5.1.3 Dashboard SQL

Ecranul „SQL Dashboard" reprezintă echivalentul funcțional al dashboard-ului YCSB pentru modulul de evaluare relațional. Acesta urmărește aceeași filozofie de proiectare — configurare flexibilă a vizualizării, comparație directă între cele două sisteme și suport interpretativ contextualizat — adaptată specificului bazelor de date SQL și workload-urilor de tip OLTP/OLAP.

**Configurarea graficului.** Utilizatorul poate alege dinamic metrica de interes dintr-un set dedicat modulului SQL:

- **Throughput** (operații/secundă), pentru evaluarea capacității de procesare;
- **Latența medie** (microsecunde), pentru cazul mediu;
- **Latența p95 și p99** (microsecunde), pentru analiza cozii distribuției — esențială în sisteme cu cerințe SLA.

Selectorul multiplu de workload-uri permite includerea sau excluderea oricăruia dintre cele patru workload-uri custom: W1 (join-heavy), W2 (aggregation-heavy), W3 (transaction-heavy) și W4 (mixed OLTP+OLAP). Tipul de grafic poate fi comutat între bar chart și line chart, ca în modulul YCSB.

**Tabelul cu rezultate brute.** Sub graficul principal este prezentat un tabel detaliat cu cele opt rânduri rezultate din combinația celor două baze de date (PostgreSQL, MySQL) cu cele patru workload-uri. Tabelul afișează toate metricile colectate — throughput, latențe avg/p95/p99, operații cerute/reușite/eșuate, număr de thread-uri și seed-ul folosit — permițând inspecția datelor la nivel de granularitate maximă, nu doar agregat.

**Indicatorul de câștigător.** Similar cu dashboard-ul YCSB, aplicația determină automat baza de date cu performanță superioară pentru fiecare workload, pe baza mediei metricii alese. Acest indicator reduce efortul cognitiv al utilizatorului și permite identificarea rapidă a tendințelor dominante.

**Secțiunea informativă.** Două seturi de carduri explică contextul:

- **Workload-uri** — descrie scopul fiecărui workload custom (de exemplu, W1 testează planificatorul de join-uri pe patru tabele, W3 testează overhead-ul tranzacțional și comportamentul sub conflict);
- **Metrici** — oferă definiții și ghiduri de interpretare adaptate contextului SQL, evidențiind, de exemplu, importanța p99 în sisteme cu tranzacții concurente.

**Selectorul de runs istorice.** O caracteristică prezentă atât în dashboard-ul YCSB cât și în cel SQL, dar deosebit de utilă pentru modulul SQL — un dropdown alimentat din endpoint-ul `/api/runs?module=sql` care permite revizitarea rezultatelor unor rulări anterioare. Această funcționalitate este alimentată din snapshot-urile timestamped (`results/runs/sql/<timestamp>/`) generate automat la finalul fiecărei rulări, permițând comparații longitudinale ale performanței după modificări de configurare, versiune sau hardware.

==introdu screenshot din SQL Dashboard cu configuratorul de grafice și graficul de throughput PostgreSQL vs MySQL ==

==introdu screenshot din tabelul cu rezultate brute (8 rânduri × 12 coloane) ==

==introdu screenshot din secțiunea informativă cu cardurile descriptive W1-W4 ==

==introdu screenshot din selectorul de runs istorice (dropdown cu mai multe rulări timestamped) ==

## 5.2 Rezultate experimentale și interpretare

Această secțiune prezintă valorile concrete obținute în urma rulării celor două module pe configurația de referință și oferă o interpretare tehnică a acestora. Toate testele au fost executate pe aceeași infrastructură containerizată, cu parametri reproductibili (seed fix 42, resetarea bazelor între workload-uri).

### 5.2.1 Rezultate modulul YCSB (Redis vs MongoDB)

Parametrii utilizați au fost: `RECORD_COUNT = 100.000`, `OPERATION_COUNT = 100.000`, `THREADS = 10`. Tabelul 5.1 sintetizează valorile de throughput și latența medie de citire pentru cele șase workload-uri YCSB.

**Tabelul 5.1 Rezultate YCSB — throughput și latență medie de citire**

| Workload | Profil               | Redis (ops/sec) | MongoDB (ops/sec) | Redis read avg (μs) | MongoDB read avg (μs) | Câștigător     |
| -------- | -------------------- | --------------- | ----------------- | ------------------- | --------------------- | -------------- |
| A        | Update heavy (50/50) | 13.205          | **19.841**        | 749                 | 448                   | MongoDB (×1,5) |
| B        | Read heavy (95/5)    | 15.605          | **17.361**        | 626                 | 517                   | MongoDB (×1,1) |
| C        | Read only            | **26.660**      | 23.452            | 364                 | 379                   | Redis (×1,1)   |
| D        | Read latest          | **26.575**      | 9.646             | 349                 | 939                   | Redis (×2,8)   |
| E        | Scan heavy           | 651             | **5.331**         | –                   | –                     | MongoDB (×8,2) |
| F        | Read-modify-write    | **21.349**      | 12.332            | 307                 | 500                   | Redis (×1,7)   |

**Interpretare per workload:**

**Workload A (update heavy, 50/50).** MongoDB obține un avantaj de aproximativ 50% în throughput față de Redis, contraintuitiv pentru un sistem in-memory față de unul cu stocare persistentă. Explicația ține de modul în care fiecare sistem gestionează actualizările concurente: MongoDB folosește un mecanism eficient de write-batching la nivel de storage engine (WiredTiger), care optimizează scrierile concurente provenite de la cele 10 thread-uri, în timp ce Redis, deși operează în memorie, este predominant single-threaded pentru operațiile de scriere. Astfel, cu 50% updates, gâtuirea apare pe firul de execuție principal al Redis-ului, nu în operațiile de I/O.

**Workload B (read heavy, 95/5).** Diferența se reduce la doar 11% în favoarea MongoDB. Pe măsură ce ponderea scrierilor scade, avantajul write-batching-ului dispare, iar diferența se atenuează semnificativ. Latențele medii de citire confirmă această tendință (626 μs pentru Redis vs. 517 μs pentru MongoDB).

**Workload C (read only).** Redis recâștigă avantajul (~14% mai mult throughput), confirmând superioritatea sa pentru operațiile pure de citire — exact scenariul pentru care a fost optimizat: lookup direct în memorie pe o cheie. Latențele sunt similare (364 vs 379 μs), iar diferența vine din eficiența rețelei și a protocolului RESP.

**Workload D (read latest).** Aici Redis obține cel mai mare avantaj — aproximativ 2,8× față de MongoDB. Pattern-ul „citire a celor mai recente date" favorizează puternic locality-ul de memorie al Redis-ului, în timp ce MongoDB suferă din cauza pattern-ului de inserare urmat imediat de citire, care invalidează cache-urile de pe storage și forțează accese la disk pe documente nou create.

**Workload E (scan heavy).** Cea mai dramatică inversare: MongoDB este de aproximativ 8× mai rapid (5.331 vs 651 ops/sec). Redis nu este optimizat pentru operații de tip range scan — operația `SCAN` din protocolul Redis necesită iterare prin întreg keyspace-ul cu cursor, fără indexuri secundare native. MongoDB, în schimb, folosește indexuri B-tree pe câmpurile scanate, ceea ce reduce dramatic costul. Acest rezultat ilustrează că alegerea unei baze de date trebuie să țină cont de pattern-urile de acces — Redis este excelent pentru lookup-uri punctuale, dar slab pentru iterări pe intervale.

**Workload F (read-modify-write).** Redis își recâștigă avantajul (~73%) datorită operațiilor atomice eficiente la nivel de cheie (`MULTI`/`EXEC`, comenzile native cu condiționalitate). MongoDB suferă din cauza overhead-ului mecanismelor optimiste de concurență (compare-and-swap pe documente întregi).

**Concluzie YCSB.** Niciuna dintre cele două baze nu este universal superioară. Redis domină scenariile cu **citiri punctuale și read-modify-write** (C, D, F), iar MongoDB domină scenariile cu **scrieri batch și scanări** (A, B, E). Alegerea trebuie făcută în funcție de pattern-ul de acces al aplicației.

### 5.2.2 Rezultate modulul SQL (PostgreSQL vs MySQL)

Parametrii utilizați au fost: `SQL_OPERATION_COUNT = 2.000`, `SQL_THREADS = 8`, `SQL_USERS = 10.000`, `SQL_PRODUCTS = 1.000`, `SQL_ORDERS = 10.000`. Tabelul 5.2 sintetizează valorile pentru toate cele patru workload-uri SQL.

**Tabelul 5.2 Rezultate SQL — throughput și latențe**

| Workload | Profil            | PostgreSQL ops/s | MySQL ops/s | PG avg (μs) | MySQL avg (μs) | PG p99 (μs) | MySQL p99 (μs) | Câștigător        |
| -------- | ----------------- | ---------------- | ----------- | ----------- | -------------- | ----------- | -------------- | ----------------- |
| W1       | Join heavy        | **6.152**        | 1.250       | 1.222       | 6.268          | 2.800       | 12.212         | PostgreSQL (×4,9) |
| W2       | Aggregation heavy | **464**          | 70          | 16.428      | 111.600        | 39.002      | 276.032        | PostgreSQL (×6,6) |
| W3       | Transaction heavy | **1.989**        | 268         | 3.910       | 29.410         | 6.885       | 70.336         | PostgreSQL (×7,4) |
| W4       | Mixed OLTP + OLAP | **1.015**        | 205         | 6.970       | 34.299         | 41.423      | 214.814        | PostgreSQL (×5,0) |

**Interpretare per workload:**

**Workload W1 (join-heavy).** PostgreSQL este de aproximativ 5× mai rapid și are o latență p99 de ~4× mai mică (2,8 ms vs 12,2 ms). Diferența majoră vine din planificatorul de interogări al PostgreSQL, care utilizează cost-based optimization avansat pentru join-uri multi-tabel, alegând eficient între strategii hash-join, merge-join și nested-loop. MySQL InnoDB folosește predominant nested-loop join cu look-up prin indexuri, ceea ce penalizează interogările cu lanțuri lungi de join-uri (W1 implică 4 tabele).

**Workload W2 (aggregation-heavy).** Avantajul PostgreSQL crește la ~6,6× la throughput și la ~7× la latența p99. Workload-ul W2 conține predominant interogări `GROUP BY` cu funcții de agregare pe categorii, iar PostgreSQL beneficiază aici de:

- agregări mai eficiente prin algoritmi hash-aggregate paralelizabili;
- statistici mai detaliate pe coloane (`pg_statistic`), care permit planificatorului să aleagă strategia optimă;
- gestionare mai eficientă a memoriei pentru ordonarea și gruparea valorilor (`work_mem`).

Latențele p99 de 276 ms la MySQL indică prezența unor outlieri semnificativi — operații care, deși au reușit, au depășit cu mult media. Acest comportament este tipic pentru sistemele care recurg la operații pe disk atunci când memoria de lucru este insuficientă.

**Workload W3 (transaction-heavy).** Diferența cea mai pronunțată — PostgreSQL este de aproximativ 7,4× mai rapid în throughput. Workload-ul W3 implică tranzacții multi-statement cu UPDATE pe `products.stock`, INSERT în `orders` și `order_items`, plus UPDATE pe `users.balance`. Avantajul PostgreSQL ține de:

- implementarea MVCC (Multi-Version Concurrency Control) care permite citiri concurente fără blocare;
- mecanismele de detecție a deadlock-urilor mai eficiente;
- WAL (Write-Ahead Logging) optimizat pentru tranzacții scurte cu fsync grupat.

MySQL InnoDB folosește și el MVCC, dar gen-locking-ul pe nivel de rând în combinație cu modul implicit `REPEATABLE READ` introduce conflict de scriere mai frecvent pe `products.stock`, ceea ce duce la latențe p99 de peste 70 ms.

**Workload W4 (mixed OLTP + OLAP).** Combinație ponderată a celorlalte trei (55% W1 + 25% W2 + 20% W3). Rezultatul oglindește media ponderată a workload-urilor componente, cu PostgreSQL menținând avantajul de ~5×. Latența p99 ridicată (41 ms pentru PostgreSQL, 215 ms pentru MySQL) este influențată în principal de componenta de agregare (W2), care produce „spike-uri" punctuale.

**Concluzie SQL.** Spre deosebire de modulul YCSB, unde rezultatele depind puternic de pattern-ul de acces, în modulul SQL **PostgreSQL domină categoric pe toate cele patru workload-uri**, cu factori multiplicativi între ×4,9 și ×7,4. Această dominanță reflectă diferențele arhitecturale fundamentale: PostgreSQL este proiectat din temelii ca sistem orientat OLTP+OLAP cu planificator avansat, în timp ce MySQL a evoluat istoric ca sistem optimizat pentru workload-uri web simple (citiri masive prin chei primare/secundare), iar suportul pentru join-uri complexe și agregări este mai limitat. Diferențele se accentuează cu cât interogarea este mai complexă din punct de vedere al planificării.

### 5.2.3 Sinteza comparativă

Cele două module construiesc împreună o imagine completă a peisajului bazelor de date moderne, evidențiind patru observații cheie:

**1. Specializarea contează mai mult decât „performanța absolută".** Niciuna dintre cele patru baze de date evaluate nu este universal superioară. Redis excelează pe citiri punctuale, MongoDB pe scrieri batch și scanări, PostgreSQL pe interogări relaționale complexe, iar MySQL — deși inferior PostgreSQL-ului în acest studiu — rămâne competitiv pe workload-uri simple, neacoperite explicit aici.

**2. Diferența între paradigme se vede în coada distribuției (p99), nu doar în medie.** În modulul SQL, latențele p99 ale MySQL sunt de 4–7× mai mari decât ale PostgreSQL, indicând nu doar performanță medie mai slabă, ci și **comportament mai puțin predictibil** sub sarcină. Pentru aplicații cu cerințe SLA stricte, această diferență este mai importantă decât diferența la media latențelor.

**3. Modulul SQL completează metodologic modulul YCSB.** YCSB nu poate evalua scenarii reprezentative pentru bazele de date relaționale (join-uri, agregări, tranzacții multi-statement). Engine-ul propriu acoperă exact acest spațiu, păstrând în același timp metodologia inspirată din YCSB — faze separate de pregătire și măsurare, calcul de percentile, throughput sustained.

**4. Valoarea unei aplicații unitare de benchmarking.** Faptul că toate cele patru baze sunt evaluate în același mediu containerizat, cu aceeași infrastructură de orchestrare și aceleași standarde de raportare, permite comparații consistente care ar fi extrem de greu de obținut prin instrumente disparate. Capacitatea aplicației de a arhiva snapshot-uri timestamped și de a oferi acces istoric extinde valoarea acestui cadru și pentru utilizări viitoare — de exemplu, evaluarea impactului unei migrări de versiune (PostgreSQL 16 → 17) sau a unei modificări de schemă pe aceleași workload-uri.
