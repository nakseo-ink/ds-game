"use strict";
/* 생성기 4종 + A+ 심화 — 스펙 3절
   출력은 저작형 문항과 동일한 Item 구조. 파라미터는 로그에 기록되어 재현 가능. */

/* G1 — 주소 계산 */
const G1_TYPES=[{name:"char",size:1},{name:"int",size:4},{name:"double",size:8}];
const G1_BASES=[0x1000,0x2000,0x3E80,0x5000,0x7F00];
function genG1(){
  const t=pick(G1_TYPES), base=pick(G1_BASES);
  const n=5+Math.floor(Math.random()*5);
  const i=1+Math.floor(Math.random()*Math.min(n-1,7));
  const correct=base+i*t.size;
  const cand=[
    {v:base+i, mc:"addr-no-sizeof", fb:"칸 수를 그대로 더했다. 한 칸은 1번지가 아니라 sizeof("+t.name+")="+t.size+"바이트다."},
    {v:base+(i+1)*t.size, mc:"off-by-one", fb:"인덱스는 0부터다. 곱하는 수는 "+i+"."},
    {v:base+i*(t.size===4?8:4), mc:"size-confusion", fb:t.name+"의 크기는 "+t.size+"바이트다."}];
  const seen=new Set([correct]); const ds=[];
  for(const c of cand){ if(!seen.has(c.v)){seen.add(c.v); ds.push(c);} }
  while(ds.length<3){ const v=correct+t.size*(ds.length+2);
    if(!seen.has(v)){seen.add(v); ds.push({v,mc:"misc",fb:"계산을 다시 — base + index × sizeof."});} }
  return { id:"G1", params:{type:t.name,size:t.size,base,n,i}, mono:true,
    stem:'<span class="mono">'+t.name+' arr['+n+']</span>의 시작 주소가 <span class="mono">'+fmtHex(base)+'</span>일 때, <span class="mono">arr['+i+']</span>의 주소는?',
    okfb:'<span class="mono">'+fmtHex(base)+' + '+i+'×'+t.size+' = '+fmtHex(correct)+'</span> — 곱셈 한 번, 덧셈 한 번.',
    choices:shuffle([{text:fmtHex(correct),correct:true},...ds.slice(0,3).map(c=>({text:fmtHex(c.v),correct:false,mc:c.mc,fb:c.fb}))]),
    strip:{base,size:t.size,values:Array(n).fill("·"),hiIdx:i,showAddr:false} };
}

/* G2 — P/G 2.1 트레이스 값 생성 */
function genG2(){
  const vals=[]; while(vals.length<5){const v=1+Math.floor(Math.random()*9); if(!vals.includes(v)) vals.push(v);}
  return {vals, sum:vals.reduce((a,b)=>a+b,0)};
}
const CODE_B=v=>["int main(void) {","  int input[5] = {"+v.join(", ")+"};","  int answer = sum(input, 5);",'  printf("%d %d", answer, input[0]);',"}","","int sum(int list[], int n) {","  int i, s = 0;","  for (i = 0; i < n; i++)","    s += list[i];","  list[0] = 0;   /* 실험 */","  return s;","}"];

/* G3 — padd 병합 시뮬레이션 */
function genG3(){
  const common=Math.random()<0.75;
  const zero=common&&Math.random()<0.45;
  const exps=shuffle([9,8,7,6,5,4,3,2,1,0]);
  const eCommon=common?exps.pop():null;
  const eA=[exps.pop()]; const eB=[exps.pop()];
  if(Math.random()<0.6) eA.push(exps.pop());
  if(common){ eA.push(eCommon); eB.push(eCommon); }
  eA.sort((a,b)=>b-a); eB.sort((a,b)=>b-a);
  const mk=es=>es.map(e=>({e, c:(1+Math.floor(Math.random()*8))}));
  const A=mk(eA), B=mk(eB);
  if(zero){ const bi=B.findIndex(t=>t.e===eCommon); B[bi].c=-A.find(t=>t.e===eCommon).c; }
  const steps=[]; let ia=0, ib=0;
  while(ia<A.length&&ib<B.length){
    const ta=A[ia], tb=B[ib];
    let action, sum=null;
    if(ta.e>tb.e) action="A";
    else if(ta.e<tb.e) action="B";
    else { sum=ta.c+tb.c; action=sum===0?"NONE":"SUM"; }
    steps.push({ia,ib,ta:{...ta},tb:{...tb},action,sum});
    if(action==="A") ia++; else if(action==="B") ib++; else {ia++; ib++;}
  }
  const restNote = ia<A.length? "A의 남은 항을 그대로 복사" : (ib<B.length? "B의 남은 항을 그대로 복사" : null);
  return {A,B,steps,restNote};
}

/* G4 — 희소행렬 triple 표현 (헤더·저장위치·읽기 3유형) */
function genG4(){
  const n=4+Math.floor(Math.random()*2);
  const cells=[];
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)cells.push({r,c});
  shuffle(cells);
  const nz=3+Math.floor(Math.random()*3);
  const elems=cells.slice(0,nz).map(({r,c})=>({r,c,v:(1+Math.floor(Math.random()*89))*(Math.random()<0.25?-1:1)}));
  elems.sort((x,y)=>x.r-y.r||x.c-y.c);
  const qtype=pick(["header","locate","read"]);
  const ti=Math.floor(Math.random()*elems.length);
  const t=elems[ti];
  if(qtype==="header"){
    const maxv=Math.max(...elems.map(e=>e.v));
    const cand=new Map(); const add=(k,o)=>{ if(!cand.has(k)) cand.set(k,o); };
    add("<"+n+", "+n+", "+nz+">",{correct:true});
    add("<"+nz+", "+n+", "+n+">",{mc:"header-order",fb:"순서는 <행수, 열수, 항수>다."});
    add("<"+n+", "+n+", "+maxv+">",{mc:"header-element",fb:"세 번째 값은 최댓값이 아니라 0이 아닌 항의 '개수'다."});
    add("<"+t.r+", "+t.c+", "+t.v+"> (첫 데이터)",{mc:"header-element",fb:"a[0]은 데이터가 아니라 행렬 전체의 요약(헤더)이다."});
    return {n,elems,qtype, item:{ id:"G4-header", mono:true,
      stem:'이 행렬을 triple 배열 <span class="mono">a</span>로 저장할 때, <b>헤더 a[0]</b>에 들어갈 값은?',
      okfb:'a[0] = <행수, 열수, 항수> = <'+n+', '+n+', '+nz+'>.',
      choices:shuffle([...cand.entries()].slice(0,4).map(([text,o])=>({text,correct:!!o.correct,mc:o.mc,fb:o.fb})))}};
  }
  if(qtype==="locate"){
    const k=ti+1;
    const colSorted=elems.slice().sort((x,y)=>x.c-y.c||x.r-y.r);
    const colRank=colSorted.findIndex(e=>e===t)+1;
    const cand=new Map(); const add=(kk,o)=>{ if(!cand.has(kk)) cand.set(kk,o); };
    add("a["+k+"]",{correct:true});
    add("a["+(k-1)+"]",{mc:"header-forgotten",fb:"a[0]은 헤더다 — 데이터는 a[1]부터 세어야 한다."});
    add("a["+(k+1)+"]",{mc:"off-by-one",fb:"row major 순서로 처음부터 다시 세어 보자 — 행 번호순, 같은 행이면 열 번호순."});
    if(colRank!==k) add("a["+colRank+"]",{mc:"row-major",fb:"열 번호순이 아니라 '행 번호순'이 먼저다 — row major."});
    add("a["+(k+2)+"]",{mc:"off-by-one",fb:"순서를 처음부터 — 행 번호순, 같은 행이면 열 번호순."});
    return {n,elems,qtype,target:t, item:{ id:"G4-locate", mono:true,
      stem:'강조된 원소 — '+t.r+'행 '+t.c+'열의 값 <b>'+t.v+'</b> — 는 triple 배열의 <b>어느 방</b>에 저장되는가? <span style="color:var(--ink-dim);">(row major 순서, a[0]은 헤더)</span>',
      okfb:'row major로 세면 '+k+'번째 데이터 — 헤더 다음이므로 a['+k+'].',
      choices:shuffle([...cand.entries()].slice(0,4).map(([text,o])=>({text,correct:!!o.correct,mc:o.mc,fb:o.fb})))}};
  }
  const k=ti+1;
  return {n,elems,qtype,target:t,targetIdx:ti, item:{ id:"G4-read",
    stem:'<span class="mono">a['+k+'] = &lt;'+t.r+', '+t.c+', '+t.v+'&gt;</span> — 이 원소가 뜻하는 것은?',
    okfb:'triple의 순서는 <행, 열, 값> — '+t.r+'행 '+t.c+'열의 값이 '+t.v+'이다.',
    choices:shuffle([
      {text:t.r+"행 "+t.c+"열의 값이 "+t.v, correct:true},
      {text:t.c+"행 "+t.r+"열의 값이 "+t.v, correct:false, mc:"triple-reading", fb:"순서는 <행, 열, 값>이다. 앞이 행."},
      {text:t.v+"행 "+t.r+"열의 값이 "+t.c, correct:false, mc:"triple-reading", fb:"값은 마지막 자리다. <행, 열, 값>."}])}};
}

/* A+ 심화 3종 */
function genAP(idx){
  if(idx===0){
    const base=pick([0x2000,0x4000,0x6000]);
    const k=1+Math.floor(Math.random()*6);
    const correct=base+k*12+4;
    return { id:"AP1", mono:true,
      stem:'<span class="mono">typedef struct { int id; int age; int score; } student;</span> (12바이트)<br><span class="mono">student arr[8]</span>의 시작 주소가 <span class="mono">'+fmtHex(base)+'</span>일 때, <span class="mono">arr['+k+'].age</span>의 주소는?',
      okfb:'k번째 사람까지 건너뛰고(+'+k+'×12), 그 안에서 age의 오프셋(+4): '+fmtHex(correct)+'.',
      choices:shuffle([
        {text:fmtHex(correct),correct:true},
        {text:fmtHex(base+k*12),correct:false,mc:"member-offset-missing",fb:"arr["+k+"]의 시작일 뿐이다. 그 '안'의 age까지 가려면 멤버 오프셋 +4가 필요하다."},
        {text:fmtHex(base+k*12+8),correct:false,mc:"member-order",fb:"age는 두 번째 멤버 — int id(4바이트) 다음이므로 오프셋은 4다."},
        {text:fmtHex(base+k*4+4),correct:false,mc:"struct-size",fb:"한 사람은 int 하나가 아니라 구조체 전체 12바이트다."}])};
  }
  if(idx===1){
    const base=pick([0x4000,0x8000]);
    const rows=3, cols=4;
    const i=1+Math.floor(Math.random()*2);
    let j=1+Math.floor(Math.random()*3);
    if(j===i) j=(j%3)+1; // i==j면 행열 교환 오답이 정답과 겹침 — 회피
    const correct=base+(i*cols+j)*4;
    return { id:"AP2", mono:true,
      stem:'<span class="mono">int m['+rows+']['+cols+']</span>의 시작 주소가 <span class="mono">'+fmtHex(base)+'</span>일 때 (row major), <span class="mono">m['+i+']['+j+']</span>의 주소는?',
      okfb:'행 하나는 '+cols+'칸 — ('+i+'×'+cols+'+'+j+')×4 = '+((i*cols+j)*4)+'을 더한다: '+fmtHex(correct)+'.',
      choices:shuffle([
        {text:fmtHex(correct),correct:true},
        {text:fmtHex(base+(j*cols+i)*4),correct:false,mc:"row-col-swap",fb:"행과 열이 바뀌었다. row major는 '행 번호 × 열 개수 + 열 번호'."},
        {text:fmtHex(base+(i+j)*4),correct:false,mc:"2d-flatten",fb:"인덱스를 그냥 더하면 안 된다. 한 행을 통째로 건너뛰어야 한다."},
        {text:fmtHex(base+(i*rows+j)*4),correct:false,mc:"row-size-confusion",fb:"건너뛰는 단위는 '행의 길이' — 열 개수 "+cols+"다, 행 개수가 아니라."}])};
  }
  return { id:"AP3",
    stem:'padd 도중, A의 <span class="mono">3x<sup>5</sup></span>와 B의 <span class="mono">-3x<sup>5</sup></span>가 만났다. 무슨 일이 일어나는가?',
    okfb:'계수 합이 0 — <span class="mono">if(coefficient)</span> 검사에 걸려 attach 자체가 일어나지 않는다. 항이 소거된다.',
    choices:shuffle([
      {text:"아무것도 attach되지 않고 둘 다 다음 항으로 넘어간다",correct:true},
      {text:"계수 0인 항 0x⁵ 이 결과 다항식에 attach된다",correct:false,mc:"zero-sum",fb:"계수 0인 항은 '없는 항'이다. if(coefficient)가 막는다."},
      {text:"지수가 같은 항끼리는 더할 수 없으므로 오류가 나고 멈춘다",correct:false,mc:"zero-sum",fb:"오류가 아니라 정상적인 소거다. 3x²-3x²처럼."}])};
}

/* ============ G5. Big-O 입문 (챕터 0 · 유닛 D) — 6유형 생성 ============
   출처 기준: OpenDSA AnalIntro/AnalAsymptotic/AnalCases (재서술).
   표기 문항의 정답은 "가장 간단한 관례 형태" — 상수·저차항을 벗긴 등급. */
function genG5(){
  const qtype=pick(["expr","code","race","order","double","cases"]);
  const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
  /* --- 1) 식 → 표기 --- */
  if(qtype==="expr"){
    const a=R(2,9), b=R(2,9), c=R(2,9);
    const v=pick(["quad","lin","nlogn"]);
    if(v==="quad") return {qtype, params:{v,a,b,c}, id:"G5-expr",
      stem:'어떤 알고리즘이 하는 일을 전부 세어 보니 <span class="mono">'+a+'n² + '+b+'n + '+c+'</span>번이었다. Big-O 이름표로 가장 알맞은 것은?', mono:true,
      okfb:'n이 커지면 '+a+'n²이 승부를 결정한다 — 상수 계수와 낮은 차수 항은 벗겨 쓴다.',
      choices:shuffle([
        {text:"O(n²)",correct:true},
        {text:"O("+a+"n²)",correct:false,mc:"keep-constant",fb:"표기 관례 — 상수 계수는 벗겨 쓴다."},
        {text:"O(n² + n)",correct:false,mc:"keep-lower-term",fb:"가장 빨리 자라는 항만 남긴다. 나머지는 n이 커질수록 의미를 잃는다."},
        {text:"O(n)",correct:false,mc:"wrong-degree",fb:"각 항 중 무엇이 가장 빨리 자라는지를 보라."}])};
    if(v==="lin") return {qtype, params:{v,a,b}, id:"G5-expr",
      stem:'어떤 알고리즘이 하는 일을 전부 세어 보니 <span class="mono">'+a+'n + '+b+'</span>번이었다. Big-O 이름표로 가장 알맞은 것은?', mono:true,
      okfb:'상수 계수와 상수항을 벗기면 남는 것은 n — 선형 등급이다.',
      choices:shuffle([
        {text:"O(n)",correct:true},
        {text:"O("+a+"n)",correct:false,mc:"keep-constant",fb:"표기 관례 — 상수 계수는 벗겨 쓴다."},
        {text:"O(1)",correct:false,mc:"wrong-degree",fb:"n이 커지면 시간도 커진다 — 상수 시간이 아니다."},
        {text:"O(n²)",correct:false,mc:"over-degree",fb:"n²으로 자라는 항이 있는지 보라."}])};
    return {qtype, params:{v,a,b}, id:"G5-expr",
      stem:'어떤 알고리즘이 하는 일을 전부 세어 보니 <span class="mono">'+a+'n log n + '+b+'n</span>번이었다. Big-O 이름표로 가장 알맞은 것은?', mono:true,
      okfb:'n log n이 n보다 빨리 자란다 — 가장 빠른 항만 남기고 상수를 벗긴다.',
      choices:shuffle([
        {text:"O(n log n)",correct:true},
        {text:"O(n)",correct:false,mc:"keep-lower-term",fb:"두 항 중 무엇이 더 빨리 자라는지 비교하라 — log n은 계속 커지는 인자다."},
        {text:"O("+a+"n log n)",correct:false,mc:"keep-constant",fb:"표기 관례 — 상수 계수는 벗겨 쓴다."},
        {text:"O(n²)",correct:false,mc:"over-degree",fb:"n·n과 n·log n은 다르다 — log n은 n보다 훨씬 느리게 자란다."}])};
  }
  /* --- 2) 코드 → 표기 --- */
  if(qtype==="code"){
    const k=pick(["const","single","nested","seq","half","innerC"]);
    const mk=(code,correct,wrongs,ok)=>({qtype,params:{k},id:"G5-code",
      stem:'다음 코드의 Big-O 표기로 가장 알맞은 것은?', mono:true, code, okfb:ok,
      choices:shuffle([{text:correct,correct:true}].concat(wrongs))});
    if(k==="const") return mk(
      ["x = a[0];","y = a[n-1];","sum = x + y;"],"O(1)",
      [{text:"O(n)",correct:false,mc:"stmt-count",fb:"n에 따라 늘어나는 반복이 있는가? 문장 수가 아니라 '자라는가'를 본다."},
       {text:"O(log n)",correct:false,mc:"grade-confusion",fb:"n이 커져도 실행되는 문장 수는 그대로다."},
       {text:"O(n²)",correct:false,mc:"grade-confusion",fb:"반복문이 없다."}],
      "n이 아무리 커져도 세 문장뿐 — 크기와 무관한 상수 시간이다.");
    if(k==="single") return mk(
      ["for (i = 0; i < n; i++)","    sum += a[i];"],"O(n)",
      [{text:"O(1)",correct:false,mc:"grade-confusion",fb:"루프가 n번 돈다 — n이 커지면 시간도 따라 커진다."},
       {text:"O(n²)",correct:false,mc:"over-degree",fb:"루프가 겹쳐 있는가, 한 겹인가."},
       {text:"O(log n)",correct:false,mc:"log-confusion",fb:"i는 1씩 자란다 — 건너뛰며 좁히는 루프가 아니다."}],
      "n번 도는 한 겹 루프 — n에 비례하는 선형 등급이다.");
    if(k==="nested") return mk(
      ["for (i = 0; i < n; i++)","    for (j = 0; j < n; j++)","        cnt++;"],"O(n²)",
      [{text:"O(n)",correct:false,mc:"nest-ignored",fb:"바깥이 한 바퀴 돌 때마다 안쪽이 통째로 n번 돈다."},
       {text:"O(2n)",correct:false,mc:"seq-vs-nest",fb:"연달아 도는 게 아니라 '겹쳐서' 돈다 — 합이 아니라 곱이다."},
       {text:"O(log n)",correct:false,mc:"log-confusion",fb:"건너뛰며 좁히는 루프가 아니다."}],
      "겹친 루프는 곱한다 — n × n = n² 등급.");
    if(k==="seq") return mk(
      ["for (i = 0; i < n; i++) sum += a[i];","for (j = 0; j < n; j++) cnt += b[j];"],"O(n)",
      [{text:"O(n²)",correct:false,mc:"seq-as-mult",fb:"루프가 '겹쳐' 있는가, '연달아' 있는가 — 연달아면 합이고, 합은 큰 쪽 등급만 남는다."},
       {text:"O(2n)",correct:false,mc:"keep-constant",fb:"표기 관례 — 상수 계수는 벗겨 쓴다."},
       {text:"O(1)",correct:false,mc:"grade-confusion",fb:"n이 커지면 두 루프 모두 길어진다."}],
      "n + n = 2n — 상수를 벗기면 선형 등급이다. 연달아 도는 루프는 합, 겹친 루프가 곱이다.");
    if(k==="half") return mk(
      ["for (i = 1; i < n; i = i * 2)","    cnt++;"],"O(log n)",
      [{text:"O(n)",correct:false,mc:"loop-as-linear",fb:"i가 1, 2, 4, 8…로 두 배씩 뛴다 — 몇 번 만에 n에 닿는지를 세어 보라."},
       {text:"O(n²)",correct:false,mc:"over-degree",fb:"한 겹 루프이고, 게다가 건너뛰며 자란다."},
       {text:"O(1)",correct:false,mc:"grade-confusion",fb:"n이 커지면 도는 횟수도 (천천히) 늘어난다."}],
      "1→2→4→…→n, 두 배씩 — 약 log₂n번 돈다. 이진 탐색과 같은 로그 등급.");
    return mk(
      ["for (i = 0; i < n; i++)","    for (j = 0; j < 5; j++)","        cnt++;"],"O(n)",
      [{text:"O(n²)",correct:false,mc:"nest-always-square",fb:"안쪽 루프는 n과 무관하게 5번 — 상수다. 곱해도 5n."},
       {text:"O(5n)",correct:false,mc:"keep-constant",fb:"표기 관례 — 상수 계수는 벗겨 쓴다."},
       {text:"O(log n)",correct:false,mc:"log-confusion",fb:"건너뛰며 좁히는 루프가 아니다."}],
      "안쪽은 항상 5번(상수) — 5n에서 상수를 벗기면 선형 등급이다. 겹쳤다고 무조건 제곱이 아니다.");
  }
  /* --- 3) 성장 비교 (결국 어느 쪽이 빠른가) --- */
  if(qtype==="race"){
    const v=pick(["n-n2","nlogn-n2","logn-n"]);
    const a=pick([50,100,200,500]);
    let fA,fB,cross;
    if(v==="n-n2"){ fA=a+"n"; fB="n²"; cross="n이 "+a+"을 넘는 순간부터"; }
    else if(v==="nlogn-n2"){ fA=a+"n log n"; fB="n²"; cross="n이 충분히 커지면"; }
    else { fA=a+" log n"; fB="n"; cross="n이 충분히 커지면"; }
    const flip=Math.random()<0.5; /* A/B 자리 셔플 */
    const nm1=flip?"B":"A", nm2=flip?"A":"B";
    return {qtype, params:{v,a,flip}, id:"G5-race",
      stem:'알고리즘 '+nm1+'은(는) <span class="mono">'+fA+'</span>번, 알고리즘 '+nm2+'은(는) <span class="mono">'+fB+'</span>번의 일을 한다. n이 계속 커지면?', mono:true,
      okfb:'성장률 등급이 낮은 쪽이 결국 이긴다 — '+cross+' 격차는 계속 벌어진다. 상수 계수는 승부를 못 뒤집는다.',
      choices:shuffle([
        {text:nm1+"이(가) 결국 더 빨라지고, 격차는 계속 벌어진다",correct:true},
        {text:nm2+"이(가) 결국 더 빨라지고, 격차는 계속 벌어진다",correct:false,mc:"coef-first",fb:"계수가 커 보여도, 등급이 다르면 n이 커질수록 등급이 이긴다."},
        {text:"둘의 우열이 n에 따라 계속 엎치락뒤치락 뒤집힌다",correct:false,mc:"growth-misread",fb:"성장률이 다른 두 곡선은 어느 지점 이후로는 다시 만나지 않는다."},
        {text:"처음에 빠른 쪽이 n과 무관하게 끝까지 더 빠르다",correct:false,mc:"growth-misread",fb:"작은 n의 승부와 큰 n의 승부는 다르다 — 등급이 결국 뒤집는다."}])};
  }
  /* --- 4) 성장률 등급 고르기 --- */
  if(qtype==="order"){
    const LADDER=[["1",0],["log n",1],["n",2],["n log n",3],["n²",4],["2ⁿ",5]];
    const four=shuffle(LADDER.slice()).slice(0,4);
    const slow=Math.random()<0.5;
    const target=four.reduce((x,y)=> slow ? (x[1]<y[1]?x:y) : (x[1]>y[1]?x:y));
    return {qtype, params:{four:four.map(f=>f[0]), slow}, id:"G5-order",
      stem:'다음 중 n이 커질 때 <b>가장 '+(slow?"느리게":"빨리")+' 자라는</b> 것은?',
      okfb:'계급표 순서 — 1 < log n < n < n log n < n² < 2ⁿ.',
      choices:shuffle(four.map(f=>f[0]===target[0]
        ?{text:f[0],correct:true}
        :{text:f[0],correct:false,mc:"ladder-confusion",fb:"계급표를 다시 그려 보라 — 로그는 매우 느리게, 지수는 무섭게 자란다."}))};
  }
  /* --- 5) 두 배 문제 --- */
  if(qtype==="double"){
    const g=pick([
      {o:"O(n)", ans:"약 두 배로 늘어난다", why:"2n — 비례해서 늘어난다."},
      {o:"O(n²)", ans:"약 네 배로 늘어난다", why:"(2n)² = 4n² — 제곱은 두 배가 아니라 네 배."},
      {o:"O(log n)", ans:"딱 한 단계만 늘어난다", why:"log(2n) = log n + 1 — 거의 그대로, 딱 한 번 더."},
      {o:"O(1)", ans:"전혀 변하지 않는다", why:"애초에 n과 무관한 시간이다."}]);
    const all=["약 두 배로 늘어난다","약 네 배로 늘어난다","딱 한 단계만 늘어난다","전혀 변하지 않는다"];
    return {qtype, params:{o:g.o}, id:"G5-double",
      stem:'어떤 알고리즘이 <span class="mono">'+g.o+'</span> 등급이다. 입력 크기가 <b>두 배</b>가 되면 실행 시간은 대략 어떻게 되는가?', mono:true,
      okfb:g.why,
      choices:shuffle(all.map(t=>t===g.ans
        ?{text:t,correct:true}
        :{text:t,correct:false,mc:"double-sense",fb:"등급의 식에 2n을 직접 넣어 보라."}))};
  }
  /* --- 6) 최선·최악·평균 --- */
  const n=pick([100,500,1000,2000]);
  const sub=pick(["worst","best","avg","policy"]);
  if(sub==="policy"){
    const scene=pick([
      {txt:"항공 관제 소프트웨어처럼, 어떤 입력이 와도 응답 시간이 <b>보장</b>되어야 하는 시스템", ans:"최악의 경우", why:"최악을 알면 '적어도 이만큼은 된다'는 보장이 생긴다."},
      {txt:"입력의 분포를 잘 알고 있고, 같은 알고리즘을 다양한 입력에 수없이 반복 실행하는 상황", ans:"평균적인 경우", why:"분포를 알 때는 평균이 실제 체감 비용을 가장 잘 말해 준다."}]);
    return {qtype, params:{sub, ans:scene.ans}, id:"G5-cases",
      stem:scene.txt+' — 어느 경우를 기준으로 분석하는 것이 적절한가?',
      okfb:scene.why,
      choices:shuffle([
        {text:scene.ans,correct:true},
        {text:scene.ans==="최악의 경우"?"평균적인 경우":"최악의 경우",correct:false,
         mc:scene.ans==="최악의 경우"?"need-guarantee":"dist-known",
         fb:scene.ans==="최악의 경우"?"평균은 입력의 분포를 알아야 의미가 있고, '보장'은 주지 못한다.":"보장이 필요한 상황이 아니라면, 알고 있는 분포를 활용하는 편이 실제에 가깝다."},
        {text:"최선의 경우",correct:false,mc:"best-not-representative",fb:"최선은 운이 좋은 하나의 경우일 뿐 — 대표성이 없어 거의 쓰지 않는다."},
        {text:"어느 것이든 결과가 같다",correct:false,mc:"cases-same",fb:"같은 알고리즘도 입력에 따라 비용이 다르다 — 그래서 세 경우를 구분한다."}])};
  }
  const logn=Math.round(Math.log2(n));
  const half="약 "+Math.round(n/2).toLocaleString()+"번";
  const CH6={
    worst:{q:'<b>최악의 경우</b> 비교 횟수는?', ans:n.toLocaleString()+"번", why:"찾는 값이 마지막 칸에 있거나 — 아예 없을 때. 끝까지 다 본다."},
    best:{q:'<b>최선의 경우</b> 비교 횟수는?', ans:"1번", why:"찾는 값이 첫 칸에 있을 때 — 단 한 번의 비교로 끝난다."},
    avg:{q:'찾는 값이 배열 안에 <b>있고</b>, 모든 위치가 같은 확률이라고 하자. <b>평균</b> 비교 횟수는?', ans:half, why:"평균은 대략 절반을 본다 — 단, '값이 있고 위치가 균등하다'는 가정이 있어야 성립한다."}};
  const c=CH6[sub];
  const opts=[{text:"1번"},{text:half},{text:n.toLocaleString()+"번"},{text:"약 "+logn+"번"}];
  return {qtype, params:{sub,n}, id:"G5-cases",
    stem:'정렬되지 않은 '+n.toLocaleString()+'칸 배열에서 순차 탐색으로 값을 찾는다. '+c.q,
    okfb:c.why,
    choices:shuffle(opts.map(o=>o.text===c.ans
      ?{text:o.text,correct:true}
      :{text:o.text,correct:false,
        mc:o.text==="약 "+logn+"번"?"binary-confusion":"case-confusion",
        fb:o.text==="약 "+logn+"번"?"그 숫자는 '정렬된' 배열에서 절반씩 버릴 때 얘기다 — 지금은 정렬돼 있지 않다.":"최선·평균·최악 중 지금 묻는 경우가 무엇인지 다시 보라."}))};
}

/* ================================================================
   ch02 생성기 — 스택과 큐 (규약 §5: 정답은 내장 시뮬레이터가 계산)
   표준 연산명: push/pop/enqueue/dequeue (감수 확정)
   ================================================================ */
function g2R(a,b){ return a+Math.floor(Math.random()*(b-a+1)); }
function g2Vals(n){ return shuffle([1,2,3,4,5,6,7,8,9].slice()).slice(0,n); }
function g2NumFill(exclude){ /* 부족한 선택지를 채울 안전한 숫자 오답들 */
  const out=[];
  for(const v of shuffle([1,2,3,4,5,6,7,8,9].slice())){
    if(exclude.includes(String(v))) continue;
    out.push({text:String(v),correct:false,mc:"order-off",fb:"연산 로그를 처음부터 한 줄씩 다시 밟아 보라."});
  }
  return out;
}
function g2Fill(cands, correct, n){ /* 정답+후보에서 중복 없이 n개 채움 */
  const out=[], seen=new Set([String(correct.text)]);
  out.push(correct);
  for(const c of cands){ if(out.length>=n) break; const k=String(c.text); if(seen.has(k)) continue; seen.add(k); out.push(c); }
  return shuffle(out);
}

/* --- G6. 스택 시뮬레이터 --- */
function genG6(hard){
  const qtype=pick(hard?["topval","kpop","order"]:["topval","kpop","topidx","next","order"]);
  const MAX=hard?6:pick([4,5]);
  if(qtype==="next"){
    const full=Math.random()<0.5;
    if(full){
      const vs=g2Vals(MAX);
      const ops=vs.map(v=>"push("+v+")");
      const nv=g2Vals(9).find(x=>!vs.includes(x));
      return {qtype, params:{MAX,full:true}, id:"G6",
        stem:'MAX_STACK_SIZE = '+MAX+'. 아래 연산을 마친 뒤 <span class="mono">push('+nv+')</span>를 하면 무슨 일이 일어나는가?', mono:true,
        okfb:'top이 이미 마지막 유효 인덱스('+(MAX-1)+') — 포화 검사에 걸려 stack_full()이 호출되고 삽입되지 않는다.',
        viz:{type:"stack",cells:vs,top:MAX-1,max:MAX}, ops,
        choices:shuffle([
          {text:"stack_full()이 호출되고 삽입되지 않는다",correct:true},
          {text:"stack[top]의 값을 덮어쓰고 top은 그대로 유지된다",correct:false,mc:"overwrite",fb:"push는 덮어쓰지 않는다 — 넣기 전에 포화부터 검사한다."},
          {text:"가장 아래 값이 밀려나가고 새 값이 위에 삽입된다",correct:false,mc:"shift-out",fb:"스택의 아래쪽은 건드리지 않는다 — 모든 일은 top에서만."},
          {text:"top이 "+MAX+"가 되고 stack["+MAX+"]에 삽입된다",correct:false,mc:"bounds",fb:"유효 인덱스는 0~"+(MAX-1)+"까지다."}])};
    }
    const v=g2Vals(1)[0];
    return {qtype, params:{MAX,full:false}, id:"G6",
      stem:'<span class="mono">push('+v+')</span> 후 <span class="mono">pop()</span>을 두 번 하면, 두 번째 pop에서는 무슨 일이 일어나는가?', mono:true,
      okfb:'첫 pop으로 top이 -1(공백) — 두 번째 pop은 공백 검사에 걸려 stack_empty()가 호출된다(오류 key 반환).',
      viz:{type:"stack",cells:[v],top:0,max:MAX}, ops:["push("+v+")","pop()  → "+v,"pop()  → ?"],
      choices:shuffle([
        {text:"stack_empty()가 호출된다 (오류 key 반환)",correct:true},
        {text:"배열 칸에 남아 있던 "+v+"가 한 번 더 그대로 반환된다",correct:false,mc:"stale-read",fb:"pop된 값은 스택에서 내려갔다 — top은 이미 -1이다."},
        {text:"공백일 때의 기본값인 0이 반환된다",correct:false,mc:"zero-default",fb:"공백 스택에서 값을 만들어내지 않는다 — 검사부터 한다."},
        {text:"top이 -2로 내려가고 쓰레기 값이 반환된다",correct:false,mc:"bounds",fb:"공백 검사(top == -1)가 먼저다 — top은 더 내려가지 않는다."}])};
  }
  /* 유효 시퀀스 생성 */
  const vals=g2Vals(hard?8:6); let vi=0;
  const st=[], ops=[], pops=[];
  const nOps=hard?g2R(8,10):g2R(5,7);
  for(let i=0;i<nOps;i++){
    const canPush=st.length<MAX&&vi<vals.length, canPop=st.length>0;
    const doPush = !canPop ? true : (!canPush ? false : Math.random()<0.62);
    if(doPush){ const v=vals[vi++]; st.push(v); ops.push("push("+v+")"); }
    else { const v=st.pop(); pops.push(v); ops.push("pop()  → ?"); }
  }
  if(st.length===0){ const v=vals[vi++]; st.push(v); ops.push("push("+v+")"); }
  if(qtype==="kpop"&&pops.length===0){ const v=st.pop(); pops.push(v); ops.push("pop()  → ?"); if(st.length===0){ const w=vals[vi++]; st.push(w); ops.push("push("+w+")"); } }
  const viz={type:"stack",cells:[],top:-1,max:MAX}; /* 초기 상태만 표시 — 답은 로그를 따라가며 계산 (감수: 그림 답 노출 방지) */
  if(qtype==="topval"){
    const correct=st[st.length-1];
    const cands=[
      {text:String(st[0]),correct:false,mc:"fifo-confusion",fb:"스택은 위(top)에서 꺼낸다 — 맨 아래가 아니다."},
      st.length>1?{text:String(st[st.length-2]),correct:false,mc:"top-off",fb:"push와 pop이 끝난 뒤의 맨 위가 어디인지 다시 따라가 보라."}:null,
      pops.length?{text:String(pops[pops.length-1]),correct:false,mc:"stale-read",fb:"pop된 값은 이미 스택에 없다."}:null,
      {text:String(vals[vi]!==undefined?vals[vi]:vals[0]),correct:false,mc:"top-off",fb:"연산 로그를 처음부터 다시 밟아 보라."}
    ].filter(Boolean);
    const fill1=cands.concat(g2NumFill([String(correct)].concat(cands.map(c=>c.text))));
    return {qtype,params:{MAX,ops},id:"G6",stem:'연산이 모두 끝난 뒤, <b>top이 가리키는 값</b>은?',mono:true,viz,ops,
      okfb:'남아 있는 것들 중 가장 나중에 push된 값이 top이다.',choices:g2Fill(fill1,{text:String(correct),correct:true},4)};
  }
  if(qtype==="kpop"){
    const k=g2R(1,pops.length);
    const correct=pops[k-1];
    const kthPush=vals[k-1];
    const cands=[
      kthPush!==correct?{text:String(kthPush),correct:false,mc:"fifo-confusion",fb:"k번째로 '넣은' 값이 아니라 — pop 시점의 top이 무엇이었나."}:null,
      pops[k]!==undefined?{text:String(pops[k]),correct:false,mc:"order-off",fb:"몇 번째 pop인지 로그에서 다시 세어 보라."}:null,
      k>1?{text:String(pops[k-2]),correct:false,mc:"order-off",fb:"몇 번째 pop인지 로그에서 다시 세어 보라."}:null,
      st.length?{text:String(st[st.length-1]),correct:false,mc:"state-mix",fb:"그건 지금 스택에 남아 있는 값이다."}:null
    ].filter(Boolean);
    const fill2=cands.concat(g2NumFill([String(correct)].concat(cands.map(c=>c.text))));
    return {qtype,params:{MAX,ops,k},id:"G6",stem:(k===1?"첫":k+"번")+ '째 <span class="mono">pop()</span>이 반환한 값은?',mono:true,viz,ops,
      okfb:'pop은 그 순간의 top을 반환한다 — 로그를 위에서부터 한 줄씩 따라가면 된다.',choices:g2Fill(fill2,{text:String(correct),correct:true},4)};
  }
  if(qtype==="topidx"){
    const correct=st.length-1;
    const cands=[
      {text:String(st.length),correct:false,mc:"pre-post",fb:"push는 ++*top(전위)로 올린 '그 자리'에 넣는다 — 원소 수와 top의 관계를 보라."},
      {text:String(correct-1<-1?-1:correct-1),correct:false,mc:"pre-post",fb:"pop은 값을 먼저 주고 top을 내린다((*top)--)."},
      {text:"-1",correct:false,mc:"init-fix",fb:"-1은 공백일 때다 — 지금 스택이 비어 있는가?"}
    ];
    return {qtype,params:{MAX,ops},id:"G6",stem:'연산이 모두 끝난 뒤, 변수 <span class="mono">top</span>의 값(인덱스)은?',mono:true,viz,ops,
      okfb:'원소가 n개면 top은 n-1 — top은 개수가 아니라 맨 위 원소의 인덱스다.',choices:g2Fill(cands,{text:String(correct),correct:true},4)};
  }
  /* order — 최소 2원소 보장 */
  while(st.length<2 && vi<vals.length && st.length<MAX){ const v=vals[vi++]; st.push(v); ops.push("push("+v+")"); }
  const rev=st.slice().reverse();
  const correct=rev.join(", ");
  const rot=rev.slice(1).concat([rev[0]]); /* 구성은 같고 순서만 다른 오답 */
  const cands=[
    {text:st.join(", "),correct:false,mc:"fifo-confusion",fb:"먼저 넣은 것부터 나오는 건 큐다 — 스택은 반대다."},
    {text:vals.slice(0,vi).join(", "),correct:false,mc:"history-mix",fb:"이미 pop되어 나간 값은 다시 나오지 않는다."},
    {text:rot.join(", "),correct:false,mc:"order-off",fb:"맨 위(top)의 값부터 차례로 내려온다."}
  ].filter(c=>c.text!==correct);
  return {qtype,params:{MAX,ops},id:"G6",stem:'지금부터 <b>전부 pop</b>하면 값이 나오는 순서는?',mono:true,viz,ops,
    okfb:'맨 위에서부터 — 남아 있는 것들의 역순(나중에 넣은 것부터)이다.',choices:g2Fill(cands,{text:correct,correct:true},4)};
}

/* --- G7. (선형) 큐 시뮬레이터 --- */
function genG7(hard){
  const qtype=pick(hard?["fr","kdel","remain"]:["fr","kdel","remain","next"]);
  const MAX=hard?6:pick([4,5]);
  if(qtype==="next"){
    const full=Math.random()<0.5;
    if(full){
      const ops=[]; for(let i=1;i<=MAX;i++) ops.push("enqueue(J"+i+")");
      return {qtype,params:{MAX,full:true},id:"G7",
        stem:'MAX_QUEUE_SIZE = '+MAX+'. J1~J'+MAX+'를 모두 넣어 rear가 '+(MAX-1)+'이 되었다 (dequeue는 없었음). 여기서 <span class="mono">enqueue</span>를 하면?',mono:true,
        okfb:'rear == MAX_QUEUE_SIZE-1 — queue_full()이 호출된다. (앞이 비어 있다면 전체를 왼쪽으로 이동시키는 것이 queue_full의 역할 — 비싼 작업이라 원형 큐가 등장한다)',
        viz:{type:"queue",slots:Array.from({length:MAX},(_,i)=>"J"+(i+1)),front:-1,rear:MAX-1,max:MAX}, ops,
        choices:shuffle([
          {text:"queue_full()이 호출된다",correct:true},
          {text:"rear가 0으로 돌아가 삽입된다",correct:false,mc:"circular-preview",fb:"그렇게 도는 것은 '원형 큐'의 방식이다 — 선형 큐는 돌지 않는다."},
          {text:"J1을 덮어쓴다",correct:false,mc:"overwrite",fb:"큐는 덮어쓰지 않는다 — 검사부터 한다."},
          {text:"front가 1 줄어 자리가 생긴다",correct:false,mc:"front-misuse",fb:"front는 삭제 때만 움직인다."}])};
    }
    return {qtype,params:{MAX,full:false},id:"G7",
      stem:'front == rear 인 큐에서 <span class="mono">dequeue</span>를 하면?',mono:true,
      okfb:'front == rear 는 공백 — queue_empty()가 호출된다(오류 key 반환).',
      viz:{type:"queue",slots:Array.from({length:MAX},()=>null),front:-1,rear:-1,max:MAX}, ops:["(공백 큐)"],
      choices:shuffle([
        {text:"queue_empty()가 호출된다 (오류 key 반환)",correct:true},
        {text:"queue[0] 자리에 남아 있던 옛 값이 한 번 더 반환된다",correct:false,mc:"stale-read",fb:"공백 검사(front==rear)가 먼저다."},
        {text:"front가 1 증가하고 쓰레기 값이 반환된다",correct:false,mc:"state-corrupt",fb:"공백이면 상태를 바꾸지 않고 오류를 돌려준다."},
        {text:"rear가 1 감소해 공백 상태가 유지된다",correct:false,mc:"rear-misuse",fb:"rear는 삽입 때만 움직인다."}])};
  }
  const e=hard?MAX:g2R(3,MAX), d=hard?g2R(2,e-1):g2R(1,e-1);
  /* 유효 인터리브: enq를 먼저 충분히 */
  const ops=[]; let eq=0,dq=0;
  while(eq<e||dq<d){
    const canE=eq<e, canD=dq<d&&dq<eq;
    const doE = !canD ? true : (!canE ? false : Math.random()<0.6);
    if(doE){ eq++; ops.push("enqueue(J"+eq+")"); } else { dq++; ops.push("dequeue() → ?"); }
  }
  const front=d-1, rear=e-1;
  const viz={type:"queue",slots:Array.from({length:MAX},()=>null),front:-1,rear:-1,max:MAX}; /* 초기 상태만 표시 */
  if(qtype==="fr"){
    const correct="front = "+front+", rear = "+rear;
    const cands=[
      {text:"front = "+d+", rear = "+rear,correct:false,mc:"front-off",fb:"front는 '첫 원소의 한 칸 앞'을 가리킨다 — dequeue가 먼저 올리고 반환하기 때문."},
      {text:"front = -1, rear = "+rear,correct:false,mc:"init-fix",fb:"dequeue가 일어날 때마다 front도 움직인다."},
      {text:"front = "+rear+", rear = "+front,correct:false,mc:"swap",fb:"rear는 삽입, front는 삭제 쪽이다."}
    ];
    return {qtype,params:{MAX,ops},id:"G7",stem:'연산이 모두 끝난 뒤 <span class="mono">front</span>와 <span class="mono">rear</span>의 값은? (초기값 둘 다 -1)',mono:true,viz,ops,
      okfb:'enqueue마다 rear가, dequeue마다 front가 1씩 오른쪽으로 — 각각 몇 번 움직였는지 세면 된다.',choices:g2Fill(cands,{text:correct,correct:true},4)};
  }
  if(qtype==="kdel"){
    const k=g2R(1,d), correct="J"+k;
    const cands=[
      {text:"J"+e,correct:false,mc:"lifo-confusion",fb:"마지막에 넣은 것부터 나오는 건 스택이다 — 큐는 먼저 온 순서."},
      {text:"J"+(k+1),correct:false,mc:"order-off",fb:"몇 번째 dequeue인지 다시 세어 보라."},
      k>1?{text:"J"+(k-1),correct:false,mc:"order-off",fb:"몇 번째 dequeue인지 다시 세어 보라."}:{text:"J"+(e-1),correct:false,mc:"order-off",fb:"먼저 들어간 순서대로 나온다."}
    ];
    return {qtype,params:{MAX,ops,k},id:"G7",stem:(k===1?"첫":k+"번")+'째 <span class="mono">dequeue</span>가 반환한 값은?',mono:true,viz,ops,
      okfb:'FIFO — 들어간 순서 그대로 나온다.',choices:g2Fill(cands,{text:correct,correct:true},4)};
  }
  if(qtype==="remain"){
    const rem=[]; for(let i=d+1;i<=e;i++) rem.push("J"+i);
    const correct=rem.join(", ");
    const others1=[]; for(let i=1;i<=e-d;i++) others1.push("J"+i);
    const others2=[]; for(let i=1;i<=e;i++) others2.push("J"+i);
    const cands=[
      {text:others1.join(", "),correct:false,mc:"lifo-confusion",fb:"나가는 쪽은 앞(front)이다 — 앞 번호부터 사라진다."},
      {text:others2.join(", "),correct:false,mc:"no-remove",fb:"dequeue된 원소는 큐에서 나갔다."},
      rem.length>1?{text:rem.slice().reverse().join(", "),correct:false,mc:"order-off",fb:"큐 안의 순서는 뒤집히지 않는다."}:{text:"(없음)",correct:false,mc:"order-off",fb:"아직 남아 있는 원소가 있다."}
    ];
    return {qtype,params:{MAX,ops},id:"G7",stem:'연산이 모두 끝난 뒤, 큐에 <b>남아 있는</b> 원소는? (앞→뒤 순서)',mono:true,viz,ops,
      okfb:'앞 번호부터 dequeue로 나가고, 남는 것은 그 뒤 번호들이다.',choices:g2Fill(cands,{text:correct,correct:true},4)};
  }
}

/* --- G8. 원형 큐 --- */
function genG8(hard){
  const qtype=pick(hard?["fr","count","slot"]:["fr","count","nextfull","slot"]);
  const MAX=pick(hard?[6,7]:[5,6]);
  /* a번 넣고 b번 빼고 c번 더 넣기 — 랩어라운드 유도 */
  let a,b,c,tries=0;
  do{ a=g2R(2,MAX-1); b=g2R(1,a); c=g2R(1,MAX-1-(a-b)); tries++; }
  while(tries<50 && !hard && (a+c)<MAX && Math.random()<0.6); /* 가급적 rear가 한 바퀴 돌게 */
  if(qtype==="nextfull"){ /* count를 정확히 MAX-1로 보정 */
    c=MAX-1-(a-b); if(c<0){ c=0; b=a-(MAX-1); if(b<1){ b=1; a=MAX; } }
    if(a>MAX-1){ a=MAX-1; b=g2R(1,a-1); c=MAX-1-(a-b); }
  }
  const front=b%MAX, rear=(a+c)%MAX, count=a-b+c;
  const ops=[];
  for(let i=1;i<=a;i++) ops.push("enqueue(J"+i+")");
  for(let i=1;i<=b;i++) ops.push("dequeue() → ?");
  for(let i=a+1;i<=a+c;i++) ops.push("enqueue(J"+i+")");
  const vals={}; for(let k=b+1;k<=a+c;k++) vals[k%MAX]="J"+k;
  const viz = (qtype==="nextfull")
    ? {type:"circ",max:MAX,front,rear,vals}                 /* 상황 판단형은 현재 상태가 문제의 일부 */
    : {type:"circ",max:MAX,front:0,rear:0,vals:{}};        /* 계산형은 초기 상태만 (그림 답 노출 방지) */
  if(qtype==="fr"){
    const correct="front = "+front+", rear = "+rear;
    const noMod="front = "+b+", rear = "+(a+c);
    const cands=[
      noMod!==correct?{text:noMod,correct:false,mc:"no-modulo",fb:"회전은 (x+1) % MAX_QUEUE_SIZE — 끝을 지나면 0으로 돌아온다."}:null,
      {text:"front = "+rear+", rear = "+front,correct:false,mc:"swap",fb:"rear는 삽입, front는 삭제 쪽이다."},
      {text:"front = "+((front+1)%MAX)+", rear = "+rear,correct:false,mc:"off-by-one",fb:"enqueue와 dequeue가 각각 몇 번 회전시켰는지 세어 보라."}
    ].filter(Boolean);
    return {qtype,params:{MAX,a,b,c},id:"G8",stem:'MAX_QUEUE_SIZE = '+MAX+' 원형 큐 (front, rear 초기값 0). 연산이 모두 끝난 뒤 두 값은?',mono:true,viz,ops,
      okfb:'enqueue 횟수만큼 rear가, dequeue 횟수만큼 front가 회전한다 — 매번 % '+MAX+'.',choices:g2Fill(cands,{text:correct,correct:true},4)};
  }
  if(qtype==="count"){
    const cands=[
      {text:String(count+1>MAX-1?count-1:count+1),correct:false,mc:"off-by-one",fb:"넣은 횟수 − 뺀 횟수를 세면 된다."},
      {text:String(MAX),correct:false,mc:"capacity",fb:"원형 큐는 MAX개를 다 채울 수 없다 — 한 칸은 신호용이다."},
      {text:String(Math.max(0,count-1)),correct:false,mc:"off-by-one",fb:"넣은 횟수 − 뺀 횟수를 세면 된다."}
    ];
    return {qtype,params:{MAX,a,b,c},id:"G8",stem:'연산이 모두 끝난 뒤, 큐에 저장되어 있는 원소의 <b>개수</b>는?',mono:true,viz,ops,
      okfb:'enqueue '+(a+c)+'번 − dequeue '+b+'번.',choices:g2Fill(cands,{text:String(count),correct:true},4)};
  }
  if(qtype==="nextfull"){
    return {qtype,params:{MAX,a,b,c},id:"G8",stem:'지금 저장된 원소는 '+count+'개 (MAX_QUEUE_SIZE = '+MAX+'). 여기서 <span class="mono">enqueue</span>를 하면?',mono:true,viz,ops,
      okfb:'rear를 회전시켜 보면 front와 같아진다 — 포화. queue_full()이 호출되고 삽입되지 않는다. (그래서 최대 MAX-1개)',
      choices:shuffle([
        {text:"회전된 rear가 front와 같아져 queue_full()이 호출된다",correct:true},
        {text:"남은 빈 한 칸까지 채우며 정상적으로 삽입된다",correct:false,mc:"capacity",fb:"그 한 칸은 '가득'과 '텅 빔'을 구별하는 신호용이다."},
        {text:"front가 가리키는 자리의 값을 덮어쓰고 삽입된다",correct:false,mc:"overwrite",fb:"큐는 덮어쓰지 않는다 — 검사부터."},
        {text:"회전된 rear가 front와 같아져 queue_empty()가 호출된다",correct:false,mc:"full-empty",fb:"공백이 아니라 포화 상황이다 — 같은 조건이라도 '언제' 같아지는가가 다르다."}])};
  }
  /* slot */
  const occupied=Object.keys(vals).map(Number);
  const s=pick(occupied);
  const correct=vals[s];
  const cands=occupied.filter(x=>x!==s).map(x=>({text:vals[x],correct:false,mc:"slot-track",fb:"k번째로 넣은 원소는 queue["+"(k % "+MAX+")"+"] 자리에 놓인다."}));
  for(let k2=1;k2<=b;k2++) cands.push({text:"J"+k2,correct:false,mc:"stale-read",fb:"그 원소는 이미 dequeue되어 큐를 떠났다."});
  cands.push({text:"빈 칸",correct:false,mc:"slot-track",fb:"그 자리는 비어 있지 않다 — 어느 enqueue가 거기 닿았는지 세어 보라."});
  cands.push({text:"J"+(a+c+1),correct:false,mc:"slot-track",fb:"넣은 적 없는 원소다 — 로그를 다시 보라."});
  return {qtype,params:{MAX,a,b,c,s},id:"G8",stem:'연산이 모두 끝난 뒤, <span class="mono">queue['+s+']</span>에 저장되어 있는 값은?',mono:true,viz,ops,
    okfb:'k번째 enqueue는 rear가 k % '+MAX+'로 회전한 자리에 넣는다.',choices:g2Fill(cands,{text:correct,correct:true},4)};
}

/* --- G9. 후위 표기식 평가 --- */
function g9Build(nLeaf){
  /* 무작위 이진 트리 + 값 배정, 나눗셈 정확·중간값 제한 검증. 실패 시 null */
  const OPS=["+","-","*","/"];
  let nodes=g2Vals(nLeaf).map(v=>({v}));
  while(nodes.length>1){
    const i=g2R(0,nodes.length-2);
    nodes.splice(i,2,{op:pick(OPS),l:nodes[i],r:nodes[i+1]});
  }
  const root=nodes[0];
  let ok=true;
  function ev(n){
    if(!ok) return 0;
    if(n.v!==undefined) return n.v;
    const a=ev(n.l), b=ev(n.r);
    let r;
    if(n.op==="+") r=a+b; else if(n.op==="-") r=a-b; else if(n.op==="*") r=a*b;
    else { if(b===0||a%b!==0){ ok=false; return 0; } r=a/b; }
    if(Math.abs(r)>99){ ok=false; return 0; }
    return r;
  }
  const val=ev(root);
  if(!ok) return null;
  const toks=[];
  (function po(n){ if(n.v!==undefined){ toks.push(String(n.v)); return; } po(n.l); po(n.r); toks.push(n.op); })(root);
  /* 스택 시뮬레이션 (토큰별 스택 상태) */
  const states=[]; const st=[];
  for(const t of toks){
    if(/^-?\d+$/.test(t)) st.push(Number(t));
    else { const b=st.pop(), a=st.pop();
      st.push(t==="+"?a+b:t==="-"?a-b:t==="*"?a*b:a/b); }
    states.push(st.slice());
  }
  return {root,val,toks,states};
}
function g9Nums(correct){
  const out=[];
  for(const d of [1,-1,2,-2,3,-3,4,-4,5,-5]) out.push({text:String(correct+d),correct:false,mc:"calc-slip",fb:"토큰을 하나씩, 스택을 그려 가며 다시 밟아 보라."});
  return out;
}
function genG9(){
  let e=null;
  for(let i=0;i<300&&!e;i++) e=g9Build(pick([3,4]));
  if(!e){ e=g9Build(3); } /* 이론상 도달 불가 보호 */
  const expr=e.toks.join(" ");
  const qtype=pick(["result","stackAt","topAt"]);
  const base={id:"G9", mono:true, viz:{type:"ops",list:e.toks}, expr};
  if(qtype==="result"){
    const cands=[];
    const d1=e.val+pick([1,2,-1,-2,3]); cands.push({text:String(d1),correct:false,mc:"calc-slip",fb:"토큰을 하나씩, 스택을 그려 가며 다시 밟아 보라."});
    const d2=e.val*-1!==e.val?{text:String(-e.val),correct:false,mc:"operand-order",fb:"뺄셈·나눗셈은 순서가 중요하다 — 나중에 pop된 것이 왼쪽이다."}:null;
    if(d2) cands.push(d2);
    cands.push({text:String(e.val+pick([4,-4,5,-5])),correct:false,mc:"calc-slip",fb:"토큰을 하나씩, 스택을 그려 가며 다시 밟아 보라."});
    cands.push({text:String(e.val===0?7:0),correct:false,mc:"calc-slip",fb:"토큰을 하나씩, 스택을 그려 가며 다시 밟아 보라."});
    return {...base, qtype, params:{expr},
      stem:'후위 표기식 <span class="mono">'+expr+'</span> 을 스택으로 계산한 <b>최종 결과</b>는?',
      okfb:'피연산자는 push, 연산자는 두 개 pop(나중에 나온 것이 왼쪽) → 연산 → push. 끝나면 톱이 답.',
      choices:g2Fill(cands.concat(g9Nums(e.val)),{text:String(e.val),correct:true},4)};
  }
  /* 스택 2개 이상인 시점 고르기 */
  const ks=e.states.map((s,i)=>({s,i})).filter(x=>x.s.length>=2);
  const kk=ks.length?pick(ks).i:e.states.length-1;
  const stAt=e.states[kk];
  if(qtype==="stackAt"){
    const correct=stAt.join(", ");
    const cands=[];
    if(stAt.length>=2){ const sw=stAt.slice(); const t=sw[sw.length-1]; sw[sw.length-1]=sw[sw.length-2]; sw[sw.length-2]=t;
      if(sw.join(", ")!==correct) cands.push({text:sw.join(", "),correct:false,mc:"stack-order",fb:"아래→위 순서다 — 먼저 push된 것이 아래."}); }
    if(kk>0&&e.states[kk-1].join(", ")!==correct) cands.push({text:e.states[kk-1].join(", "),correct:false,mc:"step-off",fb:"몇 번째 토큰까지 처리했는지 다시 세어 보라."});
    cands.push({text:stAt.join(", ")+", "+e.toks[kk+1<e.toks.length?kk+1:kk],correct:false,mc:"op-push",fb:"평가에서 연산자는 스택에 들어가지 않는다 — 만나는 즉시 계산한다."});
    if(kk+1<e.states.length&&e.states[kk+1].join(", ")!==correct) cands.push({text:e.states[kk+1].join(", "),correct:false,mc:"step-off",fb:"몇 번째 토큰까지 처리했는지 다시 세어 보라."});
    { const m1=stAt.slice(); m1[m1.length-1]=m1[m1.length-1]+pick([1,-1,2]);
      if(m1.join(", ")!==correct) cands.push({text:m1.join(", "),correct:false,mc:"calc-slip",fb:"토큰을 하나씩, 스택을 그려 가며 다시 밟아 보라."});
      const m2=stAt.slice(); m2[0]=m2[0]+pick([1,-1,3]);
      if(m2.join(", ")!==correct) cands.push({text:m2.join(", "),correct:false,mc:"calc-slip",fb:"토큰을 하나씩, 스택을 그려 가며 다시 밟아 보라."}); }
    return {...base, qtype, params:{expr,k:kk+1},
      stem:'<span class="mono">'+expr+'</span> 에서 <b>'+(kk+1)+'번째 토큰('+e.toks[kk]+')까지</b> 처리한 직후, 스택의 내용은? (아래→위)',
      okfb:'피연산자는 push, 연산자는 pop 두 번(나중 pop이 왼쪽)→계산→push — 토큰을 하나씩.',
      choices:g2Fill(cands,{text:correct,correct:true},4)};
  }
  const correct=stAt[stAt.length-1];
  const cands=[
    stAt.length>1?{text:String(stAt[0]),correct:false,mc:"stack-order",fb:"톱은 가장 나중에 push된 값이다."}:null,
    {text:String(correct+pick([1,-1,2,-2])),correct:false,mc:"calc-slip",fb:"토큰을 하나씩, 스택을 그려 가며."},
    {text:String(correct*-1!==correct?-correct:correct+3),correct:false,mc:"operand-order",fb:"뺄셈·나눗셈은 나중에 pop된 것이 왼쪽이다."}
  ].filter(Boolean);
  return {...base, qtype, params:{expr,k:kk+1},
    stem:'<span class="mono">'+expr+'</span> 에서 <b>'+(kk+1)+'번째 토큰('+e.toks[kk]+')까지</b> 처리한 직후, <b>스택의 톱</b>은?',
    okfb:'그 시점까지의 push/pop을 따라가면 톱이 보인다.',
    choices:g2Fill(cands.concat(g9Nums(correct)),{text:String(correct),correct:true},4)};
}

/* --- G10. 중위→후위 변환 (괄호 묶기법) --- */
function g10Build(nLeaf){
  const OPS=["+","-","*","/"];
  const letters=shuffle(["a","b","c","d","e"].slice()).slice(0,nLeaf);
  let nodes=letters.map(v=>({v}));
  while(nodes.length>1){
    const i=g2R(0,nodes.length-2);
    nodes.splice(i,2,{op:pick(OPS),l:nodes[i],r:nodes[i+1]});
  }
  const root=nodes[0];
  const PREC={"+":1,"-":1,"*":2,"/":2};
  function post(n){ return n.v!==undefined? n.v : post(n.l)+post(n.r)+n.op; }
  function fullParen(n){ return n.v!==undefined? n.v : "("+fullParen(n.l)+n.op+fullParen(n.r)+")"; }
  function infix(n,parentPrec,isRight){
    if(n.v!==undefined) return n.v;
    const p=PREC[n.op];
    const s=infix(n.l,p,false)+n.op+infix(n.r,p,true);
    if(parentPrec>p || (parentPrec===p&&isRight)) return "("+s+")";
    return s;
  }
  const inf=infix(root,0,false);
  /* 좌→우 동일 우선순위(괄호는 존중) 파싱의 후위 — 오개념 오답 */
  function naivePost(str){
    const out=[], ops=[];
    for(const ch of str){
      if(/[a-e]/.test(ch)) out.push(ch);
      else if(ch==="(") ops.push(ch);
      else if(ch===")"){ while(ops.length&&ops[ops.length-1]!=="(") out.push(ops.pop()); ops.pop(); }
      else { while(ops.length&&ops[ops.length-1]!=="(") out.push(ops.pop()); ops.push(ch); }
    }
    while(ops.length) out.push(ops.pop());
    return out.join("");
  }
  return {root,post:post(root),full:fullParen(root),inf,naive:naivePost(inf)};
}
function genG10(){
  let e=null;
  for(let i=0;i<200;i++){ const t=g10Build(pick([3,4])); if(t.naive!==t.post){ e=t; break; } }
  if(!e) e=g10Build(3);
  const qtype=pick(["toPost","step1","toPost"]);
  const spread=s=>s.split("").join(" ");
  if(qtype==="toPost"){
    const swapped=e.post.slice(0,-2)+e.post.slice(-1)+e.post.slice(-2,-1); /* 마지막 두 토큰 교환 */
    const noParen=e.inf.replace(/[()]/g,"").split("").filter(c=>/[a-e]/.test(c)).join("")+e.post.replace(/[a-e]/g,""); /* 피연산자순+연산자몰기 */
    /* 괄호·우선순위 모두 무시한 좌→우 묶기 */
    const flat=e.inf.replace(/[()]/g,"").split("");
    let ltr=flat[0];
    for(let li=1;li<flat.length;li+=2) ltr=ltr+flat[li+1]+flat[li];
    /* 피연산자 두 개 교환 */
    const sw2=e.post.split(""); {const oi=sw2.findIndex(ch=>/[a-e]/.test(ch)); const oj=sw2.findIndex((ch,x)=>x>oi&&/[a-e]/.test(ch)); const t=sw2[oi]; sw2[oi]=sw2[oj]; sw2[oj]=t;}
    const opSwap=sw2.join("");
    const cands=[
      e.naive!==e.post?{text:spread(e.naive),correct:false,mc:"precedence-ignored",fb:"곱셈·나눗셈이 덧셈·뺄셈보다 먼저 묶인다 — 왼쪽부터 순서대로가 아니다."}:null,
      ltr!==e.post?{text:spread(ltr),correct:false,mc:"precedence-ignored",fb:"우선순위와 괄호가 묶는 순서를 정한다 — 왼쪽부터 순서대로가 아니다."}:null,
      swapped!==e.post?{text:spread(swapped),correct:false,mc:"op-order",fb:"괄호 묶기법 — 연산자는 자기 '오른쪽 괄호' 자리로 간다."}:null,
      noParen!==e.post?{text:spread(noParen),correct:false,mc:"lump-ops",fb:"연산자들이 몽땅 뒤로 가는 게 아니라, 각자 자기 괄호 자리로 간다."}:null,
      opSwap!==e.post?{text:spread(opSwap),correct:false,mc:"operand-order",fb:"피연산자의 순서는 중위와 그대로다 — 자리를 바꾸는 것은 연산자뿐."}:null
    ].filter(Boolean);
    return {qtype,params:{inf:e.inf},id:"G10",mono:true,
      stem:'중위 표기식 <span class="mono">'+e.inf+'</span> 의 후위 표기는?',
      okfb:'① 완전히 괄호로 묶고 ② 연산자를 오른쪽 괄호 자리로 ③ 괄호 삭제.',
      choices:g2Fill(cands,{text:spread(e.post),correct:true},4)};
  }
  /* step1: 완전 괄호 형태 고르기 */
  function fullParenOf(str){ /* 좌→우 묶기의 완전 괄호 (오개념) */
    const t=g10Build(3); return null; }
  /* 좌→우 트리의 완전 괄호를 오답으로 */
  function ltrTree(str){
    const toks=str.replace(/[()]/g,"").split("");
    let node={v:toks[0]};
    for(let i=1;i<toks.length;i+=2) node={op:toks[i], l:node, r:{v:toks[i+1]}};
    function fp(n){ return n.v!==undefined? n.v : "("+fp(n.l)+n.op+fp(n.r)+")"; }
    return fp(node);
  }
  const wrong1=ltrTree(e.inf);
  const cands=[
    wrong1!==e.full?{text:wrong1,correct:false,mc:"precedence-ignored",fb:"묶는 순서가 곧 우선순위다 — *, /가 먼저 묶인다."}:null,
    {text:e.full.replace(/^\(/,"").replace(/\)$/,""),correct:false,mc:"outer-paren",fb:"1단계는 '모두' 괄호로 묶는다 — 식 전체도 하나의 괄호다."},
  ].filter(Boolean);
  return {qtype,params:{inf:e.inf},id:"G10",mono:true,
    stem:'<span class="mono">'+e.inf+'</span> 를 괄호 묶기법 <b>1단계(완전 괄호)</b>로 바르게 묶은 것은?',
    okfb:'우선순위가 높은 것(*, /)부터, 같은 급은 왼쪽부터 묶는다.',
    choices:g2Fill(cands,{text:e.full,correct:true},3)};
}

/* --- G11. 괄호 검사 (ch03 유닛 A) --- */
function genG11(){
  const qtype=pick(["verdict","depth","sizeAt"]);
  /* 괄호열 생성 + 스캔 시뮬레이션 */
  function scan(str){
    let d=0, maxd=0, err=-1;
    for(let i=0;i<str.length;i++){
      if(str[i]==="(") { d++; if(d>maxd) maxd=d; }
      else { if(d===0){ err=i+1; break; } d--; }
    }
    return {maxd, err, leftover:err<0?d:0};
  }
  let str, r;
  for(let t=0;t<200;t++){
    const n=g2R(4,8);
    let sArr=[];
    for(let i=0;i<n;i++) sArr.push(Math.random()<0.52?"(":")");
    str=sArr.join(""); r=scan(str);
    if(qtype==="verdict") break;                       /* 어떤 결과든 OK */
    if(r.err<0 && r.maxd>=2) break;                    /* depth·sizeAt은 조기 오류 없는 열만 */
  }
  const mono='<span class="mono">"'+str+'"</span>';
  if(qtype==="verdict"){
    const ok='정상 — 끝났을 때 스택이 비어 있다';
    const left=(k)=>'여는 괄호 '+k+'개가 스택에 남는다 (짝 오류)';
    const err=(p)=>p+'번째 문자 \')\'에서 스택이 비어 있다 (짝 오류)';
    let correct, wrongs=[];
    if(r.err>0){ correct=err(r.err);
      wrongs=[{text:ok,correct:false,mc:"early-stop",fb:"닫는 괄호가 왔는데 pop할 짝이 없으면 그 자리에서 오류다."},
              {text:left(1),correct:false,mc:"count-slip",fb:"남는 게 아니라 모자라는 상황이다 — 몇 번째에서 무슨 일이 나는지 훑어 보라."},
              {text:err(r.err+1>str.length?r.err-1:r.err+1),correct:false,mc:"count-slip",fb:"오류가 나는 정확한 위치를 한 글자씩 세어 보라."}];
    } else if(r.leftover>0){ correct=left(r.leftover);
      wrongs=[{text:ok,correct:false,mc:"count-slip",fb:"여는 괄호와 닫는 괄호의 개수부터 세어 보라."},
              {text:left(r.leftover+1),correct:false,mc:"count-slip",fb:"push와 pop을 정확히 세어 보라."},
              {text:err(1),correct:false,mc:"push-close",fb:"닫는 괄호가 빈 스택을 만나야 그 오류다 — 이 열의 시작을 보라."}];
    } else { correct=ok;
      wrongs=[{text:left(1),correct:false,mc:"count-slip",fb:"끝까지 훑은 뒤 스택에 무엇이 남는지 보라."},
              {text:err(2),correct:false,mc:"count-slip",fb:"닫는 괄호마다 pop할 짝이 있었는지 확인하라."},
              {text:'판정할 수 없다',correct:false,mc:"no-method",fb:"push/pop 두 동작이면 항상 판정할 수 있다."}];
    }
    return {qtype, params:{str}, id:"G11", mono:true,
      stem:'괄호열 '+mono+' 를 스택 검사(여는 괄호 push, 닫는 괄호에서 pop)로 끝까지 훑으면?',
      okfb:'왼쪽부터 한 글자씩 — ( 는 push, ) 는 pop. 빈 스택에서의 pop과 끝에 남는 괄호가 두 가지 오류다.',
      choices:g2Fill(wrongs,{text:correct,correct:true},4)};
  }
  if(qtype==="depth"){
    const cands=[
      {text:String(r.maxd+1),correct:false,mc:"count-slip",fb:"글자마다 스택 크기를 적어 가며 최고점을 찾아라."},
      {text:String(Math.max(0,r.maxd-1)),correct:false,mc:"count-slip",fb:"글자마다 스택 크기를 적어 가며 최고점을 찾아라."},
      {text:String((str.match(/\(/g)||[]).length),correct:false,mc:"push-all",fb:"닫는 괄호가 그때그때 짝을 지운다 — 여는 괄호의 총 개수가 아니다."}
    ].filter(c=>c.text!==String(r.maxd));
    return {qtype, params:{str}, id:"G11", mono:true,
      stem:'괄호열 '+mono+' 를 검사하는 동안 스택의 <b>최대 크기(깊이)</b>는?',
      okfb:'( 마다 +1, ) 마다 -1 — 그 궤적의 최고점이다.',
      choices:g2Fill(cands,{text:String(r.maxd),correct:true},4)};
  }
  const k=g2R(2,str.length);
  let dd=0; for(let i2=0;i2<k;i2++){ dd+= str[i2]==="("?1:-1; }
  const cands=[
    {text:String(dd+1),correct:false,mc:"count-slip",fb:"k번째 글자까지의 push와 pop을 정확히 세어 보라."},
    {text:String(Math.max(0,dd-1)),correct:false,mc:"count-slip",fb:"k번째 글자까지의 push와 pop을 정확히 세어 보라."},
    {text:String(k),correct:false,mc:"push-all",fb:"모든 글자가 쌓이는 게 아니다 — 닫는 괄호는 지운다."}
  ].filter(c=>c.text!==String(dd));
  return {qtype, params:{str,k}, id:"G11", mono:true,
    stem:'괄호열 '+mono+' 에서 <b>'+k+'번째 문자까지</b> 처리한 직후, 스택에 들어 있는 괄호의 <b>개수</b>는?',
    okfb:'( 는 +1, ) 는 -1 — '+k+'글자까지의 합이다.',
    choices:g2Fill(cands,{text:String(dd),correct:true},4)};
}

/* --- G12. 연산자 우선 순위·결합성 (ch03 유닛 B) --- */
function genG12(){
  const qtype=pick(["firstOp","assoc","value"]);
  if(qtype==="assoc"){
    const v=pick(["minus","div"]);
    if(v==="minus"){
      const a=g2R(8,15), b=g2R(2,5), c=g2R(1,3);
      const correct=(a-b)-c, wrong=a-(b-c);
      return {qtype, params:{a,b,c}, id:"G12", mono:true,
        stem:'<span class="mono">'+a+' - '+b+' - '+c+'</span> 의 값은?',
        okfb:'같은 우선순위는 왼쪽부터(좌결합) — ('+a+'-'+b+')-'+c+' 순서다.',
        choices:g2Fill([
          {text:String(wrong),correct:false,mc:"assoc-right",fb:"오른쪽부터 묶으면 다른 식이 된다 — 같은 급은 왼쪽부터다."},
          {text:String(correct+1),correct:false,mc:"calc-slip",fb:"괄호를 그려 놓고 차근차근."},
          {text:String(correct-1),correct:false,mc:"calc-slip",fb:"괄호를 그려 놓고 차근차근."}
        ],{text:String(correct),correct:true},4)};
    }
    const b2=pick([2,3,4]), c2=2, a2=b2*c2*pick([2,3]);
    const correct=(a2/b2)/c2, wrong=a2/(b2/c2);
    return {qtype, params:{a2,b2,c2}, id:"G12", mono:true,
      stem:'<span class="mono">'+a2+' / '+b2+' / '+c2+'</span> 의 값은?',
      okfb:'같은 우선순위는 왼쪽부터(좌결합) — ('+a2+'/'+b2+')/'+c2+' 순서다.',
      choices:g2Fill([
        wrong!==correct&&Number.isInteger(wrong)?{text:String(wrong),correct:false,mc:"assoc-right",fb:"오른쪽부터 나누면 다른 식이 된다 — 같은 급은 왼쪽부터다."}:null,
        {text:String(correct*2),correct:false,mc:"calc-slip",fb:"괄호를 그려 놓고 차근차근."},
        {text:String(correct+1),correct:false,mc:"calc-slip",fb:"괄호를 그려 놓고 차근차근."}
      ].filter(Boolean),{text:String(correct),correct:true},4)};
  }
  /* firstOp / value — 3~4항 숫자 중위식 (우선순위 파서로 정답 계산) */
  let toks, tree, val;
  for(let t=0;t<300;t++){
    const n=pick([3,4]);
    const nums=g2Vals(n);
    const ops=[]; for(let i=0;i<n-1;i++) ops.push(pick(["+","-","*","/"]));
    toks=[]; for(let i=0;i<n;i++){ toks.push(String(nums[i])); if(i<n-1) toks.push(ops[i]); }
    /* 파스 (우선순위+좌결합) */
    let pos=0;
    function pE(){ let x=pT(); while(toks[pos]==="+"||toks[pos]==="-"){ const op=toks[pos++]; x={op,l:x,r:pT()}; } return x; }
    function pT(){ let x={v:+toks[pos++]}; while(toks[pos]==="*"||toks[pos]==="/"){ const op=toks[pos++]; x={op,l:x,r:{v:+toks[pos++]}}; } return x; }
    tree=pE();
    let ok=true;
    function ev(nd){ if(!ok) return 0; if(nd.v!==undefined) return nd.v;
      const A=ev(nd.l), B=ev(nd.r);
      if(nd.op==="/"){ if(B===0||A%B!==0){ ok=false; return 0; } return A/B; }
      const R=nd.op==="+"?A+B:nd.op==="-"?A-B:A*B;
      if(Math.abs(R)>99){ ok=false; return 0; } return R; }
    val=ev(tree);
    /* 좌→우 값과 달라야 의미 있는 문항 */
    let ltr=+toks[0], lok=true;
    for(let i=1;i<toks.length;i+=2){ const op=toks[i], B=+toks[i+1];
      if(op==="/"){ if(B===0||ltr%B!==0){ lok=false; break; } ltr=ltr/B; }
      else ltr=op==="+"?ltr+B:op==="-"?ltr-B:ltr*B; }
    if(ok && (!lok || ltr!==val)) { tree.__ltr=lok?ltr:null; break; }
    tree=null;
  }
  if(!tree){ return genG12(); }
  const expr=toks.join(" ");
  if(qtype==="value"){
    const cands=[
      tree.__ltr!==null?{text:String(tree.__ltr),correct:false,mc:"precedence-ignored",fb:"왼쪽부터 차례대로가 아니다 — *, / 가 먼저다."}:null,
      {text:String(val+pick([1,2,-1,-2])),correct:false,mc:"calc-slip",fb:"먼저 묶이는 곳에 괄호를 그려 놓고 계산하라."},
      {text:String(val+pick([3,-3,4,-4])),correct:false,mc:"calc-slip",fb:"먼저 묶이는 곳에 괄호를 그려 놓고 계산하라."}
    ].filter(Boolean);
    return {qtype, params:{expr}, id:"G12", mono:true,
      stem:'<span class="mono">'+expr+'</span> 의 값은?',
      okfb:'*, / 가 먼저, 같은 급은 왼쪽부터 — 묶이는 곳에 괄호를 그려 보면 명확하다.',
      choices:g2Fill(cands,{text:String(val),correct:true},4)};
  }
  /* firstOp: 가장 먼저 계산되는 부분식 (후위 순회에서 첫 연산 노드) */
  let first=null;
  (function po(nd){ if(nd.v!==undefined||first) return; po(nd.l); po(nd.r); if(!first) first=nd; })(tree);
  const leafStr=nd=>nd.v!==undefined?String(nd.v):"("+leafStr(nd.l)+nd.op+leafStr(nd.r)+")";
  const firstTxt=leafStr(first.l)+" "+first.op+" "+leafStr(first.r);
  /* 오답: 다른 연산 조각들 */
  const others=[];
  for(let i=1;i<toks.length;i+=2){
    const cand=toks[i-1]+" "+toks[i]+" "+toks[i+1];
    if(cand!==firstTxt) others.push({text:cand,correct:false,
      mc:i===1?"left-first":"precedence-ignored",
      fb:i===1?"왼쪽이라고 무조건 먼저가 아니다 — 우선순위가 먼저다.":"*, / 가 +, - 보다 먼저 묶인다. 같은 급이면 왼쪽부터."});
  }
  const cross=toks[0]+" "+first.op+" "+toks[toks.length-1];
  if(cross!==firstTxt) others.push({text:cross,correct:false,mc:"pair-slip",fb:"연산자는 자기 양옆의 피연산자와 묶인다."});
  others.push({text:"먼저랄 것 없이 왼쪽부터 한꺼번에 계산된다",correct:false,mc:"no-order",fb:"계산에는 언제나 순서가 있다 — 우선순위와 결합성이 그 순서를 정한다."});
  return {qtype, params:{expr}, id:"G12", mono:true,
    stem:'<span class="mono">'+expr+'</span> 에서 <b>가장 먼저 계산되는</b> 부분은?',
    okfb:'*, / 가 먼저, 같은 급은 왼쪽부터 — 괄호를 그려 보면 가장 안쪽이 먼저다.',
    choices:g2Fill(others,{text:firstTxt,correct:true},4)};
}

/* --- A+ 심화 (ch02 — 스택·큐 범위) --- */
function genAP2ch(idx){
  if(idx===0) return {...genG8(true), id:"AP1"};
  if(idx===1) return {...genG6(true), id:"AP2"};
  return {...genG7(true), id:"AP3"};
}
/* --- A+ 심화 (ch03 — 수식·미로 범위) --- */
function genAP3ch(idx){
  if(idx===0){
    const CASES=[
      {inc:"*", top:"+", ans:"*는 +보다 우선순위가 높다 — *를 스택에 push한다", why:"높은 것이 위에 올라탈 수 있다.",
       w1:"+가 먼저 온 연산자다 — +를 pop해 출력하고 *를 push한다", w1mc:"prec-reverse", w2:"*를 스택에 넣지 않고 즉시 출력해 버린다", w2mc:"no-stack"},
      {inc:"+", top:"*", ans:"위의 *를 pop해 출력한 뒤 +를 push한다", why:"낮은 것이 오면, 위의 높은(같은) 것들이 먼저 내려온다.",
       w1:"+도 연산자이므로 * 위에 그대로 push해 쌓아 둔다", w1mc:"prec-reverse", w2:"+를 스택에 넣지 않고 즉시 출력한다", w2mc:"no-stack"},
      {inc:"-", top:"+", ans:"+를 pop해 출력한 뒤 -를 push한다", why:"같은 우선순위는 왼쪽 것이 먼저다(좌결합) — 위의 것이 먼저 내려온다.",
       w1:"같은 우선순위이므로 -를 + 위에 그대로 push한다", w1mc:"assoc", w2:"-를 스택에 넣지 않고 즉시 출력한다", w2mc:"no-stack"}];
    const c=pick(CASES);
    return {id:"AP1", qtype:"opstack", params:{inc:c.inc,top:c.top}, mono:true,
      stem:'[심화 — 스택 기반 중위→후위 변환 맛보기] 변환 중, 연산자 스택의 톱이 <span class="mono">'+c.top+'</span> 인 상태에서 <span class="mono">'+c.inc+'</span> 를 읽었다. 무슨 일이 일어나는가?',
      okfb:c.why,
      choices:shuffle([
        {text:c.ans,correct:true},
        {text:c.w1,correct:false,mc:c.w1mc,fb:"우선순위(*,/ > +,-)와 좌결합을 스택 위·아래로 번역해 보라."},
        {text:c.w2,correct:false,mc:c.w2mc,fb:"연산자는 곧장 출력되지 않는다 — 스택에서 순서를 조율한다."}])};
  }
  if(idx===1) return {...genG9(), id:"AP2"};
  /* 미로 백트래킹 */
  const path=[[0,0],[0,1],[1,1],[2,1],[2,2],[3,2]];
  const upto=g2R(3,path.length-1);
  const st=path.slice(0,upto+1);
  const k=g2R(1,Math.min(2,st.length-1));
  const cur=st[st.length-1-k];
  const wrongs=st.filter((p,i)=>i!==st.length-1-k).slice(-3).map(p=>({text:"("+p[0]+", "+p[1]+")",correct:false,mc:"stack-depth",fb:"pop 한 번 = 한 걸음 back — 경로 스택의 위에서부터 k개를 걷어낸 다음 톱이 현재 위치다."}));
  return {id:"AP3", qtype:"maze", params:{upto,k}, mono:true,
    stem:'[심화 — 미로 백트래킹] 경로 스택(아래→위): <span class="mono">'+st.map(p=>"("+p[0]+","+p[1]+")").join(" ")+'</span>. 막다른 길이라 <b>pop을 '+k+'번</b> 했다. 현재 위치는?',
    okfb:'pop 한 번이 한 걸음 back — 스택 위에서 '+k+'개를 걷어낸 뒤의 톱이 현재 위치다.',
    choices:g2Fill(wrongs,{text:"("+cur[0]+", "+cur[1]+")",correct:true},4)};
}

/* ================= 챕터 4 — 리스트 ================= */
/* G13. 배열 vs 연결 표현 — 이동 수 / 링크 교체 수 (산술 검산 내장) */
function genG13(){
  const qtype=pick(["ins","del","linkfix","mem","alloc"]);
  if(qtype==="mem"){
    const AREA_FB={
      "프로그램 영역":"프로그램(코드) 영역에는 컴파일된 명령어가 산다.",
      "데이터 영역":"데이터 영역은 전역·static 변수의 자리다.",
      "스택 영역":"스택 영역에는 지역 변수·함수 호출 정보가 쌓였다가 함수가 끝나면 걷힌다.",
      "힙 영역":"힙 영역은 malloc으로 빌리는 공간의 자리다."};
    const CASES=[
      {q:'함수 안에서 선언한 지역 변수 <span class="mono">int i</span>', a:"스택 영역", why:'함수 호출과 함께 쌓였다가, 함수가 끝나면 자동으로 걷힌다.'},
      {q:'<span class="mono">malloc(sizeof(list_node))</span> 로 빌린 노드의 공간', a:"힙 영역", why:'실행 도중 빌리는 공간 — free할 때까지 산다.'},
      {q:'컴파일된 프로그램의 <b>명령어들</b>', a:"프로그램 영역", why:'실행 내내 고정된 명령어들의 자리다.'},
      {q:'프로그램이 도는 내내 살아 있는 <b>전역 변수</b>', a:"데이터 영역", why:'전역·static 변수는 데이터 영역에서 실행 내내 유지된다.'}];
    const c=pick(CASES);
    const choices=Object.keys(AREA_FB).map(a=> a===c.a
      ? {text:a,correct:true}
      : {text:a,correct:false,mc:"area-confuse",fb:AREA_FB[a]});
    return {qtype, params:{q:c.a}, id:"G13", mono:true,
      stem:'다음이 저장되는 <b>메모리 영역</b>은? — '+c.q,
      okfb:c.why, choices:shuffle(choices)};
  }
  if(qtype==="alloc"){
    const CASES=[
      {stem:'<span class="mono">free(pi)</span> 가 하는 일은?',
       a:'pi가 가리키는 힙의 공간을 시스템에 돌려준다', why:'반환되는 것은 "빌린 공간" — 소유권을 돌려주는 것이다.',
       w:[['pi라는 포인터 변수 자체를 메모리에서 없애 버린다','var-confuse','없어지는 것은 빌린 공간이다 — pi 변수는 (위험한 옛 주소를 든 채) 남는다.'],
          ['빌린 공간에 든 값들을 전부 0으로 깨끗이 지워 준다','zero-myth','값을 지우는 게 아니라 소유권을 돌려주는 것이다.'],
          ['pi를 자동으로 NULL로 바꿔 다시 쓸 준비를 해 준다','auto-null','NULL로 두는 것은 프로그래머의 몫 — free는 해 주지 않는다.']]},
      {stem:'<span class="mono">malloc</span> 이 공간을 빌리는 데 <b>실패</b>하면 돌려주는 것은?',
       a:'NULL', why:'실패의 신호는 NULL — 그래서 insert가 IS_FULL(temp)로 검사한다.',
       w:[['0이 아닌 임의의 쓰레기 주소를 그대로 돌려준다','garbage-myth','실패의 신호는 명확하게 NULL로 온다.'],
          ['오류 메시지를 내며 프로그램을 즉시 강제 종료시킨다','crash-myth','종료할지는 검사한 쪽이 정한다 — insert는 IS_FULL로 받아서 처리했다.'],
          ['현재 빌릴 수 있는 최대 크기를 숫자로 알려 준다','size-myth','malloc은 주소를 주는 함수다 — 크기를 알려 주지 않는다.']]},
      {stem:'<b>동적 할당</b>이 꼭 필요한 상황은?',
       a:'필요한 공간의 수를 실행해 봐야 알 수 있을 때', why:'컴파일 때 크기를 모르니, 실행 도중 그때그때 빌리는 수밖에 없다.',
       w:[['저장할 자료의 개수를 컴파일 전에 이미 알고 있을 때','static-enough','그럴 땐 배열 선언(정적 할당)으로 충분하다.'],
          ['프로그램의 실행 속도를 지금보다 더 높이고 싶을 때','speed-reduction','빠르라고 쓰는 게 아니라 크기를 몰라서 쓴다.'],
          ['같은 계산을 여러 함수에서 반복해서 사용해야 할 때','reuse-myth','재사용은 함수의 몫이다 — 할당 방식과는 무관하다.']]},
      {stem:'malloc으로 빌린 공간이 <b>사라지는 때</b>는?',
       a:'free로 돌려줄 때 — 함수가 끝나도 남아 있다', why:'힙의 공간은 함수보다 오래 산다 — 그래서 노드를 힙에 짓는다.',
       w:[['그 공간을 빌린 함수가 끝나는(return) 순간 자동으로','stack-confuse','그것은 스택 영역의 지역 변수 이야기다 — 힙은 함수보다 오래 산다.'],
          ['빌린 지 일정 시간이 지나면 시스템이 알아서 회수한다','time-myth','힙에 타이머는 없다 — free 전에는 영원히 빌린 상태다.'],
          ['다른 함수가 malloc을 새로 호출하는 순간 밀려난다','evict-myth','새 malloc은 새 공간을 빌릴 뿐, 남의 공간을 빼앗지 않는다.']]}];
    const c=pick(CASES);
    return {qtype, params:{q:c.a.slice(0,8)}, id:"G13", mono:true,
      stem:c.stem, okfb:c.why,
      choices:shuffle([{text:c.a,correct:true}].concat(c.w.map(w=>({text:w[0],correct:false,mc:w[1],fb:w[2]}))))};
  }
  const WORDS=["ant","bat","cat","hat","mat","rat","sat","vat"];
  const n=g2R(4,6);
  const arr=shuffle(WORDS.slice()).slice(0,n); arr.sort();
  const monoArr='<span class="mono">('+arr.join(", ")+')</span>';
  if(qtype==="ins"){
    const k=g2R(1,n);                 /* k번째 자리에 삽입 (1-base) */
    const moved=n-k+1;                /* k번째부터 끝까지 한 칸씩 밀기 */
    const cands=[
      {text:String(moved-1),correct:false,mc:"off-by-one",fb:"k번째 원소 자신도 한 칸 밀려야 한다 — k번째부터 끝까지 세어 보라."},
      {text:String(Math.min(n,moved+1)),correct:false,mc:"off-by-one",fb:"이동하는 것은 k번째부터 마지막까지 — 정확히 세어 보라."},
      {text:String(n),correct:false,mc:"count-all",fb:"k번째 앞의 원소들은 제자리에 있어도 된다."},
      {text:String(k),correct:false,mc:"index-myth",fb:"자리 번호가 아니라 '밀려나는 원소의 수'다."}
    ].filter(c=>c.text!==String(moved));
    return {qtype, params:{n,k}, id:"G13", mono:true,
      stem:'원소 '+n+'개짜리 배열 '+monoArr+' 의 <b>'+k+'번째 자리</b>에 새 단어를 삽입하려 한다. 한 칸씩 <b>이동해야 하는 기존 원소</b>는 몇 개인가?',
      okfb:k+'번째부터 마지막('+n+'번째)까지 — '+n+'−'+k+'+1 = '+moved+'개가 밀린다.',
      choices:g2Fill(cands,{text:String(moved),correct:true},4)};
  }
  if(qtype==="del"){
    const k=g2R(1,n);
    const moved=n-k;                  /* k+1번째부터 끝까지 한 칸씩 당기기 */
    const cands=[
      {text:String(moved+1),correct:false,mc:"off-by-one",fb:"삭제된 원소 자신은 이동이 아니다 — 뒤의 원소들만 당겨진다."},
      {text:String(Math.max(0,moved-1)),correct:false,mc:"off-by-one",fb:"k+1번째부터 마지막까지 — 정확히 세어 보라."},
      {text:String(n),correct:false,mc:"count-all",fb:"삭제 지점 앞의 원소들은 움직이지 않는다."},
      {text:String(k),correct:false,mc:"index-myth",fb:"자리 번호가 아니라 '당겨지는 원소의 수'다."}
    ].filter(c=>c.text!==String(moved));
    return {qtype, params:{n,k}, id:"G13", mono:true,
      stem:'원소 '+n+'개짜리 배열 '+monoArr+' 에서 <b>'+k+'번째 원소를 삭제</b>한다. 빈 자리를 메우기 위해 한 칸씩 <b>당겨야 하는 원소</b>는 몇 개인가?',
      okfb:(k+1<=n?(k+1)+'번째부터 마지막까지 — '+n+'−'+k+' = '+moved+'개.':'마지막 원소를 지우면 당길 원소가 없다 — 0개.'),
      choices:g2Fill(cands,{text:String(moved),correct:true},4)};
  }
  /* linkfix — 연결 표현이라면 몇 개의 링크 필드를 만지는가 */
  const op=pick(["ins","del"]);
  const correct= op==="ins"
    ? {text:"2개 — 새 노드의 링크를 걸고, 앞 노드의 링크를 바꾼다",correct:true}
    : {text:"1개 — 앞 노드의 링크를 다음 노드로 바꿔 걸 뿐이다",correct:true};
  const wrongs= op==="ins"
    ? [{text:String(n)+"개 — 삽입 지점 뒤의 노드들을 전부 옮겨 잇는다",correct:false,mc:"shift-carry",fb:"연결 표현의 요점 — 노드는 제자리, 손대는 것은 링크뿐이다."},
       {text:"1개 — 앞 노드의 링크만 새 노드로 바꿔 걸면 끝난다",correct:false,mc:"lost-tail",fb:"새 노드의 링크를 걸지 않으면 뒤 리스트로 가는 길이 없다."},
       {text:"0개 — 새 노드를 만들면 링크는 저절로 이어진다",correct:false,mc:"auto-link",fb:"링크는 프로그램이 직접 걸어야 한다 — 저절로 되는 일은 없다."}]
    : [{text:String(n-1)+"개 — 삭제 지점 뒤의 노드들을 전부 다시 잇는다",correct:false,mc:"shift-carry",fb:"뒤 노드들은 서로 이미 이어져 있다 — 앞 노드의 링크 하나면 된다."},
       {text:"2개 — 앞 노드의 링크와 삭제할 노드의 링크를 함께 바꾼다",correct:false,mc:"extra-fix",fb:"삭제할 노드의 링크는 바꿀 필요가 없다 — 리스트 밖으로 떨어져 나갈 뿐."},
       {text:"0개 — free만 하면 링크는 저절로 정리되어 이어진다",correct:false,mc:"auto-link",fb:"free는 공간 반환일 뿐 — 앞 노드의 링크를 바꾸지 않으면 끊어진 길이 남는다."}];
  return {qtype, params:{op,n}, id:"G13", mono:true,
    stem:'같은 자료를 <b>연결 리스트</b>로 표현했다면, '+(op==="ins"?'중간에 새 노드 하나를 <b>삽입</b>':'중간 노드 하나를 <b>삭제</b>')+'할 때 값을 옮기는 대신 <b>링크 필드</b>를 몇 개 만지면 되는가?',
    okfb: op==="ins"?'새 노드의 링크(다음을 가리키게) + 앞 노드의 링크(새 노드를 가리키게) — 2개.':'앞 노드의 링크가 삭제 대상의 다음을 가리키게 — 1개뿐.',
    choices:shuffle([correct,...wrongs])};
}

/* G14. 단순 연결 리스트 삽입 — 리스트 시뮬 내장 */
function genG14(){
  const qtype=pick(["after","newlink","empty"]);
  if(qtype==="empty"){
    const x=g2R(1,9)*10;
    return {qtype, params:{x}, id:"G14", mono:true,
      stem:'<span class="mono">ptr</span> 가 <b>NULL</b>(공백 리스트)인 상태에서 <span class="mono">insert(&ptr, node)</span> 로 값 '+x+'짜리 새 노드를 넣으면?',
      okfb:'if(*ptr)가 거짓 — else 경로: temp->link=NULL, *ptr=temp. 새 노드가 리스트의 시작이 된다.',
      choices:shuffle([
        {text:"temp->link는 NULL, *ptr는 temp — 한 노드짜리 리스트",correct:true},
        {text:"node->link = temp가 실행되어 기존 마지막 노드 뒤에 이어 붙는다",correct:false,mc:"branch-swap",fb:"공백 리스트에는 이어 붙일 node가 없다 — if(*ptr)가 거짓인 경우다."},
        {text:"IS_FULL 검사에 걸려 The memory is full을 출력하고 종료된다",correct:false,mc:"full-confuse",fb:"IS_FULL은 malloc 실패(공간 없음) 검사다 — 리스트가 비었는지와 무관하다."},
        {text:"아무 일도 일어나지 않은 채 ptr는 NULL 공백 리스트로 남는다",correct:false,mc:"no-op-myth",fb:"else 경로가 *ptr=temp로 시작 주소를 바꾼다 — 그래서 이중 포인터가 필요했다."}])};
  }
  /* 리스트 만들기: 서로 다른 2자리 값 3~4개 */
  const m=g2R(3,4);
  const vals=shuffle([10,20,30,40,50,60,70,80,90]).slice(0,m);
  const x=shuffle([15,25,35,45,55,65,75,85,95]).find(v=>!vals.includes(v));
  const j= qtype==="after" ? g2R(0,m-2) : g2R(0,m-1);   /* vals[j] 뒤에 삽입 (after형은 끝 제외 — 선택지 중복 방지) */
  const V=vals[j];
  const lst=a=>'<span class="mono">ptr → '+a.join(" → ")+' → NULL</span>';
  if(qtype==="after"){
    const res=vals.slice(0,j+1).concat([x],vals.slice(j+1));
    const wBefore=vals.slice(0,j).concat([x],vals.slice(j));
    const wEnd=vals.concat([x]);
    const wNext=j+1<m ? vals.slice(0,j+2).concat([x],vals.slice(j+2)) : vals.slice(0,j).concat([x],vals.slice(j));
    const cands=[
      {text:wBefore.join(" → ")+" → NULL",correct:false,mc:"prepend-confuse",fb:"'뒤에' 삽입이다 — 새 노드는 "+V+" 다음 자리다."},
      {text:wEnd.join(" → ")+" → NULL",correct:false,mc:"append-confuse",fb:"맨 끝이 아니라 "+V+" 노드의 바로 뒤다."},
      {text:wNext.join(" → ")+" → NULL",correct:false,mc:"index-myth",fb:"삽입 기준은 노드 "+V+" — 링크가 갈라지는 지점을 다시 보라."}
    ].filter(c=>c.text!==res.join(" → ")+" → NULL");
    return {qtype, params:{vals,x,j}, id:"G14", mono:true,
      viz:{type:"list",name:"ptr",nodes:vals.map((v2,i2)=>({v:v2,hl:i2===j?1:0}))},
      stem:'그림의 리스트 '+lst(vals)+' 에서 <b>값 '+V+' 노드의 뒤</b>에 값 '+x+'짜리 새 노드를 삽입(insert)하면, 삽입 후 리스트는?',
      okfb:'temp->link = ('+V+' 노드의 다음), '+V+'->link = temp — '+res.join(" → ")+'.',
      choices:g2Fill(cands,{text:res.join(" → ")+" → NULL",correct:true},4)};
  }
  /* newlink — temp->link = node->link 가 가리키는 것 */
  const nxt = j+1<m ? "값 "+vals[j+1]+" 노드" : "NULL — "+V+"가 마지막 노드였다";
  const cands=[
    {text:"값 "+V+" 노드 — 기준 노드 자신",correct:false,mc:"self-link",fb:"자신을 가리키면 고리가 생긴다 — node의 '다음'을 물려받는 것이다."},
    {text:"값 "+vals[0]+" 노드 — 리스트의 첫 노드",correct:false,mc:"head-confuse",fb:"리스트의 시작이 아니라 삽입 지점의 다음이다."},
    {text:(j+1<m?"NULL — 새 노드는 항상 끝에 붙는다":"값 "+vals[0]+" 노드 — 처음으로 되돌아간다"),correct:false,mc:"append-confuse",fb:"node->link의 값을 그대로 물려받는다 — 항상 NULL인 것이 아니다."}
  ];
  return {qtype, params:{vals,x,j}, id:"G14", mono:true,
    viz:{type:"list",name:"ptr",nodes:vals.map((v2,i2)=>({v:v2,hl:i2===j?1:0}))},
    stem:'그림의 리스트 '+lst(vals)+' 에서 값 '+V+' 노드 뒤에 새 노드를 삽입할 때, <span class="mono">temp->link = node->link</span> 가 실행된 직후 <b>새 노드의 링크가 가리키는 것</b>은?',
    okfb:V+' 노드의 링크 값을 물려받는다 — '+(j+1<m?('값 '+vals[j+1]+' 노드'):'NULL('+V+'가 마지막)')+'.',
    choices:g2Fill(cands,{text:nxt,correct:true},4)};
}

/* G15. 단순 연결 리스트 삭제 — trail/분기 시뮬 내장 */
function genG15(){
  const qtype=pick(["after","trail","branch"]);
  const m=g2R(3,4);
  const vals=shuffle([10,20,30,40,50,60,70,80,90]).slice(0,m);
  const j=g2R(0,m-1);                 /* vals[j] 삭제 */
  const V=vals[j];
  const lst=a=>'<span class="mono">ptr → '+a.join(" → ")+' → NULL</span>';
  if(qtype==="after"){
    const res=vals.filter((_,i)=>i!==j);
    const wNext=j+1<m ? vals.filter((_,i)=>i!==j+1) : vals.filter((_,i)=>i!==j-1);
    const wPrev=j>0 ? vals.filter((_,i)=>i!==j-1) : vals.filter((_,i)=>i!==1);
    const cands=[
      {text:wNext.join(" → ")+" → NULL",correct:false,mc:"next-instead",fb:"삭제 대상은 값 "+V+" 노드다 — 그 다음 노드가 아니다."},
      {text:wPrev.join(" → ")+" → NULL",correct:false,mc:"trail-self",fb:"trail(선행 노드)은 링크만 바뀔 뿐 삭제되지 않는다."},
      {text:vals.join(" → ")+" → NULL",correct:false,mc:"free-auto",fb:"trail의 링크가 "+V+"를 건너뛰게 바뀐다 — 리스트는 그대로가 아니다."}
    ].filter(c=>c.text!==res.join(" → ")+" → NULL");
    return {qtype, params:{vals,j}, id:"G15", mono:true,
      viz:{type:"list",name:"ptr",nodes:vals.map((v2,i2)=>({v:v2,hl:i2===j?1:0}))},
      stem:'그림의 리스트 '+lst(vals)+' 에서 <b>값 '+V+' 노드를 삭제</b>(delete)하면, 삭제 후 리스트는?',
      okfb:(j===0?'첫 노드 삭제 — *ptr가 다음 노드로 바뀐다: ':'선행 노드의 링크가 '+V+'의 다음을 가리킨다: ')+res.join(" → ")+'.',
      choices:g2Fill(cands,{text:res.join(" → ")+" → NULL",correct:true},4)};
  }
  if(qtype==="trail"){
    const correct= j===0 ? "NULL — 첫 노드라 선행 노드가 없다" : "값 "+vals[j-1]+" 노드";
    const cands=[
      {text:(j+1<m?"값 "+vals[j+1]+" 노드":"값 "+vals[0]+" 노드"),correct:false,mc:"next-instead",fb:"trail은 삭제할 노드의 '앞' 노드다 — 링크 방향을 다시 보라."},
      {text:"값 "+V+" 노드 — 삭제 대상 자신",correct:false,mc:"trail-self",fb:"자기 자신은 선행 노드가 될 수 없다."},
      {text:(j===0?"값 "+vals[m-1]+" 노드 — 마지막 노드":"NULL — 선행 노드가 없다"),correct:false,mc:"branch-swap",fb:(j===0?"단순 리스트는 원형이 아니다 — 첫 노드 앞에는 아무것도 없다.":"이 노드는 첫 노드가 아니다 — 앞 노드가 존재한다.")}
    ];
    return {qtype, params:{vals,j}, id:"G15", mono:true,
      viz:{type:"list",name:"ptr",nodes:vals.map((v2,i2)=>({v:v2,hl:i2===j?1:0}))},
      stem:'그림의 리스트 '+lst(vals)+' 에서 값 '+V+' 노드를 삭제하려 한다. 이때 <b>trail(선행 노드)</b>은?',
      okfb:(j===0?'첫 노드의 앞에는 아무것도 없다 — trail=NULL, 그래서 *ptr를 직접 바꾼다.':V+' 바로 앞의 값 '+vals[j-1]+' 노드다.'),
      choices:g2Fill(cands,{text:correct,correct:true},4)};
  }
  /* branch — 실행되는 문장 */
  const correct= j===0
    ? {text:"*ptr = (*ptr)->link — 리스트의 시작 주소 자체가 바뀐다",correct:true}
    : {text:"trail->link = node->link — 선행 노드의 링크가 대체된다",correct:true};
  const wrongs= j===0
    ? [{text:"trail->link = node->link — 선행 노드의 링크가 대체된다",correct:false,mc:"branch-swap",fb:"첫 노드에는 trail이 없다(NULL) — if(trail)이 거짓인 경우다."},
       {text:"node->link = trail->link — 삭제할 노드의 링크를 바꾼다",correct:false,mc:"reverse-link",fb:"삭제 대상의 링크는 바꿀 필요가 없다 — 앞쪽 연결을 바꾼다."},
       {text:"두 문장이 차례로 모두 실행되어 양쪽을 정리한다",correct:false,mc:"both-branch",fb:"if-else 다 — 상황에 따라 한쪽만 실행된다."}]
    : [{text:"*ptr = (*ptr)->link — 리스트의 시작 주소 자체가 바뀐다",correct:false,mc:"branch-swap",fb:"시작 주소는 첫 노드를 삭제할 때만 바뀐다 — trail이 있는 경우다."},
       {text:"node->link = trail->link — 삭제할 노드의 링크를 바꾼다",correct:false,mc:"reverse-link",fb:"방향이 거꾸로다 — trail의 링크가 node의 다음을 물려받는다."},
       {text:"두 문장이 차례로 모두 실행되어 양쪽을 정리한다",correct:false,mc:"both-branch",fb:"if-else 다 — 상황에 따라 한쪽만 실행된다."}];
  return {qtype, params:{vals,j}, id:"G15", mono:true,
    viz:{type:"list",name:"ptr",nodes:vals.map((v2,i2)=>({v:v2,hl:i2===j?1:0}))},
    stem:'그림의 리스트 '+lst(vals)+' 에서 값 '+V+' 노드를 <span class="mono">delete(&ptr, trail, node)</span> 로 삭제할 때, <b>실행되는 문장</b>은?',
    okfb:(j===0?'trail=NULL(첫 노드) — else 경로: *ptr = (*ptr)->link.':'trail이 있다 — trail->link = node->link 로 건너뛰게 만든다.')+' 그리고 free(node).',
    choices:shuffle([correct,...wrongs])};
}

/* G16. 이중 연결 원형 리스트 (head node) — 원형 시뮬 내장 */
function genG16(){
  const qtype=pick(["nav","dins","ddel"]);
  const m=g2R(2,3);
  const vals=shuffle([10,20,30,40,50,60,70,80,90]).slice(0,m);
  const ring=["head"].concat(vals.map(v=>String(v)));   /* rlink(시계) 방향 순서 */
  const label=s=>s==="head"?"head 노드":"값 "+s+" 노드";
  const ringStr='<span class="mono">head ⇄ '+vals.join(" ⇄ ")+' ⇄ (다시 head)</span>';
  const R=i=>ring[(i+1)%ring.length], L=i=>ring[(i-1+ring.length)%ring.length];
  if(qtype==="nav"){
    const i=g2R(0,ring.length-1);
    const X=ring[i];
    const kind=pick(["r","l","lr"]);
    const ans= kind==="r"?R(i): kind==="l"?L(i): X;
    const stemOp= kind==="r"?"ptr->rlink": kind==="l"?"ptr->llink":"ptr->llink->rlink";
    const cands=[
      {text:label(kind==="r"?L(i): kind==="l"?R(i): R(i)),correct:false,mc:"direction-swap",fb:"rlink는 시계(오른쪽), llink는 반시계(왼쪽) — 방향을 다시 보라."},
      {text:label(X),correct:false,mc:"self-link",fb:"한 번 이동하면 자리가 바뀐다 — 제자리는 llink->rlink처럼 갔다 돌아올 때다."},
      {text:label(kind==="lr"?L(i):X),correct:false,mc:"head-count",fb:"head 노드도 원형 고리의 어엿한 한 칸이다 — 건너뛰지 말고 세어 보라."}
    ].filter(c=>c.text!==label(ans));
    return {qtype, params:{ring,i,kind}, id:"G16", mono:true,
      viz:{type:"dlist",nodes:ring.map((rv,i2)=>(rv==="head"?{head:1,hl:i2===i?1:0}:{v:rv,hl:i2===i?1:0}))},
      stem:'그림의 이중 연결 원형 리스트(시계방향 = rlink): '+ringStr+'. <span class="mono">ptr</span> 가 <b>'+label(X)+'</b>를 가리킬 때 <span class="mono">'+stemOp+'</span> 는?',
      okfb: kind==="lr"?'왼쪽으로 갔다가(llink) 오른쪽으로 돌아오면(rlink) 제자리 — 항등식 ptr = ptr->llink->rlink.':(kind==="r"?'rlink 한 칸 — 시계방향 다음인 '+label(R(i))+'.':'llink 한 칸 — 반시계방향 이웃인 '+label(L(i))+'.'),
      choices:g2Fill(cands,{text:label(ans),correct:true},4)};
  }
  if(qtype==="dins"){
    const i=g2R(0,ring.length-1);
    const X=ring[i];
    const nv=String(pick([15,25,35,45,55,65,75,85,95].filter(v=>!vals.includes(v))));
    const res=ring.slice(0,i+1).concat([nv],ring.slice(i+1));
    const wLeft=ring.slice(0,i).concat([nv],ring.slice(i));
    const seq=a=>{ const k=a.indexOf("head"); const rot=a.slice(k).concat(a.slice(0,k)); return rot.join(" → ")+" → (다시 head)"; };
    const wFar=ring.slice(0,(i+2>ring.length?1:i+2)).concat([nv],ring.slice((i+2>ring.length?1:i+2)));
    const cands=[
      {text:seq(wLeft),correct:false,mc:"direction-swap",fb:"'오른쪽에 삽입' — newnode는 "+label(X)+"의 rlink 쪽이다."},
      {text:seq(wFar),correct:false,mc:"order-swap",fb:"기준은 "+label(X)+" — 바로 그 오른쪽 자리다."},
      {text:seq(ring)+" (그대로)",correct:false,mc:"no-op-myth",fb:"네 줄의 링크 대입이 원형 고리에 새 노드를 끼워 넣는다."}
    ].filter(c=>c.text!==seq(res));
    return {qtype, params:{ring,i,nv}, id:"G16", mono:true,
      viz:{type:"dlist",nodes:ring.map((rv,i2)=>(rv==="head"?{head:1,hl:i2===i?1:0}:{v:rv,hl:i2===i?1:0}))},
      stem:'그림의 이중 연결 원형 리스트 '+ringStr+' 에서 <span class="mono">dinsert('+(X==="head"?"head":X)+', '+nv+')</span> — 값 '+nv+' 새 노드를 <b>'+label(X)+'의 오른쪽</b>에 삽입한다. 삽입 후 head부터 시계방향(rlink) 순서는?',
      okfb:label(X)+'의 rlink 자리에 끼어든다 — '+seq(res)+'.',
      choices:g2Fill(cands,{text:seq(res),correct:true},4)};
  }
  /* ddel — vals 중 하나 삭제 후, 그 왼쪽 이웃의 rlink */
  const i=g2R(1,ring.length-1);       /* head 제외 */
  const X=ring[i];
  const left=L(i), right=R(i);
  const cands=[
    {text:label(X)+" — 링크는 삭제 후에도 그대로 남는다",correct:false,mc:"free-auto",fb:"deleted->llink->rlink = deleted->rlink 가 정확히 이 링크를 갈아 끼운다."},
    {text:"head 노드 — 삭제하면 항상 기준점으로 되돌린다",correct:false,mc:"head-count",fb:"head로 돌아가는 게 아니라 삭제된 노드의 '다음'을 물려받는다."},
    {text:label(left)+" — 자기 자신을 가리키게 된다",correct:false,mc:"self-link",fb:(ring.length<=2?"":"자기 자신을 가리키는 것은 원소가 하나뿐일 때의 head 이야기다.")||"링크는 이웃으로 이어진다."}
  ].filter(c=>c.text!==label(right));
  return {qtype, params:{ring,i}, id:"G16", mono:true,
    viz:{type:"dlist",nodes:ring.map((rv,i2)=>(rv==="head"?{head:1,hl:i2===i?1:0}:{v:rv,hl:i2===i?1:0}))},
    stem:'그림의 이중 연결 원형 리스트 '+ringStr+' 에서 <span class="mono">ddelete</span> 로 <b>'+label(X)+'</b>를 삭제했다. 삭제 후 <b>'+label(left)+'의 rlink</b>가 가리키는 것은?',
    okfb:'deleted->llink->rlink = deleted->rlink — '+label(left)+'는 '+label(X)+'를 건너뛰고 '+label(right)+'를 가리킨다.',
    choices:g2Fill(cands,{text:label(right),correct:true},4)};
}

/* AP4 — 챕터 4 심화 3문 */
function genAP4ch(idx){
  if(idx===0){
    const CASES=[
      {stem:'<span class="mono">ptr == NULL</span>(공백 리스트)에 <span class="mono">insert(&ptr, node)</span> 를 실행하면?',
       ans:"else 경로 — temp->link=NULL, *ptr=temp: 새 노드 하나짜리 리스트가 된다",
       why:"공백이면 if(*ptr)가 거짓 — 시작 포인터 자체를 새 노드로 바꾼다(이중 포인터의 존재 이유).",
       w1:{text:"if 경로 — temp->link=node->link, node->link=temp가 그대로 실행된다",mc:"branch-swap",fb:"이어 붙일 node가 없다 — *ptr가 NULL이면 else다."},
       w2:{text:"malloc이 실패해 The memory is full을 출력하고 종료된다",mc:"full-confuse",fb:"공백 리스트와 메모리 부족은 전혀 다른 상황이다."}},
      {stem:'노드가 <b>하나뿐</b>인 리스트 <span class="mono">ptr → 30 → NULL</span> 에서 그 첫 노드를 <span class="mono">delete(&ptr, NULL, node)</span> 로 삭제하면?',
       ans:"*ptr = (*ptr)->link = NULL — 공백 리스트로 되돌아간다",
       why:"첫 노드 삭제(trail=NULL) — 시작 포인터가 삭제 노드의 link(NULL)를 물려받는다.",
       w1:{text:"trail->link = node->link 가 실행되다가 NULL 참조 오류가 난다",mc:"branch-swap",fb:"trail이 NULL이면 if(trail)이 거짓 — 그 줄은 실행되지 않는다."},
       w2:{text:"ptr가 free된 30 노드를 계속 가리켜 리스트가 남아 있게 된다",mc:"free-auto",fb:"free 전에 *ptr가 이미 NULL로 바뀌어 있다 — 순서가 지켜 준다."}},
      {stem:'리스트 <span class="mono">ptr → 10 → 20 → NULL</span> 의 <b>마지막 노드(20) 뒤</b>에 insert로 새 노드를 붙이면, <span class="mono">temp->link = node->link</span> 의 결과는?',
       ans:"temp->link = NULL — 새 노드가 새로운 마지막 노드가 된다",
       why:"20의 link 값(NULL)을 그대로 물려받는다 — 끝에 붙는 삽입도 같은 코드로 처리된다.",
       w1:{text:"temp->link가 첫 노드(10)를 가리켜 원형 리스트가 된다",mc:"circular-confuse",fb:"단순 리스트의 끝은 NULL — 처음으로 되돌아가지 않는다."},
       w2:{text:"node->link가 NULL이라 삽입이 거부되고 오류가 출력된다",mc:"null-fear",fb:"NULL도 어엿한 링크 값이다 — 물려받으면 그만이다."}}];
    const c=pick(CASES);
    return {id:"AP1", qtype:"edge", params:{}, mono:true,
      stem:'[심화 — 경계 조건] '+c.stem, okfb:c.why,
      choices:shuffle([
        {text:c.ans,correct:true},
        {text:c.w1.text,correct:false,mc:c.w1.mc,fb:c.w1.fb},
        {text:c.w2.text,correct:false,mc:c.w2.mc,fb:c.w2.fb}])};
  }
  if(idx===1){
    return {id:"AP2", qtype:"dins-order", params:{}, mono:true,
      stem:'[심화 — 사고 실험] dinsert의 네 줄 중 <span class="mono">④ node->rlink = newnode</span> 를 <span class="mono">③ node->rlink->llink = newnode</span> 보다 <b>먼저</b> 실행하면 무슨 일이 생기는가?',
      okfb:'③이 기댈 node->rlink가 이미 newnode로 바뀌어 있다 — "기존 오른쪽 노드"로 가는 길을 잃고, newnode->llink가 자기 자신을 가리키게 된다.',
      choices:shuffle([
        {text:"③이 기존 오른쪽 노드 대신 newnode 자신의 llink를 바꿔 버린다",correct:true},
        {text:"네 줄이 모두 실행되기만 하면 결과는 같다 — 순서는 상관없다",correct:false,mc:"order-free",fb:"③은 node->rlink를 '경유'해 기존 오른쪽 노드를 찾는다 — ④가 그 길을 먼저 덮으면 끝이다."},
        {text:"문법에 어긋난 대입 순서라 컴파일 오류가 나고 즉시 멈춘다",correct:false,mc:"compiler-magic",fb:"문법상 멀쩡한 코드다 — 컴파일러는 논리 순서까지 봐 주지 않는다."},
        {text:"newnode의 rlink가 NULL이 되어 원형 고리가 그대로 끊어진다",correct:false,mc:"null-fear",fb:"NULL이 생기지는 않는다 — 잘못된 노드를 가리키게 될 뿐이다."}])};
  }
  const CASES=[
    {stem:"포인터로 노드를 <b>이미 알고 있을 때</b>, 연결 리스트에서 그 노드 뒤에 새 노드를 삽입하는 비용", ans:"O(1)",
     why:"링크 두 개만 만지면 끝 — 리스트 길이와 무관하다.", w:"O(n)", wmc:"traverse-mix", wfb:"찾는 비용과 헷갈리지 말 것 — 이미 손에 쥔 노드다."},
    {stem:"연결 리스트에서 <b>값으로 노드를 찾는(탐색)</b> 비용", ans:"O(n)",
     why:"첫 노드부터 링크를 타고 하나씩 — 최악이면 끝까지 간다.", w:"O(1)", wmc:"address-calc-myth", wfb:"리스트에는 a[k] 같은 주소 계산이 없다 — 타고 가야 한다."},
    {stem:"배열에서 <b>인덱스로 원소에 접근</b>(a[k])하는 비용", ans:"O(1)",
     why:"시작 주소 + k×원소 크기 — 주소 계산 한 번(1장).", w:"O(n)", wmc:"traverse-mix", wfb:"배열은 세지 않고 계산한다 — 순차 사상의 힘이다."},
    {stem:"원소 n개짜리 <b>배열의 맨 앞에 삽입</b>하는 비용", ans:"O(n)",
     why:"기존 원소 n개가 전부 한 칸씩 밀린다.", w:"O(1)", wmc:"shift-blind", wfb:"자리를 비우는 이동이 원소 수만큼 든다."}];
  const c=pick(CASES);
  const others=["O(log n)","O(n²)"];
  return {id:"AP3", qtype:"bigO", params:{}, mono:true,
    stem:'[심화 — 성능 판단] '+c.stem+'은?',
    okfb:c.why,
    choices:shuffle([
      {text:c.ans,correct:true},
      {text:c.w,correct:false,mc:c.wmc,fb:c.wfb},
      {text:others[0],correct:false,mc:"logn-lure",fb:"이진 탐색(1장)의 곡선이다 — 여기서는 등장할 이유가 없다."},
      {text:others[1],correct:false,mc:"square-lure",fb:"이중 반복의 곡선이다 — 한 번의 삽입/접근에는 과하다."}])};
}

/* ================= 4장(A) 트리 — G17~G20 + AP5 ================= */
/* ---- 트리 유틸 ---- */
function t5Build(spec,parent,depth){
  const n={v:spec[0], c:[], parent:parent||null, depth:depth||1};
  (spec[1]||[]).forEach(cs=>n.c.push(t5Build(cs,n,(depth||1)+1)));
  return n;
}
function t5All(root){ const out=[]; (function w(n){ out.push(n); n.c.forEach(w); })(root); return out; }
function t5Height(n){ return n.c.length? 1+Math.max.apply(null,n.c.map(t5Height)) : 1; }
function t5Viz(n,hlv){
  const o={v:n.v}; if(hlv!==undefined && n.v===hlv) o.hl=1;
  if(n.c.length) o.c=n.c.map(ch=>t5Viz(ch,hlv));
  return o;
}
const T5SHAPES=[
  ["A",[["B",[["D"],["E"]]],["C",[["F"]]]]],
  ["A",[["B",[["D"],["E"],["F"]]],["C"]]],
  ["A",[["B",[["E"]]],["C",[["F"],["G"]]],["D"]]],
  ["A",[["B",[["D",[["G"]]],["E"]]],["C",[["F"]]]]],
  ["A",[["B"],["C",[["E"],["F",[["H"]]]]],["D",[["G"]]]]]
];
function t5Pick(){ return t5Build(pick(T5SHAPES)); }
function t5NumFill(cands,ans,pool2){ /* 숫자 오답 보충 */
  for(const v of shuffle(pool2)){ if(v!==ans && !cands.some(c=>c.text===String(v))) cands.push({text:String(v),correct:false,mc:"count-off",fb:"그림에서 하나씩 짚어 가며 다시 세어 보라."}); }
  return cands;
}

/* --- G17. 트리 용어 (유닛 A) --- */
function genG17(){
  const qtype=pick(["deg","leafcnt","height","level","parent","sib","anc"]);
  const root=t5Pick(), all=t5All(root);
  if(qtype==="deg"){
    const n=pick(all);
    const ans=n.c.length;
    const edges=n.c.length+(n.parent?1:0);
    const cands=[];
    if(edges!==ans) cands.push({text:String(edges),correct:false,mc:"edge-count",fb:"부모와 잇는 선까지 세지 않았나 — 차수는 '자식 수'만 센다."});
    t5NumFill(cands,ans,[0,1,2,3,4]);
    return {id:"G17",qtype,params:{node:n.v,ans},viz:{type:"tree",data:t5Viz(root,n.v)},
      stem:'그림의 트리에서 노드 <b>'+n.v+'</b>의 <b>차수(degree)</b>는?',
      okfb:n.v+'의 자식은 '+(ans? n.c.map(x=>x.v).join(", "):"없다")+' — 차수는 자식의 수, '+ans+'이다.',
      choices:g2Fill(cands,{text:String(ans),correct:true},4)};
  }
  if(qtype==="leafcnt"){
    const leaves=all.filter(n=>!n.c.length);
    const ans=leaves.length, inner=all.length-ans;
    const cands=[{text:String(inner),correct:false,mc:"internal-swap",fb:"자식이 있는 노드를 세지 않았나 — 리프는 차수 0, 자식이 '없는' 노드다."}];
    t5NumFill(cands,ans,[ans-1,ans+1,ans+2].filter(v=>v>0));
    return {id:"G17",qtype,params:{ans},viz:{type:"tree",data:t5Viz(root)},
      stem:'그림의 트리에서 <b>리프(단말) 노드</b>는 모두 몇 개인가?',
      okfb:'자식이 없는 노드 — '+leaves.map(n=>n.v).join(", ")+' 의 '+ans+'개다.',
      choices:g2Fill(cands,{text:String(ans),correct:true},4)};
  }
  if(qtype==="height"){
    const ans=t5Height(root);
    const cands=[{text:String(ans-1),correct:false,mc:"zero-base",fb:"루트의 레벨이 1이다 — 0부터 세지 않는다."}];
    t5NumFill(cands,ans,[ans+1,ans+2,ans-2].filter(v=>v>0));
    return {id:"G17",qtype,params:{ans},viz:{type:"tree",data:t5Viz(root)},
      stem:'그림의 트리의 <b>높이(깊이)</b>는? (루트의 레벨 = 1)',
      okfb:'가장 아래 노드의 레벨이 '+ans+' — 높이는 최대 레벨이다.',
      choices:g2Fill(cands,{text:String(ans),correct:true},4)};
  }
  if(qtype==="level"){
    const n=pick(all.filter(x=>x.parent));
    const ans=n.depth;
    const cands=[{text:String(ans-1),correct:false,mc:"zero-base",fb:"루트가 레벨 1이다 — 한 층 내려올 때마다 1씩 더한다."}];
    t5NumFill(cands,ans,[ans+1,ans+2].filter(v=>v>0&&v<=6));
    return {id:"G17",qtype,params:{node:n.v,ans},viz:{type:"tree",data:t5Viz(root,n.v)},
      stem:'그림의 트리에서 노드 <b>'+n.v+'</b>의 <b>레벨</b>은? (루트의 레벨 = 1)',
      okfb:'루트에서 '+n.v+'까지 층을 세면 '+ans+' — 루트가 1, 한 층에 +1.',
      choices:g2Fill(cands,{text:String(ans),correct:true},4)};
  }
  if(qtype==="parent"){
    const n=pick(all.filter(x=>x.parent&&x.parent.parent));
    const ans=n.parent.v;
    const cands=[{text:n.parent.parent.v,correct:false,mc:"anc-far",fb:"그 노드는 부모의 부모(조상)다 — 부모는 바로 위 한 층이다."}];
    const sibs=n.parent.c.filter(x=>x!==n);
    if(sibs.length) cands.push({text:sibs[0].v,correct:false,mc:"sib-confuse",fb:"같은 부모를 둔 형제다 — 부모가 아니다."});
    if(n.c.length) cands.push({text:n.c[0].v,correct:false,mc:"child-confuse",fb:"그건 "+n.v+"의 자식 — 방향이 반대다."});
    const others=all.filter(x=>x!==n&&x.v!==ans&&!cands.some(c=>c.text===x.v));
    if(others.length) cands.push({text:others[0].v,correct:false,mc:"pick-any",fb:"간선을 따라 바로 위로 한 층 — 그 노드가 부모다."});
    return {id:"G17",qtype,params:{node:n.v,ans},viz:{type:"tree",data:t5Viz(root,n.v)},
      stem:'그림의 트리에서 노드 <b>'+n.v+'</b>의 <b>부모</b>는?',
      okfb:n.v+' 바로 위에서 간선으로 이어진 노드 — '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(qtype==="sib"){
    const n=pick(all.filter(x=>x.parent&&x.parent.c.length>=2));
    const sibs=n.parent.c.filter(x=>x!==n).map(x=>x.v);
    const ans=sibs.join(", ");
    const withSelf=n.parent.c.map(x=>x.v).join(", ");
    const cands=[{text:withSelf,correct:false,mc:"self-include",fb:"자기 자신은 형제에 넣지 않는다."}];
    if(n.c.length) cands.push({text:n.c.map(x=>x.v).join(", "),correct:false,mc:"child-confuse",fb:"그건 "+n.v+"의 자식들 — 형제는 '같은 부모'의 다른 자식이다."});
    cands.push({text:n.parent.v,correct:false,mc:"parent-confuse",fb:"부모는 형제가 아니다 — 형제는 같은 층, 같은 부모다."});
    return {id:"G17",qtype,params:{node:n.v,ans},viz:{type:"tree",data:t5Viz(root,n.v)},
      stem:'그림의 트리에서 노드 <b>'+n.v+'</b>의 <b>형제(sibling)</b>를 모두 고르면?',
      okfb:'부모 '+n.parent.v+'의 다른 자식 — '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  /* anc */
  const n=pick(all.filter(x=>x.depth>=3));
  const path=[]; let p=n.parent; while(p){ path.push(p.v); p=p.parent; }
  const ans=path.join(", ");
  const cands=[{text:path.slice(0,-1).join(", ")||path[0],correct:false,mc:"root-drop",fb:"루트도 조상이다 — 루트까지 끝까지 올라간다."},
    {text:[n.v].concat(path).join(", "),correct:false,mc:"self-include",fb:"자기 자신은 조상에 넣지 않는다."}];
  if(n.parent.c.length>=2) cands.push({text:n.parent.c.filter(x=>x!==n).map(x=>x.v).concat(path).join(", "),correct:false,mc:"sib-confuse",fb:"형제는 조상이 아니다 — 조상은 루트로 가는 길 위의 노드만이다."});
  else if(n.c.length) cands.push({text:n.c.map(x=>x.v).join(", "),correct:false,mc:"child-confuse",fb:"그건 자손 쪽 — 조상은 위로 가는 길이다."});
  if(path.length>=2) cands.push({text:path.slice().reverse().join(", "),correct:false,mc:"order-flip",fb:"조상은 '부모부터' 루트로 — 순서가 뒤집혔다."});
  return {id:"G17",qtype,params:{node:n.v,ans},viz:{type:"tree",data:t5Viz(root,n.v)},
    stem:'그림의 트리에서 노드 <b>'+n.v+'</b>의 <b>조상(ancestors)</b>을 모두 나열하면?',
    okfb:n.v+'에서 루트까지 올라가는 길 — '+ans+'.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* --- G18. 왼쪽자식-오른쪽형제 표현 (유닛 B) --- */
function genG18(){
  const qtype=pick(["l","r","null2"]);
  const root=t5Pick(), all=t5All(root);
  const firstChild=n=>n.c.length?n.c[0]:null;
  const nextSib=n=>{ if(!n.parent) return null; const k=n.parent.c.indexOf(n); return n.parent.c[k+1]||null; };
  const NUL='NULL';
  if(qtype==="l"||qtype==="r"){
    const n=pick(all.filter(x=>x.parent||x.c.length));
    const target=qtype==="l"?firstChild(n):nextSib(n);
    const wrongN=qtype==="l"?nextSib(n):firstChild(n);
    const ans=target?target.v:NUL;
    const cands=[];
    if(wrongN) cands.push({text:wrongN.v,correct:false,mc:"lr-swap",fb:"왼쪽 포인터=첫째 자식, 오른쪽 포인터=바로 다음 형제 — 둘을 바꿔 짚었다."});
    else if(target) cands.push({text:NUL,correct:false,mc:"null-rush",fb:(qtype==="l"?"자식":"형제")+"가 있는지 그림에서 다시 확인하라."});
    if(n.c.length>=2) cands.push({text:n.c[1].v,correct:false,mc:"second-child",fb:"왼쪽 포인터가 잡는 것은 '첫째' 자식 하나 — 둘째부터는 형제 사슬로 이어진다."});
    if(n.parent&&n.parent.v!==ans) cands.push({text:n.parent.v,correct:false,mc:"parent-link",fb:"이 표현의 두 포인터는 아래(자식)와 옆(형제)뿐 — 위로 가는 포인터는 없다."});
    const others=all.filter(x=>x.v!==ans&&x!==n&&!cands.some(c=>c.text===x.v));
    for(const o of others){ if(cands.length>=3) break; cands.push({text:o.v,correct:false,mc:"pick-any",fb:"포인터의 규칙부터 — 왼쪽은 첫째 자식, 오른쪽은 다음 형제다."}); }
    return {id:"G18",qtype,params:{node:n.v,ans},viz:{type:"tree",data:t5Viz(root,n.v)},
      stem:'그림의 트리를 <b>왼쪽자식-오른쪽형제</b> 표현으로 만들 때, 노드 <b>'+n.v+'</b>의 <b>'+(qtype==="l"?"왼쪽(자식) 포인터":"오른쪽(형제) 포인터")+'</b>가 가리키는 것은?',
      okfb:qtype==="l"?(target?n.v+'의 첫째 자식 — '+ans+'.':n.v+'는 자식이 없다 — 왼쪽 포인터는 NULL.'):(target?n.v+' 바로 다음 형제 — '+ans+'.':n.v+'는 마지막(또는 유일한) 형제다 — 오른쪽 포인터는 NULL.'),
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  /* null2 */
  const n=pick(all.filter(x=>x.parent));
  const hasC=!!firstChild(n), hasS=!!nextSib(n);
  const ans=!hasC&&!hasS?"both":(!hasC?"l":(!hasS?"r":"none"));
  const TXT={l:"왼쪽(자식) 포인터만 NULL이다", r:"오른쪽(형제) 포인터만 NULL이다", both:"두 포인터가 모두 NULL이다", none:"두 포인터 모두 NULL이 아니다"};
  const FB={l:"자식이 없으니 왼쪽이 NULL — 다음 형제는 있다.", r:"다음 형제가 없으니 오른쪽이 NULL — 첫째 자식은 있다.", both:"자식도, 다음 형제도 없다 — 둘 다 NULL.", none:"첫째 자식도, 다음 형제도 있다 — 둘 다 채워진다."};
  return {id:"G18",qtype,params:{node:n.v,ans},viz:{type:"tree",data:t5Viz(root,n.v)},
    stem:'그림의 트리를 <b>왼쪽자식-오른쪽형제</b> 표현으로 만들 때, 노드 <b>'+n.v+'</b>의 두 포인터는? (왼쪽=첫째 자식, 오른쪽=바로 다음 형제)',
    okfb:FB[ans],
    choices:shuffle(["l","r","both","none"].map(k=>({text:TXT[k],correct:k===ans,mc:k===ans?undefined:"null-map",fb:k===ans?undefined:"그림에서 "+n.v+"의 첫째 자식과 다음 형제를 각각 짚어 보라."})))};
}

/* --- G19. 이진 트리 성질 (유닛 C) --- */
function genG19(){
  const qtype=pick(["lvlmax","depthmax","fullleaf","complete","skewcnt"]);
  if(qtype==="lvlmax"){
    const i=g2R(3,5), ans=Math.pow(2,i-1);
    const cands=[{text:String(Math.pow(2,i)),correct:false,mc:"exp-off",fb:"레벨 1이 2⁰=1개에서 출발한다 — 레벨 i의 최대는 2^(i−1)이다."},
      {text:String(2*i),correct:false,mc:"linear-myth",fb:"층마다 '2배'로 는다 — 2씩 더하는 게 아니다."},
      {text:String(Math.pow(2,i-1)-1),correct:false,mc:"sum-confuse",fb:"2^i−1은 트리 '전체'의 최대 — 한 레벨의 최대와 헷갈리지 말 것."}];
    return {id:"G19",qtype,params:{i,ans},
      stem:'이진 트리의 <b>레벨 '+i+'</b>에 올 수 있는 노드의 <b>최대 개수</b>는? (루트의 레벨 = 1)',
      okfb:'레벨 1부터 1, 2, 4, … — 레벨 '+i+'의 최대는 2^'+(i-1)+' = '+ans+'개다.',
      choices:g2Fill(cands,{text:String(ans),correct:true},4)};
  }
  if(qtype==="depthmax"){
    const k=g2R(3,5), ans=Math.pow(2,k)-1;
    const cands=[{text:String(Math.pow(2,k)),correct:false,mc:"minus-one-drop",fb:"1+2+4+…+2^(k−1) = 2^k−1 — 마지막 −1을 빠뜨렸다."},
      {text:String(Math.pow(2,k-1)),correct:false,mc:"last-level-only",fb:"그것은 마지막 레벨 '한 층'의 최대 — 전체는 층들을 다 더한다."},
      {text:String(2*k),correct:false,mc:"linear-myth",fb:"층마다 2배로 는다 — 합은 2^k−1이다."}];
    return {id:"G19",qtype,params:{k,ans},
      stem:'깊이(높이)가 <b>'+k+'</b>인 이진 트리가 가질 수 있는 노드의 <b>최대 개수</b>는?',
      okfb:'각 층 최대 1+2+…+2^'+(k-1)+' — 전부 더하면 2^'+k+'−1 = '+ans+'개다.',
      choices:g2Fill(cands,{text:String(ans),correct:true},4)};
  }
  if(qtype==="fullleaf"){
    const k=g2R(3,5), ans=Math.pow(2,k-1);
    const cands=[{text:String(Math.pow(2,k)-1),correct:false,mc:"total-confuse",fb:"2^k−1은 트리 '전체' 노드 수 — 리프는 마지막 레벨만이다."},
      {text:String(Math.pow(2,k)),correct:false,mc:"exp-off",fb:"마지막 레벨은 레벨 k — 최대 2^(k−1)개다."},
      {text:String(k),correct:false,mc:"linear-myth",fb:"경사 트리와 헷갈리지 말 것 — 포화 트리의 마지막 층은 2^(k−1)개다."}];
    return {id:"G19",qtype,params:{k,ans},
      stem:'깊이가 <b>'+k+'</b>인 <b>포화(full) 이진 트리</b>의 <b>리프 노드 수</b>는?',
      okfb:'포화 트리의 리프는 전부 마지막 레벨 '+k+'에 있다 — 2^'+(k-1)+' = '+ans+'개.',
      choices:g2Fill(cands,{text:String(ans),correct:true},4)};
  }
  if(qtype==="complete"){
    const n=g2R(5,6);
    const isC=Math.random()<0.5;
    let idxs;
    if(isC) idxs=Array.from({length:n},(_,x)=>x+1);
    else {
      const par=Math.floor((n+1)/2);   /* n+1번의 부모 — 지우면 안 되는 노드 */
      const drop=pick(Array.from({length:n},(_,x)=>x+1).filter(x=>x>=3 && 2*x>n && x!==par));
      idxs=Array.from({length:n},(_,x)=>x+1).filter(x=>x!==drop); idxs.push(n+1); idxs.sort((a,b)=>a-b);
    }
    /* idxs → 이진 트리(번호 태그) */
    const has=x=>idxs.includes(x);
    function bt(x){ const o={v:String(x),tag:x}; const kids=[]; if(has(2*x)||has(2*x+1)){ kids.push(has(2*x)?bt(2*x):null); kids.push(has(2*x+1)?bt(2*x+1):null); o.c=kids; } return o; }
    const complete=idxs.every((x,k)=>x===k+1);
    const missing=complete?0:Array.from({length:Math.max.apply(null,idxs)},(_,x)=>x+1).find(x=>!has(x));
    const RIGHT={text:"완전 이진 트리다 — 1번부터 빈 번호 없이 채워져 있다",correct:true};
    const WRONG1={text:"완전 이진 트리가 아니다 — 중간 번호 자리가 비어 있다",correct:true};
    const c1={...RIGHT,correct:complete}; const c2={...WRONG1,correct:!complete};
    if(complete) c2.mc="gap-miss", c2.fb="번호를 1부터 짚어 보라 — 건너뛴 번호가 없다.";
    else c1.mc="gap-blind", c1.fb=missing+"번 자리가 비어 있다 — 번호가 이어져야 완전이다.";
    return {id:"G19",qtype,params:{idxs,complete},viz:{type:"tree",data:bt(1),slots:true},
      stem:'그림의 이진 트리(노드 옆 숫자 = 포화 트리 기준 번호)는 <b>완전(complete) 이진 트리</b>인가?',
      okfb:complete?'번호 1~'+n+'이 빈틈없이 이어진다 — 완전 이진 트리다.':(missing+'번 자리가 빈 채 '+(n+1)+'번이 있다 — 완전이 아니다.'),
      choices:shuffle([c1,c2,
        {text:"포화 이진 트리다 — 마지막 레벨까지 전부 가득 찼다",correct:false,mc:"full-confuse",fb:"포화는 2^k−1개를 '다' 채운 경우다 — 마지막 레벨이 가득 찼는지 보라."},
        {text:"이진 트리가 아니다 — 자식을 셋 가진 노드가 있다",correct:false,mc:"not-binary",fb:"모든 노드의 자식이 2개 이하다 — 이진 트리는 맞다."}])};
  }
  /* skewcnt */
  const k=g2R(4,6), ans=k;
  function skew(d){ return d===k?{v:String(d)}:{v:String(d),c:[skew(d+1),null]}; }
  const cands=[{text:String(Math.pow(2,k)-1),correct:false,mc:"max-confuse",fb:"2^k−1은 '최대' — 경사 트리는 층마다 한 개뿐인 '최소'다."},
    {text:String(Math.pow(2,k-1)),correct:false,mc:"exp-lure",fb:"지수는 필요 없다 — 층마다 딱 하나씩 k개다."},
    {text:String(k-1),correct:false,mc:"zero-base",fb:"루트도 한 개로 센다 — 층 수만큼, k개다."}];
  return {id:"G19",qtype,params:{k,ans},viz:{type:"tree",data:skew(1),slots:true,unit:40},
    stem:'깊이가 <b>'+k+'</b>인 <b>왼쪽 경사(skewed) 이진 트리</b>의 노드 수는? (그림: 층마다 왼쪽으로만)',
    okfb:'경사 트리는 층마다 노드가 하나 — 깊이 '+k+'이면 '+k+'개다.',
    choices:g2Fill(cands,{text:String(ans),correct:true},4)};
}

/* --- G20. 배열 표현 (유닛 D) --- */
function genG20(){
  const qtype=pick(["parent","left","right","waste"]);
  function cbt(n){ const has=x=>x<=n; function bt(x){ const o={v:String(x)}; if(has(2*x)||has(2*x+1)){ o.c=[has(2*x)?bt(2*x):null, has(2*x+1)?bt(2*x+1):null]; } return o; } return bt(1); }
  function hl(node,tv){ if(node.v===tv) node.hl=1; (node.c||[]).forEach(c=>c&&hl(c,tv)); return node; }
  if(qtype==="waste"){
    const k=g2R(3,5), need=Math.pow(2,k)-1, used=k, ans=need-used;
    function skew(d){ return d===k?{v:String(Math.pow(2,d-1))}:{v:String(Math.pow(2,d-1)),c:[skew(d+1),null]}; }
    const cands=[{text:String(need),correct:false,mc:"need-confuse",fb:"그것은 '필요한 전체 칸 수' — 낭비는 거기서 실제 사용 "+used+"칸을 뺀다."},
      {text:String(Math.pow(2,k)-k),correct:false,mc:"minus-one-drop",fb:"전체는 2^k−1칸이다 — −1을 빠뜨리지 말 것."},
      {text:String(used),correct:false,mc:"used-confuse",fb:"그것은 '쓰는 칸 수'다 — 낭비는 비는 칸 수다."}];
    return {id:"G20",qtype,params:{k,ans},viz:{type:"tree",data:skew(1),slots:true,unit:40},
      stem:'깊이 <b>'+k+'</b>의 <b>왼쪽 경사 트리</b>(그림)를 배열 표현으로 담으면, 확보해야 하는 칸은 2^'+k+'−1 = '+need+'칸이다. 이 중 <b>빈 채로 낭비되는 칸</b>은 몇 칸인가?',
      okfb:'실제 노드는 '+used+'개뿐 — '+need+' − '+used+' = '+ans+'칸이 빈다.',
      choices:g2Fill(cands,{text:String(ans),correct:true},4)};
  }
  /* parent/left/right — 그림을 주면 답이 그대로 보이므로 공식 적용 문제로 낸다(그림 없음) */
  const i= qtype==="parent"?g2R(4,10):g2R(2,5);
  const ans= qtype==="parent"?Math.floor(i/2): qtype==="left"?2*i:2*i+1;
  const OPQ={parent:"부모", left:"왼쪽 자식", right:"오른쪽 자식"};
  const cands=[];
  if(qtype==="parent"){
    cands.push({text:String(Math.floor((i-1)/2)),correct:false,mc:"zero-base-mix",fb:"이 책의 번호는 1번부터다 — 부모는 i/2(소수점 버림)."});
    cands.push({text:String(i-1),correct:false,mc:"minus-myth",fb:"한 칸 앞이 부모가 아니다 — 층이 다르다. i/2로 올라간다."});
    cands.push({text:String(2*i),correct:false,mc:"lr-swap",fb:"2i는 왼쪽 '자식' — 방향이 반대다."});
  } else {
    cands.push({text:String(qtype==="left"?2*i+1:2*i),correct:false,mc:"lr-swap",fb:"왼쪽 자식이 2i, 오른쪽 자식이 2i+1 — 좌우를 바꿔 짚었다."});
    cands.push({text:String(i+1),correct:false,mc:"next-slot",fb:"바로 옆 칸은 형제나 사촌 — 자식은 2i, 2i+1로 '뛴다'."});
    cands.push({text:String(Math.floor(i/2)),correct:false,mc:"parent-swap",fb:"i/2는 '부모'로 올라가는 공식이다."});
  }
  return {id:"G20",qtype,params:{i,ans},
    stem:'완전 이진 트리를 배열로 표현했다(노드 번호 = 배열 인덱스, 1번부터). 노드 <b>'+i+'</b>의 <b>'+OPQ[qtype]+'</b> 인덱스는?',
    okfb: qtype==="parent"?('부모는 i/2 — '+i+'/2 = '+ans+' (소수점 버림).'):('왼쪽 자식 2i, 오른쪽 자식 2i+1 — '+(qtype==="left"?('2×'+i+' = '+ans):('2×'+i+'+1 = '+ans))+'.'),
    choices:g2Fill(cands,{text:String(ans),correct:true},4)};
}

/* --- AP5. 4장(A) 심화 (도발장) --- */
function genAP5ch(idx){
  if(idx===0){
    const root=t5Build(pick([T5SHAPES[3],T5SHAPES[4],T5SHAPES[2]]));
    const all=t5All(root);
    const n=pick(all.filter(x=>x.c.length>=2));
    const ans=n.c[1].v;   /* 왼자(첫자식)의 오른형제 = 둘째 자식 */
    const cands=[{text:n.c[0].v,correct:false,mc:"first-stop",fb:"왼쪽 포인터가 첫째 자식까지 — 거기서 '오른쪽'을 한 번 더 가면 다음 형제다."}];
    if(n.c.length>=3) cands.push({text:n.c[2].v,correct:false,mc:"two-far",fb:"오른쪽 한 번 = 형제 한 칸 — 셋째까지 가려면 두 번이다."});
    if(n.parent) cands.push({text:n.parent.v,correct:false,mc:"parent-link",fb:"이 표현에 위로 가는 포인터는 없다."});
    const others=all.filter(x=>x!==n&&x.v!==ans&&!cands.some(c=>c.text===x.v));
    if(others.length) cands.push({text:others[0].v,correct:false,mc:"pick-any",fb:"왼쪽=첫째 자식, 오른쪽=다음 형제 — 두 걸음을 차례로 밟아라."});
    return {id:"AP5",qtype:"lcrs2",params:{node:n.v,ans},viz:{type:"tree",data:t5Viz(root,n.v)},
      stem:'[심화 — 표현 변환] 그림의 트리를 <b>왼쪽자식-오른쪽형제</b> 표현으로 바꾸어 이진 트리처럼 읽는다. <b>'+n.v+'의 왼쪽 자식의 오른쪽 자식</b>은 원래 트리의 어느 노드인가?',
      okfb:'왼쪽(첫째 자식 '+n.c[0].v+') → 오른쪽(다음 형제) — 곧 '+n.v+'의 둘째 자식 '+ans+'다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(idx===1){
    const CASE=pick([[6,3],[9,4],[12,4],[20,5],[25,5]]);
    const n=CASE[0], ans=CASE[1];
    const cands=[{text:String(ans+1),correct:false,mc:"ceil-off",fb:"레벨 1부터 차곡차곡 — 2^h−1 ≥ n 이 되는 최소 h를 찾아라."},
      {text:String(ans-1),correct:false,mc:"floor-off",fb:"2^"+(ans-1)+"−1 = "+(Math.pow(2,ans-1)-1)+"개까지만 담긴다 — "+n+"개는 한 층 더 필요하다."},
      {text:String(n%2===0?n/2:(n-1)/2),correct:false,mc:"linear-myth",fb:"높이는 로그 곡선으로 자란다 — 절반이 아니다."}];
    return {id:"AP5",qtype:"cbt-height",params:{n,ans},
      stem:'[심화 — 성질] 노드가 <b>'+n+'개</b>인 <b>완전 이진 트리</b>의 높이는? (루트의 레벨 = 1)',
      okfb:'깊이 h까지 최대 2^h−1개 — 2^'+(ans-1)+'−1 = '+(Math.pow(2,ans-1)-1)+' < '+n+' ≤ 2^'+ans+'−1 = '+(Math.pow(2,ans)-1)+' 이므로 높이는 '+ans+'.',
      choices:g2Fill(cands,{text:String(ans),correct:true},4)};
  }
  /* idx 2 — 배열 조상 사슬 */
  const i=pick([9,10,11,12,13,14,15]);
  const path=[]; let x=Math.floor(i/2); while(x>=1){ path.push(x); x=Math.floor(x/2); }
  const ans=path.join(" → ");
  const wrongCeil=[]; x=Math.ceil(i/2); const seen=new Set();
  while(x>1&&!seen.has(x)){ seen.add(x); wrongCeil.push(x); x=Math.ceil(x/2); } wrongCeil.push(1);
  const cands=[{text:path.slice(0,-1).join(" → ")||String(path[0]),correct:false,mc:"root-drop",fb:"1번(루트)까지가 조상이다 — 끝까지 올라가라."},
    {text:[i].concat(path).join(" → "),correct:false,mc:"self-include",fb:"자기 자신은 조상이 아니다 — i/2부터 시작한다."}];
  const wc=wrongCeil.join(" → ");
  if(wc!==ans) cands.push({text:wc,correct:false,mc:"ceil-myth",fb:"소수점은 '버림'이다 — 홀수 번호도 i/2 내림으로 올라간다."});
  return {id:"AP5",qtype:"anc-chain",params:{i,ans},
    stem:'[심화 — 배열 표현] 완전 이진 트리의 배열 표현(1번부터)에서, 노드 <b>'+i+'</b>의 <b>조상 번호를 차례로</b>(부모부터 루트까지) 나열하면?',
    okfb:'부모는 i/2(버림) — '+i+' → '+ans+'.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* ================= 4장(B) 트리 순회 — G21~G24 + AP6 ================= */
/* ---- 이진 트리 유틸 ---- */
function t6Shape(){
  const S=[
    {l:{l:{},r:{}}, r:{l:{},r:{}}},                    /* 포화 7 */
    {l:{l:{},r:{}}, r:{r:{}}},                          /* 6 — C는 오른쪽만 */
    {l:{r:{}}, r:{l:{}}},                               /* 5 — 지그재그 */
    {l:{l:{l:{}},r:{}}, r:{}},                          /* 6 — 왼쪽 깊음 */
    {l:{}, r:{l:{l:{}},r:{}}},                          /* 6 — 오른쪽 깊음 */
    {l:{l:{},r:{r:{}}}, r:{l:{}}}                       /* 7 — 혼합 */
  ];
  return pick(S);
}
function t6Build(shape){ /* BFS 순서로 A,B,C… 라벨 */
  const root={sh:shape||{}, l:null, r:null, v:null};
  const q=[root]; const L=shuffle("ABCDEFG".split("")); let k=0;   /* BFS순 알파벳이면 레벨 순회 답이 노출 — 셔플 */
  while(q.length){
    const n=q.shift(); n.v=L[k++];
    if(n.sh.l!==undefined){ n.l={sh:n.sh.l}; q.push(n.l); }
    if(n.sh.r!==undefined){ n.r={sh:n.sh.r}; q.push(n.r); }
  }
  return root;
}
function t6Pre(n,out){ if(!n) return out; out.push(n.v); t6Pre(n.l,out); t6Pre(n.r,out); return out; }
function t6In(n,out){ if(!n) return out; t6In(n.l,out); out.push(n.v); t6In(n.r,out); return out; }
function t6Post(n,out){ if(!n) return out; t6Post(n.l,out); t6Post(n.r,out); out.push(n.v); return out; }
function t6Lvl(root){ const out=[],q=[root]; while(q.length){ const n=q.shift(); out.push(n.v); if(n.l)q.push(n.l); if(n.r)q.push(n.r);} return out; }
function t6All(n,out){ if(!n) return out; out.push(n); t6All(n.l,out); t6All(n.r,out); return out; }
function t6Viz(n,hlv){
  if(!n) return null;
  const o={v:n.v}; if(hlv!==undefined&&n.v===hlv) o.hl=1;
  if(n.l||n.r) o.c=[t6Viz(n.l,hlv), t6Viz(n.r,hlv)];
  return o;
}
const t6Seq=a=>a.join(", ");
const TRNAME={pre:"전위(VLR)", in:"중위(LVR)", post:"후위(LRV)", lvl:"레벨(층별)"};

/* --- G21. 순회 3종 (유닛 A) --- */
function genG21(){
  const qtype=pick(["pre","in","post","kth","postlast"]);
  const root=t6Build(t6Shape());
  const seqs={pre:t6Pre(root,[]), in:t6In(root,[]), post:t6Post(root,[]), lvl:t6Lvl(root)};
  const viz={type:"tree",data:t6Viz(root),slots:true};
  if(qtype==="kth"){
    const tr=pick(["pre","in","post"]);
    const k=g2R(2,seqs[tr].length-1);
    const ans=seqs[tr][k-1];
    const cands=[
      {text:seqs[tr][k-2],correct:false,mc:"off-by-one",fb:"방문 순서를 처음부터 다시 밟아 보라 — 한 걸음 어긋났다."},
      {text:seqs[tr][k%seqs[tr].length],correct:false,mc:"off-by-one",fb:"k번째 — 손가락으로 하나씩 세며 다시."},
      {text:seqs.lvl[k-1],correct:false,mc:"level-mix",fb:"층별로 세지 않았나 — "+TRNAME[tr]+" 순서로 세어야 한다."}
    ].filter(c=>c.text!==ans);
    return {id:"G21",qtype,params:{tr,k,ans},viz,
      stem:'그림의 트리를 <b>'+TRNAME[tr]+' 순회</b>할 때, <b>'+k+'번째</b>로 방문(출력)되는 노드는?',
      okfb:TRNAME[tr]+' 순서는 '+t6Seq(seqs[tr])+' — '+k+'번째는 '+ans+'다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(qtype==="postlast"){
    const ans=root.v;
    const all=t6All(root,[]);
    const lastIn=seqs.in[seqs.in.length-1], firstPost=seqs.post[0];
    const cands=[
      {text:firstPost,correct:false,mc:"first-last-swap",fb:"그 노드는 후위의 '첫' 방문 — 마지막이 아니다."},
      {text:lastIn,correct:false,mc:"inorder-mix",fb:"중위의 마지막(가장 오른쪽 노드)과 헷갈리지 말 것."},
      {text:pick(all.filter(n=>!n.l&&!n.r)).v,correct:false,mc:"leaf-pick",fb:"리프는 일찍 처리된다 — 후위는 자식을 다 마친 뒤 자신이므로, 마지막은 언제나 루트다."}
    ].filter(c=>c.text!==ans);
    return {id:"G21",qtype,params:{ans},viz,
      stem:'그림의 트리를 <b>후위(LRV) 순회</b>할 때, <b>맨 마지막</b>에 방문되는 노드는?',
      okfb:'후위는 왼쪽·오른쪽을 전부 마치고 자신 — 트리 전체를 마치는 마지막 방문은 언제나 루트 '+ans+'다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  const ans=t6Seq(seqs[qtype]);
  const others=["pre","in","post","lvl"].filter(t=>t!==qtype&&t6Seq(seqs[t])!==ans);
  const MC={pre:"pre-mix",in:"in-mix",post:"post-mix",lvl:"level-mix"};
  const cands=others.map(t=>({text:t6Seq(seqs[t]),correct:false,mc:MC[t],fb:"그 순서는 "+TRNAME[t]+" 순회의 결과다 — printf가 찍히는 시점을 다시 보라."}));
  const rev=t6Seq(seqs[qtype].slice().reverse());
  if(rev!==ans) cands.push({text:rev,correct:false,mc:"reverse-mix",fb:"통째로 뒤집힌 순서다 — L·V·R의 자리부터 다시."});
  return {id:"G21",qtype,params:{ans},viz,
    stem:'그림의 트리를 <b>'+TRNAME[qtype]+' 순회</b>한 출력 순서는?',
    okfb:TRNAME[qtype]+' — '+ans+'.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* --- G22. 반복 중위·레벨 순회 (유닛 B) --- */
function genG22(){
  const qtype=pick(["lvl","lvlk","which"]);
  const root=t6Build(t6Shape());
  const seqs={pre:t6Pre(root,[]), in:t6In(root,[]), post:t6Post(root,[]), lvl:t6Lvl(root)};
  const viz={type:"tree",data:t6Viz(root),slots:true};
  if(qtype==="which"){
    /* 네 순회의 출력이 전부 서로 다른 트리에서만 출제 */
    const uniq=["pre","in","post","lvl"].every((t,i,arr)=>arr.every((u,j)=>i===j||t6Seq(seqs[t])!==t6Seq(seqs[u])));
    if(!uniq) return genG22();
    const tr=pick(["pre","in","post","lvl"]);
    return {id:"G22",qtype,params:{ans:TRNAME[tr]},viz,
      stem:'그림의 트리에서 어떤 순회를 돌렸더니 출력이 <span class="mono">'+t6Seq(seqs[tr])+'</span> 이었다. <b>어느 순회</b>인가?',
      okfb:'네 순회를 각각 돌려 대조하면 '+TRNAME[tr]+'만 이 순서를 낸다.',
      choices:shuffle(["pre","in","post","lvl"].map(t=>({text:TRNAME[t],correct:t===tr,mc:t===tr?undefined:"trace-mix",fb:t===tr?undefined:TRNAME[t]+"를 직접 돌려 보라 — 이 출력과 다른 지점이 나온다."})))};
  }
  if(qtype==="lvlk"){
    const k=g2R(2,seqs.lvl.length-1);
    const ans=seqs.lvl[k-1];
    const cands=[
      {text:seqs.pre[k-1],correct:false,mc:"pre-mix",fb:"전위(깊이 먼저)로 세지 않았나 — 레벨 순회는 층별, 왼쪽부터다."},
      {text:seqs.lvl[k-2],correct:false,mc:"off-by-one",fb:"층별·왼쪽부터 — 한 칸 어긋났다."},
      {text:seqs.lvl[k%seqs.lvl.length],correct:false,mc:"off-by-one",fb:"큐에서 나오는 순서 그대로 다시 세어 보라."}
    ].filter(c=>c.text!==ans);
    return {id:"G22",qtype,params:{k,ans},viz,
      stem:'그림의 트리를 <b>레벨 순회</b>(층별, 각 층은 왼쪽부터)할 때 <b>'+k+'번째</b> 출력은?',
      okfb:'레벨 순서는 '+t6Seq(seqs.lvl)+' — '+k+'번째는 '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  const ans=t6Seq(seqs.lvl);
  const others=["pre","in","post"].filter(t=>t6Seq(seqs[t])!==ans);
  const cands=others.map(t=>({text:t6Seq(seqs[t]),correct:false,mc:"depth-mix",fb:"그 순서는 "+TRNAME[t]+" — 큐는 층을 다 마치기 전엔 아래로 내려가지 않는다."}));
  const rev=t6Seq(seqs.lvl.slice().reverse());
  if(rev!==ans) cands.push({text:rev,correct:false,mc:"reverse-mix",fb:"아래층부터 뒤집힌 순서 — 큐는 루트부터 위층 먼저다."});
  return {id:"G22",qtype,params:{ans},viz,
    stem:'그림의 트리를 <b>레벨 순회</b>(큐 사용 — 층별, 왼쪽부터)한 출력 순서는?',
    okfb:'루트부터 층별로, 각 층은 왼쪽부터 — '+ans+'.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* --- G23. 구조 재귀 — 서브트리 계산 (유닛 C) --- */
function genG23(){
  const qtype=pick(["subcount","subheight","subleaf"]);
  const root=t6Build(t6Shape());
  const all=t6All(root,[]);
  const X=pick(all.filter(n=>(n.l||n.r)&&n!==root));   /* 루트 아닌 내부 노드 */
  const cnt=n=>!n?0:1+cnt(n.l)+cnt(n.r);
  const hgt=n=>!n?0:1+Math.max(hgt(n.l),hgt(n.r));
  const lf=n=>!n?0:(!n.l&&!n.r?1:lf(n.l)+lf(n.r));
  const F={subcount:cnt, subheight:hgt, subleaf:lf}[qtype];
  const ans=F(X);
  const whole={subcount:cnt(root), subheight:hgt(root), subleaf:lf(root)}[qtype];
  const NAME={subcount:"node_count", subheight:"height", subleaf:"leaf_count"};
  const KO={subcount:"노드 수", subheight:"높이", subleaf:"리프 수"};
  const cands=[];
  if(whole!==ans) cands.push({text:String(whole),correct:false,mc:"whole-tree",fb:"트리 '전체'를 세지 않았나 — "+X.v+"를 루트로 한 서브트리만이다."});
  t5NumFill(cands,ans,[ans-1,ans+1,ans+2].filter(v=>v>0));
  return {id:"G23",qtype,params:{node:X.v,ans},viz:{type:"tree",data:t6Viz(root,X.v),slots:true},
    stem:'<span class="mono">'+NAME[qtype]+'(p)</span> 는 p를 루트로 한 서브트리의 '+KO[qtype]+'를 재귀로 구한다. 그림에서 <span class="mono">'+NAME[qtype]+'('+X.v+')</span> 의 반환값은?',
    okfb:X.v+' 아래 묶음만 본다 — '+KO[qtype]+' '+ans+'.',
    choices:g2Fill(cands,{text:String(ans),correct:true},4)};
}

/* --- G24. 수식 트리 (유닛 D) --- */
function t6Expr(){
  const op=()=>pick(["+","-","*"]);
  const num=()=>g2R(1,9);
  const T=pick([1,2,3,4]);
  const L=v=>({v:String(v),leaf:1});
  const N=(o,a,b)=>({v:o,l:a,r:b});
  if(T===1) return N(op(),L(num()),L(num()));
  if(T===2) return N(op(),N(op(),L(num()),L(num())),L(num()));
  if(T===3) return N(op(),L(num()),N(op(),L(num()),L(num())));
  return N(op(),N(op(),L(num()),L(num())),N(op(),L(num()),L(num())));
}
function exEval(n){ if(n.leaf) return +n.v; const a=exEval(n.l),b=exEval(n.r); return n.v==="+"?a+b:n.v==="-"?a-b:a*b; }
function exPost(n){ return n.leaf?n.v:exPost(n.l)+" "+exPost(n.r)+" "+n.v; }
function exPre(n){ return n.leaf?n.v:n.v+" "+exPre(n.l)+" "+exPre(n.r); }
function exIn(n){ return n.leaf?n.v:"("+exIn(n.l)+" "+n.v+" "+exIn(n.r)+")"; }
function exViz(n){ const o={v:n.v==="*"?"×":n.v}; if(!n.leaf) o.c=[exViz(n.l),exViz(n.r)]; return o; }
function genG24(){
  const qtype=pick(["val","post","rootop"]);
  const t=t6Expr();
  const val=exEval(t);
  if(Math.abs(val)>99) return genG24();
  const viz={type:"tree",data:exViz(t)};
  if(qtype==="val"){
    const ans=String(val);
    const cands=[];
    for(const d of shuffle([val-1,val+1,val-2,val+2,val+3,val-3])){
      if(cands.length>=3) break;
      if(String(d)!==ans) cands.push({text:String(d),correct:false,mc:"calc-off",fb:"리프부터 계산해 위로 올라가 보라 — 자식 결과가 먼저다."});
    }
    return {id:"G24",qtype,params:{ans},viz,
      stem:'그림의 <b>수식 트리</b>를 평가(eval)한 결과는? (리프 = 숫자, 내부 노드 = 연산자)',
      okfb:'자식(서브트리) 값부터 구하고 자기 연산을 마지막에 — 결과는 '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(qtype==="rootop"){
    const ans=(t.v==="*"?"×":t.v)+" — 루트의 연산이 맨 마지막에 계산된다";
    const kids=[t.l,t.r].filter(n=>!n.leaf);
    const cands=[];
    kids.forEach(k=>cands.push({text:(k.v==="*"?"×":k.v)+" — 아래(서브트리) 연산이 맨 마지막에 계산된다",correct:false,mc:"order-flip",fb:"서브트리는 재료 — 재료가 먼저, 루트가 마지막이다."}));
    cands.push({text:"왼쪽 리프의 숫자 — 처음 읽는 값이 마지막까지 계산된다",correct:false,mc:"leaf-pick",fb:"리프는 계산할 것 없이 값 그 자체 — 마지막 연산은 루트다."});
    if(!kids.length) cands.push({text:(t.v==="*"?"+":"×")+" — 트리에 없는 연산이 끼어든다",correct:false,mc:"phantom-op",fb:"트리에 있는 연산자만 계산된다."});
    return {id:"G24",qtype,params:{ans},viz,
      stem:'그림의 수식 트리에서 <b>맨 마지막에 계산되는 것</b>은? (후위 순회로 평가한다)',
      okfb:'후위 순회는 자식을 다 마친 뒤 자신 — 마지막 계산은 언제나 루트의 연산 '+(t.v==="*"?"×":t.v)+'다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  const ans=exPost(t);
  const cands=[
    {text:exPre(t),correct:false,mc:"prefix-mix",fb:"연산자가 앞에 오는 것은 '전위' 표기 — 후위는 연산자가 뒤다."},
    {text:exIn(t).replace(/[()]/g,""),correct:false,mc:"infix-mix",fb:"그냥 왼쪽부터 읽은 중위 나열 — 후위 순회는 자식 먼저, 자신은 나중이다."},
    {text:exPost(t).split(" ").reverse().join(" "),correct:false,mc:"reverse-mix",fb:"통째로 뒤집은 것 — 후위는 '왼쪽, 오른쪽, 자신' 순서다."}
  ].filter(c=>c.text!==ans);
  return {id:"G24",qtype,params:{ans},viz, mono:true,
    stem:'그림의 수식 트리를 <b>후위 순회</b>로 출력하면? — 2장(B) 계산기에 넣던 바로 그 표기가 나온다.',
    okfb:'왼쪽 서브트리, 오른쪽 서브트리, 자신 — '+ans+'.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* --- AP6. 4장(B) 심화 (도발장 2) --- */
function genAP6ch(idx){
  if(idx===0){
    /* 전위+중위 → 오른쪽 서브트리의 루트 역산 */
    let root=t6Build(t6Shape());
    while(!root.r||!root.l) root=t6Build(t6Shape());
    const pre=t6Pre(root,[]), ino=t6In(root,[]);
    const ans=root.r.v;
    const cands=[
      {text:root.l.v,correct:false,mc:"lr-swap",fb:"그 노드는 왼쪽 서브트리의 루트 — 전위에서 루트 '바로 다음'이다."},
      {text:pre[pre.length-1],correct:false,mc:"last-pick",fb:"전위의 마지막은 가장 깊은 오른쪽 리프 쪽 — 서브트리의 루트가 아니다."},
      {text:ino[ino.length-1],correct:false,mc:"inorder-mix",fb:"중위의 마지막(가장 오른쪽)이 곧 서브트리 루트인 것은 아니다."},
      {text:root.v,correct:false,mc:"root-pick",fb:"그 노드가 루트 자신이다 — 묻는 것은 루트의 '오른쪽 자식'."}
    ].filter(c=>c.text!==ans);
    for(const v of pre){ if(cands.length>=3) break; if(v!==ans&&!cands.some(c=>c.text===v)) cands.push({text:v,correct:false,mc:"pick-any",fb:"중위에서 루트 왼쪽 묶음의 크기만큼 전위를 건너뛰어 보라."}); }
    return {id:"AP6",qtype:"rebuild",params:{ans},mono:true,
      stem:'[심화 — 순회 역산] 어떤 이진 트리의 <b>전위</b> 순회가 <span class="mono">'+t6Seq(pre)+'</span>, <b>중위</b> 순회가 <span class="mono">'+t6Seq(ino)+'</span> 이다. (그림 없음) 이 트리에서 <b>루트의 오른쪽 자식</b>은?',
      okfb:'전위의 첫 노드 '+root.v+'가 루트. 중위에서 '+root.v+' 왼쪽이 왼쪽 서브트리('+t6In(root.l,[]).join(", ")+') — 전위에서 그만큼 건너뛴 다음 노드 '+ans+'가 오른쪽 서브트리의 루트다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(idx===1){
    /* iter_inorder 스택 최대 크기 — 시뮬 필요 */
    const root=t6Build(t6Shape());
    let node=root, max=0; const st=[];
    for(;;){
      for(; node; node=node.l){ st.push(node); if(st.length>max) max=st.length; }
      node=st.pop();
      if(!node) break;
      node=node.r;
    }
    const ans=max;
    const hgt=n=>!n?0:1+Math.max(hgt(n.l),hgt(n.r));
    const cands=[];
    if(hgt(root)!==ans) cands.push({text:String(hgt(root)),correct:false,mc:"height-guess",fb:"높이와 같아 보이지만 — 스택엔 '왼쪽으로 내려온 조상들'만 쌓인다. 직접 밟아 보라."});
    t5NumFill(cands,ans,[ans-1,ans+1,ans+2].filter(v=>v>0));
    return {id:"AP6",qtype:"stackmax",params:{ans},viz:{type:"tree",data:t6Viz(root),slots:true},
      stem:'[심화 — 반복 중위] 그림의 트리에 iter_inorder(스택 사용)를 돌릴 때, 스택에 <b>동시에 쌓이는 노드 수의 최댓값</b>은? (push 루프는 왼쪽으로만 내려가며 쌓는다)',
      okfb:'왼쪽 내리막마다 쌓고, pop 후 오른쪽으로 넘어가 다시 쌓는다 — 시뮬레이션하면 최대 '+ans+'개.',
      choices:g2Fill(cands,{text:String(ans),correct:true},4)};
  }
  /* idx 2 — 전위(prefix) 표기 */
  let t=t6Expr();
  while(t.l.leaf&&t.r.leaf) t=t6Expr();   /* 2연산 이상 */
  const ans=exPre(t);
  const cands=[
    {text:exPost(t),correct:false,mc:"postfix-mix",fb:"그것은 후위(3장 계산기용) — 전위는 연산자가 '먼저' 온다."},
    {text:exIn(t).replace(/[()]/g,""),correct:false,mc:"infix-mix",fb:"중위 나열이다 — 전위 순회는 자신, 왼쪽, 오른쪽."},
    {text:exPre(t).split(" ").reverse().join(" "),correct:false,mc:"reverse-mix",fb:"뒤집힌 순서 — 전위는 루트부터 시작한다."}
  ].filter(c=>c.text!==ans);
  return {id:"AP6",qtype:"prefix",params:{ans},viz:{type:"tree",data:exViz(t)},mono:true,
    stem:'[심화 — 표기법 완성] 그림의 수식 트리를 <b>전위 순회</b>로 출력한 표기(전위 표기)는?',
    okfb:'자신, 왼쪽, 오른쪽 — '+ans+'. (전위·중위·후위 순회가 곧 세 가지 수식 표기법이다.)',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* ================= 4장(C) 히프·BST — G25~G28 + AP7 ================= */
/* ---- 히프 유틸 (1번 인덱스 배열) ---- */
function h7Vals(n){ return shuffle([12,25,31,44,57,63,78,86,91,17,38,72].slice()).slice(0,n); }
function h7Insert(heap,v){ /* heap: [null,...] 1-기준, 제자리 수정 */
  heap.push(v); let i=heap.length-1;
  while(i>1 && heap[Math.floor(i/2)]<heap[i]){ const t=heap[i]; heap[i]=heap[Math.floor(i/2)]; heap[Math.floor(i/2)]=t; i=Math.floor(i/2); }
  return heap;
}
function h7Build(n){ const h=[null]; for(const v of h7Vals(n)) h7Insert(h,v); return h; }
function h7Delete(heap){ /* 최댓값 삭제 — 새 배열 반환 */
  const h=heap.slice(); const last=h.pop();
  if(h.length<=1) return h;
  let parent=1, child=2; const n=h.length-1;
  while(child<=n){
    if(child<n && h[child]<h[child+1]) child++;
    if(last>=h[child]) break;
    h[parent]=h[child]; parent=child; child*=2;
  }
  h[parent]=last;
  return h;
}
function h7Viz(h,hlIdx,tags){ /* 배열(1-기준) → 트리 viz */
  const n=h.length-1;
  function bt(i){ const o={v:String(h[i])}; if(tags) o.tag=i; if(hlIdx===i) o.hl=1;
    if(2*i<=n||2*i+1<=n) o.c=[2*i<=n?bt(2*i):null, 2*i+1<=n?bt(2*i+1):null];
    return o; }
  return {type:"tree", data:bt(1), slots:true};
}
const h7Arr=h=>h.slice(1).join(", ");
function h7Fill(cands,ansArr){ /* 부족한 오답을 '두 자리 교환' 변형으로 보충 */
  let guard=0;
  while(cands.length<3 && guard++<30){
    const a2=ansArr.slice(); const i=g2R(1,a2.length-1); let j=g2R(1,a2.length-1);
    if(i===j) continue;
    const t=a2[i]; a2[i]=a2[j]; a2[j]=t;
    const txt=h7Arr(a2);
    if(txt!==h7Arr(ansArr) && !cands.some(c=>c.text===txt))
      cands.push({text:txt,correct:false,mc:"trace-off",fb:"삽입·삭제 절차를 처음부터 한 단계씩 다시 밟아 보라."});
  }
  return cands;
}

/* --- G25. 우선순위 큐와 히프 (유닛 A) --- */
function genG25(){
  const qtype=pick(["judge","second","parentval","minmax"]);
  if(qtype==="judge"){
    const h=h7Build(g2R(6,7));
    const ok=Math.random()<0.5;
    let bi=-1;
    if(!ok){ /* 부모<자식이 되도록 한 쌍을 골라 교환 — 위반 생성 */
      const n=h.length-1;
      const cands=[]; for(let i=2;i<=n;i++) if(h[Math.floor(i/2)]>h[i]) cands.push(i);
      bi=pick(cands); const p=Math.floor(bi/2);
      const t=h[p]; h[p]=h[bi]; h[bi]=t;
    }
    /* 교환 후 실제 위반 지점 재계산(연쇄 가능) — 가장 위의 위반 하나를 지목 */
    let vio=0; const n=h.length-1;
    for(let i=2;i<=n;i++) if(h[Math.floor(i/2)]<h[i]){ vio=i; break; }
    const isHeap=vio===0;
    const cands=[
      {text:"max 히프다 — 모든 부모가 자식보다 크거나 같다",correct:isHeap},
      {text:isHeap?"아니다 — 부모보다 큰 자식이 존재한다":("아니다 — "+h[Math.floor(vio/2)]+"의 자식 "+h[vio]+"가 부모보다 크다"),correct:!isHeap},
      {text:"아니다 — 완전 이진 트리 모양이 아니다",correct:false,mc:"shape-myth",fb:"모양은 완전 이진 트리가 맞다 — 검사할 것은 부모·자식의 값 조건이다."},
      {text:"max 히프다 — 루트가 최댓값이기만 하면 된다",correct:false,mc:"root-only-myth",fb:"루트만이 아니라 '모든' 부모-자식 쌍이 조건을 지켜야 한다."}
    ];
    cands.forEach(c=>{ if(!c.correct&&!c.mc){ c.mc="pair-check"; c.fb="모든 부모-자식 쌍을 위에서부터 하나씩 비교해 보라."; } });
    return {id:"G25",qtype,params:{ans:cands.find(c=>c.correct).text},viz:h7Viz(h),
      stem:'그림의 완전 이진 트리는 <b>max 히프</b>인가?',
      okfb:isHeap?'모든 부모-자식 쌍에서 부모 ≥ 자식 — max 히프다.':('부모 '+h[Math.floor(vio/2)]+' < 자식 '+h[vio]+' — 조건 위반, 히프가 아니다.'),
      choices:shuffle(cands)};
  }
  if(qtype==="second"){
    const h=h7Build(7);
    const kids=[h[2],h[3]].filter(v=>v!==undefined);
    const ans=String(Math.max.apply(null,kids));
    const rest=h.slice(1).filter(v=>String(v)!==ans && v!==h[1]);
    const cands=[
      {text:String(h[1]),correct:false,mc:"max-confuse",fb:"그것은 최댓값(루트) — '두 번째'를 묻고 있다."},
      {text:String(Math.min.apply(null,kids)),correct:false,mc:"other-child",fb:"루트의 두 자식 중 '큰 쪽'이 둘째다 — 히프는 형제 사이의 순서는 정하지 않지만, 둘째는 반드시 루트의 자식이다."},
      {text:String(Math.max.apply(null,rest.filter(v=>!kids.includes(v)).concat([-1]))),correct:false,mc:"deep-pick",fb:"루트의 자식이 아닌 노드는 그 위로 더 큰 조상이 둘 이상 있다 — 둘째가 될 수 없다."}
    ].filter(c=>c.text!==ans&&c.text!=="-1");
    return {id:"G25",qtype,params:{ans},viz:h7Viz(h),
      stem:'그림의 max 히프에서 <b>두 번째로 큰 값</b>은?',
      okfb:'둘째는 반드시 루트의 자식 중 큰 쪽 — '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(qtype==="parentval"){
    const h=h7Build(7);
    const i=g2R(4,7);
    const ans=String(h[Math.floor(i/2)]);
    const cands=[
      {text:String(h[i]),correct:false,mc:"self-pick",fb:"그것은 "+i+"번 노드 자신의 값이다."},
      {text:String(h[i-1]),correct:false,mc:"minus-myth",fb:"배열의 옆 칸은 부모가 아니다 — 부모는 i/2번 칸이다."},
      {text:String(h[1]),correct:false,mc:"root-pick",fb:"루트(1번)가 아니라 i/2 = "+Math.floor(i/2)+"번이 부모다."}
    ].filter(c=>c.text!==ans);
    return {id:"G25",qtype,params:{i,ans},viz:h7Viz(h,i,true),
      stem:'그림의 max 히프(노드 옆 숫자 = 배열 인덱스)에서 <b>'+i+'번 노드의 부모</b>에 저장된 값은?',
      okfb:'부모 인덱스 = '+i+'/2 = '+Math.floor(i/2)+' — 값은 '+ans+'. (4장(A)의 공식이 히프의 기본 동작이 된다.)',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  /* minmax — min 히프 or max 히프 제시 후 판별 */
  const isMax=Math.random()<0.5;
  let h=h7Build(g2R(6,7));
  if(!isMax){ const vals=h.slice(1).sort((a,b)=>a-b); const h2=[null]; /* min heap: 부호 뒤집어 삽입 */
    for(const v of h.slice(1)){ h2.push(v); let i=h2.length-1; while(i>1&&h2[Math.floor(i/2)]>h2[i]){const t=h2[i];h2[i]=h2[Math.floor(i/2)];h2[Math.floor(i/2)]=t;i=Math.floor(i/2);} }
    h=h2; }
  const ansKey=isMax?"max":"min";
  const TXT={max:"max 히프 — 모든 부모가 자식보다 크거나 같다", min:"min 히프 — 모든 부모가 자식보다 작거나 같다",
             both:"max 히프이면서 min 히프이기도 하다", none:"어느 쪽 히프도 아니다"};
  return {id:"G25",qtype,params:{ans:TXT[ansKey]},viz:h7Viz(h),
    stem:'그림의 완전 이진 트리는 어느 쪽인가?',
    okfb:isMax?'위로 갈수록 크다 — 루트가 최댓값인 max 히프다.':'위로 갈수록 작다 — 루트가 최솟값인 min 히프다.',
    choices:shuffle(Object.keys(TXT).map(k=>({text:TXT[k],correct:k===ansKey,mc:k===ansKey?undefined:"dir-check",fb:k===ansKey?undefined:"부모와 자식의 대소 방향을 위에서부터 확인해 보라."})))};
}

/* --- G26. 히프 삽입·삭제 트레이스 (유닛 B) --- */
function genG26(){
  const qtype=pick(["ins","inspos","del"]);
  const h=h7Build(g2R(5,6));
  if(qtype==="del"){
    const res=h7Delete(h);
    const ans=h7Arr(res);
    const naive=h.slice(1); naive.shift();                 /* 배열 당기기 신화 */
    const lastup=h.slice(); lastup[1]=lastup.pop();        /* 내려보내기 생략 */
    const cands=[
      {text:naive.join(", "),correct:false,mc:"shift-myth",fb:"배열을 한 칸 당기면 완전 트리 모양은 유지돼도 히프 조건이 무너진다 — 마지막 원소를 루트로 올려 내려보내는 것이 규칙이다."},
      {text:h7Arr(lastup),correct:false,mc:"no-sift",fb:"마지막 원소를 루트에 올린 뒤, 큰 자식과 비교하며 '내려보내는' 단계까지 해야 히프가 복구된다."},
      {text:h7Arr(h.slice(0,-1)),correct:false,mc:"drop-last",fb:"삭제되는 것은 마지막 원소가 아니라 '루트(최댓값)'다."}
    ].filter(c=>c.text!==ans);
    h7Fill(cands,res);
    return {id:"G26",qtype,params:{ans},viz:h7Viz(h,1,true), mono:true,
      stem:'그림의 max 히프(배열: <span class="mono">'+h7Arr(h)+'</span>)에서 <span class="mono">delete_max_heap</span> 을 한 번 실행한 뒤의 배열은?',
      okfb:'루트를 꺼내고 마지막 원소를 루트에 올린 뒤 큰 자식과 비교하며 내려보낸다 — '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  const nv=pick([15,29,48,69,83,95].filter(v=>!h.includes(v)));
  const res=h.slice(); h7Insert(res,nv);
  if(qtype==="inspos"){
    const ans=String(res.indexOf(nv));
    const cands=[
      {text:String(h.length),correct:false,mc:"no-sift",fb:"끝에 붙인 뒤 부모와 비교하며 '올라가는' 단계까지가 삽입이다."},
      {text:"1",correct:false,mc:"root-rush",fb:"루트까지 올라가는 것은 새 값이 기존 최댓값보다 클 때뿐이다 — 부모보다 작아지는 순간 멈춘다."},
      {text:String(Math.floor(h.length/2)),correct:false,mc:"parent-guess",fb:"올라가는 경로를 실제 값 비교로 밟아 보라."}
    ].filter(c=>c.text!==ans);
    return {id:"G26",qtype,params:{ans},viz:h7Viz(h,0,true), mono:true,
      stem:'그림의 max 히프(배열: <span class="mono">'+h7Arr(h)+'</span>)에 <span class="mono">insert_max_heap('+nv+')</span> 을 실행하면, '+nv+'는 최종적으로 <b>몇 번 인덱스</b>에 놓이는가?',
      okfb:'끝('+h.length+'번)에 붙인 뒤 부모('+'i/2'+')와 비교하며 올라간다 — 최종 위치 '+ans+'번.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  const ans=h7Arr(res);
  const tail=h.slice(); tail.push(nv);                     /* 올리기 생략 */
  const rootSwap=h.slice(); rootSwap.push(rootSwap[1]); rootSwap[1]=nv;  /* 무조건 루트에 넣는 신화 */
  const cands=[
    {text:h7Arr(tail),correct:false,mc:"no-sift",fb:"끝에 붙인 것으로 끝나지 않는다 — 부모보다 큰 동안 자리를 바꾸며 올라간다."},
    {text:h7Arr(rootSwap),correct:false,mc:"root-rush",fb:"새 값이 곧장 루트로 가지 않는다 — 마지막 자리에서 출발해 부모와 비교하며 올라갈 뿐이다."}
  ].filter(c=>c.text!==ans);
  h7Fill(cands,res);
  return {id:"G26",qtype,params:{ans},viz:h7Viz(h,0,true), mono:true,
    stem:'그림의 max 히프(배열: <span class="mono">'+h7Arr(h)+'</span>)에 <span class="mono">insert_max_heap('+nv+')</span> 을 실행한 뒤의 배열은?',
    okfb:'마지막 자리에 붙이고, 부모보다 큰 동안 자리를 바꾸며 올라간다 — '+ans+'.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* ---- BST 유틸 ---- */
function b7Insert(root,v){ if(!root) return {v,l:null,r:null}; if(v<root.v) root.l=b7Insert(root.l,v); else root.r=b7Insert(root.r,v); return root; }
function b7Build(n){ let root=null; const vs=h7Vals(n); for(const v of vs) root=b7Insert(root,v); return {root,order:vs}; }
function b7All(n,out){ if(!n) return out; out.push(n); b7All(n.l,out); b7All(n.r,out); return out; }
function b7Path(root,k){ const p=[]; let c=root; while(c){ p.push(c.v); if(k===c.v) return p; c=k<c.v?c.l:c.r; } return p; }
function b7In(n,out){ if(!n) return out; b7In(n.l,out); out.push(n.v); b7In(n.r,out); return out; }
function b7Pre(n,out){ if(!n) return out; out.push(n.v); b7Pre(n.l,out); b7Pre(n.r,out); return out; }
function b7Viz(n,hlv){ if(!n) return null; const o={v:String(n.v)}; if(hlv===n.v) o.hl=1;
  if(n.l||n.r) o.c=[b7Viz(n.l,hlv),b7Viz(n.r,hlv)]; return o; }
const b7Seq=a=>a.join(" → ");

/* --- G27. BST 탐색·삽입 (유닛 C) --- */
function genG27(){
  const qtype=pick(["path","cmp","inspos","inorder"]);
  const {root,order}=b7Build(7);
  const viz={type:"tree",data:b7Viz(root),slots:true};
  if(qtype==="inorder"){
    const ino=b7In(root,[]);
    const ans=ino.join(", ");
    const cands=[
      {text:b7Pre(root,[]).join(", "),correct:false,mc:"pre-mix",fb:"그것은 전위 순회 — 정렬 순서가 나오는 것은 '중위'다."},
      {text:order.join(", "),correct:false,mc:"insert-order",fb:"삽입한 순서는 트리 모양을 정할 뿐 — 중위 순회는 언제나 오름차순이다."},
      {text:ino.slice().reverse().join(", "),correct:false,mc:"reverse-mix",fb:"내림차순이 아니라 오름차순 — 왼쪽(작은 쪽)부터 방문한다."}
    ].filter(c=>c.text!==ans);
    /* 편향 트리(정렬 순서 삽입)에서는 전위·삽입 순서가 중위와 겹쳐 후보가 모자랄 수 있다 — 형태 무관 보충 후보 */
    const swp=ino.slice(); if(swp.length>=2){ const t=swp[1]; swp[1]=swp[2]; swp[2]=t; }
    const swp2=ino.slice(); if(swp2.length>=2){ const t=swp2[swp2.length-1]; swp2[swp2.length-1]=swp2[swp2.length-2]; swp2[swp2.length-2]=t; }
    for(const s2 of [swp.join(", "), swp2.join(", ")])
      if(cands.length<3 && s2!==ans && !cands.find(c=>c.text===s2))
        cands.push({text:s2,correct:false,mc:"near-sort",fb:"중위 순회는 빠짐없는 오름차순 — 이웃한 두 값이 뒤바뀌어 있다."});
    return {id:"G27",qtype,params:{ans},viz,
      stem:'그림의 이진 탐색 트리를 <b>중위 순회</b>한 출력은?',
      okfb:'BST의 중위 순회는 언제나 오름차순 — '+ans+'. (왼쪽<자신<오른쪽 규칙의 결과다.)',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  const all=b7All(root,[]);
  if(qtype==="inspos"){
    const nv=pick([15,29,48,69,83,95].filter(v=>!order.includes(v)));
    const p=b7Path(root,nv);              /* 실패 경로 — 마지막이 삽입 부모 */
    const parent=p[p.length-1];
    const side=nv<parent?"왼쪽":"오른쪽";
    const ans=parent+"의 "+side+" 자식 자리";
    const cands=[
      {text:parent+"의 "+(side==="왼쪽"?"오른쪽":"왼쪽")+" 자식 자리",correct:false,mc:"side-flip",fb:nv+"과 "+parent+"의 대소를 다시 비교하라 — 작으면 왼쪽, 크면 오른쪽이다."},
      {text:"루트 자리 — 기존 루트를 밀어내고 들어간다",correct:false,mc:"root-swap-myth",fb:"BST 삽입은 기존 노드를 옮기지 않는다 — 탐색이 실패한 빈자리에 붙인다."},
      {text:p[p.length-2]!==undefined?(p[p.length-2]+"의 "+side+" 자식 자리"):"트리의 가장 왼쪽 끝",correct:false,mc:"early-stop",fb:"탐색이 NULL을 만날 때까지 끝까지 내려가야 한다."}
    ].filter(c=>c.text!==ans);
    return {id:"G27",qtype,params:{ans},viz, mono:true,
      stem:'그림의 이진 탐색 트리에 <span class="mono">insert('+nv+')</span> 를 실행하면 새 노드가 붙는 자리는?',
      okfb:'탐색이 실패한 그 자리가 새 노드의 자리 — 경로 '+b7Seq(p)+' 끝에서 '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  const target=pick(all.filter(n=>n.v!==root.v)).v;
  const p=b7Path(root,target);
  if(qtype==="cmp"){
    const ans=String(p.length);
    const cands=[
      {text:String(p.length-1),correct:false,mc:"off-by-one",fb:"루트와의 비교도 한 번으로 센다 — 경로의 노드 수만큼 비교한다."},
      {text:String(all.length),correct:false,mc:"all-visit",fb:"모든 노드를 보지 않는다 — 비교마다 반쪽을 통째로 버리는 것이 BST의 힘이다."},
      {text:String(p.length+1),correct:false,mc:"off-by-one",fb:"찾은 순간 멈춘다 — 경로 위 노드 수만큼이다."}
    ].filter(c=>c.text!==ans);
    return {id:"G27",qtype,params:{ans},viz, mono:true,
      stem:'그림의 이진 탐색 트리에서 <span class="mono">search('+target+')</span> 가 수행하는 <b>비교 횟수</b>는? (방문한 노드마다 1회)',
      okfb:'경로 '+b7Seq(p)+' — 노드 '+ans+'개를 지나며 '+ans+'회 비교한다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  const ans=b7Seq(p);
  const wrongTarget=pick(all.filter(n=>n.v!==target&&n.v!==root.v)).v;
  const cands=[
    {text:b7Seq(p.slice().reverse()),correct:false,mc:"reverse-mix",fb:"탐색은 루트에서 출발한다."},
    {text:b7Seq(b7Path(root,wrongTarget)),correct:false,mc:"wrong-branch",fb:"각 노드에서 '작으면 왼쪽, 크면 오른쪽' — 대소 비교를 한 번씩 다시 하라."},
    {text:b7Seq(p.slice(0,-1)),correct:false,mc:"early-stop",fb:"목표 값에 도달할 때까지가 경로다 — 마지막 비교가 빠졌다."}
  ].filter(c=>c.text!==ans);
  return {id:"G27",qtype,params:{ans},viz, mono:true,
    stem:'그림의 이진 탐색 트리에서 <span class="mono">search('+target+')</span> 가 <b>지나는 노드</b>를 차례로 나열하면?',
    okfb:'루트부터 — 작으면 왼쪽, 크면 오른쪽 — '+ans+'.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* --- G28. BST 삭제·성능 (유닛 D) --- */
function genG28(){
  const qtype=pick(["case","repl","worst","best"]);
  if(qtype==="worst"){
    const n=pick([7,10,15]);
    const cands=[
      {text:String(Math.ceil(Math.log2(n+1))),correct:false,mc:"balanced-confuse",fb:"그것은 완전 트리 모양일 때의 이야기 — 정렬된 순서로 넣으면 한 줄로 늘어선다."},
      {text:String(n-1),correct:false,mc:"off-by-one",fb:"마지막 노드까지 내려가 비교한다 — n회다."},
      {text:String(Math.floor(n/2)),correct:false,mc:"half-myth",fb:"반씩 버리는 것은 균형이 잡혀 있을 때만이다."}
    ];
    return {id:"G28",qtype,params:{ans:String(n)},
      stem:'키 <b>'+n+'개</b>를 <b>작은 것부터 정렬된 순서로</b> 삽입해 만든 이진 탐색 트리에서, search의 <b>최대 비교 횟수</b>는?',
      okfb:'정렬된 순서로 넣으면 오른쪽으로만 자라는 경사 트리(높이 '+n+') — 연결 리스트와 같아져 최대 '+n+'회 비교한다.',
      choices:g2Fill(cands,{text:String(n),correct:true},4)};
  }
  if(qtype==="best"){
    const CASE=pick([[7,3],[15,4],[31,5]]);
    const n=CASE[0], ans=String(CASE[1]);
    const cands=[
      {text:String(n),correct:false,mc:"skew-confuse",fb:"n회는 경사 트리(최악)의 이야기 — 완전 트리는 높이만큼만 비교한다."},
      {text:String(CASE[1]+1),correct:false,mc:"off-by-one",fb:"높이 h = ⌈log₂(n+1)⌉ — 2^"+CASE[1]+"−1 = "+n+"이므로 딱 "+ans+"층이다."},
      {text:String(CASE[1]-1),correct:false,mc:"off-by-one",fb:"마지막 층의 리프까지 내려가면 "+ans+"회다."}
    ];
    return {id:"G28",qtype,params:{ans},
      stem:'키 <b>'+n+'개</b>가 <b>포화 이진 트리</b> 모양으로 저장된 이진 탐색 트리에서, search의 <b>최대 비교 횟수</b>는?',
      okfb:'비교 횟수 = 내려간 층 수 — 높이 '+ans+'인 포화 트리이므로 최대 '+ans+'회. (같은 '+n+'개도 모양에 따라 '+n+'회가 될 수 있다 — 균형의 가치.)',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  const {root}=b7Build(7);
  const all=b7All(root,[]);
  if(qtype==="case"){
    const X=pick(all);
    const kids=(X.l?1:0)+(X.r?1:0);
    const ansKey=kids===0?"leaf":(kids===1?"one":"two");
    const TXT={leaf:"리프 — 부모의 링크를 NULL로 만들면 끝난다",
               one:"자식 하나 — 그 자식을 자기 자리로 끌어올린다",
               two:"자식 둘 — 왼쪽 최댓값이나 오른쪽 최솟값으로 대체한다"};
    return {id:"G28",qtype,params:{ans:TXT[ansKey]},viz:{type:"tree",data:b7Viz(root,X.v),slots:true},
      stem:'그림의 이진 탐색 트리에서 <b>'+X.v+'를 삭제</b>하려 한다. 어느 경우이고, 어떻게 처리하는가?',
      okfb:X.v+'의 자식은 '+kids+'개 — '+TXT[ansKey],
      choices:shuffle(Object.keys(TXT).map(k=>({text:TXT[k],correct:k===ansKey,mc:k===ansKey?undefined:"case-check",fb:k===ansKey?undefined:X.v+"의 자식 수를 그림에서 다시 세어 보라."}))
        .concat([{text:"삭제 불가 — BST는 삽입과 탐색만 지원한다",correct:false,mc:"no-delete-myth",fb:"세 경우 모두 삭제 절차가 정의되어 있다."}]))};
  }
  /* repl — 자식 둘인 노드의 대체 후보 (서브트리가 잎 하나뿐이면 오답이 정답과 겹치므로 제외) */
  const twos=all.filter(n=>n.l&&n.r&&((n.l.l||n.l.r)||(n.r.l||n.r.r)));
  if(!twos.length) return genG28();
  const X=pick(twos);
  const lmax=(function m(n){ while(n.r) n=n.r; return n.v; })(X.l);
  const rmin=(function m(n){ while(n.l) n=n.l; return n.v; })(X.r);
  const ans=lmax+" 또는 "+rmin;
  const lmin=(function m(n){ while(n.l) n=n.l; return n.v; })(X.l);
  const rmax=(function m(n){ while(n.r) n=n.r; return n.v; })(X.r);
  const wrongPool=[
    {text:lmin+" 또는 "+rmax,mc:"minmax-flip",fb:"왼쪽에서는 '최댓값', 오른쪽에서는 '최솟값' — 중위 순서에서 "+X.v+"의 바로 양옆 이웃이어야 자리가 유지된다."},
    {text:(X.l.v)+" 또는 "+(X.r.v),mc:"child-pick",fb:"바로 아래 자식이 아니라, 왼쪽 서브트리 전체의 최댓값 / 오른쪽 서브트리 전체의 최솟값이다."},
    {text:String(root.v)+" 하나뿐",mc:"root-pick",fb:"루트는 무관하다 — 삭제 자리의 중위 이웃만 자리를 이어받을 수 있다."},
    {text:lmax+" 또는 "+rmax,mc:"pair-mix",fb:"오른쪽에서는 '최솟값'이다 — 큰 값을 올리면 오른쪽 서브트리보다 커져 BST 조건이 깨진다."},
    {text:lmin+" 또는 "+rmin,mc:"pair-mix",fb:"왼쪽에서는 '최댓값'이다 — 작은 값을 올리면 왼쪽 서브트리보다 작아져 조건이 깨진다."}
  ];
  const cands=[]; const seenT=new Set([ans]);
  for(const w of wrongPool){ if(cands.length>=3) break; if(seenT.has(w.text)) continue; seenT.add(w.text); cands.push({...w,correct:false}); }
  let guard=0;
  while(cands.length<3 && guard++<30){ /* 그래도 부족하면 임의 두 값 짝으로 보충 */
    const vs=shuffle(all.map(n=>n.v)).slice(0,2);
    const txt=vs[0]+" 또는 "+vs[1];
    if(!seenT.has(txt)){ seenT.add(txt); cands.push({text:txt,correct:false,mc:"pick-any",fb:"중위 순서에서 "+X.v+"의 바로 양옆(왼쪽 최대·오른쪽 최소)만 자리를 이어받을 수 있다."}); }
  }
  return {id:"G28",qtype,params:{ans},viz:{type:"tree",data:b7Viz(root,X.v),slots:true},
    stem:'그림의 이진 탐색 트리에서 자식이 둘인 <b>'+X.v+'</b>를 삭제할 때, 그 자리를 <b>대체할 수 있는 값</b>은?',
    okfb:'왼쪽 서브트리의 최댓값 '+lmax+' 또는 오른쪽 서브트리의 최솟값 '+rmin+' — 중위 순서에서 '+X.v+'의 양옆 이웃이라 BST 조건이 유지된다.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* --- AP7. 4장(C) 심화 (도발장 3) --- */
function genAP7ch(idx){
  if(idx===0){ /* 연속 두 번 삽입 */
    const h=h7Build(5);
    const two=shuffle([15,29,48,69,83,95].filter(v=>!h.includes(v))).slice(0,2);
    const r1=h.slice(); h7Insert(r1,two[0]);
    const res=r1.slice(); h7Insert(res,two[1]);
    const ans=h7Arr(res);
    const noSift=h.concat(two);
    const onlyFirst=r1.concat([two[1]]);
    const swapped=(function(){ const r2=h.slice(); h7Insert(r2,two[1]); h7Insert(r2,two[0]); return r2; })();   /* 삽입 순서를 바꾼 결과 */
    const cands=[
      {text:h7Arr(noSift),correct:false,mc:"no-sift",fb:"두 번 모두 '올라가기'까지가 삽입이다."},
      {text:h7Arr(onlyFirst),correct:false,mc:"half-sift",fb:"두 번째 삽입의 올라가기가 빠졌다."},
      {text:h7Arr(swapped),correct:false,mc:"order-swap",fb:"삽입 순서대로 — "+two[0]+"이 먼저다."}
    ].filter(c=>c.text!==ans);
    (function(){ const seen=new Set(cands.map(c=>c.text)); for(let i=cands.length-1;i>=0;i--){ if(seen.has(cands[i].text)&&cands.findIndex(c=>c.text===cands[i].text)!==i) cands.splice(i,1); } })();
    h7Fill(cands,res);
    return {id:"AP7",qtype:"ins2",params:{ans},viz:h7Viz(h,0,true), mono:true,
      stem:'[심화 — 연속 삽입] 그림의 max 히프(배열: <span class="mono">'+h7Arr(h)+'</span>)에 <span class="mono">insert('+two[0]+')</span>, <span class="mono">insert('+two[1]+')</span> 을 차례로 실행한 뒤의 배열은?',
      okfb:'한 번에 하나씩 — 붙이고 올리기를 두 번 반복하면 '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(idx===1){ /* 자식 둘 삭제 실행 — 왼쪽 최댓값 규칙 → 전위 순회 */
    let built=b7Build(7);
    let twos=b7All(built.root,[]).filter(n=>n.l&&n.r);
    while(!twos.length){ built=b7Build(7); twos=b7All(built.root,[]).filter(n=>n.l&&n.r); }
    const X=pick(twos);
    const lmax=(function m(n){ while(n.r) n=n.r; return n.v; })(X.l);
    /* 삭제 시뮬: X.v를 lmax로 바꾸고, 왼쪽 서브트리에서 lmax 제거(그 노드는 오른쪽 자식이 없음) */
    function removeMax(n){ if(!n.r){ return n.l; } n.r=removeMax(n.r); return n; }
    const targetV=X.v;
    const preBefore=b7Pre(built.root,[]).join(", ");     /* 삭제 전 전위 — 오답용 */
    X.v=lmax; X.l=removeMax(X.l);
    const ans=b7Pre(built.root,[]).join(", ");
    const wrongIn=b7In(built.root,[]).join(", ");
    const cands=[
      {text:wrongIn,correct:false,mc:"traversal-mix",fb:"묻는 것은 전위 순회다 — 정렬 순서(중위)가 아니다."},
      {text:preBefore,correct:false,mc:"no-delete",fb:targetV+"가 아직 남아 있다 — 삭제와 대체가 반영되어야 한다."},
      {text:ans.split(", ").reverse().join(", "),correct:false,mc:"reverse-mix",fb:"전위는 루트부터다."}
    ].filter(c=>c.text!==ans);
    (function(){ const seen2=new Set(); for(let i2=0;i2<cands.length;i2++){ if(seen2.has(cands[i2].text)){ cands.splice(i2,1); i2--; } else seen2.add(cands[i2].text); } })();
    return {id:"AP7",qtype:"del2",params:{ans,target:targetV},
      stem:'[심화 — 두 자식 삭제] 어떤 이진 탐색 트리에서 자식이 둘인 노드 '+targetV+'를 <b>왼쪽 서브트리의 최댓값으로 대체</b>하는 규칙으로 삭제했다. 삭제 후 트리의 <b>전위 순회</b>가 다음 중 하나라면, 옳은 것은? (그림 없음 — 대체 규칙으로 추론하라)',
      okfb:'대체 값 '+lmax+'가 '+targetV+'의 자리에 오르고, 왼쪽 서브트리에서는 그 노드가 빠진다 — 전위: '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},3)};
  }
  /* idx 2 — AVL 균형 판정 */
  let built=b7Build(7), bad=null, tries=0;
  function hgt(n){ return n?1+Math.max(hgt(n.l),hgt(n.r)):0; }
  function findBad(n,out){ if(!n) return out; if(Math.abs(hgt(n.l)-hgt(n.r))>1) out.push(n.v); findBad(n.l,out); findBad(n.r,out); return out; }
  let bads=findBad(built.root,[]);
  while(bads.length!==1 && tries++<60){ built=b7Build(7); bads=findBad(built.root,[]); }
  if(bads.length!==1) return genAP7ch(2);
  const ans=String(bads[0]);
  const all=b7All(built.root,[]);
  const cands=[
    {text:String(built.root.v),correct:false,mc:"root-pick",fb:"루트부터가 아니라 노드마다 좌우 서브트리 높이차를 재라."},
    {text:"없다 — 모든 노드가 균형이다",correct:false,mc:"balanced-myth",fb:"높이차가 2 이상인 노드가 하나 있다 — 좌우 높이를 각각 세어 보라."},
    {text:String(pick(all.filter(n=>String(n.v)!==ans&&n.v!==built.root.v)).v),correct:false,mc:"pick-any",fb:"그 노드의 좌우 높이차는 1 이하다."}
  ].filter(c=>c.text!==ans);
  return {id:"AP7",qtype:"avl",params:{ans},viz:{type:"tree",data:b7Viz(built.root),slots:true}, 
    stem:'[심화 — 균형 판정] AVL 트리는 <b>모든 노드에서 좌우 서브트리의 높이차가 1 이하</b>여야 한다. 그림의 이진 탐색 트리에서 이 조건을 <b>어기는 노드</b>는?',
    okfb:ans+'의 좌우 서브트리 높이차가 2 이상이다 — 이런 노드가 생기는 순간 AVL 트리는 회전으로 균형을 복구한다(구현은 다음 기회에).',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* ================================================================
   5장(A) 그래프와 표현 — G29 정의·집합 / G30 용어 / G31 인접 행렬 / G32 인접 리스트 / AP8 심화
   params: edges="a-b,..."(무방향) 또는 dedges="a>b,..."(방향) + ans(표시 문자열) — 테스트 독립 재검산용
   ================================================================ */
const G8LAY={ 4:[[90,40],[26,124],[154,124],[90,206]],
  5:[[90,36],[18,112],[162,112],[44,200],[136,200]],
  6:[[54,36],[146,36],[18,124],[182,124],[54,208],[146,208]] };
function g8Nodes(n,hlId){ return G8LAY[n].map((p,i)=>({id:i, x:p[0], y:p[1], hl:i===hlId})); }
function g8Key(a,b){ return a<b?a+"-"+b:b+"-"+a; }
/* 무방향 연결 그래프: 신장 트리 + extra개 추가 */
function g8Build(n, extra){
  const E=[], seen=new Set();
  for(let v=1;v<n;v++){ const u=Math.floor(Math.random()*v); E.push([Math.min(u,v),Math.max(u,v)]); seen.add(g8Key(u,v)); }
  let guard=40;
  while(extra>0&&guard-->0){
    const a=Math.floor(Math.random()*n), b=Math.floor(Math.random()*n);
    if(a===b||seen.has(g8Key(a,b))) continue;
    E.push([Math.min(a,b),Math.max(a,b)]); seen.add(g8Key(a,b)); extra--;
  }
  E.sort((p,q)=>p[0]-q[0]||p[1]-q[1]);
  return E;
}
/* 비연결(요소 2개) 무방향 그래프 */
function g8BuildForest(n){
  const cut=2+Math.floor(Math.random()*(n-3));        /* 앞 cut개 / 나머지 두 묶음 */
  const E=[], seen=new Set();
  const addTree=(ids)=>{ for(let k=1;k<ids.length;k++){ const u=ids[Math.floor(Math.random()*k)], v=ids[k];
    E.push([Math.min(u,v),Math.max(u,v)]); seen.add(g8Key(u,v)); } };
  const A=[],B=[]; for(let i=0;i<n;i++)(i<cut?A:B).push(i);
  addTree(A); addTree(B);
  E.sort((p,q)=>p[0]-q[0]||p[1]-q[1]);
  return E;
}
function g8EdgeStr(E){ return E.map(e=>e[0]+"-"+e[1]).join(","); }
function g8Viz(n,E,hlId){ return {type:"graph", nodes:g8Nodes(n,hlId), edges:E.map(e=>({a:e[0],b:e[1]}))}; }
function g8Deg(n,E){ const d=Array(n).fill(0); E.forEach(e=>{d[e[0]]++;d[e[1]]++;}); return d; }
function g8SetStr(E){ return E.map(e=>"("+e[0]+","+e[1]+")").join(", "); }
/* 방향 그래프: m개 간선(셀프 루프·중복 없음, 역방향 쌍 허용) */
function g8BuildDir(n,m){
  const E=[], seen=new Set(); let guard=80;
  while(E.length<m&&guard-->0){
    const a=Math.floor(Math.random()*n), b=Math.floor(Math.random()*n);
    if(a===b||seen.has(a+">"+b)) continue;
    E.push([a,b]); seen.add(a+">"+b);
  }
  E.sort((p,q)=>p[0]-q[0]||p[1]-q[1]);
  return E;
}
function g8VizDir(n,E,hlId){
  const rev=new Set(E.map(e=>e[0]+">"+e[1]));
  return {type:"graph", nodes:g8Nodes(n,hlId),
    edges:E.map(e=>({a:e[0],b:e[1],dir:true,curve:rev.has(e[1]+">"+e[0])?(e[0]<e[1]?1:-1):0}))};
}
function g8InOut(n,E){ const din=Array(n).fill(0), dout=Array(n).fill(0);
  E.forEach(e=>{dout[e[0]]++;din[e[1]]++;}); return {din,dout}; }
function g8Mat(n,E,dir){ const m=Array.from({length:n},()=>Array(n).fill(0));
  E.forEach(e=>{ m[e[0]][e[1]]=1; if(!dir) m[e[1]][e[0]]=1; }); return m; }
function g8AdjList(n,E){ const L=Array.from({length:n},()=>[]);
  E.forEach(e=>{ L[e[0]].push(e[1]); L[e[1]].push(e[0]); });
  L.forEach(l=>l.sort((a,b)=>a-b)); return L; }
function g8ListStr(l){ return l.length? l.join(" → ")+" → NULL" : "NULL"; }

/* --- G29. 그래프 정의·집합 표현 (유닛 A) --- */
function genG29(){
  const qtype=pick(["ecount","eset","istree"]);
  if(qtype==="ecount"){
    const n=pick([4,5,5,6]), E=g8Build(n, pick([1,2,2,3]));
    const ans=String(E.length);
    const cands=[
      {text:String(E.length-1),correct:false,mc:"count-slip",fb:"간선을 하나 빠뜨렸다 — 선을 하나씩 표시하며 세라."},
      {text:String(E.length+1),correct:false,mc:"count-slip",fb:"하나를 두 번 셌다 — (0,1)과 (1,0)은 같은 간선이다."},
      {text:String(n),correct:false,mc:"vertex-confuse",fb:String(n)+"은 정점의 수다 — 간선은 선의 수다."}
    ];
    return {id:"G29",qtype,params:{n,edges:g8EdgeStr(E),ans},viz:g8Viz(n,E),
      stem:'그림 그래프의 <b>간선(edge)의 수</b>는?',
      okfb:'선을 하나씩 세면 '+ans+'개다. 무방향에서 (a,b)와 (b,a)는 같은 간선 — 한 번만 센다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(qtype==="eset"){
    const n=pick([4,4,5]), E=g8Build(n,pick([1,2]));
    const ans=g8SetStr(E);
    const drop=E.slice(); drop.splice(Math.floor(Math.random()*drop.length),1);
    /* 없는 간선 하나 추가 */
    const seen=new Set(E.map(e=>g8Key(e[0],e[1]))); let extraE=null;
    for(let a=0;a<n&&!extraE;a++)for(let b=a+1;b<n&&!extraE;b++) if(!seen.has(a+"-"+b)) extraE=[a,b];
    const plus=extraE? E.concat([extraE]).sort((p,q)=>p[0]-q[0]||p[1]-q[1]) : null;
    const dirText=E.map(e=>"<"+e[0]+","+e[1]+">").join(", ");
    const cands=[
      {text:g8SetStr(drop),correct:false,mc:"missing-edge",fb:"그림에 있는 간선 하나가 빠졌다 — 개수부터 맞춰 보라."},
      {text:dirText,correct:false,mc:"dir-notation",fb:"&lt; &gt;는 방향 간선의 표기다 — 이 그래프는 화살표가 없는 무방향이다."}
    ];
    if(plus) cands.push({text:g8SetStr(plus),correct:false,mc:"extra-edge",fb:"그림에 없는 간선이 끼어 있다."});
    return {id:"G29",qtype,params:{n,edges:g8EdgeStr(E),ans},viz:g8Viz(n,E),mono:true,
      stem:'그림 무방향 그래프의 <b>간선 집합 E(G)</b>를 옳게 나열한 것은?',
      okfb:'무방향 간선은 (작은 번호, 큰 번호) 괄호쌍 — 전부 '+E.length+'개다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  /* istree — 트리 판정 */
  const kind=pick(["tree","cycle","forest"]);
  const n=pick([5,6]);
  const E= kind==="tree"? g8Build(n,0) : kind==="cycle"? g8Build(n,1) : g8BuildForest(n);
  const ans= kind==="tree"? "트리다 — 연결이며 사이클이 없다"
    : kind==="cycle"? "트리가 아니다 — 사이클이 있다"
    : "트리가 아니다 — 연결되어 있지 않다";
  const all=["트리다 — 연결이며 사이클이 없다","트리가 아니다 — 사이클이 있다","트리가 아니다 — 연결되어 있지 않다"];
  const cands=all.filter(t=>t!==ans).map(t=>({text:t,correct:false,mc:"tree-judge",
    fb: t.indexOf("사이클")>=0? "간선 수를 보라 — 정점 "+n+"개의 트리는 간선이 정확히 "+(n-1)+"개다."
      : t.indexOf("연결되어")>=0? "모든 정점이 간선을 따라 서로 닿는지 확인하라."
      : "간선 수가 정점 수 − 1이고 전부 이어져 있는지 확인하라."}));
  cands.push({text:"정점 수가 "+(n%2?"홀수라":"짝수라")+" 트리가 아니다",correct:false,mc:"parity-myth",fb:"트리 판정에 정점 수의 홀짝은 무관하다."});
  return {id:"G29",qtype,params:{n,edges:g8EdgeStr(E),kind,ans},viz:g8Viz(n,E),
    stem:'4장에서 "트리는 그래프의 특별한 경우"라 했다. 그림 그래프는 <b>트리인가?</b>',
    okfb: kind==="tree"? "간선 "+E.length+"개 = 정점 − 1, 전부 연결 — 트리다."
      : kind==="cycle"? "간선이 정점 − 1보다 많다 — 어딘가 되돌아오는 길(사이클)이 생겼다."
      : "두 덩어리로 나뉘어 있다 — 연결이 아니면 트리가 아니다.",
    choices:g2Fill(shuffle(cands),{text:ans,correct:true},4)};
}

/* --- G30. 용어 (유닛 B) --- */
function genG30(){
  const qtype=pick(["complete","deg","degsum","inout"]);
  if(qtype==="complete"){
    const n=pick([4,5,6,7]);
    const ans=String(n*(n-1)/2);
    const cands=[
      {text:String(n*(n-1)),correct:false,mc:"dir-confuse",fb:"n(n−1)은 방향 완전 그래프다 — 무방향은 둘씩 겹쳐 절반."},
      {text:String(n*n),correct:false,mc:"square-slip",fb:"자기 자신으로의 간선(셀프 루프)은 없다 — n²이 아니다."},
      {text:String(n-1),correct:false,mc:"tree-confuse",fb:"n−1은 트리(최소 연결)의 간선 수 — 완전 그래프는 최대다."}
    ];
    return {id:"G30",qtype,params:{n,ans},
      stem:'정점이 <b>'+n+'개</b>인 <b>무방향 완전 그래프</b>의 간선의 수는?',
      okfb:'정점마다 나머지 '+(n-1)+'개와 이어지고, 간선 하나가 두 정점에서 겹쳐 세어진다 — '+n+'×'+(n-1)+'÷2 = '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(qtype==="deg"){
    const n=pick([5,5,6]), E=g8Build(n,pick([1,2,3]));
    const d=g8Deg(n,E), k=Math.floor(Math.random()*n);
    const ans=String(d[k]);
    const cands=[
      {text:String(d[k]+1),correct:false,mc:"count-slip",fb:"정점 "+k+"에 붙은 선만 세라."},
      {text:String(Math.max(0,d[k]-1)),correct:false,mc:"count-slip",fb:"빠뜨린 간선이 있다 — 정점 "+k+"에서 나가는 선을 전부 짚어라."},
      {text:String(E.length),correct:false,mc:"edge-confuse",fb:String(E.length)+"은 그래프 전체의 간선 수다."}
    ];
    return {id:"G30",qtype,params:{n,edges:g8EdgeStr(E),k,ans},viz:g8Viz(n,E,k),
      stem:'그림 그래프에서 정점 <b>'+k+'</b>의 <b>차수(degree)</b>는?',
      okfb:'정점 '+k+'에 부속한 간선의 수 — '+ans+'개다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(qtype==="degsum"){
    const n=pick([4,5,5]), E=g8Build(n,pick([1,2]));
    const ans=String(2*E.length);
    const cands=[
      {text:String(E.length),correct:false,mc:"half-slip",fb:"간선 하나가 양쪽 정점의 차수를 하나씩 — 합은 간선 수의 2배다."},
      {text:String(2*E.length+2),correct:false,mc:"count-slip",fb:"간선 수 × 2를 다시 계산해 보라."},
      {text:String(n),correct:false,mc:"vertex-confuse",fb:String(n)+"은 정점의 수다."}
    ];
    return {id:"G30",qtype,params:{n,edges:g8EdgeStr(E),ans},viz:g8Viz(n,E),
      stem:'그림 그래프에서 <b>모든 정점의 차수를 더한 값</b>은?',
      okfb:'간선 하나가 두 정점의 차수를 하나씩 올린다 — 차수 합 = 2 × 간선 수 = 2×'+E.length+' = '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  /* inout — 방향 그래프 진입·진출 */
  let n,E,io,k,guard=20;
  do{ n=4; E=g8BuildDir(n,pick([5,6])); io=g8InOut(n,E); k=Math.floor(Math.random()*n); }
  while(guard-->0 && io.din[k]===io.dout[k]);           /* 진입≠진출인 정점을 우선 */
  const a=io.din[k], b=io.dout[k];
  const ans="진입 "+a+" · 진출 "+b;
  const cands=[
    {text:"진입 "+b+" · 진출 "+a,correct:false,mc:"inout-swap",fb:"화살표가 '들어오면' 진입, '나가면' 진출 — 방향을 다시 보라."},
    {text:"진입 "+(a+1)+" · 진출 "+b,correct:false,mc:"count-slip",fb:"정점 "+k+"로 들어오는 화살표만 세라."},
    {text:"진입 "+a+" · 진출 "+(b+1),correct:false,mc:"count-slip",fb:"정점 "+k+"에서 나가는 화살표만 세라."}
  ];
  return {id:"G30",qtype,params:{n,dedges:E.map(e=>e[0]+">"+e[1]).join(","),k,ans},viz:g8VizDir(n,E,k),
    stem:'그림 <b>방향 그래프</b>에서 정점 <b>'+k+'</b>의 <b>진입 차수와 진출 차수</b>는?',
    okfb:'들어오는 화살표 '+a+'개(진입), 나가는 화살표 '+b+'개(진출)다.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* --- G31. 인접 행렬 (유닛 C) --- */
function genG31(){
  const qtype=pick(["row","degrow","matedges","dirout"]);
  if(qtype==="row"){
    const n=pick([4,4,5]), E=g8Build(n,pick([1,2])), m=g8Mat(n,E,false);
    const i=Math.floor(Math.random()*n);
    const ans=m[i].join(" ");
    const flip=(r,c)=>{ const x=r.slice(); x[c]=1-x[c]; return x.join(" "); };
    const c1=Math.floor(Math.random()*n);
    let c2=(c1+1)%n; if(c2===i) c2=(c2+1)%n;
    const cands=[
      {text:flip(m[i],c1),correct:false,mc:"cell-slip",fb:"정점 "+i+"와 "+c1+" 사이 간선의 유무를 그림에서 다시 확인하라."},
      {text:flip(m[i],c2),correct:false,mc:"cell-slip",fb:"정점 "+i+"와 "+c2+" 사이를 다시 보라."},
      {text:m[(i+1)%n].join(" "),correct:false,mc:"row-confuse",fb:"그것은 정점 "+((i+1)%n)+"의 행이다."}
    ];
    return {id:"G31",qtype,params:{n,edges:g8EdgeStr(E),i,ans},viz:g8Viz(n,E,i),mono:true,
      stem:'그림 그래프의 인접 행렬에서 <b>정점 '+i+'의 행</b>(adj_mat['+i+'][0..'+(n-1)+'])은?',
      okfb:'정점 '+i+'와 간선으로 이어진 자리만 1 — '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(qtype==="degrow"){
    const n=pick([4,5]), E=g8Build(n,pick([1,2])), m=g8Mat(n,E,false);
    const i=Math.floor(Math.random()*n);
    const ans=String(m[i].reduce((s,x)=>s+x,0));
    const cands=[
      {text:String(+ans+1),correct:false,mc:"count-slip",fb:"행의 1만 세라 — 0은 세지 않는다."},
      {text:String(Math.max(0,+ans-1)),correct:false,mc:"count-slip",fb:"행 '+i+'행의 1을 다시 세라.".replace("'+i+'",String(i))},
      {text:String(E.length),correct:false,mc:"edge-confuse",fb:"그것은 전체 간선 수 — 한 행의 합이 아니다."}
    ];
    return {id:"G31",qtype,params:{n,edges:g8EdgeStr(E),i,ans},viz:{type:"adjmat",m,hiR:i},mono:true,
      stem:'인접 행렬이 그림과 같다. <b>정점 '+i+'의 차수</b>는?',
      okfb:'무방향 그래프에서 차수 = 그 정점 행의 합 — '+i+'행의 1은 '+ans+'개다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(qtype==="matedges"){
    const n=pick([4,5]), E=g8Build(n,pick([1,2])), m=g8Mat(n,E,false);
    const ones=2*E.length, ans=String(E.length);
    const cands=[
      {text:String(ones),correct:false,mc:"sym-double",fb:"무방향 행렬은 대칭 — 1이 간선마다 두 개씩(adj[i][j]와 adj[j][i]) 있다. 절반이 간선 수다."},
      {text:String(E.length+1),correct:false,mc:"count-slip",fb:"1의 개수를 다시 세고 2로 나누라."},
      {text:String(n),correct:false,mc:"vertex-confuse",fb:String(n)+"은 정점의 수(행렬의 한 변)다."}
    ];
    return {id:"G31",qtype,params:{n,edges:g8EdgeStr(E),ans},viz:{type:"adjmat",m},mono:true,
      stem:'인접 행렬이 그림과 같은 <b>무방향</b> 그래프의 <b>간선의 수</b>는?',
      okfb:'1의 개수는 '+ones+'개 — 대칭으로 두 번씩 적혔으니 간선은 '+ones+'÷2 = '+ans+'개다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  /* dirout — 방향 행렬에서 진출 차수(행 합) */
  let n,E,m,i,out,inn,guard=20;
  do{ n=4; E=g8BuildDir(n,pick([5,6])); m=g8Mat(n,E,true); i=Math.floor(Math.random()*n);
    out=m[i].reduce((s,x)=>s+x,0); inn=m.reduce((s,r)=>s+r[i],0); }
  while(guard-->0 && out===inn);
  const ans=String(out);
  const cands=[
    {text:String(inn),correct:false,mc:"rowcol-swap",fb:"열의 합은 진입 차수다 — 진출은 '행'의 합."},
    {text:String(out+1),correct:false,mc:"count-slip",fb:i+"행의 1을 다시 세라."},
    {text:String(E.length),correct:false,mc:"edge-confuse",fb:"그것은 전체 간선 수다."}
  ];
  return {id:"G31",qtype,params:{n,dedges:E.map(e=>e[0]+">"+e[1]).join(","),i,ans},viz:{type:"adjmat",m,hiR:i},mono:true,
    stem:'<b>방향 그래프</b>의 인접 행렬이 그림과 같다. 정점 <b>'+i+'</b>의 <b>진출 차수</b>는?',
    okfb:'방향 행렬에서 행의 합 = 진출, 열의 합 = 진입 — '+i+'행의 1은 '+ans+'개다.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* --- G32. 인접 리스트 (유닛 D) --- */
function genG32(){
  const qtype=pick(["listof","deglist","listedges","pick"]);
  if(qtype==="listof"){
    let n,E,L,i,guard=20;
    do{ n=pick([4,5]); E=g8Build(n,pick([1,2])); L=g8AdjList(n,E); i=Math.floor(Math.random()*n); }
    while(guard-->0 && L[i].length<2);                   /* 순서가 의미 있으려면 2개 이상 */
    const ans=g8ListStr(L[i]);
    const desc=g8ListStr(L[i].slice().reverse());
    const drop=g8ListStr(L[i].slice(0,-1));
    const other=g8ListStr(L[(i+1)%n]);
    const cands=[
      {text:desc,correct:false,mc:"order-slip",fb:"오름차순(작은 번호부터) 연결 규약이다."},
      {text:drop,correct:false,mc:"missing-edge",fb:"정점 "+i+"에 이어진 정점 하나가 빠졌다."},
      {text:other,correct:false,mc:"row-confuse",fb:"그것은 정점 "+((i+1)%n)+"의 리스트다."}
    ];
    return {id:"G32",qtype,params:{n,edges:g8EdgeStr(E),i,ans},viz:g8Viz(n,E,i),mono:true,
      stem:'그림 그래프를 인접 리스트로 저장한다(작은 번호부터 연결). <b>graph['+i+']</b>가 가리키는 리스트는?',
      okfb:'정점 '+i+'에 인접한 정점들을 오름차순으로 — '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(qtype==="deglist"){
    let n=pick([5,6]), E=g8Build(n,pick([2,3])), L=g8AdjList(n,E), i=Math.floor(Math.random()*n);
    const ans=String(L[i].length);
    const cands=[
      {text:String(L[i].length+1),correct:false,mc:"null-count",fb:"NULL은 노드가 아니다 — 정점 번호가 든 노드만 세라."},
      {text:String(Math.max(0,L[i].length-1)),correct:false,mc:"count-slip",fb:"리스트의 노드를 처음부터 끝까지 세라."},
      {text:String(E.length),correct:false,mc:"edge-confuse",fb:"그것은 그래프 전체의 간선 수다."}
    ];
    return {id:"G32",qtype,params:{n,edges:g8EdgeStr(E),i,ans},mono:true,
      stem:'어떤 무방향 그래프의 정점 '+i+'의 인접 리스트가 다음과 같다.<br><span class="mono">graph['+i+'] → '+g8ListStr(L[i])+'</span><br>정점 '+i+'의 <b>차수</b>는?',
      okfb:'무방향 그래프에서 차수 = 인접 리스트의 노드 수 — '+ans+'개다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(qtype==="listedges"){
    const n=pick([4,5]), E=g8Build(n,pick([1,2])), L=g8AdjList(n,E);
    const total=L.reduce((s,l)=>s+l.length,0), ans=String(E.length);
    const rows=L.map((l,i)=>'graph['+i+'] → '+g8ListStr(l)).join('<br>');
    const cands=[
      {text:String(total),correct:false,mc:"sym-double",fb:"무방향 간선 (a,b)는 a의 리스트와 b의 리스트에 한 번씩, 두 번 적힌다 — 노드 총수 ÷ 2가 간선 수다."},
      {text:String(E.length+1),correct:false,mc:"count-slip",fb:"노드 총수를 다시 세고 2로 나누라."},
      {text:String(n),correct:false,mc:"vertex-confuse",fb:String(n)+"은 정점의 수(리스트의 개수)다."}
    ];
    return {id:"G32",qtype,params:{n,edges:g8EdgeStr(E),ans},mono:true,
      stem:'무방향 그래프의 인접 리스트 전체가 다음과 같다.<br><span class="mono">'+rows+'</span><br>이 그래프의 <b>간선의 수</b>는?',
      okfb:'노드 총수 '+total+'개 — 간선마다 양쪽에 한 번씩 적히므로 간선은 '+total+'÷2 = '+ans+'개다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  /* pick — 표현 선택 */
  const dense=Math.random()<0.5;
  const nBig=pick([1000,2000]);
  const eCnt=dense? "정점 쌍 대부분이 서로 연결" : "간선이 "+pick([1200,1500,3000]).toLocaleString()+"개뿐";
  const ans=dense? "인접 행렬 — 간선이 많고 존재 확인이 O(1)이라" : "인접 리스트 — 간선이 드물어 빈칸 낭비가 없어서";
  const cands= dense?
    [{text:"인접 리스트 — 간선이 드물어 빈칸 낭비가 없어서",correct:false,mc:"density-swap",fb:"이 그래프는 간선이 많다(밀집) — 행렬의 칸이 놀지 않는다."},
     {text:"인접 행렬 — 정점이 많으면 무조건 행렬이라서",correct:false,mc:"no-reason",fb:"기준은 정점 수가 아니라 간선의 밀도다."},
     {text:"어느 쪽이든 성능이 완전히 같다",correct:false,mc:"same-myth",fb:"존재 확인·이웃 순회·메모리가 서로 다르다 — 1장 희소 행렬과 같은 선택 문제다."}]
   :[{text:"인접 행렬 — 간선이 많고 존재 확인이 O(1)이라",correct:false,mc:"density-swap",fb:"이 그래프는 간선이 드물다(희소) — 행렬 "+nBig.toLocaleString()+"² 칸 대부분이 0으로 논다."},
     {text:"인접 리스트 — 정점이 많으면 무조건 리스트라서",correct:false,mc:"no-reason",fb:"기준은 정점 수가 아니라 간선의 밀도다."},
     {text:"어느 쪽이든 메모리가 완전히 같다",correct:false,mc:"same-myth",fb:"행렬은 n² 칸을 항상 확보한다 — 희소하면 낭비다."}];
  return {id:"G32",qtype,params:{dense:dense?1:0,ans},
    stem:'정점 '+nBig.toLocaleString()+'개의 무방향 그래프가 있다. <b>'+eCnt+'</b>이다. 저장 구조로 알맞은 것은?',
    okfb: dense? '밀집 그래프 — 행렬의 칸이 대부분 쓰이고, 두 정점의 연결 확인이 즉시 된다.'
      : '희소 그래프 — 1장 희소 행렬의 교훈 그대로, 있는 것만 저장하는 리스트가 이득이다.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* --- AP8. 심화 (도발장 4) --- */
function genAP8ch(idx){
  if(idx===0){ /* 행렬 → 리스트 교차 표현 */
    let n,E,L,i,guard=20;
    do{ n=4; E=g8Build(n,2); L=g8AdjList(n,E); i=Math.floor(Math.random()*n); }
    while(guard-->0 && L[i].length<2);
    const m=g8Mat(n,E,false);
    const ans=g8ListStr(L[i]);
    const cands=[
      {text:g8ListStr(L[i].slice().reverse()),correct:false,mc:"order-slip",fb:"오름차순 연결 규약이다."},
      {text:g8ListStr(L[(i+1)%n]),correct:false,mc:"row-confuse",fb:"그것은 다른 행의 번역이다 — "+i+"행을 읽어라."},
      {text:g8ListStr(L[i].concat([i]).sort((a,b)=>a-b)),correct:false,mc:"self-loop",fb:"대각선 adj["+i+"]["+i+"]은 0 — 자기 자신은 리스트에 없다."}
    ];
    return {id:"AP8",qtype:"m2l",params:{n,edges:g8EdgeStr(E),i,ans},viz:{type:"adjmat",m,hiR:i},mono:true,
      stem:'[심화 — 표현의 번역] 무방향 그래프의 인접 행렬이 그림과 같다. 이를 인접 리스트(오름차순 연결)로 바꿀 때 <b>graph['+i+']</b>의 리스트는?',
      okfb:i+'행에서 1인 열 번호를 순서대로 — '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(idx===1){ /* 방향 완전 그래프 */
    const n=pick([5,6,7,8]);
    const ans=String(n*(n-1));
    const cands=[
      {text:String(n*(n-1)/2),correct:false,mc:"undir-confuse",fb:"절반은 무방향의 값 — 방향에서는 <a,b>와 <b,a>가 서로 다른 간선이다."},
      {text:String(n*n),correct:false,mc:"square-slip",fb:"셀프 루프 <v,v>는 허용되지 않는다."},
      {text:String(2*n),correct:false,mc:"linear-guess",fb:"정점마다 나머지 전부로 나가는 간선이 있다 — 곱으로 자란다."}
    ];
    return {id:"AP8",qtype:"dircomp",params:{n,ans},
      stem:'[심화 — 방향 완전 그래프] 정점이 <b>'+n+'개</b>인 <b>방향 완전 그래프</b>(서로 다른 두 정점 사이에 양방향 간선이 모두 존재)의 간선의 수는?',
      okfb:'정점마다 나머지 '+(n-1)+'개로 나가는 간선 — 방향은 겹쳐 세지 않으므로 '+n+'×'+(n-1)+' = '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  /* idx 2 — 홀수 차수 정점의 개수 (악수 정리 응용) */
  const n=pick([5,6]), E=g8Build(n,pick([2,3]));
  const d=g8Deg(n,E);
  const odd=d.filter(x=>x%2===1).length;
  const ans=String(odd);
  const cands=[
    {text:String(odd+1),correct:false,mc:"odd-count",fb:"차수 합은 항상 짝수(2×간선 수) — 홀수 차수 정점은 짝수 개만 존재할 수 있다. "+(odd+1)+"개(홀수 개)는 불가능하다."},
    {text:String(Math.max(0,odd-1)===odd?odd+3:Math.max(0,odd-1)),correct:false,mc:"count-slip",fb:"정점별 차수를 전부 적고 홀수인 것만 세라."},
    {text:String(n),correct:false,mc:"vertex-confuse",fb:"전체 정점 수가 아니라 '차수가 홀수인' 정점의 수다."}
  ];
  return {id:"AP8",qtype:"oddeg",params:{n,edges:g8EdgeStr(E),ans},viz:g8Viz(n,E),
    stem:'[심화 — 차수 합의 성질] 그림 그래프에서 <b>차수가 홀수인 정점의 개수</b>는?',
    okfb:'정점별 차수는 ['+d.join(", ")+'] — 홀수는 '+ans+'개다. 차수 합이 항상 2×간선 수(짝수)이므로, 홀수 차수 정점의 개수는 언제나 짝수다.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* ================================================================
   5장(B) 그래프 탐색 — G33 DFS 절차 / G34 DFS 코드 / G35 BFS / G36 응용 / AP9 심화
   규약: 인접 리스트 오름차순(작은 번호부터). params: edges + ans — 독립 재검산용
   ================================================================ */
function g9Adj(n,E){ const L=Array.from({length:n},()=>[]);
  E.forEach(e=>{ L[e[0]].push(e[1]); L[e[1]].push(e[0]); });
  L.forEach(l=>l.sort((a,b)=>a-b)); return L; }
function g9Dfs(n,E,s){ const L=g9Adj(n,E), seen=Array(n).fill(false), out=[];
  (function go(v){ seen[v]=true; out.push(v); for(const w of L[v]) if(!seen[w]) go(w); })(s); return out; }
function g9Bfs(n,E,s){ const L=g9Adj(n,E), seen=Array(n).fill(false), out=[], q=[s]; seen[s]=true;
  while(q.length){ const v=q.shift(); out.push(v); for(const w of L[v]) if(!seen[w]){ seen[w]=true; q.push(w); } } return out; }
/* bfs에서 정점 x를 '꺼내 출력한 직후'의 큐 내용 */
function g9BfsQueueAfter(n,E,s,x){ const L=g9Adj(n,E), seen=Array(n).fill(false), q=[s]; seen[s]=true;
  while(q.length){ const v=q.shift();
    for(const w of L[v]) if(!seen[w]){ seen[w]=true; q.push(w); }
    if(v===x) return q.slice(); }
  return []; }
function g9Comps(n,E){ const L=g9Adj(n,E), seen=Array(n).fill(false), comps=[];
  for(let s=0;s<n;s++){ if(seen[s]) continue; const c=[], st=[s]; seen[s]=true;
    while(st.length){ const v=st.pop(); c.push(v); for(const w of L[v]) if(!seen[w]){ seen[w]=true; st.push(w); } }
    c.sort((a,b)=>a-b); comps.push(c); }
  return comps; }
function g9Seq(a){ return a.join(", "); }

/* --- G33. DFS 절차 (유닛 A) --- */
function genG33(){
  const qtype=pick(["order","kth","deadend"]);
  if(qtype==="deadend"){
    const ans="스택에서 정점을 꺼내 직전 갈림길로 되돌아간다";
    const cands=[
      {text:"큐에서 가장 오래된 정점을 꺼내 이어 간다",correct:false,mc:"bfs-confuse",fb:"오래된 것부터 꺼내는 것은 너비 우선(큐) 쪽 방식이다."},
      {text:"탐색을 종료하고 결과를 출력한다",correct:false,mc:"early-stop",fb:"스택이 빌 때까지는 끝이 아니다 — 아직 안 가 본 갈림길이 남아 있을 수 있다."},
      {text:"방문 표시를 지우고 처음부터 다시 시작한다",correct:false,mc:"reset-myth",fb:"발자국(visited)은 지우지 않는다 — 지우면 같은 곳을 영원히 맴돈다."}
    ];
    return {id:"G33",qtype,params:{ans},
      stem:'깊이 우선 탐색 도중, 현재 정점의 인접 정점이 <b>모두 방문된 상태</b>(막다른 곳)가 되었다. 다음에 하는 일은?',
      okfb:'2장(B) 미로의 백트래킹 그대로 — 스택에 기억해 둔 직전 갈림길로 되돌아가 남은 길을 잇는다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  let n,E,d,b,guard=30;
  do{ n=pick([5,6,6]); E=g8Build(n,pick([1,2,2])); d=g9Dfs(n,E,0); b=g9Bfs(n,E,0); }
  while(guard-->0 && g9Seq(d)===g9Seq(b));   /* DFS·BFS가 갈라지는 그래프만 */
  if(qtype==="order"){
    const ans=g9Seq(d);
    const big=(function(){ const L=g9Adj(n,E).map(l=>l.slice().reverse()), seen=Array(n).fill(false), out=[];
      (function go(v){ seen[v]=true; out.push(v); for(const w of L[v]) if(!seen[w]) go(w); })(0); return out; })();
    const cands=[
      {text:g9Seq(b),correct:false,mc:"bfs-confuse",fb:"가까운 정점부터 층층이 — 그것은 너비 우선의 순서다."},
      {text:g9Seq(big),correct:false,mc:"order-rule",fb:"인접 리스트는 작은 번호부터 잇는 규약 — 큰 번호를 먼저 가면 안 된다."},
      {text:g9Seq(Array.from({length:n},(_,i)=>i)),correct:false,mc:"index-order",fb:"정점 번호 순서가 아니라 간선을 따라가는 순서다."}
    ];
    return {id:"G33",qtype,params:{n,edges:g8EdgeStr(E),ans},viz:g8Viz(n,E,0),mono:true,
      stem:'그림 그래프를 정점 <b>0</b>에서 <b>깊이 우선 탐색(DFS)</b> 한 방문 순서는? (인접 리스트는 작은 번호부터)',
      okfb:'한 길을 끝까지, 막히면 되돌아서 — '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  /* kth */
  const k=pick([3,4]);
  const ans=String(d[k-1]);
  const cands=[
    {text:String(b[k-1]),correct:false,mc:"bfs-confuse",fb:"그것은 너비 우선이 "+k+"번째로 방문하는 정점이다."},
    {text:String(d[k%d.length]),correct:false,mc:"off-by-one",fb:"방문 순서를 1번째부터 다시 세라 — 출발 정점 0이 1번째다."},
    {text:String(d[k-2]),correct:false,mc:"off-by-one",fb:"한 정점 이르다 — "+k+"번째까지 세라."}
  ];
  return {id:"G33",qtype,params:{n,edges:g8EdgeStr(E),k,ans},viz:g8Viz(n,E,0),mono:true,
    stem:'그림 그래프를 정점 <b>0</b>에서 깊이 우선 탐색할 때 <b>'+k+'번째</b>로 방문하는 정점은? (인접 리스트는 작은 번호부터)',
    okfb:'방문 순서는 '+g9Seq(d)+' — '+k+'번째는 '+ans+'이다.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* --- G34. DFS 코드 (유닛 B) --- */
function genG34(){
  const qtype=pick(["callcnt","printorder","novisit"]);
  if(qtype==="novisit"){
    const ans="같은 정점을 다시 방문해 재귀가 끝나지 않을 수 있다";
    const cands=[
      {text:"결과는 같고 실행 속도만 조금 느려질 뿐이다",correct:false,mc:"harmless-myth",fb:"사이클이 있는 그래프에서는 같은 정점 사이를 영원히 오간다 — 속도 문제가 아니다."},
      {text:"컴파일 오류가 발생한다",correct:false,mc:"compile-myth",fb:"문법은 멀쩡하다 — 실행이 끝나지 않는 것이 문제다."},
      {text:"방문 순서가 정점 번호 순서로 바뀌어 출력된다",correct:false,mc:"order-myth",fb:"순서가 바뀌는 것이 아니라 탐색 자체가 끝나지 못한다."}
    ];
    return {id:"G34",qtype,params:{ans},
      code:["void dfs(int v) {","    node_pointer w;","    printf(\"%5d\", v);   /* visited[v] = TRUE 를 지웠다 */","    for (w = graph[v]; w; w = w->link)","        if (!visited[w->vertex])","            dfs(w->vertex);","}"],
      stem:'dfs 코드에서 <span class="mono">visited[v] = TRUE;</span> 를 지우면 어떻게 되는가?',
      okfb:'발자국이 없으면 사이클을 도는 순간 같은 정점을 다시, 또다시 방문한다 — 재귀가 끝나지 않는다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  let n,E,d,b,guard=30;
  do{ n=pick([5,6]); E=g8Build(n,pick([1,2])); d=g9Dfs(n,E,0); b=g9Bfs(n,E,0); }
  while(guard-->0 && g9Seq(d)===g9Seq(b));
  if(qtype==="callcnt"){
    const ans=String(n);
    const cands=[
      {text:String(E.length),correct:false,mc:"edge-confuse",fb:"간선 수가 아니다 — dfs는 '정점'마다 한 번 호출된다."},
      {text:String(2*E.length),correct:false,mc:"double-count",fb:"간선을 두 번 살피는 것은 for 루프의 일 — 호출은 방문 표시가 막는다."},
      {text:String(n-1),correct:false,mc:"root-miss",fb:"출발 정점의 첫 호출도 센다 — 정점 수만큼이다."}
    ];
    return {id:"G34",qtype,params:{n,edges:g8EdgeStr(E),ans},viz:g8Viz(n,E,0),mono:true,
      stem:'그림의 <b>연결</b> 그래프에서 <span class="mono">dfs(0)</span> 실행이 끝날 때까지 dfs 함수가 호출되는 <b>총 횟수</b>는?',
      okfb:'visited 검사 덕에 각 정점은 정확히 한 번만 호출된다 — 정점 수 '+ans+'회.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  /* printorder — 코드 프레임으로 방문 순서 */
  const ans=g9Seq(d);
  const cands=[
    {text:g9Seq(b),correct:false,mc:"bfs-confuse",fb:"이 코드는 스택(재귀)으로 파고든다 — 층층이 도는 것은 큐 쪽이다."},
    {text:g9Seq(Array.from({length:n},(_,i)=>i)),correct:false,mc:"index-order",fb:"번호 순서가 아니라 재귀가 파고드는 순서다."},
    {text:g9Seq(d.slice().reverse()),correct:false,mc:"reverse-slip",fb:"printf는 방문 표시 직후 — 파고드는 순서 그대로 찍힌다."}
  ];
  return {id:"G34",qtype,params:{n,edges:g8EdgeStr(E),ans},viz:g8Viz(n,E,0),mono:true,
    code:["void dfs(int v) {","    node_pointer w;","    visited[v] = TRUE;  printf(\"%5d\", v);","    for (w = graph[v]; w; w = w->link)","        if (!visited[w->vertex])","            dfs(w->vertex);","}"],
    stem:'그림 그래프에서 <span class="mono">dfs(0)</span> 의 <b>출력 순서</b>는? (인접 리스트는 작은 번호부터)',
    okfb:'출력은 방문과 동시 — '+ans+'.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* --- G35. BFS (유닛 C) --- */
function genG35(){
  const qtype=pick(["order","kth","queue","maze"]);
  if(qtype==="maze"){
    const ans="가까운 칸부터 골고루 넓혀 가며 탐색한다";
    const cands=[
      {text:"한 길을 끝까지 파고들었다가 막히면 되돌아온다",correct:false,mc:"dfs-confuse",fb:"그것은 스택을 쓰던 원래 방식(깊이 우선)이다."},
      {text:"탐색 순서는 스택일 때와 완전히 같다",correct:false,mc:"same-myth",fb:"꺼내는 순서가 다르면 가 보는 순서도 달라진다."},
      {text:"출구를 더 이상 찾을 수 없게 된다",correct:false,mc:"fail-myth",fb:"큐로도 출구는 찾는다 — 오히려 가까운 출구를 먼저 만난다."}
    ];
    return {id:"G35",qtype,params:{ans},
      stem:'2장(B)의 미로 탐색에서 「가 볼 곳」의 저장 구조를 <b>스택 대신 큐</b>로 바꾸면 탐색은 어떻게 달라지는가?',
      okfb:'큐는 먼저 넣은 곳부터 꺼낸다 — 출발 주변을 골고루 넓혀 가는 너비 우선이 된다. 미로의 칸을 정점으로 보면 지금 배우는 BFS 그대로다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  let n,E,d,b,guard=30;
  do{ n=pick([5,6,6]); E=g8Build(n,pick([1,2,2])); d=g9Dfs(n,E,0); b=g9Bfs(n,E,0); }
  while(guard-->0 && g9Seq(d)===g9Seq(b));
  if(qtype==="order"){
    const ans=g9Seq(b);
    const cands=[
      {text:g9Seq(d),correct:false,mc:"dfs-confuse",fb:"한 길을 끝까지 파고드는 것은 깊이 우선의 순서다."},
      {text:g9Seq(Array.from({length:n},(_,i)=>i)),correct:false,mc:"index-order",fb:"번호 순서가 아니라 큐에서 꺼내는 순서다."},
      {text:g9Seq(b.slice(0,1).concat(b.slice(1).reverse())),correct:false,mc:"order-rule",fb:"같은 정점의 이웃은 작은 번호부터 큐에 들어간다."}
    ];
    return {id:"G35",qtype,params:{n,edges:g8EdgeStr(E),ans},viz:g8Viz(n,E,0),mono:true,
      stem:'그림 그래프를 정점 <b>0</b>에서 <b>너비 우선 탐색(BFS)</b> 한 방문 순서는? (인접 리스트는 작은 번호부터)',
      okfb:'가까운 층부터 골고루 — '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(qtype==="kth"){
    const k=pick([3,4]);
    const ans=String(b[k-1]);
    const cands=[
      {text:String(d[k-1]),correct:false,mc:"dfs-confuse",fb:"그것은 깊이 우선이 "+k+"번째로 방문하는 정점이다."},
      {text:String(b[k%b.length]),correct:false,mc:"off-by-one",fb:"출발 정점 0이 1번째다 — 다시 세라."},
      {text:String(b[k-2]),correct:false,mc:"off-by-one",fb:"한 정점 이르다."}
    ];
    return {id:"G35",qtype,params:{n,edges:g8EdgeStr(E),k,ans},viz:g8Viz(n,E,0),mono:true,
      stem:'그림 그래프를 정점 <b>0</b>에서 너비 우선 탐색할 때 <b>'+k+'번째</b>로 방문하는 정점은? (인접 리스트는 작은 번호부터)',
      okfb:'방문 순서는 '+g9Seq(b)+' — '+k+'번째는 '+ans+'이다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  /* queue — x 방문 직후 큐 내용 (비어 있지 않은 시점 선택) */
  let x=-1;
  for(const v of b){ const q=g9BfsQueueAfter(n,E,0,v); if(q.length>=2){ x=v; break; } }
  if(x<0) x=b[0];
  const q=g9BfsQueueAfter(n,E,0,x);
  const ans=q.length?g9Seq(q):"(비어 있음)";
  const wrongA=q.length>1?g9Seq(q.slice().reverse()):g9Seq([x]);
  const wrongB=g9Seq(q.concat([x]));
  const wrongC=q.length?g9Seq(q.slice(1)):g9Seq([x]);
  const cands=[
    {text:wrongA,correct:false,mc:"order-slip",fb:"큐는 넣은 순서 그대로다 — 뒤집히지 않는다."},
    {text:wrongB,correct:false,mc:"self-in-queue",fb:x+"는 방금 꺼내 출력했다 — 큐에 남아 있지 않다."},
    {text:wrongC,correct:false,mc:"drop-slip",fb:"아직 꺼내지 않은 정점을 지우면 안 된다."}
  ];
  return {id:"G35",qtype,params:{n,edges:g8EdgeStr(E),x,ans},viz:g8Viz(n,E,x),mono:true,
    stem:'그림 그래프에서 <span class="mono">bfs(0)</span> 진행 중, 정점 <b>'+x+'</b>를 큐에서 꺼내 출력하고 그 이웃들까지 넣은 <b>직후의 큐 내용</b>은? (앞 → 뒤)',
    okfb:'꺼낸 '+x+'는 빠지고, 새로 방문 표시된 이웃들이 뒤에 붙는다 — '+ans+'.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* --- G36. 연결 요소·신장 트리 (유닛 D) --- */
function genG36(){
  const qtype=pick(["comp","compof","spanedge","nontree"]);
  if(qtype==="comp"||qtype==="compof"){
    const n=6, E=g8BuildForest(n);
    const comps=g9Comps(n,E);
    if(qtype==="comp"){
      const ans=String(comps.length);
      const cands=[
        {text:String(comps.length+1),correct:false,mc:"count-slip",fb:"간선으로 이어진 정점들은 한 덩어리로 센다."},
        {text:String(n),correct:false,mc:"vertex-confuse",fb:String(n)+"은 정점의 수 — 요소는 덩어리의 수다."},
        {text:String(E.length),correct:false,mc:"edge-confuse",fb:"간선의 수가 아니라 서로 닿지 않는 덩어리의 수다."}
      ];
      return {id:"G36",qtype,params:{n,edges:g8EdgeStr(E),ans},viz:g8Viz(n,E),
        stem:'그림 그래프의 <b>연결 요소(connected component)</b>는 몇 개인가?',
        okfb:'간선을 따라 서로 닿는 덩어리를 세면 '+ans+'개다.',
        choices:g2Fill(cands,{text:ans,correct:true},4)};
    }
    const big=comps.slice().sort((a,b)=>b.length-a.length)[0];
    const x=pick(big);
    const ans=g9Seq(big);
    const others=comps.filter(c=>c!==big);
    const wrongUnion=g9Seq(big.concat(others.length?others[0]:[]).sort((a,b)=>a-b));
    const cands=[
      {text:g9Seq(big.filter(v=>v!==x)),correct:false,mc:"self-miss",fb:"자기 자신도 요소의 일원이다 — "+x+"를 포함해야 한다."},
      {text:g9Seq(Array.from({length:n},(_,i)=>i)),correct:false,mc:"all-myth",fb:"이 그래프는 연결이 아니다 — 닿지 않는 정점은 다른 요소다."}
    ];
    if(wrongUnion!==ans) cands.push({text:wrongUnion,correct:false,mc:"merge-slip",fb:"간선으로 닿는 정점만 같은 요소다."});
    return {id:"G36",qtype,params:{n,edges:g8EdgeStr(E),x,ans},viz:g8Viz(n,E,x),mono:true,
      stem:'그림 그래프에서 정점 <b>'+x+'</b>와 <b>같은 연결 요소</b>에 속한 정점을 모두 나열하면? (자신 포함, 오름차순)',
      okfb:x+'에서 간선을 따라 닿을 수 있는 정점 전부 — '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  const n=pick([5,6,7]), extra=pick([2,3]), E=g8Build(Math.min(n,6),extra);
  const nn=Math.min(n,6);
  if(qtype==="spanedge"){
    const ans=String(nn-1);
    const cands=[
      {text:String(E.length),correct:false,mc:"all-edges",fb:"신장 트리는 탐색이 실제로 '사용한' 간선만 남긴다 — 전부가 아니다."},
      {text:String(nn),correct:false,mc:"vertex-confuse",fb:"트리의 간선은 정점 수보다 하나 적다(4장)."},
      {text:String(nn-2),correct:false,mc:"count-slip",fb:"정점 "+nn+"개를 모두 이으려면 최소 "+(nn-1)+"개가 필요하다."}
    ];
    return {id:"G36",qtype,params:{n:nn,edges:g8EdgeStr(E),ans},viz:g8Viz(nn,E),
      stem:'그림의 <b>연결</b> 그래프를 dfs(0)로 탐색해 만든 <b>신장 트리의 간선 수</b>는?',
      okfb:'신장 트리는 모든 정점을 포함하는 트리 — 간선은 언제나 정점 수 − 1 = '+ans+'개다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  /* nontree */
  const ans=String(E.length-(nn-1));
  const cands=[
    {text:String(nn-1),correct:false,mc:"tree-confuse",fb:"그것은 트리 간선의 수 — 비트리 간선은 나머지다."},
    {text:String(E.length),correct:false,mc:"all-edges",fb:"전체에서 트리 간선("+(nn-1)+"개)을 빼야 한다."},
    {text:String(Math.max(0,E.length-nn)),correct:false,mc:"count-slip",fb:"트리 간선은 "+nn+"개가 아니라 "+(nn-1)+"개다."}
  ];
  return {id:"G36",qtype,params:{n:nn,edges:g8EdgeStr(E),ans},viz:g8Viz(nn,E),
    stem:'그림의 연결 그래프(간선 '+E.length+'개)에서 신장 트리를 만들면, 트리에 <b>포함되지 않는(비트리) 간선</b>은 몇 개인가?',
    okfb:'전체 '+E.length+'개 − 트리 간선 '+(nn-1)+'개 = '+ans+'개. 비트리 간선 하나를 트리에 더하면 반드시 사이클이 생긴다.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* --- AP9. 심화 (도발장 5) --- */
function genAP9ch(idx){
  if(idx===0){ /* dfs·bfs가 처음 갈라지는 위치 */
    let n,E,d,b,pos,guard=40;
    do{ n=6; E=g8Build(n,2); d=g9Dfs(n,E,0); b=g9Bfs(n,E,0);
      pos=-1; for(let i=0;i<n;i++) if(d[i]!==b[i]){ pos=i+1; break; } }
    while(guard-->0 && pos<0);
    if(pos<0) pos=1;
    const ans=String(pos);
    const cands=[
      {text:String(pos+1),correct:false,mc:"off-by-one",fb:"두 순서를 1번째부터 나란히 비교하라."},
      {text:String(Math.max(1,pos-1)),correct:false,mc:"off-by-one",fb:"거기까지는 두 순서가 같다."},
      {text:"끝까지 같다",correct:false,mc:"same-myth",fb:"이 그래프에서는 갈라진다 — 직접 두 순서를 적어 비교하라."}
    ];
    return {id:"AP9",qtype:"diverge",params:{n,edges:g8EdgeStr(E),ans},viz:g8Viz(n,E,0),mono:true,
      stem:'[심화 — 두 탐색의 갈림] 그림 그래프를 정점 0에서 DFS와 BFS로 각각 탐색하면(작은 번호부터), 두 방문 순서가 <b>처음으로 달라지는 위치</b>는 몇 번째인가?',
      okfb:'DFS: '+g9Seq(d)+' / BFS: '+g9Seq(b)+' — '+ans+'번째에서 갈라진다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(idx===1){ /* 연결 요소별 크기 */
    const n=6, E=g8BuildForest(n);
    const comps=g9Comps(n,E);
    const sizes=comps.map(c=>c.length).sort((a,b)=>b-a);
    const ans=sizes.join(" / ");
    const w1=sizes.slice().reverse().join(" / ");
    const cands=[
      {text:String(n)+" / 0",correct:false,mc:"all-myth",fb:"이 그래프는 한 덩어리가 아니다."},
      {text:sizes.map(s=>s+1).join(" / "),correct:false,mc:"count-slip",fb:"각 덩어리의 정점을 하나씩 짚어 세라."}
    ];
    if(w1!==ans) cands.push({text:w1,correct:false,mc:"order-slip",fb:"큰 것부터 나열하는 규약이다."});
    return {id:"AP9",qtype:"compsize",params:{n,edges:g8EdgeStr(E),ans},viz:g8Viz(n,E),mono:true,
      stem:'[심화 — 요소의 크기] 그림 그래프의 연결 요소별 <b>정점 수</b>를 큰 것부터 나열하면?',
      okfb:'요소는 '+comps.length+'개 — 크기는 '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  /* idx 2 — BFS 거리(간선 수) */
  let n,E,dist,x,guard=40;
  do{ n=6; E=g8Build(n,pick([1,2]));
    const L=g9Adj(n,E); dist=Array(n).fill(-1); dist[0]=0; const q=[0];
    while(q.length){ const v=q.shift(); for(const w of L[v]) if(dist[w]<0){ dist[w]=dist[v]+1; q.push(w); } }
    const far=dist.map((d2,i)=>[d2,i]).filter(p=>p[0]>=2);
    x=far.length?pick(far)[1]:-1; }
  while(guard-->0 && x<0);
  if(x<0) x=1;
  const ans=String(dist[x]);
  const cands=[
    {text:String(dist[x]+1),correct:false,mc:"vertex-count",fb:"경로 위 정점 수가 아니라 간선 수다."},
    {text:String(Math.max(1,dist[x]-1)),correct:false,mc:"count-slip",fb:"가장 짧은 길을 놓쳤는지 확인하라 — 층을 다시 세라."},
    {text:String(n-1),correct:false,mc:"worst-guess",fb:"가장 먼 경우가 아니라 이 정점까지의 최단 층수다."}
  ];
  return {id:"AP9",qtype:"dist",params:{n,edges:g8EdgeStr(E),x,ans},viz:g8Viz(n,E,x),mono:true,
    stem:'[심화 — 가장 가까운 길] 그림 그래프에서 정점 0에서 정점 <b>'+x+'</b>까지 가는 경로 중 <b>가장 짧은 것의 길이(간선 수)</b>는? (BFS가 층을 넓히는 순서를 떠올려라)',
    okfb:'BFS는 가까운 층부터 넓힌다 — '+x+'는 0에서 '+ans+'번째 층에서 처음 만난다. 간선마다 비용이 다르면 어떻게 될까 — 다음 강의 이야기다.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* ================================================================
   5장(C) 가중치 그래프 — G37 MST 기초 / G38 Kruskal / G39 Prim / G40 Dijkstra / AP10 심화(union-find·Floyd·위상 정렬)
   params: edges="a-b:w,..."(무방향 가중치) 또는 dedges="a>b:w,..."(방향 가중치) + ans — 테스트 독립 재검산용
   ================================================================ */
function gwDistinct(k){
  const pool=[]; for(let w=5;w<=48;w++) pool.push(w);
  for(let i=pool.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=pool[i]; pool[i]=pool[j]; pool[j]=t; }
  return pool.slice(0,k);
}
function gwBuild(n, extra){
  const E=g8Build(n, extra), ws=gwDistinct(E.length);
  return E.map((e,i)=>[e[0],e[1],ws[i]]);
}
function gwEdgeStr(E){ return E.map(e=>e[0]+"-"+e[1]+":"+e[2]).join(","); }
function gwPair(e){ return "("+e[0]+","+e[1]+") — "+e[2]; }
function gwViz(n,E,opt){
  const hl=(opt&&opt.hl)||new Set(), cut=(opt&&opt.cut)||new Set();
  return {type:"graph", nodes:g8Nodes(n), edges:E.map(e=>{
    const k=g8Key(e[0],e[1]), o={a:e[0],b:e[1],lab:e[2]};
    if(hl.has(k)) o.hl=true; if(cut.has(k)) o.cut=true; return o; })};
}
function gwFind(p,x){ while(p[x]!==x) x=p[x]; return x; }
function gwKruskal(n,E){
  const S=E.slice().sort((a,b)=>a[2]-b[2]);
  const p=Array.from({length:n},(_,i)=>i);
  const order=[], acc=[], rej=[]; let total=0;
  for(const e of S){
    if(acc.length===n-1) break;
    const ra=gwFind(p,e[0]), rb=gwFind(p,e[1]);
    if(ra===rb){ order.push({e:e,ok:false}); rej.push(e); }
    else { p[ra]=rb; order.push({e:e,ok:true}); acc.push(e); total+=e[2]; }
  }
  return {order:order, acc:acc, rej:rej, total:total};
}
function gwPrim(n,E,s){
  const inT=Array(n).fill(false); inT[s]=true;
  const acc=[], joins=[];
  for(let k=0;k<n-1;k++){
    let best=null;
    for(const e of E){ const a=inT[e[0]], b=inT[e[1]];
      if(a!==b && (!best||e[2]<best[2])) best=e; }
    if(!best) break;
    const nv=inT[best[0]]?best[1]:best[0];
    inT[nv]=true; acc.push(best); joins.push(nv);
  }
  return {acc:acc, joins:joins, total:acc.reduce((s2,e)=>s2+e[2],0)};
}
function gwDedgeStr(DE){ return DE.map(e=>e[0]+">"+e[1]+":"+e[2]).join(","); }
function gwVizDir(n,DE,hlId){
  const rev=new Set(DE.map(e=>e[0]+">"+e[1]));
  /* 라벨은 소스 쪽(0.35) — 교차 간선의 중앙 라벨 겹침 완화 (감수 2026-08-27) */
  return {type:"graph", nodes:g8Nodes(n,hlId),
    edges:DE.map(e=>({a:e[0],b:e[1],dir:true,lab:e[2],lpos:0.35,curve:rev.has(e[1]+">"+e[0])?(e[0]<e[1]?1:-1):0}))};
}
function gwDijkstra(n,DE,s){
  const INF=Infinity;
  const cost=Array.from({length:n},()=>Array(n).fill(INF));
  DE.forEach(e=>{ cost[e[0]][e[1]]=e[2]; });
  const dist=cost[s].slice(); dist[s]=0;
  const found=Array(n).fill(false); found[s]=true;
  const settle=[]; let tie=false;
  for(let i=0;i<n-1;i++){
    let u=-1, m=INF;
    for(let w=0;w<n;w++) if(!found[w]&&dist[w]<m){ m=dist[w]; u=w; }
    for(let w=0;w<n;w++) if(!found[w]&&w!==u&&dist[w]===m) tie=true;
    if(u<0) break;
    found[u]=true; settle.push(u);
    for(let w=0;w<n;w++) if(!found[w]&&dist[u]+cost[u][w]<dist[w]) dist[w]=dist[u]+cost[u][w];
  }
  return {dist:dist, settle:settle, tie:tie};
}
function gwBuildDir(n){
  let DE, res, guard=300;
  while(guard-->0){
    DE=[]; const seen=new Set();
    for(let v=1;v<n;v++){ const u=Math.floor(Math.random()*v); DE.push([u,v]); seen.add(u+">"+v); }
    let extra=3, g2=60;
    while(extra>0&&g2-->0){ const a=Math.floor(Math.random()*n), b=Math.floor(Math.random()*n);
      if(a===b||seen.has(a+">"+b)) continue; DE.push([a,b]); seen.add(a+">"+b); extra--; }
    const ws=gwDistinct(DE.length);
    DE=DE.map((e,i)=>[e[0],e[1],ws[i]]).sort((p,q)=>p[0]-q[0]||p[1]-q[1]);
    res=gwDijkstra(n,DE,0);
    const direct={}; DE.forEach(e=>{ if(e[0]===0) direct[e[1]]=e[2]; });
    let indirect=false;
    for(let w=1;w<n;w++) if(res.dist[w]<Infinity && res.dist[w]!==(direct[w]!==undefined?direct[w]:Infinity)) indirect=true;
    if(!res.tie && res.settle.length===n-1 && indirect) break;
  }
  return DE;
}
/* --- G37. 가중치와 MST 기초 (유닛 A) --- */
function genG37(){
  const qtype=pick(["cost","ecount","minimize","greedy"]);
  if(qtype==="minimize"){
    const ans="간선 가중치의 합";
    return {id:"G37",qtype:qtype,params:{ans:ans},
      stem:'<b>최소 비용 신장 트리</b>가 "최소"로 만드는 것은?',
      okfb:'간선 수는 어떤 신장 트리든 n−1개로 같다 — 겨루는 것은 가중치의 합이다.',
      choices:[
        {text:ans,correct:true},
        {text:"간선의 개수",correct:false,mc:"count-myth",fb:"간선 수는 어느 신장 트리나 n−1개 — 차이가 없다."},
        {text:"정점의 개수",correct:false,mc:"vertex-myth",fb:"신장 트리는 정의상 모든 정점을 포함한다."},
        {text:"트리의 깊이",correct:false,mc:"depth-myth",fb:"깊이는 조건에 없다 — 비용의 합만 본다."}]};
  }
  if(qtype==="greedy"){
    const ans="한 번 내린 결정을 번복하지 않는다";
    return {id:"G37",qtype:qtype,params:{ans:ans},
      stem:'Kruskal과 Prim이 쓰는 <b>greedy method</b>의 특징으로 옳은 것은?',
      okfb:'단계마다 그 시점의 최선을 고르고, 한 번 내린 결정은 번복하지 않는다.',
      choices:[
        {text:ans,correct:true},
        {text:"모든 경우를 전부 나열해 비교한다",correct:false,mc:"brute-myth",fb:"전수 조사가 아니다 — 단계별 최선 선택이다."},
        {text:"결과가 나쁘면 되돌아가 다시 고른다",correct:false,mc:"backtrack-myth",fb:"백트래킹이 아니다 — 번복 불가가 greedy의 특징이다."},
        {text:"무작위로 골라 평균을 낸다",correct:false,mc:"random-myth",fb:"무작위가 아니라 판단 기준에 따른 최선이다."}]};
  }
  if(qtype==="ecount"){
    const n=pick([5,6]), extra=pick([2,3]), E=gwBuild(n,extra);
    const ans=String(n-1);
    return {id:"G37",qtype:qtype,params:{n:n,edges:gwEdgeStr(E),ans:ans},viz:gwViz(n,E),mono:true,
      stem:'그림의 가중치 그래프(정점 '+n+'개, 간선 '+E.length+'개)에서 <b>최소 비용 신장 트리</b>가 갖는 간선 수는?',
      okfb:'신장 트리라면 비용과 무관하게 정점 수 − 1 = '+ans+'개다.',
      choices:g2Fill([
        {text:String(E.length),correct:false,mc:"all-edges",fb:"간선 전부가 아니라 트리를 이루는 최소한이다."},
        {text:String(n),correct:false,mc:"vertex-confuse",fb:"정점 수만큼 이으면 사이클이 생긴다."},
        {text:String(E.length-1),correct:false,mc:"count-slip",fb:"그래프 간선 수가 아니라 정점 수에서 1을 뺀다."}
      ],{text:ans,correct:true},4)};
  }
  /* cost — 표시된 신장 트리의 비용 합산 */
  const n=6, E=gwBuild(n,pick([2,3]));
  const K=gwKruskal(n,E);
  const hl=new Set(K.acc.map(e=>g8Key(e[0],e[1])));
  const total=K.total, ans=String(total);
  const wmin=Math.min.apply(null,K.acc.map(e=>e[2]));
  const allSum=E.reduce((s,e)=>s+e[2],0);
  const cands=[
    {text:String(total+wmin),correct:false,mc:"count-slip",fb:"굵은 간선만 골라 다시 더해 보라."},
    {text:String(total-wmin),correct:false,mc:"count-slip2",fb:"하나를 빠뜨렸다 — 굵은 간선은 "+(n-1)+"개다."}
  ];
  if(allSum!==total+wmin) cands.push({text:String(allSum),correct:false,mc:"all-edges",fb:"그래프 전체가 아니라 표시된 트리 간선만 더한다."});
  return {id:"G37",qtype:qtype,params:{n:n,edges:gwEdgeStr(E),ans:ans},viz:gwViz(n,E,{hl:hl}),mono:true,
    stem:'그림에서 <b>굵게 표시된 간선들</b>이 신장 트리를 이룬다. 이 신장 트리의 <b>비용</b>은?',
    okfb:'트리 간선 '+K.acc.map(e=>e[2]).sort((a,b)=>a-b).join("+")+' = '+ans+'.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}
/* --- G38. Kruskal (유닛 B) --- */
function gwBuildRej(n){
  let E, K, guard=200;
  while(guard-->0){ E=gwBuild(n,3); K=gwKruskal(n,E);
    if(K.rej.length>=1) break; }
  return {E:E,K:K};
}
function genG38(){
  const qtype=pick(["kth","firstrej","total","whyrej"]);
  if(qtype==="whyrej"){
    const ans="두 끝점이 이미 같은 트리라 사이클이 생길 때";
    return {id:"G38",qtype:qtype,params:{ans:ans},
      stem:'Kruskal 알고리즘이 검토 중인 간선을 <b>거부</b>하는 경우는?',
      okfb:'싼 순서로 보되, 두 끝점이 이미 같은 팀(트리)이면 사이클 — 거부한다.',
      choices:[
        {text:ans,correct:true},
        {text:"가중치가 지금까지 채택분의 평균보다 클 때",correct:false,mc:"avg-myth",fb:"가중치의 절대 크기가 아니라 사이클 여부로 판정한다."},
        {text:"간선이 정점 번호가 큰 쪽 끝에 닿아 있을 때",correct:false,mc:"index-myth",fb:"번호는 판정과 무관하다."},
        {text:"이미 n−1개를 넘겨 더 채택할 수 없게 될 때",correct:false,mc:"count-myth",fb:"n−1개가 되는 순간 알고리즘 자체가 끝난다 — 도중 거부의 이유는 사이클이다."}]};
  }
  const n=6, bk=gwBuildRej(n), E=bk.E, K=bk.K;
  if(qtype==="firstrej"){
    const r=K.rej[0], ans=gwPair(r);
    const cands=K.acc.slice(1,4).map(e=>({text:gwPair(e),correct:false,mc:"acc-confuse",fb:"그 간선은 채택된다 — 두 끝점이 아직 다른 팀이다."}));
    return {id:"G38",qtype:qtype,params:{n:n,edges:gwEdgeStr(E),ans:ans},viz:gwViz(n,E),mono:true,
      stem:'그림의 가중치 그래프에 Kruskal을 적용할 때, <b>처음으로 거부되는</b> 간선은? (간선을 싼 순서로 검토한다)',
      okfb:'싼 순서로 채택해 가다 '+ans+'에서 처음으로 두 끝점이 같은 팀이 된다 — 거부.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(qtype==="total"){
    const ans=String(K.total), wr=K.rej[0][2];
    const cands=[
      {text:String(K.total+wr),correct:false,mc:"rej-add",fb:"거부된 간선은 비용에 들어가지 않는다."},
      {text:String(E.reduce((s,e)=>s+e[2],0)),correct:false,mc:"all-edges",fb:"전체 간선이 아니라 채택된 n−1개만 더한다."},
      {text:String(K.total-Math.min.apply(null,K.acc.map(e=>e[2]))),correct:false,mc:"count-slip",fb:"채택 간선 "+(n-1)+"개를 빠짐없이 더하라."}
    ];
    return {id:"G38",qtype:qtype,params:{n:n,edges:gwEdgeStr(E),ans:ans},viz:gwViz(n,E),mono:true,
      stem:'그림의 가중치 그래프에서 Kruskal이 완성하는 <b>최소 비용 신장 트리의 총비용</b>은?',
      okfb:K.acc.map(e=>e[2]).sort((a,b)=>a-b).join("+")+' = '+ans+' — 거부된 간선은 계산에 없다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  /* kth — k번째 채택 */
  const k=pick([2,3,4]), e=K.acc[k-1], ans=gwPair(e);
  const S=E.slice().sort((a,b)=>a[2]-b[2]);
  const cands=[];
  if(S[k-1] && g8Key(S[k-1][0],S[k-1][1])!==g8Key(e[0],e[1]))
    cands.push({text:gwPair(S[k-1]),correct:false,mc:"rej-blind",fb:"정렬 순서 k번째와 채택 k번째는 다르다 — 도중의 거부를 세지 않았는가."});
  if(K.acc[k]) cands.push({text:gwPair(K.acc[k]),correct:false,mc:"off-by-one",fb:"그건 "+(k+1)+"번째 채택이다."});
  if(K.acc[k-2]) cands.push({text:gwPair(K.acc[k-2]),correct:false,mc:"off-by-one2",fb:"그건 "+(k-1)+"번째 채택이다."});
  cands.push({text:gwPair(E.reduce((m,x)=>x[2]>m[2]?x:m)),correct:false,mc:"max-guess",fb:"가장 비싼 간선은 마지막까지 검토조차 안 될 수 있다."});
  return {id:"G38",qtype:qtype,params:{n:n,edges:gwEdgeStr(E),k:k,ans:ans},viz:gwViz(n,E),mono:true,
    stem:'그림의 가중치 그래프에 Kruskal을 적용할 때, <b>'+k+'번째로 채택되는</b> 간선은?',
    okfb:'채택 순서: '+K.acc.slice(0,k).map(gwPair).join(" → ")+'.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}
/* --- G39. Prim (유닛 C) --- */
function genG39(){
  const qtype=pick(["kth","join","same","center"]);
  if(qtype==="center"){
    const ans="언제나 하나의 트리를 정점 단위로 키운다";
    return {id:"G39",qtype:qtype,params:{ans:ans},
      stem:'<b>Prim</b>이 Kruskal과 다른 점으로 옳은 것은?',
      okfb:'Kruskal은 간선을 전역에서 싼 순으로(숲이 여럿), Prim은 한 정점에서 시작해 트리 하나를 키운다.',
      choices:[
        {text:ans,correct:true},
        {text:"간선을 전부 정렬해 놓고 시작한다",correct:false,mc:"kruskal-confuse",fb:"그것은 Kruskal — Prim은 트리에 닿은 간선만 비교한다."},
        {text:"사이클을 허용한다",correct:false,mc:"cycle-myth",fb:"어느 방법이든 트리를 만든다 — 사이클은 없다."},
        {text:"결과 비용이 Kruskal보다 항상 작다",correct:false,mc:"better-myth",fb:"둘 다 최소 비용 — 결과 비용은 같다."}]};
  }
  const n=6, E=gwBuild(n,3), P=gwPrim(n,E,0);
  if(qtype==="same"){
    const K=gwKruskal(n,E), ans="같다 — "+K.total;
    return {id:"G39",qtype:qtype,params:{n:n,edges:gwEdgeStr(E),ans:ans},viz:gwViz(n,E),mono:true,
      stem:'그림의 그래프에서 Kruskal이 만든 최소 비용 신장 트리의 총비용이 <b>'+K.total+'</b>이었다. <b>Prim(정점 0에서 시작)</b>이 만드는 트리의 총비용은?',
      okfb:'가중치가 전부 다르면 최소 비용 신장 트리는 유일 — 어느 방법이든 같은 트리, 같은 비용('+K.total+')이다.',
      choices:g2Fill([
        {text:"더 크다 — "+(K.total+P.acc[0][2]),correct:false,mc:"diff-myth",fb:"둘 다 '최소' 비용을 찾는다 — 최소가 둘일 수는 없다."},
        {text:"더 작다 — "+(K.total-P.acc[P.acc.length-1][2]),correct:false,mc:"diff-myth2",fb:"Kruskal의 결과도 이미 최소다."},
        {text:"시작 정점에 따라 달라진다",correct:false,mc:"start-myth",fb:"가중치가 전부 다르면 어느 시작점이든 같은 트리에 도달한다."}
      ],{text:ans,correct:true},4)};
  }
  if(qtype==="join"){
    const k=pick([2,3,4]), ans=String(P.joins[k-1]);
    const cands=[];
    if(P.joins[k]!==undefined) cands.push({text:String(P.joins[k]),correct:false,mc:"off-by-one",fb:"그 정점은 "+(k+1)+"번째로 붙는다."});
    if(P.joins[k-2]!==undefined&&String(P.joins[k-2])!==ans) cands.push({text:String(P.joins[k-2]),correct:false,mc:"off-by-one2",fb:"그 정점은 "+(k-1)+"번째로 붙는다."});
    for(let v=1;v<n&&cands.length<3;v++) if(String(v)!==ans&&!cands.find(c=>c.text===String(v))) cands.push({text:String(v),correct:false,mc:"trace-slip",fb:"트리에 닿은 간선 중 최저 비용부터 다시 짚어 보라."});
    return {id:"G39",qtype:qtype,params:{n:n,edges:gwEdgeStr(E),k:k,ans:ans},viz:gwViz(n,E,{hl:new Set()}),mono:true,
      stem:'그림의 그래프에서 <b>Prim(정점 0에서 시작)</b>을 실행할 때, 트리에 <b>'+k+'번째로 합류하는 정점</b>은? (0은 세지 않는다)',
      okfb:'합류 순서: 0 → '+P.joins.slice(0,k).join(" → ")+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  /* kth — k번째 채택 간선 */
  const k=pick([2,3]), e=P.acc[k-1], ans=gwPair(e);
  const K=gwKruskal(n,E);
  const cands=[];
  if(K.acc[k-1]&&g8Key(K.acc[k-1][0],K.acc[k-1][1])!==g8Key(e[0],e[1]))
    cands.push({text:gwPair(K.acc[k-1]),correct:false,mc:"kruskal-confuse",fb:"그건 Kruskal의 순서 — Prim은 트리에 닿은 간선만 고른다."});
  if(P.acc[k]) cands.push({text:gwPair(P.acc[k]),correct:false,mc:"off-by-one",fb:"그건 "+(k+1)+"번째 채택이다."});
  if(P.acc[k-2]) cands.push({text:gwPair(P.acc[k-2]),correct:false,mc:"off-by-one2",fb:"그건 "+(k-1)+"번째 채택이다."});
  cands.push({text:gwPair(E.reduce((m,x)=>x[2]<m[2]?x:m)),correct:false,mc:"min-guess",fb:"전체 최저 간선이라도 트리에 닿아 있지 않으면 아직 못 고른다."});
  return {id:"G39",qtype:qtype,params:{n:n,edges:gwEdgeStr(E),k:k,ans:ans},viz:gwViz(n,E),mono:true,
    stem:'그림의 그래프에서 <b>Prim(정점 0에서 시작)</b>이 <b>'+k+'번째로 채택하는</b> 간선은?',
    okfb:'채택 순서: '+P.acc.slice(0,k).map(gwPair).join(" → ")+' — 매번 트리에 닿은 최저 비용 간선이다.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}
/* --- G40. Dijkstra (유닛 D) --- */
function genG40(){
  const qtype=pick(["first","dist","init","inf"]);
  if(qtype==="init"){
    const ans="출발점에서 각 정점으로 가는 직행 간선의 비용";
    return {id:"G40",qtype:qtype,params:{ans:ans},
      stem:'Dijkstra에서 <span class="mono">distance</span> 배열의 <b>초깃값</b>은?',
      okfb:'distance[i] = cost[v0][i] — 아직 아무 정점도 거치지 않은 직행 비용에서 시작한다.',
      choices:[
        {text:ans,correct:true},
        {text:"모든 정점이 일괄적으로 0에서 시작한다",correct:false,mc:"zero-myth",fb:"0이면 갱신이 일어나지 않는다 — 직행 비용(없으면 무한대)으로 시작한다."},
        {text:"모든 정점이 똑같이 무한대에서 시작한다",correct:false,mc:"inf-slip",fb:"직행 간선이 있는 정점은 그 비용으로 시작한다(출발점 자신은 0)."},
        {text:"각 정점의 번호를 그대로 초깃값으로 쓴다",correct:false,mc:"index-myth",fb:"번호는 비용과 무관하다."}]};
  }
  if(qtype==="inf"){
    const ans="간선이 없다는 뜻 — 실제 비용보다 큰 값";
    return {id:"G40",qtype:qtype,params:{ans:ans},
      stem:'교재의 비용 인접 행렬에서 <b>1000</b> 같은 큰 수가 하는 역할은?',
      okfb:'간선이 없는 자리를 "무한대"로 표시한 것 — 다만 덧셈이 overflow하지 않을 만큼으로 잡는다.',
      choices:[
        {text:ans,correct:true},
        {text:"그래프에서 가장 비싼 간선의 실제 비용",correct:false,mc:"real-myth",fb:"실제 비용이 아니라 '길이 없음'의 표시다."},
        {text:"정점 수를 제곱해 얻는 행렬 크기 상한",correct:false,mc:"formula-myth",fb:"크기에 특별한 공식은 없다 — 충분히 크되 overflow만 피하면 된다."},
        {text:"확정된 정점을 표시하는 값의 다른 이름",correct:false,mc:"visited-confuse",fb:"확정 표시는 found 배열의 몫이다."}]};
  }
  const n=5, DE=gwBuildDir(n), R=gwDijkstra(n,DE,0);
  if(qtype==="first"){
    const ans=String(R.settle[0]);
    const cands=[];
    if(R.settle[1]!==undefined) cands.push({text:String(R.settle[1]),correct:false,mc:"off-by-one",fb:"그 정점은 두 번째로 확정된다."});
    for(let v=1;v<n&&cands.length<3;v++) if(String(v)!==ans&&!cands.find(c=>c.text===String(v))) cands.push({text:String(v),correct:false,mc:"trace-slip",fb:"미확정 정점 중 distance가 가장 작은 것을 고른다 — 직행 비용을 다시 보라."});
    return {id:"G40",qtype:qtype,params:{n:n,dedges:gwDedgeStr(DE),ans:ans},viz:gwVizDir(n,DE,0),mono:true,
      stem:'그림의 방향 가중치 그래프에서 <b>Dijkstra(출발 0)</b>가 출발점 다음으로 <b>가장 먼저 확정하는 정점</b>은?',
      okfb:'미확정 중 distance 최소 — 직행 비용이 가장 싼 정점 '+ans+'이(가) 먼저 확정된다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  /* dist — 최종 distance[x] */
  const cand=[]; for(let v=1;v<n;v++) if(R.dist[v]<Infinity) cand.push(v);
  const x=pick(cand), ans=String(R.dist[x]);
  const direct={}; DE.forEach(e=>{ if(e[0]===0) direct[e[1]]=e[2]; });
  const cands=[];
  if(direct[x]!==undefined&&direct[x]!==R.dist[x]) cands.push({text:String(direct[x]),correct:false,mc:"direct-only",fb:"직행보다 싼 경유 길이 있다 — 갱신을 놓쳤다."});
  cands.push({text:String(R.dist[x]+Math.min.apply(null,DE.map(e=>e[2]))),correct:false,mc:"count-slip",fb:"경로 위 간선 가중치만 정확히 더하라."});
  cands.push({text:"∞ (도달 불가)",correct:false,mc:"inf-myth",fb:"0에서 닿는 길이 있다 — 그림의 화살표를 따라가 보라."});
  return {id:"G40",qtype:qtype,params:{n:n,dedges:gwDedgeStr(DE),x:x,ans:ans},viz:gwVizDir(n,DE,x),mono:true,
    stem:'그림의 방향 가중치 그래프에서 <b>Dijkstra(출발 0)</b>가 끝난 뒤 <span class="mono">distance['+x+']</span>의 값은?',
    okfb:'0에서 '+x+'까지의 최단 경로 길이(가중치 합) = '+ans+'.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}
/* --- AP10. 심화 — union-find / Floyd 개념 / 위상 정렬 (도발장 6) --- */
function genAP10ch(idx){
  if(idx===0){
    /* union-find 판정: Kruskal 진행 중 다음 간선 채택/거부 */
    const n=6, bk=gwBuildRej(n), E=bk.E, K=bk.K;
    const ks=pick([2,3,4]);                       /* 앞 ks개 처리 후 다음 검토 간선 */
    const done=K.order.slice(0,ks), next=K.order[ks];
    const accSoFar=done.filter(o=>o.ok).map(o=>o.e);
    const hl=new Set(accSoFar.map(e=>g8Key(e[0],e[1])));
    const ans=next.ok?"채택 — 두 끝점이 서로 다른 트리(팀)에 있다":"거부 — 두 끝점이 이미 같은 트리(팀)라 사이클이 생긴다";
    return {id:"AP10",qtype:"uf",params:{n:n,edges:gwEdgeStr(E),k:ks,ans:ans},viz:gwViz(n,E,{hl:hl}),mono:true,
      stem:'[심화 — 팀 표시] Kruskal 진행 중이다. 지금까지 채택된 간선은 굵게 표시했다. 다음으로 검토하는 간선 <b>'+gwPair(next.e)+'</b>은 어떻게 되는가?',
      okfb:(next.ok?'끝점이 서로 다른 팀 — 채택하고 두 팀을 합친다.':'끝점 '+next.e[0]+'과 '+next.e[1]+'은 굵은 간선으로 이미 이어져 있다(같은 팀) — 거부.')+' 이 "팀 표시"를 배열로 구현한 것이 union-find다.',
      choices:g2Fill([
        {text:next.ok?"거부 — 두 끝점이 이미 같은 트리(팀)라 사이클이 생긴다":"채택 — 두 끝점이 서로 다른 트리(팀)에 있다",correct:false,mc:"team-flip",fb:"굵은 간선만 따라가며 두 끝점이 이어져 있는지 확인하라."},
        {text:"채택 — 남은 간선 중 가장 싸므로 무조건 채택된다",correct:false,mc:"cheap-myth",fb:"싼 순서로 '검토'할 뿐 — 채택은 팀 판정이 결정한다."},
        {text:"거부 — 가중치가 지금까지의 평균보다 크다",correct:false,mc:"avg-myth",fb:"가중치 크기가 아니라 사이클 여부로 판정한다."}
      ],{text:ans,correct:true},4)};
  }
  if(idx===1){
    /* Floyd 개념: 경유 정점 허용 시 갱신 */
    let a,b,via,dab,davia,dviab,guard=100;
    do{ dab=pick([40,45,50,60,999]); davia=5+Math.floor(Math.random()*20); dviab=5+Math.floor(Math.random()*20); }
    while(guard-->0 && davia+dviab>=dab);
    a=0; via=1; b=2;
    const ans=String(davia+dviab);
    const mat=[[0,davia,dab],[999,0,dviab],[999,999,0]];
    return {id:"AP10",qtype:"floyd",params:{dab:dab,davia:davia,dviab:dviab,ans:ans},mono:true,
      viz:{type:"adjmat", m:mat.map(r=>r.map(v=>v===999?"∞":v)), labels:["0","1","2"], hi:{r:0,c:2}},
      stem:'[심화 — 모든 쌍의 최단 경로(Floyd)] Dijkstra는 <b>한 출발점</b> 기준이다. 「<b>모든 쌍</b>의 최단 거리」가 필요하면 Floyd 알고리즘을 쓴다 — 발상은 하나: 거리 표를 놓고 <b>경유지를 한 정점씩 허용</b>하며, 칸마다 min(기존 거리, 경유지까지 + 경유지에서부터)로 갱신한다. 직행 비용이 표와 같을 때(∞=길 없음, 0→2 직행 '+(dab===999?"없음":dab)+'), 정점 <b>1을 경유지로 허용</b>하면 0→2의 최단 비용은?',
      okfb:'min(직행'+(dab===999?" ∞":" "+dab)+', 0→1→2 = '+davia+'+'+dviab+') = '+ans+'. 모든 쌍에 대해 경유지를 하나씩 늘려 가는 것이 Floyd 알고리즘이다 — Dijkstra를 정점마다 돌리는 것과 견주어 보라.',
      choices:g2Fill([
        {text:dab===999?"∞ (불가능)":String(dab),correct:false,mc:"direct-only",fb:"경유를 허용했다 — 0→1→2를 계산해 보라."},
        {text:String(davia),correct:false,mc:"half-path",fb:"그건 0→1까지 — 1→2 구간을 마저 더한다."},
        {text:String(Math.abs(dviab-davia)+1),correct:false,mc:"op-slip",fb:"경로 길이는 구간 비용의 합이다."}
      ],{text:ans,correct:true},4)};
  }
  /* idx 2 — 위상 정렬 */
  const n=5;
  let DE, perm;
  perm=[0,1,2,3,4];
  for(let i=perm.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=perm[i]; perm[i]=perm[j]; perm[j]=t; }
  DE=[]; const seen=new Set();
  for(let k=1;k<n;k++){ const pi=Math.floor(Math.random()*k); DE.push([perm[pi],perm[k]]); seen.add(perm[pi]+">"+perm[k]); }
  let extra=2, g3=40;
  while(extra>0&&g3-->0){ const i=Math.floor(Math.random()*(n-1)), j2=i+1+Math.floor(Math.random()*(n-1-i));
    if(seen.has(perm[i]+">"+perm[j2])) continue; DE.push([perm[i],perm[j2]]); seen.add(perm[i]+">"+perm[j2]); extra--; }
  DE.sort((p,q)=>p[0]-q[0]||p[1]-q[1]);
  /* Kahn(번호 작은 것 우선)으로 유효 순서 */
  const indeg=Array(n).fill(0); DE.forEach(e=>indeg[e[1]]++);
  const order=[], used=Array(n).fill(false);
  for(let step=0;step<n;step++){
    for(let v=0;v<n;v++){ if(!used[v]&&indeg[v]===0){ used[v]=true; order.push(v); DE.forEach(e=>{ if(e[0]===v) indeg[e[1]]--; }); break; } }
  }
  const ans=order.join(" → ");
  const bad=()=>{ /* 유효 순서를 하나 골라 제약 쌍을 뒤집어 위반 배열 생성 */
    const o=order.slice(); const e=DE[Math.floor(Math.random()*DE.length)];
    const ia=o.indexOf(e[0]), ib=o.indexOf(e[1]); const t=o[ia]; o[ia]=o[ib]; o[ib]=t;
    return o.join(" → ");
  };
  const cands=[]; let g4=30;
  while(cands.length<3&&g4-->0){ const s=bad(); if(s!==ans&&!cands.find(c=>c.text===s)) cands.push({text:s,correct:false,mc:"edge-violate",fb:"화살표를 하나하나 확인하라 — 앞서야 할 작업이 뒤에 있다."}); }
  return {id:"AP10",qtype:"topo",params:{n:n,dedges:DE.map(e=>e[0]+">"+e[1]).join(","),ans:ans},viz:{type:"graph", nodes:g8Nodes(n),
      edges:DE.map(e=>({a:e[0],b:e[1],dir:true}))},mono:true,
    stem:'[심화 — 위상 정렬] 새 개념 하나를 소개한다. 방향 그래프의 화살표 a → b가 「a를 마쳐야 b를 할 수 있다」는 <b>선후 관계</b>일 때(선수 과목, 작업 공정), 모든 화살표를 지키도록 작업을 한 줄로 세운 것을 <b>위상 정렬(topological sort)</b>이라 한다. 구하는 법: 남은 작업 중 <b>「나를 가리키는 화살표의 출발점이 전부 끝난」 작업</b>(선행이 다 끝난 작업)을 하나 꺼내 적고, 그 작업에서 나가는 화살표는 지운 셈 치고 — 반복한다(사이클이 있으면 이런 순서는 없다). 그림의 그래프에서 <b>모든 화살표를 지키는 순서</b>는? (선행이 다 끝난 작업이 여럿이면 번호가 작은 작업부터)',
    okfb:'규칙대로 — 선행이 전부 끝난 작업을 번호 순으로 하나씩 꺼내면 '+ans+' — 이것이 위상 정렬이다. 사이클이 있으면 이런 순서는 존재하지 않는다.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}

/* ================================================================
   6장(A) 단순 정렬 — G41 어휘·안정성 / G42 선택 / G43 버블 / G44 삽입 / AP11 심화(셸·이동 계수·안정성 실전)
   params: arr="26,5,..."(배열) + ans — 테스트 독립 재검산용(자체 정렬 시뮬)
   ================================================================ */
function srArr(n){
  const pool=[]; for(let v=1;v<=99;v++) pool.push(v);
  for(let i=pool.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=pool[i]; pool[i]=pool[j]; pool[j]=t; }
  return pool.slice(0,n);
}
function srStr(a){ return a.join(", "); }
function srSelStates(a){
  const arr=a.slice(), n=arr.length, states=[];
  for(let i=0;i<n-1;i++){ let least=i;
    for(let j=i+1;j<n;j++) if(arr[j]<arr[least]) least=j;
    const t=arr[i]; arr[i]=arr[least]; arr[least]=t;
    states.push(arr.slice());
  }
  return states;
}
function srBubStates(a){
  const arr=a.slice(), n=arr.length, states=[], swapsPer=[];
  for(let i=n-1;i>0;i--){ let s=0;
    for(let j=0;j<i;j++) if(arr[j]>arr[j+1]){ const t=arr[j]; arr[j]=arr[j+1]; arr[j+1]=t; s++; }
    states.push(arr.slice()); swapsPer.push(s);
  }
  return {states:states, swapsPer:swapsPer};
}
function srInsStates(a){
  const arr=a.slice(), n=arr.length, states=[], moves=[];
  for(let i=1;i<n;i++){ const next=arr[i]; let j=i-1, m=0;
    while(j>=0 && next<arr[j]){ arr[j+1]=arr[j]; j--; m++; }
    arr[j+1]=next; states.push(arr.slice()); moves.push(m);
  }
  return {states:states, moves:moves};
}
function srViz(a,hi,done){ return {type:"arr", a:a.slice(), hi:hi||[], done:done||[]}; }
/* --- G41. 정렬의 어휘 (유닛 A) --- */
function genG41(){
  const qtype=pick(["key","inout","stable","whynosingle"]);
  if(qtype==="key"){
    const ans="키(key) — 레코드를 식별하는 기준 필드";
    return {id:"G41",qtype:qtype,params:{ans:ans},
      stem:'전화번호부에서 레코드를 찾거나 정렬할 때 <b>기준이 되는 필드</b>를 무엇이라 하는가?',
      okfb:'이름·번호 같은 기준 필드가 키 — 정렬은 키의 순서로 레코드를 다시 세우는 일이다.',
      choices:[
        {text:ans,correct:true},
        {text:"레코드(record) — 객체 하나에 대한 정보 전체",correct:false,mc:"record-confuse",fb:"레코드는 한 사람의 정보 전체 — 기준이 되는 것은 그 안의 한 필드다."},
        {text:"리스트(list) — 레코드들을 모아 놓은 것",correct:false,mc:"list-confuse",fb:"리스트는 모임 전체 — 기준 필드가 아니다."},
        {text:"파일(file) — 외부에 저장된 정보의 모임",correct:false,mc:"file-confuse",fb:"파일은 저장 위치의 이야기 — 기준 필드가 아니다."}]};
  }
  if(qtype==="inout"){
    const ext=Math.random()<0.5;
    const ans=ext?"외부 정렬 — 보조 기억장치를 오가며 정렬한다":"내부 정렬 — 주기억장치 안에서 전부 정렬한다";
    return {id:"G41",qtype:qtype,params:{ans:ans},
      stem:ext?'데이터가 너무 많아 <b>주기억장치에 전부 올릴 수 없는</b> 경우의 정렬은?':'리스트가 작아 <b>주기억장치에 전부 올려놓고</b> 정렬할 수 있는 경우의 정렬은?',
      okfb:ext?'다 못 올리면 외부 정렬 — 보조 기억장치와 오가며 정렬한다.':'다 올라가면 내부 정렬 — 이번 장의 정렬들은 모두 내부 정렬이다.',
      choices:[
        {text:ans,correct:true},
        {text:ext?"내부 정렬 — 주기억장치 안에서 전부 정렬한다":"외부 정렬 — 보조 기억장치를 오가며 정렬한다",correct:false,mc:"inout-flip",fb:"주기억장치에 다 들어가느냐가 기준이다."},
        {text:"안정 정렬 — 같은 키의 순서를 보존하며 정렬한다",correct:false,mc:"stable-confuse",fb:"안정성은 같은 키의 순서 이야기 — 저장 위치와 무관하다."},
        {text:"선형 정렬 — 배열을 한 줄로 늘어놓고 정렬한다",correct:false,mc:"made-up",fb:"그런 분류는 없다 — 내부/외부는 메모리 기준이다."}]};
  }
  if(qtype==="stable"){
    const ans="같은 키를 가진 레코드들의 원래 순서가 보존된다";
    return {id:"G41",qtype:qtype,params:{ans:ans},
      stem:'정렬이 <b>안정(stable)</b>하다는 것의 뜻은?',
      okfb:'이름순 명단을 학년순으로 다시 정렬해도, 같은 학년 안에서는 이름순이 남아 있는 성질이다.',
      choices:[
        {text:ans,correct:true},
        {text:"어떤 입력에도 실행 시간이 흔들리지 않는다",correct:false,mc:"time-confuse",fb:"시간의 안정이 아니라 같은 키의 순서 이야기다."},
        {text:"정렬 도중 프로그램이 중단되지 않는다",correct:false,mc:"crash-confuse",fb:"오류 안정성이 아니라 순서 보존의 성질이다."},
        {text:"추가 메모리를 전혀 사용하지 않는다",correct:false,mc:"space-confuse",fb:"그건 제자리(in-place) 정렬의 이야기다."}]};
  }
  const ans="초기 순서와 크기에 따라 유불리가 달라지기 때문";
  return {id:"G41",qtype:qtype,params:{ans:ans},
    stem:'"모든 경우에 최상이 되는 <b>유일한 정렬 기법은 없다</b>"라고 하는 이유는?',
    okfb:'거의 정렬된 입력·작은 리스트·큰 레코드 — 상황마다 유리한 정렬이 다르다. 그래서 상대적 장단점 파악이 중요하다.',
    choices:[
      {text:ans,correct:true},
      {text:"아직 최상의 정렬이 발명되지 않았기 때문",correct:false,mc:"future-myth",fb:"발명의 문제가 아니라 상황마다 기준이 다른 것이다."},
      {text:"정렬마다 결과 배열이 조금씩 다르기 때문",correct:false,mc:"result-myth",fb:"올바른 정렬의 결과는 모두 같다 — 다른 것은 과정의 비용이다."},
      {text:"컴퓨터 기종마다 명령어가 다르기 때문",correct:false,mc:"hw-myth",fb:"기종이 아니라 입력의 성질(순서·크기)이 가르는 문제다."}]};
}
/* --- G42. 선택 정렬 (유닛 B) --- */
function genG42(){
  const qtype=pick(["pass1","passk","fixed","cmp"]);
  const n=pick([5,6]), a=srArr(n), st=srSelStates(a);
  if(qtype==="cmp"){
    const ans=String(n*(n-1)/2);
    return {id:"G42",qtype:qtype,params:{n:n,arr:a.join(","),ans:ans},viz:srViz(a),mono:true,
      stem:'그림의 배열(원소 '+n+'개)이 <b>이미 정렬되어 있더라도</b>, 선택 정렬이 수행하는 총 <b>비교 횟수</b>는?',
      okfb:'최솟값임을 "확인"하려면 남은 전부를 봐야 한다 — (n−1)+(n−2)+…+1 = '+ans+'회, 초기 상태와 무관하다.',
      choices:g2Fill([
        {text:String(n-1),correct:false,mc:"swap-confuse",fb:"n−1은 교환(회전) 수 — 비교는 회전마다 남은 전부와 한다."},
        {text:String(n*n),correct:false,mc:"square-slip",fb:"n²이 아니라 (n−1)+(n−2)+…+1이다."},
        {text:"0회 — 정렬되어 있으면 비교하지 않는다",correct:false,mc:"sorted-myth",fb:"정렬 여부를 미리 알 수 없다 — 확인 자체가 비교다."}
      ],{text:ans,correct:true},4)};
  }
  if(qtype==="fixed"){
    const k=pick([2,3]);
    const ans=srStr(st[k-1].slice(0,k));
    const sorted=a.slice().sort((x,y)=>x-y);
    return {id:"G42",qtype:qtype,params:{arr:a.join(","),k:k,ans:ans},viz:srViz(a),mono:true,
      stem:'그림의 배열에 선택 정렬을 적용할 때, <b>'+k+'회전이 끝난 직후</b> 앞에서부터 <b>정렬이 확정된 원소들</b>은? (앞 → 뒤)',
      okfb:'회전마다 남은 것 중 최솟값이 하나씩 앞에 확정된다 — '+k+'회전이면 가장 작은 '+k+'개: '+ans+'.',
      choices:g2Fill([
        {text:srStr(a.slice(0,k)),correct:false,mc:"orig-confuse",fb:"원래 앞 "+k+"개가 아니라 전체에서 가장 작은 "+k+"개가 확정된다."},
        {text:srStr(sorted.slice(0,k+1)),correct:false,mc:"off-by-one",fb:"그건 "+(k+1)+"회전의 결과다."},
        {text:srStr(sorted.slice(n-k)),correct:false,mc:"maxmin-flip",fb:"선택 정렬(최솟값 선택)은 작은 쪽부터 확정한다."}
      ],{text:ans,correct:true},4)};
  }
  const k=(qtype==="pass1")?1:pick([2,3]);
  let a2=a, st2=st, guard=80;
  while(guard-->0 && srStr(st2[k-1])===srStr(a2)){ a2=srArr(n); st2=srSelStates(a2); }  /* 회전이 배열을 바꾸는 입력만 */
  const ans=srStr(st2[k-1]);
  const bub=srBubStates(a2).states;
  const cands=[];
  if(srStr(bub[k-1])!==ans) cands.push({text:srStr(bub[k-1]),correct:false,mc:"bubble-confuse",fb:"그건 버블 정렬의 "+k+"회전 결과 — 선택은 최솟값을 찾아 '한 번' 교환한다."});
  if(st2[k]&&srStr(st2[k])!==ans) cands.push({text:srStr(st2[k]),correct:false,mc:"off-by-one",fb:"그건 "+(k+1)+"회전 후의 모습이다."});
  const sorted=srStr(a2.slice().sort((x,y)=>x-y));
  if(sorted!==ans) cands.push({text:sorted,correct:false,mc:"final-confuse",fb:"완전히 정렬된 최종 결과다 — 물은 것은 "+k+"회전 직후다."});
  cands.push({text:srStr(a2),correct:false,mc:"no-change",fb:"이 입력에서는 회전이 배열을 바꾼다 — 교환을 다시 짚어 보라."});
  const sw2=st2[k-1].slice(); if(sw2.length>k+1){ const t3=sw2[k]; sw2[k]=sw2[k+1]; sw2[k+1]=t3; }
  if(srStr(sw2)!==ans) cands.push({text:srStr(sw2),correct:false,mc:"near-slip",fb:"미정렬 구역의 순서는 건드리지 않는다 — 교환된 두 자리만 달라진다."});
  { /* 형태 무관 보충 오답 — 이웃 값 교환 변형 (후보 붕괴 방지) */
    const mk=(arr,i2)=>{ const c=arr.slice(); const t3=c[i2]; c[i2]=c[i2+1]; c[i2+1]=t3; return srStr(c); };
    const base=ans.split(", ").map(Number);
    for(const i2 of [0,1,2]){
      if(cands.length>=3) break;
      if(i2+1>=base.length) break;
      const s3=mk(base,i2);
      if(s3!==ans && !cands.find(c=>c.text===s3)) cands.push({text:s3,correct:false,mc:"near-slip",fb:"이웃한 두 값이 뒤바뀌어 있다 — 결과를 한 칸씩 다시 짚어 보라."});
    }
  }
  return {id:"G42",qtype:qtype,params:{arr:a2.join(","),k:k,ans:ans},viz:srViz(a2),mono:true,
    stem:'그림의 배열에 <b>선택 정렬</b>을 적용할 때, <b>'+k+'회전이 끝난 직후</b>의 배열은? (회전 = 최솟값을 찾아 맨 앞 미정렬 자리와 교환)',
    okfb:k+'회전 후: '+ans+' — 남은 것 중 최솟값이 ['+(k-1)+'] 자리로 온다.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}
/* --- G43. 버블 정렬 (유닛 C) --- */
function genG43(){
  const qtype=pick(["pass1","last","swap1","early"]);
  if(qtype==="early"){
    const ans="이미 정렬에 가까운 입력";
    return {id:"G43",qtype:qtype,params:{ans:ans},
      stem:'"한 회전 동안 <b>교환이 한 번도 없으면</b> 정렬 완료로 보고 멈춘다"는 개선이 <b>가장 큰 이득</b>을 주는 입력은?',
      okfb:'거의 정렬된 입력이면 첫 한두 회전에 교환이 사라져 O(n) 수준에 끝난다.',
      choices:[
        {text:ans,correct:true},
        {text:"크기가 거꾸로 뒤집힌 역순 입력",correct:false,mc:"reverse-myth",fb:"역순이면 끝까지 교환이 이어진다 — 개선이 전혀 작동하지 않는다."},
        {text:"완전히 무작위로 섞인 입력",correct:false,mc:"random-myth",fb:"무작위면 거의 매 회전 교환이 있어 이득이 작다."},
        {text:"원소 수가 아주 많은 입력",correct:false,mc:"size-myth",fb:"크기가 아니라 초기 순서가 가르는 이득이다."}]};
  }
  const n=pick([5,6]), a=srArr(n), B=srBubStates(a);
  if(qtype==="last"){
    const ans=String(Math.max.apply(null,a));
    return {id:"G43",qtype:qtype,params:{arr:a.join(","),ans:ans},viz:srViz(a),mono:true,
      stem:'그림의 배열에 버블 정렬을 적용할 때, <b>1회전이 끝나면 맨 뒤에 확정되는</b> 값은?',
      okfb:'이웃 교환을 거치며 가장 큰 '+ans+'가 끝까지 떠밀려 간다 — 회전마다 최댓값이 하나씩 뒤에 확정된다.',
      choices:g2Fill([
        {text:String(Math.min.apply(null,a)),correct:false,mc:"minmax-flip",fb:"버블(오름차순)은 큰 값이 뒤로 떠오른다."},
        {text:String(a.slice().sort((x,y)=>x-y)[n-2]),correct:false,mc:"second-slip",fb:"두 번째로 큰 값은 2회전에서 확정된다."},
        {text:String(a[n-1]),correct:false,mc:"orig-confuse",fb:"원래 맨 뒤의 값이 아니라 전체 최댓값이 온다."}
      ],{text:ans,correct:true},4)};
  }
  if(qtype==="swap1"){
    const ans=String(B.swapsPer[0]);
    return {id:"G43",qtype:qtype,params:{arr:a.join(","),ans:ans},viz:srViz(a),mono:true,
      stem:'그림의 배열에 버블 정렬 <b>1회전</b>(이웃 비교 '+(n-1)+'번)을 수행할 때 일어나는 <b>교환의 횟수</b>는?',
      okfb:'이웃 쌍을 차례로 견주면 '+ans+'번 어긋나 교환된다 — 1회전 후 배열은 '+srStr(B.states[0])+'.',
      choices:g2Fill([
        {text:String(B.swapsPer[0]+1),correct:false,mc:"count-slip",fb:"이웃 비교를 처음부터 다시 세어 보라."},
        {text:String(Math.max(0,B.swapsPer[0]-1)),correct:false,mc:"count-slip2",fb:"교환 하나를 빠뜨렸다 — 큰 값이 연달아 밀려가는 구간을 보라."},
        {text:String(n-1),correct:false,mc:"cmp-confuse",fb:String(n-1)+"은 '비교'의 수 — 교환은 어긋난 쌍에서만 일어난다."}
      ],{text:ans,correct:true},4)};
  }
  let a2=a, B2=B, guard=80;
  while(guard-->0 && (B2.swapsPer[0]===0 || srStr(B2.states[0])===srStr(a2))){ a2=srArr(n); B2=srBubStates(a2); }
  const ans=srStr(B2.states[0]);
  const sel=srSelStates(a2);
  const cands=[];
  if(srStr(sel[0])!==ans) cands.push({text:srStr(sel[0]),correct:false,mc:"select-confuse",fb:"그건 선택 정렬의 1회전 — 버블은 이웃끼리만 교환한다."});
  if(B2.states[1]&&srStr(B2.states[1])!==ans) cands.push({text:srStr(B2.states[1]),correct:false,mc:"off-by-one",fb:"그건 2회전 후의 모습이다."});
  const sorted=srStr(a2.slice().sort((x,y)=>x-y));
  if(sorted!==ans) cands.push({text:sorted,correct:false,mc:"final-confuse",fb:"최종 결과가 아니라 1회전 직후를 물었다."});
  cands.push({text:srStr(a2),correct:false,mc:"no-change",fb:"어긋난 이웃이 있는 한 1회전에서 배열은 달라진다."});
  { /* 형태 무관 보충 오답 — 이웃 값 교환 변형 (후보 붕괴 방지) */
    const mk=(arr,i2)=>{ const c=arr.slice(); const t3=c[i2]; c[i2]=c[i2+1]; c[i2+1]=t3; return srStr(c); };
    const base=ans.split(", ").map(Number);
    for(const i2 of [0,1,2]){
      if(cands.length>=3) break;
      if(i2+1>=base.length) break;
      const s3=mk(base,i2);
      if(s3!==ans && !cands.find(c=>c.text===s3)) cands.push({text:s3,correct:false,mc:"near-slip",fb:"이웃한 두 값이 뒤바뀌어 있다 — 결과를 한 칸씩 다시 짚어 보라."});
    }
  }
  return {id:"G43",qtype:qtype,params:{arr:a2.join(","),ans:ans},viz:srViz(a2),mono:true,
    stem:'그림의 배열에 <b>버블 정렬 1회전</b>(앞에서부터 이웃끼리 비교, 어긋나면 교환)을 수행한 직후의 배열은?',
    okfb:'1회전 후: '+ans+' — 최댓값이 맨 뒤에 확정된다.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}
/* --- G44. 삽입 정렬 (유닛 D) --- */
function genG44(){
  const qtype=pick(["stepk","moves","bestcase","whichfast"]);
  if(qtype==="bestcase"){
    const ans="이미 정렬에 가까운 입력 — 비교가 곧바로 멈춘다";
    return {id:"G44",qtype:qtype,params:{ans:ans},
      stem:'삽입 정렬이 <b>O(n) 수준으로 가장 빠르게</b> 끝나는 입력은?',
      okfb:'끼워 넣을 자리가 바로 왼쪽이면 비교 한 번에 단계가 끝난다 — 거의 정렬된 입력이 최선이다.',
      choices:[
        {text:ans,correct:true},
        {text:"크기가 거꾸로 선 역순 입력 — 밀 것이 확실하다",correct:false,mc:"reverse-myth",fb:"역순은 매번 끝까지 밀어야 하는 최악의 입력이다."},
        {text:"무작위 입력 — 어느 쪽으로도 치우치지 않는다",correct:false,mc:"random-myth",fb:"무작위는 평균의 경우 — 최선은 아니다."},
        {text:"모든 값이 큰 입력 — 비교가 단순해진다",correct:false,mc:"value-myth",fb:"값의 크기가 아니라 순서가 비용을 정한다."}]};
  }
  if(qtype==="whichfast"){
    const ans="삽입은 비교가 바로 멈추지만 선택은 항상 끝까지 훑기 때문";
    return {id:"G44",qtype:qtype,params:{ans:ans},
      stem:'<b>거의 정렬된 입력</b>에서 삽입 정렬이 선택 정렬보다 빨리 끝나는 이유는?',
      okfb:'삽입은 제자리면 비교 1번 — 선택은 "최솟값 확인"을 위해 언제나 남은 전부를 본다(n(n−1)/2 고정).',
      choices:[
        {text:ans,correct:true},
        {text:"삽입은 교환 대신 밀기를 써서 이동 자체가 없기 때문",correct:false,mc:"move-myth",fb:"밀기도 이동이다 — 차이는 비교가 멈추느냐다."},
        {text:"선택 정렬은 정렬된 입력에서 오히려 교환이 늘기 때문",correct:false,mc:"swap-myth",fb:"교환은 회전당 1번으로 같다 — 문제는 비교가 줄지 않는 것."},
        {text:"삽입은 큰 값부터, 선택은 작은 값부터 다루기 때문",correct:false,mc:"order-myth",fb:"다루는 방향의 문제가 아니라 비교가 조기 종료되는가의 문제다."}]};
  }
  const n=pick([5,6]); let a=srArr(n), I=srInsStates(a);
  const k=pick([1,2,3]);
  if(qtype==="moves"){
    let a3=a, I3=I, guard2=80;
    while(guard2-->0 && I3.moves[k-1]===0){ a3=srArr(n); I3=srInsStates(a3); }
    a=a3; I=I3;
    const ans=String(I.moves[k-1]);
    return {id:"G44",qtype:qtype,params:{arr:a.join(","),k:k,ans:ans},viz:srViz(a),mono:true,
      stem:'그림의 배열에 삽입 정렬을 적용할 때, <span class="mono">list['+k+']</span>(값 '+a[k]+')를 제자리에 끼워 넣는 단계에서 <b>오른쪽으로 밀리는 원소의 수</b>는?',
      okfb:a[k]+'보다 큰 왼쪽 원소가 '+ans+'개 — 그만큼 한 칸씩 밀리고 빈 자리에 '+a[k]+'가 들어간다.',
      choices:g2Fill([
        {text:String(I.moves[k-1]+1),correct:false,mc:"count-slip",fb:"끼워 넣는 원소 자신은 '밀리는 수'에 넣지 않는다."},
        {text:String(Math.max(0,I.moves[k-1]-1)),correct:false,mc:"count-slip2",fb:a[k]+"보다 큰 왼쪽 원소를 다시 세어 보라."},
        {text:String(k),correct:false,mc:"index-myth",fb:"자리 번호만큼이 아니라 '"+a[k]+"보다 큰 것'의 수만큼 밀린다."}
      ],{text:ans,correct:true},4)};
  }
  /* stepk — 해당 단계가 배열을 바꾸는 입력만 */
  let a2=a, I2=I, guard=80;
  while(guard-->0 && srStr(I2.states[k-1])===srStr(a2)){ a2=srArr(n); I2=srInsStates(a2); }
  const ans=srStr(I2.states[k-1]);
  const cands=[];
  if(I2.states[k]&&srStr(I2.states[k])!==ans) cands.push({text:srStr(I2.states[k]),correct:false,mc:"off-by-one",fb:"그건 list["+(k+1)+"]까지 처리한 뒤의 모습이다."});
  const sel=srSelStates(a2);
  if(srStr(sel[k-1])!==ans) cands.push({text:srStr(sel[k-1]),correct:false,mc:"select-confuse",fb:"그건 선택 정렬의 "+k+"회전 — 삽입은 앞쪽 '정렬된 패'에 끼워 넣는다."});
  const sorted=srStr(a2.slice().sort((x,y)=>x-y));
  if(sorted!==ans) cands.push({text:sorted,correct:false,mc:"final-confuse",fb:"최종 결과가 아니라 해당 단계 직후를 물었다."});
  cands.push({text:srStr(a2),correct:false,mc:"no-change",fb:"이 단계에서는 밀기가 일어난다 — next보다 큰 왼쪽 원소를 짚어 보라."});
  const half=a2.slice(); { const nx=half[k]; let j2=k-1; if(j2>=0&&nx<half[j2]){ half[j2+1]=half[j2]; half[j2]=nx; } }
  if(srStr(half)!==ans) cands.push({text:srStr(half),correct:false,mc:"half-shift",fb:"한 칸만 밀고 멈췄다 — next보다 큰 것이 남아 있는 한 계속 민다."});
  { /* 형태 무관 보충 오답 — 이웃 값 교환 변형 (후보 붕괴 방지) */
    const mk=(arr,i2)=>{ const c=arr.slice(); const t3=c[i2]; c[i2]=c[i2+1]; c[i2+1]=t3; return srStr(c); };
    const base=ans.split(", ").map(Number);
    for(const i2 of [0,1,2]){
      if(cands.length>=3) break;
      if(i2+1>=base.length) break;
      const s3=mk(base,i2);
      if(s3!==ans && !cands.find(c=>c.text===s3)) cands.push({text:s3,correct:false,mc:"near-slip",fb:"이웃한 두 값이 뒤바뀌어 있다 — 결과를 한 칸씩 다시 짚어 보라."});
    }
  }
  return {id:"G44",qtype:qtype,params:{arr:a2.join(","),k:k,ans:ans},viz:srViz(a2),mono:true,
    stem:'그림의 배열에 <b>삽입 정렬</b>을 적용할 때, <span class="mono">list['+k+']</span>(값 '+a2[k]+')를 제자리에 <b>끼워 넣은 직후</b>의 배열은?',
    okfb:'앞 '+(k+1)+'개가 정렬된 패가 된다: '+ans+'.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}
/* --- AP11. 심화 — 셸 정렬 / 이동 계수 / 안정성 실전 --- */
function srShellPass(a,gap){
  const arr=a.slice(), n=arr.length;
  for(let r=0;r<gap;r++){
    const idx=[]; for(let i=r;i<n;i+=gap) idx.push(i);
    const vals=idx.map(i=>arr[i]).sort((x,y)=>x-y);
    idx.forEach((i,t)=>{ arr[i]=vals[t]; });
  }
  return arr;
}
function genAP11ch(idx){
  if(idx===0){
    /* 셸 정렬 — 미니 강의 내장 */
    let a,gap,res,guard=60;
    do{ a=srArr(6); gap=2; res=srShellPass(a,gap); }
    while(guard-->0 && srStr(res)===srStr(a));
    const evens=[a[0],a[2],a[4]], odds=[a[1],a[3],a[5]];
    const ans=srStr(res);
    const full=srStr(a.slice().sort((x,y)=>x-y));
    const cands=[
      {text:srStr(srBubStates(a).states[0]),correct:false,mc:"bubble-confuse",fb:"이웃 교환이 아니라 gap 간격의 부분 리스트를 각각 정렬한다."},
      {text:srStr(a),correct:false,mc:"no-change",fb:"부분 리스트가 정렬되며 배열이 달라진다."}
    ];
    if(full!==ans) cands.push({text:full,correct:false,mc:"final-confuse",fb:"전체 정렬은 gap을 줄여 가며 여러 패스를 거친 뒤의 일이다."});
    return {id:"AP11",qtype:"shell",params:{arr:a.join(","),gap:gap,ans:ans},viz:srViz(a),mono:true,
      stem:'[심화 — 셸 정렬] 새 개념 하나. 삽입 정렬은 멀리 있는 원소를 <b>한 칸씩만</b> 옮길 수 있어, 제자리에서 먼 원소가 많으면 느려진다. <b>셸 정렬(shell sort)</b>은 이를 고친다 — 배열을 <b>gap 간격으로 건너뛰며 뽑은 부분 리스트</b>로 나누고, <b>각 부분 리스트를 삽입 정렬</b>한 뒤, gap을 줄여 가며 반복한다. 마지막 gap=1은 이미 "거의 정렬된 입력"이 되어 있어 삽입 정렬의 최선(빠른 경우)으로 끝난다.<br><br>그림의 배열에서 gap=2로 나누면 부분 리스트는 두 개다 — 짝수 자리 <span class="mono">list[0]·list[2]·list[4]</span> = ['+evens.join(", ")+'] 와 홀수 자리 <span class="mono">list[1]·list[3]·list[5]</span> = ['+odds.join(", ")+']. 이 <b>두 부분 리스트를 각각 오름차순 정렬</b>(gap=2의 한 패스)한 직후, 전체 배열의 모습은? (각 값은 자기 부분 리스트의 자리들 안에서만 이동한다)',
      okfb:'짝수 자리 ['+evens.join(", ")+'] → ['+evens.slice().sort((x,y)=>x-y).join(", ")+'], 홀수 자리 ['+odds.join(", ")+'] → ['+odds.slice().sort((x,y)=>x-y).join(", ")+'] — 합치면 '+ans+'. 큰 값이 성큼성큼 이동하는 것이 셸의 힘이다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(idx===1){
    /* 이동 계수 — 역순 입력의 삽입 정렬 총 밀기 수 */
    const n=pick([5,6]);
    const base=srArr(n).sort((x,y)=>y-x);            /* 역순 배열 */
    const I=srInsStates(base);
    const total=I.moves.reduce((s,m)=>s+m,0);        /* = n(n-1)/2 */
    const ans=String(total);
    return {id:"AP11",qtype:"movecount",params:{arr:base.join(","),ans:ans},viz:srViz(base),mono:true,
      stem:'[심화 — 이동의 값어치] 그림처럼 <b>완전히 역순</b>인 배열(원소 '+n+'개)에 삽입 정렬을 적용하면, 전체 실행에서 <b>오른쪽으로 밀리는 이동의 총 횟수</b>는? (단계별 밀림을 전부 더한다)',
      okfb:'매 단계 왼쪽 전부가 밀린다: 1+2+…+'+(n-1)+' = '+ans+'회 — 역순이 삽입 정렬의 최악인 이유이고, O(n²)의 정체다.',
      choices:g2Fill([
        {text:String(n-1),correct:false,mc:"last-only",fb:"마지막 단계 하나만 센 값이다 — 전 단계를 더한다."},
        {text:String(n*n),correct:false,mc:"square-slip",fb:"n²이 아니라 1+2+…+(n−1)이다."},
        {text:String(n*(n-1)),correct:false,mc:"double-count",fb:"두 배로 세었다 — 밀림은 쌍마다 한 번이다."}
      ],{text:ans,correct:true},4)};
  }
  /* idx 2 — 안정성 실전: 같은 키 태그 */
  const keys=srArr(3);                                /* 서로 다른 3키 + 중복 1쌍 */
  const dup=keys[0];
  const rest=[keys[1],keys[2]];
  const arr=[{k:dup,t:"a"},{k:rest[0],t:""},{k:dup,t:"b"},{k:rest[1],t:""}];
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t2=arr[i]; arr[i]=arr[j]; arr[j]=t2; }
  const ia=arr.findIndex(x=>x.t==="a"), ib=arr.findIndex(x=>x.t==="b");
  if(ia>ib){ arr[ia].t="b"; arr[ib].t="a"; }          /* a가 항상 앞 */
  const lab=x=>x.k+(x.t||"");
  const stableOut=arr.slice().sort((x,y)=>x.k-y.k || (x.t==="a"?-1:1));
  const ans=stableOut.map(lab).join(", ");
  const unstable=stableOut.map(x=>({k:x.k,t:x.t==="a"?"b":x.t==="b"?"a":""}));
  const wrong1=unstable.map(lab).join(", ");
  return {id:"AP11",qtype:"stabletag",params:{arr:arr.map(lab).join(","),ans:ans},mono:true,
    viz:{type:"arr", a:arr.map(lab), hi:[], done:[]},
    stem:'[심화 — 안정성 실전] 같은 키 '+dup+'가 두 번 나온다 — 원래 순서를 표시하려고 앞의 것에 a, 뒤의 것에 b를 붙였다('+dup+'a가 '+dup+'b보다 앞). 이 배열을 <b>안정 정렬</b>(예: 삽입·버블)로 오름차순 정렬한 결과는?',
    okfb:'안정 정렬은 같은 키의 원래 순서를 보존한다 — '+dup+'a가 여전히 '+dup+'b 앞: '+ans+'.',
    choices:g2Fill([
      {text:wrong1,correct:false,mc:"stable-flip",fb:"같은 키의 순서가 뒤집혔다 — 안정 정렬은 원래 순서(a 먼저)를 지킨다."},
      {text:arr.map(lab).join(", "),correct:false,mc:"no-change",fb:"정렬 자체는 일어난다 — 보존되는 것은 같은 키 사이의 순서뿐이다."},
      {text:stableOut.slice().reverse().map(lab).join(", "),correct:false,mc:"desc-flip",fb:"내림차순이 아니라 오름차순이다."}
    ],{text:ans,correct:true},4)};
}

/* ================= 6장(B) 고급 정렬 — G45~G48 + AP12 ================= */
/* --- 시뮬 유틸: 퀵 분할 / 합병 패스 / 히프 --- */
function srQuick1(a){
  /* 교재 quicksort의 첫 분할 한 번 — 전체 배열, pivot=a[0]. {arr, j(피봇 최종 자리), preswap(마지막 SWAP 직전 상태), swaps} */
  const arr=a.slice(), n=arr.length, pivot=arr[0];
  let i=0, j=n, swaps=0;
  while(true){
    do{ i++; } while(i<n && arr[i]<pivot);
    do{ j--; } while(arr[j]>pivot);
    if(i<j){ const t=arr[i]; arr[i]=arr[j]; arr[j]=t; swaps++; } else break;
  }
  const preswap=arr.slice();
  const t=arr[0]; arr[0]=arr[j]; arr[j]=t;
  return {arr:arr, j:j, preswap:preswap, swaps:swaps};
}
function srMerge2(x,y){
  const out=[]; let i=0,j=0;
  while(i<x.length&&j<y.length) out.push(x[i]<=y[j]?x[i++]:y[j++]);
  while(i<x.length) out.push(x[i++]);
  while(j<y.length) out.push(y[j++]);
  return out;
}
function srMergePass(a,len){
  /* merge_pass 한 회전 (0-based 배열) */
  const n=a.length, out=[];
  let i=0;
  for(; i+2*len<=n; i+=2*len) out.push(...srMerge2(a.slice(i,i+len), a.slice(i+len,i+2*len)));
  if(i+len<n) out.push(...srMerge2(a.slice(i,i+len), a.slice(i+len,n)));
  else for(; i<n; i++) out.push(a[i]);
  return out;
}
function srHeapAdjust(arr,root,n){
  /* 교재 adjust — arr는 논리 1..n (JS에선 arr[k-1]) */
  const temp=arr[root-1], rootkey=temp;
  let child=2*root;
  while(child<=n){
    if(child<n && arr[child-1]<arr[child]) child++;
    if(rootkey>arr[child-1]) break;
    arr[Math.floor(child/2)-1]=arr[child-1]; child*=2;
  }
  arr[Math.floor(child/2)-1]=temp;
}
function srHeapBuild(a){
  const arr=a.slice(), n=arr.length;
  for(let i=Math.floor(n/2); i>0; i--) srHeapAdjust(arr,i,n);
  return arr;
}
function srHeapExtract(h,k){
  /* 구성된 히프 h에서 heapsort 추출 k회 — 상태 반환 */
  const arr=h.slice(), n=arr.length;
  for(let i=n-1; i>=n-k; i--){
    const t=arr[0]; arr[0]=arr[i]; arr[i]=t;
    srHeapAdjust(arr,1,i);
  }
  return arr;
}
function srNearSlips(cands,ansStr){
  /* 이웃 값 교환 보충 오답 — 후보 붕괴 방지 공용 */
  const base=ansStr.split(", ");
  for(const i2 of [0,1,2,3]){
    if(cands.length>=3) break;
    if(i2+1>=base.length) break;
    const c=base.slice(); const t=c[i2]; c[i2]=c[i2+1]; c[i2+1]=t;
    const s=c.join(", ");
    if(s!==ansStr && !cands.find(x=>x.text===s)) cands.push({text:s,correct:false,mc:"near-slip",fb:"이웃한 두 값이 뒤바뀌어 있다 — 결과를 한 칸씩 다시 짚어 보라."});
  }
  return cands;
}
/* --- G45. 퀵 정렬 (유닛 A) --- */
function genG45(){
  const qtype=pick(["part1","pivotpos","recur","worst"]);
  if(qtype==="recur"){
    const ans="피봇을 뺀 왼쪽 부리스트와 오른쪽 부리스트 각각";
    return {id:"G45",qtype:qtype,params:{ans:ans},
      stem:'퀵 정렬에서 <b>분할이 끝난 직후</b>, 재귀 호출이 이어지는 대상은?',
      okfb:'피봇은 정확한 자기 자리에 앉았다 — 다시 볼 필요가 없다. quicksort(left, j−1)과 quicksort(j+1, right), 피봇을 뺀 양쪽이다.',
      choices:[
        {text:ans,correct:true},
        {text:"피봇을 포함한 왼쪽 부리스트와 오른쪽 부리스트",correct:false,mc:"pivot-include",fb:"피봇 자리는 확정 — 포함하면 같은 일을 반복하게 된다."},
        {text:"항상 정확히 절반으로 나눈 앞쪽과 뒤쪽",correct:false,mc:"half-myth",fb:"경계는 절반이 아니라 피봇이 앉은 자리 j가 정한다."},
        {text:"왼쪽 부리스트만 — 오른쪽은 이미 정렬되어 있다",correct:false,mc:"left-only",fb:"오른쪽은 '피봇보다 크다'만 보장될 뿐 정렬은 아직이다."}]};
  }
  if(qtype==="worst"){
    const ans="이미 정렬된(또는 역순) 입력 — 분할이 0 : (n−1)로 쏠린다";
    return {id:"G45",qtype:qtype,params:{ans:ans},
      stem:'<b>첫 원소를 피봇</b>으로 쓰는 퀵 정렬이 <b>최악 O(n²)</b>이 되는 입력은?',
      okfb:'정렬된 입력이면 피봇(첫 원소)이 항상 최솟값 — 왼쪽 부리스트가 비고 분할 깊이가 n이 된다. 처방이 중간값·무작위 피봇이다.',
      choices:[
        {text:ans,correct:true},
        {text:"무작위로 뒤섞인 입력 — 분할의 크기를 전혀 예측할 수 없어진다",correct:false,mc:"random-myth",fb:"무작위는 평균의 경우 — 반반에 가까운 분할이 기대되어 오히려 O(n log n)이다."},
        {text:"모든 값이 서로 다른 입력 — 같은 값이 없어 비교가 최대로 늘어난다",correct:false,mc:"distinct-myth",fb:"값이 전부 다른 것은 정상 조건일 뿐 — 문제는 분할의 쏠림이다."},
        {text:"크기가 홀수인 입력 — 피봇을 빼면 절반으로 나뉠 수 없게 된다",correct:false,mc:"odd-myth",fb:"한 개 차이는 성능에 영향이 없다 — 0:(n−1)의 쏠림이 문제다."}]};
  }
  /* 배열형 — 첫 분할이 실제로 배열을 바꾸고, 피봇이 끝에 앉지 않는 입력만 */
  let a,Q,guard=120;
  const n=pick([6,7]);
  do{ a=srArr(n); Q=srQuick1(a); }
  while(guard-->0 && (Q.j===0 || Q.j===n-1 || srStr(Q.arr)===srStr(a)));
  if(qtype==="pivotpos"){
    const ans=String(Q.j);
    return {id:"G45",qtype:qtype,params:{arr:a.join(","),ans:ans},viz:srViz(a,[0]),mono:true,
      stem:'그림의 배열에 퀵 정렬을 적용한다 — 피봇은 첫 원소 <b>'+a[0]+'</b>. <b>첫 분할이 끝난 직후</b> 피봇 '+a[0]+'가 앉는 <b>인덱스</b>는?',
      okfb:'피봇보다 작은 원소가 '+Q.j+'개 — 전부 앞으로 오므로 피봇의 확정 자리는 ['+ans+']다.',
      choices:g2Fill([
        {text:String(Q.j===0?1:0),correct:false,mc:"stay-myth",fb:"피봇은 마지막 SWAP(list[left]↔list[j])으로 경계 자리까지 이동한다."},
        {text:String(n-1),correct:false,mc:"end-myth",fb:"맨 뒤는 최댓값의 자리 — 피봇의 자리는 '저보다 작은 것의 수'가 정한다."},
        {text:String(Math.min(n-1,Q.j+1)),correct:false,mc:"off-by-one",fb:a[0]+"보다 작은 원소의 수를 다시 세어 보라."}
      ],{text:ans,correct:true},4)};
  }
  /* part1 — 첫 분할 직후의 배열 */
  const ans=srStr(Q.arr);
  const cands=[];
  if(srStr(Q.preswap)!==ans) cands.push({text:srStr(Q.preswap),correct:false,mc:"no-final-swap",fb:"i와 j가 교차한 뒤의 마지막 SWAP(피봇↔list[j])을 빠뜨렸다."});
  const sorted=srStr(a.slice().sort((x,y)=>x-y));
  if(sorted!==ans) cands.push({text:sorted,correct:false,mc:"final-confuse",fb:"전체 정렬은 재귀가 다 끝난 뒤 — 첫 분할 직후를 물었다."});
  if(srStr(a)!==ans) cands.push({text:srStr(a),correct:false,mc:"no-change",fb:"이 입력에서는 분할이 배열을 바꾼다 — 어긋난 쌍의 교환을 따라가 보라."});
  srNearSlips(cands,ans);
  return {id:"G45",qtype:qtype,params:{arr:a.join(","),ans:ans},viz:srViz(a,[0]),mono:true,
    stem:'그림의 배열에 퀵 정렬을 적용한다 — 피봇은 첫 원소 <b>'+a[0]+'</b>. <b>첫 분할(피봇 안착까지)이 끝난 직후</b>의 배열은?',
    okfb:'어긋난 쌍의 교환 '+Q.swaps+'번 뒤 i·j가 교차 — 마지막으로 피봇을 ['+Q.j+']에 안착: '+ans+'. 피봇 왼쪽은 전부 '+a[0]+'보다 작고 오른쪽은 크다.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}
/* --- G46. 합병 정렬 (유닛 B) --- */
function genG46(){
  const qtype=pick(["merge2","pass1","passcnt","lonely"]);
  if(qtype==="passcnt"){
    const n=pick([8,10,16,20,32]);
    const ans=String(Math.ceil(Math.log2(n)));
    return {id:"G46",qtype:qtype,params:{n:n,ans:ans},mono:true,
      stem:'원소 <b>'+n+'개</b>의 배열을 반복 합병 정렬로 정렬할 때, 필요한 <b>패스(회전)의 수</b>는? (길이 1 → 2 → 4 → …)',
      okfb:'부리스트 길이가 패스마다 2배 — 1이 '+n+' 이상이 될 때까지 ⌈log₂'+n+'⌉ = '+ans+'번이다.',
      choices:g2Fill([
        {text:String(Math.floor(n/2)),correct:false,mc:"half-myth",fb:"n/2는 첫 패스의 쌍 수 — 패스 수는 log₂n이다."},
        {text:String(n-1),correct:false,mc:"linear-myth",fb:"n−1번이면 단순 정렬의 회전 수 — 합병은 길이가 2배씩 큰다."},
        {text:String(Math.ceil(Math.log2(n))+1),correct:false,mc:"off-by-one",fb:"길이 1에서 시작해 2배씩: 1→2→…→"+n+" 이상까지 몇 번인지 다시 세어 보라."}
      ],{text:ans,correct:true},4)};
  }
  if(qtype==="lonely"){
    const ans="그대로 복사되어 다음 패스에서 합병을 기다린다";
    return {id:"G46",qtype:qtype,params:{ans:ans},
      stem:'반복 합병 정렬의 한 패스에서, 부리스트의 수가 홀수라 <b>짝이 없는 마지막 부리스트</b>는 어떻게 처리되는가?',
      okfb:'merge_pass의 else 분기 — sorted[j]=list[j]로 그대로 복사만 하고, 다음 패스에서 짝을 만난다(그림 7.7의 [19, 48]이 그 예).',
      choices:[
        {text:ans,correct:true},
        {text:"앞의 두 부리스트와 셋이 한꺼번에 합병된다",correct:false,mc:"triple-myth",fb:"merge는 언제나 두 리스트만 합친다 — 3자 합병 분기는 없다."},
        {text:"버려졌다가 마지막에 삽입 정렬로 끼워 넣는다",correct:false,mc:"discard-myth",fb:"버려지는 원소는 없다 — 복사되어 살아남는다."},
        {text:"그 자리에서 스스로 반으로 쪼개져 합병된다",correct:false,mc:"split-myth",fb:"이미 정렬된 부리스트 — 쪼갤 이유가 없다."}]};
  }
  if(qtype==="merge2"){
    /* 정렬된 두 리스트의 병합 */
    const total=pick([6,7]);
    const all=srArr(total).sort((x,y)=>x-y);
    const xlen=pick([3,total-3]);
    const idxs=[]; for(let i=0;i<total;i++) idxs.push(i);
    for(let i=idxs.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=idxs[i]; idxs[i]=idxs[j]; idxs[j]=t; }
    const xset=new Set(idxs.slice(0,xlen));
    const x=all.filter((_,i)=>xset.has(i)), y=all.filter((_,i)=>!xset.has(i));
    const ans=srStr(srMerge2(x,y));
    const zip=[]; for(let i=0;i<Math.max(x.length,y.length);i++){ if(i<x.length) zip.push(x[i]); if(i<y.length) zip.push(y[i]); }
    const cands=[];
    if(srStr(zip)!==ans) cands.push({text:srStr(zip),correct:false,mc:"zip-myth",fb:"번갈아 하나씩이 아니라 — 맨 앞끼리 비교해 작은 쪽을 꺼낸다."});
    const concat=x.concat(y);
    if(srStr(concat)!==ans) cands.push({text:srStr(concat),correct:false,mc:"concat-myth",fb:"이어 붙이기만 해서는 정렬이 되지 않는다 — 비교하며 꺼내야 한다."});
    srNearSlips(cands,ans);
    return {id:"G46",qtype:qtype,params:{x:x.join(","),y:y.join(","),ans:ans},mono:true,
      stem:'정렬된 두 리스트 <span class="mono">['+x.join(", ")+']</span> 과 <span class="mono">['+y.join(", ")+']</span> 를 <b>합병(merge)</b>한 결과는?',
      okfb:'두 줄의 맨 앞끼리 비교해 작은 쪽을 꺼내 담기를 반복 — '+ans+'.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  /* pass1 — 길이 1의 첫 패스 직후 */
  let a,guard=60,res;
  const n=pick([6,7]);
  do{ a=srArr(n); res=srMergePass(a,1); }
  while(guard-->0 && srStr(res)===srStr(a));
  const ans=srStr(res);
  const cands=[];
  const sorted=srStr(a.slice().sort((x,y)=>x-y));
  if(sorted!==ans) cands.push({text:sorted,correct:false,mc:"final-confuse",fb:"전체 정렬은 마지막 패스 뒤 — 길이 1의 첫 패스 직후를 물었다."});
  const bub=srStr(srBubStates(a).states[0]);
  if(bub!==ans && !cands.find(c=>c.text===bub)) cands.push({text:bub,correct:false,mc:"bubble-confuse",fb:"이웃을 계속 교환하며 가는 것은 버블 — 합병 패스는 쌍 안에서만 정렬한다."});
  if(srStr(a)!==ans) cands.push({text:srStr(a),correct:false,mc:"no-change",fb:"어긋난 쌍이 있다 — (0,1)(2,3)… 쌍끼리 견줘 보라."});
  srNearSlips(cands,ans);
  return {id:"G46",qtype:qtype,params:{arr:a.join(","),ans:ans},viz:srViz(a),mono:true,
    stem:'그림의 배열을 <b>길이 1의 정렬 리스트 '+n+'개</b>로 보고, 반복 합병 정렬의 <b>첫 패스</b>(쌍쌍이 합병'+(n%2?', 마지막 하나는 짝 없음':'')+')를 수행한 직후의 배열은?',
    okfb:'(0,1)·(2,3)… 쌍 안에서만 작은 쪽이 앞으로'+(n%2?', 외톨이는 그대로 복사':'')+' — '+ans+'.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}
/* --- G47. 히프 정렬 (유닛 C) --- */
function genG47(){
  const qtype=pick(["build","extract1","bigchild","space"]);
  if(qtype==="bigchild"){
    const ans="작은 자식과 바꾸면 그 자식이 다른 자식보다 작아 부모 조건이 다시 깨지기 때문";
    return {id:"G47",qtype:qtype,params:{ans:ans},
      stem:'adjust(내려보내기)에서 두 자식 중 <b>큰 쪽</b>과 비교·교환하는 이유는?',
      okfb:'올라오는 값은 두 자식 모두의 부모가 된다 — 큰 자식이 올라와야 남은 자식보다 크다는 조건이 지켜진다.',
      choices:[
        {text:ans,correct:true},
        {text:"큰 자식 쪽의 부트리가 항상 더 깊어서, 내려보낼 길이 그쪽에만 남아 있기 때문",correct:false,mc:"depth-myth",fb:"깊이와는 무관하다 — 부모 ≥ 자식 조건을 지키는 문제다."},
        {text:"작은 자식 쪽은 이미 제자리가 확정된 구역이라 건드리면 질서가 깨지기 때문",correct:false,mc:"fixed-myth",fb:"확정된 것은 없다 — 조건 유지를 위해 큰 쪽을 고르는 것이다."},
        {text:"완전 이진 트리에서는 오른쪽 자식이 왼쪽 자식보다 항상 크게 유지되기 때문",correct:false,mc:"sibling-myth",fb:"형제의 대소는 정해져 있지 않다 — 그래서 매번 비교해 고른다."}]};
  }
  if(qtype==="space"){
    const ans="히프 정렬 — 배열 안에서 전부 해결한다(제자리)";
    return {id:"G47",qtype:qtype,params:{ans:ans},
      stem:'합병 정렬과 히프 정렬은 둘 다 <b>최악에도 O(n log n)</b>이다. <b>추가 배열 없이</b> 정렬을 끝내는 쪽은?',
      okfb:'합병은 원소 수만큼의 추가 배열(sorted/extra)이 필요하지만, 히프는 배열 안의 교환·내려보내기만으로 끝난다 — 메모리가 빠듯하면 히프다.',
      choices:[
        {text:ans,correct:true},
        {text:"합병 정렬 — 부리스트가 제자리에서 합쳐진다",correct:false,mc:"merge-flip",fb:"합병은 결과를 담을 별도 배열이 필요하다 — 그것이 합병의 대가다."},
        {text:"둘 다 — O(n log n) 정렬은 모두 제자리다",correct:false,mc:"both-myth",fb:"복잡도와 메모리는 별개의 성질이다."},
        {text:"둘 다 아니다 — 둘 다 추가 배열이 필요하다",correct:false,mc:"neither-myth",fb:"히프는 제자리 — 그것이 히프 정렬의 자랑이다."}]};
  }
  if(qtype==="build"){
    let a,h,guard=60;
    do{ a=srArr(7); h=srHeapBuild(a); }
    while(guard-->0 && srStr(h)===srStr(a));
    const ans=srStr(h);
    const cands=[];
    const desc=srStr(a.slice().sort((x,y)=>y-x));
    if(desc!==ans) cands.push({text:desc,correct:false,mc:"desc-myth",fb:"히프는 내림차순 정렬이 아니다 — 부모 ≥ 자식만 지키는 느슨한 질서다."});
    const asc=srStr(a.slice().sort((x,y)=>x-y));
    if(asc!==ans) cands.push({text:asc,correct:false,mc:"sorted-confuse",fb:"오름차순 완성은 추출이 다 끝난 뒤 — 구성 직후를 물었다."});
    if(srStr(a)!==ans) cands.push({text:srStr(a),correct:false,mc:"no-change",fb:"부모보다 큰 자식이 있다 — 구성이 배열을 바꾼다."});
    srNearSlips(cands,ans);
    return {id:"G47",qtype:qtype,params:{arr:a.join(","),ans:ans},viz:{type:"arr",a:a.slice(),hi:[],done:[],base:1},mono:true,
      stem:'그림의 배열(1번 칸부터, 원소 7개)에 heapsort의 <b>1단계 — 최대 히프 구성</b>(i = 3, 2, 1 순서로 adjust)을 수행한 직후의 배열은?',
      okfb:'자식 있는 노드(3→2→1)를 아래에서부터 내려보내기 — '+ans+'. 최댓값 '+Math.max.apply(null,a)+'가 1번 칸(루트)에 온다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  /* extract1 — 구성된 히프에서 추출 1회 */
  let a,h,guard=60;
  do{ a=srArr(7); h=srHeapBuild(a); }
  while(guard-->0 && srStr(h)===srStr(a));
  const after=srHeapExtract(h,1);
  const ans=srStr(after);
  const n=h.length;
  const swapOnly=h.slice(); { const t=swapOnly[0]; swapOnly[0]=swapOnly[n-1]; swapOnly[n-1]=t; }
  const cands=[];
  if(srStr(swapOnly)!==ans) cands.push({text:srStr(swapOnly),correct:false,mc:"no-adjust",fb:"교환 뒤의 adjust(내려보내기)를 빠뜨렸다 — 루트의 질서를 복구해야 한다."});
  const asc=srStr(a.slice().sort((x,y)=>x-y));
  if(asc!==ans && !cands.find(c=>c.text===asc)) cands.push({text:asc,correct:false,mc:"final-confuse",fb:"전부 추출한 뒤의 최종 결과 — 1회 추출 직후를 물었다."});
  if(srStr(h)!==ans) cands.push({text:srStr(h),correct:false,mc:"no-change",fb:"추출은 반드시 배열을 바꾼다 — 루트와 마지막의 교환부터."});
  srNearSlips(cands,ans);
  return {id:"G47",qtype:qtype,params:{heap:h.join(","),ans:ans},viz:{type:"arr",a:h.slice(),hi:[0],done:[],base:1},mono:true,
    stem:'그림은 <b>구성이 끝난 최대 히프</b>다(1번 칸부터). heapsort의 <b>추출 1회</b> — SWAP(list[1], list['+n+']) 후 adjust(list, 1, '+(n-1)+') — 를 수행한 직후의 배열은?',
    okfb:'최댓값 '+h[0]+'가 맨 뒤로 가 확정되고, 올라온 '+h[n-1]+'가 내려보내기로 제자리를 찾는다 — '+ans+'.',
    choices:g2Fill(cands,{text:ans,correct:true},4)};
}
/* --- G48. 종합 비교 (유닛 D) --- */
function genG48(){
  const qtype=pick(["which","cmplx","stablepick","guarantee"]);
  if(qtype==="which"){
    const cases=[
      {sc:"거의 정렬된 배열에 새 값 몇 개가 섞여 들어온다 — 빠르게 마무리하고 싶다", ans:"삽입 정렬", why:"거의 정렬된 입력은 삽입의 최선 O(n) — 비교 한 번씩으로 끝난다."},
      {sc:"레코드 하나하나가 사진을 포함해 매우 무겁다 — 이동(교환)을 최소로 하고 싶다", ans:"선택 정렬", why:"교환이 회전당 1번, 총 n−1번뿐 — 이동이 비쌀 때의 선택이다."},
      {sc:"수백만 건 무작위 데이터 — 평균적으로 가장 빠르게, 추가 배열 없이 정렬하고 싶다", ans:"퀵 정렬", why:"평균 O(n log n)의 실전 최속 + 제자리 — 라이브러리 정렬의 근간이다."},
      {sc:"같은 키의 원래 순서를 지키면서, 어떤 입력에도 O(n log n)을 보장해야 한다", ans:"합병 정렬", why:"보장 + 안정을 둘 다 갖춘 것은 합병뿐이다(추가 배열이 대가)."},
      {sc:"어떤 입력에도 O(n log n)을 보장해야 하는데, 추가 배열을 쓸 메모리가 없다", ans:"히프 정렬", why:"보장 + 제자리 — 합병에서 추가 배열을 뺀 자리의 답이다."}
    ];
    const c=pick(cases);
    const others=["선택 정렬","버블 정렬","삽입 정렬","퀵 정렬","합병 정렬","히프 정렬"].filter(x=>x!==c.ans);
    for(let i=others.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=others[i]; others[i]=others[j]; others[j]=t; }
    return {id:"G48",qtype:qtype,params:{sc:c.sc,ans:c.ans},
      stem:'상황 — "'+c.sc+'". 가장 알맞은 정렬은?',
      okfb:c.why,
      choices:[
        {text:c.ans,correct:true},
        {text:others[0],correct:false,mc:"mismatch1",fb:"요구 조건(순서 보존·보장·메모리·이동 비용)을 표에 대 보라."},
        {text:others[1],correct:false,mc:"mismatch2",fb:"이 상황의 핵심 요구를 다시 짚어 보라 — 표의 어느 칸이 갈리는가."},
        {text:others[2],correct:false,mc:"mismatch3",fb:"만능 정렬은 없다 — 조건과 성질을 하나씩 대조하라."}]};
  }
  if(qtype==="cmplx"){
    const cells=[
      {q:"퀵 정렬의 <b>최악</b>", ans:"O(n²)", why:"정렬된 입력+첫 피봇의 쏠림 — 퀵의 유일한 약점이다."},
      {q:"퀵 정렬의 <b>평균</b>", ans:"O(n log n)", why:"반반에 가까운 분할 — 깊이 log n × 층마다 n."},
      {q:"합병 정렬의 <b>최악</b>", ans:"O(n log n)", why:"패스 log n번 × 패스당 n — 입력 순서와 무관한 보장이다."},
      {q:"히프 정렬의 <b>최악</b>", ans:"O(n log n)", why:"추출 n회 × 내려보내기 log n — 역시 입력 무관 보장이다."},
      {q:"삽입 정렬의 <b>최선</b>", ans:"O(n)", why:"거의 정렬된 입력 — 단계마다 비교 1번에 끝난다."}
    ];
    const c=pick(cells);
    const opts=["O(n)","O(n log n)","O(n²)","O(log n)"].filter(x=>x!==c.ans);
    return {id:"G48",qtype:qtype,params:{q:c.q,ans:c.ans},mono:true,
      stem:'복잡도 표의 빈칸 — '+c.q+'의 시간 복잡도는?',
      okfb:c.why,
      choices:[
        {text:c.ans,correct:true},
        {text:opts[0],correct:false,mc:"cell-slip1",fb:"표를 다시 그려 보라 — 이 정렬의 이 경우가 어디서 오는지."},
        {text:opts[1],correct:false,mc:"cell-slip2",fb:"최선·평균·최악을 혼동하지 않았는지 확인하라."},
        {text:opts[2],correct:false,mc:"cell-slip3",fb:"이 복잡도가 나오는 정렬·경우가 무엇인지 되짚어 보라."}]};
  }
  if(qtype==="stablepick"){
    const ans="삽입 · 버블 · 합병";
    return {id:"G48",qtype:qtype,params:{ans:ans},
      stem:'배운 정렬 중 <b>안정(stable) 정렬만</b> 바르게 묶은 것은?',
      okfb:'이웃만 다루는 삽입·버블, <=로 앞 리스트를 우선하는 합병이 안정 — 멀리 건너뛰는 선택·퀵·히프는 불안정이다.',
      choices:[
        {text:ans,correct:true},
        {text:"선택 · 퀵 · 히프",correct:false,mc:"flip-all",fb:"정확히 불안정 셋을 골랐다 — 건너뛰는 교환이 순서를 깬다."},
        {text:"삽입 · 퀵 · 합병",correct:false,mc:"quick-slip",fb:"퀵은 피봇 교환이 멀리 건너뛴다 — 불안정이다."},
        {text:"버블 · 합병 · 히프",correct:false,mc:"heap-slip",fb:"히프는 루트↔마지막 교환이 순서를 깬다 — 불안정이다."}]};
  }
  const ans="합병 정렬과 히프 정렬";
  return {id:"G48",qtype:"guarantee",params:{ans:ans},
    stem:'<b>어떤 입력이 와도 O(n log n)</b>이 보장되는(최악이 없는) 정렬의 묶음은?',
    okfb:'합병(패스 구조)과 히프(트리 높이) — 입력 순서가 비용을 흔들지 못한다. 퀵은 평균은 빠르나 최악 O(n²)이 있다.',
    choices:[
      {text:ans,correct:true},
      {text:"퀵 정렬과 합병 정렬",correct:false,mc:"quick-slip",fb:"퀵은 정렬된 입력+첫 피봇에서 O(n²) — 보장이 없다."},
      {text:"퀵 정렬과 히프 정렬",correct:false,mc:"quick-slip2",fb:"퀵의 최악을 잊지 마라 — 보장 조는 합병·히프다."},
      {text:"삽입 정렬과 합병 정렬",correct:false,mc:"insert-slip",fb:"삽입은 역순에서 O(n²) — 최선이 좋은 것과 보장은 다르다."}]};
}
/* --- AP12. 심화 — 기수 정렬 / 퀵 최악 / 표 종합 --- */
function genAP12ch(idx){
  if(idx===0){
    /* 기수 정렬 — 미니 강의 내장: 1의 자리 분배·수집 1패스 */
    let a,guard=80,res;
    const mk=()=>{ const arr=[];
      while(arr.length<4){ const v=10+Math.floor(Math.random()*89); if(!arr.includes(v)&&!arr.some(x=>x%10===v%10)) arr.push(v); }
      return arr; };
    do{ a=mk(); res=a.slice().sort((x,y)=>(x%10)-(y%10)); }
    while(guard-->0 && srStr(res)===srStr(a));
    const ans=srStr(res);
    const full=srStr(a.slice().sort((x,y)=>x-y));
    const tens=srStr(a.slice().sort((x,y)=>Math.floor(x/10)-Math.floor(y/10)));
    const cands=[];
    if(full!==ans) cands.push({text:full,correct:false,mc:"final-confuse",fb:"전체 정렬은 10의 자리 패스까지 끝난 뒤 — 1의 자리 패스 직후를 물었다."});
    if(tens!==ans && !cands.find(c=>c.text===tens)) cands.push({text:tens,correct:false,mc:"digit-flip",fb:"기수 정렬(LSD)은 낮은 자리(1의 자리)부터 시작한다."});
    if(srStr(a)!==ans) cands.push({text:srStr(a),correct:false,mc:"no-change",fb:"1의 자리 순서가 어긋나 있다 — 버킷에 나눠 담고 차례로 꺼내 보라."});
    srNearSlips(cands,ans);
    return {id:"AP12",qtype:"radix",params:{arr:a.join(","),ans:ans},viz:srViz(a),mono:true,
      stem:'[심화 — 기수 정렬] 새 개념 하나. 지금까지의 정렬은 전부 <b>키 비교</b>로 순서를 정했다 — 그런데 비교를 <b>한 번도 하지 않는</b> 정렬이 있다. <b>기수 정렬(radix sort)</b>: 수를 <b>1의 자리</b> 숫자에 따라 0~9의 버킷에 순서대로 나눠 담고, 버킷 0부터 차례로 다시 꺼내 한 줄로 잇는다(분배→수집). 다음엔 <b>10의 자리</b>로 같은 일을 반복 — 자릿수가 d개면 d패스 만에 정렬이 끝난다(<b>O(d·n)</b>). 단, 꺼낼 때 담은 순서를 지켜야(안정 수집) 앞 패스의 결과가 보존된다.<br><br>그림의 배열에 <b>1의 자리 패스</b>(분배→수집) 하나를 수행한 직후의 배열은?',
      okfb:'1의 자리만 보고 버킷 순서로 다시 세우면 — '+ans+'. 다음 패스(10의 자리)가 끝나면 전체 정렬이 완성된다.',
      choices:g2Fill(cands,{text:ans,correct:true},4)};
  }
  if(idx===1){
    /* 퀵 최악 — 정렬된 입력 + 첫 피봇의 첫 분할 */
    const n=pick([6,7,8]);
    const base=srArr(n).sort((x,y)=>x-y);
    const ans="피봇이 [0]에 그대로 — 왼쪽 부리스트가 비고, 오른쪽 "+(n-1)+"개가 통째로 남는다";
    return {id:"AP12",qtype:"qworst",params:{arr:base.join(","),ans:ans},viz:srViz(base,[0]),mono:true,
      stem:'[심화 — 퀵의 함정] 그림처럼 <b>이미 정렬된</b> 배열에 첫 원소 '+base[0]+'를 피봇으로 퀵 정렬을 시작하면, <b>첫 분할의 결과</b>는?',
      okfb:'피봇보다 작은 원소가 하나도 없다 — 분할이 0 : '+(n-1)+'로 완전히 쏠린다. 이것이 매 단계 반복되면 깊이가 n이 되어 O(n²) — 퀵이 정렬된 입력을 가장 싫어하는 이유이고, 중간값·무작위 피봇이 처방인 이유다.',
      choices:g2Fill([
        {text:"피봇이 정확히 가운데 자리에 앉아 — 좌우 부리스트가 반반에 가깝게 나뉜다",correct:false,mc:"half-myth",fb:"피봇의 자리는 '저보다 작은 것의 수'가 정한다 — 작은 것이 0개다."},
        {text:"이미 정렬된 상태임이 감지되어 — 분할 없이 그 자리에서 즉시 종료된다",correct:false,mc:"detect-myth",fb:"퀵에는 정렬 감지 장치가 없다 — 분할은 어김없이 수행된다."},
        {text:"배열이 역순으로 한 번 뒤집힌 뒤 — 뒤집힌 배열에서 정렬이 다시 시작된다",correct:false,mc:"reverse-myth",fb:"교환이 일어날 어긋난 쌍 자체가 없다 — 쏠린 분할만 남는다."}
      ],{text:ans,correct:true},4)};
  }
  /* idx 2 — 표 종합 판정 */
  const cases=[
    {req:"최악에도 O(n log n) <b>보장</b> + <b>안정</b> (추가 배열은 감수)", ans:"합병 정렬", why:"보장·안정 둘 다는 합병뿐 — 추가 배열 O(n)이 그 대가다."},
    {req:"최악에도 O(n log n) <b>보장</b> + <b>추가 배열 없이</b> (안정성은 포기)", ans:"히프 정렬", why:"보장 + 제자리 = 히프 — 안정성을 내준 자리다."},
    {req:"<b>평균 최속</b> + 제자리 (최악 O(n²) 위험과 불안정은 감수)", ans:"퀵 정렬", why:"평균 O(n log n) 실전 최속 — 위험은 피봇 전략으로 줄인다."}
  ];
  const c=pick(cases);
  const others=["퀵 정렬","합병 정렬","히프 정렬","삽입 정렬"].filter(x=>x!==c.ans).slice(0,3);
  return {id:"AP12",qtype:"table",params:{req:c.req,ans:c.ans},
    stem:'[심화 — 종합 판정] 요구 조건 — "'+c.req+'". 표에서 이 조건을 전부 만족하는 정렬은?',
    okfb:c.why,
    choices:[
      {text:c.ans,correct:true},
      {text:others[0],correct:false,mc:"table-slip1",fb:"보장·안정·메모리 세 칸을 하나씩 대조해 보라."},
      {text:others[1],correct:false,mc:"table-slip2",fb:"조건 중 하나가 어긋난다 — 어느 칸인가."},
      {text:others[2],correct:false,mc:"table-slip3",fb:"요구 조건을 표의 행과 정확히 맞춰 보라."}]};
}
