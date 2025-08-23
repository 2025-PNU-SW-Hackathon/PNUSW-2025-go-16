// 🏪 가게 선택 기능 테스트 스크립트
// 실행 방법: node test_store_selection.js

const axios = require('axios');

// 테스트 설정
const BASE_URL = 'http://localhost:3000';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoieWVqdW4yIiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzY4MDB9.example'; // 실제 토큰으로 교체 필요

async function testStoreSelection() {
  try {
    console.log('🏪 가게 선택 기능 테스트 시작...\n');

    // 1. 가게 선택 API 호출
    const roomId = 1; // 실제 채팅방 ID로 교체
    const storeId = 'test1'; // 실제 가게 ID로 교체

    console.log(`📡 API 호출: PATCH /api/v1/chats/${roomId}/store`);
    console.log(`📦 요청 데이터: { store_id: "${storeId}" }`);

    const response = await axios.patch(
      `${BASE_URL}/api/v1/chats/${roomId}/store`,
      {
        store_id: storeId
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ API 응답 성공:');
    console.log('📊 상태 코드:', response.status);
    console.log('📄 응답 데이터:', JSON.stringify(response.data, null, 2));

    // 2. 소켓 이벤트 확인 안내
    console.log('\n🔍 다음을 확인하세요:');
    console.log('1. 서버 로그에서 "🏪 [STORE SELECT]" 메시지 확인');
    console.log('2. 클라이언트에서 "storeSelected" 소켓 이벤트 수신 확인');
    console.log('3. 채팅방에 시스템 메시지 추가 확인');

  } catch (error) {
    console.error('❌ 테스트 실패:');
    
    if (error.response) {
      console.error('📊 상태 코드:', error.response.status);
      console.error('📄 에러 응답:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('🔌 네트워크 오류:', error.message);
    }
  }
}

// 테스트 실행
if (require.main === module) {
  testStoreSelection();
}

module.exports = { testStoreSelection };
