public class P0701 {
    static int clip(int x) {
        if (x < 0) return 0;
        if (x > 10) return 10;
        return x;
    }
    public static void main(String[] args) throws Exception {
        int a = clip(-2);
        int b = clip(6);
        int c = clip(12);
        boolean passed = a == 0 && b == 6 && c == 10;
        System.out.println(passed);
    }
}
