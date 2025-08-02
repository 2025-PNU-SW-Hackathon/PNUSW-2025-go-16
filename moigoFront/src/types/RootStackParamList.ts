import { ChatRoom } from './ChatTypes';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  Main: { screen?: string };
  ChatRoom: undefined;
  Profile: undefined;
  MyInfoSetting: undefined;
  CreateMeeting: undefined;
  ParticipatedMatches: undefined;
  ChangePassword: undefined;
};