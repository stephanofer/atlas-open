import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute, PublicRoute } from "@/ui/components/auth";
import { DashboardLayout } from "@/ui/components/layout";

// Public pages
import LandingPage from "@/ui/pages/Home";
import PricingPage from "@/ui/pages/Pricing";
import ContactPage from "@/ui/pages/Contact";
import LoginPage from "@/ui/pages/Login";
import RegisterPage from "@/ui/pages/Register";

// Dashboard pages
import DashboardHomePage from "@/ui/pages/dashboard/Home";
import ProfilePage from "@/ui/pages/dashboard/Profile";
import SettingsPage from "@/ui/pages/dashboard/Settings";
import DocumentsPage from "@/ui/pages/dashboard/Documents";
import UploadPage from "@/ui/pages/dashboard/Upload";
import UsersPage from "@/ui/pages/dashboard/Users";
import AreasPage from "@/ui/pages/dashboard/Areas";
import CategoriesPage from "@/ui/pages/dashboard/Categories";
import DocumentDetailPage from "@/ui/pages/dashboard/DocumentDetail";
import AreaManagerPage from "@/ui/pages/dashboard/AreaManager";

export const router = createBrowserRouter([
  // Public routes (landing, pricing, etc.)
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/pricing",
    element: <PricingPage />,
  },
  {
    path: "/contact",
    element: <ContactPage />,
  },

  // Auth routes (redirect if already logged in)
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
    ],
  },

  // Protected routes (require authentication)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardHomePage />,
          },
          {
            path: "/dashboard/documents",
            element: <DocumentsPage />,
          },
          {
            path: "/dashboard/documents/:id",
            element: <DocumentDetailPage />,
          },
          {
            path: "/dashboard/upload",
            element: <UploadPage />,
          },
          {
            path: "/dashboard/users",
            element: <UsersPage />,
          },
          {
            path: "/dashboard/areas",
            element: <AreasPage />,
          },
          {
            path: "/dashboard/categories",
            element: <CategoriesPage />,
          },
          {
            path: "/dashboard/area-manager",
            element: <AreaManagerPage />,
          },
          {
            path: "/dashboard/profile",
            element: <ProfilePage />,
          },
          {
            path: "/dashboard/settings",
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
]);
