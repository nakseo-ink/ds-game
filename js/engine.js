"use strict";
/* 엔진 — 씬 러너 + 위젯 5종 (W1 메모리 띠, W2 단계 실행, W3 링크 조작, W4 문답, W5 HUD)
   챕터 데이터(CH01)와 생성기(generators.js)만 바꾸면 콘텐츠가 바뀐다. */

let CH = CH01, CURCH = "ch01"; // 현재 챕터 — setChapter로 전환 (ch00 오리엔테이션 ↔ ch01)
function setChapter(c){
  CH = c; CURCH = c.meta.id;
  const gl=$("#hud-grade-label"), gv=$("#hud-grade");
  if(gl&&gv){
    if(CURCH==="ch00"){ gl.textContent="상태"; if(gv.textContent==="—") gv.textContent="백수"; }
    else { gl.textContent="도윤 성적"; if(gv.textContent==="백수"||gv.textContent==="채용 ✓") gv.textContent="—"; }
  }
}
const stage = document.getElementById("stage");

/* ============ 상태 (W5) + 지갑(영속) ============ */
const WALLETKEY="dsgame_wallet";
const wallet=JSON.parse(localStorage.getItem(WALLETKEY)||'{"balance":0,"inventory":[]}');
function saveWallet(){ wallet.balance=S.balance; localStorage.setItem(WALLETKEY,JSON.stringify(wallet)); }
const S = { balance:wallet.balance||0, tutorFirstTry:0, tutorPassed:false, aplusAccepted:false, aplusSuccess:false, retake:false };
/* ---- 서사 상태 (지갑에 영속 — 챕터를 넘어 유지) ---- */
if(!Array.isArray(wallet.inventory)) wallet.inventory=[];    /* 외부 저장 복원 등 필드 누락 방어 */
if(typeof wallet.trust!=="number") wallet.trust=5;          /* 어머니의 신뢰 0~10 (숨김) */
if(typeof wallet.aplusStreak!=="number") wallet.aplusStreak=0;
if(!Array.isArray(wallet.clues)) wallet.clues=[];            /* 역추적 단서 수첩 */
if(!wallet.cleared) wallet.cleared={};                       /* 챕터 클리어 — 정산의 [이번 챕터 끝] 버튼으로 확정 */
if(!wallet.examDone) wallet.examDone={};                     /* 시험 챕터 — 정산(보상·trust) 1회 지급 가드 */
if(!wallet.examBest) wallet.examBest={};                     /* 시험 챕터 — 최고 점수 기록 */
if(typeof wallet.e1Done!=="boolean") wallet.e1Done=false;    /* E1(어머니의 질문) — 최초 1회 발동 */
if(typeof wallet.finaleBonusDone!=="boolean") wallet.finaleBonusDone=false;  /* chF 학기말 보너스 — 1회 지급 가드 */
function addClue(id,text){
  if(wallet.clues.some(c=>c.id===id)) return false;
  wallet.clues.push({id,text}); saveWallet(); log("clue_found",{id});
  return true;
}
/* 비트 조건부 표시: {cond:{trustMax,trustMin,aplusMin,clue}} — 조건 없으면 항상 표시 */
function evalCond(c){
  if(!c) return true;
  if(c.trustMax!==undefined && wallet.trust>c.trustMax) return false;
  if(c.trustMin!==undefined && wallet.trust<c.trustMin) return false;
  if(c.aplusMin!==undefined && wallet.aplusStreak<c.aplusMin) return false;
  if(c.clue!==undefined && !wallet.clues.some(x=>x.id===c.clue)) return false;
  return true;
}
/* ---- 장 번호 표기 — "N장" + 파트(A/B/C). 시험 챕터는 장 번호 없이 특수 기호(meta.special="※") ---- */
const chNum=C=>C.meta.special?C.meta.special:(C.meta.week+"장"+(C.meta.part?"("+C.meta.part+")":""));
/* ---- 진행 저장 (이어하기 · 진도 코드) ---- */
const SAVEKEY="dsgame_save";
const CH0DONEKEY="dsgame_ch0done"; /* 0장 완료 — 타이틀 기본 버튼을 1장으로 */
let saveData=JSON.parse(localStorage.getItem(SAVEKEY)||"null");
function saveCP(cp){
  saveData={v:1, cp, ch:CURCH,
    S:{tutorFirstTry:S.tutorFirstTry, tutorPassed:S.tutorPassed, aplusAccepted:S.aplusAccepted, aplusSuccess:S.aplusSuccess, retake:S.retake},
    streaks:{A:streakA,B:streakB,C:streakC,D:streakD,E:streakE,G5:streak0}, tracesB, runsD,
    gwSave:(CH.flow&&GW)?{streaks:GW.streaks,attempts:GW.attempts,poolIds:GW.poolLeft.map(p=>p.id)}:undefined,
    ts:Date.now()};
  localStorage.setItem(SAVEKEY,JSON.stringify(saveData));
}
function clearSave(){ saveData=null; localStorage.removeItem(SAVEKEY); }
function exportCode(){
  const p={v:1, save:saveData, wallet:{balance:S.balance, inventory:wallet.inventory}, c0done:localStorage.getItem(CH0DONEKEY)==="1"};
  return btoa(unescape(encodeURIComponent(JSON.stringify(p))));
}
function importCode(str){
  try{
    const p=JSON.parse(decodeURIComponent(escape(atob(String(str).trim()))));
    if(p.v!==1) return false;
    if(p.wallet){ wallet.inventory=p.wallet.inventory||[]; S.balance=p.wallet.balance||0; saveWallet(); }
    if(p.save && p.save.cp) localStorage.setItem(SAVEKEY,JSON.stringify(p.save)); else localStorage.removeItem(SAVEKEY);
    if(p.c0done) localStorage.setItem(CH0DONEKEY,"1");
    return true;
  }catch(e){ return false; }
}
function setHUD(day,unit){
  if(day){ const wk=(CH.meta.weekLabel!==undefined)?CH.meta.weekLabel:chNum(CH); $("#hud-day").textContent=wk+" · "+day; }
  if(unit)$("#hud-unit").textContent=unit;
}
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
        if(!opts.fbPrefix && BookFab.note(c.fb)){ /* 책이 오답을 짚어준다 — 하단 책이 자동으로 펼쳐짐 */
          fb.appendChild(el('<div class="feedback fade">📖 …낡은 책이 스르륵 펼쳐진다. <span style="color:var(--ink-dim);font-size:12.5px;">(화면 왼쪽 아래)</span></div>'));
        }else{
          fb.appendChild(el('<div class="feedback fade">'+(opts.fbPrefix||'📖 <i>책의 여백 메모</i> — ')+c.fb+'</div>'));
        }
      }
      opts.onDone(c.correct,hintUsed,fb);
    };
    ch.appendChild(b);
  });
  container.appendChild(ch); container.appendChild(fb);
}
/* ---- Parsons 문항 (코드 줄 순서 조립 — 클릭 순서식) ----
   item={ptype:"parsons", id, stem, lines:[올바른 순서의 줄...], okfb, fb}
   renderMCQ와 동일한 onDone(correct,hintUsed,fb) 계약 */
