import {P,V,S,F,H,W,at,m,main,thisV} from './model.mjs';
export const problems=[
P('07',1,'边界测试驱动','追踪被测函数和三个测试输入；最后给出布尔测试结果。',`    static int clip(int x) { /*@x*/
        if (x < 0) return 0;
        if (x > 10) return 10;
        return x;
    }
${main(`        int a = clip(-2); /*@a*/
        int b = clip(6); /*@b*/
        int c = clip(12); /*@c*/
        boolean passed = a == 0 && b == 6 && c == 10; /*@passed*/
        System.out.println(passed);`)}`,[m([V('a','a',0),V('b','b',6),V('c','c',10),V('passed','passed','true')]),F('c1','clip',[V('x1','x',-2)],'a'),F('c2','clip',[V('x2','x',6)],'b'),F('c3','clip',[V('x3','x',12)],'c')],[],['true'],{x:W('x','x1','x2','x3'),a:W('a','a'),b:W('b','b'),c:W('c','c'),passed:W('passed','passed')},'测试了下界外、区间内和上界外；三个调用帧的 x 相互独立。'),
P('07',2,'通过一个测试不代表实现正确','代码故意含有逻辑缺陷；按原样 trace，不要修复它。',`    static int square(int n) { /*@n*/ return n + n; }
${main(`        int expected = 9; /*@expected*/
        int actual = square(3); /*@actual*/
        boolean first = actual == expected; /*@first*/
        int other = square(2); /*@other*/
        boolean second = other == 4; /*@second*/
        System.out.println(first);
        System.out.println(second);`)}`,[m([V('expected','expected',9),V('actual','actual',6),V('first','first','false'),V('other','other',4),V('second','second','true')]),F('s1','square',[V('n1','n',3)],'actual'),F('s2','square',[V('n2','n',2)],'other')],[],['false','true'],{n:W('n','n1','n2'),expected:W('expected','expected'),actual:W('actual','actual'),first:W('first','first'),other:W('other','other'),second:W('second','second')},'实际代码计算 n+n：输入 3 时错误，输入 2 时碰巧与平方相同。'),
P('07',3,'double 容差测试','记录真实 double 值，不把 0.1+0.2 写成精确的 0.3。',`    static boolean near(double actual, double expected, double epsilon) { /*@a*/ /*@e*/ /*@eps*/
        double diff = Math.abs(actual - expected); /*@diff*/
        return diff <= epsilon;
    }
${main(`        double actual = 0.1 + 0.2; /*@actual*/
        boolean exact = actual == 0.3; /*@exact*/
        boolean passed = near(actual, 0.3, 1e-9); /*@passed*/
        System.out.println(exact + ":" + passed);`)}`,[m([V('actual','actual','0.30000000000000004'),V('exact','exact','false'),V('passed','passed','true')]),F('near','near',[V('a','actual','0.30000000000000004'),V('e','expected','0.3'),V('eps','epsilon','1.0E-9'),V('diff','diff','5.551115123125783E-17')],'passed')],[],['false:true'],{a:W('actual','a'),e:W('expected','e'),eps:W('epsilon','eps'),diff:W('diff','diff'),actual:W('actual','actual'),exact:W('exact','exact'),passed:W('passed','passed')},'精确相等失败，但差值小于容差；Math.abs 的库内部不展开。'),
P('07',4,'字符串结果测试','用 equals 比较内容，Locale.ROOT 固定大小写转换规则。',`    static String normalize(String name) { /*@name*/
        String cleaned = name.trim(); /*@cleaned*/
        String result = cleaned.toUpperCase(java.util.Locale.ROOT); /*@result*/
        return result;
    }
${main(`        String actual = normalize("  Ada "); /*@actual*/
        String expected = "ADA"; /*@expected*/
        boolean passed = actual.equals(expected); /*@passed*/
        System.out.println(passed);`)}`,[m([V('actual','actual','"ADA"'),V('expected','expected','"ADA"'),V('passed','passed','true')]),F('normalize','normalize',[V('name','name','"  Ada "'),V('cleaned','cleaned','"Ada"'),V('result','result','"ADA"')],'actual')],[],['true'],{name:W('name','name'),cleaned:W('cleaned','cleaned'),result:W('result','result'),actual:W('actual','actual'),expected:W('expected','expected'),passed:W('passed','passed')},'trim 不修改原字符串；每个字符串按课程简化写直接值，不建立字符串池。'),
P('07',5,'共享测试对象造成状态污染','比较复用对象与新建对象；完整保留每次 next 调用。',`    static class Counter {
        int value;
        Counter() { /*@ct*/ value = 0; /*@state*/ }
        int next() { /*@mt*/ value++; /*@state*/ return value; }
    }
${main(`        Counter shared = new Counter(); /*@shared*/
        int first = shared.next(); /*@first*/
        int second = shared.next(); /*@second*/
        boolean independent = first == 1 && second == 1; /*@independent*/
        Counter fresh = new Counter(); /*@fresh*/
        int retry = fresh.next(); /*@retry*/
        boolean passed = retry == 1; /*@passed*/
        System.out.println(independent + ":" + passed);`)}`,[m([V('shared','shared','0x100'),V('first','first',1),V('second','second',2),V('independent','independent','false'),V('fresh','fresh','0x101'),V('retry','retry',1),V('passed','passed','true')]),F('c1','Counter',[thisV('c1t','0x100')],'shared'),F('n1','Counter.next',[thisV('n1t','0x100')],'first'),F('n2','Counter.next',[thisV('n2t','0x100')],'second'),F('c2','Counter',[thisV('c2t','0x101')],'fresh'),F('n3','Counter.next',[thisV('n3t','0x101')],'retry')],[H('0x100','Counter',[V('s1','value',0,1,2)],'c1'),H('0x101','Counter',[V('s2','value',0,1)],'c2')],['false:true'],{ct:W('this','c1t','c2t'),mt:W('this','n1t','n2t','n3t'),state:W('value','s1','s2'),shared:W('shared','shared'),first:W('first','first'),second:W('second','second'),independent:W('independent','independent'),fresh:W('fresh','fresh'),retry:W('retry','retry'),passed:W('passed','passed')},'shared 的第二次 next 返回 2；新对象的状态重新从 0 开始。测试驱动只报告结果，不故意抛异常。')
];
const node=`    static class Node {
        int value;
        Node left, right;
        Node(int value, Node left, Node right) { /*@ct*/ /*@pv*/ /*@pl*/ /*@pr*/
            this.value = value; /*@hv*/
            this.left = left; /*@hl*/
            this.right = right; /*@hr*/
        }
    }`;
