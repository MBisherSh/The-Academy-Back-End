import { Server } from 'socket.io';
import AuthenticationService from './authentication/services/authentication.js';
import UserService from './user/services/user.js';
import { Exception, statusCodes } from '../utils/index.js';
import { createServer } from 'http';
import CourseService from './course/services/course.js';
import MessageService from './chat/services/message.js';
import { MongoClient } from 'mongodb';
import { createAdapter } from '@socket.io/mongo-adapter';
import config from 'config';
import firebase from '../utils/firebase/firebase.js';

class SocketIO {
	constructor(app) {
		this.app = app;
	}

	async initSocketAndGetServer() {
		const httpServer = createServer(this.app);

		const io = new Server(httpServer, {
			cors: {
				origin: '*',
				methods: ['GET', 'POST'],
				credentials: true,
				transports: ['websocket', 'polling'],
			},
		});

		const DB = 'socketio';
		const COLLECTION = 'socket.io-adapter-events';

		const mongoClient = new MongoClient(config.get('mongoDB.connectionString'), {
			//	replicaSet:'rs0',
			//	directConnection: true,
			useUnifiedTopology: true,
		});

		await mongoClient.connect();

		try {
			await mongoClient.db().createCollection(COLLECTION, {
				capped: true,
				size: 1000000,
				max: 1000,
			});
		} catch (e) {
			// collection already exists
		}
		const mongoCollection = mongoClient.db(DB).collection(COLLECTION);

		io.adapter(createAdapter(mongoCollection));

		io.listen(3000);

		//Public Socket
		io.on('connection', (socket) => {
			//console.log('A user connected');
			//console.log(socket.id);
			socket.emit('message', 'Welcome to The Academy');
			socket.broadcast.emit('message', 'A public user has connected');
			socket.on('disconnect', function () {
				//console.log('A public user disconnected');
			});

			socket.on('chatMessage', (msg) => {
				//console.log(Date.now() + ' - ' + msg);
				io.emit('message', msg);
				socket.join('testroom');
				io.to('testroom').emit('testeventofroom', 'hi from test room event');
			});
		});

		//Private Socket
		const loggedOnNamespace = io.of('/with-token');

		loggedOnNamespace
			.use(async (socket, next) => {
				//console.log(socket.handshake)
				// ensure the user has sufficient rights
				let token =
					socket.handshake.auth && socket.handshake.auth.token
						? socket.handshake.auth.token
						: socket.handshake.headers.auth;
				if (token) {
					try {
						socket.user = await AuthenticationService.verifyJwtTokenAndGetUser(token);
						next();
					} catch (e) {
						next(new Exception(statusCodes.UNAUTHORIZED, e.message));
					}
				} else next(new Exception(statusCodes.UNAUTHORIZED, 'no token'));
			})
			.on('error', function (err) {
				console.log('Connection Failed: ' + err);
			})
			.on('connection', async (socket) => {
				socket.emit('message', 'Welcome to The Academy - with token');
				// Add user connection to DB
				const userId = socket.user.id;
				const user = await UserService.findUserById(userId);
				user.isOnline = true;
				await user.save();
				// Join user private room
				await socket.join(userId);
				// Subscribe to all user courses rooms
				// Send online event to all users in every room
				const userCourses = await CourseService.getAllUserCourse(userId);
				await Promise.all(
					userCourses.map(async (course) => {
						await socket.join(course._id.toString());
						//loggedOnNamespace.to(course._id.toString()).emit(user.name + ' is online.');
					})
				);

				//console.log('A logged in user connected - ' + user.name);

				socket.on('disconnect', async function () {
					// remove user connection from DB
					user.isOnline = false;
					await user.save();
					// Send offline event to all users in every room
					// await Promise.all(
					// 	userCourses.map(async (course) => {
					// 		loggedOnNamespace.to(course._id.toString()).emit(user.name + ' is offline.');
					// 	})
					// );
					//console.log('A logged in user disconnected - ' + user.name);
					//io.emit('message', 'A user has disconnected');
				});

				socket.on('courseMessage', async (message) => {
					const courseId = message.courseId;
					if (socket.rooms.has(courseId)) {
						// Send To Course users and create message
						const msg = await new MessageService(message).create(socket.user);
						loggedOnNamespace.in(courseId).emit('courseMessage', msg);
						try {
							await firebase.sendMessage(courseId, {
								data: { event: 'courseMessage', result: msg },
							});
						} catch (e) {}
					}
				});

				socket.on('userMessage', async (message) => {
					const receiverId = message.receiverId;
					const result = await new MessageService(message).create(socket.user, receiverId);
					loggedOnNamespace
						.to(result.message.conversation.firstUser)
						.to(result.message.conversation.secondUser)
						.emit('userMessage', result);
					try {
						await firebase.sendMessage(result.message.conversation.firstUser, {
							data: { event: 'userMessage', result },
						});
					} catch (e) {}
					try {
						await firebase.sendMessage(result.message.conversation.secondUser, {
							data: { event: 'userMessage', result },
						});
					} catch (e) {}
				});

				socket.on('deleteMessage', async (data) => {
					const messageId = data.messageId;
					let result = {};
					try {
						result = await MessageService.delete(messageId, socket.user);
					} catch (e) {
						socket.emit('message', e.message);
					}

					if (result.message && result.message.courseId)
						loggedOnNamespace.to(result.message.courseId).emit('deleteMessage', result);
					else if (result.message && result.message.conversation)
						loggedOnNamespace
							.to(result.message.conversation.firstUser)
							.to(result.message.conversation.secondUser)
							.emit('deleteMessage', result);
				});
			});

		this.io = io;
		this.loggedOnNamespace = loggedOnNamespace;

		return httpServer;
	}

	getInstance() {
		return { io: this.io, loggedOnNamespace: this.loggedOnNamespace };
	}
}

export default SocketIO;
