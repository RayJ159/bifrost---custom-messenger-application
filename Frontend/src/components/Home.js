import React, {useState, useEffect, useRef} from "react"

import "bootstrap/dist/css/bootstrap.css"
import "../css/home.css"
import axios from 'axios'
import io from 'socket.io-client'

import {createRoutesFromChildren, useLocation, useNavigate} from "react-router-dom"



function Home(){

    const buffer = []

    

    var url = "https://bifrost-messenger.herokuapp.com"
    //var url = "http://localhost:5000"

    
    const webcamRef = useRef();
    const streamRef = useRef();

    const [viewable, setViewable] = useState(false)
    const [pcMap, setPcMap] = useState({})
    const pcMapTemp = {}
    const bufferMap = {}
    const receiveMap = {}

    const servers = {
        iceServers: [

    {
      urls: ['stun:stun1.l.google.com:19302'],
    }
    ],
    iceCandidatePoolSize:10,
     
    } 

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

    const [pc, setPc] = useState(null)

   

    async function sendOffer(stream,key, socket){
        bufferMap[key] = []
        receiveMap[key] = []
        
        pcMap[key].onicecandidate = (event => {
            if(event.candidate){
                const curCandidate = event.candidate.toJSON();
                console.log({...curCandidate, realm:email});
           
                if(pcMap[key].currentRemoteDescription){
                    axios.post(`${url}/streamice`, {...curCandidate, realm:email, viewer:key})
                } else {
                    bufferMap[key].push(curCandidate)
                }
            }
        })


        // pcMap[key].oniceconnectionstatechange = function() {
        //     if(pcMap[key].iceConnectionState == 'disconnected' || pcMap[key].iceConnectionState == 'closed'){
        //         console.log('user disconnected')
        //         delete pcMapTemp[key];
        //         setPcMap(pcMapTemp)
        //     }
        // }

        // pcMap[key].onsignalingstatechange = function() {
            
        //         console.log('user disconnected')
        //         delete pcMapTemp[key];
        //         setPcMap(pcMapTemp)
            
        // }
    
    
      
        stream.getTracks().forEach((track) => {
            pcMap[key].addTrack(track, stream)
        })
    
        const offerDescription = await pcMap[key].createOffer();
        const offer = {
            realm: email,
            viewer: key,
            sdp: offerDescription.sdp,
            type: offerDescription.type,
        }
        
   
     
        socket.on(email + "-answer", async (arg, argb) => {
            if(argb == key){
                console.log(arg)
                const answerDsecription = new RTCSessionDescription(arg)
                await pcMap[key].setRemoteDescription(answerDsecription);

                for(var i = 0; i < bufferMap[key].length; i++){
                    await axios.post(`${url}/streamice`, {...bufferMap[key][i], realm:email, viewer:key})
                }
                
                for(var i = 0; i < receiveMap[key].length; i++){
                    await pcMap[key].addIceCandidate(receiveMap[i]);
                } 
                bufferMap[key] = []
                receiveMap[key] = []
              
            }
                
        }) 
    
        socket.on(email + "-ice", async (arg, argb) => {
            console.log(argb)
           
            if(argb == key){
                const candidate = new RTCIceCandidate(arg)
                if(pcMap[key].currentRemoteDescription){
                    await pcMap[key].addIceCandidate(candidate);
                } else {
                    receiveMap[key].push(candidate)
                }
            
            }
        })

        await axios.post(`${url}/stream-offer`, offer)
        pcMap[key].setLocalDescription(offerDescription)
    
    
    }

    useEffect(()=> {
        const socket = io.connect(`${url}/`)
        if(webcamRef.current.srcObject){
            Object.keys(pcMap).forEach(async function(key) {
                console.log(key)
                await sendOffer(webcamRef.current.srcObject, key, socket)
            })
        }
    }, [pcMap])



   

    useEffect(()=> {
        if(viewable){
            var bufferList = []
            var pc = new RTCPeerConnection(servers);
            setPc(pc)
            const socket = io.connect(`${url}/`)

            axios.post(`${url}/${curRealm}/viewer`, {viewer: email + '-' + curRealm});
            
            socket.on(curRealm + "-ice", async (arg, argb) => {
                if(argb == email + '-' + curRealm ){
                    console.log("ice")
                    const candidate = new RTCIceCandidate(arg)
                    await pc.addIceCandidate(candidate);
                    }
            })
            pc.onicecandidate = event => {
               if(event.candidate){
                const curCandidate = event.candidate.toJSON();
                console.log({...curCandidate, realm:curRealm});
           
                
                if(pc.currentRemoteDescription){
                    axios.post(`${url}/streamice`, {...curCandidate, realm:curRealm, viewer:email + '-' + curRealm})
                } else {
                    bufferList.push(curCandidate)
                }
            }
            }
            pc.ontrack = event => {
                if(streamRef.current.srcObject){
                    return;
                }
                console.log(event.streams[0])
                streamRef.current.srcObject = event.streams[0]
            }

            pc.onsignalingstatechange = async event => {
                if(pc.currentRemoteDescription){
                    console.log('x')
               
                    for(var i = 0; i < bufferList.length; i++){
                        await axios.post(`${url}/streamice`, {...bufferList[i], realm:curRealm, viewer:email + '-' + curRealm})
                    }   
                    bufferList = []
                    
                }

            }

            socket.on(curRealm +"-offer", async (arg, argb) => {

                if(argb == email + '-' + curRealm ){

                await pc.setRemoteDescription(new RTCSessionDescription(arg))
                const answerDescription = await pc.createAnswer();
               

                const answer = {
                    viewer: email + '-' + curRealm,
                    realm: curRealm,
                    type: answerDescription.type,
                    sdp: answerDescription.sdp
                }
                console.log(answer)
                await pc.setLocalDescription(answerDescription);
                await axios.post(`${url}/stream-answer`, answer);
        
            }
            })


        } else {
            const socket = io.connect(`${url}/`)
            socket.on(email + '-viewer', (arg) => {
                console.log(pcMapTemp)
                pcMapTemp[arg.viewer] = new RTCPeerConnection(servers)
                setPcMap(pcMapTemp)
                
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
        if(streamRef.current){
            streamRef.current.srcObject = null;
        }
        console.log('closed')
        pc.close()
        setPc(null)
        setViewable(false)
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
        console.log(pcMap);
        Object.keys(pcMap).forEach(async function(key) {
            
            console.log(key)
            await sendOffer(stream, key, socket)
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
