const API_SERVER = process.env.WEB_ORIGIN;

async function makeAPIRequest(method, endpoint, body) {
	const noBodyMethods = [ 'GET', 'HEAD', 'OPTIONS' ];
	if(noBodyMethods.includes( method.toUpperCase() )) {
		const response = await fetch(`${API_SERVER}${endpoint}`, {
			method: method
		})
		return response.json();
	}

    const response = await fetch(`${API_SERVER}${endpoint}`, {
        method: method,
        headers: new Headers({
            'content-type': 'application/json'
        }),
        body: JSON.stringify(body)
    })
    return response.json();
}

async function isValidAndExistingLayer(layer_arn) {
    const result = await makeAPIRequest(
		'POST',
		'/api/v1/layers/check',
		{
			'layer_arn': layer_arn
		}
    );

    return result.exists;
}

async function submitLayerSubmission(submission_data) {
    return makeAPIRequest(
		'POST',
		'/api/v1/layers/submit',
		submission_data
    );
}

async function downloadLayer(layer_arn) {
	window.location = `${API_SERVER}/api/v1/layers/download/${layer_arn}`;
}

async function searchDatabase(query) {
    return makeAPIRequest(
		'POST',
		'/api/v1/layers/search',
		{
			'query': query
		}
    );
}

async function getSupportedRegions() {
    const response = await makeAPIRequest(
		'GET',
		'/api/v1/layers/supported_regions',
		{}
    );
    return response.supported_regions;
}

async function getLambdaLayerInfo(layer_id) {
    const response = await makeAPIRequest(
		'GET',
		'/api/v1/layers/' + layer_id,
		{}
    );
    return response.layer_info;
}

exports.isValidAndExistingLayer = isValidAndExistingLayer;
exports.downloadLayer = downloadLayer;
exports.submitLayerSubmission = submitLayerSubmission;
exports.searchDatabase = searchDatabase;
exports.getSupportedRegions = getSupportedRegions;
exports.getLambdaLayerInfo = getLambdaLayerInfo;