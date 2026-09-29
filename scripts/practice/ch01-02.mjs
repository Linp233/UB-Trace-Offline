import {P,V,S,F,H,A,W,R,at,m,main} from './model.mjs';
export const problems=[
P('01',1,'整数除法与数值提升','记录每次赋值，区分整数除法与 double 运算。',main(`        int x = 9; /*@x*/
        int y = x / 2; /*@y*/
        x += y; /*@x*/
        double ratio = x / 2.0; /*@ratio*/
        System.out.println(x);
        System.out.println(y);
        System.out.println(ratio);`),[m([V('x','x',9,13),V('y','y',4),V('ratio','ratio','6.5')])],[],['13','4','6.5'],{x:W('x','x'),y:W('y','y'),ratio:W('ratio','ratio')},'9 / 2 先得到整数 4；更新 x 后才计算 13 / 2.0。'),
P('01',2,'同一方法的两次调用','分别画出两个 triple 调用帧，并连接直接返回目标。',`    static int triple(int input) { /*@input*/
        int out = input * 3; /*@out*/
        return out;
    }
${main(`        int a = 2; /*@a*/
        int b = triple(a); /*@b*/
        a = triple(b); /*@a*/
        System.out.println(a + b);`)}`,[m([V('a','a',2,18),V('b','b',6)]),F('t1','triple',[V('p1','input',2),V('o1','out',6)],'b'),F('t2','triple',[V('p2','input',6),V('o2','out',18)],'a')],[],['24'],{a:W('a','a'),b:W('b','b'),input:W('input','p1','p2'),out:W('out','o1','o2')},'第二次调用的 input 是 b 的值 6；调用帧不能合并。'),
P('01',3,'短路与分支作用域','判断 ++x 是否执行，并保留实际进入分支的局部变量。',main(`        int x = 3; /*@x*/
        boolean hit = x > 5 && ++x > 0; /*@hit*/
        if (!hit) {
            int bonus = 4; /*@bonus*/
            x += bonus; /*@x*/
        } else {
            x = 100;
        }
        System.out.println(x);`),[m([V('x','x',3,7),V('hit','hit','false'),S('branch',[V('bonus','bonus',4)])])],[],['7'],{x:W('x','x'),hit:W('hit','hit'),bonus:W('bonus','bonus')},'&& 的左侧为 false，++x 不执行；bonus 的块作用域已释放。'),
P('01',4,'for 的最后一次增量','保留 i、循环体 temp 和累计 sum 的完整历史。',main(`        int sum = 0; /*@sum*/
        for (int i = 1; /*?i:i <= 3*/; i++) {
            int temp = i * 2; /*@temp*/
            sum += temp; /*@sum*/
        }
        System.out.println(sum);`),[m([V('sum','sum',0,2,6,12),S('loop',[V('i','i',1,2,3,4),V('temp','temp',2,4,6)])])],[],['12'],{sum:W('sum','sum'),i:W('i','i'),temp:W('temp','temp')},'最后一次 i++ 使 i 变成 4；条件失败后退出，temp 按同一声明位置合并历史。'),
P('01',5,'while 与 break','不要在 break 后继续执行循环。',main(`        int n = 6; /*@n*/
        int count = 0; /*@count*/
        while (n > 0) {
            n -= 2; /*@n*/
            count++; /*@count*/
            if (n == 2) break;
        }
        System.out.println(n + ":" + count);`),[m([V('n','n',6,4,2),V('count','count',0,1,2)])],[],['2:2'],{n:W('n','n'),count:W('count','count')},'第二次迭代在 n=2 时 break，n 不会继续减至 0。'),
P('02',1,'数组引用与元素更新','一个数组，两个别名；区分变量更新与元素更新。',main(`        int[] a = {2, 5}; /*@a*/ /*@a0*/ /*@a1*/
        int[] b = a; /*@b*/
        b[0] += a[1]; /*@a0*/
        System.out.println(a[0]);`),[m([V('a','a','0x100'),V('b','b','0x100')])],[H('0x100','int[]',[V('a0','0',2,7),V('a1','1',5)])],['7'],{a:W('a','a'),b:W('b','b'),a0:W('a[0]','a0'),a1:W('a[1]','a1')},'b[0] 和 a[0] 是同一个元素；没有创建第二个数组。'),
P('02',2,'ArrayList 的 add 与 set','记录逻辑元素，不展开 Java 库内部数组。',main(`        java.util.ArrayList<Integer> list = new java.util.ArrayList<>(); /*@list*/
        list.add(3); /*@e0*/
        list.add(8); /*@e1*/
        int old = list.set(0, list.get(1) - 2); /*@old*/ /*@e0*/
        System.out.println(list);
        System.out.println(old);`),[m([V('list','list','0x100'),V('old','old',3)])],[H('0x100','ArrayList<Integer>',[V('e0','0',3,6),V('e1','1',8)])],['[6, 8]','3'],{list:W('list','list'),e0:W('list.get(0)','e0'),e1:W('list.get(1)','e1'),old:W('old','old')},'set 返回被替换的旧值 3；下标 0 的历史为 3 → 6。'),
P('02',3,'HashMap 同键覆盖','使用明确的键访问，不能假设 HashMap 的遍历顺序。',main(`        java.util.HashMap<String, Integer> map = new java.util.HashMap<>(); /*@map*/
        map.put("red", 2); /*@red*/
        map.put("blue", 5); /*@blue*/
        int old = map.put("red", map.get("blue") + 1); /*@old*/ /*@red*/
        System.out.println(map.get("red") + ":" + old);`),[m([V('map','map','0x100'),V('old','old',2)])],[H('0x100','HashMap<String, Integer>',[V('red','"red"',2,6),V('blue','"blue"',5)])],['6:2'],{map:W('map','map'),red:W('map.get("red")','red'),blue:W('map.get("blue")','blue'),old:W('old','old')},'同一键对应一行历史；本题不打印或遍历整个 map，输出顺序确定。'),
P('02',4,'参数重新绑定与原数组修改','引用按值传递；方法内重新绑定参数不改变调用者变量。',`    static void edit(int[] p) { /*@p*/
        p[1] = 9; /*@h1*/
        p = new int[]{4}; /*@p*/ /*@h2*/
    }
${main(`        int[] data = {1, 2}; /*@data*/ /*@h0*/ /*@h1initial*/
        edit(data);
        System.out.println(data[1]);`)}`,[m([V('data','data','0x100')]),F('edit','edit',[V('p','p','0x100','0x101')])],[H('0x100','int[]',[V('h0','0',1),V('h1','1',2,9)]),H('0x101','int[]',[V('h2','0',4)])],['9'],{data:W('data','data'),p:W('p','p'),h0:W('data[0]','h0'),h1initial:W('data[1]',at('h1',0)),h1:W('p[1]',at('h1',1)),h2:W('p[0]','h2')},'第一个数组的元素被改为 9；p 随后改指第二个数组，data 仍指第一个。'),
P('02',5,'读取固定 CSV 文件','输入文件随题目提供；记录字符串数组与解析结果。',main(`        String text = java.nio.file.Files.readString(java.nio.file.Path.of("P0205.csv")).trim(); /*@text*/
        String[] fields = text.split(","); /*@fields*/ /*@f0*/ /*@f1*/ /*@f2*/
        int quantity = Integer.parseInt(fields[1]); /*@q*/
        int price = Integer.parseInt(fields[2]); /*@p*/
        int total = quantity * price; /*@total*/
        System.out.println(fields[0] + ":" + total);`),[m([V('text','text','"pen,4,6"'),V('fields','fields','0x100'),V('q','quantity',4),V('p','price',6),V('total','total',24)])],[A('0x100','String[]','f',['"pen"','"4"','"6"'])],['pen:24'],{text:W('text','text'),fields:W('fields','fields'),f0:W('fields[0]','f0'),f1:W('fields[1]','f1'),f2:W('fields[2]','f2'),q:W('quantity','q'),p:W('price','p'),total:W('total','total')},'输入文件只有一行 pen,4,6。split 产生一个 String[]；字符串与 Integer 按课程简化直接表示。',{files:{'P0205.csv':'pen,4,6\n'}})
];
