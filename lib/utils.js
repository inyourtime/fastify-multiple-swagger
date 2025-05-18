'use strict'

/**
 * Returns an object containing publishing options for JSON and YAML formats
 * based on the input value.
 *
 * @param {import('../').PublishOptions} publish - If an object, it is returned as-is.
 *   If `false`, returns an object disabling both `json` and `yaml`.
 *   For any other truthy value (including `true` or `undefined`), enables both.
 *
 * @returns {{ json?: boolean | string, yaml?: boolean | string }} An object with `json` and `yaml` booleans
 *   indicating whether to publish each format, or the original object if `publish` is already one.
 */
function getPublishOptions(publish) {
  if (typeof publish === 'object') {
    return publish
  }

  if (publish === false) {
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

module.exports = { getPublishOptions }
