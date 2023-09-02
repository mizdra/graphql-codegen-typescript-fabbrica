import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { Config } from './config.js';

export type TypeInfo = { name: string; fieldNames: string[] };

function getAdditionalFieldNames(config: Config): string[] {
  // TODO: support __is<AbstractType> (__is<InterfaceType>, __is<UnionType>)
  const result = [];
  if (!config.skipTypename) result.push('__typename');
  return result;
}

export function getTypeInfos(config: Config, schema: GraphQLSchema): TypeInfo[] {
  const result: TypeInfo[] = [];
  const types = Object.values(schema.getTypeMap());
  for (const type of types) {
    // Ignore non-object types (e.g. scalars, enums, unions, interfaces)
    if (!(type instanceof GraphQLObjectType)) continue;

    // Ignore introspectionTypes
    // ref: https://github.com/graphql/graphql-js/blob/b12dcffe83098922dcc6c0ec94eb6fc032bd9772/src/type/introspection.ts#L552-L559
    if (type.name.startsWith('__')) continue;

    const fieldMap = type.getFields();
    const fieldNames = Object.values(fieldMap).map((field) => field.name);
    const additionalFieldNames = getAdditionalFieldNames(config);
    result.push({ name: type.name, fieldNames: [...additionalFieldNames, ...fieldNames] });
  }
  return result;
}
