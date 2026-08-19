# Supabase 로그 수집 설정 가이드

서버를 직접 설치·운영하지 않습니다. 웹 대시보드에서 클릭 몇 번 + SQL 한 번이면 끝나고, 이후 관리할 것이 없습니다. 소요 시간 약 30분.

## 1. 프로젝트 만들기

1. https://supabase.com 접속 → 무료 가입 (GitHub 계정으로 가입 가능)
2. "New project" 클릭 → 이름(예: `ds-game`), 데이터베이스 비밀번호(아무거나, 기록해 둘 것), 리전은 Northeast Asia (Seoul) 선택 → 생성 (1~2분 소요)

## 2. 로그 테이블 만들기

왼쪽 메뉴 **SQL Editor** → "New query" → 아래를 붙여넣고 Run:

```sql
create table logs (
  id bigint generated always as identity primary key,
  received_at timestamptz default now(),
  student text,
  chapter text,
  event text,
  ts timestamptz,
  payload jsonb
);

-- 익명 키로 "쓰기만" 허용 (읽기·수정·삭제는 불가 = 학생 간 데이터 노출 없음)
alter table logs enable row level security;
create policy "anon insert only" on logs
  for insert to anon with check (true);
```

## 3. 키 두 개 복사

왼쪽 메뉴 **Settings → API**:

- **Project URL** (예: `https://abcdefgh.supabase.co`)
- **anon public** key (긴 문자열)

이 두 값을 게임의 `js/config.js`에 붙여넣습니다:

```js
const CONFIG = {
  SUPABASE_URL: "https://abcdefgh.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOi...(복사한 키)",
  ...
};
```

anon 키는 공개되어도 되는 키입니다(웹페이지에 원래 노출되는 용도). 2번의 정책 덕에 이 키로는 삽입만 가능하고 조회는 불가능합니다. **service_role 키는 절대 넣지 마세요.**

## 4. 확인

게임을 열고 몇 문제 푼 뒤, Supabase 대시보드 **Table Editor → logs**에서 행이 쌓이는지 확인. 30초 주기 배치 전송이므로 잠시 기다리면 나타납니다.

## 5. 데이터 열람·분석

- 대시보드 Table Editor에서 표로 열람, CSV Export 버튼으로 내려받기.
- 학기말 오개념 분석 예시 (SQL Editor):

```sql
-- 오답 유형(mc)별 빈도
select payload->>'mc' as misconception, count(*)
from logs
where event = 'answer' and (payload->>'correct')::bool = false
group by 1 order by 2 desc;
```

## 동작 방식 (참고)

- 게임은 모든 이벤트를 먼저 학생 기기(localStorage 큐)에 기록합니다.
- 30초마다, 그리고 탭을 닫거나 숨길 때 아직 안 보낸 분량을 배치 전송합니다.
- 전송 실패(오프라인·장애) 시 큐가 유지되어 다음 접속에서 재전송 — 유실 없음.
- config가 비어 있으면 전송 없이 로컬에만 쌓입니다. 학기 중간에 키를 채워 배포해도 밀린 로그가 올라갑니다.
- 학생 식별: 학번 대신 기기별 무작위 토큰(`st_...`). 수업 초 수집 고지 필요.
