// Beyond the Page — Groq / Cloudflare Worker
// Required secrets/variables: GROQ_API_KEY (secret), ALLOWED_ORIGIN (variable), KNOWLEDGE_BASE_URL (variable).
const SYSTEM = `You generate personalized pages for Beyond the Page, an independent proof of concept featuring fictional VANTER Engineering Systems. Only claim facts supported by the supplied knowledge records. Return ONLY a JSON object with keys visitor_goal, clarifying_question, page_title, summary, sections, recommended_next_step, limitations. sections is an array of 2-5 objects with type (solution, workflow, technical, risk, commercial, resource), heading, body, source_ids. Use at least two section types. Use source IDs only from the supplied records. Never invent clients, pricing, ROI, compliance certifications, integrations or technical specifications. Never mention SEVERIN. Write entirely in the visitor's requested language (en English, nl Dutch, ru Russian). Prefer a usable page over a clarification; ask a clarification only if essential. Keep sections concise. No markdown fences.`;
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
    body:JSON.stringify({model:env.GROQ_MODEL||'openai/gpt-oss-20b',temperature:0.3,max_completion_tokens:2300,response_format:{type:'json_object'},messages:[{role:'system',content:SYSTEM},{role:'user',content:JSON.stringify({language,prompt,knowledge:ranked})}]})
   });
   if(!response.ok){const err=await response.text();return json({error:'Groq request failed',status:response.status,detail:err.slice(0,300)},502,headers)}
   const completion=await response.json();
   const page=JSON.parse(completion.choices?.[0]?.message?.content||'{}');
   if(typeof page.page_title!=='string'||!Array.isArray(page.sections))throw Error('Invalid page response');
   const ids=new Set(ranked.map(r=>r.id));
   page.sections=page.sections.slice(0,5).map(s=>({type:['solution','workflow','technical','risk','commercial','resource'].includes(s.type)?s.type:'solution',heading:String(s.heading||'').slice(0,140),body:String(s.body||'').slice(0,950),source_ids:Array.isArray(s.source_ids)?s.source_ids.filter(id=>ids.has(id)):[]}));
   page.summary=String(page.summary||'').slice(0,1200);
   page.recommended_next_step=String(page.recommended_next_step||'').slice(0,500);
   return json(page,200,headers);
  }catch(e){return json({error:'Generation failed',detail:String(e.message||e).slice(0,160)},502,headers)}
 }
};
