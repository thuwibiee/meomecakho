import express, { Request, Response } from 'express';
import crypto from 'crypto';
import {
  CatTownConfig,
  CatTownUserProfile,
  CatTownFish,
  CatTownFurniture,
  CatTownFortune,
  CatBreed,
  WalletTransaction,
} from '../src/types.ts';

export function getDefaultCatTownConfig(): CatTownConfig {
  const fishCatalog: CatTownFish[] = [
    {
      id: 'fish_bong_bong',
      name: 'Cá Bong Bóng Pastel',
      rarity: 'common',
      rewardCoins: 6,
      weightMin: 120,
      weightMax: 350,
      description: 'Chú cá tròn xoe như bong bóng xà phòng, bơi lội tung tăng trong làn nước mát rượi.',
      color: '#FFB3C6',
      iconType: 'bubble_fish',
    },
    {
      id: 'fish_meo_con',
      name: 'Cá Tai Mèo Vằn',
      rarity: 'common',
      rewardCoins: 8,
      weightMin: 200,
      weightMax: 450,
      description: 'Hai vây trên đầu nhọn hoắt hệt như đôi tai mèo con ngơ ngác.',
      color: '#A9C5F2',
      iconType: 'cat_fish',
    },
    {
      id: 'fish_cau_vong',
      name: 'Cá Cầu Vồng Ngũ Sắc',
      rarity: 'uncommon',
      rewardCoins: 14,
      weightMin: 300,
      weightMax: 600,
      description: 'Vảy lấp lánh như dải cầu vồng sau cơn mưa rào chiều mùa hạ.',
      color: '#F7DDA0',
      iconType: 'rainbow_fish',
    },
    {
      id: 'fish_anh_trang',
      name: 'Cá Bạc Ánh Trăng',
      rarity: 'uncommon',
      rewardCoins: 18,
      weightMin: 400,
      weightMax: 850,
      description: 'Phát ra ánh sáng dịu êm huyền ảo trong làn nước đêm của hồ bong bóng.',
      color: '#E0AAFF',
      iconType: 'moon_fish',
    },
    {
      id: 'fish_hoa_dao',
      name: 'Cá Cánh Hoa Đào',
      rarity: 'rare',
      rewardCoins: 28,
      weightMin: 500,
      weightMax: 1100,
      description: 'Thân hình mềm mại tựa cánh hoa anh đào trôi dạt theo dòng suối ngọt.',
      color: '#FF8FAB',
      iconType: 'blossom_fish',
    },
    {
      id: 'fish_kim_ngan',
      name: 'Cá Chép Kim Ngân Chiêu Tài',
      rarity: 'rare',
      rewardCoins: 35,
      weightMin: 800,
      weightMax: 1600,
      description: 'Mang lại điềm lành và tài lộc rủng rỉnh cho bất kỳ ai câu trúng.',
      color: '#FFD166',
      iconType: 'golden_carp',
    },
    {
      id: 'fish_than_long',
      name: 'Cá Rồng Mèo Cổ Đại',
      rarity: 'legendary',
      rewardCoins: 60,
      weightMin: 1500,
      weightMax: 3200,
      description: 'Huyền thoại kể rằng chú cá này mang linh hồn của thần mèo bảo hộ thị trấn.',
      color: '#06D6A0',
      iconType: 'dragon_fish',
    },
    {
      id: 'fish_meo_hoang_gia',
      name: 'Cá Vương Miện Bảy Màu',
      rarity: 'legendary',
      rewardCoins: 80,
      weightMin: 2000,
      weightMax: 4500,
      description: 'Đội vương miện ngọc trai hoàng gia, hiếm khi xuất hiện trừ khi câu được bằng cả tấm lòng.',
      color: '#7209B7',
      iconType: 'royal_fish',
    },
  ];

  const furnitureCatalog: CatTownFurniture[] = [
    {
      id: 'furn_cushion_pink',
      name: 'Nệm Lông Mèo Hồng Pastel',
      category: 'furniture',
      price: 25,
      description: 'Nệm tròn siêu êm ái, lông nhung ấm áp cho mèo cưng cuộn tròn ngủ trưa.',
      spriteType: 'cushion',
      color: '#FF8FAB',
      dimensions: { w: 1, h: 1 },
    },
    {
      id: 'furn_cat_tree',
      name: 'Tháp Mèo Gỗ 3 Tầng',
      category: 'cat_item',
      price: 55,
      description: 'Cây cào móng tích hợp nhà chòi cao cho mèo tha hồ leo trèo ngắm thị trấn.',
      spriteType: 'cat_tree',
      color: '#D4A373',
      dimensions: { w: 1, h: 2 },
    },
    {
      id: 'furn_wooden_table',
      name: 'Bàn Trà Gỗ Kem Sữa',
      category: 'furniture',
      price: 30,
      description: 'Bàn trà nhỏ gọn gàng, bề mặt phủ vân gỗ sồi pastel vintage.',
      spriteType: 'table',
      color: '#FAEDCD',
      dimensions: { w: 2, h: 1 },
    },
    {
      id: 'furn_milk_bowl',
      name: 'Bát Sữa Sứ Dâu Tây',
      category: 'cat_item',
      price: 15,
      description: 'Bát ăn hình tai mèo xinh xắn, lúc nào cũng đầy ắp sữa tươi ngọt lịm.',
      spriteType: 'bowl',
      color: '#FFCCD5',
      dimensions: { w: 1, h: 1 },
    },
    {
      id: 'furn_yarn_toy',
      name: 'Cuộn Len Cầu Vồng Vui Nhộn',
      category: 'toy',
      price: 12,
      description: 'Món đồ chơi yêu thích của mọi chú mèo, lăn tròn khắp phòng khách.',
      spriteType: 'toy',
      color: '#A9C5F2',
      dimensions: { w: 1, h: 1 },
    },
    {
      id: 'furn_wall_strawberry',
      name: 'Giấy Dán Tường Dâu Tây Sữa',
      category: 'wallpaper',
      price: 40,
      description: 'Họa tiết quả dâu tây ngọt ngào và sọc kem thanh lịch.',
      spriteType: 'wallpaper',
      color: '#FFE5EC',
      dimensions: { w: 1, h: 1 },
    },
    {
      id: 'furn_floor_tatami',
      name: 'Sàn Gỗ Nhạt Xếp Thoi',
      category: 'floor',
      price: 35,
      description: 'Ván sàn gỗ sồi tông sáng, mang cảm giác ấm cúng cho căn nhà nhỏ.',
      spriteType: 'floor',
      color: '#E9D8A6',
      dimensions: { w: 1, h: 1 },
    },
    {
      id: 'furn_plant_catnip',
      name: 'Chậu Cỏ Mèo Xanh Mướt',
      category: 'plant',
      price: 18,
      description: 'Cỏ tươi mát lành giúp mèo cưng thư giãn tinh thần và xả stress.',
      spriteType: 'plant',
      color: '#94D2BD',
      dimensions: { w: 1, h: 1 },
    },
    {
      id: 'furn_night_lamp',
      name: 'Đèn Ngủ Hình Chân Mèo',
      category: 'furniture',
      price: 28,
      description: 'Ánh sáng vàng ấm áp xua tan bóng đêm, in hình dấu chân mèo xinh xắn.',
      spriteType: 'lamp',
      color: '#FEE440',
      dimensions: { w: 1, h: 1 },
    },
    {
      id: 'furn_fish_sofa',
      name: 'Sofa Cá Khô Độc Quyền',
      category: 'furniture',
      price: 70,
      description: 'Ghế bành êm như mây uốn lượn theo hình chú cá khô đặc trưng của tiệm MMCK.',
      spriteType: 'sofa',
      color: '#FFB3C6',
      dimensions: { w: 2, h: 1 },
    },
    {
      id: 'furn_wall_stars',
      name: 'Giấy Dán Tường Bầu Trời Sao',
      category: 'wallpaper',
      price: 45,
      description: 'Bầu trời đêm ngập tràn ánh sao lung linh và mây bồng bềnh pastel.',
      spriteType: 'wallpaper',
      color: '#CDB4DB',
      dimensions: { w: 1, h: 1 },
    },
    {
      id: 'furn_rug_paw',
      name: 'Thảm Tròn Dấu Chân Hồng',
      category: 'furniture',
      price: 22,
      description: 'Thảm lông mềm mại đặt giữa phòng, êm chân mỗi bước đi.',
      spriteType: 'rug',
      color: '#FFC2D1',
      dimensions: { w: 2, h: 2 },
    },
  ];

  const fortuneCatalog: CatTownFortune[] = [
    {
      id: 'fort_01',
      category: 'love',
      title: 'Tình Duyên Nở Rộ',
      prophecy: 'Hôm nay sợi dây hồng duyên đang lay động khẽ khàng. Nam chính bà thích thầm có thể đang nghĩ về bà đó nha!',
      luckyNumber: 7,
      luckyColor: 'Hồng Phấn',
      advice: 'Hãy ghé Quầy Cá ngắm nam chính và gửi một lời thì thầm ngọt ngào nhé~',
    },
    {
      id: 'fort_02',
      category: 'wealth',
      title: 'Tài Lộc Đầy Rổ Cá',
      prophecy: 'Tiền tài và Xu Cá đang tìm đường chảy vào ví. Bến câu hôm nay có làn sóng bạc may mắn!',
      luckyNumber: 8,
      luckyColor: 'Vàng Bơ',
      advice: 'Mau ra Hồ Bong Bóng thả cần, có cá hiếm đang chờ cắn câu đấy!',
    },
    {
      id: 'fort_03',
      category: 'luck',
      title: 'Vạn Sự Hanh Thông',
      prophecy: 'Một ngày nhẹ nhõm như chú mèo nằm sưởi nắng bên bậu cửa sổ. Mọi muộn phiền sẽ tan biến.',
      luckyNumber: 3,
      luckyColor: 'Xanh Biển Nhạt',
      advice: 'Uống một ngụm sữa ấm, mỉm cười và nướng một xiên cá giòn rụm nha.',
    },
    {
      id: 'fort_04',
      category: 'cat_wisdom',
      title: 'Lời Khuyên Đại Tiên Mèo',
      prophecy: 'Mèo bảo: Ăn ngoan, ngủ đủ giấc và đừng quên vuốt ve boss mỗi ngày thì đời tự khắc nở hoa.',
      luckyNumber: 9,
      luckyColor: 'Trắng Kem',
      advice: 'Về nhà gãi cằm cho bé mèo của bà 3 cái để tích thêm may mắn!',
    },
    {
      id: 'fort_05',
      category: 'wealth',
      title: 'Quý Nhân Phù Trợ',
      prophecy: 'Sắp có một món quà bất ngờ hoặc một vị khách quý ghé thăm tiệm và mang lại niềm vui lớn.',
      luckyNumber: 6,
      luckyColor: 'Tím Oải Hương',
      advice: 'Giữ tâm trạng tích cực và trang trí căn nhà thật gọn gàng nhé.',
    },
    {
      id: 'fort_06',
      category: 'love',
      title: 'Trái Tim Rung Rinh',
      prophecy: 'Có người đang chuẩn bị tạo bất ngờ nho nhỏ cho bà. Hãy mở rộng trái tim đón nhận nhé!',
      luckyNumber: 2,
      luckyColor: 'Đỏ Dâu Tây',
      advice: 'Đừng ngại ngần bày tỏ sự yêu thương với những người bên cạnh.',
    },
    {
      id: 'fort_07',
      category: 'luck',
      title: 'Ngư Ông Đắc Lợi',
      prophecy: 'Hôm nay độ chính xác của bà cao vọt, nướng cá là vàng ruộm, thả cần là trúng phóc!',
      luckyNumber: 11,
      luckyColor: 'Xanh Mint',
      advice: 'Ghé Bếp Xèo Xèo trổ tài nướng cá 100 điểm hoàn hảo ngay!',
    },
  ];

  return {
    isEnabled: true,
    dailyFishingLimit: 12,
    dailyGrillingLimit: 12,
    fishingRewardMin: 5,
    fishingRewardMax: 20,
    grillingRewardPerfect: 20,
    grillingRewardGood: 10,
    grillingRewardBurnt: 2,
    fortuneRewardCoins: 10,
    fishCatalog,
    furnitureCatalog,
    fortuneCatalog,
  };
}

