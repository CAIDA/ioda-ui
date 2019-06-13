export default {
    rawText: {
        import: import(/* webpackChunkName: "raw-text" */ './raw-text'),
        title: 'Raw Text',
        description: 'Shows a plain text representation of the data',
        dynamic: true,      // Whether it's able to receive new data after initialisation and self-update
        internal: true
    },
    table: {
        jsFile: 'plugin-table',
        title: 'Table',
        description: 'Tabulates the data',
        dynamic: true,
        internal: false
    },
    xyGraph: {
        import: import(/* webpackChunkName: "highcharts-graph" */ './highcharts-graph'),
        title: 'XY Graph',
        description: 'Shows a line/area/bar chart representation of the data',
        dynamic: true
    },
    horizonStackedSeries: {
        import: import(/* webpackChunkName: "stacked-horizon" */ './stacked-horizon'),
        title: 'Stacked Horizon Graphs',
        description: 'Shows a vertically stacked representation of the data in Horizon layout, with one line per series',
        dynamic: true
    },
    geoDistribution: {
        import: import(/* webpackChunkName: "crosslet-geomap" */ './crosslet-geomap'),
        title: 'Geographical Distribution',
        description: 'Shows a geographical spread in which the series represent different world regions',
        dynamic: true,
        internal: false
    },
    heatmap: {
        jsFile: 'plugin-xy-heatmap',
        title: 'Heat Map',
        description: 'Shows a heatmap of the data in a 2 dimensional xy plane.',
        dynamic: true,
        internal: false
    },
    correlate2Series: {
        jsFile: 'plugin-correlate-scatter',
        title: 'Correlate Series',
        description: 'Shows a scatter plot correlating the values of 2 individual series.',
        dynamic: true,
        internal: false
    },
    proportions: {
        jsFile: 'plugin-proportions',
        title: 'Proportions Charts',
        description: 'Shows a distribution of the proportions between the values in the series, in various shapes: Sunburst (radial), Bubble Chart or Tree map.',
        dynamic: true,
        internal: false
    },
    bignum: {
        jsFile: 'plugin-bignum',
        title: 'Big Numbers (Beta)',
        description: 'Grid of numbers. Useful for showing gauges on a dashboard.',
        dynamic: true,
        internal: false
    },
};
