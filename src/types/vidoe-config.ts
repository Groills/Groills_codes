// types/video-config.ts
export interface MeetingConfig {
  appID: number;
  serverSecret: string;
  roomID: string;
  userID: string;
  userName: string;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  viewMode?: ViewMode;
}

export interface Participant {
  userID: string;
  userName: string;
  stream?: MediaStream;
  isVideoOn: boolean;
  isAudioOn: boolean;
}

export type ViewMode = 'grid' | 'speaker' | 'mini';