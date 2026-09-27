"""Additional hand-authored railway models. Execute inside live Blender via MCP."""
import bpy, math, os
from mathutils import Quaternion

ROOT = r'C:\Users\hamze\Home\Desktop\Folder_1\Train Game'
OUT = os.path.join(ROOT, 'public', 'models')
os.makedirs(OUT, exist_ok=True)
scene = bpy.data.scenes.new('Valley Railway Expansion')
bpy.context.window.scene = scene
materials = {}
colors = {
 'midnight':((.035,.10,.19),.4),'navy':((.045,.19,.33),.35),'maroon':((.27,.055,.075),.35),
 'black':((.038,.047,.048),.6),'steel':((.24,.28,.28),.65),'brass':((.62,.37,.12),.75),
 'ivory':((.86,.80,.65),0),'glass':((.11,.28,.32),.2),'brick':((.47,.17,.12),0),
 'plaster':((.73,.66,.48),0),'tile':((.18,.23,.25),0),'timber':((.25,.12,.065),0),
 'straw':((.60,.49,.22),0),'leaf':((.105,.31,.125),0),'leaflight':((.24,.43,.16),0),
 'bark':((.22,.16,.11),0),'birchbark':((.80,.79,.66),0),'stone':((.45,.46,.40),0)
}
for name,(rgb,metal) in colors.items():
 m=bpy.data.materials.new('VR '+name);m.use_nodes=True;m.diffuse_color=(*rgb,1)
 n=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
 n.inputs['Base Color'].default_value=(*rgb,1);n.inputs['Metallic'].default_value=metal;n.inputs['Roughness'].default_value=.55 if metal else .8
 materials[name]=m
parts=[]
def add(obj,name,mat):
 obj.name=name;obj.data.materials.append(materials[mat]);parts.append(obj);return obj
def box(name,loc,size,mat,bevel=.045):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=size
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  mod=o.modifiers.new('Soft edges','BEVEL');mod.width=bevel;mod.segments=2
 return add(o,name,mat)
def cylinder(name,loc,r,depth,mat,rot=(0,0,0),top=None,vertices=24):
 if top is None:bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=depth,location=loc,rotation=rot)
 else:bpy.ops.mesh.primitive_cone_add(vertices=vertices,radius1=r,radius2=top,depth=depth,location=loc,rotation=rot)
 o=add(bpy.context.object,name,mat)
 for face in o.data.polygons:face.use_smooth=True
 return o
def ball(name,loc,scale,mat):
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=1,location=loc);o=bpy.context.object;o.scale=scale;return add(o,name,mat)
def roof(x,y,z,w,d,h,mat):
 verts=[(x-w/2,y-d/2,z),(x+w/2,y-d/2,z),(x+w/2,y+d/2,z),(x-w/2,y+d/2,z),(x,y-d/2,z+h),(x,y+d/2,z+h)]
 mesh=bpy.data.meshes.new('Gabled roof');mesh.from_pydata(verts,[],[(0,1,4),(3,5,2),(0,4,5,3),(1,2,5,4),(0,3,2,1)]);mesh.update()
 o=bpy.data.objects.new('Gabled roof',mesh);scene.collection.objects.link(o);return add(o,'Gabled roof',mat)
def wheels(ys,r):
 for y in ys:
  for x in (-.84,.84):
   cylinder('Driving wheel',(x,y,.55),r,.18,'black',(0,math.pi/2,0))
   cylinder('Wheel hub',(x*1.12,y,.55),r*.31,.024,'brass',(0,math.pi/2,0))
 box('Chassis',(0,0,.78),(1.92,max(ys)-min(ys)+1.4,.3),'steel')
 for x in (-1.02,1.02):box('Connecting rod',(x,0,.55),(.08,max(ys)-min(ys),.08),'brass')
def export(name,offset):
 bpy.ops.object.select_all(action='DESELECT')
 for o in parts:
  bpy.context.view_layer.objects.active=o;o.select_set(True)
  for mod in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
  o.select_set(False)
 groups={key:[o for o in parts if o.data.materials and o.data.materials[0]==m] for key,m in materials.items()}
 exported=[]
 for key,group in groups.items():
  if not group:continue
  if len(group)>1:
   for o in group:o.select_set(True)
   bpy.context.view_layer.objects.active=group[0];bpy.ops.object.join()
  group[0].name=name+'_'+key;exported.append(group[0]);bpy.ops.object.select_all(action='DESELECT')
 for o in exported:o.select_set(True)
 bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,name+'.glb'),export_format='GLB',use_selection=True,export_animations=False)
 bpy.ops.object.select_all(action='DESELECT')
 for o in exported:o.location.x+=offset[0];o.location.y+=offset[1]
 parts.clear()

