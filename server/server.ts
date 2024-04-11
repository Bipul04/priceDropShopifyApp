// server.js

import express from 'express';
import { createRequestHandler } from '@remix-run/express';
// server.ts

const app = express();

app.all(
 '*'
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
 console.log(`Server is listening on port ${port}`);
});
