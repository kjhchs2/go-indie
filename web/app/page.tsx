'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel } from 'swiper/modules';
import 'swiper/css';

import { Music2 } from 'lucide-react';
import { Track } from '@/types';
import { TrackCard } from '@/components/TrackCard';
import { DonationModal } from '@/components/DonationModal';
import { AuthStatus } from '@/components/AuthStatus';
import { useMemo } from 'react';

const fetchTracks = async (): Promise<Track[]> => {
  const res = await fetch('/api/tracks');
  const json = await res.json();
  const list: Track[] = json.data || [];
  // 랜덤 피드를 위해 섞기
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};

export default function Home() {
  const { data, isLoading, error } = useQuery({ queryKey: ['tracks'], queryFn: fetchTracks });
  const [activeIndex, setActiveIndex] = useState(0);
  const [donationTarget, setDonationTarget] = useState<Track | null>(null);
  const [supporterModalOpen, setSupporterModalOpen] = useState(false);

  const swiperEnabled = useMemo(() => !supporterModalOpen, [supporterModalOpen]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 md:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-white shadow-lg">
            <Music2 size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-[var(--accent)]">Go-Indie</p>
            <h1 className="text-lg font-bold leading-tight text-[var(--foreground)]">내 가수 찾고, 밀어주기</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/upload"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            데모 올리기
          </a>
          <AuthStatus />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-0 pb-0 md:px-5">
        {isLoading && (
          <div className="flex h-[70vh] items-center justify-center rounded-3xl bg-[var(--card)] text-[var(--muted)] ring-1 ring-[var(--border)]">
            로딩 중...
          </div>
        )}
        {error && (
          <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-100">
            트랙을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </div>
        )}
        {!isLoading && data && data.length === 0 && (
          <div className="rounded-3xl bg-[var(--card)] p-6 text-center text-[var(--muted)] ring-1 ring-[var(--border)]">
            아직 트랙이 없습니다. 업로드 페이지에서 첫 곡을 올려보세요.
          </div>
        )}
        {!isLoading && data && data.length > 0 && (
          <div className={supporterModalOpen ? 'pointer-events-none' : ''}>
            <Swiper
              direction="vertical"
              mousewheel={swiperEnabled ? { forceToAxis: true, releaseOnEdges: true } : false}
              modules={[Mousewheel]}
              loop
              className="h-[calc(100vh-120px)] overflow-hidden"
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
              allowTouchMove={swiperEnabled}
            >
              {data.map((track, idx) => (
                <SwiperSlide key={track.id}>
                  <div className="flex h-full w-full items-center justify-center">
                    <TrackCard
                      track={track}
                      isActive={idx === activeIndex}
                      onDonate={setDonationTarget}
                      onSupportersOpen={() => setSupporterModalOpen(true)}
                      onSupportersClose={() => setSupporterModalOpen(false)}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </main>

      <DonationModal track={donationTarget} onClose={() => setDonationTarget(null)} />
    </div>
  );
}
