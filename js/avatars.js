"use strict";
/* 캐릭터 아바타 (SVG) — AV("doyun"), AV("me-proud"), AV("madam") ...
   key = "인물[-표정]" · 알 수 없는 key는 그대로 출력(이모지 폴백) */
function AV(key){
  const parts=String(key).split("-");
  const who=parts[0], mood=parts[1]||"normal";
  const SKIN="#eec39a", DARK="#2b2620";
  const CHAR={
    doyun:{hair:"#23272e", shirt:"#5aa98c", faceRy:9.6, faceCy:30},
    me:{hair:"#7a5c40", shirt:"#828a99", faceRy:10.2, faceCy:29.4},
    madam:{hair:"#3a3340", shirt:"#a07ba8", faceRy:9.8, faceCy:30}
  }[who];
  if(!CHAR) return key; // 폴백: 이모지 등 그대로
  let s='<svg viewBox="0 0 64 64" width="46" height="46" aria-hidden="true">';
  // 어깨/옷
  s+='<path d="M12 64 Q13 45 32 45 Q51 45 52 64 Z" fill="'+CHAR.shirt+'"/>';
  if(who==="me") s+='<path d="M26 46 L32 54 L38 46 Z" fill="#6d7480"/>'; // 후줄근한 티 목선
  if(who==="doyun") s+='<path d="M22 47 q10 7 20 0 l0 5 q-10 6 -20 0 Z" fill="#4b8f76"/>'; // 후드 라인
  if(who==="madam") s+='<circle cx="32" cy="49" r="1.6" fill="#e8d9a0"/><circle cx="27" cy="48" r="1.3" fill="#e8d9a0"/><circle cx="37" cy="48" r="1.3" fill="#e8d9a0"/>'; // 목걸이
  // 머리(헬멧) + 얼굴
  s+='<circle cx="32" cy="26" r="13.5" fill="'+CHAR.hair+'"/>';
  if(who==="madam") s+='<circle cx="32" cy="11" r="5" fill="'+CHAR.hair+'"/>'; // 올림머리
  if(who==="me") s+='<path d="M20 17 l3 -5 2 5 M28 14 l2.5 -5 2.5 5 M37 15 l3 -5 2 5" stroke="'+CHAR.hair+'" stroke-width="3" fill="none" stroke-linecap="round"/>'; // 부스스
  s+='<ellipse cx="32" cy="'+CHAR.faceCy+'" rx="10.6" ry="'+CHAR.faceRy+'" fill="'+SKIN+'"/>';
  if(who==="madam") s+='<circle cx="21.5" cy="32" r="1.5" fill="#e8c96a"/>'; // 귀걸이
  if(who==="me") s+='<circle cx="28" cy="37.5" r=".7" fill="#b08c60"/><circle cx="32" cy="38.6" r=".7" fill="#b08c60"/><circle cx="36" cy="37.5" r=".7" fill="#b08c60"/>'; // 수염 자국
  // 표정
  const L=27.4, R=36.6, EY=29, MY=35;
  const star=(cx,cy)=>'<path d="M'+cx+' '+(cy-2.6)+' L'+(cx+0.8)+' '+(cy-0.8)+' L'+(cx+2.6)+' '+cy+' L'+(cx+0.8)+' '+(cy+0.8)+' L'+cx+' '+(cy+2.6)+' L'+(cx-0.8)+' '+(cy+0.8)+' L'+(cx-2.6)+' '+cy+' L'+(cx-0.8)+' '+(cy-0.8)+' Z" fill="#e8b13f"/>';
  const dotEyes='<circle cx="'+L+'" cy="'+EY+'" r="1.7" fill="'+DARK+'"/><circle cx="'+R+'" cy="'+EY+'" r="1.7" fill="'+DARK+'"/>';
  const closedHappy='<path d="M'+(L-2.4)+' '+(EY+0.6)+' q2.4 -2.6 4.8 0 M'+(R-2.4)+' '+(EY+0.6)+' q2.4 -2.6 4.8 0" stroke="'+DARK+'" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
  const smile='<path d="M28.4 '+(MY-0.6)+' q3.6 2.8 7.2 0" stroke="'+DARK+'" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
  const bigSmile='<path d="M27.5 '+(MY-1.2)+' q4.5 5.4 9 0 Z" fill="'+DARK+'"/><path d="M29.5 '+(MY+1.2)+' q2.5 1.8 5 0 l0 -0.6 q-2.5 1.2 -5 0 Z" fill="#d9776f"/>';
  const flat='<path d="M29 '+MY+' L35 '+MY+'" stroke="'+DARK+'" stroke-width="1.5" stroke-linecap="round"/>';
  const frown='<path d="M28.6 '+(MY+1)+' q3.4 -2.6 6.8 0" stroke="'+DARK+'" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
  const oMouth='<ellipse cx="32" cy="'+(MY-0.2)+'" rx="2.2" ry="2.8" fill="'+DARK+'"/>';
  const sweat='<path d="M45.5 22 q3.2 4.6 0 6.6 q-3.2 -2 0 -6.6" fill="#7fb7e6"/>';
  const blush='<ellipse cx="25" cy="33" rx="2" ry="1.1" fill="#e59a8e" opacity=".7"/><ellipse cx="39" cy="33" rx="2" ry="1.1" fill="#e59a8e" opacity=".7"/>';
  const browsWorried='<path d="M'+(L-2)+' '+(EY-3.4)+' l4 -1.2 M'+(R+2)+' '+(EY-3.4)+' l-4 -1.2" stroke="'+DARK+'" stroke-width="1.3" stroke-linecap="round"/>';
  switch(mood){
    case "awkward": s+=dotEyes+flat+sweat+blush; break;
    case "proud":   s+=closedHappy+smile; break;
    case "shock":   s+='<circle cx="'+L+'" cy="'+EY+'" r="3" fill="#fff"/><circle cx="'+R+'" cy="'+EY+'" r="3" fill="#fff"/><circle cx="'+L+'" cy="'+EY+'" r="1.3" fill="'+DARK+'"/><circle cx="'+R+'" cy="'+EY+'" r="1.3" fill="'+DARK+'"/>'+oMouth+blush; break;
    case "worried": s+=dotEyes+browsWorried+frown+sweat; break;
    case "excited": s+=star(L,EY)+star(R,EY)+bigSmile; break;
    case "happy":   s+=closedHappy+bigSmile; break;
    default:        s+=dotEyes+smile;
  }
  s+='</svg>';
  return s;
}
