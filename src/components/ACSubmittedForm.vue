<template>
  <v-container class="animated fadeIn">
    <v-layout row wrap>
      <v-flex md10 offset-md1>
        
        <v-form ref="acForm">
          <v-layout row wrap>
            <v-flex sm12>
              <v-card class="animated fadeIn">
                <v-tabs
                  color="blue-grey darken-3"
                  v-model="active"
                  centered
                  icons-and-text
                  dark
                  slider-color="yellow"
                >
                  <v-tab
                    v-for="(item, i) in items"
                    :key="i + 1"
                    ripple
                  >
                    <span class="hidden-xs-only non-uppercase">{{item.title}}</span>
                    <span class="hidden-sm-and-up">{{i + 1}}</span>
                    <v-tooltip v-if="tabComplete(i) === 2" top color="success">
                      <v-icon slot="activator" color="success">check_circle</v-icon>
                      <span>No empty fields</span>
                    </v-tooltip>
                    <v-tooltip v-else-if="tabComplete(i) === 1" top color="warning">
                      <v-icon slot="activator" color="warning">warning</v-icon>
                      <span>{{missingFields(i)}} empty field(s)</span>
                    </v-tooltip>
                    <v-tooltip v-else top color="error">
                      <v-icon slot="activator" color="error">warning</v-icon>
                      <span>{{missingFields(i)}} empty field(s)</span>
                    </v-tooltip>
                  </v-tab>

                  <v-tab-item
                    v-for="(item, i) in items"
                    :key="i + 1"
                    :id="'tab-' + (i + 1)"
                  >
                    <v-card flat>
                      <div class="text-xs-justify padding-20 pa-3">
                        <p class="header-title hidden-sm-and-up">{{item.title}}</p>
                        <v-layout row wrap v-for="(row) in item.components" :key="row.id">
                          <v-flex
                            v-for="(col) in row"
                            :key="col.id"
                            xs12
                            :md1="col.class === 'md1'"
                            :md2="col.class === 'md2'"
                            :md3="col.class === 'md3'"
                            :md4="col.class === 'md4'"
                            :md5="col.class === 'md5'"
                            :md6="col.class === 'md6'"
                            :md7="col.class === 'md7'"
                            :md8="col.class === 'md8'"
                            :md9="col.class === 'md9'"
                            :md10="col.class === 'md10'"
                            :md11="col.class === 'md11'"
                            :md12="col.class === 'md12'"
                          >
                            <template v-if="col.content_type === 'html'">
                              <p v-html="col.html"></p>
                            </template>

                            <template v-else>
                              <template
                                v-if="(col.input.type === 'text' || col.input.type === 'number' || col.input.type === 'double') && col.input.max_length <= 255"
                              >
                                <v-text-field
                                  outline
                                  :background-color="col.input.has_error ? 'error' : 'default'"
                                  :type="col.input.type === 'number' ? 'number' : 'text'"
                                  :readonly="col.input.read_only"
                                  :required="col.input.required"
                                  :disabled="col.input.disabled"
                                  v-model="col.input.value"
                                  :hint="col.input.title"
                                  :label="col.input.title + (col.input.required ? ' (*)' : '')"
                                  :maxlength="col.input.max_length"
                                ></v-text-field>
                              </template>

                              <template v-else-if="col.input.max_length > 255">
                                <v-textarea
                                  outline
                                  :background-color="col.input.has_error ? 'error' : 'default'"
                                  v-if="(col.input.type === 'text' || col.input.type === 'number' || col.input.type === 'double') && col.input.max_length > 255"
                                  :readonly="col.input.read_only"
                                  :required="col.input.required"
                                  :disabled="col.input.disabled"
                                  v-model="col.input.value"
                                  :hint="col.input.title"
                                  :label="col.input.title + (col.input.required ? ' (*)' : '')"
                                  :maxlength="col.input.max_length"
                                  :rows="col.input.rows"
                                ></v-textarea>
                              </template>

                              <template
                                v-else-if="col.input.type === 'date' || col.input.type === 'month'"
                              >
                                <v-menu
                                  :disabled="col.input.read_only"
                                  v-model="col.input.modal"
                                  :close-on-content-click="false"
                                  :nudge-right="40"
                                  lazy
                                  transition="scale-transition"
                                  full-width
                                  min-width="290px"
                                >
                                  <v-text-field
                                    outline
                                    :background-color="col.input.has_error ? 'error' : 'default'"
                                    :required="col.input.required"
                                    :disabled="col.input.disabled"
                                    :hint="col.input.title"
                                    slot="activator"
                                    v-model="col.input.value"
                                    :label="col.input.title + (col.input.required ? ' (*)' : '')"
                                    readonly
                                  ></v-text-field>
                                </v-menu>
                              </template>

                              <template v-else-if="col.input.type === 'checkbox'">
                                <v-checkbox
                                  :background-color="col.input.has_error ? 'error' : 'default'"
                                  v-model="col.input.value"
                                  :label="col.input.title"
                                  :hint="col.input.title"
                                ></v-checkbox>
                              </template>

                              <template v-if="col.input.type === 'radio_group'">
                                <p v-html="col.input.title" style="width: 100%"></p>
                                <v-radio-group v-model="col.input.value">
                                  <v-radio
                                    v-for="l in col.input.options"
                                    :key="l"
                                    :label="l"
                                    :value="l"
                                  ></v-radio>
                                </v-radio-group>
                              </template>
                            </template>
                          </v-flex>
                        </v-layout>
                      </div>
                    </v-card>
                  </v-tab-item>
                </v-tabs>

                <v-tooltip bottom color="black">
                  <v-btn
                    slot="activator"
                    color="blue-grey darken-3"
                    class="mb-5 white--text"
                    @click="previousTab()"
                  >
                    <v-icon>chevron_left</v-icon>
                  </v-btn>
                  <span>Previous tab</span>
                </v-tooltip>

                <v-tooltip bottom color="black">
                  <v-btn
                    slot="activator"
                    color="blue-grey darken-3"
                    class="mb-5 white--text"
                    @click="nextTab()"
                  >
                    <v-icon>chevron_right</v-icon>
                  </v-btn>
                  <span>Next tab</span>
                </v-tooltip>
              </v-card>
            </v-flex>
          </v-layout>
          
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>

