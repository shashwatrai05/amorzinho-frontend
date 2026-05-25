import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
    connections: [],
    pendingConnections: [],
    followers: [],
    following: [],
};

export const fetchConnections = createAsyncThunk('connections/fetchConnections',
    async (token) => {
        const { data } = await api.get('/api/user/connections', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return data.success ? data.connections : null;
    }
);

const connectionsSlice = createSlice({
    name: "connections",
    initialState,
    reducers: {

    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchConnections.fulfilled, (state, action) => {
                if (!action.payload) {
                    state.connections = action.payload.connections;
                    state.pendingConnections = action.payload.pendingConnections;
                    state.followers = action.payload.followers;
                    state.following = action.payload.following;

                }
                // You can set a loading state here if needed
            })
    }
});
export default connectionsSlice.reducer;