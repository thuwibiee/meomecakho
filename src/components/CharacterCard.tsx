import React from 'react';
import { Character } from '../types.ts';
import { Check, BookOpen, AlertTriangle, MessageSquareHeart } from 'lucide-react';
import { XuCaIcon } from './XuCaIcon.tsx';

interface CharacterCardProps {
  character: Character & { isOwned?: boolean };
  onBuy: (character: Character) => void;
  onViewDetails: (character: Character) => void;
  onGoToInventory?: () => void;
  onOpenStory?: (character: Character) => void;
  onOpenComplain?: (character: Character) => void;
  onOpenFitBach?: (character: Character) => void;
  onAdminEdit?: (character: Character) => void;
  isAdmin?: boolean;
  isProcessing?: boolean;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onBuy,
  onViewDetails,
  onGoToInventory,
  onOpenStory,
  onOpenComplain,
  onOpenFitBach,
  onAdminEdit,
  isAdmin = false,
  isProcessing = false,
}) => {
  return (
    <div
      onClick={() => onViewDetails(character)}
      className="group relative flex flex-col bg-[#FFF9F4] rounded-3xl border-2 border-[#795653]/30 shadow-kawaii hover:shadow-kawaii-hover transition-all duration-300 overflow-hidden cursor-pointer p-4 hover:-translate-y-1"
    >
      {/* (1) Ảnh đại diện nhân vật: điểm thu hút chính, giữ đúng tỷ lệ khung hình */}
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#F6A6B8]/10 border border-[#795653]/20 mb-3.5">
        <img
          src={character.avatarUrl}
          alt={character.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = 'w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF9F4] to-[#F6A6B8]/30 p-4 text-center';
              fallback.innerHTML = `
                <div class="text-4xl mb-2">✨</div>
                <div class="font-bold text-[#795653]">${character.name}</div>
                <div class="text-xs text-[#795653]/70">${character.category}</div>
              `;
              parent.appendChild(fallback);
            }
          }}
        />

        {/* Admin Quick Edit Button right on card */}
        {isAdmin && onAdminEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdminEdit(character);
            }}
            className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 bg-[#F7DDA0] hover:bg-[#ffe7b3] text-[#795653] px-2.5 py-1 rounded-full text-xs font-black shadow-xs border border-[#795653]/30 cursor-pointer active:scale-95 transition-all"
            title="Chỉnh sửa thông tin nam chính này"
          >
            <span>✏️</span>
            <span>Sửa</span>
          </button>
        )}

        {/* Subtle owned badge over image if owned */}
        {character.isOwned && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[#A9C5F2] text-[#526C91] px-2.5 py-1 rounded-full text-xs font-bold shadow-xs border border-[#526C91]/30">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>ĐÃ THANH TOÁN</span>
          </div>
        )}
      </div>

      {/* (2) Họ và tên nhân vật */}
      <h3
        className="text-lg font-extrabold tracking-tight group-hover:text-[#A6536A] transition-colors line-clamp-1"
        style={{ fontFamily: "'Cal Sans', sans-serif", color: '#E13F7C' }}
      >
        {character.name}
      </h3>

      {/* (3) Tuổi & (4) Danh mục / Thể loại (Category tag) */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#795653]/75 mt-1 mb-2.5">
        <span style={{ fontFamily: "'Cal Sans', sans-serif", fontWeight: 'normal', color: '#ff6fb2' }}>{character.age} tuổi</span>
        <span aria-hidden="true" className="text-[#F6A6B8] font-bold">·</span>
        <span style={{ fontFamily: "'Cal Sans', sans-serif", color: '#599bc2' }}>{character.category}</span>
      </div>

      {/* (5) Khung nội dung riêng chứa vài dòng giới thiệu ngắn (short bio/hook) */}
      <div
        className="bg-[#FFF9F4] rounded-xl border border-[#795653]/15 p-2.5 text-xs text-[#795653]/85 leading-relaxed mb-3 line-clamp-3 min-h-[4.25rem]"
        style={{ fontFamily: "'Cal Sans', sans-serif", fontWeight: 'normal' }}
      >
        {character.shortBio}
      </div>

      {/* (6) Giá bán bằng Xu Cá (kèm icon xu cá) */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed border-[#795653]/20 mb-2.5">
        <span style={{ fontFamily: "'Cal Sans', sans-serif", fontSize: '16px', fontWeight: 'bold', color: '#E13F7C' }}>Giá:</span>
        <div className="flex items-center gap-1.5 font-black text-base text-[#526C91]">
          <span className="tabular-nums" style={{ color: '#E13F7C' }}>{character.price}</span>
          <XuCaIcon
            className="w-6.5 h-6.5 object-contain shrink-0"
            style={{ width: '26px', height: '26px', marginLeft: '-3px', marginTop: '-2px' }}
          />
        </div>
      </div>

      {/* Cụm 4 nút chức năng bố cục lưới 2:2 (STORY · COMPLAIN · FÍT BÁCH · MUA CÁ 𓆜) */}
      <div
        className="w-full mt-2"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
        }}
      >
        {/* Nút 1: STORY */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenStory?.(character);
          }}
          className="w-full h-9 px-2 rounded-full bg-white hover:bg-[#526C91]/10 text-[#526C91] font-bold text-xs border border-[#526C91] transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
          title="Xem cốt truyện & phân cảnh mở đầu"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#526C91] shrink-0" />
          <span style={{ fontFamily: "'Quicksand', sans-serif", fontSize: '13px', fontWeight: 'bold' }}>STORY</span>
        </button>

        {/* Nút 2: COMPLAIN */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenComplain?.(character);
          }}
          className="w-full h-9 px-2 rounded-full bg-white hover:bg-amber-50 text-[#D97706] font-bold text-xs border border-[#D97706] transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
          title="Báo lỗi nhân vật"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
          <span style={{ fontFamily: "'Quicksand', sans-serif", fontSize: '13px' }}>COMPLAIN</span>
        </button>

        {/* Nút 3: FÍT BÁCH */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenFitBach?.(character);
          }}
          className="w-full h-9 px-2 rounded-full bg-white hover:bg-[#F6A6B8]/15 text-[#A6536A] font-bold text-xs border border-[#A6536A] transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
          title="FÍT BÁCH"
        >
          <MessageSquareHeart className="w-3.5 h-3.5 text-[#A6536A] shrink-0" />
          <span style={{ fontFamily: "'Quicksand', sans-serif", fontSize: '13px' }}>FÍT BÁCH</span>
        </button>

        {/* Nút 4: MUA CÁ 𓆜 -> VÀO KHO (sau khi mua) */}
        {character.isOwned ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onGoToInventory) onGoToInventory();
            }}
            className="w-full h-9 px-2 rounded-full bg-[#95BDFF] hover:bg-[#83b1fa] text-[#0A5EB0] font-black text-xs tracking-wide shadow-xs hover:shadow-md transition-all duration-200 border border-[#95BDFF] active:scale-95 flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
            title="Đã rước về giỏ cá - Nhấn để vào Giỏ Cá"
          >
            <span style={{ fontFamily: "'Quicksand', sans-serif", fontSize: '14px' }}>VÀO GIỎ</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={isProcessing}
            onClick={(e) => {
              e.stopPropagation();
              onBuy(character);
            }}
            className="liquid-glass-btn relative w-full h-9 px-2 rounded-full text-[#795653] font-black text-xs tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap overflow-hidden"
            title="Rước em cá về giỏ"
          >
            <span className="shimmer-liquid" />
            <span className="relative z-10 flex items-center gap-1">
              {isProcessing ? (
                <span className="inline-block animate-pulse text-[11px]">ĐANG XỬ LÝ...</span>
              ) : (
                <span style={{ fontFamily: "'Quicksand', sans-serif", fontSize: '14px' }}>MUA CÁ 𓆜</span>
              )}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
