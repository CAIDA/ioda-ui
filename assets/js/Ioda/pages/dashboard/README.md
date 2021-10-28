# IODA Dashboard Page

## Current Features
- Control Panel
  - The control panel is a component used on both `pages/dashboard/Dashboard.js` and `pages/entity/Entity.js` page that contains a searchbar, date selector, and title. README available under `components/controlPanel/`
  - `handleTimeFrame()` is a function defined in the page file to trigger updates to other elements in the page when the time range is changed from the control panel. It is called from within the controlPanel component.
- Tabs
  - Props
     - `tabOptions` - an array of titles to display tabs in order, e.g. ["tab1", "tab2", "tab3"]. This value along with other static tab-related values live in `dashboard/DashboardConstants.js`.
     - `activeTab` - a string of the current tab displayed. Options include `country`, `region`, `asn`.
        - Initially determined by if there is a value provided in the url, e.g. `/dashboard/region`. A blank value will default to country.
     - `handleSelectTab(selectedKey)` - a function that changes the tab based on the new tab index selected. 
        - selectedKey parameter is currently set with `this.tabs[index]`. this.tabs contains the static objects in `dashboard/DashboardConstants.js`.
  - Summary
     - On initial load, an initial check is made to see if a time range is provided. In both cases the time is set to state, defaulting to 24 hours otherwise. 
     - The tab is then selected based on if a value that matches in `activeTab` is provided in the url following `/dashboard/`. 
     - Topographical data is retrieved from the api via `getDataTopo()` if necessary based on if `country` or `region` is selected. This is also triggered from the url value.
     - Two api calls are made via `getTotalOutages(entityType)` and `getDataOutageSummary(entityType)` to get outage data based on the entity type and time parameters and to get the total number of entities affected. These both use `searchSummary` and `totalOutages` actions defined in the `data/ActionOutages.js` file.
        - Currently the api is capped at returning 170 entities for the sake of loading UI elements in a timely manner. When looking at the asn tab, it is not uncommon to see 170 entities returned out of thousands.
        - Batch api call to help load entities beyond 170th entity is a future feature.
     - Once summary data is available, event data is requested if the entityType is asn via the `searchEvents` action in `ActionOutages` via the `getDataEvents()` function. Otherwise this data is called if the user toggles from map view to chart view.
        - Once event data is available, `componentDidUpdate()` calls `convertValuesForHtsViz()` to format what returns from the api to something that is compatible with the chart npm package `horizon-timeseries-chart`.
     - In addition to event data being called, `convertValuesForSummaryTable()` is also called, which formats the data that returns from the api to something friendly to the table using a function that lives in `/utils/index.js`. 
       - The api page number is used to set the parameter of `page` on the summary data api call, currently not utilized, but ready when a scroll event can be set up to trigger a new call that concatenates the summary data.
     - Each tab receives this data in a sibling file `DashboardTab.js`. This file renders the UI within a tab once all data is available.

Within the `DashboardTab.js` file
  The dashboardTab file was used as a way to seperate out the page functions from the page UI to help reduce file lengths.
   - Props
     - `type` - A string of the activeTabType, initially derived from the url. Values can be `country`, `region`, or `asn`
     - `handleTabChangeViewButton()` - A function that is called when the user switches between map view and chart view on the country or region tab.
     - `tabCurrentView` - A string that depicts if the chart should display or the map. Accepts `timeSeries` or `map`.
     - `from` - An integer that represents seconds since epoch. The start date for data called.
     - `until` - An integer that represents seconds since epoch. The end date for data called.
     - `displayTimeRangeError` - A boolean to trigger a message that an error exists in the time ranges provided.
     - `summaryDataProcessed` - an array of objects returned from the `searchSummary` action.
     - `totalOutages` - an integer returned from the `totalOutages` action.
     - `genSummaryTableDataProcessed` - an array of objects of outage data formatted to populate in the table component.
     - `eventDataProcessed` - an array of formatted objects used to populate the chart view.
     
        Country and Region only (map related)
     - `topoData` - an array of topo objects used to draw the map returned from the api.
     - `topoScores` - a formatted list of objects created from the summary data generated from `getMapScores()` that is ready to populate map outages knowing the shape, entity name, and color to shade and ordered by score.
     - `handleEntityShapeClick()` - a function that triggers a route change if an entity shape is clicked from the map.
     - `summaryDataRaw` - an aid to help display the most relevant loading message, between loading or rendering.
   
   - Summary
     - `genMap()` and `genChart()` are functions that render their UI components. 
     - `genMap()` is set as such to allow for easier conditional rendering. It renders the map component from `components/map/Map.js` passing topographical data, scores, and an onClick function. More on the map can be found in it's README file.
     - `genChart()` is required to be written as a function to render in as it does not have an ES6 equivalent. Width is determined by current tab pixel width. 
