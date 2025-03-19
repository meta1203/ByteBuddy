import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import EventList from './components/EventList';
import EventForm from './components/EventForm';
import EventDetail from './components/EventDetail';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        
        <main className="container main-content">
          <Routes>
            <Route path="/" element={<EventList />} />
            <Route path="/events/new" element={<EventForm />} />
            <Route path="/events/:id" element={<EventDetail />} />
          </Routes>
        </main>
        
        <footer className="footer">
          <div className="container">
            <p className="mb-0">ByteBuddy Event Management &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
