import React, { Component } from 'react';
import Register from "./components/Register"
import Home from "./components/Home"
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
        </Routes> 
      </div>
    
      </BrowserRouter>
    );
  }
}

export default App;
