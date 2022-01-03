import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../style/search-results.css";
import Rating from '@mui/material/Rating';


const queryString = window.location.search;
console.log(queryString);

// returns the querystring part of a URL e.g ?destination_full_name=Colonial District, Singapore, Singapore&checkin=2021-10-18&checkout=2021-10-19&guests=2
const urlParams = new URLSearchParams(queryString);
const destination = urlParams.get("destination_or_hotel");
const guests = urlParams.get("guests");
const checkin = urlParams.get("checkin");
const checkout = urlParams.get("checkout");

var api_response_status_code = 0;

export const DestinationResultsPage = () => {
  const [results, setResults] = useState([]);
  // calls search_by_destination
  function submitHandler() {
    // console.log(`destination_or_hotel = ${destination_or_hotel}`);

    if (!destination) {
      return;
    }

    function axiosParams() {
      const params = new URLSearchParams();
      params.append("destination_full_name", destination);
      params.append("guests", guests);
      params.append("checkin", checkin);
      params.append("checkout", checkout);
      return params;
    }


    // calls /destinations
    axios
    .get("https://gas1jek279.execute-api.ap-southeast-1.amazonaws.com/api/destinations", {
        params: axiosParams(),
    },{
      withCredentials: true,
      headers: {
        "Accept": "*/*",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin":"https://itsag1t4.com"
      }
    })
    .then((res) => {
        if (res.data["data"]["hotels"].length !== 0) {
            setResults(res.data["data"]["hotels"]);
            console.log(res.data["data"]["hotels"]);
            // console.log(`setResults called:  ${results}`);
            // console.log(`first hotel: ${res.data["data"]["hotels"][0]["name"]}`);
        }
    })
    .catch((error) => {
          console.log(error.response);
          // api_response_status_code gets changed here
          // api_response_status_code = error.response.status;
          // console.log(api_response_status_code);
      })

    }

    useEffect(() => {
        console.log("useEffect called");
        submitHandler();
    }, []);

    console.log(`results.length: ${results.length}`)
    // but not here
    console.log(`api_response_status_code: ${api_response_status_code}`)
    if (results.length === 0 && api_response_status_code === 404) {
        return (
          <div>
              <form action="/home" method="get">
              <button
                class="SearchResultButton"
                id="SearchResultButton"
                type="submit"
                variant="contained"
                >Change Search</button>
            </form>
            <label class="no-match">There are no matching hotels.</label>
          </div>
       );
    }

  return (
    <div>
        <form action="/home" method="get">
        <button
          class="SearchResultButton"
          id="SearchResultButton"
          type="submit"
          variant="contained"
          >Change Search</button>
        </form>
        <ul class="result">
      {results.map((result, i) => {
        // console.log(`result = ${result}`);
        //  if /destinations was called
        if ("hotel_id" in result) {
        //   console.log(`hotel_id in result`);
          return (
                 <li  key={i}>
                   <div class="container">
                       <div>
                       <form action="/hotel-results" method="get">
                         <img src={result.cover_photo} class="img"/>
                         <div class = "hotelDetails">
                           <div class="hotelName"> {result.name}</div>
                           <Rating name="half-rating-read" value={result.rating} precision={0.5} readOnly />
                           <div class="price">
                             <div class="hotelPrice"> <label>From </label>${result.lowest_price}</div>
                             <div class="taxes">Inclusive of Taxes</div>
                           </div>
                         </div>
                        <input type="hidden" name="destination_or_hotel" value={result.name} />
                        <input type="hidden" name="checkin" value={checkin} />
                        <input type="hidden" name="checkout" value={checkout} />
                        <input type="hidden" name="guests" value={guests} />
                        <button class="selectRoomButton" type="submit">Select Hotel</button>

                        </form>
                         </div>
                       </div>

                 </li>

          );
        }
      }
      )}
    </ul>
    </div>
  );

};
