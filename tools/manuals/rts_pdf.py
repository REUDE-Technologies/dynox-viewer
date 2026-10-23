"""REUDE house style for DynoX PDFs (manuals and forms), built on reportlab."""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.platypus import (Paragraph, Table, TableStyle, Spacer, Image, KeepTogether,
                                ListFlowable, ListItem, Flowable)

ORANGE = colors.HexColor('#E8630A')
BLUE = colors.HexColor('#1F5C99')
INK = colors.HexColor('#18222D')
STEEL = colors.HexColor('#5B6875')
RULE = colors.HexColor('#D3D9DF')
TINT = colors.HexColor('#F3F5F7')
ORANGE_TINT = colors.HexColor('#FFF1E6')
BLUE_TINT = colors.HexColor('#EAF1F8')
RED = colors.HexColor('#B3261E')
RED_TINT = colors.HexColor('#FCEDEC')

LOCKUP = '/home/claude/build/site/assets/reude-lockup.png'
LOGO = '/home/claude/build/site/assets/reude-logo.png'
PAGE_W, PAGE_H = A4
MARGIN_X = 18 * mm
ADDRESS = ('REUDE Technologies Private Limited · No.1, Nehru Street, Vasantham Nagar, Avadi, '
           'Chennai 600071, Tamil Nadu, India · business@reude.tech · rotrix.reude.tech')

BASE = 'Helvetica'
BOLD = 'Helvetica-Bold'

S = {
    'body': ParagraphStyle('body', fontName=BASE, fontSize=10, leading=14.2, textColor=INK, spaceAfter=5),
    'small': ParagraphStyle('small', fontName=BASE, fontSize=8.6, leading=11.5, textColor=STEEL),
    'cell': ParagraphStyle('cell', fontName=BASE, fontSize=8.8, leading=11.6, textColor=INK),
    'cellb': ParagraphStyle('cellb', fontName=BOLD, fontSize=8.8, leading=11.6, textColor=INK),
    'head': ParagraphStyle('head', fontName=BOLD, fontSize=8.8, leading=11.6, textColor=colors.white),
    'h1': ParagraphStyle('h1', fontName=BOLD, fontSize=18, leading=22, textColor=ORANGE, spaceBefore=4, spaceAfter=8),
    'h2': ParagraphStyle('h2', fontName=BOLD, fontSize=12.5, leading=16, textColor=BLUE, spaceBefore=10, spaceAfter=5),
    'h3': ParagraphStyle('h3', fontName=BOLD, fontSize=10.5, leading=14, textColor=INK, spaceBefore=6, spaceAfter=3),
    'caption': ParagraphStyle('caption', fontName=BASE, fontSize=8.6, leading=11, textColor=STEEL, alignment=TA_CENTER, spaceBefore=3, spaceAfter=8),
    'toc': ParagraphStyle('toc', fontName=BASE, fontSize=10.5, leading=17, textColor=INK),
    'cover_title': ParagraphStyle('ct', fontName=BOLD, fontSize=30, leading=34, textColor=INK),
    'cover_sub': ParagraphStyle('cs', fontName=BASE, fontSize=14, leading=19, textColor=STEEL),
}


def P(text, style='body'):
    return Paragraph(text, S[style] if isinstance(style, str) else style)


def bullets(items, style='body'):
    return ListFlowable([ListItem(P(t, style), leftIndent=12) for t in items],
                        bulletType='bullet', start='•', leftIndent=12, bulletFontSize=9,
                        bulletColor=ORANGE, spaceAfter=4)


def numbered(items, style='body'):
    return ListFlowable([ListItem(P(t, style), leftIndent=16) for t in items],
                        bulletType='1', leftIndent=16, bulletFontName=BOLD, bulletFontSize=9.5,
                        bulletColor=BLUE, spaceAfter=4)


def table(rows, widths, header=True, zebra=True, align_top=True, bold_first_col=False):
    data = []
    for r, row in enumerate(rows):
        cells = []
        for c, v in enumerate(row):
            if isinstance(v, Flowable):
                cells.append(v)
            elif r == 0 and header:
                cells.append(P(str(v), 'head'))
            else:
                cells.append(P(str(v), 'cellb' if (bold_first_col and c == 0) else 'cell'))
        data.append(cells)
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    st = [
        ('GRID', (0, 0), (-1, -1), 0.4, RULE),
        ('VALIGN', (0, 0), (-1, -1), 'TOP' if align_top else 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 5), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
    ]
    if header:
        st += [('BACKGROUND', (0, 0), (-1, 0), ORANGE), ('LINEBELOW', (0, 0), (-1, 0), 0.8, ORANGE)]
    if zebra:
        for r in range(1 if header else 0, len(rows)):
            if (r % 2 == 0):
                st.append(('BACKGROUND', (0, r), (-1, r), TINT))
    t.setStyle(TableStyle(st))
    return t


