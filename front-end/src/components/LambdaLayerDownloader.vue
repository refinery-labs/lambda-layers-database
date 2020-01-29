<template>
  <div class="row justify-content-center">
    <div class="col-lg-9">
      <div class="lambda-layer-downloader">
        <h3 class="search-title"><font-awesome-icon icon="download" /> Download Layer <code>.zip</code> by ARN</h3>
        <br />
        <p>
          <b-form-group description="The ARN of the Lambda layer you'd like to download.">
            <b-form-input @change="validateLayer" v-model="layerArn" :state="validLayer" class="search-box" size="lg" type="text" placeholder="arn:aws:lambda:us-west-2:000000000000:layer:example-layer:1" autofocus></b-form-input>
            <b-form-invalid-feedback>
              This is either not a valid Lambda ARN, or attempting to download the layer failed (likely due to it not being mountable from any AWS account).
            </b-form-invalid-feedback>
          </b-form-group>
          <b-button variant="primary" size="lg" v-on:click="downloadSuppliedLayer">
            <font-awesome-icon icon="download" /> Download Lambda Layer
          </b-button>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import * as apiService from '../lib/api.js';

export default {
  name: 'LambdaLayerDownloader',
  props: {},
  data() {
    return {
      layerArn: '',
      validLayer: null
    }
  },
  methods: {
    async validateLayer() {
      this.validLayer = await apiService.isValidAndExistingLayer(
        this.layerArn
      );
    },
    async downloadSuppliedLayer() {
      if (this.layerArn.trim() === '') {
        this.$toastr.e('Please provide a layer ARN to download.');
        return
      }

      const layerExists = await apiService.isValidAndExistingLayer(
        this.layerArn
      );

      if (!layerExists) {
        this.$toastr.e('Could not download layer. Make sure it exists and has the proper permissions set on it.');
        return
      }

      await apiService.downloadLayer(
        this.layerArn
      );

      this.$toastr.s('Lambda layer .zip was downloaded successfully!');

      this.layerArn = '';
      this.validLayer = null;
    }
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