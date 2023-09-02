import { GraphQLObjectType, GraphQLSchema } from 'graphql';

export type TypeInfo = { name: string; fieldNames: string[] };

export function getTypeInfos(schema: GraphQLSchema): TypeInfo[] {
  const result: TypeInfo[] = [];
  const types = Object.values(schema.getTypeMap());
  for (const type of types) {
    // Ignore non-object types (e.g. scalars, enums, unions, interfaces)
    if (!(type instanceof GraphQLObjectType)) continue;

    // Ignore introspectionTypes
    // ref: https://github.com/graphql/graphql-js/blob/b12dcffe83098922dcc6c0ec94eb6fc032bd9772/src/type/introspection.ts#L552-L559
    if (type.name.startsWith('__')) continue;

    // TODO: support __typename, __is<AbstractType> (__is<Interface>, __is<Union>)
    const fieldMap = type.getFields();
    const fieldNames = Object.values(fieldMap).map((field) => field.name);
    result.push({ name: type.name, fieldNames });
  }
  return result;
}
