define(function(require) {
    var util = require('util');
    var _vue = util.getVue();
    console.time('tj')
    var iview = require('iview');
    _vue.use(iview);
    iview.Spin.show();
    var vm = new _vue({
        el: '#roleList',
        data: {
            a: '11'
        },
        mounted: function() {
            this.$nextTick(function() {
                this.$Spin.hide();
            })
        },
        methods: { //methods
            change: function() {
                this.a++;
            }
        }
    })
})