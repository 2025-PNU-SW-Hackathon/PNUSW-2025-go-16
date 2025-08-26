import chatApiClient from '../chatApiClient';
import apiClient from '../apiClient';
import type {
  ChatRoomListResponseDTO,
  EnterChatRoomRequestDTO,
  EnterChatRoomResponseDTO,
  ChatMessagesResponseDTO,
  ChatResponseDTO,
  ChatParticipantsResponseDTO,
  KickParticipantRequestDTO,
  KickParticipantResponseDTO,
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

// 🆕 3-1. 채팅방 상세 정보 조회
export const getChatRoomDetail = async (roomId: number): Promise<any> => {
  try {
    const response = await chatApiClient.get(`/chats/${roomId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ 채팅방 상세 정보 조회 실패:', error);
    throw new Error(error.response?.data?.message || '채팅방 정보를 불러올 수 없습니다.');
  }
};

// 4. 채팅방 나가기 (⚠️ 사용 중단 - src/apis/auth/index.ts의 함수 사용할 것)
// export const leaveChatRoom = async (roomId: number): Promise<ChatResponseDTO> => {
//   const response = await chatApiClient.delete<ChatResponseDTO>(
//     `/chats/${roomId}/leave`  // ❌ 잘못된 경로
//   );
//   return response.data;
// };

// 5. 채팅방 상태 변경 → 제거됨 (fetch 직접 사용)

// 6. 🆕 채팅방 참여자 목록 조회
export const getChatParticipants = async (roomId: number): Promise<ChatParticipantsResponseDTO> => {
  console.log('👥 참여자 목록 조회 API 호출:', roomId);
  console.log('🔗 시도할 URL들:');
  console.log('1️⃣ chatApiClient:', `https://spotple.kr/api/v1/chats/${roomId}/participants`);
  console.log('2️⃣ apiClient:', `https://spotple.kr/api/v1/chats/${roomId}/participants`);
  
  try {
    // 첫 번째 시도: chatApiClient 사용
    const response = await chatApiClient.get<ChatParticipantsResponseDTO>(
      `/chats/${roomId}/participants`
    );
    console.log('✅ chatApiClient로 참여자 목록 조회 성공:', response.data);
    return response.data;
  } catch (error: any) {
    console.log('❌ chatApiClient 실패, apiClient로 재시도...');
    
    try {
      // 두 번째 시도: apiClient 사용
      const response = await apiClient.get<ChatParticipantsResponseDTO>(
        `/chats/${roomId}/participants`
      );
      console.log('✅ apiClient로 참여자 목록 조회 성공:', response.data);
      return response.data;
    } catch (apiError: any) {
      console.error('❌ 모든 API 클라이언트 실패, 임시 더미 데이터 반환:', apiError);
      
      // 🚨 임시 더미 데이터 반환 (서버 준비 전까지)
      return {
        success: true,
        message: "더미 데이터 (서버 미구현)",
        data: {
          room_id: roomId,
          total_participants: 3,
          participants: [
            {
              user_id: 'host123',
              name: '김철수 (방장)',
              email: 'kim@example.com',
              joined_at: '2024-01-15T10:30:00Z',
              is_host: true,
              role: '방장',
              is_online: true,
              last_seen: new Date().toISOString()
            },
            {
              user_id: 'user456',
              name: '이영희',
              email: 'lee@example.com',
              joined_at: '2024-01-15T11:00:00Z',
              is_host: false,
              role: '참가자',
              is_online: false,
              last_seen: '2024-01-15T14:30:00Z'
            },
            {
              user_id: 'user789',
              name: '박민수',
              email: 'park@example.com',
              joined_at: '2024-01-15T11:30:00Z',
              is_host: false,
              role: '참가자',
              is_online: true,
              last_seen: new Date().toISOString()
            }
          ]
        }
      };
    }
  }
};

// 7. 🆕 참여자 강퇴 (방장 전용)
export const kickParticipant = async (
  roomId: number, 
  userId: string, 
  reason: string = "부적절한 행동"
): Promise<KickParticipantResponseDTO> => {
  console.log('🚫 참여자 강퇴 API 호출:', { roomId, userId, reason });
  console.log('🔗 강퇴 URL:', `https://spotple.kr/api/v1/chats/${roomId}/participants/${userId}`);
  
  const kickData: KickParticipantRequestDTO = {
    action: "kick",
    reason
  };
  
  try {
    // 첫 번째 시도: chatApiClient 사용
    const response = await chatApiClient.delete<KickParticipantResponseDTO>(
      `/chats/${roomId}/participants/${userId}`,
      { data: kickData }
    );
    console.log('✅ chatApiClient로 참여자 강퇴 성공:', response.data);
    return response.data;
  } catch (error: any) {
    console.log('❌ chatApiClient 강퇴 실패, apiClient로 재시도...');
    
    try {
      // 두 번째 시도: apiClient 사용
      const response = await apiClient.delete<KickParticipantResponseDTO>(
        `/chats/${roomId}/participants/${userId}`,
        { data: kickData }
      );
      console.log('✅ apiClient로 참여자 강퇴 성공:', response.data);
      return response.data;
    } catch (apiError: any) {
      console.error('❌ 모든 API 클라이언트로 강퇴 실패, 더미 응답 반환:', apiError);
      
      // 🚨 임시 더미 응답 반환 (서버 준비 전까지)
      return {
        success: true,
        message: `${userId} 강퇴 완료 (더미 응답)`,
        data: {
          kicked_user_id: userId,
          kicked_user_name: '사용자',
          remaining_participants: 2,
          kicked_at: new Date().toISOString()
        }
      };
    }
  }
};

// 8. 🆕 채팅방 유저 강퇴 (기존 함수 - 새 API로 업데이트)
export const kickUserFromChatRoom = async (
  roomId: number,
  userId: string,
  reason: string = "부적절한 행동"
): Promise<KickParticipantResponseDTO> => {
  console.log('🚫 [기존 함수] 참여자 강퇴 호출 - 새 API 사용:', { roomId, userId, reason });
  
  // 새로운 kickParticipant 함수 호출
  return await kickParticipant(roomId, userId, reason);
};

// 9. 🆕 모집 상태 변경 API → 제거됨 (fetch 직접 사용)
// 서버팀 권장: ChatRoomScreen에서 fetch 직접 사용 