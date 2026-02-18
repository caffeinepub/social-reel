import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Layout from './components/Layout';
import ProfileSetupModal from './components/ProfileSetupModal';
import VideoFeedPage from './pages/VideoFeedPage';
import ReelsFeedPage from './pages/ReelsFeedPage';
import ProfilePage from './pages/ProfilePage';
import MembersPage from './pages/MembersPage';
import FollowersPage from './pages/FollowersPage';
import FollowingPage from './pages/FollowingPage';
import LoginPage from './pages/LoginPage';

function LayoutWrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({
  component: LayoutWrapper,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: VideoFeedPage,
});

const reelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reels',
  component: ReelsFeedPage,
});

const membersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/members',
  component: MembersPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$principalId',
  component: ProfilePage,
});

const followersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$principalId/followers',
  component: FollowersPage,
});

const followingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$principalId/following',
  component: FollowingPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  reelsRoute,
  membersRoute,
  profileRoute,
  followersRoute,
  followingRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetupModal />}
    </>
  );
}

export default App;
