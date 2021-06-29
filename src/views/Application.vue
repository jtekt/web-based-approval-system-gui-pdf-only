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

        <v-btn
          icon
          @click="$router.push({ name: 'new_application', query: { copy_of: application.identity } })">
          <v-icon>mdi-restore</v-icon>
        </v-btn>


      </v-toolbar>
      <v-divider></v-divider>

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
                <v-list-item-subtitle>日付 / Date</v-list-item-subtitle>
                <v-list-item-title>{{format_date_neo4j(application.properties.creation_date)}}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>申請者 / Applicant</v-list-item-subtitle>
                <v-list-item-title>
                  <span>{{application.applicant.properties.display_name}}</span>
                  <v-btn
                    v-if="!current_recipient"
                    @click="send_email_to_applicant()"
                    icon>
                    <v-icon>mdi-email</v-icon>
                  </v-btn>

                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>申請者のコメント / Applicant comment</v-list-item-subtitle>
                <v-list-item-title>{{application.properties.form_data[1].value || "-"}}</v-list-item-title>
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
                  <v-icon class="mt-16">mdi-arrow-left</v-icon>
                </div>

                <WebHankoContainer
                  :key="`recipient_${index}`"
                  :recipient="recipient"
                  :current_recipient="current_recipient"
                  @send_email="send_email_to_recipient(recipient)"
                  @reject="reject_application()"/>
              </template>
            </div>

            <RecipientComments
              :application="application"
              @comment_updated="get_application()"/>



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
  import RecipientComments from '@/components/RecipientComments.vue'

  export default {
    name: 'Application',

    components: {
      WebHankoContainer,
      PdfViewer,
      RecipientComments,
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
      reject_application(){
        const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity}/reject`

        this.axios.post(url)
        .then(() => {
          this.get_application()
        })
        .catch((error) => {
          console.error(error)
          alert(`Error approving application`)
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
      },
      format_date_neo4j(date){
        return `${date.year}/${date.month}/${date.day}`
      },

      send_email_to_recipient (recipient) {
        // Weird formatting because preserves indentation
        window.location.href = `
  mailto:${recipient.properties.email_address}
  ?subject=[申請マネージャ] ${this.application.properties.type}
  &body=${recipient.properties.display_name} 様 %0D%0A
  %0D%0A
  申請マネージャーの通知メールです。 %0D%0A
  %0D%0A
  申請を提出しました。 %0D%0A
  %0D%0A
  申請者: ${this.application.applicant.properties.display_name} %0D%0A
  タイプ: ${this.application.properties.type} %0D%0A
  タイトル: ${this.application.properties.title} %0D%0A
  提出先URL: ${window.location.origin}/applications/${this.application.identity} %0D%0A
  %0D%0A
  ※IEでは動作しません。Edge (Chromium)/Firefox/GoogleChromeをご使用ください。　%0D%0A
  ※詳しくは ${window.location.origin}/info%0D%0A
  %0D%0A
  確認お願いします。%0D%0A
  %0D%0A`
      },
      send_email_to_applicant () {
        // Weird formatting because preserves indentation
        // TODO: Stop relying on name_kanji
        window.location.href = `
  mailto:${this.application.applicant.properties.email_address}
  ?subject=[申請マネージャ] ${this.application.properties.type}
  &body=${this.application.applicant.properties.display_name} 様 %0D%0A
  %0D%0A
  申請マネージャーの通知メールです。 %0D%0A
  %0D%0A
  タイプ: ${this.application.properties.type} %0D%0A
  タイトル: ${this.application.properties.title} %0D%0A
  提出先URL: ${window.location.origin}/applications/${this.application.identity} %0D%0A
  %0D%0A
  ※IEでは動作しません。Edge (Chromium)/Firefox/GoogleChromeをご使用ください。　%0D%0A
  ※詳しくは ${window.location.origin}/info%0D%0A
  %0D%0A
  確認お願いします。%0D%0A
  %0D%0A
          `
      },
    },
    computed: {
      application_id(){
        return this.$route.params.application_id
      },
      ordered_recipients(){
        return this.application.recipients
          .slice()
          .sort((a, b) => b.submission.properties.flow_index - a.submission.properties.flow_index)
      },
      current_recipient(){
        // recipients sorted by flow index apparently
        if(this.application.recipients.find(recipient => recipient.refusal)) return null
        return this.application.recipients
        .slice()
        .sort((a, b) => a.submission.properties.flow_index - b.submission.properties.flow_index)
        .find(recipient => !recipient.approval && !recipient.refusal)
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

.comments{
  margin-top: 3em;
}
</style>
