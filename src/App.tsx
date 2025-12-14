import LocationSearch from './components/LocationSearch';
import { Globe2 } from 'lucide-react';

function App() {
  return (
    <div className="bg-gradient-main py-5" style={{ minHeight: '100vh' }}>
      <div className="container py-5">
        <div className="text-center mb-5">
          <div className="d-flex justify-content-center mb-3">
            <div className="bg-primary p-3 rounded-2xl shadow-lg text-white">
              <Globe2 className="" />
            </div>
          </div>
          <h1 className="display-5 fw-bold mb-3">Location Finder</h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: 720 }}>
            Search for cities, suburbs, towns, villages, and hamlets from around the world
          </p>
        </div>

        <LocationSearch />

        <div className="mt-5 d-flex justify-content-center">
          <div className="card shadow-sm" style={{ maxWidth: 720 }}>
            <div className="card-body">
              <h2 className="h6 mb-3">Search Tips</h2>
              <ul className="list-unstyled small text-muted mb-0">
                <li className="mb-2">• Start typing to see suggestions appear automatically</li>
                <li className="mb-2">• Results show only cities, suburbs, towns, villages, and hamlets</li>
                <li>• Click any result to select it</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
