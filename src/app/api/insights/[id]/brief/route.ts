import { NextResponse } from 'next/server';
import { demoBrief, demoInsights } from '@/lib/demo/data';
import { BriefGenerator } from '@/lib/recommendations/brief-generator';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const isDemoMode = process.env.DEMO_MODE === 'true';

  if (isDemoMode) {
    return NextResponse.json(demoBrief);
  }

  const insight = demoInsights.find((i) => i.id === id) || demoInsights[0];

  const brief = await BriefGenerator.generate(
    {
      observation: insight.observation || '',
      whyCompetitorWon: insight.whyCompetitorWon || '',
      evidenceText: insight.evidenceText || '',
      hypothesis: insight.hypothesis || '',
      recommendedAction: insight.recommendedAction || '',
      contentType: insight.contentType || 'Strategic Brief',
      contentAngle: insight.contentAngle || '',
      suggestedEvidence: insight.suggestedEvidence || '',
      confidence: insight.confidence || 0.85,
      limitations: insight.limitations || '',
    },
    'Pixis',
    insight.promptText || 'Best AI platform for ad optimization'
  );

  return NextResponse.json(brief);
}
