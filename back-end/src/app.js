const safeCompare = require('safe-compare');
const bodyParser = require('koa-bodyparser');
const validateJSON = require('jsonschema').validate;
const uuidv4 = require('uuid/v4');
const crypto = require("crypto");
const Router = require('koa-router');
const Mustache = require('mustache');
const Koa = require('koa');

const { Op } = require('sequelize');
const lambdaLayerDownloader = require('./lib/layertools/downloader.js');
const emailer = require('./lib/email.js');
const database = require('./lib/database.js');

const app = new Koa();
const router = new Router();
app.use(bodyParser());

/*
	Middleware to set default security headers
*/
app.use(async (ctx, next) => {
	ctx.set('Access-Control-Allow-Origin', process.env.WEB_ORIGIN);
	ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
	ctx.set('Content-Security-Policy', 'default-src \'none\'');
	ctx.set('X-Frame-Options', 'DENY');
	ctx.set('X-Content-Type-Options', 'nosniff');
	await next();
});

function copy(input_object) {
	return JSON.parse(
		JSON.stringify(
			input_object
		)
	);
}

function requestMatchesJSONSchema(ctx, jsonSchema) {
	const validationResult = validateJSON(ctx.request.body, jsonSchema);
	return (validationResult.errors.length === 0);
}

const downloadLayerZipSchema = {
	"type": "object",
	"properties": {
		"arn": {
			"type": "string"
		}
	},
	"required": [
		"arn"
	]
}
router.post('/api/v1/layers/download', async (ctx, next) => {
	if(!requestMatchesJSONSchema(ctx, downloadLayerZipSchema)) {
		ctx.throw(401, 'Request body invalid, please use the correct format.');
	}

	console.log(`Generating download link for Lambda layer ${ctx.request.body.arn}...`);
	const lambdaLayerDownloadURL = await lambdaLayerDownloader.getLayerDownloadLink(
		ctx.request.body.arn
	);

	ctx.body = {
		'download_url': lambdaLayerDownloadURL
	}
});

router.get('/api/v1/layers/download/:layer_arn', async (ctx, next) => {
	const layer_arn = ctx.params.layer_arn;

	console.log(`Generating download link for Lambda layer ${layer_arn}...`);
	const lambdaLayerDownloadURL = await lambdaLayerDownloader.getLayerDownloadLink(
		layer_arn
	);

	ctx.redirect(lambdaLayerDownloadURL);
});

router.get('/api/v1/layers/supported_regions', async (ctx, next) => {
	ctx.body = {
		'supported_regions': lambdaLayerDownloader.SUPPORTED_REGIONS_ARRAY
	}
});

router.get('/api/v1/submissions/approve/confirm/:approval_secret', async (ctx, next) => {
	const approval_secret = ctx.params.approval_secret;

	const htmlContents = Mustache.render(
		'<h1>To approve this submission, <a href="{{api_origin}}/api/v1/submissions/approve/{{approval_secret}}">click here</a>.</h1>',
		{
			api_origin: process.env.API_ORIGIN,
			approval_secret: approval_secret
		}
	);

	ctx.body = htmlContents;
});

router.get('/api/v1/submissions/approve/:approval_secret', async (ctx, next) => {
	const approval_secret = ctx.params.approval_secret;

	const layer_submission = await database.LayerSubmission.findOne({
		limit: 1,
		where: {
			approval_secret: approval_secret
		}
	});

	if(!layer_submission) {
		ctx.body = 'No submission found for that approval secret!';
		return
	}

	// Kick off import but don't block the request.
	import_submission(
		copy(
			layer_submission
		)
	);

	ctx.body = {
		'success': true,
		'msg': 'Submission was approved, it is now being imported. This may take a few minutes...'
	}
});

async function import_submission(layer_submission_data) {
	// Now we import the new layer. We mirror it into all of
	// our supported regions, set the IAM policies, and then
	// create a database entry for it.
	console.log(`Importing submission layer (${layer_submission_data.layer_arn}), mirroring it to all supported regions...`);
	const lambdaLayerARNs = await lambdaLayerDownloader.importLayerARN(layer_submission_data.layer_arn);

	console.log('Creating layer database entry from submission data...');
	await database.LambdaLayer.create({
		'id': uuidv4(),
		'layer_arn': lambdaLayerARNs[0],
		'source_link': layer_submission_data.source_link,
		'submitter_name': layer_submission_data.submitter_name,
		'description': layer_submission_data.description,
		'license': layer_submission_data.license,
	});

	console.log('Deleting submission from submissions table...');
	await database.LayerSubmission.destroy({
		where: {
			id: layer_submission_data.id
		}
	});

	console.log('Submission imported successfully! This is now available for immediate use in the database.');
}

