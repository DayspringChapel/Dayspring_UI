'use client';

import { useRouter, usePathname } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import styles from './Sidebar.module.css';

export default function Sidebar({ isOpen, setIsOpen }) {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        apiClient.logout();
        router.push('/admin/login');
    };

    const menuItems = [
        {
            title: 'Dashboard',
            path: '/admin/dashboard',
            icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                        d="M3 4C3 3.44772 3.44772 3 4 3H7C7.55228 3 8 3.44772 8 4V7C8 7.55228 7.55228 8 7 8H4C3.44772 8 3 7.55228 3 7V4Z"
                        fill="currentColor"
                    />
                    <path
                        d="M3 13C3 12.4477 3.44772 12 4 12H7C7.55228 12 8 12.4477 8 13V16C8 16.5523 7.55228 17 7 17H4C3.44772 17 3 16.5523 3 16V13Z"
                        fill="currentColor"
                    />
                    <path
                        d="M12 4C12 3.44772 12.4477 3 13 3H16C16.5523 3 17 3.44772 17 4V7C17 7.55228 16.5523 8 16 8H13C12.4477 8 12 7.55228 12 7V4Z"
                        fill="currentColor"
                    />
                    <path
                        d="M12 13C12 12.4477 12.4477 12 13 12H16C16.5523 12 17 12.4477 17 13V16C17 16.5523 16.5523 17 16 17H13C12.4477 17 12 16.5523 12 16V13Z"
                        fill="currentColor"
                    />
                </svg>
            ),
        },
        {
            title: 'Content',
            path: '/admin/content',
            icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                        d="M4 4C4 3.44772 4.44772 3 5 3H15C15.5523 3 16 3.44772 16 4V6C16 6.55228 15.5523 7 15 7H5C4.44772 7 4 6.55228 4 6V4Z"
                        fill="currentColor"
                    />
                    <path
                        d="M4 10C4 9.44772 4.44772 9 5 9H15C15.5523 9 16 9.44772 16 10V12C16 12.5523 15.5523 13 15 13H5C4.44772 13 4 12.5523 4 12V10Z"
                        fill="currentColor"
                    />
                    <path
                        d="M5 15C4.44772 15 4 15.4477 4 16C4 16.5523 4.44772 17 5 17H15C15.5523 17 16 16.5523 16 16C16 15.4477 15.5523 15 15 15H5Z"
                        fill="currentColor"
                    />
                </svg>
            ),
        },
        {
            title: 'Appointments',
            path: '/admin/appointments',
            icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M6 2C6 1.44772 6.44772 1 7 1C7.55228 1 8 1.44772 8 2V3H12V2C12 1.44772 12.4477 1 13 1C13.5523 1 14 1.44772 14 2V3H15C16.6569 3 18 4.34315 18 6V15C18 16.6569 16.6569 18 15 18H5C3.34315 18 2 16.6569 2 15V6C2 4.34315 3.34315 3 5 3H6V2ZM5 5C4.44772 5 4 5.44772 4 6V7H16V6C16 5.44772 15.5523 5 15 5H5ZM16 9H4V15C4 15.5523 4.44772 16 5 16H15C15.5523 16 16 15.5523 16 15V9Z"
                        fill="currentColor"
                    />
                </svg>
            ),
        },
        {
            title: 'Requisitions',
            path: '/admin/requisitions',
            icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4 2C2.89543 2 2 2.89543 2 4V16C2 17.1046 2.89543 18 4 18H16C17.1046 18 18 17.1046 18 16V4C18 2.89543 17.1046 2 16 2H4ZM7 6C6.44772 6 6 6.44772 6 7C6 7.55228 6.44772 8 7 8H13C13.5523 8 14 7.55228 14 7C14 6.44772 13.5523 6 13 6H7ZM6 10C6 9.44772 6.44772 9 7 9H13C13.5523 9 14 9.44772 14 10C14 10.5523 13.5523 11 13 11H7C6.44772 11 6 10.5523 6 10ZM7 12C6.44772 12 6 12.4477 6 13C6 13.5523 6.44772 14 7 14H10C10.5523 14 11 13.5523 11 13C11 12.4477 10.5523 12 10 12H7Z"
                        fill="currentColor"
                    />
                </svg>
            ),
        },
        {
            title: 'Members',
            path: '/admin/members',
            icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                        d="M9 6C9 7.65685 7.65685 9 6 9C4.34315 9 3 7.65685 3 6C3 4.34315 4.34315 3 6 3C7.65685 3 9 4.34315 9 6Z"
                        fill="currentColor"
                    />
                    <path
                        d="M17 6C17 7.65685 15.6569 9 14 9C12.3431 9 11 7.65685 11 6C11 4.34315 12.3431 3 14 3C15.6569 3 17 4.34315 17 6Z"
                        fill="currentColor"
                    />
                    <path
                        d="M6 11C3.23858 11 1 13.2386 1 16V17H11V16C11 13.2386 8.76142 11 6 11Z"
                        fill="currentColor"
                    />
                    <path
                        d="M14 11C11.2386 11 9 13.2386 9 16V17H19V16C19 13.2386 16.7614 11 14 11Z"
                        fill="currentColor"
                    />
                </svg>
            ),
        },
        {
            title: 'Units',
            path: '/admin/units',
            icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4 3C3.44772 3 3 3.44772 3 4V8C3 8.55228 3.44772 9 4 9H8C8.55228 9 9 8.55228 9 8V4C9 3.44772 8.55228 3 8 3H4ZM12 3C11.4477 3 11 3.44772 11 4V8C11 8.55228 11.4477 9 12 9H16C16.5523 9 17 8.55228 17 8V4C17 3.44772 16.5523 3 16 3H12ZM4 11C3.44772 11 3 11.4477 3 12V16C3 16.5523 3.44772 17 4 17H8C8.55228 17 9 16.5523 9 16V12C9 11.4477 8.55228 11 8 11H4ZM12 11C11.4477 11 11 11.4477 11 12V16C11 16.5523 11.4477 17 12 17H16C16.5523 17 17 16.5523 17 16V12C17 11.4477 16.5523 11 16 11H12Z"
                        fill="currentColor"
                    />
                </svg>
            ),
        },
        {
            title: 'Small Groups',
            path: '/admin/small-groups',
            icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                        d="M10 3C8.34315 3 7 4.34315 7 6C7 7.65685 8.34315 9 10 9C11.6569 9 13 7.65685 13 6C13 4.34315 11.6569 3 10 3Z"
                        fill="currentColor"
                    />
                    <path
                        d="M5 5C3.89543 5 3 5.89543 3 7C3 8.10457 3.89543 9 5 9C6.10457 9 7 8.10457 7 7C7 5.89543 6.10457 5 5 5Z"
                        fill="currentColor"
                    />
                    <path
                        d="M15 5C13.8954 5 13 5.89543 13 7C13 8.10457 13.8954 9 15 9C16.1046 9 17 8.10457 17 7C17 5.89543 16.1046 5 15 5Z"
                        fill="currentColor"
                    />
                    <path
                        d="M10 10C7.23858 10 5 12.2386 5 15V17H15V15C15 12.2386 12.7614 10 10 10Z"
                        fill="currentColor"
                    />
                    <path
                        d="M3.5 11C2.11929 11 1 12.1193 1 13.5V15H4.15C4.42311 13.4708 5.18672 12.1103 6.25 11.0932C5.91489 11.032 5.56698 11 5.20833 11H3.5Z"
                        fill="currentColor"
                    />
                    <path
                        d="M13.75 11.0932C14.8133 12.1103 15.5769 13.4708 15.85 15H19V13.5C19 12.1193 17.8807 11 16.5 11H14.7917C14.433 11 14.0851 11.032 13.75 11.0932Z"
                        fill="currentColor"
                    />
                </svg>
            ),
        },
        {
            title: 'Birthdays',
            path: '/admin/birthdays',
            icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                        d="M10 2C10 1.44772 10.4477 1 11 1C11.5523 1 12 1.44772 12 2V3H13C14.6569 3 16 4.34315 16 6V7H4V6C4 4.34315 5.34315 3 7 3H8V2C8 1.44772 8.44772 1 9 1C9.55228 1 10 1.44772 10 2V3H10V2Z"
                        fill="currentColor"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4 9V15C4 16.6569 5.34315 18 7 18H13C14.6569 18 16 16.6569 16 15V9H4ZM7 11C6.44772 11 6 11.4477 6 12C6 12.5523 6.44772 13 7 13C7.55228 13 8 12.5523 8 12C8 11.4477 7.55228 11 7 11ZM9 12C9 11.4477 9.44772 11 10 11C10.5523 11 11 11.4477 11 12C11 12.5523 10.5523 13 10 13C9.44772 13 9 12.5523 9 12ZM13 11C12.4477 11 12 11.4477 12 12C12 12.5523 12.4477 13 13 13C13.5523 13 14 12.5523 14 12C14 11.4477 13.5523 11 13 11ZM6 15C6 14.4477 6.44772 14 7 14C7.55228 14 8 14.4477 8 15C8 15.5523 7.55228 16 7 16C6.44772 16 6 15.5523 6 15ZM10 14C9.44772 14 9 14.4477 9 15C9 15.5523 9.44772 16 10 16C10.5523 16 11 15.5523 11 15C11 14.4477 10.5523 14 10 14Z"
                        fill="currentColor"
                    />
                </svg>
            ),
        },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div className={styles.overlay} onClick={() => setIsOpen(false)} />
            )}

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.header}>
                    <h2>Dayspring</h2>
                    <p>Admin Panel</p>
                </div>

                <nav className={styles.nav}>
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => {
                                router.push(item.path);
                                if (window.innerWidth < 1024) setIsOpen(false);
                            }}
                            className={`${styles.navItem} ${pathname === item.path ? styles.active : ''
                                }`}
                        >
                            <span className={styles.icon}>{item.icon}</span>
                            <span className={styles.label}>{item.title}</span>
                        </button>
                    ))}
                </nav>

                <div className={styles.footer}>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3 3C2.44772 3 2 3.44772 2 4V16C2 16.5523 2.44772 17 3 17H10C10.5523 17 11 16.5523 11 16C11 15.4477 10.5523 15 10 15H4V5H10C10.5523 5 11 4.55228 11 4C11 3.44772 10.5523 3 10 3H3ZM14.2929 6.29289C14.6834 5.90237 15.3166 5.90237 15.7071 6.29289L18.7071 9.29289C19.0976 9.68342 19.0976 10.3166 18.7071 10.7071L15.7071 13.7071C15.3166 14.0976 14.6834 14.0976 14.2929 13.7071C13.9024 13.3166 13.9024 12.6834 14.2929 12.2929L15.5858 11H9C8.44772 11 8 10.5523 8 10C8 9.44772 8.44772 9 9 9H15.5858L14.2929 7.70711C13.9024 7.31658 13.9024 6.68342 14.2929 6.29289Z"
                                fill="currentColor"
                            />
                        </svg>
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
