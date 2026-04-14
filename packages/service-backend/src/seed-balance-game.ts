/// <reference types="node" />
/**
 * 밸런스게임 덱 & 카드 시드 스크립트
 *
 * 실행 방법 (프로젝트 루트에서):
 *   npx ts-node packages/service-backend/src/seed-balance-game.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// ── .env 로드 ───────────────────────────────────────────
function loadEnv() {
  // 프로젝트 루트의 .env 탐색
  let dir = __dirname;
  for (let i = 0; i < 5; i++) {
    const envPath = path.join(dir, '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx);
        const value = trimmed.slice(eqIdx + 1);
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
      console.log(`📄  .env 로드 완료: ${envPath}`);
      return;
    }
    dir = path.dirname(dir);
  }
  console.warn('⚠️  .env 파일을 찾지 못했습니다. 환경변수를 직접 설정해주세요.');
}

loadEnv();

// ── 환경변수 ────────────────────────────────────────────
const MONGODB_CONNECTION_URI = process.env.MONGODB_CONNECTION_URI;
const STAGE = process.env.STAGE ?? 'dev';

if (!MONGODB_CONNECTION_URI) {
  console.error('❌  MONGODB_CONNECTION_URI 환경변수를 설정해주세요.');
  process.exit(1);
}

// ── 스키마 정의 (컬렉션 이름에 맞춤) ───────────────────
const DeckSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true },
    name: { type: String, required: true },
    category: { type: [String] },
    cardIds: { type: [String] },
    totalCardCount: { type: Number, default: 0 },
    userId: { type: String, required: true },
  },
  { timestamps: true, collection: 'Deck' },
);

const CardSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true },
    content: { type: String, required: true },
    deckId: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'Card' },
);

const DeckModel = mongoose.model('Deck', DeckSchema);
const CardModel = mongoose.model('Card', CardSchema);

// ── 시드 데이터 ─────────────────────────────────────────

// 덱 1: 연애 초반 밸런스게임
const deck1Id = uuidv4();
const deck1Cards = [
  '릴스 같이 보는 데이트 vs 유튜브 먹방 같이 보는 데이트',
  '연인 MBTI 완전 반대 vs 연인 MBTI 완전 같음',
  '매일 굿모닝 굿나잇 문자 vs 할 말 있을 때만 연락',
  '데이트 사진 인스타 피드 업로드 vs 스토리에만 올리기',
  '성수동 팝업스토어 데이트 vs 한남동 브런치 카페 데이트',
  '커플 아이템 맞추기 vs 절대 커플룩은 안 함',
  '카톡 프사 투샷으로 변경 vs 프사는 건드리지 않기',
  '데이트 코스 네이버 지도로 미리 짜기 vs 그날 분위기 따라 즉흥',
  '싸운 후 바로 전화 vs 하루 정도 쿨링타임 갖기',
  '연인 핸드폰 비번 공유 vs 각자 프라이버시 존중',
  '넷플릭스 같이 몰아보기 vs 왓챠 다큐 같이 보기',
  '100일에 레터링 케이크 vs 100일에 깜짝 여행',
  '오운완 같이 하는 헬스 커플 vs 러닝크루 같이 뛰는 커플',
  '배달의민족으로 야식 시키기 vs 편의점 털어서 같이 요리',
  '애인 인스타 좋아요 다 누르기 vs 가끔 눌러주는 쿨한 스타일',
];

// 덱 2: 가치관 밸런스 카드
const deck2Id = uuidv4();
const deck2Cards = [
  '돈 많지만 바쁜 삶 vs 적당히 벌고 여유로운 삶',
  '대도시 생활 vs 시골 전원생활',
  '안정적인 직장 vs 도전적인 창업',
  '넓은 인간관계 vs 소수의 깊은 관계',
  '결과가 중요하다 vs 과정이 중요하다',
  '솔직하게 말하는 편 vs 돌려서 말하는 편',
  '계획대로 사는 삶 vs 흘러가는 대로 사는 삶',
  '외모 가꾸기에 투자 vs 자기계발에 투자',
  '맛있는 거 먹는 행복 vs 건강 챙기는 행복',
  '모르는 게 약 vs 알아야 면장을 하지',
  '혼자만의 시간 중요 vs 함께하는 시간 중요',
  '용서는 한 번이면 충분 vs 몇 번이든 기회를 준다',
  '현재를 즐기자 vs 미래를 준비하자',
  '남의 시선 신경 쓰는 편 vs 나만의 길을 가는 편',
  '사랑 없는 우정 vs 우정 없는 사랑',
];

// ── 카드 도큐먼트 생성 헬퍼 ─────────────────────────────
function buildCards(deckId: string, contents: string[]) {
  return contents.map((content) => ({
    id: uuidv4(),
    content,
    deckId,
    deletedAt: null,
  }));
}

// ── 메인 ────────────────────────────────────────────────
async function main() {
  console.log(`🔌  MongoDB 연결 중... (db: ${STAGE})`);
  await mongoose.connect(MONGODB_CONNECTION_URI!, { dbName: STAGE });
  console.log('✅  MongoDB 연결 성공');

  // 카드 생성
  const cards1 = buildCards(deck1Id, deck1Cards);
  const cards2 = buildCards(deck2Id, deck2Cards);

  // 덱 1 insert
  const deck1 = {
    id: deck1Id,
    name: '연애 초반 밸런스게임',
    category: ['연애∙결혼', '취미'],
    cardIds: cards1.map((c) => c.id),
    totalCardCount: cards1.length,
    userId: 'system',
  };

  // 덱 2 insert
  const deck2 = {
    id: deck2Id,
    name: '진짜 나를 알아가는 가치관 밸런스',
    category: ['가치관'],
    cardIds: cards2.map((c) => c.id),
    totalCardCount: cards2.length,
    userId: 'system',
  };

  console.log('\n📦  덱 삽입 중...');
  const insertedDecks = await DeckModel.insertMany([deck1, deck2]);
  console.log(`   → ${insertedDecks.length}개 덱 삽입 완료`);

  console.log('🃏  카드 삽입 중...');
  const insertedCards = await CardModel.insertMany([...cards1, ...cards2]);
  console.log(`   → ${insertedCards.length}개 카드 삽입 완료`);

  // 결과 요약
  console.log('\n─── 삽입 결과 ───');
  console.log(`덱 1: "${deck1.name}" (id: ${deck1.id}) — 카드 ${cards1.length}장`);
  console.log(`덱 2: "${deck2.name}" (id: ${deck2.id}) — 카드 ${cards2.length}장`);

  await mongoose.disconnect();
  console.log('\n🔌  MongoDB 연결 해제. 완료!');
}

main().catch((err) => {
  console.error('❌  시드 실행 실패:', err);
  process.exit(1);
});
