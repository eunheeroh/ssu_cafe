import { DrinkMenuItem, SizeOption, AddonOption } from './types';

/**
 * 3. 음료 선택 메뉴 목록
 * - 아메리카노 3,500원
 * - 카페라떼 4,000원
 * - 카페모카 4,500원
 * - 바닐라라떼 4,500원
 * - 녹차라떼 4,500원
 */
export const DRINK_MENU: DrinkMenuItem[] = [
  { id: 'americano', name: '아메리카노', price: 3500, description: '고소하고 깔끔한 바이브 시그니처 블렌드' },
  { id: 'caffe_latte', name: '카페라떼', price: 4000, description: '신선한 우유와 에스프레소의 부드러운 조화' },
  { id: 'caffe_mocha', name: '카페모카', price: 4500, description: '진한 초콜릿 풍미가 감도는 달콤한 커피' },
  { id: 'vanilla_latte', name: '바닐라라떼', price: 4500, description: '천연 바닐라빈 시럽의 향긋한 달콤함' },
  { id: 'green_tea_latte', name: '녹차라떼', price: 4500, description: '유기농 제주 녹차로 만든 깊고 은은한 라떼' },
];

/**
 * 4. 사이즈 옵션 목록
 * - S +0원
 * - M +500원 (기본 선택)
 * - L +1,000원
 */
export const SIZE_OPTIONS: SizeOption[] = [
  { id: 'S', label: 'S (스몰)', additionalPrice: 0, description: '기본 용량 (+0원)' },
  { id: 'M', label: 'M (미디엄)', additionalPrice: 500, description: '권장 용량 (+500원)' },
  { id: 'L', label: 'L (라지)', additionalPrice: 1000, description: '대용량 (+1,000원)' },
];

/**
 * 5. 추가 옵션 체크박스 목록
 * - 샷 추가 +500원
 * - 크림 추가 +500원
 * - 시럽 추가 +300원
 * - 디카페인 +0원
 */
export const ADDON_OPTIONS: AddonOption[] = [
  { id: 'extra_shot', label: '샷 추가', additionalPrice: 500 },
  { id: 'extra_cream', label: '크림 추가', additionalPrice: 500 },
  { id: 'extra_syrup', label: '시럽 추가', additionalPrice: 300 },
  { id: 'decaf', label: '디카페인', additionalPrice: 0 },
];