const defaultAlloc=[['0x100',1,'null','null','left'],['0x101',3,'null','null','right'],['0x102',2,'0x100','0x101','root']];
const initial=`        Node left = new Node(1, null, null); /*@left*/
        Node right = new Node(3, null, null); /*@right*/
        Node root = new Node(2, left, right); /*@root*/`;
const locals=()=>[V('left','left','0x100'),V('right','right','0x101'),V('root','root','0x102')];
const initW=()=>({left:W('left','left'),right:W('right','right'),root:W('root','root')});
function tree(n,title,focus,methods,code,frames,watches,explanation,alloc=defaultAlloc,changes={}){
 const ctor=alloc.map((a,i)=>F(`c${i}`,'Node',[thisV(`ct${i}`,a[0]),V(`pv${i}`,'value',a[1]),V(`pl${i}`,'left',a[2]),V(`pr${i}`,'right',a[3])],a[4]));
 const heap=alloc.map((a,i)=>H(a[0],'Node',[V(`hv${i}`,'value',...(changes[`hv${i}`]||[a[1]])),V(`hl${i}`,'left',...(changes[`hl${i}`]||[a[2]])),V(`hr${i}`,'right',...(changes[`hr${i}`]||[a[3]]))],`c${i}`));
 const ordered=frames.flatMap(f=>typeof f==='number'?[ctor[f]]:[f]);
 return P('08',n,title,focus,`${node}\n${methods}\n${main(code)}`,ordered,heap, n===2?['1','2','3']:n===1?['10']:n===4?['3']:['3'],{
  ct:W('this',...alloc.map((_,i)=>`ct${i}`)),pv:W('value',...alloc.map((_,i)=>`pv${i}`)),pl:W('left',...alloc.map((_,i)=>`pl${i}`)),pr:W('right',...alloc.map((_,i)=>`pr${i}`)),
  hv:W('this.value',...alloc.map((_,i)=>at(`hv${i}`,0))),hl:W('this.left',...alloc.map((_,i)=>at(`hl${i}`,0))),hr:W('this.right',...alloc.map((_,i)=>at(`hr${i}`,0))),...watches
 },explanation);
}
problems.push(
tree(1,'树节点与共享引用','alias 指向左子节点，修改它会从 root 路径看见。','',`${initial}
        Node alias = root.left; /*@alias*/
        alias.value += 4; /*@change*/
        int total = root.value + root.left.value + root.right.value; /*@total*/
        System.out.println(total);`,[m([...locals(),V('alias','alias','0x100'),V('total','total',10)]),0,1,2],{...initW(),alias:W('alias','alias'),change:W('alias.value',at('hv0',1)),total:W('total','total')},'root.left 与 alias 同指 0x100；左子节点从 1 改为 5。',defaultAlloc,{hv0:[1,5]}),
tree(2,'中序遍历包含 null 调用','每次 visit(null) 也是实际调用，不能省略其帧。',`    static void visit(Node node) { /*@node*/
        if (node == null) return;
        visit(node.left);
        System.out.println(node.value);
        visit(node.right);
    }`,`${initial}
        visit(root);`,[m(locals()),0,1,2,...['0x102','0x100','null','null','0x101','null','null'].map((a,i)=>F(`v${i}`,'visit',[V(`n${i}`,'node',a)]))],{...initW(),node:W('node',...Array.from({length:7},(_,i)=>`n${i}`))},'左、根、右顺序输出 1、2、3；三个非空节点加四次空引用，共七次 visit。'),
tree(3,'递归计算节点数','返回值分别回到直接调用者的 leftSize 或 rightSize。',`    static int size(Node node) { /*@node*/
        if (node == null) return 0;
        int leftSize = size(node.left); /*@ls*/
        int rightSize = size(node.right); /*@rs*/
        return 1 + leftSize + rightSize;
    }`,`${initial}
        int result = size(root); /*@result*/
        System.out.println(result);`,[m([...locals(),V('result','result',3)]),0,1,2,
 F('s0','size',[V('n0','node','0x102'),V('l0','leftSize',1),V('r0','rightSize',1)],'result'),
 F('s1','size',[V('n1','node','0x100'),V('l1','leftSize',0),V('r1','rightSize',0)],'l0'),
 F('s2','size',[V('n2','node','null')],'l1'),F('s3','size',[V('n3','node','null')],'r1'),
 F('s4','size',[V('n4','node','0x101'),V('l4','leftSize',0),V('r4','rightSize',0)],'r0'),
 F('s5','size',[V('n5','node','null')],'l4'),F('s6','size',[V('n6','node','null')],'r4')],{...initW(),node:W('node',...Array.from({length:7},(_,i)=>`n${i}`)),ls:W('leftSize','l1','l0','l4'),rs:W('rightSize','r1','r4','r0'),result:W('result','result')},'叶子节点各返回 1，根返回 3。帧按进入顺序列出，局部返回值则在递归展开后才赋值。'),
tree(4,'迭代 BST 查找','node 参数会重新绑定，树的字段没有改变。',`    static Node find(Node node, int target) { /*@node*/ /*@target*/
        while (node != null) {
            if (node.value == target) return node;
            node = target < node.value ? node.left : node.right; /*@node*/
        }
        return null;
    }`,`${initial}
        Node found = find(root, 3); /*@found*/
        System.out.println(found.value);`,[m([...locals(),V('found','found','0x101')]),0,1,2,F('find','find',[V('node','node','0x102','0x101'),V('target','target',3)],'found')],{...initW(),node:W('node','node'),target:W('target','target'),found:W('found','found')},'先比较根 2，再沿 right 找到 3；find 返回的是既有节点的地址。'),
tree(5,'递归 BST 插入','跟踪新节点、父节点 left 字段以及重复赋回 root。',`    static Node insert(Node node, int value) { /*@node*/ /*@iv*/
        if (node == null) {
            Node made = new Node(value, null, null); /*@made*/
            return made;
        }
        if (value < node.value) {
            node.left = insert(node.left, value); /*@link*/
        }
        return node;
    }`,`        Node root = new Node(5, null, null); /*@root*/
        root = insert(root, 3); /*@root*/
        System.out.println(root.left.value);`,[m([V('root','root','0x100','0x100')]),0,
 F('i0','insert',[V('n0','node','0x100'),V('iv0','value',3)],'root'),
 F('i1','insert',[V('n1','node','null'),V('iv1','value',3),S('base-case',[V('made','made','0x101')])],'hl0'),1],
 {root:W('root','root'),node:W('node','n0','n1'),iv:W('value','iv0','iv1'),made:W('made','made'),link:W('node.left',at('hl0',1))},'只插入一个值 3。递归基例的 made 接收新对象；insert(null,3) 的返回写入根的 left；最后 root 再次赋同一地址也保留历史。',[['0x100',5,'null','null','root'],['0x101',3,'null','null','made']],{hl0:['null','0x101']})
);
