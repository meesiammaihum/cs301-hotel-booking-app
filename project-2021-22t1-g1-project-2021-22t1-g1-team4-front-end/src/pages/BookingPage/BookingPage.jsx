import React, { Fragment, useState, useEffect } from "react";
import axios from "axios";
import "../../style/booking-history.css"
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";


export const BookingPage = () => {
    const customer_id = sessionStorage.getItem("logged-custID");
    const [booking, setBooking] = useState([]);
    const hotelRoom = JSON.parse(sessionStorage.getItem("hotel-room"));
    let isAuthenticated;
    if(sessionStorage.getItem("isAuthenticated") != null){
        isAuthenticated=sessionStorage.getItem("isAuthenticated");
      }
    

    const getBooking = async() => {
        axios.get("https://gas1jek279.execute-api.ap-southeast-1.amazonaws.com/api/bookings/"+customer_id,{
            withCredentials: true,
        }).then(response =>{
   
            console.log(response)
            setBooking(response.data["booking"])
           
        }).catch(error => {
            console.log(error.response)
        });
    }
  
    
    useEffect(() => {
        console.log("useEffect called");
        getBooking();
    }, []);


    if(isAuthenticated === "true"){
        return(
            <div>
                <div class="history-background">
                    <label class="booking-header">Booking History</label>
                    <ul class="booking-history">
                        <li>
                            <label>Booking ID: {booking.booking_id}</label>
                            <label>{sessionStorage.getItem("hotel")}, {hotelRoom.roomNormalizedDescription} x{sessionStorage.getItem("rooms")}</label>
                            <label>Check in:{sessionStorage.getItem("checkin")} </label>
                            <label>Payment mode: {booking.payment_mode}</label>
                            <label class="status">Status: {booking.payment_status}</label>
                        </li>
                    </ul>

                </div>

            </div>

        );
        }
    else{
        return(
            <Redirect to="/login"/>
        );
    }

};
