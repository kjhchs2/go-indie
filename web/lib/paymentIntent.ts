import crypto from 'node:crypto';

export interface DonationIntent {
  paymentId: string;
  trackId: string;
  receiverId: string;
  senderId: string | null;
  amount: number;
  message?: string;
  trackTitle?: string;
}

const INTENT_SECRET =
  process.env.PORTONE_INTENT_SECRET ||
  process.env.PORTONE_SECRET_KEY ||
  'dev-intent-secret';

const signPayload = (payload: string) => crypto.createHmac('sha256', INTENT_SECRET).update(payload).digest('hex');

export const createIntentToken = (intent: DonationIntent) => {
  const payload = JSON.stringify(intent);
  const signature = signPayload(payload);
  const encoded = Buffer.from(payload, 'utf8').toString('base64url');
  return `${encoded}.${signature}`;
};

export const parseIntentToken = (token: string): DonationIntent => {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) {
    throw new Error('Invalid intent token');
  }

  const payload = Buffer.from(encoded, 'base64url').toString('utf8');
  const expected = signPayload(payload);
  const isValid =
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

  if (!isValid) {
    throw new Error('Intent token mismatch');
  }

  return JSON.parse(payload) as DonationIntent;
};

export const resolveOrigin = (req: Request) =>
  req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
