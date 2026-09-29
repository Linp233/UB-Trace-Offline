# Summer 2026 原创 Java trace 练习

对应 cse116.com 的授课单元；每单元 5 题，考试日不作为章节。不是官方试题。详细范围与来源见 [目录](README.md)。

统一要求：从 main 执行到正常结束，画出完整 Stack / Heap / I/O；保留值历史、已结束作用域和每次自定义调用。地址按 0x100、0x101……分配。忽略未使用的 args 和库内部实现。循环体同一声明位置的变量合并历史。按 [编写指引](../CSE116-TRACE-GUIDE.md) 处理 String、构造器、返回箭头及 static。不要只写输出。

先独立完成再查看 [单独的答案册](ANSWERS.md)。每题的空白 JSON 只包含源码，可导入本地工具作答。

<a id="chapter-01"></a>
## 01 Java 基础：表达式、方法与控制流（Lecture 1）

### 01-1 整数除法与数值提升

记录每次赋值，区分整数除法与 double 运算。

[源码](sources/P0101.java) · [空白练习 JSON](blank/01-1.json)

```java
public class P0101 {
    public static void main(String[] args) throws Exception {
        int x = 9;
        int y = x / 2;
        x += y;
        double ratio = x / 2.0;
        System.out.println(x);
        System.out.println(y);
        System.out.println(ratio);
    }
}
```

### 01-2 同一方法的两次调用

分别画出两个 triple 调用帧，并连接直接返回目标。

[源码](sources/P0102.java) · [空白练习 JSON](blank/01-2.json)

```java
public class P0102 {
    static int triple(int input) {
        int out = input * 3;
        return out;
    }
    public static void main(String[] args) throws Exception {
        int a = 2;
        int b = triple(a);
        a = triple(b);
        System.out.println(a + b);
    }
}
```

### 01-3 短路与分支作用域

判断 ++x 是否执行，并保留实际进入分支的局部变量。

[源码](sources/P0103.java) · [空白练习 JSON](blank/01-3.json)

```java
public class P0103 {
    public static void main(String[] args) throws Exception {
        int x = 3;
        boolean hit = x > 5 && ++x > 0;
        if (!hit) {
            int bonus = 4;
            x += bonus;
        } else {
            x = 100;
        }
        System.out.println(x);
    }
}
```

### 01-4 for 的最后一次增量

保留 i、循环体 temp 和累计 sum 的完整历史。

[源码](sources/P0104.java) · [空白练习 JSON](blank/01-4.json)

```java
public class P0104 {
    public static void main(String[] args) throws Exception {
        int sum = 0;
        for (int i = 1; i <= 3; i++) {
            int temp = i * 2;
            sum += temp;
        }
        System.out.println(sum);
    }
}
```

### 01-5 while 与 break

不要在 break 后继续执行循环。

[源码](sources/P0105.java) · [空白练习 JSON](blank/01-5.json)

```java
public class P0105 {
    public static void main(String[] args) throws Exception {
        int n = 6;
        int count = 0;
        while (n > 0) {
            n -= 2;
            count++;
            if (n == 2) break;
        }
        System.out.println(n + ":" + count);
    }
}
```

<a id="chapter-02"></a>
## 02 Java 集合、文件与 CSV（Lecture 2）

### 02-1 数组引用与元素更新

一个数组，两个别名；区分变量更新与元素更新。

[源码](sources/P0201.java) · [空白练习 JSON](blank/02-1.json)

```java
public class P0201 {
    public static void main(String[] args) throws Exception {
        int[] a = {2, 5};
        int[] b = a;
        b[0] += a[1];
        System.out.println(a[0]);
    }
}
```

### 02-2 ArrayList 的 add 与 set

记录逻辑元素，不展开 Java 库内部数组。

[源码](sources/P0202.java) · [空白练习 JSON](blank/02-2.json)

