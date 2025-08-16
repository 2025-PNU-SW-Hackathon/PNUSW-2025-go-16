import type { ChatRoom } from './ChatTypes';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  Main: undefined;
  StoreBasicInfo: undefined;
  StoreDetailInfo: undefined;
  SportsRegistration: undefined;
  BusinessHours: undefined;
  ReservationTime: undefined;
  BusinessInfoEdit: { storeId?: string; isSignup?: boolean };
  Chat: undefined;
  ChatRoom: { chatRoom: ChatRoom };
  CreateMeeting: undefined;
  Meeting: { eventId: string };
  ParticipatedMatches: undefined;
  MyInfoSetting: undefined;
  Profile: undefined;
  ChangePassword: undefined;
  Favorite: undefined;
};