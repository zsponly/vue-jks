<template>

  <div class="history-content">

    <el-row class="date-time-picker-wrapper" :gutter="20">
      <el-col :span="7">
        <span class="title">日期</span>
        <el-date-picker v-model="date" align="right" type="date" placeholder="选择日期" :picker-options="pickerOptions">
        </el-date-picker>
      </el-col>
      <el-col :span="9">
        <span class="title">时间</span>
        <el-time-picker is-range v-model="time" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间"
          placeholder="选择时间范围">
        </el-time-picker>
      </el-col>
      <el-col :span="5">
        <span class="title">路段</span>
        <el-autocomplete class="inline-input" v-model="road" :fetch-suggestions="querySearch" placeholder="请输入路段名"
          :trigger-on-focus="false" @select="handleSelect" value-key="name" clearable></el-autocomplete>
      </el-col>
      <el-col :span="2">
        <el-button type="primary" icon="el-icon-search" @click="query">查询</el-button>
      </el-col>
    </el-row>

    <el-row id="result-table">
      <el-table :data="searchResult" height="300" max-height="300" :cell-style="cellStyle" :header-cell-style="rowClass">
        <el-table-column prop="id" label="路段ID" align="left">
        </el-table-column>
        <el-table-column prop="name" label="路段" align="left">
        </el-table-column>
        <el-table-column prop="flow" label="流量" align="left">
        </el-table-column>
        <el-table-column prop="speed" label="速度" align="left">
        </el-table-column>
        <el-table-column prop="status" label="交通态势" align="left">
        </el-table-column>
        <el-table-column prop="time" label="时间" align="left">
        </el-table-column>
      </el-table>
    </el-row>

  </div>

</template>

<script>
  export default {
    name: 'History',
    data() {
      return {
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          },
          shortcuts: [{
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', new Date());
            }
          }, {
            text: '昨天',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit('pick', date);
            }
          }, {
            text: '一周前',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', date);
            }
          }]
        },
        date: new Date(),
        time: [new Date(), new Date()],
        road: '',         // 搜索的道路名
        queryID: '',      // 搜索道路的ID
        roads: [],        // 提示集
        searchResult: []  // 搜索结果
      }
    },
    mounted() {
      this.load();
    },
    methods: {
      // 组件初始时获得提示集数据，比如十条道路的名字
      load() {
        this.$axios.get('http://47.97.221.36:8081/load/queryAllName')
          .then((res) => {
            res = res.data.data;
            for(var i=0;i<res.length;i++){
              this.roads.push({
                name:res[i].name,
                id:res[i].id
              })
            }
            this.roads = res;// 提示集结构为[{name: 'XXX路',id:'XXX',...其他属性随意，name,id属性是必须要有的...},...]
          })
          .catch((err) => {
            console.log(err);
          })
      },
      // 这个不用管
      querySearch(queryString, cb) {
        var roads = this.roads;
        var results = queryString ? roads.filter(this.createFilter(queryString)) : roads;
        // 调用 callback 返回建议列表的数据
        console.log('搜索提示集', results);
        cb(results);
      },
      // 也不用管
      createFilter(queryString) {
        return (road) => {
          return road.name.match(queryString);
        };
      },
      // 点击查询按钮触发
      query() {
        // 条件检查
        if (+this.time[1] - +this.time[0] < 180 * 1000) {
          this.$message.error('时间间隔必须大于等于3分钟！');
          return;
        }
        if (!this.road) {
          this.$message.error('路段名不能为空！');
          return;
        }
        // 匹配道路ID
        var foundFlag = false;
        for (var i = 0; i < this.roads.length; i++) {
          if (this.roads[i].name === this.road) {
            this.queryID = this.roads[i].id;
            foundFlag = true;
            break;
          }
        }
        // 没有匹配到，提示错误并返回
        if (!foundFlag) {
          this.$message.error('抱歉，数据库中暂无此路。');
          this.road = '';
          this.queryID = '';
          return;
        }
        this.searchResult=[];
        // 时间格式化

        var start = new Date(this.date);
        var end = new Date(this.date);
        
        start.setHours(this.time[0].getHours(), this.time[0].getMinutes(), this.time[0].getSeconds());
        end.setHours(this.time[1].getHours(), this.time[1].getMinutes(), this.time[1].getSeconds());
        
        start=+start;
        end=+end;
        // start = this.$options.methods.formatTime(start);  // 开始时间，字符串
        // end = this.$options.methods.formatTime(end);      // 结束时间，字符串
        // 向后台请求要查询的数据
        // 开始时间:start;结束时间:end;路段名:this.road;路段ID:this.queryID;
        var url='http://47.97.221.36:8081/load/query/'+start+'A'+end+'/'+this.queryID
        console.log("url:",url);
        this.$axios.get(url)
        .then((res) => {
          res = res.data.data;
          for (var i = 0; i < res.length; i++) {
            var item = res[i];
            // 格式化时间
            var time = new Date(item.time);
            time = this.$options.methods.formatTime(time);
            // 添加数据
            this.searchResult.push({
              id: item.lid,
              name: item.name,
              flow: item.count,
              speed: item.speed,
              status: item.situation,
              time: time
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
      },
      // 选中某一条记录后更新查询道路的ID
      handleSelect(item) {
        console.log(item);
        this.queryID = item.id;
      },
      // 不用管
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
      // 不用管
      rowClass: function ({
        row,
        rowIndex
      }) {
        return {
          'background-color': 'rgba(0, 0, 0, 1)',
          'color': '#0077E6',
          'border-bottom': '1px solid #0077E6'
        }
      },
      // 格式化时间
      formatTime(date) {
        function two(str) {
          str = '0' + str;
          return str.substring(str.length-2);
        }
        return `${date.getFullYear()}-${two(date.getMonth()+1)}-${two(date.getDate())} ${date.getHours()}:${two(date.getMinutes())}:${two(date.getSeconds())}`;
      }
    }
  }

</script>

<style scoped>
  .history-content {
    width: 1140px;
    height: 100px;
    margin: 0 auto;
    border-radius: 5px;
    background-color: #000;
  }

  .el-row {
    margin-bottom: 60px;
  }

  .title {
    color: rgba(255, 255, 255, 0.8);
    margin: 10px 20px;
  }

  .date-time-picker-wrapper {
    padding-top: 30px;
  }

  .el-autocomplete {
    width: 60%;
  }

  .el-range-editor {
    width: 80%;
  }

  #result-table {
    width: 1140px;
    height: auto;
    margin: 0 auto;
    border-radius: 5px;
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


  .el-table {
    border-radius: 5px;
  }

</style>
