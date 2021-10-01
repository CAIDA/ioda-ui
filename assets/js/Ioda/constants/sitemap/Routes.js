import React from 'react';
import { Route } from 'react-router';

export default (
    <Route>
        <Route path='/dashboard'/>
        <Route exact path='/reports'/>
        <Route exact path='/help'/>
        <Route exact path='/acknowledgements'/>
        <Route path='/reports/2020-iran-report'/>
        <Route exact path='/country/:entityCode'/>
        <Route path='/'/>
    </Route>
);
