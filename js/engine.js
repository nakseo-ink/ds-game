"use strict";
/* 엔진 — 씬 러너 + 위젯 5종 (W1 메모리 띠, W2 단계 실행, W3 링크 조작, W4 문답, W5 HUD)
   챕터 데이터(CH01)와 생성기(generators.js)만 바꾸면 콘텐츠가 바뀐다. */

const CH = CH01; // 현재 챕터 (추후 챕터 선택 로직으로 확장)
const stage = document.getElementById("stage");

/* ============ 상태 (W5) + 지갑(영속) ============ */
const WALLETKEY="dsgame_wallet";
const wallet=JSON.parse(localStorage.getItem(WALLETKEY)||'{"balance":0,"inventory":[]}');
function saveWallet(){ wallet.balance=S.balance; localStorage.setItem(WALLETKEY,JSON.stringify(wallet)); }
const S = { balance:wallet.balance||0, tutorFirstTry:0, tutorPassed:false, aplusAccepted:false, aplusSuccess:false };
/* ---- 진행 저장 (이어하기 · 진도 코드) ---- */
const SAVEKEY="dsgame_save";
let saveData=JSON.parse(localStorage.getItem(SAVEKEY)||"null");
function saveCP(cp){
  saveData={v:1, cp,
    S:{tutorFirstTry:S.tutorFirstTry, tutorPassed:S.tutorPassed, aplusAccepted:S.aplusAccepted, aplusSuccess:S.aplusSuccess},
    streaks:{A:streakA,B:streakB,C:streakC,D:streakD,E:streakE}, tracesB, runsD, ts:Date.now()};
  localStorage.setItem(SAVEKEY,JSON.stringify(saveData));
}
function clearSave(){ saveData=null; localStorage.removeItem(SAVEKEY); }
function exportCode(){
  const p={v:1, save:saveData, wallet:{balance:S.balance, inventory:wallet.inventory}};
  return btoa(unescape(encodeURIComponent(JSON.stringify(p))));
}
function importCode(str){
  try{
    const p=JSON.parse(decodeURIComponent(escape(atob(String(str).trim()))));
    if(p.v!==1) return false;
    if(p.wallet){ wallet.inventory=p.wallet.inventory||[]; S.balance=p.wallet.balance||0; saveWallet(); }
    if(p.save && p.save.cp) localStorage.setItem(SAVEKEY,JSON.stringify(p.save)); else localStorage.removeItem(SAVEKEY);
    return true;
  }catch(e){ return false; }
}
function setHUD(day,unit){ if(day)$("#hud-day").textContent=day; if(unit)$("#hud-unit").textContent=unit; }
function streakBar(n,extra){return '<div class="streak">숙달까지 — 힌트 없이 연속 정답'+
  '<span class="dot '+(n>0?"on":"")+'"></span><span class="dot '+(n>1?"on":"")+'"></span><span class="dot '+(n>2?"on":"")+'"></span>'+
  '<span style="margin-left:auto;">'+(extra||"")+'</span></div>';}

/* ============ W1 메모리 띠 ============ */
function memoryStrip({base,size,values,showAddr=true,hiIdx=-1,dimOthers=false,small=false,labels=null}){
  const strip=el('<div class="strip"></div>');
  values.forEach((v,i)=>{
    const addr=(showAddr&&base!==undefined)?fmtHex(base+i*size):"";
    const lab=labels?labels[i]:('['+i+']');
    const cls=["cell", small?"sm":"", i===hiIdx?"hi":"", (dimOthers&&i!==hiIdx)?"dim":""].join(" ");
    strip.appendChild(el('<div class="cellwrap"><div class="idx">'+lab+'</div><div class="'+cls+'">'+v+'</div><div class="addr">'+addr+'</div></div>'));
  });
  return strip;
}
/* ============ 희소 행렬 렌더 (study·trial 공용) ============ */
function sparseGrid(n,elems,hi){
  const grid=el('<div class="grid" style="grid-template-columns:repeat('+n+',44px);"></div>');
  for(let r=0;r<n;r++)for(let c=0;c<n;c++){
    const e=elems.find(x=>x.r===r&&x.c===c);
    const isHi=hi&&hi.r===r&&hi.c===c;
    grid.appendChild(el('<div class="gcell'+(e?(isHi?" hi":""):" zero")+'">'+(e?e.v:0)+'</div>'));
  }
  return grid;
}
function tripleTable(n,elems,mode,hiIdx){
  let t='<table class="trip"><tr><th></th><th>row</th><th>col</th><th>value</th></tr>';
  if(mode!=="data") t+='<tr><td>a[0]</td><td>'+n+'</td><td>'+n+'</td><td>'+elems.length+'</td></tr>';
  if(mode!=="header") elems.forEach((e,i)=>{ t+='<tr'+(hiIdx===i?' class="hi"':'')+'><td>a['+(i+1)+']</td><td>'+e.r+'</td><td>'+e.c+'</td><td>'+e.v+'</td></tr>'; });
  t+='</table>';
  return el(t);
}

/* ============ W4 MCQ 공통 ============ */
function renderMCQ(container,item,opts){
  let answered=false; const t0=Date.now();
  container.appendChild(el('<div class="stem">'+item.stem+'</div>'));
  const ch=el('<div class="choices"></div>'); const fb=el('<div></div>');
  item.choices.forEach((c,ci)=>{
    const b=el('<button class="choice'+(item.mono?" mono":"")+'">'+["①","②","③","④"][ci]+" "+c.text+"</button>");
    b.onclick=()=>{
      if(answered) return; answered=true;
      const hintUsed=opts.hintUsed?opts.hintUsed():false;
      log("answer",{unit:opts.unit, itemId:item.id||"item", correct:c.correct, mc:c.correct?null:c.mc, hintUsed, elapsedMs:Date.now()-t0});
      [...ch.children].forEach(x=>{x.disabled=true;});
      if(c.correct){
        b.classList.add("correct");
        fb.appendChild(el('<div class="feedback ok fade">✅ '+(c.fb||item.okfb||"정답.")+(hintUsed?"<br>📖 힌트를 봤으므로 이번 정답은 연속 기록에 넣지 않는다.":"")+'</div>'));
      }else{
        b.classList.add("wrong");
        fb.appendChild(el('<div class="feedback fade">'+(opts.fbPrefix||'📖 <i>책의 여백 메모</i> — ')+c.fb+'</div>'));
      }
      opts.onDone(c.correct,hintUsed,fb);
    };
    ch.appendChild(b);
  });
  container.appendChild(ch); container.appendChild(fb);
}
function attachBook(card,hints,unit,isAnswered){
  let hintUsed=false, lv=0;
  const book=el('<div id="book"><button class="btn ghost">📖 낡은 책 펼치기 <span class="tag">무패널티 · 연속 기록만 제외</span></button><div></div></div>');
  const btn=book.querySelector("button"), body=book.children[1];
  btn.onclick=()=>{
    if(isAnswered&&isAnswered()) return;
    if(lv<hints.length){ hintUsed=true; log("hint_open",{unit, level:lv+1});
      body.appendChild(el('<div class="bookpanel fade">'+hints[lv]+'</div>')); lv++;
      if(lv===hints.length) btn.disabled=true; }
  };
  card.appendChild(book);
  return ()=>hintUsed;
}
function nextBtnRow(label,fn){
  const n=el('<div style="margin-top:14px;text-align:right;"><button class="btn">'+label+'</button></div>');
  n.querySelector("button").onclick=fn; return n;
}

