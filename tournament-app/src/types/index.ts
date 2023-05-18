export interface Participant {
  id?: number;
  name?: string;
}

export interface MatchType {
  id: number;
  nextMatchId: number | null;
  startTime: string;
  state: string;
  participants: Array<Participant>;
}
