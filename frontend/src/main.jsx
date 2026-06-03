import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store.js";
import { Toaster } from "./components/ui/toaster.jsx";
import { ThemeProvider } from "./components/theme-provider.jsx";
import { AuthModalProvider } from "./context/AuthModalContext.jsx";
import AuthModal from "./components/auth/AuthModal.jsx";

import axios from "axios";
axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="fashionify-theme">
        <AuthModalProvider>
          <App />
          <AuthModal />
          <Toaster />
        </AuthModalProvider>
      </ThemeProvider>
    </Provider>
  </BrowserRouter>
);
