# CAPITOLUL 5. EVALUAREA REZULTATELOR ÎN APLICAȚIE

Acest capitol prezintă rezultatele obținute în cadrul studiului de caz, structurate pe două axe complementare. Prima axă (secțiunea 5.1) descrie interfața aplicației dezvoltate, care orchestrează rularea benchmark-urilor și vizualizarea rezultatelor pentru ambele module — YCSB pentru evaluarea NoSQL (Redis, MongoDB) și modulul propriu pentru evaluarea SQL (PostgreSQL, MySQL). A doua axă (secțiunea 5.2) prezintă valorile concrete obținute experimental sub formă de tabele sintetice, urmând ca interpretarea tehnică detaliată a acestora și concluziile aferente să fie tratate în Capitolul 6.

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

## 5.2 Rezultate experimentale

Această secțiune prezintă valorile concrete obținute în urma rulării celor două module pe configurația de referință. Toate testele au fost executate pe aceeași infrastructură containerizată, cu parametri reproductibili (seed fix 42, resetarea bazelor între workload-uri). Interpretarea tehnică detaliată a acestor valori și concluziile derivate sunt prezentate în Capitolul 6.

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

Pe ansamblu, rezultatele YCSB sunt împărțite: MongoDB obține throughput superior pe workload-urile cu pondere de scriere și pe scanări (A, B, E), în timp ce Redis domină scenariile cu citiri punctuale și operații atomice (C, D, F). Diferențele variază de la marginale (×1,1 pentru workload-ul B) până la dramatice (×8,2 pentru workload-ul E).

### 5.2.2 Rezultate modulul SQL (PostgreSQL vs MySQL)

Parametrii utilizați au fost: `SQL_OPERATION_COUNT = 2.000`, `SQL_THREADS = 8`, `SQL_USERS = 10.000`, `SQL_PRODUCTS = 1.000`, `SQL_ORDERS = 10.000`. Tabelul 5.2 sintetizează valorile pentru toate cele patru workload-uri SQL.

**Tabelul 5.2 Rezultate SQL — throughput și latențe**

| Workload | Profil            | PostgreSQL ops/s | MySQL ops/s | PG avg (μs) | MySQL avg (μs) | PG p99 (μs) | MySQL p99 (μs) | Câștigător        |
| -------- | ----------------- | ---------------- | ----------- | ----------- | -------------- | ----------- | -------------- | ----------------- |
| W1       | Join heavy        | **6.152**        | 1.250       | 1.222       | 6.268          | 2.800       | 12.212         | PostgreSQL (×4,9) |
| W2       | Aggregation heavy | **464**          | 70          | 16.428      | 111.600        | 39.002      | 276.032        | PostgreSQL (×6,6) |
| W3       | Transaction heavy | **1.989**        | 268         | 3.910       | 29.410         | 6.885       | 70.336         | PostgreSQL (×7,4) |
| W4       | Mixed OLTP + OLAP | **1.015**        | 205         | 6.970       | 34.299         | 41.423      | 214.814        | PostgreSQL (×5,0) |

Spre deosebire de modulul YCSB, unde rezultatele sunt împărțite în funcție de natura workload-ului, modulul SQL evidențiază o dominanță constantă a PostgreSQL pe toate cele patru workload-uri, cu factori multiplicativi între ×4,9 și ×7,4 atât la throughput, cât și la latențele percentile p99. Această uniformitate sugerează diferențe arhitecturale fundamentale între cele două sisteme, analizate în detaliu în Capitolul 6.
