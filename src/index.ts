import express, { Request, Response } from "express";
import percollateRouter from "./routes/percollate.routes.js";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
	res.send("Hello, TypeScript Express!");
});

app.use("/", percollateRouter);

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
