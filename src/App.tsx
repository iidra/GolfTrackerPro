import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LandPlot, History, Plus, Menu, X } from 'lucide-react';
import GolfMap from './components/Map/GolfMap';
import ActiveRound from './components/RoundControls/ActiveRound';
import RoundHistory from './components/History/RoundHistory';
import CourseSetup from './components/Setup/CourseSetup';
import { useGolfStore } from './store/useGolfStore';
import { useState } from 'react';

function App() {
  const { currentRound, startNewRound } = useGolfStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <LandPlot className="w-8 h-8 text-green-600" />
                <span className="ml-2 text-xl font-bold">GolfTracker Pro</span>
              </div>

              {/* Mobile menu button */}
              <div className="flex md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  {isMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>

              {/* Desktop navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  <LandPlot className="w-5 h-5" />
                  <span>Active Round</span>
                </Link>

                <Link
                  to="/history"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  <History className="w-5 h-5" />
                  <span>History</span>
                </Link>

                {!currentRound && (
                  <button
                    onClick={() => startNewRound("New Course")}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <Plus className="w-5 h-5" />
                    <span>New Round</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center space-x-2">
                  <LandPlot className="w-5 h-5" />
                  <span>Active Round</span>
                </div>
              </Link>

              <Link
                to="/history"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center space-x-2">
                  <History className="w-5 h-5" />
                  <span>History</span>
                </div>
              </Link>

              {!currentRound && (
                <button
                  onClick={() => {
                    startNewRound("New Course");
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-md"
                >
                  <Plus className="w-5 h-5" />
                  <span>New Round</span>
                </button>
              )}
            </div>
          </div>
        </nav>

        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <div className="relative h-[calc(100vh-4rem)]">
                  <GolfMap />
                  {currentRound && (
                    <>
                      <ActiveRound />
                      <CourseSetup />
                    </>
                  )}
                </div>
              }
            />
            <Route path="/history" element={<RoundHistory />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
