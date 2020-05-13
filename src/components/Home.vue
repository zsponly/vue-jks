<template>

  <!-- 主界面开始 -->
  <div id="home">

    <!-- 页面主体开始 -->
    <div class="content-wrapper">

      <!-- 地图开始 -->
      <div id="home-map" ref="hmap"></div>
      <!-- 自定义组件开始 -->
      <ul id="levelLabelControl">
        <li class="levelBtn" style="background-color: #00A5C9;">状态一</li>
        <li class="levelBtn" style="background-color: #8BD100;">状态二</li>
        <li class="levelBtn" style="background-color: #6701AB;">状态三</li>
        <li class="levelBtn" style="background-color: #FF8000;">状态四</li>
        <!-- <li class="levelBtn" style="background-color: #FF0000;">状态五</li> -->
        <!-- <li class="levelBtn" style="background-color: #C3017C;">状态六</li>
        <li class="levelBtn" style="background-color: #38A800;">状态七</li> -->
      </ul>
      <!-- 自定义组件结束 -->
      <!-- 路段信息展示开始 -->
      <el-dialog :title="selRoad[0].name" :visible.sync="dialogVisible" width="30%" @close="onCloseDialog">
        <el-table :data="selRoad" max-height="500" :cell-style="cellStyle" :header-cell-style="rowClass">
          <el-table-column prop="id" label="路段ID" align="left">
          </el-table-column>
          <el-table-column label="当前状态" align="left">
            <template slot-scope="scope">
              <StatusLabel :status="+scope.row.status"></StatusLabel>
            </template>
          </el-table-column>
          <el-table-column v-if="forecastModeOn" label="预测流量" align="left">
            <template slot-scope="scope">
              <StatusLabel :msg="+scope.row.flowForecast" :status="0"></StatusLabel>
            </template>
          </el-table-column>
          <el-table-column v-if="forecastModeOn" label="预测状态" align="left">
            <template slot-scope="scope">
              <StatusLabel :status="+scope.row.statusForecast"></StatusLabel>
            </template>
          </el-table-column>
        </el-table>
        <el-tabs type="border-card" class="road-analysis-wrapper bg-transparent" v-loading="selRoad[0].loading"
          element-loading-text="拼命加载中..." element-loading-background="rgba(0, 0, 0, 0.8)">
          <el-tab-pane label="路段流量分析">
            <div id="flow-chart"></div>
          </el-tab-pane>
          <el-tab-pane label="路段车速分析">
            <div id="speed-chart"></div>
          </el-tab-pane>
        </el-tabs>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="onCloseDialog">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 路段信息展示结束 -->
      <!-- 地图结束 -->

      <!-- 功能模块开始 -->

      <div id="left-boards">
        <el-collapse-transition>
          <div v-show="forecastModeOn">
            <div class="forecast-step-wrapper bg-transparent">
              <div class="board-title">预测间隔</div>
            </div>
            <el-radio-group v-model="step" @change="stepChanged">
              <el-radio-button :label="5">5分钟</el-radio-button>
              <el-radio-button :label="10">10分钟</el-radio-button>
              <el-radio-button :label="15">15分钟</el-radio-button>
            </el-radio-group>
          </div>
        </el-collapse-transition>

        <div class="rates bg-transparent">
          <div class="board-title">
            路网交通指数
            <div>
              <span :class="{ active: forecastModeOn }">预测</span>
              <el-switch v-model="forecastModeOn" active-color="#13ce66" inactive-color="#ff4949">
              </el-switch>
            </div>
          </div>

          <div class="rates-content">
            <!-- 实时数据开始 -->
            <SquareRate v-show="!forecastModeOn" :rate="fvratioCom" :name="'流量速度比'" :suffix="'vec/km'">
            </SquareRate>
            <SquareRate v-show="!forecastModeOn" :rate="largeratioCom" :name="'大车比例'" :suffix="'％'">
            </SquareRate>
            <SquareRate v-show="!forecastModeOn" :rate="varianceCom" :name="'道路流量方差'" :suffix="''">
            </SquareRate>
            <SquareRate v-show="!forecastModeOn" :rate="speedCom" :name="'通行速度'" :suffix="'km/h'">
            </SquareRate>
            <SquareRate v-show="!forecastModeOn" :rate="flowCom" :name="'交通流量'" :suffix="'veh/h'">
            </SquareRate>
            <!-- 实时数据结束 -->

            <!-- 预测数据开始 -->
            <SquareRate v-show="forecastModeOn" :rate="flowForecastCom" :name="'交通流量'" :suffix="'veh/h'">
            </SquareRate>
            <!-- 预测数据结束 -->
          </div>

        </div>

      </div>

      <div id="right-boards">

        <div class="weather-clock">

          <CircleClock @refresh="refresh"></CircleClock>

        </div>

        <el-tabs type="border-card" class="line-chart-wrapper bg-transparent">
          <el-tab-pane label="交通状态分布">
            <div id="pie-chart"></div>
          </el-tab-pane>
          <el-tab-pane label="路网车流量趋势">
            <div id="line-chart"></div>
          </el-tab-pane>
        </el-tabs>

      </div>

      <!-- 功能模块结束 -->

    </div>
    <!-- 页面主体结束 -->

  </div>
  <!-- 主界面结束 -->

