import { useState, useMemo } from 'react';
import { KeyRound, Loader2, CheckCircle, AlertCircle, Info, Eye, EyeOff } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import './ChangePasswordPage.css';

export default function ChangePasswordPage() {
  const { authFetch, user } = useAuth();
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isUmpire = user?.role === 'umpire';

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    // Clear messages on input
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pw = form.new_password;
    if (!pw) return { level: 0, text: '', class: '' };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 2) return { level: 1, text: 'Lemah', class: 'weak' };
    if (score <= 3) return { level: 2, text: 'Sedang', class: 'medium' };
    return { level: 3, text: 'Kuat', class: 'strong' };
  }, [form.new_password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Frontend validation
    if (!form.current_password || !form.new_password || !form.confirm_password) {
      setError('Semua field wajib diisi.');
      return;
    }

    if (form.new_password.length < 6) {
      setError('Password baru minimal 6 karakter.');
      return;
    }

    if (form.new_password !== form.confirm_password) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    if (form.current_password === form.new_password) {
      setError('Password baru harus berbeda dari password lama.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await authFetch('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          current_password: form.current_password,
          new_password: form.new_password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || 'Password berhasil diubah!');
        setForm({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        setError(data.error || 'Gagal mengubah password.');
      }
    } catch (err) {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="change-pw">
      <div className="change-pw__card">
        {/* Header */}
        <div className="change-pw__header">
          <div className={`change-pw__icon-box ${isUmpire ? 'change-pw__icon-box--orange' : 'change-pw__icon-box--blue'}`}>
            <KeyRound size={28} />
          </div>
          <h2 className="change-pw__title">Ubah Password</h2>
          <p className="change-pw__subtitle">
            Masukkan password lama dan password baru Anda untuk mengubah password akun.
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="change-pw__alert change-pw__alert--success">
            <CheckCircle size={18} />
            <span className="change-pw__alert-text">{success}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="change-pw__alert change-pw__alert--error">
            <AlertCircle size={18} />
            <span className="change-pw__alert-text">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="change-pw__form">
          {/* Current Password */}
          <div style={{ position: 'relative' }}>
            <Input
              label="Password Lama"
              name="current_password"
              type={showCurrent ? 'text' : 'password'}
              placeholder="Masukkan password lama"
              value={form.current_password}
              onChange={set('current_password')}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              style={{
                position: 'absolute', right: '12px', top: '36px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#94a3b8', padding: '4px', display: 'flex',
              }}
              tabIndex={-1}
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* New Password */}
          <div style={{ position: 'relative' }}>
            <Input
              label="Password Baru"
              name="new_password"
              type={showNew ? 'text' : 'password'}
              placeholder="Minimal 6 karakter"
              value={form.new_password}
              onChange={set('new_password')}
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              style={{
                position: 'absolute', right: '12px', top: '36px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#94a3b8', padding: '4px', display: 'flex',
              }}
              tabIndex={-1}
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {form.new_password && (
            <>
              <div className="change-pw__strength">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`change-pw__strength-bar ${passwordStrength.level >= i ? passwordStrength.class : ''}`}
                  />
                ))}
              </div>
              <span className={`change-pw__strength-text ${passwordStrength.class}`}>
                Kekuatan: {passwordStrength.text}
              </span>
            </>
          )}

          {/* Confirm Password */}
          <div style={{ position: 'relative' }}>
            <Input
              label="Konfirmasi Password Baru"
              name="confirm_password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Ulangi password baru"
              value={form.confirm_password}
              onChange={set('confirm_password')}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={{
                position: 'absolute', right: '12px', top: '36px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#94a3b8', padding: '4px', display: 'flex',
              }}
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Match indicator */}
          {form.confirm_password && form.new_password && (
            <div style={{ marginTop: '-8px', fontSize: '12px', fontWeight: 600 }}>
              {form.new_password === form.confirm_password ? (
                <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={14} /> Password cocok
                </span>
              ) : (
                <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={14} /> Password tidak cocok
                </span>
              )}
            </div>
          )}

          {/* Submit */}
          <div style={{ marginTop: 'var(--space-2)' }}>
            <Button
              type="submit"
              variant={isUmpire ? 'orange' : 'primary'}
              fullWidth
              icon={submitting ? Loader2 : KeyRound}
              disabled={submitting}
            >
              {submitting ? 'Menyimpan...' : 'Simpan Password Baru'}
            </Button>
          </div>
        </form>

        {/* Info Box */}
        <div className="change-pw__info">
          <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#94a3b8' }} />
          <p className="change-pw__info-text">
            Password harus minimal 6 karakter. Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol untuk keamanan lebih baik.
          </p>
        </div>
      </div>
    </div>
  );
}
