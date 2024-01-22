import { Config } from './config.js';
import { TypeInfo } from './schema-scanner.js';

function generatePreludeCode(config: Config, typeInfos: TypeInfo[]): string {
  const joinedTypeNames = typeInfos.map(({ name }) => name).join(', ');
  const code = `
import {
  type Traits,
  type TypeFactoryDefineOptions,
  type TypeFactoryInterface,
  type FieldsResolver,
  defineTypeFactoryInternal,
} from '@mizdra/graphql-codegen-typescript-fabbrica/helper';
import type { Maybe, ${joinedTypeNames} } from '${config.typesFile}';

export * from '@mizdra/graphql-codegen-typescript-fabbrica/helper';
  `.trim();
  return `${code}\n`;
}

export function generateOptionalTypeDefinitionCode(typeInfo: TypeInfo): string {
  const { name, fields } = typeInfo;
  const comment = typeInfo.comment ?? '';
  const joinedPropDefinitions = fields
    .map((field) => {
      const comment = field.comment ? `  ${field.comment}` : '';
      return `${comment}  ${field.name}?: ${field.typeString};`;
    })
    .join('\n');
  return `
${comment}export type Optional${name} = {
${joinedPropDefinitions}
};
`.trimStart();
}

function generateFieldNamesDefinitionCode(typeInfo: TypeInfo): string {
  const { name, fields } = typeInfo;
  const joinedFieldNames = fields.map((field) => `'${field.name}'`).join(', ');
  return `const ${name}FieldNames = [${joinedFieldNames}] as const;\n`;
}

function generateTypeFactoryCode(config: Config, typeInfo: TypeInfo): string {
  const { name } = typeInfo;
  function wrapRequired(str: string) {
    return config.nonOptionalDefaultFields ? `Required<${str}>` : str;
  }
  return `
export type ${name}FactoryDefineOptions<
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends FieldsResolver<Optional${name} & TransientFields>,
  _Traits extends Traits<Optional${name}, TransientFields>,
> = TypeFactoryDefineOptions<Optional${name}, TransientFields, _DefaultFieldsResolver, _Traits>;

export type ${name}FactoryInterface<
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends FieldsResolver<Optional${name} & TransientFields>,
  _Traits extends Traits<Optional${name}, TransientFields>,
> = TypeFactoryInterface<Optional${name}, TransientFields, _DefaultFieldsResolver, _Traits>;

export function define${name}FactoryInternal<
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends ${wrapRequired(`FieldsResolver<Optional${name} & TransientFields>`)},
  _Traits extends Traits<Optional${name}, TransientFields>,
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
  _DefaultFieldsResolver extends ${wrapRequired(`FieldsResolver<Optional${name}>`)},
  _Traits extends Traits<Optional${name}, {}>,
>(
  options: ${name}FactoryDefineOptions<{}, _DefaultFieldsResolver, _Traits>,
): ${name}FactoryInterface<{}, _DefaultFieldsResolver, _Traits> {
  return define${name}FactoryInternal(options);
}
`.trimStart();
}

export function generateCode(config: Config, typeInfos: TypeInfo[]): string {
  let code = '';
  code += generatePreludeCode(config, typeInfos);
  for (const typeInfo of typeInfos) {
    code += generateOptionalTypeDefinitionCode(typeInfo);
    code += '\n';
    code += generateFieldNamesDefinitionCode(typeInfo);
    code += '\n';
    code += generateTypeFactoryCode(config, typeInfo);
    code += '\n';
  }
  return code;
}
