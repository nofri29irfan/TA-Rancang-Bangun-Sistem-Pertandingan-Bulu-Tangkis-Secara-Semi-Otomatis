import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Info, Save, RotateCcw } from 'lucide-react';
import Input from '../../components/common/Input';
import ScoreboardDisplay from '../../components/scoreboard/ScoreboardDisplay';
import './OrganizerPages.css';

export default function ScoreboardConfigPage() {
  const navigate = useNavigate();

  const [config, setConfig] = useState({
    tournament_name: '',
    subtitle: '',
    venue: '',
    date: '',
    theme_primary: '#001F3F',
    theme_secondary: '#4A90E2',
    logo_url: null, // Hanya untuk preview di layar
    pbsi_logo_url: null, // Hanya untuk preview di layar
  });

  // STATE BARU: Untuk menyimpan file asli dari komputermu
  const [logoFile, setLogoFile] = useState(null);
  const [pbsiLogoFile, setPbsiLogoFile] = useState(null);

  const set = (k) => (e) => setConfig({ ...config, [k]: e.target.value });

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file); // 1. Simpan file aslinya ke state
      const url = URL.createObjectURL(file);
      setConfig({ ...config, logo_url: url }); // 2. Buat URL sementara untuk preview
    }
  };

  const handlePbsiLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPbsiLogoFile(file); // 1. Simpan file aslinya ke state
      const url = URL.createObjectURL(file);
      setConfig({ ...config, pbsi_logo_url: url }); // 2. Buat URL sementara untuk preview
    }
  };

  const handleReset = () => {
    setConfig({
      tournament_name: '',
      subtitle: '',
      venue: '',
      date: '',
      theme_primary: '#001F3F',
      theme_secondary: '#4A90E2',
      logo_url: null,
      pbsi_logo_url: null,
    });
    setLogoFile(null);
    setPbsiLogoFile(null);
  };

  // FUNGSI SUBMIT MENGGUNAKAN FORMDATA
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      // WAJIB pakai FormData karena kita mengirim FILE GAMBAR, bukan teks JSON
      const formData = new FormData();

      formData.append('name', config.tournament_name);
      formData.append('subtitle', config.subtitle);
      formData.append('location', config.venue);
      formData.append('theme_primary', config.theme_primary);
      formData.append('theme_secondary', config.theme_secondary);
      // start_date & end_date kita abaikan dulu seperti kodemu sebelumnya

      // Masukkan FILE ASLI ke dalam paketan FormData
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      if (pbsiLogoFile) {
        formData.append('logo_pbsi', pbsiLogoFile);
      }

      // Tembak data ke backend dengan setting headers multipart/form-data
      await axios.post('http://localhost:3000/api/tournaments', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Pengaturan tampilan dan Logo berhasil disimpan ke Database!');
      navigate('/organizer/matches/new');

    } catch (error) {
      console.error('Error saat menyimpan pengaturan:', error);
      alert('Gagal menyimpan pengaturan. Pastikan backend sudah diatur untuk menerima file (Multer).');
    }
  };

  return (
      <div className="org-page fade-in">
        <div className="org-page__section">
          {/* HEADER */}
          <div className="org-page__header-box">
            <h3 className="org-page__section-title">Konfirmasi Tampilan Pertandingan</h3>
            <p className="org-page__section-subtitle">
              Atur logo, nama turnamen, dan informasi yang akan ditampilkan di layar skor wasit
            </p>
          </div>

          {/* INFO BOX */}
          <div className="org-page__info-box">
            <Info size={20} className="info-icon" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div className="info-content">
              <span className="info-title">Informasi Pengaturan</span>
              <p className="info-desc">
                Pengaturan ini akan mempengaruhi tampilan di layar skor yang dilihat oleh wasit.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* INFORMASI TURNAMEN */}
            <h4 style={{ marginBottom: '16px', fontSize: '16px', color: '#1e293b' }}>Informasi Turnamen</h4>

            <div className="org-page__form">
              <div className="org-page__form-row">
                <div>
                  <Input
                      label="Nama Turnamen/Pertandingan"
                      name="tournament_name"
                      placeholder="Ketik nama turnamen..."
                      value={config.tournament_name}
                      onChange={set('tournament_name')}
                      required
                  />
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', display: 'block' }}>
                  *nama yang akan ditampilkan di header layar skor
                </span>
                </div>
                <Input
                    label="Subtitle/Keterangan"
                    name="subtitle"
                    placeholder="Contoh: Babak Final"
                    value={config.subtitle}
                    onChange={set('subtitle')}
                />
              </div>

              <div className="org-page__form-row" style={{ marginTop: '8px' }}>
                <Input
                    label="Lokasi Pertandingan"
                    name="venue"
                    placeholder="Ketik lokasi..."
                    value={config.venue}
                    onChange={set('venue')}
                />
                <Input
                    label="Periode Pertandingan"
                    name="date"
                    placeholder="Contoh: 17 Desember 2025"
                    value={config.date}
                    onChange={set('date')}
                />
              </div>
            </div>

            {/* INPUT LOGO */}
            <h4 style={{ margin: '32px 0 16px', fontSize: '16px', color: '#1e293b' }}>Input Logo</h4>

            <div className="org-page__form-row" style={{ marginBottom: '32px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '12px' }}>
                  Logo PB Penyelenggara
                </label>
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ fontSize: '14px', color: '#64748b', width: '100%' }} />
                {config.logo_url && (
                    <img src={config.logo_url} alt="Logo Penyelenggara" style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '12px', background: '#fff' }} />
                )}
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '12px' }}>
                  Logo PBSI (Persatuan Bulutangkis Seluruh Indonesia)
                </label>
                <input type="file" accept="image/*" onChange={handlePbsiLogoUpload} style={{ fontSize: '14px', color: '#64748b', width: '100%' }} />
                {config.pbsi_logo_url && (
                    <img src={config.pbsi_logo_url} alt="Logo PBSI" style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '12px', background: '#fff' }} />
                )}
              </div>
            </div>

            {/* TEMA WARNA */}
            <h4 style={{ marginBottom: '16px', fontSize: '16px', color: '#1e293b' }}>Tema Warna Tampilan</h4>
            <div style={{ display: 'flex', gap: '32px', marginBottom: '40px' }}>
              <div className="org-page__color-group" style={{ flex: 1 }}>
                <span className="org-page__color-label">Warna Utama</span>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input type="color" className="org-page__color-input" value={config.theme_primary} onChange={set('theme_primary')} />
                  <Input value={config.theme_primary} onChange={set('theme_primary')} style={{ flex: 1, margin: 0 }} />
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>Warna background header dan elemen utama</span>
              </div>

              <div className="org-page__color-group" style={{ flex: 1 }}>
                <span className="org-page__color-label">Warna Aksen</span>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input type="color" className="org-page__color-input" value={config.theme_secondary} onChange={set('theme_secondary')} />
                  <Input value={config.theme_secondary} onChange={set('theme_secondary')} style={{ flex: 1, margin: 0 }} />
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>Warna untuk elemen pendukung</span>
              </div>
            </div>

            {/* PREVIEW SCOREBOARD */}
            <h4 style={{ marginBottom: '16px', fontSize: '16px', color: '#1e293b' }}>Preview Tampilan Layar Skor</h4>
            <div className="org-page__preview">
              <ScoreboardDisplay
                  tournamentName={config.tournament_name || 'NAMA TURNAMEN'}
                  subtitle={config.subtitle || 'SUBTITLE / KETERANGAN'}
                  year={config.date || 'TANGGAL'}
                  venue={config.venue || 'LOKASI PERTANDINGAN'}
                  primaryColor={config.theme_primary}
                  secondaryColor={config.theme_secondary}
                  logoUrl={config.logo_url}
                  pbsiLogoUrl={config.pbsi_logo_url}
                  playerA="Pemain 1"
                  playerB="Pemain 2"
                  scoreA={0}
                  scoreB={0}
                  currentSet={1}
                  isPreview
              />
            </div>
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>
              Ini adalah preview tampilan. Jika form di atas kosong, data bayangan (placeholder) akan ditampilkan.
            </p>

            {/* TOMBOL AKSI */}
            <div className="form-footer">
              <button type="submit" className="btn-main btn-main--primary">
                <Save size={18} /> SIMPAN DATA
              </button>
              <button type="button" onClick={handleReset} className="btn-main btn-main--secondary">
                <RotateCcw size={18} /> RESET KE DEFAULT
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}