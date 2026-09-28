import React, { useState, useId } from 'react';
import { DRINK_MENU, SIZE_OPTIONS, ADDON_OPTIONS } from '../constants';
import { OrderItem } from '../types';
import { AlertCircle, CheckCircle, RotateCcw, Coffee, Sparkles } from 'lucide-react';

interface OrderFormProps {
  onAddOrder: (newOrder: OrderItem) => Promise<void>;
}

/**
 * 바이브 카페 주문서 폼 컴포넌트
 * 요구사항 준수:
 * - 최대 너비 520px, 가운데 정렬
 * - 모든 입력칸에 label 연결 (htmlFor <-> id)
 * - 실시간 금액 계산 (toLocaleString 천 단위 콤마)
 * - 유효성 검사 및 연두색 확인 메시지
 * - 상세 한국어 주석
 */
export const OrderForm: React.FC<OrderFormProps> = ({ onAddOrder }) => {
  // 1. 상태(State) 관리
  const [customerName, setCustomerName] = useState<string>(''); // 이름 (필수)
  const [phone, setPhone] = useState<string>('');               // 전화번호
  const [selectedDrinkId, setSelectedDrinkId] = useState<string>(''); // 음료 선택
  const [size, setSize] = useState<'S' | 'M' | 'L'>('M');        // 사이즈 (기본값 M)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]); // 추가 옵션 목록
  const [quantity, setQuantity] = useState<number>(1);           // 수량 (기본값 1, 1~10)
  const [requests, setRequests] = useState<string>('');          // 요청사항

  // 알림 및 성공 메시지 상태
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // DB 저장 중 여부

  // 2. 실시간 예상 금액 계산 로직
  // (음료 기본 가격 + 사이즈 추가금 + 옵션 추가금 합산) × 수량
  const selectedDrink = DRINK_MENU.find((d) => d.id === selectedDrinkId);
  const drinkBasePrice = selectedDrink ? selectedDrink.price : 0;
  
  const selectedSizeOption = SIZE_OPTIONS.find((s) => s.id === size);
  const sizeExtraPrice = selectedSizeOption ? selectedSizeOption.additionalPrice : 0;

  const optionsExtraPrice = selectedOptions.reduce((acc, optId) => {
    const opt = ADDON_OPTIONS.find((o) => o.id === optId);
    return acc + (opt ? opt.additionalPrice : 0);
  }, 0);

  // 음료가 선택되었을 때만 실제 주문 금액 계산 (미선택 시 0원 표시)
  const unitPrice = selectedDrink ? drinkBasePrice + sizeExtraPrice + optionsExtraPrice : 0;
  const totalPrice = unitPrice * quantity;

  // 3. 추가 옵션 체크박스 변경 핸들러
  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  // 4. 수량 증감 핸들러 (최소 1, 최대 10)
  const handleQuantityChange = (newQty: number) => {
    if (newQty >= 1 && newQty <= 10) {
      setQuantity(newQty);
    }
  };

  // 5. 다시 작성 (초기화) 버튼 핸들러
  const handleReset = () => {
    setCustomerName('');
    setPhone('');
    setSelectedDrinkId('');
    setSize('M');
    setSelectedOptions([]);
    setQuantity(1);
    setRequests('');
    setErrorMessage(null);
    setConfirmationMessage(null);
  };

  // 6. 주문하기 버튼 핸들러 (유효성 검사 및 주문 완료 처리)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage(null);
    setConfirmationMessage(null);

    // [유효성 검사 1] 이름 필수 검사
    if (!customerName.trim()) {
      setErrorMessage('이름을 입력해주세요');
      // 이름 입력칸으로 포커스 이동
      document.getElementById('customer-name')?.focus();
      return;
    }

    // [유효성 검사 2] 음료 선택 검사
    if (!selectedDrinkId || !selectedDrink) {
      setErrorMessage('음료를 선택해주세요');
      // 음료 선택 드롭다운으로 포커스 이동
      document.getElementById('drink-select')?.focus();
      return;
    }

    // 추가 옵션 이름 텍스트 생성 (예: "(샷 추가)" 또는 "(샷 추가, 크림 추가)")
    const optionLabels = selectedOptions
      .map((optId) => ADDON_OPTIONS.find((o) => o.id === optId)?.label)
      .filter(Boolean);
    const optionsText = optionLabels.length > 0 ? ` (${optionLabels.join(', ')})` : '';

    // 주문 확인 메시지 텍스트 조합:
    // 예) "홍길동님, 카페라떼 M사이즈 (샷 추가) 1잔, 총 5,000원 주문이 접수되었습니다!"
    const formattedMessage = `${customerName.trim()}님, ${selectedDrink.name} ${size}사이즈${optionsText} ${quantity}잔, 총 ${totalPrice.toLocaleString()}원 주문이 접수되었습니다!`;

    // 주문 게시판 및 데이터 목록에 추가
    const newOrder: OrderItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `order-${Date.now()}`,
      customerName: customerName.trim(),
      phone: phone.trim(),
      drinkId: selectedDrink.id,
      drinkName: selectedDrink.name,
      size: size,
      options: optionLabels as string[],
      quantity: quantity,
      requests: requests.trim(),
      totalPrice: totalPrice,
      orderStatus: '접수완료',
      createdAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    // Supabase에 저장 (성공했을 때만 확인 메시지 표시)
    setIsSubmitting(true);
    try {
      await onAddOrder(newOrder);
      setConfirmationMessage(formattedMessage);
    } catch (err: any) {
      console.error('[Supabase] 주문 저장 실패:', err);
      setErrorMessage(`주문 저장에 실패했습니다: ${err.message}`);
      return;
    } finally {
      setIsSubmitting(false);
    }

    // 화면 부드럽게 확인 메시지 쪽으로 스크롤
    setTimeout(() => {
      document.getElementById('confirmation-area')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  return (
    <div className="w-full max-w-[520px] mx-auto px-4 pb-12">
      <div className="bg-[#fffdfa] rounded-2xl shadow-[0_4px_20px_rgba(107,66,38,0.08)] border border-[#ebdccf] p-6 sm:p-8">
        
        {/* 안내 문구 */}
        <div className="border-b border-[#f0e4d8] pb-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-[#6b4226]" />
            <h2 className="text-lg font-bold text-[#6b4226]">주문서 작성</h2>
          </div>
          <span className="text-xs text-[#a08269] bg-[#f5ede4] px-2.5 py-1 rounded-md">
            * 표시는 필수 항목입니다
          </span>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          
          {/* 1. 이름 (필수, text) */}
          <div>
            <label
              htmlFor="customer-name"
              className="block text-sm font-semibold text-[#4a2e1b] mb-1.5 cursor-pointer"
            >
              1. 이름 <span className="text-[#c53030] font-bold" aria-hidden="true">*</span>
            </label>
            <input
              id="customer-name"
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="주문자 성함을 입력해주세요 (예: 홍길동)"
              className="w-full p-[10px] rounded-[8px] border border-[#d4c5b9] bg-white text-[#332211] placeholder:text-[#b39e8e] transition duration-200 focus:border-[#6b4226] focus:ring-2 focus:ring-[#6b4226]/20 focus:outline-none"
            />
          </div>

          {/* 2. 전화번호 (tel) */}
          <div>
            <label
              htmlFor="customer-phone"
              className="block text-sm font-semibold text-[#4a2e1b] mb-1.5 cursor-pointer"
            >
              2. 전화번호
            </label>
            <input
              id="customer-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-1234-5678 (주문 알림 수신용)"
              className="w-full p-[10px] rounded-[8px] border border-[#d4c5b9] bg-white text-[#332211] placeholder:text-[#b39e8e] transition duration-200 focus:border-[#6b4226] focus:ring-2 focus:ring-[#6b4226]/20 focus:outline-none"
            />
          </div>

          {/* 3. 음료 선택 (드롭다운) */}
          <div>
            <label
              htmlFor="drink-select"
              className="block text-sm font-semibold text-[#4a2e1b] mb-1.5 cursor-pointer"
            >
              3. 음료 선택 <span className="text-[#c53030] font-bold" aria-hidden="true">*</span>
            </label>
            <select
              id="drink-select"
              required
              value={selectedDrinkId}
              onChange={(e) => setSelectedDrinkId(e.target.value)}
              className="w-full p-[10px] rounded-[8px] border border-[#d4c5b9] bg-white text-[#332211] transition duration-200 focus:border-[#6b4226] focus:ring-2 focus:ring-[#6b4226]/20 focus:outline-none cursor-pointer"
            >
              <option value="">-- 음료를 선택해주세요 --</option>
              {DRINK_MENU.map((drink) => (
                <option key={drink.id} value={drink.id}>
                  {drink.name} {drink.price.toLocaleString()}원
                </option>
              ))}
            </select>
          </div>

          {/* 4. 사이즈 (라디오 버튼, 가로 배치) */}
          <div>
            <span className="block text-sm font-semibold text-[#4a2e1b] mb-2">
              4. 사이즈 선택
            </span>
            {/* 라디오 버튼: 가로로 나란히 배치, gap 간격 */}
            <div className="flex flex-row flex-wrap gap-3 sm:gap-4">
              {SIZE_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  htmlFor={`size-${opt.id}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer select-none transition-all duration-200 ${
                    size === opt.id
                      ? 'border-[#6b4226] bg-[#6b4226]/8 text-[#6b4226] font-semibold shadow-xs'
                      : 'border-[#e0d3c7] bg-[#fcfaf7] text-[#554030] hover:border-[#bfa58f]'
                  }`}
                >
                  <input
                    id={`size-${opt.id}`}
                    name="drink-size"
                    type="radio"
                    value={opt.id}
                    checked={size === opt.id}
                    onChange={() => setSize(opt.id)}
                    className="w-4 h-4 cursor-pointer accent-[#6b4226]"
                  />
                  <span className="text-sm">
                    {opt.id} (+{opt.additionalPrice.toLocaleString()}원)
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 5. 추가 옵션 (체크박스, 가로 배치) */}
          <div>
            <span className="block text-sm font-semibold text-[#4a2e1b] mb-2">
              5. 추가 옵션
            </span>
            {/* 체크박스: 가로로 나란히 배치, gap 간격 */}
            <div className="flex flex-row flex-wrap gap-2.5 sm:gap-3">
              {ADDON_OPTIONS.map((addon) => {
                const isChecked = selectedOptions.includes(addon.id);
                return (
                  <label
                    key={addon.id}
                    htmlFor={`addon-${addon.id}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer select-none transition-all duration-200 ${
                      isChecked
                        ? 'border-[#6b4226] bg-[#6b4226]/8 text-[#6b4226] font-semibold shadow-xs'
                        : 'border-[#e0d3c7] bg-[#fcfaf7] text-[#554030] hover:border-[#bfa58f]'
                    }`}
                  >
                    <input
                      id={`addon-${addon.id}`}
                      type="checkbox"
                      value={addon.id}
                      checked={isChecked}
                      onChange={() => handleOptionToggle(addon.id)}
                      className="w-4 h-4 rounded cursor-pointer accent-[#6b4226]"
                    />
                    <span className="text-sm">
                      {addon.label} (+{addon.additionalPrice.toLocaleString()}원)
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 6. 수량 (number 타입, 최소 1, 최대 10, 기본값 1) */}
          <div>
            <label
              htmlFor="quantity-input"
              className="block text-sm font-semibold text-[#4a2e1b] mb-1.5 cursor-pointer"
            >
              6. 수량 (1 ~ 10잔)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                aria-label="수량 1 감소"
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#d4c5b9] bg-[#fbf8f5] text-[#6b4226] font-bold text-lg hover:bg-[#ede3d8] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                -
              </button>

              <input
                id="quantity-input"
                type="number"
                min={1}
                max={10}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    if (val < 1) setQuantity(1);
                    else if (val > 10) setQuantity(10);
                    else setQuantity(val);
                  }
                }}
                className="w-24 text-center p-[10px] rounded-[8px] border border-[#d4c5b9] bg-white font-bold text-[#332211] transition duration-200 focus:border-[#6b4226] focus:ring-2 focus:ring-[#6b4226]/20 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= 10}
                aria-label="수량 1 증가"
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#d4c5b9] bg-[#fbf8f5] text-[#6b4226] font-bold text-lg hover:bg-[#ede3d8] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                +
              </button>

              <span className="text-xs text-[#8d6e53]">
                {quantity === 10 ? '최대 10잔까지 주문 가능' : `현재 ${quantity}잔`}
              </span>
            </div>
          </div>

          {/* 7. 요청사항 (textarea) */}
          <div>
            <label
              htmlFor="customer-requests"
              className="block text-sm font-semibold text-[#4a2e1b] mb-1.5 cursor-pointer"
            >
              7. 요청사항
            </label>
            <textarea
              id="customer-requests"
              rows={3}
              value={requests}
              onChange={(e) => setRequests(e.target.value)}
              placeholder="예: 얼음 적게 부탁드려요, 텀블러 이용할게요 등"
              className="w-full p-[10px] rounded-[8px] border border-[#d4c5b9] bg-white text-[#332211] placeholder:text-[#b39e8e] transition duration-200 focus:border-[#6b4226] focus:ring-2 focus:ring-[#6b4226]/20 focus:outline-none resize-none"
            />
          </div>

          {/* 오류 알림 메시지 영역 (이름 또는 음료 미입력 시) */}
          {errorMessage && (
            <div
              role="alert"
              className="flex items-center gap-2 p-3.5 rounded-lg bg-[#fff1f0] border border-[#ffccc7] text-[#cf1322] text-sm font-medium animate-shake"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 예상 금액 영역: 큰 글씨(24px), 갈색, 굵게, 가운데 정렬 */}
          <div className="pt-2 pb-1 text-center border-t border-[#f0e4d8]">
            <p className="text-xs text-[#8d6e53] mb-1">
              {selectedDrink ? (
                <span>
                  기본 {drinkBasePrice.toLocaleString()}원
                  {sizeExtraPrice > 0 && ` + 사이즈 ${sizeExtraPrice.toLocaleString()}원`}
                  {optionsExtraPrice > 0 && ` + 옵션 ${optionsExtraPrice.toLocaleString()}원`}
                  {quantity > 1 && ` × ${quantity}잔`}
                </span>
              ) : (
                '음료를 선택하시면 금액이 계산됩니다'
              )}
            </p>
            <div className="text-[24px] font-bold text-[#6b4226] leading-tight tracking-tight">
              예상 금액: {totalPrice.toLocaleString()}원
            </div>
          </div>

          {/* 버튼 영역 (주문하기 & 다시 작성) */}
          <div className="space-y-2.5 pt-1">
            {/* 주문하기 버튼: 갈색 배경(#6b4226), 흰색 글씨, hover시 약간 밝게 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="disabled:opacity-60 disabled:cursor-wait w-full py-3.5 px-4 bg-[#6b4226] hover:bg-[#835332] active:bg-[#59341c] text-white font-bold rounded-xl shadow-md transition-colors duration-200 flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isSubmitting ? '주문 저장 중...' : '주문하기'}</span>
            </button>

            {/* 다시 작성 버튼: 모든 입력과 금액 초기화 */}
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2.5 px-4 bg-[#f5ede4] hover:bg-[#ebdccf] text-[#6b4226] font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>다시 작성</span>
            </button>
          </div>
        </form>

        {/* 주문 확인 메시지: 연두색 배경, 초록 글씨, 둥근 모서리 */}
        {confirmationMessage && (
          <div
            id="confirmation-area"
            role="status"
            className="mt-6 p-4 rounded-xl bg-[#e8f5e9] border border-[#a5d6a7] text-[#1b5e20] shadow-sm transition-all duration-300 animate-fadeIn"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-[#2e7d32] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-[#2e7d32] mb-1">
                  주문 접수가 완료되었습니다!
                </p>
                <p className="text-sm sm:text-base leading-relaxed font-medium break-keep">
                  {confirmationMessage}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
