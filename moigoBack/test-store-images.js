const fs = require('fs');
const path = require('path');

// 테스트 설정
const API_BASE = 'http://localhost:3001/api/v1';
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // 실제 JWT 토큰으로 변경하세요

// 간단한 HTTP 클라이언트 (fetch가 없는 경우)
async function makeRequest(url, options = {}) {
  const http = require('http');
  const https = require('https');
  
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const req = client.request(urlObj, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// 이미지 업로드 테스트 (파일이 있는 경우)
async function testImageUpload() {
  console.log('📤 이미지 업로드 테스트...');
  
  // 테스트용 이미지 파일 경로 (실제 파일 경로로 변경하세요)
  const testImagePath = './test-image.jpg';
  
  if (!fs.existsSync(testImagePath)) {
    console.log('⚠️ 테스트 이미지 파일이 없습니다. 스킵합니다.');
    return;
  }
  
  try {
    const formData = `------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="images"; filename="test-image.jpg"
Content-Type: image/jpeg

${fs.readFileSync(testImagePath)}
------WebKitFormBoundary7MA4YWxkTrZu0gW--`;

    const response = await makeRequest(`${API_BASE}/stores/me/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
        'Content-Length': Buffer.byteLength(formData)
      },
      body: formData
    });
    
    console.log('📤 업로드 결과:', response);
  } catch (error) {
    console.error('❌ 업로드 실패:', error.message);
  }
}

// 이미지 목록 조회 테스트
async function testGetImages() {
  console.log('📋 이미지 목록 조회 테스트...');
  
  try {
    const response = await makeRequest(`${API_BASE}/stores/me/images`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`
      }
    });
    
    console.log('📋 조회 결과:', response);
  } catch (error) {
    console.error('❌ 조회 실패:', error.message);
  }
}

// 이미지 순서 변경 테스트
async function testReorderImages() {
  console.log('🔄 이미지 순서 변경 테스트...');
  
  try {
    const response = await makeRequest(`${API_BASE}/stores/me/images/reorder`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageOrder: [125, 123, 124]
      })
    });
    
    console.log('🔄 순서 변경 결과:', response);
  } catch (error) {
    console.error('❌ 순서 변경 실패:', error.message);
  }
}

// 메인 이미지 설정 테스트
async function testSetMainImage() {
  console.log('⭐ 메인 이미지 설정 테스트...');
  
  try {
    const response = await makeRequest(`${API_BASE}/stores/me/images/125/main`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`
      }
    });
    
    console.log('⭐ 메인 이미지 설정 결과:', response);
  } catch (error) {
    console.error('❌ 메인 이미지 설정 실패:', error.message);
  }
}

// 이미지 삭제 테스트
async function testDeleteImage() {
  console.log('🗑️ 이미지 삭제 테스트...');
  
  try {
    const response = await makeRequest(`${API_BASE}/stores/me/images/124`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`
      }
    });
    
    console.log('🗑️ 삭제 결과:', response);
  } catch (error) {
    console.error('❌ 삭제 실패:', error.message);
  }
}

// 공개 이미지 조회 테스트
async function testGetPublicImages() {
  console.log('🌐 공개 이미지 조회 테스트...');
  
  try {
    const response = await makeRequest(`${API_BASE}/stores/store_123/images`);
    console.log('🌐 공개 이미지 조회 결과:', response);
  } catch (error) {
    console.error('❌ 공개 이미지 조회 실패:', error.message);
  }
}

// 가게 목록 조회 테스트
async function testGetStoreList() {
  console.log('🏪 가게 목록 조회 테스트...');
  
  try {
    const response = await makeRequest(`${API_BASE}/stores`);
    console.log('🏪 가게 목록 조회 결과:', response);
  } catch (error) {
    console.error('❌ 가게 목록 조회 실패:', error.message);
  }
}

// 가게 상세 정보 조회 테스트
async function testGetStoreDetail() {
  console.log('🔍 가게 상세 정보 조회 테스트...');
  
  try {
    const response = await makeRequest(`${API_BASE}/stores/store_123/detail`);
    console.log('🔍 가게 상세 정보 조회 결과:', response);
  } catch (error) {
    console.error('❌ 가게 상세 정보 조회 실패:', error.message);
  }
}

// 메인 테스트 함수
async function runTests() {
  console.log('🧪 가게 이미지 API 테스트 시작...\n');
  
  if (JWT_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('⚠️ JWT 토큰을 설정해주세요!');
    console.log('JWT_TOKEN 변수를 실제 토큰으로 변경하세요.\n');
    return;
  }
  
  // 인증이 필요한 테스트들
  await testGetImages();
  await testReorderImages();
  await testSetMainImage();
  await testDeleteImage();
  
  // 인증이 필요 없는 테스트들
  await testGetPublicImages();
  await testGetStoreList();
  await testGetStoreDetail();
  
  // 이미지 업로드는 파일이 있는 경우에만
  await testImageUpload();
  
  console.log('\n✅ 모든 테스트 완료!');
}

// 테스트 실행
runTests().catch(console.error);
