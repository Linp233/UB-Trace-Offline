import fs from 'node:fs/promises';
import path from 'node:path';
import {normalizeDocument} from '../lib/document.mjs';

const root = path.resolve(import.meta.dirname, '..');
const v = (name, ...values) => ({name, values});
const sources = [
`public class Practice1 {
    public static void main(String[] args) {
        int total = 4;
        total += 3;
        System.out.println(total);
    }
}
`,
`public class Practice2 {
    static int[] createPair() {
        int[] result = {2, 8};
        return result;
    }

    public static void main(String[] args) {
        int[] numbers = createPair();
        int[] alias = numbers;
        alias[1] = 9;
        System.out.println(numbers[1]);
    }
}
`,
`public class Practice3 {
    public static void main(String[] args) {
        int sum = 0;
        for (int i = 1; i <= 3; i++) {
            sum += i;
        }
        System.out.println(sum);
    }
}
`];
const diagrams = [
  {stack:[{id:'main',name:'main',released:true,items:[v('total','4','7')]}],heap:[],io:['7']},
  {stack:[
    {id:'main',name:'main',released:true,items:[v('numbers','0x100'),v('alias','0x100')]},
    {id:'createPair',name:'createPair',released:true,returnsTo:'main.numbers',items:[v('result','0x100')]}
  ],heap:[{address:'0x100',type:'int[]',items:[v('0','2'),v('1','8','9')]}],io:['9']},
  {stack:[{id:'main',name:'main',released:true,items:[v('sum','0','1','3','6'),{released:true,scope:[v('i','1','2','3','4')]}]}],heap:[],io:['6']}
];
const titles = ['Variable updates / 变量更新','Shared references / 共享引用','Loop scope / 循环作用域'];
await fs.mkdir(path.join(root,'examples'),{recursive:true});
await fs.mkdir(path.join(root,'dist/examples'),{recursive:true});
for (let i=0; i<diagrams.length; i++) {
  const doc = {format:'ub-trace-offline/v1',title:titles[i],language:'java',code:sources[i],
    notes:'Generic demonstration at program completion. Historical values and completed scopes are retained; args is omitted. Addresses are symbolic.',diagram:diagrams[i]};
  await fs.writeFile(path.join(root,`examples/Practice${i+1}.java`),sources[i]);
  await fs.writeFile(path.join(root,`examples/practice${i+1}.source.json`),JSON.stringify(doc,null,2)+'\n');
  await fs.writeFile(path.join(root,`dist/examples/practice${i+1}.json`),JSON.stringify(normalizeDocument(doc),null,2)+'\n');
}
console.log('Generated three generic demonstration documents.');
await import('./agent-examples.mjs');
