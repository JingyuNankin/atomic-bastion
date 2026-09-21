import { startGame } from './game/app';
import './style.css';

const root = document.querySelector('#app');

if (!(root instanceof HTMLElement)) {
  throw new Error('Missing #app root');
}

startGame(root);
