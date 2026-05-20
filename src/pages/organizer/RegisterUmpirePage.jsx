import { useState, useEffect } from 'react';
import { UserPlus, Loader2, Copy, Check, Trash2 } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import { useAuth } from '../../contexts/AuthContext';
import '../auth/AuthPages.css';
import './OrganizerPages.css';

export default function RegisterUmpirePage() {
  const { authFetch } = useAuth();
  const [form, setForm] = useState({ username: '', first_name: '', last_name: '', email: '', license_number: '', experience_years: '', phone: '' });
  const [umpires, setUmpires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [copied, setCopied] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Fetch umpires list
  const fetchUmpires = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/umpires');
      if (res.ok) {
        const data = await res.json();
        setUmpires(data.umpires || []);
      }
    } catch (err) {
      console.error('Fetch umpires error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUmpires();
  }, [authFetch]);

  const columns = [
    { header: 'No', width: '50px', render: (_, i) => i + 1 },
    { header: 'Username', key: 'username' },
    { header: 'Nama', render: (r) => `${r.first_name} ${r.last_name || ''}`.trim() },
    { header: 'Email', key: 'email' },
    { header: 'No. Lisensi', render: (r) => r.license_number || '-' },
    { header: 'Pengalaman', render: (r) => `${r.experience_years || 0} tahun` },
    { header: 'Total Match', render: (r) => r.matches_count || 0 },
    { header: 'Status', render: (r) => <Badge status={r.umpire_status || r.user_status} /> },
    { header: 'Aksi', width: '80px', render: (r) => (
      <button
        onClick={() => handleDelete(r.user_id)}
        title="Nonaktifkan wasit"
        style={{ 
          background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', 
          padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' 
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
      >
        <Trash2 size={16} />
      </button>
    )},
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setGeneratedPassword(null);

    try {
      const res = await authFetch('/api/umpires', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`Wasit "${form.first_name} ${form.last_name}" berhasil didaftarkan!`);
        setGeneratedPassword(data.generatedPassword);
        setForm({ username: '', first_name: '', last_name: '', email: '', license_number: '', experience_years: '', phone: '' });
        fetchUmpires(); // Refresh list
      } else {
        setError(data.error || 'Gagal mendaftarkan wasit.');
      }
    } catch (err) {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Apakah Anda yakin ingin menonaktifkan wasit ini?')) return;

    try {
      const res = await authFetch(`/api/umpires/${userId}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
        fetchUmpires(); // Refresh list
      } else {
        setError(data.error || 'Gagal menonaktifkan wasit.');
      }
    } catch (err) {
      setError('Tidak dapat terhubung ke server.');
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="org-page fade-in">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
        <div className="auth-page__card auth-page__card--wide" style={{ margin: 0 }}>
          <div className="auth-page__header">
            <h2 className="auth-page__title">Daftarkan Wasit Baru</h2>
            <p className="auth-page__subtitle">Lengkapi form berikut untuk mendaftarkan wasit yang akan ditugaskan.</p>
          </div>

          {/* Success Message with Generated Password */}
          {success && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <p style={{ color: '#16a34a', fontWeight: '600', marginBottom: generatedPassword ? '8px' : '0' }}>{success}</p>
              {generatedPassword && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <span style={{ color: '#374151', fontSize: '14px' }}>Password wasit:</span>
                  <code style={{ 
                    background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', 
                    fontFamily: 'monospace', fontSize: '15px', fontWeight: '700', color: '#0f172a',
                    letterSpacing: '1px'
                  }}>
                    {generatedPassword}
                  </code>
                  <button
                    onClick={handleCopyPassword}
                    style={{ 
                      background: copied ? '#16a34a' : '#e2e8f0', border: 'none', cursor: 'pointer', 
                      padding: '6px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px',
                      color: copied ? '#fff' : '#475569', fontSize: '12px', fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Tersalin!' : 'Salin'}
                  </button>
                </div>
              )}
              <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '8px' }}>
                ⚠️ Simpan password ini! Berikan kepada wasit untuk login. Wasit bisa mengubah password-nya setelah login.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
              <p style={{ color: '#dc2626', fontSize: '14px' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-page__form">
            <Input label="Username" name="username" placeholder="Username untuk login wasit" value={form.username} onChange={set('username')} required />

            <div className="auth-page__grid">
              <Input label="Nama Depan" name="first_name" placeholder="Nama depan" value={form.first_name} onChange={set('first_name')} required />
              <Input label="Nama Belakang" name="last_name" placeholder="Nama belakang" value={form.last_name} onChange={set('last_name')} />
            </div>
            
            <Input label="Email" name="email" type="email" placeholder="Email wasit" value={form.email} onChange={set('email')} required />
            <Input label="No. Telepon" name="phone" placeholder="08xxxxxxxxxx" value={form.phone} onChange={set('phone')} />
            
            <div className="auth-page__grid">
              <Input label="No. Lisensi" name="license_number" placeholder="WAS-XXX" value={form.license_number} onChange={set('license_number')} />
              <Input label="Pengalaman (tahun)" name="experience_years" type="number" placeholder="0" value={form.experience_years} onChange={set('experience_years')} />
            </div>

            <div style={{ marginTop: 'var(--space-4)' }}>
              <Button type="submit" variant="primary" fullWidth icon={submitting ? Loader2 : UserPlus} disabled={submitting}>
                {submitting ? 'Mendaftarkan...' : 'Daftarkan Wasit'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="org-page__section">
        <h3 className="org-page__section-title">Daftar Wasit Terdaftar</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            <Loader2 size={24} className="spin" />
            <p style={{ marginTop: '8px' }}>Memuat daftar wasit...</p>
          </div>
        ) : umpires.length > 0 ? (
          <Table columns={columns} data={umpires} />
        ) : (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>
            Belum ada wasit terdaftar. Daftarkan wasit pertama!
          </p>
        )}
      </div>
    </div>
  );
}
