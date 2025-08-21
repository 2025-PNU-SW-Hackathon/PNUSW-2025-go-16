// 푸시 알림 테스트 스크립트
// 사용법: node test-push.js "여기에_푸시_토큰_입력"

const https = require('https');

// 커맨드 라인에서 토큰 받기
const pushToken = process.argv[2];

if (!pushToken) {
  console.log('사용법: node test-push.js "ExponentPushToken[xxxxxxxxxx]"');
  process.exit(1);
}

// 테스트 메시지 데이터
const message = {
  to: pushToken,
  sound: 'default',
  title: '모이고 테스트 알림 📱',
  body: '푸시 알림이 정상적으로 작동합니다!',
  data: {
    type: 'TEST',
    message: 'Hello from 모이고!'
  },
};

// Expo Push API로 전송
const postData = JSON.stringify(message);

const options = {
  hostname: 'exp.host',
  port: 443,
  path: '/--/api/v2/push/send',
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Accept-encoding': 'gzip, deflate',
    'Content-Type': 'application/json',
    'Content-Length': postData.length,
  },
};

console.log('푸시 알림 전송 중...');
console.log('토큰:', pushToken);

const req = https.request(options, (res) => {
  console.log('응답 상태:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('응답 데이터:', JSON.stringify(response, null, 2));
      
      if (response.data && response.data[0]) {
        const result = response.data[0];
        if (result.status === 'ok') {
          console.log('✅ 푸시 알림 전송 성공!');
          console.log('📱 휴대폰에서 알림을 확인해보세요.');
        } else {
          console.log('❌ 푸시 알림 전송 실패:', result.message);
        }
      }
    } catch (error) {
      console.log('❌ 응답 파싱 오류:', error.message);
      console.log('원본 응답:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ 요청 오류:', error.message);
});

req.write(postData);
req.end();
