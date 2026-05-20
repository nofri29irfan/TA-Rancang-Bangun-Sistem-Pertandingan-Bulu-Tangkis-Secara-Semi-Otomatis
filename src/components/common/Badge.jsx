import { Activity, CheckCircle, Clock } from 'lucide-react';
import './Badge.css';

const badgeConfig = {
  live: { icon: Activity, label: 'LIVE' },
  finished: { icon: CheckCircle, label: 'FINISHED' },
  pending: { icon: Clock, label: 'PENDING' },
  scheduled: { icon: Clock, label: 'SCHEDULED' },
  cancelled: { icon: null, label: 'CANCELLED' },
  active: { icon: null, label: 'ACTIVE' },
  draft: { icon: null, label: 'DRAFT' },
  singles: { icon: null, label: 'Tunggal' },
  doubles: { icon: null, label: 'Ganda' },
};

export default function Badge({ status, label, className = '' }) {
  const config = badgeConfig[status] || { icon: null, label: label || status };
  const IconComp = config.icon;

  return (
    <span className={`badge badge--${status} ${className}`}>
      {IconComp && <IconComp size={12} className="badge__icon" />}
      <span className="badge__label">{label || config.label}</span>
    </span>
  );
}