function renderParsons(container,item,opts){
  let answered=false; const t0=Date.now();
  container.appendChild(el('<div class="stem">'+item.stem+'</div>'));
  container.appendChild(el('<div style="font-size:12.5px;color:var(--ink-dim);margin:6px 0;">🧩 아래 줄들을 클릭해 조립하고, <b>▲▼로 순서를 옮겨 가며</b> 전체를 확인한 뒤 제출하라. (✕ = 조립에서 빼기)</div>'));
  const asm=el('<div class="codebox" style="min-height:34px;margin-top:8px;"></div>');       /* 조립 영역 */
  const src=el('<div style="margin-top:10px;display:flex;flex-direction:column;gap:6px;"></div>'); /* 재료 줄 */
  const fb=el('<div></div>');
  const sub=el('<div style="margin-top:10px;text-align:right;"><button class="btn" disabled>조립 완료 — 제출</button></div>');
  const subBtn=sub.querySelector("button");
  let order=[];                                   /* 현재 조립된 원본 인덱스 순서 */
  let idxs=shuffle(item.lines.map((_,i)=>i));
  for(let t=0;t<20 && idxs.every((v,i)=>v===i);t++) idxs=shuffle(idxs);  /* 섞였는데 정답 순서면 다시 */
  function draw(){
    asm.innerHTML=""; src.innerHTML="";
    order.forEach((li,pos)=>{
      const row=el('<div style="display:flex;align-items:stretch;gap:5px;margin:3px 10px;">'+
        '<div class="codeline" style="flex:1;border:1px solid var(--line);border-radius:6px;background:#161920;overflow-x:auto;">'+(pos+1)+'.  '+hlC(item.lines[li])+'</div>'+
        '<button class="btn ghost" style="padding:1px 9px;font-size:12px;'+(pos===0?'opacity:.25;cursor:default;':'')+'" title="위로">▲</button>'+
        '<button class="btn ghost" style="padding:1px 9px;font-size:12px;'+(pos===order.length-1?'opacity:.25;cursor:default;':'')+'" title="아래로">▼</button>'+
        '<button class="btn ghost" style="padding:1px 9px;font-size:12px;" title="조립에서 빼기">✕</button></div>');
      const bs=row.querySelectorAll('button');
      bs[0].onclick=()=>{ if(answered||pos===0) return; const t=order[pos-1]; order[pos-1]=order[pos]; order[pos]=t; draw(); };
      bs[1].onclick=()=>{ if(answered||pos===order.length-1) return; const t=order[pos+1]; order[pos+1]=order[pos]; order[pos]=t; draw(); };
      bs[2].onclick=()=>{ if(answered) return; order.splice(pos,1); draw(); };
      asm.appendChild(row);
    });
    if(!order.length) asm.appendChild(el('<div style="padding:4px 16px;color:var(--ink-dim);font-size:12.5px;">(아직 비어 있다 — 첫 줄부터 클릭)</div>'));
    idxs.forEach(li=>{
      if(order.includes(li)) return;
      const b=el('<button class="choice mono" style="text-align:left;white-space:pre;">'+hlC(item.lines[li])+'</button>');
      b.onclick=()=>{ if(answered) return; order.push(li); draw(); };
      src.appendChild(b);
    });
    subBtn.disabled = order.length!==item.lines.length;
  }
  subBtn.onclick=()=>{
    if(answered||order.length!==item.lines.length) return; answered=true;
    const correct=order.every((v,i)=>v===i);
    const hintUsed=opts.hintUsed?opts.hintUsed():false;
    log("answer",{unit:opts.unit, itemId:item.id||"parsons", correct, mc:correct?null:(item.mc||"parsons-order"), hintUsed, elapsedMs:Date.now()-t0, order:order.slice()});
    subBtn.disabled=true; [...src.children].forEach(x=>x.disabled=true);
    asm.querySelectorAll("button").forEach(x=>{ x.disabled=true; x.style.opacity=".25"; });
    if(correct) fb.appendChild(el('<div class="feedback ok fade">✅ '+(item.okfb||"올바른 순서다.")+(hintUsed?"<br>📖 힌트를 봤으므로 이번 정답은 연속 기록에 넣지 않는다.":"")+'</div>'));
    else fb.appendChild(el('<div class="feedback fade">'+(opts.fbPrefix||'📖 <i>책의 여백 메모</i> — ')+(item.fb||"순서가 어긋났다. 각 줄이 무엇을 '읽고' 무엇을 '덮어쓰는지' 따져 보라 — 읽어야 할 값을 먼저 덮으면 길을 잃는다.")+'</div>'));
    opts.onDone(correct,hintUsed,fb);
  };
  container.appendChild(asm); container.appendChild(src); container.appendChild(sub); container.appendChild(fb);
  draw();
}
/* 문항 타입 라우터 — 시련·풀 공용 */
function renderItem(container,item,opts){
  if(item.ptype==="parsons") return renderParsons(container,item,opts);
  return renderMCQ(container,item,opts);
}
/* ============ 낡은 책 — 하단 고정 아이콘 (구매 후 상시, 새 메모 = ❗ 뱃지) ============ */
const BookFab=(function(){
  let hints=null, unit="", lv=0, used=false, answeredFn=null, mode="hidden";
  let memoText=null, memoRead=false; /* 자습 중 나타나는 이동훈의 여백 메모 */
  const openedUnits=new Set(); /* 유닛별 첫 ❗ 안내는 1회만 */
  const btn=el('<button id="bookfab" title="낡은 책 — 이동훈의 여백 메모">📖<span class="bang">!</span></button>');
  const panel=el('<div id="bookfabpanel"></div>');
  document.body.appendChild(btn); document.body.appendChild(panel);
  const bang=btn.querySelector(".bang");
  function refresh(){
    btn.style.display = mode==="hidden" ? "none" : "flex";
    bang.style.display = ((mode==="hints" && lv===0 && !openedUnits.has(unit)) || (mode==="memo" && !memoRead)) ? "flex" : "none";
    if(mode==="hidden") panel.style.display="none";
  }
  function render(){
    panel.innerHTML="";
    const box=el('<div class="card fade" style="margin:0;"></div>');
    if(mode==="memo"&&memoText){
      if(!memoRead){ memoRead=true; log("memo_open",{unit}); }
      box.appendChild(el('<div style="font-size:12.5px;color:var(--ink-dim);margin-bottom:8px;">📖 이동훈의 여백 메모</div>'));
      box.appendChild(el('<div class="bookpanel" style="margin:0;">'+memoText+'</div>'));
    }else if(mode!=="hints"||!hints){
      box.appendChild(el('<div class="bookpanel" style="margin:0;">…여백을 넘겨 봐도, 지금 도움될 메모는 없다.<br><span style="color:var(--ink-dim);font-size:12.5px;">메모는 문제를 만났을 때 빛난다 — 새 메모가 생기면 <b style="color:var(--accent);">!</b> 로 알려준다.</span></div>'));
    }else{
      for(let i=0;i<lv;i++) box.appendChild(el('<div class="bookpanel" style="'+(i?'margin-top:8px;':'margin:0;')+'">'+hints[i]+'</div>'));
      const done=answeredFn&&answeredFn();
      if(lv===0&&!done) box.appendChild(el('<div style="font-size:13px;color:var(--ink-dim);">이동훈 선배의 여백 메모가 보인다. <span class="tag">무패널티 · 연속 기록만 제외</span></div>'));
      if(!done&&lv<hints.length){
        const more=el('<div style="margin-top:10px;text-align:right;"><button class="btn ghost">📖 여백을 '+(lv?"더 ":"")+'뒤져본다 ('+lv+'/'+hints.length+')</button></div>');
        more.querySelector("button").onclick=()=>{ used=true; openedUnits.add(unit); log("hint_open",{unit, level:lv+1}); lv++; render(); refresh(); };
        box.appendChild(more);
      }else if(done){
        box.appendChild(el('<div style="margin-top:8px;font-size:12.5px;color:var(--ink-dim);">이미 답한 문제 — 새 문제에서 다시 보자.</div>'));
      }
    }
    /* 단서 수첩 — 협박범 역추적 (해금된 단서가 있을 때만 표시) */
    if(wallet.clues.length){
      const cl=el('<div style="margin-top:12px;border-top:1px dashed var(--line);padding-top:10px;"></div>');
      cl.appendChild(el('<div style="font-size:12.5px;color:var(--accent);margin-bottom:6px;">🕵️ 단서 수첩 — 그자는 누구인가 ('+wallet.clues.length+'/6)</div>'));
      wallet.clues.forEach(c=>cl.appendChild(el('<div style="font-size:13px;color:var(--ink);line-height:1.6;">· '+c.text+'</div>')));
      box.appendChild(cl);
    }
    const close=el('<div style="margin-top:10px;text-align:right;"><button class="btn ghost" style="padding:5px 14px;font-size:12.5px;">덮기 ✕</button></div>');
    close.querySelector("button").onclick=()=>{ panel.style.display="none"; };
    box.appendChild(close);
    panel.appendChild(box);
  }
  btn.onclick=()=>{
    if(panel.style.display==="block"){ panel.style.display="none"; return; }
    render(); panel.style.display="block"; refresh();
  };
  function note(t){ /* 오답 순간, 책이 스스로 펼쳐져 한마디 — 모드는 건드리지 않는 일회성 표시 */
    if(mode==="hidden") return false;
    panel.innerHTML="";
    const box=el('<div class="card fade" style="margin:0;"></div>');
    box.appendChild(el('<div style="font-size:12.5px;color:var(--ink-dim);margin-bottom:8px;">📖 이동훈의 여백 메모 — 틀린 자리에 이렇게 적혀 있다</div>'));
    box.appendChild(el('<div class="bookpanel" style="margin:0;">'+t+'</div>'));
    const close=el('<div style="margin-top:10px;text-align:right;"><button class="btn ghost" style="padding:5px 14px;font-size:12.5px;">덮기 ✕</button></div>');
    close.querySelector("button").onclick=()=>{ panel.style.display="none"; };
    box.appendChild(close);
    panel.appendChild(box);
    panel.style.display="block";
    return true;
  }
  return {
    note,
    hints:(h,u,fn)=>{ hints=h; unit=u; answeredFn=fn; lv=0; used=false; mode="hints"; panel.style.display="none"; refresh(); },
    memo:(t,u)=>{ memoText=t; unit=u||unit; memoRead=false; mode="memo"; panel.style.display="none"; refresh(); },
    info:()=>{ hints=null; mode="info"; panel.style.display="none"; refresh(); },
    hide:()=>{ mode="hidden"; refresh(); },
    used:()=>used
  };
})();
function attachBook(card,hints,unit,isAnswered){
  BookFab.hints(hints,unit,isAnswered); /* 문제 화면 — 하단 책 아이콘에 새 메모 장착 (첫 문제엔 ❗) */
  return ()=>BookFab.used();
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
  BookFab.info();
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
    if(b.viz) renderViz(box,{viz:b.viz});
    if(b.table) box.appendChild(el('<div class="fade" style="overflow-x:auto;">'+b.table+'</div>'));
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
    if(b.steps){
      renderBody(b);                       /* say 등 동반 필드 먼저 */
      renderSteps(box,b.steps,next);
      return;
    }
    if(b.memo){
      box.appendChild(el('<div class="caption fade" style="min-height:auto;">📖 …책 여백에 낡은 손글씨가 보인다. <b style="color:var(--accent);">화면 왼쪽 아래의 책</b>을 펼쳐 보자.</div>'));
      BookFab.memo(b.memo, unitKey);
      contBtn("계속 ▼", next, true);
      return;
    }
    if(b.check){
      const wrap=el('<div class="fade" style="margin-top:8px;"></div>');
      wrap.appendChild(el('<div style="font-size:12.5px;color:var(--accent);margin:6px 0;">✏️ 확인 — 맞혀야 넘어간다</div>'));
      const item={...b.check, choices:shuffle(b.check.choices.map(c=>({...c})))};
      if(item.viz||item.code) renderViz(wrap,item);
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
  saveCP("bigO"); BookFab.hide();
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
  saveCP("clearB"); BookFab.hide();
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
    stage.innerHTML=""; BookFab.hide();
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
  saveCP("study-C"); BookFab.hide();
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
  setHUD("목요일","유닛 C"); BookFab.info(); log("study_step",{unit:"C",step:"link-puzzle"});
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
        warn.appendChild(el('<div class="feedback ok fade">✅ <span class="mono">item1.link=&item2; item2.link=&item3; item3.link=NULL;</span> — a→b→c 사슬 완성. 이것이 3장에서 만날 <b>연결 리스트</b>의 씨앗이다.</div>'));
        warn.appendChild(nextBtnRow("시련 시작 ▶",sceneTrialC));
      }else{
        const visited=new Set(); let cur=0;
        while(typeof cur==="number"&&!visited.has(cur)){ visited.add(cur); cur=links[cur]; }
        const orphans=NAMES.filter((_,i)=>!visited.has(i));
        if(orphans.length&&visited.size>0)
          warn.appendChild(el('<div class="warn fade">⚠ '+orphans.join(", ")+'… 어디에서도 가리켜지지 않는다. 지금은 변수라서 괜찮지만, 만약 <span class="mono">malloc</span>으로 만든 노드였다면 — 찾아갈 방법이 영영 사라진다. <i>이 이야기는 3장에서.</i> 다시 연결해 보자.</div>'));
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
  renderViz(card,item);   /* 코드형 문항(code 필드) 표시 */
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
  setHUD(null,"상점"); BookFab.hide();
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
  BookFab.hide();
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
  saveCP("saturday"); BookFab.hide();
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
  BookFab.hide();
  setHUD("토요일","A+ 심화 "+(idx+1)+"/3");
  const item=genAP(idx);
  log("item_shown",{unit:"aplus",itemId:item.id,qtype:item.qtype||"",params:item.params||{}});
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
  saveCP("sunday"); BookFab.hide();
  setHUD("다음 주 월요일","쪽지시험");
  stage.innerHTML="";
  stage.appendChild(el('<div class="card fade" style="text-align:center; padding:40px;">'+
    '<div style="font-size:15px; color:var(--ink-dim);">월요일 — 학교 수업 시간, 도윤이 쪽지시험을 치르는 중…</div>'+
    '<div style="font-size:38px; margin:18px 0;">✍️</div>'+
    '<div class="inner" style="font-size:14px;">수업 시작종이 울리고, 시험지가 넘어간다. 유닛 숙달 '+(CH.flow?CH.flow.filter(t=>t.indexOf("trial-")===0).length:5)+'개 × '+CH.exam.unitPts+'점 + 과외 첫 시도 정답 × '+CH.exam.tutorPts+'점.</div>'+
    '<div style="margin-top:22px;"><button class="btn" id="result">결과 확인 ▶</button></div></div>'));
  $("#result").onclick=()=>sceneSettlement(false);
}
function sceneSettlement(noPay){
  BookFab.hide();
  const gwUnits = CH.flow ? CH.flow.filter(t=>t.indexOf("trial-")===0).map(t=>t.slice(6)) : ["A","B","C","D","E"];
  const unitScore=gwUnits.length*CH.exam.unitPts;
  const tutorScore=S.tutorFirstTry*CH.exam.tutorPts;
  const score=unitScore+tutorScore;
  const passed=score>=CH.exam.passLine;
  let pay=0, bonus=0;
  if(passed){ pay=score*CH.economy.payPerPoint; if(S.aplusSuccess) bonus=CH.economy.aplusBonus; }
  if(!noPay){
    /* 서사 게이지 (숨김) — 주 단위 산출물로만 변동 (규약: 문항 오답 미반영) */
    let dTrust=0;
    if(passed){ dTrust += S.retake ? 0 : (S.aplusSuccess ? 2 : 1); if(S.tutorFirstTry===3) dTrust+=1; }
    wallet.trust=Math.max(0,Math.min(10,wallet.trust+dTrust));
    wallet.aplusStreak = (passed&&S.aplusSuccess) ? wallet.aplusStreak+1 : 0;
    if(!passed) S.retake=true;
    S.balance+=pay+bonus; saveWallet(); clearSave();
  }
  $("#hud-money").textContent=money(S.balance);
  $("#hud-grade").textContent=S.aplusSuccess?"A+ 페이스":(score+"점");
  if(!noPay){ log("quiz_score",{score, unitScore, tutorScore, passed, aplus:S.aplusSuccess, pay, bonus, trust:wallet.trust, aplusStreak:wallet.aplusStreak}); Log.flush(); }
  /* 어머니의 한마디 — 게이지의 유일한 간접 노출. 반복 노출에 대비해 밴드별 여러 문장 중 랜덤 (챕터 데이터 momLines로 오버라이드 가능) */
  const MOMLINES={
    fail:[
      '"…이번 주는 도윤이가 많이 어려워하던가요."',
      '"성적표를 봤어요. …다음 주는 좀 다르길 바랄게요."',
      '"도윤이가 방에서 한숨을 쉬더군요. 무슨 일 있었나요?"'],
    low:[
      '"…성적은 그렇다 치고. 선생님에 대해서는, 조만간 따로 이야기할 게 있어요."',
      '"오늘은 그만 가 보셔도 좋아요. …요즘 선생님에 대해 이런저런 이야기가 들리더군요."',
      '"도윤이 성적만 보고 있을 수는 없겠네요. 선생님, 다음 주에 시간 좀 내 주세요."'],
    high:[
      '"요즘 도윤이가 밥상에서 선생님 얘기를 해요. 처음 있는 일이에요."',
      '"이번 주 점수도 좋더군요. 도윤이 방에서 웃음소리가 나는 것도… 나쁘지 않네요."',
      '"선생님 오시는 날을 도윤이가 먼저 챙겨요. 계속 이대로 부탁드릴게요."',
      '"남편에게도 선생님 이야기를 했어요. 좋은 분을 모신 것 같다고요."'],
    mid:[
      '"수고했어요. 다음 주도 부탁드려요."',
      '"성적은 확인했어요. 다음 주도 이 시간에 뵙죠."',
      '"도윤이가 요즘 책상에 앉아 있는 시간이 늘었어요. 계속 지켜볼게요."']
  };
  if(!S.momLine) S.momLine=(CH.momLines&&CH.momLines(wallet.trust,passed,S.aplusSuccess)) ||
    pick(!passed ? MOMLINES.fail : wallet.trust<=2 ? MOMLINES.low : wallet.trust>=7 ? MOMLINES.high : MOMLINES.mid);
  const momLine=S.momLine;
  stage.innerHTML="";
  stage.appendChild(el('<div class="card fade">'+
    '<div style="font-size:13px;color:var(--ink-dim);">쪽지시험 결과 — '+chNum(CH)+' "'+CH.meta.title+'"</div>'+
    '<div class="card" style="background:var(--panel2); margin-top:14px; font-size:15px; line-height:2;">'+
    '유닛 숙달 '+gwUnits.length+'/'+gwUnits.length+' ('+gwUnits.join("·")+') — <b>'+unitScore+'점</b> <span style="color:var(--ink-dim);font-size:12.5px;">(유닛당 '+CH.exam.unitPts+'점 × '+gwUnits.length+' — 숙달해야 통과하므로 여기까지 온 이상 만점)</span><br>'+
    '과외 문답 첫 시도 정답 '+S.tutorFirstTry+'/3 — <b>'+tutorScore+'점</b><br>'+
    '<span style="color:var(--accent); font-size:19px;">합계 '+score+'점 '+(passed?"— 통과 ✅":"— 미달 🔁")+'</span>'+
    (S.aplusAccepted?('<br>A+ 심화: '+(S.aplusSuccess?'<b style="color:var(--accent2);">성공 — 도윤 성적 A+ 페이스 🔥</b>':"아쉽게 미달 (불이익 없음)")):"")+
    '</div>'+
    (passed?('<div class="dlg" style="margin-top:18px;"><div class="portrait">'+AV("madam")+'</div><div class="bubble"><div class="who">윤 여사</div>도윤이가 요즘 책상에 앉아 있더군요. 과외비는 <b>도윤이 점수만큼</b> 계산했어요 — '+score+'점.'+(bonus?" …그리고 약속한 보너스.":"")+'</div></div>'+
      '<div class="card" style="background:var(--panel2); margin-top:14px;">💰 과외비 +'+money(pay)+' <span style="color:var(--ink-dim);font-size:13px;">('+score+'점 × '+CH.economy.payPerPoint.toLocaleString()+'원)</span>'+(bonus?' · A+ 보너스 +'+money(bonus):"")+' → 잔고 <b>'+money(S.balance)+'</b></div>')
      :'<div class="dlg" style="margin-top:18px;"><div class="portrait">'+AV("madam")+'</div><div class="bubble"><div class="who">윤 여사</div>…한 번 더 기회를 드리죠. 다음 주에 재시험이라는군요.</div></div>')+
    '<div class="caption" style="min-height:auto;margin-top:10px;">현관을 나서는 길 — 윤 여사가 지나가듯 한마디를 얹는다. '+momLine+'</div>'+
    ((passed && !S.duelDone && wallet.aplusStreak>=2 && CH.duel)?
      ('<div class="dlg" style="margin-top:14px;"><div class="portrait">📵</div><div class="bubble"><div class="who">발신 번호 없음</div>'+(CH.duel.tease||'(문자) 두 주 연속 A+라. …좋다, 정식으로 겨뤄 보지.')+'</div></div>'+
       '<div style="text-align:right;margin-top:8px;"><button class="btn" id="duelbtn">'+(CH.duel.enterLabel||'⚔ 결투장 — 받아들인다 ▶')+'</button> <button class="btn ghost" id="duelskip">무시한다</button></div>'):"")+
    '<div class="dlg" style="margin-top:14px;"><div class="portrait">'+AV("doyun-happy")+'</div><div class="bubble"><div class="who">도윤</div>쌤, 다음 주는 <b>'+CH.meta.nextTeaser+'</b>래요. '+CH.meta.nextHint+'</div></div>'+
    '<div class="card" style="background:var(--panel2); margin-top:18px;"><b>'+chNum(CH)+' "'+CH.meta.title+'" '+(passed?"클리어 🎉":"재도전 대기")+'</b><br>'+
    '<span style="color:var(--ink-dim); font-size:14px; line-height:1.8;">누적 로그 '+Log.count()+'건'+(CONFIG.SUPABASE_URL?" (수집 서버 연결됨)":" (로컬 큐 — 수집 서버 미설정)")+'</span></div>'+
    '<div style="margin-top:16px; text-align:right;"><button class="btn ghost" id="dump">로그 JSON 보기</button> '+(passed?'<button class="btn ghost" id="shop">🛒 상점 들르기</button> ':"")+'<button class="btn ghost" id="again">처음부터 다시</button>'+(passed?' <button class="btn" id="chdone">이번 챕터 끝 — 클리어 ▶</button>':"")+'</div>'+
    '<pre id="dumpbox" class="mono" style="display:none; margin-top:12px; font-size:11.5px; color:var(--ink-dim); max-height:220px; overflow:auto; background:#12141a; padding:12px; border-radius:8px;"></pre></div>'));
  $("#dump").onclick=()=>{const d=$("#dumpbox"); d.style.display="block"; d.textContent=JSON.stringify(Log.all().slice(-50),null,1);};
  const db=$("#duelbtn"); if(db) db.onclick=()=>{ log("duel_choice",{accepted:true}); duelScene(()=>sceneSettlement(true)); };
  const ds=$("#duelskip"); if(ds) ds.onclick=()=>{ S.duelDone=true; log("duel_choice",{accepted:false}); sceneSettlement(true); };
  const sb=$("#shop"); if(sb) sb.onclick=()=>sceneShop(()=>sceneSettlement(true)); /* 재방문 시 재지급 금지 */
  const chReset=()=>{ clearSave(); GW=null; S.momLine=null; S.duelDone=false; S.duelRewarded=false; streakA=streakB=streakC=streakD=streakE=streak0=0; attemptsA=attemptsC=attemptsE=attempts0=0; tracesB=runsD=0; poolC=[];
    S.tutorFirstTry=0; S.tutorPassed=false; S.aplusAccepted=false; S.aplusSuccess=false; S.retake=false; sceneTitle(); };
  $("#again").onclick=chReset;
  const cd=$("#chdone"); if(cd) cd.onclick=()=>{ wallet.cleared[CURCH]=true; saveWallet(); log("chapter_clear",{}); chReset(); };
}

/* ---- 결투장 — 연속 A+ 특별 씬 (CH.duel: {tease, enterLabel, header, intro[], item(Parsons), win[], lose[], reward}) ---- */
function duelScene(back){
  BookFab.hide();
  setHUD("일요일 밤","결투장");
  stage.innerHTML="";
  const D=CH.duel;
  const card=el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">'+(D.header||'⚔ 결투장 — 발신 번호 없는 문자')+'</div></div>');
  (D.intro||[]).forEach(d=>card.appendChild(el('<div class="dlg" style="margin-top:12px;"><div class="portrait">'+AV(d.face)+'</div><div class="bubble"><div class="who">'+d.who+'</div>'+d.text+'</div></div>')));
  const body=el('<div style="margin-top:14px;"></div>'); card.appendChild(body); stage.appendChild(card);
  log("item_shown",{unit:"duel",itemId:D.item.id||"duel"});
  renderItem(body,{...D.item},{unit:"duel",fbPrefix:'⚔ ',hintUsed:()=>false,onDone:(correct,_,fb)=>{
    S.duelDone=true;
    log("duel_result",{win:correct});
    const res=(correct?D.win:D.lose)||[];
    res.forEach(d=>{
      fb.appendChild(el('<div class="dlg" style="margin-top:12px;"><div class="portrait">'+AV(d.face)+'</div><div class="bubble"><div class="who">'+d.who+'</div>'+d.text+'</div></div>'));
      if(d.clue && addClue(d.clue.id,d.clue.text))
        fb.appendChild(el('<div class="fade" style="margin:6px 0 0 60px;font-size:12.5px;color:var(--accent);">🕵️ 단서 수첩에 기록됨 — 하단 📖 책에서 언제든 다시 볼 수 있다.</div>'));
    });
    if(correct && D.reward && !S.duelRewarded){ S.duelRewarded=true; S.balance+=D.reward; saveWallet(); $("#hud-money").textContent=money(S.balance);
      fb.appendChild(el('<div class="card fade" style="background:var(--panel2); margin-top:12px;">💰 결투 보너스 +'+money(D.reward)+' → 잔고 <b>'+money(S.balance)+'</b></div>')); }
    if(!correct){ /* 패배 — 해설을 확인한 뒤 재도전으로 이해를 검증할 수 있다 */
      const rr=el('<div style="margin-top:12px;text-align:right;"><button class="btn" id="duelretry">다시 조립하기 ↺</button></div>');
      fb.appendChild(rr);
      $("#duelretry").onclick=()=>{ log("duel_retry",{}); duelScene(back); };
    }
    fb.appendChild(nextBtnRow("정산으로 돌아가기 ▶", back));
  }});
}

/* ================================================================
   시험 러너 (chM 중간고사 — chF 기말 재사용 예정) — EXAMBANK + 챕터 데이터로 실행
   프로세스(설계 문서 21): 진단 모의(피드백 봉인) → 성적표·해설(지연 피드백)
   → 오답 클리닉(같은 오개념·다른 문제, 연속 정답 기준) → 최종 모의(비중복) → 정산 + E1
   ================================================================ */
let EX=null;
(function(){ const st=document.createElement("style"); st.textContent=".choice.exsel{border-color:var(--accent);color:var(--accent);}"; document.head.appendChild(st); })();
const exBankById=id=>EXAMBANK.items.find(it=>it.id===id);
function exInit(){ EX={round:0, draws:{}, ans:{}, scores:{}, times:{}, rx:[], used:[], tStart:0}; }
function exSaveCP(cp){
  saveData={v:1, cp, ch:CURCH, ex:{round:EX.round, draws:EX.draws, ans:EX.ans, scores:EX.scores, times:EX.times, rx:EX.rx, used:EX.used}, ts:Date.now()};
  localStorage.setItem(SAVEKEY,JSON.stringify(saveData));
}
function exResume(sv){
  exInit();
  const e=sv.ex||{};
  EX.round=e.round||0; EX.draws=e.draws||{}; EX.ans=e.ans||{}; EX.scores=e.scores||{}; EX.times=e.times||{}; EX.rx=e.rx||[]; EX.used=e.used||[];
  const cp=sv.cp;
  if(cp==="M-test1"){ exTestStart(1); return; }                 /* 모의 도중 저장 없음 — 새 시험지로 라운드 재시작 */
  if(cp==="M-report1"){ exReport(1); return; }
  if(cp==="M-clinic"){ exClinic(); return; }
  if(cp==="M-test2"){ exTestStart(Math.max(EX.round,2)); return; }
  if(cp==="M-settle"){ exSettle(); return; }
  exStart();
}
/* ---- 대사 시퀀서 (sceneIntro와 동일 문법 — 누적 표시) ---- */
function exDlgSeq(beats,idx,label,next){
  BookFab.hide(); stage.innerHTML="";
  const bs=(beats||[]).filter(d=>evalCond(d.cond));
  if(!bs.length){ next(); return; }
  const box=el('<div class="fade"></div>');
  for(let k=0;k<=idx;k++){ const d=bs[k];
    box.appendChild(el('<div class="dlg"><div class="portrait">'+AV(d.face)+'</div><div class="bubble"><div class="who">'+d.who+'</div>'+d.text+'</div></div>'));
  }
  const last=idx>=bs.length-1;
  const btn=el('<div style="margin-top:18px;text-align:right;"><button class="btn">▶ '+(last?label:"계속")+'</button></div>');
  btn.querySelector("button").onclick=()=> last?next():exDlgSeq(beats,idx+1,label,next);
  box.appendChild(btn); stage.appendChild(box);
}
function exStart(){
  exInit();
  setHUD("시험 전 주","특훈 준비");
  exSaveCP("M-intro"); log("exam_start",{});
  exDlgSeq(CH.intro,0,"특훈 개시",()=>exDlgSeq(CH.beforeTest1,0,"진단 모의 — "+CH.examCfg.total+"문 시작",()=>exTestStart(1)));
}
/* ---- 출제 추첨 — 장별 쿼터 + 코드형(diff 3) 최소 보장 + 부족분 보충 사슬 ---- */
function exDraw(exclude){
  const cfg=CH.examCfg, out=[];
  for(const chid in cfg.quota){
    let take=shuffle(EXAMBANK.items.filter(it=>it.ch===chid&&!exclude.includes(it.id)&&!out.includes(it.id))).slice(0,cfg.quota[chid]);
    if(take.length<cfg.quota[chid]){  /* 해당 장 소진 — 다른 장 미사용분으로 보충 */
      const extra=shuffle(EXAMBANK.items.filter(it=>!exclude.includes(it.id)&&it.ch!==chid&&!out.includes(it.id)&&!take.some(t=>t.id===it.id)));
      log("exam_fill",{ch:chid, short:cfg.quota[chid]-take.length});
      take=take.concat(extra.slice(0,cfg.quota[chid]-take.length));
    }
    take.forEach(t=>out.push(t.id));
  }
  while(out.length<cfg.total){  /* 최후 — 기출제분 재사용 (은행 전체 소진 시에만) */
    const any=shuffle(EXAMBANK.items.filter(it=>!out.includes(it.id)));
    if(!any.length) break; out.push(any[0].id);
  }
  let need=(cfg.minDiff3||0)-out.map(exBankById).filter(it=>it.diff===3).length;  /* 코드형 최소 보장 — 같은 장 안에서만 교체(쿼터 보존) */
  if(need>0){
    const add=shuffle(EXAMBANK.items.filter(it=>it.diff===3&&!out.includes(it.id)&&!exclude.includes(it.id)));
    for(const a of add){
      if(need<=0) break;
      const vi=out.findIndex(id=>{const x=exBankById(id); return x.diff!==3&&x.ch===a.ch;});
      if(vi>=0){ out[vi]=a.id; need--; }
    }
  }
  return shuffle(out);
}
function exTestStart(round){
  if(EX.draws[round]) EX.used=EX.used.filter(id=>!EX.draws[round].includes(id));  /* 같은 라운드 재시작 — 이전 추첨 반납 */
  EX.round=round;
  EX.draws[round]=exDraw(round===1?[]:EX.used.slice());
  EX.draws[round].forEach(id=>{ if(!EX.used.includes(id)) EX.used.push(id); });
  EX.ans[round]=[];
  EX.tStart=Date.now();
  exSaveCP(round===1?"M-test1":"M-test2");
  log("exam_test_start",{round, ids:EX.draws[round].slice()});
  exTestQ(round,0);
}
/* ---- 시험 문항 화면 — 피드백 봉인: 고르고 [다음]. 정오 표시 없음 ---- */
function exTestQ(round,qi){
  BookFab.hide();
  const ids=EX.draws[round], total=ids.length;
  if(qi>=total){ exGradeDone(round); return; }
  const item=exBankById(ids[qi]);
  const label=round===1?"진단 모의":"최종 모의";
  setHUD(label,"문 "+(qi+1)+"/"+total);
  stage.innerHTML="";
  let strip='<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:10px;">';
  for(let k=0;k<total;k++) strip+='<span style="width:21px;height:21px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;font-size:10.5px;'+
    (k<qi?'background:var(--accent);color:#10131a;':k===qi?'border:1.6px solid var(--accent);color:var(--accent);':'border:1px solid var(--line);color:var(--ink-dim);')+'">'+(k+1)+'</span>';
  strip+='</div>';
  const card=el('<div class="card fade"><div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;"><b style="color:var(--accent);">※ '+CH.meta.title+' — '+label+'</b>'+
    '<span style="color:var(--ink-dim);font-size:13px;">문 '+(qi+1)+' / '+total+' · 채점은 제출 후 일괄</span></div>'+strip+'</div>');
  const vz=el('<div style="margin-top:12px;"></div>'); card.appendChild(vz); renderViz(vz,item);
  card.appendChild(el('<div class="stem">'+item.stem+'</div>'));
  const chBox=el('<div class="choices"></div>');
  const sh=shuffle(item.choices.map((c,i)=>({...c,oi:i})));
  let sel=-1;
  sh.forEach((c,ci)=>{
    const b=el('<button class="choice'+(item.mono?" mono":"")+'">'+["①","②","③","④"][ci]+" "+c.text+"</button>");
    b.onclick=()=>{ sel=ci; [...chBox.children].forEach(x=>x.classList.remove("exsel")); b.classList.add("exsel"); $("#exnext").disabled=false; };
    chBox.appendChild(b);
  });
  card.appendChild(chBox);
  card.appendChild(el('<div style="margin-top:14px;text-align:right;"><button class="btn" id="exnext" disabled>'+(qi===total-1?"제출 — 채점 ▶":"다음 문제 ▶")+'</button></div>'));
  stage.appendChild(card);
  $("#exnext").onclick=()=>{
    const c=sh[sel]; if(!c) return;
    EX.ans[round].push({id:item.id, oi:c.oi, ok:!!c.correct});
    log("exam_answer",{round, itemId:item.id, correct:!!c.correct, mc:c.correct?null:c.mc});
    exTestQ(round,qi+1);
  };
}
function exGradeDone(round){
  EX.times[round]=Date.now()-EX.tStart;
  const score=EX.ans[round].filter(x=>x.ok).length*CH.examCfg.pts;
  EX.scores[round]=score;
  log("exam_graded",{round, score, ms:EX.times[round]});
  if(round===1&&score>=100){ exSaveCP("M-settle"); exDlgSeq(CH.perfectSkip,0,"정산 ▶",exSettle); return; }
  if(round===1){ exSaveCP("M-report1"); exDlgSeq(CH.reportIntro,0,"성적표 ▶",()=>exReport(1)); return; }
  exSaveCP("M-settle"); exSettle();
}
const exFmtMs=ms=>{ const s=Math.round(ms/1000); return Math.floor(s/60)+"분 "+(s%60)+"초"; };
/* ---- 성적표 (1차 = 진단 리포트) ---- */
function exReport(round){
  BookFab.hide(); exSaveCP("M-report1");
  setHUD("진단 결과","성적표");
  const a=EX.ans[round], score=EX.scores[round];
  const wrong=a.filter(x=>!x.ok);
  stage.innerHTML="";
  let rows='';
  for(const chid in CH.examCfg.quota){
    const C=CHBYID[chid]; if(!C) continue;
    const mine=a.filter(x=>exBankById(x.id).ch===chid);
    if(!mine.length) continue;
    const marks=mine.map(x=>'<span style="display:inline-block;width:19px;text-align:center;color:'+(x.ok?'var(--accent2)':'var(--wrong)')+';">'+(x.ok?'○':'✗')+'</span>').join('');
    rows+='<tr><td style="padding:4px 10px 4px 0;white-space:nowrap;color:var(--ink-dim);">'+chNum(C)+' '+C.meta.title+'</td><td style="padding:4px 8px;">'+marks+'</td><td style="padding:4px 0;text-align:right;"><b>'+mine.filter(x=>x.ok).length+'</b>/'+mine.length+'</td></tr>';
  }
  const card=el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">※ '+CH.meta.title+' — 진단 성적표</div>'+
    '<div class="card" style="background:var(--panel2);margin-top:12px;text-align:center;">'+
    '<div style="font-size:13px;color:var(--ink-dim);">진단 점수 <span style="font-size:11.5px;">(최종 점수가 아니다)</span></div>'+
    '<div style="font-size:34px;color:var(--accent);margin:4px 0;"><b>'+score+'</b><span style="font-size:16px;color:var(--ink-dim);"> / 100</span></div>'+
    '<div style="font-size:12.5px;color:var(--ink-dim);">풀이 시간 '+exFmtMs(EX.times[round])+' · 오답 '+wrong.length+'문</div></div>'+
    '<table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px;">'+rows+'</table>'+
    '<div class="caption" style="min-height:auto;margin-top:10px;">✗ 자리마다 처방전이 만들어진다 — 방금 그 문제가 아니라 <b>같은 것을 묻는 다른 문제</b>로.</div>'+
    '<div style="margin-top:14px;text-align:right;">'+
    '<button class="btn ghost" id="exrev">틀린 문제 다시 보기 ('+wrong.length+') ▶</button> '+
    '<button class="btn" id="exclinic">오답 클리닉 ▶</button></div></div>');
  stage.appendChild(card);
  $("#exrev").onclick=()=>exReview(wrong,0,()=>exReport(round));
  $("#exclinic").onclick=()=>{ exBuildRx(round); exDlgSeq(CH.clinicIntro,0,"클리닉 개시",exClinic); };
}
/* ---- 틀린 문제 해설 열람 (지연 피드백 — 내 답의 fb + 정답의 okfb) ---- */
function exReview(list,i,back){
  BookFab.hide();
  if(i>=list.length){ back(); return; }
  const x=list[i], item=exBankById(x.id);
  setHUD("해설","오답 "+(i+1)+"/"+list.length);
  stage.innerHTML="";
  const card=el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">오답 해설 — '+(i+1)+' / '+list.length+'</div></div>');
  const vz=el('<div style="margin-top:10px;"></div>'); card.appendChild(vz); renderViz(vz,item);
  card.appendChild(el('<div class="stem">'+item.stem+'</div>'));
  const chBox=el('<div class="choices"></div>');
  item.choices.forEach((c,ci)=>{
    const mine=ci===x.oi, isOk=!!c.correct;
    const b=el('<button class="choice'+(item.mono?" mono":"")+(isOk?" correct":mine?" wrong":"")+'" disabled>'+["①","②","③","④"][ci]+" "+c.text+(mine?' <span style="font-size:11.5px;">← 내 답</span>':'')+'</button>');
    chBox.appendChild(b);
  });
  card.appendChild(chBox);
  const myc=item.choices[x.oi];
  if(myc&&!myc.correct&&myc.fb) card.appendChild(el('<div class="feedback fade">✗ <b>내가 고른 답</b> — '+myc.fb+'</div>'));
  card.appendChild(el('<div class="feedback ok fade">✅ <b>정답</b> — '+(item.okfb||"")+'</div>'));
  card.appendChild(el('<div style="margin-top:14px;text-align:right;"><button class="btn" id="exrevnext">'+(i===list.length-1?"해설 끝 ▶":"다음 오답 ▶")+'</button></div>'));
  stage.appendChild(card);
  $("#exrevnext").onclick=()=>exReview(list,i+1,back);
}
/* ---- 처방전 생성 — (장, 유닛, 오개념) 좌표로 묶음 ---- */
function exBuildRx(round){
  const map={};
  EX.ans[round].filter(x=>!x.ok).forEach(x=>{
    const it=exBankById(x.id), c=it.choices[x.oi]||{};
    const key=it.ch+"|"+it.unit+"|"+(c.mc||"x");
    if(!map[key]) map[key]={ch:it.ch, unit:it.unit, mc:c.mc||null, itemId:it.id, oi:x.oi, streak:0, done:false};
  });
  EX.rx=Object.values(map);
}
/* ---- 오답 클리닉 목록 ---- */
function exClinic(){
  BookFab.hide(); exSaveCP("M-clinic");
  const cfg=CH.examCfg, doneN=EX.rx.filter(r=>r.done).length;
  setHUD("특훈","클리닉 "+doneN+"/"+EX.rx.length);
  stage.innerHTML="";
  const card=el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">🩺 오답 클리닉 — 처방전 '+doneN+' / '+EX.rx.length+' 완료</div>'+
    '<div class="caption" style="min-height:auto;margin-top:6px;">처방마다: 복습 → <b>같은 것을 묻는 다른 문제</b>를 힌트 없이 <b>연속 '+cfg.clinicStreak+'회</b> 정답이면 완료.</div></div>');
  const listBox=el('<div style="margin-top:6px;"></div>'); card.appendChild(listBox);
  EX.rx.forEach((r,k)=>{
    const C=CHBYID[r.ch], src=exBankById(r.itemId), myc=src.choices[r.oi]||{};
    const row=el('<div class="card" style="background:var(--panel2);margin-top:10px;'+(r.done?'opacity:.65;':'')+'">'+
      '<div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;"><b>'+(r.done?'✓ ':'')+chNum(C)+' '+C.meta.title+'</b>'+
      '<span style="color:var(--ink-dim);font-size:12.5px;">유닛 '+r.unit+(r.done?' — 처방 완료':' — 연속 '+r.streak+'/'+cfg.clinicStreak)+'</span></div>'+
      '<div style="font-size:13px;color:var(--ink-dim);margin-top:6px;">실수의 정체 — '+(myc.fb||src.okfb||"")+'</div>'+
      (r.done?'':'<div style="text-align:right;margin-top:8px;"><button class="btn" data-rx="'+k+'">처방 '+(r.streak>0?'계속':'시작')+' ▶</button></div>')+'</div>');
    listBox.appendChild(row);
  });
  const allDone=EX.rx.every(r=>r.done);
  card.appendChild(el('<div style="margin-top:16px;text-align:right;">'+
    (allDone?'<button class="btn" id="exfinal">최종 모의 ▶</button>':'<span style="color:var(--ink-dim);font-size:12.5px;">모든 처방을 끝내면 최종 모의가 열린다.</span>')+'</div>'));
  stage.appendChild(card);
  [...card.querySelectorAll("button[data-rx]")].forEach(b=>b.onclick=()=>exRxIntro(+b.getAttribute("data-rx")));
  const fb=$("#exfinal"); if(fb) fb.onclick=()=>exDlgSeq(CH.beforeTest2,0,"최종 모의 — "+CH.examCfg.total+"문 시작",()=>exTestStart(EX.round+1));
}
/* ---- 처방 1단계 — 원문항 복습 (틀린 그 자리 다시 읽기) ---- */
function exRxIntro(k){
  BookFab.hide();
  const r=EX.rx[k], src=exBankById(r.itemId), myc=src.choices[r.oi]||{}, okc=src.choices.find(c=>c.correct);
  setHUD("클리닉","복습");
  stage.innerHTML="";
  const card=el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">🩺 처방전 — 1단계 · 틀린 자리 복습</div></div>');
  const vz=el('<div style="margin-top:10px;"></div>'); card.appendChild(vz); renderViz(vz,src);
  card.appendChild(el('<div class="stem">'+src.stem+'</div>'));
  if(myc.fb) card.appendChild(el('<div class="feedback fade">✗ <b>내가 고른 답</b> "'+myc.text+'" — '+myc.fb+'</div>'));
  card.appendChild(el('<div class="feedback ok fade">✅ <b>정답</b> "'+(okc?okc.text:"")+'" — '+(src.okfb||"")+'</div>'));
  card.appendChild(el('<div style="margin-top:14px;text-align:right;"><button class="btn" id="exdrill">2단계 — 같은 것을 묻는 다른 문제 ▶</button></div>'));
  stage.appendChild(card);
  $("#exdrill").onclick=()=>exRxDrill(k);
}
/* ---- 처방 2단계 — 대체 문항 반복 (즉시 피드백 · 연속 정답까지) ---- */
function exPickDrill(r){
  let cand=EXAMBANK.items.filter(it=>it.ch===r.ch&&it.unit===r.unit&&!EX.used.includes(it.id));
  const best=cand.filter(it=>it.choices.some(c=>!c.correct&&c.mc===r.mc));
  let p=(best.length?best:cand);
  if(p.length){ const it=shuffle(p)[0]; EX.used.push(it.id); return {...it, choices:shuffle(it.choices.map(c=>({...c})))}; }
  const C=CHBYID[r.ch];
  if(C&&C.trials&&C.trials[r.unit]&&GEN2[C.trials[r.unit].gen]) return GEN2[C.trials[r.unit].gen]();  /* 생성기 — 새 파라미터 */
  if(C&&C.pool){ const pl=shuffle(C.pool.filter(x=>x.unit===r.unit&&x.choices)); if(pl.length) return {...pl[0], choices:shuffle(pl[0].choices.map(c=>({...c})))}; }
  const re=shuffle(EXAMBANK.items.filter(it=>it.ch===r.ch&&it.unit===r.unit&&it.id!==r.itemId));
  const it=re[0]||exBankById(r.itemId);
  return {...it, choices:shuffle(it.choices.map(c=>({...c})))};
}
function exRxDrill(k){
  BookFab.hide();
  const r=EX.rx[k], cfg=CH.examCfg;
  const item=exPickDrill(r);
  setHUD("클리닉","처방 훈련");
  const okc=item.choices&&item.choices.find(c=>c.correct);  /* ans — 로그 일관성(구형 생성기 포함). 정답은 원래 데이터로 공개돼 있어 노출 증가 없음 */
  log("item_shown",{unit:"clinic", itemId:item.id||"gen", params:item.params||{}, ans:okc?String(okc.text):"", rx:r.ch+"/"+r.unit+"/"+(r.mc||"-")});
  stage.innerHTML="";
  let dots=''; for(let d=0;d<cfg.clinicStreak;d++) dots+='<span class="dot '+(d<r.streak?"on":"")+'"></span>';
  const card=el('<div class="card fade"><div class="streak">처방 완료까지 — 힌트 없이 연속 정답'+dots+'<span style="margin-left:auto;">'+CHBYID[r.ch].meta.title+' · 유닛 '+r.unit+'</span></div></div>');
  const vz=el('<div style="margin-top:10px;"></div>'); card.appendChild(vz); renderViz(vz,item);
  const qbox=el('<div style="margin-top:8px;"></div>'); card.appendChild(qbox); stage.appendChild(card);
  renderItem(qbox,item,{unit:"clinic", fbPrefix:'🩺 ', hintUsed:()=>false, onDone:(correct,_,fb)=>{
    if(correct) r.streak++; else r.streak=0;
    if(r.streak>=cfg.clinicStreak){ r.done=true; log("clinic_rx_done",{rx:r.ch+"/"+r.unit+"/"+(r.mc||"-")}); }
    exSaveCP("M-clinic");
    if(r.done) fb.appendChild(nextBtnRow("처방 완료 — 목록으로 ▶",exClinic));
    else fb.appendChild(nextBtnRow(correct?"다음 문제 ▶":"다시 — 연속 기록 처음부터 ↺",()=>exRxDrill(k)));
  }});
}
/* ---- 정산 — 최종 점수(마지막 모의) · 보상·trust는 첫 완주 1회 ---- */
function exSettle(){
  BookFab.hide(); exSaveCP("M-settle");
  const cfg=CH.examCfg;
  const rounds=Object.keys(EX.scores).map(Number).sort((a,b)=>a-b);
  const lastR=rounds[rounds.length-1], s1=EX.scores[1], final=EX.scores[lastR];
  const band=CH.settle.bands.find(b=>final>=b.min);
  /* 확정(보상·trust)은 1회 — 통과면 즉시, 미달이면 [특훈 한 번 더]를 접고 현관으로 나가는 순간 확정 */
  const commit=()=>{
    if(wallet.examDone[CURCH]) return 0;
    wallet.examDone[CURCH]=true;
    wallet.trust=Math.max(0,Math.min(10,wallet.trust+band.trust));
    let p=0;
    if(final>=cfg.passLine){ p=final*cfg.payPerPoint; S.balance+=p; }
    saveWallet(); return p;
  };
  const first=!wallet.examDone[CURCH];
  let pay=0;
  if(final>=cfg.passLine) pay=commit();
  if(wallet.examBest[CURCH]===undefined||final>wallet.examBest[CURCH]){ wallet.examBest[CURCH]=final; saveWallet(); }
  if(!EX.momLine||EX.momBand!==band.name){ EX.momLine=pick(band.mom); EX.momBand=band.name; }  /* 재방문 시 한마디 고정 */
  setHUD("시험 당일","정산");
  $("#hud-money").textContent=money(S.balance);
  $("#hud-grade").textContent=final+"점";
  log("exam_settle",{final, s1, rounds:rounds.length, band:band.name, pay, first, trust:wallet.trust, aplusStreak:wallet.aplusStreak}); Log.flush();
  const wrongLast=EX.ans[lastR].filter(x=>!x.ok);
  stage.innerHTML="";
  const imp=(lastR>1&&s1!==undefined)?('<div style="font-size:15px;color:var(--ink-dim);margin-top:6px;">진단 '+s1+'점 → 최종 <b style="color:var(--accent);">'+final+'점</b>'+(final>s1?' <b style="color:var(--accent2);">(+'+(final-s1)+' — 특훈의 값이다)</b>':final<s1?' (−'+(s1-final)+')':' (동점)')+'</div>'):'';
  const card=el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">※ '+CH.meta.title+' — 결과</div>'+
    '<div class="card" style="background:var(--panel2);margin-top:12px;text-align:center;">'+
    '<div style="font-size:13px;color:var(--ink-dim);">도윤의 '+CH.meta.title+' 점수</div>'+
    '<div style="font-size:38px;color:var(--accent);margin:4px 0;"><b>'+final+'</b><span style="font-size:16px;color:var(--ink-dim);"> / 100 — '+band.name+'</span></div>'+imp+
    '<div style="font-size:12.5px;color:var(--ink-dim);">최종 모의 풀이 시간 '+exFmtMs(EX.times[lastR]||0)+(wallet.examBest[CURCH]!==undefined?' · 기록 최고 '+wallet.examBest[CURCH]+'점':'')+'</div></div>'+
    '<div class="dlg" style="margin-top:14px;"><div class="portrait">'+AV(final>=cfg.passLine?"doyun-happy":"doyun-worried")+'</div><div class="bubble"><div class="who">도윤</div>'+band.doyun+'</div></div>'+
    (first&&pay?('<div class="dlg" style="margin-top:10px;"><div class="portrait">'+AV("madam")+'</div><div class="bubble"><div class="who">윤 여사</div>'+CH.meta.title+'예요. 과외비도 <b>'+CH.meta.title+'만큼</b> — '+final+'점, 평소의 두 배로 계산했어요.</div></div>'+
      '<div class="card" style="background:var(--panel2);margin-top:10px;">💰 '+CH.meta.title+' 과외비 +'+money(pay)+' <span style="color:var(--ink-dim);font-size:13px;">('+final+'점 × '+cfg.payPerPoint.toLocaleString()+'원)</span> → 잔고 <b>'+money(S.balance)+'</b></div>'):'')+
    '<div class="caption" style="min-height:auto;margin-top:10px;">현관을 나서는 길 — 윤 여사가 한마디를 얹는다. '+EX.momLine+'</div>'+
    (band.threat?('<div class="dlg" style="margin-top:10px;"><div class="portrait">📵</div><div class="bubble"><div class="who">발신 번호 없음 <span style="color:var(--ink-dim);font-size:11.5px;">— 밤 11시 정각</span></div>'+band.threat+'</div></div>'):'')+
    '<div style="margin-top:16px;text-align:right;">'+
    (wrongLast.length?'<button class="btn ghost" id="exrev2">틀린 문제 다시 보기 ('+wrongLast.length+') ▶</button> ':'')+
    (final<cfg.passLine?'<button class="btn" id="exretry">특훈 한 번 더 ▶</button> ':'')+
    '<button class="btn" id="exdoor">'+(wallet.e1Done?"챕터 종료 ▶":"현관으로 ▶")+'</button></div></div>');
  stage.appendChild(card);
  const rv=$("#exrev2"); if(rv) rv.onclick=()=>exReview(wrongLast,0,exSettle);
  const rt=$("#exretry"); if(rt) rt.onclick=()=>{ exBuildRx(lastR); exDlgSeq(CH.clinicIntro,0,"클리닉 개시",exClinic); };
  const exNext=(CH.finale&&final>=cfg.passLine)?()=>exFinale(final):exOutro;  /* chF — 통과 시 피날레 시퀀스로 */
  $("#exdoor").onclick=()=>{
    commit();  /* 미달 상태로 나가는 경우 — 이 순간 확정(1회 가드) */
    if(wallet.e1Done){ exNext(); return; }
    wallet.e1Done=true; saveWallet(); log("e1_fired",{trust:wallet.trust});
    const beats=wallet.trust<=3?CH.e1.low:wallet.trust>=7?CH.e1.high:CH.e1.mid;
    exDlgSeq(beats,0,"챕터 종료 ▶",exNext);
  };
}
function exOutro(){
  BookFab.hide(); clearSave();
  const cfg=CH.examCfg, final=wallet.examBest[CURCH];
  if(final>=cfg.passLine && !wallet.cleared[CURCH]){ wallet.cleared[CURCH]=true; saveWallet(); log("chapter_clear",{}); }
  stage.innerHTML="";
  stage.appendChild(el('<div class="card fade" style="text-align:center;padding:40px 24px;">'+
    '<div style="font-size:15px;">'+(final>=cfg.passLine?CH.outro.clear:CH.outro.retry)+'</div>'+
    '<div style="margin-top:10px;font-size:12.5px;color:var(--ink-dim);">기록 — 최고 '+final+'점'+(final>=cfg.passLine?'':' · 통과선 '+cfg.passLine+'점')+'</div>'+
    '<div style="margin-top:20px;"><button class="btn ghost" id="exagain">특훈 다시 열기 ↺</button> <button class="btn" id="extitle">타이틀로 ▶</button></div></div>'));
  $("#exagain").onclick=()=>{ log("exam_again",{}); exStart(); };
  $("#extitle").onclick=sceneTitle;
}
/* ---- 피날레 (chF 전용 — CH.finale이 있고 통과했을 때만 exSettle이 호출) ----
   beats(cond 지원) 재생 → 학기말 보너스(bonusMin 이상, 1회 가드) → 종료 카드 → exOutro */
