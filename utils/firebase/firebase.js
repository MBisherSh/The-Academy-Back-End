import config from 'config';
import axios from 'axios';
const options = {
	headers: {
		Authorization: `Bearer ${config.get('firebase.accessToken')}`,
	},
};
/**
 * Function to Send A message using FCM.
 *
 * @param topic
 * @param {Object} message
 * @param {String} message.title
 * @param {String} message.body
 * @param {Object} [message.data]
 * @returns {Promise<AxiosResponse<any>>}
 */
const send = async (topic, message) => {
	const { data, title, body } = message;

	return await axios.post(
		'https://fcm.googleapis.com/fcm/send',
		{
			to: '/topics/' + topic,
			notification: {
				title,
				body,
				mutable_content: true,
				sound: 'Tri-tone',
			},
			data,
		},
		options
	);
};

const sendMessage = async (topic, message) => {
	const { data } = message;
	return await axios.post(
		'https://fcm.googleapis.com/fcm/send',
		{
			to: '/topics/' + topic,
			content_available: true,
			priority: 'high',
			data,
		},
		options
	);
};

const subscribeToTopic = async (token, topic) => {
	return await axios.post('https://iid.googleapis.com/iid/v1/' + token + '/rel/topics/' + topic, options);
};

const unSubscribeFromTopic = async (token, topic) => {
	return await axios.post(
		' https://iid.googleapis.com/iid/v1:batchRemove',
		{
			to: topic,
			registration_tokens: [token],
		},
		options
	);
};

export default { send, sendMessage, subscribeToTopic, unSubscribeFromTopic };
