import T from "i18n-react";

const countryTabTitle = T.translate("dashboard.countryTabTitle");
const regionTabTitle = T.translate("dashboard.regionTabTitle");
const asnTabTitle = T.translate("dashboard.asnTabTitle");

const tabOptions = [countryTabTitle, regionTabTitle, asnTabTitle];
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
const asn = {
    type: 'asn',
    tab: 3,
    url: '/dashboard/asn'
};

export {tabOptions, country, region, asn};
