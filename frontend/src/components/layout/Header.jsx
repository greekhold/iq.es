import { useState, useEffect } from 'react';
import { FiBell, FiWifi, FiWifiOff } from 'react-icons/fi';

export default function Header() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <header style={{
            height: '64px',
            backgroundColor: 'white',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
                    {new Date().toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Online/Offline Status */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        fontSize: '14px',
                        backgroundColor: isOnline ? '#D1FAE5' : '#FEE2E2',
                        color: isOnline ? '#065F46' : '#991B1B'
                    }}
                >
                    {isOnline ? (
                        <>
                            <FiWifi style={{ width: '16px', height: '16px' }} />
                            <span>Online</span>
                        </>
                    ) : (
                        <>
                            <FiWifiOff style={{ width: '16px', height: '16px' }} />
                            <span>Offline</span>
                        </>
                    )}
                </div>

                {/* Notifications */}
                <button style={{
                    position: 'relative',
                    padding: '8px',
                    color: '#6B7280',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}>
                    <FiBell style={{ width: '20px', height: '20px' }} />
                    <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#EF4444',
                        borderRadius: '50%'
                    }}></span>
                </button>
            </div>
        </header>
    );
}
