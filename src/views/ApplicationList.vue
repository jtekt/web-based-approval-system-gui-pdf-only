<template>
  <v-card>
    <v-card-title class="text-h4">{{card_title_lookup[direction]}}</v-card-title>

    <v-card-text
      v-for="table in tables[direction]"
      :key="`table_${table.state}`">
      <ApplicationListTable
        :title="table.title"
        :state="table.state"
        :headers="table.headers"
        :direction="direction"/>
    </v-card-text>


  </v-card>
</template>

<script>
  import ApplicationListTable from '@/components/ApplicationListTable.vue'
  export default {
    name: 'ApplicationList',
    components: {
      ApplicationListTable
    },
    props: {
      direction: String,
    },
    data(){
      return {
        card_title_lookup: {
          'submitted' : '送信トレイ / Outbox',
          'received': '受信トレイ / Inbox'
        },
        tables: {
          submitted: [
            {
              title: '承認中 / Pending',
              state: 'pending',
              headers: [
                {text: '日付 / Date', value: "properties.creation_date"},
                {text: '件名 / Title', value: 'properties.title'},
                {text: '%', value: 'progress'},
                {text: '承認者 / Current recipient', value: 'current_recipient.properties.display_name'},
              ],
            },
            {
              title: '却下 / Rejected',
              state: 'rejected',
              headers: [
                {text: '日付 / Date', value: "properties.creation_date"},
                {text: '件名 / Title', value: 'properties.title'},
                {text: '%', value: 'progress'},
                {text: '承認者 / Current recipient', value: 'current_recipient.properties.display_name'},
              ],
            },
            {
              title: '承認完了 / Approved',
              state: 'approved',
              headers: [
                {text: '日付 / Date', value: "properties.creation_date"},
                {text: '件名 / Title', value: 'properties.title'},
              ],
            },
          ],
          received: [
            {
              title: '承認中 / Pending',
              state: 'pending',
              headers: [
                {text: '日付 / Date', value: "properties.creation_date"},
                {text: '件名 / Title', value: 'properties.title'},
                {text: '申請者 / Applicant', value: 'applicant.properties.display_name'},
              ],
            },
            {
              title: '却下 / Rejected',
              state: 'rejected',
              headers: [
                {text: '日付 / Date', value: "properties.creation_date"},
                {text: '件名 / Title', value: 'properties.title'},
                {text: '申請者 / Applicant', value: 'applicant.properties.display_name'},
              ],
            },
            {
              title: '承認完了 / Approved',
              state: 'approved',
              headers: [
                {text: '日付 / Date', value: "properties.creation_date"},
                {text: '件名 / Title', value: 'properties.title'},
                {text: '申請者 / Applicant', value: 'applicant.properties.display_name'},
              ],
            },
          ]
        }

      }
    },
  }
</script>
