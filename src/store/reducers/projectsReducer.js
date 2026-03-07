import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    projects: [],
    loading: false,
    error: null,
}

const projectsSlice = createSlice({
    name: "projects",
    initialState,
    reducers: {}
})

export default projectsSlice.reducer;