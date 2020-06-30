import {GET_NODE_DETAIL} from '../../constants/ActionTypes';

export default function getNodeDetail(state = {}, action) {
    switch (action.type) {
        case GET_NODE_DETAIL:
            return action;
        default:
            return state;
    }
};
