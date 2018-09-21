<template>
  <v-container style="margin-top: 60px;" class="animated fadeIn">
    <v-card class="pb-4">
      <v-layout row wrap mb-3>
        <v-flex xs12 sm8 offset-sm2 mt-4>
          <h3 class="primary--text" :class="loadingInitialElements ? 'uppercase' : ''"><v-icon v-if="!loadingInitialElements" color="primary">location_city</v-icon> {{ac.settings.name}}</h3>
        </v-flex>
      </v-layout>
      <v-layout row v-if="loadingInitialElements" wrap mt-2>
        <v-flex xs12>
          <icon name="circle-notch" scale=2 spin style="color: gray;"></icon>
        </v-flex>
      </v-layout>
      <v-layout row v-else wrap class="text-xs-center">
        <v-flex xs12 v-if="ac.admin">
          <h3><v-icon color="primary">business_center</v-icon> <b>Manager:</b> {{ac.admin}}</h3>
        </v-flex>
        <v-flex xs12>
          <h3><v-icon color="primary">phone</v-icon> <b>Telephone:</b> {{ac.settings.telephone}}</h3>
        </v-flex>
        <v-flex xs12>
          <h3><v-icon color="primary">location_on</v-icon> <b>Address:</b> {{ac.settings.address}}</h3>
        </v-flex>
      </v-layout>

      <template v-if="!loadingInitialElements">
        <template v-if="!ac.registered">
          <v-container pa-5>
            <v-form v-model="validationStatus" ref="form">
              <v-layout row wrap>
                <v-flex sm5 md5>
                  <v-text-field :disabled="!isGuest" v-model="ac.user_data.name" prepend-icon="edit" name="name" label="First name" type="text" :rules="nameRules"></v-text-field>
                  <v-text-field :disabled="!isGuest" v-model="ac.user_data.last_name" prepend-icon="edit" name="last_name" label="Last name" type="text" :rules="lastNameRules"></v-text-field>
                  <v-text-field :disabled="!isGuest" @blur="test" v-model="ac.user_data.postcode" prepend-icon="place" name="postcode" label="Postcode" :rules="postcodeRules" :hint="loadingPostcodeInfo ? 'Loading postcode...' : 'Enter a postcode to lookup'" type="text"></v-text-field>
                  <v-text-field :disabled="!isGuest" v-model="ac.user_data.address" prepend-icon="fas fa-map-signs" name="address" label="Address" id="address" type="text" :rules="addressRules"></v-text-field>
                </v-flex>
                <v-flex offset-sm2 sm5>
                  <v-text-field :disabled="!isGuest" v-model="ac.user_data.email" prepend-icon="email" name="email" label="Email" id="email" type="email" :rules="emailRules"></v-text-field>
                  <v-text-field :disabled="!isGuest" v-model="ac.user_data.password" prepend-icon="lock" name="password" label="Password" id="password" :rules="passwordRules" :append-icon="e1 ? 'visibility' : 'visibility_off'" @click:append="() => (e1 = !e1)" :type="e1 ? 'password' : 'text'" hint="At least 6 characters" min="6"></v-text-field>
                  <v-text-field :disabled="!isGuest" v-model="ac.user_data.password_confirm" prepend-icon="lock" name="passwordConfirm" label="Password Confirmation" id="passwordConfirm" :rules="passwordConfirmRules" :append-icon="e1 ? 'visibility' : 'visibility_off'" @click:append="() => (e1 = !e1)" :type="e1 ? 'password' : 'text'" hint="Re-type your password"></v-text-field>
                  <v-text-field v-if="acRole === 'student'" :readonly="true" v-model="dsaLetterName" label="DSA Letter" :rules="dsaLetterRules" prepend-icon="attach_file" append-icon="folder" @click="uploadDlg = true" @click:append="() => (uploadDlg = true)" type="text" hint="Upload a copy of your DSA letter"></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row wrap mt-5>
                <v-flex xs12>
                  <v-tooltip bottom :color="validationColor">
                    <v-btn :disabled="loading" v-on:click="registerWithAC()" class="white--text" :class="{ red: !validationStatus, indigo: validationStatus }" slot="activator">
                      <icon v-if="loading" name="circle-notch" spin class="gray--text"></icon>
                      <v-icon size="22" v-if="!loading && validationStatus">done</v-icon>
                      <v-icon size="22" v-if="!loading && !validationStatus">error_outline</v-icon>
                      &nbsp;Register with this Centre
                    </v-btn>
                    <span>{{validationMessage}}</span>
                  </v-tooltip>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>

          <v-dialog width="500" v-model="uploadDlg" persistent>
            <v-card>
              <v-card-title class="headline grey lighten-2">
                Upload file
                <v-spacer></v-spacer>
                <a @click="uploadDlg = false"><icon name="times" class="fa"></icon></a>
              </v-card-title>
              <v-container>
                <file-upload v-on:set-file="setDSALetter($event)"></file-upload>
              </v-container>
            </v-card>
          </v-dialog>
        </template>
        
        <template v-else>
          <v-container>
            <v-layout row wrap v-if="ac.role !== 'ac'">
              
              <v-flex xs12 class="text-xs-right">
                <v-btn v-if="ac.role === 'na'" small color="primary" @click="setUnavPeriodDlg = true"><icon class="fa" name="user-slash"></icon> Set unavailable period</v-btn>
                <v-btn small color="error" @click="cancelRegistrationDlg = true"><icon class="fa" name="user-times"></icon> Cancel Registration</v-btn>
              </v-flex>

              <v-dialog v-if="ac.role === 'na'" width="500" v-model="setUnavPeriodDlg" persistent>
                <v-card>
                  <v-card-title class="headline grey lighten-2">
                    Unavailable period
                  </v-card-title>
                  <v-container>
                    <v-form v-model="unavPeriodValidation" ref="unavPeriodForm">
                      <!--Starting interval-->
                      <v-layout row wrap>
                        <v-flex xs12 sm6>
                          <v-menu v-model="newUnavailablePeriod.sdModal" :close-on-content-click="true" :nudge-bottom="60" lazy transition="scale-transition" min-width="290px">
                            <v-text-field v-model="newUnavailablePeriod.start_date" :rules="nameRules" :error-messages="newUnavPeriodErrors" :error="newUnavPeriodError" clearable append-icon="event" outline required slot="activator" label="Start date" readonly></v-text-field>
                            <v-date-picker v-model="newUnavailablePeriod.start_date" @change="validateUnavailablePeriod()" no-title :show-current="true" :min="ac.appointment_restrictions.min_date">
                              <v-spacer></v-spacer>
                              <v-btn flat small @click="newUnavailablePeriod.sdModal = false">OK</v-btn>
                            </v-date-picker>
                          </v-menu>
                        </v-flex>
                        <v-flex xs12 sm6>
                          <v-menu v-model="newUnavailablePeriod.shModal" :close-on-content-click="false" :disabled="!newUnavailablePeriod.start_date" :nudge-bottom="60" lazy transition="scale-transition" min-width="290px">
                            <v-text-field v-model="newUnavailablePeriod.start_hour" :rules="nameRules" :error-messages="newUnavPeriodErrors" :error="newUnavPeriodError" :disabled="!newUnavailablePeriod.start_date" clearable append-icon="access_time" outline required slot="activator" label="Start hour" readonly></v-text-field>
                            <v-time-picker v-model="newUnavailablePeriod.start_hour" @change="validateUnavailablePeriod()" :disabled="!newUnavailablePeriod.start_date" format="24hr">
                              <v-spacer></v-spacer>
                              <v-btn flat small @click="newUnavailablePeriod.shModal = false">OK</v-btn>
                            </v-time-picker>
                          </v-menu>
                        </v-flex>
                      </v-layout>
                      <!--Ending interval-->
                      <v-layout row wrap>
                        <v-flex xs12 sm6>
                          <v-menu v-model="newUnavailablePeriod.edModal" :close-on-content-click="true" :nudge-bottom="60" lazy transition="scale-transition" min-width="290px">
                            <v-text-field v-model="newUnavailablePeriod.end_date" :rules="nameRules" :error-messages="newUnavPeriodErrors" :error="newUnavPeriodError" clearable append-icon="event" outline required slot="activator" label="End date" readonly></v-text-field>
                            <v-date-picker v-model="newUnavailablePeriod.end_date" @change="validateUnavailablePeriod()" no-title :show-current="true" :min="ac.appointment_restrictions.min_date">
                              <v-spacer></v-spacer>
                              <v-btn flat small @click="newUnavailablePeriod.edModal = false">OK</v-btn>
                            </v-date-picker>
                          </v-menu>
                        </v-flex>
                        <v-flex xs12 sm6>
                          <v-menu v-model="newUnavailablePeriod.ehModal" :close-on-content-click="false" :disabled="!newUnavailablePeriod.end_date" :nudge-bottom="60" lazy transition="scale-transition" min-width="290px">
                            <v-text-field v-model="newUnavailablePeriod.end_hour" :rules="nameRules" :error-messages="newUnavPeriodErrors" :error="newUnavPeriodError" :disabled="!newUnavailablePeriod.start_date" clearable append-icon="access_time" outline required slot="activator" label="End hour" readonly></v-text-field>
                            <v-time-picker v-model="newUnavailablePeriod.end_hour" @change="validateUnavailablePeriod()" :disabled="!newUnavailablePeriod.start_date" format="24hr">
                              <v-spacer></v-spacer>
                              <v-btn flat small @click="newUnavailablePeriod.ehModal = false">OK</v-btn>
                            </v-time-picker>
                          </v-menu>
                        </v-flex>
                      </v-layout>
                    </v-form>
                    <v-layout row wrap>
                      <v-spacer></v-spacer>
                      <v-btn small :disabled="loading" color="info" @click="setUnavailablePeriod()">
                        <icon v-if="!loading" class="fa" name="check"></icon>
                        <icon v-else class="fa" name="circle-notch" spin></icon> Confirm
                      </v-btn>
                      <v-btn small color="error" @click="setUnavPeriodDlg = false"><icon class="fa" name="times"></icon> Cancel</v-btn>
                    </v-layout>
                  </v-container>
                </v-card>
              </v-dialog>

              <v-dialog width="350" v-model="cancelRegistrationDlg" persistent>
                <v-card>
                  <v-card-title class="headline grey lighten-2">
                    Cancel Registration
                    <v-spacer></v-spacer>
                    <a @click="cancelRegistrationDlg = false"><icon name="times" class="fa"></icon></a>
                  </v-card-title>
                  <v-container>
                    <h3>Are you sure you want to cancel your registration with this Centre?</h3>
                    <v-btn :disabled="loading" color="error" @click="cancelRegistration()">
                      <icon v-if="!loading" class="fa" name="check"></icon>
                      <icon v-else class="fa" name="circle-notch" spin></icon> Yes
                    </v-btn>
                    <v-btn color="info" @click="cancelRegistrationDlg = false"><icon class="fa" name="times"></icon> No</v-btn>
                  </v-container>
                </v-card>
              </v-dialog>
            </v-layout>

            <v-layout row wrap mt-3>
              <v-flex xs10 offset-xs1>
                <v-expansion-panel>
                  <v-expansion-panel-content v-if="ac.role === 'student'">
                    <div slot="header"><icon name="calendar-alt" class="fa"></icon><b>New appointment</b></div>
                    <v-card>
                      <v-card-text class="animated fadeIn">
                        
                        <v-form ref="newAppointmentForm" v-model="newAppointmentValidation">
                          <v-layout row wrap v-if="ac.settings.availability_type !== 'Combined'">
                            <v-flex md8 offset-md2 lg6 offset-lg3>
                              <v-autocomplete no-data-text="No assessors available" readonly clearable v-model="newAppointment.assessor" @change="setAssessorServices()" return-object required item-text="name" outline :rules="nameRules" append-icon="person" :items="ac.needs_assessors" label="Assessor">
                                <template slot="item" slot-scope="{ item, tile }">
                                  <v-list-tile-avatar color="indigo" class="headline font-weight-light white--text">
                                    {{ item.name.charAt(0) }}
                                  </v-list-tile-avatar>
                                  <v-list-tile-content>
                                    <v-list-tile-title v-text="item.name"></v-list-tile-title>
                                    <v-list-tile-sub-title><i>{{item.email}}</i></v-list-tile-sub-title>
                                  </v-list-tile-content>
                                </template>
                              </v-autocomplete>
                            </v-flex>
                          </v-layout>
                          
                          <v-layout row wrap>
                            <v-flex md8 offset-md2 lg6 offset-lg3 v-if="ac.services.length > 0">
                              <v-autocomplete no-data-text="No services available" readonly clearable v-model="newAppointment.service" @change="resetNewAppointmentTimeAndDate()" return-object required item-text="name" outline :rules="nameRules" append-icon="assessment" :items="assessorServices" label="Service">
                                <template slot="item" slot-scope="{ item, tile }">
                                  <v-list-tile-avatar color="indigo" class="headline font-weight-light white--text">
                                    {{ item.name.charAt(0) }}
                                  </v-list-tile-avatar>
                                  <v-list-tile-content>
                                    <v-list-tile-title v-text="item.name"></v-list-tile-title>
                                    <v-list-tile-sub-title><i>Duration: {{item.duration}} mins. Price: {{item.price}} {{item.currency}}</i></v-list-tile-sub-title>
                                  </v-list-tile-content>
                                </template>
                              </v-autocomplete>
                            </v-flex>
                          </v-layout>

                          <v-layout row wrap>
                            <v-flex sm6 md4 offset-md2 lg3 offset-lg3>
                              <v-menu v-model="newAppointment.dateModal" :close-on-content-click="true" :nudge-bottom="60" lazy transition="scale-transition" full-width min-width="290px">
                                <v-text-field v-model="newAppointment.date" clearable append-icon="event" outline required slot="activator" :rules="nameRules" label="Date" readonly></v-text-field>
                                <v-date-picker v-model="newAppointment.date" @change="getAvailableHours()" no-title ref="newAppointmentDate" :show-current="true" :min="ac.appointment_restrictions.min_date" :max="ac.appointment_restrictions.max_date" :allowed-dates="allowedDates"></v-date-picker>
                              </v-menu>
                            </v-flex>
                            <v-flex sm6 md4 lg3>
                              <v-autocomplete v-model="newAppointment.hour" no-data-text="No time slots available" :disabled="loadingHours || !newAppointment.date" clearable required item-text="name" item-value="name" outline :rules="nameRules" append-icon="access_time" :items="ac.appointment_restrictions.available_hours" label="Hour">
                                <template slot="item" slot-scope="{ item, tile }">
                                  <v-list-tile-avatar color="indigo" class="headline font-weight-light white--text">
                                    H
                                  </v-list-tile-avatar>
                                  <v-list-tile-content>
                                    <v-list-tile-title v-text="item.name"></v-list-tile-title>
                                  </v-list-tile-content>
                                </template>
                              </v-autocomplete>
                            </v-flex>
                          </v-layout>
                          
                          <v-layout row wrap>
                            <v-flex xs12 md8 offset-md2 lg6 offset-lg3>
                              <v-btn large block :disabled="!newAppointmentValidation" color="info" @click="confirmAppointmentDlg = true"><v-icon>event_available</v-icon> Confirm<span class="hidden-xs-only">&nbsp;appointment</span></v-btn>
                            </v-flex>
                          </v-layout>
                        </v-form>

                        <v-dialog width="250" v-model="loadingHours" persistent>
                          <v-card>
                            <v-container>
                              <v-card-text>
                                <v-layout row>
                                  <v-flex xs12>
                                    <v-progress-circular indeterminate color="blue-grey"></v-progress-circular>
                                  </v-flex>
                                </v-layout>
                              </v-card-text>
                            </v-container>
                          </v-card>
                        </v-dialog>

                        <v-dialog v-if="newAppointmentValidation" width="350" v-model="confirmAppointmentDlg" persistent>
                          <v-card>
                            <v-container>
                              <v-layout row>
                                <v-flex xs12>
                                  <h3 class="text-xs-justify">Please, verify this information to make sure everything is correct:</h3>
                                </v-flex>
                              </v-layout>
                              <v-layout row mt-3>
                                <v-flex xs12>
                                  <p class="text-xs-justify">
                                    <span v-if="newAppointment.assessor.name"><a>Needs Assessor:</a> {{newAppointment.assessor.name}}<br /></span>
                                    <a>Service:</a> {{newAppointment.service.name}}<br />
                                    <a>Date:</a> {{newAppointment.date}}<br />
                                    <a>Hour:</a> {{newAppointment.hour}}<br />
                                  </p>
                                  <v-divider></v-divider>
                                </v-flex>
                              </v-layout>
                              <v-layout row mt-3>
                                <v-spacer></v-spacer>
                                <v-btn small color="error" @click="confirmAppointmentDlg = false">
                                  <icon class="fa" name="times"></icon> Go back
                                </v-btn>
                                <v-btn small :disabled="loading" color="info" @click="saveAppointment()">
                                  <icon v-if="!loading" class="fa" name="check"></icon>
                                  <icon v-else class="fa" name="circle-notch" spin></icon> Confirm
                                </v-btn>
                              </v-layout>
                            </v-container>
                          </v-card>
                        </v-dialog>

                      </v-card-text>
                    </v-card>
                  </v-expansion-panel-content>
                  
                  <v-expansion-panel-content v-if="ac.role === 'ac'">
                    <div slot="header"><icon name="cog" class="fa"></icon>Management</div>
                    <v-layout row pb-5>
                      <v-flex sm10 offset-sm1>

                        <v-tabs slot="extension" v-model="tabs" fixed-tabs icons-and-text color="transparent">
                          <v-tabs-slider></v-tabs-slider>
                          <v-tab href="#tab-students" class="primary--text">
                            <v-icon>school</v-icon> Students
                          </v-tab>
                          <v-tab href="#tab-needs-assessors" class="primary--text">
                            <v-icon>assignment_ind</v-icon> Assessors
                          </v-tab>
                          <v-tab href="#tab-services" class="primary--text">
                            <v-icon>assessment</v-icon> Services
                          </v-tab>
                          <v-tab href="#tab-settings" class="primary--text">
                            <v-icon>settings</v-icon> Settings
                          </v-tab>
                        </v-tabs>

                        <v-tabs-items v-model="tabs">
                          <v-tab-item id='tab-students'>
                            <v-card>
                              <v-data-table :headers="[{ text: 'Name', value: 'name' }, { text: 'Institute', value: 'institute' }, { text: 'Actions', sortable: false, value: 'actions'}]" :items="ac.students" class="elevation-1">
                                <template slot="headerCell" slot-scope="props">
                                  <v-tooltip bottom>
                                    <span slot="activator">{{ props.header.text }}</span>
                                    <span>{{ props.header.text }}</span>
                                  </v-tooltip>
                                </template>
                                <template slot="items" slot-scope="props">
                                  <td class="text-xs-left">{{ props.item.name }}</td>
                                  <td class="text-xs-left">{{ props.item.institute }}</td>
                                  <td class="text-xs-left">
                                    <v-tooltip bottom color="black">
                                      <v-btn @click="setCurrentUser(props.index, props.item, 'student')" small flat slot="activator" class="btn-sm" color="error">
                                        <icon class="fa" name="user-times"></icon>
                                      </v-btn>
                                      <span>Cancel registration</span>
                                    </v-tooltip>
                                  </td>
                                </template>
                              </v-data-table>
                            </v-card>
                          </v-tab-item>

                          <v-tab-item id='tab-needs-assessors'>
                            <v-card>
                              <v-layout row class="mt-3 mb-2">
                                <v-spacer></v-spacer>
                                <v-btn @click="inviteUsersDlg = true" color="info"><icon class="fa" name="envelope"></icon> Invite Assessors</v-btn>
                              </v-layout>
                              <v-data-table :headers="[{ text: 'Name', value: 'name' }, { text: 'Email', value: 'email' }, { text: 'Actions', sortable: false, value: 'actions'}]" :items="ac.needs_assessors" class="elevation-1">
                                <template slot="headerCell" slot-scope="props">
                                  <v-tooltip bottom>
                                    <span slot="activator">{{ props.header.text }}</span>
                                    <span>{{ props.header.text }}</span>
                                  </v-tooltip>
                                </template>
                                <template slot="items" slot-scope="props">
                                  <td class="text-xs-left">{{ props.item.name }}</td>
                                  <td class="text-xs-left">{{ props.item.email }}</td>
                                  <td class="text-xs-left">
                                    <v-tooltip bottom color="black">
                                      <v-btn :disabled="ac.services.length < 1" @click="showNAServices(props.index, props.item)" small flat slot="activator" class="btn-sm" color="primary">
                                        <icon class="fa" name="user-cog"></icon>
                                      </v-btn>
                                      <span>Assign services</span>
                                    </v-tooltip>
                                    <v-tooltip bottom color="black">
                                      <v-btn @click="setCurrentUser(props.index, props.item, 'needs_assessor')" small flat slot="activator" class="btn-sm" color="error">
                                        <icon class="fa" name="user-times"></icon>
                                      </v-btn>
                                      <span>Cancel registration</span>
                                    </v-tooltip>
                                  </td>
                                </template>
                              </v-data-table>

                              <v-dialog width="500" v-model="naServicesDlg" persistent>
                                <v-card>
                                  <v-card-title class="headline grey lighten-2">
                                    Available services
                                    <v-spacer></v-spacer>
                                    <a @click="naServicesDlg = false"><icon name="times" class="fa"></icon></a>
                                  </v-card-title>
                                  <v-container>
                                    <v-data-table ref="tblNAServices" :headers="[{ text: 'Name', value: 'name' }, { text: 'Description', value: 'description' }]" :items="ac.services" v-model="selectedServices" item-key="id" select-all>
                                      <template slot="headerCell" slot-scope="props">
                                        <v-tooltip bottom>
                                          <span slot="activator">{{ props.header.text }}</span>
                                          <span>{{ props.header.text }}</span>
                                        </v-tooltip>
                                      </template>
                                      <template slot="items" slot-scope="props">
                                        <td><v-checkbox v-model="props.selected" primary hide-details></v-checkbox></td>
                                        <td class="text-xs-left">{{ props.item.name }}</td>
                                        <td class="text-xs-left">{{ props.item.description }}</td>
                                      </template>
                                    </v-data-table>
                                    <v-layout row>
                                      <v-spacer></v-spacer>
                                      <v-btn :disabled="loading" color="info" @click="updateNAServices()">
                                        <icon v-if="!loading" class="fa" name="check"></icon>
                                        <icon v-else class="fa" name="circle-notch" spin></icon> Update services
                                      </v-btn>
                                      <v-btn @click="naServicesDlg = false" color="error">
                                        <icon class="fa" name="times"></icon> Close
                                      </v-btn>
                                    </v-layout>
                                  </v-container>
                                </v-card>
                              </v-dialog>

                              <v-dialog width="500" v-model="inviteUsersDlg" persistent>
                                <v-card>
                                  <v-card-title class="headline grey lighten-2">
                                    Invite user
                                    <v-spacer></v-spacer>
                                    <a @click="inviteUsersDlg = false"><icon name="times" class="fa"></icon></a>
                                  </v-card-title>
                                  <v-container>
                                    <v-form ref="inviteForm">
                                      <v-layout row>
                                        <v-text-field max="50" outline v-on:keyup.enter="inviteUser()" ref="invitationName" v-model="invitation.name" append-icon="person" label="Name" type="text" required :rules="nameRules" hint="Enter the assessor's name"></v-text-field>
                                      </v-layout>
                                      <v-layout row>
                                        <v-text-field max="150" outline v-on:keyup.enter="inviteUser()" v-model="invitation.email" append-icon="mail" label="Email" type="text" required :rules="emailRules" hint="Enter the email address"></v-text-field>
                                      </v-layout>
                                      <v-layout row>
                                        <v-textarea outline v-model="invitation.text" append-icon="edit" label="Custom message" type="text" required hint="Enter a custom message"></v-textarea>
                                      </v-layout>
                                      <v-layout row>
                                        <v-spacer></v-spacer>
                                        <v-btn :disabled="loading" color="info" @click="inviteUser()">
                                          <icon v-if="!loading" class="fa" name="envelope"></icon>
                                          <icon v-else class="fa" name="circle-notch" spin></icon> Send invitation
                                        </v-btn>
                                      </v-layout>
                                    </v-form>
                                  </v-container>
                                </v-card>
                              </v-dialog>
                            </v-card>
                          </v-tab-item>

                          <v-tab-item id='tab-services'>
                            <v-card>
                              <v-layout row class="mt-3 mb-2">
                                <v-spacer></v-spacer>
                                <v-btn @click="showUpdateServiceForm(-1, {id: -1, currency: 'GBP'}, 'Add service')" color="info"><icon class="fa" name="server"></icon> Add Service</v-btn>
                              </v-layout>
                              <v-data-table :headers="[{ text: 'Name', value: 'name' }, { text: 'Description', value: 'description' }, { text: 'Duration', value: 'duration' }, { text: 'Actions', sortable: false, value: 'actions'}]" :items="ac.services" class="elevation-1">
                                <template slot="headerCell" slot-scope="props">
                                  <v-tooltip bottom>
                                    <span slot="activator">{{ props.header.text }}</span>
                                    <span>{{ props.header.text }}</span>
                                  </v-tooltip>
                                </template>
                                <template slot="items" slot-scope="props">
                                  <td class="text-xs-left">{{ props.item.name }}</td>
                                  <td class="text-xs-left">{{ props.item.description }}</td>
                                  <td class="text-xs-left">{{ props.item.duration }}</td>
                                  <td class="text-xs-left">
                                    <v-tooltip bottom color="black">
                                      <v-btn @click="showUpdateServiceForm(props.index, props.item, 'Update service')" small flat slot="activator" class="btn-sm" color="success">
                                        <icon class="fa" name="edit"></icon>
                                      </v-btn>
                                      <span>Update</span>
                                    </v-tooltip>
                                    <v-tooltip bottom color="black">
                                      <v-btn @click="showUpdateServiceForm(props.index, props.item, 'Delete service')" small flat slot="activator" class="btn-sm" color="error">
                                        <icon class="fa" name="trash-alt"></icon>
                                      </v-btn>
                                      <span>Delete</span>
                                    </v-tooltip>
                                  </td>
                                </template>
                              </v-data-table>
                            </v-card>

                            <v-dialog width="500" v-model="updateServiceDlg" persistent>
                              <v-card>
                                <v-card-title class="headline grey lighten-2">
                                  {{currentServiceAction}}
                                  <v-spacer></v-spacer>
                                  <a @click="updateServiceDlg = false"><icon name="times" class="fa"></icon></a>
                                </v-card-title>
                                <v-container>
                                  <v-form ref="updateServiceForm">
                                    <template v-if="currentServiceAction !== 'Delete service'">
                                      <v-layout row>  
                                        <v-flex><v-text-field v-model="currentService.name" :rules="nameRules" max="50" ref="currentServiceName" outline v-on:keyup.enter="updateService()" append-icon="room_service" label="Name" type="text" required></v-text-field></v-flex>
                                      </v-layout>
                                      <v-layout row>
                                        <v-flex><v-textarea v-model="currentService.description" :counter="250" :no-resize="true" maxlength="250" rows="3" outline v-on:keyup.enter="updateService()" append-icon="edit" label="Description" type="text"></v-textarea></v-flex>
                                      </v-layout>
                                      <v-layout row>
                                        <v-flex sm6><v-text-field v-model="currentService.duration" :rules="durationRules" :hint="serviceDurationHint" maxlength="3" outline v-on:keyup.enter="updateService()" append-icon="access_time" label="Duration (minutes)" type="text" required></v-text-field></v-flex>
                                        <v-flex sm6><v-text-field v-model="currentService.attendants_number" :rules="attendantsRules" maxlength="3" outline v-on:keyup.enter="updateService()" append-icon="group" label="Attendants number" type="text" required></v-text-field></v-flex>
                                      </v-layout>
                                      <v-layout row>
                                        <v-flex sm6><v-text-field v-model="currentService.price" maxlength="3" :rules="priceRules" outline v-on:keyup.enter="updateService()" append-icon="attach_money" label="Price" type="text" required></v-text-field></v-flex>
                                        <v-flex sm6><v-text-field v-model="currentService.currency" :disabled="true" outline append-icon="trending_up" label="Currency" type="text" required></v-text-field></v-flex>
                                      </v-layout>
                                    </template>
                                    <template v-else>
                                      <v-layout row>
                                        <v-flex>
                                          <h3>Are you sure you want to delete <a>{{currentService.name}}</a>?</h3>
                                        </v-flex>
                                      </v-layout>
                                    </template>
                                    <v-layout row>
                                      <v-spacer></v-spacer>
                                      <v-btn :disabled="loading" @click="updateService()" :class="{ error: currentServiceAction === 'Delete service', success: currentServiceAction === 'Update service', info: currentServiceAction === 'Add service'}">
                                        <icon v-if="loading" class="fa" name="circle-notch" spin></icon> {{currentServiceAction}}
                                      </v-btn>
                                      <v-btn @click="updateServiceDlg = false" color="error">Close</v-btn>
                                    </v-layout>
                                  </v-form>
                                </v-container>
                              </v-card>
                            </v-dialog>
                          </v-tab-item>

                          <v-tab-item id='tab-settings'>
                            <v-card>
                              <v-container>
                                <v-form ref="settingsForm" v-model="settingsValidationStatus">
                                  <v-layout row wrap>
                                    <v-flex xs12 sm6 d-flex>
                                      <v-text-field v-model="ac.settings.name" required :rules="nameRules" label="Name" outline></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm6 d-flex>
                                      <v-text-field v-model="ac.settings.token" required :rules="nameRules" label="Slug" outline></v-text-field>
                                    </v-flex>
                                  </v-layout>
                                  <v-layout row wrap>
                                    <v-flex xs12 sm4 d-flex>
                                      <v-text-field v-model="ac.settings.telephone" required :rules="nameRules" label="Telephone" outline></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm4 d-flex>
                                      <v-text-field v-model="ac.settings.address" required :rules="nameRules" label="Address" outline></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm4 d-flex>
                                      <v-select v-model="ac.settings.availability_type" required :rules="nameRules" :items="['Individual', 'Combined']" label="Availability type" outline></v-select>
                                    </v-flex>
                                  </v-layout>
                                  <v-layout row wrap>
                                    <v-tooltip bottom :color="settingsValidationColor">
                                      <v-btn :disabled="loading" v-on:click="updateACSettings()" class="white--text" :class="{ red: !settingsValidationStatus, indigo: settingsValidationStatus }" slot="activator">
                                        <icon v-if="loading" name="circle-notch" spin class="gray--text"></icon>
                                        <v-icon size="22" v-if="!loading && settingsValidationStatus">done</v-icon>
                                        <v-icon size="22" v-if="!loading && !settingsValidationStatus">error_outline</v-icon>
                                        &nbsp;Update settings
                                      </v-btn>
                                      <span>{{settingsValidationMessage}}</span>
                                    </v-tooltip>
                                  </v-layout>
                                </v-form>
                              </v-container>
                            </v-card>
                          </v-tab-item>

                        </v-tabs-items>

                        <v-dialog width="500" v-model="cancelUserRegDlg" persistent>
                          <v-card>
                            <v-card-title class="headline grey lighten-2">
                              Cancel user registration
                              <v-spacer></v-spacer>
                              <a @click="cancelUserRegDlg = false"><icon name="times" class="fa"></icon></a>
                            </v-card-title>
                            <v-container>
                              <v-layout row>
                                  <h3>Are you sure you want to revoke {{currentUser.name}}'s registration?</h3>
                              </v-layout>
                              <v-divider class="mt-3 mb-3"></v-divider>
                              <v-layout row>
                                <v-spacer></v-spacer>
                                <v-btn :disabled="loading" color="error" @click="cancelUserRegistration()">
                                  <icon v-if="!loading" class="fa" name="check"></icon>
                                  <icon v-else class="fa" name="circle-notch" spin></icon> Yes
                                </v-btn>
                                <v-btn color="info" @click="cancelUserRegDlg = false"><icon class="fa" name="times"></icon> No</v-btn>
                              </v-layout>
                            </v-container>
                          </v-card>
                        </v-dialog>

                      </v-flex>
                    </v-layout>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-flex>
            </v-layout>

          </v-container>
        </template>

      </template>

      <v-snackbar :timeout="5000" :bottom="true" :right="true" v-model="snackbar" :color="operationMessageType">
        <icon class="fa" name="info-circle"></icon> {{ operationMessage }}
        <v-btn flat @click.native="snackbar = false"><icon name="times"></icon></v-btn>
      </v-snackbar>

    </v-card>
    
    <axios-component ref="axios" v-on:finish="handleHttpResponse($event)" />

	</v-container>
