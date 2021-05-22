// src/store/services/users.js
import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'

class Gamestate extends BaseModel {
  /* eslint-disable no-useless-constructor */
  constructor (data, options) {
    super(data, options)
  }

  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'Gamestate'
  // Define default properties here
  static instanceDefaults () {
    return {
      username: '',
      bingoId: '',
      clickedIdx: null,
      word: null
    }
  }
}
const servicePath = 'gamestate'
const servicePlugin = makeServicePlugin({
  Model: Gamestate,
  service: feathersClient.service(servicePath),
  servicePath,
  handleEvents: {
    removed: async (item, { model }) => {
      await model.store.commit('gamestate/clearAll')
      await model.store.dispatch('gamestate/find', { query: {} })

      return true
    }
  }
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
