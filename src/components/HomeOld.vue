<template>
  <div id="home">

    <el-row :gutter="20">
      <el-col :span="8">
        <Rate :rate="fvratioCom" :name="'流量速度比'" :icon="'el-icon-s-data'" :color="'color: #0077E6;'">
        </Rate>
      </el-col>
      <el-col :span="8">
        <Rate :rate="largeratioCom" :name="'大车比例'" :icon="'el-icon-pie-chart'" :color="'color: #E0680D;'"></Rate>
      </el-col>
      <el-col :span="8">
        <Rate :rate="varianceCom" :name="'道路流量方差'" :icon="'el-icon-s-grid'" :color="'color: #069B5A;'"></Rate>
      </el-col>
    </el-row>

    <el-row :gutter="20">

      <el-col :span="16"><span>交通拥堵指数</span></el-col>
      <el-col :span="8"><span></span></el-col>

    </el-row>

    <el-row :gutter="20">
      <!-- 折线图开始 -->
      <el-col :span="16">

        <div class="grid-content bg-purple line-chart-wrapper">
          <div id="line-chart"></div>
        </div>

      </el-col>
      <!-- 折线图结束 -->
      <!-- 时间开始 -->
      <el-col :span="8">

        <CircleClock></CircleClock>

      </el-col>
      <!-- 时间结束 -->
    </el-row>

    <!-- 路段展示开始 -->
    <el-row>
      <span>路况</span>
    </el-row>

    <el-row>

      <el-col :span="24">

        <div class="hmap-wrapper">
          <!-- 地图开始 -->
          <div id="hmap" ref="hmap">

          </div>

          <!-- 自定义组件开始 -->
          <ul id="levelLabelControl">
            <li class="levelBtn" style="background-color: #38A800;">畅通</li>
            <li class="levelBtn" style="background-color: #8BD100;">基本畅通</li>
            <li class="levelBtn" style="background-color: #FFFF00;">轻度拥堵</li>
            <li class="levelBtn" style="background-color: #FF8000;">中度拥堵</li>
            <li class="levelBtn" style="background-color: #FF0000;">严重拥堵</li>
          </ul>
          <!-- 自定义组件结束 -->

          <!-- 地图结束 -->

        </div>

      </el-col>
    </el-row>
    <!-- 路段展示结束 -->

  </div>
</template>

