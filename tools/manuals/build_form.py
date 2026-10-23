"""Fillable DynoX quote request / customer requirement specification (SRS) form, A4, REUDE house style."""
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib import colors
import rts_pdf as R

OUT = '/home/claude/build/site/assets/DynoX-SRS-form.pdf'
W, H = R.PAGE_W, R.PAGE_H
X0, X1 = R.MARGIN_X, W - R.MARGIN_X
c = canvas.Canvas(OUT, pagesize=R.A4)
c.setTitle('DynoX quote request - customer requirement specification')
c.setAuthor('REUDE Technologies Private Limited')
form = c.acroForm
state = {'y': 0, 'page': 1}


def chrome():
    c.drawImage(R.LOCKUP, X0, H - 22 * mm, height=11 * mm, width=11 * mm * 760 / 200, mask='auto')
    c.setFont(R.BOLD, 15); c.setFillColor(R.INK)
    c.drawRightString(X1, H - 15 * mm, 'DynoX quote request')
    c.setFont(R.BASE, 8.5); c.setFillColor(R.STEEL)
    c.drawRightString(X1, H - 20 * mm, 'Customer requirement specification (SRS) · Form DNX-SRS-2026-01 · Rev 1.0')
    c.setStrokeColor(R.ORANGE); c.setLineWidth(1.6); c.line(X0, H - 25 * mm, X1, H - 25 * mm)
    c.setStrokeColor(R.RULE); c.setLineWidth(0.6); c.line(X0, 16 * mm, X1, 16 * mm)
    c.setFont(R.BASE, 7); c.setFillColor(R.STEEL)
    c.drawString(X0, 11.5 * mm, R.ADDRESS)
    c.setFont(R.BOLD, 7.5); c.setFillColor(R.ORANGE)
    c.drawString(X0, 7.5 * mm, 'Send the completed form to cmo_ira@reude.tech and business@reude.tech')
    c.setFont(R.BOLD, 8.5); c.setFillColor(R.INK)
    c.drawRightString(X1, 7.5 * mm, f'Page {state["page"]} of 2')
    state['y'] = H - 33 * mm


def section(title):
    y = state['y']
    c.setFillColor(R.ORANGE); c.rect(X0, y - 6 * mm, X1 - X0, 6.5 * mm, fill=1, stroke=0)
    c.setFillColor(colors.white); c.setFont(R.BOLD, 10)
    c.drawString(X0 + 3 * mm, y - 4.3 * mm, title)
    state['y'] = y - 9 * mm


def fields(specs, h=7.5 * mm):
    """specs: list of (label, name, width fraction)."""
    y = state['y']
    x = X0
    total = X1 - X0
    for label, name, frac in specs:
        w = total * frac - (2 * mm if frac < 1 else 0)
        c.setFont(R.BASE, 7.6); c.setFillColor(R.STEEL)
        c.drawString(x, y - 3 * mm, label)
        form.textfield(name=name, tooltip=label, x=x, y=y - 4 * mm - h, width=w, height=h,
                       borderColor=colors.HexColor('#C4CCD4'), fillColor=colors.HexColor('#FBFCFD'),
                       textColor=R.INK, fontSize=9, borderWidth=0.6, forceBorder=True)
        x += total * frac
    state['y'] = y - h - 7 * mm


