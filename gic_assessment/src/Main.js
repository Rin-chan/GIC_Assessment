import React from 'react';
import { Routes, Route } from 'react-router';

import Home from './pages';
import Cafe from './pages/Cafe'
import Employee from './pages/Employee';

const Main = () => {
  return (
    <Routes>
      <Route exact path='/' element={<Home />}></Route>
      <Route exact path='/cafes' element={<Cafe />}></Route>
      <Route exact path='/employees' element={<Employee />}></Route>
    </Routes>
  );
}

export default Main;
