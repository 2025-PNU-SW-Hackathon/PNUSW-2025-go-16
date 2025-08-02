import { ChatRoom } from './ChatTypes';

export type RootStackParamList = {
    Onboarding: undefined;
    Main: { screen?: string };
    Login: undefined;
    Signup: undefined;
    ChatRoom: { chatRoom: ChatRoom };
    MyInfoSetting: undefined;
    Profile: undefined;
  };