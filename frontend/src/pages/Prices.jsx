import { useState, useEffect } from 'react';
import { FiPlus, FiDollarSign, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { pricesApi, productsApi } from '../api';

export default function Prices() {
    const [prices, setPrices] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        product_id: '',
        price: '',
        sales_channel: 'ALL',
        role_ids: [],
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [pricesRes, productsRes] = await Promise.all([
                pricesApi.getAll(),
                productsApi.getAll(true),
            ]);
            setPrices(pricesRes.data || []);
            setProducts(productsRes.data || []);
        } catch (error) {
            toast.error('Gagal memuat data harga');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const groupedPrices = products.map((product) => ({
        ...product,
        prices: prices.filter((p) => p.product_id === product.id),
    }));

    const togglePriceStatus = async (price) => {
        try {
            await pricesApi.update(price.id, { is_active: !price.is_active });
            toast.success(`Harga berhasil ${price.is_active ? 'dinonaktifkan' : 'diaktifkan'}`);
            loadData();
        } catch (error) {
            toast.error('Gagal mengubah status harga');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Harga</h1>
                    <p className="text-gray-500 mt-1">Atur harga produk berdasarkan role</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary inline-flex items-center gap-2">
                    <FiPlus className="w-5 h-5" />
                    <span>Tambah Harga</span>
                </button>
            </div>

            {/* Prices by Product */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="space-y-6">
                    {groupedPrices.map((product) => (
                        <div key={product.id} className="card">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                                    <FiDollarSign className="w-6 h-6 text-cyan-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                                    <p className="text-sm text-gray-500">{product.sku}</p>
                                </div>
                            </div>

                            {product.prices.length === 0 ? (
                                <p className="text-gray-400 text-sm">Belum ada harga</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {product.prices.map((price) => (
                                        <div
                                            key={price.id}
                                            className={`p-4 rounded-xl border-2 ${price.is_active
                                                    ? 'border-green-200 bg-green-50'
                                                    : 'border-gray-200 bg-gray-50 opacity-60'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-800">
                                                        {formatCurrency(price.price)}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Channel: {price.sales_channel === 'ALL' ? 'Semua' : price.sales_channel === 'FACTORY' ? 'Pabrik' : 'Lapangan'}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => togglePriceStatus(price)}
                                                    className={`text-xs px-2 py-1 rounded-full ${price.is_active
                                                            ? 'bg-green-200 text-green-700'
                                                            : 'bg-gray-200 text-gray-600'
                                                        }`}
                                                >
                                                    {price.is_active ? 'Aktif' : 'Nonaktif'}
                                                </button>
                                            </div>
                                            {price.role_access?.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <p className="text-xs text-gray-500 mb-1">Roles:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {price.role_access.map((ra) => (
                                                            <span key={ra.id} className="badge badge-info text-xs">
                                                                {ra.role?.display_name || ra.role?.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add Price Modal - Simplified */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fadeIn">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Tambah Harga Baru</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Fitur ini memerlukan API admin untuk menambah harga dengan akses role.
                            Silakan gunakan backend langsung untuk saat ini.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowModal(false)} className="flex-1 btn btn-secondary">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
