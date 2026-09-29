import {P,V,S,F,H,A,W,at,m,main,thisV} from './model.mjs';
export const problems=[
P('05',1,'super 初始化同一个对象','父构造器与子构造器分别建帧，但只创建一个 Child。',`    static class Base {
        int value;
        Base(int x) { /*@bt*/ /*@bx*/ value = x; /*@value*/ }
    }
    static class Child extends Base {
        int bonus;
        Child(int x, int bonus) { super(x); /*@ct*/ /*@cx*/ /*@cb*/ this.bonus = bonus; /*@bonus*/ }
        int total() { /*@tt*/ return value + bonus; }
    }
${main(`        Child c = new Child(2, 4); /*@c*/
        int result = c.total(); /*@result*/
        System.out.println(result);`)}`,[m([V('c','c','0x100'),V('result','result',6)]),F('child','Child',[thisV('ct','0x100'),V('cx','x',2),V('cb','bonus',4)],'c'),F('base','Base',[thisV('bt','0x100'),V('bx','x',2)]),F('total','Child.total',[thisV('tt','0x100')],'result')],[H('0x100','Child',[V('bonus','bonus',4),V('value','value',2)],'child')],['6'],{bt:W('this','bt'),bx:W('x','bx'),ct:W('this','ct'),cx:W('x','cx'),cb:W('bonus','cb'),tt:W('this','tt'),value:W('value','value'),bonus:W('this.bonus','bonus'),c:W('c','c'),result:W('result','result')},'进入 Child 后进入 Base；两个构造器的 this 同址，堆类型为 Child。'),
P('05',2,'override 中调用 super 方法','父方法结果先赋给子方法中的局部变量。',`    static class Base {
        int value;
        Base(int x) { /*@bt*/ /*@bx*/ value = x; /*@value*/ }
        int score() { /*@bs*/ return value + 1; }
    }
    static class Child extends Base {
        Child(int x) { super(x); /*@ct*/ /*@cx*/ }
        @Override int score() { /*@cs*/
            int parent = super.score(); /*@parent*/
            return parent * 2;
        }
    }
${main(`        Base b = new Child(3); /*@b*/
        int result = b.score(); /*@result*/
        System.out.println(result);`)}`,[m([V('b','b','0x100'),V('result','result',8)]),F('child','Child',[thisV('ct','0x100'),V('cx','x',3)],'b'),F('base','Base',[thisV('bt','0x100'),V('bx','x',3)]),F('cs','Child.score',[thisV('cst','0x100'),V('parent','parent',4)],'result'),F('bs','Base.score',[thisV('bst','0x100')],'parent')],[H('0x100','Child',[V('value','value',3)],'child')],['8'],{bt:W('this','bt'),bx:W('x','bx'),ct:W('this','ct'),cx:W('x','cx'),bs:W('this','bst'),cs:W('this','cst'),parent:W('parent','parent'),value:W('value','value'),b:W('b','b'),result:W('result','result')},'b 的声明类型不阻止动态派发；super.score 返回 4 给 Child.score 的 parent，再返回 8。'),
P('05',3,'this 与 super 的连续委托','三个构造器帧，共享一个实例；只给最外层关联分配结果。',`    static class Base {
        int value;
        Base(int seed) { /*@bt*/ /*@seed*/ value = seed; /*@v1*/ }
    }
    static class Child extends Base {
        Child() { this(5); /*@ot*/ }
        Child(int start) { super(start); /*@it*/ /*@start*/ value++; /*@v2*/ }
    }
${main(`        Child c = new Child(); /*@c*/
        System.out.println(c.value);`)}`,[m([V('c','c','0x100')]),F('outer','Child()',[thisV('ot','0x100')],'c'),F('inner','Child(int)',[thisV('it','0x100'),V('start','start',5)]),F('base','Base',[thisV('bt','0x100'),V('seed','seed',5)])],[H('0x100','Child',[V('value','value',5,6)],'outer')],['6'],{bt:W('this','bt'),seed:W('seed','seed'),ot:W('this','ot'),it:W('this','it'),start:W('start','start'),v1:W('value',at('value',0)),v2:W('value',at('value',1)),c:W('c','c')},'帧进入顺序是 Child()、Child(int)、Base；value 先由 Base 设为 5，再增至 6。'),
P('05',4,'同名字段隐藏','父类字段和子类字段是不同存储位置，不要合并。',`    static class Base {
        int value = 2;
        Base() { /*@bt*/ /*@bv*/ }
    }
    static class Child extends Base {
        int value = 9;
        Child() { super(); /*@ct*/ /*@cv*/ }
    }
${main(`        Child c = new Child(); /*@c*/
        Base b = c; /*@b*/
        int first = b.value; /*@first*/
        int second = c.value; /*@second*/
        System.out.println(first + second);`)}`,[m([V('c','c','0x100'),V('b','b','0x100'),V('first','first',2),V('second','second',9)]),F('child','Child',[thisV('ct','0x100')],'c'),F('base','Base',[thisV('bt','0x100')])],[H('0x100','Child',[V('cv','Child.value',9),V('bv','Base.value',2)],'child')],['11'],{bt:W('this','bt'),bv:W('this.value','bv'),ct:W('this','ct'),cv:W('this.value','cv'),c:W('c','c'),b:W('b','b'),first:W('first','first'),second:W('second','second')},'字段访问依据表达式的静态类型选择；这与 override 方法的动态派发不同。'),
P('05',5,'通过父类引用调用继承方法','两个 add 调用有独立帧，修改同一继承字段。',`    static class Base {
        int value;
        Base(int x) { /*@bt*/ /*@bx*/ value = x; /*@value*/ }
        void add(int amount) { /*@at*/ /*@amount*/ value += amount; /*@value*/ }
    }
    static class Child extends Base {
        Child(int x) { super(x); /*@ct*/ /*@cx*/ }
    }
${main(`        Child c = new Child(2); /*@c*/
        Base b = c; /*@b*/
        b.add(3);
        c.add(1);
        System.out.println(c.value);`)}`,[m([V('c','c','0x100'),V('b','b','0x100')]),F('child','Child',[thisV('ct','0x100'),V('cx','x',2)],'c'),F('base','Base',[thisV('bt','0x100'),V('bx','x',2)]),F('a1','Base.add',[thisV('a1t','0x100'),V('d1','amount',3)]),F('a2','Base.add',[thisV('a2t','0x100'),V('d2','amount',1)])],[H('0x100','Child',[V('value','value',2,5,6)],'child')],['6'],{bt:W('this','bt'),bx:W('x','bx'),ct:W('this','ct'),cx:W('x','cx'),at:W('this','a1t','a2t'),amount:W('amount','d1','d2'),value:W('value','value'),c:W('c','c'),b:W('b','b')},'Child 未覆盖 add，因此两次执行的都是 Base.add；它们的 this 仍指 Child 实例。'),
P('06',1,'接口引用更换实现','引用变量改变对象后，后续调用选择不同实现。',`    interface Op { int apply(int x); }
    static class Add implements Op {
        int step;
        Add(int step) { /*@ct*/ /*@step*/ this.step = step; /*@field*/ }
        public int apply(int x) { /*@at*/ /*@ax*/ return x + step; }
    }
    static class Twice implements Op {
        Twice() { /*@dt*/ }
        public int apply(int x) { /*@tt*/ /*@tx*/ return x * 2; }
    }
${main(`        Op op = new Add(3); /*@op*/
        int result = op.apply(4); /*@result*/
        op = new Twice(); /*@op*/
        result = op.apply(result); /*@result*/
        System.out.println(result);`)}`,[m([V('op','op','0x100','0x101'),V('result','result',7,14)]),F('addctor','Add',[thisV('ct','0x100'),V('step','step',3)],'op'),F('add','Add.apply',[thisV('at','0x100'),V('ax','x',4)],'result'),F('twicector','Twice',[thisV('dt','0x101')],'op'),F('twice','Twice.apply',[thisV('tt','0x101'),V('tx','x',7)],'result')],[H('0x100','Add',[V('field','step',3)],'addctor'),H('0x101','Twice',[],'twicector')],['14'],{ct:W('this','ct'),step:W('step','step'),field:W('this.step','field'),at:W('this','at'),ax:W('x','ax'),dt:W('this','dt'),tt:W('this','tt'),tx:W('x','tx'),op:W('op','op'),result:W('result','result')},'第一次实际对象是 Add，第二次是 Twice；旧 Add 对象保留在累计图中。'),
P('06',2,'向下转型不创建对象','比较引用类型、实际对象类型与方法选择。',`    static class Base {
        int value;
        Base(int x) { /*@bt*/ /*@bx*/ value = x; /*@field*/ }
        int kind() { return 1; }
    }
    static class Child extends Base {
        Child(int x) { super(x); /*@ct*/ /*@cx*/ }
        @Override int kind() { /*@kt*/ return value + 1; }
        int extra() { /*@et*/ return value * 2; }
    }
${main(`        Base a = new Child(4); /*@a*/
        int x = a.kind(); /*@x*/
        Child b = (Child)a; /*@b*/
        int y = b.extra(); /*@y*/
        System.out.println(x + ":" + y);`)}`,[m([V('a','a','0x100'),V('x','x',5),V('b','b','0x100'),V('y','y',8)]),F('child','Child',[thisV('ct','0x100'),V('cx','x',4)],'a'),F('base','Base',[thisV('bt','0x100'),V('bx','x',4)]),F('kind','Child.kind',[thisV('kt','0x100')],'x'),F('extra','Child.extra',[thisV('et','0x100')],'y')],[H('0x100','Child',[V('field','value',4)],'child')],['5:8'],{bt:W('this','bt'),bx:W('x','bx'),ct:W('this','ct'),cx:W('x','cx'),field:W('value','field'),kt:W('this','kt'),et:W('this','et'),a:W('a','a'),x:W('x','x'),b:W('b','b'),y:W('y','y')},'强制转型只改变表达式类型，不改变地址；Base.kind 没有执行，不为它建帧。'),
P('06',3,'多态数组与增强 for','每次从数组取出的 op 是对象引用；库迭代细节省略。',`    abstract static class Op { Op() { /*@base*/ } abstract int apply(int x); }
    static class Add extends Op {
        int step;
        Add(int step) { super(); /*@ct*/ /*@step*/ this.step = step; /*@field*/ }
        int apply(int x) { /*@at*/ /*@ax*/ return x + step; }
    }
    static class Negate extends Op {
        Negate() { super(); /*@nt*/ }
        int apply(int x) { /*@mt*/ /*@mx*/ return -x; }
    }
${main(`        Op a = new Add(2); /*@a*/
        Op b = new Negate(); /*@b*/
        Op[] steps = {a, b}; /*@steps*/ /*@e0*/ /*@e1*/
        int total = 3; /*@total*/
        for (Op op : steps) { /*@op*/
            total = op.apply(total); /*@total*/
        }
        System.out.println(total);`)}`,[m([V('a','a','0x100'),V('b','b','0x101'),V('steps','steps','0x102'),V('total','total',3,5,-5),S('loop',[V('op','op','0x100','0x101')])]),F('addctor','Add',[thisV('ct','0x100'),V('step','step',2)],'a'),F('base1','Op',[thisV('b1','0x100')]),F('negctor','Negate',[thisV('nt','0x101')],'b'),F('base2','Op',[thisV('b2','0x101')]),F('add','Add.apply',[thisV('at','0x100'),V('ax','x',3)],'total'),F('neg','Negate.apply',[thisV('mt','0x101'),V('mx','x',5)],'total')],[H('0x100','Add',[V('field','step',2)],'addctor'),H('0x101','Negate',[],'negctor'),A('0x102','Op[]','e',['0x100','0x101'])],['-5'],{base:W('this','b1','b2'),ct:W('this','ct'),step:W('step','step'),field:W('this.step','field'),nt:W('this','nt'),at:W('this','at'),ax:W('x','ax'),mt:W('this','mt'),mx:W('x','mx'),a:W('a','a'),b:W('b','b'),steps:W('steps','steps'),e0:W('steps[0]','e0'),e1:W('steps[1]','e1'),total:W('total','total'),op:W('op','op')},'自定义抽象父类的空构造器也执行，必须保留两个 Op 帧；数组本身另占一个对象。'),
P('06',4,'按距离比较','分别 trace 两次 compare，Integer 参数按课程简化作为值。',`    static class Near implements java.util.Comparator<Integer> {
        int pivot;
        Near(int pivot) { /*@ct*/ /*@pivot*/ this.pivot = pivot; /*@field*/ }
        public int compare(Integer a, Integer b) { /*@mt*/ /*@pa*/ /*@pb*/
            int da = Math.abs(a - pivot); /*@da*/
            int db = Math.abs(b - pivot); /*@db*/
            return Integer.compare(da, db);
        }
    }
${main(`        java.util.Comparator<Integer> cmp = new Near(5); /*@cmp*/
        int first = cmp.compare(2, 7); /*@first*/
        int second = cmp.compare(6, 3); /*@second*/
        System.out.println(first + ":" + second);`)}`,[m([V('cmp','cmp','0x100'),V('first','first',1),V('second','second',-1)]),F('ctor','Near',[thisV('ct','0x100'),V('pivot','pivot',5)],'cmp'),F('c1','Near.compare',[thisV('t1','0x100'),V('a1','a',2),V('b1','b',7),V('da1','da',3),V('db1','db',2)],'first'),F('c2','Near.compare',[thisV('t2','0x100'),V('a2','a',6),V('b2','b',3),V('da2','da',1),V('db2','db',2)],'second')],[H('0x100','Near',[V('field','pivot',5)],'ctor')],['1:-1'],{ct:W('this','ct'),pivot:W('pivot','pivot'),field:W('this.pivot','field'),mt:W('this','t1','t2'),pa:W('a','a1','a2'),pb:W('b','b1','b2'),da:W('da','da1','da2'),db:W('db','db1','db2'),cmp:W('cmp','cmp'),first:W('first','first'),second:W('second','second')},'比较的是与 5 的距离，不是数本身；Integer.compare 的库内部帧省略。'),
P('06',5,'用比较器排序两个元素','算法步骤在源码中固定，不能假设库排序的调用次数。',`    static class Desc implements java.util.Comparator<Integer> {
        Desc() { /*@ct*/ }
        public int compare(Integer a, Integer b) { /*@mt*/ /*@pa*/ /*@pb*/ return b - a; }
    }
${main(`        java.util.Comparator<Integer> cmp = new Desc(); /*@cmp*/
        int[] data = {2, 7}; /*@data*/ /*@e0*/ /*@e1*/
        int order = cmp.compare(data[0], data[1]); /*@order*/
        if (order > 0) {
            int temp = data[0]; /*@temp*/
            data[0] = data[1]; /*@e0*/
            data[1] = temp; /*@e1*/
        }
        System.out.println(java.util.Arrays.toString(data));`)}`,[m([V('cmp','cmp','0x100'),V('data','data','0x101'),V('order','order',5),S('swap',[V('temp','temp',2)])]),F('ctor','Desc',[thisV('ct','0x100')],'cmp'),F('compare','Desc.compare',[thisV('mt','0x100'),V('pa','a',2),V('pb','b',7)],'order')],[H('0x100','Desc',[],'ctor'),H('0x101','int[]',[V('e0','0',2,7),V('e1','1',7,2)])],['[7, 2]'],{ct:W('this','ct'),mt:W('this','mt'),pa:W('a','pa'),pb:W('b','pb'),cmp:W('cmp','cmp'),data:W('data','data'),e0:W('data[0]','e0'),e1:W('data[1]','e1'),order:W('order','order'),temp:W('temp','temp')},'compare(2,7)=5，触发交换；temp 只在 if 块内，数组引用 data 未变化。')
];