def callout(kind, text):
    """Note / Caution / Warning box with a coloured left bar."""
    spec = {
        'note': (BLUE, BLUE_TINT, 'NOTE'),
        'tip': (BLUE, BLUE_TINT, 'TIP'),
        'caution': (ORANGE, ORANGE_TINT, 'CAUTION'),
        'warning': (RED, RED_TINT, 'WARNING'),
    }[kind]
    bar, tint, label = spec
    p = Paragraph(f'<font name="{BOLD}" color="{bar.hexval()}">{label}</font>&nbsp;&nbsp;{text}', S['body'])
    t = Table([[p]], colWidths=[PAGE_W - 2 * MARGIN_X])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), tint),
        ('LINEBEFORE', (0, 0), (0, -1), 3, bar),
        ('LEFTPADDING', (0, 0), (-1, -1), 9), ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    t.spaceAfter = 6
    return t


def figure(path, width_mm, caption=None, max_h_mm=None):
    from PIL import Image as PImage
    im = PImage.open(path)
    w = width_mm * mm
    h = w * im.height / im.width
    if max_h_mm and h > max_h_mm * mm:
        h = max_h_mm * mm
        w = h * im.width / im.height
    img = Image(path, width=w, height=h)
    rows = [[img]] + ([[P(caption, 'caption')]] if caption else [])
    t = Table(rows, colWidths=[PAGE_W - 2 * MARGIN_X])
    t.setStyle(TableStyle([('ALIGN', (0, 0), (-1, -1), 'CENTER'), ('LEFTPADDING', (0, 0), (-1, -1), 0),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('TOPPADDING', (0, 0), (-1, -1), 2),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 0)]))
    t.spaceAfter = 4
    return t


class Swatch(Flowable):
    def __init__(self, color, w=14, h=5):
        super().__init__()
        self.c, self.width, self.height = colors.HexColor(color), w, h + 4

    def draw(self):
        self.canv.setFillColor(self.c)
        self.canv.setStrokeColor(self.c)
        self.canv.roundRect(0, 2, self.width, self.height - 4, 1.5, fill=1, stroke=0)


def numbered_canvas(doc_title, doc_id, rev, date):
    """Canvas class that draws the house header/footer with 'Page X of Y'."""

    class NumberedCanvas(rl_canvas.Canvas):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self._saved = []

        def showPage(self):
            self._saved.append(dict(self.__dict__))
            self._startPage()

        def save(self):
            total = len(self._saved)
            for state in self._saved:
                self.__dict__.update(state)
                if self._pageNumber > 1:
                    self._chrome(total)
                super().showPage()
            super().save()

        def _chrome(self, total):
            c = self
            top = PAGE_H - 12 * mm
            c.drawImage(LOCKUP, MARGIN_X, top - 8.2 * mm, height=8.2 * mm, width=8.2 * mm * 760 / 200, mask='auto')
            c.setFont(BOLD, 9.5); c.setFillColor(INK)
            c.drawRightString(PAGE_W - MARGIN_X, top - 3.2 * mm, doc_title)
            c.setFont(BASE, 8); c.setFillColor(STEEL)
            c.drawRightString(PAGE_W - MARGIN_X, top - 7.6 * mm, f'Document ID {doc_id} · Rev {rev} · {date}')
            c.setStrokeColor(ORANGE); c.setLineWidth(1.4)
            c.line(MARGIN_X, top - 10.5 * mm, PAGE_W - MARGIN_X, top - 10.5 * mm)
            # footer
            c.setStrokeColor(RULE); c.setLineWidth(0.6)
            c.line(MARGIN_X, 16 * mm, PAGE_W - MARGIN_X, 16 * mm)
            c.setFont(BASE, 6.8); c.setFillColor(STEEL)
            c.drawString(MARGIN_X, 11.5 * mm, ADDRESS)
            c.setFont(BOLD, 7); c.setFillColor(ORANGE)
            c.drawString(MARGIN_X, 7.8 * mm, 'RESTRICTED · For customer use only. Do not copy or distribute without written permission from REUDE Technologies.')
            c.setFont(BOLD, 8.5); c.setFillColor(INK)
            c.drawRightString(PAGE_W - MARGIN_X, 7.8 * mm, f'Page {self._pageNumber} of {total}')

    return NumberedCanvas
