<template>
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <div class="view-lambda-layer">
        <h1>Lambda Layer Details</h1>
        <hr/>
        <div class="text-center text-muted" v-if="loading">
          <h1 class="pt-2">
            Loading... <b-spinner type="grow" label="Spinning"></b-spinner>
          </h1>
        </div>
        <div class="text-center" v-if="error">
          <h1 class="pt-2 text-error">
            Error: Unable to load layer.
          </h1>
        </div>
        <div class="text-justify pt-2" v-if="!loading">
          <b>Description: </b> <p style="white-space: pre-wrap; display: inline">{{layer.description}}</p>
          <br />
          <span v-if="layer.sourceLink.trim() !== '' && !layer.sourceLink.toLowerCase().startsWith('javascript')">
            <b>Source: </b> <a v-bind:href="layer.sourceLink" target="_blank">{{layer.sourceLink}}</a>
          </span>
          <br />

          <span v-if="layer.submitterName.trim() !== ''">
            <b>Submitter: </b> {{layer.submitterName}}<br />
          </span>
          <span v-if="layer.submitterName.trim() === ''">
            <b>Submitter: </b> Anonymous<br />
          </span>

          <span v-if="layer.license.trim() !== ''">
            <b>License: </b> {{layer.license}}<br />
          </span>
          <b-form inline>
            <label class="mr-2">
              <b>AWS Region: </b>
            </label>
            <span class="input-group-btn">
              <b-form-select v-model="selectedRegion" :options="selectFormattedSupportedRegions" size="sm"></b-form-select>
            </span>
          </b-form>
          <hr />

          <b-input-group class="mt-3">
            <b-form-input v-bind:value="layer.layerArn" size="md" readonly></b-form-input>
            <b-input-group-append>
              <b-button variant="primary" size="sm" v-on:click="copyLayerArn(layer.layerArn)">
                <i class="fas fa-copy"></i>
                Copy ARN
              </b-button>
            </b-input-group-append>
            <small class="text-muted w-100 pt-sm-1">
              Copy the above ARN value to access this layer in your Lambda.
            </small>
          </b-input-group>
          <b-button-group class="pt-2 pb-1 w-100">
            <b-button size="sm" variant="outline-dark" v-on:click="downloadLayerZip(layer.layerArn)">
              <i class="fas fa-download"></i> Download Layer .zip
            </b-button>
          </b-button-group>

          <hr />
          <b-button size="sm" class="w-100" to="/" variant="primary">
            <i class="fas fa-home"></i> Back to Lambda Layer Search
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as apiService from '../lib/api.js';
import * as utils from '../lib/utils.js';
import {downloadLayer} from '../lib/utils';

/* eslint-disable no-alert, no-console */
export default {
  name: 'ViewLambdaLayer',
  props: {},
  data() {
    return {
      loading: false,
      error: null,
      internalLayer: {
        layerArn: 'arn:aws:lambda:us-west-2:xxxxxxxxxx:layer:Please_Wait:1',
        sourceLink: 'https://www.example.com',
        license: 'Please wait...',
        submitterName: 'Please wait...'
      },
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
    currentlySelectedLayer() {
      return this.$route.params.layerId;
    },
    layer() {
      const internalLayer = this.$store.state.layerInfo[this.currentlySelectedLayer];

      if (!internalLayer) {
        return null;
      }

      return {
        ...internalLayer,
        layerArn: utils.replaceLayerRegion(
          internalLayer.layerArn,
          this.selectedRegion
        )
      }
    },
    supportedRegions() {
      const regions = this.$store.state.supportedRegions;
      if (!regions || regions.length === 0) {
        return ['us-west-2'];
      }

      return regions;
    }
  },
  methods: {
    copyLayerArn(layerArn) {
      this.$copyText(layerArn);
      this.$toastr && this.$toastr.s('Lambda layer ARN copied to clipboard!');
    },
    async downloadLayerZip(layerArn) {
      await downloadLayer(
        layerArn
      );
    },
    async getLayerContents() {
      const layerId = this.currentlySelectedLayer;
      try {
        await this.$store.dispatch('getLayerInfo', layerId);
      } catch (e) {
        this.error = 'Unable to load layer';
      } finally {
        this.loading = false;
      }
    },
    getRegionData() {
      return this.$store.dispatch('getRegionData');
    }
  },
  async beforeMount() {
    if (!this.layer) {
      this.loading = true;
      await this.getLayerContents();
      this.loading = false;
    }

    const regions = this.$store.state.supportedRegions;
    if (!regions || regions.length === 0) {
      await this.getRegionData();
    }
  },
  async serverPrefetch() {
    await this.getLayerContents();
    await this.getRegionData();
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>