// /client/src/utils/downloadHelper.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const downloadAsPdf = (elementId, topic, currentNote) => {
  // ✅ Initialize A4 Portrait
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let cursorY = margin;

  // 1. Header Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text("Teacher Lesson Note", margin, cursorY);
  cursorY += 10;

  // 2. Information Table (Teacher/School Info)
  // We use autoTable to ensure it fits perfectly on the top of Page 1
  autoTable(doc, {
    startY: cursorY,
    head: [['Information', 'Details']],
    body: [
      ['Subject', currentNote.subject || 'N/A'],
      ['Topic', currentNote.subStrand?.name || topic],
      ['Class', currentNote.class || 'N/A'],
      ['Duration', currentNote.duration || 'N/A'],
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 2 },
    headStyles: { fillColor: [102, 126, 234] },
    margin: { left: margin, right: margin },
  });
  
  cursorY = doc.lastAutoTable.finalY + 10;

  // 3. Main Content (The Lesson Text)
  // We manually wrap the text to ensure it stays within 12pt and fits the width
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  // Clean markdown tags for the PDF text version
  const cleanContent = currentNote.content.replace(/[#*]/g, ''); 
  const lines = doc.splitTextToSize(cleanContent, contentWidth);

  lines.forEach((line) => {
    if (cursorY > pageHeight - margin) {
      // If we hit the end of Page 1, start Page 2
      if (doc.internal.getNumberOfPages() < 2) {
        doc.addPage();
        cursorY = margin;
      } else {
        // If we are already on Page 2 and running out of space, 
        // slightly reduce line spacing to force fit
        cursorY -= 1; 
      }
    }
    doc.text(line, margin, cursorY);
    cursorY += 6.5; // Line height for 12pt text
  });

  doc.save(`${topic.replace(/\s+/g, '_')}_LessonNote.pdf`);
};