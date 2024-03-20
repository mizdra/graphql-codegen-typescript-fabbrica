import { Config } from './config.js';
import { ObjectTypeInfo, TypeInfo } from './schema-scanner.js';

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
  if (typeInfo.type === 'object') {
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
  } else {
    const { name, possibleTypes } = typeInfo;
    const comment = typeInfo.comment ?? '';
    const joinedPossibleTypes = possibleTypes.map((type) => `Optional${type}`).join(' | ');
    return `
${comment}export type Optional${name} = ${joinedPossibleTypes};
`.trimStart();
  }
}

function generateTypeFactoryCode(config: Config, typeInfo: ObjectTypeInfo): string {
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
  return defineTypeFactoryInternal([], options);
}

/**
 * Define factory for {@link ${name}} model with Transient Fields.
 *
 * @param defaultTransientFields
 * @returns defineTypeFactory {@link define${name}Factory}
 */
define${name}Factory.withTransientFields = <TransientFields extends Record<string, unknown>>(
  defaultTransientFields: TransientFields,
) => {
  return <
    _DefaultFieldsResolver extends FieldsResolver<Optional${name} & TransientFields>,
    _Traits extends Traits<Optional${name}, TransientFields>,
  >(
    options: ${name}FactoryDefineOptions<{}, _DefaultFieldsResolver, _Traits>,
  ): ${name}FactoryInterface<TransientFields, _DefaultFieldsResolver, _Traits> => {
    return defineTypeFactoryInternal(Object.keys(defaultTransientFields), {
      ...options,
      defaultFields: { ...(defaultTransientFields as FieldsResolver<TransientFields>), ...options.defaultFields },
    });
  };
};
`.trimStart();
}

export function generateCode(config: Config, typeInfos: TypeInfo[]): string {
  let code = '';
  code += generatePreludeCode(config, typeInfos);
  for (const typeInfo of typeInfos) {
    code += generateOptionalTypeDefinitionCode(typeInfo);
    code += '\n';
    if (typeInfo.type === 'object') {
      code += generateTypeFactoryCode(config, typeInfo);
      code += '\n';
    }
  }
  return code;
}
