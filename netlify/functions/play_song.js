const fetch = require("node-fetch");
const accessToken = process.env.ACCESS_TOKEN;

exports.handler = async (event, context) => {

	console.log(accessToken);
	console.log(event.queryStringParameters.q);

	event.queryStringParameters

	if ('q' in event.queryStringParameters)
	{
		const song = await basicSearchAndPlay(event.queryStringParameters.q);

		return {
			statusCode: 200,
			body: song,
		};
	}
	return {
		statusCode: 204,
	};
};

function basicSearchAndPlay(query, type = ['track'], market = 'US', limit = 1, offset = 0, include_external = false)
{
	const queryParams = new URLSearchParams({
		q: query,
		type: type.join(','),
		market: market,
		limit: limit,
		offset: offset,
		include_external: include_external,
	}).toString();

	return fetch(`https://api.spotify.com/v1/search?${queryParams}`, {
		headers: {
			'Authorization': `Bearer ${accessToken}`
		}
	})
	.then(res => {
		if (! res.ok) {
			throw new Error('Bad Response: ' + res.status);
		}
		if (res.status === 204) {
			return console.log('Nothing currently playing');
		}
		return res.json();
	})
	.then(json => {
		const result = json.tracks.items[0];

		if (! result.is_playable)
		{
			throw new Error('Not playable');
		}
		console.log(`Spotify found song: ${result.name} (${result.uri})`);
		return {uri: result.uri, name: result.name};
	})
	.then(track => {
		return fetch('https://api.spotify.com/v1/me/player/play', {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${accessToken}`
			},
			body: JSON.stringify({
				uris: [track.uri],
			}),
		}).then(res => {
			console.log(res);
			if (! res.ok)
			{
				res.json().then(j => console.log(j));
				throw new Error('Play response code not ok: ' + res.status);
			}
			return `Playing ${track.name}`;
		})
	})
	.catch(e => {
		return e.message;
	});
}