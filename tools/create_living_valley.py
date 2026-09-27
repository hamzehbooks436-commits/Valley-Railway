"""Run in live Blender through MCP. Preserve prior workshop scenes."""
from pathlib import Path
ROOT = r'C:\Users\hamze\Home\Desktop\Folder_1\Train Game'
helpers = (Path(ROOT)/'tools/create_expansion.py').read_text(encoding='utf-8').split('# Valley Express:')[0]
exec(helpers.replace("scenes.new('Valley Railway Expansion')", "scenes.new('Living Valley Workshop')"))

def windows(width=5,depth=4,z=2):
 for x in (-width*.32,0,width*.32):box('Glazed front window',(x,-depth/2-.03,z),(.65,.08,.9),'glass')

# New industries have their own recognizable silhouettes and loading facilities.
box('Coal winding house',(-2,0,1.65),(3.3,3.4,3.3),'brick');roof(-2,0,3.3,3.7,3.8,1,'tile')
for x in (1,3.6):
 for y in (-1.3,1.3):box('Headframe leg',(x,y,3.5),(.25,.25,7),'steel')
box('Winding platform',(2.3,0,6),(3.4,3.2,.3),'steel')
for x in (1.7,2.9):cylinder('Winding wheel',(x,0,7),.9,.18,'black',(0,math.pi/2,0))
for i in range(5):ball('Coal heap',(-1+i*.8,-3,.6),(.8,.8,.65),'black')
export('coal_mine',(0,0))

box('Dairy barn',(0,0,1.8),(6,4,3.6),'ivory');roof(0,0,3.6,6.6,4.7,1.8,'maroon');windows(6,4)
for x in (-3.8,-4.8):cylinder('Milk silo',(x,.8,2),.48,4,'steel');cylinder('Silo lid',(x,.8,4),.49,.35,'steel',top=0)
for x in (-1.2,-.4,.4,1.2):cylinder('Milk churn',(x,-2.8,.45),.25,.9,'steel');cylinder('Churn lid',(x,-2.8,.94),.27,.09,'ivory')
export('dairy_farm',(15,0))

box('Joinery workshop',(0,0,1.8),(6,4,3.6),'timber');roof(0,0,3.6,6.6,4.6,1.4,'tile');windows(6,4)
for i in range(5):box('Timber stack',(4,-.5,.2+i*.3),(2.4,3,.22),'straw')
box('Finished table',(0,-3.2,1.05),(1.8,1,.13),'timber')
for x in (-.7,.7):
 for y in (-3.55,-2.85):box('Table leg',(x,y,.5),(.13,.13,1),'timber')
export('furniture_workshop',(30,0))

box('Fish market',(0,0,1.5),(4.5,3.6,3),'plaster');roof(0,0,3,5,4,1.4,'navy');windows(4.5,3.6)
for x in (-1.5,0,1.5):
 box('Fish crate',(x,-2.7,.4),(1.1,.8,.6),'timber')
 for y in (-2.8,-2.55):ball('Silver fish',(x,y,.75),(.4,.1,.07),'steel')
box('Boat hull',(3,0,.35),(1.2,3.6,.65),'timber',.3);box('Boat seat',(3,0,.7),(1.3,.4,.12),'ivory')
export('fishery',(45,0))

box('Harbour warehouse',(0,0,2),(8,5,4),'brick');roof(0,0,4,8.6,5.6,1.6,'tile');windows(8,5,2.6)
box('Loading doors',(0,-2.55,1.25),(2.3,.12,2.5),'timber')
box('Quayside crane tower',(5,0,3),(.55,.55,6),'steel');box('Crane jib',(3.8,0,6),(4,.35,.35),'steel')
cylinder('Suspended rope',(2,0,4.8),.035,2.4,'black');box('Crane load',(2,0,3.25),(1.2,1,1),'timber')
export('harbour_terminal',(0,16))

