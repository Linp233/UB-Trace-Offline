# CSE116 Java trace JSON：agent 编写指引

适用工具：Tracing Offline v0.1。指引版本：`cse116-java-2026-09-28`。

公开入口与可复制提示词见 [AGENT-START.md](AGENT-START.md)。本文件和 JSON 规范可独立分发，不依赖本地 AGENTS.md。

读者已经能独立 trace Java。本文件规定怎样把执行过程写成可导入、可复核的图表，不要求读者知道以前的对话。先读本文件，再读 [SCHEMA.md](SCHEMA.md) 的字段定义；完整对象题优先使用原生 `trace` 格式。只需要交付 JSON 时，不必启动服务或修改当前草稿。

## 1. 依据与优先级

截至 2026-09-28，cse116.com 首页标注 **Summer 2026**。核对过的本地 Fall 2026 资料目录中，课件索引也注明来源是该 Summer 页面，Student Notes 的内部标题是 Spring 2026。因此，下列内容是有来源的 CSE116 通用表示法及本工具的明确默认值，不能宣称是已确认的 Fall 2026 考试评分细则。

| 标记 | 来源及定位 | 用途 |
|---|---|---|
| R | [Memory Diagram Reference，2026-03-28](https://cse116.com/static_files/MemoryDiagrams-Java.pdf)；页码是 PDF 的 1-based 页码 | p.1–4 值历史、调用、循环；p.5–7 集合；p.8–10 递归；p.11–16 对象、继承 |
| C | [Classes](https://cse116.com/static_files/slides/week3_1_Classes.pdf)，p.8–17、20–42 | `this`、字段、字符串和装箱类型的课程简化、逐步对象图 |
| C2 | [Classes Part 2](https://cse116.com/static_files/slides/week3_2_Classes.pdf)，p.2–10 | 集合、构造器、参数和 `this` |
| E | [Execution and Heap](https://cse116.com/static_files/slides/week3_3_Execution_Heap.pdf)，p.16–23 | 不展开 Java 库内部帧，组合对象、方法调用与引用 |
| I | [Inheritance](https://cse116.com/static_files/slides/Week6_1_Inheritance.pdf)；[Inheritance and Override](https://cse116.com/static_files/slides/Week6_2_Inheritance.pdf) | 父构造器、继承状态和覆盖方法 |
| P | [Polymorphism](https://cse116.com/static_files/slides/Week9_1_Polymorphism.pdf)，p.7–13 | 引用声明类型与实际对象类型、动态派发 |
| J | [JLS §12.5](https://docs.oracle.com/javase/specs/jls/se21/html/jls-12.html#jls-12.5)、[JLS §15.7](https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.7) | 初始化与求值顺序；用于核对 Java 语义，不用于推断课堂画法 |
| T | 本项目 `lib/document.mjs`、原生编辑器及本指引 | JSON 字段、显示限制、确定的编码默认值 |

遵循顺序：题目明确指定的追踪时点/输入/画法 → 该题配套的课程示例或说明 → 本指引。不要用本工具的默认画法覆盖题目要求。Java 运算仍须正确；发现参考图的数值笔误时记录差异，不复制笔误。来源未规定的规则在下面标成 **T 默认**，不要声称是教师要求。

## 2. 开始工作时直接采用的默认值

1. **追踪范围（T 默认）：** 从题目入口执行到正常结束，保留整个执行期间的历史。若题目指定“某行之前/之后”，严格停在那里；循环中的行还要确定第几次执行。不能把程序末态冒充中间时点。
2. **文档形式（T）：** 一个 JSON 是一个累计图表，不是逐指令播放序列。需要多个时点时，交付多个明确命名的 JSON。
3. **输入：** 使用题目给定的输入与初态。没有外部输入、随机数或时间依赖的普通 `main`，直接执行。读到缺失的实际输入、缺失的方法体、无法确认的截图文字时，先指出缺失项，不编造值。
4. **`args`（T 默认，符合 R 示例）：** 未使用时省略；代码读取 `args` 时必须包括数组和内容，参数缺失则需要输入。不能因“通常省略”跳过实际被访问的数据。
5. **完成状态（T 默认）：** 正常结束时所有已结束的调用帧及局部块均为 `released`；空的 globalVariables scope 保持 `active`。中途暂停时，尚未返回的调用帧仍为 `active`。保留释放帧，不删除它们。R 的不同截图不都展示同一个结束时点，不凭某张图的 main 颜色推断统一终点。
6. **地址（T 默认）：** 按被追踪对象的真实分配次序使用 `0x100`、`0x101`、`0x102`……；按课程模型省略的字符串、装箱值和库内部临时对象不占编号。地址只用于标识对象，不能随着变量名、静态类型或调用次数改变。分配后不重用地址。
7. **输出：** 所有真正执行的输出按顺序放入 I/O。不要加入解释性句子、调试文字或不存在的输出。

每份 JSON 的 `notes` 至少写清：profile 版本、追踪终点、输入、是否省略 args，以及适用的例外。建议：

```text
profile=cse116-java-2026-09-28; checkpoint=normal program exit; input=none; args=omitted (unused); histories=retained; loopLocals=grouped by declaration; fieldDefaults=observable-only; indirectReturns=see notes; exceptions=none.
```

“无需猜测”指已有确定规则就执行；实际程序输入或题意缺失时，明确标出缺失事实，而不是替题目选一个答案。

## 3. 从执行记录映射到图表

### 3.1 值、引用和历史

- Java 原始类型写直接值；`String` 和装箱类型也按值表示，不另画字符串池或包装对象。这是 C p.17 的课程简化，不是 JVM 的完整存储模型。字符串仍保留双引号，字符保留单引号。
- 自定义对象、数组、集合放在 heap；局部变量、形参、对象字段中的引用写它们的地址。`null` 写字符串 `"null"`，不要创建 null 堆对象。引用赋值复制地址，不复制对象。[C、C2]
- `valueUpdates` / `values` 按每次实际赋值的先后排列。重复赋相同值也保留一次新记录（T 默认）。不要只留最终值，也不要把条件判断、读取或未执行的赋值加入历史。
- 所有值都是 JSON 字符串：整数 `"3"`、double `"3.0"`、boolean `"false"`、Java 字符串 `"\"hello\""`、char `"'x'"`、空引用 `"null"`、对象引用 `"0x100"`。不能写 JSON 数字 `3` 或 JSON `null` 作为 Java 值。
- 局部变量声明未初始化，或右侧调用尚未返回：原生格式可用 `valueUpdates: []` 表示尚无已赋值。不要假填 `0`、`null`、空字符串或 `?`。简化格式不支持空的 `values`。
- **字段默认值（T 默认）：** Java 执行时所有字段确有默认初始化；内部推导必须考虑它。为匹配常见课堂图，若默认值在第一次显式初始化/赋值前既未读取、也未出现在指定暂停点，图中省略该隐式默认值。否则必须显示正确默认值。显式写出的初始化一律记录；未被显式赋值的字段也显示其默认值。数组 `new int[n]` 的各元素从 `0` 开始记录。此“observable-only”是显示规则，绝不能改变初始化语义。[C 对象图；J]
- 计算依 Java 类型与求值顺序；特别留意整数除法、短路、前后自增、数值提升及字符串拼接。不能用 Python/JavaScript 的运算替代 Java 语义。[J]

### 3.2 调用帧、ID 和作用域

- 每次进入被追踪的自定义方法/构造器都建立新帧，包括重复调用、递归及空构造器；按**进入次序**放入 `stackFrames`，不是返回次序。原生 `totalStackFramesAtInsert` 使用从 0 起的进入序号。[R p.2、8；T]
- `name` 是可读的方法/构造器名。为消除覆盖方法歧义，本指引采用 `Counter.bump` 这种类限定方法名，构造器用 `Counter`；这只是 T 命名约定。不同调用可同名，但 ID 必须不同。
- 原生 ID 推荐 `f-main-1`、`f-bump-1`、`f-bump-2`；变量 `v-main-total`、`v-bump-1-this`；scope `s-main`、`s-main-loop1`。**所有类型的 ID 都在整个 trace 中唯一**，不是只在一个帧中唯一。显示名称、ID、堆地址是三种不同东西。
- 实例方法及构造器的第一行放 `this`，值为实际接收者地址；然后按源码参数顺序放形参，再按首次执行声明的顺序放局部变量。静态方法无 `this`。[C、C2；行序为 T 默认]
- 块中存在局部变量时，建立嵌套 scope。变量放在其声明所在的作用域；不要把外层变量的更新复制成块内新变量。为阴影同名变量分配不同 ID。
- **循环的默认图法：** 同一调用帧、同一循环声明位置的 `i` 和循环体局部 `temp` 放在循环 scope；每次迭代的赋值累计到同一行历史。这与 R p.4 的画法一致。它是对多次局部生命周期的课堂合并表示，不表示 Java 只创建了一次局部变量。循环结束后整个 scope 释放。
- 不同循环声明、不同调用帧、不同分支中的同名变量绝不合并。若题目要求逐次迭代的生命周期，则改用每次迭代独立 scope，并在 notes 声明该覆盖规则。
- `for` 的最后一次实际增量也要保留，即便它使下一次条件为 false；`break` 后未执行的增量不记录。`while` 的计数器若声明在外部，仍留在外部。[R 循环示例；Java 语义]
- 默认不画没有任何被跟踪局部变量的空块；增强 for 的迭代器内部状态不展开（T 默认）。

### 3.3 构造器、继承、动态派发

- 一次 `new Child(...)` 分配一个实际类型为 `Child` 的对象。为 `Child(...)` 和执行到的自定义父构造器分别建帧，它们的 `this` 是同一地址，继承字段在同一个对象内。`super(...)` 不是第二次分配。[I]
- `this(...)` 构造器链同样共享对象；每次构造器调用有独立帧。隐式调用自定义父类的无参构造器也要追踪；不能因为源码未写 `super()` 就漏掉实际发生的调用。[I、J]
- Java 库内部方法/构造器不画帧，例如 `Object()`、`ArrayList.add`、`String` 内部实现、`println`。只记录它们对被追踪数据和 I/O 的影响；如果题目明确给出并要求追踪其实现，则按题目执行。[E p.16]
- 求值与实例初始化按 Java 规则进行；普通课程写法中先完成父构造器，再执行当前类实例字段初始化器/初始化块，再执行当前构造器其余正文。默认值可能在构造期间被读到，不能提前把全部字段填成构造完成值。[J]
- heap 的 `objectType` 写实际运行时类，不能用变量的声明类型替代。普通实例调用按实际对象选择 override；`super.method()` 执行指定父实现，但 `this` 仍是原对象。[P、I]
- 堆字段名按源码名称；有同名隐藏字段时用 `Base.value` 与 `Child.value` 消歧，不能合并。字段显示顺序默认本类声明顺序，然后逐层父类（T 默认）。
- `constructorStackFrameId` 指向**这次 new 首先进入的最外层构造器帧**。父构造器、`this(...)` 委托帧和之后调用的方法都不替换它。该字段用于显示关联和颜色，不代表 Java 构造器有返回值。（T 映射，与 R 对象图对应）
- 多个对象即使字段完全相同也有不同地址。保留曾分配的对象，不模拟垃圾回收；不可达对象可在 notes 注明（T 默认）。

### 3.4 返回箭头：按这张表决定

箭头目标是**变量 ID**，不是地址、字段文字或某一次 value-update ID。普通对象引用由地址匹配显示，不能用返回箭头代替。

| 调用所在表达式 | 本指引的编码 |
|---|---|
| `int x = f();` 或 `x = f();` | f 帧的返回目标指向这个 x 的 variableId；返回后才追加 x 的值 |
| `obj.field = f();`、`arr[i] = f();` | 指向求值时确定的实际堆字段/元素变量 ID；不能因为 f 修改了别名/索引就重新选择目标 |
| `Child x = new Child(...);` | 最外层构造器帧指向 x；堆对象关联同一构造器帧。这是图表的分配结果箭头 |
| `super(...)`、`this(...)` | 委托帧返回目标为 `null`，不伪造接收变量 |
| `void` 调用或丢弃返回值的 `f();` | 返回目标为 `null` |
| `x = f() + g();`、`x += f();`、`println(f());`、`f(g());` | 被嵌入表达式的调用不直接赋给 x；返回目标为 `null`，在 notes 记录各调用的返回值和用途。仍追踪调用、实际计算、最后赋值和输出 |
| `return f(...);`，包括尾递归 | 内部 f 不直接返回给一个源码变量，默认省略其箭头；外层直接赋给变量的调用仍画箭头。R p.9 明确允许省略此类间接箭头 |
| 暂停时调用尚未返回 | `returnsToVariableId: null`，notes 记待返回目标；不要提前画已返回箭头或填入接收值（T 默认） |

间接返回 notes 示例：`f-bump-1-base returned 5 to f-bump-1's return expression; f-bump-1 returned 5 to v-main-loop-result.` 不为画箭头而添加源码不存在的 `temp`、`return` 变量。普通递归中的 `int smaller = sum(n-1)` 必须指向**直接调用者该次调用的 smaller**，不能全部指向 main。

原生格式只有变量级箭头，无法绑定到历史中的某一次赋值；多次返回同一行时，靠帧次序、变量历史和必要的 notes 说明，不能声称有逐值箭头。

**v0.1 显示限制：** 指向 Heap 字段/元素的返回目标可在 JSON 中保存，但跨 Stack / Heap 面板的连线可能被滚动面板裁切。已在练习 08-5 的递归返回到 `left` 字段时观察到这个现象。仍填写真实目标 ID，并在 notes 或答案文字中明确调用帧与目标字段；核对 JSON 和文字映射，不要为了让箭头看得见而改指 main 中的变量或制造临时变量。

### 3.5 堆容器、static、I/O 和格式边界

- 数组和 ArrayList：每个容器一个对象；元素名为 `"0"`、`"1"` 等，按索引排列。自定义对象元素存地址，Integer/String 元素存直接值。不展开 ArrayList 容量、底层数组或 boxed 对象。[C2；T 字段映射]
- HashMap：元素名使用键的显示值（String 键保留双引号），变量值是关联值；重新 put 同一键就追加该值历史。[R p.7] map 在图中的条目默认按首次插入次序排版，这**不代表迭代顺序**。若顺序影响计算或 I/O，必须有题目指定顺序或指定环境下的已核实顺序；[HashMap API](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html) 不保证遍历顺序，不能拿排版顺序当执行顺序。
- 自定义链表、树、栈/队列：按题目类的实际对象与字段逐个画；`next`/`left`/`right` 是地址或 `null`，共享节点和环仍只画一次对象。不要把自定义 Node 链压成一个 ArrayList。[对象模型；T]
- **static 字段（T 显示约定）：** v0.1 的 Java 界面不渲染 `globalVariables`（该区仅在 Python 模式显示），所以不要把 Java static 状态仅放在那里。每个有被追踪 static 字段的类在 heapObjects 增加一个**明确标注的共享类存储区**：`memoryAddress: "static:Counter"`、`objectType: "Counter (static storage)"`、`constructorStackFrameId: null`，字段名如 `Counter.calls`；所有调用共享同一字段 ID 和历史。它不是 new 出来的实例，`static:Counter` 不是程序中的对象引用，也不计入实例分配数。共享类存储区放在普通对象前，按首次类初始化顺序排列；notes 明说这是工具显示约定。不要为每个实例复制 static 字段，也不要在 globalVariables 再放一份。自定义 static 初始化中的实际方法调用仍按进入次序保留；不虚构 JVM 启动帧。若题目给了不同画法，按题目并记录。
- 每条 I/O 保存实际显示文本，String 的源码引号不打印。`print("a")` 后 `println("b")` 合成一行 `"ab"`；显式空行用 `""`；单纯末尾换行不多造一个空行。输入/输出混合时按发生顺序记录，notes 区分输入来源；格式本身没有方向标记。
- 原生 v1 没有容器元素删除标记。发生 remove/clear 时，图中保留终点实际存在的元素和有效索引；已删除内容及索引移动前后的历史写入 notes，复杂删除过程另外交付前后时点 JSON。不得把 `"deleted"` 写成假 Java 值。需要单图无损表达全部删除历史时，明确说明格式做不到。
- String 引用身份/字符串池、反射、线程交错、JVM 垃圾回收、库内部堆布局等不在此课堂简化模型内；遇到实际依赖这些行为的题，使用题目给出的模型，不能机械套用“String 是直接值”来判断身份比较。
- 编译失败的程序没有正常执行轨迹。异常题若未指定暂停点，默认停在异常抛出前的最后一个完整状态，在 notes 标明异常及位置；不要制造成功返回或猜测平台相关堆栈输出。无限运行的题需要确定的停止条件。

## 4. 写 JSON 的固定工作流

1. 通读完整代码，确认入口、输入和终点。列出实际调用进入顺序、每次对象分配及地址、各变量/字段历史和 I/O。此时就完成独立 trace。
2. 按第 3 节把执行记录映射为图表。对象题使用原生格式；读 [SCHEMA.md 的原生字段契约](SCHEMA.md#原生-trace-完整字段契约)。不要凭字段名字发明扩展字段。
3. 为所有节点分配唯一 ID，再连接返回目标和 constructorStackFrameId。不要以为简化格式的 frame.id 会被保留为原生 stackFrameId。
4. 写 UTF-8 JSON（无 BOM），`code` 放完整原题源码，`language` 为 `java`；说明放 `notes`。不要为了让图更容易画而改题目代码。
5. 在项目根目录执行结构校验/标准化。使用随包 runtime，不依赖系统 node；先确保输出父目录存在。例如：

   ```powershell
   .\runtime\node.exe tools\import.mjs examples\agent-oop.trace.json --output "$env:TEMP\agent-oop.normalized.json"
   ```

   `--output` 只写指定文件，不接触草稿或练习库。返回成功只证明 schema/ID/链接有效，**不会验证 Java 答案**。

6. 对照下节复核语义。如果用户还需要在工具中查看，可在已启动的服务上执行：

   ```powershell
   .\runtime\node.exe tools\import.mjs examples\agent-oop.trace.json
   ```

   它建立库副本并打印打开 URL；也可用页面“导入 JSON”。不要直接写 draft 来覆盖浏览器状态，不要执行私有 bridge。

7. 在 UI 核对 stack/heap/I/O、红叉、地址引用框、构造器颜色及返回箭头。长图需要滚动查看，单张 PNG 只覆盖可见部分。没有做 UI 检查就如实写“结构验证、语义复核完成；未作 UI 检查”。
8. 交付 JSON 文件链接、追踪终点、采用的默认值/例外及验证范围。不能把“运行输出吻合”说成“全部历史和作用域均已自动验证”。

## 5. 完整参考例子与验收

这些是为本项目新写的通用示例，不是课堂作业答案，也不是逐字复制课程示例。

- [AgentOopReference.java](examples/AgentOopReference.java) → [agent-oop.trace.json](examples/agent-oop.trace.json)：继承、两个对象、同址别名、`this`、父构造器、override + super 方法、循环局部历史、重复调用、共享 static 字段、字符串输出。
- [AgentRecursionReference.java](examples/AgentRecursionReference.java) → [agent-recursion.trace.json](examples/agent-recursion.trace.json)：普通递归的独立调用帧和直接调用者返回目标。
- [Summer 2026 原创题库](practice/README.md)：10 章各 5 题，题目和答案分册；另有 50 份空白练习 JSON 和 50 份完整答案 JSON。
- [生成脚本](scripts/agent-examples.mjs) 只把已推导的状态编码成原生 JSON，不执行 Java。`runtime/node.exe scripts/examples.mjs` 重建全部示例；也可单独运行 `scripts/agent-examples.mjs`。发行包已含生成好的文件，不要求用户具备脚本或 JDK。

对象例子的人工对照表：

| 检查项 | 正确值 |
|---|---|
| 帧进入次序 | main → StepCounter → Counter(super) → StepCounter.bump → Counter.bump → StepCounter.bump → Counter.bump → Counter(new) → Counter.bump |
| 第一对象 | `0x100`，实际类型 StepCounter；step=`3`，value=`2 → 5 → 11` |
| 第二对象 | `0x101`，Counter；value=`10 → 11` |
| 共享类存储区 | `static:Counter`；Counter.calls=`0 → 1 → 2 → 3`；不是第三个实例 |
| main 的 first、alias | 都是 `0x100`；不是两个对象 |
| total / i / result | `0 → 5 → 16` / `0 → 1 → 2` / `5 → 11` |
| 循环的两次 override 返回 | 都指向 `v-main-loop-result`；父方法调用的间接返回在 notes 中记录 |
| 构造器关联 | 第一对象指向 StepCounter 外层帧；第二对象指向第二次 Counter 构造帧 |
| I/O | `11`、`total:16`、`11`，三行 |

递归例子：main 调用 sum(2)，随后 sum(1)、sum(0)；四个帧全部保留。返回目标依次是 main.answer、sum(2).smaller、sum(1).smaller；最终输出 `3`。不能把三个 sum 帧合并为 n 的历史行。

交付前逐项核对：

- [ ] 完整源码与输入匹配题目，追踪时点无歧义。
- [ ] 实际执行到的自定义调用各有独立帧；没有漏 super/this 链，没有库内部噪声。
- [ ] 普通对象数量等于被追踪的实际分配数量；static 共享类存储区单独标注；所有引用目标存在；null/字符串没有假地址。
- [ ] this、别名、传参、动态派发和继承字段都指向正确对象。
- [ ] 值历史、循环最后增量、块作用域、结束状态符合指定时点。
- [ ] 每个返回箭头指向实际直接目标；间接返回、格式损失在 notes 说明。
- [ ] I/O 来自执行结果；没有随意指定 HashMap 顺序或缺失输入。
- [ ] 全文 ID 唯一，构造器关联有效，结构标准化成功；结果未被误称为自动判分。

维护者回归检查：`runtime/node.exe --test tests/document.test.mjs tests/agent-examples.test.mjs`。Java 可用时可编译运行原创参考程序核对输出，但不要在发布目录留下 `.class` 文件。
