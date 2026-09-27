"""Original Valley Railway asset workshop. Execute inside Blender through MCP."""
import bpy, math, os
from mathutils import Quaternion
ROOT = r'C:\Users\hamze\Home\Desktop\Folder_1\Train Game'
os.makedirs(os.path.join(ROOT, 'public', 'models'), exist_ok=True)
os.makedirs(os.path.join(ROOT, 'art'), exist_ok=True)
scene = bpy.data.scenes.new('Valley Railway Workshop')
bpy.context.window.scene = scene
M = {}
def mat(name, color, metal=0, rough=.65):
    m=bpy.data.materials.new(name); m.use_nodes=True; m.diffuse_color=(*color,1)
    n=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    n.inputs['Base Color'].default_value=(*color,1); n.inputs['Metallic'].default_value=metal; n.inputs['Roughness'].default_value=rough
    M[name]=m
for n,c,metal in [('green',(.045,.19,.13),.4),('cream',(.85,.76,.53),0),('brass',(.64,.39,.12),.75),('iron',(.055,.066,.063),.65),('glass',(.13,.30,.32),.3),('red',(.43,.105,.055),0),('roof',(.105,.15,.155),.15),('stone',(.44,.43,.35),0),('wood',(.26,.13,.065),0),('plaster',(.72,.63,.45),0),('leaf',(.08,.23,.13),0),('leaflight',(.16,.34,.16),0)]: mat(n,c,metal)
parts=[]
def finish(o,name,m):
    o.name=name; o.data.materials.append(M[m]); parts.append(o); return o
def box(name,loc,size,m,bevel=.035):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc); o=bpy.context.object; o.scale=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Soft manufactured edges','BEVEL'); mod.width=bevel; mod.segments=2
    return finish(o,name,m)
def cyl(name,loc,r,depth,m,rot=(0,0,0),r2=None):
    if r2 is None: bpy.ops.mesh.primitive_cylinder_add(vertices=20,radius=r,depth=depth,location=loc,rotation=rot)
    else: bpy.ops.mesh.primitive_cone_add(vertices=12,radius1=r,radius2=r2,depth=depth,location=loc,rotation=rot)
    o=finish(bpy.context.object,name,m)
    for p in o.data.polygons: p.use_smooth=True
    return o
def roof(x,y,z,w,d,h,m='roof'):
    verts=[(x-w/2,y-d/2,z),(x+w/2,y-d/2,z),(x+w/2,y+d/2,z),(x-w/2,y+d/2,z),(x,y-d/2,z+h),(x,y+d/2,z+h)]
    mesh=bpy.data.meshes.new('Gabled roof'); mesh.from_pydata(verts,[],[(0,1,4),(3,5,2),(0,4,5,3),(1,2,5,4),(0,3,2,1)]);mesh.update()
    o=bpy.data.objects.new('Gabled roof',mesh); scene.collection.objects.link(o);finish(o,'Gabled roof',m)
def wheels(length=4):
    for y in [-length*.32,length*.32]:
        for x in [-.82,.82]:
            cyl('Wheel', (x,y,.52),.43,.19,'iron',(0,math.pi/2,0))
            cyl('Brass hub',(x*1.13,y,.52),.17,.025,'brass',(0,math.pi/2,0))
    box('Underframe',(0,0,.78),(1.8,length,.22),'iron')
    for y in [-length/2-.22,length/2+.22]:box('Coupling',(0,y,.64),(.32,.5,.16),'iron')
def export(name,offset):
    bpy.ops.object.select_all(action='DESELECT')
    # Join by material for efficient runtime draw calls; bevels are baked.
    for o in parts:
        bpy.context.view_layer.objects.active=o; o.select_set(True)
        for mod in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
        o.select_set(False)
    groups={key:[o for o in parts if o.data.materials and o.data.materials[0]==m] for key,m in M.items()}
    for key,obs in groups.items():
        if not obs:continue
        for o in obs:o.select_set(True)
        bpy.context.view_layer.objects.active=obs[0];bpy.ops.object.join();obs[0].name=name+'_'+key
        bpy.ops.object.select_all(action='DESELECT')
    obs=[o for o in scene.objects if o.name.startswith(name+'_')]
    for o in obs:o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'public','models',name+'.glb'),export_format='GLB',use_selection=True,export_animations=False)
    for o in obs:o.location.x+=offset[0];o.location.y+=offset[1]
    parts.clear()
# Coordinates: Blender -Y is the train's front, exported as Three.js +Z.
wheels(5.4)
cyl('Boiler',(0,-.75,1.6),.72,2.8,'green',(math.pi/2,0,0))
for y in [-1.85,-.9,.1]:cyl('Boiler band',(0,y,1.6),.743,.08,'brass',(math.pi/2,0,0))
cyl('Smokebox',(0,-2.18,1.6),.73,.3,'iron',(math.pi/2,0,0))
cyl('Chimney',(0,-1.8,2.62),.19,.95,'iron',r2=.29)
cyl('Steam dome',(0,-.25,2.36),.28,.46,'brass')
box('Cab',(0,1.45,1.73),(1.9,1.6,1.8),'green')
box('Cab roof',(0,1.42,2.75),(2.2,1.9,.19),'roof',.09)
for x in [-.96,.96]:
    box('Cab glass',(x,1.25,2.12),(.035,.85,.7),'glass')
    box('Livery',(x,1.4,1.35),(.045,1.5,.09),'brass')
    box('Piston rod',(x,-.7,.57),(.1,3.1,.12),'brass')
    for y in [-1.45,-.35,.75]:cyl('Driving wheel',(x*.9,y,.54),.51,.2,'iron',(0,math.pi/2,0))
