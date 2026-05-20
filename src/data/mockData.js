// Mock users
export const mockUsers = [
  { id: 1, username: 'admin_penyelenggara', email: 'admin@bulkis.com', first_name: 'Admin', last_name: 'Penyelenggara', role: 'organizer', status: 'active', organization: 'PBSI Duri Riau', phone: '081234567890' },
  { id: 2, username: 'wasit_ahmad', email: 'ahmad@bulkis.com', first_name: 'Ahmad', last_name: 'Wasit', role: 'umpire', status: 'active', license_number: 'WAS-001', experience_years: 5 },
  { id: 3, username: 'wasit_budi', email: 'budi@bulkis.com', first_name: 'Budi', last_name: 'Santoso', role: 'umpire', status: 'active', license_number: 'WAS-002', experience_years: 3 },
];

// Mock players
export const mockPlayers = [
  { id: 1, full_name: 'Nofri', club_name: 'PB. Jaya', age: 22, gender: 'male' },
  { id: 2, full_name: 'Elieser', club_name: 'PB. Jaya Raya', age: 24, gender: 'male' },
  { id: 3, full_name: 'Najwa', club_name: 'PB. Jaya', age: 20, gender: 'female' },
  { id: 4, full_name: 'Irfan', club_name: 'PB. Jaya Raya', age: 23, gender: 'male' },
  { id: 5, full_name: 'Sari', club_name: 'PB. Garuda', age: 21, gender: 'female' },
  { id: 6, full_name: 'Dimas', club_name: 'PB. Garuda', age: 25, gender: 'male' },
];

// Mock tournaments
export const mockTournaments = [
  {
    id: 1, organizer_id: 1, name: 'Kejuaraan Bulutangkis Teknik Komputer', subtitle: 'Babak Final',
    start_date: '2025-12-15', end_date: '2025-12-20', location: 'GOR PBSI Duri Riau',
    logo_url: null, theme_primary: '#001F3F', theme_secondary: '#4A90E2', status: 'active',
  },
];

// Mock matches
export const mockMatches = [
  {
    id: 1, tournament_id: 1, umpire_id: 2, category: 'singles', match_type: 'Final',
    status: 'finished', scheduled_date: '15 Desember 2025', scheduled_time: '14:00 - 15:00',
    duration_minutes: 45, venue: 'Gor PBSI Duri Riau',
    teamA: [{ id: 1, full_name: 'Nofri', club_name: 'PB. Jaya' }],
    teamB: [{ id: 2, full_name: 'Elieser', club_name: 'PB. Jaya Raya' }],
    scores: [
      { set_number: 1, team_a_score: 21, team_b_score: 18, winner_team: 'A' },
      { set_number: 2, team_a_score: 19, team_b_score: 21, winner_team: 'B' },
      { set_number: 3, team_a_score: 21, team_b_score: 15, winner_team: 'A' },
    ],
  },
  {
    id: 2, tournament_id: 1, umpire_id: null, category: 'doubles', match_type: 'Semi Final',
    status: 'scheduled', scheduled_date: '15 Desember 2025', scheduled_time: '15:30 - 16:30',
    duration_minutes: null, venue: 'Gor PBSI Duri Riau',
    teamA: [{ id: 1, full_name: 'Nofri', club_name: 'PB. Jaya' }, { id: 3, full_name: 'Najwa', club_name: 'PB. Jaya' }],
    teamB: [{ id: 2, full_name: 'Elieser', club_name: 'PB. Jaya Raya' }, { id: 4, full_name: 'Irfan', club_name: 'PB. Jaya Raya' }],
    scores: [],
  },
  {
    id: 3, tournament_id: 1, umpire_id: null, category: 'singles', match_type: 'Quarter Final',
    status: 'scheduled', scheduled_date: '16 Desember 2025', scheduled_time: '10:00 - 11:00',
    duration_minutes: null, venue: 'Gor PBSI Duri Riau',
    teamA: [{ id: 5, full_name: 'Sari', club_name: 'PB. Garuda' }],
    teamB: [{ id: 3, full_name: 'Najwa', club_name: 'PB. Jaya' }],
    scores: [],
  },
];

// Mock umpires list (for organizer view)
export const mockUmpires = [
  { user_id: 2, first_name: 'Ahmad', last_name: 'Wasit', email: 'ahmad@bulkis.com', license_number: 'WAS-001', experience_years: 5, status: 'available', matches_count: 12 },
  { user_id: 3, first_name: 'Budi', last_name: 'Santoso', email: 'budi@bulkis.com', license_number: 'WAS-002', experience_years: 3, status: 'available', matches_count: 8 },
];

// Stats for organizer dashboard
export const mockStats = {
  totalMatches: 2,
  totalPlayers: 4,
  totalUmpires: 1,
  matchesToday: 2,
};
