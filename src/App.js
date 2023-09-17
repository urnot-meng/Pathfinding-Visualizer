import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import PathfindingVisualizer from './PathfindingVisualizer/PathfindingVisualizer';

// Note: consider using react-bootstrap for a smoother integration with React.

function App() {
  return (
    <div className="App">
      <PathfindingVisualizer />
    </div>
  );
}

export default App;