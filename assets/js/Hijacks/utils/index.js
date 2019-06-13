function eventTypeName(eventType) {
    return {
        'moas': 'MOAS',
        'submoas': 'Sub-MOAS',
        'edges': 'New Edge',
        'defcon': 'Defcon'
    }[eventType];
}

export {eventTypeName};
