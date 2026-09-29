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
