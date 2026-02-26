export interface Payload {
  sub: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export function isForgotPasswordPayload(v: unknown): v is ForgotPasswordPayload {
  return typeof v === 'object' && v !== null && 'email' in v && typeof (v as ForgotPasswordPayload).email === 'string';
}
