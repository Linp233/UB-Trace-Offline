public class P1004 {
    public static void main(String[] args) throws Exception {
        int n = 3;
        int count = 0;
        for (int i = 0; i < n; i++) {
            count++;
        }
        for (int j = 0; j < n; j++) {
            count++;
        }
        System.out.println(count);
    }
}
