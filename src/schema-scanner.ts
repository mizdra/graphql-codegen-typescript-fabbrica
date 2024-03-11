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
  InterfaceTypeDefinitionNode,
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
  convertedTypeName: string,
  config: Config,
  userDefinedTypeNames: string[],
): { typeString: string; comment: string | undefined } {
  const comment = node.description ? transformComment(node.description) : undefined;
  if (isTypeBasedOnUserDefinedType(node.type, userDefinedTypeNames)) {
    return { typeString: `${parseTypeNode(node.type, config)} | undefined`, comment };
  } else {
    return { typeString: `${convertedTypeName}['${node.name.value}'] | undefined`, comment };
  }
}

function parseObjectTypeOrInputObjectTypeDefinition(
  node: ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode,
  config: Config,
  userDefinedTypeNames: string[],
  getAbstractTypeNames: (type: ObjectTypeDefinitionNode) => string[],
): ObjectTypeInfo {
  const originalTypeName = node.name.value;
  const convertedTypeName = convertName(originalTypeName, config);
  const comment = node.description ? transformComment(node.description) : undefined;
  const abstractTypeNames = node.kind === Kind.OBJECT_TYPE_DEFINITION ? getAbstractTypeNames(node) : [];
  return {
    type: 'object',
    name: convertedTypeName,
    fields: [
      ...(!config.skipTypename ? [{ name: '__typename', typeString: `'${originalTypeName}'` }] : []),
      ...(!config.skipIsAbstractType
        ? abstractTypeNames.map((name) => ({ name: `__is${name}`, typeString: `'${originalTypeName}'` }))
        : []),
      ...(node.fields ?? []).map((field) => ({
        name: field.name.value,
        ...parseFieldOrInputValueDefinition(field, convertedTypeName, config, userDefinedTypeNames),
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

  const userDefinedTypeDefinitions = types
    .map((type) => type.astNode)
    .filter(
      (
        node,
      ): node is
        | ObjectTypeDefinitionNode
        | InputObjectTypeDefinitionNode
        | InterfaceTypeDefinitionNode
        | UnionTypeDefinitionNode => {
        if (!node) return false;
        return (
          node.kind === Kind.OBJECT_TYPE_DEFINITION ||
          node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION ||
          node.kind === Kind.INTERFACE_TYPE_DEFINITION ||
          node.kind === Kind.UNION_TYPE_DEFINITION
        );
      },
    );
  const objectTypeDefinitions = userDefinedTypeDefinitions.filter((node): node is ObjectTypeDefinitionNode => {
    if (!node) return false;
    return node.kind === Kind.OBJECT_TYPE_DEFINITION;
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

  const userDefinedTypeNames = userDefinedTypeDefinitions.map((node) => node.name.value);

  return types
    .map((type) => type.astNode)
    .filter(
      (
        node,
      ): node is
        | ObjectTypeDefinitionNode
        | InputObjectTypeDefinitionNode
        | InterfaceTypeDefinitionNode
        | UnionTypeDefinitionNode => {
        if (!node) return false;
        return (
          node.kind === Kind.OBJECT_TYPE_DEFINITION ||
          node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION ||
          node.kind === Kind.INTERFACE_TYPE_DEFINITION ||
          node.kind === Kind.UNION_TYPE_DEFINITION
        );
      },
    )
    .map((node) => {
      if (node?.kind === Kind.OBJECT_TYPE_DEFINITION || node?.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION) {
        return parseObjectTypeOrInputObjectTypeDefinition(node, config, userDefinedTypeNames, getAbstractTypeNames);
      } else if (node?.kind === Kind.INTERFACE_TYPE_DEFINITION) {
        return {
          type: 'abstract',
          name: convertName(node.name.value, config),
          possibleTypes: objectTypeDefinitions
            .filter((objectTypeDefinitionNode) =>
              (objectTypeDefinitionNode.interfaces ?? []).some((i) => i.name.value === node.name.value),
            )
            .map((objectTypeDefinitionNode) => convertName(objectTypeDefinitionNode.name.value, config)),
          comment: node.description ? transformComment(node.description) : undefined,
        };
      } else {
        return {
          type: 'abstract',
          name: convertName(node.name.value, config),
          possibleTypes: (node.types ?? []).map((type) => convertName(type.name.value, config)),
          comment: node.description ? transformComment(node.description) : undefined,
        };
      }
    });
}
