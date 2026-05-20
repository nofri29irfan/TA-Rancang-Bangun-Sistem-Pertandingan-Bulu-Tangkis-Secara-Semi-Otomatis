import { Link, useLocation } from 'react-router-dom';
import logo1 from '../../assets/logo1.png'; // Pastikan file ini ada di src/assets/
import Button from '../common/Button';
import './PublicHeader.css';

export default function PublicHeader() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  return (
      <header className="public-header">
        <div className="public-header__container">
          <Link to="/" className="public-header__logo">
            {/* Menampilkan logo baru */}
            <img
                src={logo1}
                alt="Logo"
                className="public-header__new-logo"
                onError={(e) => { e.target.style.display = 'none'; console.log('Logo gagal dimuat, cek path file!'); }}
            />

            <div className="public-header__brand-wrapper">
              <span className="public-header__brand">Sistem Penilaian</span>
              <span className="public-header__sub">Bulu Tangkis</span>
            </div>
          </Link>

          <nav className="public-header__nav">
            {!isRegisterPage && (
                <Link to="/register">
                  <Button variant="outline" size="sm">DAFTAR</Button>
                </Link>
            )}
            {!isLoginPage && (
                <Link to="/login">
                  <Button variant="primary" size="sm">MASUK</Button>
                </Link>
            )}
          </nav>
        </div>
      </header>
  );
}