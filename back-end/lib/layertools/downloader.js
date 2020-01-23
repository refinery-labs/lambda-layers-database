const Lambda = require('aws-sdk/clients/lambda');
const S3 = require('aws-sdk/clients/s3');
const shortid = require('shortid');
const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const request = require('request-promise-native');
const fs = require('fs');

const lambdaLayerDownloaderPackageZip = './lambda-packages/lambda-downloader.zip';
const lambdaLayerDownloaderS3ObjectPath = 'lambda-layer-downloader.zip';

const SUPPORTED_REGIONS_ARRAY = [
	"us-east-2",
	"us-east-1",
	"us-west-1",
	"us-west-2",
	"ap-south-1",
	"ap-northeast-2",
	"ap-southeast-1",
	"ap-southeast-2",
	"ap-northeast-1",
	"ca-central-1",
	"eu-central-1",
	"eu-west-1",
	"eu-west-2",
	"eu-west-3",
	"eu-north-1",
	"sa-east-1"
];

async function uploadFileToS3(region, fileBuffer, s3ObjectKey) {
	const s3 = new S3({
		region: region
	});

	const s3PutObjectParams = {
		'Bucket': `${process.env.LAMBDA_LAYERS_S3_PREFIX}-${region}`,
		'Key': s3ObjectKey,
		'Body': fileBuffer
	}

	const s3PutObjectResponse = await s3.putObject(s3PutObjectParams).promise();

	return s3PutObjectResponse;
}

async function getLayerMetdata(layer_arn) {
	const lambda_layer_region = getLayerRegion(
		layer_arn
	);

	// This retrieves the signed S3 URL to download a given Lambda layer
	const lambda = new Lambda({
		region: lambda_layer_region
	});

	return lambda.getLayerVersionByArn({
		'Arn': layer_arn
	}).promise();
}

async function createLambdaLayer(region, layer_zip_object_path, layer_name, compatible_runtimes, description, license) {
	const lambda = new Lambda({
		region: region
	});

	const result = await lambda.publishLayerVersion({
		'Content': {
			'S3Bucket': `${process.env.LAMBDA_LAYERS_S3_PREFIX}-${region}`,
			'S3Key': layer_zip_object_path
		},
		'LayerName': layer_name,
		'CompatibleRuntimes': compatible_runtimes,
		'Description': description,
		'LicenseInfo': license
	}).promise();

	return result['LayerVersionArn'];
}

async function importLayerARN(layer_arn) {
	const lambdaMetadata = await getLayerMetdata(layer_arn);
	const lambdaLayerRegion = getLayerRegion(layer_arn);
	const lambdaLayerName = getLayerName(layer_arn);
	const uniqueShortID = shortid.generate();

	// The max Lambda layer name size is 64 characters
	// We need room for a short ID to make the layer
	// names unique (for simplicity). We also need one
	// more character for a _ separator.
	const remainingLayerNameChars = 64 - uniqueShortID.length - 1;

	// Generate a new unique Lambda layer name
	const newLambdaLayerName = lambdaLayerName.substring(
		0,
		remainingLayerNameChars
	) + '_' + uniqueShortID;

	console.log('Downloading Lambda layer .zip...');
	// Download Lambda layer zip from signed S3 URL
	const response = await request.get({
		url: lambdaMetadata['Content']['Location'],
		encoding: null
	});
	const buffer = Buffer.from(response, 'utf8');

	const s3ZipObjectName = `${uuidv4()}.zip`;

	// Now we need to upload the .zip to all regional buckets
	// Then we'll create a Lambda layer from each uploaded 
	// .zip object in each region (region-specific buckets
	// are required).
	console.log('Uploading Lambda layer .zip to all supported regions...');
	const s3UploadPromises = SUPPORTED_REGIONS_ARRAY.map(region => {
		console.log(`Uploading ${s3ZipObjectName} to s3://${process.env.LAMBDA_LAYERS_S3_PREFIX}-${region} ...`);
		return uploadFileToS3(
			region,
			buffer,
			s3ZipObjectName
		);
	});
	await Promise.all(s3UploadPromises);

	console.log('Uploads to all regions complete! Creating layers in all regions...');

	const createLambdaLayerPromises = SUPPORTED_REGIONS_ARRAY.map(region => {
		console.log(`Creating Lambda layer for region ${region}...`);

		return createLambdaLayer(
			region,
			s3ZipObjectName,
			newLambdaLayerName,
			[],
			`Layer mirrored from layer ARN ${layer_arn} using the Lambda Layers Database by Refinery.io`,
			lambdaMetadata['LicenseInfo']
		);
	});
	const lambdaLayerARNs = await Promise.all(createLambdaLayerPromises);

	console.log('Setting IAM policy for all created Lambda layers so any AWS account can mount them...');

	const lambdaLayerIAMPolicyPromises = lambdaLayerARNs.map(layerARN => {
		console.log(`Setting IAM policy to allow any AWS account to mount layer in region ${getLayerRegion(layerARN)}`)
		return setLayerPermissionAllowAllToMount(
			layerARN
		);
	});

	await lambdaLayerIAMPolicyPromises;

	console.log('Multi-region layer import completed successfully!');

	return lambdaLayerARNs;
}

