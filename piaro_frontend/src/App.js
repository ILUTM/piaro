import './App.css';
import './sharedStyles/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext/AuthContext';
import ProtectedRoute from './components/AuthContext/ProtectedRoute';
import Header from './components/header/Header';
import SideBar from './components/SideBar/SideBar';
import HomePage from './pages/HomePage/HomePage';
import ProfileMain from './pages/ProfilePage/ProfileMain';
import CreatePublication from './pages/CreatePublication/CreatePublication';
import PublicationPage from './pages/PublicationPage/PublicationPage';
import CommunityPage from './pages/CommunityPage/CommunityPage';
import SearchPageMain from './pages/SearchPage/SearchPageMain';
import UserPage from './pages/UserPage/UserPage';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <SideBar className='sidebar'/>
          <Routes className="main-content">
            <Route exact path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProtectedRoute element={ProfileMain} />} />
            <Route path="/create-publication" element={<CreatePublication />} />
            <Route path="/publication/:id" element={<PublicationPage />} />
            <Route path="/community/:id" element={<CommunityPage />} />
            <Route path="/user/:id" element={<UserPage />} />
            <Route path="/search" element={<SearchPageMain />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

