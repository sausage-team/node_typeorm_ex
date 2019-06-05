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

	Object.keys(Routers).forEach((key: string) => {
		Routers[key].gateways.forEach((route => {
			(app as any)[route.method](`${root_api}/${key}${route.path}`,
				(req: Request, res: Response, next: Function) => {
					console.log(`${root_api}/${key}${route.path}`)
					const result = (new (Routers[key].controller as any))[route.action](req, res, next);
					if (result instanceof Promise) {
						result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);

					} else if (result !== null && result !== undefined) {
						res.json(result);
					}
				}
			)
		}))
	})

	// setup express app here
	// ...

	// start express server
	app.listen(3000);

	console.log("Express server has started on port 3000");

}).catch(error => console.log(error));