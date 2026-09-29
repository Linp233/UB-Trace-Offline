import {P,V,F,H,W,R,at,m,main,thisV} from './model.mjs';
const box=`    static class Box {
        int value;
        Box(int x) { /*@ct*/ /*@x*/
            this.value = x;
        }
    }`;
const cf=(id,addr,x,target)=>F(id,'Box',[thisV(id+'t',addr),V(id+'x','x',x)],target);
export const problems=[
P('03',1,'构造与实例方法','画出 this、形参和字段历史；区分局部值与对象状态。',`    static class Box {
        int value;
        Box(int x) { /*@ct*/ /*@x*/ this.value = x; /*@field*/ }
        int add(int delta) { /*@mt*/ /*@delta*/
            this.value += delta; /*@field*/
            return this.value;
        }
    }
${main(`        Box b = new Box(3); /*@b*/
        int result = b.add(2); /*@result*/
        System.out.println(result);`)}`,[m([V('b','b','0x100'),V('result','result',5)]),cf('ctor','0x100',3,'b'),F('add','Box.add',[thisV('mt','0x100'),V('delta','delta',2)],'result')],[H('0x100','Box',[V('field','value',3,5)],'ctor')],['5'],{ct:W('this','ctort'),x:W('x','ctorx'),mt:W('this','mt'),delta:W('delta','delta'),field:W('this.value','field'),b:W('b','b'),result:W('result','result')},'构造器和 add 的 this 都是 0x100；修改的是堆字段。'),
P('03',2,'两个对象与一个别名','同值或同类不等于同一个对象。',`${box}
${main(`        Box a = new Box(4); /*@a*/ /*@av*/
        Box b = new Box(7); /*@b*/ /*@bv*/
        Box alias = a; /*@alias*/
        alias.value = 9; /*@av*/
        boolean same = a == alias; /*@same*/
        System.out.println(a.value + ":" + b.value + ":" + same);`)}`,[m([V('a','a','0x100'),V('b','b','0x101'),V('alias','alias','0x100'),V('same','same','true')]),cf('c1','0x100',4,'a'),cf('c2','0x101',7,'b')],[H('0x100','Box',[V('av','value',4,9)],'c1'),H('0x101','Box',[V('bv','value',7)],'c2')],['9:7:true'],{ct:W('this','c1t','c2t'),x:W('x','c1x','c2x'),a:W('a','a'),b:W('b','b'),alias:W('alias','alias'),same:W('same','same'),av:W('a.value','av'),bv:W('b.value','bv')},'alias 与 a 同址；b 的字段不受影响。'),
P('03',3,'对象参数的修改与重新绑定','方法返回后保留两个堆对象及已结束调用帧。',`${box}
    static void redirect(Box p) { /*@p*/
        p.value = 8; /*@av2*/
        p = new Box(2); /*@p*/ /*@bv*/
        p.value = 3; /*@bv*/
    }
${main(`        Box a = new Box(5); /*@a*/ /*@av1*/
        redirect(a);
        System.out.println(a.value);`)}`,[m([V('a','a','0x100')]),cf('c1','0x100',5,'a'),F('redirect','redirect',[V('p','p','0x100','0x101')]),cf('c2','0x101',2,'p')],[H('0x100','Box',[V('av','value',5,8)],'c1'),H('0x101','Box',[V('bv','value',2,3)],'c2')],['8'],{ct:W('this','c1t','c2t'),x:W('x','c1x','c2x'),a:W('a','a'),p:W('p','p'),av1:W('a.value',at('av',0)),av2:W('p.value',at('av',1)),bv:W('p.value','bv')},'对原对象的修改可见；重新绑定 p 不改变 a。第二个对象仍保留在历史图中。'),
P('03',4,'static 计数与实例编号','共享类存储只有一份；每个对象有独立的 id。',`    static class Ticket {
        static int made = 0;
        int id;
        Ticket() { /*@ct*/
            Ticket.made++; /*@made*/
            this.id = Ticket.made; /*@id*/
        }
    }
${main(`        /*@made*/
        Ticket a = new Ticket(); /*@a*/
        Ticket b = new Ticket(); /*@b*/
        System.out.println(a.id + ":" + b.id + ":" + Ticket.made);`)}`,[m([V('a','a','0x100'),V('b','b','0x101')]),F('c1','Ticket',[thisV('t1','0x100')],'a'),F('c2','Ticket',[thisV('t2','0x101')],'b')],[H('static:Ticket','Ticket (static storage)',[V('made','Ticket.made',0,1,2)]),H('0x100','Ticket',[V('id1','id',1)],'c1'),H('0x101','Ticket',[V('id2','id',2)],'c2')],['1:2:2'],{ct:W('this','t1','t2'),made:W('Ticket.made','made'),id:W('this.id','id1','id2'),a:W('a','a'),b:W('b','b')},'static:Ticket 是工具的共享类存储标签，不是第三个 new 实例。'),
P('03',5,'this 构造器委托','两次构造器调用共享一个对象；分配关联到外层构造器。',`    static class Box {
        int value;
        Box() { this(4); /*@outer*/ }
        Box(int x) { /*@inner*/ /*@x*/ this.value = x; /*@v1*/ }
    }
${main(`        Box b = new Box(); /*@b*/
        b.value++; /*@v2*/
        System.out.println(b.value);`)}`,[m([V('b','b','0x100')]),F('c0','Box()',[thisV('t0','0x100')],'b'),F('c1','Box(int)',[thisV('t1','0x100'),V('x','x',4)])],[H('0x100','Box',[V('value','value',4,5)],'c0')],['5'],{outer:W('this','t0'),inner:W('this','t1'),x:W('x','x'),b:W('b','b'),v1:W('this.value',at('value',0)),v2:W('b.value',at('value',1))},'进入顺序是 Box() 再 Box(int)；Java 探针在 this(4) 返回后才能读取外层构造器的 this，不代表帧进入顺序反转。')
];

