# BABI API 연결 범위

팀원 기능의 API는 origin/develop 5a00f23 버전을 사용한다. 로그인은 global/api/auth.ts와 babi-request.ts, 가족 관리는 family-api.ts, 음성 기록·울음 분석·추천 활동은 각 기능의 api.ts를 사용한다. global/api/client.ts도 develop 원본이다. 기존 화면 및 UI 수정은 유지했다.

마이페이지는 family/familyApi.ts와 global/api/sessionClient.ts로 아기 조회·등록·수정, 멤버 조회, 초대 메일, 관리자 이전, 그룹 나가기, 로그아웃·계정 탈퇴를 처리한다. 로그인은 팀원의 요청 함수를 사용하고 반환된 토큰만 마이페이지 세션에 공유한다. 세션 복구는 마이페이지 및 초대 진입 시 수행한다. 홈은 로그인 없이 열 수 있다.

회원가입·이메일 인증에 추가했던 서버 연결은 제거해 develop의 미연결 동작으로 복구했다. 초대 코드 조회·재발급·확인·수락은 팀원의 family-api.ts를 사용한다.

개발 설정은 .env.example을 참고한다. 팀원 경로 /family-api와 마이페이지 경로 /backend를 Vite에서 프록시한다. 로컬 예시 데이터 모드는 .env.development.local의 VITE_USE_MOCK=true로 선택한다.

성장·예방접종·일정·인수인계·리포트 화면은 기존 예시 데이터 동작을 유지한다. aiReportApi.ts의 날짜별 리포트 호출 함수는 보관하지만 인수인계 단위 화면에는 연결하지 않았다.

검증 명령은 npm run build, npm run lint, node --test src/global/api/*.test.mjs이다. 계약 테스트는 응답을 대체하므로 실제 서버 저장까지 보장하지 않는다.
