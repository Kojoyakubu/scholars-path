import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const LessonNoteView = () => {
  const downloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      // ================= HEADER TABLE =================
      const headerData = [
        ["School:", "APERADI PRESBY BASIC SCHOOL", "Class:", "JHS 1"],
        ["Week Ending:", "Friday, October 18, 2025", "Class Size:", "45"],
        ["Strand:", "Introduction to Computing", "Term:", "ONE"],
        ["Sub-Strand:", "Components of Computers & Computer Systems", "Lesson:", "1 of 1"],
        ["Content Standard:", "B7.1.1.1.1", "", ""],
      ];

      autoTable(doc, {
        startY: 40,
        body: headerData,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 4,
          textColor: [0, 0, 0],
          fontStyle: "normal", // removes bold
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: "normal",
        },
        didDrawPage: (data) => {
          // ============= PAGE HEADER =============
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.text("Lesson Note", doc.internal.pageSize.getWidth() / 2, 25, { align: "center" });

          // ============= SINGLE FOOTER ============
          const pageCount = doc.internal.getNumberOfPages();
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.text(`Page ${pageCount}`, pageWidth - 60, pageHeight - 20);
        },
      });

      // ================= LESSON PHASES =================
      const lessonPhases = [
        {
          title: "Phase 1: Starter",
          content:
            "Teacher reviews the previous lesson and introduces the new topic with examples.",
        },
        {
          title: "Phase 2: Main",
          content:
            "Teacher explains the components of a computer system using diagrams and demonstrations.",
        },
        {
          title: "Phase 3: Conclusion",
          content:
            "Learners summarize what they have learned and ask questions for clarification.",
        },
      ];

      let yPosition = doc.lastAutoTable.finalY + 15; // smaller gap

      lessonPhases.forEach((phase) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(phase.title, 40, yPosition);
        yPosition += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const splitText = doc.splitTextToSize(phase.content, 520);
        doc.text(splitText, 40, yPosition);
        yPosition += splitText.length * 12 + 12;
      });

      // ================= SAVE PDF =================
      doc.save("LessonNote.pdf");
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("An error occurred while generating the PDF. Check console for details.");
    }
  };

  // ================= PAGE VIEW =================
  return (
    <div style={{ padding: "30px" }}>
      <h2>Lesson Note Preview</h2>
      <p>
        Click below to download the formatted lesson note PDF with clean headers, proper spacing, and footer.
      </p>
      <button
        onClick={downloadPDF}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0d6efd",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Download as PDF
      </button>
    </div>
  );
};

export default LessonNoteView;