/* ================================================================ 유닛 A ================ */
let streakA=0, attemptsA=0;
function sceneStudy(unitKey, onDone){
  saveCP("study-"+unitKey);
  const U=CH.study[unitKey];
  setHUD(U.day,U.label);
  log("study_step",{unit:unitKey, step:"start"});
  stage.innerHTML="";
  const card=el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">📖 자습 — '+U.title+'</div><div></div></div>');
  stage.appendChild(card);
  const box=card.children[1];
  const queue=U.beats.slice();
  function scrollBottom(){ window.scrollTo({top:document.body.scrollHeight, behavior:"smooth"}); }
  function contBtn(label,fn,ghost){
    const d=el('<div style="margin-top:10px;text-align:right;"><button class="btn'+(ghost?" ghost":"")+'" style="padding:7px 18px;">'+label+'</button></div>');
    d.querySelector("button").onclick=()=>{ d.remove(); fn(); };
    box.appendChild(d); scrollBottom();
  }
  function renderBody(b){
    if(b.say!==undefined){
      if((b.who||"me")==="book") box.appendChild(el('<div class="bookpanel fade">'+b.say+'</div>'));
      else box.appendChild(el('<div class="dlg fade"><div class="portrait">'+AV("me"+(b.mood?"-"+b.mood:""))+'</div><div class="bubble"><div class="who">나</div>'+b.say+'</div></div>'));
    }
    if(b.code){ const cb=el('<div class="codebox fade"></div>'); b.code.forEach(ln=>cb.appendChild(el('<div class="codeline">'+(ln===""?" ":hlC(String(ln)))+'</div>'))); box.appendChild(cb); }
    if(b.strip) box.appendChild(memoryStrip(b.strip));
    if(b.sparse){ const w=el('<div class="fade" style="display:flex;gap:26px;align-items:flex-start;flex-wrap:wrap;"></div>');
      w.appendChild(sparseGrid(b.sparse.n,b.sparse.elems,null));
      w.appendChild(tripleTable(b.sparse.n,b.sparse.elems,b.sparse.mode||"full",null));
      box.appendChild(w); }
  }
  function next(){
    if(!queue.length){ contBtn(U.doneLabel||"다음 ▶", onDone, false); return; }
    const b=queue.shift();
    if(b.gate){
      box.appendChild(el('<div class="dlg fade"><div class="portrait">'+AV("me")+'</div><div class="bubble"><div class="who">나 (자문)</div>'+b.gate.q+'</div></div>'));
      const g=el('<div class="fade" style="display:flex;gap:10px;justify-content:flex-end;margin:10px 0;"></div>');
      const yes=el('<button class="btn ghost">'+(b.gate.yes||"응, 알고 있어")+'</button>');
      const no=el('<button class="btn">'+(b.gate.no||"음… 모르겠는데?")+'</button>');
      yes.onclick=()=>{ log("gate",{unit:unitKey,id:b.gate.id,known:true}); g.remove();
        box.appendChild(el('<div class="caption fade" style="min-height:auto;">— 아는 내용, 건너뛴다 —</div>')); next(); };
      no.onclick=()=>{ log("gate",{unit:unitKey,id:b.gate.id,known:false}); g.remove();
        for(let i=b.gate.basics.length-1;i>=0;i--) queue.unshift(b.gate.basics[i]); next(); };
      g.appendChild(yes); g.appendChild(no); box.appendChild(g); scrollBottom();
      return;
    }
    if(b.check){
      const wrap=el('<div class="fade" style="margin-top:8px;"></div>');
      wrap.appendChild(el('<div style="font-size:12.5px;color:var(--accent);margin:6px 0;">✏️ 확인 — 맞혀야 넘어간다</div>'));
      const item={...b.check, choices:shuffle(b.check.choices.map(c=>({...c})))};
      box.appendChild(wrap); scrollBottom();
      renderMCQ(wrap,item,{unit:unitKey+"-study",hintUsed:()=>false,onDone:(correct,_,fb)=>{
        if(correct){ const d=el('<div style="margin-top:10px;text-align:right;"><button class="btn" style="padding:7px 18px;">계속 ▼</button></div>');
          d.querySelector("button").onclick=()=>{ d.remove(); next(); }; fb.appendChild(d); scrollBottom(); }
        else{ const r=el('<div style="margin-top:10px;text-align:right;"><button class="btn ghost">다시 풀기 ↺</button></div>');
          r.querySelector("button").onclick=()=>{ wrap.remove(); queue.unshift(b); next(); }; fb.appendChild(r); scrollBottom(); }
      }});
      return;
    }
    renderBody(b);
    contBtn("계속 ▼", next, true);
  }
  next();
}
function sceneTrialA(){
  saveCP("trialA");
  const item=genG1(); attemptsA++;
  log("item_shown",{unit:"A",gen:"G1",params:item.params,attempt:attemptsA});
  stage.innerHTML="";
  const card=el('<div class="card fade">'+streakBar(streakA,"문제 #"+attemptsA)+'</div>');
  card.appendChild(memoryStrip(item.strip));
  let answered=false;
  const qbox=el('<div style="margin-top:12px;"></div>'); card.appendChild(qbox); stage.appendChild(card);
  const getHint=attachBook(card,CH.hints.A,"A",()=>answered);
  renderMCQ(qbox,item,{unit:"A",hintUsed:getHint,onDone:(correct,hintUsed,fb)=>{
    answered=true;
    if(correct){ if(!hintUsed) streakA++; } else streakA=0;
    if(streakA>=3){ log("mastery_reached",{unit:"A",attempts:attemptsA});
      fb.appendChild(nextBtnRow("숙달 — 책의 여백 메모 ▶",sceneBigO)); }
    else fb.appendChild(nextBtnRow("다음 문제 ▶",sceneTrialA));
  }});
}
function sceneBigO(){
  saveCP("bigO");
  stage.innerHTML="";
  const card=el('<div class="card fade">'+
    '<div style="font-size:13px;color:var(--ink-dim);">📖 책의 여백에 이런 메모가 있다</div>'+
    '<div class="bookpanel" style="margin-top:12px; font-size:15.5px;">"<span class="mono">list[3]</span>이든 <span class="mono">list[999999]</span>든, 주소 계산은 <b>곱셈 한 번, 덧셈 한 번</b>.<br>배열의 인덱스 접근이 크기와 무관하게 <b>항상 같은 시간</b> — 상수 시간, <b>O(1)</b> — 인 이유가 이것이다."</div>'+
    '<div class="dlg" style="margin-top:20px;"><div class="portrait">'+AV("me-proud")+'</div><div class="bubble"><div class="who">나</div><span class="inner">유닛 A 숙달. 그런데 책에서 이상한 걸 봤다. "배열을 함수에 넘기면 원본이 바뀐다"…? C는 복사해서 넘긴다며. 내일 밤, 이걸 파보자.</span></div></div></div>');
  CH.interludes.A.forEach(d=>card.appendChild(el('<div class="dlg" style="margin-top:12px;"><div class="portrait">'+AV(d.face)+'</div><div class="bubble"><div class="who">'+d.who+'</div>'+d.text+'</div></div>')));
  card.appendChild(el('<div style="margin-top:16px; text-align:right;"><button class="btn" id="tue">화요일 밤 — 유닛 B ▶</button></div>'));
  stage.appendChild(card);
  $("#tue").onclick=()=>sceneStudy("B",sceneTraceB);
}

