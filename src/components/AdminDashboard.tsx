import React, { useState, useEffect } from 'react';
import { Character, RedeemCode, GachaConfig, Feedback, AdminAuditLog, Complaint, CharacterFeedback, SpecialOrder, LoyaltyCardConfig, LoyaltyCompletionLog } from '../types.ts';
import { ShieldCheck, Plus, Edit, Users, Gift, Dices, MessageSquare, History, Check, AlertCircle, AlertTriangle, MessageSquareHeart, Trash2, CheckCircle2, FileText, ToggleLeft, ToggleRight } from 'lucide-react';

interface AdminDashboardProps {
  authToken: string;
  onClose: () => void;
  onRefreshCharacters: () => void;
  onUpdateCharacters?: (characters: Character[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  authToken,
  onClose,
  onRefreshCharacters,
  onUpdateCharacters,
}) => {
  const [tab, setTab] = useState<'characters' | 'special_orders' | 'wallet' | 'loyalty' | 'gacha' | 'complaints' | 'fitbach' | 'feedbacks' | 'logs'>('characters');
  const [stats, setStats] = useState<any>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [redeemCodes, setRedeemCodes] = useState<RedeemCode[]>([]);
  const [gachaConfig, setGachaConfig] = useState<GachaConfig | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [characterFeedbacks, setCharacterFeedbacks] = useState<CharacterFeedback[]>([]);
  const [specialOrders, setSpecialOrders] = useState<SpecialOrder[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  // Loyalty Card Admin State
  const [loyaltyConfig, setLoyaltyConfig] = useState<LoyaltyCardConfig>({ isEnabled: true, rewardCoins: 50 });
  const [loyaltyLogs, setLoyaltyLogs] = useState<LoyaltyCompletionLog[]>([]);
  const [isSavingLoyalty, setIsSavingLoyalty] = useState(false);
  const [loyaltyFeedback, setLoyaltyFeedback] = useState<string | null>(null);

  // Character Form state
  const [editingChar, setEditingChar] = useState<Partial<Character> | null>(null);
  const [charError, setCharError] = useState<string | null>(null);
  const [charSuccess, setCharSuccess] = useState<string | null>(null);
  const [isSavingChar, setIsSavingChar] = useState<boolean>(false);

  // Balance adjustment state
  const [targetUsername, setTargetUsername] = useState('');
  const [adjustAmount, setAdjustAmount] = useState<number>(50);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustFeedback, setAdjustFeedback] = useState<string | null>(null);

  // New giftcode form state
  const [newCode, setNewCode] = useState('');
  const [newReward, setNewReward] = useState<number>(50);
  const [newMaxUses, setNewMaxUses] = useState<number>(500);

  // Complaints filter
  const [complaintFilter, setComplaintFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`/api/admin/dashboard?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Cache-Control': 'no-cache',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        setCharacters(data.characters || []);
        if (data.characters && onUpdateCharacters) {
          onUpdateCharacters(data.characters);
        }
        setUsers(data.users || []);
        setRedeemCodes(data.redeemCodes || []);
        setGachaConfig(data.gachaConfig || null);
        setFeedbacks(data.feedbacks || []);
        setComplaints(data.complaints || []);
        setCharacterFeedbacks(data.characterFeedbacks || []);
        setSpecialOrders(data.specialOrders || []);
        setAuditLogs(data.auditLogs || []);
        if (data.loyaltyConfig) setLoyaltyConfig(data.loyaltyConfig);
        if (data.loyaltyLogs) setLoyaltyLogs(data.loyaltyLogs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [authToken]);

  // Save Loyalty Config
  const handleSaveLoyaltyConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingLoyalty(true);
    setLoyaltyFeedback(null);
    try {
      const res = await fetch('/api/admin/loyalty-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(loyaltyConfig),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi lưu cấu hình.');
      setLoyaltyFeedback('✓ Cập nhật cấu hình Dấu Chân Khách Quen thành công!');
      fetchDashboardData();
    } catch (err: any) {
      setLoyaltyFeedback(`Lỗi: ${err.message}`);
    } finally {
      setIsSavingLoyalty(false);
    }
  };

  // Update Special Order Status
  const handleUpdateSpecialOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/special-orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to normalize URL
  const normalizeUrl = (url?: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  // Save Character
  const handleSaveCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    setCharError(null);
    setCharSuccess(null);

    const charName = (editingChar?.name || '').trim();
    const studioLink = (editingChar?.studioUrl || 'https://aistudio.google.com/').trim();
    const priceVal = editingChar?.price;
    const numericPrice = Number(priceVal);

    if (!charName) {
      setCharError('Vui lòng nhập Họ và tên cho nhân vật.');
      return;
    }
    if (priceVal === undefined || priceVal === null || isNaN(numericPrice) || numericPrice < 0) {
      setCharError('Vui lòng nhập giá bán hợp lệ (từ 0 Xu Cá trở lên).');
      return;
    }

    const payload = {
      ...editingChar,
      name: charName,
      price: numericPrice,
      studioUrl: normalizeUrl(studioLink) || 'https://aistudio.google.com/',
      avatarUrl: normalizeUrl(editingChar?.avatarUrl),
      receiptAvatarUrl: normalizeUrl(editingChar?.receiptAvatarUrl),
    };

    setIsSavingChar(true);

    try {
      const res = await fetch('/api/admin/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setCharSuccess('✓ Đã lưu thông tin nhân vật thành công!');
        if (data.characters) {
          setCharacters(data.characters);
          if (onUpdateCharacters) {
            onUpdateCharacters(data.characters);
          }
        }
        fetchDashboardData();
        onRefreshCharacters();
        setTimeout(() => {
          setEditingChar(null);
          setCharSuccess(null);
        }, 800);
      } else {
        setCharError(data.error || 'Không thể lưu nhân vật. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err: any) {
      console.error(err);
      setCharError(err.message || 'Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsSavingChar(false);
    }
  };

  // Adjust User Balance
  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustFeedback(null);
    if (!targetUsername || !adjustAmount) return;

    try {
      const res = await fetch('/api/admin/users/adjust-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          targetUsername,
          amount: adjustAmount,
          reason: adjustReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdjustFeedback(`Đã cập nhật số dư cho @${data.targetUsername}: Số dư mới là ${data.updatedBalance} Xu.`);
        setTargetUsername('');
        setAdjustReason('');
        fetchDashboardData();
      } else {
        setAdjustFeedback(data.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Giftcode
  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newReward) return;

    try {
      const res = await fetch('/api/admin/redeem-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          code: newCode,
          rewardCoins: newReward,
          maxUses: newMaxUses,
        }),
      });
      if (res.ok) {
        setNewCode('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Complaint Status
  const handleToggleComplaintStatus = async (complaintId: string, currentStatus: 'pending' | 'resolved') => {
    const nextStatus = currentStatus === 'pending' ? 'resolved' : 'pending';
    try {
      const res = await fetch(`/api/admin/complaints/${complaintId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Character Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Quý khách có chắc muốn xóa bình luận này không?')) return;
    try {
      const res = await fetch(`/api/admin/character-comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pendingComplaintsCount = complaints.filter((c) => c.status === 'pending').length;
  const filteredComplaints = complaints.filter((c) => {
    if (complaintFilter === 'pending') return c.status === 'pending';
    if (complaintFilter === 'resolved') return c.status === 'resolved';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FFF9F4] p-5 sm:p-6 rounded-3xl border-2 border-[#795653]/30 shadow-kawaii flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F7DDA0] text-[#795653] flex items-center justify-center font-bold text-xl border border-[#795653]/20 shadow-xs">
            👑
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#795653]">
              Ban Quản Trị Tiệm Cá (Admin Dashboard)
            </h2>
            <p className="text-xs text-[#795653]/70">
              Phân quyền bảo mật máy chủ RBAC. Quản lý nhân vật, xu cá, báo lỗi complain và fít bách.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="py-2 px-4 rounded-xl border border-[#795653]/30 hover:bg-[#795653]/10 text-xs font-bold self-start sm:self-auto cursor-pointer"
        >
          Quay lại Tiệm Cá
        </button>
      </div>

      {/* KPI Stats Strip */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[#FFF9F4] border border-[#795653]/20">
            <span className="text-[11px] font-bold text-[#795653]/60">Tổng người dùng</span>
            <div className="text-xl font-black text-[#795653] mt-1 tabular-nums">{stats.totalUsers}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#FFF9F4] border border-[#795653]/20">
            <span className="text-[11px] font-bold text-[#795653]/60">Nam chính mở bán</span>
            <div className="text-xl font-black text-[#795653] mt-1 tabular-nums">{stats.totalCharacters}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#FFF9F4] border border-[#795653]/20">
            <span className="text-[11px] font-bold text-[#795653]/60">Đơn mua cá thành công</span>
            <div className="text-xl font-black text-[#A6536A] mt-1 tabular-nums">{stats.totalOrders}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#FFF9F4] border border-[#795653]/20">
            <span className="text-[11px] font-bold text-[#795653]/60">Báo lỗi chưa xử lý</span>
            <div className="text-xl font-black text-amber-600 mt-1 tabular-nums">{pendingComplaintsCount}</div>
          </div>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex p-1 bg-[#795653]/10 rounded-2xl overflow-x-auto scrollbar-none">
        <button
          onClick={() => setTab('characters')}
          className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            tab === 'characters' ? 'bg-[#F6A6B8] text-[#795653] shadow-xs' : 'text-[#795653]/70 hover:text-[#795653]'
          }`}
        >
          🧑‍🎨 Quản Lý Nhân Vật
        </button>
        <button
          onClick={() => setTab('special_orders')}
          className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            tab === 'special_orders' ? 'bg-[#F6A6B8] text-[#795653] shadow-xs' : 'text-[#795653]/70 hover:text-[#795653]'
          }`}
        >
          📝 Phiếu Đặt Cá ({specialOrders.length})
        </button>
        <button
          onClick={() => setTab('complaints')}
          className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            tab === 'complaints' ? 'bg-[#F6A6B8] text-[#795653] shadow-xs' : 'text-[#795653]/70 hover:text-[#795653]'
          }`}
        >
          <span>⚠️ Báo Lỗi / Complain</span>
          {pendingComplaintsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
              {pendingComplaintsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('fitbach')}
          className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            tab === 'fitbach' ? 'bg-[#F6A6B8] text-[#795653] shadow-xs' : 'text-[#795653]/70 hover:text-[#795653]'
          }`}
        >
          💬 Fít Bách ({characterFeedbacks.length})
        </button>
        <button
          onClick={() => setTab('wallet')}
          className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            tab === 'wallet' ? 'bg-[#F6A6B8] text-[#795653] shadow-xs' : 'text-[#795653]/70 hover:text-[#795653]'
          }`}
        >
          👛 Xu Cá & Giftcode
        </button>
        <button
          onClick={() => setTab('loyalty')}
          className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            tab === 'loyalty' ? 'bg-[#F6A6B8] text-[#795653] shadow-xs' : 'text-[#795653]/70 hover:text-[#795653]'
          }`}
        >
          <span>🐾 Dấu Chân Khách Quen</span>
        </button>
        <button
          onClick={() => setTab('feedbacks')}
          className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            tab === 'feedbacks' ? 'bg-[#F6A6B8] text-[#795653] shadow-xs' : 'text-[#795653]/70 hover:text-[#795653]'
          }`}
        >
          💌 Hộp Thư Góp Ý ({feedbacks.length})
        </button>
        <button
          onClick={() => setTab('logs')}
          className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            tab === 'logs' ? 'bg-[#F6A6B8] text-[#795653] shadow-xs' : 'text-[#795653]/70 hover:text-[#795653]'
          }`}
        >
          🛡️ Nhật Ký Audit Logs
        </button>
      </div>

      {/* Tab 1: Characters Management */}
      {tab === 'characters' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-extrabold text-[#795653]">
              Danh sách nam chính trong tiệm
            </h3>
            <button
              onClick={() => {
                setEditingChar({ name: '', fishCode: `CK-${String(characters.length + 1).padStart(3, '0')}`, price: 30, age: 22, category: 'khô thượng phẩm', isAvailable: true, studioUrl: 'https://aistudio.google.com/prompt/', backstory: '', openScene: '' });
                setCharError(null);
                setCharSuccess(null);
              }}
              className="py-2 px-4 rounded-xl bg-[#F6A6B8] hover:bg-[#f391a6] text-[#795653] text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Nam Chính Mới</span>
            </button>
          </div>

          {/* Form Modal / Drawer */}
          {editingChar && (
            <div className="p-5 rounded-3xl bg-white border-2 border-[#795653]/30 shadow-md">
              <div className="flex items-center justify-between mb-3 border-b border-[#795653]/15 pb-2">
                <h4 className="text-sm font-black text-[#795653]">
                  {editingChar.id ? `Chỉnh sửa nhân vật: ${editingChar.name || ''}` : 'Thêm nhân vật mới'}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setEditingChar(null);
                    setCharError(null);
                    setCharSuccess(null);
                  }}
                  className="text-xs text-[#795653]/60 hover:text-[#795653] font-bold cursor-pointer"
                >
                  ✕ Đóng
                </button>
              </div>

              {/* Error & Success Feedback Banners */}
              {charError && (
                <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{charError}</span>
                </div>
              )}
              {charSuccess && (
                <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{charSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveCharacter} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-[#795653]">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Cố Diễn"
                      value={editingChar.name || ''}
                      onChange={(e) => setEditingChar({ ...editingChar, name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#795653]/25 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#795653]">Mã cá khô (Mã cá)</label>
                    <input
                      type="text"
                      placeholder="VD: CK-001"
                      value={editingChar.fishCode || ''}
                      onChange={(e) => setEditingChar({ ...editingChar, fishCode: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#795653]/25 text-xs font-mono font-bold uppercase text-[#A6536A]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#795653]">Tuổi</label>
                    <input
                      type="number"
                      value={editingChar.age || 20}
                      onChange={(e) => setEditingChar({ ...editingChar, age: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#795653]/25 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#795653]">Thể loại (Category)</label>
                    <input
                      type="text"
                      placeholder="VD: khô thượng phẩm"
                      value={editingChar.category || ''}
                      onChange={(e) => setEditingChar({ ...editingChar, category: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#795653]/25 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#795653]">
                      Giá bán (Xu Cá) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editingChar.price !== undefined ? editingChar.price : 30}
                      onChange={(e) => setEditingChar({ ...editingChar, price: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#795653]/25 text-xs font-bold text-[#526C91]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#795653]">
                      Link Google AI Studio ("Nhận Cá") <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="https://aistudio.google.com/prompt/..."
                      value={editingChar.studioUrl || ''}
                      onChange={(e) => setEditingChar({ ...editingChar, studioUrl: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#795653]/25 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#795653]">Link ảnh Card (Chân dung chính)</label>
                    <input
                      type="text"
                      value={editingChar.avatarUrl || ''}
                      onChange={(e) => setEditingChar({ ...editingChar, avatarUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/... hoặc link ảnh bất kỳ"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#795653]/25 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#A6536A] flex items-center gap-1">
                      <span>💐 Link ảnh trên Receipt (Hóa đơn)</span>
                      <span className="text-[10px] text-[#795653]/60 font-normal">(Không liên quan ảnh card)</span>
                    </label>
                    <input
                      type="text"
                      value={editingChar.receiptAvatarUrl || ''}
                      onChange={(e) => setEditingChar({ ...editingChar, receiptAvatarUrl: e.target.value })}
                      placeholder="Để trống sẽ mặc định dùng ảnh Card..."
                      className="w-full px-3 py-1.5 rounded-lg border border-[#A6536A]/40 bg-[#FFF9F4] text-xs font-medium focus:ring-1 focus:ring-[#F6A6B8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#795653]">Giới thiệu ngắn (Short Bio)</label>
                  <textarea
                    rows={2}
                    value={editingChar.shortBio || ''}
                    onChange={(e) => setEditingChar({ ...editingChar, shortBio: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#795653]/25 text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-extrabold text-[#795653]">
                      Back-story (Cốt truyện chi tiết nhân vật)
                    </label>
                    <span className="text-[10px] text-[#795653]/60 font-medium">Khung nhập mở rộng cho phép kéo giãn & soạn thảo văn bản dài</span>
                  </div>
                  <textarea
                    rows={10}
                    placeholder="Bối cảnh thân thế, quá khứ, tính cách, thói quen, mối liên hệ với tiệm cá khô..."
                    value={editingChar.backstory || ''}
                    onChange={(e) => setEditingChar({ ...editingChar, backstory: e.target.value })}
                    className="w-full min-h-[200px] p-3 rounded-xl border border-[#795653]/30 text-xs font-medium leading-relaxed bg-[#FFF9F4]/40 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F6A6B8] resize-y shadow-inner"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-extrabold text-[#795653]">
                      Open-scene (Kịch bản phân cảnh mở đầu)
                    </label>
                    <span className="text-[10px] text-[#795653]/60 font-medium">Kịch bản chi tiết để người dùng copy paste vào AI Studio</span>
                  </div>
                  <textarea
                    rows={10}
                    placeholder="Đoạn văn mở màn kịch bản, câu thoại đầu tiên, hành động mở đầu..."
                    value={editingChar.openScene || ''}
                    onChange={(e) => setEditingChar({ ...editingChar, openScene: e.target.value })}
                    className="w-full min-h-[200px] p-3 rounded-xl border border-[#795653]/30 text-xs font-medium leading-relaxed bg-[#FFF9F4]/40 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F6A6B8] resize-y shadow-inner"
                  />
                </div>

                {/* Feedback Banner above action buttons */}
                {charError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{charError}</span>
                  </div>
                )}
                {charSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-pulse">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{charSuccess}</span>
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingChar(null);
                      setCharError(null);
                      setCharSuccess(null);
                    }}
                    className="py-1.5 px-4 rounded-lg border border-[#795653]/20 hover:bg-[#795653]/10 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingChar}
                    className="py-2.5 px-6 rounded-xl bg-[#F6A6B8] hover:bg-[#f391a6] active:scale-95 text-[#795653] text-xs font-black shadow-xs cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {isSavingChar ? (
                      <>
                        <span className="inline-block w-3.5 h-3.5 border-2 border-[#795653] border-t-transparent rounded-full animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <span>Lưu Nhân Vật</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Characters Table */}
          <div className="bg-white rounded-3xl border border-[#795653]/20 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-[#795653]">
              <thead className="bg-[#FFF9F4] border-b border-[#795653]/15 font-black uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Nhân vật</th>
                  <th className="p-3">Mã cá</th>
                  <th className="p-3">Thể loại</th>
                  <th className="p-3">Giá</th>
                  <th className="p-3">Đã bán</th>
                  <th className="p-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#795653]/10">
                {characters.map((c) => (
                  <tr key={c.id} className="hover:bg-amber-50/50">
                    <td className="p-3 flex items-center gap-2.5">
                      <img src={c.avatarUrl} alt="" className="w-8 h-10 rounded-lg object-cover" />
                      <div>
                        <div className="font-bold">{c.name}</div>
                        <div className="text-[10px] text-[#795653]/60">{c.age} tuổi</div>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-[#A6536A]">{c.fishCode || 'CK-001'}</td>
                    <td className="p-3 font-semibold">{c.category}</td>
                    <td className="p-3 font-black text-[#526C91]">{c.price} Xu</td>
                    <td className="p-3 font-semibold">{c.salesCount || 0}</td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setEditingChar({ ...c });
                          setCharError(null);
                          setCharSuccess(null);
                        }}
                        className="p-1.5 rounded-lg border border-[#795653]/20 hover:bg-[#F6A6B8]/30 cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Complaints Management (Báo lỗi) */}
      {tab === 'complaints' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-[#795653]">
                Quản Lý Báo Lỗi / Complain Nhân Vật
              </h3>
              <p className="text-xs text-[#795653]/70">
                Tiếp nhận phản hồi về link AI Studio, kịch bản hoặc lỗi hiển thị của các nam chính.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-[#795653]/10 p-1 rounded-xl">
              <button
                onClick={() => setComplaintFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  complaintFilter === 'all' ? 'bg-[#F6A6B8] text-[#795653]' : 'text-[#795653]/70'
                }`}
              >
                Tất cả ({complaints.length})
              </button>
              <button
                onClick={() => setComplaintFilter('pending')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  complaintFilter === 'pending' ? 'bg-amber-400 text-[#795653]' : 'text-[#795653]/70'
                }`}
              >
                Chưa xử lý ({pendingComplaintsCount})
              </button>
              <button
                onClick={() => setComplaintFilter('resolved')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  complaintFilter === 'resolved' ? 'bg-emerald-500 text-white' : 'text-[#795653]/70'
                }`}
              >
                Đã fix ({complaints.length - pendingComplaintsCount})
              </button>
            </div>
          </div>

          {filteredComplaints.length === 0 ? (
            <div className="p-12 text-center bg-white/70 rounded-3xl border border-dashed border-[#795653]/20">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-xs font-bold text-[#795653]">Không có báo lỗi nào trong danh sách!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((comp) => {
                const isPending = comp.status === 'pending';
                return (
                  <div
                    key={comp.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-[#795653]/20 shadow-2xs space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#795653]/10 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-[#795653]">
                          {comp.characterName}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          {comp.issueType}
                        </span>
                        <span className="text-xs text-[#795653]/70">
                          báo bởi: <strong>@{comp.username}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] text-[#795653]/60">
                          {new Date(comp.createdAt).toLocaleString('vi-VN')}
                        </span>
                        <button
                          onClick={() => handleToggleComplaintStatus(comp.id, comp.status)}
                          className={`py-1 px-3 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-emerald-100 hover:text-emerald-900'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-amber-100 hover:text-amber-900'
                          }`}
                          title="Bấm để đổi trạng thái"
                        >
                          {isPending ? (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>CHƯA XỬ LÝ (ĐỔI SANG ĐÃ FIX)</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>ĐÃ FIX ✓</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#795653]/90 leading-relaxed font-medium whitespace-pre-line bg-[#FFF9F4] p-3 rounded-xl border border-[#795653]/10">
                      {comp.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Character Feedbacks (FÍT BÁCH) */}
      {tab === 'fitbach' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-[#795653]">
              Quản Lý Fít Bách / Bình Luận Về Nhân Vật
            </h3>
            <p className="text-xs text-[#795653]/70">
              Kiểm duyệt các đánh giá, cảm nghĩ độc giả để lại cho từng chàng cá khô. Xóa bình luận tiêu cực/spam.
            </p>
          </div>

          {characterFeedbacks.length === 0 ? (
            <div className="p-12 text-center bg-white/70 rounded-3xl border border-dashed border-[#795653]/20">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-xs font-bold text-[#795653]">Chưa có bình luận fít bách nào!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {characterFeedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="p-4 rounded-2xl bg-white border border-[#795653]/20 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-[#795653]">{fb.characterName}</span>
                      <span className="text-xs text-[#795653]/70">· Người gửi: <strong>@{fb.username}</strong></span>
                      <span className="text-amber-500 font-bold text-xs">
                        {'★'.repeat(fb.rating || 5)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#795653]/60">
                        {new Date(fb.createdAt).toLocaleString('vi-VN')}
                      </span>
                      <button
                        onClick={() => handleDeleteComment(fb.id)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Xóa bình luận"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#795653]/90 leading-relaxed font-medium bg-[#FFF9F4] p-3 rounded-xl border border-[#795653]/10 whitespace-pre-line">
                    {fb.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Wallet & Giftcode */}
      {tab === 'wallet' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Adjust User Balance */}
          <div className="p-5 rounded-3xl bg-white border border-[#795653]/20 space-y-3 shadow-xs">
            <h4 className="text-sm font-black text-[#795653]">
              Điều chỉnh số dư Xu Cá cho người dùng
            </h4>
            {adjustFeedback && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                {adjustFeedback}
              </div>
            )}
            <form onSubmit={handleAdjustBalance} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#795653]">Tên đăng nhập (Username)</label>
                <input
                  type="text"
                  required
                  placeholder="VD: khach_yeu_ca"
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#795653]/25 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#795653]">Số Xu thay đổi (+/-)</label>
                  <input
                    type="number"
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#795653]/25 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#795653]">Lý do điều chỉnh</label>
                  <input
                    type="text"
                    placeholder="VD: Thưởng sự kiện Discord"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#795653]/25 text-xs"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-[#A9C5F2] hover:bg-[#97b7e8] text-[#526C91] font-black text-xs cursor-pointer"
              >
                Xác Nhận Điều Chỉnh Số Dư
              </button>
            </form>
          </div>

          {/* Create Giftcode */}
          <div className="p-5 rounded-3xl bg-white border border-[#795653]/20 space-y-3 shadow-xs">
            <h4 className="text-sm font-black text-[#795653]">
              Phát hành Giftcode Xu Cá mới
            </h4>
            <form onSubmit={handleCreateCode} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#795653]">Mã Code (In hoa)</label>
                <input
                  type="text"
                  required
                  placeholder="VD: BANMECA2026"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#795653]/25 text-xs font-mono font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#795653]">Số Xu thưởng</label>
                  <input
                    type="number"
                    required
                    value={newReward}
                    onChange={(e) => setNewReward(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#795653]/25 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#795653]">Lượt dùng tối đa</label>
                  <input
                    type="number"
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#795653]/25 text-xs"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-[#F6A6B8] hover:bg-[#f391a6] text-[#795653] font-black text-xs cursor-pointer"
              >
                Tạo Mã Giftcode
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Dấu Chân Khách Quen (Paw Loyalty Card) */}
      {tab === 'loyalty' && (
        <div className="space-y-6">
          {/* Header & KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-[#795653]/20 shadow-2xs">
              <span className="text-[11px] font-bold text-[#795653]/60">Trạng thái tính năng</span>
              <div className="text-lg font-black mt-1 flex items-center gap-1.5">
                {loyaltyConfig.isEnabled ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> ĐANG BẬT
                  </span>
                ) : (
                  <span className="text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> ĐANG TẮT
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#795653]/20 shadow-2xs">
              <span className="text-[11px] font-bold text-[#795653]/60">Tổng lượt hoàn thành chu kỳ</span>
              <div className="text-xl font-black text-[#D81C63] mt-1 tabular-nums">
                {loyaltyLogs.length} chu kỳ
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#795653]/20 shadow-2xs">
              <span className="text-[11px] font-bold text-[#795653]/60">Tổng Xu Cá đã phát thưởng</span>
              <div className="text-xl font-black text-[#0A5EB0] mt-1 tabular-nums">
                {loyaltyLogs.reduce((sum, l) => sum + (l.rewardCoins || 0), 0)} Xu
              </div>
            </div>
          </div>

          {/* Module Cấu Hình */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-[#795653]/20 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#795653]/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐾</span>
                <div>
                  <h3 className="text-base font-black text-[#795653]">
                    Cấu Hình Dấu Chân Khách Quen
                  </h3>
                  <p className="text-xs text-[#795653]/70">
                    Tùy chỉnh số lượng xu thưởng hoàn thành thẻ 7 ngày và trạng thái hoạt động của tính năng.
                  </p>
                </div>
              </div>
            </div>

            {loyaltyFeedback && (
              <div
                className={`p-3 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
                  loyaltyFeedback.startsWith('✓')
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}
              >
                <span>{loyaltyFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSaveLoyaltyConfig} className="space-y-4 max-w-lg">
              {/* Toggle switch Bật / Tắt */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9F4] border border-[#795653]/20">
                <div>
                  <label className="text-xs font-black text-[#795653] block">
                    Bật / Tắt tính năng
                  </label>
                  <span className="text-[11px] text-[#795653]/70">
                    {loyaltyConfig.isEnabled
                      ? 'Người dùng có thể điểm danh và nhận thưởng bình thường.'
                      : 'Tính năng sẽ tạm khóa và hiển thị thông báo bảo trì.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setLoyaltyConfig((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))
                  }
                  className="p-1 cursor-pointer transition-transform active:scale-95"
                >
                  {loyaltyConfig.isEnabled ? (
                    <ToggleRight className="w-9 h-9 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Số Xu Cá thưởng khi đạt 7 ngày */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#795653]">
                  Số Xu Cá thưởng khi đạt 7 ngày (Hoàn thành chu kỳ):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={loyaltyConfig.rewardCoins}
                    onChange={(e) =>
                      setLoyaltyConfig((prev) => ({
                        ...prev,
                        rewardCoins: Math.max(0, parseInt(e.target.value, 10) || 0),
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#795653]/30 bg-[#FFF9F4] text-sm font-black text-[#D81C63] focus:outline-hidden focus:ring-2 focus:ring-[#FF8FAB]"
                    placeholder="VD: 50"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-[#795653]/60">
                    Xu Cá
                  </span>
                </div>
                <p className="text-[11px] text-[#795653]/65">
                  Số xu này sẽ tự động cộng vào Ví Xu Cá của người dùng khi đóng đủ 7/7 dấu chân.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSavingLoyalty}
                className="py-2.5 px-6 rounded-xl bg-[#F6A6B8] hover:bg-[#f391a6] text-[#795653] font-black text-xs uppercase tracking-wider shadow-xs cursor-pointer active:scale-95 transition-all disabled:opacity-50"
              >
                {isSavingLoyalty ? 'Đang lưu...' : 'Lưu Cấu Hình Dấu Chân'}
              </button>
            </form>
          </div>

          {/* Bảng Log Lịch Sử Hoàn Thành Chu Kỳ */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#795653]/20 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#795653]/10 pb-3">
              <div>
                <h3 className="text-base font-black text-[#795653] flex items-center gap-1.5">
                  <span>📜</span>
                  <span>Bảng Log Lịch Sử Hoàn Thành Chu Kỳ (Mới nhất lên đầu)</span>
                </h3>
                <p className="text-xs text-[#795653]/70">
                  Ghi nhận tự động các lần người dùng tích lũy đủ 7/7 dấu chân và nhận thưởng xu.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFE5EC] text-[#D81C63] border border-[#FF8FAB]/40">
                Tổng {loyaltyLogs.length} lượt
              </span>
            </div>

            {loyaltyLogs.length === 0 ? (
              <div className="p-8 text-center bg-[#FFF9F4] rounded-2xl border border-dashed border-[#795653]/20 text-xs text-[#795653]/70">
                🐾 Chưa có lượt hoàn thành chu kỳ nào được ghi nhận.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#795653]/15 text-[#795653]/70">
                      <th className="py-2.5 px-3 font-extrabold">Thời gian</th>
                      <th className="py-2.5 px-3 font-extrabold">Người dùng</th>
                      <th className="py-2.5 px-3 font-extrabold">Chu kỳ</th>
                      <th className="py-2.5 px-3 font-extrabold text-right">Xu nhận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#795653]/10">
                    {loyaltyLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#FFF9F4]/70 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap text-[#795653]/80">
                          {new Date(log.completedAt).toLocaleString('vi-VN', {
                            timeZone: 'Asia/Ho_Chi_Minh',
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#795653]">
                          {log.username}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-[#FFE5EC] text-[#D81C63] font-bold text-[11px] border border-[#FF8FAB]/30">
                            Chu kỳ #{log.cycleNumber}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-black text-emerald-700 text-right whitespace-nowrap">
                          +{log.rewardCoins} Xu Cá
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Feedbacks */}
      {tab === 'feedbacks' && (
        <div className="space-y-3">
          <h3 className="text-base font-extrabold text-[#795653]">
            Hộp thư ý kiến chung từ người dùng (Mới nhất lên đầu)
          </h3>
          {feedbacks.length === 0 ? (
            <div className="p-8 text-center bg-white/50 rounded-2xl border border-[#795653]/15 text-xs text-[#795653]/70">
              Chưa có góp ý nào từ độc giả.
            </div>
          ) : (
            feedbacks.map((fb) => (
              <div key={fb.id} className="p-4 rounded-2xl bg-white border border-[#795653]/15 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#A6536A]">{fb.username} ({fb.type})</span>
                  <span className="text-[10px] text-[#795653]/60">{new Date(fb.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <p className="text-sm font-medium text-[#795653] pt-1">{fb.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 6: Audit Logs */}
      {tab === 'logs' && (
        <div className="space-y-2">
          <h3 className="text-base font-extrabold text-[#795653]">
            Nhật ký kiểm toán hệ thống (Audit Logs)
          </h3>
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3 rounded-xl bg-white border border-[#795653]/15 text-xs flex justify-between items-center">
              <div>
                <span className="font-bold text-[#526C91]">[{log.action}]</span> {log.details}
              </div>
              <span className="text-[10px] text-[#795653]/60 shrink-0 ml-2">
                {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Special Orders Management */}
      {tab === 'special_orders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-extrabold text-[#795653]">
              Danh sách Phiếu Đặt Cá Theo Yêu Cầu ({specialOrders.length})
            </h3>
            <span className="text-xs text-[#795653]/70">
              Nhận trực tiếp từ khách hàng gửi qua Phiếu Đặt Cá
            </span>
          </div>

          {specialOrders.length === 0 ? (
            <div className="p-8 text-center bg-white/50 rounded-2xl border border-[#795653]/15 text-xs text-[#795653]/70">
              Chưa có phiếu đặt cá nào từ khách hàng.
            </div>
          ) : (
            <div className="space-y-3">
              {specialOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-[#795653]/20 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#795653]/10 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-[#D6336C] text-sm">
                        {order.requestId}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFE5EC] text-[#E13F7C] border border-[#FF8FAB]/40">
                        {order.requestTypeName}
                      </span>
                      <span className="text-xs text-[#795653]/70">
                        bởi <span className="font-bold text-[#795653]">@{order.username}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#795653]/60">
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.characterName && (
                      <div className="text-xs">
                        <span className="font-bold text-[#E13F7C]">🐟 Tên cá: </span>
                        <span className="font-extrabold text-[#795653]">{order.characterName}</span>
                      </div>
                    )}
                    {order.fishType && (
                      <div className="text-xs">
                        <span className="font-bold text-[#526C91]">🏷️ Loại cá / Thể loại: </span>
                        <span className="font-medium text-[#795653]">{order.fishType}</span>
                      </div>
                    )}
                    {order.description && (
                      <div>
                        <span className="text-[11px] font-bold text-[#795653] block mb-0.5">
                          📝 Miêu tả cá khô:
                        </span>
                        <p className="text-xs text-[#795653]/90 whitespace-pre-wrap leading-relaxed bg-[#FFF9F4] p-2.5 rounded-xl border border-[#795653]/10">
                          {order.description}
                        </p>
                      </div>
                    )}
                    {order.plotIdea && (
                      <div>
                        <span className="text-[11px] font-bold text-[#A6536A] block mb-0.5">
                          📖 Ý tưởng cốt truyện:
                        </span>
                        <p className="text-xs text-[#795653]/90 whitespace-pre-wrap leading-relaxed bg-[#FFF9F4] p-2.5 rounded-xl border border-[#795653]/10">
                          {order.plotIdea}
                        </p>
                      </div>
                    )}
                    {(order.extraNotes || order.note) && (
                      <div className="text-xs text-[#795653]/80 bg-[#FFF9F4]/60 p-2 rounded-xl border border-dashed border-[#795653]/15">
                        <span className="font-bold text-[#E13F7C]">💌 Thông tin khác / Lời nhắn: </span>
                        {order.extraNotes || order.note}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[11px] text-[#795653]/70 font-semibold">
                      Chuyển trạng thái:
                    </span>
                    <div className="flex gap-1.5 flex-wrap">
                      {['received', 'in_review', 'accepted', 'completed', 'declined'].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateSpecialOrderStatus(order.id, st)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            order.status === st
                              ? 'bg-[#E13F7C] text-white'
                              : 'bg-white border border-[#795653]/20 hover:bg-[#FFE5EC] text-[#795653]'
                          }`}
                        >
                          {st === 'received'
                            ? 'Đã nhận'
                            : st === 'in_review'
                            ? 'Đang xem xét'
                            : st === 'accepted'
                            ? 'Duyệt làm'
                            : st === 'completed'
                            ? 'Hoàn thành'
                            : 'Từ chối'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
