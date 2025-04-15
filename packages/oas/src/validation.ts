import { BadRequest } from '../errors';
import config from 'config';

function guardAgainstForbiddenIncludePattern(includeVal: string[], includeParam?: Serializable, context?: _Context) {
  if (!includeVal || includeVal.length === 0) return;
  if (!includeParam) return;

  const includeRules = includeParam['x-include-rules'] || {};
  const relationships = includeParam['x-direct-relations'];
  const whitelist = includeRules.whitelist || [];
  const blacklist = includeRules.blacklist || [];
  let maxDepth = includeRules['max-depth'];
  if (maxDepth === null || maxDepth === undefined) maxDepth = config.routers.json.maxRelationshipDepth;

  for (let i = 0; i < includeVal.length; i++) {
    const rejectReason = (
      ((includeVal[i].split('.').length > maxDepth && !whitelist.includes(includeVal[i])) && 'Too much nesting') ||
      (blacklist.includes(includeVal[i]) && 'Relationship forbidden') ||
      (!relationships.includes(includeVal[i].split('.')[0]) && 'Not a relationship') ||
      null
    );

    if (rejectReason !== null) throw BadRequest(`Invalid include value ${includeVal[i]}: ${rejectReason}`, context);
  }
}

export const path = {
  guardAgainstForbiddenIncludePattern,
};

import { createHmac } from 'crypto';
import { BadRequest, Unauthorized } from './errors';

interface PayloadHmacSignatureOptions {
  algo?: 'sha256'
  key: string
  payload: string | Buffer
  signature: string
}

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const emptyStringRegex = /^\s+$/;
const ipRegex = new RegExp(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/);

function isValidUUID(uuid: string): boolean {
  const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

  return regexExp.test(uuid);
}

function isEmpty(value: string): boolean {
  return !value || emptyStringRegex.test(value);
}

function isValidEmail(email: string): boolean {
  return emailRegex.test(email);
}

function isValidIp(ip: string): boolean {
  return ipRegex.test(ip.trim());
}

function isValidFullYear(year: string): boolean {
  return new RegExp(/^\d{4}$/).test(year);
}

function isValidMonth(month: string) {
  return ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].includes(month);
}

function isPositiveInteger(n: number): boolean {
  return Number.isInteger(n) && n >= 0;
}

function isFieldNotEmpty(object: any, field: string): boolean {
  return Object.hasOwnProperty.bind(object)(field) && ![undefined, null, ''].includes(object[field]);
}

function empty(value: string, key: string, context: _Context) {
  if (isEmpty(value)) throw BadRequest(`Missing \`${key}\`.`, context);
}

function isValidHmacSignature({ payload, algo, key, signature }: PayloadHmacSignatureOptions): boolean {
  return createHmac(algo || 'sha256', key)
    .update(payload)
    .digest('base64') === signature;
}

function invalidHmacSignature(options: PayloadHmacSignatureOptions, context: _Context) {
  if (!isValidHmacSignature(options)) throw Unauthorized('Invalid Signature', context);
}

function isMissingRequiredProperties(props: Array<string>, obj: Object): boolean {
  return props.some((prop) => !(prop in obj));
}

export const guards = {
  empty,
  invalidHmacSignature,
};

export const validations = {
  emailRegex,
  ipRegex,
  isEmpty,
  isFieldNotEmpty,
  isMissingRequiredProperties,
  isPositiveInteger,
  isValidEmail,
  isValidFullYear,
  isValidHmacSignature,
  isValidIp,
  isValidMonth,
  isValidUUID,
};

import validate from 'swagger-route-validator';
import { BadRequest, NotFound } from '../../errors';

export default (app) => function validateRequest(req: ExpressRequest, res: any, next: ExpressNext) {
  const operationId = `${req.method.toLowerCase()} ${req.route.path}`;
  const matchingSpec: _Route = app._spec[operationId];
  req.context.operationId = operationId;

  if (!matchingSpec) throw NotFound(`Route not found ${operationId}`, req.context);

  req.context.params = { ...req.params, ...req.query, body: req.body };

  const errors = validate(matchingSpec, req.context);
  if (errors.length > 0) throw BadRequest(JSON.stringify(errors), req.context);

  const includeVal = req.context.params.include;
  const includeParam = matchingSpec.parameters.find((param) => param.name === 'include');
  path.guardAgainstForbiddenIncludePattern(includeVal, includeParam, req.context);

  next();
};

