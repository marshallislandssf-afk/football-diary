import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { PublicProfileClient } from './PublicProfileClient';

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const supabase = await createClient();

  // Find the user profile by username
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .eq('is_public', true)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // Get their public matches
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_public', true)
    .order('date', { ascending: false });

  return (
    <PublicProfileClient
      profile={profile}
      matches={(matches || []).map((row: any) => ({
        id: row.id,
        date: row.date,
        homeTeam: { name: row.home_team_name, apiId: row.home_team_api_id },
        awayTeam: { name: row.away_team_name, apiId: row.away_team_api_id },
        homeScore: row.home_score ?? undefined,
        awayScore: row.away_score ?? undefined,
        competition: {
          name: row.competition_name,
          country: row.competition_country,
          leagueId: row.competition_league_id,
        },
        venue: row.venue ?? undefined,
        isManual: row.is_manual,
        annotations: row.annotations ?? [],
        notes: row.notes ?? [],
        images: row.images ?? [],
        lineup: row.lineup ?? undefined,
        events: row.events ?? [],
        apiHomeTeam: row.api_home_team ?? undefined,
        apiAwayTeam: row.api_away_team ?? undefined,
      }))}
    />
  );
}
