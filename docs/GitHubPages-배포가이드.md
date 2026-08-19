# GitHub Pages 배포 가이드

이 폴더(`40-엔진/게임/`)는 정적 파일뿐이라 빌드 과정 없이 그대로 올리면 됩니다. 소요 시간 약 15분(최초 1회), 이후 업데이트는 커밋+푸시만.

## 1. 저장소 만들기 (최초 1회)

1. https://github.com 가입/로그인 → "New repository"
2. 이름 예: `ds-game` · **Private 불가** — Pages 무료 사용은 Public 저장소여야 합니다. 코드가 공개되어도 문제없는 내용입니다(문항·대사는 어차피 학생에게 보이는 것).
3. 만든 뒤, 이 폴더의 내용을 올립니다. Git이 처음이라면 웹 업로드가 가장 쉽습니다:
   - 저장소 페이지 → "uploading an existing file" 링크 → `게임` 폴더 안의 파일·폴더를 통째로 드래그 → Commit.
   - (명령줄 사용 시) `git init` → `git add .` → `git commit -m "v0.4"` → `git remote add origin <저장소주소>` → `git push -u origin main`

## 2. Pages 켜기 (최초 1회)

저장소 → **Settings → Pages** → Source: "Deploy from a branch" → Branch: `main`, 폴더 `/ (root)` → Save.
1~2분 뒤 `https://<아이디>.github.io/ds-game/` 주소가 생깁니다. 이 주소를 학생들에게 공지하면 끝.

## 3. 업데이트 (챕터 추가·수정 시)

파일을 고치고 커밋+푸시(또는 웹에서 파일 교체)하면 1~2분 내 자동 반영됩니다.
**기능 프리즈 원칙**: 학기 중에는 `data/` 폴더(챕터 데이터)만 추가·수정하고 `js/`(엔진)는 건드리지 않는 것이 원칙입니다. 프리즈 시점에 태그를 남겨두면 좋습니다: `git tag v1.0-freeze && git push --tags`

## 4. 주의사항

- `js/config.js`의 anon 키는 공개 저장소에 있어도 됩니다(삽입 전용 정책 전제 — Supabase 가이드 2절).
- 학생 진도는 각자 브라우저(localStorage)에 저장됩니다. 브라우저를 바꾸면 진도가 초기화되므로 수업 공지에 "같은 브라우저 사용"을 안내하세요. (진도 코드 이관 기능은 추후 추가 예정)
- 커스텀 도메인이나 학교 서버로 옮기고 싶어지면 폴더째 복사하면 됩니다 — 서버 요구사항 없음.
