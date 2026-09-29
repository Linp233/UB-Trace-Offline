public class P0102 {
    static int triple(int input) {
        int out = input * 3;
        return out;
    }
    public static void main(String[] args) throws Exception {
        int a = 2;
        int b = triple(a);
        a = triple(b);
        System.out.println(a + b);
    }
}