async function setLayerPermissionAllowAllToMount(lambda_layer_arn) {
	const lambdaRegion = getLayerRegion(lambda_layer_arn);
	const layerVersion = getLayerVersion(lambda_layer_arn);
	const layerName = getLayerName(lambda_layer_arn);

	const lambda = new Lambda({
		region: lambdaRegion
	});

	return lambda.addLayerVersionPermission({
		Action: 'lambda:GetLayerVersion',
		LayerName: layerName,
		Principal: '*',
		StatementId: 'public',
		VersionNumber: layerVersion
	}).promise();
}

async function getLayerDownloadLink(layer_arn) {
	const lambdaMetadata = await getLayerMetdata(layer_arn);

	return lambdaMetadata['Content']['Location'];
}

function getLayerVersion(layer_arn) {
	const layer_parts = layer_arn.split(':');

	if(layer_parts.length < 8) {
		throw 'Invalid Lambda ARN specified!';
	}

	return layer_parts[7];
}

function getLayerName(layer_arn) {
	const layer_parts = layer_arn.split(':');

	if(layer_parts.length < 8) {
		throw 'Invalid Lambda ARN specified!';
	}

	return layer_parts[6];
}

function getLayerRegion(layer_arn) {
	const layer_parts = layer_arn.split(':');

	if(layer_parts.length < 8) {
		throw 'Invalid Lambda ARN specified!';
	}

	const layer_region = layer_parts[3];

	if(!SUPPORTED_REGIONS_ARRAY.includes(layer_region)) {
		throw 'Invalid Lambda layer region!';
	}

	return layer_region;
}

function getLayersForAllSupportedRegions(layer_arn) {
	return SUPPORTED_REGIONS_ARRAY.map(region => {
		return {
			'region': region,
			'arn': replaceLayerRegion(
				layer_arn,
				region
			)
		}
	});
}

function replaceLayerRegion(layer_arn, region) {
	const layer_parts = layer_arn.split(':');

	if(layer_parts.length < 8) {
		throw 'Invalid Lambda ARN specified!';
	}

	layer_parts[3] = region;

	return layer_parts.join(':');
}

async function isLambdaLayerValidAndExisting(layer_arn) {
	const layer_parts = layer_arn.split(':');

	if(layer_parts.length < 8) {
		return false;
	}

	try {
		await getLayerMetdata(layer_arn);
	} catch ( e ) {
		console.log(e);
		return false;
	}
	return true;
}

module.exports = {
	getLayerMetdata,
	getLayerDownloadLink,
	importLayerARN,
	setLayerPermissionAllowAllToMount,
	replaceLayerRegion,
	getLayersForAllSupportedRegions,
	SUPPORTED_REGIONS_ARRAY,
	isLambdaLayerValidAndExisting
};