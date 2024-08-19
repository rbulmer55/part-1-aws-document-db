import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import middy from '@middy/core';
import { Handler } from 'aws-lambda';
import { logger, tracer } from '@shared/monitor';

/**
 * Lambda Middy wrapper.
 * @param handler
 * @returns MiddyfiedHandler
 */
export const wrapper = <T extends Handler>(
	handler: T
): middy.MiddyfiedHandler => {
	return middy(handler)
		.use(injectLambdaContext(logger))
		.use(captureLambdaHandler(tracer));
};
