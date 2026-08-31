"use strict";
/* 📕 낡은 책 — 자료구조 (서가 P3a·본문 P3b, v0.29). 설계: 30-콘텐츠\22-책시스템-설계.md §10
   P3a = 주차별 연습문제(쓰기의 층): 자가 채점 3요소 — 문제 코드 + 테스트 main·기대 출력 + 접힌 해답.
   기대 출력은 전부 gcc 컴파일·실행으로 검증(50-테스트\exverify.js).
   P3b = 각 절의 교과서 품질 본문 — 구성: 개관 → 정의·용어 → 핵심 원리 → 대표 코드 →
   성능 표(.bktbl) → ⚠ 자주 틀리는 것(오개념 노트). 원천: 교수 증류 노트 01~13 + 공개 자료 대조.
   조립 규약: [lv1] code 하나가 완성 프로그램(그대로 입력·실행) /
             [lv2+] setup(#include·전역) + code(TODO 빈칸) + main(테스트) — 해답은 sol. */
const BOOKDS = {
  meta: {
    id:"bookDS", title:"낡은 책 — 자료구조", sub:"요점 정리와 연습문제",
    flavor:'책의 뒤쪽, 손때가 가장 짙은 곳 — 절마다 연습문제가 있고, 여백에는 같은 필체의 풀이가 남아 있다. 이 책의 전 주인도 여기서 손을 움직였다.',
    howto:'각 연습의 사용법: 코드를 온라인 컴파일러(📘 §0)에 입력하고, 테스트 main을 붙여 실행한다. <b>기대 출력과 같으면 통과.</b> 막히면 해답을 펴라 — 자습서는 막힌 사람을 버려두지 않는다. 아래 「풀었다」 체크는 자기 기록용이다(성적·보상과 무관).'
  },
  parts: [

  { title:"전반부 — 기본 개념에서 순회까지 (1~7주차)", sections:[

    { id:"ds-w1", no:"1주차", title:"자료구조와 알고리즘",
      body:[
        '프로그램은 두 기둥 위에 선다 — 데이터를 담는 방법(<b>자료구조</b>)과 문제를 푸는 절차(<b>알고리즘</b>). 같은 문제라도 데이터를 어떻게 담았는가에 따라 절차의 빠르기는 백만 배까지 갈린다. 이 책은 그 「담는 방법」들의 목록이며, 각 장의 질문은 언제나 하나다 — <b>이 구조는 무엇이 빠르고, 무엇이 느린가.</b>',
        '<b>알고리즘(algorithm)</b>은 문제를 풀기 위한 단계적 절차로, 다섯 조건을 만족해야 한다. <b>입력</b>(외부에서 받는 자료 0개 이상), <b>출력</b>(결과 1개 이상), <b>명확성</b>(각 단계의 뜻이 모호하지 않을 것), <b>유한성</b>(반드시 유한한 단계 안에 끝날 것), <b>유효성</b>(각 단계를 실제로 수행할 수 있을 것). 이 중 가장 자주 어긋나는 것이 유한성이다 — 끝나지 않는 절차는 알고리즘이 아니다.',
        '성능은 초 단위가 아니라 <b>빅오 표기 O( )</b>로 잰다 — 입력 크기 n이 커질 때 연산 횟수가 <b>어떤 비율로 늘어나는가</b>만 남기고, 상수와 낮은 차수 항은 버린다. 3n²+5n+9번의 연산은 O(n²)이다. 컴퓨터가 빨라져도 증가율은 그대로이므로, n이 충분히 크면 등급이 좋은 알고리즘이 반드시 이긴다.',
        '<table class="bktbl"><tr><th>등급</th><th>이름</th><th>이 책의 대표 사례</th></tr><tr><td class="mono">O(1)</td><td>상수 시간</td><td>배열 인덱스 접근, 스택 push/pop, 해시(평균)</td></tr><tr><td class="mono">O(log n)</td><td>로그 시간</td><td>이진 탐색, 균형 잡힌 BST, 히프 삽입·삭제</td></tr><tr><td class="mono">O(n)</td><td>선형 시간</td><td>순차 탐색, 리스트 순회</td></tr><tr><td class="mono">O(n log n)</td><td>—</td><td>합병·히프 정렬, 퀵 정렬(평균)</td></tr><tr><td class="mono">O(n²)</td><td>제곱 시간</td><td>단순 정렬 3종, 이중 루프</td></tr></table>',
        '이 책 전체를 관통하는 첫 사례가 <b>탐색</b>이다. <b>순차 탐색</b>은 앞에서부터 하나씩 견주므로 O(n) — 백만 개면 평균 오십만 번이다. 자료가 <b>정렬되어 있다면</b> <b>이진 탐색(binary search)</b>이 가능하다: 가운데를 보고, 찾는 값이 더 크면 왼쪽 절반을 통째로 버리고, 작으면 오른쪽 절반을 버린다. 비교 한 번이 후보를 반으로 줄이므로 O(log n) — 백만 개도 스무 번이면 끝난다.',
        { label:'이진 탐색 — 정렬된 배열에서만 성립한다', code:["int binsearch(int A[], int n, int key){","  int lo = 0, hi = n - 1;","  while (lo <= hi){","    int mid = (lo + hi) / 2;         /* 가운데 */","    if (A[mid] == key) return mid;   /* 찾았다 */","    if (A[mid] < key) lo = mid + 1;  /* 왼쪽 절반 폐기 */","    else hi = mid - 1;               /* 오른쪽 절반 폐기 */","  }","  return -1;                         /* 없음 */","}"] },
        '<b>재귀(recursion)</b>는 자신을 다시 부르는 함수다. 문제를 「한 단계 작은 같은 문제」로 줄일 수 있을 때 쓰며, 부품 둘이 필수다 — 더 줄일 수 없는 <b>기저 사례(base case)</b>, 그리고 문제를 작게 만들며 자신을 부르는 <b>재귀 단계</b>. n! = n × (n−1)! 이고 0! = 1 — 이 두 줄이 곧 코드가 된다. 재귀는 6~7주차의 트리에서 본업을 만난다: 트리 자체가 재귀적으로 정의되는 구조이기 때문이다. 함수 호출이 낯설면 📘 §11을 먼저 보라.',
        '<b>⚠ 자주 틀리는 것</b> — ① O(n²)이 O(n log n)보다 항상 느린 것은 아니다: 빅오는 n이 커질 때의 증가율이며, 작은 n에서는 상수가 승부를 가른다. ② 이진 탐색은 <b>정렬된 배열</b>에서만 성립한다 — 정렬 안 된 자료에 쓰면 답이 있어도 놓친다. ③ 재귀에서 기저 사례를 빼먹으면 호출이 영원히 쌓여 무너진다 — 재귀 함수는 기저 사례부터 확인하는 습관을 들여라.'
      ],
      ex:[
        { id:"ex1-1", lv:1, title:"재귀 팩토리얼 — 따라 치기",
          intro:"완성된 코드다. 그대로 입력해 실행하라 — 기저 사례와 재귀 단계, 두 부품이 눈에 들어오는 것이 목표다.",
          code:["#include <stdio.h>","long fact(int n){","  if (n <= 0) return 1;      /* 기저 사례 */","  return n * fact(n - 1);    /* 재귀 단계 */","}","int main(void){","  printf(\"5! = %ld\\n\", fact(5));","  printf(\"0! = %ld\\n\", fact(0));","  return 0;","}"],
          expect:["5! = 120","0! = 1"] },
        { id:"ex1-2", lv:2, title:"이진 탐색 — 빈칸 완성",
          intro:"절반을 버리는 두 줄을 채워라. lo와 hi가 좁혀 들어가다 엇갈리면 — 없는 것이다.",
          setup:["#include <stdio.h>"],
          code:["int binsearch(int A[], int n, int key){","  int lo = 0, hi = n - 1;","  while (lo <= hi){","    int mid = (lo + hi) / 2;","    if (A[mid] == key) return mid;","    /* TODO: A[mid] < key면 lo를 mid+1로 (왼쪽 절반 폐기, 한 줄) */","    /* TODO: 아니면 hi를 mid-1로 (오른쪽 절반 폐기, 한 줄) */","  }","  return -1;","}"],
          main:["int main(void){","  int A[8] = {3, 9, 14, 20, 27, 33, 41, 58};","  printf(\"%d %d %d\\n\", binsearch(A,8,27), binsearch(A,8,3), binsearch(A,8,50));","  return 0;","}"],
          expect:["4 0 -1"],
          sol:["int binsearch(int A[], int n, int key){","  int lo = 0, hi = n - 1;","  while (lo <= hi){","    int mid = (lo + hi) / 2;","    if (A[mid] == key) return mid;","    if (A[mid] < key) lo = mid + 1;","    else hi = mid - 1;","  }","  return -1;","}"] }
      ]},

    { id:"ds-w2", no:"2주차", title:"배열과 구조",
      body:[
        '<b>배열(array)</b>은 같은 형의 원소를 메모리에 <b>연속으로</b> 늘어놓은 구조다. 연속이기에 위치를 「셈」할 수 있다 — <b>주소(A[i]) = 시작 주소 + i × 원소 크기</b>. 곱셈 한 번과 덧셈 한 번, 그래서 몇 번째 원소든 <b>접근은 O(1)</b>이다. 인덱스가 0부터 시작하는 이유도 이 식에 있다: 첫 원소는 시작 주소에서 0칸 떨어져 있다.',
        '접근이 공짜인 대신 <b>모양 바꾸기가 비싸다</b>. 중간에 원소 하나를 끼우려면 뒤의 원소를 전부 한 칸씩 밀어야 하고(평균 n/2회 이동), 지우면 전부 당겨야 한다 — 그래서 <b>중간 삽입·삭제는 O(n)</b>이다. 「접근은 빠르고 변형은 느리다」 — 이 성적표를 5주차의 연결 리스트가 정확히 뒤집는다.',
        '서로 다른 형을 한 덩어리로 묶을 때는 <b>구조체(struct)</b>를 쓴다. 배열이 「같은 형의 나열」이라면 구조체는 「다른 형의 묶음」이고, 둘을 조합한 <b>구조체의 배열</b>이 성적표·좌표 목록 같은 실전 데이터의 기본형이 된다. 문법이 낯설면 📘 §21(struct)·§22(typedef)를 보라.',
        { label:'구조체의 배열 — 실전 데이터의 기본형', code:["typedef struct {","  int id;       /* 학번 */","  int score;    /* 점수 */","} Student;","Student cls[3] = { {101, 90}, {102, 75}, {103, 88} };","/* cls[1].score == 75 — 배열 인덱스 뒤에 필드 접근 */"] },
        '배열의 응용 둘. <b>다항식</b>은 지수를 인덱스로 쓰면 계수 배열 한 줄에 담긴다 — 단, 3x<sup>1000</sup>처럼 성긴 다항식은 1001칸 중 두 칸만 쓰는 낭비가 난다. <b>희소 행렬(sparse matrix)</b>도 같은 문제다: 0이 대부분인 행렬은 0이 아닌 항만 골라 &lt;행, 열, 값&gt; 3원소의 목록으로 적는 편이 이득이다. 「빽빽하면 통째로, 성기면 목록으로」 — 이 판단 기준은 10주차의 그래프 표현(행렬 vs 리스트)에서 다시 나온다.',
        '<table class="bktbl"><tr><th>연산</th><th>비용</th><th>이유</th></tr><tr><td>인덱스 접근 A[i]</td><td class="mono">O(1)</td><td>주소를 계산한다</td></tr><tr><td>끝에 추가</td><td class="mono">O(1)</td><td>밀 것이 없다</td></tr><tr><td>중간 삽입·삭제</td><td class="mono">O(n)</td><td>뒤를 전부 민다/당긴다</td></tr><tr><td>탐색</td><td class="mono">O(n)</td><td>정렬돼 있으면 이진 탐색 O(log n)</td></tr></table>',
        '<b>⚠ 자주 틀리는 것</b> — ① int A[5]의 유효 인덱스는 0~4다: A[5]는 남의 메모리이고, C는 경고 없이 통과시킨다. ② 주소 계산에 곱해지는 것은 「원소 크기」다 — int 배열이면 4바이트씩 뛴다. ③ 중간 삽입이 O(n)인 이유는 「찾기」가 아니라 <b>「밀기」</b>다 — 자리를 알고 있어도 뒤를 전부 밀어야 한다.'
      ],
      ex:[
        { id:"ex2-1", lv:1, title:"배열 순회와 합 — 따라 치기",
          intro:"완성된 코드다. 그대로 입력해 실행하고, 기대 출력이 나오는지 확인하라. for 순회 관용구(📘 §14)가 손에 붙는 것이 목표다.",
          code:["#include <stdio.h>","int main(void){","  int A[5] = {10, 20, 30, 40, 50};","  int i, sum = 0;","  for (i = 0; i < 5; i++)","    sum = sum + A[i];","  printf(\"sum = %d\\n\", sum);","  printf(\"A[2] = %d\\n\", A[2]);","  return 0;","}"],
          expect:["sum = 150","A[2] = 30"] },
        { id:"ex2-2", lv:2, title:"최댓값 찾기 — 빈칸 완성",
          intro:"TODO 한 줄을 채워라 — 지금까지의 최댓값보다 큰 원소를 만나면 교체한다.",
          setup:["#include <stdio.h>"],
          code:["int findMax(int A[], int n){","  int i, max = A[0];","  for (i = 1; i < n; i++){","    /* TODO: A[i]가 max보다 크면 max를 A[i]로 바꾼다 (한 줄) */","  }","  return max;","}"],
          main:["int main(void){","  int A[6] = {8, 3, 42, 7, 42, 1};","  printf(\"max = %d\\n\", findMax(A, 6));","  return 0;","}"],
          expect:["max = 42"],
          sol:["int findMax(int A[], int n){","  int i, max = A[0];","  for (i = 1; i < n; i++){","    if (A[i] > max) max = A[i];","  }","  return max;","}"] }
      ]},

    { id:"ds-w3", no:"3주차", title:"스택과 큐",
      body:[
        '<b>스택(stack)</b>은 한쪽 끝(<b>top</b>)에서만 넣고(push) 빼는(pop) 구조다 — 마지막에 넣은 것이 먼저 나온다(<b>LIFO</b>, Last-In First-Out). <b>큐(queue)</b>는 뒤(<b>rear</b>)로 넣고(enqueue) 앞(<b>front</b>)에서 빼는(dequeue) 구조다 — 먼저 넣은 것이 먼저 나온다(<b>FIFO</b>). 접시 더미와 매표소 줄. 규칙 하나씩의 차이가 쓰임을 완전히 가른다: 스택은 「되돌아가기」(함수 호출·실행 취소·백트래킹), 큐는 「순서 보장」(대기열·버퍼·BFS)이다.',
        '배열 구현에서 top은 「마지막 원소의 인덱스」이며 빈 스택은 top = −1이다. push는 <span class="mono">stack[++top] = item</span> — top을 먼저 올리고 그 자리에 쓴다. pop은 <span class="mono">return stack[top--]</span> — 값을 주고 top을 내린다. 넷 다 O(1)이다. top이 M−1일 때의 push(포화)와 −1일 때의 pop(공백)은 오류 검사 대상이다.',
        '큐를 배열에 그대로 담으면 문제가 생긴다 — 빼낼수록 앞이 비는데 rear는 끝을 향해 전진만 하므로, 앞이 텅 비고도 「가득」이 된다. 해법이 <b>원형 큐(circular queue)</b>다: 인덱스 전진을 <span class="mono">(i + 1) % M</span>으로 바꾸면 끝 다음이 처음으로 이어져 배열이 고리가 된다. 나머지 연산 한 번이 배열의 끝과 처음을 잇는다.',
        { label:'원형 큐 — 전진은 언제나 (i+1) % M', code:["#define M 8","int queue[M];","int front = 0, rear = 0;    /* front == rear 이면 공백 */","void enqueue(int item){","  rear = (rear + 1) % M;    /* 한 칸 전진 — 끝이면 처음으로 */","  queue[rear] = item;","}","int dequeue(void){","  front = (front + 1) % M;","  return queue[front];","}"] },
        '원형 큐의 공백·포화 판정에는 관례가 있다. <b>공백: front == rear</b>. 포화를 「모든 칸이 참」으로 정하면 공백과 구별할 수 없으므로, <b>한 칸을 항상 비워 두고</b> <span class="mono">(rear + 1) % M == front</span>를 포화로 삼는다 — M칸 배열에 실제로는 M−1개까지만 담는 이유다.',
        '<table class="bktbl"><tr><th></th><th>규칙</th><th>연산(모두 O(1))</th><th>대표 쓰임</th></tr><tr><td><b>스택</b></td><td>LIFO</td><td>push · pop</td><td>함수 호출, 실행 취소, 괄호 검사, 후위 계산(4주차)</td></tr><tr><td><b>큐</b></td><td>FIFO</td><td>enqueue · dequeue</td><td>대기열, 버퍼, 레벨 순회(7주차), BFS(11주차)</td></tr></table>',
        '<b>⚠ 자주 틀리는 것</b> — ① pop은 값을 지우지 않는다 — top을 내릴 뿐이며, 그 자리는 다음 push가 덮어쓴다. ② 원형 큐 M칸의 수용량은 M−1개다(한 칸 희생 관례). ③ push의 ++top과 pop의 top--, 「올리고 쓰기·주고 내리기」의 순서가 바뀌면 한 칸 어긋난다.'
      ],
      ex:[
        { id:"ex3-1", lv:2, title:"스택 push / pop — 빈칸 완성",
          intro:"push는 top을 올린 뒤 저장하고, pop은 꺼낸 뒤 top을 내린다. TODO 두 곳을 채워라.",
          setup:["#include <stdio.h>","#define MAX 100","int stack[MAX];","int top = -1;"],
          code:["void push(int item){","  /* TODO: top을 1 올리고, 그 자리에 item을 저장 (한 줄) */","}","int pop(void){","  /* TODO: 현재 top 자리의 값을 반환하며 top을 1 내림 (한 줄) */","}"],
          main:["int main(void){","  push(10); push(20); push(30);","  printf(\"%d \", pop());","  printf(\"%d \", pop());","  push(99);","  printf(\"%d \", pop());","  printf(\"%d\\n\", pop());","  return 0;","}"],
          expect:["30 20 99 10"],
          sol:["void push(int item){","  stack[++top] = item;","}","int pop(void){","  return stack[top--];","}"] },
        { id:"ex3-2", lv:2, title:"원형 큐 enqueue — 빈칸 완성",
          intro:"원형 큐의 전진은 「한 칸 앞으로, 끝이면 처음으로」 — 나머지 연산 한 번으로 끝난다.",
          setup:["#include <stdio.h>","#define M 5","int queue[M];","int front = 0, rear = 0;"],
          code:["void enqueue(int item){","  /* TODO: rear를 원형으로 한 칸 전진시킨다 (한 줄) */","  queue[rear] = item;","}","int dequeue(void){","  front = (front + 1) % M;","  return queue[front];","}"],
          main:["int main(void){","  int i;","  enqueue(11); enqueue(22); enqueue(33);","  for (i = 0; i < 2; i++) printf(\"%d \", dequeue());","  printf(\"\\n\");","  enqueue(44); enqueue(55); enqueue(66);","  for (i = 0; i < 4; i++) printf(\"%d \", dequeue());","  printf(\"\\n\");","  return 0;","}"],
          expect:["11 22","33 44 55 66"],
          sol:["void enqueue(int item){","  rear = (rear + 1) % M;","  queue[rear] = item;","}","int dequeue(void){","  front = (front + 1) % M;","  return queue[front];","}"] }
      ]},

    { id:"ds-w4", no:"4주차", title:"스택과 큐의 응용",
      body:[
        '스택의 진가는 응용에서 드러난다. 이번 주의 두 문제 — 괄호 검사와 후위 표기식 계산 — 는 겉보기엔 다르지만 뼈대가 같다: <b>「아직 처리하지 못한 것을 쌓아 두고, 짝이 나타나면 꺼내 처리한다」</b>. 가장 최근에 미룬 일이 가장 먼저 해결된다 — 정확히 LIFO다.',
        '<b>괄호 검사</b>: 왼쪽에서 오른쪽으로 읽으며, <b>여는 괄호는 쌓고</b>, <b>닫는 괄호를 만나면 하나 꺼내</b> 짝을 확인한다. 실패는 두 가지뿐이다 — 꺼낼 것이 없는데 닫는 괄호가 왔다(<span class="mono">a+b)</span>), 다 읽었는데 스택에 남았다(<span class="mono">((a+b)</span>). 괄호 { [ ( 가 섞여 나오면, 꺼낸 것이 같은 종류인지도 본다.',
        '<b>후위 표기(postfix)</b>는 연산자를 피연산자 뒤에 적는 방식이다 — 중위 <span class="mono">2+3*4</span>는 후위로 <span class="mono">2 3 4 * +</span>. 괄호도 우선순위 표도 필요 없다: 연산자가 나타나는 순서가 곧 계산 순서이기 때문이다. 계산 절차는 한 줄이다 — <b>숫자는 쌓고, 연산자를 만나면 둘을 꺼내 계산해 되쌓는다.</b> 끝까지 읽으면 스택에 답 하나가 남는다.',
        { label:'후위식 계산의 심장 — 꺼내는 순서에 주의', code:["/* 연산자를 만났을 때 */","b = pop();      /* 뒤 피연산자가 먼저 나온다 */","a = pop();","push(a - b);    /* a (연산) b — 순서가 뒤집히면 안 된다 */"] },
        '중위식을 후위식으로 바꾸는 것도 스택이 한다 — 피연산자는 바로 출력하고, 연산자는 스택에 쌓되 <b>우선순위가 낮거나 같은 연산자가 위에 있으면 먼저 꺼내 출력</b>한 뒤 쌓는다. 여는 괄호는 무조건 쌓고, 닫는 괄호가 오면 여는 괄호가 나올 때까지 꺼낸다. 이 절차는 7주차의 수식 트리에서 다른 얼굴로 다시 나타난다 — 수식 트리를 후위 순회한 결과가 곧 후위 표기다.',
        '<b>⚠ 자주 틀리는 것</b> — ① 뺄셈·나눗셈의 순서 함정: 먼저 pop한 값이 <b>뒤</b> 피연산자(b)다. <span class="mono">8 2 -</span>는 8−2=6이지 2−8이 아니다. ② 괄호 검사의 성공 조건은 「끝까지 읽고 <b>그리고</b> 스택이 빔」 — 둘 중 하나만 보면 틀린다. ③ 후위식에는 괄호가 아예 등장하지 않는다 — 괄호가 필요 없다는 것이 후위 표기의 존재 이유다.'
      ],
      ex:[
        { id:"ex4-1", lv:2, title:"괄호 검사 — 빈칸 완성",
          intro:"여는 괄호에서 할 일과, 문자열이 끝났을 때의 판정을 채워라.",
          setup:["#include <stdio.h>","#define MAX 100","char st[MAX];","int top = -1;"],
          code:["int check(const char *s){","  int i;","  top = -1;   /* 호출마다 스택 초기화 */","  for (i = 0; s[i] != '\\0'; i++){","    if (s[i] == '(')","      ; /* TODO: 여는 괄호를 스택에 쌓는다 (이 줄을 교체) */","    else if (s[i] == ')'){","      if (top < 0) return 0;   /* 짝 없는 닫는 괄호 */","      top--;","    }","  }","  /* TODO: 스택이 비어 있어야 성공 — 비었으면 1, 남았으면 0을 반환 */","}"],
          main:["int main(void){","  printf(\"%d\\n\", check(\"(a+(b*c))\"));","  printf(\"%d\\n\", check(\"((a+b)\"));","  printf(\"%d\\n\", check(\"a+b)\"));","  return 0;","}"],
          expect:["1","0","0"],
          sol:["int check(const char *s){","  int i;","  top = -1;","  for (i = 0; s[i] != '\\0'; i++){","    if (s[i] == '(')","      st[++top] = s[i];","    else if (s[i] == ')'){","      if (top < 0) return 0;","      top--;","    }","  }","  return (top == -1) ? 1 : 0;","}"] },
        { id:"ex4-2", lv:3, title:"후위식 계산 — 변형 구현",
          intro:"한 자리 숫자로 이루어진 후위식을 계산하는 eval을 완성하라. 숫자는 쌓고, 연산자(+, -, *)를 만나면 둘을 꺼내 계산해 되쌓는다 — 꺼내는 순서에 주의(뒤 피연산자가 먼저 나온다).",
          setup:["#include <stdio.h>","#define MAX 100","int st[MAX];","int top = -1;"],
          code:["int eval(const char *s){","  int i, a, b;","  for (i = 0; s[i] != '\\0'; i++){","    /* TODO: 숫자면 (s[i]-'0')을 push,","             연산자면 b=pop, a=pop 후 a(연산)b를 push */","  }","  return st[top];","}"],
          main:["int main(void){","  printf(\"%d\\n\", eval(\"25*34*+\"));","  printf(\"%d\\n\", eval(\"82-3*\"));","  return 0;","}"],
          expect:["22","18"],
          sol:["int eval(const char *s){","  int i, a, b;","  for (i = 0; s[i] != '\\0'; i++){","    if (s[i] >= '0' && s[i] <= '9')","      st[++top] = s[i] - '0';","    else {","      b = st[top--];","      a = st[top--];","      if (s[i] == '+') st[++top] = a + b;","      else if (s[i] == '-') st[++top] = a - b;","      else st[++top] = a * b;","    }","  }","  return st[top];","}"] }
      ]},

    { id:"ds-w5", no:"5주차", title:"리스트",
      body:[
        '<b>연결 리스트(linked list)</b>는 원소를 연속 공간이 아니라 <b>흩어진 노드</b>에 담고, 각 노드가 다음 노드의 주소(<b>링크</b>)를 쥐게 한 구조다. 노드는 자기와 같은 형의 포인터를 품는 <b>자기 참조 구조체</b>로 선언한다. 크기를 미리 정할 필요가 없고(malloc으로 그때그때), 중간 삽입·삭제가 링크 두 개 고치기로 끝난다 — 배열의 성적표를 정확히 뒤집은 구조다.',
        { label:'노드 — 자기 참조 구조체 (📘 §21~24)', code:["typedef struct node {","  int data;             /* 값 */","  struct node *link;    /* 다음 노드의 주소 — 마지막은 NULL */","} Node;","Node *head;             /* 첫 노드만 쥐면 전부에 닿는다 */"] },
        '리스트의 모든 일은 <b>걷기</b>에서 시작한다 — <span class="mono">p = head</span>에서 출발해 <span class="mono">p = p-&gt;link</span>로 전진하고, <span class="mono">p == NULL</span>이면 끝이다. i번째 원소도 앞에서부터 걸어가야 하므로 <b>접근이 O(n)</b> — 배열의 O(1) 접근과 맞바꾼 대가다.',
        '<b>삽입은 두 줄, 순서가 생명이다.</b> 노드 q 뒤에 새 노드 p를 끼울 때 — ① <span class="mono">p-&gt;link = q-&gt;link;</span> (새 노드가 <b>먼저</b> 뒤를 쥔다) ② <span class="mono">q-&gt;link = p;</span>. 순서를 뒤집으면 q-&gt;link를 덮어쓴 순간 <b>뒤쪽 전체의 주소가 사라진다</b> — 아무도 그 주소를 쥐고 있지 않으면 되찾을 길이 없다. 삭제는 앞 노드가 건너 쥐면 된다: <span class="mono">before-&gt;link = removed-&gt;link;</span> 그리고 free(removed).',
        '변형 두 가지. <b>원형 리스트</b>는 마지막 노드가 NULL 대신 처음을 가리켜 고리가 되고, <b>이중 연결 리스트</b>는 각 노드가 앞(prev)·뒤(next)를 모두 쥐어 양방향으로 걷는다 — 앞 노드를 알아야 하는 삭제가 편해지는 대신 고칠 링크가 두 배가 된다.',
        '<table class="bktbl"><tr><th></th><th>배열</th><th>연결 리스트</th></tr><tr><td>i번째 접근</td><td class="mono">O(1)</td><td class="mono">O(n)</td></tr><tr><td>중간 삽입·삭제</td><td class="mono">O(n) — 밀기</td><td class="mono">O(1) — 그 자리 포인터를 쥐고 있을 때</td></tr><tr><td>크기</td><td>고정(선언 시)</td><td>자유(malloc)</td></tr><tr><td>이진 탐색</td><td>가능(정렬 시)</td><td>불가 — 가운데로 점프할 수 없다</td></tr></table>',
        '<b>⚠ 자주 틀리는 것</b> — ① 삽입 두 줄의 순서: 새 노드가 먼저 뒤를 쥔다 — 이번 학기 최다 실수다. ② head를 잃으면 리스트 전체를 잃는다 — head가 바뀌는 연산(맨 앞 삽입·삭제)은 별도로 다뤄라. ③ 리스트의 중간 삽입 O(1)은 「그 자리 포인터를 이미 쥐고 있을 때」다 — 자리를 찾는 데는 여전히 O(n)이 든다.'
      ],
      ex:[
        { id:"ex5-1", lv:1, title:"노드 세 개 잇기 — 따라 치기",
          intro:"malloc으로 노드를 짓고 링크로 잇는 최소 예제다. 그대로 입력해 실행하라 — p = p->link로 걷는 감각이 목표다.",
          code:["#include <stdio.h>","#include <stdlib.h>","typedef struct node {","  int data;","  struct node *link;","} Node;","int main(void){","  Node *a = malloc(sizeof(Node));","  Node *b = malloc(sizeof(Node));","  Node *c = malloc(sizeof(Node));","  a->data = 10; a->link = b;","  b->data = 20; b->link = c;","  c->data = 30; c->link = NULL;","  Node *p = a;","  while (p != NULL){","    printf(\"%d \", p->data);","    p = p->link;","  }","  printf(\"\\n\");","  free(a); free(b); free(c);","  return 0;","}"],
          expect:["10 20 30"] },
        { id:"ex5-2", lv:2, title:"리스트 길이 세기 — 빈칸 완성",
          intro:"NULL에 닿을 때까지 걸으며 센다. TODO 두 곳 — 종료 조건과 전진.",
          setup:["#include <stdio.h>","#include <stdlib.h>","typedef struct node { int data; struct node *link; } Node;"],
          code:["int length(Node *head){","  int cnt = 0;","  Node *p = head;","  while (0 /* TODO: 끝(NULL)이 아닐 동안 */){","    cnt++;","    /* TODO: 다음 노드로 전진 (한 줄) */","  }","  return cnt;","}"],
          main:["int main(void){","  Node n3 = {30, NULL};","  Node n2 = {20, &n3};","  Node n1 = {10, &n2};","  printf(\"len = %d\\n\", length(&n1));","  printf(\"len = %d\\n\", length(NULL));","  return 0;","}"],
          expect:["len = 3","len = 0"],
          sol:["int length(Node *head){","  int cnt = 0;","  Node *p = head;","  while (p != NULL){","    cnt++;","    p = p->link;","  }","  return cnt;","}"] }
      ]},

    { id:"ds-w6", no:"6주차", title:"트리와 이진 트리",
      body:[
        '<b>트리(tree)</b>는 한 뿌리(<b>루트</b>)에서 가지가 갈라져 내려가는 계층 구조다 — 폴더, 조직도, 토너먼트 대진표. 용어가 곧 문법이다: 위가 <b>부모</b>, 아래가 <b>자식</b>, 같은 부모의 자식끼리는 <b>형제</b>, 자식이 없는 노드는 <b>리프(leaf, 단말)</b>. 노드의 자식 수가 <b>차수(degree)</b>, 루트를 1로 하여 한 층 내려갈 때마다 1씩 커지는 것이 <b>레벨</b>, 트리의 최대 레벨이 <b>높이</b>다.',
        '<b>이진 트리(binary tree)</b>는 모든 노드의 자식이 <b>최대 둘</b>이고, 왼쪽과 오른쪽을 <b>구별</b>하는 트리다. 성질 둘이 계산 문제의 뿌리다 — 레벨 i에 놓일 수 있는 노드는 최대 <b>2<sup>i−1</sup></b>개, 높이 k인 이진 트리 전체의 노드는 최대 <b>2<sup>k</sup> − 1</b>개. 층마다 두 배가 되는 등비수열의 합이다.',
        '<b>포화 이진 트리(full binary tree)</b>는 높이 k에서 2<sup>k</sup> − 1개를 다 채운 — 빈자리가 하나도 없는 — 트리다. <b>완전 이진 트리(complete binary tree)</b>는 마지막 레벨을 빼고는 꽉 차 있고, 마지막 레벨은 <b>왼쪽부터 빈틈없이</b> 채워진 트리다. 포화면 완전이지만, 역은 성립하지 않는다.',
        '완전 이진 트리는 <b>배열</b>에 담긴다 — 루트를 인덱스 1에 놓고 레벨 순서로 채우면, 링크 없이 산수만으로 오르내린다: <b>부모 = i/2, 왼쪽 자식 = 2i, 오른쪽 자식 = 2i+1</b>. 이 산수가 9주차 히프의 엔진이다. 반면 한쪽으로 기운(경사) 트리를 배열에 담으면 빈칸이 지수적으로 낭비된다 — 일반적인 트리는 링크 표현을 쓴다.',
        { label:'링크 표현 — 노드 하나가 왼팔·오른팔을 쥔다', code:["typedef struct tnode {","  int data;","  struct tnode *left;    /* 왼쪽 서브트리 */","  struct tnode *right;   /* 오른쪽 서브트리 */","} TNode;"] },
        '<table class="bktbl"><tr><th>표현</th><th>장점</th><th>약점</th></tr><tr><td><b>배열</b></td><td>부모·자식이 산수(i/2, 2i, 2i+1) — 링크 불필요</td><td>완전 이진 트리가 아니면 빈칸 낭비</td></tr><tr><td><b>링크</b></td><td>어떤 모양이든 노드 수만큼만</td><td>포인터 2개 추가, 부모 찾기 불편</td></tr></table>',
        '<b>⚠ 자주 틀리는 것</b> — ① 포화와 완전은 다르다 — 완전은 「왼쪽부터 채워지는 중간 단계」까지 포함한다. 참고로 해외 원서의 full binary tree는 「자식이 0 또는 2개」라는 다른 뜻으로도 쓰인다 — 이 책과 시험은 국내 관례(포화 = 다 참)를 따른다. ② 이진 트리의 왼쪽·오른쪽은 구별된다: 자식 하나가 왼쪽에 붙은 트리와 오른쪽에 붙은 트리는 서로 다른 트리다. ③ 배열 표현의 산수는 루트를 <b>1번</b>에 두었을 때다 — 0번에 두면 자식이 2i+1, 2i+2로 바뀐다.'
      ],
      ex:[
        { id:"ex6-1", lv:2, title:"노드 수 세기 — 빈칸 완성",
          intro:"구조 재귀의 원형: 빈 트리는 0, 아니면 「자신 1 + 왼쪽 개수 + 오른쪽 개수」.",
          setup:["#include <stdio.h>","#include <stdlib.h>","typedef struct tnode { int data; struct tnode *left, *right; } TNode;","TNode* newNode(int d, TNode *l, TNode *r){","  TNode *p = malloc(sizeof(TNode));","  p->data = d; p->left = l; p->right = r;","  return p;","}"],
          code:["int count(TNode *p){","  if (p == NULL) return 0;","  return 0; /* TODO: 자신 + 왼쪽 서브트리 + 오른쪽 서브트리 */","}"],
          main:["int main(void){","  TNode *t = newNode(1,","    newNode(2, newNode(4,NULL,NULL), newNode(5,NULL,NULL)),","    newNode(3, NULL, newNode(6,NULL,NULL)));","  printf(\"count = %d\\n\", count(t));","  return 0;","}"],
          expect:["count = 6"],
          sol:["int count(TNode *p){","  if (p == NULL) return 0;","  return 1 + count(p->left) + count(p->right);","}"] },
        { id:"ex6-2", lv:3, title:"트리의 높이 — 변형 구현",
          intro:"count를 참고해 height를 직접 작성하라. 빈 트리는 0, 아니면 「1 + 두 서브트리 높이 중 큰 쪽」.",
          setup:["#include <stdio.h>","#include <stdlib.h>","typedef struct tnode { int data; struct tnode *left, *right; } TNode;","TNode* newNode(int d, TNode *l, TNode *r){","  TNode *p = malloc(sizeof(TNode));","  p->data = d; p->left = l; p->right = r;","  return p;","}"],
          code:["int height(TNode *p){","  /* TODO: 전체를 작성하라 (재귀, 4~6줄) */","  return 0;","}"],
          main:["int main(void){","  TNode *t = newNode(1,","    newNode(2, newNode(4, newNode(7,NULL,NULL), NULL), NULL),","    newNode(3, NULL, NULL));","  printf(\"height = %d\\n\", height(t));","  printf(\"height = %d\\n\", height(NULL));","  return 0;","}"],
          expect:["height = 4","height = 0"],
          sol:["int height(TNode *p){","  if (p == NULL) return 0;","  int hl = height(p->left);","  int hr = height(p->right);","  return 1 + (hl > hr ? hl : hr);","}"] }
      ]},

    { id:"ds-w7", no:"7주차", title:"트리 순회",
      body:[
        '트리는 선형 구조가 아니어서 「처음부터 끝까지」가 저절로 정해지지 않는다 — 모든 노드를 한 번씩 방문하는 규칙이 <b>순회(traversal)</b>다. 자신(V)·왼쪽(L)·오른쪽(R)을 밟는 순서에 따라 셋으로 갈린다: <b>전위(preorder)</b> VLR, <b>중위(inorder)</b> LVR, <b>후위(postorder)</b> LRV. 코드에서는 재귀 호출 두 줄 사이에서 <b>printf 한 줄의 자리</b>만 바뀐다.',
        { label:'중위 순회 — printf가 맨 앞이면 전위, 맨 뒤면 후위', code:["void inorder(TNode *p){","  if (p == NULL) return;    /* 기저 사례 — 빈 트리 */","  inorder(p->left);         /* L */","  printf(\"%d \", p->data);   /* V — 이 줄의 자리가 순회를 가른다 */","  inorder(p->right);        /* R */","}"] },
        '쓰임은 각각이다. <b>전위</b>는 뿌리를 먼저 만나므로 트리 복사·구조 출력에, <b>후위</b>는 자식을 다 처리한 뒤 자신을 처리하므로 폴더 용량 합산·트리 삭제(자식 먼저 free)에 맞는다. <b>중위</b>의 백미는 9주차에서 만난다 — <b>이진 탐색 트리를 중위로 돌면 키가 오름차순으로 나온다.</b>',
        '<b>수식 트리</b>는 연산자를 안쪽 노드에, 피연산자를 리프에 담은 트리다. 같은 트리를 중위로 돌면 중위 표기(a+b*c)가, <b>후위로 돌면 후위 표기</b>(a b c * +)가 나온다. 4주차의 후위식 계산과 이어지는 지점이다 — 컴파일러는 수식을 트리로 세우고, 후위로 훑어 스택 계산 절차를 만든다.',
        '재귀 없이도 돌 수 있다 — 중위 순회의 재귀를 <b>명시적 스택</b>으로 펴면 「왼쪽으로 끝까지 내려가며 쌓고, 꺼내 출력하고, 오른쪽으로 한 발」이 된다. 그리고 레벨 순서(위에서 아래로, 왼쪽에서 오른쪽으로)로 도는 <b>레벨 순회</b>는 스택이 아니라 <b>큐</b>를 쓴다 — 11주차 BFS의 원형이다.',
        '순회의 뼈대는 트리 문제 전반의 <b>일반형</b>이다 — 「빈 트리면 기저값, 아니면 왼쪽 답과 오른쪽 답을 결합」. 노드 수 = 1 + count(좌) + count(우), 높이 = 1 + max(높이(좌), 높이(우)). 트리가 재귀적으로 정의된 구조이므로, 트리를 다루는 함수도 재귀가 가장 자연스럽다.',
        '<b>⚠ 자주 틀리는 것</b> — ① 세 순회 모두 왼쪽이 오른쪽보다 먼저다 — 움직이는 것은 「자신」의 자리뿐이다. ② 순회 결과 하나로는 트리가 복원되지 않는다 — 중위+전위 또는 중위+후위, 두 개가 있어야 유일하게 정해진다. ③ 레벨 순회만은 재귀·스택이 아니라 큐다 — 「가까운 층부터」는 FIFO의 일이다.'
      ],
      ex:[
        { id:"ex7-1", lv:2, title:"중위 순회 — 빈칸 완성",
          intro:"재귀 두 번 사이에 출력이 끼면 중위다. TODO 세 줄의 순서가 전부다.",
          setup:["#include <stdio.h>","#include <stdlib.h>","typedef struct tnode { int data; struct tnode *left, *right; } TNode;","TNode* newNode(int d, TNode *l, TNode *r){","  TNode *p = malloc(sizeof(TNode));","  p->data = d; p->left = l; p->right = r;","  return p;","}"],
          code:["void inorder(TNode *p){","  if (p == NULL) return;","  /* TODO: 왼쪽 재귀 → printf(\"%d \", p->data) → 오른쪽 재귀 (세 줄) */","}"],
          main:["int main(void){","  TNode *t = newNode(4,","    newNode(2, newNode(1,NULL,NULL), newNode(3,NULL,NULL)),","    newNode(6, newNode(5,NULL,NULL), newNode(7,NULL,NULL)));","  inorder(t);","  printf(\"\\n\");","  return 0;","}"],
          expect:["1 2 3 4 5 6 7"],
          sol:["void inorder(TNode *p){","  if (p == NULL) return;","  inorder(p->left);","  printf(\"%d \", p->data);","  inorder(p->right);","}"] },
        { id:"ex7-2", lv:3, title:"후위 순회 — 변형 구현",
          intro:"중위 코드를 후위로 바꿔 직접 작성하라 — 자신의 출력을 맨 뒤로.",
          setup:["#include <stdio.h>","#include <stdlib.h>","typedef struct tnode { int data; struct tnode *left, *right; } TNode;","TNode* newNode(int d, TNode *l, TNode *r){","  TNode *p = malloc(sizeof(TNode));","  p->data = d; p->left = l; p->right = r;","  return p;","}"],
          code:["void postorder(TNode *p){","  /* TODO: 전체를 작성하라 (좌 → 우 → 자신) */","}"],
          main:["int main(void){","  TNode *t = newNode(1,","    newNode(2, newNode(4,NULL,NULL), newNode(5,NULL,NULL)),","    newNode(3, NULL, NULL));","  postorder(t);","  printf(\"\\n\");","  return 0;","}"],
          expect:["4 5 2 3 1"],
          sol:["void postorder(TNode *p){","  if (p == NULL) return;","  postorder(p->left);","  postorder(p->right);","  printf(\"%d \", p->data);","}"] }
      ]}
  ]},

  { title:"후반부 — 히프에서 해시까지 (9~14주차·보강주차)", sections:[

    { id:"ds-w9", no:"9주차", title:"히프와 이진 탐색 트리",
      body:[
        '이번 주는 「특별한 규칙을 얹은 이진 트리」 둘이다. <b>히프(heap)</b>는 최댓값(또는 최솟값)을 즉시 내주는 <b>우선순위 큐</b>의 구현체이고, <b>이진 탐색 트리(BST)</b>는 임의의 키를 빠르게 찾는 사전이다. 같은 이진 트리에 규칙 하나씩을 달리 얹어, 전혀 다른 도구가 된다.',
        '<b>max 히프</b>의 규칙은 둘뿐이다 — ① <b>완전 이진 트리</b>일 것 ② 모든 노드에서 <b>부모 ≥ 자식</b>일 것. 좌우 형제끼리의 대소는 묻지 않는다 — 보장되는 것은 오직 「루트가 최대」다. 완전 이진 트리이므로 배열에 담고(6주차), 부모 i/2·자식 2i, 2i+1의 산수로 오르내린다.',
        '<b>삽입</b>: 완전 이진 트리의 모양을 지키기 위해 <b>맨 끝에</b> 넣고, 부모보다 큰 동안 부모를 끌어내리며 <b>올라간다</b>. <b>삭제(최댓값 꺼내기)</b>: 루트를 꺼내고, <b>마지막 원소를 루트 자리로</b> 올린 뒤, 두 자식 중 <b>큰 쪽</b>과 견주며 <b>내려간다</b>. 둘 다 트리 높이만큼만 움직이므로 O(log n) — 완전 이진 트리의 높이는 log 수준을 벗어나지 못하기 때문이다.',
        { label:'히프 삽입 — 끝에 넣고, 이기는 동안 올라간다', code:["void insert_heap(int item){","  int i = ++n;                        /* 맨 끝 자리 */","  while (i != 1 && item > heap[i/2]){ /* 부모를 이기는 동안 */","    heap[i] = heap[i/2];              /* 부모를 끌어내리고 */","    i = i / 2;                        /* 한 층 올라간다 */","  }","  heap[i] = item;","}"] },
        '<b>이진 탐색 트리(binary search tree)</b>의 규칙: 모든 노드에서 <b>왼쪽 서브트리의 키 &lt; 자신의 키 &lt; 오른쪽 서브트리의 키</b> — 그리고 이 조건이 모든 서브트리에도 재귀적으로 성립한다. 탐색은 1주차의 이진 탐색 그대로다: 견주어 작으면 왼쪽, 크면 오른쪽 — <b>비교 한 번이 반대쪽 절반을 통째로 버린다</b>. 탐색·삽입·삭제 모두 O(h), h는 트리의 높이.',
        '높이가 성능의 전부다 — 균형 잡힌 BST는 h가 log n 수준이지만, 정렬된 순서로 삽입하면 한 줄로 기울어 h = n, 연결 리스트가 된다. <b>삭제는 세 경우</b>다: 리프는 그냥 떼고, 자식이 하나면 그 자식이 자리를 잇고, 자식이 둘이면 <b>오른쪽 서브트리의 최솟값(후계자)</b>을 올려 자리를 채운 뒤 그 노드를 지운다.',
        '<table class="bktbl"><tr><th></th><th>max 히프</th><th>BST</th></tr><tr><td>규칙</td><td>부모 ≥ 자식</td><td>좌 &lt; 자신 &lt; 우</td></tr><tr><td>잘하는 일</td><td>최댓값 보기 O(1), 꺼내기 O(log n)</td><td>임의 키 탐색 O(h)</td></tr><tr><td>표현</td><td>배열(완전 이진 트리)</td><td>링크</td></tr><tr><td>정렬 순회</td><td>불가 — 루트만 안다</td><td>중위 순회 = 오름차순</td></tr></table>',
        '<b>⚠ 자주 틀리는 것</b> — ① 히프에서 왼쪽 자식과 오른쪽 자식 사이에는 아무 대소 관계가 없다 — 「왼쪽이 더 크다」 같은 규칙은 존재하지 않는다. ② 히프 배열을 앞에서부터 읽어도 정렬 순서가 아니다 — 보장은 「루트가 최대」뿐이다. ③ BST는 같은 키들이라도 <b>삽입 순서</b>에 따라 모양이 달라진다 — 그리고 그 모양(높이)이 성능을 정한다.'
      ],
      ex:[
        { id:"ex9-1", lv:2, title:"히프 삽입 — 빈칸 완성",
          intro:"끝에 넣고, 부모(i/2)를 이기는 동안 끌어내리며 올라간다. TODO 두 곳.",
          setup:["#include <stdio.h>","int heap[100];","int n = 0;"],
          code:["void insert(int item){","  int i = ++n;","  while (i != 1 && item > heap[0 /* TODO: 부모 인덱스 */]){","    heap[i] = heap[i/2];","    /* TODO: i를 부모로 이동 (한 줄) */","  }","  heap[i] = item;","}"],
          main:["int main(void){","  int i;","  insert(9); insert(7); insert(8); insert(3); insert(10);","  for (i = 1; i <= n; i++) printf(\"%d \", heap[i]);","  printf(\"\\n\");","  return 0;","}"],
          expect:["10 9 8 3 7"],
          sol:["void insert(int item){","  int i = ++n;","  while (i != 1 && item > heap[i/2]){","    heap[i] = heap[i/2];","    i = i/2;","  }","  heap[i] = item;","}"] },
        { id:"ex9-2", lv:3, title:"BST 탐색 — 변형 구현",
          intro:"재귀 search를 직접 작성하라: NULL이면 실패(0), 같으면 성공(1), 작으면 왼쪽, 크면 오른쪽.",
          setup:["#include <stdio.h>","#include <stdlib.h>","typedef struct tnode { int key; struct tnode *left, *right; } TNode;","TNode* ins(TNode *p, int k){","  if (p == NULL){","    TNode *q = malloc(sizeof(TNode));","    q->key = k; q->left = q->right = NULL;","    return q;","  }","  if (k < p->key) p->left = ins(p->left, k);","  else p->right = ins(p->right, k);","  return p;","}"],
          code:["int search(TNode *p, int k){","  /* TODO: 전체를 작성하라 (재귀, 4~5줄) */","  return 0;","}"],
          main:["int main(void){","  TNode *root = NULL;","  int keys[7] = {40, 20, 60, 10, 30, 50, 70}, i;","  for (i = 0; i < 7; i++) root = ins(root, keys[i]);","  printf(\"%d %d %d\\n\", search(root, 30), search(root, 55), search(root, 70));","  return 0;","}"],
          expect:["1 0 1"],
          sol:["int search(TNode *p, int k){","  if (p == NULL) return 0;","  if (k == p->key) return 1;","  if (k < p->key) return search(p->left, k);","  return search(p->right, k);","}"] }
      ]},

    { id:"ds-w10", no:"10주차", title:"그래프와 표현",
      body:[
        '<b>그래프(graph)</b>는 <b>정점(vertex)의 집합과 간선(edge)의 집합</b>, G = (V, E)다. 트리가 「위계」라면 그래프는 「관계」다 — 도로망, 친구 관계, 지하철 노선. 트리도 그래프다: 사이클 없이 연결된, 간선이 정확히 n−1개인 특수한 그래프.',
        '간선에 방향이 없으면 <b>무방향 그래프</b> — (u,v)와 (v,u)는 같은 간선이다. 방향이 있으면 <b>방향 그래프</b> — &lt;u,v&gt;와 &lt;v,u&gt;는 다르다. 간선으로 직접 이어진 두 정점은 <b>인접(adjacent)</b>, 정점에 붙은 간선의 수가 <b>차수(degree)</b>이며, 방향 그래프에서는 들어오는 <b>진입 차수</b>와 나가는 <b>진출 차수</b>를 나눈다. 간선 하나가 정점 둘의 차수를 1씩 올리므로 <b>차수의 총합 = 2e</b> — 간선 수 계산 문제의 만능 열쇠다. 정점들을 간선으로 이어 걷는 것이 <b>경로</b>, 출발점으로 돌아오는 경로가 <b>사이클</b>, 모든 정점 쌍 사이에 경로가 있으면 <b>연결 그래프</b>다.',
        '표현 첫째 — <b>인접 행렬(adjacency matrix)</b>: n×n 이차원 배열에 「간선이 있으면 1」을 적는다. 무방향이면 대각선을 축으로 대칭이다. 두 정점의 인접 여부를 O(1)에 답하지만, 간선이 있든 없든 <b>n²칸을 다 쓴다</b> — 간선이 성긴(sparse) 그래프에서는 0으로 가득한 낭비다.',
        { label:'인접 행렬 — 무방향 간선 하나가 두 칸을 채운다', code:["int adj[N][N];","void addEdge(int u, int v){","  adj[u][v] = 1;","  adj[v][u] = 1;    /* 무방향 — 대칭 */","}"] },
        '둘째 — <b>인접 리스트(adjacency list)</b>: 정점마다 연결 리스트(5주차)를 두고 <b>이웃만</b> 노드로 단다. 공간이 n + 2e에 비례해 성긴 그래프에서 이득이고, 「v의 모든 이웃」 순회가 이웃 수만큼만 걸린다. 대신 특정 간선의 유무는 사슬을 걸어 봐야 안다. — 2주차 희소 행렬의 판단(빽빽하면 통째로, 성기면 목록으로)이 그대로 돌아온 것이다.',
        '<table class="bktbl"><tr><th></th><th>인접 행렬</th><th>인접 리스트</th></tr><tr><td>공간</td><td class="mono">n²</td><td class="mono">n + 2e</td></tr><tr><td>간선 (u,v) 판정</td><td class="mono">O(1)</td><td>O(u의 차수)</td></tr><tr><td>v의 이웃 순회</td><td class="mono">O(n)</td><td>O(v의 차수)</td></tr><tr><td>유리한 그래프</td><td>조밀(dense)</td><td>희소(sparse)</td></tr></table>',
        '<b>⚠ 자주 틀리는 것</b> — ① 무방향 그래프에서 행렬의 1을 다 세면 간선 수의 <b>2배</b>가 나온다 — 대칭으로 두 번 적히기 때문이다. ② 차수 합 = 2e는 무방향의 이야기다 — 방향 그래프에서는 진입 차수의 합 = 진출 차수의 합 = e. ③ 「연결」과 「완전」은 다르다 — 연결은 경로만 있으면 되고, 완전(complete)은 모든 쌍이 <b>직접</b> 간선으로 이어져야 한다(무방향에서 n(n−1)/2개).'
      ],
      ex:[
        { id:"ex10-1", lv:1, title:"인접 행렬 만들기 — 따라 치기",
          intro:"무방향 간선 하나가 대칭인 두 칸을 1로 만든다. 그대로 입력해 실행하라.",
          code:["#include <stdio.h>","#define N 4","int adj[N][N];","void addEdge(int u, int v){","  adj[u][v] = 1;","  adj[v][u] = 1;","}","int main(void){","  int i, j;","  addEdge(0,1); addEdge(0,2); addEdge(1,3);","  for (i = 0; i < N; i++){","    for (j = 0; j < N; j++)","      printf(\"%d \", adj[i][j]);","    printf(\"\\n\");","  }","  return 0;","}"],
          expect:["0 1 1 0","1 0 0 1","1 0 0 0","0 1 0 0"] },
        { id:"ex10-2", lv:2, title:"차수 세기 — 빈칸 완성",
          intro:"정점 v의 차수 = 행렬 v행에 있는 1의 개수. TODO 한 줄.",
          setup:["#include <stdio.h>","#define N 5","int adj[N][N];","void addEdge(int u, int v){ adj[u][v] = adj[v][u] = 1; }"],
          code:["int degree(int v){","  int j, cnt = 0;","  for (j = 0; j < N; j++){","    /* TODO: adj[v][j]가 1이면 cnt를 올린다 (한 줄) */","  }","  return cnt;","}"],
          main:["int main(void){","  addEdge(0,1); addEdge(0,2); addEdge(0,3); addEdge(2,4);","  printf(\"deg0 = %d\\n\", degree(0));","  printf(\"deg2 = %d\\n\", degree(2));","  printf(\"deg4 = %d\\n\", degree(4));","  return 0;","}"],
          expect:["deg0 = 3","deg2 = 2","deg4 = 1"],
          sol:["int degree(int v){","  int j, cnt = 0;","  for (j = 0; j < N; j++){","    if (adj[v][j]) cnt++;","  }","  return cnt;","}"] }
      ]},

    { id:"ds-w11", no:"11주차", title:"그래프 탐색",
      body:[
        '그래프에서 「모든 정점을 한 번씩」 — 트리의 순회에 해당하는 것이 <b>그래프 탐색</b>이다. 전략은 둘: <b>DFS(depth first search, 깊이 우선)</b>는 한 길을 끝까지 파고들다 막히면 되돌아오고, <b>BFS(breadth first search, 너비 우선)</b>는 가까운 정점부터 층층이 훑는다. 미로에서 한 갈래를 끝까지 가 보는 사람과, 잉크가 번지듯 퍼지는 물 — 그 둘이다.',
        '트리와 결정적으로 다른 점 하나 — 그래프에는 <b>사이클</b>이 있다. 방문 표시 없이 걸으면 고리를 영원히 돈다. 그래서 모든 그래프 탐색은 <b>visited 배열</b>을 차고 시작한다: 방문 즉시 표시하고, <b>표시 없는 이웃으로만</b> 나아간다.',
        '<b>DFS</b>는 재귀 한 줌이다 — 표시하고, 처리하고, 미방문 이웃마다 재귀. 재귀 호출의 스택이 곧 「되돌아갈 길의 기억」이다(2주차 미로 백트래킹과 같은 뼈대다). 재귀 대신 명시적 스택으로 펴도 같은 일을 한다.',
        { label:'DFS — 들어서며 표시, 미방문 이웃으로만', code:["void dfs(int v){","  int w;","  visited[v] = 1;             /* 들어서며 즉시 표시 */","  printf(\"%d \", v);","  for (w = 0; w < n; w++)","    if (adj[v][w] && !visited[w])","      dfs(w);                 /* 미방문 이웃으로만 */","}"] },
        '<b>BFS</b>는 큐를 쓴다 — 출발점을 표시해 큐에 넣고, 「꺼내 처리하고, 미방문 이웃을 <b>표시하며</b> 넣는다」를 큐가 빌 때까지 반복한다. 먼저 발견된 정점이 먼저 처리되므로 거리 1인 정점 전부, 그다음 거리 2 전부 — 층 순서가 보장된다. 그래서 가중치 없는 그래프의 <b>간선 수 기준 최단 거리</b>는 BFS의 것이다(7주차 레벨 순회의 그래프판).',
        '탐색이 낳는 부산물 둘. 연결 그래프에서 탐색이 실제로 쓴 간선만 남기면 n개 정점을 <b>정확히 n−1개</b> 간선으로 잇는 <b>신장 트리(spanning tree)</b>가 된다 — DFS가 만들면 깊이 우선 신장 트리, BFS면 너비 우선 신장 트리. 연결이 아닌 그래프에서는 탐색 한 번이 닿는 범위가 <b>연결 요소</b> 하나다 — 미방문 정점이 남아 있으면 거기서 새 탐색을 시작하며 요소를 센다.',
        '<b>⚠ 자주 틀리는 것</b> — ① DFS·BFS의 방문 순서는 유일하지 않다 — 이웃을 검사하는 순서(번호 작은 것부터 등)에 따라 달라지며, 시험 문제는 반드시 그 순서를 명시한다. ② BFS의 방문 표시는 「꺼낼 때」가 아니라 <b>큐에 넣을 때</b> 한다 — 꺼낼 때 표시하면 같은 정점이 큐에 두 번 들어간다. ③ 신장 트리는 그래프가 연결일 때만 존재하고, 간선은 항상 n−1개다.'
      ],
      ex:[
        { id:"ex11-1", lv:2, title:"DFS — 빈칸 완성",
          intro:"핵심 조건 하나: 아직 방문하지 않은 이웃으로만 재귀한다.",
          setup:["#include <stdio.h>","#define N 5","int adj[N][N];","int visited[N];","void addEdge(int u, int v){ adj[u][v] = adj[v][u] = 1; }"],
          code:["void dfs(int v){","  int w;","  visited[v] = 1;","  printf(\"%d \", v);","  for (w = 0; w < N; w++){","    if (adj[v][w] && 0 /* TODO: 미방문 조건 */)","      dfs(w);","  }","}"],
          main:["int main(void){","  addEdge(0,1); addEdge(0,2); addEdge(1,3); addEdge(2,4);","  dfs(0);","  printf(\"\\n\");","  return 0;","}"],
          expect:["0 1 3 2 4"],
          sol:["void dfs(int v){","  int w;","  visited[v] = 1;","  printf(\"%d \", v);","  for (w = 0; w < N; w++){","    if (adj[v][w] && !visited[w])","      dfs(w);","  }","}"] },
        { id:"ex11-2", lv:3, title:"BFS — 변형 구현",
          intro:"DFS의 재귀를 큐로 바꾸면 BFS다. 「꺼내며 출력, 미방문 이웃은 표시하고 큐에」 — bfs를 직접 작성하라.",
          setup:["#include <stdio.h>","#define N 5","int adj[N][N];","int visited[N];","int queue[N]; int front = -1, rear = -1;","void addEdge(int u, int v){ adj[u][v] = adj[v][u] = 1; }"],
          code:["void bfs(int s){","  /* TODO: 전체를 작성하라 —","     s를 표시하고 큐에 넣은 뒤,","     큐가 빌 때까지: 꺼내 출력하고, 미방문 이웃을 표시해 큐에 넣는다 */","}"],
          main:["int main(void){","  addEdge(0,1); addEdge(0,2); addEdge(1,3); addEdge(2,4);","  bfs(0);","  printf(\"\\n\");","  return 0;","}"],
          expect:["0 1 2 3 4"],
          sol:["void bfs(int s){","  int v, w;","  visited[s] = 1;","  queue[++rear] = s;","  while (front != rear){","    v = queue[++front];","    printf(\"%d \", v);","    for (w = 0; w < N; w++){","      if (adj[v][w] && !visited[w]){","        visited[w] = 1;","        queue[++rear] = w;","      }","    }","  }","}"] }
      ]},

    { id:"ds-w12", no:"12주차", title:"가중치 그래프",
      body:[
        '간선에 <b>가중치(비용·거리)</b>가 붙는 순간 질문이 둘 생긴다 — ① 전부 잇되 가장 싸게: 신장 트리 중 가중치 합이 최소인 <b>최소 비용 신장 트리(MST)</b> ② 한 곳에서 각 곳까지 가장 짧게: <b>최단 경로</b>(경로의 길이는 간선 수가 아니라 <b>가중치의 합</b>이다). 이번 주의 세 알고리즘은 모두 <b>탐욕(greedy)</b>이다 — 매 단계 지금 가장 좋아 보이는 것을 고르고 번복하지 않는다. 그런데도 최적이 보장되는, 드물게 아름다운 경우들이다.',
        '<b>Kruskal</b>은 간선 중심이다 — 간선을 <b>싼 순서로</b> 늘어놓고 하나씩 집되, <b>사이클을 만들면 버린다</b>. n−1개를 채우면 끝. 사이클 판정은 「팀 표시」로 한다: 두 끝점이 이미 <b>같은 팀</b>(이어진 무리)이면 그 간선은 고리를 만들 뿐이므로 거부하고, 다른 팀이면 채택하며 두 팀을 합친다(union-find의 발상). 버려도 손해가 없다 — 같은 팀이라는 것은 이미 그보다 싼 간선들로 연결돼 있다는 뜻이니까.',
        '<b>Prim</b>은 정점 중심이다 — 한 정점에서 트리를 시작해, <b>트리에 닿아 있는 간선 중 최저</b>를 골라 정점을 하나씩 편입한다. 항상 「트리 하나」가 자라는 모습이다. 같은 그래프라면 Kruskal과 총비용이 같고, 가중치가 모두 다르면 MST 자체가 유일하다 — 채택 순서만 다를 뿐 같은 트리에 닿는다.',
        '<b>Dijkstra</b>는 문제가 다르다 — 출발점에서 <b>각 정점까지의 최단 거리</b>. 확정된 정점의 집합 S와 거리 표 distance[]를 들고 세 박자를 반복한다: ① 미확정 중 거리가 최소인 정점 u를 고른다 ② u를 확정한다 ③ u를 <b>거쳐 가는</b> 새 길이 더 짧으면 갱신한다. 거리가 짧은 순서로 확정되므로, 한 번 확정된 값은 다시 줄지 않는다.',
        { label:'Dijkstra 한 바퀴 — 고르고, 확정하고, 갱신한다', code:["u = choose();            /* ① 미확정 중 distance 최소 */","found[u] = TRUE;         /* ② 확정 */","for (w = 0; w < n; w++)  /* ③ u를 거치는 새 길 검사 */","  if (!found[w] && distance[u] + cost[u][w] < distance[w])","    distance[w] = distance[u] + cost[u][w];"] },
        '구현 관례 하나 — 길이 없는 칸은 1000 같은 <b>큰 값(무한대 노릇)</b>으로 채운다. 무한대끼리 더하면 넘칠 수 있으므로(1000+1000), 갱신 앞에 미확정 검사를 두거나 형이 감당할 만큼만 크게 잡는다. 도달할 수 없는 정점은 끝까지 무한대로 남는다.',
        '<table class="bktbl"><tr><th></th><th>문제</th><th>중심</th><th>한 단계</th></tr><tr><td><b>Kruskal</b></td><td>MST</td><td>간선</td><td>싼 간선 채택, 같은 팀이면 거부</td></tr><tr><td><b>Prim</b></td><td>MST</td><td>정점</td><td>트리에 닿은 최저 간선으로 확장</td></tr><tr><td><b>Dijkstra</b></td><td>최단 경로</td><td>정점</td><td>최소 거리 확정 + 경유 갱신</td></tr></table>',
        '<b>⚠ 자주 틀리는 것</b> — ① MST와 최단 경로 트리는 다르다 — 전체 합이 최소라고 해서 출발점에서 각 점까지가 최단인 것은 아니다. ② Dijkstra는 <b>음수 가중치</b>에서 무너진다 — 「확정한 값은 다시 줄지 않는다」는 전제가 깨지기 때문이다. ③ Kruskal이 간선을 버리는 기준은 「비싸서」가 아니라 <b>「사이클이라서」</b>다 — 싼 간선도 두 끝점이 같은 팀이면 버린다.'
      ],
      ex:[
        { id:"ex12-1", lv:2, title:"최소 미확정 정점 고르기 — 빈칸 완성",
          intro:"Dijkstra의 choose: 아직 확정되지 않은 정점 중 거리가 최소인 것. TODO의 조건 두 개.",
          setup:["#include <stdio.h>","#define N 5","#define INF 9999"],
          code:["int choose(int distance[], int found[]){","  int i, min = INF, minpos = -1;","  for (i = 0; i < N; i++){","    if (0 /* TODO: 미확정이고, 지금까지의 min보다 가깝다 */){","      min = distance[i];","      minpos = i;","    }","  }","  return minpos;","}"],
          main:["int main(void){","  int distance[N] = {0, 5, 10, INF, 3};","  int found[N] = {1, 0, 0, 0, 0};","  printf(\"pick = %d\\n\", choose(distance, found));","  int found2[N] = {1, 0, 0, 0, 1};","  printf(\"pick = %d\\n\", choose(distance, found2));","  return 0;","}"],
          expect:["pick = 4","pick = 1"],
          sol:["int choose(int distance[], int found[]){","  int i, min = INF, minpos = -1;","  for (i = 0; i < N; i++){","    if (!found[i] && distance[i] < min){","      min = distance[i];","      minpos = i;","    }","  }","  return minpos;","}"] },
        { id:"ex12-2", lv:4, title:"거리 갱신 한 스텝 — 자유 구현",
          intro:"정점 u가 방금 확정됐다. 모든 미확정 정점 w에 대해 「u를 거쳐 가는 길이 더 짧으면 distance[w]를 갱신」하는 update를 작성하라.",
          setup:["#include <stdio.h>","#define N 4","#define INF 9999","int cost[N][N] = {","  {0,   5,  10, INF},","  {INF, 0,  3,  9},","  {INF, INF,0,  1},","  {INF, INF,INF,0}","};"],
          code:["void update(int distance[], int found[], int u){","  /* TODO: 전체를 작성하라 —","     모든 w에 대해: 미방문이고 distance[u]+cost[u][w] < distance[w]면 갱신 */","}"],
          main:["int main(void){","  int distance[N] = {0, 5, 10, INF};","  int found[N] = {1, 1, 0, 0};","  update(distance, found, 1);","  printf(\"%d %d %d %d\\n\", distance[0], distance[1], distance[2], distance[3]);","  return 0;","}"],
          expect:["0 5 8 14"],
          sol:["void update(int distance[], int found[], int u){","  int w;","  for (w = 0; w < N; w++){","    if (!found[w] && distance[u] + cost[u][w] < distance[w])","      distance[w] = distance[u] + cost[u][w];","  }","}"] }
      ]},

    { id:"ds-w13", no:"13주차", title:"단순 정렬",
      body:[
        '<b>정렬(sorting)</b>은 레코드들을 <b>키(key)</b>의 오름차순(또는 내림차순)으로 다시 세우는 일이다 — <b>레코드</b>는 한 건의 자료(학생 한 명), <b>필드</b>는 그 안의 항목들, <b>키</b>는 정렬의 기준이 되는 필드다. 정렬돼 있어야 이진 탐색이 성립한다(1주차) — 정렬은 탐색을 위한 투자다. 자료가 주기억 장치에 다 들어가면 <b>내부 정렬</b>, 디스크를 오가야 하면 <b>외부 정렬</b>이라 부른다.',
        '어휘 하나를 먼저 — <b>안정성(stability)</b>. 같은 키를 가진 레코드들의 <b>원래 순서가 정렬 후에도 유지</b>되면 안정 정렬이다. 이름순 성적표를 학년순으로 다시 정렬했을 때 같은 학년 안이 여전히 이름순으로 남는가 — 그 성질이다. 속도와는 무관한 별도의 축이다.',
        '<b>선택 정렬(selection sort)</b> — 남은 것 중 <b>최솟값을 골라</b> 정렬된 부분 바로 뒤와 교환한다. 비교는 언제나 n(n−1)/2번 — <b>이미 정렬돼 있어도 같다</b>. 최솟값「임을 확인」하려면 남은 전부를 봐야 하기 때문이다. 대신 교환은 회전당 1번, 많아야 n−1번 — 레코드가 크고 이동이 비쌀 때 좋다. 기본형은 불안정이다.',
        '<b>버블 정렬(bubble sort)</b> — <b>이웃끼리</b> 견주어 어긋나 있으면 교환한다. 한 회전이 끝나면 <b>최댓값이 맨 뒤에 확정</b>된다(거품이 떠오르듯). 교환이 잦아 평균·최악 O(n²)이지만, 「한 회전 동안 교환이 없으면 이미 정렬된 것」이라는 개선을 넣으면 정렬된 입력에서 O(n)에 끝난다. 안정이다.',
        '<b>삽입 정렬(insertion sort)</b> — 카드 놀이처럼, 새 원소를 빼 들고 손안의 <b>정렬된 부분</b>에서 자기보다 큰 것들을 <b>한 칸씩 밀어낸 뒤</b> 빈자리에 끼운다 — 2주차 배열의 그 「밀기」다. <b>거의 정렬된 입력</b>이면 밀 것이 없어 최선 O(n) — 실전에서 다른 정렬의 마무리 단계로 쓰이는 이유다. 역순 입력이 최악 O(n²)이며, 안정이다.',
        { label:'삽입 정렬 — 빼 들고, 밀고, 끼운다', code:["void insertion_sort(int list[], int n){","  int i, j, next;","  for (i = 1; i < n; i++){","    next = list[i];                    /* 빼 들고 */","    for (j = i-1; j >= 0 && list[j] > next; j--)","      list[j+1] = list[j];             /* 큰 것은 뒤로 민다 */","    list[j+1] = next;                  /* 빈자리에 끼운다 */","  }","}"] },
        '<table class="bktbl"><tr><th></th><th>비교</th><th>이동·교환</th><th>안정</th><th>특징</th></tr><tr><td><b>선택</b></td><td>항상 n(n−1)/2</td><td>교환 ≤ n−1</td><td>×</td><td>이동이 비쌀 때</td></tr><tr><td><b>버블</b></td><td>개선판 최선 n−1</td><td>교환 많음</td><td>○</td><td>정렬 여부 확인용</td></tr><tr><td><b>삽입</b></td><td>최선 n−1 / 최악 n(n−1)/2</td><td>역순이면 최다</td><td>○</td><td>거의 정렬에 최강</td></tr></table>',
        '<b>⚠ 자주 틀리는 것</b> — ① 선택 정렬의 비교 횟수는 입력과 무관하게 n(n−1)/2다 — 「정렬돼 있으면 빠르다」는 삽입·개선 버블의 이야기다. ② 버블 한 회전 뒤 확정되는 것은 <b>최댓값의 자리(맨 뒤)</b>다 — 맨 앞이 아니다. ③ 안정성은 빠르기가 아니다 — 같은 O(n²) 안에서도 안정(버블·삽입)과 불안정(선택)이 갈린다.'
      ],
      ex:[
        { id:"ex13-1", lv:1, title:"선택 정렬 — 따라 치기",
          intro:"완성 코드다. 그대로 입력해 실행하라 — 회전마다 「최솟값 찾기 + 교환 한 번」의 리듬이 목표다.",
          code:["#include <stdio.h>","int main(void){","  int A[6] = {8, 3, 42, 7, 15, 1};","  int n = 6, i, j, least, t;","  for (i = 0; i < n-1; i++){","    least = i;","    for (j = i+1; j < n; j++)","      if (A[j] < A[least]) least = j;","    t = A[i]; A[i] = A[least]; A[least] = t;","  }","  for (i = 0; i < n; i++) printf(\"%d \", A[i]);","  printf(\"\\n\");","  return 0;","}"],
          expect:["1 3 7 8 15 42"] },
        { id:"ex13-2", lv:3, title:"조기 종료 버블 정렬 — 변형 구현",
          intro:"기본 버블에 개선 하나: 한 회전 동안 교환이 한 번도 없었으면 이미 정렬된 것 — 즉시 멈춘다. flag를 써서 작성하고, 회전 수를 출력해 확인하라.",
          setup:["#include <stdio.h>"],
          code:["int bubble(int A[], int n){","  /* TODO: 전체를 작성하라 —","     회전마다 이웃 교환. 교환이 없던 회전에서 멈추고,","     수행한 회전 수를 반환한다 */","  return 0;","}"],
          main:["int main(void){","  int A[6] = {3, 1, 2, 4, 5, 6}, i;","  int pass = bubble(A, 6);","  for (i = 0; i < 6; i++) printf(\"%d \", A[i]);","  printf(\"\\npass = %d\\n\", pass);","  return 0;","}"],
          expect:["1 2 3 4 5 6","pass = 2"],
          sol:["int bubble(int A[], int n){","  int i, j, t, pass = 0, swapped;","  for (i = n-1; i > 0; i--){","    swapped = 0;","    pass++;","    for (j = 0; j < i; j++){","      if (A[j] > A[j+1]){","        t = A[j]; A[j] = A[j+1]; A[j+1] = t;","        swapped = 1;","      }","    }","    if (!swapped) break;","  }","  return pass;","}"] }
      ]},

    { id:"ds-w14", no:"14주차", title:"고급 정렬",
      body:[
        '단순 정렬의 벽 O(n²)을 깨는 열쇠는 <b>분할 정복(divide and conquer)</b>이다 — 문제를 반씩 갈라 각각 풀고 합치면 층이 log n개, 층마다 하는 일이 n — 합쳐서 O(n log n). 이번 주의 셋은 「가르는 방법」이 서로 다르다: 퀵은 <b>값</b> 기준으로, 합병은 <b>자리</b> 기준으로 가르고, 히프 정렬은 트리를 빌린다.',
        '<b>퀵 정렬(quick sort)</b> — 기준 원소 <b>피봇(pivot)</b>을 골라, 작은 것은 왼쪽·큰 것은 오른쪽으로 가르는 <b>분할(partition)</b>을 하면 피봇은 <b>최종 자리에 박힌다</b>. 남은 양쪽을 재귀로 반복. 평균 O(n log n)에 상수가 작아 실전 최속으로 꼽히지만, 분할이 극단으로 쏠리면 — 이미 정렬된 입력에 첫 원소 피봇 — 층이 n개가 되어 <b>최악 O(n²)</b>이다. 불안정.',
        { label:'퀵 정렬 골격 — 분할하면 피봇은 이미 제자리다', code:["void quick_sort(int list[], int left, int right){","  if (left < right){                      /* 원소 2개 이상일 때만 */","    int q = partition(list, left, right); /* 피봇을 제자리에 */","    quick_sort(list, left, q - 1);        /* 왼쪽 조각 */","    quick_sort(list, q + 1, right);       /* 오른쪽 조각 */","  }","}"] },
        '<b>합병 정렬(merge sort)</b> — 가르는 데는 고민이 없다(가운데에서 자른다). 힘은 <b>합병(merge)</b>에 있다: 정렬된 두 구간을 앞에서부터 견주며 작은 쪽을 옮기면 O(n)에 합쳐진다. 입력이 어떻든 <b>언제나 O(n log n)</b>, 그리고 <b>안정</b> — 대신 옮겨 담을 O(n)의 보조 배열이 필요하다. 디스크에서 하는 외부 정렬의 표준이기도 하다.',
        '<b>히프 정렬(heap sort)</b> — 9주차의 히프를 빌린다: 배열을 max 히프로 만든 뒤, 「루트(최대)를 맨 뒤와 교환하고, 줄어든 범위에서 루트를 내려보내 히프를 복구」를 반복하면 큰 값이 뒤에서부터 쌓인다. <b>보장 O(n log n)</b>에 <b>보조 배열이 없다</b>(제자리) — 합병의 메모리 부담과 퀵의 최악을 둘 다 피한 절충이다. 불안정.',
        '비교 없이 정렬하는 별종도 있다 — <b>기수 정렬(radix sort)</b>: 낮은 자릿수부터 버킷에 나눠 담고 모으기를 자릿수만큼 반복한다. O(d·n) (d = 자릿수). 비교 정렬의 이론 한계 O(n log n)을 벗어나지만, 키가 자릿수로 쪼개질 수 있어야 하고 버킷 메모리가 든다.',
        '<table class="bktbl"><tr><th></th><th>최선</th><th>평균</th><th>최악</th><th>안정</th><th>비고</th></tr><tr><td>선택</td><td class="mono">n²</td><td class="mono">n²</td><td class="mono">n²</td><td>×</td><td>교환 최소</td></tr><tr><td>버블</td><td class="mono">n</td><td class="mono">n²</td><td class="mono">n²</td><td>○</td><td>개선판 기준</td></tr><tr><td>삽입</td><td class="mono">n</td><td class="mono">n²</td><td class="mono">n²</td><td>○</td><td>거의 정렬 최강</td></tr><tr><td>퀵</td><td class="mono">n log n</td><td class="mono">n log n</td><td class="mono">n²</td><td>×</td><td>평균 최속</td></tr><tr><td>합병</td><td class="mono">n log n</td><td class="mono">n log n</td><td class="mono">n log n</td><td>○</td><td>보조 배열 O(n)</td></tr><tr><td>히프</td><td class="mono">n log n</td><td class="mono">n log n</td><td class="mono">n log n</td><td>×</td><td>제자리·보장</td></tr></table>',
        '<b>⚠ 자주 틀리는 것</b> — ① 퀵 정렬의 최악은 무작위 입력이 아니라 <b>이미 정렬된(또는 역순) 입력</b>에서 온다(첫 원소 피봇일 때) — 실전 구현이 피봇을 가운데나 무작위로 고르는 이유다. ② 「합병이 최악 등급이 더 좋은데 왜 퀵을 쓰나」 — 평균 등급이 같으면 상수가 승부를 가르고, 퀵이 이동이 적다. ③ 히프 정렬에서 정렬된 값이 쌓이는 곳은 배열의 <b>뒤쪽</b>이다(max 히프 기준) — 루트와 맨 뒤를 교환하기 때문이다.'
      ],
      ex:[
        { id:"ex14-1", lv:2, title:"merge — 빈칸 완성",
          intro:"두 정렬 구간을 합칠 때, 남은 쪽을 마저 옮기는 두 줄을 채워라.",
          setup:["#include <stdio.h>"],
          code:["void merge(int a[], int out[], int lo, int mid, int hi){","  int i = lo, j = mid+1, k = lo;","  while (i <= mid && j <= hi)","    out[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];","  /* TODO: 앞 구간의 잔여 복사 (한 줄 while) */","  /* TODO: 뒤 구간의 잔여 복사 (한 줄 while) */","}"],
          main:["int main(void){","  int a[8] = {2, 5, 9, 11, 1, 3, 12, 20};","  int out[8], k;","  merge(a, out, 0, 3, 7);","  for (k = 0; k < 8; k++) printf(\"%d \", out[k]);","  printf(\"\\n\");","  return 0;","}"],
          expect:["1 2 3 5 9 11 12 20"],
          sol:["void merge(int a[], int out[], int lo, int mid, int hi){","  int i = lo, j = mid+1, k = lo;","  while (i <= mid && j <= hi)","    out[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];","  while (i <= mid) out[k++] = a[i++];","  while (j <= hi) out[k++] = a[j++];","}"] },
        { id:"ex14-2", lv:4, title:"퀵 정렬 분할 — 자유 구현",
          intro:"첫 원소를 피봇으로 하는 partition을 작성하라: i는 피봇 이상에서, j는 피봇 이하에서 멈추고, 교차 전엔 교환·교차하면 피봇을 j와 교환. 피봇의 최종 위치를 반환한다.",
          setup:["#include <stdio.h>","void swap(int *a, int *b){ int t = *a; *a = *b; *b = t; }"],
          code:["int partition(int list[], int left, int right){","  /* TODO: 전체를 작성하라 (do-while 두 개 + 교차 판정) */","  return left;","}"],
          main:["int main(void){","  int a[7] = {30, 10, 50, 20, 60, 5, 40}, k;","  int p = partition(a, 0, 6);","  printf(\"pivot pos = %d\\n\", p);","  for (k = 0; k < 7; k++) printf(\"%d \", a[k]);","  printf(\"\\n\");","  return 0;","}"],
          expect:["pivot pos = 3","20 10 5 30 60 50 40"],
          sol:["int partition(int list[], int left, int right){","  int pivot = list[left];","  int i = left, j = right + 1;","  do {","    do { i++; } while (i <= right && list[i] < pivot);","    do { j--; } while (list[j] > pivot);","    if (i < j) swap(&list[i], &list[j]);","  } while (i < j);","  swap(&list[left], &list[j]);","  return j;","}"] }
      ]},

    { id:"ds-wH", no:"보강주차", title:"해시",
      body:[
        '탐색의 역사를 되감으면 — 순차 탐색 O(n), 정렬된 배열과 BST의 O(log n). 마지막 질문은 「비교 자체를 없앨 수 없는가」다. <b>해싱(hashing)</b>의 답: 키를 비교하지 않고, 키에서 저장 주소를 <b>계산</b>한다 — h(k). 학번 끝 두 자리로 사물함을 정하듯, 찾기가 계산 한 번이 된다(이상적 O(1)).',
        '<b>해시 테이블</b> ht[0..M−1]에 키를 담는다. 주소 하나의 저장 칸이 <b>버킷(bucket)</b>, 버킷 안에서 레코드 하나가 드는 자리가 <b>슬롯(slot)</b>이다. 서로 다른 키가 같은 주소로 계산되면 <b>충돌(collision)</b>, 같은 주소를 갖는 키들은 <b>동거자(synonym)</b>, 들어갈 슬롯이 아예 없으면 <b>오버플로(overflow)</b>다 — 슬롯이 1개면 충돌이 곧 오버플로다. 표가 찬 정도가 <b>적재 밀도(적재율) α = n / (슬롯 수 × 버킷 수)</b> — 해시 성능의 단 하나의 손잡이다.',
        '좋은 해시 함수의 조건은 둘 — 계산이 쉬울 것, 주소를 <b>고르게</b> 흩을 것(쏠리면 한 줄 서기가 된다). 표준은 <b>제산법(division)</b>: h(k) = k mod M. 표 크기 <b>M은 소수(prime)</b>로 잡는다 — 키들이 짝수·등간격 같은 공약수 패턴을 가질 때 합성수 M은 특정 버킷만 쓰게 되기 때문이다(짝수 키에 M=10이면 짝수 버킷만 찬다). 그 밖에 긴 키를 조각내 더하는 <b>폴딩(folding)</b>(그대로 더하면 이동 폴딩, 경계 조각을 뒤집어 더하면 경계 폴딩), 제곱의 가운데 자리를 쓰는 <b>중간 제곱법</b>, 고르게 분포하는 자리만 골라 쓰는 <b>숫자 분석법</b>이 있다.',
        '충돌 해결 첫째 — 표 안에서 푸는 <b>개방 주소법</b>, 기본형은 <b>선형 조사(linear probing)</b>: 자리가 차 있으면 <b>바로 다음 칸</b>을 본다 — ht[(h(k)+i) mod M], 끝이면 앞으로 감는다. 탐색도 같은 걸음을 걷다가 <b>빈 칸을 만나면 「없다」는 증명</b>이다. 병은 <b>군집(clustering)</b> — 찬 칸들이 덩어리지면 새 키가 덩어리에 더 잘 부딪혀 덩어리가 더 커진다(눈덩이). α가 커질수록 조사 길이가 급증한다. 완화책으로 보폭을 1², 2², 3²…으로 띄우는 <b>이차 조사</b>, 보폭을 둘째 해시로 정하는 <b>이중 해싱</b>이 있다. 삭제는 그냥 비우면 「빈 칸 = 없음」 증명이 끊기므로 표시 삭제(DELETED 마크)가 필요하다.',
        { label:'선형 조사 삽입 — 첫 빈 칸까지 걷는다', code:["#define M 13          /* 표 크기 — 소수 */","#define EMPTY -1","int ht[M];","int h(int k){ return k % M; }","void hash_insert(int k){","  int i = h(k);              /* 계산된 출발 주소 */","  while (ht[i] != EMPTY)","    i = (i + 1) % M;         /* 다음 칸 — 끝이면 앞으로 */","  ht[i] = k;","}"] },
        '둘째 — <b>체이닝(chaining)</b>: 버킷마다 연결 리스트(5주차)를 두고 동거자들을 사슬로 매단다. 오버플로 자체가 사라지고 α &gt; 1도 가능하며, 삭제도 노드 제거로 깨끗하다 — 대신 포인터 메모리가 든다. 파이썬의 dict, 게임 인벤토리의 즉시 검색이 모두 이 계열의 해시 테이블이다.',
        '해시의 평균 O(1)은 <b>조건부</b>다 — 좋은 해시 함수와 낮은 α가 전제이며, 최악(전부 한 버킷)은 O(n)이다. 그리고 해시에는 <b>순서가 없다</b> — 범위 탐색과 정렬 순회는 못 한다. 그 일은 BST의 몫이다.<table class="bktbl"><tr><th></th><th>해시</th><th>BST</th></tr><tr><td>탐색(평균)</td><td class="mono">O(1)</td><td class="mono">O(log n)</td></tr><tr><td>탐색(최악)</td><td class="mono">O(n) — 한 버킷 쏠림</td><td class="mono">O(n) — 경사 트리</td></tr><tr><td>순서</td><td>없음 — 범위·정렬 불가</td><td>중위 순회 = 오름차순</td></tr><tr><td>맞는 일</td><td>「있나? 얼마인가?」 즉시 검색</td><td>범위 검색, 순서 있는 순회</td></tr></table>',
        '<b>⚠ 자주 틀리는 것</b> — ① 「해시는 항상 O(1)」이 아니다 — 해시 함수의 질과 α에 걸린 평균값이다. ② 충돌은 오류가 아니라 <b>정상 사건</b>이다 — 설계의 목표는 충돌을 없애는 것이 아니라 감당하는 것이다. ③ 선형 조사의 탐색은 「빈 칸」에서 멈춘다 — 표를 끝까지 도는 것이 아니며, 그래서 칸을 함부로 비우면 안 된다. ④ C의 % 연산은 음수 키에서 음수를 낼 수 있다 — 키가 음수일 수 있으면 보정이 필요하다.'
      ],
      ex:[
        { id:"ex15-1", lv:2, title:"선형 조사 삽입 — 빈칸 완성",
          intro:"홈 주소가 차 있으면 원형으로 한 칸씩 — 빈 칸(-1)을 만날 때까지. TODO 한 줄.",
          setup:["#include <stdio.h>","#define M 7","int ht[M] = {-1,-1,-1,-1,-1,-1,-1};"],
          code:["void insert(int k){","  int i = k % M;","  while (ht[i] != -1){","    /* TODO: i를 원형으로 한 칸 전진 (한 줄) */","  }","  ht[i] = k;","}"],
          main:["int main(void){","  int i;","  insert(15); insert(8); insert(22); insert(3);","  for (i = 0; i < M; i++) printf(\"%d \", ht[i]);","  printf(\"\\n\");","  return 0;","}"],
          expect:["-1 15 8 22 3 -1 -1"],
          sol:["void insert(int k){","  int i = k % M;","  while (ht[i] != -1){","    i = (i + 1) % M;","  }","  ht[i] = k;","}"] },
        { id:"ex15-2", lv:3, title:"체이닝 삽입·출력 — 변형 구현",
          intro:"버킷마다 연결 리스트: 새 키를 체인의 맨 앞에 삽입하는 insert를 작성하라(맨 앞 삽입은 O(1) — 5주차의 그 기술이다).",
          setup:["#include <stdio.h>","#include <stdlib.h>","#define M 5","typedef struct node { int key; struct node *link; } Node;","Node *tab[M];"],
          code:["void insert(int k){","  /* TODO: 전체를 작성하라 —","     h = k % M, 새 노드를 malloc해 키를 넣고,","     tab[h] 체인의 맨 앞에 삽입 */","}"],
          main:["int main(void){","  int i;","  insert(25); insert(31); insert(55); insert(41);","  for (i = 0; i < M; i++){","    Node *p = tab[i];","    printf(\"[%d]\", i);","    while (p != NULL){ printf(\" %d\", p->key); p = p->link; }","    printf(\"\\n\");","  }","  return 0;","}"],
          expect:["[0] 55 25","[1] 41 31","[2]","[3]","[4]"],
          sol:["void insert(int k){","  int h = k % M;","  Node *p = malloc(sizeof(Node));","  p->key = k;","  p->link = tab[h];","  tab[h] = p;","}"] }
      ]}
  ]}
]};
