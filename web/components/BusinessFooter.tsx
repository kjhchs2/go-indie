import Link from 'next/link';
import { businessInfo } from '@/lib/businessInfo';

export function BusinessFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border)] bg-[var(--card)]/90 px-4 py-4 text-xs text-[var(--muted)] backdrop-blur md:relative md:mt-10 md:bg-[var(--card)]/60 md:py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 leading-relaxed">
          <p className="font-semibold text-[var(--foreground)]">사업자 정보</p>
          <p>
            상호명: {businessInfo.companyName} / 대표자: {businessInfo.representativeName}
          </p>
          <p>
            사업자등록번호: {businessInfo.registrationNumber} / 통신판매신고번호:{' '}
            {businessInfo.mailOrderNumber}
          </p>
          <p>주소: {businessInfo.address}</p>
          <p>연락처: {businessInfo.contact}</p>
        </div>
        <div className="space-y-1 md:text-right">
          <Link
            href="/legal/policies"
            className="font-semibold text-[var(--accent)] underline decoration-[var(--accent)] underline-offset-4"
          >
            이용약관·환불/취소 정책 확인
          </Link>
          <p className="text-[var(--muted)]">결제 관련 문의는 정책 페이지의 안내를 참고해주세요.</p>
        </div>
      </div>
    </footer>
  );
}