const submitLambdaLayerSchema = {
	"type": "object",
	"properties": {
		"layer_arn": {
			"type": "string"
		},
		"source_link": {
			"type": "string"
		},
		"submitter_name": {
			"type": "string"
		},
		"description": {
			"type": "string"
		},
		"license": {
			"type": "string"
		}
	},
	"required": [
		"layer_arn",
		"source_link",
		"submitter_name",
		"description",
		"license"
	]
}
router.post('/api/v1/layers/submit', async (ctx, next) => {
	if(!requestMatchesJSONSchema(ctx, submitLambdaLayerSchema)) {
		ctx.throw(401, 'Request body invalid, please use the correct format.');
	}

	const approval_secret = crypto.randomBytes(32).toString('hex');

	const submissionData = {
		'id': uuidv4(),
		'layer_arn': ctx.request.body.layer_arn,
		'source_link': ctx.request.body.source_link,
		'submitter_name': ctx.request.body.submitter_name,
		'description': ctx.request.body.description,
		'license': ctx.request.body.license,
		'approval_secret': approval_secret
	};

	// Add submission to database
	try {
		console.log('Inserting layer submission into database for approval...');
		await database.LayerSubmission.create(submissionData);
	} catch ( e ) {
		if (e.name == 'SequelizeUniqueConstraintError') {
			console.log('Cannot insert layer submission into database, layer ARN already exists!');
			ctx.body = {
				'success': false,
				'msg': 'That Lambda layer has already been submitted for approval.'
			}
			return
		}
		throw e;
	}

	// If Mailgun is enabled, send email about it.
	if(emailer.mailgun) {
		await emailer.sendSubmissionApprovalLink(
			submissionData
		);
	}

	ctx.body = {
		'success': true,
		'msg': 'Thank you for your submission, it will be reviewed and if approved imported into the database.'
	}
});

const searchLambdaLayersSchema = {
	"type": "object",
	"properties": {
		"query": {
			"type": "string"
		}
	},
	"required": [
		"query"
	]
}
router.post('/api/v1/layers/search', async (ctx, next) => {
	if(!requestMatchesJSONSchema(ctx, searchLambdaLayersSchema)) {
		ctx.throw(401, 'Request body invalid, please use the correct format.');
	}

	const searchResults = await database.LambdaLayer.findAll({
		where: {
			[Op.or]: [
				{
					description: database.sequelize.where(
						database.sequelize.fn(
							'LOWER',
							database.sequelize.col('description')
						),
						'ILIKE',
						'%' + ctx.request.body.query + '%'
					)
				},
				{
					layer_arn: database.sequelize.where(
						database.sequelize.fn(
							'LOWER',
							database.sequelize.col('layer_arn')
						),
						'ILIKE',
						'%' + ctx.request.body.query + '%'
					)
				},
			]
		},
		limit: 5
	});

	const enrichedSearchResults = copy(searchResults).map(searchResult => {
		searchResult.layers = lambdaLayerDownloader.getLayersForAllSupportedRegions(searchResult.layer_arn);
		return searchResult;
	});

	ctx.body = {
		'success': true,
		'search_results': enrichedSearchResults
	}
});

const checkLambdaLayersSchema = {
	"type": "object",
	"properties": {
		"layer_arn": {
			"type": "string"
		}
	},
	"required": [
		"layer_arn"
	]
}
router.post('/api/v1/layers/check', async (ctx, next) => {
	if(!requestMatchesJSONSchema(ctx, checkLambdaLayersSchema)) {
		ctx.throw(401, 'Request body invalid, please use the correct format.');
	}

	const layerIsValidAndExists = await lambdaLayerDownloader.isLambdaLayerValidAndExisting(
		ctx.request.body.layer_arn
	);

	if(!layerIsValidAndExists) {
		ctx.body = {
			'success': true,
			'exists': false
		}
		return
	}

	ctx.body = {
		'success': true,
		'exists': true
	}
});

router.get('/api/v1/layers/:layer_id', async (ctx, next) => {
	const layerResult = await database.LambdaLayer.findOne({
		where: {
			id: ctx.params.layer_id
		}
	});

	if(!layerResult) {
		ctx.body = {
			'success': false,
			'msg': 'No layer was found with that ID!'
		}
		return
	}

	ctx.body = {
		'success': true,
		'layer_info': layerResult
	}
});

(async () => {
	await database.database_init();
	console.log(`[STATUS] Lambda layer database API has started on 0.0.0.0:${SERVER_PORT}...`);
	app.listen(SERVER_PORT);
})();

const SERVER_PORT = parseInt( process.env.PORT ) || 7777;

app.use(router.routes()).use(router.allowedMethods());