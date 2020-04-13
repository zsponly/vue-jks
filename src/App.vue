<template>

  <div id="app">

    <!-- 头部开始 -->
    <div class="headerWrapper">
      <header class="header">
        <div class="container">
          <router-link to="/"><span class="home-title">云智行</span></router-link>

          <el-menu :default-active="$route.path" class="el-menu-demo" mode="horizontal" @select="handleSelect"
            active-text-color="#0077E6" background-color="#141516" router>
            <el-menu-item index="/">路段</el-menu-item>
            <el-menu-item index="/float">浮动车</el-menu-item>
            <el-menu-item index="/history">历史数据查询</el-menu-item>
            <el-menu-item index="/daily">数据分析</el-menu-item>
          </el-menu>
        </div>
      </header>
    </div>
    <!-- 头部结束 -->

    <!-- 主体开始 -->
    <div class="content">
      <router-view></router-view>
    </div>

    <!-- 主体结束 -->

    <!-- 尾部开始 -->
    <footer>
      <a href="http://www.beian.miit.gov.cn"><span>皖ICP备20005848号</span></a>
    </footer>
    <!-- 尾部结束 -->

  </div>

</template>

<script>
  export default {
    name: 'App',
    data() {
      return {
        activeIndex: '1',
        activeIndex2: '1'
      };
    },
    methods: {
      handleSelect(key, keyPath) {
        console.log(key, keyPath);
      }
    }
  }

</script>

<style>
  body {
    text-shadow: none !important;
  }

  .test {
    width: 100vw;
    height: 1000px;
    background-color: #2c2e33;
  }

  #app {
    display: block;
    overflow-y: hidden;
    height: 100%;
  }

  .headerWrapper {
    position: fixed;
    display: block;
    width: 100%;
    left: 0;
    top: 0;
    z-index: 1;
    background-color: #141516;
    margin: 0 0 5px;
    z-index: 20;
  }

  .home-title {
    color: #0077E6;
    position: absolute;
    font-size: 2em;
    margin: 0;
    width: 100px;
    height: 100%;
  }

  .container {
    position: relative;
    width: 1140px;
    height: 60px;
    box-sizing: border-box;
    padding: 0;
    margin: 0 auto;
  }

  .content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    min-height: 100%;
    height: auto;
    background-color: #2c2e33;
    padding: 7% 0;
    box-sizing: border-box;
    overflow: hidden;
  }

  footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 20px;
    background-color: #202124;
    text-align: center;
    margin: 0 auto;
    z-index: 1000;
  }

  footer a span {
    color: #8A8C8F;
  }

  .el-menu {
    float: right;
    height: 58px;
  }

  /* 全局dialog样式开始 */
  .el-dialog {
    background-color: #292A2D;
  }

  .el-dialog__body {
    padding: 0 20px 20px;
  }

  .el-dialog__title,
  .el-dialog__body {
    color: #8A8C8F;
  }

  /* 全局dialog样式结束 */

  .el-radio-group {
    width: 243px;
    background-color: rgba(0, 0, 0, 0);
  }

  .el-radio-button__inner {
    width: 81px;
  }

  .el-radio-button.is-active .el-radio-button__inner {
    border: 1px solid #409EFF !important;
    background-color: rgba(64, 158, 255, 0.5) !important;
  }

  .el-radio-button .el-radio-button__inner {
    background-color: rgba(0, 0, 0, 0.5);
    border: 1px solid #303030;
  }

  .el-radio-button:first-child .el-radio-button__inner {
    border-left: 1px solid #303030;
    border-radius: 0 0 0 4px;
  }

  .el-radio-button:last-child .el-radio-button__inner {
    border-radius: 0 0 4px 0;
  }

</style>
