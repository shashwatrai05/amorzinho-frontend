import React, { use, useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Feed from './pages/Feed.jsx'
import Discover from './pages/Discover.jsx'
import Messages from './pages/Messages.jsx'
import Profile from './pages/Profile.jsx'
import Login from './pages/Login.jsx'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connections.jsx'
import CreatePost from './pages/CreatePost.jsx'
import Layout from './pages/Layout.jsx'
import { useAuth } from '@clerk/clerk-react'
import Loading from './components/Loading.jsx'
import toast, { Toaster } from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { fetchUser } from './features/user/userSlice.js'
import { fetchConnections } from './features/connections/connectionsSlice.js'
import { addMessages } from './features/messages/messagesSlice.js'
import Notification from './components/Notification.jsx'

const App = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { getToken } = useAuth();
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname)

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      if (isSignedIn) {
        const token = await getToken();
        dispatch(fetchUser(token));
        dispatch(fetchConnections(token));
      }
    }
    fetchData();
  }, [isSignedIn, getToken, dispatch]);

  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname]);

  useEffect(() => {
    if (isSignedIn) {
      const eventSource = new EventSource(import.meta.env.VITE_BASEURL + '/api/message/' + User.id)
    }

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('New message received:', message);
      if (pathnameRef.current !== '/messages/' + message.from_user_id.id) {
        dispatch(addMessages(message));
      } else {
        toast.custom((t) => (
          <Notification t={t} message={message} />
        ), { position: 'bottom-right' });
      }

    }

    return () => {
      eventSource.close();
    }
  }, [isSignedIn, getToken, dispatch]);

  // Show loading while Clerk loads
  if (!isLoaded) {
    return <Loading />
  }

  // If user is not signed in, show login page
  if (!isSignedIn) {
    return <Login />
  }

  // If user is signed in, show the main app with Layout
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Feed />} />
          <Route path="discover" element={<Discover />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<ChatBox />} />
          <Route path="connections" element={<Connections />} />
          <Route path="createpost" element={<CreatePost />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:profileId" element={<Profile />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </>
  )
}

export default App
