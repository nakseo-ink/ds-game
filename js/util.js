"use strict";
/* 공용 유틸 — 모든 모듈보다 먼저 로드 */
const $=s=>document.querySelector(s);
function el(html){const d=document.createElement("div");d.innerHTML=html;return d.firstElementChild;}
function fmtHex(n){return "0x"+n.toString(16).toUpperCase();}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function money(n){return "₩"+n.toLocaleString("ko-KR");}
function fmtTerm(c,e){
  let cs=(c===1&&e>0)?"":(c===-1&&e>0)?"-":String(c);
  if(e===0) return String(c);
  return cs+"x"+(e>1?"<sup>"+e+"</sup>":"");
}

/* C 구문 강조 — 외부 의존성 없음 (file:// 로컬에서도 동작) */
function hlC(src){
  const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const re=/(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b0x[0-9A-Fa-f]+\b|\b\d+(?:\.\d+)?\b)|(\b(?:void|int|char|float|double|long|short|unsigned|signed)\b)|(\b(?:if|else|for|while|do|switch|case|break|continue|return|typedef|struct|union|enum|sizeof|const|static)\b|\bNULL\b|#\w+)/g;
  let out="", last=0, m;
  while((m=re.exec(src))){
    out+=esc(src.slice(last,m.index));
    const t=esc(m[0]);
    if(m[1]) out+='<span class="c-com">'+t+"</span>";
    else if(m[2]) out+='<span class="c-str">'+t+"</span>";
    else if(m[3]) out+='<span class="c-num">'+t+"</span>";
    else if(m[4]) out+='<span class="c-typ">'+t+"</span>";
    else out+='<span class="c-kw">'+t+"</span>";
    last=m.index+m[0].length;
  }
  return out+esc(src.slice(last));
}
function paintCode(root){ root.querySelectorAll(".codeline").forEach(e=>{ e.innerHTML=hlC(e.textContent)||" "; }); }
