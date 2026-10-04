// react
  import { BrowserRouter, Routes, Route } from "react-router-dom";

// pages
  import Files from "./components/pages/files/files.jsx";
  import Editor from "./components/pages/editor/editor.jsx";

// modules
  import SideBar from "./components/modules/sidebar.jsx";
  import ContextMenu from "./components/modules/contextmenu.jsx";

function App() {
  return (
    <BrowserRouter>
      <SideBar />
      <Routes>
        <Route path="/" element={<Files />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
      <ContextMenu />
    </BrowserRouter>
  );
}

export default App;