function exFinale(final){
  BookFab.hide();
  const F=CH.finale;
  log("exam_finale",{final});
  exDlgSeq(F.beats,0,"학기의 끝 ▶",()=>{
    let bonus=0;
    if(F.bonus&&final>=(F.bonusMin||101)&&!wallet.finaleBonusDone){
      wallet.finaleBonusDone=true; bonus=F.bonus; S.balance+=bonus; saveWallet();
      $("#hud-money").textContent=money(S.balance);
      log("finale_bonus",{bonus});
    }
    stage.innerHTML="";
    stage.appendChild(el('<div class="card fade" style="text-align:center;padding:40px 24px;">'+
      (bonus?'<div class="card" style="background:var(--panel2);margin-bottom:16px;">💰 '+(F.bonusLabel||"학기말 보너스")+' +'+money(bonus)+' → 잔고 <b>'+money(S.balance)+'</b></div>':'')+
      '<div style="font-size:15px;line-height:1.8;">'+F.endCard+'</div>'+
      '<div style="margin-top:22px;"><button class="btn" id="exfin">챕터 종료 ▶</button></div></div>'));
    $("#exfin").onclick=exOutro;
  });
}

/* ================================================================
   주간 루프 공용 러너 (ch02+) — 챕터 데이터(flow·trials·pool)만으로 실행
   ================================================================ */
