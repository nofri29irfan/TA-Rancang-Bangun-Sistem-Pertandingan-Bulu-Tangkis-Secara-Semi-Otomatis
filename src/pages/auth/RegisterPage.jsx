import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Lock, Building, Phone } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import PublicHeader from '../../components/layout/PublicHeader';
import './AuthPages.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm_password: '', first_name: '', last_name: '', phone: '', organization: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      alert("Password tidak cocok");
      return;
    }
    setLoading(true);
    
    const result = await register({ ...form, role: 'organizer' });
    
    if (result.success) {
      navigate('/organizer');
    } else {
      alert(result.error || "Gagal mendaftar");
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <PublicHeader />
      <main className="auth-page__layout">
        <div className="auth-page__form-wrapper">
          <div className="auth-page__card auth-page__card--wide">
            <div className="auth-page__header">
              <h2 className="auth-page__title">
                Buat Akun Penyelenggara
              </h2>
              <p className="auth-page__subtitle">Lengkapi Data Diri Anda untuk Mendaftar!</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-page__form">
              <div className="auth-page__grid">
                <Input label="Nama Depan" name="first_name" placeholder="Nama depan" value={form.first_name} onChange={set('first_name')} required />
                <Input label="Nama Belakang" name="last_name" placeholder="Nama belakang" value={form.last_name} onChange={set('last_name')} />
              </div>

              <Input label="Email" name="email" type="email" icon={Mail} placeholder="08xxxxxxxxxx (demo email here)" value={form.email} onChange={set('email')} required />
              <Input label="Nomor Telepon" name="phone" icon={Phone} placeholder="08xxxxxxxxxx" value={form.phone} onChange={set('phone')} />
              <Input label="Username" name="username" icon={User} placeholder="Ketik username Anda" value={form.username} onChange={set('username')} required />

              <div className="auth-page__grid">
                <Input label="Password" name="password" type="password" icon={Lock} placeholder="Min. 8 karakter" value={form.password} onChange={set('password')} required />
                <Input label="Konfirmasi Password" name="confirm_password" type="password" icon={Lock} placeholder="Ketik ulang password" value={form.confirm_password} onChange={set('confirm_password')} required />
              </div>

              <Input label="Organisasi" name="organization" icon={Building} placeholder="Nama organisasi" value={form.organization} onChange={set('organization')} required />

              <div className="auth-page__checkbox">
                <input type="checkbox" id="confirm" required />
                <label htmlFor="confirm">Konfirmasi email dan password sudah benar!</label>
              </div>

              <Button type="submit" variant="primary" fullWidth loading={loading}>
                Daftar Sekarang
              </Button>
            </form>

            <p className="auth-page__footer-text">
              Sudah punya akun penyelenggara? <Link to="/login" className="auth-page__link">Masuk di sini</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
