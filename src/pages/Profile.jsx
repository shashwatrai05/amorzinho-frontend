import React, { useEffect, useState } from 'react'
import { dummyPostsData, dummyUserData } from '../assets/assets';
import Loading from '../components/Loading';
import { Link, useParams } from 'react-router-dom';
import UserProfileInfo from '../components/UserProfileInfo';
import PostCard from '../components/PostCard';
import moment from 'moment';
import ProfileModal from '../components/ProfileModal';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import api from '../api/axios';

const Profile = () => {

  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const { profileId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [showEdit, setShowEdit] = useState(false);

  const fetchCurrentUser = async () => {
    const token = await getToken();
    try {
      const { data } = await api.get('/api/user/data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      return null;
    }
  };

  const fetchUserProfile = async (profileId) => {
    const token = await getToken();
    console.log('Fetching user profile with profileId:', profileId);
    console.log('Token:', token ? 'Present' : 'Missing');

    try {
      const { data } = await api.post('/api/user/profiles', { profileId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('API Response:', data);

      if (data.profile) {
        setUser(data.profile);
        setPosts(data.posts);
      } else {
        toast.error(data.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchUser = async (profileId) => {
    if (profileId) {
      // Viewing someone else's profile
      await fetchUserProfile(profileId);
    } else {
      // Viewing your own profile - get current user data first
      const currentUserData = await fetchCurrentUser();
      if (currentUserData) {
        console.log('Current user data:', currentUserData);
        setUser(currentUserData);
        // Now fetch just the posts for this user
        await fetchUserPosts(currentUserData._id);
      } else {
        // Fallback to dummy data if authentication fails
        setUser(currentUser);
        setPosts([]);
      }
    }
  };

  const fetchUserPosts = async (userId) => {
    const token = await getToken();
    console.log('Fetching posts for userId:', userId);

    try {
      const { data } = await api.post('/api/user/profiles', { profileId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Posts API Response:', data);

      if (data.posts) {
        setPosts(data.posts);
        console.log('Posts set:', data.posts.length, 'posts');
      } else {
        console.log('No posts returned');
        setPosts([]);
      }
    } catch (error) {
      console.error('Posts fetch error:', error);
      setPosts([]);
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  useEffect(() => {
    fetchUser(profileId);
  }, [profileId]);

  return user ? (
    <div className='relative h-full overflow-y-scroll bg-gray-50 p-6'>
      <div className='max-w-3xl mx-auto'>
        {/* Profile Card */}
        <div className='bg-white rounded-2xl shadow overflow-hidden'>
          {/* Cover Photo */}
          <div className='h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200'>
            {user.cover_photo && <img src={user.cover_photo} alt="Cover" className='w-full h-full object-cover' />}
          </div>
          {/* User Info */}
          <UserProfileInfo user={user} posts={posts} profileId={profileId} setShowEdit={setShowEdit} />
        </div>

        {/* Tabs */}

        <div className='mt-6'>
          <div className='bg-white rounded-xl shadow p-1 flex max-w-md mx-auto'>
            {["posts", "media", "likes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors corsor-pointer ${activeTab === tab ? "bg-indigo-600 text-white" :
                  "text-gray-600 hover:text-gray-900"}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Posts Section */}
          {activeTab === 'posts' && (
            <div className='mt-6 flex flex-col items-center gap-6'>
              {posts.map((post) => <PostCard key={post._id} post={post} />)}
            </div>
          )}

          {/* Media Section */}
          {activeTab === 'media' && (
            <div className='flex flex-wrap mt-6 max-w-6xl'>
              {posts
                .filter(post => post.image_urls.length > 0)
                .map((post) =>
                  post.image_urls.map((image, index) => (
                    <Link
                      key={`${post._id}-${index}`}
                      target="_blank"
                      to={image}
                      className='relative group'
                    >
                      <img
                        src={image}
                        alt=""
                        className='w-64 aspect-video object-cover'
                      />
                      <p className='absolute bottom-0 right-0 text-xs p-1 px-3 backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition duration-300'>
                        Posted {moment(post.createdAt).fromNow()}
                      </p>
                    </Link>
                  ))
                )}
            </div>
          )}


        </div>

      </div>

      {showEdit && <ProfileModal setShowEdit={setShowEdit} currentUserData={user} onUserUpdate={handleUserUpdate} />}
    </div>
  ) : <Loading />;
}

export default Profile
