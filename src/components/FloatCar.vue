<template>
  <div id="float">
    <div class="fmap-wrapper">
      <div id="float-map" ref="fmap"></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'FloatCar',
    data() {
      return {
        mapv: null, // mapv库
        mapvgl: null, // mapvgl库
        three: null, // threeLayer.js
        map: null,
        heatmap: null,
        center: {
          lng: 118.75,
          lat: 30.95
        },
        zoom: 15,
        floats: [], // 浮动车数据
        maxTime: 0
      }
    },
    mounted() {
      // 加载数据
      this.load();
    },
    methods: {
      load() {
        this.$axios.get("http://47.97.221.36:8081/car/now")
          .then((res) => { // 用箭头函数的形式，内部this指向vue对象
            res = res.data.data;
            for (var i = 0; i < res.length; i++) {
              var point = res[i].position;
              this.floats.push({
                geometry: {
                  type: 'Point',
                  coordinates: [+point['longitude'], +point['latitude']]
                },
                properties: {
                  count: 1
                }
              });
            }
            console.log('浮动车数据：', this.floats);
          })
          .then(() => {
            // 渲染地图
            this.$options.methods.initMap(this);
            this.$options.methods.draw(this);
          })
          .catch(function (err) {
            console.log(err);
          });
      },
      initMap(vm) {
        // 引入百度地图可视化库
        vm.mapv = require('mapv');
        vm.mapvgl = require('mapvgl');
        vm.three = require('../../node_modules/mapvgl/dist/mapvgl.threelayers.min.js');
        var darkStyle = require('../../static/js/darkStyle');
        console.log(darkStyle);
        // 初始化地图底图
        vm.map = new BMapGL.Map(vm.$refs.fmap, darkStyle.default);
        let point = new BMapGL.Point(vm.center.lng, vm.center.lat);
        vm.map.centerAndZoom(point, vm.zoom);
        vm.map.enableScrollWheelZoom(true);
        vm.map.setHeading(64.5); // 设置地图旋转角度
        vm.map.setTilt(50); // 设置倾角
      },
      draw(vm) {
        // 可视化浮动车数据
        var view = new vm.mapvgl.View({
          map: vm.map
        });
        // 热力图图层
        vm.heatmap = new vm.mapvgl.HeatmapLayer({
          size: 60, // 单个点绘制大小
          max: 40, // 最大阈值,没整明白干啥的
          gradient: { // 对应比例渐变色
            0.25: 'rgba(89, 233, 179, 1)',
            0.55: 'rgba(182, 243, 147, 1)',
            0.85: 'rgba(254, 255, 140, 1)',
            0.9: 'rgba(217, 29, 28, 1)'
          }
        });
        
        view.addLayer(vm.heatmap);
        vm.heatmap.setData(vm.floats);
      }
    }
  }

</script>

<style scoped>
  #float {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    min-height: 100%;
    height: auto;
    box-sizing: border-box;
  }

  #float-map {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    min-height: 100%;
    height: auto;
  }

</style>
