# Valley Railway

A slow-paced 3D railway company game set in a fictional countryside in 1890. Original locomotive, carriages, station, buildings, and pine assets were authored in the live Blender instance through Blender MCP and exported to GLB.

## Play

On Windows, double-click **START GAME.cmd**. It starts a local Vite server and opens the game in your browser. Keep its terminal open while playing. Close the terminal to stop the server.

Alternatively, run `npm install` once, then `npm run dev` and open the URL printed by Vite. Node.js 22.12+ is recommended. The game requires WebGL2. Open through the server rather than opening index.html directly. Dependencies are already installed in this workspace.

## Your company

- Begin with £12,000 and an operating Elmford–Willowbrook passenger train. A saved company that has already earned money keeps its balance; untouched starting saves move to the lower balance.
- The enlarged region contains **42 places** across a map roughly three times wider than the original valley. The calendar now advances 80% slower: a day takes ten real minutes at 1×, or five minutes at 2×. Train travel and production keep their existing pace. Existing saves retain their current calendar date. The starter train's first journey is roughly half a minute; long distance routes take longer.
- Build curved lines by opening Build railway, clicking the first place on the map, and then clicking the second. Adjust the curve slider and lay the track. One endpoint must join the existing network. Construction includes river bridges where needed.
- Each track is reserved by one train. A train may serve 2–10 ordered stops over connected tracks; unused extensions can join its route without buying another engine. Choose passenger, freight, or mixed service on the train panel. Mixed consists use both passenger coaches and freight wagons when both kinds of traffic are available. You can select a preferred cargo or let the train choose among matching loads. Changes take effect at the next loading stop.
- Populated places send passengers and mail. Passengers can also commute to industries, while mail travels between populated places. Mills and factories still deliver their products to their customers.
- Trains follow their stopping plan automatically and reverse at its ends. Shipments have an origin and final destination, transfer at intermediate stations, and earn money only at final delivery. Routing uses active compatible train services. Delivery profit now receives a further **30% reduction** after the earlier 25% cut; grants and request rewards are unchanged. Empty returns have no fee, so low supplies cannot bankrupt the company.
- Supplying a town with passengers, mail, flour, or goods earns growth points. At three milestones it gains visible buildings, residents and a faster replenishing passenger queue. Food and goods grow towns fastest.
- The Company panel shows three ongoing local delivery requests. Deliver the listed cargo to the named place to earn an automatic cash reward. Completed requests are replaced, and there are no deadlines.
- Upgrade engines to the distinct Blender-designed Valley Express and Highland Pacific, attach up to four carriages, overhaul running costs, improve track, and expand stations. All three engine classes now travel faster.
- Complete community grants with no deadline. Claim earned grants in Company.
- Saves use localStorage under `valley-railway-v1`, every 20 simulation seconds and after purchases. Existing company saves gain the new industries, projects, stopping plans, transfer depots, and customisation without losing their routes or trains. In-flight legacy loads keep their original destination. Highland Quarry has moved west off the river; its connected tracks follow the updated position. Use the same browser and server address to retain the same save. Clearing browser storage removes progress. Simulation stops while the tab is hidden or closed.

## Supply chains

| Source | Cargo | Customer |
| --- | --- | --- |
| Villages, towns, city | Passengers | Other populated places and workplaces |
| Villages, towns, city | Mail | Other populated places |
| Golden Fields | Grain | Riverbend Mill |
| Riverbend Mill | Flour | Villages, towns, city |
| Pinewood | Timber | Ashford Works |
| Highland Quarry | Ore | Northbank Foundry |
| Northbank Foundry | Steel | Ashford Works |
| Ashford Works | Goods | Villages, towns, city |
| Blackstone Colliery | Coal | Towns and foundries (optional 50% production boost) |
| Clover Dairy | Milk | Populated places |
| Oak & Sons Workshop | Furniture (requires timber) | Populated places and Highland Resort construction |
| Reedwater Fishery | Fish | Populated places |
| Newhaven Harbour, once completed | Fish | Populated places |

Furniture workshops consume timber. Foundries still run on ore alone; coal makes them faster. Factories need both timber and steel to produce goods. Mills and foundries consume their respective inputs. Production pauses when inputs are unavailable or storage is full. Connect customers and factories to your network first, then extend to their suppliers.

## Living Valley expansion

