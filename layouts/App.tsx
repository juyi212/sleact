import LogIn from '@pages/LogIn';
import SignUp from '@pages/SignUp'
import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';


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