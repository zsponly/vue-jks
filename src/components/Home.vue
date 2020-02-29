<template>
  <div id="home">

    <el-container>
      <el-main>
        <el-row :gutter="20">

          <el-col :span="16">
            <h1>交通拥堵指数</h1>
            <div id="line-chart"></div>
          </el-col>

          <el-col :span="8">
            <h1>主要交通指标</h1>
            <div id="pie-chart"></div>
            <el-table :data="featureData" border style="width: 100%">
              <el-table-column prop="vcratio" label="流量/车速" width="100">
              </el-table-column>
              <el-table-column prop="largeratio" label="大车比例" width="80">
              </el-table-column>
              <el-table-column prop="variance" label="不同车道占比方差">
              </el-table-column>
            </el-table>
          </el-col>

        </el-row>
        <el-row :gutter="20">

          <el-col :span="24">
            <h1>路况</h1>
            <div id="hmap" ref="hmap">

            </div>

            <ul id="levelLabelControl">
              <li class="levelBtn" style="background-color: #38A800;">畅通</li>
              <li class="levelBtn" style="background-color: #8BD100;">基本畅通</li>
              <li class="levelBtn" style="background-color: #FFFF00;">轻度拥堵</li>
              <li class="levelBtn" style="background-color: #FF8000;">中度拥堵</li>
              <li class="levelBtn" style="background-color: #FF0000;">严重拥堵</li>
            </ul>

          </el-col>
        </el-row>

      </el-main>

    </el-container>
  </div>
</template>

<script>
  export default {
    name: 'Home',
    data() {
      return {
        roads: [],
        map: null,
        center: {
          lng: 118.75,
          lat: 30.95
        },
        zoom: 15,
        featureData: [{
          vcratio: 10,
          largeratio: 10,
          variance: 10
        }],
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
    mounted() {
      // 请求道路流量数据
      this.load();
      this.drawChart();
    },
    methods: {
      load() {
        var loads;
        this.$axios.get("http://localhost:8080/static/json/roads_test.json")
          .then((res) => {
            console.log('respond:', res);
            this.roads = res.data.roads;
            /* loads=res.data.data;
            for (var i = 0; i < loads.length; i++) {
              this.roads.push({
                start_longitude:loads[i].start.longitude,
                start_dimension:loads[i].start.dimension,
                end_longitude:loads[i].end.longitude,
                end_dimension:loads[i].end.dimension,
                id: loads[i].id,
                name: loads[i].name,
                count: loads[i].now.count,
                speed: loads[i].now.speed,
                index: loads[i].now.index,
                level: loads[i].now.level
              })
            } */
            console.log('道路流量数据:', this.roads)
          })
          .then(() => {
            // 渲染地图
            this.$options.methods.initMap(this);
          })
          .catch(function (err) {
            console.log(err)
          })
      },
      drawChart() {
        let lineChart = this.$echarts.init(document.getElementById('line-chart'));

        var data = [];
        var now = new Date();
        now.setHours(4);
        now.setMinutes(0);
        var fiveMinutes = 300 * 1000;

        for (let i = 0; i < 100; i++) {
          let date = new Date(+now + fiveMinutes * i);
          data.push({
            name: date.toString(),
            value: [date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate() + ' ' + (date.getHours()) + ':' +
              this.$options.methods.formatTime(date.getMinutes().toString()), Math.random() * 10
            ]
          });
        }
        console.log('DATA', data);

        let lineOption = {
          tooltip: {
            trigger: 'axis',
            formatter: function (params) {
              params = params[0];
              return params.value[1];
            }
          },
          legend: {
            data: ['今日数据', '上周同期']
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
            min: now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate() + ' ' + (now.getHours()) + ':' + this
              .$options.methods.formatTime(now.getMinutes().toString()),
            max: now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate() + ' ' + (now.getHours() + 20) + ':' +
              this.$options.methods.formatTime(now.getMinutes().toString()),
            axisLabel: {
              formatter: function (value) {
                var date = new Date(value);
                return date.getHours() + ':' + function (str) {
                  str = '0' + str;
                  return str.substring(str.length - 2);
                }(date.getMinutes().toString());
              },
              fontSize: 10
            }
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: 10
          },
          series: [{
            name: '今日数据',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data: data
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
          var source = new BMap.Point(vm.roads[i].start_longitude, vm.roads[i].start_dimension);
          var target = new BMap.Point(vm.roads[i].end_longitude, vm.roads[i].end_dimension);
          var drive = vm.$options.methods.getDrive(i, vm);
          drive.search(source, target);
        }

        // 自定义控件
        function LevelLabel() {
          this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;
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
              route.getPolyline().s = new BMap.Point(vm.roads[index].start_longitude, vm.roads[index]
                .start_dimension);
              route.getPolyline().t = new BMap.Point(vm.roads[index].end_longitude, vm.roads[index]
                .end_dimension);
              route.getPolyline().laneId = vm.roads[index].id;
              route.getPolyline().laneName = vm.roads[index].name;
              route.getPolyline().laneCount = vm.roads[index].count;
              route.getPolyline().laneSpeed = vm.roads[index].speed;
              route.getPolyline().laneIndex = vm.roads[index].index;
              route.getPolyline().laneLevel = vm.roads[index].level;
              // 设置颜色
              route.getPolyline().setStrokeColor(vm.levels[route.getPolyline().laneLevel - 1].color);
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
                        <th style="border: 1px solid black;">路段</th>
                        <th style="border: 1px solid black;">流量</th>
                        <th style="border: 1px solid black;">平均速度km/h</th>
                      </tr>
                      <tr>
                        <td style="border: 1px solid black;">${route.getPolyline().laneName}</td>
                        <td style="border: 1px solid black;">${route.getPolyline().laneCount}</td>
                        <td style="border: 1px solid black;">${route.getPolyline().laneSpeed}</td>
                      </tr>
                  </table>`,
                  opts
                ); // 创建信息窗口对象 
                vm.map.openInfoWindow(infoWindow, new BMap.Point((route.getPolyline().s.lng + route
                  .getPolyline().t.lng) / 2, (route.getPolyline().s.lat + route.getPolyline().t
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
    width: 1024px;
  }

  .el-row {
    margin-bottom: 20px;
  }

  .el-col {
    min-height: 36px;
    background-color: #1350d3;
    color: #fff;
    padding: 0 10px 10px;
  }

  #line-chart,
  .el-table {
    height: 256px;
    background-color: #fff;
  }

  #hmap {
    width: 100%;
    height: 512px;
  }

  #levelLabelControl {
    width: 200px;
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
    width: 40px;
    color: #000;
    text-align: center;
    line-height: 20px;
    font-size: 7px;
  }

</style>
