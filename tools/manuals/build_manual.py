"""Build the DynoX user manuals (one PDF per design) in REUDE house style."""
import json, os, sys
from PIL import Image as PImage, ImageDraw, ImageChops
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak,
                                Table, TableStyle, KeepTogether, CondPageBreak, Image)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.styles import ParagraphStyle

import rts_pdf as R
from rts_pdf import P, bullets, numbered, table, callout, figure, S, mm as _mm
from content import MODELS, COMMON_SAFETY, TORQUE_TABLE, TROUBLE, MAINT, ROUTE_COLORS, DATE, REV

FIG = '/home/claude/manual/fig'
OUT = '/home/claude/build/site/manuals'
CAT = json.load(open('/home/claude/manual/catalog.json'))
PROJ = json.load(open('/home/claude/manual/routeproj.json'))
TEXT_W = R.PAGE_W - 2 * R.MARGIN_X
os.makedirs(OUT, exist_ok=True)
os.makedirs(FIG + '/jpg', exist_ok=True)


def prep(name, margin=30):
    """Trim white space around a render and save as JPEG for a compact PDF."""
    src = f'{FIG}/{name}.png'
    dst = f'{FIG}/jpg/{name}.jpg'
    im = PImage.open(src).convert('RGB')
    bg = PImage.new('RGB', im.size, (255, 255, 255))
    diff = ImageChops.difference(im, bg).convert('L').point(lambda v: 255 if v > 12 else 0)
    box = diff.getbbox()
    if box:
        box = (max(0, box[0] - margin), max(0, box[1] - margin), min(im.width, box[2] + margin), min(im.height, box[3] + margin))
        im = im.crop(box)
    im.save(dst, 'JPEG', quality=86, optimize=True)
    return dst


def draw_routes(model):
    src = f'{FIG}/{model}_routes.png'
    im = PImage.open(src).convert('RGB')
    d = ImageDraw.Draw(im)
    for r in PROJ[model]:
        col = ROUTE_COLORS[r['key']][0]
        pts = [tuple(p) for p in r['pts']]
        d.line(pts, fill=(255, 255, 255), width=12, joint='curve')
        d.line(pts, fill=col, width=7, joint='curve')
        for (x, y) in (pts[0], pts[-1]):
            d.ellipse((x - 9, y - 9, x + 9, y + 9), fill=col, outline=(255, 255, 255), width=3)
    out = f'{FIG}/{model}_routes_drawn.png'
    im.save(out)
    return prep(f'{model}_routes_drawn')


class Doc(BaseDocTemplate):
    def afterFlowable(self, f):
        if isinstance(f, Paragraph) and getattr(f, '_toc', None) is not None:
            level = f._toc
            text = f.getPlainText()
            key = 'h%x' % (abs(hash((level, text))) & 0xffffffff)
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(text, key, level=level, closed=level > 0)
            self.notify('TOCEntry', (level, text, self.page, key))


def H1(text):
    p = Paragraph(text, S['h1']); p._toc = 0; return p


def H2(text, toc=True):
    p = Paragraph(text, S['h2'])
    if toc: p._toc = 1
    return p


def cover(m, c):
    hero = prep(f'{m}_hero', margin=10)
    story = []
    story.append(Spacer(1, 6 * mm))
    story.append(Image(R.LOCKUP, width=62 * mm, height=62 * mm * 200 / 760, hAlign='LEFT'))
    story.append(Spacer(1, 14 * mm))
    story.append(P('<font color="#E8630A">DynoX</font> thrust stand', S['cover_sub']))
    story.append(Spacer(1, 3 * mm))
    story.append(P(f'{CAT[m]["title"]}', S['cover_title']))
    story.append(Spacer(1, 2 * mm))
    story.append(P(f'User manual · {c["rating"]} thrust and torque test stand', S['cover_sub']))
    story.append(Spacer(1, 6 * mm))
    story.append(figure(hero, 150, max_h_mm=118))
    story.append(Spacer(1, 4 * mm))
    info = Table([
        [P('<b>Document ID</b>', 'cell'), P(c['docid'], 'cell'), P('<b>Revision</b>', 'cell'), P(f'{REV}', 'cell')],
        [P('<b>Issue date</b>', 'cell'), P(DATE, 'cell'), P('<b>Covers</b>', 'cell'), P('Assembly, electronics, wiring, safety, calibration, maintenance', 'cell')],
    ], colWidths=[28 * mm, 48 * mm, 22 * mm, TEXT_W - 98 * mm])
    info.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.4, R.RULE), ('BACKGROUND', (0, 0), (0, -1), R.TINT),
                              ('BACKGROUND', (2, 0), (2, -1), R.TINT), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                              ('LINEABOVE', (0, 0), (-1, 0), 2, R.ORANGE)]))
    story.append(info)
    story.append(Spacer(1, 5 * mm))
    story.append(P('Designed and manufactured by REUDE Technologies Private Limited, Chennai, India. '
                   'Read the safety instructions in Section 3 before assembling or operating this equipment.', 'small'))
    story.append(PageBreak())
    return story


