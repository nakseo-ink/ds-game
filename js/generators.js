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
