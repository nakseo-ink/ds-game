"use strict";
/* 배포 설정 — 이 파일만 수정하면 됩니다.
   Supabase를 아직 설정하지 않았다면 빈 문자열로 두세요.
   그 동안 로그는 학생 기기의 localStorage 큐에 안전하게 쌓이며,
   나중에 값을 채워 배포하면 접속 시 밀린 로그까지 자동 전송됩니다.
   설정 방법: docs/Supabase-설정가이드.md 참조 */
const CONFIG = {
  SUPABASE_URL: "https://gmsienuahpxqmvsclezk.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_MdA2BT6v5Nn7wD5KZV6oKg_nEcT_Z5I", // publishable(공개용) 키 — service_role 아님
  LOG_TABLE: "logs",
  FLUSH_INTERVAL_MS: 30000,
  REQUIRE_SID: false       // true면 Supabase 미설정이어도 학번 입력을 요구 (키가 있으면 자동 요구)
};
