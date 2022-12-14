const {getFirestore, collection, setDoc, addDoc, doc, getDocs} = require('firebase/firestore')
const firebase = require('../db')

const firestore = getFirestore(firebase)

async function addUserEmail(uid, email) {
    try{
        const docRef = await setDoc(doc(firestore, "users", uid),{
            email: email,
        })
        console.log('document written')

    } catch(e) {
        console.log("error writing document")
        console.log(e)

    }
    
}

async function createChatRoom(chatRoomName){
    try{
        await setDoc(doc(firestore, "realms", chatRoomName), {})
        await addDoc(collection(firestore, "realms/" + chatRoomName +"/messages"), {
            name: "Realm Master",
            text: "Welcome to this realm"
        })

        
    } catch(e) {
        console.log("error creating chat room")
    }
    messageRef.addDoc();

}

async function addMessages(chatRoomName, email, text){
    try{
        await addDoc(collection(firestore, '/realms/' + chatRoomName + '/messages'), {
            name: email,
            text: text,
            time: Date.now(), 
        })
        console.log("message added")

        return true

    } catch (e) {
        console.log("error adding message")
        console.log(e)
        return false

    }
}

async function getMessages(chatRoomName){
    try{
        var messages = []


        const querySnapshot = await getDocs(collection(firestore, "/realms/" + chatRoomName+"/messages"));
        querySnapshot.forEach((doc) => {
            messages.push(doc.data())

        })
        return messages
        

    } catch (e) {
        console.log("error receiving messages")
        console.log(e)

    }
}



module.exports = {
    addUserEmail: addUserEmail,
    createChatRoom: createChatRoom,
    getMessages: getMessages,
    addMessages: addMessages,
    firestore: firestore,
}