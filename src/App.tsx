
import './App.css'
import { useEffect, useState } from 'react'
import Post from './Post';
import ImageUpload from './image-upload';
import { Button, Modal, Box, Input } from "@mui/material";



// Comment type
export interface CommentPostType {
  id: number;
  text: string;
  username: string;
  timestamp: string;
}

// User type
interface UserType {
  id: number;
  username: string;
}

// Post type
export interface PostType {
  id: number;
  image_url: string;
  image_url_type: "relative" | "absolute";
  caption: string;
  timestamp: string;
  user: UserType;
  comments: CommentPostType[];
}

export const BASE_URL = 'http://127.0.0.1:8000/';


function App() {


  const [posts, setPosts] = useState<PostType[]>([]);
  const [openSignIn, setOpenSignIn] = useState<boolean>(false);
  const [openSignUp, setOpenSignUp] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>('');
  const [email, setEmail] = useState<string | null>('');
  const [password, setPassword] = useState<string>('');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authTokenType, setAuthTokenType] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>('');

  useEffect(() => {
    const storedAuthToken = window.localStorage.getItem('authToken');
    const storedAuthTokenType = window.localStorage.getItem('authTokenType');
    const storedUsername = window.localStorage.getItem('username');
    const storedUserId = window.localStorage.getItem('userId');

    setAuthToken(storedAuthToken);
    setAuthTokenType(storedAuthTokenType);
    setUsername(storedUsername);
    setUserId(storedUserId);
  }, []); 

  useEffect(() => {
    if (authToken) {
      window.localStorage.setItem('authToken', authToken);
    }
    if (authTokenType) {
      window.localStorage.setItem('authTokenType', authTokenType);
    }
    if (userId) {
      window.localStorage.setItem('userId', userId);
    }
    if (username) {
      window.localStorage.setItem('username', username);
    }
  }, [authToken, authTokenType, userId]);

  useEffect(() => {
    fetch(BASE_URL + 'post/all')
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        throw response
      })
      .then(data => {
        const sortedPosts = data.sort((a: PostType, b: PostType) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        setPosts(sortedPosts);
      })
      .catch(error => {
        console.log(error)
        alert(error)
      })
  }, [])

  const handleSignInRequest = (username: string, password: string) => {
    let formData = new FormData();
    formData.append('username', username || '');
    formData.append('password', password);
  
    const requestOptions = {
      method: 'POST',
      body: formData,
    };
  
    fetch(BASE_URL + 'login', requestOptions)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((data) => {
        console.log(data);
        setAuthToken(data.access_token);
        setAuthTokenType(data.token_type);
        setUserId(data.user_id);
        setUsername(data.username);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const signIn = (event: any) => {
    event.preventDefault();
    handleSignInRequest(username || '', password);
    setOpenSignIn(false);
  };

  const signUp = (event: any) => {
    event.preventDefault();
    
    const json_string = JSON.stringify({
      'username': username,
      'email': email,
      'password': password
    })

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: json_string
    }

    fetch(BASE_URL + 'user', requestOptions)
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        throw response
      })
      .then(() => {
        handleSignInRequest(username || '', password);      
      })
      .catch(error => {
        console.log(error)
      })
    
    setOpenSignUp(false);
  }

  const signOut = () => {
    setAuthToken(null);
    setAuthTokenType(null);
    setUserId('');
    setUsername('');
  }

  return (
    <div className="app">

      <div className="app-header">
        <img className='app-header-image' src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/132px-Instagram_logo_2016.svg.png?20210403190622" alt="instagram" />
        {authToken ? (
          <Button onClick={() => signOut()}>Logout</Button>
        ) : (
          <div>
            <Button onClick={() => setOpenSignIn(true)}>Login</Button>
            <Button onClick={() => setOpenSignUp(true)}>Sign up</Button>
          </div>
        )}
      </div>

      <div className='app-posts'>
        {posts.map(post => (
          <Post post={post} authToken={authToken} authTokenType={authTokenType} username={username} />
        ))}
      </div>

      {authToken ? (
        <ImageUpload authToken={authToken} authTokenType={authTokenType} userId={userId} />
      ) : (
        <h4>You need to login to upload</h4>
      )}

      <Modal open={openSignIn} onClose={() => setOpenSignIn(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 1,
            width: 400,
          }}
        >
          <form className='app-signin'>
            <center>
              <img className='app-header-image' src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/132px-Instagram_logo_2016.svg.png?20210403190622" alt="instagram" />
            </center>
            <Input
              placeholder='username'
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              placeholder='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type='submit' onClick={signIn}>Login</Button>
          </form>
        </Box>
      </Modal>

      <Modal open={openSignUp} onClose={() => setOpenSignUp(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 1,
            width: 400,
          }}
        >
          <form className='app-signin'>
            <center>
              <img className='app-header-image' src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/132px-Instagram_logo_2016.svg.png?20210403190622" alt="instagram" />
            </center>
            <Input
              placeholder='username'
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              placeholder='email'
              type='text'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type='submit' onClick={signUp}>Sign up</Button>
          </form>
        </Box>
      </Modal>

    </div>
  );
}

export default App
