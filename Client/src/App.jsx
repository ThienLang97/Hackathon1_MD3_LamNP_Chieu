import React from 'react'
import Login from './Components/Login.jsx';
import Todo from "./Components/Todo";
import { Routes, Route } from "react-router-dom";
export default function App() {
  return (
      <Routes>
          <Route path="/" element={<Login></Login>}></Route>
          <Route path="/todo" element={<Todo></Todo>}></Route>
      </Routes>
  );
}
