import React, { useState, useEffect, useRef } from 'react';
import { CatTownFish, CatTownUserProfile } from '../../types.ts';
import { firebaseApi } from '../../firebase.ts';
import { PixelFishSprite } from './PixelFishSprite.tsx';
import { PixelCatSprite } from './PixelCatSprite.tsx';
import { XuCaIcon } from '../XuCaIcon.tsx';

interface FishingMinigameProps {
  authToken: string | null;
  profile: CatTownUserProfile | null;
  userBalance: number;
  onBalanceUpdated: (newBal: number) => void;
  onRefreshProfile: () => void;
  onBackToMap: () => void;
  onOpenAuth: () => void;
}

export const FishingMinigame: React.FC<FishingMinigameProps> = ({
  authToken,
  profile,
  userBalance,
  onBalanceUpdated,
  onRefreshProfile,
  onBackToMap,
  onOpenAuth,
}) => {
  // Game states: 'idle' | 'casting' | 'waiting' | 'hooked' | 'reeling' | 'caught' | 'lost'
  const [gameState, setGameState] = useState<'idle' | 'casting' | 'waiting' | 'hooked' | 'reeling' | 'caught' | 'lost'>('idle');
  const [gaugePosition, setGaugePosition] = useState<number>(10);
  const [gaugeDirection, setGaugeDirection] = useState<'right' | 'left'>('right');
  const [targetZone, setTargetZone] = useState<{ start: number; end: number }>({ start: 35, end: 65 });
  const [caughtFishData, setCaughtFishData] = useState<{ fish: CatTownFish; weight: number; rewardCoins: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);

  const animationRef = useRef<number | null>(null);
  const waitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Remaining daily turns
  const dailyLimit = 12;
  const turnsUsed = profile?.dailyFishingCount || 0;
  const turnsRemaining = Math.max(0, dailyLimit - turnsUsed);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current);
    };
  }, []);

  // Moving slider animation during reeling phase
  useEffect(() => {
    if (gameState === 'reeling') {
      const step = () => {
        setGaugePosition((prev) => {
          let next = prev + (gaugeDirection === 'right' ? 2.5 : -2.5);
          if (next >= 95) {
            setGaugeDirection('left');
            return 95;
          }
          if (next <= 5) {
            setGaugeDirection('right');
            return 5;
          }
          return next;
        });
        animationRef.current = requestAnimationFrame(step);
      };
      animationRef.current = requestAnimationFrame(step);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameState, gaugeDirection]);

  // Handle Start Cast
  const handleStartCast = () => {
    if (!authToken) {
      onOpenAuth();
      return;
    }
    if (turnsRemaining <= 0) {
      setErrorMessage(`Bà đã hết lượt câu hôm nay rồi (${dailyLimit}/${dailyLimit})! Nghỉ ngơi mai câu tiếp nhé 🐟`);
      return;
    }

    setErrorMessage(null);
    setCaughtFishData(null);
    setGameState('waiting');

    // Random bite time between 1.5s - 3s
    const biteDelay = Math.floor(Math.random() * 1500) + 1500;
    waitTimeoutRef.current = setTimeout(() => {
      // Trigger bite!
      setGameState('hooked');
      // Set random target sweet spot zone
      const zoneWidth = 28;
      const start = Math.floor(Math.random() * (70 - zoneWidth)) + 15;
      setTargetZone({ start, end: start + zoneWidth });

      // Automatically move to reeling phase
      setTimeout(() => {
        setGameState('reeling');
      }, 600);
    }, biteDelay);
  };

  // Handle Reel In Click
  const handleReelIn = async () => {
    if (gameState !== 'reeling') return;

    // Check if slider is inside target zone
    const isSuccess = gaugePosition >= targetZone.start && gaugePosition <= targetZone.end;

    if (!isSuccess) {
      setGameState('lost');
      return;
    }

    // Call API to register catch & claim Xu Cá
    setIsApiLoading(true);
    try {
      const res = await firebaseApi('/api/cat-town/action/fish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi câu cá');
      }

      setCaughtFishData({
        fish: data.fish,
        weight: data.weight,
        rewardCoins: data.rewardCoins,
      });
      setGameState('caught');
      onBalanceUpdated(data.newBalance);
      onRefreshProfile();
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể gửi kết quả câu cá.');
      setGameState('idle');
    } finally {
      setIsApiLoading(false);
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

        <div className="text-center">
          <h2
            className="text-base sm:text-lg font-black text-[#1E3A8A] flex items-center gap-1.5"
            style={{ fontFamily: "'Tiny5', monospace" }}
          >
            <span>🎣</span>
            <span>HỒ BONG BÓNG — BẾN CÂU MÈO</span>
          </h2>
          <span className="text-[11px] font-bold text-[#795653]">
            Lượt câu còn lại hôm nay:{' '}
            <strong className="text-[#D6336C]">{turnsRemaining}/{dailyLimit}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-[#795653] rounded-xl shadow-[2px_2px_0px_#795653]">
          <XuCaIcon className="w-4 h-4 object-contain inline-block" />
          <span className="text-xs font-black text-[#0A5EB0] tabular-nums" style={{ fontFamily: "'Tiny5', monospace" }}>
            {userBalance.toLocaleString('vi-VN')}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="w-full mb-3 p-3 rounded-2xl bg-[#FFE5EC] border-2 border-[#FF8FAB] text-[#795653] font-bold text-xs flex items-center justify-between shadow-xs">
          <span>⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-[#D6336C] font-black cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Main Pond Game Screen */}
      <div
        className="relative w-full aspect-[16/10] max-h-[500px] bg-gradient-to-b from-[#A9C5F2] via-[#89B3EC] to-[#689FE5] rounded-3xl border-4 border-[#795653] shadow-[6px_6px_0px_#795653] overflow-hidden p-4 flex flex-col justify-between"
      >
        {/* Animated bubbles and floating ripples */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-6 left-12 text-sm animate-pulse opacity-70">🫧</div>
          <div className="absolute top-16 right-20 text-xs animate-bounce opacity-60">🫧</div>
          <div className="absolute bottom-12 left-1/3 text-base animate-pulse opacity-80">🫧</div>

          {/* Swimming fish silhouettes under water */}
          <div className="absolute top-1/2 left-1/4 w-8 h-3 rounded-full bg-[#5285C7] opacity-40 animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-10 h-4 rounded-full bg-[#5285C7] opacity-40 animate-pulse" />
        </div>

        {/* Top Pond status */}
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="px-3 py-1 bg-white/85 border-2 border-[#795653] rounded-xl text-xs font-bold text-[#1E3A8A] shadow-[2px_2px_0px_#795653]">
            {gameState === 'idle' && '🌿 Mặt hồ phẳng lặng... Hãy sẵn sàng buông cần!'}
            {gameState === 'waiting' && '⏳ Đang chờ cá ngửi thấy mồi thơm...'}
            {gameState === 'hooked' && '❗ CÁ CẮN CÂU RỒI! CHUẨN BỊ GIẬT!'}
            {gameState === 'reeling' && '🎯 BẤM GIẬT CẦN KHI CON TRỎ NẰM TRONG VÙNG XANH!'}
            {gameState === 'caught' && '🎉 CÂU THÀNH CÔNG!'}
            {gameState === 'lost' && '💨 Cá quẫy đuôi chạy thoát rồi!'}
          </div>
        </div>

        {/* Center: Pier, Cat & Fishing Rod */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1">
          {/* Pier & Cat */}
          <div className="relative flex flex-col items-center">
            {/* Bobber in water */}
            {(gameState === 'waiting' || gameState === 'hooked' || gameState === 'reeling') && (
              <div
                className={`absolute -top-12 left-28 transition-all ${
                  gameState === 'hooked' ? 'animate-bounce scale-125' : 'animate-pulse'
                }`}
              >
                {/* Cute red/white float bobber */}
                <div className="w-5 h-7 rounded-full bg-[#FF4D6D] border-2 border-[#795653] shadow-xs relative">
                  <div className="absolute bottom-0 w-full h-3 bg-white rounded-b-full" />
                  <div className="absolute -top-2 left-1.5 w-1 h-3 bg-[#795653]" />
                </div>
                {/* Ripples under bobber */}
                <div className="w-8 h-2 rounded-full border border-white/80 -ml-1.5 mt-0.5 animate-ping" />
              </div>
            )}

            {/* Fisherman Cat & Rod */}
            <div className="relative flex items-end">
              <PixelCatSprite
                breed={profile?.cat.breed || 'Mèo Cam'}
                mood={gameState === 'caught' ? 'happy' : gameState === 'lost' ? 'sleepy' : 'playful'}
                size={84}
              />
              {/* Fishing Rod Graphic */}
              <div className="w-16 h-20 -ml-4 relative">
                <svg viewBox="0 0 60 70" className="w-full h-full">
                  {/* Rod line */}
                  <line x1="10" y1="65" x2="45" y2="15" stroke="#BC6C25" strokeWidth="3" strokeLinecap="round" />
                  {/* String to water */}
                  <line
                    x1="45"
                    y1="15"
                    x2={gameState === 'idle' ? '50' : '90'}
                    y2={gameState === 'idle' ? '40' : '10'}
                    stroke="#FFF9F4"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                  />
                </svg>
              </div>
            </div>

            {/* Wooden Dock Platform */}
            <div className="w-36 h-8 bg-[#DDA15E] border-3 border-[#795653] rounded-lg shadow-[3px_3px_0px_#795653] flex items-center justify-around px-2 -mt-1">
              <div className="w-3 h-6 bg-[#BC6C25] border-r border-[#795653]" />
              <div className="w-3 h-6 bg-[#BC6C25] border-r border-[#795653]" />
              <div className="w-3 h-6 bg-[#BC6C25] border-r border-[#795653]" />
            </div>
          </div>
        </div>

        {/* Bottom Reeling Meter / Action Controls */}
        <div className="relative z-20 w-full flex flex-col items-center">
          {/* Reeling Timing Mini-Gauge */}
          {gameState === 'reeling' && (
            <div className="w-full max-w-md bg-[#FFF9F4] border-3 border-[#795653] rounded-2xl p-3 shadow-[4px_4px_0px_#795653] mb-3 animate-in zoom-in-95">
              <div className="text-center text-xs font-black text-[#1E3A8A] mb-1.5" style={{ fontFamily: "'Tiny5', monospace" }}>
                NHẤP "GIẬT CẦN" KHI KIM VÀO VÙNG XANH!
              </div>

              {/* Gauge Track */}
              <div className="relative w-full h-8 bg-[#E5E7EB] border-2 border-[#795653] rounded-xl overflow-hidden">
                {/* Target Sweet Spot Zone */}
                <div
                  className="absolute top-0 bottom-0 bg-emerald-400 border-x-2 border-emerald-600 flex items-center justify-center text-[10px] font-black text-emerald-950"
                  style={{
                    left: `${targetZone.start}%`,
                    width: `${targetZone.end - targetZone.start}%`,
                  }}
                >
                  TRÚNG
                </div>

                {/* Moving Indicator Cursor */}
                <div
                  className="absolute top-0 bottom-0 w-3 bg-[#FF4D6D] border-x-2 border-[#795653] shadow-md -ml-1.5"
                  style={{ left: `${gaugePosition}%` }}
                />
              </div>

              <button
                onClick={handleReelIn}
                disabled={isApiLoading}
                className="w-full mt-2 py-3 bg-[#FF4D6D] hover:bg-[#e03a5b] active:scale-95 text-white font-black text-sm rounded-xl border-2 border-[#795653] shadow-[3px_3px_0px_#795653] cursor-pointer"
                style={{ fontFamily: "'Tiny5', monospace" }}
              >
                {isApiLoading ? 'ĐANG KÉO LÊN...' : '⚡ GIẬT CẦN NGAY! ⚡'}
              </button>
            </div>
          )}

          {/* Idle / Lost / Ready to Cast Button */}
          {(gameState === 'idle' || gameState === 'lost') && (
            <button
              onClick={handleStartCast}
              disabled={turnsRemaining <= 0}
              className="py-3 px-8 bg-[#06D6A0] hover:bg-[#05b587] disabled:opacity-50 active:translate-y-0.5 text-[#1E3A8A] font-black text-sm sm:text-base rounded-2xl border-3 border-[#795653] shadow-[4px_4px_0px_#795653] cursor-pointer flex items-center gap-2"
              style={{ fontFamily: "'Tiny5', monospace" }}
            >
              <span>🎣</span>
              <span>{gameState === 'lost' ? 'THỬ LẠI LƯỢT KHÁC' : 'THẢ CẦN CÂU CÁ'}</span>
              <span>🌊</span>
            </button>
          )}

          {gameState === 'waiting' && (
            <div className="py-2.5 px-6 bg-white/90 border-2 border-[#795653] rounded-xl text-xs font-black text-[#795653] shadow-[2px_2px_0px_#795653] animate-pulse">
              🐾 Suỵt... Giữ im lặng để cá bơi đến gần phao...
            </div>
          )}
        </div>
      </div>

      {/* ================= SUCCESS CAUGHT POPUP MODAL ================= */}
      {gameState === 'caught' && caughtFishData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#795653]/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-sm bg-[#FFF9F4] rounded-3xl border-4 border-[#795653] p-6 text-center shadow-[6px_6px_0px_#795653] animate-in zoom-in-95">
            {/* Sparkle banner */}
            <div className="text-3xl mb-2 animate-bounce">🎉</div>
            <h3
              className="text-lg font-black text-[#D6336C] tracking-wide mb-1"
              style={{ fontFamily: "'Tiny5', monospace" }}
            >
              BẮT ĐƯỢC CÁ RỒI!
            </h3>
            <p className="text-xs text-[#795653]/70 font-semibold mb-3">
              Chúc mừng bà đã kéo thành công một chú cá tươi rói từ Hồ Bong Bóng!
            </p>

            {/* Fish Display Box */}
            <div className="p-4 rounded-2xl bg-[#FFE5EC] border-2 border-[#795653] mb-4 flex flex-col items-center">
              <PixelFishSprite fishId={caughtFishData.fish.id} size={72} />
              <h4 className="text-sm font-black text-[#795653] mt-2">
                {caughtFishData.fish.name}
              </h4>
              <span className="text-[11px] font-bold text-[#526C91] uppercase">
                Độ hiếm: {caughtFishData.fish.rarity} • Nặng: {caughtFishData.weight}g
              </span>
              <p className="text-[10px] text-[#795653]/75 mt-1 max-w-xs">
                {caughtFishData.fish.description}
              </p>

              {/* Reward badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-[#F7DDA0] border-2 border-[#795653] rounded-full text-xs font-black text-[#795653] shadow-[2px_2px_0px_#795653]">
                <XuCaIcon className="w-4 h-4 object-contain inline-block" />
                <span>+{caughtFishData.rewardCoins} Xu Cá vào ví!</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setGameState('idle')}
                className="flex-1 py-2.5 bg-[#06D6A0] hover:bg-[#05b587] text-[#1E3A8A] font-black text-xs rounded-xl border-2 border-[#795653] shadow-[2px_2px_0px_#795653] cursor-pointer"
                style={{ fontFamily: "'Tiny5', monospace" }}
              >
                CÂU TIẾP 🎣
              </button>
              <button
                onClick={onBackToMap}
                className="flex-1 py-2.5 bg-white hover:bg-[#FFE5EC] text-[#795653] font-black text-xs rounded-xl border-2 border-[#795653] shadow-[2px_2px_0px_#795653] cursor-pointer"
                style={{ fontFamily: "'Tiny5', monospace" }}
              >
                VỀ BẢN ĐỒ 🗺️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
