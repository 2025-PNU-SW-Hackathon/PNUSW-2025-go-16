import { ChatRoom } from './ChatTypes';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  Main: { screen?: string };
  StoreBasicInfo: undefined;
  StoreDetailInfo: undefined;
  SportsRegistration: undefined;
  BusinessHours: undefined;
  ReservationTime: undefined;
  BusinessInfoEdit: { storeId?: string; isSignup?: boolean };
  Business: undefined;
  Chat: undefined;
  ChatRoom: { chatRoom: ChatRoom };
  CreateMeeting: undefined;
  Meeting: { eventId: string };
  ParticipatedMatches: undefined;
  MyInfoSetting: undefined;
  Profile: undefined;
  ChangePassword: undefined;
  Favorite: undefined;
  StoreList: { chatRoom?: ChatRoom; isHost?: boolean };
  StoreDetail: { storeId: string; chatRoom?: ChatRoom; isHost?: boolean };
  Notification: undefined;
};