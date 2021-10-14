<template>
  <el-container class="home-container">
    <!-- 设置全屏 height 100% -->

    <!-- 头部区域 -->
    <el-header>
      <!-- 这个element标签就是类名 可以直接拿这个设置样式 -->
      <div>
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
      <!-- type="info"灰色按钮 参见element -->
    </el-header>

    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 根据是否折叠决定宽度（折叠起来和menu折叠起来宽度一样） -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>

        <!-- 侧边栏菜单区域 导航菜单 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- router开启路由模式 默认跳转地址为index值 目前为id 要改为数据里面的path属性 -->

          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menulist"
            :key="item.id"
          >
            <!-- for循环要指定不同的key index也是 不然一个展开全部展开 而且得是字符串格式 -->
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <!-- 动态获取阿里图标 先把要用的存储起来 再用id把每个图标一一对应 -->
              <span>{{ item.authName }}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <!-- 将index改为数据里面的path 要想点击菜单高亮显示则要将此菜单的index值赋给menu里的default-active属性 采用监听事件 要将index值放到sessionstorage中 这样每次刷新页面时还能高亮显示这个 -->
              <template slot="title">
                <i class="el-icon-menu"></i>
                <!-- el-icon-menu是element图标 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 路由占位符 welcome users等子组件 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  /* 没有name？ */
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      iconsObj: {
        125: "iconfont icon-user",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-danju",
        145: "iconfont icon-baobiao",
      },
      // 是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath: "",
    };
  },
  created() {
    /* 一打开页面就获取左侧菜单的激活状态 */
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem("activePath");
  },

  methods: {
    logout() {
      window.sessionStorage.clear(); /* 清空token */
      this.$router.push(
        "/login"
      ); /* 重定向到登录页 要用replace push还是能点返回回到这个home页 */
    },
    // 获取左侧的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      // 获取失败：
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      // 获取成功：存放到data里面
      this.menulist = res.data;
      console.log(res); /* 5个一级菜单 children为二级菜单 */
    },
    // 点击按钮，切换菜单的折叠与展开 同时aside的宽度变小 即切换menu的collapse属性 用isCollapse存储数据实现切换
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
      this.activePath = activePath;
    },
  },
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center; /* el-button上下有空隙 */
  color: #fff;
  font-size: 20px;

  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;
  // 菜单右边框对不齐
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em; /* 字体间距 */
  cursor: pointer; /* 鼠标放上去变成小手 */
}
</style>
