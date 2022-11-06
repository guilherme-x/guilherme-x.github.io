import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from './pages/landing/Landing'
import './App.css'
function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route index element={<Landing/>} ></Route>
    </Routes>
    </BrowserRouter>
  );
}

export default App;
