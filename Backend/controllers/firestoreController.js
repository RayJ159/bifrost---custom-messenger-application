const {getFirestore, collection, setDoc, addDoc, doc, getDocs} = require('firebase/firestore')
const firebase = require('../db')
const pool = require('../sqldb')

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
        
        var queryString = `CREATE TABLE IF NOT EXISTS ${chatRoomName} (email VARCHAR(255), messageText VARCHAR(65535), messageTime BIGINT)`
        const newTable = await pool.query(queryString)
        console.log("table created")
        
    } catch(e) {
        console.log(e);
        console.log("error creating chat room")
    }
   

}

async function addMessages(chatRoomName, email, text){
    try{
        //await addDoc(collection(firestore, '/realms/' + chatRoomName + '/messages'), {
          //  name: email,
            //text: text,
            //time: Date.now(), 
        //})

        var queryString = `INSERT INTO ${chatRoomName} (email, messageText, messageTime) VALUES ('${email}', '${text}', '${Date.now()}')`

        const newMessage = await pool.query(queryString)


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
        //var messages = []


        //const querySnapshot = await getDocs(collection(firestore, "/realms/" + chatRoomName+"/messages"));
        //querySnapshot.forEach((doc) => {
            //messages.push(doc.data())

        //})

        var queryString = `SELECT * FROM ${chatRoomName}`
        var messages = await pool.query(queryString)
        return messages.rows
        

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