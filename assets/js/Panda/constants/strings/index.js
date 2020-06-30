import T from 'i18n-react';

let languageString = '';
// set language to user's default browser language preference
// ToDo: will eventually allow user to select language via nav, but continue to default to browser option
let language = window.navigator.userLanguage || window.navigator.language;
language === "es"
    ? languageString = 'es'
    : languageString = 'en';

// ToDo: would like to change json files out for yml files eventually
let strings = Object.assign({},
    require(`./${languageString}/app.json`)
);

T.setTexts(strings);
