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
      {o:"O(n)", ans:"약 두 배가 된다", why:"2n — 비례해서 늘어난다."},
      {o:"O(n²)", ans:"약 네 배가 된다", why:"(2n)² = 4n² — 제곱은 두 배가 아니라 네 배."},
      {o:"O(log n)", ans:"한 단계 늘어날 뿐, 거의 그대로다", why:"log(2n) = log n + 1 — 딱 한 번 더."},
      {o:"O(1)", ans:"변하지 않는다", why:"애초에 n과 무관한 시간이다."}]);
    const all=["약 두 배가 된다","약 네 배가 된다","한 단계 늘어날 뿐, 거의 그대로다","변하지 않는다"];
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
