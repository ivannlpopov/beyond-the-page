/* Beyond the Page v4 — final visual layer. No external dependencies. */
(() => {
  const previousRender=render;
  const node=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=String(txt);return e};
  const txt=(s,n=1500)=>String(s??'').slice(0,n);
  const labels={en:{sample:'Illustrative data — not VANTER performance',source:'Knowledge sources',visual:'Illustrative concept',steps:'Process'},nl:{sample:'Illustratieve gegevens — geen VANTER-prestaties',source:'Kennisbronnen',visual:'Conceptuele illustratie',steps:'Proces'},ru:{sample:'Иллюстративные данные — не результаты VANTER',source:'Источники',visual:'Концептуальная иллюстрация',steps:'Процесс'}};
  const theme=(prompt)=>/handover|asset|equipment|maintenance|передач|оборудован|эксплуатац|overdracht|onderhoud/i.test(prompt)?'asset':/procurement|software|security|закуп|интеграц|inkoop|integratie/i.test(prompt)?'data':/construction|contractor|строй|подряд|bouw|aannemer/i.test(prompt)?'site':'plant';
  function illustration(kind){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 960 430');svg.setAttribute('role','img');svg.setAttribute('aria-label','Industrial engineering conceptual illustration');
    const variants={
      plant:'<rect x="65" y="245" width="830" height="120" rx="6" fill="#cad6c5"/><rect x="125" y="110" width="100" height="215" rx="7" fill="#91aa9c"/><rect x="290" y="64" width="84" height="261" rx="8" fill="#a7beb2"/><rect x="460" y="140" width="98" height="185" rx="7" fill="#829f8f"/><rect x="635" y="88" width="88" height="237" rx="7" fill="#a7beb2"/><path d="M75 250H895M110 290H850M210 190H660M345 115H770" stroke="#315e51" stroke-width="12" fill="none"/><path d="M170 110V65M332 64V35M678 88V40" stroke="#315e51" stroke-width="12"/><g fill="#d9e7b5"><rect x="132" y="130" width="85" height="9"/><rect x="299" y="98" width="65" height="9"/><rect x="642" y="140" width="72" height="9"/></g>',
      site:'<path d="M85 342H880" stroke="#315e51" stroke-width="13"/><rect x="125" y="170" width="210" height="170" fill="#a7beb2"/><rect x="380" y="120" width="225" height="220" fill="#8ba89a"/><rect x="655" y="210" width="150" height="130" fill="#bed0bf"/><path d="M690 62V210M535 62H850M790 62L715 140" stroke="#315e51" stroke-width="11" fill="none"/><path d="M530 60L610 95H450Z" fill="#b1c789"/><g fill="#e9f0df"><rect x="150" y="195" width="42" height="42"/><rect x="220" y="195" width="42" height="42"/><rect x="410" y="160" width="55" height="50"/><rect x="495" y="160" width="55" height="50"/></g>',
      asset:'<g stroke="#315e51" stroke-width="12" fill="none"><path d="M150 300H810M240 140H720M240 140V300M720 140V300"/><path d="M420 140V80H540V140"/></g><rect x="300" y="175" width="360" height="115" rx="25" fill="#94b0a2"/><circle cx="350" cy="230" r="36" fill="#e2edcc"/><circle cx="610" cy="230" r="36" fill="#e2edcc"/><path d="M475 175V290M520 175V290" stroke="#315e51" stroke-width="8"/><g fill="#bed38c"><circle cx="240" cy="140" r="16"/><circle cx="720" cy="140" r="16"/><circle cx="480" cy="80" r="16"/></g>',
      data:'<g fill="#dce7d6" stroke="#315e51" stroke-width="7"><rect x="80" y="115" width="225" height="210" rx="14"/><rect x="365" y="65" width="230" height="270" rx="14"/><rect x="655" y="115" width="225" height="210" rx="14"/></g><g fill="#86a96f"><rect x="110" y="150" width="155" height="12" rx="6"/><rect x="110" y="185" width="105" height="12" rx="6"/><rect x="395" y="105" width="165" height="12" rx="6"/><rect x="395" y="145" width="130" height="12" rx="6"/><rect x="685" y="150" width="155" height="12" rx="6"/><rect x="685" y="185" width="105" height="12" rx="6"/></g><path d="M305 220H365M595 220H655" stroke="#315e51" stroke-width="12"/><path d="M348 205L365 220L348 235M638 205L655 220L638 235" fill="none" stroke="#315e51" stroke-width="9"/>'
    };
    svg.innerHTML='<defs><linearGradient id="v4grad" x2="1" y2="1"><stop stop-color="#f0f5e9"/><stop offset="1" stop-color="#cddfc8"/></linearGradient></defs><rect width="960" height="430" rx="18" fill="url(#v4grad)"/><circle cx="810" cy="95" r="135" fill="#e7efda" opacity=".8"/>'+variants[kind];
    return svg;
  }
  function svgChart(b){
    const labelsArr=(Array.isArray(b.labels)?b.labels:[]).slice(0,10).map(x=>txt(x,22)),values=(Array.isArray(b.values)?b.values:[]).slice(0,10).map(Number);
    if(!labelsArr.length||labelsArr.length!==values.length||!values.every(v=>Number.isFinite(v)&&v>=0))return null;
    const wrap=node('div','v4-chart'),svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 760 310');svg.setAttribute('role','img');svg.setAttribute('aria-label',txt(b.heading||'Chart'));
    const NS='http://www.w3.org/2000/svg',add=(tag,attrs,text)=>{const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;svg.append(e);return e};
    const max=Math.max(1,...values)*1.15,axisY=252,top=30,left=65,right=725,h=axisY-top;
    for(let j=0;j<=4;j++){const y=axisY-j*h/4;add('line',{x1:left,y1:y,x2:right,y2:y,stroke:'#d8e2d6','stroke-width':1});add('text',{x:55,y:y+5,'text-anchor':'end',fill:'#607368','font-size':13},String(Math.round(max*j/4)))}
    const line=b.chart_type==='line'||b.chartType==='line'||(/time|trend|month|динамик|месяц|ontwikkeling|verloop/i.test((b.heading||'')+' '+(b.intro||''))&&!/bar|столб|staaf/i.test(b.chart_type||''));
    const points=[];
    values.forEach((v,i)=>{const x=line?left+((right-left)*(i+.5)/values.length):left+(right-left)*(i+.5)/values.length,y=axisY-v/max*h;points.push([x,y]);if(!line){const width=Math.min(62,(right-left)/values.length*.64);add('rect',{x:x-width/2,y,width,height:axisY-y,rx:4,fill:'#81a765'})}add('text',{x,y:axisY+24,'text-anchor':'middle',fill:'#42584c','font-size':12},labelsArr[i]);add('text',{x,y:y-10,'text-anchor':'middle',fill:'#234a37','font-size':13,'font-weight':700},String(v))});
    if(line){add('polyline',{points:points.map(p=>p.join(',')).join(' '),fill:'none',stroke:'#356d46','stroke-width':4,'stroke-linejoin':'round','stroke-linecap':'round'});points.forEach(([x,y])=>add('circle',{cx:x,cy:y,r:5,fill:'#f9fbf6',stroke:'#356d46','stroke-width':3}))}
    wrap.append(svg);return wrap;
  }
  function enhancedBlock(b){
    const section=node('section','v4-block v4-'+b.type);
    if(b.heading)section.append(node('h3','v3-heading',txt(b.heading,150)));
    if(b.intro)section.append(node('p','v3-intro',txt(b.intro)));
    if(b.type==='text'){(b.paragraphs||[]).slice(0,5).forEach(p=>section.append(node('p','',txt(p))))}
    if(b.type==='table'){const wrap=node('div','v3-table-wrap'),table=node('table','v3-table'),head=node('thead'),tr=node('tr'),cols=(b.columns||[]).slice(0,6);cols.forEach(c=>tr.append(node('th','',txt(c,90))));head.append(tr);table.append(head);const body=node('tbody');(b.rows||[]).slice(0,12).forEach(row=>{const r=node('tr');cols.forEach((_,i)=>r.append(node('td','',txt(Array.isArray(row)?row[i]:'',350))));body.append(r)});table.append(body);wrap.append(table);section.append(wrap)}
    if(b.type==='chart'){const graph=svgChart(b);if(graph)section.append(graph);section.append(node('p','v3-caveat',b.data_status==='illustrative'?labels[lang].sample:txt(b.note||labels[lang].sample,250)))}
    if(b.type==='flow'){const flow=node('div','v4-flow-list');(b.steps||[]).slice(0,7).forEach((s,i)=>{const item=node('div','v4-flow-step');item.append(node('span','v3-flow-number',String(i+1).padStart(2,'0')),node('strong','',txt(s.title||s,110)),node('p','',txt(s.description||'',360)));flow.append(item)});section.append(flow)}
    if(b.type==='cards'){const grid=node('div','v3-cards');(b.items||[]).slice(0,6).forEach(c=>{const card=node('article','v3-mini-card');card.append(node('h4','',txt(c.title,110)),node('p','',txt(c.body,600)));grid.append(card)});section.append(grid)}
    const ids=(Array.isArray(b.source_ids)?b.source_ids:[]).filter(s=>typeof s==='string').slice(0,8);if(ids.length)section.append(node('div','sources',labels[lang].source+': '+ids.join(' · ')));return section;
  }
  render=function(d,scenario,isAI){
    if(!isAI||!Array.isArray(d.blocks)||!d.blocks.length){previousRender(d,scenario,isAI);return}
    const result=$('result');result.replaceChildren();
    const top=node('div','result-top');top.append(node('span','',T[lang].result+' / '+T[lang].ai),node('span','','VANTER / '+lang.toUpperCase()));result.append(top);
    const content=node('div','result-content'),hero=node('div','v4-hero'),copy=node('div','v4-hero-copy');
    copy.append(node('span','section-kicker','PERSONALIZED EXPERIENCE'),node('h2','',txt(d.title,180)),node('p','summary',txt(d.summary,1800)));hero.append(copy);
    const art=node('figure','v4-hero-art');art.append(illustration(theme(lastPrompt)));art.append(node('figcaption','',labels[lang].visual));hero.append(art);content.append(hero);
    const blocks=node('div','v4-blocks');d.blocks.filter(b=>b&&['text','table','chart','flow','cards'].includes(b.type)).slice(0,9).forEach(b=>blocks.append(enhancedBlock(b)));content.append(blocks);
    if(d.next){const next=node('div','next-step');next.append(node('b','',T[lang].next),document.createTextNode(txt(d.next,600)));content.append(next)}
    if(d.question){const q=node('div','v3-question');q.append(node('b','',({en:'TO MAKE THIS MORE RELEVANT',nl:'OM DIT RELEVANTER TE MAKEN',ru:'ЧТО МОЖНО УТОЧНИТЬ'})[lang]),node('p','',txt(d.question,500)));content.append(q)}
    content.append(node('p','result-note',T[lang].limits));result.append(content);result.dataset.ai='1';result.classList.remove('hidden');result.scrollIntoView({behavior:'smooth',block:'start'});
  };
})();