<script>
  import Rate from '../components/Rate'
  import Clock from '../components/Clock'
  import CircleClock from '../components/CircleClock'

  export default {
    name: 'Home',
    components: {
      Rate: Rate,
      Clock: Clock,
      CircleClock: CircleClock
    },
    data() {
      return {
        roads: [],
        todayData: [],
        lastWeekData: [],
        today: null,
        tomorrow: null,
        map: null,
        center: {
          lng: 118.75,
          lat: 30.95
        },
        zoom: 15,
        featureData: {
          fvratio: 0,
          largeratio: 0,
          variance: 0
        },
        polyLines: [],
        levels: [{
          level: 1,
          color: '#38A800'
        }, {
          level: 2,
          color: '#8BD100'
        }, {
          level: 3,
          color: '#FFFF00'
        }, {
          level: 4,
          color: '#FF8000'
        }, {
          level: 5,
          color: '#FF0000'
        }],
      }
    },
    computed : {
      fvratioCom: function () {
        return this.featureData.fvratio.toFixed(2);
      },
      largeratioCom: function () {
        return (this.featureData.largeratio * 100).toFixed(2) + '%';
      },
      varianceCom: function () {
        return this.featureData.variance.toFixed(2);
      }
    },
    mounted() {
      // 请求道路流量数据
      this.load();
    },
    methods: {
      load() {
        this.$axios.get("../../static/json/roadsNow.json")
          .then((res) => {
            // 我这里测试时多了一个.data，后面同理
            var loads = res.data.data.data;
            for (var i = 0; i < loads.length; i++) {
              this.roads.push({
                start_longitude: loads[i].start.longitude,
                start_latitude: loads[i].start.latitude,
                end_longitude: loads[i].end.longitude,
                end_latitude: loads[i].end.latitude,
                id: loads[i].id,
                name: loads[i].name,
                count: loads[i].now.count,
                speed: loads[i].now.speed,
                index: loads[i].now.index,
                level: loads[i].now.level
              });
            }
            console.log('道路流量数据:', this.roads);
          })
          .then(() => {
            // 渲染地图
            this.$options.methods.initMap(this);
          })
          .catch(function (err) {
            console.log(err)
          })

        this.$axios.get("../../static/json/feature.json")
          .then((res) => {
            res = res.data.data.data;
            console.log('特征数据：', res);
            this.featureData.fvratio = res.feature1
            this.featureData.largeratio = res.feature2
            this.featureData.variance = res.feature3
          }).catch(function (err) {
            console.log(err)
          })

        this.$axios.get("../../static/json/indexNow.json")
          .then((res) => {
            // var content=JSON.stringify(res);
            // content=new Blob([content],{type:"test/plain;charset=utf-8"});
            // this.$saver.saveAs(content,"test.json")
            res = res.data.data.data; //获取到数据
            this.today = new Date(res[0].timeLong);
            this.tomorrow = new Date(res[0].timeLong + 86400000);

            for (var i = 0; i < res.length; i++) {
              var item = res[i];
              var date = new Date(item.timeLong);
              this.todayData.push({
                name: date.toString(),
                value: [date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate() +
                  ' ' + (date
                    .getHours()) + ':' +
                  this.$options.methods.formatTime(date.getMinutes().toString()), item
                  .index
                ]
              });
            }
            console.log('今日交通指数', this.todayData);
          })
          .then(() => {
            // 请求上周同期数据
            this.$axios.get("../../static/json/indexNow.json")
              .then((res) => {
                res = res.data.data.data; //获取到数据
                for (var i = 0; i < res.length; i++) {

                  var item = res[i];
                  var date = new Date(item.timeLong);

                  if (i === res.length - 1) {
                    this.lastWeekData.push({
                      name: date.toString(),
                      value: [this.tomorrow.getFullYear() + '/' + this.tomorrow.getMonth() + '/' + this.tomorrow
                        .getDate() +
                        ' ' + (date.getHours()) + ':' +
                        this.$options.methods.formatTime(date.getMinutes().toString()), item.index
                      ]
                    });
                  } else {
                    this.lastWeekData.push({
                      name: date.toString(),
                      value: [this.today.getFullYear() + '/' + this.today.getMonth() + '/' + this.today
                        .getDate() +
                        ' ' + (date.getHours()) + ':' +
                        this.$options.methods.formatTime(date.getMinutes().toString()), item.index
                      ]
                    });
                  }
                }
                console.log('上周同期交通指数', this.lastWeekData);
              })
              .then(() => {
                //折线图
                this.$options.methods.drawChart(this);
              })
              .catch(function (err) {
                console.log(err)
              })
          })
          .catch(function (err) {
            console.log(err)
          })
      },
      drawChart(vm) {
        let lineChart = vm.$echarts.init(document.getElementById('line-chart'));

        var now = new Date(1562011200000);
        console.log(now);

        now.setHours(4);
        now.setMinutes(0);

        // 折线图配置
        let lineOption = {
          tooltip: {
            trigger: 'axis',
            formatter: function (params) {
              params = params[0];
              return params.value[1];
            }
          },
          legend: {
            data: ['今日数据', '上周同期'],
            textStyle: {
              fontSize: 10
            }
          },
          grid: {
            top: '8%',
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'time',
            interval: 3600 * 1000,
            min: now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate() + ' ' + (now
                .getHours()) + ':' + vm
              .$options.methods.formatTime(now.getMinutes().toString()),
            max: now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate() + ' ' + (now
                .getHours() + 20) + ':' +
              vm.$options.methods.formatTime(now.getMinutes().toString()),
            axisLabel: {
              formatter: function (value) {
                var date = new Date(value);
                return date.getHours() + ':' + function (str) {
                  str = '0' + str;
                  return str.substring(str.length - 2);
                }(date.getMinutes().toString());
              },
              fontSize: 10
            },
            splitLine: {
              show: false
            }
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: 10,
            splitArea: {
              show: true,
              areaStyle: {
                color: ['#38A800', '#8BD100', '#FFFF00', '#FF8000', '#FF0000']
              }
            },
            splitLine: {
              show: false
            }
          },
          series: [{
            name: '今日数据',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data: vm.todayData
          }, {
            name: '上周同期',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data: vm.lastWeekData
          }]
        };

        lineChart.setOption(lineOption);
        // 地图
      },
      initMap(vm) {
        vm.map = new BMap.Map(vm.$refs.hmap);
        let point = new BMap.Point(vm.center.lng, vm.center.lat);
        vm.map.centerAndZoom(point, vm.zoom);
        vm.map.enableScrollWheelZoom(true); // 开启鼠标滚轮缩放
        vm.map.setMapStyle({
          style: 'midnight'
        });

        for (var i = 0; i < vm.roads.length; i++) {
          var source = new BMap.Point(vm.roads[i].start_longitude, vm.roads[i].start_latitude);
          var target = new BMap.Point(vm.roads[i].end_longitude, vm.roads[i].end_latitude);
          var drive = vm.$options.methods.getDrive(i, vm);
          drive.search(source, target);
        }

        // 自定义控件
        function LevelLabel() {
          this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
          this.defaultOffset = new BMap.Size(10, 0);
        }

        LevelLabel.prototype = new BMap.Control();
        LevelLabel.prototype.initialize = function () {
          var div = document.getElementById('levelLabelControl');

          vm.map.getContainer().appendChild(div);

          return div;
        }

        var levelLabelControl = new LevelLabel();

        vm.map.addControl(levelLabelControl);
      },
      getDrive(index, vm) {
        return new BMap.DrivingRoute(vm.map, {
          renderOptions: {
            map: vm.map,
            autoViewport: false
          },
          onMarkersSet(pois) {
            // 不显示起始点图标
            let icon = new BMap.Icon("../static/image/icon.png", new BMap.Size(1, 1));
            pois.forEach(function (point) {
              point.marker.setIcon(icon);
            });
          },
          onPolylinesSet(routes) {
            routes.forEach(function (route) {
              vm.polyLines.push(route);

              route.getPolyline().setStrokeOpacity(1);
              route.getPolyline().setStrokeWeight(5);
              // 添加s,t,id,name
              route.getPolyline().s = new BMap.Point(vm.roads[index].start_longitude, vm
                .roads[index]
                .start_latitude);
              route.getPolyline().t = new BMap.Point(vm.roads[index].end_longitude, vm
                .roads[index]
                .end_latitude);
              route.getPolyline().laneId = vm.roads[index].id;
              route.getPolyline().laneName = vm.roads[index].name;
              route.getPolyline().laneCount = vm.roads[index].count;
              route.getPolyline().laneSpeed = vm.roads[index].speed;
              route.getPolyline().laneIndex = vm.roads[index].index;
              route.getPolyline().laneLevel = vm.roads[index].level;
              // 设置颜色
              route.getPolyline().setStrokeColor(vm.levels[route.getPolyline().laneLevel -
                1].color);
              // 添加点击事件
              route.getPolyline().addEventListener('click', function () {
                var opts = {
                  width: 200, // 信息窗口宽度
                  height: 100, // 信息窗口高度
                  title: route.getPolyline().laneName, // 信息窗口标题
                  enableMessage: true, //设置允许信息窗发送短息
                  message: ""
                };
                var infoWindow = new BMap.InfoWindow(
                  `<table style="width: 100%; text-align: center; vertical-align: middle; border-collapse: collapse;">
                      <tr style="background-color: #ccc;">
                        <th style="border: 1px solid black;">流量</th>
                        <th style="border: 1px solid black;">平均速度km/h</th>
                      </tr>
                      <tr>
                        <td style="border: 1px solid black;">${route.getPolyline().laneCount}</td>
                        <td style="border: 1px solid black;">${route.getPolyline().laneSpeed}</td>
                      </tr>
                  </table>`,
                  opts
                ); // 创建信息窗口对象 
                vm.map.openInfoWindow(infoWindow, new BMap.Point((route
                  .getPolyline().s.lng + route
                  .getPolyline().t.lng) / 2, (route.getPolyline()
                  .s.lat + route.getPolyline().t
                  .lat) / 2)); //开启信息窗口
              });
            });
          }
        });
      },
      formatTime(str) {
        str = '0' + str;
        return str.substring(str.length - 2);
      }
    }
  }

</script>

<style scoped>
  #home {
    width: 1140px;
    margin: 0 auto;
  }

  .el-row {
    margin-bottom: 20px;
  }

  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }

  .bg-purple {
    background: #d3dce6;
  }

  .line-chart-wrapper {
    height: 260px;
  }

  #line-chart {
    height: 256px;
  }

  .hmap-wrapper {
    border-radius: 4px;
    border: solid 10px #d3dce6;
  }

  #hmap {
    width: 100%;
    height: 512px;
  }

  #levelLabelControl {
    width: 250px;
    height: 20px;
    background-color: #fff;
    border: 1px solid black;
    box-sizing: border-box;
    list-style: none;
    display: flex;
    flex-direction: row;
    padding: 0;
  }

  .levelBtn {
    width: 50px;
    color: #000;
    text-align: center;
    line-height: 20px;
    font-size: 7px;
  }

</style>
