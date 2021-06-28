<template>
  <v-card>
    <v-card-title>Applications</v-card-title>

    <v-card-text>
      <v-data-table
        :items="applications"
        :headers="headers"
        @click:row="row_clicked($event)">
      </v-data-table>
    </v-card-text>


  </v-card>
</template>

<script>

  export default {
    name: 'ApplicationList',
    data(){
      return {
        applications: [],
        headers: [
          {text: 'ID', value: 'identity'},
          {text: 'Title', value: 'properties.title'},
        ]
      }
    },

    components: {
    },
    mounted(){
      this.get_applications()
    },
    methods: {
      get_applications(){
        const direction = 'submitted'
        const state = 'pending'
        const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/v2/applications/${direction}/${state}`
        this.axios.get(url, {
          params: {}
        })
        .then( ({data}) => {
          this.applications = data
        })
        .catch((error) => {
          console.error(error)
        })
      },
      row_clicked(application){
        this.$router.push({name: 'application', params: {application_id: application.identity}})
      }

    }
  }
</script>
