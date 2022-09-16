import React, {useState, useEffect} from "react"
import "bootstrap/dist/css/bootstrap.css"
import "../css/home.css"
import axios from 'axios'
import io from 'socket.io-client'

import {createRoutesFromChildren, useLocation, useNavigate} from "react-router-dom"


function Home(){

    const [messages, setMessages] = useState([])
    const [textVal, setTextVal] = useState([])

    const {state} = useLocation()
    const {email} = state




   

    const navigate = useNavigate()

    function updateMessages() {

        axios.get('https://bifrost-messenger.herokuapp.com/realms/test')
    .then(function(response){
        var messagesdata = response['data']
        messagesdata.sort((a,b)=>{
            return parseInt(a['messagetime'], 10) - parseInt(b['messagetime'], 10)
        })
        console.log(messagesdata)
        setMessages(messagesdata)
     
        
        
       
    }).catch((e) => {
        console.log('failed to retrieve messages')
    }).then(() => {
        console.log("getting data")

    })

    }
  
    useEffect(() => {
        const socket = io.connect("https://bifrost-messenger.herokuapp.com/")
        socket.on('updateMessages', () => {
            updateMessages()
        })
        updateMessages()       
    }, [])

    function sendMessage(text){
        axios.post('https://bifrost-messenger.herokuapp.com/realms/test', {email:email, text:text})
        .then((e)=>{
            console.log(e)
        })
        .catch((e) => {
            console.log(e)
        })
    }


    return (<div className="wrapper">

<nav class="navbar navbar-expand-lg bg-light">
  <div class="container-fluid ">
    <button onClick={()=>{
        navigate('/');
    }} class="btn btn-outline-dark" >Go Back</button>
    
    
      <form class="d-flex" role="search">
        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>
        <button class="btn btn-outline-dark" type="submit">Search</button>
      </form>
    </div>
  
</nav>
        
            <div className="messages">
                <ul>
                {messages.map((message)=> {
                return <li ref={(e) => {
                    try{
                        e.scrollIntoView()
                    } catch(e) { 
                    }
                  
                }}>
                    

                    <div className="card">
                    <div className="card-header ">
                        {message['email']}
                    </div>
                    <div className="card-body">
                    <blockquote className="blockquote mb-0">
                    <p>{message['messagetext']}</p>
                    
                    </blockquote>
                    </div>
                    </div>
                    </li>
            })}
            </ul>
            <div ref={(e) => {
                try{
                    e.scrollIntoView()
                } catch(e){

                }
            }}></div>
        </div>
            
       
            
        <form className="textBox" onSubmit={(e) => {
            e.preventDefault();
            sendMessage(textVal);
            setTextVal("")

            }}>
        <div class="input-group mb-3" >
            
            <input type="text" onChange={(e) => {
                setTextVal(e.target.value)
                console.log(e.target.value)
            }} value={textVal} class="form-control" placeholder="Enter a message" aria-label="Enter a message" aria-describedby="button-addon2"/>
            <button class="btn btn-outline-dark" type="submit" id="button-addon2">Send</button>
         
            
        </div>
        </form>
        
        
    </div>);
    
        
    
}

export default Home;
