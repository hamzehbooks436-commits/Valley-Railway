import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { places,byId,riverX,engines,growthNames } from './simulation.js';
import {livingModels,livingWorldMethods} from './living-world.js';
import {calendarTime} from './expansion-data.js';

const V=THREE.Vector3;
export function curveFor(r){const a=byId[r.a],b=byId[r.b],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);return new THREE.QuadraticBezierCurve3(new V(a.x,.68,a.z),new V((a.x+b.x)/2-dz/len*r.bend,.68,(a.z+b.z)/2+dx/len*r.bend),new V(b.x,.68,b.z));}
const material=(color,roughness=.85,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
function height(x,z){const edge=Math.max(0,(Math.max(Math.abs(x),Math.abs(z))-280)/65);const mountain=edge*edge*(12+5*Math.sin(x*.022+z*.017)+4*Math.sin(z*.059));const bank=Math.abs(x-riverX(z));return bank<5?-1.8:bank<8?(bank-5)/3*.3-.1:.17+Math.sin(x*.057)*Math.sin(z*.041)*.12+mountain;}
export class World {
 constructor(canvas,labels,onSelect,onTrain){
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#bfd8d7');this.scene.fog=new THREE.FogExp2('#bfd8d7',.0012);
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;
  this.camera=new THREE.PerspectiveCamera(46,1,.2,1600);this.camera.position.set(345,430,515);
  this.controls=new OrbitControls(this.camera,canvas);this.controls.target.set(0,0,4);this.controls.enableDamping=true;this.controls.dampingFactor=.06;this.controls.minDistance=12;this.controls.maxDistance=1050;this.controls.maxPolarAngle=Math.PI*.46;this.controls.mouseButtons={LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.ROTATE};
  this.controls.addEventListener('start',()=>{this.follow=null;});
  this.sun=new THREE.DirectionalLight('#ffe1ad',3.1);this.sun.position.set(-180,370,170);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-360,right:360,top:360,bottom:-360,near:1,far:900});this.sun.shadow.normalBias=.07;this.sun.shadow.bias=-.00015;this.scene.add(this.sun,new THREE.HemisphereLight('#e1e7d5','#626b47',2));
  this.assets={};this.routes=new Map();this.trains=new Map();this.townGrowth=new Map();this.growingBuildings=[];this.labels=[];this.treeInstances=[];this.smoke=[];this.smokeClock=0;this.preview=null;this.follow=null;this.clock=0;
  this.makeLandscape();
  for(const p of places){const el=document.createElement('button');el.className='place-label';el.title=p.name+' · '+p.kind;el.innerHTML='<span class="place-dot" style="background:'+p.color+'"></span><b>'+p.name+'</b><small>'+p.kind+'</small>';el.onclick=()=>onSelect(p.id);labels.append(el);this.labels.push({el,p});}
  let down;canvas.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});canvas.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)return;const rect=canvas.getBoundingClientRect(),mouse=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),ray=new THREE.Raycaster();ray.setFromCamera(mouse,this.camera);const hits=ray.intersectObjects([...this.trains.values()].flatMap(t=>t.cars),true);if(hits.length){let o=hits[0].object;while(o&&!o.userData.trainId)o=o.parent;if(o)onTrain(o.userData.trainId);}});
  this.resize();window.addEventListener('resize',()=>this.resize());
 }
 resize(){this.renderer.setSize(innerWidth,innerHeight);this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();}
 async load(progress){const loader=new GLTFLoader(),names=['locomotive','locomotive_express','locomotive_pacific','coach','freight','station','cottage','townhouse','farmhouse','factory','warehouse','foundry','quarry','mill','pine','oak','birch',...livingModels];let done=0;const assetBase=import.meta.env.BASE_URL+'models/';await Promise.all(names.map(async name=>{const gltf=await loader.loadAsync(assetBase+name+'.glb');this.assets[name]=gltf.scene;gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});progress(++done/names.length);}));this.makeSettlements();this.makeForest();for(const b of this.plotBuildings)if(b.obj.visible)this.clearTreesNear(b.obj.position.x,b.obj.position.z,b.radius+1);}
 model(name,x=0,y=0,z=0,scale=1){const obj=this.assets[name].clone(true);obj.position.set(x,y,z);obj.scale.setScalar(scale);this.scene.add(obj);return obj;}
 box(size,pos,mat){const o=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;this.scene.add(o);return o;}
 makeLandscape(){
   const g=new THREE.PlaneGeometry(900,900,260,260);g.rotateX(-Math.PI/2);const pos=g.attributes.position,colors=[],c=new THREE.Color();
   for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),h=height(x,z);pos.setY(i,h);const n=(Math.sin(x*.085+z*.025)+Math.cos(z*.073-x*.015))*.022; c.setHSL(.30+n,.43,h>17?.32:h>5?.36:.40+n);colors.push(c.r,c.g,c.b);}
   g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();const ground=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));ground.receiveShadow=true;this.scene.add(ground);this.ground=ground;this.groundBaseColors=new Float32Array(colors);
   const waterVerts=[],waterIndices=[];for(let i=0;i<=225;i++){const z=-450+i*4,x=riverX(z);waterVerts.push(x-5.5,-.55,z,x+5.5,-.55,z);if(i<225){const a=i*2;waterIndices.push(a,a+2,a+1,a+1,a+2,a+3);}}
   const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(waterVerts,3));wg.setIndex(waterIndices);wg.computeVertexNormals();
   this.water=new THREE.Mesh(wg,new THREE.MeshPhysicalMaterial({color:'#639a96',roughness:.23,metalness:.2,clearcoat:.9,transparent:true,opacity:.87,side:THREE.DoubleSide}));this.scene.add(this.water);
   const ripples=[];for(let i=0;i<230;i++){const z=-440+i*3.8,x=riverX(z);const geo=new THREE.PlaneGeometry(1.3+(i%3),.05);geo.rotateX(-Math.PI/2);geo.translate(x+Math.sin(i*7)*3,-.51,z);ripples.push(geo);}this.ripples=new THREE.Mesh(mergeGeometries(ripples),new THREE.MeshBasicMaterial({color:'#d2e3d1',transparent:true,opacity:.27}));this.scene.add(this.ripples);ripples.forEach(g=>g.dispose());
   // Hedged fields and furrows form an agricultural patchwork in the valley.
   const earth=material('#acb86e'),hedge=material('#3e713b'),furrows=[material('#799852'),material('#a2af62')];
   const fields=places.filter(p=>p.kind==='Farm').flatMap(p=>[[p.x-12,p.z-13,17,11],[p.x+13,p.z-8,15,12],[p.x-4,p.z-28,20,11]]);
   for(const [x,z,w,d] of fields){
     this.box([w,.11,d],[x,.32,z],earth);for(let i=0;i<Math.floor(w/1.8);i++)this.box([.35,.12,d-1],[x-w/2+i*1.8,.43,z],furrows[i%2]);
     this.box([w+.5,.8,.7],[x,.7,z-d/2],hedge);this.box([.7,.8,d],[x-w/2,.7,z],hedge);
   }
   // Atmospheric cloud banks stay beyond the playable valley.
   this.clouds=new THREE.Group();const cloudMat=new THREE.MeshLambertMaterial({color:'#f8edd6',transparent:true,opacity:.43,depthWrite:false});for(let i=0;i<28;i++){const puff=new THREE.Mesh(new THREE.IcosahedronGeometry(1,2),cloudMat);puff.position.set(Math.sin(i*4.12)*360,110+(i%4)*8,Math.cos(i*3.1)*350);puff.scale.set(24+i%5*4,4.2,13);this.clouds.add(puff);}this.scene.add(this.clouds);
   this.birds=[];const birdMat=new THREE.LineBasicMaterial({color:'#47554a'});for(let i=0;i<9;i++){const bird=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new V(-.7,0,.2),new V(),new V(.7,0,.2)]),birdMat);this.scene.add(bird);this.birds.push(bird);}
 }
 makeForest(){
  let seed=8223;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const groups={pine:[],oak:[],birch:[]};
  for(let i=0;i<3200;i++){const x=(rand()-.5)*700,z=(rand()-.5)*700;if(Math.abs(x-riverX(z))<10||places.some(p=>Math.hypot(x-p.x,z-(p.z-9))<21))continue;const grove=Math.sin(x*.024)*Math.cos(z*.019)+Math.sin(z*.041);if(grove<-.35&&rand()<.7)continue;const kind=rand()<.40?'pine':rand()<.67?'oak':'birch';const obj=new THREE.Object3D();obj.position.set(x,height(x,z),z);obj.scale.setScalar(.7+rand()*.75);obj.rotation.y=rand()*Math.PI*2;obj.updateMatrix();groups[kind].push({matrix:obj.matrix.clone(),x,z,hidden:false});}
  for(const kind of Object.keys(groups)){const trees=groups[kind];this.assets[kind].updateMatrixWorld(true);this.assets[kind].traverse(m=>{if(!m.isMesh)return;const inst=new THREE.InstancedMesh(m.geometry,m.material.clone(),trees.length);trees.forEach((t,i)=>inst.setMatrixAt(i,new THREE.Matrix4().multiplyMatrices(t.matrix,m.matrixWorld)));inst.castShadow=true;inst.receiveShadow=true;this.scene.add(inst);this.treeInstances.push({mesh:inst,trees,part:m.matrixWorld.clone()});});}
 }
 clearTrees(curve){if(!this.treeInstances.length)return;const steps=Math.ceil(curve.getLength()/5),points=[];for(let i=0;i<=steps;i++)points.push(curve.getPointAt(i/steps));const a=points[0],b=points.at(-1),dx=b.x-a.x,dz=b.z-a.z,denom=dx*dx+dz*dz;
   const groups=new Map();for(const item of this.treeInstances){if(!groups.has(item.trees))groups.set(item.trees,[]);groups.get(item.trees).push(item.mesh);}
   const invisible=new THREE.Matrix4().makeScale(0,0,0);
   for(const [trees,meshes] of groups){const removed=[];trees.forEach((tree,i)=>{if(tree.hidden)return;const t=Math.max(0,Math.min(1,((tree.x-a.x)*dx+(tree.z-a.z)*dz)/denom));if(Math.hypot(tree.x-a.x-dx*t,tree.z-a.z-dz*t)>22)return;if(points.some(p=>Math.hypot(p.x-tree.x,p.z-tree.z)<4)){tree.hidden=true;removed.push(i);}});for(const mesh of meshes){for(const index of removed)mesh.setMatrixAt(index,invisible);if(removed.length)mesh.instanceMatrix.needsUpdate=true;}}
 }
 clearTreesNear(x,z,radius=5){const groups=new Map(),invisible=new THREE.Matrix4().makeScale(0,0,0);for(const item of this.treeInstances){if(!groups.has(item.trees))groups.set(item.trees,[]);groups.get(item.trees).push(item.mesh);}for(const [trees,meshes] of groups){const removed=[];trees.forEach((tree,i)=>{if(!tree.hidden&&Math.hypot(tree.x-x,tree.z-z)<radius){tree.hidden=true;removed.push(i);}});for(const mesh of meshes){for(const index of removed)mesh.setMatrixAt(index,invisible);if(removed.length)mesh.instanceMatrix.needsUpdate=true;}}}
 track(r,ghost=false){const curve=curveFor(r),len=curve.getLength(),group=new THREE.Group(),mats=ghost?[material('#d8e1a3'),material('#dfedbd'),material('#a4bc78')]:[material('#b1a690'),material('#92958d',.35,.7),material('#615340')];
  const makeInstances=(geometry,mat,count,fn)=>{const mesh=new THREE.InstancedMesh(geometry,mat,count),dummy=new THREE.Object3D();for(let i=0;i<count;i++){fn(dummy,i);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}mesh.receiveShadow=true;mesh.castShadow=!ghost;group.add(mesh);};
  const n=Math.ceil(len/.8);makeInstances(new THREE.BoxGeometry(2.6,.19,len/n+.12),mats[0],n,(o,i)=>{const t=(i+.5)/n;o.position.copy(curve.getPointAt(t));o.position.y=.4;const d=curve.getTangentAt(t);o.rotation.y=Math.atan2(d.x,d.z);o.scale.set(1,1,1);});
  makeInstances(new THREE.BoxGeometry(2.22,.15,.23),mats[2],n,(o,i)=>{const t=(i+.5)/n;o.position.copy(curve.getPointAt(t));o.position.y=.55;const d=curve.getTangentAt(t);o.rotation.y=Math.atan2(d.x,d.z);});
  for(const side of [-1,1])makeInstances(new THREE.BoxGeometry(.085,.12,len/n+.15),mats[1],n,(o,i)=>{const t=(i+.5)/n,d=curve.getTangentAt(t);o.position.copy(curve.getPointAt(t));o.position.x+=d.z*.68*side;o.position.z-=d.x*.68*side;o.rotation.y=Math.atan2(d.x,d.z);});
  if(!ghost){const stone=material('#777c6d');for(let i=0;i<n;i+=4){const t=i/n,p=curve.getPoint(t);if(Math.abs(p.x-riverX(p.z))<7){const pier=new THREE.Mesh(new THREE.BoxGeometry(.7,2.6,1.2),stone);pier.position.set(p.x,-.85,p.z);pier.rotation.y=Math.atan2(curve.getTangent(t).x,curve.getTangent(t).z);group.add(pier);}}}
  this.scene.add(group);if(!ghost)this.clearTrees(curve);return {group,curve,clearancePoints:curve.getPoints(Math.ceil(len))};
 }
 clearPreview(){if(this.preview){this.scene.remove(this.preview.group);this.disposeGroup(this.preview.group);this.preview=null;}}
 disposeGroup(group){const materials=new Set();group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)materials.add(o.material);});materials.forEach(m=>m.dispose());}
 previewRoute(a,b,bend){this.clearPreview();if(a&&b&&a!==b)this.preview=this.track({a,b,bend},true);}
 sync(s){let trackAdded=false;for(const r of s.routes)if(!this.routes.has(r.id)){this.routes.set(r.id,this.track(r));trackAdded=true;}if(trackAdded)this.reflowBuildings();
  for(const t of s.trains){let visual=this.trains.get(t.id);const signature=[t.capacity,t.engine,t.service,t.color,t.carriage,s.companyColor].join('-');if(visual?.signature===signature)continue;if(visual)for(const o of visual.cars){this.scene.remove(o);o.traverse(m=>{if(m.isMesh)m.material.dispose();});}
   let carTypes=t.service==='mixed'?['coach','freight',...Array.from({length:Math.max(0,t.capacity-1)},(_,i)=>i%2?'freight':'coach')]:Array.from({length:t.capacity},()=>t.service==='passenger'?'coach':'freight');
   if(t.carriage!=='standard')carTypes[0]='coach_'+t.carriage;
   const cars=[this.model(engines[t.engine].model),...carTypes.map(type=>this.model(type))];for(const o of cars){o.scale.setScalar(.52);o.userData.trainId=t.id;this.applyLivery(o,t,s);}
   this.trains.set(t.id,{cars,signature});
  }
 }
 focus(id){const p=byId[id],delta=new V(p.x,0,p.z).sub(this.controls.target);this.camera.position.add(delta);this.controls.target.add(delta);this.follow=null;}
 overview(){this.follow=null;this.camera.position.set(345,430,515);this.controls.target.set(0,0,4);}
 setSelectedPlaces(a,b,building){for(const {el,p} of this.labels){el.classList.toggle('start',building&&p.id===a);el.classList.toggle('end',building&&p.id===b);el.classList.toggle('pickable',building);}}
 setQuality(high){this.renderer.setPixelRatio(Math.min(devicePixelRatio,high?1.7:1));this.renderer.shadowMap.enabled=high;this.scene.traverse(o=>{if(o.material)o.material.needsUpdate=true;});}
 update(s,dt){this.clock+=dt;this.syncGrowth(s);for(let i=this.growingBuildings.length-1;i>=0;i--){const b=this.growingBuildings[i];const next=Math.min(b.target,b.house.scale.x+dt*b.target*.9);b.house.scale.setScalar(next);if(next>=b.target)this.growingBuildings.splice(i,1);}this.clouds.position.x=Math.sin(this.clock*.005)*15;this.ripples.material.opacity=.22+Math.sin(this.clock*.7)*.07;
  const phase=calendarTime(s)/1200*Math.PI*2,light=1+Math.sin(phase)*.18;this.sun.intensity=3.1*light;this.sun.color.setHSL(.105+Math.sin(phase)*.025,.45,.83);
  for(let i=0;i<this.birds.length;i++){const b=this.birds[i],t=this.clock*.14+i*.8;b.position.set(-38+Math.cos(t)*20,24+i*.9,-12+Math.sin(t)*14);b.rotation.y=-t;b.rotation.z=Math.sin(this.clock*4+i)*.2;}
  for(const t of s.trains){const v=this.trains.get(t.id),track=this.routes.get(t.route);if(!v||!track)continue;const curve=track.curve,len=curve.getLength();
   // The consist stays within its platform at each end; it reverses as a push-pull service.
   const span=(v.cars.length-1)*3.15,margin=3;const lead=margin+(len-2*margin-span)*t.t+span;
   v.cars.forEach((o,i)=>{const u=THREE.MathUtils.clamp((lead-i*3.15)/len,0,1);o.position.copy(curve.getPointAt(u));o.position.y=.7;const tangent=curve.getTangentAt(u);o.rotation.y=Math.atan2(tangent.x,tangent.z);});
   if(this.follow===t.id){const p=v.cars[0].position,delta=p.clone().sub(this.controls.target);this.camera.position.add(delta);this.controls.target.copy(p);}
  }
  this.smokeClock+=dt;if(this.smokeClock>.24){this.smokeClock=0;for(const t of s.trains){const v=this.trains.get(t.id);if(!v||!s.started||!s.speed||t.dwell>0)continue;const puff=new THREE.Mesh(new THREE.IcosahedronGeometry(.3,1),new THREE.MeshBasicMaterial({color:'#e9e6d6',transparent:true,opacity:.34,depthWrite:false}));puff.position.copy(v.cars[0].position);puff.position.y+=1.6;this.scene.add(puff);this.smoke.push({o:puff,age:0});}}
  for(let i=this.smoke.length-1;i>=0;i--){const p=this.smoke[i];p.age+=dt;p.o.position.y+=dt*.9;p.o.position.x+=dt*.4;p.o.scale.setScalar(1+p.age*.8);p.o.material.opacity=Math.max(0,.3-p.age*.07);if(p.age>4.3){this.scene.remove(p.o);p.o.geometry.dispose();p.o.material.dispose();this.smoke.splice(i,1);}}
  this.updateLiving(s,dt);this.controls.update();const v=new V(),compact=this.camera.position.distanceTo(this.controls.target)>480;for(const {el,p}of this.labels){v.set(p.x,4.3,p.z).project(this.camera);const visible=v.z<1&&v.z>-1&&Math.abs(v.x)<1.15&&Math.abs(v.y)<1.15;el.hidden=!visible;el.classList.toggle('compact',compact&&p.kind!=='City'&&!el.classList.contains('start')&&!el.classList.contains('end'));el.style.transform='translate(-50%, -100%) translate('+((v.x*.5+.5)*innerWidth)+'px,'+((-v.y*.5+.5)*innerHeight)+'px)';}
  this.renderer.render(this.scene,this.camera);
 }
}

Object.assign(World.prototype,livingWorldMethods);
