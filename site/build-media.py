"""Build full-dimension service display images; originals remain the zoom/share source."""
from pathlib import Path
from urllib.parse import urlparse
import hashlib,json
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];SITE=ROOT/'site';OUT=SITE/'media';OUT.mkdir(exist_ok=True)
images={};quality=92
for path,dimensions in json.loads((SITE/'guide-copy.json').read_text())['serviceImageSizes'].items():
 source=ROOT/urlparse(path).path.lstrip('/');digest=hashlib.sha256(source.read_bytes()).hexdigest();target=OUT/('service-'+digest[:12]+'.webp')
 if not target.exists():
  with Image.open(source) as image:
   assert list(image.size)==dimensions,(path,image.size,dimensions)
   options={'quality':quality,'method':6}
   if image.info.get('icc_profile'):options['icc_profile']=image.info['icc_profile']
   image.save(target,'WEBP',**options)
 images[path]={'src':'/site/media/'+target.name,'width':dimensions[0],'height':dimensions[1],'sourceBytes':source.stat().st_size,'displayBytes':target.stat().st_size,'sourceSha256':digest}
(SITE/'media-manifest.json').write_text(json.dumps({'quality':quality,'images':images},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'images':len(images),'originalBytes':sum(i['sourceBytes'] for i in images.values()),'displayBytes':sum(i['displayBytes'] for i in images.values())}),flush=True)
