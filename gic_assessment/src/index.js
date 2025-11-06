import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render((
  <BrowserRouter>
    <App />
  </BrowserRouter>
  ), document.getElementById('root')
);