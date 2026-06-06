import { createClient } from './supabase-client';
import { Match } from './types';

function matchToRow(match: Match, userId: string) {
  return {
    id: match.id,
    user_id: userId,
    date: match.date,
    home_team_name: match.homeTeam.name,
    home_team_api_id: match.homeTeam.apiId ?? null,
    away_team_name: match.awayTeam.name,
    away_team_api_id: match.awayTeam.apiId ?? null,
    home_score: match.homeScore ?? null,
    away_score: match.awayScore ?? null,
    competition_name: match.competition.name,
    competition_country: match.competition.country,
    competition_league_id: match.competition.leagueId ?? null,
    venue: match.venue ?? null,
    is_manual: match.isManual ?? false,
    is_public: true,
    api_fixture_id: match.apiFixtureId ?? null,
    api_home_team: match.apiHomeTeam ?? null,
    api_away_team: match.apiAwayTeam ?? null,
    annotations: match.annotations ?? [],
    notes: match.notes ?? [],
    images: match.images ?? [],
    lineup: match.lineup ?? null,
    events: match.events ?? [],
    updated_at: new Date().toISOString(),
  };
}

function rowToMatch(row: any): Match {
  return {
    id: row.id,
    date: row.date,
    homeTeam: { name: row.home_team_name, apiId: row.home_team_api_id ?? undefined },
    awayTeam: { name: row.away_team_name, apiId: row.away_team_api_id ?? undefined },
    homeScore: row.home_score ?? undefined,
    awayScore: row.away_score ?? undefined,
    competition: {
      name: row.competition_name,
      country: row.competition_country,
      leagueId: row.competition_league_id ?? undefined,
    },
    venue: row.venue ?? undefined,
    isManual: row.is_manual,
    apiFixtureId: row.api_fixture_id ?? undefined,
    apiHomeTeam: row.api_home_team ?? undefined,
    apiAwayTeam: row.api_away_team ?? undefined,
    annotations: row.annotations ?? [],
    notes: row.notes ?? [],
    images: row.images ?? [],
    lineup: row.lineup ?? undefined,
    events: row.events ?? [],
  };
}

export async function getMatches(): Promise<Match[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return (data || []).map(rowToMatch);
}

export async function saveMatch(match: Match, userId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('matches')
    .upsert(matchToRow(match, userId), { onConflict: 'id' });
  if (error) throw error;
}

export async function updateMatch(id: string, updates: Partial<Match>, userId: string): Promise<void> {
  const supabase = createClient();
  const existing = await supabase.from('matches').select('*').eq('id', id).single();
  if (existing.error) throw existing.error;
  const merged = rowToMatch(existing.data);
  const updated = { ...merged, ...updates };
  await saveMatch(updated, userId);
}

export async function deleteMatch(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('matches').delete().eq('id', id);
  if (error) throw error;
}

export async function getPublicMatches(userId: string): Promise<Match[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data || []).map(rowToMatch);
}

export async function importFromLocalStorage(matches: Match[], userId: string): Promise<void> {
  const supabase = createClient();
  const rows = matches.map(m => matchToRow(m, userId));
  const { error } = await supabase.from('matches').upsert(rows, { onConflict: 'id' });
  if (error) throw error;
}
