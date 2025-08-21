
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Estimation, InvestmentAnalysis } from '../types';

export const generatePdfReport = async (
    estimation: Estimation,
    investmentAnalysis: InvestmentAnalysis | null,
    address: string
) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let cursorY = margin;

    // --- Helper Functions ---
    const addBrandedFooter = () => {
        const pageCount = doc.getNumberOfPages();
        const companyName = "LIKE FATHER LIKE SON INVESTMENTS";
        const contactInfo = "Trevor Finn | 410-725-8737 | letsjv.realestate@gmail.com | trevor.finn@exprealty.com";
        const disclaimer = "This report is provided for informational purposes only and is intended solely as a rough estimate for real estate investors. It is not a contractor bid, quote, or guarantee of costs. Actual repair expenses may vary. By using this report, you agree that Like Father Like Son Investments assumes no liability for investment decisions or outcomes.";
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100);

            const footerStartY = pageHeight - 25;
            doc.setDrawColor(200);
            doc.line(margin, footerStartY, pageWidth - margin, footerStartY);

            let footerCursorY = footerStartY + 5;

            doc.setFont('helvetica', 'bold');
            doc.text(companyName, margin, footerCursorY);

            doc.setFont('helvetica', 'normal');
            doc.text(contactInfo, margin, footerCursorY + 4);
            
            const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - (margin * 2));
            doc.text(disclaimerLines, margin, footerCursorY + 8);
            
            doc.text(
                `Page ${i} of ${pageCount}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        }
    };
    
    const checkNewPage = (neededHeight: number) => {
        if (cursorY + neededHeight > pageHeight - 30) { // Increased footer margin
            doc.addPage();
            cursorY = margin;
        }
    };
    
    const addMainTitle = (title: string, subtitle: string) => {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, cursorY);
        cursorY += 8;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(subtitle, margin, cursorY);
        cursorY += 10;
        doc.setDrawColor(200); // light grey
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 10;
    };

    const addSectionTitle = (title: string) => {
        checkNewPage(20);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, cursorY);
        cursorY += 8;
    };
    
    const addText = (text: string | string[], options: { isBold?: boolean, size?: number, color?: number[] } = {}) => {
        const { isBold = false, size = 10, color = [0, 0, 0] } = options;
        const maxWidth = pageWidth - margin * 2;
        
        let lines: string[] = [];
        if (Array.isArray(text)) {
            text.forEach(item => {
                const splitItem = doc.splitTextToSize(item, maxWidth);
                lines = lines.concat(splitItem);
            });
        } else {
            lines = doc.splitTextToSize(text, maxWidth);
        }

        const textHeight = lines.length * (size / 2.5);
        checkNewPage(textHeight + 5);

        doc.setFontSize(size);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(lines, margin, cursorY);
        cursorY += textHeight + 5;
    };
    
    const addKeyValue = (key: string, value: string) => {
        const valueLines = doc.splitTextToSize(value, pageWidth - margin * 2 - 50);
        const height = valueLines.length * 10 * 0.35;
        checkNewPage(height + 6);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(key, margin, cursorY);
        
        doc.setFont('helvetica', 'normal');
        doc.text(valueLines, margin + 50, cursorY);
        cursorY += height + 3;
    };

    const addNewPage = () => {
         doc.addPage();
         cursorY = margin;
    }

    // --- PDF Generation Starts ---
    addMainTitle('AI Property Analysis Report', address);

    // --- SECTION 1: REHAB ESTIMATE ---
    addSectionTitle('Rehab Estimate');
    
    addKeyValue('Total Estimated Cost:', estimation.summary.totalEstimatedCost);
    addKeyValue('Overall Difficulty:', `${estimation.summary.overallDifficulty}/5`);
    
    if (estimation.summary.keyRisks?.length) {
        addText('Key Risks', { isBold: true, size: 12 });
        addText(estimation.summary.keyRisks.map(r => `• ${r}`));
    }
    if (estimation.summary.actionableAdvice?.length) {
        addText('Actionable Advice', { isBold: true, size: 12 });
        addText(estimation.summary.actionableAdvice.map(a => `• ${a}`));
    }
    if (estimation.summary.assumptions?.length) {
        addText('Assumptions & Notes', { isBold: true, size: 12 });
        addText(estimation.summary.assumptions.map(a => `• ${a}`));
    }
    cursorY += 5;
    
    checkNewPage(20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Itemized Breakdown', margin, cursorY);
    cursorY += 8;

    autoTable(doc, {
        startY: cursorY,
        head: [['Area', 'Recommendations', 'Est. Cost', 'Difficulty']],
        body: estimation.repairs.map(r => [
            r.area,
            r.recommendations,
            r.estimatedCost,
            `${r.difficulty}/5`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74] },
        didDrawPage: (data) => {
            cursorY = data.cursor?.y ? data.cursor.y + 10 : margin;
        }
    });

    // --- SECTION 2: INVESTMENT ANALYSIS ---
    if (investmentAnalysis) {
        addNewPage();

        addMainTitle('AI Property Analysis Report', address);
        addSectionTitle('Investment Analysis');
        
        addKeyValue('Suggested ARV:', investmentAnalysis.suggestedARV);
        addKeyValue('Estimated Repair Cost:', investmentAnalysis.estimatedRepairCost);
        addKeyValue('Suggested MAO:', investmentAnalysis.suggestedMAO);
        
        addText('Deal Analysis', { isBold: true, size: 12 });
        addText(investmentAnalysis.investorFit.analysis, { color: investmentAnalysis.investorFit.fitsCriteria ? [34, 139, 34] : [220, 20, 60] });

        addText('Property Condition', { isBold: true, size: 12 });
        addText(`${investmentAnalysis.propertyCondition} (Est. Rehab Level: ${investmentAnalysis.estimatedRepairLevel})`);
        
        cursorY += 5;
        
        checkNewPage(20);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Comparable Sales', margin, cursorY);
        cursorY += 8;
        
        autoTable(doc, {
            startY: cursorY,
            head: [['Address', 'Sold Date', 'Sold Price', 'SqFt', 'Bed/Bath']],
            body: investmentAnalysis.comparables.map(c => [c.address, c.soldDate, c.soldPrice, c.sqft, c.bedBath]),
            theme: 'grid',
            headStyles: { fillColor: [2, 132, 199] },
            didDrawPage: (data) => {
                cursorY = data.cursor?.y ? data.cursor.y + 10 : margin;
            }
        });
        
        checkNewPage(20);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Exit Strategies', margin, cursorY);
        cursorY += 8;
        
        investmentAnalysis.exitStrategies.forEach(strat => {
            addText(strat.strategy, { isBold: true, color: [2, 132, 199] });
            addText(strat.details);
        });
    }

    addBrandedFooter();
    
    const fileName = `Property-Analysis-${address.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    doc.save(fileName);
};