box('Mountain hotel',(0,0,3),(10,6,6),'ivory');roof(0,0,6,11,7,2.3,'maroon')
for z in (2,4.5):windows(10,6,z)
box('Hotel porch',(0,-4,2.9),(5,2.5,.3),'timber')
for x in (-2.2,2.2):box('Porch post',(x,-4.8,1.5),(.18,.18,3),'timber')
box('Resort entrance',(0,-3.06,1.1),(1.4,.12,2.2),'timber')
for x in (-4,4):box('Stone chimney',(x,1,7),(.7,.8,3),'stone')
export('resort_hotel',(18,16))

# Match the existing 5.5 m carriage scale and material names for livery overrides.
for number,kind in enumerate(('sleeper','dining','mail')):
 for y in (-1.9,1.9):
  for x in (-.85,.85):cylinder('Carriage wheel',(x,y,.52),.42,.18,'black',(0,math.pi/2,0))
 box('Chassis',(0,0,.8),(1.9,5.5,.28),'steel')
 box('Carriage livery',(0,0,1.7),(1.95,5.3,1.65),'navy' if kind=='sleeper' else 'maroon')
 box('Cream upper band',(0,0,2.1),(1.99,5.2,.7),'ivory');box('Roof',(0,0,2.65),(2.15,5.65,.3),'black',.13)
 for x in (-1,1):
  for y in (-1.8,-.9,0,.9,1.8):
   if kind=='mail' and abs(y)<1:continue
   box('Compartment window',(x,y,2.1),(.035,.62,.5),'glass')
   if kind=='sleeper':box('Curtain',(x*1.02,y-.2,2.1),(.03,.17,.5),'straw')
   if kind=='dining':box('Table lamp',(x*1.02,y,1.99),(.035,.13,.18),'straw')
  if kind=='mail':box('Mail sliding door',(x*1.01,0,1.75),(.06,1.5,1.55),'navy');box('Postal stripe',(x*1.05,0,1.7),(.03,1.3,.13),'brass')
  else:box('Gold stripe',(x,0,1.25),(.03,5.2,.08),'brass')
 export('coach_'+kind,(number*11,33))

for number,kind in enumerate(('passenger','porter')):
 for x in (-.12,.12):box('Boot',(x,-.05,.09),(.18,.32,.18),'black');box('Trouser leg',(x,0,.4),(.16,.18,.6),'navy')
 box('Coat',(0,0,.92),(.48,.3,.55),'maroon' if kind=='passenger' else 'navy')
 ball('Face',(0,0,1.38),(.17,.16,.2),'plaster');cylinder('Hat',(0,0,1.57),.23,.12,'black')
 for x in (-.31,.31):box('Sleeve',(x,0,.91),(.14,.18,.5),'maroon' if kind=='passenger' else 'navy')
 if kind=='passenger':box('Suitcase',(.4,0,.47),(.23,.4,.38),'timber')
 else:box('Carried crate',(0,-.36,.84),(.64,.5,.48),'straw')
 export(kind,(number*4+36,33))

cylinder('Lamp post',(0,0,1.6),.065,3.2,'black');box('Lantern',(0,0,3.3),(.4,.4,.55),'straw');roof(0,0,3.6,.5,.5,.25,'black')
export('platform_lamp',(46,33))
box('Crate',(0,0,.4),(.8,.8,.8),'timber')
for z in (.1,.7):box('Crate band',(0,-.41,z),(.85,.04,.08),'brass')
export('platform_crate',(50,33))

for area in bpy.context.screen.areas:
 if area.type=='VIEW_3D':
  area.spaces.active.region_3d.view_location=(22,15,2)
  area.spaces.active.region_3d.view_distance=79
  area.spaces.active.region_3d.view_rotation=Quaternion((.82,.42,.18,.32)).normalized()
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'art','living-valley.blend'))
print('Exported 13 Living Valley models and saved the editable workshop.')
