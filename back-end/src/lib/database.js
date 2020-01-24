const Sequelize = require('sequelize');
const uuidv4 = require('uuid/v4');
const Model = Sequelize.Model;

const sequelize = new Sequelize(
	process.env.DATABASE_NAME,
	process.env.DATABASE_USER,
	process.env.DATABASE_PASSWORD,
	{
		host: process.env.DATABASE_HOST,
		dialect: 'postgres',
		benchmark: true,
		logging: false
	},
);

class LayerSubmission extends Model {}
LayerSubmission.init({
	id: {
		allowNull: false,
		primaryKey: true,
		type: Sequelize.UUID,
		defaultValue: uuidv4()
	},
	// The ARN of the submitted Lambda layer
	// Once approved, this will be used to clone
	// the Lambda layer so it can be mirrored to
	// all supported regions.
	layer_arn: {
		type: Sequelize.TEXT,
		allowNull: false,
		unique: true
	},
	// An optional source link to a Github or
	// some other repo for the provided layer.
	source_link: {
		type: Sequelize.TEXT,
		allowNull: true,
	},
	// Name/handle of the person submitting
	// the layer to the database
	submitter_name: {
		type: Sequelize.TEXT,
		allowNull: true,
	},
	// A description of the Lambda layer
	description: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	// License of the submitted Lambda layer
	license: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	// This is a secret value used to create
	// approval links for the owner to click
	// on to approve importing the layer into
	// the database.
	approval_secret: {
		type: Sequelize.TEXT,
		allowNull: false,
		unique: true
	},
}, {
	sequelize,
	modelName: 'layer_submissions'
});

class LambdaLayer extends Model {}
LambdaLayer.init({
	id: {
		allowNull: false,
		primaryKey: true,
		type: Sequelize.UUID,
		defaultValue: uuidv4()
	},
	// The ARN of the Lambda layer
	// This can include any region but it is
	// automatically replaced with the appropriate
	// region by the backend when returned to the user.
	layer_arn: {
		type: Sequelize.TEXT,
		allowNull: false,
		unique: true
	},
	// An optional source link to a Github or
	// some other repo for the provided layer.
	source_link: {
		type: Sequelize.TEXT,
		allowNull: true,
	},
	// Name/handle of the person submitting
	// the layer to the database
	submitter_name: {
		type: Sequelize.TEXT,
		allowNull: true,
	},
	// A description of the Lambda layer
	description: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	// License of the submitted Lambda layer
	license: {
		type: Sequelize.TEXT,
		allowNull: false,
	}
}, {
	sequelize,
	modelName: 'layers',
	indexes: [
		{
			unique: true,
			fields: ['layer_arn'],
			method: 'BTREE',
		},
		{
			unique: false,
			fields: ['description'],
			method: 'BTREE',
		},
		{
			unique: false,
			fields: ['submitter_name'],
			method: 'BTREE',
		},
		{
			unique: false,
			fields: ['license'],
			method: 'BTREE',
		}
	]
});

async function database_init() {
	const force = false;
	await LayerSubmission.sync({ force: force });
	await LambdaLayer.sync({ force: force });
}

module.exports = {
	LayerSubmission,
	LambdaLayer,
	database_init,
	sequelize
};