import { createSlice } from "@reduxjs/toolkit";

const chatIdSlice = createSlice({
    name: "chatId",
    initialState: {
        chatsId: {}
    },
    reducers: {
        setChatsId: (state, action) => {
            state.chatsId = action.payload;
        }
    }
});
export const setChatsId = chatIdSlice.actions.setChatsId;
export default chatIdSlice.reducer;