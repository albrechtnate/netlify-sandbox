const fetch = require("node-fetch");

const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN_LOW_PRIVILEGE;
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

exports.handler = async (event, context) => {

	const access_token_data = await refreshAccessToken();

	if (access_token_data)
	{
		return {
			statusCode: 200,
			body: access_token_data,
		};
	}
	else
	{
		return {
			statusCode: 500,
		}
	}
};


function refreshAccessToken()
{
	const unixTimestamp = Date.now();

	fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': `Basic ${btoa(clientId + ':' + clientSecret)}`,
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: REFRESH_TOKEN,
		}),
	})
	.then(res => {
		if (! res.ok)
		{
			throw new Error('Bad Response: ' + res.status);
		}
		return res.json();
	})
	.then(json => {
		if ('access_token' in json && 'expires_in' in json)
		{
			return {
				access_token: json.access_token,
				expiration_time: unixTimestamp + json.expires_in - (10*1000) // 10 second “margin”
			}
		}
		else
		{
			console.log(json);
			throw new Error('Unexpected JSON response');
		}
	})
	.catch(e => {
		console.log('Error: ' + e.message);
		return FALSE;
	});
}