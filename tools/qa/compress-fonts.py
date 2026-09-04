"""Prepare Latin webfont subsets; source provenance and licenses in assets/fonts."""
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).parent/'font-tools'))
from fontTools.ttLib import TTFont
from fontTools import subset
root=Path(__file__).resolve().parents[2]
rules=[]
sources=sorted((root/'tools/qa/evidence/fonts').glob('*.ttf'))
if not sources:
    raise SystemExit('Download the documented source TTFs into tools/qa/evidence/fonts first.')
for file in sources:
    font=TTFont(file)
    ranges='0000-024F,0300-036F,1E00-1EFF,2000-206F,20A0-20CF,2100-214F,2190-21FF,2200-22FF,25A0-25FF,FEFF,FFFD'
    options=subset.Options()
    subsetter=subset.Subsetter(options=options)
    subsetter.populate(unicodes=subset.parse_unicodes(ranges))
    subsetter.subset(font)
    font.flavor='woff2'; out=root/'assets/fonts'/file.with_suffix('.woff2').name; font.save(out)
    family,weight=file.stem.rsplit('-',1)
    label={'dm-mono':'DM Mono','manrope':'Manrope','newsreader':'Newsreader'}[family]
    rules.append(f"@font-face {{ font-family: '{label}'; font-style: normal; font-weight: {weight}; font-display: swap; src: url('../fonts/{out.name}') format('woff2'); unicode-range: {','.join('U+'+r for r in ranges.split(','))}; }}")
    print(file.name,file.stat().st_size,'->',out.stat().st_size)
(root/'assets/styles/fonts.css').write_text('\n'.join(rules)+'\n',encoding='utf-8')
