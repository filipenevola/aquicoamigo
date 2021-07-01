import React from 'react';
import { Route, Switch} from 'react-router-dom';

import {Home} from "./Home";
import {Game} from "./Game";

export const Routes = () => {
  return <Switch>
    <Route exact path="/" component={Home}/>
    <Route path="/game/:gameId?" component={Game}/>
  </Switch>;
}
