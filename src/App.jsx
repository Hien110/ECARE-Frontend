import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import AppRoute from "./config/routes";
import React, { Suspense } from "react";
import Header from "./components/Header";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* Header will be rendered inside specific layouts only */}
      <Routes>
        {AppRoute.map((route, index) => {
          const Layout = route.layout || React.Fragment;
          const Page = route.page;
          return (
            <Route
              key={index}
              path={route.path}
              element={
                <Layout>
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
                    <Page />
                  </Suspense>
                </Layout>
              }
            />
          );
        })}
      </Routes>
    </BrowserRouter>
  );
}

export default App;