```java
public class P0202 {
    public static void main(String[] args) throws Exception {
        java.util.ArrayList<Integer> list = new java.util.ArrayList<>();
        list.add(3);
        list.add(8);
        int old = list.set(0, list.get(1) - 2);
        System.out.println(list);
        System.out.println(old);
    }
}
```

### 02-3 HashMap 同键覆盖

使用明确的键访问，不能假设 HashMap 的遍历顺序。

[源码](sources/P0203.java) · [空白练习 JSON](blank/02-3.json)

```java
public class P0203 {
    public static void main(String[] args) throws Exception {
        java.util.HashMap<String, Integer> map = new java.util.HashMap<>();
        map.put("red", 2);
        map.put("blue", 5);
        int old = map.put("red", map.get("blue") + 1);
        System.out.println(map.get("red") + ":" + old);
    }
}
```

### 02-4 参数重新绑定与原数组修改

引用按值传递；方法内重新绑定参数不改变调用者变量。

[源码](sources/P0204.java) · [空白练习 JSON](blank/02-4.json)

```java
public class P0204 {
    static void edit(int[] p) {
        p[1] = 9;
        p = new int[]{4};
    }
    public static void main(String[] args) throws Exception {
        int[] data = {1, 2};
        edit(data);
        System.out.println(data[1]);
    }
}
```

### 02-5 读取固定 CSV 文件

输入文件随题目提供；记录字符串数组与解析结果。

[源码](sources/P0205.java) · [空白练习 JSON](blank/02-5.json)

输入文件：[P0205.csv](sources/P0205.csv)，运行时放在工作目录。

```text
pen,4,6
```

```java
public class P0205 {
    public static void main(String[] args) throws Exception {
        String text = java.nio.file.Files.readString(java.nio.file.Path.of("P0205.csv")).trim();
        String[] fields = text.split(",");
        int quantity = Integer.parseInt(fields[1]);
        int price = Integer.parseInt(fields[2]);
        int total = quantity * price;
        System.out.println(fields[0] + ":" + total);
    }
}
```

<a id="chapter-03"></a>
## 03 类与对象（Lecture 3）

### 03-1 构造与实例方法

画出 this、形参和字段历史；区分局部值与对象状态。

[源码](sources/P0301.java) · [空白练习 JSON](blank/03-1.json)

```java
public class P0301 {
    static class Box {
        int value;
        Box(int x) {   this.value = x;  }
        int add(int delta) {
            this.value += delta;
            return this.value;
        }
    }
    public static void main(String[] args) throws Exception {
        Box b = new Box(3);
        int result = b.add(2);
        System.out.println(result);
    }
}
```

### 03-2 两个对象与一个别名

同值或同类不等于同一个对象。

[源码](sources/P0302.java) · [空白练习 JSON](blank/03-2.json)

```java
public class P0302 {
    static class Box {
        int value;
        Box(int x) {
            this.value = x;
        }
    }
    public static void main(String[] args) throws Exception {
        Box a = new Box(4);
        Box b = new Box(7);
        Box alias = a;
        alias.value = 9;
        boolean same = a == alias;
        System.out.println(a.value + ":" + b.value + ":" + same);
    }
}
```

### 03-3 对象参数的修改与重新绑定

方法返回后保留两个堆对象及已结束调用帧。

[源码](sources/P0303.java) · [空白练习 JSON](blank/03-3.json)

```java
public class P0303 {
    static class Box {
        int value;
        Box(int x) {
            this.value = x;
        }
    }
    static void redirect(Box p) {
        p.value = 8;
        p = new Box(2);
        p.value = 3;
    }
    public static void main(String[] args) throws Exception {
        Box a = new Box(5);
        redirect(a);
        System.out.println(a.value);
    }
}
```

### 03-4 static 计数与实例编号

共享类存储只有一份；每个对象有独立的 id。

[源码](sources/P0304.java) · [空白练习 JSON](blank/03-4.json)

