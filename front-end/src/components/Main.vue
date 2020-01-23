<template>
    <div class="main">
        <h1>Lambda Layers Database</h1>
        <h2><i>Created and supported by the <a target="_blank" href="https://refinery.io">Refinery.io team</a></i></h2>
        <h3 class="search-title"><font-awesome-icon icon="search" /> Search the Database</h3>
        <div class="input-group">
          <b-form-input v-on:keyup="perform_search" v-model="query" class="search-box" size="lg" type="search" placeholder="pandoc, git, ssh, chrome..." autofocus>
          </b-form-input>
          <span class="input-group-btn">
            <b-form-select v-model="selected_region" :options="supported_regions" size="lg"></b-form-select>
          </span>
        </div>
        <hr />
        <b-list-group>
          <b-list-group-item class="d-flex justify-content-between align-items-center" variant="dark" v-if="search_results.length === 0 && search_results_loading === false">
            <b>No lambda layers found for your search query. <router-link to="/submit">Maybe consider submitting one for the database?</router-link></b>
          </b-list-group-item>

          <b-list-group-item v-if="search_results_loading">
            <b-spinner variant="primary" label="Spinning" small></b-spinner> Loading search results...
          </b-list-group-item>

          <b-list-group-item style="text-align: left" v-for="(search_result, index) in search_results" v-bind:key="index">
            <b>Description: </b> <p style="white-space: pre-wrap; display: inline">{{search_result.description}}</p>
            <br />
            <span v-if="search_result.source_link.trim() !== '' && !search_result.source_link.toLowerCase().startsWith('javascript')">
              <b>Source: </b> <a v-bind:href="search_result.source_link" target="_blank">{{search_result.source_link}}</a>
            </span>
            <br />
            <span v-if="search_result.submitter_name.trim() !== ''">
              <b>Submitter: </b> {{search_result.submitter_name}}<br />
            </span>
            <span v-if="search_result.submitter_name.trim() === ''">
              <b>Submitter: </b> Anonymous<br />
            </span>

            <span v-if="search_result.license.trim() !== ''">
              <b>License: </b> {{search_result.license}}<br />
            </span>
            <div class="input-group">
              <b-form-input v-bind:value="search_result.layer_arn" disabled></b-form-input>
              <span class="input-group-btn">
                <button class="btn btn-primary" type="button" v-on:click="copy_layer_arn(search_result.layer_arn)">
                  <font-awesome-icon icon="copy" />
                  Copy ARN
                </button>
              </span>
            </div>
            <div class="pt-2 pb-0">
              <b-button block variant="primary" v-on:click="download_layer_zip(search_result.layer_arn)">
                <font-awesome-icon icon="download" /> Download Layer .zip
              </b-button>
            </div>
            <div class="pt-2 pb-0">
              <b-button block variant="primary" v-bind:to="'/layer/' + search_result.id">
                <font-awesome-icon icon="eye" /> View Layer Page
              </b-button>
            </div>
          </b-list-group-item>
        </b-list-group>
    </div>
</template>

<script>
import apiService from '../lib/api.js';
import utils from '../lib/utils.js';

/* eslint-disable no-alert, no-console */
export default {
    name: 'Main',
    props: {},
    data: function() {
      return {
        query: '',
        internal_search_results: [],
        search_results_loading: false,
        supported_regions: [],
        selected_region: 'us-west-2'
      }
    },
    computed: {
      select_formatted_supported_regions: function() {
        return this.supported_regions.map(region => {
          return {
            'value': region,
            'text': region
          }
        })
      },
      search_results: function() {
        return this.internal_search_results.map(search_result => {
          return {
            ...search_result,
            ...{
              layer_arn: utils.replaceLayerRegion(
                search_result.layer_arn,
                this.selected_region
              )
            }
          }
        });
      }
    },
    methods: {
      copy_layer_arn: function(layer_arn) {
        this.$copyText(layer_arn);
        this.$toastr.s("Lambda layer ARN copied to clipboard!");
      },
      get_supported_regions: async function() {
        this.supported_regions = await apiService.getSupportedRegions();
      },
      perform_search: async function() {
        this.internal_search_results = [];
        this.search_results_loading = true;
        const result = await apiService.searchDatabase(
          this.query
        );
        this.search_results_loading = false;

        if(!result.success) {
          this.$toastr.e("An error occurred while performing this search.");
          return
        }

        this.internal_search_results = result.search_results;
      },
      download_layer_zip: async function(layer_arn) {
        await apiService.downloadLayer(
          layer_arn
        );
      },
    },
    beforeMount(){
      this.perform_search();
      this.get_supported_regions();
    },
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.search-title {
    padding-bottom: 10px;
}

.main {
    max-width: 700px;
    margin: 0 auto;
    padding-left: 10px;
    padding-right: 10px;
}

h3 {
    margin: 40px 0 0;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    display: inline-block;
    margin: 0 10px;
}
</style>