import React, { useState } from "react"
import "bootstrap/dist/css/bootstrap.css"
import "../css/register.css"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import io from "socket.io-client"
import "socket.io-client"


function Register() {

  var url = "https://bifrost-messenger.herokuapp.com"
  //var url = "http://localhost:5000"

  const [registered, setRegistered] = useState(true)

  const [email, setEmail] = useState("")
  const [pass, setPass] = useState("")
  const navigate = useNavigate()
  const [invalid, setInvalid] = useState(false)

  return (
    <div className="body text-center">
      <div className="sign h-auto m-auto">
        <main className="sign-in m-auto">
          <div className="container-1">
            <form onSubmit={(e) => { e.preventDefault() }}>
              <h3 className="welcome-message">Welcome to</h3>
              <h1 className="title"> ᛒᛁᚠᚱᚢᛋᛏ </h1>
              <h3 className="welcome-message">The Bridge Between Worlds</h3>

              <div className="form-floating m-auto">
                <input value={email} onChange={(e) => {
                  setEmail(e.target.value)
                }} type="text" className="form-control" id="floatingInput" placeholder="name@example.com" />
                <label for="floatingInput">Username</label>
              </div>

              <div className="form-floating m-auto">
                <input value={pass} onChange={(e) => {
                  setPass(e.target.value)
                }} type="password" className="form-control" id="floatingPassword" placeholder="Password" />
                <label for="floatingPassword">Password</label>
              </div>
              {
                invalid && <div><p className="invalid-output">Invalid username or password entered.</p></div>
              }

              <div className="checkbox mb-3">

              </div>

              <div className="d-grid gap-2">
                {registered ?

                  <button onClick={() => {
                    axios.post(`${url}/signin`, {
                      user: email,
                      pass: pass
                    }).then((e) => {
                      var uid = ""
                      uid = e['data']['uid']

                      if (uid.length > 0) {
                        navigate("../home", { state: { email: email } });
                      } else {
                        setInvalid(true);
                      }
                    }).catch((e) => {
                      console.log(e)
                    })


                  }} className="button m-auto" type="submit">Sign in</button>
                  :
                  <button onClick={() => {
                    axios.post(`${url}/register`, {
                      user: email,
                      pass: pass
                    }).then(() => {
                      setRegistered(true)
                    })
                  }} className="button" type="submit">Register</button>
                } 
              </div>

              <div className="buttons-reg-for">
                {/*<div> remove this button
                  {
                    registered ?
                      <a onClick={function () {
                        setRegistered(false)

                      }} className="click-2"> Click here to Register </a>
                      :
                      <a onClick={function () {
                        setRegistered(true)
                      }} className="click-2">Click here to Sign In </a>

                  }
                </div>*/}
                <div>
                <a href="./SignUp" className="click-3">Sign Up Now!</a> <br></br>
                  <a href="./Reset" className="click-3">Forgot your Username or Password?</a>
                </div>
              </div>

              <p className="copyright mt-5 mb-3">&copy;Bifröst {new Date().getFullYear()}</p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Register;