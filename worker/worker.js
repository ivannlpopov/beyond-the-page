// Beyond the Page — Groq / Cloudflare Worker
// Required secrets/variables: GROQ_API_KEY (secret), ALLOWED_ORIGIN (variable), KNOWLEDGE_BASE_URL (variable).
const SYSTEM = `You build factual, personalized pages for the fictional VANTER Engineering Systems demo. Respond ONLY with one valid JSON object, no markdown. Keys: page_title (string), summary (string), blocks (array), recommended_next_step (string), clarifying_question (string), limitations (string). Create 4 to 6 COMPLETE blocks. Each block must contain type, heading, intro, source_ids. Block schemas:
text: {"type":"text","heading":"...","intro":"...","paragraphs":["At least one informative paragraph"],"source_ids":["VNT-01"]}
table: {"type":"table","heading":"...","intro":"...","columns":["Module","Purpose","Limitations"],"rows":[["DesignHub","...","..."],["ProjectFlow","...","..."],["Connect","...","..."]],"source_ids":["VNT-01"]}
chart: {"type":"chart","heading":"...","intro":"...","chart_type":"line","labels":["Jan","Feb","Mar"],"values":[120,105,87],"data_status":"illustrative","note":"Illustrative user-provided figures, not VANTER performance.","source_ids":[]}
flow: {"type":"flow","heading":"...","intro":"...","steps":[{"title":"Submit revision","description":"..."},{"title":"Review","description":"..."},{"title":"Approve","description":"..."}],"source_ids":["VNT-01"]}
cards: {"type":"cards","heading":"...","intro":"...","items":[{"title":"...","body":"..."}],"source_ids":["VNT-01"]}.
CRITICAL: NEVER return empty arrays for paragraphs, rows, columns, labels, values, steps or items. If you cannot fill a block, omit it and use a complete text block instead. Use user-provided numerical series exactly; choose chart_type line for time trends and bar for category comparisons. For any invented/demo figures, set data_status illustrative and explain clearly. Never invent real results, customers, prices, certifications, integrations or capabilities. Source IDs must come from provided knowledge. Avoid unsupported automatic impact detection. Use requested language throughout (en, nl, ru). A complete page is more important than a clarification.`;
const json=(data,status,headers)=>new Response(JSON.stringify(data),{status,headers});
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin')||'';
  const allowed=(env.ALLOWED_ORIGIN||'').replace(/\/$/,'');
  const headers={'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Content-Type':'application/json','Vary':'Origin'};
  if(!allowed||origin!==allowed)return json({error:'Origin not allowed'},403,headers);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(request.method!=='POST')return json({error:'Method not allowed'},405,headers);
  if(!env.GROQ_API_KEY)return json({error:'Missing GROQ_API_KEY secret'},503,headers);
  try{
   const input=await request.json();
   const prompt=String(input.prompt||'').trim().slice(0,1200);
   const language=['en','nl','ru'].includes(input.language)?input.language:'en';
   if(prompt.length<5)return json({error:'Prompt too short'},400,headers);
   const base=(env.KNOWLEDGE_BASE_URL||allowed).replace(/\/$/,'');
   const knowledgeResponse=await fetch(base+'/data/knowledge.json');
   if(!knowledgeResponse.ok)throw Error('Knowledge base inaccessible: '+knowledgeResponse.status);
   const records=await knowledgeResponse.json();
   if(!Array.isArray(records))throw Error('Invalid knowledge base');
   const terms=prompt.toLowerCase().match(/[\p{L}\p{N}]{4,}/gu)||[];
   const ranked=records.map(r=>({r,score:terms.reduce((s,w)=>s+(String(r.title+' '+r.text).toLowerCase().includes(w)?1:0),0)})).sort((a,b)=>b.score-a.score).slice(0,9).map(x=>({id:x.r.id,title:x.r.title,text:String(x.r.text).slice(0,2400)}));
   const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{
    method:'POST',headers:{'Authorization':'Bearer '+env.GROQ_API_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({model:env.GROQ_MODEL||'openai/gpt-oss-20b',temperature:0.3,max_completion_tokens:4200,response_format:{type:'json_object'},messages:[{role:'system',content:SYSTEM},{role:'user',content:JSON.stringify({language,prompt,knowledge:ranked})}]})
   });
   if(!response.ok){const err=await response.text();return json({error:'Groq request failed',status:response.status,detail:err.slice(0,300)},502,headers)}
   const completion=await response.json();
   const page=JSON.parse(completion.choices?.[0]?.message?.content||'{}');
   if(typeof page.page_title!=='string')throw Error('Missing page title');
   const ids=new Set(ranked.map(r=>r.id));
   const clean=x=>String(x??'').slice(0,1200);
   const sources=b=>Array.isArray(b.source_ids)?b.source_ids.filter(id=>ids.has(id)).slice(0,8):[];
   const blocks=[];
   for(const b of (Array.isArray(page.blocks)?page.blocks:[]).slice(0,8)){
    if(!b||!['text','table','chart','flow','cards'].includes(b.type))continue;
    const common={type:b.type,heading:clean(b.heading).slice(0,150),intro:clean(b.intro),source_ids:sources(b)};
    if(b.type==='text'){
     const paragraphs=(Array.isArray(b.paragraphs)?b.paragraphs:[]).map(clean).filter(Boolean).slice(0,5);
     if(!paragraphs.length&&clean(b.body))paragraphs.push(clean(b.body));
     if(paragraphs.length)blocks.push({...common,paragraphs});
    }
    if(b.type==='table'){
     const columns=(Array.isArray(b.columns)?b.columns:[]).map(clean).slice(0,6);
     const rows=(Array.isArray(b.rows)?b.rows:[]).filter(Array.isArray).slice(0,12).map(row=>columns.map((_,i)=>clean(row[i]).slice(0,350)));
     if(columns.length>=2&&rows.length)blocks.push({...common,columns,rows});
    }
    if(b.type==='chart'){
     let labels=(Array.isArray(b.labels)?b.labels:[]).map(clean).slice(0,10);
     let values=(Array.isArray(b.values)?b.values:[]).slice(0,10).map(Number);
     if((!labels.length||labels.length!==values.length)&&prompt){
      const matches=[...prompt.matchAll(/(январь|февраль|март|апрель|май|июнь|июль|август|сентябрь|октябрь|ноябрь|декабрь|january|february|march|april|may|june|july|august|september|october|november|december|januari|februari|maart|mei|juni|juli|augustus)\\s*[—–:\\-]\\s*(\\d+(?:[.,]\\d+)?)/gi)];
      if(matches.length>=2){labels=matches.slice(0,10).map(m=>m[1]);values=matches.slice(0,10).map(m=>Number(m[2].replace(',','.')));}
     }
     if(labels.length>=2&&labels.length===values.length&&values.every(v=>Number.isFinite(v)&&v>=0))blocks.push({...common,labels,values,chart_type:b.chart_type==='bar'?'bar':'line',data_status:'illustrative',note:clean(b.note)||'Illustrative data, not measured VANTER performance.'});
    }
    if(b.type==='flow'){
     const steps=(Array.isArray(b.steps)?b.steps:[]).slice(0,7).map(x=>({title:clean(x?.title||x).slice(0,110),description:clean(x?.description).slice(0,400)})).filter(x=>x.title);
     if(steps.length>=2)blocks.push({...common,steps});
    }
    if(b.type==='cards'){
     const items=(Array.isArray(b.items)?b.items:[]).slice(0,6).map(x=>({title:clean(x?.title).slice(0,110),body:clean(x?.body)})).filter(x=>x.title&&x.body);
     if(items.length)blocks.push({...common,items});
    }
   }
   if(!blocks.length&&Array.isArray(page.sections)){
    for(const b of page.sections.slice(0,5)){if(b?.heading&&b?.body)blocks.push({type:'text',heading:clean(b.heading),intro:'',paragraphs:[clean(b.body)],source_ids:sources(b)})}
   }
   if(!blocks.length)blocks.push({type:'text',heading:clean(page.page_title),intro:'',paragraphs:[clean(page.summary)||'Please provide additional project details.'],source_ids:[]});
   page.blocks=blocks;
   page.summary=clean(page.summary);
   page.recommended_next_step=clean(page.recommended_next_step);
   return json(page,200,headers);
  }catch(e){return json({error:'Generation failed',detail:String(e.message||e).slice(0,160)},502,headers)}
 }
};
