import { Badge, BadgeCheck, Heart, MessageCircle, ShareIcon } from 'lucide-react';
import moment from 'moment';
import React, { useState } from 'react';
import { dummyUserData } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const PostCard = ({ post }) => {
    const postWithHashtags = post.content.replace(/#(\w+)/g, '<span class="text-blue-500 cursor-pointer">#$1</span>');
    const [likes, setLikes] = useState(post.likes_count || []);
    const currentUser = useSelector((state) => state.user.value);

    const { getToken } = useAuth();

    const handleLike = async () => {
        if (!currentUser) return;

        const isCurrentlyLiked = likes.includes(currentUser._id);

        // Optimistically update UI
        if (isCurrentlyLiked) {
            setLikes(prev => prev.filter(id => id !== currentUser._id));
        } else {
            setLikes(prev => [...prev, currentUser._id]);
        }

        try {
            const { data } = await api.post('/api/post/like', { postId: post._id },
                { headers: { Authorization: `Bearer ${await getToken()}` } }
            );

            // Just show the message from backend
            if (data.message) {
                toast.success(data.message);
            }
        } catch (error) {
            // Revert the optimistic update on error
            if (isCurrentlyLiked) {
                setLikes(prev => [...prev, currentUser._id]);
            } else {
                setLikes(prev => prev.filter(id => id !== currentUser._id));
            }
            console.error('Like error:', error);
            toast.error(error.response?.data?.message || 'Failed to update like');
        }
    }

    const navigate = useNavigate()

    return (
        <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl">
            {/* User Info */}
            <div onClick={() => navigate('/profile/' + post.user._id)} className='inline-flex items-center gap-3 cursor-pointer'>
                <img
                    src={post.user.profile_picture}
                    alt="User Profile"
                    className="w-10 h-10 rounded-full shadow"
                />
                <div>
                    <div>
                        <span>{post.user.full_name}</span>
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className='text-gray-500 text-sm'>@{post.user.username} {moment(post.createdAt).fromNow()}</div>
                </div>
            </div>

            {/* Post Content */}
            {post.content && (
                <div className='text-gray-800 text-sm white-space-pre-line'
                    dangerouslySetInnerHTML={{ __html: postWithHashtags }} />
            )}

            {/* Post Image */}
            <div className='grid grid-cols-2 gap-2'>
                {post.image_urls.map((image, index) => (
                    <img key={index} src={image} alt={`Post image ${index + 1}`} className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 && 'col-span-2 h-auto'}`} />
                ))}
            </div>

            {/* Post Actions */}
            <div className='flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300'>
                <div className='flex items-center gap-1'>
                    <Heart
                        className={`w-4 h-4 cursor-pointer ${currentUser && likes.includes(currentUser._id) ? 'text-red-500 fill-red-500' : 'hover:text-red-400'}`}
                        onClick={handleLike}
                    />
                    <span>{Array.isArray(likes) ? likes.length : 0}</span>
                </div>
                <div className='flex items-center gap-1'>
                    <MessageCircle className='w-4 h-4' />
                    <span>{12}</span>
                </div>

                <div className='flex items-center gap-1'>
                    <ShareIcon className='w-4 h-4' />
                    <span>{7}</span>
                </div>

            </div>
        </div>
    );
}

export default PostCard;