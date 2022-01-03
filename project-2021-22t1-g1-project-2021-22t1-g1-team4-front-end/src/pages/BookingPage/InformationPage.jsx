import React, { Fragment, useState, useEffect } from "react";
import "../../style/personal-info.css"

const queryString = window.location.search;
console.log(queryString);

const urlParams = new URLSearchParams(queryString);
const hotel_name = urlParams.get("destination_or_hotel");
const guests = urlParams.get("guests");
const checkin = urlParams.get("checkin");
const checkout = urlParams.get("checkout");


export const InformationPage = () =>  {
    const [name, setName] = useState(
        sessionStorage.getItem("name") || ""
    );
    const [mobileNumber, setMobileNumber] = useState(
        sessionStorage.getItem("mobileNumber") || ""
    );
    const [email, setEmail] = useState(
        sessionStorage.getItem("email") || ""
    );
    const [specialRequest, setSpecialRequest] = useState(
        sessionStorage.getItem("specialRequest") || ""
    );
  
    const hotelRoom = JSON.parse(sessionStorage.getItem("hotel-room"));

    return(
        <form method="get" action="/payment">
        <div class="main">
            <div class="personal-info">
            <p>Guest's name</p>
            <input 
                type="text" 
                placeholder="Your Name" 
                value={name}
                onChange={(event) => {
                    sessionStorage.setItem("name", event.target.value);
                    setName(event.target.value)}} />
            <div class="contact-info">
                <div class="mobile">
                    <p>Reachable mobile number</p>
                    <input 
                        type="tel" 
                        placeholder="Your Mobile Number" 
                        value={mobileNumber}
                        onChange={(event) => {
                            sessionStorage.setItem("mobileNumber", event.target.value);
                            setMobileNumber(event.target.value)}} />
                </div>
                <div class="email">
                    <p >Contact's email address</p>
                    <input 
                        type="email" 
                        placeholder="Your Email" 
                        value={email}
                        onChange={(event) => {
                            sessionStorage.setItem("email", event.target.value);
                            setEmail(event.target.value)}} />
                </div>
            </div>
            </div>
            <div class="special-request">
                <p>Special Request</p>
                <input 
                    type="text" 
                    placeholder="Special Request" 
                    value={specialRequest}
                    onChange={(event) => {
                        sessionStorage.setItem("specialRequest", event.target.value);
                        setSpecialRequest(event.target.value)}}/>
            </div>
            <div class="price-details">
                <p>Price Details</p>
                <div class="price-details-container">
                    <div class="total-price">
                        <label> Total</label>
                        <label class="room-price"> s${hotelRoom.price}</label>
                    </div>
                    <hr></hr>
                    <div class="room-type" >
                        <label> {sessionStorage.getItem("rooms")}(x) {hotelRoom.roomNormalizedDescription}</label>
                        <label class="room-price"> s${(hotelRoom.price-hotelRoom.TaxAndServiceFee).toFixed(2)}</label>
                    </div>
                    <div class="tax">
                        <label>Taxes and fees</label>
                        <label class="room-price"> s${hotelRoom.TaxAndServiceFee}</label>
                    </div>
                  
                </div>
        </div>
        <div class = "info">
            <label class="hotel-name">{sessionStorage.getItem("hotel") } </label>
            <div class="date">
                <div class="check-in">
                    <label>Check-in</label>
                    <div class="check-in-date">
                        <time>{sessionStorage.getItem("checkin")},</time> 
                        <time>From 14:00</time>
                    </div>
                </div>
                <div class="check-out">
                    <label>Check-out</label>
                    <div class="check-out-date">
                        <time>{sessionStorage.getItem("checkout")},</time> 
                        <time>Before 11:00</time>
                    </div>
                </div> 
                <div class="room-booked">
                    <label class="room">{sessionStorage.getItem("rooms")}(x) {hotelRoom.roomNormalizedDescription}</label>
                    <hr></hr>
                    <div class="guest-detail">
                        <label>Guests per room</label>
                        <label class='guest-bed'> {sessionStorage.getItem("guests")} Guest(s)</label>
                    </div>
                    <div class="bed-detail">
                        <label>Bed Type</label>
                        <label class='guest-bed'> 1 {hotelRoom.roomNormalizedDescription}</label>
                    </div>
    
                </div>
            </div>
        </div>
            <button type="submit" class="infoButton">Proceed to payment</button>

        </div>
        </form>
 
    );
};