<template>
    <div id="app">
        <router-view></router-view>
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