/* ================================================================ 유닛 B (W2) — 트레이스 3종 ================ */
let streakB=0, tracesB=0;
function genTraceB(){
  const order=["value","ref","array"];
  const kind = tracesB<3 ? order[tracesB] : pick(order);
  const a=2+Math.floor(Math.random()*7);
  if(kind==="value"){
    const lines=["void twice(int n) {    /* n은 x의 복사본 */","    n = n * 2;","}","","int main(void) {","    int x = "+a+";","    twice(x);            /* 값 전달 — call by value */",'    printf("%d", x);',"}"];
    const steps=[
      {line:5, cap:'x가 만들어졌다. 값은 '+a+'.', vars:[{n:"x",v:a}]},
      {line:6, cap:'twice 호출 — x의 <b>값 '+a+'이 복사</b>되어 n에 담긴다. x와 n은 <b>서로 다른 저장 공간</b>이다.', vars:[{n:"x",v:a},{n:"n",v:a}]},
      {line:1, predict:{id:"BT-V1", stem:'⏸ <span class="mono">n = n * 2;</span> 실행 — main의 <b>x</b>는 어떻게 될까?',
        okfb:'바뀐 것은 복사본 n뿐이다. call by value — 원본은 그대로다.',
        choices:shuffle([
          {text:"그대로 "+a+"이다 — n은 복사본이니까", correct:true},
          {text:(a*2)+"가 된다", correct:false, mc:"value-vs-ref", fb:"바뀐 것은 복사본 n이다. x와 n은 서로 다른 저장 공간이다."},
          {text:"쓰레기값이 된다", correct:false, mc:"garbage-confusion", fb:"x는 건드려지지 않았다."}])},
       cap:'n만 '+(a*2)+'가 되었다. x는 그대로 '+a+'.', varsBefore:[{n:"x",v:a},{n:"n",v:a}], vars:[{n:"x",v:a},{n:"n",v:a*2}]},
      {line:7, predict:{id:"BT-V2", stem:'⏸ <span class="mono">printf("%d", x)</span> — 출력은?',
        okfb:'call by value — 원본 x는 처음 그대로다.',
        choices:shuffle([
          {text:String(a), correct:true},
          {text:String(a*2), correct:false, mc:"value-vs-ref", fb:"함수가 바꾼 것은 자신의 복사본이었다."}])},
       cap:'출력: '+a+' — <b>값 전달은 원본을 바꾸지 못한다.</b>', vars:[{n:"x",v:a}]}];
    return {kind,lines,steps,label:"트레이스 ① 값 전달 (call by value)"};
  }
  if(kind==="ref"){
    const lines=["void twice(int *p) {   /* p는 x의 주소를 받는다 */","    *p = *p * 2;","}","","int main(void) {","    int x = "+a+";","    twice(&x);           /* 주소 전달 — call by reference */",'    printf("%d", x);',"}"];
    const steps=[
      {line:5, cap:'x가 만들어졌다. 값은 '+a+'.', vars:[{n:"x",v:a}]},
      {line:6, cap:'twice 호출 — 이번에 복사되는 값은 <b>x의 주소</b>다. p는 x가 있는 곳을 가리킨다.', vars:[{n:"x",v:a},{n:"p",v:"&x"}], ptrNote:"p → x"},
      {line:1, predict:{id:"BT-R1", stem:'⏸ <span class="mono">*p = *p * 2;</span> 실행 — main의 <b>x</b>는?',
        okfb:'*p는 p가 가리키는 곳 — x 그 자체다. 원본이 바뀐다.',
        choices:shuffle([
          {text:(a*2)+"가 된다 — *p는 x 자체니까", correct:true},
          {text:"그대로 "+a+"이다", correct:false, mc:"value-vs-ref", fb:"주소를 넘겼다. *p로 고친 것은 복사본이 아니라 x가 있는 그 자리다."},
          {text:"p만 바뀐다", correct:false, mc:"ptr-target-confusion", fb:"*p에 대입하면 p가 아니라 'p가 가리키는 곳'이 바뀐다."}])},
       cap:'x가 '+(a*2)+'로 바뀌었다 — 주소를 통해 <b>원본을</b> 고쳤다.', varsBefore:[{n:"x",v:a},{n:"p",v:"&x"}], vars:[{n:"x",v:a*2},{n:"p",v:"&x"}], ptrNote:"p → x"},
      {line:7, predict:{id:"BT-R2", stem:'⏸ 출력은?',
        okfb:'주소 전달 — 원본이 바뀌었다. 이 관용이 call by reference다.',
        choices:shuffle([
          {text:String(a*2), correct:true},
          {text:String(a), correct:false, mc:"value-vs-ref", fb:"이번엔 주소를 넘겼다 — 원본이 바뀌는 쪽이다."}])},
       cap:'출력: '+(a*2)+'.', vars:[{n:"x",v:a*2}]}];
    return {kind,lines,steps,label:"트레이스 ② 주소 전달 (call by reference)"};
  }
  const g=genG2();
  const lines=CODE_B(g.vals);
  const steps=[
    {line:1, cap:'main이 시작되고 <span class="mono">input</span> 배열이 만들어졌다. 이 5칸은 main의 것이다.', strip:{values:g.vals.slice(),hiIdx:-1}, showPtr:false},
    {line:2, cap:'<b>sum(input, 5) 호출.</b> 겉모습엔 &도 *도 없다 — 그러나 input은 이름 자체가 <b>첫 원소의 주소</b>. 복사되어 넘어가는 값은 그 <b>주소</b>이고, 이제 sum의 list와 main의 input은 <b>같은 메모리 주소를 가리킨다</b>.', strip:{values:g.vals.slice(),hiIdx:-1}, showPtr:true},
    {line:9, cap:'루프가 돌며 <span class="mono">s</span>에 값이 쌓인다. 루프가 끝나면 s = '+g.vals.join("+")+" = <b>"+g.sum+"</b>.", strip:{values:g.vals.slice(),hiIdx:-1}, showPtr:true, vars:[{n:"s",v:g.sum}]},
    {line:10, predict:{ id:"BT-A1",
        stem:'⏸ 다음 줄 <span class="mono">list[0] = 0;</span> 이 실행되면, <b>main의 input[0]</b>은 어떻게 될까?',
        okfb:'list와 input은 같은 메모리 주소를 가리킨다 — <b>원본이 바뀐다.</b>',
        choices:shuffle([
          {text:"그대로 "+g.vals[0]+"이다 — 함수는 복사본을 받으니까", correct:false, mc:"call-by-value-array", fb:"복사된 것은 배열이 아니라 '시작 주소'다. 주소의 복사본으로도 같은 곳을 찾아간다."},
          {text:"0이 된다 — list와 input은 같은 메모리 주소를 가리키니까", correct:true},
          {text:"쓰레기값이 된다", correct:false, mc:"garbage-confusion", fb:"명확히 0을 써넣었다. 쓰레기가 아니라 0이다."}])},
     cap:'<span class="mono">list[0] = 0</span> 실행 — input[0]이 <b>0으로 바뀌었다.</b>',
     stripBefore:{values:g.vals.slice(),hiIdx:0}, strip:{values:[0].concat(g.vals.slice(1)),hiIdx:0}, showPtr:true, vars:[{n:"s",v:g.sum}]},
    {line:11, cap:'sum이 끝나 list는 사라진다. 하지만 <b>input 배열의 값은 바뀐 채 유지된다</b> — answer에는 '+g.sum+'이 담긴다.', strip:{values:[0].concat(g.vals.slice(1)),hiIdx:0}, showPtr:false},
    {line:3, predict:{ id:"BT-A2",
        stem:'⏸ 이제 <span class="mono">printf("%d %d", answer, input[0])</span> — 출력되는 두 값은?',
        okfb:'합은 바뀌기 <b>전</b>에 이미 계산됐고(answer='+g.sum+'), input[0]은 sum 안에서 0이 되었다.',
        choices:shuffle([
          {text:g.sum+" "+g.vals[0], correct:false, mc:"call-by-value-array", fb:"input[0]은 이미 sum 안에서 0이 되었다. 배열 전달 = 주소 전달 — 그것이 이 실험의 핵심이다."},
          {text:g.sum+" 0", correct:true},
          {text:"0 0", correct:false, mc:"order-confusion", fb:"answer는 list[0]=0 '이전'의 루프에서 이미 다 더한 합이다. 순서를 보라."}])},
     cap:'출력: <span class="mono">'+g.sum+' 0</span> — <b>겉모습은 값 전달, 실제는 주소 전달.</b> 배열의 함정을 확인했다.',
     strip:{values:[0].concat(g.vals.slice(1)),hiIdx:0}, showPtr:false}];
  return {kind:"array",lines,steps,label:"트레이스 ③ 배열 전달 — 겉모습은 value?"};
}
function sceneTraceB(){
  saveCP("traceB");
  setHUD("화요일","유닛 B");
  const tr=genTraceB(); tracesB++;
  log("item_shown",{unit:"B",gen:"G2",kind:tr.kind,trace:tracesB});
  runTrace(tr,0);
}
function runTrace(tr,si){
  stage.innerHTML="";
  const st=tr.steps[si];
  const card=el('<div class="card fade">'+streakBar(streakB,tr.label+" · 단계 "+(si+1)+"/"+tr.steps.length)+'</div>');
  const cb=el('<div class="codebox"></div>');
  tr.lines.forEach((ln,li)=>cb.appendChild(el('<div class="codeline'+(li===st.line?" hi":"")+'">'+(ln===""?" ":hlC(ln))+'</div>')));
  card.appendChild(cb);
  const memArea=el('<div></div>'); card.appendChild(memArea);
  function renderState(strip,vars){
    memArea.innerHTML="";
    if(strip){
      memArea.appendChild(el('<div class="memlabel">main의 메모리 — <span class="mono">input</span>'+(st.showPtr?' <span class="ptrnote">← sum의 <span class="mono">list</span>가 같은 곳을 가리키는 중</span>':'')+'</div>'));
      memArea.appendChild(memoryStrip({base:0x1000,size:4,values:strip.values,showAddr:false,hiIdx:strip.hiIdx}));
    }
    if(vars){
      const row=el('<div></div>');
      vars.forEach(v=>row.appendChild(el('<div class="varbox"><span style="color:var(--ink-dim);"><span class="mono">'+v.n+'</span> =</span><div class="cell">'+v.v+'</div></div>')));
      if(st.ptrNote) row.appendChild(el('<span class="ptrnote" style="margin-left:10px;">'+st.ptrNote+'</span>'));
      memArea.appendChild(row);
    }
  }
  renderState(st.stripBefore||st.strip, st.varsBefore||st.vars);
  const body=el('<div></div>'); card.appendChild(body); stage.appendChild(card);
  let answered=false;
  const getHint=attachBook(card,CH.hints.B,"B",()=>answered);
  function showCapAndNext(){
    body.appendChild(el('<div class="caption fade">'+st.cap+'</div>'));
    const last=si===tr.steps.length-1;
    const mastered=streakB>=3&&tracesB>=3;
    body.appendChild(nextBtnRow(last?(mastered?"유닛 B 숙달 ▶":"다음 트레이스 ▶"):"다음 ▶",()=>{
      if(!last) runTrace(tr,si+1);
      else if(mastered){ log("mastery_reached",{unit:"B",traces:tracesB}); sceneClearB(); }
      else sceneTraceB();
    }));
  }
  if(st.predict){
    renderMCQ(body,{id:st.predict.id,stem:st.predict.stem,okfb:st.predict.okfb,choices:st.predict.choices},
      {unit:"B",hintUsed:getHint,onDone:(correct,hintUsed)=>{
        answered=true;
        if(correct){ if(!hintUsed) streakB++; } else streakB=0;
        setTimeout(()=>{ renderState(st.strip,st.vars); showCapAndNext(); },350);
      }});
  } else showCapAndNext();
}
function sceneClearB(){
  saveCP("clearB");
  stage.innerHTML="";
  const card=el('<div class="card fade">'+
    '<div class="bookpanel" style="font-size:15px;">"세 실험의 결론 — C의 함수 호출은 언제나 <b>값의 복사</b>다. 값을 주면 복사본만 바뀌고, 주소를 주면 원본을 고칠 수 있다.<br>그리고 배열은 — <b>이름 자체가 주소라서, &를 쓰지 않아도 주소가 전달된다.</b> 겉모습에 속지 마라."</div>'+
    '<div class="dlg" style="margin-top:20px;"><div class="portrait">'+AV("me-shock")+'</div><div class="bubble"><div class="who">나</div><span class="inner">…이거다. 도윤이가 물어볼 만한 게 눈에 보인다. 내일이 과외다.</span></div></div>');
  CH.interludes.B.forEach(d=>card.appendChild(el('<div class="dlg" style="margin-top:12px;"><div class="portrait">'+AV(d.face)+'</div><div class="bubble"><div class="who">'+d.who+'</div>'+d.text+'</div></div>')));
  card.appendChild(el('<div style="margin-top:16px; text-align:right;"><button class="btn" id="wed">수요일 — 과외 시작 ▶</button></div>'));
  stage.appendChild(card);
  $("#wed").onclick=()=>sceneTutoring(1);
}

