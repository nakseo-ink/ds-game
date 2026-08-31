"use strict";
/* ============================================================
   시험 문제은행 v1.0 — chM(중간)·chF(기말) 러너 전용. 학습 풀과 분리.
   원칙: 실기출·공개 문제의 "문형과 난이도"를 따르되 인스턴스(그림·수치·변수)는
   전부 재구성. 원문 복제 없음. src = 근거 유형(감수 추적용, 화면 비노출):
     기사   정보처리기사 필기 기출 유형
     기사구 정보처리기사(구) 필기 기출 유형
     대학   대학 중간고사 기출 유형(JHU CS226 예시 등)
     SF     Sanfoundry Data Structure MCQ
     ODSA   OpenDSA (MIT License)
     교재   강의노트 고유
   diff: 1 정의·판별 / 2 계산·트레이스 / 3 코드 읽기·빈칸
   설계 문서: 30-콘텐츠\20-시험문제은행-설계.md
   ============================================================ */
const EXAMBANK = {
  meta: { ver:"2.1", range:["ch01","ch02","ch03","ch04","ch05","ch06","ch07","ch08","ch09","ch10","ch11","ch12","ch13"] },
  items: [

  /* ================= 2주차 배열과 구조 (X101~X108) ================= */
  {id:"X101", ch:"ch01", unit:"A", diff:1, src:"기사구",
   stem:'다음 중 <b>선형 자료구조가 아닌</b> 것은?',
   okfb:'트리는 하나의 노드가 여러 갈래로 갈라지는 비선형 구조다. 나머지는 원소가 한 줄로 이어지는 선형 구조.',
   choices:[
     {text:"트리",correct:true},
     {text:"스택",correct:false,mc:"linear-confuse",fb:"스택은 한 줄로 쌓이는 선형 구조다 — 넣고 꺼내는 규칙이 특별할 뿐이다."},
     {text:"큐",correct:false,mc:"linear-confuse",fb:"큐도 원소가 한 줄로 이어지는 선형 구조다."},
     {text:"연결 리스트",correct:false,mc:"linear-confuse",fb:"연결 리스트는 저장 위치가 흩어져 있어도 논리적으로는 한 줄 — 선형 구조다."}]},

  {id:"X102", ch:"ch01", unit:"A", diff:2, src:"기사구", mono:true,
   stem:'<span class="mono">int A[10];</span> 의 시작 주소가 1000이고 int가 4바이트일 때, <span class="mono">A[6]</span>의 주소는?',
   okfb:'A[6] = 1000 + 6×4 = 1024. 배열은 「시작 주소 + 인덱스×원소 크기」로 즉시 접근한다.',
   choices:[
     {text:"1024",correct:true},
     {text:"1006",correct:false,mc:"no-scale",fb:"인덱스에 원소 크기(4바이트)를 곱해야 한다."},
     {text:"1028",correct:false,mc:"one-off",fb:"A[6]은 앞에 6개(A[0]~A[5])가 있다 — 7을 곱하지 않는다."},
     {text:"1240",correct:false,mc:"scale-slip",fb:"6×4=24 — 자릿수를 다시 확인하라."}]},

  {id:"X103", ch:"ch01", unit:"A", diff:1, src:"기사구",
   stem:'n개의 원소가 든 배열을 앞에서부터 차례로 비교하는 <b>순차 검색</b>의 평균 비교 횟수는?',
   okfb:'첫 원소면 1번, 마지막이면 n번 — 평균은 (n+1)/2다.',
   choices:[
     {text:"(n+1)/2",correct:true},
     {text:"n",correct:false,mc:"worst-avg",fb:"n번은 최악(마지막 원소)의 경우 — 평균이 아니다."},
     {text:"n/2 − 1",correct:false,mc:"formula-slip",fb:"1부터 n까지의 평균은 (n+1)/2다."},
     {text:"log₂n",correct:false,mc:"bsearch-confuse",fb:"log₂n은 정렬된 배열에서 반씩 줄이는 이진 탐색의 몫이다."}]},

  {id:"X104", ch:"ch01", unit:"C", diff:1, src:"SF",
   stem:'<b>구조체(struct)</b>가 배열과 구별되는 가장 큰 특징은?',
   okfb:'배열은 같은 타입만, 구조체는 서로 다른 타입의 항목을 하나의 단위로 묶는다.',
   choices:[
     {text:"서로 다른 타입의 항목을 하나로 묶을 수 있다",correct:true},
     {text:"원소를 인덱스 번호로 접근할 수 있다",correct:false,mc:"array-trait",fb:"인덱스 접근은 배열의 특징 — 구조체는 항목의 이름으로 접근한다."},
     {text:"실행 중에 크기를 마음대로 늘릴 수 있다",correct:false,mc:"dynamic-myth",fb:"구조체의 크기도 컴파일할 때 정해진다."},
     {text:"같은 타입의 원소만 저장할 수 있다",correct:false,mc:"reverse",fb:"그것은 배열의 규칙이다 — 구조체는 그 제약을 없앤 것이다."}]},

  {id:"X105", ch:"ch01", unit:"A", diff:2, src:"기사구", mono:true,
   stem:'<span class="mono">int A[3][4];</span> 가 행 우선(row-major)으로 저장된다. 시작 주소 1000, int 4바이트일 때 <span class="mono">A[2][1]</span>의 주소는?',
   okfb:'앞에 2개 행(2×4=8개)과 같은 행의 1개 — (8+1)×4 = 36, 주소는 1036.',
   choices:[
     {text:"1036",correct:true},
     {text:"1024",correct:false,mc:"col-major",fb:"열 우선으로 세면 그렇게 된다 — C는 행을 먼저 다 채운다."},
     {text:"1009",correct:false,mc:"no-scale",fb:"원소 크기 4바이트를 곱해야 한다."},
     {text:"1040",correct:false,mc:"one-off",fb:"A[2][1] 앞에는 2행×4 + 1 = 9개가 있다 — 10개가 아니다."}]},

  {id:"X106", ch:"ch01", unit:"B", diff:2, src:"대학", mono:true,
   stem:'배열을 함수의 매개변수로 전달하면 일어나는 일은?',
   okfb:'배열 이름은 첫 원소의 주소로 전달된다 — 함수 안에서 원본 배열이 그대로 수정된다.',
   choices:[
     {text:"첫 원소의 주소가 전달되어 원본을 수정할 수 있다",correct:true},
     {text:"배열 전체가 복사되어 원본은 바뀌지 않는다",correct:false,mc:"copy-myth",fb:"int 하나는 복사되지만 배열은 주소가 넘어간다 — 2주차 유닛 B의 핵심 구분이다."},
     {text:"배열은 함수에 전달할 수 없다",correct:false,mc:"cant-myth",fb:"전달된다 — 다만 값이 아니라 주소로."},
     {text:"마지막 원소의 주소가 전달된다",correct:false,mc:"end-myth",fb:"배열 이름은 첫 원소(인덱스 0)의 주소다."}]},

  {id:"X107", ch:"ch01", unit:"D", diff:1, src:"ODSA",
   stem:'<b>추상 자료형(ADT)</b>에 대한 설명으로 옳은 것은?',
   okfb:'ADT는 연산이 「무엇」을 하는지만 정의한다 — 「어떻게」 구현하는지는 감춘다.',
   choices:[
     {text:"연산의 기능만 정의하고 구현은 감춘다",correct:true},
     {text:"C 언어에만 있는 특별한 자료형이다",correct:false,mc:"lang-myth",fb:"ADT는 언어와 무관한 설계 개념이다."},
     {text:"구현 코드까지 포함해야 완성된다",correct:false,mc:"impl-confuse",fb:"구현을 떼어 놓는 것이 ADT의 목적이다."},
     {text:"배열로만 구현할 수 있는 자료형이다",correct:false,mc:"impl-confuse",fb:"같은 ADT를 배열로도, 연결 리스트로도 구현할 수 있다."}]},

  {id:"X108", ch:"ch01", unit:"D", diff:2, src:"교재", mono:true,
   stem:'다항식 <span class="mono">7x⁴ + 3x + 9</span> 를 「지수 = 인덱스」 방식(<span class="mono">coef[지수] = 계수</span>)의 배열로 저장하면? (인덱스 0부터 표기)',
   okfb:'인덱스 0=상수항 9, 1=x의 계수 3, 2·3차는 0, 4차는 7 — [9, 3, 0, 0, 7].',
   choices:[
     {text:"[9, 3, 0, 0, 7]",correct:true},
     {text:"[7, 3, 9]",correct:false,mc:"skip-zero",fb:"없는 차수의 자리도 0으로 채워야 인덱스가 차수 역할을 한다."},
     {text:"[7, 0, 0, 3, 9]",correct:false,mc:"reverse",fb:"인덱스 0이 상수항이다 — 높은 차수부터 적으면 인덱스와 차수가 어긋난다."},
     {text:"[9, 3, 7]",correct:false,mc:"skip-zero",fb:"x²·x³ 자리의 0을 건너뛰면 7이 2차 계수가 되어 버린다."}]},

  /* ================= 3주차 스택과 큐 (X201~X210) ================= */
  {id:"X201", ch:"ch02", unit:"A", diff:1, src:"기사",
   stem:'다음 중 <b>스택의 응용 분야가 아닌</b> 것은?',
   okfb:'운영체제의 작업 스케줄링은 도착한 순서대로 처리하는 큐의 일이다.',
   choices:[
     {text:"운영체제의 작업 스케줄링",correct:true},
     {text:"함수 호출의 복귀 주소 저장",correct:false,mc:"stack-app",fb:"함수 호출은 가장 나중에 부른 것부터 돌아온다 — 스택이 맞다."},
     {text:"수식의 후위 표기 변환",correct:false,mc:"stack-app",fb:"연산자를 잠시 쌓아 두는 곳이 스택이다 — 4주차에서 다뤘다."},
     {text:"문서 편집기의 실행 취소(undo)",correct:false,mc:"stack-app",fb:"가장 최근 작업부터 취소한다 — 스택이 맞다."}]},

  {id:"X202", ch:"ch02", unit:"A", diff:1, src:"SF",
   stem:'<b>재귀 호출</b>을 처리하기 위해 시스템이 내부적으로 사용하는 자료구조는?',
   okfb:'호출이 쌓였다가 가장 나중 것부터 돌아온다 — 시스템 스택이다.',
   choices:[
     {text:"스택",correct:true},
     {text:"큐",correct:false,mc:"fifo-confuse",fb:"먼저 부른 함수가 먼저 끝나는가? 아니다 — 가장 나중에 부른 것이 먼저 끝난다."},
     {text:"트리",correct:false,mc:"shape-confuse",fb:"호출 관계를 트리로 그릴 수는 있으나 실행 관리는 스택으로 한다."},
     {text:"배열",correct:false,mc:"impl-confuse",fb:"배열은 스택을 만드는 재료일 뿐 — 규칙(LIFO)을 답해야 한다."}]},

  {id:"X203", ch:"ch02", unit:"A", diff:2, src:"기사구", mono:true,
   stem:'공백 스택에 <span class="mono">push(A), push(B), push(C), pop(), push(D), pop(), pop()</span> 을 차례로 수행했다. pop으로 <b>꺼내진 순서</b>는?',
   okfb:'첫 pop은 C, D를 넣고 pop하면 D, 마지막 pop은 B — C, D, B.',
   choices:[
     {text:"C, D, B",correct:true},
     {text:"A, B, C",correct:false,mc:"fifo-confuse",fb:"먼저 넣은 것부터 나오는 건 큐다 — 스택은 위(top)부터."},
     {text:"C, B, D",correct:false,mc:"trace-slip",fb:"두 번째 pop 시점의 top은 방금 넣은 D다."},
     {text:"D, C, B",correct:false,mc:"trace-slip",fb:"첫 pop은 D를 넣기 전에 수행됐다 — 그 시점의 top은 C."}]},

  {id:"X204", ch:"ch02", unit:"A", diff:1, src:"기사", mono:true,
   stem:'크기 MAX인 배열로 만든 스택에서 <b>공백 상태</b>의 판정 조건은? (top은 맨 위 원소의 인덱스)',
   okfb:'원소가 하나도 없으면 top은 첫 인덱스보다 하나 아래 — top == -1 이다.',
   choices:[
     {text:"top == -1",correct:true},
     {text:"top == 0",correct:false,mc:"one-off",fb:"top이 0이면 인덱스 0에 원소가 하나 있는 상태다."},
     {text:"top == MAX-1",correct:false,mc:"full-confuse",fb:"그것은 포화(가득 참) 조건이다."},
     {text:"top == MAX",correct:false,mc:"full-confuse",fb:"배열의 유효 인덱스는 MAX-1까지 — 포화 조건도 top == MAX-1이다."}]},

  {id:"X205", ch:"ch02", unit:"B", diff:1, src:"대학",
   stem:'먼저 삽입된 원소가 먼저 삭제되는 <b>FIFO</b> 방식의 자료구조는?',
   okfb:'들어온 순서 그대로 나간다 — 큐다.',
   choices:[
     {text:"큐",correct:true},
     {text:"스택",correct:false,mc:"lifo-confuse",fb:"스택은 LIFO — 나중에 들어온 것이 먼저 나온다."},
     {text:"트리",correct:false,mc:"shape-confuse",fb:"트리에는 삽입·삭제의 줄 서기 규칙이 따로 없다."},
     {text:"구조체",correct:false,mc:"type-confuse",fb:"구조체는 항목을 묶는 틀이지 삽입·삭제 규칙이 아니다."}]},

  {id:"X206", ch:"ch02", unit:"C", diff:2, src:"기사",
   stem:'배열로 만든 <b>선형 큐</b>의 문제점으로, 원형 큐가 등장한 이유는?',
   okfb:'삭제로 앞쪽이 비어도 rear가 끝에 닿으면 포화로 판정된다 — 앞의 빈칸을 다시 쓰지 못한다.',
   choices:[
     {text:"앞이 비어도 rear가 끝에 닿으면 포화가 된다",correct:true},
     {text:"삽입과 삭제가 같은 쪽에서 일어나 순서가 뒤집힌다",correct:false,mc:"stack-confuse",fb:"같은 쪽에서 넣고 빼는 것은 스택이다 — 큐는 양 끝이 다르다."},
     {text:"원소를 검색하는 속도가 너무 느리다",correct:false,mc:"speed-myth",fb:"큐는 검색용 구조가 아니다 — 문제는 공간 재사용이다."},
     {text:"front가 항상 인덱스 0에 고정되어 있다",correct:false,mc:"move-myth",fb:"front를 0에 고정하고 전체를 당기는 방식도 있으나, 문제의 본질은 빈칸 재사용이다."}]},

  {id:"X207", ch:"ch02", unit:"C", diff:2, src:"기사", mono:true,
   stem:'크기 8인 <b>원형 큐</b>에서 front = 2, rear = 5일 때 저장된 원소의 개수는?',
   okfb:'(rear − front + 8) % 8 = 3개. front 다음 칸부터 rear까지가 원소다.',
   choices:[
     {text:"3",correct:true},
     {text:"4",correct:false,mc:"inclusive-slip",fb:"front 칸 자체는 비워 두는 자리다 — 3, 4, 5번 칸의 3개."},
     {text:"2",correct:false,mc:"count-slip",fb:"5 − 2 = 3이다."},
     {text:"5",correct:false,mc:"rear-read",fb:"rear 값이 곧 개수인 것은 front가 0일 때뿐이다."}]},

  {id:"X208", ch:"ch02", unit:"A", diff:3, src:"대학", mono:true,
   stem:'1, 2, 3을 이 순서대로 push하되 pop은 아무 때나 할 수 있다. 스택에서 <b>나올 수 없는</b> 출력 순서는?',
   okfb:'3이 먼저 나오려면 1, 2가 스택에 쌓여 있어야 하고, 그 둘은 반드시 2, 1 순서로 나온다 — 3, 1, 2는 불가능.',
   choices:[
     {text:"3, 1, 2",correct:true},
     {text:"1, 2, 3",correct:false,mc:"possible",fb:"push 직후 바로 pop을 반복하면 된다."},
     {text:"2, 1, 3",correct:false,mc:"possible",fb:"1, 2를 쌓고 2·1을 꺼낸 뒤 3을 넣었다 꺼내면 된다."},
     {text:"3, 2, 1",correct:false,mc:"possible",fb:"셋을 다 쌓은 뒤 차례로 꺼내면 된다."}]},

  {id:"X209", ch:"ch02", unit:"B", diff:1, src:"기사",
   stem:'<b>데크(deque)</b>에 대한 설명으로 옳은 것은?',
   okfb:'deque = double-ended queue. 양쪽 끝 모두에서 삽입과 삭제가 가능하다.',
   choices:[
     {text:"양쪽 끝에서 삽입과 삭제가 모두 가능하다",correct:true},
     {text:"한쪽 끝에서만 삽입과 삭제가 일어난다",correct:false,mc:"stack-confuse",fb:"그것은 스택이다."},
     {text:"삽입은 rear, 삭제는 front에서만 가능하다",correct:false,mc:"queue-confuse",fb:"그것은 보통의 큐다 — 데크는 그 제한을 푼 것이다."},
     {text:"우선순위가 높은 원소가 먼저 삭제된다",correct:false,mc:"pq-confuse",fb:"그것은 우선순위 큐다."}]},

  {id:"X210", ch:"ch02", unit:"C", diff:3, src:"기사", book:"c-op",
   stem:'크기 M인 원형 큐의 삽입 연산이다. 빈칸에 들어갈 식은?',
   code:["void enqueue(int item){","  rear = ____________ ;","  queue[rear] = item;","}"],
   okfb:'끝(M-1) 다음이 0으로 이어져야 원형이 된다 — (rear + 1) % M.',
   choices:[
     {text:"(rear + 1) % M",correct:true},
     {text:"rear + 1",correct:false,mc:"no-wrap",fb:"rear가 M-1일 때 배열 밖으로 나간다 — 처음으로 되돌리는 장치가 없다."},
     {text:"(rear + M) % M",correct:false,mc:"no-advance",fb:"이 식은 rear 그대로다 — 한 칸 나아가지 않는다."},
     {text:"rear % (M + 1)",correct:false,mc:"mod-slip",fb:"나머지 연산의 대상은 배열 크기 M이고, 먼저 1을 더해야 한다."}]},

  /* ================= 4주차 스택과 큐의 응용 (X301~X310) ================= */
  {id:"X301", ch:"ch03", unit:"C", diff:2, src:"기사", mono:true,
   stem:'다음 <b>postfix</b> 연산식의 연산 결과는? <span class="mono">2 5 * 3 4 * +</span>',
   okfb:'2 5 * = 10, 3 4 * = 12, 10 + 12 = 22.',
   choices:[
     {text:"22",correct:true},
     {text:"34",correct:false,mc:"left-chain",fb:"2×5×3+4처럼 이어 붙이면 안 된다 — 연산자는 바로 앞의 두 값만 취한다."},
     {text:"52",correct:false,mc:"late-apply",fb:"(2×5+3)×4로 묶였다 — 3 4 * 는 3과 4의 곱이다."},
     {text:"120",correct:false,mc:"all-mul",fb:"마지막 +를 곱셈으로 처리했다 — 연산자는 적힌 그대로."}]},

  {id:"X302", ch:"ch03", unit:"D", diff:2, src:"SF", mono:true,
   stem:'중위 표기식 <span class="mono">x*(y+z)/w</span> 를 후위 표기로 옳게 변환한 것은?',
   okfb:'괄호 안 y+z가 먼저 → xyz+, 곱하고 → xyz+*, 나누면 → xyz+*w/.',
   choices:[
     {text:"xyz+*w/",correct:true},
     {text:"xy*z+w/",correct:false,mc:"paren-ignore",fb:"괄호를 무시하고 왼쪽부터 묶었다 — (y+z)가 한 덩어리다."},
     {text:"xyz*+w/",correct:false,mc:"op-order",fb:"+가 *보다 먼저 나와야 한다 — 괄호 안이 먼저 계산되므로."},
     {text:"xyz+w*/",correct:false,mc:"op-order",fb:"*는 x와 (y+z)의 곱 — w보다 먼저 나온다."}]},

  {id:"X303", ch:"ch03", unit:"A", diff:1, src:"SF",
   stem:'수식의 <b>괄호가 옳게 쓰였는지 검사</b>할 때 사용하는 자료구조는?',
   okfb:'닫는 괄호의 짝은 가장 최근의 여는 괄호 — 가장 최근 것을 꺼내는 스택이 맞다.',
   choices:[
     {text:"스택",correct:true},
     {text:"큐",correct:false,mc:"fifo-confuse",fb:"큐는 가장 오래된 것부터 꺼낸다 — 짝이 어긋난다."},
     {text:"트리",correct:false,mc:"shape-confuse",fb:"검사에는 「가장 최근 여는 괄호」 하나만 있으면 된다 — 스택으로 충분하다."},
     {text:"2차원 배열",correct:false,mc:"type-confuse",fb:"쌓았다가 최근 것부터 지우는 규칙이 핵심이다."}]},

  {id:"X304", ch:"ch03", unit:"C", diff:1, src:"기사",
   stem:'후위 표기식을 스택으로 계산할 때, <b>연산자</b>를 만나면 하는 일은?',
   okfb:'피연산자 두 개를 꺼내 계산하고, 그 결과를 다시 스택에 넣는다.',
   choices:[
     {text:"값 두 개를 꺼내 계산하고 결과를 넣는다",correct:true},
     {text:"연산자를 스택에 넣고 다음으로 넘어간다",correct:false,mc:"conv-confuse",fb:"연산자를 쌓는 것은 「변환」 알고리즘이다 — 계산에서는 즉시 실행한다."},
     {text:"피연산자 한 개만 꺼내 계산한다",correct:false,mc:"one-pop",fb:"+, × 같은 이항 연산자는 값이 두 개 필요하다."},
     {text:"스택을 모두 비우고 처음부터 다시 읽는다",correct:false,mc:"restart-myth",fb:"후위식은 한 번 훑는 것으로 끝난다 — 그것이 장점이다."}]},

  {id:"X305", ch:"ch03", unit:"D", diff:1, src:"SF",
   stem:'중위 → 후위 변환에서 <b>피연산자</b>를 읽었을 때 하는 일은?',
   okfb:'피연산자는 순서가 바뀌지 않는다 — 읽는 즉시 출력으로 보낸다.',
   choices:[
     {text:"즉시 출력으로 보낸다",correct:true},
     {text:"스택에 넣고 우선순위를 비교한다",correct:false,mc:"op-treat",fb:"스택에 쌓아 순서를 조정하는 대상은 연산자다."},
     {text:"괄호가 나올 때까지 보류한다",correct:false,mc:"paren-treat",fb:"보류는 연산자의 일 — 피연산자는 기다릴 이유가 없다."},
     {text:"무시하고 연산자만 처리한다",correct:false,mc:"ignore-myth",fb:"피연산자가 결과 식의 몸통이다."}]},

  {id:"X306", ch:"ch03", unit:"B", diff:2, src:"SF", mono:true,
   stem:'중위 표기식 <span class="mono">a+b*c</span> 의 후위 표기는?',
   okfb:'*가 +보다 우선 — b*c가 먼저 묶여 abc*+ 가 된다.',
   choices:[
     {text:"abc*+",correct:true},
     {text:"ab+c*",correct:false,mc:"left-chain",fb:"왼쪽부터 묶으면 (a+b)*c가 된다 — 우선순위가 뒤집혔다."},
     {text:"abc+*",correct:false,mc:"op-order",fb:"+가 먼저 나오면 b+c부터 계산하는 식이 된다."},
     {text:"a+bc*",correct:false,mc:"half-convert",fb:"후위 표기에는 연산자가 피연산자 사이에 남지 않는다."}]},

  {id:"X307", ch:"ch03", unit:"B", diff:1, src:"기사",
   stem:'<b>후위 표기법</b>의 장점으로 옳은 것은?',
   okfb:'우선순위와 괄호가 이미 순서에 녹아 있다 — 왼쪽부터 그대로 계산하면 된다.',
   choices:[
     {text:"괄호 없이 왼쪽부터 그대로 계산할 수 있다",correct:true},
     {text:"사람이 읽고 쓰기에 가장 자연스럽다",correct:false,mc:"human-myth",fb:"사람에게 익숙한 것은 중위 표기 — 후위는 기계를 위한 표기다."},
     {text:"연산자의 개수가 중위 표기보다 줄어든다",correct:false,mc:"count-myth",fb:"연산자 개수는 같다 — 괄호가 사라질 뿐이다."},
     {text:"변환 없이 트리에 바로 저장되기 때문이다",correct:false,mc:"tree-myth",fb:"수식 트리와의 관계는 별개다 — 장점의 본질은 계산 순서다."}]},

  {id:"X308", ch:"ch03", unit:"D", diff:2, src:"SF", mono:true,
   stem:'중위 → 후위 변환 중 <b>오른쪽 괄호 )</b> 를 만나면 하는 일은?',
   okfb:'( 가 나올 때까지 스택의 연산자를 꺼내 출력하고, ( 는 출력하지 않고 버린다.',
   choices:[
     {text:"( 가 나올 때까지 연산자를 꺼내 출력한다",correct:true},
     {text:") 를 스택에 넣고 계속 진행한다",correct:false,mc:"push-close",fb:") 는 「여기까지 계산하라」는 신호 — 쌓는 대상이 아니다."},
     {text:") 를 즉시 출력으로 보낸다",correct:false,mc:"paren-out",fb:"후위 표기에 괄호는 남지 않는다."},
     {text:"스택의 모든 연산자를 무조건 꺼낸다",correct:false,mc:"over-pop",fb:"( 를 만나면 멈춰야 한다 — 괄호 밖의 연산자는 아직 차례가 아니다."}]},

  {id:"X309", ch:"ch03", unit:"C", diff:2, src:"대학",
   stem:'올바른 후위 표기식의 계산이 <b>정상적으로 끝난 순간</b>, 스택의 상태는?',
   okfb:'모든 연산이 끝나면 최종 결과 하나만 남는다 — 두 개 이상 남으면 식이 잘못된 것이다.',
   choices:[
     {text:"최종 결과값 하나만 남아 있다",correct:true},
     {text:"완전히 비어 있다",correct:false,mc:"empty-myth",fb:"마지막 연산의 결과를 넣은 채로 끝난다 — 그것을 꺼내는 것이 답이다."},
     {text:"피연산자가 두 개 남아 있다",correct:false,mc:"leftover",fb:"두 개가 남았다면 연산자가 모자란 잘못된 식이다."},
     {text:"연산자가 하나 남아 있다",correct:false,mc:"op-left",fb:"계산 스택에는 연산자를 넣지 않는다 — 값만 오간다."}]},

  {id:"X310", ch:"ch03", unit:"A", diff:3, src:"기사",
   stem:'수식을 왼쪽부터 끝까지 읽으며 괄호 검사를 마쳤는데, <b>스택에 여는 괄호 2개가 남아 있다</b>. 판정은?',
   okfb:'끝까지 읽었는데 스택에 남은 여는 괄호 = 짝 없는 여는 괄호 — 오류다.',
   choices:[
     {text:"오류 — 짝 없는 여는 괄호가 있다",correct:true},
     {text:"정상 — 남은 개수가 짝수이므로 문제없다",correct:false,mc:"even-myth",fb:"남은 괄호끼리는 짝이 될 수 없다 — 둘 다 닫는 짝을 만나지 못한 것이다."},
     {text:"정상 — 남은 괄호는 자동으로 소거된다",correct:false,mc:"auto-myth",fb:"pop은 닫는 괄호를 만났을 때만 일어난다 — 저절로 사라지지 않는다."},
     {text:"판정 불가 — 식을 한 번 더 읽어야 한다",correct:false,mc:"restart-myth",fb:"검사는 한 번 훑는 것으로 끝난다 — 끝난 시점의 스택이 곧 판정이다."}]},

  /* ================= 5주차 리스트 (X401~X410) ================= */
  {id:"X401", ch:"ch04", unit:"A", diff:1, src:"기사",
   stem:'배열과 비교했을 때 <b>연결 리스트의 장점</b>은?',
   okfb:'중간 삽입·삭제 때 링크만 고치면 된다 — 뒤의 원소들을 밀거나 당기지 않는다.',
   choices:[
     {text:"삽입·삭제 시 다른 원소를 옮길 필요가 없다",correct:true},
     {text:"인덱스로 어느 원소든 즉시 접근할 수 있다",correct:false,mc:"array-trait",fb:"즉시 접근은 배열의 장점 — 연결 리스트는 처음부터 따라가야 한다."},
     {text:"링크 필드가 없어 메모리를 아낀다",correct:false,mc:"reverse",fb:"반대다 — 연결 리스트는 링크 필드만큼 메모리를 더 쓴다."},
     {text:"원소들이 메모리에 연속으로 붙어 있다",correct:false,mc:"array-trait",fb:"연속 배치는 배열의 특징이다 — 연결 리스트는 흩어져도 된다."}]},

  {id:"X402", ch:"ch04", unit:"B", diff:3, src:"기사", mono:true,
   stem:'단순 연결 리스트에서 노드 p <b>뒤에</b> 새 노드 new를 삽입하는 올바른 코드는?',
   okfb:'새 노드가 먼저 뒤를 붙잡고(new→link), 그 다음 p가 새 노드를 가리킨다.',
   choices:[
     {text:"new->link = p->link;  p->link = new;",correct:true},
     {text:"p->link = new;  new->link = p->link;",correct:false,mc:"order-swap",fb:"p->link를 먼저 바꾸면 원래의 뒷부분 주소를 잃는다 — new->link = new가 되어 버린다."},
     {text:"new->link = p;  p->link = new;",correct:false,mc:"self-loop",fb:"new가 p를 가리키면 p ↔ new가 서로를 가리키는 고리가 된다."},
     {text:"p = new;  new->link = p->link;",correct:false,mc:"lost-list",fb:"p 자체를 덮어쓰면 리스트와의 연결이 끊어진다."}]},

  {id:"X403", ch:"ch04", unit:"C", diff:2, src:"대학", mono:true,
   stem:'단순 연결 리스트에서 노드 p의 <b>다음 노드를 삭제</b>하려 한다. 링크 수정으로 옳은 것은?',
   okfb:'p가 「다음의 다음」을 가리키게 하면 가운데 노드가 리스트에서 빠진다.',
   choices:[
     {text:"p->link = p->link->link;",correct:true},
     {text:"p->link = NULL;",correct:false,mc:"cut-all",fb:"그 뒤 전체가 리스트에서 끊어진다 — 하나만 빼야 한다."},
     {text:"p = p->link;",correct:false,mc:"move-only",fb:"p가 이동만 할 뿐 리스트의 링크는 그대로다."},
     {text:"p->link->link = p->link;",correct:false,mc:"self-loop",fb:"다음 노드가 자기 자신을 가리키게 될 뿐 — p는 여전히 그 노드를 가리킨다."}]},

  {id:"X404", ch:"ch04", unit:"A", diff:1, src:"기사", mono:true,
   stem:'헤드 포인터 head로 관리하는 단순 연결 리스트가 <b>공백</b>인 조건은?',
   okfb:'노드가 하나도 없으면 head는 아무것도 가리키지 않는다 — head == NULL.',
   choices:[
     {text:"head == NULL",correct:true},
     {text:"head->link == NULL",correct:false,mc:"one-node",fb:"그것은 노드가 「하나뿐」인 상태다 — head 자체를 봐야 한다."},
     {text:"head == 0 이 아닐 때",correct:false,mc:"reverse",fb:"NULL은 0으로 표현된다 — 조건이 뒤집혔다."},
     {text:"head->data == 0",correct:false,mc:"data-check",fb:"공백 리스트에서는 head->data를 읽는 것 자체가 오류다."}]},

  {id:"X405", ch:"ch04", unit:"C", diff:1, src:"SF",
   stem:'단순 연결 리스트에서 <b>k번째 노드에 접근</b>하는 데 걸리는 시간은?',
   okfb:'주소가 앞 노드에게만 있다 — 처음부터 링크를 k번 따라가야 하므로 노드 수에 비례한다.',
   choices:[
     {text:"처음부터 따라가야 하므로 k에 비례한다",correct:true},
     {text:"배열처럼 계산 한 번으로 즉시 접근한다",correct:false,mc:"array-trait",fb:"「시작 주소 + k×크기」 계산은 연속 배치일 때만 가능하다."},
     {text:"절반씩 건너뛰어 log₂k에 비례한다",correct:false,mc:"bsearch-confuse",fb:"가운데로 건너뛸 방법이 없다 — 링크는 한 칸씩만 간다."},
     {text:"뒤에서부터 세는 것이 항상 더 빠르다",correct:false,mc:"back-myth",fb:"단순 연결 리스트에는 뒤로 가는 링크가 없다."}]},

  {id:"X406", ch:"ch04", unit:"D", diff:1, src:"기사",
   stem:'<b>이중 연결 리스트</b>가 단순 연결 리스트와 다른 점은?',
   okfb:'선행 노드 링크가 추가되어 양방향 이동이 가능하다 — 대신 링크 필드가 2개다.',
   choices:[
     {text:"선행 노드로도 이동할 수 있다",correct:true},
     {text:"마지막 노드가 첫 노드를 가리킨다",correct:false,mc:"circular-confuse",fb:"그것은 원형 연결 리스트의 특징이다."},
     {text:"링크 필드 없이 데이터만 저장한다",correct:false,mc:"reverse",fb:"반대다 — 링크 필드가 하나 더 늘어난다."},
     {text:"노드를 정렬된 순서로만 삽입할 수 있다",correct:false,mc:"sort-myth",fb:"정렬 여부는 이중 연결과 무관하다."}]},

  {id:"X407", ch:"ch04", unit:"D", diff:2, src:"기사",
   stem:'<b>원형 연결 리스트</b>에 대한 설명으로 옳은 것은?',
   okfb:'마지막 노드의 링크가 NULL 대신 첫 노드를 가리킨다 — 어느 노드에서든 전체를 돌 수 있다.',
   choices:[
     {text:"마지막 노드의 링크가 첫 노드를 가리킨다",correct:true},
     {text:"마지막 노드의 링크는 항상 NULL이다",correct:false,mc:"linear-trait",fb:"NULL로 끝나는 것은 보통의(선형) 연결 리스트다."},
     {text:"모든 노드가 루트 노드를 가리킨다",correct:false,mc:"tree-confuse",fb:"루트는 트리의 용어다 — 원형 리스트는 끝이 처음으로 이어질 뿐이다."},
     {text:"노드 수가 반드시 짝수여야 한다",correct:false,mc:"count-myth",fb:"노드 수와는 무관하다."}]},

  {id:"X408", ch:"ch04", unit:"A", diff:1, src:"기사구",
   stem:'연결 리스트의 <b>노드(node)</b> 를 구성하는 두 요소는?',
   okfb:'값을 담는 데이터 필드와, 다음 노드의 주소를 담는 링크 필드다.',
   choices:[
     {text:"데이터 필드와 링크 필드",correct:true},
     {text:"인덱스와 원소",correct:false,mc:"array-trait",fb:"인덱스는 배열의 개념이다 — 노드에는 번호가 없다."},
     {text:"front와 rear",correct:false,mc:"queue-confuse",fb:"front·rear는 큐의 양 끝을 가리키는 변수다."},
     {text:"top과 bottom",correct:false,mc:"stack-confuse",fb:"top은 스택의 용어다."}]},

  {id:"X409", ch:"ch04", unit:"B", diff:3, src:"대학",
   stem:'노드 p 뒤 삽입에서 두 문장의 순서를 바꿔 <span class="mono">p->link = new;</span> 를 <b>먼저</b> 실행하면 생기는 일은?',
   okfb:'원래 p 뒤의 주소를 잃은 채 new->link = p->link를 하면 new가 자기 자신을 가리킨다 — 뒷부분 전체를 잃는다.',
   choices:[
     {text:"뒷부분 주소를 잃고 new가 자신을 가리킨다",correct:true},
     {text:"두 문장의 순서와 무관하게 결과는 같다",correct:false,mc:"order-blind",fb:"p->link는 두 문장 모두가 읽고 쓰는 값이다 — 순서가 결과를 바꾼다."},
     {text:"컴파일 오류가 발생한다",correct:false,mc:"compile-myth",fb:"문법은 멀쩡하다 — 실행 결과가 틀어질 뿐이라 더 위험하다."},
     {text:"new가 리스트에 두 번 삽입된다",correct:false,mc:"dup-myth",fb:"두 번이 아니라, new 뒤가 끊어지는 것이 문제다."}]},

  {id:"X410", ch:"ch04", unit:"A", diff:2, src:"기사",
   stem:'<b>연결 리스트의 단점</b>으로 옳은 것은?',
   okfb:'링크 필드만큼 메모리를 더 쓰고, k번째 원소는 처음부터 따라가야 한다.',
   choices:[
     {text:"링크 저장 공간이 더 들고 임의 접근이 느리다",correct:true},
     {text:"중간 삽입 때 뒤 원소를 전부 밀어야 한다",correct:false,mc:"array-trait",fb:"원소 밀기는 배열의 약점이다 — 연결 리스트는 링크만 고친다."},
     {text:"크기를 실행 중에 바꿀 수 없다",correct:false,mc:"array-trait",fb:"크기 고정은 배열의 약점 — 연결 리스트는 필요할 때마다 노드를 만든다."},
     {text:"같은 값을 두 번 저장할 수 없다",correct:false,mc:"dup-myth",fb:"값의 중복과 저장 구조는 무관하다."}]},

  /* ================= 6주차 트리와 이진 트리 (X501~X511) ================= */
  {id:"X501", ch:"ch05", unit:"A", diff:2, src:"기사구",
   stem:'그림의 트리의 <b>차수(degree)</b>는?',
   viz:{type:"tree", data:{v:"A", c:[{v:"B", c:[{v:"E"},{v:"F"}]},{v:"C"},{v:"D", c:[{v:"G"},{v:"H"},{v:"I"}]}]}},
   okfb:'트리의 차수 = 노드 차수의 최댓값. A와 D가 자식 3개로 최대 — 3이다.',
   choices:[
     {text:"3",correct:true},
     {text:"2",correct:false,mc:"min-pick",fb:"B의 차수가 2일 뿐 — 트리의 차수는 「최댓값」이다."},
     {text:"4",correct:false,mc:"level-confuse",fb:"자식 수를 세는 것이지 층수를 세는 것이 아니다."},
     {text:"9",correct:false,mc:"node-count",fb:"9는 노드의 개수다 — 차수는 자식 수의 최댓값이다."}]},

  {id:"X502", ch:"ch05", unit:"A", diff:2, src:"기사구",
   stem:'그림의 트리에서 <b>단말(terminal) 노드</b>의 개수는?',
   viz:{type:"tree", data:{v:"A", c:[{v:"B", c:[{v:"D"},{v:"E"}]},{v:"C", c:[{v:"F", c:[{v:"G"}]}]}]}},
   okfb:'자식이 없는 노드 — D, E, G의 3개다. F는 G가 있으므로 단말이 아니다.',
   choices:[
     {text:"3",correct:true},
     {text:"4",correct:false,mc:"leaf-slip",fb:"F는 자식 G가 있다 — 단말이 아니다."},
     {text:"2",correct:false,mc:"leaf-slip",fb:"가장 아래 층이 아니어도 자식이 없으면 단말이다 — D와 E도 센다."},
     {text:"7",correct:false,mc:"node-count",fb:"7은 전체 노드 수다."}]},

  {id:"X503", ch:"ch05", unit:"A", diff:1, src:"기사",
   stem:'트리에서 <b>단말(terminal) 노드</b>란?',
   okfb:'자식이 하나도 없는 노드 — 리프(leaf) 노드라고도 부른다.',
   choices:[
     {text:"자식이 하나도 없는 노드",correct:true},
     {text:"부모가 없는 노드",correct:false,mc:"root-confuse",fb:"부모가 없는 노드는 루트다."},
     {text:"자식이 정확히 하나인 노드",correct:false,mc:"degree-slip",fb:"자식이 하나라도 있으면 단말이 아니다."},
     {text:"가장 왼쪽에 있는 노드",correct:false,mc:"pos-myth",fb:"위치가 아니라 자식의 유무로 판정한다."}]},

  {id:"X504", ch:"ch05", unit:"C", diff:2, src:"기사",
   stem:'이진 트리의 <b>레벨 4</b>에 올 수 있는 노드의 최대 개수는? (루트의 레벨 = 1)',
   okfb:'레벨 1부터 1, 2, 4, 8 — 레벨 i의 최대는 2^(i−1), 즉 2³ = 8개다.',
   choices:[
     {text:"8",correct:true},
     {text:"16",correct:false,mc:"exp-off",fb:"레벨 1이 2⁰=1개에서 출발한다 — 레벨 4는 2³이다."},
     {text:"15",correct:false,mc:"sum-confuse",fb:"15 = 2⁴−1은 높이 4 트리 「전체」의 최대다."},
     {text:"4",correct:false,mc:"linear-guess",fb:"층마다 2배로 늘어난다 — 4가 아니라 2³이다."}]},

  {id:"X505", ch:"ch05", unit:"C", diff:2, src:"기사",
   stem:'높이가 h인 이진 트리가 가질 수 있는 <b>노드의 최대 개수</b>는? (루트의 레벨 = 1)',
   okfb:'1 + 2 + 4 + … + 2^(h−1) = 2^h − 1.',
   choices:[
     {text:"2^h − 1",correct:true},
     {text:"2^h",correct:false,mc:"sum-slip",fb:"각 층의 합 1+2+…+2^(h−1)은 2^h에서 1 모자란다."},
     {text:"2h − 1",correct:false,mc:"linear-guess",fb:"층마다 2배씩 늘어난다 — 거듭제곱이다."},
     {text:"h²",correct:false,mc:"linear-guess",fb:"제곱이 아니라 2의 거듭제곱이다."}]},

  {id:"X506", ch:"ch05", unit:"A", diff:1, src:"ODSA",
   stem:'노드가 n개인 트리의 <b>간선(edge)의 개수</b>는?',
   okfb:'루트를 제외한 모든 노드가 부모와 이어지는 간선을 정확히 하나 가진다 — n−1개.',
   choices:[
     {text:"n − 1",correct:true},
     {text:"n",correct:false,mc:"root-edge",fb:"루트에게는 위로 가는 간선이 없다 — 하나 모자란다."},
     {text:"n + 1",correct:false,mc:"off-two",fb:"간선은 노드보다 많을 수 없다."},
     {text:"n(n−1)/2",correct:false,mc:"graph-confuse",fb:"그것은 모든 쌍을 잇는 그래프의 최대 간선 수다."}]},

  {id:"X507", ch:"ch05", unit:"C", diff:1, src:"기사",
   stem:'<b>완전(complete) 이진 트리</b>의 정의로 옳은 것은?',
   okfb:'마지막 레벨 직전까지 모두 채우고, 마지막 레벨은 왼쪽부터 빈틈없이 채운 트리다.',
   choices:[
     {text:"마지막 직전 층까지 꽉 차고, 마지막 층은 왼쪽부터 찬다",correct:true},
     {text:"모든 단말 노드의 레벨이 같고 전 층이 꽉 차 있다",correct:false,mc:"full-confuse",fb:"그것은 포화(full) 이진 트리 — 완전 트리는 마지막 층이 덜 차도 된다."},
     {text:"모든 노드가 자식을 정확히 두 개씩 가진다",correct:false,mc:"full-confuse",fb:"완전 트리의 조건은 「채워지는 위치」이지 자식 수가 아니다."},
     {text:"왼쪽 서브트리가 오른쪽보다 항상 크다",correct:false,mc:"size-myth",fb:"크기 비교가 아니라 왼쪽부터 빈틈없이 채우는 규칙이다."}]},

  {id:"X508", ch:"ch05", unit:"D", diff:2, src:"기사",
   stem:'완전 이진 트리를 배열로 저장할 때(루트 = 인덱스 1), 인덱스 i 노드의 <b>왼쪽 자식</b>의 인덱스는?',
   okfb:'왼쪽 자식 2i, 오른쪽 자식 2i+1, 부모 i/2 — 세 공식이 배열 표현의 전부다.',
   choices:[
     {text:"2i",correct:true},
     {text:"2i + 1",correct:false,mc:"lr-swap",fb:"2i+1은 오른쪽 자식이다."},
     {text:"i/2",correct:false,mc:"parent-confuse",fb:"i/2는 부모의 인덱스다."},
     {text:"i + 1",correct:false,mc:"linear-guess",fb:"i+1은 같은 층의 이웃일 뿐, 자식이 아니다."}]},

  {id:"X509", ch:"ch05", unit:"D", diff:2, src:"기사",
   stem:'완전 이진 트리의 배열 표현(루트 = 인덱스 1)에서 인덱스 <b>7</b> 노드의 <b>부모</b>의 인덱스는?',
   okfb:'부모 = i/2 (정수 나눗셈) = 7/2 = 3.',
   choices:[
     {text:"3",correct:true},
     {text:"4",correct:false,mc:"round-up",fb:"정수 나눗셈은 버림이다 — 7/2 = 3."},
     {text:"14",correct:false,mc:"child-confuse",fb:"14 = 2×7은 왼쪽 자식이다."},
     {text:"6",correct:false,mc:"sibling-slip",fb:"6은 같은 부모의 왼쪽 형제(7−1)다."}]},

  {id:"X510", ch:"ch05", unit:"D", diff:2, src:"교재",
   stem:'한쪽으로만 뻗은 <b>경사(skewed) 트리</b>를 배열로 저장하면 생기는 문제는?',
   okfb:'높이 k 경사 트리는 2^k−1칸 중 k칸만 쓴다 — 나머지 칸이 전부 빈다.',
   choices:[
     {text:"사용하지 않는 빈칸이 대부분을 차지한다",correct:true},
     {text:"저장 자체가 불가능하다",correct:false,mc:"cant-myth",fb:"저장은 된다 — 낭비가 심할 뿐이다."},
     {text:"부모·자식 공식이 성립하지 않게 된다",correct:false,mc:"formula-myth",fb:"공식은 그대로 성립한다 — 빈칸이 많아지는 것이 문제다."},
     {text:"노드 접근 속도가 절반으로 느려진다",correct:false,mc:"speed-myth",fb:"접근 속도가 아니라 공간이 문제다."}]},

  {id:"X511", ch:"ch05", unit:"C", diff:3, src:"ODSA",
   stem:'어떤 이진 트리에서 <b>자식이 두 개인 노드가 4개</b>다. <b>단말 노드</b>의 개수는?',
   okfb:'이진 트리에서 단말 노드 수 = (자식 둘인 노드 수) + 1 — 4 + 1 = 5다.',
   choices:[
     {text:"5",correct:true},
     {text:"4",correct:false,mc:"equal-guess",fb:"갈라질 때마다 끝이 하나씩 늘고, 출발점 몫이 하나 더 있다 — n₂ + 1이다."},
     {text:"8",correct:false,mc:"double-guess",fb:"2배가 아니다 — 갈라진 횟수에 1을 더한 값이다."},
     {text:"트리마다 다르다",correct:false,mc:"varies-myth",fb:"자식 하나인 노드가 몇이든 이 관계는 변하지 않는다."}]},

  /* ================= 7주차 트리 순회 (X601~X611) ================= */
  {id:"X601", ch:"ch06", unit:"A", diff:2, src:"기사구", mono:true,
   stem:'그림의 이진 트리에 대한 <b>INORDER(중위) 운행</b> 결과는?',
   viz:{type:"tree", data:{v:"A", c:[{v:"B", c:[{v:"D"},{v:"E"}]},{v:"C", c:[null,{v:"F"}]}]}},
   okfb:'왼쪽 → 자신 → 오른쪽: D B E A C F.',
   choices:[
     {text:"D B E A C F",correct:true},
     {text:"A B D E C F",correct:false,mc:"pre-confuse",fb:"자신을 먼저 방문하면 전위(preorder)다."},
     {text:"D E B F C A",correct:false,mc:"post-confuse",fb:"자신을 마지막에 방문하면 후위(postorder)다."},
     {text:"A B C D E F",correct:false,mc:"level-confuse",fb:"층 순서대로 읽으면 레벨 순회다."}]},

  {id:"X602", ch:"ch06", unit:"A", diff:2, src:"기사", mono:true,
   stem:'그림의 이진 트리에 대한 <b>전위(preorder) 순회</b> 결과는?',
   viz:{type:"tree", data:{v:"K", c:[{v:"M", c:[{v:"R"},{v:"S"}]},{v:"N", c:[null,{v:"T"}]}]}},
   okfb:'자신 → 왼쪽 → 오른쪽: K M R S N T.',
   choices:[
     {text:"K M R S N T",correct:true},
     {text:"R M S K N T",correct:false,mc:"in-confuse",fb:"왼쪽을 먼저 다 방문하면 중위(inorder)다."},
     {text:"R S M T N K",correct:false,mc:"post-confuse",fb:"자신을 마지막에 방문하면 후위(postorder)다."},
     {text:"K M N R S T",correct:false,mc:"level-confuse",fb:"층 순서대로 읽으면 레벨 순회다."}]},

  {id:"X603", ch:"ch06", unit:"A", diff:2, src:"기사", mono:true,
   stem:'그림의 이진 트리에 대한 <b>후위(postorder) 순회</b> 결과는?',
   viz:{type:"tree", data:{v:"G", c:[{v:"H", c:[null,{v:"J"}]},{v:"I", c:[{v:"K"},{v:"L"}]}]}},
   okfb:'왼쪽 → 오른쪽 → 자신: J H K L I G.',
   choices:[
     {text:"J H K L I G",correct:true},
     {text:"G H J I K L",correct:false,mc:"pre-confuse",fb:"자신을 먼저 방문하면 전위(preorder)다."},
     {text:"H J G K I L",correct:false,mc:"in-confuse",fb:"왼쪽 → 자신 → 오른쪽이면 중위(inorder)다."},
     {text:"G H I J K L",correct:false,mc:"level-confuse",fb:"층 순서대로 읽으면 레벨 순회다."}]},

  {id:"X604", ch:"ch06", unit:"A", diff:1, src:"대학",
   stem:'어떤 이진 트리의 <b>전위 순회</b> 결과가 주어졌을 때, 결과의 <b>첫 번째</b> 원소는 반드시?',
   okfb:'전위는 자신을 가장 먼저 방문한다 — 출발점인 루트가 항상 맨 앞이다.',
   choices:[
     {text:"루트 노드",correct:true},
     {text:"가장 왼쪽 단말 노드",correct:false,mc:"in-confuse",fb:"가장 왼쪽 끝에서 시작하는 것은 중위·후위다."},
     {text:"가장 작은 값의 노드",correct:false,mc:"bst-confuse",fb:"값의 크기 순서는 순회 종류와 무관하다."},
     {text:"트리마다 다르다",correct:false,mc:"varies-myth",fb:"전위의 첫 방문은 언제나 루트로 정해져 있다."}]},

  {id:"X605", ch:"ch06", unit:"D", diff:2, src:"대학",
   stem:'<b>수식 트리</b>를 <b>후위 순회</b>하면 얻어지는 것은?',
   okfb:'피연산자 둘을 먼저, 연산자를 나중에 — 후위 표기식이 그대로 나온다.',
   choices:[
     {text:"수식의 후위 표기식",correct:true},
     {text:"수식의 중위 표기식",correct:false,mc:"in-confuse",fb:"중위 표기는 중위 순회의 몫이다 — 단, 괄호는 따로 붙여야 한다."},
     {text:"수식의 계산 결과",correct:false,mc:"eval-confuse",fb:"순회는 나열이다 — 계산까지 하려면 값을 만들며 올라와야 한다."},
     {text:"연산자만 골라낸 목록",correct:false,mc:"partial-myth",fb:"피연산자도 모두 방문한다."}]},

  {id:"X606", ch:"ch06", unit:"D", diff:3, src:"대학", mono:true,
   stem:'그림의 수식 트리가 나타내는 <b>수식</b>은?',
   viz:{type:"tree", data:{v:"−", c:[{v:"*", c:[{v:"a"},{v:"b"}]},{v:"/", c:[{v:"c"},{v:"d"}]}]}},
   okfb:'루트 −의 왼쪽은 a*b, 오른쪽은 c/d — a*b − c/d.',
   choices:[
     {text:"a*b − c/d",correct:true},
     {text:"(a−b)*(c/d)",correct:false,mc:"root-slip",fb:"루트가 전체 수식의 「마지막 연산」이다 — 루트는 −다."},
     {text:"a*(b−c)/d",correct:false,mc:"shape-slip",fb:"−의 두 자식은 * 전체와 / 전체다 — b와 c가 아니다."},
     {text:"a*b/c − d",correct:false,mc:"shape-slip",fb:"/의 자식은 c와 d — a*b는 /와 형제다."}]},

  {id:"X607", ch:"ch06", unit:"B", diff:1, src:"SF",
   stem:'트리의 <b>레벨 순회</b>(같은 층을 왼쪽부터 차례로 방문)에 사용하는 자료구조는?',
   okfb:'방문한 노드의 자식들을 줄 뒤에 세운다 — 먼저 넣은 것부터 꺼내는 큐다.',
   choices:[
     {text:"큐",correct:true},
     {text:"스택",correct:false,mc:"lifo-confuse",fb:"스택이면 나중에 넣은 자식부터 나와 한쪽으로 파고든다."},
     {text:"이중 연결 리스트",correct:false,mc:"impl-confuse",fb:"필요한 것은 FIFO 규칙이다."},
     {text:"자료구조가 필요 없다",correct:false,mc:"none-myth",fb:"아직 방문하지 않은 노드를 순서대로 기억할 곳이 필요하다."}]},

  {id:"X608", ch:"ch06", unit:"B", diff:1, src:"기사",
   stem:'재귀로 작성한 순회 함수가 실행될 때, 되돌아갈 위치를 관리하는 것은?',
   okfb:'함수 호출의 복귀 주소는 시스템 스택에 쌓인다 — 반복문 순회로 바꾸면 이 스택을 직접 만든다.',
   choices:[
     {text:"시스템 스택",correct:true},
     {text:"운영체제의 큐",correct:false,mc:"fifo-confuse",fb:"호출은 가장 나중 것부터 되돌아온다 — 큐가 아니다."},
     {text:"트리 자신의 링크 필드",correct:false,mc:"link-myth",fb:"링크는 아래로만 향한다 — 되돌아갈 길은 따로 기억해야 한다."},
     {text:"전역 변수 하나",correct:false,mc:"single-myth",fb:"되돌아갈 위치는 겹겹이 쌓인다 — 하나로는 부족하다."}]},

  {id:"X609", ch:"ch06", unit:"A", diff:3, src:"대학",
   stem:'다음 함수가 수행하는 순회는?',
   code:["void visit(TreeNode *p){","  if (p != NULL) {","    visit(p->left);","    visit(p->right);","    printf(\"%c\", p->data);","  }","}"],
   okfb:'출력이 두 재귀 호출 「뒤」에 있다 — 왼쪽 → 오른쪽 → 자신, 후위 순회다.',
   choices:[
     {text:"후위 순회",correct:true},
     {text:"전위 순회",correct:false,mc:"pos-slip",fb:"전위라면 printf가 두 호출보다 앞에 있어야 한다."},
     {text:"중위 순회",correct:false,mc:"pos-slip",fb:"중위라면 printf가 두 호출 사이에 있어야 한다."},
     {text:"레벨 순회",correct:false,mc:"level-confuse",fb:"레벨 순회는 재귀가 아니라 큐로 만든다."}]},

  {id:"X610", ch:"ch06", unit:"C", diff:3, src:"대학", mono:true,
   stem:'이진 트리의 <b>노드 개수</b>를 구하는 함수다. 빈칸에 들어갈 식은?',
   code:["int count(TreeNode *p){","  if (p == NULL) return 0;","  return ____________ ;","}"],
   okfb:'자신 1개 + 왼쪽 서브트리의 개수 + 오른쪽 서브트리의 개수.',
   choices:[
     {text:"1 + count(p->left) + count(p->right)",correct:true},
     {text:"count(p->left) + count(p->right)",correct:false,mc:"self-miss",fb:"자기 자신을 세지 않았다 — 항상 0이 반환된다."},
     {text:"1 + count(p->left)",correct:false,mc:"half-tree",fb:"오른쪽 서브트리가 통째로 빠졌다."},
     {text:"2 * count(p->left)",correct:false,mc:"shape-myth",fb:"양쪽이 같은 크기라는 보장은 없다 — 각각 세어 더한다."}]},

  {id:"X611", ch:"ch06", unit:"C", diff:2, src:"대학", mono:true,
   stem:'전위 순회가 <span class="mono">A B D E C</span>, 중위 순회가 <span class="mono">D B E A C</span>인 이진 트리에서 <b>루트의 오른쪽 자식</b>은?',
   okfb:'전위의 첫 원소 A가 루트. 중위에서 A의 오른쪽은 C 하나 — 오른쪽 자식은 C다.',
   choices:[
     {text:"C",correct:true},
     {text:"B",correct:false,mc:"lr-swap",fb:"중위에서 A보다 앞에 있는 D·B·E는 전부 왼쪽 서브트리다."},
     {text:"E",correct:false,mc:"subtree-slip",fb:"E는 중위에서 A 앞 — 왼쪽 서브트리 소속이다."},
     {text:"알 수 없다",correct:false,mc:"varies-myth",fb:"전위와 중위가 함께 주어지면 트리는 하나로 정해진다."}]},

  /* ================= 9주차 히프와 BST (X701~X705) — v2.0 기말 확장 ================= */
  {id:"X701", ch:"ch07", unit:"A", diff:1, src:"기사",
   stem:'<b>max 히프</b>의 정의로 옳은 것은?',
   okfb:'max 히프 = 완전 이진 트리이면서, 모든 부모의 키가 자식의 키보다 크거나 같은 트리.',
   choices:[
     {text:"부모의 키가 자식의 키보다 크거나 같은 완전 이진 트리",correct:true},
     {text:"왼쪽 자식이 오른쪽 자식보다 항상 작은 이진 트리",correct:false,mc:"sibling-myth",fb:"히프는 형제 사이의 대소를 정하지 않는다 — 부모·자식 관계만 정한다."},
     {text:"모든 노드의 키가 정렬된 순서로 저장된 이진 트리",correct:false,mc:"bst-confuse",fb:"좌<자신<우의 전순서는 이진 탐색 트리의 규칙이다."},
     {text:"루트에서 리프까지의 경로 길이가 전부 같은 트리",correct:false,mc:"shape-only",fb:"완전 이진 트리는 마지막 레벨이 왼쪽부터 채워지면 된다 — 경로 길이가 전부 같을 필요는 없다."}]},

  {id:"X702", ch:"ch07", unit:"B", diff:2, src:"대학", mono:true,
   stem:'배열 <span class="mono">[10, 7, 8, 3, 2, 5]</span>(인덱스 1부터)로 저장된 max 히프에서 <b>최댓값을 삭제</b>한 직후의 배열은?',
   okfb:'마지막 원소 5를 루트로 올리고 아래로 내린다: 5는 자식 7·8 중 큰 8과 교환 — [8, 7, 5, 3, 2].',
   choices:[
     {text:"8, 7, 5, 3, 2",correct:true},
     {text:"8, 7, 2, 3, 5",correct:false,mc:"wrong-fill",fb:"빈 루트는 마지막 원소(5)로 채운 뒤 내려보낸다 — 5가 8의 자리로 간다."},
     {text:"7, 3, 8, 2, 5",correct:false,mc:"left-only",fb:"내려보낼 때는 두 자식 중 큰 쪽(8)과 교환한다 — 왼쪽(7)이 아니다."},
     {text:"8, 5, 7, 3, 2",correct:false,mc:"swap-slip",fb:"5는 8의 원래 자리(인덱스 3)로 들어간다 — 7의 자리가 아니다."}]},

  {id:"X703", ch:"ch07", unit:"C", diff:1, src:"기사",
   stem:'<b>이진 탐색 트리</b>를 <b>중위 순회</b>하면 얻어지는 것은?',
   okfb:'좌 < 자신 < 우의 규칙 때문에, 중위 순회(좌→자신→우)는 키를 오름차순으로 방문한다.',
   choices:[
     {text:"키의 오름차순 나열",correct:true},
     {text:"키의 내림차순 나열",correct:false,mc:"reverse",fb:"내림차순은 우→자신→좌로 도는 역중위 순회의 결과다."},
     {text:"삽입된 순서 그대로의 나열",correct:false,mc:"insert-order",fb:"삽입 순서는 트리 모양에만 남는다 — 중위 순회는 값의 순서를 따른다."},
     {text:"레벨(층) 순서의 나열",correct:false,mc:"level-confuse",fb:"레벨 순서는 큐를 쓰는 레벨 순회의 결과다."}]},

  {id:"X704", ch:"ch07", unit:"C", diff:3, src:"기사", mono:true,
   stem:'이진 탐색 트리의 <b>탐색</b> 함수다. 빈칸에 들어갈 것은?',
   code:["TreeNode* search(TreeNode *p, int key){","  if (p == NULL) return NULL;","  if (key == p->key) return p;","  if (key < p->key)","    return search( ________ , key);","  return search(p->right, key);","}"],
   okfb:'찾는 키가 현재보다 작으면 왼쪽 서브트리로 내려간다 — p->left.',
   choices:[
     {text:"p->left",correct:true},
     {text:"p->right",correct:false,mc:"lr-swap",fb:"작은 키는 왼쪽에 있다 — 오른쪽은 큰 키의 방향이다."},
     {text:"p",correct:false,mc:"no-descend",fb:"자기 자신을 다시 부르면 무한 재귀다 — 한 층 내려가야 한다."},
     {text:"p->left->left",correct:false,mc:"two-step",fb:"한 번의 비교는 한 층만 내려간다 — 두 층을 건너뛰면 후보를 놓친다."}]},

  {id:"X705", ch:"ch07", unit:"D", diff:2, src:"대학",
   stem:'키를 <b>오름차순으로 계속 삽입</b>해 만든 이진 탐색 트리에서, n개 중 하나를 탐색하는 최악 시간은?',
   okfb:'매번 오른쪽으로만 자라 높이가 n인 경사 트리가 된다 — 탐색은 O(n).',
   choices:[
     {text:"O(n) — 한쪽으로만 자라 높이가 n이 되므로",correct:true},
     {text:"O(log n) — BST는 언제나 균형을 유지하므로",correct:false,mc:"balance-myth",fb:"보통의 BST는 스스로 균형을 잡지 않는다 — 삽입 순서가 모양을 정한다."},
     {text:"O(1) — 정렬된 입력은 위치가 자명하므로",correct:false,mc:"sorted-myth",fb:"정렬된 입력은 오히려 최악의 모양(경사 트리)을 만든다."},
     {text:"O(n log n) — 삽입과 탐색이 겹치므로",correct:false,mc:"total-confuse",fb:"n log n은 전체 정렬류 비용의 자릿수 — 탐색 한 번의 비용이 아니다."}]},

  /* ================= 10주차 그래프와 표현 (X801~X805) ================= */
  {id:"X801", ch:"ch08", unit:"A", diff:2, src:"기사",
   stem:'정점이 <b>6개</b>인 무방향 <b>완전 그래프</b>의 간선 수는?',
   okfb:'완전 그래프의 간선 수 = n(n−1)/2 = 6×5/2 = 15.',
   choices:[
     {text:"15",correct:true},
     {text:"30",correct:false,mc:"no-half",fb:"n(n−1)은 방향 그래프의 셈 — 무방향은 (0,1)=(1,0)이라 2로 나눈다."},
     {text:"36",correct:false,mc:"square",fb:"n²은 자기 자신으로의 간선까지 센 것 — 완전 그래프에 자기 간선은 없다."},
     {text:"5",correct:false,mc:"tree-confuse",fb:"n−1은 신장 트리의 간선 수 — 완전 그래프는 모든 쌍을 잇는다."}]},

  {id:"X802", ch:"ch08", unit:"B", diff:1, src:"기사",
   stem:'무방향 그래프에서 <b>모든 정점의 차수를 합하면</b> 간선 수 e와 어떤 관계인가?',
   okfb:'간선 하나가 양 끝 두 정점의 차수를 1씩 올린다 — 차수의 합 = 2e.',
   choices:[
     {text:"2e — 간선 하나가 두 정점의 차수를 만드므로",correct:true},
     {text:"e — 간선 하나가 차수 하나를 만드므로",correct:false,mc:"one-end",fb:"간선 (u, v)는 u와 v 양쪽의 차수에 들어간다 — 두 번 세어진다."},
     {text:"e/2 — 간선 두 개가 차수 하나를 만드므로",correct:false,mc:"reverse-half",fb:"방향이 반대다 — 합이 간선 수의 두 배다."},
     {text:"n − 1 — 정점 수에 따라 정해진다",correct:false,mc:"tree-confuse",fb:"n−1은 신장 트리의 간선 수 — 차수의 합과는 무관하다."}]},

  {id:"X803", ch:"ch08", unit:"C", diff:2, src:"대학",
   stem:'간선이 <b>7개</b>인 무방향 그래프를 <b>인접 행렬</b>로 저장하면, 행렬 안의 <b>1의 총 개수</b>는?',
   okfb:'간선 (i, j) 하나가 행렬의 [i][j]와 [j][i] 두 칸을 1로 만든다 — 7×2 = 14.',
   choices:[
     {text:"14",correct:true},
     {text:"7",correct:false,mc:"one-cell",fb:"무방향 간선은 대칭인 두 칸에 기록된다 — 한 칸이 아니다."},
     {text:"49",correct:false,mc:"square",fb:"49는 7²— 간선 수를 제곱할 이유가 없다."},
     {text:"행렬의 크기에 따라 다르다",correct:false,mc:"size-myth",fb:"행렬이 커져도 1의 개수는 간선 수의 두 배로 정해져 있다 — 나머지는 0일 뿐."}]},

  {id:"X804", ch:"ch08", unit:"D", diff:1, src:"기사",
   stem:'정점은 많고 간선은 <b>드문(희소한)</b> 그래프에 <b>인접 리스트</b>가 유리한 이유는?',
   okfb:'인접 리스트는 실제로 있는 간선만 노드로 저장한다 — 행렬은 없는 간선의 0까지 n²칸을 쓴다.',
   choices:[
     {text:"있는 간선만 저장해 공간이 간선 수에 비례하므로",correct:true},
     {text:"두 정점의 연결 여부를 한 번에 알 수 있으므로",correct:false,mc:"matrix-trait",fb:"한 번에 아는 것은 행렬의 장점 — 리스트는 체인을 따라가야 한다."},
     {text:"간선이 드물수록 리스트가 자동으로 정렬되므로",correct:false,mc:"sort-myth",fb:"인접 리스트에 자동 정렬은 없다 — 공간 절약이 핵심이다."},
     {text:"희소한 그래프는 행렬로 표현할 수 없으므로",correct:false,mc:"cant-myth",fb:"표현은 된다 — 다만 대부분의 칸이 0으로 낭비될 뿐이다."}]},

  {id:"X805", ch:"ch08", unit:"C", diff:3, src:"기사구", mono:true,
   stem:'인접 행렬 <span class="mono">adj_mat</span>로 저장된 <b>방향</b> 그래프에서 정점 v의 <b>진출 차수</b>를 세는 코드다. 빈칸에 들어갈 것은?',
   code:["int out_degree(int v){","  int j, count = 0;","  for (j = 0; j < n; j++)","    if ( ________ ) count++;","  return count;","}"],
   okfb:'진출 간선 v→j는 행렬의 v행에 기록된다 — adj_mat[v][j]를 센다.',
   choices:[
     {text:"adj_mat[v][j]",correct:true},
     {text:"adj_mat[j][v]",correct:false,mc:"in-out-swap",fb:"[j][v]는 j→v, 곧 들어오는 간선 — 진입 차수를 세게 된다."},
     {text:"adj_mat[v][v]",correct:false,mc:"self-loop",fb:"[v][v]는 자기 자신으로의 간선 한 칸만 반복해 보는 셈이다."},
     {text:"adj_mat[j][j]",correct:false,mc:"diag-slip",fb:"대각선 칸들은 v와 무관하다 — v의 행을 훑어야 한다."}]},

  /* ================= 11주차 그래프 탐색 (X901~X905) ================= */
  {id:"X901", ch:"ch09", unit:"A", diff:1, src:"기사",
   stem:'그래프 탐색에서 <b>DFS와 BFS가 사용하는 자료구조</b>를 옳게 짝지은 것은?',
   okfb:'DFS는 되돌아갈 갈림길을 스택(재귀 호출 스택)에, BFS는 다음에 갈 정점을 큐에 저장한다.',
   choices:[
     {text:"DFS는 스택, BFS는 큐",correct:true},
     {text:"DFS는 큐, BFS는 스택",correct:false,mc:"swap",fb:"반대다 — 깊이 우선은 최근 갈림길부터(스택), 너비 우선은 먼저 발견한 정점부터(큐)."},
     {text:"둘 다 스택",correct:false,mc:"stack-both",fb:"BFS가 스택을 쓰면 먼저 발견한 정점이 뒤로 밀린다 — 너비 우선이 무너진다."},
     {text:"둘 다 우선순위 큐",correct:false,mc:"pq-confuse",fb:"우선순위 큐는 Dijkstra 같은 가중치 알고리즘의 도구다."}]},

  {id:"X902", ch:"ch09", unit:"B", diff:2, src:"대학", mono:true,
   stem:'인접 정점: <span class="mono">0:(1,2) / 1:(0,3) / 2:(0,4) / 3:(1) / 4:(2)</span>. 정점 0에서 <b>DFS</b>를 시작하면(번호 작은 쪽 먼저) 방문 순서는?',
   okfb:'0→1(작은 쪽)→3, 3에서 막혀 되돌아와 0의 다음 인접 2→4. 순서는 0 1 3 2 4.',
   choices:[
     {text:"0 1 3 2 4",correct:true},
     {text:"0 1 2 3 4",correct:false,mc:"bfs-confuse",fb:"층별로 넓히는 것은 BFS의 순서 — DFS는 1에서 3까지 먼저 파고든다."},
     {text:"0 2 4 1 3",correct:false,mc:"order-slip",fb:"번호 작은 쪽 먼저 규칙이면 0의 인접 중 1을 2보다 먼저 방문한다."},
     {text:"0 1 3 4 2",correct:false,mc:"jump-slip",fb:"3에서 되돌아온 곳은 0 — 0의 다음 인접인 2를 거쳐야 4에 닿는다."}]},

  {id:"X903", ch:"ch09", unit:"C", diff:2, src:"대학", mono:true,
   stem:'인접 정점: <span class="mono">0:(1,2,3) / 1:(0,4) / 2:(0) / 3:(0) / 4:(1)</span>. 정점 0에서 <b>BFS</b>를 시작하면(번호 작은 쪽 먼저) 방문 순서는?',
   okfb:'0을 꺼내며 1·2·3을 큐에 — 그다음 1을 꺼내며 4를 큐에. 순서는 0 1 2 3 4.',
   choices:[
     {text:"0 1 2 3 4",correct:true},
     {text:"0 1 4 2 3",correct:false,mc:"dfs-confuse",fb:"1에서 4로 먼저 파고드는 것은 DFS — BFS는 0의 이웃 셋을 먼저 다 방문한다."},
     {text:"0 3 2 1 4",correct:false,mc:"order-slip",fb:"번호 작은 쪽 먼저 규칙이면 1·2·3 순서로 큐에 들어간다."},
     {text:"0 1 2 4 3",correct:false,mc:"queue-slip",fb:"4는 1의 이웃이라 3보다 늦게 큐에 들어간다 — 큐는 들어간 순서대로 나온다."}]},

  {id:"X904", ch:"ch09", unit:"D", diff:1, src:"기사",
   stem:'정점이 <b>8개</b>인 연결 그래프의 <b>신장 트리</b>가 갖는 간선 수는?',
   okfb:'신장 트리는 모든 정점을 사이클 없이 잇는다 — 간선 수는 항상 n−1 = 7.',
   choices:[
     {text:"7",correct:true},
     {text:"8",correct:false,mc:"n-slip",fb:"간선이 n개면 사이클이 하나 생긴다 — 트리는 n−1개다."},
     {text:"28",correct:false,mc:"complete-confuse",fb:"28 = 8×7/2은 완전 그래프의 간선 수다."},
     {text:"그래프의 간선 수에 따라 다르다",correct:false,mc:"varies-myth",fb:"원래 간선이 몇 개든, 골라 낸 신장 트리는 정확히 n−1개를 갖는다."}]},

  {id:"X905", ch:"ch09", unit:"B", diff:3, src:"기사구", mono:true,
   stem:'깊이 우선 탐색의 재귀 코드다. 빈칸에 들어갈 조건은?',
   code:["void dfs(int v){","  GraphNode *w;","  visited[v] = TRUE;","  printf(\"%d \", v);","  for (w = graph[v]; w; w = w->link)","    if ( ________ )","      dfs(w->vertex);","}"],
   okfb:'아직 방문하지 않은 인접 정점으로만 재귀한다 — !visited[w->vertex].',
   choices:[
     {text:"!visited[w->vertex]",correct:true},
     {text:"visited[w->vertex]",correct:false,mc:"negate-miss",fb:"방문한 곳으로 다시 들어가면 무한 순환이다 — 부정(!)이 필요하다."},
     {text:"w->vertex != v",correct:false,mc:"self-only",fb:"자기 자신만 피해서는 부족하다 — 이미 방문한 다른 정점으로도 되돌아간다."},
     {text:"w->link != NULL",correct:false,mc:"link-confuse",fb:"link는 인접 리스트의 다음 노드일 뿐 — 방문 여부와 무관하다."}]},

  /* ================= 12주차 가중치 그래프 (X1001~X1005) ================= */
  {id:"X1001", ch:"ch10", unit:"B", diff:1, src:"기사",
   stem:'<b>Kruskal 알고리즘</b>의 동작 원리로 옳은 것은?',
   okfb:'간선을 가중치 오름차순으로 정렬해 두고, 사이클을 만들지 않는 간선만 차례로 채택한다.',
   choices:[
     {text:"가중치가 작은 간선부터, 사이클을 만들지 않으면 채택한다",correct:true},
     {text:"한 정점에서 출발해 트리에 인접한 최소 간선을 채택한다",correct:false,mc:"prim-confuse",fb:"하나의 트리를 키워 가는 것은 Prim의 방식이다."},
     {text:"출발 정점에서 각 정점까지의 최단 거리를 확정해 간다",correct:false,mc:"dijkstra-confuse",fb:"그것은 Dijkstra — 최단 경로의 문제다."},
     {text:"가중치가 큰 간선부터 하나씩 제거해 간다",correct:false,mc:"reverse-build",fb:"Kruskal은 빈 상태에서 작은 간선을 더해 간다 — 큰 것을 지우는 방식이 아니다."}]},

  {id:"X1002", ch:"ch10", unit:"A", diff:2, src:"대학", mono:true,
   stem:'정점 A·B·C·D, 간선 <span class="mono">(A,B)=1, (B,C)=2, (A,C)=3, (C,D)=4, (B,D)=5</span>인 그래프의 <b>최소 비용 신장 트리</b>의 가중치 합은?',
   okfb:'작은 것부터: 1 채택, 2 채택, 3은 A–B–C 사이클이라 거부, 4 채택 — 합 1+2+4 = 7.',
   choices:[
     {text:"7",correct:true},
     {text:"6",correct:false,mc:"cycle-miss",fb:"1+2+3=6은 (A,C)를 넣은 셈 — A·B·C가 사이클이 되어 거부해야 한다."},
     {text:"8",correct:false,mc:"skip-slip",fb:"세 간선이면 정점 넷을 다 잇는다 — 1+2+4보다 큰 조합을 고를 이유가 없다."},
     {text:"10",correct:false,mc:"wrong-pick",fb:"1+4+5는 (B,C)=2를 건너뛴 조합 — 작은 간선부터 사이클 검사만 하면 된다."}]},

  {id:"X1003", ch:"ch10", unit:"C", diff:1, src:"기사",
   stem:'MST를 만드는 <b>Prim 알고리즘</b>이 Kruskal과 구별되는 특징은?',
   okfb:'Prim은 시작 정점에서 출발해 언제나 하나의 트리를 유지하며, 트리에 인접한 최소 간선으로 키워 간다.',
   choices:[
     {text:"언제나 하나의 트리를 유지하며 인접한 최소 간선으로 키운다",correct:true},
     {text:"간선을 가중치 순으로 정렬해 놓고 시작한다",correct:false,mc:"kruskal-trait",fb:"전체 간선 정렬은 Kruskal의 준비 단계다 — Prim은 트리 주변만 본다."},
     {text:"여러 조각의 트리가 자라다 마지막에 합쳐진다",correct:false,mc:"forest-confuse",fb:"조각들이 자라는 것은 Kruskal의 모습 — Prim은 처음부터 끝까지 한 덩어리다."},
     {text:"결과 트리의 가중치 합이 Kruskal보다 항상 작다",correct:false,mc:"better-myth",fb:"둘 다 최소 비용 신장 트리를 만든다 — 합은 같다."}]},

  {id:"X1004", ch:"ch10", unit:"D", diff:2, src:"대학", mono:true,
   stem:'간선 <span class="mono">v0→v1=5, v0→v2=10, v1→v2=3</span>인 방향 그래프에서 <b>Dijkstra(출발 v0)</b>가 끝난 뒤 <span class="mono">distance[2]</span>는?',
   okfb:'직행 10보다 v1을 거친 5+3=8이 짧다 — v1 확정 때 distance[2]가 10에서 8로 갱신된다.',
   choices:[
     {text:"8",correct:true},
     {text:"10",correct:false,mc:"no-update",fb:"직행 거리에서 멈춘 값 — v1을 확정한 뒤 5+3=8로 갱신해야 한다."},
     {text:"3",correct:false,mc:"edge-only",fb:"3은 v1→v2 간선 하나의 값 — 출발점 v0에서의 거리가 아니다."},
     {text:"5",correct:false,mc:"wrong-vertex",fb:"5는 distance[1] — v2까지는 그 뒤로 3을 더 가야 한다."}]},

  {id:"X1005", ch:"ch10", unit:"D", diff:3, src:"기사구", mono:true,
   stem:'Dijkstra에서 정점 u를 확정한 직후 실행하는 <b>거리 갱신</b> 코드다. 빈칸에 들어갈 것은?',
   code:["for (w = 0; w < n; w++)","  if (!found[w])","    if ( ________ < distance[w])","      distance[w] = distance[u] + cost[u][w];"],
   okfb:'u를 거쳐 가는 새 경로의 길이 distance[u]+cost[u][w]가 기존 값보다 짧으면 갱신한다.',
   choices:[
     {text:"distance[u] + cost[u][w]",correct:true},
     {text:"cost[u][w]",correct:false,mc:"edge-only",fb:"간선 하나의 길이만 비교하면 출발점에서 u까지 온 거리가 빠진다."},
     {text:"distance[u]",correct:false,mc:"no-edge",fb:"u까지의 거리만으로는 w에 닿지 못한다 — u→w 간선을 더해야 한다."},
     {text:"distance[w] + cost[u][w]",correct:false,mc:"self-add",fb:"갱신 대상인 distance[w]를 새 경로 쪽에 더하면 비교가 성립하지 않는다."}]},

  /* ================= 13주차 단순 정렬 (X1101~X1105) ================= */
  {id:"X1101", ch:"ch11", unit:"A", diff:1, src:"기사",
   stem:'<b>안정(stable) 정렬</b>의 정의로 옳은 것은?',
   okfb:'키가 같은 레코드들의 상대적 순서가 정렬 후에도 유지되는 정렬이다.',
   choices:[
     {text:"같은 키를 가진 레코드들의 원래 순서가 유지된다",correct:true},
     {text:"어떤 입력에서도 실행 시간이 일정하다",correct:false,mc:"time-confuse",fb:"시간의 일관성은 별개의 성질 — 안정성은 같은 키의 순서에 대한 약속이다."},
     {text:"추가 메모리를 전혀 사용하지 않는다",correct:false,mc:"inplace-confuse",fb:"그것은 제자리(in-place) 정렬의 성질이다."},
     {text:"정렬 도중에 중단해도 앞부분은 정렬돼 있다",correct:false,mc:"partial-myth",fb:"회전마다 앞부분이 확정되는 것은 일부 정렬의 우연한 성질일 뿐이다."}]},

  {id:"X1102", ch:"ch11", unit:"B", diff:2, src:"기사구", mono:true,
   stem:'배열 <span class="mono">[8, 3, 4, 9, 7]</span>에 <b>선택 정렬 1회전</b>(최솟값 선택)을 수행한 직후의 배열은?',
   okfb:'남은 전체에서 최솟값 3을 골라 맨 앞 8과 교환한다 — [3, 8, 4, 9, 7].',
   choices:[
     {text:"3, 8, 4, 9, 7",correct:true},
     {text:"3, 4, 8, 9, 7",correct:false,mc:"multi-move",fb:"1회전의 교환은 한 번뿐이다 — 최솟값과 맨 앞만 자리를 바꾼다."},
     {text:"3, 8, 4, 7, 9",correct:false,mc:"bubble-confuse",fb:"이웃 교환으로 큰 값이 끝으로 밀리는 것은 버블 정렬의 1회전이다."},
     {text:"8, 3, 4, 7, 9",correct:false,mc:"max-confuse",fb:"최솟값 선택은 앞자리를 확정한다 — 뒤가 아니라 앞이 바뀐다."}]},

  {id:"X1103", ch:"ch11", unit:"C", diff:2, src:"기사구", mono:true,
   stem:'배열 <span class="mono">[9, 6, 7, 3, 5]</span>에 <b>버블 정렬 1회전</b>을 수행한 직후의 배열은?',
   okfb:'9가 이웃 비교마다 교환되며 끝까지 밀려간다 — [6, 7, 3, 5, 9].',
   choices:[
     {text:"6, 7, 3, 5, 9",correct:true},
     {text:"3, 9, 6, 7, 5",correct:false,mc:"select-confuse",fb:"최솟값이 앞으로 오는 것은 선택 정렬 — 버블은 최댓값이 뒤로 간다."},
     {text:"6, 7, 5, 3, 9",correct:false,mc:"pair-slip",fb:"3과 5는 이번 회전에서 비교될 때 이미 순서가 맞아 교환되지 않는다."},
     {text:"3, 5, 6, 7, 9",correct:false,mc:"onepass-myth",fb:"완성까지는 여러 회전이 필요하다 — 1회전은 최댓값 하나만 확정한다."}]},

  {id:"X1104", ch:"ch11", unit:"D", diff:1, src:"기사",
   stem:'<b>거의 정렬된</b> 입력에서 가장 빨리 끝나는 단순 정렬과 그 이유는?',
   okfb:'삽입 정렬 — 제자리에 있는 원소는 비교 한 번으로 끝나, 정렬된 입력이면 O(n)에 끝난다.',
   choices:[
     {text:"삽입 정렬 — 제자리 원소는 비교 한 번으로 끝나므로",correct:true},
     {text:"선택 정렬 — 교환 횟수가 가장 적으므로",correct:false,mc:"select-trait",fb:"교환은 적지만 비교는 입력과 무관하게 항상 n(n−1)/2번이다."},
     {text:"버블 정렬 — 이웃만 비교하므로 가장 단순해서",correct:false,mc:"simple-myth",fb:"단순함과 속도는 별개다 — 기본 버블은 정렬된 입력에도 전 회전을 돈다."},
     {text:"셋 다 같다 — 모두 O(n²)이므로",correct:false,mc:"bigO-flat",fb:"최악의 자릿수가 같아도 입력에 따른 실제 횟수는 다르다 — 삽입만 입력에 민감하다."}]},

  {id:"X1105", ch:"ch11", unit:"D", diff:3, src:"기사구", mono:true,
   stem:'삽입 정렬 코드다. 빈칸에 들어갈 것은?',
   code:["for (i = 1; i < n; i++){","  next = list[i];","  for (j = i-1; j >= 0 && list[j] > next; j--)","    ________ ;","  list[j+1] = next;","}"],
   okfb:'큰 원소를 한 칸 뒤로 민다 — list[j+1] = list[j].',
   choices:[
     {text:"list[j+1] = list[j]",correct:true},
     {text:"list[j] = list[j+1]",correct:false,mc:"dir-swap",fb:"앞으로 당기면 밀 자리가 생기지 않는다 — 뒤로 밀어야 next의 자리가 난다."},
     {text:"list[j] = next",correct:false,mc:"early-place",fb:"밀기가 끝나기 전에 next를 넣으면 아직 비교하지 않은 원소를 덮는다."},
     {text:"SWAP(list[j], list[j+1])",correct:false,mc:"swap-waste",fb:"복사해 둔 next가 있으니 교환은 낭비다 — 한 방향 밀기만 하면 된다."}]},

  /* ================= 14주차 고급 정렬 (X1201~X1205) ================= */
  {id:"X1201", ch:"ch12", unit:"A", diff:1, src:"기사",
   stem:'첫 원소를 피봇으로 삼는 <b>퀵 정렬</b>이 <b>최악의 O(n²)</b>이 되는 대표적 입력은?',
   okfb:'이미 정렬된(또는 역순) 입력 — 분할이 1 : n−1로 쏠려 재귀 깊이가 n이 된다.',
   choices:[
     {text:"이미 정렬된 입력 — 분할이 한쪽으로 쏠리므로",correct:true},
     {text:"무작위로 섞인 입력 — 예측이 불가능하므로",correct:false,mc:"random-myth",fb:"무작위 입력은 오히려 평균적인 절반 분할을 만든다 — 퀵의 좋은 경우다."},
     {text:"모든 키가 서로 다른 입력",correct:false,mc:"distinct-myth",fb:"키가 다 다른 것은 문제가 아니다 — 쏠림은 순서에서 온다."},
     {text:"크기가 홀수인 입력",correct:false,mc:"size-myth",fb:"크기의 홀짝은 분할의 균형과 무관하다."}]},

  {id:"X1202", ch:"ch12", unit:"B", diff:2, src:"기사",
   stem:'원소 <b>8개</b>를 반복(비재귀) <b>합병 정렬</b>로 정렬할 때, 필요한 <b>회전(pass)의 수</b>는?',
   okfb:'런 길이가 1→2→4→8로 배가된다 — 회전 수는 ⌈log₂8⌉ = 3.',
   choices:[
     {text:"3",correct:true},
     {text:"8",correct:false,mc:"n-confuse",fb:"n번 도는 것은 단순 정렬의 셈 — 합병은 회전마다 런이 배가된다."},
     {text:"4",correct:false,mc:"off-one",fb:"1→2→4→8은 세 번의 배가다 — 시작 상태는 회전이 아니다."},
     {text:"7",correct:false,mc:"n-1-confuse",fb:"n−1은 선택 정렬의 회전 수 — 합병은 log₂n번이면 된다."}]},

  {id:"X1203", ch:"ch12", unit:"C", diff:2, src:"대학", mono:true,
   stem:'배열 <span class="mono">[5, 3, 8, 1]</span>(인덱스 1부터)을 <b>max 히프로 구성</b>한 직후의 배열은?',
   okfb:'마지막 내부 노드부터 조정한다: 3은 자식 1과 문제없음, 루트 5는 자식 3·8 중 큰 8과 교환 — [8, 3, 5, 1].',
   choices:[
     {text:"8, 3, 5, 1",correct:true},
     {text:"8, 5, 3, 1",correct:false,mc:"sort-confuse",fb:"내림차순 완전 정렬이 아니다 — 부모≥자식만 맞추면 5는 3과 자리를 바꿀 이유가 없다."},
     {text:"5, 3, 8, 1",correct:false,mc:"no-adjust",fb:"루트 5 아래에 8이 있으면 max 히프가 아니다 — 조정이 필요하다."},
     {text:"1, 3, 5, 8",correct:false,mc:"min-confuse",fb:"작은 값이 위로 가는 것은 min 히프다."}]},

  {id:"X1204", ch:"ch12", unit:"D", diff:1, src:"기사",
   stem:'O(n log n) 정렬(퀵·합병·히프) 가운데 <b>안정</b>인 것은?',
   okfb:'합병 정렬 — merge가 같은 키일 때 앞 배열을 먼저 옮기므로 순서가 유지된다. 퀵·히프는 원거리 교환으로 불안정.',
   choices:[
     {text:"합병 정렬",correct:true},
     {text:"퀵 정렬",correct:false,mc:"quick-myth",fb:"분할의 원거리 교환이 같은 키의 순서를 뒤집을 수 있다 — 불안정이다."},
     {text:"히프 정렬",correct:false,mc:"heap-myth",fb:"루트와 마지막 원소의 교환이 순서를 건너뛴다 — 불안정이다."},
     {text:"셋 다 안정이다",correct:false,mc:"all-myth",fb:"셋 중 안정은 합병뿐 — 그래서 합병이 안정성이 필요한 곳의 표준이다."}]},

  {id:"X1205", ch:"ch12", unit:"A", diff:3, src:"기사구", mono:true,
   stem:'퀵 정렬의 <b>분할(partition)</b> 코드다. 마지막 빈칸에 들어갈 것은?',
   code:["pivot = list[left]; i = left; j = right + 1;","do {","  do i++; while (list[i] < pivot);","  do j--; while (list[j] > pivot);","  if (i < j) SWAP(list[i], list[j]);","} while (i < j);","SWAP(list[left], ________ );"],
   okfb:'두 인덱스가 교차한 뒤 j는 피봇 이하 구역의 끝 — 피봇을 list[j]와 교환해 제자리에 놓는다.',
   choices:[
     {text:"list[j]",correct:true},
     {text:"list[i]",correct:false,mc:"ij-swap",fb:"교차 후 i는 피봇보다 큰 값 위에 있다 — 피봇이 큰 값 구역에 놓이게 된다."},
     {text:"list[right]",correct:false,mc:"end-slip",fb:"오른쪽 끝은 분할 경계와 무관한 자리다."},
     {text:"pivot",correct:false,mc:"var-confuse",fb:"pivot은 값의 복사본 — 배열의 칸이 아니라 교환할 수 없다."}]},

  /* ================= 보강주차 해시 (X1301~X1305) ================= */
  {id:"X1301", ch:"ch13", unit:"A", diff:1, src:"기사",
   stem:'해싱에서 서로 다른 키가 <b>같은 주소로 계산</b>되는 일과, 그런 키들을 부르는 이름을 옳게 짝지은 것은?',
   okfb:'같은 주소로 계산되는 일이 충돌(collision), 그렇게 된 키들이 동거자(synonym)다.',
   choices:[
     {text:"충돌(collision) — 동거자(synonym)",correct:true},
     {text:"오버플로(overflow) — 동거자(synonym)",correct:false,mc:"overflow-confuse",fb:"오버플로는 버킷의 슬롯이 다 차서 저장할 곳이 없는 상태 — 충돌의 다음 단계다."},
     {text:"충돌(collision) — 포화(saturation)",correct:false,mc:"term-slip",fb:"같은 주소의 키들을 부르는 표준 용어는 synonym이다."},
     {text:"군집(cluster) — 프로브(probe)",correct:false,mc:"cluster-confuse",fb:"군집은 선형 조사에서 찬 칸들이 이어진 구간, 프로브는 조사 1회를 가리킨다."}]},

  {id:"X1302", ch:"ch13", unit:"B", diff:2, src:"기사구", mono:true,
   stem:'테이블 크기 <b>M = 13</b>인 해시 테이블에서 <b>제산법</b> <span class="mono">h(k) = k mod M</span>으로 키 <b>55</b>의 홈 주소를 구하면?',
   okfb:'55 = 13×4 + 3 — 홈 주소는 3이다.',
   choices:[
     {text:"3",correct:true},
     {text:"4",correct:false,mc:"quotient",fb:"4는 몫이다 — 제산법이 쓰는 것은 나머지다."},
     {text:"55",correct:false,mc:"no-hash",fb:"키를 그대로 쓰면 테이블(0~12)을 벗어난다 — 나머지로 접어 넣는다."},
     {text:"5",correct:false,mc:"digit-slip",fb:"끝자리 5는 mod 10의 결과 — M이 13이면 13으로 나눈 나머지다."}]},

  {id:"X1303", ch:"ch13", unit:"C", diff:2, src:"대학", mono:true,
   stem:'M = 7, <span class="mono">h(k) = k mod 7</span>인 빈 테이블에 <b>선형 조사</b>로 키 <b>15, 8, 22</b>를 차례로 삽입한다. <b>22가 저장되는 인덱스</b>는?',
   okfb:'15→[1]. 8도 홈 주소 1이라 충돌 — [2]에 저장. 22도 홈 주소 1 — [1]·[2]가 차 있어 [3]에 저장된다.',
   choices:[
     {text:"3",correct:true},
     {text:"1",correct:false,mc:"no-probe",fb:"홈 주소 [1]에는 이미 15가 저장되어 있다 — 다음 칸으로 조사를 이어가야 한다."},
     {text:"2",correct:false,mc:"one-probe",fb:"[2]는 8이 차지했다 — 한 칸 더 이동해야 한다."},
     {text:"4",correct:false,mc:"over-probe",fb:"[3]은 비어 있다 — 빈 칸을 만나는 즉시 저장한다."}]},

  {id:"X1304", ch:"ch13", unit:"A", diff:1, src:"기사",
   stem:'슬롯 24개짜리 해시 테이블에 레코드 18개가 저장돼 있다. <b>적재율(적재 밀도) α</b>는?',
   okfb:'α = 저장된 레코드 수 ÷ 전체 슬롯 수 = 18/24 = 0.75.',
   choices:[
     {text:"0.75",correct:true},
     {text:"1.33",correct:false,mc:"reciprocal",fb:"24/18로 뒤집어 나눈 값 — α는 찬 비율이라 1을 넘을 수 없다(슬롯 기준)."},
     {text:"0.25",correct:false,mc:"empty-ratio",fb:"0.25는 빈 슬롯의 비율 — α는 채워진 쪽을 잰다."},
     {text:"18",correct:false,mc:"count-confuse",fb:"레코드 개수 그 자체가 아니라, 전체 대비 비율이다."}]},

  {id:"X1305", ch:"ch13", unit:"D", diff:3, src:"기사구", mono:true,
   stem:'<b>체이닝</b> 해시 테이블에 새 노드 p를 버킷 h의 체인 <b>맨 앞</b>에 삽입하는 코드다. 빈칸에 들어갈 것은?',
   code:["p = malloc(sizeof(Node));","p->key = k;","p->link = tab[h];","________ ;"],
   okfb:'새 노드가 기존 체인 전체를 뒤에 매단 뒤, 버킷의 머리를 새 노드로 바꾼다 — tab[h] = p.',
   choices:[
     {text:"tab[h] = p",correct:true},
     {text:"tab[h]->link = p",correct:false,mc:"tail-attempt",fb:"머리의 뒤에 붙이면 맨 앞 삽입이 아니고, 빈 버킷(NULL)에서는 역참조 오류가 난다."},
     {text:"p = tab[h]",correct:false,mc:"assign-reverse",fb:"대입 방향이 반대다 — 새 노드를 잃고 테이블은 그대로다."},
     {text:"p->link = NULL",correct:false,mc:"chain-cut",fb:"기존 체인을 끊어 버린다 — 이미 p->link가 체인을 물고 있다."}]},

  /* ===== v2.1 — 기말 범위 확정(중간 이후 = ch07~ch13)에 따른 2차 확장: 장별 +3문 ===== */

  {id:"X706", ch:"ch07", unit:"A", diff:1, src:"기사",
   stem:'<b>우선순위 큐</b>의 삭제 연산이 꺼내는 원소는?',
   okfb:'우선순위 큐는 들어온 순서가 아니라 <b>우선순위가 가장 높은</b> 원소를 꺼낸다 — 그래서 히프로 구현한다.',
   choices:[
     {text:"우선순위가 가장 높은 원소",correct:true},
     {text:"가장 먼저 들어온 원소",correct:false,mc:"fifo-confuse",fb:"먼저 온 순서(FIFO)는 보통 큐의 규칙이다."},
     {text:"가장 나중에 들어온 원소",correct:false,mc:"lifo-confuse",fb:"나중 것부터(LIFO)는 스택의 규칙이다."},
     {text:"임의의 원소 하나",correct:false,mc:"random-myth",fb:"임의라면 자료구조가 필요 없다 — 꺼내는 기준이 곧 우선순위다."}]},

  {id:"X707", ch:"ch07", unit:"B", diff:2, src:"대학", mono:true,
   stem:'배열 <span class="mono">[9, 7, 8, 3, 2, 5]</span>(인덱스 1부터)로 저장된 max 히프에 키 <b>10</b>을 삽입한 직후의 배열은?',
   okfb:'10은 [7]에 들어가 부모 8(인덱스 3), 다시 부모 9(루트)를 이기며 두 번 올라간다 — [10, 7, 9, 3, 2, 5, 8].',
   choices:[
     {text:"10, 7, 9, 3, 2, 5, 8",correct:true},
     {text:"9, 7, 8, 3, 2, 5, 10",correct:false,mc:"no-up",fb:"끝에 붙인 채 끝나면 부모 8보다 큰 10이 아래에 있다 — 올라가기가 필요하다."},
     {text:"10, 9, 8, 3, 2, 5, 7",correct:false,mc:"resort",fb:"전체를 내림차순으로 다시 세우는 게 아니다 — 10이 지나간 경로만 바뀐다."},
     {text:"10, 7, 8, 3, 2, 5, 9",correct:false,mc:"swap-slip",fb:"10과 자리를 바꾸는 것은 경로 위의 8과 9다 — 8이 [7]로 내려간다."}]},

  {id:"X708", ch:"ch07", unit:"B", diff:3, src:"기사구", mono:true,
   stem:'max 히프의 <b>삽입</b> 코드다. 빈칸에 공통으로 들어갈 것은?',
   code:["i = ++n;","while (i != 1 && item > heap[ ____ ]) {","  heap[i] = heap[ ____ ];","  i = ____ ;","}","heap[i] = item;"],
   okfb:'올라가기의 상대는 언제나 부모 — 인덱스 i의 부모는 i/2다.',
   choices:[
     {text:"i / 2",correct:true},
     {text:"i * 2",correct:false,mc:"child-slip",fb:"i*2는 왼쪽 자식 — 삽입은 아래에서 위로, 부모와 비교한다."},
     {text:"i - 1",correct:false,mc:"linear-slip",fb:"한 칸 앞은 형제나 남 — 트리의 부모는 i/2에 있다."},
     {text:"n / 2",correct:false,mc:"fixed-slip",fb:"n/2는 마지막 내부 노드 — 올라가는 위치 i에 따라 부모도 바뀌어야 한다."}]},

  {id:"X806", ch:"ch08", unit:"A", diff:2, src:"기사",
   stem:'정점이 <b>5개</b>인 <b>방향</b> 그래프가 가질 수 있는 간선의 최대 수는? (자기 자신으로의 간선 제외)',
   okfb:'모든 순서쌍이 서로 다른 간선이다 — n(n−1) = 5×4 = 20.',
   choices:[
     {text:"20",correct:true},
     {text:"10",correct:false,mc:"undir-confuse",fb:"10 = n(n−1)/2는 무방향의 값 — 방향에서는 두 방향이 서로 다른 간선이다."},
     {text:"25",correct:false,mc:"self-loop",fb:"25 = n²은 자기 자신으로의 간선까지 센 것이다."},
     {text:"4",correct:false,mc:"tree-confuse",fb:"n−1은 신장 트리의 간선 수다."}]},

  {id:"X807", ch:"ch08", unit:"C", diff:1, src:"기사",
   stem:'<b>무방향</b> 그래프의 인접 행렬이 항상 갖는 성질은?',
   okfb:'간선 (i, j)가 [i][j]와 [j][i]를 함께 1로 만들므로, 행렬은 대각선을 기준으로 대칭이다.',
   choices:[
     {text:"주대각선을 기준으로 대칭이다",correct:true},
     {text:"모든 대각선 원소가 1이다",correct:false,mc:"diag-myth",fb:"대각선 [i][i]는 자기 간선 자리 — 보통 0이다."},
     {text:"각 행의 합이 모두 같다",correct:false,mc:"degree-myth",fb:"행의 합은 그 정점의 차수 — 정점마다 다를 수 있다."},
     {text:"0이 하나도 없다",correct:false,mc:"complete-confuse",fb:"0이 없는 것은 완전 그래프일 때뿐이다."}]},

  {id:"X808", ch:"ch08", unit:"D", diff:3, src:"기사구", mono:true,
   stem:'<b>인접 리스트</b>로 저장된 그래프에서 정점 v의 차수를 세는 코드다. 빈칸에 들어갈 것은?',
   code:["int degree(int v){","  int count = 0;","  GraphNode *p;","  for (p = graph[v]; p != NULL; p = ____ )","    count++;","  return count;","}"],
   okfb:'체인을 따라 다음 노드로 이동한다 — p = p->link.',
   choices:[
     {text:"p->link",correct:true},
     {text:"p->vertex",correct:false,mc:"field-confuse",fb:"vertex는 정점 번호(값) — 다음 노드를 가리키는 것은 link다."},
     {text:"graph[v]",correct:false,mc:"reset-loop",fb:"머리로 되돌리면 무한 반복이다."},
     {text:"graph[p->vertex]",correct:false,mc:"jump-slip",fb:"이웃 정점의 리스트로 건너뛰면 v의 차수가 아니라 남의 체인을 세게 된다."}]},

  {id:"X906", ch:"ch09", unit:"D", diff:1, src:"기사",
   stem:'연결되지 않은 그래프에서 <b>연결 요소</b>들을 모두 찾는 표준 방법은?',
   okfb:'아직 방문하지 않은 정점이 남아 있는 동안, 그 정점에서 DFS(또는 BFS)를 다시 시작한다 — 시작한 횟수가 곧 연결 요소의 수다.',
   choices:[
     {text:"미방문 정점마다 탐색을 다시 시작한다",correct:true},
     {text:"모든 정점 쌍의 경로 존재를 하나씩 검사한다",correct:false,mc:"pairwise-waste",fb:"n²쌍 검사는 낭비다 — 탐색 한 번이 요소 하나를 통째로 방문한다."},
     {text:"차수가 0인 정점의 수를 센다",correct:false,mc:"isolated-only",fb:"고립 정점만 세면 여러 정점짜리 요소를 놓친다."},
     {text:"간선 수가 n−1인지 확인한다",correct:false,mc:"tree-confuse",fb:"그것은 트리 판정의 일부 — 요소를 나열하지는 못한다."}]},

  {id:"X907", ch:"ch09", unit:"A", diff:2, src:"대학", mono:true,
   stem:'인접 정점: <span class="mono">0:(1,2) / 1:(0,3) / 2:(0,3) / 3:(1,2)</span>. 정점 0에서 <b>DFS</b>를 시작하면(번호 작은 쪽 먼저) 방문 순서는?',
   okfb:'0→1→3(1의 다음 인접), 3에서 2로 이어진다 — 0 1 3 2.',
   choices:[
     {text:"0 1 3 2",correct:true},
     {text:"0 1 2 3",correct:false,mc:"bfs-confuse",fb:"0의 이웃을 먼저 다 도는 것은 BFS다 — DFS는 1에서 3으로 파고든다."},
     {text:"0 2 3 1",correct:false,mc:"order-slip",fb:"번호 작은 쪽 먼저 규칙이면 0에서 1을 2보다 먼저 방문한다."},
     {text:"0 3 1 2",correct:false,mc:"adj-miss",fb:"3은 0의 인접 정점이 아니다 — 1이나 2를 거쳐야 닿는다."}]},

  {id:"X908", ch:"ch09", unit:"C", diff:3, src:"기사구", mono:true,
   stem:'너비 우선 탐색(BFS) 코드다. 빈칸에 들어갈 것은?',
   code:["visited[v] = TRUE;","enqueue(q, v);","while (!is_empty(q)) {","  v = dequeue(q);","  for (w = graph[v]; w; w = w->link)","    if (!visited[w->vertex]) {","      visited[w->vertex] = TRUE;","      ________ ;","    }","}"],
   okfb:'새로 발견한 정점을 큐의 뒤에 세운다 — enqueue(q, w->vertex).',
   choices:[
     {text:"enqueue(q, w->vertex)",correct:true},
     {text:"enqueue(q, v)",correct:false,mc:"self-requeue",fb:"방금 꺼낸 v를 다시 넣으면 무한 반복이다 — 넣을 것은 새 이웃이다."},
     {text:"dequeue(q)",correct:false,mc:"op-reverse",fb:"발견은 넣기(enqueue)다 — 꺼내기는 while의 첫 줄이 맡는다."},
     {text:"push(s, w->vertex)",correct:false,mc:"dfs-confuse",fb:"스택에 쌓으면 깊이 우선이 된다 — BFS는 큐다."}]},

  {id:"X1006", ch:"ch10", unit:"A", diff:1, src:"기사",
   stem:'<b>신장 트리</b>에 원래 그래프의 간선 하나를 <b>추가</b>하면 반드시 생기는 것은?',
   okfb:'트리에서는 어떤 두 정점 사이든 경로가 이미 하나 있다 — 간선을 더하면 그 경로와 합쳐져 사이클이 된다.',
   choices:[
     {text:"사이클",correct:true},
     {text:"고립 정점",correct:false,mc:"reverse-effect",fb:"간선을 더해서 고립이 생길 수는 없다 — 연결은 더 늘어난다."},
     {text:"새로운 연결 요소",correct:false,mc:"component-confuse",fb:"신장 트리는 이미 전부 연결돼 있다 — 요소가 늘 이유가 없다."},
     {text:"아무 일도 일어나지 않는다",correct:false,mc:"no-change-myth",fb:"두 끝 정점 사이에 이미 경로가 있으므로, 새 간선은 반드시 사이클을 닫는다."}]},

  {id:"X1007", ch:"ch10", unit:"B", diff:2, src:"대학", mono:true,
   stem:'간선 <span class="mono">(A,B)=1, (C,D)=2, (B,C)=3, (A,C)=4, (B,D)=5</span>인 그래프에 <b>Kruskal</b>을 적용할 때 <b>처음으로 거부되는</b> 간선은?',
   okfb:'1·2 채택, 3은 {A,B}와 {C,D}를 잇는 다리라 채택 — 4 (A,C)에서 A와 C가 이미 같은 트리이므로 처음 거부된다.',
   choices:[
     {text:"(A,C) = 4",correct:true},
     {text:"(B,C) = 3",correct:false,mc:"bridge-miss",fb:"3이 올 때 A·B와 C·D는 아직 서로 다른 트리다 — 잇는 간선은 채택된다."},
     {text:"(B,D) = 5",correct:false,mc:"late-slip",fb:"5도 거부되지만 처음이 아니다 — 4가 먼저 사이클 검사에 걸린다."},
     {text:"(C,D) = 2",correct:false,mc:"early-slip",fb:"2가 올 때 C와 D는 아직 어느 트리에도 함께 있지 않다 — 채택된다."}]},

  {id:"X1008", ch:"ch10", unit:"D", diff:3, src:"기사구", mono:true,
   stem:'Dijkstra의 <b>choose</b> 함수 — 다음에 확정할 정점을 고른다. 빈칸에 들어갈 것은?',
   code:["int choose(int distance[], int n, int found[]){","  int i, min = INT_MAX, minpos = -1;","  for (i = 0; i < n; i++)","    if (distance[i] < min && ________ ) {","      min = distance[i];  minpos = i;","    }","  return minpos;","}"],
   okfb:'아직 확정되지 않은 정점 중에서만 골라야 한다 — !found[i].',
   choices:[
     {text:"!found[i]",correct:true},
     {text:"found[i]",correct:false,mc:"negate-miss",fb:"이미 확정된 정점을 다시 고르면 알고리즘이 제자리를 돈다."},
     {text:"distance[i] > 0",correct:false,mc:"zero-slip",fb:"출발 정점의 거리 0도 유효한 값이다 — 확정 여부와는 무관하다."},
     {text:"i != 0",correct:false,mc:"start-only",fb:"출발 정점만 빼는 것으로는 부족하다 — 확정된 모든 정점을 빼야 한다."}]},

  {id:"X1106", ch:"ch11", unit:"B", diff:2, src:"기사",
   stem:'원소 <b>5개</b>를 선택 정렬로 정렬할 때 <b>총 비교 횟수</b>는? (입력의 순서와 무관)',
   okfb:'회전마다 4, 3, 2, 1번 — 합계 n(n−1)/2 = 10번. 선택 정렬의 비교 횟수는 입력과 무관하게 고정이다.',
   choices:[
     {text:"10",correct:true},
     {text:"5",correct:false,mc:"n-confuse",fb:"n번이 아니다 — 회전마다 남은 원소 전부와 비교한다."},
     {text:"25",correct:false,mc:"square",fb:"n²은 근사 자릿수일 뿐 — 정확한 값은 n(n−1)/2다."},
     {text:"4",correct:false,mc:"pass-confuse",fb:"4는 회전(pass)의 수 — 비교는 그 안에서 여러 번 일어난다."}]},

  {id:"X1107", ch:"ch11", unit:"A", diff:1, src:"기사",
   stem:'정렬할 레코드 전체가 <b>주기억장치에 올라온 채</b> 진행되는 정렬을 부르는 이름은?',
   okfb:'내부 정렬 — 전부 메모리 안에서 끝난다. 다 안 들어가 보조 기억장치를 오가면 외부 정렬이다.',
   choices:[
     {text:"내부 정렬",correct:true},
     {text:"외부 정렬",correct:false,mc:"reverse",fb:"외부 정렬은 데이터가 주기억장치에 다 들어가지 않을 때의 방식이다."},
     {text:"안정 정렬",correct:false,mc:"stable-confuse",fb:"안정성은 같은 키의 순서 보존에 대한 성질 — 저장 위치와 무관하다."},
     {text:"제자리 정렬",correct:false,mc:"inplace-confuse",fb:"제자리(in-place)는 추가 메모리를 거의 안 쓴다는 뜻 — 이 구분과는 다른 축이다."}]},

  {id:"X1108", ch:"ch11", unit:"C", diff:3, src:"기사구", mono:true,
   stem:'버블 정렬 코드다. 빈칸에 <b>공통으로</b> 들어갈 것은?',
   code:["for (i = n-1; i > 0; i--)","  for (j = 0; j < i; j++)","    if (list[j] > list[ ____ ])","      SWAP(list[j], list[ ____ ]);"],
   okfb:'버블 정렬은 이웃끼리 비교하고 교환한다 — j의 이웃은 j+1.',
   choices:[
     {text:"j + 1",correct:true},
     {text:"i",correct:false,mc:"far-compare",fb:"멀리 있는 i와 비교하면 이웃 교환이 아니다 — 선택 정렬과도 다른 엉뚱한 동작이 된다."},
     {text:"j - 1",correct:false,mc:"dir-slip",fb:"j는 0부터 시작한다 — j−1은 첫 회에 배열 밖이다."},
     {text:"n - 1",correct:false,mc:"end-fixed",fb:"항상 끝 원소와 비교하면 지나가는 자리의 이웃 관계가 무너진다."}]},

  {id:"X1206", ch:"ch12", unit:"B", diff:2, src:"대학", mono:true,
   stem:'배열 <span class="mono">[8, 3, 2, 9, 7, 1, 5, 4]</span>에 반복 합병 정렬의 <b>1회전</b>(길이 1끼리 합병)을 수행한 직후의 배열은?',
   okfb:'이웃한 둘씩 정렬해 합친다: (8,3)(2,9)(7,1)(5,4) → [3, 8, 2, 9, 1, 7, 4, 5].',
   choices:[
     {text:"3, 8, 2, 9, 1, 7, 4, 5",correct:true},
     {text:"1, 2, 3, 4, 5, 7, 8, 9",correct:false,mc:"onepass-myth",fb:"완성은 ⌈log₂8⌉ = 3회전 뒤다 — 1회전은 길이 2짜리 런을 만들 뿐이다."},
     {text:"3, 2, 8, 9, 1, 5, 7, 4",correct:false,mc:"pair-slip",fb:"짝은 (8,3)(2,9)(7,1)(5,4) — 각 짝 안에서만 순서를 맞춘다."},
     {text:"3, 8, 9, 2, 1, 7, 5, 4",correct:false,mc:"half-merge",fb:"(2,9)와 (5,4)도 각각 합병 대상이다 — 절반만 처리하고 멈추지 않는다."}]},

  {id:"X1207", ch:"ch12", unit:"C", diff:1, src:"기사",
   stem:'<b>히프 정렬</b>의 시간 복잡도로 옳은 것은?',
   okfb:'삭제(재조정 log n)를 n번 반복 — 최선·평균·최악 모두 O(n log n)이다. 입력에 따라 무너지지 않는 것이 히프 정렬의 강점.',
   choices:[
     {text:"최선·평균·최악 모두 O(n log n)",correct:true},
     {text:"평균 O(n log n), 최악 O(n²)",correct:false,mc:"quick-confuse",fb:"최악이 n²으로 무너지는 것은 퀵 정렬이다."},
     {text:"최선 O(n), 최악 O(n²)",correct:false,mc:"insert-confuse",fb:"입력에 따라 n에서 n²까지 출렁이는 것은 삽입 정렬이다."},
     {text:"항상 O(n²)",correct:false,mc:"simple-confuse",fb:"n²은 단순 정렬들의 자릿수 — 히프는 트리 높이 덕에 log n을 얻는다."}]},

  {id:"X1208", ch:"ch12", unit:"B", diff:3, src:"기사구", mono:true,
   stem:'두 정렬 구간을 합치는 <b>merge</b> 코드의 마무리다. 빈칸에 들어갈 것은?',
   code:["while (i <= mid && j <= right)","  list[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];","while (i <= mid)","  ________ ;","while (j <= right)","  list[k++] = a[j++];"],
   okfb:'한쪽이 끝나면 남은 쪽을 그대로 옮긴다 — 앞 구간의 잔여 복사는 list[k++] = a[i++].',
   choices:[
     {text:"list[k++] = a[i++]",correct:true},
     {text:"list[k++] = a[j++]",correct:false,mc:"side-swap",fb:"이 루프의 조건은 i <= mid — 앞 구간의 잔여를 옮기는 자리다."},
     {text:"i++",correct:false,mc:"skip-copy",fb:"인덱스만 밀면 남은 원소들이 결과에서 사라진다."},
     {text:"list[k] = a[i]",correct:false,mc:"no-advance",fb:"두 인덱스를 전진시키지 않으면 같은 자리에 무한히 복사한다."}]},

  {id:"X1306", ch:"ch13", unit:"B", diff:1, src:"기사",
   stem:'제산법 <span class="mono">h(k) = k mod M</span>에서 테이블 크기 M을 <b>소수</b>로 고르는 이유는?',
   okfb:'M이 키들의 패턴과 공약수를 가지면 특정 버킷에만 쏠린다 — 소수는 1 이외의 공약수를 갖지 않아 고르게 흩는다.',
   choices:[
     {text:"키의 패턴과 공약수를 갖지 않아 주소가 고르게 흩어지므로",correct:true},
     {text:"소수는 나눗셈 연산이 더 빠르므로",correct:false,mc:"speed-myth",fb:"나눗셈 속도는 M의 소수 여부와 무관하다 — 문제는 분포다."},
     {text:"소수 크기의 테이블은 오버플로가 발생하지 않으므로",correct:false,mc:"overflow-myth",fb:"오버플로는 적재율의 문제 — 테이블 크기의 소수성과는 무관하다."},
     {text:"충돌 자체가 일어나지 않게 되므로",correct:false,mc:"no-collision-myth",fb:"키가 버킷보다 많으면 충돌은 피할 수 없다 — 소수는 쏠림을 줄일 뿐이다."}]},

  {id:"X1307", ch:"ch13", unit:"C", diff:2, src:"대학", mono:true,
   stem:'M = 7, <span class="mono">h(k) = k mod 7</span>인 선형 조사 테이블에 현재 <span class="mono">[3]=10, [4]=17</span>만 저장되어 있다(둘 다 홈 주소 3). 키 <b>24</b>를 삽입하면 저장되는 인덱스는?',
   okfb:'24의 홈 주소도 3 — [3]·[4]가 차 있으므로 한 칸씩 이동해 [5]에 저장된다.',
   choices:[
     {text:"5",correct:true},
     {text:"3",correct:false,mc:"no-probe",fb:"[3]에는 이미 10이 저장되어 있다 — 다음 칸으로 조사를 이어간다."},
     {text:"4",correct:false,mc:"one-probe",fb:"[4]는 17이 차지했다 — 한 칸 더 이동해야 한다."},
     {text:"0",correct:false,mc:"wrap-slip",fb:"처음으로 되돌아오는 것은 [6]까지 다 찼을 때다 — [5]가 비어 있다."}]},

  {id:"X1308", ch:"ch13", unit:"D", diff:3, src:"기사구", mono:true,
   stem:'<b>체이닝</b> 해시 테이블의 <b>탐색</b> 코드다. 빈칸에 들어갈 것은?',
   code:["Node* search(int k){","  int h = k % M;","  Node *p = tab[h];","  while (p != NULL) {","    if (p->key == k) return p;","    ________ ;","  }","  return NULL;","}"],
   okfb:'같은 버킷의 체인을 따라 다음 노드로 이동한다 — p = p->link.',
   choices:[
     {text:"p = p->link",correct:true},
     {text:"p = tab[h+1]",correct:false,mc:"probe-confuse",fb:"옆 버킷으로 옮겨 가는 것은 선형 조사의 방식 — 체이닝은 한 버킷의 체인만 따라간다."},
     {text:"h = (h + 1) % M",correct:false,mc:"rehash-slip",fb:"주소를 다시 계산할 이유가 없다 — 동거자들은 전부 이 체인에 있다."},
     {text:"p->link = p",correct:false,mc:"assign-reverse",fb:"대입 방향이 반대다 — 체인을 자기 자신으로 덮어써 망가뜨린다."}]}

  ]};

