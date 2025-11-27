# GoIndie MVP — 숏폼 오디오 + 커피 후원

- `app/page.tsx`: 세로 스와이프 피드, 하이라이트 자동 재생, 커피 후원 모달(모의 결제).
- `app/upload/page.tsx`: 트랙 업로드 폼 (Supabase Storage 연동 시 파일 업로드, 없으면 URL 입력).
- `app/api/tracks`: Supabase 연동 조회/삽입, 없으면 `mockData` 반환.
- `app/api/donations`: 모의 후원 기록 삽입(Supabase or mock).
- `docs/supabase-schema.sql`: 테이블 정의.
- `app/auth/page.tsx`: Google OAuth 로그인 페이지.

## 로컬 실행
```bash
npm install
npm run dev
# http://localhost:3000
```

## 환경변수
`.env.example` 참고
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE=
```
Supabase가 없으면 mock 데이터로 동작합니다.

## 인증(Google OAuth)
- Supabase 대시보드 → Authentication → Providers → Google 활성화 후 Client ID/Secret 입력.
- Redirect URL: `http://localhost:3000/`(개발), 배포 시 Vercel 도메인으로 추가.
- 프론트에서는 `/auth` 페이지의 Google 버튼으로 로그인합니다.

## 개발 노트
- 스와이프: `swiper` (vertical + mousewheel)
- 상태: `@tanstack/react-query`
- UI: Tailwind CSS
