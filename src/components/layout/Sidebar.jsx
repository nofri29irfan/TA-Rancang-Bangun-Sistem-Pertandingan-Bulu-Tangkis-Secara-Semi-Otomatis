import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
    LayoutDashboard,
    UserPlus,
    FileText,
    BarChart3,
    Printer,
    ChevronDown,
    ChevronRight,
    Gamepad2,
    History,
    KeyRound
} from 'lucide-react';
import logo1 from '../../assets/logo1.png';
import './Sidebar.css';

const organizerMenu = [
    { section: 'UTAMA', items: [
            { path: '/organizer', icon: LayoutDashboard, label: 'Dashboard Utama', exact: true },
            { path: '/organizer/umpires', icon: UserPlus, label: 'Daftarkan Wasit' },
        ]},
    { section: 'FITUR TERSEDIA', items: [
            { label: 'Input Data Pertandingan', icon: FileText, submenu: [
                    { path: '/organizer/matches/new', label: 'Input Pertandingan' },
                    { path: '/organizer/scoreboard', label: 'Pengaturan Tampilan' },
                ]},
        ]},
    { section: 'ADMINISTRASI', items: [
            { path: '/organizer/results', icon: BarChart3, label: 'Hasil Pertandingan' },
            { path: '/organizer/print', icon: Printer, label: 'Cetak Hasil' },
            { path: '/organizer/change-password', icon: KeyRound, label: 'Ubah Password' },
        ]},
];

const umpireMenu = [
    { section: 'PANEL WASIT', items: [
            { path: '/umpire', icon: Gamepad2, label: 'Pilih Pertandingan', exact: true },
            { path: '/umpire/history', icon: History, label: 'Riwayat Pertandingan' },
        ]},
    { section: 'PENGATURAN', items: [
            { path: '/umpire/change-password', icon: KeyRound, label: 'Ubah Password' },
        ]},
];

export default function Sidebar({ role, collapsed, onToggle }) {
    const [openSubmenu, setOpenSubmenu] = useState('Input Data Pertandingan');
    const location = useLocation();
    const menu = role === 'organizer' ? organizerMenu : umpireMenu;
    const themeClass = role === 'organizer' ? 'sidebar--blue' : 'sidebar--orange';

    return (
        <aside className={`sidebar ${themeClass} ${collapsed ? 'sidebar--collapsed' : ''}`}>
            <div className="sidebar__brand">
                <img src={logo1} alt="Logo" className="sidebar__logo-img" />
                {!collapsed && (
                    <div className="sidebar__brand-text">
                        <span className="sidebar__brand-title">Sistem Penilaian</span>
                        <span className="sidebar__brand-sub">Bulu Tangkis</span>
                    </div>
                )}
            </div>

            <nav className="sidebar__nav">
                {menu.map((section, si) => (
                    <div key={si} className="sidebar__section">
                        {!collapsed && <span className="sidebar__section-title">{section.section}</span>}
                        {section.items.map((item, ii) => {
                            if (item.submenu) {
                                const isOpen = openSubmenu === item.label;
                                const isSubmenuActive = item.submenu.some(s => location.pathname === s.path);
                                return (
                                    <div key={ii} className="sidebar__submenu-group">
                                        {/* BUTTON DIPAKSA ALIGN LEFT */}
                                        <button
                                            className={`sidebar__link ${isSubmenuActive ? 'sidebar__link--active' : ''}`}
                                            onClick={() => setOpenSubmenu(isOpen ? '' : item.label)}
                                        >
                                            <item.icon size={22} className="sidebar__link-icon" />
                                            {!collapsed && (
                                                <>
                                                    <span className="sidebar__link-text">{item.label}</span>
                                                    {isOpen ? <ChevronDown size={16} className="sidebar__chevron" /> : <ChevronRight size={16} className="sidebar__chevron" />}
                                                </>
                                            )}
                                        </button>
                                        {isOpen && !collapsed && (
                                            <div className="sidebar__submenu">
                                                {item.submenu.map((sub, si2) => (
                                                    <NavLink
                                                        key={si2}
                                                        to={sub.path}
                                                        className={({ isActive }) => `sidebar__sublink ${isActive ? 'sidebar__sublink--active' : ''}`}
                                                    >
                                                        {sub.label}
                                                    </NavLink>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            return (
                                <NavLink
                                    key={ii}
                                    to={item.path}
                                    end={item.exact}
                                    className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                                >
                                    <item.icon size={22} className="sidebar__link-icon" />
                                    {!collapsed && <span className="sidebar__link-text">{item.label}</span>}
                                </NavLink>
                            );
                        })}
                    </div>
                ))}
            </nav>
        </aside>
    );
}