```java
public class P0304 {
    static class Ticket {
        static int made = 0;
        int id;
        Ticket() {
            Ticket.made++;
            this.id = Ticket.made;
        }
    }
    public static void main(String[] args) throws Exception {

        Ticket a = new Ticket();
        Ticket b = new Ticket();
        System.out.println(a.id + ":" + b.id + ":" + Ticket.made);
    }
}
```

### 03-5 this 构造器委托

两次构造器调用共享一个对象；分配关联到外层构造器。

[源码](sources/P0305.java) · [空白练习 JSON](blank/03-5.json)

```java
public class P0305 {
    static class Box {
        int value;
        Box() { this(4);  }
        Box(int x) {   this.value = x;  }
    }
    public static void main(String[] args) throws Exception {
        Box b = new Box();
        b.value++;
        System.out.println(b.value);
    }
}
```

<a id="chapter-04"></a>
## 04 链表、栈与队列（Lecture 4）

### 04-1 连接两个节点

从尾到头分配，地址顺序与链表顺序不同。

[源码](sources/P0401.java) · [空白练习 JSON](blank/04-1.json)

```java
public class P0401 {
    static class Node {
        int value;
        Node next;
        Node(int value, Node next) {
            this.value = value;
            this.next = next;
        }
    }
    public static void main(String[] args) throws Exception {
        Node tail = new Node(7, null);
        Node head = new Node(3, tail);
        int total = head.value + head.next.value;
        System.out.println(total);
    }
}
```

### 04-2 在链首插入

head 更新只改变入口引用，旧节点仍存在。

[源码](sources/P0402.java) · [空白练习 JSON](blank/04-2.json)

```java
public class P0402 {
    static class Node {
        int value;
        Node next;
        Node(int value, Node next) {
            this.value = value;
            this.next = next;
        }
    }
    public static void main(String[] args) throws Exception {
        Node head = new Node(5, null);
        Node old = head;
        head = new Node(2, head);
        System.out.println(head.next == old);
    }
}
```

### 04-3 绕过中间节点

字段更新不等于销毁被绕过的对象。

[源码](sources/P0403.java) · [空白练习 JSON](blank/04-3.json)

```java
public class P0403 {
    static class Node {
        int value;
        Node next;
        Node(int value, Node next) {
            this.value = value;
            this.next = next;
        }
    }
    public static void main(String[] args) throws Exception {
        Node tail = new Node(9, null);
        Node middle = new Node(6, tail);
        Node head = new Node(1, middle);
        head.next = middle.next;
        System.out.println(head.next.value + ":" + middle.value);
    }
}
```

### 04-4 链表实现栈的 push 和 pop

保留 top 的 null 初值及两次 push 和一次 pop。

[源码](sources/P0404.java) · [空白练习 JSON](blank/04-4.json)

```java
public class P0404 {
    static class Node {
        int value;
        Node next;
        Node(int value, Node next) {
            this.value = value;
            this.next = next;
        }
    }
    public static void main(String[] args) throws Exception {
        Node top = null;
        top = new Node(10, top);
        top = new Node(20, top);
        int popped = top.value;
        top = top.next;
        System.out.println(popped + ":" + top.value);
    }
}
```

### 04-5 队列的首尾引用

入队修改尾节点的 next，出队修改 head。

[源码](sources/P0405.java) · [空白练习 JSON](blank/04-5.json)

```java
public class P0405 {
    static class Node {
        int value;
        Node next;
        Node(int value, Node next) {
            this.value = value;
            this.next = next;
        }
    }
    public static void main(String[] args) throws Exception {
        Node head = new Node(5, null);
        Node tail = head;
        tail.next = new Node(8, null);
        tail = tail.next;
        int removed = head.value;
        head = head.next;
        System.out.println(removed + ":" + (head == tail));
    }
}
```

<a id="chapter-05"></a>
## 05 继承（Lecture 5）

### 05-1 super 初始化同一个对象

父构造器与子构造器分别建帧，但只创建一个 Child。

[源码](sources/P0501.java) · [空白练习 JSON](blank/05-1.json)

