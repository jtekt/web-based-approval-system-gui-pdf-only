<template>
  <v-card>
    <template v-if="application">

      <v-toolbar
        flat>

        <v-toolbar-title>
          {{application.properties.title}}
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-dialog
          v-model="help_dialog"
          width="800">

          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="mr-2"
              v-bind="attrs"
              v-on="on">
              <v-icon>mdi-information</v-icon>
              <span>Help</span>

            </v-btn>
          </template>


          <v-card>
            <v-card-title>Help</v-card-title>

            <v-card-subtitle class="mt-4">機能</v-card-subtitle>
            <v-card-text>添付のPDFに捺印（サイズ変更も可能）が可能です。</v-card-text>

            <v-card-subtitle>回付手順</v-card-subtitle>
            <v-card-text>
              <v-list dense>
                <v-list-item>
                  <v-list-item-content>
                    １．ページ下部に表示されているPDF上の任意の場所に捺印します。（サイズ変更可能）
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    ２．メール作成ボタンを押すと、自動で次の回付者へメールが作成されます。
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    ３．作成されたメール（Outlook）をご自身で送信して下さい。
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    ４．以上で回付作業は終了です。ブラウザの×のボタンで閉じて下さい。
                  </v-list-item-content>
                </v-list-item>
              </v-list>

            </v-card-text>

            <v-card-subtitle>捺印済みファイルのダウンロード手順</v-card-subtitle>
            <v-card-text>ページに表示されているPDF上部にあるダウンロードから捺印済みのファイルをダウンロードします。</v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="#c00000"
                text
                @click="help_dialog = false">
                Close
              </v-btn>
            </v-card-actions>




          </v-card>
        </v-dialog>


        <v-btn
          v-if="show_email_button"
          class="mr-2"
          @click="email_button_clicked()">
          <v-icon>mdi-email</v-icon>
          <span>メール作成 / Send email</span>
        </v-btn>




        <v-btn
          class="mr-2"
          @click="$router.push({ name: 'new_application', query: { copy_of: application.identity } })">
          <v-icon>mdi-restore</v-icon>
          <span>再申請 / Re-submit</span>
        </v-btn>

        <!-- <v-btn
          dark
          class="mr-2"
          color="#c00000"
          @click="reject_application()">
          <v-icon>mdi-close</v-icon>
          <span>却下 / Reject</span>
        </v-btn> -->

        <v-btn
          dark
          class="mr-2"
          color="#c00000"
          @click="delete_application()">
          <v-icon>mdi-delete</v-icon>
          <span>申請削除 / Delete</span>
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
          @pdf_stamped="get_application()"
          @reject="reject_application()"/>
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
        help_dialog: false,
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
          this.$router.push({name: 'submitted_applications'})
        })
        .catch((error) => {
          if(error.response) console.error(error.response.data)
          else console.error(error)
        })
      },
      format_date_neo4j(date){
        return `${date.year}/${date.month}/${date.day}`
      },
      email_button_clicked(){
        if(this.current_recipient) this.send_email_to_recipient(this.current_recipient)
        else this.send_email_to_recipient()
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
      user_as_recipient(){
        const user =  this.$store.state.current_user
        return this.application.recipients.find(recipient => recipient.identity === user.identity)
      },
      show_email_button(){

        // This seems overly complicated

        // If last person in flow and no current recipient (email to recipient)
        // If user is applicant and current recipient exists
        // User is recipient and current recipient is one flow index above user

        const ordered_recipients = this.application.recipients
        .slice()
        .sort((a, b) => a.submission.properties.flow_index - b.submission.properties.flow_index)
        const last_recipient = ordered_recipients[this.application.recipients.length-1]

        const user_as_recipient = this.user_as_recipient
        let user_is_previous_recipient = false
        if(user_as_recipient && this.current_recipient) {
          if(user_as_recipient.submission.properties.flow_index === this.current_recipient.submission.properties.flow_index -1) {
            user_is_previous_recipient = true
          }
        }

        const user_is_last_recipient = last_recipient.identity === this.$store.state.current_user.identity
        const user_is_applicant = this.application.applicant.identity === this.$store.state.current_user.identity

        return (user_is_last_recipient && !this.current_recipient)
          || (user_is_applicant && !!this.current_recipient)
          || user_is_previous_recipient
      }


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
