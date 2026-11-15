"""Reel Vicunia v2: mascota real → figura pintada, con movimiento y transiciones."""
from pathlib import Path
import subprocess
import base64
import cairosvg

BASE = Path(__file__).resolve().parent
SRC = Path('/mnt/c/Users/Jair/Downloads')
FF = '/home/jair/.local/bin/ffmpeg'
PROBE = '/home/jair/.local/bin/ffprobe'
FPS = 30
SIZE = '1080:1920'

# Las dos primeras parejas relacionan la foto de la mascota con su figura.
# Se omite la foto de la niña con el cachorro: no aporta al anuncio.
SCENES = [
    dict(kind='photo', file='WhatsApp Image 2026-11-12 at 7.27.40 PM.jpeg', dur=2.50, tag='FOTO REAL', title=['ASÍ ES TU', 'MEJOR AMIGO'], spot='top'),
    dict(kind='video', file='WhatsApp Video 2026-11-12 at 3.53.58 PM.mp4', dur=2.50, tag='VICUNIA · FIGURA PINTADA', title=['AHORA MÍRALO', 'EN MINIATURA'], spot='bottom'),
    dict(kind='photo', file='WhatsApp Image 2026-11-12 at 7.28.26 PM.jpeg', dur=2.45, tag='FOTO REAL', title=['CADA DETALLE', 'LO HACE ÚNICO'], spot='top'),
    dict(kind='photo', file='WhatsApp Image 2026-11-12 at 7.26.47 PM (1).jpeg', dur=2.45, tag='VICUNIA · FIGURA PINTADA', title=['HECHO PARA', 'PARECERSE A ÉL'], spot='bottom'),
    dict(kind='video', file='WhatsApp Video 2026-11-12 at 3.53.41 PM.mp4', dur=2.20, tag='TAMBIÉN PARA GATITOS', title=['SU VERSIÓN', 'MÁS TIERNA'], spot='bottom'),
    dict(kind='photo', file='WhatsApp Image 2026-11-12 at 7.26.43 PM.jpeg', dur=2.45, tag='FIGURAS 3D PINTADAS A MANO', title=['DESDE S/ 28'], sub='Precio final según los detalles de pintura', spot='bottom'),
    dict(kind='photo', file='WhatsApp Image 2026-11-12 at 3.53.46 PM.jpeg', dur=2.40, tag='VICUNIA · CAJAMARCA', title=['TU MASCOTA', 'EN VERSIÓN FUNKO'], sub='Envíanos su foto y cotizamos por mensaje', spot='top'),
    dict(kind='brand', file='cierre-vicunia.png', dur=1.80, tag='', title=[], spot='top'),
]
TRANSITIONS = ['wipeleft','fade','wipeleft','smoothleft','circleopen','fade','fade']
OVERLAP = .38
OUT = BASE / 'reel-funkos-mascotas-vicunia-v4.mp4'
# El cuadrado multicolor es foto de perfil. Para video usamos la silueta vectorial.
LOGO_SVG = (BASE.parent.parent / 'vicunia.svg').read_text(encoding='utf-8')
LOGO_PNG = cairosvg.svg2png(bytestring=LOGO_SVG.replace('fill="#000000"','fill="#F6F1E7"').encode(), output_width=320, output_height=350)
LOGO_DATA = base64.b64encode(LOGO_PNG).decode('ascii')

def run(cmd): subprocess.run(cmd,check=True)

