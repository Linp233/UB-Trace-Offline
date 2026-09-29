public class P1003 {
    public static void main(String[] args) throws Exception {
        int n = 10;
        int count = 0;
        for (int step = 1; step < n; step *= 2) {
            count++;
        }
        System.out.println(count);
    }
}
