import React from "react";
import "./panel.css";

export default function Panel(props) {
  return (
    <div className='panel'>
        {props.text}
    </div>
  );
}