</template>

<script>
import FileUpload from "@/components/FileUpload";
import axios from "axios";
import AxiosComponent from "@/components/AxiosComponent";
import moment from "moment";

export default {
  data() {
    return {
      newUnavPeriodError: false,
      newUnavPeriodErrors: [],
      newUnavailablePeriod: {},
      unavPeriodValidation: false,
      setUnavPeriodDlg: false,
      confirmAppointmentDlg: false,
      newAppointmentValidation: false,
      loadingHours: false,
      newAppointment: { service: {}, assessor: {}, date: null, hour: null },
      tabs: null,
      e1: true,
      selectedServices: [],
      showBookingDlg: false,
      uploadDlg: false,
      naServicesDlg: false,
      cancelRegistrationDlg: false,
      updateServiceDlg: false,
      cancelUserRegDlg: false,
      inviteUsersDlg: false,
      validationStatus: false,
      settingsValidationStatus: false,
      loadingInitialElements: true,
      currentUser: { name: "" },
      acSlug: null,
      acAction: null,
      snackbar: false,
      loading: false,
      loadingPostcodeInfo: false,
      nameRules: [v => !!v || "This field is required"],
      lastNameRules: [v => !!v || "This field is required"],
      dsaLetterRules: [v => !!v || "This field is required"],
      passwordRules: [
        v => !!v || "This field is required",
        v => (v && v.length > 5) || "Password requires at least 6 characters"
      ],
      durationRules: [
        v => !!v || "This field is required",
        //v => (v && parseInt(v, 10) != NaN ) || "Integer number expected",
        v => (v && v > 4 && v < 481) || "This value is not allowed"
      ],
      attendantsRules: [
        v => !!v || "This field is required",
        v => (v && v > 0) || "This value is not allowed"
      ],
      priceRules: [
        v => !!v || "This field is required",
        v => (v && v > 0) || "This value is not allowed"
      ],
      passwordConfirmRules: [
        v => !!v || "This field is required",
        v => v === this.ac.user_data.password || "Passwords do not match"
      ],
      emailRules: [
        v => !!v || "E-mail is required",
        v =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          "E-mail must be valid"
      ],
      postcodeRules: [v => !!v || "This field is required"],
      addressRules: [v => !!v || "This field is required"],
      operationMessage: "Enter your credentials",
      operationMessageType: "warning",
      dsaLetterName: "",
      invitation: {
        name: "",
        email: "",
        text: ""
      },
      ac: {
        id: null,
        settings: {
          name: "Loading Assessment Centre information",
          admin: null
        },
        appointment_restrictions: {
          min_date: null,
          max_date: null,
          allowed_dates: [],
          available_hours: []
        }
      },
      currentServiceIndex: -1,
      currentService: {},
      invitationToken: null,
      currentServiceAction: "",
      assessorServices: []
    };
  },
  components: { FileUpload, AxiosComponent },
  mounted() {
    this.activationUrl = window.location.href.replace(
      this.$route.path,
      "/activate-account"
    );
    this.acSlug = this.$route.params.slug;
    this.acAction = this.$route.params.action;
    this.invitationToken = this.$route.params.token;

    var config = {
      url: "get-ac-info",
      params: {
        slug: this.acSlug,
        invitation_token: this.invitationToken
      }
    };
    this.$refs.axios.submit(config);
  },
  methods: {
    validateUnavailablePeriod() {
      var startDate = moment(
        this.newUnavailablePeriod.start_date +
          " " +
          this.newUnavailablePeriod.start_hour,
        "YYYY-MM-DD HH:mm"
      );
      var endDate = moment(
        this.newUnavailablePeriod.end_date +
          " " +
          this.newUnavailablePeriod.end_hour,
        "YYYY-MM-DD HH:mm"
      );
      if (startDate.isValid() && endDate.isValid()) {
        var diff = endDate.diff(startDate) / 60000;
        if (diff < 1) {
          this.newUnavPeriodErrors = ["Invalid date range"];
          this.newUnavPeriodError = true;
        } else if (diff < 5) {
          this.newUnavPeriodErrors = ["Select a range greater than 5 minutes"];
          this.newUnavPeriodError = true;
        } else {
          this.newUnavPeriodErrors = [];
          this.newUnavPeriodError = false;
        }
      } else {
        console.log(startDate);
        console.log(endDate);
        this.newUnavPeriodError = true;
      }
    },
    setUnavailablePeriod() {
      this.validateUnavailablePeriod();
      if (!this.newUnavPeriodError) {
        var config = {
          method: "post",
          url: "set-unavailable-period",
          params: {
            period: this.newUnavailablePeriod,
            ac_id: this.ac.id
          }
        };
        this.loading = true;
        this.$refs.axios.submit(config);
      }
    },
    resetNewAppointmentTimeAndDate() {
      this.newAppointment.date = null;
      this.newAppointment.hour = null;
    },
    saveAppointment() {
      var config = {
        method: "post",
        url: "create-appointment",
        params: {
          appointment: this.newAppointment
        }
      };
      this.loading = true;
      this.$refs.axios.submit(config);
    },
    setAssessorServices() {
      this.newAppointment.service = null;
      this.newAppointment.date = null;
      this.newAppointment.hour = null;
      if (this.newAppointment.assessor) {
        this.assessorServices =
          this.newAppointment.assessor.id > 0
            ? this.newAppointment.assessor.services
            : this.ac.services;
      } else {
        this.assessorServices = [];
      }
    },
    allowedDates(val) {
      return this.ac.appointment_restrictions.allowed_dates.includes(val);
    },
    getAvailableHours() {
      this.newAppointment.hour = null;
      if (
        this.newAppointment.assessor &&
        this.newAppointment.service &&
        this.newAppointment.date
      ) {
        var config = {
          url: "get-available-hours",
          params: {
            service_id: this.newAppointment.service.id,
            assessor_id: this.newAppointment.assessor.id,
            date: this.newAppointment.date
          }
        };
        this.loadingHours = true;
        this.$refs.axios.submit(config);
      } else {
        this.snackbar = true;
        this.operationMessageType = "warning";
        this.operationMessage = "Please, select a service first.";
      }
    },
    toggleBookingDlg() {
      if (this.showBookingDlg) {
        this.ac.needs_assessors.splice(this.ac.needs_assessors.length - 1, 1);
      } else {
        this.ac.needs_assessors.push({ id: -1, name: "- Any assessor -" });
      }
      this.newAppointment = {};
      this.showBookingDlg = !this.showBookingDlg;
    },
    updateACSettings() {
      if (this.$refs.settingsForm.validate()) {
        this.loading = true;
        var config = {
          method: "post",
          url: "update-ac-settings",
          params: {
            ac_id: this.ac.id,
            settings: this.ac.settings
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    updateNAServices() {
      this.loading = true;
      var config = {
        method: "post",
        url: "update-na-services",
        params: {
          ac_id: this.ac.id,
          user_id: this.currentNA.id,
          services: this.selectedServices
        }
      };
      this.$refs.axios.submit(config);
    },
    showNAServices(index, item) {
      this.currentNAIndex = index;
      this.currentNA = item;
      this.selectedServices = this.currentNA.services;
      this.naServicesDlg = true;
    },
    updateService() {
      if (this.$refs.updateServiceForm.validate()) {
        this.loading = true;
        var config = {
          method: "post",
          url: "update-ac-service",
          params: {
            ac_id: this.ac.id,
            item: this.currentService,
            action: this.currentServiceAction
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    showUpdateServiceForm(index, item, mode) {
      this.currentServiceIndex = index;
      this.currentService = JSON.parse(JSON.stringify(item));
      this.currentServiceAction = mode;
      this.updateServiceDlg = true;
      if (mode !== "Delete service") {
        this.$nextTick(this.$refs.currentServiceName.focus);
      }
    },
    setCurrentUser(index, user, userType) {
      this.currentUserIndex = index;
      this.currentUser = user;
      this.currentUserType = userType;
      this.cancelUserRegDlg = true;
    },
    setDSALetter(event) {
      this.ac.user_data.dsa_letter = event;
      if (event) {
        this.dsaLetterName = event.name;
        this.uploadDlg = false;
      } else {
        this.dsaLetterName = "";
      }
    },
    inviteUser() {
      if (this.$refs.inviteForm.validate()) {
        this.loading = true;
        var config = {
          method: "post",
          url: "invite-user",
          params: {
            invitation: this.invitation,
            ac_id: this.ac.id,
            url: window.location.href.replace(
              this.$route.path,
              "/assessment-centre/" + this.ac.settings.token + "/signup/"
            )
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    cancelUserRegistration() {
      this.loading = true;
      var config = {
        method: "post",
        url: "unregister-user-from-ac",
        params: {
          user_id: this.currentUser.id,
          ac_id: this.ac.id,
          url: window.location.href.replace(
            this.$route.path,
            "/assessment-centre/" + this.ac.settings.token + "/signup/"
          )
        }
      };
      this.$refs.axios.submit(config);
    },
    cancelRegistration() {
      this.loading = true;
      var config = {
        method: "post",
        url: "unregister-from-ac",
        params: {
          ac_id: this.ac.id
        }
      };
      this.$refs.axios.submit(config);
    },
    registerWithAC() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        var requestConfig = {
          headers: {
            Authorization: "Bearer " + this.$store.state.payload.jwt,
            "Content-Type": "multipart/form-data"
          }
        };
        var formData = new FormData();
        formData.append("dsa_letter", this.ac.user_data.dsa_letter);
        formData.append("ac", JSON.stringify(this.ac));
        formData.append("url", this.activationUrl);
        formData.append("role", this.acRole);
        formData.append("invitation_token", this.invitationToken);

        var that = this;
        axios
          .post(
            this.$store.state.baseUrl +
              "register-with-ac?XDEBUG_SESSION_START=netbeans-xdebug",
            formData,
            requestConfig
          )
          .then(function(response) {
            that.loading = false;
            that.operationMessage = response.data.msg;
            that.operationMessageType = response.data.code;
            that.snackbar = true;
            if (response.data.code === "success") {
              that.ac.registered = true;
              if (that.isGuest) {
                that.$store.state.authRouteRequested =
                  "/assessment-centre/" + that.acSlug + "/index";
                setTimeout(function() {
                  that.$router.push("/login");
                }, 5000);
              } else {
                that.$router.push(
                  "/assessment-centre/" + that.acSlug + "/index"
                );
              }
            }
          })
          .catch(function(error) {
            that.loading = false;
            that.operationMessage =
              "There was an error on the remote endpoint. Try again later.";
            that.operationMessageType = "error";
            that.snackbar = true;
          });
      }
    },
    handleHttpResponse(event) {
      console.log(event);

      if (event.data.result.code === 200) {
        this.operationMessage = event.data.result.response.msg;
        this.operationMessageType = event.data.result.response.code;
        this.loading = false;
        this.loadingHours = false;

        switch (event.url) {
          case "get-ac-info":
            this.setACInfo(event.data);
            break;
          case "get-available-hours":
            this.ac.appointment_restrictions.available_hours =
              event.data.result.code === 200 &&
              event.data.result.response.code === "success"
                ? event.data.result.response.data
                : [];
            this.loadingHours = false;
            break;
          case "update-ac-settings":
          case "create-appointment":
          case "update-na-services":
          case "set-unavailable-period":
            if (event.data.result.response.code === "success") {
              //Appointments
              this.confirmAppointmentDlg = false;
              this.newAppointment = { service: {}, assessor: {} };
              //Unavailable periods
              this.setUnavPeriodDlg = false;
              this.newUnavailablePeriod = {};
              this.newUnavPeriodError = true;
            }
            this.snackbar = true;
            break;
          case "update-ac-service":
            if (event.data.result.response.code === "success") {
              switch (this.currentServiceAction) {
                case "Add service":
                  this.currentService.id = event.data.result.response.data;
                  this.ac.services.push(this.currentService);
                  this.currentService = { id: -1, currency: "GBP" };
                  this.$nextTick(this.$refs.currentServiceName.focus);
                  break;
                case "Update service":
                  this.ac.services.splice(
                    this.currentServiceIndex,
                    1,
                    this.currentService
                  );
                  this.$nextTick(this.$refs.currentServiceName.focus);
                  break;
                case "Delete service":
                  this.ac.services.splice(this.currentServiceIndex, 1);
                  this.updateServiceDlg = false;
                  break;
                default:
                  break;
              }
            }
            this.snackbar = true;
            break;
          case "invite-user":
            this.operationMessage = event.data.result.response.msg;
            this.operationMessageType = event.data.result.response.code;
            if (event.data.result.response.code === "success") {
              this.invitation = {
                name: "",
                email: "",
                text: ""
              };
              this.$nextTick(this.$refs.invitationName.focus);
            }
            this.snackbar = true;
            break;
          case "unregister-user-from-ac":
            if (event.data.result.response.code === "success") {
              if (this.currentUserType === "student") {
                this.ac.students.splice(this.currentUserIndex, 1);
              } else {
                this.ac.needs_assessors.splice(this.currentUserIndex, 1);
              }
              this.cancelUserRegDlg = false;
            }
            this.snackbar = true;
            break;
          case "unregister-from-ac":
            if (event.data.result.response.code === "success") {
              this.ac.registered = false;
              this.cancelRegistrationDlg = false;
            }
            this.snackbar = true;
            break;
          default:
            this.snackbar = true;
            break;
        }
      } else {
        this.operationMessage = "Your request could not be executed.";
        this.operationMessageType = "error";
        this.snackbar = true;
      }
    },
    setACInfo(data) {
      if (data.result.code === 200 && data.result.response.code === "success") {
        this.ac = data.result.response.data;
        this.acRole = this.ac.role;
        if (this.ac.settings.availability_type === "Combined") {
          this.assessorServices = this.ac.services;
        }
        if (this.ac.registered && this.acAction === "signup") {
          this.$router.push("/assessment-centre/" + this.acSlug + "/index/");
        } else if (!this.ac.registered && this.acAction === "index") {
          this.$router.push(
            "/assessment-centre/" +
              this.acSlug +
              "/signup/" +
              this.invitationToken
          );
        } else {
        }
      } else {
        this.$router.push("/not-found");
      }
      this.loadingInitialElements = false;
    },
    test() {
      console.clear();
      console.log("Testing");
    }
  },
  computed: {
    serviceDurationHint() {
      var res =
        this.currentService.duration % 60 === 0
          ? this.currentService.duration / 60
          : (this.currentService.duration / 60).toFixed(2);
      return res + (res > 1 ? " hours" : " hour");
    },
    isGuest() {
      return this.$store.state.payload.is_guest;
    },
    settingsValidationMessage: function() {
      return this.settingsValidationStatus
        ? "Good to go!"
        : "The form is incomplete";
    },
    validationMessage: function() {
      return this.validationStatus ? "Good to go!" : "The form is incomplete";
    },
    validationColor: function() {
      return this.validationStatus ? "indigo" : "red";
    },
    settingsValidationColor: function() {
      return this.settingsValidationStatus ? "indigo" : "red";
    }
  }
};
</script>

<style scoped>
</style>
