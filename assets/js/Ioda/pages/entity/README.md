# IODA Entity Page

## Current Features
- Control Panel
  - The control panel is a component used on both `pages/dashboard/Dashboard.js` and `pages/entity/Entity.js` page that contains a searchbar, date selector, and title. README available under `components/controlPanel/`
  - `handleTimeFrame()` is a function defined in the page file to trigger updates to other elements in the page when the time range is changed from the control panel. It is called from within the controlPanel component.

- Chart
  - The chart used is from a library called canvasJS, https://canvasjs.com/. We have an indefinite non-commercial license with them. Once initial raw signal data is retrieved from the api, `convertValuesForXyViz()` is called to format the data to be compatible xy points to work with the library. The event data that returns from the api is used to draw the alert bands. In addition, this function takes care to set some styling, and set an object with the customizations that gets passed to the chart. This object uses the `createXyVizDataObject()` function to further format the xy plot data providing data line-specific styling and formatting. Finally, `genChart()` is called to render the chart UI. The `resize()` function is used to determine the width of the chart in the UI. If the screen width changes, the browser will need to be refreshed to update the chart drawing.
  - The licensing information displays in the bottom-right of the chart, but I am blocking it out of visibility with a css pseudo :after element on the xy chart wrapper.On smaller screens the legend information is shifted above the chart as it is not layered over the :after code in the `css/ioda/sass/pages/_entity.js` file. The chart library doesn't provide control to seperate out the layering between the legend and the chart background since it is all drawn in canvas.  
  - zoom/pan and reset zoom Feature
    - The chart is set up to allow zooming and panning. On an initial zoom of the chart, a toggle and a reset button populate. These features are native the library. Custom styles and button text provided by the `_entity.scss` file. The zoom also updates the time range displayed via called  the `xyPlotRangeChanged()` function.
  - Toggle Features
    - alert bands/normalized values
      - alert bands can be toggled on and off  if they are available, or between absolute and normalized values. Clicking the toggle button triggers `handleDisplayAlertBands()` or `changeXyChartNormalization()`, which updates state and recalls `convertValuesForXyViz()` to redraw the canvas without the bands/with different values.
    - legend datasources
      - datasources can be toggled to display on/off. This ability is managed by the canvasjs library and triggered with the `xyDataOptions.legend` state.
  - Date Range Copy Feature
    - The date range appearing on the bottom-right of the chart can be clicked to copy to dashboard. The date range updates on zoom/pan to reflect the currrent view. The original date scope is still maintained in the control panel. One common usage with this feature is zooming into the chart, copying that date range, and pasting it into the 
  - Export Feature
    - The chart can also be annotated and downloaded as a jpg file. The button triggers a modal via `toggleXyChartModal()`. This function turns off alert bands and will reset the chart zoom values as they were when closed. More detail on this modal can be found in the `components/modal/xyChartModal` README file.

- Event/Alert Table
  - The table is a custom component built for IODA. More can be found in the `components/table` README file.
  - A function is set up to turn results that return from the api into objects formatted to work with the table component. Each object is managed in state by `alertDataProcessed` or `eventtDataProcessed`.
  - A button exists to toggle between the two tables, triggering the `changeCurrentTable()`, which toggles the `currentTable` state between `event` and `alert`.

