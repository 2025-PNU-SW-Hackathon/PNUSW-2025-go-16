import { ChatRoom } from './ChatTypes';

export type RootStackParamList = {
    Onboarding: undefined;
    Main: undefined;
    Login: undefined;
    Signup: undefined;
    ChatRoom: { chatRoom: ChatRoom };
  };