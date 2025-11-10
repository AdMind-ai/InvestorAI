from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, Preformatted
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

def normalize_markdown_tables(md: str) -> str:
    """Normalize GFM-style tables so the Markdown library recognizes them.

    - Remove leading indentation from lines that start with '|'
    - Ensure a blank line before a table block
    - Ensure a blank line after a table block
    - Do not modify content inside fenced code blocks
    """
    lines = md.splitlines()
    in_code = False
    interim = []

    # 1) Left-trim lines that start with '|' outside fenced code
    for line in lines:
        stripped = line.lstrip()
        if stripped.startswith('```'):
            in_code = not in_code
            interim.append(line)
            continue
        if not in_code and stripped.startswith('|'):
            interim.append(stripped)
        else:
            interim.append(line)

    def is_pipe_line(s: str) -> bool:
        s = s.strip()
        return s.startswith('|') and '|' in s[1:]

    def is_separator_line(s: str) -> bool:
        s = s.strip()
        if '|' not in s:
            return False
        # Remove pipes and spaces, check remaining chars are '-' or ':' only
        core = s.replace('|', '').replace(' ', '')
        if not core:
            return False
        return all(ch in '-:' for ch in core) and '-' in core

    # 2) Insert blank lines before and after table blocks
    result = []
    i = 0
    n = len(interim)
    while i < n:
        line = interim[i]
        next_line = interim[i+1] if i + 1 < n else ''
        # Detect start of a table block: a pipe line followed by a separator line
        if is_pipe_line(line) and is_separator_line(next_line):
            # Ensure a blank line before table
            if result and result[-1].strip() != '':
                result.append('')
            # Append header and separator
            result.append(line.strip())
            result.append(next_line.strip())
            i += 2
            # Append subsequent table rows (pipe lines)
            while i < n and is_pipe_line(interim[i]):
                result.append(interim[i].strip())
                i += 1
            # Ensure a blank line after table if not already present
            if i < n and interim[i].strip() != '':
                result.append('')
            continue
        else:
            result.append(line)
            i += 1

    return '\n'.join(result)


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

    # Normaliza tabelas indentadas antes de converter
    text_md = normalize_markdown_tables(text_md)
    # Converter Markdown em HTML incluindo extensões para tabelas, código e quebras de linha
    html = markdown(text_md, extensions=[
        'tables',            # suporte a tabelas |---|
        'fenced_code',       # blocos de código cercados ```
        'codehilite',        # destaque (se configurado)
        'nl2br'              # preserva quebras simples de linha
    ])
    soup = BeautifulSoup(html, "html.parser")
    story = []

    # Título
    story.append(Paragraph(title, styles['CustomTitle']))
    story.append(Spacer(1, 12))

    # Estilos adicionais para blocos de código e citações
    styles.add(ParagraphStyle(name='CustomCode', fontSize=9, leading=11, fontName='Helvetica', backColor=colors.HexColor('#F5F5F5'), leftIndent=6, rightIndent=6, spaceBefore=6, spaceAfter=8, borderColor=colors.HexColor('#DDDDDD'), borderWidth=0.5, borderPadding=4))
    styles.add(ParagraphStyle(name='CustomQuote', fontSize=10, leading=14, leftIndent=12, textColor=colors.HexColor('#555555'), italic=True, spaceBefore=6, spaceAfter=8))
    styles.add(ParagraphStyle(name='TableCell', fontSize=9, leading=12))

    def process_table(table_tag):
        # Extrai cabeçalho (th) e linhas (td)
        rows = []
        header = []
        thead = table_tag.find('thead')
        if thead:
            for th in thead.find_all('th'):
                header.append(Paragraph(th.get_text(strip=True), styles['TableCell']))
        else:
            # Se não há thead, tenta a primeira linha como header se tiver th
            first_tr = table_tag.find('tr')
            if first_tr and first_tr.find_all('th'):
                for th in first_tr.find_all('th'):
                    header.append(Paragraph(th.get_text(strip=True), styles['TableCell']))
        if header:
            rows.append(header)
        # Corpo
        for tr in table_tag.find_all('tr'):
            # pular linha de header já adicionada
            if tr.find_all('th') and header:
                continue
            cols = [Paragraph(td.decode_contents() or td.get_text(strip=True), styles['TableCell']) for td in tr.find_all('td')]
            if cols:
                rows.append(cols)
        if not rows:
            return
        # Larguras: tenta proporções amigáveis quando há 3 colunas (Tema/Rilevanza/Fonti)
        col_count = max(len(r) for r in rows)
        available = width - 80  # 40 + 40 de margens
        if col_count == 3:
            col_widths = [available * 0.62, available * 0.19, available * 0.19]
        elif col_count == 4:
            col_widths = [available * 0.50, available * 0.17, available * 0.17, available * 0.16]
        else:
            col_width = available / col_count
            col_widths = [col_width] * col_count
        t = Table(rows, colWidths=col_widths, repeatRows=1)
        style_cmds = [
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CCCCCC')),
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#ED6008')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('ALIGN', (0,0), (-1,0), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('FONTSIZE', (0,0), (-1,0), 10),
            ('FONTSIZE', (0,1), (-1,-1), 9),
            ('LEFTPADDING', (0,0), (-1,-1), 4),
            ('RIGHTPADDING', (0,0), (-1,-1), 4),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            # Alinhamento por coluna nas linhas do corpo: primeira coluna à esquerda, demais centralizadas
            ('ALIGN', (0,1), (0,-1), 'LEFT'),
            ('ALIGN', (1,1), (-1,-1), 'CENTER'),
        ]
        t.setStyle(TableStyle(style_cmds))
        story.append(t)
        story.append(Spacer(1, 12))

    # Processa elementos na ordem mantendo formatação
    for elem in soup.children:
        if getattr(elem, 'name', None) is None:
            continue  # texto cru ignorado (já será incluído nos parágrafos próximos)
        name = elem.name.lower()
        if name == 'h1':
            story.append(Paragraph(elem.get_text(), styles['CustomHeading1']))
            story.append(Spacer(1, 12))
        elif name == 'h2':
            story.append(Paragraph(elem.get_text(), styles['CustomHeading2']))
            story.append(Spacer(1, 12))
        elif name == 'h3':
            story.append(Paragraph(elem.get_text(), styles['CustomHeading3']))
            story.append(Spacer(1, 12))
        elif name == 'h4':
            story.append(Paragraph(elem.get_text(), styles['CustomHeading4']))
            story.append(Spacer(1, 8))
        elif name == 'h5':
            story.append(Paragraph(elem.get_text(), styles['CustomHeading5']))
            story.append(Spacer(1, 8))
        elif name == 'p':
            # Mantém HTML inline (strong, em, etc.)
            story.append(Paragraph(elem.decode_contents(), styles['CustomBodyText']))
            story.append(Spacer(1, 8))
        elif name == 'ul':
            for li in elem.find_all('li'):
                story.append(Paragraph(f"• {li.decode_contents()}", styles['CustomBodyText']))
            story.append(Spacer(1, 6))
        elif name == 'ol':
            for i, li in enumerate(elem.find_all('li'), 1):
                story.append(Paragraph(f"{i}. {li.decode_contents()}", styles['CustomBodyText']))
            story.append(Spacer(1, 6))
        elif name == 'table':
            process_table(elem)
        elif name == 'blockquote':
            story.append(Paragraph(elem.get_text(), styles['CustomQuote']))
        elif name == 'pre':
            code_text = elem.get_text()  # já inclui quebras
            story.append(Preformatted(code_text, styles['CustomCode']))
            story.append(Spacer(1, 6))
        elif name == 'br':
            story.append(Spacer(1, 6))
        # Links isolados podem ser ignorados; se quiser representar, adicionar estilo
        elif name == 'hr':
            story.append(Spacer(1, 12))
        # Imagens embutidas (ex: <img src="...")
        elif name == 'img':
            src = elem.get('src')
            if src:
                try:
                    resp = requests.get(src, timeout=5)
                    if resp.status_code == 200:
                        img_buf = BytesIO(resp.content)
                        story.append(Image(img_buf, width=200, preserveAspectRatio=True, mask='auto'))
                        story.append(Spacer(1, 8))
                except Exception:
                    pass
        # Outros elementos ignorados silenciosamente

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
