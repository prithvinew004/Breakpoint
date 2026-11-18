import { app } from "./app";
import { parseApiEnvironment } from "./env";

const { PORT } = parseApiEnvironment(process.env);

app.listen(PORT);

console.info(`Breakpoint API listening on http://localhost:${PORT}`);
