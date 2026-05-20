import { useState, useEffect } from 'react';
import { Search, Trash2, Filter, ChevronLeft, ChevronRight, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import './OrganizerPages.css';

export default function MatchResultsPage() {
  const { authFetch } = useAuth();
  const [matches, setMatches] = useState([]);
  const [umpires, setUmpires] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Modal Assign Wasit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedUmpireId, setSelectedUmpireId] = useState('');

  // State untuk Filter sesuai Mockup
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ category: '', status: '', date: '' });

  // State untuk Paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchMatchesAndUmpires();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMatchesAndUmpires = async () => {
    try {
      // 1. Fetch Pertandingan
      const resMatches = await authFetch('/api/matches');
      if (resMatches.ok) {
        const data = await resMatches.json();
        setMatches(Array.isArray(data) ? data : (data.data || []));
      }

      // 2. Fetch Daftar Wasit
      const resUmpires = await authFetch('/api/umpires');
      if (resUmpires.ok) {
        const dataUmpires = await resUmpires.json();

        let actualUmpires = [];
        if (Array.isArray(dataUmpires)) {
          actualUmpires = dataUmpires;
        } else if (dataUmpires.data && Array.isArray(dataUmpires.data)) {
          actualUmpires = dataUmpires.data;
        } else if (dataUmpires.umpires && Array.isArray(dataUmpires.umpires)) {
          actualUmpires = dataUmpires.umpires;
        } else if (dataUmpires.users && Array.isArray(dataUmpires.users)) {
          actualUmpires = dataUmpires.users;
        }

        setUmpires(actualUmpires);
      } else {
        console.error("Gagal memanggil API wasit. Status:", resUmpires.status);
      }
    } catch (error) {
      console.error('Gagal mengambil data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = (match) => {
    setSelectedMatch(match);
    setSelectedUmpireId(match.umpire_id || '');
    setIsModalOpen(true);
  };

  const handleAssignUmpire = async () => {
    if (!selectedUmpireId) return alert('Silakan pilih wasit terlebih dahulu!');

    try {
      const response = await authFetch(`/api/matches/${selectedMatch.match_id}/assign-umpire`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ umpire_id: selectedUmpireId })
      });

      if (response.ok) {
        const assignedUmpire = umpires.find(u =>
            (u.id || u.user_id || u.umpire_id || '').toString() === selectedUmpireId.toString()
        );

        let displayUmpireName = 'Wasit';
        if (assignedUmpire) {
          if (assignedUmpire.first_name || assignedUmpire.last_name) {
            displayUmpireName = `${assignedUmpire.first_name || ''} ${assignedUmpire.last_name || ''}`.trim();
          } else if (assignedUmpire.nama_depan || assignedUmpire.nama_belakang) {
            displayUmpireName = `${assignedUmpire.nama_depan || ''} ${assignedUmpire.nama_belakang || ''}`.trim();
          } else {
            displayUmpireName = assignedUmpire.full_name || assignedUmpire.fullName || assignedUmpire.nama || assignedUmpire.name || assignedUmpire.username;
          }
        }

        // PERBAIKAN: Gunakan umpire_fullname agar langsung sinkron dengan state lokal sebelum reload
        setMatches(prevMatches =>
            prevMatches.map(m =>
                m.match_id === selectedMatch.match_id
                    ? { ...m, umpire_id: selectedUmpireId, umpire_fullname: displayUmpireName }
                    : m
            )
        );
        setIsModalOpen(false);
        alert('Wasit berhasil ditugaskan!');
      } else {
        alert('Gagal menugaskan wasit. Periksa API.');
      }
    } catch (error) {
      console.error('Error assigning umpire:', error);
      alert('Terjadi kesalahan sistem saat menugaskan wasit.');
    }
  };

  const handleDelete = async (matchId) => {
    if (window.confirm('Yakin ingin menghapus pertandingan ini? Data pemain di database juga akan ikut terhapus permanen!')) {
      try {
        const response = await authFetch(`/api/matches/${matchId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Berhasil dihapus bersih!');
          setMatches(matches.filter(m => m.match_id !== matchId));
        } else {
          alert('Gagal menghapus data.');
        }
      } catch (error) {
        alert('Terjadi kesalahan pada server.');
        console.error(error);
      }
    }
  };

  const filteredMatches = matches.filter(m => {
    if (filters.category && m.category !== filters.category) return false;
    if (filters.status && m.status !== filters.status) return false;
    if (filters.date) {
      const matchDate = m.scheduled_date ? m.scheduled_date.split('T')[0] : '';
      if (matchDate !== filters.date) return false;
    }
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const playersStr = (m.players || []).map(p => p.full_name).join(' ').toLowerCase();
      if (!playersStr.includes(searchLower)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredMatches.slice(startIndex, startIndex + itemsPerPage);

  const columns = [
    { header: 'No', width: '50px', render: (_, i) => startIndex + i + 1 },
    { header: 'Nama Pemain', render: (r) => {
        const teamA = (r.players || []).filter(p => p.team === 'A').map(p => p.full_name).join(' / ') || 'Tim A';
        const teamB = (r.players || []).filter(p => p.team === 'B').map(p => p.full_name).join(' / ') || 'Tim B';
        return <span style={{ fontWeight: '600' }}>{`${teamA} vs ${teamB}`}</span>;
      }},
    { header: 'Kategori', render: (r) => {
        const catLabel = r.category === 'doubles' ? 'Ganda' : (r.category === 'singles' ? 'Tunggal' : r.category);
        return <Badge status={catLabel} />
      }},
    { header: 'Skor', render: (r) => {
        if (!r.final_scores || r.final_scores.length === 0) return '-';
        return (
            <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>
            {r.final_scores.filter(s => s.a > 0 || s.b > 0).map(s => `${s.a}-${s.b}`).join('  ')}
          </span>
        );
      }},
    { header: 'Tanggal', render: (r) => {
        if (!r.scheduled_date) return '-';
        return new Date(r.scheduled_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      }},
    { header: 'Wasit', render: (r) => {
        // PERBAIKAN UTAMA: Membaca skema penamaan objek baru dari JOIN PostgreSQL (umpire_fullname & umpire_username)
        if (!r.umpire_id) {
          return <span style={{ color: '#faad14', fontSize: '12px', fontStyle: 'italic' }}>Belum Ditugaskan</span>;
        }

        const displayName = r.umpire_fullname && r.umpire_fullname.trim() !== ""
            ? r.umpire_fullname
            : (r.umpire_username || "Wasit Berlisensi");

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '500' }}>
              <Shield size={14} color="#1890ff" /> {displayName}
            </div>
        );
      }},
    { header: 'Status', render: (r) => {
        let displayStatus = r.status === 'finished' ? 'Selesai' : (r.status === 'scheduled' ? 'Menunggu' : 'Berlangsung');
        return <Badge status={displayStatus} />
      }},
    { header: 'Aksi', render: (r) => (
          <div style={{ display: 'flex', gap: '5px' }}>
            {r.status !== 'finished' && (
                <button
                    onClick={() => openAssignModal(r)}
                    style={{
                      backgroundColor: '#1890ff', border: 'none', borderRadius: '4px', padding: '6px 10px',
                      cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="Tugaskan Wasit"
                >
                  <UserCheck size={16} />
                </button>
            )}

            <button
                onClick={() => handleDelete(r.match_id)}
                style={{
                  backgroundColor: '#ff4d4f', border: 'none', borderRadius: '4px', padding: '6px 10px',
                  cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                title="Hapus Pertandingan"
            >
              <Trash2 size={16} />
            </button>
          </div>
      )},
  ];

  return (
      <div className="org-page fade-in">
        <div className="org-page__section" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 className="org-page__section-title" style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>Daftar Hasil Pertandingan</h3>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '0 10px' }}>
              <Search size={18} color="#aaa" />
              <input
                  type="text"
                  placeholder="Cari nama pemain, atau pertandingan"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', outline: 'none', padding: '8px', width: '100%' }}
              />
            </div>
            <Select name="category" value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    options={[ {value:'', label:'Semua Kategori'}, {value:'singles',label:'Tunggal'}, {value:'doubles',label:'Ganda'} ]}
            />
            <Select name="status" value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    options={[ {value:'', label:'Semua Status'}, {value:'scheduled',label:'Menunggu'}, {value:'live',label:'Berlangsung'}, {value:'finished',label:'Selesai'} ]}
            />
            <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({...filters, date: e.target.value})}
                style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '7px 10px', color: '#555', outline: 'none' }}
            />
            <button style={{ backgroundColor: '#1890ff', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Filter size={16} /> Filter
            </button>
          </div>

          {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Memuat data pertandingan...</div>
          ) : (
              <>
                <Table columns={columns} data={currentData} emptyMessage="Tidak ada data pertandingan." />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', color: '#888', fontSize: '14px' }}>
                  <span>Menampilkan {filteredMatches.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, filteredMatches.length)} dari {filteredMatches.length} pertandingan</span>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ padding: '5px 12px', border: '1px solid #ddd', backgroundColor: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><ChevronLeft size={16}/> Prev</div>
                    </button>
                    <button style={{ padding: '5px 15px', border: 'none', backgroundColor: '#1890ff', color: 'white', borderRadius: '4px' }}>{currentPage}</button>
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} style={{ padding: '5px 12px', border: '1px solid #ddd', backgroundColor: 'white', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>Next <ChevronRight size={16}/></div>
                    </button>
                  </div>
                </div>
              </>
          )}
        </div>

        {isModalOpen && (
            <div style={modalOverlayStyle}>
              <div style={modalContentStyle}>
                <h3 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>Tugaskan Wasit Pertandingan</h3>
                {selectedMatch && (
                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
                      Pertandingan: <strong>
                      {(selectedMatch.players || []).filter(p => p.team === 'A').map(p => p.full_name).join('/')} vs {(selectedMatch.players || []).filter(p => p.team === 'B').map(p => p.full_name).join('/')}
                    </strong>
                    </p>
                )}

                <div style={{ textAlign: 'left', marginBottom: '25px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>Pilih Wasit Berlisensi :</label>
                  <select
                      value={selectedUmpireId}
                      onChange={(e) => setSelectedUmpireId(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #e0e0e0', backgroundColor: '#fff', outline: 'none' }}
                  >
                    <option value="">-- Silakan Pilih Wasit --</option>
                    {umpires.map((u, index) => {
                      const umpireId = u.id || u.user_id || u.umpire_id || index;

                      let umpireName = u.username;
                      if (u.first_name || u.last_name) {
                        umpireName = `${u.first_name || ''} ${u.last_name || ''}`.trim();
                      } else if (u.nama_depan || u.nama_belakang) {
                        umpireName = `${u.nama_depan || ''} ${u.nama_belakang || ''}`.trim();
                      } else if (u.full_name || u.fullName || u.nama || u.name) {
                        umpireName = u.full_name || u.fullName || u.nama || u.name;
                      }

                      return (
                          <option key={umpireId} value={umpireId}>
                            {umpireName} {u.no_lisensi ? `(${u.no_lisensi})` : ''}
                          </option>
                      );
                    })}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setIsModalOpen(false)} style={{ ...btnBaseStyle, backgroundColor: '#f5f5f5', color: '#555', border: '1px solid #e0e0e0' }}>Batal</button>
                  <button onClick={handleAssignUmpire} style={{ ...btnBaseStyle, backgroundColor: '#1890ff', color: 'white' }}>Simpan Tugas</button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

const modalOverlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '100%', maxWidth: '450px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' };
const btnBaseStyle = { padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '500' };