const axios = require('axios');

// 테스트 설정
const BASE_URL = 'http://localhost:3000/api/v1';
const TEST_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // 실제 토큰으로 교체 필요
const TEST_ROOM_ID = 2; // 실제 채팅방 ID로 교체 필요

// API 호출 함수들
const paymentAPI = {
  // 정산 상태 조회
  getStatus: async (roomId, token) => {
    const response = await axios.get(`${BASE_URL}/chats/${roomId}/payment`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  },

  // 정산 시작
  start: async (roomId, token, paymentPerPerson) => {
    const response = await axios.post(`${BASE_URL}/chats/${roomId}/payment/start`, {
      payment_per_person: paymentPerPerson
    }, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  // 입금 완료
  complete: async (roomId, token, paymentMethod = 'bank_transfer') => {
    const response = await axios.post(`${BASE_URL}/chats/${roomId}/payment/complete`, {
      payment_method: paymentMethod
    }, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  // 정산 초기화
  reset: async (roomId, token) => {
    const response = await axios.delete(`${BASE_URL}/chats/${roomId}/payment/reset`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  }
};

// 정산 상태 확인 함수
const checkPaymentStatus = async (roomId, token) => {
  try {
    console.log('\n📊 정산 상태 조회 중...');
    const result = await paymentAPI.getStatus(roomId, token);
    
    if (result.success && result.data.payment_status !== 'not_started') {
      console.log('✅ 정산 상태:', result.data.payment_status);
      console.log('📋 정산 정보:');
      console.log(`  - 정산 ID: ${result.data.payment_id}`);
      console.log(`  - 총 참여자: ${result.data.total_participants}명`);
      console.log(`  - 완료: ${result.data.completed_payments}명`);
      console.log(`  - 대기: ${result.data.pending_payments}명`);
      console.log(`  - 1인당 금액: ${result.data.payment_per_person?.toLocaleString()}원`);
      console.log(`  - 총 금액: ${result.data.total_amount?.toLocaleString()}원`);
      
      if (result.data.participants) {
        console.log('\n👥 참여자별 입금 상태:');
        result.data.participants.forEach(p => {
          const status = p.payment_status === 'completed' ? '✅ 완료' : '⏳ 대기';
          const role = p.is_host ? '👑 방장' : '👤 참가자';
          console.log(`  ${role} ${p.user_name}: ${status}`);
        });
      }
      
      return result.data;
    } else {
      console.log('ℹ️ 아직 정산이 시작되지 않았습니다.');
      return null;
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('ℹ️ 정산이 시작되지 않았습니다.');
      return null;
    }
    throw error;
  }
};

// 정산 초기화 함수
const resetPayment = async (roomId, token) => {
  try {
    console.log('\n🔄 정산 초기화 시도 중...');
    const result = await paymentAPI.reset(roomId, token);
    
    if (result.success) {
      console.log('✅ 정산 초기화 성공:', result.message);
      return true;
    }
  } catch (error) {
    console.error('❌ 정산 초기화 실패:', error.response?.data?.message || error.message);
    return false;
  }
};

// 정산 시작 함수
const startPayment = async (roomId, token, paymentPerPerson = 25000) => {
  try {
    console.log(`\n💰 정산 시작 시도 중... (1인당 ${paymentPerPerson.toLocaleString()}원)`);
    const result = await paymentAPI.start(roomId, token, paymentPerPerson);
    
    if (result.success) {
      console.log('✅ 정산 시작 성공!');
      console.log('📋 정산 정보:');
      console.log(`  - 정산 ID: ${result.data.payment_id}`);
      console.log(`  - 총 참여자: ${result.data.total_participants}명`);
      console.log(`  - 1인당 금액: ${result.data.payment_per_person?.toLocaleString()}원`);
      console.log(`  - 총 금액: ${result.data.total_amount?.toLocaleString()}원`);
      return result.data;
    }
  } catch (error) {
    if (error.response?.data?.error_code === 'PAYMENT_ALREADY_STARTED') {
      const errorData = error.response.data;
      console.log('⚠️ 이미 정산이 진행 중입니다!');
      console.log('📊 기존 정산 정보:');
      console.log(`  - 정산 ID: ${errorData.existing_session.payment_id}`);
      console.log(`  - 완료: ${errorData.existing_session.completed_payments}명`);
      console.log(`  - 총 참여자: ${errorData.existing_session.total_participants}명`);
      console.log(`💡 ${errorData.suggestion}`);
      
      return errorData.existing_session;
    } else {
      console.error('❌ 정산 시작 실패:', error.response?.data?.message || error.message);
      throw error;
    }
  }
};

// 입금 완료 함수
const completePayment = async (roomId, token) => {
  try {
    console.log('\n💳 입금 완료 처리 중...');
    const result = await paymentAPI.complete(roomId, token);
    
    if (result.success) {
      console.log('✅ 입금 완료!');
      console.log(`👤 사용자: ${result.data.user_name}`);
      console.log(`💰 상태: ${result.data.payment_status}`);
      console.log(`⏰ 완료 시간: ${result.data.paid_at}`);
      console.log(`📊 남은 대기자: ${result.data.remaining_pending}명`);
      
      if (result.data.is_fully_completed) {
        console.log('🎉 전체 정산이 완료되었습니다!');
      }
      
      return result.data;
    }
  } catch (error) {
    console.error('❌ 입금 완료 실패:', error.response?.data?.message || error.message);
    throw error;
  }
};

// 메인 테스트 시나리오
const runPaymentTest = async () => {
  console.log('🚀 정산 시스템 테스트 시작\n');
  console.log(`📍 채팅방: ${TEST_ROOM_ID}`);
  
  try {
    // 1. 현재 정산 상태 확인
    console.log('\n=== 1단계: 현재 정산 상태 확인 ===');
    const currentStatus = await checkPaymentStatus(TEST_ROOM_ID, TEST_TOKEN);
    
    // 2. 기존 정산이 있으면 초기화 옵션 제안
    if (currentStatus && currentStatus.payment_status === 'in_progress') {
      console.log('\n=== 2단계: 기존 정산 처리 ===');
      if (currentStatus.completed_payments === 0) {
        console.log('💡 아무도 입금하지 않은 정산이 있습니다. 자동 초기화를 시도합니다.');
        await resetPayment(TEST_ROOM_ID, TEST_TOKEN);
      } else {
        console.log('⚠️ 이미 입금이 진행된 정산입니다. 계속 진행하거나 수동으로 초기화하세요.');
        return;
      }
    }
    
    // 3. 정산 시작
    console.log('\n=== 3단계: 정산 시작 ===');
    const paymentData = await startPayment(TEST_ROOM_ID, TEST_TOKEN, 25000);
    
    // 4. 정산 상태 다시 확인
    console.log('\n=== 4단계: 정산 시작 후 상태 확인 ===');
    await checkPaymentStatus(TEST_ROOM_ID, TEST_TOKEN);
    
    // 5. 입금 완료 테스트 (선택사항)
    console.log('\n=== 5단계: 입금 완료 테스트 (선택사항) ===');
    console.log('💡 입금 완료 테스트를 원하면 다음 명령어를 실행하세요:');
    console.log(`node test_payment_system.js complete`);
    
  } catch (error) {
    console.error('\n💥 테스트 실패:', error.message);
  }
  
  console.log('\n🏁 테스트 완료');
};

// 입금 완료만 테스트하는 함수
const runCompleteTest = async () => {
  console.log('🚀 입금 완료 테스트 시작\n');
  
  try {
    // 1. 현재 정산 상태 확인
    await checkPaymentStatus(TEST_ROOM_ID, TEST_TOKEN);
    
    // 2. 입금 완료
    await completePayment(TEST_ROOM_ID, TEST_TOKEN);
    
    // 3. 정산 상태 다시 확인
    console.log('\n=== 입금 완료 후 상태 ===');
    await checkPaymentStatus(TEST_ROOM_ID, TEST_TOKEN);
    
  } catch (error) {
    console.error('\n💥 입금 완료 테스트 실패:', error.message);
  }
  
  console.log('\n🏁 입금 완료 테스트 완료');
};

// 정산 초기화만 테스트하는 함수
const runResetTest = async () => {
  console.log('🚀 정산 초기화 테스트 시작\n');
  
  try {
    // 1. 현재 정산 상태 확인
    await checkPaymentStatus(TEST_ROOM_ID, TEST_TOKEN);
    
    // 2. 정산 초기화
    await resetPayment(TEST_ROOM_ID, TEST_TOKEN);
    
    // 3. 초기화 후 상태 확인
    console.log('\n=== 초기화 후 상태 ===');
    await checkPaymentStatus(TEST_ROOM_ID, TEST_TOKEN);
    
  } catch (error) {
    console.error('\n💥 정산 초기화 테스트 실패:', error.message);
  }
  
  console.log('\n🏁 정산 초기화 테스트 완료');
};

// 스크립트 실행
if (require.main === module) {
  const command = process.argv[2];
  
  if (TEST_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('⚠️  테스트를 위해 다음 설정이 필요합니다:');
    console.log('1. test_payment_system.js 파일에서 TEST_TOKEN을 실제 JWT 토큰으로 교체');
    console.log('2. TEST_ROOM_ID를 실제 채팅방 ID로 교체');
    console.log('3. 서버가 실행 중인지 확인');
    console.log('\n사용법:');
    console.log('node test_payment_system.js          # 전체 테스트');
    console.log('node test_payment_system.js complete # 입금 완료 테스트');
    console.log('node test_payment_system.js reset    # 정산 초기화 테스트');
  } else {
    switch (command) {
      case 'complete':
        runCompleteTest();
        break;
      case 'reset':
        runResetTest();
        break;
      default:
        runPaymentTest();
        break;
    }
  }
}

module.exports = {
  paymentAPI,
  checkPaymentStatus,
  resetPayment,
  startPayment,
  completePayment
};