- **Multi-stop services:** Lay connected track, open **Trains → your train → Multi-stop route**, append stops, and save. Neighbouring stops require track; plans take effect at the next platform departure. A second train cannot reserve the same segment. Remove or reorder stops to release track after the new plan activates.
- **Transfers:** A shipment follows the shortest available compatible service path. A train may unload it into a depot and pick it back up on its next leg, or another train may carry it. Station panels show the final destination of waiting batches. Changing a service can leave cargo waiting until a compatible connection returns; it is retained in the local save.
- **Station life:** Blender-authored passengers, porters, lamps, and crates appear close to stations. Passenger and crate counts reflect waiting stock; porters carry crates while trains board. Floating departure boards and station-panel boards show services.
- **Seasons:** Spring, summer, autumn and winter each last 12 game days. Terrain and foliage change, with snowy ground and selected roofs in winter. Clear, overcast, rain and snow weather cycles change the sky and precipitation. Rain reduces speed 7%; snow 15%. Summer passenger and food traffic, autumn grain, and winter coal and mail have seasonal production/fare modifiers.
- **Personalisation:** Name engines and choose forest, burgundy, navy, or ochre liveries. Set a company colour in Company; individual trains can inherit or override it. Buy a sleeper carriage (£3,800, 25% long-journey passenger bonus, 6 fewer seats), dining carriage (£3,200, 15% passenger bonus, 4 fewer seats), or mail van (£2,600, 16 more mailbags, 20% mail bonus). Previously bought types can be refitted free.
- **Newhaven Harbour:** Start for £4,500, then deliver 100 timber, 70 steel and 45 goods. Opening grants £14,000, produces fish, and accepts passengers, mail and supplies.
- **Highland Resort:** Start for £3,500, then deliver 90 timber, 40 steel and 60 furniture. Opening grants £12,000 and creates passenger/mail traffic with summer and winter tourist peaks.
- **Safe expansion:** Buildings use their full footprints to avoid railway clearances, rivers, platforms, and neighbouring buildings. Laying a new track relocates conflicting buildings to safe nearby plots. Growth reconstructed from old saves uses the same placement rules.

## Controls

- Left drag: pan. Right drag: orbit. Wheel: zoom.
- Touch: one finger orbits, two fingers pan and zoom.
- Click a place to inspect supply and upgrade its station. While Build railway is open, two place clicks select the two ends of a new line. Zoom in to reveal every place name; distant map markers remain clickable.
- Click a locomotive, or select Trains, to manage it and ride along.
- B: construction. T: fleet. C: company. M: overview.
- Space: pause/resume. H: hide the interface for scenic view. Escape: close panel and stop following.
- The music button enables a quiet synthesized ambient chord. Sound starts only after a click.
- The handbook has a lower graphics option and manual save.

## Project

- `src/simulation.js`: places, purchases, local requests, grants and saves.
- `src/network.js`: multi-stop scheduling, transfer routing, production, delivery earnings, projects and migration.
- `src/expansion-data.js` / `src/expansion-ui.js`: industries, seasons, carriage choices and expansion controls.
- `src/living-world.js`: safe building placement, station activity, project visuals and weather.
- `src/world.js`: terrain, water, lighting, vegetation, town expansion, track geometry, train motion and camera.
- `src/main.js` / `src/style.css`: interface and controls.
- `public/models/`: thirty original Blender exports with embedded materials.
- `art/valley-railway.blend`, `art/valley-railway-expansion.blend`, and `art/living-valley.blend`: editable model workshops.
- `tools/create_models.py`, `tools/create_expansion.py`, and `tools/create_living_valley.py`: reproducible Blender authoring scripts, designed for execution inside Blender via MCP.

The setting uses greener grass, a wider landscape, varied trees, houses and industrial buildings, soft shadows, a winding river, distant hills, fields, forest instancing, moving clouds, birds, locomotive steam and a slow lighting cycle. No paid or downloaded model libraries were used. Fonts load from Google Fonts if online, with local serif/sans-serif fallbacks.

## Verification status

As explicitly requested, the game was **not launched, built, browser-tested, or gameplay-tested**. Blender model creation, export, scene inspection, and a Blender viewport inspection were performed. The Living Valley additions and placement/earnings changes are also unbuilt and untested. The 13 new models were created and exported through the live Blender MCP connection, and inspected in its viewport. Gameplay and browser rendering remain unverified.
