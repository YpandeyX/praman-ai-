from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

pub_dir = Path('frontend/public')
pub_dir.mkdir(parents=True, exist_ok=True)
styles = getSampleStyleSheet()

header_style = ParagraphStyle(
    'Head',
    parent=styles['Heading1'],
    fontName='Helvetica-Bold',
    fontSize=14,
    alignment=1,
    spaceAfter=8,
    textColor=colors.HexColor('#0f172a')
)
subhead_style = ParagraphStyle(
    'Sub',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=10,
    alignment=1,
    spaceAfter=14,
    textColor=colors.HexColor('#475569')
)
para_style = ParagraphStyle(
    'Para',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=10,
    leading=15,
    spaceAfter=10,
    textColor=colors.HexColor('#1e293b')
)

def make_pdf(filename, title, cit, paras):
    filepath = pub_dir / filename
    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    story = [
        Paragraph('IN THE SUPREME COURT OF INDIA', header_style),
        Paragraph(f'<b>{title}</b><br/>{cit}', subhead_style),
        HRFlowable(width='100%', thickness=1, color=colors.HexColor('#94a3b8'), spaceAfter=14)
    ]
    for p_num, text in paras:
        story.append(Paragraph(f'<b>[Para {p_num}]</b> {text}', para_style))
        story.append(Spacer(1, 8))
    doc.build(story)
    print(f'Generated: {filepath.resolve()}')

if __name__ == '__main__':
    # 1. Sample_Judgment.pdf (Maneka Gandhi)
    make_pdf('Sample_Judgment.pdf', 'MANEKA GANDHI v. UNION OF INDIA', 'AIR 1978 SC 597 / (1978) 1 SCC 248', [
        (15, '"The right to life includes the right to live with dignity."'),
        (16, 'The right to life under Article 21 cannot be restricted to mere animal existence. It includes the right to live with human dignity and all that goes along with it, namely, the bare necessities of life such as adequate nutrition, clothing and shelter.'),
        (56, 'The procedure prescribed by law under Article 21 must be just, fair and reasonable and not arbitrary, fanciful or oppressive, otherwise it would be no procedure at all and the requirement of Article 21 would not be satisfied.')
    ])

    # 2. Puttaswamy_Privacy_2017.pdf
    make_pdf('Puttaswamy_Privacy_2017.pdf', 'JUSTICE K.S. PUTTASWAMY (RETD.) v. UNION OF INDIA', '(2017) 10 SCC 1', [
        (298, '"Privacy is the constitutional core of human dignity. Privacy has both positive and negative contents. The negative content restrains the State from committing an intrusion upon the life and personal liberty of a citizen."'),
        (310, '"The right to privacy is protected as an intrinsic part of the right to life and personal liberty under Article 21 and as a part of the freedoms guaranteed by Part III of the Constitution."')
    ])

    # 3. Kesavananda_Bharati_1973.pdf
    make_pdf('Kesavananda_Bharati_1973.pdf', 'KESAVANANDA BHARATI v. STATE OF KERALA', '(1973) 4 SCC 225', [
        (292, '"Parliament cannot alter the basic structure or essential framework of the Constitution."'),
        (310, 'The Constitution of India vests amending power in Parliament under Article 368, but this power is not a power to destroy the Constitution itself.')
    ])
