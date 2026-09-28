/**
 * 바이브 카페 주문서 및 데이터 타입 정의
 * 한국어 주석 포함
 */

// 음료 메뉴 항목 정의
export interface DrinkMenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  icon?: string;
}

// 사이즈 옵션 정의
export interface SizeOption {
  id: 'S' | 'M' | 'L';
  label: string;
  additionalPrice: number;
  description: string;
}

// 추가 옵션 정의
export interface AddonOption {
  id: string;
  label: string;
  additionalPrice: number;
}

// 주문 내역 아이템 (게시판 및 Supabase 레코드 구조와 일치)
export interface OrderItem {
  id: string;
  customerName: string;    // 1. 이름 (필수)
  phone: string;           // 2. 전화번호
  drinkId: string;         // 음료 ID
  drinkName: string;       // 3. 음료명
  size: 'S' | 'M' | 'L';   // 4. 사이즈
  options: string[];       // 5. 추가 옵션 목록
  quantity: number;        // 6. 수량 (1~10)
  requests: string;        // 7. 요청사항
  totalPrice: number;      // 계산된 총 금액
  orderStatus: '접수완료' | '제조중' | '준비완료' | '픽업완료'; // 주문 상태
  createdAt: string;       // 접수 일시
}
