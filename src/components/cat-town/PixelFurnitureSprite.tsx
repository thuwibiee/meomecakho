import React from 'react';

interface PixelFurnitureSpriteProps {
  itemId: string;
  size?: number;
  className?: string;
}

export const PixelFurnitureSprite: React.FC<PixelFurnitureSpriteProps> = ({
  itemId,
  size = 48,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-block select-none ${className}`}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
      }}
    >
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        style={{
          shapeRendering: 'crispEdges',
          imageRendering: 'pixelated',
        }}
      >
        {itemId === 'furn_cushion_pink' && (
          <>
            <ellipse cx="16" cy="18" rx="12" ry="7" fill="#FF8FAB" />
            <ellipse cx="16" cy="16" rx="9" ry="5" fill="#FFCCD5" />
            <circle cx="16" cy="16" r="2" fill="#D6336C" opacity="0.6" />
          </>
        )}

        {itemId === 'furn_cat_tree' && (
          <>
            <rect x="6" y="27" width="20" height="3" fill="#B07D62" />
            <rect x="14" y="10" width="4" height="17" fill="#DDB892" />
            <rect x="8" y="18" width="8" height="2" fill="#B07D62" />
            <rect x="10" y="8" width="12" height="3" fill="#B07D62" />
            <rect x="12" y="3" width="8" height="6" fill="#EDE0D4" stroke="#B07D62" strokeWidth="1" />
            <circle cx="16" cy="6" r="1.5" fill="#795653" />
          </>
        )}

        {itemId === 'furn_wooden_table' && (
          <>
            <rect x="4" y="14" width="24" height="4" rx="1" fill="#D4A373" />
            <rect x="6" y="18" width="3" height="9" fill="#BC6C25" />
            <rect x="23" y="18" width="3" height="9" fill="#BC6C25" />
            <rect x="13" y="11" width="6" height="3" fill="#FAEDCD" />
          </>
        )}

        {itemId === 'furn_milk_bowl' && (
          <>
            <ellipse cx="16" cy="20" rx="10" ry="5" fill="#FFCCD5" />
            <ellipse cx="16" cy="18" rx="7" ry="3.5" fill="#FFFFFF" />
            <polygon points="8,16 6,13 10,15" fill="#FF8FAB" />
            <polygon points="24,16 26,13 22,15" fill="#FF8FAB" />
          </>
        )}

        {itemId === 'furn_yarn_toy' && (
          <>
            <circle cx="16" cy="16" r="9" fill="#A9C5F2" />
            <path d="M10 13 Q16 9 22 13" stroke="#4682B4" strokeWidth="1.5" fill="none" />
            <path d="M9 18 Q16 23 23 18" stroke="#4682B4" strokeWidth="1.5" fill="none" />
            <path d="M22 20 Q26 26 29 27" stroke="#A9C5F2" strokeWidth="2" fill="none" />
          </>
        )}

        {itemId === 'furn_wall_strawberry' && (
          <>
            <rect x="4" y="4" width="24" height="24" fill="#FFE5EC" stroke="#FFB3C6" strokeWidth="1" />
            <circle cx="11" cy="11" r="2.5" fill="#FF4D6D" />
            <circle cx="21" cy="19" r="2.5" fill="#FF4D6D" />
            <polygon points="11,8 10,7 12,7" fill="#06D6A0" />
            <polygon points="21,16 20,15 22,15" fill="#06D6A0" />
          </>
        )}

        {itemId === 'furn_floor_tatami' && (
          <>
            <rect x="4" y="4" width="24" height="24" fill="#E9D8A6" stroke="#D4A373" strokeWidth="1" />
            <line x1="4" y1="16" x2="28" y2="16" stroke="#D4A373" strokeWidth="1" />
            <line x1="16" y1="4" x2="16" y2="28" stroke="#D4A373" strokeWidth="1" />
          </>
        )}

        {itemId === 'furn_plant_catnip' && (
          <>
            <rect x="11" y="19" width="10" height="8" rx="1" fill="#D4A373" />
            <path d="M16 19 Q12 12 8 13" stroke="#2D6A4F" strokeWidth="2" fill="none" />
            <path d="M16 19 Q16 8 16 7" stroke="#52B788" strokeWidth="2.5" fill="none" />
            <path d="M16 19 Q20 12 24 13" stroke="#2D6A4F" strokeWidth="2" fill="none" />
          </>
        )}

        {itemId === 'furn_night_lamp' && (
          <>
            <rect x="14" y="22" width="4" height="6" fill="#795653" />
            <rect x="11" y="27" width="10" height="2" fill="#523937" />
            <polygon points="9,22 23,22 20,11 12,11" fill="#FEE440" opacity="0.9" />
            {/* Paw silhouette */}
            <circle cx="16" cy="16" r="1.5" fill="#E76F51" />
            <circle cx="14" cy="14" r="0.8" fill="#E76F51" />
            <circle cx="18" cy="14" r="0.8" fill="#E76F51" />
          </>
        )}

        {itemId === 'furn_fish_sofa' && (
          <>
            <ellipse cx="16" cy="18" rx="13" ry="7" fill="#FF8FAB" />
            <rect x="5" y="12" width="22" height="7" rx="3" fill="#FFB3C6" />
            <polygon points="26,15 31,12 31,18" fill="#FF8FAB" />
            <circle cx="9" cy="15" r="1.5" fill="#2B2830" />
          </>
        )}

        {itemId === 'furn_wall_stars' && (
          <>
            <rect x="4" y="4" width="24" height="24" fill="#CDB4DB" stroke="#B5838D" strokeWidth="1" />
            <polygon points="10,8 11,10 13,10 11,11 12,13 10,12 8,13 9,11 7,10 9,10" fill="#FFD166" />
            <polygon points="22,18 23,20 25,20 23,21 24,23 22,22 20,23 21,21 19,20 21,20" fill="#FFD166" />
          </>
        )}

        {itemId === 'furn_rug_paw' && (
          <>
            <ellipse cx="16" cy="16" rx="12" ry="10" fill="#FFCCD5" stroke="#FF8FAB" strokeWidth="1" />
            <ellipse cx="16" cy="18" rx="5" ry="4" fill="#D6336C" opacity="0.7" />
            <circle cx="11" cy="12" r="2" fill="#D6336C" opacity="0.7" />
            <circle cx="15" cy="10" r="2" fill="#D6336C" opacity="0.7" />
            <circle cx="19" cy="11" r="2" fill="#D6336C" opacity="0.7" />
          </>
        )}
      </svg>
    </div>
  );
};
