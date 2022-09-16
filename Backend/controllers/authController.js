const firebase = require('../db')
const {getAuth, createUserWithEmailAndPassword, 
signInWithEmailAndPassword} = require('firebase/auth')

const auth = getAuth(firebase)

async function createUser(email, password){    
    var uid = ""
    await createUserWithEmailAndPassword(auth, email + "@test.com", password)
    .then((userCredential) => {
        const user = userCredential.user;
        uid = (user['uid'])
        
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
    })

    return uid;
}

async function signInUser(email, password){
    var uid = ""
    
    await signInWithEmailAndPassword(auth, email + "@test.com", password)
    .then((userCredential) => {
        const user = userCredential.user;
        //console.log(user)
        uid = (user['uid'])
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
    })

    return uid
}

module.exports = {
    createUser: createUser,
    signInUser: signInUser,
}
