import React, {useState, useEffect, useRef} from "react"

import "bootstrap/dist/css/bootstrap.css"
import "../css/home.css"
import axios from 'axios'
import io from 'socket.io-client'

import {createRoutesFromChildren, useLocation, useNavigate} from "react-router-dom"


function Home(){

    

    //var url = "https://bifrost-messenger.herokuapp.com"
    var url = "http://localhost:5000"
    const webcamRef = useRef();
    const streamRef = useRef();

    const [viewable, setViewable] = useState(false)

    const servers = {
        iceServers: [
            {
                urls: ['stun:stun1.l.google.com:19202', 'stun:stun2.l.google.com:19302'],

            }],
            iceCandidatePoolSize: 10,
        
    }

    let pc = new RTCPeerConnection(servers);
    let localStream = null
    
    
   
    

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

    useEffect(()=> {
        if(viewable){
         
            const socket = io.connect(`${url}/`)

            socket.on(curRealm + "-ice", async (arg) => {
                console.log("ice")
                const candidate = new RTCIceCandidate(arg)
                await pc.addIceCandidate(candidate);
                    
            })

            pc.onicecandidate = event => {
                const curCandidate = event.candidate.toJSON();
                console.log({...curCandidate, realm:curRealm});
                axios.post(`${url}/streamice`, {...curCandidate, realm:curRealm})
            }
    

            pc.ontrack = event => {
                if(streamRef.current.srcObject){
                    return;
                }

                console.log(event.streams[0])

                streamRef.current.srcObject = event.streams[0]
                
            }

            socket.on(curRealm +"-offer", async (arg) => {
                await pc.setRemoteDescription(new RTCSessionDescription(arg))
                const answerDescription = await pc.createAnswer();
                await pc.setLocalDescription(answerDescription);

                const answer = {
                    realm: curRealm,
                    type: answerDescription.type,
                    sdp: answerDescription.sdp
                }
                console.log(answer)

                await axios.post(`${url}/stream-answer`, answer)
            })

            

           
    
                
    
            


            
           

        
        }
    }, [viewable])

    
  
 
    useEffect(() => {
        //localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
        const socket = io.connect(`${url}/`)
        if(email != curRealm){
            setViewable(true);
        } 


        
       
        console.log(curRealm)
        socket.on(curRealm, getNewMessage)
        updateMessages()

        // clean up the listener
        return () => socket.off(curRealm, getNewMessage); 
    }, [curRealm])

    function sendMessage(text){
        setMessages([...messages, {email:email,messagetext:text, messagetime: Date.now()}])
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
    <button  onClick={async ()=>{
        const socket = io.connect(`${url}/`)
        const stream = await navigator.mediaDevices.getUserMedia({video:true});
       
        webcamRef.current.srcObject = stream;
    
        pc.onicecandidate = (event => {
            const curCandidate = event.candidate.toJSON();
            console.log({...curCandidate, realm:email});
            axios.post(`${url}/streamice`, {...curCandidate, realm:email})
        })

      
        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream)
        })
    
        const offerDescription = await pc.createOffer();
        await pc.setLocalDescription(offerDescription)

        const offer = {
            realm: email,
            sdp: offerDescription.sdp,
            type: offerDescription.type,
        }
        console.log(offer);
        axios.post(`${url}/stream-offer`, offer)

        socket.on(email + "-answer", async (arg) => {
            console.log(arg)
           
                const answerDsecription = new RTCSessionDescription(arg)
                await pc.setRemoteDescription(answerDsecription);

                
        }) 

        socket.on(email + "-ice", async (arg) => {
            console.log(arg)
            const candidate = new RTCIceCandidate(arg)
            await pc.addIceCandidate(candidate);
            
        })

        
    
       

       
    }}>Stream</button>

    </div>

    <div>
    <button  onClick={()=>{
        navigate('/');
    }} >Sign out</button>

    </div>

    

    </div>
    <div className="videoDiv">
        {(!viewable) && <video className="video" autoPlay ref={webcamRef} ></video>}
        {(viewable) && <video className="video" autoPlay ref={streamRef}></video>}
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
