<template>

  <div class="row justify-content-center">
    <div class="col-lg-8">
      <div class="successful-submission text-justify">
        <b-alert variant="success" show>
          <h1><i class="fas fa-check-circle"></i> Submission received successfully.</h1>
          <p>
            Thanks for your submission, we will review it shortly.
          </p>
        </b-alert>
        <hr />
        <b-button class="w-100" to="/" variant="primary">
          <i class="fas fa-home"></i> Back to Homepage
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>

/* eslint-disable no-alert, no-console */
export default {
  name: 'SuccessfulSubmission',
  props: {}
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>