- EntityRelated Component
    The `EntityRelated.js` file was used as a way to seperate out the page functions from the page UI to help reduce file lengths.
    - Props
        - `entityName` - a string of the full current entity name (not the entityCode)
        - `entityType` - a string of the current entity type. `country`, `region`, or `asn`. 
        - `parentEntityName` - If the region is a region or asn, they will have an affiliated country. This is that value as a string.
        - `toggleModal` - a function used to toggle open and closed the raw signals modals.
        - `showMapModal` - A boolean used to determine if the modal content to show relates to the regions appearing in the map.
        - `showTableModal` - A boolean used to determine if the modal content to show relates to the asns appearing in the table.
        - `topoData` - An object of the geographical data returned from the api for drawing borders on countries/regions. 
        - `topoScores` - a formatted list of objects created from the summary data generated from `getMapScores()` that is ready to populate map outages knowing the shape, entity name, and color to shade and ordered by score.
        - `bounds` - An array of two arrays containing coordinates that the map will use to zoom into the entity on the map, e.g. 
            [
                [3.4907437220320645, 29.77769777697779], 
                [6.192517345928991, 32.33372333723338]
            ]. 
            - bounds are set in the `getMapScores` function, derived from using the summary outage data to pair down which features (region map objects) to draw over through the utility function `getOutageCoords(features)` in `utils/index/js`. Each feature object is then mapped through to collect their coordinate information, filtering the largest/smallest values drawing the boundaries.
        - `handleEntityShapeClick` - a function that triggers a route change if an entity shape is clicked from the map.
        - `summaryDataRaw` - A list of objects representing the summary outage data for related entities as it is returned from the api. 
        - `relatedToTableSummaryProcessed` - A list of objects formatted to populate in the table. Formatting done through util function `convertValuesForSummaryTable`.
        - `relatedToTableSummary` - The same as `relatedToTableSummaryProcessed` but not yet formatted for the table.
        // Used in the raw signals modal
        - `handleSelectAndDeselectAllButtons` - a function used in the raw signals modal to trigger either all events available up to the first 150 to render in the horizon time series or hide all from populating. The 150 cap was set as a value where beyond that, the chart slows down.
        - `regionalSignalsTableSummaryDataProcessed` - an array of objects that represent each entity and any affiliated outage scores for regions. Used to populate the raw signals modal table.
        - `asnSignalsTableSummaryDataProcessed` - an array of objects that represent each entity and any affiliated outage scores for ASNs. Used to populate the raw signals modal table.
        - `toggleEntityVisibilityInHtsViz` - a function that is triggered when the checkbox on an entity in a table row is clicked. This will either populate or remove the particular entity time series from the horizon time series. If an entity's data is not loaded to populate in the horizon time series, an api call will be made for that element, and concatenated to the greater list of outage summary objects.
        - `handleEntityClick` - A function that triggers a new entity page to load when the entityName is clicked in the table.
        - `handleCheckboxEventLoading` - A function used to trigger when loading bars should appear and disappear in the raw signals modal. Probably the reason for how slow the checkmark boxes behave when clicking them.
        // Raw Signals Horizon Time Series
        - `regionalSignalsTableEntitiesChecked` - an integer representing the current number of ASN entities checked to display in the horizon time series chart on the raw signals modal.
        - `asnSignalsTableEntitiesChecked` - an integer representing the current number of regional entities checked to display in the horizon time series chart on the raw signals modal.
        - `initialTableLimit` - an integer that caps the number of entities initially populated in the raw signals modal
        // A list of objects to populate each series data in the horizon time series. The raw signals data returned from the api uses `convertTsDataForHtsViz` to format it for use.
        - `rawRegionalSignalsProcessedPingSlash24` 
        - `rawRegionalSignalsProcessedBgp`
        - `rawRegionalSignalsProcessedUcsdNt`
        - `rawAsnSignalsProcessedPingSlash24`
        - `rawAsnSignalsProcessedBgp`
        - `rawAsnSignalsProcessedUcsdNt`
        //
        - `summaryDataMapRaw` - A list of objects used for populating the regional map inside of the raw signals modal
        - `rawSignalsMaxEntitiesHtsError` - A string to depict an error message if the modal has populated the max number of entities in the horizon time series
        - `asnSignalsTableTotalCount` - An integer used to display the total number of related ASN entities in the raw signals modal. The table initially loads 300, however there are many cases where this value will exceed 300 so it needs to be tracked independently. 
        - `regionalSignalsTableTotalCount` - An integer used to display the total number of related Region entities in the raw signals modal. The table initially loads 300, however there are many cases where this value will exceed 300 so it needs to be tracked independently. 
        - `handleLoadAllEntitiesButton` - A function that will load the remaining entities beyond the 300 initially populated. Only displays in the UI if the totalCount value is greater than 300.
        - `regionalRawSignalsLoadAllButtonClicked` - A boolean to track whether the load all entities button has been clicked for regions in order to track if it should populate or not when the modal closes and reopens.
        - `asnRawSignalsLoadAllButtonClicked` - A boolean to track whether the load all entities button has been clicked for ASNs in order to track if it should populate or not when the modal closes and reopens. 
        - `loadAllButtonEntitiesLoading` - A boolean to help manage the status of loading all entities when `handleLoadAllEntitiesButton()` is triggered.
        - `handleAdditionalEntitiesLoading` - A function to trigger when `loadAllButtonEntitiesLoading` changes.
        // A boolean for tracking when a loading bar should display if the chart is updating with new data when clicking an entity with no raw signals data loaded yet.
        - `additionalRawSignalRequestedPingSlash24`
        - `additionalRawSignalRequestedBgp`
        - `additionalRawSignalRequestedUcsdNt`
        //
        - `checkMaxButtonLoading` - A boolean used for tracking when check max loading icon should appear and not.
        - `uncheckAllButtonLoading` - A boolean used for tracking when uncheck all loading icon should appear and not
        // used to check if there are no entities available to load (to control when loading bar disappears)
        // an integer that conveys the number of entities available in the list of ENTITY_TYPE ENTITY_DATASOURCE Signals
        - `rawRegionalSignalsRawBgpLength`
        - `rawRegionalSignalsRawPingSlash24Length` 
        - `rawRegionalSignalsRawUcsdNtLength`
        - `rawAsnSignalsRawBgpLength`
        - `rawAsnSignalsRawPingSlash24Length`
        - `rawAsnSignalsRawUcsdNtLength`
    
    - Summary
        - On initial load, a check is made to determine which modal was clicked, with UI content rendering accordingly. A country selected will render regions in the map, and ASNs in the table. A region selected will render other regions affected within the parent country, and related ASNs in the table. An ASN selected will render regions in that ASN's country impacted, and related countries in the table. If no regions are impacted in any case, A larger button will populate linking to the raw signals modal.
        - More detail on the modals can be found in the `components/modals/rawSignalsModal` README file.

## Initial Render
- Like on the dashboard page, an initial check to see if time parameters are provided. If there is, that value is used, otherwise initialState defaults to the last 24 hours. If a valid time range is provided, api calls initiate for getting event data called with the `searchEventsAction`, alert data called with the `searchAlertsAction`, raw signal data on the entity called with the `getSignalsAction`, and entity metadata called with the `getEntityMetadata` action. If there is not a valid entityType and entityName provided from the url, the browser will return a console error. 
- Once entity metadata returns, that is set to state with `entityName`, `parentEntityName` and `parentEntityCode`. This is used to get the topgraphical data needed to populate the related entities map and table.
- When the `getSignals` call returns, that data is mapped to `tsDataRaw` in state, calls the `convertValuesForXyViz()` function, and renders data to build the chart.
- When the alert and event data call returns, that data is mapped to `alertDataRaw` and `eventDataRaw`, formatted through either `convertValuesForEventTable()` or `convertValuesForAlertTable()`, then used to populate the table.