import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Polyfill for drag & drop on mobile touch devices
import { polyfill } from "mobile-drag-drop";
import "mobile-drag-drop/default.css"; // optional default CSS for drag ghosting
polyfill({
    dragImageTranslateOverride: (event, hoverCoordinates, hoveredElement) => {
        // Keeps the drag image slightly offset to prevent blocking touch interactions
        return { x: 10, y: 10 };
    }
});
window.addEventListener('touchmove', function() {}, {passive: false});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
