import T from "i18n-react";

// tab title strings
const countryTabTitle = T.translate("dashboard.countryTabTitle");
const regionTabTitle = T.translate("dashboard.regionTabTitle");
const asnTabTitle = T.translate("dashboard.asnTabTitle");

// tab titles list
const tabOptions = [countryTabTitle, regionTabTitle, asnTabTitle];

// associated selectedKey value, url that should be used with that key, and reference type
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
