<template>
  <div>
    <!-- 面包屑导航区域 这个组件的样式其他组件也用的到 所以写到公共样式里 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item> <!-- 点击回到welcome 因为重定向 -->
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- layout栅格 设置多少行多少列 span是宽度 gutter是间隙 -->
      <el-row :gutter="20">

        <el-col :span="8">
          <!-- 搜索与添加区域 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList"> <!-- 将value和query双向绑定 点击搜索就发送请求 请求相应的数据 放到userlist里 如果默认不搜索就是请求所有的数据 同时加上clearble属性 使得点击可以清除输入内容 于是触发clear事件 监听事件让下面显示所有数据 -->
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>

        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button> <!-- 点击这个按钮 对话框显示出来 -->
        </el-col>

      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe> <!-- 跟menu一样 把要展示的数据存储到table自带的属性data里面 下面再用prop取对应的数据 和v-model双向绑定 -->
      
        <el-table-column type="index"></el-table-column> <!-- column索引列 只要加上type="index" -->
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>

        <el-table-column label="状态">
          <template slot-scope="scope"> <!-- 作用域插槽 新版是v-slot="scope" scope.row代表这一行的所有数据 这是从上面userlist里拿出来的 -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"> <!-- 将开关的状态和数据里的mg_state绑定 -->
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180px">
          <template slot-scope="scope"> <!-- 作用域插槽 -->
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button> <!-- 把对应的id传过去发起相应的数据请求 -->
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false"> <!-- 鼠标放上去提示文字 enterable鼠标不可以进入到提示文字 即自动隐藏 -->
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>

      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> <!-- layout表示显示哪些东西 -->
      </el-pagination>

    </el-card>

    <!-- 添加用户的对话框 根据addDialogVisible显示或隐藏 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"> <!-- :value="item.id"选中的其实是id（都是用的id） 这样v-model是当前选中的value值（即id）和selectedRoleId进行绑定（？）当点击确定的时候就将selectedRoleId保存到当前的用户信息中 -->
            </el-option>
          </el-select>
        </p>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
    
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的自定义规则（查看element）
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式（ppt有）
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) { /* 校验通过 */
        return cb() /* cb随便取的 组件应该定义好了 */
      }

      cb(new Error('请输入合法的邮箱')) /* 传递一个错误对象 */
    }

    // 验证手机号的自定义规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }

    return {
      // 获取用户列表的参数对象 原数据是一整条 根据页数和条数返回相应的数据 如每页显示3条 第2页 就会把第4 5 6个数据返回 拿到后就把这3个渲染出来 total控制着页码组件的数据显示
      queryInfo: {
        // 搜索关键字 和搜索框的value进行了双向绑定
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      userlist: [], /* 返回的数据存储到这里 */
      total: 0,

      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象 跟之前一样
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }, /* 必填项 验证是否输入了用户名 */
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用户名的长度在6~15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' } /* 查看element */
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },

      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的用户信息对象
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 已选中的角色Id值
      selectedRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo /* 将参数放到data里面 因为下面还要根据选择的条数等重新请求 参数会变 */
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }
      this.userlist = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    // 监听 下拉页码 改变的事件 newsize为选择的条数 选择了几条就把这个作为参数传给数据请求中重新请求
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听 页码值 改变的事件 newPage为选择的页码值 选择了第几页就把这个页码作为参数传给数据请求中重新请求
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听 switch 开关状态的改变 调用put请求把原数据更改 这样每次刷新页面时就能保存这个状态 相当于把这个状态存储起来了（原数据存储的方式）
    async userStateChanged(userinfo) {
      console.log(userinfo)
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) { /* 原数据修改失败 页面的状态重置回去（保持跟原数据一样 刷新也行） */
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
    },
    // 监听添加用户对话框的关闭事件 表单重置 状态保存 这样每次打开都是上次关闭的状态
    addDialogClosed() {
      this.$refs.addFormRef.resetFields() /* resetFields是form表单的一个方法 */
    },
    // 点击确定，添加新用户 进行预校验
    addUser() {
      this.$refs.addFormRef.validate(async valid => { /* 校验通过 valid为true 否则为false */
        if (!valid) return
        // 校验通过 发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)

        // 请求的返回结果
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功！')
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        // 重新获取用户列表数据（因为有绑定了 所以会自动渲染出来）
        this.getUserList()
      })
    },

    // Day3:
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      // console.log(id)
      const { data: res } = await this.$http.get('users/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败！')
      }
      // 储存数据
      this.editForm = res.data
      // 显示对话框
      this.editDialogVisible = true
    },
    // 监听修改用户对话框的关闭事件 保存验证状态 下次打开时依然是那些数据
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定进行预验证 并提交数据
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起修改用户信息的数据请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          { /* 不加id吗？ */
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败！')
        }

        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getUserList()
        // 提示修改成功
        this.$message.success('更新用户信息成功！')
      })
    },
    // 根据Id删除对应的用户信息
    async removeUserById(id) {
      // 弹框询问用户是否删除数据（参见element）
      const confirmResult = await this.$confirm( /* 先给vue挂载了$confirm函数 里面的参数代表弹框显示的内容样式 函数的返回值是promise 所以可以用asyc和await来优化 这样返回的值即confirmResult就是一个字符串了（之前的是一个数据）如果确定就是confirm 取消就是cancle 由catch捕获 */
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err) /* 点取消则由catch捕获异常 return err的简写 把err返回 */

      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      // 确认删除 先发送请求 判断删除是否成功 不用传id参数
      const { data: res } = await this.$http.delete('users/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败！')
      }

      this.$message.success('删除用户成功！')
      this.getUserList()
    },
    // 展示分配角色的对话框
    async setRole(userInfo) {
      this.userInfo = userInfo

      // 在展示对话框之前，先获取所有的角色列表并存储起来
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }

      this.rolesList = res.data

      this.setRoleDialogVisible = true
    },
    // 点击确定，分配角色
    async saveRoleInfo() {
      // 还没选择新的角色
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色！')
      }

      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败！')
      }

      this.$message.success('更新角色成功！')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 关闭分配角色的对话框 重置 也就是将当前选择项清空 不然下次打开这个对话框还是选择的这个
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
</style>
