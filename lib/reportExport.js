import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Builds a printable PDF from a report exactly as returned by GET /Reports/summary, and saves it
// via the browser. Client-side by design: the report is already loaded on screen, so there's no
// second network round trip and no PDF library or fonts to ship in the backend image.
export function exportReportToPdf(report) {
    if (!report) return;

    const doc = new jsPDF();
    const marginX = 14;
    let y = 18;

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('DaySpring Chapel — Activity Report', marginX, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(report.range?.label || '', marginX, y);
    y += 6;
    if (report.dataCurrentTo) {
        doc.setFontSize(9);
        doc.setTextColor(110);
        doc.text(`Data current to ${new Date(report.dataCurrentTo).toLocaleString()}`, marginX, y);
        doc.setTextColor(0);
        y += 8;
    } else {
        y += 4;
    }

    const w = report.workflow || {};
    const e = report.events || {};
    const op = report.operations;

    autoTable(doc, {
        startY: y,
        margin: { left: marginX },
        head: [['Metric', 'Value']],
        body: [
            ['Content uploaded', w.uploaded ?? 0],
            ['Published to website', w.publishedToWebsite ?? 0],
            ['Sent back for revision', w.sentBackForRevision ?? 0],
            ['Avg. days: submit → publish', w.averageDaysSubmitToPublish ?? '—'],
            ['Events held', e.held ?? 0],
            ['Events published', e.published ?? 0],
            ['Events with highlight video', e.withHighlightVideo ?? 0],
            ['Events cleaned up (archived permanently)', e.purged ?? 0],
            ...(op ? [
                ['New members', op.newMembers ?? 0],
                ['Requisitions — total', op.requisitionsTotal ?? 0],
                ['Requisitions — approved', op.requisitionsApproved ?? 0],
                ['Requisitions — rejected', op.requisitionsRejected ?? 0],
                ['Requisitions — pending', op.requisitionsPending ?? 0],
                ['Appointments — total', op.appointmentsTotal ?? 0],
                ['Appointments — confirmed', op.appointmentsConfirmed ?? 0],
                ['Appointments — cancelled', op.appointmentsCancelled ?? 0],
                ['Appointments — pending', op.appointmentsPending ?? 0],
            ] : []),
        ],
        theme: 'grid',
        headStyles: { fillColor: [217, 117, 44] },
        styles: { fontSize: 9 },
    });
    y = doc.lastAutoTable.finalY + 10;

    const section = (title, head, rows) => {
        if (!rows.length) return;
        if (y > 260) { doc.addPage(); y = 18; }
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(title, marginX, y);
        y += 4;
        autoTable(doc, {
            startY: y,
            margin: { left: marginX },
            head: [head],
            body: rows,
            theme: 'striped',
            headStyles: { fillColor: [23, 32, 51] },
            styles: { fontSize: 9 },
        });
        y = doc.lastAutoTable.finalY + 10;
    };

    section('Uploads by category', ['Category', 'Count'], (w.uploadedByCategory || []).map((c) => [c.name, c.count]));
    section('Top contributors', ['Contributor', 'Uploads'], (w.topContributors || []).map((c) => [c.name, c.count]));
    section('Approvals by approver', ['Approver', 'Approvals'], (w.approvalsByApprover || []).map((c) => [c.name, c.count]));
    section('Social platform posts', ['Platform', 'Posted', 'Failed'],
        (report.socialPosts || []).map((p) => [p.platform, p.posted, p.failed]));

    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.text(`Generated ${new Date(report.generatedAt || Date.now()).toLocaleString()}`, marginX, 290);

    const fileName = `dayspring-report-${(report.range?.label || 'export').replace(/\s+/g, '-').toLowerCase()}.pdf`;
    doc.save(fileName);
}
