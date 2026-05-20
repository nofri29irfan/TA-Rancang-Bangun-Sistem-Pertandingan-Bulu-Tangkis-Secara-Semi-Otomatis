import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import PublicHeader from '../../components/layout/PublicHeader';
import './AuthPages.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', role: 'organizer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(form.email, form.password);
    
    if (result.success) {
      // Backend tells us the exact role, so use result.user.role instead of form.role
      navigate(result.user.role === 'organizer' ? '/organizer' : '/umpire');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const isOrg = form.role === 'organizer';

  return (
    <div className="auth-page">
      <PublicHeader />
      <main className="auth-page__layout">
        <div className="auth-page__form-wrapper">
          <div className="auth-page__card">
            <div className="auth-page__header">
              <div className="auth-page__avatar">
                <div className="auth-page__avatar-icon" />
              </div>
              <h2 className="auth-page__title">
                Masuk ke Akun {isOrg ? 'Penyelenggara' : 'Wasit'}
              </h2>
              <p className="auth-page__subtitle">
                Selamat datang kembali!
              </p>
            </div>

            {error && <div className="auth-page__error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-page__form">
              <Input label="Email atau Username" name="email" type="text" icon={Mail} placeholder="Masukan email atau username"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input label="Password" name="password" type="password" icon={Lock} placeholder="Masukan password"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <Button type="submit" variant="primary" fullWidth loading={loading}>
                Masuk
              </Button>
            </form>

            <div className="auth-page__divider">
              <span>Atau masuk sebagai</span>
            </div>

            <div className="auth-page__role-tabs">
              <button
                type="button"
                className={`auth-page__role-tab ${isOrg ? 'auth-page__role-tab--active' : 'auth-page__role-tab--inactive'}`}
                onClick={() => setForm({ ...form, role: 'organizer' })}
              >
                Penyelenggara
              </button>
              <button
                type="button"
                className={`auth-page__role-tab ${!isOrg ? 'auth-page__role-tab--active' : 'auth-page__role-tab--inactive'}`}
                onClick={() => setForm({ ...form, role: 'umpire' })}
              >
                Wasit
              </button>
            </div>

            <p className="auth-page__footer-text">
              Belum punya akun {isOrg ? 'penyelenggara' : 'wasit'}? {isOrg ? <Link to="/register" className="auth-page__link">Daftar sekarang</Link> : 'Daftar lewat penyelenggara'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
