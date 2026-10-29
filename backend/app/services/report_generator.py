import hashlib
import datetime
from pathlib import Path
from typing import Dict, Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)

from app.config import REPORTS_DIR

STATUS_COLORS = {
    "Exact Match": colors.HexColor("#059669"),        # Emerald Green
    "Modified Quote": colors.HexColor("#d97706"),     # Amber / Ochre
    "Context Mismatch": colors.HexColor("#ea580c"),   # Warm Orange
    "Source Not Found": colors.HexColor("#dc2626"),   # Red / Crimson
    "Inconclusive": colors.HexColor("#64748b")       # Slate Gray
}

def generate_evidence_pdf(record_data: Dict[str, Any], output_filename: str) -> str:
    """
    Generates a professional, print-ready PDF Evidence Report using ReportLab.
    Returns the absolute path to the generated PDF.
    """
    file_path = REPORTS_DIR / output_filename
    doc = SimpleDocTemplate(
        str(file_path),
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0f172a"),
        alignment=0
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#64748b"),
        alignment=0
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=10,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155")
    )
    quote_style = ParagraphStyle(
        'QuoteText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#1e293b")
    )
    verdict_style = ParagraphStyle(
        'VerdictText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.white,
        alignment=1
    )
    alert_style = ParagraphStyle(
        'AlertText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#b91c1c")
    )

    story = []

    # 1. Header Banner
    timestamp = record_data.get("created_at") or datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    record_id = record_data.get("id") or "TEMP"
    verif_hash = hashlib.sha256(f"{record_id}-{timestamp}-{record_data.get('submitted_quote')}".encode()).hexdigest()[:16].upper()

    header_data = [
        [
            Paragraph("<b>PRAMAN AI</b><br/><font size='7' color='#475569'>LEGAL QUOTE VERIFICATION & EVIDENCE CERTIFICATE</font>", title_style),
            Paragraph(f"<b>Certificate Ref:</b> PRM-{record_id}-{verif_hash}<br/><b>Date:</b> {timestamp}<br/><b>Jurisdiction:</b> Indian Supreme Court & Authoritative Courts", subtitle_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[310, 220])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8)
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0f172a"), spaceBefore=2, spaceAfter=10))

    # 2. Verdict Banner
    status = record_data.get("status", "Inconclusive")
    confidence = int(record_data.get("confidence", 0) * 100)
    status_bg = STATUS_COLORS.get(status, colors.HexColor("#64748b"))

    verdict_content = [
        [
            Paragraph(f"VERIFICATION STATUS: <b>{status.upper()}</b>", verdict_style),
            Paragraph(f"<font color='white'><b>Confidence Score: {confidence}%</b></font>", ParagraphStyle('Conf', parent=verdict_style, fontSize=11))
        ]
    ]
    verdict_table = Table(verdict_content, colWidths=[360, 170])
    verdict_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), status_bg),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(verdict_table)
    story.append(Spacer(1, 10))

    # 3. Case Metadata Table
    case_meta = [
        [
            Paragraph("<b>Case Name:</b>", body_style),
            Paragraph(record_data.get("judgment_title") or record_data.get("case_name") or "Unspecified", body_style),
            Paragraph("<b>Citation:</b>", body_style),
            Paragraph(record_data.get("citation") or "N/A", body_style)
        ],
        [
            Paragraph("<b>Court:</b>", body_style),
            Paragraph(record_data.get("court") or record_data.get("court_name") or "Supreme Court of India", body_style),
            Paragraph("<b>Para / Page:</b>", body_style),
            Paragraph(f"Para {record_data.get('para_number') or 'N/A'}, Page {record_data.get('page_number') or 'N/A'}", body_style)
        ]
    ]
    meta_table = Table(case_meta, colWidths=[80, 200, 70, 180])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # 4. Side-by-Side Comparison: Submitted Quotation vs Original Passage
    story.append(Paragraph("<b>Quotation vs. Original Passage Comparison</b>", section_heading))
    
    sub_text = record_data.get("submitted_quote", "")
    orig_text = record_data.get("original_passage") or "No matching passage found in database."

    comp_data = [
        [
            Paragraph("<b>Submitted Quotation</b>", ParagraphStyle('H1', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor("#1e293b"))),
            Paragraph("<b>Original Judgment Passage</b>", ParagraphStyle('H2', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor("#065f46")))
        ],
        [
            Paragraph(f'"{sub_text}"', quote_style),
            Paragraph(f'"{orig_text}"', quote_style)
        ]
    ]
    comp_table = Table(comp_data, colWidths=[260, 270])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f1f5f9")),
        ('BACKGROUND', (1,0), (1,-1), colors.HexColor("#ecfdf5")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP')
    ]))
    story.append(comp_table)
    story.append(Spacer(1, 10))

    # 5. Diff & Semantic Alterations
    diff = record_data.get("diff")
    if diff:
        story.append(Paragraph("<b>Textual & Semantic Differences</b>", section_heading))
        added = ", ".join(diff.get("added_words", [])) or "None"
        removed = ", ".join(diff.get("removed_words", [])) or "None"
        
        diff_info = [
            [Paragraph("<b>Added Words:</b>", body_style), Paragraph(added, body_style)],
            [Paragraph("<b>Omitted Words:</b>", body_style), Paragraph(removed, body_style)],
            [Paragraph("<b>Similarity Index:</b>", body_style), Paragraph(f"{int(diff.get('similarity_ratio', 1.0) * 100)}%", body_style)]
        ]
        
        crit_shifts = diff.get("critical_alterations", [])
        if crit_shifts:
            crit_bullets = "<br/>".join([f"• <b>{c.get('type', '').upper()}</b>: {c.get('reason', '')}" for c in crit_shifts])
            diff_info.append([Paragraph("<b>Critical Shifts:</b>", alert_style), Paragraph(crit_bullets, alert_style)])

        diff_table = Table(diff_info, colWidths=[110, 420])
        diff_table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('VALIGN', (0,0), (-1,-1), 'TOP')
        ]))
        story.append(diff_table)
        story.append(Spacer(1, 8))

    # 6. Context Integrity & Cross-Case Tracing
    context = record_data.get("context_analysis")
    cross = record_data.get("cross_case")
    
    if (context and context.get("has_warnings")) or (cross and cross.get("alternative_source_found")):
        story.append(Paragraph("<b>Context Integrity & Source Tracing Findings</b>", section_heading))
        notes = []
        if context and context.get("warnings"):
            for w in context["warnings"]:
                notes.append(f"• <b>Context Warning:</b> {w}")
        if cross and cross.get("trace_summary"):
            notes.append(f"• <b>Cross-Case Origin:</b> {cross['trace_summary']}")

        notes_data = [[Paragraph("<br/>".join(notes), alert_style)]]
        notes_table = Table(notes_data, colWidths=[530])
        notes_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#fff7ed")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#fdba74")),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(notes_table)
        story.append(Spacer(1, 8))

    # 7. Grounded Explanation & Legal Limitations
    story.append(Paragraph("<b>Reasoned Explanation & Methodological Limitations</b>", section_heading))
    explanation = record_data.get("explanation", "")
    limitations = record_data.get("limitations", "")

    exp_data = [
        [Paragraph(f"<b>Explanation:</b> {explanation}", body_style)],
        [Paragraph(f"<b>Limitations:</b> {limitations}", ParagraphStyle('Lim', parent=body_style, fontSize=8, textColor=colors.HexColor("#64748b")))]
    ]
    exp_table = Table(exp_data, colWidths=[530])
    exp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(exp_table)
    story.append(Spacer(1, 12))

    # 8. Formal Legal Disclaimer Footer
    disclaimer = (
        "<b>LEGAL DISCLAIMER:</b> Praman AI provides algorithmic quote comparison and context analysis strictly for academic, "
        "journalistic, and professional research assistance. This document does not constitute formal legal advice. "
        "Judicial interpretations and citations should always be independently inspected by a qualified advocate or researcher."
    )
    story.append(Paragraph(disclaimer, ParagraphStyle('Disc', parent=body_style, fontSize=7.5, leading=10, textColor=colors.HexColor("#94a3b8"))))

    # Build PDF document
    doc.build(story)
    return str(file_path)