const node=`    static class Node {
        int value;
        Node next;
        Node(int value, Node next) { /*@ct*/ /*@pv*/ /*@pn*/
            this.value = value; /*@hv*/
            this.next = next; /*@hn*/
        }
    }`;
function linked(n,title,focus,code,locals,allocations,fields,io,watches,explanation){
 const constructors=allocations.map((a,i)=>F(`c${i}`,'Node',[thisV(`t${i}`,a[0]),V(`pv${i}`,'value',a[1]),V(`pn${i}`,'next',a[2])],a[3]));
 const objects=allocations.map((a,i)=>H(a[0],'Node',[V(`hv${i}`,'value',...fields[i][0]),V(`hn${i}`,'next',...fields[i][1])],`c${i}`));
 return P('04',n,title,focus,`${node}\n${main(code)}`,[m(locals),...constructors],objects,io,{
  ct:W('this',...allocations.map((_,i)=>`t${i}`)),pv:W('value',...allocations.map((_,i)=>`pv${i}`)),pn:W('next',...allocations.map((_,i)=>`pn${i}`)),
  hv:W('this.value',...allocations.map((_,i)=>at(`hv${i}`,0))),hn:W('this.next',...allocations.map((_,i)=>at(`hn${i}`,0))),...watches
 },explanation);
}
problems.push(
linked(1,'连接两个节点','从尾到头分配，地址顺序与链表顺序不同。',`        Node tail = new Node(7, null); /*@tail*/
        Node head = new Node(3, tail); /*@head*/
        int total = head.value + head.next.value; /*@total*/
        System.out.println(total);`,[V('tail','tail','0x100'),V('head','head','0x101'),V('total','total',10)],[['0x100',7,'null','tail'],['0x101',3,'0x100','head']],[[[7],['null']],[[3],['0x100']]],['10'],{tail:W('tail','tail'),head:W('head','head'),total:W('total','total')},'head 的 next 指向先创建的 tail；null 不创建堆对象。'),
linked(2,'在链首插入','head 更新只改变入口引用，旧节点仍存在。',`        Node head = new Node(5, null); /*@head*/
        Node old = head; /*@old*/
        head = new Node(2, head); /*@head*/
        System.out.println(head.next == old);`,[V('head','head','0x100','0x101'),V('old','old','0x100')],[['0x100',5,'null','head'],['0x101',2,'0x100','head']],[[[5],['null']],[[2],['0x100']]],['true'],{head:W('head','head'),old:W('old','old')},'第二次 new 的实参 head 仍是旧地址 0x100。两个分配结果箭头都指向 head 这一变量行。'),
linked(3,'绕过中间节点','字段更新不等于销毁被绕过的对象。',`        Node tail = new Node(9, null); /*@tail*/
        Node middle = new Node(6, tail); /*@middle*/
        Node head = new Node(1, middle); /*@head*/
        head.next = middle.next; /*@change*/
        System.out.println(head.next.value + ":" + middle.value);`,[V('tail','tail','0x100'),V('middle','middle','0x101'),V('head','head','0x102')],[['0x100',9,'null','tail'],['0x101',6,'0x100','middle'],['0x102',1,'0x101','head']],[[[9],['null']],[[6],['0x100']],[[1],['0x101','0x100']]],['9:6'],{tail:W('tail','tail'),middle:W('middle','middle'),head:W('head','head'),change:W('head.next',at('hn2',1))},'head.next 改指 tail；middle 仍被局部变量引用，不能删掉。'),
linked(4,'链表实现栈的 push 和 pop','保留 top 的 null 初值及两次 push 和一次 pop。',`        Node top = null; /*@top*/
        top = new Node(10, top); /*@top*/
        top = new Node(20, top); /*@top*/
        int popped = top.value; /*@popped*/
        top = top.next; /*@top*/
        System.out.println(popped + ":" + top.value);`,[V('top','top','null','0x100','0x101','0x100'),V('popped','popped',20)],[['0x100',10,'null','top'],['0x101',20,'0x100','top']],[[[10],['null']],[[20],['0x100']]],['20:10'],{top:W('top','top'),popped:W('popped','popped')},'后入先出；pop 只移动 top，不模拟垃圾回收。'),
linked(5,'队列的首尾引用','入队修改尾节点的 next，出队修改 head。',`        Node head = new Node(5, null); /*@head*/
        Node tail = head; /*@tail*/
        tail.next = new Node(8, null); /*@link*/
        tail = tail.next; /*@tail*/
        int removed = head.value; /*@removed*/
        head = head.next; /*@head*/
        System.out.println(removed + ":" + (head == tail));`,[V('head','head','0x100','0x101'),V('tail','tail','0x100','0x101'),V('removed','removed',5)],[['0x100',5,'null','head'],['0x101',8,'null','hn0']],[[[5],['null','0x101']],[[8],['null']]],['5:true'],{head:W('head','head'),tail:W('tail','tail'),link:W('head.next',at('hn0',1)),removed:W('removed','removed')},'第二个构造器的分配结果写入旧尾节点的 next；最后 head、tail 同指剩下的节点。')
);
