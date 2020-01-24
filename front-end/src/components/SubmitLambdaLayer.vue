<template>
    <div class="hello mb-5">
        <h1>Submit a New Lambda Layer for the Database</h1>
        <div class="main">
            <b-alert show variant="info">
              <font-awesome-icon icon="info-circle" /> <b>Important!</b>
              <p class="mb-1">
              Confirm that the layer can be imported to other AWS accounts. Layers are private by default.
              </p>
              <span class="mb-0 pb-0">Layers may be made public via the following command:</span>
                <span class="bg-dark p-1 d-block rounded">
                <code class="text-light font-weight-normal">
                  aws lambda add-layer-version-permission --layer-name LAYER_NAME --version-number LAYER_VERSION --statement-id public --action lambda:GetLayerVersion --principal "*" --region us-west-2
                </code>
              </span>
            </b-alert>
            <b-form>
                <b-form-group label="Lambda ARN" description="The ARN of the Lambda layer you'd like added to the database.">
                    <b-form-input @change="validate_layer" :state="valid_layer" v-model="layer_arn" type="text" required placeholder="arn:aws:lambda:us-west-2:000000000000:layer:example-layer:1" autofocus></b-form-input>
                    <b-form-invalid-feedback>
                      This Lambda layer failed our validation check. Ensure your ARN is correct and that you've set the appropriate IAM permissions (see above).
                    </b-form-invalid-feedback>
                </b-form-group>
                <b-form-group label="Source Link" description="A link to a Github, website, or some other page with more information on the layer.">
                    <b-form-input v-model="source_link"  type="text" required placeholder="https://www.example.com/info-on-this-cool-lambda-layer"></b-form-input>
                </b-form-group>
                <b-form-group label="Name/Handle" description="Your name or handle to list on the layer page, leave blank if you don't care to be credited.">
                    <b-form-input v-model="submitter_name" type="text" required placeholder="John Doe"></b-form-input>
                </b-form-group>
                <b-form-group label="Description/README" description="A description of what the layer is and what it does.">
                  <b-form-textarea :state="is_description_valid" v-model="description" placeholder="Enter something..." rows="3" max-rows="6"></b-form-textarea>
                  <b-form-invalid-feedback>
                  The description cannot be empty. Please provide a detailed description for your layer.
                  </b-form-invalid-feedback>
                </b-form-group>
                <b-form-group label="License" description="Any applicable license for this layer. Leave blank for a default license of MIT.">
                  <b-form-input v-model="license" type="text" required placeholder="MIT"></b-form-input>
                </b-form-group>
                <span id="disabled-wrapper" class="w-100" tabindex="0">
                  <b-button class="w-100" v-on:click="submit_layer" v-bind:disabled="!is_form_valid" variant="primary"><font-awesome-icon icon="paper-plane" /> Submit Lambda Layer for Review</b-button>
                </span>
                <b-tooltip placement="bottom" target="disabled-wrapper" v-if="!is_form_valid">
                  Please complete the form before submitting. Make sure there are no errors.
                </b-tooltip>
            </b-form>
        </div>
    </div>
</template>
<script>
import apiService from '../lib/api.js';

/* eslint-disable no-alert, no-console */
const get_default_data = function () {
  return {
    layer_arn: '',
    source_link: '',
    submitter_name: '',
    description: '',
    license: '',
    valid_layer: null,
    valid_description: false
  }
}

export default {
    name: 'SubmitLambdaLayer',
    props: {},
    data: get_default_data,
    computed: {
      is_form_valid: function() {
        return (
          this.valid_layer,
          this.is_description_valid
        )
      },
      is_description_valid: function() {
        return this.description.trim() !== '';
      }
    },
    methods: {
      validate_layer: async function() {
        this.valid_layer = await apiService.isValidAndExistingLayer(
          this.layer_arn
        );
      },
      submit_layer: async function() {
        const submission_data = {
          'layer_arn': this.layer_arn,
          'source_link': this.source_link,
          'submitter_name': this.submitter_name,
          'description': this.description,
          'license': this.license
        };

        await apiService.submitLayerSubmission(
          submission_data
        );

        this.$router.push('/submission-successful');
      }
    }
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

.disabled-wrapper{
  width: 100%;
}
</style>