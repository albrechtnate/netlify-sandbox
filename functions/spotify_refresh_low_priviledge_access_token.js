const fetch = require("node-fetch");
const faunadb = require('faunadb'),
	q = faunadb.query;

const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN_LOW_PRIVILEGE;
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const client = new faunadb.Client({
	secret: process.env.FAUNADB_SERVER_SECRET
});

exports.handler = async (event, context) => {

	const access_token_data = await refreshAccessToken();

	if (access_token_data)
	{
		return {
			statusCode: 200,
			body: JSON.stringify(access_token_data),
		};
	}
	else
	{
		const returnData = {
			status: 'error',
			message: 'A technical error was encountered.'
		}

		return {
			statusCode: 500,
			body: JSON.stringify(returnData),
		}
	}
};


function refreshAccessToken()
{
	const unixTimestamp = Date.now();

	return fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': `Basic ${Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')}`,
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: REFRESH_TOKEN,
			scope: [
				'user-read-currently-playing',
				'user-read-recently-played',
				'user-top-read',
			].join(' ')
		}),
	})
	.then(async res => ({
		res: res,
		json: await res.json()
	}))
	.then(async data => {
		const {res, json} = data;

		if (! res.ok)
		{
			let errorMessage = '';
			if ('error' in json)
			{
				errorMessage = json.error + ' :: ' + json.error_description;
			}
			else if ('message' in json)
			{
				errorMessage = json.message;
			}

			throw new Error(`Bad Response from Token Endpoint :: HTTP Code ${res.status} :: ${errorMessage}`);
		}

		if ('access_token' in json && 'expires_in' in json)
		{
			const data = {
				access_token: json.access_token,
				expiration_time: unixTimestamp + json.expires_in - (10*1000) // 10 second “margin”
			};

			await saveAccessToken(data);
			return data;
		}
		else
		{
			console.log(json);
			throw new Error('Unexpected JSON response');
		}
	})
	.catch(e => {
		console.log('Error: ' + e.message);
		return false;
	});
}

function saveAccessToken(data)
{
	return client.query(
		q.Map(
			q.Paginate(
				q.Match(
					q.Index('token'),
					['spotify', 'low']
				),
				{ size: 1 }
			),
			q.Lambda(
				'tokenRef',
				q.Update(
					q.Var('tokenRef'),
					{
						data: {
							access_token: data.access_token,
							expires: data.expiration_time,
						}
					}
				)
			)
		),
	)
	.catch((err) => {
		console.error('Error: %s', err);

		const returnData = {
			status: 'error',
			message: 'A technical error was encountered while saving the access token to the database.'
		}

		return {
			statusCode: 500,
			body: JSON.stringify(returnData),
		}
	});
}