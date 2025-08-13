import { ChatRoom } from './ChatTypes';

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
  BusinessInfoEdit: undefined;
  Chat: undefined;
  ChatRoom: { chatId: string };
  CreateMeeting: undefined;
  Meeting: { eventId: string };
  ParticipatedMatches: undefined;
  MyInfoSetting: undefined;
  ChangePassword: undefined;
  Favorite: undefined;
};