import React, { useState } from 'react';
import { CatTownFurniture } from '../../types.ts';
import { PixelFurnitureSprite } from './PixelFurnitureSprite.tsx';
import { XuCaIcon } from '../XuCaIcon.tsx';

interface TownFurnitureShopModalProps {
  isOpen: boolean;
  catalog: CatTownFurniture[];
  userBalance: number;
  authToken: string | null;
  onBuyItem: (item: CatTownFurniture) => Promise<void>;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const TownFurnitureShopModal: React.FC<TownFurnitureShopModalProps> = ({
  isOpen,
  catalog,
  userBalance,
  authToken,
  onBuyItem,
  onClose,
  onOpenAuth,
}) => {
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [buyFeedback, setBuyFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBuy = async (item: CatTownFurniture) => {
    if (!authToken) {
      onOpenAuth();
      return;
    }
    if (userBalance < item.price) {
      setBuyFeedback(`Bà không đủ Xu Cá! Cần thêm ${item.price - userBalance} Xu Cá nữa.`);
      setTimeout(() => setBuyFeedback(null), 3000);
      return;
    }

    setBuyingId(item.id);
    setBuyFeedback(null);
    try {
      await onBuyItem(item);
      setBuyFeedback(`✓ Mua thành công ${item.name}! Đã cất vào túi đồ.`);
      setTimeout(() => setBuyFeedback(null), 3000);
    } catch (err: any) {
      setBuyFeedback(err.message || 'Lỗi khi mua món đồ này.');
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#795653]/50 backdrop-blur-xs animate-in fade-in select-none">
      <div
        className="relative w-full max-w-2xl bg-[#FFF9F4] rounded-3xl border-4 border-[#795653] p-5 sm:p-6 shadow-[6px_6px_0px_#795653] flex flex-col max-h-[85vh] overflow-hidden"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#795653]/20">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            <div>
              <h3 className="text-base font-black text-[#795653]" style={{ fontFamily: "'Tiny5', monospace" }}>
                TIỆM NỘI THẤT THỊ TRẤN MÈO
              </h3>
              <p className="text-[10px] text-[#795653]/70 font-semibold">
                Sắm sửa đồ trang trí, nệm êm và đồ chơi cho bé mèo bằng Xu Cá
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Balance Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-[#795653] rounded-xl shadow-[2px_2px_0px_#795653]">
              <XuCaIcon className="w-4 h-4 object-contain inline-block" />
              <span className="text-xs font-black text-[#0A5EB0] tabular-nums" style={{ fontFamily: "'Tiny5', monospace" }}>
                {userBalance.toLocaleString('vi-VN')}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white hover:bg-[#FFE5EC] border-2 border-[#795653] font-black text-sm flex items-center justify-center cursor-pointer active:translate-y-0.5"
            >
              ✕
            </button>
          </div>
        </div>

        {buyFeedback && (
          <div
            className={`my-2 p-2.5 rounded-xl border-2 text-xs font-bold text-center ${
              buyFeedback.startsWith('✓')
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                : 'bg-rose-50 border-rose-400 text-rose-800'
            }`}
          >
            {buyFeedback}
          </div>
        )}

        {/* Catalog Items Grid */}
        <div className="flex-1 overflow-y-auto pr-1 py-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {catalog.map((item) => {
            const canAfford = userBalance >= item.price;
            const isProcessing = buyingId === item.id;

            return (
              <div
                key={item.id}
                className="p-3 bg-white border-2 border-[#795653] rounded-2xl shadow-[2px_2px_0px_#795653] flex flex-col justify-between hover:-translate-y-0.5 transition-transform"
              >
                <div>
                  <div className="w-full h-24 bg-[#FFF9F4] border-2 border-[#795653]/20 rounded-xl flex items-center justify-center mb-2">
                    <PixelFurnitureSprite itemId={item.id} size={52} />
                  </div>
                  <h4 className="text-xs font-black text-[#795653] line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-[#795653]/70 font-semibold line-clamp-2 mt-0.5">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#795653]/15 pt-2">
                  <div className="flex items-center gap-1">
                    <XuCaIcon className="w-4 h-4 object-contain inline-block" />
                    <span className="text-xs font-black text-[#D6336C]">
                      {item.price} Xu
                    </span>
                  </div>

                  <button
                    onClick={() => handleBuy(item)}
                    disabled={isProcessing || !canAfford}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black border-2 border-[#795653] shadow-[1px_1px_0px_#795653] active:translate-y-0.5 cursor-pointer ${
                      canAfford
                        ? 'bg-[#FF8FAB] hover:bg-[#f37898] text-white'
                        : 'bg-neutral-200 text-neutral-500 cursor-not-allowed opacity-60'
                    }`}
                    style={{ fontFamily: "'Tiny5', monospace" }}
                  >
                    {isProcessing ? 'ĐANG MUA...' : canAfford ? 'MUA NGAY' : 'THIẾU XU'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t-2 border-[#795653]/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white hover:bg-[#FFE5EC] border-2 border-[#795653] rounded-xl text-xs font-black text-[#795653] shadow-[2px_2px_0px_#795653] cursor-pointer"
            style={{ fontFamily: "'Tiny5', monospace" }}
          >
            ĐÓNG TIỆM SHOP
          </button>
        </div>
      </div>
    </div>
  );
};