</template>

<script>
  import SquareRate from '../components/SquareRate'
  import StatusLabel from '../components/StatusLabel'
  import CircleClock from '../components/CircleClock'

  export default {
    name: 'Home',
    components: {
      SquareRate: SquareRate,
      StatusLabel: StatusLabel,
      CircleClock: CircleClock
    },
    data() {
      return {
        timer: null,
        refreshMap: null,
        forecastModeOn: false,
        step: 5,
        dialogVisible: false,
        roads: new Array(481),
        newRoads: [], // 用来判断那条路需要更新
        mapRoutes: new Array(481), // 地图上的路
        selRoad: [{
          name: '',
          id: '',
          status: 0,
          flowForecast: 0,
          statusForecast: 0,
          loading: true
        }],
        forecastData: {
          flow: 0,
          statusData: [{
            value: 0,
            name: "状态一"
          }, {
            value: 0,
            name: "状态二"
          }, {
            value: 0,
            name: "状态三"
          }, {
            value: 0,
            name: "状态四"
          }, {
            value: 0,
            name: "状态五"
          }/*, {
            value: 0,
            name: "状态六"
          }, {
            value: 0,
            name: "状态七"
          }*/]
        },
        // 总体数据开始
        todayData: [],
        lastWeekData: [],
        // 总体数据结束
        // 选中道路数据开始
        speedMax: [],
        speedMin: [],
        speedAvg: [],
        speed85: [],
        flowToday: [],
        flowLastWeek: [],
        base: 0, // 时间基
        // 选中道路数据结束
        map: null,
        center: {
          lng: 118.75,
          lat: 30.95
        },
        zoom: 15,
        featureData: {
          fvratio: 0,
          largeratio: 0,
          variance: 0,
          speed: 0,
          flow: 0
        },
        statusColor: {
          '状态一': '#00A5C9',
          '状态二': '#8BD100',
          '状态三': '#6701AB',
          '状态四': '#FF8000',
          '状态五': '#FF0000',
          /*
          '状态六': '#C3017C',
          '状态七': '#38A800',
          */
          '1': '#00A5C9',
          '2': '#8BD100',
          '3': '#6701AB',
          '4': '#FF8000',
          '5': '#FF0000',
          /*
          '6': '#C3017C',
          '7': '#38A800',
          */
        },
        statusArr: ['状态一', '状态二', '状态三', '状态四', '状态五'/*, '状态六', '状态七'*/],
        statusData: []
      }
    },
    computed: {
      fvratioCom: function () {
        return this.featureData.fvratio.toFixed(2);
      },
      largeratioCom: function () {
        return (this.featureData.largeratio * 100).toFixed(2);
      },
      varianceCom: function () {
        return this.featureData.variance.toFixed(2);
      },
      speedCom: function () {
        return this.featureData.speed.toFixed(2);
      },
      flowCom: function () {
        return Math.ceil(this.featureData.flow).toString();
      },
      flowForecastCom: function () {
        return Math.ceil(this.forecastData.flow).toString();
      }
    },
    watch: {
      forecastModeOn: function (newVal, oldVal) {
        // 重新绘制
        this.$options.methods.updateChart(this, this.step, newVal);
        this.$options.methods.updateRoutes(this, this.step, newVal);
      }
    },
    mounted() {
      this.load();
    },
    created() {
      // 每隔固定时间刷新右下角数据
      this.timer = setInterval => function () {
        this.$options.methods.updateChart(this, this.step, this.forecastModeOn)
      }, this.step * 60 * 1000;
    },
    beforeDestroy() {
      // 销毁前清除计时器
      if (this.timer) {
        clearInterval(this.timer);
      }
    },
    methods: {
      refresh(time) { // 定时5min刷新地图
        this.$options.methods.updateRoutes(this, this.step, this.forecastModeOn);
        this.$options.methods.updateChart(this, this.step, this.forecastModeOn);
        this.$options.methods.updateFeatures(this, this.step, this.forecastModeOn);
      },
      // 关闭道路对话框
      onCloseDialog() {
        this.dialogVisible = false;
      },
      //刷新当前路网数据
      updateFeatures(vm, step, forecastModeOn) {
        vm.$axios.get('http://47.97.221.36:8081/together/featureNow')
          .then((res) => {
            res = res.data.data;
            // console.log('特征数据：', res);
            vm.featureData.fvratio = res.feature1
            vm.featureData.largeratio = res.feature2
            vm.featureData.variance = res.feature3
            vm.featureData.speed = res.speed
            vm.featureData.flow = res.count
            // console.log('道路特征', this.featureData);
          })
          .catch((err) => {
            console.log(err)
          });
      },
      // 刷新地图
      updateRoutes(vm, step, forecastModeOn) {
        var api = 'together/prediction/' + step;
        if (!forecastModeOn) {
          api = 'load/now';
        }
        api = 'http://47.97.221.36:8081/' + api;
        vm.$axios.get(api)
          .then((res) => {
            res = res.data.data;
            console.log('新数据：', res, res.length);
            for (var i = 0; i < res.length; i++) {
              var route = vm.mapRoutes[i];
              if (route === undefined) {
                console.log('没找到路段' + i + '！');
                // 重新请求百度地图api绘制缺失路段
                var source = new BMap.Point(vm.roads[i].start_longitude, vm.roads[i].start_latitude);
                var target = new BMap.Point(vm.roads[i].end_longitude, vm.roads[i].end_latitude);
                var drive = vm.$options.methods.getDrive(i, vm);
                drive.search(source, target);
              } else {
                var newStatus = res[i].now;
                if (forecastModeOn) {
                  newStatus = res[i].prediction;
                }
                newStatus = newStatus.situation;
                // if (vm.roads[i].status !== newStatus) {
                //   // 需要刷新
                //   vm.roads[i].status = newStatus;
                //   console.log('刷新' + i + '!');
                //   route.getPolyline().setStrokeColor(vm.statusColor[vm.roads[i].status]);
                // }
                if (forecastModeOn) {
                    route.getPolyline().setStrokeColor(vm.statusColor[newStatus]);
                  } else {
                    vm.roads[i].status = newStatus;
                    console.log('刷新' + i + '!');
                    route.getPolyline().setStrokeColor(vm.statusColor[vm.roads[i].status]);
                  }
              }
            }
          })
          .catch((err) => {
            console.log(err);
          })
      },
      // 刷新图表
      updateChart(vm, step, forecastModeOn) {
        // 重新获取路网交通流量趋势图和交通状态分布图的数据并重新绘制
        // 1.清空数据
        vm.todayData = [];
        vm.lastWeekData = [];
        vm.statusData = [];
        vm.forecastData = {
          flow: 0,
          statusData: [{
            value: 0,
            name: "状态一"
          }, {
            value: 0,
            name: "状态二"
          }, {
            value: 0,
            name: "状态三"
          }, {
            value: 0,
            name: "状态四"
          }, {
            value: 0,
            name: "状态五"
          }/*, {
            value: 0,
            name: "状态六"
          }, {
            value: 0,
            name: "状态七"
          }*/]
        }
        // 2.获取路网流量数据
        vm.$axios.get('http://47.97.221.36:8081/together/countNowaday')
          .then((res) => {
            res = res.data.data; //获取到数据

            var date = new Date(res[0].timeLong);
            // 时间基为当天早8点
            vm.base = date;
            // vm.base.setHours(8, 0, 0);
            vm.base = +vm.base;

            for (var i = 0; i < res.length; i++) {
              var item = res[i];
              vm.todayData.push([item.timeLong, item.count]);
            }
            // console.log('今日交通指数', vm.todayData);
          })
          .then(() => {
            // 2.获取路网上周同期流量数据
            vm.$axios.get('http://47.97.221.36:8081/together/countLast')
              .then((res) => {
                res = res.data.data; //获取到数据
                var date = new Date(res[0].timeLong);
                var base = date;
                // base.setHours(8, 0, 0);
                base = +base;

                for (var i = 0; i < res.length; i++) {
                  var item = res[i];
                  var offset = item.timeLong - base;
                  vm.lastWeekData.push([offset + vm.base, item.count]);
                }
                // console.log('上周同期交通指数', vm.lastWeekData);
              })
              .then(() => {
                // 3.获取路网状态分布数据
                vm.$axios.get('http://47.97.221.36:8081/together/featureNow')
                  .then((res) => {
                    // console.log('状态数据：', res.data);
                    vm.statusData=[]
                    res = res.data.data;
                    vm.statusData.push({
                      value: res.proportion1,
                      name: '状态一'
                    })
                    vm.statusData.push({
                      value: res.proportion2,
                      name: '状态二'
                    })
                    vm.statusData.push({
                      value: res.proportion3,
                      name: '状态三'
                    })
                    vm.statusData.push({
                      value: res.proportion4,
                      name: '状态四'
                    })
                    // vm.statusData.push({
                    //   value: res.proportion5,
                    //   name: '状态五'
                    // })
                    /*
                    vm.statusData.push({
                      value: res.proportion6,
                      name: '状态六'
                    })
                    vm.statusData.push({
                      value: res.proportion7,
                      name: '状态七'
                    })
                    */

                    if (forecastModeOn) { // 若开启预测模式则同时更新预测数据
                      vm.$axios.get('http://47.97.221.36:8081/together/featurePre/' + vm.step)
                        .then((res) => {
                          //console.log("forcast:",res.data);
                          res = res.data.data;

                          vm.forecastData.flow = res.count;
                          // 这里的循环次数也会影响饼状图显示
                          for (var i = 0; i < 5; i++) {
                            vm.forecastData.statusData[i].value = res['proportion' + (i + 1)]
                          }
                          vm.$options.methods.drawChart(vm, step, forecastModeOn);
                        })
                        .catch((err) => {
                          console.log(err);
                        })
                    } else {
                      vm.$options.methods.drawChart(vm, step, forecastModeOn);
                    }
                  })
                  .catch((err) => {
                    console.log(err)
                  });
              })
              .catch((err) => {
                console.log(err);
              })
          })
          .catch((err) => {
            console.log(err)
          })
      },
      stepChanged(newStep) {
        console.log(newStep);
        // 1.清除计时器
        if (this.timer) {
          clearInterval(this.timer);
        }
        // 2.重新绘制
        this.$options.methods.updateChart(this, newStep, this.forecastModeOn);
        this.$options.methods.updateRoutes(this, newStep, this.forecastModeOn);
        // 3.重设计时器
        this.timer = setInterval(() => {
          this.$options.methods.updateChart(this, newStep, this.forecastModeOn)
        }, newStep * 60 * 1000);
      },
      load() {
        // 获取实时道路数据
        this.$axios.get('http://47.97.221.36:8081/load/now')
          .then((res) => {
            var loads = res.data.data;
            // console.log('道路流量数据:', loads);
            for (var i = 0; i < loads.length; i++) {
              this.roads[i] = {
                start_longitude: loads[i].start.longitude,
                start_latitude: loads[i].start.latitude,
                end_longitude: loads[i].end.longitude,
                end_latitude: loads[i].end.latitude,
                id: loads[i].id,
                name: loads[i].name,
                count: loads[i].now.count * 12,
                speed: loads[i].now.speed,
                status: loads[i].now.situation
              };
            }
            console.log('道路流量数据:', this.roads);
          })
          .then(() => {
            // 渲染地图
            this.$options.methods.initMap(this);
          })
          .catch((err) => {
            console.log(err)
          });

        // 获取道路特征数据
        this.$axios.get('http://47.97.221.36:8081/together/featureNow')
          .then((res) => {
            res = res.data.data;
            // console.log('特征数据：', res);
            this.featureData.fvratio = res.feature1 * 12;
            this.featureData.largeratio = res.feature2;
            this.featureData.variance = res.feature3;
            this.featureData.speed = res.speed;
            this.featureData.flow = res.count * 12;
            // console.log('道路特征', this.featureData);
          }).catch((err) => {
            console.log(err)
          });
        // 获取道路流量数据
        this.$axios.get('http://47.97.221.36:8081/together/countNowaday')
          .then((res) => {
            res = res.data.data; //获取到数据
            var date = new Date(res[0].timeLong);
            this.base = date;
            // this.base.setHours(4, 0, 0);
            this.base = +this.base;

            for (var i = 0; i < res.length; i++) {
              var item = res[i];
              this.todayData.push([item.timeLong, item.count * 12]);
            }
            // console.log('今日交通指数', this.todayData);
          })
          .then(() => {
            // 请求上周同期数据
            this.$axios.get('http://47.97.221.36:8081/together/countLast')
              .then((res) => {
                res = res.data.data; //获取到数据
                var date = new Date(res[0].timeLong);
                var base = date;
                // base.setHours(4, 0, 0);
                base = +base;

                for (var i = 0; i < res.length; i++) {
                  var item = res[i];
                  var offset = item.timeLong - base;
                  this.lastWeekData.push([offset + this.base, item.count * 12]);
                }
                // console.log('上周同期交通指数', this.lastWeekData);
              })
              .then(() => {
                // 获取道路状态分布数据
                this.$axios.get('http://47.97.221.36:8081/together/featureNow')
                  .then((res) => {
                    // console.log('状态数据：', res.data);
                    this.statusData=[];
                    res = res.data.data;
                    this.statusData.push({
                      value: res.proportion1,
                      name: "状态一"
                    })
                    this.statusData.push({
                      value: res.proportion2,
                      name: "状态二"
                    })
                    this.statusData.push({
                      value: res.proportion3,
                      name: "状态三"
                    })
                    this.statusData.push({
                      value: res.proportion4,
                      name: "状态四"
                    })
                    // this.statusData.push({
                    //   value: res.proportion5,
                    //   name: "状态五"
                    // })
                    /*
                    this.statusData.push({
                      value: res.proportion6,
                      name: "状态六"
                    })
                    this.statusData.push({
                      value: res.proportion7,
                      name: "状态七"
                    })
                    */
                  })
                  .then(() => {
                    // 绘制路网交通流量趋势图和交通状态分布图
                    this.$options.methods.drawChart(this, this.step, this.forecastModeOn);
                  })
                  .catch((err) => {
                    console.log(err)
                  });
              })
              .catch((err) => {
                console.log(err)
              })
          })
          .catch((err) => {
            console.log(err)
          });
      },
      loadSelRoadData() {
        // 获取选取道路的数据
        // 还原状态
        this.speedMax = [];
        this.speedMin = [];
        this.speedAvg = [];
        this.speed85 = [];
        this.flowToday = [];
        this.flowLastWeek = [];
        this.selRoad[0].flowForecast = 0;
        this.selRoad[0].statusForecast = 0;

        if (this.forecastModeOn) {

          this.$axios.get('http://47.97.221.36:8081/together/predictionRoad/' + this.step + '/' + this.selRoad[0].id)
            .then((res) => {
              res = res.data.data;
              this.selRoad[0].flowForecast = res.prediction.count * 12;
              this.selRoad[0].statusForecast = res.prediction.situation;
            })

          console.log('选中路段：', this.selRoad);
        }

        // 获取道路今日数据
        this.$axios.get('http://47.97.221.36:8081/load/queryWholedayByLid/' + this.selRoad[0].id)
          .then((res) => {
            res = res.data.data; //获取到数据
            console.log("该路段数据：", res);
            for (var i = 0; i < res.length; i++) {
              var item = res[i];
              this.flowToday.push([item.timeLong, item.count * 12]);
              this.speedMax.push([item.timeLong, item.speedMax - item.speedMin]);
              this.speedMin.push([item.timeLong, item.speedMin]);
              this.speedAvg.push([item.timeLong, item.speed]);
              console.log([item.speedMax, item.speedMin, item.speed]);
              if (item.speed < item.speedMin) {
                console.log("速度异常，平均速度小于最低车速！")
              }
            }

            this.$options.methods.drawSelRoadSpeedChart(this);
          })
          .then(() => {
            // 请求上周同期数据
            this.$axios.get('http://47.97.221.36:8081/load/queryLastDayByLid/' + this.selRoad[0].id)
              .then((res) => {
                res = res.data.data; //获取到数据
                console.log("该路段上周数据：", res);
                var date = new Date(res[0].timeLong);
                var base = date;
                // base.setHours(4, 0, 0);
                base = +base;

                for (var i = 0; i < res.length; i++) {
                  var item = res[i];
                  var offset = item.timeLong - base;
                  this.flowLastWeek.push([offset + this.base, item.count * 12]);
                }

                //折线图
                this.$options.methods.drawSelRoadFlowChart(this);
              })
              .then(() => {
                this.selRoad[0].loading = false;
              })
              .catch((err) => {
                console.log(err)
              })
          })
          .catch((err) => {
            console.log(err)
          });
      },
      drawChart(vm, step, forecastModeOn) {
        let lineChart = vm.$echarts.init(document.getElementById('line-chart'));
        let pieChart = vm.$echarts.init(document.getElementById('pie-chart'));

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
            data: ['今日数据', '上周同期', '预测数据'],
            textStyle: {
              fontSize: 10,
              color: '#fff'
            }
          },
          grid: {
            top: '8%',
            left: '5%',
            right: '7%',
            bottom: '11%',
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
            axisLabel: {
              formatter: function (value) {
                var date = new Date(value);
                return date.getHours() + ':' + function (str) {
                  str = '0' + str;
                  return str.substring(str.length - 2);
                }(date.getMinutes().toString());
              },
              fontSize: 8,
              color: '#fff',
              rotate: -45
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.5)'
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.5)',
                width: '1'
              }
            }
          },
          yAxis: {
            name: '流量(veh/h)',
            nameLocation: 'center',
            nameGap: 25,
            type: 'value',
            boundaryGap: [0, '20%'],
            splitLine: {
              show: true,
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.5)',
                width: '1'
              }
            },
            axisLabel: {
              fontSize: 8,
              color: '#fff'
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.5)'
              }
            }
          },
          series: [{
            name: '今日数据',
            type: 'line',
            areaStyle: {
              color: new vm.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgb(255, 158, 68)'
              }, {
                offset: 1,
                color: 'rgb(255, 70, 131)'
              }])
            },
            lineStyle: {
              color: '#8A8C8F',
              width: 0.5
            },
            showSymbol: false,
            hoverAnimation: false,
            data: vm.todayData,
            smooth: true,
            z: 3
          }, {
            name: '上周同期',
            type: 'line',
            areaStyle: {
              color: new vm.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(0, 226, 170)'
              }, {
                offset: 1,
                color: 'rgba(0, 119, 230)'
              }])
            },
            lineStyle: {
              color: '#8A8C8F',
              width: 0.5
            },
            showSymbol: false,
            hoverAnimation: false,
            data: vm.lastWeekData,
            smooth: true
          }]
        };
        if (forecastModeOn) {
          lineOption.series.push({
            name: '预测数据',
            type: 'line',
            areaStyle: {
              color: new vm.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: '#fa6d1d'
              }, {
                offset: 1,
                color: '#b6b51f'
              }])
            },
            lineStyle: {
              color: '#8A8C8F',
              width: 0.5
            },
            showSymbol: false,
            hoverAnimation: false,
            data: [vm.todayData[vm.todayData.length - 1],
              [vm.todayData[vm.todayData.length - 1][0] + step * 60 * 1000, vm.forecastData.flow]
            ],
            smooth: true
          });
        }
        // 重绘图表
        lineChart.clear();
        lineChart.setOption(lineOption);

        // 饼状图配置
        let pieOption = {
          title: {
            show: false,
            text: '注：内圈为预测数据，外圈为实时数据',
            textStyle: {
              fontSize: '10',
              color: '#fff'
            }
          },
          color: [ // 配色
            '#00A5C9', '#8BD100', '#6701AB',
            '#FF8000', '#FF0000', '#C3017C',
            '#38A800', '#FFFF00'
          ],
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            align: 'left',
            top: 'middle',
            left: 10,
            data: vm.statusArr,
            textStyle: {
              color: 'rgb(255, 255, 255)'
            }
          },
          series: [{
            name: '交通状态分布',
            type: 'pie',
            radius: ['60%', '80%'],
            center: ['60%', '47%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center'
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '17',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: vm.statusData
          }]
        };

        if (forecastModeOn) {
          pieOption.title.show = true;
          pieOption.legend.top = 20;
          pieOption.series.push({
            name: '交通状态分布',
            type: 'pie',
            radius: ['30%', '40%'],
            center: ['60%', '50%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center'
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '17',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: vm.forecastData.statusData
          });
        }
        // 重绘图表
        pieChart.clear();
        pieChart.setOption(pieOption);

        // TODO筛选路段状态信息
        pieChart.on('click', function (param) {
          var selStatus = param.data.name;
        });
      },
      drawSelRoadSpeedChart(vm) {
        let speedChart = vm.$echarts.init(document.getElementById('speed-chart'));
        // 折线图配置
        let speedOption = {
          tooltip: {
            trigger: 'axis',
            formatter: function (params) {
              var str = `${params[1].seriesName}: ${(params[1].value[1]+params[0].value[1]).toFixed(2)}<br/>
              ${params[0].seriesName}: ${params[0].value[1].toFixed(2)}`;
              for (var i = 2; i < params.length; i++) {
                str += '<br/>' + `${params[i].seriesName}: ${params[i].value[1].toFixed(2)}`;
              }
              return str;
            }
          },
          legend: {
            data: ['当前平均车速'],
            textStyle: {
              fontSize: 10,
              color: '#fff'
            }
          },
          grid: {
            top: '10%',
            left: '10%',
            right: '5%',
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
            axisLabel: {
              formatter: function (value) {
                var date = new Date(value);
                return date.getHours() + ':' + function (str) {
                  str = '0' + str;
                  return str.substring(str.length - 2);
                }(date.getMinutes().toString());
              },
              fontSize: 8,
              color: '#fff'
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.5)'
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.5)',
                width: '1'
              }
            }
          },
          yAxis: {
            name: '速度(km/h)',
            nameLocation: 'center',
            nameTextStyle: {
              padding: 10
            },
            type: 'value',
            boundaryGap: ['20%', '20%'],
            splitLine: {
              show: true,
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.5)',
                width: '1'
              }
            },
            axisLabel: {
              fontSize: 8,
              color: '#fff'
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.5)'
              }
            }
          },
          series: [{
            name: '谷值速度',
            type: 'line',
            stack: 'speed',
            showSymbol: false,
            hoverAnimation: false,
            data: vm.speedMin,
            lineStyle: {
              color: '#8A8C8F',
              width: 0.5
            }
          }, {
            name: '峰值速度',
            type: 'line',
            stack: 'speed',
            areaStyle: {
              color: '#ccc'
            },
            showSymbol: false,
            hoverAnimation: false,
            data: vm.speedMax,
            lineStyle: {
              color: '#8A8C8F',
              width: 0.5
            }
          }, {
            name: '当前平均车速',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data: vm.speedAvg,
            lineStyle: {
              color: '#0077E6',
              width: 1
            }
          }]
        };
        speedChart.clear();
        speedChart.setOption(speedOption);
      },
      drawSelRoadFlowChart(vm) {
        let flowChart = vm.$echarts.init(document.getElementById('flow-chart'));
        // 折线图配置
        let flowOption = {
          tooltip: {
            trigger: 'axis',
            formatter: function (params) {
              params = params[0];
              return params.value[1];
            }
          },
          legend: {
            data: ['今日流量', '上周同期'],
            textStyle: {
              fontSize: 10,
              color: '#fff'
            }
          },
          grid: {
            top: '10%',
            left: '7%',
            right: '5%',
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
            axisLabel: {
              formatter: function (value) {
                var date = new Date(value);
                return date.getHours() + ':' + function (str) {
                  str = '0' + str;
                  return str.substring(str.length - 2);
                }(date.getMinutes().toString());
              },
              fontSize: 8,
              color: '#fff',
              rotate: -45
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.5)'
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.5)',
                width: '1'
              }
            }
          },
          yAxis: {
            name: '流量(veh/h)',
            nameLocation: 'center',
            nameGap: 25,
            type: 'value',
            boundaryGap: [0, '20%'],
            splitLine: {
              show: true,
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.5)',
                width: '1'
              }
            },
            axisLabel: {
              fontSize: 8,
              color: '#fff'
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.5)'
              }
            }
          },
          series: [{
            name: '今日流量',
            type: 'line',
            areaStyle: {
              color: new vm.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgb(255, 158, 68)'
              }, {
                offset: 1,
                color: 'rgb(255, 70, 131)'
              }])
            },
            lineStyle: {
              color: '#8A8C8F',
              width: 0.5
            },
            showSymbol: false,
            hoverAnimation: false,
            data: vm.flowToday,
            smooth: true,
            z: 3
          }, {
            name: '上周同期',
            type: 'line',
            areaStyle: {
              color: new vm.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(0, 226, 170)'
              }, {
                offset: 1,
                color: 'rgba(0, 119, 230)'
              }])
            },
            lineStyle: {
              color: '#8A8C8F',
              width: 0.5
            },
            showSymbol: false,
            hoverAnimation: false,
            data: vm.flowLastWeek,
            smooth: true
          }]
        };
        flowChart.clear();
        flowChart.setOption(flowOption);
        console.log('绘制完毕！');
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
          this.defaultAnchor = BMAP_ANCHOR_BOTTOM_LEFT;
          this.defaultOffset = new BMap.Size(25, 40);
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
            // routes.length = 1
            var route = routes[0];
            // 保存结果
            vm.mapRoutes[index] = routes[0];
            // 设置样式
            route.getPolyline().setStrokeOpacity(1);
            route.getPolyline().setStrokeWeight(5);
            route.getPolyline().setStrokeColor(vm.statusColor[vm.roads[index].status]);
            // 添加路段点击事件
            route.getPolyline().addEventListener('click', function () {
              vm.dialogVisible = true;
              vm.selRoad[0].loading = true;
              vm.selRoad[0].name = vm.roads[index].name;
              vm.selRoad[0].id = vm.roads[index].id;
              vm.selRoad[0].status = vm.roads[index].status;
              // 加载数据
              vm.loadSelRoadData();
            });
          }
        });
      },
      formatTime(str) {
        str = '0' + str;
        return str.substring(str.length - 2);
      },
      cellStyle: function ({
        row,
        column,
        rowIndex,
        columnIndex
      }) {
        return {
          'background-color': '#292A2D',
          'color': 'rgba(255, 255, 255, 0.8)',
          'border': 'none'
        }
      },
      rowClass: function ({
        row,
        rowIndex
      }) {
        return {
          'background-color': '#292A2D',
          'color': '#0077E6',
          'border-bottom': '1px solid #0077E6'
        }
      }
    }
  }

