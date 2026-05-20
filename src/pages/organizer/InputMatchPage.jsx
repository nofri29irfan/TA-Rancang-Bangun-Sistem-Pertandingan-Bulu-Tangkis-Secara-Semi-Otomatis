import { useState } from 'react';
import { Save, Info, User as UserIcon, Users as UsersIcon, RotateCcw, MonitorPlay, Loader2 } from 'lucide-react';
import Input from '../../components/common/Input';
import { useAuth } from '../../contexts/AuthContext';
import './OrganizerPages.css';

export default function InputMatchPage() {
  const { authFetch } = useAuth();
  const [matchType, setMatchType] = useState('doubles');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    scheduled_date: '',
    playerA1: '', clubA1: '', ageA1: '',
    playerA2: '', clubA2: '', ageA2: '',
    playerB1: '', clubB1: '', ageB1: '',
    playerB2: '', clubB2: '', ageB2: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setForm({
      scheduled_date: '',
      playerA1: '', clubA1: '', ageA1: '',
      playerA2: '', clubA2: '', ageA2: '',
      playerB1: '', clubB1: '', ageB1: '',
      playerB2: '', clubB2: '', ageB2: '',
    });
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload = {
      match_category: matchType === 'doubles' ? 'Ganda' : 'Tunggal',
      match_date: form.scheduled_date,
      players: [
        { team_number: 1, full_name: form.playerA1, club_name: form.clubA1, age: form.ageA1 },
        { team_number: 1, full_name: form.playerA2, club_name: form.clubA2, age: form.ageA2 },
        { team_number: 2, full_name: form.playerB1, club_name: form.clubB1, age: form.ageB1 },
        { team_number: 2, full_name: form.playerB2, club_name: form.clubB2, age: form.ageB2 },
      ].filter(p => p.full_name !== '')
    };

    try {
      const response = await authFetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Data pertandingan berhasil disimpan!' });
        handleReset();
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal menyimpan data.' });
      }
    } catch (err) {
      console.error('Submit error:', err);
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="org-page fade-in">
        <div className="org-page__section">
          <div className="org-page__header-box">
            <h3 className="org-page__section-title">Form Input Pertandingan</h3>
            <p className="org-page__section-subtitle">Masukkan data nama pemain yang akan bertanding</p>
          </div>

          {/* NOTIFIKASI SEKARANG DI SINI (DI ATAS PETUNJUK PENGISIAN) */}
          {message && (
              <div style={{
                padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px',
                background: message.type === 'success' ? '#dcfce7' : '#fef2f2',
                color: message.type === 'success' ? '#166534' : '#dc2626',
                border: message.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca'
              }}>
                {message.text}
              </div>
          )}

          <div className="org-page__info-box">
            <Info size={20} className="info-icon" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div className="info-content">
              <span className="info-title">Petunjuk Pengisian</span>
              <p className="info-desc">
                Pilih jenis pertandingan terlebih dahulu (Tunggal atau Ganda), kemudian isi nama pemain dengan format yang tersedia. Untuk pertandingan ganda, pastikan mengisi nama kedua pemain di setiap tim guna akurasi penilaian.
              </p>
            </div>
          </div>

          <h4 className="org-page__label">Pilih Jenis Pertandingan</h4>
          <div className="org-page__toggle">
            <button type="button" className={`type-btn ${matchType === 'singles' ? 'type-btn--active-singles' : ''}`} onClick={() => setMatchType('singles')}>
              <UserIcon size={24} />
              <strong>Tunggal</strong>
              <span style={{ fontSize: '12px' }}>1 vs 1 Pemain</span>
            </button>
            <button type="button" className={`type-btn ${matchType === 'doubles' ? 'type-btn--active' : ''}`} onClick={() => setMatchType('doubles')}>
              <UsersIcon size={24} />
              <strong>Ganda</strong>
              <span style={{ fontSize: '12px' }}>2 vs 2 Pemain</span>
            </button>
          </div>

          {matchType === 'doubles' ? (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '32px', maxWidth: '50%' }}>
                  <Input label="Hari & Tanggal *" name="scheduled_date" type="date" value={form.scheduled_date} onChange={handleChange} required />
                </div>

                <div className="form-section-header" style={{ marginBottom: '24px' }}>
                  <div className="dot-indicator is-blue" />
                  <h4 style={{ color: '#3b82f6' }}>Tim A (Pemain Pertama)</h4>
                </div>
                <div className="doubles-grid" style={{ marginBottom: '40px' }}>
                  <div className="player-field-group">
                    <Input label="Nama Lengkap Pemain 1 *" name="playerA1" placeholder="Nama Pemain 1" value={form.playerA1} onChange={handleChange} required />
                    <Input label="Asal Klub/PB" name="clubA1" placeholder="Asal Klub" value={form.clubA1} onChange={handleChange} />
                    <Input label="Umur" name="ageA1" type="number" placeholder="Umur pemain" value={form.ageA1} onChange={handleChange} />
                  </div>
                  <div className="player-field-group">
                    <Input label="Nama Lengkap Pemain 2 *" name="playerA2" placeholder="Nama Pemain 2" value={form.playerA2} onChange={handleChange} required />
                    <Input label="Asal Klub/PB" name="clubA2" placeholder="Asal Klub" value={form.clubA2} onChange={handleChange} />
                    <Input label="Umur" name="ageA2" type="number" placeholder="Umur pemain" value={form.ageA2} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-section-header" style={{ marginBottom: '24px' }}>
                  <div className="dot-indicator is-red" />
                  <h4 style={{ color: '#ef4444' }}>Tim B (Pemain Kedua)</h4>
                </div>
                <div className="doubles-grid" style={{ marginBottom: '40px' }}>
                  <div className="player-field-group">
                    <Input label="Nama Lengkap Pemain 1 *" name="playerB1" placeholder="Nama Pemain 1" value={form.playerB1} onChange={handleChange} required />
                    <Input label="Asal Klub/PB" name="clubB1" placeholder="Asal Klub" value={form.clubB1} onChange={handleChange} />
                    <Input label="Umur" name="ageB1" type="number" placeholder="Umur pemain" value={form.ageB1} onChange={handleChange} />
                  </div>
                  <div className="player-field-group">
                    <Input label="Nama Lengkap Pemain 2 *" name="playerB2" placeholder="Nama Pemain 2" value={form.playerB2} onChange={handleChange} required />
                    <Input label="Asal Klub/PB" name="clubB2" placeholder="Asal Klub" value={form.clubB2} onChange={handleChange} />
                    <Input label="Umur" name="ageB2" type="number" placeholder="Umur pemain" value={form.ageB2} onChange={handleChange} />
                  </div>
                </div>

                <div className="match-preview" style={{ padding: '24px', textAlign: 'left' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '16px', display: 'block' }}>Preview Data Pemain</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{ background: '#ffffff', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b' }}>
                      {form.playerA1 || form.playerA2 ? `${form.playerA1} ${form.playerA2 ? `/ ${form.playerA2}` : ''}` : 'TIM A'}
                    </div>
                    <div style={{ background: '#ffffff', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b' }}>
                      {form.playerB1 || form.playerB2 ? `${form.playerB1} ${form.playerB2 ? `/ ${form.playerB2}` : ''}` : 'TIM B'}
                    </div>
                  </div>
                </div>

                <div className="form-footer" style={{ borderTop: 'none', paddingTop: '0' }}>
                  <button type="submit" className="btn-main btn-main--primary" disabled={loading}>
                    {loading ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                    {loading ? 'MENYIMPAN...' : 'SIMPAN DATA'}
                  </button>
                  <button type="button" onClick={handleReset} className="btn-main btn-main--secondary" style={{ background: '#e2e8f0' }} disabled={loading}>
                    <RotateCcw size={18} /> RESET FORM
                  </button>
                </div>
              </form>
          ) : (
              <div className="coming-soon-card">
                <MonitorPlay size={48} color="#cbd5e1" />
                <h3 style={{ marginTop: '16px' }}>Segera Hadir</h3>
                <p style={{ color: '#64748b' }}>Kategori Tunggal masih dalam pengembangan untuk mendukung fokus Tugas Akhir pada kategori Ganda.</p>
              </div>
          )}
        </div>
      </div>
  );
}