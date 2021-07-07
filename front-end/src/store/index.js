import Vue from 'vue';
import Vuex from 'vuex';
import * as apiService from '../lib/api.js';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    supportedRegions: [],
    lastQuerySearched: '',
    searchResults: null,
    totalResults: 0,
    searchOffset: 0,
    layerInfo: {}
  },
  mutations: {
    setSearchResults(state, {searchResults, totalResults}) {
      state.searchResults = searchResults;
      state.totalResults = totalResults;
    },
    setLastQuerySearched(state, query) {
      state.lastQuerySearched = query;
    },
    setRegionData(state, regionData) {
      state.supportedRegions = regionData;
    },
    setSearchOffset(state, offset) {
      state.searchOffset = offset;
    },
    setLayerInfo(state, {id, layerInfo}) {
      state.layerInfo = {
        ...state.layerInfo,
        [id]: layerInfo
      };
    }
  },
  actions: {
    async searchDatabaseWithQuery(store, {query, offset}) {
      store.commit('setLastQuerySearched', query);
      store.commit('setSearchOffset', offset);

      const result = await apiService.searchDatabase(
        query,
        offset
      );

      // Confirm that the result is still relevant to the currently type data.
      // If not, bail out because we may just be a delayed request.
      // if (state.lastQuerySearched === query && state.searchOffset === offset) {
        store.commit('setSearchResults', result);
      // }
    },
    async getRegionData(store) {
      const supportedRegions = await apiService.getSupportedRegions();

      // TODO: Add Error handling
      store.commit('setRegionData', supportedRegions);
    },
    async resetSearchResults(store) {
      store.commit('setLastQuerySearched', null);
      store.commit('setSearchOffset', 0);
      store.commit('setSearchResults', {
        searchResults: null,
        totalResults: 0
      });
    },
    async getLayerInfo(store, layerId) {
      const internalLayer = await apiService.getLambdaLayerInfo(layerId);

      store.commit('setLayerInfo', {
        id: layerId,
        layerInfo: internalLayer
      });
    }
  },
  modules: {
  }
});
