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
