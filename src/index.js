import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import config from 'config';
import cluster from 'cluster';
import os from 'os';
import { Exception } from '../utils/index.js';
import mainRouter from './mainRouter.js';
const app = express();
const port = config.get('port');
import SocketIO from './socket.js';
import path from 'path';

// Code to run if we're in the master process
if (cluster.isMaster && process.env.NODE_ENV != 'dev') {
	console.log(`Master process ${process.pid} is running`);

	// Count the machine's CPUs
	let cpuCount = os.cpus().length;

	// Create a worker for each CPU
	for (let i = 0; i < cpuCount; i += 1) {
		cluster.fork();
	}

	// Listen for terminating workers
	cluster.on('exit', function (worker) {
		// Replace the terminated workers
		console.log('Worker ' + worker.id + ' died :(');
		cluster.fork();
	});

	// Code to run if we're in a worker process
} else {
	//TODO: optimise connection
	mongoose
		.connect(config.get('mongoDB.connectionString'))
		.then(() => {
			console.log('Connected to mongoDB !');
		})
		.catch((e) => {
			console.log('Could not connect to mongoDB.');
			console.log(e);
		});

	app.use(cors());
	app.use(express.urlencoded({ extended: false }));
	app.use(express.json({ limit: '50mb' }));
	app.use(express.text({ limit: '50mb' }));

	app.use('/', mainRouter);

	app.use(Exception.requestDefaultHandler);
	//app.use(express.static(path.join(path.resolve(), 'public')));

	const socketIOInstance = new SocketIO(app);
	global.socketIOInstance = socketIOInstance;
	const httpServer = await socketIOInstance.initSocketAndGetServer();

	httpServer.listen(port, () => {
		console.log(`Academy app is listening on port ${port}`);
	});

	// app.listen(port, () => {
	// 	console.log(`Academy app is listening on port ${port}`);
	// });

	console.log(`Worker process ${process.pid} started`);
}
