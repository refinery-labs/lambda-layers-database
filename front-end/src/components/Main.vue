<template>
    <div class="row justify-content-center">
      <div class="col-10">
        <h1>Lambda Layer Database</h1>
        <h2 class="text-muted">
          <i>Created and supported by the <a target="_blank" href="https://refinery.io">Refinery.io team</a></i>
        </h2>
        <div class="w-100">
          <h3 class="search-title"><font-awesome-icon icon="search" /> Search the Database</h3>
          <b-input-group>
            <b-form-input v-on:keyup="performSearch" v-model="query" class="search-box"
                          size="lg" type="search" placeholder="pandoc, git, ssh, chrome..." autofocus>
            </b-form-input>
            <b-input-group-append>
              <b-dropdown v-bind:text="selectedRegion" size="lg" variant="dark">
                <b-dropdown-item v-for="region in supportedRegions" v-bind:key="region"
                                 @click="selectedRegion = region">
                  {{region}}
                </b-dropdown-item>
              </b-dropdown>
            </b-input-group-append>
          </b-input-group>
        </div>
        <hr />
        <b-list-group>
          <b-list-group-item class="d-flex justify-content-between align-items-center text-center" variant="light"
                             v-if="searchResults.length === 0 && searchResultsLoading === false">
            <div class="w-100">
              <h4 class="pt-3" v-if="query === ''">
                No Lambda Layers were found in the database.
              </h4>
              <h4 class="pt-3" v-if="query !== ''">
                No layers matching "{{query}}" were found.
              </h4>
              <h6 class="pb-1 pt-1 font-weight-light">
                <router-link to="/submit">
                  Maybe consider submitting one for the database?
                </router-link>
              </h6>
            </div>
          </b-list-group-item>

          <b-list-group-item v-if="searchResultsLoading" variant="light">
            <h4 class="pt-4 pb-4">
              <b-spinner variant="primary" type="grow" label="Spinning"></b-spinner> Loading search results...
            </h4>
          </b-list-group-item>

          <b-list-group-item style="text-align: left" v-for="(searchResult, index) in searchResults" v-bind:key="index">
            <b>Description: </b> <p style="white-space: pre-wrap; display: inline">{{searchResult.description}}</p>
            <br />
            <span v-if="searchResult.sourceLink.trim() !== '' && !searchResult.sourceLink.toLowerCase().startsWith('javascript')">
              <b>Source: </b> <a v-bind:href="searchResult.sourceLink" target="_blank">{{searchResult.sourceLink}}</a>
            </span>
            <br />
            <span v-if="searchResult.submitterName.trim() !== ''">
              <b>Submitter: </b> {{searchResult.submitterName}}<br />
            </span>
            <span v-if="searchResult.submitterName.trim() === ''">
              <b>Submitter: </b> Anonymous<br />
            </span>

            <span v-if="searchResult.license.trim() !== ''">
              <b>License: </b> {{searchResult.license}}<br />
            </span>

            <hr/>

            <b-input-group class="mt-3">
              <b-form-input v-bind:value="searchResult.layerArn" size="md" readonly></b-form-input>
              <b-input-group-append>
                <b-button variant="primary" size="sm" v-on:click="copyLayerArn(searchResult.layerArn)">
                  <font-awesome-icon icon="copy" />
                  Copy ARN
                </b-button>
              </b-input-group-append>
              <small class="text-muted w-100 pt-sm-1">Copy the above ARN value to access this layer in your Lambda.</small>
            </b-input-group>
            <b-button-group class="pt-2 pb-1 w-100">
              <b-button size="sm" variant="outline-dark" v-on:click="downloadLayerZip(searchResult.layerArn)">
                <font-awesome-icon icon="download" /> Download Layer .zip
              </b-button>

              <b-button size="sm" variant="outline-primary" v-bind:to="'/layer/' + searchResult.id">
                <font-awesome-icon icon="eye" /> View Layer Page
              </b-button>
            </b-button-group>
          </b-list-group-item>
        </b-list-group>
      </div>
    </div>
</template>

<script>
import * as apiService from '../lib/api.js';
import * as utils from '../lib/utils.js';

export default {
  name: 'Main',
  props: {},
  data: function () {
    return {
      query: '',
      internalSearchResults: [],
      searchResultsLoading: false,
      supportedRegions: [],
      selectedRegion: 'us-west-2'
    }
  },
  computed: {
    selectFormattedSupportedRegions() {
      return this.supportedRegions.map(region => {
        return {
          value: region,
          text: region
        }
      })
    },
    searchResults() {
      return this.internalSearchResults.map(searchResult => {
        return {
          ...searchResult,
          layerArn: utils.replaceLayerRegion(
            searchResult.layerArn,
            this.selectedRegion
          )
        }
      });
    }
  },
  methods: {
    copyLayerArn(layerArn) {
      this.$copyText(layerArn);
      this.$toastr.s('Lambda layer ARN copied to clipboard!');
    },
    async getRegionData() {
      this.supportedRegions = await apiService.getSupportedRegions();
    },
    async performSearch() {
      this.searchResultsLoading = true;
      this.internalSearchResults = [];

      try {
        const query = this.query;

        const results = await apiService.searchDatabase(
          query
        );

        // Confirm that the result is still relevant to the currently type data.
        // If not, bail out because we may just be a delayed request.
        if (this.query === query) {
          this.internalSearchResults = results
        }
      } catch (e) {
        this.$toastr.e('An error occurred while performing this search.');
      } finally {
        this.searchResultsLoading = false;
      }
    },
    async downloadLayerZip(layerArn) {
      await apiService.downloadLayer(
        layerArn
      );
    },
  },
  beforeMount() {
    this.performSearch();
    this.getRegionData();
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.search-title {
    padding-bottom: 10px;
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