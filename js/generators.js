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
      {text:"0x⁵ 이 attach된다",correct:false,mc:"zero-sum",fb:"계수 0인 항은 '없는 항'이다. if(coefficient)가 막는다."},
      {text:"오류가 발생한다",correct:false,mc:"zero-sum",fb:"오류가 아니라 정상적인 소거다. 3x²-3x²처럼."}])};
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
        {text:nm2+"이(가) 결국 더 빨라진다",correct:false,mc:"coef-first",fb:"계수가 커 보여도, 등급이 다르면 n이 커질수록 등급이 이긴다."},
        {text:"계속 엎치락뒤치락한다",correct:false,mc:"growth-misread",fb:"성장률이 다른 두 곡선은 어느 지점 이후로는 다시 만나지 않는다."},
        {text:"n과 무관하게 항상 같다",correct:false,mc:"growth-misread",fb:"둘 다 n의 함수다 — n이 커지면 달라진다."}])};
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
