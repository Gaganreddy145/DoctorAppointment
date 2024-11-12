import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login, { checkLoginLoader } from "./routes/Login";
import { action as loginAction } from "./routes/Login";
import RootLayout from "./routes/RootLayout";
import Dashboard, { fetchLoader } from "./routes/DashBoard";
import DoctorsList from "./routes/DoctorsList";
import { loader as doctorListLoader } from "./routes/DoctorsList";
import AddDoctor from "./routes/AddDoctor";
import { action as addDoctorAction } from "./routes/AddDoctor";
import { logoutAction } from "./routes/logout";
import { tokenLoader } from "./util/auth";

function App() {
  const router = createBrowserRouter([
    { path: "/", element: <Login />, action: loginAction,loader:checkLoginLoader },
    {
      path: "/admin",
      element: <RootLayout />,
      id:"admin",
      loader:tokenLoader,
      children: [
        { index: true, element: <Dashboard /> ,loader:fetchLoader},
        { path: "all-doctors", element: <DoctorsList />,
          loader:doctorListLoader
         },
        {path:"add-doctor",
          element:<AddDoctor />,
          action:addDoctorAction
        }
      ],
    },
    {
      path:"/logout",
      action:logoutAction
    }

  ]);

  return <RouterProvider router={router} />;
}

export default App;
