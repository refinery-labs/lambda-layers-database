<template>
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <h1>Submit New Lambda Layer</h1>
      <hr>
      <div class="ml-2 mr-2">
        <p class="text-justify">
          This form allows you to request a new layer to be added to the list of entries. Upon submission, your layer will be submitted for review by our team. Once approved, it will be available for general use.
        </p>
      </div>
      <hr>
          <div class="col-lg-10 ml-auto mr-auto">
            <div class="submit-lambda-layer text-justify">
              <b-alert show variant="info">
                <i class="fas fa-info-circle"></i> <b>Important!</b>
                <p class="mb-2">
                  Confirm that the layer can be imported to other AWS accounts. By default all Lambda layers are private.
                </p>
                <span class="mb-0 pb-0">Layers may be made public via the following command:</span>
                  <span class="bg-dark p-1 d-block rounded text-left">
                  <code class="text-light font-weight-normal">
                    <div class="pl-1">
                      aws lambda add-layer-version-permission \ <br>
                      <div class="pl-2">
                        --layer-name LAYER_NAME \ <br>
                        --version-number LAYER_VERSION \ <br>
                        --statement-id public \ <br>
                        --action lambda:GetLayerVersion \ <br>
                        --principal "*" \ <br>
                        --region us-west-2
                      </div>
                    </div>
                  </code>
                </span>
              </b-alert>
              <b-form>
                <b-form-group label="Lambda ARN" description="The ARN of the Lambda layer you'd like added to the database.">
                  <b-form-input @change="validateLayer" :state="validLayer" v-model="layerArn" type="text" required placeholder="arn:aws:lambda:us-west-2:000000000000:layer:example-layer:1" autofocus></b-form-input>
                  <b-form-invalid-feedback>
                    This Lambda layer failed our validation check. Ensure your ARN is correct and that you've set the appropriate IAM permissions (see above).
                  </b-form-invalid-feedback>
                </b-form-group>
                <b-form-group label="Source Link" description="A link to a Github, website, or some other page with more information on the layer.">
                  <b-form-input v-model="sourceLink"  type="text" required placeholder="https://www.example.com/info-on-this-cool-lambda-layer"></b-form-input>
                </b-form-group>
                <b-form-group label="Name/Handle" description="Your name or handle to list on the layer page, leave blank if you don't care to be credited.">
                  <b-form-input v-model="submitterName" type="text" required placeholder="John Doe"></b-form-input>
                </b-form-group>
                <b-form-group label="Description/README" description="A description of what the layer is and what it does.">
                  <b-form-textarea :state="isDescriptionValid" v-model="description" placeholder="Enter something..." rows="3" max-rows="6"></b-form-textarea>
                  <b-form-invalid-feedback>
                  The description cannot be empty. Please provide a detailed description for your layer.
                  </b-form-invalid-feedback>
                </b-form-group>
                <b-form-group label="License" description="Any applicable license for this layer. Leave blank for a default license of MIT.">
                  <b-form-input v-model="license" type="text" required placeholder="MIT"></b-form-input>
                </b-form-group>
                <span id="disabled-wrapper" class="w-100" tabindex="0">
                  <b-button class="w-100" v-on:click="submitLayer" v-bind:disabled="!isFormValid" variant="primary" size="lg">
                    <i class="fas fa-paper-plane"></i> Submit Lambda Layer for Review
                  </b-button>
                </span>
                <b-tooltip placement="bottom" target="disabled-wrapper" v-if="!isFormValid">
                  Please complete the form before submitting. Make sure there are no errors.
                </b-tooltip>
              </b-form>
            </div>
          </div>
        </div>
  </div>
</template>
<script>
import * as apiService from '../lib/api.js';

function getDefaultData() {
  return {
    layerArn: '',
    sourceLink: '',
    submitterName: '',
    description: '',
    license: '',
    validLayer: null,
    validDescription: false
  }
}

export default {
  name: 'SubmitLambdaLayer',
  props: {},
  data: getDefaultData,
  computed: {
    isFormValid() {
      return this.validLayer && this.isDescriptionValid;
    },
    isDescriptionValid() {
      return this.description.trim() !== '';
    }
  },
  methods: {
    async validateLayer() {
      this.validLayer = await apiService.isValidAndExistingLayer(
        this.layerArn
      );
    },
    async submitLayer() {
      const submissionData = {
        layerArn: this.layerArn,
        sourceLink: this.sourceLink,
        submitterName: this.submitterName,
        description: this.description,
        license: this.license
      };

      await apiService.submitLayerSubmission(
        submissionData
      );

      await this.$router.push('/submission-successful');
    }
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.disabled-wrapper{
  width: 100%;
}
</style>