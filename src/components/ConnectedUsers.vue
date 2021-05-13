<template>
  <FeathersVuexFind
    v-slot="{ items: connectedUsers }"
    service="liveusers"
    :params="{ query: {} }"
    watch="query"
  >
    <b-tooltip
      position="is-bottom"
    >
      <template v-slot:content>
        <ul>
          <li>{{ connectedUsers.filter(x => x.type === 'anonymous').length }} Gäste</li>
          <li
            v-for="authedUser in connectedUsers.filter(x => x.type === 'authenticated')"
            :key="authedUser.id"
          >
            {{ authedUser.name }}
          </li>
        </ul>
      </template>
      <b-tag
        rounded
        size="is-medium"
      >
        <b-icon
          icon="account"
          class="mr-1"
        />
        {{ connectedUsers.length }}
      </b-tag>
    </b-tooltip>
  </FeathersVuexFind>
</template>

<script>
export default {
  name: 'ConnectedUsers',
  methods: {
    getConnectedUsers (connections) {
      const anonUsers = connections.filter(x => x.type === 'anonymous')
      const authedUsers = connections.filter(x => x.type === 'authenticated').map(x => x.name)
      const uniqueAuthedUsers = [...new Set(authedUsers)]
      return `${anonUsers.length} Gäste und ${uniqueAuthedUsers.length} angemeldete Nutzer (${uniqueAuthedUsers.join(', ')})`
    }
  }
}
</script>

<style>

</style>
