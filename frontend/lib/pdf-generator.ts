import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MonthlyReportData {
  id: number;
  property_id: number;
  report_month: string;
  total_budget: string;
  total_tenants: number;
  paid_tenants: number;
  pending_amount: string;
  spending_breakdown: Array<{
    config_id: number;
    config_title: string;
    allocated_amount: number;
    percentage: number;
    description?: string | null;
  }>;
  notes?: string | null;
  property?: {
    id: number;
    name: string;
    address: string;
  };
  created_at: string;
}

export const generateMonthlyReportPDF = async (
  report: MonthlyReportData
) => {
  const doc = new jsPDF();

  // Colors
  const textColor = '#1F2937';

  let yPosition = 20;

  // Header with colored background
  doc.setFillColor(79, 70, 229); // Primary color
  doc.rect(0, 0, 210, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('MONTHLY REPORT', 105, 20, { align: 'center' });

  // Property name and month
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const monthYear = new Date(report.report_month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
  doc.text(`${report.property?.name || 'Property'} - ${monthYear}`, 105, 32, { align: 'center' });

  yPosition = 50;

  // Reset text color
  doc.setTextColor(textColor);

  // === SUMMARY SECTION ===
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Summary', 14, yPosition);
  yPosition += 10;

  // Summary boxes
  const boxWidth = 45;
  const boxHeight = 25;
  const boxSpacing = 2;
  let xPosition = 14;

  const summaryData = [
    { label: 'Total Budget', value: `€${parseFloat(report.total_budget).toFixed(2)}`, color: [79, 70, 229] },
    { label: 'Collection Rate', value: `${report.total_tenants > 0 ? ((report.paid_tenants / report.total_tenants) * 100).toFixed(1) : 0}%`, color: [16, 185, 129] },
    { label: 'Pending Amount', value: `€${parseFloat(report.pending_amount).toFixed(2)}`, color: [249, 115, 22] },
    { label: 'Paid Tenants', value: `${report.paid_tenants} / ${report.total_tenants}`, color: [59, 130, 246] },
  ];

  summaryData.forEach((item, index) => {
    xPosition = 14 + (index * (boxWidth + boxSpacing));

    // Box background
    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    doc.roundedRect(xPosition, yPosition, boxWidth, boxHeight, 3, 3, 'F');

    // Label
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, xPosition + boxWidth/2, yPosition + 8, { align: 'center' });

    // Value
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(item.value, xPosition + boxWidth/2, yPosition + 18, { align: 'center' });
  });

  yPosition += boxHeight + 15;
  doc.setTextColor(textColor);

  // === BUDGET ALLOCATION SECTION ===
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Budget Allocation', 14, yPosition);
  yPosition += 8;

  if (report.spending_breakdown && report.spending_breakdown.length > 0) {
    // Table headers and data
    const tableData = report.spending_breakdown.map(item => [
      item.config_title,
      `€${parseFloat(item.allocated_amount.toString()).toFixed(2)}`,
      `${parseFloat(item.percentage.toString()).toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Category', 'Amount', 'Percentage']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 50, halign: 'right' },
        2: { cellWidth: 50, halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Budget allocation chart (simple bars)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Visual Distribution', 14, yPosition);
    yPosition += 8;

    const barColors = [
      [59, 130, 246],   // Blue
      [16, 185, 129],   // Green
      [251, 191, 36],   // Yellow
      [168, 85, 247],   // Purple
      [236, 72, 153],   // Pink
      [99, 102, 241],   // Indigo
    ];

    report.spending_breakdown.forEach((item, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      const percentage = parseFloat(item.percentage.toString());
      const barWidth = (percentage / 100) * 150;
      const color = barColors[index % barColors.length];

      // Category name
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(item.config_title, 14, yPosition);

      // Bar background
      doc.setFillColor(240, 240, 240);
      doc.rect(14, yPosition + 2, 150, 6, 'F');

      // Bar fill
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(14, yPosition + 2, barWidth, 6, 'F');

      // Percentage text
      doc.setFontSize(8);
      doc.text(`${percentage.toFixed(1)}%`, 168, yPosition + 6);

      yPosition += 12;
    });

    yPosition += 5;
  }

  // === NOTES SECTION ===
  if (report.notes) {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes', 14, yPosition);
    yPosition += 8;

    doc.setFillColor(249, 250, 251);
    doc.rect(14, yPosition, 182, 40, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(report.notes, 170);
    doc.text(splitNotes, 18, yPosition + 6);

    yPosition += 45;
  }

  // === FOOTER ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 282, 196, 282);

    // Footer text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);

    const generatedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(`Generated on ${generatedDate}`, 14, 288);
    doc.text(`Page ${i} of ${pageCount}`, 196, 288, { align: 'right' });
  }

  // Generate filename
  const propertyName = report.property?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Property';
  const monthYearStr = new Date(report.report_month).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit'
  }).replace('/', '-');
  const filename = `Monthly_Report_${propertyName}_${monthYearStr}.pdf`;

  // Save the PDF
  doc.save(filename);
};
