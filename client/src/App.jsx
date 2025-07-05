// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Chat } from './page/Chess';
import Login from './page/Login';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Landing from './page/landing';

export const App = () => {
  const [username, setUsername] = useState('');

  // Persist login across refreshes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUsername(user.displayName);
    });
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path="/login" element={<Login setUsername={setUsername} />} />
        <Route path="/chess" element={<Chat username={username} />} />
      </Routes>
    </BrowserRouter>
  );
};
