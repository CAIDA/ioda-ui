const IS_PRODUCTION = process.env.PD_VERSION === 'prod';

export default {

    // the various process.env variables are defined in .env.local

    pandaVersion: process.env.PD_VERSION,

    authClientId: process.env.AUTH0_CLIENTID,

    baseUri: IS_PRODUCTION ?
        'https://panda.caida.org' :
        'https://' + process.env.PD_VERSION + '.panda.caida.org',

    api: {
        url: 'https://api.panda.caida.org/' + process.env.PD_API_VERSION,
        timeout: 1000
    },

    expressions: [{
        type: 'path',
        path: 'darknet.ucsd-nt.non-spoofed.overall.uniq_src_ip'
    }],
    from: '-7d',
    plugin: 'xyGraph'

};
