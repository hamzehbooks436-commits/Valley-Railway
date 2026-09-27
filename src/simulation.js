import {newPlaces} from './expansion-data.js';
import {migrateExpansion,expansionMethods,ownerOf} from './network.js';
export const places = [
  { id:'elm', name:'Elmford', kind:'Village', x:-72,z:38, pop:840, produces:'Passengers', needs:['Goods','Flour'], color:'#e4c789' },
  { id:'willow', name:'Willowbrook', kind:'Town', x:-31,z:-15, pop:1620, produces:'Passengers', needs:['Goods','Flour'], color:'#e4c789' },
  { id:'farm', name:'Golden Fields', kind:'Farm', x:-78,z:-55, pop:0, produces:'Grain', needs:[], color:'#dac170' },
  { id:'mill', name:'Riverbend Mill', kind:'Mill', x:3,z:48, pop:0, produces:'Flour', needs:['Grain'], color:'#cdaa83' },
  { id:'pine', name:'Pinewood', kind:'Lumber camp', x:-30,z:84, pop:0, produces:'Timber', needs:[], color:'#b7ce9a' },
  { id:'works', name:'Ashford Works', kind:'Factory', x:59,z:58, pop:0, produces:'Goods', needs:['Timber','Steel'], color:'#d3a48d' },
  { id:'city', name:'Kingsbridge', kind:'City', x:69,z:-13, pop:8400, produces:'Passengers', needs:['Goods','Flour'], color:'#e4c789' },
  { id:'mine', name:'Highland Quarry', kind:'Mine', x:-12,z:-81, pop:0, produces:'Ore', needs:[], color:'#b6c5c8' },
  { id:'steel', name:'Northbank Foundry', kind:'Foundry', x:85,z:-71, pop:0, produces:'Steel', needs:['Ore'], color:'#d3a48d' },
  { id:'westhaven', name:'Westhaven', kind:'City', x:-220,z:26, pop:6200, produces:'Passengers', needs:['Goods','Flour'], color:'#e4c789' },
  { id:'briar', name:'Briar Glen', kind:'Town', x:-152,z:72, pop:1900, produces:'Passengers', needs:['Goods','Flour'], color:'#e4c789' },
  { id:'larkfield', name:'Larkfield', kind:'Village', x:-134,z:5, pop:780, produces:'Passengers', needs:['Goods','Flour'], color:'#e4c789' },
  { id:'moorbridge', name:'Moorbridge', kind:'Town', x:-139,z:-130, pop:2300, produces:'Passengers', needs:['Goods','Flour'], color:'#e4c789' },
  { id:'southport', name:'Southport', kind:'City', x:-55,z:-230, pop:9600, produces:'Passengers', needs:['Goods','Flour'], color:'#e4c789' },
  { id:'fairmeadow', name:'Fairmeadow', kind:'Village', x:-27,z:-141, pop:660, produces:'Passengers', needs:['Goods','Flour'], color:'#e4c789' },
  { id:'highmeadow', name:'Highmeadow', kind:'Village', x:-17,z:174, pop:910, produces:'Passengers', needs:['Goods','Flour'], color:'#e4c789' },
  { id:'rosebury', name:'Rosebury', kind:'Town', x:52,z:163, pop:2700, produces:'Passengers', needs:['Goods','Flour'], color:'#e4c789' },
  { id:'eastwick', name:'Eastwick', kind:'Town', x:155,z:81, pop:3100, produces:'Passengers', needs:['Goods','Flour'], color:'#e4c789' },
  { id:'seabourne', name:'Seabourne', kind:'City', x:228,z:-45, pop:12800, produces:'Passengers', needs:['Goods','Flour'], color:'#e4c789' },
  { id:'hartwell', name:'Hartwell', kind:'Town', x:145,z:-87, pop:2100, produces:'Passengers', needs:['Goods','Flour'], color:'#e4c789' },
  { id:'northvale', name:'Northvale', kind:'Village', x:112,z:231, pop:720, produces:'Passengers', needs:['Goods','Flour'], color:'#e4c789' },
  { id:'glenmere', name:'Glenmere', kind:'Town', x:-182,z:202, pop:1880, produces:'Passengers', needs:['Goods','Flour'], color:'#e4c789' },
  { id:'stoneford', name:'Stoneford', kind:'Town', x:135,z:4, pop:2540, produces:'Passengers', needs:['Goods','Flour'], color:'#e4c789' },
  { id:'oakridge', name:'Oakridge', kind:'Village', x:-38,z:253, pop:530, produces:'Passengers', needs:['Goods','Flour'], color:'#e4c789' },
  { id:'westfold', name:'Westfold Farm', kind:'Farm', x:-205,z:-52, pop:0, produces:'Grain', needs:[], color:'#dac170' },
  { id:'amber', name:'Amber Fields', kind:'Farm', x:184,z:-160, pop:0, produces:'Grain', needs:[], color:'#dac170' },
  { id:'northfield', name:'Northfield Farm', kind:'Farm', x:46,z:236, pop:0, produces:'Grain', needs:[], color:'#dac170' },
  { id:'cedar', name:'Cedar Forest', kind:'Lumber camp', x:-111,z:221, pop:0, produces:'Timber', needs:[], color:'#b7ce9a' },
  { id:'cypress', name:'Cypress Wood', kind:'Lumber camp', x:217,z:135, pop:0, produces:'Timber', needs:[], color:'#b7ce9a' },
  { id:'granite', name:'Granite Quarry', kind:'Mine', x:159,z:-229, pop:0, produces:'Ore', needs:[], color:'#b6c5c8' },
  { id:'slate', name:'Slate Hills Mine', kind:'Mine', x:-236,z:-200, pop:0, produces:'Ore', needs:[], color:'#b6c5c8' },
  { id:'westmill', name:'Westhaven Mill', kind:'Mill', x:-226,z:140, pop:0, produces:'Flour', needs:['Grain'], color:'#cdaa83' },
  { id:'eastmill', name:'Eastwick Mill', kind:'Mill', x:221,z:12, pop:0, produces:'Flour', needs:['Grain'], color:'#cdaa83' },
  { id:'iron', name:'Southbank Foundry', kind:'Foundry', x:105,z:-164, pop:0, produces:'Steel', needs:['Ore'], color:'#d3a48d' },
  { id:'briarworks', name:'Briar Works', kind:'Factory', x:-158,z:139, pop:0, produces:'Goods', needs:['Timber','Steel'], color:'#d3a48d' },
  { id:'seaworks', name:'Seabourne Works', kind:'Factory', x:236,z:80, pop:0, produces:'Goods', needs:['Timber','Steel'], color:'#d3a48d' },
];
places.push(...newPlaces);
for(const p of places){if(p.pop)p.needs.push('Milk','Fish','Furniture','Coal');if(p.kind==='Foundry')p.needs.push('Coal');}
export const byId=Object.fromEntries(places.map(p=>[p.id,p]));
export const rates={Passengers:22,Mail:28,Grain:31,Flour:58,Timber:40,Ore:36,Steel:67,Goods:84,Coal:43,Milk:49,Furniture:92,Fish:53};
export const engines=[{name:'Pioneer 0-6-0',model:'locomotive',cost:7500,speed:2.6,eff:1},{name:'Valley Express',model:'locomotive_express',cost:15000,speed:3.5,eff:1.15},{name:'Highland Pacific',model:'locomotive_pacific',cost:29000,speed:4.5,eff:1.35}];
export const growthThresholds=[70,180,360];
export const growthNames=['Quiet','Growing','Thriving','Regional hub'];
export const money=n=>'£'+Math.round(n).toLocaleString('en-GB');
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function routeLength(a,b,bend=0){return distance(byId[a],byId[b])*(1+Math.abs(bend)/180);}
export function riverX(z){return 17+Math.sin(z*.026)*11;}
export function bridge(a,b){return (a.x-riverX(a.z))*(b.x-riverX(b.z))<0;}
export function quote(a,b,bend=0){return Math.round(2000+routeLength(a,b,bend)*58+(bridge(byId[a],byId[b])?2600:0));}
export function cargoOptionsFor(a,b){const p=byId[a],q=byId[b],options=[];if(p.pop){options.push('Passengers');if(q.pop)options.push('Mail');}else if(q.needs.includes(p.produces))options.push(p.produces);return options;}
export function routeCargo(a,b){return [...new Set([...cargoOptionsFor(a,b),...cargoOptionsFor(b,a)])];}
export function cargoFor(a,b){return cargoOptionsFor(a,b)[0]||null;}
export function cargoForService(route,service){return routeCargo(route.a,route.b).filter(c=>service==='mixed'||(service==='passenger')===(c==='Passengers'));}
const requestSeeds=[
 {dest:'willow',cargo:'Passengers',target:45,reward:1800},
 {dest:'elm',cargo:'Passengers',target:55,reward:2100},
 {dest:'mill',cargo:'Grain',target:35,reward:3200},
 {dest:'city',cargo:'Passengers',target:70,reward:4200},
 {dest:'willow',cargo:'Mail',target:40,reward:1900},
 {dest:'works',cargo:'Timber',target:35,reward:4500},
 {dest:'steel',cargo:'Ore',target:35,reward:3900},
 {dest:'elm',cargo:'Flour',target:30,reward:3500},
];
function makeRequest(sequence){let spec=requestSeeds[sequence];if(!spec){const index=sequence-requestSeeds.length,requestPlaces=places.filter(p=>!p.project),p=requestPlaces[index%requestPlaces.length];const cargo=p.pop?['Passengers','Mail','Flour','Goods'][Math.floor(index/places.length)%4]:(p.needs[index%p.needs.length]||'Passengers');const target=25+(index%4)*10;spec={dest:p.id,cargo,target,reward:Math.round(1600+target*(rates[cargo]||22)*.6)};}return {id:sequence+1,...spec,progress:0};}
function newSite(p){return {level:1,stock:p.project?0:p.pop?40:p.needs.length?0:35,mail:p.pop?24:0,inputs:Object.fromEntries(p.needs.map(n=>[n,0])),delivered:0,growth:0,growthPoints:0};}
function migrateState(s){
  for(const p of places){if(!s.sites[p.id])s.sites[p.id]=newSite(p);const site=s.sites[p.id];site.mail??=p.pop?24:0;site.growthPoints??=p.pop?(site.delivered||0):0;site.growth??=p.pop?growthThresholds.filter(threshold=>site.growthPoints>=threshold).length:0;}
  for(const t of s.trains){const route=s.routes.find(r=>r.id===t.route);if(!route)continue;t.service??=(byId[route.a].pop&&byId[route.b].pop?'passenger':cargoForService(route,'freight').length?'freight':'passenger');t.preferredCargo??='auto';t.loads??=0;}
  if(!Array.isArray(s.requests)||!s.requests.length){s.requestSequence=3;s.requests=[makeRequest(0),makeRequest(1),makeRequest(2)];}
  s.requestSequence??=Math.max(3,...s.requests.map(r=>r.id));
  s.requestsCompleted??=0;
  return s;
}
export function loadGame(){
  try {const s=JSON.parse(localStorage.getItem('valley-railway-v1'));if(s?.version===1&&Array.isArray(s.routes)&&s.routes.length&&Array.isArray(s.trains)&&s.trains.length&&s.sites&&Number.isFinite(s.cash)){
    // Add new towns, mail, growth and requests without discarding existing companies.
    migrateState(s);
    if(s.cash===24000&&s.earned===0&&s.routes.length===1&&s.trains.length===1)s.cash=12000;
    return s;
  }}catch{}
  return {version:1,cash:12000,time:0,speed:1,earned:0,delivered:0,freight:0,claimed:[],log:[],nextId:2,requestSequence:3,requestsCompleted:0,requests:[makeRequest(0),makeRequest(1),makeRequest(2)],
    sites:Object.fromEntries(places.map(p=>[p.id,newSite(p)])),
    routes:[{id:1,a:'elm',b:'willow',bend:10,level:1,cost:0}],
    trains:[{id:1,route:1,t:0,dir:1,dwell:7,engine:0,capacity:1,efficiency:1,cargo:0,commodity:null,revenue:0,trips:0,service:'passenger',preferredCargo:'auto',loads:0}],started:false};
}
export class Railway {
 constructor(state,notify){this.s=migrateExpansion(state);this.notify=notify;this.saveClock=0;this.dirty=true;}
 message(text){this.s.log.unshift({text,day:Math.floor(this.s.calendarTime/120)+1});this.s.log=this.s.log.slice(0,30);this.notify(text);this.dirty=true;}
 spend(amount){if(this.s.cash<amount){this.notify('Your company needs '+money(amount-this.s.cash)+' more. Let your trains earn it.');return false;}this.s.cash-=amount;this.dirty=true;return true;}
 save(){try{localStorage.setItem('valley-railway-v1',JSON.stringify(this.s));return true;}catch{this.notify('Saving is unavailable. Allow browser storage to keep your railway.');return false;}}
 build(a,b,bend){
   if(!byId[a]||!byId[b]||a===b)return false;
   if(this.s.routes.some(r=>(r.a===a&&r.b===b)||(r.a===b&&r.b===a))){this.notify('These stations already share a railway.');return false;}
   if(!this.s.routes.some(r=>[r.a,r.b].includes(a)||[r.a,r.b].includes(b))){this.notify('Extend from a station already connected to your railway.');return false;}
   const cost=quote(a,b,bend);if(!this.spend(cost))return false;
   const r={id:this.s.nextId++,a,b,bend,level:1,cost};this.s.routes.push(r);this.message('New line: '+byId[a].name+' to '+byId[b].name+'. Extend a train’s stopping plan or buy a locomotive to begin service.');this.save();return r;
 }
 buyTrain(route,engine=0){if(!engines[engine]||!this.s.routes.some(r=>r.id===route))return false;if(ownerOf(this.s,route)){this.notify('Another train reserves this line. Extend its stopping plan or upgrade its coaches.');return false;}if(!this.spend(engines[engine].cost))return false;
   const r=this.s.routes.find(r=>r.id===route),options=routeCargo(r.a,r.b),service=options.includes('Passengers')&&options.some(c=>c!=='Passengers')?'mixed':options.includes('Passengers')?'passenger':'freight';
   const t={id:this.s.nextId++,route,t:0,dir:1,dwell:7,engine,capacity:1,efficiency:1,cargo:0,commodity:null,revenue:0,trips:0,service,preferredCargo:'auto',loads:0};this.s.trains.push(t);migrateExpansion(this.s);this.message('A new '+engines[engine].name+' joins the railway.');this.save();return t;}
 upgradeTrain(id,kind){const t=this.s.trains.find(t=>t.id===id);if(!t)return;
   const level=kind==='engine'?t.engine:t[kind];const max=kind==='engine'?2:4;if(level>=max)return;
   const cost=kind==='engine'?engines[level+1].cost:kind==='capacity'?3200*level:2400*level;
   if(!this.spend(cost))return;t[kind]++;this.message(kind==='engine'?'Engine replaced with '+engines[t.engine].name+'.':kind==='capacity'?'Extra carriage attached. Capacity increased.':'Workshop overhaul complete. Running costs reduced.');this.save();
 }
 upgradeStation(id){const site=this.s.sites[id];if(site.level>=4)return;if(!this.spend(4500*site.level))return;site.level++;this.message(byId[id].name+' station expanded to level '+site.level+'.');this.save();}
 upgradeRoute(id){const r=this.s.routes.find(r=>r.id===id);if(r.level>=3)return;if(!this.spend(4000*r.level))return;r.level++;this.message('Track renewed. Line speed increased by 15%.');this.save();}
 advanceRequests(dest,cargo,amount){for(const request of this.s.requests){if(request.dest!==dest||request.cargo!==cargo)continue;request.progress=Math.min(request.target,request.progress+amount);this.dirty=true;if(request.progress>=request.target){this.s.cash+=request.reward;this.s.requestsCompleted++;this.message(byId[dest].name+' request fulfilled: '+request.target+' '+cargo.toLowerCase()+' · '+money(request.reward)+' reward.');const index=this.s.requests.indexOf(request);this.s.requests[index]=makeRequest(this.s.requestSequence++);this.save();}}
 }
 contracts(){const connected=new Set(this.s.routes.flatMap(r=>[r.a,r.b])).size;return [
   {id:'first',name:'A railway for the valley',desc:'Carry 100 passengers or crates.',value:this.s.delivered,target:100,reward:4000},
   {id:'network',name:'Beyond the next hill',desc:'Connect five different places.',value:connected,target:5,reward:9000},
   {id:'freight',name:'The wheels of industry',desc:'Deliver 150 crates or mailbags.',value:this.s.freight,target:150,reward:12000},
   {id:'city',name:'The Kingsbridge connection',desc:'Bring 100 arrivals to Kingsbridge.',value:this.s.sites.city.delivered,target:100,reward:10000},
   {id:'valley',name:'One valley, one railway',desc:`Connect all ${places.length} places.`,value:connected,target:places.length,reward:90000}];}
 claim(id){const c=this.contracts().find(c=>c.id===id);if(!c||c.value<c.target||this.s.claimed.includes(id))return;this.s.claimed.push(id);this.s.cash+=c.reward;this.message(c.name+' completed · '+money(c.reward)+' grant received.');this.save();}
}

Object.assign(Railway.prototype,expansionMethods);
