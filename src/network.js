import {byId,places,rates,engines,money,routeLength,growthThresholds,growthNames} from './simulation.js';
import {projects,climate,seasonalDemand,liveries,carriageTypes,calendarRate,calendarTime} from './expansion-data.js';

// Retain the earlier 25% reduction, then reduce the resulting delivery profit by 30%.
const deliveryIncomeMultiplier=.75*.70;

export const trainName=t=>t.name||engines[t.engine].name;
export const trainCapacity=(t,cargo=t.commodity)=>20+t.capacity*12-(t.carriage==='sleeper'?6:t.carriage==='dining'?4:0)+(t.carriage==='mail'&&cargo==='Mail'?16:0);
export const acceptsService=(t,c)=>t.service==='mixed'||(t.service==='passenger')===(c==='Passengers');
export const trackBetween=(s,a,b)=>s.routes.find(r=>(r.a===a&&r.b===b)||(r.a===b&&r.b===a));
export function trainTracks(s,t,includePending=true){
  const plans=[t.stops,...(includePending&&t.pendingStops?[t.pendingStops]:[])];
  return [...new Set(plans.flatMap(stops=>(stops||[]).slice(1).map((b,i)=>trackBetween(s,stops[i],b)?.id)).filter(Boolean))];
}
export const ownerOf=(s,id,except)=>s.trains.find(t=>t.id!==except&&trainTracks(s,t).includes(id));
export function operatingPlace(s,p){return !p.project||s.projects[p.project]?.complete;}
export function population(s,p){return p.id==='resort'&&operatingPlace(s,p)?1200:p.pop;}
export function acceptedCargo(s,p){
  if(p.project&&!operatingPlace(s,p)){
    const status=s.projects[p.project],spec=projects.find(q=>q.id===p.project);
    return status?.started?Object.keys(spec.materials).filter(c=>(status.delivered[c]||0)<spec.materials[c]):[];
  }
  return [...new Set(['Passengers',...(population(s,p)?['Mail','Flour','Goods','Milk','Fish','Furniture','Coal']:p.needs),...(p.id==='harbour'?['Mail','Goods','Coal']:[])])];
}
export function networkCargo(s){return Object.keys(rates);}
export function migrateExpansion(s){
  s.calendarTime??=s.time;
  s.companyColor??='forest';s.projects??={};
  for(const p of projects)s.projects[p.id]??={started:false,complete:false,delivered:{}};
  for(const site of Object.values(s.sites)){site.transfers??=[];site.inputs??={};site.dispatchCounts??={};site.dispatchSequence??=0;}
  for(const t of s.trains){const r=s.routes.find(r=>r.id===t.route);if(!r)continue;
    t.stops??=[r.a,r.b];t.serviceDir??=t.dir;t.name??='';t.color??='company';t.carriage??='standard';t.ownedCarriages??=['standard'];
    if(t.station===undefined)t.station=t.dwell>0?(t.dir===1?r.a:r.b):null;
    if(t.cargo&&!t.shipment)t.shipment={origin:t.dir===1?r.a:r.b,destination:t.dir===1?r.b:r.a,commodity:t.commodity,amount:t.cargo};
  }
  return s;
}

// Only operational train services route shipments. Empty track never promises a connection.
function destinations(s,from,cargo,omitTrain){
  const adjacency=new Map();
  for(const t of s.trains){if(t.id===omitTrain||!acceptsService(t,cargo)||(t.preferredCargo!=='auto'&&t.preferredCargo!==cargo))continue;
    const stops=t.stops;
    for(let i=1;i<stops.length;i++){const a=stops[i-1],b=stops[i];if(!trackBetween(s,a,b))continue;
      if(!adjacency.has(a))adjacency.set(a,[]);if(!adjacency.has(b))adjacency.set(b,[]);adjacency.get(a).push(b);adjacency.get(b).push(a);
    }
  }
  const found=new Map([[from,null]]),queue=[from];
  for(let i=0;i<queue.length;i++){const at=queue[i];for(const next of adjacency.get(at)||[])if(!found.has(next)){found.set(next,at===from?next:found.get(at));queue.push(next);}}
  return found;
}

