import Vue from 'vue'
import Router from 'vue-router'

// 路由懒加载：分组名称一样则会打包到同一个js文件中 这样一个组件加载了其他的也会加载
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ './components/Login.vue')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ './components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ './components/Welcome.vue')

const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ './components/user/Users.vue')
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ './components/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ './components/power/Roles.vue')

const Cate = () => import(/* webpackChunkName: "Cate_Params" */ './components/goods/Cate.vue')
const Params = () => import(/* webpackChunkName: "Cate_Params" */ './components/goods/Params.vue')

const GoodsList = () => import(/* webpackChunkName: "GoodsList_Add" */ './components/goods/List.vue')
const Add = () => import(/* webpackChunkName: "GoodsList_Add" */ './components/goods/Add.vue')

const Order = () => import(/* webpackChunkName: "Order_Report" */ './components/order/Order.vue')
const Report = () => import(/* webpackChunkName: "Order_Report" */ './components/report/Report.vue')

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' }, /* 重定向 */
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params },
        { path: '/goods', component: GoodsList },
        { path: '/goods/add', component: Add },
        { path: '/orders', component: Order },
        { path: '/reports', component: Report }
      ]
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  //     next()  放行    next('/login')  强制跳转

  if (to.path === '/login') return next()
  // 其他页面则要有token才能放行 之后的网络请求中要拿这个token放入请求头中
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login') /* 没有用else if */
  next()
})

export default router /* 因为要挂载导航守卫 所以不能实时导出 */
