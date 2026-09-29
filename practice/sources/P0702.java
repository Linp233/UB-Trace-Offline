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
