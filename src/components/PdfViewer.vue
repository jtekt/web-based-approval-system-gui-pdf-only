<template>

  <v-card>
    <v-toolbar
      flat>

      <v-btn
        @click="previous_page()"
        :disabled="page_number <= 0"
        icon>
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-menu
        open-on-hover
        offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            text
            v-bind="attrs"
            v-on="on">
            {{page_number +1}}/{{page_count}}
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="page in Array.from(Array(page_count).keys())"
            :key="page"
            @click="page_number = page">
            <v-list-item-title>{{ page+1 }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        @click="next_page()"
        :disabled="(page_number+1) >= page_count"
        icon>
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>

      <v-spacer></v-spacer>

      <v-menu
        v-if="current_recipient_is_current_user"
        :close-on-content-click="false"
        open-on-hover
        offset-y
        z-index="3">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="mr-2"
            v-bind="attrs"
            v-on="on">
            ハンコサイズ / Stamp size
          </v-btn>
        </template>

        <v-card>
          <v-card-text>
            <v-slider
              v-model.number="hanko_scale"
              min="0.01"
              max="0.1"
              step="0.005"/>
          </v-card-text>
        </v-card>

      </v-menu>

      <v-btn
        v-if="current_recipient_is_current_user"
        dark
        class="mr-2"
        color="#c00000"
        @click="$emit('reject')">
        <v-icon>mdi-close</v-icon>
        <span>却下 / Reject</span>
      </v-btn>


      <v-btn @click="download_pdf()">
        <v-icon>mdi-download</v-icon>
        <span>ダウンロード / Download</span>
      </v-btn>


    </v-toolbar>
    <v-divider></v-divider>

    <template v-if="shown_pdf">

      <div
        class="pdf_container"
        ref="pdf_container"
        @click="pdf_clicked($event)">

        <pdf
          :page="page_number+1"
          :src="shown_pdf"
          @num-pages="page_count_event"/>

        <!-- Used to react to mouse motion over the PDF -->
        <!-- Not sure why it doesn't work when using events on pdf container -->
        <div
          class="new_hanko_overlay"
          @mouseleave="hide_new_hanko()"
          @mousemove="update_new_hanko_position($event)"/>

        <!-- Indicator of where the hanko will be set -->
        <div
          v-if="current_recipient_is_current_user"
          :style="new_hanko.style"
          class="new_hanko"/>

      </div>

    </template>

    <div
      class="loader_wrapper"
      v-if="!shown_pdf && !load_error">
      Loading PDF
    </div>

    <div
      v-if="load_error"
      class="error_message"
      v-html="load_error">
    </div>
  </v-card>


</template>

<script>
import { PDFDocument } from 'pdf-lib'
import pdf from 'vue-pdf'

// used to turn Hankos into PNG so as to include them in the pdf
import canvg from 'canvg'


export default {
  name: 'PdfViewer',
  components: {
    pdf
  },
  props: {
    application: Object,
  },

  data () {
    return {
      load_error: null,
      loading: false,

      page_number: 0,
      page_count: 1,

      pdfDoc: null,
      shown_pdf: null,

      // Related to hankos
      new_hanko: {
        style: {
          visibility: 'none'
        }
      },

      hanko_scale: 0.034

    }
  },
  mounted () {
    if (this.file_id) {
      this.view_pdf(this.file_id)
    }
  },
  watch: {
    file_id () {
      this.view_pdf(this.file_id)
    },
    approvals () {
      this.view_pdf(this.file_id)
    }
  },
  methods: {
    page_count_event (page_count) {
      if (page_count) this.page_count = page_count
    },
    next_page () {
      if (this.page_number + 1 < this.page_count) this.page_number++
    },
    previous_page () {
      if (this.page_number > 0) this.page_number--
    },
    view_pdf (file_id) {
      // Check if IE
      if (!!window.MSInputMethodContext && !!document.documentMode) {
        this.load_error = 'Internet Explorer is to old for this feature'
        alert('Internet Explorerのユーザーはこの機能に値しません、今の時代のブラウザを使ってください。')
        return
      }

      // reset the file
      this.shown_pdf = null

      // Reset page number
      this.page_number = 0

      // Load the file as an arrayBuffer
      // Note: could be done using axios
      const file_url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}/files/${file_id}`
      const axios_options = { responseType: 'arraybuffer' }

      this.axios.get(file_url, axios_options)
      .then(({data}) => { this.load_pdf(data) })
      .catch((error) => {
        if(error.response) console.error(error.response.data)
        else console.error(error)
      })

    },
    async load_pdf (buffer) {
      this.load_error = null
      try {
        this.pdfDoc = await PDFDocument.load(buffer)
        //this.shown_pdf = await this.pdfDoc.save()
        this.load_pdf_hankos()
      } catch (e) {
        this.load_error = `この機能は.pdfのファイルしかつかえません<br>This feature only supports .pdf files`
      }
    },


    async pdf_clicked (event) {
      // Draw a hanko where the user has clicked if the user has approved the application
      if(!this.current_recipient_is_current_user) return
      if (!confirm(`Apply Hanko here?`)) return

      const pages = this.pdfDoc.getPages()
      const page = pages[this.page_number]
      const { width, height } = page.getSize()

      const wrapper_width = this.$refs.pdf_container.offsetWidth
      const click_x = event.offsetX || event.layerX
      const position_x = width * (click_x / wrapper_width)

      const wrapper_height = this.$refs.pdf_container.offsetHeight
      const click_y = event.offsetY || event.layerY
      const position_y = height - (height * (click_y / wrapper_height))

      const attachment_hankos = [{
        file_id: this.file_id,
        page_number: this.page_number,
        position: {
          x: position_x,
          y: position_y
        },
        scale: this.hanko_scale
      }]

      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity}/approve`

      this.axios.post(url, {attachment_hankos})
      .then(() => {
        this.$emit('pdf_stamped')
      })
      .catch((error) => {
        console.error(error)
        alert(`Error approving application`)
      })


    },

    refresh_pdf () {
      this.shown_pdf = null
      this.view_pdf(this.file_id)
    },

    update_new_hanko_position (event) {
      const wrapper_width = this.$refs.pdf_container.offsetWidth
      const wrapper_height = this.$refs.pdf_container.offsetHeight
      const scaling = 1.735 * this.hanko_scale

      this.new_hanko.style = {
        left: `calc(${event.offsetX}px - 0.5 * ${this.new_hanko.style.width})`,
        top: `calc(${event.offsetY}px - 0.5 * ${this.new_hanko.style.height})`,
        width: `${scaling * wrapper_width}px`,
        height: `${scaling * wrapper_height}px`
      }
    },

    hide_new_hanko () {
      this.new_hanko.style = { visibility: 'none' }
    },

    svg_to_png_url (svg) {
      return new Promise( (resolve) => {

        const serializer = new XMLSerializer()
        const SVG_sata = serializer.serializeToString(svg)

        const canvas = document.createElement('canvas')
        canvas.width = 1000
        canvas.height = 1500

        const ctx = canvas.getContext('2d');



        let v = canvg.fromString(ctx, SVG_sata);
        v.start();

        const png_URL = canvas
          .toDataURL('image/png')
          .replace('image/png', 'image/octet-stream')

        resolve(png_URL)

      })
    },

    get_hanko_blob_url_from_id(hanko_dom_id){
      const hanko_svg = document.getElementById(hanko_dom_id)

      const serializer = new XMLSerializer()
      const SVG_sata = serializer.serializeToString(hanko_svg)

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = 1000
      canvas.height = 1500

      canvg.fromString(context, SVG_sata).start()

      return canvas.toDataURL("image/png");
    },

    load_pdf_hankos () {

      const approval_promises = []

      this.application.recipients
      .filter(recipient => !!recipient.approval)
      .map(recipient => recipient.approval)
      .forEach(approval => {

        const promise = new Promise( (resolve, reject) => {

          if (!approval.properties.attachment_hankos) return

          if (typeof approval.properties.attachment_hankos === 'string') {
            approval.properties.attachment_hankos = JSON.parse(approval.properties.attachment_hankos)
          }

          const png_url = this.get_hanko_blob_url_from_id(`hanko_${approval.identity}`)

          const axios_options = { responseType: 'arraybuffer' }

          this.axios.get(png_url, axios_options)
          .then( ({data}) => this.pdfDoc.embedPng(data) )
          .then( (pngImage) => {
            // The PNG is now awvailable to display at every hanko location

            const pages = this.pdfDoc.getPages()

            approval.properties.attachment_hankos.forEach( hanko => {

              // Skip if hanko is not part of the current file
              if (hanko.file_id !== this.file_id) return

              const page = pages[hanko.page_number]

              // Currently, some hankos have no scale set so allow the scale to be modified using the slider in that case
              const pngDims = pngImage.scale(hanko.scale || this.hanko_scale)

              const drawing_parameters = {
                x: hanko.position.x - 0.5 * pngDims.width,
                y: hanko.position.y - 0.5 * pngDims.height,
                width: pngDims.width,
                height: pngDims.height
              }

              // This seems to be a synchronous function
              page.drawImage(pngImage, drawing_parameters)
            })

            resolve()

          })
          .catch(reject)
        })

        approval_promises.push(promise)
      })

      // render .pdf once all hankos of all approvals have been drawn
      Promise.all(approval_promises)
      .then(async () => {
        this.shown_pdf = await this.pdfDoc.save()
      })
      .catch(error => {
        console.error(error)
      })
    },

    download_pdf () {
      const pdf_blob = new Blob([this.shown_pdf], { type: 'application/pdf' })

      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(pdf_blob, `${this.selected_file_id}.pdf`)
      }
      else {
        const elem = window.document.createElement('a')
        elem.href = window.URL.createObjectURL(pdf_blob)
        elem.download = `${this.file_id}.pdf`
        document.body.appendChild(elem)
        elem.click()
        document.body.removeChild(elem)
      }
    }

  },
  computed: {
    file_id(){
      const found_field = this.application.properties.form_data.find(field => field.type === "file")
      return found_field.value
    },
    application_id(){
      return this.application.identity
    },
    current_recipient(){
      // recipients sorted by flow index apparently
      return this.application.recipients
      .slice()
      .sort((a, b) => a.submission.properties.flow_index - b.submission.properties.flow_index)
      .find(recipient => !recipient.approval && !recipient.refusal)
    },
    current_recipient_is_current_user(){
      if(!this.current_recipient) return false
      return this.current_recipient.identity === this.$store.state.current_user.identity
    }

  }
}
</script>

<style scoped>

.pdf_container {
  position: relative;
}

.new_hanko {
  position: absolute;

  z-index: 2;
  border: 3px solid #c00000;
  border-radius: 10px;
}

.new_hanko_overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  cursor: pointer;
}


.loader_wrapper {
  text-align: center;
}

.hanko_size_wrapper {
  display: flex;
  align-items: center;
}

.hanko_size_wrapper label {
  margin-right: 0.5em;
}

</style>
