public class P0105 {
    public static void main(String[] args) throws Exception {
        int n = 6;
        int count = 0;
        while (n > 0) {
            n -= 2;
            count++;
            if (n == 2) break;
        }
        System.out.println(n + ":" + count);
    }
}
