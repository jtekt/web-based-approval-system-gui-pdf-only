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

      <!-- probably need date of rejection as well as motive -->
      <Rejection
        v-else-if="recipient.rejection"/>

      <v-btn
        icon
        v-else-if="recipient_is_current_recipient"
        @click="send_email()">
        <v-icon>mdi-email</v-icon>
      </v-btn>

    </div>


  </div>

</template>

<script>
import WebHanko from './WebHanko.vue'
import Rejection from './Rejection.vue'

export default {
  name: 'WebHankoContainer',
  components: {
    WebHanko,
    Rejection
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
    send_email () {
      this.$emit('send_email', this.recipient)
    }
  },
  computed: {
    current_user_id() {
      return this.$store.state.current_user
    },
    show_toolbox () {
      // If the user is a recipient that has not approved or rejected the application and also is next recipient
      return this.user_is_recipient &&
        !this.approval &&
        !this.rejection &&
        this.is_current_recipient
    },
    recipient_is_current_recipient(){
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

.toolbox .approval_control {
  flex-grow: 1;

  font-size: 120%;
  padding: 2px;

  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;

  border-radius: 5px;

  transition: color 0.25s, background-color 0.25s;
}

.approve_button{
  color: #2b8f30aa;
}

.disapprove_button, .cancel_button{
  color: #c00000;
}
.approve_button:hover{
  background-color: #2b8f30;
  color: white;
}

.disapprove_button:hover, .cancel_button:hover{
  background-color: #c00000;
  color: white;
}

</style>
