<template>
  <div class="rate-content">
    <div class="grid-content bg-transparent rate-analysis">
      <el-row>
        <el-col :span="15">
          <el-row style="margin: 10px;">
            <div class="rate" :style="color">{{ newRate }}</div>
          </el-row>
          <el-row>
            <div class="name">{{ name }}</div>
          </el-row>
        </el-col>
        <el-col :span="9">
          <div class="rate-chart-icon">
            <i :class="icon" :style="color"></i>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Rate',
    data() {
      return {
        newRate: 0
      }
    },
    props: {
      rate: String,
      name: String,
      color: String,
      icon: String
    },
    watch: {
      rate: function (newVal, oldVal) {
        this.newRate = newVal;
      }
    }

  }

</script>

<style scoped>
  .rate-analysis {
    height: 50px;
  }

  .rate {
    display: block;
    text-align: center;
    padding: 5px 0 0 5px;
    font-size: 1.7em;
    font-weight: bold;
  }

  .name {
    display: block;
    text-align: center;
    color: #fff;
    font-size: 0.8em;
  }

  .rate-chart-icon {
    text-align: center;
    padding-top: 20px;
  }

  .rate-chart-icon i {
    font-size: 3em;
  }

  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }

  .bg-transparent {
    background: rgba(0, 0, 0, 0);
  }

</style>
