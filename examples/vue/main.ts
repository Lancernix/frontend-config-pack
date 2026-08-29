import App from './App.vue';
import { createApp } from 'vue';

const container = document.getElementById('app');
if (!container) {
  throw new Error('root element not found');
}

createApp(App).mount(container);
