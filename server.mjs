import express from 'express';
import ssr from './ssr.mjs';

const app = express();

app.get('/', async () => {
	await ssr();
});

app.listen(8080, () => console.log('Server started. Press Ctrl+C to quit'));
