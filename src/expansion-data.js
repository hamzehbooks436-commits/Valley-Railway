export const newPlaces = [
  {id:'coal',name:'Blackstone Colliery',kind:'Coal mine',x:-106,z:-103,pop:0,produces:'Coal',needs:[],color:'#9ca7aa'},
  {id:'dairy',name:'Clover Dairy',kind:'Dairy farm',x:-111,z:117,pop:0,produces:'Milk',needs:[],color:'#eee4bc'},
  {id:'furniture',name:'Oak & Sons Workshop',kind:'Furniture workshop',x:91,z:121,pop:0,produces:'Furniture',needs:['Timber'],color:'#c49b73'},
  {id:'fishery',name:'Reedwater Fishery',kind:'Fishing harbour',x:47,z:-190,pop:0,produces:'Fish',needs:[],color:'#9ccac9'},
  {id:'harbour',name:'Newhaven Harbour',kind:'Regional project',x:48,z:285,pop:0,produces:'Fish',needs:[],color:'#b7ccce',project:'harbour'},
  {id:'resort',name:'Highland Resort',kind:'Regional project',x:-210,z:275,pop:0,produces:'Passengers',needs:[],color:'#eadbb2',project:'resort'},
];

export const projects = [
  {id:'harbour',name:'Newhaven Harbour',desc:'Build a riverside trading harbour. Once open, it exports fish and welcomes passengers and mail.',cost:4500,materials:{Timber:100,Steel:70,Goods:45},reward:14000},
  {id:'resort',name:'Highland Resort',desc:'Supply a mountain hotel and its gardens. Once open, tourists arrive in summer and winter.',cost:3500,materials:{Timber:90,Steel:40,Furniture:60},reward:12000},
];

export const liveries = {forest:'#315847',burgundy:'#792f40',navy:'#294b70',ochre:'#b18b38'};
export const carriageTypes = {
  standard:{name:'Standard carriages',cost:0,description:'Flexible seating and freight space.'},
  sleeper:{name:'Sleeper carriage',cost:3800,description:'Passengers earn 25% more on journeys over 120 miles; 6 fewer seats.'},
  dining:{name:'Dining carriage',cost:3200,description:'Passenger fares increase by 15%; 4 fewer seats.'},
  mail:{name:'Mail van',cost:2600,description:'Mail capacity increases by 16 bags and mail earnings by 20%.'},
};

export const calendarRate=.2;
export const calendarTime=s=>s.calendarTime??s.time;

export function climate(time){
  const day=Math.floor(time/120),season=['Spring','Summer','Autumn','Winter'][Math.floor(day/12)%4];
  const pattern=[0,0,1,0,2,1,0,1];
  const wet=pattern[Math.floor(time/240)%pattern.length];
  const weather=wet===2?(season==='Winter'?'Snow':'Rain'):wet===1?'Overcast':'Clear';
  return {season,weather,year:1890+Math.floor(day/48),day:day%12+1,speed:weather==='Snow'?.85:weather==='Rain'?.93:1};
}

export function seasonalDemand(cargo,season){
  if(cargo==='Passengers')return season==='Summer'?1.3:season==='Winter'?.9:1;
  if(cargo==='Coal')return season==='Winter'?1.5:1;
  if(cargo==='Grain')return season==='Autumn'?1.4:season==='Winter'?.7:1;
  if(cargo==='Milk'||cargo==='Fish')return season==='Summer'?1.2:1;
  if(cargo==='Mail')return season==='Winter'?1.35:1;
  return 1;
}
