const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

/**
 * PDF Report Generator using PDFKit
 * Supports:
 * - Brand styling & modern multi-page layout
 * - Tamil Unicode via Noto Sans Tamil font
 * - English via Arial / Helvetica
 * - Metrics dashboard, error breakdown & line numbers
 * - Full original vs corrected code sections
 */

function loadFonts(doc) {
  const fontsDir = path.resolve(__dirname, '../fonts');
  const fonts = { body: 'Helvetica', tamil: null };

  // Load Arial for general Latin text
  const arialPath = path.join(fontsDir, 'arial.ttf');
  if (fs.existsSync(arialPath)) {
    try {
      doc.registerFont('Arial', arialPath);
      fonts.body = 'Arial';
    } catch (e) {
      console.warn('[PDF FONT] Arial load failed:', e.message);
    }
  }

  // Load Noto Sans Tamil for Tamil text
  const tamilPath = path.join(fontsDir, 'NotoSansTamil.ttf');
  if (fs.existsSync(tamilPath)) {
    try {
      doc.registerFont('NotoTamil', tamilPath);
      fonts.tamil = 'NotoTamil';
    } catch (e) {
      console.warn('[PDF FONT] Noto Sans Tamil load failed:', e.message);
    }
  }

  return fonts;
}

/**
 * Detect if a string contains Tamil Unicode characters (U+0B80 – U+0BFF)
 */
function containsTamil(text) {
  if (!text) return false;
  return /[\u0B80-\u0BFF]/.test(text);
}

/**
 * Write text with automatic font switching for Tamil content.
 * If text contains Tamil characters and a Tamil font is loaded, use it.
 * Otherwise use the default body font.
 */
function writeText(doc, text, fonts, options = {}) {
  if (!text) return;
  const useTamil = containsTamil(text) && fonts.tamil;
  const font = useTamil ? fonts.tamil : fonts.body;
  doc.font(font);
  if (options.fontSize) doc.fontSize(options.fontSize);
  if (options.fillColor) doc.fillColor(options.fillColor);
  doc.text(text, options);
}

