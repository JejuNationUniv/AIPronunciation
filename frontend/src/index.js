import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainPage from "./pages/MainPage";
import ErrorPage from "./pages/ErrorPage";
import TestPage from "./pages/TestPage";
import LastPage from "./pages/LastPage";
import App from "./App";

// 라우터 객체 생성
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
    errorElement: <ErrorPage />,
  },
  { path: "/TestPage", element: <TestPage /> },
  { path: "/LastPage", element: <LastPage /> },
  { path: "/App", element: <App /> },
]);

// ReactDOM 렌더링
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
