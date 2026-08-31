"use strict";
/* 챕터 2 데이터 — "스택과 큐" = 3주차 (강의 3장 · 제작 규약 v1.1 · 주간 루프 공용 러너 사용)
   연산명은 표준(push/pop/enqueue/dequeue), 교재 명칭(add/delete/addq/deleteq) 병기. */
const CH02 = {
  meta: { id:"ch02", week:3, title:"스택과 큐", sub:"쌓는 통, 늘어서는 줄", nextTeaser:"스택이 계산기가 되는 법", nextHint:'교수님이 다음 주엔 컴퓨터가 수식을 뒤집어 읽는 법을 가르친대요. 식을 뒤집는다니, 무슨 소리죠?' },
  economy: { payPerPoint:1000, aplusBonus:200000 },
  exam: { unitPts:20, tutorPts:10, passLine:54 },   /* 3유닛 × 20 + 과외 30 = 90 만점 */
  apGen: "AP2",

  intro: [
    {who:"도윤", face:"doyun", text:'쌤, 이번 주는 <b>스택이랑 큐</b>래요. 어? 이거 쌤이 면접 때 "다음 시간에 배운다"던 그거잖아요. (씩 웃으며) 드디어 그 <b>다음 시간</b>이네요?'},
    {who:"도윤", face:"doyun-worried", text:'교수님이 칠판에 <span class="mono">top</span>이니 <span class="mono">front</span>니 화살표를 잔뜩 그리던데… <b>다음 주 월요일 쪽지시험</b>이에요. 수요일 과외 때까지 부탁해요.'},
    {who:"나", face:"me-awkward", text:'<span class="inner">…그 질문이 기어이 돌아왔다. 접시 쌓기랑 줄 서기 — 이름이야 익숙하지만, 이번엔 <b>코드까지</b> 알아야 한다. 월요일 밤, 책부터 펴자. (제5조: "다음 시간에"는 이제 못 쓴다)</span>'}
  ],

  flow: ["study-A","trial-A","il-A","study-B","trial-B","il-B","tutor","study-C","mission","trial-C","il-C","saturday","sunday"],
  cpl: {
    "study-A":"3주차 · 월 — 스택 자습","trial-A":"3주차 · 월 — 스택 시련","il-A":"3주차 · 월요일 밤",
    "study-B":"3주차 · 화 — 큐 자습","trial-B":"3주차 · 화 — 큐 시련","il-B":"3주차 · 화요일 밤",
    "tutor":"3주차 · 수 — 과외",
    "study-C":"3주차 · 목 — 원형 큐 자습","mission":"3주차 · 목 — 조작 미션","trial-C":"3주차 · 목 — 원형 큐 시련","il-C":"3주차 · 목요일 밤",
    "saturday":"3주차 · 토 — 보충/A+","sunday":"3주차 · 월 — 쪽지시험"
  },

  trials: {
    A:{gen:"G6", label:"스택 시뮬레이터", doneLabel:"유닛 A 숙달 ▶"},
    B:{gen:"G7", label:"큐 시뮬레이터", doneLabel:"유닛 B 숙달 ▶"},
    C:{gen:"G8", label:"원형 큐", doneLabel:"유닛 C 숙달 ▶"}
  },
  ilNext: { A:"화요일 밤 — 유닛 B ▶", B:"수요일 — 과외 ▶", C:"토요일 ▶" },
  tutorNextLabel:"목요일 밤 — 유닛 C ▶",
  tutorPassMsg:'오늘 좀 풀렸어요. 특히 그 "한 칸 앞" 얘기… 시험에 나오면 쓸 수 있겠어요.',

  /* ================= 자습 ================= */
  study: {
    A: { day:"월요일", label:"유닛 A", title:"스택 (stack)", doneLabel:"시련 — 스택 시뮬레이터 ▶", beats:[
      {say:'접시 쌓기, 프링글스 통 — 이름은 안다. 오늘은 그 <b>통 안의 기계장치</b>를 뜯는다.', mood:"awkward"},
      {who:"book", say:'"스택은 <b>톱(top)이라고 하는 한 끝에서 모든 삽입과 삭제가 일어나는 순서 리스트</b>다. 나중에 넣은 것이 먼저 나온다 — 후입 선출(last-in-first-out: <b>LIFO</b>)."'},
      {who:"book", say:'"원소 A, B, C, D, E를 순서대로 삽입하면 이렇게 쌓인다. 화살표(top)는 언제나 <b>맨 위</b>를 가리킨다."',
       viz:{type:"stack",cells:["A","B","C","D","E"],top:4,max:6}},
      {say:'넣는 곳도, 빼는 곳도 top 하나뿐. 그래서 규칙이 딱 하나로 정해지는구나 — 나중 것이 먼저.'},
      {who:"book", say:'"구현은 1차원 배열이다. 최하위 원소는 stack[0], 변수 <b>top</b>은 최상위 원소의 인덱스. <b>초기값 top = -1 이 곧 공백 스택</b>이다."',
       code:["#define MAX_STACK_SIZE 100","typedef struct {","    int key;","    /* 다른 필드 */","} element;","element stack[MAX_STACK_SIZE];","int top = -1;   /* 비어 있음 */"]},
      {gate:{id:"c2-g-typedef", book:"c-typedef", q:'잠깐 — <span class="mono">typedef struct</span>… 지난주에 봤는데, 확실히 기억나나?', basics:[
        {who:"book", say:'"typedef struct { … } element; — 구조체에 <b>element라는 별칭</b>을 붙인 것이다. 이제 element 한 단어로 이 구조체 타입을 쓸 수 있다. (2주차 유닛 C)"'},
        {say:'아, 그 별칭. int처럼 쓸 수 있게 이름을 만들어 둔 거였지.'}
      ]}},
      {who:"book", say:'"<b>삽입 — push</b>. (이 책은 함수 이름을 add라고 쓰지만, 표준 명칭은 push다 — 같은 함수다.)"',
       code:["void push(int *top, element item) {","    if (*top >= MAX_STACK_SIZE - 1) {","        stack_full();   /* 가득 참 — 오류 처리 */","        return;","    }","    stack[++*top] = item;   /* top을 먼저 올리고, 그 자리에 저장 */","}"]},
      {who:"book", say:'"한 줄씩 보자. <span class="mono">if (*top >= MAX_STACK_SIZE - 1)</span> — 유효한 칸은 0부터 MAX-1까지이므로, top이 이미 <b>마지막 칸(MAX-1)</b>이면 더 넣을 곳이 없다. (지난주의 배열 경계와 같은 이야기다.)"'},
      {gate:{id:"c2-g-incr", book:"c-op", q:'그런데 <span class="mono">++*top</span>… 전위(++x)와 후위(x++)의 차이, 확실히 아나?', basics:[
        {who:"book", say:'"<b>++x는 먼저 올리고 그 값을 쓴다. x++는 지금 값을 쓰고 나서 올린다.</b> top이 -1일 때 — stack[++top]은 top을 0으로 만든 뒤 stack[0]에 접근하지만, stack[top++]라면 stack[-1]— 배열 밖!— 에 접근하고 만다. 한 글자 차이가 사고를 부른다."'},
        {say:'순서구나. 먼저 바꾸느냐, 쓰고 나서 바꾸느냐. push는 반드시 <b>먼저 올려야</b> 새 칸에 들어간다.'}
      ]}},
      {who:"book", say:'"손으로 확인하자. top = -1인 공백 스택에 push(7): ++*top으로 top이 0이 되고, stack[0]에 7이 놓인다. 이어서 push(2): top이 1, stack[1]에 2."',
       viz:{type:"stack",cells:[7,2],top:1,max:5}},
      {check:{id:"c2A-1", stem:'top = -1 인 공백 스택에 push를 <b>두 번</b> 하면, top의 값은?', mono:true,
        okfb:'push 한 번마다 ++*top — -1 → 0 → 1. 원소가 2개면 top은 1이다.',
        choices:[
          {text:"1",correct:true},
          {text:"2",correct:false,mc:"count-vs-index",fb:"top은 원소의 '개수'가 아니라 맨 위 원소의 '인덱스'다."},
          {text:"0",correct:false,mc:"count-off",fb:"push가 두 번이다 — 한 번마다 top이 한 칸씩 오른다."},
          {text:"-1",correct:false,mc:"init-fix",fb:"-1은 공백일 때의 값이다."}]}},
      {who:"book", say:'"<b>삭제 — pop</b>. (교재 함수명은 delete.)"',
       code:["element pop(int *top) {","    /* stack의 최상위 원소를 반환 */","    if (*top == -1) {","        return stack_empty();   /* 공백 — 오류 key를 반환 */","    }","    return stack[(*top)--];     /* 지금 자리의 값을 주고, top을 내림 */","}"]},
      {who:"book", say:'"<span class="mono">stack[(*top)--]</span>는 <b>후위 감소</b>다 — 지금 top 자리의 값을 <b>먼저 반환</b>하고, 그 다음에 top이 1 내려간다. push의 전위 증가(++*top)와 정확히 <b>대칭</b>이다: 넣을 땐 먼저 올리고 넣고, 뺄 땐 먼저 주고 내린다."'},
      {check:{id:"c2A-2", stem:'pop이 하는 일의 <b>순서</b>로 옳은 것은?',
        okfb:'후위 감소 — stack[top]의 값을 먼저 반환하고, 그 다음 top이 내려간다.',
        choices:[
          {text:"stack[top]의 값을 반환한 뒤, top을 1 줄인다",correct:true},
          {text:"top을 1 줄인 뒤, stack[top]의 값을 반환한다",correct:false,mc:"pre-post",fb:"(*top)-- 는 후위다 — 무엇이 먼저인지가 이 코드의 핵심이다."},
          {text:"stack[0]의 값을 반환한다",correct:false,mc:"bottom-confusion",fb:"스택의 출구는 아래가 아니라 위(top)다."},
          {text:"top의 값(인덱스)을 반환한다",correct:false,mc:"index-value",fb:"반환하는 것은 인덱스가 아니라 그 자리에 저장된 원소다."}]}},
      {who:"book", say:'"스택이 있는 곳 — 문서 편집기의 실행 취소, 브라우저의 뒤로 가기, 그리고 <b>함수 호출</b>: 마지막에 호출된 함수가 먼저 끝나 돌아온다. 그리고 <b>미로에서 갔던 길을 기억하는 것</b>도 스택이다 — 막히면 pop이 곧 한 걸음 되돌아가기. (다음 장에서 직접 해 본다)"'},
      {check:{id:"c2A-3", stem:'push의 포화 검사가 <span class="mono">*top >= MAX_STACK_SIZE-1</span> 인 이유는?', mono:true,
        okfb:'유효한 인덱스는 0 ~ MAX-1 — top이 마지막 유효 칸에 도달했으면 가득이다.',
        choices:[
          {text:"유효한 인덱스가 0부터 MAX_STACK_SIZE-1까지이기 때문",correct:true},
          {text:"가득/공백 구별용으로 한 칸을 항상 비워 두어야 하기 때문",correct:false,mc:"circular-mix",fb:"한 칸을 남기는 건 '원형 큐'의 사정이다 — 스택은 끝까지 쓴다."},
          {text:"top이 0이 아니라 -1에서 시작하도록 정했기 때문",correct:false,mc:"init-mix",fb:"시작값과 포화 조건은 별개다 — 마지막 '유효 칸'이 어디인지를 보라."},
          {text:"특별한 이유는 없고 교재 코드의 관례이기 때문",correct:false,mc:"no-reason",fb:"모든 경계에는 이유가 있다 — 배열의 칸 번호를 세어 보라."}]}},
      {say:'push는 먼저 올리고 넣는다, pop은 먼저 주고 내린다. …좋아, 통의 기계장치를 봤다. 몸에 붙이러 가자.', mood:"proud"}
    ]},

    B: { day:"화요일", label:"유닛 B", title:"큐 (queue)", doneLabel:"시련 — 큐 시뮬레이터 ▶", beats:[
      {say:'어제는 한 끝만 쓰는 통이었다. 오늘은 <b>두 끝을 쓰는 줄</b> — 은행 대기줄의 기계장치.'},
      {who:"book", say:'"큐는 <b>한쪽 끝(rear)에서 삽입되고, 그 반대쪽 끝(front)에서 삭제가 일어나는 순서 리스트</b>다. 먼저 온 것이 먼저 나간다 — 선입 선출(first-in-first-out: <b>FIFO</b>)."'},
      {who:"book", say:'"A, B, C, D를 순서대로 삽입하면 — 제일 먼저 삭제되는 원소는 <b>A</b>다."',
       viz:{type:"queue",slots:["A","B","C","D",null],front:-1,rear:3,max:5}},
      {who:"book", say:'"구현은 배열 하나와 변수 <b>둘</b> — front와 rear. <b>초기값은 둘 다 -1</b>이다."',
       code:["#define MAX_QUEUE_SIZE 100","element queue[MAX_QUEUE_SIZE];","int rear = -1;","int front = -1;   /* front == rear → 공백 */"]},
      {who:"book", say:'"<b>삽입 — enqueue</b>. (교재 함수명은 add.) 어제의 push와 같은 <b>전위 증가</b> 패턴이다 — rear를 먼저 올리고, 그 자리에 넣는다."',
       code:["void enqueue(int *rear, element item) {","    if (*rear == MAX_QUEUE_SIZE - 1) {","        queue_full();","        return;","    }","    queue[++*rear] = item;   /* rear를 올리고, 그 자리에 저장 */","}"]},
      {who:"book", say:'"<b>삭제 — dequeue</b>. (교재 함수명은 deleteq.)"',
       code:["element dequeue(int *front, int *rear) {","    /* queue의 앞에서 원소를 삭제 */","    if (*front == *rear) {","        return queue_empty();   /* 공백 — 오류 key를 반환 */","    }","    return queue[++*front];     /* front를 올리고, 그 자리의 값을 반환 */","}"]},
      {who:"book", say:'"여기서 중요한 습관 하나 — dequeue는 <b>front를 먼저 올리고 그 자리의 값을 반환</b>한다. 그래서 front는 평소에 <b>첫 원소가 아니라, 첫 원소의 한 칸 앞</b>(방금 나간 자리)을 가리킨다. 이 습관은 내일 원형 큐에서 그대로 이어진다 — 기억해 두자."'},
      {say:'front가 가리키는 칸은 이미 <b>비운 자리</b>구나. 진짜 첫 손님은 front 바로 다음 칸.', mood:"proud"},
      {check:{id:"c2B-1", stem:'front = -1, rear = 2 (J1, J2, J3 저장). dequeue를 한 번 하면?', mono:true,
        okfb:'++*front로 front가 0이 되고, queue[0] = J1이 반환된다 — 먼저 온 순서.',
        choices:[
          {text:"front가 0이 되고 J1이 반환된다",correct:true},
          {text:"front가 0이 되고 J2가 반환된다",correct:false,mc:"front-off",fb:"front를 올린 '그 자리'의 값을 반환한다 — 0번 칸에는 무엇이 있나."},
          {text:"front는 그대로, J1이 반환된다",correct:false,mc:"front-static",fb:"dequeue가 일어날 때마다 front도 움직인다."},
          {text:"J3이 반환된다",correct:false,mc:"lifo-confusion",fb:"마지막에 넣은 것부터 나오는 건 스택이다."}]}},
      {who:"book", say:'"큐의 가장 보편적인 이용 — <b>작업 스케줄링(job scheduling)</b>. O/S가 우선순위를 사용하지 않는다면, 작업은 시스템에 들어간 <b>순서대로</b> 처리된다. 표로 따라가 보자."',
       table:'<table class="trip"><tr><th>front</th><th>rear</th><th>Q[0]</th><th>Q[1]</th><th>Q[2]</th><th>Q[3]</th><th>설명</th></tr><tr><td>-1</td><td>-1</td><td></td><td></td><td></td><td></td><td>공백 큐</td></tr><tr><td>-1</td><td>0</td><td>J1</td><td></td><td></td><td></td><td>Job 1 삽입</td></tr><tr><td>-1</td><td>1</td><td>J1</td><td>J2</td><td></td><td></td><td>Job 2 삽입</td></tr><tr><td>-1</td><td>2</td><td>J1</td><td>J2</td><td>J3</td><td></td><td>Job 3 삽입</td></tr><tr><td>0</td><td>2</td><td></td><td>J2</td><td>J3</td><td></td><td>Job 1 삭제</td></tr><tr><td>1</td><td>2</td><td></td><td></td><td>J3</td><td></td><td>Job 2 삭제</td></tr></table>'},
      {check:{id:"c2B-2", stem:'위 표의 마지막 상태(front=1, rear=2)에서 dequeue를 한 번 더 하면, 그 다음 행은?', mono:true,
        okfb:'front가 2로 올라가 J3이 반환된다 — 이제 front == rear, 큐는 공백이다.',
        choices:[
          {text:"front=2, rear=2 — J3 반환, 공백 큐",correct:true},
          {text:"front=1, rear=1 — J3 반환, 공백 큐",correct:false,mc:"rear-misuse",fb:"삭제는 front의 일이다 — rear는 삽입 때만 움직인다."},
          {text:"front=2, rear=2 — J2 반환, 공백 큐",correct:false,mc:"order-off",fb:"J2는 이미 나갔다 — 표의 이전 행을 보라."},
          {text:"빈 큐이므로 queue_empty()가 호출된다",correct:false,mc:"boundary",fb:"아직 J3이 남아 있다 — 공백 조건은 front == rear."}]}},
      {who:"book", say:'"그런데 이 방식엔 문제가 있다 — 삽입·삭제를 반복하면 큐가 <b>점차 오른쪽으로 이동</b>한다. rear가 MAX-1에 닿으면, <b>앞이 텅 비어 있어도</b> 포화 판정이 난다."',
       viz:{type:"queue",slots:[null,null,null,"J4","J5"],front:2,rear:4,max:5,usedUpto:2}},
      {who:"book", say:'"이때 queue_full()이 하는 일은 <b>전체를 왼쪽으로 이동</b>시켜 첫 원소를 q[0]에 놓고 front를 -1로 되돌리는 것 — 그런데 <b>배열 이동은 시간이 많이 드는 작업</b>이다. 원소가 많을수록 이사 비용이 커진다. …원형 큐가 이를 해결한다. (내일)"'},
      {check:{id:"c2B-3", stem:'선형 큐에서 rear == MAX-1인데 앞쪽 칸들이 비어 있다. 교재의 queue_full()이 하는 일은?', mono:true,
        okfb:'전체를 왼쪽으로 이동시켜 첫 원소를 q[0]으로 — 하지만 이동은 비싸다. 그래서 원형 큐.',
        choices:[
          {text:"전체를 왼쪽으로 이동시켜 첫 원소를 q[0]에 놓는다",correct:true},
          {text:"rear를 0으로 되돌려 앞의 빈 칸에 이어서 넣는다",correct:false,mc:"circular-preview",fb:"그 발상이 바로 내일 배울 '원형 큐'다 — 선형 큐의 queue_full은 다르게 움직인다."},
          {text:"더 넣을 수 없다는 오류만 내고 즉시 종료한다",correct:false,mc:"no-role",fb:"빈 칸이 있는데 끝내는 건 아깝다 — queue_full에는 역할이 있다."},
          {text:"배열을 두 배 크기로 늘려 뒤쪽에 이어 붙인다",correct:false,mc:"realloc-mix",fb:"크기는 MAX_QUEUE_SIZE로 고정이다 — 교재의 방법이 아니다."}]}},
      {say:'줄 전체가 슬금슬금 오른쪽으로… 이사는 비싸다. 내일은 <b>회전</b>이다.'},
      {who:"book", say:'"큐를 덮기 전에, 변형 하나를 이름과 함께 알아 두라 — <b>덱(deque, double-ended queue)</b>. 이름 그대로 <b>양쪽 끝 모두에서 삽입과 삭제가 가능한</b> 큐다. 스택은 한쪽 끝만 쓰고, 큐는 넣는 끝과 빼는 끝이 하나씩 — 덱은 그 제한을 모두 푼 것이라, 한쪽 끝만 쓰면 스택처럼, 양 끝을 하나씩 쓰면 큐처럼 움직인다."'},
      {say:'스택과 큐의 규칙을 다 품는 일반형이 덱이라는 거네. 이름만 보고 놀라지 말자 — <b>양쪽 끝, 그게 전부다.</b>'}
    ]},

    C: { day:"목요일", label:"유닛 C", title:"원형 큐 (circular queue)", doneLabel:"조작 미션 ▶", beats:[
      {say:'이사(배열 이동)는 비싸다 — 그러면 줄을 옮기지 말고, <b>끝과 처음을 이어 붙이면</b> 어떨까. 시계처럼.'},
      {who:"book", say:'"배열 queue[MAX_QUEUE_SIZE]를 <b>원형으로 취급</b>한다. 이번에는 <b>front와 rear의 초기값이 0</b>이다. front는 <b>큐의 첫 원소로부터 시계 반대방향으로 하나 앞</b> 위치 — 어제 배운 \'한 칸 앞\' 습관 그대로다. rear는 큐의 현재 끝."',
       viz:{type:"circ",max:5,front:0,rear:0,vals:{}}},
      {who:"book", say:'"<b>front == rear 는 공백 상태</b>다. (지금 그림이 그렇다 — 둘 다 0)"'},
      {gate:{id:"c2-g-mod", book:"c-op", q:'회전에는 <b>% (모듈로)</b> 연산이 쓰인다 — 나머지 연산, 확실하나?', basics:[
        {who:"book", say:'"a % b 는 a를 b로 나눈 <b>나머지</b>다. 7 % 5 = 2. 그리고 <b>(4+1) % 5 = 0</b> — 4 다음이 0으로 돌아온다. 이것이 \'원형\'의 정체다."'},
        {say:'나머지가 시계를 만드는구나. 끝(4)의 다음이 처음(0).'}
      ]}},
      {who:"book", say:'"원형 회전 — 모듈로 한 줄이면 된다."',
       code:["*rear  = (*rear + 1) % MAX_QUEUE_SIZE;","*front = (*front + 1) % MAX_QUEUE_SIZE;"]},
      {who:"book", say:'"<b>원형 큐의 삽입 — enqueue</b>. (교재 함수명은 addq.) 순서에 주목: <b>rear를 먼저 회전</b>시키고, 그 다음 포화를 검사한다."',
       code:["void enqueue(int *front, int *rear, element item) {","    *rear = (*rear + 1) % MAX_QUEUE_SIZE;   /* ① 회전 먼저 */","    if (*front == *rear) {                  /* ② 그 다음 검사 */","        queue_full(rear);   /* rear를 되돌리고 오류 출력 */","        return;","    }","    queue[*rear] = item;                    /* ③ 저장 */","}"]},
      {who:"book", say:'"<b>원형 큐의 삭제 — dequeue</b>. (교재 함수명은 deleteq.) 이쪽은 반대로 <b>검사가 먼저</b>다 — 공백이면 아무것도 바꾸지 않고 오류를 돌려줘야 하니까. 그 다음 front를 회전시키고, 그 자리의 값을 반환한다."',
       code:["element dequeue(int *front, int *rear) {","    if (*front == *rear) {                   /* ① 검사 먼저 */","        return queue_empty();","    }","    *front = (*front + 1) % MAX_QUEUE_SIZE;  /* ② 회전 */","    return queue[*front];                    /* ③ 반환 */","}"]},
      {check:{id:"c2C-2", stem:'MAX_QUEUE_SIZE = 5, rear = 4. enqueue의 1단계(회전) 후 rear는?', mono:true,
        okfb:'(4+1) % 5 = 0 — 끝의 다음은 처음이다.',
        choices:[
          {text:"0",correct:true},
          {text:"5",correct:false,mc:"no-modulo",fb:"배열에 5번 칸은 없다 — % 가 하는 일을 떠올려라."},
          {text:"4",correct:false,mc:"no-rotate",fb:"enqueue는 rear를 회전시키는 것부터 시작한다."},
          {text:"1",correct:false,mc:"calc-slip",fb:"(rear + 1) % MAX — 숫자를 그대로 넣어 보라."}]}},
      {who:"book", say:'"이제 곤란한 질문 하나. 계속 넣어서 <b>다 채우면</b> 어떻게 될까? 마지막 남은 한 칸까지 채우는 순간, rear가 front를 따라잡아 <b>front == rear</b> — 그런데 이 조건은 방금 \'공백\'이라고 했다. <b>가득 참과 텅 빔을 구별할 수 없게 된다.</b>"',
       viz:{type:"circ",max:5,front:0,rear:4,vals:{1:"J1",2:"J2",3:"J3",4:"J4"}}},
      {who:"book", say:'"그래서 원형 큐의 선택은 — <b>한 칸을 희생한다</b>. 저 그림처럼 <b>최대 MAX_QUEUE_SIZE-1개</b>까지만 저장하고, front 자리는 항상 비워 둔다. 하나 더 넣으려는 순간 회전된 rear가 front와 같아지므로, 그때 queue_full을 부르면 된다 — 빈 한 칸이 \'가득\'의 신호등이다."'},
      {check:{id:"c2C-1", stem:'MAX_QUEUE_SIZE = 5 인 원형 큐가 실제로 저장할 수 있는 최대 원소 수는?', mono:true,
        okfb:'한 칸은 가득/텅 빔을 구별하는 신호용 — MAX-1 = 4개까지다.',
        choices:[
          {text:"4",correct:true},
          {text:"5",correct:false,mc:"capacity",fb:"다 채우면 front==rear — 공백과 구별할 수 없게 된다."},
          {text:"3",correct:false,mc:"over-sacrifice",fb:"희생하는 칸은 하나면 충분하다."},
          {text:"제한 없다",correct:false,mc:"unbounded",fb:"배열 크기는 고정이다 — 원형은 '재사용'이지 '무한'이 아니다."}]}},
      {who:"book", say:'"교재의 주의 사항 — enqueue의 포화 검사와 dequeue의 공백 검사가 <b>같은 조건(front == rear)</b>이라 이상해 보이지만: enqueue 쪽은 <b>회전을 먼저 한 뒤</b>의 비교라서, 그 순간에도 첫 원소는 queue[front]가 아니라 한 칸 옆에 있다 — 실제로는 한 칸 여유가 있는 상태에서 미리 멈추는 것이다. <b>언제 front==rear가 되는가</b>가 두 상황을 가른다."'},
      {check:{id:"c2C-3", stem:'dequeue가 enqueue와 달리 <b>검사를 먼저</b> 하는 이유는?',
        okfb:'공백이면 front를 움직이지 않고 그대로 오류를 돌려줘야 한다 — 회전부터 하면 상태가 망가진다.',
        choices:[
          {text:"공백이면 상태를 바꾸지 않고 오류를 반환해야 하기 때문",correct:true},
          {text:"회전과 검사의 순서는 어느 쪽이 먼저든 상관없다",correct:false,mc:"order-blind",fb:"공백에서 front를 먼저 회전시키면 무슨 일이 벌어질지 상상해 보라."},
          {text:"회전보다 검사가 싸서, 먼저 하는 쪽이 더 빠르기 때문",correct:false,mc:"speed-reduction",fb:"속도가 아니라 '상태를 지키는' 문제다."},
          {text:"특별한 이유 없이 생긴 교재 코드의 오타다",correct:false,mc:"no-reason",fb:"두 함수의 순서 차이는 정확히 의도된 설계다."}]}},
      {say:'회전 먼저냐 검사 먼저냐 — 넣는 쪽과 빼는 쪽이 다르구나. 직접 돌려 보자.', mood:"proud"}
    ]}
  },

  hints: {
    A:["【개념】 스택 = top 한 끝에서만 삽입·삭제, LIFO. top은 맨 위 원소의 인덱스, 공백은 top = -1.",
       "【코드】 push는 stack[++*top]=item — 먼저 올리고 넣는다. pop은 return stack[(*top)--] — 먼저 주고 내린다.",
       "【추적】 연산 로그를 위에서부터: push마다 값을 쌓고, pop마다 맨 위를 지운다. 마지막에 남은 그림이 답의 근거다."],
    B:["【개념】 큐 = rear로 넣고 front로 뺀다, FIFO. 초기값 front = rear = -1, 공백 조건 front == rear.",
       "【front】 dequeue는 front를 먼저 올리고 그 자리 값을 반환 — 그래서 front는 '첫 원소의 한 칸 앞'이다.",
       "【추적】 enqueue 횟수 = rear의 위치, dequeue 횟수 = front의 위치. J번호는 넣은 순서 그대로 나온다."],
    C:["【개념】 원형 큐 — front, rear 초기 0. 회전은 (x+1) % MAX. front == rear는 공백.",
       "【용량】 최대 MAX-1개 — 한 칸은 가득/텅 빔 구별용. enqueue는 회전 먼저→검사, dequeue는 검사 먼저→회전.",
       "【추적】 enqueue 횟수만큼 rear가, dequeue 횟수만큼 front가 돈다 — 매번 % MAX를 잊지 말 것. k번째로 넣은 원소는 queue[k % MAX]에 있다."]
  },

  interludes: {
    A: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 프링글스 사 왔는데요. 왜 밑에서는 못 꺼내게 만들었을까요?'},
      {who:"나", face:"me", text:'(답장) 그게 오늘 내가 세 시간 공부한 내용이다. 통이 그렇게 생겼으면 규칙도 그렇게 생기는 거야. 자라.'}
    ],
    B: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤 내일 과외죠? 저 오늘 은행 갔는데 번호표 뽑고 40분 기다렸어요;;'},
      {who:"나", face:"me-proud", text:'(답장) 네 앞의 39명이 먼저 온 사람들이라 그렇다. 내일 그 얘기부터 하자 — FIFO.'}
    ],
    C: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 근데 게임 서버 대기열 8,000명은 대체 어디에 줄 서 있는 거예요?'},
      {who:"나", face:"me", text:'(답장) …그거 오늘 내가 돌린 원형 큐의 사촌일 확률이 높다. 대기열이 자리를 아껴 쓰는 비법, 오늘 배웠다.'}
    ]
  },

  tutorQs: [
    {id:"Q1", ask:'쌤, 그때 접시랑 줄이라고 하셨잖아요. 근데 컴퓨터 안에서는 둘 다 그냥 <b>배열</b>이라면서요 — 그럼 뭐가 다른 건데요?',
     choices:[
      {text:'"같은 배열이라도 넣고 빼는 규칙이 달라. 스택은 top 한 끝에서만, 큐는 rear로 넣고 front로 빼지. 자료구조는 \'어디서 넣고 빼는가\'의 약속이야."', correct:true, fb:'약속이 다르면 다른 구조다… 그럼 배열은 재료고, 스택이랑 큐는 요리법 같은 거네요?'},
      {text:'"스택 쪽 배열이 큐 쪽 배열보다 근본적으로 빨라. 한 끝만 쓰니까 관리가 단순하거든. 그래서 속도가 중요한 프로그램은 스택을, 여유 있게 담을 때는 큐를 쓰는 거야."', correct:false, mc:"speed-reduction", fb:'빠르고 느리고의 문제가 아니라던 게 쌤 입버릇이었는데요?'},
      {text:'"배열 크기가 달라. 스택은 작은 자료용이라 MAX를 짧게 잡고, 큐는 큰 자료용이라 길게 잡는 게 관례거든. 그 크기가 두 구조의 이름을 가르는 기준인 셈이지."', correct:false, mc:"size-confusion", fb:'둘 다 MAX 100이던데요? 코드 봤어요 저.'}]},
    {id:"Q2", ask:'근데 왜 스택은 변수가 <span class="mono">top</span> 하나로 되는데, 큐는 <span class="mono">front</span>랑 <span class="mono">rear</span> 둘씩이나 필요해요? 변수 아깝잖아요.',
     choices:[
      {text:'"스택은 넣는 곳과 빼는 곳이 같은 한 끝이라 top 하나면 충분해. 큐는 넣는 끝(rear)과 빼는 끝(front)이 서로 다르니까, 두 자리를 따로따로 기억해야 하는 거야."', correct:true, fb:'끝이 하나면 변수도 하나, 끝이 둘이면 변수도 둘… 구조가 변수 개수를 정하는 거네요.'},
      {text:'"큐가 스택보다 나중에 나온 더 중요한 구조라서 변수를 두 개 배정받은 거야. 중요한 구조일수록 관리 변수를 많이 두는 게 설계 관례거든. 그래서 교재도 큐를 더 뒤에 두는 거고."', correct:false, mc:"importance-myth", fb:'중요한 순서대로 변수 개수를 정해요? 그건 좀 이상한데요.'},
      {text:'"front는 사실 예비용이야. rear 하나만으로 넣고 빼는 건 전부 되는데, 혹시 rear가 고장 날 때를 대비해서 자리 하나를 더 기억해 두는 안전장치 같은 거지."', correct:false, mc:"front-useless", fb:'그럼 dequeue는 어디서 꺼내는데요? 코드에 ++*front 있던데요.'}]},
    {id:"Q3", boss:true, ask:'마지막이요. 책에서 선형 큐는 쓰다 보면 <b>오른쪽으로 계속 밀린다</b>던데 — 앞이 텅텅 비었는데도 "가득 찼다"고 한대요. 그거 좀 바보 같지 않아요?',
     choices:[
      {text:'"포화 검사가 rear만 보거든 — rear가 끝 칸에 닿으면 앞이 비어 있어도 가득으로 판정해. 빈 앞칸을 다시 쓰려면 전체를 왼쪽으로 옮겨야 하는데 그 이사가 비싸. 그래서 이걸 고치는 방법이 있는데… 내일 공부해서 알려줄게."', correct:true, fb:'…쌤, "내일 알려줄게" 그거 제5조 위반 아니에요? (웃음) 농담이에요 — 뭐가 문제인지는 확실히 알겠어요. 내일 기대할게요.'},
      {text:'"그건 이 교재가 잘못 만든 거야. 제대로 된 큐라면 빈 칸이 생기는 순간 알아서 앞으로 당겨 채우게 돼 있거든. 오래된 책이라 요즘 방식이 반영 안 된 거니까, 그 부분은 그냥 넘어가고 요즘 책으로 다시 보는 게 낫겠다."', correct:false, mc:"no-reason", fb:'또 교재 탓;; 지난번에도 그러다 저한테 혼나셨잖아요.'},
      {text:'"컴퓨터 메모리는 한 번 지나간 칸을 다시 못 쓰게 돼 있어. 배열 칸도 마찬가지라 한 번 비운 자리는 버리는 게 하드웨어의 규칙이야. 그래서 앞이 비어 있어도 가득이라고 하는 거지."', correct:false, mc:"hw-myth", fb:'2주차에서 배열 칸에 값 덮어쓰기 잘만 했잖아요? 규칙이라기엔 이상한데요.'}]}
  ],

  /* ================= 저작형 문항 풀 (21문) — 시련에 40% 혼합 ================= */
  pool: [
    /* --- 개념 --- */
    {id:"P01", unit:"A", stem:'스택에서 <b>모든 삽입과 삭제</b>가 일어나는 곳은?',
     okfb:'한 끝 — top. 그래서 LIFO가 된다.',
     choices:[{text:"top 한 곳",correct:true},{text:"양쪽 끝",correct:false,mc:"queue-mix",fb:"양끝을 쓰는 것은 큐다."},{text:"임의의 위치",correct:false,mc:"array-mix",fb:"아무 데나 넣을 수 있으면 그냥 배열이다."},{text:"bottom 한 곳",correct:false,mc:"bottom-confusion",fb:"아래쪽은 건드리지 않는다."}]},
    {id:"P02", unit:"A", stem:'공백 스택의 조건은?', mono:true,
     okfb:'top == -1 — 초기값이 곧 공백의 표시다.',
     choices:[{text:"top == -1",correct:true},{text:"top == 0",correct:false,mc:"zero-empty",fb:"top이 0이면 stack[0]에 원소가 하나 있는 상태다."},{text:"stack[0] == 0",correct:false,mc:"value-empty",fb:"저장된 값으로는 공백을 판정하지 않는다."},{text:"top == MAX_STACK_SIZE",correct:false,mc:"full-empty",fb:"그쪽은 포화와도 다르다 — 경계를 다시 보라."}]},
    {id:"P03", unit:"B", stem:'스택과 큐의 <b>공백 조건</b>을 짝지은 것으로 옳은 것은?', mono:true,
     okfb:'스택은 top == -1, 큐는 front == rear.',
     choices:[{text:"스택: top == -1 / 큐: front == rear",correct:true},{text:"스택: top == 0 / 큐: front == -1",correct:false,mc:"boundary",fb:"top 0은 원소 1개, front만으로는 공백을 모른다."},{text:"둘 다 front == rear",correct:false,mc:"term-mix",fb:"스택에는 front도 rear도 없다."},{text:"둘 다 top == -1",correct:false,mc:"term-mix",fb:"큐에는 top이 없다."}]},
    {id:"P04", unit:"B", stem:'큐의 정의로 옳은 것은?',
     okfb:'rear에서 삽입, front(반대쪽 끝)에서 삭제 — FIFO.',
     choices:[{text:"한쪽 끝에서 삽입되고 그 반대쪽 끝에서 삭제되는 순서 리스트",correct:true},{text:"top 한 끝에서 모든 삽입과 삭제가 일어나는 순서 리스트",correct:false,mc:"stack-mix",fb:"그건 스택의 정의다."},{text:"임의의 위치에서 삽입·삭제가 일어나는 리스트",correct:false,mc:"list-mix",fb:"자리가 자유로우면 큐의 규칙이 아니다."},{text:"항상 정렬 상태를 유지하는 리스트",correct:false,mc:"sort-mix",fb:"큐는 온 순서를 지킬 뿐, 크기 순이 아니다."}]},
    {id:"P05", unit:"C", stem:'선형 큐 대신 원형 큐를 쓰는 <b>이유</b>는?',
     okfb:'큐가 오른쪽으로 밀려나 생기는 비싼 "전체 이동"을, 회전(모듈로)으로 없애기 위해서다.',
     choices:[{text:"배열 전체를 왼쪽으로 옮기는 비싼 이동 작업을 없애려고",correct:true},{text:"같은 배열에 더 많은 원소를 저장할 수 있어서",correct:false,mc:"capacity",fb:"오히려 한 칸을 희생한다 — 용량이 목적이 아니다."},{text:"들어온 원소를 크기 순으로 자동 정렬하기 위해서",correct:false,mc:"sort-mix",fb:"순서 규칙은 그대로 FIFO다."},{text:"큐를 스택처럼도 쓸 수 있게 만들기 위해서",correct:false,mc:"stack-mix",fb:"원형이 되어도 큐는 큐다."}]},
    /* --- 코드 읽기 --- */
    {id:"P07", unit:"A", stem:'push의 저장 문장으로 옳은 것은?', mono:true,
     okfb:'전위 증가 — top을 먼저 올린 자리에 넣는다.',
     choices:[{text:"stack[++*top] = item;",correct:true},{text:"stack[(*top)++] = item;",correct:false,mc:"pre-post",fb:"후위라면 '지금 자리'에 덮어쓰고 나서 올라간다 — top=-1이면 stack[-1] 사고."},{text:"stack[*top] = item;",correct:false,mc:"no-advance",fb:"올리지 않으면 매번 같은 자리에 덮어쓴다."},{text:"stack[--*top] = item;",correct:false,mc:"direction",fb:"push는 위로 자란다."}]},
    {id:"P08", unit:"A", stem:'pop의 반환 문장으로 옳은 것은?', mono:true,
     okfb:'후위 감소 — 지금 자리 값을 주고 top을 내린다.',
     choices:[{text:"return stack[(*top)--];",correct:true},{text:"return stack[--*top];",correct:false,mc:"pre-post",fb:"전위라면 한 칸 내려간 자리의 값 — 엉뚱한 원소가 나온다."},{text:"return stack[*top]--;",correct:false,mc:"target",fb:"내려야 할 것은 저장된 값이 아니라 top이다."},{text:"return stack[*top - 1];",correct:false,mc:"no-update",fb:"값만 보고 top을 갱신하지 않으면 다음 pop이 틀어진다."}]},
    {id:"P09", unit:"A", stem:'<span class="mono">++x</span>와 <span class="mono">x++</span>의 차이로 옳은 것은?', mono:true,
     okfb:'전위는 먼저 바꾸고 쓰고, 후위는 쓰고 나서 바꾼다.',
     choices:[{text:"++x는 올린 값을 쓰고, x++는 올리기 전의 값을 쓴다",correct:true},{text:"++x가 x++보다 결과적으로 1만큼 더 크게 올린다",correct:false,mc:"amount",fb:"둘 다 1씩 올린다 — 다른 것은 '언제'다."},{text:"배열 인덱스 자리에는 x++ 쪽만 쓸 수 있다",correct:false,mc:"usage",fb:"둘 다 쓸 수 있다 — 결과가 다를 뿐."},{text:"완전히 같은 표현이라 아무 차이가 없다",correct:false,mc:"same",fb:"top=-1에서 stack[++top]과 stack[top++]를 비교해 보라."}]},
    {id:"P10", unit:"C", stem:'원형 큐의 enqueue(교재 addq)에서 <b>가장 먼저</b> 실행되는 문장은?', mono:true,
     okfb:'회전이 먼저다 — 옮겨 본 rear가 front와 같아지는지로 포화를 안다.',
     choices:[{text:"*rear = (*rear + 1) % MAX_QUEUE_SIZE;",correct:true},{text:"if (*front == *rear) { … }",correct:false,mc:"op-order",fb:"회전하기 전의 비교는 포화를 놓친다 — 순서를 코드에서 다시 보라."},{text:"queue[*rear] = item;",correct:false,mc:"op-order",fb:"자리를 먼저 정해야 넣을 수 있다."},{text:"*front = (*front + 1) % MAX_QUEUE_SIZE;",correct:false,mc:"front-misuse",fb:"삽입에서 front는 비교에만 쓰인다."}]},
    {id:"P11", unit:"C", stem:'원형 회전 <span class="mono">(*rear + 1) % MAX_QUEUE_SIZE</span> 에서 % 의 역할은?', mono:true,
     okfb:'MAX에 도달하는 순간 0으로 되돌린다 — 끝의 다음이 처음.',
     choices:[{text:"MAX에 닿으면 0으로 되돌려 배열을 원형으로 만든다",correct:true},{text:"rear가 커질수록 2배씩 빠르게 건너뛰게 한다",correct:false,mc:"op-meaning",fb:"% 는 나머지 연산이다."},{text:"회전 중 rear가 음수로 내려가는 것을 막아 준다",correct:false,mc:"op-meaning",fb:"+1만 하는데 음수가 나올 일은 없다 — 문제는 위쪽 경계다."},{text:"front와 rear의 값을 서로 맞바꾼다",correct:false,mc:"op-meaning",fb:"% 는 한 변수의 값만 다듬는다."}]},
    {id:"P12", unit:"B", stem:'선형 큐 dequeue의 반환 문장 <span class="mono">return queue[++*front];</span> — front를 <b>먼저 올리는</b> 이유는?', mono:true,
     okfb:'front는 첫 원소의 한 칸 앞 — 올린 자리가 곧 첫 원소다.',
     choices:[{text:"front는 '첫 원소의 한 칸 앞' — 올린 그 자리가 곧 꺼낼 원소이기 때문",correct:true},{text:"front를 올리지 않고 그대로 읽으면 배열 바깥의 쓰레기 값을 읽게 되기 때문",correct:false,mc:"bounds-mix",fb:"front 자리도 배열 안이다 — 다만 '이미 나간 자리'일 뿐."},{text:"삽입의 rear가 전위 증가라서 삭제도 똑같이 맞추기 위해",correct:false,mc:"symmetry",fb:"rear가 아니라 원소의 위치가 기준이다."},{text:"특별한 이유는 없고 교재가 택한 코드 관례일 뿐이다",correct:false,mc:"no-reason",fb:"front의 정의('한 칸 앞')와 정확히 맞물린 설계다."}]},
    /* --- 트레이스 --- */
    {id:"P13", unit:"A", stem:'공백 스택에 push(3), push(7), pop(), push(5)를 하면 스택은? (아래→위)', mono:true,
     okfb:'3, 7 쌓고 7이 나가고 5가 올라온다 — 아래부터 3, 5.',
     choices:[{text:"3, 5",correct:true},{text:"3, 7, 5",correct:false,mc:"no-remove",fb:"pop은 원소를 꺼내 없앤다."},{text:"5, 3",correct:false,mc:"stack-order",fb:"아래→위 순서다 — 먼저 push된 것이 아래."},{text:"7, 5",correct:false,mc:"pop-target",fb:"pop이 꺼낸 것은 그 순간의 top(7)이다 — 3은 아직 아래에 있다."}]},
    {id:"P14", unit:"B", stem:'공백 큐(front=rear=-1)에 enqueue J1, J2, J3 → dequeue 2회. 이제 front와 rear는?', mono:true,
     okfb:'rear는 2(삽입 3회), front는 1(삭제 2회) — J3 하나가 남았다.',
     choices:[{text:"front = 1, rear = 2",correct:true},{text:"front = 2, rear = 2",correct:false,mc:"count-off",fb:"dequeue는 두 번이었다."},{text:"front = -1, rear = 0",correct:false,mc:"shift-mix",fb:"선형 큐는 원소를 이동시키지 않는다(가득 차기 전까지는) — 변수만 움직인다."},{text:"front = 2, rear = 1",correct:false,mc:"swap",fb:"삽입이 rear, 삭제가 front다."}]},
    {id:"P15", unit:"C", stem:'MAX=5 원형 큐(front=rear=0)에 enqueue 4회 → dequeue 3회 → enqueue 3회. rear의 값은?', mono:true,
     okfb:'rear는 enqueue 7회만큼 회전 — 7 % 5 = 2.',
     choices:[{text:"2",correct:true},{text:"7",correct:false,mc:"no-modulo",fb:"5칸짜리 시계다 — 7시는 없다."},{text:"4",correct:false,mc:"count-off",fb:"enqueue는 총 7회였다."},{text:"3",correct:false,mc:"front-mix",fb:"3은 front 쪽 계산이다(dequeue 3회)."}]},
    /* --- 응용 --- */
    {id:"P19", unit:"A", stem:'브라우저의 "뒤로 가기"를 위해 방문한 페이지들을 저장한다면 알맞은 구조와 이유는?',
     okfb:'가장 최근 페이지부터 되돌아가야 한다 — LIFO, 스택.',
     choices:[{text:"스택 — 가장 최근에 본 페이지부터 되돌아가야 하므로",correct:true},{text:"큐 — 방문한 순서대로 보관해야 하므로",correct:false,mc:"fifo-misapply",fb:"뒤로 가기를 눌렀을 때 처음 방문한 페이지가 나오면 곤란하다."},{text:"배열 — 인덱스로 아무 페이지나 열 수 있으므로",correct:false,mc:"random-misapply",fb:"뒤로 가기는 '직전'만 필요하다 — 임의 접근이 목적이 아니다."},{text:"원형 큐 — 메모리를 아껴야 하므로",correct:false,mc:"tool-mix",fb:"구조 선택의 기준은 절약이 아니라 꺼내는 규칙이다."}]},
    {id:"P20", unit:"B", stem:'프린터 인쇄 대기열을 스택으로 만들면 생기는 일은?',
     okfb:'나중에 보낸 문서가 먼저 나온다 — 먼저 보낸 사람이 한없이 밀린다.',
     choices:[{text:"나중에 보낸 문서가 먼저 나와, 먼저 보낸 문서가 계속 밀린다",correct:true},{text:"한 끝만 관리하면 되니 대기열이 단순해져 인쇄가 빨라진다",correct:false,mc:"speed-reduction",fb:"구조는 순서를 정할 뿐, 프린터가 빨라지지 않는다."},{text:"꺼내는 규칙만 다를 뿐이라 실제로는 아무 문제 없다",correct:false,mc:"rule-blind",fb:"새 문서가 계속 들어오면 첫 문서는 영영 못 나올 수도 있다."},{text:"각 문서가 마지막 페이지부터 뒤집힌 채로 인쇄된다",correct:false,mc:"literal",fb:"페이지 내용이 아니라 '작업 순서'의 문제다."}]},
    {id:"P21", unit:"A", stem:'함수 호출-복귀가 <b>스택</b>으로 관리되는 이유는?',
     okfb:'마지막에 호출된 함수가 먼저 끝나 돌아온다 — LIFO 그 자체.',
     choices:[{text:"가장 나중에 호출된 함수가 가장 먼저 끝나 돌아오기 때문",correct:true},{text:"함수는 언제나 호출된 순서 그대로 차례차례 끝나기 때문",correct:false,mc:"fifo-misapply",fb:"main이 제일 먼저 시작하지만 제일 나중에 끝난다."},{text:"호출할 함수의 이름들을 미리 정렬해 두어야 하기 때문",correct:false,mc:"sort-mix",fb:"이름 순서는 아무 상관이 없다."},{text:"프로그램의 함수 개수가 컴파일 때 고정되기 때문",correct:false,mc:"size-mix",fb:"호출 깊이는 실행마다 달라진다."}]},
    {id:"P22", unit:"C", stem:'키보드 입력 버퍼처럼 "들어오는 대로, 들어온 순서대로, 고정 크기 안에서" 처리할 때 알맞은 구조는?',
     okfb:'고정 배열에서 순서를 지키며 재사용 — 원형 큐의 자리다.',
     choices:[{text:"원형 큐",correct:true},{text:"스택",correct:false,mc:"lifo-misapply",fb:"먼저 친 글자가 먼저 화면에 나와야 한다."},{text:"선형 큐",correct:false,mc:"shift-cost",fb:"오래 쓰면 오른쪽으로 밀린다 — 이동 비용이 계속 든다."},{text:"정렬된 배열",correct:false,mc:"sort-mix",fb:"입력을 크기 순으로 재배열하면 타자가 뒤죽박죽이 된다."}]},
    {id:"P24", unit:"A", stem:'미로에서 막다른 길을 만났을 때 스택으로 하는 일은?',
     okfb:'경로 스택에서 pop — 마지막 갈림길 쪽으로 한 걸음씩 되돌아간다(백트래킹).',
     choices:[{text:"pop으로 마지막 위치를 걷어내며 갈림길까지 되돌아간다",correct:true},{text:"스택을 전부 비우고 입구에서부터 다시 길을 찾는다",correct:false,mc:"restart",fb:"처음부터는 아깝다 — 갔던 길의 기억을 활용하라."},{text:"지금 서 있는 막다른 칸을 한 번 더 push한다",correct:false,mc:"push-misuse",fb:"이미 서 있는 칸은 스택의 톱에 있다 — 문제는 '되돌아가기'다."},{text:"벽(1)을 0으로 바꿔 길을 새로 뚫는다",correct:false,mc:"cheat",fb:"미로를 고치는 알고리즘은 없다."}]},
    {id:"P25", unit:"B", stem:'놀이공원 대기줄 — 손님이 줄 끝에 도착하는 것과 맨 앞 손님이 탑승하는 것을 큐 연산으로 옳게 짝지은 것은?',
     okfb:'도착은 rear에서 enqueue, 탑승은 front에서 dequeue — FIFO 그대로다.',
     choices:[{text:"도착 = enqueue(rear에 삽입), 탑승 = dequeue(front에서 삭제)",correct:true},{text:"도착 = dequeue(front에서 삭제), 탑승 = enqueue(rear에 삽입)",correct:false,mc:"swap",fb:"들어오는 쪽과 나가는 쪽이 뒤집혔다 — 줄 끝과 줄 앞을 다시 보라."},{text:"도착도 탑승도 push — 스택 하나로 충분하다",correct:false,mc:"lifo-misapply",fb:"스택이라면 방금 온 손님이 먼저 탄다 — 줄 선 보람이 없다."},{text:"도착 = enqueue, 탑승 = 줄 중간의 임의 위치에서 삭제",correct:false,mc:"random-misapply",fb:"큐의 삭제는 front 한 곳에서만 일어난다."}]},
    {id:"P26", unit:"C", stem:'MAX_QUEUE_SIZE = 4 인 원형 큐가 <b>가득 찼다</b>고 판정될 때, 실제 저장된 원소 수와 그 근거는?', mono:true,
     okfb:'MAX-1 = 3개 — 하나 더 넣으려고 rear를 회전시키는 순간 front와 같아진다.',
     choices:[{text:"3개 — 하나 더 넣으려는 순간 회전된 rear가 front와 같아진다",correct:true},{text:"4개 — 배열의 네 칸을 남김없이 모두 쓴다",correct:false,mc:"capacity",fb:"다 채우면 front==rear가 공백 조건과 겹친다 — 한 칸은 남긴다."},{text:"3개 — rear가 배열의 마지막 칸(MAX-1)에 닿았기 때문이다",correct:false,mc:"linear-mix",fb:"끝 칸 도달은 '선형 큐'의 포화다 — 원형은 위치가 아니라 front와의 관계로 판정한다."},{text:"2개 — 안전을 위해 두 칸을 항상 비워 둔다",correct:false,mc:"over-sacrifice",fb:"가득/텅 빔 구별에 희생하는 칸은 하나면 충분하다."}]},
    /* 코드 검증 보강 (2026-08-24) */
    {id:"P27", unit:"A", stem:'push 코드의 빈칸에 들어갈 것은?', mono:true,
     code:["void push(int *top, element item) {","    if (*top >= MAX_STACK_SIZE - 1) {","        stack_full(); return;","    }","    stack[________] = item;","}"],
     okfb:'++*top — 전위 증가: top을 먼저 1 올린 뒤 그 자리에 저장한다. (top=-1일 때 첫 push가 stack[0])',
     choices:[{text:"++*top",correct:true},{text:"(*top)++",correct:false,mc:"pre-post",fb:"후위라면 '지금 자리'에 저장하고 나서 올린다 — top=-1이면 stack[-1]에 쓴다."},{text:"*top",correct:false,mc:"no-incr",fb:"올리지 않으면 톱 자리를 덮어쓴다 — 새 칸이 필요하다."},{text:"*top + 1",correct:false,mc:"no-store",fb:"그 자리에 저장은 되지만 top 자신은 제자리 — 다음 push가 같은 칸을 또 쓴다."}]},
    {id:"P28", unit:"B", stem:'이 deleteq 코드에서 <b>잘못된 줄</b>은?', mono:true,
     code:["element deleteq(int *front, int *rear) {","    if (*front == *rear + 1)      /* ㉠ */","        return queue_empty();","    return queue[++*front];       /* ㉡ */","}"],
     okfb:'공백 조건은 front == rear 다 (㉠) — ㉡의 "front를 먼저 올리고 그 자리를 반환"은 올바르다.',
     choices:[{text:"㉠ — 공백 검사는 *front == *rear 여야 한다",correct:true},{text:"㉡ — ++*front가 아니라 (*front)++ 여야 한다",correct:false,mc:"pre-post",fb:"front는 첫 원소의 한 칸 앞 — 먼저 올리고 그 자리를 반환하는 것이 맞다."},{text:"㉠㉡ 둘 다 잘못되어 고쳐 써야 한다",correct:false,mc:"over-fix",fb:"㉡은 교재 코드 그대로다 — 잘못은 한 곳뿐이다."},{text:"잘못된 줄이 없다 — 그대로 동작한다",correct:false,mc:"no-bug",fb:"공백 큐(front==rear)에서 ㉠이 거짓이 되어, 없는 원소를 꺼내게 된다."}]},
    {id:"P29", unit:"C", ptype:"parsons", stem:'원형 큐의 삽입 addq — 코드를 <b>올바른 순서</b>로 조립하라. (회전과 검사의 순서가 핵심이다)', mono:true,
     lines:["void addq(int *front, int *rear, element item) {","    *rear = (*rear + 1) % MAX_QUEUE_SIZE;","    if (*front == *rear) { queue_full(rear); return; }","    queue[*rear] = item;"],
     okfb:'addq는 회전을 먼저 하고 검사한다 — 회전한 rear가 front와 만나면 포화. (deleteq는 반대로 검사 먼저)',
     fb:"addq의 리듬을 떠올려라 — 돌리고, 확인하고, 넣는다. 검사를 먼저 하면 '회전한 뒤의 자리'를 확인할 수 없다."},
  ],

  /* ================= 조작 미션 ================= */
  mission: { max:5, day:"목요일",
    intro:'MAX_QUEUE_SIZE = 5 인 원형 큐다 (front = rear = 0). enqueue와 dequeue를 직접 눌러 <b>정확히 가득(4개)</b> 상태를 만들어 보자. 넣고 빼는 동안 F와 R이 어떻게 도는지 지켜볼 것.' }
};
