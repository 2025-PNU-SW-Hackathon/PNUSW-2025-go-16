import chatApiClient from '../chatApiClient';
import type {
  ChatRoomListResponseDTO,
  EnterChatRoomRequestDTO,
  EnterChatRoomResponseDTO,
  ChatMessagesResponseDTO,
  UpdateChatRoomStatusRequestDTO,
  UpdateChatRoomStatusResponseDTO,
  ChatResponseDTO,
} from '../../types/DTO/chat';

// 1. 채팅방 목록 조회
export const getChatRooms = async (): Promise<ChatRoomListResponseDTO> => {
  try {
    const response = await chatApiClient.get<ChatRoomListResponseDTO>('/chats');
    return response.data;
  } catch (error) {
    console.log('채팅방 목록 API 호출 실패, 더미 데이터 반환:', error);
    
    // 테스트용 더미 데이터 반환
    return {
      success: true,
      data: [
        {
          chat_room_id: 1,
          name: '축구 모임',
          last_message: '안녕하세요! 오늘 경기 보러 가실 분들 계신가요?',
          last_message_time: new Date().toISOString(),
          sender_id: 'user123'
        },
        {
          chat_room_id: 2,
          name: '농구 모임',
          last_message: '내일 농구하실 분들 모집합니다!',
          last_message_time: new Date(Date.now() - 3600000).toISOString(), // 1시간 전
          sender_id: 'user456'
        },
        {
          chat_room_id: 3,
          name: '야구 모임',
          last_message: '주말에 야구 보러 가실 분들 있나요?',
          last_message_time: new Date(Date.now() - 7200000).toISOString(), // 2시간 전
          sender_id: 'user789'
        }
      ]
    };
  }
};

// 2. 채팅방 입장/생성
export const enterChatRoom = async (
  data: EnterChatRoomRequestDTO
): Promise<EnterChatRoomResponseDTO> => {
  const response = await chatApiClient.post<EnterChatRoomResponseDTO>(
    '/chats/enter',
    data
  );
  return response.data;
};

// 3. 채팅방 메시지 조회
export const getChatMessages = async (
  roomId: number
): Promise<ChatMessagesResponseDTO> => {
  try {
    const response = await chatApiClient.get<ChatMessagesResponseDTO>(
      `/chats/${roomId}/all-messages`
    );
    return response.data;
  } catch (error) {
    console.log('채팅 메시지 API 호출 실패, 더미 데이터 반환:', error);
    
    // 테스트용 더미 메시지 반환
    return {
      success: true,
      data: [
        {
          id: 1,
          sender_id: 'user123',
          message: '안녕하세요! 오늘 경기 보러 가실 분들 계신가요?',
          created_at: new Date(Date.now() - 300000).toISOString(), // 5분 전
          read_count: 3
        },
        {
          id: 2,
          sender_id: 'user456',
          message: '네! 저도 가고 싶어요. 몇 시에 만나나요?',
          created_at: new Date(Date.now() - 240000).toISOString(), // 4분 전
          read_count: 2
        },
        {
          id: 3,
          sender_id: 'user789',
          message: '저도 참여하고 싶습니다!',
          created_at: new Date(Date.now() - 180000).toISOString(), // 3분 전
          read_count: 1
        }
      ]
    };
  }
};

// 4. 채팅방 나가기 (⚠️ 사용 중단 - src/apis/auth/index.ts의 함수 사용할 것)
// export const leaveChatRoom = async (roomId: number): Promise<ChatResponseDTO> => {
//   const response = await chatApiClient.delete<ChatResponseDTO>(
//     `/chats/${roomId}/leave`  // ❌ 잘못된 경로
//   );
//   return response.data;
// };

// 5. 채팅방 상태 변경
export const updateChatRoomStatus = async (
  roomId: number,
  data: UpdateChatRoomStatusRequestDTO
): Promise<UpdateChatRoomStatusResponseDTO> => {
  const response = await chatApiClient.patch<UpdateChatRoomStatusResponseDTO>(
    `/chats/${roomId}/status`,
    data
  );
  return response.data;
};

// 6. 채팅방 유저 강퇴
export const kickUserFromChatRoom = async (
  roomId: number,
  userId: string
): Promise<ChatResponseDTO> => {
  const response = await chatApiClient.delete<ChatResponseDTO>(
    `/chats/${roomId}/kick/${userId}`
  );
  return response.data;
}; 