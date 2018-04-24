require.config({
    map: {
        "*": {
            "css": "../../../plugin/requirejs-css/0.1.10/css.min",
            "text": "../../../plugin/requirejs-text/2.0.15/text"
        }
    },
    paths: {
        'vue': '../../../plugin/vue/2.5.13/vue',
        'iview': '../../../plugin/iview/2.8.0/iview',
        'vueX': '../../../plugin/vuex/2.5.0/vuex',
        'vueresource': '../../../plugin/vue-resource/1.5.0/vue-resource.min',
        'util': '../../../all-resource/util/vue-util',
        'jquery': '../../../plugin/jquery/1.8.3/jquery-1.8.3',
        'main': 'main'
    },
    shim: {
        'iview': ['css!../../../plugin/iview/2.8.0/styles/iview.css'],
        'main': ['css!../../css/main.css']
    }
});
require(['main'])