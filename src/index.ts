import "reflect-metadata";
import {createConnection} from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Request, Response} from "express";
import {Routers} from "./routes";

createConnection().then(async connection => {

	// create express app
	const app = express();
	app.use(bodyParser.json());
	app.use(require('morgan')('dev'))

	const root_api = '/api'

	// register express routes from defined application routes

	Routers.forEach(route => {
		(app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
				const result = (new (route.controller as any))[route.action](req, res, next);
				if (result instanceof Promise) {
						result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);

				} else if (result !== null && result !== undefined) {
						res.json(result);
				}
		});
});

	// setup express app here
	// ...

	// start express server
	app.listen(3000);

	console.log("Express server has started on port 3000");

}).catch(error => console.log(error));