def create_brand_card():
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920">
    <rect width="1080" height="1920" fill="#183E36"/>
    <circle cx="540" cy="624" r="240" fill="#24554A"/>
    <image x="405" y="456" width="270" height="296" href="data:image/png;base64,{LOGO_DATA}"/>
    <text x="540" y="974" text-anchor="middle" fill="#F6F1E7" font-family="Georgia, serif" font-size="112" font-weight="700" letter-spacing="10">VICUNIA</text>
    <rect x="244" y="1032" width="592" height="4" fill="#D8AC68"/>
    <text x="540" y="1150" text-anchor="middle" fill="#F6F1E7" font-family="DejaVu Sans, Arial" font-size="44">Tu mascota en miniatura</text>
    <text x="540" y="1260" text-anchor="middle" fill="#D8AC68" font-family="DejaVu Sans, Arial" font-size="54" font-weight="700">Desde S/ 28</text>
    <text x="540" y="1395" text-anchor="middle" fill="#F6F1E7" font-family="DejaVu Sans, Arial" font-size="37">Envíanos su foto por mensaje</text>
    <text x="540" y="1710" text-anchor="middle" fill="#D8AC68" font-family="DejaVu Sans, Arial" font-size="29" letter-spacing="5">CAJAMARCA</text>
    </svg>'''
    dest=BASE/'cierre-vicunia.png'
    cairosvg.svg2png(bytestring=svg.encode(),write_to=str(dest))
    return dest

def create_overlay(i, s):
    if s['kind']=='brand':
        dest=BASE/f'v2-overlay-{i:02}.png'
        cairosvg.svg2png(bytestring=b'<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"/>',write_to=str(dest))
        return dest
    is_price = i == 5
    is_end = i == 6
    spot = s['spot']
    top = 106 if spot == 'top' else (1320 if s.get('sub') else 1455)
    bar = f'''<defs><linearGradient id="shade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#071b17" stop-opacity=".82"/><stop offset="1" stop-color="#071b17" stop-opacity="0"/></linearGradient></defs>
       <rect x="0" y="0" width="1080" height="650" fill="url(#shade)"/>''' if spot == 'top' else '''<defs><linearGradient id="shade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#071b17" stop-opacity="0"/><stop offset="1" stop-color="#071b17" stop-opacity=".86"/></linearGradient></defs><rect x="0" y="1180" width="1080" height="740" fill="url(#shade)"/>'''
    tag_size = 35
    title_size = 80 if is_end else (107 if is_price else 79)
    title_y = top + 180
    title_lines = ''.join(f'<text x="70" y="{title_y+idx*100}" fill="#F6F1E7" font-family="DejaVu Sans, Arial" font-size="{title_size}" font-weight="700" letter-spacing="-2">{line}</text>' for idx,line in enumerate(s['title']))
    sub = f'<text x="70" y="{title_y+len(s["title"])*102+25}" fill="#F6F1E7" font-family="DejaVu Sans, Arial" font-size="35">{s["sub"]}</text>' if s.get('sub') else ''
    logo = f'''<rect x="746" y="87" width="280" height="94" rx="20" fill="#183E36" fill-opacity=".86"/>
    <image x="762" y="99" width="63" height="69" href="data:image/png;base64,{LOGO_DATA}"/>
    <text x="836" y="151" fill="#F6F1E7" font-family="Georgia, serif" font-size="37" font-weight="700" letter-spacing="3">VICUNIA</text>'''
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920">
    {bar}
    {logo}
    <rect x="70" y="{top}" width="66" height="7" rx="3" fill="#D8AC68"/>
    <text x="70" y="{top+75}" fill="#D8AC68" font-family="DejaVu Sans, Arial" font-size="{tag_size}" font-weight="700" letter-spacing="3">{s['tag']}</text>
    {title_lines}{sub}
    <text x="1006" y="1845" text-anchor="end" fill="#F6F1E7" font-family="Georgia, serif" font-size="34" font-weight="700" letter-spacing="4">VICUNIA</text>
    </svg>'''
    out = BASE / f'v2-overlay-{i:02}.png'
    cairosvg.svg2png(bytestring=svg.encode(), write_to=str(out))
    return out

segments=[]
for i,s in enumerate(SCENES):
    source=create_brand_card() if s['kind']=='brand' else SRC/s['file']
    assert source.is_file(), source
    layer=create_overlay(i,s)
    target=BASE/f'v2-escena-{i:02}.mp4'
    photo=s['kind'] in ('photo','brand')
    input_args=['-loop','1','-framerate',str(FPS)] if photo else []
    # Acercamiento lento en fotos; videos mantienen su movimiento original.
    motion=(f'scale=1160:2062:force_original_aspect_ratio=increase,crop=1160:2062,'
            f'zoompan=z=\'min(zoom+0.0007,1.055)\':d=1:x=\'(iw-iw/zoom)/2\':y=\'(ih-ih/zoom)/2\':s=1080x1920:fps={FPS}') if photo else f'scale={SIZE}:force_original_aspect_ratio=increase,crop={SIZE}'
    if s['kind']=='brand': motion=f'scale={SIZE}'
    grade='eq=brightness=0.055:contrast=1.11:saturation=1.03' if i==3 else 'eq=contrast=1.03:saturation=1.05'
    graph=f'[0:v]{motion},setsar=1,{grade},fps={FPS},setpts=PTS-STARTPTS[base];[base][1:v]overlay=0:0:format=auto,format=yuv420p[out]'
    run([FF,'-hide_banner','-loglevel','error','-y',*input_args,'-i',str(source),'-loop','1','-i',str(layer),
         '-filter_complex',graph,'-map','[out]','-an','-t',str(s['dur']),'-r',str(FPS),'-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p',str(target)])
    segments.append(target)

inputs=[]
for p in segments: inputs+=['-i',str(p)]
parts=[]
length=SCENES[0]['dur']
label='0:v'
for i in range(1,len(segments)):
    offset=length-OVERLAP
    next_label=f'x{i}'
    parts.append(f'[{label}][{i}:v]xfade=transition={TRANSITIONS[i-1]}:duration={OVERLAP}:offset={offset:.3f},format=yuv420p[{next_label}]')
    length+=SCENES[i]['dur']-OVERLAP
    label=next_label
silent=BASE/'v2-sin-audio.mp4'
run([FF,'-hide_banner','-loglevel','error','-y',*inputs,'-filter_complex',';'.join(parts),'-map',f'[{label}]',
     '-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p','-r',str(FPS),str(silent)])

music=SRC/'YTDown.com_YouTube_Media_O8yBgydBruI_MIX-NAVIDEÑO-FOLKSION-COREOGRAFIA-FOLKSION_010_128k.mp3'
run([FF,'-hide_banner','-loglevel','error','-y','-i',str(silent),'-i',str(music),
     '-filter_complex',f'[1:a]volume=0.31,afade=t=in:st=0:d=0.45,afade=t=out:st={length-1.1:.3f}:d=1.1[a]',
     '-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','160k','-ar','48000','-t',f'{length:.3f}','-movflags','+faststart',str(OUT)])
print(OUT)
run([PROBE,'-v','error','-show_entries','format=duration:stream=codec_name,width,height,sample_rate','-of','default=noprint_wrappers=1',str(OUT)])
