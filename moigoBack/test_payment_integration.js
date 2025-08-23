const axios = require('axios');

// 테스트 설정
const BASE_URL = 'http://localhost:3000/api/v1';
const TEST_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // 실제 토큰으로 교체 필요
const TEST_ROOM_ID = 2; // 실제 채팅방 ID로 교체 필요

// API 호출 함수들
const chatAPI = {
  // 채팅방 목록 조회
  getChatRooms: async (token) => {
    const response = await axios.get(`${BASE_URL}/chats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  },

  // 채팅방 입장
  enterChatRoom: async (token, groupId) => {
    const response = await axios.post(`${BASE_URL}/chats/enter`, {
      group_id: groupId
    }, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  // 채팅방 상세 정보 조회
  getChatRoomDetail: async (token, roomId) => {
    const response = await axios.get(`${BASE_URL}/chats/${roomId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  },

  // 정산 상태 조회
  getPaymentStatus: async (token, roomId) => {
    const response = await axios.get(`${BASE_URL}/chats/${roomId}/payment`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  }
};

// 정산 정보 출력 함수
const displayPaymentInfo = (paymentInfo, title = '정산 정보') => {
  console.log(`\n📊 ${title}:`);
  
  if (!paymentInfo) {
    console.log('  - 정산이 시작되지 않았습니다.');
    return;
  }

  console.log(`  - 상태: ${paymentInfo.payment_status}`);
  console.log(`  - 1인당 금액: ${paymentInfo.payment_per_person?.toLocaleString()}원`);
  
  if (paymentInfo.store_info) {
    console.log(`  - 가게: ${paymentInfo.store_info.store_name}`);
    console.log(`  - 계좌: ${paymentInfo.store_info.bank_name} ${paymentInfo.store_info.account_number}`);
  }
  
  if (paymentInfo.completed_count !== undefined) {
    console.log(`  - 진행률: ${paymentInfo.completed_count}/${paymentInfo.total_count}명 완료`);
  }
  
  if (paymentInfo.payment_deadline) {
    console.log(`  - 마감일: ${new Date(paymentInfo.payment_deadline).toLocaleString()}`);
  }
  
  if (paymentInfo.participants && paymentInfo.participants.length > 0) {
    console.log('\n  👥 참여자별 입금 상태:');
    paymentInfo.participants.forEach(p => {
      const status = p.payment_status === 'completed' ? '✅' : '⏳';
      console.log(`    ${status} ${p.user_name}: ${p.payment_status}`);
    });
  }
};

// 채팅방 목록에서 정산 상태 확인
const testChatRoomList = async () => {
  try {
    console.log('\n=== 1. 채팅방 목록 조회 (정산 상태 포함) ===');
    const result = await chatAPI.getChatRooms(TEST_TOKEN);
    
    if (result.success && result.data.length > 0) {
      console.log(`✅ 채팅방 ${result.data.length}개 조회 성공`);
      
      result.data.forEach(room => {
        console.log(`\n📱 채팅방: ${room.name} (ID: ${room.chat_room_id})`);
        console.log(`  - 상태: ${room.status_message}`);
        console.log(`  - 참여자: ${room.participant_info}`);
        console.log(`  - 정산 상태: ${room.payment_status}`);
        
        if (room.payment_progress) {
          console.log(`  - 정산 진행률: ${room.payment_progress}`);
        }
        
        if (room.selected_store) {
          console.log(`  - 선택된 가게: ${room.selected_store.store_name}`);
        }
      });
      
      return result.data;
    } else {
      console.log('⚠️ 채팅방이 없습니다.');
      return [];
    }
  } catch (error) {
    console.error('❌ 채팅방 목록 조회 실패:', error.response?.data?.message || error.message);
    return [];
  }
};

// 채팅방 입장 테스트
const testChatRoomEnter = async (roomId) => {
  try {
    console.log(`\n=== 2. 채팅방 입장 (ID: ${roomId}) ===`);
    const result = await chatAPI.enterChatRoom(TEST_TOKEN, roomId);
    
    if (result.success) {
      console.log('✅ 채팅방 입장 성공');
      const roomInfo = result.data.room_info;
      
      console.log('\n📋 채팅방 기본 정보:');
      console.log(`  - 이름: ${roomInfo.match_title}`);
      console.log(`  - 상태: ${roomInfo.status_message}`);
      console.log(`  - 참여자: ${roomInfo.participant_info}`);
      console.log(`  - 방장 여부: ${roomInfo.is_host ? '👑 방장' : '👤 참가자'}`);
      
      if (roomInfo.selected_store) {
        console.log(`  - 선택된 가게: ${roomInfo.selected_store.store_name}`);
      }
      
      // 🆕 정산 정보 표시
      displayPaymentInfo(roomInfo.payment_info, '채팅방 입장 시 정산 정보');
      
      return roomInfo;
    }
  } catch (error) {
    console.error('❌ 채팅방 입장 실패:', error.response?.data?.message || error.message);
    return null;
  }
};

// 채팅방 상세 정보 조회 테스트
const testChatRoomDetail = async (roomId) => {
  try {
    console.log(`\n=== 3. 채팅방 상세 정보 조회 (ID: ${roomId}) ===`);
    const result = await chatAPI.getChatRoomDetail(TEST_TOKEN, roomId);
    
    if (result.success) {
      console.log('✅ 채팅방 상세 정보 조회 성공');
      const data = result.data;
      
      console.log('\n📋 상세 정보:');
      console.log(`  - 이름: ${data.name}`);
      console.log(`  - 상태: ${data.status_message}`);
      console.log(`  - 참여자: ${data.participant_info}`);
      console.log(`  - 방장 여부: ${data.is_host ? '👑 방장' : '👤 참가자'}`);
      
      if (data.selected_store) {
        console.log(`  - 선택된 가게: ${data.selected_store.store_name}`);
        console.log(`    - 주소: ${data.selected_store.store_address || 'N/A'}`);
        console.log(`    - 평점: ${data.selected_store.store_rating || 'N/A'}`);
        console.log(`    - 1인당 정산 금액: ${data.selected_store.payment_per_person?.toLocaleString()}원`);
      }
      
      return data;
    }
  } catch (error) {
    console.error('❌ 채팅방 상세 정보 조회 실패:', error.response?.data?.message || error.message);
    return null;
  }
};

// 정산 상태 상세 조회 테스트
const testPaymentStatusDetail = async (roomId) => {
  try {
    console.log(`\n=== 4. 정산 상태 상세 조회 (ID: ${roomId}) ===`);
    const result = await chatAPI.getPaymentStatus(TEST_TOKEN, roomId);
    
    if (result.success) {
      console.log('✅ 정산 상태 조회 성공');
      
      if (result.data.payment_status === 'not_started') {
        console.log('ℹ️ 정산이 시작되지 않았습니다.');
      } else {
        displayPaymentInfo(result.data, '정산 상태 상세 정보');
      }
      
      return result.data;
    }
  } catch (error) {
    console.error('❌ 정산 상태 조회 실패:', error.response?.data?.message || error.message);
    return null;
  }
};

// 정산 정보 일관성 검사
const validatePaymentConsistency = (enterPaymentInfo, detailPaymentInfo) => {
  console.log('\n=== 5. 정산 정보 일관성 검사 ===');
  
  if (!enterPaymentInfo && !detailPaymentInfo) {
    console.log('✅ 정산 미시작 상태 일관성 확인');
    return true;
  }
  
  if (!enterPaymentInfo || !detailPaymentInfo) {
    console.log('❌ 정산 정보 불일치: 한쪽은 있고 한쪽은 없음');
    return false;
  }
  
  // 상태 비교
  const statusMatch = enterPaymentInfo.payment_status === detailPaymentInfo.payment_status;
  console.log(`${statusMatch ? '✅' : '❌'} 정산 상태: ${enterPaymentInfo.payment_status} vs ${detailPaymentInfo.payment_status}`);
  
  // 금액 비교
  const amountMatch = enterPaymentInfo.payment_per_person === detailPaymentInfo.payment_per_person;
  console.log(`${amountMatch ? '✅' : '❌'} 1인당 금액: ${enterPaymentInfo.payment_per_person} vs ${detailPaymentInfo.payment_per_person}`);
  
  // 참여자 수 비교
  const countMatch = enterPaymentInfo.total_count === detailPaymentInfo.total_participants;
  console.log(`${countMatch ? '✅' : '❌'} 총 참여자: ${enterPaymentInfo.total_count} vs ${detailPaymentInfo.total_participants}`);
  
  const allMatch = statusMatch && amountMatch && countMatch;
  console.log(`\n${allMatch ? '✅' : '❌'} 전체 일관성: ${allMatch ? '일치' : '불일치'}`);
  
  return allMatch;
};

// 메인 테스트 함수
const runIntegrationTest = async () => {
  console.log('🚀 채팅방 정산 정보 통합 테스트 시작\n');
  console.log(`📍 테스트 채팅방: ${TEST_ROOM_ID}`);
  
  try {
    // 1. 채팅방 목록 조회
    const chatRooms = await testChatRoomList();
    
    // 2. 특정 채팅방 입장
    const roomInfo = await testChatRoomEnter(TEST_ROOM_ID);
    
    // 3. 채팅방 상세 정보 조회
    const detailInfo = await testChatRoomDetail(TEST_ROOM_ID);
    
    // 4. 정산 상태 상세 조회
    const paymentDetail = await testPaymentStatusDetail(TEST_ROOM_ID);
    
    // 5. 일관성 검사
    if (roomInfo && paymentDetail) {
      validatePaymentConsistency(roomInfo.payment_info, paymentDetail);
    }
    
    // 6. 요약
    console.log('\n=== 📊 테스트 요약 ===');
    console.log(`✅ 채팅방 목록 조회: ${chatRooms.length}개 방`);
    console.log(`${roomInfo ? '✅' : '❌'} 채팅방 입장: ${roomInfo ? '성공' : '실패'}`);
    console.log(`${detailInfo ? '✅' : '❌'} 상세 정보 조회: ${detailInfo ? '성공' : '실패'}`);
    console.log(`${paymentDetail ? '✅' : '❌'} 정산 상태 조회: ${paymentDetail ? '성공' : '실패'}`);
    
    if (roomInfo?.payment_info) {
      console.log(`💰 정산 상태: ${roomInfo.payment_info.payment_status}`);
      if (roomInfo.payment_info.payment_status === 'in_progress') {
        console.log(`📊 정산 진행률: ${roomInfo.payment_info.completed_count}/${roomInfo.payment_info.total_count}`);
      }
    } else {
      console.log('💰 정산 상태: 미시작');
    }
    
  } catch (error) {
    console.error('\n💥 통합 테스트 실패:', error.message);
  }
  
  console.log('\n🏁 통합 테스트 완료');
};

// 채팅방 목록만 테스트
const testListOnly = async () => {
  console.log('🚀 채팅방 목록 정산 상태 테스트\n');
  
  try {
    const chatRooms = await testChatRoomList();
    
    console.log('\n=== 📊 정산 상태 요약 ===');
    const paymentStats = {
      not_started: 0,
      in_progress: 0,
      completed: 0
    };
    
    chatRooms.forEach(room => {
      paymentStats[room.payment_status] = (paymentStats[room.payment_status] || 0) + 1;
    });
    
    console.log(`📊 정산 미시작: ${paymentStats.not_started}개`);
    console.log(`📊 정산 진행중: ${paymentStats.in_progress}개`);
    console.log(`📊 정산 완료: ${paymentStats.completed}개`);
    
  } catch (error) {
    console.error('\n💥 목록 테스트 실패:', error.message);
  }
  
  console.log('\n🏁 목록 테스트 완료');
};

// 스크립트 실행
if (require.main === module) {
  const command = process.argv[2];
  
  if (TEST_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('⚠️  테스트를 위해 다음 설정이 필요합니다:');
    console.log('1. test_payment_integration.js 파일에서 TEST_TOKEN을 실제 JWT 토큰으로 교체');
    console.log('2. TEST_ROOM_ID를 실제 채팅방 ID로 교체');
    console.log('3. 서버가 실행 중인지 확인');
    console.log('\n사용법:');
    console.log('node test_payment_integration.js        # 전체 통합 테스트');
    console.log('node test_payment_integration.js list   # 채팅방 목록만 테스트');
  } else {
    switch (command) {
      case 'list':
        testListOnly();
        break;
      default:
        runIntegrationTest();
        break;
    }
  }
}

module.exports = {
  chatAPI,
  displayPaymentInfo,
  validatePaymentConsistency
};
