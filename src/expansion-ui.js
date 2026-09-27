import {places,byId,money} from './simulation.js';
import {projects,liveries,carriageTypes,climate,calendarTime} from './expansion-data.js';
import {trackBetween,ownerOf,trainName,networkCargo,acceptedCargo,operatingPlace} from './network.js';

export const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const drafts=new Map();
const options=(values,current)=>values.map(([id,label])=>`<option value="${id}" ${id===current?'selected':''}>${escapeHTML(label)}</option>`).join('');
export function serviceControls(t,s){const allowed=networkCargo(s),filtered=allowed.filter(c=>t.service==='mixed'||(t.service==='passenger')===(c==='Passengers'));
 return `<section class="service-panel"><span class="eyebrow">SERVICE PLAN</span><p>Choose which traffic can use this train. Onboard loads finish their journey; new choices begin at departure.</p><div class="service-switch">${['passenger','freight','mixed'].map(mode=>`<button data-service="${mode}" class="${t.service===mode?'active':''}">${mode[0].toUpperCase()+mode.slice(1)}</button>`).join('')}</div><label for="cargo-choice">Preferred load</label><select id="cargo-choice"><option value="auto">Any matching cargo</option>${options(filtered.map(c=>[c,c]),t.preferredCargo)}</select><p class="small">Transfers follow working services. Freight includes mail. An unavailable connection leaves cargo safely at its station.</p></section>`;
}
function projectCard(s,spec){const status=s.projects[spec.id],total=Object.values(spec.materials).reduce((a,b)=>a+b,0),done=Object.values(status.delivered).reduce((a,b)=>a+b,0);
 return `<section class="regional-project"><span class="eyebrow">${status.complete?'OPEN FOR SERVICE':status.started?'UNDER CONSTRUCTION':'REGIONAL PROJECT'}</span><h3>${spec.name}</h3><p>${spec.desc}</p><div class="progress"><span style="width:${Math.min(100,done/total*100)}%"></span></div><div class="supply">${Object.entries(spec.materials).map(([c,n])=>`<div><span>${c}</span><b>${status.delivered[c]||0} / ${n}</b></div>`).join('')}</div><p class="small">Completion grant: ${money(spec.reward)} · No deadline</p><div class="button-row"><button class="secondary" data-project-focus="${spec.id}">View site ↗</button>${!status.started?`<button class="primary" data-project-start="${spec.id}" ${s.cash<spec.cost?'disabled':''}>Start · ${money(spec.cost)}</button>`:''}</div></section>`;
}
export function augmentPanel({tab,body,game,selectedTrain,selectedPlace,world,refresh,selectPlace}){
 const s=game.s;
 if(tab==='train'){
  const t=s.trains.find(t=>t.id===selectedTrain);if(!t)return;
  const stops=drafts.get(t.id)||[...(t.pendingStops||t.stops)];
  const candidates=places.filter(p=>!stops.includes(p.id)&&trackBetween(s,stops.at(-1),p.id)&&!ownerOf(s,trackBetween(s,stops.at(-1),p.id).id,t.id));
  body.insertAdjacentHTML('beforeend',`<section class="service-panel"><span class="eyebrow">MULTI-STOP ROUTE</span><p>The train visits each stop in order, then returns along the same route. Use 2–10 stops; each neighbouring pair needs its own track.</p><ol class="stop-list">${stops.map((id,i)=>`<li><span>${byId[id].name}</span><div><button class="secondary" data-stop-move="${i}" ${i===0?'disabled':''} aria-label="Move ${byId[id].name} earlier">↑</button><button class="secondary" data-stop-remove="${i}" ${stops.length<=2?'disabled':''} aria-label="Remove ${byId[id].name}">×</button></div></li>`).join('')}</ol><label for="add-stop">Extend from ${byId[stops.at(-1)].name}</label><select id="add-stop"><option value="">Choose a connected, unused line</option>${options(candidates.map(p=>[p.id,p.name]),'')}</select><div class="button-row"><button class="primary" id="save-stops">Save route</button><button class="secondary" id="reset-stops">Reset edits</button></div><p class="small">${t.pendingStops?'A plan is queued for the next departure.':'Build additional track first, then extend this train without buying another engine.'} Each track is reserved by one train. Transfers between services happen automatically and pay at the final destination.</p></section>
  <section class="service-panel"><span class="eyebrow">PERSONALISE YOUR TRAIN</span><label for="train-name">Locomotive name</label><input id="train-name" maxlength="36" value="${escapeHTML(t.name)}" placeholder="${escapeHTML(trainName(t))}"><label for="train-color">Livery</label><select id="train-color">${options([['company','Company colours'],...Object.keys(liveries).map(c=>[c,c[0].toUpperCase()+c.slice(1)])],t.color)}</select><label for="train-carriage">Special carriage</label><select id="train-carriage">${options(Object.entries(carriageTypes).map(([id,c])=>[id,c.name+' · '+(t.ownedCarriages.includes(id)?'Owned':money(c.cost))]),t.carriage)}</select><p id="carriage-description">${carriageTypes[t.carriage].description}</p><button class="primary" id="save-custom">Apply workshop choices</button><p class="small">One special carriage replaces a regular carriage. Owned carriages can be refitted free. Livery and naming are free.</p></section>`);
  const store=()=>drafts.set(t.id,[...stops]);
  body.querySelectorAll('[data-stop-move]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.stopMove);[stops[i-1],stops[i]]=[stops[i],stops[i-1]];store();refresh();});
  body.querySelectorAll('[data-stop-remove]').forEach(b=>b.onclick=()=>{stops.splice(Number(b.dataset.stopRemove),1);store();refresh();});
  body.querySelector('#add-stop').onchange=e=>{if(e.target.value&&stops.length<10){stops.push(e.target.value);store();e.target.blur();refresh();}};
  body.querySelector('#save-stops').onclick=()=>{if(game.setStops(t.id,stops)){drafts.delete(t.id);refresh();}};
  body.querySelector('#reset-stops').onclick=()=>{drafts.delete(t.id);refresh();};
  body.querySelector('#train-carriage').onchange=e=>{body.querySelector('#carriage-description').textContent=carriageTypes[e.target.value].description;};
  body.querySelector('#save-custom').onclick=()=>{if(game.customiseTrain(t.id,body.querySelector('#train-name').value,body.querySelector('#train-color').value,body.querySelector('#train-carriage').value)){world.sync(s);refresh();}};
 }
 if(tab==='company'){
  const weather=climate(calendarTime(s));
  body.insertAdjacentHTML('afterbegin',`<section class="service-panel"><span class="eyebrow">${weather.season.toUpperCase()} · ${weather.year} · ${weather.weather.toUpperCase()}</span><p>Seasons last 12 days. Summer brings more passengers, autumn more grain, and winter more coal demand and mail. Rain slows trains by 7%; snow by 15%.</p><label for="company-color">Company colours</label><select id="company-color">${options(Object.keys(liveries).map(c=>[c,c[0].toUpperCase()+c.slice(1)]),s.companyColor)}</select></section>`);
  body.insertAdjacentHTML('beforeend',`<hr><span class="eyebrow">BUILD THE REGION</span>${projects.map(p=>projectCard(s,p)).join('')}`);
  body.querySelector('#company-color').onchange=e=>{game.setCompanyColor(e.target.value);world.sync(s);};
 }
 if(tab==='place'){
  const p=byId[selectedPlace],site=s.sites[p.id],board=game.departureBoard(p.id),transfers=site.transfers;
  body.insertAdjacentHTML('beforeend',`<hr><span class="eyebrow">DEPARTURE BOARD</span><div class="departure-board">${board.map(row=>`<div><b>${escapeHTML(row.name)}</b><span>Next: ${row.next}</span><small>${row.status} · ${row.service}</small></div>`).join('')||'<p>No scheduled service yet.</p>'}</div><span class="eyebrow">TRANSFER DEPOT · ${transfers.reduce((sum,q)=>sum+q.amount,0)} WAITING</span><div class="transfer-list">${transfers.map(q=>`<p><b>${q.amount} ${q.commodity}</b> → ${byId[q.destination].name}</p>`).join('')||'<p class="small">Passengers and cargo changing trains wait here.</p>'}</div>${p.project?projectCard(s,projects.find(v=>v.id===p.project)):''}`);
  if(p.project){const intro=body.querySelector('.intro');intro.textContent=operatingPlace(s,p)?(p.id==='resort'?'The mountain hotel is open. Tourist demand peaks in summer and winter.':'The harbour is open. Export fish and bring passengers, mail and supplies.'):'Start this project in Company, then deliver '+acceptedCargo(s,p).join(', ')+'. Construction progress is shown below.';}
 }
 body.querySelectorAll('[data-project-start]').forEach(b=>b.onclick=()=>{game.startProject(b.dataset.projectStart);refresh();});
 body.querySelectorAll('[data-project-focus]').forEach(b=>b.onclick=()=>{world.focus(b.dataset.projectFocus);selectPlace(b.dataset.projectFocus);});
}
