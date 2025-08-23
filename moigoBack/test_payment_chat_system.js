const axios = require('axios');
const io = require('socket.io-client');

// 테스트 설정
const BASE_URL = 'http://localhost:3000/api/v1';
const SOCKET_URL = 'http://localhost:3000';
const TEST_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // 실제 토큰으로 교체 필요
const TEST_ROOM_ID = 2; // 실제 채팅방 ID로 교체 필요

// API 호출 함수들
const paymentAPI = {
  // 정산 시작
  startPayment: async (token, roomId, paymentPerPerson) => {
    const response = await axios.post(`${BASE_URL}/chats/${roomId}/payment/start`, {
      payment_per_person: paymentPerPerson
    }, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  // 입금 완료
  completePayment: async (token, roomId, paymentMethod = 'bank_transfer') => {
    const response = await axios.post(`${BASE_URL}/chats/${roomId}/payment/complete`, {
      payment_method: paymentMethod
    }, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  // 정산 상태 조회
  getPaymentStatus: async (token, roomId) => {
    const response = await axios.get(`${BASE_URL}/chats/${roomId}/payment`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  },

  // 채팅방 메시지 조회
  getChatMessages: async (token, roomId) => {
    const response = await axios.get(`${BASE_URL}/chats/${roomId}/all-messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  }
};

// 소켓 이벤트 모니터링
class SocketMonitor {
  constructor(roomId, token) {
    this.roomId = roomId;
    this.token = token;
    this.socket = null;
    this.events = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = io(SOCKET_URL, {
        auth: { token: this.token },
        transports: ['websocket']
      });

      this.socket.on('connect', () => {
        console.log('🔌 소켓 연결 성공');
        
        // 채팅방 입장
        this.socket.emit('joinRoom', { room_id: this.roomId });
        
        // 이벤트 리스너 등록
        this.setupEventListeners();
        
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ 소켓 연결 실패:', error);
        reject(error);
      });
    });
  }

  setupEventListeners() {
    // 정산 관련 이벤트들
    this.socket.on('paymentStarted', (data) => {
      console.log('💰 [SOCKET] paymentStarted:', data);
      this.events.push({ type: 'paymentStarted', data, timestamp: new Date() });
    });

    this.socket.on('paymentCompleted', (data) => {
      console.log('✅ [SOCKET] paymentCompleted:', data);
      this.events.push({ type: 'paymentCompleted', data, timestamp: new Date() });
    });

    this.socket.on('paymentFullyCompleted', (data) => {
      console.log('🎉 [SOCKET] paymentFullyCompleted:', data);
      this.events.push({ type: 'paymentFullyCompleted', data, timestamp: new Date() });
    });

    // 메시지 관련 이벤트들
    this.socket.on('newMessage', (data) => {
      if (data.message_type && data.message_type.includes('payment')) {
        console.log('💬 [SOCKET] newMessage (정산 관련):', {
          message_type: data.message_type,
          message_id: data.message_id,
          message_preview: data.message.substring(0, 50) + '...'
        });
        this.events.push({ type: 'newMessage', data, timestamp: new Date() });
      }
    });

    // 🆕 메시지 업데이트 이벤트
    this.socket.on('messageUpdated', (data) => {
      console.log('🔄 [SOCKET] messageUpdated:', {
        message_type: data.message_type,
        message_id: data.message_id,
        payment_progress: data.payment_progress,
        updated: data.updated
      });
      this.events.push({ type: 'messageUpdated', data, timestamp: new Date() });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('🔌 소켓 연결 해제');
    }
  }

  getEventsSummary() {
    const summary = {};
    this.events.forEach(event => {
      summary[event.type] = (summary[event.type] || 0) + 1;
    });
    return summary;
  }
}

// 채팅 메시지에서 정산 관련 메시지 찾기
const findPaymentMessages = (messages) => {
  return messages.filter(msg => 
    msg.sender_id === 'system' && 
    (msg.message.includes('정산이 시작되었습니다') || 
     msg.message.includes('정산이 완료되었습니다'))
  );
};

// 정산 시작 테스트
const testPaymentStart = async (monitor) => {
  console.log('\n=== 1. 정산 시작 테스트 ===');
  
  try {
    const result = await paymentAPI.startPayment(TEST_TOKEN, TEST_ROOM_ID, 25000);
    
    if (result.success) {
      console.log('✅ 정산 시작 API 성공');
      console.log(`💰 결제 ID: ${result.data.payment_id}`);
      console.log(`👥 참여자: ${result.data.total_participants}명`);
      console.log(`💳 1인당: ${result.data.payment_per_person.toLocaleString()}원`);
      
      // 잠시 대기 (소켓 이벤트 수신 대기)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 채팅 메시지 확인
      const chatResult = await paymentAPI.getChatMessages(TEST_TOKEN, TEST_ROOM_ID);
      if (chatResult.success) {
        const paymentMessages = findPaymentMessages(chatResult.data);
        const startMessage = paymentMessages.find(msg => msg.message.includes('정산이 시작되었습니다'));
        
        if (startMessage) {
          console.log('✅ 정산 시작 시스템 메시지 확인됨');
          console.log(`📝 메시지 ID: ${startMessage.id}`);
          console.log('📄 메시지 내용 (일부):');
          console.log(startMessage.message.split('\n').slice(0, 3).join('\n') + '...');
        } else {
          console.log('❌ 정산 시작 시스템 메시지를 찾을 수 없음');
        }
      }
      
      return result.data;
    }
  } catch (error) {
    console.error('❌ 정산 시작 실패:', error.response?.data?.message || error.message);
    return null;
  }
};

// 입금 완료 테스트 (시뮬레이션)
const testPaymentComplete = async (monitor, participantCount = 1) => {
  console.log(`\n=== 2. 입금 완료 테스트 (${participantCount}명) ===`);
  
  const results = [];
  
  for (let i = 0; i < participantCount; i++) {
    try {
      console.log(`\n💳 입금 ${i + 1}/${participantCount} 처리 중...`);
      
      const result = await paymentAPI.completePayment(TEST_TOKEN, TEST_ROOM_ID);
      
      if (result.success) {
        console.log(`✅ 입금 ${i + 1} 완료: ${result.data.user_name}`);
        console.log(`📊 진행률: ${result.data.remaining_pending}명 남음`);
        
        results.push(result.data);
        
        // 잠시 대기 (메시지 업데이트 확인)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 전체 정산 완료 체크
        if (result.data.is_fully_completed) {
          console.log('🎉 전체 정산 완료!');
          break;
        }
      }
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('⚠️ 이미 입금 완료됨 (409 에러)');
        break;
      } else {
        console.error(`❌ 입금 ${i + 1} 실패:`, error.response?.data?.message || error.message);
        break;
      }
    }
  }
  
  return results;
};

// 메시지 업데이트 확인
const verifyMessageUpdates = async (originalMessageId) => {
  console.log('\n=== 3. 메시지 업데이트 확인 ===');
  
  try {
    const chatResult = await paymentAPI.getChatMessages(TEST_TOKEN, TEST_ROOM_ID);
    
    if (chatResult.success) {
      const paymentMessages = findPaymentMessages(chatResult.data);
      
      console.log(`📝 발견된 정산 관련 메시지: ${paymentMessages.length}개`);
      
      paymentMessages.forEach((msg, index) => {
        console.log(`\n💬 메시지 ${index + 1}:`);
        console.log(`- ID: ${msg.id}`);
        console.log(`- 타입: ${msg.message_type || '일반'}`);
        
        if (msg.message.includes('입금 현황:')) {
          const progressMatch = msg.message.match(/📊 입금 현황: (\d+)\/(\d+)명 완료/);
          if (progressMatch) {
            console.log(`- 진행률: ${progressMatch[1]}/${progressMatch[2]}명`);
          }
        }
        
        const previewLines = msg.message.split('\n').slice(0, 2);
        console.log(`- 내용: ${previewLines.join(' / ')}...`);
      });
      
      // 완료 메시지 확인
      const completionMessage = paymentMessages.find(msg => msg.message.includes('정산이 완료되었습니다'));
      if (completionMessage) {
        console.log('\n🎉 정산 완료 메시지 확인됨');
      }
      
      return paymentMessages;
    }
  } catch (error) {
    console.error('❌ 메시지 확인 실패:', error.response?.data?.message || error.message);
    return [];
  }
};

// 소켓 이벤트 요약
const printSocketEventsSummary = (monitor) => {
  console.log('\n=== 4. 소켓 이벤트 요약 ===');
  
  const summary = monitor.getEventsSummary();
  
  console.log('📡 수신된 이벤트:');
  Object.entries(summary).forEach(([eventType, count]) => {
    console.log(`  - ${eventType}: ${count}회`);
  });
  
  if (monitor.events.length === 0) {
    console.log('⚠️ 수신된 소켓 이벤트가 없습니다.');
    console.log('   - 소켓 연결 상태 확인 필요');
    console.log('   - 채팅방 입장 상태 확인 필요');
  } else {
    console.log(`\n✅ 총 ${monitor.events.length}개의 이벤트 수신`);
    
    // messageUpdated 이벤트 특별 확인
    const updateEvents = monitor.events.filter(e => e.type === 'messageUpdated');
    if (updateEvents.length > 0) {
      console.log(`🔄 메시지 업데이트 이벤트: ${updateEvents.length}회`);
      updateEvents.forEach((event, index) => {
        const progress = event.data.payment_progress;
        console.log(`   ${index + 1}. ${progress.completed}/${progress.total}명 완료`);
      });
    }
  }
};

// 메인 테스트 함수
const runPaymentChatTest = async () => {
  console.log('🚀 채팅방 정산 시스템 메시지 테스트 시작\n');
  console.log(`📍 테스트 채팅방: ${TEST_ROOM_ID}`);
  
  const monitor = new SocketMonitor(TEST_ROOM_ID, TEST_TOKEN);
  
  try {
    // 소켓 연결
    await monitor.connect();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 1. 정산 시작 테스트
    const paymentData = await testPaymentStart(monitor);
    
    if (paymentData) {
      // 2. 입금 완료 테스트 (최대 3명 시뮬레이션)
      const paymentResults = await testPaymentComplete(monitor, 3);
      
      // 3. 메시지 업데이트 확인
      await verifyMessageUpdates();
      
      // 4. 소켓 이벤트 요약
      printSocketEventsSummary(monitor);
      
      // 5. 최종 정산 상태 확인
      console.log('\n=== 5. 최종 정산 상태 ===');
      try {
        const finalStatus = await paymentAPI.getPaymentStatus(TEST_TOKEN, TEST_ROOM_ID);
        if (finalStatus.success) {
          const status = finalStatus.data;
          console.log(`💰 정산 상태: ${status.payment_status}`);
          console.log(`📊 진행률: ${status.completed_payments}/${status.total_participants}명`);
          console.log(`💵 총 금액: ${status.total_amount?.toLocaleString()}원`);
        }
      } catch (error) {
        console.log('⚠️ 최종 상태 조회 실패');
      }
    }
    
  } catch (error) {
    console.error('\n💥 테스트 실행 실패:', error.message);
  } finally {
    // 소켓 연결 해제
    monitor.disconnect();
  }
  
  console.log('\n🏁 테스트 완료');
};

// 간단한 메시지 확인 테스트
const testMessagesOnly = async () => {
  console.log('🚀 정산 메시지 확인 테스트\n');
  
  try {
    const chatResult = await paymentAPI.getChatMessages(TEST_TOKEN, TEST_ROOM_ID);
    
    if (chatResult.success) {
      const allMessages = chatResult.data;
      const paymentMessages = findPaymentMessages(allMessages);
      
      console.log(`📝 전체 메시지: ${allMessages.length}개`);
      console.log(`💰 정산 관련 메시지: ${paymentMessages.length}개`);
      
      if (paymentMessages.length > 0) {
        console.log('\n💰 정산 관련 메시지들:');
        paymentMessages.forEach((msg, index) => {
          console.log(`\n${index + 1}. 메시지 ID: ${msg.id}`);
          console.log(`   시간: ${msg.created_at}`);
          console.log(`   내용: ${msg.message.split('\n')[0]}...`);
          
          if (msg.message.includes('입금 현황:')) {
            const progressMatch = msg.message.match(/📊 입금 현황: (\d+)\/(\d+)명 완료/);
            if (progressMatch) {
              console.log(`   📊 현재 진행률: ${progressMatch[1]}/${progressMatch[2]}명`);
            }
          }
        });
      } else {
        console.log('ℹ️ 정산 관련 메시지가 없습니다.');
        console.log('   정산을 시작해보세요: node test_payment_chat_system.js');
      }
      
    }
  } catch (error) {
    console.error('❌ 메시지 확인 실패:', error.response?.data?.message || error.message);
  }
  
  console.log('\n🏁 메시지 확인 완료');
};

// 스크립트 실행
if (require.main === module) {
  const command = process.argv[2];
  
  if (TEST_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('⚠️  테스트를 위해 다음 설정이 필요합니다:');
    console.log('1. test_payment_chat_system.js 파일에서 TEST_TOKEN을 실제 JWT 토큰으로 교체');
    console.log('2. TEST_ROOM_ID를 실제 채팅방 ID로 교체');
    console.log('3. 서버가 실행 중인지 확인');
    console.log('\n사용법:');
    console.log('node test_payment_chat_system.js           # 전체 정산 시스템 테스트');
    console.log('node test_payment_chat_system.js messages  # 메시지만 확인');
  } else {
    switch (command) {
      case 'messages':
        testMessagesOnly();
        break;
      default:
        runPaymentChatTest();
        break;
    }
  }
}

module.exports = {
  paymentAPI,
  SocketMonitor,
  findPaymentMessages
};
