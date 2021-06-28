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
      <v-form @submit.prevent="submit()">
        <v-row>
          <v-col>
            <v-text-field
              label="件名 / Application title"/>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-file-input
              @change="file_changed($event)"
              accept="application/pdf"
              label=".pdf ファイル / .pdf file"/>
          </v-col>

        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              label="メモ / Comment"/>
          </v-col>
        </v-row>

      </v-form>

    </v-card-text>

    <v-card-title
      class="text-h5">
      ② 承認フロー / Approval flow
    </v-card-title>


    <v-card-text>

      <v-row class="align-center">
        <v-col
          v-for="(recipient, i) in recipients"
          :key="`recipient_${i}`">
          <v-card>
            <v-card-text>{{recipient.properties.display_name}}</v-card-text>
          </v-card>
        </v-col>

        <v-col>
          <v-dialog
            v-model="add_recipient_dialog"
            width="800">

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

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  text
                  @click="add_recipient_dialog = false">
                  Cancel
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>




    </v-card-text>

    <v-card-title
      class="text-h5">
      ③ 申請書提出 / Submission
    </v-card-title>

    <v-card-text>
      <v-btn
        color="red lighten-2"
        dark>
        <v-icon>mdi-send</v-icon>
        <span>提出 / Submit</span>

      </v-btn>
    </v-card-text>







  </v-card>
</template>

<script>
import UserPicker from '@moreillon/vue_user_picker'

export default {
  name: 'NewApplication',
  data(){
    return {
      recipients: [],
      add_recipient_dialog: false,

    }
  },

  components: {
    UserPicker,
  },
  methods: {
    submit(){
      console.log('Submit')
    },
    file_changed(event){
      console.log(event)
    },
    add_to_recipients(new_recipient) {
      this.recipients.push(new_recipient)
    },
  }
}
</script>

<style>
.user_picker {
  max-height: 300px;
}
</style>
