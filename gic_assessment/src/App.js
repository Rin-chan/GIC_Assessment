import React, { useState } from 'react';
import { Menu } from "antd";
import Main from './Main';
import { NavLink } from "react-router";

const items = [
  {
    key: 'Home',
    label: (
      <NavLink to="/">
        Home
      </NavLink>
    ),
  },
  {
    key: 'Cafe',
    label: (
      <NavLink to="/cafes">
        Cafe
      </NavLink>
    ),
  },
  {
    key: 'Employee',
    label: (
      <NavLink to="/employees">
        Employee
      </NavLink>
    ),
  }
];

function App() {
  const [current, setCurrent] = useState('mail');

  const onClick = e => {
    setCurrent(e.key);
  }
  
  return (
    <div>
      <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />;
      <Main />
    </div>
  );
}

export default App;
