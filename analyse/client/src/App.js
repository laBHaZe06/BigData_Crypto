import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Dashboard from "./scenes/dashboard";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Invoices from "./scenes/invoices";
import Pie from "./scenes/pie";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import SidebarPro from "./scenes/global/SidebarPro";
import NotFound from "./scenes/notFound/NotFound";
import Home from "./scenes/home";
function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const [isDashboardVisible, setIsDashboardVisible] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);

  const handleSidebarToggle = () => {
    setIsSidebar(!isSidebar);
  };

  const handleSearchSubmit = (cryptoSymbol) => {
    setSelectedCrypto(cryptoSymbol);
    setIsDashboardVisible(true);
  };

  const cryptoSymbol = selectedCrypto;

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <SidebarPro isSidebar={isSidebar} />
          <main className="content">
            <Topbar
              setIsSidebar={handleSidebarToggle}
              onSearchSubmit={handleSearchSubmit}
            />
            
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/:symbol"
                element={
                  isDashboardVisible ? (
                    <Dashboard cryptoSymbol={cryptoSymbol} />
                  ) : (
                    <>
                      <h1>Dashboard</h1>
                      <p>Search for a cryptocurrency to display its dashboard</p>
                    </>
                  )
                }
              />
              <Route path="/tabs" element={<Invoices />} />
              <Route path="/form" element={<Form />} />
              <Route path="/bar" element={<Bar />} />
              <Route path="/pie" element={<Pie />} />
              <Route path="/line" element={<Line />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;