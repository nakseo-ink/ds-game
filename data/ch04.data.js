"use strict";
/* 챕터 4 데이터 — "리스트" = 5주차 (강의 4장 · 제작 규약 v1.2 · 주간 루프 공용 러너 사용)
   순차 표현의 문제 → 포인터·malloc/free → 단순 연결 리스트(만들기·삽입) → 삭제·순회 → 이중 연결 원형 리스트. */
const CH04 = {
  meta: { id:"ch04", week:5, title:"리스트", sub:"흩어져도 이어진다", nextTeaser:"트리", nextHint:'교수님이 칠판에 <b>가계도</b>랑 <b>토너먼트 대진표</b>를 그리셨대요… 자료구조 수업 맞죠?' },
  economy: { payPerPoint:1000, aplusBonus:200000 },
  exam: { unitPts:15, tutorPts:10, passLine:54 },   /* 4유닛 × 15 + 과외 30 = 90 만점 */
  apGen: "AP4",

  intro: [
    {who:"도윤", face:"doyun", text:'쌤! 지난주에 그랬잖아요 — <b>다음 칸의 주소를 쪽지에 적어 두는 공책</b>. 교수님이 이번 주는 <b>리스트</b>래요. 그런데 공책 페이지가 <b>여기저기 흩어져</b> 있대요. 흩어져 있는데 어떻게 안 끊기고 이어져요?'},
    {who:"도윤", face:"doyun-worried", text:'그리고 배열 얘기하다가 갑자기 "이사 비용"이 어쩌고 하셨어요. 자료구조에 무슨 이사예요? …이번에도 <b>다음 주 월요일 쪽지시험</b>이에요. 수요일 과외 때까지 부탁해요.'},
    {who:"나", face:"me-awkward", text:'<span class="inner">흩어져 있는데 이어진다… 쪽지에 적힌 주소를 따라가면 되는 건가. 3주 내내 배열 위에서 놀았으니, 이번 주는 배열을 벗어나는 모양이다. 월요일 밤, 책부터 펴자.</span>'}
  ],

  flow: ["study-A","trial-A","il-A","study-B","trial-B","il-B","tutor","study-C","trial-C","il-C","study-D","trial-D","saturday","sunday"],
  cpl: {
    "study-A":"5주차 · 월 — 배열의 한계 자습","trial-A":"5주차 · 월 — 이사 비용 시련","il-A":"5주차 · 월요일 밤",
    "study-B":"5주차 · 화 — 연결 리스트 자습","trial-B":"5주차 · 화 — 삽입 시련","il-B":"5주차 · 화요일 밤",
    "tutor":"5주차 · 수 — 과외",
    "study-C":"5주차 · 목 — 삭제와 순회 자습","trial-C":"5주차 · 목 — 삭제 시련","il-C":"5주차 · 목요일 밤",
    "study-D":"5주차 · 금 — 이중 연결 자습","trial-D":"5주차 · 금 — 이중 연결 시련",
    "saturday":"5주차 · 토 — 보충/A+","sunday":"5주차 · 월 — 쪽지시험"
  },

  trials: {
    A:{gen:"G13", label:"이사 비용 계산", doneLabel:"유닛 A 숙달 ▶"},
    B:{gen:"G14", label:"연결 리스트 삽입", doneLabel:"유닛 B 숙달 ▶"},
    C:{gen:"G15", label:"연결 리스트 삭제", doneLabel:"유닛 C 숙달 ▶"},
    D:{gen:"G16", label:"이중 연결 원형", doneLabel:"유닛 D 숙달 ▶"}
  },
  ilNext: { A:"화요일 — 유닛 B ▶", B:"수요일 — 과외 ▶", C:"금요일 — 유닛 D ▶" },
  tutorNextLabel:"목요일 밤 — 유닛 C ▶",
  tutorPassMsg:'배열이 <b>이사</b>고 리스트가 <b>쪽지</b>라는 거, 오늘 완전히 이해했어요. 흩어져 있어도 주소만 있으면 이어지는 거네요.',

  /* ================= 자습 ================= */
  study: {
    A: { day:"월요일", label:"유닛 A", title:"배열의 한계와 연결 표현", doneLabel:"시련 — 이사 비용 계산 ▶", beats:[
      {say:'지난주엔 스택이 계산기가 됐다. 이번 주 책의 첫마디는 — <b>지금까지 만든 건 전부 배열 위였다</b>는 것.', mood:"awkward"},
      {who:"book", say:'"스택도, 큐도, 원형 큐도 — 모두 배열, 즉 <b>순차적 사상</b>이었다. 연속된 원소들이 기억장소에 <b>일정한 거리만큼 떨어져</b> 나란히 저장된다는 뜻이다. 그래서 스택은 톱 원소가 Loc<sub>top</sub>에 있으면 바로 밑 원소가 Loc<sub>top</sub>−c 에 있다고 말할 수 있었고, 원형 큐는 i번째 원소가 Loc<sub>i</sub>에 있으면 i+1번째가 (Loc<sub>i</sub>+c) % MAX_QUEUE_SIZE 에 있다고 말할 수 있었다. <b>주소가 계산되는 이유</b>는 나란히 있기 때문이다."'},
      {who:"book", say:'"나란함의 대가 — <b>임의의 원소에 대한 삽입과 삭제가 어렵다.</b> 단어 배열 <span class="mono">(bat, cat, sat, vat)</span> 을 사전 순서로 유지한다고 하자. mat를 삽입하려면? cat과 sat 사이가 자리다 — 그런데 그 자리는 <b>이미 sat이 쓰고 있다</b>. sat과 vat를 전부 한 칸씩 뒤로 밀어야 한다. cat을 삭제하면? 뒤의 원소들을 전부 한 칸씩 당겨야 한다."',
       table:'<table class="trip"><tr><th></th><th>[0]</th><th>[1]</th><th>[2]</th><th>[3]</th><th>[4]</th></tr><tr><td>삽입 전</td><td>bat</td><td>cat</td><td>sat</td><td>vat</td><td></td></tr><tr><td>mat 삽입</td><td>bat</td><td>cat</td><td><b>mat</b></td><td>sat→</td><td>vat→</td></tr></table>'},
      {say:'지난주 선형 큐가 떠오른다 — 앞이 비었는데도 전체를 왼쪽으로 <b>이동</b>시키는 게 시간이 많이 드는 작업이라고 했다. 배열의 이사 비용은 어디서나 같은 문제구나.'},
      {check:{id:"c4A-1", stem:'<span class="mono">(bat, cat, sat, vat)</span> 배열의 <b>맨 앞</b>에 ant를 삽입하려 한다. 한 칸씩 이동해야 하는 기존 원소는?', mono:true,
        okfb:'맨 앞 자리를 비우려면 bat부터 vat까지 4개 전부가 밀린다.',
        choices:[
          {text:"4개",correct:true},
          {text:"1개",correct:false,mc:"off-by-one",fb:"bat 하나만 밀면 cat 자리와 겹친다 — 연쇄적으로 전부 밀린다."},
          {text:"0개",correct:false,mc:"index-myth",fb:"맨 앞은 이미 bat의 자리다 — 비워 줘야 들어간다."},
          {text:"5개",correct:false,mc:"count-all",fb:"새로 들어오는 ant는 '이동'이 아니라 '입주'다."}]}},
      {who:"book", say:'"둘째 대가 — <b>기억 장소의 낭비</b>. 배열은 크기를 미리 정해야 하므로, 최대치를 예약해 두고 대부분을 놀리게 되기 쉽다. 셋째로 그 최대치를 넘으면 더 늘릴 수도 없다."'},
      {who:"book", say:'"해결은 <b>연결된(linked) 표현</b>이다. 각 원소들이 기억장소 내의 <b>어떤 곳에나</b> 위치할 수 있다. 그럼 순서는 누가 지키는가 — 각 원소마다 <b>다음 원소를 가리키는 주소</b>를 함께 저장한다. 리스트의 원소를 <b>노드(node)</b>, 다음 원소를 지시하는 포인터를 <b>링크(link)</b>라 부른다."'},
      {check:{id:"c4A-2", stem:'연결된 표현에서, 흩어져 있는 원소들이 <b>올바른 순서</b>를 유지하는 방법은?',
        okfb:'각 노드가 다음 노드의 주소(링크)를 함께 저장한다 — 주소를 따라가면 순서다.',
        choices:[
          {text:"각 노드가 다음 노드를 가리키는 링크를 함께 저장한다",correct:true},
          {text:"원소들을 기억장소에 주소 순서대로 나란히 배치해 둔다",correct:false,mc:"seq-myth",fb:"그건 순차적 사상 — 배열로 되돌아가는 길이다."},
          {text:"운영체제가 원소들의 순서를 표로 만들어 관리해 준다",correct:false,mc:"os-myth",fb:"순서는 자료구조 스스로 지킨다 — 노드 안의 링크가 그 장치다."},
          {text:"원소마다 1, 2, 3… 순서 번호를 붙여 두고 정렬해 쓴다",correct:false,mc:"index-myth",fb:"번호를 붙이면 삽입 때마다 뒷번호를 전부 고쳐야 한다 — 이사 비용의 재림이다."}]}},
      {gate:{id:"c4-g-ptr", q:'링크는 <b>포인터</b>다 — 2주차의 <span class="mono">&</span> 와 <span class="mono">*</span>, 확실히 기억하나?', basics:[
        {who:"book", say:'"<span class="mono">&</span> 는 <b>주소 연산자</b> — &i 는 변수 i의 주소다. <span class="mono">*</span> 는 <b>역참조(간접 지시) 연산자</b> — 포인터가 가리키는 곳의 값이다."',
         code:["int i, *pi;","pi = &i;    /* pi에 i의 주소를 저장 */","i = 10;     /* 직접 대입 — 아래와 같은 효과 */","*pi = 10;   /* pi가 가리키는 곳(i)에 10 저장 */"]},
        {say:'*pi = 10 은 pi를 바꾸는 게 아니라 pi가 <b>가리키는 곳</b>을 바꾼다 — 이게 핵심이었지.'},
        {who:"book", say:'"아무것도 가리키지 않는 포인터에는 <b>NULL</b>을 넣는다. 검사는 <span class="mono">if (pi == NULL)</span>, 짧게는 <span class="mono">if (!pi)</span>."'}
      ]}},
      {who:"book", say:'"<b>포인터의 위험성</b> — 포인터가 실제로는 어떤 대상도 가리키고 있지 않을 때, 프로그램 범위 밖이나 합당하지 않은 메모리 영역을 참조할 수 있다. 그래서 <b>쓰지 않는 포인터는 NULL로 설정</b>해 두는 것이 바람직하다."'},
      {gate:{id:"c4-g-alloc", q:'노드는 필요할 때마다 <b>실행 도중에</b> 만들어야 한다는데 — <b>동적 할당</b>이라는 말, 들어 본 적 있나?', basics:[
        {who:"book", say:'"처음이라면 여기부터. <span class="mono">int a[100];</span> 처럼 선언으로 잡는 공간은 <b>컴파일할 때 크기가 정해진다</b> — 정적(static) 할당이다. 그런데 리스트의 노드가 몇 개 필요할지는 <b>프로그램을 실행해 봐야</b> 안다. 열 개일 수도, 만 개일 수도. 그래서 실행 도중에 \'지금 하나만 더 주세요\' 하고 그때그때 공간을 빌리는 방법이 필요하다 — 이것이 <b>동적(dynamic) 할당</b>이다."'},
        {say:'방 100개를 미리 지어 놓는 기숙사가 아니라, 손님이 올 때마다 방을 하나씩 내주는 호텔이구나. 안 오면 안 짓고.'}
      ]}},
      {who:"book", say:'"동적 할당의 창구가 <b>malloc</b>이다 — 프로그램을 수행하는 도중에 필요한 양만큼 기억장소를 요구하면, <b>힙(heap)</b>이라 부르는 영역에서 빌려 준다. 다 쓰면 <b>free</b>로 돌려준다. 미리 크게 잡아 둘 필요도, 모자랄까 떨 필요도 없다."'},
      {gate:{id:"c4-g-mem", q:'힙이라는 <b>영역</b> 이야기가 나왔다 — 프로그램이 쓰는 메모리 공간이 <b>몇 개의 구역으로 나뉘는지</b>, 들어 본 적 있나?', basics:[
        {who:"book", say:'"프로그램이 실행되면 메모리는 크게 <b>네 구역</b>으로 나뉘어 쓰인다. 지금 중요한 대비는 마지막 두 줄 — <b>스택 영역과 힙 영역</b>이다."',
         table:'<table class="trip"><tr><th>영역</th><th>담는 것</th><th>언제까지 사는가</th></tr><tr><td><b>프로그램(코드) 영역</b></td><td>컴파일된 명령어들</td><td>실행 내내 고정</td></tr><tr><td><b>데이터 영역</b></td><td>전역 변수·static 변수</td><td>실행 내내 유지</td></tr><tr><td><b>스택 영역</b></td><td>지역 변수·함수 호출 정보</td><td><b>함수가 끝나면 자동 회수</b></td></tr><tr><td><b>힙 영역</b></td><td><b>malloc으로 빌린 공간</b></td><td><b>free할 때까지 — 관리는 프로그래머 몫</b></td></tr></table>'},
        {who:"book", say:'"이름 조심 — 여기서의 <b>스택 영역</b>은 함수 호출이 쌓이는 메모리 구역의 이름이다. 3주차에서 만든 자료구조 스택과 <b>쌓이는 원리(LIFO)는 같지만 별개</b>다. 함수가 호출되면 그 함수의 지역 변수들이 스택 영역에 쌓였다가, 함수가 return하면 통째로 걷힌다."'}
      ]}},
      {say:'그래서구나 — 지역 변수는 함수가 끝나면 스택 영역에서 사라진다. 그런데 노드는 <b>함수가 끝나도 리스트에 남아야</b> 한다. 그러니 함수보다 오래 사는 힙에 지을 수밖에.', mood:"proud"},
      {check:{id:"c4A-4", stem:'함수 안의 지역 변수 <span class="mono">int i</span> 와, <span class="mono">malloc</span>으로 빌린 노드의 공간 — 각각 어느 영역에 놓이는가?', mono:true,
        okfb:'지역 변수는 스택 영역(함수가 끝나면 자동 회수), malloc 공간은 힙 영역(free할 때까지 유지).',
        choices:[
          {text:"지역 변수는 스택 영역, 노드의 공간은 힙 영역",correct:true},
          {text:"지역 변수는 힙 영역, 노드의 공간은 스택 영역",correct:false,mc:"area-swap",fb:"거꾸로다 — 함수와 수명을 같이하는 쪽이 스택, 빌려 쓰는 쪽이 힙이다."},
          {text:"둘 다 데이터 영역에 나란히 놓이게 된다",correct:false,mc:"area-confuse",fb:"데이터 영역은 전역·static 변수의 자리다."},
          {text:"둘 다 프로그램(코드) 영역에 함께 놓인다",correct:false,mc:"area-confuse",fb:"코드 영역에는 명령어가 산다 — 변수의 자리가 아니다."}]}},
      {who:"book", say:'"[P/G 4.1] 포인터의 할당과 반환 — 한 줄씩 읽자. malloc(sizeof(int))는 int 하나 크기의 공간을 힙에서 빌려 <b>그 주소를 돌려준다</b>. 앞의 (int *)는 그 주소를 int 포인터로 쓰겠다는 형변환이다. 값은 *pi = 1024 처럼 역참조로 넣고, 다 쓰면 free(pi)로 공간을 돌려준다."',
       code:["int i, *pi;","float f, *pf;","pi = (int *) malloc(sizeof(int));    /* int 크기의 공간을 빌리고 주소를 받음 */","pf = (float *) malloc(sizeof(float));","*pi = 1024;    /* 빌린 공간에 값 저장 (역참조) */","*pf = 3.14;","printf(\"an integer = %d, a float = %f\\n\", *pi, *pf);","free(pi);      /* 다 썼으면 반환 */","free(pf);"]},
      {check:{id:"c4A-3", stem:'<span class="mono">malloc(sizeof(int))</span> 호출이 돌려주는 것은?', mono:true,
        okfb:'힙에서 빌린 새 공간의 "주소"다 — 그래서 포인터에 받는다.',
        choices:[
          {text:"새로 할당된 공간의 주소",correct:true},
          {text:"새로 할당된 공간에 든 값",correct:false,mc:"value-confuse",fb:"값은 아직 없다 — *pi = 1024 처럼 넣는 것은 그 다음 일이다."},
          {text:"할당에 성공했는지의 여부(0/1)",correct:false,mc:"bool-confuse",fb:"성공 여부는 주소가 NULL인지로 확인한다 — 반환물 자체는 주소다."},
          {text:"int 타입의 크기(바이트 수)",correct:false,mc:"sizeof-confuse",fb:"크기는 우리가 sizeof로 '알려 주는' 쪽이다."}]}},
      {who:"book", say:'"조심할 것 하나 — <b>허상 참조(dangling reference)</b>. P/G 4.1에서 free(pf) 전에 <span class="mono">pf = (float *) malloc(sizeof(float));</span> 를 한 줄 더 실행하면? pf는 새 공간으로 갈아타고, <b>이전에 빌린 공간은 주소를 아는 이가 없어져 반환할 길이 사라진다</b> — 새는 메모리다. 반대로 free한 공간을 포인터가 계속 가리키게 두는 것도 위험하다 — 이미 남의 땅이 됐을 수 있다. 그래서 아까의 원칙이다: 쓰지 않는 포인터는 NULL."'},
      {say:'빌리고(malloc), 쓰고(*), 돌려준다(free). 노드를 지을 재료는 다 모였다 — 내일은 진짜로 리스트를 만든다.', mood:"proud"}
    ]},

    B: { day:"화요일", label:"유닛 B", title:"단순 연결 리스트 — 만들기와 삽입", doneLabel:"시련 — 연결 리스트 삽입 ▶", beats:[
      {say:'어제 배운 포인터와 malloc이 오늘의 도구다. 이제 흩어져 있는 노드들을 <b>화살표(링크)</b>로 이어서, 진짜 연결 리스트를 만들어 보자.'},
      {who:"book", say:'"<b>단순 연결 리스트</b> — 화살표로 표시된 링크를 가진 노드들의 순열이다. 노드 하나는 <b>값 칸</b>과 <b>링크 칸(●)</b>으로 되어 있고, 링크가 다음 노드를 가리킨다. <b>첫번째 노드를 가리키는 포인터의 이름이 곧 리스트의 이름</b>이 된다 — 이 리스트의 이름은 ptr다. 그림의 화살표는 주소값을 일일이 쓰지 않고 \'가리킨다\'는 사실만 나타낸 것이다. 기억할 것 둘: (1) 노드들은 <b>순차적 위치에 있지 않다</b> — 메모리 여기저기에 흩어져 있다. (2) 노드들의 위치는 <b>실행할 때마다 바뀔 수 있다</b>."',
       viz:{type:"list",name:"ptr",nodes:[{v:"bat"},{v:"cat"},{v:"sat"},{v:"vat"}]}},
      {who:"book", say:'"노드를 C로 선언하자 — 두 줄을 천천히 읽는 게 이번 장의 첫 고비다. 1행: list_node 구조체를 가리키는 포인터 타입에 <b>list_pointer</b>라는 별칭을 붙인다(2주차의 typedef). 2행: 노드는 <b>데이터 필드</b>(data)와, <b>자기와 같은 타입의 노드를 가리키는 링크 필드</b>(link)로 이루어진다 — 2주차에서 이름만 익혀 둔 <b>자체 참조 구조</b>가 드디어 본업을 시작한다. 다음 노드도 같은 모양이니, 링크의 타입은 자기 자신일 수밖에."',
       code:["typedef struct list_node *list_pointer;  /* '노드를 가리키는 포인터' 타입 */","typedef struct list_node {","    char data[4];        /* \"bat\" + '\\0' — 4바이트 */","    list_pointer link;   /* 다음 노드를 가리킴 — 자체 참조 */","};","list_pointer ptr = NULL;  /* 아직 노드가 없다 — 공백 리스트 */"]},
      {who:"book", say:'"공백 리스트 검사는 매크로 한 줄 — <span class="mono">#define IS_EMPTY(ptr) (!(ptr))</span>. ptr가 NULL이면 참이다."'},
      {check:{id:"c4B-1", stem:'노드 선언에서 <span class="mono">link</span> 필드의 타입은?', mono:true,
        okfb:'같은 list_node를 가리키는 포인터(list_pointer) — 그래서 "자체 참조" 구조다.',
        choices:[
          {text:"자기와 같은 노드 타입을 가리키는 포인터",correct:true},
          {text:"다음 노드의 데이터를 복사해 두는 char 배열",correct:false,mc:"copy-myth",fb:"복사가 아니라 '가리키기'다 — 주소 하나면 충분하다."},
          {text:"다음 노드가 몇 번째인지 적어 두는 int 번호",correct:false,mc:"index-myth",fb:"흩어져 있는 노드에 번호는 무력하다 — 주소가 필요하다."},
          {text:"임의 타입을 받을 수 있는 void 포인터",correct:false,mc:"type-loose",fb:"가리킬 대상은 정해져 있다 — 같은 모양의 다음 노드다."}]}},
      {who:"book", say:'"첫 노드를 지어 보자 — 세 줄이면 된다. malloc으로 노드 크기의 공간을 빌리고, 데이터를 채우고, <b>다음이 없으니 link는 NULL</b>."',
       code:["ptr = (list_pointer) malloc(sizeof(list_node));","strcpy(ptr->data, \"bat\");   /* 데이터 필드 채우기 */","ptr->link = NULL;            /* 다음 노드는 아직 없다 */"],
       table:'<table class="trip"><tr><th>ptr</th><th colspan="4">ptr->data</th><th>ptr->link</th></tr><tr><td>● →</td><td>b</td><td>a</td><td>t</td><td>\\0</td><td>NULL</td></tr></table>'},
      {who:"book", say:'"이번엔 노드 두 개짜리 리스트를 만드는 함수 create2 — 이번 예제의 노드는 data가 <b>int</b>다(단어 대신 정수를 담는 노드 — 구조는 같다). <b>뒤 노드부터 완성</b>하는 순서에 주목하라. second를 다 만들어 두고, first의 link를 second에 건다. 반환값은 first — 첫 노드의 주소가 곧 리스트다."',
       code:["list_pointer create2() {","    list_pointer first, second;","    first  = (list_pointer) malloc(sizeof(list_node));","    second = (list_pointer) malloc(sizeof(list_node));","    second->link = NULL;    /* 뒤 노드부터 완성 */","    second->data = 20;","    first->data = 10;","    first->link = second;   /* 앞 노드를 뒤에 건다 */","    return first;","}"]},
      {say:'malloc 두 번, 대입 다섯 줄… 머릿속으로 화살표를 그려 보자. 완성된 리스트는 어떤 모양일까?', mood:"awkward"},
      {check:{id:"c4B-2", stem:'<span class="mono">ptr = create2();</span> 직후의 리스트 상태는?', mono:true,
        okfb:'first(10)의 link가 second(20)를 가리키고, second의 link는 NULL — ptr → 10 → 20 → NULL.',
        choices:[
          {text:"ptr → 10 → 20 → NULL",correct:true},
          {text:"ptr → 20 → 10 → NULL",correct:false,mc:"order-swap",fb:"반환된 것은 first(10)다 — 만든 순서가 아니라 링크 방향이 순서다."},
          {text:"ptr → 10 → NULL (20은 잃음)",correct:false,mc:"lost-tail",fb:"first->link = second 가 두 노드를 이었다."},
          {text:"ptr → NULL (공백 리스트)",correct:false,mc:"no-op-myth",fb:"malloc 두 번 — 노드 두 개가 지어졌고 first가 반환됐다."}]}},
      {who:"book", say:'"그림으로 확인 — 예측한 그대로다. first(10)의 링크가 second(20)를, second의 링크는 NULL을. 반환된 first가 ptr에 담기니 리스트의 이름은 ptr다."',
       viz:{type:"list",name:"ptr",nodes:[{v:10},{v:20}]}},
      {who:"book", say:'"이제 <b>삽입</b>이다. 어제의 (bat, cat, sat, vat) — 연결 리스트라면 mat 삽입은 이사가 아니라 <b>쪽지 두 장 고쳐 쓰기</b>다. 네 단계를 그림으로 한 걸음씩 따라가 보자."',
       steps:{frames:[
         {viz:{type:"list",name:"ptr",nodes:[{v:"bat"},{v:"cat",hl:1},{v:"sat"},{v:"vat"}]},
          cap:'mat가 들어갈 자리는 cat과 sat 사이다. 배열이라면 sat과 vat가 밀려야 했다 — 여기서는 <b>아무도 움직이지 않는다</b>.'},
         {viz:{type:"list",name:"ptr",nodes:[{v:"bat"},{v:"cat"},{v:"sat"},{v:"vat"}],below:{gap:1,v:"mat",hl:1,note:''}},
          cap:'(1)(2) 쓰지 않는 노드 하나를 가져와(= malloc) 데이터 필드에 <b>mat</b>를 저장한다. 아직 누구와도 연결되지 않은 채 떠 있다 — 링크 칸(●)은 비어 있다.'},
         {viz:{type:"list",name:"ptr",nodes:[{v:"bat"},{v:"cat"},{v:"sat"},{v:"vat"}],below:{gap:1,v:"mat",hl:1,note:'<span style="color:var(--accent);">mat→sat ⬈</span>'}},
          cap:'(3) <b>mat의 링크</b>가 cat의 링크 필드에 든 주소(= sat의 주소)를 가리키게 한다. 이제 mat는 sat으로 가는 길을 안다 — 하지만 <b>리스트는 아직 mat의 존재를 모른다</b>.'},
         {viz:{type:"list",name:"ptr",nodes:[{v:"bat"},{v:"cat",hl:1},{v:"sat"},{v:"vat"}],arrows:["ok","cut","ok","ok"],below:{gap:1,v:"mat",hl:1,note:'<span style="color:var(--accent);">⬊ cat→mat</span>&nbsp;&nbsp;<span style="color:var(--accent);">mat→sat ⬈</span>'}},
          cap:'(4) <b>cat의 링크</b>가 mat를 가리키게 바꾼다. cat→sat의 옛 길(흐려진 화살표)은 끊기고, cat → mat → sat 새 길이 열렸다.'},
         {viz:{type:"list",name:"ptr",nodes:[{v:"bat"},{v:"cat"},{v:"mat",hl:1},{v:"sat"},{v:"vat"}]},
          cap:'한 줄로 펴 보면 — bat → cat → <b>mat</b> → sat → vat. 고쳐 쓴 쪽지(링크)는 단 두 장: mat의 링크, cat의 링크. sat과 vat는 제자리다.'}
       ]}},
      {who:"book", say:'"코드로 — 값 50짜리 새 노드를 node가 가리키는 노드 <b>뒤에</b> 삽입하는 insert다. 첫 인자가 <span class="mono">list_pointer *ptr</span> — 포인터의 포인터인 이유: 리스트가 <b>공백일 때는</b> 새 노드가 첫 노드가 되어 <b>리스트의 시작 주소 자체</b>가 바뀌어야 하기 때문이다(3주차 push의 int *top과 같은 원리). IS_FULL은 malloc이 실패했는지(더 빌릴 공간이 없는지) 검사한다."',
       code:["void insert(list_pointer *ptr, list_pointer node) {","    list_pointer temp;","    temp = (list_pointer) malloc(sizeof(list_node));","    if (IS_FULL(temp)) {","        fprintf(stderr, \"The memory is full\\n\");","        exit(1);","    }","    temp->data = 50;","    if (*ptr) {                    /* 리스트가 비어 있지 않으면 */","        temp->link = node->link;   /* ① 새 노드가 '다음'을 물려받고 */","        node->link = temp;         /* ② 앞 노드가 새 노드를 가리킨다 */","    }","    else {                         /* 공백 리스트면 */","        temp->link = NULL;","        *ptr = temp;               /* 새 노드가 곧 리스트의 시작 */","    }","}"]},
      {who:"book", say:'"핵심 두 줄(①②)을 슬로우 모션으로 보자. 10 → 20 리스트의 10 뒤에 50을 넣는다 — 코드 한 줄이 그림에서 화살표 하나다."',
       steps:{code:["/* ptr → 10 → 20 → NULL,  node = 10 노드 */","temp->data = 50;","temp->link = node->link;   /* ① */","node->link = temp;         /* ② */"],frames:[
         {hl:1, viz:{type:"list",name:"ptr",nodes:[{v:10,hl:1},{v:20}],below:{gap:0,v:50,hl:1,note:''}},
          cap:'malloc으로 빌린 새 노드(temp)에 50을 저장했다. node는 10 노드를 가리키고 있다. 새 노드는 아직 허공에 떠 있다.'},
         {hl:2, viz:{type:"list",name:"ptr",nodes:[{v:10},{v:20}],below:{gap:0,v:50,hl:1,note:'<span style="color:var(--accent);">50→20 ⬈</span>'}},
          cap:'① <span class="mono">temp->link = node->link</span> — 10의 링크 필드에 든 값(= 20의 주소)을 새 노드가 <b>물려받는다</b>. 이제 50은 20으로 가는 길을 안다. 10의 링크는 아직 그대로다.'},
         {hl:3, viz:{type:"list",name:"ptr",nodes:[{v:10,hl:1},{v:20}],arrows:["cut","ok"],below:{gap:0,v:50,hl:1,note:'<span style="color:var(--accent);">⬊ 10→50</span>&nbsp;&nbsp;<span style="color:var(--accent);">50→20 ⬈</span>'}},
          cap:'② <span class="mono">node->link = temp</span> — 10의 링크가 새 노드를 가리키게 <b>덮어쓴다</b>. 옛 길 10→20은 끊기지만 괜찮다 — 20의 주소는 이미 ①에서 50이 물려받았다.'},
         {hl:-1, viz:{type:"list",name:"ptr",nodes:[{v:10},{v:50,hl:1},{v:20}]},
          cap:'완성 — ptr → 10 → 50 → 20. 만약 ②를 먼저 했다면? 10의 링크가 덮이는 순간 <b>20의 주소를 아는 이가 아무도 없어져</b>, ①이 물려받을 값이 사라진다. 20부터 뒤가 통째로 미아 — 순서가 생명이다.'}
       ]}},
      {check:{id:"c4B-3", stem:'insert에서 <span class="mono">temp->link = node->link</span> 를 <span class="mono">node->link = temp</span> 보다 <b>먼저</b> 실행해야 하는 이유는?', mono:true,
        okfb:'node->link를 먼저 덮으면 그 안에 있던 "다음 노드의 주소"를 잃는다 — 물려받는 것이 먼저다.',
        choices:[
          {text:"node->link를 먼저 덮으면 뒤 리스트의 주소를 잃기 때문",correct:true},
          {text:"C 언어 문법이 대입문을 그 순서로만 쓰도록 정하고 있어서",correct:false,mc:"syntax-myth",fb:"문법은 어느 순서든 허락한다 — 논리가 순서를 요구하는 것이다."},
          {text:"어느 순서로 해도 같지만 책의 관례를 따르는 것뿐이라서",correct:false,mc:"order-free",fb:"10 → 20에 직접 대입해 보라 — 거꾸로 하면 20이 미아가 된다."},
          {text:"temp->link가 NULL인 채로 두면 컴파일 오류가 나기 때문",correct:false,mc:"null-fear",fb:"컴파일러는 NULL 링크에 아무 불만이 없다 — 문제는 실행 후의 리스트 모양이다."}]}},
      {say:'이사는 없다 — 쪽지 두 장을 고쳐 쓸 뿐. 다만 <b>고쳐 쓰는 순서</b>가 있다. 이제 직접 삽입해 보자.', mood:"proud"}
    ]},

    C: { day:"목요일", label:"유닛 C", title:"삭제와 리스트 순회", doneLabel:"시련 — 연결 리스트 삭제 ▶", beats:[
      {say:'어제 도윤이도 넘어간 그 삽입 순서 — 오늘은 반대 방향, <b>빼는 법</b>이다.'},
      {who:"book", say:'"<b>삭제</b> — (bat, cat, mat, sat, vat)에서 mat를 지우려면, mat <b>바로 앞의 원소 cat을 찾아서</b> cat의 링크 필드 값을 mat의 링크 필드 값(= sat의 주소)으로 <b>대체</b>한다. 그림처럼 — cat의 화살표가 mat를 건너뛰어 sat으로 곧장 이어진다. 재미있는 것 — mat의 링크는 여전히 sat을 가리키고 있다(mat에서 나가는 화살표는 멀쩡하다). 그러나 ptr에서 출발해 링크를 아무리 따라가도 <b>mat에 도착할 방법이 없다</b>. 리스트에 있다는 것은 \'도달할 수 있다\'는 뜻이다."',
       viz:{type:"list",name:"ptr",nodes:[{v:"bat"},{v:"cat",hl:1},{v:"mat",dim:1},{v:"sat"},{v:"vat"}],arrows:["ok","cut","ok","ok"],over:{from:1,to:3}}},
      {check:{id:"c4C-1", stem:'리스트 <span class="mono">ptr → 10 → 50 → 20 → NULL</span> 에서 50을 삭제할 때, <b>값을 바꾸는 링크 필드</b>는?', mono:true,
        okfb:'10의 링크 하나 — 50의 다음(20)을 물려받아 건너뛰게 한다.',
        choices:[
          {text:"10 노드의 링크 1개",correct:true},
          {text:"10과 50, 두 노드의 링크",correct:false,mc:"extra-fix",fb:"50의 링크는 그대로 둬도 된다 — 리스트 밖으로 떨어져 나갈 뿐이다."},
          {text:"20 노드의 링크 1개",correct:false,mc:"next-instead",fb:"20은 50의 '뒤'다 — 길을 고치는 것은 '앞' 노드다."},
          {text:"세 노드의 링크 전부",correct:false,mc:"shift-carry",fb:"배열식 발상이다 — 연결 리스트는 앞 노드의 쪽지 한 장이면 된다."}]}},
      {who:"book", say:'"등장인물 셋의 이름을 정하자 — <b>ptr</b>: 리스트의 시작. <b>node</b>: 삭제하고자 하는 노드. <b>trail</b>: 삭제할 노드의 <b>선행 노드</b>. 그런데 삭제 대상이 <b>리스트의 첫번째 노드</b>라면? 선행 노드가 없다 — trail은 NULL이고, 이때는 <b>ptr의 시작 주소를 영구적으로 바꿔야</b> 한다. 어제 insert의 이중 포인터가 여기서 다시 필요해진다."'},
      {who:"book", say:'"delete — 한 줄씩. trail이 있으면(중간·끝 노드) trail의 링크가 node의 링크를 물려받는다. trail이 NULL이면(첫 노드) *ptr 자체가 다음 노드로 갈아탄다. 그리고 <b>free(node)</b> — 이 줄을 잊으면 노드는 리스트에서도 빠지고 반환되지도 않은 채 힙에 남는다. 어제의 \'새는 메모리\'다."',
       code:["void delete(list_pointer *ptr, list_pointer trail, list_pointer node) {","    if (trail)","        trail->link = node->link;   /* 중간: 선행 노드가 다음을 물려받음 */","    else","        *ptr = (*ptr)->link;        /* 첫 노드: 시작 주소 자체가 바뀜 */","    free(node);                     /* 공간 반환 — 잊으면 누수 */","}"]},
      {who:"book", say:'"먼저 <b>중간 노드 삭제</b> — 10 → 50 → 20 에서 50을 지운다. 한 줄이 그림 한 장이다."',
       steps:{code:["/* ptr → 10 → 50 → 20 → NULL,  node = 50,  trail = 10 */","trail->link = node->link;","free(node);"],frames:[
         {hl:0, viz:{type:"list",name:"ptr",nodes:[{v:10},{v:50,hl:1},{v:20}]},
          cap:'삭제 대상은 50(node), 그 선행 노드는 10(trail)이다. 목표 — 리스트의 길이 50을 지나치지 않게 만들기.'},
         {hl:1, viz:{type:"list",name:"ptr",nodes:[{v:10,hl:1},{v:50,dim:1},{v:20}],arrows:["cut","ok","ok"],over:{from:0,to:2}},
          cap:'<span class="mono">trail->link = node->link</span> — 10의 링크가 50의 링크 값(= 20의 주소)을 물려받는다. 길이 50을 <b>건너뛴다</b>. 50에서 나가는 화살표는 아직 20을 가리키지만, ptr에서 출발하면 이제 50에 닿을 수 없다.'},
         {hl:2, viz:{type:"list",name:"ptr",nodes:[{v:10},{v:20}]},
          cap:'<span class="mono">free(node)</span> — 50의 공간을 힙에 돌려준다. 이 줄을 잊으면? 리스트에서도 빠지고 반환도 안 된 채 힙에 남는다 — 월요일에 배운 새는 메모리다.'}
       ]}},
      {who:"book", say:'"이번엔 <b>첫 노드 삭제</b> — 같은 리스트에서 10을 지운다. 선행 노드가 없다는 것이 무엇을 바꾸는지 보라."',
       steps:{code:["/* ptr → 10 → 50 → 20 → NULL,  node = 10,  trail = NULL */","*ptr = (*ptr)->link;","free(node);"],frames:[
         {hl:0, viz:{type:"list",name:"ptr",nodes:[{v:10,hl:1},{v:50},{v:20}]},
          cap:'삭제 대상이 첫 노드다 — 앞에 아무도 없으니 trail은 NULL. 고칠 \'앞 노드의 링크\'가 없다. 그럼 무엇을 고치나? <b>리스트의 이름표, ptr 자신</b>이다.'},
         {hl:1, viz:{type:"list",name:"ptr",nameArrow:"cut",nodes:[{v:10,dim:1},{v:50,hl:1},{v:20}]},
          cap:'<span class="mono">*ptr = (*ptr)->link</span> — ptr가 10의 링크 값(= 50의 주소)으로 갈아탄다. 리스트의 시작이 50이 된다. 함수 안에서 ptr <b>자체</b>를 바꿔야 하므로 이중 포인터(*ptr)가 필요했던 것이다.'},
         {hl:2, viz:{type:"list",name:"ptr",nodes:[{v:50},{v:20}]},
          cap:'<span class="mono">free(node)</span> — 10의 공간 반환. 남은 리스트: ptr → 50 → 20. 두 경우 모두 마지막은 반드시 free다.'}
       ]}},
      {check:{id:"c4C-2", stem:'리스트 <span class="mono">ptr → 10 → 50 → 20 → NULL</span> 에서 <b>첫 노드(10)</b>를 삭제할 때 실행되는 문장은?', mono:true,
        okfb:'trail이 NULL — else 경로: *ptr = (*ptr)->link. 시작 포인터가 50으로 갈아탄다.',
        choices:[
          {text:"*ptr = (*ptr)->link — 시작 주소가 바뀐다",correct:true},
          {text:"trail->link = node->link — 선행 노드가 물려받는다",correct:false,mc:"branch-swap",fb:"첫 노드에는 선행 노드가 없다 — trail이 NULL이라 if(trail)이 거짓이다."},
          {text:"node->link = NULL — 삭제할 노드의 길을 끊는다",correct:false,mc:"reverse-link",fb:"node의 링크는 손대지 않는다 — 시작 포인터 쪽을 고친다."},
          {text:"free(ptr) — 시작 포인터 자체를 반환한다",correct:false,mc:"free-misuse",fb:"반환할 것은 노드(node)다 — ptr는 리스트의 이름표라 남아야 한다."}]}},
      {who:"book", say:'"마지막 도구 — 리스트에 무엇이 들었는지 <b>출력</b>하기. for문 한 줄이 연결 리스트 순회의 <b>표준 관용구</b>다: 조건은 <span class="mono">ptr</span> — NULL이 되면(끝까지 가면) 멈춘다. 증감은 <span class="mono">ptr = ptr-&gt;link</span> — i++ 대신 <b>링크를 타고 한 칸</b> 이동한다. 배열처럼 a[3]으로 건너뛸 수는 없다 — 리스트는 <b>지나가며 세는</b> 구조다."',
       code:["void print_list(list_pointer ptr) {","    printf(\"The list contains: \");","    for (; ptr; ptr = ptr->link)","        printf(\"%4d\", ptr->data);","    printf(\"\\n\");","}"]},
      {check:{id:"c4C-3", stem:'<span class="mono">for (; ptr; ptr = ptr-&gt;link)</span> 순회가 <b>멈추는 순간</b>은?', mono:true,
        okfb:'ptr가 NULL이 될 때 — 마지막 노드의 link가 NULL이므로 끝까지 가면 자연히 멈춘다.',
        choices:[
          {text:"ptr가 NULL이 되었을 때",correct:true},
          {text:"ptr가 리스트의 마지막 노드를 가리키게 되었을 때",correct:false,mc:"off-by-one",fb:"마지막 노드도 출력해야 한다 — 그 '다음'(NULL)에서 멈춘다."},
          {text:"미리 세어 둔 노드 개수만큼 반복을 마쳤을 때",correct:false,mc:"count-myth",fb:"리스트는 개수를 미리 모른다 — NULL이 곧 끝의 표지다."},
          {text:"data 필드에 0이 들어 있는 노드를 만났을 때",correct:false,mc:"sentinel-myth",fb:"0도 어엿한 데이터다 — 끝의 표지는 링크의 NULL이다."}]}},
      {say:'넣고(insert), 빼고(delete), 훑는다(print_list) — 리스트 공구함이 다 찼다. 그런데 trail을 찾으려면 결국 앞에서부터 훑어야 하잖아? …내일 책이 답해 줄 모양이다.', mood:"proud"}
    ]},

    D: { day:"금요일", label:"유닛 D", title:"이중 연결 원형 리스트", doneLabel:"시련 — 이중 연결 원형 ▶", beats:[
      {say:'어제의 찜찜함 — 삭제하려면 <b>앞 노드(trail)</b>가 필요한데, 단순 리스트는 앞으로 못 간다. 책도 같은 생각이었나 보다.'},
      {who:"book", say:'"단순 연결 리스트는 <b>링크의 방향으로만</b> 쉽게 이동할 수 있다. 어떤 노드의 <b>전위(앞) 노드</b>를 찾아내려면? 처음부터 시작해서, 그 노드를 가리키는 링크를 가진 노드를 발견할 때까지 조사해야 한다. 포인터를 <b>양방향으로</b> 움직여야 하는 문제라면 — <b>이중 연결 리스트(doubly linked list)</b>를 쓴다."'},
      {who:"book", say:'"노드에 링크를 하나 더 단다 — 왼쪽 이웃을 가리키는 <b>llink</b>, 오른쪽 이웃을 가리키는 <b>rlink</b>."',
       code:["typedef struct node *node_pointer;","typedef struct node {","    node_pointer llink;   /* 왼쪽(전위) 노드 */","    element item;","    node_pointer rlink;   /* 오른쪽(후위) 노드 */","};"]},
      {who:"book", say:'"여기에 두 가지를 더 얹는다. <b>원형</b> — 마지막 노드의 rlink는 처음으로, 첫 노드의 llink는 마지막으로 이어 붙여 고리를 만든다. 그리고 <b>헤드 노드(head node)</b> — 데이터를 갖지 않는 기준점 노드 하나를 고리에 상주시킨다. 그러면 <b>공백 리스트조차 실제로는 공백이 아니다</b> — 헤드 노드 홀로 <b>자기 자신의 llink와 rlink를 자기에게</b> 건 채 고리를 이루고 있다."',
       viz:{type:"dlist",nodes:[{head:1},{v:10},{v:20},{v:30}]},
       table:'<table class="trip"><tr><th>상태</th><th>고리 (rlink 방향)</th></tr><tr><td>공백</td><td>head ⇄ head (자기 자신)</td></tr><tr><td>노드 3개</td><td>위 그림 — head ⇄ 10 ⇄ 20 ⇄ 30 ⇄ (다시 head)</td></tr></table>'},
      {check:{id:"c4D-1", stem:'헤드 노드를 가진 <b>공백</b> 이중 연결 원형 리스트에서, 헤드 노드의 llink와 rlink가 가리키는 것은?',
        okfb:'자기 자신 — 노드 하나짜리 고리다. 그래서 "실제로는 공백 상태가 아니다".',
        choices:[
          {text:"둘 다 헤드 노드 자기 자신",correct:true},
          {text:"둘 다 NULL — 아무것도 없다",correct:false,mc:"null-fear",fb:"원형 리스트에 NULL은 없다 — 고리는 언제나 닫혀 있다."},
          {text:"llink는 NULL, rlink는 자기 자신",correct:false,mc:"direction-swap",fb:"한쪽만 걸면 고리가 아니다 — 양방향 모두 자신에게 닫힌다."},
          {text:"운영체제가 정한 임의의 주소",correct:false,mc:"os-myth",fb:"임의라면 위험한 포인터다 — 초기화가 자기 자신으로 닫아 둔다."}]}},
      {who:"book", say:'"이 구조의 자랑 — <b>항등식</b>: <span class="mono">ptr = ptr-&gt;llink-&gt;rlink = ptr-&gt;rlink-&gt;llink</span>. 왼쪽 이웃으로 갔다가 그 오른쪽으로 돌아오면 제자리, 오른쪽 갔다 왼쪽 와도 제자리 — <b>전위 노드든 후위 노드든 한 걸음</b>이라는 뜻이다. 어제의 trail 수색은 이제 llink 한 번으로 끝난다."'},
      {who:"book", say:'"<b>삽입 dinsert</b> — newnode를 node의 오른쪽에 끼운다. 네 줄이다: ① 새 노드의 왼손이 node를 잡고 ② 새 노드의 오른손이 node의 오른쪽 이웃을 잡는다 ③ <b>그 오른쪽 이웃의 왼손</b>이 새 노드를 잡고 ④ node의 오른손이 새 노드를 잡는다. <b>③④의 순서가 중요하다!!!</b> — ③은 node-&gt;rlink를 <b>경유해서</b> 기존 오른쪽 이웃을 찾는다. ④가 먼저 그 rlink를 새 노드로 덮어 버리면, 기존 이웃으로 가는 길이 사라진다. 어제 insert의 ①②와 같은 이치다."',
       code:["void dinsert(node_pointer node, node_pointer newnode) {","    /* newnode를 node의 오른쪽에 삽입 */","    newnode->llink = node;              /* ① */","    newnode->rlink = node->rlink;       /* ② */","    node->rlink->llink = newnode;       /* ③ 기존 오른쪽 이웃의 왼손 */","    node->rlink = newnode;              /* ④ — ③보다 먼저 하면 안 된다! */","}"]},
      {who:"book", say:'"네 줄을 그림으로 — head ⇄ 10 ⇄ 20 고리에서, 10의 오른쪽에 새 노드 15를 끼운다(node = 10). 노드 양옆의 ●가 llink(왼손)·rlink(오른손)다. 네 개의 손이 바뀌는 순서를 눈으로 좇아라."',
       steps:{code:["/* head ⇄ 10 ⇄ 20 (원형),  node = 10,  newnode = 15 */","newnode->llink = node;              /* ① 15의 왼손 → 10 */","newnode->rlink = node->rlink;       /* ② 15의 오른손 → 20 */","node->rlink->llink = newnode;       /* ③ 20의 왼손 → 15 */","node->rlink = newnode;              /* ④ 10의 오른손 → 15 */"],frames:[
         {hl:0, viz:{type:"dlist",nodes:[{head:1},{v:10,hl:1},{v:20}],below:{gap:1,v:15,hl:1,note:'<span style="color:var(--ink-dim);">① ② ③ ④ 아직 없음</span>'}},
          cap:'새 노드 15가 10과 20 사이 아래에 떠 있다. 고리의 기존 링크는 전부 그대로다.'},
         {hl:1, viz:{type:"dlist",nodes:[{head:1},{v:10},{v:20}],below:{gap:1,v:15,hl:1,note:'<span style="color:var(--accent);">① 15→10</span> · <span style="color:var(--ink-dim);">② ③ ④</span>'}},
          cap:'① <span class="mono">newnode->llink = node</span> — 15의 <b>왼손</b>이 10을 잡는다. 15 쪽 손만 바뀌었을 뿐, 고리는 아직 15를 모른다.'},
         {hl:2, viz:{type:"dlist",nodes:[{head:1},{v:10},{v:20}],below:{gap:1,v:15,hl:1,note:'<span style="color:var(--accent);">① 15→10 · ② 15→20</span> · <span style="color:var(--ink-dim);">③ ④</span>'}},
          cap:'② <span class="mono">newnode->rlink = node->rlink</span> — 10의 오른손이 가리키던 곳(= 20)을 읽어, 15의 <b>오른손</b>이 20을 잡는다. 여전히 고리의 링크는 무사하다.'},
         {hl:3, viz:{type:"dlist",nodes:[{head:1},{v:10},{v:20,hl:1}],conns:[null,{r:"ok",l:"cut"}],below:{gap:1,v:15,hl:1,note:'<span style="color:var(--accent);">① 15→10 · ② 15→20 · ③ 20→15</span> · <span style="color:var(--ink-dim);">④</span>'}},
          cap:'③ <span class="mono">node->rlink->llink = newnode</span> — 10의 오른손(아직 20을 가리킨다)을 <b>경유해</b> 20을 찾아가, 20의 <b>왼손</b>이 15를 잡게 한다. 20→10 왼손 길은 끊겼다(흐림). 이 줄이 ④보다 먼저인 이유 — 경유로가 아직 살아 있어야 하니까.'},
         {hl:4, viz:{type:"dlist",nodes:[{head:1},{v:10,hl:1},{v:20}],conns:[null,{r:"cut",l:"cut"}],below:{gap:1,v:15,hl:1,note:'<span style="color:var(--accent);">① 15→10 · ② 15→20 · ③ 20→15 · ④ 10→15</span>'}},
          cap:'④ <span class="mono">node->rlink = newnode</span> — 마지막으로 10의 <b>오른손</b>이 15를 잡는다. 10⇄20 직통은 완전히 끊기고 네 손이 모두 제자리를 찾았다.'},
         {hl:-1, viz:{type:"dlist",nodes:[{head:1},{v:10},{v:15,hl:1},{v:20}]},
          cap:'완성 — head ⇄ 10 ⇄ <b>15</b> ⇄ 20. 만약 ④를 ③보다 먼저 했다면? ③이 경유할 10의 오른손이 이미 15를 가리켜, 20 대신 <b>15 자신의 왼손</b>을 만지게 된다 — 20의 왼손은 영영 10에 남는다.'}
       ]}},
      {check:{id:"c4D-2", stem:'dinsert에서 <span class="mono">④ node-&gt;rlink = newnode</span> 를 <span class="mono">③</span> 보다 먼저 실행하면?', mono:true,
        okfb:'③이 경유하는 node->rlink가 이미 newnode로 바뀌어 — 기존 오른쪽 이웃 대신 newnode 자신을 만지게 된다.',
        choices:[
          {text:"③이 기존 오른쪽 이웃 대신 newnode 자신을 건드리게 된다",correct:true},
          {text:"결과는 완전히 같다 — 네 줄의 순서는 어떻게 해도 무방하다",correct:false,mc:"order-free",fb:"③의 길잡이가 node->rlink다 — 먼저 덮으면 길을 잃는다."},
          {text:"컴파일러가 순서 오류를 감지해 컴파일을 거부하게 된다",correct:false,mc:"compiler-magic",fb:"문법상 멀쩡하다 — 논리의 순서는 프로그래머의 몫이다."},
          {text:"newnode의 두 링크가 모두 NULL이 되어 고리가 끊긴다",correct:false,mc:"null-fear",fb:"NULL은 생기지 않는다 — 엉뚱한 노드를 가리키게 될 뿐이다."}]}},
      {who:"book", say:'"<b>삭제 ddelete</b> — 헤드 노드는 리스트의 기준점이므로 <b>삭제가 허락되지 않는다</b>. 일반 노드라면 두 줄이면 된다: 삭제할 노드의 <b>왼쪽 이웃의 오른손</b>이 오른쪽 이웃을 잡고, <b>오른쪽 이웃의 왼손</b>이 왼쪽 이웃을 잡는다 — 고리가 삭제 대상을 건너뛰며 다시 닫힌다. 그리고 free. 단순 리스트처럼 trail을 <b>찾아 헤맬 필요가 없다</b> — llink가 이미 앞 노드를 알고 있으니까."',
       code:["void ddelete(node_pointer node, node_pointer deleted) {","    if (node == deleted)","        printf(\"Deletion of head node not permitted.\\n\");","    else {","        deleted->llink->rlink = deleted->rlink;  /* 왼쪽 이웃 → 오른쪽 이웃 */","        deleted->rlink->llink = deleted->llink;  /* 오른쪽 이웃 → 왼쪽 이웃 */","        free(deleted);","    }","}"]},
      {who:"book", say:'"삭제도 그림으로 — head ⇄ 10 ⇄ 20 고리에서 10을 지운다(deleted = 10). 양쪽 이웃이 서로를 잡으면 끝이다."',
       steps:{code:["/* head ⇄ 10 ⇄ 20 (원형),  deleted = 10 */","deleted->llink->rlink = deleted->rlink;   /* head의 오른손 → 20 */","deleted->rlink->llink = deleted->llink;   /* 20의 왼손 → head */","free(deleted);"],frames:[
         {hl:0, viz:{type:"dlist",nodes:[{head:1},{v:10,hl:1},{v:20}]},
          cap:'deleted = 10. 10의 왼손은 head를, 오른손은 20을 이미 알고 있다 — <b>trail을 찾아 헤맬 필요가 없는</b> 이유다. 이 두 손을 길잡이 삼아 양쪽 이웃을 서로 잇는다.'},
         {hl:1, viz:{type:"dlist",nodes:[{head:1,hl:1},{v:10,dim:1},{v:20}],conns:[{r:"cut",l:"ok"},{r:"ok",l:"ok"}]},
          cap:'<span class="mono">deleted->llink->rlink = deleted->rlink</span> — 10의 왼손을 경유해 head를 찾아가, head의 <b>오른손</b>이 10의 오른손 값(= 20)을 물려받는다. 시계방향 길이 10을 건너뛴다.'},
         {hl:2, viz:{type:"dlist",nodes:[{head:1},{v:10,dim:1},{v:20,hl:1}],conns:[{r:"cut",l:"cut"},{r:"ok",l:"cut"}]},
          cap:'<span class="mono">deleted->rlink->llink = deleted->llink</span> — 이번엔 10의 오른손을 경유해 20을 찾아가, 20의 <b>왼손</b>이 head를 잡는다. 반시계 길도 10을 건너뛴다. 10의 두 손은 그대로지만, 고리에서 10에 닿을 방법이 사라졌다.'},
         {hl:3, viz:{type:"dlist",nodes:[{head:1},{v:20}]},
          cap:'<span class="mono">free(deleted)</span> — 10의 공간을 돌려주면 고리는 head ⇄ 20으로 다시 닫힌다. 단순 리스트와 달리 두 줄 다 \'경유\'가 필요 없는 자기 손 안의 정보였다.'}
       ]}},
      {check:{id:"c4D-3", stem:'이중 연결 리스트의 삭제가 단순 리스트와 달리 <b>trail 수색이 필요 없는</b> 이유는?',
        okfb:'삭제할 노드의 llink가 이미 선행 노드를 가리키고 있다 — 링크 하나 값의 공간을 더 내고 산 편리함이다.',
        choices:[
          {text:"삭제할 노드의 llink가 이미 선행 노드를 알고 있어서",correct:true},
          {text:"이중 리스트에서는 선행 노드의 링크를 바꿀 일이 없어서",correct:false,mc:"reverse-link",fb:"바꾼다 — 다만 '찾지 않고' 바꾼다. llink 덕에 수색이 생략될 뿐이다."},
          {text:"원형 구조라 어느 노드든 결국 한 바퀴 돌면 나오게 되어서",correct:false,mc:"circular-confuse",fb:"한 바퀴 도는 것이야말로 수색이다 — 핵심은 한 걸음(llink)이다."},
          {text:"헤드 노드가 모든 노드의 선행 노드를 대신해 주어서",correct:false,mc:"head-count",fb:"헤드는 기준점일 뿐 — 각 노드의 선행자는 각자의 llink가 안다."}]}},
      {say:'왼손과 오른손이 있는 노드들의 원탁 — 앞으로도 뒤로도 한 걸음이다. 대신 노드마다 링크 필드 값의 집세를 더 낸다. 공짜는 없구나.', mood:"proud"}
    ]}
  },

  hints: {
    A:["【이사 비용】 배열의 k번째 자리 삽입 = k번째부터 끝까지 전부 한 칸씩 밀기. 삭제 = k+1번째부터 끝까지 당기기.",
       "【세기】 삽입 이동 수 = n−k+1, 삭제 이동 수 = n−k. 새로 들어오는 원소 자신은 세지 않는다.",
       "【연결이라면】 노드는 제자리 — 삽입은 링크 2개(새 노드의 링크 + 앞 노드의 링크), 삭제는 앞 노드의 링크 1개."],
    B:["【삽입 절차】 ① temp->link = node->link (다음을 물려받기) ② node->link = temp (앞 노드가 새 노드를 가리키기). 순서 엄수.",
       "【물려받기】 temp->link가 받는 것은 node의 '다음' — node가 마지막이면 NULL을 물려받아 temp가 새 마지막이 된다.",
       "【공백 리스트】 *ptr가 NULL이면 else 경로 — temp->link=NULL, *ptr=temp. 시작 주소가 바뀌므로 이중 포인터가 필요하다."],
    C:["【삭제】 trail(선행 노드)의 링크가 node의 링크를 물려받는다 — 리스트가 삭제 대상을 건너뛴다.",
       "【첫 노드】 첫 노드는 trail이 없다(NULL) — *ptr = (*ptr)->link 로 시작 주소 자체를 바꾼다.",
       "【마무리】 링크를 고친 뒤 free(node) — 빠뜨리면 반환 불가능한 공간이 힙에 남는다."],
    D:["【방향】 rlink = 시계(오른쪽) 이웃, llink = 반시계(왼쪽) 이웃. head도 고리의 어엿한 한 칸이다.",
       "【항등식】 ptr->llink->rlink = ptr — 갔다가 돌아오면 제자리. 한 칸 이동과 헷갈리지 말 것.",
       "【삽입·삭제】 dinsert는 ③(기존 오른쪽 이웃의 llink)을 ④(node->rlink)보다 먼저. ddelete는 양쪽 이웃이 서로를 잡으면 끝."]
  },

  interludes: {
    A: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 오늘 영화관 갔는데요. 한가운데 앉은 애 옆에 친구를 앉히려고, 그 줄에 앉아 있던 사람들이 전부 일어나서 한 칸씩 옮겨 앉았어요. 팝콘 두 개 엎어졌어요.'},
      {who:"나", face:"me-proud", text:'(답장) 그게 정확히 오늘 밤 내가 공부한 <b>배열의 삽입</b>이다. 좌석이 붙어 있으니 중간에 끼려면 뒤가 전부 밀리는 거야. 내일 밤엔 내가 안 밀리는 방법을 공부할 차례다 — 각자 흩어져 앉는 대신, 다음 사람이 어느 자리에 있는지 쪽지를 들고 있는 방식.'}
    ],
    B: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 보물찾기 해 보셨어요? 쪽지 찾으면 그 쪽지에 다음 장소가 적혀 있는 거요. 오늘 동아리에서 했는데 마지막 쪽지가 없어져서 다 망했어요.'},
      {who:"나", face:"me", text:'(답장) 그거 오늘 밤 내가 공부한 자료구조랑 똑같은 구조다. 쪽지가 끊기면 뒤가 전부 미아 — 그래서 쪽지를 고쳐 쓰는 순서까지 정해져 있어. 내일 과외 때 그 얘기 하자.'}
    ],
    C: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 아까 유튜브 뒤로가기를 눌렀는데요, 문득 얘는 제가 어디서 왔는지 어떻게 아는 걸까 싶어서요. 앞으로 가기도 되잖아요.'},
      {who:"나", face:"me-proud", text:'(답장) 좋은 질문이다. 한 방향 쪽지로는 "왔던 곳"을 모른다 — 내일 밤 내가 공부할 게 정확히 그거다. 쪽지를 양손에 한 장씩 들면 돼. 토요일에 보여주마.'}
    ]
  },

  tutorQs: [
    {id:"Q1", ask:'쌤, 배열이 삽입할 때 다 밀어야 해서 느리다면서요. 그럼 그냥 처음부터 <b>엄청 큰 배열</b>을 만들어 놓으면 되는 거 아니에요? 자리가 남아도는데 뭐가 문제예요?',
     choices:[
      {text:'"크게 잡아도 <b>중간에 끼어드는 비용</b>은 그대로야 — 사전 순서 중간에 한 단어 넣으면 크든 작든 뒤가 전부 밀리지. 안 쓰는 칸의 낭비는 덤이고. 리스트는 그 자리에서 링크 두 개만 고쳐 쓰거든."', correct:true, fb:'아… 크기 문제랑 끼어들기 문제가 따로였구나. 큰 배열은 낭비만 늘리는 거네요.'},
      {text:'"맞아, 배열을 넉넉하게 잡는 게 실무의 정석이야. 요즘 컴퓨터는 메모리가 남아돌아서 낭비는 문제가 안 되고, 삽입도 자리가 미리 넉넉히 비어 있으니까 밀 필요 없이 그대로 들어가거든."', correct:false, mc:"shift-free-myth", fb:'어? 중간에 넣으려면 뒤 원소들은 어차피 밀어야 하는 거 아니에요? 빈 자리는 맨 뒤에 있잖아요.'},
      {text:'"그렇지, 사실 배열이 거의 항상 나아. 연결 리스트는 교재가 다음 장을 만들려고 소개해 두는 개념일 뿐이고, 실제 프로그램에서 배열보다 나은 상황은 거의 없다고 보면 돼."', correct:false, mc:"bigger-array", fb:'그럼 교수님이 왜 한 주를 통째로 리스트에 쓰시겠어요. 뭔가 이유가 있을 텐데요.'}]},
    {id:"Q2", ask:'insert 코드에서요, <span class="mono">temp-&gt;link = node-&gt;link</span> 를 먼저 쓰고 <span class="mono">node-&gt;link = temp</span> 를 나중에 쓰던데 — 어차피 <b>두 줄 다 실행되는데</b> 순서가 왜 중요해요? 뒤집어 써도 되는 거 아니에요?',
     choices:[
      {text:'"node->link 안에 <b>다음 노드의 주소</b>가 들어 있잖아. 뒤집으면 그 주소가 먼저 덮여서 temp->link가 물려받을 값이 사라져 — 뒤 리스트가 통째로 미아가 되지. 물려받는 게 먼저야."', correct:true, fb:'덮어쓰기 전에 옮겨 적기… 컴퓨터는 한 줄씩만 하니까 순서가 곧 생사네요.'},
      {text:'"사실 어느 순서로 써도 결과는 똑같아. C 컴파일러가 대입문들의 의존 관계를 분석해서 안전한 순서로 알아서 재배치해 주거든. 책에 있는 순서는 읽기 좋으라고 정해 둔 관례일 뿐이야."', correct:false, mc:"order-free", fb:'컴파일러가 그런 것까지 해 줘요? 그럼 아무렇게나 써도 된다는 건데… 좀 수상한데요.'},
      {text:'"뒤집으면 잃어버린 노드가 생기긴 하는데, C가 그런 미아 노드를 감지해서 자동으로 회수한 다음 다시 이어 주니까 실제로는 큰 문제가 안 돼. 그래도 습관은 바르게 들이자는 거지."', correct:false, mc:"gc-myth", fb:'지난번에 쌤이 C는 free도 직접 해야 한다면서요. 자동 회수 같은 건 없다고 하지 않으셨어요?'}]},
    {id:"Q3", boss:true, ask:'마지막이요. 배열은 <span class="mono">a[3]</span> 하면 네 번째 게 <b>바로</b> 나오잖아요. 리스트는 세 번째 노드 보고 싶으면 어떡해요? 바로 못 가면… 리스트가 더 구린 거 아니에요?',
     choices:[
      {text:'"바로는 못 가 — 첫 노드부터 링크를 <b>타고 가며 세는</b> 수밖에. 접근은 배열의 완승. 대신 중간 삽입·삭제와 크기 조절은 리스트가 이겨. 우열이 아니라 <b>작업에 맞는 도구</b>를 고르는 거야."', correct:true, fb:'만능이 아니라 분업이구나… 자주 끼어들면 리스트, 자주 들여다보면 배열. 이제 좀 정리돼요.'},
      {text:'"리스트도 사실 바로 갈 수 있어. 노드들이 여기저기 흩어져 있어도 시작 주소에 3을 곱하고 노드 크기를 더하면 세 번째 노드의 주소가 나오거든. 배열이랑 원리는 똑같아."', correct:false, mc:"address-calc-myth", fb:'흩어져 있는데 어떻게 곱셈으로 주소가 나와요? 나란히 있어야 계산이 된다면서요.'},
      {text:'"맞아, 그래서 요즘 프로그램은 다들 리스트만 써. 접근이 조금 느려도 삽입·삭제가 편한 게 무조건 이득이라, 배열은 이제 지나간 자료구조라고 보면 돼."', correct:false, mc:"always-better", fb:'무조건요? 게임 인벤토리처럼 번호로 바로바로 여는 것도 리스트가 나아요? 그건 아닐 것 같은데…'}]}
  ],

  /* ================= 저작형 문항 풀 (14문) — 시련에 40% 혼합 ================= */
  pool: [
    /* --- 유닛 A · 배열의 한계와 연결 표현 --- */
    {id:"P01", unit:"A", stem:'배열(순차적 표현)의 문제점으로 <b>거리가 먼</b> 것은?',
     okfb:'주소 계산으로 임의 원소에 바로 접근하는 것은 순차 표현의 "장점"이다.',
     choices:[
      {text:"인덱스로 임의의 원소에 바로 접근하기 어렵다",correct:true},
      {text:"중간 삽입·삭제 때 뒤 원소들을 전부 옮겨야 한다",correct:false,mc:"concept-flip",fb:"이것은 순차 표현의 대표적인 문제가 맞다 — 문제가 '아닌' 것을 찾아라."},
      {text:"크기를 미리 정해야 해서 기억 장소가 낭비되기 쉽다",correct:false,mc:"concept-flip",fb:"이것도 순차 표현의 문제가 맞다."},
      {text:"예약해 둔 최대 크기를 넘으면 더 늘릴 수가 없다",correct:false,mc:"concept-flip",fb:"이것도 순차 표현의 문제가 맞다."}]},
    {id:"P02", unit:"A", stem:'연결 리스트에서 <b>노드(node)</b>와 <b>링크(link)</b>의 정의로 옳은 것은?',
     okfb:'노드 = 리스트의 원소, 링크 = 다음 원소를 지시하는 포인터.',
     choices:[
      {text:"노드는 리스트의 원소, 링크는 다음 원소를 지시하는 포인터",correct:true},
      {text:"노드는 배열의 한 칸, 링크는 그 칸의 순서 번호(인덱스)",correct:false,mc:"index-myth",fb:"연결 표현은 칸 번호가 아니라 주소로 잇는다."},
      {text:"노드는 리스트의 이름, 링크는 리스트 전체의 시작 주소",correct:false,mc:"name-confuse",fb:"리스트의 이름은 첫 노드를 가리키는 '포인터의 이름'이다."},
      {text:"노드는 데이터의 복사본, 링크는 원본이 있는 파일 경로",correct:false,mc:"copy-myth",fb:"복사본도 파일도 아니다 — 기억장소 안의 원소와 주소다."}]},
    {id:"P03", unit:"A", stem:'P/G 4.1에서 <span class="mono">free(pf)</span> 를 하기 <b>전에</b> <span class="mono">pf = (float *) malloc(sizeof(float));</span> 를 한 번 더 실행하면?', mono:true,
     okfb:'pf가 새 공간으로 갈아타며, 이전 공간은 주소를 아는 이가 없어져 반환할 수 없게 된다.',
     choices:[
      {text:"이전에 빌린 공간의 주소를 잃어 반환할 길이 없어진다",correct:true},
      {text:"이전 공간이 자동으로 반환된 뒤에 새 공간이 할당된다",correct:false,mc:"gc-myth",fb:"C에 자동 반환은 없다 — free를 부를 주소를 잃었을 뿐이다."},
      {text:"같은 공간이 다시 할당되므로 아무 문제도 생기지 않는다",correct:false,mc:"same-space",fb:"malloc은 새 공간을 준다 — 이전 공간은 빌린 채로 표류한다."},
      {text:"두 번째 malloc이 오류를 일으켜 프로그램이 즉시 멈춘다",correct:false,mc:"compiler-magic",fb:"malloc은 군말 없이 새 공간을 준다 — 문제는 조용히 새는 쪽이다."}]},
    /* --- 유닛 B · 만들기와 삽입 --- */
    {id:"P04", unit:"B", stem:'<span class="mono">typedef struct list_node { char data[4]; list_pointer link; };</span> 를 <b>자체 참조 구조</b>라 부르는 이유는?', mono:true,
     okfb:'구조체의 필드(link)가 자기 자신과 같은 타입의 구조체를 가리키기 때문.',
     choices:[
      {text:"필드가 자기와 같은 타입의 구조체를 가리키기 때문",correct:true},
      {text:"구조체가 자신의 데이터 필드를 스스로 읽을 수 있어서",correct:false,mc:"self-read",fb:"자기 데이터를 읽는 것은 모든 구조체가 한다 — 특별한 점은 링크의 타입이다."},
      {text:"typedef가 구조체 이름을 두 번 반복해서 쓰기 때문에",correct:false,mc:"syntax-myth",fb:"이름 반복은 문법의 겉모습 — 핵심은 link 필드가 가리키는 대상이다."},
      {text:"함수가 자기 자신을 다시 호출하는 재귀 구조라서",correct:false,mc:"recursion-mix",fb:"재귀는 함수 이야기 — 이것은 타입이 자신을 참조하는 구조다."}]},
    {id:"P05", unit:"B", stem:'<span class="mono">#define IS_EMPTY(ptr) (!(ptr))</span> — 이 검사가 <b>참</b>이 되는 경우는?', mono:true,
     okfb:'ptr가 NULL일 때 — 첫 노드가 없다는 것이 곧 공백 리스트다.',
     choices:[
      {text:"ptr가 NULL일 때",correct:true},
      {text:"첫 노드의 data가 0일 때",correct:false,mc:"sentinel-myth",fb:"데이터가 0이어도 노드가 있으면 공백이 아니다."},
      {text:"첫 노드의 link가 NULL일 때",correct:false,mc:"off-by-one",fb:"그것은 '노드가 하나뿐'인 리스트다 — 공백과는 다르다."},
      {text:"malloc이 실패했을 때",correct:false,mc:"full-confuse",fb:"그 검사는 IS_FULL의 몫이다."}]},
    {id:"P06", unit:"B", stem:'create2가 first보다 <b>second를 먼저 완성</b>하는 이유로 가장 알맞은 것은?',
     okfb:'first->link = second 로 앞 노드를 걸려면, 걸 대상(second)이 먼저 준비되어 있어야 자연스럽다 — 뒤에서 앞으로.',
     choices:[
      {text:"앞 노드가 걸어야 할 '다음'을 먼저 완성해 두는 순서라서",correct:true},
      {text:"malloc은 반드시 뒤 노드부터 할당하도록 정해져 있어서",correct:false,mc:"syntax-myth",fb:"malloc에 순서 규칙은 없다 — 링크를 거는 논리가 순서를 만든다."},
      {text:"second가 first보다 크기가 커서 먼저 잡아야 안전해서",correct:false,mc:"size-myth",fb:"두 노드는 같은 타입, 같은 크기다."},
      {text:"C에서 뒤에 선언된 변수는 먼저 써야 하는 규칙이 있어서",correct:false,mc:"syntax-myth",fb:"그런 규칙은 없다 — 리스트를 뒤에서 앞으로 짓는 관례일 뿐이다."}]},
    {id:"P07", unit:"B", stem:'교재의 삽입 4단계 — (bat, cat, sat, vat)의 cat 뒤에 mat를 넣을 때, <b>(3)단계와 (4)단계의 올바른 순서</b>는?',
     okfb:'(3) mat의 링크가 cat의 링크 값(sat)을 물려받고 → (4) cat의 링크가 mat를 가리킨다.',
     choices:[
      {text:"mat의 링크에 sat을 먼저 걸고, 그 다음 cat의 링크를 mat로",correct:true},
      {text:"cat의 링크를 mat로 먼저 걸고, 그 다음 mat의 링크에 sat을",correct:false,mc:"order-swap",fb:"cat의 링크를 먼저 덮으면 sat의 주소를 어디서 얻는가?"},
      {text:"sat의 링크를 mat로 걸고, mat의 링크를 cat으로 잇는다",correct:false,mc:"direction-swap",fb:"링크의 방향이 거꾸로다 — 리스트는 앞에서 뒤로 흐른다."},
      {text:"어느 순서로 걸어도 결과 리스트는 완전히 동일하다",correct:false,mc:"order-free",fb:"cat의 링크 안에 든 주소가 유일한 길잡이다 — 덮기 전에 물려받아야 한다."}]},
    /* --- 유닛 C · 삭제와 순회 --- */
    {id:"P08", unit:"C", stem:'리스트에서 mat를 삭제한 뒤에도 <b>mat의 링크는 여전히 sat을 가리킨다</b>. 그런데도 "mat는 리스트에 없다"고 말하는 이유는?',
     okfb:'ptr에서 링크를 따라가서 도달할 수 없기 때문 — 리스트 소속의 기준은 도달 가능성이다.',
     choices:[
      {text:"ptr에서 링크를 따라가도 mat에 도달할 수 없기 때문",correct:true},
      {text:"free가 mat의 링크 필드를 NULL로 지워 버리기 때문",correct:false,mc:"free-auto",fb:"free는 공간을 반환할 뿐 링크 값을 지워 주지 않는다 — 기준은 도달 가능성이다."},
      {text:"mat의 데이터 필드가 삭제 표시로 바뀌어 있기 때문",correct:false,mc:"sentinel-myth",fb:"삭제 표시 같은 것은 없다 — 길이 끊겼을 뿐이다."},
      {text:"sat이 mat를 더 이상 가리키지 않게 되기 때문",correct:false,mc:"direction-swap",fb:"sat은 원래 mat를 가리킨 적이 없다 — 끊긴 것은 cat→mat 길이다."}]},
    {id:"P09", unit:"C", stem:'delete에서 링크를 고친 뒤 <span class="mono">free(node)</span> 를 <b>빠뜨리면</b>?', mono:true,
     okfb:'노드는 리스트에서 빠졌지만 공간은 반환되지 않은 채 힙에 남는다 — 새는 메모리.',
     choices:[
      {text:"리스트에서는 빠지지만 공간이 반환되지 않고 남는다",correct:true},
      {text:"리스트에서 빠지지 않고 계속 출력에 나타나게 된다",correct:false,mc:"free-confuse",fb:"리스트 소속은 링크가 정한다 — 링크는 이미 고쳐졌다."},
      {text:"프로그램이 종료될 때 오류 메시지를 내며 멈춘다",correct:false,mc:"compiler-magic",fb:"아무 소리도 나지 않는다 — 그래서 더 위험한 실수다."},
      {text:"괜찮다 — 쓰이지 않는 공간은 자동으로 회수된다",correct:false,mc:"gc-myth",fb:"C에 자동 회수는 없다 — free만이 반환의 길이다."}]},
    {id:"P10", unit:"C", stem:'첫 노드를 삭제할 때 <b>이중 포인터</b>(list_pointer *ptr)가 필요한 이유는?',
     okfb:'리스트의 시작 주소(ptr 자체)를 함수 안에서 바꿔야 하기 때문 — 값이 아니라 포인터 자신이 바뀐다.',
     choices:[
      {text:"함수 안에서 리스트의 시작 포인터 자체를 바꿔야 해서",correct:true},
      {text:"삭제할 노드와 선행 노드, 두 개를 가리켜야 해서",correct:false,mc:"count-myth",fb:"둘을 가리키는 일은 node와 trail 인자가 한다 — 별이 두 개인 이유가 아니다."},
      {text:"포인터가 두 개면 삭제를 두 배 빨리 할 수 있어서",correct:false,mc:"speed-reduction",fb:"속도가 아니라 '무엇을 바꿀 수 있는가'의 문제다."},
      {text:"free를 부르는 함수는 반드시 이중 포인터를 받아야 해서",correct:false,mc:"syntax-myth",fb:"free는 보통 포인터로 충분하다 — *ptr 대입이 필요한 쪽은 시작 주소 변경이다."}]},
    /* --- 유닛 D · 이중 연결 원형 리스트 --- */
    {id:"P11", unit:"D", stem:'이중 연결 원형 리스트에 <b>헤드 노드</b>를 두는 이유로 가장 알맞은 것은?',
     okfb:'데이터 없는 상주 기준점 — 공백 리스트도 고리 모양을 유지하게 해 준다.',
     choices:[
      {text:"공백일 때도 고리를 유지하는 상주 기준점이 되어서",correct:true},
      {text:"리스트의 노드 개수를 데이터 필드에 세어 두려고",correct:false,mc:"count-myth",fb:"헤드의 item은 데이터를 갖지 않는다 — 개수 저장소가 아니다."},
      {text:"가장 큰 값을 항상 맨 앞에 보관해 두기 위해서",correct:false,mc:"sort-myth",fb:"정렬과 무관하다 — 헤드는 값이 아니라 자리다."},
      {text:"헤드가 있어야 rlink 방향의 이동이 가능해져서",correct:false,mc:"direction-swap",fb:"이동은 링크가 시켜 준다 — 헤드 없이도 돌 수는 있다. 기준점이 요지다."}]},
    {id:"P12", unit:"D", stem:'항등식 <span class="mono">ptr = ptr-&gt;llink-&gt;rlink = ptr-&gt;rlink-&gt;llink</span> 가 말해 주는 이 구조의 특징은?', mono:true,
     okfb:'전위 노드로도 후위 노드로도 쉽게(한 걸음에) 이동할 수 있다는 것.',
     choices:[
      {text:"전위·후위 어느 쪽 이웃으로도 쉽게 이동할 수 있다",correct:true},
      {text:"모든 노드의 llink와 rlink는 항상 같은 곳을 가리킨다",correct:false,mc:"self-link",fb:"같은 곳을 가리키는 것은 공백 리스트의 헤드뿐이다."},
      {text:"리스트를 한 바퀴 돌면 반드시 제자리로 돌아온다",correct:false,mc:"circular-confuse",fb:"그것은 '원형'의 성질 — 항등식은 한 걸음 왕복 이야기다."},
      {text:"어느 노드에서든 헤드 노드까지 한 걸음이면 닿는다",correct:false,mc:"head-count",fb:"헤드까지는 몇 걸음이든 걸릴 수 있다 — 한 걸음인 것은 양옆 이웃이다."}]},
    {id:"P13", unit:"D", stem:'<span class="mono">ddelete</span> 의 두 줄 — <span class="mono">deleted-&gt;llink-&gt;rlink = deleted-&gt;rlink</span> 와 <span class="mono">deleted-&gt;rlink-&gt;llink = deleted-&gt;llink</span> — 가 하는 일은?', mono:true,
     okfb:'왼쪽 이웃과 오른쪽 이웃이 서로를 직접 잡게 한다 — 고리가 삭제 대상을 건너뛰고 닫힌다.',
     choices:[
      {text:"양쪽 이웃이 서로를 직접 가리키게 해 고리를 닫는다",correct:true},
      {text:"삭제할 노드의 두 링크를 NULL로 지워 고리에서 뗀다",correct:false,mc:"null-fear",fb:"deleted의 링크는 손대지 않는다 — 고치는 것은 이웃들의 링크다."},
      {text:"삭제할 노드를 헤드 노드의 바로 옆자리로 옮겨 둔다",correct:false,mc:"head-count",fb:"옮기는 게 아니라 건너뛰는 것이다."},
      {text:"오른쪽 이웃의 데이터를 왼쪽 이웃으로 복사해 채운다",correct:false,mc:"copy-myth",fb:"데이터는 움직이지 않는다 — 링크만 고쳐 쓴다."}]},
    {id:"P14", unit:"D", stem:'이중 연결 리스트가 단순 연결 리스트보다 <b>추가로 지불하는 비용</b>은?',
     okfb:'노드마다 링크 필드가 하나 더(llink) — 공간을 더 내고 양방향 이동을 산다.',
     choices:[
      {text:"노드마다 링크 필드 하나만큼의 기억 장소가 더 든다",correct:true},
      {text:"노드 접근이 단순 리스트의 두 배만큼 느려지게 된다",correct:false,mc:"speed-reduction",fb:"이동은 여전히 한 걸음에 한 링크 — 느려지는 것이 아니라 공간을 내는 것이다."},
      {text:"저장할 수 있는 데이터의 종류가 절반으로 제한된다",correct:false,mc:"type-loose",fb:"item 필드는 그대로다 — 늘어난 것은 링크뿐이다."},
      {text:"별도의 비용 없이 양방향 이동을 공짜로 얻는 셈이다",correct:false,mc:"free-lunch",fb:"공짜는 없다 — 링크 하나만큼의 집세가 어제 오늘의 결론이었다."}]},
    /* --- 확충분 (감수 반영 2026-08-24: 개념·코드 한 줄·경계) --- */
    {id:"P15", unit:"A", stem:'malloc으로 빌린 힙의 공간은 <b>언제까지</b> 살아 있는가?',
     okfb:'free로 돌려줄 때까지 — 빌린 함수가 끝나도 남는다. 그래서 노드를 힙에 짓는다.',
     choices:[
      {text:"free로 돌려줄 때까지 — 빌린 함수가 끝나도 남는다",correct:true},
      {text:"그 공간을 빌린 함수가 return하는 순간까지만 산다",correct:false,mc:"stack-confuse",fb:"그건 스택 영역의 지역 변수 이야기다 — 힙은 함수보다 오래 산다."},
      {text:"프로그램이 정한 일정 시간이 지나면 자동 회수된다",correct:false,mc:"time-myth",fb:"힙에 타이머는 없다 — free 전에는 계속 빌린 상태다."},
      {text:"다음 malloc이 호출되면 그 자리를 내주고 사라진다",correct:false,mc:"evict-myth",fb:"새 malloc은 새 공간을 빌릴 뿐, 남의 공간을 빼앗지 않는다."}]},
    {id:"P16", unit:"A", stem:'<span class="mono">free(pi)</span> 를 실행한 <b>직후에</b> 해 두는 것이 바람직한 일은?', mono:true,
     okfb:'pi = NULL — 반환된 공간을 가리키는 위험한 포인터를 없애 두는 습관이다.',
     choices:[
      {text:"pi = NULL 로 설정해 둔다",correct:true},
      {text:"*pi = 0 으로 값을 지워 둔다",correct:false,mc:"use-after-free",fb:"반환한 공간에 쓰는 것 자체가 위험하다 — 이미 남의 땅일 수 있다."},
      {text:"free(pi)를 한 번 더 호출한다",correct:false,mc:"double-free",fb:"같은 공간을 두 번 반환하는 것은 그 자체로 오류다."},
      {text:"아무것도 안 해도 된다 — free가 pi를 지워 준다",correct:false,mc:"auto-null",fb:"free는 공간만 돌려준다 — pi에는 옛 주소가 그대로 남는다."}]},
    {id:"P17", unit:"A", stem:'배열 대신 <b>연결 리스트</b>를 고르는 것이 알맞은 상황은?',
     okfb:'개수를 미리 모르고 중간 삽입·삭제가 잦을 때 — 리스트의 장기다.',
     choices:[
      {text:"자료의 개수를 미리 알 수 없고 중간 삽입·삭제가 잦을 때",correct:true},
      {text:"번호(인덱스)로 아무 원소나 바로바로 꺼내 봐야 할 때",correct:false,mc:"access-blind",fb:"그건 배열의 장기다 — 리스트는 링크를 타고 가며 세야 한다."},
      {text:"어떤 상황에서든 — 리스트가 배열보다 항상 낫기 때문",correct:false,mc:"always-better",fb:"만능은 없다 — 작업에 맞는 도구를 고르는 것이다."},
      {text:"저장할 값이 문자나 문자열처럼 숫자가 아닐 때",correct:false,mc:"type-myth",fb:"자료형은 어느 쪽이든 담는다 — 관건은 연산의 종류다."}]},
    {id:"P18", unit:"B", stem:'insert 코드의 <span class="mono">if (*ptr)</span> 검사가 확인하는 것은?', mono:true,
     okfb:'리스트에 첫 노드가 있는지(공백이 아닌지) — 공백이면 시작 포인터 자체를 바꾸는 else로 간다.',
     choices:[
      {text:"리스트가 공백이 아닌지 — 첫 노드가 있는지",correct:true},
      {text:"malloc이 새 공간을 빌리는 데 성공했는지",correct:false,mc:"full-confuse",fb:"그 검사는 IS_FULL(temp)의 몫이다."},
      {text:"ptr라는 포인터 변수가 선언되어 있는지",correct:false,mc:"syntax-myth",fb:"선언 여부는 컴파일러가 본다 — 실행 중 검사는 값(NULL인지)을 본다."},
      {text:"리스트에 빈 자리가 하나라도 남아 있는지",correct:false,mc:"array-think",fb:"리스트에 '빈 자리'는 없다 — 필요하면 malloc으로 짓는다."}]},
    {id:"P19", unit:"B", stem:'<span class="mono">temp = (list_pointer) malloc(sizeof(list_node));</span> 한 줄이 하는 일은?', mono:true,
     okfb:'노드 하나 크기의 공간을 힙에서 빌리고, 그 주소를 temp가 가리키게 한다.',
     choices:[
      {text:"노드 한 개 크기의 공간을 빌려 temp가 가리키게 한다",correct:true},
      {text:"기존 리스트의 마지막 노드를 찾아 temp가 가리키게 한다",correct:false,mc:"search-confuse",fb:"malloc은 리스트를 모른다 — 새 공간을 빌릴 뿐이다."},
      {text:"temp라는 이름의 노드를 리스트 맨 앞에 끼워 넣는다",correct:false,mc:"auto-link",fb:"연결은 그 뒤의 링크 대입들이 한다 — 이 줄은 공간 확보뿐이다."},
      {text:"list_node 타입의 크기를 계산해 temp에 숫자로 저장한다",correct:false,mc:"sizeof-confuse",fb:"sizeof는 빌릴 양을 '알려 주는' 쪽이다 — temp가 받는 것은 주소다."}]},
    {id:"P20", unit:"C", stem:'<span class="mono">*ptr = (*ptr)-&gt;link;</span> 를 우리말로 옮기면?', mono:true,
     okfb:'리스트의 시작 포인터가, 지금 첫 노드의 다음 노드를 가리키게 한다 — 첫 노드 삭제의 핵심 문장.',
     choices:[
      {text:"시작 포인터가 첫 노드의 다음 노드를 가리키게 한다",correct:true},
      {text:"첫 노드의 링크 필드를 NULL로 바꿔 리스트를 끊는다",correct:false,mc:"reverse-link",fb:"첫 노드의 링크는 읽기만 한다 — 바뀌는 것은 ptr 자신이다."},
      {text:"첫 노드와 두 번째 노드의 자리(값)를 서로 맞바꾼다",correct:false,mc:"swap-myth",fb:"값은 아무도 움직이지 않는다 — 가리키는 곳만 바뀐다."},
      {text:"두 번째 노드를 복사해 첫 노드 자리에 덮어쓴다",correct:false,mc:"copy-myth",fb:"복사가 아니라 이름표(ptr)를 옮겨 붙이는 것이다."}]},
    {id:"P21", unit:"C", stem:'<span class="mono">trail-&gt;link = node-&gt;link;</span> 실행 <b>직후</b>, node의 링크 필드는?', mono:true,
     okfb:'변하지 않는다 — 여전히 다음 노드를 가리킨다. 다만 ptr에서 node로 오는 길이 사라졌을 뿐.',
     choices:[
      {text:"변하지 않는다 — 여전히 다음 노드를 가리킨다",correct:true},
      {text:"NULL로 바뀌어 리스트와의 연결이 끊어진다",correct:false,mc:"auto-null",fb:"이 문장은 trail의 링크만 바꾼다 — node 쪽은 손대지 않는다."},
      {text:"trail을 가리키게 바뀌어 방향이 거꾸로 된다",correct:false,mc:"reverse-link",fb:"대입의 방향을 보라 — 바뀌는 쪽은 왼쪽(trail->link)이다."},
      {text:"free가 자동으로 호출되어 필드째 사라진다",correct:false,mc:"free-auto",fb:"free는 별도의 한 줄이다 — 자동으로 불리지 않는다."}]},
    {id:"P22", unit:"D", stem:'헤드 노드를 가진 이중 연결 원형 리스트의 <b>공백 검사</b>로 알맞은 것은?',
     okfb:'head의 rlink(또는 llink)가 head 자신이면 공백 — 헤드 홀로 고리를 이루고 있는 상태다.',
     choices:[
      {text:"head의 rlink가 head 자신인지 확인한다",correct:true},
      {text:"head의 링크 필드 값이 NULL인지 확인한다",correct:false,mc:"null-fear",fb:"원형 리스트에 NULL은 없다 — 공백조차 자기 자신으로 닫힌 고리다."},
      {text:"head의 item에 0이 들어 있는지 확인한다",correct:false,mc:"sentinel-myth",fb:"head의 item은 애초에 데이터를 갖지 않는다."},
      {text:"노드 개수를 세는 변수가 0인지 확인한다",correct:false,mc:"count-myth",fb:"개수 변수는 이 구조에 없다 — 링크의 모양이 곧 상태다."}]},
    {id:"P23", unit:"D", stem:'head와 값 30 노드만 있는 이중 연결 원형 리스트에서 <b>30을 ddelete</b>하면?', mono:true,
     okfb:'head 홀로 남아 llink·rlink가 다시 자기 자신을 잡는다 — 공백 리스트로 복귀.',
     choices:[
      {text:"head 홀로 남아 양쪽 링크가 자기 자신을 가리킨다",correct:true},
      {text:"head까지 함께 사라져 아무것도 남지 않게 된다",correct:false,mc:"head-count",fb:"head는 상주 기준점 — ddelete가 삭제를 허락하지 않는다."},
      {text:"30의 자리에 head가 옮겨 가서 고리를 유지한다",correct:false,mc:"swap-myth",fb:"아무도 이사하지 않는다 — 링크가 다시 닫힐 뿐이다."},
      {text:"고리가 끊어져 더 이상 리스트로 쓸 수 없게 된다",correct:false,mc:"null-fear",fb:"양쪽 이웃(둘 다 head)이 서로를 잡으며 고리는 항상 닫힌다."}]},
    /* 코드 검증 보강 (2026-08-24) */
    {id:"P24", unit:"B", stem:'insert 코드의 빈칸에 들어갈 <b>한 줄</b>은?', mono:true,
     code:["/* node 뒤에 새 노드 temp 삽입 (리스트는 공백 아님) */","temp->data = 50;","________________________;","node->link = temp;"],
     okfb:'temp->link = node->link — 앞 노드의 링크를 덮기 전에, 그 안의 "다음 주소"를 새 노드가 먼저 물려받는다.',
     choices:[{text:"temp->link = node->link",correct:true},{text:"node->link = temp->link",correct:false,mc:"reverse-link",fb:"방향이 거꾸로다 — 물려받는 쪽은 새 노드(temp)다."},{text:"temp->link = node",correct:false,mc:"self-link",fb:"뒤로 가리키면 고리가 생긴다 — temp는 node의 '다음'을 물려받아야 한다."},{text:"temp->link = NULL",correct:false,mc:"lost-tail",fb:"항상 NULL이면 node 뒤의 리스트가 통째로 끊긴다."}]},
    {id:"P25", unit:"C", stem:'이 delete 코드의 <b>잘못된 곳</b>은?', mono:true,
     code:["void delete(list_pointer *ptr, list_pointer trail, list_pointer node) {","    if (trail)","        trail->link = node->link;","    else","        *ptr = (*ptr)->link;","    free(trail);                  /* ← */","}"],
     okfb:'반환할 것은 삭제 대상 node다 — free(trail)은 멀쩡한 선행 노드를 반환해 버린다.',
     choices:[{text:"free의 대상이 node가 아니라 trail이다",correct:true},{text:"if와 else 분기의 두 문장이 서로 뒤바뀌어 있다",correct:false,mc:"branch-swap",fb:"분기는 교재 그대로다 — trail이 있으면 링크 대체, 없으면 시작 변경."},{text:"free는 링크를 고치기 전에 먼저 호출해야 한다",correct:false,mc:"free-first",fb:"먼저 반환하면 node->link를 읽을 때 이미 남의 공간이다."},{text:"잘못된 곳이 없다 — 그대로 동작한다",correct:false,mc:"no-bug",fb:"이대로면 산 노드가 반환되고, 죽은 노드는 힙에 남는다 — 이중 사고다."}]},
    {id:"P26", unit:"C", ptype:"parsons", stem:'delete 함수 — 코드를 <b>올바른 순서</b>로 조립하라. (분기 구조와 free의 자리에 주의)', mono:true,
     lines:["void delete(list_pointer *ptr, list_pointer trail, list_pointer node) {","    if (trail)","        trail->link = node->link;","    else","        *ptr = (*ptr)->link;","    free(node);","}"],
     okfb:'분기(있으면 trail의 링크, 없으면 *ptr)를 끝낸 뒤 마지막에 free — 먼저 반환하면 node->link를 읽을 수 없다.',
     fb:"뼈대부터 — 선언, if/else 분기, 그리고 반환. free가 앞으로 오면 반환된 공간의 링크를 읽게 된다."}
  ]
};
