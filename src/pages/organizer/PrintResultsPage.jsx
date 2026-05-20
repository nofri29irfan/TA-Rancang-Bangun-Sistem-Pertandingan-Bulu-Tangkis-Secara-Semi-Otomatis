import { useState, useEffect } from 'react';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './OrganizerPages.css';

export default function PrintResultsPage() {
  const { authFetch } = useAuth();
  const [matches, setMatches] = useState([]);
  const [tournamentConfig, setTournamentConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Ambil data Pertandingan DAN Pengaturan Turnamen
  useEffect(() => {
    const fetchData = async () => {
      try {
        // A. Ambil data pertandingan
        const resMatches = await authFetch('/api/matches');
        if (resMatches.ok) {
          const dataMatches = await resMatches.json();
          const finished = dataMatches.filter(m => m.status === 'finished');
          setMatches(finished);
        }

        // B. Ambil data pengaturan turnamen
        const resConfig = await authFetch('/api/tournaments');
        if (resConfig.ok) {
          const apiResponse = await resConfig.json();

          // PERBAIKAN: Ambil objek yang ada di dalam properti "data" sesuai hasil Inspect
          let activeConfig = apiResponse.data ? apiResponse.data : apiResponse;

          // Jaga-jaga jika di kemudian hari datanya berupa array
          if (Array.isArray(activeConfig)) {
            activeConfig = activeConfig[activeConfig.length - 1];
          }

          setTournamentConfig(activeConfig);
        }
      } catch (error) {
        console.error('Gagal mengambil data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authFetch]);

  const columns = [
    { header: 'No', width: '50px', render: (_, i) => i + 1 },
    { header: 'Pertandingan', render: (r) => {
        const teamA = r.players?.filter(p => p.team === 'A').map(p => p.full_name).join(' / ') || 'Tim A';
        const teamB = r.players?.filter(p => p.team === 'B').map(p => p.full_name).join(' / ') || 'Tim B';
        return `${teamA} vs ${teamB}`;
      }},
    { header: 'Kategori', render: (r) => {
        const catLabel = r.category === 'doubles' ? 'Ganda' : (r.category === 'singles' ? 'Tunggal' : r.category);
        return <Badge status={catLabel} />
      }},
    { header: 'Tanggal', render: (r) => {
        if (!r.scheduled_date) return '-';
        return new Date(r.scheduled_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      }},
    { header: 'Skor', render: (r) => {
        if (!r.final_scores || r.final_scores.length === 0) return '-';
        return r.final_scores.filter(s => s.a > 0 || s.b > 0).map(s => `${s.a}-${s.b}`).join(' | ');
      }},
    { header: 'Durasi', render: (r) => r.duration_minutes ? `${r.duration_minutes} menit` : '-' },
  ];

  const getTournamentName = () => {
    if (!tournamentConfig) return 'BULUTANGKIS';
    // Sekarang akan otomatis mengambil nama dari database
    return (tournamentConfig.name || tournamentConfig.tournament_name || 'BULUTANGKIS').toUpperCase();
  };

  // 2. Fungsi Export ke PDF
  const handleExportPDF = () => {
    if (matches.length === 0) return alert('Tidak ada data untuk di-export');

    const doc = new jsPDF({ orientation: 'landscape' });

    const turnamenName = getTournamentName();
    const subtitle = tournamentConfig?.subtitle || '';
    const location = tournamentConfig?.location || '';

    let currentY = 15;

    // Judul Utama
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`LAPORAN HASIL PERTANDINGAN - ${turnamenName}`, 14, currentY);
    currentY += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    if (subtitle) {
      doc.text(subtitle, 14, currentY);
      currentY += 5;
    }

    if (location) {
      doc.text(`Lokasi: ${location}`, 14, currentY);
      currentY += 5;
    }

    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, currentY);
    currentY += 8;

    const tableRows = matches.map((m, i) => {
      const teamA = m.players?.filter(p => p.team === 'A').map(p => p.full_name).join(' / ');
      const teamB = m.players?.filter(p => p.team === 'B').map(p => p.full_name).join(' / ');
      const scores = m.final_scores?.filter(s => s.a > 0 || s.b > 0).map(s => `${s.a}-${s.b}`).join(' | ');

      return [
        i + 1,
        `${teamA} vs ${teamB}`,
        m.category === 'doubles' ? 'Ganda' : 'Tunggal',
        new Date(m.scheduled_date).toLocaleDateString('id-ID'),
        scores || '-',
        `${m.duration_minutes || 0} menit`
      ];
    });

    autoTable(doc, {
      head: [['No', 'Pertandingan', 'Kategori', 'Tanggal', 'Skor Akhir', 'Durasi']],
      body: tableRows,
      startY: currentY,
      headStyles: { fillColor: [0, 74, 153] }
    });

    const fileName = `Hasil_${turnamenName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  };

  // 3. Fungsi Export ke Excel
  const handleExportExcel = () => {
    if (matches.length === 0) return alert('Tidak ada data untuk di-export');

    const turnamenName = getTournamentName().replace(/\s+/g, '_');

    const worksheetData = matches.map((m, i) => ({
      No: i + 1,
      Pertandingan: `${m.players?.filter(p => p.team === 'A').map(p => p.full_name).join('/')} vs ${m.players?.filter(p => p.team === 'B').map(p => p.full_name).join('/')}`,
      Kategori: m.category,
      Tanggal: new Date(m.scheduled_date).toLocaleDateString('id-ID'),
      Skor: m.final_scores?.map(s => `${s.a}-${s.b}`).join(' | '),
      Durasi: `${m.duration_minutes || 0} Menit`
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hasil Pertandingan");
    XLSX.writeFile(workbook, `Hasil_${turnamenName}.xlsx`);
  };

  return (
      <div className="org-page fade-in">
        <div className="org-page__section">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h3 className="org-page__section-title" style={{marginBottom: 0}}>Cetak Hasil Pertandingan</h3>
            <div style={{display: 'flex', gap: '8px'}}>
              <Button variant="danger" icon={FileDown} size="sm" onClick={handleExportPDF} disabled={loading}>Export PDF</Button>
              <Button variant="success" icon={FileSpreadsheet} size="sm" onClick={handleExportExcel} disabled={loading}>Export Excel</Button>
            </div>
          </div>
          {loading ? (
              <div style={{textAlign: 'center', padding: '20px'}}>Memuat data...</div>
          ) : (
              <Table columns={columns} data={matches} emptyMessage="Belum ada pertandingan yang selesai" />
          )}
        </div>
      </div>
  );
}