import "./App.css";
import { Navbar } from "./components";
import {
  Dashboard,
  Home,
  LoginPage,
  NotFound,
  RegisterPage,
  TeamManagerCreate,
  TeamManagerEdit,
  TeamCreate,
  TeamEdit,
  ParticipantCreate,
} from "./pages";
import {
  BrowserRouter as Router,
  Route,
  BrowserRouter,
  Routes,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function App() {
  const queryClient = new QueryClient();
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/participant/create" element={<ParticipantCreate />} />
            <Route
              path="/team-manager/create"
              element={<TeamManagerCreate />}
            />
            <Route
              path="/team-manager/:id/edit"
              element={<TeamManagerEdit />}
            />
            <Route path="/teams/:id/edit" element={<TeamEdit />} />
            <Route path="/teams/create" element={<TeamCreate />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </>
  );
}
