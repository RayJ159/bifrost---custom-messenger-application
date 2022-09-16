import React, {useState} from "react"
import "bootstrap/dist/css/bootstrap.css" 
import "../css/register.css"
import {useNavigate} from "react-router-dom"
import axios from "axios"
import io from "socket.io-client";
import "socket.io-client";

function Register() {

    var url = "http://127.0.0.1:5000";

    const [registered, setRegistered] = useState(true)

    const[email, setEmail] = useState("")
    const[pass, setPass] = useState("")
    const navigate = useNavigate()

    return(
<div className="text-center body">
    <main className="form-signin w-100 m-auto">
      <form onSubmit={(e)=>{e.preventDefault()}}>
        <h1 className="mb-4"> Bifrost </h1>
        <h1 className="h3 mb-3 fw-normal">Please sign in</h1>

       
    
        <div className="form-floating">
          <input value={email} onChange={(e)=>{
            setEmail(e.target.value)
          }} type="text" className="form-control" id="floatingInput" placeholder="name@example.com"/>
          <label for="floatingInput">username</label>
        </div>

        <div className="form-floating">
          <input value={pass} onChange={(e) => {
            setPass(e.target.value)
          }} type="password" className="form-control" id="floatingPassword" placeholder="Password"/>
          <label for="floatingPassword">Password</label>
        </div>
      
  
        <div className="checkbox mb-3">
          
        </div>

        <div className="d-grid gap-2">
            { registered ?

            <button onClick={() => {
              axios.post(`${url}/signin`, {
                user: email,
                pass: pass
              }).then((e) => {
                var uid = ""
                uid = e['data']['uid']
                
                if(uid.length > 0){
                  navigate("../home", {state: {email:email}});
                }
            }).catch((e) => {
              console.log(e)
            })


            }} className="w-100 btn btn-lg btn-primary" type="submit">Sign in</button>
            :
            <button onClick={()=> {
              axios.post(`${url}/register`, {
                user: email,
                pass: pass
              }).then(() => {
                setRegistered(true)
              })
            }} className="w-100 btn btn-lg btn-primary" type="submit">Register</button>
            }
        </div>
   

        {

            registered?
        <a  onClick={function() {
            setRegistered(false)

        }}> click here to register </a>
        :
        <a onClick={function(){
            setRegistered(true)
        }}>Click here to sign in </a>

    }
        <p className="mt-5 mb-3 text-muted">&copy; 2017–2022</p>
      </form>
    </main>
    </div>
    );
}

export default Register;