```java
public class P0501 {
    static class Base {
        int value;
        Base(int x) {   value = x;  }
    }
    static class Child extends Base {
        int bonus;
        Child(int x, int bonus) { super(x);    this.bonus = bonus;  }
        int total() {  return value + bonus; }
    }
    public static void main(String[] args) throws Exception {
        Child c = new Child(2, 4);
        int result = c.total();
        System.out.println(result);
    }
}
```

### 05-2 override 中调用 super 方法

父方法结果先赋给子方法中的局部变量。

[源码](sources/P0502.java) · [空白练习 JSON](blank/05-2.json)

```java
public class P0502 {
    static class Base {
        int value;
        Base(int x) {   value = x;  }
        int score() {  return value + 1; }
    }
    static class Child extends Base {
        Child(int x) { super(x);   }
        @Override int score() {
            int parent = super.score();
            return parent * 2;
        }
    }
    public static void main(String[] args) throws Exception {
        Base b = new Child(3);
        int result = b.score();
        System.out.println(result);
    }
}
```

### 05-3 this 与 super 的连续委托

三个构造器帧，共享一个实例；只给最外层关联分配结果。

[源码](sources/P0503.java) · [空白练习 JSON](blank/05-3.json)

```java
public class P0503 {
    static class Base {
        int value;
        Base(int seed) {   value = seed;  }
    }
    static class Child extends Base {
        Child() { this(5);  }
        Child(int start) { super(start);   value++;  }
    }
    public static void main(String[] args) throws Exception {
        Child c = new Child();
        System.out.println(c.value);
    }
}
```

### 05-4 同名字段隐藏

父类字段和子类字段是不同存储位置，不要合并。

[源码](sources/P0504.java) · [空白练习 JSON](blank/05-4.json)

```java
public class P0504 {
    static class Base {
        int value = 2;
        Base() {   }
    }
    static class Child extends Base {
        int value = 9;
        Child() { super();   }
    }
    public static void main(String[] args) throws Exception {
        Child c = new Child();
        Base b = c;
        int first = b.value;
        int second = c.value;
        System.out.println(first + second);
    }
}
```

### 05-5 通过父类引用调用继承方法

两个 add 调用有独立帧，修改同一继承字段。

[源码](sources/P0505.java) · [空白练习 JSON](blank/05-5.json)

```java
public class P0505 {
    static class Base {
        int value;
        Base(int x) {   value = x;  }
        void add(int amount) {   value += amount;  }
    }
    static class Child extends Base {
        Child(int x) { super(x);   }
    }
    public static void main(String[] args) throws Exception {
        Child c = new Child(2);
        Base b = c;
        b.add(3);
        c.add(1);
        System.out.println(c.value);
    }
}
```

<a id="chapter-06"></a>
## 06 多态与比较器（Lecture 6）

### 06-1 接口引用更换实现

引用变量改变对象后，后续调用选择不同实现。

[源码](sources/P0601.java) · [空白练习 JSON](blank/06-1.json)

```java
public class P0601 {
    interface Op { int apply(int x); }
    static class Add implements Op {
        int step;
        Add(int step) {   this.step = step;  }
        public int apply(int x) {   return x + step; }
    }
    static class Twice implements Op {
        Twice() {  }
        public int apply(int x) {   return x * 2; }
    }
    public static void main(String[] args) throws Exception {
        Op op = new Add(3);
        int result = op.apply(4);
        op = new Twice();
        result = op.apply(result);
        System.out.println(result);
    }
}
```

### 06-2 向下转型不创建对象

比较引用类型、实际对象类型与方法选择。

[源码](sources/P0602.java) · [空白练习 JSON](blank/06-2.json)

```java
public class P0602 {
    static class Base {
        int value;
        Base(int x) {   value = x;  }
        int kind() { return 1; }
    }
    static class Child extends Base {
        Child(int x) { super(x);   }
        @Override int kind() {  return value + 1; }
        int extra() {  return value * 2; }
    }
    public static void main(String[] args) throws Exception {
        Base a = new Child(4);
        int x = a.kind();
        Child b = (Child)a;
        int y = b.extra();
        System.out.println(x + ":" + y);
    }
}
```

