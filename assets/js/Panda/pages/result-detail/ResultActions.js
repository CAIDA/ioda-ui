import { GET_NODE_DETAIL } from '../../constants/ActionTypes';
import { fetchData } from "../../services/FetchData";

const receiveNodeDetail = (id) => {
    return {
        type: GET_NODE_DETAIL,
        id
    }
};

export const getNodeDetail = (id) => {
    return function (dispatch) {
        fetchData(dispatch, id).then(data => {
            dispatch(receiveNodeDetail(data.data))
        });
    }
};
