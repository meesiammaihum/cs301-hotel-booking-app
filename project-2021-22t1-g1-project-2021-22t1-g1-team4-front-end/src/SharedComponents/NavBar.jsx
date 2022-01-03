import React from 'react';
import { BrowserRouter as Router, Switch,Route, Link,useRouteMatch, useParams} from "react-router-dom";

export const NavBar = () => {
  return (
    <ul class = "topnav">
    <li class="header">Ascenda</li>
    <div class="navigation">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/bookings">Bookings</Link></li>
        <li> <Link to="/login">Login</Link></li>
    </div>
    </ul>
  );
}