const CAT_BREEDS: { breed: CatBreed; color: string; defaultName: string }[] = [
  { breed: 'Mèo Cam', color: '#F4A261', defaultName: 'Bánh Mì Bo' },
  { breed: 'Mèo Mướp', color: '#A89F91', defaultName: 'Bé Mập' },
  { breed: 'Mèo Tam Thể', color: '#E76F51', defaultName: 'Hoa Cúc' },
  { breed: 'Mèo Trắng', color: '#FFFFFF', defaultName: 'Bông Gòn' },
  { breed: 'Mèo Đen', color: '#3D3A45', defaultName: 'Hạt Tiêu' },
  { breed: 'Mèo Xám', color: '#90A4AE', defaultName: 'Mây Khói' },
];

export function setupCatTownRoutes(
  app: express.Express,
  db: any,
  saveDatabase: () => void,
  authMiddleware: any,
  adminMiddleware: any,
  getVietnamDateStr: () => string
) {
  // Ensure DB arrays exist
  if (!db.cat_town_config) {
    db.cat_town_config = getDefaultCatTownConfig();
  }
  if (!db.cat_town_profiles) {
    db.cat_town_profiles = [];
  }

  function getOrCreateProfile(userId: string, username: string): CatTownUserProfile {
    let profile = db.cat_town_profiles.find((p: CatTownUserProfile) => p.userId === userId);
    const today = getVietnamDateStr();

    if (!profile) {
      // Pick random starter cat
      const randomCat = CAT_BREEDS[Math.floor(Math.random() * CAT_BREEDS.length)];
      profile = {
        userId,
        username,
        joinedTownAt: new Date().toISOString(),
        cat: {
          id: `cat_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
          userId,
          name: randomCat.defaultName,
          breed: randomCat.breed,
          happiness: 85,
          energy: 90,
          affection: 60,
          mood: 'happy',
          coatColor: randomCat.color,
          bornDate: today,
          lastInteractedAt: new Date().toISOString(),
        },
        house: {
          userId,
          wallpaper: 'furn_wall_strawberry',
          floor: 'furn_floor_tatami',
          placedItems: [
            {
              id: `item_${Date.now()}_1`,
              furnitureId: 'furn_cushion_pink',
              gridX: 2,
              gridY: 2,
            },
            {
              id: `item_${Date.now()}_2`,
              furnitureId: 'furn_milk_bowl',
              gridX: 4,
              gridY: 2,
            },
          ],
        },
        inventory: [
          {
            id: `inv_${Date.now()}_1`,
            userId,
            itemId: 'fish_bong_bong',
            itemType: 'fish',
            name: 'Cá Bong Bóng Pastel',
            quantity: 2,
            rarity: 'common',
          },
          {
            id: `inv_${Date.now()}_2`,
            userId,
            itemId: 'furn_yarn_toy',
            itemType: 'toy',
            name: 'Cuộn Len Cầu Vồng Vui Nhộn',
            quantity: 1,
          },
        ],
        dailyFishingCount: 0,
        dailyGrillingCount: 0,
        dailyFortuneClaimed: false,
        lastActionDate: today,
        stats: {
          totalFishCaught: 0,
          totalFishGrilled: 0,
          totalFortunesTold: 0,
          totalFurnitureBought: 0,
        },
      };
      db.cat_town_profiles.push(profile);
      saveDatabase();
    } else {
      // Check day rollover for daily counters
      if (profile.lastActionDate !== today) {
        profile.dailyFishingCount = 0;
        profile.dailyGrillingCount = 0;
        profile.dailyFortuneClaimed = false;
        profile.lastActionDate = today;
        saveDatabase();
      }
    }

    return profile;
  }

  // 1. GET PROFILE & CONFIG
  app.get('/api/cat-town/profile', authMiddleware, (req: Request, res: Response) => {
    const user = (req as any).user;
    const config: CatTownConfig = db.cat_town_config || getDefaultCatTownConfig();
    const profile = getOrCreateProfile(user.id, user.username);

    // Refresh wallet balance from DB
    const freshUser = db.users.find((u: any) => u.id === user.id);
    const balance = freshUser?.balance ?? user.balance ?? 0;

    res.json({
      success: true,
      profile,
      config,
      balance,
    });
  });

  // 2. ACTION: FISHING
  app.post('/api/cat-town/action/fish', authMiddleware, (req: Request, res: Response) => {
    const user = (req as any).user;
    const config: CatTownConfig = db.cat_town_config || getDefaultCatTownConfig();

    if (!config.isEnabled) {
      res.status(403).json({ error: 'Thị Trấn Cá Mèo hiện đang bảo trì cảnh quan. Vui lòng quay lại sau ít phút!' });
      return;
    }

    const profile = getOrCreateProfile(user.id, user.username);
    const today = getVietnamDateStr();

    if (profile.dailyFishingCount >= config.dailyFishingLimit) {
      res.status(400).json({
        error: `Bà đã câu hết ${config.dailyFishingLimit} lượt hôm nay rồi! Nghỉ ngơi dưỡng sức mai câu tiếp nhé 🐟✨`,
        dailyFishingCount: profile.dailyFishingCount,
      });
      return;
    }

    // Determine fish based on rarity RNG
    const catalog = config.fishCatalog && config.fishCatalog.length > 0 ? config.fishCatalog : getDefaultCatTownConfig().fishCatalog;
    const rand = Math.random() * 100;
    let chosenRarity = 'common';
    if (rand < 5) chosenRarity = 'legendary';
    else if (rand < 25) chosenRarity = 'rare';
    else if (rand < 55) chosenRarity = 'uncommon';
    else chosenRarity = 'common';

    const pool = catalog.filter((f) => f.rarity === chosenRarity);
    const pickedFish = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : catalog[0];

    const weight = Math.floor(Math.random() * (pickedFish.weightMax - pickedFish.weightMin + 1)) + pickedFish.weightMin;
    const rewardCoins = pickedFish.rewardCoins;

    // Update Profile Inventory & counters
    profile.dailyFishingCount += 1;
    profile.stats.totalFishCaught += 1;
    profile.lastActionDate = today;

    // Add to inventory
    const existing = profile.inventory.find((i) => i.itemId === pickedFish.id && i.itemType === 'fish');
    if (existing) {
      existing.quantity += 1;
    } else {
      profile.inventory.push({
        id: `inv_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
        userId: user.id,
        itemId: pickedFish.id,
        itemType: 'fish',
        name: pickedFish.name,
        quantity: 1,
        rarity: pickedFish.rarity,
        details: { weight },
      });
    }

    // Award Xu Cá directly to user's wallet
    const dbUser = db.users.find((u: any) => u.id === user.id);
    if (dbUser) {
      dbUser.balance = (dbUser.balance || 0) + rewardCoins;

      const tx: WalletTransaction = {
        id: `tx_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        userId: user.id,
        amount: rewardCoins,
        balanceAfter: dbUser.balance,
        type: 'CAT_TOWN_FISHING',
        description: `+${rewardCoins} Xu Cá - Câu được ${pickedFish.name} (${weight}g) tại Hồ Bong Bóng 🎣✨`,
        createdAt: new Date().toISOString(),
      };
      db.wallet_transactions = db.wallet_transactions || [];
      db.wallet_transactions.push(tx);
    }

    saveDatabase();

    res.json({
      success: true,
      message: `Tuyệt vời! Bà vừa câu được một chú ${pickedFish.name} (${weight}g)!`,
      fish: pickedFish,
      weight,
      rewardCoins,
      newBalance: dbUser?.balance || 0,
      dailyFishingCount: profile.dailyFishingCount,
      inventory: profile.inventory,
    });
  });

  // 3. ACTION: GRILLING FISH
  app.post('/api/cat-town/action/grill', authMiddleware, (req: Request, res: Response) => {
    const user = (req as any).user;
    const { fishItemId, doneness } = req.body; // doneness: 'undercooked' | 'perfect' | 'burnt'
    const config: CatTownConfig = db.cat_town_config || getDefaultCatTownConfig();

    if (!config.isEnabled) {
      res.status(403).json({ error: 'Bếp nướng đang bảo trì.' });
      return;
    }

    const profile = getOrCreateProfile(user.id, user.username);
    const today = getVietnamDateStr();

    if (profile.dailyGrillingCount >= config.dailyGrillingLimit) {
      res.status(400).json({
        error: `Bà đã nướng hết ${config.dailyGrillingLimit} mẻ cá hôm nay rồi!`,
      });
      return;
    }

    // Find and consume fish from inventory
    const fishIndex = profile.inventory.findIndex((i) => i.itemId === fishItemId && i.itemType === 'fish' && i.quantity > 0);
    if (fishIndex === -1) {
      res.status(400).json({ error: 'Bà chưa có loại cá này trong túi đồ để nướng!' });
      return;
    }

    // Deduct one fish
    profile.inventory[fishIndex].quantity -= 1;
    const fishName = profile.inventory[fishIndex].name;
    if (profile.inventory[fishIndex].quantity <= 0) {
      profile.inventory.splice(fishIndex, 1);
    }

    // Calculate coin reward
    let rewardCoins = config.grillingRewardGood;
    let label = 'vừa chín tới thơm ngậy';
    if (doneness === 'perfect') {
      rewardCoins = config.grillingRewardPerfect;
      label = 'chín vàng óng ả tuyệt hảo';
    } else if (doneness === 'burnt') {
      rewardCoins = config.grillingRewardBurnt;
      label = 'hơi quá lửa cháy sém';
    } else if (doneness === 'undercooked') {
      rewardCoins = Math.floor(config.grillingRewardGood * 0.6);
      label = 'hơi tái cần nướng thêm';
    }

    profile.dailyGrillingCount += 1;
    profile.stats.totalFishGrilled += 1;
    profile.lastActionDate = today;

    // Add cooked fish to inventory
    profile.inventory.push({
      id: `cooked_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      userId: user.id,
      itemId: `cooked_${fishItemId}`,
      itemType: 'cooked_fish',
      name: `Cá nướng (${fishName})`,
      quantity: 1,
      details: {
        quality: doneness,
        cookedAt: new Date().toISOString(),
      },
    });

    // Award Xu Cá
    const dbUser = db.users.find((u: any) => u.id === user.id);
    if (dbUser && rewardCoins > 0) {
      dbUser.balance = (dbUser.balance || 0) + rewardCoins;

      const tx: WalletTransaction = {
        id: `tx_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        userId: user.id,
        amount: rewardCoins,
        balanceAfter: dbUser.balance,
        type: 'CAT_TOWN_GRILLING',
        description: `+${rewardCoins} Xu Cá - Nướng thành công ${fishName} (${label}) tại Bếp Xèo Xèo 🐟🔥`,
        createdAt: new Date().toISOString(),
      };
      db.wallet_transactions = db.wallet_transactions || [];
      db.wallet_transactions.push(tx);
    }

    saveDatabase();

    res.json({
      success: true,
      message: `Đã nướng xong mẻ cá: ${label}!`,
      doneness,
      rewardCoins,
      newBalance: dbUser?.balance || 0,
      dailyGrillingCount: profile.dailyGrillingCount,
      inventory: profile.inventory,
    });
  });

  // 4. ACTION: FORTUNE TELLING
  app.post('/api/cat-town/action/fortune', authMiddleware, (req: Request, res: Response) => {
    const user = (req as any).user;
    const config: CatTownConfig = db.cat_town_config || getDefaultCatTownConfig();

    const profile = getOrCreateProfile(user.id, user.username);
    const today = getVietnamDateStr();

    const fortunes = config.fortuneCatalog && config.fortuneCatalog.length > 0 ? config.fortuneCatalog : getDefaultCatTownConfig().fortuneCatalog;
    const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];

    let rewardCoins = 0;
    const dbUser = db.users.find((u: any) => u.id === user.id);

    if (!profile.dailyFortuneClaimed) {
      profile.dailyFortuneClaimed = true;
      rewardCoins = config.fortuneRewardCoins;
      profile.stats.totalFortunesTold += 1;
      profile.lastActionDate = today;

      if (dbUser && rewardCoins > 0) {
        dbUser.balance = (dbUser.balance || 0) + rewardCoins;

        const tx: WalletTransaction = {
          id: `tx_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
          userId: user.id,
          amount: rewardCoins,
          balanceAfter: dbUser.balance,
          type: 'CAT_TOWN_FORTUNE',
          description: `+${rewardCoins} Xu Cá - Lời tiên tri đầu ngày từ Mèo Tiên Tri Meo Meo 🔮✨`,
          createdAt: new Date().toISOString(),
        };
        db.wallet_transactions = db.wallet_transactions || [];
        db.wallet_transactions.push(tx);
      }
      saveDatabase();
    }

    res.json({
      success: true,
      fortune: randomFortune,
      rewardCoins,
      claimedToday: profile.dailyFortuneClaimed,
      newBalance: dbUser?.balance || 0,
    });
  });

  // 5. ACTION: CAT CARE
  app.post('/api/cat-town/action/cat/care', authMiddleware, (req: Request, res: Response) => {
    const user = (req as any).user;
    const { actionType } = req.body; // 'feed' | 'pet' | 'play' | 'bath'
    const profile = getOrCreateProfile(user.id, user.username);
    const cat = profile.cat;

    if (actionType === 'feed') {
      cat.energy = Math.min(100, cat.energy + 20);
      cat.happiness = Math.min(100, cat.happiness + 15);
      cat.mood = 'happy';
    } else if (actionType === 'pet') {
      cat.affection = Math.min(100, cat.affection + 10);
      cat.happiness = Math.min(100, cat.happiness + 10);
      cat.mood = 'love';
    } else if (actionType === 'play') {
      cat.happiness = Math.min(100, cat.happiness + 25);
      cat.energy = Math.max(10, cat.energy - 10);
      cat.affection = Math.min(100, cat.affection + 15);
      cat.mood = 'playful';
    } else if (actionType === 'bath') {
      cat.happiness = Math.min(100, cat.happiness + 10);
      cat.mood = 'happy';
    }

    cat.lastInteractedAt = new Date().toISOString();
    saveDatabase();

    res.json({
      success: true,
      message: `Bé mèo ${cat.name} đã được chăm sóc cực kỳ chu đáo!`,
      cat,
    });
  });

  // 6. ACTION: RENAME CAT
  app.post('/api/cat-town/action/cat/rename', authMiddleware, (req: Request, res: Response) => {
    const user = (req as any).user;
    const { name } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Tên bé mèo không được để trống!' });
      return;
    }

    const profile = getOrCreateProfile(user.id, user.username);
    profile.cat.name = name.trim().slice(0, 30);
    saveDatabase();

    res.json({
      success: true,
      message: `Đã đổi tên bé mèo thành "${profile.cat.name}"!`,
      cat: profile.cat,
    });
  });

  // 7. FURNITURE SHOP: BUY ITEM
  app.post('/api/cat-town/shop/buy', authMiddleware, (req: Request, res: Response) => {
    const user = (req as any).user;
    const { furnitureId } = req.body;
    const config: CatTownConfig = db.cat_town_config || getDefaultCatTownConfig();

    const item = config.furnitureCatalog.find((f) => f.id === furnitureId);
    if (!item) {
      res.status(404).json({ error: 'Không tìm thấy vật phẩm nội thất này!' });
      return;
    }

    const dbUser = db.users.find((u: any) => u.id === user.id);
    if (!dbUser || (dbUser.balance || 0) < item.price) {
      res.status(400).json({ error: `Bà không đủ Xu Cá để mua món này! (Cần ${item.price} Xu Cá)` });
      return;
    }

    // Deduct Xu Cá
    dbUser.balance -= item.price;

    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      userId: user.id,
      amount: -item.price,
      balanceAfter: dbUser.balance,
      type: 'CAT_TOWN_FURNITURE',
      description: `-${item.price} Xu Cá - Mua nội thất: ${item.name} cho nhà mèo 🪑🏡`,
      createdAt: new Date().toISOString(),
    };
    db.wallet_transactions = db.wallet_transactions || [];
    db.wallet_transactions.push(tx);

    // Add to town inventory
    const profile = getOrCreateProfile(user.id, user.username);
    const existing = profile.inventory.find((i) => i.itemId === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      profile.inventory.push({
        id: `inv_furn_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
        userId: user.id,
        itemId: item.id,
        itemType: 'furniture',
        name: item.name,
        quantity: 1,
        details: { category: item.category },
      });
    }

    profile.stats.totalFurnitureBought += 1;
    saveDatabase();

    res.json({
      success: true,
      message: `Mua thành công ${item.name}! Vật phẩm đã được lưu vào túi đồ.`,
      newBalance: dbUser.balance,
      inventory: profile.inventory,
    });
  });

  // 8. HOUSE DECORATION: SAVE LAYOUT
  app.post('/api/cat-town/house/save', authMiddleware, (req: Request, res: Response) => {
    const user = (req as any).user;
    const { wallpaper, floor, placedItems } = req.body;
    const profile = getOrCreateProfile(user.id, user.username);

    if (wallpaper) profile.house.wallpaper = wallpaper;
    if (floor) profile.house.floor = floor;
    if (Array.isArray(placedItems)) profile.house.placedItems = placedItems;

    saveDatabase();

    res.json({
      success: true,
      message: 'Đã lưu thiết kế căn nhà ấm cúng của mèo thành công!',
      house: profile.house,
    });
  });

  // 9. ADMIN: GET STATS & CONFIG
  app.get('/api/admin/cat-town/stats', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
    const config = db.cat_town_config || getDefaultCatTownConfig();
    const profiles: CatTownUserProfile[] = db.cat_town_profiles || [];

    const totalResidents = profiles.length;
    let totalFishCaught = 0;
    let totalFishGrilled = 0;
    let totalFortunesTold = 0;
    let totalFurnitureBought = 0;

    for (const p of profiles) {
      totalFishCaught += p.stats?.totalFishCaught || 0;
      totalFishGrilled += p.stats?.totalFishGrilled || 0;
      totalFortunesTold += p.stats?.totalFortunesTold || 0;
      totalFurnitureBought += p.stats?.totalFurnitureBought || 0;
    }

    res.json({
      totalResidents,
      totalFishCaught,
      totalFishGrilled,
      totalFortunesTold,
      totalFurnitureBought,
      config,
    });
  });

  // 10. ADMIN: UPDATE CONFIG
  app.post('/api/admin/cat-town/config', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
    const admin = (req as any).user;
    const newConfig = req.body;

    if (!newConfig || typeof newConfig !== 'object') {
      res.status(400).json({ error: 'Cấu hình không hợp lệ.' });
      return;
    }

    db.cat_town_config = {
      ...getDefaultCatTownConfig(),
      ...newConfig,
    };

    db.admin_audit_logs = db.admin_audit_logs || [];
    db.admin_audit_logs.push({
      id: `log_${Date.now()}`,
      adminUsername: admin.username,
      action: 'UPDATE_CAT_TOWN_CONFIG',
      target: 'CatTownConfig',
      details: 'Cập nhật cấu hình trò chơi Thị Trấn Cá Mèo',
      timestamp: new Date().toISOString(),
    });

    saveDatabase();

    res.json({
      success: true,
      message: 'Đã lưu cấu hình Thị Trấn Cá Mèo thành công!',
      config: db.cat_town_config,
    });
  });
}
