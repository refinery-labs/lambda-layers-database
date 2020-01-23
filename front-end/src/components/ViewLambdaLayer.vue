<template>
    <div class="main">
      <h1>Lambda Layer Details</h1>
      <b>Description: </b> <p style="white-space: pre-wrap; display: inline">{{layer.description}}</p>
      <br />
      <span v-if="layer.source_link.trim() !== '' && !layer.source_link.toLowerCase().startsWith('javascript')">
        <b>Source: </b> <a v-bind:href="layer.source_link" target="_blank">{{layer.source_link}}</a>
      </span>
      <br />

      <span v-if="layer.submitter_name.trim() !== ''">
        <b>Submitter: </b> {{layer.submitter_name}}<br />
      </span>
      <span v-if="layer.submitter_name.trim() === ''">
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
          <b-form-select v-model="selected_region" :options="select_formatted_supported_regions" size="sm"></b-form-select>
        </span>
      </b-form>
      <br />

      <div class="input-group">
        <b-form-input v-bind:value="layer.layer_arn" disabled></b-form-input>
        <span class="input-group-btn">
          <button class="btn btn-primary" type="button" v-on:click="copy_layer_arn(layer.layer_arn)">
            <font-awesome-icon icon="copy" />
            Copy ARN
          </button>
        </span>
      </div>
      <div class="pt-2 pb-0">
        <b-button block variant="primary" v-on:click="download_layer_zip(layer.layer_arn)">
          <font-awesome-icon icon="download" /> Download Layer .zip
        </b-button>
      </div>
      <hr />
      <b-button class="w-100" to="/" variant="primary"><font-awesome-icon icon="home" /> Back to Lambda Layer Search</b-button>
    </div>
</template>

<script>
import apiService from '../lib/api.js';
import utils from '../lib/utils.js';

/* eslint-disable no-alert, no-console */
export default {
    name: 'ViewLambdaLayer',
    props: {},
    data: function() {
      return {
        internal_layer: {
          'layer_arn': 'arn:aws:lambda:us-west-2:xxxxxxxxxx:layer:Please_Wait:1',
          'source_link': 'https://www.example.com',
          'license': 'Please wait...',
          'submitter_name': 'Please wait...'
        },
        supported_regions: ['us-west-2'],
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
      layer: function() {
        return {
          ...this.internal_layer,
          ...{
            'layer_arn': utils.replaceLayerRegion(
              this.internal_layer.layer_arn,
              this.selected_region
            )
          }
        }
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
      download_layer_zip: async function(layer_arn) {
        await apiService.downloadLayer(
          layer_arn
        );
      },
    },
    async beforeMount(){
      this.get_supported_regions();
      const layerId = this.$route.params.layer_id;
      const layerData = await apiService.getLambdaLayerInfo(layerId);
      this.internal_layer = layerData;
    },
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.main {
    max-width: 600px;
    margin: 0 auto;
    padding-left: 10px;
    padding-right: 10px;
    text-align: left;
}
</style>