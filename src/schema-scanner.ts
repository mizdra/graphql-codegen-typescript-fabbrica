import { getCachedDocumentNodeFromSchema } from '@graphql-codegen/plugin-helpers';
import { GraphQLObjectType, GraphQLSchema, visit } from 'graphql';
import { Config } from './config.js';
import { createTypeInfoVisitor } from './visitor.js';

// TODO: Support comment
type FieldInfo = { name: string; typeString: string };
export type TypeInfo = { name: string; fields: FieldInfo[] };

export function getTypeInfos(config: Config, schema: GraphQLSchema): TypeInfo[] {
  const userDefinedTypeNames = Object.values(schema.getTypeMap())
    // Ignore introspectionTypes
    // ref: https://github.com/graphql/graphql-js/blob/b12dcffe83098922dcc6c0ec94eb6fc032bd9772/src/type/introspection.ts#L552-L559
    .filter((type) => type instanceof GraphQLObjectType && !type.name.startsWith('__'))
    .map((type) => type.name);

  const visitor = createTypeInfoVisitor(config, userDefinedTypeNames);
  const ast = getCachedDocumentNodeFromSchema(schema);

  visit(ast, visitor);

  return visitor.getTypeInfos();
}
