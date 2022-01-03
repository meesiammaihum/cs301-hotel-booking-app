import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { HomePage } from "./pages/HomePage/HomePage";
import { DestinationResultsPage } from "./pages/ResultsPage/DestinationResultsPage";
import { HotelResultsPage } from  "./pages/ResultsPage/HotelResultsPage";
import { BookingPage } from "./pages/BookingPage/BookingPage"
import { InformationPage } from "./pages/BookingPage/InformationPage";
import { PaymentPage } from "./pages/BookingPage/PaymentPage";
import { NavBar } from "./SharedComponents/NavBar";

import "./App.css";




function App() {
  return (
    <div className="App">
      <Router>
        <NavBar />
        <Switch>
          <Route path="/destination-results" component={DestinationResultsPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/hotel-results" component={HotelResultsPage} />
          <Route path="/bookings" component={BookingPage} />
          <Route path="/information" component={InformationPage} />
          <Route path="/payment" component={PaymentPage} />
          {/* minimally, the path must be "/" */}
          <Route path="/" component={HomePage} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
