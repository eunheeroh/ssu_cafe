import React from 'react';
import { Coffee, ClipboardList } from 'lucide-react';

interface HeaderProps {
  activeTab: 'order' | 'board';
  setActiveTab: (tab: 'order' | 'board') => void;
  orderCount: number;
}

/**
 * 카페 헤더 컴포넌트
 * - 카페 로고: ☕ 이모지 크게
 * - 카페 이름: "바이브 카페"
 * - 부제: "당신의 하루에 바이브를 더하다"
 */
export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, orderCount }) => {
  return (
    <header className="text-center pt-8 pb-6 px-4">
      {/* 카페 로고: ☕ 이모지 크게 (부드러운 호버 및 그림자 효과) */}
      <div className="inline-block transition-transform duration-300 hover:scale-110 mb-2 cursor-pointer select-none">
        <span className="text-6xl sm:text-7xl block filter drop-shadow-sm" role="img" aria-label="바이브 카페 커피">
          ☕
        </span>
      </div>

      {/* 카페 이름 */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#6b4226] tracking-tight mb-2">
        바이브 카페
      </h1>

      {/* 부제 */}
      <p className="text-sm sm:text-base font-medium text-[#8d6e53] mb-6">
        당신의 하루에 바이브를 더하다
      </p>

      {/* 상단 네비게이션 탭 (주문서 작성 / 실시간 게시판) */}
      <nav aria-label="메뉴 탭" className="inline-flex p-1.5 bg-[#eedfcf]/60 backdrop-blur-sm rounded-xl border border-[#e2d0bf] shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('order')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'order'
              ? 'bg-[#6b4226] text-white shadow-sm'
              : 'text-[#6b4226] hover:bg-[#6b4226]/10'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>주문서 작성</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('board')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer relative ${
            activeTab === 'board'
              ? 'bg-[#6b4226] text-white shadow-sm'
              : 'text-[#6b4226] hover:bg-[#6b4226]/10'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>주문 게시판</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            activeTab === 'board' ? 'bg-[#96633e] text-white' : 'bg-[#6b4226]/20 text-[#6b4226]'
          }`}>
            {orderCount}
          </span>
        </button>
      </nav>
    </header>
  );
};

