import React, { Fragment, useState, useEffect , } from "react";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import "../../style/payment.css"
import axios from "axios";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { format } from "date-fns";
import e from "cors";



var api_response_status_code = 0;
var checkinDate = Date.parse(sessionStorage.getItem("checkin"));
var checkoutDate = Date.parse(sessionStorage.getItem("checkout"));
var difference = checkoutDate - checkinDate;
var number_of_nights = Math.ceil(difference / (1000 * 3600 * 24));
var points = 0;


//let bank_account_id;
//let bank;

export const PaymentPage = () => {
    const [status, setStatus] = useState()
    const hotelRoom = JSON.parse(sessionStorage.getItem("hotel-room"));
    const [deductedPrice, setDeductedPrice] = useState(hotelRoom.price)
    const [loyaltyPoints, setLoyaltyPoints] = useState(0)
    let bank ;
    let bankAccountID ;
    let cardNumber;
    let cardCVV;
    let cardExpireDate;
    let paymentMode;
    var deducted_price = hotelRoom.price;
  

    const radioHandler = (status) => {
        setStatus(status);
    };
  
    let isAuthenticated;
    if(status === 0){
        paymentMode = "Cash";
    }else{
        paymentMode = "Card";
    }

    if(sessionStorage.getItem("isAuthenticated") != null){
      isAuthenticated=sessionStorage.getItem("isAuthenticated");
    }

  
    const selectBank = (e) => {
        bank = e.target.value;
    }
    const selectBankAcct = (e) => {
        bankAccountID = e.target.value;
    }

    const card = (e) => {
        cardNumber = e.target.value;
    }
   
    const cardCVVInfo = (e) => {
        cardCVV = e.target.value;
    }
    
    const cardDate = (e) => {
        cardExpireDate = e.target.value;
    }

    const selectPoint = (e) => {
        const checked = e.target.checked;
        if (checked) {
            points = parseInt(sessionStorage.getItem("logged-points"));
            deducted_price = parseFloat(hotelRoom.price) - parseInt(points);
            setDeductedPrice(parseFloat(hotelRoom.price) - parseInt(points));
            setLoyaltyPoints(points);
            document.getElementById("final-price").textContent = "s$" + deducted_price;
            document.getElementById("used-points").textContent = points;
        }else{
            setLoyaltyPoints(0);
            setDeductedPrice(hotelRoom.price);
            document.getElementById("final-price").textContent = "s$" + deducted_price;
            document.getElementById("used-points").textContent = 0;
        }

    }



    if (paymentMode === "Cash"){
        bank = null;
        bankAccountID = null;  
        cardNumber = "NULL";
        cardCVV = "";
        cardExpireDate = "";
    }
        

    const makePayment =  () => {
        console.log(typeof cardNumber)
        axios.post("https://gas1jek279.execute-api.ap-southeast-1.amazonaws.com/api/payments",{
            customer_id : sessionStorage.getItem("logged-custID"),
            title : sessionStorage.getItem("hotel"),
            price : deductedPrice,
            payment_status : "Pending",
            payment_mode : paymentMode,
            points : loyaltyPoints,
            bank_account_id : bankAccountID,
            bank : bank,
            card_info: {
                card_number: cardNumber,
                cvv: cardCVV,
                expiry_date: cardExpireDate
            },
            card_number: cardNumber
     
            
        },{
            withCredentials: true,
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin":"https://itsag1t4.com"
              }
        }).then(response =>{
            console.log(response)
      
            if(response.status === 201){
                makeBooking(response.data["payment"].payment_id, response.data["payment"].payment_status);
            }
            
        }).catch(error => {
            console.log(error.response);
            // api_response_status_code gets changed here  
            api_response_status_code = error.response.status;
            console.log(api_response_status_code);
        })
    };

    const makeBooking =  async (payment_id, payment_status) => {
        await axios.post("https://gas1jek279.execute-api.ap-southeast-1.amazonaws.com/api/bookings",{
            destination_id:  sessionStorage.getItem("destination_id"),
            customer_id: sessionStorage.getItem("logged-custID"),
            hotel_id: sessionStorage.getItem("hotel_id"),
            booking_display_information:{
                number_of_nights: number_of_nights,
                start_date: sessionStorage.getItem("checkin"),
                end_date: sessionStorage.getItem("checkout"),
                adults: sessionStorage.getItem("guests"),
                children: 0,
                message_to_hotel: sessionStorage.getItem("specialRequest"),
                room_types: hotelRoom.roomNormalizedDescription
            },
            price: deductedPrice,
            supplier_booking_id: sessionStorage.getItem("logged-custID"),
            supplier_booking_response:{
                cost: hotelRoom.kaligo_service_fee,
                downstream_booking_reference: "Nil",
                booking_terms_and_conditions: "Nil",
                hotel_terms_and_conditions: "Nil"
            },
            booking_reference: "Booking created",
            guest_information:{
                salutation: "",
                first_name:sessionStorage.getItem("name"),
                last_name:sessionStorage.getItem("name")
            },
            payee_information:{
                payment_id: payment_id,
                payee_id:sessionStorage.getItem("logged-custID")
            },
            payment_mode: paymentMode,
            payment_status: payment_status
        },{
            withCredentials: true,
        }).then(response=>
            {
                console.log(response)
                if(response.status === 201){
                    document.getElementById("hiddenButton").click();
                }
               
        
            }).catch(error => {
                console.log(error.response);
                // api_response_status_code gets changed here  
                api_response_status_code = error.response.status;
                console.log(api_response_status_code);
            });
    }


    
    if(isAuthenticated === "true"){
        return(
            <form method="get" id="form" action="/bookings">
            <div>
                <div class="payment-container" >
                    <div class="payment-mode" >
                        <div class="loyalty-points">
                            <input type="checkbox" onClick={(e) => selectPoint(e)}/>
                            <label>Do you want to pay with loyalty points</label>
                            <div class="customer-points">
                                <label>Current points: </label>
                                <label >{sessionStorage.getItem("logged-points")}(= s${sessionStorage.getItem("logged-points")})</label>
                            </div>     
                        </div>
                        <div class = "payment-cash">
                            <input type="radio" name="cash-credit" checked={status === 0} 
                                onClick={(e) => radioHandler(0)} />
                            <label>Cash Payment</label>
                        </div>
                        <div  class="payment-credit">
                            <input type="radio" name="cash-credit" checked={status === 1} onClick={(e) => radioHandler(1)} />
                            <label>Card Payment</label>
                            {status === 1 && 
                                <div class="credit-card">
                                    
                                    <div class="form-container">
                                        <div class="field-container">
                                            <label for="name">Name</label>
                                            <input id="name" maxlength="20" type="text"/>
                                        </div>
                                        <div class="field-container">
                                            <label for="cardnumber">Card Number</label>
                                            <input id="cardnumber" type="text" pattern="[0-9]*" inputmode="numeric" onChange={(e) => card(e)} />
    
                                        </div>
                                        <div class="field-container">
                                            <label for="expirationdate">Expiration (mm/yy)</label>
                                            <input id="expirationdate" type="text" onChange={(e) => cardDate(e)}  />
                                        </div>
                                        <div class="field-container">
                                            <label for="securitycode">Security Code</label>
                                            <input id="securitycode" type="text" pattern="[0-9]*" inputmode="numeric" onChange={(e) => cardCVVInfo(e)} />
                                        </div>
                                        <div class="field-container">
                                            <label for="bank">Bank</label><br></br>
                                            <select id="bank"  class="bank"  onChange={(e)=>selectBank(e)}>
                                                <option value="" selected disabled hidden>Choose Bank</option>
                                                <option value="POSB" >POSB</option>
                                                <option value="OCBC">OCBC</option>
                                                <option value="UOB">UOB</option>
                                            </select>
                                        </div>
                                        <div class="field-container">
                                            <label for="cardnumber">Bank Account ID</label>
                                            <input id="cardnumber" type="text"onChange={(e) => selectBankAcct(e)} />
                                        </div>
                                    </div>
                                </div>
                            }
                    
                        </div>
                    </div>
                    <div class="payment-price-details">
                        <p>Price Details</p>
                        <div class="payment-price-container">
                            <div class="payment-price">
                                <label> {sessionStorage.getItem("hotel")}, {hotelRoom.roomNormalizedDescription} x {sessionStorage.getItem("rooms")}</label>
                                <label class="payment-room-price">s${(hotelRoom.price-hotelRoom.TaxAndServiceFee).toFixed(2)}</label>
                            </div>
                            <div class="payment-tax"> 
                                <label> Taxes and fees </label>
                                <label class="payment-tax-price"> s${hotelRoom.TaxAndServiceFee}</label>
                            </div>
                            <div class="payment-tax"> 
                                <label> Loyalty Points Used </label>
                                <label class="payment-room-price" id="used-points"> {points}</label>
                            </div>
                            <hr></hr>
                            <div class="total">
                                <div class="room-type" >
                                    <label> Total Price</label>
                                    <label class="payment-total-price" id="final-price"> s${deducted_price}</label>
                                </div>
                              
                            </div>
                        </div>
                    </div>
                </div>
                <div class = "payment-info">
                    <div class="booking-id">Booking ID</div>
                    <label>723602579</label>
                    <hr></hr>
                    <div>
                            <div class="booking-details">Booking Details</div>
                            <label>{sessionStorage.getItem("hotel")}</label>
                            <ul class="room-info">
                                <li>Check-in: {sessionStorage.getItem("checkin")}</li>
                                <li>{number_of_nights} Night(s)</li>
                                <li>{hotelRoom.roomNormalizedDescription}</li>
                                <li>{sessionStorage.getItem("rooms")} Room(s)</li>
                            </ul>
                    </div>
                    <hr></hr>
                    <div >
                        <div class="guest-details">Guest</div>
                        <label>{sessionStorage.getItem("name")}</label>
                    </div>
                </div>
                <button type="button" class="paymentButton" 
                    onClick={makePayment}
                >Pay Now</button>
                  <button type="submit" class="hiddenButton" id="hiddenButton"
                >Pay Now</button>
            </div>
         </form>
        );
    }
   else{
       return(
           <Redirect to="/login"/>
       );
   }
    
};
