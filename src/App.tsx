/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { OrderForm } from './components/OrderForm';
import { OrderBoard } from './components/OrderBoard';
import { OrderItem } from './types';

/**
 * 바이브 카페 메인 어플리케이션
 * - 카페 감성의 베이지(#faf6f0) 및 브라운(#6b4226) 테마
 * - 최대 너비 520px 가운데 정렬
 * - 실시간 금액 계산 주문서 및 주문 현황 게시판
 */
export default function App() {
  // 1. 활성 탭 상태 관리 ('order': 주문서, 'board': 게시판)
  const [activeTab, setActiveTab] = useState<'order' | 'board'>('order');

  // 2. 주문 내역 목록 (초기 가짜 데이터 2건 포함하여 게시판 바로 확인 가능)
  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: 'demo-1',
      customerName: '홍길동',
      phone: '010-1234-5678',
      drinkId: 'caffe_latte',
      drinkName: '카페라떼',
      size: 'M',
      options: ['샷 추가'],
      quantity: 1,
      requests: '얼음 적게 부탁드려요!',
      totalPrice: 5000,
      orderStatus: '접수완료',
      createdAt: '오전 10:15',
    },
    {
      id: 'demo-2',
      customerName: '이영희',
      phone: '010-9876-5432',
      drinkId: 'americano',
      drinkName: '아메리카노',
      size: 'L',
      options: ['디카페인'],
      quantity: 2,
      requests: '캐리어에 담아주세요.',
      totalPrice: 9000,
      orderStatus: '제조중',
      createdAt: '오전 10:20',
    },
  ]);

  // 새 주문 추가 핸들러
  const handleAddOrder = (newOrder: OrderItem) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  // 주문 삭제 핸들러
  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // 주문 상태 업데이트 핸들러 (접수완료 -> 제조중 -> 준비완료)
  const handleUpdateStatus = (orderId: string, nextStatus: OrderItem['orderStatus']) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, orderStatus: nextStatus } : order))
    );
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
