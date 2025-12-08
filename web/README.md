# GoIndie — 숏폼 오디오 & 인디 후원 MVP

세로 스와이프 피드로 숏폼 데모를 듣고, 하이라이트 재생과 “밀어주기🏃🏾” 후원을 제공하는 MVP입니다.

## 주요 기능
- **메인 피드**: 세로 스와이프(루프), 탭 재생/일시정지, 하이라이트 자동 재생, 펀딩 게이지, 후원자 모달.
- **업로드/수정**: 오디오 업로드, 커버 선택, 하이라이트 파형(30초 고정), 태그(엔터 추가), 가사, 펀딩 목표/목적 입력.
- **후원**: 금액+메시지 기록, 트랙별 후원 총액/게이지 반영, 후원자 리스트 조회.
- **내 업로드**: 리스트/수정/삭제.

## 로컬 실행
```bash
cd web
npm install
npm run dev
# http://localhost:3000
```

## 환경 변수 (`web/.env`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE=
```

## Supabase 준비
1) **스키마 적용**: `docs/supabase-schema.sql` (profiles/tracks/donations + 펀딩 필드).
2) **donations FK**: `track_id` ON DELETE CASCADE.
3) **Storage**: 버킷 `audio`, `covers` 생성, 권한/CORS 설정.
4) **이미지 도메인**: `next.config.ts`에 `*.supabase.co` 포함.
5) **RLS 예시**
```sql
-- tracks
alter table public.tracks enable row level security;
create policy "tracks_select_public" on public.tracks for select using (true);
create policy "tracks_insert_owner" on public.tracks for insert with check (auth.uid() = artist_id);
create policy "tracks_update_owner" on public.tracks for update using (auth.uid() = artist_id);
create policy "tracks_delete_owner" on public.tracks for delete using (auth.uid() = artist_id);

-- donations
alter table public.donations enable row level security;
create policy "donations_insert_auth" on public.donations
  for insert with check (auth.uid() = sender_id or sender_id is null);
create policy "donations_select_involved" on public.donations
  for select using (auth.uid() = receiver_id or auth.uid() = sender_id);
create policy "donations_update_self" on public.donations
  for update using (auth.uid() = sender_id) with check (auth.uid() = sender_id);
create policy "donations_delete_self" on public.donations
  for delete using (auth.uid() = sender_id);
```

## 주요 페이지
- `/` : 메인 피드(스와이프, 재생, 후원, 후원자 모달, 게이지).
- `/upload` : 업로드 폼(오디오/커버, 파형 하이라이트, 태그, 가사, 펀딩 목표).
- `/my-uploads` : 내 업로드 리스트(수정/삭제).
- `/my-uploads/[id]` : 업로드 수정.

## 스크립트
- `npm run dev` : 개발 서버
- `npm run lint` : ESLint
- `npm run build` : 프로덕션 빌드

## 배포 노트
- Vercel + Supabase 조합 권장. Vercel 프로젝트 루트는 `web/`.
- ENV 3개 입력 후 배포.
- Storage/CORS와 RLS 정책 확인 후 테스트.
