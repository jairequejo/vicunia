"""Crea un reel de venta con material real enviado por el usuario."""
from pathlib import Path
import subprocess
import cairosvg

ROOT = Path(__file__).resolve().parent
DOWNLOADS = Path('/mnt/c/Users/Jair/Downloads')
FFMPEG = '/home/jair/.local/bin/ffmpeg'
FFPROBE = '/home/jair/.local/bin/ffprobe'
W, H, FPS = 1080, 1920, 30

scenes = [
    ('photo', 'WhatsApp Image 2026-11-12 at 3.53.46 PM.jpeg', 2.2, ['TU MASCOTA EN', 'VERSIÓN FUNKO'], 'top'),
    ('video', 'WhatsApp Video 2026-11-12 at 3.53.41 PM.mp4', 2.6, ['FIGURAS 3D', 'PINTADAS A MANO'], 'bottom'),
    ('video', 'WhatsApp Video 2026-11-12 at 3.53.53 PM.mp4', 3.0, ['HECHAS A PEDIDO'], 'top'),
    ('photo', 'WhatsApp Image 2026-11-12 at 7.26.47 PM (1).jpeg', 2.2, ['DESDE S/ 28'], 'bottom'),
    ('photo', 'WhatsApp Image 2026-11-12 at 7.26.43 PM.jpeg', 2.2, ['PRECIO SEGÚN', 'DETALLES DE PINTURA'], 'bottom'),
    ('photo', 'WhatsApp Image 2026-11-12 at 3.53.46 PM (1).jpeg', 1.8, ['ENVÍANOS SU FOTO'], 'top'),
    ('photo', 'WhatsApp Image 2026-11-12 at 3.53.55 PM (1).jpeg', 2.4, ['VICUNIA · CAJAMARCA', 'PIDE EL TUYO POR MENSAJE'], 'bottom'),
]

def run(args):
    subprocess.run(args, check=True)

def overlay_png(index, lines, position):
    top = 170 if position == 'top' else 1425
    row_height = 88
    box_height = 118 + (len(lines)-1)*row_height
    font_size = 64 if max(map(len, lines)) <= 22 else 56
    text = ''.join(f'<text x="540" y="{top+80+i*row_height}" text-anchor="middle" fill="#F6F1E7" font-family="DejaVu Sans, Arial, sans-serif" font-size="{font_size}" font-weight="700">{line}</text>' for i,line in enumerate(lines))
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}">
      <rect x="42" y="{top}" width="996" height="{box_height}" rx="34" fill="#183E36" fill-opacity="0.91"/>
      <rect x="42" y="{top}" width="12" height="{box_height}" rx="6" fill="#D8AC68"/>
      {text}
    </svg>'''
    dest = ROOT / f'overlay-{index:02d}.png'
    cairosvg.svg2png(bytestring=svg.encode(),write_to=str(dest))
    return dest

parts = []
for i,(kind,name,duration,lines,position) in enumerate(scenes):
    source = DOWNLOADS / name
    if not source.is_file(): raise FileNotFoundError(source)
    overlay = overlay_png(i,lines,position)
    dest = ROOT / f'segmento-{i:02d}.mp4'
    input_opts = ['-loop','1','-framerate',str(FPS)] if kind == 'photo' else []
    filtergraph = (
        f'[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,'
        f'crop={W}:{H},setsar=1,eq=contrast=1.025:saturation=1.04[base];'
        f'[base][1:v]overlay=0:0:format=auto,format=yuv420p[out]'
    )
    run([FFMPEG,'-hide_banner','-loglevel','error','-y',*input_opts,'-i',str(source),'-loop','1','-i',str(overlay),
         '-filter_complex',filtergraph,'-map','[out]','-an','-t',str(duration),'-r',str(FPS),
         '-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p',str(dest)])
    parts.append(dest)

concat = ROOT / 'lista-segmentos.txt'
concat.write_text(''.join(f"file '{p.name}'\n" for p in parts))
silent = ROOT / 'reel-sin-audio.mp4'
run([FFMPEG,'-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(concat),'-c','copy',str(silent)])

music = DOWNLOADS / 'YTDown.com_YouTube_Media_O8yBgydBruI_MIX-NAVIDEÑO-FOLKSION-COREOGRAFIA-FOLKSION_010_128k.mp3'
total = sum(s[2] for s in scenes)
output = ROOT / 'reel-funkos-mascotas-vicunia.mp4'
run([FFMPEG,'-hide_banner','-loglevel','error','-y','-i',str(silent),'-ss','0','-i',str(music),
     '-filter_complex',f'[1:a]volume=0.28,afade=t=in:st=0:d=0.45,afade=t=out:st={total-1.0}:d=1[a]',
     '-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','160k','-t',str(total),'-movflags','+faststart',str(output)])
print(output)
run([FFPROBE,'-v','error','-show_entries','format=duration:stream=codec_name,width,height','-of','default=noprint_wrappers=1',str(output)])
