"use strict";
/* 챕터 9 데이터 — "그래프 탐색" = 11주차 (강의 6장 23~37매 · 제작 규약 v1.4 · 주간 루프 공용 러너 사용)
   DFS 절차(미로 회수) → DFS 코드(재귀) → BFS(큐·"미로를 큐로" 정식 회수) → 응용(연결 요소·신장 트리).
   서사: 문자 4(순수 압박) + 여백 메모 발견(주인공 자력 — 단서 등록 없음, ⑤는 12주차) + 도발장 5(오래된 문투의 문제 — 궁지 심리).
   교재 공용 그래프 T2(원본 예제 6.1 재구성): 정점 0~7, 간선 (0,1)(0,2)(1,3)(1,4)(2,5)(2,6)(3,7)(4,7)(5,7)(6,7)
   — dfs(0) = 0,1,3,7,4,5,2,6 / bfs(0) = 0,1,2,3,4,5,6,7 (인접 리스트 오름차순). */
const CH09 = {
  meta: { id:"ch09", week:11, title:"그래프 탐색", sub:"빠짐없이 도는 두 가지 방법", nextTeaser:"가중치 그래프",
          nextHint:'교수님이 다음 주엔 간선에 <b>숫자(비용)</b>가 붙는대요. 제일 싸게 전부 잇는 법이랑, 제일 짧은 길 찾는 법이라던데… 내비게이션 같은 거예요?' },
  economy: { payPerPoint:1000, aplusBonus:200000 },
  exam: { unitPts:15, tutorPts:10, passLine:54 },   /* 4유닛 × 15 + 과외 30 = 90 만점 */
  apGen: "AP9",

  intro: [
    {who:"도윤", face:"doyun", text:'쌤! 오늘 수업에서 교수님이 그래프를 <b>빠짐없이 도는 법</b>을 시작했는데요 — 칠판에 그래프를 그려 놓고, "이건 사실 <b>미로 찾기</b>와 같은 문제다"라는 거예요.'},
    {who:"도윤", face:"doyun-worried", text:'미로는 게임에서 해 봤지만… 미로랑 그래프가 왜 같은 문제인지는 모르겠어요. 미로는 벽이 있고 그래프는 점이랑 선이잖아요.'},
    {who:"나", face:"me-think", text:'<span class="inner">미로라. …4주차의 그 금요일 밤이 떠오른다. 갈림길을 기억해 두고, 막히면 되돌아가던 — 그때 내 손에 있던 것이 스택이었다. 미로의 칸을 정점으로, 통로를 간선으로 바꿔 보면… 그렇군. 같은 문제다.</span>'},
    {who:"나", face:"me", text:'도윤아, 그 말씀이 이번 주의 전부일 거다. 미로의 칸이 정점, 칸 사이 통로가 간선 — 미로 탐색이 곧 그래프 탐색이야. 이번 주는 그 도는 방법에 <b>정확한 이름과 코드</b>를 붙인다. 월요일 밤, 책부터 펴자.'}
  ],

  flow: ["study-A","trial-A","il-A","study-B","trial-B","il-B","tutor","study-C","trial-C","il-C","study-D","trial-D","saturday","sunday"],
  cpl: {
    "study-A":"11주차 · 월 — DFS 절차 자습","trial-A":"11주차 · 월 — DFS 시련","il-A":"11주차 · 월요일 밤",
    "study-B":"11주차 · 화 — DFS 코드 자습","trial-B":"11주차 · 화 — 코드 시련","il-B":"11주차 · 화요일 밤",
    "tutor":"11주차 · 수 — 과외",
    "study-C":"11주차 · 목 — BFS 자습","trial-C":"11주차 · 목 — BFS 시련","il-C":"11주차 · 목요일 밤",
    "study-D":"11주차 · 금 — 탐색 응용 자습","trial-D":"11주차 · 금 — 응용 시련",
    "saturday":"11주차 · 토 — 보충/A+","sunday":"11주차 · 월 — 쪽지시험"
  },

  trials: {
    A:{gen:"G33", label:"DFS 추적기", doneLabel:"유닛 A 숙달 ▶"},
    B:{gen:"G34", label:"DFS 코드 판독기", doneLabel:"유닛 B 숙달 ▶"},
    C:{gen:"G35", label:"BFS 추적기", doneLabel:"유닛 C 숙달 ▶"},
    D:{gen:"G36", label:"연결·신장 판독기", doneLabel:"유닛 D 숙달 ▶"}
  },
  ilNext: { A:"화요일 — 유닛 B ▶", B:"수요일 — 과외 ▶", C:"금요일 — 유닛 D ▶" },
  tutorNextLabel:"목요일 밤 — 유닛 C ▶",
  tutorPassMsg:'막다른 길에서 정확히 갈림길로 돌아오는 게 스택 덕분이라는 거, 오늘 완전히 잡았어요. 아 맞다 — 월요일 수업에서 <b>너비 우선</b>이라는 것도 했었는데요, 전 이름만 받아 적었어요. 이름부터 깊이 우선이랑 반대 같아요.',

  /* ================= 자습 ================= */
  study: {
    A: { day:"월요일", label:"유닛 A", title:"깊이 우선 탐색(DFS) — 절차", doneLabel:"시련 — DFS 추적기 ▶", beats:[
      {say:'책을 펴기 전에, 4주차의 금요일 밤을 떠올린다 — 미로. 갈림길을 스택에 쌓고, 막히면 꺼내서 되돌아가던 그 밤.', mood:"awkward"},
      {who:"book", say:'"이번 주의 문제 — 그래프의 한 정점 v에서 출발하여, v와 연결된 <b>모든 정점을 빠짐없이 한 번씩</b> 방문하라. 미로에서 이미 풀어 본 문제다: 칸이 정점, 칸 사이의 통로가 간선. 방법도 그때와 같이 두 가지 — 오늘은 첫 번째, <b>깊이 우선 탐색(DFS, depth first search)</b>이다."'},
      {who:"book", say:'"준비물부터. 미로와 달리 그래프에는 <b>빙 돌아 제자리로 오는 길 — 사이클</b>이 있다. 그림처럼 0-1-2가 삼각형으로 이어져 있으면, 아무 표시 없이 걷는 순간 0 → 1 → 2 → 0 → 1 → … <b>같은 자리를 영원히 맴돈다</b>. 그래서 첫 번째 도구가 <b>방문 표시</b>다: 정점마다 visited 칸을 두고, 방문하는 순간 표시를 남긴다 — 미로의 발자국 그대로. 표시된 정점으로는 다시 들어가지 않는다."',
       viz:{type:"graph", nodes:[{id:0,x:50,y:36},{id:1,x:130,y:36},{id:2,x:90,y:110}],
            edges:[{a:0,b:1},{a:1,b:2},{a:0,b:2}]}},
      {check:{id:"c9A-1", stem:'DFS에서 <b>방문 표시(visited)</b>가 반드시 필요한 이유는?',
        okfb:'사이클이 있는 그래프에서는 표시가 없으면 같은 정점 사이를 영원히 맴돈다 — 미로의 발자국과 같다.',
        choices:[
          {text:"같은 정점을 다시 방문해 맴도는 것을 막으려고",correct:true},
          {text:"방문 순서를 화면에 출력하려고",correct:false,mc:"print-confuse",fb:"출력은 printf의 일 — 표시는 '다시 가지 않기 위한' 장치다."},
          {text:"탐색 속도를 두 배로 높이려고",correct:false,mc:"speed-myth",fb:"속도 장치가 아니라 '끝나게 만드는' 장치다."},
          {text:"그래프가 트리일 때만 필요한 요식이라서",correct:false,mc:"tree-myth",fb:"반대다 — 사이클이 있을 수 있는 그래프라서 더욱 필수다."}]}},
      {who:"book", say:'"두 번째 도구는 4주차의 그 <b>스택</b>이다. 깊이 우선의 걸음걸이: 지금 선 정점의 인접 중 <b>방문 안 한 하나</b>를 골라 나아간다 — 한 길을 끝까지 파고든다. 그럼 고르지 <b>않은</b> 길들은? 버리는 게 아니다. 지나온 정점을 스택에 쌓아 두었다가, 인접이 전부 방문된 <b>막다른 곳</b>에 이르면 스택에서 꺼내 직전 갈림길로 되돌아간다 — <b>백트래킹</b>. 되돌아간 곳에 아직 안 가 본 길이 남았으면 거기서 다시 파고든다."'},
      {who:"book", say:'"작게 한 번 걸어 보자. 정점 넷 — 삼각형(0-1-2)에 꼬리(2-3)가 달린 그래프다. 0에서 출발: <b>0</b> 방문·표시 → 인접 1, 2 중 <b>1</b>로(작은 번호부터) → 1의 인접 0, 2 중 0은 발자국이 있으니 <b>2</b>로 → 2의 인접 0, 1, 3 중 남은 건 <b>3</b>뿐 → 3은 인접이 2 하나뿐인 <b>막다른 곳</b> — 스택을 따라 2, 1, 0으로 되돌아가며 남은 길을 찾지만 없다 → 끝. 방문 순서 <b>0, 1, 2, 3</b>. 사이클(0-1-2)이 있어도 발자국 덕에 같은 정점을 두 번 밟지 않았고, 막다른 곳에서는 스택이 길을 되짚어 주었다."',
       viz:{type:"graph", nodes:[{id:0,x:50,y:36},{id:1,x:130,y:36},{id:2,x:90,y:110},{id:3,x:90,y:190}],
            edges:[{a:0,b:1},{a:1,b:2},{a:0,b:2},{a:2,b:3}]}},
      {who:"book", say:'"정리하면 다섯 걸음이 전부다. ① 출발 정점을 방문하고 <b>표시</b> ② 미방문 인접 중 하나로 <b>전진</b>(같은 일 반복 — 한 길을 끝까지) ③ 지나온 길은 <b>스택이 기억</b> ④ 막히면 꺼내서 <b>백트래킹</b> ⑤ 스택이 비면 <b>끝</b>."'},
      {who:"book", say:'"공용 예제로 손에 익히자. 여덟 정점의 연결 그래프 — 그리고 규약 하나: 한 정점의 인접 정점이 여럿이면 <b>작은 번호부터</b> 간다(인접 리스트를 오름차순으로 이었다는 뜻)."',
       viz:{type:"graph", nodes:[{id:0,x:90,y:28},{id:1,x:45,y:95},{id:2,x:135,y:95},{id:3,x:14,y:168},{id:4,x:64,y:168},{id:5,x:116,y:168},{id:6,x:166,y:168},{id:7,x:90,y:240}],
            edges:[{a:0,b:1},{a:0,b:2},{a:1,b:3},{a:1,b:4},{a:2,b:5},{a:2,b:6},{a:3,b:7},{a:4,b:7},{a:5,b:7},{a:6,b:7}]}},
      {steps:{code:["dfs(0) — 0 방문","→ 1 (0의 최소 미방문 인접)","→ 3 (1의 최소 미방문 인접)","→ 7 (3의 인접)","→ 4 (7의 최소 미방문 인접)","4는 막다른 곳 → 7로 백트래킹 → 5","5의 인접 2로","→ 6 — 스택이 비고 종료"],
        frames:[
          {hl:0, viz:{type:"graph", nodes:[{id:0,x:90,y:28,hl:true},{id:1,x:45,y:95},{id:2,x:135,y:95},{id:3,x:14,y:168},{id:4,x:64,y:168},{id:5,x:116,y:168},{id:6,x:166,y:168},{id:7,x:90,y:240}],
            edges:[{a:0,b:1},{a:0,b:2},{a:1,b:3},{a:1,b:4},{a:2,b:5},{a:2,b:6},{a:3,b:7},{a:4,b:7},{a:5,b:7},{a:6,b:7}]}, cap:'0 방문·표시. 인접 1, 2 중 작은 <b>1</b>로 간다. — 방문: 0'},
          {hl:1, viz:{type:"graph", nodes:[{id:0,x:90,y:28,dim:true},{id:1,x:45,y:95,hl:true},{id:2,x:135,y:95},{id:3,x:14,y:168},{id:4,x:64,y:168},{id:5,x:116,y:168},{id:6,x:166,y:168},{id:7,x:90,y:240}],
            edges:[{a:0,b:1,hl:true},{a:0,b:2},{a:1,b:3},{a:1,b:4},{a:2,b:5},{a:2,b:6},{a:3,b:7},{a:4,b:7},{a:5,b:7},{a:6,b:7}]}, cap:'1 방문. 미방문 인접 3, 4 중 <b>3</b>. — 방문: 0, 1 · 갈림길 스택에 0, 1'},
          {hl:2, viz:{type:"graph", nodes:[{id:0,x:90,y:28,dim:true},{id:1,x:45,y:95,dim:true},{id:2,x:135,y:95},{id:3,x:14,y:168,hl:true},{id:4,x:64,y:168},{id:5,x:116,y:168},{id:6,x:166,y:168},{id:7,x:90,y:240}],
            edges:[{a:0,b:1,hl:true},{a:0,b:2},{a:1,b:3,hl:true},{a:1,b:4},{a:2,b:5},{a:2,b:6},{a:3,b:7},{a:4,b:7},{a:5,b:7},{a:6,b:7}]}, cap:'3 방문. 미방문 인접은 7뿐. — 방문: 0, 1, 3'},
          {hl:3, viz:{type:"graph", nodes:[{id:0,x:90,y:28,dim:true},{id:1,x:45,y:95,dim:true},{id:2,x:135,y:95},{id:3,x:14,y:168,dim:true},{id:4,x:64,y:168},{id:5,x:116,y:168},{id:6,x:166,y:168},{id:7,x:90,y:240,hl:true}],
            edges:[{a:0,b:1,hl:true},{a:0,b:2},{a:1,b:3,hl:true},{a:1,b:4},{a:2,b:5},{a:2,b:6},{a:3,b:7,hl:true},{a:4,b:7},{a:5,b:7},{a:6,b:7}]}, cap:'7 방문 — 벌써 맨 아래까지 파고들었다. 미방문 인접 4, 5, 6 중 <b>4</b>. — 방문: 0, 1, 3, 7'},
          {hl:4, viz:{type:"graph", nodes:[{id:0,x:90,y:28,dim:true},{id:1,x:45,y:95,dim:true},{id:2,x:135,y:95},{id:3,x:14,y:168,dim:true},{id:4,x:64,y:168,hl:true},{id:5,x:116,y:168},{id:6,x:166,y:168},{id:7,x:90,y:240,dim:true}],
            edges:[{a:0,b:1,hl:true},{a:0,b:2},{a:1,b:3,hl:true},{a:1,b:4},{a:2,b:5},{a:2,b:6},{a:3,b:7,hl:true},{a:4,b:7,hl:true},{a:5,b:7},{a:6,b:7}]}, cap:'4 방문. 인접 1, 7 모두 방문됨 — <b>막다른 곳</b>이다. — 방문: 0, 1, 3, 7, 4'},
          {hl:5, viz:{type:"graph", nodes:[{id:0,x:90,y:28,dim:true},{id:1,x:45,y:95,dim:true},{id:2,x:135,y:95},{id:3,x:14,y:168,dim:true},{id:4,x:64,y:168,dim:true},{id:5,x:116,y:168,hl:true},{id:6,x:166,y:168},{id:7,x:90,y:240,dim:true}],
            edges:[{a:0,b:1,hl:true},{a:0,b:2},{a:1,b:3,hl:true},{a:1,b:4},{a:2,b:5},{a:2,b:6},{a:3,b:7,hl:true},{a:4,b:7,hl:true},{a:5,b:7,hl:true},{a:6,b:7}]}, cap:'스택에서 7을 꺼내 되돌아간다(백트래킹) → 7의 남은 미방문 인접 <b>5</b> 방문. — 방문: 0, 1, 3, 7, 4, 5'},
          {hl:6, viz:{type:"graph", nodes:[{id:0,x:90,y:28,dim:true},{id:1,x:45,y:95,dim:true},{id:2,x:135,y:95,hl:true},{id:3,x:14,y:168,dim:true},{id:4,x:64,y:168,dim:true},{id:5,x:116,y:168,dim:true},{id:6,x:166,y:168},{id:7,x:90,y:240,dim:true}],
            edges:[{a:0,b:1,hl:true},{a:0,b:2},{a:1,b:3,hl:true},{a:1,b:4},{a:2,b:5,hl:true},{a:2,b:6},{a:3,b:7,hl:true},{a:4,b:7,hl:true},{a:5,b:7,hl:true},{a:6,b:7}]}, cap:'5의 미방문 인접 <b>2</b> 방문. — 방문: 0, 1, 3, 7, 4, 5, 2'},
          {hl:7, viz:{type:"graph", nodes:[{id:0,x:90,y:28,dim:true},{id:1,x:45,y:95,dim:true},{id:2,x:135,y:95,dim:true},{id:3,x:14,y:168,dim:true},{id:4,x:64,y:168,dim:true},{id:5,x:116,y:168,dim:true},{id:6,x:166,y:168,hl:true},{id:7,x:90,y:240,dim:true}],
            edges:[{a:0,b:1,hl:true},{a:0,b:2},{a:1,b:3,hl:true},{a:1,b:4},{a:2,b:5,hl:true},{a:2,b:6,hl:true},{a:3,b:7,hl:true},{a:4,b:7,hl:true},{a:5,b:7,hl:true},{a:6,b:7}]}, cap:'2의 미방문 인접 <b>6</b>까지 — 전 정점 방문 완료. <b>최종 순서: 0, 1, 3, 7, 4, 5, 2, 6</b>'}
        ]}},
      {check:{id:"c9A-2", stem:'위 예제에서 DFS가 정점 <b>4</b>에서 <b>5</b>로 넘어갈 수 있었던 이유는?',
        okfb:'4는 막다른 곳 — 스택에서 7을 꺼내 되돌아갔고, 7의 남은 미방문 인접 5로 이어 갔다.',
        choices:[
          {text:"7로 되돌아간 뒤 남은 미방문 인접으로 갔다",correct:true},
          {text:"4와 5 사이에 간선이 있어 곧바로 건너갈 수 있었다",correct:false,mc:"no-edge",fb:"그림을 보라 — 4와 5는 인접하지 않다. 간선 없이 건너뛸 수는 없다."},
          {text:"번호 순서상 4 다음이 5라서 자동으로 갔다",correct:false,mc:"index-order",fb:"탐색은 번호 순이 아니라 간선을 따라 움직인다."},
          {text:"방문 표시를 지우고 처음부터 다시 돌았다",correct:false,mc:"reset-myth",fb:"발자국은 지우지 않는다 — 되돌아가기는 스택의 몫이다."}]}},
      {check:{id:"c9A-3", stem:'DFS가 <b>종료</b>되는 시점은?',
        okfb:'되돌아갈 갈림길이 남지 않았을 때 — 스택이 비면 끝이다.',
        choices:[
          {text:"갈림길을 기억한 스택이 완전히 비었을 때",correct:true},
          {text:"출발 정점으로 처음 되돌아왔을 때",correct:false,mc:"early-stop",fb:"출발점에 돌아와도 다른 가지가 남아 있으면 계속이다."},
          {text:"가장 큰 번호의 정점을 방문했을 때",correct:false,mc:"index-myth",fb:"번호는 종료와 무관하다."},
          {text:"간선을 절반 이상 지났을 때",correct:false,mc:"edge-myth",fb:"기준은 간선 비율이 아니라 '갈 곳이 남았는가'다."}]}}
    ]},

    B: { day:"화요일", label:"유닛 B", title:"깊이 우선 탐색 — 코드", doneLabel:"시련 — DFS 코드 판독기 ▶", beats:[
      {say:'어제의 절차를 코드로 옮긴다. 그런데 책의 코드에는 스택이 보이지 않는다 — 대신 낯익은 것이 있다. <b>재귀</b>.', mood:"awkward"},
      {who:"book", say:'"dfs를 코드로. 7주차의 순회와 <b>같은 뼈대의 재귀</b>다 — 자신을 방문하고, 이웃마다 같은 일을 반복시킨다."',
       code:["short int visited[MAX_VERTICES];  /* FALSE로 초기화 */","","void dfs(int v) {","    node_pointer w;                /* 인접 리스트를 걷는 포인터 */","    visited[v] = TRUE;             /* ① 방문 표시 — 발자국 */","    printf(\"%5d\", v);              /* ② 방문 출력 */","    for (w = graph[v]; w; w = w->link)   /* ③ v의 인접 리스트를 차례로 */","        if (!visited[w->vertex])         /* ④ 아직 발자국이 없으면 */","            dfs(w->vertex);              /* ⑤ 그 정점에서 다시 깊이 우선 */","}"]},
      {who:"book", say:'"한 줄씩. ① <b>visited[v] = TRUE</b> — 들어서자마자 발자국부터. 이 줄이 for보다 앞이어야 한다: 뒤로 미루면 이웃의 재귀가 아직 표시 없는 v로 <b>되돌아 들어와 끝나지 않는다</b>. ③ for는 v의 인접 리스트를 처음부터 끝까지 — 리스트가 오름차순이므로 \'작은 번호부터\' 규약이 저절로 지켜진다. ⑤ 재귀 호출 — 어제의 스택은 어디 갔나? <b>함수 호출 자체가 시스템 스택에 쌓인다</b>(7주차에서 본 그대로). 되돌아가기(백트래킹)는 재귀가 <b>리턴하는 것</b>이다."'},
      {check:{id:"c9B-1", stem:'이 코드에서 어제의 <b>스택</b>은 어디에 있는가?',
        okfb:'재귀 호출이 쌓이는 시스템 스택이 그 스택이다 — 백트래킹은 함수의 리턴이다.',
        choices:[
          {text:"재귀 호출이 쌓이는 시스템 스택이 대신한다",correct:true},
          {text:"visited 배열이 스택의 역할을 한다",correct:false,mc:"visited-confuse",fb:"visited는 발자국(재방문 방지) — 되돌아갈 길을 기억하는 것은 호출 스택이다."},
          {text:"graph[] 배열이 스택으로 쓰인다",correct:false,mc:"struct-confuse",fb:"graph[]는 인접 리스트의 헤드 배열 — 그래프 저장소다."},
          {text:"이 코드에는 스택에 해당하는 것이 없다",correct:false,mc:"no-stack",fb:"보이지 않을 뿐 있다 — 7주차의 재귀 순회와 같은 원리다."}]}},
      {check:{id:"c9B-2", stem:'<span class="mono">visited[v] = TRUE;</span> 를 for 루프 <b>뒤</b>로 옮기면 생기는 일은?',
        okfb:'이웃의 재귀가 표시 없는 v로 되돌아 들어온다 — 사이클에서 재귀가 끝나지 않는다.',
        choices:[
          {text:"이웃의 재귀가 v로 되돌아와 끝나지 않을 수 있다",correct:true},
          {text:"출력 순서만 거꾸로 될 뿐 동작에는 문제없다",correct:false,mc:"harmless-myth",fb:"순서 문제가 아니라 종료 문제다 — 발자국 없는 방은 다시 들어가게 된다."},
          {text:"컴파일 오류가 발생한다",correct:false,mc:"compile-myth",fb:"문법은 유효하다 — 실행이 위험해질 뿐이다."},
          {text:"아무 차이도 없다",correct:false,mc:"order-blind",fb:"재귀 사이에 표시가 있어야 한다 — 순서가 곧 안전이다."}]}},
      {who:"book", say:'"세기 하나 — 연결 그래프에서 <span class="mono">dfs(0)</span>가 끝날 때까지 dfs는 <b>몇 번 호출</b>되는가. ④의 검사 덕에 각 정점은 <b>정확히 한 번씩만</b> 호출된다 — 정점 수만큼이다. 간선은 for가 양쪽에서 한 번씩 들여다보지만, 호출로 이어지는 것은 첫 방문뿐이다."'},
      {check:{id:"c9B-3", stem:'정점 8개의 연결 그래프에서 <span class="mono">dfs(0)</span> 실행 중 dfs가 호출되는 총 횟수는?',
        okfb:'정점마다 정확히 한 번 — 8회다.',
        choices:[
          {text:"8회",correct:true},
          {text:"10회",correct:false,mc:"edge-confuse",fb:"간선 수를 세지 않았나 — 호출은 정점마다다."},
          {text:"7회",correct:false,mc:"root-miss",fb:"처음 dfs(0) 호출도 센다."},
          {text:"20회",correct:false,mc:"double-count",fb:"간선을 두 번 살피는 것은 for의 일 — visited가 호출을 막는다."}]}}
    ]},

    C: { day:"목요일", label:"유닛 C", title:"너비 우선 탐색(BFS)", doneLabel:"시련 — BFS 추적기 ▶", beats:[
      {say:'두 번째 방법이다. 책의 첫 줄부터 낯익은 이름이 나온다 — <b>큐</b>.', mood:"proud"},
      {who:"book", say:'"<b>너비 우선 탐색(BFS, breadth first search)</b> — 한 길을 파고드는 대신, <b>출발점에서 가까운 정점부터 골고루</b> 넓혀 간다. 도구는 스택이 아니라 <b>큐</b>(3주차)다. 절차: ① 출발 정점을 방문하고 큐에 넣는다. ② 큐에서 정점을 꺼내, 그 인접 중 <b>미방문 정점을 모두</b> — 방문 표시를 하며 — 큐에 넣는다. ③ 큐가 빌 때까지 반복."'},
      {who:"book", say:'"코드. 큐는 5주차의 노드로 만든 <b>동적 연결 큐</b> — 크기 제한이 없다."',
       code:["void bfs(int v) {","    node_pointer w;","    front = rear = NULL;           /* 공백 큐 */","    printf(\"%5d\", v);  visited[v] = TRUE;","    addq(v);                       /* 출발 정점을 큐에 */","    while (front) {                /* 큐가 빌 때까지 */","        v = deleteq();             /* 앞에서 하나 꺼내 */","        for (w = graph[v]; w; w = w->link)","            if (!visited[w->vertex]) {","                printf(\"%5d\", w->vertex);","                addq(w->vertex);   /* 새 이웃을 뒤에 줄 세우고 */","                visited[w->vertex] = TRUE;","            }","    }","}"]},
      {who:"book", say:'"공용 예제를 BFS로. 0을 방문하고 큐에 [0]. 0을 꺼내 이웃 1, 2를 방문·삽입 — 큐 [1, 2]. 1을 꺼내 3, 4를 — 큐 [2, 3, 4]. 2를 꺼내 5, 6을 — 큐 [3, 4, 5, 6]. 3을 꺼내 7을 — 큐 [4, 5, 6, 7]. 이후 꺼내는 정점들의 이웃은 전부 방문된 상태다. <b>최종 순서: 0, 1, 2, 3, 4, 5, 6, 7</b> — 층 순서 그대로다."',
       viz:{type:"graph", nodes:[{id:0,x:90,y:28,hl:true},{id:1,x:45,y:95,hl:true},{id:2,x:135,y:95,hl:true},{id:3,x:14,y:168},{id:4,x:64,y:168},{id:5,x:116,y:168},{id:6,x:166,y:168},{id:7,x:90,y:240}],
            edges:[{a:0,b:1,hl:true},{a:0,b:2,hl:true},{a:1,b:3},{a:1,b:4},{a:2,b:5},{a:2,b:6},{a:3,b:7},{a:4,b:7},{a:5,b:7},{a:6,b:7}]}},
      {check:{id:"c9C-1", stem:'위 예제에서 정점 <b>1</b>을 꺼내 그 이웃까지 넣은 직후의 <b>큐 내용</b>은? (앞 → 뒤)',
        okfb:'[1, 2]에서 1이 빠지고, 1의 미방문 이웃 3, 4가 뒤에 붙는다 — 2, 3, 4.',
        choices:[
          {text:"2, 3, 4",correct:true},
          {text:"1, 2, 3, 4",correct:false,mc:"self-in-queue",fb:"1은 방금 꺼냈다 — 큐에 남아 있지 않다."},
          {text:"3, 4, 2",correct:false,mc:"order-slip",fb:"2가 먼저 들어와 있었다 — 큐는 순서를 지킨다."},
          {text:"2, 4, 3",correct:false,mc:"order-rule",fb:"이웃은 작은 번호부터(3, 4 순서로) 줄을 선다."}]}},
      {who:"book", say:'"이제 미뤄 둔 질문에 답하자 — 4주차의 미로에서 「가 볼 곳」 저장소를 <b>스택 대신 큐</b>로 바꾸면? 스택은 한 길을 끝까지 파고들었다(깊이 우선). 큐는 <b>출발 주변의 가까운 칸부터 골고루</b> 넓혀 간다 — 지금 배운 너비 우선이다. 같은 미로, 같은 코드에서 저장소 하나로 탐색의 성격이 갈린다. 그리고 하나 더 — 트리에서 BFS를 돌리면 7주차의 <b>레벨 순회</b> 그대로다: 레벨 순회가 큐를 썼던 이유가 이것이다."'},
      {check:{id:"c9C-2", stem:'미로 탐색의 저장 구조를 스택에서 <b>큐</b>로 바꾸면?',
        okfb:'가까운 칸부터 골고루 — 너비 우선 탐색이 된다. 저장소가 탐색의 성격을 정한다.',
        choices:[
          {text:"가까운 칸부터 골고루 넓혀 가며 탐색한다",correct:true},
          {text:"한 길을 끝까지 파고들었다가 되돌아온다",correct:false,mc:"dfs-confuse",fb:"그것은 스택(깊이 우선) 쪽 움직임이다."},
          {text:"탐색 순서는 전혀 달라지지 않는다",correct:false,mc:"same-myth",fb:"꺼내는 순서가 다르면 걷는 순서도 다르다."},
          {text:"미로를 더 이상 빠져나갈 수 없다",correct:false,mc:"fail-myth",fb:"출구는 찾는다 — 오히려 가까운 출구를 먼저 만난다."}]}},
      {check:{id:"c9C-3", stem:'트리에서 BFS를 실행하면 7주차의 어떤 순회와 같은가?',
        okfb:'레벨 순회 — 큐로 층을 넓히는 원리가 동일하다.',
        choices:[
          {text:"레벨 순회",correct:true},
          {text:"전위 순회",correct:false,mc:"pre-confuse",fb:"전위는 재귀(스택)로 파고든다 — 오히려 DFS 쪽 친척이다."},
          {text:"중위 순회",correct:false,mc:"in-confuse",fb:"중위도 재귀 — 층 순서가 아니다."},
          {text:"후위 순회",correct:false,mc:"post-confuse",fb:"후위는 자식을 모두 마친 뒤 자신 — BFS와는 순서가 전혀 다르다."}]}}
    ]},

    D: { day:"금요일", label:"유닛 D", title:"탐색의 응용 — 연결 요소와 신장 트리", doneLabel:"시련 — 연결·신장 판독기 ▶", beats:[
      {say:'탐색은 도는 것 자체가 목적이 아니다 — 돌아 보면 그래프에 대해 <b>알게 되는 것들</b>이 있다.', mood:"proud"},
      {who:"book", say:'"첫째 — <b>연결 여부의 판정</b>. dfs(0) 또는 bfs(0)를 한 번 돌리고, <b>방문 안 된 정점이 남았는지</b> 보면 끝이다. 남았다면 그 그래프는 연결이 아니다. 둘째 — <b>연결 요소 나열</b>: 방문 안 된 정점이 남아 있는 동안, 그 정점에서 dfs를 다시 시작하기를 반복하면 한 번의 dfs가 요소 하나씩을 쓸어 담는다."',
       code:["void connected(void) {","    int i;","    for (i = 0; i < n; i++)","        if (!visited[i]) {     /* 아직 어느 탐색도 닿지 않은 정점 */","            dfs(i);            /* 여기서 시작 — 요소 하나를 전부 방문 */","            printf(\"\\n\");      /* 요소 하나 끝 — 줄 바꿈 */","        }","}"]},
      {check:{id:"c9D-1", stem:'그래프가 <b>연결인지</b> 확인하는 가장 간단한 방법은?',
        okfb:'dfs(0) 한 번 — 그러고도 방문 안 된 정점이 있으면 연결이 아니다.',
        choices:[
          {text:"dfs(0)를 돌리고 미방문 정점이 남았는지 본다",correct:true},
          {text:"모든 정점 쌍의 간선 존재를 하나씩 확인한다",correct:false,mc:"complete-confuse",fb:"그것은 '완전 그래프'인지의 확인 — 연결은 경로만 있으면 된다."},
          {text:"간선 수가 정점 수보다 많은지 본다",correct:false,mc:"count-myth",fb:"간선이 많아도 한 덩어리가 아닐 수 있다 — 개수로는 판정되지 않는다."},
          {text:"인접 행렬이 대칭인지 확인한다",correct:false,mc:"sym-confuse",fb:"대칭은 무방향의 성질일 뿐 — 연결과 무관하다."}]}},
      {who:"book", say:'"셋째 — <b>신장 트리(spanning tree)</b>. 연결 그래프를 탐색하면 모든 정점을 방문한다. 이때 <b>실제로 지나간 간선들만</b> 남겨 보라 — 모든 정점을 포함하면서 사이클이 없는 트리, 즉 신장 트리가 된다(dfs가 만들면 깊이 우선 신장 트리, bfs가 만들면 너비 우선 신장 트리). 간선 수는 6주차에서 본 그대로 <b>정점 수 − 1</b>."',
       viz:{type:"graph", nodes:[{id:0,x:90,y:28},{id:1,x:45,y:95},{id:2,x:135,y:95},{id:3,x:14,y:168},{id:4,x:64,y:168},{id:5,x:116,y:168},{id:6,x:166,y:168},{id:7,x:90,y:240}],
            edges:[{a:0,b:1,hl:true},{a:0,b:2,hl:true},{a:1,b:3,hl:true},{a:1,b:4,hl:true},{a:2,b:5,hl:true},{a:2,b:6,hl:true},{a:3,b:7,hl:true},{a:4,b:7,cut:true},{a:5,b:7,cut:true},{a:6,b:7,cut:true}]}},
      {who:"book", say:'"그림의 굵은 간선 7개가 bfs(0) 신장 트리다(정점 8 − 1). 점선은 <b>비트리 간선</b> — 이 중 하나라도 트리에 더하면 반드시 <b>사이클</b>이 생긴다(두 정점은 이미 트리 안 경로로 이어져 있으므로). 신장 트리는 「연결을 유지하는 최소」다 — n−1개보다 적으면 끊어진다."'},
      {check:{id:"c9D-2", stem:'신장 트리에 <b>비트리 간선 하나</b>를 더하면?',
        okfb:'그 간선의 두 정점은 이미 트리 경로로 이어져 있다 — 새 간선까지 합쳐 사이클이 된다.',
        choices:[
          {text:"반드시 사이클이 생긴다",correct:true},
          {text:"더 좋은 신장 트리가 된다",correct:false,mc:"better-myth",fb:"간선이 n개가 되는 순간 트리가 아니다."},
          {text:"연결이 끊어진다",correct:false,mc:"reverse",fb:"더하는데 끊어질 리 없다 — 문제는 남아도는 길(사이클)이다."},
          {text:"아무 변화도 없다",correct:false,mc:"no-change",fb:"트리의 정의(사이클 없음)가 깨진다."}]}},
      {who:"book", say:'"마지막 — 응용. 도시 n개를 통신망으로 모두 잇는 최소의 회선 수는 신장 트리의 간선 수, n−1이다. 그런데 현실의 회선에는 <b>구축 비용이 제각각</b>이다. 어느 n−1개를 골라야 <b>총비용이 최소</b>가 되는가 — 간선에 숫자(가중치)가 붙는 순간 새 문제가 열린다. 다음 강의 주제다."'},
      {check:{id:"c9D-3", stem:'정점 6개의 연결 그래프(간선 9개)에서 신장 트리를 만들면, <b>트리 간선</b>과 <b>비트리 간선</b>은 각각 몇 개인가?',
        okfb:'트리 간선은 언제나 6 − 1 = 5개, 비트리는 나머지 9 − 5 = 4개다.',
        choices:[
          {text:"트리 5개 · 비트리 4개",correct:true},
          {text:"트리 6개 · 비트리 3개",correct:false,mc:"vertex-confuse",fb:"트리 간선은 정점 수보다 하나 적다."},
          {text:"트리 4개 · 비트리 5개",correct:false,mc:"count-slip",fb:"정점 6개를 모두 이으려면 5개가 필요하다."},
          {text:"트리 9개 · 비트리 0개",correct:false,mc:"all-edges",fb:"간선을 전부 쓰면 사이클이 남는다 — 트리가 아니다."}]}}
    ]}
  },

  hints: {
    A:["【절차】 방문 표시(발자국) → 미방문 인접 중 작은 번호로 전진 → 갈림길은 스택 → 막히면 pop 백트래킹 → 스택 비면 종료.",
       "【규약】 인접 리스트는 오름차순 — 갈림길에서는 항상 작은 번호부터.",
       "【미로】 4주차 미로의 전략과 같다 — 칸=정점, 통로=간선."],
    B:["【코드 뼈대】 visited[v]=TRUE(먼저!) → printf → for(인접 리스트) → if(!visited) → dfs 재귀.",
       "【스택의 행방】 재귀 호출 = 시스템 스택. 백트래킹 = 리턴. (7주차 회수)",
       "【호출 횟수】 연결 그래프에서 dfs 호출 수 = 정점 수 — visited가 재호출을 막는다."],
    C:["【절차】 방문하며 큐에 push — 꺼내며 이웃 확장. 큐가 비면 종료.",
       "【큐 상태 추적】 꺼낸 정점은 빠지고, 새 이웃(작은 번호부터)이 뒤에 붙는다.",
       "【대응】 스택=깊이 우선(미로 원판), 큐=너비 우선. 트리의 BFS = 레벨 순회."],
    D:["【연결 판정】 dfs(0) 후 미방문 정점 유무. 【요소 나열】 미방문 정점마다 dfs 재시작 — 한 번의 dfs가 요소 하나.",
       "【신장 트리】 탐색이 지나간 간선만 = 트리 간선 n−1개. 비트리 간선 = e − (n−1).",
       "【사이클】 비트리 간선 하나를 트리에 더하면 반드시 사이클."]
  },

  /* ================= 문제 풀 (14 + Parsons 1) ================= */
  pool: [
    {id:"P01", unit:"A", stem:'<b>깊이 우선 탐색(DFS)</b>이라는 이름의 뜻으로 옳은 것은?',
     okfb:'옆으로 넓히기 전에 한 길을 끝까지(깊게) 파고든다 — 그래서 깊이 우선이다.',
     choices:[
       {text:"한 길을 끝까지 파고든 뒤에 옆으로 넓힌다",correct:true},
       {text:"가장 깊은 정점부터 거꾸로 방문한다",correct:false,mc:"reverse-myth",fb:"출발은 어디까지나 시작 정점 — 파고드는 방향이 깊이인 것이다."},
       {text:"가까운 정점부터 골고루 방문한다",correct:false,mc:"bfs-confuse",fb:"그것은 너비 우선(BFS)이다."},
       {text:"차수가 큰 정점을 먼저 방문한다",correct:false,mc:"degree-myth",fb:"차수는 순서 기준이 아니다 — 인접 리스트의 순서를 따른다."}]},
    {id:"P02", unit:"A", stem:'DFS에서 <b>스택이 기억하는 것</b>은?',
     okfb:'되돌아갈 갈림길(지나온 정점들) — 막히면 pop으로 직전 갈림길로 복귀한다.',
     choices:[
       {text:"되돌아갈 갈림길(지나온 정점들)",correct:true},
       {text:"이미 방문한 정점의 전체 목록",correct:false,mc:"visited-confuse",fb:"그것은 visited 배열의 일 — 스택은 '돌아갈 길'만 기억한다."},
       {text:"그래프의 모든 간선",correct:false,mc:"struct-confuse",fb:"간선은 인접 리스트가 저장한다."},
       {text:"아직 방문하지 않은 정점 전부",correct:false,mc:"frontier-myth",fb:"미방문 전부를 쌓지 않는다 — 길을 따라 지나온 자취만 쌓인다."}]},
    {id:"P03", unit:"A", stem:'4주차의 <b>미로</b>를 그래프로 보면, 옳은 대응은?',
     okfb:'칸이 정점, 칸 사이 통로가 간선 — 미로 탐색이 곧 그래프의 깊이 우선 탐색이었다.',
     choices:[
       {text:"칸 = 정점, 통로 = 간선",correct:true},
       {text:"칸 = 간선, 통로 = 정점",correct:false,mc:"swap-slip",fb:"머무는 곳이 정점, 잇는 것이 간선이다."},
       {text:"벽 = 정점, 칸 = 간선",correct:false,mc:"swap-slip",fb:"벽은 간선이 '없음'에 해당한다."},
       {text:"미로는 그래프로 나타낼 수 없다",correct:false,mc:"cant-myth",fb:"이번 주의 출발점이 바로 그 대응이다."}]},
    {id:"P04", unit:"B", stem:'재귀 dfs 코드에서 <b>백트래킹</b>에 해당하는 것은?',
     okfb:'막다른 호출이 리턴하는 것 — 시스템 스택에서 이전 호출로 돌아가는 그 순간이다.',
     choices:[
       {text:"재귀 호출이 리턴하는 것",correct:true},
       {text:"visited를 FALSE로 되돌리는 것",correct:false,mc:"reset-myth",fb:"발자국은 지우지 않는다 — 되돌아가도 표시는 남는다."},
       {text:"printf로 정점을 출력하는 것",correct:false,mc:"print-confuse",fb:"출력은 방문의 기록일 뿐이다."},
       {text:"for 루프가 다음 노드로 넘어가는 것",correct:false,mc:"loop-confuse",fb:"같은 정점 안에서의 이동이다 — 백트래킹은 '이전 정점으로' 돌아가는 것."}]},
    {id:"P05", unit:"B", stem:'dfs 코드의 <span class="mono">for (w = graph[v]; w; w = w->link)</span> 가 하는 일은?', mono:true,
     okfb:'정점 v의 인접 리스트를 처음부터 끝(NULL)까지 걷는다 — 10주차의 그 리스트다.',
     choices:[
       {text:"v의 인접 리스트를 처음부터 끝까지 걷는다",correct:true},
       {text:"모든 정점을 번호 순서로 훑는다",correct:false,mc:"index-order",fb:"graph[v]는 v의 이웃만 이어 놓은 리스트다."},
       {text:"방문한 정점을 스택에서 하나씩 꺼낸다",correct:false,mc:"stack-confuse",fb:"꺼내기는 리턴의 몫 — for는 이웃을 살필 뿐이다."},
       {text:"인접 행렬의 v행을 읽는다",correct:false,mc:"matrix-confuse",fb:"이 코드는 인접 리스트 표현을 쓴다 — 행렬이라면 첨자 순회였을 것이다."}]},
    {id:"P06", unit:"B", stem:'dfs 코드의 빈칸에 들어갈 조건은?', mono:true,
     code:["void dfs(int v) {","    node_pointer w;","    visited[v] = TRUE;  printf(\"%5d\", v);","    for (w = graph[v]; w; w = w->link)","        if ( ______________________ )","            dfs(w->vertex);","}"],
     okfb:'아직 발자국이 없는 이웃만 재귀로 들어간다 — !visited[w->vertex].',
     choices:[
       {text:"!visited[w->vertex]",correct:true},
       {text:"visited[w->vertex]",correct:false,mc:"negate-miss",fb:"방문한 곳에 또 들어가면 끝나지 않는다 — 부정(!)이 핵심이다."},
       {text:"w->vertex > v",correct:false,mc:"index-myth",fb:"번호 크기는 방문 조건이 아니다."},
       {text:"w->link != NULL",correct:false,mc:"link-confuse",fb:"리스트의 끝 검사는 for 조건이 이미 한다."}]},
    {id:"P07", unit:"B", stem:'다음 dfs 코드에는 문제가 있다. 무엇인가?', mono:true,
     code:["void dfs(int v) {","    node_pointer w;","    printf(\"%5d\", v);","    for (w = graph[v]; w; w = w->link)","        if (!visited[w->vertex])","            dfs(w->vertex);","    visited[v] = TRUE;   /* ? */","}"],
     okfb:'방문 표시가 재귀 뒤에 있다 — 이웃의 재귀가 표시 없는 v로 되돌아 들어와, 사이클에서 끝나지 않는다.',
     choices:[
       {text:"표시가 늦어 같은 정점에 재귀가 되돌아 들어온다",correct:true},
       {text:"printf가 for보다 앞이라 순서가 틀린다",correct:false,mc:"print-confuse",fb:"출력 위치는 방문 시점 기록일 뿐 — 문제는 표시의 시점이다."},
       {text:"visited를 두 번 쓰게 되어 낭비다",correct:false,mc:"waste-myth",fb:"낭비가 아니라 정확성 문제 — 종료가 보장되지 않는다."},
       {text:"문제없다 — 어디에 두든 같다",correct:false,mc:"order-blind",fb:"재귀 호출보다 앞에 있어야 안전하다."}]},
    {id:"P08", unit:"C", stem:'BFS가 사용하는 자료구조와 그 이유로 옳은 것은?',
     okfb:'먼저 발견한(가까운) 정점부터 확장해야 한다 — 먼저 넣은 것부터 꺼내는 큐다.',
     choices:[
       {text:"큐 — 먼저 발견한 정점부터 확장해야 하므로",correct:true},
       {text:"스택 — 최근 정점부터 파고들어야 하므로",correct:false,mc:"dfs-confuse",fb:"그것은 깊이 우선의 조합이다."},
       {text:"트리 — 층 구조를 저장해야 하므로",correct:false,mc:"struct-confuse",fb:"층은 큐의 순서가 저절로 만들어 준다."},
       {text:"배열 — 번호 순서로 방문해야 하므로",correct:false,mc:"index-myth",fb:"번호 순서가 아니라 발견 순서다."}]},
    {id:"P09", unit:"C", stem:'BFS 코드에서 정점을 큐에 넣을 때 <b>즉시 방문 표시</b>를 하는 이유는?',
     okfb:'표시를 미루면 같은 정점이 여러 이웃 경유로 큐에 두 번 들어갈 수 있다.',
     choices:[
       {text:"같은 정점이 큐에 두 번 들어가는 것을 막으려고",correct:true},
       {text:"큐의 크기를 계산하기 쉽게 하려고",correct:false,mc:"size-myth",fb:"크기 계산과 무관하다 — 중복 삽입 방지다."},
       {text:"출력 순서를 정점 번호 순서로 맞추려고",correct:false,mc:"index-myth",fb:"순서는 발견 순서 — 표시는 중복을 막을 뿐이다."},
       {text:"표시는 꺼낼 때 해도 결과가 완전히 같다",correct:false,mc:"late-mark",fb:"꺼낼 때 하면 이미 큐 안에 같은 정점이 두 개일 수 있다."}]},
    {id:"P10", unit:"C", stem:'DFS와 BFS의 차이를 <b>가장 정확히</b> 말한 것은?',
     okfb:'저장소가 다르다 — 스택이면 최근 발견부터(깊이), 큐면 먼저 발견부터(너비).',
     choices:[
       {text:"가 볼 곳을 스택에 쌓는가, 큐에 줄 세우는가",correct:true},
       {text:"DFS는 트리 전용, BFS는 그래프 전용이다",correct:false,mc:"domain-myth",fb:"둘 다 그래프 일반에 쓰인다 — 트리는 특별한 경우일 뿐."},
       {text:"DFS는 큰 번호부터, BFS는 작은 번호부터 간다",correct:false,mc:"index-myth",fb:"둘 다 같은 오름차순 규약을 쓴다 — 차이는 저장소다."},
       {text:"DFS만 방문 표시가 필요하다",correct:false,mc:"visited-myth",fb:"둘 다 필수다 — BFS는 중복 삽입까지 막아야 한다."}]},
    {id:"P11", unit:"D", stem:'연결 요소를 나열하는 <span class="mono">connected()</span> 코드의 원리는?', mono:true,
     okfb:'방문 안 된 정점이 남아 있는 동안 그곳에서 dfs를 재시작 — dfs 한 번이 요소 하나를 전부 쓸어 담는다.',
     choices:[
       {text:"미방문 정점마다 dfs를 다시 시작한다",correct:true},
       {text:"모든 정점에서 dfs를 한 번씩, 총 n번 돌린다",correct:false,mc:"all-start",fb:"이미 방문된 정점은 건너뛴다 — if(!visited[i])가 그 문지기다."},
       {text:"간선을 하나씩 지워 가며 개수를 센다",correct:false,mc:"edge-myth",fb:"간선 삭제는 필요 없다 — 탐색의 도달 범위가 곧 요소다."},
       {text:"인접 행렬의 대각선을 조사한다",correct:false,mc:"matrix-myth",fb:"대각선은 셀프 루프 자리(항상 0)다."}]},
    {id:"P12", unit:"D", stem:'정점 n개, 간선 e개의 연결 그래프에서 <b>신장 트리</b>가 갖는 간선 수는?', mono:true,
     okfb:'모든 정점을 잇는 트리 — 6주차의 성질 그대로 n−1개다.',
     choices:[
       {text:"n − 1",correct:true},
       {text:"e",correct:false,mc:"all-edges",fb:"탐색이 사용한 간선만 남긴다 — 전부가 아니다."},
       {text:"e − n",correct:false,mc:"count-slip",fb:"비트리 간선 수는 e − (n−1) — 트리 간선은 n−1이다."},
       {text:"n",correct:false,mc:"vertex-confuse",fb:"정점 수만큼 이으면 사이클이 생긴다."}]},
    {id:"P13", unit:"D", stem:'<b>깊이 우선 신장 트리</b>와 <b>너비 우선 신장 트리</b>에 대한 설명으로 옳은 것은?',
     okfb:'같은 그래프라도 탐색 방법에 따라 지나가는 간선이 달라 모양이 다를 수 있다 — 간선 수는 둘 다 n−1.',
     choices:[
       {text:"모양은 다를 수 있어도 간선 수는 같다",correct:true},
       {text:"항상 완전히 같은 트리가 된다",correct:false,mc:"same-myth",fb:"공용 예제에서 dfs와 bfs가 지나는 간선부터 다르다."},
       {text:"너비 우선 쪽이 간선이 더 적다",correct:false,mc:"count-myth",fb:"신장 트리라면 무엇이든 n−1개다."},
       {text:"깊이 우선 쪽에만 사이클이 남는다",correct:false,mc:"cycle-myth",fb:"트리에는 사이클이 없다 — 어느 방법이든."}]},
    {id:"P14", unit:"D", stem:'통신망 설계에서 "도시 n개를 <b>최소 회선</b>으로 모두 잇는다"에 해당하는 것은?',
     okfb:'모든 정점을 포함하는 최소 간선의 연결 구조 — 신장 트리(n−1개 회선)다.',
     choices:[
       {text:"신장 트리",correct:true},
       {text:"완전 그래프",correct:false,mc:"complete-confuse",fb:"완전 그래프는 최대 간선 — 회선 낭비의 극단이다."},
       {text:"연결 요소",correct:false,mc:"comp-confuse",fb:"요소는 나뉜 덩어리를 세는 개념이다."},
       {text:"인접 리스트",correct:false,mc:"struct-confuse",fb:"저장 방법이지 망 설계가 아니다."}]},
    {id:"P15", unit:"B", ptype:"parsons",
     stem:'깊이 우선 탐색의 재귀 코드를 <b>올바른 순서</b>로 조립하라. (선언은 문장보다 앞 — 그리고 방문 표시는 반드시 재귀보다 앞이어야 한다)',
     lines:["void dfs(int v) {","    node_pointer w;","    visited[v] = TRUE;  printf(\"%5d\", v);","    for (w = graph[v]; w; w = w->link)","        if (!visited[w->vertex])","            dfs(w->vertex);","}"],
     okfb:'선언 → 방문 표시·출력 → for → if → 재귀. 표시가 for 뒤로 가면 이웃의 재귀가 v로 되돌아 들어와 끝나지 않는다 — 순서가 곧 안전이다.',
     fb:'방문 표시(발자국)가 재귀 호출보다 앞인지, 선언이 첫 문장보다 앞인지 확인하라.'}
  ],

  /* ================= 서사 ================= */
  interludes: {
    A: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 오늘 수업에서 교수님이 그래프 탐색이 미로 찾기랑 같은 문제라고 했다 했잖아요. 근데 미로는 벽이 있는데 그래프엔 벽이 없잖아요 — 뭐가 같다는 건지 아직도 모르겠어요.'},
      {who:"나", face:"me-proud", text:'(답장) 벽을 보지 말고 길을 봐라 — 서 있을 수 있는 칸이 정점, 칸에서 칸으로 건너갈 수 있으면 그 사이가 간선이다. 벽은 "간선이 없다"는 뜻일 뿐이야. 마침 오늘 밤 내가 그 대응을 공부했다. 수요일에 그림으로 보여주마.'}
    ],
    B: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 오늘 동아리 방 열쇠를 잃어버려서요, 학교 교실을 다 뒤졌거든요. 한 교실을 구석까지 싹 뒤지고, 없으면 나와서 다음 교실로 — 결국 처음 교실 사물함 뒤에서 찾았어요;;'},
      {who:"나", face:"me", text:'(답장) 고생했다. 그런데 그 수색 방식, 오늘 밤 내가 공부한 코드와 정확히 같은 전략이다 — 한 곳을 끝까지, 막히면 되돌아 나와 다음으로. 이름은 내일 과외에서 알려주마.'}
    ],
    C: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 월요일 수업에서 교수님이 「탐색이 지나간 간선만 남기면 트리가 된다」고 했었는데요. 아무렇게나 생긴 그래프에서 트리가 나온다는 게 마법 같아서 계속 생각나요. 그건 언제 가르쳐 주세요?'},
      {who:"나", face:"me-proud", text:'(답장) 좋은 대목을 물고 있었구나. 마법이 아니라 — 탐색은 각 정점에 "처음 도착한 길" 하나씩만 쓰거든. 정점마다 들어온 길이 하나면, 그게 바로 트리다. 내일 밤 내가 먼저 정리해서, 토요일에 그림으로 보여주마.'},
      {who:"발신 번호 없음", face:"📵", text:'(밤 11시 — 문자) 시험 점수 하나로 어머님을 안심시켰다고 끝난 줄 아나. <b>어머님이 아직 모르는 이야기</b>는 어디 가지 않는다. — 나가라. 늦기 전에.'},
      {who:"나", face:"me-worried", text:'<span class="inner">…같은 시각, 같은 요구. 새로운 것은 없다 — 새로운 것이 없다는 게 오히려 눈에 띈다. 그자도 다음 수가 마땅치 않은 거다. …덮어 두자. 내일 자습이 먼저다.</span>'},
      {who:"나", face:"me", text:'<span class="inner">휴대폰을 엎어 놓고 책을 다시 편다 — 그러다 처음으로, <b>여백</b>이 눈에 들어온다. 연필로 눌러 쓴 옛 풀이들. 내가 오늘 막혔던 자리마다, 먼저 막혔던 흔적이 있다. 표지 안쪽엔 「<b>이동훈, 9232054</b>」. …앞 주인은 꽤 성실한 사람이었구나. 이상하게 — 협박 문자보다 이 낡은 연필 자국이 오래 마음에 남는다.</span>'}
    ]
  },

  /* 도발장 5 — 궁지에 몰린 협박범이 서랍 깊은 곳의 옛 문제를 꺼내 든다 (단서 ⑤ 예열 — 관찰은 전부 주인공 몫) */
  aplusSkin: {
    cond:{aplusMin:1}, hud:"도발장", header:"🗡 토요일 오후 — 발신 번호 없는 문자", qHeader:"🗡 도발장",
    offer:[
      {who:"발신 번호 없음", face:"📵", text:'(문자) 지난주는 운이 좋았던 걸로 해 두지. …이번 것은 다르다. 탐색 셋 — 답장은 지난번과 같은 방식으로. 틀린 풀이는, 말했던 대로 어머님 앞으로 간다.'},
      {who:"나", face:"me-worried", text:'<span class="inner">문제가 도착했다. 그런데 이 문면 — "다음 물음에 답하라"라니, 요즘은 잘 안 쓰는 문투다. 어딘가 <b>오래된 인쇄물</b>을 그대로 옮겨 적은 것 같은… 지금까지의 문제와 결이 다르다. 왜 갑자기. …풀면서 본다. 문제는 출제자를 비춘다.</span>'}
    ],
    acceptLabel:'"받아 주지." (도발장 3문제)',
    declineLabel:'무시한다 (기본 트랙)',
    resultWin:[
      {who:"발신 번호 없음", face:"📵", text:'(문자) ……그것까지 푸는군. {n}/3. — 다음 주에 보자.'},
      {who:"나", face:"me-proud", text:'<span class="inner">이겼다 — 그리고 답장이 또 짧아졌다. 정리해 보자. 요즘 문제로 지자, <b>오래된 문투의 문제</b>를 꺼내 왔다. 궁지에 몰린 사람은 결국 서랍 깊은 곳의 것을 꺼내 드는 법이다. …그런데 이 문투, 어디선가 본 것 같은 기분이 든다. 어디였더라.</span>'}
    ],
    resultLose:[
      {who:"발신 번호 없음", face:"📵", text:'(문자) {n}/3. 이 정도에 막히다니 — 시간이 얼마 없다고 했을 텐데.'},
      {who:"나", face:"me-awkward", text:'<span class="inner">…밀렸다. 하지만 저 문제들의 결이 낯설었던 건 사실이다. 오래된 문투, 손에 익은 출제 습관 — 지금까지의 문제와 다르다. 문제를 다시 읽어 본다. 지는 와중에도, 조각은 줍는다.</span>'}
    ]
  },

  tutorQs: [
    {id:"Q1", ask:'쌤, 탐색할 때 <b>방문 표시</b>요… 그냥 안 하면 안 돼요? 어차피 갈 데 없으면 알아서 멈출 거 아니에요.',
     choices:[
      {text:'"그래프엔 빙 돌아 제자리로 오는 길(사이클)이 있어서 안 돼. 표시가 없으면 같은 정점 사이를 영원히 맴돌거든 — 표시는 속도 장치가 아니라 <b>끝나게 만드는</b> 장치야."', correct:true, fb:'아, 뱅글뱅글 도는 길이 있으니까… 발자국이 없으면 영원히 도는 거네요. 끝나게 만드는 장치라는 말이 확 와닿아요.'},
      {text:'"안 해도 결과는 같아. 표시는 방문 순서를 나중에 확인하려고 남기는 기록용이라, 시험에서 코드를 짧게 쓰라면 지워도 되는 부분이야. 교과서들이 습관처럼 넣어 두는 것뿐이지."', correct:false, mc:"log-myth", fb:'네? 기록용이면 지워도 된다는 건데… 아까 교수님이 이 줄이 제일 중요하다고 별표까지 쳤는데요.'},
      {text:'"트리를 탐색할 때만 필요한 거야. 그래프는 어차피 아무렇게나 이어져 있어서 표시가 의미가 없고, 몇 바퀴 돌다 보면 저절로 다 방문돼서 멈춰."', correct:false, mc:"tree-myth", fb:'어… 반대 아니에요? 트리는 되돌아오는 길이 없다면서요. 뱅글 도는 건 그래프 쪽인데…'}]},
    {id:"Q2", ask:'코드에 스택이 <b>한 줄도 없던데요</b>? 어제 쌤이 문자로 "막히면 되돌아 나오는 전략"이랬잖아요 — 그 되돌아가기는 누가 해 줘요?',
     choices:[
      {text:'"함수가 함수를 부르는 <b>재귀</b>가 그 스택이야. 호출이 쌓이는 곳이 시스템 스택이고, dfs의 리턴이 곧 한 칸 되돌아가기(백트래킹)지. 언어가 대신 관리해 줄 뿐이야."', correct:true, fb:'호출이 쌓이는 게 스택… 리턴이 되돌아가기! 트리 순회 때도 그랬다고 하셨죠. 이제 코드에서 스택이 보여요.'},
      {text:'"visited 배열이 스택 역할을 겸해. TRUE가 쌓인 순서를 거꾸로 읽으면 되돌아갈 길이 나오거든. 그래서 배열 하나로 두 가지 일을 하는 알뜰한 코드인 거야."', correct:false, mc:"visited-confuse", fb:'음? 배열엔 순서가 안 남잖아요. TRUE는 다 똑같은 TRUE인데 어떻게 거꾸로 읽어요?'},
      {text:'"이 코드는 되돌아가기가 없는 개선판이야. 인접 리스트를 오름차순으로 이어 두면 막다른 곳이 아예 안 생기게 되어 있어서, 한 방향으로만 쭉 가면 전부 방문돼."', correct:false, mc:"no-backtrack", fb:'네?? 아까 예제에서 4가 막다른 곳이라 7로 돌아갔다면서요. 오름차순은 순서 규약이지 막다른 곳을 없애 주진 않을 텐데요.'}]},
    {id:"Q3", boss:true, ask:'마지막이요! 막다른 데서 되돌아갈 때, 어떻게 <b>정확히</b> 갈림길로 돌아가요? 아무 데로나 돌아가면 될 것 같은데… 컴퓨터가 갈림길 위치를 어떻게 기억해요?',
     choices:[
      {text:'"지나온 정점이 스택에 <b>순서대로</b> 쌓여 있거든. 막히면 pop — 나오는 건 언제나 <b>가장 최근</b> 정점이고, 갈 곳이 없으면 또 pop. 왔던 길을 정확히 거슬러 돌아가는 거지."', correct:true, fb:'스택이 순서를 지켜 주니까… 최근 것부터 차례로! 미로에서 온 길을 되짚는 거랑 똑같네요. 이제 완전히 잡았어요.'},
      {text:'"모든 정점에서 출발점까지의 거리를 탐색 전에 미리 다 계산해 두고, 막히면 그중 거리가 가장 가까운 갈림길로 곧장 점프하는 거야. 그래서 되돌아가기가 순간이동처럼 빠르지."', correct:false, mc:"teleport-myth", fb:'미리 거리를 다 계산한다고요? 그럼 그게 탐색보다 더 큰 일 아니에요…? 뭔가 순서가 이상한데요.'},
      {text:'"운에 가까워. 인접한 방문 정점 중 아무 데로나 돌아가는데, 오름차순 규약 덕분에 결과적으로 갈림길이 걸리는 것뿐이야. 그래서 규약이 다르면 탐색이 실패할 수도 있어."', correct:false, mc:"random-myth", fb:'실패할 수도 있다고요?? 교수님은 어떤 그래프든 반드시 다 방문한다고 했는데요… 운이라는 건 이상해요.'}]}
  ]
};
