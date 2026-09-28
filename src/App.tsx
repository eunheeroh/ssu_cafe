/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { OrderForm } from './components/OrderForm';
import { OrderBoard } from './components/OrderBoard';
import { OrderItem } from './types';
import { deleteOrder, fetchOrders, insertOrder, updateOrderStatus } from './lib/supabase';

/**
 * 바이브 카페 메인 어플리케이션
 * - 카페 감성의 베이지(#faf6f0) 및 브라운(#6b4226) 테마
 * - 최대 너비 520px 가운데 정렬
 * - 실시간 금액 계산 주문서 및 주문 현황 게시판
 * - 주문 데이터는 Supabase cafe_menu 테이블에 저장
 */
export default function App() {
  // 1. 활성 탭 상태 관리 ('order': 주문서, 'board': 게시판)
  const [activeTab, setActiveTab] = useState<'order' | 'board'>('order');

  // 2. 주문 내역 목록 (Supabase에서 불러옴)
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 최초 진입 시 Supabase에서 주문 목록 불러오기
  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch((err) => {
        console.error('[Supabase] 주문 목록 조회 실패:', err);
        setLoadError(`주문 목록을 불러오지 못했습니다: ${err.message}`);
      });
  }, []);

  // 새 주문 추가 핸들러 (DB 저장 성공 시 목록에 반영, 실패 시 에러를 OrderForm으로 전달)
  const handleAddOrder = async (newOrder: OrderItem) => {
    const saved = await insertOrder(newOrder);
    setOrders((prev) => [saved, ...prev]);
  };

  // 주문 삭제 핸들러
  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err: any) {
      console.error('[Supabase] 주문 삭제 실패:', err);
      alert(`주문 삭제에 실패했습니다: ${err.message}`);
    }
  };

  // 주문 상태 업데이트 핸들러 (접수완료 -> 제조중 -> 준비완료)
  const handleUpdateStatus = async (orderId: string, nextStatus: OrderItem['orderStatus']) => {
    try {
      await updateOrderStatus(orderId, nextStatus);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, orderStatus: nextStatus } : order))
      );
    } catch (err: any) {
      console.error('[Supabase] 주문 상태 변경 실패:', err);
      alert(`주문 상태 변경에 실패했습니다: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6f0] text-[#332211] flex flex-col font-['맑은_고딕','Malgun_Gothic','Noto_Sans_KR',sans-serif]">
      {/* 카페 상단 헤더 영역 */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        orderCount={orders.length}
      />

      {/* 메인 콘텐츠 영역 (최대 너비 520px, 가운데 정렬) */}
      <main className="flex-1 w-full max-w-[520px] mx-auto">
        {loadError && (
          <div role="alert" className="mx-4 mb-4 p-3 rounded-lg bg-[#fff1f0] border border-[#ffccc7] text-[#cf1322] text-sm">
            {loadError}
          </div>
        )}

        {activeTab === 'order' && (
          <OrderForm onAddOrder={handleAddOrder} />
        )}

        {activeTab === 'board' && (
          <OrderBoard
            orders={orders}
            onDeleteOrder={handleDeleteOrder}
            onUpdateStatus={handleUpdateStatus}
            onGoToOrder={() => setActiveTab('order')}
          />
        )}
      </main>

      {/* 하단 푸터 */}
      <footer className="w-full max-w-[520px] mx-auto px-4 py-6 text-center text-xs text-[#9d8370] border-t border-[#ebdccf]/60">
        <p className="font-medium">바이브 카페 (Vibe Cafe) · 당신의 하루에 바이브를 더하다</p>
        <p className="mt-1 text-[11px] text-[#b39e8e]">
          운영시간 08:00 ~ 21:00 · 문의: 02-123-4567
        </p>
      </footer>
    </div>
  );
}
