<template>
  <div id="float">
    <el-container>
      <el-main>
        <el-row :gutter="20">
          <el-col :span="24">
            <h1>浮动车数据展示</h1>
            <div id="fmap" ref="fmap">

            </div>
          </el-col>
        </el-row>
      </el-main>
    </el-container>

  </div>
</template>

<script>
  // import * as mapvgl from 'mapvgl'
  // import * as mapv from 'mapv'
  export default {
    name: 'FloatCar',
    data() {
      return {
        mapv: null,
        map: null,
        center: {
          lng: 118.75,
          lat: 30.95
        },
        zoom: 15,
        floats: [],
        maxTime: 0
      }
    },
    mounted() {
      this.load();
    },
    methods: {
      load() {
        this.$axios.get("http://localhost:8080/static/csv/tab_fcd.csv")
          .then((res) => {
            var csv = res.data;
            var json = this.$papa.parse(csv, {
              delimiter: ",",
              header: true
            }).data;
            // 去除空行
            json.splice(json.length - 1, 1);
            console.log("浮动车数据", json);

            var travelID = json[0].TRAVELID;
            var track = [];
            for (let i = 1; i < json.length; i++) {
              if (json[i].TRAVELID === travelID) {
                track.push({
                  travelID: json[i].TRAVELID,
                  time: json[i].sj,
                  laneID: json[i].laneid,
                  lng: json[i].longitude,
                  lat: json[i].latitude
                });
              } else {
                if (track.length >= 5)
                  this.floats.push(track);
                travelID = json[i].TRAVELID;
                track = [{
                  travelID: json[i].TRAVELID,
                  time: json[i].sj,
                  laneID: json[i].laneid,
                  lng: json[i].longitude,
                  lat: json[i].latitude
                }];
              }
            }
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
        vm.map = new BMap.Map(vm.$refs.fmap);
        let point = new BMap.Point(vm.center.lng, vm.center.lat);
        vm.map.centerAndZoom(point, vm.zoom);
        vm.map.enableScrollWheelZoom(true);
        vm.map.setMapStyle({
            style: 'midnight'
        });
        // npm install mapv
        // require here
        vm.mapv = require('mapv');
      },
      draw(vm) {
        var timeData = [];
        var data = [];
        console.log('FloatsData:', vm.$data.floats);
        for (let i = 0; i < vm.floats.length; i++) {
          var coordinates = [];
          for (let j = 0; j < vm.floats[i].length; j++) {
            if (j > vm.maxTime)
              vm.maxTime = j;
            coordinates.push([vm.floats[i][j].lng, vm.floats[i][j].lat]);
            timeData.push({
              geometry: {
                type: 'Point',
                coordinates: [vm.floats[i][j].lng, vm.floats[i][j].lat],
              },
              count: 1,
              time: j
            });
          }
          data.push({
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            }

          });
        }

        console.log('data:', data);
        console.log('timeData:', timeData);

        var dataSet = new vm.mapv.DataSet(data);

        var options = {
          strokeStyle: 'rgba(53,57,255,0.5)',
          shadowColor: 'rgba(53,57,255,0.2)',
          shadowBlur: 3,
          lineWidth: 3.0,
          draw: 'simple'
        };

        var mapvLayer = new vm.mapv.baiduMapLayer(vm.map, dataSet, options);

        var dataSet = new vm.mapv.DataSet(timeData);

        console.log('max time:', vm.maxTime);
        var options = {
          fillStyle: 'rgba(255, 250, 250, 0.2)',
          globalCompositeOperation: "lighter",
          size: 1.5,
          animation: {
            stepsRange: {
              start: 0,
              end: vm.maxTime
            },
            trails: 3,
            duration: 5,
          },
          draw: 'simple'
        }

        var mapvLayer = new vm.mapv.baiduMapLayer(vm.map, dataSet, options);
      }
    }
  }

</script>

<style scoped>
  #float {
    width: 1024px;
  }

  .el-row {
    margin-bottom: 20px;
  }

  .el-col {
    background-color: #1350d3;
    color: #fff;
    padding: 0 10px 10px;
  }

  #fmap {
    width: 100%;
    height: 512px;
  }

</style>
