import { Config } from './config.js';
import { TypeInfo } from './schema-scanner.js';

function generatePreludeCode(config: Config, typeInfos: TypeInfo[]): string {
  const joinedTypeNames = typeInfos.map(({ name }) => name).join(', ');
  const code = `
import {
  type Traits,
  type TypeFactoryDefineOptions,
  type TypeFactoryInterface,
  type DefaultFieldsResolver,
  defineTypeFactoryInternal,
} from '@mizdra/graphql-fabbrica/helper';
import type { ${joinedTypeNames} } from '${config.typesFile}';

export * from '@mizdra/graphql-fabbrica/helper';
  `.trim();
  return `${code}\n`;
}

function generateTypeFactoryCode(typeInfo: TypeInfo): string {
  const { name, fieldNames } = typeInfo;
  const joinedFieldNames = fieldNames.map((name) => `'${name}'`).join(', ');
  const code = `
const ${name}FieldNames = [${joinedFieldNames}] as const;

export type ${name}FactoryDefineOptions<
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends DefaultFieldsResolver<${name} & TransientFields>,
  _Traits extends Traits<${name}, TransientFields>,
> = TypeFactoryDefineOptions<${name}, TransientFields, _DefaultFieldsResolver, _Traits>;
export type ${name}FactoryInterface<
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends DefaultFieldsResolver<${name} & TransientFields>,
  _Traits extends Traits<${name}, TransientFields>,
> = TypeFactoryInterface<${name}, TransientFields, _DefaultFieldsResolver, _Traits>;

export function define${name}FactoryInternal<
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends DefaultFieldsResolver<${name} & TransientFields>,
  _Traits extends Traits<${name}, TransientFields>,
>(
  options: ${name}FactoryDefineOptions<TransientFields, _DefaultFieldsResolver, _Traits>,
): ${name}FactoryInterface<TransientFields, _DefaultFieldsResolver, _Traits> {
  return defineTypeFactoryInternal(${name}FieldNames, options);
}

/**
 * Define factory for {@link ${name}} model.
 *
 * @param options
 * @returns factory {@link ${name}FactoryInterface}
 */
export function define${name}Factory<
  _DefaultFieldsResolver extends DefaultFieldsResolver<${name}>,
  _Traits extends Traits<${name}, {}>,
>(
  options: ${name}FactoryDefineOptions<{}, _DefaultFieldsResolver, _Traits>,
): ${name}FactoryInterface<{}, _DefaultFieldsResolver, _Traits> {
  return define${name}FactoryInternal(options);
}
  `.trim();
  return `${code}\n`;
}

export function generateCode(config: Config, typeInfos: TypeInfo[]): string {
  let code = '';
  code += generatePreludeCode(config, typeInfos);
  for (const typeInfo of typeInfos) {
    code += generateTypeFactoryCode(typeInfo);
  }
  return code;
}
