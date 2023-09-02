export type Options = {
  typesFile: string;
  // TODO: support addTypename, addIsAbstractType
};

export function validateOptions(options: unknown): asserts options is Options {
  if (typeof options !== 'object' || options === null) {
    throw new Error('`options` must be an object');
  }
  if (!('typesFile' in options)) {
    throw new Error('`option.typesFile` is required');
  }
  if (typeof options['typesFile'] !== 'string') {
    throw new Error('`options.typesFile` must be a string');
  }
}
