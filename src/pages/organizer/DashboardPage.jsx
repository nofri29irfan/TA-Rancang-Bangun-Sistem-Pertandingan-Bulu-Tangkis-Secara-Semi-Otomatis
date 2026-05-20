import { useState, useEffect } from 'react';
import { Gamepad2, Users, UserCheck, CalendarDays, Loader2 } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import { useAuth } from '../../contexts/AuthContext';
import './OrganizerPages.css';

export default function DashboardPage() {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, matchesRes] = await Promise.all([
          authFetch('/api/dashboard/stats'),
          authFetch('/api/dashboard/recent-matches'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          setMatches(matchesData.matches || []);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Gagal memuat data dashboard. Pastikan server backend berjalan.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authFetch]);

  const statCards = [
    { icon: Gamepad2, label: 'TOTAL PERTANDINGAN', value: stats?.totalMatches ?? 0, color: 'blue' },
    { icon: Users, label: 'TOTAL PEMAIN', value: stats?.totalPlayers ?? 0, color: 'green' },
    { icon: UserCheck, label: 'WASIT TERDAFTAR', value: stats?.totalUmpires ?? 0, color: 'orange' },
    { icon: CalendarDays, label: 'PERTANDINGAN HARI INI', value: stats?.matchesToday ?? 0, color: 'purple' },
  ];

  // Definisi kolom tabel dengan format teks Header yang sesuai UI Mockup
  const columns = [
    { header: 'No', width: '60px', render: (_, i) => i + 1 },
    {
      header: 'Nama Pemain',
      render: (row) => {
        const names1 = (row.team1 || []).map(p => p.full_name).join(' / ');
        const names2 = (row.team2 || []).map(p => p.full_name).join(' / ');
        const display = names1 && names2 ? `${names1} vs ${names2}` : names1 || names2 || '-';
        return <span style={{ fontWeight: '600' }}>{display}</span>;
      }
    },
    {
      header: 'Kategori',
      render: (row) => <Badge status={row.match_category || 'N/A'} />
    },
    {
      header: 'Tanggal',
      render: (row) => {
        if (!row.match_date) return '-';
        return new Date(row.match_date).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
    },
    { header: 'Status', render: (row) => <Badge status={row.status} /> },
  ];

  if (loading) {
    return (
        <div className="org-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <div style={{ textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={32} className="spin" />
            <p style={{ marginTop: '12px' }}>Memuat dashboard...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="org-page">
        {error && (
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
              {error}
            </div>
        )}

        {/* 4 Kartu Statistik */}
        <div className="org-page__stats">
          {statCards.map((s, i) => (
              <div key={i} className="stat-card">
                <div className={`stat-card__icon-box ${s.color}`}>
                  <s.icon size={22} />
                </div>
                <div className="stat-card__info">
                  <span className="stat-card__label">{s.label}</span>
                  <h3 className="stat-card__value">{s.value}</h3>
                </div>
              </div>
          ))}
        </div>

        {/* Tabel Pertandingan Terbaru */}
        <div className="org-page__section">
          <div className="section-header">
            <h3>Pertandingan Terbaru</h3>
          </div>
          <div className="section-body">
            {matches.length > 0 ? (
                <Table columns={columns} data={matches} />
            ) : (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>
                  Belum ada pertandingan. Buat pertandingan pertama Anda!
                </p>
            )}
          </div>
        </div>
      </div>
  );
}