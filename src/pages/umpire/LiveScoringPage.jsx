import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeftRight, Undo2, ChevronLeft, CheckCircle, XCircle, Maximize, X } from 'lucide-react';
import './LiveScoringPage.css';

const JETSON_IP = "http://192.168.10.2:5000";

export default function LiveScoringPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- STATE PENGATURAN TAMPILAN DINAMIS ---
  const [displaySettings, setDisplaySettings] = useState({
    tournament_name: '',
    location: '',
    subtitle: '',
    theme_primary: '#4a5cbe',
    theme_secondary: '#334399',
    logo_url: null,
    logo_pbsi_url: null
  });

  const [currentSet, setCurrentSet] = useState(1);
  const [scores, setScores] = useState([
    { set: 1, a: 0, b: 0, winner: null },
    { set: 2, a: 0, b: 0, winner: null },
    { set: 3, a: 0, b: 0, winner: null },
  ]);
  const [history, setHistory] = useState([]);
  const [swapped, setSwapped] = useState(false);

  const [matchStartTime] = useState(Date.now());

  // ==========================================
  // STATE BARU KHUSUS UNTUK FITUR VAR
  // ==========================================
  const [varList, setVarList] = useState([]);
  const [isVarModalOpen, setIsVarModalOpen] = useState(false);
  const [selectedVar, setSelectedVar] = useState(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(5); // Default frame 6 (Momen Impak)

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const matchRes = await authFetch(`/api/matches/${id}`);
        if (!matchRes.ok) throw new Error("Gagal mengambil data pertandingan");
        const matchResponseData = await matchRes.json();
        const matchInfo = matchResponseData.data || matchResponseData;
        setMatchData(matchInfo);

        setDisplaySettings({
          tournament_name: matchInfo.tournament_name || matchInfo.name || '',
          location: matchInfo.location || '',
          subtitle: matchInfo.subtitle || '',
          theme_primary: matchInfo.theme_primary || '#4a5cbe',
          theme_secondary: matchInfo.theme_secondary || '#334399',
          logo_url: matchInfo.logo_url || null,
          logo_pbsi_url: matchInfo.logo_pbsi_url || null
        });

        const tourRes = await authFetch('/api/tournaments');
        if (tourRes.ok) {
          const tourResponseData = await tourRes.json();
          const tData = tourResponseData.data || tourResponseData;
          let tournament = null;

          if (Array.isArray(tData) && tData.length > 0) {
            tournament = tData[0];
          } else if (!Array.isArray(tData) && tData) {
            tournament = tData;
          }

          if (tournament) {
            setDisplaySettings(prev => ({
              ...prev,
              tournament_name: tournament.name || prev.tournament_name,
              location: tournament.location || prev.location,
              subtitle: tournament.subtitle || prev.subtitle,
              theme_primary: tournament.theme_primary || prev.theme_primary,
              theme_secondary: tournament.theme_secondary || prev.theme_secondary,
              logo_url: tournament.logo_url || prev.logo_url,
              logo_pbsi_url: tournament.logo_pbsi_url || prev.logo_pbsi_url
            }));
          }
        }

        // FETCH VAR RECORDS (MENGAMBIL DATA REKAMAN DARI BACKEND)
        const varRes = await authFetch(`/api/matches/${id}/var`);
        if (varRes.ok) {
          const varData = await varRes.json();
          setVarList(Array.isArray(varData) ? varData : []);
        }

      } catch (error) {
        console.error('❌ Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    // Polling setiap 5 detik untuk mengecek VAR baru dari Jetson Nano
    const intervalVar = setInterval(async () => {
      try {
        const varRes = await authFetch(`/api/matches/${id}/var`);
        if (varRes.ok) {
          const varData = await varRes.json();
          setVarList(Array.isArray(varData) ? varData : []);
        }
      } catch (err) {}
    }, 5000);

    return () => clearInterval(intervalVar);
  }, [id, authFetch]);

  const current = scores[currentSet - 1];

  const addPoint = useCallback((team) => {
    setHistory(prev => [...prev, { set: currentSet, team, scores: JSON.parse(JSON.stringify(scores)) }]);
    setScores(prev => {
      const next = [...prev];
      next[currentSet - 1] = { ...next[currentSet - 1], [team]: next[currentSet - 1][team] + 1 };
      return next;
    });
  }, [currentSet, scores]);

  const removePoint = useCallback((team) => {
    setScores(prev => {
      const next = [...prev];
      if (next[currentSet - 1][team] > 0) {
        next[currentSet - 1] = { ...next[currentSet - 1], [team]: next[currentSet - 1][team] - 1 };
      }
      return next;
    });
  }, [currentSet]);

  const undoLast = useCallback(() => {
    if (history.length > 0) {
      const last = history[history.length - 1];
      setScores(last.scores);
      setHistory(prev => prev.slice(0, -1));
    }
  }, [history]);

  const endSet = () => {
    const winner = current.a > current.b ? 'A' : 'B';
    setScores(prev => {
      const next = [...prev];
      next[currentSet - 1] = { ...next[currentSet - 1], winner };
      return next;
    });
    if (currentSet < 3) {
      setCurrentSet(currentSet + 1);
      setSwapped(!swapped);
    }
  };

  const endMatch = async () => {
    if (window.confirm('Apakah Anda yakin ingin mengakhiri pertandingan dan menyimpan skor?')) {
      const calculatedDuration = Math.max(1, Math.round((Date.now() - matchStartTime) / 60000));
      try {
        const response = await authFetch(`/api/matches/${id}/finish`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            final_scores: scores,
            duration_minutes: calculatedDuration
          })
        });

        const responseData = await response.json();

        if (response.ok) {
          alert('Berhasil: ' + responseData.message);
          navigate('/umpire');
        } else {
          alert(`GAGAL MENYIMPAN: ${responseData.error}`);
        }
      } catch (error) {
        alert('Gagal menghubungi server. Pastikan backend menyala.');
        console.error(error);
      }
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // ==========================================
  // HANDLER UNTUK VAR DROPDOWN DAN SCRUBBER
  // ==========================================
  const handleVarSelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    const record = varList.find(v => v.id.toString() === selectedId);
    if (record) {
      setSelectedVar(record);
      setCurrentFrameIndex(5); // Layar langsung membuka frame ke-6 (impak)
      setIsVarModalOpen(true);
    }
    e.target.value = "";
  };

  const handleNextFrame = () => {
    setCurrentFrameIndex(prev => Math.min(prev + 1, 10)); // Maksimal indeks 10
  };

  const handlePrevFrame = () => {
    setCurrentFrameIndex(prev => Math.max(prev - 1, 0)); // Minimal indeks 0
  };

  if (loading) return <div className="loading-screen">Memuat Layar Wasit...</div>;
  if (!matchData) return <div className="error-screen">Pertandingan tidak ditemukan</div>;

  const getPlayersInfo = (team) => {
    const players = matchData.players?.filter(p => p.team === team) || [];
    return {
      names: players.map(p => p.full_name).join(' / ') || `Tim ${team}`,
      pb: players[0]?.club_name || players[0]?.pb_name || 'PB. NIA Hall'
    };
  };

  const teamA = getPlayersInfo('A');
  const teamB = getPlayersInfo('B');

  const leftTeamKey = swapped ? 'b' : 'a';
  const rightTeamKey = swapped ? 'a' : 'b';
  const leftInfo = swapped ? teamB : teamA;
  const rightInfo = swapped ? teamA : teamB;

  return (
      <div className="live-scoring-wrapper">
        <div className="header-top">
          <div className="header-content">
            <h2 className="tournament-title">
              {displaySettings.tournament_name || "Nama Turnamen"}
            </h2>
            <p className="match-info">
              Pertandingan {matchData.category || "Bulutangkis"} • {displaySettings.location || "Lokasi Belum Diatur"}
            </p>
          </div>
        </div>

        <div className="scoring-wrapper-inner">
          <div className="scoring-card-main" style={{ backgroundColor: displaySettings.theme_primary }}>
            <div className="scoring-header">
              {displaySettings.logo_url ? (
                  <img src={displaySettings.logo_url} alt="Logo Penyelenggara" className="logo-img-dynamic" />
              ) : (
                  <div className="logo-placeholder"></div>
              )}

              <div className="header-text-center">
                <h3>SKOR SAAT INI</h3>
                <p>Sesi {currentSet}</p>
                {displaySettings.subtitle && (
                    <h4 style={{ marginTop: '4px', fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#ffffff' }}>
                      {displaySettings.subtitle}
                    </h4>
                )}
              </div>

              {displaySettings.logo_pbsi_url ? (
                  <img src={displaySettings.logo_pbsi_url} alt="Logo PBSI" className="logo-img-dynamic" />
              ) : (
                  <div className="logo-placeholder"></div>
              )}
            </div>

            <div className="score-panels-row">
              <div className="score-box" style={{ backgroundColor: displaySettings.theme_secondary }}>
                <span className="label-team">TIM {swapped ? 'B' : 'A'}</span>
                <h4 className="player-display-name">{leftInfo.names}</h4>
                <p className="pb-name-display">{leftInfo.pb}</p>
                <div className="score-number-big">{current[leftTeamKey]}</div>
                <div className="control-btns-inline">
                  <button className="btn-plus-ui" onClick={() => addPoint(leftTeamKey)}>+ Poin</button>
                  <button className="btn-minus-ui" onClick={() => removePoint(leftTeamKey)}>- Poin</button>
                </div>
              </div>

              <div className="score-box" style={{ backgroundColor: displaySettings.theme_secondary }}>
                <span className="label-team">TIM {swapped ? 'A' : 'B'}</span>
                <h4 className="player-display-name">{rightInfo.names}</h4>
                <p className="pb-name-display">{rightInfo.pb}</p>
                <div className="score-number-big">{current[rightTeamKey]}</div>
                <div className="control-btns-inline">
                  <button className="btn-plus-ui" onClick={() => addPoint(rightTeamKey)}>+ Poin</button>
                  <button className="btn-minus-ui" onClick={() => removePoint(rightTeamKey)}>- Poin</button>
                </div>
              </div>
            </div>

            <div className="set-tabs-container">
              {scores.map((s, idx) => (
                  <div key={idx}
                       className={`set-tab-box ${currentSet === idx + 1 ? 'active' : ''}`}
                       style={{ backgroundColor: displaySettings.theme_secondary }}>
                    <span className="set-label">Set {idx + 1}</span>
                    <span className="set-result">
                      {s.a === 0 && s.b === 0 ? '- - -' : `${s.a} - ${s.b}`}
                    </span>
                  </div>
              ))}
            </div>

            {/* --- KAMERA 16:9 DENGAN LABEL LIVE DAN DROPDOWN VAR --- */}
            <div className="jetson-monitor-square-max" style={{ position: 'relative' }}>

              <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                <select
                    className="var-dropdown-select"
                    onChange={handleVarSelect}
                    defaultValue=""
                >
                  <option value="" disabled>Rekaman Hasil In/Out</option>
                  {varList.length === 0 && <option disabled>Belum ada rekaman</option>}
                  {varList.map((v, index) => (
                      <option key={v.id} value={v.id}>
                        Rekaman #{varList.length - index} (Set {v.set_number} | {v.score_state})
                      </option>
                  ))}
                </select>
              </div>

              <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: '750px' }}>
                <img
                    src={`${JETSON_IP}/video_feed`}
                    alt="AI Live Feed"
                    className="monitor-img-square-max"
                    style={{ borderColor: displaySettings.theme_secondary }}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/1280x720?text=Kamera+Offline"; }}
                />
                <div className="live-badge-pulse">
                  • LIVE VAR
                </div>
              </div>
            </div>
          </div>

          <div className="bottom-controls-container">
            <h4 className="kontrol-title">Kontrol Pertandingan</h4>
            <div className="btn-row-left">
              <button className="btn-outline-custom" onClick={() => setSwapped(!swapped)}>
                <ArrowLeftRight size={16}/> Tukar Sisi Lapangan
              </button>
              <button className="btn-outline-custom btn-outline-red" onClick={undoLast} disabled={history.length === 0}>
                <Undo2 size={16}/> Batalkan Poin Terakhir
              </button>
              <button className="btn-outline-custom" onClick={toggleFullScreen}>
                <Maximize size={16}/> Layar Penuh
              </button>
            </div>
          </div>

          <div className="action-footer-bar">
            <button className="action-btn btn-blue" onClick={() => navigate('/umpire')}>
              <ChevronLeft size={18} /> Kembali
            </button>
            <button className="action-btn btn-orange" onClick={endSet}>
              <CheckCircle size={18} /> Akhiri Set
            </button>
            <button className="action-btn btn-red" onClick={endMatch}>
              <XCircle size={18} /> Akhiri Pertandingan
            </button>
          </div>
        </div>

        {/* ==========================================
            POP-UP MODAL VAR (FRAME SCRUBBER)
            ========================================== */}
        {isVarModalOpen && selectedVar && (
            <div className="var-modal-overlay">
              <div className="var-modal-content" style={{ borderColor: displaySettings.theme_primary }}>
                <div className="var-modal-header" style={{ backgroundColor: displaySettings.theme_primary }}>
                  <h3>Peninjauan VAR (Frame {currentFrameIndex + 1} / 11)</h3>
                  <button className="close-btn" onClick={() => setIsVarModalOpen(false)}>
                    <X size={24} />
                  </button>
                </div>

                <div className="var-modal-body">
                  <div className="var-image-container">
                    <img
                        src={selectedVar.frames_path[currentFrameIndex]}
                        alt={`Frame ${currentFrameIndex + 1}`}
                        className="var-frame-img"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/800x450?text=Frame+Tidak+Tersedia"; }}
                    />

                    {currentFrameIndex === 5 && (
                        <div className="impact-badge-overlay">
                          TITIK SENTUH PERTAMA (IMPAK)
                        </div>
                    )}
                  </div>

                  <div className="var-scrub-controls">
                    <button
                        className="action-btn btn-blue"
                        onClick={handlePrevFrame}
                        disabled={currentFrameIndex === 0}
                    >
                      <ChevronLeft size={18} /> Frame Sebelumnya
                    </button>
                    <span className="frame-indicator">
                                {currentFrameIndex === 5 ? "🔥 FRAME IMPAK 🔥" : `Frame ${currentFrameIndex + 1}`}
                            </span>
                    <button
                        className="action-btn btn-blue"
                        onClick={handleNextFrame}
                        disabled={currentFrameIndex === 10}
                    >
                      Frame Selanjutnya <ChevronLeft size={18} style={{ transform: 'rotate(180deg)' }}/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}