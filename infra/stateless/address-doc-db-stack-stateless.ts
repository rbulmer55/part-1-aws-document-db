import * as cdk from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import path, { join } from 'path';

interface StatelessProps extends cdk.StackProps {
	appVpc: Vpc;
	appSecurityGroup: SecurityGroup;
	appDatabaseSecret: Secret;
	appDatabasePem: StringParameter;
	appDatabaseName: string;
}

export class StatelessStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: StatelessProps) {
		super(scope, id, props);

		if (!props?.appVpc || !props.appSecurityGroup) {
			throw new Error('StackProps undefined.');
		}

		// GET api/countries/{CountryCode}/addresses function
		const getNormalisedAddressFn = new NodejsFunction(
			this,
			'getNormalisedAddressFunction',
			{
				functionName: 'getNormalisedAddressFunction',
				runtime: Runtime.NODEJS_20_X,
				handler: 'handler',
				entry: join(
					__dirname,
					'../../src/adapters/primary/api-get-normalised-address-adapter/api-get-normalised-address-adapter.ts'
				),
				memorySize: 1024,
				vpc: props.appVpc,
				securityGroups: [props.appSecurityGroup],
				vpcSubnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
				environment: {
					ADDRESS_DB_CONNECTION_SECRET: props.appDatabaseSecret.secretName,
					ADDRESS_DB_PEM_PARAMETER: props.appDatabasePem.parameterName,
					DB_NAME: props.appDatabaseName,
					POWERTOOLS_SERVICE_NAME: 'Address-Service',
					POWERTOOLS_LOG_LEVEL: 'INFO',
				},
			}
		);
		// Allow the function to get Secret and Parameter
		props.appDatabaseSecret.grantRead(getNormalisedAddressFn);
		props.appDatabasePem.grantRead(getNormalisedAddressFn);

		// Create our API with a path parameter for country code
		const addressApi = new RestApi(this, 'address-api', {});
		const countryResource = addressApi.root.resourceForPath(
			'/countries/{country}'
		);

		// Add an Addresses resource and proxy requests to our lambda function
		const addressResource = countryResource.addResource('addresses');
		addressResource.addMethod(
			HttpMethod.GET,
			new LambdaIntegration(getNormalisedAddressFn)
		);

		const migrateFn = new NodejsFunction(this, 'migrateUpFunction', {
			functionName: 'migrateUpFunction',
			runtime: Runtime.NODEJS_20_X,
			handler: 'handler',
			entry: join(
				__dirname,
				'../../src/adapters/secondary/doc-db/migrations/migrate-handler.ts'
			),
			memorySize: 1024,
			vpc: props.appVpc,
			securityGroups: [props.appSecurityGroup],
			vpcSubnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
			environment: {
				ADDRESS_DB_CONNECTION_SECRET: props.appDatabaseSecret.secretName,
				ADDRESS_DB_PEM_PARAMETER: props.appDatabasePem.parameterName,
				DB_NAME: props.appDatabaseName,
				POWERTOOLS_SERVICE_NAME: 'Address-Service',
				POWERTOOLS_LOG_LEVEL: 'INFO',
			},
			bundling: {
				commandHooks: {
					afterBundling(inputDir: string, outputDir: string): string[] {
						return [];
					},
					beforeInstall(inputDir: string, outputDir: string): string[] {
						return [];
					},
					// Returns commands to run before bundling.
					beforeBundling(inputDir: string, outputDir: string): string[] {
						return [`cp -r ${path.join(inputDir, `migrations`)} ${outputDir}`];
					},
				},
			},
		});
		props.appDatabaseSecret.grantRead(migrateFn);
		props.appDatabasePem.grantRead(migrateFn);
	}
}
