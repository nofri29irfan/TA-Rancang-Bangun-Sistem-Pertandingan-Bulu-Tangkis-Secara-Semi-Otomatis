import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import './UmpirePages.css';

export default function MatchHistoryPage() {
    const { authFetch } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await authFetch('/api/matches');
                if (response.ok) {
                    const data = await response.json();
                    setMatches(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error('Gagal mengambil data riwayat pertandingan:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [authFetch]);

    const columns = [
        { header: 'No', width: '50px', render: (_, i) => i + 1 },
        { header: 'Pertandingan', render: (r) => {
                const teamA = r.players?.filter(p => p.team === 'A').map(p => p.full_name).join(' / ') || 'Tim A';
                const teamB = r.players?.filter(p => p.team === 'B').map(p => p.full_name).join(' / ') || 'Tim B';
                return <span style={{ fontWeight: '500' }}>{`${teamA} vs ${teamB}`}</span>;
            }},
        { header: 'Kategori', render: (r) => <Badge status={r.category || 'Tunggal'} /> },
        { header: 'Tanggal', render: (r) => {
                const dateStr = r.scheduled_date;
                if (!dateStr) return '-';
                return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            }},
        { header: 'Durasi', render: (r) => r.duration_minutes ? `${r.duration_minutes} mnt` : '-' },
        { header: 'Skor', render: (r) => {
                if (!r.final_scores || r.final_scores.length === 0) return '-';
                return (
                    <span style={{ color: '#16a34a', fontWeight: 'bold' }}>
                        {r.final_scores
                            .filter(s => s.a > 0 || s.b > 0) // Perbaikan typo filter skor agar jalan normal
                            .map(s => `${s.a}-${s.b}`)
                            .join(' | ')}
                    </span>
                );
            }},
        { header: 'Wasit Tugas', render: (r) => {
                if (!r.umpire_id) {
                    return <span style={{ color: '#faad14', fontSize: '12px', fontStyle: 'italic' }}>Belum Ditugaskan</span>;
                }

                const displayName = r.umpire_fullname && r.umpire_fullname.trim() !== ""
                    ? r.umpire_fullname
                    : (r.umpire_username || "Wasit Berlisensi");

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>
                        <Shield size={14} color="#64748b" /> {displayName}
                    </div>
                );
            }},
        { header: 'Status', render: (r) => {
                let bg, co, text;

                // Logika pewarnaan status kustom agar responsif dan terlihat profesional
                if (r.status === 'finished') {
                    bg = '#e8f5e9'; // Hijau soft
                    co = '#2e7d32'; // Hijau tua teks
                    text = 'FINISHED';
                } else if (r.status === 'scheduled') {
                    bg = '#fff8e1'; // Kuning/Amber soft
                    co = '#b78103'; // Kuning tua teks
                    text = 'SCHEDULED';
                } else {
                    bg = '#e3f2fd'; // Biru soft untuk status live
                    co = '#1565c0'; // Biru tua teks
                    text = r.status?.toUpperCase() || 'LIVE';
                }

                return (
                    <span style={{
                        backgroundColor: bg,
                        color: co,
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        display: 'inline-block',
                        letterSpacing: '0.5px'
                    }}>
                        {text}
                    </span>
                );
            }},
        { header: 'Aksi', render: () => <Button variant="secondary" size="sm">Detail</Button> },
    ];

    return (
        <div className="ump-page fade-in">
            <h3 className="ump-page__title">Semua Riwayat Pertandingan</h3>
            <div className="ump-page__section" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Memuat riwayat pertandingan...</div>
                ) : (
                    <Table columns={columns} data={matches} emptyMessage="Belum ada riwayat pertandingan" />
                )}
            </div>
        </div>
    );
}