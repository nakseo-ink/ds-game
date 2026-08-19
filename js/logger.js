"use strict";
/* 로그 모듈 — 스펙 6절 + 7-1절
   - 모든 이벤트를 localStorage 큐에 기록 (오프라인에서도 유실 없음)
   - CONFIG에 Supabase가 설정되어 있으면 30초마다/이탈 시 배치 전송
   - 전송 실패 시 큐 유지, 다음 기회에 재전송 (로그가 게임을 볼모로 잡지 않는다) */
const Log = (function(){
  const KEY="dsgame_logs", SENTKEY="dsgame_sent_upto", TOKKEY="dsgame_token";
  const logs = JSON.parse(localStorage.getItem(KEY) || "[]");
  let student = localStorage.getItem(TOKKEY);
  if(!student){
    student = "st_" + Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4);
    localStorage.setItem(TOKKEY, student);
  }
  function log(event, payload){
    logs.push({ts:Date.now(), student, chapter:"ch01", event, ...payload});
    localStorage.setItem(KEY, JSON.stringify(logs));
    const cnt=document.getElementById("logcount"); if(cnt) cnt.textContent=logs.length;
  }
  let flushing=false;
  async function flush(){
    if(flushing || !CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) return;
    const sent = +(localStorage.getItem(SENTKEY) || 0);
    const batch = logs.slice(sent);
    if(!batch.length) return;
    flushing=true;
    try{
      const res = await fetch(CONFIG.SUPABASE_URL + "/rest/v1/" + CONFIG.LOG_TABLE, {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "apikey":CONFIG.SUPABASE_ANON_KEY,
          "Authorization":"Bearer " + CONFIG.SUPABASE_ANON_KEY,
          "Prefer":"return=minimal"
        },
        body: JSON.stringify(batch.map(l => ({
          student: l.student, chapter: l.chapter, event: l.event,
          ts: new Date(l.ts).toISOString(), payload: l
        })))
      });
      if(res.ok) localStorage.setItem(SENTKEY, String(logs.length));
    }catch(e){ /* 오프라인/장애 — 큐 유지, 재시도 */ }
    flushing=false;
  }
  setInterval(flush, CONFIG.FLUSH_INTERVAL_MS);
  window.addEventListener("beforeunload", flush);
  document.addEventListener("visibilitychange", ()=>{ if(document.hidden) flush(); });
  return { log, flush, all:()=>logs, count:()=>logs.length, student };
})();
const log = (e,p)=>Log.log(e,p);
