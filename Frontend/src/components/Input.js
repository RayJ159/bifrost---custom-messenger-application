import React, { useState, useEffect } from "react"
import "bootstrap/dist/css/bootstrap.css"
import "../css/home.css"
import axios from "axios"
import io from "socket.io-client"
import "socket.io-client"

/** 

const [registered, setRegistered] = useState(true)

const [email, setEmail] = useState("")
const [pass, setPass] = useState("")
const [invalid, setInvalid] = useState(false)

function Input(props) {
  return (
    <div>
      <div className="form-floating">
        <input value={props} onChange={(e) => {
          setEmail(e.target.value)
        }} type="text" className="form-control" id="floatingInput" placeholder="name@example.com" />
        <label for="floatingInput">Username</label>
      </div>
      <div className="form-floating">
        <input value={props} onChange={(e) => {
          setPass(e.target.value)
        }} type="password" className="form-control" id="floatingPassword" placeholder="Password" />
        <label for="floatingPassword">Password</label>
      </div>
    </div>
    {
      invalid && <div><p className="invalid-output">Invalid username or password entered.</p></div>
    }
  )

}

**/

export default Input;