## Map Component

- Summary
  - The map itself uses `react-leaflet` package for generating the map https://react-leaflet.js.org/. Look at `components/map/Map`
  - The map displays any country-level outages (country topographical data provided by `getTopoAction` action in the `data/ActionTopo` file) that have occurred in the provided time range using summary data provided from the `searchSummary` action in the `data/ActionOutages` file. 
  - The `getMapScores()` method available in each parent component returns a map-friendly formatted object that is available in state to populate outage information on the map.
  - The user has the ability to click on an entity in the map and be taken to the specific entity page in the `handleEntityShapeClick()` function.

- States Tracked
	hoverName: - string of the hovered entity in the map, renders in legend
    hoverScore: - outage score given to a hovered entity, renders in legend
    hoverTooltipDisplay - A boolean scoped for each feature, true means that particular tooltip content should display
    screenWidthBelow680 - A boolean to track screen size at a particular breakpoint. Will trigger a more zoomed out map for smaller screens.

- Features
	Each feature, or entity outline, has a mouseover, mouseout, and click function affiliated with it for displaying it's particular legend, or for clicking the entity to link to that entity's page.