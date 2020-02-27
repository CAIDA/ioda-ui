import axios from "axios";
import { merge } from 'lodash';

export const fetchData = (dispatch, config) => {
    const baseURL = 'http://localhost:4000/graphql';
    // let concatURL = `${baseURL}${config.url}`;
    let query = config.url;
    const configHeader = merge({}, config, {
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        // url: concatURL.replace(/\s/g, "")
        url: baseURL,
        data: {
            query
        }
    });

    return axios(configHeader)
        .then(response => {
            return Promise.resolve(response);
        })
        .then(response => {
            return response;
        })
        .catch(error => {
           return Promise.reject(error);
        });
};
