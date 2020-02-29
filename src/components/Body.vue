<template>
  <el-container>
    <el-aside width="150px">
      <el-col :span="1" id="side-bar">
        <el-menu :default-active="$route.path" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose"
          background-color="#1350d3" text-color="#fff" active-text-color="#ffd04b" :collapse="isCollapse" router>
          <el-menu-item index="/">
            <i class="el-icon-menu"></i>
            <span slot="title">路段数据展示</span>
          </el-menu-item>
          <el-menu-item index="/float">
            <i class="el-icon-menu"></i>
            <span slot="title">浮动车数据展示</span>
          </el-menu-item>
        </el-menu>
      </el-col>
    </el-aside>

      <el-col :span="23" id="main">
        <router-view></router-view>
      </el-col>


  </el-container>
</template>

<script>
  export default {
    name: "Body",
    data() {
      return {
        isCollapse: true
      }
    },
    methods: {
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      }
    }
  }

</script>

<style scoped>
  #side-bar {
    width: 64px;
    height: 100vh;
    background-color: #1350d3;
    overflow-x: visible;
  }

  #main {
    height: 100vh;
    overflow-x: visible;
    overflow-y: scroll;
  }

</style>
