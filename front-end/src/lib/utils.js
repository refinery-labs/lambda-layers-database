export function convertLayerToLocal(layer) {
  const {
    id,
    layer_arn,
    source_link,
    submitter_name,
    description,
    license,
    createdAt,
    updatedAt
  } = layer;

  return {
    id,
    layerArn: layer_arn,
    sourceLink: source_link,
    submitterName: submitter_name,
    description,
    license,
    createdAt,
    updatedAt
  };
}

export function replaceLayerRegion(layerArn, region) {
  const layer_parts = layerArn.split(':');

  if(layer_parts.length < 8) {
    throw new Error('Invalid Lambda ARN specified!');
  }

  layer_parts[3] = region;

  return layer_parts.join(':');
}

export function getApiServerUrl() {
  // Check if we're on the server
  if (typeof window === 'undefined') {
    return process.env.VUE_APP_SSR_API_HOST;
  }

  return process.env.WEB_ORIGIN;
}

export async function downloadLayer(layerArn) {
  window.location = `${getApiServerUrl()}/api/v1/layers/download/${layerArn}`;
}

