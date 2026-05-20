import { Link } from 'react-router-dom';
import { Activity, Users, BarChart3, Shield } from 'lucide-react';
import PublicHeader from '../../components/layout/PublicHeader';
import Button from '../../components/common/Button';
import { FeatureCard } from '../../components/common/Card';
import './LandingPage.css';

const features = [
    { icon: Activity, title: 'Pencatatan Realtime', description: 'Catat skor pertandingan secara langsung dan lihat hasilnya segera' },
    { icon: Users, title: 'Kelola Tim & Pemain', description: 'Atur data tim, pemain, dan jadwal pertandingan dengan mudah' },
    { icon: BarChart3, title: 'Laporan Statistik', description: 'Lihat riwayat pertandingan dan statistik pemain dalam satu tempat' },
    { icon: Shield, title: 'Data Aman', description: 'Sistem login untuk menjaga keamanan data pertandingan' },
];

export default function LandingPage() {
    return (
        <div className="landing">
            <PublicHeader />

            {/* HERO SECTION */}
            <section className="landing__hero">
                <div className="landing__container">
                    <div className="landing__hero-content">
                        <h1 className="landing__title">
                            Sistem Pencatatan Skor<br />Pertandingan Bulu Tangkis
                        </h1>
                        <p className="landing__desc">
                            Platform digital untuk membantu mengelola skor, hasil pertandingan,
                            dan statistik bulu tangkis secara lebih praktis dan terorganisir
                        </p>
                        <Link to="/register">
                            <Button variant="primary" size="lg">Daftar Sekarang!</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="landing__features-wrapper">
                <div className="landing__container">
                    <h3 className="landing__features-title">Fitur Utama</h3>
                    <div className="landing__features-grid">
                        {features.map((f, i) => (
                            <FeatureCard key={i} icon={f.icon} title={f.title} description={f.description} />
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="landing__footer">
                <p>&copy; 2026 Sistem Penilaian Bulu Tangkis. All rights reserved.</p>
            </footer>
        </div>
    );
}