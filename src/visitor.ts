import { ASTNode, FieldDefinitionNode, Kind, ObjectTypeDefinitionNode, TypeNode, ASTVisitor } from 'graphql';
import { Config } from './config.js';
import { TypeInfo } from './schema-scanner.js';

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

export const createTypeInfoVisitor = (
  config: Config,
  userDefinedTypeNames: string[],
): ASTVisitor & { getTypeInfos: () => TypeInfo[] } => {
  const typeInfos: TypeInfo[] = [];

  function parseTypeNode(node: TypeNode): string {
    if (node.kind === Kind.NON_NULL_TYPE) {
      return clearOptional(parseTypeNode(node.type));
    } else if (node.kind === Kind.LIST_TYPE) {
      return `Maybe<${parseTypeNode(node.type)}[]>`;
    } else {
      return `Maybe<Optional${node.name.value}>`;
    }
  }

  function parseFieldDefinition(node: FieldDefinitionNode, objectTypeName: string): string {
    let typeString: string;
    if (isTypeBasedOnUserDefinedType(node.type, userDefinedTypeNames)) {
      typeString = `${parseTypeNode(node.type)} | undefined`;
    } else {
      typeString = `${objectTypeName}['${node.name.value}'] | undefined`;
    }
    return typeString;
  }

  function parseObjectTypeDefinition(node: ObjectTypeDefinitionNode): TypeInfo {
    const objectTypeName = convertName(node.name.value, config);
    return {
      name: objectTypeName,
      fields: [
        // TODO: support __is<AbstractType> (__is<InterfaceType>, __is<UnionType>)
        ...(!config.skipTypename ? [{ name: '__typename', typeString: `'${objectTypeName}'` }] : []),
        ...(node.fields ?? []).map((field) => ({
          name: field.name.value,
          typeString: parseFieldDefinition(field, objectTypeName),
        })),
      ],
    };
  }

  return {
    ObjectTypeDefinition(node) {
      typeInfos.push(parseObjectTypeDefinition(node));
    },
    // TODO: Support InputObjectTypeDefinition
    getTypeInfos() {
      return typeInfos;
    },
  };
};