export default {
  data() {
    return {
      token: null,
      active: null,
    };
  },
  props: ["items"],
  methods: {
    setActiveTab(tab) {
      this.active = tab;
    },
    nextTab(i) {
      var active = parseInt(this.active);
      this.setActiveTab(active < this.items.length - 1 ? active + 1 : 0);
      this.submitACForm(false, i);
    },
    previousTab(i) {
      var active = parseInt(this.active);
      this.setActiveTab(active > 0 ? active - 1 : this.items.length - 1);
      this.submitACForm(false, i);
    },
    missingFields(i) {
      var rows = this.items[i].components;
      var inputsCount = 0;
      var inputsFilled = 0;
      for (var j in rows) {
        var row = rows[j];
        for (var k in row) {
          var component = row[k];
          if (component.content_type === "input") {
            inputsCount++;
            if (component.input.value) {
              inputsFilled++;
            }
          } else if (component.content_type === "input_group") {
            for (var l in component.rows) {
              var inputRow = component.rows[l];
              for (var m in inputRow) {
                var inputItem = inputRow[m];
                if (inputItem.content_type === "input") {
                  inputsCount++;
                  if (inputItem.input.value) {
                    inputsFilled++;
                  }
                }
              }
            }
          }
        }
      }
      return inputsCount - inputsFilled;
    },
    tabComplete(i) {
      var rows = this.items[i].components;
      var inputsCount = 0,
        inputsFilled = 0;
      for (var j in rows) {
        var row = rows[j];
        for (var k in row) {
          var component = row[k];
          if (component.content_type === "input") {
            inputsCount++;
            if (component.input.value) {
              inputsFilled++;
            }
          } else if (component.content_type === "input_group") {
            for (var l in component.rows) {
              var inputRow = component.rows[l];
              for (var m in inputRow) {
                var inputItem = inputRow[m];
                if (inputItem.content_type === "input") {
                  inputsCount++;
                  if (inputItem.input.value) {
                    inputsFilled++;
                  }
                }
              }
            }
          }
        }
      }
      return inputsCount === inputsFilled ? 2 : inputsFilled === 0 ? 0 : 1;
    }
  }
};
</script>

<style scoped>
</style>
