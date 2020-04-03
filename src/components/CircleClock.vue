<template>
  <div class="clock-content">

    <div class="grid-content bg-transparent">

      <!-- 天气开始 -->
      <div class="weather">

        <div class="weather-icon">
          <i :class="'wi' + ' ' + weatherIcon"></i>
        </div>

        <div class="weather-detail">
          <span>{{ +tem+15 }}</span>℃<br />
          <span>{{ win + ' ' + win_speed }}</span><br />
          <span>PM2.5: {{ air_pm25 }}</span>
          <span>{{ air_level }}</span>
        </div>

      </div>
      <!-- 天气结束 -->

      <!-- 时间开始 -->
      <div class="clock">

        <div class="digit-content">
          <el-row class="time">{{ time }}</el-row>
          <el-row class="date">{{ date }}</el-row>
        </div>

        <el-progress class="pb-day" type="circle" :width="160" :percentage="dayProgressCom" :color="pbColors[0]"
          :show-text="false" :stroke-width="8"></el-progress>
        <el-progress class="pb-hour" type="circle" :width="144" :percentage="hourProgressCom" :color="pbColors[1]"
          :show-text="false" :stroke-width="8"></el-progress>
        <el-progress class="pb-minute" type="circle" :width="128" :percentage="minuteProgressCom" :color="pbColors[2]"
          :show-text="false" :stroke-width="8"></el-progress>
        <el-progress class="pb-second" type="circle" :width="112" :percentage="secondProgressCom" :color="pbColors[3]"
          :show-text="false" :stroke-width="8"></el-progress>

      </div>
      <!-- 时间结束 -->

    </div>

  </div>
</template>

<script>
  export default {
    name: 'Clock',
    data() {
      return {
        timer:null,
        firstIn: true,
        now: new Date(),
        minute: 0,
        cnt: 0,
        dayProgress: 0,
        hourProgress: 0,
        minuteProgress: 0,
        secondProgress: 0,
        pbColors: [
          '#F44444',
          '#409eff',
          '#BFEC33',
          '#67C23A',
        ],
        weather: null,
        weatherIconsMap: {
          'xue': 'wi-snow',
          'lei': 'wi-lightning',
          'shachen': 'wi-cloudy-gusts',
          'wu': 'wi-fog',
          'bingbao': 'wi-hail',
          'yun': 'wi-day-cloudy',
          'yu': 'wi-rain',
          'yin': 'wi-cloud',
          'qing': 'wi-day-sunny'
        },
        weatherIcon: '',
        tem: '',
        win: '',
        win_speed: '',
        air_pm25: '',
        air_level: ''
      }
    },
    watch: {
      weather: function (newVal, oldVal) {
        this.weatherIcon = this.weatherIconsMap[newVal.wea_img]
        this.tem = newVal.tem;
        this.win = newVal.win;
        this.win_speed = newVal.win_speed;
        this.air_pm25 = newVal.air_pm25;
        this.air_level = newVal.air_level;
      },
      minute: function (newVal, oldVal) {
        if (newVal !== oldVal) {
          if (this.now.getMinutes() % 5 === 0) {
            this.$emit('refresh', this.now);
          }
        }
      }
    },
    computed: {
      dayProgressCom: function () {
        return Math.ceil(this.dayProgress * 100);
      },
      hourProgressCom: function () {
        return Math.ceil(this.hourProgress * 100);
      },
      minuteProgressCom: function () {
        return Math.ceil(this.minuteProgress * 100);
      },
      secondProgressCom: function () {
        return Math.ceil(this.secondProgress * 100);
      },
      date: function () {
        return this.now.getFullYear() + '-' + this.$options.methods.formatTime(this.now.getMonth() + 1) + '-' + this
          .$options
          .methods.formatTime(this.now.getDate());
        // return this.today.getFullYear() + '-' + this.$options.methods.formatTime(this.today.getMonth()) + '-' + this
        //   .$options
        //   .methods.formatTime(this.today.getDate());
      },
      time: function () {
        return this.$options.methods.formatTime(this.now.getHours()) + ':' + this.$options.methods.formatTime(this.now
            .getMinutes()) + ':' + this
          .$options
          .methods.formatTime(this.now.getSeconds());
      },
    },
    methods: {
      startClock: function () {
        this.updateClockFromServer(this);
      },
      updateClock: function () {
        this.now = +this.now;
        this.now = this.now + 500;
        this.now = new Date(this.now);
        this.dayProgress = this.now.getHours() / 23;

        this.hourProgress = this.now.getMinutes() / 59;
        this.minuteProgress = this.now.getSeconds() / 59;
        this.secondProgress = (++this.cnt) / 2 < 1 ? 0 : 1;
        this.cnt = this.cnt % 2;

        this.minute = this.now.getMinutes();
      },
      updateClockFromServer: function (vm) {
        // 向服务器请求时间
        vm.$axios.get('http://47.97.221.36:8081/load/Time')
          .then((res) => {
            console.log('服务器时间：', res);
            res = res.data.data;
            vm.now = new Date(res);
            // this.now = new Date();
            // if (this.now.getDate() !== this.today.getDate()) {
            //   this.today = this.now;
            // }
            vm.dayProgress = vm.now.getHours() / 23;

            vm.hourProgress = vm.now.getMinutes() / 59;
            vm.minuteProgress = vm.now.getSeconds() / 59;
            vm.secondProgress = (++vm.cnt) / 2 < 1 ? 0 : 1;
            vm.cnt = vm.cnt % 2;

            vm.minute = vm.now.getMinutes();

            if (vm.firstIn) {
              // 每0.5秒更新一次表
              setInterval(vm.updateClock, 500);
              // 每5min从服务器更新一次时间
              vm.timer=setInterval(function(){vm.updateClockFromServer(vm)}, 10 * 1000);
              vm.firstIn = false;
            }
          })
          .catch((err) => {
            console.log(err);
          })
      },
      formatTime: function (str) {
        str = '0' + str;
        return str.substring(str.length - 2);
      },
      getWeather() {
        this.$axios.get('https://tianqiapi.com/api?version=v6&appid=56598731&appsecret=Sef3JoNE&city=安徽宣城')
          .then((res) => {
            console.log(res.data)
            this.weather = res.data;
          })
          .catch((err) => {
            console.log(err);
          })
      }
    },
    mounted() {
      this.getWeather();
      this.startClock();
    },
    beforeDestroy() {
      if (this.updateClock) {
        clearInterval(this.updateClock);
      }

      if (this.timer) {
        clearInterval(this.timer);
      }
    }
  }