/* ================================================================ 과외 (W4) ================ */
function sceneTutoring(round){
  if(round===1) saveCP("tutor1");
  setHUD(round===1?"수요일":"토요일", round===1?"과외 1일차":"보충 과외");
  const firstTry=[];
  log("tutoring_start",{round});
  askQ(0);
  function askQ(qi){
    stage.innerHTML="";
    const q=CH.tutorQs[qi];
    const shuffled=shuffle(q.choices.map(c=>({...c})));
    const card=el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">🏠 도윤의 방 — '+(round===1?"과외":"보충")+' '+(qi+1)+'/'+CH.tutorQs.length+(q.boss?' <span class="tag" style="color:var(--accent);border-color:var(--accent);">보스 질문</span>':'')+'</div></div>');
    card.appendChild(el('<div class="dlg"><div class="portrait">'+AV("doyun")+'</div><div class="bubble"><div class="who">도윤</div>'+q.ask+'</div></div>'));
    const body=el('<div style="margin-top:16px;"></div>'); card.appendChild(body); stage.appendChild(card);
    let tries=0; render();
    function render(){
      body.innerHTML="";
      renderMCQ(body,{id:q.id, stem:tries===0?"뭐라고 답할까?":"다시 답해 보자.", choices:shuffled},
        {unit:"tutor", fbPrefix:'<b>도윤</b> — ', hintUsed:()=>false, onDone:(correct,_,fb)=>{
          tries++;
          if(correct){
            if(tries===1) firstTry.push(q.id);
            log("tutor_answer",{q:q.id, round, firstTry:tries===1, tries});
            fb.querySelector(".feedback").innerHTML='<b>도윤</b> — '+q.choices.find(c=>c.correct).fb;
            fb.appendChild(nextBtnRow(qi<CH.tutorQs.length-1?"다음 질문 ▶":"결과 보기 ▶",()=> qi<CH.tutorQs.length-1?askQ(qi+1):finish()));
          }else{
            const n=el('<div style="margin-top:14px;text-align:right;"><button class="btn ghost">다시 답하기 ↺</button></div>');
            n.querySelector("button").onclick=render; fb.appendChild(n);
          }
        }});
    }
  }
  function finish(){
    const passed=firstTry.length>=2;
    log("tutoring_result",{round, firstTryCount:firstTry.length, passed});
    if(round===1){ S.tutorFirstTry=firstTry.length; S.tutorPassed=passed; sceneTutorResult(passed,firstTry.length); }
    else {
      if(passed){ S.tutorPassed=true; sceneAplusOffer(); }
      else {
        stage.innerHTML="";
        stage.appendChild(el('<div class="card fade"><div class="dlg"><div class="portrait">'+AV("doyun-worried")+'</div><div class="bubble"><div class="who">도윤</div>으으… 한 번만 더요. 이번엔 진짜 알 것 같단 말이에요.</div></div>'+
          '<div style="margin-top:16px;text-align:right;"><button class="btn" id="re">보충 다시 ↺</button></div></div>'));
        $("#re").onclick=()=>sceneTutoring(2);
      }
    }
  }
}
function sceneTutorResult(passed,count){
  saveCP("study-C");
  $("#hud-grade").textContent=passed?"상승 중":"불안";
  stage.innerHTML="";
  const msg=passed
    ? '<div class="dlg"><div class="portrait">'+AV("doyun-happy")+'</div><div class="bubble"><div class="who">도윤</div>오늘 좀 이해된 것 같아요. 특히 그 "집 주소" 얘기… 시험에 나오면 쓸 수 있겠어요.</div></div>'
    : '<div class="dlg"><div class="portrait">'+AV("doyun-worried")+'</div><div class="bubble"><div class="who">도윤</div>음… 쌤, 오늘 설명 좀 헷갈렸어요. 토요일에 한 번 더 해주시면 안 돼요?</div></div>';
  stage.appendChild(el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">과외 1일차 결과 <span class="tag">통과 기준: 첫 시도 정답 2/3</span></div>'+msg+
    '<div class="caption">첫 시도 정답 '+count+'/3 — '+(passed?"통과 ✅ 목요일 밤부터 다음 유닛을 판다.":"미달 🔁 토요일 보충 과외가 잡혔다. 그 전에 남은 유닛을 마저 파자.")+'</div>'+
    '<div style="margin-top:16px; text-align:right;"><button class="btn" id="thu">목요일 밤 — 유닛 C ▶</button></div></div>'));
  $("#thu").onclick=()=>sceneStudy("C",sceneLinkPuzzle);
}