# Valley Express: long midnight-blue 4-6-2 with brass bands, broad driving wheels and glazed cab.
wheels((-1.6,-.45,.7),.56)
for y in (-2.65,1.85):
 for x in (-.81,.81):cylinder('Pilot wheel',(x,y,.42),.32,.16,'black',(0,math.pi/2,0))
cylinder('Express boiler',(0,-.9,1.65),.71,3.7,'navy',(math.pi/2,0,0))
cylinder('Smokebox',(0,-2.78,1.65),.72,.5,'black',(math.pi/2,0,0))
for y in (-2.3,-1.25,-.2):cylinder('Polished boiler band',(0,y,1.65),.727,.075,'brass',(math.pi/2,0,0))
cylinder('Chimney',(0,-2.1,2.64),.22,.88,'black',top=.28)
cylinder('Dome',(0,-.2,2.42),.32,.36,'brass')
box('Large glazed cab',(0,1.56,1.8),(1.95,1.8,1.85),'midnight');box('Cab roof',(0,1.58,2.81),(2.17,2.03,.18),'black',.12)
for x in (-1,1):
 box('Cab side window',(x,1.55,2.16),(.04,.92,.65),'glass')
 box('Cream handrail',(x,-.93,1.36),(.045,3.5,.07),'ivory')
box('Express pilot',(0,-3.13,.7),(2.2,.24,.3),'maroon')
cylinder('Large headlamp',(0,-3.1,1.84),.19,.14,'ivory',(math.pi/2,0,0))
export('locomotive_express',(0,0))

# Highland Pacific: distinct maroon streamlined silhouette and larger paired steam domes.
wheels((-1.8,-.6,.6,1.8),.62)
for y in (-2.72,2.65):
 for x in (-.8,.8):cylinder('Pilot wheel',(x,y,.45),.32,.17,'black',(0,math.pi/2,0))
cylinder('Pacific boiler',(0,-.75,1.78),.77,4.35,'maroon',(math.pi/2,0,0))
cylinder('Tapered streamlining',(0,-3.1,1.78),.76,.68,'maroon',(math.pi/2,0,0),top=.53)
for y in (-2.3,-.2,1.2):cylinder('Streamline band',(0,y,1.78),.784,.085,'brass',(math.pi/2,0,0))
for y in (-1.9,.65):cylinder('Steam dome',(0,y,2.63),.26,.55,'brass')
cylinder('Broad chimney',(0,-2.35,2.75),.26,.96,'black',top=.34)
box('Tall Pacific cab',(0,2.28,1.88),(2.1,1.83,2),'maroon');box('Sweep roof',(0,2.26,2.98),(2.34,2.12,.2),'black',.1)
for x in (-1.07,1.07):
 box('Cab glazing',(x,2.24,2.24),(.04,.94,.7),'glass')
 box('Ivory running stripe',(x,-.6,1.30),(.045,5.25,.1),'ivory')
box('Pacific front',(0,-3.55,.78),(2.25,.23,.36),'black')
cylinder('Central lantern',(0,-3.56,1.9),.23,.16,'ivory',(math.pi/2,0,0))
export('locomotive_pacific',(10,0))

# Taller masonry townhouses, farmstead and industrial structures make each district distinct.
box('Townhouse',(0,0,2.15),(3.4,3.2,4.3),'brick');roof(0,0,4.3,3.9,3.65,1.14,'tile')
for floor in (1.45,3.05):
 for x in (-.95,.95):box('Sash window',(x,-1.63,floor),(.63,.08,.93),'glass')
box('Town door',(0,-1.67,.95),(.74,.08,1.85),'timber')
box('Stone lintel',(0,-1.71,1.94),(1.1,.25,.15),'ivory')
box('Chimney',(.8,.35,5.4),(.48,.5,2),'brick')
export('townhouse',(0,12))

