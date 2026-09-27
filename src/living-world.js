import * as THREE from 'three';
import {places,byId,riverX,growthNames} from './simulation.js';
import {climate,liveries,projects,calendarTime} from './expansion-data.js';
import {population,trainName} from './network.js';

export const livingModels=['coal_mine','dairy_farm','furniture_workshop','fishery','harbour_terminal','resort_hotel','coach_sleeper','coach_dining','coach_mail','passenger','porter','platform_lamp','platform_crate'];

export const livingWorldMethods={
  safePlot(x,z,radius,ignore=null){
    // Use the whole footprint, not just the building centre, including the curved riverbanks.
    for(let dz=-radius;dz<=radius;dz+=Math.max(.5,radius/4))if(Math.abs(x-riverX(z+dz))<8.5+radius)return false;
    for(const route of this.routes.values())if(route.clearancePoints.some(p=>Math.hypot(p.x-x,p.z-z)<radius+3.5))return false;
    if(places.some(p=>Math.hypot(p.x-5-x,p.z-3-z)<radius+4.2))return false;
    return !this.plotBuildings.some(b=>b!==ignore&&b.obj.visible&&Math.hypot(b.obj.position.x-x,b.obj.position.z-z)<radius+b.radius+1.4);
  },
  positionBuilding(entry){
    const {obj,x,z,radius}=entry;
    if(this.safePlot(x,z,radius,entry)){obj.position.set(x,.34,z);obj.visible=true;obj.userData.safePlot=true;this.clearTreesNear(x,z,radius+1);return;}
    for(let ring=1;ring<=24;ring++){
      const distance=ring*4,steps=Math.max(16,Math.ceil(distance*2));
      for(let i=0;i<steps;i++){
        const angle=i/steps*Math.PI*2+entry.seed,nx=x+Math.cos(angle)*distance,nz=z+Math.sin(angle)*distance;
        if(this.safePlot(nx,nz,radius,entry)){obj.position.set(nx,.34,nz);obj.visible=true;obj.userData.safePlot=true;this.clearTreesNear(nx,nz,radius+1);return;}
      }
    }
    // Keep the plot pending if a dense network leaves no safe land. Never overlap track.
    obj.visible=false;obj.userData.safePlot=false;
  },
  plotModel(type,x,z,scale=1,rotation=0){
    const obj=this.model(type,x,.34,z,scale);obj.rotation.y=rotation;obj.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(obj),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
    const radius=Math.hypot(size.x,size.z)/2+Math.hypot(center.x-x,center.z-z);
    const entry={obj,x,z,radius,seed:this.plotBuildings.length*.73};this.plotBuildings.push(entry);this.positionBuilding(entry);return obj;
  },
  reflowBuildings(){
    for(const b of this.plotBuildings)if(!b.obj.visible||!this.safePlot(b.obj.position.x,b.obj.position.z,b.radius,b))this.positionBuilding(b);
  },
  makeSettlements(){
    this.plotBuildings=[];this.stationLife=new Map();this.projectVisuals=new Map();
    for(const p of places){
      this.model('station',p.x-5,.33,p.z-3,.72);
      if(p.project){
        const foundation=this.box([10,.25,7],[p.x,.4,p.z-15],new THREE.MeshStandardMaterial({color:'#ac9f85'}));
        const stakes=[];for(let i=0;i<4;i++)stakes.push(this.box([.2,2,.2],[p.x+(i%2?5:-5),1.2,p.z-15+(i<2?-3.5:3.5)],new THREE.MeshStandardMaterial({color:'#8f6e43'})));
        const construction=new THREE.Group();construction.position.set(p.x,.34,p.z-15);this.scene.add(construction);construction.updateMatrixWorld(true);
        for(const o of [foundation,...stakes])construction.attach(o);
        const entry={obj:construction,x:p.x,z:p.z-15,radius:7,seed:0};this.plotBuildings.push(entry);this.positionBuilding(entry);
        this.projectVisuals.set(p.id,{foundation,stakes,construction,built:false,materials:[]});
      }else if(p.pop){
        const n=p.kind==='City'?17:p.kind==='Town'?9:5;
        for(let i=0;i<n;i++){const a=i*2.4,rad=8+Math.floor(i/5)*5,type=p.kind==='City'&&i%3!==0?'townhouse':p.kind==='Town'&&i%4===0?'townhouse':'cottage';this.plotModel(type,p.x+Math.cos(a)*rad,p.z-14+Math.sin(a)*rad,p.kind==='City'?1.08:.8+((i*7)%4)*.08,Math.floor(i%4)*Math.PI/2);}
      }else{
        const type={Mill:'mill',Farm:'farmhouse','Lumber camp':'warehouse',Factory:'factory',Mine:'quarry',Foundry:'foundry','Coal mine':'coal_mine','Dairy farm':'dairy_farm','Furniture workshop':'furniture_workshop','Fishing harbour':'fishery'}[p.kind];
        this.plotModel(type,p.x+3,p.z-13);
        if(p.kind==='Factory')this.plotModel('warehouse',p.x-11,p.z-16,.8);
      }
      const ring=new THREE.Mesh(new THREE.RingGeometry(3.1,3.25,48),new THREE.MeshBasicMaterial({color:p.color,transparent:true,opacity:.6,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(p.x,.43,p.z);this.scene.add(ring);
      const people=Array.from({length:6},(_,i)=>this.model('passenger',p.x-7+(i%3)*.7,.66,p.z-4.5+Math.floor(i/3)*.7,.6));
      const porter=this.model('porter',p.x-3,.66,p.z-4,.65);
      const crates=Array.from({length:3},(_,i)=>this.model('platform_crate',p.x-7+i*.65,.66,p.z-2,.55));
      const lamps=[this.model('platform_lamp',p.x-7.6,.55,p.z-4.5,.75),this.model('platform_lamp',p.x-2.5,.55,p.z-4.5,.75)];
      for(const lamp of lamps)lamp.traverse(o=>{if(o.isMesh&&/straw/i.test(o.material.name)){o.material=o.material.clone();o.material.emissive.set('#ffd47c');o.material.emissiveIntensity=.6;}});
      const canvas=document.createElement('canvas');canvas.width=512;canvas.height=192;
      const texture=new THREE.CanvasTexture(canvas),board=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:true}));board.position.set(p.x-5,5.5,p.z-4);board.scale.set(10,3.75,1);this.scene.add(board);
      this.stationLife.set(p.id,{people,porter,crates,lamps,canvas,texture,board,signature:''});
    }
    const positions=new Float32Array(700*3);for(let i=0;i<700;i++){positions[i*3]=Math.sin(i*13.1)*95;positions[i*3+1]=(i*7.13)%55;positions[i*3+2]=Math.cos(i*17.3)*95;}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
    this.precipitation=new THREE.Points(geometry,new THREE.PointsMaterial({color:'#e4edf0',size:.25,transparent:true,opacity:.7,depthWrite:false}));this.precipitation.frustumCulled=false;this.scene.add(this.precipitation);
    const rainGeometry=new THREE.BufferGeometry();rainGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(700*6),3));
    this.rain=new THREE.LineSegments(rainGeometry,new THREE.LineBasicMaterial({color:'#c9deea',transparent:true,opacity:.5,depthWrite:false}));this.rain.frustumCulled=false;this.scene.add(this.rain);
    this.roofMaterials=[];
    for(const asset of Object.values(this.assets))asset.traverse(o=>{if(o.isMesh&&/roof|tile/i.test(o.material.name)&&!this.roofMaterials.some(v=>v.material===o.material))this.roofMaterials.push({material:o.material,color:o.material.color.clone()});});
  },
  syncGrowth(s){
    for(const p of places){if(!population(s,p))continue;const site=s.sites[p.id],built=this.townGrowth.get(p.id)||0;if(site.growth<=built)continue;
      for(let stage=built+1;stage<=site.growth;stage++){const count=3+stage*2,radius=23+stage*8;
        for(let i=0;i<count;i++){const angle=i/count*Math.PI*2+stage*.7,scale=stage===3?1.12:stage===2?.95:.85;
          const house=this.plotModel(stage>=2&&i%2===0?'townhouse':'cottage',p.x+Math.cos(angle)*radius,p.z-14+Math.sin(angle)*radius,scale,Math.floor(i%4)*Math.PI/2);
          house.scale.setScalar(.02);this.growingBuildings.push({house,target:scale});
        }
      }
      this.townGrowth.set(p.id,site.growth);const label=this.labels.find(item=>item.p.id===p.id)?.el;if(label)label.querySelector('small').textContent=p.kind+' · '+growthNames[site.growth];
    }
  },
  updateSeason(season){
    if(this.currentSeason===season)return;this.currentSeason=season;
    const colors=this.ground.geometry.attributes.color,base=this.groundBaseColors,c=new THREE.Color(),snow=new THREE.Color('#e0e5dc');
    for(let i=0;i<colors.count;i++){c.setRGB(base[i*3],base[i*3+1],base[i*3+2]);if(season==='Winter')c.lerp(snow,.85);else if(season==='Autumn')c.lerp(new THREE.Color('#ac9950'),.3);else if(season==='Summer')c.multiplyScalar(1.08);colors.setXYZ(i,c.r,c.g,c.b);}colors.needsUpdate=true;
    for(const {mesh} of this.treeInstances){if(!/leaf|foliage/i.test(mesh.material.name))continue;
      mesh.userData.baseColor??=mesh.material.color.clone();mesh.material.color.copy(mesh.userData.baseColor);
      if(season==='Winter')mesh.material.color.lerp(snow,.75);else if(season==='Autumn')mesh.material.color.lerp(new THREE.Color('#bd7335'),.72);
    }
    for(const roof of this.roofMaterials){roof.material.color.copy(roof.color);if(season==='Winter')roof.material.color.lerp(snow,.8);}
  },
  updateLiving(s,dt){
    const weather=climate(calendarTime(s));this.updateSeason(weather.season);
    const grey=weather.weather!=='Clear';this.scene.background.set(grey?'#afbfc4':weather.season==='Winter'?'#cfdfeb':'#bfd8d7');this.scene.fog.color.copy(this.scene.background);this.scene.fog.density=grey?.0019:.0012;
    this.sun.intensity*=grey?.62:1;this.clouds.children[0].material.opacity=grey?.68:.43;
    this.precipitation.visible=weather.weather==='Snow';this.rain.visible=weather.weather==='Rain';
    if(this.precipitation.visible||this.rain.visible){const snow=weather.weather==='Snow',positions=this.precipitation.geometry.attributes.position,rain=this.rain.geometry.attributes.position,elapsed=s.started?dt*s.speed:0;
      this.precipitation.position.set(this.controls.target.x,0,this.controls.target.z);this.rain.position.copy(this.precipitation.position);this.precipitation.material.size=.5;
      for(let i=0;i<positions.count;i++){let y=positions.getY(i)-elapsed*(snow?3:26);if(y<0)y+=55;positions.setY(i,y);rain.setXYZ(i*2,positions.getX(i),y,positions.getZ(i));rain.setXYZ(i*2+1,positions.getX(i)-.2,y+1.5,positions.getZ(i));}positions.needsUpdate=true;rain.needsUpdate=true;
    }
    for(const p of places){const life=this.stationLife.get(p.id),site=s.sites[p.id],close=this.camera.position.distanceTo(life.porter.position)<160;
      const boardTrains=s.trains.filter(t=>t.stops.includes(p.id));
      const boarding=boardTrains.some(t=>t.station===p.id),passengers=(population(s,p)?site.stock:0)+site.transfers.filter(q=>q.commodity==='Passengers').reduce((a,q)=>a+q.amount,0);
      life.people.forEach((o,i)=>{o.visible=close&&passengers>i*12;o.rotation.y=Math.sin(s.time*.15+i)*.2;});
      life.porter.visible=close&&boardTrains.length>0;life.porter.position.x=p.x-5+(boarding?Math.sin(s.time*1.2)*1.5:1.5);life.porter.rotation.y=boarding&&Math.cos(s.time*1.2)<0?-Math.PI/2:Math.PI/2;
      const freight=(population(s,p)?site.mail:site.stock)+site.transfers.filter(q=>q.commodity!=='Passengers').reduce((a,q)=>a+q.amount,0);
      life.crates.forEach((o,i)=>{o.visible=close&&freight>i*15;});life.board.visible=close;
      if(close){const rows=boardTrains.slice(0,3).map(t=>trainName(t)+' · '+(t.station===p.id?'BOARDING':byId[t.stops.at(-1)].name)),signature=rows.join('|');
        if(life.signature!==signature||!life.painted){life.signature=signature;life.painted=true;const ctx=life.canvas.getContext('2d');ctx.fillStyle='#243b31';ctx.fillRect(0,0,512,192);ctx.fillStyle='#e8d9a9';ctx.font='bold 23px sans-serif';ctx.fillText(p.name.toUpperCase(),18,32);ctx.font='20px sans-serif';(rows.length?rows:['Awaiting railway service']).forEach((row,i)=>ctx.fillText(row,18,75+i*35,480));life.texture.needsUpdate=true;}
      }
    }
    for(const spec of projects){const visual=this.projectVisuals.get(spec.id),status=s.projects[spec.id],p=byId[spec.id];
      visual.foundation.visible=!status.complete;visual.stakes.forEach(o=>o.visible=status.started&&!status.complete);
      const delivered=Object.values(status.delivered).reduce((a,b)=>a+b,0),target=Math.min(8,Math.floor(delivered/20));
      while(visual.materials.length<target){const i=visual.materials.length;visual.materials.push(this.plotModel('platform_crate',p.x-4+i%4,p.z-12+Math.floor(i/4),1));}
      visual.materials.forEach(o=>o.visible=!status.complete&&o.userData.safePlot);
      if(status.complete&&!visual.built){visual.construction.visible=false;[visual.construction,...visual.materials].forEach(o=>{const b=this.plotBuildings.find(v=>v.obj===o);if(b)this.plotBuildings.splice(this.plotBuildings.indexOf(b),1);});
        this.plotModel(spec.id==='harbour'?'harbour_terminal':'resort_hotel',p.x,p.z-15,1.25);visual.built=true;
        const label=this.labels.find(v=>v.p.id===p.id)?.el;if(label)label.querySelector('small').textContent=spec.id==='harbour'?'Trading harbour · Open':'Mountain resort · Open';
      }
    }
  },
  applyLivery(obj,t,s){
    const color=liveries[t.color==='company'?s.companyColor:t.color];
    obj.traverse(o=>{if(!o.isMesh)return;o.material=o.material.clone();
      if(/green|navy|midnight|maroon/i.test(o.material.name))o.material.color.set(color);
    });
  },
};
