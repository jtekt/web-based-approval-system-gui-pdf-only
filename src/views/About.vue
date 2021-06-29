<template>
  <v-card>
    <v-card-title class="text-h4">PDF Approval manager</v-card-title>
    <v-data-table
      ref="export_table"
      :headers="headers"
      :items="services"/>
  </v-card>
</template>

<script>
import pjson from '@/../package.json'

export default {
  name: 'About',
  data(){
    return {
      version: pjson.version,
      headers: [
        {text: 'Service', value: "name"},
        {text: 'Version', value: "version"},
        {text: 'URL', value: "url"},

      ],
      services: [
        {
          name: 'Employee manager GUI',
          url: window.location.origin,
          version: pjson.version
        },
        {
          name: 'Shinsei manager API',
          url: process.env.VUE_APP_SHINSEI_MANAGER_URL,
          version: null
        },
        {
          name: 'Authentication API',
          url: process.env.VUE_APP_AUTHENTICATION_API_URL,
          version: null
        },
        {
          name: 'Group manager API',
          url: process.env.VUE_APP_GROUP_MANAGER_API_URL,
          version: null
        },
      ],
    }
  },
  mounted () {
    this.get_services_version()
  },
  methods: {

    get_services_version () {
      this.services.forEach((service) => {
        if (service.version) return
        service.version = 'Connecting...'
        this.axios.get(service.url)
          .then(({ data }) => { service.version = data.version })
          .catch(() => { service.version = 'Unable to connect' })
      })
    }
  }
}
</script>
