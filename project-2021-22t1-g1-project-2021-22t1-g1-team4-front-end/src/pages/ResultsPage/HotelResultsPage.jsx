import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../style/search-results.css";
import Rating from "@mui/material/Rating";
import { useHistory } from 'react-router';

const queryString = window.location.search;
console.log(queryString);

const urlParams = new URLSearchParams(queryString);
const hotel_name = urlParams.get("destination_or_hotel");
const guests = urlParams.get("guests");
const checkin = urlParams.get("checkin");
const checkout = urlParams.get("checkout");

let api_response_status_code = 0;

export const HotelResultsPage = () => {
  const [results, setResults] = useState([]);
  const [results1, setResults1] = useState([]);
  const [hotelPrice, setHotelPrice] = useState("");

  const history = useHistory();
  const goToPreviousPath = () => {
    history.goBack()
  }
  // calls search_by_hotel name
  function submitHandler() {
    console.log(`hotel_name = ${hotel_name}`);

    if (!hotel_name) {
      return;
    }

    function axiosParams() {
      const params = new URLSearchParams();
      params.append("hotel_name", hotel_name);
      params.append("guests", guests);
      params.append("checkin", checkin);
      params.append("checkout", checkout);
      return params;
    }
    axios
      .get("https://gas1jek279.execute-api.ap-southeast-1.amazonaws.com/api/hotels", {
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
        console.log(res.data);
        if (res.data["data"]["rooms"].length !== 0) {
          setResults(res.data["data"]["hotel"]);
          setResults1(res.data["data"]["rooms"]);
          {sessionStorage.setItem("destination_id", res.data["data"].destination_id)};
          // console.log("setResults called", results[0]);
          // console.log("setResults1 called", results1);
          // console.log(results[0]["name"]);
          // console.log(results1[0]["roomNormalizedDescription"]);
        }
      })
      .catch((error) => {
        console.log(error);
        // api_response_status_code = error.response.status;
        // console.log(api_response_status_code);
      });
  }

    useEffect(() => {
        console.log("useEffect called");
        submitHandler();
    }, []);

  if (results.length === 0 && api_response_status_code === 404) {
    return (
      <div>
        <form action="/home" method="get">
          <button
            class="SearchResultButton"
            id="SearchResultButton"
            type="submit"
            variant="contained"
          >
            Change Search
          </button>
        </form>
        <label class="no-match">There are no matching rooms.</label>
      </div>
    );
  }
  return (
    <div>

        <button
          class="SearchResultButton"
          id="SearchResultButton"
          type="submit"
          variant="contained"
          onClick = {goToPreviousPath}
        >
          Change Hotel
        </button>

      <ul class="result">
        {results.map((result, i) => {
          return (
              <div key={i} class="selected-container">
                <img src={result.cover_photo} class="selected-img"/>
                {sessionStorage.setItem("hotel_id", result.hotel_id)}
                <div class = "selected-hotelDetails">
                  <div class="hotelName">
                    {result.name}
                    {sessionStorage.setItem("hotel",`${result.name}`)}
                    </div>
                  <Rating name="half-rating-read" value={result.rating} precision={0.5} readOnly />
                  <div>Address: {result.address}</div>

                  <div>Facilities: </div>
                  {Object.keys(result.amenities).map((amenity, i) => {
                      // console.log(amenity)
                      var convertedText = amenity.replace(/([A-Z])/g, " $1");
                      convertedText = convertedText.charAt(0).toUpperCase() + convertedText.slice(1);
                      return (
                        <ul class="facilities-item">
                          <li key={i}>
                            {convertedText}
                          </li>
                        </ul>

                      )
                  })}
                </div>

            </div>
          )
        })}
        {results1.map((result, i) => {
          // console.log(`result = ${result}`);
          return (
            <li key={i}>
              <div class="container">
                <div>
                  <div class="roomDetails">
                    <div class="roomName">
                      {" "}
                      {result.roomNormalizedDescription}{" "}
                    </div>
                    <div class="points">
                      Earn {result.points} loyalty points
                    </div>
                    <div class="selected-room-price">
                      <div class="hotelPrice">
                        ${result.price}
                        </div>
                      <div class="taxes">Inclusive of Taxes</div>
                    </div>
                  </div>
                  <form action="/information" method="get">
                    <button  class="selectRoomButton" type="submit" name={i}
                    onClick={(event)=>
                      sessionStorage.setItem("hotel-room", JSON.stringify(results1[event.target.name]))

                    }
                    >Book Now!</button>
                  </form>


                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
