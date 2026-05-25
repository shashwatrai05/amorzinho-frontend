import React, { useState, useEffect } from 'react'
import { dummyUserData } from '../assets/assets';
import { Image, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CreatePost = () => {

  const navigate = useNavigate();

  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  const users = useSelector((state) => state.user.value);

  const { getToken } = useAuth();

  const fetchCurrentUser = async () => {
    const token = await getToken();
    try {
      const { data } = await api.get('/api/user/data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(data);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      // Fallback to Redux store data
      setCurrentUser(users);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const handlePostSubmit = async () => {
    // Logic to handle post submission
    if (!images.length && !content) {
      return toast.error("Post cannot be empty");
    }

    setLoading(true);

    const postType = images.length > 0 && content.trim() !== '' ? 'text_with_image' : images.length > 0 ? 'image' : 'text';

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('post_type', postType);
      images.map((img) => formData.append('images', img));

      const { data } = await api.post('/api/post/add', formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        }
      });

      if (data.message === "Post created successfully") {
        navigate('/');
      }
      else {
        console.log('Post creation failed:', data.message);
        throw new Error(data.message || 'Failed to create post');
      }

    } catch (error) {
      console.log('Error publishing post:', error);
      throw new Error(error.message);
    }

    setLoading(false);
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Title */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Create Post</h1>
          <p className='text-slate-600'>Talk to your little love</p>
        </div>

        {/* Post Form */}
        <div className='max-w-xl bg-white p-4 sm:p-8 sm:pb-3 rounded-xl shadow-md space-y-4'>
          {/* Header */}
          <div className='flex items-center gap-3'>
            <img src={currentUser?.profile_picture || users?.profile_picture} alt="" className='w-12 h-12 rounded-full shadow' />
            <div>
              <h2 className='font-semibold'>{currentUser?.full_name || users?.full_name}</h2>
              <p className='text-sm text-gray-500'>@{currentUser?.username || users?.username}</p>
            </div>
          </div>

          {/* Textarea */}

          <textarea className='w-full resize-none max-h-20 mt-4 text-sm outline-none placeholder-gray-400' placeholder="What's Happening?"
            onChange={(e) => setContent(e.target.value)} value={content}></textarea>

          {/* Image Upload */}
          {
            images.length > 0 && <div className='flex flex-wrap gap-2 mt-4'>
              {images.map((img, index) => (
                <div key={index} className='relative group'>
                  <img src={URL.createObjectURL(img)} alt={`upload-${index}`} className='h-20 rounded-md' />
                  <div onClick={() => setImages(images.filter((_, idx) => idx !== index))}
                    className='absolute hidden group-hover:flex justify-center items-center top-0 
                  right-0 bottom-0 left-0 bg-black/40 rounded-md cursor-pointer'>
                    <X className='w-6 h-6 text-white' />
                  </div>
                </div>
              )
              )}
            </div>
          }

          {/* Actions */}

          <div className='flex item-center justify-between pt-3 border-t border-gray-300'>
            <label htmlFor="images" className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer'>
              <Image className='size-6' />
            </label>

            <input type="file" id="images" accept='image/*' hidden multiple onChange={(e) => setImages([...images, ...e.target.files])} />
            <button disabled={loading} onClick={() => toast.promise(
              handlePostSubmit(),
              {
                loading: 'Uploading...',
                success: 'Post published successfully!',
                error: 'Failed to publish post'
              }
            )} className='text-sm bg-gradient-to-r from-indigo-500 to-purple-600 
            hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white
            font-medium px-8 py-2 rounded-md cursor-pointer'>Publish Post</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePost
