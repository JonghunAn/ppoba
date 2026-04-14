/**
 * 밸런스게임 덱 & 카드 시드 스크립트 (mongosh용)
 *
 * 실행 방법:
 *   mongosh "mongodb+srv://..." --eval 'var dbName="dev"' seed-balance-game.js
 */

// 문자열 UUID v4 생성 (Mongoose String 타입 호환)
function genId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0;
    var v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── DB 선택 ──
var targetDb = typeof dbName !== 'undefined' ? dbName : 'dev';
db = db.getSiblingDB(targetDb);
print('📌  DB: ' + targetDb);

// ── 기존 system 덱/카드 삭제 ──
var existingDecks = db.Deck.find({userId: 'system'}).toArray();
var existingDeckIds = existingDecks.map(function(d) { return d.id; });
if (existingDeckIds.length > 0) {
  db.Card.deleteMany({deckId: {$in: existingDeckIds}});
  db.Deck.deleteMany({userId: 'system'});
  print('🗑️  기존 system 덱 ' + existingDeckIds.length + '개 및 관련 카드 삭제 완료');
}

// ── 덱 1: 연애 초반 밸런스게임 ──
var deck1Id = genId();
var deck1Cards = [
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
  '애인 인스타 좋아요 다 누르기 vs 가끔 눌러주는 쿨한 스타일'
];

// ── 덱 2: 가치관 밸런스 카드 ──
var deck2Id = genId();
var deck2Cards = [
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
  '사랑 없는 우정 vs 우정 없는 사랑'
];

// ── 카드 도큐먼트 빌드 ──
var now = new Date();

function buildCardDocs(deckId, contents) {
  return contents.map(function (content) {
    return {
      id: genId(),
      content: content,
      deckId: deckId,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };
  });
}

var cards1 = buildCardDocs(deck1Id, deck1Cards);
var cards2 = buildCardDocs(deck2Id, deck2Cards);

// ── 덱 도큐먼트 ──
var deck1 = {
  id: deck1Id,
  name: '연애 초반 밸런스게임',
  category: ['연애∙결혼', '취미'],
  cardIds: cards1.map(function (c) { return c.id; }),
  totalCardCount: cards1.length,
  userId: 'system',
  createdAt: now,
  updatedAt: now
};

var deck2 = {
  id: deck2Id,
  name: '진짜 나를 알아가는 가치관 밸런스',
  category: ['가치관'],
  cardIds: cards2.map(function (c) { return c.id; }),
  totalCardCount: cards2.length,
  userId: 'system',
  createdAt: now,
  updatedAt: now
};

// ── INSERT ──
print('\n📦  덱 삽입 중...');
db.Deck.insertMany([deck1, deck2]);
print('   → 2개 덱 삽입 완료');

print('🃏  카드 삽입 중...');
db.Card.insertMany(cards1.concat(cards2));
print('   → ' + (cards1.length + cards2.length) + '개 카드 삽입 완료');

// ── 결과 확인 ──
print('\n─── 삽입 결과 ───');
print('덱 1: "' + deck1.name + '" (id: ' + deck1.id + ') — 카드 ' + cards1.length + '장');
print('덱 2: "' + deck2.name + '" (id: ' + deck2.id + ') — 카드 ' + cards2.length + '장');
print('\n✅  완료!');