const GEN2={ G6:()=>genG6(false), G7:()=>genG7(false), G8:()=>genG8(false), G9:()=>genG9(), G10:()=>genG10(), G11:()=>genG11(), G12:()=>genG12(), G13:()=>genG13(), G14:()=>genG14(), G15:()=>genG15(), G16:()=>genG16(), G17:()=>genG17(), G18:()=>genG18(), G19:()=>genG19(), G20:()=>genG20(), G21:()=>genG21(), G22:()=>genG22(), G23:()=>genG23(), G24:()=>genG24(), G25:()=>genG25(), G26:()=>genG26(), G27:()=>genG27(), G28:()=>genG28(), G29:()=>genG29(), G30:()=>genG30(), G31:()=>genG31(), G32:()=>genG32(), G33:()=>genG33(), G34:()=>genG34(), G35:()=>genG35(), G36:()=>genG36(), G37:()=>genG37(), G38:()=>genG38(), G39:()=>genG39(), G40:()=>genG40(), G41:()=>genG41(), G42:()=>genG42(), G43:()=>genG43(), G44:()=>genG44(), G45:()=>genG45(), G46:()=>genG46(), G47:()=>genG47(), G48:()=>genG48(), G49:()=>genG49(), G50:()=>genG50(), G51:()=>genG51(), G52:()=>genG52() };
const GENAP={ AP2:(i)=>genAP2ch(i), AP3:(i)=>genAP3ch(i), AP4:(i)=>genAP4ch(i), AP5:(i)=>genAP5ch(i), AP6:(i)=>genAP6ch(i), AP7:(i)=>genAP7ch(i), AP8:(i)=>genAP8ch(i), AP9:(i)=>genAP9ch(i), AP10:(i)=>genAP10ch(i), AP11:(i)=>genAP11ch(i), AP12:(i)=>genAP12ch(i), AP13:(i)=>genAP13ch(i) };
let GW=null;
function gwInit(){ GW={streaks:{}, attempts:{}, poolLeft:shuffle((CH.pool||[]).slice())}; S.momLine=null; S.duelDone=false; S.duelRewarded=false; }
function gwStart(){ gwInit(); gwGo(0); }

/* ---- 위젯: 스택(세로) ---- */
function stackVizEl(v){
  const w=el('<div class="fade" style="display:flex;gap:20px;align-items:flex-end;margin:10px 0;flex-wrap:wrap;"></div>');
  const col=el('<div style="display:flex;flex-direction:column-reverse;gap:4px;"></div>');
  for(let i=0;i<v.max;i++){
    const filled=i<v.cells.length;
    col.appendChild(el('<div style="display:flex;align-items:center;gap:8px;">'+
      '<div style="width:28px;text-align:right;font-size:11px;color:var(--ink-dim);">['+i+']</div>'+
      '<div class="cell" style="width:54px;'+(filled?'':'opacity:.22;')+'">'+(filled?v.cells[i]:'')+'</div>'+
      '<div style="width:62px;font-size:12px;color:var(--accent);">'+(i===v.top?'← top':'')+'</div></div>'));
  }
  w.appendChild(col);
  if(v.top===-1) w.appendChild(el('<div class="caption" style="min-height:auto;">top = -1 (공백)</div>'));
  return w;
}
/* ---- 위젯: 큐(가로) ---- */
function queueVizEl(v){
  const w=el('<div class="fade" style="margin:10px 0;overflow-x:auto;"></div>');
  const row=el('<div style="display:flex;gap:4px;align-items:flex-start;"></div>');
  const gut=el('<div style="text-align:center;"><div style="width:30px;height:38px;"></div><div style="font-size:11px;color:var(--ink-dim);height:16px;">'+((v.front===-1?'F ':'')+(v.rear===-1?'R':''))+'</div></div>');
  row.appendChild(gut);
  for(let i=0;i<v.max;i++){
    const val=v.slots[i];
    const used=(v.usedUpto!==undefined&&i<=v.usedUpto);
    const marks=(i===v.front?'F':'')+(i===v.rear?(i===v.front?' R':'R'):'');
    row.appendChild(el('<div style="text-align:center;">'+
      '<div style="font-size:11px;color:var(--ink-dim);">['+i+']</div>'+
      '<div class="cell" style="width:46px;'+(val===null||val===undefined?'opacity:.22;':(used?'opacity:.4;':''))+'">'+(val||'')+'</div>'+
      '<div style="font-size:11.5px;height:16px;color:'+(marks.includes('F')?'var(--accent2)':'var(--accent)')+';">'+marks+'</div></div>'));
  }
  w.appendChild(row);
  w.appendChild(el('<div style="font-size:11.5px;color:var(--ink-dim);margin-top:2px;">F = front · R = rear'+(v.usedUpto!==undefined&&v.usedUpto>=0?' · 흐린 칸 = 이미 dequeue된 자리':'')+'</div>'));
  return w;
}
/* ---- 위젯: 원형 큐 (SVG) ---- */
function circVizEl(v){
  const S=232, C=S/2, R=84;
  let s='<svg viewBox="0 0 '+S+' '+S+'" width="'+S+'" height="'+S+'" style="display:block;">';
  for(let i=0;i<v.max;i++){
    const ang=(-90+i*360/v.max)*Math.PI/180;
    const x=C+R*Math.cos(ang), y=C+R*Math.sin(ang);
    const lx=C+(R+30)*Math.cos(ang), ly=C+(R+30)*Math.sin(ang);
    const val=v.vals&&v.vals[i];
    const isF=i===v.front, isR=i===v.rear;
    s+='<circle cx="'+x+'" cy="'+y+'" r="21" fill="'+(val?'#2a3040':'#1c202a')+'" stroke="'+(isF||isR?'var(--accent)':'#3a4152')+'" stroke-width="'+(isF||isR?2:1)+'"/>';
    s+='<text x="'+x+'" y="'+(y+4)+'" text-anchor="middle" font-size="12" fill="#e8eaf0">'+(val||'')+'</text>';
    s+='<text x="'+lx+'" y="'+(ly+3)+'" text-anchor="middle" font-size="10" fill="#59606e">['+i+']</text>';
    if(isF) s+='<text x="'+x+'" y="'+(y-26)+'" text-anchor="middle" font-size="11" font-weight="bold" fill="#7ec8a9">F</text>';
    if(isR) s+='<text x="'+x+'" y="'+(y+34)+'" text-anchor="middle" font-size="11" font-weight="bold" fill="#f4b860">R</text>';
  }
  s+='<text x="'+C+'" y="'+(C+4)+'" text-anchor="middle" font-size="11" fill="#8a93a5">MAX='+v.max+'</text></svg>';
  const w=el('<div class="fade" style="display:flex;gap:10px;align-items:center;margin:6px 0;flex-wrap:wrap;"></div>');
  w.appendChild(el('<div>'+s+'</div>'));
  return w;
}
/* ---- 위젯: 단순 연결 리스트 (ch4+) ----
   v={type:"list", name:"ptr", nodes:[{v,hl,dim}], null:true(기본),
      arrows:[스타일...] (노드 수와 동일 — 마지막은 NULL로 가는 화살표; 'ok'|'new'|'cut'|'none'),
      over:{from,to} (from 노드에서 to 노드로 건너뛰는 강조 화살표),
      below:{gap, v, hl, note} (gap번 노드 뒤 아래에 떠 있는 노드 + 위쪽 주석 html)} */
