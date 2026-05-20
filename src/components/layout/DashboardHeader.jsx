import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, ChevronDown, LogOut, User, KeyRound } from 'lucide-react';
import './DashboardHeader.css';

export default function DashboardHeader({ onMenuToggle }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const isUmpire = user?.role === 'umpire';
    const headerClass = isUmpire ? 'dashboard-header dashboard-header--orange' : 'dashboard-header';

    return (
        <header className={headerClass}>
            <div className="dashboard-header__left">
                <button className="dashboard-header__toggle" onClick={onMenuToggle}>
                    <Menu size={20} />
                </button>
            </div>

            <div className="dashboard-header__right">
                {/* DROPDOWN PROFIL */}
                <div className="dashboard-header__profile-container">
                    <button
                        className={`dashboard-header__profile-trigger ${isProfileOpen ? 'active' : ''}`}
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        <div className="dashboard-header__avatar">
                            <User size={18} />
                        </div>
                        <span className="dashboard-header__username">
              Hi, {user?.role === 'organizer' ? 'Admin Penyelenggara' : 'Wasit'}
            </span>
                        <ChevronDown size={16} className={`dashboard-header__chevron ${isProfileOpen ? 'rotate' : ''}`} />
                    </button>

                    {/* MENU DROPDOWN (Hanya muncul jika di-klik) */}
                    {isProfileOpen && (
                        <>
                            {/* Overlay untuk menutup dropdown jika klik di luar */}
                            <div className="dashboard-header__dropdown-overlay" onClick={() => setIsProfileOpen(false)} />

                            <div className="dashboard-header__dropdown">
                                <div className="dashboard-header__dropdown-header">
                                    <p className="dropdown-name">{user?.firstName || user?.first_name || 'User'}{user?.lastName || user?.last_name ? ` ${user.lastName || user.last_name}` : ''}</p>
                                    <p className="dropdown-email">{user?.email || 'admin@example.com'}</p>
                                </div>

                                <div className="dashboard-header__dropdown-divider" />

                                <button className="dashboard-header__dropdown-item" onClick={() => { setIsProfileOpen(false); navigate(isUmpire ? '/umpire/change-password' : '/organizer/change-password'); }}>
                                    <KeyRound size={16} />
                                    <span>Ubah Password</span>
                                </button>

                                <div className="dashboard-header__dropdown-divider" />

                                <button className="dashboard-header__dropdown-item logout" onClick={logout}>
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}