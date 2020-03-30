<template>
  <div class="clock-content">

    <div class="grid-content bg-purple">
      <div class="clock">
        <el-row class="date">{{ date }}</el-row>
        <el-row class="day-pb-wrapper">
          <el-progress :percentage="dayProgressCom" :color="pbColors[0]" :show-text="false" :stroke-width="10"></el-progress>
        </el-row>
        <el-row class="time">{{ time }}</el-row>
        <el-row class="hour-pb-wrapper">
          <el-progress :percentage="hourProgressCom" :color="pbColors[1]" :show-text="false" :stroke-width="10"></el-progress>
        </el-row>
        <el-row class="minute-pb-wrapper">
          <el-progress :percentage="minuteProgressCom" :color="pbColors[2]" :show-text="false" :stroke-width="10"></el-progress>
        </el-row>
        <el-row class="second-pb-wrapper">
          <el-progress :percentage="secondProgressCom" :color="pbColors[3]" :show-text="false" :stroke-width="10"></el-progress>
        </el-row>
      </div>

    </div>

  </div>
</template>

<script>
  export default {
    name: 'Clock',
    data() {
      return {
        today: new Date(),
        now: new Date(),
        cnt: 0,
        dayProgress: 0,
        hourProgress: 0,
        minuteProgress: 0,
        secondProgress: 0,
        pbColors: [
          '#909399',
          '#409eff',
          '#67C23A',
          '#F44444'
        ]
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
        return this.today.getFullYear() + '-' + this.$options.methods.formatTime(this.today.getMonth()) + '-' + this
          .$options
          .methods.formatTime(this.today.getDate());
      },
      time: function () {
        return this.$options.methods.formatTime(this.now.getHours()) + ':' + this.$options.methods.formatTime(this.now.getMinutes()) + ':' + this
          .$options
          .methods.formatTime(this.now.getSeconds());
      },
    },
    methods: {
      startClock: function () {
        setInterval(this.updateClock, 500);
      },
      updateClock: function () {
        this.now = new Date();
        if (this.now.getDate() !== this.today.getDate()) {
          this.today = this.now;
        }

        this.dayProgress = this.now.getHours() / 23;

        this.hourProgress = this.now.getMinutes() / 59;
        this.minuteProgress = this.now.getSeconds() / 59;
        this.secondProgress = (++this.cnt) / 2 < 1 ? 0: 1;
        this.cnt = this.cnt % 2;
      },
      formatTime(str) {
        str = '0' + str;
        return str.substring(str.length - 2);
      }
    },
    mounted() {
      this.startClock();
    },
    beforeDestroy() {
      if (this.updateClock) {
        clearInterval(this.updateClock);
      }
    }
  }

</script>

<style scoped>
  .clock-content {
    display: block;
    width: 100%;
    height: 260px;
  }

  .grid-content {
    border-radius: 4px;
    min-height: 36px;
    height: 100%;
  }

  .bg-purple {
    background: #d3dce6;
  }

  .clock {
    width: 80%;
    height: 100%;
    margin: 0 auto;
    text-align: center;
  }

  .el-row {
    margin: 15px;
  }

  /* .el-progress {
    border: solid .5px #000;
    border-radius: 4px;
  } */

  .date,
  .time {
    font-size: 35px;
    font-weight: bold;
  }

  .date.el-row {
    margin-top: 0;
    padding-top: 15px;
  }

</style>