/* ================================================================ 유닛 C (W3) ================ */
let streakC=0, poolC=[], attemptsC=0;
function sceneLinkPuzzle(){
  saveCP("linkPuzzle");
  setHUD("목요일","유닛 C"); log("study_step",{unit:"C",step:"link-puzzle"});
  stage.innerHTML="";
    const card=el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">📖 자체참조 구조 (self-referential) <span class="tag">조작 미션</span></div>'+
      '<div class="codebox"><div class="codeline">typedef struct list {</div><div class="codeline">  char data;</div><div class="codeline">  struct list *link;  /* 자기 타입을 가리키는 포인터 */</div><div class="codeline">} list;</div></div>'+
      '<div class="caption">멤버 중에 <b>자기 자신과 같은 타입을 가리키는 포인터</b>가 있는 구조. item1, item2, item3의 link를 직접 연결해서 <b>a → b → c → NULL</b> 사슬을 만들어 보자.<br><span style="color:var(--ink-dim);">각 노드의 <span class="mono">link</span> 칸을 클릭한 뒤, 가리킬 노드(또는 NULL)를 클릭.</span></div></div>');
    const links=[null,null,null]; let selecting=-1;
    const NAMES=["item1","item2","item3"], DATA=["a","b","c"];
    const wrap=el('<div></div>'); const warn=el('<div></div>');
    function draw(){
      wrap.innerHTML="";
      const row=el('<div class="nodes"></div>');
      NAMES.forEach((nm,i)=>{
        const linkTxt=links[i]===null?"link: ?":(links[i]==="NULL"?"link: NULL":"link: →"+NAMES[links[i]]);
        const node=el('<div class="node'+(selecting===i?" selecting":"")+(selecting>=0&&selecting!==i?" target":"")+'">'+
          '<div class="ntitle">'+nm+'</div><div class="nrow"><div class="nfield">'+DATA[i]+'</div><div class="nlink">'+linkTxt+'</div></div></div>');
        node.querySelector(".nlink").onclick=(e)=>{ e.stopPropagation(); selecting=i; draw(); };
        node.onclick=()=>{ if(selecting>=0&&selecting!==i){ links[selecting]=i; selecting=-1; draw(); } };
        row.appendChild(node);
      });
      const nullBtn=el('<button class="btn ghost" style="align-self:center;">NULL</button>');
      nullBtn.onclick=()=>{ if(selecting>=0){ links[selecting]="NULL"; selecting=-1; draw(); } };
      row.appendChild(nullBtn);
      wrap.appendChild(row);
    }
    draw();
    const check=el('<div style="margin-top:12px;text-align:right;"><button class="btn">연결 완료 — 확인</button></div>');
    check.querySelector("button").onclick=()=>{
      warn.innerHTML="";
      const goalOK = links[0]===1&&links[1]===2&&links[2]==="NULL";
      log("link_check",{unit:"C", links:links.map(String), ok:goalOK});
      if(goalOK){
        warn.appendChild(el('<div class="feedback ok fade">✅ <span class="mono">item1.link=&item2; item2.link=&item3; item3.link=NULL;</span> — a→b→c 사슬 완성. 이것이 4장에서 만날 <b>연결 리스트</b>의 씨앗이다.</div>'));
        warn.appendChild(nextBtnRow("시련 시작 ▶",sceneTrialC));
      }else{
        const visited=new Set(); let cur=0;
        while(typeof cur==="number"&&!visited.has(cur)){ visited.add(cur); cur=links[cur]; }
        const orphans=NAMES.filter((_,i)=>!visited.has(i));
        if(orphans.length&&visited.size>0)
          warn.appendChild(el('<div class="warn fade">⚠ '+orphans.join(", ")+'… 어디에서도 가리켜지지 않는다. 지금은 변수라서 괜찮지만, 만약 <span class="mono">malloc</span>으로 만든 노드였다면 — 찾아갈 방법이 영영 사라진다. <i>이 이야기는 4장에서.</i> 다시 연결해 보자.</div>'));
        else warn.appendChild(el('<div class="warn fade">⚠ 목표는 a → b → c → NULL. 사슬을 다시 살펴보자. (link가 ?로 남아 있으면 아직 미연결)</div>'));
      }
    };
    card.appendChild(wrap); card.appendChild(check); card.appendChild(warn);
    stage.appendChild(card);
    paintCode(card);
}
function sceneTrialC(){
  saveCP("trialC");
  if(poolC.length===0) poolC=shuffle(CH.poolC.slice());
  const item=poolC.pop(); attemptsC++;
  log("item_shown",{unit:"C",itemId:item.id,attempt:attemptsC});
  stage.innerHTML="";
  const card=el('<div class="card fade">'+streakBar(streakC,"문제 #"+attemptsC+" · "+item.id)+'</div>');
  let answered=false;
  const qbox=el('<div></div>'); card.appendChild(qbox); stage.appendChild(card);
  const getHint=attachBook(card,CH.hints.C,"C",()=>answered);
  const shuffledItem={...item, choices:shuffle(item.choices.map(c=>({...c})))};
  renderMCQ(qbox,shuffledItem,{unit:"C",hintUsed:getHint,onDone:(correct,hintUsed,fb)=>{
    answered=true;
    if(correct){ if(!hintUsed) streakC++; } else streakC=0;
    if(streakC>=3){ log("mastery_reached",{unit:"C",attempts:attemptsC});
      fb.appendChild(nextBtnRow("유닛 C 숙달 ▶",()=>sceneInterlude("C",()=>sceneStudy("D",sceneTrialD),"금요일 밤 — 유닛 D ▶"))); }
    else fb.appendChild(nextBtnRow("다음 문제 ▶",sceneTrialC));
  }});
}

/* ================================================================ 유닛 D ================ */
let streakD=0, runsD=0;
function sceneTrialD(){
  saveCP("trialD");
  const g=genG3(); runsD++;
  log("item_shown",{unit:"D",gen:"G3",params:{A:g.A,B:g.B},run:runsD});
  stepD(g,0,[]);
}
function stepD(g,si,dTerms){
  stage.innerHTML="";
  if(si>=g.steps.length){
    const rest=g.restNote?'<div class="caption">루프 종료 — '+g.restNote+'. </div>':"";
    const card=el('<div class="card fade">'+streakBar(streakD,"[P/G 2.5] padd · 완료")+rest+
      '<div class="caption">결과 D(x) = '+(dTerms.length?dTerms.join(" + ").replace(/\+ -/g,"- "):"(비어 있음)")+' …남은 항 복사까지 마치면 덧셈 끝.</div></div>');
    card.appendChild(nextBtnRow(streakD>=3?"유닛 D 숙달 ▶":"새 다항식으로 다시 ▶",()=>{
      if(streakD>=3){ log("mastery_reached",{unit:"D",runs:runsD}); sceneInterlude("D",()=>sceneStudy("E",sceneTrialE),"이어서 — 유닛 E ▶"); }
      else sceneTrialD();
    }));
    stage.appendChild(card); return;
  }
  const st=g.steps[si];
  const card=el('<div class="card fade">'+streakBar(streakD,"[P/G 2.5] padd · 비교 "+(si+1)+"/"+g.steps.length)+'</div>');
  function termRow(label,terms,cur){
    const row=el('<div class="terms"><span class="plabel">'+label+'</span></div>');
    terms.forEach((t,i)=>{ row.appendChild(el('<span class="term'+(i===cur?" cur":(i<cur?" done":""))+'">'+fmtTerm(t.c,t.e)+'</span>')); });
    return row;
  }
  card.appendChild(termRow("A(x):",g.A,st.ia));
  card.appendChild(termRow("B(x):",g.B,st.ib));
  card.appendChild(el('<div class="terms"><span class="plabel">D(x):</span>'+(dTerms.length?dTerms.map(t=>'<span class="term done" style="opacity:.8;">'+t+'</span>').join(""):'<span style="color:var(--ink-dim);font-size:13px;">(아직 없음)</span>')+'</div>'));
  const body=el('<div style="margin-top:10px;"></div>'); card.appendChild(body); stage.appendChild(card);
  let answered=false;
  const getHint=attachBook(card,CH.hints.D,"D",()=>answered);
  const sumTxt=st.sum!==null?fmtTerm(st.sum,st.ta.e):fmtTerm(st.ta.c+st.tb.c,st.ta.e);
  const choices=shuffle([
    {text:"A의 항 "+fmtTerm(st.ta.c,st.ta.e)+" 가 attach된다", correct:st.action==="A",
     mc:"compare-order", fb:"지수를 비교하라 — "+st.ta.e+" vs "+st.tb.e+". 큰 쪽이 먼저다(내림차순 정돈)."},
    {text:"B의 항 "+fmtTerm(st.tb.c,st.tb.e)+" 가 attach된다", correct:st.action==="B",
     mc:"compare-order", fb:"지수를 비교하라 — "+st.ta.e+" vs "+st.tb.e+". 큰 쪽이 먼저다(내림차순 정돈)."},
    {text:"합쳐진 항 "+sumTxt+" 이 attach된다", correct:st.action==="SUM",
     mc:st.action==="NONE"?"zero-sum":"exp-mismatch", fb:st.action==="NONE"?"계수 합이 "+st.ta.c+"+("+st.tb.c+")=0 — if(coefficient) 검사에 걸려 아무것도 넣지 않는다.":"지수가 같을 때만 계수를 합친다."},
    {text:"아무것도 추가되지 않는다", correct:st.action==="NONE",
     mc:"zero-sum-overuse", fb:"아무것도 안 넣는 경우는 '지수가 같고 계수 합이 0'일 때뿐이다."}]);
  const okmap={A:"지수 "+st.ta.e+" > "+st.tb.e+" — A의 항이 먼저다.", B:"지수 "+st.tb.e+" > "+st.ta.e+" — B의 항이 먼저다.",
    SUM:"지수가 같다("+st.ta.e+") — 계수 합 "+(st.ta.c+st.tb.c)+"을 attach.", NONE:"지수가 같고 계수 합이 0 — attach 생략. 항이 소거됐다."};
  renderMCQ(body,{id:"G3-"+si, stem:'⏸ 지금 비교: A의 <b>'+fmtTerm(st.ta.c,st.ta.e)+'</b> vs B의 <b>'+fmtTerm(st.tb.c,st.tb.e)+'</b> — 다음에 일어나는 일은?',
    okfb:okmap[st.action], choices},
    {unit:"D",hintUsed:getHint,onDone:(correct,hintUsed,fb)=>{
      answered=true;
      if(correct){ if(!hintUsed) streakD++; } else streakD=0;
      const nd=dTerms.slice();
      if(st.action==="A") nd.push(fmtTerm(st.ta.c,st.ta.e));
      else if(st.action==="B") nd.push(fmtTerm(st.tb.c,st.tb.e));
      else if(st.action==="SUM") nd.push(fmtTerm(st.sum,st.ta.e));
      fb.appendChild(nextBtnRow("다음 비교 ▶",()=>stepD(g,si+1,nd)));
    }});
}

