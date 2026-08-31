"use strict";
/* 챕터 3 데이터 — "스택과 큐의 응용" = 4주차 (강의 3장 후반 · 제작 규약 v1.1 · 주간 루프 공용 러너 사용)
   챕터 2에서 분리(감수: 한 주 분량 과다) — 괄호 검사 / 표기법·우선순위 / 후위식 평가 / 중위→후위 변환 + 미로. */
const CH03 = {
  meta: { id:"ch03", week:4, title:"스택과 큐의 응용", sub:"스택, 계산기가 되다", nextTeaser:"리스트", nextHint:'교수님이 "다음 칸의 주소를 쪽지에 적어 두는 공책" 얘기를 하던데요… 공책 페이지가 왜 흩어져 있는 거죠?' },
  economy: { payPerPoint:1000, aplusBonus:200000 },
  exam: { unitPts:15, tutorPts:10, passLine:54 },   /* 4유닛 × 15 + 과외 30 = 90 만점 */
  apGen: "AP3",

  intro: [
    {who:"도윤", face:"doyun", text:'쌤! 지난주에 그랬잖아요 — <b>스택이 계산기가 되는 법</b>. 교수님이 이번 주는 <b>스택과 큐의 응용</b>이래요. 괄호 검사에, 수식 계산에… 칠판에 개 그림까지 그리셨어요. 개요, 개.'},
    {who:"도윤", face:"doyun-worried", text:'컴퓨터가 <b>수식을 뒤집어 읽는다</b>는 게 대체 무슨 소리예요? 6/2-3+4*2 같은 걸 뒤집으면 답도 뒤집히는 거 아니에요? …이번에도 <b>다음 주 월요일 쪽지시험</b>이에요. 수요일 과외 때까지 부탁해요.'},
    {who:"나", face:"me-awkward", text:'<span class="inner">뒤집어 읽는다… 나도 궁금하다. 지난주에 만든 통(스택)과 줄(큐)을, 이번 주엔 굴려 먹는 모양이다. 월요일 밤, 책부터 펴자.</span>'}
  ],

  flow: ["study-A","trial-A","il-A","study-B","trial-B","il-B","tutor","study-C","trial-C","il-C","study-D","trial-D","maze","saturday","sunday"],
  cpl: {
    "study-A":"4주차 · 월 — 괄호 검사 자습","trial-A":"4주차 · 월 — 괄호 검사 시련","il-A":"4주차 · 월요일 밤",
    "study-B":"4주차 · 화 — 표기법 자습","trial-B":"4주차 · 화 — 표기법 시련","il-B":"4주차 · 화요일 밤",
    "tutor":"4주차 · 수 — 과외",
    "study-C":"4주차 · 목 — 후위식 평가 자습","trial-C":"4주차 · 목 — 후위식 평가 시련","il-C":"4주차 · 목요일 밤",
    "study-D":"4주차 · 금 — 변환 자습","trial-D":"4주차 · 금 — 변환 시련","maze":"4주차 · 금요일 밤 — 미로",
    "saturday":"4주차 · 토 — 보충/A+","sunday":"4주차 · 월 — 쪽지시험"
  },

  trials: {
    A:{gen:"G11", label:"괄호 검사기", doneLabel:"유닛 A 숙달 ▶"},
    B:{gen:"G12", label:"수식 해석기", doneLabel:"유닛 B 숙달 ▶"},
    C:{gen:"G9",  label:"후위식 평가", doneLabel:"유닛 C 숙달 ▶"},
    D:{gen:"G10", label:"중위→후위 변환", doneLabel:"유닛 D 숙달 ▶"}
  },
  ilNext: { A:"화요일 — 유닛 B ▶", B:"수요일 — 과외 ▶", C:"금요일 — 유닛 D ▶" },
  tutorNextLabel:"목요일 밤 — 유닛 C ▶",
  tutorPassMsg:'괄호 얘기 진짜 신기했어요. 컴파일러가 <b>접시 쌓기</b>로 제 코드에 빨간 줄을 긋고 있었다니…',

  /* ================= 자습 ================= */
  study: {
    A: { day:"월요일", label:"유닛 A", title:"괄호 검사 (parenthesis matching)", doneLabel:"시련 — 괄호 검사기 ▶", beats:[
      {say:'지난주엔 통(스택)과 줄(큐)을 <b>만들었다</b>. 이번 주엔 <b>써먹는다</b>. 첫 번째 손님 — 컴파일러다.', mood:"awkward"},
      {who:"book", say:'"컴파일러가 수식을 처리하기 전에 <b>가장 먼저 하는 일</b> — 괄호가 옳게 쓰였는지 검사하는 것이다. 조건은 둘: <b>왼쪽 괄호와 오른쪽 괄호의 개수가 같아야 하고</b>, 모든 오른쪽 괄호에는 <b>자기보다 먼저 나온 왼쪽 괄호 짝</b>이 있어야 한다. (a*(b+c)) 는 정상, ((a+b) 는 오류다."'},
      {who:"book", say:'"검사 방법 — 식을 <b>왼쪽에서 오른쪽으로 한 번</b> 훑는다. <b>여는 괄호를 만나면 push, 닫는 괄호를 만나면 pop</b>으로 짝을 지운다. 오류는 두 군데서 드러난다: ① 닫는 괄호가 왔는데 <b>스택이 비어 있다</b> — 짝 없는 닫는 괄호. ② 끝까지 읽었는데 <b>스택에 여는 괄호가 남아 있다</b> — 짝 없는 여는 괄호."',
       viz:{type:"stack",cells:["(","("],top:1,max:4}},
      {say:'닫는 괄호는 쌓이지 않는구나 — 올 때마다 맨 위의 여는 괄호를 <b>지우는</b> 역할이다.'},
      {check:{id:"c3A-1", stem:'"(()" 를 괄호 검사로 끝까지 훑으면, 끝났을 때의 상태는?', mono:true,
        okfb:'( push, ( push, ) 가 하나를 pop — 여는 괄호 하나가 남는다. 남으면 오류.',
        choices:[
          {text:"스택에 여는 괄호 1개가 남는다 — 짝 오류",correct:true},
          {text:"스택이 정확히 비어 있다 — 정상적인 괄호열",correct:false,mc:"count-slip",fb:"여는 괄호와 닫는 괄호의 수를 세어 보라."},
          {text:"닫는 괄호 1개가 스택에 남는다 — 짝 오류",correct:false,mc:"push-close",fb:"닫는 괄호는 push되지 않는다 — 짝을 지우는 역할이다."},
          {text:"끝까지 읽기 전에는 판정이 불가능하다",correct:false,mc:"no-method",fb:"push/pop 두 동작이면 충분히 검사할 수 있다."}]}},
      {who:"book", say:'"이번엔 <span class="mono">\"())(\"</span> — 개수는 2:2로 같지만 오류다. 따라가 보자: 1번째 ( push → 2번째 ) pop, 스택이 빈다 → <b>3번째 ) — pop하려는데 스택이 공백이다.</b> 짝 없는 닫는 괄호. 검사는 <b>이 자리에서 즉시</b> 실패를 선고한다 — 4번째까지 읽을 필요도 없다. 개수만 세는 검사로는 절대 잡을 수 없는 오류다."',
       table:'<table class="trip"><tr><th>읽는 문자</th><th>동작</th><th>스택 (아래→위)</th></tr><tr><td>(</td><td>push</td><td>(</td></tr><tr><td>)</td><td>pop</td><td><i>공백</i></td></tr><tr><td>)</td><td>pop — <b>공백에서!</b></td><td>⚠ 오류</td></tr></table>'},
      {check:{id:"c3A-2", stem:'"())(" 의 괄호 검사가 오류를 판정하는 것은 <b>몇 번째 문자</b>에서인가?', mono:true,
        okfb:'3번째 ) 에서 — 스택이 공백인데 pop하려는 순간이다.',
        choices:[
          {text:"3번째",correct:true},
          {text:"4번째",correct:false,mc:"late-check",fb:"마지막 ( 까지 갈 필요가 없다 — 그 전에 이미 스택이 비어 있었다."},
          {text:"2번째",correct:false,mc:"early-check",fb:"2번째 ) 는 1번째 ( 와 정상적으로 짝을 지웠다."},
          {text:"오류가 아니다 — 개수가 2:2로 같다",correct:false,mc:"count-only",fb:"개수만으로는 부족하다 — 닫는 괄호보다 '먼저' 여는 괄호가 있어야 한다."}]}},
      {who:"book", say:'"정상인 예 — <span class="mono">\"(()())\"</span>. 스택의 깊이가 오르내리다가, 끝에서 정확히 0이 된다. 도중 스택이 가장 높았던 순간은 <b>깊이 2</b> — 이것이 괄호의 <b>최대 중첩 깊이</b>다."',
       table:'<table class="trip"><tr><th>문자</th><th>(</th><th>(</th><th>)</th><th>(</th><th>)</th><th>)</th></tr><tr><td>동작</td><td>push</td><td>push</td><td>pop</td><td>push</td><td>pop</td><td>pop</td></tr><tr><td>깊이</td><td>1</td><td><b>2</b></td><td>1</td><td><b>2</b></td><td>1</td><td>0 ✓</td></tr></table>'},
      {who:"book", say:'"왜 하필 <b>스택</b>인가 — 나중에 열린 괄호가 <b>먼저 닫혀야</b> 하기 때문이다. (a*(b+c 라면 다음 닫는 괄호의 짝은 바깥 ( 가 아니라 <b>가장 최근의</b> ( 다. \'가장 최근 것부터\'는 정확히 LIFO — 스택의 규칙이다."'},
      {check:{id:"c3A-3", stem:'괄호 검사에 큐가 아니라 <b>스택</b>을 쓰는 이유는?',
        okfb:'닫는 괄호의 짝은 "가장 최근에 열린" 괄호 — 최근 것부터 꺼내는 LIFO가 필요하다.',
        choices:[
          {text:"닫는 괄호의 짝은 가장 최근에 열린 괄호이기 때문 (LIFO)",correct:true},
          {text:"큐로 해도 검사 결과가 완전히 같아 아무거나 써도 되기 때문",correct:false,mc:"fifo-misapply",fb:"큐라면 '가장 오래된' 여는 괄호와 짝을 지운다 — (( )) 에서 안쪽 )가 바깥 (와 묶여 버린다."},
          {text:"스택이 큐보다 연산이 훨씬 빠르기 때문",correct:false,mc:"speed-reduction",fb:"속도가 아니라 '꺼내는 순서'가 문제다."},
          {text:"괄호는 문자라서 스택에만 저장할 수 있기 때문",correct:false,mc:"type-myth",fb:"저장은 어느 쪽이든 된다 — 다른 것은 꺼내는 규칙이다."}]}},
      {who:"book", say:'"덤 — <span class="mono">{ }</span> 와 <span class="mono">[ ]</span> 가 섞여도 알고리즘은 같다. push할 때 <b>종류</b>를 함께 쌓고, pop할 때 <b>종류가 맞는지</b>까지 확인하면 된다. C 소스 코드 전체가 이 검사의 손님이다 — if( ){ a[i]=0; } 같은 줄들."'},
      {say:'컴파일러의 빨간 줄이 접시 쌓기였다니. 좋아 — 검사기를 직접 돌려 보자.', mood:"proud"}
    ]},

    B: { day:"화요일", label:"유닛 B", title:"수식의 해석 — 표기법과 우선순위", doneLabel:"시련 — 수식 해석기 ▶", beats:[
      {say:'괄호 검사는 몸풀기였다. 오늘은 본론 — 컴퓨터는 <b>수식을 어떻게 읽는가</b>.'},
      {who:"book", say:'"문제 하나. <span class="mono">x = a/b-c+d*e-a*c</span> 에 a=4, b=2, c=2, d=3, e=3 을 넣어 보자. …읽는 방법에 따라 <b>답이 달라진다.</b>"'},
      {who:"book", say:'"<b>해석 ①</b> — 곱셈·나눗셈을 먼저, 같은 급은 왼쪽부터: <span class="mono">((a/b)-c) + (d*e) - (a*c)</span>. 단계별로 —"',
       table:'<table class="trip"><tr><th>단계</th><th>계산</th><th>결과</th></tr><tr><td>①</td><td>a/b = 4/2</td><td>2</td></tr><tr><td>②</td><td>2 - c = 2-2</td><td>0</td></tr><tr><td>③</td><td>d*e = 3×3</td><td>9</td></tr><tr><td>④</td><td>0 + 9</td><td>9</td></tr><tr><td>⑤</td><td>a*c = 4×2</td><td>8</td></tr><tr><td>⑥</td><td>9 - 8</td><td><b>1</b></td></tr></table>'},
      {who:"book", say:'"<b>해석 ②</b> — 누군가 다르게 묶는다면: <span class="mono">(a/(b-c+d)) * (e-a) * c</span>. 단계별로 — 같은 글자들인데 답은 <b>-2.666…</b>. 식 하나에 답이 두 개일 수는 없다. <b>약속</b>이 필요하다."',
       table:'<table class="trip"><tr><th>단계</th><th>계산</th><th>결과</th></tr><tr><td>①</td><td>b-c+d = 2-2+3</td><td>3</td></tr><tr><td>②</td><td>a/3 = 4/3</td><td>1.333…</td></tr><tr><td>③</td><td>e-a = 3-4</td><td>-1</td></tr><tr><td>④</td><td>1.333… × (-1) × 2</td><td><b>-2.666…</b></td></tr></table>'},
      {who:"book", say:'"그 약속이 <b>연산자 우선 순위(precedence)</b>와 <b>결합성(associativity)</b>이다. 이 장에서 필요한 만큼만: <b>*, / 가 +, - 보다 먼저</b>다. 그리고 <b>같은 급끼리는 왼쪽부터</b> 계산한다 — 좌결합. 그래서 해석 ①만이 옳다. 해석 ②를 원한다면? <b>괄호</b>로 직접 지정해야 한다 — 괄호는 우선순위를 이긴다."'},
      {check:{id:"c3B-1", stem:'<span class="mono">10-4-3</span> 의 값은?', mono:true,
        okfb:'같은 급(-)은 왼쪽부터 — (10-4)-3 = 3. 좌결합이다.',
        choices:[
          {text:"3",correct:true},
          {text:"9",correct:false,mc:"right-assoc",fb:"10-(4-3)으로 묶었다 — 오른쪽부터가 아니라 왼쪽부터다."},
          {text:"11",correct:false,mc:"calc-slip",fb:"부호를 다시 보라 — 둘 다 뺄셈이다."},
          {text:"둘 다 가능하다",correct:false,mc:"ambiguous-myth",fb:"결합성 규칙이 있어서 답은 하나로 정해진다."}]}},
      {check:{id:"c3B-2", stem:'<span class="mono">a-b*c</span> 를 규칙대로 묶으면?', mono:true,
        okfb:'* 가 - 보다 먼저 — a-(b*c) 다.',
        choices:[
          {text:"a-(b*c)",correct:true},
          {text:"(a-b)*c",correct:false,mc:"ltr-blind",fb:"왼쪽부터는 '같은 급'일 때의 규칙이다 — * 는 - 보다 급이 높다."},
          {text:"어느 쪽이든 같다",correct:false,mc:"ambiguous-myth",fb:"a=5, b=2, c=3으로 두 가지를 계산해 보라 — -1과 9로 갈린다."},
          {text:"(a-b)*(a-c)",correct:false,mc:"invent",fb:"묶기는 있는 글자를 그대로 두고 순서만 정한다."}]}},
      {who:"book", say:'"이제 <b>표기법</b> 이야기. 사람은 연산자를 피연산자 <b>사이</b>에 쓴다 — a*b, <b>중위 표기법(infix)</b>. 연산자를 <b>앞</b>에 쓰면 *ab — <b>전위 표기법(prefix)</b>, <b>뒤</b>에 쓰면 ab* — <b>후위 표기법(postfix)</b>. 그리고 컴파일러가 수식을 다루는 일반적인 방식은 <b>후위 표기법</b>이다."'},
      {who:"book", say:'"중위 ↔ 후위 대응을 눈에 익혀 두자. (변환하는 손 기술은 금요일에 배운다 — 오늘은 \'대응된다\'는 것만.)"',
       table:'<table class="trip"><tr><th>중위 표기</th><th>후위 표기</th></tr><tr><td>2+3*4</td><td>2 3 4*+</td></tr><tr><td>a*b+5</td><td>ab*5+</td></tr><tr><td>(1+2)*7</td><td>1 2+7*</td></tr><tr><td>a*b/c</td><td>ab*c/</td></tr><tr><td>a/b-c+d*e-a*c</td><td>ab/c-de*+ac*-</td></tr></table>'},
      {who:"book", say:'"왜 컴퓨터는 굳이 <b>뒤집어</b> 쓰는가. 표의 오른쪽을 보라 — <b>괄호가 하나도 없다.</b> 후위 표기에서는 연산자의 <b>위치 자체가 계산 순서</b>라서, 괄호도 우선순위도 다시 따질 필요가 없다. 식을 <b>왼쪽에서 오른쪽으로 단 한 번</b> 훑는 것으로 계산이 끝난다. 그래서 컴파일러는 중위식을 후위식으로 바꿔 놓고 계산한다."'},
      {check:{id:"c3B-3", stem:'컴파일러가 수식을 <b>후위 표기</b>로 바꿔서 다루는 이유는?',
        okfb:'후위식은 괄호·우선순위를 다시 따질 필요 없이, 왼→오 한 번 훑기로 계산되기 때문.',
        choices:[
          {text:"괄호도 우선순위도 따질 필요 없이, 왼→오 한 번에 계산되기 때문",correct:true},
          {text:"괄호가 빠지는 만큼 글자 수가 적어 저장 공간이 덜 들기 때문",correct:false,mc:"length-myth",fb:"괄호가 빠질 뿐, 피연산자와 연산자 수는 그대로다 — 핵심은 '읽는 방법'이다."},
          {text:"기계보다 사람이 읽기에 더 쉬운 표기이기 때문",correct:false,mc:"human-standard",fb:"사람에게 익숙한 쪽은 중위다 — 후위는 기계를 위한 표기다."},
          {text:"중위식은 컴퓨터로는 아예 계산이 불가능하기 때문",correct:false,mc:"absolute",fb:"불가능이 아니라 '번거로움'이다 — 앞뒤로 오가며 우선순위를 따져야 한다."}]}},
      {say:'뒤집어 읽는 게 아니라 <b>뒤집어 써 두면 한 번에 읽히는</b> 거였구나. 도윤이한테 해 줄 말이 생겼다.', mood:"proud"}
    ]},

    C: { day:"목요일", label:"유닛 C", title:"후위 표기식의 계산", doneLabel:"시련 — 후위식 평가 ▶", beats:[
      {say:'어제 "후위로 바꿔 두면 한 번에 읽힌다"까지 왔다. 오늘은 그 <b>읽는 법</b> — 스택이 계산기가 되는 날이다.'},
      {who:"book", say:'"후위 표기식을 계산하는 법 — <b>괄호를 고려할 필요가 없다.</b> 왼쪽에서 오른쪽으로 훑으며: <b>피연산자는 스택에 push</b> / <b>연산자를 만나면 필요한 만큼 pop해서 연산하고, 결과를 다시 push</b> / 식의 끝까지 반복 — <b>스택의 톱이 해답</b>이다."'},
      {who:"book", say:'"단 하나, 순서 조심 — <span class="mono">5 3 -</span> 을 슬로우 모션으로: 5 push, 3 push, \'-\'를 만나면 pop이 두 번인데 <b>먼저 나오는 것(3)이 오른쪽, 나중에 나오는 것(5)이 왼쪽</b> 피연산자다. 즉 5-3 = <b>2</b>. (3-5가 아니다!) 뺄셈과 나눗셈에서 이 순서가 승부를 가른다."',
       viz:{type:"stack",cells:[2],top:0,max:3}},
      {check:{id:"c3C-1", stem:'후위 표기식 <span class="mono">5 3 -</span> 의 값은?', mono:true,
        okfb:'나중에 pop된 5가 왼쪽 — 5-3 = 2.',
        choices:[
          {text:"2",correct:true},
          {text:"-2",correct:false,mc:"operand-order",fb:"pop 순서와 피연산자 자리 — 먼저 나온 것이 오른쪽이다."},
          {text:"8",correct:false,mc:"op-mix",fb:"연산자는 - 다."},
          {text:"53",correct:false,mc:"concat",fb:"이어붙이는 게 아니라 계산한다."}]}},
      {who:"book", say:'"나눗셈으로 한 번 더 — <span class="mono">8 2 /</span>: 8 push, 2 push, \'/\'에서 먼저 pop된 2가 <b>오른쪽</b>(나누는 수), 나중에 pop된 8이 <b>왼쪽</b>(나눠지는 수). 8/2 = <b>4</b>. 순서를 뒤집으면 2/8 — 전혀 다른 답이다."',
       viz:{type:"stack",cells:[4],top:0,max:3}},
      {check:{id:"c3C-2", stem:'후위 표기식 <span class="mono">8 2 /</span> 의 값은?', mono:true,
        okfb:'나중에 pop된 8이 왼쪽 — 8/2 = 4.',
        choices:[
          {text:"4",correct:true},
          {text:"1/4",correct:false,mc:"operand-order",fb:"2/8로 계산했다 — 먼저 pop된 것이 '오른쪽' 피연산자다."},
          {text:"16",correct:false,mc:"op-mix",fb:"연산자는 / 다 — 곱하지 않는다."},
          {text:"6",correct:false,mc:"op-mix",fb:"연산자는 / 다 — 빼지 않는다."}]}},
      {who:"book", say:'"전체 예제 — <span class="mono">6/2-3+4*2</span> 의 후위 <span class="mono">6 2/3-4 2*+</span> 를 표로 따라가 보자. (시련에서는 이걸 네가 직접 채운다)"',
       table:'<table class="trip"><tr><th>토큰</th><th>스택 [0]</th><th>[1]</th><th>[2]</th><th>top</th></tr><tr><td>6</td><td>6</td><td></td><td></td><td>0</td></tr><tr><td>2</td><td>6</td><td>2</td><td></td><td>1</td></tr><tr><td>/</td><td>6/2=3</td><td></td><td></td><td>0</td></tr><tr><td>3</td><td>3</td><td>3</td><td></td><td>1</td></tr><tr><td>-</td><td>3-3=0</td><td></td><td></td><td>0</td></tr><tr><td>4</td><td>0</td><td>4</td><td></td><td>1</td></tr><tr><td>2</td><td>0</td><td>4</td><td>2</td><td>2</td></tr><tr><td>*</td><td>0</td><td>4*2=8</td><td></td><td>1</td></tr><tr><td>+</td><td>0+8=<b>8</b></td><td></td><td></td><td>0</td></tr></table>'},
      {check:{id:"c3C-3", stem:'후위식을 계산하다가 <b>연산자</b>를 만나면 하는 일은?',
        okfb:'필요한 만큼 pop(이항이면 2개 — 나중 pop이 왼쪽) → 연산 → 결과를 다시 push.',
        choices:[
          {text:"필요한 만큼 pop해서 연산하고, 결과를 다시 push한다",correct:true},
          {text:"연산자도 피연산자와 똑같이 스택에 push해 쌓아 둔다",correct:false,mc:"op-push",fb:"연산자를 스택에 쌓는 것은 '변환' 쪽 이야기다 — 평가는 즉시 계산한다."},
          {text:"식의 끝까지 읽은 뒤에 한꺼번에 몰아서 계산한다",correct:false,mc:"defer",fb:"후위식의 좋은 점이 바로 '만나는 즉시 계산 가능'이다."},
          {text:"계산하지 않고 그때의 스택을 화면에 출력한다",correct:false,mc:"output-mix",fb:"중간 결과는 다시 스택으로 들어간다 — 다음 연산의 재료다."}]}},
      {who:"book", say:'"마무리 요령 둘. ① 피연산자가 두 자리 수여도 당황하지 말 것 — <span class="mono">2 10 +</span> 처럼 띄어쓰기가 토큰을 구분해 준다. ② 식이 끝났을 때 스택에는 <b>정확히 하나</b>(답)만 남아야 정상이다 — 둘 이상 남았다면 어딘가에서 연산자를 빠뜨린 것이다."'},
      {say:'괄호도, 우선순위 고민도 없이 — 왼쪽에서 오른쪽으로 한 번. 계산기 완성이다.', mood:"proud"}
    ]},

    D: { day:"금요일", label:"유닛 D", title:"중위 → 후위 변환", doneLabel:"시련 — 변환 ▶", beats:[
      {say:'읽고 계산하는 건 됐다. 마지막 조각 — 중위식을 후위식으로 <b>만드는</b> 법이다.'},
      {who:"book", say:'"<b>괄호 묶기법</b> — 손으로 하는 변환, 3단계다: <b>(1) 식을 모두 괄호로 묶는다 (2) 이항 연산자들을 각자 그들의 오른쪽 괄호와 대체시킨다 (3) 모든 괄호를 삭제한다.</b>"'},
      {who:"book", say:'"작은 예부터 — <span class="mono">2+3*4</span>. 묶는 순서는 어제의 규칙 그대로: * 가 먼저다."',
       table:'<table class="trip"><tr><th>단계</th><th>모습</th></tr><tr><td>① 묶기</td><td>(2+(3*4))</td></tr><tr><td>② 연산자를 자기 오른쪽 괄호 자리로</td><td>(2 (3 4 <b>*</b> <b>+</b></td></tr><tr><td>③ 괄호 삭제</td><td><b>2 3 4*+</b></td></tr></table>'},
      {check:{id:"c3D-1", stem:'<span class="mono">2+3*4</span> 의 후위 표기는?', mono:true,
        okfb:'* 가 먼저 묶인다: (2+(3*4)) → 2 3 4*+.',
        choices:[
          {text:"2 3 4 * +",correct:true},
          {text:"2 3 + 4 *",correct:false,mc:"precedence-ignored",fb:"왼쪽부터 순서대로 묶은 모양이다 — *, /가 먼저다."},
          {text:"2 3 4 + *",correct:false,mc:"op-order",fb:"각 연산자는 자기 괄호의 오른쪽 자리로 간다."},
          {text:"3 4 * 2 +",correct:false,mc:"operand-order",fb:"피연산자의 순서는 중위식 그대로 유지된다."}]}},
      {who:"book", say:'"괄호가 있으면? <span class="mono">(1+2)*7</span> — 괄호가 우선순위를 이긴다. 1단계에서 이미 묶여 있는 셈이니 그대로 감싸기만 하면 된다: ((1+2)*7) → + 는 (1+2)의 오른쪽 괄호로, * 는 바깥 괄호로 → <b>1 2+7*</b>."'},
      {check:{id:"c3D-2", stem:'<span class="mono">(1+2)*7</span> 의 후위 표기는?', mono:true,
        okfb:'괄호 안이 먼저 — ((1+2)*7) → 1 2+7*.',
        choices:[
          {text:"1 2 + 7 *",correct:true},
          {text:"1 2 7 + *",correct:false,mc:"lump-ops",fb:"+ 는 (1+2)의 오른쪽 괄호 자리 — 7 앞이다."},
          {text:"1 2 7 * +",correct:false,mc:"paren-ignored",fb:"괄호가 +를 먼저 묶었다."},
          {text:"7 1 2 + *",correct:false,mc:"operand-order",fb:"피연산자의 순서는 중위식 그대로다."}]}},
      {who:"book", say:'"큰 예제 — 어제의 그 식, <span class="mono">a/b-c+d*e-a*c</span>. 1단계: 우선순위(*, / 먼저)와 좌결합(같은 급은 왼쪽부터) 순서로 완전히 묶으면 — <span class="mono">((((a/b)-c)+(d*e))-(a*c))</span>."'},
      {who:"book", say:'"2단계: 각 연산자를 자기 <b>오른쪽 괄호</b> 자리로 보낸다 — / 는 (a/b)의 오른쪽 괄호로, 첫 - 는 그 바깥 괄호로, * 는 (d*e)의 괄호로… 3단계: 괄호를 지우면 <span class="mono"><b>ab/c-de*+ac*-</b></span>. 어제 표의 마지막 줄과 일치한다."'},
      {check:{id:"c3D-3", stem:'괄호 묶기법 2단계에서, 각 연산자가 이동하는 곳은?',
        okfb:'자기 짝의 오른쪽 괄호 자리 — 그래서 연산자가 피연산자 "뒤"로 간다.',
        choices:[
          {text:"자기 괄호의 오른쪽 괄호 자리",correct:true},
          {text:"자기 괄호의 왼쪽 괄호 자리",correct:false,mc:"prefix-confusion",fb:"왼쪽으로 보내면 전위(prefix) 표기가 되어 버린다."},
          {text:"식의 맨 끝",correct:false,mc:"lump-ops",fb:"연산자마다 '자기 자리'가 있다 — 몽땅 뒤로 가는 게 아니다."},
          {text:"제자리에 남는다",correct:false,mc:"no-move",fb:"그럼 중위 그대로다."}]}},
      {who:"book", say:'"검산 요령 — 변환 전후로 <b>피연산자의 순서는 그대로</b>여야 하고(자리를 옮기는 건 연산자뿐), <b>연산자의 개수도 그대로</b>여야 한다. 둘 중 하나라도 어긋났다면 어딘가에서 잘못 묶은 것이다."'},
      {say:'묶고, 옮기고, 지운다 — 세 동작이면 컴파일러 흉내를 낼 수 있다. (스택으로 하는 자동 변환은 심화의 몫이다)', mood:"proud"}
    ]}
  },

  hints: {
    A:["【개념】 왼→오 한 번 훑기: 여는 괄호 push, 닫는 괄호면 pop. 닫는 괄호는 쌓이지 않는다.",
       "【오류】 ① 닫는 괄호인데 스택 공백 — 그 자리에서 즉시 오류. ② 끝났는데 스택에 남음 — 짝 없는 여는 괄호.",
       "【깊이】 최대 깊이 = 훑는 동안 스택이 가장 높았던 순간. 문자마다 깊이를 적으며 세어 보라."],
    B:["【우선순위】 *, / 가 +, - 보다 먼저. 같은 급은 왼쪽부터(좌결합). 괄호는 우선순위를 이긴다.",
       "【표기법】 연산자가 사이면 중위(a*b), 뒤면 후위(ab*), 앞이면 전위(*ab). 컴파일러는 후위를 쓴다.",
       "【이유】 후위식엔 괄호가 없다 — 연산자 위치가 곧 계산 순서라, 왼→오 한 번에 계산된다."],
    C:["【절차】 왼→오: 피연산자 push / 연산자면 pop 2개 → 연산 → 결과 push / 끝나면 톱이 답.",
       "【순서】 나중에 pop된 것이 왼쪽 피연산자 — 5 3 - 는 5-3. 뺄셈·나눗셈에서 결정적.",
       "【추적】 토큰마다 스택을 그려라. 연산자를 만나면 위의 두 값이 하나로 합쳐진다."],
    D:["【3단계】 ① 전부 괄호로 묶고 ② 연산자를 자기 오른쪽 괄호 자리로 ③ 괄호 삭제.",
       "【묶기】 *, / 먼저, 같은 급은 왼쪽부터. 괄호가 있으면 괄호가 이긴다.",
       "【검산】 피연산자 순서는 중위식 그대로여야 한다 — 자리를 옮기는 건 연산자뿐."]
  },

  interludes: {
    A: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 저 과제 코드 짰는데 컴파일러가 괄호 하나 없다고 빨간 줄 그었어요. 걔는 그걸 어떻게 한눈에 알아요?'},
      {who:"나", face:"me-proud", text:'(답장) 한눈에 아는 게 아니라 왼쪽부터 한 글자씩 접시를 쌓으면서 안다. 오늘 배웠다. 내일 마저 얘기해 준다.'}
    ],
    B: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤 계산기에 6/2*3 치니까 9 나오는데, 제 친구는 1이라고 우겨요. 누가 맞아요?'},
      {who:"나", face:"me", text:'(답장) 계산기가 맞다. 같은 급은 왼쪽부터 — 약속이다. 네 친구는 오른쪽부터 계산했네. 내일 과외 때 그 약속 얘기부터 하자.'}
    ],
    C: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 계산기 앱은 6/2-3+4*2 이런 거 어떻게 순서 안 틀리고 계산해요?'},
      {who:"나", face:"me-proud", text:'(답장) 방금 그 답을 배웠는데 소름 돋게 타이밍 좋네. 힌트: 접시 쌓기가 계산기를 만든다. 자세한 건 내일.'}
    ]
  },

  tutorQs: [
    {id:"Q1", ask:'쌤, 컴파일러가 괄호 틀린 걸 잡을 때 <b>스택</b>을 쓴다면서요. 그냥 여는 거 몇 개, 닫는 거 몇 개 세면 되는 거 아니에요? 변수 하나로 되잖아요.',
     choices:[
      {text:'"개수만 세면 <span class="mono">)(</span> 같은 것도 통과해 버려. 닫는 괄호의 짝은 \'가장 최근에 열린\' 괄호여야 하거든 — 최근 것부터 꺼내 맞추는 건 딱 스택의 규칙이야."', correct:true, fb:'아… )( 는 1:1인데 말이 안 되는 거네요. 순서까지 봐야 하니까 스택이구나.'},
      {text:'"개수만 정확히 세면 완벽하게 검사돼. 여는 괄호에 +1, 닫는 괄호에 -1 해서 합이 0이면 정상이거든. 스택은 이 단원이 스택 단원이라 교재가 억지로 끼워 넣은 거야."', correct:false, mc:"count-only", fb:'그럼 )( 도 정상이게요? 여는 거 하나, 닫는 거 하나잖아요.'},
      {text:'"스택이 변수 하나보다 메모리를 적게 먹어서 그래. 컴파일러는 메모리에 민감해서, 검사 도구도 제일 가벼운 자료구조를 골라 쓰게 되어 있거든."', correct:false, mc:"memory-myth", fb:'스택이 변수 하나보다 작다고요? 그건 좀 아닌 것 같은데요.'}]},
    {id:"Q2", ask:'학교에서 <span class="mono">a-b-c</span> 같은 거 나왔는데요. 이거 a-(b-c)로 풀면 왜 틀려요? 뒤에서부터 풀면 편하던데.',
     choices:[
      {text:'"같은 급 연산자는 <b>왼쪽부터</b> 묶는 게 약속이야 — 좌결합. (a-b)-c 가 맞아. 10-4-3으로 해 봐: 왼쪽부터면 3인데, 네 방식이면 9가 나와서 답이 갈리지."', correct:true, fb:'헐 진짜네요. 10-4-3=3인데 뒤부터 하면 9… 약속을 안 지키면 답이 달라지는구나.'},
      {text:'"뺄셈은 어느 쪽부터 묶어도 답이 같아. 수학의 결합법칙이라는 게 있어서 순서는 자유거든. 그러니까 네가 편한 대로 뒤에서부터 풀어도 전혀 문제없어."', correct:false, mc:"ambiguous-myth", fb:'어? 10-4-3 넣어 보니까 3이랑 9로 다른데요?'},
      {text:'"괄호 없이 뺄셈을 두 번 잇는 건 원래 문법 오류야. a-b-c처럼 쓰려면 반드시 괄호를 쳐서 순서를 지정해 줘야만 계산할 수 있게 되어 있어."', correct:false, mc:"absolute", fb:'괄호 없는 뺄셈이 세상에 얼마나 많은데요. 규칙이 따로 있는 거 아니에요?'}]},
    {id:"Q3", boss:true, ask:'마지막이요. 교수님이 그러는데 컴파일러는 수식을 <b>후위 표기</b>인가로 바꿔서 계산한대요. 멀쩡한 식을 왜 굳이 뒤집어요? 사람 헷갈리게.',
     choices:[
      {text:'"후위로 바꿔 두면 괄호도, 우선순위 고민도 사라져 — 연산자의 위치 자체가 계산 순서거든. 그래서 왼쪽에서 오른쪽으로 한 번만 훑으면 계산이 끝나. 사람 좋으라고가 아니라 기계가 한 번에 읽으라고 뒤집는 거야."', correct:true, fb:'사람용 표기랑 기계용 표기가 따로 있는 거네요. 뒤집는 게 아니라… 번역이구나?'},
      {text:'"후위로 바꾸면 계산 결과가 더 정확해지거든. 중위식은 사람 눈에는 좋아도 괄호 때문에 계산 오차가 조금씩 쌓여. 그래서 정밀한 계산이 필요한 곳은 전부 후위로 하는 거야. 계산기 만드는 회사들도 다 그렇게 하고."', correct:false, mc:"accuracy-myth", fb:'표기만 바뀌는데 답이 더 정확해져요? 답은 같아야 하는 거 아니에요?'},
      {text:'"옛날 컴퓨터 성능이 부족하던 시절의 버릇이 남은 거야. 요즘 컴파일러는 중위식을 그대로 읽고도 남을 만큼 빨라서, 사실상 의미 없는 전통이지."', correct:false, mc:"legacy-myth", fb:'교수님은 지금도 컴파일러가 그렇게 한다고 했는데요…'}]}
  ],

  /* ================= 저작형 문항 풀 (12문) — 시련에 40% 혼합 ================= */
  pool: [
    /* --- 유닛 A · 괄호 검사 --- */
    {id:"P01", unit:"A", stem:'괄호 검사에서 <span class="mono">"(()())"</span> 를 훑는 동안 스택의 <b>최대 깊이</b>는?', mono:true,
     okfb:'( ( 까지 2 — 그 뒤로는 2를 넘지 않는다.',
     choices:[{text:"2",correct:true},{text:"3",correct:false,mc:"count-slip",fb:"토큰마다 push/pop을 표시하며 세어 보라."},{text:"1",correct:false,mc:"count-slip",fb:"두 번째 ( 가 들어올 때 이미 하나가 쌓여 있었다."},{text:"6",correct:false,mc:"push-all",fb:"닫는 괄호는 쌓이지 않는다 — 짝을 지운다."}]},
    {id:"P02", unit:"A", stem:'괄호 검사 도중, 닫는 괄호를 만났는데 <b>스택이 공백</b>이다. 이것의 의미는?',
     okfb:'짝 없는 닫는 괄호 — 그 자리에서 즉시 오류 판정이다.',
     choices:[{text:"짝 없는 닫는 괄호 — 즉시 오류",correct:true},{text:"정상 — 계속 진행하면 된다",correct:false,mc:"rule-blind",fb:"pop할 것이 없다는 건 이 닫는 괄호의 짝이 '먼저 나온 적 없다'는 뜻이다."},{text:"닫는 괄호를 push하고 계속한다",correct:false,mc:"push-close",fb:"닫는 괄호는 쌓는 대상이 아니다."},{text:"식을 끝까지 읽어 봐야 알 수 있다",correct:false,mc:"late-check",fb:"이 오류는 발견 즉시 확정이다 — 뒤에 무엇이 와도 구제되지 않는다."}]},
    {id:"P03", unit:"A", stem:'괄호 검사를 <b>큐</b>로 하면 안 되는 이유는?',
     okfb:'닫는 괄호의 짝은 "가장 최근" 여는 괄호 — 큐는 "가장 오래된" 것부터 꺼낸다.',
     choices:[{text:"닫는 괄호의 짝은 가장 최근의 여는 괄호인데, 큐는 가장 오래된 것부터 꺼내기 때문",correct:true},{text:"큐는 숫자 전용이라 괄호 같은 문자를 저장할 수 없기 때문",correct:false,mc:"type-myth",fb:"저장은 된다 — 문제는 꺼내는 순서다."},{text:"front와 rear 두 변수를 함께 관리하느라 큐가 스택보다 훨씬 느리기 때문",correct:false,mc:"speed-reduction",fb:"속도가 아니라 '순서 규칙'의 문제다."},{text:"큐로도 똑같이 검사되지만 관례상 스택을 쓰는 것뿐이라서",correct:false,mc:"no-reason",fb:"(( )) 를 큐로 검사해 보라 — 안쪽 )가 바깥 (와 짝지어진다."}]},
    /* --- 유닛 B · 표기법과 우선순위 --- */
    {id:"P04", unit:"B", stem:'컴파일러가 수식을 표기하는 일반적인 방식은?',
     okfb:'후위 표기법(postfix) — 연산자가 피연산자 뒤에 온다.',
     choices:[{text:"후위 표기법 (postfix)",correct:true},{text:"중위 표기법 (infix)",correct:false,mc:"human-standard",fb:"중위는 사람이 쓰는 표준이다."},{text:"괄호 표기법",correct:false,mc:"term-invent",fb:"그런 표기법 이름은 없다."},{text:"이진 표기법",correct:false,mc:"term-mix",fb:"수의 진법과 수식의 표기법은 다른 이야기다."}]},
    {id:"P05", unit:"B", stem:'같은 중위식이 사람마다 다르게 계산될 수 있는 것을 막아 주는 <b>두 가지 규칙</b>은?',
     okfb:'연산자 우선 순위, 그리고 결합성(같은 급은 왼쪽부터).',
     choices:[{text:"연산자 우선 순위와 결합성",correct:true},{text:"괄호 검사와 스택",correct:false,mc:"tool-mix",fb:"그건 검사 도구지, 해석 규칙이 아니다."},{text:"변수 이름 규칙과 자료형",correct:false,mc:"topic-mix",fb:"이름과 타입은 계산 순서와 무관하다."},{text:"후위 표기법과 전위 표기법",correct:false,mc:"notation-mix",fb:"표기법은 규칙의 '결과물'이다 — 모호함을 없앤 형태."}]},
    {id:"P06", unit:"B", stem:'<span class="mono">6/2*3</span> 의 값은?', mono:true,
     okfb:'같은 급(/, *)은 왼쪽부터 — (6/2)*3 = 9.',
     choices:[{text:"9",correct:true},{text:"1",correct:false,mc:"right-assoc",fb:"6/(2*3)으로 묶었다 — 같은 급은 왼쪽부터다."},{text:"4",correct:false,mc:"calc-slip",fb:"단계별로: 6/2 = 3, 3×3 = ?"},{text:"둘 다 맞다",correct:false,mc:"ambiguous-myth",fb:"좌결합 규칙이 있어 답은 하나다."}]},
    {id:"P07", unit:"B", stem:'수식에서 <b>괄호</b>가 하는 일은?',
     okfb:'우선순위·결합성보다 앞서서, 계산 순서를 직접 지정한다.',
     choices:[{text:"우선순위 규칙을 이기고 계산 순서를 직접 지정한다",correct:true},{text:"식을 읽기 좋게 나누어 주는 장식일 뿐이다",correct:false,mc:"cosmetic",fb:"(1+2)*7 에서 괄호를 지우면 답이 바뀐다 — 장식이 아니다."},{text:"묶인 부분을 먼저 계산하게 해 속도를 높인다",correct:false,mc:"speed-reduction",fb:"순서를 정할 뿐, 빨라지지 않는다."},{text:"같은 우선순위의 연산자 사이에서만 의미가 있다",correct:false,mc:"partial-rule",fb:"급이 다른 연산자 사이에서도 괄호는 순서를 뒤집을 수 있다 — (1+2)*7 처럼."}]},
    /* --- 유닛 C · 후위식 평가 --- */
    {id:"P08", unit:"C", stem:'후위식 <span class="mono">8 2 / 3 *</span> 의 값은?', mono:true,
     okfb:'8/2=4, 4*3=12.',
     choices:[{text:"12",correct:true},{text:"48",correct:false,mc:"order-mix",fb:"/ 를 만난 순간 이미 8/2가 계산된다."},{text:"3",correct:false,mc:"calc-slip",fb:"단계별로: / 다음 스택에는 4와 3."},{text:"0",correct:false,mc:"operand-order",fb:"나눗셈의 왼쪽은 나중에 pop된 값(8)이다."}]},
    {id:"P09", unit:"C", stem:'후위식 <span class="mono">2 10 + 3 *</span> 의 값은?', mono:true,
     okfb:'2+10=12, 12×3=36. 두 자리 수(10)도 하나의 토큰이다.',
     choices:[{text:"36",correct:true},{text:"32",correct:false,mc:"precedence-ghost",fb:"후위식에 우선순위는 없다 — + 를 만난 순간 2+10이 계산된다."},{text:"23",correct:false,mc:"concat",fb:"2와 10은 이어붙이는 게 아니라 더하는 재료다."},{text:"60",correct:false,mc:"calc-slip",fb:"단계별로: + 다음 스택에는 12, 그 다음 3이 쌓인다."}]},
    {id:"P10", unit:"C", stem:'후위 표기식에 <b>괄호가 필요 없는</b> 이유는?',
     okfb:'연산자의 위치 자체가 계산 순서를 결정하기 때문 — 만나는 즉시 계산하면 된다.',
     choices:[{text:"연산자의 위치가 곧 계산 순서라, 따로 표시할 필요가 없기 때문",correct:true},{text:"후위식 문법에서 괄호는 아예 금지된 문자로 정해져 있기 때문",correct:false,mc:"rule-invert",fb:"금지라서 없는 게 아니라, 필요가 없어서 없는 것이다."},{text:"후위식의 피연산자는 항상 한 자리 수로 제한되기 때문",correct:false,mc:"digit-myth",fb:"2 10 + 처럼 두 자리 수도 얼마든지 온다."},{text:"컴퓨터는 괄호 문자를 숫자로 바꿔 읽지 못하기 때문",correct:false,mc:"hw-myth",fb:"괄호 검사에서 실컷 읽지 않았나."}]},
    /* --- 유닛 D · 변환 --- */
    {id:"P11", unit:"D", stem:'<span class="mono">a*b+5</span> 의 후위 표기는?', mono:true,
     okfb:'* 먼저: ((a*b)+5) → ab*5+.',
     choices:[{text:"ab*5+",correct:true},{text:"ab5*+",correct:false,mc:"lump-ops",fb:"* 는 (a*b)의 오른쪽 괄호 자리 — 5 앞이다."},{text:"ab5+*",correct:false,mc:"op-order",fb:"연산자마다 자기 괄호 자리가 있다."},{text:"5ab*+",correct:false,mc:"operand-order",fb:"피연산자 순서는 중위식 그대로다."}]},
    {id:"P12", unit:"D", stem:'<span class="mono">a+b*c</span> 의 후위 표기는?', mono:true,
     okfb:'* 먼저: (a+(b*c)) → abc*+.',
     choices:[{text:"abc*+",correct:true},{text:"ab+c*",correct:false,mc:"precedence-ignored",fb:"왼쪽부터 묶은 모양 — (a+b)*c는 다른 식이다."},{text:"abc+*",correct:false,mc:"op-order",fb:"+ 는 가장 바깥 괄호의 자리 — 맨 끝이 맞지만, * 가 먼저 나와야 한다."},{text:"bca*+",correct:false,mc:"operand-order",fb:"피연산자 순서는 a, b, c 그대로다."}]},
    {id:"P13", unit:"D", stem:'<span class="mono">(a+b)*c</span> 의 후위 표기는?', mono:true,
     okfb:'괄호가 +를 먼저 묶는다: ((a+b)*c) → ab+c*.',
     choices:[{text:"ab+c*",correct:true},{text:"abc*+",correct:false,mc:"paren-ignored",fb:"괄호를 무시하면 a+(b*c) — 다른 식이 된다."},{text:"abc+*",correct:false,mc:"lump-ops",fb:"+ 는 (a+b)의 오른쪽 괄호 자리 — c 앞이다."},{text:"ab+*c",correct:false,mc:"op-order",fb:"* 는 가장 바깥 괄호의 자리 — 맨 끝이다."}]},
    /* 코드 검증 보강 (2026-08-24) */
    {id:"P14", unit:"D", ptype:"parsons", stem:'괄호 묶기법 — 중위식을 후위식으로 바꾸는 절차를 <b>올바른 순서</b>로 조립하라.',
     lines:["식 전체를 우선순위와 좌결합 순서대로 괄호로 묶는다","각 연산자를 자기 짝의 오른쪽 괄호 자리로 옮긴다","남아 있는 모든 괄호를 삭제한다"],
     okfb:'묶고 → 옮기고 → 지운다. 연산자가 오른쪽 괄호 자리로 가기에 "후위" 표기가 된다.',
     fb:"세 동작의 이름을 떠올려라 — 묶기, 옮기기, 지우기. 옮길 자리는 묶어야 생기고, 지우는 것은 다 옮긴 뒤다."},
    {id:"P15", unit:"C", stem:'다음 후위식 평가 절차 중 <b>잘못된</b> 단계는?',
     okfb:'먼저 pop된 값이 "오른쪽" 피연산자다 — 5 3 - 에서 먼저 나온 3이 오른쪽, 5-3=2.',
     choices:[{text:"연산자를 만나면 먼저 pop된 값이 왼쪽 피연산자가 된다",correct:true},{text:"식을 왼쪽에서 오른쪽으로 한 토큰씩 차례로 읽어 나간다",correct:false,mc:"find-the-bug",fb:"이 단계는 올바르다 — 한 방향 한 번 훑기가 후위식의 장점이다."},{text:"피연산자를 만나면 스택에 push해 둔다",correct:false,mc:"find-the-bug",fb:"이 단계는 올바르다."},{text:"연산 결과를 다시 스택에 push한다",correct:false,mc:"find-the-bug",fb:"이 단계는 올바르다 — 다음 연산의 재료가 된다."}]},
    {id:"P16", unit:"D", stem:'중위→후위 변환의 <b>검산 규칙</b> — 변환 전후로 변하지 않아야 하는 것은?',
     okfb:'자리를 옮기는 것은 연산자뿐 — 피연산자의 순서와 연산자의 개수는 그대로여야 한다.',
     choices:[{text:"피연산자의 순서와 연산자의 개수",correct:true},{text:"연산자의 순서와 괄호의 개수",correct:false,mc:"op-order",fb:"연산자는 자리를 옮기고, 괄호는 사라진다 — 남는 불변량이 아니다."},{text:"식의 전체 길이와 토큰의 개수",correct:false,mc:"length-myth",fb:"괄호가 빠지므로 길이는 줄 수 있다."},{text:"각 피연산자와 연산자의 쌍",correct:false,mc:"pair-myth",fb:"짝은 변환 과정에서 재배치된다 — 불변은 순서(피연산자)와 개수(연산자)다."}]}
  ],

  /* ================= 미로 (금요일 밤 보너스) ================= */
  mazeCfg: {
    day:"금요일 밤",
    grid:[[0,1,0,0,0],[0,1,0,1,0],[0,0,0,1,0],[1,1,0,1,0],[1,1,0,1,0]],
    steps:[
      {say:'지난주 책이 예고했던 <b>미로</b>다 — Special Bonus. 개는 (0,0)에서 출발해 (4,4)의 출구를 찾는다. 교재는 8방향까지 다루지만, 여기서는 상하좌우 4방향으로 맛만 보자. 규칙은 하나 — <b>지나온 칸을 스택에 쌓는다.</b>'},
      {move:[1,0]},{move:[2,0]},{move:[2,1]},{move:[2,2]},
      {say:'갈림길이다. 아래로 가 보자.'},
      {move:[3,2]},{move:[4,2]},
      {predict:{id:"MZ1", stem:'(4,2)에 도착했는데 — 좌우는 벽, 아래는 없다. <b>막다른 길</b>이다. 다음 행동은?',
        okfb:'pop — 경로 스택의 톱을 걷어내며 한 걸음씩 되돌아간다. 이것이 백트래킹이다.',
        choices:[
          {text:"pop을 해서 (3,2)로 한 걸음 되돌아간다",correct:true},
          {text:"스택을 전부 비우고 (0,0)부터 다시 간다",correct:false,mc:"restart",fb:"갔던 길의 기억이 스택에 있다 — 전부 버리는 건 아깝다."},
          {text:"(4,2)를 한 번 더 push한다",correct:false,mc:"push-misuse",fb:"제자리를 다시 쌓아도 길은 열리지 않는다."},
          {text:"벽을 넘어간다",correct:false,mc:"cheat",fb:"미로의 벽(1)은 규칙이다."}]}},
      {pop:1},
      {predict:{id:"MZ2", stem:'(3,2)도 옆이 다 막혔다. <b>pop을 한 번 더</b> 하면 현재 위치(스택의 톱)는?',
        okfb:'스택 위에서 하나 더 걷어내면 (2,2) — 아까의 갈림길이다.',
        choices:[
          {text:"(2,2)",correct:true},
          {text:"(4,2)",correct:false,mc:"direction",fb:"pop은 왔던 길을 '거슬러' 올라간다."},
          {text:"(0,0)",correct:false,mc:"restart",fb:"pop 한 번은 딱 한 걸음이다."},
          {text:"(2,1)",correct:false,mc:"stack-depth",fb:"스택 그림에서 위에서 몇 번째인지 세어 보라."}]}},
      {pop:1},
      {say:'갈림길 (2,2)로 복귀. 이번엔 위로.'},
      {move:[1,2]},{move:[0,2]},{move:[0,3]},{move:[0,4]},
      {move:[1,4]},{move:[2,4]},{move:[3,4]},{move:[4,4]}
    ]
  }
};
