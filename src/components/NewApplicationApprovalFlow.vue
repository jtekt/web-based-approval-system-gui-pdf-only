<template>
  <div class="approval_flow">

    <!-- using v-bind:list instead of v-model because array passed as prop -->
    <draggable
      class="actual_approval_flow"
      :list="recipients"
      v-if="recipients.length > 0">

      <!--Need to have arrow and recipient in the same div because of draggable -->
      <div
        class="flow_item"
        v-for="(recipient, index) in recipients"
        v-bind:key="`flow_member_${index}`">

        <v-icon
          class="mx-2"
          v-if="index>0">
          mdi-arrow-right
        </v-icon>

        <!-- the actual recipient -->
        <v-card
          width="200px">

          <v-toolbar flat>
            <v-toolbar-title>
              {{recipient.properties.display_name
              || recipient.properties.name_kanji
              || recipient.properties.full_name}}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
              color="#c00000"
              icon
              @click="delete_recipient(index)">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>

          <!-- <v-card-text
            v-if="recipient.properties.role">
            ({{recipient.properties.role}})
          </v-card-text> -->

        </v-card>
      </div>


    </draggable>

    <p v-else class="error_message">承認者が選ばれていません　/　No recipient selected</p>

  </div>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: 'NewApplicationApprovalFlow',
  props: {
    recipients: Array
  },
  components: {
    draggable
  },
  methods: {
    delete_recipient(recipient_index){
      this.recipients.splice(recipient_index,1)
      //this.$emit('deleteRecipient',index)
    }



  },
  computed: {


  }

}
</script>

<style scoped>

.actual_approval_flow {
  display: flex;
  flex-wrap: wrap;
}

.flow_item{
  display: flex;
  align-items: center;
  margin-top: 1em;
}

.arrow {
  font-size: 150%;
}

</style>
