// external CSS deps
// TODO: fix green color on success button hover
import 'css/theme/css/bootstrap-flatly.css';

// global CSS styles
import 'css/base.css';

// library imports
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from "redux";
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";

// auth
import Quickstart from './pages/quickstart';
import Docs from './pages/docs';
import About from './pages/about';
import Acks from './pages/acks';
import Platforms from './pages/feeds';
import Dashboards from './pages/dashboards';
import Examples from './pages/examples';
import Nav from "./templates/Nav";
import Footer from "./templates/Footer";

import Home from './pages/home/Home';
import SearchFeed from "./pages/search/Search";



class PandaApp extends Component {
    render() {
        const client = new ApolloClient({
            uri: "https://localhost:4000/graphql"
        });
        return <div className="panda-app">
                <ApolloProvider client={client}>
                    <Nav/>
                    <Switch>
                        <Route path='/quickstart' component={Quickstart}/>
                        <Route path='/docs' component={Docs}/>
                        <Route path='/about' component={About}/>
                        <Route path='/acks' component={Acks}/>

                        <Route path='/feeds' component={Platforms}/>
                        <Route path='/dashboards' component={Dashboards}/>
                        <Route path='/examples' component={Examples}/>

                        <Route path="/search" component={SearchFeed}/>
                        {/*<Route exact path="/:type/:name" component={}/>*/}
                        <Route path='/' component={Home}/>
                    </Switch>
                    <Footer/>
                </ApolloProvider>
        </div>;
    }
}

const store = createStore(rootReducer, applyMiddleware(thunk));

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <PandaApp/>
        </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);
