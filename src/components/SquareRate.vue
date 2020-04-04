<template>
  <div class="rate-content">
    <el-row style="margin: 10px;">
      <div class="rate">{{ newRate }}<span class="suffix">{{ suffix }}</span></div>
    </el-row>
    <el-row>
      <div class="name">{{ name }}</div>
    </el-row>
  </div>
</template>

<script>
  export default {
    name: 'SquareRate',
    data() {
      return {
        newRate: '0',
      }
    },
    props: {
      rate: String,
      name: String,
      suffix: String
    },
    watch: {
      rate: function (newVal, oldVal) {
        this.newRate = newVal;
      }
    }

  }

</script>

<style scoped>
  .rate-content {
    width: 50%;
    box-sizing: border-box;
  }

  .rate {
    text-align: center;
    padding: 5px 0 0 5px;
    color: #fff;
    font-size: 1.3em;
    font-weight: bold;
  }

  .suffix {
    font-size: 0.5em;
  }

  .name {
    text-align: center;
    color: #fff;
    font-size: 0.8em;
  }

</style>
