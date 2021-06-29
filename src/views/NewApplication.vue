<template>
  <v-card>
    <v-card-title
      class="text-h4">
      新規作成
    </v-card-title>

    <v-card-title
      class="text-h5">
      ① 申請内容 / Application content
    </v-card-title>

    <v-card-text>
      <v-row>
        <v-col>
          <v-text-field
            v-model="title"
            label="件名 / Application title"/>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-file-input
            v-if="!form_data[0].value"
            @change="file_upload($event)"
            accept="application/pdf"
            label=".pdf ファイル / .pdf file"/>
          <span v-else>Upload OK</span>
        </v-col>

      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="form_data[1].value"
            label="メモ / Comment"/>
        </v-col>
      </v-row>


    </v-card-text>

    <v-row class="align-center">
      <v-col cols="6">
        <v-card-title
          class="text-h5">
          ② 承認フロー / Approval flow
        </v-card-title>
      </v-col>
      <v-spacer/>
      <v-col>
        <v-dialog
          v-model="add_recipient_dialog"
          width="900">

          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="red lighten-2"
              dark
              v-bind="attrs"
              v-on="on">
              <v-icon>mdi-account-plus</v-icon>
              <span>承認者追加</span>

            </v-btn>
          </template>


          <v-card>
            <v-card-title class="text-h5">
              Add user to approval flow
            </v-card-title>

            <v-card-text>
              <UserPicker
                class="user_picker"
                v-on:selection="add_to_recipients($event)"/>
            </v-card-text>

            <v-card-text>
              <NewApplicationApprovalFlow
                :recipients="recipients"/>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                text
                @click="add_recipient_dialog = false">
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>

    </v-row>


    <NewApplicationApprovalFlow
      :recipients="recipients"/>

    <v-card-title
      class="text-h5">
      ③ 申請書提出 / Submission
    </v-card-title>

    <v-card-text>
      <v-btn
        color="red lighten-2"
        dark
        @click="submit()">
        <v-icon>mdi-send</v-icon>
        <span>提出 / Submit</span>

      </v-btn>
    </v-card-text>







  </v-card>
</template>

<script>
import UserPicker from '@moreillon/vue_user_picker'
import NewApplicationApprovalFlow from '@/components/NewApplicationApprovalFlow.vue'

export default {
  name: 'NewApplication',
  data(){
    return {
      title: '',
      form_data: [
        {type: 'file', label: 'file', value: null},
        {type: 'text', label: 'memo', value: ''},
      ],
      recipients: [],
      add_recipient_dialog: false,
      file_uploading: false,


    }
  },

  components: {
    UserPicker,
    NewApplicationApprovalFlow,
  },
  mounted () {
    if (this.$route.query.copy_of) this.recreate_application_content()
  },
  methods: {
    submit(){

      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications`

      const body = {
        title: this.title,
        type: 'PDF',
        form_data: this.form_data,
        recipients_ids: this.recipients.map( recipient => recipient.identity),
      }


      this.axios.post(url, body)
      .then(({ data }) => {
        this.$router.push({ name: 'application', params: { application_id: data.identity } })
      })
      .catch(error => {
        console.error(error)
        alert(error)
        this.submitting = false
      })
    },
    file_upload(file){
      this.file_uploading = true
      let formData = new FormData()
      formData.append('file_to_upload', file)
      this.axios.post(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(({data}) => {
        this.form_data[0].value = data
       })
      .catch(error => alert(error.response.data))
      .finally(() => { this.file_uploading = false })
    },
    add_to_recipients(new_recipient) {
      this.recipients.push(new_recipient)
    },
    delete_recipient(recipient_index) {
      this.recipients.splice(recipient_index,1)
    },
    recreate_application_content () {
      // This function is called when the application is a dubplicate of an existing one

      // NOTE: NO CONFIDENTIALITY FOR NOW!

      const application_id = this.$route.query.copy_of
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/v2/applications/${application_id}`
      this.axios.get(url)
        .then(({data}) => {


          const original_application = data

          // Set application details back
          this.title = original_application.properties.title
          this.confidential = original_application.properties.private

          original_application.properties.form_data = JSON.parse(original_application.properties.form_data)
          this.form_data = original_application.properties.form_data


          // Recreate flow
          this.recipients = original_application.recipients.sort((a, b) => {
            return a.submission.properties.flow_index - b.submission.properties.flow_index
          })

        })
        .catch((error) => {
          console.error(error)
        })
    },
  }
}
</script>

<style>
.user_picker {
  max-height: 300px;
}
</style>
