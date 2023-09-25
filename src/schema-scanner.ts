import { transformComment } from '@graphql-codegen/visitor-plugin-common';
import {
  GraphQLSchema,
  ASTNode,
  FieldDefinitionNode,
  Kind,
  ObjectTypeDefinitionNode,
  TypeNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import { Config } from './config.js';

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

function isTypeBasedOnUserDefinedType(node: TypeNode, userDefinedTypeNames: string[]): boolean {
  if (node.kind === Kind.NON_NULL_TYPE) {
    return isTypeBasedOnUserDefinedType(node.type, userDefinedTypeNames);
  } else if (node.kind === Kind.LIST_TYPE) {
    return isTypeBasedOnUserDefinedType(node.type, userDefinedTypeNames);
  } else {
    return userDefinedTypeNames.includes(node.name.value);
  }
}

function parseTypeNode(node: TypeNode, config: Config): string {
  if (node.kind === Kind.NON_NULL_TYPE) {
    return clearOptional(parseTypeNode(node.type, config));
  } else if (node.kind === Kind.LIST_TYPE) {
    return `Maybe<${parseTypeNode(node.type, config)}[]>`;
  } else {
    return `Maybe<Optional${convertName(node.name.value, config)}>`;
  }
}

function parseFieldOrInputValueDefinition(
  node: FieldDefinitionNode | InputValueDefinitionNode,
  objectTypeName: string,
  config: Config,
  userDefinedTypeNames: string[],
): { typeString: string; comment: string | undefined } {
  const comment = node.description ? transformComment(node.description) : undefined;
  if (isTypeBasedOnUserDefinedType(node.type, userDefinedTypeNames)) {
    return { typeString: `${parseTypeNode(node.type, config)} | undefined`, comment };
  } else {
    return { typeString: `${objectTypeName}['${node.name.value}'] | undefined`, comment };
  }
}

function parseObjectTypeOrInputObjectTypeDefinition(
  node: ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode,
  config: Config,
  userDefinedTypeNames: string[],
  getAbstractTypeNames: (type: ObjectTypeDefinitionNode) => string[],
): TypeInfo {
  const objectTypeName = convertName(node.name.value, config);
  const comment = node.description ? transformComment(node.description) : undefined;
  const abstractTypeNames = node.kind === Kind.OBJECT_TYPE_DEFINITION ? getAbstractTypeNames(node) : [];
  return {
    name: objectTypeName,
    fields: [
      ...(!config.skipTypename ? [{ name: '__typename', typeString: `'${objectTypeName}'` }] : []),
      ...(!config.skipAbstractType
        ? abstractTypeNames.map((name) => ({ name: `__is${name}`, typeString: `'${objectTypeName}'` }))
        : []),
      ...(node.fields ?? []).map((field) => ({
        name: field.name.value,
        ...parseFieldOrInputValueDefinition(field, objectTypeName, config, userDefinedTypeNames),
      })),
    ],
    comment,
  };
}

type FieldInfo = { name: string; typeString: string; comment?: string | undefined };
export type TypeInfo = { name: string; fields: FieldInfo[]; comment?: string | undefined };

export function getTypeInfos(config: Config, schema: GraphQLSchema): TypeInfo[] {
  const types = Object.values(schema.getTypeMap());

  const objectTypeOrInputObjectTypeDefinitions = types
    .map((type) => type.astNode)
    .filter((node): node is ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode => {
      if (!node) return false;
      return node.kind === Kind.OBJECT_TYPE_DEFINITION || node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION;
    });
  const unionTypeDefinitions = types
    .map((type) => type.astNode)
    .filter((node): node is UnionTypeDefinitionNode => {
      if (!node) return false;
      return node.kind === Kind.UNION_TYPE_DEFINITION;
    });
  function getAbstractTypeNames(type: ObjectTypeDefinitionNode): string[] {
    const interfaceNames = (type.interfaces ?? []).map((i) => i.name.value);
    const unionNames = unionTypeDefinitions
      .filter((union) => (union.types ?? []).some((member) => member.name.value === type.name.value))
      .map((union) => union.name.value);
    return [...interfaceNames, ...unionNames];
  }

  const userDefinedTypeNames = objectTypeOrInputObjectTypeDefinitions.map((type) => type.name.value);

  const typeInfos = objectTypeOrInputObjectTypeDefinitions.map((node) =>
    parseObjectTypeOrInputObjectTypeDefinition(node, config, userDefinedTypeNames, getAbstractTypeNames),
  );

  return typeInfos;
}
