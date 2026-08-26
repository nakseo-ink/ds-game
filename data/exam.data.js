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
  meta: { ver:"1.0", range:["ch01","ch02","ch03","ch04","ch05","ch06"] },
  items: [

  /* ================= 1장 배열과 구조 (X101~X108) ================= */
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
     {text:"배열 전체가 복사되어 원본은 바뀌지 않는다",correct:false,mc:"copy-myth",fb:"int 하나는 복사되지만 배열은 주소가 넘어간다 — 1장 유닛 B의 핵심 구분이다."},
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

  /* ================= 2장(A) 스택과 큐 (X201~X210) ================= */
  {id:"X201", ch:"ch02", unit:"A", diff:1, src:"기사",
   stem:'다음 중 <b>스택의 응용 분야가 아닌</b> 것은?',
   okfb:'운영체제의 작업 스케줄링은 도착한 순서대로 처리하는 큐의 일이다.',
   choices:[
     {text:"운영체제의 작업 스케줄링",correct:true},
     {text:"함수 호출의 복귀 주소 저장",correct:false,mc:"stack-app",fb:"함수 호출은 가장 나중에 부른 것부터 돌아온다 — 스택이 맞다."},
     {text:"수식의 후위 표기 변환",correct:false,mc:"stack-app",fb:"연산자를 잠시 쌓아 두는 곳이 스택이다 — 2장(B)에서 다뤘다."},
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

  {id:"X210", ch:"ch02", unit:"C", diff:3, src:"기사",
   stem:'크기 M인 원형 큐의 삽입 연산이다. 빈칸에 들어갈 식은?',
   code:["void enqueue(int item){","  rear = ____________ ;","  queue[rear] = item;","}"],
   okfb:'끝(M-1) 다음이 0으로 이어져야 원형이 된다 — (rear + 1) % M.',
   choices:[
     {text:"(rear + 1) % M",correct:true},
     {text:"rear + 1",correct:false,mc:"no-wrap",fb:"rear가 M-1일 때 배열 밖으로 나간다 — 처음으로 되돌리는 장치가 없다."},
     {text:"(rear + M) % M",correct:false,mc:"no-advance",fb:"이 식은 rear 그대로다 — 한 칸 나아가지 않는다."},
     {text:"rear % (M + 1)",correct:false,mc:"mod-slip",fb:"나머지 연산의 대상은 배열 크기 M이고, 먼저 1을 더해야 한다."}]},

  /* ================= 2장(B) 스택과 큐의 응용 (X301~X310) ================= */
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

  /* ================= 3장 리스트 (X401~X410) ================= */
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

  /* ================= 4장(A) 트리와 이진 트리 (X501~X511) ================= */
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

  /* ================= 4장(B) 트리 순회 (X601~X611) ================= */
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
     {text:"알 수 없다",correct:false,mc:"varies-myth",fb:"전위와 중위가 함께 주어지면 트리는 하나로 정해진다."}]}

  ]};

