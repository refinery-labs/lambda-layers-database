import {convertLayerToLocal} from './utils';

const API_SERVER = process.env.WEB_ORIGIN;

export async function makeAPIRequest(method, endpoint, body) {
  const noBodyMethods = [ 'GET', 'HEAD', 'OPTIONS' ];

  if (noBodyMethods.includes( method.toUpperCase() )) {
    const response = await fetch(`${API_SERVER}${endpoint}`, {
      method: method
    });
    return response.json();
  }

  const response = await fetch(`${API_SERVER}${endpoint}`, {
    method: method,
    headers: new Headers({
      'content-type': 'application/json'
    }),
    body: JSON.stringify(body)
  });

  return response.json();
}

export async function isValidAndExistingLayer(layerArn) {
  try {
    const result = await makeAPIRequest(
      'POST',
      '/api/v1/layers/check',
      {
        layer_arn: layerArn
      }
    );

    return result.exists;
  } catch (e) {
    throw new Error('Unable to validate layer')
  }
}

export async function submitLayerSubmission(submission_data) {
  return makeAPIRequest(
    'POST',
    '/api/v1/layers/submit',
    submission_data
  );
}

export async function downloadLayer(layerArn) {
  window.location = `${API_SERVER}/api/v1/layers/download/${layerArn}`;
}

export async function searchDatabase(query) {
  const response = await makeAPIRequest(
    'POST',
    '/api/v1/layers/search',
    {
      'query': query
    }
  );

  if (!response) {
    throw new Error('Invalid search response');
  }

  if (!response.success) {
    throw new Error('Search failure');
  }

  return response.search_results.map(convertLayerToLocal);
}

export async function getSupportedRegions() {
  try {
    const response = await makeAPIRequest(
      'GET',
      '/api/v1/layers/supported_regions',
      {}
    );
    return response.supported_regions;
  } catch (e) {
    throw new Error('Unable to retrieve regions');
  }
}

export async function getLambdaLayerInfo(layerId) {
  try {
    const response = await makeAPIRequest(
      'GET',
      '/api/v1/layers/' + layerId,
      {}
    );

    return convertLayerToLocal(response.layer_info);
  } catch (e) {
    throw new Error('Unable to retrieve layer info');
  }
}