</script>

<style scoped>
  .clock-content {
    display: block;
    width: 100%;
    height: 200px;
  }

  .grid-content {
    border-radius: 4px;
    min-height: 36px;
    height: 100%;
  }

  .bg-transparent {
    background: rgba(0, 0, 0, 0.5);
  }

  .clock {
    position: relative;
    width: 160px;
    height: 160px;
    float: right;
    margin: 5% 20px;
    text-align: center;
    box-sizing: border-box;
  }

  .clock * {
    position: absolute;
  }

  .pb-day {
    top: 0;
    left: 0;
  }

  .pb-hour {
    top: 8px;
    left: 8px;
  }

  .pb-minute {
    top: 16px;
    left: 16px;
  }

  .pb-second {
    top: 24px;
    left: 24px;
  }

  .pb-day /deep/ path:first-child {
    /* 设置透明色 */
    stroke: rgba(244, 68, 68, 0.3);
  }

  .pb-hour /deep/ path:first-child {
    /* 设置透明色 */
    stroke: rgba(64, 158, 255, 0.3);
  }

  .pb-minute /deep/ path:first-child {
    /* 设置透明色 */
    stroke: rgba(191, 236, 51, 0.3);
  }

  .pb-second /deep/ path:first-child {
    /* 设置透明色 */
    stroke: rgba(103, 194, 58, 0.3);
  }

  .digit-content {
    top: 32px;
    left: 32px;
    height: 96px;
    width: 96px;
    text-align: center;
    color: #fff;
  }

  .time {
    width: 100%;
    font-size: 20px;
    top: 20px;
  }

  .date {
    width: 100%;
    font-size: 14px;
    top: 50px;
  }

  .weather {
    width: 120px;
    height: 200px;
    float: left;
    padding-left: 20px;
  }

  .weather-icon {
    width: 100%;
    height: 50%;
    box-sizing: border-box;
    text-align: center;
    padding-top: 30%;
  }

  .weather-icon i {
    font-size: 60px;
    color: #fff;
  }

  .weather-detail {
    font-size: 10px;
    color: #fff;
    text-align: center;
  }

  .weather-detail span:first-child {
    font-size: 35px;
  }

</style>
