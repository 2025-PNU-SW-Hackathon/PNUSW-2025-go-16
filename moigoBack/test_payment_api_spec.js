const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdDEiLCJpYXQiOjE3MjQ0MDA2MTl9.VQbDoJZJAhJLFk9Fs3BZJYZt9Q6XGhNEKCnZa7LIqtU'; // test1 토큰
const ROOM_ID = 2;

console.log('🚀 정산 API 명세 검증 테스트 시작\n');

async function testPaymentStart() {
  try {
    console.log('📊 1. 정산 시작 API 호출...');
    
    const response = await axios.post(`${BASE_URL}/api/v1/chats/${ROOM_ID}/payment/start`, {
      payment_per_person: 5000
    }, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ 정산 시작 API 성공:', {
      payment_id: response.data.data.payment_id,
      total_participants: response.data.data.total_participants,
      payment_per_person: response.data.data.payment_per_person
    });

    console.log('\n🔍 서버 로그를 확인하세요:');
    console.log('- 💰 [PAYMENT START] 예약금 안내 시스템 메시지 저장 완료');
    console.log('- ✅ [PAYMENT START] 소켓 이벤트 발송 완료');
    console.log('- payment_id 값 확인');
    
    return response.data.data.payment_id;

  } catch (error) {
    if (error.response) {
      console.log('❌ 정산 시작 실패:', {
        status: error.response.status,
        message: error.response.data.message,
        error_code: error.response.data.error_code
      });
      
      if (error.response.status === 409) {
        console.log('\n🔄 기존 정산 세션이 있습니다. 초기화 후 다시 시도...');
        await resetPayment();
        return await testPaymentStart();
      }
    } else {
      console.error('❌ 네트워크 에러:', error.message);
    }
    return null;
  }
}

async function resetPayment() {
  try {
    console.log('🔄 정산 세션 초기화...');
    
    await axios.delete(`${BASE_URL}/api/v1/chats/${ROOM_ID}/payment/reset`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    console.log('✅ 정산 세션 초기화 완료');
  } catch (error) {
    console.log('⚠️ 정산 세션 초기화 실패:', error.response?.data?.message || error.message);
  }
}

async function testPaymentComplete(paymentId) {
  try {
    console.log('\n📊 2. 입금 완료 API 호출...');
    
    const response = await axios.post(`${BASE_URL}/api/v1/chats/${ROOM_ID}/payment/complete`, {
      payment_method: 'bank_transfer'
    }, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ 입금 완료 API 성공:', {
      user_name: response.data.data.user_name,
      payment_status: response.data.data.payment_status,
      remaining_pending: response.data.data.remaining_pending
    });

    console.log('\n🔍 서버 로그를 확인하세요:');
    console.log('- 🔄 [PAYMENT GUIDE UPDATE] 예약금 안내 데이터 업데이트 시작');
    console.log('- ✅ [PAYMENT GUIDE UPDATE] 예약금 안내 데이터 업데이트 완료');
    console.log('- payment_id 일치 여부 확인');

  } catch (error) {
    console.log('❌ 입금 완료 실패:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      error_code: error.response?.data?.error_code
    });
  }
}

async function testPaymentStatus(paymentId) {
  try {
    console.log('\n📊 3. 정산 상태 조회 API 호출...');
    
    const response = await axios.get(`${BASE_URL}/api/v1/chats/${ROOM_ID}/payment`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('✅ 정산 상태 조회 성공:', {
      payment_id: response.data.data.payment_id,
      payment_status: response.data.data.payment_status,
      completed_payments: response.data.data.completed_payments,
      total_participants: response.data.data.total_participants,
      progress: `${response.data.data.completed_payments}/${response.data.data.total_participants}`
    });

    console.log('\n🔍 Payment ID 검증:');
    if (paymentId && response.data.data.payment_id === paymentId) {
      console.log('✅ Payment ID 일치 확인:', paymentId);
    } else {
      console.log('❌ Payment ID 불일치:', {
        expected: paymentId,
        actual: response.data.data.payment_id
      });
    }

  } catch (error) {
    console.log('❌ 정산 상태 조회 실패:', {
      status: error.response?.status,
      message: error.response?.data?.message
    });
  }
}

async function runTest() {
  try {
    // 1. 정산 시작
    const paymentId = await testPaymentStart();
    
    if (paymentId) {
      // 2초 대기
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 2. 입금 완료
      await testPaymentComplete(paymentId);
      
      // 2초 대기
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 3. 정산 상태 조회
      await testPaymentStatus(paymentId);
    }

    console.log('\n🎯 정산 API 명세 검증 완료!');
    console.log('\n📋 확인 사항:');
    console.log('1. paymentStarted 소켓 이벤트의 payment_id와 payment_guide_data.payment_id 일치');
    console.log('2. newMessage 소켓 이벤트의 message_type = "system_payment_start"');
    console.log('3. paymentGuideUpdated 소켓 이벤트의 실시간 업데이트');
    console.log('4. 모든 API 응답의 payment_id 일관성');

  } catch (error) {
    console.error('❌ 테스트 실행 에러:', error.message);
  }
}

// 테스트 실행
runTest();
