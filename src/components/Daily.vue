<template>
  <div id="daily">
    <!-- 今日数据开始 -->
    <el-row>
      <div class="title">数据预处理对比</div>
    </el-row>
    <div class="tag-group">
      <el-tag v-for="item in tags" :key="item.label" :class="{on: item.effect}" @click="switchChart">
        {{ item.label }}
      </el-tag>
    </div>
    <el-row :gutter="20" v-show="tags[0].effect">
      <el-col :span="12">
        <div class="today-data-origin">
          <!-- 原始数据图 -->
          <div id="origin-chart-1">

          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="today-data-processed">
          <!-- 预处理数据图 -->
          <div id="processed-chart-1">

          </div>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20" v-show="tags[1].effect">
      <el-col :span="12">
        <div class="today-data-origin">
          <!-- 原始数据图 -->
          <div id="origin-chart-2">

          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="today-data-processed">
          <!-- 预处理数据图 -->
          <div id="processed-chart-2">

          </div>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20" v-show="tags[2].effect">
      <el-col :span="12">
        <div class="today-data-origin">
          <!-- 原始数据图 -->
          <div id="origin-chart-3">

          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="today-data-processed">
          <!-- 预处理数据图 -->
          <div id="processed-chart-3">

          </div>
        </div>
      </el-col>
    </el-row>
    <!-- 今日数据结束 -->

    <!-- 交通态势开始 -->
    <el-row>
      <div class="title">交通态势筛选</div>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="today-status">
          <div id="status-chart">

          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="road-list-wrapper">
          <div class="road-list">
            <!-- 这里的话就不提供排名了，按照默认顺序来，后端是什么顺序，前端就是什么顺序 -->
            <el-table ref="roadsTable" :data="roadDataCom" height="400" max-height="400" :cell-style="cellStyle"
              :header-cell-style="rowClass">
              <el-table-column prop="id" label="路段ID" width="100" align="left">
              </el-table-column>
              <el-table-column prop="name" label="路段" width="130" align="left">
              </el-table-column>
              <el-table-column label="流量vec/h" align="left">
                <template slot-scope="scope">
                  <div class="rank-display">
                    <div class="bar">
                    <el-progress :percentage="scope.row.flow" :stroke-width="10" :show-text='false' :color="ranks">
                    </el-progress>
                    </div>
                  <span>{{ scope.row.flow }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="车速km/h" align="left">
                <template slot-scope="scope">
                  <div class="rank-display">
                    <div class="bar" style="width:70%">
                    <el-progress :percentage="scope.row.speed" :stroke-width="10" :show-text='false' :color="ranks">
                    </el-progress>
                    </div>
                  <span>{{ scope.row.speed.toFixed(2) }}</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-col>
    </el-row>
    <!-- 交通态势结束 -->

    <!-- 排行开始 -->
    <el-row>
      <div class="title">实时交通排行</div>
      <div class="rank-list">
        <el-table :data="rankData" max-height="500" :cell-style="cellStyle" :header-cell-style="rowClass"
          @sort-change="getNewRank" :default-sort="{ prop: 'flow', order: 'descending' }">
          <el-table-column prop="id" label="路段ID" width="100" align="left">
          </el-table-column>
          <el-table-column prop="name" label="路段" width="180" align="left">
          </el-table-column>
          <el-table-column label="流量vec/h" align="left" sortable="custom" prop="flow">
            <template slot-scope="scope">
              <div class="rank-display">
                  <div class="bar">
                  <el-progress :percentage="scope.row.flow" :stroke-width="10" :show-text='false' :color="ranks">
                  </el-progress>
                  </div>
                  <span>{{ scope.row.flow }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="车速km/h" align="left" sortable="custom">
            <template slot-scope="scope">
              <div class="rank-display">
                  <div class="bar">
                  <el-progress :percentage="scope.row.speed" :stroke-width="10" :show-text='false' :color="ranks">
                  </el-progress>
                  </div>
                  <span>{{ scope.row.speed.toFixed(2) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="态势" width="120" align="left">
            <template slot-scope="scope">
              <StatusLabel :status="+scope.row.status"></StatusLabel>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-row>
    <!-- 排行结束 -->

    <!-- 预报开始 -->
    <el-row>
      <div class="title">交通预报</div>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="24">
        <div class="rank-list-forecast">
          <el-table :data="forecastData" max-height="500" :cell-style="cellStyle" :header-cell-style="rowClass"
          @sort-change="getNewForecastRank" :default-sort="{ prop: 'flow', order: 'descending' }">
            <el-table-column prop="id" label="路段ID" width="100" align="left">
            </el-table-column>
            <el-table-column prop="name" label="路段" width="180" align="left">
            </el-table-column>
            <el-table-column label="流量vec/h" align="left" sortable="custom" prop="flow">
              <template slot-scope="scope">
                <div class="rank-display">
                  <div class="bar">
                  <el-progress :percentage="scope.row.flow" :stroke-width="10" :show-text='false' :color="ranks">
                  </el-progress>
                  </div>
                  <span>{{ scope.row.flow }}</span>
              </div>
              </template>
            </el-table-column>
            <!-- <el-table-column label="车速km/h" align="left" sortable="custom">
              <template slot-scope="scope">
                <el-progress :percentage="scope.row.speed" :stroke-width="10" :show-text='false' :color="ranks">
                </el-progress>
              </template>
            </el-table-column> -->
            <el-table-column label="态势" width="120" align="left">
              <template slot-scope="scope">
                <StatusLabel :status="+scope.row.status"></StatusLabel>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
    <!-- 预报结束 -->
  </div>
</template>

<script>
  import StatusLabel from '../components/StatusLabel'

  export default {
    name: 'Daily',
    components: {
      StatusLabel: StatusLabel
    },
    data() {
      return {
        tags: [{
          label: '车速异常数据修复',
          effect: true
        }, {
          label: '调和平均车速修复',
          effect: false
        }, {
          label: '超出阈值的异常值修复',
          effect: false
        }],
        roadData: [],
        rankData: [], // 排名数据
        xAxis: {
          tab1: [],
          tab2: [],
          tab3: [],
          sigma: []
        }, // x轴数据
        originData: {
          tab1: [],
          tab2: [],
          tab3: []
        }, // 处理前的数据
        processedData: {
          tab1: [],
          tab2: [],
          tab3: []
        }, // 处理后的数据
        forecastData: [], // 预报数据
        statusData: [], // 态势分布饼状图数据
        ranks: [{ // 不同进度对应不同颜色
          color: '#38A800',
          percentage: 20
        }, {
          color: '#8BD100',
          percentage: 40
        }, {
          color: '#FFFF00',
          percentage: 60
        }, {
          color: '#FF8000',
          percentage: 80
        }, {
          color: '#FF0000',
          percentage: 100
        }],
        statusArr: ['态势一', '态势二', '态势三', '态势四', '态势五', '态势六', '态势七'],
        selStatus: '', // 要筛选的态势
      }
    },
    computed: {
      roadDataCom: function () {
        // 实现表格的筛选功能
        return this.roadData.filter((value) => {
          if (this.selStatus) {
            return this.statusArr[value.status-1] === this.selStatus;
          } else {
            return value.status;
          }
        })
      }
    },
    mounted() {
      this.load();
    },
    methods: {
      load: function () {
        // 获取原始数据以及处理后的数据
        // 第一个对比图
        this.$axios.get('../../static/csv/规则1车速异常数据修复.csv')
          .then((res) => {
            res = res.data;
            var data = this.$papa.parse(res, {
              delimiter: ",",
              header: true
            });

            data = data.data;
            // 去除空行
            data.splice(data.length - 1, 1);

            for (var i = 0; i < data.length; i++) {
              this.xAxis.tab1.push(data[i].time);
              this.originData.tab1.push(data[i].before);
              this.processedData.tab1.push(data[i].after);
            }

            this.$options.methods.drawTab1Chart(this);
          })
          .catch((err) => {
            console.log(err);
          });

        // 第二个对比图
        this.$axios.get('../../static/csv/规则2调和平均车速修复.csv')
          .then((res) => {
            res = res.data;
            var data = this.$papa.parse(res, {
              delimiter: ",",
              header: true
            });

            data = data.data;
            // 去除空行
            data.splice(data.length - 1, 1);

            for (var i = 0; i < data.length; i++) {
              this.xAxis.tab2.push(i);
              this.originData.tab2.push(data[i].before);
              this.processedData.tab2.push(data[i].after);
            }

            this.$options.methods.drawTab2Chart(this);
          })
          .catch((err) => {
            console.log(err);
          })

        // 第三个对比图
        this.$axios.get('../../static/csv/规则4超出阈值的异常值修复.csv')
          .then((res) => {
            res = res.data;
            var data = this.$papa.parse(res, {
              delimiter: ",",
              header: true
            });

            data = data.data;
            // 去除空行
            data.splice(data.length - 1, 1);

            for (var i = 0; i < data.length; i++) {
              this.xAxis.tab3.push(i);
              this.originData.tab3.push(data[i].before);
              this.processedData.tab3.push(data[i].after);
              this.xAxis.sigma.push(data[i].u3sigma);
            }

            this.$options.methods.drawTab3Chart(this);
          })
          .catch((err) => {
            console.log(err);
          })

        // 获取实时道路数据
        this.$axios.get('http://47.97.221.36:8081/load/selNow')
          .then((res) => {
            var loads = res.data.data;
            for (var i = 0; i < loads.length; i++) {
              this.roadData.push({
                id: loads[i].id,
                name: loads[i].name,
                flow: loads[i].now.count,
                speed: loads[i].now.speed,
                status: loads[i].now.situation
              });
            }
          })
          .catch((err) => {
            console.log(err);
          })

        // 可以默认发过来按照流量降速的数据
        // 获取实时排名数据
         this.$axios.get('http://47.97.221.36:8081/rank/CSRank/CD')
          .then((res) => {
            res = res.data.data;
            this.rankData=[];
            for(var i=0;i<res.length;i++){
                this.rankData.push({
                  name:res[i].name,
                  id:res[i].lid,
                  flow:res[i].count,
                  speed:res[i].speed,
                  status:res[i].situation
              })
            }
            console.log(this.rankData);
          })
          .catch((err) => {
            console.log(err);
          });

        // 获取路段拥堵预测数据
         this.$axios.get('http://47.97.221.36:8081/rank/CRankPre/'+3+"/"+"CD")
          .then((res) => {
            res = res.data.data;
            this.forecastData = [];
            for(var i=0;i<res.length;i++){
              this.forecastData.push({
                name:res[i].name,
                id:res[i].lid,
                flow:res[i].count,
                status:res[i].situation
              })
            }
          })
          .catch((err) => {
            console.log(err);
          });

        // 获取道路态势分布数据
        this.$axios.get('http://47.97.221.36:8081/together/featureNow')
          .then((res) => {
            console.log('态势数据：', res.data);
            res = res.data.data;
            this.statusData.push({
                value:res.proportion1,
                name:"态势一"
            })
            this.statusData.push({
                value:res.proportion2,
                name:"态势二"
            })
            this.statusData.push({
                value:res.proportion3,
                name:"态势三"
            })
            this.statusData.push({
                value:res.proportion4,
                name:"态势四"
            })
            this.statusData.push({
                value:res.proportion5,
                name:"态势五"
            })
            this.statusData.push({
                value:res.proportion6,
                name:"态势六"
            })
            this.statusData.push({
                value:res.proportion7,
                name:"态势七"
            })

            // 绘制态势图
            this.drawStatus();
          })
          .catch((err) => {
            console.log(err)
          });
      },
      switchChart: function (event) {
        var clickOn = event.toElement.innerText;
        if (clickOn === this.tags[0].label) {
          clickOn = 0;
        } else if (clickOn === this.tags[1].label) {
          clickOn = 1;
        } else {
          clickOn = 2;
        }

        for (var i = 0; i < this.tags.length; i++) {
          if (i === clickOn) {
            this.tags[i].effect = true;
          } else {
            this.tags[i].effect = false;
          }
        }
      },
      drawTab1Chart: function (vm) {
        let originChart = vm.$echarts.init(document.getElementById('origin-chart-1'));
        let processedChart = vm.$echarts.init(document.getElementById('processed-chart-1'));

        let originOption = {
          title: {
            left: 'center',
            text: '处理前',
          },
          toolbox: {
            feature: {
              dataZoom: {
                yAxisIndex: 'none'
              },
              restore: {},
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'category',
            splitLine: {
              show: false
            },
            data: vm.xAxis.tab1
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: 120,
            splitLine: {
              show: false
            }
          },
          series: [{
            name: '原始数据',
            type: 'line',
            symbol: 'none',
            sampling: 'average',
            lineStyle: {
              color: 'rgb(255, 70, 131)',
              width: 1
            },
            data: vm.originData.tab1
          }]
        }

        originChart.setOption(originOption);

        let processedOption = {
          title: {
            left: 'center',
            text: '处理后',
          },
          toolbox: {
            feature: {
              dataZoom: {
                yAxisIndex: 'none'
              },
              restore: {},
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'category',
            splitLine: {
              show: false
            },
            data: vm.xAxis.tab1
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: 120,
            splitLine: {
              show: false
            }
          },
          series: [{
            name: '处理数据',
            type: 'line',
            symbol: 'none',
            sampling: 'average',
            lineStyle: {
              color: 'rgb(0, 119, 230)',
              width: 1
            },
            data: vm.processedData.tab1
          }]
        }

        processedChart.setOption(processedOption);
      },
      drawTab2Chart: function (vm) {
        let originChart = vm.$echarts.init(document.getElementById('origin-chart-2'));
        let processedChart = vm.$echarts.init(document.getElementById('processed-chart-2'));

        let originOption = {
          title: {
            left: 'center',
            text: '处理前',
          },
          toolbox: {
            feature: {
              dataZoom: {
                yAxisIndex: 'none'
              },
              restore: {},
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'category',
            splitLine: {
              show: false
            },
            data: vm.xAxis.tab2
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: 50,
            splitLine: {
              show: false
            }
          },
          series: [{
            name: '原始数据',
            type: 'line',
            symbol: 'none',
            sampling: 'average',
            lineStyle: {
              color: 'rgb(255, 70, 131)',
              width: 1
            },
            data: vm.originData.tab2
          }]
        }

        originChart.setOption(originOption);

        let processedOption = {
          title: {
            left: 'center',
            text: '处理后',
          },
          toolbox: {
            feature: {
              dataZoom: {
                yAxisIndex: 'none'
              },
              restore: {},
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'category',
            splitLine: {
              show: false
            },
            data: vm.xAxis.tab2
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: 50,
            splitLine: {
              show: false
            }
          },
          series: [{
            name: '处理数据',
            type: 'line',
            symbol: 'none',
            sampling: 'average',
            lineStyle: {
              color: 'rgb(0, 119, 230)',
              width: 1
            },
            data: vm.processedData.tab2
          }]
        }

        processedChart.setOption(processedOption);
      },
      drawTab3Chart: function (vm) {
        let originChart = vm.$echarts.init(document.getElementById('origin-chart-3'));
        let processedChart = vm.$echarts.init(document.getElementById('processed-chart-3'));

        let originOption = {
          title: {
            left: 'center',
            text: '处理前',
          },
          toolbox: {
            feature: {
              dataZoom: {
                yAxisIndex: 'none'
              },
              restore: {},
              saveAsImage: {}
            }
          },
          legend: {
            data: ['3-sigma'],
            top: 50
          },
          xAxis: {
            type: 'category',
            splitLine: {
              show: false
            },
            data: vm.xAxis.tab3
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            splitLine: {
              show: false
            }
          },
          series: [{
            name: '原始数据',
            type: 'line',
            symbol: 'none',
            sampling: 'average',
            lineStyle: {
              color: 'rgb(255, 70, 131)',
              width: 1
            },
            data: vm.originData.tab3
          }, {
            name: '3-sigma',
            type: 'line',
            symbol: 'none',
            sampling: 'average',
            lineStyle: {
              color: 'rgb(255, 0, 0)',
              width: 1
            },
            data: vm.xAxis.sigma
          }]
        }

        originChart.setOption(originOption);

        let processedOption = {
          title: {
            left: 'center',
            text: '处理后',
          },
          toolbox: {
            feature: {
              dataZoom: {
                yAxisIndex: 'none'
              },
              restore: {},
              saveAsImage: {}
            }
          },
          legend: {
            data: ['3-sigma'],
            top: 50
          },
          xAxis: {
            type: 'category',
            splitLine: {
              show: false
            },
            data: vm.xAxis.tab3
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            splitLine: {
              show: false
            }
          },
          series: [{
            name: '处理数据',
            type: 'line',
            symbol: 'none',
            sampling: 'average',
            lineStyle: {
              color: 'rgb(0, 119, 230)',
              width: 1
            },
            data: vm.processedData.tab3
          }, {
            name: '3-sigma',
            type: 'line',
            symbol: 'none',
            sampling: 'average',
            lineStyle: {
              color: 'rgb(255, 0, 0)',
              width: 1
            },
            data: vm.xAxis.sigma
          }]
        }

        processedChart.setOption(processedOption);
      },
      drawStatus: function () {
        var statusChart = this.$echarts.init(document.getElementById('status-chart'));
        let statusOption = {
          color: [
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
            left: 50,
            data: this.statusArr,
            textStyle: {
              color: 'rgb(255, 255, 255)'
            }
          },
          series: [{
            name: '交通态势分布',
            type: 'pie',
            radius: ['50%', '80%'],
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
                  fontSize: '30',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: this.statusData
          }]
        };

        statusChart.setOption(statusOption);

        // 修改筛选条件
        var that = this;
        statusChart.on('click', function (param) {
          that.selStatus = param.data.name;
          console.log(param.data.name);
        });
      },
      // 获取新的排名
      getNewRank: function ({
        column,
        prop,
        order
      }) {
        if (order === null) {
          return;
        }
        order = order.substring(0, 1).toUpperCase();
        console.log(order); // D A
        prop = column.label.substring(0, 2);
        console.log(prop); // 流量 车速
        if (prop === '流量') {
          order = 'C' + order;
        } else {
          order = 'S' + order;
        }

        // 然后就可以在这里发请求了
        // 获取实时排名数据
        this.$axios.get('http://47.97.221.36:8081/rank/CSRank/'+order)
          .then((res) => {
            res = res.data.data;
            this.rankData=[];
            for(var i=0;i<res.length;i++){
                this.rankData.push({
                  name:res[i].name,
                  id:res[i].lid,
                  flow:res[i].count,
                  speed:res[i].speed,
                  status:res[i].situation
              })
            }
            console.log(this.rankData);
          })
          .catch((err) => {
            console.log(err);
          });
      },
      // 获取新的预测排名
      getNewForecastRank: function ({
        column,
        prop,
        order
      }) {
        if (order === null) {
          return;
        }
        order = order.substring(0, 1).toUpperCase();
        order = 'C' + order;
        // 然后就可以在这里发请求了
        // 获取预测排名数据
        this.$axios.get('http://47.97.221.36:8081/rank/CRankPre/'+3+"/"+order)
          .then((res) => {
            res = res.data.data;
            this.forecastData = [];
            for(var i=0;i<res.length;i++){
              this.forecastData.push({
                name:res[i].name,
                id:res[i].lid,
                flow:res[i].count,
                status:res[i].situation
              })
            }
            console.log("预报:",this.forecastData);
          })
          .catch((err) => {
            console.log(err);
          });
      },

      cellStyle: function ({
        row,
        column,
        rowIndex,
        columnIndex
      }) {
        return {
          'background-color': 'rgba(0, 0, 0, 1)',
          'color': 'rgba(255, 255, 255, 0.8)',
          'border': 'none'
        }
      },
      rowClass: function ({
        row,
        rowIndex
      }) {
        return {
          'background-color': 'rgba(0, 0, 0, 1)',
          'color': '#0077E6',
          'border-bottom': '1px solid #0077E6'
        }
      }
    }
  }

</script>

<style scoped>
  #daily {
    width: 1140px;
    height: auto;
    border-radius: 5px;
    background-color: #000;
    margin: 0 auto;
  }

  .tag-group {
    margin-left: 20px;
    margin-bottom: 20px;
  }

  .el-tag {
    margin-right: 20px;
    border: 1px solid #303030 !important;
    background-color: rgba(32, 33, 34, 0.507) !important;
    color: #ccc;
  }

  .el-tag.on {
    border: 1px solid #409EFF !important;
    background-color: rgba(64, 158, 255, 0.5) !important;
    color: #ccc;
  }

  #origin-chart-1,
  #processed-chart-1,
  #origin-chart-2,
  #processed-chart-2,
  #origin-chart-3,
  #processed-chart-3 {
    width: 560px;
    height: 400px;
  }

  #status-chart,
  .road-list {
    width: 100%;
    height: 400px;
  }

  .title {
    margin: 20px;
    color: #ccc;
  }

  .road-list .el-table {
    margin: 0 auto;
  }

  .rank-list {
    width: 1140px;
    height: auto;
  }

  .rank-list .el-table {
    width: 80%;
    margin: 0 auto;
  }

  .el-progress /deep/ .el-progress-bar__outer {
    background-color: rgba(0, 0, 0, 1);
  }

  .el-table,
  .el-table th,
  .el-table tr,
  .el-table>>>.gutter,
  .el-table--border::after,
  .el-table--group::after,
  .el-table::before {
    background-color: rgba(0, 0, 0, 1) !important;
  }

  .rank-list-forecast {
    width: 100%;
    height: auto;
    margin-bottom: 20px;
  }

  .rank-list-forecast .el-table {
    width: 80%;
    margin: 0 auto;
  }

  .bar {
    width: 80%;
    display: inline-block;
  }

</style>