async function generateAnalysisReport({ analysis, issues = [], user, language = 'en' }) {
  const reportsDir = path.resolve(__dirname, '../../uploads/reports');
  fs.mkdirSync(reportsDir, { recursive: true });

  const reportId = uuidv4();
  const fileName = `CodeSense_Report_${analysis.detected_language}_${Date.now()}.pdf`;
  const filePath = path.join(reportsDir, fileName);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        bufferPages: true
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Load fonts
      const fonts = loadFonts(doc);

      // Color Palette
      const primaryColor = '#4f46e5';
      const darkColor = '#0f172a';
      const grayColor = '#475569';
      const accentCritical = '#dc2626';
      const accentWarning = '#d97706';
      const accentSuccess = '#16a34a';

      // ─── Header Banner ───
      doc.rect(0, 0, doc.page.width, 100).fill(primaryColor);
      
      doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold')
        .text('CodeSense AI', 50, 32);
      
      doc.fontSize(11).font('Helvetica')
        .text('Detect Errors • Fix Code • Learn Smarter', 50, 60);

      doc.fontSize(10).font('Helvetica')
        .text(`Report Date: ${new Date().toLocaleDateString()}`, doc.page.width - 200, 35, { align: 'right', width: 150 })
        .text(`Analysis ID: ${analysis.id.substring(0, 13)}`, doc.page.width - 200, 52, { align: 'right', width: 150 });

      doc.moveDown(4);

      // ─── Meta Info Grid ───
      const startY = 120;
      doc.rect(50, startY, doc.page.width - 100, 75).fillAndStroke('#f8fafc', '#e2e8f0');

      doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold');
      doc.text('Target Language:', 65, startY + 15);
      doc.text('Code Quality Score:', 220, startY + 15);
      doc.text('Total Issues Found:', 380, startY + 15);

      doc.font('Helvetica').fontSize(14).fillColor(primaryColor);
      doc.text((analysis.detected_language || 'Unknown').toUpperCase(), 65, startY + 32);

      const score = analysis.quality_score !== null ? `${analysis.quality_score}/100` : 'N/A';
      const scoreColor = (analysis.quality_score || 0) >= 75 ? accentSuccess : (analysis.quality_score || 0) >= 50 ? accentWarning : accentCritical;
      doc.fillColor(scoreColor).text(score, 220, startY + 32);

      doc.fillColor(darkColor).text(issues.length.toString(), 380, startY + 32);

      doc.fontSize(9).font('Helvetica').fillColor(grayColor);
      doc.text(`User: ${user?.email || 'Authenticated User'}`, 65, startY + 54);
      doc.text(`Status: ${analysis.verification_status || 'Analyzed'}`, 220, startY + 54);

      // ─── Executive Summary ───
      doc.y = startY + 95;
      doc.moveDown();
      doc.fillColor(darkColor).fontSize(14).font('Helvetica-Bold').text('Executive Summary');
      doc.moveDown(0.3);

      const summaryText = analysis.analysis_summary || 'No summary available.';
      writeText(doc, summaryText, fonts, { fontSize: 10, fillColor: '#334155', lineGap: 3 });

      // ─── Quality Breakdown ───
      doc.moveDown(1.5);
      doc.fillColor(darkColor).fontSize(14).font('Helvetica-Bold').text('Code Quality & Issue Breakdown');
      doc.moveDown(0.5);

      const counts = {
        critical: issues.filter(i => i.severity === 'critical').length,
        error: issues.filter(i => i.severity === 'error').length,
        warning: issues.filter(i => i.severity === 'warning').length,
        info: issues.filter(i => i.severity === 'info').length
      };

      doc.fontSize(10).font('Helvetica-Bold');
      doc.fillColor(accentCritical).text(`• Critical: ${counts.critical}   `, { continued: true });
      doc.fillColor('#ea580c').text(`• Errors: ${counts.error}   `, { continued: true });
      doc.fillColor(accentWarning).text(`• Warnings: ${counts.warning}   `, { continued: true });
      doc.fillColor('#2563eb').text(`• Suggestions: ${counts.info}`);

      // ─── Issues List ───
      doc.moveDown(1.5);
      doc.fillColor(darkColor).fontSize(14).font('Helvetica-Bold').text('Detected Findings & Diagnostic Details');
      doc.moveDown(0.5);

      if (issues.length === 0) {
        doc.fontSize(10).font('Helvetica').fillColor(accentSuccess)
          .text('No syntax or logical errors detected in this analysis.');
      } else {
        issues.forEach((issue, idx) => {
          if (doc.y > 680) doc.addPage();

          doc.rect(50, doc.y, doc.page.width - 100, 1).fill('#cbd5e1');
          doc.moveDown(0.6);

          // Issue title (always English/ASCII safe)
          doc.fontSize(11).font('Helvetica-Bold').fillColor(darkColor)
            .text(`${idx + 1}. [${(issue.category || 'General').toUpperCase()}] Line ${issue.line_number || 'N/A'}: ${issue.message}`);
          doc.moveDown(0.2);

          doc.fontSize(9).font('Helvetica-Bold').fillColor(grayColor)
            .text(`Severity: ${(issue.severity || 'info').toUpperCase()} | Verification: ${issue.verification_status || 'ai_suggestion'}`);
          
          if (issue.affected_code) {
            doc.moveDown(0.3);
            doc.font('Courier').fontSize(8.5).fillColor('#b91c1c')
              .text(`Snippet: ${issue.affected_code.substring(0, 120)}`);
          }

          // Explanation — this is where Tamil text appears
          doc.moveDown(0.3);
          const explText = language === 'ta' && issue.explanation_ta ? issue.explanation_ta : issue.explanation_en;
          writeText(doc, explText || 'No explanation available.', fonts, { fontSize: 9, fillColor: '#1e293b', lineGap: 2 });

          // Suggested fix
          if (issue.suggested_fix) {
            doc.moveDown(0.2);
            doc.font('Helvetica-Bold').fontSize(9).fillColor(primaryColor).text('Suggested Fix: ', { continued: true });
            const fixText = issue.suggested_fix;
            // Use Tamil font if the fix contains Tamil text
            if (containsTamil(fixText) && fonts.tamil) {
              doc.font(fonts.tamil).fillColor('#334155').text(fixText);
            } else {
              doc.font(fonts.body).fillColor('#334155').text(fixText);
            }
          }

          doc.moveDown(0.8);
        });
      }

      // ─── Teaching Notes Section ───
      doc.addPage();

      // Section title — may contain Tamil
      const teachTitle = language === 'ta' 
        ? 'AI Code Teacher - Teaching Notes' 
        : 'AI Code Teacher & Concept Guide';
      doc.fillColor(darkColor).fontSize(14).font('Helvetica-Bold').text(teachTitle);
      
      // Tamil subtitle if Tamil report
      if (language === 'ta' && fonts.tamil) {
        doc.moveDown(0.2);
        doc.font(fonts.tamil).fontSize(12).fillColor(primaryColor)
          .text('AI குறியீட்டு ஆசிரியர் வழிகாட்டல்');
      }
      
      doc.moveDown(0.5);

      const notesText = language === 'ta' && analysis.teaching_notes_ta 
        ? analysis.teaching_notes_ta 
        : (analysis.teaching_notes_en || 'Review clean code principles.');
      
      // Teaching notes can be long — write with auto font switching
      writeText(doc, notesText, fonts, { fontSize: 10, fillColor: '#334155', lineGap: 4 });

      // ─── Corrected Code Output ───
      doc.moveDown(1.5);
      doc.fillColor(darkColor).fontSize(14).font('Helvetica-Bold').text('Corrected Code Output');
      doc.moveDown(0.5);

      const codeLines = (analysis.corrected_source || analysis.original_source || '').split('\n').slice(0, 150);
      doc.font('Courier').fontSize(8).fillColor('#0f172a');
      codeLines.forEach((line, index) => {
        if (doc.y > 750) doc.addPage();
        const lineNum = String(index + 1).padStart(3, ' ');
        doc.text(`${lineNum} | ${line}`);
      });

      // ─── Page Numbers ───
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).font('Helvetica').fillColor('#94a3b8')
          .text(`CodeSense AI Report • Page ${i + 1} of ${pages.count}`, 50, doc.page.height - 35, { align: 'center', width: doc.page.width - 100 });
      }

      doc.end();

      writeStream.on('finish', () => {
        resolve({
          reportId,
          fileName,
          filePath
        });
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateAnalysisReport
};