box('Farmhouse',(0,0,1.45),(4.1,3.5,2.9),'plaster');roof(0,0,2.9,4.55,4,1.23,'tile')
box('Stable lean-to',(2.7,.45,1.1),(2.2,2.6,2.2),'timber');roof(2.7,.45,2.2,2.4,2.9,.8,'straw')
box('Farm door',(-.15,-1.79,.92),(.76,.08,1.8),'timber')
for x in (-1.26,1.15):box('Farm window',(x,-1.79,1.77),(.65,.08,.7),'glass')
cylinder('Grain silo',(-3.2,1.1,2.05),.68,4.1,'stone');cylinder('Silo roof',(-3.2,1.1,4.3),.78,.75,'tile',top=0)
export('farmhouse',(9,12))

box('Warehouse hall',(0,0,1.75),(7.4,5.1,3.5),'timber');roof(0,0,3.5,8.1,5.8,1.35,'tile')
for x in (-2.35,0,2.35):box('Loading bay',(x,-2.61,1.35),(1.38,.08,2.6),'black')
for y in (-1.4,.1,1.5):box('Roof skylight',(0,y,4.41),(.85,.7,.06),'glass')
for x in (-3.5,3.5):box('White corner trim',(x,-2.58,1.8),(.16,.14,3.55),'ivory')
export('warehouse',(18,12))

box('Quarry entrance',(0,0,1.8),(6,4.5,3.6),'stone');roof(0,0,3.6,6.4,5,1.25,'black')
box('Dark mine opening',(0,-2.32,1.5),(2.6,.1,2.9),'black')
for x in (-1.45,1.45):box('Mine support',(x,-2.46,1.72),(.2,.28,3.45),'timber')
box('Mine lintel',(0,-2.48,3.44),(3.1,.3,.27),'timber')
for x in (-2.35,2.35):box('Ore cart',(x,-3.5,.55),(.9,1.3,.7),'steel')
box('Pit wheel tower',(3.55,0,3.65),(.42,.48,6.8),'timber')
cylinder('Hoist wheel',(3.55,-.1,6.83),.9,.2,'steel',(0,math.pi/2,0))
export('quarry',(28,12))

box('Foundry hall',(0,0,2.1),(8,5.5,4.2),'brick');roof(0,0,4.2,8.5,6.1,1.45,'black')
for x in (-2.6,-1.3,0,1.3,2.6):box('Foundry window',(x,-2.78,3.02),(.7,.08,1.2),'glass')
box('Iron doors',(0,-2.85,1.4),(2.35,.08,2.7),'steel')
for x,y,r,h in ((4.8,1,.43,9),(5.8,-1,.32,7),(-4.9,1,.39,6)):
 cylinder('Smoke stack',(x,y,h/2),r,h,'brick',top=r*.81)
 for z in (1,h*.5,h-.3):cylinder('Stack band',(x,y,z),r*1.03,.13,'ivory')
export('foundry',(39,12))

cylinder('Oak trunk',(0,0,2.2),.34,4.4,'bark',top=.25)
for x,y,z,scale,mat in [(-1.4,0,4.4,(1.9,1.8,1.7),'leaf'),(1.4,.2,4.6,(1.9,1.7,1.65),'leaflight'),(0,-1.2,5.4,(2,2,1.75),'leaf'),(0,1.2,5.2,(1.8,1.9,1.65),'leaflight'),(0,0,6.25,(1.9,1.8,1.4),'leaf')]:ball('Oak canopy',(x,y,z),scale,mat)
export('oak',(49,12))

cylinder('Silver trunk',(0,0,2.8),.18,5.6,'birchbark',top=.13)
for z in (.9,2.0,3.2,4.1):box('Bark fleck',(.17,0,z),(.04,.25,.07),'black')
for x,y,z,scale,mat in [(-.8,0,4.3,(1.05,.95,1.2),'leaflight'),(.8,.2,4.7,(1.1,1.1,1.25),'leaf'),(0,-.5,5.5,(1.25,1.15,1.35),'leaflight'),(.2,.3,6.5,(.85,.9,1.1),'leaf')]:ball('Birch canopy',(x,y,z),scale,mat)
export('birch',(58,12))

for area in bpy.context.screen.areas:
 if area.type=='VIEW_3D':
  area.spaces.active.region_3d.view_location=(28,7,2)
  area.spaces.active.region_3d.view_distance=72
  area.spaces.active.region_3d.view_rotation=Quaternion((.82,.42,.18,.32)).normalized()
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'art','valley-railway-expansion.blend'))
print('Created 9 additional Blender models in Valley Railway Expansion.')
