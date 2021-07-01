<template>
  <div class="web_hanko_container">

    <!-- recipient name -->
    <a
      :href="user_profile_url"
      class="hanko_container_header">
      {{ recipient.properties.last_name
        || recipient.properties.family_name_kanji
        || recipient.family_name}}
    </a>

    <div class="hanko_area">

      <!-- TODO: provide alternatives for the name! -->
      <WebHanko
        v-if="recipient.approval"
        :name="recipient.properties.last_name"
        :approvalId="recipient.approval.identity"
        :date="recipient.approval.properties.date"/>



      <v-icon
        color="#c00000"
        x-large
        v-else-if="recipient.refusal">mdi-close-circle</v-icon>

      <EmailButton
        v-else-if="recipient_is_current_recipient"
        :user="recipient"
        @send_email="$emit('send_email')" />




    </div>


  </div>

</template>

<script>
import WebHanko from './WebHanko.vue'
import EmailButton from '@/components/EmailButton.vue'

export default {
  name: 'WebHankoContainer',
  components: {
    WebHanko,
    EmailButton,
  },
  props: {
    recipient: { type: Object, required: true },
    current_recipient: Object,
  },
  data () {
    return {
      approval_status: undefined
    }
  },
  methods: {

  },
  computed: {
    current_user_id() {
      return this.$store.state.current_user.identity
    },
    show_toolbox () {
      // If the user is a recipient that has not approved or rejected the application and also is next recipient
      return this.user_is_recipient &&
        !this.approval &&
        !this.rejection &&
        this.is_current_recipient
    },
    recipient_is_current_recipient(){
      if(!this.current_recipient) return false
      return this.recipient.identity === this.current_recipient.identity
    },
    user_profile_url () {
      return `${process.env.VUE_APP_EMPLOYEE_MANAGER_FRONT_URL}/users/${this.recipient.identity}`
    },
    user_is_applicant () {
      return this.current_user_id === this.applicant.identity
    },
    user_is_recipient () {
      return this.current_user_id === this.recipient.identity
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.web_hanko_container {

  background-color: white;

  /* width must be set otherwise empy container shrinks */

  width: 80px;
  /* height cannot be set here */

  border: 1px solid #666666;
  border-radius: 5px;

  margin: 5px;

}

.web_hanko_container > * {
  padding: 5px;

}

.hanko_container_header {
  display: block;
  color: currentColor;
  text-decoration: none;
  text-align: center;
  font-size: 80%;

  margin: 0 5px; /* to prevent border from going all the way accross */
  border-bottom: 1px solid #666666;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  cursor: pointer;
  transition: color 0.25s;
}

.hanko_container_header:hover {
  color: #c00000;
}

.hanko_area{
  /* Actually used! */
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.toolbox{
  margin: 0 5px; /* to prevent border from going all the way accross */
  border-top: 1px solid #666666;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: stretch;
}


.email_button_content{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

</style>
