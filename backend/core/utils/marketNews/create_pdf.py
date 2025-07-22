from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from markdown import markdown
from bs4 import BeautifulSoup
import requests
from pathlib import Path
from io import BytesIO
from django.conf import settings
from reportlab.lib.utils import ImageReader


def create_pdf_with_header_footer(text_md, title, company_website):
    buffer = BytesIO()
    width, height = A4

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=100,
        bottomMargin=60
    )

    # Estilos
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='CustomTitle', fontSize=20, leading=20, alignment=TA_CENTER, spaceAfter=12, textColor=colors.HexColor("#ED6008"), fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle(name='CustomHeading1', fontSize=18, leading=18, spaceAfter=8, textColor=colors.HexColor("#ED6008"), fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle(name='CustomHeading2', fontSize=16, leading=16, spaceAfter=6, textColor=colors.HexColor("#ED6008"), fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle(name='CustomHeading3', fontSize=14, leading=16, spaceAfter=6, textColor=colors.HexColor("#000000"), fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle(name='CustomHeading4', fontSize=12, leading=16, spaceAfter=6, textColor=colors.HexColor("#000000"), fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle(name='CustomHeading5', fontSize=10, leading=16, spaceAfter=6, textColor=colors.HexColor("#000000"), fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle(name='CustomBodyText', fontSize=10, leading=15, spaceAfter=8))

    # Convert Markdown para HTML e parse com BeautifulSoup
    html = markdown(text_md)
    soup = BeautifulSoup(html, "html.parser")
    story = []

    # Título
    story.append(Paragraph(title, styles['CustomTitle']))
    story.append(Spacer(1, 12))

    # Conversão HTML para elementos do ReportLab
    for elem in soup.contents:
        if elem.name == 'h1':
            story.append(Paragraph(elem.text, styles['CustomHeading1']))
            story.append(Spacer(1, 12))
        elif elem.name == 'h2':
            story.append(Paragraph(elem.text, styles['CustomHeading2']))
            story.append(Spacer(1, 12))
        elif elem.name == 'h3':
            story.append(Paragraph(elem.text, styles['CustomHeading3']))
            story.append(Spacer(1, 12))
        elif elem.name == 'h4':
            story.append(Paragraph(elem.text, styles['CustomHeading4']))
            story.append(Spacer(3, 6))
        elif elem.name == 'h5':
            story.append(Paragraph(elem.text, styles['CustomHeading5']))
            story.append(Spacer(3, 6))
        elif elem.name == 'p':
            story.append(Paragraph(elem.decode_contents(), styles['CustomBodyText']))
            story.append(Spacer(1, 12))
        elif elem.name == 'ul':
            for li in elem.find_all('li'):
                story.append(Paragraph(f"• {li.text}", styles['CustomBodyText']))
        elif elem.name == 'ol':
            for i, li in enumerate(elem.find_all('li'), 1):
                story.append(Paragraph(f"{i}. {li.text}", styles['CustomBodyText']))
        elif elem.name == 'a':
            continue
        elif elem.name == 'br':
            story.append(Spacer(1, 8))
        elif elem.name == 'blockquote':
            continue 

    logo_url = f"https://logo.clearbit.com/{company_website.replace('https://', '').replace('http://', '')}"
    logo_path = Path(settings.STATIC_ROOT) / "quickdoc" / "logo-admind.png"
    logo_img = None

    try:
        response = requests.get(logo_url, timeout=5)
        if response.status_code == 200:
            logo_img = BytesIO(response.content)
    except Exception:
        pass

    if not logo_img and logo_path.exists():
        logo_img = str(logo_path)

    def draw_header(canvas, doc):
        canvas.saveState()
        if logo_img:
            canvas.drawImage(ImageReader(logo_img), x=(width - 375) / 2, y=height - 125, width=375, height=125, preserveAspectRatio=True, mask='auto')
        canvas.restoreState()

    # Gera PDF com logo no header
    doc.build(story, onFirstPage=draw_header)
    buffer.seek(0)
    return buffer
