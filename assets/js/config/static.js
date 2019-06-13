const IS_PRODUCTION = process.env.CH_VERSION === 'prod';

export default {

    // the various process.env variables are defined in .env.local

    charthouseVersion: process.env.CH_VERSION,

    authClientId: process.env.AUTH0_CLIENTID,

    baseUri: IS_PRODUCTION ?
        'https://hicube.caida.org' :
        'https://' + process.env.CH_VERSION + '.hicube.caida.org',

    api: {
        url: 'https://api.hicube.caida.org/' + process.env.CH_API_VERSION,
        timeout: 1000
    },

    expressions: [{
        type: 'path',
        path: 'darknet.ucsd-nt.non-spoofed.overall.uniq_src_ip'
    }],
    from: '-7d',
    plugin: 'xyGraph'

};
