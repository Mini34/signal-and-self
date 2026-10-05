"""Deploy the portfolio redirect only after the presentation site is publicly ready."""
from pathlib import Path
from urllib.request import urlopen, Request
import json
config=json.loads((Path(__file__).resolve().parent.parent/'reflection-site.json').read_text())
if config['mode']=='dedicated':
    target=config['url']
    with urlopen(target,timeout=30) as response:page=response.read().decode('utf8')
    for marker in ('id="reflection-form"','id="helper-notice-panel"',f'rel="canonical" href="{target}"'):
        if marker not in page:raise SystemExit('Publish and verify the dedicated activity before hiding the portfolio version.')
    for file in ('digital-citizen-worksheet.pdf','digital-citizen-presentation.pptx','digital-citizen-presentation.pdf','digital-citizen-presenter-guide.pdf'):
        with urlopen(Request(target+'assets/downloads/'+file,method='HEAD'),timeout=30) as response:
            if response.status!=200:raise SystemExit('Dedicated download is unavailable: '+file)
    print('Dedicated site and all presentation downloads verified.')
else:print('Activity is restored to the portfolio.')
