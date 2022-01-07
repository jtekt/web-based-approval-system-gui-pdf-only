<template>
  <AppTemplate
    :options="options"
    @user="$store.commit('set_current_user', $event)">

    <template v-slot:nav>
      <v-list
        dense
        nav >
        <v-list-item
          v-for="(item, index) in nav"
          :key="`nav_item_${index}`"
          :to="item.to"
          exact>

          <v-badge
            inline
            v-if="item.count"
            :content="item.count"
            color="#c00000">
            <v-list-item-icon>
              <v-icon>{{item.icon}}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{item.title}}</v-list-item-title>
            </v-list-item-content>
          </v-badge>

          <template v-else>
            <v-list-item-icon>
              <v-icon>{{item.icon}}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{item.title}}</v-list-item-title>
            </v-list-item-content>
          </template>



        </v-list-item>
      </v-list>
    </template>

  </AppTemplate>
</template>

<script>
import AppTemplate from '@moreillon/vue_application_template_vuetify'
export default {
  name: 'App',

  components: {
    AppTemplate
  },


  data(){
    return {
      options: {
        title: "電子捺印システム",
        skip_greetings: process.env.NODE_ENV === 'development',
        login_url: `${process.env.VUE_APP_EMPLOYEE_MANAGER_API_URL}/v2/auth/login`,
        identification_url: `${process.env.VUE_APP_EMPLOYEE_MANAGER_API_URL}/v2/users/self`,
        profile_url: `${process.env.VUE_APP_EMPLOYEE_MANAGER_FRONT_URL}/employees/self`,
        password_reset_url: `${process.env.VUE_APP_EMPLOYEE_MANAGER_FRONT_URL}/password_reset`,
        homepage_url: process.env.VUE_APP_HOMEPAGE_URL,
        main_class: 'grey lighten-4',
        footer_color: 'grey lighten-4',
      },

    }
  },
  computed: {
    nav(){
      return [
        {title: '新規作成 / New', to: {name: 'new_application'}, icon: 'mdi-plus'},
        {title: '送信トレイ / Outbox', to: {name: 'submitted_applications'}, icon: 'mdi-inbox-arrow-up'},
        {title: '受信トレイ / Inbox', to: {name: 'received_applications'}, icon: 'mdi-inbox-arrow-down', count: this.$store.state.received_pending_application_count},
        {title: 'アプリについて / About', to: {name: 'about'}, icon: 'mdi-information-outline'},
      ]
    }
  }

}
</script>
