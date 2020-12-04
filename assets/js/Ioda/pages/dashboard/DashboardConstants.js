const tabOptions = ["Country View","Region View", "AS/ISP View"];
const country = {
    type: 'country',
    tab: 1,
    url: '/dashboard'
};
const region = {
    type: 'region',
    tab: 2,
    url: '/dashboard/region'
};
const as = {
    type: 'as',
    tab: 3,
    url: '/dashboard/as'
};

export {tabOptions, country, region, as};
