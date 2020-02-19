import axios from "axios";
import { merge } from 'lodash';

export const fetchData = (dispatch, config) => {
    const baseURL = 'http://localhost:4000/graphql?query=';
    let concatURL = `${baseURL}${config.url}`;

    const configHeader = merge({}, config, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
        url: concatURL.replace(/\s/g, "")
    });

    return axios(configHeader)
        .then(response => {
            return Promise.resolve(response);
        })
        .catch(error => {
           return Promise.reject(error);
        });
};
