<template>
    <div>
        <b-navbar toggleable="lg" type="dark" class="navbar-overrides">
            <b-navbar-brand to="/">Lambda Layer Database</b-navbar-brand>
            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
            <b-collapse id="nav-collapse" is-nav>
                <b-navbar-nav>
                    <b-nav-item class="navbar-link-color" to="/layer-downloader">
                      <font-awesome-icon icon="download" /> Lambda Layer Downloader
                    </b-nav-item>
                    <b-nav-item class="navbar-link-color" to="/submit">
                      <font-awesome-icon icon="plus" /> Submit Layer to Database
                    </b-nav-item>
                </b-navbar-nav>
                <b-navbar-nav class="ml-auto">
                    <b-nav-item class="navbar-link-color" target="_blank" href="https://github.com/refinery-labs/lambda-layers-database">
                      <font-awesome-icon :icon="['fab', 'github']" /> View Repo
                    </b-nav-item>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
        <div id="app">
            <router-link to="/"><img class="logo" alt="Lambda Layer Database logo" src="./assets/logo.png"></router-link>
            <router-view></router-view>
        </div>
    </div>
</template>
<script>
export default {
    name: 'app',
    components: {}
}
</script>
<style>
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}

.logo {
    padding: 10px;
}

.navbar-overrides {
  background-color: #6540fb !important;
}

.navbar-link-color>a {
  color: #FFFFFF !important;
}
</style>