import { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import './DashboardLayout.css';

export default function DashboardLayout() {
    const { user } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const location = useLocation();

    // Mapping nama yang akan tampil di layar
    const breadcrumbMap = {
        'organizer': 'Dashboard',
        'umpire': 'Dashboard',
        'new': 'Input Pertandingan',
        'scoreboard': 'Pengaturan Tampilan',
        'umpires': 'Daftarkan Wasit',
        'results': 'Hasil Pertandingan',
        'print': 'Cetak Hasil',
        'history': 'Riwayat Pertandingan',
        'change-password': 'Ubah Password'
    };

    // List segment URL yang HARUS DIHAPUS/DIBUANG dari tampilan navigasi
    const blacklistedSegments = ['matches'];

    const pathnames = location.pathname.split('/').filter((x) => x);

    // Logika cerdas: Lewati segment yang ngaco/tidak diinginkan
    const breadcrumbs = [];
    let currentPath = '';

    pathnames.forEach((value) => {
        currentPath += `/${value}`;

        // Jika segment tidak ada di daftar hitam, masukkan ke breadcrumbs
        if (!blacklistedSegments.includes(value)) {
            breadcrumbs.push({
                name: breadcrumbMap[value] || value.charAt(0).toUpperCase() + value.slice(1),
                to: currentPath,
            });
        }
    });

    return (
        <div className={`dashboard-layout ${sidebarCollapsed ? 'dashboard-layout--collapsed' : ''}`}>
            <Sidebar
                role={user?.role}
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <div className="dashboard-layout__main">
                <DashboardHeader onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

                <main className="dashboard-layout__content">
                    <div className="dashboard-layout__page-header">
                        {/* 1. Judul Dashboard */}
                        <h2 className="dashboard-layout__page-title">
                            Dashboard Sistem Penilaian Pertandingan Bulu Tangkis
                        </h2>

                        {/* 2. Navigasi Jejak (Breadcrumbs) yang sudah difilter */}
                        <nav className="dashboard-layout__breadcrumbs">
                            {breadcrumbs.map((crumb, index) => {
                                const isLast = index === breadcrumbs.length - 1;
                                return (
                                    <span key={index} className="breadcrumb-item">
                    {index > 0 && <span className="breadcrumb-separator">/</span>}
                                        {isLast ? (
                                            <span className="breadcrumb-link active">{crumb.name}</span>
                                        ) : (
                                            <Link to={crumb.to} className="breadcrumb-link">{crumb.name}</Link>
                                        )}
                  </span>
                                );
                            })}
                        </nav>
                    </div>

                    <Outlet />
                </main>
            </div>
        </div>
    );
}