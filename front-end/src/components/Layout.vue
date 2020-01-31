<template>
  <div>
    <b-navbar id="nav" toggleable="lg" type="dark" class="navbar-overrides">
      <b-navbar-brand to="/">Lambda Layer Database</b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item class="navbar-link-color" to="/layer-downloader">
            <i class="fas fa-download"></i>Lambda Layer Downloader
          </b-nav-item>
          <b-nav-item class="navbar-link-color" to="/submit">
            <i class="fas fa-plus"></i> Submit Layer to Database
          </b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item class="navbar-link-color" target="_blank" href="https://github.com/refinery-labs/lambda-layers-database">
            <i class="fab fa-github"></i> View Repo
          </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <div class="container main mt-5 mb-5">
      <router-link to="/"><img class="logo" alt="Lambda Layer Database logo" src="../assets/logo.png"></router-link>
      <router-view></router-view>
    </div>
  </div>
</template>
