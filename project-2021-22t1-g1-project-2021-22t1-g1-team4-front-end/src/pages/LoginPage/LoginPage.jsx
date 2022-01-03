import React, { useState,useEffect } from 'react';
import axios from "axios";
import "../../style/login.css"
import { useHistory } from 'react-router';
import cookie from 'react-cookies'


var api_response_status_code = 0;
let csrfToken;




export const LoginPage = () => {
  const[password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState()
  const[customer, setCustomer] = useState("")
  const[email, setEmail] = useState("");
 

  const authenticated = async (cust_email) => {

    let url = new URL(`https://gas1jek279.execute-api.ap-southeast-1.amazonaws.com/api/get-session`);
    const params = { customer_email: cust_email };
    url.search = new URLSearchParams(params);

    await fetch(url, {
      mode: 'cors',
      credentials: "include"
    })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      setIsAuthenticated(data.login);
      
    })
    .catch((err) => {
      console.log(err);
    });
      
    }

  
 
  const getCSRFtoken = async () => {
    await fetch("https://gas1jek279.execute-api.ap-southeast-1.amazonaws.com/api/getcsrf",{
      //withCredentials: true,
      mode: 'cors',
      credentials: "include",
      
    }).then(response =>{
      //console.log(response)
      csrfToken = response.headers.get(["X-CSRFToken"]);
      //axios.defaults.headers.post['X-CSRFToken'] = Object.values(response.headers)[2];
    }).catch((error)=>{
      console.log(error.response.data);
  
      // api_response_status_code gets changed here  
      api_response_status_code = error.response.status;
      console.log(api_response_status_code);
    })
  };
  
  
  
  const handleLogin = async () => {
    await fetch("https://gas1jek279.execute-api.ap-southeast-1.amazonaws.com/api/login", {
      method: "POST",
      mode: 'cors',
      credentials: "include",
      headers: {
        "Accept": "*/*",
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken
      },
      body: JSON.stringify({customer_email: `${email}`,password: `${password}`}),
    })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      setIsAuthenticated(true);
      sessionStorage.setItem("isAuthenticated", true);
      sessionStorage.setItem("logged-email", data.customer.customer_email);
      sessionStorage.setItem("logged-custID", data.customer.customer_id);
      sessionStorage.setItem("logged-points", data.customer.points);
    })
    .catch((err) => {
      console.log(err);
    });
  }
  
  const handleLogout = async () => {
    await fetch("https://gas1jek279.execute-api.ap-southeast-1.amazonaws.com/api/logout",{
      method: "POST",
      mode: 'cors',
      credentials: "include",
      headers: {
        "Accept": "*/*",
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
        'Access-Control-Allow-Origin': 'https://itsag1t4.com'
      },
      body: JSON.stringify({customer_email: `${email}`})
    }
    ).then((res) => res.json())
    .then((data) => {
      console.log(data);
      setIsAuthenticated(false);
      sessionStorage.setItem("isAuthenticated", false);
    })
    .catch((err) => {
      console.log(err);
    });
  }
    
    

 
  const history = useHistory();
  const goToPreviousPath = () => {
    history.goBack()
  }

  useEffect(() => {
    console.log("useEffect called");
    if(sessionStorage.getItem("isAuthenticated") == null ){
      setIsAuthenticated(false);
    }
    else{
      let authentication = sessionStorage.getItem("isAuthenticated")
      setIsAuthenticated(authentication);
    }
    if(sessionStorage.getItem("logged-email") == null){
      setEmail("none");
      authenticated("none")
    }
    else{
      let loggedEmail = sessionStorage.getItem("logged-email");
      setEmail(loggedEmail);
      authenticated(loggedEmail);
    }
   // getCSRFtoken();
   // authenticated();
   // csrf();
}, []);



    if(isAuthenticated){
      return (
        <div>
          <div class="login-background">
            <button 
              type="submit" 
              class="loginButton"
              onClick = {handleLogout}
              >Logout</button>
          </div>
        </div>
      );
    }
    else{
      return (
        <div>
           <div class="login-background">
                    <label class="signin-header">Login</label>
                    <div class="signin-info">
                        <input 
                          type="email" 
                          placeholder="Enter email" 
                          onChange = {(event) => setEmail(event.target.value)}
                          required/>
                        <input 
                          type="password" 
                          placeholder="Enter password" 
                          onChange = {(event) => setPassword(event.target.value)}
                          required/>
                        <button 
                          type="submit" 
                          class="loginButton"
                          onClick = {handleLogin}
                          >Login</button>
                    </div>
    
              </div>
        </div>
      );
    }
  
}
