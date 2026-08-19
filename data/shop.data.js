"use strict";
/* 상점 데이터 — 챕터 클리어 보상 소비처. 나중에 서버 저장으로 승격 시 이 구조 그대로 이전.
   once:true = 한 번만 구매(기기·티켓), 없으면 반복 구매 가능(간식) */
const SHOP = {
  title: "동네 상점",
  items: [
    { id:"gimbap", name:"삼각김밥", price:1500, tier:"간식",
      desc:"자습의 밤을 버티게 해 주는 참치마요.",
      svg:'<svg viewBox="0 0 64 64"><path d="M32 10 L56 50 L8 50 Z" fill="#f5f0e6" stroke="#d8cfba" stroke-width="2"/><rect x="24" y="34" width="16" height="16" fill="#2b2f36"/><path d="M32 22 q3 4 0 8 q-3 -4 0 -8" fill="#e8956d"/></svg>' },
    { id:"americano", name:"아이스 아메리카노", price:4500, tier:"간식",
      desc:"얼죽아. 밤샘 공부의 연료.",
      svg:'<svg viewBox="0 0 64 64"><path d="M18 14 L46 14 L42 54 L22 54 Z" fill="#c9e4f2" opacity=".5" stroke="#9cc4d8" stroke-width="2"/><path d="M20 26 L44 26 L41 54 L23 54 Z" fill="#6b4a2f"/><rect x="24" y="30" width="7" height="7" rx="1.5" fill="#e9f4f9" opacity=".85" transform="rotate(12 27 33)"/><rect x="33" y="38" width="7" height="7" rx="1.5" fill="#e9f4f9" opacity=".85" transform="rotate(-9 36 41)"/><rect x="36" y="4" width="4" height="26" rx="2" fill="#7ec8a9" transform="rotate(9 38 17)"/></svg>' },
    { id:"burger", name:"신상 더블버거 세트", price:9900, tier:"간식",
      desc:"편의점 매대를 점령한 그 신상. 두 장은 진리다.",
      svg:'<svg viewBox="0 0 64 64"><path d="M12 28 q20 -18 40 0 l0 4 L12 32 Z" fill="#e8b13f"/><circle cx="26" cy="20" r="1.2" fill="#fff" opacity=".8"/><circle cx="34" cy="17" r="1.2" fill="#fff" opacity=".8"/><circle cx="41" cy="21" r="1.2" fill="#fff" opacity=".8"/><path d="M10 32 q6 6 12 0 q6 6 12 0 q6 6 12 0 q6 6 8 0 l0 4 L10 36 Z" fill="#8fbf5a"/><rect x="11" y="37" width="42" height="6" rx="3" fill="#8a4b2e"/><rect x="11" y="44" width="42" height="5" rx="2.5" fill="#8a4b2e"/><path d="M12 50 L52 50 q0 8 -20 8 q-20 0 -20 -8 Z" fill="#e8b13f"/></svg>' },
    { id:"malatang", name:"마라탕 한 그릇", price:12000, tier:"간식",
      desc:"맵기 2단계. 스트레스가 녹는다.",
      svg:'<svg viewBox="0 0 64 64"><path d="M20 14 q2 6 -2 9 M32 10 q2 6 -2 9 M44 14 q2 6 -2 9" stroke="#9aa0ad" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/><path d="M8 30 L56 30 q0 22 -24 22 q-24 0 -24 -22 Z" fill="#c94f3d"/><path d="M12 30 q10 -6 20 0 q10 -6 20 0" stroke="#e8956d" stroke-width="4" fill="none"/><circle cx="24" cy="27" r="2.4" fill="#8fbf5a"/><circle cx="38" cy="26" r="2.4" fill="#f2d16b"/></svg>' },
    { id:"chicken", name:"치킨 한 마리", price:23000, tier:"간식",
      desc:"도윤이가 그렇게 자랑하던 그 치킨. 이제 내 차례다.",
      svg:'<svg viewBox="0 0 64 64"><path d="M14 22 L50 22 L46 56 L18 56 Z" fill="#d94f4f"/><path d="M14 22 L50 22 L49 30 L15 30 Z" fill="#b83e3e"/><ellipse cx="32" cy="16" rx="12" ry="8" fill="#e8a13f"/><ellipse cx="32" cy="14" rx="9" ry="6" fill="#f2b95a"/><circle cx="46" cy="10" r="4" fill="#f5f0e6"/><rect x="44.6" y="12" width="2.8" height="8" rx="1.4" fill="#f5f0e6"/></svg>' },
    { id:"earbuds", name:"무선 이어폰", price:89000, tier:"플렉스",
      desc:"통학 지하철이 콘서트홀이 된다.",
      svg:'<svg viewBox="0 0 64 64"><path d="M12 26 a20 20 0 0 1 40 0 l0 14 a8 8 0 0 1 -16 0 l0 -10 L52 30" fill="none"/><rect x="12" y="24" width="40" height="26" rx="13" fill="#e8e6df"/><rect x="12" y="24" width="40" height="10" rx="5" fill="#d3d0c6"/><circle cx="24" cy="42" r="5" fill="#fff"/><circle cx="40" cy="42" r="5" fill="#fff"/><circle cx="24" cy="42" r="2" fill="#7ec8a9"/><circle cx="40" cy="42" r="2" fill="#7ec8a9"/></svg>' },
    { id:"ticket", name:"콘서트 티켓", price:150000, tier:"플렉스",
      desc:"최애의 컴백 무대. 티켓팅은 이미 성공한 셈 치자.",
      svg:'<svg viewBox="0 0 64 64"><path d="M8 20 L56 20 L56 30 a4 4 0 0 0 0 8 L56 46 L8 46 L8 38 a4 4 0 0 0 0 -8 Z" fill="#b48ead"/><path d="M40 20 L40 46" stroke="#8f6f8f" stroke-width="2" stroke-dasharray="3 3"/><path d="M24 28 l2.2 4.4 4.8 .7 -3.5 3.4 .8 4.8 -4.3 -2.3 -4.3 2.3 .8 -4.8 -3.5 -3.4 4.8 -.7 Z" fill="#f2d16b"/><rect x="45" y="26" width="7" height="3" rx="1.5" fill="#e8e6df" opacity=".8"/><rect x="45" y="32" width="7" height="3" rx="1.5" fill="#e8e6df" opacity=".8"/><rect x="45" y="38" width="7" height="3" rx="1.5" fill="#e8e6df" opacity=".8"/></svg>' },
    { id:"keyboard", name:"기계식 키보드", price:129000, tier:"플렉스", once:true,
      desc:"타건감이 다르면 코딩도 다르다. 도각도각.",
      svg:'<svg viewBox="0 0 64 64"><rect x="6" y="20" width="52" height="24" rx="4" fill="#2f3648"/><rect x="6" y="44" width="52" height="4" rx="2" fill="#7ec8a9"/>'+
        [0,1,2,3,4,5,6].map(i=>'<rect x="'+(10+i*7)+'" y="24" width="5" height="5" rx="1" fill="#9aa0ad"/>').join("")+
        [0,1,2,3,4,5,6].map(i=>'<rect x="'+(10+i*7)+'" y="31" width="5" height="5" rx="1" fill="#9aa0ad"/>').join("")+
        '<rect x="17" y="38" width="30" height="4" rx="1.5" fill="#9aa0ad"/></svg>' },
    { id:"console", name:"휴대용 게임기", price:390000, tier:"저축 목표", once:true,
      desc:"자료구조 A+ 받고 당당하게 산다. 그게 어른이다.",
      svg:'<svg viewBox="0 0 64 64"><rect x="4" y="18" width="56" height="28" rx="6" fill="#2b2f36"/><rect x="16" y="22" width="32" height="20" rx="2" fill="#7ec8a9"/><path d="M22 34 l5 -6 5 6 Z" fill="#2b2f36" opacity=".5"/><circle cx="40" cy="33" r="3.5" fill="#f4b860" opacity=".8"/><rect x="7" y="27" width="6" height="2.6" rx="1.3" fill="#9aa0ad"/><rect x="8.7" y="25.3" width="2.6" height="6" rx="1.3" fill="#9aa0ad"/><circle cx="55" cy="27" r="2" fill="#e07a6a"/><circle cx="51" cy="32" r="2" fill="#f2d16b"/></svg>' },
    { id:"phone", name:"최신 폰", price:1350000, tier:"저축 목표", once:true,
      desc:"올해의 그 폰. 카메라가 하나 더 늘었다.",
      svg:'<svg viewBox="0 0 64 64"><rect x="18" y="6" width="28" height="52" rx="6" fill="#2b2f36"/><rect x="20.5" y="8.5" width="23" height="47" rx="4" fill="#4a5a7a"/><path d="M20.5 40 L43.5 22 L43.5 55.5 L20.5 55.5 Z" fill="#7ec8a9" opacity=".35"/><rect x="24" y="12" width="9" height="9" rx="3" fill="#2b2f36"/><circle cx="27" cy="15" r="1.6" fill="#9cc4d8"/><circle cx="30.5" cy="18.5" r="1.6" fill="#9cc4d8"/></svg>' },
    { id:"laptop", name:"게이밍 노트북", price:2400000, tier:"저축 목표", once:true,
      desc:"과외로 모은 돈의 최종 목적지. 이걸로 다음 학기 과제도 씹어먹는다.",
      svg:'<svg viewBox="0 0 64 64"><path d="M12 12 L52 12 L52 38 L12 38 Z" fill="#2b2f36"/><path d="M14.5 14.5 L49.5 14.5 L49.5 35.5 L14.5 35.5 Z" fill="#4a5a7a"/><path d="M14.5 30 L30 18 L38 26 L49.5 16 L49.5 35.5 L14.5 35.5 Z" fill="#7ec8a9" opacity=".4"/><path d="M8 40 L56 40 L60 48 q0 2 -2 2 L6 50 q-2 0 -2 -2 Z" fill="#3a4152"/><rect x="26" y="42" width="12" height="4" rx="2" fill="#9aa0ad"/></svg>' }
  ]
};
