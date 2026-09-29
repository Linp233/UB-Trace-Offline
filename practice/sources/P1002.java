public class P1002 {
    public static void main(String[] args) throws Exception {
        int n = 3;
        int count = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j <= i; j++) {
                count++;
            }
        }
        System.out.println(count);
    }
}
