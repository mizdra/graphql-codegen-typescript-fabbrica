// from: https://the-guild.dev/graphql/codegen/docs/config-reference/naming-convention#providing-your-own-naming-function

/**
 * @param {string} str
 * @return {string}
 */
function namingConvention(str) {
  if (str.includes('NamingConventionTest_Type')) {
    return str.replaceAll('NamingConventionTest_Type', 'NamingConventionTest_RenamedType');
  }
  return str;
}
module.exports = namingConvention;
