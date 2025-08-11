import { ChatRoom } from './ChatTypes';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  Main: { screen?: string };
  Business: undefined;
  ChatRoom: { chatRoom: ChatRoom };
  Profile: undefined;
  MyInfoSetting: undefined;
  CreateMeeting: undefined;
  ParticipatedMatches: undefined;
  ChangePassword: undefined;
};