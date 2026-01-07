import { useState, useEffect } from 'react';
import { FiBox, FiTrendingUp, FiTrendingDown, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { inventoryApi } from '../api';
import useAuthStore from '../hooks/useAuth';

export default function Inventory() {
    const { isAdmin } = useAuthStore();
    const [stocks, setStocks] = useState([]);
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
    const [adjustmentData, setAdjustmentData] = useState({ product_id: '', quantity: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [stockRes, movRes] = await Promise.all([
                inventoryApi.getStock(),
                isAdmin() ? inventoryApi.getMovements({ per_page: 20 }) : Promise.resolve({ data: [] }),
            ]);
            setStocks(stockRes.data || []);
            setMovements(movRes.data?.data || movRes.data || []);
        } catch (error) {
            toast.error('Gagal memuat data stok');
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustment = async (e) => {
        e.preventDefault();
        try {
            await inventoryApi.adjustment(adjustmentData);
            toast.success('Penyesuaian stok berhasil');
            setShowAdjustmentModal(false);
            setAdjustmentData({ product_id: '', quantity: '' });
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyesuaikan stok');
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const movementTypeLabels = {
        PRODUCTION_IN: { label: 'Produksi', icon: FiTrendingUp, color: 'text-green-600 bg-green-100' },
        SALE_FACTORY: { label: 'Jual Pabrik', icon: FiTrendingDown, color: 'text-red-600 bg-red-100' },
        SALE_FIELD: { label: 'Jual Lapangan', icon: FiTrendingDown, color: 'text-orange-600 bg-orange-100' },
        ADJUSTMENT: { label: 'Penyesuaian', icon: FiRefreshCw, color: 'text-blue-600 bg-blue-100' },
        RETURN: { label: 'Retur', icon: FiTrendingUp, color: 'text-purple-600 bg-purple-100' },
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Stok & Inventory</h1>
                    <p className="text-gray-500 mt-1">Pantau stok dan riwayat movement</p>
                </div>
                {isAdmin() && (
                    <button onClick={() => setShowAdjustmentModal(true)} className="btn btn-primary inline-flex items-center gap-2">
                        <FiRefreshCw className="w-5 h-5" />
                        <span>Penyesuaian Stok</span>
                    </button>
                )}
            </div>

            {/* Stock Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    stocks.map((stock) => (
                        <div key={stock.id} className="card">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center">
                                    <FiBox className="w-7 h-7 text-cyan-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800">{stock.name}</h3>
                                    <p className="text-sm text-gray-500">{stock.sku}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Stok Saat Ini</p>
                                        <p className="text-3xl font-bold text-gray-800">{stock.current_stock}</p>
                                    </div>
                                    <span className="text-lg text-gray-400">pcs</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Movement History */}
            {isAdmin() && movements.length > 0 && (
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Movement Terbaru</h2>
                    <div className="space-y-3">
                        {movements.map((mov) => {
                            const typeInfo = movementTypeLabels[mov.movement_type] || { label: mov.movement_type, color: 'text-gray-600 bg-gray-100' };
                            const Icon = typeInfo.icon || FiBox;
                            return (
                                <div key={mov.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeInfo.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{typeInfo.label}</p>
                                        <p className="text-sm text-gray-500">{mov.product?.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold ${mov.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {mov.quantity > 0 ? '+' : ''}{mov.quantity}
                                        </p>
                                        <p className="text-xs text-gray-400">{formatDate(mov.created_at)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Adjustment Modal */}
            {showAdjustmentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fadeIn">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Penyesuaian Stok</h2>
                        <form onSubmit={handleAdjustment} className="space-y-4">
                            <div>
                                <label className="label">Produk</label>
                                <select
                                    value={adjustmentData.product_id}
                                    onChange={(e) => setAdjustmentData({ ...adjustmentData, product_id: e.target.value })}
                                    className="input"
                                    required
                                >
                                    <option value="">Pilih produk</option>
                                    {stocks.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name} (Stok: {s.current_stock})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Jumlah (+ atau -)</label>
                                <input
                                    type="number"
                                    value={adjustmentData.quantity}
                                    onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: e.target.value })}
                                    className="input"
                                    placeholder="Contoh: 10 atau -5"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Gunakan angka negatif untuk mengurangi stok</p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowAdjustmentModal(false)} className="flex-1 btn btn-secondary">
                                    Batal
                                </button>
                                <button type="submit" className="flex-1 btn btn-primary">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
