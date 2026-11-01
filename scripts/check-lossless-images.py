"""Compare optimized PNGs with the approved pre-compression images, including browser rendering."""
from io import BytesIO
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8023'
APPROVED_REVISION = '148ff44a5a9dfd3528b488da4110a1e299a9e62f'
images = sorted((ROOT/'imgs').glob('*-clarity-v1.png')) + [ROOT/'imgs/resort-map-v6-garden.png']
assert len(images) == 14
originals = {}
original_bytes = optimized_bytes = 0
for optimized in images:
    path = str(optimized.relative_to(ROOT))
    original = subprocess.check_output(['git', 'show', APPROVED_REVISION + ':' + path], cwd=ROOT)
    originals[optimized.name] = original
    with Image.open(BytesIO(original)) as a, Image.open(optimized) as b:
        assert a.size == b.size, path
        assert a.convert('RGBA').tobytes() == b.convert('RGBA').tobytes(), path
        assert a.info == b.info, path
    assert optimized.stat().st_size <= len(original), path
    original_bytes += len(original)
    optimized_bytes += optimized.stat().st_size

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page()
    # Serve both copies from one origin, without application scripts or external fonts.
    page.route(BASE + '/__lossless_check__', lambda r: r.fulfill(body='<!doctype html><title>Image check</title>', content_type='text/html'))
    page.route(BASE + '/__image_original__/*.png', lambda r: r.fulfill(body=originals[r.request.url.rsplit('/', 1)[1]], content_type='image/png'))
    page.goto(BASE + '/__lossless_check__')
    for optimized in images:
        paths = ['/__image_original__/' + optimized.name, '/' + str(optimized.relative_to(ROOT))]
        result = page.evaluate('''async paths => {
          const images = await Promise.all(paths.map(async src => {
            const img = new Image(); img.src = src; await img.decode(); return img;
          }));
          if(images[0].naturalWidth !== images[1].naturalWidth || images[0].naturalHeight !== images[1].naturalHeight) return false;
          const buffers = images.map(img => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
            return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          });
          return buffers[0].every((value, index) => value === buffers[1][index]);
        }''', paths)
        assert result, ('Browser pixel mismatch', optimized.name)
        print(optimized.name, 'PASS exact dimensions, RGBA, metadata and browser pixels', flush=True)
    browser.close()
print(f'PASS {len(images)} images: {original_bytes:,} -> {optimized_bytes:,} bytes ({100*(1-optimized_bytes/original_bytes):.1f}% smaller)')
