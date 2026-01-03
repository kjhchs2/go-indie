export const businessInfo = {
  companyName: process.env.NEXT_PUBLIC_BIZ_NAME || '상호명(입력 필요)',
  registrationNumber: process.env.NEXT_PUBLIC_BIZ_REG_NO || '사업자등록번호(입력 필요)',
  representativeName: process.env.NEXT_PUBLIC_BIZ_OWNER || '대표자명(입력 필요)',
  contact: process.env.NEXT_PUBLIC_BIZ_CONTACT || '연락처(입력 필요)',
  address: process.env.NEXT_PUBLIC_BIZ_ADDRESS || '사업장 주소(입력 필요)',
  mailOrderNumber: process.env.NEXT_PUBLIC_MAIL_ORDER_NO || '통신판매신고번호(입력 필요/해당 없음 표기)',
};

export const businessPolicies = {
  servicePeriod:
    process.env.NEXT_PUBLIC_POLICY_SERVICE_PERIOD ||
    '결제 완료 후 즉시 이용 가능한 디지털 서비스입니다. 별도의 배송이 제공되지 않습니다.',
  exchangeRefund:
    process.env.NEXT_PUBLIC_POLICY_EXCHANGE_REFUND ||
    '디지털 콘텐츠 특성상 제공(재생/다운로드) 이후에는 환불이 어렵습니다. 결제 후 7일 이내 미이용 건에 한해 고객센터로 환불을 요청해주세요.',
  cancelPolicy:
    process.env.NEXT_PUBLIC_POLICY_CANCEL ||
    '결제 진행 전까지 언제든 취소 가능합니다. 결제 후에는 이용 내역 확인 후 고객센터에서 취소/환불을 도와드립니다.',
  contactEmail: process.env.NEXT_PUBLIC_POLICY_CONTACT_EMAIL || '',
};
