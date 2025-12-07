import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BubbleWindow } from './components/BubbleWindow/BubbleWindow';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BubbleWindow />
  </StrictMode>
);
