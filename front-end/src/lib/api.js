/* eslint-disable no-console */
import fetch from 'node-fetch';
// Required for fetch to work on the server...
global.Headers = fetch.Headers;

import {convertLayerToLocal} from './utils';

function getApiServerUrl() {
  // Check if we're on the server
  if (typeof window === 'undefined') {
    return process.env.VUE_APP_SSR_API_HOST;
  }

  return process.env.WEB_ORIGIN;
}

export async function makeAPIRequest(method, endpoint, body) {
  const noBodyMethods = [ 'GET', 'HEAD', 'OPTIONS' ];

  const apiServer = getApiServerUrl();

  const uri = `${apiServer}${endpoint}`;

  if (typeof window === 'undefined') {
    console.log(`[SSR Request]: ${uri}`);
  }

  try {
    if (noBodyMethods.includes(method.toUpperCase())) {
      const response = await fetch(uri, {
        method: method
      });
      return response.json();
    }

    const response = await fetch(uri, {
      method: method,
      headers: new Headers({
        'content-type': 'application/json'
      }),
      body: JSON.stringify(body)
    });

    return response.json();
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error(`[SSR Request Error]: ${e.message}\n${e.toString()}`);
    }
    throw e;
  }
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

export async function searchDatabase(query, offset) {
  const response = await makeAPIRequest(
    'POST',
    '/api/v1/layers/search',
    {
			'query': query,
			'limit': 5,
			'offset': offset
    }
  );

  if (!response) {
    throw new Error('Invalid search response');
  }

  if (!response.success) {
    throw new Error('Search failure');
  }

  return {
    searchResults: response.search_results.map(convertLayerToLocal),
    totalResults: response.total_results
  };
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
