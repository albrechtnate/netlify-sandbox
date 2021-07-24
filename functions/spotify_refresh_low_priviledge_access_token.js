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

	const refresh = 'refresh' in event.queryStringParameters && event.queryStringParameters.refresh === 'true';

	const accessToken = await getAccessToken('spotify', 'access', 'low', refresh);
	console.log(accessToken);

	//const access_token_data = await refreshAccessToken();

	if (accessToken)
	{
		return {
			statusCode: 200,
			body: accessToken.data.token,
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

async function getAccessToken(api, type, privilegeLevel, refresh = false)
{
	if (refresh)
	{
		console.log('Force generating a new token');
		const newAccessToken = await refreshAccessToken();
		return await saveAccessToken(newAccessToken.accessToken, api, type, privilegeLevel, Date.now() + (newAccessToken.ttl * 1000));
	}

	const existingToken = await client.query(

		q.Let(
			{token: q.Match(q.Index('token_by_type'), [api, type, privilegeLevel])},
			q.If(
				q.IsNonEmpty(q.Var('token')),
				q.Get(
					q.Var('token')
				),
				null
			)
		)

	);

	if (existingToken !== null)
	{
		console.log('Returning cached token');
		return existingToken;
	}
	else
	{
		console.log('Generating a new token');
		const newAccessToken = await refreshAccessToken();
		return await saveAccessToken(newAccessToken.accessToken, api, type, privilegeLevel, Date.now() + (newAccessToken.ttl * 1000));
	}
}


function refreshAccessToken()
{
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
				accessToken: json.access_token,
				ttl: json.expires_in
			};

			//return await saveAccessToken(data.accessToken, 'spotify', 'access', 'low', data.expirationTime);
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

function saveAccessToken(token, api, type, privilegeLevel, expiresTimestamp)
{
	return client.query(

		q.Let(
			{token: q.Match(q.Index('token_by_type'), [api, type, privilegeLevel])},
			q.If(
				q.IsEmpty(q.Var('token')),
				q.Create(
					'tokens',
					{
						data: {
							token: token,
							api: api,
							type: type,
							privilege_level: privilegeLevel,
							expires_timestamp: expiresTimestamp,
						},
						ttl: q.Epoch(expiresTimestamp, 'milliseconds')
					}
				),
				q.Update(
					q.Select('ref', q.Get(q.Var('token'))),
					{
						data: {
							token: token,
							expires_timestamp: expiresTimestamp,
						},
						ttl: q.Epoch(expiresTimestamp, 'milliseconds')
					}
				)
			)
		)

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