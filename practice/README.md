# Summer 2026 原创 trace 题库

共 50 题。按 [cse116.com Summer 2026](https://cse116.com/) 的 10 个授课单元组织，每章 5 题；Lecture 9 和 12 是考试，不另设练习章节。Lecture 1 与 2 分别覆盖基础语法和集合/文件。

这些是为离线工具原创的练习，不是复制的课堂题、官方题库或考试预测。问题与答案独立存放。

- [题目册 QUESTIONS.md](QUESTIONS.md)：完整源码、固定输入、空白 JSON。
- [答案册 ANSWERS.md](ANSWERS.md)：全部帧、作用域、堆、历史值、I/O 和可导入答案。
- [验证记录 VERIFICATION.md](VERIFICATION.md)：编译、原程序输出和临时观测副本的历史比对。
- [导入与界面抽查 IMPORT-CHECK.md](IMPORT-CHECK.md)：50 份答案导入往返、两道复杂题的界面抽查及显示限制。
- [Agent 公开入口](../AGENT-START.md)：可随仓库分发，不依赖 AGENTS.md。

| 章节 | 课程单元 / 主要课件 | 题目 | 答案 |
|---|---|---|---|
| 01 Java 基础：表达式、方法与控制流 | [Lecture 1](https://cse116.com/static_files/slides/week1_1_Java.pdf) | [5 题](QUESTIONS.md#chapter-01) | [参考答案](ANSWERS.md#chapter-01) |
| 02 Java 集合、文件与 CSV | [Lecture 2](https://cse116.com/static_files/slides/week2_1_Java.pdf) | [5 题](QUESTIONS.md#chapter-02) | [参考答案](ANSWERS.md#chapter-02) |
| 03 类与对象 | [Lecture 3](https://cse116.com/static_files/slides/week3_1_Classes.pdf) | [5 题](QUESTIONS.md#chapter-03) | [参考答案](ANSWERS.md#chapter-03) |
| 04 链表、栈与队列 | [Lecture 4](https://cse116.com/static_files/slides/Week4_1_Linked_List.pdf) | [5 题](QUESTIONS.md#chapter-04) | [参考答案](ANSWERS.md#chapter-04) |
| 05 继承 | [Lecture 5](https://cse116.com/static_files/slides/Week6_1_Inheritance.pdf) | [5 题](QUESTIONS.md#chapter-05) | [参考答案](ANSWERS.md#chapter-05) |
| 06 多态与比较器 | [Lecture 6](https://cse116.com/static_files/slides/Week9_1_Polymorphism.pdf) | [5 题](QUESTIONS.md#chapter-06) | [参考答案](ANSWERS.md#chapter-06) |
| 07 测试 | [Lecture 7](https://cse116.com/static_files/slides/week2_1_Unit_Testing.pdf) | [5 题](QUESTIONS.md#chapter-07) | [参考答案](ANSWERS.md#chapter-07) |
| 08 树与二叉搜索树 | [Lecture 8](https://cse116.com/static_files/slides/Week7_1_Trees.pdf) | [5 题](QUESTIONS.md#chapter-08) | [参考答案](ANSWERS.md#chapter-08) |
| 09 图与路径 | [Lecture 10](https://cse116.com/static_files/slides/Week10_1_Graphs.pdf) | [5 题](QUESTIONS.md#chapter-09) | [参考答案](ANSWERS.md#chapter-09) |
| 10 运行时间与操作计数 | [Lecture 11](https://cse116.com/) | [5 题](QUESTIONS.md#chapter-10) | [参考答案](ANSWERS.md#chapter-10) |

使用方法：启动应用，在默认 [本地地址](http://127.0.0.1:4173/) 导入 blank 中对应题目的 JSON；完成后另开答案 JSON 比较。需要编译运行时，使用 sources 中的同名 Java 文件；CSV 输入题的文件必须置于运行工作目录。

测试章节用可直接运行的布尔测试驱动表达断言结果，不依赖 JUnit 安装；比较器章节明确给出调用和排序步骤，避免依赖库排序实现的调用次序；图题固定邻居次序；运行时间题明确统计哪一步操作。

维护：`runtime/node.exe scripts/practice/build.mjs` 重建文档与 JSON；`runtime/node.exe scripts/practice/verify.mjs` 用 JDK 重新验证。维护脚本保留在源码仓库；便携包提供现成题目和答案，无需安装 Java 才能使用编辑器。
