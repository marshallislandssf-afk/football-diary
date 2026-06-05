import { Match } from '../lib/types';

export const INITIAL_MATCHES: Match[] = [
  // 2026
  {
    id: 'wisla-2026',
    date: '2026-05-08',
    homeTeam: { name: 'Wisła Kraków' },
    awayTeam: { name: 'Chrobry Głogów' },
    competition: { name: 'I Liga', country: 'Poland' },
    venue: 'Stadion Miejski, Kraków',
  },
  {
    id: 'wieczysta-2026',
    date: '2026-05-09',
    homeTeam: { name: 'Wieczysta Kraków' },
    awayTeam: { name: 'Miedź Legnica' },
    competition: { name: 'II Liga', country: 'Poland' },
    venue: 'Kraków',
  },
  {
    id: 'cracovia-2026',
    date: '2026-05-11',
    homeTeam: { name: 'Cracovia' },
    awayTeam: { name: 'Radomiak Radom' },
    competition: { name: 'Ekstraklasa', country: 'Poland' },
    venue: 'Stadion Cracovii, Kraków',
  },
  // 2025
  {
    id: 'wales-2025',
    date: '2025-11-18',
    homeTeam: { name: 'Wales' },
    awayTeam: { name: 'North Macedonia' },
    competition: { name: 'WC Qualification Europe', country: 'International' },
    venue: 'Cardiff City Stadium',
  },
  {
    id: 'turks-caicos-2025',
    date: '2025-08-13',
    homeTeam: { name: 'Turks and Caicos' },
    awayTeam: { name: 'US Virgin Islands' },
    competition: { name: 'International Friendly', country: 'International' },
  },
  {
    id: 'exeter-nfst-2025',
    date: '2025-02-11',
    homeTeam: { name: 'Exeter City' },
    awayTeam: { name: 'Nottingham Forest' },
    competition: { name: 'FA Cup', country: 'England' },
    venue: 'St James Park, Exeter',
    annotations: [
      {
        id: 'ann-ex-fa',
        type: 'special',
        text: 'League One Exeter host Premier League Nottingham Forest in a giant-killing FA Cup tie',
        emoji: '🏆',
      },
    ],
  },
  {
    id: 'flamengo-2025',
    date: '2025-05-21',
    homeTeam: { name: 'Flamengo' },
    awayTeam: { name: 'Botafogo PB' },
    competition: { name: 'Copa do Brasil', country: 'Brazil' },
    venue: 'Rio de Janeiro',
  },
  {
    id: 'vasco-2025',
    date: '2025-05-18',
    homeTeam: { name: 'Vasco da Gama' },
    awayTeam: { name: 'Fortaleza' },
    competition: { name: 'Brasileirão Série A', country: 'Brazil' },
    venue: 'São Januário, Rio de Janeiro',
  },
  // 2023
  {
    id: 'dinamo-2023',
    date: '2023-10-08',
    homeTeam: { name: 'Dinamo București' },
    awayTeam: { name: 'CFR Cluj' },
    competition: { name: 'SuperLiga', country: 'Romania' },
    venue: 'Stadionul Dinamo, Bucharest',
  },
  {
    id: 'marseille-2023',
    date: '2023-08-26',
    homeTeam: { name: 'Marseille' },
    awayTeam: { name: 'Brest' },
    competition: { name: 'Ligue 1', country: 'France' },
    venue: 'Stade Vélodrome, Marseille',
  },
  {
    id: 'psg-2023',
    date: '2023-03-04',
    homeTeam: { name: 'Paris Saint-Germain' },
    awayTeam: { name: 'Nantes' },
    competition: { name: 'Ligue 1', country: 'France' },
    venue: 'Parc des Princes, Paris',
  },
  // 2022
  {
    id: 'wc-final-2022',
    date: '2022-12-18',
    homeTeam: { name: 'Argentina' },
    awayTeam: { name: 'France' },
    homeScore: 3,
    awayScore: 3,
    competition: { name: 'FIFA World Cup Final', country: 'International' },
    venue: 'Lusail Stadium, Qatar',
    annotations: [
      {
        id: 'ann-wc-1',
        type: 'special',
        text: 'World Cup Final — Argentina win on penalties. Messi lifts the trophy. One of the greatest matches in football history.',
        emoji: '🏆',
      },
      {
        id: 'ann-wc-2',
        type: 'milestone',
        text: "Lionel Messi's first World Cup winner's medal",
        emoji: '🐐',
      },
    ],
  },
  {
    id: 'fluminense-2022',
    date: '2022-04-27',
    homeTeam: { name: 'Fluminense' },
    awayTeam: { name: 'Union Santa Fe' },
    competition: {
