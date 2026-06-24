import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Trips from './pages/Trips';
import TripDetail from './pages/TripDetail';
import Destinations from './pages/Destinations';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Favourites from './pages/Favourites';
import Profile from './pages/Profile';
import SharedItineraries from './pages/SharedItineraries';

function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/:id" element={<TripDetail />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/favourites" element={<Favourites />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/shared-itineraries" element={<SharedItineraries />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
