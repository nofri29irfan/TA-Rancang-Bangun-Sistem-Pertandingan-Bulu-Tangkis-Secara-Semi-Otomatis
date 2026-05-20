import './Card.css';

export function StatCard({ icon: Icon, label, value, color = 'blue' }) {
    return (
        <div className={`stat-card stat-card--${color}`}>
            <div className="stat-card__icon">
                <Icon size={28} />
            </div>
            <div className="stat-card__content">
                <span className="stat-card__label">{label}</span>
                <span className="stat-card__value">{value}</span>
            </div>
        </div>
    );
}

export function FeatureCard({ icon: Icon, title, description }) {
    return (
        <div className="feature-card">
            <div className="feature-card__icon">
                <Icon size={32} />
            </div>
            <h4 className="feature-card__title">{title}</h4>
            <p className="feature-card__desc">{description}</p>
        </div>
    );
}

export function MatchCard({ match, onAction, onDetail, role = 'umpire' }) {
    const isDoubles = match.category === 'doubles';
    const themeClass = role === 'umpire' ? 'match-card--orange' : 'match-card--blue';

    return (
        <div className={`match-card ${themeClass}`}>
            <div className="match-card__header">
                <h4 className="match-card__title">
                    {isDoubles ? 'PERTANDINGAN GANDA' : 'PERTANDINGAN TUNGGAL'}
                </h4>
                <span className={`badge badge--${match.status}`}>
          {match.status === 'scheduled' ? 'Menunggu' : match.status === 'live' ? 'Live' : match.status}
        </span>
            </div>

            <div className="match-card__meta">
                <span>📅 {match.scheduled_date}</span>
                {/* JAM MAIN SUDAH DIHAPUS DARI SINI */}
            </div>
            <div className="match-card__meta">
                <span>📍 {match.venue}</span>
            </div>

            <div className="match-card__teams">
                <div className="match-card__team">
                    <strong>{match.teamA?.map(p => p.full_name).join(' / ')}</strong>
                    <span className="match-card__club">{match.teamA?.[0]?.club_name || '-'}</span>
                </div>
                <span className="match-card__vs">VS</span>
                <div className="match-card__team">
                    <strong>{match.teamB?.map(p => p.full_name).join(' / ')}</strong>
                    <span className="match-card__club">{match.teamB?.[0]?.club_name || '-'}</span>
                </div>
            </div>

            <div className="match-card__actions">
                {onAction && (
                    <button className={`btn btn--${role === 'umpire' ? 'orange' : 'primary'} btn--sm`} onClick={() => onAction(match)}>
                        Mulai Pertandingan
                    </button>
                )}
                {onDetail && (
                    <button className="btn btn--ghost btn--sm" onClick={() => onDetail(match)}>
                        Detail
                    </button>
                )}
            </div>
        </div>
    );
}