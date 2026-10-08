"""Reproducible edition-specific extraction. Never fills source numbering gaps."""
import argparse, hashlib, json, re, unicodedata
from pathlib import Path
import fitz

LEGACY = {
 0x1f80:'க்ஷ',0x1f81:'கு',0x1f82:'கூ',0x1f86:'சு',0x1f87:'சூ',
 0x1f8a:'டி',0x1f8b:'டீ',0x1f8c:'டு',0x1f8d:'டூ',0x1f8e:'ணு',
 0x1f90:'து',0x1f91:'தூ',0x1f92:'நு',0x1f93:'நூ',0x1f94:'னு',0x1f95:'னூ',
 0x1f96:'பீ',0x1f97:'பு',0x1f98:'பூ',0x1f99:'மு',0x1f9a:'மூ',0x1f9b:'மீ',
 0x1f9c:'யு',0x1f9d:'யூ',0x1f9e:'ரு',0x1f9f:'ரூ',0x1fa0:'று',
 0x1fa2:'லி',0x1fa3:'லீ',0x1fa4:'லு',0x1fa5:'லூ',0x1fa6:'ளு',0x1fa8:'ழு',
 0x1faa:'வீ',0x1fab:'வு',0x1fac:'வூ',0x1fad:'ஸி',0x1fae:'ஸீ',0x1faf:'ஸ்ரீ',
 0x1fb0:'க்',0x1fb1:'ங்',0x1fb2:'ச்',0x1fb3:'ஜ்',0x1fb4:'ஞ்',0x1fb5:'ட்',
 0x1fb6:'ண்',0x1fb7:'த்',0x1fb8:'ந்',0x1fb9:'ன்',0x1fba:'ப்',0x1fbb:'ம்',
 0x1fbc:'ய்',0x1fbd:'ர்',0x1fbe:'ற்',0x1fbf:'ல்',0x1fc0:'ள்',0x1fc1:'ழ்',
 0x1fc2:'வ்',0x1fc3:'ஷ்',0x1fc4:'ஸ்',0x1fc5:'ஹ்',0x1fc6:'க்ஷ்'
}
TOPICS = {
 'money': ('பணம் / செல்வம்',['பண','செல்வ','சேமி','தனத்']),
 'friendship': ('நட்பு',['நண்ப','நட்பு']),
 'education': ('கல்வி',['கல்வி','கற்க','அறிவ','ஞான','நூல்']),
 'leadership': ('தலைமை',['அரச','மன்ன','ஆட்சி','தலைவ']),
 'relationships': ('உறவுகள்',['உறவி','மனைவி','கணவ','குடும்ப','தாய்','தந்தை']),
 'discipline': ('ஒழுக்கம்',['ஒழுக்க','கடமை','முயற்சி','உழை','பண்ப']),
 'resilience': ('மன உறுதி',['கஷ்ட','துன்ப','துயர','கவலை','அச்ச','ஆபத்']),
 'ethics': ('அறம்',['அறம்','நல்ல','நன்மை','தீய','நேர்மை','நீதி'])
}
def normalize(text):
    text = text.translate(LEGACY).replace('\u200b','')
    # The font extracts visual pre-base vowel signs before their consonants.
    text = re.sub(r'([ெேை])(க்ஷ|[க-ஹ])',r'\2\1',text)
    text = text.replace('ாி', 'ரி')
    for broken, corrected in [('இல் லை','இல்லை'), ('தன் னை','தன்னை'), ('உன் னை','உன்னை'), ('நன் மை','நன்மை'), ('தன் மை','தன்மை'), ('பண் ப','பண்ப'), ('தொன் மை','தொன்மை')]:
        text = text.replace(broken, corrected)
    return unicodedata.normalize('NFC',text)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('pdf');parser.add_argument('--output',default='data')
    args=parser.parse_args(); dest=Path(args.output);dest.mkdir(parents=True,exist_ok=True)
    pdf=fitz.open(args.pdf);chapter=0;records=[];current=None
    def flush():
        nonlocal current
        if not current:return
        raw='\n'.join(current.pop('lines'));normalized=normalize(raw)
        split=re.search(r'\|\s*\|',normalized)
        boundary_method='double_bar'
        if not split and current['id'] in ('15.2','15.10'):
            bars=list(re.finditer(r'\|',normalized))
            if len(bars)>=2:split=bars[1];boundary_method='edition_single_bar'
        if split:
            original=normalized[:split.end()].strip();meaning=normalized[split.end():].strip()
        else:original='';meaning=normalized.strip()
        meaning=re.sub(r'\s+',' ',meaning)
        current.update({'text':{'transliteration_ta':original,'meaning_ta':meaning},
          'raw_text':raw,'topics':[k for k,(_,words) in TOPICS.items() if any(w in meaning for w in words)],
          'quality':{'status':'unreviewed','method':'font_mapping','split_detected':bool(split),'boundary_method':boundary_method,
                     'topics_method':'keyword_heuristic','issues':(['verse_boundary_not_detected'] if not split else [])}})
        records.append(current);current=None
    # Chapter text occupies PDF pages 8 through 107; notes and appendix are separate.
    for index in range(7,107):
        for line in pdf[index].get_text().splitlines():
            line=line.strip()
            if not line or line.startswith('https://telegram.me/'):continue
            if re.fullmatch(r'\d+',line):
                flush();chapter=int(line);continue
            match=re.fullmatch(r'\((\d+)\)',line)
            if match:
                flush();verse=int(match[1]);current={'id':f'{chapter}.{verse}','chapter':chapter,'verse':verse,
                    'source':{'edition_id':'sandhya-tamil-upload','pages':[index+1]},'lines':[]}
            elif current:
                current['lines'].append(line)
                if index+1 not in current['source']['pages']:current['source']['pages'].append(index+1)
    flush()
    chapters=[]
    for n in range(1,18):
        group=[r for r in records if r['chapter']==n];nums=[r['verse'] for r in group]
        chapters.append({'id':n,'names':{'ta':f'அத்தியாயம் {n}','en':f'Chapter {n}'},'count':len(group),
                         'verse_numbers':nums,'missing_within_observed_range':[x for x in range(1,max(nums)+1) if x not in nums]})
    source={'id':'sandhya-tamil-upload','title':'சாணக்கிய நீதி: அரசியலும் அந்தரங்கமும்',
      'translator':'Sandhya Natarajan / சந்தியா நடராஜன்','publisher':'சந்தியா பதிப்பகம்',
      'sha256':hashlib.sha256(Path(args.pdf).read_bytes()).hexdigest(),'pdf_pages':len(pdf),
      'rights':'User-supplied edition; redistribution permission not established.',
      'scope':'All numbered main-text entries on PDF pages 8–107. Introduction, pronunciation notes, and appendix retained separately.',
      'language_note':'Original Sanskrit is transliterated in Tamil script; this is not Sanskrit Devanagari.',
      'review_status':'Automated extraction. Font mapping and boundaries require editorial review.'}
    notes=[{'page':i+1,'text':normalize(pdf[i].get_text().replace('https://telegram.me/aedahamlibrary','').strip())} for i in list(range(2,7))+list(range(107,len(pdf)))]
    report={'chapters':len(chapters),'records':len(records),'reviewed_records':0,
      'numbering_gaps':{str(c['id']):c['missing_within_observed_range'] for c in chapters if c['missing_within_observed_range']},
      'split_failures':[r['id'] for r in records if not r['quality']['split_detected']],
      'legacy_characters_remaining':sum(0x1f00<=ord(c)<=0x1fff for r in records for c in str(r['text']))}
    for name,value in [('verses',records),('chapters',chapters),('sources',[source]),('supplementary',notes),('quality-report',report),
                       ('topics',[{'id':k,'names':{'ta':v[0],'en':k.title()},'classification':'keyword_heuristic'} for k,v in TOPICS.items()])]:
        (dest/f'{name}.json').write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
