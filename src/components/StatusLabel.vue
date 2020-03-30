<template>
  <el-button :class="setClass(status)">
    {{ newMsg || statusMap[status] }}
  </el-button>
</template>

<script>
  export default {
    name: 'StatusLabel',
    data() {
      return {
        newMsg: 0,
        statusMap: ['暂无数据', '态势一', '态势二', '态势三', '态势四', '态势五', '态势六', '态势七', '态势八'],
        styleMap: ['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']
      }
    },
    props: {
      status: Number, 
      msg: Number
    },
    watch: {
      msg: function (newVal, oldVal) {
        this.newMsg = newVal;
      }
    },
    methods: {
      setClass(clsStatus) {
        let cls = {};
        cls[this.styleMap[clsStatus]] = true;
        return cls;
      }
    }
  }

</script>

<style scoped>
  .el-button {
    color: #fff;
    text-align: center;
    font-size: 10px;
    padding: 5px
  }

  .el-button>>>span {
    display: block;
    width: 48px;
    line-height: 20px;
    box-sizing: border-box;
    margin: 0 auto;
  }

  .c0 {
    border: 1px solid rgb(114, 106, 106);
    background-color: rgb(114, 106, 106, 0.5);
  }

  .c1 {
    border: 1px solid rgb(0, 165, 201);
    background-color: rgb(0, 165, 201, 0.5);
  }

  .c2 {
    border: 1px solid rgb(139, 209, 0);
    background-color: rgb(139, 209, 0, 0.5);
  }

  .c3 {
    border: 1px solid rgb(103, 1, 171);
    background-color: rgb(103, 1, 171, 0.5);
  }

  .c4 {
    border: 1px solid rgb(255, 128, 0);
    background-color: rgb(255, 128, 0, 0.5);
  }

  .c5 {
    border: 1px solid rgb(255, 0, 0);
    background-color: rgb(255, 0, 0, 0.5);
  }

  .c6 {
    border: 1px solid rgb(195, 1, 124);
    background-color: rgb(195, 1, 124, 0.5);
  }

  .c7 {
    border: 1px solid rgb(56, 168, 0);
    background-color: rgb(56, 168, 0, 0.5);
  }

  .c8 {
    border: 1px solid rgb(255, 255, 0);
    background-color: rgb(255, 255, 0, 0.5);
  }

</style>
