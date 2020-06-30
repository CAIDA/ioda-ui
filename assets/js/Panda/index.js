// global CSS styles exported from sass scripts
import 'css/style.css';
// internationalization
import './constants/strings';
// library imports
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
// Redux
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from "redux";
import thunk from 'redux-thunk';
import rootReducer from './reducers';
// graphQL resources (unused currently)
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
// Template Components
import Nav from "./templates/Nav";
import Footer from "./templates/Footer";
// Routes
import Home from './pages/home/Home';
import SearchFeed from "./pages/search-result/Search";
import Result from './pages/result-detail/Result';
import FourZeroFour from "./pages/404/404";


// ToDo: Check if ApolloProvider is necessary and uninstall associated packages if not.
class PandaApp extends Component {
    render() {
        const client = new ApolloClient({
            uri: "https://localhost:4000/graphql"
        });
        return <div className="panda-app">
                <ApolloProvider client={client}>
                    <Nav/>
                    <Switch>
                        <Route path="/search" component={SearchFeed}/>
                        <Route exact path="/result/:type/:name" component={Result}/>
                        <Route exact path="/404" component={FourZeroFour} />
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
