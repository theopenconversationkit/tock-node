export interface PlayerId {
  id: string;
  type: 'user' | 'bot';
  clientId?: string;
}
