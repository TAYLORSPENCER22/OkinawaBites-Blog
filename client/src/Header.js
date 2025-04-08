import { useContext, useState } from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";


export default function Header() {
  const{setUserInfo, userInfo} = useContext(UserContext);
  const navigate = useNavigate(); // Navigate after logging out 
  const [sidebarVisible, setSideBarVisible] = useState(false);
 
    useEffect(() => {
      fetch('http://localhost:4000/profile', {
        credentials: 'include', 
      }).then(response => {
        response.json().then(userInfo => {
          setUserInfo(userInfo);
        });
      });
    }, []);

    //used to log out of the web page 
    function logout() {
      fetch('http://localhost:4000/logout', {
        credentials: 'include', //cookies are sent through cors (cross-origin-request)
        method: 'POST',
      }).then(() => {
        setUserInfo(null); //clear username 
        setSideBarVisible(false); //if clicked from mobile 
        navigate('/'); //nav
      })
    };

    //sidebar function 

    function showSideBar() {
      setSideBarVisible(true);
    }


    const username = userInfo?.username;

    return (
        <header>
        <nav className="regularNav">
        <Link to="/" className="logo ogOB">OkinawaBites</Link>
        
          {username && (
            <>
              <button onClick={logout}> <svg xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke-width="1.5" 
              stroke="currentColor" 
              class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
        </svg>Logout</button>
              <Link to ="/create" className="createNewPost"> 
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Zm-32-80a8,8,0,0,1-8,8H136v32a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h32V88a8,8,0,0,1,16,0v32h32A8,8,0,0,1,176,128Z"></path></svg>
              Create new post</Link>
              
            </>
          )}
          {!username && (
            <>
            
              <Link to="/login" className="loginHeader">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M141.66,133.66l-40,40a8,8,0,0,1-11.32-11.32L116.69,136H24a8,8,0,0,1,0-16h92.69L90.34,93.66a8,8,0,0,1,11.32-11.32l40,40A8,8,0,0,1,141.66,133.66ZM200,32H136a8,8,0,0,0,0,16h56V208H136a8,8,0,0,0,0,16h64a8,8,0,0,0,8-8V40A8,8,0,0,0,200,32Z"></path></svg>
                Sign In</Link>
              <Link to="/register" className="registerHeader">Register</Link>
              
            </>
          )}
         
        </nav>

{/* separate navBar for / mobile views */}
       
      
       <svg onClick={showSideBar} className="listBtn" xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="#F6F6F6" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path></svg>
       <Link to="/" className="navNewLogo">OkinawaBites</Link>
        <nav className="responsiveNavBar" style={{ display: sidebarVisible ? 'flex' : 'none' }}>
        <svg className="exitBtn" onClick={() => setSideBarVisible(false)} xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="#F6F6F6" viewBox="0 0 256 256"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208ZM165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32Z"></path></svg>
          {username && (
            <>
              <button className="nav.new" onClick={logout}> <svg xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke-width="1.5" 
              stroke="currentColor" 
              class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
        </svg>Logout</button>
              <Link to ="/create" className="createNewPost nav.new" onClick={() => setSideBarVisible(false)}> 
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Zm-32-80a8,8,0,0,1-8,8H136v32a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h32V88a8,8,0,0,1,16,0v32h32A8,8,0,0,1,176,128Z"></path></svg>
              Create new post</Link>
              
            </>
          )}
          {!username && (
            <>
            
              <Link to="/login" className="loginHeader nav.new" onClick={() => setSideBarVisible(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M141.66,133.66l-40,40a8,8,0,0,1-11.32-11.32L116.69,136H24a8,8,0,0,1,0-16h92.69L90.34,93.66a8,8,0,0,1,11.32-11.32l40,40A8,8,0,0,1,141.66,133.66ZM200,32H136a8,8,0,0,0,0,16h56V208H136a8,8,0,0,0,0,16h64a8,8,0,0,0,8-8V40A8,8,0,0,0,200,32Z"></path></svg>
                Sign In</Link>
              <Link to="/register" className="registerHeader" onClick={() => setSideBarVisible(false)}>Register</Link>
              
            </>
          )}
         
        </nav>
      </header>

    );
};