### 06-3 多态数组与增强 for

每次从数组取出的 op 是对象引用；库迭代细节省略。

[源码](sources/P0603.java) · [空白练习 JSON](blank/06-3.json)

```java
public class P0603 {
    abstract static class Op { Op() {  } abstract int apply(int x); }
    static class Add extends Op {
        int step;
        Add(int step) { super();   this.step = step;  }
        int apply(int x) {   return x + step; }
    }
    static class Negate extends Op {
        Negate() { super();  }
        int apply(int x) {   return -x; }
    }
    public static void main(String[] args) throws Exception {
        Op a = new Add(2);
        Op b = new Negate();
        Op[] steps = {a, b};
        int total = 3;
        for (Op op : steps) {
            total = op.apply(total);
        }
        System.out.println(total);
    }
}
```

### 06-4 按距离比较

分别 trace 两次 compare，Integer 参数按课程简化作为值。

[源码](sources/P0604.java) · [空白练习 JSON](blank/06-4.json)

```java
public class P0604 {
    static class Near implements java.util.Comparator<Integer> {
        int pivot;
        Near(int pivot) {   this.pivot = pivot;  }
        public int compare(Integer a, Integer b) {
            int da = Math.abs(a - pivot);
            int db = Math.abs(b - pivot);
            return Integer.compare(da, db);
        }
    }
    public static void main(String[] args) throws Exception {
        java.util.Comparator<Integer> cmp = new Near(5);
        int first = cmp.compare(2, 7);
        int second = cmp.compare(6, 3);
        System.out.println(first + ":" + second);
    }
}
```

### 06-5 用比较器排序两个元素

算法步骤在源码中固定，不能假设库排序的调用次数。

[源码](sources/P0605.java) · [空白练习 JSON](blank/06-5.json)

```java
public class P0605 {
    static class Desc implements java.util.Comparator<Integer> {
        Desc() {  }
        public int compare(Integer a, Integer b) {    return b - a; }
    }
    public static void main(String[] args) throws Exception {
        java.util.Comparator<Integer> cmp = new Desc();
        int[] data = {2, 7};
        int order = cmp.compare(data[0], data[1]);
        if (order > 0) {
            int temp = data[0];
            data[0] = data[1];
            data[1] = temp;
        }
        System.out.println(java.util.Arrays.toString(data));
    }
}
```

<a id="chapter-07"></a>
## 07 测试（Lecture 7）

### 07-1 边界测试驱动

追踪被测函数和三个测试输入；最后给出布尔测试结果。

[源码](sources/P0701.java) · [空白练习 JSON](blank/07-1.json)

```java
public class P0701 {
    static int clip(int x) {
        if (x < 0) return 0;
        if (x > 10) return 10;
        return x;
    }
    public static void main(String[] args) throws Exception {
        int a = clip(-2);
        int b = clip(6);
        int c = clip(12);
        boolean passed = a == 0 && b == 6 && c == 10;
        System.out.println(passed);
    }
}
```

### 07-2 通过一个测试不代表实现正确

代码故意含有逻辑缺陷；按原样 trace，不要修复它。

[源码](sources/P0702.java) · [空白练习 JSON](blank/07-2.json)

```java
public class P0702 {
    static int square(int n) {  return n + n; }
    public static void main(String[] args) throws Exception {
        int expected = 9;
        int actual = square(3);
        boolean first = actual == expected;
        int other = square(2);
        boolean second = other == 4;
        System.out.println(first);
        System.out.println(second);
    }
}
```

### 07-3 double 容差测试

记录真实 double 值，不把 0.1+0.2 写成精确的 0.3。

[源码](sources/P0703.java) · [空白练习 JSON](blank/07-3.json)

