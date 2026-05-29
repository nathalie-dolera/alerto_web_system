import { NextRequest, NextResponse } from 'next/server';
import { generateReportAnalysis, parseReportTab } from '@/lib/report-analysis';

export async function GET(request: NextRequest) {
  try {
    const tab = parseReportTab(request.nextUrl.searchParams.get('tab'));
    const { analysis, snapshot } = await generateReportAnalysis(tab);

    return NextResponse.json({ analysis, snapshot });
  } catch (error) {
    console.error('Report analysis failed:', error);
    return NextResponse.json({ error: 'Failed to generate report analysis' }, { status: 500 });
  }
}
