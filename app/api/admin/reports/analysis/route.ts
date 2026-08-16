import { NextRequest, NextResponse } from 'next/server';
import { generateReportAnalysis, parseReportTab, parseTimeRange } from '@/lib/report-analysis';

export async function GET(request: NextRequest) {
  try {
    const tab = parseReportTab(request.nextUrl.searchParams.get('tab'));
    const range = parseTimeRange(request.nextUrl.searchParams.get('range') || '30d');
    const { analysis, snapshot } = await generateReportAnalysis(tab, range);

    return NextResponse.json({ analysis, snapshot });
  } catch (error) {
    console.error('Report analysis failed:', error);
    return NextResponse.json({ error: 'Failed to generate report analysis' }, { status: 500 });
  }
}
