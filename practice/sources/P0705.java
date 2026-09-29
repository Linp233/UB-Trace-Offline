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