/* ================================================================ 유닛 E ================ */
let streakE=0, attemptsE=0;
function sceneTrialE(){
  saveCP("trialE");
  const g=genG4(); attemptsE++;
  log("item_shown",{unit:"E",gen:"G4",qtype:g.qtype,params:{n:g.n,elems:g.elems},attempt:attemptsE});
  stage.innerHTML="";
  const card=el('<div class="card fade">'+streakBar(streakE,"triple 표현 · 문제 #"+attemptsE)+'</div>');
  const wrap=el('<div style="display:flex;gap:26px;align-items:flex-start;flex-wrap:wrap;"></div>');
  if(g.qtype==="header"){ wrap.appendChild(sparseGrid(g.n,g.elems,null)); wrap.appendChild(tripleTable(g.n,g.elems,"data",null)); }
  else if(g.qtype==="locate"){ wrap.appendChild(sparseGrid(g.n,g.elems,{r:g.target.r,c:g.target.c})); wrap.appendChild(tripleTable(g.n,g.elems,"header",null)); }
  else { wrap.appendChild(tripleTable(g.n,g.elems,"full",g.targetIdx)); }
  card.appendChild(wrap);
  const body=el('<div style="margin-top:12px;"></div>'); card.appendChild(body); stage.appendChild(card);
  let answered=false;
  const getHint=attachBook(card,CH.hints.E,"E",()=>answered);
  renderMCQ(body,g.item,{unit:"E",hintUsed:getHint,onDone:(correct,hintUsed,fb)=>{
    answered=true;
    if(correct){ if(!hintUsed) streakE++; } else streakE=0;
    if(streakE>=3){ log("mastery_reached",{unit:"E",attempts:attemptsE});
      fb.appendChild(nextBtnRow("유닛 E 숙달 ▶",()=>sceneInterlude("E",sceneSaturday,"토요일 ▶"))); }
    else fb.appendChild(nextBtnRow("다음 문제 ▶ (새 행렬 생성)",sceneTrialE));
  }});
}
/* ============ 상점 (보상 소비처) — 지갑·가방은 localStorage 영속, 추후 서버 저장으로 승격 ============ */
function sceneShop(backTo, cart){
  cart = cart || [];
  setHUD(null,"상점");
  stage.innerHTML="";
  const cartTotal = cart.reduce((s,id)=>s+SHOP.items.find(x=>x.id===id).price, 0);
  const remain = S.balance - cartTotal;
  const card=el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">🛒 '+SHOP.title+' — 힘들게 번 돈, 쓰는 재미</div>'+
    '<div style="margin-top:10px;font-size:15.5px;">잔고 <b style="color:var(--accent);">'+money(S.balance)+'</b>'+(cart.length?' <span style="color:var(--ink-dim);font-size:13.5px;">— 장바구니 '+money(cartTotal)+' 빼면 <b>'+money(remain)+'</b></span>':"")+'</div>'+
    '<div id="cartwrap"></div><div id="invwrap"></div><div class="shopgrid" id="items"></div>'+
    '<div style="margin-top:16px;text-align:right;"><button class="btn ghost" id="back">돌아가기 ◀</button></div></div>');
  stage.appendChild(card);
  // 장바구니
  const cartwrap=$("#cartwrap");
  if(cart.length){
    const counts={};
    cart.forEach(id=>counts[id]=(counts[id]||0)+1);
    cartwrap.appendChild(el('<div style="font-size:12.5px;color:var(--accent);margin-top:12px;">🧺 장바구니 — 결제 전에는 언제든 뺄 수 있다</div>'));
    const row=el('<div class="invrow"></div>');
    Object.entries(counts).forEach(([id,cnt])=>{
      const it=SHOP.items.find(x=>x.id===id);
      const chip=el('<div class="invchip" style="border-color:var(--accent);">'+it.svg+'<span>'+it.name+'</span>'+(cnt>1?'<span class="cnt" style="color:var(--accent);">×'+cnt+'</span>':"")+
        '<button class="btn ghost" style="padding:0 8px;font-size:13px;border:none;color:var(--wrong);" title="하나 빼기">✕</button></div>');
      chip.querySelector("button").onclick=()=>{
        const i=cart.indexOf(id); if(i>=0) cart.splice(i,1);
        sceneShop(backTo, cart);
      };
      row.appendChild(chip);
    });
    cartwrap.appendChild(row);
    const act=el('<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:10px;">'+
      '<button class="btn ghost" id="cartclear">모두 취소</button>'+
      '<button class="btn" id="cartpay">🧾 결제하기 — '+money(cartTotal)+'</button></div>');
    act.querySelector("#cartclear").onclick=()=>sceneShop(backTo, []);
    act.querySelector("#cartpay").onclick=()=>{
      S.balance-=cartTotal;
      cart.forEach(id=>{ wallet.inventory.push(id); log("purchase",{id, price:SHOP.items.find(x=>x.id===id).price, balance:S.balance}); });
      saveWallet();
      $("#hud-money").textContent=money(S.balance);
      sceneShop(backTo, []);
    };
    cartwrap.appendChild(act);
  }
  // 가방
  const invwrap=$("#invwrap");
  const owned={};
  wallet.inventory.forEach(id=>owned[id]=(owned[id]||0)+1);
  if(wallet.inventory.length){
    const row=el('<div class="invrow"></div>');
    invwrap.appendChild(el('<div style="font-size:12.5px;color:var(--ink-dim);margin-top:12px;">🎒 내 가방</div>'));
    Object.entries(owned).forEach(([id,cnt])=>{
      const it=SHOP.items.find(x=>x.id===id); if(!it) return;
      row.appendChild(el('<div class="invchip">'+it.svg+'<span>'+it.name+'</span>'+(cnt>1?'<span class="cnt">×'+cnt+'</span>':"")+'</div>'));
    });
    invwrap.appendChild(row);
  }
  // 진열대
  const grid=$("#items");
  SHOP.items.forEach(it=>{
    const has=owned[it.id]>0;
    const inCart=cart.includes(it.id);
    const soldout=it.once&&(has||inCart);
    const afford=remain>=it.price;
    const item=el('<div class="shopitem'+(has?" owned":"")+'">'+it.svg+
      '<div class="iname">'+it.name+'</div><div class="tierchip">'+it.tier+'</div>'+
      '<div class="idesc">'+it.desc+'</div><div class="iprice">'+money(it.price)+'</div>'+
      '<button class="btn'+((soldout||!afford)?" ghost":"")+'" '+((soldout||!afford)?"disabled":"")+'>'+
      (it.once&&has?"보유 중 ✓":(inCart&&it.once?"담김 🧺":(afford?"담기":"잔고 부족")))+'</button></div>');
    item.querySelector("button").onclick=()=>{
      if(soldout||!afford) return;
      cart.push(it.id);
      sceneShop(backTo, cart);
    };
    grid.appendChild(item);
  });
  $("#back").onclick=()=>backTo();
  $("#hud-money").textContent=money(S.balance);
}
/* ============ 막간 (하루를 맺는 장면) ============ */
function sceneInterlude(unitKey,next,label){
  saveCP({C:"study-D",D:"study-E",E:"saturday"}[unitKey]||"saturday");
  stage.innerHTML="";
  const card=el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">🌙 자습 끝 — 오늘의 마무리</div></div>');
  CH.interludes[unitKey].forEach(d=>card.appendChild(el('<div class="dlg" style="margin-top:12px;"><div class="portrait">'+AV(d.face)+'</div><div class="bubble"><div class="who">'+d.who+'</div>'+d.text+'</div></div>')));
  card.appendChild(el('<div style="margin-top:16px;text-align:right;"><button class="btn" id="ilnext">'+label+'</button></div>'));
  stage.appendChild(card);
  $("#ilnext").onclick=next;
}

