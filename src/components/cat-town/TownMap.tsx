import React, { useState, useEffect } from 'react';
import { CatTownUserProfile, CatTownConfig } from '../../types.ts';
import { PixelCatSprite } from './PixelCatSprite.tsx';
import { XuCaIcon } from '../XuCaIcon.tsx';

interface TownMapProps {
  userBalance: number;
  profile: CatTownUserProfile | null;
  config: CatTownConfig | null;
  onSelectLocation: (loc: 'fishing' | 'grill' | 'house' | 'fortune') => void;
  onOpenInventory: () => void;
  onOpenShop: () => void;
  onExit: () => void;
}

export interface TownLocation {
  id: 'fishing' | 'grill' | 'house' | 'fortune';
  name: string;
  subtitle: string;
  icon: string;
  image: string;
  imageStyle?: React.CSSProperties; // Custom style độc lập cho từng ảnh
  feeText: string;
  feeCoins: number;
  isFree: boolean;
  description: string;
  themeColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

// 4 explicit locations with exact images and data mock required by user
export const TOWN_LOCATIONS: TownLocation[] = [
  {
    id: 'fishing',
    name: 'HỒ BÓNG BÓNG',
    subtitle: 'Bến Câu Mèo & Thu Thập Cá',
    icon: '🎣',
    image: 'https://i.postimg.cc/yNsZX86Y/4-Picsart-Background-Remover.png',
    imageStyle: {
      width: '676.202px',
      height: '5026px',
      marginTop: '50px',
      marginLeft: '-17px',
      backgroundColor: '#92EEFF',
    },
    feeText: '20 Xu Cá / lượt',
    feeCoins: 20,
    isFree: false,
    description:
      'Trổ tài sát cá, thả câu chờ thời để tóm gọn những chú cá béo múp nha! Thu thập đủ loài cá quý hiếm và nhận Xu Cá dồi dào về ví.',
    themeColor: '#A9C5F2',
    badgeBg: '#EBF3FC',
    badgeBorder: '#0A5EB0',
    badgeText: '#0A5EB0',
  },
  {
    id: 'grill',
    name: 'BẾP XÈO XÈO',
    subtitle: 'Góc Nướng Cá Canh Giờ',
    icon: '🔥',
    image: 'https://i.postimg.cc/43s9bx44/3-Picsart-Background-Remover-(1).png',
    imageStyle: {
      width: '711px',
      height: '1000px',
      marginTop: '-56px',
      marginLeft: '-54px',
      backgroundColor: '#C4A4DA',
    },
    feeText: '10 Xu Cá (kèm cá nguyên liệu)',
    feeCoins: 10,
    isFree: false,
    description:
      'Nướng cá thơm lừng trên vỉ than hồng, canh lật cá đúng độ chín hoàn hảo xèo xèo để ghi điểm kỷ lục và nhận Xu Cá thưởng!',
    themeColor: '#F7DDA0',
    badgeBg: '#FFF7E6',
    badgeBorder: '#B07D62',
    badgeText: '#B07D62',
  },
  {
    id: 'house',
    name: 'NHÀ MÈO',
    subtitle: 'Tổ Ấm Thú Cưng Riêng',
    icon: '🏡',
    image: 'https://i.postimg.cc/sgpWhhz3/6-Picsart-Background-Remover.png',
    imageStyle: {
      width: '811px',
      height: '628px',
      marginTop: '-199px',
      marginLeft: '15px',
    },
    feeText: 'Miễn phí',
    feeCoins: 0,
    isFree: true,
    description:
      'Ghé thăm căn phòng riêng của bé mèo cưng. Cho mèo ăn, vuốt ve âu yếm tăng tình cảm và tự do mua sắm sắp xếp nội thất phòng xinh.',
    themeColor: '#FF8FAB',
    badgeBg: '#FFE5EC',
    badgeBorder: '#D6336C',
    badgeText: '#D6336C',
  },
  {
    id: 'fortune',
    name: 'LỀU BÓI MEO MEO',
    subtitle: 'Tiên Tri Thần Bí Vui Nhộn',
    icon: '🔮',
    image: 'https://i.postimg.cc/6QtvLp6G/5-Picsart-Background-Remover.png',
    imageStyle: {
      height: '669px',
      marginTop: '-52px',
      backgroundColor: '#C4A4DA',
    },
    feeText: 'Miễn phí (1 lượt / ngày)',
    feeCoins: 0,
    isFree: true,
    description:
      'Chạm vào quả cầu pha lê của Mèo Tiên Tri để đón nhận quẻ bói vận mệnh hài hước hôm nay cùng phần quà Xu Cá may mắn.',
    themeColor: '#E0AAFF',
    badgeBg: '#C4A4DA',
    badgeBorder: '#7209B7',
    badgeText: '#7209B7',
  },
];

export const TownMap: React.FC<TownMapProps> = ({
  userBalance,
  profile,
  config,
  onSelectLocation,
  onOpenInventory,
  onOpenShop,
  onExit,
}) => {
  // Screen state: 'start' (Start Screen) | 'selector' (Level Selector Carousel)
  const [currentScreen, setCurrentScreen] = useState<'start' | 'selector'>('start');
  // Carousel index for Level Selector (0 to 3)
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // Screen transition animation state
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const activeLocation = TOWN_LOCATIONS[currentIndex];

  // Navigate to previous location
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? TOWN_LOCATIONS.length - 1 : prev - 1));
  };

  // Navigate to next location
  const handleNext = () => {
    setCurrentIndex((prev) => (prev === TOWN_LOCATIONS.length - 1 ? 0 : prev + 1));
  };

  // Handle entering town from Start Screen
  const handleStartGame = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScreen('selector');
      setIsTransitioning(false);
    }, 280);
  };

  // Keyboard navigation support for retro console feeling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentScreen === 'start') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartGame();
        }
      } else if (currentScreen === 'selector') {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          onSelectLocation(activeLocation.id);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setCurrentScreen('start');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen, activeLocation.id]);

  return (
    <div
      className="relative w-full max-w-4xl mx-auto flex flex-col items-center select-none"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* ================= TOP HUD HEADER ================= */}
      <header className="w-full bg-[#FFF9F4] border-4 border-[#795653] rounded-2xl p-2.5 sm:p-3 mb-3 flex items-center justify-between shadow-[4px_4px_0px_#795653] z-20">
        {/* Left: Exit button & Cat Profile */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFE5EC] hover:bg-[#FFB3C6] active:translate-y-0.5 text-[#795653] font-bold text-xs rounded-xl border-2 border-[#795653] shadow-[2px_2px_0px_#795653] transition-transform cursor-pointer"
            style={{ fontFamily: "'Tiny5', 'Press Start 2P', monospace" }}
          >
            <span>←</span>
            <span>VỀ TIỆM CÁ</span>
          </button>

          {profile && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFDF7] border-2 border-[#795653]/30 rounded-xl text-xs font-bold text-[#795653]">
              <PixelCatSprite breed={profile.cat.breed} size={20} />
              <span className="text-[#D6336C] font-black">{profile.cat.name}</span>
            </div>
          )}
        </div>

        {/* Center: Screen mode badge (Selector only) */}
        {currentScreen === 'selector' && (
          <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-[#F7DDA0] border-2 border-[#795653] rounded-xl shadow-[2px_2px_0px_#795653]">
            <span className="text-xs">🎮</span>
            <span
              className="text-xs font-black text-[#795653]"
              style={{ fontFamily: "'Tiny5', monospace" }}
            >
              CHỌN KHU VỰC [{currentIndex + 1}/4]
            </span>
          </div>
        )}

        {/* Right: Balance & Inventory/Shop Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenInventory}
            title="Túi Đồ Thị Trấn"
            className="px-2.5 py-1.5 bg-[#F7DDA0] hover:bg-[#ffe39c] active:translate-y-0.5 text-[#795653] font-bold text-xs rounded-xl border-2 border-[#795653] shadow-[2px_2px_0px_#795653] transition-transform flex items-center gap-1 cursor-pointer"
          >
            <span>🎒</span>
            <span className="hidden sm:inline text-[11px] font-black">TÚI ĐỒ</span>
          </button>

          <button
            onClick={onOpenShop}
            title="Cửa Hàng Nội Thất Thị Trấn"
            className="px-2.5 py-1.5 bg-[#FF8FAB] hover:bg-[#f87898] active:translate-y-0.5 text-white font-bold text-xs rounded-xl border-2 border-[#795653] shadow-[2px_2px_0px_#795653] transition-transform flex items-center gap-1 cursor-pointer"
          >
            <span>🪑</span>
            <span className="hidden sm:inline text-[11px] font-black">SHOP</span>
          </button>

          {/* User Balance */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-[#795653] rounded-xl shadow-[2px_2px_0px_#795653]">
            <XuCaIcon className="w-4 h-4 object-contain inline-block" />
            <span
              className="text-xs sm:text-sm font-black text-[#0A5EB0] tabular-nums"
              style={{ fontFamily: "'Tiny5', monospace" }}
            >
              {userBalance.toLocaleString('vi-VN')}
            </span>
          </div>
        </div>
      </header>

      {/* ================= MAIN RETRO STAGE CONTAINER ================= */}
      <div
        className={`relative w-full rounded-3xl border-4 sm:border-6 border-[#795653] shadow-[8px_8px_0px_#795653] overflow-hidden transition-opacity duration-300 ${
          isTransitioning ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
        }`}
        style={{
          backgroundImage: `url('/assets/aistudio/image_e49acb89.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          minHeight: '620px',
        }}
      >
        {/* Pixel dithering / scanline overlay effect for vintage arcade feel */}
        <div
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: `linear-gradient(rgba(121, 86, 83, 0.2) 50%, transparent 50%)`,
            backgroundSize: '100% 4px',
          }}
        />

        {/* ------------------------------------------------------------- */}
        {/* SCREEN 1: START SCREEN (MÀN HÌNH BẮT ĐẦU)                     */}
        {/* ------------------------------------------------------------- */}
        {currentScreen === 'start' && (
          <div className="relative w-full min-h-[620px] flex flex-col items-center justify-between p-6 sm:p-10 select-none">
            {/* Top decorative badge */}
            <div className="flex items-center gap-2 px-4 py-1.5 bg-[#FFF9F4]/90 border-3 border-[#795653] rounded-2xl shadow-[3px_3px_0px_#795653]">
              <span className="text-sm">🐾</span>
              <span
                className="text-xs sm:text-sm font-black text-[#795653] tracking-widest"
                style={{ fontFamily: "'Tiny5', 'Press Start 2P', monospace" }}
              >
                MÈO MÊ CÁ KHÔ • 2D PIXEL RPG
              </span>
              <span className="text-sm">🐟</span>
            </div>

            {/* Center: Main Retro Game Title */}
            <div className="flex flex-col items-center text-center my-auto py-6">
              {/* Small "WELCOME TO" */}
              <div
                className="text-sm sm:text-lg md:text-xl font-black text-[#795653] tracking-[0.25em] uppercase mb-1 sm:mb-2 bg-[#FFF9F4]/80 px-4 py-1 rounded-xl border-2 border-[#795653] shadow-[2px_2px_0px_#795653]"
                style={{ fontFamily: "'Tiny5', 'Press Start 2P', monospace" }}
              >
                ★ WELCOME TO ★
              </div>

              {/* Extra large "THỊ TRẤN CÁ MÈO" */}
              <h1
                className="text-3xl sm:text-5xl md:text-6xl font-black tracking-wide leading-tight my-2 sm:my-3 select-none"
                style={{
                  fontFamily: "'Tiny5', 'Press Start 2P', monospace",
                  color: '#FF8FAB',
                  WebkitTextStroke: '2px #FFFFFF',
                  textShadow:
                    '4px 4px 0px #795653, -2px -2px 0px #FFFFFF, 2px -2px 0px #FFFFFF, -2px 2px 0px #FFFFFF, 6px 6px 0px rgba(121, 86, 83, 0.45)',
                }}
              >
                THỊ TRẤN CÁ MÈO
              </h1>

              {/* Sub-tagline */}
              <p className="mt-2 text-xs sm:text-sm font-bold text-[#795653] bg-[#FFF9F4]/90 px-4 py-1.5 rounded-full border-2 border-[#795653] shadow-[2px_2px_0px_#795653] max-w-md">
                Thế giới mô phỏng đời sống ấm áp của những chú mèo mê cá 🌸
              </p>

              {/* Cute Chibi Pet preview */}
              <div className="mt-5 flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF9F4] border-3 border-[#795653] shadow-[3px_3px_0px_#795653] flex items-center justify-center">
                  <PixelCatSprite breed="Mèo Cam" size={28} />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#FFE5EC] border-3 border-[#795653] shadow-[3px_3px_0px_#795653] flex items-center justify-center">
                  <PixelCatSprite breed="Mèo Mướp" size={28} />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#A9C5F2]/40 border-3 border-[#795653] shadow-[3px_3px_0px_#795653] flex items-center justify-center">
                  <PixelCatSprite breed="Mèo Tam Thể" size={28} />
                </div>
              </div>
            </div>

            {/* Bottom Action Button: "VÀO THỊ TRẤN ▶" (Blinking Arcade Press Start style) */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <button
                onClick={handleStartGame}
                className="animate-retro-blink px-8 sm:px-12 py-3.5 sm:py-4 bg-[#FF8FAB] hover:bg-[#ff7599] active:translate-y-1 text-white font-black text-base sm:text-xl rounded-2xl border-4 border-[#795653] shadow-[6px_6px_0px_#795653] cursor-pointer flex items-center gap-2 transition-transform select-none"
                style={{
                  fontFamily: "'Tiny5', 'Press Start 2P', monospace",
                  textShadow: '2px 2px 0px #795653',
                }}
              >
                <span>VÀO THỊ TRẤN</span>
                <span className="text-xl sm:text-2xl animate-pulse">▶</span>
              </button>

              <span
                className="text-[10px] sm:text-xs font-bold text-[#795653]/90 bg-[#FFF9F4]/80 px-3 py-0.5 rounded-lg border border-[#795653]/30"
                style={{ fontFamily: "'Tiny5', monospace" }}
              >
                [ Bấm nút hoặc nhấn phím ENTER để bắt đầu ]
              </span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SCREEN 2: LEVEL SELECTOR (CHỌN KHU VỰC CHƠI)                  */}
        {/* ------------------------------------------------------------- */}
        {currentScreen === 'selector' && (
          <div className="relative w-full min-h-[620px] bg-[#FFF9F4]/80 backdrop-blur-xs flex flex-col items-center justify-between p-4 sm:p-6 select-none">
            {/* Top Row: Back to Start Screen & Step Indicator */}
            <div className="w-full flex items-center justify-between mb-2">
              <button
                onClick={() => setCurrentScreen('start')}
                className="px-3 py-1.5 bg-[#FFFDF7] hover:bg-[#FFE5EC] active:translate-y-0.5 text-[#795653] font-bold text-xs rounded-xl border-2 border-[#795653] shadow-[2px_2px_0px_#795653] flex items-center gap-1 cursor-pointer transition-transform"
                style={{ fontFamily: "'Tiny5', monospace" }}
              >
                <span>◀</span>
                <span>VỀ MÀN HÌNH CHÍNH</span>
              </button>

              {/* Area Indicator Dots */}
              <div className="flex items-center gap-2 bg-[#FFFDF7] px-3 py-1.5 rounded-xl border-2 border-[#795653] shadow-[2px_2px_0px_#795653]">
                {TOWN_LOCATIONS.map((loc, idx) => (
                  <button
                    key={loc.id}
                    onClick={() => setCurrentIndex(idx)}
                    title={loc.name}
                    className={`w-3.5 h-3.5 rounded-md border-2 border-[#795653] transition-all cursor-pointer ${
                      currentIndex === idx
                        ? 'bg-[#FF8FAB] scale-125 shadow-[1px_1px_0px_#795653]'
                        : 'bg-[#FFF9F4] hover:bg-[#F7DDA0]'
                    }`}
                  />
                ))}
                <span
                  className="text-xs font-black text-[#795653] ml-1"
                  style={{ fontFamily: "'Tiny5', monospace" }}
                >
                  {currentIndex + 1}/4
                </span>
              </div>
            </div>

            {/* Central Level Selector Carousel */}
            <div className="w-full flex items-center justify-center gap-2 sm:gap-6 my-auto py-2">
              {/* Left Arrow Button: "◀ LÙI LẠI" */}
              <button
                onClick={handlePrev}
                title="Khu vực trước đó (Phím Mũi tên trái)"
                className="flex-shrink-0 flex flex-col items-center justify-center gap-1 px-3 sm:px-5 py-6 sm:py-8 bg-[#FFFDF7] hover:bg-[#F7DDA0] active:translate-y-1 text-[#795653] font-black rounded-2xl border-3 sm:border-4 border-[#795653] shadow-[4px_4px_0px_#795653] transition-transform cursor-pointer"
                style={{ fontFamily: "'Tiny5', 'Press Start 2P', monospace" }}
              >
                <span className="text-xl sm:text-3xl leading-none">◀</span>
                <span className="text-[10px] sm:text-xs tracking-wider hidden sm:inline">
                  LÙI LẠI
                </span>
              </button>

              {/* Central Main Stage Frame (Active Location) */}
              <div className="w-full max-w-md sm:max-w-lg flex flex-col items-center">
                {/* 1. Khung Hình Ảnh Trung Tâm (Main Frame) */}
                <div
                  className="relative w-full aspect-[4/3] max-h-[280px] sm:max-h-[320px] bg-[#FFFDF7] border-4 sm:border-5 border-[#795653] rounded-2xl shadow-[6px_6px_0px_#795653] overflow-hidden flex items-center justify-center p-1 sm:p-2"
                  style={{
                    backgroundColor: activeLocation.badgeBg,
                  }}
                >
                  {/* Decorative pixel corner brackets */}
                  <div className="absolute top-2 left-2 text-xs font-black text-[#795653]/60 pointer-events-none select-none z-10">
                    ┌
                  </div>
                  <div className="absolute top-2 right-2 text-xs font-black text-[#795653]/60 pointer-events-none select-none z-10">
                    ┐
                  </div>
                  <div className="absolute bottom-2 left-2 text-xs font-black text-[#795653]/60 pointer-events-none select-none z-10">
                    └
                  </div>
                  <div className="absolute bottom-2 right-2 text-xs font-black text-[#795653]/60 pointer-events-none select-none z-10">
                    ┘
                  </div>

                  {/* TÁCH RIÊNG 4 ẢNH CHO 4 KHU VỰC ĐỂ CHỈNH SỬA ĐỘC LẬP TỪNG ẢNH */}
                  <div
                    className="w-full h-full flex items-center justify-center overflow-hidden"
                    style={{
                      backgroundColor: activeLocation.id === 'fortune' ? '#C4A4DA' : undefined,
                    }}
                  >
                    {/* 1. KHU VỰC 1: HỒ BÓNG BÓNG (Câu cá) */}
                    {activeLocation.id === 'fishing' && (
                      <img
                        id="town-img-fishing"
                        data-location="fishing"
                        src={activeLocation.image}
                        alt="Hồ Bóng Bóng"
                        className="max-w-none object-contain object-center scale-[1.2] hover:scale-[1.26] transition-transform duration-300 filter drop-shadow-md select-none"
                        style={{
                          width: '676.202px',
                          height: '5026px',
                          marginTop: '50px',
                          marginLeft: '-17px',
                          backgroundColor: '#92EEFF',
                          imageRendering: 'pixelated',
                          transformOrigin: 'center center',
                          ...activeLocation.imageStyle,
                        }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://placehold.co/400x300/FFF9F4/795653?text=Ho+Bong+Bong';
                        }}
                      />
                    )}

                    {/* 2. KHU VỰC 2: BẾP XÈO XÈO (Nướng cá) */}
                    {activeLocation.id === 'grill' && (
                      <img
                        id="town-img-grill"
                        data-location="grill"
                        src={activeLocation.image}
                        alt="Bếp Xèo Xèo"
                        className="max-w-none object-contain object-center scale-[1.2] hover:scale-[1.26] transition-transform duration-300 filter drop-shadow-md select-none"
                        style={{
                          width: '711px',
                          height: '1000px',
                          marginTop: '-56px',
                          marginLeft: '-54px',
                          backgroundColor: '#C4A4DA',
                          imageRendering: 'pixelated',
                          transformOrigin: 'center center',
                          ...activeLocation.imageStyle,
                        }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://placehold.co/400x300/FFF9F4/795653?text=Bep+Xeo+Xeo';
                        }}
                      />
                    )}

                    {/* 3. KHU VỰC 3: NHÀ MÈO (Nhà riêng & Thú cưng) */}
                    {activeLocation.id === 'house' && (
                      <img
                        id="town-img-house"
                        data-location="house"
                        src={activeLocation.image}
                        alt="Nhà Mèo"
                        className="max-w-none object-contain object-center scale-[1.2] hover:scale-[1.26] transition-transform duration-300 filter drop-shadow-md select-none"
                        style={{
                          width: '811px',
                          height: '628px',
                          marginTop: '-199px',
                          marginLeft: '15px',
                          imageRendering: 'pixelated',
                          transformOrigin: 'center center',
                          ...activeLocation.imageStyle,
                        }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://placehold.co/400x300/FFF9F4/795653?text=Nha+Meo';
                        }}
                      />
                    )}

                    {/* 4. KHU VỰC 4: LỀU BÓI MEO MEO (Tiên tri) */}
                    {activeLocation.id === 'fortune' && (
                      <img
                        id="town-img-fortune"
                        data-location="fortune"
                        src={activeLocation.image}
                        alt="Lều Bói Meo Meo"
                        className="max-w-none object-contain object-center scale-[1.2] hover:scale-[1.26] transition-transform duration-300 filter drop-shadow-md select-none"
                        style={{
                          height: '669px',
                          marginTop: '-52px',
                          backgroundColor: '#C4A4DA',
                          imageRendering: 'pixelated',
                          transformOrigin: 'center center',
                          ...activeLocation.imageStyle,
                        }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://placehold.co/400x300/FFF9F4/795653?text=Leu+Boi';
                        }}
                      />
                    )}
                  </div>

                  {/* Floating Tag Badge top-right */}
                  <div
                    className="absolute top-3 right-3 px-2.5 py-0.5 bg-[#FFF9F4]/95 border-2 border-[#795653] rounded-lg text-[10px] sm:text-xs font-black shadow-[2px_2px_0px_#795653] z-10"
                    style={{
                      fontFamily: "'Tiny5', monospace",
                      color: activeLocation.badgeBorder,
                    }}
                  >
                    {activeLocation.icon} KHU {currentIndex + 1}
                  </div>
                </div>

                {/* 2. Bảng Thông Tin (Info Panel - Dialog Box Style) */}
                <div className="w-full mt-3 bg-[#FFF9F4] border-3 sm:border-4 border-[#795653] rounded-2xl shadow-[5px_5px_0px_#795653] p-3.5 sm:p-4 flex flex-col items-center text-center">
                  {/* Tên Khu Vực */}
                  <h2
                    className="text-base sm:text-xl font-black text-[#D6336C] tracking-wide flex items-center justify-center gap-1.5"
                    style={{ fontFamily: "'Tiny5', 'Press Start 2P', monospace" }}
                  >
                    <span>{activeLocation.icon}</span>
                    <span>{activeLocation.name}</span>
                  </h2>

                  {/* Dòng Giới Thiệu */}
                  <p className="mt-1.5 text-xs sm:text-sm text-[#795653] font-medium leading-relaxed max-w-sm">
                    {activeLocation.description}
                  </p>

                  {/* Phí Vào Cửa (Entry Fee Box) */}
                  <div className="mt-2.5 px-3 py-1 bg-white border-2 border-[#795653] rounded-xl shadow-[2px_2px_0px_#795653] flex items-center gap-1.5">
                    <span className="text-xs">🪙</span>
                    <span className="text-xs font-black text-[#795653]">
                      Phí vào cửa:
                    </span>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-md ${
                        activeLocation.isFree
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-400'
                          : 'bg-[#FFF2D6] text-[#B07D62] border border-[#795653]/30'
                      }`}
                      style={{ fontFamily: "'Tiny5', monospace" }}
                    >
                      {activeLocation.feeText}
                    </span>
                  </div>

                  {/* Nút Xác Nhận Chơi (Action Button) */}
                  <button
                    onClick={() => onSelectLocation(activeLocation.id)}
                    className="mt-3.5 w-full sm:w-auto px-8 sm:px-12 py-2.5 sm:py-3 bg-[#FF8FAB] hover:bg-[#ff7599] active:translate-y-1 text-white font-black text-sm sm:text-base rounded-xl border-3 sm:border-4 border-[#795653] shadow-[4px_4px_0px_#795653] cursor-pointer flex items-center justify-center gap-2 transition-transform select-none"
                    style={{
                      fontFamily: "'Tiny5', 'Press Start 2P', monospace",
                      textShadow: '1px 1px 0px #795653',
                    }}
                  >
                    <span>VÀO KHU VỰC</span>
                    <span className="text-base sm:text-lg">▶</span>
                  </button>
                </div>
              </div>

              {/* Right Arrow Button: "TIẾN TIẾP ▶" */}
              <button
                onClick={handleNext}
                title="Khu vực kế tiếp (Phím Mũi tên phải)"
                className="flex-shrink-0 flex flex-col items-center justify-center gap-1 px-3 sm:px-5 py-6 sm:py-8 bg-[#FFFDF7] hover:bg-[#F7DDA0] active:translate-y-1 text-[#795653] font-black rounded-2xl border-3 sm:border-4 border-[#795653] shadow-[4px_4px_0px_#795653] transition-transform cursor-pointer"
                style={{ fontFamily: "'Tiny5', 'Press Start 2P', monospace" }}
              >
                <span className="text-xl sm:text-3xl leading-none">▶</span>
                <span className="text-[10px] sm:text-xs tracking-wider hidden sm:inline">
                  TIẾN TIẾP
                </span>
              </button>
            </div>

            {/* Bottom Keyboard & Navigation Tip */}
            <footer className="mt-2 text-center text-[10px] sm:text-xs text-[#795653]/80 font-bold bg-[#FFF9F4] px-4 py-1 rounded-xl border border-[#795653]/30 shadow-xs">
              💡 Mẹo: Sử dụng phím mũi tên ◀ / ▶ trên bàn phím để chuyển khu vực, nhấn ENTER để bắt đầu chơi!
            </footer>
          </div>
        )}
      </div>

      {/* Footer Navigation Tip */}
      <footer className="mt-2 text-center text-xs text-[#795653] font-bold bg-[#FFF9F4] px-4 py-1.5 rounded-xl border-2 border-[#795653]/30 shadow-xs">
        🐾 Thị Trấn Cá Mèo — Nơi những chú mèo đáng yêu tận hưởng cuộc sống và thưởng thức cá khô thơm lừng!
      </footer>
    </div>
  );
};
