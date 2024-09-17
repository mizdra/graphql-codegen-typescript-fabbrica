import { transformComment } from '@graphql-codegen/visitor-plugin-common';
import type {
  ASTNode,
  GraphQLField,
  GraphQLInputField,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLType,
} from 'graphql';
// NOTE: To avoid `Cannot use GraphQLSchema xxx from another module or realm.`, import from 'graphql/index.js' instead of 'graphql'.
// ref: https://github.com/graphql/graphql-js/issues/1479
import {
  isInputObjectType,
  isInterfaceType,
  isIntrospectionType,
  isListType,
  isNonNullType,
  isObjectType,
  isSpecifiedScalarType,
  isUnionType,
} from 'graphql/index.js';

import type { Config } from './config.js';

// The fork of https://github.com/dotansimha/graphql-code-generator/blob/e1dc75f3c598bf7f83138ca533619716fc73f823/packages/plugins/typescript/resolvers/src/visitor.ts#L85-L91
function clearOptional(str: string): string {
  if (str.startsWith('Maybe')) {
    return str.replace(/Maybe<(.*?)>$/u, '$1');
  }
  return str;
}

// The fork of https://github.com/dotansimha/graphql-code-generator/blob/ba84a3a2758d94dac27fcfbb1bafdf3ed7c32929/packages/plugins/other/visitor-plugin-common/src/base-visitor.ts#L422
function convertName(node: ASTNode | string, config: Config): string {
  let convertedName = '';
  convertedName += config.typesPrefix;
  convertedName += config.convert(node);
  convertedName += config.typesSuffix;
  return convertedName;
}

function isTypeBasedOnUserDefinedType(type: GraphQLType, userDefinedTypeNames: string[]): boolean {
  if (isNonNullType(type)) {
    return isTypeBasedOnUserDefinedType(type.ofType, userDefinedTypeNames);
  } else if (isListType(type)) {
    return isTypeBasedOnUserDefinedType(type.ofType, userDefinedTypeNames);
  } else {
    return userDefinedTypeNames.includes(type.name);
  }
}

function parseTypeNode(type: GraphQLType, config: Config): string {
  if (isNonNullType(type)) {
    return clearOptional(parseTypeNode(type.ofType, config));
  } else if (isListType(type)) {
    return `Maybe<${parseTypeNode(type.ofType, config)}[]>`;
  } else {
    return `Maybe<Optional${convertName(type.name, config)}>`;
  }
}

function parseFieldOrInputField(
  field: GraphQLField<unknown, unknown> | GraphQLInputField,
  convertedTypeName: string,
  config: Config,
  userDefinedTypeNames: string[],
): { typeString: string; comment: string | undefined } {
  const comment = field.description ? transformComment(field.description) : undefined;
  if (isTypeBasedOnUserDefinedType(field.type, userDefinedTypeNames)) {
    return { typeString: `${parseTypeNode(field.type, config)} | undefined`, comment };
  } else {
    return { typeString: `${convertedTypeName}['${field.name}'] | undefined`, comment };
  }
}

function parseObjectTypeOrInputObjectType(
  type: GraphQLObjectType | GraphQLInputObjectType,
  config: Config,
  userDefinedTypeNames: string[],
  getAbstractTypeNames: (type: GraphQLObjectType) => string[],
): ObjectTypeInfo {
  const originalTypeName = type.name;
  const convertedTypeName = convertName(originalTypeName, config);
  const comment = type.description ? transformComment(type.description) : undefined;
  const abstractTypeNames = isObjectType(type) ? getAbstractTypeNames(type) : [];
  const fields = Object.values<GraphQLField<unknown, unknown> | GraphQLInputField>(type.getFields());

  return {
    type: 'object',
    name: convertedTypeName,
    fields: [
      ...(!config.skipTypename ? [{ name: '__typename', typeString: `'${originalTypeName}'` }] : []),
      ...(!config.skipIsAbstractType ?
        abstractTypeNames.map((name) => ({ name: `__is${name}`, typeString: `'${originalTypeName}'` }))
      : []),
      ...fields.map((field) => ({
        name: field.name,
        ...parseFieldOrInputField(field, convertedTypeName, config, userDefinedTypeNames),
      })),
    ],
    comment,
  };
}

type FieldInfo = { name: string; typeString: string; comment?: string | undefined };
export type ObjectTypeInfo = {
  type: 'object';
  name: string;
  fields: FieldInfo[];
  comment?: string | undefined;
};
export type AbstractTypeInfo = {
  type: 'abstract';
  name: string;
  possibleTypes: string[];
  comment?: string | undefined;
};
export type TypeInfo = ObjectTypeInfo | AbstractTypeInfo;

export function getTypeInfos(config: Config, schema: GraphQLSchema): TypeInfo[] {
  const types = Object.values(schema.getTypeMap());

  const userDefinedTypes = types
    .filter((type) => !isIntrospectionType(type) && !isSpecifiedScalarType(type))
    .filter((type) => isObjectType(type) || isInputObjectType(type) || isInterfaceType(type) || isUnionType(type));

  const objectTypes = userDefinedTypes.filter(isObjectType);
  const unionTypes = userDefinedTypes.filter(isUnionType);
  function getAbstractTypeNames(type: GraphQLObjectType): string[] {
    const interfaceNames = type.getInterfaces().map((i) => i.name);
    const unionNames = unionTypes
      .filter((union) => union.getTypes().some((member) => member.name === type.name))
      .map((union) => union.name);
    return [...interfaceNames, ...unionNames];
  }

  const userDefinedTypeNames = userDefinedTypes.map((type) => type.name);

  return userDefinedTypes.map((type) => {
    if (isObjectType(type) || isInputObjectType(type)) {
      return parseObjectTypeOrInputObjectType(type, config, userDefinedTypeNames, getAbstractTypeNames);
    } else if (isInterfaceType(type)) {
      return {
        type: 'abstract',
        name: convertName(type.name, config),
        possibleTypes: objectTypes
          .filter((objectType) => objectType.getInterfaces().some((i) => i.name === type.name))
          .map((objectType) => convertName(objectType.name, config)),
        comment: type.description ? transformComment(type.description) : undefined,
      };
    } else {
      return {
        type: 'abstract',
        name: convertName(type.name, config),
        possibleTypes: type.getTypes().map((member) => convertName(member.name, config)),
        comment: type.description ? transformComment(type.description) : undefined,
      };
    }
  });
}
