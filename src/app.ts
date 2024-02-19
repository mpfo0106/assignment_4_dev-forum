import bodyParser from "body-parser";
import express from "express";
import controllers from "./contexts";
import authenticator from "./middlewares/authenticator.middleware";
import "./prisma/client.prisma";

const app = express();
const port = 5050;
const jsonParser = bodyParser.json();

app.use(authenticator);
app.use(jsonParser);
app.use(controllers);
// app.use((_: Error, __: Request, res: Response, ___: NextFunction) => {
//   res.json(400);
// });
app.get("/health-check", (_, res) => {
  res.json("OK");
});

app.listen(port, () => {
  console.log("서버 실행중");
});