def checks(label, name, options, per_row=4):
    y = state['y']
    c.setFont(R.BASE, 7.6); c.setFillColor(R.STEEL)
    c.drawString(X0, y - 3 * mm, label)
    y -= 5 * mm
    colw = (X1 - X0) / per_row
    for k, opt in enumerate(options):
        cx = X0 + (k % per_row) * colw
        cy = y - (k // per_row) * 7 * mm - 5 * mm
        form.checkbox(name=f'{name}_{opt.lower().replace(" ", "_")}', tooltip=opt, x=cx, y=cy, size=4.6 * mm,
                      borderColor=colors.HexColor('#8A96A3'), fillColor=colors.white, buttonStyle='check',
                      borderWidth=0.7, forceBorder=True)
        c.setFont(R.BASE, 9); c.setFillColor(R.INK)
        c.drawString(cx + 6.5 * mm, cy + 1.2 * mm, opt)
    rows = (len(options) + per_row - 1) // per_row
    state['y'] = y - rows * 7 * mm - 4 * mm


def new_page():
    c.showPage(); state['page'] += 1; chrome()


chrome()
c.setFont(R.BASE, 9.5); c.setFillColor(R.INK)
c.drawString(X0, state['y'], 'Fill in this form on screen or print it. Fields marked * are needed to prepare a quotation.')
state['y'] -= 7 * mm
section('1. Contact details')
fields([('Name *', 'name', 0.5), ('Organisation *', 'organisation', 0.5)])
fields([('Designation', 'designation', 0.5), ('Email *', 'email', 0.5)])
fields([('Phone *', 'phone', 0.34), ('City', 'city', 0.33), ('Country', 'country', 0.33)])
section('2. Product')
checks('Model of interest *', 'model', ['RTS Compact 5 (5 kgf)', 'RTS Pro 20 (20 kgf)', 'RTS Ultra 50 (50 kgf)', 'Custom'], per_row=4)
fields([('Quantity', 'quantity', 0.25), ('Application (R&D, production testing, education, certification, other)', 'application', 0.75)])
section('3. Test requirements')
fields([('Maximum thrust (kgf)', 'thrust', 0.34), ('Maximum torque (Nm)', 'torque', 0.33), ('Maximum speed (RPM)', 'rpm', 0.33)])
fields([('Battery voltage (S)', 'voltage', 0.34), ('Maximum current (A)', 'current', 0.33), ('Propeller diameter (inch)', 'prop', 0.33)])
fields([('Motor model or size', 'motor', 0.6), ('Test environment (indoor / outdoor)', 'environment', 0.4)])
section('4. Measurement and software')
checks('Parameters to measure', 'measure', ['Thrust', 'Torque', 'RPM', 'Voltage', 'Current', 'Vibration', 'Temperature', 'Efficiency'], per_row=4)
fields([('Sampling rate (Hz)', 'sampling', 0.34), ('Data interface (USB / Ethernet / Wireless)', 'interface', 0.33), ('Software (ROTRIX / ROTRIDASH)', 'software', 0.33)])

new_page()
section('5. Commercial')
fields([('Installation and training (required / not required)', 'installation', 0.5), ('Required by (date)', 'date', 0.5)])
fields([('Delivery location', 'location', 0.6), ('Budget range (optional)', 'budget', 0.4)])
section('6. Additional requirements')
y = state['y']
form.textfield(name='notes', tooltip='Additional requirements', x=X0, y=y - 52 * mm, width=X1 - X0, height=50 * mm,
               borderColor=colors.HexColor('#C4CCD4'), fillColor=colors.HexColor('#FBFCFD'), textColor=R.INK,
               fontSize=9, borderWidth=0.6, forceBorder=True, fieldFlags='multiline')
state['y'] = y - 58 * mm
section('7. Confirmation')
fields([('Name', 'sign_name', 0.4), ('Signature', 'signature', 0.35), ('Date', 'sign_date', 0.25)])
y = state['y'] - 2 * mm
c.setFont(R.BOLD, 10); c.setFillColor(R.BLUE)
c.drawString(X0, y, 'How to send this form')
c.setFont(R.BASE, 9.5); c.setFillColor(R.INK)
for k, line in enumerate([
    'Email the completed form to cmo_ira@reude.tech and business@reude.tech,',
    'or use "Get a quote" in the DynoX 3D viewer to send your requirements online.',
    'The REUDE team will review your requirements and reply with a configuration and quotation.',
]):
    c.drawString(X0, y - (6 + k * 5.2) * mm, line)
c.save()
print('wrote', OUT)
