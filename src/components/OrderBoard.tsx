import React from 'react';
import { OrderItem } from '../types';
import { Coffee, Trash2, Clock, CheckCircle2, ChevronRight, PlusCircle } from 'lucide-react';

interface OrderBoardProps {
  orders: OrderItem[];
  onDeleteOrder: (id: string) => void;
  onUpdateStatus: (id: string, nextStatus: OrderItem['orderStatus']) => void;
  onGoToOrder: () => void;
}

/**
 * 실시간 카페 주문 게시판 컴포넌트
 * - 고객들의 주문 내역을 실시간으로 확인하고 관리할 수 있는 게시판
 * - 접수완료 -> 제조중 -> 준비완료 순차 상태 변경 지원
 */
export const OrderBoard: React.FC<OrderBoardProps> = ({
  orders,
  onDeleteOrder,
  onUpdateStatus,
  onGoToOrder,
}) => {
  const getStatusBadge = (status: OrderItem['orderStatus']) => {
    switch (status) {
      case '접수완료':
        return 'bg-[#fff3e0] text-[#e65100] border-[#ffe082]';
      case '제조중':
        return 'bg-[#e1f5fe] text-[#0277bd] border-[#81d4fa]';
      case '준비완료':
        return 'bg-[#e8f5e9] text-[#2e7d32] border-[#a5d6a7]';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getNextStatus = (current: OrderItem['orderStatus']): OrderItem['orderStatus'] => {
    if (current === '접수완료') return '제조중';
    if (current === '제조중') return '준비완료';
    return '접수완료';
  };

  return (
    <div className="w-full max-w-[520px] mx-auto px-4 pb-12">
      <div className="bg-[#fffdfa] rounded-2xl shadow-[0_4px_20px_rgba(107,66,38,0.08)] border border-[#ebdccf] p-6">
        
        {/* 게시판 상단 제목 및 카운터 */}
        <div className="flex items-center justify-between border-b border-[#f0e4d8] pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#6b4226]" />
            <h2 className="text-lg font-bold text-[#6b4226]">실시간 주문 게시판</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#6b4226]/10 text-[#6b4226]">
            총 {orders.length}건
          </span>
        </div>

        {/* 주문 내역이 없을 때 */}
        {orders.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="text-4xl mb-3">☕</div>
            <p className="text-[#6b4226] font-bold text-base mb-1">
              아직 접수된 주문이 없습니다
            </p>
            <p className="text-xs text-[#8d6e53] mb-5">
              주문서를 작성하면 실시간으로 게시판에 등록됩니다.
            </p>
            <button
              type="button"
              onClick={onGoToOrder}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#6b4226] text-white text-sm font-semibold rounded-xl hover:bg-[#835332] transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>첫 주문 작성하기</span>
            </button>
          </div>
        ) : (
          /* 주문 리스트 */
          <div className="space-y-3.5">
            {orders.map((order) => {
              const nextStatus = getNextStatus(order.orderStatus);
              return (
                <div
                  key={order.id}
                  className="p-4 rounded-xl bg-white border border-[#ebdccf] hover:border-[#cfb7a4] transition-shadow shadow-xs hover:shadow-sm"
                >
                  {/* 상단: 고객 이름, 접수 시간, 상태 배지 */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-[#4a2e1b]">
                        {order.customerName} 고객님
                      </span>
                      <span className="text-xs text-[#a08269]">
                        {order.createdAt}
                      </span>
                    </div>

                    {/* 상태 변경 버튼 */}
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(order.id, nextStatus)}
                      title={`클릭하여 '${nextStatus}' 상태로 변경`}
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition cursor-pointer flex items-center gap-1 ${getStatusBadge(
                        order.orderStatus
                      )}`}
                    >
                      <span>{order.orderStatus}</span>
                      <ChevronRight className="w-3 h-3 opacity-60" />
                    </button>
                  </div>

                  {/* 중간: 메뉴, 사이즈, 옵션, 수량 */}
                  <div className="text-sm text-[#332211] font-medium mb-1.5">
                    <span className="text-[#6b4226] font-bold">{order.drinkName}</span>
                    <span className="text-xs text-[#7d5e46] ml-1.5 bg-[#f5ede4] px-1.5 py-0.5 rounded">
                      {order.size}사이즈
                    </span>
                    {order.options.length > 0 && (
                      <span className="text-xs text-[#8d6e53] ml-1.5">
                        ({order.options.join(', ')})
                      </span>
                    )}
                    <span className="text-xs font-bold text-[#6b4226] ml-2">
                      {order.quantity}잔
                    </span>
                  </div>

                  {/* 요청사항 (있는 경우) */}
                  {order.requests && (
                    <div className="text-xs text-[#6e5441] bg-[#faf6f0] p-2 rounded-md mb-2 border border-[#eddcd0]">
                      <span className="font-semibold text-[#8d6e53]">요청: </span>
                      {order.requests}
                    </div>
                  )}

                  {/* 하단: 연락처, 총 금액, 삭제 버튼 */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#f4ece3] mt-2">
                    <span className="text-[#997b66]">
                      {order.phone ? `연락처: ${order.phone}` : '연락처 미입력'}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#6b4226] text-sm">
                        {order.totalPrice.toLocaleString()}원
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteOrder(order.id)}
                        className="text-[#b58b73] hover:text-[#d32f2f] transition p-1 cursor-pointer"
                        title="주문 내역 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 게시판 하단 새 주문 작성 버튼 바로가기 */}
        <div className="mt-5 pt-4 border-t border-[#f0e4d8] flex justify-center">
          <button
            type="button"
            onClick={onGoToOrder}
            className="w-full py-2.5 text-center text-sm font-semibold text-[#6b4226] bg-[#f5ede4] hover:bg-[#ebdccf] rounded-xl transition cursor-pointer"
          >
            + 새 주문 작성하기
          </button>
        </div>

      </div>
    </div>
  );
};