box('Front buffer',(0,-2.8,.78),(2.0,.2,.3),'red')
cyl('Headlamp',(0,-2.44,1.95),.19,.16,'cream',(math.pi/2,0,0))
export('locomotive',(0,0))
wheels(5.5);box('Coach body',(0,0,1.65),(1.95,5.35,1.65),'green')
box('Cream window band',(0,0,2.08),(1.98,5.15,.74),'cream');box('Rounded roof',(0,0,2.62),(2.15,5.65,.28),'roof',.13)
for x in [-1,1]:
    for y in [-1.8,-.9,0,.9,1.8]:box('Passenger window',(x,y,2.1),(.025,.62,.5),'glass',.025)
    box('Gold stripe',(x,0,1.25),(.03,5.2,.07),'brass')
export('coach',(4,0))
wheels(4.8);box('Wagon floor',(0,0,.99),(1.9,4.6,.23),'wood')
for x in [-.94,.94]:
    box('Wagon side',(x,0,1.45),(.12,4.6,.85),'red')
    for y in [-2,-1,0,1,2]:box('Steel brace',(x*1.08,y,1.43),(.08,.1,.98),'iron')
for y in [-2.25,2.25]:box('End',(0,y,1.45),(1.9,.12,.85),'red')
for x in [-.48,.48]:
    for y in [-1.3,0,1.3]:box('Cargo crate',(x,y,1.5),(.8,1.05,.8),'wood')
export('freight',(8,0))
box('Platform',(0,0,.22),(8,5,.44),'stone');box('Station building',(0,.55,1.72),(5,2.7,3),'plaster');roof(0,.55,3.22,5.8,3.5,1.1)
for x in [-1.7,0,1.7]:box('Station window',(x,-.815,1.8),(.7,.04,1.2),'glass')
box('Station sign',(0,-.9,2.75),(2.4,.16,.4),'green')
box('Canopy',(0,-2,2.65),(7,1.8,.2),'roof')
for x in [-3,3]:cyl('Canopy post',(x,-2.5,1.4),.08,2.7,'iron')
box('Chimney',(1.7,.5,4),(.45,.5,1.8),'red')
export('station',(0,10))
box('Cottage',(0,0,1.5),(3.5,3.4,3),'plaster');roof(0,0,3,4,3.9,1.5,'red')
box('Door',(0,-1.72,.9),(.65,.08,1.8),'wood')
for x in [-1.1,1.1]:
    box('Window',(x,-1.72,1.9),(.7,.05,.9),'glass');box('Sill',(x,-1.82,1.42),(.85,.28,.12),'cream')
box('Chimney',(.9,.6,4),(.5,.6,2),'stone');export('cottage',(9,10))
box('Factory hall',(0,0,2.1),(7,5,4.2),'red');roof(0,0,4.2,7.5,5.5,1.4)
for x in [-2.6,-1.3,0,1.3,2.6]:
    box('Industrial glass',(x,-2.52,2.9),(.8,.05,1.4),'glass')
box('Loading door',(0,-2.55,1),(2,.1,1.9),'wood')
cyl('Tall brick chimney',(4.2,1,4.5),.55,9,'red',r2=.4)
for z in [1,4,7,8.8]:cyl('Chimney collar',(4.2,1,z),.57,.15,'stone')
for x in [-4.3,-5.5]:cyl('Silo',(x,1,2.2),.53,4.4,'cream')
export('factory',(18,10))
box('Mill body',(0,0,1.7),(4.5,4,3.4),'wood');roof(0,0,3.4,5,4.5,1.7,'roof')
for x in [-1.3,1.3]:box('Mill glass',(x,-2.02,2.1),(.7,.06,1),'glass')
cyl('Waterwheel',(2.6,0,1.7),1.65,.5,'wood',(0,math.pi/2,0))
for a in range(12):
    t=a*math.tau/12; o=box('Wheel paddle',(2.6,math.sin(t)*1.65,1.7+math.cos(t)*1.65),(.9,.28,.3),'wood');o.rotation_euler.x=-t
export('mill',(29,10))
cyl('Trunk',(0,0,1.7),.22,3.4,'wood')
for z,r,h,m in [(2.6,1.7,3.4,'leaf'),(3.8,1.35,2.8,'leaflight'),(4.9,.9,2.5,'leaf')]:cyl('Pine foliage',(0,0,z),r,h,m,r2=0)
export('pine',(36,10))
# Workshop camera framing, with original startup scene preserved separately.
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.region_3d.view_location=(15,5,1)
        area.spaces.active.region_3d.view_distance=48
        area.spaces.active.region_3d.view_rotation=Quaternion((.82,.42,.18,.32)).normalized()
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'art','valley-railway.blend'))
print('Created 8 original assets and saved Valley Railway workshop.')
