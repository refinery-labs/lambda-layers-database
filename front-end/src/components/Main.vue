<template>
    <div class="row justify-content-center">
      <div class="col-10">
        <h1>Lambda Layer Database</h1>
        <h2 class="text-muted mb-3">
          <i>Created and supported by the <a target="_blank" href="https://refinery.io">Refinery.io team</a></i>
        </h2>
        <hr/>
        <div class="mt-4 mb-3 w-100 text-justify">
          <h3 class="search-title mt-3 pb-2">
            <i class="fas fa-search"></i> Search the Database
          </h3>
          <b-input-group>
            <b-form-input v-on:keyup="performSearch" v-model="query" class="search-box" autofocus
                          size="lg" type="search" placeholder="pandoc, git, ssh, chrome...">
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
          <small class="form-text text-muted">
            Searches layers by name. To get the correct ARN to use, please specify your region. Every layer is available in every region.
          </small>
        </div>
        <hr />
        <div class="mt-4 mb-2 pb-0 text-justify" v-if="searchResults && searchResults.length > 0">
          <h5 v-if="query === ''">
            Available Layers:
          </h5>
          <h5 v-if="query !== ''">
            Found {{searchResults.length}} Matching Layer{{searchResults.length > 1 ? 's' : ''}}:
          </h5>
        </div>

        <!-- TODO refactor into component -->
        <b-button-group class="w-100">
          <b-button size="lg" v-if="searchOffset > 0" v-on:click="previousPage">
            <i class="fas fa-chevron-circle-left"></i> Previous Page
          </b-button>

          <!-- TODO implement page numbers -->
          <b-button v-for="searchResultPage in searchResultPages" v-bind:key="searchResultPage">
            {{searchResultPage}}
          </b-button>

          <b-button size="lg" v-if="(searchTotalResults / 5) > searchOffset && searchTotalResults > 5" v-on:click="nextPage">
            <i class="fas fa-chevron-circle-right"></i> Next Page
          </b-button>
        </b-button-group>
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
                  <i class="fas fa-copy"></i>
                  Copy ARN
                </b-button>
              </b-input-group-append>
              <small class="text-muted w-100 pt-sm-1">Copy the above ARN value to access this layer in your Lambda.</small>
            </b-input-group>
            <b-button-group class="pt-2 pb-1 w-100">
              <b-button size="sm" variant="outline-dark" v-on:click="downloadLayerZip(searchResult.layerArn)">
                <i class="fas fa-download"></i> Download Layer .zip
              </b-button>

              <b-button size="sm" variant="outline-primary" v-bind:to="'/layer/' + searchResult.id">
                <i class="fas fa-eye"></i> View Layer Page
              </b-button>
            </b-button-group>
          </b-list-group-item>
        </b-list-group>

        <!-- TODO refactor into component -->
        <b-button-group class="w-100">
          <b-button size="lg" v-if="searchOffset > 0" v-on:click="previousPage">
            <i class="fas fa-chevron-circle-left"></i> Previous Page
          </b-button>

          <!-- TODO implement page numbers -->
          <b-button v-for="searchResultPage in searchResultPages" v-bind:key="searchResultPage">
            {{searchResultPage}}
          </b-button>

          <b-button size="lg" v-if="(searchTotalResults / 5) > searchOffset && searchTotalResults > 5" v-on:click="nextPage">
            <i class="fas fa-chevron-circle-right"></i> Next Page
          </b-button>
        </b-button-group>
      </div>
    </div>
</template>

<script>
import * as utils from '../lib/utils.js';
import {downloadLayer} from '../lib/utils';

export default {
  name: 'Main',
  props: {},
  data() {
    return {
      query: '',
      searchResultsLoading: false,
      selectedRegion: 'us-west-2',
      searchOffset: 0
    };
  },
  computed: {
    searchResultPages() {
      // TODO implement pages
      return [];
    },
    selectFormattedSupportedRegions() {
      return this.supportedRegions.map(region => {
        return {
          value: region,
          text: region
        };
      })
    },
    supportedRegions() {
      return this.$store.state.supportedRegions;
    },
    searchResults() {
      if (!this.$store.state.searchResults) {
        return [];
      }

      return this.$store.state.searchResults.map(searchResult => {
        return {
          ...searchResult,
          layerArn: utils.replaceLayerRegion(
            searchResult.layerArn,
            this.selectedRegion
          )
        };
      });
    },
    searchTotalResults() {
      return this.$store.state.totalResults;
    }
  },
  methods: {
    copyLayerArn(layerArn) {
      this.$copyText(layerArn);
      this.$toastr && this.$toastr.s('Lambda layer ARN copied to clipboard!');
    },
    async previousPage() {
      this.searchOffset = this.searchOffset - 5;
      await this.search();
    },
    async nextPage() {
      this.searchOffset = this.searchOffset + 5;
      await this.search();
    },
    async search() {
      this.searchResultsLoading = true;

      try {
        await this.$store.dispatch('searchDatabaseWithQuery', {
          query: this.query,
          offset: this.searchOffset
        });
      } catch (e) {
        this.$toastr && this.$toastr.e('An error occurred while performing this search.');
      } finally {
        this.searchResultsLoading = false;
      }
    },
    async performSearch() {
      await this.$store.dispatch('resetSearchResults');
      await this.search();
    },
    async downloadLayerZip(layerArn) {
      await downloadLayer(
        layerArn
      );
    },
    getRegionData() {
      return this.$store.dispatch('getRegionData');
    }
  },
  // TODO: Pass state from server to client so that we don't have to make requests again
  async beforeMount() {
    if (!this.searchTotalResults) {
      await this.performSearch();
    }

    if (!this.supportedRegions) {
      await this.getRegionData();
    }
  },
  async serverPrefetch() {
    await this.performSearch();
    await this.getRegionData();
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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