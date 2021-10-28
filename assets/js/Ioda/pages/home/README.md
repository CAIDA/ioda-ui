# IODA Home Page

## Current Features
- Search Bar
  - Uses a search bar component from https://www.npmjs.com/package/caida-components-library.
  - On each keystroke, a new api call is made to the `searchEntities` action in the `data/ActionEntities` file in the `getDataSuggestedSearchResults()` method.
  - The user has the ability to key up and down on the populated list, as well as hit enter to select an entity, or esc to close the search results box.
  - The user can also use the mouse to click and select an entity.
  - When a selection is made the search box is cleared.
- Map
  - The map itself uses `react-leaflet` package for generating the map https://react-leaflet.js.org/. Look at `components/map/Map`
  - The map displays any country-level outages (country topographical data provided by `getTopoAction` action in the `data/ActionTopo` file) that have occurred in the past 24 hours using summary data provided from the `searchSummary` action in the `data/ActionOutages` file. 
  - The `getMapScores()` method returns a map-friendly formatted object that is available in state to populate outage information on the map.
  - The user has the ability to click on an entity in the map and be taken to the specific entity page in the `handleEntityShapeClick()` function.
  - If no scores are available to display, the map will still populate without outages displaying.
- Twitter Feed
  - A twitter-developed react package called `react-twitter-embed`. The feed depicts the profile of @caida_ioda and language is defaulted to english (will need to be updated to be dynamic come time for internationalization).
- Project Description
  - Brief description of the ioda project taken from v1 description in the same place, with a button linking to dashboard.
- Outage Examples
  - Examples live in their own component and are completely static at this point. It would be nice to one day have this information port from a repo somewhere based on a markdown file.
- Methodology
  - Static text ported over from v1.
- Partners
  - Static text that uses the `/home/Card` component to paint content. 

