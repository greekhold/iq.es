import { useState, useEffect } from 'react';
import { FiPlus, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { customersApi } from '../api';

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', type: 'RETAIL', address: '' });

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            const response = await customersApi.getAll(params);
            setCustomers(response.data?.data || response.data || []);
        } catch (error) {
            toast.error('Gagal memuat customer');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await customersApi.create(formData);
            toast.success('Customer berhasil ditambahkan');
            setShowModal(false);
            setFormData({ name: '', phone: '', type: 'RETAIL', address: '' });
            loadCustomers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menambahkan customer');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadCustomers();
    };

    const typeColors = {
        RETAIL: 'badge-info',
        AGEN: 'badge-success',
        RESELLER: 'badge-warning',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Customer</h1>
                    <p className="text-gray-500 mt-1">Daftar customer dan agen</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary inline-flex items-center gap-2">
                    <FiPlus className="w-5 h-5" />
                    <span>Tambah Customer</span>
                </button>
            </div>

            {/* Search */}
            <div className="card">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama atau telepon..."
                        className="input flex-1"
                    />
                    <button type="submit" className="btn btn-secondary">
                        Cari
                    </button>
                </form>
            </div>

            {/* Customers Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : customers.length === 0 ? (
                    <div className="text-center py-12">
                        <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Belum ada customer</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Telepon</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipe</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Alamat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-800">{customer.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{customer.phone || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${typeColors[customer.type]}`}>
                                                {customer.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{customer.address || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fadeIn">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Tambah Customer Baru</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Nama</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input"
                                    placeholder="Nama customer"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Telepon</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="input"
                                    placeholder="08xxxxxxxxxx"
                                />
                            </div>
                            <div>
                                <label className="label">Tipe</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="input"
                                >
                                    <option value="RETAIL">Retail</option>
                                    <option value="AGEN">Agen</option>
                                    <option value="RESELLER">Reseller</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Alamat</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="input"
                                    rows={3}
                                    placeholder="Alamat lengkap"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn btn-secondary">
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