```java
public class P0703 {
    static boolean near(double actual, double expected, double epsilon) {
        double diff = Math.abs(actual - expected);
        return diff <= epsilon;
    }
    public static void main(String[] args) throws Exception {
        double actual = 0.1 + 0.2;
        boolean exact = actual == 0.3;
        boolean passed = near(actual, 0.3, 1e-9);
        System.out.println(exact + ":" + passed);
    }
}
```

### 07-4 字符串结果测试

用 equals 比较内容，Locale.ROOT 固定大小写转换规则。

[源码](sources/P0704.java) · [空白练习 JSON](blank/07-4.json)

```java
public class P0704 {
    static String normalize(String name) {
        String cleaned = name.trim();
        String result = cleaned.toUpperCase(java.util.Locale.ROOT);
        return result;
    }
    public static void main(String[] args) throws Exception {
        String actual = normalize("  Ada ");
        String expected = "ADA";
        boolean passed = actual.equals(expected);
        System.out.println(passed);
    }
}
```

### 07-5 共享测试对象造成状态污染

比较复用对象与新建对象；完整保留每次 next 调用。

[源码](sources/P0705.java) · [空白练习 JSON](blank/07-5.json)

```java
public class P0705 {
    static class Counter {
        int value;
        Counter() {  value = 0;  }
        int next() {  value++;  return value; }
    }
    public static void main(String[] args) throws Exception {
        Counter shared = new Counter();
        int first = shared.next();
        int second = shared.next();
        boolean independent = first == 1 && second == 1;
        Counter fresh = new Counter();
        int retry = fresh.next();
        boolean passed = retry == 1;
        System.out.println(independent + ":" + passed);
    }
}
```

<a id="chapter-08"></a>
## 08 树与二叉搜索树（Lecture 8）

### 08-1 树节点与共享引用

alias 指向左子节点，修改它会从 root 路径看见。

[源码](sources/P0801.java) · [空白练习 JSON](blank/08-1.json)

```java
public class P0801 {
    static class Node {
        int value;
        Node left, right;
        Node(int value, Node left, Node right) {
            this.value = value;
            this.left = left;
            this.right = right;
        }
    }

    public static void main(String[] args) throws Exception {
        Node left = new Node(1, null, null);
        Node right = new Node(3, null, null);
        Node root = new Node(2, left, right);
        Node alias = root.left;
        alias.value += 4;
        int total = root.value + root.left.value + root.right.value;
        System.out.println(total);
    }
}
```

### 08-2 中序遍历包含 null 调用

每次 visit(null) 也是实际调用，不能省略其帧。

[源码](sources/P0802.java) · [空白练习 JSON](blank/08-2.json)

```java
public class P0802 {
    static class Node {
        int value;
        Node left, right;
        Node(int value, Node left, Node right) {
            this.value = value;
            this.left = left;
            this.right = right;
        }
    }
    static void visit(Node node) {
        if (node == null) return;
        visit(node.left);
        System.out.println(node.value);
        visit(node.right);
    }
    public static void main(String[] args) throws Exception {
        Node left = new Node(1, null, null);
        Node right = new Node(3, null, null);
        Node root = new Node(2, left, right);
        visit(root);
    }
}
```

### 08-3 递归计算节点数

返回值分别回到直接调用者的 leftSize 或 rightSize。

[源码](sources/P0803.java) · [空白练习 JSON](blank/08-3.json)

```java
public class P0803 {
    static class Node {
        int value;
        Node left, right;
        Node(int value, Node left, Node right) {
            this.value = value;
            this.left = left;
            this.right = right;
        }
    }
    static int size(Node node) {
        if (node == null) return 0;
        int leftSize = size(node.left);
        int rightSize = size(node.right);
        return 1 + leftSize + rightSize;
    }
    public static void main(String[] args) throws Exception {
        Node left = new Node(1, null, null);
        Node right = new Node(3, null, null);
        Node root = new Node(2, left, right);
        int result = size(root);
        System.out.println(result);
    }
}
```

### 08-4 迭代 BST 查找

node 参数会重新绑定，树的字段没有改变。

[源码](sources/P0804.java) · [空白练习 JSON](blank/08-4.json)