def contents():
    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle('t0', fontName=R.BOLD, fontSize=10.5, leading=15, textColor=R.INK, leftIndent=0, spaceBefore=4),
        ParagraphStyle('t1', fontName=R.BASE, fontSize=9.5, leading=13, textColor=R.STEEL, leftIndent=14),
    ]
    toc.dotsMinLevel = 0
    return [Paragraph('Contents', S['h1']), toc, PageBreak()]


def parts_table(m):
    rows = [['No.', 'Component', 'Code', 'Size', 'Material', 'Qty']]
    hw = [['No.', 'Fixing', 'Code', 'Size', 'Material', 'Qty']]
    for it in CAT[m]['items']:
        r = [str(it['n']), f"<b>{it['name']}</b>", it.get('code', ''), it.get('size', ''), it.get('material', ''), str(it['qty'])]
        (hw if it.get('kind') == 'hw' else rows).append(r)
    w = [10 * mm, 38 * mm, 34 * mm, 40 * mm, 34 * mm, TEXT_W - 156 * mm]
    out = [table(rows, w)]
    if len(hw) > 1:
        out += [Spacer(1, 6), H2('Brackets and fixings', toc=False), table(hw, w)]
    return out


def importance_table(m):
    rows = [['No.', 'Component', 'Importance', 'Why it matters']]
    for it in CAT[m]['items']:
        if it.get('kind') == 'hw':
            continue
        lvl = it.get('level', 'Standard')
        col = {'Critical': '#E8630A', 'Important': '#1F5C99'}.get(lvl, '#5B6875')
        rows.append([str(it['n']), it['name'], f'<font color="{col}"><b>{lvl}</b></font>', it.get('why', '')])
    return table(rows, [10 * mm, 38 * mm, 22 * mm, TEXT_W - 70 * mm])