/* ================================================================ 토요일 / A+ ================ */
function sceneSaturday(){
  saveCP("saturday");
  setHUD("토요일","과외 2일차");
  if(!S.tutorPassed){
    stage.innerHTML="";
    stage.appendChild(el('<div class="card fade"><div class="dlg"><div class="portrait">'+AV("doyun-worried")+'</div><div class="bubble"><div class="who">도윤</div>쌤, 수요일에 헷갈렸던 거… 오늘 다시 물어볼게요. 월요일이 시험이란 말이에요.</div></div>'+
      '<div style="margin-top:16px;text-align:right;"><button class="btn" id="go">보충 과외 시작 ▶</button></div></div>'));
    $("#go").onclick=()=>sceneTutoring(2);
  } else sceneAplusOffer();
}
function sceneAplusOffer(){
  saveCP("saturday");
  setHUD("토요일","A+ 트랙?");
  stage.innerHTML="";
  stage.appendChild(el('<div class="card fade">'+
    '<div class="dlg"><div class="portrait">'+AV("doyun")+'</div><div class="bubble"><div class="who">도윤</div>쌤, 저 그냥 학점만 채우면 돼요? 아니면… 엄마가 <b>A+ 받아오면 쌤한테 보너스 준다던데</b>, 노려볼까요? 교수님이 심화 문제도 낸다고 했거든요.</div></div>'+
    '<div style="margin-top:18px; display:flex; gap:10px; justify-content:flex-end;">'+
    '<button class="btn ghost" id="basic">"이번 주는 기본기부터 다지자" (기본 트랙)</button>'+
    '<button class="btn" id="aplus">"좋아, A+ 노려보자" (심화 3문제)</button></div></div>'));
  $("#basic").onclick=()=>{ S.aplusAccepted=false; log("aplus_choice",{accepted:false}); sceneSundayIntro(); };
  $("#aplus").onclick=()=>{ S.aplusAccepted=true; log("aplus_choice",{accepted:true}); sceneAplusTrial(0,0); };
}
function sceneAplusTrial(idx,correctCnt){
  setHUD("토요일","A+ 심화 "+(idx+1)+"/3");
  const item=genAP(idx);
  log("item_shown",{unit:"aplus",itemId:item.id});
  stage.innerHTML="";
  const card=el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">🔥 A+ 트랙 — 심화 '+(idx+1)+'/3 <span class="tag">통과 기준 2/3 · 힌트 없음</span></div></div>');
  const body=el('<div style="margin-top:10px;"></div>'); card.appendChild(body); stage.appendChild(card);
  renderMCQ(body,item,{unit:"aplus",hintUsed:()=>false,onDone:(correct,_,fb)=>{
    const nc=correctCnt+(correct?1:0);
    if(idx<2) fb.appendChild(nextBtnRow("다음 심화 ▶",()=>sceneAplusTrial(idx+1,nc)));
    else {
      S.aplusSuccess=nc>=2;
      log("aplus_result",{correct:nc, success:S.aplusSuccess});
      fb.appendChild(nextBtnRow("결과 ▶",()=>{
        stage.innerHTML="";
        stage.appendChild(el('<div class="card fade"><div class="dlg"><div class="portrait">'+AV(S.aplusSuccess?"doyun-excited":"doyun-happy")+'</div><div class="bubble"><div class="who">도윤</div>'+
          (S.aplusSuccess?"심화 "+nc+"/3… 쌤, 이 정도면 진짜 A+ 각인데요? 월요일 시험 기대하세요."
                         :"심화 "+nc+"/3… 아직 좀 어렵네요. 그래도 기본은 확실해진 것 같아요. 내일은 기본으로 승부!")+'</div></div>'+
          '<div style="margin-top:16px;text-align:right;"><button class="btn" id="sun">월요일 — 쪽지시험 ▶</button></div></div>'));
        $("#sun").onclick=sceneSundayIntro;
      }));
    }
  }});
}

/* ================================================================ 일요일 ================ */
function sceneSundayIntro(){
  saveCP("sunday");
  setHUD("다음 주 월요일","쪽지시험");
  stage.innerHTML="";
  stage.appendChild(el('<div class="card fade" style="text-align:center; padding:40px;">'+
    '<div style="font-size:15px; color:var(--ink-dim);">월요일 — 학교 수업 시간, 도윤이 쪽지시험을 치르는 중…</div>'+
    '<div style="font-size:38px; margin:18px 0;">✍️</div>'+
    '<div class="inner" style="font-size:14px;">수업 시작종이 울리고, 시험지가 넘어간다. 유닛 숙달 5개 × '+CH.exam.unitPts+'점 + 과외 첫 시도 정답 × '+CH.exam.tutorPts+'점.</div>'+
    '<div style="margin-top:22px;"><button class="btn" id="result">결과 확인 ▶</button></div></div>'));
  $("#result").onclick=sceneSettlement;
}
function sceneSettlement(){
  const unitScore=5*CH.exam.unitPts;
  const tutorScore=S.tutorFirstTry*CH.exam.tutorPts;
  const score=unitScore+tutorScore;
  const passed=score>=CH.exam.passLine;
  let pay=0, bonus=0;
  if(passed){ pay=score*CH.economy.payPerPoint; if(S.aplusSuccess) bonus=CH.economy.aplusBonus; }
  S.balance+=pay+bonus; saveWallet(); clearSave();
  $("#hud-money").textContent=money(S.balance);
  $("#hud-grade").textContent=S.aplusSuccess?"A+ 페이스":(score+"점");
  log("quiz_score",{score, unitScore, tutorScore, passed, aplus:S.aplusSuccess, pay, bonus});
  Log.flush();
  stage.innerHTML="";
  stage.appendChild(el('<div class="card fade">'+
    '<div style="font-size:13px;color:var(--ink-dim);">쪽지시험 결과 — '+CH.meta.week+'주차 "'+CH.meta.title+'"</div>'+
    '<div class="card" style="background:var(--panel2); margin-top:14px; font-size:15px; line-height:2;">'+
    '유닛 숙달 (A·B·C·D·E) — <b>'+unitScore+'점</b><br>'+
    '과외 문답 첫 시도 정답 '+S.tutorFirstTry+'/3 — <b>'+tutorScore+'점</b><br>'+
    '<span style="color:var(--accent); font-size:19px;">합계 '+score+'점 '+(passed?"— 통과 ✅":"— 미달 🔁")+'</span>'+
    (S.aplusAccepted?('<br>A+ 심화: '+(S.aplusSuccess?'<b style="color:var(--accent2);">성공 — 도윤 성적 A+ 페이스 🔥</b>':"아쉽게 미달 (불이익 없음)")):"")+
    '</div>'+
    (passed?('<div class="dlg" style="margin-top:18px;"><div class="portrait">'+AV("madam")+'</div><div class="bubble"><div class="who">윤 여사</div>도윤이가 요즘 책상에 앉아 있더군요. 과외비는 <b>도윤이 점수만큼</b> 계산했어요 — '+score+'점.'+(bonus?" …그리고 약속한 보너스.":"")+'</div></div>'+
      '<div class="card" style="background:var(--panel2); margin-top:14px;">💰 과외비 +'+money(pay)+' <span style="color:var(--ink-dim);font-size:13px;">('+score+'점 × '+CH.economy.payPerPoint.toLocaleString()+'원)</span>'+(bonus?' · A+ 보너스 +'+money(bonus):"")+' → 잔고 <b>'+money(S.balance)+'</b></div>')
      :'<div class="dlg" style="margin-top:18px;"><div class="portrait">'+AV("madam")+'</div><div class="bubble"><div class="who">윤 여사</div>…한 번 더 기회를 드리죠. 다음 주에 재시험이라는군요.</div></div>')+
    '<div class="dlg" style="margin-top:14px;"><div class="portrait">'+AV("doyun-happy")+'</div><div class="bubble"><div class="who">도윤</div>쌤, 다음 주는 <b>'+CH.meta.nextTeaser+'</b>래요. '+CH.meta.nextHint+'</div></div>'+
    '<div class="card" style="background:var(--panel2); margin-top:18px;"><b>챕터 1 '+(passed?"클리어 🎉":"재도전 대기")+'</b><br>'+
    '<span style="color:var(--ink-dim); font-size:14px; line-height:1.8;">누적 로그 '+Log.count()+'건'+(CONFIG.SUPABASE_URL?" (수집 서버 연결됨)":" (로컬 큐 — 수집 서버 미설정)")+'</span></div>'+
    '<div style="margin-top:16px; text-align:right;"><button class="btn ghost" id="dump">로그 JSON 보기</button> '+(passed?'<button class="btn" id="shop">🛒 상점 들르기</button> ':"")+'<button class="btn" id="again">처음부터 다시</button></div>'+
    '<pre id="dumpbox" class="mono" style="display:none; margin-top:12px; font-size:11.5px; color:var(--ink-dim); max-height:220px; overflow:auto; background:#12141a; padding:12px; border-radius:8px;"></pre></div>'));
  $("#dump").onclick=()=>{const d=$("#dumpbox"); d.style.display="block"; d.textContent=JSON.stringify(Log.all().slice(-50),null,1);};
  const sb=$("#shop"); if(sb) sb.onclick=()=>sceneShop(sceneSettlement);
  $("#again").onclick=()=>{ clearSave(); streakA=streakB=streakC=streakD=streakE=0; attemptsA=attemptsC=attemptsE=0; tracesB=runsD=0; poolC=[];
    S.tutorFirstTry=0; S.tutorPassed=false; S.aplusAccepted=false; S.aplusSuccess=false; sceneTitle(); };
}

