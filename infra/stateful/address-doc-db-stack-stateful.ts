import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import * as docdb from 'aws-cdk-lib/aws-docdb';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { ParameterTier, StringParameter } from 'aws-cdk-lib/aws-ssm';
import { config } from '@infra/config';
import { RemovalPolicy, SecretValue } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export class StatefulStack extends cdk.Stack {
	public readonly appDbSecret;
	public readonly appDbPem;
	public readonly appSecurityGroup;
	public readonly appVpc;
	public readonly appDbName;
	constructor(scope: Construct, id: string, props: cdk.StackProps) {
		super(scope, id, props);

		const dbName = `${config.environment}-address-db`;
		this.appDbName = dbName;

		// Creates a new internal VPC
		const vpc = new Vpc(this, 'address-vpc', {
			natGateways: 0,
			maxAzs: 2, // increase as necessary for HA
			cidr: '10.0.0.0/16',
			subnetConfiguration: [
				{
					cidrMask: 24,
					name: `${config.environment}-${config.domain}-${config.projectName}-pvt-app`,
					subnetType: SubnetType.PRIVATE_ISOLATED,
				},
				{
					cidrMask: 24,
					name: `${config.environment}-${config.domain}-${config.projectName}-pub-app`,
					subnetType: SubnetType.PUBLIC,
				},
			],
		});
		this.appVpc = vpc;

		// Create a new security group for us to use
		const sg = new ec2.SecurityGroup(this, 'app-sg', {
			vpc,
		});
		this.appSecurityGroup = sg;

		const bastionKeyPair = new ec2.KeyPair(this, 'key-pair', {
			keyPairName: 'developer-ssh-keypair',
		});

		const bastion = new ec2.Instance(this, 'bastion-server', {
			vpc,
			vpcSubnets: vpc.selectSubnets({
				subnetType: ec2.SubnetType.PUBLIC,
				availabilityZones: [vpc.availabilityZones[0]],
			}),
			securityGroup: sg,
			instanceType: ec2.InstanceType.of(
				ec2.InstanceClass.T2,
				ec2.InstanceSize.MICRO
			),
			keyPair: bastionKeyPair,
			machineImage: ec2.MachineImage.latestAmazonLinux2(),
		});
		bastion.connections.allowFrom(
			ec2.Peer.ipv4('2.217.191.248/32'),
			ec2.Port.SSH,
			'developer-ssh'
		);
		bastion.connections.allowFrom(
			ec2.Peer.ipv4('2.217.191.248/32'),
			new ec2.Port({
				protocol: ec2.Protocol.TCP,
				stringRepresentation: '27017',
				fromPort: 27017,
				toPort: 27017,
			}),
			'developer-docdb'
		);

		// Define the certificate type and instance we want to deploy
		const caCertificate = docdb.CaCertificate.RDS_CA_RSA4096_G1;
		const instanceType = ec2.InstanceType.of(
			ec2.InstanceClass.T4G,
			ec2.InstanceSize.MEDIUM
		);

		// Create the db cluster inside the private subnets
		const addressCluster = new docdb.DatabaseCluster(this, 'AddressDBCluster', {
			masterUser: {
				username: 'addressAdmin',
			},
			instanceType,
			vpcSubnets: {
				subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
			},
			securityGroup: sg,
			vpc,
			caCertificate,
			removalPolicy: RemovalPolicy.DESTROY,
		});

		// Allows connection on the documentDB Port from our vpc range
		addressCluster.connections.allowDefaultPortFrom(
			ec2.Peer.ipv4(vpc.vpcCidrBlock)
		);

		// Create a new instance inside the cluster
		new docdb.DatabaseInstance(this, 'addressDbInstance', {
			cluster: addressCluster,
			instanceType: instanceType,
			dbInstanceName: dbName,
			removalPolicy: RemovalPolicy.DESTROY,
		});

		// Creates a placeholder secret for us to add the connection string
		const addressDbSecret = new Secret(this, 'db-connection-secret', {
			secretName: `db/${config.environment}/address-db`,
			secretObjectValue: {
				dbConnectionString: SecretValue.unsafePlainText('REPLACE_ME'),
			},
		});
		this.appDbSecret = addressDbSecret;

		// Creates a placeholder for the TLS Certificate
		const addressDbPem = new StringParameter(this, 'address-db-pem-parameter', {
			parameterName: `/${config.environment}/arc/rds/pem`,
			stringValue: 'REPLACE_ME',
			tier: ParameterTier.ADVANCED,
		});
		this.appDbPem = addressDbPem;

		new ec2.InterfaceVpcEndpoint(this, 'secret-endpoint', {
			service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
			vpc,
			subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
			securityGroups: [this.appSecurityGroup],
		});

		new ec2.InterfaceVpcEndpoint(this, 'ssm-endpoint', {
			service: ec2.InterfaceVpcEndpointAwsService.SSM,
			vpc,
			subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
			securityGroups: [this.appSecurityGroup],
		});
	}
}
