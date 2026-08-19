# 포인터 과외 (가제) — 자료구조 게임 v0.4

과외 서사 기반 인터랙티브 자료구조 튜토리얼. 완성학습(mastery) 루프 + 생성형 문항 + 오개념 태그 로깅.
설계 문서: `D:\ds-game\40-엔진\스펙-v1-상호작용.md` · 시나리오: `30-콘텐츠\챕터01-수직시나리오.md`

## 실행

- 로컬: `index.html` 더블클릭 (빌드·서버 불필요)
- 배포: `docs/GitHubPages-배포가이드.md`
- 로그 수집: `docs/Supabase-설정가이드.md` → `js/config.js`에 키 입력

## 구조 (엔진 고정 + 챕터 = 데이터)

```
index.html            셸 (HUD + 스크립트 로드)
css/style.css         스타일
js/util.js            공용 유틸
js/config.js          ★ 배포 설정 (Supabase 키) — 유일하게 수정하는 파일
js/logger.js          로그 큐 + Supabase 배치 전송 (미설정 시 로컬만)
js/generators.js      생성기 G1(주소) G2(트레이스) G3(padd) G4(transpose) + A+ 심화
js/engine.js          씬 러너 + 위젯 5종 (W1 메모리띠 · W2 단계실행 · W3 링크조작 · W4 문답 · W5 HUD)
data/ch01.data.js     챕터 1 콘텐츠 (대사·공부 단계·힌트·과외 문답·저작 문항·산식)
```

챕터 추가 = `data/chXX.data.js` 작성 (JSON 형식의 JS 파일 — file:// 로컬 실행 호환을 위해 .js 사용).
학기 중 기능 프리즈: `js/`는 수정 금지, `data/`만 추가.

## 로그 이벤트 (스펙 6절)

`chapter_start · study_step · item_shown(생성 파라미터 포함) · answer(mc 오개념 태그·소요시간·힌트 여부) · hint_open · mastery_reached · link_check · tutoring_start/answer/result · aplus_choice/result · quiz_score`

학생 식별은 기기별 익명 토큰. 수업 초 데이터 수집 고지 필요.
