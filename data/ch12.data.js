"use strict";
/* 챕터 12 데이터 — "고급 정렬" = 14주차 (강의 7장 6~19매 + 종합 비교 보강(분할검토 v1.0) · 제작 규약 v1.5 · 주간 루프 공용 러너)
   퀵(원본) → 합병(원본) → 히프(원본 — 9주차 이월 회수) → 종합 비교(보강).
   전 정렬 표준 구성: 아이디어 → 용도 → 성능(비교·이동→복잡도) → 코드 한 줄 해설 → 스텝.
   서사: E2 특별 씬(목 — "기말 전에 어머님께 직접") + 단서 ⑥(연락처 보유) + 할아버지 조언(금) + 도발장 8(조건 소멸).
   예제 계열(원본 그대로): 퀵 = 예제 7.3 [26,5,37,…] / 합병 = 그림 7.7 [26,5,77,…] / 히프 = p19 그림(1번 칸부터). */
const CH12 = {
  meta: { id:"ch12", week:14, title:"고급 정렬", sub:"분할 정복의 셋과 총정리", nextTeaser:"해시",
          nextHint:'드디어 <b>마지막 진도</b>래요! 이름을 넣으면 한 번에 찾아진다는 마법의 표라던데… 쌤, 근데 기말이 진짜 코앞이에요. 저 이번엔 진짜 잘 보고 싶어요.' },
  economy: { payPerPoint:1000, aplusBonus:200000 },
  exam: { unitPts:15, tutorPts:10, passLine:54 },
  apGen: "AP12",

  intro: [
    {who:"도윤", face:"doyun", text:'쌤! 오늘 수업에서 <b>퀵 정렬</b>이 나왔는데요 — 교수님이 「보통은 이게 제일 빠르다」 해 놓고 바로 「하지만 방심하면 제일 느려진다」래요. 제일 빠른 게 어떻게 제일 느려져요? 말장난 아니에요?'},
    {who:"나", face:"me-think", text:'<span class="inner">지난주 예고했던 <b>분할 정복(divide and conquer)</b>의 방법들이 왔다. 빠른 이유와 느려지는 이유가 같은 곳에 있다는 것 — 그걸 이번 주에 손으로 확인하게 될 거다.</span>'},
    {who:"나", face:"me", text:'말장난이 아니라 이번 주의 핵심 질문이다. 분할 정복 — 나누어 정복하는 정렬은 <b>어떻게 나누느냐</b>에 모든 게 달렸거든. 잘 나누면 날아가고, 잘못 나누면 지난주의 O(n²)로 되돌아간다. 월요일 밤 — 그 경계선부터 본다.'}
  ],

  flow: ["study-A","trial-A","il-A","study-B","trial-B","il-B","tutor","study-C","trial-C","il-C","study-D","trial-D","il-D","saturday","sunday"],
  cpl: {
    "study-A":"14주차 · 월 — 퀵 정렬 자습","trial-A":"14주차 · 월 — 퀵 시련","il-A":"14주차 · 월요일 밤",
    "study-B":"14주차 · 화 — 합병 정렬 자습","trial-B":"14주차 · 화 — 합병 시련","il-B":"14주차 · 화요일 밤",
    "tutor":"14주차 · 수 — 과외",
    "study-C":"14주차 · 목 — 히프 정렬 자습","trial-C":"14주차 · 목 — 히프 시련","il-C":"14주차 · 목요일 밤",
    "study-D":"14주차 · 금 — 종합 비교 자습","trial-D":"14주차 · 금 — 종합 시련","il-D":"14주차 · 금요일 밤",
    "saturday":"14주차 · 토 — 보충/A+","sunday":"14주차 · 월 — 쪽지시험"
  },

  trials: {
    A:{gen:"G45", label:"퀵 분할 추적기", doneLabel:"유닛 A 숙달 ▶"},
    B:{gen:"G46", label:"합병 추적기", doneLabel:"유닛 B 숙달 ▶"},
    C:{gen:"G47", label:"히프 추적기", doneLabel:"유닛 C 숙달 ▶"},
    D:{gen:"G48", label:"종합 판정기", doneLabel:"유닛 D 숙달 ▶"}
  },
  ilNext: { A:"화요일 — 유닛 B ▶", B:"수요일 — 과외 ▶", C:"금요일 — 유닛 D ▶", D:"토요일 ▶" },
  ilMeta: { C:{header:"🌙 목요일 밤 — 밤 11시, 휴대폰이 운다"}, D:{header:"🌙 금요일 밤 — 보수동, 책방골목"} },
  tutorNextLabel:"목요일 밤 — 유닛 C ▶",
  tutorPassMsg:'나누는 기준이 데이터에 달렸으면 최악이 있고, 구조에 달렸으면 보장이 된다 — 오늘 이거 확실히 잡았어요. 아 맞다, 월요일 수업 끝에 <b>히프 정렬</b>이란 것도 지나갔었는데요. 히프면 트리 때 그거잖아요? 그것도 곧 부탁드려요.',

  /* ================= 자습 ================= */
  study: {
    A: { day:"월요일", label:"유닛 A", title:"퀵 정렬 — Divide and Conquer", doneLabel:"시련 — 퀵 분할 추적기 ▶", beats:[
      {say:'고급 정렬의 첫 번째. 이름부터 자신만만하다 — 퀵(quick). 어디서 그 속도가 나오는지부터 잡는다.', mood:"awkward"},
      {who:"book", say:'"이번 주 세 정렬을 관통하는 전략의 이름부터 — <b>분할 정복(divide and conquer)</b>. 큰 문제를 작은 문제로 <b>나누고(divide)</b>, 작은 것들을 각각 <b>해결한(conquer)</b> 뒤 합쳐 전체를 푸는 방법이다. 지난주의 세 정렬이 배열 전체를 붙들고 회전하던 것과 달리, 이제는 <b>문제 자체를 줄여 가며</b> 이긴다 — log n은 언제나 이 「반씩 줄이기」에서 나온다(9주차의 탐색 트리가 그랬듯이)."'},
      {who:"book", say:'"<b>퀵 정렬(quick sort)</b>은 divide and conquer의 첫 얼굴이고, 그 심장은 <b>분할(partition)</b>이다. 리스트에서 기준이 될 원소 — <b>피봇(pivot)</b> — 을 하나 고른다. 그리고 피봇보다 <b>작은 키는 전부 피봇 앞에</b>, <b>큰 키는 전부 피봇 뒤에</b> 오도록 재배치한다. 이 한 번으로 피봇은 <b>정확한 자기 자리</b>에 앉는다 — 왼쪽 전부가 저보다 작고 오른쪽 전부가 크니, 전체가 다 정렬돼도 그 자리는 변하지 않는다. 남은 일은? 피봇 앞뒤의 두 부리스트에 <b>같은 일을 재귀</b>로 반복하는 것뿐이다(6주차의 재귀가 여기서 다시 주인공이 된다)."'},
      {who:"book", say:'"키 순서로 줄을 세울 때를 떠올려 보라 — 한 명을 기준으로 세우고 「작으면 왼쪽, 크면 오른쪽」으로 가르면, 기준의 자리는 그 순간 확정된다. 피봇은 첫 번째 값·마지막 값·중간 값 어느 것이든 쓸 수 있고 무작위로 고르는 방법(무작위 퀵소트)도 있다 — 교재의 코드는 <b>첫 원소</b>를 쓴다. 이 선택이 나중에 중요한 복선이 된다."'},
      {check:{id:"c12A-1", stem:'퀵 정렬에서 <b>분할이 한 번 끝난 직후</b> 보장되는 것은?',
        okfb:'피봇의 자리가 확정된다 — 왼쪽은 전부 작고 오른쪽은 전부 크므로, 이후 어떤 정렬이 진행돼도 피봇은 움직이지 않는다.',
        choices:[
          {text:"피봇이 정확한 자기 자리에 앉고, 양쪽은 아직 미정렬이다",correct:true},
          {text:"배열의 앞쪽 절반이 완전히 정렬을 끝낸 상태가 된다",correct:false,mc:"half-myth",fb:"왼쪽은 '피봇보다 작다'만 보장 — 자기들끼리는 아직 뒤죽박죽이다."},
          {text:"최댓값과 최솟값이 배열의 양 끝에 각각 확정된다",correct:false,mc:"minmax-myth",fb:"확정되는 것은 피봇 하나 — 양 끝이 아니라 피봇의 자리다."},
          {text:"어긋난 이웃 쌍이 하나도 남지 않게 된다",correct:false,mc:"bubble-confuse",fb:"이웃의 질서는 버블의 목표 — 분할의 목표는 피봇 기준의 양분이다."}]}},
      {who:"book", say:'"분할은 어떻게 하나 — 도구는 <b>두 개의 손가락</b>이다. 왼손가락 <b>i</b>는 왼쪽 끝에서 오른쪽으로 걸으며 <b>「피봇보다 크거나 같은 값」</b>을 찾고, 오른손가락 <b>j</b>는 오른쪽 끝에서 왼쪽으로 걸으며 <b>「피봇보다 작거나 같은 값」</b>을 찾는다. 왜 그 값들인가 — 각각 <b>지금 잘못된 쪽에 서 있는 원소</b>이기 때문이다: 큰 값이 왼쪽에, 작은 값이 오른쪽에 있으면 안 되니까. 둘 다 찾으면 <b>맞바꾼다</b>(한 번의 교환으로 둘 다 제자리 쪽으로). 두 손가락이 서로를 지나치면 — 더 바꿀 것이 없다는 뜻, 분할 끝이다. 코드 전에, 네 개짜리 배열로 이 걸음을 손으로 한 번 보자."'},
      {steps:{code:["미니 예제 [20, 30, 10, 40] · 피봇 20","i → 30에서 멈춤 · j ← 10에서 멈춤 → 교환","i → 30 · j ← 10 — 서로 지나침(교차)","피봇 20 ↔ j의 자리 — 분할 완료"],
        frames:[
          {hl:0, viz:{type:"arr", a:[20,30,10,40], hi:[0], done:[], tags:["피봇","","",""]}, cap:'피봇 = 20. i는 왼쪽 끝에서, j는 오른쪽 끝 바깥에서 걷기 시작한다.'},
          {hl:1, viz:{type:"arr", a:[20,10,30,40], hi:[1,2], done:[], tags:["피봇","i","j",""]}, cap:'i: <b>30</b>(≥20, 잘못 왼쪽에 있다)에서 멈춤. j: 40(>20)을 지나 <b>10</b>(≤20, 잘못 오른쪽에 있다)에서 멈춤. 아직 i가 j보다 왼쪽 — <b>맞바꾼다</b>: [20, 10, 30, 40].'},
          {hl:2, viz:{type:"arr", a:[20,10,30,40], hi:[1,2], done:[], tags:["피봇","j","i",""]}, cap:'다시 걷는다. i: 30에서 멈춤([2]). j: 10에서 멈춤([1]). 이번엔 <b>i가 j를 지나쳤다(교차)</b> — 잘못 서 있는 원소가 더 없다는 뜻이다.'},
          {hl:3, viz:{type:"arr", a:[10,20,30,40], hi:[1], done:[1], tags:["","피봇","",""]}, cap:'마무리 — 피봇 20을 <b>j가 멈춘 자리([1])</b>와 맞바꾼다. 왼쪽엔 10(작다), 오른쪽엔 30·40(크다) — <b>피봇 자리 확정.</b> 이 네 걸음이 분할의 전부다.'}
        ]}},
      {who:"book", say:'"이제 같은 걸음을 코드로 옮긴다 — 한 번에 다 읽지 말고, <b>세 구역</b>으로 끊어 읽자. 먼저 <b>준비 구역</b>:"',
       code:["if(left < right){            /* 원소가 2개 이상일 때만 일할 것이 있다 */","    i = left;                /* 왼손가락 — 피봇 자리에서 출발 */","    j = right + 1;           /* 오른손가락 — 오른쪽 끝 '바깥'에서 출발 */","    pivot = list[left].key;  /* 첫 원소가 피봇 */"]},
      {who:"book", say:'"왜 i는 피봇 자리, j는 <b>배열 바깥</b>에서 출발하나 — 다음 구역의 손가락 걸음이 <b>「먼저 한 칸 움직이고, 그다음 본다」</b>이기 때문이다(do가 i++·j--를 비교보다 먼저 한다). 첫걸음에 i는 list[left+1]부터, j는 list[right]부터 보게 되니, 출발점을 한 칸씩 바깥에 두는 것이다. 이제 <b>걸음 구역</b> — 미니 예제에서 손가락이 하던 그 일이 두 줄이 된다:"',
       code:["do { i++; } while(list[i].key < pivot);   /* 피봇보다 작으면 통과 — 크거나 같으면 멈춤 */","do { j--; } while(list[j].key > pivot);   /* 피봇보다 크면 통과 — 작거나 같으면 멈춤 */"]},
      {who:"book", say:'"읽는 법: while의 조건은 <b>「계속 걷는 조건」</b>이다. i는 「피봇보다 작다」인 동안 걷는다 — 즉 <b>피봇 이상을 만나면 멈춘다</b>(왼쪽에 있어선 안 되는 값 발견). j는 「피봇보다 크다」인 동안 걷는다 — <b>피봇 이하를 만나면 멈춘다</b>(오른쪽에 있어선 안 되는 값 발견). 두 줄은 결국 <b>「잘못 서 있는 원소 탐지기」</b> 한 쌍이다. 마지막 <b>마무리 구역</b> — 멈춘 다음의 처리:"',
       code:["    if(i < j) SWAP(list[i], list[j], temp);   /* 아직 안 지나쳤으면 — 둘을 맞바꾼다 */","} while(i < j);                               /* 지나쳤으면(교차) 걸음 끝 */","SWAP(list[left], list[j], temp);              /* 피봇 ↔ list[j] — 피봇 안착 */","quicksort(list, left, j-1);                   /* 왼쪽 부리스트에 같은 일을 */","quicksort(list, j+1, right);                  /* 오른쪽 부리스트에도 — 피봇은 빠진다 */"]},
      {who:"book", say:'"세 가지만 짚는다. ① 교환은 <b>i&lt;j일 때만</b> — 교차한 뒤의 교환은 이미 제자리인 원소를 되돌린다. ② 피봇이 앉는 자리는 <b>j</b>다: j는 「피봇 이하」에서만 멈추는 손가락이니, 교차가 끝난 순간의 j는 <b>피봇 이하 구역의 마지막 자리</b> — 정확히 피봇이 앉아야 할 경계다(i 자리는 피봇 이상 구역이라 앉히면 질서가 깨진다). ③ 재귀는 피봇을 <b>빼고</b> 양쪽에 — 확정된 자리는 다시 보지 않는다. 이것이 divide: 분할이 divide고, 양쪽 재귀가 conquer다."'},
      {check:{id:"c12A-2", stem:'분할의 마지막 교환이 <span class="mono">SWAP(list[left], list[j])</span> — i가 아니라 <b>j</b>인 이유는?',
        okfb:'j는 「피봇 이하」에서 멈추는 손가락 — 교차 후의 j 자리는 피봇 이하 구역의 끝, 즉 피봇이 앉아야 할 자리다.',
        choices:[
          {text:"j가 멈춘 곳이 피봇 이하 구역의 마지막 자리이기 때문",correct:true},
          {text:"i는 이미 배열의 끝을 지나 사라져 버렸기 때문",correct:false,mc:"gone-myth",fb:"i도 유효한 자리에 있다 — 다만 i 자리는 '피봇 이상'이라 피봇을 두면 질서가 깨진다."},
          {text:"i와 j가 교차하면 언제나 같은 칸을 가리키기 때문",correct:false,mc:"same-myth",fb:"교차란 서로 지나쳤다는 뜻 — 같은 칸이 아니라 어긋난 두 칸이다."},
          {text:"왼쪽 손가락보다 오른쪽 손가락이 항상 빠르기 때문",correct:false,mc:"speed-myth",fb:"속도의 문제가 아니라 '피봇 이하의 경계'가 j라는 논리의 문제다."}]}},
      {who:"book", say:'"이제 세 구역을 이어 붙여, 책의 예제 — 열 개짜리 배열의 첫 분할을 <b>실제 코드 줄을 밟으며</b> 따라간다. 그림 아래의 i·j 표시가 두 손가락의 현재 위치다. 피봇은 첫 원소 26."'},
      {steps:{code:["i = left;  j = right+1;  pivot = list[left].key;","do {","    do { i++; } while(list[i].key < pivot);","    do { j--; } while(list[j].key > pivot);","    if(i < j) SWAP(list[i], list[j], temp);","} while(i < j);","SWAP(list[left], list[j], temp);","quicksort(list, left, j-1);  quicksort(list, j+1, right);"],
        frames:[
          {hl:0, viz:{type:"arr", a:[26,5,37,1,61,11,59,15,48,19], hi:[0], done:[], tags:["피봇·i","","","","","","","","",""]}, cap:'준비 — 피봇 = 26, i = [0], j = 배열 바깥([10]). 두 손가락 모두 "먼저 한 칸 움직이고 본다".'},
          {hl:2, viz:{type:"arr", a:[26,5,37,1,61,11,59,15,48,19], hi:[2], done:[], tags:["피봇","","i","","","","","","",""]}, cap:'i의 걸음: [1]의 5는 26보다 작다 — 통과. [2]의 <b>37은 크다 — 멈춤</b>(왼쪽에 있어선 안 되는 값 발견). i = 2.'},
          {hl:3, viz:{type:"arr", a:[26,5,37,1,61,11,59,15,48,19], hi:[2,9], done:[], tags:["피봇","","i","","","","","","","j"]}, cap:'j의 걸음: [9]의 <b>19는 26보다 작다 — 첫걸음에 멈춤</b>(오른쪽에 있어선 안 되는 값 발견). j = 9.'},
          {hl:4, viz:{type:"arr", a:[26,5,19,1,61,11,59,15,48,37], hi:[2,9], done:[], tags:["피봇","","i","","","","","","","j"]}, cap:'i(2) &lt; j(9) — 아직 안 지나쳤다. <b>SWAP: 37 ↔ 19.</b> 큰 37은 오른쪽으로, 작은 19는 왼쪽으로 — 한 번의 교환으로 둘 다 제 구역에.'},
          {hl:4, viz:{type:"arr", a:[26,5,19,1,15,11,59,61,48,37], hi:[4,7], done:[], tags:["피봇","","","","i","","","j","",""]}, cap:'do-while이 반복된다. i: 1을 지나 <b>61</b>에서 멈춤(i=4). j: 48·61을 지나 <b>15</b>에서 멈춤(j=7). 아직 i&lt;j — <b>SWAP: 61 ↔ 15.</b>'},
          {hl:5, viz:{type:"arr", a:[26,5,19,1,15,11,59,61,48,37], hi:[5,6], done:[], tags:["피봇","","","","","j","i","","",""]}, cap:'한 번 더. i: <b>59</b>에서 멈춤(i=6). j: 59를 지나 <b>11</b>에서 멈춤(j=5). 이번엔 <b>i(6) &gt; j(5) — 교차.</b> 교환 없이 while(i&lt;j)가 거짓 — 걸음 끝.'},
          {hl:6, viz:{type:"arr", a:[11,5,19,1,15,26,59,61,48,37], hi:[5], done:[5], tags:["","","","","","피봇","","","",""]}, cap:'마무리 — 피봇 26 ↔ list[j]=list[5]의 11. <b>26이 [5]에 확정</b>: 왼쪽 다섯(11,5,19,1,15)은 전부 작고, 오른쪽 넷(59,61,48,37)은 전부 크다.'},
          {hl:7, viz:{type:"arr", a:[1,5,11,15,19,26,37,48,59,61], hi:[], done:[0,1,2,3,4,5,6,7,8,9]}, cap:'conquer — [11,5,19,1,15]와 [59,61,48,37]에 각각 같은 분할을 재귀. 분할될 때마다 피봇이 하나씩 확정되며 <b>[1,5,11,15,19,26,37,48,59,61]</b>로 끝난다.'}
        ]}},
      {check:{id:"c12A-3", stem:'<b>이미 정렬된 배열</b>에 첫 원소 피봇 퀵 정렬을 쓰면 <b>최악 O(n²)</b>이 된다. 이유는?',
        okfb:'피봇(첫 원소)이 항상 최솟값 — 왼쪽 부리스트가 비고 분할이 0:(n−1)로 쏠려, 깊이가 log n이 아니라 n이 된다.',
        choices:[
          {text:"분할이 매번 0 : (n−1)로 쏠려 재귀 깊이가 n이 되므로",correct:true},
          {text:"정렬된 배열에서는 어긋난 쌍이 많아 교환 횟수가 최대로 늘어나므로",correct:false,mc:"swap-myth",fb:"교환은 오히려 거의 없다 — 문제는 쏠린 분할의 깊이다."},
          {text:"피봇과 값이 같은 원소가 많아져 비교가 한없이 되풀이되므로",correct:false,mc:"equal-myth",fb:"같은 값의 문제가 아니라 피봇이 항상 극단값이 되는 문제다."},
          {text:"재귀 호출 자체가 반복문보다 근본적으로 느리므로",correct:false,mc:"recur-myth",fb:"재귀가 죄가 아니다 — 반반 분할이면 재귀로도 O(n log n)이다."}]}},
      {who:"book", say:'"성능 정리. 분할이 반반에 가까우면 깊이 log₂n × 층마다 훑기 n = <b>평균 O(n log n)</b> — 단순 정렬의 O(n²)와는 차원이 다르다(n=1,000이면 만 번 대 백만 번). 추가 배열도 없다(제자리). 그래서 <b>실전 라이브러리 정렬의 근간</b>이다. 약점 둘 — 방금 본 <b>최악 O(n²)</b>(처방: 중간 값·무작위 피봇), 그리고 피봇 교환이 멀리 건너뛰어 <b>불안정</b>. 「가장 빠른 것」과 「언제나 빠른 것」은 다르다 — 이 문장이 이번 주 전체를 관통한다."'}
    ]},

    B: { day:"화요일", label:"유닛 B", title:"합병 정렬 — 합치는 것은 쉽다", doneLabel:"시련 — 합병 추적기 ▶", beats:[
      {say:'두 번째. 같은 분할 정복인데 무게중심이 반대다 — 퀵이 "나누기가 전부"였다면, 이번엔 나누기는 거저고 합치기가 전부다.', mood:"proud"},
      {who:"book", say:'"출발점은 이 관찰이다 — <b>이미 정렬된 두 리스트를 하나로 합치는 일(merge)은 쉽다.</b> 두 줄로 선 손님을 한 줄로 만들 때처럼, <b>두 줄의 맨 앞끼리 비교해 작은 쪽을 꺼내</b> 담기를 반복하면 끝이다. 원소마다 한 번씩만 옮기니 비용도 싸다. 그런데 — <b>길이 1짜리 리스트는 이미 정렬되어 있다.</b> 그렇다면 n개의 원소를 길이 1의 정렬 리스트 n개로 보고, <b>쌍쌍이 합병</b>해 길이 2로, 다시 길이 4로… 하나가 될 때까지 반복하면? 그것이 <b>반복 합병 정렬(iterative merge sort)</b>이다."'},
      {check:{id:"c12B-1", stem:'반복 합병 정렬이 <b>길이 1의 리스트 n개</b>에서 출발할 수 있는 근거는?',
        okfb:'원소 하나짜리 리스트는 그 자체로 정렬 상태 — 합병의 전제(두 입력이 정렬돼 있을 것)가 공짜로 성립한다.',
        choices:[
          {text:"원소 하나짜리 리스트는 이미 정렬된 상태이기 때문",correct:true},
          {text:"길이 1이면 비교 없이 무작위로 합쳐도 되기 때문",correct:false,mc:"random-myth",fb:"합병은 언제나 비교로 진행된다 — 공짜인 것은 '정렬돼 있음'이라는 전제다."},
          {text:"작은 리스트일수록 정렬 속도가 빨라지기 때문",correct:false,mc:"small-myth",fb:"속도의 이야기가 아니라 '이미 정렬됨'이라는 성질의 이야기다."},
          {text:"n개로 나누면 재귀 호출이 필요 없어지기 때문",correct:false,mc:"recur-myth",fb:"반복 구현의 장점이긴 하나, 출발의 근거는 길이 1 = 정렬 완료다."}]}},
      {who:"book", say:'"합병의 코드부터. 손가락 세 개 — 첫 리스트의 i, 둘째의 j, 결과의 k."',
       code:["void merge(element list[], element sorted[], int i, int m, int n){","    /* 정렬된 (list[i..m])과 (list[m+1..n])을 합병해 sorted[i..n]으로 */","    int j, k, t;","    j = m+1;                       /* 둘째 리스트의 손가락 */","    k = i;                         /* 결과 리스트의 손가락 */","    while(i<=m && j<=n){           /* 둘 다 남아 있는 동안 */","        if(list[i].key<=list[j].key) sorted[k++]=list[i++];","        else sorted[k++]=list[j++];","    }","    if(i>m) for(t=j;t<=n;t++) sorted[k+t-j]=list[t];   /* 둘째의 잔량 복사 */","    else    for(t=i;t<=m;t++) sorted[k+t-i]=list[t];   /* 첫째의 잔량 복사 */","}"]},
      {who:"book", say:'"두 군데를 눈여겨보라. ⑦의 비교가 <b>&lt;= (같으면 앞 리스트 우선)</b>이다 — 같은 키일 때 원래 앞에 있던 쪽이 먼저 나가므로, 이 부등호 하나가 합병 정렬을 <b>안정</b>하게 만든다. 그리고 ⑩⑪ — 한쪽이 먼저 바닥나면 비교를 멈추고 남은 쪽을 <b>통째로 복사</b>한다: 남은 쪽은 이미 정렬돼 있고 전부 지금까지 담은 것보다 크니, 견줄 필요가 없다."'},
      {check:{id:"c12B-2", stem:'merge의 비교 <span class="mono">list[i].key <= list[j].key</span> 에서 <b>등호(=)</b>가 하는 일은?',
        okfb:'같은 키면 앞 리스트(원래 앞에 있던 쪽)가 먼저 나간다 — 원래 순서 보존, 즉 안정성의 근원이다.',
        choices:[
          {text:"같은 키일 때 앞 리스트를 우선해 안정성을 지킨다",correct:true},
          {text:"같은 값을 하나로 합쳐 중복을 제거해 준다",correct:false,mc:"dedup-myth",fb:"합병은 원소를 버리지 않는다 — 순서만 정한다."},
          {text:"비교 횟수를 절반으로 줄여 속도를 높인다",correct:false,mc:"speed-myth",fb:"횟수는 그대로다 — 등호가 정하는 것은 같은 키의 순서다."},
          {text:"무한 반복을 막는 안전장치 역할을 한다",correct:false,mc:"guard-myth",fb:"반복은 i·j의 전진이 끝낸다 — 등호는 순서의 문제다."}]}},
      {who:"book", say:'"이제 한 회전(pass)과 전체. merge_pass는 길이 length의 인접 쌍들을 전부 합병하는 <b>한 회전</b>이고, merge_sort는 length를 1, 2, 4…로 키우며 그 회전을 반복한다."',
       code:["void merge_pass(element list[], element sorted[], int n, int length){","    int i, j;","    for(i = 0; i <= n - 2*length; i += 2*length)","        merge(list, sorted, i, i+length-1, i+2*length-1);   /* 꽉 찬 쌍 */","    if(i+length < n)","        merge(list, sorted, i, i+length-1, n-1);   /* 쌍은 되지만 둘째가 짧다 */","    else","        for(j = i; j < n; j++) sorted[j] = list[j];  /* 외톨이 — 그대로 복사 */","}","void merge_sort(element list[], int n){","    int length = 1;  element extra[MAX_SIZE];","    while(length < n){","        merge_pass(list, extra, n, length);  length *= 2;","        merge_pass(extra, list, n, length);  length *= 2;   /* 핑퐁 — 다시 list로 */","    }","}"]},
      {who:"book", say:'"merge_pass의 꼬리 처리 셋: 꽉 찬 쌍 / 둘째가 짧은 쌍 / <b>짝 없는 외톨이는 그대로 복사</b>(버려지는 원소는 없다 — 다음 회전에서 짝을 만난다). merge_sort는 결과를 담을 <b>추가 배열 extra</b>와 원본을 <b>번갈아(핑퐁)</b> 쓴다 — list→extra, extra→list를 한 몸처럼 돌리니 회전이 끝날 때마다 결과가 제자리로 돌아온다. 이 추가 배열이 합병 정렬의 대가다."'},
      {who:"book", say:'"책의 예제 — 열 개짜리 배열이 네 번의 회전으로 끝나는 전 과정이다."'},
      {steps:{code:["출발 — 길이 1의 정렬 리스트 10개","1회전(길이 1→2): 쌍쌍이 합병","2회전(길이 2→4): 다시 쌍쌍 — [19,48]은 외톨이","3회전(길이 4→8): [19,48]은 또 외톨이","4회전(길이 8→16): 마지막 합병 — 완성"],
        frames:[
          {hl:0, viz:{type:"arr", a:[26,5,77,1,61,11,59,15,48,19], hi:[], done:[]}, cap:'[26][5][77][1][61][11][59][15][48][19] — 하나짜리 10개. 이미 전부 "정렬된 리스트"다.'},
          {hl:1, viz:{type:"arr", a:[5,26,1,77,11,61,15,59,19,48], hi:[], done:[], sep:[2,4,6,8]}, cap:'이웃끼리 합병 — [5,26] [1,77] [11,61] [15,59] [19,48]. 길이 2가 다섯.'},
          {hl:2, viz:{type:"arr", a:[1,5,26,77,11,15,59,61,19,48], hi:[], done:[], sep:[4,8]}, cap:'다시 쌍쌍 — [1,5,26,77] [11,15,59,61]. <b>[19,48]은 짝이 없어 그대로 복사</b> — 다음 회전을 기다린다.'},
          {hl:3, viz:{type:"arr", a:[1,5,11,15,26,59,61,77,19,48], hi:[], done:[], sep:[8]}, cap:'[1,5,26,77]+[11,15,59,61] → 길이 8 하나. [19,48]은 이번에도 외톨이 — 두 번 기다렸지만 잃은 것은 없다.'},
          {hl:4, viz:{type:"arr", a:[1,5,11,15,19,26,48,59,61,77], hi:[], done:[0,1,2,3,4,5,6,7,8,9]}, cap:'마지막 합병 — <b>[1,5,11,15,19,26,48,59,61,77]</b>. 회전 4번 × 회전당 모든 원소 한 번씩 = 이것이 O(n log n)의 몸통이다.'}
        ]}},
      {check:{id:"c12B-3", stem:'반복 합병 정렬에서 <b>부리스트의 수가 홀수</b>라 짝이 없는 마지막 부리스트는?',
        okfb:'그대로 복사되어 다음 회전에서 짝을 만난다 — 방금 스텝의 [19, 48]이 두 회전을 기다린 그 예다.',
        choices:[
          {text:"그대로 복사되어 다음 회전에서 합병을 기다린다",correct:true},
          {text:"앞의 두 부리스트와 셋이 한꺼번에 합병된다",correct:false,mc:"triple-myth",fb:"merge는 언제나 둘만 합친다 — 3자 합병 분기는 없다."},
          {text:"버려졌다가 맨 마지막에 삽입 정렬로 끼워 넣는다",correct:false,mc:"discard-myth",fb:"버려지는 원소는 없다 — 복사로 살아남아 기다린다."},
          {text:"반으로 쪼개져 자기들끼리 한 번 더 합병된다",correct:false,mc:"split-myth",fb:"이미 정렬된 부리스트 — 쪼갤 이유가 없다."}]}},
      {who:"book", say:'"성능과 쓰임. 회전 수는 길이가 1→2→4→…로 n을 넘을 때까지 <b>⌈log₂n⌉</b>번, 회전마다 모든 원소가 꼭 한 번 이동 — 그래서 <b>최선도 평균도 최악도 O(n log n)</b>이다. 입력 순서가 비용을 흔들지 못한다: 퀵에게 없는 <b>보장</b>이다. 게다가 <b>안정</b>. 대가는 추가 배열 O(n) 하나. 앞뒤로만 읽고 쓰는 성질 덕에 <b>연결 리스트</b>와 <b>외부 정렬</b>(주기억장치에 다 안 들어가는 파일 — 유닛 A의 그 어휘)의 표준이기도 하다."'}
    ]},

    C: { day:"목요일", label:"유닛 C", title:"히프 정렬 — 트리를 빌려 온 정렬", doneLabel:"시련 — 히프 추적기 ▶", beats:[
      {say:'세 번째. 낯익은 얼굴이다 — 6주차에서 만든 그 히프. "정렬에 다시 쓴다"던 예고를 회수할 시간이다.', mood:"proud"},
      {who:"book", say:'"기억을 꺼내자 — <b>max 히프</b>(9주차): 완전 이진 트리이면서 <b>모든 부모 ≥ 자식</b>. 배열의 <b>1번 칸부터</b> 담으면 i의 자식은 2i와 2i+1, 부모는 i/2였다. 그리고 최댓값은 언제나 루트(1번 칸)에 있다. <b>히프 정렬(heap sort)</b>은 이 성질을 정렬에 빌려 온다: ① 배열 전체를 <b>최대 히프로 구성</b>한다 ② <b>루트(최댓값)를 하나씩 꺼내</b> 배열 뒤에서부터 채운다. 큰 것부터 뒤로 쌓이니, 다 꺼내면 앞에서부터 오름차순이다."'},
      {check:{id:"c12C-1", stem:'히프 정렬의 <b>두 단계</b>를 바르게 말한 것은?',
        okfb:'구성(전체를 max 히프로) → 추출(루트를 꺼내 뒤에서부터 채우기) — 큰 값부터 뒤로 쌓여 오름차순이 완성된다.',
        choices:[
          {text:"최대 히프로 구성한 뒤, 루트를 하나씩 꺼내 뒤부터 채운다",correct:true},
          {text:"배열을 반으로 나눠 각각 히프를 만든 뒤 다시 합병한다",correct:false,mc:"merge-confuse",fb:"쪼개고 합치는 것은 합병 정렬 — 히프는 한 배열 안의 2단계다."},
          {text:"최솟값을 골라 앞과 교환하기를 반복한다",correct:false,mc:"select-confuse",fb:"그건 선택 정렬 — 히프는 트리 질서로 최댓값을 뽑는다."},
          {text:"피봇을 루트로 삼아 좌우 부트리로 분할한다",correct:false,mc:"quick-confuse",fb:"피봇 분할은 퀵 — 히프의 질서는 부모 ≥ 자식이다."}]}},
      {who:"book", say:'"도구는 하나면 된다 — <b>adjust</b>: 루트만 어긋났을 수 있는 트리를 받아, 루트 값을 <b>내려보내</b> 히프로 고치는 함수다. 9주차 delete_max에서 마지막 원소를 루트로 올린 뒤 하던 그 일 — 두 자식 중 <b>큰 쪽</b>과 비교하고, 자식이 크면 자식을 끌어올리며 한 층 내려간다."',
       code:["void adjust(element list[], int root, int n){","    int child, rootkey;  element temp;","    temp = list[root];  rootkey = list[root].key;","    child = 2*root;                    /* 왼쪽 자식 (1번 칸 규약) */","    while(child <= n){","        if((child < n) && (list[child].key < list[child+1].key))","            child++;                   /* 두 자식 중 큰 쪽을 고른다 */","        if(rootkey > list[child].key) break;   /* 질서 회복 — 멈춤 */","        else { list[child/2] = list[child];  child *= 2; }  /* 자식을 올리고 하강 */","    }","    list[child/2] = temp;              /* 멈춘 자리에 안착 */","}","void heapsort(element list[], int n){","    int i, j;  element temp;","    for(i = n/2; i > 0; i--) adjust(list, i, n);   /* ① 구성 — 아래에서 위로 */","    for(i = n-1; i > 0; i--){","        SWAP(list[1], list[i+1], temp);   /* ② 최댓값을 맨 뒤로 */","        adjust(list, 1, i);               /*    줄어든 히프의 질서 복구 */","    }","}"]},
      {who:"book", say:'"heapsort의 두 for가 두 단계다. ⑮ 구성이 <b>i = n/2부터 거꾸로</b>인 이유 — 잎(자식 없는 노드)은 홀로 이미 히프라 손볼 게 없고, adjust는 「양쪽 부트리는 히프」일 때만 통하므로 <b>아래를 먼저 다져야 위가 성립</b>한다. ⑰ SWAP(list[1], list[i+1])이 곧 「꺼내기」다 — 루트의 최댓값과 현재 마지막을 맞바꾸면 최댓값이 뒤에 확정되고, ⑱ 히프의 범위를 i로 줄여 adjust — 확정 구역은 이제 히프 밖이다."'},
      {check:{id:"c12C-2", stem:'구성 단계가 <span class="mono">i = n/2</span> 부터 <b>거꾸로</b> 내려오는 이유는?',
        okfb:'n/2 뒤는 전부 잎 — 홀로 이미 히프다. 그리고 adjust는 아래가 히프일 때만 통하므로, 아래부터 다져 올라간다.',
        choices:[
          {text:"잎은 이미 히프이고, adjust는 아래가 히프일 때만 통하므로",correct:true},
          {text:"뒤쪽 절반의 칸들에 큰 값이 몰려 있을 가능성이 높기 때문에",correct:false,mc:"value-myth",fb:"값의 분포와 무관 — 잎/내부 노드라는 구조의 문제다."},
          {text:"앞에서부터 돌면 반복 횟수가 두 배로 늘어나므로",correct:false,mc:"count-myth",fb:"횟수가 아니라 성립의 문제 — 아래가 히프여야 내려보내기가 옳다."},
          {text:"배열의 마지막 원소가 언제나 최솟값이므로",correct:false,mc:"minlast-myth",fb:"그런 보장은 없다 — 잎이 '홀로 히프'라는 것이 핵심이다."}]}},
      {who:"book", say:'"책의 예제 — 열 개짜리 배열을 구성하고, 두 번 꺼내 본다. 히프는 마음속으로 <b>트리</b>인 정렬이니, 이번 스텝은 배열 상자 대신 <b>트리 그림</b>으로 단계를 본다(배열 모습은 설명에 병기 — [k]의 자식이 [2k]·[2k+1]이라는 번역 규칙만 기억하면 둘은 같은 것이다)."'},
      {steps:{code:["출발 — 배열 [26,5,77,1,61,11,59,15,48,19]을 트리로 읽는다","① 구성: adjust(5) → adjust(4) — 아래층부터 다진다","   구성: adjust(3) → adjust(2)","   구성: adjust(1) — 최대 히프 완성","② 추출 1: SWAP([1],[10]) 후 adjust(1, 9) — 77 확정","   추출 2: SWAP([1],[9]) 후 adjust(1, 8) — 61 확정","…같은 꺼내기를 반복 — 완성"],
        frames:[
          {hl:0, viz:{type:"tree", data:{v:26,c:[{v:5,c:[{v:1,c:[{v:15},{v:48}]},{v:61,c:[{v:19}]}]},{v:77,c:[{v:11},{v:59}]}]}}, cap:'배열을 트리로 읽은 모습 — 루트 [1]=26, [k]의 자식은 [2k]·[2k+1]. 곳곳에서 부모 &lt; 자식(26&lt;77, 1&lt;48, 5&lt;61…) — 아직 히프가 아니다. <b>자식 있는 노드는 [1]~[5]의 다섯</b> — 이들만 아래층부터 손보면 된다.'},
          {hl:1, viz:{type:"tree", data:{v:26,c:[{v:5,c:[{v:48,hl:true,c:[{v:15},{v:1,hl:true}]},{v:61,c:[{v:19}]}]},{v:77,c:[{v:11},{v:59}]}]}}, cap:'adjust(5): 61 ≥ 19 — 이미 히프, 통과. adjust(4): 1이 자식 15·48 중 <b>큰 쪽 48</b>보다 작다 → 48이 올라오고 <b>1은 잎으로 내려간다</b>. 배열은 [26,5,77,48,61,11,59,15,1,19].'},
          {hl:2, viz:{type:"tree", data:{v:26,c:[{v:61,hl:true,c:[{v:48,c:[{v:15},{v:1}]},{v:19,hl:true,c:[{v:5,hl:true}]}]},{v:77,c:[{v:11},{v:59}]}]}}, cap:'adjust(3): 77 ≥ 11·59 — 통과. adjust(2): 5가 자식 48·61 중 큰 61보다 작다 → 61이 올라오고, 5는 다음 층에서도 19보다 작아 <b>두 층을 내려가 잎에 안착</b>. 배열은 [26,61,77,48,19,11,59,15,1,5].'},
          {hl:3, viz:{type:"tree", data:{v:77,hl:true,c:[{v:61,c:[{v:48,c:[{v:15},{v:1}]},{v:19,c:[{v:5}]}]},{v:59,hl:true,c:[{v:11},{v:26,hl:true}]}]}}, cap:'adjust(1): 루트 26이 자식 61·77 중 큰 <b>77</b>보다 작다 → 77이 올라오고, 26은 다음 층에서도 59보다 작아 또 내려간다 — <b>큰 자식의 길을 따라 두 층 하강</b>. <b>구성 완료</b>: [77,61,59,48,19,11,26,15,1,5] — 모든 부모 ≥ 자식, 최댓값 77이 루트에.'},
          {hl:4, viz:{type:"tree", data:{v:61,hl:true,c:[{v:48,hl:true,c:[{v:15,hl:true,c:[{v:5,hl:true},{v:1}]},{v:19,c:[{v:77,dim:true,tag:"확정"}]}]},{v:59,c:[{v:11},{v:26}]}]}}, cap:'추출 1: 루트 77과 마지막 [10]의 5를 교환 — <b>77은 트리 밖(맨 뒤 확정 구역)으로</b>. 루트에 올라온 5를 adjust(1, 9): 61 → 48 → 15의 큰 자식 길을 따라 세 층 하강, [8]에 안착. 배열은 [61,48,59,15,19,11,26,5,1 | <b>77</b>].'},
          {hl:5, viz:{type:"tree", data:{v:59,hl:true,c:[{v:48,c:[{v:15,c:[{v:5},{v:61,dim:true,tag:"확정"}]},{v:19,c:[{v:77,dim:true,tag:"확정"}]}]},{v:26,hl:true,c:[{v:11},{v:1,hl:true}]}]}}, cap:'추출 2: 루트 61과 현재 마지막 [9]의 1을 교환 — <b>61 확정</b>(흐린 노드들이 확정 구역). 1을 adjust(1, 8): 59 → 26의 길로 내려가 [7]에 안착. 배열은 [59,48,26,15,19,11,1,5 | 61, 77]. <b>트리가 한 칸씩 줄어드는 것</b>에 주목.'},
          {hl:6, viz:{type:"arr", a:[1,5,11,15,19,26,48,59,61,77], hi:[], done:[0,1,2,3,4,5,6,7,8,9], base:1}, cap:'같은 꺼내기를 아홉 번 — 뒤에서부터 큰 순서로 쌓여 <b>[1,5,11,15,19,26,48,59,61,77]</b> 완성. 꺼내기 한 번 = 내려보내기 한 번(≤ 트리 높이 log₂n층)이니 전체 O(n log n).'}
        ]}},
      {check:{id:"c12C-3", stem:'구성 직후의 히프에서 <b>추출을 1회</b> 수행하면, 배열의 <b>맨 뒤 칸</b>에 확정되는 값은?',
        okfb:'SWAP(list[1], list[n]) — 루트에 있던 전체 최댓값이 맨 뒤로 가 확정된다. 그 자리는 이후 히프 밖이다.',
        choices:[
          {text:"전체의 최댓값 (구성 직후 루트에 있던 값)",correct:true},
          {text:"전체의 최솟값 — 작은 것부터 확정해야 하므로",correct:false,mc:"min-flip",fb:"max 히프의 루트는 최댓값 — 뒤에서부터 큰 순서로 쌓인다."},
          {text:"마지막 잎에 있던 값 — 그 자리가 비므로",correct:false,mc:"leaf-myth",fb:"마지막 잎의 값은 루트로 올라가 내려보내기를 겪는다 — 뒤에 남는 것은 최댓값이다."},
          {text:"두 자식 중 큰 쪽의 값",correct:false,mc:"child-myth",fb:"자식이 아니라 루트가 나간다 — 자식은 질서 복구에 쓰인다."}]}},
      {who:"book", say:'"쓰임. 히프 정렬은 <b>어떤 입력에도 O(n log n)</b>(트리 높이가 비용을 묶는다) 이면서 <b>추가 배열이 없다</b>(제자리) — 합병의 보장과 퀵의 제자리를 하나씩 가져온 제3의 선택지다. 메모리가 빠듯한데 최악 보장까지 필요할 때 찾게 된다. 대가는 루트↔마지막의 긴 교환이 순서를 흩뜨리는 <b>불안정</b>. …이로써 세 명의 O(n log n)이 모였다. 내일, 표 하나로 전부 정리한다."'}
    ]},

    D: { day:"금요일", label:"유닛 D", title:"종합 비교 — 고르는 눈의 완성", doneLabel:"시련 — 종합 판정기 ▶", beats:[
      {say:'마지막 자습. 새 알고리즘은 없다 — 대신 2주간의 여섯을 한 장의 표로 세운다. 유닛 A의 그 문장이 돌아올 차례다: "만능 정렬은 없다."', mood:"proud"},
      {who:"book", say:'"표부터. 이 한 장이 2주의 요약이다.<br><br><table style="border-collapse:collapse;font-size:13px;width:100%;"><tr style="color:var(--accent);"><th style="border:1px solid var(--line);padding:5px 7px;">정렬</th><th style="border:1px solid var(--line);padding:5px 7px;">최선</th><th style="border:1px solid var(--line);padding:5px 7px;">평균</th><th style="border:1px solid var(--line);padding:5px 7px;">최악</th><th style="border:1px solid var(--line);padding:5px 7px;">안정</th><th style="border:1px solid var(--line);padding:5px 7px;">추가 메모리</th></tr><tr><td style="border:1px solid var(--line);padding:5px 7px;">선택</td><td style="border:1px solid var(--line);padding:5px 7px;">O(n²)</td><td style="border:1px solid var(--line);padding:5px 7px;">O(n²)</td><td style="border:1px solid var(--line);padding:5px 7px;">O(n²)</td><td style="border:1px solid var(--line);padding:5px 7px;">×</td><td style="border:1px solid var(--line);padding:5px 7px;">없음</td></tr><tr><td style="border:1px solid var(--line);padding:5px 7px;">버블(개선)</td><td style="border:1px solid var(--line);padding:5px 7px;"><b>O(n)</b></td><td style="border:1px solid var(--line);padding:5px 7px;">O(n²)</td><td style="border:1px solid var(--line);padding:5px 7px;">O(n²)</td><td style="border:1px solid var(--line);padding:5px 7px;">○</td><td style="border:1px solid var(--line);padding:5px 7px;">없음</td></tr><tr><td style="border:1px solid var(--line);padding:5px 7px;">삽입</td><td style="border:1px solid var(--line);padding:5px 7px;"><b>O(n)</b></td><td style="border:1px solid var(--line);padding:5px 7px;">O(n²)</td><td style="border:1px solid var(--line);padding:5px 7px;">O(n²)</td><td style="border:1px solid var(--line);padding:5px 7px;">○</td><td style="border:1px solid var(--line);padding:5px 7px;">없음</td></tr><tr><td style="border:1px solid var(--line);padding:5px 7px;">퀵</td><td style="border:1px solid var(--line);padding:5px 7px;">O(n log n)</td><td style="border:1px solid var(--line);padding:5px 7px;"><b>O(n log n)</b></td><td style="border:1px solid var(--line);padding:5px 7px;"><b style="color:var(--accent);">O(n²)</b></td><td style="border:1px solid var(--line);padding:5px 7px;">×</td><td style="border:1px solid var(--line);padding:5px 7px;">없음*</td></tr><tr><td style="border:1px solid var(--line);padding:5px 7px;">합병</td><td style="border:1px solid var(--line);padding:5px 7px;">O(n log n)</td><td style="border:1px solid var(--line);padding:5px 7px;">O(n log n)</td><td style="border:1px solid var(--line);padding:5px 7px;"><b>O(n log n)</b></td><td style="border:1px solid var(--line);padding:5px 7px;">○</td><td style="border:1px solid var(--line);padding:5px 7px;"><b>O(n)</b></td></tr><tr><td style="border:1px solid var(--line);padding:5px 7px;">히프</td><td style="border:1px solid var(--line);padding:5px 7px;">O(n log n)</td><td style="border:1px solid var(--line);padding:5px 7px;">O(n log n)</td><td style="border:1px solid var(--line);padding:5px 7px;"><b>O(n log n)</b></td><td style="border:1px solid var(--line);padding:5px 7px;">×</td><td style="border:1px solid var(--line);padding:5px 7px;">없음</td></tr></table><br>(*퀵의 재귀 스택은 논외로 두는 관례를 따른다.) 강조된 칸 하나 — 퀵의 최악 — 가 이 표에서 가장 많은 이야기를 담고 있다."'},
      {check:{id:"c12D-1", stem:'표에서 <b>어떤 입력에도 O(n log n)이 보장</b>되는(최악이 없는) 정렬의 묶음은?',
        okfb:'합병(회전 구조가 비용을 묶음)과 히프(트리 높이가 묶음) — 입력 순서가 끼어들 틈이 없다.',
        choices:[
          {text:"합병 정렬과 히프 정렬",correct:true},
          {text:"퀵 정렬과 합병 정렬",correct:false,mc:"quick-slip",fb:"퀵의 최악 칸을 보라 — O(n²)가 있다."},
          {text:"퀵 정렬과 히프 정렬",correct:false,mc:"quick-slip2",fb:"퀵은 평균의 왕이지 보장의 왕이 아니다."},
          {text:"버블 정렬과 삽입 정렬",correct:false,mc:"best-confuse",fb:"그 둘의 O(n)은 '최선'일 뿐 — 최악은 O(n²)다."}]}},
      {who:"book", say:'"O(n log n)과 O(n²)의 거리를 숫자로 느껴 보자. n = 1,000이면 — n²은 백만, n log n은 약 만. <b>백 배</b>. n = 백만이면 — n²은 1조, n log n은 약 2천만. <b>오만 배</b>다. 정렬이 전체 계산 시간의 25~50%라던 유닛 A의 문장과 겹쳐 읽으면, 이 표가 왜 시험마다 나오는지 알게 된다. 하나 더 — 비교로 순서를 정하는 정렬은 <b>어떤 것이든 O(n log n) 아래로 내려갈 수 없음이 증명되어 있다</b>. 합병과 히프는 이미 이론의 바닥에 서 있는 셈이다. (비교를 아예 안 하면? — 심화의 기수 정렬이 그 우회로다.)"'},
      {check:{id:"c12D-2", stem:'<b>안정(stable) 정렬만</b> 바르게 묶은 것은?',
        okfb:'이웃만 다루는 버블·삽입, <=로 앞을 우선하는 합병 — 멀리 건너뛰는 교환이 있는 선택·퀵·히프는 불안정이다.',
        choices:[
          {text:"버블 · 삽입 · 합병",correct:true},
          {text:"선택 · 퀵 · 히프",correct:false,mc:"flip-all",fb:"정확히 불안정 셋이다 — 건너뛰는 교환이 같은 키의 순서를 깬다."},
          {text:"버블 · 퀵 · 합병",correct:false,mc:"quick-slip",fb:"퀵은 피봇 교환이 멀리 건너뛴다 — 불안정."},
          {text:"삽입 · 합병 · 히프",correct:false,mc:"heap-slip",fb:"히프는 루트↔마지막 교환이 순서를 깬다 — 불안정."}]}},
      {who:"book", say:'"이제 고르는 눈. 표의 칸을 상황에 대면 답이 나온다 — <b>거의 정렬된 입력</b>이 온다면? 삽입(최선 O(n)). <b>레코드가 무거워 이동이 비싸다</b>면? 선택(교환 n−1). <b>평균 속도가 전부</b>라면? 퀵. <b>같은 키의 순서까지 지키며 보장이 필요</b>하다면? 합병. <b>보장은 필요한데 추가 배열 둘 곳이 없다</b>면? 히프. 그리고 <b>n이 작다</b>면 — 아무거나 써도 된다는 것이 정답에 가깝다: log n의 이득보다 재귀·구성의 준비 비용이 클 수 있어, 실전 라이브러리도 작은 구간은 삽입 정렬로 마무리한다."'},
      {check:{id:"c12D-3", stem:'"거의 정렬된 대용량 로그에 새 항목 몇 개가 섞였다 — 빠르게 다시 정렬하고 싶다." 표에 비추어 가장 알맞은 선택은?',
        okfb:'거의 정렬된 입력은 삽입 정렬의 최선 O(n) — 밀 것이 거의 없어 비교 한 번씩으로 끝난다.',
        choices:[
          {text:"삽입 정렬 — 거의 정렬된 입력은 최선 O(n)이다",correct:true},
          {text:"퀵 정렬(첫 원소 피봇) — 언제나 평균이 가장 빠르다",correct:false,mc:"quick-trap",fb:"정렬된 입력은 첫 피봇 퀵의 최악이다 — 표의 붉은 칸을 밟는 선택."},
          {text:"선택 정렬 — 비교 횟수가 초기 상태와 무관해 안정적이다",correct:false,mc:"fixed-myth",fb:"무관하다는 것은 '항상 O(n²)'라는 뜻 — 이 상황의 이점을 전부 버린다."},
          {text:"히프 정렬 — 최악 보장이 있어 가장 안전하다",correct:false,mc:"overkill",fb:"보장은 되지만 O(n log n) — 삽입의 O(n)을 이길 수 없다."}]}},
      {who:"book", say:'"2주의 마무리 문장은 처음의 그 문장이다 — <b>모든 경우에 최상인 유일한 정렬은 없다.</b> 다만 이제 너는 그 문장을 표로, 코드로, 손끝의 트레이스로 말할 수 있다. 챔피언을 외운 사람과 고르는 눈을 가진 사람의 차이 — 그것이 이 2주였다."'}
    ]}
  },

  hints: {
    A:["【분할】 피봇보다 작으면 앞, 크면 뒤 — 분할 한 번에 피봇의 자리가 확정된다. 재귀는 피봇을 빼고 양쪽에.",
       "【코드】 i=left·j=right+1(경계 밖 출발, 먼저 움직이고 비교) / i는 피봇 이상에서, j는 피봇 이하에서 멈춤 / i&lt;j면 교환, 교차하면 SWAP(list[left], list[j]) — j가 피봇의 자리.",
       "【성능】 평균 O(n log n)(반반 분할·제자리·실전 최속) / 최악 O(n²) = 정렬된 입력+첫 피봇(0:(n−1) 쏠림 — 처방: 중간 값·무작위) / 불안정."],
    B:["【합병】 두 정렬 리스트의 맨 앞끼리 비교, 작은 쪽부터 — <=(같으면 앞 리스트)가 안정성의 근원. 한쪽이 바닥나면 잔량 통째 복사.",
       "【반복】 길이 1(이미 정렬) n개 → 쌍쌍 합병으로 2, 4, 8… — 회전 수 ⌈log₂n⌉. 외톨이는 그대로 복사되어 다음 회전 대기.",
       "【성능】 최선=평균=최악 O(n log n) 보장 + 안정. 대가 = 추가 배열 O(n)(extra와 핑퐁). 연결 리스트·외부 정렬의 표준."],
    C:["【2단계】 ① 최대 히프 구성(i=n/2부터 거꾸로 adjust — 잎은 이미 히프, 아래부터 다진다) ② SWAP(list[1], list[i+1])로 최댓값을 뒤로 + adjust(1, i).",
       "【adjust】 두 자식 중 큰 쪽과 비교 — 자식이 크면 끌어올리고 하강, 부모가 크면 멈춤. 1번 칸 규약: i의 자식 = 2i, 2i+1.",
       "【성능】 최선=평균=최악 O(n log n) + 제자리(추가 배열 없음) — 보장과 메모리를 동시에. 루트↔마지막 교환 탓에 불안정."],
    D:["【보장 조】 합병·히프 = 어떤 입력에도 O(n log n). 퀵은 평균 최속이지만 최악 O(n²)(정렬된 입력+첫 피봇).",
       "【안정 조】 버블·삽입·합병 ○ / 선택·퀵·히프 × — 멀리 건너뛰는 교환이 같은 키의 순서를 깬다.",
       "【고르기】 거의 정렬→삽입 / 이동 비쌈→선택 / 평균 속도→퀵 / 보장+안정→합병 / 보장+제자리→히프 / 작은 n→단순 정렬로 충분."]
  },

  /* ================= 과외 (수요일 — 시점 규칙: 퀵·합병까지) ================= */
  tutorQs: [
    {id:"Q1", ask:'쌤, 월요일 수업에서 교수님이 퀵 정렬 보고 <b>제일 빠른데 제일 느려질 수도 있다</b>고 했잖아요. 어제 쌤 답장 듣고도 아직 이상해요 — 제일 빠르게 만들어 놓고 왜 그런 함정을 그냥 두는 거예요?',
     choices:[
      {text:'"함정을 둔 게 아니라, 빠름과 함정이 <b>같은 원천</b>에서 나와서야. 퀵의 속도는 분할이 반반에 가깝다는 데서 오는데, 분할의 기준인 피봇은 데이터에서 뽑거든. 데이터가 하필 정렬돼 있고 피봇을 첫 원소로 뽑으면 분할이 0 대 n−1로 쏠려 — 같은 구조가 빛도 그림자도 만드는 거지. 그래서 처방도 제거가 아니라 완화야: 중간 값이나 무작위로 피봇을 뽑는 것."', correct:true, fb:'빛과 그림자가 같은 데서 나온다… 그래서 없애는 게 아니라 피봇 뽑는 법을 바꾸는 거군요.'},
      {text:'"그 함정은 메모리가 귀하던 초창기 컴퓨터 시절의 코드가 남긴 흔적이라 그래. 요즘은 메모리도 넉넉하고 컴파일러도 좋아져서, 라이브러리에 들어 있는 요즘의 퀵 정렬에는 최악의 경우라는 것 자체가 아예 없어졌거든 — 교과서가 그 옛날 이야기를 미처 못 지우고 아직 싣고 있는 것뿐이라, 시험 대비용으로만 알아 두면 돼."', correct:false, mc:"legacy-myth", fb:'어? 근데 교수님이 「방심하면」이라고 지금 시제로 말했는데요… 옛날 얘기면 그렇게 말 안 하지 않아요?'},
      {text:'"사실 느려지는 건 퀵 정렬이 아니라 컴퓨터 쪽 사정이야. 재귀 호출이 깊어지면 운영체제가 호출 스택을 관리하느라 바빠져서, 그 순간에는 어떤 알고리즘이든 다 같이 느려지게 되거든. 여섯 정렬 중에 퀵이 재귀를 제일 요란하게 쓰는 편이니까, 그 대표 선수로 혼자 욕을 먹고 있는 것에 가깝다고 보면 돼."', correct:false, mc:"os-myth", fb:'그럼 재귀 쓰는 합병 정렬도 똑같이 느려져야 하는 거 아니에요? 뭔가 안 맞는데요.'}]},
    {id:"Q2", ask:'합병 정렬은 왜 <b>추가 배열</b>이 필요해요? 두 리스트가 어차피 한 배열 안에 나란히 있는데, 그냥 그 자리에서 섞으면 되잖아요.',
     choices:[
      {text:'"제자리에서 섞으려면 작은 값을 앞으로 <b>끼워 넣어야</b> 하는데, 그 순간 뒤의 원소들이 전부 한 칸씩 밀려 — 2주차의 배열 삽입, 그 비용이 매번 터지는 거야. 그러면 회전당 O(n)이던 이동이 무너져서 합병의 자랑인 O(n log n) 보장이 사라져. 결과를 옆 배열에 차곡차곡 담는 건 그 밀기를 통째로 사는 값인 셈이지."', correct:true, fb:'아, 끼워 넣으면 밀리니까… 추가 배열이 밀기 비용을 대신 내주는 거네요.'},
      {text:'"C 언어의 배열은 함수의 인자로 넘어가는 순간 내용이 바뀌지 않도록 보호되는 규칙이 있어서 그래. 그래서 정렬한 결과를 담으려면 어쩔 수 없이 새 배열을 하나 만들어 거기에 써야 하는 거야 — 말하자면 프로그래밍 언어 쪽의 오래된 규칙이지, 합병 정렬이라는 알고리즘 자체의 문제는 아닌 셈이지."', correct:false, mc:"lang-myth", fb:'네? 지난주 삽입 정렬은 배열을 그 자리에서 바꿨잖아요. C가 그런 보호를 한다는 건 처음 듣는데요.'},
      {text:'"안정성 때문이야. 같은 키의 순서를 지키려면 정렬 도중에 원본을 증거로 고스란히 남겨 둬야 하거든. 그래서 안정 정렬은 전부 원본은 건드리지 않고 복사본 위에서만 작업하도록 만들어져 있어 — 합병이 안정 정렬의 대표 격이니, 추가 배열도 당연히 따라오는 거지."', correct:false, mc:"stable-myth", fb:'삽입 정렬도 안정이라면서 추가 배열 없었잖아요… 안정이랑 배열이랑 상관없는 거 아니에요?'}]},
    {id:"Q3", boss:true, ask:'마지막이요. 퀵도 합병도 같은 분할 정복이라 <b>반씩 나누는 건 똑같은데</b>, 왜 퀵은 최악이 있고 합병은 없어요? 나누는 방향만 다르지 하는 일은 같아 보이는데요.',
     choices:[
      {text:'"나누는 <b>기준</b>이 달라. 퀵의 경계선은 피봇 — 즉 <b>데이터의 값</b>이 정해. 값이 어떻게 생겼느냐에 따라 반반이 될 수도, 0 대 n−1로 쏠릴 수도 있지. 합병의 경계선은 <b>길이</b> — 1, 2, 4로 데이터가 뭐든 무조건 반씩이야. 데이터가 나누면 데이터에 배신당할 수 있고, 구조가 나누면 배신이 없어 — 그게 최악의 유무야."', correct:true, fb:'데이터가 나누느냐 구조가 나누느냐… 나누는 방향이 아니라 나누는 기준이 운명을 갈랐네요. 이거 시험에 쓸래요.'},
      {text:'"합병은 나눌 때마다 두 조각을 저울처럼 재 보고, 크기가 어긋나 있으면 균형이 맞을 때까지 다시 나누는 검사 단계가 들어 있어서 그래. 퀵은 속도를 위해 그 검사를 과감히 생략했기 때문에 쏠림을 못 잡는 거야 — 검사를 넣은 퀵도 있긴 한데, 그건 이미 다른 이름으로 불리는 물건이지."', correct:false, mc:"recheck-myth", fb:'다시 나누는 검사요…? merge_pass 코드에 그런 게 있었나요. 길이로 자르면 잴 것도 없지 않아요?'},
      {text:'"합병에도 최악 자체는 있는데, 추가 배열이 그걸 흡수해 주는 구조야. 쏠린 조각이 나오면 초과분이 extra 배열 쪽으로 넘어가서 본 배열은 늘 반반을 유지하게 되거든 — 말하자면 메모리를 내주고 시간을 사는 거래인 셈이고, 배열이 없는 정렬에는 그래서 최악이 생기는 거지."', correct:false, mc:"buffer-myth", fb:'extra가 쏠림을 흡수한다고요…? 배열이 시간을 흡수한다는 게 무슨 뜻인지 잘 모르겠어요. 뭔가 이상해요.'}]}
  ],

  /* ================= 문항 풀 ================= */
  pool: [
    {id:"P01", unit:"A", stem:'퀵 정렬에서 <b>분할(partition)</b>이 하는 일을 가장 정확히 말한 것은?',
     okfb:'피봇보다 작은 키는 앞, 큰 키는 뒤로 — 그 한 번으로 피봇의 자리가 확정된다.',
     choices:[
       {text:"피봇 기준으로 작은 키는 앞, 큰 키는 뒤로 재배치한다",correct:true},
       {text:"배열을 정확히 절반 크기의 두 조각으로 잘라서 나눈다",correct:false,mc:"half-myth",fb:"경계는 크기가 아니라 피봇의 값이 정한다 — 반반은 보장이 아니라 희망이다."},
       {text:"이웃한 원소끼리 비교해 어긋난 쌍을 교환한다",correct:false,mc:"bubble-confuse",fb:"이웃 교환은 버블 — 분할은 피봇 기준의 양분이다."},
       {text:"가장 작은 원소를 찾아 맨 앞과 교환한다",correct:false,mc:"select-confuse",fb:"최솟값 선택은 선택 정렬의 회전이다."}]},
    {id:"P02", unit:"A", stem:'퀵 정렬 분할 코드의 빈칸에 들어갈 것은?', mono:true,
     code:["i = left;  j = right + 1;","pivot = list[left].key;","do {","    do { i++; } while(list[i].key < pivot);","    do { j--; } while(list[j].key > pivot);","    if(i < j) SWAP(list[i], list[j], temp);","} while(i < j);","SWAP(list[left], list[______], temp);"],
     okfb:'j가 멈춘 곳이 피봇 이하 구역의 끝 — 피봇의 정확한 자리다.',
     choices:[
       {text:"j",correct:true},
       {text:"i",correct:false,mc:"ij-flip",fb:"i 자리는 피봇 이상 구역 — 피봇을 두면 질서가 깨진다."},
       {text:"right",correct:false,mc:"end-myth",fb:"맨 끝이 아니라 두 구역의 경계로 보낸다."},
       {text:"(left+right)/2",correct:false,mc:"mid-myth",fb:"가운데가 아니라 j — 분할의 경계는 값이 정한다."}]},
    {id:"P03", unit:"A", stem:'첫 원소 피봇 퀵 정렬의 <b>최악의 경우</b>를 완화하는 표준 처방은?',
     okfb:'중간 값(median)·무작위 피봇 — 극단값이 피봇이 될 확률을 낮춰 쏠린 분할을 피한다.',
     choices:[
       {text:"피봇을 중간 값이나 무작위로 골라 쏠림을 피한다",correct:true},
       {text:"재귀 대신 반복문으로 바꿔 호출 비용을 없앤다",correct:false,mc:"iter-myth",fb:"호출 비용이 아니라 분할의 쏠림이 문제다 — 반복문으로 바꿔도 쏠림은 남는다."},
       {text:"분할 전에 배열 전체를 한 번 뒤집어 준다",correct:false,mc:"reverse-myth",fb:"역순 입력도 똑같이 최악이다 — 뒤집기는 처방이 아니다."},
       {text:"부리스트가 쏠릴 때마다 합병 정렬로 되돌아간다",correct:false,mc:"fallback-half",fb:"실전 하이브리드가 있긴 하나, 교과서의 표준 처방은 피봇 선택의 개선이다."}]},
    {id:"P04", unit:"A", stem:'배열 <span class="mono">[30, 10, 50, 20, 60]</span>에 첫 원소 30을 피봇으로 <b>분할 한 번</b>을 수행한 직후, 피봇 30이 앉는 <b>인덱스</b>는?', mono:true,
     okfb:'30보다 작은 원소가 10, 20 — 두 개. 그 둘이 앞으로 오고 30은 [2]에 앉는다.',
     choices:[
       {text:"2",correct:true},
       {text:"0",correct:false,mc:"stay-myth",fb:"마지막 SWAP(list[left], list[j])이 피봇을 경계로 보낸다 — 제자리에 남지 않는다."},
       {text:"4",correct:false,mc:"end-myth",fb:"맨 뒤는 최댓값 60의 자리다 — 피봇의 자리는 '저보다 작은 것의 수'가 정한다."},
       {text:"1",correct:false,mc:"count-slip",fb:"30보다 작은 원소를 다시 세어 보라 — 10과 20, 두 개다."}]},
    {id:"P05", unit:"B", stem:'merge 코드의 빈칸에 들어갈 것은?', mono:true,
     code:["while(i<=m && j<=n){","    if(list[i].key ______ list[j].key)","        sorted[k++] = list[i++];","    else sorted[k++] = list[j++];","}"],
     okfb:'<= — 같은 키면 앞 리스트가 먼저 나간다. 이 등호가 합병 정렬의 안정성을 만든다.',
     choices:[
       {text:"<=",correct:true},
       {text:"<",correct:false,mc:"stable-drop",fb:"동작은 하지만 같은 키에서 뒤 리스트가 먼저 나가 안정성이 깨진다 — 교재의 선택은 <=다."},
       {text:">=",correct:false,mc:"desc-flip",fb:"큰 쪽부터 담으면 내림차순이 된다."},
       {text:"==",correct:false,mc:"eq-myth",fb:"같을 때만 담으면 대부분의 원소가 담기지 못한다."}]},
    {id:"P06", unit:"B", stem:'배열 <span class="mono">[26, 5, 77, 1, 61, 11, 59, 15, 48, 19]</span>에 반복 합병 정렬의 <b>1회전</b>(길이 1 → 2)을 수행한 직후의 배열은?', mono:true,
     okfb:'이웃 쌍끼리만 합병 — [5,26] [1,77] [11,61] [15,59] [19,48].',
     choices:[
       {text:"5, 26, 1, 77, 11, 61, 15, 59, 19, 48",correct:true},
       {text:"1, 5, 11, 15, 19, 26, 48, 59, 61, 77",correct:false,mc:"final-confuse",fb:"전체 정렬은 4회전 뒤 — 1회전 직후를 물었다."},
       {text:"5, 26, 77, 1, 11, 61, 59, 15, 19, 48",correct:false,mc:"pair-slip",fb:"(77, 1) 쌍의 합병을 빠뜨렸다 — 모든 쌍이 정렬된다."},
       {text:"5, 1, 26, 11, 61, 15, 59, 19, 48, 77",correct:false,mc:"bubble-confuse",fb:"이웃을 계속 밀고 가는 것은 버블 — 합병 회전은 쌍 안에서만 움직인다."}]},
    {id:"P07", unit:"B", stem:'merge_sort가 <span class="mono">merge_pass(list, extra, …)</span> 와 <span class="mono">merge_pass(extra, list, …)</span> 를 <b>번갈아</b> 부르는 이유는?',
     okfb:'합병 결과는 다른 배열에 담긴다 — 방향을 교대(핑퐁)하면 복사 없이 결과가 회전마다 제자리로 돌아온다.',
     choices:[
       {text:"결과가 담긴 배열을 다음 회전의 입력으로 삼는 핑퐁 구조라서",correct:true},
       {text:"두 배열을 동시에 정렬해 실행 시간을 절반으로 줄이려고",correct:false,mc:"parallel-myth",fb:"동시가 아니라 교대다 — 한 회전에 한 방향씩."},
       {text:"extra 배열이 가득 차면 비워 주어야 하기 때문에",correct:false,mc:"full-myth",fb:"extra는 넘치지 않는다 — 같은 크기의 작업 공간일 뿐이다."},
       {text:"홀수 번째 회전에서만 안정성이 지켜지기 때문에",correct:false,mc:"stable-myth",fb:"안정성은 <=가 매 회전 지킨다 — 방향과 무관하다."}]},
    {id:"P08", unit:"B", stem:'합병 정렬이 <b>외부 정렬</b>(주기억장치에 다 안 들어가는 파일)의 표준이 된 이유로 가장 알맞은 것은?',
     okfb:'합병은 두 입력을 앞에서 뒤로 순차로만 읽고 쓴다 — 파일 접근과 정확히 같은 무늬라, 조각 파일들을 합병해 나가면 된다.',
     choices:[
       {text:"앞에서 뒤로 순차 접근만 해서 파일 입출력과 무늬가 같다",correct:true},
       {text:"추가 배열이 필요 없어 메모리가 부족해도 돌아간다",correct:false,mc:"space-flip",fb:"합병은 오히려 추가 공간이 필요한 쪽 — 강점은 순차 접근이다."},
       {text:"비교 없이 정렬해 디스크 속도의 영향을 받지 않는다",correct:false,mc:"radix-confuse",fb:"비교 없는 정렬은 기수 — 합병은 비교 기반이다."},
       {text:"파일을 통째로 읽지 않고 결과만 예측할 수 있다",correct:false,mc:"magic-myth",fb:"읽지 않은 데이터는 정렬할 수 없다 — 순차로 읽는 것이 핵심이다."}]},
    {id:"P09", unit:"C", stem:'adjust 코드의 빈칸에 들어갈 것은?', mono:true,
     code:["child = 2*root;","while(child <= n){","    if((child < n) && (list[child].key < list[______].key))","        child++;","    if(rootkey > list[child].key) break;","    else { list[child/2] = list[child];  child *= 2; }","}"],
     okfb:'child+1 — 왼쪽 자식과 오른쪽 자식을 비교해 큰 쪽을 고르는 줄이다.',
     choices:[
       {text:"child+1",correct:true},
       {text:"child/2",correct:false,mc:"parent-slip",fb:"child/2는 부모 — 여기서는 형제(오른쪽 자식)와 비교한다."},
       {text:"root",correct:false,mc:"root-slip",fb:"루트가 아니라 두 자식 사이의 비교다."},
       {text:"n",correct:false,mc:"end-slip",fb:"마지막 원소가 아니라 바로 옆의 오른쪽 자식이다."}]},
    {id:"P10", unit:"C", stem:'heapsort 코드에서 <span class="mono">SWAP(list[1], list[i+1])</span> 이 하는 일은?', mono:true,
     okfb:'루트(현재 최댓값)와 히프의 마지막 원소를 맞바꿈 — 최댓값이 맨 뒤 확정 구역으로 나간다.',
     choices:[
       {text:"현재 최댓값을 히프 밖(뒤쪽 확정 구역)으로 내보낸다",correct:true},
       {text:"가장 작은 잎을 루트로 올려 다음 최솟값을 찾는다",correct:false,mc:"min-flip",fb:"올라오는 것은 마지막 원소일 뿐 최솟값 보장이 없고, 나가는 쪽이 핵심 — 최댓값이다."},
       {text:"어긋난 이웃 쌍 하나를 골라 제 순서로 바꾼다",correct:false,mc:"bubble-confuse",fb:"이웃 교환은 버블 — 이것은 루트와 마지막의 원거리 교환이다."},
       {text:"히프를 두 개의 작은 히프로 쪼개어 나눈다",correct:false,mc:"split-myth",fb:"쪼개기는 없다 — 범위가 한 칸 줄어들 뿐이다."}]},
    {id:"P11", unit:"C", stem:'히프 정렬이 <b>불안정</b>인 이유로 가장 알맞은 것은?',
     okfb:'SWAP(list[1], list[i+1]) — 루트와 마지막의 원거리 교환이 같은 키의 원래 순서를 건너뛰며 흩뜨린다.',
     choices:[
       {text:"루트와 마지막 원소의 원거리 교환이 순서를 건너뛰므로",correct:true},
       {text:"트리 구조에서는 원래 순서라는 개념이 없어지므로",correct:false,mc:"tree-myth",fb:"배열 위의 트리다 — 원래 순서는 인덱스로 남아 있다."},
       {text:"내려보내기가 왼쪽 자식을 항상 우선하기 때문에",correct:false,mc:"sibling-myth",fb:"큰 자식 우선이다 — 그리고 그것은 안정성과 무관하다."},
       {text:"구성 단계에서 배열이 두 번 뒤집히기 때문에",correct:false,mc:"reverse-myth",fb:"뒤집기는 없다 — 문제는 확정 교환의 건너뛰기다."}]},
    {id:"P12", unit:"C", stem:'<b>메모리가 빠듯한데 최악의 경우 보장</b>도 포기할 수 없다 — 표에서 이 요구에 맞는 정렬은?',
     okfb:'히프 — 항상 O(n log n)이면서 추가 배열이 없다. 합병의 보장에서 추가 배열을 뺀 자리다.',
     choices:[
       {text:"히프 정렬",correct:true},
       {text:"합병 정렬",correct:false,mc:"space-slip",fb:"보장은 되지만 추가 배열 O(n)이 필요하다 — 메모리 조건에 걸린다."},
       {text:"퀵 정렬",correct:false,mc:"worst-slip",fb:"제자리는 맞지만 최악 O(n²) — 보장 조건에 걸린다."},
       {text:"삽입 정렬",correct:false,mc:"simple-slip",fb:"제자리·안정이지만 최악 O(n²) — 보장이 없다."}]},
    {id:"P13", unit:"D", stem:'세 O(n log n) 정렬(퀵·합병·히프)이 <b>모두 공유하는</b> 성질은?',
     okfb:'셋 다 분할 정복(divide and conquer) — 문제를 절반씩 줄이는 구조 — 로 log n을 얻는 비교 기반 정렬이다.',
     choices:[
       {text:"문제를 절반 크기로 줄여 가며 log n의 깊이를 얻는다",correct:true},
       {text:"셋 다 같은 키를 가진 레코드의 원래 순서를 보존한다",correct:false,mc:"stable-mix",fb:"안정은 합병뿐 — 퀵·히프는 불안정이다."},
       {text:"셋 다 추가 배열 없이 제자리에서 정렬한다",correct:false,mc:"space-mix",fb:"합병은 추가 배열 O(n)이 필요하다."},
       {text:"셋 다 어떤 입력에도 실행 시간이 보장된다",correct:false,mc:"worst-mix",fb:"퀵에는 최악 O(n²)가 있다 — 보장 조는 합병·히프다."}]},
    {id:"P14", unit:"D", stem:'실전 라이브러리 정렬이 <b>작은 구간은 삽입 정렬로 마무리</b>하는 이유는?',
     okfb:'n이 작으면 log n의 이득보다 재귀·구성의 준비 비용이 크다 — 단순한 삽입이 오히려 빠르다.',
     choices:[
       {text:"작은 n에서는 분할·재귀의 준비 비용이 이득을 넘어서므로",correct:true},
       {text:"삽입 정렬이 모든 크기에서 사실은 가장 빠르기 때문에",correct:false,mc:"insert-myth",fb:"큰 n에서는 O(n²)가 압도적으로 느리다 — 작은 구간 한정이다."},
       {text:"재귀 호출이 일정 깊이를 넘으면 금지되어 있기 때문에",correct:false,mc:"limit-myth",fb:"금지가 아니라 효율의 선택이다."},
       {text:"삽입 정렬만이 불안정을 안정으로 바꿔 주기 때문에",correct:false,mc:"stable-myth",fb:"마무리 삽입이 전체를 안정으로 만들지는 못한다 — 이유는 속도다."}]},
    {id:"P15", unit:"D", ptype:"parsons",
     stem:'퀵 정렬 코드를 <b>올바른 순서</b>로 조립하라. (준비 → 두 손가락의 전진 → 교차 판정 → 피봇 안착 → 재귀)',
     lines:["void quicksort(element list[], int left, int right){","    if(left < right){","        i = left;  j = right+1;  pivot = list[left].key;","        do {","            do {i++;} while(list[i].key < pivot);  do {j--;} while(list[j].key > pivot);","            if(i < j) SWAP(list[i], list[j], temp);","        } while(i < j);","        SWAP(list[left], list[j], temp);  quicksort(list, left, j-1);  quicksort(list, j+1, right);  }  }"],
     okfb:'경계 검사 → 준비(i·j·pivot) → 안쪽 do(전진 → 교환) → 교차까지 반복 → 피봇 안착과 재귀. 손가락의 전진이 교환보다 먼저다.',
     fb:'i·j·pivot의 준비가 do보다 앞인지, 전진(do{i++}…)이 교환(if(i&lt;j))보다 앞인지, 피봇 안착이 루프 밖 마지막인지 확인하라.'}
  ],

  /* ================= 서사 (아크 v1.6.1 — E2 + 단서 ⑥ + 할아버지 + 도발장 8) ================= */
  interludes: {
    A: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 유튜브에서 옷장 정리 영상 봤는데요 — 기준 옷을 하나 걸어 놓고 「이것보다 두꺼우면 왼쪽, 얇으면 오른쪽」으로 먼저 다 가르고 시작하래요. 이거… 오늘 수업에서 들은 퀵이랑 똑같은 거 아니에요?'},
      {who:"나", face:"me-proud", text:'(답장) 정확히 그거다. 그 기준 옷이 피봇이고, 가르고 나면 기준 옷의 걸릴 자리는 확정이지. 남은 양쪽을 또 기준 잡아 가르는 것까지 하면 — 네 옷장은 퀵 정렬로 정리된 거다. 수요일에 그 기준 옷을 잘못 고르면 무슨 일이 나는지 이야기해 주마.'}
    ],
    B: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 편의점 알바 형이 그러는데요 — 계산대 두 줄이 하나로 합쳐질 때는 새치기 시비가 안 나게 <b>줄 앞사람끼리 먼저 온 순서</b>만 보고 한 명씩 세운대요. 어… 이거 뭔가 어제 옷장이랑 비슷한 냄새가 나는데요?'},
      {who:"나", face:"me-proud", text:'(답장) 냄새 잘 맡았다 — 어젯밤 내가 공부한 게 정확히 그거다: 합병(merge). 두 줄이 이미 순서대로라면, 앞끼리만 견줘도 전체가 한 줄로 선다. 그리고 「먼저 온 사람 우선」 — 그 규칙에도 이름이 있다. 내일 마저 이야기해 주마.'}
    ],
    C: [
      {who:"도윤", face:"doyun", text:'(문자) 쌤, 월요일 수업 끝에 교수님이 히프 정렬 얘기를 잠깐 했었는데요 — 히프면 트리 배울 때 그 히프잖아요? 정렬 시간에 트리가 왜 또 나와요? 재활용이에요?'},
      {who:"나", face:"me", text:'(답장) 재활용 맞다 — 그리고 그게 칭찬이다. 좋은 도구는 한 번 쓰고 버려지지 않아. 최댓값을 log n에 뽑아 주던 그 성질을 정렬에 빌려 오는 것뿐이다. 토요일에 그 얘기부터 하자.'},
      {who:"발신 번호 없음", face:"📵", text:'(밤 11시 — 문자) 문제는 이제 그만 보내지. 이런 걸로 될 일이 아니었어. — <b>기말 전에, 어머님께 전부 말하겠다. 직접.</b>',
       clue:{id:"clue6", text:"⑥ 그자는 어머니(윤 여사)의 연락처를 알고 있다 — '직접 말하겠다'는 말이 그 증거. 밖에서 겉돌던 사람이 아니라 이 집의 안쪽과 닿아 있던 사람이다."}},
      {who:"나", face:"me-worried", text:'<span class="inner">…왔다. 문자가 아닌 것이 온다던 예감 — 그 절반이 지금 도착했다. 그런데 저 한 단어가 가장 크게 울린다. <b>직접.</b> 어머니의 연락처를 알고 있다는 뜻이다. 밖에서 맴돌던 사람이 아니라, 이 집의 안쪽과 닿아 있던 사람 — 도윤의 옛 프린트, 전임 과외교사. 조각이 하나 더 맞물린다.</span>'},
      {who:"나", face:"me-worried", text:'<span class="inner">그리고 시한이 정해졌다 — <b>기말 전</b>. …손이 조금 떨리는 건 어쩔 수 없다. 하지만 그쪽이 시간을 정했다면, 나는 그 시간에 무엇을 채울지를 정한다. 내일의 자습, 다음 주의 마지막 진도, 그리고 기말. 내 시간표는 바뀌지 않는다.</span>'}
    ],
    D: [
      {who:"나", face:"me", text:'<span class="inner">잠이 오지 않아 걷다 보니 — 발이 기억하는 길. 보수동 책방골목, 그 헌책방 앞이다. 이 모든 것이 시작된 곳. 불이 아직 켜져 있다.</span>'},
      {who:"할아버지", face:"elder", text:'…… (책 정리를 하다 흘끗 본다) 쫓기는 얼굴이군.'},
      {who:"할아버지", face:"elder", text:'쫓기는 사람이 지는 건 걸음이 늦어서가 아니야. <b>제 길을 안 걷고, 쫓는 놈 얼굴만 돌아보며 뛰어서지.</b> …살 게 아니면 문 닫는다.'},
      {who:"나", face:"me-proud", text:'<span class="inner">…여전히 무뚝뚝하고, 여전히 정확하다. 내 길 — 내일 도윤에게 2주의 정렬을 한 장의 표로 세워 주는 것. 다음 주의 마지막 진도. 그자의 시계가 아니라 내 시계로 걷는다. 돌아가는 발걸음이 아까보다 가볍다.</span>'}
    ]
  },

  /* 도발장 8 — 조건의 소멸 (E2 직후 — 4원칙: 목적(가늠)만, 자기 정보 없음, 단서 없음) */
  aplusSkin: {
    cond:{aplusMin:1}, hud:"도발장", header:"🗡 토요일 오후 — 발신 번호 없는 문자", qHeader:"🗡 도발장",
    offer:[
      {who:"발신 번호 없음", face:"📵", text:'(문자) 셋. 조건은 걸지 않지 — 걸 이유가 없어졌으니. 어디까지 왔는지나 보자.'},
      {who:"나", face:"me-worried", text:'<span class="inner">조건이 사라졌다 — 올가미가 아니라, 이건 <b>가늠</b>이다. 말하러 가기 전에 나를 재보겠다는 것. …그렇다면 보여 준다. 숨길 것도, 물러설 곳도 없다. 답은 언제나 문제 안에서.</span>'}
    ],
    acceptLabel:'"받아 주지." (도발장 3문제)',
    declineLabel:'무시한다 (기본 트랙)',
    resultWin:[
      {who:"나", face:"me-proud", text:'<span class="inner">…이번엔 답장이 없다. 마침표조차도. — 던질 카드를 이미 던진 사람은 조용한 법이다. 다음 주가 마지막 진도, 그다음이 기말. 그자의 시한과 나의 시간표가 같은 주를 가리키고 있다. …좋아. 거기서 보자.</span>'}
    ],
    resultLose:[
      {who:"발신 번호 없음", face:"📵", text:'(문자) {n}/3. 기억해 두지 — 마지막에 떠올리게 될 숫자다.'},
      {who:"나", face:"me-awkward", text:'<span class="inner">…밀렸다. 하지만 이상하게 무너지지는 않는다 — 저쪽의 수는 이미 다 보였고, 남은 것은 기본기의 싸움이다. 어디서 막혔는지 곱씹고, 다음 주의 나에게 넘긴다.</span>'}
    ]
  }
};
