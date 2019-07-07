"use strict";

import * as express from "express";
import * as bodyParser from "body-parser";

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));

export default app;