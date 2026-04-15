import { createBrowserRouter } from "react-router";
import { Welcome } from "./screens/Welcome";
import { Home } from "./screens/Home";
import { SearchResults } from "./screens/SearchResults";
import { JobDetail } from "./screens/JobDetail";
import { PublishJob } from "./screens/PublishJob";
import { MyJobs } from "./screens/MyJobs";
import { Chat } from "./screens/Chat";
import { Profile } from "./screens/Profile";
import { Payments } from "./screens/Payments";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Welcome />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/search",
    element: <SearchResults />,
  },
  {
    path: "/job/:id",
    element: <JobDetail />,
  },
  {
    path: "/publish",
    element: <PublishJob />,
  },
  {
    path: "/my-jobs",
    element: <MyJobs />,
  },
  {
    path: "/chat",
    element: <Chat />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/payments",
    element: <Payments />,
  },
]);