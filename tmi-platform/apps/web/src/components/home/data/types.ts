export interface HomeDataEnvelope<T> {
  data: T;
  source: 'live' | 'fallback';
  timestamp: string;
  error?: string;
}
