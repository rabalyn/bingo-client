// src/store/services/users.js
import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'

class Topics extends BaseModel {
  /* eslint-disable no-useless-constructor */
  constructor (data, options) {
    super(data, options)
  }

  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'Topics'
  // Define default properties here
  static instanceDefaults () {
    return {
      name: ''
    }
  }
}
const servicePath = 'topics'
const servicePlugin = makeServicePlugin({
  Model: Topics,
  service: feathersClient.service(servicePath),
  servicePath
})

// Setup the client-side Feathers hooks.
feathersClient.service(servicePath).hooks({
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
})

export default servicePlugin
