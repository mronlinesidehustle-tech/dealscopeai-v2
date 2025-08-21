import type { Estimation, RepairItem, EstimationSummary } from '../types';

export const parseEstimationMarkdown = (markdown: string): Estimation => {
    const summary: Partial<EstimationSummary> = { assumptions: [], keyRisks: [], actionableAdvice: [], groundingSources: [] };
    const repairs: RepairItem[] = [];

    const summarySection = markdown.split('### Itemized Breakdown')[0];
    const tableSection = markdown.split('### Itemized Breakdown')[1];

    // Parse Summary
    const costMatch = summarySection.match(/\*\*Total Estimated Cost:\*\* (.+)/);
    if (costMatch) summary.totalEstimatedCost = costMatch[1].trim();

    const difficultyMatch = summarySection.match(/\*\*Overall Difficulty:\*\* (.+)/);
    if (difficultyMatch) summary.overallDifficulty = parseInt(difficultyMatch[1].trim(), 10);
    
    const parseBulletedList = (section: string, title: string): string[] => {
        const regex = new RegExp(`\\*\\*${title}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\s*\\*\\*|$)`);
        const match = section.match(regex);
        if (match && match[1]) {
            return match[1]
                .split('*')
                .map(item => item.trim())
                .filter(item => item.length > 0);
        }
        return [];
    };

    summary.assumptions = parseBulletedList(summarySection, 'Assumptions');
    summary.keyRisks = parseBulletedList(summarySection, 'Key Risks');
    summary.actionableAdvice = parseBulletedList(summarySection, 'Actionable Advice');

    // Parse Table
    if (tableSection) {
        const rows = tableSection.split('\n').filter(row => row.startsWith('|')).slice(2); // Skip header and separator
        rows.forEach(row => {
            const cells = row.split('|').map(cell => cell.trim());
            if (cells.length >= 6) { // Ensure row has all columns
                repairs.push({
                    area: cells[1],
                    observations: cells[2],
                    recommendations: cells[3],
                    estimatedCost: cells[4],
                    difficulty: parseInt(cells[5], 10),
                });
            }
        });
    }

    return {
        summary: summary as EstimationSummary,
        repairs: repairs,
    };
};