</script>

<style scoped>
  #home {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    min-height: 100%;
    height: auto;
    box-sizing: border-box;
  }

  #home-map {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    min-height: 100%;
    height: auto;
    background-color: red;
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
    width: 50px;
    color: #000;
    text-align: center;
    line-height: 20px;
    font-size: 7px;
  }

  .road-analysis-wrapper {
    width: 320px;
    height: 260px;
    box-sizing: border-box;
    border: solid 2px #303030;
    border-radius: 4px;
    margin-top: 20px;
  }

  #left-boards {
    position: relative;
    width: 350px;
    float: left;
    top: 80px;
    left: 20px;
  }

  #right-boards {
    position: relative;
    width: 350px;
    float: right;
    top: 80px;
    right: 20px;
  }

  .forecast-step-wrapper {
    width: 243px;
    float: left;
    box-sizing: border-box;
    border: solid 2px #303030;
    border-bottom: none;
    border-radius: 4px 4px 0 0;
  }

  .board-title {
    font-size: 14px;
    font-weight: bold;
    color: #0077E6;
    padding: 10px 20px;
    background-color: rgba(0, 0, 0, 0.8);
    border-radius: 4px 4px 0 0;
  }

  .board-title div {
    float: right;
  }

  .board-title div span {
    display: inline-block;
    padding-right: 5px;
    color: #909399;
  }

  .board-title div span.active {
    color: #0077E6;
  }

  .rates {
    width: 243px;
    float: left;
    box-sizing: border-box;
    border: solid 2px #303030;
    border-radius: 4px;
    margin-top: 20px;
  }

  .rates-content {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .rate-content:nth-child(1) {
    background-color: rgba(0, 119, 230, 0.5);
    border: 1px solid rgb(0, 119, 230);
  }

  .rate-content:nth-child(2) {
    background-color: rgba(224, 104, 13, 0.5);
    border: 1px solid rgb(224, 104, 13);
  }

  .rate-content:nth-child(3) {
    background-color: rgba(6, 115, 90, 0.5);
    border: 1px solid rgb(6, 115, 90);
  }

  .rate-content:nth-child(4) {
    background-color: rgba(123, 104, 238, 0.5);
    border: 1px solid rgb(123, 104, 238);
  }

  .rate-content:nth-child(5) {
    width: 100%;
    background-color: rgba(255, 0, 0, 0.5);
    border: 1px solid rgb(255, 0, 0);
  }

  .rate-content:nth-child(6) {
    width: 100%;
    background-color: rgba(255, 0, 0, 0.5);
    border: 1px solid rgb(255, 0, 0);
  }

  /* 自定义elementUI样式开始 */
  .el-tabs {
    width: 100%;
  }

  .el-tabs>>>.el-tabs__content {
    padding: 0;
  }

  .el-tab-pane {
    margin: 0;
  }

  .el-tabs>>>.el-tabs__header {
    background-color: rgba(0, 0, 0, 0.5);
    border-bottom: none;
  }

  .el-tabs>>>.el-tabs__header .el-tabs__item.is-active {
    color: #0077E6;
    background-color: rgba(0, 0, 0, 0.8);
    border-right: 2px solid #303030;
    border-left: 2px solid #303030;
  }

  .el-tabs>>>.el-tabs__header .el-tabs__item:first-child {
    border-left: none;
  }

  .el-button {
    width: 100%;
    background-color: rgba(64, 158, 255, 0.5);
  }

  .el-table,
  .el-table--border::after,
  .el-table--group::after,
  .el-table::before {
    background-color: transparent;
  }

  /* 自定义elementUI样式结束 */

  .weather-clock {
    width: 350px;
    float: right;
    box-sizing: border-box;
    border: solid 2px #303030;
    border-radius: 4px;
  }

  .line-chart-wrapper {
    width: 350px;
    height: 240px;
    float: right;
    box-sizing: border-box;
    border: solid 2px #303030;
    border-radius: 4px;
    margin-top: 20px;
  }

  #line-chart {
    width: 350px;
    height: 215px;
  }

  #pie-chart {
    width: 346px;
    height: 215px;
  }

  #speed-chart {
    width: 310px;
    /* width: calc(100% - 10px); */
    height: 210px;
  }

  #flow-chart {
    width: 310px;
    /* width: calc(100% - 10px); */
    height: 210px;
  }

  .bg-transparent {
    background: rgba(0, 0, 0, 0.5);
  }

</style>
