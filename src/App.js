import React, { Component } from 'react';
import Register from "./components/Register"
import Home from "./components/Home"
import SignUp from "./components/SignUp"
import "bootstrap/dist/css/bootstrap.css"
import {BrowserRouter, Routes, Route} from "react-router-dom"


class App extends Component {
  render() {
    return (
      <BrowserRouter>
      
      <div className="App">
        <Routes>
        <Route path="/" element={<Register/>}/>
        <Route path="/home" element={<Home/>}/>
        <Route path="/SignUp" element={<SignUp/>}/>
        </Routes>
      </div>
    
      </BrowserRouter>
    );
  }
}

export default App;
