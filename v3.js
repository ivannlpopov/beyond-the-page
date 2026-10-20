/* Beyond the Page v3 — structured block renderer. Load after app.js. */
(() => {
  const originalRender = render;
  const safe = escapeHTML;
  const types = new Set(['text','table','chart','flow','cards']);
  const limit = (x,n=2000) => String(x ?? '').slice(0,n);
  const el = (tag,cls,text) => { const x=document.createElement(tag); if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x; };
  function blockNode(b){
    const node=el('section','v3-block v3-'+b.type);
    if(b.heading)node.append(el('h3','v3-heading',limit(b.heading,150)));
    if(b.intro)node.append(el('p','v3-intro',limit(b.intro)));
    if(b.type==='text'){
      for(const p of (Array.isArray(b.paragraphs)?b.paragraphs:[]).slice(0,5))node.append(el('p','',limit(p)));
    } else if(b.type==='table'){
      const wrap=el('div','v3-table-wrap'),table=el('table','v3-table');
      const cols=(Array.isArray(b.columns)?b.columns:[]).slice(0,6);
      if(cols.length){const head=el('thead'),tr=el('tr');cols.forEach(c=>tr.append(el('th','',limit(c,80))));head.append(tr);table.append(head);
        const body=el('tbody');(Array.isArray(b.rows)?b.rows:[]).slice(0,12).forEach(row=>{const tr=el('tr');cols.forEach((_,i)=>tr.append(el('td','',limit(Array.isArray(row)?row[i]:'',350))));body.append(tr)});table.append(body);wrap.append(table);node.append(wrap)}
    } else if(b.type==='chart'){
      const labels=(Array.isArray(b.labels)?b.labels:[]).slice(0,8),values=(Array.isArray(b.values)?b.values:[]).slice(0,8).map(Number);
      const valid=labels.length>0&&labels.length===values.length&&values.every(v=>Number.isFinite(v)&&v>=0);
      if(valid){const max=Math.max(...values,1),chart=el('div','v3-bars');labels.forEach((label,i)=>{const row=el('div','v3-bar-row');row.append(el('span','v3-bar-label',limit(label,70)));const track=el('div','v3-bar-track'),fill=el('div','v3-bar-fill');fill.style.width=(values[i]/max*100)+'%';track.append(fill);row.append(track,el('strong','v3-bar-value',String(values[i])));chart.append(row)});node.append(chart)}
      node.append(el('p','v3-caveat',b.data_status==='illustrative'?'Illustrative example — not measured VANTER performance.':limit(b.note||'Values supplied by the knowledge base.',300)));
    } else if(b.type==='flow'){
      const steps=(Array.isArray(b.steps)?b.steps:[]).slice(0,7),flow=el('div','v3-flow-list');steps.forEach((s,i)=>{const item=el('div','v3-flow-step');item.append(el('span','v3-flow-number',String(i+1).padStart(2,'0')),el('strong','',limit(s.title||s,100)),el('p','',limit(s.description||'',450)));flow.append(item)});node.append(flow);
    } else if(b.type==='cards'){
      const grid=el('div','v3-cards');(Array.isArray(b.items)?b.items:[]).slice(0,6).forEach(c=>{const card=el('article','v3-mini-card');card.append(el('h4','',limit(c.title,120)),el('p','',limit(c.body,800)));grid.append(card)});node.append(grid);
    }
    const ids=(Array.isArray(b.source_ids)?b.source_ids:[]).filter(x=>typeof x==='string').slice(0,8);
    if(ids.length)node.append(el('div','sources',T[lang].source+': '+ids.join(' · ')));
    return node;
  }
  render = function(d,scenario,isAI){
    if(!isAI||!Array.isArray(d.blocks)||!d.blocks.length){originalRender(d,scenario,isAI);return;}
    const result=$('result');result.replaceChildren();
    const top=el('div','result-top');top.append(el('span','',T[lang].result+' / '+T[lang].ai),el('span','','VANTER / '+lang.toUpperCase()));result.append(top);
    const content=el('div','result-content');content.append(el('span','section-kicker','PERSONALIZED EXPERIENCE'),el('h2','',limit(d.title,180)),el('p','summary',limit(d.summary,1800)));
    const blocks=el('div','v3-blocks');d.blocks.filter(b=>b&&types.has(b.type)).slice(0,9).forEach(b=>blocks.append(blockNode(b)));content.append(blocks);
    if(d.next){const next=el('div','next-step');next.append(el('b','',T[lang].next),document.createTextNode(limit(d.next,600)));content.append(next)}
    if(d.question){const q=el('div','v3-question');q.append(el('b','',({en:'TO MAKE THIS MORE RELEVANT',nl:'OM DIT RELEVANTER TE MAKEN',ru:'ЧТО МОЖНО УТОЧНИТЬ'})[lang]),el('p','',limit(d.question,500)));content.append(q)}
    content.append(el('p','result-note',T[lang].limits));result.append(content);
    result.dataset.scenario=scenario;result.dataset.ai='1';result.classList.remove('hidden');result.scrollIntoView({behavior:'smooth',block:'start'});
  };
  async function v3Generate(){
    const q=$('prompt').value.trim();if(!q){alert(T[lang].noPrompt);return}
    lastPrompt=q;const button=$('generate');button.disabled=true;$('loading').classList.remove('hidden');const scenario=classify(q);
    try{
      if(!apiEndpoint){originalRender(sections[scenario][lang],scenario,false);return}
      const res=await fetch(apiEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:q,language:lang})});
      if(!res.ok)throw Error('API '+res.status+' '+(await res.text()).slice(0,400));
      const data=await res.json();
      if(!data.page_title)throw Error('Missing page_title');
      render({title:data.page_title,summary:data.summary||'',blocks:data.blocks||[],cards:(data.sections||[]).map(s=>[s.type||'solution',s.heading||'',s.body||'',s.source_ids||[]]),next:data.recommended_next_step||'',question:data.clarifying_question||''},scenario,true);
    }catch(err){console.warn('BTP v3:',err);originalRender(sections[scenario][lang],scenario,false);const note=$('result').querySelector('.result-note');if(note)note.textContent=T[lang].retry+' '+T[lang].limits}
    finally{$('loading').classList.add('hidden');button.disabled=false}
  }
  const oldButton=$('generate'),newButton=oldButton.cloneNode(true);oldButton.replaceWith(newButton);newButton.addEventListener('click',v3Generate);
  document.querySelectorAll('[data-scenario]').forEach(old=>{const button=old.cloneNode(true);old.replaceWith(button);button.addEventListener('click',()=>{$('prompt').value=examples[button.dataset.scenario][lang];v3Generate()})});
  // Existing keyboard listener calls the previous generator; replace textarea to keep behavior consistent.
  const oldPrompt=$('prompt'),newPrompt=oldPrompt.cloneNode(true);newPrompt.value=oldPrompt.value;oldPrompt.replaceWith(newPrompt);newPrompt.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey))v3Generate()});
})();
