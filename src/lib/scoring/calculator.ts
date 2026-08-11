export interface ScoringInput {
  targetBrand: string;
  results: Array<{
    mentioned: boolean;
    position: number | null;
    competitorsMentioned: string[];
    engineName: string;
    engineColor?: string;
    sentiment?: string | null;
  }>;
  allCompetitors: string[];
}

export interface ScoringOutput {
  visibilityScore: number; // 0 - 100%
  mentionRate: number;     // 0 - 100%
  avgPosition: number;
  shareOfMentions: number; // 0 - 100%
  competitorShares: { name: string; share: number; color?: string }[];
  engineBreakdown: {
    engineName: string;
    engineColor: string;
    mentionFrequency: string;
    avgPosition: number;
    sentiment: 'positive' | 'neutral' | 'negative' | null;
    abbreviation: string;
  }[];
}

export class ScoringCalculator {
  static calculate(input: ScoringInput): ScoringOutput {
    const totalRuns = input.results.length || 1;
    const mentions = input.results.filter((r) => r.mentioned);
    const mentionCount = mentions.length;

    // Visibility Score = % of tracked AI responses where target brand was detected
    const visibilityScore = Math.round((mentionCount / totalRuns) * 100);

    // Mention Rate
    const mentionRate = visibilityScore;

    // Average Position
    const positions = mentions
      .map((r) => r.position)
      .filter((p): p is number => p !== null && p > 0);
    const avgPosition =
      positions.length > 0
        ? Number((positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1))
        : 0;

    // Competitor Share of Voice
    const mentionCounts: Record<string, number> = { [input.targetBrand]: mentionCount };
    input.allCompetitors.forEach((c) => {
      mentionCounts[c] = 0;
    });

    input.results.forEach((r) => {
      r.competitorsMentioned.forEach((c) => {
        mentionCounts[c] = (mentionCounts[c] || 0) + 1;
      });
    });

    const totalMentionsAll = Object.values(mentionCounts).reduce((a, b) => a + b, 0) || 1;

    const competitorShares = Object.entries(mentionCounts).map(([name, count]) => ({
      name,
      share: Math.round((count / totalMentionsAll) * 100),
    }));

    const shareOfMentions = mentionCounts[input.targetBrand]
      ? Math.round((mentionCounts[input.targetBrand] / totalMentionsAll) * 100)
      : 0;

    // Per-Engine Breakdown
    const engineMap: Record<
      string,
      { results: typeof input.results; color: string }
    > = {};

    input.results.forEach((r) => {
      if (!engineMap[r.engineName]) {
        engineMap[r.engineName] = { results: [], color: r.engineColor || '#123c2f' };
      }
      engineMap[r.engineName].results.push(r);
    });

    const engineBreakdown = Object.entries(engineMap).map(([engineName, data]) => {
      const eMentions = data.results.filter((r) => r.mentioned);
      const eRate = eMentions.length / (data.results.length || 1);
      const frequency = eRate >= 0.6 ? 'High' : eRate >= 0.3 ? 'Medium' : 'Low';

      const ePositions = eMentions
        .map((r) => r.position)
        .filter((p): p is number => p !== null && p > 0);
      const eAvgPos =
        ePositions.length > 0
          ? Number((ePositions.reduce((a, b) => a + b, 0) / ePositions.length).toFixed(1))
          : 0;

      const abbr = engineName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase();

      return {
        engineName,
        engineColor: data.color,
        mentionFrequency: frequency,
        avgPosition: eAvgPos,
        sentiment: (eMentions[0]?.sentiment as 'positive' | 'neutral' | 'negative') || 'neutral',
        abbreviation: abbr,
      };
    });

    return {
      visibilityScore,
      mentionRate,
      avgPosition,
      shareOfMentions,
      competitorShares,
      engineBreakdown,
    };
  }
}
