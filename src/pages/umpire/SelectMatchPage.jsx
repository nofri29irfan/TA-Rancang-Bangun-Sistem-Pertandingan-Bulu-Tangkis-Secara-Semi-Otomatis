import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Select from '../../components/common/Select';
import { MatchCard } from '../../components/common/Card';
import { Camera, CheckCircle2, AlertCircle, Loader2, Power } from 'lucide-react'; // Tambahan icon Power
import './UmpirePages.css';

export default function SelectMatchPage() {
    // 1. Mengambil data 'user' yang sedang login dari AuthContext
    const { authFetch, user } = useAuth();
    const [filters, setFilters] = useState({ date: '', category: '', status: '' });
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [points, setPoints] = useState([]);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isJetsonReady, setIsJetsonReady] = useState(false);
    const [isShuttingDown, setIsShuttingDown] = useState(false); // State untuk loading saat shutdown

    const JETSON_IP = "http://192.168.10.2:5000";

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await authFetch('/api/matches');
                if (response.ok) {
                    const data = await response.json();
                    const formattedData = data.map(match => ({
                        ...match,
                        id: match.match_id,
                        scheduled_date: match.scheduled_date ? new Date(match.scheduled_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Segera',
                        venue: match.tournament_name,
                        teamA: match.players?.filter(p => p.team === 'A') || [],
                        teamB: match.players?.filter(p => p.team === 'B') || []
                    }));
                    setMatches(formattedData);
                }
            } catch (error) {
                console.error('Error fetch matches:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMatches();
    }, [authFetch]);

    useEffect(() => {
        const checkJetsonStatus = async () => {
            if (isShuttingDown) return; // Jangan cek status jika sedang proses shutdown
            try {
                const response = await fetch(`${JETSON_IP}/`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(2000)
                });
                if (response.ok || response.status === 200 || response.status === 404 || response.status === 405) {
                    setIsJetsonReady(true);
                } else {
                    setIsJetsonReady(false);
                }
            } catch (error) {
                setIsJetsonReady(false);
            }
        };
        checkJetsonStatus();
        const interval = setInterval(checkJetsonStatus, 3000);
        return () => clearInterval(interval);
    }, [isShuttingDown]);

    const handleStart = (match) => {
        setSelectedMatch(match);
        setPoints([]);
        setIsCameraOn(isJetsonReady);
        setIsModalOpen(true);
    };

    const handleImageClick = (e) => {
        if (points.length >= 4) return;
        const rect = e.target.getBoundingClientRect();

        // Logika Dewa: Mengambil ukuran resolusi murni dari Python
        const scaleX = e.target.naturalWidth / rect.width;
        const scaleY = e.target.naturalHeight / rect.height;

        const realX = Math.round((e.clientX - rect.left) * scaleX);
        const realY = Math.round((e.clientY - rect.top) * scaleY);

        const displayXPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const displayYPercent = ((e.clientY - rect.top) / rect.height) * 100;

        setPoints([...points, { realX, realY, displayXPercent, displayYPercent }]);
    };

    const handleConfirmPoints = async () => {
        if (points.length !== 4) return alert("Pilih 4 titik dulu!");
        const coordinatesToSend = points.map(p => [p.realX, p.realY]);
        try {
            const response = await fetch(`${JETSON_IP}/set_points`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ points: coordinatesToSend })
            });
            if (response.ok) {
                setIsModalOpen(false);
                navigate(`/umpire/match/${selectedMatch.match_id}/score`);
            }
        } catch (error) {
            alert("Gagal kirim titik ke Jetson.");
        }
    };

    // 2. Fungsi handleReset baru untuk membersihkan titik di Web dan sistem Python Jetson
    const handleReset = async () => {
        setPoints([]); // Hapus titik merah di web UI
        try {
            await fetch(`${JETSON_IP}/reset_points`, {
                method: 'POST'
            });
        } catch (error) {
            console.error("Gagal mereset titik kalibrasi di Jetson:", error);
        }
    };

    // --- FUNGSI BARU: SHUTDOWN JETSON ---
    const handleShutdownJetson = async () => {
        if (window.confirm('Yakin ingin mematikan perangkat Jetson Nano secara permanen?')) {
            setIsShuttingDown(true);
            try {
                const response = await fetch(`${JETSON_IP}/shutdown_system`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    alert('Perintah shutdown terkirim. Perangkat Jetson Nano akan mati dalam beberapa detik.');
                    setIsJetsonReady(false);
                } else {
                    alert('Gagal mengirim perintah shutdown ke Jetson.');
                    setIsShuttingDown(false);
                }
            } catch (error) {
                console.error('Gagal mematikan Jetson:', error);
                alert('Gagal terhubung ke Jetson untuk mematikan perangkat.');
                setIsShuttingDown(false);
            }
        }
    };

    // 3. Modifikasi Filter: Memastikan kecocokan umpire_id dengan user.id yang sedang login
    const filteredMatches = matches.filter(m => {
        const matchesFilter = (filters.status ? m.status === filters.status : true) && (m.status === 'scheduled' || m.status === 'live');
        const umpireFilter = user && user.id && m.umpire_id && m.umpire_id.toString() === user.id.toString();
        return matchesFilter && umpireFilter;
    });

    return (
        <div className="ump-page fade-in">
            <h3 className="ump-page__title">Dashboard Wasit</h3>

            <div style={controlCardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        padding: '10px', borderRadius: '50%',
                        backgroundColor: isJetsonReady ? '#dcfce7' : '#fee2e2',
                        color: isJetsonReady ? '#16a34a' : '#dc2626'
                    }}>
                        {isJetsonReady ? <CheckCircle2 size={24}/> : <AlertCircle size={24} />}
                    </div>
                    <div>
                        <h4 style={{ margin: 0 }}>Kontrol Sistem Jetson Nano</h4>
                        <p style={{ margin: 0, fontSize: '13px' }}>
                            Status: {isJetsonReady ? <strong style={{color:'#16a34a'}}>ONLINE</strong> : <strong style={{color:'#dc2626'}}>OFFLINE</strong>}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button disabled style={isJetsonReady ? btnReadyStyle : btnWaitStyle}>
                        {isJetsonReady ? "Sistem Siap!" : "Menghubungkan..."}
                    </button>
                    {/* Tombol Shutdown Jetson */}
                    <button
                        onClick={handleShutdownJetson}
                        disabled={!isJetsonReady || isShuttingDown}
                        style={{
                            ...btnShutdownStyle,
                            opacity: (!isJetsonReady || isShuttingDown) ? 0.5 : 1,
                            cursor: (!isJetsonReady || isShuttingDown) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isShuttingDown ? (
                            <> <Loader2 size={16} className="spin" /> Mematikan... </>
                        ) : (
                            <> <Power size={16} /> Matikan Jetson </>
                        )}
                    </button>
                </div>
            </div>

            <div className="ump-page__filters" style={{ marginTop: '20px' }}>
                <Select
                    label="Filter Status"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    options={[
                        { value: '', label: 'Semua Status' },
                        { value: 'scheduled', label: 'Menunggu' },
                        { value: 'live', label: 'Live' }
                    ]}
                />
            </div>

            {/* 4. Modifikasi Tampilan Grid: Jika data kosong, tampilkan pesan informatif */}
            <div style={{ display: 'grid', gridTemplateColumns: filteredMatches.length > 0 ? '1fr 1fr' : '1fr', gap: '20px', marginTop: '20px' }}>
                {loading ? <p>Memuat data...</p> : (
                    filteredMatches.length > 0 ? (
                        filteredMatches.map(match => (
                            <MatchCard key={match.match_id} match={match} role="umpire" onAction={handleStart} />
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                            Belum ada tugas pertandingan untuk akun Anda saat ini.
                        </div>
                    )
                )}
            </div>

            {/* MODAL KALIBRASI 16:9 (MENDATAR / LANDSCAPE) */}
            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={{marginBottom:'5px'}}>Kalibrasi Lapangan (16:9)</h3>
                        <p style={{fontSize:'14px', color:'#64748b', marginBottom:'15px'}}>Titik terpilih: {points.length}/4</p>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={videoContainerStyle}>
                                {!isCameraOn ? (
                                    <div style={standbyBoxStyle}>
                                        <Camera size={48} color="#94a3b8" />
                                        <button onClick={() => setIsCameraOn(true)} style={btnCameraStyle}>Aktifkan Preview</button>
                                    </div>
                                ) : (
                                    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000' }}>
                                        <img
                                            src={`${JETSON_IP}/video_feed`}
                                            alt="Jetson Feed"
                                            onClick={handleImageClick}
                                            style={videoStyle}
                                            draggable="false"
                                        />
                                        {points.map((pt, i) => (
                                            <div key={i} style={{
                                                position: 'absolute',
                                                left: `${pt.displayXPercent}%`,
                                                top: `${pt.displayYPercent}%`,
                                                width: '12px', height: '12px',
                                                backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid white',
                                                transform: 'translate(-50%, -50%)',
                                                pointerEvents: 'none'
                                            }} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={() => setIsModalOpen(false)} style={btnStyle}>Batal</button>
                            {/* Mengarahkan tombol Reset ke fungsi handleReset yang baru */}
                            <button onClick={handleReset} style={{ ...btnStyle, backgroundColor: '#f59e0b', color: 'white' }}>Reset</button>
                            <button onClick={handleConfirmPoints} style={{ ...btnStyle, backgroundColor: '#10b981', color: 'white' }} disabled={points.length !== 4}>Konfirmasi & Mulai</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- STYLES UNTUK 16:9 (MENDATAR) ---
const controlCardStyle = { backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' };
const btnReadyStyle = { padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#64748b', border: 'none', borderRadius: '8px', fontWeight: 'bold' };
const btnWaitStyle = { padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: '8px' };
const btnShutdownStyle = { padding: '10px 20px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background-color 0.2s' };
const modalOverlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { backgroundColor: 'white', padding: '25px', borderRadius: '15px', width: '90vw', maxWidth: '900px', textAlign: 'center' };
const videoContainerStyle = { marginTop: '5px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#000', aspectRatio: '16 / 9', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px solid #cbd5e1' };
const standbyBoxStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '50px 0' };
const videoStyle = { width: '100%', height: '100%', objectFit: 'fill', display: 'block', cursor: 'crosshair' };
const btnStyle = { padding: '10px 25px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' };
const btnCameraStyle = { padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };