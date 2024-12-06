import React from 'react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import TicTacToe from './TicTacToe';
import Login from './Login';

/*
	This file is the "starter motor": It places a rolling "please wait" circle on the screen, requests the
	settings from the server and once the settings have arrived starts the actual application.
	See how to implement the "please wait" indicator. This is one of the many ways to do it. It is a practical
	requirement to a lot of apps.
	...unfortunately, in the case of this app the circle will probably not be visible for more than an eyeblink
	(if that...) you can naturally try it by commenting out the fetch :-).
*/

let config : any;

function showError(e : any)
{
	console.log("Configuration error:", e);;
}

function App() {
	const [view, setView] = useState("init");
	const [user, setUser] = useState(null);
  
	const configureApp = (c: any) => {
	  config = c;
	  setView("login"); 
	};
  
	useEffect(() => {
	  fetch("/config.json", { method: "GET", mode: "cors", credentials: "include" })
		.then((r) => r.json())
		.then((j) => configureApp(j))
		.catch((e) => showError(e));
	}, []);
  

    if (view === "init") {
        return <CircularProgress />;
    } else if (view === "login") {
        return <Login />;
    } else if (view === "game") {
        return <TicTacToe config={config} user={user} />;
    } else {
        return <div>Error: Unknown view</div>;
    }
  }



export default App;
