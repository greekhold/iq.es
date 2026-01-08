import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiShoppingCart, FiAlertTriangle } from 'react-icons/fi';
import { productsApi, pricesApi, customersApi, salesApi } from '../../api';
import useAuthStore from '../../hooks/useAuth';

export default function NewSale() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Data
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [pricesByProduct, setPricesByProduct] = useState({});

    // Form state
    const [channel] = useState(user?.role?.name === 'SUPPLIER' ? 'FIELD' : 'FACTORY');
    const [customerId, setCustomerId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [dueDate, setDueDate] = useState('');
    const [isNewGalon, setIsNewGalon] = useState(false);
    const [items, setItems] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsRes, customersRes] = await Promise.all([
                productsApi.getAll(true),
                customersApi.getAll(),
            ]);

            setProducts(productsRes.data || []);
            setCustomers(customersRes.data?.data || customersRes.data || []);

            // Load prices for each product
            const pricesMap = {};
            for (const product of productsRes.data || []) {
                const pricesRes = await pricesApi.getAvailable(channel, product.id);
                pricesMap[product.id] = pricesRes.data || [];
            }
            setPricesByProduct(pricesMap);
        } catch (error) {
            toast.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    // Check if any item is a galon product
    const hasGalonProduct = items.some(item => {
        const product = products.find(p => p.id === item.product_id);
        return product?.sku?.startsWith('GLN-');
    });

    // Get selected customer
    const selectedCustomer = customers.find(c => c.id === customerId);
    const isCustomerBlacklisted = selectedCustomer?.is_blacklisted;

    const addItem = () => {
        if (products.length === 0) return;
        setItems([
            ...items,
            {
                product_id: products[0].id,
                price_id: '',
                quantity: 1,
            },
        ]);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Reset price when product changes
        if (field === 'product_id') {
            newItems[index].price_id = '';
        }

        setItems(newItems);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const getItemPrice = (item) => {
        const prices = pricesByProduct[item.product_id] || [];
        const price = prices.find((p) => p.id === item.price_id);
        return price?.price || 0;
    };

    const getItemSubtotal = (item) => {
        return getItemPrice(item) * item.quantity;
    };

    const getTotalAmount = () => {
        return items.reduce((sum, item) => sum + getItemSubtotal(item), 0);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (items.length === 0) {
            toast.error('Tambahkan minimal 1 item');
            return;
        }

        if (items.some((item) => !item.price_id)) {
            toast.error('Pilih harga untuk semua item');
            return;
        }

        if (paymentMethod === 'OTHER' && !dueDate) {
            toast.error('Batas waktu pembayaran wajib diisi untuk pembayaran Lainnya');
            return;
        }

        if (paymentMethod === 'OTHER' && !customerId) {
            toast.error('Pilih customer untuk pembayaran Lainnya');
            return;
        }

        setSubmitting(true);
        try {
            const response = await salesApi.create({
                sales_channel: channel,
                payment_method: paymentMethod,
                customer_id: customerId || null,
                due_date: paymentMethod === 'OTHER' ? dueDate : null,
                is_new_galon: hasGalonProduct ? isNewGalon : false,
                items: items.map((item) => ({
                    product_id: item.product_id,
                    price_id: item.price_id,
                    quantity: item.quantity,
                })),
            });

            toast.success('Penjualan berhasil!');
            navigate('/sales');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan penjualan');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-ice-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="card">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-ice-100 rounded-lg">
                        <FiShoppingCart className="w-6 h-6 text-ice-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Penjualan Baru</h1>
                        <p className="text-sm text-gray-500">
                            Channel: {channel === 'FACTORY' ? 'Pabrik' : 'Lapangan'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer & Payment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Customer</label>
                            <select
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                className={`input ${isCustomerBlacklisted ? 'border-red-500' : ''}`}
                            >
                                <option value="">-- Pilih Customer --</option>
                                {customers.map((customer) => (
                                    <option
                                        key={customer.id}
                                        value={customer.id}
                                        disabled={customer.is_blacklisted}
                                    >
                                        {customer.name} ({customer.type}) {customer.is_blacklisted ? '⚠️ Blacklist' : ''}
                                    </option>
                                ))}
                            </select>
                            {isCustomerBlacklisted && (
                                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                    <FiAlertTriangle className="w-4 h-4" />
                                    Customer ini memiliki hutang yang belum dibayar
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="label">Metode Pembayaran</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="input"
                            >
                                <option value="CASH">Tunai</option>
                                <option value="TRANSFER">Transfer</option>
                                <option value="OTHER">Lainnya (Hutang)</option>
                            </select>
                        </div>
                    </div>

                    {/* Due Date for OTHER payment */}
                    {paymentMethod === 'OTHER' && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <label className="label text-amber-800">Batas Waktu Pembayaran *</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="input"
                                required
                            />
                            <p className="text-sm text-amber-700 mt-2">
                                ⚠️ Jika pembayaran melebihi batas waktu, customer akan di-blacklist dan tidak bisa melakukan transaksi baru.
                            </p>
                        </div>
                    )}

                    {/* Galon Baru Checkbox - only show if galon products are in cart */}
                    {hasGalonProduct && (
                        <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isNewGalon}
                                    onChange={(e) => setIsNewGalon(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                />
                                <div>
                                    <span className="font-medium text-gray-800">Galon Baru (bukan isi ulang)</span>
                                    <p className="text-sm text-gray-500">
                                        Centang jika customer membeli galon baru, bukan hanya isi ulang air
                                    </p>
                                </div>
                            </label>
                        </div>
                    )}

                    {/* Items */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="label mb-0">Item Penjualan</label>
                            <button
                                type="button"
                                onClick={addItem}
                                className="btn btn-secondary text-sm flex items-center gap-1"
                            >
                                <FiPlus className="w-4 h-4" />
                                Tambah Item
                            </button>
                        </div>

                        {items.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">Belum ada item. Klik "Tambah Item" untuk memulai.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-end gap-3 p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500">Produk</label>
                                            <select
                                                value={item.product_id}
                                                onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                                className="input mt-1"
                                            >
                                                {products.map((product) => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500">Harga</label>
                                            <select
                                                value={item.price_id}
                                                onChange={(e) => updateItem(index, 'price_id', e.target.value)}
                                                className="input mt-1"
                                                required
                                            >
                                                <option value="">-- Pilih Harga --</option>
                                                {(pricesByProduct[item.product_id] || []).map((price) => (
                                                    <option key={price.id} value={price.id}>
                                                        {formatCurrency(price.price)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-24">
                                            <label className="text-xs text-gray-500">Qty</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateItem(index, 'quantity', parseInt(e.target.value) || 1)
                                                }
                                                className="input mt-1"
                                            />
                                        </div>
                                        <div className="w-32 text-right">
                                            <label className="text-xs text-gray-500">Subtotal</label>
                                            <p className="font-semibold text-gray-800 mt-2">
                                                {formatCurrency(getItemSubtotal(item))}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Total */}
                    {items.length > 0 && (
                        <div className="flex justify-end p-4 bg-ice-50 rounded-lg">
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Total</p>
                                <p className="text-2xl font-bold text-ice-700">
                                    {formatCurrency(getTotalAmount())}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/sales')}
                            className="btn btn-secondary"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || items.length === 0 || isCustomerBlacklisted}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FiShoppingCart className="w-4 h-4" />
                                    Simpan Penjualan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
