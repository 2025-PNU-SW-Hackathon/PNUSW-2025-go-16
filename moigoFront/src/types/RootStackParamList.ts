import type { ChatRoomDTO } from './DTO/chat';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  Main: { screen?: string };
  Business: undefined;
  ChatList: undefined;
  ChatRoom: { chatRoom: ChatRoomDTO };
  Profile: undefined;
  MyInfoSetting: undefined;
  CreateMeeting: undefined;
  ParticipatedMatches: undefined;
  ChangePassword: undefined;
};