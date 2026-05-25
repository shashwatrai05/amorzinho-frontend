import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

const initialState = {
    messages: [],
};

export const fetchMessages = createAsyncThunk(
    "messages/fetchMessages",
    async ({ userId, token }) => {
        const { data } = await api.get(`/api/messages/get`, { to_user_id: userId }, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return data.success ? data.messages : null;
    }
)

const messagesSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload;
        },

        addMessages: (state, action) => {
            state.messages = [...state.messages, action.payload];
        },

        resetMessages: (state) => {
            state.messages = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.messages = action.payload.messages || [];
            })
    }
});

export const { setMessages, addMessages, resetMessages } = messagesSlice.actions;

export default messagesSlice.reducer;