import {configureStore} from "@reduxjs/toolkit";

import projectsReducer from "./reducers/projectsReducer"

const store = configureStore({
    reducer: {
        projects: projectsReducer,
    }
});

export default store;