export const expansionMethods={
  setStops(id,stops){
    const t=this.s.trains.find(t=>t.id===id);if(!t)return false;
    if(stops.length<2||stops.length>10||new Set(stops).size!==stops.length||stops.some(id=>!byId[id])){this.notify('Choose 2–10 different stops in travel order.');return false;}
    const r=this.s.routes.find(r=>r.id===t.route),anchor=t.station||(t.dir===1?r.b:r.a);
    if(!stops.includes(anchor)){this.notify('Keep '+byId[anchor].name+' in the plan: this is the train’s next platform.');return false;}
    for(let i=1;i<stops.length;i++){
      const track=trackBetween(this.s,stops[i-1],stops[i]);
      if(!track){this.notify('Build track between '+byId[stops[i-1]].name+' and '+byId[stops[i]].name+' first.');return false;}
      if(ownerOf(this.s,track.id,id)){this.notify('Another train already reserves the '+byId[track.a].name+' – '+byId[track.b].name+' line. Choose an unused line.');return false;}
    }
    t.pendingStops=[...stops];this.message('New stopping plan saved. It begins at the next platform departure.');this.save();return true;
  },
  configureTrain(id,service,preferredCargo='auto'){
    const t=this.s.trains.find(t=>t.id===id);if(!t||!['passenger','freight','mixed'].includes(service))return false;
    if(preferredCargo!=='auto'&&(!rates[preferredCargo]||!acceptsService({service},preferredCargo)))return false;
    t.service=service;t.preferredCargo=preferredCargo;this.message(trainName(t)+' now accepts '+service+' traffic. Existing loads finish their journey.');this.save();return true;
  },
  customiseTrain(id,name,color,carriage){
    const t=this.s.trains.find(t=>t.id===id);if(!t||!carriageTypes[carriage]||!(color==='company'||liveries[color]))return false;
    if(!t.ownedCarriages.includes(carriage)){if(!this.spend(carriageTypes[carriage].cost))return false;t.ownedCarriages.push(carriage);}
    t.name=String(name).trim().slice(0,36);t.color=color;t.carriage=carriage;this.message('Workshop finished: '+trainName(t)+'.');this.save();return true;
  },
  setCompanyColor(color){if(!liveries[color])return;this.s.companyColor=color;this.dirty=true;this.save();},
  startProject(id){const spec=projects.find(p=>p.id===id),status=this.s.projects[id];if(!spec||status.started||!this.spend(spec.cost))return false;status.started=true;this.message(spec.name+' construction started. Deliver the required materials by rail.');this.save();return true;},
  departureBoard(id){
    return this.s.trains.filter(t=>t.stops.includes(id)||t.pendingStops?.includes(id)).map(t=>{
      const stops=t.pendingStops?.includes(id)?t.pendingStops:t.stops,index=stops.indexOf(id),direction=index===0?1:index===stops.length-1?-1:t.serviceDir,next=stops[index+direction];
      return {name:trainName(t),next:byId[next]?.name||'Terminus',status:t.station===id?(this.s.speed?'Boarding':'Paused at platform'):'En route',service:t.service};
    });
  },
  loadAt(t,from,next){
    const site=this.s.sites[from],capacity=c=>trainCapacity(t,c),paths=new Map();
    const path=c=>{if(!paths.has(c))paths.set(c,destinations(this.s,from,c));return paths.get(c);};
    const eligible=c=>acceptsService(t,c)&&(t.preferredCargo==='auto'||t.preferredCargo===c);
    const waiting=site.transfers.find(q=>eligible(q.commodity)&&path(q.commodity).get(q.destination)===next);
    let shipment=null;
    if(waiting){const amount=Math.min(waiting.amount,capacity(waiting.commodity));shipment={...waiting,amount};waiting.amount-=amount;if(waiting.amount<=0)site.transfers.splice(site.transfers.indexOf(waiting),1);}
    if(!shipment&&operatingPlace(this.s,byId[from])){
      const p=byId[from],choices=population(this.s,p)?['Passengers','Mail']:[p.produces];
      for(let i=0;i<choices.length;i++){
        const c=choices[(site.dispatchSequence+i)%choices.length];if(!eligible(c))continue;
        const stock=c==='Mail'?site.mail:site.stock;if(stock<1)continue;
        const targets=places.filter(p=>p.id!==from&&acceptedCargo(this.s,p).includes(c)&&path(c).get(p.id)===next);
        if(!targets.length)continue;
        const dest=targets[(site.dispatchCounts[c]||0)%targets.length];let amount=Math.min(Math.floor(stock),capacity(c));
        if(dest.project&&!operatingPlace(this.s,dest)){
          const spec=projects.find(p=>p.id===dest.project),status=this.s.projects[dest.project];
          amount=Math.min(amount,spec.materials[c]-(status.delivered[c]||0));
        }
        if(amount<=0)continue;
        shipment={origin:from,destination:dest.id,commodity:c,amount};if(c==='Mail')site.mail-=amount;else site.stock-=amount;site.dispatchCounts[c]=(site.dispatchCounts[c]||0)+1;site.dispatchSequence++;break;
      }
    }
    t.shipment=shipment;t.cargo=shipment?.amount||0;t.commodity=shipment?.commodity||null;t.loads++;
  },
  deliverShipment(t,dest,q){
    if(!q||!q.amount)return;const site=this.s.sites[dest],p=byId[dest];
    if(q.destination!==dest){
      const old=site.transfers.find(v=>v.origin===q.origin&&v.destination===q.destination&&v.commodity===q.commodity);
      if(old)old.amount+=q.amount;else site.transfers.push({...q});
      return;
    }
    const current=climate(calendarTime(this.s)),length=routeLength(q.origin,dest);
    const special=q.commodity==='Passengers'?(t.carriage==='dining'?1.15:t.carriage==='sleeper'&&length>120?1.25:1):q.commodity==='Mail'&&t.carriage==='mail'?1.2:1;
    const gross=Math.round(q.amount*rates[q.commodity]*(1+Math.min(1,length/150))*seasonalDemand(q.commodity,current.season)*special);
    const net=Math.round(gross*(1-.16*engines[t.engine].eff/(1+(t.efficiency-1)*.22))*deliveryIncomeMultiplier);
    this.s.cash+=net;this.s.earned+=net;this.s.delivered+=q.amount;if(q.commodity!=='Passengers')this.s.freight+=q.amount;
    site.delivered+=q.amount;t.revenue+=net;t.trips++;
    if(p.needs.includes(q.commodity)&&!population(this.s,p))site.inputs[q.commodity]=Math.min(400,(site.inputs[q.commodity]||0)+q.amount);
    this.message(p.name+': '+q.amount+' '+q.commodity.toLowerCase()+' delivered · +'+money(net));
    if(population(this.s,p)){
      site.growthPoints+=q.amount*({Passengers:1,Mail:1.35,Flour:2,Goods:2.5,Milk:2,Fish:2,Furniture:2.5,Coal:1.5}[q.commodity]||1);
      while(site.growth<growthThresholds.length&&site.growthPoints>=growthThresholds[site.growth]){site.growth++;this.message(p.name+' is now '+growthNames[site.growth].toLowerCase()+'!');}
    }
    if(p.project){const status=this.s.projects[p.project],spec=projects.find(v=>v.id===p.project);
      if(status.started&&!status.complete&&spec.materials[q.commodity]){
        status.delivered[q.commodity]=Math.min(spec.materials[q.commodity],(status.delivered[q.commodity]||0)+q.amount);
        if(Object.entries(spec.materials).every(([c,n])=>(status.delivered[c]||0)>=n)){
          status.complete=true;this.s.cash+=spec.reward;site.stock=40;if(p.id==='resort')site.mail=20;
          this.message(spec.name+' is open! New traffic unlocked · '+money(spec.reward)+' completion grant.');
        }
      }
    }
    this.advanceRequests(dest,q.commodity,q.amount);
  },
  tick(dt){
    if(!this.s.started||!this.s.speed)return;dt*=this.s.speed;this.s.time+=dt;this.s.calendarTime+=dt*calendarRate;const weather=climate(calendarTime(this.s));
    const climateKey=weather.season+weather.weather;if(this.climateKey!==climateKey){this.climateKey=climateKey;this.dirty=true;}
    for(const p of places){if(!operatingPlace(this.s,p))continue;const site=this.s.sites[p.id],pop=population(this.s,p),cap=100*site.level;
      const rate=(pop ? .19+site.growth*.05 : .13)*site.level*seasonalDemand(pop?'Passengers':p.produces,weather.season)*(p.id==='resort'&&['Winter','Summer'].includes(weather.season)?1.65:1);
      if(pop||!p.needs.length){site.stock=Math.min(cap,site.stock+dt*rate);if(pop)site.mail=Math.min(cap,site.mail+dt*(.11+site.growth*.025)*site.level*seasonalDemand('Mail',weather.season));}
      else {const inputs=p.needs.filter(c=>c!=='Coal'),available=Math.min(...inputs.map(n=>site.inputs[n]||0)),boost=p.kind==='Foundry'&&site.inputs.Coal>0?1.5:1;
        const made=Math.max(0,Math.min(dt*rate*boost,available,cap-site.stock));for(const n of inputs)site.inputs[n]-=made;if(boost>1)site.inputs.Coal=Math.max(0,site.inputs.Coal-made*.3);site.stock+=made;
      }
    }
    for(const t of this.s.trains){let r=this.s.routes.find(r=>r.id===t.route);if(!r)continue;
      if(t.dwell>0){t.dwell=Math.max(0,t.dwell-dt);if(t.dwell===0){
        const from=t.station||(t.dir===1?r.a:r.b);
        if(t.pendingStops){t.stops=t.pendingStops;t.pendingStops=null;}
        const index=t.stops.indexOf(from);if(index===0)t.serviceDir=1;else if(index===t.stops.length-1)t.serviceDir=-1;
        const next=t.stops[index+t.serviceDir],track=trackBetween(this.s,from,next);
        if(!track){t.dwell=1;continue;}
        t.route=track.id;r=track;t.dir=r.a===from?1:-1;t.t=t.dir===1?0:1;t.station=null;
        this.loadAt(t,from,next);this.dirty=true;
      }continue;}
      t.t+=t.dir*dt*engines[t.engine].speed*(1+(r.level-1)*.15)*weather.speed/routeLength(r.a,r.b,r.bend);
      if(t.t>=1||t.t<=0){t.t=Math.max(0,Math.min(1,t.t));const dest=t.dir===1?r.b:r.a;
        const shipment=t.shipment;t.shipment=null;t.cargo=0;t.commodity=null;t.station=dest;t.dwell=9/Math.sqrt(this.s.sites[dest].level);
        this.deliverShipment(t,dest,shipment);this.dirty=true;
      }
    }
    this.saveClock+=dt;if(this.saveClock>=20){this.saveClock=0;this.save();}
  },
};
