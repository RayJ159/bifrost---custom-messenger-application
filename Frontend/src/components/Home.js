import React, {useState, useEffect} from "react"
import "bootstrap/dist/css/bootstrap.css"
import "../css/home.css"
import axios from 'axios'
import io from 'socket.io-client'

import {createRoutesFromChildren, useLocation, useNavigate} from "react-router-dom"


function Home(){

    var url = "https://bifrost-messenger.herokuapp.com"
    
   
    

    const [messages, setMessages] = useState([])
    const [textVal, setTextVal] = useState([])

    const [realmVal, setRealmVal] = useState("")

    const {state} = useLocation()
    const {email} = state
    const [curRealm, setCurRealm] = useState(email)

    const getNewMessage = () => {
        console.log(curRealm)
        updateMessages()
    }



   

    const navigate = useNavigate()

    function updateMessages() {

        axios.get(`${url}/realms/${curRealm}`)
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

        const socket = io.connect(`${url}/`)
       
        console.log(curRealm)
        socket.on(curRealm, getNewMessage)
        updateMessages()

        // clean up the listener
        return () => socket.off(curRealm, getNewMessage); 
    }, [curRealm])

    function sendMessage(text){
        axios.post(`${url}/realms/${curRealm}`, {email:email, text:text})
        .then((e)=>{
            console.log(e)
        })
        .catch((e) => {
            console.log(e)
        })
    }


    return (<div className="wrapper">

<div class="top-bar">
    <div>
    <button  onClick={()=>{
        setCurRealm(email)
    }} >Heimdall!</button>
    </div>
    
    <div>
    <form className = "search-bar" onSubmit={(e) => {
        e.preventDefault();
          
        setCurRealm(realmVal);
            
        }}>
        
        <input type="text" onChange={(e)=>{
        setRealmVal(e.target.value);
            
        }} value={realmVal} placeholder="Search Realm"/>
        <input class="search-button" type="submit" value="Go"/>
    </form>
    </div>

    <div>
    <button  onClick={()=>{
        navigate('/');
    }} >Sign out</button>

    </div>
    </div>
        
            <div className="messages">
                <ul>
                {messages.map((message)=> {
                var curDate = new Date(message["messagetime"]*1)
              

                return <li ref={(e) => {
                    try{
                        e.scrollIntoView()
                    } catch(e) { 
                    }
                  
                }}>
                    

                    <div className="message-item">
                    <div className="message-item-header">
                    <div className="message-item-name">
                        {message['email'] } 
                    </div>

                    <div className="message-item-time">
                        {curDate.getHours()+":"+curDate.getMinutes() +" "+ curDate.getDate()+"/"+(curDate.getMonth() + 1)+"/"+(curDate.getFullYear())}
                    </div>
                    </div>
                    <div className="message-item-body">
                  
                    <p>{message['messagetext']}</p>
                    
                
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
            
       
            
        <form className="messageBox" onSubmit={(e) => {
            e.preventDefault();
            sendMessage(textVal);
            setTextVal("")

            }}>
            <input type="text" onChange={(e) => {
                setTextVal(e.target.value)
                console.log(e.target.value)
            }} value={textVal} placeholder="Enter a message"/>
            <input type="submit"  value = "SEND"/>
        </form>
        
        
    </div>);
    
        
    
}

export default Home;
