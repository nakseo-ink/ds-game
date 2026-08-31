"use strict";
/* 챕터 10 데이터 — "가중치 그래프" = 12주차 (강의 6장 38~53매 · 제작 규약 v1.4 · 아크 v1.6 · 주간 루프 공용 러너 사용)
   가중치·MST 문제(greedy·제한 3조건) → Kruskal(+union-find 개념) → Prim → Dijkstra.
   서사: 옛 프린트 복선(화) + 문자 5(순수 압박·초조) + 도발장 6(최후의 카드) → 단서 ⑤(주인공 자력 대조, 승패 무관 등록).
   교재 공용 그래프 T3(무방향 가중치, 표준 예제): 정점 0~6, 간선 (0,1,28)(0,5,10)(1,2,16)(1,6,14)(2,3,12)(3,4,22)(3,6,18)(4,5,25)(4,6,24)
   — Kruskal: 10✓ 12✓ 14✓ 16✓ 18✗ 22✓ 24✗ 25✓ 총 99 / Prim(0): 10→25→22→12→16→14 (같은 트리).
   T4(방향 가중치, 원본 45·50매): 0→1:50 0→2:10 0→4:45 1→2:15 1→4:10 2→0:20 2→3:15 3→1:20 3→4:35 4→2:30 5→3:3
   — Dijkstra(0): v2(10)→v3(25)→v1(45)→v4(45) 확정, 최종 [0,45,10,25,45,∞]. */
