function replaceLayerRegion(layer_arn, region) {
  const layer_parts = layer_arn.split(':');

  if(layer_parts.length < 8) {
    throw 'Invalid Lambda ARN specified!';
  }

  layer_parts[3] = region;

  return layer_parts.join(':');
}

exports.replaceLayerRegion = replaceLayerRegion;