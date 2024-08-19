#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StatelessStack } from '@infra/stateless';
import { StatefulStack } from '@infra/stateful';

const app = new cdk.App();
const stateful = new StatefulStack(app, 'AddressStatefulStack', {});
new StatelessStack(app, 'AddressStatelessStack', {
	appVpc: stateful.appVpc,
	appDatabasePem: stateful.appDbPem,
	appDatabaseSecret: stateful.appDbSecret,
	appSecurityGroup: stateful.appSecurityGroup,
	appDatabaseName: stateful.appDbName,
});
