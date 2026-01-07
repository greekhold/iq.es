import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../hooks/useAuth';
import {
    FiHome,
    FiPackage,
    FiDollarSign,
    FiShoppingCart,
    FiUsers,
    FiBox,
    FiSettings,
    FiBarChart2,
    FiLogOut,
    FiRefreshCw,
    FiShoppingBag,
    FiCreditCard,
} from 'react-icons/fi';

const menuItems = {
    OWNER: [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/products', icon: FiPackage, label: 'Produk' },
        { path: '/prices', icon: FiDollarSign, label: 'Harga' },
        { path: '/customers', icon: FiUsers, label: 'Customer' },
        { path: '/sales', icon: FiShoppingCart, label: 'Penjualan' },
        { path: '/supplies', icon: FiBox, label: 'Bahan/Supplies' },
        { path: '/purchases', icon: FiShoppingBag, label: 'Pembelian' },
        { path: '/expenses', icon: FiCreditCard, label: 'Pengeluaran' },
        { path: '/production', icon: FiSettings, label: 'Produksi' },
        { path: '/inventory', icon: FiBox, label: 'Stok Es' },
        { path: '/reports', icon: FiBarChart2, label: 'Laporan' },
    ],
    ADMIN: [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/products', icon: FiPackage, label: 'Produk' },
        { path: '/prices', icon: FiDollarSign, label: 'Harga' },
        { path: '/customers', icon: FiUsers, label: 'Customer' },
        { path: '/sales', icon: FiShoppingCart, label: 'Penjualan' },
        { path: '/supplies', icon: FiBox, label: 'Bahan/Supplies' },
        { path: '/purchases', icon: FiShoppingBag, label: 'Pembelian' },
        { path: '/expenses', icon: FiCreditCard, label: 'Pengeluaran' },
        { path: '/production', icon: FiSettings, label: 'Produksi' },
        { path: '/inventory', icon: FiBox, label: 'Stok Es' },
        { path: '/reports', icon: FiBarChart2, label: 'Laporan' },
    ],
    KASIR_PABRIK: [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/sales/new', icon: FiShoppingCart, label: 'Penjualan Baru' },
        { path: '/sales', icon: FiShoppingCart, label: 'Riwayat Penjualan' },
        { path: '/production', icon: FiSettings, label: 'Produksi' },
        { path: '/inventory', icon: FiBox, label: 'Stok' },
    ],
    SUPPLIER: [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/sales/new', icon: FiShoppingCart, label: 'Penjualan Baru' },
        { path: '/sales', icon: FiShoppingCart, label: 'Riwayat Penjualan' },
        { path: '/sync', icon: FiRefreshCw, label: 'Status Sync' },
    ],
    VIEWER: [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/reports', icon: FiBarChart2, label: 'Laporan' },
    ],
};

export default function Sidebar() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const role = user?.role?.name || 'VIEWER';
    const items = menuItems[role] || menuItems.VIEWER;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <aside style={{
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100vh',
            width: '256px',
            backgroundColor: 'white',
            borderRight: '1px solid #E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50
        }}>
            {/* Header with Logo */}
            <div style={{ padding: '20px', borderBottom: '1px solid #F3F4F6' }}>
                <img
                    src="/logo.png"
                    alt="IQ.es"
                    style={{
                        width: '100%',
                        maxWidth: '180px',
                        height: 'auto',
                        display: 'block',
                        margin: '0 auto'
                    }}
                />
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {items.map((item) => (
                        <li key={item.path} style={{ marginBottom: '4px' }}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                            >
                                <item.icon style={{ width: '20px', height: '20px' }} />
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User Info & Logout */}
            <div style={{ padding: '16px', borderTop: '1px solid #F3F4F6' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '8px'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#B2EBF2',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span style={{ color: '#0097A7', fontWeight: '500' }}>
                            {user?.name?.charAt(0) || 'U'}
                        </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                            fontWeight: '500',
                            color: '#1F2937',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {user?.name}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                            {user?.role?.display_name}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 16px',
                        color: '#DC2626',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <FiLogOut style={{ width: '20px', height: '20px' }} />
                    <span>Keluar</span>
                </button>
            </div>
        </aside>
    );
}
