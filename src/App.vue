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
          <v-list-item-icon>
            <v-icon>{{item.icon}}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{item.title}}</v-list-item-title>
          </v-list-item-content>
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

  data: () => ({
    options: {
      title: "申請マネージャー（PDF専用GUI）",
      authenticate: true,
      skip_greetings: true,
      login_url: `${process.env.VUE_APP_AUTHENTICATION_API_URL}/login`,
      identification_url: `${process.env.VUE_APP_AUTHENTICATION_API_URL}/v2/whoami`,
    },
    nav: [
      {title: '新規作成 / New', to: {name: 'new_application'}, icon: 'mdi-plus'},
      {title: '送信トレイ / Outbox', to: {name: 'application_list', params: {direction: 'submitted'}}, icon: 'mdi-inbox-arrow-up'},
      {title: '受信トレイ / Inbox', to: {name: 'application_list',  params: {direction: 'received'}}, icon: 'mdi-inbox-arrow-down'},
      {title: 'About', to: {name: 'about'}, icon: 'mdi-information-outline'},
    ]
  }),

  methods: {
    get_user(user){
      console.log(user)
    }
  }
};
</script>
