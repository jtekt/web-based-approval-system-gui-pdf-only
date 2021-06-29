<template>
  <div class="comments">
    <v-subheader>コメント / Comments</v-subheader>
    <template v-for="recipient in ordered_recipients">
      <v-list-item
        two-line
        :key="`comment_${recipient.identity}`"
        v-if="recipient.approval || recipient.refusal">

        <v-list-item-content>
          <v-list-item-subtitle>{{recipient.properties.display_name}}</v-list-item-subtitle>
          <v-list-item-title>

            <span>{{get_recipient_comment(recipient) || 'コメント無し / No comment'}}</span>

            <v-btn
              v-if="recipient_is_user(recipient)"
              @click="update_comment(recipient)"
              icon>
              <v-icon>mdi-pencil</v-icon>
            </v-btn>

          </v-list-item-title>
        </v-list-item-content>

      </v-list-item>

    </template>

  </div>
</template>

<script>

export default {
  name: 'ApprovalComments',
  props: {
    application: Object
  },
  methods: {

    update_comment (recipient) {

      const decision_id = this.approval_or_rejection_of_recipient(recipient).identity

      if (!this.recipient_is_user(recipient)) return
      const comment = prompt('コメント / Comment')
      if (comment === null) return
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/decisions/${decision_id}/comment`
      this.axios.put(url, { comment })
      .then(() => {
        this.$emit('comment_updated')
      })
      .catch(error => {
        alert('Edit failed')
        console.error(error)
      })
    },
    get_recipient_comment(recipient){
      const decision = recipient.approval || recipient.refusal
      if(!decision) return
      console.log(decision)
      return decision.properties.comment

    },

    recipient_of_submission (submission) {
      if (!submission) return null
      return this.recipients.find(recipient => recipient.identity === submission.end)
    },

    approval_or_rejection_of_recipient (recipient) {
      return recipient.approval || recipient.refusal
    },
    recipient_is_user (recipient) {
      const current_user = this.$store.state.current_user
      return recipient.identity === current_user.identity
    }

  },
  computed: {
    ordered_recipients(){
      return this.application.recipients
        .slice()
        .sort((a, b) => b.submission.properties.flow_index - a.submission.properties.flow_index)
    },
    submissions_with_comment () {
      return this.submissions.filter(submission => {
        const recipient = this.recipient_of_submission(submission)
        const approval_or_rejection = this.approval_or_rejection_of_recipient(recipient)
        if (!approval_or_rejection) return false
        return approval_or_rejection.properties.comment
      })
    }

  }

}
</script>

<style scoped>

.comments_header {
  font-weight: bold;
}
.rejection_reasons{
  margin: 15px;
}

.rejection_reasons table {
  margin-top: 0.5em;
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  text-align: left;
}
.rejection_reasons table tr:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}

.rejection_reasons table td {
  padding: 0.25em 0;
}

.rejection_reasons table .refuser_name {
  width: 25%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

}

</style>
