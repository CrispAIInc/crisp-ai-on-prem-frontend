import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

// import Sonnet from '../../components/Sonnet';

function Navbar() {
  return (
    <Tabs
      defaultActiveKey="profile"
      id="uncontrolled-tab-example"
      className="mb-3"
    >
      <Tab eventKey="home" title="Home" className='navbar-button'>
        {/* <Sonnet /> */} {"aaaaaaaaaa"}
      </Tab>
      <Tab eventKey="profile" title="Profile" className='navbar-button'>
        {/* <Sonnet /> */}{"bbbbbbbb"}
      </Tab>
      <Tab eventKey="contact" title="Contact" className='navbar-button'>
        {/* <Sonnet /> */}
      </Tab>
    </Tabs>
  );
}

export default Navbar;



// import React from "react";
// import "./navbar.css";

// export default function Navbar(props) {
//   return (
//     <div className='navbar'>
//         <button className="navbar-button">English Transcription</button>
//         <button className="navbar-button">Video Summary</button>
//         <button className="navbar-button">Video Topics</button>
//     </div>
//   );
// }