def build(m):
    c = MODELS[m]
    title = f'DynoX {CAT[m]["title"]} User Manual'
    path = f'{OUT}/DynoX-{CAT[m]["title"].replace(" ", "-")}-User-Manual.pdf'
    doc = Doc(path, pagesize=R.A4, leftMargin=R.MARGIN_X, rightMargin=R.MARGIN_X, topMargin=27 * mm, bottomMargin=22 * mm,
              title=title, author='REUDE Technologies Private Limited', subject=f'{c["rating"]} thrust stand user manual',
              creator='REUDE Technologies')
    doc._hseq = 0
    frame = Frame(R.MARGIN_X, 22 * mm, TEXT_W, R.PAGE_H - 49 * mm, id='main', leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    cover_frame = Frame(R.MARGIN_X, 18 * mm, TEXT_W, R.PAGE_H - 32 * mm, id='cover', leftPadding=0, rightPadding=0)
    doc.addPageTemplates([PageTemplate('cover', [cover_frame]), PageTemplate('main', [frame])])
    from reportlab.platypus.doctemplate import NextPageTemplate

    st = []
    st += [NextPageTemplate('main')] + cover(m, c)
    st += contents()

    # 1 About this manual
    st.append(H1('1. About this manual'))
    st.append(P(f'This manual explains how to assemble, wire, calibrate, operate and maintain the {CAT[m]["title"]}. '
                'It is written for technicians, engineers and lab staff with basic mechanical and electrical skills. '
                'Keep it with the stand and pass it on with the equipment.'))
    st.append(H2('How to read the safety notes'))
    st.append(callout('warning', 'A hazard that can cause serious injury. Follow the instruction exactly.'))
    st.append(callout('caution', 'A risk of damage to the stand, the sensors or the measurement.'))
    st.append(callout('note', 'Useful information that makes the job easier or the result better.'))
    st.append(H2('Interactive 3D model'))
    st.append(P('Every component in this manual is numbered the same way as in the DynoX 3D viewer. '
                'Open the viewer to rotate the stand, see the exploded sub-assemblies, and lay every component out on the table.'))

    # 2 Product overview
    st.append(PageBreak())
    st.append(H1('2. Product overview'))
    st.append(P(c['intro']))
    st.append(H2('Specifications'))
    st.append(table(c['specs'], [52 * mm, TEXT_W - 52 * mm], bold_first_col=True))
    st.append(CondPageBreak(170 * mm))
    st.append(H2('Main components'))
    st.append(figure(prep(f'{m}_overview'), 170, f'Figure 2.1  {CAT[m]["title"]} assembled, with the main components numbered.', max_h_mm=150))
    st.append(CondPageBreak(120 * mm))
    st.append(H2('Exploded view'))
    st.append(figure(prep(f'{m}_exploded'), 170, 'Figure 2.2  Exploded side view. Each sub-assembly moves as one block, in the order it is assembled.', max_h_mm=165))

    # 3 Safety
    st.append(PageBreak())
    st.append(H1('3. Safety instructions'))
    st.append(callout('warning', 'A spinning propeller can cause severe injury. Never approach the stand while a battery is connected, and keep everyone out of the propeller plane during a test.'))
    st.append(H2('Assembly team'))
    st.append(P(c['people']))
    for head, items in COMMON_SAFETY.items():
        st.append(H2(head))
        st.append(bullets(items))
    st.append(callout('caution', f'The rated thrust of this stand is {c["max_display"]}. Loads above the rating can permanently damage the load cells and void the calibration.'))

    # 4 Package contents
    st.append(PageBreak())
    st.append(H1('4. Package contents'))
    st.append(P('Check every item against this list before you start. If anything is missing or damaged, contact REUDE support before assembly. '
                'Do not start with incomplete or faulty parts.'))
    st += parts_table(m)
    st.append(CondPageBreak(110 * mm))
    st.append(H2('Component importance'))
    st.append(P('<b>Critical</b> parts are in the load path or the measurement chain. <b>Important</b> parts set the stiffness and alignment of the frame. <b>Standard</b> parts are for convenience and protection.'))
    st.append(importance_table(m))
    st.append(CondPageBreak(110 * mm))
    st.append(H2('All components laid out'))
    st.append(figure(prep(f'{m}_table'), 170, 'Figure 4.1  The components laid out on the table, as shipped.', max_h_mm=130))

    # 5 Tools
    st.append(PageBreak())
    st.append(H1('5. Tools and tightening torques'))
    st.append(H2('Tools you will need'))
    st.append(bullets(c['tools']))
    st.append(H2('Recommended tightening torques'))
    rows = list(TORQUE_TABLE)
    st.append(table(rows, [36 * mm, 66 * mm, TEXT_W - 102 * mm], bold_first_col=True))
    st.append(Spacer(1, 6))
    st.append(callout('note', 'Tighten in two passes: first snug every bolt in a joint, then bring each to the final torque. This keeps the frame square.'))
    st.append(callout('caution', 'Always load the T-slot nuts into a profile before a bracket, end cap or another profile closes that slot. A missing nut means taking the joint apart again.'))

    # 6 Assembly
    st.append(PageBreak())
    st.append(H1('6. Assembly, step by step'))
    st.append(P('Work through the steps in order. In each figure the parts added in that step are highlighted in orange; parts fitted in earlier steps are shown in their final position.'))
    for k, (fig, head, steps, warn) in enumerate(c['steps'], 1):
        block = [H2(f'Step {k}. {head}')]
        block.append(figure(prep(f'{m}_{fig}'), 130, f'Figure 6.{k}  {head}.', max_h_mm=68))
        block.append(numbered(steps))
        if warn:
            block.append(callout('caution', warn))
        st.append(CondPageBreak(128 * mm))
        st += block
    st.append(CondPageBreak(130 * mm))
    st.append(H2('Sensing head, exploded'))
    st.append(figure(prep(f'{m}_head'), 170, f'Figure 6.{len(c["steps"]) + 1}  {c["head_caption"]}', max_h_mm=120))

    # 7 DAQ and electronics
    st.append(PageBreak())
    st.append(H1('7. DAQ and electronics assembly'))
    st.append(P(c['daq']['intro']))
    st.append(figure(prep(f'{m}_daq'), 140, f'Figure 7.1  {c["daq"]["figure_caption"]}', max_h_mm=95))
    st.append(H2('Mounting and connecting'))
    st.append(numbered(c['daq']['steps']))
    st.append(H2('What the DAQ unit measures'))
    st.append(bullets([
        'Thrust and torque from the load cells, through precision bridge amplifiers.',
        'Motor speed from the optical RPM sensor.',
        'Battery voltage and current in the power line to the ESC.',
        'Vibration and temperature from the sensor boards.',
        'All channels are time-stamped together and streamed to ROTRIX for live display, logging and reports.',
    ]))
    st.append(callout('caution', 'Connect and disconnect sensor cables only with the DAQ unit powered off and the battery disconnected.'))

    # 8 Wiring
    st.append(PageBreak())
    st.append(H1('8. Wire routing to the sensors'))
    st.append(P('Good cable routing matters as much as good mechanics. A cable that is pulled tight across the sensing head carries part of the load, '
                'and the load cells then measure the cable instead of the motor. Follow the routes and rules below.'))
    routes_img = draw_routes(m)
    st.append(figure(routes_img, 150, 'Figure 8.1  Recommended cable routes. Signal cables and power leads run on separate sides of the frame.', max_h_mm=110))
    legend = [['', 'Cable']]
    for r in PROJ[m]:
        col, label = ROUTE_COLORS[r['key']]
        legend.append([R.Swatch(col), label])
    lt = table(legend, [20 * mm, TEXT_W - 20 * mm], zebra=False, align_top=False)
    st.append(lt)
    st.append(H2('Routing table'))
    st.append(table(c['wiring'], [34 * mm, 34 * mm, TEXT_W - 106 * mm, 38 * mm], bold_first_col=True))
    st.append(H2('Routing rules'))
    st.append(numbered([
        '<b>Leave a service loop.</b> Where a cable leaves the sensing head, form a loose loop about 50 mm across, so the cable carries no load when the head deflects.',
        '<b>Tie to the fixed frame only.</b> Fix cables to the frame with ties about every 150 mm. Never tie a cable to the motor plate, the load cells or the free end of the sensing head.',
        '<b>Keep signal and power apart.</b> Run sensor cables and power leads on opposite sides of the frame. Where they must cross, cross at a right angle.',
        '<b>Stay out of the propeller disc.</b> Route every cable behind the motor plate and away from the plane of the propeller.',
        '<b>Relieve strain at the DAQ.</b> Leave a little slack at each connector and label both ends of every cable.',
        '<b>Screened load-cell cables.</b> Connect the screen at the DAQ end only.',
        '<b>Remote operation.</b> If the operator sits away from the stand, extend only the USB data link and the emergency-stop loop. Never extend the analogue sensor cables.',
        '<b>Current sensor direction.</b> Fit the current sensor with its arrow pointing from the battery towards the ESC.',
        '<b>Use the slots.</b> On the fixed frame, lay cables inside the T-slots and press the orange slot covers over them. This keeps cables tidy, protected and clear of the propeller.',
    ]))
    st.append(callout('caution', 'After any change to the wiring, zero the load cells again and check that the zero reading stays steady for one minute before testing.'))

    # 9 Commissioning
    st.append(PageBreak())
    st.append(H1('9. Commissioning and calibration'))
    st.append(H2('Before first power-up'))
    st.append(bullets([
        'All bolts tightened to the recommended torque, and the base anchored.',
        'Motor fitted and centred; propeller not yet fitted.',
        'All cables routed with service loops, and the emergency stop tested.',
    ]))
    st.append(H2('Connect and check the sensors'))
    st.append(numbered([
        'Connect the DAQ unit to the PC over USB and open ROTRIX.',
        'Confirm that every sensor is detected and shows a sensible live value.',
        'Allow 10 minutes for the load cells to warm up, then zero (tare) thrust and torque with the motor fitted and stationary.',
    ]))
    st.append(H2('Check thrust and torque with known loads'))
    st.append(numbered([
        f'Thrust: tie a cord to the motor hub, run it over a low-friction pulley in line with the thrust axis, and hang known weights ({c["calib_load"]}). Compare each reading with the weight.',
        'Torque: fit a light lever arm of known length to the motor plate and hang a known weight from its end. The expected torque is weight × 9.81 × arm length (N·m, with the weight in kg and the length in m).',
        'If any reading is outside the stated accuracy, run the calibration routine in ROTRIX and repeat the check.',
    ]))
    st.append(H2('Check RPM, voltage and current'))
    st.append(bullets([
        'Compare the RPM reading with a hand tachometer at two or three throttle settings.',
        'Compare voltage and current with a multimeter and a clamp meter.',
    ]))
    st.append(H2('First run'))
    st.append(numbered([
        'Fit and balance the propeller, and clear the exclusion zone.',
        'Connect the battery last. Arm the ESC from the operator station.',
        'Run at about 10% throttle for 30 seconds, watching vibration, temperature and noise.',
        'Increase in steps of 10% only while every reading stays stable.',
    ]))

    # 10 Operation
    st.append(H1('10. Operating the stand'))
    st.append(bullets([
        f'Do not exceed {c["max_display"]} of thrust. Set a thrust limit alarm in ROTRIX below the rating.',
        'Run a short warm-up before each test series and zero the load cells with the motor stopped.',
        'Use ROTRIX to run automated throttle steps and ramps, and ROTRIDASH to compare runs and produce PDF performance reports.',
        'Allow the motor and ESC to cool between long runs, and watch the temperature channels.',
        'After testing, disarm the ESC, disconnect the battery, then stop logging and save the data.',
    ]))

    # 11 Maintenance
    st.append(PageBreak())
    st.append(H1('11. Maintenance'))
    st.append(table(MAINT, [42 * mm, TEXT_W - 42 * mm], bold_first_col=True))
    st.append(Spacer(1, 6))
    st.append(callout('note', 'Clean the sensors and the motor plate with a dry cloth after each session. Do not use solvents on the load cells or the circuit boards.'))

    # 12 Troubleshooting
    st.append(H1('12. Troubleshooting'))
    st.append(table(TROUBLE, [46 * mm, 58 * mm, TEXT_W - 104 * mm], bold_first_col=True))

    # 13 Support
    st.append(H1('13. Support and contact'))
    st.append(table([
        ['Contact', 'Details'],
        ['Sales and quotations', 'business@reude.tech · cmo_ira@reude.tech'],
        ['Technical support', 'support.rotrix@reude.tech'],
        ['Phone', '+91 6384667822'],
        ['Web', 'rotrix.reude.tech · www.reude.in'],
        ['Address', 'REUDE Technologies Private Limited, No.1, Nehru Street, Vasantham Nagar, Avadi, Chennai 600071, Tamil Nadu, India'],
    ], [42 * mm, TEXT_W - 42 * mm], bold_first_col=True))
    st.append(Spacer(1, 8))
    st.append(P('When contacting support, quote the document ID on the cover, the stand serial number, and the ROTRIX software version.', 'small'))

    doc.multiBuild(st, canvasmaker=R.numbered_canvas(title, c['docid'], REV, DATE))
    print('wrote', path, os.path.getsize(path))


if __name__ == '__main__':
    for m in (sys.argv[1:] or ['compact-5', 'pro-20', 'ultra-50']):
        build(m)