function lvArrowStyle(st){
  if(st==="new") return 'color:var(--accent);font-weight:700;';
  if(st==="cut") return 'color:var(--ink-dim);opacity:.30;text-decoration:line-through;';
  if(st==="none") return 'visibility:hidden;';
  return 'color:var(--ink-dim);';
}
function lvNodeEl(n,short){
  const bg=n.dim?'opacity:.35;':'';
  const bd=n.hl?'border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);':'';
  return '<span style="display:inline-flex;align-items:stretch;background:var(--cell);border:1px solid var(--line);border-radius:8px;overflow:hidden;'+bg+bd+'">'+
    '<span style="padding:7px 12px;font-weight:600;">'+n.v+'</span>'+
    '<span style="border-left:1px solid var(--line);padding:7px 8px;color:var(--accent2);font-size:11px;display:flex;align-items:center;">●</span></span>';
}
function listVizEl(v){
  const nodes=v.nodes, L=nodes.length;
  const colOf=k=>3+2*k;                       /* 노드 k의 grid 열 */
  const g=el('<div class="fade" style="display:inline-grid;align-items:center;row-gap:2px;margin:10px 0;max-width:100%;overflow-x:auto;padding:4px 2px;"></div>');
  const put=(html,row,col,colEnd)=>{ const e=el(html); e.style.gridRow=row; e.style.gridColumn=colEnd?(col+' / '+colEnd):col; g.appendChild(e); return e; };
  /* row2: 본 체인 */
  put('<span style="color:var(--accent);font-weight:700;padding-right:2px;">'+(v.name||"ptr")+'</span>',2,1);
  put('<span style="'+lvArrowStyle(v.nameArrow||"ok")+'padding:0 6px;">─▶</span>',2,2);
  nodes.forEach((n,k)=>{
    put(lvNodeEl(n),2,colOf(k));
    const st=(v.arrows&&v.arrows[k])||"ok";
    if(k<L-1) put('<span style="'+lvArrowStyle(st)+'padding:0 6px;">─▶</span>',2,colOf(k)+1);
    else if(v.null!==false) put('<span style="'+lvArrowStyle(st)+'padding:0 6px;">─▶</span>',2,colOf(k)+1);
  });
  if(v.null!==false)
    put('<span style="border:1px dashed var(--line);border-radius:8px;padding:7px 10px;color:var(--ink-dim);font-size:12.5px;">NULL</span>',2,colOf(L));
  /* row1: 건너뛰기 화살표 */
  if(v.over){
    const e=put('<div style="position:relative;height:14px;margin:0 10px 2px;border-top:2px solid var(--accent);border-left:2px solid var(--accent);border-right:2px solid var(--accent);border-radius:8px 8px 0 0;"><span style="position:absolute;right:-6px;bottom:-7px;color:var(--accent);font-size:12px;">▼</span></div>',1,colOf(v.over.from),colOf(v.over.to)+1);
    e.style.alignSelf='end';
  }
  /* row3: 아래 떠 있는 노드 (width:0 트릭 — 열 폭을 늘리지 않음) */
  if(v.below){
    const b=v.below;
    const e=put('<div style="width:0;overflow:visible;justify-self:center;">'+
      '<div style="display:flex;flex-direction:column;align-items:center;margin-top:2px;transform:translateX(-50%);white-space:nowrap;">'+
      '<div style="font-size:13px;line-height:1.1;min-height:15px;">'+(b.note||'')+'</div>'+
      lvNodeEl({v:b.v,hl:b.hl})+
      '</div></div>',3,colOf(b.gap)+1,colOf(b.gap)+3);
    e.style.justifySelf='center';
  }
  return g;
}
/* ---- 위젯: 이중 연결 (원형·헤드) 리스트 ----
   v={type:"dlist", nodes:[{v,head,hl,dim}], conns:[{r,l}...] (노드수-1),
      wrap:true(기본 — 양끝 ⇄ head 닫힘 표시), below:{gap,v,hl,note}} */
function dlConnEl(c){
  c=c||{};
  return '<span style="display:inline-flex;flex-direction:column;line-height:1.02;padding:0 5px;font-size:13px;">'+
    '<span style="'+lvArrowStyle(c.r||"ok")+'">─▶</span>'+
    '<span style="'+lvArrowStyle(c.l||"ok")+'">◀─</span></span>';
}
function dlNodeEl(n){
  const bg=n.dim?'opacity:.35;':'';
  const bd=n.hl?'border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);':'';
  const head=n.head;
  return '<span style="display:inline-flex;align-items:stretch;background:'+(head?'var(--panel2)':'var(--cell)')+';border:1px solid var(--line);border-radius:8px;overflow:hidden;'+bg+bd+'">'+
    '<span style="border-right:1px solid var(--line);padding:7px 7px;color:var(--accent2);font-size:11px;display:flex;align-items:center;">●</span>'+
    '<span style="padding:7px 11px;font-weight:600;'+(head?'color:var(--ink-dim);':'')+'">'+(head?'head':n.v)+'</span>'+
    '<span style="border-left:1px solid var(--line);padding:7px 7px;color:var(--accent2);font-size:11px;display:flex;align-items:center;">●</span></span>';
}
function dlistVizEl(v){
  const nodes=v.nodes, L=nodes.length;
  const colOf=k=>2+2*k;
  const g=el('<div class="fade" style="display:inline-grid;align-items:center;row-gap:2px;margin:10px 0;max-width:100%;overflow-x:auto;padding:4px 2px;"></div>');
  const put=(html,row,col,colEnd)=>{ const e=el(html); e.style.gridRow=row; e.style.gridColumn=colEnd?(col+' / '+colEnd):col; g.appendChild(e); return e; };
  if(v.wrap!==false) put('<span style="color:var(--ink-dim);font-size:12px;padding-right:4px;">⟲⇄</span>',1,1);
  nodes.forEach((n,k)=>{
    put(dlNodeEl(n),1,colOf(k));
    if(k<L-1) put(dlConnEl(v.conns&&v.conns[k]),1,colOf(k)+1);
  });
  if(v.wrap!==false) put('<span style="color:var(--ink-dim);font-size:12px;padding-left:4px;">⇄⟳ (다시 head)</span>',1,colOf(L-1)+1);
  if(v.below){
    const b=v.below;
    const e=put('<div style="width:0;overflow:visible;justify-self:center;">'+
      '<div style="display:flex;flex-direction:column;align-items:center;margin-top:4px;transform:translateX(-50%);white-space:nowrap;">'+
      '<div style="font-size:13px;line-height:1.15;min-height:15px;">'+(b.note||'')+'</div>'+
      dlNodeEl({v:b.v,hl:b.hl})+
      '</div></div>',2,colOf(b.gap)+1,colOf(b.gap)+3);
    e.style.justifySelf='center';
  }
  return g;
}
/* ---- 위젯: 트리 (SVG) ----
   v={type:"tree", data:{v,id?,hl?,dim?,tag?,edge?("ok"|"hl"|"cut"|"new"|"none"),c:[자식...]},
      links:[{a,b,style:"sib"|"hl",lab?}], slots:true(이진 빈자리 점선 표시), unit?:x간격px}
   c 배열의 null = 자리만 차지하는 빈 자식(이진 트리 위치 잡기). id 생략 시 v가 id. */
function treeVizEl(v){
  const XU=v.unit||46, YU=58, R=17;
  const flat=[]; let maxD=0;
  function leaves(n){ if(!n) return 1; if(!n.c||!n.c.length) return 1; return n.c.reduce((s,ch)=>s+leaves(ch),0); }
  function place(n,d,x0){ /* x0: 시작 리프 단위 → 중심 x 반환 */
    if(!n) return x0+0.5;
    maxD=Math.max(maxD,d);
    const kids=n.c||[];
    if(!kids.length){ const cx=x0+0.5; flat.push({n,d,cx}); return cx; }
    let acc=x0; const cxs=[];
    kids.forEach(ch=>{ const w=leaves(ch); cxs.push(place(ch,d+1,acc)); acc+=w; });
    const cx=(cxs[0]+cxs[cxs.length-1])/2;
    flat.push({n,d,cx,kidCxs:cxs,kids});
    return cx;
  }
  place(v.data,0,0);
  const W=leaves(v.data)*XU+16, H=(maxD+1)*YU+8;
  const px=cx=>8+cx*XU, py=d=>R+6+d*YU;
  const eStyle=k=>k==="hl"?'stroke:var(--accent);stroke-width:2;':k==="cut"?'stroke:var(--line);stroke-width:1.6;stroke-dasharray:4 4;opacity:.45;':k==="new"?'stroke:var(--accent2);stroke-width:2;':'stroke:var(--line);stroke-width:1.6;';
  let edges='', nodes='', extra='';
  const posOf={};
  flat.forEach(f=>{ posOf[(f.n.id!==undefined?f.n.id:f.n.v)]=f; });
  flat.forEach(f=>{
    (f.kids||[]).forEach((ch,k)=>{
      if(!ch){ if(v.slots) extra+='<circle cx="'+px(f.kidCxs[k])+'" cy="'+py(f.d+1)+'" r="'+(R-3)+'" style="fill:none;stroke:var(--line);stroke-dasharray:3 4;opacity:.5;"/>'; return; }
      const st=ch.edge||"ok"; if(st==="none") return;
      edges+='<line x1="'+px(f.cx)+'" y1="'+(py(f.d)+R)+'" x2="'+px(f.kidCxs[k])+'" y2="'+(py(f.d+1)-R)+'" style="'+eStyle(st)+'"/>';
    });
  });
  flat.forEach(f=>{
    const n=f.n, x=px(f.cx), y=py(f.d);
    const dim=n.dim?'opacity:.35;':'';
    const ring=n.hl?'stroke:var(--accent);stroke-width:2.4;':'stroke:var(--line);stroke-width:1.6;';
    nodes+='<g style="'+dim+'"><circle cx="'+x+'" cy="'+y+'" r="'+R+'" style="fill:var(--cell);'+ring+'"/>'+
      '<text x="'+x+'" y="'+(y+4.5)+'" text-anchor="middle" style="fill:var(--ink);font-size:13px;font-weight:700;">'+n.v+'</text>'+
      (n.tag!==undefined?'<text x="'+(x+R+2)+'" y="'+(y-R+4)+'" style="fill:var(--accent2);font-size:11px;font-weight:700;">'+n.tag+'</text>':'')+'</g>';
  });
  (v.links||[]).forEach(l=>{
    const A=posOf[l.a], B=posOf[l.b]; if(!A||!B) return;
    const x1=px(A.cx), y1=py(A.d), x2=px(B.cx), y2=py(B.d);
    const col=l.style==="hl"?"var(--accent)":"var(--accent2)";
    const dx=x2>x1?R+2:-(R+2);
    if(A.d===B.d){ /* 같은 층 — 수평(형제) */
      extra+='<line x1="'+(x1+dx)+'" y1="'+y1+'" x2="'+(x2-dx)+'" y2="'+y2+'" style="stroke:'+col+';stroke-width:1.8;stroke-dasharray:5 4;"/>'+
        '<text x="'+((x1+x2)/2)+'" y="'+(y1-6)+'" text-anchor="middle" style="fill:'+col+';font-size:10.5px;">'+(l.lab||"")+'</text>'+
        '<polygon points="'+(x2-dx)+','+y2+' '+(x2-dx-(x2>x1?7:-7))+','+(y2-4)+' '+(x2-dx-(x2>x1?7:-7))+','+(y2+4)+'" style="fill:'+col+';"/>';
    } else {
      extra+='<line x1="'+x1+'" y1="'+(y1+(y2>y1?R:-R))+'" x2="'+x2+'" y2="'+(y2-(y2>y1?R+8:-(R+8)))+'" style="stroke:'+col+';stroke-width:1.8;stroke-dasharray:5 4;"/>'+
        '<polygon points="'+x2+','+(y2-(y2>y1?R:-R))+' '+(x2-4)+','+(y2-(y2>y1?R+8:-(R+8)))+' '+(x2+4)+','+(y2-(y2>y1?R+8:-(R+8)))+'" style="fill:'+col+';"/>';
    }
  });
  const w=el('<div class="fade" style="margin:10px 0;max-width:100%;overflow-x:auto;"></div>');
  w.innerHTML='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" style="display:block;">'+edges+extra+nodes+'</svg>';
  if(v.name) w.insertBefore(el('<div style="font-size:12.5px;color:var(--accent);font-weight:700;margin-bottom:2px;">'+v.name+'</div>'),w.firstChild);
  return w;
}
/* ---- 위젯: 그래프 (5장~) — 고정 좌표 정점 + 간선(무방향/방향·강조·가중치 라벨)
   v={type:"graph", nodes:[{id,x,y,hl,dim,tag}], edges:[{a,b,dir,hl,dim,cut,lab,curve}]}
   좌표는 임의 단위 px — 경계에 여백을 붙여 viewBox 계산. dir=true면 a→b 화살표. curve=1/-1 곡선(쌍방 간선용). */
function graphVizEl(v){
  const R=17, PAD=26;
  const xs=v.nodes.map(n=>n.x), ys=v.nodes.map(n=>n.y);
  const x0=Math.min(...xs)-PAD-R, y0=Math.min(...ys)-PAD-R;
  const W=Math.max(...xs)-Math.min(...xs)+2*(PAD+R), H=Math.max(...ys)-Math.min(...ys)+2*(PAD+R);
  const P={}; v.nodes.forEach(n=>P[n.id]=n);
  /* 화살표 헤드는 작게 — 여러 화살표가 한 정점에 몰릴 때의 가독성 (감수 2026-08-27) */
  let defs='<defs><marker id="garrow" markerWidth="6.5" markerHeight="6.5" refX="5.8" refY="3.25" orient="auto"><path d="M0,0 L6.5,3.25 L0,6.5 z" style="fill:var(--ink-dim);"/></marker>'+
    '<marker id="garrowhl" markerWidth="6.5" markerHeight="6.5" refX="5.8" refY="3.25" orient="auto"><path d="M0,0 L6.5,3.25 L0,6.5 z" style="fill:var(--accent);"/></marker></defs>';
  let edges='', labels='';
  (v.edges||[]).forEach(e=>{
    const A=P[e.a], B=P[e.b]; if(!A||!B) return;
    const dx=B.x-A.x, dy=B.y-A.y, L=Math.sqrt(dx*dx+dy*dy)||1;
    const ux=dx/L, uy=dy/L;
    const sx=A.x+ux*R, sy=A.y+uy*R;                      /* 원 둘레에서 출발 */
    const tx=B.x-ux*(R+(e.dir?3:0)), ty=B.y-uy*(R+(e.dir?3:0)); /* 화살표 여유 */
    const st=e.hl?'stroke:var(--accent);stroke-width:2.2;':e.cut?'stroke:var(--line);stroke-width:1.6;stroke-dasharray:4 4;opacity:.45;':(e.dim?'stroke:var(--line);stroke-width:1.6;opacity:.35;':'stroke:var(--line);stroke-width:1.7;');
    const mk=e.dir?(' marker-end="url(#'+(e.hl?'garrowhl':'garrow')+')"'):'';
    /* 라벨: halo(배경 테두리)로 선과 분리 + lpos(간선 위 위치 0~1)·loff(수직 오프셋 px, 음수로 반대편) 지원 (감수 2026-08-27) */
    const LSTY='fill:var(--accent2);font-size:11.5px;font-weight:700;paint-order:stroke;stroke:var(--panel);stroke-width:3px;stroke-linejoin:round;';
    const lt=(e.lpos!==undefined)?e.lpos:0.5, lo=(e.loff!==undefined)?e.loff:11;
    if(e.curve){ const mx=(sx+tx)/2-uy*18*e.curve, my=(sy+ty)/2+ux*18*e.curve;
      edges+='<path d="M'+sx+','+sy+' Q'+mx+','+my+' '+tx+','+ty+'" style="fill:none;'+st+'"'+mk+'/>';
      if(e.lab!==undefined){
        const t2=lt, omt=1-t2;                                    /* 2차 베지에 위의 lpos 지점 */
        const bx=omt*omt*sx+2*omt*t2*mx+t2*t2*tx, by=omt*omt*sy+2*omt*t2*my+t2*t2*ty;
        labels+='<text x="'+(bx-uy*8*e.curve)+'" y="'+(by+ux*8*e.curve+4)+'" text-anchor="middle" style="'+LSTY+'">'+e.lab+'</text>';
      }
    } else {
      edges+='<line x1="'+sx+'" y1="'+sy+'" x2="'+tx+'" y2="'+ty+'" style="'+st+'"'+mk+'/>';
      if(e.lab!==undefined){ const px2=sx+(tx-sx)*lt-uy*lo, py2=sy+(ty-sy)*lt+ux*lo;
        labels+='<text x="'+px2+'" y="'+(py2+4)+'" text-anchor="middle" style="'+LSTY+'">'+e.lab+'</text>'; }
    }
  });
  let nodes='';
  v.nodes.forEach(n=>{
    const dim=n.dim?'opacity:.35;':'';
    const ring=n.hl?'stroke:var(--accent);stroke-width:2.4;':'stroke:var(--line);stroke-width:1.6;';
    nodes+='<g style="'+dim+'"><circle cx="'+n.x+'" cy="'+n.y+'" r="'+R+'" style="fill:var(--cell);'+ring+'"/>'+
      '<text x="'+n.x+'" y="'+(n.y+4.5)+'" text-anchor="middle" style="fill:var(--ink);font-size:13px;font-weight:700;">'+(n.v!==undefined?n.v:n.id)+'</text>'+
      (n.tag!==undefined?'<text x="'+(n.x+R+2)+'" y="'+(n.y-R+4)+'" style="fill:var(--accent2);font-size:11px;font-weight:700;">'+n.tag+'</text>':'')+'</g>';
  });
  const wrap=el('<div class="fade" style="overflow-x:auto;margin:8px 0;"></div>');
  wrap.innerHTML='<svg viewBox="'+x0+' '+y0+' '+W+' '+H+'" style="width:'+Math.min(W,430)+'px;max-width:100%;display:block;" xmlns="http://www.w3.org/2000/svg">'+defs+edges+labels+nodes+'</svg>';
  return wrap;
}
/* ---- 위젯: 인접 행렬 표 — v={type:"adjmat", labels:[정점...], m:[[...]], hiR?, hiC?, hi:{r,c}?} ---- */
function adjMatEl(v){
  const lab=v.labels||v.m.map((_,i)=>String(i));
  let t='<table class="trip mono" style="margin:8px 0;"><tr><th></th>';
  lab.forEach(l=>t+='<th>'+l+'</th>'); t+='</tr>';
  v.m.forEach((row,r)=>{
    t+='<tr'+(v.hiR===r?' class="hi"':'')+'><td><b>'+lab[r]+'</b></td>';
    row.forEach((c,ci)=>{
      const hot=(v.hi&&v.hi.r===r&&v.hi.c===ci)||v.hiC===ci&&v.hiR===undefined;
      t+='<td'+(hot?' style="color:var(--accent);font-weight:700;"':'')+'>'+c+'</td>';
    });
    t+='</tr>';
  });
  t+='</table>';
  const wrap=el('<div class="fade" style="overflow-x:auto;"></div>'); wrap.innerHTML=t; return wrap;
}
/* ---- 위젯: 배열 상자 (정렬용) — v={type:"arr", a:[값...], hi:[비교 강조 idx], done:[확정 idx], sep?:경계 idx(이 앞까지 정렬됨 표시), tags?:[값 아래 꼬리표]} ---- */
function arrVizEl(v){
  const hi=new Set(v.hi||[]), done=new Set(v.done||[]);
  const seps=new Set(Array.isArray(v.sep)?v.sep:(v.sep!==undefined?[v.sep]:[]));  /* 부리스트 경계 — 인덱스 배열 허용 */
  const base=v.base||0;  /* 인덱스 라벨 시작(히프 1번 칸 규약용) */
  let h='<div style="display:flex;gap:0;align-items:flex-end;flex-wrap:wrap;margin:8px 0;">';
  v.a.forEach((val,i)=>{
    const isHi=hi.has(i), isDone=done.has(i);
    const bd=isHi?'2px solid var(--accent)':'1px solid var(--line)';
    const bg=isDone?'var(--cell-hi)':'var(--cell)';
    const sepL=seps.has(i)?'margin-left:14px;':'';
    h+='<div style="display:flex;flex-direction:column;align-items:center;'+sepL+'margin-right:4px;">'+
       '<div class="mono" style="min-width:40px;padding:9px 6px;text-align:center;border:'+bd+';border-radius:8px;background:'+bg+';font-weight:700;font-size:14.5px;color:'+(isHi?'var(--accent)':'var(--ink)')+';">'+val+'</div>'+
       '<div style="font-size:10.5px;color:var(--ink-dim);margin-top:3px;">['+(i+base)+']'+((v.tags&&v.tags[i]!==undefined&&v.tags[i]!=="")?' <span style="color:var(--accent2);">'+v.tags[i]+'</span>':'')+'</div></div>';
  });
  h+='</div>';
  const wrap=el('<div class="fade" style="overflow-x:auto;"></div>'); wrap.innerHTML=h; return wrap;
}
function anyVizEl(v){
  if(v.type==="arr") return arrVizEl(v);
  if(v.type==="graph") return graphVizEl(v);
  if(v.type==="adjmat") return adjMatEl(v);
  if(v.type==="stack") return stackVizEl(v);
  if(v.type==="queue") return queueVizEl(v);
  if(v.type==="circ") return circVizEl(v);
  if(v.type==="list") return listVizEl(v);
  if(v.type==="dlist") return dlistVizEl(v);
  if(v.type==="tree") return treeVizEl(v);
  return null;
}
/* ---- 위젯: 스텝 플레이어 (코드 한 줄 ↔ 그림 한 프레임) ----
   S={code:[줄...], frames:[{hl:줄번호(-1=없음), viz:{...}, html:'...', cap:'설명'}], startLabel?} */