/* ================================================================ 타이틀·인트로 ================ */
const CPMAP={
  "intro":()=>sceneIntro(),
  "study-A":()=>sceneStudy("A",sceneTrialA), "trialA":()=>sceneTrialA(), "bigO":()=>sceneBigO(),
  "study-B":()=>sceneStudy("B",sceneTraceB), "traceB":()=>sceneTraceB(), "clearB":()=>sceneClearB(),
  "tutor1":()=>sceneTutoring(1),
  "study-C":()=>sceneStudy("C",sceneLinkPuzzle), "linkPuzzle":()=>sceneLinkPuzzle(), "trialC":()=>sceneTrialC(),
  "study-D":()=>sceneStudy("D",sceneTrialD), "trialD":()=>sceneTrialD(),
  "study-E":()=>sceneStudy("E",sceneTrialE), "trialE":()=>sceneTrialE(),
  "saturday":()=>sceneSaturday(), "sunday":()=>sceneSundayIntro()
};
const CPLABEL={
  "intro":"프롤로그", "study-A":"월요일 · 유닛 A 자습", "trialA":"월요일 · 주소 계산 시련", "bigO":"월요일 밤 · 마무리",
  "study-B":"화요일 · 유닛 B 자습", "traceB":"화요일 · 트레이스", "clearB":"화요일 밤 · 마무리",
  "tutor1":"수요일 · 과외 1일차",
  "study-C":"목요일 · 유닛 C 자습", "linkPuzzle":"목요일 · 링크 연결 미션", "trialC":"목요일 · 구조체 시련",
  "study-D":"금요일 · 유닛 D 자습", "trialD":"금요일 · padd 트레이스",
  "study-E":"금요일 밤 · 유닛 E 자습", "trialE":"금요일 밤 · triple 연습",
  "saturday":"토요일 · 과외 2일차 / A+", "sunday":"월요일 · 쪽지시험"
};
function cpLabel(cp){ return CPLABEL[cp]||"이어서 하기"; }
function resumeFrom(sv){
  const s=sv.S||{};
  S.tutorFirstTry=s.tutorFirstTry||0; S.tutorPassed=!!s.tutorPassed; S.aplusAccepted=!!s.aplusAccepted; S.aplusSuccess=!!s.aplusSuccess;
  const st=sv.streaks||{};
  streakA=st.A||0; streakB=st.B||0; streakC=st.C||0; streakD=st.D||0; streakE=st.E||0;
  tracesB=sv.tracesB||0; runsD=sv.runsD||0;
  (CPMAP[sv.cp]||sceneTitle)();
}
function sceneTitle(){
  setHUD("월요일","유닛 A"); $("#hud-grade").textContent="—"; $("#hud-money").textContent=money(S.balance);
  const sv=saveData;
  stage.innerHTML="";
  stage.appendChild(el('<div class="card fade" style="text-align:center; padding:48px 22px;">'+
    '<h1 style="margin:14px 0 10px; font-size:24px; line-height:1.45;">컴퓨터를 모르는 백수,<br>부잣집 과외교사가 되다</h1>'+
    '<p style="color:var(--accent); letter-spacing:4px; margin-bottom:30px; font-size:15px;">- 자료구조 편 -</p>'+
    (sv? '<button class="btn" id="resume">▶ 이어서 하기 — '+cpLabel(sv.cp)+'</button>'+
         '<div style="margin-top:10px;"><button class="btn ghost" id="start">처음부터 시작</button></div>'
       : '<button class="btn" id="start">'+CH.meta.week+'주차 시작 — '+CH.meta.title+'</button>')+
    (S.balance>0||wallet.inventory.length?'<div style="margin-top:14px;"><button class="btn ghost" id="shop0">🛒 상점 · 가방</button></div>':"")+
    '<div style="margin-top:22px;"><button class="btn ghost" id="codebtn" style="font-size:12px;padding:5px 14px;color:#59606e;border-color:#2a3040;">📋 진도 코드 — 다른 컴퓨터로 이어가기</button> '+
    '<button class="btn ghost" id="reset0" style="font-size:12px;padding:5px 14px;color:#59606e;border-color:#2a3040;">🗑 기록 초기화</button></div>'+
    '<div id="codebox2" style="text-align:left;"></div><div id="resetbox"></div></div>'));
  const rs=$("#resume"); if(rs) rs.onclick=()=>{ log("resume",{cp:sv.cp}); resumeFrom(sv); };
  $("#start").onclick=()=>{ if(saveData){ clearSave(); location.reload(); return; } log("chapter_start",{}); sceneIntro(); };
  const s0=$("#shop0"); if(s0) s0.onclick=()=>sceneShop(sceneTitle);
  $("#codebtn").onclick=()=>{
    const box=$("#codebox2"); box.innerHTML="";
    const code=exportCode();
    box.appendChild(el('<div class="card fade" style="background:var(--panel2); margin-top:14px;">'+
      '<div style="font-size:13px;color:var(--ink-dim);">📤 <b>내 진도 코드</b> — 아래 코드를 복사해 두었다가, 다른 컴퓨터의 "진도 코드 입력"에 붙여넣으면 잔고·가방·진행 위치가 그대로 옮겨진다.</div>'+
      '<textarea id="exp" readonly style="width:100%;height:64px;margin-top:8px;background:#12141a;color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:8px;font-family:Consolas,monospace;font-size:11px;box-sizing:border-box;">'+code+'</textarea>'+
      '<div style="text-align:right;margin-top:6px;"><button class="btn ghost" id="copybtn">복사</button></div>'+
      '<div style="font-size:13px;color:var(--ink-dim);margin-top:14px;">📥 <b>진도 코드 입력</b> — 받아 온 코드를 붙여넣고 적용. (현재 이 컴퓨터의 진행은 덮어쓰인다)</div>'+
      '<textarea id="imp" style="width:100%;height:64px;margin-top:8px;background:#12141a;color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:8px;font-family:Consolas,monospace;font-size:11px;box-sizing:border-box;" placeholder="여기에 코드 붙여넣기"></textarea>'+
      '<div style="text-align:right;margin-top:6px;"><span id="impmsg" style="color:var(--wrong);font-size:12.5px;margin-right:10px;"></span><button class="btn" id="applybtn">적용</button> <button class="btn ghost" id="codeclose">닫기</button></div></div>'));
    $("#copybtn").onclick=()=>{ const t=$("#exp"); t.select(); t.setSelectionRange(0,999999); try{ document.execCommand("copy"); $("#copybtn").textContent="복사됨 ✓"; }catch(e){} };
    $("#applybtn").onclick=()=>{ if(importCode($("#imp").value)) location.reload(); else $("#impmsg").textContent="코드를 읽을 수 없습니다 — 다시 확인해 주세요."; };
    $("#codeclose").onclick=()=>{ box.innerHTML=""; };
  };
  $("#reset0").onclick=()=>{
    const box=$("#resetbox"); box.innerHTML="";
    box.appendChild(el('<div class="warn fade" style="margin-top:14px;text-align:left;">⚠ <b>모든 기록이 삭제됩니다</b> — 잔고와 가방, 학습 로그, 진행 상태가 처음으로 돌아갑니다. 되돌릴 수 없습니다.'+
      '<div style="margin-top:10px;text-align:right;"><button class="btn ghost" id="resetNo">취소</button> <button class="btn" id="resetYes" style="background:var(--wrong);color:#fff;">전부 삭제</button></div></div>'));
    $("#resetNo").onclick=()=>{ box.innerHTML=""; };
    $("#resetYes").onclick=()=>{
      ["dsgame_wallet","dsgame_logs","dsgame_sent_upto","dsgame_token","dsgame_save"].forEach(k=>localStorage.removeItem(k));
      location.reload();
    };
  };
}
function sceneIntro(idx=0){
  if(!idx) saveCP("intro");
  stage.innerHTML="";
  const box=el('<div class="fade"></div>');
  for(let k=0;k<=idx;k++){
    const d=CH.intro[k];
    box.appendChild(el('<div class="dlg"><div class="portrait">'+AV(d.face)+'</div><div class="bubble"><div class="who">'+d.who+'</div>'+d.text+'</div></div>'));
  }
  const btn=el('<div style="margin-top:18px; text-align:right;"><button class="btn">▶ '+(idx<CH.intro.length-1?"계속":"월요일 밤 — 자습 시작")+'</button></div>');
  btn.querySelector("button").onclick=()=> idx<CH.intro.length-1 ? sceneIntro(idx+1) : sceneStudy("A",sceneTrialA);
  box.appendChild(btn); stage.appendChild(box);
}
sceneTitle();
