import React, { useEffect, useState } from "react";
import { dummyStoriesData } from "../assets/assets";
import { Plus } from "lucide-react";
import moment from "moment";
import StoryModel from "./StroyModel";
import StoryViewer from "./StoryViewer";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const StoriesBar = () => {

    const { getToken } = useAuth();
    const [stories, setStories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [viewStory, setViewStory] = useState(null);

    const fetchStories = async () => {
        try {
            const token = await getToken();
            const { data } = await api.get("/api/story/get", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.stories) {
                setStories(data.stories);
            } else {
                // Fallback to dummy data if API call fails
                toast(data.message || 'Failed to fetch stories, loading dummy data', { icon: '⚠️' });
            }
        } catch (error) {
            toast.error(error.message || error.message || 'Failed to fetch stories');
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    return (
        <div className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl overflow-x-auto no-scrollbar px-4">
            <div className="flex gap-4 pb-5">
                {/* Add Story Button */}
                <div onClick={() => setShowModal(true)} className="rounded-lg shadow-sm min-w-[120px] max-w-[120px] h-40 aspect-[3/4]
          cursor-pointer hover:shadow-lg transition-all duration-200 border-2
          border-dashed border-indigo-400 bg-gradient-to-b from-indigo-50 to-white">
                    <div className="h-full flex flex-col items-center justify-center p-4">
                        <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mb-3">
                            <Plus className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-sm font-medium text-slate-700 text-center">
                            Add Story
                        </p>
                    </div>
                </div>

                {/* Stories */}
                {stories.map((story, index) => (
                    <div onClick={() => setViewStory(story)}
                        key={index}
                        className="relative rounded-lg shadow min-w-[120px] max-w-[120px] h-40 cursor-pointer 
            hover:shadow-lg transition-all duration-200 bg-gradient-to-b from-indigo-500 
            to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 overflow-hidden"
                    >
                        {/* Profile Image */}
                        <img
                            src={story.user.profile_picture}
                            alt="story"
                            className="absolute w-8 h-8 top-3 left-3 z-10 rounded-full ring ring-gray-100 shadow"
                        />
                        {/*content*/}
                        <p className="absolute top-16 left-3 text-white/60 text-sm truncate max-w-24">
                            {story.content}
                        </p>
                        {/* Timestamp */}
                        <p className="text-white absolute bottom-1 right-2 z-10 text-xs">
                            {moment(story.createdAt).fromNow()}
                        </p>

                        {/* Media */}
                        {story.media_type !== "text" && (
                            <div className="absolute inset-0 z-[1] rounded-lg overflow-hidden">
                                {story.media_type === "image" ? (
                                    <img
                                        src={story.media_url}
                                        alt="story media"
                                        className="h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80"
                                    />
                                ) : (
                                    <video
                                        src={story.media_url}
                                        autoPlay
                                        muted
                                        loop
                                        className="h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {/* Add Story Modal */}
            {showModal && <StoryModel setShowModal={setShowModal} fetchStories={fetchStories} />}

            {/* View Story Modal */}
            {viewStory && <StoryViewer viewStory={viewStory} setViewStory={setViewStory} />}
        </div>
    );
};

export default StoriesBar;
