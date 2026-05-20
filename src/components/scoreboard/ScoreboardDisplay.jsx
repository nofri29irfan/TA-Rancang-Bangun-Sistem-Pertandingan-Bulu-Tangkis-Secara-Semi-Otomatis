import './ScoreboardDisplay.css';

export default function ScoreboardDisplay({
                                            tournamentName = 'Kejuaraan Bulutangkis', subtitle = '', year = '2025', venue = '',
                                            primaryColor = '#001F3F', secondaryColor = '#4A90E2',
                                            logoUrl = null,
                                            pbsiLogoUrl = null, // <-- INI YANG BARU DITAMBAHKAN
                                            playerA = 'Pemain 1', playerB = 'Pemain 2', clubA = '', clubB = '',
                                            scoreA = 0, scoreB = 0, currentSet = 1, sets = [], isPreview = false,
                                          }) {
  return (
      <div className={`scoreboard ${isPreview ? 'scoreboard--preview' : ''}`} style={{ '--sb-primary': primaryColor, '--sb-secondary': secondaryColor }}>
        <div className="scoreboard__header">
          <div className="scoreboard__header-content">
            {/* Logo Kiri: Penyelenggara */}
            {logoUrl && <img src={logoUrl} alt="Logo Penyelenggara" className="scoreboard__logo" />}

            <div>
              <h2 className="scoreboard__title">{tournamentName}</h2>
              <p className="scoreboard__subtitle">{year}</p>
            </div>

            {/* Logo Kanan: PBSI (Sebelumnya salah panggil logoUrl) */}
            {pbsiLogoUrl && <img src={pbsiLogoUrl} alt="Logo PBSI" className="scoreboard__logo" />}
          </div>
          <p className="scoreboard__venue">{subtitle} {venue && `• ${venue}`}</p>
        </div>

        <div className="scoreboard__body">
          <div className="scoreboard__player scoreboard__player--a">
            <span className="scoreboard__player-label">Pemain 1</span>
            <span className="scoreboard__player-name">{playerA}</span>
            {clubA && <span className="scoreboard__player-club">{clubA}</span>}
            <span className="scoreboard__score">{scoreA}</span>
          </div>

          <div className="scoreboard__vs">VS</div>

          <div className="scoreboard__player scoreboard__player--b">
            <span className="scoreboard__player-label">Pemain 2</span>
            <span className="scoreboard__player-name">{playerB}</span>
            {clubB && <span className="scoreboard__player-club">{clubB}</span>}
            <span className="scoreboard__score">{scoreB}</span>
          </div>
        </div>
      </div>
  );
}