const CH10 = {
  meta: { id:"ch10", week:12, title:"가중치 그래프", sub:"가장 싸게 잇고, 가장 짧게 간다", nextTeaser:"정렬",
          nextHint:'교수님이 다음 주부터는 <b>정렬</b>이래요. 데이터를 크기 순서로 줄 세우는 방법이 한두 가지가 아니라던데 — 뭔가 총정리 느낌이에요.' },
  economy: { payPerPoint:1000, aplusBonus:200000 },
  exam: { unitPts:15, tutorPts:10, passLine:54 },
  apGen: "AP10",

  intro: [
    {who:"도윤", face:"doyun", text:'쌤! 오늘 수업에서 교수님이 그래프 마지막 주제라면서 — 간선에 <b>숫자</b>를 붙였어요. 도시들을 회선으로 전부 잇는 공사비를 제일 싸게 하는 문제랑, 내비게이션처럼 제일 짧은 길을 찾는 문제래요.'},
    {who:"도윤", face:"doyun-worried", text:'근데 둘이 뭐가 달라요? 전부 잇는 거나 짧게 가는 거나… 둘 다 "제일 적게" 아니에요?'},
    {who:"나", face:"me-think", text:'<span class="inner">간선에 숫자 — 지난주 책의 마지막 문장이 떠오른다. "간선마다 비용이 다르다면?" 그 질문이 이번 주가 된 거다. 그리고 도윤의 물음이 정확히 급소다: 전부 잇기와 짧게 가기는 다른 문제다. 어떻게 다른지, 이번 주에 가른다.</span>'},
    {who:"나", face:"me", text:'좋은 질문이다 — 하나는 <b>모두를 잇는</b> 문제고, 하나는 <b>한 곳에서 각각의 곳까지 가는</b> 문제야. 답도 다르고 방법도 달라. 이번 주에 둘 다 손에 넣자. 월요일 밤, 책부터.'}
  ],

  flow: ["study-A","trial-A","il-A","study-B","trial-B","il-B","tutor","study-C","trial-C","il-C","study-D","trial-D","saturday","sunday"],
  cpl: {
    "study-A":"12주차 · 월 — MST 문제 자습","trial-A":"12주차 · 월 — MST 시련","il-A":"12주차 · 월요일 밤",
    "study-B":"12주차 · 화 — Kruskal 자습","trial-B":"12주차 · 화 — Kruskal 시련","il-B":"12주차 · 화요일 밤",
    "tutor":"12주차 · 수 — 과외",
    "study-C":"12주차 · 목 — Prim 자습","trial-C":"12주차 · 목 — Prim 시련","il-C":"12주차 · 목요일 밤",
    "study-D":"12주차 · 금 — Dijkstra 자습","trial-D":"12주차 · 금 — Dijkstra 시련",
    "saturday":"12주차 · 토 — 보충/A+","sunday":"12주차 · 월 — 쪽지시험"
  },

  trials: {
    A:{gen:"G37", label:"MST 판독기", doneLabel:"유닛 A 숙달 ▶"},
    B:{gen:"G38", label:"Kruskal 추적기", doneLabel:"유닛 B 숙달 ▶"},
    C:{gen:"G39", label:"Prim 추적기", doneLabel:"유닛 C 숙달 ▶"},
    D:{gen:"G40", label:"Dijkstra 판독기", doneLabel:"유닛 D 숙달 ▶"}
  },
  ilNext: { A:"화요일 — 유닛 B ▶", B:"수요일 — 과외 ▶", C:"금요일 — 유닛 D ▶" },
  tutorNextLabel:"목요일 밤 — 유닛 C ▶",
  tutorPassMsg:'제일 싼 것부터 골라도 사이클만 피하면 최소가 된다는 게 신기해요. 아 맞다 — 월요일 수업에서 <b>프림</b>이라는 것도 지나갔었는데요, 「시작점에서 키워 간다」는 것만 받아 적었어요. 그것도 곧 부탁드려요.',

  /* ================= 자습 ================= */
  study: {
    A: { day:"월요일", label:"유닛 A", title:"가중치 그래프와 최소 비용 신장 트리", doneLabel:"시련 — MST 판독기 ▶", beats:[
      {say:'지난주 책의 마지막 문장 — "간선마다 비용이 다르다면?" 오늘 그 답이 시작된다.', mood:"awkward"},
      {who:"book", say:'"간선에 숫자를 붙인 그래프를 <b>가중치 그래프</b>라 한다. 숫자의 뜻은 문제가 정한다 — 통신망이면 회선 공사비, 도로망이면 거리, 항공망이면 시간. 지난주의 신장 트리를 떠올려라: 도시 n개를 잇는 최소의 회선 수는 n−1개였다. 그런데 회선마다 <b>공사비가 다르다면</b> — 어느 n−1개를 골라야 하는가?"'},
      {who:"book", say:'"이것이 <b>최소 비용 신장 트리(minimum cost spanning tree)</b> 문제다. 간선 수는 어느 신장 트리든 n−1개로 같다 — 겨루는 것은 <b>간선 가중치의 합</b>이다. 그 합이 가장 작은 신장 트리를 찾는다."'},
      {check:{id:"c10A-1", stem:'<b>최소 비용 신장 트리</b>에서 "최소"가 가리키는 것은?',
        okfb:'간선 수는 어느 신장 트리나 n−1개 — 겨루는 것은 가중치의 합이다.',
        choices:[
          {text:"간선 가중치의 합",correct:true},
          {text:"간선의 개수",correct:false,mc:"count-myth",fb:"간선 수는 어느 신장 트리든 n−1개로 같다."},
          {text:"트리의 깊이",correct:false,mc:"depth-myth",fb:"깊이는 조건에 없다 — 비용의 합만 본다."},
          {text:"정점의 개수",correct:false,mc:"vertex-myth",fb:"신장 트리는 정의상 모든 정점을 포함한다."}]}},
      {who:"book", say:'"찾는 전략은 <b>greedy method</b> — 한 번에 하나씩, 그 시점에서 <b>가장 좋아 보이는 것</b>을 고르고, <b>한 번 내린 결정은 번복하지 않는다</b>. 전체를 다 따져 보지 않는데도 최소에 도달한다는 것이 이 문제의 아름다운 점이다. 대표 선수가 둘 — 내일의 <b>Kruskal</b>과 이번 주의 <b>Prim</b>이다(Sollin이라는 방법도 있다 — 이름만 알아 두라)."'},
      {check:{id:"c10A-2", stem:'greedy method의 특징으로 옳은 것은?',
        okfb:'단계마다 그 시점의 최선을 고르고, 한 번 내린 결정은 번복하지 않는다.',
        choices:[
          {text:"한 번 내린 결정을 번복하지 않는다",correct:true},
          {text:"모든 경우를 전부 나열해 본 뒤 고른다",correct:false,mc:"brute-myth",fb:"전수 조사가 아니다 — 단계별 최선 선택이다."},
          {text:"결과가 나쁘면 되돌아가 다시 고른다",correct:false,mc:"backtrack-myth",fb:"백트래킹이 아니다 — 번복 불가가 특징이다."},
          {text:"무작위로 여러 번 골라 가장 좋은 것을 남긴다",correct:false,mc:"random-myth",fb:"무작위가 아니라 판단 기준에 따른 최선이다."}]}},
      {who:"book", say:'"고를 때 지켜야 할 <b>제한 조건 셋</b>. ① 그래프 안에 <b>있는 간선만</b> 쓴다. ② <b>정확히 n−1개</b>를 쓴다. ③ <b>사이클을 만드는 간선은 쓸 수 없다</b> — 사이클은 낭비다: 이미 이어진 두 점을 또 잇는 데 돈을 쓰는 셈이니까."'},
      {who:"book", say:'"이번 주의 연습장이다. 도시 일곱(정점 0~6), 회선 후보 아홉 — 간선 옆 숫자가 공사비다. 신장 트리의 간선 수는 7 − 1 = <b>6개</b>. 아홉 중 어느 여섯을 고르는가 — 내일부터 두 방법이 각자의 답을 낸다."',
       viz:{type:"graph", nodes:[{id:0,x:90,y:20},{id:1,x:160,y:70},{id:2,x:160,y:170},{id:3,x:90,y:225},{id:4,x:20,y:170},{id:5,x:20,y:70},{id:6,x:90,y:120}],
            edges:[{a:0,b:1,lab:28},{a:0,b:5,lab:10},{a:1,b:2,lab:16},{a:1,b:6,lab:14},{a:2,b:3,lab:12},{a:3,b:4,lab:22},{a:3,b:6,lab:18},{a:4,b:5,lab:25},{a:4,b:6,lab:24}]}},
      {check:{id:"c10A-3", stem:'위 그래프(정점 7개, 간선 9개)의 최소 비용 신장 트리가 갖는 <b>간선 수</b>는?',
        okfb:'비용과 무관하게 신장 트리라면 7 − 1 = 6개다.',
        choices:[
          {text:"6개",correct:true},
          {text:"9개",correct:false,mc:"all-edges",fb:"간선 전부가 아니라 트리를 이루는 최소한이다."},
          {text:"7개",correct:false,mc:"vertex-confuse",fb:"정점 수만큼 이으면 사이클이 생긴다."},
          {text:"5개",correct:false,mc:"count-slip",fb:"정점 7개를 모두 이으려면 6개가 필요하다."}]}}
    ]},

    B: { day:"화요일", label:"유닛 B", title:"Kruskal 알고리즘", doneLabel:"시련 — Kruskal 추적기 ▶", beats:[
      {say:'첫 번째 방법. 어제 도윤의 감각 — "제일 싼 것부터 깔면 되잖아요"가 얼마나 맞는지, 오늘 확인한다.', mood:"proud"},
      {who:"book", say:'"<b>Kruskal</b>의 발상은 단순하다: 간선을 <b>가중치 오름차순으로 정렬</b>해 놓고, 싼 것부터 하나씩 트리 T에 넣는다. 단 하나의 관문 — <b>사이클을 만드는 간선은 거부</b>한다. n−1개가 모이면 끝."'},
      {who:"book", say:'"의사코드로. E는 남은 간선 집합, T는 만들고 있는 트리다."',
       code:["T = { };","while (T가 n-1개 미만의 간선 포함 && E가 비어 있지 않음) {","    E에서 최저 비용 간선 (v,w) 선택;","    E에서 (v,w)를 삭제;","    if ((v,w)가 T에서 사이클을 형성하지 않음)","        (v,w)를 T에 추가;","    else","        (v,w)를 거부;","}","if (T가 n-1개보다 적은 간선을 포함)","    printf(\"No spanning tree\\n\");"]},
      {check:{id:"c10B-1", stem:'Kruskal이 간선을 <b>검토하는 순서</b>는?',
        okfb:'간선을 가중치 오름차순으로 정렬해 — 싼 것부터 검토한다.',
        choices:[
          {text:"가중치가 싼 간선부터",correct:true},
          {text:"정점 번호가 작은 간선부터",correct:false,mc:"index-myth",fb:"번호가 아니라 가중치로 정렬한다."},
          {text:"출발 정점에 가까운 간선부터",correct:false,mc:"prim-confuse",fb:"출발 정점이라는 개념 자체가 없다 — 그건 Prim의 방식이다."},
          {text:"가중치가 비싼 간선부터",correct:false,mc:"reverse-myth",fb:"최소 비용을 원하니 싼 쪽부터다."}]}},
      {who:"book", say:'"사이클 검사는 어떻게 하나 — 그릴 필요 없다. 정점마다 <b>소속 팀</b>을 적어 두면 된다. 처음엔 전원이 1인 팀. 간선의 두 끝이 <b>다른 팀이면 채택</b>하고 두 팀을 합친다. <b>같은 팀이면</b> 이미 어딘가로 이어져 있다는 뜻 — 지금 이으면 사이클이니 <b>거부</b>. 이 팀 표시를 배열로 구현한 도구가 <b>union-find</b>다(구현은 심화의 몫 — 오늘은 개념까지)."'},
      {who:"book", say:'"연습장에서 실행하자. 정렬: 10, 12, 14, 16, 18, 22, 24, 25, 28."'},
      {steps:{code:["10 (0,5) — 채택","12 (2,3) — 채택","14 (1,6) — 채택","16 (1,2) — 채택 · 팀 {1,2,3,6} 탄생","18 (3,6) — 거부! 같은 팀","22 (3,4) — 채택","24 (4,6) — 거부! 같은 팀","25 (4,5) — 채택 · 6개 완성, 총 99"],
        frames:[
          {hl:0, viz:{type:"graph", nodes:[{id:0,x:90,y:20},{id:1,x:160,y:70},{id:2,x:160,y:170},{id:3,x:90,y:225},{id:4,x:20,y:170},{id:5,x:20,y:70},{id:6,x:90,y:120}], edges:[{a:0,b:1,lab:28},{a:0,b:5,lab:10,hl:true},{a:1,b:2,lab:16},{a:1,b:6,lab:14},{a:2,b:3,lab:12},{a:3,b:4,lab:22},{a:3,b:6,lab:18},{a:4,b:5,lab:25},{a:4,b:6,lab:24}]}, cap:'가장 싼 10 (0,5) — 두 끝점이 다른 팀 → 채택. 팀 {0,5}.'},
          {hl:1, viz:{type:"graph", nodes:[{id:0,x:90,y:20},{id:1,x:160,y:70},{id:2,x:160,y:170},{id:3,x:90,y:225},{id:4,x:20,y:170},{id:5,x:20,y:70},{id:6,x:90,y:120}], edges:[{a:0,b:1,lab:28},{a:0,b:5,lab:10,hl:true},{a:1,b:2,lab:16},{a:1,b:6,lab:14},{a:2,b:3,lab:12,hl:true},{a:3,b:4,lab:22},{a:3,b:6,lab:18},{a:4,b:5,lab:25},{a:4,b:6,lab:24}]}, cap:'다음 12 (2,3) → 채택. 팀 {0,5} {2,3}.'},
          {hl:2, viz:{type:"graph", nodes:[{id:0,x:90,y:20},{id:1,x:160,y:70},{id:2,x:160,y:170},{id:3,x:90,y:225},{id:4,x:20,y:170},{id:5,x:20,y:70},{id:6,x:90,y:120}], edges:[{a:0,b:1,lab:28},{a:0,b:5,lab:10,hl:true},{a:1,b:2,lab:16},{a:1,b:6,lab:14,hl:true},{a:2,b:3,lab:12,hl:true},{a:3,b:4,lab:22},{a:3,b:6,lab:18},{a:4,b:5,lab:25},{a:4,b:6,lab:24}]}, cap:'14 (1,6) → 채택. 팀 {0,5} {2,3} {1,6}.'},
          {hl:3, viz:{type:"graph", nodes:[{id:0,x:90,y:20},{id:1,x:160,y:70},{id:2,x:160,y:170},{id:3,x:90,y:225},{id:4,x:20,y:170},{id:5,x:20,y:70},{id:6,x:90,y:120}], edges:[{a:0,b:1,lab:28},{a:0,b:5,lab:10,hl:true},{a:1,b:2,lab:16,hl:true},{a:1,b:6,lab:14,hl:true},{a:2,b:3,lab:12,hl:true},{a:3,b:4,lab:22},{a:3,b:6,lab:18},{a:4,b:5,lab:25},{a:4,b:6,lab:24}]}, cap:'16 (1,2) — 팀 {2,3}과 {1,6}이 합쳐진다 → 채택. 큰 팀 {1,2,3,6} 탄생.'},
          {hl:4, viz:{type:"graph", nodes:[{id:0,x:90,y:20},{id:1,x:160,y:70},{id:2,x:160,y:170},{id:3,x:90,y:225},{id:4,x:20,y:170},{id:5,x:20,y:70},{id:6,x:90,y:120}], edges:[{a:0,b:1,lab:28},{a:0,b:5,lab:10,hl:true},{a:1,b:2,lab:16,hl:true},{a:1,b:6,lab:14,hl:true},{a:2,b:3,lab:12,hl:true},{a:3,b:4,lab:22},{a:3,b:6,lab:18,cut:true},{a:4,b:5,lab:25},{a:4,b:6,lab:24}]}, cap:'18 (3,6) — 3도 6도 이미 팀 {1,2,3,6} → <b>거부</b>(이으면 사이클). 점선이 거부의 흔적이다.'},
          {hl:5, viz:{type:"graph", nodes:[{id:0,x:90,y:20},{id:1,x:160,y:70},{id:2,x:160,y:170},{id:3,x:90,y:225},{id:4,x:20,y:170},{id:5,x:20,y:70},{id:6,x:90,y:120}], edges:[{a:0,b:1,lab:28},{a:0,b:5,lab:10,hl:true},{a:1,b:2,lab:16,hl:true},{a:1,b:6,lab:14,hl:true},{a:2,b:3,lab:12,hl:true},{a:3,b:4,lab:22,hl:true},{a:3,b:6,lab:18,cut:true},{a:4,b:5,lab:25},{a:4,b:6,lab:24}]}, cap:'22 (3,4) — 4는 아직 1인 팀 → 채택. 팀 {1,2,3,4,6} {0,5}.'},
          {hl:6, viz:{type:"graph", nodes:[{id:0,x:90,y:20},{id:1,x:160,y:70},{id:2,x:160,y:170},{id:3,x:90,y:225},{id:4,x:20,y:170},{id:5,x:20,y:70},{id:6,x:90,y:120}], edges:[{a:0,b:1,lab:28},{a:0,b:5,lab:10,hl:true},{a:1,b:2,lab:16,hl:true},{a:1,b:6,lab:14,hl:true},{a:2,b:3,lab:12,hl:true},{a:3,b:4,lab:22,hl:true},{a:3,b:6,lab:18,cut:true},{a:4,b:5,lab:25},{a:4,b:6,lab:24,cut:true}]}, cap:'24 (4,6) — 이제는 같은 팀 → <b>거부</b>.'},
          {hl:7, viz:{type:"graph", nodes:[{id:0,x:90,y:20},{id:1,x:160,y:70},{id:2,x:160,y:170},{id:3,x:90,y:225},{id:4,x:20,y:170},{id:5,x:20,y:70},{id:6,x:90,y:120}], edges:[{a:0,b:1,lab:28},{a:0,b:5,lab:10,hl:true},{a:1,b:2,lab:16,hl:true},{a:1,b:6,lab:14,hl:true},{a:2,b:3,lab:12,hl:true},{a:3,b:4,lab:22,hl:true},{a:3,b:6,lab:18,cut:true},{a:4,b:5,lab:25,hl:true},{a:4,b:6,lab:24,cut:true}]}, cap:'25 (4,5) — 두 팀이 하나로 → 채택. <b>6개 완성</b>: 10+12+14+16+22+25 = <b>총 99</b>. 28은 볼 필요도 없다.'}
        ]}},
      {check:{id:"c10B-2", stem:'위 실행에서 간선 <b>18 (3,6)</b>이 거부된 이유는?',
        okfb:'3과 6은 이미 12·14·16으로 같은 팀 — 지금 이으면 사이클이 생긴다.',
        choices:[
          {text:"3과 6이 이미 같은 팀이라 사이클이 생기므로",correct:true},
          {text:"가중치 18이 평균보다 비싸므로",correct:false,mc:"avg-myth",fb:"가중치의 절대 크기가 아니라 사이클 여부로 판정한다."},
          {text:"정점 6이 이미 간선을 두 개 갖고 있으므로",correct:false,mc:"degree-myth",fb:"차수 제한은 없다 — 팀(사이클) 판정뿐이다."},
          {text:"트리가 이미 6개 간선을 다 모았으므로",correct:false,mc:"count-myth",fb:"그 시점의 채택은 4개 — 아직 진행 중이다."}]}},
      {check:{id:"c10B-3", stem:'완성된 최소 비용 신장 트리의 <b>총비용</b>은?',
        okfb:'채택된 여섯: 10+12+14+16+22+25 = 99.',
        choices:[
          {text:"99",correct:true},
          {text:"117",correct:false,mc:"rej-add",fb:"거부된 18은 비용에 들어가지 않는다."},
          {text:"169",correct:false,mc:"all-edges",fb:"아홉 간선 전부가 아니라 채택된 여섯만 더한다."},
          {text:"74",correct:false,mc:"count-slip",fb:"여섯 간선을 빠짐없이 — 25까지 더하라."}]}}
    ]},

    C: { day:"목요일", label:"유닛 C", title:"Prim 알고리즘", doneLabel:"시련 — Prim 추적기 ▶", beats:[
      {say:'두 번째 방법. 어제 과외에서 도윤이 물었다 — "다른 방법도 있어요?" 있다. 오늘 그 답을 먼저 배워 둔다.', mood:"proud"},
      {who:"book", say:'"<b>Prim</b>은 Kruskal과 목표는 같고 걸음걸이가 다르다. 간선을 전역에서 고르는 대신 — <b>정점 하나로 시작한 트리를 한 정점씩 키운다</b>. 매 단계, 트리에 <b>한 끝만 닿아 있는</b> 간선 중 <b>최저 비용</b>을 채택한다. 채택된 간선들이 언제나 <b>하나의 트리</b>를 이룬다는 것 — 그게 Kruskal(숲이 여럿 생겼다 합쳐진다)과의 차이다."'},
      {who:"book", say:'"의사코드. TV는 현재 트리에 속한 정점 집합이다."',
       code:["T = { };  TV = {0};","while (T의 간선 수가 n-1보다 적음) {","    u ∈ TV이고 v ∉ TV인 최저 비용 간선 (u,v)를 찾음;","    if (그런 간선이 없음) break;","    v를 TV에 추가;","    (u,v)를 T에 추가;","}","if (T의 간선 수가 n-1보다 적음)","    printf(\"No spanning tree\\n\");"]},
      {check:{id:"c10C-1", stem:'Prim이 매 단계 채택하는 간선의 조건은?',
        okfb:'트리에 한 끝만 닿은 간선 중 최저 비용 — 안쪽 간선(사이클)도, 동떨어진 간선도 아니다.',
        choices:[
          {text:"트리에 한 끝만 닿은 것 중 최저 비용",correct:true},
          {text:"그래프 전체에서 최저 비용",correct:false,mc:"kruskal-confuse",fb:"전역 최저는 Kruskal의 기준 — Prim은 트리에 닿은 것만 본다."},
          {text:"두 끝이 모두 트리에 닿은 것 중 최저 비용",correct:false,mc:"cycle-blind",fb:"두 끝이 다 트리 안이면 사이클이 생긴다."},
          {text:"트리에서 가장 멀리 뻗어 나가는 것",correct:false,mc:"far-myth",fb:"거리가 아니라 비용이 기준이다."}]}},
      {who:"book", say:'"연습장에서 — 정점 0에서 시작한다."'},
      {steps:{code:["TV={0} — 닿은 간선 28, 10 중 → 10 (0,5)","TV={0,5} — 28, 25 중 → 25 (4,5)","TV={0,5,4} — 28, 22, 24 중 → 22 (3,4)","TV={0,5,4,3} — 28, 12, 18, 24 중 → 12 (2,3)","TV={0,5,4,3,2} — 28, 16, 18, 24 중 → 16 (1,2)","TV={…,1} — 14, 18, 24 중 → 14 (1,6) · 완성, 총 99"],
        frames:[
          {hl:0, viz:{type:"graph", nodes:[{id:0,x:90,y:20,hl:true},{id:1,x:160,y:70},{id:2,x:160,y:170},{id:3,x:90,y:225},{id:4,x:20,y:170},{id:5,x:20,y:70,hl:true},{id:6,x:90,y:120}], edges:[{a:0,b:1,lab:28},{a:0,b:5,lab:10,hl:true},{a:1,b:2,lab:16},{a:1,b:6,lab:14},{a:2,b:3,lab:12},{a:3,b:4,lab:22},{a:3,b:6,lab:18},{a:4,b:5,lab:25},{a:4,b:6,lab:24}]}, cap:'트리 {0}에 닿은 간선은 28과 10 — 최저 <b>10 (0,5)</b> 채택, 5 합류.'},
          {hl:1, viz:{type:"graph", nodes:[{id:0,x:90,y:20,dim:true},{id:1,x:160,y:70},{id:2,x:160,y:170},{id:3,x:90,y:225},{id:4,x:20,y:170,hl:true},{id:5,x:20,y:70,dim:true},{id:6,x:90,y:120}], edges:[{a:0,b:1,lab:28},{a:0,b:5,lab:10,hl:true},{a:1,b:2,lab:16},{a:1,b:6,lab:14},{a:2,b:3,lab:12},{a:3,b:4,lab:22},{a:3,b:6,lab:18},{a:4,b:5,lab:25,hl:true},{a:4,b:6,lab:24}]}, cap:'{0,5}에 닿은 것은 28과 25 — <b>25 (4,5)</b> 채택, 4 합류. (전체 최저였던 12는 아직 트리에 닿지 않아 후보조차 아니다.)'},
          {hl:2, viz:{type:"graph", nodes:[{id:0,x:90,y:20,dim:true},{id:1,x:160,y:70},{id:2,x:160,y:170},{id:3,x:90,y:225,hl:true},{id:4,x:20,y:170,dim:true},{id:5,x:20,y:70,dim:true},{id:6,x:90,y:120}], edges:[{a:0,b:1,lab:28},{a:0,b:5,lab:10,hl:true},{a:1,b:2,lab:16},{a:1,b:6,lab:14},{a:2,b:3,lab:12},{a:3,b:4,lab:22,hl:true},{a:3,b:6,lab:18},{a:4,b:5,lab:25,hl:true},{a:4,b:6,lab:24}]}, cap:'28, 22, 24 중 최저 <b>22 (3,4)</b> — 3 합류.'},
          {hl:3, viz:{type:"graph", nodes:[{id:0,x:90,y:20,dim:true},{id:1,x:160,y:70},{id:2,x:160,y:170,hl:true},{id:3,x:90,y:225,dim:true},{id:4,x:20,y:170,dim:true},{id:5,x:20,y:70,dim:true},{id:6,x:90,y:120}], edges:[{a:0,b:1,lab:28},{a:0,b:5,lab:10,hl:true},{a:1,b:2,lab:16},{a:1,b:6,lab:14},{a:2,b:3,lab:12,hl:true},{a:3,b:4,lab:22,hl:true},{a:3,b:6,lab:18},{a:4,b:5,lab:25,hl:true},{a:4,b:6,lab:24}]}, cap:'이제 12가 트리에 닿았다 — <b>12 (2,3)</b> 채택, 2 합류.'},
          {hl:4, viz:{type:"graph", nodes:[{id:0,x:90,y:20,dim:true},{id:1,x:160,y:70,hl:true},{id:2,x:160,y:170,dim:true},{id:3,x:90,y:225,dim:true},{id:4,x:20,y:170,dim:true},{id:5,x:20,y:70,dim:true},{id:6,x:90,y:120}], edges:[{a:0,b:1,lab:28},{a:0,b:5,lab:10,hl:true},{a:1,b:2,lab:16,hl:true},{a:1,b:6,lab:14},{a:2,b:3,lab:12,hl:true},{a:3,b:4,lab:22,hl:true},{a:3,b:6,lab:18},{a:4,b:5,lab:25,hl:true},{a:4,b:6,lab:24}]}, cap:'28, 16, 18, 24 중 <b>16 (1,2)</b> — 1 합류.'},
          {hl:5, viz:{type:"graph", nodes:[{id:0,x:90,y:20,dim:true},{id:1,x:160,y:70,dim:true},{id:2,x:160,y:170,dim:true},{id:3,x:90,y:225,dim:true},{id:4,x:20,y:170,dim:true},{id:5,x:20,y:70,dim:true},{id:6,x:90,y:120,hl:true}], edges:[{a:0,b:1,lab:28},{a:0,b:5,lab:10,hl:true},{a:1,b:2,lab:16,hl:true},{a:1,b:6,lab:14,hl:true},{a:2,b:3,lab:12,hl:true},{a:3,b:4,lab:22,hl:true},{a:3,b:6,lab:18},{a:4,b:5,lab:25,hl:true},{a:4,b:6,lab:24}]}, cap:'마지막 — <b>14 (1,6)</b>로 6 합류. 간선 6개, <b>총 99</b>. Kruskal과 <b>같은 트리</b>다 — 채택 순서만 달랐다.'}
        ]}},
      {check:{id:"c10C-2", stem:'위 실행에서 Prim이 <b>두 번째로 채택한</b> 간선은?',
        okfb:'{0,5}에 닿은 간선은 28과 25 — 최저 25 (4,5)다. 전체 최저였던 12는 아직 후보가 아니었다.',
        choices:[
          {text:"25 (4,5)",correct:true},
          {text:"12 (2,3)",correct:false,mc:"kruskal-confuse",fb:"전역 최저를 고르는 것은 Kruskal — 그 시점 트리에 닿아 있지 않았다."},
          {text:"28 (0,1)",correct:false,mc:"trace-slip",fb:"닿은 두 후보 28과 25 중 싼 쪽을 고른다."},
          {text:"14 (1,6)",correct:false,mc:"order-slip",fb:"14는 마지막 여섯 번째 채택이다."}]}},
      {check:{id:"c10C-3", stem:'같은 그래프에서 Kruskal의 총비용이 99였다. <b>Prim의 총비용</b>은?',
        okfb:'가중치가 전부 다르면 최소 비용 신장 트리는 유일 — 방법이 달라도 같은 트리, 같은 99다.',
        choices:[
          {text:"같은 99다",correct:true},
          {text:"시작 정점에 따라 달라진다",correct:false,mc:"start-myth",fb:"가중치가 전부 다르면 어느 시작점이든 같은 트리에 도달한다."},
          {text:"Prim이 조금 더 싸다",correct:false,mc:"better-myth",fb:"둘 다 '최소'를 찾는다 — 최소가 둘일 수는 없다."},
          {text:"Prim이 조금 더 비싸다",correct:false,mc:"worse-myth",fb:"Prim도 최소 비용 신장 트리를 만든다."}]}}
    ]},

    D: { day:"금요일", label:"유닛 D", title:"최단 경로 — Dijkstra", doneLabel:"시련 — Dijkstra 판독기 ▶", beats:[
      {say:'마지막 자습. 문제가 바뀐다 — 전부 잇는 게 아니라, <b>한 곳에서 각각의 곳까지</b>.', mood:"awkward"},
      {who:"book", say:'"고속도로망을 상상하라 — 정점은 도시, 간선은 도로, 가중치는 거리다. 통신망 설계자는 「전부 잇되 싸게」를 물었지만, <b>운전자</b>의 질문은 다르다: <b>내 도시에서 저 도시까지, 어느 길이 가장 짧은가.</b> 그런데 「짧다」부터 조심해야 한다. 아래의 세 도시를 보라 — 0에서 2로 가는 길은 둘이다. <b>직행</b>은 간선 하나(45), <b>경유</b>는 간선 둘(10+20=30). 어느 쪽이 짧은 길인가?"',
       viz:{type:"graph", nodes:[{id:0,x:28,y:52},{id:2,x:176,y:52},{id:1,x:102,y:160}],
            edges:[{a:0,b:2,dir:true,lab:45,loff:-10},{a:0,b:1,dir:true,lab:10,lpos:0.42},{a:1,b:2,dir:true,lab:20,lpos:0.58}]}},
      {who:"book", say:'"당연히 30 — 경유다. 즉 <b>경로의 길이는 거친 간선 가중치의 합</b>이지, 간선의 <b>개수</b>가 아니다. 그래서 지난주의 BFS로는 이 문제를 못 푼다: BFS의 층 세기는 간선 수 기준이라, 0→2 직행(한 걸음)을 「가장 가깝다」고 답해 버린다 — 그건 <b>가장 적은 환승</b>이지 <b>가장 짧은 거리</b>가 아니다. 간선에 숫자가 붙는 순간, 새 도구가 필요하다. 하나 더 — 도로는 <b>일방통행</b>일 수 있으니 방향 그래프로 다룬다."'},
      {check:{id:"c10D-0", stem:'가중치 그래프에서 <b>경로의 길이</b>란?',
        okfb:'거쳐 간 간선들의 가중치를 전부 더한 값 — 간선 개수(BFS의 층)가 아니다.',
        choices:[
          {text:"경로가 거치는 간선 가중치의 합",correct:true},
          {text:"경로 위에 있는 간선의 개수",correct:false,mc:"bfs-confuse",fb:"그건 BFS의 거리(환승 횟수) — 가중치가 붙으면 합으로 잰다."},
          {text:"경로 위에 있는 정점의 개수",correct:false,mc:"vertex-count",fb:"정점 수는 간선 수보다 하나 많을 뿐 — 길이가 아니다."},
          {text:"경로에서 가장 비싼 간선 하나의 값",correct:false,mc:"max-myth",fb:"한 구간이 아니라 전 구간의 합이다."}]}},
      {who:"book", say:'"연습장 둘째 장 — 여섯 도시의 일방통행 도로망이다. <b>v0에서 출발해 모든 도시까지의 최단 경로</b>를 한꺼번에 구한다. 방법은 <b>Dijkstra 알고리즘</b> — 이번에도 greedy다. 시작 전에 v0의 <b>직행 비용</b>부터 읽어 두라: v1로 50, v2로 10, v4로 45. v3와 v5로는 직행이 없다(∞)."',
       viz:{type:"graph", nodes:[{id:0,x:20,y:40},{id:1,x:100,y:40},{id:4,x:184,y:40},{id:2,x:20,y:172},{id:3,x:100,y:172},{id:5,x:184,y:172}],
            edges:[{a:0,b:1,dir:true,lab:50,loff:-10},{a:0,b:2,dir:true,lab:10,curve:1},{a:2,b:0,dir:true,lab:20,curve:1},{a:0,b:4,dir:true,lab:45,curve:-1},{a:1,b:2,dir:true,lab:15,lpos:0.3},{a:1,b:4,dir:true,lab:10,loff:-10},{a:2,b:3,dir:true,lab:15},{a:3,b:1,dir:true,lab:20,lpos:0.4},{a:3,b:4,dir:true,lab:35,lpos:0.35},{a:4,b:2,dir:true,lab:30,lpos:0.3},{a:5,b:3,dir:true,lab:3}]}},
      {who:"book", say:'"Dijkstra의 심장은 하나의 관찰이다. 직행 중 가장 싼 <b>v2(10)</b>를 보라 — 혹시 더 싼 우회로가 있을까? <b>없다.</b> v2로 가는 다른 어떤 길도 v0을 나서는 <b>첫 걸음부터</b> 이미 50 아니면 45 — 출발하자마자 10을 넘는다. 우회로가 더 쌀 가능성이 원천 봉쇄된 것이다(가중치가 음수가 아니니까). 그러므로 10은 그냥 후보가 아니라 <b>최단 거리로 확정</b>해도 된다. 이것을 일반화한 것이 Dijkstra다: <b>미확정 정점 중 지금 distance가 가장 작은 정점은 더 짧아질 방법이 없다 — 확정하라.</b> 한 번 확정한 것은 번복하지 않는다 — greedy."'},
      {check:{id:"c10D-1", stem:'위 예제에서 Dijkstra가 출발점 다음으로 <b>가장 먼저 확정하는</b> 정점과 그 근거는?',
        okfb:'직행 최소 10의 v2 — 다른 어떤 우회로도 첫 걸음(50 또는 45)부터 이미 10을 넘는다.',
        choices:[
          {text:"v2 — 어떤 우회로도 첫 걸음부터 10을 넘는다",correct:true},
          {text:"v1 — 정점 번호가 가장 작은 순서대로 확정한다",correct:false,mc:"index-order",fb:"번호 순이 아니라 distance가 작은 순이다."},
          {text:"v4 — 45가 50보다 작아 먼저 잡는다",correct:false,mc:"trace-slip",fb:"45보다 작은 10이 있다 — 미확정 전체에서 최소를 본다."},
          {text:"v5 — ∞라서 갱신할 일이 없어 먼저 끝낸다",correct:false,mc:"inf-myth",fb:"∞는 「아직 길이 없음」 — 확정은커녕 가장 나중까지 남는다."}]}},
      {who:"book", say:'"확정은 끝이 아니라 <b>시작</b>이다 — v2가 확정되는 순간, <b>v2를 거쳐 가는 길</b>들이 새로 계산 가능해진다. v3는 직행이 없어 ∞였지만, 이제 v0→v2→v3 = 10+15 = <b>25</b>라는 길이 생겼다. 항공권과 같다: 직항이 없는 도시도 경유 표는 있다 — 그리고 직항이 있어도 <b>경유가 더 싸면 갈아탄다</b>. 이 비교가 코드 한 줄이다: <span class="mono">distance[w] = min(distance[w], distance[u]+cost[u][w])</span> — 「지금까지 알던 최선」과 「u를 경유하는 새 길」 중 싼 쪽을 남긴다. 이 한 줄을 <b>갱신</b>이라 부른다."'},
      {who:"book", say:'"이제 도구를 정리하자. <b>S</b> — 최단 경로가 <b>확정된</b> 정점들의 집합(처음엔 출발점뿐). <b>distance[w]</b> — S에 속한 정점만 거쳐 w까지 가는, 현재까지의 최단 거리. 초기값은 v0의 직행 비용(자기 자신은 0, 직행이 없으면 ∞)이다. 그리고 두 걸음을 반복한다 — ① 미확정 중 distance <b>최소</b>인 정점 u를 골라 확정(S에 넣는다) ② u를 경유하는 길로 <b>갱신</b>. 미확정이 없어질 때까지."'},
      {steps:{code:["초기 — S={0}, distance = [0, 50, 10, ∞, 45, ∞]","v2 확정(10) → v3: ∞ → 10+15=25","v3 확정(25) → v1: 50 → 25+20=45","v1 확정(45) — 갱신 없음(45+10=55 > 45)","v4 확정(45) — v5는 ∞인 채 끝"],
        frames:[
          {hl:0, viz:{type:"graph", nodes:[{id:0,x:20,y:40,hl:true},{id:1,x:100,y:40},{id:4,x:184,y:40},{id:2,x:20,y:172},{id:3,x:100,y:172},{id:5,x:184,y:172}], edges:[{a:0,b:1,dir:true,lab:50,loff:-10},{a:0,b:2,dir:true,lab:10,curve:1},{a:2,b:0,dir:true,lab:20,curve:1},{a:0,b:4,dir:true,lab:45,curve:-1},{a:1,b:2,dir:true,lab:15,lpos:0.3},{a:1,b:4,dir:true,lab:10,loff:-10},{a:2,b:3,dir:true,lab:15},{a:3,b:1,dir:true,lab:20,lpos:0.4},{a:3,b:4,dir:true,lab:35,lpos:0.35},{a:4,b:2,dir:true,lab:30,lpos:0.3},{a:5,b:3,dir:true,lab:3}]}, cap:'출발 — distance는 v0의 직행 비용 그대로: [0, <b>50</b>, <b>10</b>, ∞, <b>45</b>, ∞]. S={0}.'},
          {hl:1, viz:{type:"graph", nodes:[{id:0,x:20,y:40,dim:true},{id:1,x:100,y:40},{id:4,x:184,y:40},{id:2,x:20,y:172,hl:true},{id:3,x:100,y:172},{id:5,x:184,y:172}], edges:[{a:0,b:1,dir:true,lab:50,loff:-10},{a:0,b:2,dir:true,lab:10,curve:1,hl:true},{a:2,b:0,dir:true,lab:20,curve:1},{a:0,b:4,dir:true,lab:45,curve:-1},{a:1,b:2,dir:true,lab:15,lpos:0.3},{a:1,b:4,dir:true,lab:10,loff:-10},{a:2,b:3,dir:true,lab:15,hl:true},{a:3,b:1,dir:true,lab:20,lpos:0.4},{a:3,b:4,dir:true,lab:35,lpos:0.35},{a:4,b:2,dir:true,lab:30,lpos:0.3},{a:5,b:3,dir:true,lab:3}]}, cap:'미확정 최소 10의 <b>v2 확정</b>. v2를 거치는 새 길: v3가 ∞ → 10+15=<b>25</b> (v0으로 돌아가는 20은 소용없다 — 이미 확정). distance [0, 50, 10, 25, 45, ∞].'},
          {hl:2, viz:{type:"graph", nodes:[{id:0,x:20,y:40,dim:true},{id:1,x:100,y:40},{id:4,x:184,y:40},{id:2,x:20,y:172,dim:true},{id:3,x:100,y:172,hl:true},{id:5,x:184,y:172}], edges:[{a:0,b:1,dir:true,lab:50,loff:-10},{a:0,b:2,dir:true,lab:10,curve:1,hl:true},{a:2,b:0,dir:true,lab:20,curve:1},{a:0,b:4,dir:true,lab:45,curve:-1},{a:1,b:2,dir:true,lab:15,lpos:0.3},{a:1,b:4,dir:true,lab:10,loff:-10},{a:2,b:3,dir:true,lab:15,hl:true},{a:3,b:1,dir:true,lab:20,lpos:0.4,hl:true},{a:3,b:4,dir:true,lab:35,lpos:0.35},{a:4,b:2,dir:true,lab:30,lpos:0.3},{a:5,b:3,dir:true,lab:3}]}, cap:'다음 최소 25의 <b>v3 확정</b>. v3 경유로 v1이 50 → 25+20=<b>45</b>로 짧아진다(갈아탄다!). v4는 25+35=60 > 45 — 기존 길을 지킨다. [0, 45, 10, 25, 45, ∞].'},
          {hl:3, viz:{type:"graph", nodes:[{id:0,x:20,y:40,dim:true},{id:1,x:100,y:40,hl:true},{id:4,x:184,y:40},{id:2,x:20,y:172,dim:true},{id:3,x:100,y:172,dim:true},{id:5,x:184,y:172}], edges:[{a:0,b:1,dir:true,lab:50,loff:-10},{a:0,b:2,dir:true,lab:10,curve:1,hl:true},{a:2,b:0,dir:true,lab:20,curve:1},{a:0,b:4,dir:true,lab:45,curve:-1},{a:1,b:2,dir:true,lab:15,lpos:0.3},{a:1,b:4,dir:true,lab:10,loff:-10},{a:2,b:3,dir:true,lab:15,hl:true},{a:3,b:1,dir:true,lab:20,lpos:0.4,hl:true},{a:3,b:4,dir:true,lab:35,lpos:0.35},{a:4,b:2,dir:true,lab:30,lpos:0.3},{a:5,b:3,dir:true,lab:3}]}, cap:'45가 둘(v1, v4) — choose 코드의 < 비교는 <b>번호 작은 v1</b>을 먼저 잡는다. v1 경유로 v4는 45+10=55 > 45 — 갱신 없음.'},
          {hl:4, viz:{type:"graph", nodes:[{id:0,x:20,y:40,dim:true},{id:1,x:100,y:40,dim:true},{id:4,x:184,y:40,hl:true},{id:2,x:20,y:172,dim:true},{id:3,x:100,y:172,dim:true},{id:5,x:184,y:172}], edges:[{a:0,b:1,dir:true,lab:50,loff:-10},{a:0,b:2,dir:true,lab:10,curve:1,hl:true},{a:2,b:0,dir:true,lab:20,curve:1},{a:0,b:4,dir:true,lab:45,curve:-1,hl:true},{a:1,b:2,dir:true,lab:15,lpos:0.3},{a:1,b:4,dir:true,lab:10,loff:-10},{a:2,b:3,dir:true,lab:15,hl:true},{a:3,b:1,dir:true,lab:20,lpos:0.4,hl:true},{a:3,b:4,dir:true,lab:35,lpos:0.35},{a:4,b:2,dir:true,lab:30,lpos:0.3},{a:5,b:3,dir:true,lab:3}]}, cap:'<b>v4 확정</b>(45 — 직행이 그대로 최단이었다). 남은 v5는 ∞ — v5로 <b>들어가는</b> 간선이 없으니 어떤 갱신도 일어나지 않는다. 최종 [0, 45, 10, 25, 45, <b>∞</b>].'}
        ]}},
      {check:{id:"c10D-2", stem:'v3가 확정된 직후 <span class="mono">distance[1]</span>의 값은?',
        okfb:'직행 50보다 v3 경유 25+20=45가 짧다 — min이 45를 남긴다(갈아탄다).',
        choices:[
          {text:"45",correct:true},
          {text:"50",correct:false,mc:"direct-only",fb:"v3를 거치는 새 길 25+20과 비교(min)하는 것을 잊었다."},
          {text:"25",correct:false,mc:"half-path",fb:"그건 v3까지 — v3→v1 구간 20을 마저 더한다."},
          {text:"65",correct:false,mc:"op-slip",fb:"50+15가 아니라 min(50, 25+20)이다."}]}},
      {who:"book", say:'"시험장에서는 이 과정을 <b>표</b>로 적으면 실수가 없다 — 행은 단계, 열은 정점. 매 단계 ① 미확정 중 최솟값에 동그라미(확정) ② 그 정점을 경유하는 열만 갱신값을 다시 적는다. 방금의 실행을 표로 옮기면:"',
       code:["단계        v1   v2   v3   v4   v5","초기        50  (10)   ∞   45    ∞","v2 확정     50   —    25   45    ∞","v3 확정    (45)  —    —    45    ∞   ← v1 갈아탐","v1 확정     —    —    —   (45)   ∞","v4 확정     —    —    —    —     ∞   ← v5 도달 불가"]},
      {who:"book", say:'"코드는 두 조각이다. <b>choose</b> — 미확정(!found) 중 distance 최소 정점을 고른다. <b>shortestpath</b> — 초기화(distance[i]=cost[v][i], 자신은 0) 후 반복: choose로 u를 골라 found[u]=TRUE, 그리고 갱신 한 줄. 비용 행렬에서 <b>길 없는 자리는 1000</b> 같은 큰 수로 둔다 — 어떤 실제 비용보다 커야 하되, <span class="mono">distance[u]+cost[u][w]</span>의 덧셈이 <b>overflow하지 않을 만큼</b>이어야 한다."',
       code:["int choose(int distance[], int n, short int found[]) {","    int i, min, minpos;","    min = INT_MAX;  minpos = -1;","    for (i = 0; i < n; i++)","        if (distance[i] < min && !found[i]) { min = distance[i];  minpos = i; }","    return minpos;","}"]},
      {check:{id:"c10D-3", stem:'비용 인접 행렬에서 <b>1000</b> 같은 큰 수가 맡는 역할은?',
        okfb:'간선이 없다는 표시(무한대) — 다만 덧셈이 overflow하지 않을 크기로 잡는다.',
        choices:[
          {text:"간선이 없음(무한대)의 표시",correct:true},
          {text:"가장 비싼 간선의 실제 비용",correct:false,mc:"real-myth",fb:"실제 비용이 아니라 '길이 없음'의 기호다."},
          {text:"정점 수를 제곱해 얻는 값",correct:false,mc:"formula-myth",fb:"특별한 공식은 없다 — 충분히 크되 overflow만 피하면 된다."},
          {text:"확정된 정점을 표시하는 값",correct:false,mc:"visited-confuse",fb:"확정 표시는 found 배열의 몫이다."}]}}
    ]}
  },

  hints: {
    A:["【MST】 신장 트리(간선 n−1개·사이클 없음) 중 간선 가중치의 합이 최소인 것.",
       "【greedy】 단계마다 그 시점의 최선 — 한 번 내린 결정은 번복하지 않는다.",
       "【제한 3조건】 그래프 내 간선만 · 정확히 n−1개 · 사이클 금지."],
    B:["【Kruskal】 간선을 가중치 오름차순 정렬 → 싼 것부터 채택, 사이클이면 거부 → n−1개면 끝.",
       "【팀 판정】 두 끝점이 다른 팀이면 채택+합병, 같은 팀이면 거부(사이클). 이 표시가 union-find.",
       "【총비용】 채택된 간선만 더한다 — 거부된 간선은 없는 셈."],
    C:["【Prim】 정점 하나로 시작 — 트리에 한 끝만 닿은 간선 중 최저 비용을 채택하며 한 정점씩 확장.",
       "【대비】 Kruskal은 간선 중심(숲이 합쳐짐), Prim은 정점 중심(트리 하나가 자람).",
       "【결과】 가중치가 전부 다르면 어느 방법이든 같은 트리 — 총비용 동일."],
    D:["【경로 길이】 거친 간선 가중치의 합(간선 개수 아님). 【확정 원리】 미확정 중 distance 최소 정점은 더 짧아질 수 없다 — 우회는 첫 걸음부터 이미 더 비싸다.",
       "【절차】 ① 미확정 중 distance 최소 u 확정 ② distance[w] = min(distance[w], distance[u]+cost[u][w])로 갱신(경유가 싸면 갈아탄다) — 반복. 동률은 번호 작은 쪽.",
       "【초기】 distance[i] = cost[v0][i](직행 비용, 없으면 ∞) — 자신은 0. 【∞=1000】 길 없음의 표시 — 실제 비용보다 크게, 덧셈 overflow는 안 나게."]
  },

  /* ================= 과외 (수요일 — 시점 규칙: MST·Kruskal까지만) ================= */
  tutorQs: [
    {id:"Q1", ask:'쌤, 최소 비용이라면서요… 그럼 그냥 <b>제일 싼 간선부터 n−1개</b> 고르면 끝 아니에요? 월요일에 문자로 여쭤 봤던 거요 — 뭐 하러 알고리즘씩이나 붙는지 아직 모르겠어요.',
     choices:[
      {text:'"방향은 정확해 — 싼 것부터 고르는 게 실제로 Kruskal의 출발점이야. 함정이 딱 하나 있어서 그래: 싼 것들끼리 <b>사이클</b>을 만들면 트리가 안 되거든. 그래서 사이클을 만드는 간선을 건너뛰는 「거부」 단계가 붙는 거야."', correct:true, fb:'아… 싼 것만 모으면 뱅글 도는 길이 생길 수 있구나. 제 생각에 거부 하나만 더하면 되는 거였네요!'},
      {text:'"싼 간선부터 고르는 건 사람의 어림짐작일 뿐이야. 정확한 최소는 만들 수 있는 신장 트리를 <b>전부 나열</b>해 비용을 일일이 비교해야 나오거든. 그 방대한 나열을 빠짐없이 해 내는 순서를 정해 주는 게 알고리즘의 역할이지."', correct:false, mc:"brute-myth", fb:'전부 나열이요…? 교수님은 「단계마다 최선을 고르면 된다」고 했던 것 같은데요. 그게 안 되면 왜 greedy라고 불러요?'},
      {text:'"싼 간선은 대개 그래프의 한쪽 구석에 몰려 있어서, 그것만 먼저 고르면 트리가 한쪽으로 쏠리게 돼. 그래서 비싼 간선과 싼 간선을 적절히 번갈아 고르면서 전체의 균형을 맞추는 규칙이 따로 필요한 거야."', correct:false, mc:"balance-myth", fb:'번갈아요…? 비싼 걸 일부러 고르면 최소 비용에서 멀어질 것 같은데요. 뭔가 이상해요.'}]},
    {id:"Q2", ask:'사이클이 생기는지는 어떻게 알아요? 간선 하나 넣을 때마다 그림을 그려서 눈으로 확인하는 건 아닐 거 아니에요 — 컴퓨터는 그림을 못 보잖아요.',
     choices:[
      {text:'"그림 없이 돼 — 정점마다 <b>소속 팀</b>을 적어 두면 끝이야. 간선의 두 끝이 다른 팀이면 채택하고 두 팀을 합치고, 같은 팀이면 이미 이어져 있다는 뜻이니 거부. 이 팀 표시를 배열로 구현한 도구를 union-find라고 불러."', correct:true, fb:'팀이 같으면 사이클… 이름표만 갖고 판정이 되네요? 그림 없이도. 컴퓨터답다.'},
      {text:'"간선을 하나 넣을 때마다 그래프 전체를 처음부터 한 바퀴 탐색해서, 제자리로 돌아오는 길이 생겼는지 눈 대신 코드로 훑는 거야. 지난주에 배웠다는 그 깊이 우선 탐색이 간선마다 한 번씩 통째로 돌아가는 거지."', correct:false, mc:"scan-myth", fb:'간선마다 전체 탐색이요? 간선이 백만 개면 백만 번 다 도는 건데… 그것보다 나은 방법이 있을 것 같아요.'},
      {text:'"넣은 간선의 개수만 세면 돼. 간선 수가 정점 수와 같아지는 바로 그 순간에 사이클이 생기는 거니까, 개수가 거기 닿기 직전에 멈추기만 하면 사이클 검사라는 건 애초에 할 필요가 없어지는 거야."', correct:false, mc:"count-myth", fb:'어… 개수로요? 아까 다섯 개도 안 넣었는데 거부가 나온 그림을 보여 주셨잖아요. 개수만으론 모자란 것 같은데요.'}]},
    {id:"Q3", boss:true, ask:'마지막이요! 거부하면 아깝잖아요. 18을 버렸는데 <b>나중에 그 간선이 꼭 필요해지면</b> 어떡해요? greedy는 한 번 버린 건 못 줍는다면서요 — 후회하면 어쩌죠?',
     choices:[
      {text:'"좋은 걱정인데 — 그럴 일이 없어. 거부되는 순간, 그 간선의 두 끝은 <b>이미 더 싼 간선들로 이어져</b> 있거든. 이미 연결된 두 점을 또 이을 이유는 끝까지 생기지 않아. 그래서 이 문제에서는 greedy가 후회를 안 남기는 거야."', correct:true, fb:'버리는 순간에 이미 연결돼 있으니까… 나중에도 영영 필요 없는 거네요. 후회 없는 거부다!'},
      {text:'"그래서 실전 코드는 거부한 간선을 버리지 않고 따로 보관해 둬. 끝까지 갔는데 트리가 안 만들어져 있으면, 보관함에서 싼 순서대로 도로 꺼내 채워 넣는 복구 단계가 마지막에 한 번 돌게 되어 있거든."', correct:false, mc:"undo-myth", fb:'복구 단계요…? 한 번 내린 결정은 번복하지 않는다는 게 greedy라고 아까 배웠는데, 그럼 greedy가 아니지 않아요?'},
      {text:'"드물지만 진짜로 그 간선이 필요해져서 신장 트리가 끝내 안 만들어질 때가 있어. 그럴 땐 어쩔 수 없이 거부 기준을 조금 느슨하게 바꾼 다음, 알고리즘 전체를 처음부터 다시 실행하는 수밖에 없는 거야."', correct:false, mc:"fail-myth", fb:'연결 그래프면 신장 트리가 반드시 있다고 하지 않으셨어요? 다시 실행이라니… 뭔가 앞뒤가 안 맞는 것 같아요.'}]}
  ],

  /* ================= 문항 풀 ================= */
  pool: [
    {id:"P01", unit:"A", stem:'<b>최소 비용 신장 트리</b>의 정의로 옳은 것은?',
     okfb:'신장 트리(모든 정점, 간선 n−1개, 사이클 없음) 중 간선 가중치의 합이 최소인 것.',
     choices:[
       {text:"신장 트리 중 간선 가중치의 합이 최소인 것",correct:true},
       {text:"간선 수가 가장 적은 신장 트리",correct:false,mc:"count-myth",fb:"간선 수는 어느 신장 트리든 n−1개로 같다."},
       {text:"가장 싼 간선 하나만으로 이루어진 트리",correct:false,mc:"single-myth",fb:"모든 정점을 포함해야 신장 트리다."},
       {text:"사이클을 가장 적게 갖는 부분 그래프",correct:false,mc:"cycle-myth",fb:"트리는 사이클이 0개다 — '적게'가 아니다."}]},
    {id:"P02", unit:"A", stem:'신장 트리를 만들 때의 <b>제한 조건이 아닌</b> 것은?',
     okfb:'제한은 셋 — 그래프 내 간선만, 정확히 n−1개, 사이클 금지. 가중치가 같으면 안 된다는 조건은 없다.',
     choices:[
       {text:"가중치가 같은 간선은 함께 쓸 수 없다",correct:true},
       {text:"그래프 안에 있는 간선만 사용한다",correct:false,mc:"rule-confuse",fb:"이것은 제한 조건 ①이다."},
       {text:"정확히 n−1개의 간선만 사용한다",correct:false,mc:"rule-confuse2",fb:"이것은 제한 조건 ②다."},
       {text:"사이클을 생성하는 간선을 쓰면 안 된다",correct:false,mc:"rule-confuse3",fb:"이것은 제한 조건 ③이다."}]},
    {id:"P03", unit:"A", stem:'Kruskal·Prim이 속한 <b>greedy method</b>에 대한 설명으로 옳은 것은?',
     okfb:'단계마다 판단 기준에 따라 그 시점의 최선을 고르고, 결정은 번복하지 않는다.',
     choices:[
       {text:"단계별 최선을 고르며 결정을 번복하지 않는다",correct:true},
       {text:"가능한 모든 트리를 만들어 비용을 비교한다",correct:false,mc:"brute-myth",fb:"전수 비교가 아니라 단계별 선택이다."},
       {text:"잘못된 선택은 되돌아가 고친다",correct:false,mc:"backtrack-myth",fb:"번복 불가가 greedy의 정의적 특징이다."},
       {text:"선택 기준이 없어 아무 간선이나 고른다",correct:false,mc:"random-myth",fb:"'몇 개의 판단 기준에 따라 최상의 결정'을 고른다."}]},
    {id:"P04", unit:"B", stem:'교재 연습장 그래프에 Kruskal을 적용할 때 <b>네 번째로 채택되는</b> 간선은?', mono:true,
     viz:{type:"graph", nodes:[{id:0,x:90,y:20},{id:1,x:160,y:70},{id:2,x:160,y:170},{id:3,x:90,y:225},{id:4,x:20,y:170},{id:5,x:20,y:70},{id:6,x:90,y:120}],
          edges:[{a:0,b:1,lab:28},{a:0,b:5,lab:10},{a:1,b:2,lab:16},{a:1,b:6,lab:14},{a:2,b:3,lab:12},{a:3,b:4,lab:22},{a:3,b:6,lab:18},{a:4,b:5,lab:25},{a:4,b:6,lab:24}]},
     okfb:'채택 순서 10 → 12 → 14 → 16 — 네 번째는 16 (1,2)다.',
     choices:[
       {text:"16 (1,2)",correct:true},
       {text:"18 (3,6)",correct:false,mc:"rej-blind",fb:"18은 채택이 아니라 거부된다 — 3과 6이 이미 같은 팀이다."},
       {text:"14 (1,6)",correct:false,mc:"off-by-one",fb:"14는 세 번째 채택이다."},
       {text:"22 (3,4)",correct:false,mc:"off-by-one2",fb:"22는 (18을 거부한 뒤의) 다섯 번째 채택이다."}]},
    {id:"P05", unit:"B", stem:'Kruskal 알고리즘이 실행 전에 <b>정렬해 두는</b> 것은?',
     okfb:'간선들을 가중치 오름차순으로 — 싼 것부터 검토하기 위해서다.',
     choices:[
       {text:"간선을 가중치 순으로",correct:true},
       {text:"정점을 번호 순으로",correct:false,mc:"vertex-myth",fb:"정점 순서는 알고리즘과 무관하다."},
       {text:"정점을 차수 순으로",correct:false,mc:"degree-myth",fb:"차수는 판정에 쓰이지 않는다."},
       {text:"간선을 이름(정점 쌍) 순으로",correct:false,mc:"name-myth",fb:"기준은 이름이 아니라 가중치다."}]},
    {id:"P06", unit:"B", book:null, stem:'Kruskal 의사코드의 빈칸에 들어갈 말은?', mono:true,
     code:["E에서 최저 비용 간선 (v,w) 선택;","E에서 (v,w)를 삭제;","if ((v,w)가 T에서 ______를 형성하지 않음)","    (v,w)를 T에 추가;","else","    (v,w)를 거부;"],
     okfb:'채택의 유일한 관문 — 사이클을 만들지 않는 간선만 T에 들어간다.',
     choices:[
       {text:"사이클",correct:true},
       {text:"신장 트리",correct:false,mc:"goal-confuse",fb:"신장 트리는 만들려는 목표 — 막으려는 것은 사이클이다."},
       {text:"연결 요소",correct:false,mc:"comp-confuse",fb:"요소는 비연결 그래프를 세는 개념이다."},
       {text:"최단 경로",correct:false,mc:"dijkstra-confuse",fb:"최단 경로는 Dijkstra의 문제다."}]},
    {id:"P07", unit:"B", stem:'교재 연습장 그래프의 Kruskal 실행에서 <b>두 번째로 거부되는</b> 간선은?', mono:true,
     viz:{type:"graph", nodes:[{id:0,x:90,y:20},{id:1,x:160,y:70},{id:2,x:160,y:170},{id:3,x:90,y:225},{id:4,x:20,y:170},{id:5,x:20,y:70},{id:6,x:90,y:120}],
          edges:[{a:0,b:1,lab:28},{a:0,b:5,lab:10},{a:1,b:2,lab:16},{a:1,b:6,lab:14},{a:2,b:3,lab:12},{a:3,b:4,lab:22},{a:3,b:6,lab:18},{a:4,b:5,lab:25},{a:4,b:6,lab:24}]},
     okfb:'18 (3,6)이 첫 거부, 22 채택 뒤 24 (4,6)이 두 번째 거부다 — 4와 6이 이미 같은 팀.',
     choices:[
       {text:"24 (4,6)",correct:true},
       {text:"18 (3,6)",correct:false,mc:"off-by-one",fb:"18은 첫 번째 거부다."},
       {text:"25 (4,5)",correct:false,mc:"acc-confuse",fb:"25는 채택된다 — 그 간선이 두 팀을 하나로 만든다."},
       {text:"28 (0,1)",correct:false,mc:"unseen",fb:"28은 검토되기 전에 트리가 완성된다."}]},
    {id:"P08", unit:"C", stem:'교재 연습장 그래프에서 <b>Prim(정점 0 시작)</b>이 <b>네 번째로 채택하는</b> 간선은?', mono:true,
     viz:{type:"graph", nodes:[{id:0,x:90,y:20},{id:1,x:160,y:70},{id:2,x:160,y:170},{id:3,x:90,y:225},{id:4,x:20,y:170},{id:5,x:20,y:70},{id:6,x:90,y:120}],
          edges:[{a:0,b:1,lab:28},{a:0,b:5,lab:10},{a:1,b:2,lab:16},{a:1,b:6,lab:14},{a:2,b:3,lab:12},{a:3,b:4,lab:22},{a:3,b:6,lab:18},{a:4,b:5,lab:25},{a:4,b:6,lab:24}]},
     okfb:'10 → 25 → 22 → 12 — 3이 합류한 뒤에야 12가 트리에 닿는다.',
     choices:[
       {text:"12 (2,3)",correct:true},
       {text:"16 (1,2)",correct:false,mc:"off-by-one",fb:"16은 다섯 번째 — 2가 합류한 다음이다."},
       {text:"22 (3,4)",correct:false,mc:"off-by-one2",fb:"22는 세 번째 채택이다."},
       {text:"14 (1,6)",correct:false,mc:"order-slip",fb:"14는 마지막(여섯 번째) 채택이다."}]},
    {id:"P09", unit:"C", stem:'Prim 알고리즘 실행 중 <b>채택된 간선들의 집합</b>이 항상 유지하는 성질은?',
     okfb:'Prim은 시작 정점에서 자란 하나의 트리를 유지한다 — 숲이 여럿 생기는 Kruskal과의 차이다.',
     choices:[
       {text:"언제나 하나의 트리를 이룬다",correct:true},
       {text:"여러 개의 트리(숲)로 나뉘어 있다",correct:false,mc:"kruskal-confuse",fb:"숲이 생기는 것은 Kruskal — Prim은 한 덩어리로 자란다."},
       {text:"사이클을 하나 포함한다",correct:false,mc:"cycle-myth",fb:"트리를 키우는 중이다 — 사이클은 끝까지 없다."},
       {text:"항상 가중치 오름차순으로 채택된다",correct:false,mc:"sort-myth",fb:"연습장에서 10 다음 25를 채택했다 — 전역 정렬 순서가 아니다."}]},
    {id:"P10", unit:"C", stem:'간선 가중치가 <b>전부 다른</b> 그래프에서 Prim의 시작 정점을 0에서 3으로 바꾸면?',
     okfb:'최소 비용 신장 트리가 유일하므로 — 채택 순서는 달라져도 결과 트리와 총비용은 같다.',
     choices:[
       {text:"채택 순서는 달라도 결과 트리는 같다",correct:true},
       {text:"총비용이 더 싼 트리를 찾을 수도 있다",correct:false,mc:"better-myth",fb:"이미 최소다 — 더 싼 트리는 존재하지 않는다."},
       {text:"시작 정점을 포함하지 않는 트리가 나온다",correct:false,mc:"span-myth",fb:"신장 트리는 모든 정점을 포함한다."},
       {text:"사이클이 생겨 실패할 수 있다",correct:false,mc:"fail-myth",fb:"Prim은 어느 시작점에서든 트리만 만든다."}]},
    {id:"P11", unit:"D", stem:'교재 도로망에서 Dijkstra(출발 v0)가 끝난 뒤 <span class="mono">distance[3]</span>의 값은?', mono:true,
     viz:{type:"graph", nodes:[{id:0,x:20,y:40},{id:1,x:100,y:40},{id:4,x:184,y:40},{id:2,x:20,y:172},{id:3,x:100,y:172},{id:5,x:184,y:172}],
          edges:[{a:0,b:1,dir:true,lab:50,loff:-10},{a:0,b:2,dir:true,lab:10,curve:1},{a:2,b:0,dir:true,lab:20,curve:1},{a:0,b:4,dir:true,lab:45,curve:-1},{a:1,b:2,dir:true,lab:15,lpos:0.3},{a:1,b:4,dir:true,lab:10,loff:-10},{a:2,b:3,dir:true,lab:15},{a:3,b:1,dir:true,lab:20,lpos:0.4},{a:3,b:4,dir:true,lab:35,lpos:0.35},{a:4,b:2,dir:true,lab:30,lpos:0.3},{a:5,b:3,dir:true,lab:3}]},
     okfb:'v0 → v2 → v3 = 10 + 15 = 25 — 직행 간선은 없지만 경유 길이 있다.',
     choices:[
       {text:"25",correct:true},
       {text:"∞ (도달 불가)",correct:false,mc:"direct-only",fb:"직행이 없어도 v2를 거치는 길이 있다."},
       {text:"15",correct:false,mc:"half-path",fb:"그건 v2→v3 구간뿐 — v0→v2의 10을 더한다."},
       {text:"45",correct:false,mc:"trace-slip",fb:"45는 v1·v4의 최단 거리다."}]},
    {id:"P12", unit:"D", stem:'같은 도로망에서 <span class="mono">distance[5]</span>의 최종값은?', mono:true,
     okfb:'v5로 들어가는 간선이 하나도 없다 — 어떤 경로로도 도달할 수 없어 ∞(1000)로 남는다.',
     choices:[
       {text:"∞ — v5로 들어가는 간선이 없다",correct:true},
       {text:"3 — v5에 붙은 간선의 가중치",correct:false,mc:"dir-blind",fb:"그 간선은 v5에서 나가는 방향이다 — 들어가는 길이 아니다."},
       {text:"28 — v3까지 25 더하기 3",correct:false,mc:"reverse-path",fb:"5→3 간선을 거꾸로 탈 수는 없다 — 일방통행이다."},
       {text:"0 — 방문하지 않은 정점의 기본값",correct:false,mc:"zero-myth",fb:"기본값은 0이 아니라 ∞(직행 없음)다."}]},
    {id:"P13", unit:"D", stem:'choose 함수를 아래처럼 고치면 생기는 문제는?', mono:true,
     code:["for (i = 0; i < n; i++)","    if (distance[i] < min)   /* !found[i] 검사를 지웠다 */","        { min = distance[i];  minpos = i; }"],
     okfb:'이미 확정된(found) 정점이 다시 뽑힌다 — distance가 가장 작은 것은 대개 이미 확정된 정점이니, 같은 정점만 되풀이 뽑는다.',
     choices:[
       {text:"이미 확정된 정점을 다시 고른다",correct:true},
       {text:"컴파일 오류가 발생한다",correct:false,mc:"compile-myth",fb:"문법은 유효하다 — 논리가 무너질 뿐이다."},
       {text:"가장 비싼 정점을 고르게 된다",correct:false,mc:"reverse-myth",fb:"min 비교는 그대로다 — 문제는 후보의 범위다."},
       {text:"아무 문제 없다 — found는 장식이다",correct:false,mc:"harmless-myth",fb:"미확정 중에서 골라야 알고리즘이 전진한다."}]},
    {id:"P14", unit:"D", stem:'Dijkstra가 정점 u를 확정한 직후 실행하는 <b>갱신</b>으로 옳은 것은?', mono:true,
     okfb:'u를 거치는 새 길이 기존보다 짧으면 갈아 끼운다 — min(distance[w], distance[u]+cost[u][w]).',
     choices:[
       {text:"distance[w] = min(distance[w], distance[u]+cost[u][w])",correct:true},
       {text:"distance[w] = distance[u] + cost[u][w] (무조건 대입)",correct:false,mc:"overwrite",fb:"기존 길이 더 짧을 수 있다 — 비교 없이 덮으면 길이가 늘 수도 있다."},
       {text:"distance[w] = min(distance[w], cost[u][w])",correct:false,mc:"half-path",fb:"u까지 오는 비용 distance[u]가 빠졌다."},
       {text:"distance[u] = min(distance[u], distance[w])",correct:false,mc:"target-confuse",fb:"갱신 대상은 u가 아니라 미확정 이웃 w다."}]},
    {id:"P15", unit:"D", ptype:"parsons",
     stem:'Dijkstra의 <b>choose</b> 함수를 올바른 순서로 조립하라. (선언은 문장보다 앞 — 최소 찾기의 초기화는 반복 전에)',
     lines:["int choose(int distance[], int n, short int found[]) {","    int i, min, minpos;","    min = INT_MAX;  minpos = -1;","    for (i = 0; i < n; i++)","        if (distance[i] < min && !found[i]) { min = distance[i];  minpos = i; }","    return minpos;","}"],
     okfb:'선언 → 초기화(INT_MAX·−1) → for → if 판정·기록 → return. 초기화가 for 뒤로 가면 찾은 결과를 지워 버린다.',
     fb:'min의 초기화가 반복문보다 앞인지, 선언이 첫 문장보다 앞인지, return이 반복 밖 마지막인지 확인하라.'}
  ],

  /* ================= 서사 (아크 v1.6 — 4원칙 준수) ================= */
  interludes: {
    A: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 오늘 수업에서 교수님이 「도시들을 회선으로 전부 잇되 공사비를 제일 싸게」 하는 문제를 냈는데요 — 그냥 제일 싼 회선부터 깔면 되는 거 아니에요? 뭐가 어렵다는 건지 모르겠어요.'},
      {who:"나", face:"me-proud", text:'(답장) 감각이 좋다 — 절반은 정답이야. 싼 것부터 까는 게 진짜 출발인데, 함정이 딱 하나 있다. 오늘 밤 내가 그 함정까지 공부해 둘 테니, 수요일에 보여주마.'}
    ],
    B: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 책상 서랍 정리하다가 옛날 과외 프린트 뭉치가 나왔어요. 전에 오시던 쌤이 매주 주던 숙제들인데… 이제 버려도 되죠? (사진)'},
      {who:"나", face:"me", text:'(답장) 아직 버리지 마라 — 네가 어떤 공부를 해 왔는지 보이는 자료다. 다음에 같이 보자.'},
      {who:"나", face:"me-worried", text:'<span class="inner">…사진 속 문면이 눈에 걸린다. 「다음 물음에 답하라」 — 지난주 그 도발장의, 오래된 인쇄물의 문투. …아니, 생각이 앞서간다. 사진 한 장으로 단정할 일이 아니다. 침착하자 — 지금은 Kruskal이 먼저다.</span>'}
    ],
    C: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 월요일 수업 마지막에 교수님이 「한 도시에서 다른 모든 도시까지 제일 짧은 길」 찾는 얘기를 꺼내다가 시간이 다 돼서 끊겼거든요. 그게 내비게이션이 하는 그거 맞죠?'},
      {who:"나", face:"me-proud", text:'(답장) 맞다 — 그리고 그게 이번 주, 아니 그래프 전체의 마지막 조각이다. 오늘 밤 내가 먼저 그 길을 걸어 볼 테니, 다음 과외에서 표 하나로 정리해 주마.'},
      {who:"발신 번호 없음", face:"📵", text:'(밤 11시 — 문자) 말로 해서는 안 되는 모양이군. — 곧 알게 될 거다. 기다리는 것도 이제 지겨워졌으니.'},
      {who:"나", face:"me-worried", text:'<span class="inner">…같은 시각, 밤 11시. 그런데 문장이 점점 짧아지고, 거칠어진다. 여유를 부리던 처음의 문자들과 다르다 — 어느 쪽이 몰리고 있는지, 문장이 먼저 말해 주고 있다. …내일이 이번 학기 그래프의 마지막 자습이다. 끝까지 간다.</span>'}
    ]
  },

  /* 도발장 6 — 최후의 카드. 단서 ⑤: 주인공이 옛 프린트와 대조해 자력 확정 (승패 무관 등록) */
  aplusSkin: {
    cond:{aplusMin:1}, hud:"도발장", header:"🗡 토요일 오후 — 발신 번호 없는 문자", qHeader:"🗡 도발장",
    offer:[
      {who:"발신 번호 없음", face:"📵", text:'(문자) 문제 셋. 이것까지 풀면 — 내가 졌다고 해 두지. 틀린 풀이는, 그 문답 그대로 어머님께 간다. <b>마지막이다.</b>'},
      {who:"나", face:"me-worried", text:'<span class="inner">문제지를 여는 순간, 숨이 멎었다. <b>…이 문제, 본 적 있다.</b> 화요일에 도윤이 사진으로 보여 준 그 프린트 — 전에 오던 과외 선생이 매주 줬다는 숙제. 토씨 하나 다르지 않다. …떨리는 손을 누르고, 문제를 푼다. 답은 문제 안에서 증명하는 거다.</span>'}
    ],
    acceptLabel:'"받아 주지." (도발장 3문제)',
    declineLabel:'무시한다 (기본 트랙)',
    resultWin:[
      {who:"발신 번호 없음", face:"📵", text:'(문자) ………. (한참 뒤에 도착한 한 줄) — 네가 이겼다고 생각하나.'},
      {who:"나", face:"me-proud", text:'<span class="inner">긴 침묵 — 처음 있는 일이다. 그리고 이제 확신한다. 그자의 「아껴 둔 문제」는 <b>도윤의 옛 과외 숙제 프린트와 같은 문제</b>다. 오래된 인쇄물의 문투, 매주 주던 숙제, 이 집의 사정을 아는 눈. …수첩을 편다. 조각이 하나로 맞춰진다.</span>',
       clue:{id:"clue5", text:"⑤ 그자가 최후에 꺼낸 문제 = 도윤의 옛 과외 숙제 프린트 — 그자는 이 집에서 도윤을 가르쳤던 사람, 전임 과외교사다."}}
    ],
    resultLose:[
      {who:"발신 번호 없음", face:"📵", text:'(문자) {n}/3. …그 풀이, 잘 받아 두지. 쓸 날이 머지않았으니.'},
      {who:"나", face:"me-awkward", text:'<span class="inner">…밀렸다. 분하다 — 하지만 오늘 얻은 것은 점수보다 크다. 그자의 문제는 <b>도윤의 옛 과외 숙제 프린트와 같은 문제</b>였다. 오래된 문투, 매주 주던 숙제, 이 집의 사정을 아는 눈. …수첩을 편다. 지는 와중에도, 조각은 맞춰졌다.</span>',
       clue:{id:"clue5", text:"⑤ 그자가 최후에 꺼낸 문제 = 도윤의 옛 과외 숙제 프린트 — 그자는 이 집에서 도윤을 가르쳤던 사람, 전임 과외교사다."}}
    ]
  }
};
