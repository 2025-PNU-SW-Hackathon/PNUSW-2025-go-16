/*
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const crypto = require('crypto');
const { getConnection } = require('../config/db_config');

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');  // ./uploads
const LOCAL_BASE_DIR = 'images';                              // ./uploads/images
const IMAGE_DIR = path.join(UPLOAD_ROOT, LOCAL_BASE_DIR);

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
*/
/* ============== 내부 유틸 ============== */
/*
async function q(sql, params = []) {
  const conn = getConnection();
  try {
    const [rows] = await conn.query(sql, params);
    return rows;
  } finally {
    if (typeof conn.release === 'function') conn.release();
  }
}

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

function extFromMime(mime) {
  switch (mime) {
    case 'image/jpeg': return 'jpg';
    case 'image/png':  return 'png';
    case 'image/webp': return 'webp';
    case 'image/gif':  return 'gif';
    default:           return 'bin';
  }
}

function randomFileName(ext) {
  const id = crypto.randomBytes(8).toString('hex');
  return `${Date.now()}-${id}.${ext}`;
}
*/
/* ============== 서비스 API ============== */

/**
 * 로컬에 이미지 저장 + DB 메타 기록
 * - multer memoryStorage: req.file.buffer 사용
 * - multer diskStorage  : req.file.path 를 목적지로 move
 */
/*
exports.saveImageLocal = async ({ ownerType, ownerId, file, isPublic = 1 }) => {
  if (!file) {
    const e = new Error('파일이 없습니다.'); e.statusCode = 400; throw e;
  }
  const mimeType = file.mimetype || file.mimeType;
  const byteSize = file.size;
  if (!ALLOWED_MIME.has(mimeType)) {
    const e = new Error('허용되지 않는 이미지 형식입니다.'); e.statusCode = 400; throw e;
  }
  if (!byteSize || byteSize <= 0) {
    const e = new Error('파일 크기가 올바르지 않습니다.'); e.statusCode = 400; throw e;
  }

  await ensureDir(IMAGE_DIR);

  const ext = extFromMime(mimeType);
  const fileName = randomFileName(ext);
  const absPath  = path.join(IMAGE_DIR, fileName);

  // 실제 저장
  if (file.buffer) {
    await fsp.writeFile(absPath, file.buffer);
  } else if (file.path) {
    await fsp.rename(file.path, absPath);
  } else {
    const e = new Error('지원하지 않는 업로드 방식입니다.'); e.statusCode = 400; throw e;
  }

  // DB insert (storage_type='local', bucket=NULL, object_key='images/<fileName>')
  const object_key = path.join(LOCAL_BASE_DIR, fileName);
  const result = await q(
    `INSERT INTO images
       (owner_type, owner_id, storage_type, bucket, object_key, mime_type, byte_size, is_public, created_at)
     VALUES (?, ?, 'local', NULL, ?, ?, ?, ?, NOW())`,
    [ownerType, String(ownerId), object_key, mimeType, byteSize, isPublic ? 1 : 0]
  );

  return {
    image_id: result.insertId,
    file_name: fileName,
    object_key,              // 'images/<fileName>'
    abs_path: absPath,       // 서버 내부 절대경로
  };
};

/**
 * 단건 메타 조회
 */
/*
exports.getImageMetaById = async (imageId) => {
  const rows = await q(
    `SELECT id AS image_id,
            owner_type, owner_id,
            storage_type, bucket, object_key,
            mime_type, byte_size, is_public, created_at
       FROM images
      WHERE id = ? LIMIT 1`,
    [imageId]
  );
  if (!rows.length) return null;

  const meta = rows[0];
  const absPath = (meta.storage_type === 'local')
    ? path.join(UPLOAD_ROOT, meta.object_key)
    : null; // s3 전환 시에는 여기서 presigned URL 발급 등으로 확장
  return { ...meta, absPath };
};

/**
 * 이미지 ReadStream 반환 (API에서 직접 스트리밍 응답할 때)
 * - 컨트롤러에서 res.setHeader('Content-Type', mime) 후 stream.pipe(res)
 */
/*
exports.openImageStreamById = async (imageId) => {
  const meta = await exports.getImageMetaById(imageId);
  if (!meta) return { meta: null, stream: null };

  if (meta.storage_type !== 'local') {
    // s3 대응은 나중에: 여기서 S3 getObject().createReadStream() 반환하도록 확장
    const e = new Error('현재는 local 저장소만 지원합니다.'); e.statusCode = 501; throw e;
  }

  // 파일 존재 체크 + 스트림
  await fsp.access(meta.absPath).catch(() => {
    const e = new Error('이미지 파일이 존재하지 않습니다.'); e.statusCode = 404; throw e;
  });

  const stream = fs.createReadStream(meta.absPath);
  return { meta, stream };
};

/**
 * 편의 함수: Express res로 직접 전송
 * - 컨트롤러에서 await imageService.sendImageById(res, imageId)
 */
/*
exports.sendImageById = async (res, imageId) => {
  const { meta, stream } = await exports.openImageStreamById(imageId);
  if (!meta || !stream) {
    res.status(404).json({ error: 'not_found' }); return;
  }
  res.setHeader('Content-Type', meta.mime_type);
  // 캐시 헤더(선택)
  res.setHeader('Cache-Control', 'public, max-age=3600');
  stream.on('error', () => res.status(500).end());
  stream.pipe(res);
};

/**
 * 오너별 목록
 */
/*
exports.listImagesByOwner = async ({ ownerType, ownerId }) => {
  const rows = await q(
    `SELECT id AS image_id,
            storage_type, object_key, mime_type, byte_size, created_at
       FROM images
      WHERE owner_type = ? AND owner_id = ?
      ORDER BY id DESC`,
    [ownerType, String(ownerId)]
  );
  return rows;
};

/**
 * 삭제 (파일 & DB)
 */
/*
exports.deleteImage = async (imageId) => {
  const meta = await exports.getImageMetaById(imageId);
  if (!meta) return { ok: false, reason: 'not_found' };

  if (meta.storage_type === 'local' && meta.absPath) {
    try { await fsp.unlink(meta.absPath); } catch (_) {  }
  }
  await q(`DELETE FROM images WHERE id = ?`, [imageId]);
  return { ok: true };
};
*/