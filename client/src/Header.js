import { useContext, useState } from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";


export default function Header() {
  const{setUserInfo, userInfo} = useContext(UserContext);
  const navigate = useNavigate(); // Navigate after logging out 
    useEffect(() => {
      fetch('http://localhost:4000/profile', {
        credentials: 'include', 
      }).then(response => {
        response.json().then(userInfo => {
          setUserInfo(userInfo);
        });
      });
    }, []);

    function logout() {
      fetch('http://localhost:4000/logout', {
        credentials: 'include',
        method: 'POST',
      }).then(() => {
        setUserInfo(null); //clear username 
        navigate('/');
      })

    };

    const username = userInfo?.username;

    return (
        <header>
        <Link to="/" className="logo">OkinawaBites</Link>
        <nav>
          {username && (
            <>
              <Link to ="/create">Create new post</Link>
              <button onClick={logout}>Logout</button>
            </>
          )}
          {!username && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

    );
};