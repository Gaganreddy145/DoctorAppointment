import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./routes/RootLayout";
import Home from "./routes/Home";
import DoctorList from "./routes/DoctorsList";
import { loader as doctorListLoader } from "./routes/DoctorsList";
import Doctor from "./routes/Doctor";
import { doctorLoader, selectSlotAction } from "./routes/Doctor";
import Login from "./routes/Login";
import { postLoginAction } from "./routes/Login";
import Register, { registerPatientLoader } from "./routes/Register";
import { logoutAction } from "./routes/logout";
import { tokenLoader } from "./util/auth";
import AppointmentsList,{myAppointmentsLoader} from "./routes/MyAppointments";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      id: "root",
      loader: tokenLoader,
      children: [
        { index: true, element: <Home /> },
        { path: "login", element: <Login />, action: postLoginAction },
        {
          path: "register",
          element: <Register />,
          action: registerPatientLoader,
        },
        {
          path: "doctors-list",
          element: <DoctorList />,
          loader: doctorListLoader,
        },
        {
          path: "doctors-list/:did",
          element: <Doctor />,
          loader: doctorLoader,
          action: selectSlotAction,
        },
        { path: "appointments", element: <AppointmentsList /> ,loader:myAppointmentsLoader},
        {
          path: "logout",
          action: logoutAction,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