function renderSteps(box,S,done){
  const wrap=el('<div class="fade" style="border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin-top:12px;background:var(--panel2);"></div>');
  let lineEls=[];
  if(S.code){
    const cb=el('<div class="codebox" style="margin-top:0;"></div>');
    S.code.forEach(ln=>{ const e=el('<div class="codeline">'+(ln===""?" ":hlC(String(ln)))+'</div>'); lineEls.push(e); cb.appendChild(e); });
    wrap.appendChild(cb);
  }
  const vizSlot=el('<div style="margin-top:6px;"></div>');
  const cap=el('<div class="caption" style="min-height:auto;margin-top:6px;"></div>');
  const btnRow=el('<div style="margin-top:10px;text-align:right;"></div>');
  wrap.appendChild(vizSlot); wrap.appendChild(cap); wrap.appendChild(btnRow);
  box.appendChild(wrap);
  let k=-1;
  function show(){
    k++;
    const f=S.frames[k];
    lineEls.forEach((e,i)=>e.classList.toggle('hi', f.hl===i));
    vizSlot.innerHTML='';
    if(f.viz){ const e=anyVizEl(f.viz); if(e) vizSlot.appendChild(e); }
    if(f.html) vizSlot.appendChild(el('<div class="fade" style="overflow-x:auto;">'+f.html+'</div>'));
    cap.innerHTML='<b style="color:var(--accent);">단계 '+(k+1)+'/'+S.frames.length+'</b> — '+f.cap;
    btnRow.innerHTML='';
    const last=k>=S.frames.length-1;
    const b=el('<button class="btn'+(last?'':' ghost')+'" style="padding:6px 16px;">'+(last?'계속 ▼':'다음 단계 ▶')+'</button>');
    b.onclick=()=>{ if(last) done(); else show(); };
    btnRow.appendChild(b);
    window.scrollTo({top:document.body.scrollHeight, behavior:"smooth"});
  }
  const s=el('<button class="btn" style="padding:6px 16px;">'+(S.startLabel||'▶ 한 단계씩 따라가 보기')+'</button>');
  s.onclick=()=>{ s.remove(); show(); };
  btnRow.appendChild(s);
}
/* ---- 공통: 문항 시각 자료 렌더 ---- */
function renderViz(card,item){
  if(item.ops&&item.ops.length){
    const box=el('<div class="codebox fade" style="max-width:280px;"></div>');
    item.ops.forEach(o=>box.appendChild(el('<div class="codeline">'+o+'</div>')));
    const wrap=el('<div style="display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap;"></div>');
    wrap.appendChild(box);
    if(item.viz){
      const ve=anyVizEl(item.viz); if(ve) wrap.appendChild(ve);
    }
    card.appendChild(wrap);
    return;
  }
  if(item.viz){
    const ve=anyVizEl(item.viz);
    if(ve) card.appendChild(ve);
    else if(item.viz.type==="ops"){
      card.appendChild(el('<div class="terms fade" style="margin:8px 0;">'+item.viz.list.map(t=>'<span class="term">'+t+'</span>').join('')+'</div>'));
    }
  }
  if(item.code){
    const cb=el('<div class="codebox fade"></div>');
    item.code.forEach(ln=>cb.appendChild(el('<div class="codeline">'+(ln===""?" ":hlC(String(ln)))+'</div>')));
    card.appendChild(cb);
  }
}

/* ---- 러너 ---- */
function gwGo(i){
  const tok=CH.flow[i];
  if(tok===undefined){ sceneTitle(); return; }
  if(tok==="sunday"){ sceneSundayIntro(); return; }        /* 정산은 기존 공용 씬 */
  if(tok==="saturday"){ gwSaturday(i); return; }
  const m=tok.match(/^(study|trial|il|tutor|mission|maze)(?:-(.+))?$/);
  const kind=m[1], key=m[2];
  if(kind==="study"){ sceneStudy(key, ()=>gwGo(i+1)); return; }
  if(kind==="trial"){ gwTrial(key,i); return; }
  if(kind==="il"){ gwInterlude(key,i); return; }
  if(kind==="tutor"){ gwTutor(i,1); return; }
  if(kind==="mission"){ gwMission(i); return; }
  if(kind==="maze"){ gwMaze(i,0,[]); return; }
  sceneTitle();
}
function gwTrial(key,i){
  saveCP(CH.flow[i]);
  const t=CH.trials[key];
  setHUD(CH.study[key].day, CH.study[key].label+" 시련");
  GW.attempts[key]=(GW.attempts[key]||0)+1;
  let item, src;
  const poolItems=GW.poolLeft.filter(p=>p.unit===key);
  if(poolItems.length && Math.random()<0.4){
    const p=poolItems[0];
    GW.poolLeft.splice(GW.poolLeft.indexOf(p),1);
    item={...p}; if(p.choices) item.choices=shuffle(p.choices.map(c=>({...c}))); src="pool:"+p.id;
  } else {
    /* 동일 문제 연속 출제 방지 — 유닛별 최근 2문의 시그니처(qtype+params)를 기억하고, 겹치면 재생성 */
    GW.recentSig=GW.recentSig||{};
    const seen=GW.recentSig[key]=GW.recentSig[key]||[];
    let g=6;
    do{ item=GEN2[t.gen](); } while(g-->0 && seen.indexOf((item.qtype||"")+"|"+JSON.stringify(item.params||{}))>=0);
    seen.push((item.qtype||"")+"|"+JSON.stringify(item.params||{}));
    if(seen.length>2) seen.shift();
    src=t.gen;
  }
  log("item_shown",{unit:key, gen:src, qtype:item.qtype||"", params:item.params||{}, attempt:GW.attempts[key]});
  stage.innerHTML="";
  const card=el('<div class="card fade">'+streakBar(GW.streaks[key]||0, t.label+" · 문제 #"+GW.attempts[key])+'</div>');
  renderViz(card,item);
  let answered=false;
  const qbox=el('<div style="margin-top:12px;"></div>'); card.appendChild(qbox); stage.appendChild(card);
  const getHint=attachBook(card, CH.hints[key], key, ()=>answered);
  renderItem(qbox,item,{unit:key,hintUsed:getHint,onDone:(correct,hintUsed,fb)=>{
    answered=true;
    if(correct){ if(!hintUsed) GW.streaks[key]=(GW.streaks[key]||0)+1; } else GW.streaks[key]=0;
    if((GW.streaks[key]||0)>=3){
      log("mastery_reached",{unit:key, attempts:GW.attempts[key]});
      fb.appendChild(nextBtnRow(t.doneLabel||(CH.study[key].label+" 숙달 ▶"),()=>gwGo(gwIdx(i)+1)));
    } else fb.appendChild(nextBtnRow("다음 문제 ▶",()=>gwTrial(key,i)));
  }});
}
function gwIdx(i){ return i; }
function gwInterlude(key,i){
  BookFab.hide();
  saveCP(CH.flow[i]);
  stage.innerHTML="";
  const ilHeader=(CH.ilMeta&&CH.ilMeta[key]&&CH.ilMeta[key].header)||"🌙 자습 끝 — 오늘의 마무리";  /* 특별 씬(E2 등) 헤더 오버라이드 */
  const card=el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">'+ilHeader+'</div></div>');
  (CH.interludes[key]||[]).filter(d=>evalCond(d.cond)).forEach(d=>{
    card.appendChild(el('<div class="dlg" style="margin-top:12px;"><div class="portrait">'+AV(d.face)+'</div><div class="bubble"><div class="who">'+d.who+'</div>'+d.text+'</div></div>'));
    if(d.clue && addClue(d.clue.id,d.clue.text))
      card.appendChild(el('<div class="fade" style="margin:6px 0 0 60px;font-size:12.5px;color:var(--accent);">🕵️ 단서 수첩에 기록됨 — 하단 📖 책에서 언제든 다시 볼 수 있다.</div>'));
  });
  card.appendChild(el('<div style="margin-top:16px;text-align:right;"><button class="btn" id="ilnext">'+(CH.ilNext&&CH.ilNext[key]||"다음 ▶")+'</button></div>'));
  stage.appendChild(card);
  $("#ilnext").onclick=()=>gwGo(i+1);
}
function gwTutor(i,round,cont){
  BookFab.hide();
  if(round===1) saveCP(CH.flow[i]);
  setHUD(round===1?"수요일":"토요일", round===1?"과외":"보충 과외");
  const firstTry=[];
  log("tutoring_start",{round});
  askQ(0);
  function askQ(qi){
    stage.innerHTML=""; BookFab.hide();
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
    if(round===1){ S.tutorFirstTry=firstTry.length; S.tutorPassed=passed; gwTutorResult(passed,firstTry.length,i); }
    else {
      if(passed){ S.tutorPassed=true; (cont||function(){})(); }
      else {
        stage.innerHTML="";
        stage.appendChild(el('<div class="card fade"><div class="dlg"><div class="portrait">'+AV("doyun-worried")+'</div><div class="bubble"><div class="who">도윤</div>으으… 한 번만 더요. 이번엔 진짜 알 것 같단 말이에요.</div></div>'+
          '<div style="margin-top:16px;text-align:right;"><button class="btn" id="re">보충 다시 ↺</button></div></div>'));
        $("#re").onclick=()=>gwTutor(i,2,cont);
      }
    }
  }
}
function gwTutorResult(passed,count,i){
  $("#hud-grade").textContent=passed?"상승 중":"불안";
  stage.innerHTML="";
  const msg=passed
    ? '<div class="dlg"><div class="portrait">'+AV("doyun-happy")+'</div><div class="bubble"><div class="who">도윤</div>'+(CH.tutorPassMsg||'오늘 좀 이해된 것 같아요.')+'</div></div>'
    : '<div class="dlg"><div class="portrait">'+AV("doyun-worried")+'</div><div class="bubble"><div class="who">도윤</div>'+(CH.tutorFailMsg||'음… 쌤, 오늘 설명 좀 헷갈렸어요. 토요일에 한 번 더 해주시면 안 돼요?')+'</div></div>';
  stage.appendChild(el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">과외 결과 <span class="tag">통과 기준: 첫 시도 정답 2/3</span></div>'+msg+
    '<div class="caption">첫 시도 정답 '+count+'/3 — '+(passed?"통과 ✅":"미달 🔁 토요일 보충 과외가 잡혔다.")+'</div>'+
    '<div style="margin-top:16px; text-align:right;"><button class="btn" id="tnext">'+(CH.tutorNextLabel||"다음 ▶")+'</button></div></div>'));
  $("#tnext").onclick=()=>gwGo(i+1);
}
function gwSaturday(i){
  BookFab.hide();
  saveCP("saturday");
  setHUD("토요일","과외 2일차");
  if(!S.tutorPassed){
    stage.innerHTML="";
    stage.appendChild(el('<div class="card fade"><div class="dlg"><div class="portrait">'+AV("doyun-worried")+'</div><div class="bubble"><div class="who">도윤</div>쌤, 수요일에 헷갈렸던 거… 오늘 다시 물어볼게요. 월요일이 시험이란 말이에요.</div></div>'+
      '<div style="margin-top:16px;text-align:right;"><button class="btn" id="go">보충 과외 시작 ▶</button></div></div>'));
    $("#go").onclick=()=>gwTutor(i,2,()=>gwAplusOffer(i));
  } else gwAplusOffer(i);
}
function apSkin(){ return (CH.aplusSkin && evalCond(CH.aplusSkin.cond)) ? CH.aplusSkin : null; }
function gwAplusOffer(i){
  BookFab.hide();
  saveCP("saturday");
  const skin=apSkin();
  setHUD("토요일", skin?(skin.hud||"도발장"):"A+ 트랙?");
  stage.innerHTML="";
  const card=el('<div class="card fade"></div>');
  if(skin){
    if(skin.header) card.appendChild(el('<div style="font-size:13px;color:var(--ink-dim);">'+skin.header+'</div>'));
    (skin.offer||[]).filter(d=>evalCond(d.cond)).forEach(d=>card.appendChild(el('<div class="dlg" style="margin-top:12px;"><div class="portrait">'+AV(d.face)+'</div><div class="bubble"><div class="who">'+d.who+'</div>'+d.text+'</div></div>')));
  } else {
    card.appendChild(el('<div class="dlg"><div class="portrait">'+AV("doyun")+'</div><div class="bubble"><div class="who">도윤</div>쌤, 이번 주도 <b>A+ 보너스</b> 노려볼까요? 교수님이 심화 문제도 낸다고 했거든요.</div></div>'));
  }
  card.appendChild(el('<div style="margin-top:18px; display:flex; gap:10px; justify-content:flex-end;">'+
    '<button class="btn ghost" id="basic">'+(skin&&skin.declineLabel||'"이번 주는 기본기부터 다지자" (기본 트랙)')+'</button>'+
    '<button class="btn" id="aplus">'+(skin&&skin.acceptLabel||'"좋아, A+ 노려보자" (심화 3문제)')+'</button></div>'));
  stage.appendChild(card);
  $("#basic").onclick=()=>{ S.aplusAccepted=false; log("aplus_choice",{accepted:false, skin:!!skin}); gwGo(i+1); };
  $("#aplus").onclick=()=>{ S.aplusAccepted=true; log("aplus_choice",{accepted:true, skin:!!skin}); gwAplus(0,0,i); };
}
function gwAplus(idx,correctCnt,i){
  BookFab.hide();
  const skin=apSkin();
  setHUD("토요일",(skin?(skin.hud||"도발장"):"A+ 심화")+" "+(idx+1)+"/3");
  const item=GENAP[CH.apGen](idx);
  log("item_shown",{unit:"aplus",itemId:item.id,qtype:item.qtype||"",params:item.params||{}});
  stage.innerHTML="";
  const card=el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">'+(skin?(skin.qHeader||"🗡 도발장")+" — ":"🔥 A+ 트랙 — 심화 ")+(idx+1)+'/3 <span class="tag">통과 기준 2/3 · 힌트 없음 · 오답 시 복습 가능(점수는 첫 시도만)</span></div></div>');
  renderViz(card,item);
  const body=el('<div style="margin-top:10px;"></div>'); card.appendChild(body); stage.appendChild(card);
  let firstTry=true, nc=correctCnt;
  function proceed(fb){
    if(idx<2) fb.appendChild(nextBtnRow("다음 심화 ▶",()=>gwAplus(idx+1,nc,i)));
    else finish(fb);
  }
  function attempt(){
    body.innerHTML="";
    const inst = firstTry ? item : {...item, choices:item.choices?shuffle(item.choices.map(c=>({...c}))):undefined};
    renderItem(body,inst,{unit:firstTry?"aplus":"aplus-retry",fbPrefix:'📖 <i>책의 여백 메모</i> — ',hintUsed:()=>false,onDone:(correct,_,fb)=>{
      if(firstTry){ nc=correctCnt+(correct?1:0); firstTry=false; }
      if(correct){ proceed(fb); return; }
      /* 오답 — 해설을 본 뒤 같은 문제로 이해를 검증할 수 있다 (점수 무관) */
      const row=el('<div style="margin-top:12px;display:flex;gap:10px;justify-content:flex-end;"><button class="btn" id="apretry">같은 문제 다시 풀기 ↺ <span style="font-size:11px;color:var(--ink-dim);">점수 무관</span></button></div>');
      fb.appendChild(row);
      $("#apretry").onclick=()=>{ log("aplus_retry",{idx}); attempt(); };
      proceed(fb);
    }});
  }
  attempt();
  function finish(fb){
      S.aplusSuccess=nc>=2;
      log("aplus_result",{correct:nc, success:S.aplusSuccess});
      fb.appendChild(nextBtnRow("결과 ▶",()=>{
        stage.innerHTML="";
        const card2=el('<div class="card fade"></div>');
        const res=skin && (S.aplusSuccess?skin.resultWin:skin.resultLose);
        if(res){ res.forEach(d=>{
          card2.appendChild(el('<div class="dlg" style="margin-top:12px;"><div class="portrait">'+AV(d.face)+'</div><div class="bubble"><div class="who">'+d.who+'</div>'+d.text.replace('{n}',nc)+'</div></div>'));
          if(d.clue && addClue(d.clue.id,d.clue.text))
            card2.appendChild(el('<div class="fade" style="margin:6px 0 0 60px;font-size:12.5px;color:var(--accent);">🕵️ 단서 수첩에 기록됨 — 하단 📖 책에서 언제든 다시 볼 수 있다.</div>'));
        }); }
        else card2.appendChild(el('<div class="dlg"><div class="portrait">'+AV(S.aplusSuccess?"doyun-excited":"doyun-happy")+'</div><div class="bubble"><div class="who">도윤</div>'+
          (S.aplusSuccess?"심화 "+nc+"/3… 쌤, 이 정도면 진짜 A+ 각인데요? 월요일 시험 기대하세요."
                         :"심화 "+nc+"/3… 아직 좀 어렵네요. 그래도 기본은 확실해진 것 같아요. 기본으로 승부!")+'</div></div>'));
        card2.appendChild(el('<div style="margin-top:16px;text-align:right;"><button class="btn" id="sun2">월요일 — 쪽지시험 ▶</button></div>'));
        stage.appendChild(card2);
        $("#sun2").onclick=()=>gwGo(i+1);
      }));
  }
}
/* ---- 원형 큐 조작 미션 ---- */
function gwMission(i){
  BookFab.info();
  saveCP(CH.flow[i]);
  setHUD(CH.mission.day||"목요일","조작 미션");
  const MAXQ=CH.mission.max, goal=MAXQ-1;
  let front=0, rear=0, count=0, n=0;
  const vals={};
  stage.innerHTML="";
  const card=el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">🎛 조작 미션 — 원형 큐 <span class="tag">목표: 정확히 가득('+goal+'개) 만들기</span></div>'+
    '<div class="caption">'+CH.mission.intro+'</div><div id="cqviz"></div>'+
    '<div style="display:flex;gap:10px;margin-top:10px;"><button class="btn" id="mq-enq">enqueue ▶</button><button class="btn ghost" id="mq-deq">dequeue ▶</button></div>'+
    '<div id="mq-log" class="caption" style="min-height:24px;"></div><div id="mq-done"></div></div>');
  stage.appendChild(card);
  function draw(){ $("#cqviz").innerHTML=""; $("#cqviz").appendChild(circVizEl({max:MAXQ,front,rear,vals})); }
  draw();
  $("#mq-enq").onclick=()=>{
    const nr=(rear+1)%MAXQ;
    if(nr===front){
      $("#mq-log").innerHTML='⚠ rear를 회전시키면 front와 같아진다 — <b>queue_full()</b>. 이 한 칸은 가득/텅 빔을 구별하는 신호용이라 쓸 수 없다.';
      log("mission",{ev:"full-attempt"}); return;
    }
    rear=nr; n++; vals[rear]="J"+n; count++;
    $("#mq-log").textContent="enqueue(J"+n+") — rear가 "+rear+"로 회전";
    draw(); check();
  };
  $("#mq-deq").onclick=()=>{
    if(front===rear){ $("#mq-log").innerHTML='⚠ front == rear — 공백. <b>queue_empty()</b>.'; log("mission",{ev:"empty-attempt"}); return; }
    front=(front+1)%MAXQ; delete vals[front]; count--;
    $("#mq-log").textContent="dequeue() — front가 "+front+"로 회전";
    draw(); check();
  };
  function check(){
    if(count===goal && !$("#mq-done").children.length){
      log("mission",{ev:"goal", max:MAXQ});
      $("#mq-done").appendChild(el('<div class="feedback ok fade">✅ 가득! '+MAXQ+'칸 중 <b>'+goal+'개</b> — 남은 한 칸이 front 자리(신호용)다. 여기서 enqueue를 한 번 더 눌러 보면 queue_full을 직접 볼 수 있다.'+
        '<div style="margin-top:10px;text-align:right;"><button class="btn" id="mq-next">계속 ▶</button></div></div>'));
      $("#mq-next").onclick=()=>gwGo(i+1);
    }
  }
}
/* ---- 미로 시뮬레이션 (개념 — 유도 진행) ---- */
function mazeVizEl(grid,path,cur){
  const w=el('<div class="fade" style="display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap;margin:8px 0;"></div>');
  const g=el('<div style="display:grid;grid-template-columns:repeat('+grid[0].length+',34px);gap:3px;"></div>');
  const inPath=(r,c)=>path.some(p=>p[0]===r&&p[1]===c);
  for(let r=0;r<grid.length;r++)for(let c=0;c<grid[0].length;c++){
    const wall=grid[r][c]===1;
    const isCur=cur&&cur[0]===r&&cur[1]===c;
    g.appendChild(el('<div style="width:34px;height:34px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:14px;'+
      (wall?'background:#3a4152;':'background:#1c202a;border:1px solid #2a3040;')+
      (inPath(r,c)&&!wall?'background:#24443a;':'')+'">'+(isCur?'🐕':'')+'</div>'));
  }
  w.appendChild(g);
  const st=el('<div><div style="font-size:12px;color:var(--ink-dim);margin-bottom:4px;">경로 스택 (아래→위)</div><div style="display:flex;flex-direction:column-reverse;gap:3px;"></div></div>');
  path.forEach(p=>st.children[1].appendChild(el('<div class="cell sm" style="width:64px;">('+p[0]+','+p[1]+')</div>')));
  w.appendChild(st);
  return w;
}
function gwMaze(i,si,pathIn){
  BookFab.info();
  if(si===0) saveCP(CH.flow[i]);
  setHUD(CH.mazeCfg.day||"금요일 밤","보너스 — 미로");
  const M=CH.mazeCfg;
  let path=pathIn.length?pathIn.slice():[[0,0]];
  stage.innerHTML="";
  const card=el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">🐕 보너스 — 미로와 스택 <span class="tag">교재 Special Bonus · 점수 무관</span></div></div>');
  const body=el('<div></div>'); card.appendChild(body); stage.appendChild(card);
  function show(k,path){
    if(k>=M.steps.length){
      body.appendChild(el('<div class="feedback ok fade">🏁 출구 도착! <b>스택 = 되돌아갈 길의 기억.</b> 막히면 pop — 이것이 백트래킹(backtracking)이다. (제대로 된 코드는 교재 pp.114~119)</div>'));
      body.appendChild(nextBtnRow("토요일 ▶",()=>gwGo(i+1)));
      window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});
      return;
    }
    const st=M.steps[k];
    if(st.say){ body.appendChild(el('<div class="dlg fade" style="margin-top:10px;"><div class="portrait">'+AV("me"+(st.mood?"-"+st.mood:""))+'</div><div class="bubble"><div class="who">나</div>'+st.say+'</div></div>')); }
    if(st.move){ path=path.concat([st.move]); }
    if(st.pop){ path=path.slice(0,path.length-st.pop); }
    if(st.move||st.pop||st.say){
      const viz=mazeVizEl(M.grid,path,path[path.length-1]);
      body.appendChild(viz);
    }
    if(st.predict){
      const item={...st.predict, choices:shuffle(st.predict.choices.map(c=>({...c})))};
      const qb=el('<div style="margin-top:8px;"></div>'); body.appendChild(qb);
      renderMCQ(qb,item,{unit:"maze",hintUsed:()=>false,onDone:(correct,_,fb)=>{
        log("maze_predict",{id:st.predict.id,correct});
        const nb=nextBtnRow("계속 ▶",()=>{ nb.remove(); show(k+1,path); }); /* 일회용 — 과거 버튼 재클릭 방지 */
        fb.appendChild(nb);
        window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});
      }});
      return;
    }
    const btn=el('<div style="margin-top:8px;text-align:right;"><button class="btn ghost" style="padding:6px 16px;">계속 ▼</button></div>');
    btn.querySelector("button").onclick=()=>{ btn.remove(); show(k+1,path); };
    body.appendChild(btn);
    window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});
  }
  show(si,path);
}

