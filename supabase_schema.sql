-- ====================================================================
-- 바이브 카페 (Vibe Cafe) - Supabase 테이블 생성 및 테스트 데이터 SQL
-- 테이블명: cafe_menu (주문서 항목 기반 테이블)
-- ====================================================================

-- 1. cafe_menu 테이블 생성 쿼리문
-- 주문서의 모든 항목(이름, 전화번호, 음료, 사이즈, 옵션, 수량, 요청사항, 금액)을 반영한 구조입니다.
CREATE TABLE IF NOT EXISTS cafe_menu (
  -- 고유 주문 ID (UUID 자동 생성)
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 주문자 이름 (필수, 1번 항목)
  customer_name VARCHAR(100) NOT NULL,
  
  -- 전화번호 (2번 항목)
  phone VARCHAR(30),
  
  -- 음료 선택 (3번 항목: 아메리카노, 카페라떼, 카페모카, 바닐라라떼, 녹차라떼 등)
  drink_name VARCHAR(100) NOT NULL,
  
  -- 사이즈 (4번 항목: S, M, L)
  size VARCHAR(10) NOT NULL DEFAULT 'M',
  
  -- 추가 옵션 (5번 항목: 샷 추가, 크림 추가, 시럽 추가, 디카페인 등 문자열 배열)
  options TEXT[] DEFAULT '{}',
  
  -- 수량 (6번 항목: 기본값 1, 1~10 범위 제한)
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1 AND quantity <= 10),
  
  -- 요청사항 (7번 항목)
  requests TEXT,
  
  -- 총 결제/예상 금액 (원 단위)
  total_price INTEGER NOT NULL CHECK (total_price >= 0),
  
  -- 주문 상태 ('접수완료', '제조중', '준비완료', '수령완료')
  order_status VARCHAR(20) NOT NULL DEFAULT '접수완료',
  
  -- 주문 접수 일시 (한국 표준시 기준 자동 기록)
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Seoul', NOW())
);

-- ====================================================================
-- 테이블 및 컬럼 코멘트 (Supabase Table Editor에서 가독성을 높여줍니다)
-- ====================================================================
COMMENT ON TABLE cafe_menu IS '바이브 카페 고객 주문 및 메뉴 데이터 테이블';
COMMENT ON COLUMN cafe_menu.customer_name IS '주문자 고객 성함 (필수)';
COMMENT ON COLUMN cafe_menu.phone IS '주문자 연락처';
COMMENT ON COLUMN cafe_menu.drink_name IS '선택 음료명 (예: 카페라떼)';
COMMENT ON COLUMN cafe_menu.size IS '컵 사이즈 (S, M, L)';
COMMENT ON COLUMN cafe_menu.options IS '선택된 추가 옵션 리스트 (예: {샷 추가, 크림 추가})';
COMMENT ON COLUMN cafe_menu.quantity IS '주문 수량 (1~10)';
COMMENT ON COLUMN cafe_menu.requests IS '고객 요청사항';
COMMENT ON COLUMN cafe_menu.total_price IS '최종 계산된 주문 금액';
COMMENT ON COLUMN cafe_menu.order_status IS '주문 진행 상태';
COMMENT ON COLUMN cafe_menu.created_at IS '주문 접수 일시';

-- ====================================================================
-- 2. 테스트용 가짜 데이터 1건 INSERT 쿼리문
-- 예시: 홍길동님, 카페라떼 M사이즈 (샷 추가) 1잔, 총 5,000원 주문
-- ====================================================================
INSERT INTO cafe_menu (
  customer_name,
  phone,
  drink_name,
  size,
  options,
  quantity,
  requests,
  total_price,
  order_status
) VALUES (
  '홍길동',
  '010-1234-5678',
  '카페라떼',
  'M',
  ARRAY['샷 추가'],
  1,
  '우유 많이 따뜻하게 부탁드립니다.',
  5000,
  '접수완료'
);

-- ====================================================================
-- 3. 확인용 조회 쿼리 (SELECT)
-- ====================================================================
SELECT * FROM cafe_menu ORDER BY created_at DESC;
