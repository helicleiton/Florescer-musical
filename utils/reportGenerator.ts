import type { Student, Workshop, WorkshopLessonPlan, FullClassInfo, Attendance, AttendanceStatus } from '../types';

// The 'jspdf' and 'jspdf-autotable' libraries are loaded from a CDN in index.html.
// TypeScript is aware of `window.jspdf` via the global declaration in `types.ts`.

// Common function to add header and footer
const addHeaderAndFooter = (doc: any, title: string) => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Header
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.setFont('helvetica', 'bold');
    doc.text('Florescer Musical', 14, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 14, 28);
    
    doc.setDrawColor(224, 224, 224); // Light gray line
    doc.line(14, 32, pageWidth - 14, 32);

    // Footer
    const footerText = `Página ${i} de ${pageCount}`;
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    const generationDate = `Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`;
    doc.text(generationDate, 14, pageHeight - 10);
  }
};

const getStatusText = (status: AttendanceStatus | undefined): string => {
    if (!status) return 'Não registrado';
    switch (status) {
        case 'present': return 'Presente';
        case 'absent': return 'Ausente';
        case 'justified': return 'Justificada';
        default: return 'Não registrado';
    }
};

// Report for Student List
export const generateStudentListPDF = (students: Student[]) => {
  const doc = new window.jspdf.jsPDF();
  const tableColumn = ["Nome", "Idade", "Oficina", "Data de Matrícula"];
  const tableRows: (string | number)[][] = [];

  students.forEach(student => {
    const studentData = [
      student.name,
      student.age,
      student.workshopName || 'Aluno Avulso',
      new Date(student.registrationDate).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    ];
    tableRows.push(studentData);
  });

  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] }, // #10b981 (primary color)
  });

  addHeaderAndFooter(doc, 'Relatório de Alunos');
  doc.save('relatorio_alunos_florescer_musical.pdf');
};

// Report for a Workshop's Syllabus
export const generateSyllabusPDF = (workshop: Workshop, plans: WorkshopLessonPlan[]) => {
  const doc = new window.jspdf.jsPDF();
  let yPosition = 35;
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const bottomMargin = 20;

  plans.sort((a, b) => a.lessonNumber - b.lessonNumber).forEach(plan => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const lessonTitle = `Aula ${String(plan.lessonNumber).padStart(2, '0')}`;
    const titleLines = doc.splitTextToSize(lessonTitle, doc.internal.pageSize.getWidth() - margin * 2);

    if (yPosition + (titleLines.length * 5) > pageHeight - bottomMargin) {
      doc.addPage();
      yPosition = 35;
    }
    doc.text(titleLines, margin, yPosition);
    yPosition += titleLines.length * 5 + 2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const content = plan.content || 'Nenhum conteúdo definido.';
    const contentLines = doc.splitTextToSize(content, doc.internal.pageSize.getWidth() - margin * 2);
    
    if (yPosition + (contentLines.length * 5) > pageHeight - bottomMargin) {
        doc.addPage();
        yPosition = 35;
    }
    doc.text(contentLines, margin, yPosition);
    yPosition += (contentLines.length * 5) + 10; // Add extra space after content
  });
  
  addHeaderAndFooter(doc, `Planejamento - ${workshop.name}`);
  doc.save(`planejamento_${workshop.name.toLowerCase().replace(/\s/g, '_')}.pdf`);
};

// Report for Attendance
export const generateAttendanceReportPDF = (
  classes: FullClassInfo[], 
  students: Student[], 
  attendances: Attendance[]
) => {
  const doc = new window.jspdf.jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = 20;
  let y = 35;

  classes.forEach((cls, index) => {
    const studentsInClass = students.filter(s => s.workshopName === cls.name);
    if (studentsInClass.length === 0) return;

    const attendanceRecord = attendances.find(a => a.classId === cls.id)?.records || {};

    const classHeader = [
      `${cls.name} - Aula ${String(cls.aulaNumber).padStart(2, '0')}`,
      `Data: ${cls.date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
      `Professor: ${cls.teacher}`
    ];
    
    const tableHead = [["Aluno", "Status da Frequência"]];
    const tableBody = studentsInClass.sort((a,b) => a.name.localeCompare(b.name)).map(student => [
      student.name,
      getStatusText(attendanceRecord[student.id]),
    ]);
    
    // Estimate height needed for this class section
    const headerHeight = 7 * classHeader.length;
    const tableHeight = (tableBody.length + 1) * 10; // Rough estimation
    const sectionHeight = headerHeight + tableHeight + 10;

    if (y + sectionHeight > pageHeight - bottomMargin && index > 0) {
      doc.addPage();
      y = 35;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(classHeader[0], 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(classHeader[1], 14, y);
    y += 5;
    doc.text(classHeader[2], 14, y);

    (doc as any).autoTable({
      head: tableHead,
      body: tableBody,
      startY: y + 2,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      didDrawPage: (data: any) => {
        y = data.cursor.y + 15;
      }
    });
    y = (doc as any).lastAutoTable.finalY + 15;
  });

  addHeaderAndFooter(doc, 'Relatório de Frequência');
  doc.save('relatorio_frequencia_florescer_musical.pdf');
};