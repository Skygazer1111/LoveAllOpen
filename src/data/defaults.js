/**
 * Default tournament seed data and auth constant.
 */

export const STORAGE_KEY = 'loveall_tournament_2026';
export const ADMIN_PASSWORD = 'loveall2026';

export const DEFAULT_DATA = {
  settings: {
    tournamentName: 'LoveAll Open Badminton Tournament 2026',
    tournamentDate: '16th August, Sunday',
    tournamentTime: '9:00 AM to 1:00 PM',
    venue: 'Toneup Badminton, opposite Tone up Gym, Muttukkaranchavadi, Thoraipakkam, Greater Chennai',
    venueShort: 'Toneup Badminton, Thoraipakkam',
    mapsQuery: 'Toneup Badminton Thoraipakkam Chennai',
    shuttles: 'Yonex Mavis 350',
    courts: 2,
    level: 'Beginner Level',
    schedulePublished: false,
    publishedAt: null
  },
  categories: {
    'mens-singles': {
      id: 'mens-singles',
      name: "Men's Singles",
      fee: 500,
      feeLabel: 'Registration Fee',
      type: 'singles',
      icon: '🏸',
      participants: [],
      groups: [],
      knockout: { rounds: [] }
    },
    'mens-doubles': {
      id: 'mens-doubles',
      name: "Men's Doubles",
      fee: 750,
      feeLabel: 'Per Team',
      type: 'doubles',
      icon: '🏸',
      participants: [],
      groups: [],
      knockout: { rounds: [] }
    },
    'mixed-doubles': {
      id: 'mixed-doubles',
      name: 'Mixed Doubles',
      fee: 750,
      feeLabel: 'Per Team',
      type: 'doubles',
      icon: '🏸',
      participants: [],
      groups: [],
      knockout: { rounds: [] }
    }
  }
};
