# IODA API Data Actions and Reducer

## Available States and Actions

### States

`state.iodaApi.`:
- `entities`: entities metadata
- `topo`: for loading geographical map data
- `datasources`: available data sources used in IODA
- `signals`: for timeseries graphs
- `alerts`: for building alerts tables
- `events`: for building events tables
- `summary`: for building event scores on the right of the map

### Actions

- `searchEntities(dispatch, searchQuery)`
    - `searchQuery` should be pure text of the entities user wants to search for
- `getDatasourcesAction()`
    - get data sources
- `getTopoAction(type)`
    - get map data for type, including `continent`, `country`, `region`, and `county`.
- `searchAlertsAction(from, until, entityType=null, entityCode=null, datasource=null, limit=null, page=null) `
    - search for alerts
- `searchEventsAction(from, until, entityType=null, entityCode=null, datasource=null, includeAlerts=null, format=null, limit=null, page=null)`
    - search for events
- `searchSummaryAction(from, until, entityType=null, entityCode=null, limit=null, page=null)`
    - search for event summaries
- `getSignalsAction(entityType, entityCode, from, until, datasource=null, maxPoints=null)`
    - get raw signals

## Usage

In the page that you want to use the data apis, run the `connect` function in
export. For example in `pages/Home.js`:

``` javascript
export default connect(mapStateToProps, mapDispatchToProps)(Home);
```

The `maptStateToPros` and `mapDispatchToProps` are two functions that maps the
data results and data calls to props for you to use. The following example takes
the entities field data as results, and also maps the `searchEntities` function
defined in `ActionEntities.js` to a props.

``` javascript
const mapStateToProps = (state) => {
    return {
        suggestedSearchResults: state.iodaApi.entities
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        searchEntitiesAction: (searchQuery) => {
           searchEntities(dispatch, searchQuery);
        }
    }
};
```

Then in the rest of the PHP code, you can use the defined field
`suggestedSearchResults` and `searchEntitiesActions` in props to access the data
and function calls accordingly.

Accessing data:
``` javascript
let suggestedItemObjects = Object.entries(this.props.suggestedSearchResults.data);
```

Accessing function call:
``` javascript
// get data for search results that populate in suggested search list
getDataSuggestedSearchResults(nextProps) {
    if (this.state.mounted) {
        // Set searchTerm to the value of nextProps, nextProps refers to the current search string value in the field.
        this.setState({ searchTerm: nextProps });
        // // Make api call
        this.props.searchEntitiesAction(nextProps);
    }
}
```