/* ================================================================ 챕터 0 — 오리엔테이션 ================ */
let streak0=0, attempts0=0;

/* 프롤로그용 대화 재생기 — {who,face,text,pay?} 순차 진행 */
function c0Dlg(seq,opts){
  if(opts.cp) saveCP(opts.cp);
  let idx=0;
  stage.innerHTML="";
  const card=el('<div class="card fade">'+(opts.header?'<div style="font-size:13px;color:var(--ink-dim);">'+opts.header+'</div>':'')+'<div></div></div>');
  const box=card.children[opts.header?1:0];
  stage.appendChild(card);
  function show(){
    const d=seq[idx];
    box.appendChild(el('<div class="dlg fade" style="margin-top:12px;"><div class="portrait">'+AV(d.face)+'</div><div class="bubble"><div class="who">'+d.who+'</div>'+d.text+'</div></div>'));
    if(d.pay){
      S.balance+=d.pay; saveWallet(); $("#hud-money").textContent=money(S.balance);
      if(d.pay<0) BookFab.info(); /* 낡은 책 구매 — 이 순간부터 하단 책 아이콘 등장 */
      box.appendChild(el('<div class="caption fade" style="min-height:auto;">'+(d.pay>0?'💰 +':'💸 −')+money(Math.abs(d.pay))+' → 잔고 <b>'+money(S.balance)+'</b></div>'));
    }
    const last=idx===seq.length-1;
    const btn=el('<div style="margin-top:10px;text-align:right;"><button class="btn'+(last?'':' ghost')+'" style="padding:7px 18px;">'+(last?opts.last:"계속 ▼")+'</button></div>');
    btn.querySelector("button").onclick=()=>{ btn.remove(); if(last) opts.next(); else { idx++; show(); } };
    box.appendChild(btn);
    window.scrollTo({top:document.body.scrollHeight, behavior:"smooth"});
  }
  show();
}
function c0Start(){
  setChapter(CH00); BookFab.hide();
  if(S.balance===0 && wallet.inventory.length===0){ S.balance=3240; saveWallet(); } /* 서사 시작 잔고 (신규 플레이어만) */
  $("#hud-money").textContent=money(S.balance); $("#hud-grade").textContent="백수";
  setHUD("첫째 날","프롤로그");
  log("chapter_start",{});
  c0Dlg(CH00.prologue.s1,{cp:"intro", header:"🌅 프롤로그 — 어느 고시원의 아침 <span class='tag'>▼ 버튼으로 이야기를 진행</span>", last:"편의점으로 ▶",
    next:()=>c0Dlg(CH00.prologue.s2,{header:"📌 편의점 게시판", last:"전화를 건다 ☎ ▶", next:c0Interview})});
}
function c0Interview(){
  setHUD("며칠 뒤","면접"); BookFab.hide();
  c0Dlg(CH00.prologue.interviewPre,{cp:"interview", header:"🏛 저택 응접실 — 면접", last:"…뭐라고 답하지", next:()=>{
    stage.innerHTML="";
    const card=el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">🏛 저택 응접실 — 면접</div>'+
      '<div class="dlg" style="margin-top:12px;"><div class="portrait">'+AV("me-awkward")+'</div><div class="bubble"><div class="who">나 (속마음)</div><span class="inner">사실대로? 아니면…? — 입은 이미 열리고 있다.</span></div></div>'+
      '<div id="c0ch" style="display:flex;flex-direction:column;gap:10px;align-items:flex-end;margin-top:14px;"></div></div>');
    stage.appendChild(card);
    CH00.prologue.interviewChoices.forEach((c,i)=>{
      const b=el('<button class="btn'+(i?' ghost':'')+'">'+c.label+'</button>');
      b.onclick=()=>{ log("c0_choice",{scene:"interview",pick:i});
        c0Dlg([c.line].concat(CH00.prologue.interviewPost),{header:"🏛 저택 응접실 — 면접", last:"책을 구하러 — 보수동 ▶", next:c0Bookshop}); };
      $("#c0ch").appendChild(b);
    });
  }});
}
function c0Bookshop(){
  setHUD("다음 날","보수동");
  c0Dlg(CH00.prologue.bookshop,{cp:"bookshop", header:"📚 보수동 책방골목", last:"벼락치기 시작 ▶", next:c0StudyA});
}
function c0StudyA(){ sceneStudy("A",c0StudyB); }
function c0StudyB(){ sceneStudy("B",c0StudyC); }
function c0StudyC(){ sceneStudy("C",c0StudyD); }
function c0StudyD(){ sceneStudy("D",c0TrialG5); }
function c0TrialG5(){
  saveCP("trialG5");
  setHUD("벼락치기 마지막 밤","Big-O 시련");
  const item=genG5(); attempts0++;
  log("item_shown",{unit:"G5",gen:"G5",qtype:item.qtype,params:item.params,attempt:attempts0});
  stage.innerHTML="";
  const card=el('<div class="card fade">'+streakBar(streak0,"Big-O · 문제 #"+attempts0)+'</div>');
  if(item.code){ const cb=el('<div class="codebox"></div>'); item.code.forEach(ln=>cb.appendChild(el('<div class="codeline">'+(ln===""?" ":hlC(String(ln)))+'</div>'))); card.appendChild(cb); }
  let answered=false;
  const qbox=el('<div style="margin-top:12px;"></div>'); card.appendChild(qbox); stage.appendChild(card);
  const getHint=attachBook(card,CH.hints.D,"G5",()=>answered);
  renderMCQ(qbox,item,{unit:"G5",hintUsed:getHint,onDone:(correct,hintUsed,fb)=>{
    answered=true;
    if(correct){ if(!hintUsed) streak0++; } else streak0=0;
    if(streak0>=3){ log("mastery_reached",{unit:"G5",attempts:attempts0});
      fb.appendChild(nextBtnRow("숙달 — 일주일 뒤, 시범수업 ▶",c0LessonIntro)); }
    else fb.appendChild(nextBtnRow("다음 문제 ▶",c0TrialG5));
  }});
}
function c0LessonIntro(){
  saveCP("lesson"); BookFab.hide();
  setHUD("일주일 뒤","시범수업");
  stage.innerHTML="";
  stage.appendChild(el('<div class="card fade">'+
    '<div style="font-size:13px;color:var(--ink-dim);">📖 책의 여백, 마지막 메모</div>'+
    '<div class="bookpanel" style="margin-top:12px;font-size:15px;">"이 자(尺) 하나로 앞으로 배울 모든 구조를 잰다. 배열의 접근은 왜 O(1)인가, 탐색은 왜 O(n)인가 — 전부 이 표기로 돌아온다. — 이동훈"</div>'+
    '<div class="dlg" style="margin-top:20px;"><div class="portrait">'+AV("me-proud")+'</div><div class="bubble"><div class="who">나</div><span class="inner">일주일이 지났다. 들키면 끝이다. 하지만 이번엔… 진짜로 배워왔다.</span></div></div>'+
    '<div style="margin-top:16px;text-align:right;"><button class="btn" id="go">저택으로 ▶</button></div></div>'));
  $("#go").onclick=()=>c0Lesson(0,null);
}
function c0Lesson(qi,st){
  st=st||{first:[],boss:false}; BookFab.hide();
  stage.innerHTML="";
  const q=CH00.lessonQs[qi];
  const who=q.boss?"윤 여사":"도윤", face=q.boss?"madam":"doyun";
  const shuffled=shuffle(q.choices.map(c=>({...c})));
  const card=el('<div class="card fade"><div style="font-size:13px;color:var(--ink-dim);">🏛 시범수업 — 질문 '+(qi+1)+'/'+CH00.lessonQs.length+(q.boss?' <span class="tag" style="color:var(--accent);border-color:var(--accent);">어른의 질문</span>':'')+' <span class="tag">채용 기준: 도윤 질문 첫 시도 2/3 + 어른의 질문 첫 시도 정답</span></div></div>');
  card.appendChild(el('<div class="dlg"><div class="portrait">'+AV(face)+'</div><div class="bubble"><div class="who">'+who+'</div>'+q.ask+'</div></div>'));
  const body=el('<div style="margin-top:16px;"></div>'); card.appendChild(body); stage.appendChild(card);
  let tries=0; render();
  function render(){
    body.innerHTML="";
    renderMCQ(body,{id:q.id, stem:tries===0?"뭐라고 답할까?":"다시 답해 보자.", choices:shuffled},
      {unit:"lesson", fbPrefix:'<b>'+who+'</b> — ', hintUsed:()=>false, onDone:(correct,_,fb)=>{
        tries++;
        if(correct){
          if(tries===1){ if(q.boss) st.boss=true; else st.first.push(q.id); }
          log("lesson_answer",{q:q.id, firstTry:tries===1, tries});
          fb.querySelector(".feedback").innerHTML='<b>'+who+'</b> — '+q.choices.find(c=>c.correct).fb;
          fb.appendChild(nextBtnRow(qi<CH00.lessonQs.length-1?"다음 질문 ▶":"결과 ▶",()=> qi<CH00.lessonQs.length-1?c0Lesson(qi+1,st):c0LessonResult(st)));
        }else{
          const n=el('<div style="margin-top:14px;text-align:right;"><button class="btn ghost">다시 답하기 ↺</button></div>');
          n.querySelector("button").onclick=render; fb.appendChild(n);
        }
      }});
  }
}
function c0LessonResult(st){
  const passed=st.first.length>=2&&st.boss;
  log("lesson_result",{firstTryCount:st.first.length, bossFirstTry:st.boss, passed});
  if(passed){ $("#hud-grade").textContent="채용 ✓"; c0Contract(); return; }
  stage.innerHTML="";
  stage.appendChild(el('<div class="card fade">'+
    '<div class="dlg"><div class="portrait">'+AV("madam")+'</div><div class="bubble"><div class="who">윤 여사</div>…아직 설명이 무르네요. 첫 시도 정답 '+st.first.length+'/3'+(st.boss?"":" · 어른의 질문 ✗")+' — <b>일주일 더 준비해서 다시 오시죠.</b></div></div>'+
    '<div class="dlg" style="margin-top:12px;"><div class="portrait">'+AV("doyun-worried")+'</div><div class="bubble"><div class="who">도윤</div>(작게) 쌤, 아깝다… 책 다시 보고 오세요. 저 이 쌤이랑 하고 싶단 말이에요.</div></div>'+
    '<div style="margin-top:16px;text-align:right;"><button class="btn ghost" id="restudy">책 다시 훑기 ◀</button> <button class="btn" id="retry">다시 도전 ▶</button></div></div>'));
  $("#retry").onclick=()=>c0Lesson(0,null);
  $("#restudy").onclick=c0StudyA;
}
function c0Contract(){
  setHUD("합격","계약"); BookFab.hide();
  c0Dlg(CH00.contract,{cp:"contract", header:"📜 과외 계약서 — 조항을 확인하자", last:"🛒 편의점 들르기 ▶", next:()=>sceneShop(c0Epilogue)});
}
function c0Epilogue(){
  setHUD("며칠 뒤","에필로그"); BookFab.hide();
  c0Dlg(CH00.epilogue,{cp:"epilogue", header:"🌙 에필로그", last:"오리엔테이션 클리어 — 1장 시작 ▶", next:c0Finish});
}
function c0Finish(){
  localStorage.setItem(CH0DONEKEY,"1");
  log("chapter_clear",{});
  Log.flush();
  setChapter(CH01);
  setHUD("월요일","유닛 A");
  log("chapter_start",{});
  sceneIntro();
}
const CPMAP0={
  "intro":()=>c0Start(), "interview":()=>c0Interview(), "bookshop":()=>c0Bookshop(),
  "study-A":()=>c0StudyA(), "study-B":()=>c0StudyB(), "study-C":()=>c0StudyC(), "study-D":()=>c0StudyD(),
  "trialG5":()=>c0TrialG5(), "lesson":()=>c0LessonIntro(), "contract":()=>c0Contract(), "epilogue":()=>c0Epilogue()
};
const CPLABEL0={
  "intro":"0장 · 프롤로그", "interview":"0장 · 면접", "bookshop":"0장 · 보수동 책방골목",
  "study-A":"0장 · 유닛 A 왜 배우나", "study-B":"0장 · 유닛 B 알고리즘의 뜻", "study-C":"0장 · 유닛 C 전체 지도", "study-D":"0장 · 유닛 D Big-O",
  "trialG5":"0장 · Big-O 시련", "lesson":"0장 · 시범수업", "contract":"0장 · 계약", "epilogue":"0장 · 에필로그"
};

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
const CHBYID={ ch01:CH01, ch02:(typeof CH02!=="undefined")?CH02:null, ch03:(typeof CH03!=="undefined")?CH03:null, ch04:(typeof CH04!=="undefined")?CH04:null, ch05:(typeof CH05!=="undefined")?CH05:null, ch06:(typeof CH06!=="undefined")?CH06:null, ch07:(typeof CH07!=="undefined")?CH07:null, ch08:(typeof CH08!=="undefined")?CH08:null, ch09:(typeof CH09!=="undefined")?CH09:null, ch10:(typeof CH10!=="undefined")?CH10:null, ch11:(typeof CH11!=="undefined")?CH11:null, ch12:(typeof CH12!=="undefined")?CH12:null, ch13:(typeof CH13!=="undefined")?CH13:null };
function cpLabel(sv){
  if(sv.ch==="chM"&&typeof CHM!=="undefined") return (CHM.cpl&&CHM.cpl[sv.cp])||"※ 중간고사 · 이어서";
  if(sv.ch==="chF"&&typeof CHF!=="undefined") return (CHF.cpl&&CHF.cpl[sv.cp])||"※ 기말고사 · 이어서";
  const fc=sv.ch&&CHBYID[sv.ch]&&CHBYID[sv.ch].flow?CHBYID[sv.ch]:null;
  if(fc) return (fc.cpl&&fc.cpl[sv.cp])||(chNum(fc)+" · 이어서");
  return ((sv.ch==="ch00"?CPLABEL0:CPLABEL)[sv.cp])||"이어서 하기";
}
function resumeFrom(sv){
  const s=sv.S||{};
  S.tutorFirstTry=s.tutorFirstTry||0; S.tutorPassed=!!s.tutorPassed; S.aplusAccepted=!!s.aplusAccepted; S.aplusSuccess=!!s.aplusSuccess; S.retake=!!s.retake;
  const st=sv.streaks||{};
  streakA=st.A||0; streakB=st.B||0; streakC=st.C||0; streakD=st.D||0; streakE=st.E||0; streak0=st.G5||0;
  tracesB=sv.tracesB||0; runsD=sv.runsD||0;
  if(sv.ch==="ch00"){ setChapter(CH00); (CPMAP0[sv.cp]||sceneTitle)(); return; }
  if(sv.ch==="chM"&&typeof CHM!=="undefined"){ setChapter(CHM); exResume(sv); return; }
  if(sv.ch==="chF"&&typeof CHF!=="undefined"){ setChapter(CHF); exResume(sv); return; }
  const fc=sv.ch&&CHBYID[sv.ch]&&CHBYID[sv.ch].flow?CHBYID[sv.ch]:null;
  if(fc){
    setChapter(fc);
    if(sv.gwSave){ GW={streaks:sv.gwSave.streaks||{}, attempts:sv.gwSave.attempts||{},
      poolLeft:(fc.pool||[]).filter(p=>(sv.gwSave.poolIds||[]).includes(p.id))}; }
    else gwInit();
    if(sv.cp==="intro"){ sceneIntro(); return; }
    if(sv.cp==="sunday"){ sceneSundayIntro(); return; }
    if(sv.cp==="saturday"){ gwSaturday(fc.flow.indexOf("saturday")); return; }
    const idx=fc.flow.indexOf(sv.cp);
    if(idx>=0){ gwGo(idx); return; }
    sceneTitle(); return;
  }
  setChapter(CH01); (CPMAP[sv.cp]||sceneTitle)();
}
function sceneTitle(){
  setChapter(CH01); /* 타이틀 기본 컨텍스트 — 이어하기 시 resumeFrom이 재설정 */
  BookFab.hide();
  setHUD("월요일","유닛 A"); $("#hud-grade").textContent="—"; $("#hud-money").textContent=money(S.balance);
  const sv=saveData;
  stage.innerHTML="";
  stage.appendChild(el('<div class="card fade" style="text-align:center; padding:48px 22px;">'+
    '<h1 style="margin:14px 0 10px; font-size:24px; line-height:1.45;">컴퓨터를 모르는 백수,<br>부잣집 과외교사가 되다</h1>'+
    '<p style="color:var(--accent); letter-spacing:4px; margin-bottom:30px; font-size:15px;">- 자료구조 편 -</p>'+
    (sv? '<button class="btn" id="resume">▶ 이어서 하기 — '+cpLabel(sv)+'</button>' : '')+
    '<div style="margin:'+(sv?'20px':'0')+' 0 8px; font-size:12px; color:var(--ink-dim); letter-spacing:3px;">— 챕터 선택 —</div>'+
    '<div id="chlist" style="display:flex; flex-direction:column; gap:9px; align-items:center;"></div>'+
    (S.balance>0||wallet.inventory.length?'<div style="margin-top:14px;"><button class="btn ghost" id="shop0">🛒 상점 · 가방</button></div>':"")+
    '<div style="margin-top:22px;"><button class="btn ghost" id="codebtn" style="font-size:12px;padding:5px 14px;color:#59606e;border-color:#2a3040;">📋 진도 코드 — 다른 컴퓨터로 이어가기</button> '+
    '<button class="btn ghost" id="reset0" style="font-size:12px;padding:5px 14px;color:#59606e;border-color:#2a3040;">🗑 기록 초기화</button></div>'+
    '<div id="codebox2" style="text-align:left;"></div><div id="resetbox"></div></div>'));
  const rs=$("#resume"); if(rs) rs.onclick=()=>{ log("resume",{cp:sv.cp,ch:sv.ch}); resumeFrom(sv); };
  /* 챕터 목록 — 누구든 어느 챕터든 처음부터 시작 가능. 챕터 추가 시 여기에 한 줄. */
  const c0done=localStorage.getItem(CH0DONEKEY)==="1";
  const clearTag=id=>wallet.cleared&&wallet.cleared[id]?' <span class="tag" style="color:var(--accent2);border-color:var(--accent2);">클리어 ✓</span>':'';
  const chLabel=C=>chNum(C)+' · '+C.meta.title+clearTag(C.meta.id); /* 메뉴는 장 번호+제목만 — 부제는 군더더기(감수) */
  const CH_MENU=[
    {id:"ch00", label:'0장 · 오리엔테이션'+(c0done?' <span class="tag" style="color:var(--accent2);border-color:var(--accent2);">클리어 ✓</span>':''), go:()=>c0Start()},
    {id:"ch01", label:chLabel(CH01), go:()=>{ setChapter(CH01); log("chapter_start",{}); sceneIntro(); }}
  ];
  if(typeof CH02!=="undefined") CH_MENU.push({id:"ch02", label:chLabel(CH02), go:()=>{ setChapter(CH02); gwInit(); log("chapter_start",{}); sceneIntro(); }});
  if(typeof CH03!=="undefined") CH_MENU.push({id:"ch03", label:chLabel(CH03), go:()=>{ setChapter(CH03); gwInit(); log("chapter_start",{}); sceneIntro(); }});
  if(typeof CH04!=="undefined") CH_MENU.push({id:"ch04", label:chLabel(CH04), go:()=>{ setChapter(CH04); gwInit(); log("chapter_start",{}); sceneIntro(); }});
  if(typeof CH05!=="undefined") CH_MENU.push({id:"ch05", label:chLabel(CH05), go:()=>{ setChapter(CH05); gwInit(); log("chapter_start",{}); sceneIntro(); }});
  if(typeof CH06!=="undefined") CH_MENU.push({id:"ch06", label:chLabel(CH06), go:()=>{ setChapter(CH06); gwInit(); log("chapter_start",{}); sceneIntro(); }});
  /* 시험 챕터 — 장 번호 없음(※), 4장(B)와 4장(C) 사이. 스타일도 관문답게 구분 */
  if(typeof CHM!=="undefined") CH_MENU.push({id:"chM", exam:true,
    label:CHM.meta.special+' '+CHM.meta.title+(wallet.examBest&&wallet.examBest.chM!==undefined?' <span class="tag" style="color:var(--accent2);border-color:var(--accent2);">'+(wallet.cleared&&wallet.cleared.chM?'클리어 ✓ · ':'')+'최고 '+wallet.examBest.chM+'점</span>':''),
    go:()=>{ setChapter(CHM); log("chapter_start",{}); exStart(); }});
  if(typeof CH07!=="undefined") CH_MENU.push({id:"ch07", label:chLabel(CH07), go:()=>{ setChapter(CH07); gwInit(); log("chapter_start",{}); sceneIntro(); }});
  if(typeof CH08!=="undefined") CH_MENU.push({id:"ch08", label:chLabel(CH08), go:()=>{ setChapter(CH08); gwInit(); log("chapter_start",{}); sceneIntro(); }});
  if(typeof CH09!=="undefined") CH_MENU.push({id:"ch09", label:chLabel(CH09), go:()=>{ setChapter(CH09); gwInit(); log("chapter_start",{}); sceneIntro(); }});
  if(typeof CH10!=="undefined") CH_MENU.push({id:"ch10", label:chLabel(CH10), go:()=>{ setChapter(CH10); gwInit(); log("chapter_start",{}); sceneIntro(); }});
  if(typeof CH11!=="undefined") CH_MENU.push({id:"ch11", label:chLabel(CH11), go:()=>{ setChapter(CH11); gwInit(); log("chapter_start",{}); sceneIntro(); }});
  if(typeof CH12!=="undefined") CH_MENU.push({id:"ch12", label:chLabel(CH12), go:()=>{ setChapter(CH12); gwInit(); log("chapter_start",{}); sceneIntro(); }});
  if(typeof CH13!=="undefined") CH_MENU.push({id:"ch13", label:chLabel(CH13), go:()=>{ setChapter(CH13); gwInit(); log("chapter_start",{}); sceneIntro(); }});
  /* 기말고사 — 마지막 관문 (※, 7장 뒤) */
  if(typeof CHF!=="undefined") CH_MENU.push({id:"chF", exam:true,
    label:CHF.meta.special+' '+CHF.meta.title+(wallet.examBest&&wallet.examBest.chF!==undefined?' <span class="tag" style="color:var(--accent2);border-color:var(--accent2);">'+(wallet.cleared&&wallet.cleared.chF?'클리어 ✓ · ':'')+'최고 '+wallet.examBest.chF+'점</span>':''),
    go:()=>{ setChapter(CHF); log("chapter_start",{}); exStart(); }});
  const rec = sv ? null : (c0done ? "ch01" : "ch00"); /* 이어하기가 없을 때만 추천 챕터 강조 */
  const chl=$("#chlist");
  CH_MENU.forEach(c=>{
    const b=el('<button class="btn'+(c.id===rec?'':' ghost')+'" style="width:min(470px,92vw);box-sizing:border-box;'+(c.exam?'border-color:var(--accent);color:var(--accent);':'')+'">'+(c.id===rec?'▶ ':'')+c.label+'</button>');
    b.onclick=()=>{ clearSave(); c.go(); }; /* 새 챕터 시작 = 이어하기 진행은 초기화 (잔고·가방은 유지) */
    chl.appendChild(b);
  });
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
      ["dsgame_wallet","dsgame_logs","dsgame_sent_upto","dsgame_token","dsgame_save","dsgame_ch0done"].forEach(k=>localStorage.removeItem(k));
      location.reload();
    };
  };
}
function sceneIntro(idx=0){
  if(!idx) saveCP("intro");
  stage.innerHTML="";
  const intro=CH.intro.filter(d=>evalCond(d.cond));
  const box=el('<div class="fade"></div>');
  for(let k=0;k<=idx;k++){
    const d=intro[k];
    box.appendChild(el('<div class="dlg"><div class="portrait">'+AV(d.face)+'</div><div class="bubble"><div class="who">'+d.who+'</div>'+d.text+'</div></div>'));
  }
  const btn=el('<div style="margin-top:18px; text-align:right;"><button class="btn">▶ '+(idx<intro.length-1?"계속":"월요일 밤 — 자습 시작")+'</button></div>');
  btn.querySelector("button").onclick=()=> idx<intro.length-1 ? sceneIntro(idx+1) : (CH.flow ? gwStart() : sceneStudy("A",sceneTrialA));
  box.appendChild(btn); stage.appendChild(box);
}
/* ============ 홈 버튼 — 어느 화면에서든 타이틀 메뉴로 ============ */
(function(){
  const hb=$("#hud-home"); if(!hb) return;
  hb.onclick=()=>{
    const old=$("#homepanel"); if(old){ old.remove(); return; }
    const p=el('<div id="homepanel" class="card fade" style="position:fixed;top:54px;right:14px;z-index:99;max-width:300px;box-shadow:0 8px 30px rgba(0,0,0,.5);">🏠 <b>타이틀 메뉴로 돌아갈까?</b><br><span style="color:var(--ink-dim);font-size:12.5px;">진행은 마지막 저장 지점부터 이어서 할 수 있다.</span>'+
      '<div style="margin-top:10px;text-align:right;"><button class="btn ghost" id="homeNo">취소</button> <button class="btn" id="homeYes">돌아가기</button></div></div>');
    document.body.appendChild(p);
    $("#homeNo").onclick=()=>p.remove();
    $("#homeYes").onclick=()=>{ p.remove(); log("home_menu",{}); sceneTitle(); };
  };
})();
sceneTitle();
