<template>
  <v-card>

    <template v-if="application">

      <v-toolbar
        flat>

        <v-toolbar-title>
          {{application.properties.title}}
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn
          icon
          color="#c00000"
          @click="delete_application()">
          <v-icon>mdi-delete</v-icon>
        </v-btn>

        <!-- <v-btn icon>
          <v-icon>mdi-restore</v-icon>
        </v-btn> -->

        <!-- <v-btn icon>
          <v-icon>mdi-close</v-icon>
        </v-btn> -->

      </v-toolbar>

      <v-card-text>
        <v-row>

          <v-col>
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>ID</v-list-item-subtitle>
                  <v-list-item-title>{{application.identity}}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>Memo</v-list-item-subtitle>
                  <v-list-item-title>{{application.properties.form_data.memo || "-"}}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
          </v-col>

          <!-- Approval flow -->
          <v-col>
            <div class="approval_flow" >
              <template
                v-for="(recipient, index) in ordered_recipients" >

                <div
                  v-if="index>0"
                  :key="`flow_arrow_${index}`">
                  <v-icon class="mt-14">mdi-arrow-left</v-icon>
                </div>

                <WebHankoContainer
                  :key="`recipient_${index}`"
                  :recipient="recipient"/>
              </template>
            </div>





          </v-col>
        </v-row>

      </v-card-text>

      <v-card-text>
        <PdfViewer
          :application="application"
          @pdf_stamped="get_application()"/>
      </v-card-text>


    </template>

  </v-card>
</template>

<script>

  import WebHankoContainer from '@/components/web_hanko/WebHankoContainer.vue'


  import PdfViewer from '@/components/PdfViewer.vue'

  export default {
    name: 'Application',

    components: {
      WebHankoContainer,
      PdfViewer,
    },
    data(){
      return {
        application: null,
      }
    },
    mounted(){
      this.get_application()
    },
    methods: {
      get_application(){
        this.application = null
        const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/v2/applications/${this.application_id}`
        this.axios.get(url)
        .then(({data}) => {
          this.application = data
          this.application.properties.form_data = JSON.parse(this.application.properties.form_data)
        })
        .catch((error) => {
          if(error.response) console.error(error.response.data)
          else console.error(error)
        })
      },
      delete_application(){
        if(!confirm("ホンマに？")) return
        const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}`
        this.axios.delete(url)
        .then( () => {
          this.$router.push({name: 'application_list', params: {direction: 'submitted'}})
        })
        .catch((error) => {
          if(error.response) console.error(error.response.data)
          else console.error(error)
        })
      }
    },
    computed: {
      application_id(){
        return this.$route.params.application_id
      },
      ordered_recipients(){
        return this.application.recipients
          .slice()
          .sort((a, b) => a.submission.properties.flow_index - b.submission.properties.flow_index)
      },
      current_recipient(){
        // recipients sorted by flow index apparently
        return this.ordered_recipients.find(recipient => !recipient.approval && !recipient.refusal)
      },


    }
  }
</script>

<style>
.approval_flow {
  /* horizontal layout */
  display: flex;
  justify-content: flex-end;
  /* because wrap reverse */
  align-items: flex-end;
  flex-wrap: wrap-reverse;
}
</style>
