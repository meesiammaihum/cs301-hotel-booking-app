import React, { useState, useEffect } from "react";
import axios from "axios";
import "date-fns";
import "../../style/style.css";
import * as ReactDOM from "react-dom";
import { AutoComplete } from "@progress/kendo-react-dropdowns";
import { filterBy } from "@progress/kendo-data-query";
import { is } from "date-fns/locale";

const delay = 500;

function SearchComponent() {
  const [destination_or_hotel, setDestinationOrHotel] = useState(
    sessionStorage.getItem("destination_or_hotel") || ""
  );
  const [guests, setGuests] = useState(sessionStorage.getItem("guests") || "");
  const [checkin, setCheckInDate] = useState(
    sessionStorage.getItem("checkin") || new Date()
  );
  const [checkout, setCheckOutDate] = useState(
    sessionStorage.getItem("checkout") || new Date()
  );
  const [rooms, setRooms] = useState(sessionStorage.getItem("rooms") || "");

  function onClick(event) {
    console.log(`onClick(): type = ${event.target.value}`);
    let type1 = document.getElementById("type1");
    let type2 = document.getElementById("type2");
    if (type1.checked) {
      console.log(`onClick(): type1 = ${type1.checked}`);
      console.log(`onClick(): type1 = ${type1.value} is clicked`);
      document.getElementById("searchForm").action = `/${type1.value}-results`;
    } else {
      console.log(`onClick(): type2 = ${type2.value} is clicked`);
      console.log(`onClick(): type2 = ${type2.checked}`);
      document.getElementById("searchForm").action = `/${type2.value}-results`;
    }
  }

  // Autocomplete
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const timeout = React.useRef();
  const [destination_suggestions, setDestinationSuggestions] = useState([]);
  const [hotel_suggestions, setHotelSuggestions] = useState([]);

  function onChange(event) {
    const value = event.target.value;
    console.log(`onChange(): value = ${value}`);

    setDestinationOrHotel(value);
    console.log(`destination_or_hotel = ${destination_or_hotel}`);
    sessionStorage.setItem("destination_or_hotel", value);

    let type1 = document.getElementById("type1");
    let type2 = document.getElementById("type2");
    // console.log(`onChange(): type1 = ${type1.checked}`);
    // console.log(`onChange(): type2 = ${type2.checked}`);
    // if type value = destination, call /destinations
    if (type1.checked) {
      const partial_name = new URLSearchParams();
      partial_name.append("partial_name", value);
      axios
        .get("https://gas1jek279.execute-api.ap-southeast-1.amazonaws.com/api/suggest-destination-names", {
          params: partial_name,
        },{
          withCredentials: true,
          headers: {
            "Accept": "*/*",
            "Content-Type": "application/json"
          }
        })
        .then((res) => {
          console.log(res.data["matching_destinations"]);
          if (res.data["matching_destinations"].length !== 0) {
            setDestinationSuggestions(res.data["matching_destinations"]);
          }
        })
        .catch((error) => {
          console.log(error.response);
        });
    }
    // if type value = hotel, call /hotels
    else {
      const partial_name = new URLSearchParams();
      partial_name.append("partial_name", value);
      axios
        .get("https://gas1jek279.execute-api.ap-southeast-1.amazonaws.com/api/suggest-hotel-names", {
          params: partial_name,
        },{
          withCredentials: true,
          headers: {
            "Accept": "*/*",
            "Content-Type": "application/json"
          }
        })
        .then((res) => {
          console.log(res.data["matching_hotels"]);
          if (res.data["matching_hotels"].length !== 0) {
            setHotelSuggestions(res.data["matching_hotels"]);
          }
        })
        .catch((error) => {
          console.log(error.response);
        });
    }

    function filterData(value) {
      //   console.log(`value = ${value}`);
      if (type1.checked) {
        var data = destination_suggestions;
      } else {
        var data = hotel_suggestions;
      }
      const filter = {
        value: value,
        operator: "startswith",
        ignoreCase: true,
      };
    //   console.log(filterBy(data, filter));
      return filterBy(data, filter);
    }

    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      setData(filterData(value));
      setLoading(false);
    }, delay);
    setValue(value);
    setLoading(true);
  }

  return (
    <div className="background">
      <div className="searchbox">
        <form action="/results" id="searchForm" method="get">
          <div class="selection">
          <p> Select a destination or hotel: </p>
          <div onClick={onClick}>
            <input
              type="radio"
              id="type1"
              name="type"
              value="destination"
              class="radiogroup"
            />
            <label for="type1">Destination</label>
            <input
              type="radio"
              id="type2"
              name="type"
              value="hotel"
              class="radiogroup"
            />
            <label  for="type2">Hotel</label>
          </div>
          <AutoComplete
            id="destination_or_hotel"
            name="destination_or_hotel"
            data={data}
            value={value}
            loading={loading}
            placeholder="Destination Or Hotel"
            onChange={onChange}
          />
          </div>
          <ul>
            <li>
              <input
                type="date"
                label="Check In"
                format="yyyy-MM-dd"
                name="checkin"
                id="checkin"
                value={checkin}
                onChange={(event) => {
                  sessionStorage.setItem("checkin", event.target.value);
                  setCheckInDate(event.target.value);
                }}
              />

              <input
                type="date"
                label="Check Out"
                format="yyyy-MM-dd"
                name="checkout"
                id="checkout"
                value={checkout}
                onChange={(event) => {
                  sessionStorage.setItem("checkout", event.target.value);
                  setCheckOutDate(event.target.value);
                }}
              />

              <input
                type="text"
                value={guests}
                label="guests"
                id="guests"
                name="guests"
                onChange={(event) => {
                  sessionStorage.setItem("guests", event.target.value);
                  setGuests(event.target.value);
                }}
                placeholder="Number of Guest(s)"
              />
              <input
                type="text"
                value={rooms}
                label="rooms"
                id="rooms"
                name="rooms"
                onChange={(event) => {
                  sessionStorage.setItem("rooms", event.target.value);
                  setRooms(event.target.value);
                }}
                placeholder="Number of Room(s)"
              ></input>
            </li>
          </ul>
          <button
            class="HomePageButton"
            id="HomePageButton"
            type="submit"
            variant="contained"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}

export default SearchComponent;
