import React from 'react';
import loadable from '@loadable/component'
import { Redirect, Switch, Route } from 'react-router-dom';

const LogIn = loadable(() => import('@pages/Login'))
const SignUp = loadable(() => import('@pages/SignUp'))


const App = () => {
    return (
        <Switch>
            <Redirect exact path = '/' to='login' />
            <Route path = '/login' component= {LogIn}></Route>
            <Route path = '/signup' component= {SignUp}></Route>
        </Switch>
    )
}

export default App;