const axios = require('axios');

// 테스트 설정
const BASE_URL = 'http://localhost:3000/api/v1';
const TEST_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // 실제 토큰으로 교체 필요
const TEST_ROOM_ID = 1; // 실제 채팅방 ID로 교체 필요

// API 호출 함수
const getChatRoomDetail = async (roomId, token) => {
  try {
    console.log(`🔍 채팅방 상세 정보 조회 시작: roomId=${roomId}`);
    
    const response = await axios.get(`${BASE_URL}/chats/${roomId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ 채팅방 상세 정보 조회 성공!');
    console.log('📊 응답 데이터:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ 채팅방 상세 정보 조회 실패:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};

// 정산 조건 확인 함수
const checkPaymentConditions = (roomDetail) => {
  console.log('\n💰 정산 조건 확인:');
  
  const isRecruitmentClosed = roomDetail.reservation_status === 1;
  const hasSelectedStore = roomDetail.selected_store !== null;
  const isHost = roomDetail.is_host;
  
  console.log(`- 모집 마감 상태: ${isRecruitmentClosed ? '✅' : '❌'} (${roomDetail.status_message})`);
  console.log(`- 가게 선택 완료: ${hasSelectedStore ? '✅' : '❌'} ${hasSelectedStore ? `(${roomDetail.selected_store.store_name})` : ''}`);
  console.log(`- 방장 권한: ${isHost ? '✅' : '❌'} (${roomDetail.user_role})`);
  
  const canStartPayment = isRecruitmentClosed && hasSelectedStore && isHost;
  console.log(`\n🎯 정산 시작 가능: ${canStartPayment ? '✅ 가능' : '❌ 불가능'}`);
  
  if (!canStartPayment) {
    console.log('📋 정산 시작을 위해 필요한 조건:');
    if (!isRecruitmentClosed) console.log('  - 모집을 마감해야 합니다');
    if (!hasSelectedStore) console.log('  - 가게를 선택해야 합니다');
    if (!isHost) console.log('  - 방장만 정산을 시작할 수 있습니다');
  }
  
  return canStartPayment;
};

// 메인 테스트 함수
const runTest = async () => {
  console.log('🚀 채팅방 상세 정보 조회 API 테스트 시작\n');
  
  try {
    // 1. 채팅방 상세 정보 조회
    const result = await getChatRoomDetail(TEST_ROOM_ID, TEST_TOKEN);
    
    if (result.success) {
      const roomDetail = result.data;
      
      // 2. 정산 조건 확인
      checkPaymentConditions(roomDetail);
      
      // 3. 추가 정보 출력
      console.log('\n📋 채팅방 상세 정보:');
      console.log(`- 채팅방 ID: ${roomDetail.chat_room_id}`);
      console.log(`- 채팅방 이름: ${roomDetail.name}`);
      console.log(`- 모임명: ${roomDetail.match_title}`);
      console.log(`- 참여자: ${roomDetail.participant_info}`);
      console.log(`- 모임 시작 시간: ${roomDetail.reservation_start_time}`);
      
      if (roomDetail.selected_store) {
        console.log('\n🏪 선택된 가게 정보:');
        console.log(`- 가게명: ${roomDetail.selected_store.store_name}`);
        console.log(`- 주소: ${roomDetail.selected_store.store_address}`);
        console.log(`- 평점: ${roomDetail.selected_store.store_rating}`);
        console.log(`- 1인당 정산 금액: ${roomDetail.selected_store.payment_per_person?.toLocaleString()}원`);
        console.log(`- 선택 시간: ${roomDetail.selected_store.selected_at}`);
        console.log(`- 선택한 사람: ${roomDetail.selected_store.selected_by_name}`);
      }
      
      if (roomDetail.last_message) {
        console.log('\n💬 마지막 메시지:');
        console.log(`- 내용: ${roomDetail.last_message}`);
        console.log(`- 시간: ${roomDetail.last_message_time}`);
        console.log(`- 발신자: ${roomDetail.last_message_sender_id}`);
      }
    }
    
  } catch (error) {
    console.error('\n💥 테스트 실패:', error.message);
  }
  
  console.log('\n🏁 테스트 완료');
};

// 스크립트 실행
if (require.main === module) {
  // 토큰이 설정되지 않은 경우 안내
  if (TEST_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('⚠️  테스트를 위해 다음 설정이 필요합니다:');
    console.log('1. test_chat_room_detail.js 파일에서 TEST_TOKEN을 실제 JWT 토큰으로 교체');
    console.log('2. TEST_ROOM_ID를 실제 채팅방 ID로 교체');
    console.log('3. 서버가 실행 중인지 확인');
    console.log('\n예시:');
    console.log('const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";');
    console.log('const TEST_ROOM_ID = 1;');
  } else {
    runTest();
  }
}

module.exports = {
  getChatRoomDetail,
  checkPaymentConditions
};
