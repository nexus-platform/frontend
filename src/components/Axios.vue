<template>
  <span v-show="false"></span>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      loading: false,
      requestInfo: {}
    }
  },
  methods: {
    submit(config) {
      this.requestInfo = config
      this.requestInfo.url = `${this.requestInfo.api === 'ea' ? process.env.VUE_APP_EA_API : process.env.VUE_APP_BASE_API}${
        this.requestInfo.url
      }`

      if (!this.requestInfo.headers) {
        this.requestInfo.headers = {}
      }
      if (process.env.NODE_ENV === 'development') {
        if (this.requestInfo.method !== 'form') {
          this.requestInfo.params.XDEBUG_SESSION_START = 'netbeans-xdebug'
        } else {
          this.requestInfo.params.append(
            'XDEBUG_SESSION_START',
            'netbeans-xdebug'
          )
        }
      }
      this.requestInfo.headers['Authorization'] = `Bearer ${
        this.$store.getters.getJWT
      }`

      //this.requestInfo.onUploadProgress = function(progressEvent) {}

      switch (this.requestInfo.method) {
        case 'form':
        case 'post':
          this.post().then(result => {
            this.$emit('finish', { data: result, url: this.requestInfo.url })
          })
          break
        default:
          this.get().then(result => {
            this.$emit('finish', { data: result, url: this.requestInfo.url })
          })
          break
      }
    },
    get() {
      return new Promise((resolve, reject) => {
        axios
          .get(this.requestInfo.url, this.requestInfo/*{
            params: this.requestInfo.params,
            headers: this.requestInfo.headers
          }*/)
          .then(function(response) {
            let result = { code: 200, response: response.data }
            resolve({ result })
          })
          .catch(function(error) {
            let result = { code: 500, response: error }
            resolve({ result })
          })
      })
    },
    post() {
      return new Promise((resolve, reject) => {
        var fullUrl = `${this.requestInfo.url}${
          this.requestInfo.params.XDEBUG_SESSION_START
            ? '?XDEBUG_SESSION_START=netbeans-xdebug'
            : ''
        }`

        axios
          .post(fullUrl, this.requestInfo.params, {
            headers: this.requestInfo.headers
          })
          .then(function(response) {
            let result = { code: 200, response: response.data }
            resolve({ result })
          })
          .catch(function(error) {
            let result = { code: 500, response: error }
            resolve({ result })
          })
      })
    }
  }
}
</script>
