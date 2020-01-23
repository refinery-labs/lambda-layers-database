<template>
    <div class="main">
      <b-alert variant="success" show>
        <h1><font-awesome-icon icon="check-circle" /> Submission received successfully.</h1>
        <p>
          Thanks for your submission, we will review it shortly.
        </p>
      </b-alert>
      <hr />
      <b-button class="w-100" to="/" variant="primary"><font-awesome-icon icon="home" /> Back to Homepage</b-button>
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
.main {
    max-width: 600px;
    margin: 0 auto;
    padding-left: 10px;
    padding-right: 10px;
    text-align: center;
}
</style>