```java
public class P0804 {
    static class Node {
        int value;
        Node left, right;
        Node(int value, Node left, Node right) {
            this.value = value;
            this.left = left;
            this.right = right;
        }
    }
    static Node find(Node node, int target) {
        while (node != null) {
            if (node.value == target) return node;
            node = target < node.value ? node.left : node.right;
        }
        return null;
    }
    public static void main(String[] args) throws Exception {
        Node left = new Node(1, null, null);
        Node right = new Node(3, null, null);
        Node root = new Node(2, left, right);
        Node found = find(root, 3);
        System.out.println(found.value);
    }
}
```

### 08-5 递归 BST 插入

跟踪新节点、父节点 left 字段以及重复赋回 root。

[源码](sources/P0805.java) · [空白练习 JSON](blank/08-5.json)

```java
public class P0805 {
    static class Node {
        int value;
        Node left, right;
        Node(int value, Node left, Node right) {
            this.value = value;
            this.left = left;
            this.right = right;
        }
    }
    static Node insert(Node node, int value) {
        if (node == null) {
            Node made = new Node(value, null, null);
            return made;
        }
        if (value < node.value) {
            node.left = insert(node.left, value);
        }
        return node;
    }
    public static void main(String[] args) throws Exception {
        Node root = new Node(5, null, null);
        root = insert(root, 3);
        System.out.println(root.left.value);
    }
}
```

<a id="chapter-09"></a>
## 09 图与路径（Lecture 10）

### 09-1 邻接表中的容器引用

顶点按 0、1、2 编号；外层表存的是邻居表的引用。

[源码](sources/P0901.java) · [空白练习 JSON](blank/09-1.json)

```java
public class P0901 {
    public static void main(String[] args) throws Exception {
        java.util.ArrayList<java.util.ArrayList<Integer>> graph = new java.util.ArrayList<>();
        java.util.ArrayList<Integer> a = new java.util.ArrayList<>();
        java.util.ArrayList<Integer> b = new java.util.ArrayList<>();
        java.util.ArrayList<Integer> c = new java.util.ArrayList<>();
        a.add(1);
        a.add(2);
        b.add(2);
        graph.add(a);
        graph.add(b);
        graph.add(c);
        int degree = graph.get(0).size();
        int target = graph.get(0).get(1);
        System.out.println(degree + ":" + target);
    }
}
```

### 09-2 BFS：入队时标记

邻居顺序由数组固定；顶点 2 不应重复入队。

[源码](sources/P0902.java) · [空白练习 JSON](blank/09-2.json)

```java
public class P0902 {
    public static void main(String[] args) throws Exception {
        int[][] graph = {{1, 2}, {2}, {}};
        int[] queue = new int[3];
        boolean[] seen = new boolean[3];
        int head = 0;
        int tail = 0;
        queue[tail] = 0;
        tail++;
        seen[0] = true;
        while (head < tail) {
            int vertex = queue[head];
            head++;
            System.out.println(vertex);
            for (int next : graph[vertex]) {
                if (!seen[next]) {
                    seen[next] = true;
                    queue[tail] = next;
                    tail++;
                }
            }
        }
    }
}
```

### 09-3 DFS：已访问顶点的再次调用

同一图按固定邻居顺序递归；记录早返回的第二次 dfs(2)。

[源码](sources/P0903.java) · [空白练习 JSON](blank/09-3.json)

```java
public class P0903 {
    static void dfs(int[][] graph, boolean[] seen, int vertex) {
        if (seen[vertex]) return;
        seen[vertex] = true;
        System.out.println(vertex);
        for (int next : graph[vertex]) {
            dfs(graph, seen, next);
        }
    }
    public static void main(String[] args) throws Exception {
        int[][] graph = {{1, 2}, {2}, {}};
        boolean[] seen = new boolean[3];
        dfs(graph, seen, 0);
    }
}
```

### 09-4 根据前驱数组恢复路径

给定 previous，无需运行 BFS；记录逆序恢复的列表。

