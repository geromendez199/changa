import { lazy, Suspense, type ComponentType, type ReactElement } from "react";
import { createBrowserRouter, Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { IS_DEVELOPMENT_FALLBACK } from "../services/service.utils";
import { BrandLogo } from "./components/BrandLogo";

const Welcome = lazy(() => import("./screens/Welcome").then((module) => ({ default: module.Welcome })));
const Home = lazy(() => import("./screens/Home").then((module) => ({ default: module.Home })));
const SearchResults = lazy(() =>
  import("./screens/SearchResults").then((module) => ({ default: module.SearchResults })),
);
const JobDetail = lazy(() => import("./screens/JobDetail").then((module) => ({ default: module.JobDetail })));
const PublishJob = lazy(() => import("./screens/PublishJob").then((module) => ({ default: module.PublishJob })));
const MyJobs = lazy(() => import("./screens/MyJobs").then((module) => ({ default: module.MyJobs })));
const Chat = lazy(() => import("./screens/Chat").then((module) => ({ default: module.Chat })));
const Profile = lazy(() => import("./screens/Profile").then((module) => ({ default: module.Profile })));
const Payments = lazy(() => import("./screens/Payments").then((module) => ({ default: module.Payments })));
const ChatDetail = lazy(() => import("./screens/chat/ChatDetail").then((module) => ({ default: module.ChatDetail })));
const EditProfile = lazy(() =>
  import("./screens/profile/EditProfile").then((module) => ({ default: module.EditProfile })),
);
const PublishConfirmation = lazy(() =>
  import("./screens/publish/PublishConfirmation").then((module) => ({ default: module.PublishConfirmation })),
);
const NotFound = lazy(() => import("./screens/NotFound").then((module) => ({ default: module.NotFound })));
const Login = lazy(() => import("./screens/auth/Login").then((module) => ({ default: module.Login })));
const Signup = lazy(() => import("./screens/auth/Signup").then((module) => ({ default: module.Signup })));
const Notifications = lazy(() =>
  import("./screens/Notifications").then((module) => ({ default: module.Notifications })),
);

function RouteFallback() {
  return (
    <div className="app-screen bg-[#F8FAFC] px-6 pt-20 font-['Inter'] text-gray-500 lg:px-10">
      <div className="app-content-shell">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 text-center">
          <BrandLogo className="flex justify-center" imageClassName="h-12 w-auto object-contain" />
          <p className="mt-3">Cargando pantalla...</p>
        </div>
      </div>
    </div>
  );
}

function withSuspense(Component: ComponentType) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Component />
    </Suspense>
  );
}

function RequireAuth({ children }: { children: ReactElement }) {
  const { userId, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="app-screen bg-[#F8FAFC] px-6 pt-20 font-['Inter'] text-gray-500 lg:px-10">
        <div className="app-content-shell">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 text-center">
            <BrandLogo className="flex justify-center" imageClassName="h-12 w-auto object-contain" />
            <p className="mt-3">Cargando sesión...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userId) {
    if (IS_DEVELOPMENT_FALLBACK) {
      return children;
    }

    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return children;
}

export const router = createBrowserRouter([
  { path: "/", element: withSuspense(Welcome) },
  { path: "/login", element: withSuspense(Login) },
  { path: "/signup", element: withSuspense(Signup) },
  { path: "/register", element: <Navigate to="/signup" replace /> },
  { path: "/home", element: withSuspense(Home) },
  { path: "/search", element: withSuspense(SearchResults) },
  { path: "/job/:id", element: withSuspense(JobDetail) },
  { path: "/publish", element: <RequireAuth>{withSuspense(PublishJob)}</RequireAuth> },
  { path: "/publish/confirm/:id", element: <RequireAuth>{withSuspense(PublishConfirmation)}</RequireAuth> },
  { path: "/my-jobs", element: <RequireAuth>{withSuspense(MyJobs)}</RequireAuth> },
  { path: "/chat", element: <RequireAuth>{withSuspense(Chat)}</RequireAuth> },
  { path: "/chat/:id", element: <RequireAuth>{withSuspense(ChatDetail)}</RequireAuth> },
  { path: "/profile", element: <RequireAuth>{withSuspense(Profile)}</RequireAuth> },
  { path: "/profile/edit", element: <RequireAuth>{withSuspense(EditProfile)}</RequireAuth> },
  { path: "/payments", element: <RequireAuth>{withSuspense(Payments)}</RequireAuth> },
  { path: "/notifications", element: <RequireAuth>{withSuspense(Notifications)}</RequireAuth> },
  { path: "*", element: withSuspense(NotFound) },
]);
