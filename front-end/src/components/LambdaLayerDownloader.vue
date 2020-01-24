<template>
    <div class="main mb-5">
        <h3 class="search-title"><font-awesome-icon icon="download" /> Download Layer <code>.zip</code> by ARN</h3>
        <br />
        <p>
          <b-form-group description="The ARN of the Lambda layer you'd like to download.">
            <b-form-input @change="validate_layer" v-model="layer_arn" :state="valid_layer" class="search-box" size="lg" type="text" placeholder="arn:aws:lambda:us-west-2:000000000000:layer:example-layer:1" autofocus></b-form-input>
            <b-form-invalid-feedback>
              This is either not a valid Lambda ARN, or attempting to download the layer failed (likely due to it not being mountable from any AWS account).
            </b-form-invalid-feedback>
          </b-form-group>
          <b-button variant="primary" v-on:click="download_inputted_layer">
            <font-awesome-icon icon="download" /> Download Lambda Layer
          </b-button>
        </p>
    </div>
</template>

<script>
import apiService from '../lib/api.js';

/* eslint-disable no-alert, no-console */
export default {
    name: 'LambdaLayerDownloader',
    props: {},
    data: function() {
      return {
        layer_arn: '',
        valid_layer: null
      }
    },
    methods: {
      validate_layer: async function() {
        const layerExists = await apiService.isValidAndExistingLayer(
          this.layer_arn
        );
        this.valid_layer = layerExists;
      },
      download_inputted_layer: async function() {
        if(this.layer_arn.trim() === '') {
          this.$toastr.e("Please provide a layer ARN to download.");
          return
        }

        const layerExists = await apiService.isValidAndExistingLayer(
          this.layer_arn
        );

        if(!layerExists) {
          this.$toastr.e("Could not download layer. Make sure it exists and has the proper permissions set on it.");
          return
        }

        await apiService.downloadLayer(
          this.layer_arn
        );

        this.$toastr.s("Lambda layer .zip was downloaded successfully!");

        this.layer_arn = '';
        this.valid_layer = null;
      }
    }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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