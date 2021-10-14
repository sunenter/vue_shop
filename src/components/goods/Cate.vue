<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 树形表格组件 -->
      <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false"> <!-- columns指定每一列怎么展示 是一个数组 每一项都是一个列 -->
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope"> <!-- 作用域插槽 slot-scope接收数据 -->
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>

      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="querInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="querInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>

    </el-card>

    <!-- 对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <!-- 表单（带验证规则的表单） -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">

          <!-- 级联选择器 options用来指定数据源 props用来指定配置对象 -->
          <!-- 新版element的expand-trigger和change-on-select改为expandTrigger和checkStrictly且expandTrigger要写到下面  -->
          <el-cascader  :options="parentCateList" :props="cascaderProps" v-model="selectedKeys" @change="parentCateChanged" clearable checkStrictly> <!-- @change选中项发生改变就会触发 即移动鼠标就会触发 -->
          </el-cascader>

        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      catelist: [],
      // 总数据条数
      total: 0,

      // 为table指定列的定义 指定每一列怎么展示 是一个数组 每一项都是一个列
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 将当前列定义为模板列 那么是否有效这一列就会在插槽名为isok的模板处进行渲染
          type: 'template',
          // 当前这一列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 将当前列定义为模板列
          type: 'template',
          // 当前这一列使用模板名称
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],

      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 表单数据对象 以供后面请求使用
      addCateForm: {
        // 将要添加的分类的名称 和输入框的内容绑定了
        cat_name: '',
        // 父级分类的Id 这个由下面的父级分类选择决定 选择的是什么id 父级分类id就是什么 监听parentCateChanged事件
        cat_pid: 0,
        // 分类的等级，默认要添加的是1级分类（即下面的不选直接点确定 一级分类值为0） 这个也由下面的父级分类选择决定 监听parentCateChanged事件
        cat_level: 0
      },
      // 验证规则对象
      addCateFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',/* 新版element要写在这里 */
        value: 'cat_id', /* 选中的是哪个属性 */
        label: 'cat_name', /* 显示的是哪个属性 */
        children: 'children' /* 嵌套的是哪个属性 */
      },
      // 选中的父级分类的Id数组 要选两个 所以是数组
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.querInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }

      console.log(res.data)
      // 存储数据列表
      this.catelist = res.data.result
      // 存储总数据条数
      this.total = res.data.total
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 改变
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮，展示添加分类的对话框
    showAddCateDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 再展示出对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      console.log(res.data)
      this.parentCateList = res.data
    },
    // 父级分类选中项发生改变
    parentCateChanged() {
      console.log(this.selectedKeys)
      // 如果 selectedKeys 数组中的 length 大于0，说明选中了父级分类
      if (this.selectedKeys.length > 0) {
        // 赋值父级分类的Id 即数组中最后一项
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 赋值当前分类的等级 三级分类值为2 二级分类值为1 一级分类值为0
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 反之说明没有选中 重置为0（因为可能储存着上一次的结果）
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击确定，添加新的分类
    addCate() {
      // 先进行表单预校验 成功后再发送请求
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }

        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 关闭添加分类的对话框 重置表单数据（即把存储的数据改为0）
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields() /* 清空分类名称 即cat_name 下次打开就为空了 */
      // 清空存储的数据
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
