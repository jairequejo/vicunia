from pathlib import Path
import json
import subprocess
from PIL import Image, ImageDraw, ImageFont
import io

source = Path('/mnt/c/Users/Jair/Downloads')
files = sorted(source.glob('WhatsApp Video 2026-11-12 at 3.53*.mp4'))
thumbs = []
for f in files:
    data = json.loads(subprocess.check_output(['/home/jair/.local/bin/ffprobe','-v','error','-show_entries','format=duration:stream=width,height','-of','json',str(f)]))
    duration = float(data['format']['duration'])
    stream = next(s for s in data['streams'] if 'width' in s)
    print(f.name, round(duration,2), stream['width'], stream['height'])
    shot = subprocess.check_output(['/home/jair/.local/bin/ffmpeg','-v','error','-ss',str(duration/2),'-i',str(f),'-frames:v','1','-f','image2pipe','-vcodec','mjpeg','-'])
    im = Image.open(io.BytesIO(shot)).convert('RGB')
    im.thumbnail((270,400))
    tile = Image.new('RGB',(300,450),'#f6f1e7')
    tile.paste(im,((300-im.width)//2,10))
    d=ImageDraw.Draw(tile)
    d.text((10,410),f.name.split('at ')[-1].replace('.mp4',''),fill='#183e36')
    thumbs.append(tile)
sheet=Image.new('RGB',(300*5,450*2),'white')
for n,im in enumerate(thumbs): sheet.paste(im,((n%5)*300,(n//5)*450))
sheet.save(Path(__file__).with_name('contacto-clips.jpg'),quality=88)
