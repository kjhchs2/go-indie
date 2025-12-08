import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase service client is not configured on the server.' },
      { status: 503 },
    );
  }

  const body = await request.json();
  const { id, email, nickname, profile_image, role, bio, links } = body ?? {};

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  // 기존 값을 불러와 덮어쓰지 말아야 할 필드를 보존
  const { data: existing } = await supabase
    .from('profiles')
    .select('role, bio, links, nickname, profile_image')
    .eq('id', id)
    .maybeSingle();

  // 빈 문자열로 기존 값을 덮어쓰지 않도록 정규화
  const normalizedProfileImage = profile_image === '' ? undefined : profile_image;
  const normalizedBio = bio === '' ? undefined : bio;
  const normalizedLinks = links === '' ? undefined : links;
  const normalizedNickname = nickname === '' ? undefined : nickname;

  const roleToUse = role ?? existing?.role ?? 'listener';
  const bioToUse = normalizedBio ?? existing?.bio ?? '';
  const linksToUse = normalizedLinks ?? existing?.links ?? '';
  const nicknameToUse = normalizedNickname ?? existing?.nickname ?? email;
  // 이미 저장된 프로필 이미지가 있다면 우선 보존하고, 없을 때만 신규 값 적용
  const profileImageToUse =
    (existing?.profile_image && existing.profile_image !== '') ? existing.profile_image : (normalizedProfileImage ?? existing?.profile_image ?? '');

  const { error } = await supabase.from('profiles').upsert(
    {
      id,
      email,
      nickname: nicknameToUse,
      profile_image: profileImageToUse,
      role: roleToUse,
      bio: bioToUse,
      links: linksToUse,
    },
    { onConflict: 'id' },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
