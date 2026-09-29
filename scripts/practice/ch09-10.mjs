import {P,V,S,F,H,A,W,at,m,main} from './model.mjs';
export const problems=[
P('09',1,'邻接表中的容器引用','顶点按 0、1、2 编号；外层表存的是邻居表的引用。',main(`        java.util.ArrayList<java.util.ArrayList<Integer>> graph = new java.util.ArrayList<>(); /*@graph*/
        java.util.ArrayList<Integer> a = new java.util.ArrayList<>(); /*@a*/
        java.util.ArrayList<Integer> b = new java.util.ArrayList<>(); /*@b*/
        java.util.ArrayList<Integer> c = new java.util.ArrayList<>(); /*@c*/
        a.add(1); /*@a0*/
        a.add(2); /*@a1*/
        b.add(2); /*@b0*/
        graph.add(a); /*@g0*/
        graph.add(b); /*@g1*/
        graph.add(c); /*@g2*/
        int degree = graph.get(0).size(); /*@degree*/
        int target = graph.get(0).get(1); /*@target*/
        System.out.println(degree + ":" + target);`),[m([V('graph','graph','0x100'),V('a','a','0x101'),V('b','b','0x102'),V('c','c','0x103'),V('degree','degree',2),V('target','target',2)])],[A('0x100','ArrayList<ArrayList<Integer>>','g',['0x101','0x102','0x103']),A('0x101','ArrayList<Integer>','a',[1,2]),A('0x102','ArrayList<Integer>','b',[2]),H('0x103','ArrayList<Integer>',[])],['2:2'],{graph:W('graph','graph'),a:W('a','a'),b:W('b','b'),c:W('c','c'),a0:W('a.get(0)','a0'),a1:W('a.get(1)','a1'),b0:W('b.get(0)','b0'),g0:W('graph.get(0)','g0'),g1:W('graph.get(1)','g1'),g2:W('graph.get(2)','g2'),degree:W('degree','degree'),target:W('target','target')},'图的边为 0→1、0→2、1→2；空邻居表 c 仍是一个真实对象。')
];
const gcode=`        int[][] graph = {{1, 2}, {2}, {}}; /*@graph*/ /*@r0*/ /*@r1*/ /*@r2*/ /*@e00*/ /*@e01*/ /*@e10*/`;
const gheap=()=>[A('0x100','int[][]','r',['0x101','0x102','0x103']),A('0x101','int[]','e0',[1,2]),A('0x102','int[]','e1',[2]),H('0x103','int[]',[])];
const gw=()=>({graph:W('graph','graph'),r0:W('graph[0]','r0'),r1:W('graph[1]','r1'),r2:W('graph[2]','r2'),e00:W('graph[0][0]','e00'),e01:W('graph[0][1]','e01'),e10:W('graph[1][0]','e10')});
problems.push(
P('09',2,'BFS：入队时标记','邻居顺序由数组固定；顶点 2 不应重复入队。',main(`${gcode}
        int[] queue = new int[3]; /*@queue*/ /*@q0*/ /*@q1*/ /*@q2*/
        boolean[] seen = new boolean[3]; /*@seen*/ /*@s0*/ /*@s1*/ /*@s2*/
        int head = 0; /*@head*/
        int tail = 0; /*@tail*/
        queue[tail] = 0; /*@q0*/
        tail++; /*@tail*/
        seen[0] = true; /*@s0*/
        while (head < tail) {
            int vertex = queue[head]; /*@vertex*/
            head++; /*@head*/
            System.out.println(vertex);
            for (int next : graph[vertex]) { /*@next*/
                if (!seen[next]) {
                    seen[next] = true; /*@mark*/
                    queue[tail] = next; /*@enqueue*/
                    tail++; /*@tail*/
                }
            }
        }`),[m([V('graph','graph','0x100'),V('queue','queue','0x104'),V('seen','seen','0x105'),V('head','head',0,1,2,3),V('tail','tail',0,1,2,3),S('bfs',[V('vertex','vertex',0,1,2),S('neighbors',[V('next','next',1,2,2)])])])],[...gheap(),H('0x104','int[]',[V('q0','0',0,0),V('q1','1',0,1),V('q2','2',0,2)]),H('0x105','boolean[]',[V('s0','0','false','true'),V('s1','1','false','true'),V('s2','2','false','true')])],['0','1','2'],{...gw(),queue:W('queue','queue'),seen:W('seen','seen'),q0:W('queue[0]','q0'),q1:W('queue[1]',at('q1',0)),q2:W('queue[2]',at('q2',0)),s0:W('seen[0]','s0'),s1:W('seen[1]',at('s1',0)),s2:W('seen[2]',at('s2',0)),head:W('head','head'),tail:W('tail','tail'),vertex:W('vertex','vertex'),next:W('next','next'),mark:W('seen[next]',at('s1',1),at('s2',1)),enqueue:W('queue[tail]',at('q1',1),at('q2',1))},'处理顶点 0 时先后入队 1 和 2；处理 1 时发现 2 已标记。队列为固定数组，出队只增加 head，不清空旧元素。'),
P('09',3,'DFS：已访问顶点的再次调用','同一图按固定邻居顺序递归；记录早返回的第二次 dfs(2)。',`    static void dfs(int[][] graph, boolean[] seen, int vertex) { /*@pg*/ /*@ps*/ /*@vertex*/
        if (seen[vertex]) return;
        seen[vertex] = true; /*@mark*/
        System.out.println(vertex);
        for (int next : graph[vertex]) { /*@next*/
            dfs(graph, seen, next);
        }
    }
${main(`${gcode}
        boolean[] seen = new boolean[3]; /*@seen*/ /*@s0*/ /*@s1*/ /*@s2*/
        dfs(graph, seen, 0);`)}`,[m([V('graph','graph','0x100'),V('seen','seen','0x104')]),...['0','1','2','2'].map((v,i)=>F(`d${i}`,'dfs',[V(`pg${i}`,'graph','0x100'),V(`ps${i}`,'seen','0x104'),V(`v${i}`,'vertex',v),...(i===0?[S('loop0',[V('next0','next',1,2)])]:i===1?[S('loop1',[V('next1','next',2)])]:[])]))],[...gheap(),H('0x104','boolean[]',[V('s0','0','false','true'),V('s1','1','false','true'),V('s2','2','false','true')])],['0','1','2'],{...gw(),seen:W('seen','seen'),s0:W('seen[0]',at('s0',0)),s1:W('seen[1]',at('s1',0)),s2:W('seen[2]',at('s2',0)),pg:W('graph','pg0','pg1','pg2','pg3'),ps:W('seen','ps0','ps1','ps2','ps3'),vertex:W('vertex','v0','v1','v2','v3'),mark:W('seen[vertex]',at('s0',1),at('s1',1),at('s2',1)),next:W('next',at('next0',0),'next1',at('next0',1))},'调用进入顺序为 dfs(0)、dfs(1)、dfs(2)、dfs(2)。最后一次立即返回，不能多输出一个 2，也不能省掉这个调用帧。'),
P('09',4,'根据前驱数组恢复路径','给定 previous，无需运行 BFS；记录逆序恢复的列表。',main(`        int[] previous = {-1, 0, 0, 1}; /*@previous*/ /*@p0*/ /*@p1*/ /*@p2*/ /*@p3*/
        int current = 3; /*@current*/
        java.util.ArrayList<Integer> reverse = new java.util.ArrayList<>(); /*@reverse*/
        while (current != -1) {
            reverse.add(current); /*@added*/
            current = previous[current]; /*@current*/
        }
        System.out.println(reverse);`),[m([V('previous','previous','0x100'),V('current','current',3,1,0,-1),V('reverse','reverse','0x101')])],[A('0x100','int[]','p',[-1,0,0,1]),A('0x101','ArrayList<Integer>','e',[3,1,0])],['[3, 1, 0]'],{previous:W('previous','previous'),p0:W('previous[0]','p0'),p1:W('previous[1]','p1'),p2:W('previous[2]','p2'),p3:W('previous[3]','p3'),current:W('current','current'),reverse:W('reverse','reverse'),added:W('reverse.get(reverse.size()-1)','e0','e1','e2')},'前驱链为 3→1→0→-1，源码没有反转列表，因此打印终点到起点的顺序。'),
P('09',5,'邻接矩阵的出度与边数','有向图按每行统计出边；保留嵌套循环的全部历史。',main(`        int[][] graph = {{0,1,1}, {0,0,1}, {1,0,0}}; /*@graph*/ /*@r0*/ /*@r1*/ /*@r2*/ /*@a0*/ /*@a1*/ /*@a2*/ /*@b0*/ /*@b1*/ /*@b2*/ /*@c0*/ /*@c1*/ /*@c2*/
        int edges = 0; /*@edges*/
        for (int row = 0; /*?row:row < graph.length*/; row++) {
            int degree = 0; /*@degree*/
            for (int col = 0; /*?col:col < graph[row].length*/; col++) {
                degree += graph[row][col]; /*@degree*/
            }
            edges += degree; /*@edges*/
            System.out.println(degree);
        }
        System.out.println(edges);`),[m([V('graph','graph','0x100'),V('edges','edges',0,2,3,4),S('rows',[V('row','row',0,1,2,3),V('degree','degree',0,0,1,2,0,0,0,1,0,1,1,1),S('cols',[V('col','col',0,1,2,3,0,1,2,3,0,1,2,3)])])])],[A('0x100','int[][]','r',['0x101','0x102','0x103']),A('0x101','int[]','a',[0,1,1]),A('0x102','int[]','b',[0,0,1]),A('0x103','int[]','c',[1,0,0])],['2','1','1','4'],{graph:W('graph','graph'),r0:W('graph[0]','r0'),r1:W('graph[1]','r1'),r2:W('graph[2]','r2'),...Object.fromEntries(['a','b','c'].flatMap((k,r)=>[0,1,2].map(c=>[`${k}${c}`,W(`graph[${r}][${c}]`,`${k}${c}`)]))),edges:W('edges','edges'),row:W('row','row'),degree:W('degree','degree'),col:W('col','col')},'三行出度为 2、1、1，总边数为 4；矩阵含 2→0，不能把它当作无向对称矩阵。每次显式 +=0 也保留一次赋值。')
);
const runtime=(n,title,focus,code,items,heap,io,watches,explanation,analysis)=>P('10',n,title,focus,main(code),[m(items)],heap,io,watches,explanation,{task:'除完整 trace 外，请给出题中指定操作的执行次数，并把固定输入推广到 n 后给出增长阶。',notes:analysis});
problems.push(
runtime(1,'线性循环','只统计 count++ 的执行次数。',`        int n = 4; /*@n*/
        int count = 0; /*@count*/
        for (int i = 0; /*?i:i < n*/; i++) {
            count++; /*@count*/
        }
        System.out.println(count);`,[V('n','n',4),V('count','count',0,1,2,3,4),S('loop',[V('i','i',0,1,2,3,4)])],[],['4'],{n:W('n','n'),count:W('count','count'),i:W('i','i')},'i=4 时条件失败，最后的增量仍在历史中。','指定操作 count++：本题 4 次；一般 n≥0 时 n 次，时间增长阶 Θ(n)。'),
runtime(2,'三角形嵌套循环','只统计最内层 count++，不要误算为 n² 次。',`        int n = 3; /*@n*/
        int count = 0; /*@count*/
        for (int i = 0; /*?i:i < n*/; i++) {
            for (int j = 0; /*?j:j <= i*/; j++) {
                count++; /*@count*/
            }
        }
        System.out.println(count);`,[V('n','n',3),V('count','count',0,1,2,3,4,5,6),S('outer',[V('i','i',0,1,2,3),S('inner',[V('j','j',0,1,0,1,2,0,1,2,3)])])],[],['6'],{n:W('n','n'),count:W('count','count'),i:W('i','i'),j:W('j','j')},'每次外层迭代的内层次数分别是 1、2、3；j 在新一轮外层迭代重新初始化。','指定操作 count++：本题 6 次；一般 n≥0 时 n(n+1)/2 次，Θ(n²)。'),
runtime(3,'倍增循环','只统计 count++；保留使循环结束的 step=16。',`        int n = 10; /*@n*/
        int count = 0; /*@count*/
        for (int step = 1; /*?step:step < n*/; step *= 2) {
            count++; /*@count*/
        }
        System.out.println(count);`,[V('n','n',10),V('count','count',0,1,2,3,4),S('loop',[V('step','step',1,2,4,8,16)])],[],['4'],{n:W('n','n'),count:W('count','count'),step:W('step','step')},'实际执行循环体时 step 为 1、2、4、8。','指定操作 count++：本题 4 次；n≥1 且不发生整数溢出时为 ceil(log2 n) 次，渐近 Θ(log n)。'),
runtime(4,'顺序循环相加','两个循环顺序执行，统计两处 count++ 的合计次数。',`        int n = 3; /*@n*/
        int count = 0; /*@count*/
        for (int i = 0; /*?i:i < n*/; i++) {
            count++; /*@count*/
        }
        for (int j = 0; /*?j:j < n*/; j++) {
            count++; /*@count*/
        }
        System.out.println(count);`,[V('n','n',3),V('count','count',0,1,2,3,4,5,6),S('first-loop',[V('i','i',0,1,2,3)]),S('second-loop',[V('j','j',0,1,2,3)])],[],['6'],{n:W('n','n'),count:W('count','count'),i:W('i','i'),j:W('j','j')},'i 与 j 属于不同循环 scope；两个循环不是嵌套关系。','指定操作 count++：本题 6 次；一般 n≥0 时 2n 次，Θ(n)。'),
runtime(5,'提前结束的线性查找','count 表示实际检查了多少个数组元素；break 后没有 i++。',`        int[] data = {5, 8, 2, 9}; /*@data*/ /*@e0*/ /*@e1*/ /*@e2*/ /*@e3*/
        int target = 2; /*@target*/
        int count = 0; /*@count*/
        int found = -1; /*@found*/
        for (int i = 0; /*?i:i < data.length*/; i++) {
            count++; /*@count*/
            if (data[i] == target) {
                found = i; /*@found*/
                break;
            }
        }
        System.out.println(count + ":" + found);`,[V('data','data','0x100'),V('target','target',2),V('count','count',0,1,2,3),V('found','found',-1,2),S('loop',[V('i','i',0,1,2)])],[A('0x100','int[]','e',[5,8,2,9])],['3:2'],{data:W('data','data'),e0:W('data[0]','e0'),e1:W('data[1]','e1'),e2:W('data[2]','e2'),e3:W('data[3]','e3'),target:W('target','target'),count:W('count','count'),found:W('found','found'),i:W('i','i')},'检查下标 0、1、2 后找到目标，i 的最终值是 2。','指定操作 count++：本题 3 次；长度 n≥1 的数组最好 1 次，最坏 n 次。最好 Θ(1)，最坏 Θ(n)。')
);
