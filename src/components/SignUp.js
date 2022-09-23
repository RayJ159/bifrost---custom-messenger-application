import React, { useState } from "react"
import "bootstrap/dist/css/bootstrap.css"
import "../css/signup.css"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import io from "socket.io-client"
import "socket.io-client"


function SignUp() {
    var url = "https://bifrost-messenger.herokuapp.com"
    //var url = "http://localhost:5000"

    const [registered, setRegistered] = useState(true)
    const [email, setEmail] = useState("")
    const [user, setUser] = useState("")
    const [pass, setPass] = useState("")
    const navigate = useNavigate()
    const [invalid, setInvalid] = useState(false)

    return (
        <main className="register">
            <div className="register-page">
                <div className="container-2 row">
                    <div className="left-box col-lg-6">
                        <div className="header">
                            <h3 className="signup-message-1">Sign Up to</h3>
                            <h1 className="title"> ᛒᛁᚠᚱᚢᛋᛏ </h1>
                            <h3 className="signup-message-2">Now</h3>
                            <p className="copyright-2 mt-5 mb-3">&copy;Bifröst {new Date().getFullYear()}</p>
                        </div>
                    </div>
                    <div className="right-box col-lg-6">
                        <form onSubmit={(e) => { e.preventDefault() }}>
                            <div className="form-register">
                                <div className="form-floating m-auto">
                                    <input value={email} onChange={(e) => {
                                        setEmail(e.target.value)
                                    }} type="text" className="form-control" id="floatingInput-1" placeholder="name@example.com" />
                                    <label for="floatingInput">e-mail</label>
                                </div>

                                <div className="form-floating m-auto">
                                    <input value={user} onChange={(e) => {
                                        setUser(e.target.value)
                                    }} type="text" className="form-control" id="floatingInput-2" placeholder="Username" />
                                    <label for="floatingInput">Username</label>
                                </div>
                                <div className="form-floating m-auto">
                                    <input value={pass} onChange={(e) => {
                                        setPass(e.target.value)
                                    }} type="password" className="form-control" id="floatingPassword" placeholder="Password" />
                                    <label for="floatingPassword">Password</label>
                                </div>

                                <div className="reg-btn">
                                    <button onClick={() => {
                                        axios.post(`${url}/register`, {
                                            email: email,
                                            user: user,
                                            pass: pass
                                        }).then(() => {
                                            setRegistered(true)
                                        })
                                        console.log();
                                    }} className="button-signup" type="submit">Register</button>
                                    
                                    <p className="disclaimer">Disclaimer: Don't use your main email and your secured password, our leading engineer has encrypt nothing yet. We are not responsible for any data breach.</p>
                                </div>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </main>
    )


}

export default SignUp;