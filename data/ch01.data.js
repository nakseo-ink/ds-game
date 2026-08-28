"use strict";
/* 챕터 1 데이터 — "배열과 구조" (강의 2장)
   엔진(js/engine.js)은 이 객체만 읽는다. 챕터 추가 = 이런 데이터 파일 추가. */
const CH01 = {
  meta: { id:"ch01", week:1, title:"배열과 구조", sub:"나란한 칸, 묶인 칸", nextTeaser:"스택이랑 큐", nextHint:'교수님이 "접시 쌓기"라던데… 그게 뭔 소리예요?' },

  economy: { payPerPoint:1000, aplusBonus:200000 },   /* 과외비 = 점수 × 1000원 · A+ 보너스는 크게! */
  exam: { unitPts:14, tutorPts:10, passLine:60 },

  intro: [
    {who:"도윤", face:"doyun", text:'쌤, 오늘 수업에서 <b>배열이랑 구조체</b> 들어갔어요. 교수님이 칠판에 <span class="mono">a + i × sizeof(int)</span> 이런 걸 쓰는데… 솔직히 하나도 모르겠어요.'},
    {who:"도윤", face:"doyun-worried", text:'<b>다음 주 월요일 수업 시간에 쪽지시험</b>이래요. 수요일 과외 때까지 어떻게 좀 해주세요.'},
    {who:"나", face:"me-awkward", text:'<span class="inner">…배열? 엑셀 같은 건가. 일단 "그건 기본이지"라고 대답은 해버렸다. 큰일 났다. 오늘 밤, 책부터 펴자.</span>'}
  ],

  /* 유닛 숙달 후 하루를 맺는 짧은 장면 (A·B는 기존 맺음 씬에 덧붙고, C·D·E는 단독 장면) */
  interludes: {
    A: [
      {who:"도윤", face:"doyun-happy", text:'(문자) 쌤 뭐해요? 저는 치킨 먹어요 ㅎ'},
      {who:"나", face:"me-worried", text:'(답장) 나는 네 시험공부를 한다;; 먼저 자라. 닭다리는 남겨두고.'}
    ],
    B: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤 내일 과외죠? 올 때 아이스크림 사다 주시면 안 돼요?'},
      {who:"나", face:"me", text:'(답장) 주급 받으면. 그러니까 네가 시험을 잘 봐야 한다.'}
    ],
    C: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤 자요? 시험 낼모레인데… 저 오늘 딱 게임 한 판만 해도 돼요?'},
      {who:"나", face:"me-worried", text:'(답장) …딱 한 판만이다. 나는 지금 union이랑 싸우는 중이니까, 넌 이기고 자라.'}
    ],
    D: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 근데 다항식 같은 건 대체 어디에 써요?'},
      {who:"나", face:"me", text:'(답장) …네 성적 그래프도 다항식이야. 지금은 내려가는 곡선이지만, 월요일에 뒤집자.'},
      {who:"도윤", face:"doyun-worried", text:'(문자) 매정하시네요;;'}
    ],
    E: [
      {who:"나", face:"me-proud", text:'<span class="inner">한 주치 자습이 끝났다. 손가락이 저릿하다… 내일은 토요일. 도윤이가 어디까지 왔는지 볼 차례다.</span>'}
    ]
  },

  /* 공부 단계 — 대화형 자습 (독학 완결 목표)
     beat: {say, who:"me"|"book", mood?, code?, strip?, sparse?} | {gate:{id,q,basics:[beats]}} | {check:{...}} */
  study: {
    A: { day:"월요일", label:"유닛 A", title:"배열 (array)", doneLabel:"시련 시작 — 주소 계산 ▶", beats:[
      {say:'후… 첫 자습이다. 통장 잔고를 보니 힘이 난다 — <b>0원이니까, 벌어야지.</b> 좋아, 배열부터.', mood:"awkward"},
      {who:"book", say:'"학생 100명의 점수를 저장한다고 하자. 변수를 100개 선언할 것인가?"',
       code:["int score1, score2, score3, /* … */ score100;   /* ?! */","","int score[100];   /* 100명의 점수를 '한 이름 + 번호'로 */"]},
      {say:'변수 100개는 미친 짓이지. 그래서 배열이구나 — <b>같은 타입 여러 개를 한 이름에, 번호(index)로 구분.</b>'},
      {who:"book", say:'"선언은 <span class="mono">타입 이름[크기]</span>. 일부만 초기화하면 나머지는 0. 아예 초기화하지 않으면 쓰레기값이다. 원소 개수는 <span class="mono">sizeof(list)/sizeof(int)</span>."',
       code:["int list[5] = {7, 2, 9, 4, 1};  /* 완전 초기화 */","int a[5]    = {7, 2};           /* 부분 초기화 — 나머지는 0 */","int b[]     = {7, 2, 9};        /* 크기 생략 — 컴파일러가 3으로 */","int c[5];                       /* 초기화 없음 — 쓰레기값! */"]},
      {check:{id:"A-chk1", stem:'<span class="mono">int a[5] = {7, 2};</span> 일 때 <span class="mono">a[4]</span>의 값은?', mono:true,
        okfb:'부분 초기화의 나머지 칸은 0으로 채워진다.',
        choices:[{text:"0",correct:true},{text:"쓰레기값",correct:false,mc:"partial-init",fb:"초기화를 '일부라도' 하면 나머지는 0이다. 쓰레기값은 아예 초기화하지 않았을 때."},{text:"2",correct:false,mc:"partial-init",fb:"2는 a[1]에 들어갔다. 지정하지 않은 칸은 0."}]}},
      {gate:{id:"A-g-sizeof", q:'잠깐 — 그런데 <span class="mono">sizeof</span>… 자료형마다 크기가 다르다는 건 확실히 알고 있나?', basics:[
        {who:"book", say:'"모든 데이터는 메모리에서 <b>바이트 단위의 칸</b>을 차지한다. <span class="mono">char</span>=1바이트, <span class="mono">int</span>=4바이트, <span class="mono">double</span>=8바이트. <span class="mono">sizeof(타입)</span>이 그 크기를 알려준다."'},
        {say:'아, 타입마다 칸의 폭이 다르구나. int 배열이면 한 칸이 4바이트.'}
      ]}},
      {who:"book", say:'"배열의 정체는 <b>일련의 연속적인 메모리 위치</b>다."',
       strip:{base:0x1000,size:4,values:[7,2,9,4,1],showAddr:false}},
      {say:'칸이 <b>연속</b>으로 붙어 있다… 이 성질에서 배열의 장점도 약점도 다 나오겠군.'},
      {gate:{id:"A-g-hex", q:'주소가 <span class="mono">0x1000</span>처럼 생겼던데… 16진수 표기는 읽을 줄 알지?', basics:[
        {who:"book", say:'"<span class="mono">0x</span>는 16진수 표기다. 한 자리가 0~15(0~9, A~F). <span class="mono">0x1000 + 4 = 0x1004</span>, <span class="mono">0x1008 + 4 = 0x100C</span> (12는 C)."'},
        {say:'0x100C의 C가 12라는 뜻이구나. 주소는 그냥 16진수로 쓴 번지수다.'}
      ]}},
      {who:"book", say:'"각 칸에는 주소가 있다. 첫 칸의 주소를 base라 하면 — <span class="mono">list[i]의 주소 = base + i × sizeof(int)</span>"',
       strip:{base:0x1000,size:4,values:[7,2,9,4,1],showAddr:true}},
      {say:'i는 "몇 번째"가 아니라 <b>"시작에서 몇 칸 떨어졌나(offset)"</b>구나. 첫 칸은 0칸 떨어져 있으니 list[0]… <b>그래서 0부터 시작하는 거였어!</b>', mood:"proud"},
      {who:"book", say:'"따라서 크기 5인 배열의 원소는 list[0]~list[4]. <b>list[5]는 존재하지 않는다.</b> 그런데 C는 <b>경계를 검사하지 않는다</b> — list[5]를 읽으면 배열 바로 뒤의 메모리(무엇이 있을지 알 수 없는 곳)를 그대로 읽어버리고, <b>결과는 예측할 수 없다</b>. 스스로 지켜야 한다."'},
      {check:{id:"A-chk2", stem:'<span class="mono">int list[5]</span>의 <b>마지막 원소</b>는?', mono:true,
        okfb:'크기가 5여도 offset은 0부터 — 마지막은 4다.',
        choices:[{text:"list[4]",correct:true},{text:"list[5]",correct:false,mc:"bounds",fb:"list[5]는 배열 밖이다. C는 경계를 검사하지 않으므로 무슨 값이 읽힐지 알 수 없다."},{text:"list[-1]",correct:false,mc:"bounds",fb:"음수 offset도 배열 밖이다."}]}},
      {who:"book", say:'"예: <span class="mono">list[3]의 주소 = 0x1000 + 3×4 = 0x100C</span>. 몇 번째 칸이든 곱셈 한 번, 덧셈 한 번이면 주소가 나온다."',
       strip:{base:0x1000,size:4,values:[7,2,9,4,1],showAddr:true,hiIdx:3,dimOthers:true}},
      {who:"book", say:'"<b>임의의 원소에, 앞의 원소들을 거치지 않고 곧바로 접근할 수 있는 성질</b>을 <b>랜덤 액세스(random access)</b>라 한다. 배열이 이것이 가능한 이유가 바로 위의 주소 계산이다."'},
      {who:"book", say:'"모든 원소를 차례로 방문하는 것이 <b>순회(traversal)</b>다. 원소 n개를 전부 보므로, 걸리는 시간은 <b>원소 수 n에 비례</b>한다."',
       code:["int sum = 0, max = list[0];","for (int i = 0; i < 5; i++) {   /* 유효 인덱스는 0 ~ 4 (n-1) */","    sum += list[i];","    if (list[i] > max) max = list[i];","}"]},
      {gate:{id:"A-g-bigo", q:'그런데 책 여기저기에 <span class="mono">O(n)</span>, <span class="mono">O(1)</span> 같은 표기가 보인다… 이게 뭔지 아나?', basics:[
        {who:"book", say:'"알고리즘의 비용은 <b>입력 크기 n이 커질 때 얼마나 늘어나는가</b>로 잰다. n에 비례해 늘면 <b>O(n)</b>, n과 무관하게 일정하면 <b>O(1)</b>이라 쓴다 — <b>빅오(Big-O) 표기법</b>이다. 지금은 이 둘만 알면 충분하다."'},
        {say:'커질 때 얼마나 느려지는가를 재는 자(尺)구나. 비례하면 O(n), 항상 일정하면 O(1).'}
      ]}},
      {say:'그리고 조건이 <b>i &lt; n</b>인 이유 — 유효한 인덱스가 0부터 n−1까지니까. <span class="mono">i &lt;= n</span>으로 쓰면 마지막 바퀴에 list[n], 배열 밖을 읽는 사고가 난다.'},
      {who:"book", say:'"이제 배열의 약점. 정렬을 유지하며 <b>중간에 삽입</b>하려면 — 뒤의 원소를 전부 한 칸씩 밀어야 한다. 맨 앞 삽입이면 n개 전부, O(n)."',
       strip:{base:0x1000,size:4,values:[7,2,9,4,1],showAddr:false,hiIdx:2,dimOthers:true}},
      {say:'잠깐 — 100만 개짜리 배열이면 100만 번을 민다고?!', mood:"shock"},
      {check:{id:"A-chk3", stem:'원소 100만 개인 배열의 <b>맨 앞</b>에 새 원소를 삽입하면, 밀어야 하는 원소는 약 몇 개인가?',
        okfb:'전부 밀린다. 삽입 위치 뒤의 모든 원소가 이동 — 최악 O(n).',
        choices:[{text:"100만 개",correct:true},{text:"1개",correct:false,mc:"shift-cost",fb:"한 칸을 비우려면 그 뒤의 '전부'가 밀려야 한다. 붙어 있으니까."},{text:"약 20개 (log₂ 100만)",correct:false,mc:"shift-cost",fb:"log는 이진 탐색의 비용이다. 삽입의 이동 횟수와는 무관."}]}},
      {who:"book", say:'"삭제도 마찬가지 — 구멍을 메우려 당긴다, O(n). 정리: <b>접근 O(1), 탐색 O(n), 중간 삽입·삭제 O(n)</b>. 칸이 붙어 있지 않아도 순서를 유지할 수는 없을까? — 3장에서."'},
      {say:'접근은 빛처럼 빠른데 <b>삽입·삭제에는 큰 비용이 든다</b>… "연속"의 대가란 거지. 좋아, 배열의 힘 — 주소 계산부터 내 것으로 만들자.', mood:"proud"}
    ]},

    B: { day:"화요일", label:"유닛 B", title:"함수에 값을 넘기는 두 가지 방법", doneLabel:"트레이스 시작 ▶", beats:[
      {say:'몸이 천근만근… 그래도 어제 책 귀퉁이의 그 문장을 풀어야 잠이 올 것 같다 — <b>"배열을 함수에 넘기면 원본이 바뀐다"</b>. 오늘 밤의 목표다.', mood:"awkward"},
      {who:"book", say:'"먼저 함수 호출의 기본. 인자는 <b>값의 복사본</b>으로 전달된다."',
       code:["void twice(int n) {   /* n은 x의 '복사본' */","    n = n * 2;","}","","int main(void) {","    int x = 7;","    twice(x);          /* x의 값 7이 복사되어 n에 담긴다 */","    printf(\"%d\", x);","}"]},
      {check:{id:"B-chk0", stem:'위 코드에서 <span class="mono">twice(x)</span>가 끝난 뒤, main의 <span class="mono">x</span>는?', mono:true,
        okfb:'바뀐 것은 복사본 n뿐이다. x와 n은 서로 다른 저장 공간이다.',
        choices:[{text:"그대로 7",correct:true},{text:"14",correct:false,mc:"value-vs-ref",fb:"함수 안에서 바뀐 것은 복사본 n이다. x는 자기 자리에 그대로 있다."},{text:"쓰레기값",correct:false,mc:"garbage-confusion",fb:"x는 건드려지지 않았다. 원래 값 그대로다."}]}},
      {gate:{id:"B-g-cbv", q:'이 두 용어로 정리해서 알고 있나 — <b>call by value</b>와 <b>call by reference</b>?', basics:[
        {who:"book", say:'"방금 본 것이 <b>call by value</b> — 값의 복사본을 전달하므로 원본은 절대 바뀌지 않는다. C의 함수 호출은 <b>언제나</b> 이 방식이다."'},
        {who:"book", say:'"그런데 <b>주소를 값으로</b> 전달하면 이야기가 달라진다. 복사된 것은 주소지만, 그 주소로 찾아가 <b>원본을 바꿀 수 있다</b>. 이 관용을 <b>call by reference</b>라 부른다."',
         code:["void twice(int *p) {   /* p는 x의 '주소'를 받는다 */","    *p = *p * 2;       /* p가 가리키는 곳 = x 자체를 고친다 */","}","","twice(&x);   /* x의 주소를 전달 */"]},
        {say:'값을 주면 복사본만 바뀌고, 주소를 주면 원본이 바뀐다. 구분 기준은 <b>&와 *가 있느냐</b>… 인 줄 알았는데?'}
      ]}},
      {who:"book", say:'"이제 배열. <b>배열 이름 list는 식에서 첫 원소의 주소로 해석된다.</b> 그래서 <span class="mono">list+i = &list[i]</span>, <span class="mono">*(list+i) = list[i]</span>. 단, 포인터 변수와 달리 list 자체는 주소를 담는 저장 공간이 아니므로 다른 주소를 대입할 수는 없다."'},
      {check:{id:"B-chk1", stem:'<span class="mono">*(list+2)</span>와 항상 같은 것은?', mono:true,
        okfb:'*(list+i) = list[i] — 표기만 다를 뿐 같은 원소다.',
        choices:[{text:"list[2]",correct:true},{text:"&list[2]",correct:false,mc:"addr-vs-value",fb:"&는 주소, *는 값. *(list+2)는 이미 값을 꺼낸 것이다."},{text:"list+2",correct:false,mc:"addr-vs-value",fb:"그건 주소다. *가 붙어야 값."}]}},
      {say:'잠깐. 그럼 <span class="mono">sum(input, 5)</span> — 겉모습엔 &도 *도 없다. 영락없는 call by value처럼 생겼는데… <b>input은 이름 자체가 첫 원소의 주소</b>라면, 실제로 넘어가는 건 뭐지?', mood:"shock"},
      {say:'직접 확인하자. 세 가지 호출을 한 줄씩 실행해 본다 — 값 전달, 주소 전달, 그리고 배열.'}
    ]},

    C: { day:"목요일", label:"유닛 C", title:"구조체(struct)와 union", doneLabel:"다음 — 자기 자신을 가리키는 구조 ▶", beats:[
      {say:'수요일 과외를 버텨냈다. 오늘은 구조체 — 도윤이네 반 명단을 만든다 치고 시작하자.'},
      {who:"book", say:'"이름, 학번, 성적 — 현실의 데이터는 <b>타입이 다른 값들이 한 덩어리</b>다. 배열은 같은 타입만 모을 수 있다."',
       code:["char  name[10];   /* 이름 */","int   id;         /* 학번 */","float score;      /* 성적 */"]},
      {say:'타입이 제각각이니 배열로는 못 묶는다… 덩어리째 묶는 도구가 필요해.'},
      {who:"book", say:'"<b>struct</b>가 그 도구다. 멤버들은 메모리에 나란히 놓이고, 접근은 점(.). 중첩이면 점을 두 번: <span class="mono">s1.birth.month</span>"',
       code:["typedef struct {","    char  name[10];   /* 10바이트 */","    int   id;         /*  4바이트 */","    float score;      /*  4바이트 */","} student;","","student s1;","s1.id = 20261234;","strcpy(s1.name, \"doyun\");   /* 문자 배열엔 strcpy */"]},
      {gate:{id:"C-g-typedef", q:'<span class="mono">typedef</span>… 이게 정확히 뭐 하는 거더라?', basics:[
        {who:"book", say:'"<span class="mono">typedef</span>는 타입에 <b>별칭</b>을 붙인다. <span class="mono">typedef struct {…} student;</span> 뒤에는 <span class="mono">student s1;</span>처럼 새 타입 이름으로 쓴다. 한 가지 주의 — <b>별칭은 정의가 끝나는 순간에 생긴다.</b> 그래서 정의가 진행 중인 구조체 안에서는 아직 별칭을 쓸 수 없다(이 사실이 곧 중요해진다)."'},
        {say:'타입에 이름표를 붙이는 것. 단, 이름표는 정의가 끝나야 붙는다 — 기억해 두자.'}
      ]}},
      {who:"book", say:'"구조체를 배열에 담으면 — <b>학생 30명</b>. 전체 크기는 30 × sizeof(student). 주소 계산도 어제 그대로다: 칸 하나의 크기가 구조체 크기일 뿐."',
       code:["student class[30];        /* 학생 30명 */","class[2].score = 95.5;    /* 3번째 학생의 성적 */"]},
      {check:{id:"C-chk1", stem:'<b>5번째 학생</b>의 성적에 접근하는 표현은?', mono:true,
        okfb:'5번째 = offset 4. 배열 인덱스가 먼저, 멤버가 나중.',
        choices:[{text:"class[4].score",correct:true},{text:"class[5].score",correct:false,mc:"off-by-one",fb:"5번째의 offset은 4다 — 배열은 0부터."},{text:"class.score[4]",correct:false,mc:"member-access-path",fb:"배열의 원소를 먼저 고르고(class[4]), 그 안의 멤버로 들어간다."}]}},
      {who:"book", say:'"<b>union</b>은 선언은 struct와 비슷하지만 멤버들이 <b>한 칸을 겹쳐 쓴다</b>. 크기는 가장 큰 멤버 하나만큼. 한 시점에는 마지막에 저장한 멤버 하나만 유효하다."',
       code:["union share {","    int   i;","    float f;","};   /* 두 멤버가 '같은 칸'을 공유 */"]},
      {say:'struct는 나란히, union은 겹쳐서. 메모리를 아끼는 대신 한 번에 하나만 — 트레이드오프네.'},
      {who:"book", say:'"마지막 주제. 구조체의 멤버로 <b>포인터</b>를 둘 수 있다 — 그런데 그 포인터가 <b>자기 자신과 같은 타입</b>을 가리킨다면?"',
       code:["typedef struct list {         /* 'list'는 태그 — 정의 안에서 쓸 이름 */","    char data;","    struct list *link;        /* 자기 타입을 가리키는 포인터 */","} list;                       /* 정의가 끝나며 별칭 list 완성 */"]},
      {who:"book", say:'"두 가지가 핵심이다. 첫째, 정의 안에서는 별칭이 아직 없으므로 <b>태그(struct list)</b>로 자신을 가리킨다. 둘째, 멤버는 <b>실물이 아니라 포인터</b>여야 한다 — 실물을 넣으면 자기 안에 자기가 통째로 들어가는 무한 구조가 되어 크기를 정할 수 없지만, 포인터는 어떤 타입을 가리키든 주소 하나 크기라 문제가 없다."'},
      {say:'구조체 안에 "다음 것의 주소"를 적는 칸이 하나 있는 거구나. 상자마다 다음 상자의 주소가 적힌 쪽지가 들어 있는 셈.'},
      {who:"book", say:'"그 쪽지를 따라가 보자. 세 개의 노드를 만들고 link를 이어 붙이면 —"',
       code:["list item1, item2, item3;","item1.data = 'a';  item2.data = 'b';  item3.data = 'c';","","item1.link = &item2;   /* a의 쪽지에 b의 주소를 적는다 */","item2.link = &item3;   /* b의 쪽지에 c의 주소를 */","item3.link = NULL;     /* c는 마지막 — 다음이 없다 */"]},
      {who:"book", say:'"이제 item1의 주소 하나만 알면 a → b → c 를 전부 찾아갈 수 있다. 반대로, 어떤 노드도 이 사슬에서 가리키지 않는다면 — 그 노드에게 갈 방법이 없다."'},
      {say:'첫 노드가 열쇠고, 링크가 길이다. 길이 끊기면 못 찾는다는 거지… 직접 이어 봐야겠다.', mood:"excited"}
    ]},

    D: { day:"금요일", label:"유닛 D", title:"다항식 — 현실의 정보를 어떻게 저장할까", doneLabel:"padd 트레이스 시작 ▶", beats:[
      {say:'금요일 밤. 남들은 불금인데 나는 다항식이다. …주급을 생각하자, 주급.', mood:"awkward"},
      {who:"book", say:'"자료구조 설계의 출발점 — <b>현실의 정보를 메모리에 어떻게 저장할 것인가.</b> 연습 문제: 다항식 <b>A(x) = 2x<sup>100</sup></b> 을 저장해 보라."'},
      {say:'음… 배열에 2랑 x랑 100을 넣어? 아니지, x는 문자잖아. 그럼 구조체? 아니면 2를 100번 저장해야 하나?'},
      {who:"book", say:'"저장 방법을 결정하는 것은 <b>용도</b>다. 다항식으로 할 일은 덧셈 같은 <b>연산</b> — x는 이름일 뿐 계산에 등장하지 않는다. 연산에 필요한 정보는 <b>계수 2와 지수 100</b>, 단 둘이다."'},
      {say:'그렇네. x는 변하지도 않고 계산에 쓰이지도 않는다. 남는 건 숫자 두 개 — (2, 100).', mood:"proud"},
      {who:"book", say:'"방금 한 생각에는 정식 명칭이 있다 — <b>추상 자료형(ADT, Abstract Data Type)</b>. 자료형을 <b>어떤 데이터를 다루고 어떤 연산을 제공하는가</b>로만 정의하고, <b>어떻게 구현하는가</b>는 뒤로 미루는 방식이다. \'다항식\'이라는 ADT는 「계수·지수들의 모임 + 덧셈 같은 연산의 약속」 — 구현이 배열이든 구조체든, 이 약속은 변하지 않는다."'},
      {say:'0장 헌책방 여백에 스쳐 갔던 그 메모구나 — "구현은 미루고 연산부터 생각하기." 이제 정식 이름으로 기억하자. <b>추상 자료형, ADT.</b>', mood:"proud"},
      {who:"book", say:'"<b>방법 1 — 배열의 특징을 이용하라.</b> 지수를 인덱스로 쓰면 <span class="mono">coef[100] = 2</span> — 101번째 방에 2를 넣는 순간, <b>지수는 따로 저장할 필요조차 없다.</b> 위치가 곧 지수니까."',
       strip:{labels:["[100]","[99]","…","[1]","[0]"],values:["2","0","0×97","0","0"],showAddr:false}},
      {say:'인덱스에 정보를 실어버리는 발상이네. 저장은 계수 하나뿐 — 깔끔하다.'},
      {who:"book", say:'"그러나 <b>희소 다항식</b>이라면? <span class="mono">2x<sup>1000</sup> + 1</span> 은 항이 2개뿐인데 방은 1001개 — 999개가 0으로 버려진다. 이때는 <b>지수도 데이터로 직접 저장</b>하는 편이 낫다."'},
      {say:'지수를 데이터로 저장한다면… 계수 2와 지수 1000이 <b>한 항으로 묶여야</b> 하잖아? 묶는 도구 — 어제 배운 <b>구조체</b>!', mood:"excited"},
      {who:"book", say:'"그렇다. 그리고 항이 여러 개니 <b>구조체 배열</b>이 된다. 남는 문제 하나 — 항이 몇 개인지 배열만 봐서는 알 수 없다. 그래서 <b>첫 방에 항의 개수를 저장</b>해 끝을 알 수 있게 한다."',
       code:["typedef struct {","    float coef;    /* 계수 */","    int   expon;   /* 지수 */","} polynomial;","","polynomial terms[10];","terms[0].expon = 2;        /* 첫 방: 항의 개수 */","terms[1].coef = 2; terms[1].expon = 1000;   /* 2x^1000 */","terms[2].coef = 1; terms[2].expon = 0;      /* 1 */"]},
      {check:{id:"D-chk1", stem:'<b>x<sup>1000</sup> + 1</b> 을 저장하기에 유리한 표현은?',
        okfb:'항 2개뿐인 희소 다항식 — 있는 항만 저장하는 방법 2가 압도적으로 유리하다.',
        choices:[{text:"방법 2 (계수·지수 쌍)",correct:true},{text:"방법 1 (지수=인덱스)",correct:false,mc:"sparse-waste",fb:"방 1001개 중 999개가 0 — 희소할수록 방법 1은 낭비다."},{text:"둘 다 같다",correct:false,mc:"sparse-waste",fb:"2칸 vs 1001칸. 같을 수 없다."}]}},
      {who:"book", say:'"방법 2로 저장한 두 다항식 A, B를 더하는 <b>padd</b>. 두 다항식 모두 지수 내림차순으로 정돈되어 있으므로, <b>맨 앞 항끼리 지수를 비교</b>하며 한 번의 스캔으로 끝낸다."',
       code:["/* COMPARE(a, b): a > b 이면 1, a == b 이면 0, a < b 이면 -1 */","switch (COMPARE(A의 지수, B의 지수)) {","  case  1: A의 항을 결과에 attach;  A를 다음 항으로;  break;","  case -1: B의 항을 결과에 attach;  B를 다음 항으로;  break;","  case  0: 계수합 = A의 계수 + B의 계수;","           if (계수합 != 0) 합친 항을 attach;   /* 0이면 생략 */","           둘 다 다음 항으로;","}"]},
      {who:"book", say:'"<b>case 1</b> — A의 지수가 더 클 때: 결과도 내림차순이어야 하므로 더 큰 A의 항을 먼저 붙인다. 예: A의 3x<sup>5</sup> vs B의 2x<sup>3</sup> → 3x<sup>5</sup>부터."'},
      {who:"book", say:'"<b>case -1</b> — B의 지수가 더 클 때: 대칭이다. B의 항을 붙이고 B만 전진한다."'},
      {who:"book", say:'"<b>case 0</b> — 지수가 같을 때: 같은 차수의 항이므로 계수를 합쳐 하나로 붙인다. 단, 합이 0이면 그 항은 <b>소거</b> — 아무것도 붙이지 않는다. 예: 3x<sup>2</sup>와 −3x<sup>2</sup>."'},
      {say:'규칙은 셋 — 큰 쪽 먼저, 같으면 합치고, 합이 0이면 조용히 사라진다. 직접 굴려 보자.', mood:"proud"}
    ]},

    E: { day:"금요일 밤", label:"유닛 E", title:"희소 행렬 (sparse matrix)", doneLabel:"triple 표현 연습 시작 ▶", beats:[
      {say:'오늘의 마지막 유닛. 여기만 넘으면 이번 주 자습은 끝이다. 힘내자.'},
      {who:"book", say:'"<b>행렬(matrix)</b> — 행(row)과 열(col)로 이루어진 2차원 표다. 게임 맵, 성적표, 이미지 픽셀… 2차원 정보는 어디에나 있다. 이것을 어떤 자료구조에 담으면 좋을까?"'},
      {say:'2차원 표라… 배열을 2차원으로 쓰면 되지 않나? <span class="mono">int a[6][6]</span> 같은.'},
      {who:"book", say:'"그렇다. <b>2차원 배열이 행렬의 가장 일반적인 표현</b>이다 — 인덱스 (행, 열)가 곧 위치이고, 그 방의 값이 데이터다. 접근도 O(1)로 빠르다."',
       code:["int a[6][6];      /* 6×6 행렬 */","a[2][3] = -6;     /* 2행 3열의 값 */"]},
      {who:"book", say:'"O(1)의 근거는 유닛 A의 <b>주소 계산</b> 그대로다. 메모리는 결국 한 줄 — C는 2차원 배열을 <b>행 우선(row-major)</b>으로 편다. 0행을 전부 놓고, 그 뒤에 1행을 잇는 식이다. 그래서 <span class="mono">a[i][j]</span>의 주소는 <b>시작 주소 + (i × 열 수 + j) × 원소 크기</b> — 앞선 행들의 원소 i×열 수 개와, 같은 행에서 앞의 원소 j개를 건너뛴 자리다."',
       code:["int a[3][4];   /* 행 우선 — a[0][0..3], a[1][0..3], a[2][0..3] 이 한 줄로 이어진다 */","/* a[i][j] 의 주소 = 시작 주소 + (i*4 + j) * sizeof(int) */"]},
      {who:"book", say:'"그런데 36칸 중 <b>0이 아닌 값이 8개뿐</b>이라면? 의미 있는 데이터 8개를 위해 0을 28개나 저장한다. <b>데이터가 몇 개 없을 때, 인덱스=위치 표현은 낭비다.</b> 이런 행렬을 <b>희소 행렬</b>이라 한다."'},
      {who:"book", say:'"발상을 뒤집자 — <b>인덱스로 나타내던 위치(행, 열)를 값으로 직접 저장</b>하는 것이다. 0이 아닌 항 하나를 <b>&lt;row, col, value&gt;</b> 세 값의 묶음(triple)으로. 묶음이니 — 구조체다."',
       code:["typedef struct {","    int row, col;     /* 위치를 '데이터로' 저장 */","    int value;","} term;","","term a[10];           /* triple의 배열 */"]},
      {say:'다항식에서 지수를 데이터로 저장했던 것과 똑같은 발상이네 — 이번엔 위치를 데이터로.', mood:"proud"},
      {who:"book", say:'"예를 보자. 아래 4×4 행렬에서 0이 아닌 항은 3개 — 각각 triple로 적으면 오른쪽 표가 된다. 저장 순서는 <b>행 번호순, 같은 행이면 열 번호순(row major)</b>."',
       sparse:{n:4, elems:[{r:0,c:1,v:5},{r:1,c:3,v:-2},{r:3,c:0,v:9}], mode:"data"}},
      {who:"book", say:'"남은 문제 — 항이 몇 개인지 알 수 없다. 다항식과 같은 문제, 같은 해법이다: <b>첫 방 a[0]에 &lt;행수, 열수, 항수&gt;</b>를 저장한다. 데이터는 a[1]부터."',
       sparse:{n:4, elems:[{r:0,c:1,v:5},{r:1,c:3,v:-2},{r:3,c:0,v:9}], mode:"full"}},
      {check:{id:"E-chk1", stem:'triple 배열에서 <span class="mono">a[0] = (6, 6, 8)</span>의 <b>8</b>이 뜻하는 것은?', mono:true,
        okfb:'a[0]은 헤더 — 행수 6, 열수 6, 그리고 0이 아닌 항이 8개.',
        choices:[{text:"0이 아닌 항의 개수",correct:true},{text:"행렬의 최댓값",correct:false,mc:"header-element",fb:"헤더는 <행수, 열수, 항수>다. 값의 통계가 아니다."},{text:"8행에 원소가 있다는 뜻",correct:false,mc:"header-element",fb:"a[0]은 위치 정보가 아니라 행렬 전체의 요약이다."}]}},
      {say:'정리 — 보통은 인덱스가 위치(2차원 배열), 데이터가 드물면 위치를 데이터로(&lt;row, col, value&gt;), 그리고 개수는 첫 방에. 이 표현을 완전히 익히자.'}
    ]}
  },

  hints: {
    A:["【개념】 배열의 칸은 나란히 붙어 있다. 주소는 '몇 바이트 떨어져 있는가'로 정해진다.",
       "【공식】 arr[i]의 주소 = base + i × sizeof(자료형). char=1, int=4, double=8바이트.",
       "【풀이】 인덱스에 자료형 크기를 곱해 16진수 base에 더한다. 예: 0x1000 + 3×4 = 0x100C."],
    B:["【개념】 C의 함수 호출은 언제나 값의 복사(call by value)다. 주소를 값으로 전달하면 원본을 바꿀 수 있다 — 이 관용이 call by reference.",
       "【배열】 배열 이름은 첫 원소의 주소다. 배열을 넘기면 주소가 전달되어, 함수 안의 매개변수와 원본이 같은 메모리를 가리킨다.",
       "【구분】 겉모습에 &나 *가 없어도 — 배열 전달은 주소 전달이다."],
    C:["【개념】 배열 = 같은 타입의 모임. struct = 다른 타입을 한 단위로 묶는 것. union = 멤버들이 한 칸을 겹쳐 쓰는 것.",
       "【구조】 struct의 멤버는 각자 자기 자리(합산 크기), union은 가장 큰 멤버 하나만큼만 차지한다.",
       "【문법】 typedef struct {…} 별칭; 뒤에는 '별칭 변수명;'으로 선언한다. 멤버 접근은 점(.) — 중첩이면 점을 두 번."],
    D:["【개념】 저장 방법은 용도가 결정한다. 다항식 연산에 필요한 정보는 계수와 지수뿐이다.",
       "【규칙】 padd는 맨 앞 항끼리 지수를 비교한다. 지수 큰 쪽 먼저 attach, 같으면 계수 합 — 단 합이 0이면 소거(생략).",
       "【코드】 COMPARE(a,b): a>b→1, a==b→0, a&lt;b→-1. case 1이면 A의 항, case -1이면 B의 항."],
    E:["【개념】 행렬의 일반 표현은 2차원 배열 — 인덱스가 곧 위치. 데이터가 드물면 위치를 데이터로 저장하는 편이 이득이다.",
       "【표현】 0이 아닌 항만 &lt;row, col, value&gt;로. 저장 순서는 row major — 행 번호순, 같은 행이면 열 번호순.",
       "【헤더】 a[0]은 <행수, 열수, 항수>. 데이터는 a[1]부터다."]
  },

  tutorQs: [
    {id:"Q1", ask:'교수님이 <span class="mono">list[2]</span>는 시작 주소에다 8을 더한 거래요. 왜 8이에요? 2칸 갔으면 2 아니에요?',
     choices:[
      {text:'"int 하나가 4바이트라서, 2칸이면 2×4=8이야."', correct:true, fb:'아~ 칸 수가 아니라 바이트 수구나. 그럼 double이면 16이겠네요?'},
      {text:'"컴퓨터가 숫자를 8진법으로 세니까, 한 칸이 8로 계산되는 거야."', correct:false, mc:"addr-no-sizeof", fb:'엥? 근데 <span class="mono">list[3]</span>은 교수님이 12라고 했는데요. 8진법이랑 무슨 상관이에요?'},
      {text:'"주소 계산 규칙이라 이유는 없어. 그냥 외우면 되는 거야."', correct:false, mc:"no-explanation", fb:'쌤… 저 외우는 거 진짜 못해요. 이유가 있을 거 아니에요.'}]},
    {id:"Q2", ask:'책에서 봤는데 <b>배열 이름은 첫 원소의 주소</b>라면서요. 그럼 포인터 변수처럼 <span class="mono">list = &x;</span> 이렇게 딴 데를 가리키게 해도 돼요?',
     choices:[
      {text:'"돼. 배열 이름도 결국 주소니까 포인터 변수랑 완전히 같은 거야. list = &x; 로 다른 주소를 대입하면 배열이 통째로 그쪽을 가리키게 되지. 이름과 포인터는 같은 문법이거든."', correct:false, mc:"array-name-constant", fb:'어? 방금 비주얼 스튜디오에서 해봤는데 빨간 줄 뜨는데요?'},
      {text:'"안 돼. 포인터 변수는 주소를 담는 저장 공간이 따로 있어서 내용을 바꿀 수 있지만, 배열 이름은 컴파일러가 그 배열의 시작 주소로 해석하는 이름일 뿐이야. 담는 공간이 없으니 대입도 안 돼."', correct:true, fb:'아… list는 변수가 아니라 이름이군요. 바꿔 넣을 저장 공간 자체가 없는 거네요.'},
      {text:'"배열은 주소랑 아예 상관없어. 이름은 그냥 라벨이고, 주소라는 건 & 를 붙였을 때만 잠깐 만들어졌다 사라지는 값이야."', correct:false, mc:"over-correction", fb:'근데 책에는 <span class="mono">list+i</span>가 <span class="mono">&list[i]</span>라던데요…'}]},
    {id:"Q3", boss:true, ask:'쌤, 제일 이상한 거요. C는 함수에 값을 <b>복사</b>해서 넘긴다면서요. 근데 왜 sum 함수 안에서 배열을 바꾸면 <b>원본이</b> 바뀌어요?',
     choices:[
      {text:'"배열은 특별한 타입이라 복사 규칙 자체가 적용되지 않아. 그래서 함수 안에서 고친 게 밖에 그대로 보이는 거야. C가 배열만 예외로 두거든."', correct:false, mc:"array-exception", fb:'특별하다는 게 뭔데요? 그런 식이면 다 특별하다고 하면 되겠네요.'},
      {text:'"복사되는 건 맞아. 단, 복사되는 게 배열 전체가 아니라 시작 주소야. 주소의 복사본으로도 같은 집을 찾아갈 수 있잖아."', correct:true, fb:'…집 주소를 복사해 준 거지, 집을 복사해 준 게 아니다? 오, 이건 좀 소름인데요.'},
      {text:'"C는 사실 몰래 참조(reference)로 넘겨. 값 복사라는 건 교과서의 단순화 설명이고, 배열쯤 크면 참조 방식으로 바뀌는 거야."', correct:false, mc:"reference-confusion", fb:'교수님은 분명 C는 몽땅 call by value랬어요. 누가 맞는 거예요?'}]}
  ],

  poolC: [
    {id:"C-01", stem:'<span class="mono">struct { int a; int b; } s;</span>일 때 <span class="mono">sizeof(s)</span>는?', mono:true,
     choices:[{text:"4",correct:false,mc:"struct-size",fb:"멤버가 두 개다. struct는 멤버가 '나란히' 놓인다."},{text:"8",correct:true},{text:"16",correct:false,mc:"struct-size",fb:"int는 4바이트다."}]},
    {id:"C-02", stem:'<span class="mono">union { int a; int b; } u;</span>일 때 <span class="mono">sizeof(u)</span>는?', mono:true,
     choices:[{text:"8",correct:false,mc:"union-share",fb:"union의 멤버들은 같은 칸을 '겹쳐' 쓴다. 합산은 struct."},{text:"4",correct:true},{text:"2",correct:false,mc:"union-share",fb:"나눠 갖는 게 아니라 통째로 공유한다."}]},
    {id:"C-04", stem:'struct와 union에서, 멤버 <span class="mono">c</span>와 <span class="mono">i</span>의 <b>시작 주소가 같은</b> 쪽은?',
     choices:[{text:"struct",correct:false,mc:"struct-vs-union-addr",fb:"struct의 멤버는 각자 자기 자리가 있다."},{text:"union",correct:true},{text:"둘 다 같다",correct:false,mc:"struct-vs-union-addr",fb:"struct라면 c 다음에 i가 온다."}]},
    {id:"C-06", stem:'1명이 20바이트인 <span class="mono">human_being arr[10];</span>의 전체 크기는?', mono:true,
     choices:[{text:"200",correct:true},{text:"20",correct:false,mc:"struct-array-size",fb:"10명분이다."},{text:"30",correct:false,mc:"struct-array-size",fb:"곱셈이다. 배열은 같은 것을 연속으로 n개."}]},
    {id:"C-11", stem:'<span class="mono">typedef struct { char name[10]; int age; } human_being;</span> 다음 올바른 변수 선언은?', mono:true,
     choices:[{text:"human_being p1;",correct:true},{text:"struct human_being p1;",correct:false,mc:"typedef-usage",fb:"태그 없는 typedef라 struct 키워드로는 부를 이름이 없다."},{text:"typedef p1;",correct:false,mc:"typedef-usage",fb:"typedef는 별칭을 '만들 때' 쓰는 키워드다."}]},
    {id:"C-13", stem:'person1의 생일 월(dob 안의 month)에 2를 넣는 올바른 문장은?', mono:true,
     choices:[{text:"person1.dob.month = 2;",correct:true},{text:"person1.month.dob = 2;",correct:false,mc:"member-access-path",fb:"경로가 뒤집혔다 — 바깥(person1)에서 안(dob→month)으로 들어간다."},{text:"dob.month = 2;",correct:false,mc:"member-access-path",fb:"누구의 dob인지가 없다."}]},
    {id:"C-14", stem:'<span class="mono">person.name</span>(char name[10])에 "james"를 넣는 올바른 방법은?', mono:true,
     choices:[{text:'strcpy(person.name, "james");',correct:true},{text:'person.name = "james";',correct:false,mc:"string-assign",fb:"배열엔 대입(=)이 안 된다. 배열 이름은 저장 공간을 가진 변수가 아니다."},{text:'person.name[10] = "james";',correct:false,mc:"string-assign",fb:"name[10]은 존재하지 않는 11번째 칸이다."}]},
    {id:"C-16", stem:'struct가 배열과 <b>근본적으로 다른</b> 점은?',
     choices:[{text:"서로 다른 타입을 한 단위로 묶을 수 있다",correct:true},{text:"배열보다 훨씬 더 많은 원소를 담을 수 있다",correct:false,mc:"struct-mixed-types",fb:"개수의 문제가 아니다."},{text:"같은 자료라도 메모리를 훨씬 덜 쓴다",correct:false,mc:"struct-mixed-types",fb:"오히려 더 쓸 수도 있다."}]},
    /* 코드 검증 보강 (2026-08-24) */
    {id:"C-17", stem:'빈칸에 들어갈 코드는? — 선언된 변수 p의 나이 멤버에 26을 저장한다.', mono:true,
     code:["typedef struct { char name[10]; int age; } human_being;","human_being p;","________ = 26;"],
     okfb:'변수 이름에서 점(.)으로 멤버로 들어간다 — p.age.',
     choices:[{text:"p.age",correct:true},{text:"age.p",correct:false,mc:"member-access-path",fb:"경로 방향이 거꾸로다 — 바깥(변수)에서 안(멤버)으로."},{text:"p->age",correct:false,mc:"arrow-vs-dot",fb:"화살표(->)는 '포인터'로 접근할 때다 — p는 포인터가 아니다."},{text:"human_being.age",correct:false,mc:"type-vs-var",fb:"타입 이름에는 값을 넣을 수 없다 — 변수(p)에 넣는다."}]},
    {id:"C-18", stem:'다음 중 <b>잘못된</b> 문장은? (person의 name은 char name[10])', mono:true,
     okfb:'배열에는 대입(=)이 안 된다 — 문자열은 strcpy로 복사한다.',
     choices:[{text:'person.name = "james";',correct:true},{text:'strcpy(person.name, "james");',correct:false,mc:"find-the-bug",fb:"이 문장은 올바르다 — 문자열 복사의 정석이다."},{text:"person.age = 26;",correct:false,mc:"find-the-bug",fb:"이 문장은 올바르다 — int 멤버에는 대입이 된다."},{text:"person.dob.month = 2;",correct:false,mc:"find-the-bug",fb:"이 문장은 올바르다 — 중첩 구조체 접근이다."}]}
  ]
};
