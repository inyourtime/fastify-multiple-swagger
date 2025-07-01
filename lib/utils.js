'use strict'

/**
 * @typedef {Object} ExposeRouteOptions
 * @property {boolean | string} [json]
 * @property {boolean | string} [yaml]
 */

/**
 * Returns an object containing exposeRoute options for JSON and YAML formats
 * based on the input value.
 *
 * @param {import('../').ExposeRouteOptions} exposeRoute - If an object, it is returned as-is.
 *   If `false`, returns an object disabling both `json` and `yaml`.
 *   For any other truthy value (including `true` or `undefined`), enables both.
 *
 * @returns {ExposeRouteOptions} An object with `json` and `yaml` booleans
 *   indicating whether to exposeRoute each format, or the original object if `exposeRoute` is already one.
 */
function getExposeRouteOptions(exposeRoute) {
  if (typeof exposeRoute === 'object') {
    return exposeRoute
  }

  if (exposeRoute === false) {
    return {
      json: false,
      yaml: false,
    }
  }

  return {
    json: true,
    yaml: true,
  }
}

/**
 * Returns a unique decorator name for the given documentRef.
 *
 * @param {string} documentRef - The documentRef to generate a decorator name for.
 *
 * @returns {string} A unique decorator name.
 */
function getDecoratorName(documentRef) {
  return `multipleSwagger-${documentRef}`
}

module.exports = { getExposeRouteOptions, getDecoratorName }
