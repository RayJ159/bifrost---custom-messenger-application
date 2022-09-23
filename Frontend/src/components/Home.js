import React, {useState, useEffect, useRef} from "react"

import "bootstrap/dist/css/bootstrap.css"
import "../css/home.css"
import axios from 'axios'
import io from 'socket.io-client'

import {createRoutesFromChildren, useLocation, useNavigate} from "react-router-dom"



function Home(){


    

    var url = "https://bifrost-messenger.herokuapp.com"
    //var url = "http://localhost:5000"

    
    const webcamRef = useRef();
    const streamRef = useRef();

    const [streaming, setStreaming] = useState(false)
    const [viewable, setViewable] = useState(false)
    const [pcMap, setPcMap] = useState({})
    const bufferMap = {}
    const receiveMap = {}

    const servers = {
        iceServers: [

            {
               urls: ["turn:13.214.199.2:3478"],
               username: "a",
               credential:"a"
              }, 
    ],
     
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

    function initPC() {
            var pc = new RTCPeerConnection(servers);
            setPc(pc)
            const socket = io.connect(`${url}/`)

           
        
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
           
            
                axios.post(`${url}/streamice`, {...curCandidate, realm:curRealm, viewer:email + '-' + curRealm})
               
            }
            }

            var curDataChannel = pc.createDataChannel("")


            curDataChannel.onclose = () => {
                streamRef.current.srcObject = null
                pc.close()
                socket.off(curRealm + "-ice")
                socket.off(curRealm +"-offer")
                initPC();
              
            }
            pc.ontrack = event => {
                var remoteStream = new MediaStream()
                event.streams[0].getTracks().forEach(track => {
                    remoteStream.addTrack(track)
                })
                streamRef.current.srcObject = remoteStream;
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
               
                await pc.setLocalDescription(answerDescription);
                await axios.post(`${url}/stream-answer`, answer);
        
            }
            })
    }

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

        var answerFunction = async (arg, argb) => {
            if(argb == key){
                console.log(arg)
                const answerDsecription = new RTCSessionDescription(arg)
                await pcMap[key].setRemoteDescription(answerDsecription);

                for(var i = 0; i < bufferMap[key].length; i++){
                    console.log({...bufferMap[key][i], realm:email});
                    await axios.post(`${url}/streamice`, {...bufferMap[key][i], realm:email, viewer:key})
                }
                
                for(var i = 0; i < receiveMap[key].length; i++){
                    console.log(receiveMap[key])
                    await pcMap[key].addIceCandidate(receiveMap[key][i]);
                } 
                bufferMap[key] = []
                receiveMap[key] = []
              
            }
                
        }

        var iceFunction = async (arg, argb) => {
            console.log(argb)
           
            if(argb == key){
                const candidate = new RTCIceCandidate(arg)
                if(pcMap[key].currentRemoteDescription){
                    await pcMap[key].addIceCandidate(candidate);
                } else {
                    receiveMap[key].push(candidate)
                }
            
            }
        }



        console.log('sending offer')
        bufferMap[key] = []
        receiveMap[key] = []
        
        pcMap[key].onicecandidate = (event => {
            if(event.candidate){
                const curCandidate = event.candidate.toJSON();
                //console.log({...curCandidate, realm:email});
           
                if(pcMap[key].currentRemoteDescription){
                    axios.post(`${url}/streamice`, {...curCandidate, realm:email, viewer:key})
                } else {
                   
                    bufferMap[key].push(curCandidate)
                }
            }
        })


        var curDataChannel = pcMap[key].createDataChannel("")
        
        
        curDataChannel.onclose = function () {
            console.log('user disconnected')
            pcMap[key].close()
            pcMap[key].onicecandidate = null
            socket.off(email + "-answer", answerFunction) 
            socket.off(email + "-ice", iceFunction)

            if(streaming){
                delete pcMap[key];
                setPcMap(pcMap)
            }

        }

      
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
        
   
        
        socket.on(email + "-answer", answerFunction) 
        socket.on(email + "-ice", iceFunction)

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
            const socket = io.connect(`${url}/`)
            socket.on(curRealm+"-streaming", ()=> {
                axios.post(`${url}/${curRealm}/viewer`, {viewer: email + '-' + curRealm});
            })
            axios.post(`${url}/${curRealm}/viewer`, {viewer: email + '-' + curRealm});
            initPC();
    
        } else {
            const socket = io.connect(`${url}/`)
            socket.on(email + '-viewer', (arg) => {
                console.log(arg.viewer)
                
                if(!pcMap.hasOwnProperty(arg.viewer)){
                    setPcMap({...pcMap, [arg.viewer] : new RTCPeerConnection(servers)})
                }

                // pcMapTemp[arg.viewer] = new RTCPeerConnection(servers)
                // setPcMap(pcMapTemp)   
                
            })
        }
    }, [viewable])

    
  
 
    useEffect(() => {
        //localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
        const socket = io.connect(`${url}/`)
        if(email != curRealm){
            setViewable(true);
        } 

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
        const socket = io.connect(`${url}/`)
        setCurRealm(email)
        if(streamRef.current){
            streamRef.current.srcObject = null;
        }
        console.log('closed')
        pc.close()
        setPc(null)
        setViewable(false)
        socket.off(curRealm + "-ice")
        socket.off(curRealm +"-offer")
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
    {(!viewable) ? ((streaming)?<button onClick={() => {
        webcamRef.current.srcObject.getTracks().forEach(function(track) {
            track.stop()
        })
        setStreaming(false)
        var tempMap = {}
        Object.keys(pcMap).forEach(async function(key) {  
            tempMap[key] = new RTCPeerConnection();
            pcMap[key].close();
        })
        setPcMap(tempMap)
        webcamRef.current.srcObject = null
  
    }

    }>Stop Stream</button>: <button  onClick={async ()=>{
        const socket = io.connect(`${url}/`)
        const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user', width: 1920, height:1080}, audio:true});
        webcamRef.current.srcObject = stream;
        axios.post(`${url}/realms/${email}/streaming`);
        console.log(pcMap);
        Object.keys(pcMap).forEach(async function(key) {
            console.log(key)
            await sendOffer(stream, key, socket)
        })

        setStreaming(true)

    }}>Stream</button>):(<button onClick={() => {

    }}> 
        Join Stream
    </button>)

}
    

    </div>

    <div>
    <button  onClick={()=>{
        navigate('/');
    }} >Sign out</button>

    </div>

    

    </div>
    <div className="videoDiv">
        {(!viewable) && <video className="video" muted autoPlay ref={webcamRef} ></video>}
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
