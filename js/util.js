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