[源码](sources/P0904.java) · [空白练习 JSON](blank/09-4.json)

```java
public class P0904 {
    public static void main(String[] args) throws Exception {
        int[] previous = {-1, 0, 0, 1};
        int current = 3;
        java.util.ArrayList<Integer> reverse = new java.util.ArrayList<>();
        while (current != -1) {
            reverse.add(current);
            current = previous[current];
        }
        System.out.println(reverse);
    }
}
```

### 09-5 邻接矩阵的出度与边数

有向图按每行统计出边；保留嵌套循环的全部历史。

[源码](sources/P0905.java) · [空白练习 JSON](blank/09-5.json)

```java
public class P0905 {
    public static void main(String[] args) throws Exception {
        int[][] graph = {{0,1,1}, {0,0,1}, {1,0,0}};
        int edges = 0;
        for (int row = 0; row < graph.length; row++) {
            int degree = 0;
            for (int col = 0; col < graph[row].length; col++) {
                degree += graph[row][col];
            }
            edges += degree;
            System.out.println(degree);
        }
        System.out.println(edges);
    }
}
```

<a id="chapter-10"></a>
## 10 运行时间与操作计数（Lecture 11）

### 10-1 线性循环

只统计 count++ 的执行次数。

[源码](sources/P1001.java) · [空白练习 JSON](blank/10-1.json)

```java
public class P1001 {
    public static void main(String[] args) throws Exception {
        int n = 4;
        int count = 0;
        for (int i = 0; i < n; i++) {
            count++;
        }
        System.out.println(count);
    }
}
```

除完整 trace 外，请给出题中指定操作的执行次数，并把固定输入推广到 n 后给出增长阶。

### 10-2 三角形嵌套循环

只统计最内层 count++，不要误算为 n² 次。

[源码](sources/P1002.java) · [空白练习 JSON](blank/10-2.json)

```java
public class P1002 {
    public static void main(String[] args) throws Exception {
        int n = 3;
        int count = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j <= i; j++) {
                count++;
            }
        }
        System.out.println(count);
    }
}
```

除完整 trace 外，请给出题中指定操作的执行次数，并把固定输入推广到 n 后给出增长阶。

### 10-3 倍增循环

只统计 count++；保留使循环结束的 step=16。

[源码](sources/P1003.java) · [空白练习 JSON](blank/10-3.json)

```java
public class P1003 {
    public static void main(String[] args) throws Exception {
        int n = 10;
        int count = 0;
        for (int step = 1; step < n; step *= 2) {
            count++;
        }
        System.out.println(count);
    }
}
```

除完整 trace 外，请给出题中指定操作的执行次数，并把固定输入推广到 n 后给出增长阶。

### 10-4 顺序循环相加

两个循环顺序执行，统计两处 count++ 的合计次数。

[源码](sources/P1004.java) · [空白练习 JSON](blank/10-4.json)

```java
public class P1004 {
    public static void main(String[] args) throws Exception {
        int n = 3;
        int count = 0;
        for (int i = 0; i < n; i++) {
            count++;
        }
        for (int j = 0; j < n; j++) {
            count++;
        }
        System.out.println(count);
    }
}
```

除完整 trace 外，请给出题中指定操作的执行次数，并把固定输入推广到 n 后给出增长阶。

### 10-5 提前结束的线性查找

count 表示实际检查了多少个数组元素；break 后没有 i++。

[源码](sources/P1005.java) · [空白练习 JSON](blank/10-5.json)

```java
public class P1005 {
    public static void main(String[] args) throws Exception {
        int[] data = {5, 8, 2, 9};
        int target = 2;
        int count = 0;
        int found = -1;
        for (int i = 0; i < data.length; i++) {
            count++;
            if (data[i] == target) {
                found = i;
                break;
            }
        }
        System.out.println(count + ":" + found);
    }
}
```

除完整 trace 外，请给出题中指定操作的执行次数，并把固定输入推广到 n 后给出增长阶。
