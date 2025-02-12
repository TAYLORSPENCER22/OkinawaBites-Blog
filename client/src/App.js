import './App.css';
import Post from "./Post";
import Header from "./Header";
import {Route, Routes} from "react-router-dom";
import Layout from './Layout';
import IndexPage from './pages/IndexPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { UserContextProvider } from './UserContext';
import CreatePost from './pages/CreatePost';
import PostPage from './pages/PostPage';
import EditPost from './pages/EditPost';
import { useLocation } from 'react-router-dom';

function App() {

  const location = useLocation();
  let pageClass = "home";

  if (location.pathname.startsWith("/post/")) {
    pageClass = "post-page";
  } else if (location.pathname.startsWith("/edit/")) {
    pageClass = "edit-page";
  } else {
    pageClass = location.pathname.replace("/", "") || "home";
  }

  return (

    <div className={`app-container ${pageClass}`}>
    <UserContextProvider>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element ={<IndexPage />} />
        <Route path='/login' element= {<LoginPage />} /> 
        <Route path='/register' element= {<RegisterPage />} />
        <Route path='/create' element={<CreatePost />} />
        <Route path='/post/:id' element ={<PostPage />} />
        <Route path='/edit/:id' element={<EditPost />} />
      </Route>
    </Routes>
    </UserContextProvider>
    </div>

  );
}
 
export default App;
 