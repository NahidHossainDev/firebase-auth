import React, { useState } from 'react';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig)

const provider = new firebase.auth.GoogleAuthProvider();

function App() {
  const [newUser,setNewUser] =useState(false)
  const [user, setUser] = useState({
    isLogin: false,
    name: '',
    email: '',
    password:'',
    photo: '',
    error: '',
    success: false,
    newUser: newUser
  })

  const handleSignIn = () => {
    firebase.auth().signInWithPopup(provider)
      .then(res => {
        const { displayName, email, photoURL } = res.user;
        const isSignIn = {
          isLogin: true,
          name: displayName,
          email: email,
          photo: photoURL,
        }
        setUser(isSignIn);
        // console.log(displayName, photoURL, email)
      }).catch(error => console.log(error, error.message))
  }
  const handleSignOut = () => {
    console.log('Sign Out is clicked')
    firebase.auth().signOut()
    .then((result) => {
      const signedOut = {
        isLogin: false,
        name: '',
        email: '',
        photo: '',
      }
      setUser(signedOut)
    }).catch((err) => console.log(err));
  }

  const handleSubmit = (e) => {
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user }
          newUserInfo.success = true
          setUser(newUserInfo);
          updateUserName(user.name);

        })
        .catch(error => {
          const newUserInfo = {...user}
          newUserInfo.error = error.message;
          newUserInfo.success = false
          setUser(newUserInfo);
      });
    }
    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user }
          newUserInfo.success = true
          setUser(newUserInfo)
          console.log('sign in user info = ', res.user)
        })
        .catch(error => {
          const newUserInfo = { ...user }
          newUserInfo.error = error.message;
          newUserInfo.success = false
          setUser(newUserInfo);
        });
    }
      e.preventDefault();
  }
  let filedValidation = true;
  const handleChange = (event) => {
    if (event.target.name === "email") {
      filedValidation = /\S+@\S+\.\S+/.test(event.target.value)
    }
    if (event.target.name === "password") {
      const passwordLength = event.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(event.target.value);
      filedValidation = (passwordLength && passwordHasNumber) 
    }
    if (filedValidation) {
      const newUserInfo = { ...user }
      newUserInfo[event.target.name] = event.target.value;
      setUser(newUserInfo);
    }
  }

  const updateUserName = (name) => {
    var user = firebase.auth().currentUser;

    user.updateProfile({
      displayName:name
    }).then(function () {
      console.log('user name update successfully')
    }).catch(function (error) {
      console.log(error)
    });

  }

  return (
    <div className="App">
      {
        user.isLogin ? <button onClick={handleSignOut}>Sing Out</button>
          : <button onClick={handleSignIn}>Sign In</button>
     }
      {
        user.isLogin && <div>
          <p>Welcome, <h3 style={{display:'inline-block'}}>{user.name}</h3></p>
          <p>Email: {user.email}</p>
          <img style={{ width: "200px", height: '200px', borderRadius: '50%' }} src={user.photo} alt="" />
        </div>
      }
      <div className="sign-Up" style={{ marginTop: '100px' }}>
        
        <form onSubmit={handleSubmit}>
          <label for='newUser' >New user</label>
          <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id=""  />
          <br />
          {newUser && <input type="text" name="name" onBlur={handleChange} placeholder="Your Name" required />}
            <br />
          <input type="email" name="email" onBlur={handleChange} placeholder="Email address" required />
          <br />
          <input type="password" name="password" onBlur={handleChange} placeholder="Password" required />
          <br />
          <input type="submit" name="" value={newUser ? "Sign Up" : "Sign In"}/>
        </form>
        {
          user.success ? <p style={{ color: 'green' }}>Sign {newUser ?"Up": "In"} done successfully</p>
            : <p style={{ color: 'red' }}>{user.error}</p>
        }
      </div>
    </div>
  );
}

export default App;
