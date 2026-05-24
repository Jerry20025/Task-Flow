import app from "../src/app";

// Vercel serverless functions handle the HTTP requests by importing the express app
// directly. We don't need to call app.listen() here.

export default app;
