import React, { useState } from 'react';
import { CatTownUserProfile, CatTownConfig, CatTownPlacedItem } from '../../types.ts';
import { firebaseApi } from '../../firebase.ts';
import { PixelCatSprite } from './PixelCatSprite.tsx';
import { PixelFurnitureSprite } from './PixelFurnitureSprite.tsx';
import { XuCaIcon } from '../XuCaIcon.tsx';

interface CatHouseViewProps {
  authToken: string | null;
  profile: CatTownUserProfile | null;
  config: CatTownConfig | null;
  userBalance: number;
  onRefreshProfile: () => void;
  onOpenShop: () => void;
  onBackToMap: () => void;
  onOpenAuth: () => void;
}

export const CatHouseView: React.FC<CatHouseViewProps> = ({
  authToken,
  profile,
  config,
  userBalance,
  onRefreshProfile,
  onOpenShop,
  onBackToMap,
  onOpenAuth,
}) => {
  const [isEditingHouse, setIsEditingHouse] = useState<boolean>(false);
  const [placedItems, setPlacedItems] = useState<CatTownPlacedItem[]>(
    profile?.house?.placedItems || []
  );
  const [activeTab, setActiveTab] = useState<'cat' | 'house'>('cat');
  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(profile?.cat.name || '');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const cat = profile?.cat;

  // Owned furniture in inventory
  const ownedFurniture = (profile?.inventory || []).filter(
    (item) => item.itemType === 'furniture' || item.itemType === 'toy'
  );

  // Perform cat care action
  const handleCatCare = async (actionType: 'feed' | 'pet' | 'play' | 'bath') => {
    if (!authToken) {
      onOpenAuth();
      return;
    }

    try {
      const res = await firebaseApi('/api/cat-town/action/cat/care', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ actionType }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionFeedback(data.message);
        onRefreshProfile();
        setTimeout(() => setActionFeedback(null), 3000);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  // Rename Cat
  const handleRenameCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !newName.trim()) return;

    try {
      const res = await firebaseApi('/api/cat-town/action/cat/rename', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (res.ok) {
        setShowRenameModal(false);
        onRefreshProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Place item onto grid
  const handlePlaceItem = (furnitureId: string) => {
    // Find first free slot (x: 1-5, y: 1-3)
    const occupied = new Set(placedItems.map((p) => `${p.gridX}-${p.gridY}`));
    let freeX = 1;
    let freeY = 1;
    let found = false;

    for (let y = 1; y <= 3; y++) {
      for (let x = 1; x <= 5; x++) {
        if (!occupied.has(`${x}-${y}`)) {
          freeX = x;
          freeY = y;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      setActionFeedback('Căn phòng đã đầy chỗ! Hãy nhặt bớt một vài món đồ trước nha.');
      return;
    }

    const newItem: CatTownPlacedItem = {
      id: `placed_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      furnitureId,
      gridX: freeX,
      gridY: freeY,
    };

    setPlacedItems([...placedItems, newItem]);
  };

  // Remove item from grid
  const handleRemovePlacedItem = (id: string) => {
    setPlacedItems(placedItems.filter((item) => item.id !== id));
  };

  // Save house layout
  const handleSaveHouseLayout = async () => {
    if (!authToken) return;
    setIsSaving(true);
    try {
      const res = await firebaseApi('/api/cat-town/house/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          placedItems,
        }),
      });

      if (res.ok) {
        setIsEditingHouse(false);
        setActionFeedback('✓ Đã lưu bố cục căn nhà mèo thành công!');
        onRefreshProfile();
        setTimeout(() => setActionFeedback(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="relative w-full max-w-4xl mx-auto flex flex-col items-center select-none"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Top Header Controls */}
      <div className="w-full bg-[#FFF9F4] border-4 border-[#795653] rounded-2xl p-3 mb-4 flex items-center justify-between shadow-[4px_4px_0px_#795653]">
        <button
          onClick={onBackToMap}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FFE5EC] text-[#795653] font-black text-xs rounded-xl border-2 border-[#795653] shadow-[2px_2px_0px_#795653] cursor-pointer active:translate-y-0.5"
          style={{ fontFamily: "'Tiny5', monospace" }}
        >
          <span>←</span>
          <span>BẢN ĐỒ THỊ TRẤN</span>
        </button>

        {/* Tab switch between Cat Care & House Room */}
        <div className="flex bg-[#FFE5EC] p-1 rounded-xl border-2 border-[#795653]">
          <button
            onClick={() => setActiveTab('cat')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'cat'
                ? 'bg-white text-[#D6336C] shadow-[1px_1px_0px_#795653]'
                : 'text-[#795653]/70 hover:text-[#795653]'
            }`}
            style={{ fontFamily: "'Tiny5', monospace" }}
          >
            🐱 BÉ MÈO CƯNG
          </button>
          <button
            onClick={() => setActiveTab('house')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'house'
                ? 'bg-white text-[#D6336C] shadow-[1px_1px_0px_#795653]'
                : 'text-[#795653]/70 hover:text-[#795653]'
            }`}
            style={{ fontFamily: "'Tiny5', monospace" }}
          >
            🏡 CĂN NHÀ NHỎ
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-[#795653] rounded-xl shadow-[2px_2px_0px_#795653]">
          <XuCaIcon className="w-4 h-4 object-contain inline-block" />
          <span className="text-xs font-black text-[#0A5EB0] tabular-nums" style={{ fontFamily: "'Tiny5', monospace" }}>
            {userBalance.toLocaleString('vi-VN')}
          </span>
        </div>
      </div>

      {actionFeedback && (
        <div className="w-full mb-3 p-3 rounded-2xl bg-[#FFE5EC] border-2 border-[#FF8FAB] text-[#795653] font-bold text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <span>💖 {actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-[#D6336C] font-black cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* ================= TAB 1: CAT CARE ================= */}
      {activeTab === 'cat' && cat && (
        <div className="w-full bg-[#FFF9F4] border-4 border-[#795653] rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0px_#795653] flex flex-col md:flex-row items-center gap-6">
          {/* Left: Animated Cat & Room Spot */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 bg-[#FFE5EC] border-4 border-[#795653] rounded-3xl shadow-[4px_4px_0px_#795653] flex flex-col items-center justify-center p-4 overflow-hidden">
              {/* Floating cozy hearts */}
              <div className="absolute top-2 right-3 text-xs animate-pulse">💖</div>
              <div className="absolute top-4 left-3 text-xs animate-bounce">✨</div>

              {/* Cat sprite */}
              <PixelCatSprite
                breed={cat.breed}
                color={cat.coatColor}
                mood={cat.mood}
                size={110}
              />

              {/* Wooden Cushion Platform */}
              <div className="w-28 h-5 bg-[#FF8FAB] border-2 border-[#795653] rounded-full shadow-[2px_2px_0px_#795653] -mt-2 flex items-center justify-center">
                <span className="text-[10px] text-white font-black tracking-wider">
                  NỆM ÊM
                </span>
              </div>
            </div>

            {/* Cat Name & Breed */}
            <div className="mt-3 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="text-base font-black text-[#D6336C]" style={{ fontFamily: "'Tiny5', monospace" }}>
                  {cat.name}
                </h3>
                <button
                  onClick={() => setShowRenameModal(true)}
                  title="Đổi tên bé mèo"
                  className="px-1.5 py-0.5 bg-white border border-[#795653]/30 rounded-md text-[10px] font-bold hover:bg-[#FFE5EC] cursor-pointer"
                >
                  ✏️
                </button>
              </div>
              <span className="text-xs font-bold text-[#795653]/70">
                {cat.breed} • Ngày nhận nuôi: {cat.bornDate}
              </span>
            </div>
          </div>

          {/* Right: Stats & Care Actions */}
          <div className="flex-1 w-full space-y-4">
            {/* Status Bars */}
            <div className="space-y-2.5 bg-white p-4 rounded-2xl border-2 border-[#795653] shadow-[2px_2px_0px_#795653]">
              <h4 className="text-xs font-black text-[#795653] uppercase" style={{ fontFamily: "'Tiny5', monospace" }}>
                Chỉ Số Hạnh Phúc Của Bé
              </h4>

              {/* Happiness */}
              <div>
                <div className="flex justify-between text-[11px] font-bold text-[#795653] mb-0.5">
                  <span>Vui vẻ:</span>
                  <span className="font-black text-[#D6336C]">{cat.happiness}/100</span>
                </div>
                <div className="w-full h-3 bg-[#E5E7EB] rounded-full border border-[#795653]/30 overflow-hidden">
                  <div
                    className="h-full bg-[#FF8FAB] transition-all"
                    style={{ width: `${cat.happiness}%` }}
                  />
                </div>
              </div>

              {/* Energy */}
              <div>
                <div className="flex justify-between text-[11px] font-bold text-[#795653] mb-0.5">
                  <span>Năng lượng:</span>
                  <span className="font-black text-[#F7B801]">{cat.energy}/100</span>
                </div>
                <div className="w-full h-3 bg-[#E5E7EB] rounded-full border border-[#795653]/30 overflow-hidden">
                  <div
                    className="h-full bg-[#F7DDA0] transition-all"
                    style={{ width: `${cat.energy}%` }}
                  />
                </div>
              </div>

              {/* Affection */}
              <div>
                <div className="flex justify-between text-[11px] font-bold text-[#795653] mb-0.5">
                  <span>Thân thiết:</span>
                  <span className="font-black text-[#7209B7]">{cat.affection}/100</span>
                </div>
                <div className="w-full h-3 bg-[#E5E7EB] rounded-full border border-[#795653]/30 overflow-hidden">
                  <div
                    className="h-full bg-[#CDB4DB] transition-all"
                    style={{ width: `${cat.affection}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Interactive Care Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => handleCatCare('feed')}
                className="p-3 bg-[#FFE5EC] hover:bg-[#FFCCD5] active:translate-y-0.5 border-2 border-[#795653] rounded-2xl shadow-[2px_2px_0px_#795653] flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-xl">🥣</span>
                <span className="text-[11px] font-black text-[#795653]" style={{ fontFamily: "'Tiny5', monospace" }}>
                  CHO ĂN
                </span>
              </button>

              <button
                onClick={() => handleCatCare('pet')}
                className="p-3 bg-[#FFC2D1] hover:bg-[#ffaec2] active:translate-y-0.5 border-2 border-[#795653] rounded-2xl shadow-[2px_2px_0px_#795653] flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-xl">🫳</span>
                <span className="text-[11px] font-black text-[#795653]" style={{ fontFamily: "'Tiny5', monospace" }}>
                  VUỐT VE
                </span>
              </button>

              <button
                onClick={() => handleCatCare('play')}
                className="p-3 bg-[#F7DDA0] hover:bg-[#f5cf80] active:translate-y-0.5 border-2 border-[#795653] rounded-2xl shadow-[2px_2px_0px_#795653] flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-xl">🧶</span>
                <span className="text-[11px] font-black text-[#795653]" style={{ fontFamily: "'Tiny5', monospace" }}>
                  CHƠI ĐÙA
                </span>
              </button>

              <button
                onClick={() => handleCatCare('bath')}
                className="p-3 bg-[#A9C5F2] hover:bg-[#92b3e8] active:translate-y-0.5 border-2 border-[#795653] rounded-2xl shadow-[2px_2px_0px_#795653] flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-xl">🧼</span>
                <span className="text-[11px] font-black text-[#1E3A8A]" style={{ fontFamily: "'Tiny5', monospace" }}>
                  TẮM RỬA
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: HOUSE INTERIOR & DECORATION ================= */}
      {activeTab === 'house' && (
        <div className="w-full bg-[#FFF9F4] border-4 border-[#795653] rounded-3xl p-5 shadow-[6px_6px_0px_#795653] flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-[#795653]" style={{ fontFamily: "'Tiny5', monospace" }}>
                PHÒNG KHÁCH MÈO CƯNG (LƯỚI 5x3)
              </h3>
              <p className="text-[11px] text-[#795653]/70 font-semibold">
                {isEditingHouse
                  ? 'Bấm vào đồ đạc để nhặt lại hoặc bấm vào vật phẩm dưới kho để đặt vào phòng.'
                  : 'Trang trí căn phòng ấm áp cho mèo bằng các món nội thất xinh xắn.'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onOpenShop}
                className="px-3 py-1.5 bg-[#FF8FAB] hover:bg-[#f37898] active:translate-y-0.5 text-white font-black text-xs rounded-xl border-2 border-[#795653] shadow-[2px_2px_0px_#795653] cursor-pointer"
              >
                🛍️ MUA ĐỒ NỘI THẤT
              </button>

              {!isEditingHouse ? (
                <button
                  onClick={() => setIsEditingHouse(true)}
                  className="px-3 py-1.5 bg-[#F7DDA0] hover:bg-[#f5cf80] active:translate-y-0.5 text-[#795653] font-black text-xs rounded-xl border-2 border-[#795653] shadow-[2px_2px_0px_#795653] cursor-pointer"
                  style={{ fontFamily: "'Tiny5', monospace" }}
                >
                  ✏️ BỐ TRÍ PHÒNG
                </button>
              ) : (
                <button
                  onClick={handleSaveHouseLayout}
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-[#06D6A0] hover:bg-[#05b587] active:translate-y-0.5 text-[#1E3A8A] font-black text-xs rounded-xl border-2 border-[#795653] shadow-[2px_2px_0px_#795653] cursor-pointer"
                  style={{ fontFamily: "'Tiny5', monospace" }}
                >
                  {isSaving ? 'ĐANG LƯU...' : '💾 LƯU BỐ CỤC'}
                </button>
              )}
            </div>
          </div>

          {/* 5x3 Isometric Room Grid */}
          <div
            className="w-full h-72 sm:h-80 bg-[#E9D8A6] rounded-2xl border-4 border-[#795653] shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] p-4 relative overflow-hidden flex flex-col justify-between"
            style={{
              backgroundImage: 'radial-gradient(#BC6C25 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            {/* Wallpaper wall banner */}
            <div className="w-full h-14 bg-[#FFE5EC] border-b-2 border-[#795653] rounded-t-lg -mt-2 flex items-center justify-between px-4">
              <span className="text-xs">🪟</span>
              <span className="text-xs font-bold text-[#D6336C]/60">MÈO MÊ CÁ KHÔ RESIDENCE</span>
              <span className="text-xs">🖼️</span>
            </div>

            {/* Room Floor with Grid Slots */}
            <div className="flex-1 grid grid-cols-5 grid-rows-3 gap-2 p-2 mt-1 relative">
              {/* Render Cat on floor */}
              <div className="absolute bottom-4 left-6 z-10 pointer-events-none">
                <PixelCatSprite breed={cat?.breed || 'Mèo Cam'} size={56} />
              </div>

              {/* Grid Cells */}
              {Array.from({ length: 15 }).map((_, idx) => {
                const x = (idx % 5) + 1;
                const y = Math.floor(idx / 5) + 1;
                const placed = placedItems.find((p) => p.gridX === x && p.gridY === y);

                return (
                  <div
                    key={idx}
                    className={`relative rounded-xl flex items-center justify-center transition-all ${
                      isEditingHouse
                        ? 'border-2 border-dashed border-[#795653]/40 bg-white/20 hover:bg-white/40'
                        : ''
                    }`}
                  >
                    {placed && (
                      <div className="relative group">
                        <PixelFurnitureSprite itemId={placed.furnitureId} size={48} />
                        {isEditingHouse && (
                          <button
                            onClick={() => handleRemovePlacedItem(placed.id)}
                            title="Cất vào kho đồ"
                            className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-[9px] font-black flex items-center justify-center cursor-pointer shadow-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Editing Tray: Select owned furniture to place */}
          {isEditingHouse && (
            <div className="mt-4 p-3 bg-white border-2 border-[#795653] rounded-2xl">
              <h4 className="text-xs font-black text-[#795653] mb-2" style={{ fontFamily: "'Tiny5', monospace" }}>
                KHO ĐỒ NỘI THẤT CỦA BÀ (BẤM ĐỂ ĐẶT LÊN PHÒNG):
              </h4>
              {ownedFurniture.length === 0 ? (
                <div className="text-xs text-[#795653]/60 italic">
                  Bà chưa sở hữu món nội thất nào trong túi đồ. Hãy ghé Tiệm Nội Thất để mua nhé!
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {ownedFurniture.map((furn) => (
                    <button
                      key={furn.id}
                      onClick={() => handlePlaceItem(furn.itemId)}
                      className="p-2 bg-[#FFF9F4] hover:bg-[#FFE5EC] border-2 border-[#795653] rounded-xl flex flex-col items-center gap-1 cursor-pointer min-w-[70px]"
                    >
                      <PixelFurnitureSprite itemId={furn.itemId} size={36} />
                      <span className="text-[10px] font-black text-[#795653] truncate max-w-[60px]">
                        {furn.name}
                      </span>
                      <span className="text-[9px] text-[#D6336C] font-bold">+ Đặt</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#795653]/50 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-[#FFF9F4] rounded-3xl border-4 border-[#795653] p-6 shadow-[6px_6px_0px_#795653]">
            <h3 className="text-sm font-black text-[#D6336C] mb-2" style={{ fontFamily: "'Tiny5', monospace" }}>
              ĐỔI TÊN CHO BÉ MÈO
            </h3>
            <form onSubmit={handleRenameCat} className="space-y-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={30}
                placeholder="Nhập tên mới đáng yêu..."
                className="w-full px-3 py-2 bg-white rounded-xl border-2 border-[#795653] text-xs font-bold text-[#795653]"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="flex-1 py-2 bg-white border-2 border-[#795653] rounded-xl text-xs font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#FF8FAB] text-white border-2 border-[#795653] rounded-xl text-xs font-black cursor-pointer shadow-[2px_2px_0px_#795653]"
                >
                  Lưu Tên Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
