import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Profile from './pages/profile';
import Courses from './pages/courses';
import Activities from './pages/activities';
import AddActivity from './pages/add-activity';
import Certificates from './pages/certificates';
import CVGenerator from './pages/cv-generator';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/profile" component={Profile} />
        <Route path="/courses" component={Courses} />
        <Route path="/activities" component={Activities} />
        <Route path="/add-activity" component={AddActivity} />
        <Route path="/certificates" component={Certificates} />
        <Route path="/cv-generator" component={CVGenerator} />
        <Route path="/" exact component={Profile} />
      </Switch>
    </Router>
  );
};

export default App;