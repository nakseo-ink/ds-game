"use strict";
/* 챕터 6 데이터 — "트리 순회" = 7주차 (강의 5장 중반 18~28매 + 신규: 레벨 순회·노드 수/높이·수식 트리 — 천인국 8.5~8.9 재서술 · 규약 v1.4)
   순회 3종(재귀) → 반복 중위(스택)·레벨 순회(큐) → 구조 재귀(count/height/copy/equal) → 수식 트리(5주차 계산기 회수).
   서사: 협박 문자 2(책을 안다) + 단서 ② + 도발장 2. */
const CH06 = {
  meta: { id:"ch06", week:7, title:"트리 순회", sub:"전위·중위·후위", nextTeaser:"히프와 이진 탐색 트리",
          nextHint:'교수님이 다음 주는 <b>급한 것부터 나오는 줄서기</b>랑, <b>반씩 잘라 가며 찾는 트리</b>를 한대요. 트리에서 뭘 찾는 거죠?' },
  economy: { payPerPoint:1000, aplusBonus:200000 },
  exam: { unitPts:15, tutorPts:10, passLine:54 },   /* 4유닛 × 15 + 과외 30 = 90 만점 */
  apGen: "AP6",

  intro: [
    {who:"도윤", face:"doyun", text:'쌤! 이번 주는 <b>트리 순회</b>래요. 트리의 노드를 <b>하나도 빠짐없이 한 번씩 방문</b>하는 건데, 같은 트리인데 방문하는 <b>순서가 세 가지</b>나 된대요. 순서가 다르면 결과도 다 다를 거 아니에요…'},
    {who:"도윤", face:"doyun-worried", text:'게다가 코드는 <b>함수가 자기 자신을 또 호출한대요</b>. 부르고 또 부르면 끝없이 반복될 것 같은데, 어떻게 멈추는 거예요? <b>다음 주 월요일 쪽지시험</b>도 그대로예요. 수요일까지 부탁해요!'},
    {who:"나", face:"me-awkward", text:'<span class="inner">모든 노드를 한 번씩, 세 가지 순서로… 그리고 자기 자신을 호출하는 함수라. 지난주 책의 말이 떠오른다 — "서브트리도 트리다". 트리에 통하는 방법이면 서브트리에도 통할 것이다. 월요일 밤, 책부터 펴자.</span>'}
  ],

  flow: ["study-A","trial-A","il-A","study-B","trial-B","il-B","tutor","study-C","trial-C","il-C","study-D","trial-D","saturday","sunday"],
  cpl: {
    "study-A":"7주차 · 월 — 순회 3종 자습","trial-A":"7주차 · 월 — 순회 시련","il-A":"7주차 · 월요일 밤",
    "study-B":"7주차 · 화 — 스택·큐 순회 자습","trial-B":"7주차 · 화 — 레벨 순회 시련","il-B":"7주차 · 화요일 밤",
    "tutor":"7주차 · 수 — 과외",
    "study-C":"7주차 · 목 — 구조 재귀 자습","trial-C":"7주차 · 목 — 구조 재귀 시련","il-C":"7주차 · 목요일 밤",
    "study-D":"7주차 · 금 — 수식 트리 자습","trial-D":"7주차 · 금 — 수식 트리 시련",
    "saturday":"7주차 · 토 — 보충/A+","sunday":"7주차 · 월 — 쪽지시험"
  },

  trials: {
    A:{gen:"G21", label:"순회 3종", doneLabel:"유닛 A 숙달 ▶"},
    B:{gen:"G22", label:"레벨 순회", doneLabel:"유닛 B 숙달 ▶"},
    C:{gen:"G23", label:"구조 재귀", doneLabel:"유닛 C 숙달 ▶"},
    D:{gen:"G24", label:"수식 트리", doneLabel:"유닛 D 숙달 ▶"}
  },
  ilNext: { A:"화요일 — 유닛 B ▶", B:"수요일 — 과외 ▶", C:"금요일 — 유닛 D ▶" },
  tutorNextLabel:"목요일 밤 — 유닛 C ▶",
  tutorPassMsg:'printf 자리 하나로 전위·중위·후위가 갈린다는 거, 오늘 확실히 잡았어요. 스택이면 깊이 먼저, 큐면 층 먼저 — 3주차 배운 게 여기서 다시 나올 줄은 몰랐어요.',

  /* ================= 자습 ================= */
  study: {
    A: { day:"월요일", label:"유닛 A", title:"순회 — 세 가지 방문 순서", doneLabel:"시련 — 순회 3종 ▶", beats:[
      {say:'지난주엔 트리의 구조와 저장 방법을 배웠다. 이번 주 주제는 <b>순회(traversal)</b> — 트리의 모든 노드를 빠짐없이 한 번씩 방문하는 방법이다.'},
      {who:"book", say:'"<b>순회(traversal)</b>란 자료구조의 모든 원소를 한 번씩 방문하는 것이다. 배열이나 리스트는 방문 순서가 하나뿐이다 — 앞에서 뒤로. 그러나 트리는 노드마다 갈림길이 있어 <b>순서를 정해 줘야 한다</b>. 한 노드에서 할 일은 셋: <b>L</b>(왼쪽 서브트리로 간다), <b>V</b>(자신을 방문 — 출력한다), <b>R</b>(오른쪽 서브트리로 간다). 왼쪽을 오른쪽보다 먼저 간다는 관례를 두면 남는 순서는 셋 — <b>LVR·VLR·LRV</b>."'},
      {who:"book", say:'"이름은 <b>V의 자리</b>가 정한다. V가 가운데면 <b>중위(inorder, LVR)</b>, 맨 앞이면 <b>전위(preorder, VLR)</b>, 맨 뒤면 <b>후위(postorder, LRV)</b>. 같은 트리를 세 가지로 읽는다 — 셋 다 이번 주의 주인공이다."',
       table:'<table class="trip"><tr><th>이름</th><th>순서</th><th>V(방문)의 자리</th></tr><tr><td><b>전위</b> preorder</td><td>V → L → R</td><td>맨 앞</td></tr><tr><td><b>중위</b> inorder</td><td>L → V → R</td><td>가운데</td></tr><tr><td><b>후위</b> postorder</td><td>L → R → V</td><td>맨 뒤</td></tr></table>'},
      {gate:{id:"c6-g-rec2", book:"c-func", q:'코드로 가기 전에 — 순회 함수는 <b>자기 자신을 다시 호출한다</b>(재귀 호출). 이런 함수가 끝없이 반복되지 않고 <b>반드시 끝나는</b> 이유, 설명할 수 있나?', basics:[
        {who:"book", say:'"용어부터 분명히 — <b>재귀 호출(recursive call)</b>이란 함수가 실행 도중 <b>자기 자신을 다시 호출</b>하는 것이다. inorder 안의 inorder(ptr->left_child)가 그것이다. 중요한 사실: 두 호출은 이름만 같을 뿐 <b>별개의 실행</b>이다 — 각 호출은 자기만의 ptr 값을 가지며, 호출될 때마다 그 정보가 5주차에서 본 메모리의 <b>스택 영역</b>에 한 층씩 쌓인다."'},
        {who:"book", say:'"끝나는 이유는 두 가지가 맞물려서다. ① 호출할 때마다 다루는 대상이 <b>더 작아진다</b> — 트리 전체 → 왼쪽 서브트리 → 그 안의 서브트리… ② 가장 작은 경우인 <b>NULL에 도달하면 if (ptr) 검사가 거짓</b>이 되어, 아무것도 하지 않고 반환한다. 반환되면 스택 영역의 호출 정보가 한 층 걷히고, <b>자기를 불렀던 곳의 다음 줄</b>부터 실행이 이어진다."'},
        {say:'정리하면 — 자기를 부르되 <b>매번 더 작은 문제</b>로 부르고, 가장 작은 문제(NULL)에서 멈춘다. 지난주에 배운 "서브트리도 트리"라는 정의가 그래서 중요했구나 — 트리를 처리하는 함수를 서브트리에 그대로 다시 쓸 수 있다.'}
      ]}},
      {who:"book", say:'"중위 순회를 C로 — 세 줄이 L·V·R을 그대로 옮긴다. 왼쪽 서브트리를 먼저 몽땅 처리하고(재귀), 자신을 출력하고, 오른쪽을 처리한다."',
       code:["void inorder(tree_pointer ptr) {","    if (ptr) {                       /* NULL이면 아무것도 안 하고 복귀 */","        inorder(ptr->left_child);    /* L — 왼쪽 서브트리 전부 */","        printf(\"%c \", ptr->data);    /* V — 자신을 방문 */","        inorder(ptr->right_child);   /* R — 오른쪽 서브트리 전부 */","    }","}"]},
      {who:"book", say:'"작은 트리에서 한 단계씩 따라가 보자 — 호출이 쌓였다가 되돌아오는 과정을 눈으로 확인하는 것이 이번 주의 첫 고비다."',
       steps:{code:["inorder(ptr->left_child);","printf(\"%c \", ptr->data);","inorder(ptr->right_child);"], frames:[
         {hl:0, viz:{type:"tree",data:{v:"A",hl:1,c:[{v:"B",c:[{v:"D"},{v:"E"}]},{v:"C"}]}},
          cap:'inorder(A) 시작 — A를 출력하고 싶지만 <b>왼쪽이 먼저</b>다. inorder(B)를 부르고, B도 왼쪽이 먼저라 inorder(D)를 부른다. <b>출력: (아직 없음)</b>'},
         {hl:1, viz:{type:"tree",data:{v:"A",c:[{v:"B",c:[{v:"D",hl:1},{v:"E"}]},{v:"C"}]}},
          cap:'D의 왼쪽은 NULL — 아무것도 안 하고 복귀. 이제 <b>D 자신을 출력</b>. D의 오른쪽도 NULL. D의 일이 끝나 B로 되돌아간다. <b>출력: D</b>'},
         {hl:1, viz:{type:"tree",data:{v:"A",c:[{v:"B",hl:1,c:[{v:"D"},{v:"E",hl:1}]},{v:"C"}]}},
          cap:'B의 왼쪽(D 묶음)이 끝났으니 <b>B를 출력</b>, 이어 오른쪽 inorder(E) — E도 잎이라 바로 출력. B의 일이 끝났다. <b>출력: D B E</b>'},
         {hl:2, viz:{type:"tree",data:{v:"A",hl:1,c:[{v:"B",c:[{v:"D"},{v:"E"}]},{v:"C",hl:1}]}},
          cap:'A의 왼쪽이 통째로 끝났다 — <b>A를 출력</b>하고 오른쪽 inorder(C). C도 잎이라 출력. 전부 걷히며 끝. <b>출력: D B E A C</b> — 이것이 중위다.'}
       ]}},
      {check:{id:"c6A-1", stem:'방금의 트리(A의 왼쪽 B(D,E), 오른쪽 C)를 <b>중위 순회</b>한 출력은?', mono:true,
        okfb:'왼쪽 묶음(D B E) → 자신(A) → 오른쪽(C) — D B E A C.',
        choices:[
          {text:"D B E A C",correct:true},
          {text:"A B D E C",correct:false,mc:"pre-mix",fb:"자신을 먼저 출력하면 '전위'다 — 중위는 왼쪽을 다 마친 뒤 자신이다."},
          {text:"D E B C A",correct:false,mc:"post-mix",fb:"자신을 맨 뒤로 미루면 '후위'다."},
          {text:"A B C D E",correct:false,mc:"level-mix",fb:"층별로 읽는 것은 내일 배울 '레벨 순회'다."}]}},
      {who:"book", say:'"전위와 후위는 새로운 함수가 아니다 — <b>printf 한 줄의 위치만 다르다</b>. 재귀 호출의 구조는 완전히 같고, 자신을 <b>출력하는 시점</b>만 다르다. 그 한 줄의 위치가 출력 순서 전체를 바꾼다."',
       code:["void preorder(tree_pointer ptr) {      /* V L R */","    if (ptr) {","        printf(\"%c \", ptr->data);    /* V가 맨 앞 */","        preorder(ptr->left_child);","        preorder(ptr->right_child);","    }","}","void postorder(tree_pointer ptr) {     /* L R V */","    if (ptr) {","        postorder(ptr->left_child);","        postorder(ptr->right_child);","        printf(\"%c \", ptr->data);    /* V가 맨 뒤 */","    }","}"]},
      {check:{id:"c6A-2", stem:'같은 트리(A의 왼쪽 B(D,E), 오른쪽 C)를 <b>전위 순회</b>한 출력은?', mono:true,
        okfb:'자신 먼저 — A, 그리고 왼쪽 묶음(B D E)… 순서대로 A B D E C.',
        choices:[
          {text:"A B D E C",correct:true},
          {text:"D B E A C",correct:false,mc:"in-mix",fb:"그것은 중위 — 전위는 도착하자마자 자신부터 찍는다."},
          {text:"A B C D E",correct:false,mc:"level-mix",fb:"층별 순서가 아니다 — 전위는 왼쪽 끝까지 파고든 뒤에야 오른쪽이다."},
          {text:"C A E B D",correct:false,mc:"reverse-mix",fb:"뒤집힌 순서 — 전위는 루트 A에서 시작한다."}]}},
      {check:{id:"c6A-3", stem:'어떤 이진 트리든, <b>후위 순회에서 맨 마지막</b>에 출력되는 노드는?',
        okfb:'후위는 왼쪽·오른쪽을 전부 마친 뒤 자신 — 전체를 마치는 마지막 출력은 언제나 루트다.',
        choices:[
          {text:"루트 — 자식들을 전부 마친 뒤라서",correct:true},
          {text:"가장 오른쪽 리프 — 끝까지 미뤄져서",correct:false,mc:"leaf-last",fb:"그 리프도 자기 조상들보다는 먼저 끝난다 — 마지막은 모두의 조상, 루트다."},
          {text:"가장 왼쪽 리프 — 가장 깊어서",correct:false,mc:"first-last-swap",fb:"가장 왼쪽 리프는 후위의 '첫' 출력 후보다."},
          {text:"트리 모양에 따라 매번 달라진다",correct:false,mc:"shape-myth",fb:"모양과 무관하다 — 자신이 맨 뒤(LRV)이므로 루트가 항상 마지막이다."}]}},
      {who:"book", say:'"표준 7노드 트리로 셋을 나란히 — 눈에 익혀 두라. 시련과 시험의 기준 감각이 된다."',
       viz:{type:"tree",data:{v:"A",c:[{v:"B",c:[{v:"D"},{v:"E"}]},{v:"C",c:[{v:"F"},{v:"G"}]}]}},
       table:'<table class="trip"><tr><th>전위 (VLR)</th><td class="mono">A B D E C F G</td></tr><tr><th>중위 (LVR)</th><td class="mono">D B E A F C G</td></tr><tr><th>후위 (LRV)</th><td class="mono">D E B F G C A</td></tr></table>'},
      {who:"book", say:'"표에서 알 수 있는 사실 하나 — <b>순회 결과 하나만으로는 원래 트리를 알 수 없다.</b> 서로 다른 트리가 같은 전위 결과를 낼 수 있기 때문이다. 그러나 <b>전위와 중위가 함께 주어지면 트리는 단 하나로 정해진다.</b> 전위의 첫 원소가 루트이고, 중위에서 그 루트보다 왼쪽에 적힌 것들이 왼쪽 서브트리의 전부다 — 두 서브트리에 같은 방법을 반복하면 트리가 복원된다."'},
      {say:'셋 다 재귀 구조는 같고 printf의 위치만 다르다 — 전위는 만나자마자, 중위는 왼쪽을 마친 뒤, 후위는 전부 마친 뒤 출력한다. 시련으로 손에 익히자.', mood:"proud"}
    ]},

    B: { day:"화요일", label:"유닛 B", title:"반복 순회 — 스택과 큐의 재등장", doneLabel:"시련 — 레벨 순회 ▶", beats:[
      {say:'어제는 재귀로 순회했다. 문득 궁금하다 — <b>재귀 없이</b>, 반복문만으로도 같은 순회를 할 수 있을까?'},
      {who:"book", say:'"재귀가 해 주던 일의 정체는 <b>\'되돌아갈 조상 기억하기\'</b>다(호출이 스택 영역에 쌓였다 걷히는 것). 그렇다면 — 그 기억을 우리가 직접 하면 재귀 없이도 된다. 도구는 이미 있다: <b>3주차의 스택</b>(push/pop). 왼쪽으로 내려가며 만나는 조상을 전부 쌓아 두고, 막히면 꺼내며(pop) 방문한다."',
       code:["void iter_inorder(tree_pointer node) {","    for (;;) {","        for (; node; node = node->left_child)","            push(node);              /* 왼쪽 내리막의 조상들을 쌓는다 */","        node = pop();                /* 가장 최근에 미뤄 둔 노드 */","        if (!node) break;            /* 스택이 비었다 — 끝 */","        printf(\"%c \", node->data);  /* 이제서야 방문 */","        node = node->right_child;    /* 오른쪽으로 넘어간다 */","    }","}"]},
      {who:"book", say:'"같은 트리에서 스택이 어떻게 변하는지 단계별로 따라가 보자."',
       steps:{frames:[
         {viz:{type:"tree",data:{v:"A",hl:1,c:[{v:"B",hl:1,c:[{v:"D",hl:1},{v:"E"}]},{v:"C"}]}},
          html:'<table class="trip"><tr><th>스택 (위가 톱)</th><td class="mono">D · B · A</td></tr><tr><th>출력</th><td class="mono">—</td></tr></table>',
          cap:'왼쪽 내리막 A → B → D를 <b>전부 push</b>. D의 왼쪽이 NULL이라 내리막 끝.'},
         {viz:{type:"tree",data:{v:"A",c:[{v:"B",c:[{v:"D",hl:1},{v:"E"}]},{v:"C"}]}},
          html:'<table class="trip"><tr><th>스택</th><td class="mono">B · A</td></tr><tr><th>출력</th><td class="mono">D</td></tr></table>',
          cap:'<b>pop → D 출력</b>. D의 오른쪽은 NULL — 쌓을 것 없이 다시 pop으로.'},
         {viz:{type:"tree",data:{v:"A",c:[{v:"B",hl:1,c:[{v:"D"},{v:"E",hl:1}]},{v:"C"}]}},
          html:'<table class="trip"><tr><th>스택</th><td class="mono">A</td></tr><tr><th>출력</th><td class="mono">D B E</td></tr></table>',
          cap:'pop → <b>B 출력</b>, 오른쪽 E로 — E를 push했다 바로 pop해 <b>E 출력</b>. 재귀가 하던 "미뤘다 돌아오기"를 스택이 그대로 한다.'},
         {viz:{type:"tree",data:{v:"A",hl:1,c:[{v:"B",c:[{v:"D"},{v:"E"}]},{v:"C",hl:1}]}},
          html:'<table class="trip"><tr><th>스택</th><td class="mono">(비어 있다)</td></tr><tr><th>출력</th><td class="mono">D B E A C</td></tr></table>',
          cap:'pop → <b>A 출력</b>, 오른쪽 C 처리. 스택이 비어 pop이 실패 신호를 주면 break — 출력 <b>D B E A C</b>, 어제의 재귀 중위와 정확히 같다.'}
       ]}},
      {check:{id:"c6B-1", stem:'iter_inorder에서, 스택에 <b>가장 오래 머무는</b> 노드는? (방금의 트리 기준)',
        okfb:'루트 A — 첫 push 때 들어가 왼쪽 묶음이 다 끝난 뒤에야 pop된다.',
        choices:[
          {text:"루트 A — 처음 쌓여 가장 늦게 꺼내진다",correct:true},
          {text:"리프 D — 가장 깊은 곳이라 가장 오래 남는다",correct:false,mc:"depth-myth",fb:"D는 가장 늦게 쌓였지만 가장 '먼저' 꺼내진다 — 스택은 LIFO다."},
          {text:"E — 오른쪽 자식이라 끝까지 미뤄진다",correct:false,mc:"right-myth",fb:"E는 잠깐 들어갔다 바로 나온다 — 오래 머무는 것은 일찍 쌓인 조상이다."},
          {text:"모든 노드가 같은 시간만큼 머문다",correct:false,mc:"uniform-myth",fb:"먼저 쌓일수록 늦게 나온다 — 머무는 시간은 제각각이다."}]}},
      {who:"book", say:'"이번엔 전혀 다른 방문 순서가 필요하다 — <b>층별로</b>, 위에서 아래로, 같은 층에서는 왼쪽부터 방문하고 싶다. 어제의 세 순회는 전부 한쪽 끝까지 먼저 내려가는 <b>깊이 우선</b>이라 층별 방문이 안 된다. 필요한 것은 \'<b>발견한 순서 그대로</b> 처리하기\' — 3주차의 <b>큐</b>(addq/deleteq)다. 이것이 이번 주에 새로 배우는 <b>레벨 순회(level-order)</b>다."',
       code:["void level_order(tree_pointer ptr) {","    if (!ptr) return;","    addq(ptr);                        /* 루트를 큐에 넣고 시작 */","    while (!queue_is_empty()) {","        ptr = deleteq();              /* 먼저 발견된 노드부터 */","        printf(\"%c \", ptr->data);","        if (ptr->left_child)  addq(ptr->left_child);   /* 자식들을 */","        if (ptr->right_child) addq(ptr->right_child);  /* 발견 순서대로 예약 */","    }","}"]},
      {who:"book", say:'"한 줄씩 뜯어 보자 — 여섯 줄이 전부다."',
       table:'<table class="trip"><tr><th>줄</th><th>하는 일</th></tr><tr><td class="mono">addq(ptr);</td><td>시작 전에 <b>루트를 큐에 넣는다</b> — "이 노드를 방문할 차례가 오면 처리하겠다"는 예약이다.</td></tr><tr><td class="mono">while (!queue_is_empty())</td><td>예약된 노드가 남아 있는 동안 반복한다. 큐가 비면 모든 노드를 방문한 것이다.</td></tr><tr><td class="mono">ptr = deleteq();</td><td>큐의 <b>맨 앞</b> — 남은 것 중 <b>가장 먼저 예약된</b> 노드를 꺼낸다.</td></tr><tr><td class="mono">printf(...)</td><td>꺼낸 노드를 출력한다 — 이 순간이 그 노드의 "방문"이다.</td></tr><tr><td class="mono">if (...) addq(left)</td><td>왼쪽 자식이 있으면 큐의 <b>맨 뒤</b>에 예약한다. 지금 처리 중인 층의 나머지 노드들 <b>뒤에</b> 줄을 서므로, 아래층은 반드시 나중이다.</td></tr><tr><td class="mono">if (...) addq(right)</td><td>오른쪽 자식도 예약한다 — 왼쪽 <b>다음에</b> 넣으므로 같은 층에서는 왼쪽이 먼저 처리된다.</td></tr></table>'},
      {who:"book", say:'"큐가 어떻게 변하는지도 단계별로 따라가 보자 — 같은 트리다."',
       steps:{frames:[
         {viz:{type:"tree",data:{v:"A",hl:1,c:[{v:"B",c:[{v:"D"},{v:"E"}]},{v:"C"}]}},
          html:'<table class="trip"><tr><th>큐 (앞→뒤)</th><td class="mono">B · C</td></tr><tr><th>출력</th><td class="mono">A</td></tr></table>',
          cap:'루트 A를 넣고 시작 — 꺼내서 <b>A 출력</b>, 자식 B·C를 뒤에 예약.'},
         {viz:{type:"tree",data:{v:"A",c:[{v:"B",hl:1,c:[{v:"D"},{v:"E"}]},{v:"C"}]}},
          html:'<table class="trip"><tr><th>큐</th><td class="mono">C · D · E</td></tr><tr><th>출력</th><td class="mono">A B</td></tr></table>',
          cap:'앞에서 B를 꺼내 <b>출력</b>, B의 자식 D·E를 뒤에 예약 — C보다 <b>뒤</b>에 선다. 이 줄서기가 층을 지킨다.'},
         {viz:{type:"tree",data:{v:"A",c:[{v:"B",c:[{v:"D"},{v:"E"}]},{v:"C",hl:1}]}},
          html:'<table class="trip"><tr><th>큐</th><td class="mono">D · E</td></tr><tr><th>출력</th><td class="mono">A B C</td></tr></table>',
          cap:'C를 꺼내 <b>출력</b> — C는 자식이 없어 예약 없음. 2층이 끝났다.'},
         {viz:{type:"tree",data:{v:"A",c:[{v:"B",c:[{v:"D",hl:1},{v:"E",hl:1}]},{v:"C"}]}},
          html:'<table class="trip"><tr><th>큐</th><td class="mono">(비어 있다)</td></tr><tr><th>출력</th><td class="mono">A B C D E</td></tr></table>',
          cap:'D, E를 차례로 꺼내 출력 — 큐가 비면 끝. <b>A B C D E</b>, 층별·왼쪽부터. 스택에 보관하면 깊이 우선, 큐에 보관하면 층 순서가 된다.'}
       ]}},
      {check:{id:"c6B-2", stem:'그림의 트리를 <b>레벨 순회</b>한 출력은?', mono:true,
        viz:{type:"tree",data:{v:"7",c:[{v:"3",c:[{v:"9"},{v:"1"}]},{v:"5"}]}},
        okfb:'층별로 위에서 아래, 왼쪽부터 — 7, 3, 5, 9, 1.',
        choices:[
          {text:"7 3 5 9 1",correct:true},
          {text:"9 3 1 7 5",correct:false,mc:"in-mix",fb:"그것은 중위(왼쪽-자신-오른쪽) — 레벨 순회는 층별이다."},
          {text:"7 3 9 1 5",correct:false,mc:"pre-mix",fb:"그것은 전위 — 한쪽으로 파고들지 말고 층을 다 돌고 내려간다."},
          {text:"1 9 5 3 7",correct:false,mc:"reverse-mix",fb:"아래층부터 뒤집힌 순서 — 큐는 루트(위층)부터다."}]}},
      {check:{id:"c6B-3", stem:'레벨 순회가 스택이 아니라 <b>큐</b>를 쓰는 이유는?',
        okfb:'큐는 먼저 발견된 노드를 먼저 처리(FIFO) — 위층에서 발견된 순서가 그대로 지켜져 층별이 된다.',
        choices:[
          {text:"먼저 발견한 노드를 먼저 처리해야 층 순서가 지켜져서",correct:true},
          {text:"큐가 스택보다 넣고 꺼내는 속도가 근본적으로 빨라서",correct:false,mc:"speed-myth",fb:"둘 다 O(1)이다 — 속도가 아니라 '꺼내는 순서'가 다르다."},
          {text:"스택은 트리의 노드를 저장할 수 없게 되어 있어서",correct:false,mc:"type-myth",fb:"어제 iter_inorder가 스택에 노드를 잘만 쌓았다 — 문제는 순서다."},
          {text:"재귀 호출이 큐 구조로 쌓이기 때문에 그걸 흉내 내려고",correct:false,mc:"call-queue-myth",fb:"호출은 '스택'으로 쌓인다 — 그래서 재귀는 깊이 우선이 되고, 층별엔 큐가 따로 필요하다."}]}},
      {say:'같은 트리인데 스택을 쓰면 깊이 우선, 큐를 쓰면 층 순서 — 방문 순서는 노드를 <b>어느 자료구조에 보관하느냐</b>가 정하고 있었다. 3주차에서 만든 스택과 큐가 이렇게 다시 쓰인다.', mood:"proud"}
    ]},

    C: { day:"목요일", label:"유닛 C", title:"순회로 계산하기 — 구조 재귀", doneLabel:"시련 — 구조 재귀 ▶", beats:[
      {say:'수요일 과외를 넘기고, 목요일 밤. 오늘의 주제 — 순회를 응용하면 출력만이 아니라 <b>계산</b>이 된다: 노드 수 세기, 높이 재기, 트리 복제와 비교까지.'},
      {who:"book", say:'"순회의 진짜 힘은 출력이 아니다 — <b>서브트리의 답을 받아 전체의 답을 만드는 것</b>. 트리의 노드 수를 세어 보자: 나를 1로 치고, 왼쪽 묶음의 답과 오른쪽 묶음의 답을 <b>더하면 끝</b>이다. 묶음의 답은 누가 구하나 — 같은 함수가, 재귀로."',
       code:["int node_count(tree_pointer ptr) {","    if (!ptr) return 0;              /* 없는 트리 = 0개 */","    return 1 + node_count(ptr->left_child)","             + node_count(ptr->right_child);","}"]},
      {who:"book", say:'"반환값이 아래에서 위로 모이는 것을 보라 — 리프가 1을 돌려주고, 부모가 그것을 합쳐 돌려준다. <b>후위 순회와 같은 순서</b>다: 자식들의 값이 먼저 정해지고, 자신의 값은 마지막에 정해진다."',
       steps:{frames:[
         {viz:{type:"tree",data:{v:"A",c:[{v:"B",c:[{v:"D",hl:1,tag:1},{v:"E",hl:1,tag:1}]},{v:"C",hl:1,tag:1}]}},
          cap:'리프 D, E, C — 왼쪽도 오른쪽도 NULL(0) — 각자 <b>1 + 0 + 0 = 1</b>을 돌려준다. (노드 옆 숫자 = 반환값)'},
         {viz:{type:"tree",data:{v:"A",c:[{v:"B",hl:1,tag:3,c:[{v:"D",tag:1},{v:"E",tag:1}]},{v:"C",tag:1}]}},
          cap:'B는 자식들의 답을 받아 <b>1 + 1 + 1 = 3</b>. 자기 묶음의 크기를 자기 자리에서 완성한다.'},
         {viz:{type:"tree",data:{v:"A",hl:1,tag:5,c:[{v:"B",tag:3,c:[{v:"D",tag:1},{v:"E",tag:1}]},{v:"C",tag:1}]}},
          cap:'루트 A — <b>1 + 3 + 1 = 5</b>. 전체의 답은 마지막에, 루트에서 나온다. 후위의 사고 그대로다.'}
       ]}},
      {check:{id:"c6C-1", stem:'위 트리에서 <span class="mono">node_count(B)</span> — B를 루트로 부른 호출의 <b>반환값</b>은?', mono:true,
        okfb:'B 묶음(B, D, E)만 센다 — 1 + 1 + 1 = 3.',
        choices:[
          {text:"3",correct:true},
          {text:"5",correct:false,mc:"whole-tree",fb:"5는 트리 전체 — node_count(B)는 B 아래 묶음만 센다."},
          {text:"2",correct:false,mc:"self-drop",fb:"자기 자신(B)도 1로 센다 — return의 맨 앞 1이 그것이다."},
          {text:"4",correct:false,mc:"count-off",fb:"B, D, E — 하나씩 짚으며 다시."}]}},
      {who:"book", say:'"높이도 같은 틀이다 — 왼쪽 묶음의 높이와 오른쪽 묶음의 높이 중 <b>큰 쪽</b>에 내 층 1을 얹는다."',
       code:["int height(tree_pointer ptr) {","    if (!ptr) return 0;","    int hl = height(ptr->left_child);","    int hr = height(ptr->right_child);","    return 1 + (hl > hr ? hl : hr);   /* 큰 쪽 + 나 */","}"]},
      {check:{id:"c6C-2", stem:'왼쪽 묶음의 높이가 3, 오른쪽 묶음의 높이가 1인 노드에서 <span class="mono">height</span>의 반환값은?', mono:true,
        okfb:'큰 쪽 3에 자신의 층 1을 얹는다 — 4.',
        choices:[
          {text:"4",correct:true},
          {text:"5",correct:false,mc:"sum-myth",fb:"두 높이를 더하지 않는다 — 길은 한쪽으로만 내려가므로 '큰 쪽'만 취한다."},
          {text:"3",correct:false,mc:"self-drop",fb:"자신의 층 1을 잊지 말 것 — 1 + max."},
          {text:"2",correct:false,mc:"min-pick",fb:"작은 쪽이 아니라 큰 쪽이다 — 높이는 가장 깊은 길이다."}]}},
      {who:"book", say:'"트리를 통째로 복제하는 <b>copy</b>도 같은 재귀 구조로 만든다. 순서는 <b>후위꼴</b> — 왼쪽 복제본과 오른쪽 복제본을 <b>먼저</b> 만들어 그 주소를 받아 둔 뒤에 내 노드를 만든다. 내 노드의 링크 칸에 채워 넣을 자식들의 주소가 먼저 필요하기 때문이다."',
       code:["tree_pointer copy(tree_pointer original) {","    tree_pointer temp;","    if (!original) return NULL;","    temp = (tree_pointer) malloc(sizeof(node));","    temp->left_child  = copy(original->left_child);   /* 자식 복제가 먼저 */","    temp->right_child = copy(original->right_child);","    temp->data = original->data;","    return temp;                      /* 내 주소는 마지막에 부모에게 */","}"]},
      {who:"book", say:'"<b>equal</b>(두 트리가 같은가)은 반대로 <b>전위 변형</b> — <b>나부터</b> 비교한다. 내 데이터가 다르면 서브트리는 볼 필요도 없이 탈락이니, 자신을 먼저 보는 쪽이 이득이다."',
       code:["int equal(tree_pointer first, tree_pointer second) {","    return ((!first && !second) ||            /* 둘 다 빈 트리 — 같다 */","            (first && second &&","             (first->data == second->data) && /* V — 나부터 비교 */","             equal(first->left_child,  second->left_child) &&","             equal(first->right_child, second->right_child)));","}"]},
      {check:{id:"c6C-3", stem:'copy가 <b>후위꼴</b>(자식 먼저)이고 equal이 <b>전위꼴</b>(자신 먼저)인 이유를 짝지은 것으로 옳은 것은?',
        okfb:'copy는 내 링크 칸에 자식 복제본의 "주소"가 필요해 자식이 먼저, equal은 나부터 다르면 즉시 탈락시킬 수 있어 자신이 먼저다.',
        choices:[
          {text:"copy는 자식의 주소가 먼저 필요하고, equal은 나부터 다르면 바로 끝낼 수 있어서",correct:true},
          {text:"copy는 메모리를 아끼려고, equal은 메모리를 더 쓰려고 순서를 바꾼 것이다",correct:false,mc:"memory-myth",fb:"메모리 문제가 아니라 '무엇이 먼저 필요한가'의 문제다."},
          {text:"둘 다 아무 순서나 가능하지만 책의 저자가 관례로 통일해 둔 것뿐이다",correct:false,mc:"convention-myth",fb:"copy를 전위로 바꾸면 아직 없는 복제본의 주소를 링크에 넣어야 한다 — 순서가 강제된다."},
          {text:"copy는 큐를 쓰고 equal은 스택을 쓰기 때문에 순서가 반대가 된다",correct:false,mc:"ds-mix",fb:"둘 다 재귀다 — 스택도 큐도 쓰지 않는다. 순서를 정하는 것은 '답의 의존 방향'이다."}]}},
      {check:{id:"c6C-4", stem:'<span class="mono">node_count</span>에서 첫 줄 <span class="mono">if (!ptr) return 0;</span> 을 지우면 어떻게 되는가?', mono:true,
        okfb:'재귀가 NULL에서 멈추지 못하고 NULL->left_child를 읽는 순간 죽는다 — base case가 유일한 브레이크다.',
        choices:[
          {text:"NULL의 필드를 읽으려다 프로그램이 죽는다",correct:true},
          {text:"결과가 정확히 1씩 크게 나올 뿐 잘 돌아간다",correct:false,mc:"off-by-one-myth",fb:"오차 문제가 아니다 — 멈출 장치가 사라져 NULL을 파고든다."},
          {text:"컴파일러가 무한 재귀를 감지해 오류를 띄운다",correct:false,mc:"compiler-magic",fb:"컴파일러는 이런 실수를 잡아 주지 않는다 — 실행 중에 무너진다."},
          {text:"리프 노드에서 저절로 멈추므로 차이가 없다",correct:false,mc:"leaf-stop-myth",fb:"리프에서도 left_child(NULL)로 호출은 계속된다 — 멈추는 것은 base case뿐이다."}]}},
      {say:'세기도, 높이 재기도, 복제도, 비교도 — 전부 "서브트리의 답 + 나"라는 한 가지 방식이었다. 트리 문제의 상당수가 이 재귀 구조 하나로 풀린다.', mood:"proud"}
    ]},

    D: { day:"금요일", label:"유닛 D", title:"수식 트리 — 그 계산기의 정체", doneLabel:"시련 — 수식 트리 ▶", beats:[
      {say:'금요일. 오늘 책의 첫 줄을 읽고 잠시 멈췄다 — <b>"4주차의 계산기를 기억하는가."</b> …후위 표기 계산기. 그걸 여기서 왜.'},
      {who:"book", say:'"수식은 사실 트리다. <span class="mono">(3*4)+5</span> 를 그려 보자 — <b>피연산자(숫자)는 리프</b>, <b>연산자는 내부 노드</b>가 된다. 연산자가 부모, 그 재료 둘이 자식. 먼저 계산할 것일수록 아래에 놓인다 — 괄호가 하던 일을 <b>모양</b>이 대신한다."',
       viz:{type:"tree",data:{v:"+",c:[{v:"×",c:[{v:"3"},{v:"4"}]},{v:"5"}]}}},
      {who:"book", say:'"이제 놀라운 사실 — 이 트리를 세 가지 순회로 방문하며 출력해 보라. <b>중위 순회의 출력은 3 × 4 + 5</b>(우리가 쓰는 중위 표기), <b>후위 순회의 출력은 3 4 × 5 +</b> — 4주차 계산기에 넣던 바로 그 후위 표기다. <b>전위 순회의 출력은 + × 3 4 5</b>(전위 표기라 부른다). 세 가지 표기법은 별개의 발명품이 아니라 <b>한 트리를 세 가지 순서로 순회한 결과</b>였다."',
       table:'<table class="trip"><tr><th>중위 순회</th><td class="mono">3 × 4 + 5</td><td>사람의 표기</td></tr><tr><th>후위 순회</th><td class="mono">3 4 × 5 +</td><td>4주차 계산기의 표기</td></tr><tr><th>전위 순회</th><td class="mono">+ × 3 4 5</td><td>전위 표기</td></tr></table>'},
      {check:{id:"c6D-1", stem:'그림의 수식 트리를 <b>후위 순회</b>로 출력하면?', mono:true,
        viz:{type:"tree",data:{v:"×",c:[{v:"+",c:[{v:"2"},{v:"3"}]},{v:"4"}]}},
        okfb:'왼쪽 묶음(2 3 +) → 오른쪽(4) → 자신(×) — 2 3 + 4 ×.',
        choices:[
          {text:"2 3 + 4 ×",correct:true},
          {text:"× + 2 3 4",correct:false,mc:"prefix-mix",fb:"연산자가 앞에 오면 전위 표기 — 후위는 연산자가 재료 뒤에 선다."},
          {text:"2 + 3 × 4",correct:false,mc:"infix-mix",fb:"중위 나열이다 — 후위 순회는 자식들 먼저, 자신은 맨 뒤."},
          {text:"4 + 3 2 ×",correct:false,mc:"reverse-mix",fb:"순서가 뒤섞였다 — 왼쪽 묶음부터 차근차근."}]}},
      {who:"book", say:'"출력할 수 있으면 <b>계산</b>도 할 수 있다 — 평가(eval)다. 리프면 담긴 값 그 자체를 돌려주고, 내부 노드면 <b>왼쪽 서브트리의 값과 오른쪽 서브트리의 값을 먼저 구한 뒤</b> 자신의 연산을 적용한다. 어제 배운 node_count와 같은 재귀 구조이고, 자식이 먼저·자신이 마지막이라는 점에서 후위 순회와 같은 순서다."',
       code:["int eval(tree_pointer ptr) {","    if (!ptr->left_child && !ptr->right_child)","        return ptr->value;               /* 리프 = 숫자 그 자체 */","    int left  = eval(ptr->left_child);   /* 왼쪽 재료의 답 */","    int right = eval(ptr->right_child);  /* 오른쪽 재료의 답 */","    switch (ptr->op) {","        case '+': return left + right;","        case '-': return left - right;","        case '*': return left * right;","    }","}"]},
      {who:"book", say:'"(3×4)+5 위에서 답이 아래에서 위로 모이는 것을 보라."',
       steps:{frames:[
         {viz:{type:"tree",data:{v:"+",c:[{v:"×",c:[{v:"3",hl:1},{v:"4",hl:1}]},{v:"5"}]}},
          cap:'리프 3과 4 — 계산할 것 없이 <b>값 그 자체</b>를 돌려준다.'},
         {viz:{type:"tree",data:{v:"+",c:[{v:"×",hl:1,tag:12,c:[{v:"3"},{v:"4"}]},{v:"5"}]}},
          cap:'× 노드 — 두 재료의 답을 받아 <b>3 × 4 = 12</b>. (노드 옆 숫자 = 반환값)'},
         {viz:{type:"tree",data:{v:"+",hl:1,tag:17,c:[{v:"×",tag:12,c:[{v:"3"},{v:"4"}]},{v:"5",tag:5}]}},
          cap:'루트 + — <b>12 + 5 = 17</b>. 마지막 계산은 언제나 루트다(후위의 마지막 방문 = 루트였던 것과 같은 이유).'}
       ]}},
      {check:{id:"c6D-2", stem:'그림의 수식 트리를 <span class="mono">eval</span> 한 결과는?', mono:true,
        viz:{type:"tree",data:{v:"-",c:[{v:"×",c:[{v:"2"},{v:"5"}]},{v:"3"}]}},
        okfb:'아래부터 — 2×5 = 10, 그리고 루트에서 10 − 3 = 7.',
        choices:[
          {text:"7",correct:true},
          {text:"4",correct:false,mc:"prec-miss",fb:"2 × (5−3)으로 읽지 않았나 — 괄호는 트리 '모양'에 이미 반영돼 있다. 아래 묶음(2×5)이 먼저다."},
          {text:"13",correct:false,mc:"op-flip",fb:"루트는 뺄셈이다 — 10 − 3."},
          {text:"10",correct:false,mc:"root-drop",fb:"10은 왼쪽 묶음의 답 — 루트의 연산(−3)까지 마쳐야 전체의 답이다."}]}},
      {check:{id:"c6D-3", stem:'4주차의 <b>후위 표기 계산기</b>(스택)와 수식 트리의 관계로 옳은 것은?',
        okfb:'후위 표기 = 수식 트리의 후위 순회 출력. 계산기는 트리를 그리지 않고도 그 순회 순서를 따라 계산한 셈이다.',
        choices:[
          {text:"후위 표기는 수식 트리를 후위 순회로 읽은 것 — 계산기는 그 순서를 스택으로 따라간 셈",correct:true},
          {text:"계산기가 내부에서 몰래 수식 트리를 만들어 두고 매번 다시 그려 가며 계산했던 것이다",correct:false,mc:"hidden-tree-myth",fb:"계산기에 트리는 없었다 — 순회의 '출력 순서'만 있으면 계산이 되는 게 요점이다."},
          {text:"둘은 이름만 비슷할 뿐, 표기법과 트리는 수학적으로 무관한 개념이다",correct:false,mc:"unrelated-myth",fb:"방금 같은 트리에서 세 표기가 전부 나왔다 — 표기법은 트리의 읽기다."},
          {text:"수식 트리는 전위 표기 전용이라 후위 계산기와는 반대 도구다",correct:false,mc:"prefix-only-myth",fb:"한 트리에서 전위·중위·후위 표기가 모두 나온다 — 전용이 아니다."}]}},
      {say:'그 계산기는 트리를 만든 적이 없는데도, 결과적으로 수식 트리를 후위 순회하는 순서 그대로 계산하고 있었던 셈이다. …이제 수식을 보면 트리부터 떠오를 것 같다.', mood:"proud"}
    ]}
  },

  hints: {
    A:["【이름】 V(방문·출력)의 자리가 이름 — 앞이면 전위(VLR), 가운데면 중위(LVR), 뒤면 후위(LRV).",
       "【방문 규칙】 묶음(서브트리) 단위로 — 왼쪽 묶음 전체를 끝내고서야 다음으로. 서브트리도 트리라 같은 규칙이 반복된다.",
       "【고정점】 전위의 처음 = 루트, 후위의 마지막 = 루트. 중위에서 루트의 왼쪽 = 왼쪽 서브트리 전부."],
    B:["【스택】 왼쪽 내리막을 전부 쌓고, pop하며 방문, 오른쪽으로 — 꺼내는 순서가 중위와 같아진다.",
       "【큐】 꺼내서 출력하고 자식을 뒤에 예약 — 먼저 발견된 것이 먼저 처리(FIFO)라 층별이 된다.",
       "【대비】 스택 = 깊이 우선(한쪽 끝까지), 큐 = 너비(층) 우선 — 노드를 보관하는 자료구조가 방문 순서를 정한다."],
    C:["【틀】 없는 트리(NULL)의 답부터 정하고(0 등), 서브트리의 답 + 나 — 세기는 합, 높이는 max+1.",
       "【국소】 f(X)는 X 아래 '묶음만' 본다 — 트리 전체를 세지 않도록 조심.",
       "【순서】 답이 자식에 의존하면 후위꼴(copy), 나부터 판정 가능하면 전위꼴(equal)."],
    D:["【모양】 피연산자 = 리프, 연산자 = 내부 노드. 먼저 계산할 것일수록 아래 — 괄호는 모양에 녹아 있다.",
       "【표기법】 중위 순회의 출력 = 중위 표기, 후위 순회의 출력 = 후위 표기(4주차 계산기), 전위 순회의 출력 = 전위 표기.",
       "【평가】 리프는 값 그 자체, 내부는 왼쪽 답·오른쪽 답을 받아 내 연산 — 마지막 계산은 루트."]
  },

  interludes: {
    A: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 사촌형네랑 가족 소개 영상 찍는데요. 형은 "할아버지부터 소개하고 내려오자"고 하고 저는 "저희부터 하고 올라가자"고 해서 싸웠어요. 누가 맞아요?'},
      {who:"나", face:"me-proud", text:'(답장) 둘 다 맞다 — 그게 오늘 밤 내가 공부한 순회다. 조상 먼저가 전위, 자손 먼저가 후위. 틀린 순서가 있는 게 아니라 <b>용도가 다른</b> 것뿐이야. 소개는 전위가, 감사 인사는 후위가 어울리겠네.'}
    ],
    B: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 엄마 심부름으로 마트 갔는데요. 계산대는 온 순서대로 계산해 주잖아요. 근데 물건 찾을 땐 한 통로를 끝까지 훑고, 없으면 되돌아 나와서 다음 통로로 갔거든요. 월요일 수업에서 교수님이 「트리를 읽는 순서가 여러 가지」라고 했는데, 왠지 그 얘기랑 닿아 있는 것 같아서요.'},
      {who:"나", face:"me", text:'(답장) 제대로 봤다 — 계산대 줄이 큐(먼저 온 순서대로), 통로 훑기가 스택(한쪽 끝까지 갔다가 되돌아오기) 방식이다. 오늘 밤 내가 공부한 두 가지 읽기 순서가 정확히 그 둘이야. 내일 과외에서 이름까지 붙여 주마.'}
    ],
    C: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 월요일 수업 끝에 교수님이 「다음은 <b>수식 트리</b> — 계산기를 만들어 본 사람은 소름 돋을 것」이라고 예고했거든요. 저 소름 돋을 준비 됐어요. 옛날에 쌤이 계산기 가르쳐 주셨잖아요!'},
      {who:"나", face:"me-proud", text:'(답장) …설마 그때 그 후위 표기가. 토요일에 같이 소름 돋자.'},
      {who:"발신 번호 없음", face:"📵", text:'(밤 11시 — 문자) 그 <b>낡은 자료구조 책</b> — 보수동 골목에서 산 거라지? 헌책으로 공부해 명문가 선생 노릇이라, 눈물겹군. 책 얽힌 사연까지 어머님이 아시게 되면… 꽤 재미있는 이야기가 되겠어.'},
      {who:"나", face:"me-worried", text:'<span class="inner">…책. 이 책까지 안다. 문자 내용이 아니라 <b>내 발걸음</b>을 알고 있는 거다 — 보수동 책방골목, 그날의 나를. 미행이었나, 아니면 그 골목을 아는 사람인가. …수첩. 적어 둔다.</span>',
       clue:{id:"clue2", text:"② 그자는 내가 보수동 책방골목에서 이 책을 산 것까지 안다 — 나를 직접 봤거나, 그 골목 사정에 밝은 사람이다."}}
    ]
  },

  /* 도발장 2 — 직전 장 A+급이면 토요일 A+ 트랙 리스킨 (수위 한 단계 상승) */
  aplusSkin: {
    cond:{aplusMin:1}, hud:"도발장", header:"🗡 토요일 오후 — 발신 번호 없는 문자", qHeader:"🗡 도발장",
    offer:[
      {who:"발신 번호 없음", face:"📵", text:'(문자) 트리 순회는 좀 익혔나, 선생님. 지난번엔 운이라 해 두지. 이번에도 <b>문제 셋</b> — 조건은 같다. 못 풀면, 그 낡은 책의 사연을 어머님께 들려 드리는 수밖에.'},
      {who:"나", face:"me-worried", text:'<span class="inner">또 왔다. …책 이야기까지 아는 자의 문제다. 두렵지 않다면 거짓말이지만 — 문제를 받을수록 그자의 <b>윤곽</b>이 보인다. 그리고 이 심화 문제들은 어차피 도윤이에게도 필요하다. 받는다.</span>'}
    ],
    acceptLabel:'"받아 주지." (도발장 3문제)',
    declineLabel:'무시한다 (기본 트랙)',
    resultWin:[
      {who:"발신 번호 없음", face:"📵", text:'(문자) {n}/3… 이번에도 통과라. 순회 실력은 인정하지. — 다음엔 더 깊은 곳에서 보자.'},
      {who:"나", face:"me-proud", text:'<span class="inner">두 번 연속으로 이겼다. 그런데… 이 문제들, 낼수록 확신이 든다. 출제의 결이 <b>가르쳐 본 사람</b>의 것이다. 학생이 아니야. — 대체 누구냐, 당신.</span>'}
    ],
    resultLose:[
      {who:"발신 번호 없음", face:"📵", text:'(문자) {n}/3. 순회도 못 하면서 선생 노릇이라니. — 다음 기회가 있을지는 나도 모르겠군.'},
      {who:"나", face:"me-awkward", text:'<span class="inner">…밀렸다. 분하지만 배운 것도 있다 — 그자는 순회를 훤히 안다. 기본기로 되갚는다. 월요일 시험부터.</span>'}
    ]
  },

  tutorQs: [
    {id:"Q1", ask:'쌤, 순회가 <b>세 개나</b> 있어야 해요? 어차피 노드를 다 한 번씩 방문하는 건 똑같잖아요. 하나로 통일하면 외울 것도 줄고 좋을 텐데요.',
     choices:[
      {text:'"방문하는 노드는 같아도 <b>시점</b>이 달라서 쓰임이 갈려. 자신부터 알릴 일(전위), 순서대로 늘어놓을 일(중위), 자식들 결과를 모아 마무리할 일(후위)이 따로 있거든. 목요일에 직접 쓰게 될 거야."', correct:true, fb:'아, 방문 순서가 아니라 <b>일하는 시점</b>이 다른 거군요. 쓰임새는 목요일에 보여 주시는 거죠?'},
      {text:'"솔직히 실무에선 중위 하나면 충분해. 전위랑 후위는 옛날 교과서의 흔적이라 시험에만 나오는 거니까, 중위만 확실히 외우고 나머지 둘은 이름이랑 V 위치 정도만 알아 두면 돼."', correct:false, mc:"one-enough-myth", fb:'에이, 그럼 교수님이 굳이 셋 다 코드까지 보여 주셨겠어요? 뭔가 각자 쓸모가 있으니까 그러시는 거 아니에요?'},
      {text:'"사실 세 개가 아니라 여섯 개야. 오른쪽을 먼저 가는 RVL, VRL, RLV까지 전부 따로 외워야 해서, 이번 주가 이 과목 전체에서 제일 암기량이 많은 주간이라고 보면 돼."', correct:false, mc:"six-memorize", fb:'책엔 왼쪽을 먼저 가는 게 관례라 셋만 다룬다고 돼 있던데요… 겁주지 마세요 쌤.'}]},
    {id:"Q2", ask:'세 함수 코드를 봤는데요, 진짜 <b>printf 한 줄 위치만</b> 다르던데… 그거 하나로 결과가 그렇게 완전히 달라진다는 게 안 믿겨요. 컴퓨터가 대충 비슷하게 내놓는 거 아니에요?',
     choices:[
      {text:'"방문 <b>경로는 셋 다 같아</b> — 다른 건 <b>출력 시점</b>뿐이야. 만나자마자 출력하면 조상이 먼저(전위), 왼쪽을 끝낸 뒤면 왼쪽이 먼저(중위), 다 끝낸 뒤면 자식들이 먼저지(후위)."', correct:true, fb:'경로는 같고 출력 시점만 다르다… 그래서 함수 모양이 똑같은 거군요. 이제 안 헷갈릴 것 같아요.'},
      {text:'"컴파일러가 printf 위치를 보고 각각에 맞는 탐색 경로를 새로 짜 주기 때문이야. 사실상 서로 다른 세 개의 탐색 알고리즘으로 번역돼 실행된다고 보면 돼."', correct:false, mc:"compiler-magic", fb:'컴파일러가 그런 것까지 해요? 코드에 적힌 대로 실행될 뿐이라고 하지 않으셨어요…?'},
      {text:'"실은 결과가 크게 다르지 않아. 출력의 앞뒤 한두 글자가 살짝 바뀌는 정도라서, 시험에서도 순서를 대충 비슷하게만 쓰면 부분 점수를 받을 수 있어."', correct:false, mc:"similar-myth", fb:'네? 아까 제가 풀어 본 것만 해도 D B E A C랑 A B D E C로 완전 달랐는데요. 부분 점수라니요.'}]},
    {id:"Q3", boss:true, ask:'마지막이요. 재귀를 흉내 낼 땐 <b>스택</b>이고 층별로 돌 땐 <b>큐</b>잖아요 — 노드를 저장하는 <b>자료구조만</b> 바꿨는데, 왜 하나는 <b>깊이</b>로 파고들고 하나는 <b>층</b>으로 도는 거예요?',
     choices:[
      {text:'"꺼내는 순서가 반대라서야. 스택은 <b>방금 넣은 것부터</b>(LIFO)라 한쪽 끝까지 파고들게 되고, 큐는 <b>먼저 넣은 것부터</b>(FIFO)라 발견된 층 순서를 지키지."', correct:true, fb:'꺼내는 규칙이 곧 방문 순서네요. 3주차에서 배울 땐 이런 데 쓰일 줄 몰랐어요.'},
      {text:'"스택이 큐보다 깊은 곳까지 저장할 수 있는 구조라서 그래. 큐는 폭은 넓은데 깊이 쪽엔 저장 제한이 있어서, 구조상 층별로밖에 못 도는 거야."', correct:false, mc:"capacity-myth", fb:'저장 개수는 둘 다 배열 크기만큼 아니었어요? 깊이 제한이라는 건 처음 듣는데요…'},
      {text:'"우연이야. 원래는 어느 쪽을 쓰든 두 방식 다 되는데, 교과서들이 오랜 관례로 스택엔 깊이 우선, 큐엔 층 순서를 배정해 둔 것뿐이지."', correct:false, mc:"convention-myth", fb:'우연이라기엔… 아까 스택 그림에서 진짜로 한쪽 끝까지 파고들던데요? 꺼내는 순서 때문 아니에요?'}]}
  ],

  /* ================= 저작형 문항 풀 (15문) — 시련에 40% 혼합 ================= */
  pool: [
    /* --- 유닛 A · 순회 3종 --- */
    {id:"P01", unit:"A", stem:'전위·중위·후위라는 <b>이름</b>을 가르는 기준은?',
     okfb:'V(자신 방문)의 자리 — 맨 앞이면 전위, 가운데면 중위, 맨 뒤면 후위.',
     choices:[
      {text:"V(자신을 방문·출력)가 L·R에 대해 놓이는 자리",correct:true},
      {text:"왼쪽(L)과 오른쪽(R) 중 어느 쪽을 먼저 가는지",correct:false,mc:"lr-myth",fb:"셋 다 왼쪽이 먼저다(관례) — 갈리는 것은 V의 자리다."},
      {text:"루트에서 시작하는지 리프에서 시작하는지",correct:false,mc:"start-myth",fb:"셋 다 루트에서 '출발'한다 — 출력 시점이 다를 뿐이다."},
      {text:"재귀로 구현하는지 반복문으로 구현하는지",correct:false,mc:"impl-myth",fb:"구현 방식과 무관하다 — 순서의 정의 문제다."}]},
    {id:"P02", unit:"A", stem:'그림의 트리를 <b>후위 순회</b>한 출력은?', mono:true,
     viz:{type:"tree",data:{v:"8",c:[{v:"4",c:[{v:"2"},{v:"6"}]},{v:"9",c:[null,{v:"7"}]}]}, slots:true},
     okfb:'왼쪽 묶음(2 6 4) → 오른쪽 묶음(7 9) → 자신(8) — 2 6 4 7 9 8.',
     choices:[
      {text:"2 6 4 7 9 8",correct:true},
      {text:"8 4 2 6 9 7",correct:false,mc:"pre-mix",fb:"그것은 전위 — 후위는 자신이 맨 뒤다."},
      {text:"2 4 6 8 9 7",correct:false,mc:"in-mix",fb:"그것은 중위 — 후위는 오른쪽 묶음까지 마친 뒤 자신이다."},
      {text:"8 4 9 2 6 7",correct:false,mc:"level-mix",fb:"층별 순서다 — 후위는 깊은 곳부터 마무리한다."}]},
    {id:"P03", unit:"A", stem:'순회 재귀 함수의 <span class="mono">if (ptr)</span> 검사가 하는 일은?', mono:true,
     okfb:'NULL(없는 곳)에 도착하면 아무것도 하지 않고 복귀 — 재귀를 멈추는 유일한 브레이크(base case)다.',
     choices:[
      {text:"NULL에 닿으면 되돌아가게 하는 멈춤 장치다",correct:true},
      {text:"트리가 완전 이진 트리인지 먼저 검사한다",correct:false,mc:"shape-check-myth",fb:"모양 검사가 아니다 — 순회는 어떤 모양이든 돈다."},
      {text:"방문한 노드를 다시 방문하지 않게 표시한다",correct:false,mc:"visited-myth",fb:"트리에는 순환이 없어 표시가 필요 없다 — 문제는 '없는 곳'에서 멈추기다."},
      {text:"스택 영역이 가득 찼는지 확인하고 멈춘다",correct:false,mc:"overflow-myth",fb:"메모리 감시가 아니라 트리의 끝(NULL) 감지다."}]},
    {id:"P04", unit:"A", stem:'<b>전위 순회</b>에서 <b>맨 처음</b> 출력되는 노드는? (어떤 이진 트리든)',
     okfb:'전위는 도착하자마자 자신부터(VLR) — 첫 출력은 언제나 루트다.',
     choices:[
      {text:"루트 — 도착하자마자 자신부터 찍는다",correct:true},
      {text:"가장 왼쪽 리프 — 왼쪽이 우선이라서",correct:false,mc:"in-mix",fb:"가장 왼쪽 리프가 첫 출력인 것은 '중위(와 후위)'다."},
      {text:"가장 얕은 리프 — 가까운 곳부터라서",correct:false,mc:"level-mix",fb:"층 개념은 레벨 순회의 것이다."},
      {text:"트리 모양에 따라 매번 달라진다",correct:false,mc:"shape-myth",fb:"V가 맨 앞이므로 모양과 무관하게 루트다."}]},
    /* --- 유닛 B · 반복 중위·레벨 순회 --- */
    {id:"P05", unit:"B", stem:'iter_inorder(반복 중위)에서 <b>스택이 기억하는 것</b>의 정체는?',
     okfb:'왼쪽으로 내려오며 방문을 미뤄 둔 조상들 — 재귀에서 호출 스택이 하던 "되돌아갈 곳"이다.',
     choices:[
      {text:"방문을 미뤄 둔 조상 노드들(되돌아갈 곳)",correct:true},
      {text:"이미 출력을 마친 노드들의 기록(방문 이력)",correct:false,mc:"visited-myth",fb:"끝난 노드는 다시 볼 일이 없다 — 스택엔 '아직 못 한' 조상이 산다."},
      {text:"트리 전체의 노드를 미리 담아 둔 목록",correct:false,mc:"preload-myth",fb:"전부 담지 않는다 — 왼쪽 내리막의 조상들만 잠시 쌓인다."},
      {text:"각 노드의 자식 수를 세어 둔 숫자들",correct:false,mc:"count-myth",fb:"수가 아니라 노드(주소) 자체를 쌓는다."}]},
    {id:"P06", unit:"B", stem:'어떤 트리의 순회 출력이 <b>루트부터 시작해, 같은 층을 왼쪽에서 오른쪽으로</b> 훑고 다음 층으로 내려갔다. 어느 순회인가?',
     okfb:'층별·왼쪽부터 — 큐를 쓰는 레벨 순회의 정의 그대로다.',
     choices:[
      {text:"레벨 순회 — 큐로 발견 순서를 지킨다",correct:true},
      {text:"전위 순회 — 루트부터 시작하니까",correct:false,mc:"pre-mix",fb:"전위도 루트부터지만 곧장 한쪽으로 파고든다 — 층을 지키지 않는다."},
      {text:"중위 순회 — 왼쪽부터 읽으니까",correct:false,mc:"in-mix",fb:"중위의 시작은 루트가 아니라 가장 왼쪽 노드다."},
      {text:"후위 순회 — 층을 다 돌고 마무리하니까",correct:false,mc:"post-mix",fb:"후위의 첫 출력은 깊은 리프 쪽이다 — 루트는 맨 마지막."}]},
    {id:"P07", unit:"B", stem:'level_order 코드에서 <span class="mono">addq(ptr->left_child)</span> 를 <span class="mono">addq(ptr->right_child)</span> <b>뒤로</b> 옮기면?', mono:true,
     okfb:'각 층을 오른쪽부터 훑게 된다 — 층 순서는 유지되지만 층 안의 방향이 뒤집힌다.',
     choices:[
      {text:"층은 유지되나 각 층을 오른쪽부터 읽게 된다",correct:true},
      {text:"아무 변화 없다 — 어차피 큐가 순서를 맞춰 준다",correct:false,mc:"no-op-myth",fb:"큐는 '넣은 순서'대로 꺼낼 뿐 — 넣는 순서가 바뀌면 출력도 바뀐다."},
      {text:"깊이 우선(전위 순회)으로 바뀌어 버린다",correct:false,mc:"depth-flip-myth",fb:"깊이 우선이 되려면 큐 자체를 스택으로 바꿔야 한다 — 예약 순서만으론 층이 깨지지 않는다."},
      {text:"같은 노드가 두 번씩 출력되게 된다",correct:false,mc:"dup-myth",fb:"넣는 횟수는 그대로다 — 순서만 바뀐다."}]},
    /* --- 유닛 C · 구조 재귀 --- */
    {id:"P08", unit:"C", stem:'<span class="mono">node_count</span> 의 <span class="mono">return 1 + count(left) + count(right)</span> 에서 <b>1</b>의 의미는?', mono:true,
     okfb:'자기 자신 한 개 — 서브트리들의 답에 나를 더해 내 묶음의 답을 만든다.',
     choices:[
      {text:"자기 자신 노드 한 개",correct:true},
      {text:"루트에서 이 노드까지의 거리",correct:false,mc:"depth-confuse",fb:"거리가 아니다 — 개수 세기에서 '나 하나'다."},
      {text:"NULL 대신 돌려주는 기본값",correct:false,mc:"base-confuse",fb:"NULL의 답은 0이다(첫 줄) — 1은 살아 있는 나의 몫이다."},
      {text:"왼쪽과 오른쪽을 잇는 간선의 수",correct:false,mc:"edge-confuse",fb:"간선이 아니라 노드를 센다."}]},
    {id:"P09", unit:"C", stem:'<span class="mono">height</span> 가 두 서브트리 높이를 <b>더하지 않고 max</b>를 취하는 이유는?', mono:true,
     okfb:'높이는 루트에서 가장 깊은 리프까지 "한 길"의 길이 — 길은 왼쪽 아니면 오른쪽, 한쪽으로만 내려간다.',
     choices:[
      {text:"높이는 한쪽으로만 내려가는 가장 긴 길이라서",correct:true},
      {text:"덧셈은 오버플로 위험이 커 max로 대신한다",correct:false,mc:"overflow-myth",fb:"안전 문제가 아니라 정의 문제다 — 길은 갈라진 양쪽을 동시에 걸을 수 없다."},
      {text:"왼쪽 서브트리가 항상 더 높기 때문이다",correct:false,mc:"left-tall-myth",fb:"어느 쪽이 높을지는 트리마다 다르다 — 그래서 max가 필요하다."},
      {text:"더해도 결과는 같지만 max가 더 빠르다",correct:false,mc:"same-result-myth",fb:"결과부터 다르다 — 양쪽 높이 2, 2를 더하면 4지만 높이는 3이다."}]},
    {id:"P10", unit:"C", stem:'두 트리를 비교하는 <span class="mono">equal</span> 이 <b>전위꼴(자신 먼저)</b>인 것의 이점은?', mono:true,
     okfb:'루트부터 다르면 서브트리를 보지 않고 즉시 "다르다"로 끝낼 수 있다.',
     choices:[
      {text:"나부터 다르면 서브트리 비교 없이 바로 끝난다",correct:true},
      {text:"자식들의 비교 결과가 있어야 나를 비교할 수 있다",correct:false,mc:"order-flip",fb:"그건 후위(copy)의 사정 — equal의 내 비교는 자식과 무관하다."},
      {text:"전위가 세 순회 중 가장 적은 메모리를 쓴다",correct:false,mc:"memory-myth",fb:"메모리 이득이 아니라 '조기 탈락' 이득이다."},
      {text:"트리를 복제하지 않고 비교하기 위해서다",correct:false,mc:"copy-mix",fb:"복제 없는 비교는 어느 순서든 가능하다 — 요점은 일찍 끝내기다."}]},
    /* --- 유닛 D · 수식 트리 --- */
    {id:"P11", unit:"D", stem:'수식 트리에서 <b>리프</b>와 <b>내부 노드</b>에 오는 것은?',
     okfb:'리프 = 피연산자(숫자), 내부 노드 = 연산자 — 연산자는 재료 둘을 자식으로 거느린다.',
     choices:[
      {text:"리프엔 피연산자, 내부 노드엔 연산자",correct:true},
      {text:"리프엔 연산자, 내부 노드엔 피연산자",correct:false,mc:"concept-flip",fb:"거꾸로다 — 연산자는 재료(자식)가 필요하니 내부에 선다."},
      {text:"둘 다 어디에나 자유롭게 올 수 있다",correct:false,mc:"free-myth",fb:"연산자가 리프면 계산할 재료가 없다 — 자리가 정해져 있다."},
      {text:"리프엔 괄호, 내부 노드엔 연산자",correct:false,mc:"paren-myth",fb:"괄호는 트리에 아예 없다 — 모양이 괄호를 대신한다."}]},
    {id:"P12", unit:"D", stem:'수식 트리에 <b>괄호 노드가 없는</b> 이유는?',
     okfb:'무엇을 먼저 계산할지가 트리 모양(아래일수록 먼저)에 이미 담겨 있어, 괄호가 할 일이 없다.',
     choices:[
      {text:"계산 순서가 트리의 모양에 이미 담겨 있어서",correct:true},
      {text:"괄호는 눈에 안 보이는 특수 노드로 저장돼서",correct:false,mc:"hidden-node-myth",fb:"그런 노드는 없다 — 모양이 전부다."},
      {text:"컴퓨터는 괄호 문자를 처리할 수 없어서",correct:false,mc:"char-myth",fb:"4주차에서 괄호 검사까지 했다 — 못 다루는 게 아니라 필요가 없다."},
      {text:"괄호를 넣으면 트리의 높이가 두 배가 되어서",correct:false,mc:"height-myth",fb:"효율 문제가 아니다 — 순서 정보가 이미 모양에 있다."}]},
    /* --- 코드 검증 (빈칸 · 버그 · Parsons) --- */
    {id:"P13", unit:"A", stem:'중위 순회의 <b>빈칸</b>에 들어갈 문장은?', mono:true,
     code:["void inorder(tree_pointer ptr) {","    if (ptr) {","        ____ ;","        printf(\"%c \", ptr->data);","        inorder(ptr->right_child);","    }","}"],
     okfb:'중위는 L → V → R — V(printf) 앞의 빈칸은 왼쪽 서브트리 재귀다.',
     choices:[
      {text:"inorder(ptr->left_child)",correct:true},
      {text:"inorder(ptr->right_child)",correct:false,mc:"lr-swap",fb:"오른쪽은 이미 printf 뒤에 있다 — 앞자리는 왼쪽의 몫이다."},
      {text:"printf(\"%c \", ptr->data)",correct:false,mc:"double-visit",fb:"출력이 두 번이 된다 — V는 한 번, 가운데 자리다."},
      {text:"inorder(ptr)",correct:false,mc:"self-loop",fb:"자기 자신을 그대로 다시 부르면 같은 자리를 맴도는 무한 재귀다."}]},
    {id:"P14", unit:"A", stem:'아래 함수는 <b>전위 순회</b>라고 이름 붙었지만 <b>버그</b>가 있다. 무엇이 문제인가?', mono:true,
     code:["void preorder(tree_pointer ptr) {","    if (ptr) {","        preorder(ptr->left_child);","        printf(\"%c \", ptr->data);","        preorder(ptr->right_child);","    }","}"],
     okfb:'printf가 가운데(LVR) — 이름은 전위인데 몸은 중위다. 전위라면 printf가 맨 앞이어야 한다.',
     choices:[
      {text:"printf가 가운데라 실제로는 중위 순회다",correct:true},
      {text:"if (ptr) 검사가 빠져 무한 재귀에 빠진다",correct:false,mc:"base-miss",fb:"if (ptr)는 잘 있다 — 문제는 V의 자리다."},
      {text:"왼쪽과 오른쪽 재귀 호출이 서로 뒤바뀌어 있다",correct:false,mc:"lr-swap",fb:"왼쪽이 먼저다 — 재귀 순서는 옳고, printf의 위치가 틀렸다."},
      {text:"버그가 아니다 — 전위 순회로 잘 동작한다",correct:false,mc:"no-bug-myth",fb:"전위라면 도착 즉시 출력해야 한다 — 이 코드는 왼쪽을 먼저 끝낸다."}]},
    {id:"P15", unit:"B", ptype:"parsons", stem:'반복 중위 순회 <span class="mono">iter_inorder</span>의 <b>바깥 루프 몸통</b>을 올바른 순서로 조립하라. (함수 선언은 생략 — 쌓고 → 꺼내고 → 끝 검사 → 방문 → 오른쪽)', mono:true,
     lines:["for (;;) {","    for (; node; node = node->left_child)","        push(node);","    node = pop();","    if (!node) break;","    printf(\"%c \", node->data);","    node = node->right_child;","}"],
     okfb:'왼쪽 내리막을 전부 쌓고 → pop → 빈 스택이면 끝 → 이제서야 방문 → 오른쪽으로. 각 줄의 자리가 전부 의미로 강제된다.',
     fb:"뼈대부터 — 바깥 for(;;), 왼쪽으로 쌓는 안쪽 for, pop, 빈 스택 검사, 방문, 오른쪽 이동. printf가 pop보다 앞서면 꺼내지도 않은 노드를 찍게 된다."}
  ]
};
