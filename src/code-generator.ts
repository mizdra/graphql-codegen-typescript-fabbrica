import type { Config } from './config.js';
import type { ObjectTypeInfo, TypeInfo } from './schema-scanner.js';

function generatePreludeCode(config: Config, typeInfos: TypeInfo[]): string {
  const joinedTypeNames = typeInfos
    .filter(({ type }) => type === 'object')
    .map(({ name }) => `  ${name}`)
    .join(',\n');
  const code = `
import {
  type DefineTypeFactoryInterface${config.nonOptionalDefaultFields ? 'Required' : ''},
  defineTypeFactory,
} from '@mizdra/graphql-codegen-typescript-fabbrica/helper';
import type {
  Maybe,
${joinedTypeNames},
} from '${config.typesFile}';

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

function generateTypeFactoryCode({ nonOptionalDefaultFields }: Config, typeInfo: ObjectTypeInfo): string {
  const { name } = typeInfo;
  return `
/**
 * Define factory for {@link ${name}} model.
 *
 * @param options
 * @returns factory {@link ${name}FactoryInterface}
 */
export const define${name}Factory: DefineTypeFactoryInterface${nonOptionalDefaultFields ? 'Required' : ''}<
  Optional${name},
  {}
> = defineTypeFactory;
`.trimStart();
}

export function generateCode(config: Config, typeInfos: TypeInfo[]): string {
  let code = '';
  code += generatePreludeCode(config, typeInfos);
  code += '\n';
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
