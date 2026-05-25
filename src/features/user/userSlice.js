import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { dummyUserData } from "../../assets/assets";
import api from "../../api/axios";

const initialState = {
    value: null,
    loading: false,
    error: null,
};

export const fetchUser = createAsyncThunk(
    "user/fetchUser",
    async (token) => {
        try {
            // For now, return dummy data since we don't have a backend API
            // TODO: Replace with actual API call when backend is ready
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(dummyUserData);
                }, 500);
            });
        } catch (error) {
            throw error;
        }
    }
);

export const updateUser = createAsyncThunk(
    "user/update",
    async ({ userData, token }) => {
        try {
            const response = await api.post('/api/user/update', userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.user) {
                return response.data.user;
            } else {
                throw new Error(response.data.message || 'Update failed');
            }
        } catch (error) {
            throw error;
        }
    }
);

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.value = action.payload;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                state.value = action.payload;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export default userSlice.reducer;